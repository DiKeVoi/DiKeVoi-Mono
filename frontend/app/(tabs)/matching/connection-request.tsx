import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useNegotiation, useUpdateNegotiation } from "@/hooks/useNegotiations";
import { useAuth } from "@/hooks/AuthContext";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function ConnectionRequest() {
  const safeBack = useSafeBack("/negotiations");
  const { negotiationId } = useLocalSearchParams<{ negotiationId: string }>();
  const { user } = useAuth();
  const { data: neg, isLoading, error } = useNegotiation(negotiationId ?? "");
  const { mutateAsync: updateNeg, isPending } = useUpdateNegotiation();

  const handleAccept = async () => {
    if (!neg) return;
    try {
      await updateNeg({ id: neg.id, payload: { status: "accepted" } });
      router.replace({ pathname: "/(matching)/chat", params: { negotiationId: neg.id } });
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.detail ?? "Không thể xác nhận kết nối.");
    }
  };

  const handleReject = async () => {
    if (!neg) return;
    try {
      await updateNeg({ id: neg.id, payload: { status: "rejected" } });
      router.replace("/(matching)/negotiations");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.detail ?? "Không thể hủy kết nối.");
    }
  };

  if (isLoading || !neg) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#152249" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center gap-4">
        <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
        <Text className="text-slate-500 font-medium">Không tìm thấy yêu cầu kết nối.</Text>
        <TouchableOpacity onPress={safeBack} className="px-6 py-2 bg-[#152249] rounded-full">
          <Text className="text-white font-bold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isOfferer = neg.offererUid === user?.id;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-[#F1F5F9]/50">
        <TouchableOpacity
          onPress={safeBack}
          className="w-8 h-8 items-center justify-center rounded-full active:bg-slate-50"
        >
          <MaterialIcons name="arrow-back" size={20} color="#152249" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#152249] ml-4">Yêu cầu kết nối</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Requester Info */}
        <View className="mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-1 bg-[#F9F871] rounded-full" />
            <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Thông tin người gửi
            </Text>
          </View>

          <View
            className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-2xl"
            style={{ elevation: 10, shadowColor: "#152249", shadowOpacity: 0.05, shadowRadius: 20 }}
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row flex-1 items-center">
                <View className="w-16 h-16 rounded-2xl bg-slate-200 items-center justify-center">
                  <MaterialIcons name="person" size={36} color="#94A3B8" />
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-[18px] font-bold text-[#152249] mb-2">
                    {isOfferer ? "Người đi ké" : "Người cho đi ké"}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-[#152249] px-2.5 py-1 rounded-md">
                      <Text className="text-white text-[10px] font-bold uppercase">
                        {isOfferer ? "Đi ké" : "Cho đi ké"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-[10px] font-bold text-slate-400">
                  {neg.departureTime ? formatDateTime(neg.departureTime) : "—"}
                </Text>
              </View>
            </View>

            {(neg.pickupLocation || neg.dropoffLocation) && (
              <View className="flex-row items-center pt-4 border-t border-slate-50">
                <MaterialCommunityIcons name="map-marker-outline" size={18} color="#152249" />
                <Text className="ml-2 text-[14px] text-slate-500 font-medium flex-1">
                  {neg.pickupLocation} → {neg.dropoffLocation}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Negotiation Details */}
        <View>
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-1 bg-[#152249] rounded-full" />
            <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Chi tiết thương lượng
            </Text>
          </View>

          <View className="bg-[#F3F3F4] p-6 rounded-[24px] border-2 border-dashed border-[#C6C6CF4D]">
            {neg.pickupLocation && (
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialIcons name="near-me" size={14} color="#152249" />
                <Text className="text-sm font-bold text-[#152249]">
                  {neg.pickupLocation} → {neg.dropoffLocation}
                </Text>
              </View>
            )}

            <View className="h-px bg-[#C6C6CF]/30 w-full mb-4" />

            {neg.departureTime && (
              <View>
                <Text className="text-[10px] font-bold text-[#76767F] uppercase tracking-widest mb-1">
                  Thời gian
                </Text>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="schedule" size={14} color="#152249" />
                  <Text className="text-sm font-bold text-[#1A1C1C]">
                    {formatDateTime(neg.departureTime)}
                  </Text>
                </View>
              </View>
            )}

            {neg.fare != null && (
              <View className="mt-3">
                <Text className="text-[10px] font-bold text-[#76767F] uppercase tracking-widest mb-1">
                  Chi phí dự kiến
                </Text>
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="payments" size={14} color="#152249" />
                  <Text className="text-sm font-bold text-[#1A1C1C]">
                    {neg.fare.toLocaleString("vi-VN")} ₫
                  </Text>
                </View>
              </View>
            )}

            {neg.note && (
              <View className="mt-3">
                <Text className="text-[10px] font-bold text-[#76767F] uppercase tracking-widest mb-1">
                  Ghi chú
                </Text>
                <Text className="text-sm text-slate-600">{neg.note}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions — only offerer can accept/reject a pending negotiation */}
        {isOfferer && neg.status === "pending" && (
          <View className="mb-10 mt-10">
            <TouchableOpacity
              onPress={handleAccept}
              disabled={isPending}
              activeOpacity={0.9}
              className="bg-[#F9F871] h-14 rounded-full flex-row items-center justify-center gap-3 shadow-lg"
              style={{ shadowColor: "#152249", shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#152249" />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={20} color="#152249" />
                  <Text className="text-[#152249] font-black text-base uppercase">Xác nhận kết nối</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReject}
              disabled={isPending}
              activeOpacity={0.7}
              className="mt-4 border border-slate-200 h-14 rounded-full items-center justify-center bg-white"
            >
              <Text className="text-[#152249] font-bold text-base">Từ chối</Text>
            </TouchableOpacity>
          </View>
        )}

        {neg.status === "accepted" && (
          <View className="mb-10 mt-10">
            <TouchableOpacity
              onPress={() => router.replace({ pathname: "/(matching)/chat", params: { negotiationId: neg.id } })}
              activeOpacity={0.9}
              className="bg-[#152249] h-14 rounded-full flex-row items-center justify-center gap-3"
            >
              <MaterialIcons name="chat" size={20} color="#F9F871" />
              <Text className="text-white font-black text-base uppercase">Vào thương lượng</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
