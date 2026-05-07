import { apiClient } from "@/lib/axios";

jest.mock("@/lib/tokenStorage", () => ({
  getToken: jest.fn().mockResolvedValue("test-token"),
  clearToken: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

describe("apiClient", () => {
  it("has correct baseURL", () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
  });

  it("is an axios instance", () => {
    expect(typeof apiClient.get).toBe("function");
    expect(typeof apiClient.post).toBe("function");
  });
});
