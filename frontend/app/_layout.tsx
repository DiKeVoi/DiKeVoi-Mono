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
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 1. Nhóm màn hình chưa đăng nhập (Onboarding, Login) */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* 2. Nhóm màn hình chính có thanh Tab Bar (Trang chủ, Matching, Tài khoản) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Màn hình modal cũ của bạn - cứ giữ lại nếu sau này cần dùng */}
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}