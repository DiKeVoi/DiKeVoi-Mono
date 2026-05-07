import uuid
import json
from datetime import datetime, timedelta, timezone
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from pydantic import BaseModel, EmailStr

from app.api.deps import get_current_user
from app.core.config import settings
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


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


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


@router.post("/otp-verify", response_model=TokenResponse)
def otp_verify(body: OtpVerifyRequest) -> TokenResponse:
    if body.otp != "1234":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP",
        )
    result = (
        supabase.table("User").select("id, email").eq("email", body.email).execute()
    )
    print("Result:", result)
    if not result.data:
        request = (
            supabase.table("User")
            .insert(
                {
                    "id": str(uuid.uuid4()),
                    "email": body.email,
                    "authProvider": "email",
                    "isVerified": True,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                    "displayName": None,
                    "photoUrl": None,
                    "gender": None,
                }
            )
            .execute()
        )
        created_users = request.data or []
        if not created_users:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user",
            )
        created_user = cast(dict, created_users[0])
        return TokenResponse(
            access_token=_create_token(
                json.dumps(
                    {"user_id": created_user["id"], "email": created_user["email"]}
                )
            )
        )
    user = cast(dict, result.data[0]) if result.data else None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
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
