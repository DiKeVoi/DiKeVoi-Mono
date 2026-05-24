import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.core.supabase import supabase

router = APIRouter(prefix="/negotiations", tags=["negotiations"])

CurrentUser = Annotated[dict, Depends(get_current_user)]


class NegotiationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    cancelled = "cancelled"
    confirmed = "confirmed"


# --- Schemas ---


class NegotiationCreate(BaseModel):
    offer_post_id: str
    request_post_id: str
    auto_accept: bool = False


class NegotiationUpdate(BaseModel):
    status: NegotiationStatus | None = None
    pickup_location: str | None = None
    dropoff_location: str | None = None
    departure_time: str | None = None
    fare: int | None = None
    note: str | None = None


# --- Routes ---


@router.post("", status_code=status.HTTP_201_CREATED)
def create_negotiation(body: NegotiationCreate, current_user: CurrentUser) -> dict:
    offer_post = _get_post_or_404(body.offer_post_id)
    request_post = _get_post_or_404(body.request_post_id)

    if offer_post["type"] != "offer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="offer_post_id must be an offer post",
        )
    if request_post["type"] != "request":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="request_post_id must be a request post",
        )

    offerer_uid = offer_post["userId"]
    requester_uid = request_post["userId"]

    if offerer_uid == requester_uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot negotiate with yourself",
        )

    caller = current_user["user_id"]
    if caller not in (offerer_uid, requester_uid):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant of these posts",
        )

    existing = (
        supabase.table("Negotiation")
        .select("id")
        .eq("offerPostId", body.offer_post_id)
        .eq("requestPostId", body.request_post_id)
        .in_("status", ["pending", "accepted"])
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Negotiation already exists for this post pair",
        )

    initial_status = (
        NegotiationStatus.accepted.value
        if body.auto_accept
        else NegotiationStatus.pending.value
    )

    result = (
        supabase.table("Negotiation")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "offererUid": offerer_uid,
                "requesterUid": requester_uid,
                "offerPostId": body.offer_post_id,
                "requestPostId": body.request_post_id,
                "status": initial_status,
                "pickupLocation": offer_post.get("originLocation"),
                "dropoffLocation": offer_post.get("destinationLocation"),
                "departureTime": offer_post.get("departureTime"),
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
        )
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create negotiation",
        )

    neg = cast(dict, result.data[0])

    if body.auto_accept:
        # Mark both posts matched immediately
        supabase.table("RidePost").update({"status": "connecting"}).eq(
            "id", body.offer_post_id
        ).execute()
        supabase.table("RidePost").update({"status": "connecting"}).eq(
            "id", body.request_post_id
        ).execute()
        # Notify the other party that a match was made and negotiation is open
        other_uid = requester_uid if caller == offerer_uid else offerer_uid
        _notify(
            other_uid,
            "Đã ghép chuyến!",
            "Bạn có một yêu cầu kết nối mới. Vào thương lượng ngay!",
        )
    else:
        # Notify offerer that requester wants to connect
        _notify(
            offerer_uid,
            "Yêu cầu kết nối mới",
            "Có người muốn đi ké cùng bạn. Kiểm tra ngay!",
        )

    return neg


@router.get("")
def list_negotiations(
    current_user: CurrentUser,
    neg_status: NegotiationStatus | None = Query(default=None, alias="status"),
) -> list:
    user_id = current_user["user_id"]
    query = (
        supabase.table("Negotiation")
        .select("*")
        .or_(f"offererUid.eq.{user_id},requesterUid.eq.{user_id}")
    )
    if neg_status is not None:
        query = query.eq("status", neg_status.value)
    return cast(list, query.order("createdAt", desc=True).execute().data)


@router.get("/{negotiation_id}")
def get_negotiation(negotiation_id: str, current_user: CurrentUser) -> dict:
    neg = _get_or_404(negotiation_id)
    _require_participant(neg, current_user["user_id"])
    return neg

@router.get("/byRide/{rideId}")
def get_negotiations_by_ride(
    rideId: str,
) -> list:
    query = (
        supabase.table("Negotiation")
        .select("*")
        .eq("rideId", rideId)
        .limit(1)
    )
    return query.execute().data


@router.get("/{id}/users")
def get_users_of_negotiation(id: str):
    try:
        select_query = """
            offererUid,
            requesterUid,
            offerer:User!Negotiation_offererUid_fkey (
                id,
                displayName,
                photoUrl
            ),
            requester:User!Negotiation_requesterUid_fkey (
                id,
                displayName,
                photoUrl
            )
        """

        response = (
            supabase.table("Negotiation")
            .select(select_query)
            .eq("id", id)
            .maybe_single()
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cuộc thương lượng",
            )

        return response.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.patch("/{negotiation_id}")
