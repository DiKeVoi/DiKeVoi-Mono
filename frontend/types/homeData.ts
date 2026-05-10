export type MyRequestData = {
  id: string;
  from: string;
  to: string;
  time: Date;
  status: "finding" | "matched" | "completed";
  with?: UserData; // Only for matched or completed requests
};

export type UserData = {
  name: string;
  avatarUrl: string;
};

export type NotificationData = {
  id: string;
  title: string;
  time: Date;
  read: boolean;
  category?: "success" | "matching" | "failed" | "accepted"; // Optional category for different types of notifications
  targetId?: string;
};
