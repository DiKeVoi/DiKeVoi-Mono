// filepath: frontend/components/request/location-picker.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Modal, FlatList} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { PresetLocation, PRESET_LOCATIONS } from "@/hooks/useSearchPlaces";

interface LocationPickerProps {
  label: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  placeholder: string;
  value: string;
  onSelect: (location: PresetLocation) => void;
}

export function LocationPicker({ label, iconName, placeholder, value, onSelect }: LocationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = PRESET_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (location: PresetLocation) => {
    onSelect(location);
    setSearchQuery("");
    setModalVisible(false);
  };

  return (
    <View className="space-y-2 mb-5">
      <ThemedText className="text-base font-semibold text-[#152249] dark:text-slate-200 mb-2">
        {label}
      </ThemedText>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="relative justify-center"
      >
        <View className="absolute left-4 z-10">
          <MaterialIcons name={iconName} size={22} color="#152249" opacity={0.6} />
        </View>
        <View className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#152249]/10 border border-slate-200 dark:border-[#152249]/20 rounded-xl justify-center">
          <ThemedText className={`text-base ${value ? "text-slate-900 dark:text-white" : "text-gray-400"}`}>
            {value || placeholder}
          </ThemedText>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-[#152249] rounded-t-2xl max-h-[70%]">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <ThemedText className="text-lg font-bold text-[#152249] dark:text-white">
                Chọn {label}
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#152249" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <TextInput
                className="w-full h-12 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white"
                placeholder="Tìm kiếm..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800"
                >
                  <MaterialIcons name="location-on" size={24} color="#152249" opacity={0.6} />
                  <View className="ml-3 flex-1">
                    <ThemedText className="text-base text-slate-900 dark:text-white">
                      {item.name}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}