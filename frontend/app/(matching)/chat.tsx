import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useNegotiation, useUpdateNegotiation, useConfirmNegotiation } from "@/hooks/useNegotiations";
import { useAuth } from "@/hooks/AuthContext";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatFare(fare: number): string {
  return fare.toLocaleString("vi-VN") + " ₫";
}

export default function ChatScreen() {
  const { negotiationId } = useLocalSearchParams<{ negotiationId?: string }>();
  const { user } = useAuth();

  const { data: neg, isLoading } = useNegotiation(negotiationId ?? "");
  const { mutateAsync: updateNeg, isPending: isUpdating } = useUpdateNegotiation();
  const { mutateAsync: confirmNeg, isPending: isConfirming } = useConfirmNegotiation();

  const [fare, setFare] = useState("");
  const [note, setNote] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [showProposeForm, setShowProposeForm] = useState(false);

  useEffect(() => {
    if (neg) {
      setFare(neg.fare != null ? String(neg.fare) : "");
      setNote(neg.note ?? "");
      setDepartureTime(neg.departureTime ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neg?.id]);

  const isOfferer = neg?.offererUid === user?.id;
  const myId = user?.id ?? "";
  const myConfirmed = isOfferer ? neg?.confirmedByOfferer : neg?.confirmedByRequester;
  const theirConfirmed = isOfferer ? neg?.confirmedByRequester : neg?.confirmedByOfferer;
  const iProposed = neg?.lastEditedBy === myId;
  const theyProposed = neg?.lastEditedBy != null && neg?.lastEditedBy !== myId;

  const handlePropose = async () => {
    if (!neg) return;
    const parsedFare = fare ? parseInt(fare, 10) : undefined;
    if (fare && (isNaN(parsedFare!) || parsedFare! <= 0)) {
      Alert.alert("Lỗi", "Giá không hợp lệ.");
      return;
    }
    try {
      await updateNeg({
        id: neg.id,
        payload: {
          fare: parsedFare,
          note: note || undefined,
          departure_time: departureTime || undefined,
        },
      });
      setShowProposeForm(false);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.detail ?? "Không thể gửi đề xuất.");
    }
  };

  const handleConfirm = async () => {
    if (!neg) return;
    try {
      const updated = await confirmNeg(neg.id);
      if (updated.rideId) {
        router.replace({ pathname: "/(matching)/ride-confirmed" as any, params: { negotiationId: neg.id } });
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.detail ?? "Không thể xác nhận.");
    }
  };

  const handleCancel = async () => {
    if (!neg) return;
    Alert.alert("Hủy thương lượng", "Bạn có chắc muốn hủy?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy",
        style: "destructive",
        onPress: async () => {
          try {
            await updateNeg({ id: neg.id, payload: { status: "cancelled" } });
            router.replace("/(matching)/negotiations");
          } catch {
            Alert.alert("Lỗi", "Không thể hủy.");
          }
        },
      },
    ]);
  };

  if (isLoading || !neg) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#152249" />
      </SafeAreaView>
    );
  }

  const isConfirmed = neg.status === "confirmed";

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100 z-50">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={26} color="#152249" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-bold text-base text-[#152249]">
              {isOfferer ? "Người đi ké" : "Người cho đi ké"}
            </Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isConfirmed ? "Đã xác nhận chuyến" : "Đang thương lượng"}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
            <MaterialIcons name={isOfferer ? "person" : "directions-car"} size={20} color="#64748B" />
          </View>
        </View>

        {/* Dual-confirm progress */}
        <View className="bg-white px-4 pt-3 pb-4 border-b border-slate-100">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Xác nhận chuyến đi
            </Text>
            <Text className="text-[11px] font-bold text-slate-400">
              {[myConfirmed, theirConfirmed].filter(Boolean).length}/2
            </Text>
          </View>
          <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-[#152249] rounded-full"
              style={{
                width:
                  myConfirmed && theirConfirmed
                    ? "100%"
                    : myConfirmed || theirConfirmed
                    ? "50%"
                    : "0%",
              }}
            />
          </View>
          <View className="flex-row gap-4 mt-2">
            <View className="flex-row items-center gap-1.5">
              <View
                className={`w-4 h-4 rounded-full items-center justify-center ${
                  myConfirmed ? "bg-green-500" : "bg-slate-200"
                }`}
              >
                <MaterialIcons name="check" size={10} color="#fff" />
              </View>
              <Text className="text-[11px] text-slate-500 font-medium">Bạn</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View
                className={`w-4 h-4 rounded-full items-center justify-center ${
                  theirConfirmed ? "bg-green-500" : "bg-slate-200"
                }`}
              >
                <MaterialIcons name="check" size={10} color="#fff" />
              </View>
              <Text className="text-[11px] text-slate-500 font-medium">Người kia</Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Route card */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Lộ trình
            </Text>
            <View className="flex-row items-center gap-2 mb-1.5">
              <View className="w-2 h-2 rounded-full bg-[#152249]" />
              <Text className="text-sm font-semibold text-[#152249] flex-1" numberOfLines={1}>
                {neg.pickupLocation ?? "—"}
              </Text>
            </View>
            <View className="w-px h-3 bg-slate-200 ml-[3px] mb-1.5" />
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full border-2 border-[#152249]" />
              <Text className="text-sm font-semibold text-[#152249] flex-1" numberOfLines={1}>
                {neg.dropoffLocation ?? "—"}
              </Text>
            </View>
          </View>

          {/* Price negotiation */}
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Thương lượng giá
          </Text>

          {/* Current proposal state */}
          {neg.fare != null && (
            <View
              className={`rounded-2xl p-4 mb-3 border ${
                theyProposed
                  ? "bg-amber-50 border-amber-200"
                  : iProposed
                  ? "bg-blue-50 border-blue-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      theyProposed ? "text-amber-600" : iProposed ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {theyProposed ? "Người kia đề xuất" : iProposed ? "Bạn đề xuất" : "Giá hiện tại"}
                  </Text>
                  <Text className="text-2xl font-black text-[#152249]">
                    {formatFare(neg.fare)}
                  </Text>
                </View>
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    theyProposed ? "bg-amber-100" : iProposed ? "bg-blue-100" : "bg-slate-100"
                  }`}
                >
                  <MaterialIcons
                    name="payments"
                    size={20}
                    color={theyProposed ? "#D97706" : iProposed ? "#2563EB" : "#64748B"}
                  />
                </View>
              </View>

              {theyProposed && (
                <Text className="text-xs text-amber-700 mt-2 font-medium">
                  Bạn có thể chấp nhận hoặc đề xuất giá khác bên dưới.
                </Text>
              )}
              {iProposed && (
                <Text className="text-xs text-blue-700 mt-2 font-medium">
                  Đang chờ phản hồi từ người kia...
                </Text>
              )}
            </View>
          )}

          {neg.fare == null && (
            <View className="bg-slate-50 rounded-2xl p-4 mb-3 border border-dashed border-slate-300 items-center">
              <MaterialIcons name="payments" size={28} color="#CBD5E1" />
              <Text className="text-slate-400 text-sm font-medium mt-2 text-center">
                Chưa có đề xuất giá — hãy bắt đầu thương lượng
              </Text>
            </View>
          )}

          {/* Propose / counter form */}
          {!isConfirmed && (
            <>
              {!showProposeForm ? (
                <TouchableOpacity
                  onPress={() => setShowProposeForm(true)}
                  activeOpacity={0.8}
                  className="flex-row items-center justify-center gap-2 border border-[#152249] rounded-xl h-11 mb-4"
                >
                  <MaterialIcons name="edit" size={16} color="#152249" />
                  <Text className="text-[#152249] font-bold text-sm">
                    {neg.fare != null ? "Đề xuất giá khác" : "Đề xuất giá"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 gap-3">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Đề xuất điều kiện
                  </Text>

                  <View className="gap-1">
                    <Text className="text-xs font-bold text-[#152249]/70">Chi phí (₫)</Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-[48px]">
                      <MaterialIcons name="payments" size={16} color="#15224980" />
                      <TextInput
                        className="flex-1 ml-3 text-base text-[#152249]"
                        value={fare}
                        onChangeText={setFare}
                        placeholder="Ví dụ: 15000"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        style={Platform.OS === "web" ? { outlineStyle: "none" } as any : {}}
                      />
                    </View>
                  </View>

                  <View className="gap-1">
                    <Text className="text-xs font-bold text-[#152249]/70">Thời gian xuất phát</Text>
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-[48px]">
                      <MaterialIcons name="schedule" size={16} color="#15224980" />
                      <TextInput
                        className="flex-1 ml-3 text-base text-[#152249]"
                        value={departureTime}
                        onChangeText={setDepartureTime}
                        placeholder="ISO hoặc mô tả thời gian"
                        placeholderTextColor="#94A3B8"
                        style={Platform.OS === "web" ? { outlineStyle: "none" } as any : {}}
                      />
                    </View>
                  </View>

                  <View className="gap-1">
                    <Text className="text-xs font-bold text-[#152249]/70">Ghi chú</Text>
                    <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[72px]">
                      <TextInput
                        className="text-base text-[#152249]"
                        value={note}
                        onChangeText={setNote}
                        placeholder="Ví dụ: Gặp tại cổng A..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        textAlignVertical="top"
                        style={Platform.OS === "web" ? { outlineStyle: "none" } as any : {}}
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setShowProposeForm(false)}
                      className="flex-1 h-11 border border-slate-200 rounded-xl items-center justify-center"
                    >
                      <Text className="text-slate-500 font-bold text-sm">Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handlePropose}
                      disabled={isUpdating}
                      activeOpacity={0.85}
                      className="flex-1 h-11 bg-[#152249] rounded-xl flex-row items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <MaterialIcons name="send" size={15} color="#F9F871" />
                          <Text className="text-white font-bold text-sm">Gửi đề xuất</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Current terms details */}
              {(neg.departureTime || neg.note) && (
                <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 gap-3">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Chi tiết khác
                  </Text>
                  {neg.departureTime && (
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name="schedule" size={14} color="#152249" />
                      <Text className="text-sm text-slate-700 font-medium">
                        {formatDateTime(neg.departureTime)}
                      </Text>
                    </View>
                  )}
                  {neg.note && (
                    <View className="flex-row items-start gap-2">
                      <MaterialIcons name="notes" size={14} color="#152249" style={{ marginTop: 2 }} />
                      <Text className="text-sm text-slate-600 flex-1">{neg.note}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Confirm action */}
              {!myConfirmed && (
                <TouchableOpacity
                  onPress={handleConfirm}
                  disabled={isConfirming}
                  activeOpacity={0.9}
                  className="w-full bg-[#F9F871] h-14 rounded-full flex-row items-center justify-center gap-3 mb-3"
                  style={{ shadowColor: "#152249", shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 }}
                >
                  {isConfirming ? (
                    <ActivityIndicator size="small" color="#152249" />
                  ) : (
                    <>
                      <MaterialIcons name="check-circle" size={20} color="#152249" />
                      <Text className="text-[#152249] font-black text-base">
                        Đồng ý & Xác nhận chuyến
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {myConfirmed && !theirConfirmed && (
                <View className="w-full bg-green-50 border border-green-200 h-14 rounded-full flex-row items-center justify-center gap-2 mb-3">
                  <MaterialIcons name="hourglass-top" size={18} color="#16A34A" />
                  <Text className="text-green-700 font-bold text-sm">
                    Đã xác nhận — chờ người kia...
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Confirmed state */}
          {isConfirmed && (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 items-center gap-2">
              <MaterialIcons name="check-circle" size={32} color="#16A34A" />
              <Text className="text-green-800 font-bold text-base text-center">
                Chuyến đi đã được xác nhận!
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(matching)/ride-confirmed" as any,
                    params: { negotiationId: neg.id },
                  })
                }
                className="mt-2 px-6 py-2 bg-[#152249] rounded-full"
              >
                <Text className="text-white font-bold text-sm">Xem chi tiết chuyến</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel */}
          {!isConfirmed && (
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.7}
              className="w-full border border-slate-200 h-11 rounded-xl items-center justify-center"
            >
              <Text className="text-slate-400 font-medium text-sm">Hủy thương lượng</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
