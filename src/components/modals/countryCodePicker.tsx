/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
// Swapped to utilize your unified theme engine
import { PrimaryButton } from '../PrimaryButton';
import { useTheme } from '../../contexts/themeContext';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  countries: Country[];
}

export const CountryPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelect,
  countries,
}) => {
  const [search, setSearch] = useState('');
  const { colors } = useTheme();

  // Instantly resets search text whenever the modal lifecycle toggles open/close
  useEffect(() => {
    if (!visible) {
      setSearch('');
    }
  }, [visible]);

  // Performs clean processing calculations dynamically
  const filteredCountries = countries.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search),
  );

  return (
    <Modal 
      visible={visible} 
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          {/* Header Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Select Country
          </Text>

          {/* Optimized Search Bar */}
          <TextInput
            placeholder="Search country or dial code..."
            placeholderTextColor={colors.subText || '#94a3b8'}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            style={[
              styles.search,
              { 
                borderColor: colors.border, 
                color: colors.text,
                backgroundColor: colors.card,
              },
            ]}
          />

          {/* High-Performance Scrolling Virtual List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={item => item.code}
            keyboardShouldPersistTaps="handled" // Allows selections to go through in one tap while typing
            maxToRenderPerBatch={15} // Performance Optimization: Prevents rendering off-screen rows instantly
            initialNumToRender={20}   // Optimization: Bounds memory allocations safely
            windowSize={11}           // Optimization: Keeps viewport rendering incredibly responsive
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {/* Highlights country selection using your brand secondary orange */}
                <Text style={[styles.code, { color: colors.secondary || '#f97316' }]}>
                  {item.dialCode}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Action Footer */}
          <View style={styles.footer}>
            <PrimaryButton onPress={onClose} title="Cancel" variant="outline" />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// ==========================================
// CENTRALIZED PERFORMANCE DIALOG DESIGN
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  search: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1.2,
  },
  flag: { 
    fontSize: 22, 
    marginRight: 14,
  },
  name: { 
    flex: 1, 
    fontSize: 15,
    fontWeight: '600',
  },
  code: { 
    fontWeight: '700', 
    fontSize: 15,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 4,
  },
});