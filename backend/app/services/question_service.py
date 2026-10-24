
import logging

from fastapi import HTTPException, status
from groq import APIConnectionError, APIStatusError, RateLimitError
from sqlalchemy.orm import Session

from app.models.document import Document
from app.rag.vector_store import search_chunks
from app.schemas.question import (
    QuestionRequest,
    QuestionResponse,
    SourceReference,
)
from app.services.llm_service import generate_grounded_answer

logger = logging.getLogger(__name__)


def answer_document_question(
    db: Session,
    *,
    user_id: int,
    request: QuestionRequest,
) -> QuestionResponse:
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
        matches = search_chunks(
            query=request.question,
            document_id=document.id,
            top_k=request.top_k,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Document evidence retrieval failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve document evidence.",
        ) from exc

    if not matches:
        return QuestionResponse(
            question=request.question,
            answer="I couldn't find relevant evidence in this document.",
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
        logger.error("AI answer generation configuration or response error: %s", exc)
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

    return QuestionResponse(
        question=request.question,
        answer=answer,
        sources=sources,
    )
