import { apiClient } from "@/lib/axios";
import type { TokenResponse, User } from "@/types/api";

export const authService = {
  async register(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/signup", {
      email,
      password,
      display_name: displayName ?? null,
    });
    return data;
  },

  async sendOtp(email: string): Promise<void> {
    await apiClient.post("/auth/send-otp", { email });
  },

  async login(email: string, otp: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/otp-verify", {
      email,
      otp,
    });
    if (!data.access_token) {
      throw new Error("Failed to login");
    }
    return data;
  },

  async loginWithGoogle(
    email: string,
    displayName: string,
    photoUrl: string | null,
  ): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/google", {
      email,
      display_name: displayName,
      photo_url: photoUrl,
    });
    if (!data.access_token) {
      throw new Error("Failed to login with Google");
    }
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },

  async updateProfile(payload: {
    display_name?: string | null;
    gender?: string | null;
    photo_url?: string | null;
  }): Promise<User> {
    const { data } = await apiClient.patch<User>("/auth/me", payload);
    return data;
  },
};
