import { Image } from "expo-image";
import { Bell } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Notification } from "./notification";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function HomeHeader() {
  const [showNoti, setShowNoti] = useState(false);

  return (
    <ThemedView
      className="relative px-4 pt-12 pb-4 border-b border-slate-100 flex-row items-center justify-between"
      style={{ zIndex: 1000 }}
    >
      {/* Logo & Brand Section */}
      <View className="flex-row items-center">
        <Image
          source={require("@/assets/images/dikevoi-logo.png")}
          style={{ width: 48, height: 48 }}
          contentFit="contain"
        />

        <View className="ml-3">
          <ThemedText className="text-[16px] font-bold uppercase tracking-wider text-slate-900">
            Đi ké với!
          </ThemedText>
          <ThemedText className="text-[11px] text-slate-500 font-medium">
            Cùng trường, cùng đường, cùng đi
          </ThemedText>
        </View>
      </View>

      {/* Notification Bell Section */}
      <View className="relative">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowNoti(!showNoti)}
          className="p-2 bg-slate-50 rounded-full"
          testID="notification-bell"
        >
          <Bell size={22} color="#64748B" />

          <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        </TouchableOpacity>

        {showNoti && (
          <View
            className="absolute"
            style={{
              top: -20,
              right: -20,
              width: 320,
              zIndex: 9999,
            }}
          >
            <Notification />
          </View>
        )}
      </View>

      {showNoti && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            bottom: -1000,
            left: -1000,
            right: -1000,
            zIndex: 900,
          }}
          onPress={() => setShowNoti(false)}
        />
      )}
    </ThemedView>
  );
}
