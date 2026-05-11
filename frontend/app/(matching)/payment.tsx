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
import { useRide, useConfirmPayment } from "@/hooks/useRides";
import { useAuth } from "@/hooks/AuthContext";
import { confirmAction } from "@/lib/confirm";
import { useSafeBack } from "@/hooks/useSafeBack";

export default function PaymentScreen() {
  const safeBack = useSafeBack("/active-rides");
  const { rideId } = useLocalSearchParams<{ rideId?: string }>();
  const { user } = useAuth();
  const { data: ride, isLoading, refetch } = useRide(rideId ?? "");
  const { mutate: confirmPay, isPending: isPaying } = useConfirmPayment();

  const isOfferUser = ride?.offerUserId === user?.id;
  const reportedUserId = isOfferUser ? ride?.requestUserId : ride?.offerUserId;
  const myPaid = isOfferUser ? ride?.paidByOfferer : ride?.paidByRequester;
  const theirPaid = isOfferUser ? ride?.paidByRequester : ride?.paidByOfferer;
  const splitAmount = ride?.negotiatedCost != null ? (ride.negotiatedCost / 2) : null;

  // Auto-navigate to finish when both confirmed
  React.useEffect(() => {
    if (ride?.status === "completed") {
      router.replace({ pathname: "/(matching)/finish", params: { rideId: ride.id } });
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

  function handleConfirmPay() {
    if (myPaid) return;
    const label = isOfferUser ? "nhận tiền" : "trả tiền";
    confirmAction(
      "Xác nhận thanh toán",
      `Bạn xác nhận đã ${label}?`,
      () => confirmPay(ride!.id, {
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
          <Text className="font-bold text-lg text-[#152249]">Thanh toán</Text>
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
        {/* Amount card */}
        <View className="bg-[#152249] rounded-2xl p-6 mb-4 items-center">
          <MaterialIcons name="payments" size={32} color="#F9F871" />
          <Text className="text-slate-300 text-xs font-medium mt-2 mb-1">Chi phí chia sẻ</Text>
          {splitAmount != null ? (
            <>
              <Text className="text-white font-extrabold text-3xl">
                {splitAmount.toLocaleString("vi-VN")} ₫
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                (Tổng {ride.negotiatedCost?.toLocaleString("vi-VN")} ₫ ÷ 2)
              </Text>
            </>
          ) : (
            <Text className="text-white font-bold text-lg">Tự thỏa thuận</Text>
          )}
        </View>

        {/* Role instruction */}
        <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex-row items-start gap-3">
          <MaterialIcons name="info-outline" size={18} color="#D97706" />
          <Text className="text-amber-800 font-medium text-sm flex-1">
            {isOfferUser
              ? "Bạn là tài xế — nhận tiền từ bạn đồng hành trước khi xác nhận."
              : "Bạn là người đi ké — chuyển tiền cho tài xế trước khi xác nhận."}
          </Text>
        </View>

        {/* Payment info placeholder */}
        <View className="bg-slate-50 rounded-2xl p-5 mb-4 border border-slate-100">
          <Text className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
            Thông tin thanh toán
          </Text>
          <Text className="text-sm text-slate-500 leading-relaxed">
              Trao đổi thông tin tài khoản ngân hàng trực tiếp với nhau qua chat để thanh toán.
            </Text>
        </View>

        {/* Dual-confirm progress */}
        <View className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
          <Text className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">
            Xác nhận thanh toán
          </Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="person" size={18} color="#152249" />
                <Text className="font-semibold text-[#152249]">Bạn</Text>
              </View>
              {myPaid ? (
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
              {theirPaid ? (
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
        {myPaid ? (
          <View className="w-full h-14 bg-slate-100 rounded-full items-center justify-center">
            <Text className="text-slate-400 font-bold">Đã xác nhận — chờ bạn đồng hành</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleConfirmPay}
            disabled={isPaying}
            activeOpacity={0.85}
            className="w-full h-14 bg-[#F9F871] rounded-full items-center justify-center"
          >
            {isPaying ? (
              <ActivityIndicator size="small" color="#152249" />
            ) : (
              <Text className="text-[#152249] font-bold text-base">
                {isOfferUser ? "Tôi đã nhận tiền ✓" : "Tôi đã trả tiền ✓"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
