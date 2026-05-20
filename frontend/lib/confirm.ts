import { Alert, Platform } from "react-native";

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = "Xác nhận"
): void {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Hủy", style: "cancel" },
      { text: confirmLabel, onPress: onConfirm },
    ]);
  }
}
