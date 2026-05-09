import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // 1. Vào bộ nhớ tìm biến "hasViewedOnboarding"
        const hasViewedOnboarding = await AsyncStorage.getItem("hasViewedOnboarding");
        
        // 2. Giả lập check đăng nhập (Sau này bạn check Token thực tế ở đây)
        const isLoggedIn = false; 

        // 3. Quyết định luồng đi
        if (hasViewedOnboarding === null) {
          // Lần đầu tiên tải app -> Cờ chưa tồn tại -> Đi Onboarding
          router.replace("/(auth)/onboarding");
        } else if (!isLoggedIn) {
          // Đã xem Onboarding nhưng chưa đăng nhập -> Đi Login
          router.replace("/(auth)/login");
        } else {
          // Đã đăng nhập -> Vào thẳng nhà
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.log("Read hasViewed Onboading failed", error)
        // Nếu có lỗi đọc bộ nhớ, an toàn nhất là cứ đẩy ra Login
        router.replace("/(auth)/login");
      } finally {
        setIsReady(true);
      }
    };

    checkInitialRoute();
  }, []);

  // Màn hình chờ chớp nhoáng trong lúc đọc AsyncStorage
  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-[#221610]">
        <ActivityIndicator size="large" color="#152249" />
      </View>
    );
  }

  return null;
}