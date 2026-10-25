
import logging
import re

from fastapi import HTTPException, status
from groq import APIConnectionError, APIStatusError, RateLimitError
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.document import Document
from app.schemas.question import (
    QuestionRequest,
    QuestionResponse,
    SourceReference,
)
from app.services.llm_service import generate_grounded_answer
from app.services.retrieval_service import retrieve_relevant_chunks

logger = logging.getLogger(__name__)

CITATION_PATTERN = re.compile(
    r"\[Source\s+(\d+)(?:,\s*Page\s+\d+)?\]",
    re.IGNORECASE,
)


def validate_citations(answer: str, source_count: int) -> str:
    """Remove citation labels that refer to nonexistent sources."""

    def replace_invalid_citation(match: re.Match) -> str:
        source_number = int(match.group(1))

        if 1 <= source_number <= source_count:
            return match.group(0)

        logger.warning(
            "Removed invalid citation label: Source %s",
            source_number,
        )
        return ""

    answer = CITATION_PATTERN = re.compile(
    r"\[Source\s+(\d+)(?:,\s*Page\s+\d+)?\]",
    re.IGNORECASE,
)
    answer = re.sub(r"[ \t]{2,}", " ", answer)
    answer = re.sub(r" +([.,;:!?])", r"\1", answer)

    return answer.strip()


def _save_conversation(
    db: Session,
    *,
    user_id: int,
    document_id: int,
    question: str,
    answer: str,
) -> None:
    try:
        db.add(
            Conversation(
                user_id=user_id,
                document_id=document_id,
                question=question,
                answer=answer,
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Could not save conversation history.")


def answer_document_question(
    db: Session,
    *,
    user_id: int,
    request: QuestionRequest,
) -> QuestionResponse:
    """Answer a document question using retrieved document evidence."""

    document = (
        db.query(Document)
        .filter(
            Document.id == request.document_id,
            Document.user_id == user_id,
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    if document.status != "processed":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="This document has not been processed for question answering.",
        )

    try:
        matches = retrieve_relevant_chunks(
            document_id=document.id,
            question=request.question,
            top_k=request.top_k,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Document evidence retrieval failed.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not retrieve document evidence.",
        ) from exc

    if not matches:
        fallback_answer = (
            "I couldn't find sufficiently relevant evidence in this document "
            "to answer your question."
        )

        _save_conversation(
            db,
            user_id=user_id,
            document_id=document.id,
            question=request.question,
            answer=fallback_answer,
        )

        return QuestionResponse(
            question=request.question,
            answer=fallback_answer,
            sources=[],
        )

    sources = [
        SourceReference(
            document_id=match["document_id"],
            chunk_id=match["chunk_id"],
            page_number=match["page_number"],
            text=match["text"],
        )
        for match in matches
    ]

    context = "\n\n".join(
        f"[Source {i}, Page {source.page_number}]\n{source.text}"
        for i, source in enumerate(sources, start=1)
    )

    try:
        answer = generate_grounded_answer(
            question=request.question,
            context=context,
        )

        answer = validate_citations(
            answer=answer,
            source_count=len(sources),
        )

        if not answer:
            answer = (
                "I couldn't generate a reliable answer from the available "
                "document evidence. Please try rephrasing your question."
            )

    except RateLimitError as exc:
        logger.warning("Groq API rate limit reached.")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI usage limit reached. Please try again later.",
        ) from exc

    except APIConnectionError as exc:
        logger.exception("Could not connect to Groq.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI service is temporarily unavailable. Please try again.",
        ) from exc

    except APIStatusError as exc:
        logger.exception("Groq returned an API error.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI service could not generate an answer.",
        ) from exc

    except RuntimeError as exc:
        logger.error("AI answer generation error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI service is not configured correctly or returned an invalid response.",
        ) from exc

    except Exception as exc:
        logger.exception("Unexpected AI answer generation failure.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not generate an answer. Please try again.",
        ) from exc

    _save_conversation(
        db,
        user_id=user_id,
        document_id=document.id,
        question=request.question,
        answer=answer,
    )

    return QuestionResponse(
        question=request.question,
        answer=answer,
        sources=sources,
    )
