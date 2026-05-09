import { Bike, MapPin } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { router } from "expo-router"; 

export function QuickActions() {
  return (
    <ThemedView className="px-4 flex-row gap-4">
      {/* Di ke card */}
      <TouchableOpacity
        onPress={() => 
          router.push({
            pathname: "/matching/request",
            params: { role: "passenger" } 
          })
        }
        className="flex-1 p-4 rounded-xl justify-between"
        style={{ backgroundColor: "#152249", height: 120 }}
      >
        <Bike size={32} color="#F9F871" />
        <View>
          <ThemedText className="text-white font-bold text-lg">
            Đi ké
          </ThemedText>
          <ThemedText className="text-slate-400 text-xs">
            Tiết kiệm chi phí
          </ThemedText>
        </View>
      </TouchableOpacity>

      {/* Chia se cho card */}
      <TouchableOpacity
        onPress={() => 
          router.push({
            pathname: "/matching/request",
            params: { role: "driver" } 
          })
        }
        className="flex-1 p-4 rounded-xl justify-between"
        style={{ backgroundColor: "#F9F871", height: 120 }}
      >
        <MapPin size={32} color="#152249" />
        <View>
          <ThemedText className="text-slate-900 font-bold text-lg">
            Chia sẻ chỗ
          </ThemedText>
          <ThemedText className="text-slate-700 text-xs">
            Giúp đỡ bạn học
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
}