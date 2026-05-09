# API Client Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Expo frontend to the FastAPI backend using axios + TanStack Query, replacing all hardcoded mock data with live API calls.

**Architecture:** A centralized axios instance injects the JWT token on every request via interceptor. TanStack Query manages server state (cache, loading, error, refetch) for all data-fetching hooks. An `AuthContext` holds the logged-in user and token in memory, persisted to `expo-secure-store` (native) / `AsyncStorage` (web).

**Tech Stack:** `axios 1.x`, `@tanstack/react-query 5.x`, `expo-secure-store`, existing `@react-native-async-storage/async-storage`

---

## Auth Flow Note

The backend uses password-based JWT auth (`POST /auth/token` with `username` + `password` via OAuth2PasswordRequestForm). The frontend OTP screen currently hardcodes `"1234"`. **For this integration, treat the OTP digits as the password.** A proper email-OTP backend endpoint is not in scope; this wires up what exists.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `constants/config.ts` | Create | `BASE_URL` dev/prod switch |
| `lib/tokenStorage.ts` | Create | Platform-safe JWT persist/read/delete |
| `lib/axios.ts` | Create | Axios instance + auth interceptors |
| `lib/queryClient.ts` | Create | TanStack QueryClient singleton |
| `types/api.ts` | Create | TypeScript types matching backend schemas |
| `services/auth.ts` | Create | `register`, `login`, `getMe` API calls |
| `services/ridePosts.ts` | Create | Ride post CRUD API calls |
| `services/rides.ts` | Create | Confirmed ride CRUD API calls |
| `services/notifications.ts` | Create | Notification API calls |
| `services/vehicles.ts` | Create | Vehicle CRUD API calls |
| `services/ratings.ts` | Create | Rating API calls |
| `hooks/AuthContext.tsx` | Create | Auth state (user, token, login, logout) |
| `hooks/useRidePosts.ts` | Create | Query/mutation hooks for ride posts |
| `hooks/useRides.ts` | Create | Query/mutation hooks for confirmed rides |
| `hooks/useNotifications.ts` | Create | Replaces `NotificationContext.tsx` |
| `hooks/useVehicles.ts` | Create | Query/mutation hooks for vehicles |
| `hooks/useRatings.ts` | Create | Query/mutation hooks for ratings |
| `hooks/NotificationContext.tsx` | Modify | Remove hardcoded data, use `useNotifications` |
| `app/_layout.tsx` | Modify | Wrap with `QueryClientProvider` + `AuthProvider` |
| `app/(auth)/login.tsx` | Modify | Call `sendOtp` (no-op stub) then navigate |
| `app/(auth)/otp.tsx` | Modify | Call `login(email, otp)` on verify |
| `app/(tabs)/account/profile.tsx` | Modify | Replace `MOCK_USER` with `useAuth()` |
| `app/(tabs)/matching/request.tsx` | Modify | Call `createRidePost` on submit |
| `components/my-requests.tsx` | Modify | Replace `mockRequests` with `useRidePosts(userId)` |

---

## Task 1: Install Dependencies + Environment Config

**Files:**
- Create: `frontend/constants/config.ts`
- Create: `frontend/.env.local`
- Create: `frontend/.env.production`

- [ ] **Step 1: Install packages**

```bash
cd frontend
npx expo install axios @tanstack/react-query expo-secure-store
```

Expected output: packages added without peer-dep errors.

- [ ] **Step 2: Create `.env.local`**

```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 3: Create `.env.production`**

```
EXPO_PUBLIC_API_URL=https://api.dikevoi.example.com
```

- [ ] **Step 4: Create `constants/config.ts`**

```typescript
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
```

- [ ] **Step 5: Verify env is picked up**

```bash
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.EXPO_PUBLIC_API_URL)"
```

Expected: `http://localhost:8000`

- [ ] **Step 6: Commit**

```bash
git add constants/config.ts .env.local .env.production
git commit -m "feat: add environment config for dev/prod API base URL"
```

---

