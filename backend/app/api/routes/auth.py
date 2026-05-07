import uuid
import json
from datetime import datetime, timedelta, timezone
from typing import Annotated, cast

import bcrypt as _bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from pydantic import BaseModel, EmailStr, field_validator

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.supabase import supabase

router = APIRouter(prefix="/auth", tags=["auth"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


def _hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


# --- Schemas ---


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None
    gender: str | None = None
    photo_url: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = settings.jwt_expire_minutes * 60


# --- Helpers ---


def _create_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode(
        {"sub": subject, "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


# --- Routes ---


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def sign_up(body: SignUpRequest) -> dict:
    # Check for existing email
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
                "password": _hash_password(body.password),
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


@router.post("/token", response_model=TokenResponse, include_in_schema=False)
def token(form: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    """OAuth2 form endpoint used by Swagger UI Authorize dialog."""
    return sign_in(SignInRequest(email=form.username, password=form.password))


@router.post("/signin", response_model=TokenResponse)
def sign_in(body: SignInRequest) -> TokenResponse:
    result = (
        supabase.table("User")
        .select("id, email, password")
        .eq("email", body.email)
        .single()
        .execute()
    )

    user = cast(dict, result.data)
    if not user or not _verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return TokenResponse(
        access_token=_create_token(
            json.dumps({"user_id": user["id"], "email": user["email"]})
        )
    )


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


@router.post("/otp-verify", response_model=TokenResponse)
def otp_verify(body: OtpVerifyRequest) -> TokenResponse:
    if body.otp != "1234":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP",
        )
    result = (
        supabase.table("User")
        .select("id, email")
        .eq("email", body.email)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    user = cast(dict, result.data)
    return TokenResponse(
        access_token=_create_token(
            json.dumps({"user_id": user["id"], "email": user["email"]})
        )
    )


@router.get("/me")
def get_me(current_user: CurrentUser) -> dict:
    result = (
        supabase.table("User")
        .select(
            "id, email, authProvider, isVerified, displayName, photoUrl, gender, createdAt, updatedAt"
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
