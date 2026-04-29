/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity, Animated } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { useSelector } from "react-redux";

import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/themeContext";

interface DataPoint {
  key: string;
  value: number;
}

interface Dataset {
  label: string;
  color?: string;
  data: DataPoint[];
}

interface LineGraphProps {
  datasets: Dataset[];
  title: string;
  startHour?: number;
  endHour?: number;
}

const { width: screenWidth } = Dimensions.get("window");

const MultiLineChart: React.FC<LineGraphProps> = ({
  datasets = [],
  title,
  startHour,
  endHour
}) => {
  const { colors } = useTheme();
  const { user: { role } } = useSelector((state: any) => state.auth);

  const [tooltip, setTooltip] = useState<any>(null);
  const [showLegend, setShowLegend] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;
  const hideTimer = useRef<any>(null);

  const width = screenWidth - 60;
  const height = 240;
  const padding = 32;

  const datasetColors = useMemo(() => {
    return datasets.map(ds => ds.color ?? colors.primary);
  }, [datasets, colors.primary]);

  const hideLegend = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 10, duration: 200, useNativeDriver: true })
    ]).start(() => setShowLegend(false));
  };

  useEffect(() => {
    if (showLegend) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true })
      ]).start();

      hideTimer.current && clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => hideLegend(), 6000);
    }
    return () => hideTimer.current && clearTimeout(hideTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLegend]);

  if (!datasets.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text }}>{title}</Text>
        <Text style={{ color: colors.secondary }}>No data available</Text>
      </View>
    );
  }

  const allValues = datasets.flatMap(ds => ds.data.map(d => d.value));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  const start = startHour ?? 0;
  const end = endHour ?? 23;
  const labels = Array.from({ length: end - start + 1 }, (_, i) =>
    (start + i).toString().padStart(2, "0")
  );

  const stepX = (width - padding * 2) / (labels.length - 1);

  const scaleY = (value: number) =>
    height -
    padding -
    ((value - minValue) / (maxValue - minValue || 1)) *
    (height - padding * 2);

  const buildSmoothPath = (points: any[]) => {
    if (!points.length) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2;
      const yMid = (points[i].y + points[i + 1].y) / 2;
      const cpX1 = (xMid + points[i].x) / 2;
      const cpX2 = (xMid + points[i + 1].x) / 2;
      d += ` Q ${cpX1} ${points[i].y}, ${xMid} ${yMid}`;
      d += ` Q ${cpX2} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
    }
    return d;
  };

  const ySteps = 5;
  const yAxisValues = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round(minValue + ((maxValue - minValue) / ySteps) * i)
  );

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "700" }}>
          {title}
        </Text>

        <TouchableOpacity onPress={() => setShowLegend(!showLegend)}>
          <Icon name="information-circle-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Chart */}
      <Svg width={width} height={height}>
        <Defs>
          {datasetColors.map((color, index) => (
            <LinearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </LinearGradient>
          ))}
        </Defs>

        {/* Y Grid */}
        {yAxisValues.map((value, index) => {
          const y = scaleY(value);
          return (
            <React.Fragment key={index}>
              <Line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke={colors.border}
                strokeDasharray="4"
              />
              <SvgText
                x={padding - 8}
                y={y + 3}
                fontSize="10"
                fill={colors.text}
                textAnchor="end"
              >
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Axes */}
        <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke={colors.border} />
        <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={colors.border} />

        {/* Lines */}
        {datasets.map((dataset, dsIndex) => {
          const points = labels.map((hour, index) => {
            const dp = dataset.data.find(d => d.key === hour);
            const value = dp ? dp.value : 0;
            return {
              x: padding + index * stepX,
              y: scaleY(value),
              value,
              key: hour
            };
          });

          const linePath = buildSmoothPath(points);

          return (
            <React.Fragment key={dsIndex}>
              <Path d={linePath} fill="none" stroke={datasetColors[dsIndex]} strokeWidth={3} />

              {points.map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={datasetColors[dsIndex]}
                  onPress={() => setTooltip({ ...p, label: dataset.label })}
                />
              ))}
            </React.Fragment>
          );
        })}

        {/* X Labels */}
        {labels.map((label, index) => (
          <SvgText
            key={index}
            x={padding + index * stepX}
            y={height - 8}
            fontSize="10"
            fill={colors.text}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}
      </Svg>

      {/* Tooltip */}
      {tooltip && (
        <View
          style={{
            position: "absolute",
            top: tooltip.y + 10,
            left: tooltip.x - 40,
            backgroundColor: colors.card,
            padding: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border
          }}
        >
          <Text style={{ color: colors.text, fontSize: 12 }}>{tooltip.label}</Text>
          <Text style={{ color: colors.primary, fontSize: 12 }}>
            {tooltip.key}: {role === "admin" ? tooltip.value : ""}
          </Text>
        </View>
      )}

      {/* Legend */}
      {showLegend && (
        <Animated.View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 12,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {datasets.map((ds, index) => (
            <View key={index} style={{ flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 6 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: datasetColors[index],
                  marginRight: 6,
                  borderRadius: 3
                }}
              />
              <Text style={{ color: colors.text, fontSize: 12 }}>{ds.label}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

export default MultiLineChart;
