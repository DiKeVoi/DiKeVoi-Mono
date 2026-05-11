import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRide } from "@/hooks/useRides";
import { useCreateReport } from "@/hooks/useReports";

export default function ReportScreen() {
  const { rideId, reportedUserId } = useLocalSearchParams<{ 
    rideId?: string, 
    reportedUserId?: string 
  }>();
  const [description, setDescription] = useState("");

  const { data: ride, isLoading: rideLoading } = useRide(rideId ?? "");
  const { mutateAsync: createReport, isPending } = useCreateReport();

  const handleSubmit = async () => {
    const trimmed = description.trim();
    if (!trimmed) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả sự cố.");
      return;
    }

    try {
      await createReport({
        ride_id: rideId,
        reported_user_id: reportedUserId,
        reason: trimmed,
      });
      router.push("/(matching)/report-success");
    } catch {
      Alert.alert("Lỗi", "Không thể gửi báo cáo. Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f9f9f9]" edges={["top"]}>
      {/* Header */}
      <View className="bg-[#152249] h-16 px-6 flex-row items-center justify-between shadow-none">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="active:opacity-80 active:scale-95"
          >
            <MaterialIcons name="arrow-back" size={24} color="#F9F871" />
          </TouchableOpacity>
          <Text className="font-bold text-lg text-[#F9F871]">Báo cáo sự cố</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        >
          {/* Route Info Card */}
          {rideId && (
            <View className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden mb-10 border border-slate-100">
              <View className="absolute -top-16 -right-16 w-32 h-32 bg-[#F9F871]/10 rounded-full" />

              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Lộ trình liên quan
              </Text>

              {rideLoading ? (
                <ActivityIndicator size="small" color="#152249" />
              ) : ride ? (
                <View className="flex-col gap-6 relative">
                  <View className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-slate-200" />

                  <View className="flex-row items-start gap-4">
                    <View className="w-6 h-6 rounded-full bg-[#152249] items-center justify-center border-4 border-white shadow-sm">
                      <View className="w-2 h-2 rounded-full bg-[#F9F871]" />
                    </View>
                    <View>
                      <Text className="font-bold text-[#152249] text-base">
                        {ride.originLocation}
                      </Text>
                      <Text className="text-xs text-slate-500">Điểm đón</Text>
                    </View>
                  </View>

                  <View className="flex-row items-start gap-4">
                    <View className="w-6 h-6 rounded-full bg-[#F9F871] items-center justify-center border-4 border-white shadow-sm">
                      <View className="w-2 h-2 rounded-full bg-[#152249]" />
                    </View>
                    <View>
                      <Text className="font-bold text-[#152249] text-base">
                        {ride.destinationLocation}
                      </Text>
                      <Text className="text-xs text-slate-500">Điểm đến</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text className="text-slate-400 text-sm">Không tìm thấy thông tin chuyến đi.</Text>
              )}
            </View>
          )}

          {/* Form */}
          <View className="mb-8">
            <Text className="text-2xl font-extrabold text-[#152249] tracking-tight mb-2">
              Chi tiết sự cố
            </Text>
            <Text className="text-slate-500 leading-5">
              Vui lòng mô tả vấn đề bạn gặp phải để chúng tôi có thể hỗ trợ tốt nhất.
            </Text>
          </View>

          <View className="space-y-6">
            <View>
              <Text className="text-sm font-bold text-[#152249] mb-2 ml-1">Mô tả chi tiết</Text>
              <View className="bg-slate-100 rounded-2xl p-4 min-h-[150px]">
                <TextInput
                  className="text-slate-700 text-base"
                  style={Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}}
                  placeholder="Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSubmit}
              disabled={isPending}
              className="w-full bg-[#152249] h-16 rounded-full items-center justify-center flex-row gap-3 shadow-lg shadow-[#152249]/20 active:scale-[0.98]"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color="white" />
                  <Text className="text-white font-bold text-lg">Gửi báo cáo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
