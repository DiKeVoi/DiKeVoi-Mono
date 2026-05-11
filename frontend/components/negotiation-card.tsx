import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Negotiation } from "@/types/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: "Chờ xác nhận", color: "#C2410C", bg: "bg-orange-50", icon: "time-outline" },
  accepted:  { label: "Đang thương lượng", color: "#1D4ED8", bg: "bg-blue-50", icon: "chatbubbles-outline" },
  confirmed: { label: "Đã xác nhận", color: "#15803D", bg: "bg-green-50", icon: "checkmark-circle-outline" },
  rejected:  { label: "Bị từ chối", color: "#DC2626", bg: "bg-red-50", icon: "close-circle-outline" },
  cancelled: { label: "Đã hủy", color: "#64748B", bg: "bg-slate-100", icon: "ban-outline" },
};
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface NegotiationCardProps {
  neg: Negotiation;
  userId: string;
}

export const NegotiationCard = ({ neg, userId }: NegotiationCardProps) => {
  const config = STATUS_CONFIG[neg.status] || STATUS_CONFIG.pending;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/(matching)/chat", params: { negotiationId: neg.id } })}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className={`px-3 py-1 rounded-full flex-row items-center ${config.bg}`}>
          <Ionicons name={config.icon as any} size={14} color={config.color} />
          <Text className="ml-1 text-[12px] font-bold" style={{ color: config.color }}>
            {config.label}
          </Text>
        </View>
        <Text className="text-blue-600 font-bold text-lg">
          {neg.fare?.toLocaleString("vi-VN")}đ
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
        <Text className="text-slate-700 flex-1 font-medium" numberOfLines={1}>
          Từ: {neg.pickupLocation || "Chưa cập nhật"}
        </Text>
      </View>

      <View className="flex-row items-center mb-3">
        <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
        <Text className="text-slate-700 flex-1 font-medium" numberOfLines={1}>
          Đến: {neg.dropoffLocation || "Chưa cập nhật"}
        </Text>
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
        <View className="flex-row items-center">
          <MaterialIcons name="event" size={16} color="#94A3B8" />
          <Text className="ml-1 text-slate-500 text-xs">
            {neg.departureTime ? formatDate(neg.departureTime) : "Thời gian linh hoạt"}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
};