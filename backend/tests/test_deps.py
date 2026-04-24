import json
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings
from app.main import app

client = TestClient(app)


def _make_raw_token(payload: dict) -> str:
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def test_invalid_token_rejected() -> None:
    response = client.get("/rides", headers={"Authorization": "Bearer not-a-token"})
    assert response.status_code == 401


def test_expired_token_rejected() -> None:
    expired = datetime.now(timezone.utc) - timedelta(minutes=1)
    subject = json.dumps({"user_id": "u1", "email": "u@example.com"})
    token = _make_raw_token({"sub": subject, "exp": expired})

    with patch("app.api.routes.rides.supabase"):
        response = client.get("/rides", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_malformed_subject_rejected() -> None:
    expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    token = _make_raw_token({"sub": "not-json", "exp": expire})

    with patch("app.api.routes.rides.supabase"):
        response = client.get("/rides", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_missing_sub_claim_rejected() -> None:
    expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    token = _make_raw_token({"exp": expire})

    with patch("app.api.routes.rides.supabase"):
        response = client.get("/rides", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
