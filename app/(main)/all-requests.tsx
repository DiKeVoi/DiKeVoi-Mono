import { ThemedView } from "@/components";
import { HomeHeader } from "@/components/home-header";
import { MyRequests } from "@/components/my-requests";
export default function AllRequests() {
  return (
    <ThemedView className="flex justify-center pt-12">
      {/* Mobile frame */}
      <ThemedView className="relative flex flex-col w-full overflow-hidden max-h-screen">
        {/* Scrollable content */}
        <ThemedView className="flex-1 overflow-y-auto pb-24">
          <HomeHeader />
          {/* My Requests */}
          <ThemedView className="mt-6 mb-12">
            <MyRequests viewAll={true} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
