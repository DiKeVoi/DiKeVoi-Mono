import { Image } from "expo-image";
import { Bell } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Notification } from "./notification";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { usePathname } from "expo-router";
// 1. Import hook từ Context bạn vừa tạo
import { useNotification } from "@/hooks/NotificationContext"; 

export function HomeHeader() {
  const [showNoti, setShowNoti] = useState(false);
  const pathname = usePathname();
  
  // 2. Lấy biến đếm số lượng thông báo chưa đọc ra
  const { unreadCount } = useNotification(); 
  
  useEffect(() => {
    setShowNoti(false);
  }, [pathname]);
  
  return (
    <ThemedView
      className="relative px-4 pt-12 pb-4 border-b border-slate-100 flex-row items-center justify-between"
      style={{ zIndex: 1000 }}
      pointerEvents="box-none"
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
      <TouchableOpacity
        testID="notification-bell"
        activeOpacity={0.7}
        onPress={() => setShowNoti(!showNoti)}
        className="p-2 bg-slate-50 rounded-full"
      >
        <Bell size={22} color="#64748B" />
        
        {/* 3. ĐIỀU KIỆN HIỆN CHẤM ĐỎ: Chỉ render ra cục View màu đỏ này nếu unreadCount > 0 */}
        {unreadCount > 0 && (
          <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        )}
      </TouchableOpacity>

        {showNoti && (
        <View
          className="absolute"
          style={{
            top: 10, 
            right: 16, 
            width: 320,
            zIndex: 9999, 
          }}
        >
          <Notification />
        </View>
      )}

      {showNoti && (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: '1000%', 
            height: 10000,
            zIndex: 900,
          }}
          onPress={() => setShowNoti(false)}
        />
      )}
    </ThemedView>
  );
}