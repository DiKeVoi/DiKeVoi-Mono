import { Pressable, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText, ThemedView } from "@/components";
import { HomeHeader } from "@/components/home-header";
import { MyRequests } from "@/components/my-requests";
import { QuickActions } from "@/components/quickactions";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback } from "react";
import { useMyRidePosts } from "@/hooks/useRidePosts";

export default function Home() {
  const { refetch, isRefetching } = useMyRidePosts();

  const onRefresh = useCallback(async () => {
    // Gọi refetch để tải lại danh sách bài đăng của tôi
    await refetch();
  }, [refetch]);

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
          contentContainerStyle={{ paddingBottom: 96 }}
          // 3. Tích hợp RefreshControl
          refreshControl={
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={onRefresh} 
              tintColor="#152249" // Màu cho iOS
              colors={["#152249"]} // Màu cho Android
            />
          }
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

          <View
            style={{
              paddingHorizontal: 16,
              marginTop: 16,
              flexDirection: "row",
              flexWrap: "wrap", 
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {/* Nút 1: Duyệt bài đăng */}
            <TouchableOpacity
              onPress={() => router.push("/(matching)/browse")}
              style={{
                flex: 1,
                minWidth: 150, 
                maxWidth: 400, 
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F1F5F9",
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                  minHeight: 76, 
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: "#152249",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10, 
                  }}
                >
                  <MaterialIcons name="search" size={20} color="#F9F871" />
                </View>

                <View style={{ flex: 1, justifyContent: "center" }}>
                  <ThemedText
                    style={{ fontSize: 13, fontWeight: "700", color: "#152249" }}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    Duyệt bài đăng
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 11, color: "#152249", marginTop: 2, opacity: 0.7 }}
                    numberOfLines={2}
                  >
                    Tìm chuyến phù hợp
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(matching)/active-rides")}
              style={{
                flex: 1,
                minWidth: 150,
                maxWidth: 400,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#152249",
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                  minHeight: 76,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: "#F9F871",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <MaterialIcons name="directions-car" size={20} color="#152249" />
                </View>

                <View style={{ flex: 1, justifyContent: "center" }}>
                  <ThemedText
                    style={{ fontSize: 13, fontWeight: "700", color: "#F9F871" }}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    Chuyến của tôi
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}
                    numberOfLines={2}
                  >
                    Chuyến đã ghép
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <Pressable
            onPress={() => router.push("/home/all-requests")}
            style={{
              alignSelf: 'flex-end', 
              marginRight: 16,
              marginTop: 16,      
            }}
          >
            <ThemedText
              style={
                { fontSize: 10, 
                  fontWeight: "700", 
                  color: "#152249",
                  textDecorationLine: 'underline',
                }}
            >
              Xem tất cả
            </ThemedText>
          </Pressable>
          <ThemedView style={{ marginTop: 10, marginBottom: 48 }}>
            <MyRequests viewAll={false} />
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </ThemedView>
  );
}