import { OnboardingData } from "@/types/onboardingData";
import { ThemedText, ThemedView } from "@components/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { navigate } from "expo-router/build/global-state/routing";
import { useState } from "react";
import { Pressable, TouchableHighlight } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
const onboardingData: OnboardingData[] = [
  {
    id: 1,
    title: "An Tâm - Cùng Trường",
    description: "100% người dùng xác thực bằng Email sinh viên VNU",
    detail: "Bạn đồng hành là đồng môn, không lo người lạ.",
    image: require("@/assets/pages/onboarding/onboarding-1.svg"),
  },
  {
    id: 2,
    title: "Tiết kiệm - Cùng Đường",
    description: "Chia sẻ tiền xăng, tiết kiệm hơn Grab, thoải mái hơn Bus",
    detail: "Đi học chưa bao giờ tiện lợi đến thế.",
    image: require("@/assets/pages/onboarding/onboarding-2.svg"),
  },
  {
    id: 3,
    title: "Tiện Lợi - Cùng Đi",
    description: "Đặt lịch nhanh, ghép cặp chuẩn",
    detail: "Đi Ké Với! - Xuống toà nhanh, đi học vui hơn.",
    image: require("@/assets/pages/onboarding/onboarding-3.svg"),
  },
];
export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasViewedOnboarding', 'true');
      
      navigate("/login"); 
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ThemedView className="flex-1 pt-12 items-center gap-5">
      {/* Top bar */}
      <ThemedView className="w-full flex-row items-center justify-between p-2">
        <Image
          source={require("@/assets/dikevoi-logo.svg")}
          className="mb-4 h-12 w-12"
          contentFit="contain"
        />
          <Pressable
            onPress={handleFinishOnboarding}
          >
            <ThemedText className="font-bold text-slate-600 text-base">
              Bỏ qua
            </ThemedText>
          </Pressable>
      </ThemedView>
      <ThemedView className="flex-1 w-full items-center justify-center">
        <Animated.View
          key={currentIndex}
          entering={FadeInRight.duration(300)}
          exiting={FadeOutLeft.duration(300)}
          className={"flex-1 w-full items-center justify-center"}
        >
          <ThemedView className="flex-1 w-full items-center justify-center">
            <Image
              source={onboardingData[currentIndex].image}
              className="mb-4 w-80 h-80"
              contentFit="contain"
            />
            <ThemedView className="items-center px-6">
              <ThemedText className="text-3xl text-primary font-bold text-center mb-4">
                {onboardingData[currentIndex].title}
              </ThemedText>
              <ThemedText className="text-base font-semibold text-center text-secondary">
                {onboardingData[currentIndex].description}
              </ThemedText>
              <ThemedText className="text-base font-semibold text-center text-secondary">
                {onboardingData[currentIndex].detail}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Animated.View>
      </ThemedView>

      {/* Navigation */}
      <ThemedView className="w-full items-center">
        <ThemedView className="flex-row items-center justify-center gap-4 mb-4">
          {onboardingData.map((item, index) => (
            <Pressable
              key={item.id}
              className={`h-3 rounded-full ${
                index === currentIndex ? "bg-primary w-6" : "bg-gray-300 w-3"
              } transition-all duration-200`}
              onPress={() => setCurrentIndex(index)}
            />
          ))}
        </ThemedView>
        <TouchableHighlight
          onPress={() => {
            setCurrentIndex((prev) =>
              Math.min(prev + 1, onboardingData.length - 1),
            );
            if (currentIndex === onboardingData.length - 1) {
              handleFinishOnboarding();
            }
          }}
          className="mb-8 rounded-xl w-4/5 h-16 bg-primary py-3 items-center justify-center"
        >
          <ThemedText className="text-white font-bold text-xl">
            {currentIndex === onboardingData.length - 1
              ? "Bắt đầu"
              : "Tiếp theo"}
          </ThemedText>
        </TouchableHighlight>
      </ThemedView>
    </ThemedView>
  );
}
