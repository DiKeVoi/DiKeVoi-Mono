import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

// --- MOCK DATA ---
const REQUEST_DATA = {
  requester: {
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?u=avatar_a",
    role: "Đi ké",
    gender: "Nam",
    date: "10/10/2026",
    time: "08:30 AM",
    route: "KTX Khu B → Trường Đại học KHTN",
  },
  myTrip: {
    pickup: "KTX Khu B",
    destination: "ĐH Bách Khoa",
    time: "08:00 - 10/10/2026",
  }
};

export default function ConnectionRequest() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      
      {/* 1. HEADER - TOP NAVIGATION */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-[#F1F5F9]/50">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-8 h-8 items-center justify-center rounded-full active:bg-slate-50"
        >
          <MaterialIcons name="arrow-back" size={20} color="#152249" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#152249] ml-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Yêu cầu kết nối
        </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* SECTION - BLOCK 1: REQUESTER PROFILE */}
        <View className="mb-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-1 bg-[#F9F871] rounded-full" />
            <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Thông tin người gửi
            </Text>
          </View>

          {/* Profile Card */}
          <View 
            className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-2xl"
            style={{ elevation: 10, shadowColor: "#152249", shadowOpacity: 0.05, shadowRadius: 20 }}
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row flex-1">
                {/* Avatar */}
                <Image 
                  source={{ uri: REQUEST_DATA.requester.avatar }} 
                  className="w-16 h-16 rounded-2xl"
                />

                {/* Info & Tags */}
                <View className="ml-4 flex-1">
                  <Text className="text-[20px] font-bold text-[#152249] mb-2">
                    {REQUEST_DATA.requester.name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-[#152249] px-2.5 py-1 rounded-md">
                      <Text className="text-white text-[10px] font-bold uppercase">
                        {REQUEST_DATA.requester.role}
                      </Text>
                    </View>
                    <View className="bg-slate-100 p-1 rounded-md">
                      <MaterialIcons name="repeat" size={14} color="#64748B" />
                    </View>
                    <View className="bg-slate-100 px-2.5 py-1 rounded-md">
                      <Text className="text-slate-500 text-[10px] font-bold">
                        {REQUEST_DATA.requester.gender}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Time of requester */}
              <View className="items-end">
                <Text className="text-[10px] font-bold text-slate-400 mb-1">
                  {REQUEST_DATA.requester.date}
                </Text>
                <Text className="text-[16px] font-bold text-[#152249]">
                  {REQUEST_DATA.requester.time}
                </Text>
              </View>
            </View>

            {/* Route of requester */}
            <View className="flex-row items-center pt-4 border-t border-slate-50">
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#152249" />
              <Text className="ml-2 text-[14px] text-slate-500 font-medium">
                {REQUEST_DATA.requester.route}
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION - BLOCK 2: YOUR TRIP DETAILS */}
        <View>
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-1 bg-[#152249] rounded-full" />
            <Text className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              Chi tiết chuyến đi của bạn
            </Text>
          </View>

          <View className="bg-[#F3F3F4] p-6 rounded-[24px] border-2 border-dashed border-[#C6C6CF4D]">
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="near-me" size={14} color="#152249" />
              <Text className="text-sm font-bold text-[#152249]">
                {REQUEST_DATA.myTrip.pickup} → {REQUEST_DATA.myTrip.destination}
              </Text>
            </View>
            
            <View className="h-px bg-[#C6C6CF]/10 w-full mb-4" />
            
            <View>
              <Text className="text-[10px] font-bold text-[#76767F] uppercase tracking-widest mb-1">
                Thời gian
              </Text>
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="schedule" size={14} color="#152249" />
                <Text className="text-sm font-bold text-[#1A1C1C]">
                  {REQUEST_DATA.myTrip.time}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* ACTIONS */}
        <View className="mb-10 mt-10">
          <TouchableOpacity 
            onPress={() => {
              router.replace("/matching/chat");
            }}
            activeOpacity={0.9}
            className="bg-[#F9F871] h-14 rounded-full flex-row items-center justify-center gap-3 shadow-lg"
            style={{ shadowColor: "#152249", shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 }}
          >
            <MaterialIcons name="check-circle" size={20} color="#152249" />
            <Text className="text-[#152249] font-black text-base uppercase">Xác nhận kết nối</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
            router.push("/matching/results"); 
            }}
            activeOpacity={0.7}
            className="mt-4 border border-slate-200 h-14 rounded-full items-center justify-center bg-white"
          >
            <Text className="text-[#152249] font-bold text-base">Hủy kết nối</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}