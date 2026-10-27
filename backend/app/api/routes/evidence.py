
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.user import User
from app.schemas.evidence import EvidenceItem, EvidenceResponse

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get("/", response_model=EvidenceResponse)
def get_evidence(
    search: str | None = Query(default=None, max_length=500),
    document_id: int | None = Query(default=None, ge=1),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceResponse:
    query = (
        select(DocumentChunk, Document.filename)
        .join(Document, Document.id == DocumentChunk.document_id)
        .where(
            Document.user_id == current_user.id,
            Document.status == "processed",
        )
    )

    if document_id is not None:
        query = query.where(Document.id == document_id)

    if search and search.strip():
        query = query.where(
            DocumentChunk.text.ilike(f"%{search.strip()}%")
        )

    count_query = (
        select(func.count(DocumentChunk.id))
        .join(Document, Document.id == DocumentChunk.document_id)
        .where(
            Document.user_id == current_user.id,
            Document.status == "processed",
        )
    )

    document_count_query = (
        select(func.count(func.distinct(Document.id)))
        .select_from(DocumentChunk)
        .join(Document, Document.id == DocumentChunk.document_id)
        .where(
            Document.user_id == current_user.id,
            Document.status == "processed",
        )
    )

    if document_id is not None:
        count_query = count_query.where(Document.id == document_id)
        document_count_query = document_count_query.where(
            Document.id == document_id
        )

    if search and search.strip():
        search_filter = DocumentChunk.text.ilike(
            f"%{search.strip()}%"
        )
        count_query = count_query.where(search_filter)
        document_count_query = document_count_query.where(search_filter)

    total_evidence = db.scalar(count_query) or 0
    total_documents = db.scalar(document_count_query) or 0

    rows = db.execute(
        query
        .order_by(DocumentChunk.created_at.desc(), DocumentChunk.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    evidence = [
        EvidenceItem(
            id=chunk.id,
            document_id=chunk.document_id,
            document_name=filename,
            page_number=chunk.page_number,
            text=chunk.text,
            created_at=chunk.created_at,
        )
        for chunk, filename in rows
    ]

    return EvidenceResponse(
        total_evidence=total_evidence,
        total_documents=total_documents,
        evidence=evidence,
    )
