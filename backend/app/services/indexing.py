
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document_chunk import DocumentChunk
from app.rag.vector_store import index_chunks


def index_document_chunks(
    db: Session,
    document_id: int,
) -> int:
    chunks = db.scalars(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == document_id)
        .order_by(
            DocumentChunk.page_number,
            DocumentChunk.start_char,
        )
    ).all()

    payload = [
        {
            "id": chunk.id,
            "text": chunk.text,
            "page_number": chunk.page_number,
        }
        for chunk in chunks
    ]

    return index_chunks(
        document_id=document_id,
        chunks=payload,
    )
