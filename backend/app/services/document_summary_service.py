
import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.services.llm_service import generate_grounded_answer

logger = logging.getLogger(__name__)

MAX_SUMMARY_CHARS = 18000


def summarize_document(
    db: Session,
    *,
    document_id: int,
    user_id: int,
) -> dict:
    """Generate a summary using only the user's processed document."""

    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == user_id,
        )
    )

    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    if document.status != "processed":
        raise HTTPException(
            status_code=422,
            detail="Document must be processed before summarization.",
        )

    text = document.extracted_text or ""

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="The document contains no extracted text.",
        )

    truncated = len(text) > MAX_SUMMARY_CHARS
    context = f"[Source 1: {document.filename}]\n{text[:MAX_SUMMARY_CHARS]}"

    question = (
        "Summarize the supplied document using only its contents. "
        "Include the main purpose, key findings, important facts, and "
        "conclusions. Use clear headings and concise language. "
        "Cite factual claims using [Source 1]. Do not invent information. "
        "If the document does not support a claim, omit it."
    )

    try:
        summary = generate_grounded_answer(
            question=question,
            context=context,
        )
    except Exception as exc:
        logger.exception(
            "Summary generation failed for document %s.",
            document_id,
        )
        raise HTTPException(
            status_code=502,
            detail="Could not generate the document summary.",
        ) from exc

    return {
        "document_id": document.id,
        "filename": document.filename,
        "summary": summary,
        "characters_analyzed": min(len(text), MAX_SUMMARY_CHARS),
        "truncated": truncated,
    }
