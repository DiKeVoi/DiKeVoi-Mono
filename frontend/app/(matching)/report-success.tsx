import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ReportSuccessScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      
      {/* 1. TOP APP BAR (Light Header) */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.replace("/home")}
          className="p-2 rounded-full active:bg-slate-100"
        >
          <MaterialIcons name="close" size={24} color="#152249" />
        </TouchableOpacity>
        
        <Text className="font-bold text-lg text-[#152249]">Báo cáo đã gửi</Text>
        
        <View className="w-10" /> 
      </View>

      <View className="h-px bg-slate-100 w-full" />

      {/* 2. MAIN CONTENT */}
      <View className="flex-1 items-center justify-center px-8">
        
        {/* Hero Success Icon */}
        <View className="relative mb-10 items-center justify-center">
          <View 
            className="w-32 h-32 rounded-full bg-[#F9F871] items-center justify-center shadow-2xl"
            style={{ 
              shadowColor: "#F9F871", 
              shadowOffset: { width: 0, height: 10 }, 
              shadowOpacity: 0.4, 
              shadowRadius: 20 
            }}
          >
            <MaterialIcons name="check-circle" size={80} color="#152249" />
          </View>
        </View>

        {/* Typography Content */}
        <Text className="text-3xl font-extrabold text-[#152249] text-center leading-tight mb-4 px-2">
          Báo cáo đã gửi thành công
        </Text>
        
        <Text className="text-slate-500 text-base text-center leading-6 mb-12 px-4">
          Cảm ơn bạn đã đóng góp thông tin. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.
        </Text>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={() => router.replace("/home")}
          activeOpacity={0.9}
          className="w-full bg-[#152249] py-4 rounded-full shadow-lg shadow-[#152249]/20 active:scale-[0.98] transition-all"
        >
          <Text className="text-white font-bold text-lg text-center">
            Về Trang chủ
          </Text>
        </TouchableOpacity>

      </View>


    </SafeAreaView>
  );
}