import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MobileDashboardInsuranceBreakdown = () => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Ionicons name="checkmark-done-outline" size={18} color="#2563EB" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Insurance savings breakdown</Text>
          <Text style={styles.subtitle}>
            Co-Pay Excess Pre-auth Billing
          </Text>
        </View>

        {/* Dropdown */}
        <View style={styles.dropdown}>
          <Text style={styles.dropdownText}>3 Month ▾</Text>
        </View>
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.smallTitle}>Current Month Total</Text>

        {/* TOTAL SAVINGS */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Savings</Text>
          <Text style={styles.totalValue}>₹2,50,471</Text>
        </View>

        {/* TABLE */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Category</Text>
          <Text style={styles.tableHeaderText}>Amount</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Co-Pay</Text>
          <Text style={styles.rowText}>₹1,50,000</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Excess</Text>
          <Text style={styles.rowText}>₹65,000</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Pre-auth</Text>
          <Text style={styles.rowText}>₹35,271</Text>
        </View>
      </View>
    </View>
  );
};

export default MobileDashboardInsuranceBreakdown;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin:"3%"
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconBox: {
    height: 36,
    width: 36,
    borderRadius: 8,
    backgroundColor: "#E6F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  dropdownText: {
    fontSize: 12,
    color: "#374151",
  },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
  },

  smallTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 10,
  },

  totalBox: {
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  totalLabel: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
  },

  totalValue: {
    fontSize: 18,
    color: "#059669",
    fontWeight: "700",
  },

  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  tableHeaderText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  rowText: {
    fontSize: 14,
    color: "#111827",
  },
});