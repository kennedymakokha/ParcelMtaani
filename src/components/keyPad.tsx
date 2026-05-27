/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/themeContext';

const Keypad = ({
  value,
  onChange,
  activeField,
  defaultValue = '',
}: any) => {
  const { colors } = useTheme();

  const [isABC, setIsABC] = useState(false);

  // Initialize with default value
  useEffect(() => {
    if (!value && defaultValue) {
      onChange(defaultValue);
    }
  }, [defaultValue]);

  const handlePress = (key: string) => {
    if (key === 'C') {
      onChange('');
      return;
    }

    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }

    // prevent multiple decimals
    if (key === '.' && value.includes('.')) return;

    const newValue = value + key.toUpperCase();
    onChange(newValue);
  };

  const numberKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', '.', '⌫'],
  ];

  const letterKeys = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y'],
    ['Z', '⌫', 'C'],
  ];

  return (
    <View style={{ marginTop: 24 }}>
      {activeField === 'customerPin' && (
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 15,
            backgroundColor: colors.card,
            borderRadius: 10,
            padding: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => setIsABC(false)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: !isABC ? colors.primary : 'transparent',
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: !isABC ? '#fff' : colors.text,
                fontWeight: 'bold',
              }}
            >
              123
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsABC(true)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: isABC ? colors.primary : 'transparent',
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: isABC ? '#fff' : colors.text,
                fontWeight: 'bold',
              }}
            >
              ABC
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isABC
        ? numberKeys.map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              {row.map(key => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handlePress(key)}
                  style={{
                    backgroundColor: colors.card,
                    width: '31%',
                    paddingVertical: 18,
                    borderRadius: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        : letterKeys.map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              {row.map(key => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handlePress(key)}
                  style={{
                    backgroundColor: key === 'C' ? colors.danger : colors.card,
                    width: '18%',
                    paddingVertical: 15,
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor:
                      key === 'C' ? colors.danger : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: key === 'C' ? '#fff' : colors.text,
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
    </View>
  );
};

export default Keypad;