import { ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText, ThemedView } from "@/components";
import { HomeHeader } from "@/components/home-header";
import { MyRequests } from "@/components/my-requests";
import { QuickActions } from "@/components/quickactions";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

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

          {/* Quick nav row */}
          <View style={{ flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 12 }}>
            {/* Browse posts */}
            <TouchableOpacity
              onPress={() => router.push("/(matching)/browse")}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#F1F5F9",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      backgroundColor: "#152249",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="search" size={20} color="#F9F871" />
                  </View>
                  <View>
                    <ThemedText style={{ fontSize: 14, fontWeight: "700", color: "#152249" }}>
                      Duyệt bài đăng
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                      Tìm bạn đồng hành
                    </ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Active rides */}
            <TouchableOpacity
              onPress={() => router.push("/(matching)/active-rides" as any)}
              activeOpacity={0.85}
              style={{ flex: 1 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#152249",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      backgroundColor: "#F9F871",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="directions-car" size={20} color="#152249" />
                  </View>
                  <View>
                    <ThemedText style={{ fontSize: 14, fontWeight: "700", color: "#F9F871" }}>
                      Chuyến của tôi
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                      Chuyến đã ghép
                    </ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <ThemedView style={{ marginTop: 24, marginBottom: 48 }}>
            <MyRequests viewAll={false} />
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}