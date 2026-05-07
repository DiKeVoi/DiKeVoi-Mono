import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView, // Thêm import này
  Alert,
} from "react-native";
import { useCreateRidePost } from "@/hooks/useRidePosts";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Image } from "expo-image";
import { router, useLocalSearchParams, Link } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { 
  RoleSelector, 
  IconInput, 
  ToggleRow, 
  PrimaryButton 
} from "@/components/request/form-components"; 

export default function RequestScreen() {
  const { role: navRole } = useLocalSearchParams<{ role: string }>();

  const [role, setRole] = useState<"rider" | "driver">(
    navRole === "driver" ? "driver" : "rider"
  );
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isRepeat, setIsRepeat] = useState(false);
  
  useEffect(() => {
    if (navRole === "driver") setRole("driver");
    if (navRole === "passenger") setRole("rider");
  }, [navRole]);

  const [time, setTime] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setHours(8, 30, 0, 0);
    return defaultDate;
  });
  const [showPicker, setShowPicker] = useState(false);

  const createRidePost = useCreateRidePost();

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "set" && selectedDate) {
      setTime(selectedDate);
    }
  };
  
  const timeDisplay = time.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const handleSubmit = async () => {
    if (!pickup || !destination) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập điểm đi và điểm đến.");
      return;
    }

    const departureISO = (() => {
      const d = new Date();
      d.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return d.toISOString();
    })();

    try {
      await createRidePost.mutateAsync({
        type: role === "driver" ? "offer" : "request",
        origin_location: pickup,
        destination_location: destination,
        departure_time: departureISO,
        is_recurring: isRepeat,
      });
      router.push("/matching/matching");
    } catch {
      Alert.alert("Lỗi", "Không thể tạo yêu cầu. Vui lòng thử lại.");
    }
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        
        {/* Header (Giữ cố định) */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-[#152249] border-b border-slate-200 dark:border-[#152249]/20 z-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 -ml-2 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
          >
            <MaterialIcons name="arrow-back" size={24} color="#152249" />
          </TouchableOpacity>
          
          <ThemedText className="text-xl font-bold text-[#152249] dark:text-white flex-1 ml-2">
            Tạo yêu cầu
          </ThemedText>
          
          <Image
            source={require("@/assets/images/dikevoi-logo.png")}
            className="w-8 h-8"
            contentFit="contain"
          />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1 px-4 pt-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" 
            contentContainerStyle={{ paddingBottom: 100 }} 
          >
            <ThemedText className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Bạn là ai?
            </ThemedText>
            
            <RoleSelector role={role} setRole={setRole} />

            <View className="mt-4">
              <IconInput
                label="Điểm đi"
                iconName="location-on"
                placeholder="Nhập điểm khởi hành"
                value={pickup}
                onChangeText={setPickup}
              />

              <IconInput
                label="Điểm đến"
                iconName="near-me"
                placeholder="Nhập điểm đến"
                value={destination}
                onChangeText={setDestination}
              />

              <View className="mb-6 -mt-2">
                <Link href="/map" asChild>
                  <TouchableOpacity 
                    className="bg-[#F9F871] py-3 rounded-xl flex-row justify-center items-center shadow-sm"
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="map" size={20} color="#152249" className="mr-2" />
                    <ThemedText className="text-[#152249] font-bold">Chọn địa điểm trên bản đồ</ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPicker(true)}>
              <View pointerEvents="none">
                <IconInput
                  label="Thời gian đi"
                  iconName="schedule"
                  placeholder="08:30"
                  value={timeDisplay}
                />
              </View>
            </TouchableOpacity>

            {showPicker && (
              <View className="mb-6 bg-slate-50 dark:bg-[#152249]/20 rounded-xl overflow-hidden border border-slate-200 dark:border-[#152249]/30">
                {Platform.OS === "ios" && (
                  <View className="flex-row justify-end p-3 border-b border-slate-200 dark:border-[#152249]/30">
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <ThemedText className="text-blue-600 dark:text-blue-400 font-bold text-base">Xong</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={true} 
                  minuteInterval={30} 
                  display="spinner" 
                  onChange={onTimeChange}
                  textColor="#152249" 
                />
              </View>
            )}

            <ToggleRow value={isRepeat} onValueChange={setIsRepeat} />

            <View className="mt-4">
              <PrimaryButton
                title={createRidePost.isPending ? "Đang tạo..." : "Tạo yêu cầu"}
                iconName="send"
                onPress={handleSubmit}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}