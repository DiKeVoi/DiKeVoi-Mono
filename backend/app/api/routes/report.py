import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter(prefix="/reports", tags=["reports"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


class ReportStatus(str, Enum):
    pending = "pending"
    reviewed = "reviewed"
    resolved = "resolved"
    dismissed = "dismissed"


# --- Schemas ---


class ReportCreate(BaseModel):
    reported_user_id: str | None = None
    ride_id: str | None = None
    reason: str
    image_url: str | None = None


class ReportUpdate(BaseModel):
    reason: str | None = None
    image_url: str | None = None
    status: ReportStatus | None = None


# --- Routes ---


@router.post("", status_code=status.HTTP_201_CREATED)
def create_report(body: ReportCreate, current_user: CurrentUser) -> dict:
    result = (
        supabase.table("Report")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "reporterId": current_user["user_id"],
                "reportedUserId": body.reported_user_id,
                "rideId": body.ride_id,
                "reason": body.reason,
                "imageURL": body.image_url,
                "status": ReportStatus.pending.value,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report",
        )
    return cast(dict, result.data[0])


@router.get("")
def list_reports(
    current_user: CurrentUser,
    report_status: ReportStatus | None = Query(default=None, alias="status"),
) -> list:
    # Returns only reports filed by the current user
    query = (
        supabase.table("Report").select("*").eq("reporterId", current_user["user_id"])
    )
    if report_status is not None:
        query = query.eq("status", report_status.value)
    return cast(list, query.order("createdAt", desc=True).execute().data)


@router.get("/{report_id}")
def get_report(report_id: str, current_user: CurrentUser) -> dict:
    result = supabase.table("Report").select("*").eq("id", report_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report not found"
        )
    report = cast(dict, result.data)
    _require_reporter(report, current_user["user_id"])
    return report


@router.patch("/{report_id}")
def update_report(
    report_id: str, body: ReportUpdate, current_user: CurrentUser
) -> dict:
    report = _get_or_404(report_id)
    _require_reporter(report, current_user["user_id"])

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No fields to update",
        )

    db_updates: dict = {}
    if "reason" in updates:
        db_updates["reason"] = updates["reason"]
    if "image_url" in updates:
        db_updates["imageURL"] = updates["image_url"]
    if "status" in updates:
        db_updates["status"] = updates["status"]

    result = supabase.table("Report").update(db_updates).eq("id", report_id).execute()
    return cast(dict, result.data[0])


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: str, current_user: CurrentUser) -> None:
    report = _get_or_404(report_id)
    _require_reporter(report, current_user["user_id"])
    supabase.table("Report").delete().eq("id", report_id).execute()


# --- Helpers ---


def _get_or_404(report_id: str) -> dict:
    result = supabase.table("Report").select("*").eq("id", report_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Report not found"
        )
    return cast(dict, result.data)


def _require_reporter(report: dict, user_id: str) -> None:
    if report.get("reporterId") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your report"
        )
