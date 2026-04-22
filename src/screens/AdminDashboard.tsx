import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../contexts/themeContext";

// import { AnimatedAnalyticsChart } from "../components/AnalyticsChart";

export default function AdminDashboard() {
  const { colors } = useTheme();

  // Weekly trend series
  const weeklySeries = [
    { label: "Intake", color: colors.primary, data: [50, 80, 65, 120, 90, 140, 110] },
    { label: "Delivered", color: "#10b981", data: [30, 60, 55, 95, 85, 120, 95] },
  ];

  // Monthly totals series
  const monthlySeries = [
    { label: "Intake", color: colors.primary, data: [200, 250, 300, 280, 320, 350] },
    { label: "Delivered", color: "#10b981", data: [150, 220, 270, 260, 300, 330] },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      {/* Header */}
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, marginBottom: 16 }}>
        Admin Dashboard
      </Text>

      {/* KPI Cards */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <View style={{ backgroundColor: "#dbeafe", padding: 16, borderRadius: 12, flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text }}>Parcels</Text>
          <Text style={{ color: colors.secondary }}>120 Active</Text>
        </View>
        <View style={{ backgroundColor: "#dcfce7", padding: 16, borderRadius: 12, flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text }}>Delivered</Text>
          <Text style={{ color: colors.secondary }}>95 Completed</Text>
        </View>
      </View>

      {/* Analytics Charts */}
      {/* <AnimatedAnalyticsChart title="Weekly Parcel Trends" type="line" series={weeklySeries} />
      <AnimatedAnalyticsChart title="Monthly Totals (Jan–Jun)" type="bar" series={monthlySeries} /> */}

      {/* Action Button */}
      {/* <PrimaryButton title="Export Report" onPress={() => console.log("Exporting report...")} /> */}
    </View>
  );
}
