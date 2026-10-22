
import resend

from app.core.config import settings


def send_password_reset_email(
    recipient_email: str,
    reset_url: str,
) -> None:
    if not settings.RESEND_API_KEY:
        raise RuntimeError("Resend API key is not configured.")

    if not settings.SMTP_FROM_EMAIL:
        raise RuntimeError("Sender email is not configured.")

    resend.api_key = settings.RESEND_API_KEY

    resend.Emails.send(
        {
            "from": settings.SMTP_FROM_EMAIL,
            "to": [recipient_email],
            "subject": "Reset your Clarivue password",
            "html": f"""
                <div style="font-family:Arial,sans-serif;
                            max-width:560px;margin:auto;color:#20282d">
                    <h1 style="font-family:Georgia,serif">
                        Reset your Clarivue password
                    </h1>
                    <p>We received a request to reset your password.</p>
                    <p>
                        <a href="{reset_url}"
                           style="display:inline-block;padding:12px 22px;
                                  background:#D49A7E;color:#1A0F0A;
                                  text-decoration:none;border-radius:24px">
                            Reset password
                        </a>
                    </p>
                    <p>This link expires in
                       {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
                    <p>If you did not request this, you can ignore this email.</p>
                </div>
            """,
        }
    )
