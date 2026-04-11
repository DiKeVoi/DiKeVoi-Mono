export type MyRequestData = {
  id: number;
  from: string;
  to: string;
  time: Date;
  status: "finding" | "matched" | "completed";
  with?: UserData; // Only for matched or completed requests
};

export type UserData = {
  id: number;
  name: string;
  avatarUrl: string;
};

export type NotificationData = {
  id: number;
  title: string;
  time: Date;
  read: boolean;
  category?: "success" | "matching" | "failed"; // Optional category for different types of notifications
};
