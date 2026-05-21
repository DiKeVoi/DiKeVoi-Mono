import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRidePosts, useMyRidePosts } from "@/hooks/useRidePosts";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useCreateNegotiation } from "@/hooks/useNegotiations";
import { useAuth } from "@/hooks/AuthContext";
import { Toast, useToast } from "@/components/ui/toast";
import type { PostType, RidePost } from "@/types/api";

type Filter = "all" | "offer" | "request";

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "offer", label: "Cho đi ké" },
  { key: "request", label: "Đi ké" },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();

  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = dDate.getTime() - nowDate.getTime();
  const diffDays = Math.round(diffTime / 86_400_000);

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Ngày mai";
  
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function PostCard({
  post,
  isOwn,
  myPosts,
  onNoPost,
}: {
  post: RidePost;
  isOwn: boolean;
  myPosts: RidePost[];
  onNoPost: (neededType: PostType) => void;
}) {
  const { mutateAsync: createNegotiation, isPending } = useCreateNegotiation();

  const handleConnect = async () => {
    const neededType: PostType = post.type === "offer" ? "request" : "offer";
    const myMatchingPost = myPosts.find((p) => p.type === neededType && p.status === "open");

    if (!myMatchingPost) {
      onNoPost(neededType);
      return;
    }

    try {
      const offerPostId = post.type === "offer" ? post.id : myMatchingPost.id;
      const requestPostId = post.type === "request" ? post.id : myMatchingPost.id;
      const neg = await createNegotiation({
        offer_post_id: offerPostId,
        request_post_id: requestPostId,
      });
      router.push({ pathname: "/(matching)/chat", params: { negotiationId: neg.id } });
    } catch {
      // error shown via alert from hook; nothing extra needed
    }
  };

  const isMatched = post.status === "matched";
  const disabled = isOwn || isPending || isMatched;
  const isOffer = post.type === "offer";

  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-700 shadow-sm">
      {/* Top row */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1">
          <View
            className={`w-11 h-11 rounded-full items-center justify-center ${
              isOffer ? "bg-[#152249]" : "bg-[#F9F871]"
            }`}
          >
            <MaterialIcons
              name={isOffer ? "directions-car" : "person"}
              size={22}
              color={isOffer ? "#F9F871" : "#152249"}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap">
              <View className={`px-2 py-0.5 rounded-md ${isOffer ? "bg-[#152249]" : "bg-[#F9F871]"}`}>
                <Text
                  className={`text-[10px] font-bold uppercase ${isOffer ? "text-white" : "text-[#152249]"}`}
                >
                  {isOffer ? "Cho đi ké" : "Đi ké"}
                </Text>
              </View>

              {post.isRecurring && (
                <View className="flex-row items-center gap-0.5 bg-slate-100 px-2 py-0.5 rounded-md">
                  <MaterialIcons name="repeat" size={11} color="#64748B" />
                  <Text className="text-[10px] text-slate-500 font-bold">Lặp lại</Text>
                </View>
              )}

              {post.preferredGender && (
                <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] text-slate-500 font-bold">
                    {post.preferredGender === "male"
                      ? "Nam"
                      : post.preferredGender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </Text>
                </View>
              )}

              {isOwn && (
                <View className="bg-blue-50 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] text-blue-600 font-bold">Của bạn</Text>
                </View>
              )}

              {isMatched && (
                <View className="bg-orange-50 px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] text-orange-600 font-bold">Đã ghép</Text>
                </View>
              )}
            </View>

            {post.description ? (
              <Text className="text-sm text-slate-600 dark:text-slate-400 mt-1.5" numberOfLines={1}>
                {post.description}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Time */}
        <View className="items-end ml-2">
          <Text className="text-[10px] font-bold text-slate-400">{formatDate(post.departureTime)}</Text>
          <Text className="text-base font-bold text-[#152249] dark:text-white">
            {formatTime(post.departureTime)}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View className="flex-col gap-1.5 mb-4 ml-1">
        <View className="flex-row items-center gap-3">
          <View className="w-2 h-2 rounded-full bg-[#152249] mt-0.5" />
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
            {post.originLocation}
          </Text>
        </View>
        <View className="w-px h-3 bg-slate-300 ml-[3px]" />
        <View className="flex-row items-center gap-3">
          <View className="w-2 h-2 rounded-full border-2 border-[#152249] mt-0.5" />
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1" numberOfLines={1}>
            {post.destinationLocation}
          </Text>
        </View>
      </View>

      {/* Action */}
      {!isOwn && (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          onPress={handleConnect}
          className={`h-11 rounded-xl flex-row items-center justify-center gap-2 ${
            isMatched ? "bg-slate-100" : "bg-[#152249]"
          } ${isPending ? "opacity-60" : ""}`}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons
                name={isMatched ? "lock" : "handshake"}
                size={18}
                color={isMatched ? "#94A3B8" : "#fff"}
              />
              <Text
                className={`text-sm font-bold ${isMatched ? "text-slate-400" : "text-white"}`}
              >
                {isMatched ? "Đã được ghép" : "Kết nối"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function BrowseScreen() {
  const safeBack = useSafeBack("/matching" as any);
  const [filter, setFilter] = useState<Filter>("all");
  const { user } = useAuth();
  const { toast, toastY, show: showToast } = useToast();

  const handleNoPost = (neededType: PostType) => {
    const label = neededType === "request" ? "Đi ké" : "Cho đi ké";
    showToast(
      `Bạn cần bài đăng "${label}" để kết nối`,
      "Tạo ngay",
      () =>
        router.push({
          pathname: "/matching/request",
          params: { role: neededType === "offer" ? "driver" : "passenger" },
        })
    );
  };

  const queryType = filter === "all" ? undefined : (filter as PostType);
  const { data: posts, isLoading, error, refetch, isRefetching } = useRidePosts(queryType);
  const { data: myPosts = [] } = useMyRidePosts();

  const visiblePosts = (posts ?? []).filter(
    (p) => p.status === "open" && new Date(p.departureTime) > new Date()
  );
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["top"]}>
      {/* Header */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={safeBack} className="mr-3 p-1">
            <MaterialIcons name="arrow-back" size={24} color="#152249" />
          </TouchableOpacity>
          <Text className="font-bold text-lg text-[#152249] dark:text-white flex-1">
            Tìm bạn đồng hành
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(matching)/negotiations")}
            className="p-2"
          >
            <MaterialIcons name="inbox" size={22} color="#152249" />
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View className="flex-row px-4 pb-0">
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              className={`mr-6 py-3 ${filter === tab.key ? "border-b-2 border-[#152249]" : ""}`}
            >
              <Text
                className={`text-sm font-bold ${
                  filter === tab.key ? "text-[#152249]" : "text-slate-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#152249" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4">
          <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
          <Text className="text-slate-400 font-medium">Không thể tải dữ liệu.</Text>
          <TouchableOpacity onPress={() => refetch()} className="px-6 py-2 bg-[#152249] rounded-full">
            <Text className="text-white font-bold">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#152249" />
          }
        >
          {visiblePosts.length === 0 ? (
            <View className="items-center py-24 gap-4">
              <MaterialIcons name="search-off" size={52} color="#CBD5E1" />
              <Text className="text-slate-400 font-medium text-center text-base">
                Chưa có bài đăng nào.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/matching/request")}
                className="px-6 py-3 bg-[#152249] rounded-full flex-row items-center gap-2"
              >
                <MaterialIcons name="add" size={18} color="#F9F871" />
                <Text className="text-white font-bold">Tạo bài đăng</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {visiblePosts.length} bài đăng
              </Text>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isOwn={post.userId === user?.id}
                  myPosts={myPosts}
                  onNoPost={handleNoPost}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* FAB — create post */}
      <TouchableOpacity
        onPress={() => router.push("/matching/request")}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#152249] items-center justify-center shadow-lg"
        style={{ elevation: 6, shadowColor: "#152249", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#F9F871" />
      </TouchableOpacity>

      <Toast toast={toast} toastY={toastY} />
    </SafeAreaView>
  );
}
