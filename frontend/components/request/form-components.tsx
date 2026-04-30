import React from "react";
import { View, TextInput, TouchableOpacity, Switch, TextInputProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text"; 


// 1. Component Chọn Vai Trò
interface RoleSelectorProps {
  role: "rider" | "driver";
  setRole: (role: "rider" | "driver") => void;
}
export function RoleSelector({ role, setRole }: RoleSelectorProps) {
  return (
    <View className="flex-row p-1 bg-slate-200 dark:bg-[#152249]/20 rounded-xl mb-6 mt-2">
      <TouchableOpacity
        onPress={() => setRole("rider")}
        className={`flex-1 py-3 rounded-lg items-center transition-all ${
          role === "rider" ? "bg-[#152249]" : "bg-transparent"
        }`}
      >
        <ThemedText className={`font-medium ${role === "rider" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}>
          Đi ké
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setRole("driver")}
        className={`flex-1 py-3 rounded-lg items-center transition-all ${
          role === "driver" ? "bg-[#152249]" : "bg-transparent"
        }`}
      >
        <ThemedText className={`font-medium ${role === "driver" ? "text-white" : "text-slate-600 dark:text-slate-400"}`}>
          Cho đi ké
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// 2. Component Input có Icon
interface IconInputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}
export function IconInput({ label, iconName, ...props }: IconInputProps) {
  return (
    <View className="space-y-2 mb-5">
      <ThemedText className="text-base font-semibold text-[#152249] dark:text-slate-200 mb-2">
        {label}
      </ThemedText>
      <View className="relative justify-center">
        <View className="absolute left-4 z-10">
          <MaterialIcons name={iconName} size={22} color="#152249" opacity={0.6} />
        </View>
        <TextInput
          className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#152249]/10 border border-slate-200 dark:border-[#152249]/20 rounded-xl text-slate-900 dark:text-white text-base"
          placeholderTextColor="#94a3b8"
          
          {...props}
        />
      </View>
    </View>
  );
}

// 3. Component Nút Gạt Lặp Lại
interface ToggleRowProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
}
export function ToggleRow({ value, onValueChange }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-white dark:bg-[#152249]/10 border border-slate-200 dark:border-[#152249]/20 rounded-xl mb-6 mt-2">
      <View className="flex-row items-center gap-3">
        <MaterialIcons name="repeat" size={24} color="#152249" opacity={0.6} />
        <View>
          <ThemedText className="font-semibold text-[#152249] dark:text-slate-200">Lặp lại?</ThemedText>
        </View>
      </View>
      <View className="flex-row items-center gap-3">
        <ThemedText className="text-sm font-medium text-slate-600 dark:text-slate-400">Hàng ngày</ThemedText>
        <Switch
          trackColor={{ false: "#e2e8f0", true: "#152249" }}
          thumbColor="#ffffff"
          onValueChange={onValueChange}
          value={value}
        />
      </View>
    </View>
  );
}

// 4. Component Nút Bấm Chính
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
}
export function PrimaryButton({ title, onPress, iconName }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-full h-14 bg-[#F9F871] active:opacity-90 rounded-xl flex-row items-center justify-center gap-2 shadow-sm mb-10"
    >
      <ThemedText className="text-[#152249] font-bold text-base">{title}</ThemedText>
      {iconName && <MaterialIcons name={iconName} size={20} color="#152249" />}
    </TouchableOpacity>
  );
}