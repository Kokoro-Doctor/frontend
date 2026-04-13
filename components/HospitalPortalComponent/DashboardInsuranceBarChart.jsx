import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

// const ALL_DATA = {
//   "3M": [
//     { label: "Jan", stacks: [{ value: 500000, color: "#7B61FF" }, { value: 400000, color: "#FF8A80" }, { value: 200000, color: "#4DD0E1" }] },
//     { label: "Feb", stacks: [{ value: 600000, color: "#7B61FF" }, { value: 500000, color: "#FF8A80" }, { value: 300000, color: "#4DD0E1" }] },
//     { label: "Mar", stacks: [{ value: 400000, color: "#7B61FF" }, { value: 350000, color: "#FF8A80" }, { value: 150000, color: "#4DD0E1" }] },
//     { label: "Apr", stacks: [{ value: 300000, color: "#7B61FF" }, { value: 250000, color: "#FF8A80" }, { value: 100000, color: "#4DD0E1" }] },
//     { label: "May", stacks: [{ value: 700000, color: "#7B61FF" }, { value: 600000, color: "#FF8A80" }, { value: 400000, color: "#4DD0E1" }] },
//     { label: "Jun", stacks: [{ value: 800000, color: "#7B61FF" }, { value: 700000, color: "#FF8A80" }, { value: 500000, color: "#4DD0E1" }] },
//     { label: "Jul", stacks: [{ value: 900000, color: "#7B61FF" }, { value: 800000, color: "#FF8A80" }, { value: 600000, color: "#4DD0E1" }] },
//     { label: "Aug", stacks: [{ value: 1000000, color: "#7B61FF" }, { value: 900000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "Sep", stacks: [{ value: 1100000, color: "#7B61FF" }, { value: 1000000, color: "#FF8A80" }, { value: 800000, color: "#4DD0E1" }] },
//     { label: "Oct", stacks: [{ value: 1500000, color: "#7B61FF" }, { value: 1200000, color: "#FF8A80" }, { value: 900000, color: "#4DD0E1" }] },
//     { label: "Nov", stacks: [{ value: 1800000, color: "#7B61FF" }, { value: 1600000, color: "#FF8A80" }, { value: 1100000, color: "#4DD0E1" }] },
//     { label: "Dec", stacks: [{ value: 2000000, color: "#7B61FF" }, { value: 1800000, color: "#FF8A80" }, { value: 1400000, color: "#4DD0E1" }] },
//   ],
//   "6M": [
//     { label: "Jan", stacks: [{ value: 700000, color: "#7B61FF" }, { value: 600000, color: "#FF8A80" }, { value: 300000, color: "#4DD0E1" }] },
//     { label: "Feb", stacks: [{ value: 900000, color: "#7B61FF" }, { value: 750000, color: "#FF8A80" }, { value: 450000, color: "#4DD0E1" }] },
//     { label: "Mar", stacks: [{ value: 600000, color: "#7B61FF" }, { value: 500000, color: "#FF8A80" }, { value: 250000, color: "#4DD0E1" }] },
//     { label: "Apr", stacks: [{ value: 500000, color: "#7B61FF" }, { value: 400000, color: "#FF8A80" }, { value: 200000, color: "#4DD0E1" }] },
//     { label: "May", stacks: [{ value: 1200000, color: "#7B61FF" }, { value: 1000000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "Jun", stacks: [{ value: 1400000, color: "#7B61FF" }, { value: 1200000, color: "#FF8A80" }, { value: 900000, color: "#4DD0E1" }] },
//     { label: "Jul", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1400000, color: "#FF8A80" }, { value: 1000000, color: "#4DD0E1" }] },
//     { label: "Aug", stacks: [{ value: 1800000, color: "#7B61FF" }, { value: 1600000, color: "#FF8A80" }, { value: 1200000, color: "#4DD0E1" }] },
//     { label: "Sep", stacks: [{ value: 2000000, color: "#7B61FF" }, { value: 1800000, color: "#FF8A80" }, { value: 1400000, color: "#4DD0E1" }] },
//     { label: "Oct", stacks: [{ value: 2500000, color: "#7B61FF" }, { value: 2200000, color: "#FF8A80" }, { value: 1600000, color: "#4DD0E1" }] },
//     { label: "Nov", stacks: [{ value: 3000000, color: "#7B61FF" }, { value: 2700000, color: "#FF8A80" }, { value: 2000000, color: "#4DD0E1" }] },
//     { label: "Dec", stacks: [{ value: 3500000, color: "#7B61FF" }, { value: 3000000, color: "#FF8A80" }, { value: 2500000, color: "#4DD0E1" }] },
//   ],
//   "12M": [
//     { label: "Jan", stacks: [{ value: 1500000, color: "#7B61FF" }, { value: 1200000, color: "#FF8A80" }, { value: 800000, color: "#4DD0E1" }] },
//     { label: "Feb", stacks: [{ value: 1000000, color: "#7B61FF" }, { value: 1400000, color: "#FF8A80" }, { value: 900000, color: "#4DD0E1" }] },
//     { label: "Mar", stacks: [{ value: 1800000, color: "#7B61FF" }, { value: 1700000, color: "#FF8A80" }, { value: 1100000, color: "#4DD0E1" }] },
//     { label: "Apr", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1300000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "May", stacks: [{ value: 4000000, color: "#7B61FF" }, { value: 900000, color: "#FF8A80" }, { value: 1000000, color: "#4DD0E1" }] },
//     { label: "Jun", stacks: [{ value: 900000, color: "#7B61FF" }, { value: 800000, color: "#FF8A80" }, { value: 600000, color: "#4DD0E1" }] },
//     { label: "Jul", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1300000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "Aug", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1300000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "Sep", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1300000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "Oct", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1300000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "Nov", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1300000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//     { label: "Dec", stacks: [{ value: 1600000, color: "#7B61FF" }, { value: 1300000, color: "#FF8A80" }, { value: 700000, color: "#4DD0E1" }] },
//   ],
// };
const generateInsuranceData = () => {
  const months = [
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
  ];

  const startYear = 2025;

  return months.map((month, i) => {
    const year = i <= 7 ? startYear : startYear + 1;

    // realistic growth pattern
    const base = 500000 + i * 250000;

    return {
      label: `${month}\n${String(year).slice(2)}`, // ✅ FIX: 2-line label
      stacks: [
        { value: Math.round(base * 0.5), color: "#7B61FF" },
        { value: Math.round(base * 0.4), color: "#FF8A80" },
        { value: Math.round(base * 0.3), color: "#4DD0E1" },
      ],
    };
  });
};

