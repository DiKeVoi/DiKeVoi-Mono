import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { authService } from "@/services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!trimmedEmail.endsWith(".edu.vn")) {
      setErrorMessage(
        "Vui lòng sử dụng email có đuôi .edu.vn (ví dụ: @student.edu.vn)",
      );
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await authService.sendOtp(trimmedEmail);
      router.push({
        pathname: "/(auth)/otp",
        params: { email: trimmedEmail },
      });
    } catch {
      setErrorMessage("Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f8f6f6] dark:bg-[#221610] items-center justify-center p-4">
      <View className="w-full max-w-[480px] h-full min-h-[795px] flex-col bg-white dark:bg-slate-900 overflow-hidden rounded-xl shadow-xl">
        {/* Top App Bar / Header */}
        <View className="flex-row items-center p-4 justify-between">
          <View className="flex-1" />
        </View>

        {/* Logo Section */}
        <View className="flex-col items-center px-6 pt-4 pb-8">
          <View className="w-24 h-24 mb-6 rounded-2xl flex items-center justify-center overflow-hidden">
            <Image
              source={require("@/assets/images/dikevoi-logo.png")}
              className="w-full h-full"
              contentFit="contain"
              alt="Đi ké với Logo"
            />
          </View>
          <Text className="text-[#152249] dark:text-slate-100 text-[28px] font-bold leading-tight text-center px-4">
            Chào mừng bạn đến với Đi ké với!
          </Text>
          <Text className="text-slate-600 dark:text-slate-400 text-base font-normal mt-2 text-center">
            Cùng trường, cùng đường, cùng đi
          </Text>
        </View>

        {/* Input Section */}
        <View className="px-6 space-y-4">
          <View className="flex-col mb-4">
            <Text className="text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">
              Email sinh viên
            </Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <MaterialIcons name="mail" size={20} color="#94a3b8" />
              </View>
              <TextInput
                className={`w-full rounded-xl border ${
                  errorMessage
                    ? "border-red-500"
                    : "border-slate-200 dark:border-slate-700"
                } bg-slate-50 dark:bg-slate-800 dark:text-white h-14 pl-12 pr-4 text-base`}
                placeholder="yourname@student.edu.vn"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </View>

            {errorMessage ? (
              <Text className="text-xs text-red-500 mt-2 font-medium">
                {errorMessage}
              </Text>
            ) : (
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                * Vui lòng sử dụng email do trường cung cấp để xác thực.
              </Text>
            )}
          </View>

          {/* Main Action Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="w-full h-14 bg-[#152249] active:opacity-90 rounded-xl flex-row items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-bold text-base">
                  Tiếp tục với mã OTP
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-8 px-6">
          <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
          <Text className="px-4 text-sm text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
            Hoặc
          </Text>
          <View className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-700" />
        </View>

        {/* Secondary Action */}
        <View className="px-6 mb-8">
          <TouchableOpacity className="w-full h-14 border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 active:bg-slate-50 dark:active:bg-slate-800 flex-row items-center justify-center gap-3 rounded-xl">
            <Image
              source={require("@/assets/images/google-logo.png")}
              style={{ width: 24, height: 24 }}
            />
            <Text className="text-slate-700 dark:text-slate-300 font-semibold text-base">
              Đăng nhập với Google
            </Text>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Footer */}
        <View className="p-6 mb-4 items-center">
          <Text className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Bằng cách đăng nhập, bạn đồng ý với {"\n"}
            <Text className="text-[#152249] dark:text-[#F9F871] font-semibold">
              Điều khoản
            </Text>{" "}
            &{" "}
            <Text className="text-[#152249] dark:text-[#F9F871] font-semibold">
              Chính sách bảo mật
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
