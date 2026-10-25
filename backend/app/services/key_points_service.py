
import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.services.llm_service import generate_grounded_answer

logger = logging.getLogger(__name__)

MAX_TEXT_CHARS = 18000


def extract_key_points(
    db: Session,
    *,
    document_id: int,
    user_id: int,
) -> dict:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == user_id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    if document.status != "processed":
        raise HTTPException(
            status_code=422,
            detail="Document must be processed first.",
        )

    text = document.extracted_text or ""

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="No extracted text is available.",
        )

    context = text[:MAX_TEXT_CHARS]

    question = """
Extract the 5 to 10 most important key points from the supplied document.

For each point:
- State one concise, meaningful claim.
- Explain briefly why it matters.
- Cite supporting evidence using [Source 1].
- Do not invent details or unsupported conclusions.

Use a numbered list. If fewer than five meaningful points exist,
return only those supported by the document.
"""

    try:
        key_points = generate_grounded_answer(
            question=question,
            context=f"[Source 1: {document.filename}]\n{context}",
        )
    except Exception:
        logger.exception(
            "Key-point extraction failed for document %s",
            document_id,
        )
        raise HTTPException(
            status_code=502,
            detail="Unable to extract key points right now.",
        )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "key_points": key_points,
        "characters_analyzed": len(context),
        "truncated": len(text) > MAX_TEXT_CHARS,
    }
