import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Platform, 
  KeyboardAvoidingView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

// --- MOCK DATA ---
const REPORT_MOCK_DATA = {
  route: {
    pickup: "KTX Khu B",
    pickupDesc: "Điểm đón sinh viên",
    destination: "Trường Đại học Bách Khoa",
    destinationDesc: "Điểm đến",
  }
};

export default function ReportScreen() {
  const [description, setDescription] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-[#f9f9f9]" edges={['top']}>
      
      {/* 1. TOP APP BAR (Navy Header) */}
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
          {/* 2. ROUTE INFORMATION CARD (Sử dụng Mock Data) */}
          <View className="bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden mb-10 border border-slate-100">
            {/* Decorative circle */}
            <View className="absolute -top-16 -right-16 w-32 h-32 bg-[#F9F871]/10 rounded-full" />
            
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Lộ trình liên quan
            </Text>

            <View className="flex-col gap-6 relative">
              {/* Vertical Path Line */}
              <View className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-slate-200" />
              
              {/* Start Point */}
              <View className="flex-row items-start gap-4">
                <View className="w-6 h-6 rounded-full bg-[#152249] items-center justify-center border-4 border-white shadow-sm">
                  <View className="w-2 h-2 rounded-full bg-[#F9F871]" />
                </View>
                <View>
                  <Text className="font-bold text-[#152249] text-base">
                    {REPORT_MOCK_DATA.route.pickup}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {REPORT_MOCK_DATA.route.pickupDesc}
                  </Text>
                </View>
              </View>

              {/* End Point */}
              <View className="flex-row items-start gap-4">
                <View className="w-6 h-6 rounded-full bg-[#F9F871] items-center justify-center border-4 border-white shadow-sm">
                  <View className="w-2 h-2 rounded-full bg-[#152249]" />
                </View>
                <View>
                  <Text className="font-bold text-[#152249] text-base">
                    {REPORT_MOCK_DATA.route.destination}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {REPORT_MOCK_DATA.route.destinationDesc}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3. REPORT FORM SECTION */}
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
                  style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}}
                  placeholder="Ví dụ: Tài xế không đến điểm đón, xe gặp sự cố trên đường,..."
                  placeholderTextColor="#94A3B8"
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Send Button */}
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => router.push("/(matching)/report-success")}
              className="w-full bg-[#152249] h-16 rounded-full items-center justify-center flex-row gap-3 shadow-lg shadow-[#152249]/20 active:scale-[0.98]"
            >
              <MaterialIcons name="send" size={20} color="white" />
              <Text className="text-white font-bold text-lg">Gửi báo cáo</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}