import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter(prefix="/ride-posts", tags=["rides"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


class PostType(str, Enum):
    request = "request"
    offer = "offer"


class RidePostCreate(BaseModel):
    type: PostType
    origin_location: str
    destination_location: str
    departure_time: datetime
    is_recurring: bool
    preferred_gender: str | None = None
    description: str | None = None


class RidePostUpdate(BaseModel):
    origin_location: str | None = None
    destination_location: str | None = None
    departure_time: datetime | None = None
    is_recurring: bool | None = None
    preferred_gender: str | None = None
    description: str | None = None


@router.post("", status_code=status.HTTP_201_CREATED)
def create_ride_post(body: RidePostCreate, current_user: CurrentUser) -> dict:
    result = (
        supabase.table("RidePost")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "userId": current_user["user_id"],
                "type": body.type.value,
                "originLocation": body.origin_location,
                "destinationLocation": body.destination_location,
                "departureTime": body.departure_time.isoformat(),
                "isRecurring": body.is_recurring,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "preferredGender": body.preferred_gender,
                "description": body.description,
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create ride post",
        )

    return cast(dict, result.data[0])


@router.get("")
def list_ride_posts(type: PostType | None = Query(default=None)) -> list:
    query = supabase.table("RidePost").select("*")
    if type is not None:
        query = query.eq("type", type.value)
    return cast(list, query.order("createdAt", desc=True).execute().data)


@router.get("/mine")
def list_my_ride_posts(
    current_user: CurrentUser, type: PostType | None = Query(default=None)
) -> list:
    select_query = """
        *,
        offer_negotiations:Negotiation!Negotiation_offerPostId_fkey(
            id,
            status,
            requester:User!Negotiation_requesterUid_fkey(displayName, photoUrl)
        ),
        request_negotiations:Negotiation!Negotiation_requestPostId_fkey(
            id,
            status,
            offerer:User!Negotiation_offererUid_fkey(displayName, photoUrl)
        )
    """

    query = (
        supabase.table("RidePost")
        .select(select_query)
        .eq("userId", current_user["user_id"])
    )

    if type is not None:
        query = query.eq("type", type.value)

    raw_data = cast(list, query.order("createdAt", desc=True).execute().data)

    formatted_data = []

    for post in raw_data:
        offer_negs = post.pop("offer_negotiations", [])
        request_negs = post.pop("request_negotiations", [])

        offer_negs = offer_negs if offer_negs else []
        request_negs = request_negs if request_negs else []

        active_neg = None
        partner_info = None
        has_pending = False

        for neg in offer_negs:
            if neg.get("status") in ["accepted", "confirmed"]:
                active_neg = neg
                partner_info = neg.get("requester")
                break
            elif neg.get("status") == "pending":
                has_pending = True

        if not active_neg:
            for neg in request_negs:
                if neg.get("status") in ["accepted", "confirmed"]:
                    active_neg = neg
                    partner_info = neg.get("offerer")
                    break
                elif neg.get("status") == "pending":
                    has_pending = True

        if active_neg:
            post["negotiationId"] = active_neg.get("id")

            if isinstance(partner_info, list) and len(partner_info) > 0:
                partner_info = partner_info[0]

            if isinstance(partner_info, dict):
                post["with"] = {
                    "name": partner_info.get("displayName"),
                    "avatarUrl": partner_info.get("photoUrl"),
                }

            # Đã accept -> đổi thành "matched"
            post["computedStatus"] = "matched"
        elif has_pending:
            # Có người đang trả giá -> đổi thành "connecting"
            post["computedStatus"] = "connecting"
        else:
            post["computedStatus"] = "open"

        formatted_data.append(post)

    return formatted_data


@router.get("/{ride_id}")
def get_ride_post(ride_id: str) -> dict:
    result = supabase.table("RidePost").select("*").eq("id", ride_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ride post not found"
        )
    return cast(dict, result.data)


@router.patch("/{ride_id}")
def update_ride_post(
    ride_id: str, body: RidePostUpdate, current_user: CurrentUser
) -> dict:
    _require_owner(ride_id, current_user["user_id"])

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No fields to update",
        )

    field_map = {
        "origin_location": "originLocation",
        "destination_location": "destinationLocation",
        "departure_time": "departureTime",
        "is_recurring": "isRecurring",
        "preferred_gender": "preferredGender",
    }
    db_updates = {
        field_map.get(k, k): (v.isoformat() if isinstance(v, datetime) else v)
        for k, v in updates.items()
    }

    result = supabase.table("RidePost").update(db_updates).eq("id", ride_id).execute()
    return cast(dict, result.data[0])


@router.delete("/{ride_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ride_post(ride_id: str, current_user: CurrentUser) -> None:
    _require_owner(ride_id, current_user["user_id"])
    supabase.table("RidePost").delete().eq("id", ride_id).execute()


def _require_owner(ride_id: str, user_id: str) -> None:
    try:
        result = (
            supabase.table("RidePost")
            .select("userId")
            .eq("id", ride_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ride post not found"
            )
        if cast(dict, result.data)["userId"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not the owner of this post",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ride post not found"
        )
