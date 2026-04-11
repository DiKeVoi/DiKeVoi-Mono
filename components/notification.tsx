import { NotificationData } from "@/types/homeData";
import { CircleCheck, CircleX, UserPlus } from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export function Notification() {
  const mockNotification: NotificationData[] = [
    {
      id: 1,
      title: "Nguyễn Văn A yêu cầu kết nối với bạn",
      time: new Date(),
      read: false,
      category: "matching",
    },
    {
      id: 2,
      title: "Bạn đã hoàn thành chuyến đi với Nguyễn Văn A",
      time: new Date(),
      read: false,
      category: "success",
    },
    {
      id: 3,
      title: "Nguyễn Văn A đã hủy chuyến đi với bạn.",
      time: new Date(),
      read: false,
      category: "failed",
    },
  ];

  // Hàm helper để render Icon dựa trên loại thông báo
  const renderIcon = (category: string) => {
    switch (category) {
      case "matching":
        return (
          <View className="bg-blue-50 p-2 rounded-full">
            <UserPlus size={20} color="#2563EB" />
          </View>
        );
      case "failed":
        return (
          <View className="bg-red-50 p-2 rounded-full">
            <CircleX size={20} color="#EF4444" />
          </View>
        );
      case "success":
        return (
          <View className="bg-green-50 p-2 rounded-full">
            <CircleCheck size={20} color="#10B981" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    /* Container*/
    <ThemedView
      className="absolute top-16 right-4 left-4 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      style={{
        zIndex: 999,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-50">
        <ThemedText className="text-sm font-bold tracking-widest text-slate-800">
          THÔNG BÁO
        </ThemedText>
        <ThemedText className="text-[10px] font-bold text-slate-400">
          {mockNotification.length} MỚI
        </ThemedText>
      </View>

      {/* Notification */}
      <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
        {mockNotification.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            className={`flex-row items-start px-6 py-5 ${index !== mockNotification.length - 1 ? "border-b border-slate-50" : ""}`}
          >
            {renderIcon(item.category)}

            <View className="flex-1 ml-4">
              <ThemedText className="text-[14px] leading-5 text-slate-700">
                <ThemedText className="font-bold">{item.title}</ThemedText>
              </ThemedText>
              <ThemedText className="text-[12px] text-slate-400 mt-1">
                Vừa xong
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer Button */}
      <TouchableOpacity className="py-4 items-center border-t border-slate-50">
        <ThemedText className="text-sm font-bold text-slate-800">
          Đánh dấu đã đọc tất cả
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
