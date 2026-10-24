from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk


def create_document_chunks(
    db: Session,
    *,
    document_id: int,
    chunks: list[dict],
) -> list[DocumentChunk]:
    records = [
        DocumentChunk(
            document_id=document_id,
            page_number=chunk["page_number"],
            start_char=chunk["start_char"],
            end_char=chunk["end_char"],
            text=chunk["text"],
        )
        for chunk in chunks
    ]

    try:
        db.add_all(records)
        db.commit()

        for record in records:
            db.refresh(record)

        return records

    except Exception:
        db.rollback()
        raise


def get_document_chunks(
    db: Session,
    *,
    document_id: int,
) -> list[DocumentChunk]:
    statement = (
        select(DocumentChunk)
        .where(DocumentChunk.document_id == document_id)
        .order_by(
            DocumentChunk.page_number,
            DocumentChunk.start_char,
        )
    )

    return list(db.scalars(statement).all())