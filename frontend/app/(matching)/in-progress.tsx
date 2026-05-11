import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRide, useFinishRide } from "@/hooks/useRides";
import { useAuth } from "@/hooks/AuthContext";
import { confirmAction } from "@/lib/confirm";
import { useSafeBack } from "@/hooks/useSafeBack";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function InProgressScreen() {
  const safeBack = useSafeBack();
  const { rideId } = useLocalSearchParams<{ rideId?: string }>();
  const { user } = useAuth();
  const { data: ride, isLoading, refetch } = useRide(rideId ?? "");
  const { mutate: finishRide, isPending: isFinishing } = useFinishRide();

  const isOfferUser = ride?.offerUserId === user?.id;
  const reportedUserId = isOfferUser ? ride?.requestUserId : ride?.offerUserId;
  const myFinished = isOfferUser ? ride?.finishedByOfferer : ride?.finishedByRequester;
  const theirFinished = isOfferUser ? ride?.finishedByRequester : ride?.finishedByOfferer;

  // Auto-navigate to payment when both confirmed
  React.useEffect(() => {
    if (ride?.status === "awaiting_payment") {
      router.replace({ pathname: "/(matching)/payment", params: { rideId: ride.id } });
    }
  }, [ride?.status]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#152249" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-slate-400 font-medium text-center">Không tìm thấy chuyến đi.</Text>
      </View>
    );
  }

  function handleFinish() {
    if (myFinished) return;
    confirmAction(
      "Xác nhận đến nơi",
      "Bạn xác nhận chuyến đi đã kết thúc?",
      () => finishRide(ride!.id, {
        onSuccess: () => refetch(),
        onError: () => Alert.alert("Lỗi", "Không thể xác nhận. Thử lại."),
      })
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* App bar */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={safeBack} className="p-1">
            <MaterialIcons name="arrow-back" size={24} color="#152249" />
          </TouchableOpacity>
          <Text className="font-bold text-lg text-[#152249]">Đang di chuyển</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(matching)/report",
              params: { rideId: ride.id, reportedUserId: reportedUserId ?? "" },
            })
          }
          className="p-1.5 bg-red-50 rounded-lg"
        >
          <MaterialIcons name="outlined-flag" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Status banner */}
        <View className="bg-[#152249] rounded-2xl p-5 mb-4 items-center">
          <View className="w-14 h-14 rounded-full bg-[#F9F871] items-center justify-center mb-3">
            <MaterialIcons name="directions-car" size={30} color="#152249" />
          </View>
          <Text className="text-white font-extrabold text-xl text-center">Chuyến đi đang diễn ra</Text>
          {ride.startedAt && (
            <Text className="text-slate-300 text-xs mt-1">Bắt đầu lúc {formatTime(ride.startedAt)}</Text>
          )}
        </View>

        {/* Route card */}
        <View className="bg-slate-50 rounded-2xl p-5 mb-4 border border-slate-100">
          <Text className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Hành trình</Text>
          <View className="flex-row items-start gap-4">
            <View className="items-center mt-1">
              <View className="w-2.5 h-2.5 rounded-full bg-[#152249]" />
              <View className="w-px h-8 bg-slate-200 my-1" />
              <View className="w-2.5 h-2.5 rounded-full border-2 border-[#152249]" />
            </View>
            <View className="flex-1 gap-y-3">
              <View>
                <Text className="text-[10px] uppercase tracking-widest text-slate-400">Điểm đi</Text>
                <Text className="font-semibold text-[#152249]" numberOfLines={1}>{ride.originLocation}</Text>
              </View>
              <View>
                <Text className="text-[10px] uppercase tracking-widest text-slate-400">Điểm đến</Text>
                <Text className="font-semibold text-[#152249]" numberOfLines={1}>{ride.destinationLocation}</Text>
              </View>
            </View>
          </View>
          {ride.negotiatedCost != null && (
            <View className="flex-row items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <MaterialIcons name="payments" size={16} color="#152249" />
              <Text className="font-bold text-[#152249]">
                {ride.negotiatedCost.toLocaleString("vi-VN")} ₫
              </Text>
            </View>
          )}
        </View>

        {/* Dual-confirm progress */}
        <View className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
          <Text className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">
            Xác nhận đến nơi
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="person" size={18} color="#152249" />
                <Text className="font-semibold text-[#152249]">Bạn</Text>
              </View>
              {myFinished ? (
                <View className="flex-row items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full">
                  <MaterialIcons name="check-circle" size={14} color="#10B981" />
                  <Text className="text-[11px] font-bold text-emerald-600">Đã xác nhận</Text>
                </View>
              ) : (
                <View className="px-3 py-1 bg-slate-100 rounded-full">
                  <Text className="text-[11px] font-bold text-slate-400">Chờ xác nhận</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="person-outline" size={18} color="#152249" />
                <Text className="font-semibold text-[#152249]">
                  {isOfferUser ? "Người đi ké" : "Tài xế"}
                </Text>
              </View>
              {theirFinished ? (
                <View className="flex-row items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full">
                  <MaterialIcons name="check-circle" size={14} color="#10B981" />
                  <Text className="text-[11px] font-bold text-emerald-600">Đã xác nhận</Text>
                </View>
              ) : (
                <View className="px-3 py-1 bg-slate-100 rounded-full">
                  <Text className="text-[11px] font-bold text-slate-400">Chờ xác nhận</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="px-4 pb-8 pt-2 border-t border-slate-100 bg-white">
        {myFinished ? (
          <View className="w-full h-14 bg-slate-100 rounded-full items-center justify-center">
            <Text className="text-slate-400 font-bold">Đã xác nhận — chờ bạn đồng hành</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleFinish}
            disabled={isFinishing}
            activeOpacity={0.85}
            className="w-full h-14 bg-[#F9F871] rounded-full items-center justify-center"
          >
            {isFinishing ? (
              <ActivityIndicator size="small" color="#152249" />
            ) : (
              <Text className="text-[#152249] font-bold text-base">Tôi đã đến nơi ✓</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
