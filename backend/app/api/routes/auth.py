import uuid
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any, cast

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from pydantic import BaseModel, EmailStr

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.email import send_otp_email
from app.core.supabase import supabase

router = APIRouter(prefix="/auth", tags=["auth"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


# --- Schemas ---


class SignUpRequest(BaseModel):
    email: EmailStr
    display_name: str | None = None
    gender: str | None = None
    photo_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = settings.jwt_expire_minutes * 60


class SendOtpRequest(BaseModel):
    email: EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


class GoogleSignInRequest(BaseModel):
    email: EmailStr
    display_name: str
    photo_url: str | None = None


# --- Helpers ---


def _create_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode(
        {"sub": subject, "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def _generate_otp() -> str:
    return f"{secrets.randbelow(1000000):06d}"


def _get_user_by_email(email: str) -> dict | None:
    result = (
        supabase.table("User")
        .select("id, email, authProvider, isVerified, displayName, photoUrl, gender")
        .eq("email", email)
        .single()
        .execute()
    )
    return result.data


def _create_user(
    email: str,
    auth_provider: str,
    display_name: str | None = None,
    photo_url: str | None = None,
    gender: str | None = None,
    is_verified: bool = False,  # <-- Thêm tham số này
) -> dict:
    result = (
        supabase.table("User")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "email": email,
                "authProvider": auth_provider,
                "isVerified": is_verified,  # <-- Cập nhật ở đây
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "displayName": display_name,
                "photoUrl": photo_url,
                "gender": gender,
            }
        )
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )
    return result.data[0]


def _ensure_user(
    email: str,
    auth_provider: str,
    display_name: str | None = None,
    photo_url: str | None = None,
    gender: str | None = None,
    is_verified: bool = False,
) -> dict:
    existing = _get_user_by_email(email)
    if existing:
        updates: dict[str, Any] = {}
        if display_name is not None:
            updates["displayName"] = display_name
        if photo_url is not None:
            updates["photoUrl"] = photo_url
        if gender is not None:
            updates["gender"] = gender
        if auth_provider == "google" and existing.get("authProvider") != "google":
            updates["authProvider"] = "google"

        if is_verified and not existing.get("isVerified"):
            updates["isVerified"] = True

        if updates:
            _update_user_by_email(email, updates)
        return existing

    return _create_user(
        email, auth_provider, display_name, photo_url, gender, is_verified
    )


def _update_user_by_email(email: str, update_data: dict) -> None:
    if not update_data:
        return
    supabase.table("User").update(update_data).eq("email", email).execute()


# --- Routes ---


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def sign_up(body: SignUpRequest) -> dict:
    existing = supabase.table("User").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    result = (
        supabase.table("User")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "email": body.email,
                "authProvider": "email",
                "isVerified": False,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "displayName": body.display_name,
                "photoUrl": body.photo_url,
                "gender": body.gender,
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )

    return {"message": "User registered successfully"}


@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(body: SendOtpRequest) -> dict:
    # Invalidate all previous unused OTPs for this email
    supabase.table("OtpCode").update({"used": True}).eq("email", body.email).eq(
        "used", False
    ).execute()

    code = _generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.otp_expire_minutes
    )

    result = (
        supabase.table("OtpCode")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "email": body.email,
                "code": code,
                "expiresAt": expires_at.isoformat(),
                "used": False,
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate OTP",
        )

    send_otp_email(to=body.email, code=code)

    return {"message": "OTP sent"}


@router.post("/otp-verify", response_model=TokenResponse)
def otp_verify(body: OtpVerifyRequest) -> TokenResponse:
    now = datetime.now(timezone.utc).isoformat()

    otp_result = (
        supabase.table("OtpCode")
        .select("id")
        .eq("email", body.email)
        .eq("code", body.otp)
        .eq("used", False)
        .gt("expiresAt", now)
        .limit(1)
        .execute()
    )

    if not otp_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    otp_id = otp_result.data[0]["id"]
    supabase.table("OtpCode").update({"used": True}).eq("id", otp_id).execute()

    user = _ensure_user(email=body.email, auth_provider="email", is_verified=True)

    return TokenResponse(
        access_token=_create_token(
            json.dumps({"user_id": user["id"], "email": user["email"]})
        )
    )


@router.post("/google", response_model=TokenResponse)
def sign_in_with_google(body: GoogleSignInRequest) -> TokenResponse:
    user = _ensure_user(
        email=body.email,
        auth_provider="google",
        display_name=body.display_name,
        photo_url=body.photo_url,
    )

    return TokenResponse(
        access_token=_create_token(
            json.dumps({"user_id": user["id"], "email": user["email"]})
        )
    )


class UpdateProfileRequest(BaseModel):
    display_name: str | None = None
    gender: str | None = None
    photo_url: str | None = None


@router.patch("/me")
def update_me(body: UpdateProfileRequest, current_user: CurrentUser) -> dict:
    updates: dict = {}
    if body.display_name is not None:
        updates["displayName"] = body.display_name
    if body.gender is not None:
        updates["gender"] = body.gender
    if body.photo_url is not None:
        updates["photoUrl"] = body.photo_url

    if updates:
        supabase.table("User").update(updates).eq(
            "id", current_user["user_id"]
        ).execute()

    result = (
        supabase.table("User")
        .select(
            "id, email, authProvider, isVerified, displayName, photoUrl, gender, createdAt"
        )
        .eq("id", current_user["user_id"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return cast(dict, result.data)


@router.get("/me")
def get_me(current_user: CurrentUser) -> dict:
    result = (
        supabase.table("User")
        .select(
            "id, email, authProvider, isVerified, displayName, photoUrl, gender, createdAt"
        )
        .eq("id", current_user["user_id"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return cast(dict, result.data)
