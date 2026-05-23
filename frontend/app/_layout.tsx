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
import { queryClient } from "@/lib/queryClient";
import { NotificationProvider } from "@/hooks/NotificationContext";
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/AuthContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
Sentry.init({
  dsn: 'https://c7fa84c2b600f6fee938f559c1066615@o4511351405543424.ingest.us.sentry.io/4511351422844928',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

cssInterop(Image, { className: "style" });

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  let [fontsLoaded, error] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });
  
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_ID_CLIENT_WEB,
    });
  }, []);
  
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
              <Stack.Screen name="not-found" options={{ title: "Not Found" }} />
              <Stack.Screen name="(health)/health-check" options={{ title: "Health Check" }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
});
