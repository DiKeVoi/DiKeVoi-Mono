import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";

import {
  IconInput,
  PrimaryButton,
  RoleSelector,
  ToggleRow,
} from "@/components/request/form-components";
import { LocationPicker } from "@/components/request/location-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCreateRidePost } from "@/hooks/useRidePosts";
import { useRouting } from "@/hooks/useRouting";
import { PresetLocation } from "@/hooks/useSearchPlaces";

export default function RequestScreen() {
  const { role: navRole } = useLocalSearchParams<{ role: string }>();

  const [role, setRole] = useState<"rider" | "driver">(
    navRole === "driver" ? "driver" : "rider",
  );
  const [pickupLocation, setPickupLocation] = useState<PresetLocation | null>(
    null,
  );
  const [destinationLocation, setDestinationLocation] =
    useState<PresetLocation | null>(null);
  const [isRepeat, setIsRepeat] = useState(false);
  const createRidePost = useCreateRidePost();
  // Hooks
  const { routeInfo, loading, error, calculateRoute, clearRoute } =
    useRouting();

  useEffect(() => {
    if (pickupLocation && destinationLocation) {
      calculateRoute(pickupLocation, destinationLocation);
    } else {
      clearRoute();
    }
  }, [pickupLocation, destinationLocation, calculateRoute, clearRoute]);

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
    if (!pickupLocation || !destinationLocation) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập điểm đi và điểm đến.");
      return;
    }

    const departureISO = (() => {
      const d = new Date();
      d.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return d.toISOString();
    })();

    try {
      const post = await createRidePost.mutateAsync({
        type: role === "driver" ? "offer" : "request",
        origin_location: pickupLocation.name,
        destination_location: destinationLocation.name,
        departure_time: departureISO,
        is_recurring: isRepeat,
      });
      router.push({
        pathname: "/matching/matching",
        params: { myPostId: post.id, myPostType: post.type },
      });
    } catch {
      Alert.alert("Lỗi", "Không thể tạo yêu cầu. Vui lòng thử lại.");
    }
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1" edges={["top"]}>
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
              <LocationPicker
                label="Điểm đi"
                iconName="location-on"
                placeholder="Chọn điểm khởi hành"
                value={pickupLocation?.name || ""}
                onSelect={setPickupLocation}
              />

              <LocationPicker
                label="Điểm đến"
                iconName="near-me"
                placeholder="Chọn điểm đến"
                value={destinationLocation?.name || ""}
                onSelect={setDestinationLocation}
              />
            </View>

            {/* Hiển thị khoảng cách và thời gian */}
            {pickupLocation && destinationLocation && (
              <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                {loading ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator size="small" color="#152249" />
                    <ThemedText className="text-slate-600 dark:text-slate-400">
                      Đang tính toán...
                    </ThemedText>
                  </View>
                ) : error ? (
                  <ThemedText className="text-red-500 text-center">
                    {error}
                  </ThemedText>
                ) : routeInfo ? (
                  <View className="flex-row items-center justify-center gap-6">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons
                        name="straighten"
                        size={20}
                        color="#152249"
                      />
                      <ThemedText className="text-base font-semibold text-[#152249]">
                        {routeInfo.distanceText}
                      </ThemedText>
                    </View>
                    <View className="w-px h-6 bg-blue-300" />
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons
                        name="schedule"
                        size={20}
                        color="#152249"
                      />
                      <ThemedText className="text-base font-semibold text-[#152249]">
                        {routeInfo.durationText}
                      </ThemedText>
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPicker(true)}
            >
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
                      <ThemedText className="text-blue-600 dark:text-blue-400 font-bold text-base">
                        Xong
                      </ThemedText>
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
                title="Tạo yêu cầu"
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
