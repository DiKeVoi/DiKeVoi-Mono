import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";

const MOCK_REPORTS = [
  {
    id: "r1",
    tripId: "t1",
    status: "pending",
    reportedUser: {
      name: "Nguyễn Văn An",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCLsY8nPu3Dw3HGBkuRfgpS5b4aEzczi4UrqogNLZM5IGwJ_YxSeD_46kJtJ3YCQw9WinQfFpbjMXPK4n4VSQTty7CeAMjudRVY9o7jrmvx5PcQEJo5breiG2d5vQXF3HydWH4EbiS7H-wopgnjc08xtI2AOXy9ing0PRLygh5QF7-MIVGcMuH3Qwce_6sSyJNXdPDUYbvKez6DZpr-NlKQspYudvgaySUceMKEkrRIZNIGvFeA0xDvcketGmfejw1uFVBwbuxEZQ",
    },
    reason: "Hành vi thiếu chuẩn mực",
    description: "Bạn này đến trễ 20 phút so với giờ đã hẹn mà không nhắn tin báo trước. Quá trình đi xe chạy khá ẩu và lạng lách.",
    createdAt: "Hôm qua, 19:15",
  },
  {
    id: "r2",
    tripId: "t3",
    status: "resolved",
    reportedUser: {
      name: "Trần Hoàng Nam",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEMLyvp7wsndnc3O7hWHfMCivorM_UrEv7YX91yAfqi-_OfpNf8xufW_COcMZGBrJ5Tzs9ucPi_gRZTaWgOBMfYSmi0Koub8nZ4RwFPDoQc8ytQ7iSSU9xgqiPInjBhYegpHY9PKXzcaL6WBBfxXY4G1dq7jSvl-k0UMvuNTiex3_n8qvh467-zvj0OesEzUgKoGSy3CYIoq75d0gmTJ3rGKoWO4mrEOkTJILoRHlqQivef70TIe3OafoC29v0ulxx4opCwEhjaZM",
    },
    reason: "Hủy chuyến không lý do",
    description: "Đã sát giờ đi nhưng bạn Nam tự ý hủy chuyến mà không đưa ra lý do nào, làm mình bị trễ giờ học.",
    createdAt: "12 Th05, 14:05",
  }
];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const report = MOCK_REPORTS.find((r) => r.id === id);

  if (!report) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
        <Text className="text-slate-500 mt-4 font-medium">Không tìm thấy chi tiết báo cáo.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 px-6 py-2 bg-[#152249] rounded-full">
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isPending = report.status === "pending";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100 z-50">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 rounded-full bg-slate-50">
          <MaterialIcons name="arrow-back" size={24} color="#152249" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-[#152249]">Chi tiết báo cáo</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className={`p-4 rounded-xl flex-row items-center gap-3 mb-6 ${isPending ? 'bg-orange-50 border border-orange-100' : 'bg-green-50 border border-green-100'}`}>
          <View className={`w-10 h-10 rounded-full items-center justify-center ${isPending ? 'bg-orange-100' : 'bg-green-100'}`}>
            <MaterialIcons name={isPending ? "pending-actions" : "check-circle"} size={24} color={isPending ? "#EA580C" : "#16A34A"} />
          </View>
          <View className="flex-1">
            <Text className={`font-bold text-base ${isPending ? 'text-orange-700' : 'text-green-700'}`}>
              {isPending ? "Đang chờ xử lý" : "Đã tiếp nhận xử lý"}
            </Text>
            <Text className={`text-xs mt-0.5 ${isPending ? 'text-orange-600/80' : 'text-green-600/80'}`}>
              Mã BC: #{report.id.toUpperCase()} • {report.createdAt}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Đối tượng bị báo cáo</Text>

        <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex-row items-center gap-4">
          <Image source={{ uri: report.reportedUser.avatar }} className="w-14 h-14 rounded-full bg-slate-100 border border-slate-50" />
          <View className="flex-1">
            <Text className="font-bold text-base text-[#152249]">{report.reportedUser.name}</Text>
            <Text className="text-xs text-slate-500 mt-1">Bạn đi cùng chuyến • ID: {report.tripId}</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Nội dung báo cáo</Text>

        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <View className="mb-4">
            <Text className="text-xs text-slate-400 mb-1">Lý do báo cáo</Text>
            <Text className="text-[15px] font-bold text-[#152249]">{report.reason}</Text>
          </View>
          
          <View className="h-[1px] bg-slate-50 w-full mb-4" />
          
          <View>
            <Text className="text-xs text-slate-400 mb-1.5">Mô tả chi tiết</Text>
            <Text className="text-[14px] leading-6 text-slate-700">{report.description}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}