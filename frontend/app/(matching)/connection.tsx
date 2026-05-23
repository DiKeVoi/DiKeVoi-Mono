import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router"; // <-- Import thêm useLocalSearchParams
import { useNegotiations } from "@/hooks/useNegotiations";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useAuth } from "@/hooks/AuthContext";
import { NegotiationCard } from "@/components/negotiation-card";



export default function NegotiationsScreen() {
  const safeBack = useSafeBack("/browse");
  const { user } = useAuth();
  const { postId } = useLocalSearchParams<{ postId?: string }>(); 
  
  const { data: allNegotiations, isLoading, error, refetch } = useNegotiations();

  const { active } = useMemo(() => {
    if (!allNegotiations) return { active: [] };
    
    const relevantNegotiations = postId 
      ? allNegotiations.filter(n => n.offerPostId === postId || n.requestPostId === postId)
      : allNegotiations;

    return {
      active: relevantNegotiations.filter(n => ["pending", "accepted"].includes(n.status))
    };
  }, [allNegotiations, postId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#152249" />
        <Text className="mt-4 text-slate-500 font-medium">Đang tải danh sách...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-4 py-3 flex-row justify-between items-center bg-white border-b border-slate-100">
        <View className="flex-row items-center gap-3">
          {postId && (
             <TouchableOpacity onPress={safeBack} className="p-1">
               <MaterialIcons name="arrow-back-ios" size={20} color="#152249" />
             </TouchableOpacity>
          )}
          <Text className="text-xl font-bold text-[#152249]">
            {postId ? "Người đang chờ" : "Thương lượng của tôi"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => refetch()}>
          <MaterialIcons name="refresh" size={24} color="#152249" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View className="flex-1 justify-center items-center px-10">
          <MaterialIcons name="error-outline" size={48} color="#FDA4AF" />
          <Text className="text-slate-600 text-center my-4">
            Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            className="px-8 py-3 bg-[#152249] rounded-xl shadow-sm"
          >
            <Text className="text-white font-bold">Thử lại ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#152249" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {active.length > 0 && (
            <View className="mb-6">
              <Text className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 ml-1">
                Đang chờ ({active.length})
              </Text>
              {active.map((neg) => (
                <NegotiationCard key={neg.id} neg={neg} userId={user?.id ?? ""} />
              ))}
            </View>
          )}

        
          {active.length === 0 && (
            <View className="items-center py-24 opacity-60">
              <View className="bg-slate-100 p-6 rounded-full mb-4">
                <MaterialIcons name="person-search" size={64} color="#94A3B8" />
              </View>
              <Text className="text-slate-500 text-lg font-medium">Chưa có ai quan tâm</Text>
              <Text className="text-slate-400 text-sm text-center mt-2 px-10">
                Khi có người phản hồi yêu cầu của bạn, thông tin sẽ hiện ở đây.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}