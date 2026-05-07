jest.unmock("@/hooks/useNotifications");

import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useNotificationList } from "@/hooks/useNotifications";

jest.mock("@/services/notifications", () => ({
  notificationsService: {
    list: jest.fn().mockResolvedValue([
      {
        id: "n-1",
        userId: "user-1",
        type: "system",
        title: "Chào mừng",
        body: "Tài khoản đã xác thực.",
        relatedId: null,
        isRead: false,
        createdAt: "2026-05-07T10:00:00",
      },
    ]),
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe("useNotificationList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns notifications from API", async () => {
    const { result } = renderHook(() => useNotificationList(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe("Chào mừng");
  });
});
