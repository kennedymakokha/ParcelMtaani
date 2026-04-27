/* eslint-disable react-native/no-inline-styles */
import { 
  Text, 
  ViewStyle,
  ScrollView,
  TouchableOpacity} from "react-native";
import { useTheme } from "../contexts/themeContext";


interface FilterChipsProps<T> {
  data: T[];
  selected: T | null;
  onSelect: (value: T | null) => void;
  labelExtractor?: (item: T) => string;
  containerStyle?: ViewStyle;
  showAllOption?: boolean;
  allLabel?: string;
}

export default function FilterChips<T>({
  data,
  selected,
  onSelect,
  labelExtractor = item => String(item),

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
          onPress={() => onSelect(null)}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 8,
            backgroundColor:
              selected === null ? colors.primary : colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: selected === null ? '#fff' : colors.subText,
              fontWeight: '500',
            }}
          >
            {allLabel}
          </Text>
        </TouchableOpacity>
      )}

      {/* ✅ Dynamic chips */}
      {data.map((item, index) => {
        const label = labelExtractor(item);
        const isSelected = selected === item;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(item)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
            
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: isSelected
                ? colors.primary
                : colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: isSelected ? '#fff' : colors.subText,textTransform: 'capitalize',
                fontWeight: '500',
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}


