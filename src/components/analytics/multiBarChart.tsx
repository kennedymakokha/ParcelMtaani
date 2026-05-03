/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { View, Text, ScrollView } from "react-native";
import Svg, { Rect, Text as SvgText, Line } from "react-native-svg";
import { useTheme } from "../../contexts/themeContext";

interface GroupedData {
  pickupId: string;
  pickupName: string;
  totalParcels: number;
  delivered: number;
  pending: number;
  collected: number;
  cancelled: number;
}

interface MultiBarChartProps {
  data: GroupedData[];
  title: string;
}

const MultiBarChart: React.FC<MultiBarChartProps> = ({ data, title }) => {
  const { colors } = useTheme();

  if (!data || !data.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text }}>{title}</Text>
        <Text style={{ color: colors.secondary }}>No data available</Text>
      </View>
    );
  }

  const height = 240;
  const padding = 40;

  const allValues = data.flatMap(d => [
    d.totalParcels,
    d.delivered,
    d.pending,
    d.collected,
    d.cancelled,
  ]);
  const maxValue = Math.max(...allValues);

  // Scale with minimum height for non-zero values
  const scaleY = (value: number) => {
    if (maxValue === 0) return 0;
    const h = (value / maxValue) * (height - padding * 2);
    return value > 0 && h < 4 ? 4 : h; // ensure visible bar
  };

  const categories = ["Total", "Delivered", "Pending", "Collected", "Cancelled"];
  const barColors = [
    colors.primary || "#1976D2",
    colors.success || "#4CAF50",
    colors.warning || "#FFA500",
    colors.secondary || "#2196F3",
    colors.error || "#F44336",
  ];

  const barWidth = 24;
  const groupSpacing = categories.length * barWidth + 40;
  const totalWidth = padding * 2 + data.length * groupSpacing;

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
      <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
        {title}
      </Text>

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

          {data.map((pickup, pickupIndex) => {
            const baseX = padding + pickupIndex * groupSpacing;

            return categories.map((cat, catIndex) => {
              const value =
                cat === "Total"
                  ? pickup.totalParcels
                  : cat === "Delivered"
                  ? pickup.delivered
                  : cat === "Pending"
                  ? pickup.pending
                  : cat === "Collected"
                  ? pickup.collected
                  : pickup.cancelled;

              const barHeight = scaleY(value);
              const x = baseX + catIndex * barWidth;
              const y = height - padding - barHeight;

              // If value = 0, draw a faint placeholder bar
              const fillColor = value === 0 ? "#E0E0E0" : barColors[catIndex];

              return (
                <React.Fragment key={`${pickup.pickupId}-${cat}`}>
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={fillColor}
                  />
                  <SvgText
                    x={x + barWidth / 2}
                    y={height - padding + 12}
                    fontSize="9"
                    fill={colors.text}
                    textAnchor="middle"
                  >
                    {cat[0]}
                  </SvgText>
                  {value > 0 && (
                    <SvgText
                      x={x + barWidth / 2}
                      y={y - 4}
                      fontSize="9"
                      fill={colors.text}
                      textAnchor="middle"
                    >
                      {value}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            });
          })}

          {/* Pickup names below groups */}
          {data.map((pickup, pickupIndex) => {
            const groupCenter =
              padding +
              pickupIndex * groupSpacing +
              (categories.length * barWidth) / 2;

            return (
              <SvgText
                key={pickup.pickupId}
                x={groupCenter}
                y={height - padding + 28}
                fontSize="10"
                fill={colors.primary}
                textAnchor="middle"
              >
                {pickup.pickupName}
              </SvgText>
            );
          })}
        </Svg>
      </ScrollView>

      {/* Legend */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
        {categories.map((cat, index) => (
          <View
            key={cat}
            style={{ flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 6 }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: barColors[index],
                marginRight: 6,
                borderRadius: 3,
              }}
            />
            <Text style={{ color: colors.text, fontSize: 12 }}>{cat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MultiBarChart;
