import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Plus, CircleUserRound } from 'lucide-react-native';

// Khai báo 3 màn hình duy nhất bạn muốn hiện nút
const VISIBLE_TABS = ["home/index", "matching/request", "account/profile"];



export default function MyCustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 pb-6 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex-row items-end justify-between">
      
      {state.routes.map((route: any, index: number) => {
        // 1. Nếu màn hình này không nằm trong danh sách 3 nút chính -> BỎ QUA
        if (!VISIBLE_TABS.includes(route.name)) return null;

        // 2. Kiểm tra xem Tab này có đang được chọn (active) không
        const isFocused = state.index === index;

        // 3. Hàm xử lý khi người dùng bấm vào nút
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === "matching/request") {
          return (
            <View key={route.key} className="relative -top-6 items-center">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                className="w-16 h-16 rounded-full bg-[#152249] shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-900"
              >
                <Plus size={32} color="#F9F871" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          );
        }
        

        const currentActiveRouteName = state.routes[state.index].name;
        let isActuallyFocused = state.index === index;

        if ((route.name === "account/profile" && currentActiveRouteName.includes("account")) || (route.name === "home/index" && currentActiveRouteName.includes("home"))) {
          isActuallyFocused = true;
        }

        // --- NÚT TRANG CHỦ & TÀI KHOẢN ---
        const Icon = route.name === "home/index" ? Home : CircleUserRound;
        const label = route.name === "home/index" ? "Trang chủ" : "Tài khoản";
        
        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.6}
            onPress={onPress}
            className="flex-col items-center gap-1"
          >
            <Icon 
              size={28} 
              color={isActuallyFocused ? "#152249" : "#94A3B8"} 
              strokeWidth={2}
            />
            <Text 
              className={`text-[10px] font-bold ${isActuallyFocused ? 'text-[#152249]' : 'text-slate-400'}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
      
    </View>
  );
}