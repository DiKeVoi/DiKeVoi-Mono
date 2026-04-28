import { ScrollView } from "react-native";
import { ThemedText, ThemedView } from "@/components";
import { HomeHeader } from "@/components/home-header";
import { MyRequests } from "@/components/my-requests";
import { QuickActions } from "@/components/quickactions";

export default function Home() {
  return (
    <ThemedView style={{ flex: 1, paddingTop: 16 }}>
      <ThemedView
        style={{
          flex: 1,
          flexDirection: "column",
          width: "100%",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 96, 
          }}
        >
          <HomeHeader />

          <ThemedView style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
            <ThemedText style={{ fontSize: 24, color: "#0f172a", fontWeight: "bold" }}>
              Chào buổi sáng!
            </ThemedText>
            <ThemedText style={{ fontSize: 16, color: "#64748b", marginTop: 4 }}>
              Bạn muốn đi đâu hôm nay?
            </ThemedText>
          </ThemedView>

          <QuickActions />

          <ThemedView style={{ marginTop: 24, marginBottom: 48 }}>
            <MyRequests viewAll={false} />
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}