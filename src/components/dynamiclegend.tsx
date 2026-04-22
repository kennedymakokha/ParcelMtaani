import React from "react";
import { View, Text } from "react-native";

interface LegendItem {
  label: string;
  color: string;
}

interface ChartLegendProps {
  items: LegendItem[];
}

export const ChartLegend = ({ items }: ChartLegendProps) => (
  <View style={{ flexDirection: "row", marginBottom: 12, flexWrap: "wrap" }}>
    {items.map((item, index) => (
      <View key={index} style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 6 }}>
        <View style={{ width: 14, height: 14, backgroundColor: item.color, borderRadius: 3, marginRight: 6 }} />
        <Text style={{ fontSize: 14 }}>{item.label}</Text>
      </View>
    ))}
  </View>
);
