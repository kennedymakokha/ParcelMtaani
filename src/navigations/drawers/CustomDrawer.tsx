import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, FlatList } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../contexts/themeContext";
import { UserRole } from "../../../types";
import { drawerConfig } from "./config";

export default function CustomDrawerContent(props: any) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState({ id: "1", name: "Nairobi Central" });

  // Example: role fetched from context or props
  const userRole: UserRole = "superAdmin"; // replace with dynamic value

  const menuItems = drawerConfig[userRole];

  const handleSwitch = (point: any) => {
    setSelectedPoint(point);
    setModalVisible(false);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.primary, padding: 24, alignItems: "center" }}>
        <Image
          source={{ uri: "https://via.placeholder.com/80" }}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }}
        />
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>ParcelMtaani</Text>
        <Text style={{ color: "#e0e7ff" }}>{userRole.toUpperCase()}</Text>

        {/* Super Admin Pickup Point Switcher */}
        {userRole === "superAdmin" && (
          <TouchableOpacity
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1e40af",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="location-outline" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
              {selectedPoint.name}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}
      </View>

      {/* Role‑based Drawer Items */}
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
        {menuItems.map((item) => (
          <DrawerItem
            key={item.label}
            label={item.label}
            icon={({ color, size }) => <Ionicons name={item.icon} size={size} color={color} />}
            onPress={() => props.navigation.navigate(item.screen)}
          />
        ))}
      </View>

      {/* Footer */}
      <View style={{ padding: 16, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.background }}>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Ionicons name="settings-outline" size={20} color={colors.secondary} />
          <Text style={{ marginLeft: 8, color: colors.text, fontWeight: "600" }}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={{ marginLeft: 8, color: colors.danger, fontWeight: "600" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Point Modal for Super Admin */}
      {userRole === "superAdmin" && (
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 12, width: 300, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 12 }}>
                Switch Pickup Point
              </Text>
              <FlatList
                data={[
                  { id: "1", name: "Nairobi Central" },
                  { id: "2", name: "Mombasa Port" },
                  { id: "3", name: "Kisumu Hub" },
                  { id: "4", name: "Eldoret Depot" },
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}
                    onPress={() => handleSwitch(item)}
                  >
                    <Text style={{ color: colors.text }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginTop: 16 }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </DrawerContentScrollView>
  );
}
