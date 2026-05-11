import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Platform, 
  KeyboardAvoidingView, 
  ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";

import { MessageBubble } from "@/components/MessageBubble";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useNegotiation, useNegotiationUsers } from "@/hooks/useNegotiations";
import { useAuth } from "@/hooks/AuthContext";
import {Message} from "@/types/api";
export default function ChatDetailScreen() {
  const safeBack = useSafeBack("/browse");
  const { id: negotiationId } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const { data: neg, isLoading: isLoadingNeg } = useNegotiation(negotiationId ?? "");
  const { data: negUsers, isLoading: isLoadingUsers } = useNegotiationUsers(negotiationId ?? "");

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const isLoading = isLoadingNeg || isLoadingUsers;

  const partnerInfo = useMemo(() => {
    if (!neg || !negUsers || !currentUser) return null;
    
    const isOfferer = neg.offererUid === currentUser.id;
    return isOfferer ? negUsers.requester : negUsers.offerer;
  }, [neg, negUsers, currentUser]);

  const partnerName = partnerInfo?.displayName ?? "Người dùng";
  const partnerAvatar = partnerInfo?.photoUrl;

  useEffect(() => {
    if (neg && messages.length === 0) {
      setMessages([
        { id: "d1", type: "date", text: "Hôm nay" },
        { 
          id: "m1", 
          type: "other", 
          text: `Chào bạn, mình muốn trao đổi về chuyến đi từ ${neg.pickupLocation || 'điểm đón'} đến ${neg.dropoffLocation || 'điểm đến'}.`, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        },
      ]);
    }
  }, [neg?.id]);

  const handleSendMessage = () => {
    if (inputText.trim() === "") return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "self", 
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText("");
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#152249" />
      </View>
    );
  }

  // Kiểm tra nếu cuộc thương lượng đã đóng
  const isClosed = neg?.status === "cancelled" || neg?.status === "confirmed";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* --- HEADER --- */}
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={safeBack} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back-ios" size={20} color="#152249" />
            </TouchableOpacity>
            
            <View className="relative">
              <View className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                {partnerAvatar ? (
                  <Image source={{ uri: partnerAvatar }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <MaterialIcons name="person" size={24} color="#94A3B8" />
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-[#152249] font-bold text-base" numberOfLines={1}>
                {partnerName}
              </Text>
              <Text className="text-slate-400 text-xs">Đang hoạt động</Text>
            </View>
          </View>

          <View className="flex-row gap-1">
            <TouchableOpacity className="p-2">
              <MaterialIcons name="call" size={22} color="#152249" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <MaterialIcons name="more-vert" size={22} color="#152249" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- DANH SÁCH TIN NHẮN --- */}
        <ScrollView 
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id}
              msg={msg}  
            />
          ))}
        </ScrollView>

        {/* --- INPUT --- */}
        {isClosed ? (
          <View className="px-4 py-5 bg-slate-50 border-t border-slate-200 items-center mb-4">
            <View className="bg-slate-200/70 px-4 py-2 rounded-full">
              <Text className="text-slate-500 font-medium text-[13px]">
                Cuộc trò chuyện này đã kết thúc.
              </Text>
            </View>
          </View>
        ) : (
          <View className="px-4 py-3 bg-white border-t border-slate-100">
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
              <TextInput 
                className="flex-1 min-h-[40px] text-slate-700 text-base px-2"
                style={Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity 
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
                className={`w-9 h-9 rounded-full items-center justify-center ${inputText.trim() ? 'bg-[#152249]' : 'bg-slate-300'}`}
              >
                <MaterialCommunityIcons name="send" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}