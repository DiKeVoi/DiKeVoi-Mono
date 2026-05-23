import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/hooks/AuthContext";
import OnboardingScreen from "./(auth)/onboarding"; // Import trực tiếp màn hình onboarding của bạn

export default function Index() {
  const { user, isLoading } = useAuth();
  const [hasViewedOnboarding, setHasViewedOnboarding] = useState<boolean | null>(null);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái xem onboarding trong máy
    AsyncStorage.getItem("hasViewedOnboarding")
      .then((val) => {
        setHasViewedOnboarding(val === "true");
      })
      .catch(() => {
        setHasViewedOnboarding(false);
      })
      .finally(() => {
        setIsCheckingStorage(false);
      });
  }, []);

  // Hàm này sẽ được gọi khi User bấm nút "Hoàn thành" ở cuối Onboarding
  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem("hasViewedOnboarding", "true");
    setHasViewedOnboarding(true); // Cập nhật state để kích hoạt useEffect phía dưới
  };

  useEffect(() => {
    // Chỉ điều hướng khi đã check xong Storage và AuthContext đã load xong
    if (isCheckingStorage || isLoading) return;

    // Nếu ĐÃ XEM onboarding, lúc này mới tính chuyện đi Login hay đi Home
    if (hasViewedOnboarding) {
      if (!user) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(tabs)/home");
      }
    }
  }, [isCheckingStorage, isLoading, hasViewedOnboarding, user]);

  // Trong lúc đang đọc dữ liệu từ máy -> Hiện loading
  if (isCheckingStorage || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#221610]">
        <ActivityIndicator size="large" color="#152249" />
      </View>
    );
  }

  // TRƯỜNG HỢP ĐẶC BIỆT: Nếu chưa xem Onboarding -> Trả về giao diện Onboarding ngay tại đây!
  if (!hasViewedOnboarding) {
    return <OnboardingScreen onFinish={handleOnboardingComplete} />;
  }

  return null;
} 