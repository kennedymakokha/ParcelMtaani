import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const formatDate = (date: any) => {
  if (!date) return 'Pending';
  return new Date(date).toLocaleString();
};

const Step = ({ icon, label, value, active, colors }: any) => (
  <View style={styles.stepRow}>
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: active ? colors.primary : colors.border },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? '#fff' : colors.text} />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={[styles.stepLabel, { color: colors.secondary }]}>
        {label}
      </Text>
      <Text style={[styles.stepValue, { color: colors.text }]}>{value}</Text>
    </View>
  </View>
);

const JourneyTimeline = ({ journey, colors }: any) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles?.title, { color: colors.text }]}>
        Journey Timeline
      </Text>

      <Step
        icon="download-outline"
        label="Dropped At"
        value={`${formatDate(journey.DroppedAt)}-RecievedBy:${journey.recievedBy?.name??""}`}
        active={!!journey.DroppedAt}
        colors={colors}
      />

      <Step
        icon="send-outline"
        label="Dispatched At"
        value={`${formatDate(journey.DispatchedAt)}-By:${journey.DispatchedBy?.name??""} To:${journey.DispatchedTo?.name??""}}`}
        active={!!journey.DispatchedAt}
        colors={colors}
      />

      <Step
        icon="business-outline"
        label="Arrived At"
        value={`${formatDate(journey.ArrivedAt)}-Recieved By:${journey.deliveredTo?.name??""}`}
        active={!!journey.ArrivedAt}
        colors={colors}
      />

      <Step
        icon="checkmark-done-outline"
        label="Collected At"
        value={`${formatDate(journey.CollectedAt)} Handed Over By:${journey.deliveredTo?.name??""}`}
        active={!!journey.CollectedAt}
        colors={colors}
      />

      {/* Meta Info */}
      <View style={styles.meta}>
        <Text style={{ color: colors.secondary }}>
          Parcel Code: {journey.parcel_id?.code}
        </Text>
        <Text style={{ color: colors.secondary }}>
          Received By: {journey.recievedBy?.name}
        </Text>
        <Text style={{ color: colors.secondary }}>
          Dispatched By: {journey.DispatchedBy?.name??""}
        </Text>
      </View>
    </View>
  );
};

export default JourneyTimeline;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepLabel: {
    fontSize: 12,
  },

  stepValue: {
    fontSize: 14,
    fontWeight: '500',
  },

  meta: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 4,
  },
});
