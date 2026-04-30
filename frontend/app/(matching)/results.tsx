import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

// --- MOCK DATA ---
const MATCH_RESULTS = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    gender: "Nam",
    role: "Cho đi ké",
    isRepeat: true,
    date: "10/10/2026",
    time: "08:30 AM",
    route: "Quận 1 → Quận 7",
    avatar: "https://i.pravatar.cc/150?u=an",
  },
  {
    id: "2",
    name: "Trần Thị Hoa",
    gender: "Nữ",
    role: "Cho đi ké",
    isRepeat: false,
    date: "10/10/2026",
    time: "07:45 AM",
    route: "Bình Thạnh → Quận 3",
    avatar: "https://i.pravatar.cc/150?u=hoa",
  },
  {
    id: "3",
    name: "Lê Minh Tâm",
    gender: "Nam",
    role: "Cho đi ké",
    isRepeat: true,
    date: "10/10/2026",
    time: "05:30 PM",
    route: "Quận 10 → Thủ Đức",
    avatar: "https://i.pravatar.cc/150?u=tam",
  },
];

const FilterPill = ({ label }: { label: string }) => (
  <TouchableOpacity className="flex h-9 flex-row items-center justify-center gap-x-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 mr-3 active:bg-slate-200">
    <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium">
      {label}
    </Text>
    <MaterialIcons name="keyboard-arrow-down" size={18} color="#475569" />
  </TouchableOpacity>
);

// 2. Thẻ hiển thị 1 kết quả (Match Card) CÓ STATE
const MatchCard = ({ item }: { item: typeof MATCH_RESULTS[0] }) => {
  const [isRequested, setIsRequested] = useState(false);

  return (
    <View className="flex flex-col gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm mb-4">
      {/* Dòng 1: Avatar + Info + Thời gian */}
      <View className="flex flex-row justify-between items-start">
        <View className="flex flex-row gap-3">
          {/* Avatar */}
          <View className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
            <Image source={{ uri: item.avatar }} className="w-full h-full" contentFit="cover" />
          </View>
          
          {/* Tên & Tags */}
          <View className="flex flex-col">
            <Text className="text-[#152249] dark:text-white text-base font-bold">
              {item.name}
            </Text>
            
            <View className="flex flex-row items-center gap-1 mt-0.5">
              <View className="bg-[#152249] px-2 py-0.5 rounded">
                <Text className="text-white text-[10px] font-bold uppercase">
                  {item.role}
                </Text>
              </View>

              <View className="bg-[#152249]/10 px-2 py-0.5 rounded">
                <Text className="text-[#152249] text-[10px] font-bold uppercase">
                  {item.gender}
                </Text>
              </View>
              
              {item.isRepeat && (
                <View className="bg-[#152249]/10 px-2 py-0.5 rounded flex flex-row items-center gap-0.5">
                  <MaterialIcons name="repeat" size={12} color="#152249" />
                  <Text className="text-[#152249] text-[10px] font-bold">Lặp lại</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Ngày giờ */}
        <View className="flex flex-col items-end">
          <Text className="text-[#152249] font-bold text-[10px]">{item.date}</Text>
          <Text className="text-[#152249] text-sm font-bold">{item.time}</Text>
        </View>
      </View>

      {/* Dòng 2: Lộ trình */}
      <View className="flex flex-col gap-2">
        <View className="flex flex-row items-center gap-2 text-slate-600 dark:text-slate-400">
          <MaterialIcons name="location-on" size={16} color="#152249" />
          <Text className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {item.route}
          </Text>
        </View>
      </View>

      {/* Dòng 3: Nút kết nối (Dynamic Style) */}
      <View className="flex flex-row gap-2 items-center">
        <TouchableOpacity 
          activeOpacity={0.8}
          // Đảo ngược trạng thái mỗi khi bấm (nếu muốn bấm lại để huỷ thì dùng !isRequested, nếu muốn bấm 1 lần khoá luôn thì dùng true)
          onPress={() => setIsRequested(!isRequested)} 
          className={`flex-1 flex flex-row h-10 items-center justify-center gap-2 rounded-xl ${
            isRequested ? "bg-[#F9F871]" : "bg-[#152249]"
          }`}
        >
          <MaterialIcons 
            // Đổi icon từ bắt tay sang dấu tick nếu đã gửi
            name={isRequested ? "check-circle" : "handshake"} 
            size={20} 
            color={isRequested ? "#152249" : "#FFFFFF"} 
          />
          <Text 
            className={`text-sm font-bold ${
              isRequested ? "text-[#152249]" : "text-white"
            }`}
          >
            {isRequested ? "Đã gửi yêu cầu" : "Kết nối"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- MÀN HÌNH CHÍNH ---
export default function AllRequestsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f6] dark:bg-[#221610]" edges={['top']}>
      
      {/* 1. Header */}
      <View className="flex flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex w-10 h-10 shrink-0 items-center justify-center -ml-2"
        >
          <MaterialIcons name="arrow-back" size={24} color="#152249" />
        </TouchableOpacity>
        <Text className="text-[#152249] dark:text-slate-100 text-lg font-bold flex-1 text-center pr-8">
          Đi ké với
        </Text>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 2. Filter Bar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex flex-row px-4 py-2"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <FilterPill label="Giới tính" />
          <FilterPill label="Lặp lại?" />
          <FilterPill label="Thời gian" />
        </ScrollView>

        {/* 3. Tiêu đề kết quả */}
        <View className="px-4 py-2 mt-2">
          <Text className="text-[#152249] dark:text-white text-xl font-bold">
            Tìm thấy {MATCH_RESULTS.length} bạn đồng hành phù hợp
          </Text>
        </View>

        {/* 4. Danh sách Drivers */}
        <View className="flex flex-col px-4 pt-2 pb-32"> 
          {MATCH_RESULTS.map((item) => (
            <MatchCard key={item.id} item={item} />
          ))}
        </View>
        
      </ScrollView>

    </SafeAreaView>
  );
}