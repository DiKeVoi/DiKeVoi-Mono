import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter(prefix="/rides", tags=["confirmed rides"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


class RideStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_progress = "in_progress"
    awaiting_payment = "awaiting_payment"
    completed = "completed"
    cancelled = "cancelled"


# --- Schemas ---


class RideCreate(BaseModel):
    offer_user_id: str | None = None
    request_user_id: str | None = None
    origin_location: str
    destination_location: str
    departure_time: datetime
    status: RideStatus = RideStatus.pending
    negotiated_cost: float | None = None
    return_time: datetime | None = None
    is_recurring: bool | None = None


class RideUpdate(BaseModel):
    origin_location: str | None = None
    destination_location: str | None = None
    departure_time: datetime | None = None
    status: RideStatus | None = None
    negotiated_cost: float | None = None
    return_time: datetime | None = None
    is_recurring: bool | None = None


_FIELD_MAP = {
    "offer_user_id": "offerUserId",
    "request_user_id": "requestUserId",
    "origin_location": "originLocation",
    "destination_location": "destinationLocation",
    "departure_time": "departureTime",
    "negotiated_cost": "negotiatedCost",
    "return_time": "returnTime",
    "is_recurring": "isRecurring",
}


# --- Routes ---


@router.post("", status_code=status.HTTP_201_CREATED)
def create_ride(body: RideCreate, current_user: CurrentUser) -> dict:
    data = body.model_dump(exclude_none=True)
    db_data: dict = {
        _FIELD_MAP.get(k, k): (v.isoformat() if isinstance(v, datetime) else v)
        for k, v in data.items()
    }
    db_data["id"] = str(uuid.uuid4())
    db_data["createdAt"] = datetime.now(timezone.utc).isoformat()

    # Default the caller's role if neither user id is explicitly set
    if "offerUserId" not in db_data and "requestUserId" not in db_data:
        db_data["offerUserId"] = current_user["user_id"]

    result = supabase.table("Ride").insert(db_data).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create ride",
        )
    return cast(dict, result.data[0])


@router.get("")
def list_rides(
    current_user: CurrentUser,
    status_filter: RideStatus | None = Query(default=None, alias="status"),
) -> list:
    user_id = current_user["user_id"]
    query = (
        supabase.table("Ride")
        .select("*")
        .or_(f"offerUserId.eq.{user_id},requestUserId.eq.{user_id}")
    )
    if status_filter is not None:
        query = query.eq("status", status_filter.value)
    return cast(list, query.order("createdAt", desc=True).execute().data)


@router.get("/{ride_id}")
def get_ride(ride_id: str, current_user: CurrentUser) -> dict:
    result = supabase.table("Ride").select("*").eq("id", ride_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found"
        )
    ride = cast(dict, result.data)
    _require_participant(ride, current_user["user_id"])
    return ride


@router.patch("/{ride_id}")
def update_ride(ride_id: str, body: RideUpdate, current_user: CurrentUser) -> dict:
    ride = _get_or_404(ride_id)
    _require_participant(ride, current_user["user_id"])

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No fields to update",
        )

    db_updates: dict = {
        _FIELD_MAP.get(k, k): (v.isoformat() if isinstance(v, datetime) else v)
        for k, v in updates.items()
    }
    result = supabase.table("Ride").update(db_updates).eq("id", ride_id).execute()
    return cast(dict, result.data[0])


