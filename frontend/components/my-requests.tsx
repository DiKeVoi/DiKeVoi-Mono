import { MyRequestData } from "@/types/homeData";
import { router } from "expo-router";
import {
  CircleCheck,
  Dot,
  CircleUser,
  Search,
  ReceiptText
} from "lucide-react-native";
import { ActivityIndicator, Image, TouchableOpacity, View, ViewProps } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useMyRidePosts } from "@/hooks/useRidePosts";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";

export type RequestProps = ViewProps & {
  viewAll: boolean;
};

type MatchedRequestProps = MyRequestData & {
  negotiationId?: string; 
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
          {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, "0")} -{" "}
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


function RequestItemConnecting({ id, from, to, time }: MatchedRequestProps) {
  return (
    <View className="bg-white border border-orange-100 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded gap-2">
          <CircleUser size={16} color="#F97316" />
          <ThemedText className="text-[10px] text-orange-600 font-bold uppercase">
            Đang chờ xác nhận
          </ThemedText>
        </View>
        <ThemedText className="text-slate-400 text-xs">
           {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, "0")} -{" "}
          {time.getDate() === new Date().getDate()
            ? "Hôm nay"
            : time.toLocaleDateString()}
        </ThemedText>
      </View>

      <View className="flex-row items-start gap-3 mb-4">
        <View className="items-center py-1">
          <View className="w-2 h-2 rounded-full bg-blue-500" />
          <View className="w-[1px] h-6 bg-slate-200 my-1" />
          <View className="w-2 h-2 rounded-full bg-red-500" />
        </View>
        <View className="flex-1">
          <ThemedText numberOfLines={1} className="text-slate-600 text-sm mb-2">{from}</ThemedText>
          <ThemedText numberOfLines={1} className="text-slate-800 font-bold text-sm">{to}</ThemedText>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => router.push({
          pathname: "/connection", 
          params: { postId: id } 
        })}
        className="bg-[#152249] py-3 rounded-lg items-center flex-row justify-center gap-2"
      >
        <MaterialIcons name="person-search" size={18} color="#F9F871" />
        <ThemedText className="text-white font-bold">Xem người đang chờ</ThemedText>
      </TouchableOpacity>
    </View>
  );
}


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
          {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, "0")} - {time.getDate() === new Date().getDate() ? "Hôm nay" : time.toLocaleDateString()}
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
        
        {/* Nút nhắn tin/xem chi tiết chuyến đi đã chốt */}
        <TouchableOpacity
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
          onPress={() => {
            if (negotiationId) {
              router.push({ pathname: "/(matching)/chat", params: { negotiationId: negotiationId } });
            } else {
              console.warn("Không tìm thấy ID của cuộc thương lượng!");
            }
          }}
        >
          <ReceiptText size={18} color="#152249" />
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


export function MyRequests({ viewAll, onRefreshAction }: RequestProps & { onRefreshAction?: () => void }) {
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
    <View>
        {displayPosts.map((p: any) => {
          // Lấy status từ backend
          const finalStatus = p.computedStatus || p.status; 
          
          const request: MatchedRequestProps = {
            id: p.id, 
            negotiationId: p.negotiationId, 
            from: p.originLocation,
            to: p.destinationLocation,
            time: new Date(p.departureTime),
            status: finalStatus, 
            with: p.with,
          };
          
          return (
            <View key={p.id}>
              {finalStatus === "open" && <RequestItemFinding {...request} />}
              {finalStatus === "connecting" && <RequestItemConnecting {...request} />}
              {finalStatus === "matched" && <RequestItemMatched {...request} />}
            </View>
          );
        })}
        {displayPosts.length === 0 && (
          <ThemedText className="text-slate-400 text-sm text-center py-4">
            Chưa có yêu cầu nào.
          </ThemedText>
        )}
      </View>
  );
}