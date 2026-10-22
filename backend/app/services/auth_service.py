
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User


def signup_user(db: Session, email: str, password: str) -> User:
    normalized_email = email.strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user:
        raise ValueError("An account with this email already exists.")

    user = User(
        email=normalized_email,
        hashed_password=hash_password(password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    normalized_email = email.strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    if not user.is_active:
        return None

    return user


def create_user_token(user: User) -> str:
    return create_access_token(user.id)
