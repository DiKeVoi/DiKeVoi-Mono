import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";

import { MessageBubble } from "@/components/MessageBubble"; 

const MOCK_CHAT_DATA = {
  partner: { name: "Nguyễn Văn An", avatar: "https://i.pravatar.cc/150?u=an" },
  messages: [
    { id: "d1", type: "date", text: "Hôm nay" },
    { id: "m1", type: "other", text: "Chào bạn, mình thấy bạn có đăng chuyến đi từ KTX Khu B đến Trường Đại học Bách Khoa lúc 17:00 chiều nay. Bạn còn chỗ không?", time: "14:20" },
    { id: "m2", type: "self", text: "Chào An nhé! Mình vẫn còn chỗ. Bạn xác nhận yêu cầu tham gia để mình chốt chuyến luôn nhé!", time: "14:22" },
    { id: "sys1", type: "system", text: "Chuyến đi đã hoàn thành" },
  ] as any[]
};

export default function ChatDetailScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(MOCK_CHAT_DATA.messages);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(), type: "self", text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText("");
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* HEADER (Blur effect như thiết kế) */}
        <View className="flex-row items-center px-4 py-3 bg-white/90 border-b border-slate-100 z-50">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 rounded-full bg-slate-50">
            <MaterialIcons name="arrow-back" size={24} color="#152249" />
          </TouchableOpacity>
          <View className="flex-row items-center flex-1">
            <Image source={{ uri: MOCK_CHAT_DATA.partner.avatar }} className="w-10 h-10 rounded-full mr-3" />
            <Text className="font-bold text-[16px] text-[#152249]" numberOfLines={1}>
              Trò chuyện với {MOCK_CHAT_DATA.partner.name}
            </Text>
          </View>
        </View>

        {/* CHAT AREA */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              msg={msg} 
              partnerAvatar={MOCK_CHAT_DATA.partner.avatar} 
            />
          ))}
        </ScrollView>

        {/* INPUT AREA (Thay cho Bottom Nav Bar) */}
        {useLocalSearchParams().readonly === "true" ? (
          // NẾU LÀ LỊCH SỬ -> HIỆN THÔNG BÁO ĐÃ KẾT THÚC
          <View className="px-4 py-5 bg-slate-50 border-t border-slate-200 items-center mb-4">
            <View className="bg-slate-200/70 px-4 py-2 rounded-full">
              <Text className="text-slate-500 font-medium text-[13px]">
                Cuộc trò chuyện này đã kết thúc.
              </Text>
            </View>
          </View>
        ) : (
          // NẾU LÀ CHAT BÌNH THƯỜNG -> HIỆN Ô NHẬP TIN NHẮN
          <View className="px-4 py-3 bg-white border-t border-slate-100">
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
              <TextInput 
                className="flex-1 min-h-[40px] text-slate-700 text-base"
                style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage} 
              />
              <TouchableOpacity onPress={handleSendMessage} className="w-9 h-9 bg-[#152249] rounded-full items-center justify-center ml-2">
                <MaterialCommunityIcons name="send" size={18} color="#F9F871" />
              </TouchableOpacity>
            </View>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}