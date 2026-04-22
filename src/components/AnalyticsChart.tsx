// src/components/AnimatedAnalyticsChart.tsx
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { LineChart, BarChart, Grid } from "react-native-svg-charts";
import Animated, { useSharedValue, withTiming, useAnimatedProps } from "react-native-reanimated";
import { Path } from "react-native-svg";
import { useTheme } from "../contexts/themeContext";

interface ChartSeries {
  label: string;
  color: string;
  data: number[];
}

interface AnalyticsChartProps {
  title: string;
  type: "line" | "bar";
  series: ChartSeries[];
}

export const AnimatedAnalyticsChart = ({ title, type, series }: AnalyticsChartProps) => {
  // Shared value for animation
  const progress = useSharedValue(0);
  const { colors } = useTheme();
  useEffect(() => {
    // Animate from 0 → 1 when mounted
    progress.value = withTiming(1, { duration: 1000 });
  }, []);

  // Animated path for line chart
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8,color:colors.text}}>{title}</Text>

      {/* Legend */}
      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {series.map((s, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
            <View style={{ width: 14, height: 14, backgroundColor: s.color, borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontSize: 14 ,color:colors.text}}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Chart */}
      <View style={{ height: 200 }}>
        {type === "line" &&
          series.map((s, i) => (
            <LineChart
              key={i}
              style={{ flex: 1, position: i > 0 ? "absolute" : "relative" }}
              data={s.data}
              svg={{ stroke: s.color, strokeWidth: 3 }}
              contentInset={{ top: 20, bottom: 20 }}
            >
              <Grid />
              {/* Animated Path */}
              <AnimatedPath
                animatedProps={useAnimatedProps(() => ({
                  strokeDasharray: [progress.value * 1000, 1000], // reveal line gradually
                }))}
                stroke={s.color}
                strokeWidth={3}
              />
            </LineChart>
          ))}

        {type === "bar" &&
          series.map((s, i) => (
           

            <BarChart
              key={i}
              style={{ border: 1, borderColor: colors.border,backgroundColor:
                colors.background, flex: 1, position: i > 0 ? "absolute" : "relative" }}
              data={s.data.map((val) => val * progress.value)} // animate bar height
              svg={{ fill: colors.primary || s.color }}
              contentInset={{ top: 20, bottom: 20 }}
              spacingInner={0.3}
            >
              <Grid />
            </BarChart>
          ))}
      </View>
    </View>
  );
};
