import uuid
from datetime import datetime, timezone
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter(prefix="/ratings", tags=["ratings"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


# --- Schemas ---


class RatingCreate(BaseModel):
    ride_id: str
    rated_user_id: str
    score: int = Field(ge=1, le=5)
    comment: str | None = None


# --- Routes ---


@router.post("", status_code=status.HTTP_201_CREATED)
def create_rating(body: RatingCreate, current_user: CurrentUser) -> dict:
    user_id = current_user["user_id"]

    ride_result = (
        supabase.table("Ride").select("*").eq("id", body.ride_id).single().execute()
    )
    if not ride_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found"
        )
    ride = cast(dict, ride_result.data)

    if ride.get("status") != "completed":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Can only rate completed rides",
        )

    participants = {ride.get("offerUserId"), ride.get("requestUserId")}
    if user_id not in participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant of this ride",
        )
    if body.rated_user_id not in participants:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Rated user was not a participant of this ride",
        )
    if body.rated_user_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot rate yourself",
        )

    result = (
        supabase.table("UserRating")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "raterId": user_id,
                "ratedUserId": body.rated_user_id,
                "rideId": body.ride_id,
                "score": body.score,
                "comment": body.comment,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create rating",
        )
    return cast(dict, result.data[0])


@router.get("")
def list_ratings(
    current_user: CurrentUser,
    kind: str | None = Query(default=None, pattern="^(given|received)$"),
    user_id: str | None = Query(default=None),
) -> list:
    """
    kind=given    → ratings the current user submitted
    kind=received → ratings the current user received
    user_id       → ratings received by a specific user (public profile view)
    """
    query = supabase.table("UserRating").select("*")

    if user_id is not None:
        query = query.eq("ratedUserId", user_id)
    elif kind == "given":
        query = query.eq("raterId", current_user["user_id"])
    else:
        query = query.eq("ratedUserId", current_user["user_id"])

    return cast(list, query.order("createdAt", desc=True).execute().data)


@router.get("/{rating_id}")
def get_rating(rating_id: str) -> dict:
    result = (
        supabase.table("UserRating").select("*").eq("id", rating_id).single().execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found"
        )
    return cast(dict, result.data)


@router.delete("/{rating_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rating(rating_id: str, current_user: CurrentUser) -> None:
    result = (
        supabase.table("UserRating").select("*").eq("id", rating_id).single().execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found"
        )
    rating = cast(dict, result.data)
    if rating.get("raterId") != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your rating"
        )
    supabase.table("UserRating").delete().eq("id", rating_id).execute()
