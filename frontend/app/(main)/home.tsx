import { ThemedText, ThemedView } from "@/components";
import { HomeHeader } from "@/components/home-header";
import { MyRequests } from "@/components/my-requests";
import { QuickActions } from "@/components/quickactions";
export default function Home() {
  return (
    <ThemedView className="flex justify-center pt-12">
      {/* Mobile frame */}
      <ThemedView className="relative flex flex-col w-full overflow-hidden max-h-screen">
        {/* Scrollable content */}
        <ThemedView className="flex-1 overflow-y-auto pb-24">
          <HomeHeader />
          {/* Welcome Section */}
          <ThemedView className="px-4 pt-4 pb-4">
            <ThemedText className="text-2xl text-slate-900 font-bold">
              Chào buổi sáng!
            </ThemedText>
            <ThemedText className="text-base text-slate-500 font-normal mt-1">
              Bạn muốn đi đâu hôm nay?
            </ThemedText>
          </ThemedView>

          {/* Quick Actions */}
          <QuickActions />

          {/* My Requests */}
          <ThemedView className="mt-6 mb-12">
            <MyRequests viewAll={false} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
