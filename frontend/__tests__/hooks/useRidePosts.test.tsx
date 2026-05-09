jest.unmock("@/hooks/useRidePosts");

import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useMyRidePosts } from "@/hooks/useRidePosts";

jest.mock("@/services/ridePosts", () => ({
  ridePostsService: {
    list: jest.fn().mockResolvedValue([
      {
        id: "rp-1",
        userId: "user-1",
        type: "request",
        status: "open",
        originLocation: "KTX Khu B",
        destinationLocation: "ĐH Bách Khoa",
        departureTime: "2026-05-15T07:30:00",
        seatsAvailable: 1,
        isRecurring: false,
        preferredGender: null,
        description: null,
        createdAt: "2026-05-07T09:00:00",
        updatedAt: "2026-05-07T09:00:00",
      },
    ]),
  },
}));

jest.mock("@/hooks/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe("useMyRidePosts", () => {
  it("returns posts belonging to current user", async () => {
    const { result } = renderHook(() => useMyRidePosts(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].userId).toBe("user-1");
  });
});
