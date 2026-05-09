import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRides } from "@/hooks/useRides";
import { useAuth } from "@/hooks/AuthContext";
import type { Ride } from "@/types/api";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / 86_400_000);
  const timeStr = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (diff === 0) return `Hôm nay ${timeStr}`;
  if (diff === 1) return `Ngày mai ${timeStr}`;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${timeStr}`;
}

function RideCard({ ride, isOfferUser }: { ride: Ride; isOfferUser: boolean }) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
      style={{ shadowColor: "#152249", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}
    >
      {/* Role badge + time */}
      <View className="flex-row items-center justify-between mb-3">
        <View
          className={`px-2.5 py-1 rounded-lg ${isOfferUser ? "bg-[#152249]" : "bg-[#F9F871]"}`}
        >
          <Text
            className={`text-[10px] font-bold uppercase tracking-wide ${
              isOfferUser ? "text-[#F9F871]" : "text-[#152249]"
            }`}
          >
            {isOfferUser ? "Bạn cho đi ké" : "Bạn đi ké"}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MaterialIcons name="schedule" size={13} color="#94A3B8" />
          <Text className="text-xs font-bold text-slate-400">
            {formatDateTime(ride.departureTime)}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View className="mb-3 ml-0.5">
        <View className="flex-row items-center gap-3 mb-1">
          <View className="w-2 h-2 rounded-full bg-[#152249]" />
          <Text className="text-sm font-semibold text-slate-700 flex-1" numberOfLines={1}>
            {ride.originLocation}
          </Text>
        </View>
        <View className="w-px h-3 bg-slate-200 ml-[3px] mb-1" />
        <View className="flex-row items-center gap-3">
          <View className="w-2 h-2 rounded-full border-2 border-[#152249]" />
          <Text className="text-sm font-semibold text-slate-700 flex-1" numberOfLines={1}>
            {ride.destinationLocation}
          </Text>
        </View>
      </View>

      {/* Fare + status row */}
      <View className="flex-row items-center justify-between pt-3 border-t border-slate-50">
        {ride.negotiatedCost != null ? (
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="payments" size={14} color="#152249" />
            <Text className="text-sm font-bold text-[#152249]">
              {ride.negotiatedCost.toLocaleString("vi-VN")} ₫
            </Text>
          </View>
        ) : (
          <View />
        )}
        <View className="bg-emerald-50 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <Text className="text-[10px] font-bold text-emerald-700">Đã xác nhận</Text>
        </View>
      </View>
    </View>
  );
}

export default function ActiveRidesScreen() {
  const { user } = useAuth();
  const {
    data: rides,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useRides("confirmed");

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <MaterialIcons name="arrow-back" size={24} color="#152249" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-bold text-lg text-[#152249]">Chuyến đi sắp tới</Text>
          <Text className="text-xs text-slate-400 font-medium">Các chuyến đã ghép thành công</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#152249" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
          <Text className="text-slate-400 font-medium text-center">Không thể tải dữ liệu.</Text>
          <TouchableOpacity onPress={() => refetch()} className="px-6 py-2 bg-[#152249] rounded-full">
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : !rides?.length ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <View className="w-20 h-20 rounded-full bg-slate-100 items-center justify-center">
            <MaterialIcons name="directions-car" size={36} color="#CBD5E1" />
          </View>
          <Text className="text-lg font-bold text-slate-300 text-center">
            Chưa có chuyến đi nào
          </Text>
          <Text className="text-sm text-slate-400 text-center">
            Ghép chuyến thành công sẽ xuất hiện ở đây
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(matching)/browse")}
            className="mt-2 px-6 py-3 bg-[#152249] rounded-full flex-row items-center gap-2"
          >
            <MaterialIcons name="search" size={18} color="#F9F871" />
            <Text className="text-white font-bold">Tìm bạn đồng hành</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#152249" />
          }
        >
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {rides.length} chuyến đi
          </Text>
          {rides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              isOfferUser={ride.offerUserId === user?.id}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
