import { MyRequestData } from "@/types/homeData";
import { Link, router } from "expo-router";
import {
  CircleCheck,
  Dot,
  MessageSquare,
  MoveRight,
  Route,
  Search,
} from "lucide-react-native";
import { ActivityIndicator, Image, TouchableOpacity, View, ViewProps } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useMyRidePosts } from "@/hooks/useRidePosts";

export type RequestProps = ViewProps & {
  viewAll: boolean;
};

function RequestItemFinding({ from, to, time }: MyRequestData) {
  return (
    <View className="bg-white border border-slate-100 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded gap-2">
          <Search size={16} color="#2563EB" />
          <ThemedText className="text-[12px] text-blue-600 font-bold text-[10px] uppercase">
            Đang tìm kiếm
          </ThemedText>
        </View>
        <ThemedText className="text-slate-400 text-xs">
          {time.getHours()}:{time.getMinutes()} -{" "}
          {time.getDate() === new Date().getDate()
            ? "Hôm nay"
            : time.toLocaleDateString()}
        </ThemedText>
      </View>
      <View className="flex-row items-center -ml-4">
        <Dot size={48} color="#94A3B8" />
        <ThemedText className="text-slate-500 text-sm -ml-2">{from}</ThemedText>
      </View>
      <View className="flex-row items-center -ml-4 -mt-2">
        <Dot size={48} color="#000000" />
        <ThemedText className="text-slate-900 font-bold text-sm -ml-2">
          {to}
        </ThemedText>
      </View>
    </View>
  );
}

function RequestItemMatched({
  from,
  to,
  time,
  with: withPerson,
}: MyRequestData) {
  return (
    <View className="bg-white border border-slate-100 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center bg-green-50 px-2 py-1 rounded gap-2">
          <CircleCheck size={16} color="#16A34A" />
          <ThemedText className="text-green-600 font-bold text-[10px] uppercase">
            Đã ghép cặp
          </ThemedText>
        </View>
        <ThemedText className="text-slate-400 text-xs">
          {time.getHours()}:{time.getMinutes().toString().padStart(2, "0")}
        </ThemedText>
      </View>
      <View className="flex-row items-center gap-3 mb-4">
        <Image
          source={{ uri: withPerson?.avatarUrl }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
        <View className="flex-1">
          <ThemedText className="text-slate-400 text-[10px] uppercase font-bold">
            Đi cùng
          </ThemedText>
          <ThemedText className="text-slate-900 font-bold text-base">
            {withPerson?.name}
          </ThemedText>
        </View>
        <TouchableOpacity
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
          onPress={() => router.push("/(matching)/chat")}
        >
          <MessageSquare size={18} color="#152249" />
        </TouchableOpacity>
      </View>
      <View className="border-t border-slate-50 pt-2">
        <View className="flex-row items-center">
          <Route size={14} color="#94A3B8" />
          <ThemedText className="text-slate-900 text-xs ml-2">{from}</ThemedText>
          <MoveRight size={14} color="#CBD5E1" className="mx-2" />
          <ThemedText className="text-slate-900 font-bold text-xs">{to}</ThemedText>
        </View>
      </View>
    </View>
  );
}

export function MyRequests({ viewAll }: RequestProps) {
  const { data: ridePosts, isLoading } = useMyRidePosts();

  if (isLoading) {
    return (
      <ThemedView className="px-4 items-center py-8">
        <ActivityIndicator color="#152249" />
      </ThemedView>
    );
  }

  const displayPosts = viewAll ? (ridePosts ?? []) : (ridePosts ?? []).slice(0, 3);

  return (
    <ThemedView className="px-4 gap-4">
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="text-lg font-bold text-slate-900">
          Yêu cầu của tôi
        </ThemedText>
        {!viewAll && (
          <Link href="/(tabs)/home/all-requests" asChild>
            <TouchableOpacity>
              <ThemedText className="text-blue-700 font-bold text-sm">
                Xem tất cả
              </ThemedText>
            </TouchableOpacity>
          </Link>
        )}
      </View>
      <View>
        {displayPosts.map((p) => {
          const request: MyRequestData = {
            id: Number(p.id) || 0,
            from: p.originLocation,
            to: p.destinationLocation,
            time: new Date(p.departureTime),
            status: p.status === "matched" ? "matched" : "finding",
          };
          return (
            <View key={p.id}>
              {request.status === "finding" ? (
                <RequestItemFinding {...request} />
              ) : (
                <RequestItemMatched {...request} />
              )}
            </View>
          );
        })}
        {displayPosts.length === 0 && (
          <ThemedText className="text-slate-400 text-sm text-center py-4">
            Chưa có yêu cầu nào.
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}
