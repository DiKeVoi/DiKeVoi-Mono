import uuid
from datetime import datetime, timezone
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter(prefix="/notifications", tags=["notifications"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


# --- Schemas ---


class NotificationCreate(BaseModel):
    title: str | None = None
    body: str | None = None


class NotificationUpdate(BaseModel):
    is_read: bool | None = None
    title: str | None = None
    body: str | None = None


# --- Routes ---


@router.post("", status_code=status.HTTP_201_CREATED)
def create_notification(body: NotificationCreate, current_user: CurrentUser) -> dict:
    result = (
        supabase.table("Notification")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "userId": current_user["user_id"],
                "title": body.title,
                "body": body.body,
                "isRead": False,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification",
        )
    return cast(dict, result.data[0])


@router.get("")
def list_notifications(current_user: CurrentUser) -> list:
    return cast(
        list,
        supabase.table("Notification")
        .select("*")
        .eq("userId", current_user["user_id"])
        .order("createdAt", desc=True)
        .execute()
        .data,
    )


@router.get("/unread-count")
def unread_count(current_user: CurrentUser) -> dict:
    result = (
        supabase.table("Notification")
        .select("id")
        .eq("userId", current_user["user_id"])
        .eq("isRead", False)
        .execute()
    )
    return {"count": len(cast(list, result.data))}


@router.get("/{notification_id}")
def get_notification(notification_id: str, current_user: CurrentUser) -> dict:
    result = (
        supabase.table("Notification")
        .select("*")
        .eq("id", notification_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    notification = cast(dict, result.data)
    _require_owner(notification, current_user["user_id"])
    return notification


@router.patch("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(current_user: CurrentUser) -> None:
    supabase.table("Notification").update({"isRead": True}).eq(
        "userId", current_user["user_id"]
    ).execute()


@router.patch("/{notification_id}")
def update_notification(
    notification_id: str, body: NotificationUpdate, current_user: CurrentUser
) -> dict:
    notification = _get_or_404(notification_id)
    _require_owner(notification, current_user["user_id"])

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No fields to update",
        )

    db_updates: dict = {}
    if "is_read" in updates:
        db_updates["isRead"] = updates["is_read"]
    if "title" in updates:
        db_updates["title"] = updates["title"]
    if "body" in updates:
        db_updates["body"] = updates["body"]

    result = (
        supabase.table("Notification")
        .update(db_updates)
        .eq("id", notification_id)
        .execute()
    )
    return cast(dict, result.data[0])


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str, current_user: CurrentUser) -> None:
    notification = _get_or_404(notification_id)
    _require_owner(notification, current_user["user_id"])
    supabase.table("Notification").delete().eq("id", notification_id).execute()


# --- Helpers ---


def _get_or_404(notification_id: str) -> dict:
    result = (
        supabase.table("Notification")
        .select("*")
        .eq("id", notification_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    return cast(dict, result.data)


def _require_owner(notification: dict, user_id: str) -> None:
    if notification.get("userId") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your notification"
        )
