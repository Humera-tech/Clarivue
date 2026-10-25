
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from fastapi import HTTPException, status

from app.models.conversation import Conversation


def save_conversation(
    db: Session,
    *,
    user_id: int,
    question: str,
    answer: str,
    document_id: int | None = None,
) -> Conversation:
    """Save a question and its answer to conversation history."""
    conversation = Conversation(
        user_id=user_id,
        document_id=document_id,
        question=question,
        answer=answer,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_conversation_history(
    db: Session,
    *,
    user_id: int,
    limit: int = 20,
    offset: int = 0,
) -> list[Conversation]:
    """Return the current user's conversation history."""
    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .offset(max(0, offset))
        .limit(max(1, min(limit, 100)))
    )

    return list(db.scalars(statement).all())


def get_conversation_by_id(
    db: Session,
    *,
    conversation_id: int,
    user_id: int,
) -> Conversation:
    """Fetch a conversation belonging to the current user."""
    conversation = db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return conversation


def search_conversations(
    db: Session,
    *,
    user_id: int,
    query: str,
    limit: int = 20,
) -> list[Conversation]:
    """Search the current user's questions and answers."""
    query = query.strip()

    if not query:
        return []

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
        .limit(max(1, min(limit, 100)))
    )

    return list(db.scalars(statement).all())


def delete_conversation(
    db: Session,
    *,
    conversation_id: int,
    user_id: int,
) -> None:
    """Delete a conversation belonging to the current user."""
    conversation = get_conversation_by_id(
        db,
        conversation_id=conversation_id,
        user_id=user_id,
    )

    db.delete(conversation)
    db.commit()
