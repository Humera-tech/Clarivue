
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk


def get_dashboard_statistics(
    db: Session,
    *,
    user_id: int,
) -> dict:
    """Return document and ingestion statistics for one user."""

    total_documents = db.scalar(
        select(func.count())
        .select_from(Document)
        .where(Document.user_id == user_id)
    ) or 0

    processed_documents = db.scalar(
        select(func.count())
        .select_from(Document)
        .where(
            Document.user_id == user_id,
            Document.status == "processed",
        )
    ) or 0

    processing_documents = db.scalar(
        select(func.count())
        .select_from(Document)
        .where(
            Document.user_id == user_id,
            Document.status == "processing",
        )
    ) or 0

    failed_documents = db.scalar(
        select(func.count())
        .select_from(Document)
        .where(
            Document.user_id == user_id,
            Document.status == "failed",
        )
    ) or 0

    total_chunks = db.scalar(
        select(func.count())
        .select_from(DocumentChunk)
        .join(
            Document,
            Document.id == DocumentChunk.document_id,
        )
        .where(
            Document.user_id == user_id,
            Document.status == "processed",
        )
    ) or 0

    recent_cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    recent_uploads = db.scalar(
        select(func.count())
        .select_from(Document)
        .where(
            Document.user_id == user_id,
            Document.created_at >= recent_cutoff,
        )
    ) or 0

    return {
        "total_documents": total_documents,
        "processed_documents": processed_documents,
        "processing_documents": processing_documents,
        "failed_documents": failed_documents,
        "total_chunks": total_chunks,
        "recent_uploads_last_7_days": recent_uploads,
    }