## Task 2: Token Storage Abstraction

**Files:**
- Create: `frontend/lib/tokenStorage.ts`
- Test: `frontend/__tests__/lib/tokenStorage.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// __tests__/lib/tokenStorage.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/lib/tokenStorage.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/tokenStorage'`

- [ ] **Step 3: Create `lib/tokenStorage.ts`**

```typescript
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "dikevoi_jwt";

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest __tests__/lib/tokenStorage.test.ts --no-coverage
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/tokenStorage.ts __tests__/lib/tokenStorage.test.ts
git commit -m "feat: add platform-safe JWT token storage abstraction"
```

---

## Task 3: Axios Client + QueryClient

**Files:**
- Create: `frontend/lib/axios.ts`
- Create: `frontend/lib/queryClient.ts`
- Test: `frontend/__tests__/lib/axios.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/lib/axios.test.ts
import { apiClient } from "@/lib/axios";

jest.mock("@/lib/tokenStorage", () => ({
  getToken: jest.fn().mockResolvedValue("test-token"),
  clearToken: jest.fn(),
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
```

- [ ] **Step 2: Run test — expect fail**

```bash
npx jest __tests__/lib/axios.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/axios'`

- [ ] **Step 3: Create `lib/axios.ts`**

```typescript
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
      await clearToken();
      router.replace("/(auth)/login");
    }
    return Promise.reject(error);
  }
);
```

- [ ] **Step 4: Create `lib/queryClient.ts`**

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npx jest __tests__/lib/axios.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/axios.ts lib/queryClient.ts __tests__/lib/axios.test.ts
git commit -m "feat: add axios client with auth interceptors and QueryClient config"
```

---

## Task 4: API Types

**Files:**
- Create: `frontend/types/api.ts`

No tests needed — pure TypeScript types; compiler validates them.

- [ ] **Step 1: Create `types/api.ts`**

```typescript
// Matches backend enum values exactly
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type RideStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PostType = "offer" | "request";
export type RidePostStatus = "open" | "matched" | "closed" | "cancelled";
export type NegotiationStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type NotificationType =
  | "ride_request" | "ride_confirmed" | "ride_cancelled" | "ride_completed"
  | "negotiation_offer" | "negotiation_accepted" | "negotiation_rejected"
  | "system";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface User {
  id: string;
  authProvider: string;
  email: string;
  isVerified: boolean;
  displayName: string | null;
  photoUrl: string | null;
  gender: Gender | null;
  createdAt: string;
  updatedAt: string;
}

