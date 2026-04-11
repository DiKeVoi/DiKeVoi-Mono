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
