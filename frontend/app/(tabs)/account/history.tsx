import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

const MOCK_TRIPS = [
  {
    id: "t1",
    partnerName: "Nguyễn Văn An",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCLsY8nPu3Dw3HGBkuRfgpS5b4aEzczi4UrqogNLZM5IGwJ_YxSeD_46kJtJ3YCQw9WinQfFpbjMXPK4n4VSQTty7CeAMjudRVY9o7jrmvx5PcQEJo5breiG2d5vQXF3HydWH4EbiS7H-wopgnjc08xtI2AOXy9ing0PRLygh5QF7-MIVGcMuH3Qwce_6sSyJNXdPDUYbvKez6DZpr-NlKQspYudvgaySUceMKEkrRIZNIGvFeA0xDvcketGmfejw1uFVBwbuxEZQ",
    time: "Hôm qua, 18:30",
    status: "completed",
    startLocation: "KTX Khu A",
    endLocation: "Trường Đại học Bách khoa",
  },
  {
    id: "t2",
    partnerName: "Lê Thị Bình",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9cCXVeLI4BT2MkolAiUSweEpjENThOhI5stBj4wr-4TicxDNGgmZp31eR8LvxjR-D1nolD7Gb1gZI3s7yBOHF9Cv8R_GiTId2zUcw14a-OrWQ-nN2wg7PqFAAfUd2_7jNA75c-qWrtcHd_LjBBqdD5Cf9MLYE28aX6LAWN1WPx5cxbbXtQbRbvwc98fYu3jt2kMvGCutwz20j-7K6fskBIMiOugTj654DlEZqWMgORsQjRKQH6zh08NX52HxJ8e3Tj07IEl3u1wE",
    time: "15 Th05, 07:15",
    status: "completed",
    startLocation: "KTX Khu B",
    endLocation: "Nhà văn hóa sinh viên",
  },
  {
    id: "t3",
    partnerName: "Trần Hoàng Nam",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEMLyvp7wsndnc3O7hWHfMCivorM_UrEv7YX91yAfqi-_OfpNf8xufW_COcMZGBrJ5Tzs9ucPi_gRZTaWgOBMfYSmi0Koub8nZ4RwFPDoQc8ytQ7iSSU9xgqiPInjBhYegpHY9PKXzcaL6WBBfxXY4G1dq7jSvl-k0UMvuNTiex3_n8qvh467-zvj0OesEzUgKoGSy3CYIoq75d0gmTJ3rGKoWO4mrEOkTJILoRHlqQivef70TIe3OafoC29v0ulxx4opCwEhjaZM",
    time: "12 Th05, 14:00",
    status: "cancelled",
    startLocation: "KTX Khu A",
    endLocation: "Trung tâm Giáo dục Quốc phòng",
  },
];

export default function TripHistoryScreen() {
  const [activeTab, setActiveTab] = useState<"completed" | "cancelled">("completed");

  const filteredTrips = MOCK_TRIPS.filter((trip) => trip.status === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="bg-white border-b border-slate-100 z-10">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-[#152249]/5"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#152249" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#152249]">Lịch sử chuyến đi</Text>
          <View className="w-10" />
        </View>

        <View className="flex-row px-4 gap-6 pt-1">
          <TouchableOpacity
            onPress={() => setActiveTab("completed")}
            className={`py-3 ${activeTab === "completed" ? "border-b-2 border-[#152249]" : ""}`}
          >
            <Text
              className={`text-sm ${
                activeTab === "completed" ? "font-bold text-[#152249]" : "font-medium text-slate-400"
              }`}
            >
              Hoàn thành
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("cancelled")}
            className={`py-3 ${activeTab === "cancelled" ? "border-b-2 border-[#152249]" : ""}`}
          >
            <Text
              className={`text-sm ${
                activeTab === "cancelled" ? "font-bold text-[#152249]" : "font-medium text-slate-400"
              }`}
            >
              Đã hủy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filteredTrips.length === 0 ? (
          <View className="items-center justify-center py-20">
            <MaterialIcons name="history" size={48} color="#CBD5E1" />
            <Text className="text-slate-400 mt-4 font-medium">Chưa có chuyến đi nào.</Text>
          </View>
        ) : (
          filteredTrips.map((trip) => (
            <View 
              key={trip.id} 
              className="bg-white rounded-[16px] p-4 mb-4 shadow-sm border border-slate-100"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <Image
                    source={{ uri: trip.avatar }}
                    className="w-12 h-12 rounded-full border border-slate-100"
                  />
                  <View>
                    <Text className="font-bold text-base text-[#152249]">
                      {trip.partnerName}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      {trip.time}
                    </Text>
                  </View>
                </View>

                <View 
                  className={`px-3 py-1 rounded-full ${
                    trip.status === "completed" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <Text 
                    className={`text-xs font-bold tracking-tight ${
                      trip.status === "completed" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trip.status === "completed" ? "Thành công" : "Đã hủy"}
                  </Text>
                </View>
              </View>

              <View className="flex-col gap-3 relative ml-1">
                <View className="absolute left-[11px] top-[14px] bottom-[14px] w-0.5 bg-slate-100 z-0" />

                <View className="flex-row items-center gap-4 z-10">
                  <View className="w-6 h-6 rounded-full bg-white border-2 border-[#152249] flex items-center justify-center">
                    <View className="w-2 h-2 rounded-full bg-[#152249]" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] text-slate-400">Điểm đi</Text>
                    <Text className="text-sm font-medium text-[#152249] mt-0.5">{trip.startLocation}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4 z-10">
                  <View className="w-6 h-6 rounded-full bg-white border-2 border-[#152249] flex items-center justify-center">
                    <MaterialIcons name="location-on" size={14} color="#152249" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] text-slate-400">Điểm đến</Text>
                    <Text className="text-sm font-medium text-[#152249] mt-0.5">{trip.endLocation}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row justify-end gap-2 mt-4 pt-3 border-t border-slate-50">
                <TouchableOpacity 
                  className="h-8 w-8 rounded-full bg-[#152249]/5 flex items-center justify-center"
                  activeOpacity={0.7}
                  onPress={() => {
                    const chatId = `c${trip.id.replace('t', '')}`; 
                    
                    router.push({
                      pathname: "/(matching)/chat/[id]",
                      params: { 
                        id: chatId,
                        readonly: "true"
                    }
                    });
                  }}
                >
                  <MaterialIcons name="chat" size={16} color="#152249" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="h-8 w-8 rounded-full bg-[#152249]/5 flex items-center justify-center"
                  activeOpacity={0.7}
                  onPress={() => {
                    let reportId = `r${trip.id.replace('t', '')}`; 
                    
                    router.push({
                      pathname: "/(matching)/report/[id]",
                      params: { id: reportId }
                    });
                  }}
                >
                  <MaterialIcons name="flag" size={16} color="#152249" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}