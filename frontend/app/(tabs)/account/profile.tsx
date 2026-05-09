import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import { useAuth } from "@/hooks/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  console.log("User in Profile:", user);
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

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="bg-[#152249] pt-14 pb-16 px-6 rounded-b-3xl items-center shadow-lg">
          <ThemedText className="text-white text-xl font-bold">
            Tài khoản
          </ThemedText>
        </View>

        {/* Profile Summary */}
        <View className="px-6 -mt-10">
          <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 items-center">
            
            {/* Avatar */}
            <View className="relative">
              <Image
                source={{ uri: avatarUri }}
                className="h-28 w-28 rounded-full border-4 border-[#F9F871]"
                contentFit="cover"
              />
              <TouchableOpacity 
                activeOpacity={0.8}
                className="absolute bottom-1 right-1 bg-[#F9F871] rounded-full p-1.5 border-2 border-white dark:border-slate-800"
              >
                <MaterialIcons name="edit" size={16} color="#152249" />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View className="items-center mt-4">
              <ThemedText className="text-2xl font-bold text-slate-900 dark:text-white">
                {displayName}
              </ThemedText>
              <View className="flex-row items-center mt-1">
                <MaterialIcons name="stars" size={16} color="#F9F871" />
                <ThemedText className="text-sm text-slate-500 dark:text-slate-400 ml-1 font-medium">
                  Thành viên từ {joinYear}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Menu List */}
        <View className="px-4 mt-6 gap-3">
          
          {/* Item 1: Thông tin cá nhân */}
          <TouchableOpacity 
            activeOpacity={0.7}
            className="flex-row items-center gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm border border-slate-50 dark:border-slate-700/50"
            onPress = {() => router.push("/(tabs)/account/Info")}
          >
            <View className="w-10 h-10 rounded-lg bg-[#152249]/10 dark:bg-[#F9F871]/10 items-center justify-center">
              <MaterialIcons name="person" size={24} color="#152249" />
            </View>
            <View className="flex-1">
              <ThemedText 
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                Thông tin cá nhân
              </ThemedText>
              <ThemedText className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cập nhật hồ sơ và bảo mật
              </ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>

          {/* Item 2: Lịch sử chuyến đi */}
          <TouchableOpacity 
            activeOpacity={0.7}
            className="flex-row items-center gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm border border-slate-50 dark:border-slate-700/50"
            onPress = {() => router.push("/(tabs)/account/history")}
          >
            <View className="w-10 h-10 rounded-lg bg-[#152249]/10 dark:bg-[#F9F871]/10 items-center justify-center">
              <MaterialIcons name="history" size={24} color="#152249" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-base font-bold text-slate-900 dark:text-slate-100">
                Lịch sử chuyến đi
              </ThemedText>
              <ThemedText className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xem lại các chuyến đã đi
              </ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>

        </View>

        {/* Logout Button */}
        <View className="p-6 mt-2">
          <TouchableOpacity 
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 py-4 rounded-xl border border-transparent"
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <ThemedText className="text-red-500 dark:text-red-400 font-bold text-base">
              Đăng xuất
            </ThemedText>
          </TouchableOpacity>
          
          <ThemedText className="text-center text-slate-400 text-xs mt-6">
            Phiên bản {appVersion} • Đi ké với! © 2026
          </ThemedText>
        </View>

      </ScrollView>
    </ThemedView>
  );
}