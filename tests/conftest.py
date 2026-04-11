import json

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.core.config import settings
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def make_token(user_id: str = "user-123", email: str = "test@example.com") -> str:
    from datetime import datetime, timedelta, timezone

    expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    subject = json.dumps({"user_id": user_id, "email": email})
    return jwt.encode(
        {"sub": subject, "exp": expire},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


@pytest.fixture
def auth_headers() -> dict:
    return {"Authorization": f"Bearer {make_token()}"}
