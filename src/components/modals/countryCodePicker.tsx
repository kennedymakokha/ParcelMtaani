import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { PrimaryButton } from '../PrimaryButton';

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

  const filtered = countries.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search),
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Select Country
        </Text>

        <TextInput
          placeholder="Search country or code"
          value={search}
          onChangeText={setSearch}
          style={[
            styles.search,
            { borderColor: colors.border, color: colors.text },
          ]}
        />

        <FlatList
          data={filtered}
          keyExtractor={item => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, { borderBottomColor: colors.border }]}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={[styles.flag]}>{item.flag}</Text>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.code, { color: colors.primary }]}>
                {item.dialCode}
              </Text>
            </TouchableOpacity>
          )}
        />

        <PrimaryButton onPress={onClose} title="Close" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  search: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  flag: { fontSize: 20, marginRight: 10 },
  name: { flex: 1, fontSize: 14 },
  code: { fontWeight: '600', fontSize: 14 },
  close: {
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 16,
  },
});
