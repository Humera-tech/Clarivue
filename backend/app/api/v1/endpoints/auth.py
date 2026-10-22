
from datetime import datetime, timezone
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import hash_password
from app.db.session import get_db
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserResponse
from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.services.auth_service import (
    authenticate_user,
    create_user_token,
    signup_user,
)
from app.services.email_service import send_password_reset_email
from app.services.password_reset_service import (
    generate_reset_token,
    get_reset_expiry,
    get_user_by_email,
    hash_reset_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    try:
        user = signup_user(db, str(data.email), data.password)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    return AuthResponse(
        access_token=create_user_token(user),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, str(data.email), data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthResponse(
        access_token=create_user_token(user),
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    message = (
        "If an account exists for this email, "
        "password reset instructions will be sent."
    )

    user = get_user_by_email(db, str(data.email))

    # Return the same response whether or not the account exists.
    if not user or not user.is_active:
        return ForgotPasswordResponse(message=message)

    raw_token = generate_reset_token()

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_reset_token(raw_token),
        expires_at=get_reset_expiry(),
    )

    try:
        # Store the token before sending the email.
        db.add(reset_record)
        db.commit()

        query = urlencode({"token": raw_token})
        reset_url = (
            f"{settings.FRONTEND_URL.rstrip('/')}"
            f"/reset-password?{query}"
        )

        send_password_reset_email(str(user.email), reset_url)

    except Exception:
        db.rollback()
        # Keep implementation details and secrets out of API responses.
        raise HTTPException(
            status_code=503,
            detail="Unable to send reset instructions right now. Please try again.",
        )

    return ForgotPasswordResponse(message=message)


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_reset_token(data.token)

    reset_record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
        )
        .first()
    )

    if not reset_record:
        raise HTTPException(
            status_code=400,
            detail="This reset link is invalid or has already been used.",
        )

    expiry = reset_record.expires_at
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if expiry <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="This reset link has expired. Please request a new one.",
        )

    user = db.query(User).filter(User.id == reset_record.user_id).first()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="This reset link is invalid or has expired.",
        )

    user.hashed_password = hash_password(data.new_password)
    reset_record.used_at = datetime.now(timezone.utc)

    # Invalidate any other outstanding reset links for this user.
    (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.id != reset_record.id,
            PasswordResetToken.used_at.is_(None),
        )
        .update(
            {PasswordResetToken.used_at: datetime.now(timezone.utc)},
            synchronize_session=False,
        )
    )

    db.commit()

    return ResetPasswordResponse(
        message="Your password has been reset successfully. You can now log in."
    )
