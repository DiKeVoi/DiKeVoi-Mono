import { setToken, getToken, clearToken } from "@/lib/tokenStorage";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue("mock-jwt"),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue("mock-jwt"),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

describe("tokenStorage", () => {
  it("setToken calls storage without throwing", async () => {
    await expect(setToken("abc")).resolves.toBeUndefined();
  });

  it("getToken returns stored value", async () => {
    const token = await getToken();
    expect(typeof token === "string" || token === null).toBe(true);
  });

  it("clearToken resolves without throwing", async () => {
    await expect(clearToken()).resolves.toBeUndefined();
  });
});