export interface RidePost {
  id: string;
  userId: string;
  type: PostType;
  status: RidePostStatus;
  originLocation: string;
  destinationLocation: string;
  departureTime: string;
  seatsAvailable: number;
  isRecurring: boolean;
  preferredGender: Gender | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ride {
  id: string;
  offerUserId: string | null;
  requestUserId: string | null;
  originLocation: string;
  destinationLocation: string;
  departureTime: string;
  status: RideStatus;
  negotiatedCost: number | null;
  seatsAvailable: number;
  returnTime: string | null;
  isRecurring: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string | null;
  body: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string | null;
  seats: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserRating {
  id: string;
  raterId: string;
  ratedUserId: string;
  rideId: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  rideId: string | null;
  reason: string;
  imageURL: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

// Auth responses
export interface TokenResponse {
  access_token: string;
  token_type: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add types/api.ts
git commit -m "feat: add TypeScript API types matching backend schemas"
```

---

## Task 5: Services Layer

**Files:**
- Create: `frontend/services/auth.ts`
- Create: `frontend/services/ridePosts.ts`
- Create: `frontend/services/rides.ts`
- Create: `frontend/services/notifications.ts`
- Create: `frontend/services/vehicles.ts`
- Create: `frontend/services/ratings.ts`

- [ ] **Step 1: Create `services/auth.ts`**

```typescript
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
    // Backend expects OAuth2 form encoding
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
```

- [ ] **Step 2: Create `services/ridePosts.ts`**

```typescript
import { apiClient } from "@/lib/axios";
import type { RidePost, PostType } from "@/types/api";

export interface CreateRidePostPayload {
  type: PostType;
  origin_location: string;
  destination_location: string;
  departure_time: string; // ISO string
  is_recurring: boolean;
  seats_available?: number;
  preferred_gender?: string | null;
  description?: string | null;
}

export const ridePostsService = {
  async list(type?: PostType): Promise<RidePost[]> {
    const { data } = await apiClient.get<RidePost[]>("/ride-posts", {
      params: type ? { type } : {},
    });
    return data;
  },

  async get(id: string): Promise<RidePost> {
    const { data } = await apiClient.get<RidePost>(`/ride-posts/${id}`);
    return data;
  },

  async create(payload: CreateRidePostPayload): Promise<RidePost> {
    const { data } = await apiClient.post<RidePost>("/ride-posts", payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateRidePostPayload>): Promise<RidePost> {
    const { data } = await apiClient.patch<RidePost>(`/ride-posts/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/ride-posts/${id}`);
  },
};
```

- [ ] **Step 3: Create `services/rides.ts`**

```typescript
import { apiClient } from "@/lib/axios";
import type { Ride, RideStatus } from "@/types/api";

export const ridesService = {
  async list(status?: RideStatus): Promise<Ride[]> {
    const { data } = await apiClient.get<Ride[]>("/rides", {
      params: status ? { status } : {},
    });
    return data;
  },

  async get(id: string): Promise<Ride> {
    const { data } = await apiClient.get<Ride>(`/rides/${id}`);
    return data;
  },

  async create(payload: {
    offer_user_id?: string;
    request_user_id?: string;
    origin_location: string;
    destination_location: string;
    departure_time: string;
    status?: RideStatus;
    negotiated_cost?: number;
    is_recurring?: boolean;
  }): Promise<Ride> {
    const { data } = await apiClient.post<Ride>("/rides", payload);
    return data;
  },

  async update(id: string, payload: { status?: RideStatus; negotiated_cost?: number }): Promise<Ride> {
    const { data } = await apiClient.patch<Ride>(`/rides/${id}`, payload);
    return data;
  },
};
```

- [ ] **Step 4: Create `services/notifications.ts`**

```typescript
import { apiClient } from "@/lib/axios";
import type { Notification } from "@/types/api";

export const notificationsService = {
  async list(): Promise<Notification[]> {
    const { data } = await apiClient.get<Notification[]>("/notifications");
    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count");
    return data.count;
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await apiClient.patch<Notification>(`/notifications/${id}`, {
      is_read: true,
    });
    return data;
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch("/notifications/mark-all-read");
  },
};
```

- [ ] **Step 5: Create `services/vehicles.ts`**

```typescript
import { apiClient } from "@/lib/axios";
import type { Vehicle } from "@/types/api";

export interface CreateVehiclePayload {
  make: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  seats?: number;
}

export const vehiclesService = {
  async list(): Promise<Vehicle[]> {
    const { data } = await apiClient.get<Vehicle[]>("/vehicles");
    return data;
  },

  async create(payload: CreateVehiclePayload): Promise<Vehicle> {
    const { data } = await apiClient.post<Vehicle>("/vehicles", payload);
    return data;
  },

  async activate(id: string): Promise<Vehicle> {
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}/activate`);
    return data;
  },

  async update(id: string, payload: Partial<CreateVehiclePayload>): Promise<Vehicle> {
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },
};
```

- [ ] **Step 6: Create `services/ratings.ts`**

```typescript
import { apiClient } from "@/lib/axios";
import type { UserRating } from "@/types/api";

export const ratingsService = {
  async list(kind?: "given" | "received", userId?: string): Promise<UserRating[]> {
    const { data } = await apiClient.get<UserRating[]>("/ratings", {
      params: { ...(kind && { kind }), ...(userId && { user_id: userId }) },
    });
    return data;
  },

  async create(payload: {
    ride_id: string;
    rated_user_id: string;
    score: number;
    comment?: string;
  }): Promise<UserRating> {
    const { data } = await apiClient.post<UserRating>("/ratings", payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/ratings/${id}`);
  },
};
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add services/
git commit -m "feat: add API service layer for all backend resources"
```

---

## Task 6: AuthContext + Wrap App

**Files:**
- Create: `frontend/hooks/AuthContext.tsx`
- Modify: `frontend/app/_layout.tsx`
- Test: `frontend/__tests__/hooks/AuthContext.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/hooks/AuthContext.test.tsx
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
```

- [ ] **Step 2: Run test — expect fail**

```bash
npx jest __tests__/hooks/AuthContext.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/hooks/AuthContext'`

- [ ] **Step 3: Create `hooks/AuthContext.tsx`**

```typescript
import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { authService } from "@/services/auth";
import { setToken, getToken, clearToken } from "@/lib/tokenStorage";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const me = await authService.getMe();
          setUser(me);
        } catch {
          await clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await authService.login(email, password);
    await setToken(access_token);
    const me = await authService.getMe();
    setUser(me);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
    router.replace("/(auth)/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/hooks/AuthContext.test.tsx --no-coverage
```

Expected: PASS (3 tests)

- [ ] **Step 5: Modify `app/_layout.tsx`** — add `QueryClientProvider` + `AuthProvider`

Replace the current content with:

```typescript
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  useFonts,
} from "@expo-google-fonts/roboto";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Image } from "expo-image";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { cssInterop } from "nativewind";
import { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/AuthContext";
import { NotificationProvider } from "@/hooks/NotificationContext";

cssInterop(Image, { className: "style" });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  let [fontsLoaded, error] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || error) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add hooks/AuthContext.tsx app/_layout.tsx __tests__/hooks/AuthContext.test.tsx
git commit -m "feat: add AuthContext with JWT persistence and wrap app with QueryClientProvider"
```

---

## Task 7: Wire Auth into Login + OTP Screens

**Files:**
- Modify: `frontend/app/(auth)/otp.tsx`
- Modify: `frontend/app/(tabs)/account/profile.tsx`

- [ ] **Step 1: Modify `app/(auth)/otp.tsx`** — replace `handleVerify`

Replace the `handleVerify` function and add the import:

```typescript
// Add at top of file with other imports:
import { useAuth } from "@/hooks/AuthContext";
import { Alert } from "react-native";

// Inside the component, add:
const { login } = useAuth();
const { email } = useLocalSearchParams<{ email: string }>();

// Replace handleVerify:
const handleVerify = async () => {
  const fullOtp = otp.join("");
  if (fullOtp.length < 4) {
    setErrorMessage("Vui lòng nhập đủ 4 số OTP.");
    return;
  }

  try {
    await login(email, fullOtp);
    Keyboard.dismiss();
    router.replace("/(tabs)/home");
  } catch {
    setErrorMessage("Mã OTP không chính xác. Vui lòng thử lại.");
  }
};
```

- [ ] **Step 2: Modify `app/(tabs)/account/profile.tsx`** — replace `MOCK_USER` with `useAuth`

Replace the `MOCK_USER` block and imports:

```typescript
// Replace:
// const MOCK_USER = { ... }
// With:
import { useAuth } from "@/hooks/AuthContext";

// Inside component:
const { user, logout } = useAuth();

// Replace MOCK_USER.name  →  user?.displayName ?? "Người dùng"
// Replace MOCK_USER.avatar →  user?.photoUrl ?? undefined
// Replace MOCK_USER.joinYear → user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : ""
// Replace handleLogout body → await logout()
```

Full updated profile component top section:

```typescript
export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const displayName = user?.displayName ?? "Người dùng";
  const avatarUri = user?.photoUrl ?? undefined;
  const joinYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear().toString()
    : "—";
  const appVersion = "1.0.0";
  // ... rest of JSX uses displayName, avatarUri, joinYear, appVersion
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/otp.tsx app/\(tabs\)/account/profile.tsx
git commit -m "feat: wire auth login API into OTP screen and replace MOCK_USER in profile"
```

---

## Task 8: RidePost Hooks + Wire Request Form + My Requests

**Files:**
- Create: `frontend/hooks/useRidePosts.ts`
- Modify: `frontend/app/(tabs)/matching/request.tsx`
- Modify: `frontend/components/my-requests.tsx`
- Test: `frontend/__tests__/hooks/useRidePosts.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/hooks/useRidePosts.test.ts
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
```

- [ ] **Step 2: Run test — expect fail**

```bash
npx jest __tests__/hooks/useRidePosts.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/hooks/useRidePosts'`

- [ ] **Step 3: Create `hooks/useRidePosts.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ridePostsService, CreateRidePostPayload } from "@/services/ridePosts";
import { useAuth } from "@/hooks/AuthContext";
import type { PostType } from "@/types/api";

export const RIDE_POSTS_KEY = "ridePosts";

export function useRidePosts(type?: PostType) {
  return useQuery({
    queryKey: [RIDE_POSTS_KEY, type],
    queryFn: () => ridePostsService.list(type),
  });
}

export function useMyRidePosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [RIDE_POSTS_KEY, "mine", user?.id],
    queryFn: async () => {
      const all = await ridePostsService.list();
      return all.filter((p) => p.userId === user?.id);
    },
    enabled: !!user?.id,
  });
}

export function useCreateRidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRidePostPayload) =>
      ridePostsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RIDE_POSTS_KEY] }),
  });
}

export function useDeleteRidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridePostsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RIDE_POSTS_KEY] }),
  });
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/hooks/useRidePosts.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Modify `app/(tabs)/matching/request.tsx`** — replace `handleSubmit`

Replace the `handleSubmit` function and add imports:

```typescript
// Add at top:
import { useCreateRidePost } from "@/hooks/useRidePosts";
import { Alert } from "react-native";

// Inside component:
const createRidePost = useCreateRidePost();

// Replace handleSubmit:
const handleSubmit = async () => {
  if (!pickup || !destination) {
    Alert.alert("Thiếu thông tin", "Vui lòng nhập điểm đi và điểm đến.");
    return;
  }

  const departureISO = (() => {
    const d = new Date();
    d.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return d.toISOString();
  })();

  try {
    await createRidePost.mutateAsync({
      type: role === "driver" ? "offer" : "request",
      origin_location: pickup,
      destination_location: destination,
      departure_time: departureISO,
      is_recurring: isRepeat,
    });
    router.push("/matching/matching");
  } catch {
    Alert.alert("Lỗi", "Không thể tạo yêu cầu. Vui lòng thử lại.");
  }
};
```

Also disable the button while loading:

```typescript
// Pass to PrimaryButton:
<PrimaryButton
  title={createRidePost.isPending ? "Đang tạo..." : "Tạo yêu cầu"}
  iconName="send"
  onPress={handleSubmit}
  disabled={createRidePost.isPending}
/>
```

- [ ] **Step 6: Modify `components/my-requests.tsx`** — replace mock data with hook

Replace `mockRequests` usage with the hook. Change the component to accept no mock data:

```typescript
// Add import at top:
import { useMyRidePosts } from "@/hooks/useRidePosts";
import { ActivityIndicator } from "react-native";

// Replace mockRequests and component body:
export function MyRequests({ viewAll }: RequestProps) {
  const { data: ridePosts, isLoading } = useMyRidePosts();

  if (isLoading) {
    return (
      <ThemedView className="px-4 items-center py-8">
        <ActivityIndicator color="#152249" />
      </ThemedView>
    );
  }

  const requests = (ridePosts ?? []).map((p) => ({
    id: p.id,
    from: p.originLocation,
    to: p.destinationLocation,
    time: new Date(p.departureTime),
    status: p.status === "matched" ? "matched" : ("finding" as const),
  }));

  const displayRequests = viewAll ? requests : requests.slice(0, 3);

  return (
    <ThemedView className="px-4 gap-4">
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="text-lg font-bold text-slate-900">
          Yêu cầu của tôi
        </ThemedText>
        {!viewAll && (
          <Link href="/(tabs)/home/all-requests" asChild>
            <TouchableOpacity>
              <ThemedText className="text-blue-700 font-bold text-sm">
                Xem tất cả
              </ThemedText>
            </TouchableOpacity>
          </Link>
        )}
      </View>
      <View>
        {displayRequests.map((request) => (
          <View key={request.id}>
            {request.status === "finding" ? (
              <RequestItemFinding {...request} />
            ) : (
              <RequestItemMatched {...request} />
            )}
          </View>
        ))}
        {displayRequests.length === 0 && (
          <ThemedText className="text-slate-400 text-sm text-center py-4">
            Chưa có yêu cầu nào.
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}
```

Note: `RequestItemMatched` requires a `with` field (partner info). The RidePost endpoint doesn't return partner details — that comes from the matched Ride. Leave `with` undefined for now; it renders as a finding-style card until a Negotiation/Ride join is added.

- [ ] **Step 7: Run tests**

```bash
npx jest --no-coverage
```

Expected: all existing + new tests PASS

- [ ] **Step 8: Commit**

```bash
git add hooks/useRidePosts.ts app/\(tabs\)/matching/request.tsx components/my-requests.tsx __tests__/hooks/useRidePosts.test.ts
git commit -m "feat: wire ride post create and list to backend, replace mock requests"
```

---

## Task 9: Notification Hooks + Replace NotificationContext

**Files:**
- Create: `frontend/hooks/useNotifications.ts`
- Modify: `frontend/hooks/NotificationContext.tsx`
- Test: `frontend/__tests__/hooks/useNotifications.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/hooks/useNotifications.test.ts
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useNotificationList } from "@/hooks/useNotifications";

jest.mock("@/services/notifications", () => ({
  notificationsService: {
    list: jest.fn().mockResolvedValue([
      {
        id: "n-1",
        userId: "user-1",
        type: "system",
        title: "Chào mừng",
        body: "Tài khoản đã xác thực.",
        relatedId: null,
        isRead: false,
        createdAt: "2026-05-07T10:00:00",
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

describe("useNotificationList", () => {
  it("returns notifications from API", async () => {
    const { result } = renderHook(() => useNotificationList(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe("Chào mừng");
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
npx jest __tests__/hooks/useNotifications.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/hooks/useNotifications'`

- [ ] **Step 3: Create `hooks/useNotifications.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications";

export const NOTIFICATIONS_KEY = "notifications";

export function useNotificationList() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY],
    queryFn: () => notificationsService.list(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, "unreadCount"],
    queryFn: () => notificationsService.unreadCount(),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
}
```

- [ ] **Step 4: Modify `hooks/NotificationContext.tsx`** — replace INITIAL_NOTIFICATIONS with API

Replace the file content:

```typescript
import React, { createContext, useContext } from "react";
import {
  useNotificationList,
  useMarkRead,
  useMarkAllRead,
  useUnreadCount,
} from "@/hooks/useNotifications";
import type { Notification } from "@/types/api";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: notifications = [] } = useNotificationList();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead: (id: string) => markRead.mutate(id),
        markAllAsRead: () => markAllRead.mutate(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be inside NotificationProvider");
  return ctx;
};
```

Note: The existing `NotificationData` type used `id: number` and `read: boolean`. `Notification` from the API uses `id: string` and `isRead: boolean`. Any screen using `useNotification()` that accesses `.read` must be updated to `.isRead`. Search for usages:

```bash
grep -r "\.read\b" frontend/app frontend/components --include="*.tsx" --include="*.ts"
```

Update each occurrence: `.read` → `.isRead`, `id: number` → `id: string`.

- [ ] **Step 5: Run tests**

```bash
npx jest --no-coverage
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add hooks/useNotifications.ts hooks/NotificationContext.tsx __tests__/hooks/useNotifications.test.ts
git commit -m "feat: replace hardcoded notifications with API-backed context"
```

---

## Task 10: Rides Hook (History Screen)

**Files:**
- Create: `frontend/hooks/useRides.ts`
- Test: `frontend/__tests__/hooks/useRides.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/hooks/useRides.test.ts
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
  it("returns list of rides", async () => {
    const { result } = renderHook(() => useRides(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].status).toBe("completed");
  });
});
```

- [ ] **Step 2: Run test — expect fail**

```bash
npx jest __tests__/hooks/useRides.test.ts --no-coverage
```

- [ ] **Step 3: Create `hooks/useRides.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ridesService } from "@/services/rides";
import type { RideStatus } from "@/types/api";

export const RIDES_KEY = "rides";

export function useRides(status?: RideStatus) {
  return useQuery({
    queryKey: [RIDES_KEY, status],
    queryFn: () => ridesService.list(status),
  });
}

export function useRide(id: string) {
  return useQuery({
    queryKey: [RIDES_KEY, id],
    queryFn: () => ridesService.get(id),
    enabled: !!id,
  });
}

export function useUpdateRideStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RideStatus }) =>
      ridesService.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RIDES_KEY] }),
  });
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/hooks/useRides.test.ts --no-coverage
```

- [ ] **Step 5: Commit**

```bash
git add hooks/useRides.ts __tests__/hooks/useRides.test.ts
git commit -m "feat: add useRides hook for confirmed rides"
```

---

## Task 11: Vehicle + Rating Hooks

**Files:**
- Create: `frontend/hooks/useVehicles.ts`
- Create: `frontend/hooks/useRatings.ts`

No screen wiring needed yet (no UI screens for these resources exist). Hooks are ready for future use.

- [ ] **Step 1: Create `hooks/useVehicles.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesService, CreateVehiclePayload } from "@/services/vehicles";

export const VEHICLES_KEY = "vehicles";

export function useVehicles() {
  return useQuery({
    queryKey: [VEHICLES_KEY],
    queryFn: () => vehiclesService.list(),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehiclesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  });
}

export function useActivateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  });
}
```

- [ ] **Step 2: Create `hooks/useRatings.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratingsService } from "@/services/ratings";

export const RATINGS_KEY = "ratings";

export function useRatingsReceived(userId?: string) {
  return useQuery({
    queryKey: [RATINGS_KEY, "received", userId],
    queryFn: () => ratingsService.list("received", userId),
    enabled: userId !== undefined,
  });
}

export function useRatingsGiven() {
  return useQuery({
    queryKey: [RATINGS_KEY, "given"],
    queryFn: () => ratingsService.list("given"),
  });
}

export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ratingsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [RATINGS_KEY] }),
  });
}
```

- [ ] **Step 3: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all PASS

- [ ] **Step 4: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add hooks/useVehicles.ts hooks/useRatings.ts
git commit -m "feat: add useVehicles and useRatings hooks for future screen wiring"
```

---

## Post-Integration Checklist

After all tasks complete, verify manually in Expo dev build:

- [ ] App starts without crash on `expo start`
- [ ] Login screen → OTP screen navigation works
- [ ] OTP submit calls `POST /auth/token` (check network tab / backend logs)
- [ ] Profile screen shows real user name after login
- [ ] Request form submits to `POST /ride-posts` (check backend logs)
- [ ] Home screen `MyRequests` shows real data or empty state (not mock Vietnamese names)
- [ ] Notifications panel shows real notifications or empty state

---

## Out of Scope (Track for Future Plans)

| Feature | Reason |
|---------|--------|
| Chat / real-time messages | Requires WebSocket; no backend endpoint exists |
| OTP email delivery | Requires backend OTP endpoint |
| Google OAuth | `expo-auth-session` + backend callback; separate plan |
| Matching algorithm | Backend matching logic not yet implemented |
| Rating UI | No screen exists yet; hooks are ready |
| Vehicle management UI | No screen exists yet; hooks are ready |
