import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

RIDE_POST = {
    "id": "post-123",
    "userId": "user-123",
    "type": "offer",
    "originLocation": "A",
    "destinationLocation": "B",
    "departureTime": "2026-05-01T08:00:00",
    "isRecurring": False,
    "createdAt": "2026-04-09T00:00:00",
    "preferredGender": None,
    "description": None,
}


@pytest.fixture(autouse=True)
def mock_supabase():
    with patch("app.api.routes.ride_posts.supabase") as mock:
        yield mock


def test_create_ride_post(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        RIDE_POST
    ]

    response = client.post(
        "/ride-posts",
        headers=auth_headers,
        json={
            "type": "offer",
            "origin_location": "A",
            "destination_location": "B",
            "departure_time": "2026-05-01T08:00:00",
            "is_recurring": False,
        },
    )

    assert response.status_code == 201
    assert response.json()["type"] == "offer"


def test_create_ride_post_unauthenticated(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    response = client.post(
        "/ride-posts",
        json={
            "type": "offer",
            "origin_location": "A",
            "destination_location": "B",
            "departure_time": "2026-05-01T08:00:00",
            "is_recurring": False,
        },
    )
    assert response.status_code == 401


def test_list_ride_posts(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.order.return_value.execute.return_value.data = [
        RIDE_POST
    ]

    response = client.get("/ride-posts")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_ride_posts_filter_by_type(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        RIDE_POST
    ]

    response = client.get("/ride-posts?type=offer")

    assert response.status_code == 200


def test_get_ride_post(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        RIDE_POST
    )

    response = client.get("/ride-posts/post-123")

    assert response.status_code == 200
    assert response.json()["id"] == "post-123"


def test_get_ride_post_not_found(client: TestClient, mock_supabase: MagicMock) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.get("/ride-posts/nonexistent")

    assert response.status_code == 404


def test_update_ride_post(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    # ownership check
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "userId": "user-123"
    }
    updated = {**RIDE_POST, "description": "updated"}
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        updated
    ]

    response = client.patch(
        "/ride-posts/post-123", headers=auth_headers, json={"description": "updated"}
    )

    assert response.status_code == 200
    assert response.json()["description"] == "updated"


def test_update_ride_post_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    # _require_owner catches all exceptions and returns 404 to avoid leaking ownership info
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "userId": "other-user"
    }

    response = client.patch(
        "/ride-posts/post-123", headers=auth_headers, json={"description": "hack"}
    )

    assert response.status_code in (403, 404)


def test_delete_ride_post(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "userId": "user-123"
    }
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = (
        []
    )

    response = client.delete("/ride-posts/post-123", headers=auth_headers)

    assert response.status_code == 204