@router.delete("/{ride_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ride(ride_id: str, current_user: CurrentUser) -> None:
    ride = _get_or_404(ride_id)
    _require_participant(ride, current_user["user_id"])
    supabase.table("Ride").delete().eq("id", ride_id).execute()


@router.post("/{ride_id}/start")
def start_ride(ride_id: str, current_user: CurrentUser) -> dict:
    ride = _get_or_404(ride_id)
    user_id = current_user["user_id"]

    if ride.get("offerUserId") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the offerer can start the ride",
        )

    if ride.get("status") != RideStatus.confirmed.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ride must be confirmed before starting",
        )

    now = datetime.now(timezone.utc).isoformat()
    result = (
        supabase.table("Ride")
        .update(
            {
                "status": RideStatus.in_progress.value,
                "startedAt": now,
                "updatedAt": now,
            }
        )
        .eq("id", ride_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start ride",
        )

    requester_id = ride.get("requestUserId")
    if requester_id:
        _notify(
            requester_id,
            "Chuyến đi đã bắt đầu! 🚗",
            "Tài xế đã xác nhận khởi hành. Chúc bạn đi vui!",
        )

    return cast(dict, result.data[0])


@router.post("/{ride_id}/finish")
def finish_ride(ride_id: str, current_user: CurrentUser) -> dict:
    ride = _get_or_404(ride_id)
    user_id = current_user["user_id"]
    _require_participant(ride, user_id)

    if ride.get("status") != RideStatus.in_progress.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ride must be in progress to finish",
        )

    is_offerer = ride.get("offerUserId") == user_id
    flag_field = "finishedByOfferer" if is_offerer else "finishedByRequester"
    other_flag = "finishedByRequester" if is_offerer else "finishedByOfferer"
    other_id = ride.get("requestUserId") if is_offerer else ride.get("offerUserId")

    now = datetime.now(timezone.utc).isoformat()
    updates: dict = {flag_field: True, "updatedAt": now}

    if ride.get(other_flag):
        updates["status"] = RideStatus.awaiting_payment.value
        updates["finishedAt"] = now

    result = supabase.table("Ride").update(updates).eq("id", ride_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to finish ride",
        )

    updated_ride = cast(dict, result.data[0])

    if updated_ride.get("status") == RideStatus.awaiting_payment.value:
        for uid in [ride.get("offerUserId"), ride.get("requestUserId")]:
            if uid:
                _notify(
                    uid,
                    "Chuyến đi hoàn thành! 💰",
                    "Vui lòng xác nhận thanh toán chi phí chuyến đi.",
                )
    elif other_id:
        _notify(
            other_id,
            "Bạn đồng hành đã xác nhận đến nơi ✓",
            "Đang chờ bạn xác nhận để hoàn tất chuyến đi.",
        )

    return updated_ride


@router.post("/{ride_id}/pay")
def confirm_payment(ride_id: str, current_user: CurrentUser) -> dict:
    ride = _get_or_404(ride_id)
    user_id = current_user["user_id"]
    _require_participant(ride, user_id)

    if ride.get("status") != RideStatus.awaiting_payment.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Ride must be awaiting payment"
        )

    is_offerer = ride.get("offerUserId") == user_id
    flag_field = "paidByOfferer" if is_offerer else "paidByRequester"
    other_flag = "paidByRequester" if is_offerer else "paidByOfferer"
    other_id = ride.get("requestUserId") if is_offerer else ride.get("offerUserId")

    now = datetime.now(timezone.utc).isoformat()
    updates: dict = {flag_field: True, "updatedAt": now}

    if ride.get(other_flag):
        updates["status"] = RideStatus.completed.value
        updates["paidAt"] = now

    result = supabase.table("Ride").update(updates).eq("id", ride_id).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm payment",
        )

    updated_ride = cast(dict, result.data[0])

    if updated_ride.get("status") == RideStatus.completed.value:
        for uid in [ride.get("offerUserId"), ride.get("requestUserId")]:
            if uid:
                _notify(
                    uid, "Thanh toán hoàn tất! 🎉", "Cảm ơn bạn đã sử dụng Đi ké với!"
                )
    elif other_id:
        _notify(
            other_id,
            "Bạn đồng hành đã xác nhận thanh toán ✓",
            "Đang chờ bạn xác nhận để hoàn tất.",
        )

    return updated_ride


# --- Helpers ---


def _get_or_404(ride_id: str) -> dict:
    result = supabase.table("Ride").select("*").eq("id", ride_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found"
        )
    return cast(dict, result.data)


def _require_participant(ride: dict, user_id: str) -> None:
    if ride.get("offerUserId") != user_id and ride.get("requestUserId") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant of this ride",
        )


def _notify(user_id: str, title: str, body: str) -> None:
    try:
        supabase.table("Notification").insert(
            {
                "id": str(uuid.uuid4()),
                "userId": user_id,
                "title": title,
                "body": body,
                "isRead": False,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()
    except Exception:
        pass
