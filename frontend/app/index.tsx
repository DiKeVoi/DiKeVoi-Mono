import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/hooks/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [hasViewedOnboarding, setHasViewedOnboarding] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem("hasViewedOnboarding")
      .then(setHasViewedOnboarding)
      .catch(() => setHasViewedOnboarding(null));
  }, []);

  useEffect(() => {
    if (isLoading || hasViewedOnboarding === undefined) return;

    if (hasViewedOnboarding === null) {
      router.replace("/(auth)/onboarding");
    } else if (!user) {
      router.replace("/(auth)/login");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [isLoading, user, hasViewedOnboarding]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-[#221610]">
      <ActivityIndicator size="large" color="#152249" />
    </View>
  );
}