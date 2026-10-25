
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_activity import DocumentActivity


def get_document_version_history(
    db: Session,
    *,
    document_id: int,
    user_id: int,
    limit: int = 20,
    offset: int = 0,
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

    activities = db.scalars(
        select(DocumentActivity)
        .where(
            DocumentActivity.user_id == user_id,
            DocumentActivity.document_id == document_id,
        )
        .order_by(DocumentActivity.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "document_id": document.id,
        "filename": document.filename,
        "history": [
            {
                "id": activity.id,
                "action": activity.action,
                "details": activity.details,
                "created_at": activity.created_at,
            }
            for activity in activities
        ],
        "limit": limit,
        "offset": offset,
    }
