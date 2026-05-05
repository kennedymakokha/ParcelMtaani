/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { useTheme } from '../../contexts/themeContext';

const SingleBarChart = ({ data, title }: any) => {
  const { colors } = useTheme();

  if (!data || !data.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text }}>{title}</Text>
        <Text style={{ color: colors.secondary }}>No data available</Text>
      </View>
    );
  }

  // ✅ FILTER OUT ZERO VALUES
  const filteredData = data.filter((d: any) => d.parcelsToday > 0);

  // ✅ HANDLE EMPTY AFTER FILTER
  if (!filteredData.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text }}>{title}</Text>
        <Text style={{ color: colors.secondary }}>
          No non-zero data available
        </Text>
      </View>
    );
  }

  const height = 220;
  const padding = 40;

  const maxValue = Math.max(
    ...filteredData.map((d: any) => d.parcelsToday)
  );

  const scaleY = (value: number): number => {
    if (maxValue === 0) return 0;
    const h = (value / maxValue) * (height - padding * 2);
    return value > 0 && h < 4 ? 4 : h;
  };

  const barWidth = 30;
  const spacing = 30;
  const totalWidth =
    padding * 2 + filteredData.length * (barWidth + spacing);

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={totalWidth} height={height}>
          {/* X axis */}
          <Line
            x1={padding}
            y1={height - padding}
            x2={totalWidth - padding}
            y2={height - padding}
            stroke={colors.border}
          />

          {filteredData.map((item: any, index: any) => {
            const barHeight = scaleY(item.parcelsToday);
            const x = padding + index * (barWidth + spacing);
            const y = height - padding - barHeight;

            return (
              <React.Fragment key={item.pickupId}>
                {/* Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={colors.primary}
                />

                {/* Value */}
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill={colors.text}
                  textAnchor="middle"
                >
                  {item.parcelsToday}
                </SvgText>

                {/* Label (slanted) */}
                <SvgText
                  x={x + barWidth / 2}
                  y={height - padding + 10}
                  fontSize="9"
                  fill={colors.text}
                  textAnchor="end"
                  transform={`rotate(-20, ${x + barWidth / 2}, ${
                    height - padding + 5
                  })`}
                >
                  {item.pickupName}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
};

export default SingleBarChart;