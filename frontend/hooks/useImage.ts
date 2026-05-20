import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY || ""; 

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUploadImage = async (): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Lỗi quyền", "Bạn cần cấp quyền truy cập thư viện ảnh để đổi avatar.");
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      setIsUploading(true);
      const asset = result.assets[0];

      const localUri = asset.uri;
      const filename = localUri.split('/').pop() || 'avatar.jpg';
      
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      
      formData.append('image', {
        uri: localUri,
        name: filename,
        type: type,
      } as any); 

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error?.message || "Upload thất bại");
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ tải ảnh. Vui lòng thử lại.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { pickAndUploadImage, isUploading };
}