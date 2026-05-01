import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CircleCheck, CircleX, UserPlus, UserCheck, ArrowLeft, CheckCircle2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNotification } from "@/hooks/NotificationContext";
import { NotificationData } from "@/types/homeData";
import { ThemedText } from "@/components/themed-text"; // Chỉnh lại đường dẫn nếu cần

export default function AllNotificationsScreen() {
  const router = useRouter();
  
  // Lấy dữ liệu từ Context y hệt như bản popup
  const { notifications, markAllAsRead, markAsRead } = useNotification();

  // Logic chuyển trang giữ nguyên 100%
  const handlePressNotification = (item: NotificationData) => {
    markAsRead(item.id); 
    
    if (item.category === "accepted") {
      router.push({
        pathname: "/(matching)/chat/[id]",
        params: { id: item.targetId || "c1" } 
      });
    } else if (item.category === "matching") {
      router.push("/(tabs)/matching/connection-request");
    }
  };

  const renderIcon = (category?: string) => {
    switch (category) {
      case "matching":
        return (
          <View className="bg-blue-50 p-3 rounded-full">
            <UserPlus size={24} color="#2563EB" />
          </View>
        );
      case "accepted":
        return (
          <View className="bg-yellow-50 p-3 rounded-full">
            <UserCheck size={24} color="#EAB308" />
          </View>
        );
      case "failed":
        return (
          <View className="bg-red-50 p-3 rounded-full">
            <CircleX size={24} color="#EF4444" />
          </View>
        );
      case "success":
        return (
          <View className="bg-green-50 p-3 rounded-full">
            <CircleCheck size={24} color="#10B981" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100 bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-3 p-2 -ml-2 rounded-full active:bg-slate-50"
          >
            <ArrowLeft size={24} color="#152249" />
          </TouchableOpacity>
          <ThemedText className="font-bold text-xl text-[#152249]">
            Tất cả thông báo
          </ThemedText>
        </View>

        <TouchableOpacity 
          onPress={markAllAsRead}
          className="p-2 -mr-2 flex-row items-center gap-1 active:opacity-70"
        >
          <CheckCircle2 size={18} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* DANH SÁCH THÔNG BÁO */}
      <ScrollView 
        className="flex-1 bg-slate-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {notifications.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <ThemedText className="text-slate-400 font-medium mt-4">
              Bạn chưa có thông báo nào.
            </ThemedText>
          </View>
        ) : (
          notifications.map((item: NotificationData) => (
            <TouchableOpacity
              key={item.id.toString()}
              activeOpacity={0.7}
              onPress={() => handlePressNotification(item)}
              className={`flex-row items-start px-5 py-4 border-b border-slate-100 ${
                !item.read ? "bg-blue-50/30" : "bg-white"
              }`}
            >
              {renderIcon(item.category)}

              <View className="flex-1 ml-4 justify-center">
                <View className="flex-row items-start justify-between gap-2">
                  <ThemedText 
                    className={`text-[15px] leading-5 flex-1 ${
                      !item.read ? "font-bold text-[#152249]" : "font-medium text-slate-700"
                    }`}
                  >
                    {item.title}
                  </ThemedText>
                  
                  {!item.read && (
                    <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 shadow-sm" />
                  )}
                </View>
                
                <ThemedText className="text-[12px] text-slate-400 mt-1.5">
                  Vừa xong
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}