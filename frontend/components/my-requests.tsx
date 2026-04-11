import { MyRequestData } from "@/types/homeData";
import { Link } from "expo-router";
import {
  CircleCheck,
  Dot,
  MessageSquare,
  MoveRight,
  Route,
  Search,
} from "lucide-react-native";
import { Image, TouchableOpacity, View, ViewProps } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
export type RequestProps = ViewProps & {
  viewAll: boolean;
};
const mockRequests: MyRequestData[] = [
  {
    id: 1,
    from: "KTX Khu B",
    to: "Nhà văn hóa sinh viên",
    time: new Date(),
    status: "finding",
  },
  {
    id: 2,
    from: "KTX Khu A",
    to: "Trường Đại học Bách khoa",
    time: new Date(),
    status: "matched",
    with: {
      id: 1,
      name: "Nguyễn Văn A",
      avatarUrl:
        "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?semt=ais_hybrid&w=740&q=80",
    },
  },
  {
    id: 3,
    from: "KTX Khu B",
    to: "Trường Đại học Khoa học Tự nhiên",
    time: new Date(),
    status: "matched",
    with: {
      id: 2,
      name: "Trần Thị B",
      avatarUrl:
        "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?semt=ais_hybrid&w=740&q=80",
    },
  },
  {
    id: 4,
    from: "KTX Khu A",
    to: "Trường Đại học Công nghệ Thông tin",
    time: new Date(),
    status: "finding",
  },
  {
    id: 5,
    from: "KTX Khu B",
    to: "Nhà văn hóa sinh viên",
    time: new Date(),
    status: "finding",
  },
];
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
      {/* Status + Time */}
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

      {/* Partner Row */}
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
        <TouchableOpacity className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
          <MessageSquare size={18} color="#152249" />
        </TouchableOpacity>
      </View>

      {/* Route Info - Đồng nhất với Finding */}
      <View className="border-t border-slate-50 pt-2">
        <View className="flex-row items-center">
          <Route size={14} color="#94A3B8" />
          <ThemedText className="text-slate-900 text-xs ml-2">
            {from}
          </ThemedText>
          <MoveRight size={14} color="#CBD5E1" className="mx-2" />
          <ThemedText className="text-slate-900 font-bold text-xs">
            {to}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export function MyRequests({ viewAll }: RequestProps) {
  const displayRequests = viewAll ? mockRequests : mockRequests.slice(0, 3);

  return (
    <ThemedView className="px-4 gap-4">
      {/* Section header */}
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="text-lg font-bold text-slate-900">
          Yêu cầu của tôi
        </ThemedText>
        {!viewAll && (
          <Link href="/all-requests" asChild>
            <TouchableOpacity>
              <ThemedText className="text-blue-700 font-bold text-sm">
                Xem tất cả
              </ThemedText>
            </TouchableOpacity>
          </Link>
        )}
      </View>

      {/* List items */}
      <View>
        {displayRequests.map((request) => (
          <View key={request.id}>
            {request.status === "finding" ? (
              <RequestItemFinding {...request} />
            ) : (
              <RequestItemMatched {...request} />
            )}
          </View>
        ))}
      </View>
    </ThemedView>
  );
}
