import httpx
from app.core.config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_otp_email(to: str, code: str) -> None:
    payload = {
        "sender": {
            "name": settings.brevo_sender_name,
            "email": settings.brevo_sender_email,
        },
        "to": [{"email": to}],
        "subject": "Your DiKeVoi verification code",
        "htmlContent": f"<p>Your OTP code is <strong>{code}</strong>. It expires in 10 minutes.</p>",
    }
    response = httpx.post(
        BREVO_API_URL,
        json=payload,
        headers={
            "api-key": settings.brevo_api_key,
            "Content-Type": "application/json",
        },
    )
    response.raise_for_status()
