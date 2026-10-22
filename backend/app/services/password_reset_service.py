
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User


def generate_reset_token() -> str:
    """Generate a cryptographically secure random reset token."""
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    """Hash the token before storing it."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def get_reset_expiry() -> datetime:
    """Return the token expiry time in UTC."""
    return datetime.now(timezone.utc) + timedelta(
        minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
    )


def get_user_by_email(db: Session, email: str) -> User | None:
    normalized_email = email.strip().lower()

    return (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )
