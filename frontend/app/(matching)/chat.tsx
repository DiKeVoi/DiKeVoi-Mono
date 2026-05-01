import React, { useState, useRef } from "react";
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
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";

// --- MOCK DATA ---
const MOCK_CHAT_DATA = {
  partner: {
    name: "Nguyễn Văn An",
    status: "Đang hoạt động",
    avatar: "https://i.pravatar.cc/150?u=an",
  },
  negotiation: {
    timeLeft: "04:59",
  }
};

const INITIAL_MESSAGES = [
  { id: "m1", type: "other", text: "Chào bạn, mình thấy bạn có đăng chuyến đi từ KTX Khu B đến Trường Đại học Bách Khoa lúc 17:00 chiều nay. Bạn còn chỗ không?", time: "14:20" },
  { id: "m2", type: "self", text: "Chào An nhé! Mình vẫn còn chỗ. Bạn xác nhận yêu cầu tham gia để mình chốt chuyến luôn nhé!", time: "14:22" },
  { id: "sys1", type: "system", text: "An đã gửi đề nghị tham gia chuyến đi." },
];

export default function ChatScreen() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (inputText.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(), 
      type: "self",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} 
      >
        
        {/* 1. HEADER */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-50 z-50">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={28} color="#152249" />
          </TouchableOpacity>
          
          <View className="flex-row items-center flex-1">
            <Image 
              source={{ uri: MOCK_CHAT_DATA.partner.avatar }} 
              className="w-12 h-12 rounded-full mr-3" 
            />
            <View>
              <Text className="font-bold text-lg text-[#152249]">
                  {MOCK_CHAT_DATA.partner.name}
              </Text>
              <Text className="text-[10px] font-extrabold text-[#10B981] tracking-wider uppercase">
                {MOCK_CHAT_DATA.partner.status}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. NEGOTIATION CARD */}
        <View className="px-4 py-4 z-40 bg-white">
          <View className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden pb-5">
            <View className="h-1.5 bg-slate-100 w-full flex-row">
              <View className="h-full bg-[#152249] w-2/3 rounded-r-full" />
            </View>

            <View className="flex-row items-center justify-between px-5 pt-5 mb-5">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons name="clock-outline" size={22} color="#152249" />
                <Text className="font-bold text-[#152249] text-[14px]">
                    Cùng nhau xác nhận chuyến đi trong:
                </Text>
              </View>
              <Text className="font-bold text-xl text-[#152249] tabular-nums">
                {MOCK_CHAT_DATA.negotiation.timeLeft}
              </Text>
            </View>

            <View className="flex-row px-5 gap-3">
                <TouchableOpacity 
                    onPress={() => router.push("/(matching)/finish")} 
                    className="flex-1 bg-[#152249] rounded-2xl py-3.5 items-center justify-center flex-row gap-2"
                    >
                    <MaterialIcons name="check-circle-outline" size={18} color="white" />
                    <Text className="text-white font-bold text-sm">Xác nhận chuyến đi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.replace("/(matching)/results")}
                    className="flex-1 bg-white border border-slate-200 rounded-2xl py-3.5 items-center justify-center flex-row gap-2"
                    >
                    <MaterialIcons name="cancel" size={18} color="#475569" />
                    <Text className="text-slate-600 font-bold text-sm">Hủy chuyến đi</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. CHAT AREA */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center my-4">
            <View className="bg-slate-100 px-4 py-1.5 rounded-full">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hôm nay</Text>
            </View>
          </View>

          {messages.map((msg) => {
            if (msg.type === "system") {
                return (
                <View key={msg.id} className="bg-[#FEFCE8] border border-[#FEF08A] rounded-2xl p-4 flex-row items-center gap-3 my-4">
                    <MaterialIcons name="info-outline" size={20} color="#152249" />
                    <Text className="text-[13px] font-bold text-[#152249] flex-1">{msg.text}</Text>
                </View>
                );
            }

            const isSelf = msg.type === "self";
            return (
                <View key={msg.id} className={`mb-4 flex-row ${isSelf ? "justify-end" : "justify-start"}`}>
                {!isSelf && (
                    <Image 
                    source={{ uri: MOCK_CHAT_DATA.partner.avatar }} 
                    className="w-8 h-8 rounded-full self-end mb-5 mr-2" 
                    />
                )}

                <View className={`max-w-[75%] ${isSelf ? "items-end" : "items-start"}`}>
                    <View 
                    className={`px-4 py-2.5 rounded-[20px] ${
                        isSelf 
                        ? "bg-[#152249] rounded-tr-[4px]" 
                        : "bg-white border border-slate-100 rounded-tl-[4px] shadow-sm"
                    }`}
                    >
                    <Text className={`text-[15px] leading-5 ${isSelf ? "text-white" : "text-slate-800"}`}>
                        {msg.text}
                    </Text>
                    </View>
                    <Text className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time}
                    </Text>
                </View>
                </View>
            );
          })}
        </ScrollView>

        {/* 4. INPUT AREA */}
        <View className="px-4 py-3 bg-white border-t border-slate-100">
          <View className="flex-row items-center bg-white border border-slate-200 rounded-full px-5 py-2 shadow-sm">
            <TextInput 
              className="flex-1 min-h-[40px] text-slate-700 text-base"
              style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#94A3B8"
              selectionColor="#152249"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage} 
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity 
              onPress={handleSendMessage}
              className="w-10 h-10 bg-[#152249] rounded-full items-center justify-center ml-2"
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="send" size={22} color="#F9F871" />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}