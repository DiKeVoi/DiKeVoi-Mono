import { useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastHandle {
  toast: ToastState | null;
  toastY: Animated.Value;
  show: (message: string, actionLabel?: string, onAction?: () => void) => void;
}

export function useToast(): ToastHandle {
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastY = useRef(new Animated.Value(120)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (message: string, actionLabel?: string, onAction?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, actionLabel, onAction });
    toastY.setValue(120);
    Animated.spring(toastY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();
    timer.current = setTimeout(() => {
      Animated.timing(toastY, { toValue: 120, duration: 250, useNativeDriver: true }).start(() =>
        setToast(null)
      );
    }, 3500);
  };

  return { toast, toastY, show };
}

export function Toast({
  toast,
  toastY,
  bottomOffset = 90,
}: {
  toast: ToastState | null;
  toastY: Animated.Value;
  bottomOffset?: number;
}) {
  if (!toast) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: toastY }],
        position: "absolute",
        bottom: bottomOffset,
        left: 16,
        right: 16,
      }}
    >
      <View
        style={{
          backgroundColor: "#1e293b",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <MaterialIcons name="info-outline" size={20} color="#F9F871" />
        <Text style={{ color: "#f1f5f9", fontSize: 13, fontWeight: "600", flex: 1 }}>
          {toast.message}
        </Text>
        {toast.actionLabel && toast.onAction && (
          <TouchableOpacity onPress={toast.onAction} activeOpacity={0.8}>
            <Text style={{ color: "#F9F871", fontSize: 13, fontWeight: "800" }}>
              {toast.actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
