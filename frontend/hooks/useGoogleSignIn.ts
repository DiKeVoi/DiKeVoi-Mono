import { setToken } from "@/lib/tokenStorage";
import { authService } from "@/services/auth";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useAuth } from "./AuthContext";
interface UseGoogleSignInReturn {
  isLoading: boolean;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  signInWithGoogle: () => Promise<void>;
  clearError: () => void;
}

export function useGoogleSignIn(): UseGoogleSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { fetchMe } = useAuth();
  const clearError = useCallback(() => {
    setErrorMessage("");
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();
      const userInfo = response.data;

      if (!userInfo?.user) {
        setErrorMessage("Không thể lấy thông tin từ Google. Vui lòng thử lại.");
        return;
      }

      const { email: googleEmail, name, photo } = userInfo.user;

      if (!googleEmail?.toLowerCase().endsWith(".edu.vn")) {
        await GoogleSignin.signOut();
        setErrorMessage(
          "Vui lòng sử dụng email có đuôi .edu.vn (ví dụ: @student.edu.vn) để đăng nhập.",
        );
        return;
      }

      const tokenData = await authService.loginWithGoogle(
        googleEmail,
        name ?? "",
        photo ?? null,
      );

      await setToken(tokenData.access_token);
      await fetchMe();
      router.replace("/(tabs)/home");
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      if (error?.code === statusCodes.IN_PROGRESS) {
        return;
      }
      if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage("Google Play Services không có trên thiết bị này.");
        return;
      }

      console.error("Lỗi khi đăng nhập với Google:", error);
      setErrorMessage(
        error?.message ?? "Đăng nhập thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    isLoading,
    errorMessage,
    setErrorMessage,
    signInWithGoogle,
    clearError,
  };
}
