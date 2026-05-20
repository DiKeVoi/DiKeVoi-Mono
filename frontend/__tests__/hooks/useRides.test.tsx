import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useRides } from "@/hooks/useRides";

jest.mock("@/services/rides", () => ({
  ridesService: {
    list: jest.fn().mockResolvedValue([
      {
        id: "ride-1",
        offerUserId: "user-1",
        requestUserId: "user-2",
        originLocation: "Munich Hbf",
        destinationLocation: "Nuremberg Hbf",
        departureTime: "2026-04-10T07:30:00",
        status: "completed",
        negotiatedCost: 18.5,
        seatsAvailable: 1,
        returnTime: null,
        isRecurring: false,
        createdAt: "2026-04-08T14:00:00",
        updatedAt: "2026-04-10T12:00:00",
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

describe("useRides", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns list of rides", async () => {
    const { result } = renderHook(() => useRides(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].status).toBe("completed");
  });
});
