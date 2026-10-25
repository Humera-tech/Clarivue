import re

from fastapi import HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk


def search_documents(
    db: Session,
    *,
    user_id: int,
    query: str,
    limit: int = 10,
) -> list[dict]:
    """Search the current user's processed document chunks."""

    query = query.strip()

    if not query:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Search query cannot be empty.",
        )

    if len(query) > 200:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Search query cannot exceed 200 characters.",
        )

    limit = max(1, min(limit, 50))
    terms = re.findall(r"\w+", query.lower())

    if not terms:
        return []

    conditions = [
        DocumentChunk.text.ilike(f"%{term}%")
        for term in terms
    ]

    statement = (
        select(DocumentChunk, Document)
        .join(Document, Document.id == DocumentChunk.document_id)
        .where(
            Document.user_id == user_id,
            Document.status == "processed",
            or_(*conditions),
        )
        .order_by(DocumentChunk.id.desc())
        .limit(limit)
    )

    results = db.execute(statement).all()

    return [
        {
            "document_id": document.id,
            "filename": document.filename,
            "chunk_id": chunk.id,
            "page_number": chunk.page_number,
            "text": chunk.text,
        }
        for chunk, document in results
    ]