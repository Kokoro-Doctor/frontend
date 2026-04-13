import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // or use your own icon library

const cards = [
  {
    title: "Claim Approved",
    value: "1,235",
    growth: null,
    icon: "people-outline",
  },
  {
    title: "Total Reimbursed",
    value: "₹84.2L",
    growth: "15.8%",
    icon: "people-outline",
  },
  {
    title: "Pending",
    value: "135",
    growth: null,
    icon: "people-outline",
  },
  {
    title: "INS Saving",
    value: "₹22.6L",
    growth: null,
    icon: "people-outline",
  },
  {
    title: "Avg TAT",
    value: "2.4d",
    growth: "15.8%",
    icon: "people-outline",
  },
  {
    title: "Post OP Rev",
    value: "₹38.4L",
    growth: "15.8%",
    icon: "people-outline",
  },
];

const MobileDashboardCards = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.grid}>
        {cards.map((item, index) => (
          <View key={index} style={styles.card}>
            {/* Growth badge — top right */}
            {item.growth ? (
              <View style={styles.growthBadge}>
                <Text style={styles.growthText}>{item.growth} ↗</Text>
              </View>
            ) : (
              <View style={styles.growthPlaceholder} />
            )}

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={22} color="#2563EB" />
            </View>

            {/* Label */}
            <Text style={styles.cardTitle}>{item.title}</Text>

            {/* Value */}
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#F1F7FF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    width: "47.5%",
    position: "relative",
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  growthBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  growthText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "500",
  },
  growthPlaceholder: {
    height: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
    letterSpacing: -0.3,
  },
});

export default MobileDashboardCards;