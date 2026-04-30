import { Tabs } from "expo-router";
import MyCustomTabBar from "@/components/MyCustomTabBar";

export default function TabLayout() {
  return (
    <Tabs 
      tabBar={(props) => <MyCustomTabBar {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="matching/request" />
      <Tabs.Screen name="account/profile" />
      <Tabs.Screen name="matching/matching" />
      <Tabs.Screen name="matching/all-requests" />
      <Tabs.Screen name="matching/results" />
      <Tabs.Screen name="matching/finish" />
      <Tabs.Screen name="matching/report-success" />
      <Tabs.Screen name="matching/connection-request" />

    </Tabs>
  );
}