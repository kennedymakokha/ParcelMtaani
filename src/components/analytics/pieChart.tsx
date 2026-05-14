/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../contexts/themeContext';

interface PickupData {
  pickupId: string;
  pickupName: string;
  totalParcels: number;
  ontransit: number;
  delivered: number;
  pending: number;
  collected: number;
  cancelled: number;
}

interface PieChartProps {
  data: PickupData;
  title: string;
}

const { width: screenWidth } = Dimensions.get('window');

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const { colors } = useTheme();

  const categories = [
    {
      label: 'Delivered',
      value: data.delivered,
      color: '#4CACF0',
    },
    {
      label: 'On Transit',
      value: data.ontransit,
      color: colors.success || '#4CAF50',
    },
    {
      label: 'Pending',
      value: data.pending,
      color: colors.warning || '#FFA500',
    },
    {
      label: 'Collected',
      value: data.collected,
      color: colors.secondary || '#2196F3',
    },
    {
      label: 'Cancelled',
      value: data.cancelled,
      color: colors.error || '#F44336',
    },
  ];

  const radius = 100;
  const cx = screenWidth / 2 - 30;
  const cy = 120;

  const total = categories.reduce((sum, c) => sum + c.value, 0);
  if (total === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text }}>{title}</Text>
        <Text style={{ color: colors.secondary }}>
          No data available for pie chart
        </Text>
      </View>
    );
  }

  let startAngle = 0;
  const slices = categories
    .map(c => {
      if (c.value === 0) return null;

      const angle = (c.value / total) * 2 * Math.PI;

      // Special case: full circle slice
      if (angle >= 2 * Math.PI) {
        return {
          pathData: `
            M ${cx} ${cy}
            m -${radius}, 0
            a ${radius},${radius} 0 1,0 ${radius * 2},0
            a ${radius},${radius} 0 1,0 -${radius * 2},0
          `,
          color: c.color,
          label: c.label,
          value: c.value,
        };
      }

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(startAngle + angle);
      const y2 = cy + radius * Math.sin(startAngle + angle);
      const largeArc = angle > Math.PI ? 1 : 0;

      const pathData = `
        M ${cx} ${cy}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;

      startAngle += angle;
      return { pathData, color: c.color, label: c.label, value: c.value };
    })
    .filter(Boolean);

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
      <Text
        style={{
          color: colors.primary,
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 12,
        }}
      >
        {title}
      </Text>

      <Svg width={screenWidth - 60} height={240}>
        {slices.map((slice: any, index) => (
          <Path key={index} d={slice.pathData} fill={slice.color} />
        ))}
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {slices.map((slice: any, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 12,
              marginBottom: 6,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: slice.color,
                marginRight: 6,
                borderRadius: 3,
              }}
            />
            <Text style={{ color: colors.text, fontSize: 12 }}>
              {slice.label}: {slice.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PieChart;
