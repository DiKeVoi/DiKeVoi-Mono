import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useNegotiation } from "@/hooks/useNegotiations";
import { useRide } from "@/hooks/useRides";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatFare(fare: number): string {
  return fare.toLocaleString("vi-VN") + " ₫";
}

export default function RideConfirmedScreen() {
  const { negotiationId } = useLocalSearchParams<{ negotiationId?: string }>();
  const { data: neg, isLoading: negLoading } = useNegotiation(negotiationId ?? "");
  const { data: ride, isLoading: rideLoading } = useRide(neg?.rideId ?? "");

  const isLoading = negLoading || (!!neg?.rideId && rideLoading);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#152249" />
      </SafeAreaView>
    );
  }

  const pickup = neg?.pickupLocation ?? ride?.originLocation ?? "—";
  const dropoff = neg?.dropoffLocation ?? ride?.destinationLocation ?? "—";
  const fare = neg?.fare ?? ride?.negotiatedCost;
  const departureTime = neg?.departureTime ?? ride?.departureTime;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home")} className="mr-3">
          <MaterialIcons name="close" size={24} color="#152249" />
        </TouchableOpacity>
        <Text className="font-bold text-base text-[#152249] flex-1">Chuyến đi đã xác nhận</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 }}
      >
        {/* Success icon */}
        <View className="items-center mb-8">
          <View
            className="w-24 h-24 rounded-full bg-[#F9F871] items-center justify-center mb-4"
            style={{ shadowColor: "#F9F871", shadowOpacity: 0.5, shadowRadius: 24, elevation: 8 }}
          >
            <MaterialIcons name="check-circle" size={52} color="#152249" />
          </View>
          <Text className="text-2xl font-extrabold text-[#152249] text-center">
            Đặt chuyến thành công!
          </Text>
          <Text className="text-slate-500 text-sm mt-1 text-center">
            Cả hai đã đồng ý. Chúc chuyến đi vui vẻ!
          </Text>
        </View>

        {/* Route card */}
        <View
          className="bg-slate-50 rounded-2xl p-5 mb-4 border border-slate-200"
          style={{ shadowColor: "#152249", shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}
        >
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Lộ trình
          </Text>
          <View className="flex-row items-start gap-4">
            <View className="items-center mt-1">
              <View className="w-2.5 h-2.5 rounded-full bg-[#152249]" />
              <View className="w-px flex-1 bg-slate-300 my-1" style={{ minHeight: 24 }} />
              <View className="w-2.5 h-2.5 rounded-full border-2 border-[#152249]" />
            </View>
            <View className="flex-1 gap-5">
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm đi</Text>
                <Text className="text-sm font-bold text-[#152249] mt-0.5">{pickup}</Text>
              </View>
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm đến</Text>
                <Text className="text-sm font-bold text-[#152249] mt-0.5">{dropoff}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details row */}
        <View className="flex-row gap-3 mb-6">
          {departureTime && (
            <View className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-200 items-center gap-1">
              <MaterialIcons name="schedule" size={20} color="#152249" />
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Thời gian
              </Text>
              <Text className="text-sm font-bold text-[#152249] text-center">
                {formatDateTime(departureTime)}
              </Text>
            </View>
          )}
          {fare != null && (
            <View className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-200 items-center gap-1">
              <MaterialIcons name="payments" size={20} color="#152249" />
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Chi phí
              </Text>
              <Text className="text-sm font-bold text-[#152249] text-center">{formatFare(fare)}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          activeOpacity={0.9}
          className="w-full h-14 bg-[#F9F871] rounded-full items-center justify-center mb-3"
          style={{ shadowColor: "#F9F871", shadowOpacity: 0.4, shadowRadius: 12, elevation: 4 }}
        >
          <Text className="text-[#152249] font-black text-base">Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(matching)/negotiations")}
          activeOpacity={0.8}
          className="w-full h-12 border border-slate-200 rounded-full items-center justify-center"
        >
          <Text className="text-slate-500 font-bold text-sm">Xem tất cả thương lượng</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
