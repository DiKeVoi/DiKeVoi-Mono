export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type RideStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PostType = "offer" | "request";
export type RidePostStatus = "open" | "matched" | "closed" | "cancelled";
export type NegotiationStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type NotificationType =
  | "ride_request" | "ride_confirmed" | "ride_cancelled" | "ride_completed"
  | "negotiation_offer" | "negotiation_accepted" | "negotiation_rejected"
  | "system";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface User {
  id: string;
  authProvider: string;
  email: string;
  isVerified: boolean;
  displayName: string | null;
  photoUrl: string | null;
  gender: Gender | null;
  createdAt: string;
  updatedAt: string;
}

export interface RidePost {
  id: string;
  userId: string;
  type: PostType;
  status: RidePostStatus;
  originLocation: string;
  destinationLocation: string;
  departureTime: string;
  seatsAvailable: number;
  isRecurring: boolean;
  preferredGender: Gender | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  id: string;
  offerUserId: string | null;
  requestUserId: string | null;
  originLocation: string;
  destinationLocation: string;
  departureTime: string;
  status: RideStatus;
  negotiatedCost: number | null;
  seatsAvailable: number;
  returnTime: string | null;
  isRecurring: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string | null;
  body: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string | null;
  seats: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserRating {
  id: string;
  raterId: string;
  ratedUserId: string;
  rideId: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  rideId: string | null;
  reason: string;
  imageURL: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
