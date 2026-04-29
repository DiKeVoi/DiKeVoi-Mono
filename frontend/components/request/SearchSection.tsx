import React from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, Button, StyleSheet } from 'react-native';

interface SearchSectionProps {
  pickup: any;
  destination: any;
  activeInput: string | null;
  setActiveInput: (input: string | null) => void;
  searchPlaces: (query: string) => void;
  searchResults: any[];
  handleSelectPlace: (item: any) => void;
  styles: any;
  onConfirm: () => void;
  confirmDisabled: boolean;
}

export default function SearchSection({
  pickup,
  destination,
  activeInput,
  setActiveInput,
  searchPlaces,
  searchResults,
  handleSelectPlace,
  styles,
  onConfirm,
}: SearchSectionProps) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.input}
        placeholder="Nhập điểm đón..."
        value={activeInput === 'pickup' ? undefined : pickup.address}
        onFocus={() => setActiveInput('pickup')}
        onChangeText={searchPlaces}
      />
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Bạn muốn đi đâu?"
        value={activeInput === 'destination' ? undefined : destination.address}
        onFocus={() => setActiveInput('destination')}
        onChangeText={searchPlaces}
      />
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectPlace(item)}>
              <Text style={styles.resultText}>{item.title}</Text>
              <Text style={styles.subText}>{item.vicinity}</Text>
            </TouchableOpacity>
          )}
          style={styles.resultsList}
        />
      )}
      <View style={{ marginTop: 10 }}>
        <Button
          title="Xác nhận"
          onPress={onConfirm}
          color="#152249"
        />
      </View>
    </View>
  );
}
