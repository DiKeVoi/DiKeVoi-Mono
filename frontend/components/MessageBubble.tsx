import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";

type Message = {
  id: string;
  type: "self" | "other" | "system" | "date";
  text: string;
  time?: string;
};

interface MessageBubbleProps {
  msg: Message;
  partnerAvatar?: string;
}

export function MessageBubble({ msg, partnerAvatar }: MessageBubbleProps) {
  // 1. Dải phân cách ngày tháng (Ví dụ: HÔM NAY)
  if (msg.type === "date") {
    return (
      <View className="flex-row justify-center my-4">
        <View className="bg-slate-100 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {msg.text}
          </Text>
        </View>
      </View>
    );
  }

  // 2. Tin nhắn hệ thống (Nền vàng nhạt)
  if (msg.type === "system") {
    return (
      <View className="flex-row justify-center my-4">
        <View className="bg-[#F9F871]/20 border border-[#F9F871]/50 rounded-xl px-4 py-2 flex-row items-center gap-2 max-w-[85%]">
          <MaterialIcons name="info-outline" size={14} color="#152249" />
          <Text className="text-[11px] font-semibold text-[#152249] text-center flex-1">
            {msg.text}
          </Text>
        </View>
      </View>
    );
  }

  const isSelf = msg.type === "self";

  // 3. Tin nhắn người dùng (Mình hoặc Đối tác)
  return (
    <View className={`mb-4 flex-row ${isSelf ? "justify-end" : "justify-start"}`}>
      {/* Avatar người khác */}
      {!isSelf && partnerAvatar && (
        <View className="mr-3 justify-end pb-5">
          <Image 
            source={{ uri: partnerAvatar }} 
            className="w-8 h-8 rounded-full bg-slate-200" 
          />
        </View>
      )}

      {/* Nội dung tin nhắn */}
      <View className={`max-w-[75%] ${isSelf ? "items-end" : "items-start"}`}>
        <View 
          className={`px-4 py-3 shadow-sm ${
            isSelf 
              ? "bg-[#152249] rounded-2xl rounded-tr-none" // Góc trên phải vuông
              : "bg-white border border-slate-100 rounded-2xl rounded-tl-none" // Góc trên trái vuông
          }`}
        >
          <Text className={`text-[14px] leading-5 ${isSelf ? "text-white" : "text-slate-800"}`}>
            {msg.text}
          </Text>
        </View>
        <Text className="text-[10px] text-slate-400 mt-1 px-1">
          {msg.time}
        </Text>
      </View>
    </View>
  );
}