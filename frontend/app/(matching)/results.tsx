import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRidePosts } from "@/hooks/useRidePosts";
import { useCreateNegotiation } from "@/hooks/useNegotiations";
import type { PostType, RidePost } from "@/types/api";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function MatchCard({
  item,
  myPostId,
  myPostType,
}: {
  item: RidePost;
  myPostId: string;
  myPostType: PostType;
}) {
  const [sent, setSent] = useState(false);
  const { mutateAsync: createNegotiation, isPending } = useCreateNegotiation();

  const handleConnect = async () => {
    if (sent || !myPostId) return;
    try {
      const offerPostId = myPostType === "offer" ? myPostId : item.id;
      const requestPostId = myPostType === "request" ? myPostId : item.id;
      await createNegotiation({ offer_post_id: offerPostId, request_post_id: requestPostId });
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Không thể gửi yêu cầu. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    }
  };

  const roleLabel = item.type === "offer" ? "Cho đi ké" : "Đi ké";
  const isMatched = item.status === "matched";
  const disabled = sent || isPending || isMatched || !myPostId;

  return (
    <View className="flex flex-col gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm mb-4">
      <View className="flex flex-row justify-between items-start">
        <View className="flex flex-row gap-3 flex-1">
          <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center flex-shrink-0">
            <MaterialIcons name="person" size={28} color="#94A3B8" />
          </View>

          <View className="flex flex-col flex-1">
            <Text className="text-[#152249] dark:text-white text-base font-bold" numberOfLines={1}>
              {item.description ?? `Chuyến #${item.id.slice(0, 6)}`}
            </Text>

            <View className="flex flex-row items-center gap-1 mt-0.5 flex-wrap">
              <View className="bg-[#152249] px-2 py-0.5 rounded">
                <Text className="text-white text-[10px] font-bold uppercase">{roleLabel}</Text>
              </View>

              {item.preferredGender && (
                <View className="bg-[#152249]/10 px-2 py-0.5 rounded">
                  <Text className="text-[#152249] text-[10px] font-bold uppercase">
                    {item.preferredGender === "male" ? "Nam" : item.preferredGender === "female" ? "Nữ" : "Khác"}
                  </Text>
                </View>
              )}

              {item.isRecurring && (
                <View className="bg-[#152249]/10 px-2 py-0.5 rounded flex flex-row items-center gap-0.5">
                  <MaterialIcons name="repeat" size={12} color="#152249" />
                  <Text className="text-[#152249] text-[10px] font-bold">Lặp lại</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="flex flex-col items-end ml-2">
          <Text className="text-[#152249] font-bold text-[10px]">{formatDate(item.departureTime)}</Text>
          <Text className="text-[#152249] text-sm font-bold">{formatTime(item.departureTime)}</Text>
        </View>
      </View>

      <View className="flex flex-row items-center gap-2">
        <MaterialIcons name="location-on" size={16} color="#152249" />
        <Text className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-1" numberOfLines={1}>
          {item.originLocation} → {item.destinationLocation}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={handleConnect}
        className={`flex flex-row h-10 items-center justify-center gap-2 rounded-xl ${
          sent || isMatched ? "bg-[#F9F871]" : disabled ? "bg-slate-300" : "bg-[#152249]"
        }`}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialIcons
              name={sent || isMatched ? "check-circle" : "handshake"}
              size={20}
              color={sent || isMatched ? "#152249" : disabled ? "#94A3B8" : "#FFFFFF"}
            />
            <Text
              className={`text-sm font-bold ${
                sent || isMatched ? "text-[#152249]" : disabled ? "text-slate-500" : "text-white"
              }`}
            >
              {isMatched ? "Đã ghép" : sent ? "Đã gửi yêu cầu" : "Kết nối"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ResultsScreen() {
  const { myPostId, myPostType } = useLocalSearchParams<{ myPostId?: string; myPostType?: string }>();

  const oppositeType: PostType = myPostType === "offer" ? "request" : "offer";
  const { data: posts, isLoading, error, refetch } = useRidePosts(oppositeType);

  const availablePosts = (posts ?? []).filter((p) => p.status === "open");

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f6] dark:bg-[#221610]" edges={["top"]}>
      <View className="flex flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex w-10 h-10 shrink-0 items-center justify-center -ml-2"
        >
          <MaterialIcons name="arrow-back" size={24} color="#152249" />
        </TouchableOpacity>

        <Text className="text-[#152249] dark:text-slate-100 text-lg font-bold flex-1 text-center">
          Đi ké với
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(matching)/negotiations")}
          className="w-10 h-10 items-center justify-center"
        >
          <MaterialIcons name="inbox" size={24} color="#152249" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2">
          {isLoading ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color="#152249" />
            </View>
          ) : error ? (
            <View className="items-center py-20 gap-3">
              <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
              <Text className="text-slate-400 font-medium">Không thể tải dữ liệu.</Text>
              <TouchableOpacity onPress={() => refetch()} className="mt-2 px-6 py-2 bg-[#152249] rounded-full">
                <Text className="text-white font-bold">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : availablePosts.length === 0 ? (
            <View className="items-center py-20 gap-3">
              <MaterialIcons name="search-off" size={48} color="#CBD5E1" />
              <Text className="text-slate-400 font-medium text-center">
                Chưa có ai phù hợp.{"\n"}Vui lòng thử lại sau!
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-[#152249] dark:text-white text-xl font-bold mb-4">
                Tìm thấy {availablePosts.length} bạn đồng hành phù hợp
              </Text>
              <View className="pb-32">
                {availablePosts.map((item) => (
                  <MatchCard
                    key={item.id}
                    item={item}
                    myPostId={myPostId ?? ""}
                    myPostType={(myPostType as PostType) ?? oppositeType}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
