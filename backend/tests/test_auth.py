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
        json={"email": "newuser@example.com"},
    )

    assert response.status_code == 201
    assert response.json() == {"message": "User registered successfully"}


def test_signup_duplicate_email(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"id": "existing"}
    ]

    response = client.post(
        "/auth/signup",
        json={"email": "existing@example.com"},
    )

    assert response.status_code == 409
    assert "already registered" in response.json()["detail"]


def test_signup_invalid_email(client: TestClient, mock_supabase: MagicMock) -> None:
    response = client.post(
        "/auth/signup",
        json={"email": "not-an-email"},
    )
    assert response.status_code == 422


def test_signup_db_failure(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = (
        []
    )
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = []

    response = client.post(
        "/auth/signup",
        json={"email": "newuser@example.com"},
    )

    assert response.status_code == 500


def test_signup_with_optional_fields(
    client: TestClient, mock_supabase: MagicMock
) -> None:
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
            "display_name": "Test User",
            "gender": "male",
            "photo_url": "http://example.com/photo.jpg",
        },
    )

    assert response.status_code == 201


def test_otp_verify_success(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"id": "user-123", "email": "user@example.com"}
    ]

    response = client.post(
        "/auth/otp-verify",
        json={"email": "user@example.com", "otp": "1234"},
    )

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_otp_verify_invalid_otp(client: TestClient, mock_supabase: MagicMock) -> None:
    response = client.post(
        "/auth/otp-verify",
        json={"email": "user@example.com", "otp": "0000"},
    )
    assert response.status_code == 400


def test_otp_verify_creates_user_when_not_found(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = (
        []
    )
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "new-id", "email": "ghost@example.com"}
    ]

    response = client.post(
        "/auth/otp-verify",
        json={"email": "ghost@example.com", "otp": "1234"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
