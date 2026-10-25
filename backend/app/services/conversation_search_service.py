
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.conversation import Conversation


def search_conversations(
    db: Session,
    *,
    user_id: int,
    query: str,
    limit: int = 20,
) -> list[Conversation]:
    query = query.strip()

    if not query:
        return []

    limit = max(1, min(limit, 100))
    search_pattern = f"%{query}%"

    statement = (
        select(Conversation)
        .where(
            Conversation.user_id == user_id,
            or_(
                Conversation.question.ilike(search_pattern),
                Conversation.answer.ilike(search_pattern),
            ),
        )
        .order_by(Conversation.created_at.desc())
        .limit(limit)
    )

    return list(db.scalars(statement).all())
