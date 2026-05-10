import { MyRequestData } from "@/types/homeData";
import { Link, router } from "expo-router";
import {
  CircleCheck,
  Dot,
  MessageSquare,
  CircleUser,
  Search,
} from "lucide-react-native";
import { ActivityIndicator, Image, TouchableOpacity, View, ViewProps } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useMyRidePosts } from "@/hooks/useRidePosts";

export type RequestProps = ViewProps & {
  viewAll: boolean;
};

function RequestItemFinding({ id, from, to, time }: MyRequestData) {
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
          {time.getHours()}:{time.getMinutes().toString().padStart(2, "0")} -{" "}
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

// Thêm tuỳ chọn negotiationId vào Type
type MatchedRequestProps = MyRequestData & {
  negotiationId?: string; 
};

function RequestItemMatched({
  id,
  negotiationId,
  from,
  to,
  time,
  with: withPerson,
}: MatchedRequestProps) {
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
        {withPerson?.avatarUrl ? (
          <Image
            source={{ uri: withPerson.avatarUrl }}
            className="w-11 h-11 rounded-full"
          />
        ) : (
          <View className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center">
            <CircleUser size={28} color="#64748B" />
          </View>
        )}
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
          onPress={() => {
            // Đảm bảo route tới negotiationId thay vì RidePost ID
            if (negotiationId) {
              router.push(`/chat/${negotiationId}`);
            } else {
              console.warn("Không tìm thấy ID của cuộc thương lượng!");
            }
          }}
        >
          <MessageSquare size={18} color="#152249" />
        </TouchableOpacity>
      </View>
      <View className="border-t border-slate-50 pt-2">
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
          // Bỏ hàm Number() vì schema Database dùng UUID (chuỗi string)
          const request: MatchedRequestProps = {
            id: p.id, 
            negotiationId: p.negotiationId, // Cần đảm bảo backend trả về field này
            from: p.originLocation,
            to: p.destinationLocation,
            time: new Date(p.departureTime),
            status: p.status === "matched" ? "matched" : "finding",
            with: p.with,
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