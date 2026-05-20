import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/AuthContext";
import { useSafeBack } from "@/hooks/useSafeBack";
import { authService } from "@/services/auth";

export default function OTPScreen() {
  const safeBack = useSafeBack("/login" as any);
  const { email } = useLocalSearchParams<{ email: string }>();
  const { login } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(30);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>; 
    
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Xử lý khi gõ từng số
  const handleOtpChange = (value: string, index: number) => {
    // Chỉ lấy số
    const numericValue = value.replace(/[^0-9]/g, '');
    
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    setErrorMessage(""); // Xóa lỗi khi người dùng bắt đầu gõ lại

    if (numericValue !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMessage("Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    try {
      await login(email as string, fullOtp);
      Keyboard.dismiss();
      router.replace("/(tabs)/home");
    } catch {
      console.error("OTP verification failed");
      setErrorMessage("Mã OTP không chính xác. Vui lòng thử lại.");
    }
  };

  const handleResendOtp = async () => {
    if (countdown === 0) {
      try {
        await authService.sendOtp(email as string);
        setOtp(["", "", "", "", "", ""]);
        setErrorMessage("");
        setCountdown(30);
        inputRefs.current[0]?.focus();
      } catch {
        setErrorMessage("Không thể gửi lại mã. Vui lòng thử lại.");
      }
    }
  };

return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#f8f6f6] dark:bg-[#221610]"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Đã gỡ bỏ h-full và min-h-[795px], thay bằng pb-10 để khung tự động ôm gọn nội dung */}
        <View className="w-full max-w-[480px] bg-white dark:bg-slate-900 overflow-hidden rounded-xl shadow-xl pb-10">
          
          {/* Top App Bar / Header */}
          <View className="flex-row items-center p-4 justify-between border-b border-transparent">
            <TouchableOpacity 
              onPress={safeBack}
              className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 active:opacity-70"
            >
              <MaterialIcons name="arrow-back" size={24} color="#152249" />
            </TouchableOpacity>
          </View>

          {/* Text Section */}
          <View className="flex-col px-6 pt-4 pb-8">
            <Text className="text-[#152249] dark:text-slate-100 text-[28px] font-bold leading-tight mb-3">
              Xác thực OTP
            </Text>
            <Text className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
              Vui lòng nhập mã gồm 6 chữ số đã được gửi đến email:
            </Text>
            <Text className="text-[#152249] dark:text-[#F9F871] text-base font-bold mt-1">
              {email || "sinhvien@student.edu.vn"}
            </Text>
          </View>

          {/* OTP Input Section */}
          <View className="px-6 space-y-6">
            <View className="flex-row justify-between w-full max-w-[360px] self-center mb-2">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  className={`w-12 h-14 rounded-2xl border-2 text-center text-xl font-bold ${
                    errorMessage 
                      ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20" 
                      : digit 
                        ? "border-[#152249] dark:border-[#F9F871] text-[#152249] dark:text-[#F9F871] bg-white dark:bg-slate-800" 
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  }`}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {errorMessage ? (
              <Text className="text-sm text-red-500 font-medium text-center">
                {errorMessage}
              </Text>
            ) : null}

            {/* Main Action Button */}
            <TouchableOpacity 
              onPress={handleVerify}
              className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 shadow-md mt-4 ${
                otp.join("").length === 6 ? "bg-[#152249] active:opacity-90" : "bg-slate-300 dark:bg-slate-700"
              }`}
              disabled={otp.join("").length < 6}
            >
              <Text className={`font-bold text-base ${otp.join("").length === 6 ? "text-white" : "text-slate-500 dark:text-slate-400"}`}>
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>

          {/* Resend Action */}
          <View className="px-6 mt-8 items-center">
            <Text className="text-slate-500 dark:text-slate-400 text-sm">
              Chưa nhận được mã?
            </Text>
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={countdown > 0}
              className="mt-2 p-2"
            >
              <Text className={`font-bold text-base ${countdown > 0 ? "text-slate-400 dark:text-slate-500" : "text-[#152249] dark:text-[#F9F871]"}`}>
                Gửi lại mã {countdown > 0 ? `(${countdown}s)` : ""}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}