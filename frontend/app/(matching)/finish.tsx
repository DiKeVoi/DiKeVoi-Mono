import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useRide } from "@/hooks/useRides";
import { useAuth } from "@/hooks/AuthContext";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function FinishScreen() {
  const { rideId } = useLocalSearchParams<{ rideId?: string }>();
  const { user } = useAuth();
  const { data: ride, isLoading } = useRide(rideId ?? "");

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#152249" />
      </View>
    );
  }

  const isOfferUser = ride?.offerUserId === user?.id;

  return (
    <View className="flex-1 bg-white">
      {/* App bar */}
      <View className="bg-white pt-12 pb-4 px-6 flex-row items-center justify-between shadow-sm">
        <Image
          source={require("@/assets/images/dikevoi-logo.png")}
          style={{ width: 50, height: 40 }}
          contentFit="contain"
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(matching)/report",
              params: { rideId: rideId ?? "" },
            })
          }
          className="p-2 rounded-full active:bg-slate-100"
        >
          <MaterialIcons name="flag" size={22} color="#ba1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
      >
        {/* Status header */}
        <View className="items-center py-4 mb-8">
          <View className="w-20 h-20 rounded-full bg-[#F9F871] items-center justify-center shadow-sm mb-6">
            <MaterialIcons name="check-circle" size={48} color="#152249" />
          </View>
          <Text className="text-2xl font-extrabold text-[#152249] tracking-tight text-center">
            Chuyến đi hoàn tất
          </Text>
          <Text className="text-[#45464e] font-medium mt-1 text-center">
            Cảm ơn bạn đã sử dụng Đi ké với!
          </Text>
        </View>

        <View className="gap-4">
          {/* Route card */}
          <View className="bg-[#f3f3f4] p-6 rounded-2xl border border-slate-200/50">
            <View className="flex-row items-start gap-4">
              <View className="items-center mt-1.5">
                <View className="w-3 h-3 rounded-full bg-[#152249]" />
                <View className="w-0.5 h-10 bg-slate-300 my-1" />
                <View className="w-3 h-3 rounded-full border-2 border-[#152249]" />
              </View>
              <View className="flex-1 gap-y-4">
                <View>
                  <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e]">
                    Điểm đi
                  </Text>
                  <Text className="font-bold text-[#152249] text-base">
                    {ride?.originLocation ?? "—"}
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e]">
                    Điểm đến
                  </Text>
                  <Text className="font-bold text-[#152249] text-base">
                    {ride?.destinationLocation ?? "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ride details */}
          {(ride?.departureTime || ride?.negotiatedCost != null) && (
            <View className="bg-[#f3f3f4] p-5 rounded-2xl border border-slate-200/50 gap-3">
              {ride?.departureTime && (
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="schedule" size={16} color="#152249" />
                  <View>
                    <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e]">
                      Thời gian
                    </Text>
                    <Text className="font-bold text-[#152249]">
                      {formatDateTime(ride.departureTime)}
                    </Text>
                  </View>
                </View>
              )}
              {ride?.negotiatedCost != null && (
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="payments" size={16} color="#152249" />
                  <View>
                    <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e]">
                      Chi phí
                    </Text>
                    <Text className="font-bold text-[#152249]">
                      {ride.negotiatedCost.toLocaleString("vi-VN")} ₫
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Companion */}
          <View className="bg-[#f3f3f4] p-5 rounded-2xl border border-slate-200/50">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e] mb-4">
              Người đồng hành
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center border border-slate-300">
                <MaterialIcons name="person" size={26} color="#94A3B8" />
              </View>
              <View>
                <Text className="font-bold text-[#152249] text-base leading-tight">
                  {isOfferUser ? "Người đi ké" : "Người cho đi ké"}
                </Text>
                <Text className="text-xs text-[#45464e] font-medium">Bạn đường của bạn</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View className="mt-12 gap-4">
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            activeOpacity={0.9}
            className="w-full h-16 bg-[#F9F871] rounded-full items-center justify-center shadow-md"
          >
            <Text className="text-[#152249] font-bold text-lg">Hoàn thành</Text>
          </TouchableOpacity>
          <Text className="text-center text-xs text-[#45464e] px-8 leading-relaxed">
            Bằng cách nhấn hoàn thành, bạn xác nhận chuyến đi đã kết thúc an toàn.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
