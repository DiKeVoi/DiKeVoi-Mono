import { NotificationData } from "@/types/homeData";
import { CircleCheck, CircleX, UserPlus, UserCheck } from "lucide-react-native";
import { TouchableOpacity, View, ScrollView } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useRouter } from "expo-router";
import { useNotification } from "@/hooks/NotificationContext";


export function Notification() {
  const router = useRouter();
  
  // 1. Lấy dữ liệu và các hàm xử lý từ Context
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotification();

  // 2. Hàm xử lý khi bấm vào 1 thông báo cụ thể
  const handlePressNotification = (item: NotificationData) => {
    // Gọi hàm từ Context để đánh dấu đã đọc
    markAsRead(item.id); 
    
    // Chuyển trang
    if (item.category === "accepted") {
      router.push({
        pathname: "/(matching)/chat/[id]",
        params: { id: item.targetId } 
      });
    } else if (item.category === "matching") {
      router.push("/(tabs)/matching/connection-request");
    }
  };

  const renderIcon = (category?: string) => {
    switch (category) {
      case "matching":
        return (
          <View className="bg-blue-50 p-2 rounded-full">
            <UserPlus size={20} color="#2563EB" />
          </View>
        );
      case "accepted":
        return (
          <View className="bg-yellow-50 p-2 rounded-full">
            <UserCheck size={20} color="#EAB308" />
          </View>
        );
      case "failed":
        return (
          <View className="bg-red-50 p-2 rounded-full">
            <CircleX size={20} color="#EF4444" />
          </View>
        );
      case "success":
        return (
          <View className="bg-green-50 p-2 rounded-full">
            <CircleCheck size={20} color="#10B981" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ThemedView
      pointerEvents="box-none"
      className="absolute top-16 right-4 left-4 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      style={{
        zIndex: 999,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }}
    >
      {/* Header */}
      <View 
        className="flex-row justify-between items-center px-6 py-4 border-b border-slate-50"
        pointerEvents="auto"
      >
        <ThemedText className="text-sm font-bold tracking-widest text-slate-800">
          THÔNG BÁO
        </ThemedText>
        {/* Số lượng sẽ tự cập nhật về 0 nếu đọc hết */}
        <ThemedText className="text-[10px] font-bold text-slate-400">
          {unreadCount > 0 ? `${unreadCount} MỚI` : "ĐÃ ĐỌC HẾT"}
        </ThemedText>
      </View>

      {/* Notification List */}
      <View style={{ maxHeight: 350 }}>
        <ScrollView
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {notifications.map((item: NotificationData, index: number) => (
            <TouchableOpacity
              key={item.id.toString()}
              activeOpacity={0.5}
              onPress={() => handlePressNotification(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className={`flex-row items-start px-6 py-5 ${
                index !== notifications.length - 1 ? "border-b border-slate-50" : ""
              } ${!item.read ? "bg-slate-50/50" : "bg-white"}`} // Highlight nhẹ nền nếu chưa đọc
            >
              {renderIcon(item.category)}

              <View className="flex-1 ml-4 justify-center">
                <View className="flex-row items-start justify-between gap-2">
                  <ThemedText 
                    className={`text-[14px] leading-5 flex-1 ${
                      !item.read ? "font-bold text-[#152249]" : "font-normal text-slate-600"
                    }`}
                  >
                    {item.title}
                  </ThemedText>
                  
                  {/* CHẤM ĐỎ: Chỉ hiện khi read === false */}
                  {!item.read && (
                    <View className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 shadow-sm shadow-red-200" />
                  )}
                </View>
                
                <ThemedText className="text-[12px] text-slate-400 mt-1">
                  Vừa xong
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Footer Button */}
      <View className="flex-row border-t border-slate-50 bg-slate-50/50">
        <TouchableOpacity 
          className="flex-1 py-4 items-center border-r border-slate-100"
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
          style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
        >
          <ThemedText className="text-[13px] font-bold text-slate-500">
            Đánh dấu đã đọc tất cả
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-1 py-4 items-center"
          onPress={() => router.push("/(tabs)/home/all-notifications")} // Đổi đường dẫn theo đúng file bạn tạo
        >
          <ThemedText className="text-[13px] font-bold text-blue-600">
            Xem tất cả
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}