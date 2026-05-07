import { apiClient } from "@/lib/axios";
import type { User, TokenResponse } from "@/types/api";

export const authService = {
  async register(email: string, password: string, displayName?: string): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/signup", {
      email,
      password,
      display_name: displayName ?? null,
    });
    return data;
  },

  async login(email: string, otp: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/otp-verify", {
      email,
      otp,
    });
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
