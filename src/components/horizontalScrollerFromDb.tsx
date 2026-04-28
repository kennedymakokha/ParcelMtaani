/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Text,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';

interface FilterChipsProps<T> {
  data: T[];
  selectedId: string | number | null;
  onSelect: (id: string | number | null, item?: T | null) => void;

  idExtractor: (item: T) => string | number;
  labelExtractor: (item: T) => string;
  countExtractor?: (item: T) => number;

  containerStyle?: ViewStyle;
  showAllOption?: boolean;
  allLabel?: string;
}

export default function FilterChipsFDB<T>({
  data,
  selectedId,
  onSelect,
  idExtractor,
  labelExtractor,
  countExtractor,
  showAllOption = true,
  allLabel = 'All',
}: FilterChipsProps<T>) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        { flexDirection: 'row', alignItems: 'center', height: 40 },
      ]}
    >
      {/* ✅ All option */}
      {showAllOption && (
        <TouchableOpacity
          onPress={() => onSelect(null, null)}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 4,
            borderRadius: 10,
            marginRight: 8,
            backgroundColor: selectedId === null ? colors.primary : colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: selectedId === null ? '#fff' : colors.subText,
              fontWeight: '500',
            }}
          >
            {allLabel}
          </Text>
        </TouchableOpacity>
      )}

      {/* ✅ Dynamic chips */}
      {data.map((item, index) => {
        const id = idExtractor(item);
        const label = labelExtractor(item);
        const itemCount = countExtractor ? countExtractor(item) : 0;
        const isSelected = selectedId === id;

        return (
          <TouchableOpacity
            key={id ?? index}
            onPress={() => onSelect(id, item)}
            style={{
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 4,
              borderRadius: 10,
              marginRight: 8,
              backgroundColor: isSelected ? colors.primary : colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: isSelected ? '#fff' : colors.subText,
                textTransform: 'capitalize',
                fontWeight: '500',
                marginRight: 6,
              }}
            >
              {label}
            </Text>

            {/* ✅ Count badge */}
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: isSelected ? '#fff' : colors.border,
              }}
            >
              <Text
                style={{
                  color: isSelected ? colors.primary : colors.subText,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {itemCount}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}