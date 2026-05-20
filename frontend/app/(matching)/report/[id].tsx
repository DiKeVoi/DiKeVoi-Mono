import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useReport } from "@/hooks/useReports";
import { useSafeBack } from "@/hooks/useSafeBack";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: "Đang chờ xử lý", color: "text-orange-700", bg: "bg-orange-50 border-orange-100", icon: "pending-actions" },
  reviewed: { label: "Đang xem xét", color: "text-blue-700", bg: "bg-blue-50 border-blue-100", icon: "find-in-page" },
  resolved: { label: "Đã tiếp nhận xử lý", color: "text-green-700", bg: "bg-green-50 border-green-100", icon: "check-circle" },
  dismissed: { label: "Không được chấp nhận", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: "cancel" },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} Th${String(date.getMonth() + 1).padStart(2, "0")}, ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ReportDetailScreen() {
  const safeBack = useSafeBack("/account" as any);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isLoading, error } = useReport(id ?? "");

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#152249" />
      </SafeAreaView>
    );
  }

  if (error || !report) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
        <Text className="text-slate-500 mt-4 font-medium">Không tìm thấy chi tiết báo cáo.</Text>
        <TouchableOpacity onPress={safeBack} className="mt-6 px-6 py-2 bg-[#152249] rounded-full">
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusInfo = STATUS_LABELS[report.status] ?? STATUS_LABELS.pending;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100 z-50">
        <TouchableOpacity onPress={safeBack} className="mr-3 p-1 rounded-full bg-slate-50">
          <MaterialIcons name="arrow-back" size={24} color="#152249" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-[#152249]">Chi tiết báo cáo</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Status Banner */}
        <View className={`p-4 rounded-xl flex-row items-center gap-3 mb-6 border ${statusInfo.bg}`}>
          <View className="w-10 h-10 rounded-full items-center justify-center bg-white/60">
            <MaterialIcons name={statusInfo.icon as any} size={24} color="#152249" />
          </View>
          <View className="flex-1">
            <Text className={`font-bold text-base ${statusInfo.color}`}>
              {statusInfo.label}
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              Mã BC: #{report.id.slice(0, 8).toUpperCase()} • {formatDate(report.createdAt)}
            </Text>
          </View>
        </View>

        {/* Ride Info */}
        {report.rideId && (
          <>
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Chuyến đi liên quan
            </Text>
            <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-[#152249]/10 items-center justify-center">
                <MaterialIcons name="directions-car" size={20} color="#152249" />
              </View>
              <Text className="text-sm font-medium text-[#152249]">
                #{report.rideId.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </>
        )}

        {/* Report Content */}
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
          Nội dung báo cáo
        </Text>

        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <View>
            <Text className="text-xs text-slate-400 mb-1.5">Lý do / Mô tả</Text>
            <Text className="text-[14px] leading-6 text-slate-700">{report.reason}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
