import { useMyRidePosts } from "@/hooks/useRidePosts";
import { useAuth } from "@/hooks/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("@/services/ridePosts", () => ({
  ridePostsService: {
    list: jest.fn().mockResolvedValue([]),
    listMine: jest.fn().mockResolvedValue([
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
    create: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue(undefined),
  },
  CreateRidePostPayload: {},
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

jest.mock("@/hooks/AuthContext", () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: jest.fn(),
}));

describe("useMyRidePosts", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: { id: "user-1" } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns posts belonging to current user", async () => {
    const { result } = renderHook(() => useMyRidePosts(), {
      wrapper: createWrapper(),
    });
    await waitFor(
      () => {
        if (result.current.isError) {
          throw new Error(
            `Query failed: ${(result.current.error as any)?.message}`,
          );
        }
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 5000 },
    );
    expect(result.current.data).toHaveLength(5);
    expect(result.current.data![0].userId).toBe("u-1");
  });
});
