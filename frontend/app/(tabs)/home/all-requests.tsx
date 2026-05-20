import { ThemedView } from "@/components";
import { HomeHeader } from "@/components/home-header";
import { MyRequests } from "@/components/my-requests";
import { ScrollView } from "react-native";

export default function AllRequests() {
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

          <ThemedView style={{ marginTop: 24, marginBottom: 48 }}>
            <MyRequests viewAll={true} />
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}