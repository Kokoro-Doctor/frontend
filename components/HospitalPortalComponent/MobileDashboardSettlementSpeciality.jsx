import React from "react";
import { View, Text, StyleSheet } from "react-native";

const data = [
  {
    id: 1,
    count: 14,
    title: "Cardiac",
    claims: "1,235 claims",
    percent: "84.9%",
  },
  {
    id: 2,
    count: 32,
    title: "Orthopedic",
    claims: "105 claims",
    percent: "20.9%",
  },
  {
    id: 3,
    count: 32,
    title: "Oncology",
    claims: "82 claims",
    percent: "4.9%",
  },
  {
    id: 4,
    count: 14,
    title: "Neurology",
    claims: "32 claims",
    percent: "2.2%",
  },
];

const MobileDashboardSettlementSpeciality = () => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Settlement by speciality</Text>
        <Text style={styles.total}>Total:1,451</Text>
      </View>

      {/* LIST */}
      {data.map((item, index) => (
        <View key={item.id}>
          <View style={styles.row}>
            {/* LEFT CIRCLE */}
            <View style={styles.circle}>
              <Text style={styles.circleText}>{item.count}</Text>
            </View>

            {/* MIDDLE TEXT */}
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.claims}>{item.claims}</Text>
            </View>

            {/* RIGHT PERCENT */}
            <Text style={styles.percent}>{item.percent}</Text>
          </View>

          {/* DIVIDER */}
          {index !== data.length - 1 && (
            <View style={styles.divider} />
          )}
        </View>
      ))}
    </View>
  );
};

export default MobileDashboardSettlementSpeciality;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    margin:"3%"
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  total: {
    fontSize: 14,
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  circle: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  circleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  textContainer: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  claims: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  percent: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16A34A", // green
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 6,
  },
});