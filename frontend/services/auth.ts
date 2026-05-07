import { apiClient } from "@/lib/axios";
import type { User, TokenResponse } from "@/types/api";

export const authService = {
  async register(email: string, password: string, displayName?: string): Promise<User> {
    const { data } = await apiClient.post<User>("/auth/register", {
      email,
      password,
      display_name: displayName ?? null,
    });
    return data;
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const { data } = await apiClient.post<TokenResponse>("/auth/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
