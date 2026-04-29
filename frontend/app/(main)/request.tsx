import { ThemedText, ThemedView } from "@/components";
import { Button} from "react-native";
import { Link } from "expo-router";
export default function Profile() {
  return (
    <ThemedView className="flex justify-center pt-12">
      <ThemedText className="text-2xl text-slate-900 font-bold">
        {/* Thêm chọn đi ké hoặc cho đi ké, thời gian, lặp lại */}
        Tạo yêu cầu
        
      </ThemedText>
      <Link href="/map" asChild>
        <Button
            title="Chọn địa điểm"
            color="#F9F871"
          />
      </Link>
    </ThemedView>
  );
}
