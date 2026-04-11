import bcrypt
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_supabase():
    with patch("app.api.routes.auth.supabase") as mock:
        yield mock


def test_signup_success(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = (
        []
    )
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "new-id"}
    ]

    response = client.post(
        "/auth/signup",
        json={
            "email": "newuser@example.com",
            "password": "securepass",
        },
    )

    assert response.status_code == 201
    assert response.json() == {"message": "User registered successfully"}


def test_signup_duplicate_email(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"id": "existing"}
    ]

    response = client.post(
        "/auth/signup",
        json={
            "email": "existing@example.com",
            "password": "securepass",
        },
    )

    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


def test_signup_short_password(client: TestClient, mock_supabase: MagicMock) -> None:
    response = client.post(
        "/auth/signup",
        json={
            "email": "user@example.com",
            "password": "short",
        },
    )
    assert response.status_code == 422


def test_signup_invalid_email(client: TestClient, mock_supabase: MagicMock) -> None:
    response = client.post(
        "/auth/signup",
        json={
            "email": "not-an-email",
            "password": "securepass",
        },
    )
    assert response.status_code == 422


def test_signin_success(client: TestClient, mock_supabase: MagicMock) -> None:
    hashed = bcrypt.hashpw(b"securepass", bcrypt.gensalt()).decode()
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "id": "user-123",
        "email": "user@example.com",
        "password": hashed,
    }

    response = client.post(
        "/auth/signin",
        json={
            "email": "user@example.com",
            "password": "securepass",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_signin_wrong_password(client: TestClient, mock_supabase: MagicMock) -> None:
    hashed = bcrypt.hashpw(b"correctpass", bcrypt.gensalt()).decode()
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "id": "user-123",
        "email": "user@example.com",
        "password": hashed,
    }

    response = client.post(
        "/auth/signin",
        json={
            "email": "user@example.com",
            "password": "wrongpass1",
        },
    )

    assert response.status_code == 401


def test_signin_user_not_found(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.post(
        "/auth/signin",
        json={
            "email": "ghost@example.com",
            "password": "securepass",
        },
    )

    assert response.status_code == 401
