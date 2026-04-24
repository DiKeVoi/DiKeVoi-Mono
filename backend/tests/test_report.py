import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

REPORT = {
    "id": "report-123",
    "reporterId": "user-123",
    "reportedUserId": "other-user",
    "rideId": "ride-123",
    "reason": "Inappropriate behaviour",
    "imageURL": None,
    "status": "pending",
    "createdAt": "2026-04-09T00:00:00",
}


@pytest.fixture(autouse=True)
def mock_supabase():
    with patch("app.api.routes.report.supabase") as mock:
        yield mock


def test_create_report(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        REPORT
    ]

    response = client.post(
        "/reports",
        headers=auth_headers,
        json={
            "reported_user_id": "other-user",
            "ride_id": "ride-123",
            "reason": "Inappropriate behaviour",
        },
    )

    assert response.status_code == 201
    assert response.json()["reason"] == "Inappropriate behaviour"
    assert response.json()["status"] == "pending"


def test_create_report_unauthenticated(
    client: TestClient, mock_supabase: MagicMock
) -> None:
    response = client.post("/reports", json={"reason": "Bad behaviour"})
    assert response.status_code == 401


def test_create_report_missing_reason(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    response = client.post(
        "/reports",
        headers=auth_headers,
        json={
            "reported_user_id": "other-user",
        },
    )
    assert response.status_code == 422


def test_list_reports(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        REPORT
    ]

    response = client.get("/reports", headers=auth_headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_reports_filter_by_status(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        REPORT
    ]

    response = client.get("/reports?status=pending", headers=auth_headers)

    assert response.status_code == 200


def test_get_report(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        REPORT
    )

    response = client.get("/reports/report-123", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == "report-123"


def test_get_report_not_found(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.get("/reports/nonexistent", headers=auth_headers)

    assert response.status_code == 404


def test_get_report_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    other = {**REPORT, "reporterId": "other-user"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        other
    )

    response = client.get("/reports/report-123", headers=auth_headers)

    assert response.status_code == 403


def test_update_report(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        REPORT
    )
    updated = {**REPORT, "reason": "Updated reason"}
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        updated
    ]

    response = client.patch(
        "/reports/report-123", headers=auth_headers, json={"reason": "Updated reason"}
    )

    assert response.status_code == 200
    assert response.json()["reason"] == "Updated reason"


def test_update_report_no_fields(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        REPORT
    )

    response = client.patch("/reports/report-123", headers=auth_headers, json={})

    assert response.status_code == 422


def test_delete_report(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        REPORT
    )
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value.data = (
        []
    )

    response = client.delete("/reports/report-123", headers=auth_headers)

    assert response.status_code == 204


def test_delete_report_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    other = {**REPORT, "reporterId": "other-user"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        other
    )

    response = client.delete("/reports/report-123", headers=auth_headers)

    assert response.status_code == 403


def test_create_report_db_failure(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = []

    response = client.post(
        "/reports",
        headers=auth_headers,
        json={"reason": "Bad behaviour"},
    )

    assert response.status_code == 500


def test_update_report_not_found(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.patch(
        "/reports/nonexistent", headers=auth_headers, json={"reason": "Updated"}
    )

    assert response.status_code == 404


def test_update_report_forbidden(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    other = {**REPORT, "reporterId": "other-user"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        other
    )

    response = client.patch(
        "/reports/report-123", headers=auth_headers, json={"reason": "Updated"}
    )

    assert response.status_code == 403


def test_delete_report_not_found(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        None
    )

    response = client.delete("/reports/nonexistent", headers=auth_headers)

    assert response.status_code == 404


def test_update_report_with_image_and_status(
    client: TestClient, auth_headers: dict, mock_supabase: MagicMock
) -> None:
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = (
        REPORT
    )
    updated = {**REPORT, "imageURL": "http://example.com/img.jpg", "status": "reviewed"}
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
        updated
    ]

    response = client.patch(
        "/reports/report-123",
        headers=auth_headers,
        json={"image_url": "http://example.com/img.jpg", "status": "reviewed"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "reviewed"
