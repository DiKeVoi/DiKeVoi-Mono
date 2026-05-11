import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, TextInput, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useUser } from "@/hooks/useUser";
import { useSafeBack } from "@/hooks/useSafeBack";
import type { Gender } from "@/types/api";
import { useAvatarUpload } from "@/hooks/useImage";


export default function PersonalInfoScreen() {
  const safeBack = useSafeBack("/(tabs)/account" as any);
  const { user, isLoading, isUpdating, updateUser } = useUser();
  const { pickAndUploadImage, isUploading: isUploadingAvatar } = useAvatarUpload();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("other");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.displayName ?? "");
      setGender((user.gender as Gender) ?? "other");
      setAvatarUrl(user.photoUrl ?? null);
    }
  }, [user]);

  const handleChangeAvatar = async () => {
    const newAvatarUrl = await pickAndUploadImage();
    if (newAvatarUrl) {
      setAvatarUrl(newAvatarUrl);
    }
  };

  const handleSave = async () => {
    try {
      await updateUser({ displayName: fullName, gender, photoUrl: avatarUrl });
      Alert.alert("Thành công", "Đã lưu thông tin cá nhân.");
    } catch {
      Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#152249" />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 w-full"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="bg-[#152249] pt-14 pb-16 px-4 rounded-b-[24px] flex-row items-center shadow-lg relative z-10">
            <TouchableOpacity
              onPress={safeBack}
              className="p-2 absolute left-4 top-12 z-20"
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <ThemedText className="flex-1 text-center text-white text-xl font-bold tracking-tight">
              Thông tin cá nhân
            </ThemedText>
          </View>

          {/* Profile Picture Section */}
          <View className="items-center -mt-12 z-20 px-6">
            <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 items-center w-full">

              <View className="relative">
                {user?.photoUrl ? (
                  <Image
                    source={{ uri: avatarUrl ?? user.photoUrl }}
                    className="h-28 w-28 rounded-full border-4 border-[#F9F871]"
                    contentFit="cover"
                  />
                ) : (
                  <View className="h-28 w-28 rounded-full border-4 border-[#F9F871] bg-slate-200 dark:bg-slate-700 items-center justify-center">
                    <MaterialIcons name="person" size={56} color="#94A3B8" />
                  </View>
                )}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleChangeAvatar}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-1 right-1 bg-[#F9F871] rounded-full p-1.5 border-2 border-white dark:border-slate-800 shadow-sm"
                >
                  
                  <MaterialIcons name="edit" size={16} color="#152249" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.7} className="mt-4">
                <ThemedText className="text-sm font-semibold text-[#152249] dark:text-[#F9F871]">
                  Thay đổi ảnh đại diện
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View className="px-6 mt-6 gap-5">

            {/* Họ và tên */}
            <View className="gap-2">
              <ThemedText className="text-sm font-bold text-[#152249]/70 dark:text-slate-400 px-1">
                Họ và tên
              </ThemedText>
              <View className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-[54px]">
                <MaterialIcons name="person" size={20} color="#15224980" />
                <TextInput
                  className="flex-1 ml-3 text-base text-[#152249] dark:text-white"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#94A3B8"
                  style={Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}}
                />
              </View>
            </View>

            {/* Email sinh viên */}
            <View className="gap-2">
              <ThemedText className="text-sm font-bold text-[#152249]/70 dark:text-slate-400 px-1">
                Email sinh viên
              </ThemedText>
              <View className="flex-row items-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 h-[54px]">
                <MaterialIcons name="school" size={20} color="#15224980" />
                <ThemedText className="flex-1 ml-3 text-base text-[#152249]/60 dark:text-slate-400">
                  {user?.email ?? "—"}
                </ThemedText>
              </View>
              <ThemedText className="text-[11px] text-slate-400 px-1 -mt-1">
                * Email không thể thay đổi
              </ThemedText>
            </View>

            {/* Giới tính */}
            <View className="gap-2">
              <ThemedText className="text-sm font-bold text-[#152249]/70 dark:text-slate-400 px-1">
                Giới tính
              </ThemedText>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setGender('male')}
                  className={`flex-1 flex-row items-center justify-center gap-2 h-[52px] rounded-xl border ${
                    gender === 'male'
                      ? "bg-[#152249] border-[#152249]"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <MaterialIcons name="male" size={20} color={gender === 'male' ? "#F9F871" : "#15224999"} />
                  <ThemedText className={`font-bold text-base ${gender === 'male' ? "text-[#F9F871]" : "text-[#15224999] dark:text-slate-400"}`}>
                    Nam
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setGender('female')}
                  className={`flex-1 flex-row items-center justify-center gap-2 h-[52px] rounded-xl border ${
                    gender === 'female'
                      ? "bg-[#152249] border-[#152249]"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <MaterialIcons name="female" size={20} color={gender === 'female' ? "#F9F871" : "#15224999"} />
                  <ThemedText className={`font-bold text-base ${gender === 'female' ? "text-[#F9F871]" : "text-[#15224999] dark:text-slate-400"}`}>
                    Nữ
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setGender('other')}
                  className={`flex-1 flex-row items-center justify-center gap-2 h-[52px] rounded-xl border ${
                    gender === 'other'
                      ? "bg-[#152249] border-[#152249]"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <MaterialIcons name="transgender" size={20} color={gender === 'other' ? "#F9F871" : "#15224999"} />
                  <ThemedText className={`font-bold text-base ${gender === 'other' ? "text-[#F9F871]" : "text-[#15224999] dark:text-slate-400"}`}>
                    Khác
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

          </View>

          {/* Action Button */}
          <View className="px-6 mt-10">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isUpdating}
              className="w-full bg-[#F9F871] h-[58px] rounded-xl flex-row items-center justify-center shadow-sm border border-[#152249]/10"
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#152249" />
              ) : (
                <ThemedText className="text-[#152249] font-bold text-base">
                  Lưu thay đổi
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
