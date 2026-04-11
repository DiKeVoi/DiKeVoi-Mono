import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

NOTIFICATION = {
    "id": "notif-123",
    "userId": "user-123",
    "title": "Hello",
    "body": "You have a new ride match",
    "isRead": False,
    "createdAt": "2026-04-09T00:00:00",
}


@pytest.fixture(autouse=True)
def mock_supabase():
    with patch("app.api.routes.notification.supabase") as mock:
        yield mock


def test_create_notification(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        NOTIFICATION
    ]

    response = client.post(
        "/notifications",
        headers=auth_headers,
        json={
            "title": "Hello",
            "body": "You have a new ride match",
        },
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Hello"


def test_create_notification_unauthenticated(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    response = client.post("/notifications", json={"title": "Hello"})
    assert response.status_code == 401


def test_list_notifications(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        NOTIFICATION
    ]

    response = client.get("/notifications", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_unread_count(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [
        NOTIFICATION,
        NOTIFICATION,
    ]

    response = client.get("/notifications/unread-count", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["count"] == 2


def test_get_notification(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        NOTIFICATION
    )

    response = client.get("/notifications/notif-123", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == "notif-123"


def test_get_notification_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    other = {**NOTIFICATION, "userId": "other-user"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        other
    )

    response = client.get("/notifications/notif-123", headers=auth_headers)

    assert response.status_code == 403


def test_mark_all_read(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = (
        []
    )

    response = client.patch("/notifications/mark-all-read", headers=auth_headers)

    assert response.status_code == 204


def test_update_notification(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        NOTIFICATION
    )
    updated = {**NOTIFICATION, "isRead": True}
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        updated
    ]

    response = client.patch(
        "/notifications/notif-123", headers=auth_headers, json={"is_read": True}
    )

    assert response.status_code == 200
    assert response.json()["isRead"] is True


def test_delete_notification(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        NOTIFICATION
    )
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = (
        []
    )

    response = client.delete("/notifications/notif-123", headers=auth_headers)

    assert response.status_code == 204