def update_negotiation(
    negotiation_id: str, body: NegotiationUpdate, current_user: CurrentUser
) -> dict:
    neg = _get_or_404(negotiation_id)
    caller = current_user["user_id"]
    _require_participant(neg, caller)

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No fields to update",
        )

    new_status = updates.get("status")

    if new_status in ("accepted", "rejected"):
        if neg["offererUid"] != caller:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the offerer can accept or reject",
            )
        if neg["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only accept/reject a pending negotiation",
            )

    if new_status == "accepted":
        offer_post_id = neg.get("offerPostId")
        request_post_id = neg.get("requestPostId")
        if offer_post_id:
            supabase.table("RidePost").update({"status": "matched"}).eq(
                "id", offer_post_id
            ).execute()
        if request_post_id:
            supabase.table("RidePost").update({"status": "matched"}).eq(
                "id", request_post_id
            ).execute()
        _notify(
            neg["requesterUid"],
            "Yêu cầu được chấp nhận!",
            "Người cho đi ké đã chấp nhận. Vào thương lượng ngay!",
        )

    if new_status == "rejected":
        _reopen_posts(neg)
        _notify(
            neg["requesterUid"],
            "Yêu cầu bị từ chối",
            "Người cho đi ké đã từ chối yêu cầu của bạn.",
        )

    if new_status == "cancelled":
        if neg["status"] not in ("pending", "accepted"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel a finished negotiation",
            )
        _reopen_posts(neg)
        other_uid = (
            neg["requesterUid"] if caller == neg["offererUid"] else neg["offererUid"]
        )
        _notify(other_uid, "Chuyến đi đã bị hủy", "Người kia đã hủy thương lượng.")

    # Notify other party when negotiable fields are proposed/changed
    if not new_status:
        other_uid = (
            neg["requesterUid"] if caller == neg["offererUid"] else neg["offererUid"]
        )
        changed_fields = set(updates.keys())
        if "fare" in changed_fields:
            fare_val = updates["fare"]
            _notify(
                other_uid,
                "Đề xuất giá mới",
                f"Người kia đề xuất mức giá {fare_val:,} ₫. Vào thương lượng để phản hồi!",
            )
        elif changed_fields & {"pickup_location", "dropoff_location", "departure_time"}:
            _notify(
                other_uid,
                "Thông tin chuyến đi đã thay đổi",
                "Người kia vừa cập nhật điểm đón/điểm đến hoặc giờ khởi hành.",
            )

    field_map = {
        "pickup_location": "pickupLocation",
        "dropoff_location": "dropoffLocation",
        "departure_time": "departureTime",
    }
    db_updates: dict = {field_map.get(k, k): v for k, v in updates.items()}
    db_updates["updatedAt"] = datetime.now(timezone.utc).isoformat()
    db_updates["lastEditedBy"] = caller

    result = (
        supabase.table("Negotiation")
        .update(db_updates)
        .eq("id", negotiation_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update negotiation",
        )
    return cast(dict, result.data[0])


@router.post("/{negotiation_id}/confirm")
def confirm_negotiation(negotiation_id: str, current_user: CurrentUser) -> dict:
    neg = _get_or_404(negotiation_id)
    caller = current_user["user_id"]
    _require_participant(neg, caller)

    # if neg["status"] != "accepted":
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Negotiation must be accepted before confirming")

    is_offerer = neg["offererUid"] == caller
    confirm_field = "confirmedByOfferer" if is_offerer else "confirmedByRequester"

    db_updates: dict = {
        confirm_field: True,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }

    already_confirmed_offerer = neg.get("confirmedByOfferer") or False
    already_confirmed_requester = neg.get("confirmedByRequester") or False

    if is_offerer:
        already_confirmed_offerer = True
        _notify(
            neg["requesterUid"],
            "Người kia đã xác nhận",
            "Đến lượt bạn xác nhận để chốt chuyến đi!",
        )
    else:
        already_confirmed_requester = True
        _notify(
            neg["offererUid"],
            "Người kia đã xác nhận",
            "Đến lượt bạn xác nhận để chốt chuyến đi!",
        )

    if already_confirmed_offerer and already_confirmed_requester:
        ride_result = (
            supabase.table("Ride")
            .insert(
                {
                    "id": str(uuid.uuid4()),
                    "offerUserId": neg["offererUid"],
                    "requestUserId": neg["requesterUid"],
                    "originLocation": neg.get("pickupLocation") or "",
                    "destinationLocation": neg.get("dropoffLocation") or "",
                    "departureTime": neg.get("departureTime")
                    or datetime.now(timezone.utc).isoformat(),
                    "status": "confirmed",
                    "negotiatedCost": neg.get("fare"),
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }
            )
            .execute()
        )
        if not ride_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create ride",
            )

        ride_id = cast(list, ride_result.data)[0]["id"]
        db_updates["rideId"] = ride_id
        db_updates["status"] = NegotiationStatus.confirmed.value
        supabase.table("RidePost").update({"status": "closed"}).eq(
            "id", neg["offerPostId"]
        ).execute()
        supabase.table("RidePost").update({"status": "closed"}).eq(
            "id", neg["requestPostId"]
        ).execute()

        _notify(
            neg["offererUid"],
            "Chuyến đi đã được xác nhận! 🎉",
            "Cả hai đã đồng ý. Chúc chuyến đi vui vẻ!",
        )
        _notify(
            neg["requesterUid"],
            "Chuyến đi đã được xác nhận! 🎉",
            "Cả hai đã đồng ý. Chúc chuyến đi vui vẻ!",
        )

    result = (
        supabase.table("Negotiation")
        .update(db_updates)
        .eq("id", negotiation_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm negotiation",
        )
    return cast(dict, result.data[0])


# --- Helpers ---


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
        pass  # Non-critical — don't fail the main operation


def _get_or_404(negotiation_id: str) -> dict:
    result = (
        supabase.table("Negotiation")
        .select("*")
        .eq("id", negotiation_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Negotiation not found"
        )
    return cast(dict, result.data)


def _get_post_or_404(post_id: str) -> dict:
    result = supabase.table("RidePost").select("*").eq("id", post_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ride post not found"
        )
    return cast(dict, result.data)


def _require_participant(neg: dict, user_id: str) -> None:
    if neg.get("offererUid") != user_id and neg.get("requesterUid") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant of this negotiation",
        )


def _reopen_posts(neg: dict) -> None:
    offer_post_id = neg.get("offerPostId")
    request_post_id = neg.get("requestPostId")
    if offer_post_id:
        supabase.table("RidePost").update({"status": "open"}).eq(
            "id", offer_post_id
        ).execute()
    if request_post_id:
        supabase.table("RidePost").update({"status": "open"}).eq(
            "id", request_post_id
        ).execute()
