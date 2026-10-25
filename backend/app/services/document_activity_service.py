
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document_activity import DocumentActivity


def log_document_activity(
    db: Session,
    *,
    user_id: int,
    action: str,
    document_id: int | None = None,
    details: str | None = None,
) -> DocumentActivity:
    activity = DocumentActivity(
        user_id=user_id,
        document_id=document_id,
        action=action,
        details=details,
    )
    db.add(activity)
    db.flush()
    return activity


def get_document_activity(
    db: Session,
    *,
    user_id: int,
    limit: int = 20,
    offset: int = 0,
) -> list[DocumentActivity]:
    statement = (
        select(DocumentActivity)
        .where(DocumentActivity.user_id == user_id)
        .order_by(DocumentActivity.created_at.desc())
        .offset(max(0, offset))
        .limit(max(1, min(limit, 100)))
    )
    return list(db.scalars(statement).all())
