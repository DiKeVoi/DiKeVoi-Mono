import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useNegotiations } from "@/hooks/useNegotiations";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useAuth } from "@/hooks/AuthContext";
import type { Negotiation } from "@/types/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Chờ xác nhận", color: "text-orange-700", bg: "bg-orange-50" },
  accepted:  { label: "Đang thương lượng", color: "text-blue-700", bg: "bg-blue-50" },
  confirmed: { label: "Đã xác nhận", color: "text-green-700", bg: "bg-green-50" },
  rejected:  { label: "Bị từ chối", color: "text-red-600", bg: "bg-red-50" },
  cancelled: { label: "Đã hủy", color: "text-slate-500", bg: "bg-slate-100" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
}

function NegotiationCard({ neg, userId }: { neg: Negotiation; userId: string }) {
  const isOfferer = neg.offererUid === userId;
  const cfg = STATUS_CONFIG[neg.status] ?? STATUS_CONFIG.pending;

  const handleTap = () => {
    if (neg.status === "pending" && !isOfferer) return; // requester waits
    if (neg.status === "pending" && isOfferer) {
      router.push({ pathname: "/(tabs)/matching/connection-request", params: { negotiationId: neg.id } });
    } else if (neg.status === "accepted" || neg.status === "confirmed") {
      router.push({ pathname: "/(matching)/chat", params: { negotiationId: neg.id } });
    }
  };

  const canTap = !(neg.status === "pending" && !isOfferer);

  return (
    <TouchableOpacity
      activeOpacity={canTap ? 0.7 : 1}
      onPress={handleTap}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-full bg-[#152249]/10 items-center justify-center">
            <MaterialIcons name={isOfferer ? "directions-car" : "person"} size={20} color="#152249" />
          </View>
          <View>
            <Text className="font-bold text-[#152249] dark:text-white text-sm">
              {isOfferer ? "Người xin đi ké" : "Người cho đi ké"}
            </Text>
            <Text className="text-[10px] text-slate-400">{formatDate(neg.createdAt)}</Text>
          </View>
        </View>

        <View className={`px-3 py-1 rounded-full ${cfg.bg}`}>
          <Text className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</Text>
        </View>
      </View>

      {(neg.pickupLocation || neg.dropoffLocation) && (
        <View className="flex-row items-center gap-2 mb-2">
          <MaterialIcons name="location-on" size={14} color="#64748B" />
          <Text className="text-xs text-slate-500 flex-1" numberOfLines={1}>
            {neg.pickupLocation} → {neg.dropoffLocation}
          </Text>
        </View>
      )}

      {neg.fare != null && (
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="payments" size={14} color="#64748B" />
          <Text className="text-xs text-slate-500">
            {neg.fare.toLocaleString("vi-VN")} ₫
          </Text>
        </View>
      )}

      {neg.status === "pending" && !isOfferer && (
        <Text className="text-[11px] text-slate-400 mt-2 italic">
          Đang chờ người cho đi ké xác nhận...
        </Text>
      )}

      {canTap && neg.status !== "rejected" && neg.status !== "cancelled" && (
        <View className="flex-row items-center justify-end mt-2">
          <Text className="text-xs font-bold text-[#152249]">Xem chi tiết</Text>
          <MaterialIcons name="chevron-right" size={16} color="#152249" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function NegotiationsScreen() {
  const safeBack = useSafeBack("/browse");
  const { user } = useAuth();
  const { data: negotiations, isLoading, error, refetch } = useNegotiations();

  const active = (negotiations ?? []).filter((n) => ["pending", "accepted"].includes(n.status));
  const history = (negotiations ?? []).filter((n) => ["confirmed", "rejected", "cancelled"].includes(n.status));

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <TouchableOpacity onPress={safeBack} className="mr-3 p-1">
          <MaterialIcons name="arrow-back" size={24} color="#152249" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-[#152249] dark:text-white flex-1">Yêu cầu kết nối</Text>
        <TouchableOpacity onPress={() => refetch()} className="p-1">
          <MaterialIcons name="refresh" size={22} color="#152249" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#152249" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-3">
          <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
          <Text className="text-slate-400 font-medium">Không thể tải dữ liệu.</Text>
          <TouchableOpacity onPress={() => refetch()} className="px-6 py-2 bg-[#152249] rounded-full">
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {active.length > 0 && (
            <>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Đang hoạt động</Text>
              {active.map((neg) => (
                <NegotiationCard key={neg.id} neg={neg} userId={user?.id ?? ""} />
              ))}
            </>
          )}

          {history.length > 0 && (
            <>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4">Lịch sử</Text>
              {history.map((neg) => (
                <NegotiationCard key={neg.id} neg={neg} userId={user?.id ?? ""} />
              ))}
            </>
          )}

          {active.length === 0 && history.length === 0 && (
            <View className="items-center py-20 gap-3">
              <MaterialIcons name="inbox" size={48} color="#CBD5E1" />
              <Text className="text-slate-400 font-medium text-center">
                Chưa có yêu cầu nào.{"\n"}Tìm bạn đồng hành và kết nối!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
