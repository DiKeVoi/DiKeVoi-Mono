import uuid
from datetime import datetime, timezone
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


# --- Schemas ---


class VehicleCreate(BaseModel):
    make: str
    model: str
    year: int = Field(ge=1900, le=2100)
    plate: str
    color: str | None = None
    seats: int = Field(default=4, ge=1, le=20)


class VehicleUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    year: int | None = Field(default=None, ge=1900, le=2100)
    plate: str | None = None
    color: str | None = None
    seats: int | None = Field(default=None, ge=1, le=20)


_FIELD_MAP = {
    "is_active": "isActive",
}


# --- Routes ---


@router.post("", status_code=status.HTTP_201_CREATED)
def create_vehicle(body: VehicleCreate, current_user: CurrentUser) -> dict:
    result = (
        supabase.table("Vehicle")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "userId": current_user["user_id"],
                "make": body.make,
                "model": body.model,
                "year": body.year,
                "plate": body.plate,
                "color": body.color,
                "seats": body.seats,
                "isActive": False,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create vehicle",
        )
    return cast(dict, result.data[0])


@router.get("")
def list_vehicles(current_user: CurrentUser) -> list:
    return cast(
        list,
        supabase.table("Vehicle")
        .select("*")
        .eq("userId", current_user["user_id"])
        .order("createdAt", desc=True)
        .execute()
        .data,
    )


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str, current_user: CurrentUser) -> dict:
    vehicle = _get_or_404(vehicle_id)
    _require_owner(vehicle, current_user["user_id"])
    return vehicle


# Must be declared before /{vehicle_id} to avoid "activate" matching as an id
@router.patch("/{vehicle_id}/activate", status_code=status.HTTP_200_OK)
def activate_vehicle(vehicle_id: str, current_user: CurrentUser) -> dict:
    vehicle = _get_or_404(vehicle_id)
    _require_owner(vehicle, current_user["user_id"])

    # Deactivate all other vehicles for this user
    supabase.table("Vehicle").update({"isActive": False}).eq(
        "userId", current_user["user_id"]
    ).neq("id", vehicle_id).execute()

    result = (
        supabase.table("Vehicle")
        .update({"isActive": True})
        .eq("id", vehicle_id)
        .execute()
    )
    return cast(dict, result.data[0])


@router.patch("/{vehicle_id}")
def update_vehicle(
    vehicle_id: str, body: VehicleUpdate, current_user: CurrentUser
) -> dict:
    vehicle = _get_or_404(vehicle_id)
    _require_owner(vehicle, current_user["user_id"])

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No fields to update",
        )

    result = supabase.table("Vehicle").update(updates).eq("id", vehicle_id).execute()
    return cast(dict, result.data[0])


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: str, current_user: CurrentUser) -> None:
    vehicle = _get_or_404(vehicle_id)
    _require_owner(vehicle, current_user["user_id"])
    supabase.table("Vehicle").delete().eq("id", vehicle_id).execute()


# --- Helpers ---


def _get_or_404(vehicle_id: str) -> dict:
    result = (
        supabase.table("Vehicle").select("*").eq("id", vehicle_id).single().execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
        )
    return cast(dict, result.data)


def _require_owner(vehicle: dict, user_id: str) -> None:
    if vehicle.get("userId") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your vehicle"
        )