const MAX_VALUES = { "3M": 5200000, "6M": 9000000, "12M": 6000000 };

const RANGES = [
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "12 Months", value: "12M" },
];

// ✅ KEY FIX: exact formula gifted-charts uses internally
const BAR_WIDTH = 28;
const SPACING = 50;
const NUM_BARS = 12;
const CHART_WIDTH = (BAR_WIDTH + SPACING) * NUM_BARS + 60; // +60 for right padding so Dec label never clips

const Legend = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const DashboardInsuranceBarChart = () => {
  const [selectedRange, setSelectedRange] = useState("3M");
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef(null);

  const fullData = useMemo(() => generateInsuranceData(), []);

  const currentData = useMemo(() => {
    if (selectedRange === "3M") {
      return fullData.slice(-3); // ✅ last 3 months
    }
    if (selectedRange === "6M") {
      return fullData.slice(-6); // ✅ last 6 months
    }
    return fullData; // ✅ full 12 months
  }, [selectedRange, fullData]);
  const maxValue = MAX_VALUES[selectedRange];
  const selectedLabel = RANGES.find((r) => r.value === selectedRange)?.label;

  const openDropdown = () => {
    dropdownRef.current?.measure((fx, fy, width, height, px, py) => {
      setDropPos({ x: px, y: py + height + 4 });
      setOpen(true);
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Insurance savings breakdown</Text>
        <TouchableOpacity
          ref={dropdownRef}
          style={styles.dropdownBtn}
          onPress={openDropdown}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownBtnText}>{selectedLabel}</Text>
          <Text style={styles.chevron}>{open ? "▴" : "▾"}</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DROPDOWN */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={StyleSheet.absoluteFill}>
            <View
              style={[styles.dropdownMenu, { top: dropPos.y, left: dropPos.x }]}
            >
              {RANGES.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.dropdownItem,
                    selectedRange === item.value && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedRange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedRange === item.value &&
                        styles.dropdownItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* CHART */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // ✅ Let ScrollView size itself naturally — don't constrain it
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <BarChart
          stackData={currentData}
          barWidth={BAR_WIDTH}
          spacing={SPACING}
          roundedTop
          hideRules={false}
          xAxisThickness={0.5}
          yAxisThickness={0.5}
          noOfSections={6}
          maxValue={maxValue}
          stepValue={maxValue / 6}
          yAxisLabelWidth={52}
          yAxisTextStyle={{ fontSize: 13, color: "#6B7280" }}
          xAxisLabelTextStyle={{ fontSize: 12, color: "#6B7280" }}
          formatYLabel={(value) => `${(value / 100000).toFixed(0)}L`}
          // ✅ THE FIX: correct width so all 12 bars + labels fully render
          width={CHART_WIDTH}
          // ✅ Prevent gifted-charts from internally clipping the last bar
          initialSpacing={10}
          endSpacing={20}
        />
      </ScrollView>

      {/* LEGEND */}
      <View style={styles.legendRow}>
        <Legend color="#7B61FF" label="Co-Pay Avoided" />
        <Legend color="#FF8A80" label="Excess Recovered" />
        <Legend color="#4DD0E1" label="Billing Optimized" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flexShrink: 1,
    marginRight: 8,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  dropdownBtnText: { fontSize: 12, color: "#374151" },
  chevron: { fontSize: 9, color: "#9CA3AF" },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minWidth: 110,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: "#F5F3FF" },
  dropdownItemText: { fontSize: 13, color: "#374151" },
  dropdownItemTextActive: { color: "#7B61FF", fontWeight: "600" },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 12, color: "#6B7280" },
});

export default DashboardInsuranceBarChart;
