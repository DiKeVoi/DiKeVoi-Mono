import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function MatchingScreen() {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  
  const floatAnim = useRef(new Animated.Value(0)).current;

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            delay: delay,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createPulse(pulseAnim1, 0).start();
    createPulse(pulseAnim2, 1000).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin), 
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 0.65, // 65%
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, 
    }).start();

  });

  const handleCancelSearch = () => {
    router.push("/matching/results");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#221610]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={handleCancelSearch} className="p-2 -ml-2 active:opacity-50">
          <MaterialIcons name="arrow-back-ios" size={24} color="#152249" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#152249] dark:text-white">
          Đi ké với!
        </Text>
        <View className="w-10" />
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-8">
        
        {/* KHU VỰC ANIMATION RADAR */}
        <View className="relative w-64 h-64 mb-12 items-center justify-center">
          
          <Animated.View 
            className="absolute inset-0 rounded-full border-2 border-[#152249]/10 bg-[#152249]/5"
            style={{
              transform: [{ scale: pulseAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }],
              opacity: pulseAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] })
            }}
          />

          <Animated.View 
            className="absolute inset-8 rounded-full border-2 border-[#152249]/20 bg-[#152249]/10"
            style={{
              transform: [{ scale: pulseAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }],
              opacity: pulseAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] })
            }}
          />

          <View className="relative z-10 w-24 h-24 rounded-full border-4 border-white shadow-xl shadow-[#152249]/30 bg-[#152249] items-center justify-center overflow-hidden">
            
          </View>

          <Animated.View 
            className="absolute top-4 left-10 w-3 h-3 bg-[#152249] rounded-full"
            style={{
              opacity: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }),
              transform: [
                { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                { scale: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }
              ]
            }} 
          />
          
          <Animated.View 
            className="absolute bottom-12 right-6 w-4 h-4 bg-[#152249] rounded-full" 
            style={{
              opacity: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.2] }),
              transform: [
                { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [-5, 15] }) }
              ]
            }}
          />

          <Animated.View 
            className="absolute top-20 right-4 w-2 h-2 bg-[#152249] rounded-full" 
            style={{
              opacity: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] }),
              transform: [
                { translateX: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) },
                { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }
              ]
            }}
          />
        </View>

        <Text className="text-2xl font-bold text-[#152249] dark:text-white text-center mb-4 leading-tight">
          Đang tìm kiếm bạn đồng hành phù hợp...
        </Text>

        <View className="flex-row items-center justify-center gap-2 px-4 py-2 bg-[#F9F871]/20 border border-[#F9F871]/60 rounded-full mb-12">
          <MaterialIcons name="verified-user" size={18} color="#152249" />
          <Text className="text-sm font-semibold text-[#152249]">
            Ưu tiên cùng giới tính cho bạn
          </Text>
        </View>

        <View className="w-full max-w-[240px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <Animated.View 
            className="h-full bg-gradient-to-r from-[#152249] to-[#F9F871] rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"]
              }),
              backgroundColor: '#152249' 
            }}
          />
        </View>
        <Text className="mt-3 text-xs font-bold text-slate-400 tracking-widest uppercase">
          Matching 65%
        </Text>

        <TouchableOpacity
          onPress={handleCancelSearch}
          className="mt-12 p-2 active:opacity-50"
        >
          <Text className="text-slate-500 font-medium text-sm">
            Hủy tìm kiếm
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}