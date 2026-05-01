import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

// --- MOCK DATA ---
const FINISH_DATA = {
  trip: {
    pickup: "KTX Khu B",
    destination: "Trường Đại học Bách Khoa",
  },
  companion: {
    name: "Minh Quân",
    avatar: "https://i.pravatar.cc/150?u=an",
    description: "Bạn đường của bạn",
  },
};

export default function FinishScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* 1. TOP APP BAR */}
      <View className="bg-white pt-12 pb-4 px-6 flex-row items-center justify-between shadow-md">
        <View className="flex-row items-center gap-4">
          <Image 
            source={require("@/assets/images/dikevoi-logo.png")} 
            style={{ width: 50, height: 40 }}
            contentFit="contain"
          />
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={() => router.push("/(matching)/report")}
            className="p-2 rounded-full active:bg-slate-100"
          >
            <MaterialIcons name="flag" size={22} color="#ba1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
      >
        {/* 2. JOURNEY STATUS HEADER */}
        <View className="items-center py-4 mb-8">
          <View className="w-20 h-20 rounded-full bg-[#F9F871] items-center justify-center shadow-sm mb-6">
            <MaterialIcons name="check-circle" size={48} color="#152249" />
          </View>
          <Text className="text-2xl font-extrabold text-[#152249] tracking-tight text-center">
            Chuyến đi hoàn tất
          </Text>
          <Text className="text-[#45464e] font-medium mt-1 text-center">
            Cảm ơn bạn đã sử dụng Đi ké với!
          </Text>
        </View>

        {/* 3. CONNECTION DETAILS */}
        <View className="space-y-4">
          {/* Route Details Card */}
          <View className="bg-[#f3f3f4] p-6 rounded-2xl border border-slate-200/50">
            <View className="flex-row items-start gap-4">
              {/* Vertical Indicator */}
              <View className="items-center mt-1.5">
                <View className="w-3 h-3 rounded-full bg-[#152249]" />
                <View className="w-0.5 h-10 bg-slate-300 my-1" />
                <View className="w-3 h-3 rounded-full border-2 border-[#152249]" />
              </View>

              <View className="flex-1 gap-y-4">
                <View>
                  <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e]">
                    Điểm đi
                  </Text>
                  <Text className="font-bold text-[#152249] text-base">
                    {FINISH_DATA.trip.pickup}
                  </Text>
                </View>
                <View>
                  <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e]">
                    Điểm đến
                  </Text>
                  <Text className="font-bold text-[#152249] text-base">
                    {FINISH_DATA.trip.destination}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Companion Info Card */}
          <View className="bg-[#f3f3f4] p-5 rounded-2xl border border-slate-200/50">
            <Text className="text-[10px] uppercase tracking-widest font-bold text-[#45464e] mb-4">
              Người đồng hành
            </Text>
            <View className="flex-row items-center gap-4">
              <Image 
                source={{ uri: FINISH_DATA.companion.avatar }} 
                className="w-12 h-12 rounded-full border border-slate-200 object-cover"
              />
              <View>
                <Text className="font-bold text-[#152249] text-lg leading-tight">
                  {FINISH_DATA.companion.name}
                </Text>
                <Text className="text-xs text-[#45464e] font-medium">
                  {FINISH_DATA.companion.description}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. CALL TO ACTION */}
        <View className="mt-12 space-y-4">
          <TouchableOpacity 
            onPress={() => router.replace("/home")}
            activeOpacity={0.9}
            className="w-full h-16 bg-[#F9F871] rounded-full items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Text className="text-[#152249] font-bold text-lg">
              Hoàn thành
            </Text>
          </TouchableOpacity>
          
          <Text className="text-center text-xs text-[#45464e] px-8 leading-relaxed">
            Bằng cách nhấn hoàn thành, bạn xác nhận chuyến đi đã kết thúc an toàn.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}