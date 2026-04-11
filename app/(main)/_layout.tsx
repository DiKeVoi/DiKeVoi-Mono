import { Tabs } from "expo-router";
import { CircleUserRound, Home, Plus } from "lucide-react-native";
import { Platform, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#152249",
        tabBarInactiveTintColor: "#94A3B8",
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          height: Platform.OS === "ios" ? 88 : 68,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F1F5F9",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="request"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 58,
                height: 58,
                backgroundColor: "#152249",
                borderRadius: 29,
                justifyContent: "center",
                alignItems: "center",
                marginTop: -35,
                borderWidth: 4,
                borderColor: "#FFFFFF",
                elevation: 5,
                shadowColor: "#152249",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                zIndex: 99999,
              }}
            >
              <Plus size={32} color="#F9F871" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <CircleUserRound size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="all-requests"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
