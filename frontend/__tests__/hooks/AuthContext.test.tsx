import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "@/hooks/AuthContext";

jest.mock("@/lib/tokenStorage", () => ({
  setToken: jest.fn().mockResolvedValue(undefined),
  getToken: jest.fn().mockResolvedValue(null),
  clearToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/services/auth", () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ access_token: "jwt-abc", token_type: "bearer" }),
    getMe: jest.fn().mockResolvedValue({
      id: "user-1",
      email: "test@student.edu.vn",
      displayName: "Test User",
      isVerified: true,
      authProvider: "email",
      photoUrl: null,
      gender: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    }),
    register: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  it("starts with null user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it("sets user after login", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login("test@student.edu.vn", "1234");
    });
    expect(result.current.user?.email).toBe("test@student.edu.vn");
  });

  it("clears user after logout", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login("test@student.edu.vn", "1234");
      await result.current.logout();
    });
    expect(result.current.user).toBeNull();
  });
});
