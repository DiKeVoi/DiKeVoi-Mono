import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

RIDE = {
    "id": "ride-123",
    "offerUserId": "user-123",
    "requestUserId": None,
    "originLocation": "A",
    "destinationLocation": "B",
    "departureTime": "2026-05-01T08:00:00",
    "status": "pending",
    "createdAt": "2026-04-09T00:00:00",
    "negotiatedCost": None,
    "returnTime": None,
    "isRecurring": False,
}


@pytest.fixture(autouse=True)
def mock_supabase():
    with patch("app.api.routes.rides.supabase") as mock:
        yield mock


def test_create_ride(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        RIDE
    ]

    response = client.post(
        "/rides",
        headers=auth_headers,
        json={
            "origin_location": "A",
            "destination_location": "B",
            "departure_time": "2026-05-01T08:00:00",
            "status": "pending",
        },
    )

    assert response.status_code == 201
    assert response.json()["status"] == "pending"


def test_create_ride_unauthenticated(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    response = client.post(
        "/rides",
        json={
            "origin_location": "A",
            "destination_location": "B",
            "departure_time": "2026-05-01T08:00:00",
        },
    )
    assert response.status_code == 401


def test_list_rides(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.or_.return_value.order.return_value.execute.return_value.data = [
        RIDE
    ]

    response = client.get("/rides", headers=auth_headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_rides_filter_by_status(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.or_.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        RIDE
    ]

    response = client.get("/rides?status=pending", headers=auth_headers)

    assert response.status_code == 200


def test_get_ride(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        RIDE
    )

    response = client.get("/rides/ride-123", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == "ride-123"


def test_get_ride_not_found(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.get("/rides/nonexistent", headers=auth_headers)

    assert response.status_code == 404


def test_get_ride_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    other_ride = {**RIDE, "offerUserId": "other-user", "requestUserId": "another-user"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        other_ride
    )

    response = client.get("/rides/ride-123", headers=auth_headers)

    assert response.status_code == 403


def test_update_ride(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        RIDE
    )
    updated = {**RIDE, "status": "confirmed"}
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        updated
    ]

    response = client.patch(
        "/rides/ride-123", headers=auth_headers, json={"status": "confirmed"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


def test_update_ride_no_fields(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        RIDE
    )

    response = client.patch("/rides/ride-123", headers=auth_headers, json={})

    assert response.status_code == 422


def test_delete_ride(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        RIDE
    )
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = (
        []
    )

    response = client.delete("/rides/ride-123", headers=auth_headers)

    assert response.status_code == 204


def test_create_ride_db_failure(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = []

    response = client.post(
        "/rides",
        headers=auth_headers,
        json={
            "origin_location": "A",
            "destination_location": "B",
            "departure_time": "2026-05-01T08:00:00",
        },
    )

    assert response.status_code == 500


def test_create_ride_defaults_offer_user_id(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    ride_with_offer = {**RIDE, "offerUserId": "user-123"}
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        ride_with_offer
    ]

    response = client.post(
        "/rides",
        headers=auth_headers,
        json={
            "origin_location": "A",
            "destination_location": "B",
            "departure_time": "2026-05-01T08:00:00",
        },
    )

    assert response.status_code == 201
    assert response.json()["offerUserId"] == "user-123"


def test_create_ride_with_explicit_users(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    ride_with_both = {**RIDE, "offerUserId": "driver-1", "requestUserId": "user-123"}
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        ride_with_both
    ]

    response = client.post(
        "/rides",
        headers=auth_headers,
        json={
            "offer_user_id": "driver-1",
            "request_user_id": "user-123",
            "origin_location": "A",
            "destination_location": "B",
            "departure_time": "2026-05-01T08:00:00",
        },
    )

    assert response.status_code == 201


def test_update_ride_not_found(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.patch(
        "/rides/nonexistent", headers=auth_headers, json={"status": "confirmed"}
    )

    assert response.status_code == 404


def test_update_ride_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    other_ride = {**RIDE, "offerUserId": "other-user", "requestUserId": "another-user"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        other_ride
    )

    response = client.patch(
        "/rides/ride-123", headers=auth_headers, json={"status": "confirmed"}
    )

    assert response.status_code == 403


def test_delete_ride_not_found(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.delete("/rides/nonexistent", headers=auth_headers)

    assert response.status_code == 404


def test_delete_ride_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    other_ride = {**RIDE, "offerUserId": "other-user", "requestUserId": "another-user"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        other_ride
    )

    response = client.delete("/rides/ride-123", headers=auth_headers)

    assert response.status_code == 403
