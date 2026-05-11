import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRides } from "@/hooks/useRides";
import { useSafeBack } from "@/hooks/useSafeBack";
import type { Ride } from "@/types/api";

function formatDepartureTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return `Hôm nay, ${timeStr}`;
  if (date.toDateString() === yesterday.toDateString()) return `Hôm qua, ${timeStr}`;
  return `${date.getDate()} Th${String(date.getMonth() + 1).padStart(2, "0")}, ${timeStr}`;
}

function RideCard({ ride }: { ride: Ride }) {
  return (
    <View className="bg-white rounded-[16px] p-4 mb-4 shadow-sm border border-slate-100">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full border border-slate-100 bg-slate-100 items-center justify-center">
            <MaterialIcons name="person" size={28} color="#94A3B8" />
          </View>
          <View>
            <Text className="font-bold text-base text-[#152249]">
              Chuyến #{ride.id.slice(0, 8)}
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              {formatDepartureTime(ride.departureTime)}
            </Text>
          </View>
        </View>

        <View
          className={`px-3 py-1 rounded-full ${
            ride.status === "completed" ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <Text
            className={`text-xs font-bold tracking-tight ${
              ride.status === "completed" ? "text-green-600" : "text-red-600"
            }`}
          >
            {ride.status === "completed" ? "Thành công" : "Đã hủy"}
          </Text>
        </View>
      </View>

      <View className="flex-col gap-3 relative ml-1">
        <View className="absolute left-[11px] top-[14px] bottom-[14px] w-0.5 bg-slate-100 z-0" />

        <View className="flex-row items-center gap-4 z-10">
          <View className="w-6 h-6 rounded-full bg-white border-2 border-[#152249] flex items-center justify-center">
            <View className="w-2 h-2 rounded-full bg-[#152249]" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] text-slate-400">Điểm đi</Text>
            <Text className="text-sm font-medium text-[#152249] mt-0.5">{ride.originLocation}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4 z-10">
          <View className="w-6 h-6 rounded-full bg-white border-2 border-[#152249] flex items-center justify-center">
            <MaterialIcons name="location-on" size={14} color="#152249" />
          </View>
          <View className="flex-1">
            <Text className="text-[11px] text-slate-400">Điểm đến</Text>
            <Text className="text-sm font-medium text-[#152249] mt-0.5">{ride.destinationLocation}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-end gap-2 mt-4 pt-3 border-t border-slate-50">
        <TouchableOpacity
          className="h-8 w-8 rounded-full bg-[#152249]/5 flex items-center justify-center"
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/(matching)/chat/[id]",
              params: { id: ride.id, readonly: "true" },
            })
          }
        >
          <MaterialIcons name="chat" size={16} color="#152249" />
        </TouchableOpacity>
        <TouchableOpacity
          className="h-8 w-8 rounded-full bg-[#152249]/5 flex items-center justify-center"
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/(matching)/report",
              params: { rideId: ride.id },
            })
          }
        >
          <MaterialIcons name="flag" size={16} color="#152249" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TripHistoryScreen() {
  const safeBack = useSafeBack("/(tabs)/account" as any);
  const [activeTab, setActiveTab] = useState<"completed" | "cancelled">("completed");
  const { data: rides, isLoading, error } = useRides();

  const filteredRides = (rides ?? []).filter((r) => r.status === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="bg-white border-b border-slate-100 z-10">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={safeBack}
            className="w-10 h-10 items-center justify-center rounded-full bg-[#152249]/5"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#152249" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#152249]">Lịch sử chuyến đi</Text>
          <View className="w-10" />
        </View>

        <View className="flex-row px-4 gap-6 pt-1">
          <TouchableOpacity
            onPress={() => setActiveTab("completed")}
            className={`py-3 ${activeTab === "completed" ? "border-b-2 border-[#152249]" : ""}`}
          >
            <Text
              className={`text-sm ${
                activeTab === "completed" ? "font-bold text-[#152249]" : "font-medium text-slate-400"
              }`}
            >
              Hoàn thành
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("cancelled")}
            className={`py-3 ${activeTab === "cancelled" ? "border-b-2 border-[#152249]" : ""}`}
          >
            <Text
              className={`text-sm ${
                activeTab === "cancelled" ? "font-bold text-[#152249]" : "font-medium text-slate-400"
              }`}
            >
              Đã hủy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#152249" />
          </View>
        ) : error ? (
          <View className="items-center justify-center py-20">
            <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
            <Text className="text-slate-400 mt-4 font-medium">Không thể tải dữ liệu.</Text>
          </View>
        ) : filteredRides.length === 0 ? (
          <View className="items-center justify-center py-20">
            <MaterialIcons name="history" size={48} color="#CBD5E1" />
            <Text className="text-slate-400 mt-4 font-medium">Chưa có chuyến đi nào.</Text>
          </View>
        ) : (
          filteredRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
