import axios from "axios";
import { router } from "expo-router";
import { API_BASE_URL } from "@/constants/config";
import { getToken, clearToken } from "@/lib/tokenStorage";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = await getToken();
      // Only redirect when a stored session expired — not for unauthenticated screens (e.g. onboarding).
      if (token) {
        await clearToken();
        router.replace("/(auth)/login");
      }
    }
    return Promise.reject(error);
  }
);
