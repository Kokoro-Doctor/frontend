import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

// const ALL_DATA = {
//   "3M": [
//     {
//       label: "Jan",
//       stacks: [
//         { value: 5, color: "#7B61FF" },
//         { value: 4, color: "#FF8A80" },
//         { value: 9, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 3, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Feb",
//       stacks: [
//         { value: 2, color: "#7B61FF" },
//         { value: 2, color: "#FF8A80" },
//         { value: 4, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 2, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Mar",
//       stacks: [
//         { value: 3, color: "#7B61FF" },
//         { value: 4, color: "#FF8A80" },
//         { value: 6, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 1, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Apr",
//       stacks: [
//         { value: 2, color: "#7B61FF" },
//         { value: 3, color: "#FF8A80" },
//         { value: 5, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 2, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "May",
//       stacks: [
//         { value: 1, color: "#7B61FF" },
//         { value: 4, color: "#FF8A80" },
//         { value: 8, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 3, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Jun",
//       stacks: [
//         { value: 1, color: "#7B61FF" },
//         { value: 5, color: "#FF8A80" },
//         { value: 7, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 2, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Jul",
//       stacks: [
//         { value: 4, color: "#7B61FF" },
//         { value: 4, color: "#FF8A80" },
//         { value: 7, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 2, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Aug",
//       stacks: [
//         { value: 2, color: "#7B61FF" },
//         { value: 6, color: "#FF8A80" },
//         { value: 8, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 3, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Sep",
//       stacks: [
//         { value: 4, color: "#7B61FF" },
//         { value: 8, color: "#FF8A80" },
//         { value: 13, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 2, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Oct",
//       stacks: [
//         { value: 5, color: "#7B61FF" },
//         { value: 10, color: "#FF8A80" },
//         { value: 14, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 3, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Nov",
//       stacks: [
//         { value: 3, color: "#7B61FF" },
//         { value: 4, color: "#FF8A80" },
//         { value: 6, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 2, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Dec",
//       stacks: [
//         { value: 4, color: "#7B61FF" },
//         { value: 5, color: "#FF8A80" },
//         { value: 6, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 2, color: "#FDBA74" }], spacing: 0 },
//   ],

//   "6M": [
//     {
//       label: "Jan",
//       stacks: [
//         { value: 8, color: "#7B61FF" },
//         { value: 6, color: "#FF8A80" },
//         { value: 12, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 4, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Feb",
//       stacks: [
//         { value: 5, color: "#7B61FF" },
//         { value: 5, color: "#FF8A80" },
//         { value: 8, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 3, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Mar",
//       stacks: [
//         { value: 6, color: "#7B61FF" },
//         { value: 7, color: "#FF8A80" },
//         { value: 10, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 3, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Apr",
//       stacks: [
//         { value: 5, color: "#7B61FF" },
//         { value: 6, color: "#FF8A80" },
//         { value: 9, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 4, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "May",
//       stacks: [
//         { value: 3, color: "#7B61FF" },
//         { value: 7, color: "#FF8A80" },
//         { value: 14, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 5, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Jun",
//       stacks: [
//         { value: 3, color: "#7B61FF" },
//         { value: 9, color: "#FF8A80" },
//         { value: 13, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 4, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Jul",
//       stacks: [
//         { value: 7, color: "#7B61FF" },
//         { value: 7, color: "#FF8A80" },
//         { value: 12, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 4, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Aug",
//       stacks: [
//         { value: 5, color: "#7B61FF" },
//         { value: 10, color: "#FF8A80" },
//         { value: 14, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 5, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Sep",
//       stacks: [
//         { value: 7, color: "#7B61FF" },
//         { value: 14, color: "#FF8A80" },
//         { value: 18, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 4, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Oct",
//       stacks: [
//         { value: 9, color: "#7B61FF" },
//         { value: 16, color: "#FF8A80" },
//         { value: 19, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 6, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Nov",
//       stacks: [
//         { value: 6, color: "#7B61FF" },
//         { value: 7, color: "#FF8A80" },
//         { value: 11, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 4, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Dec",
//       stacks: [
//         { value: 7, color: "#7B61FF" },
//         { value: 9, color: "#FF8A80" },
//         { value: 11, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 4, color: "#FDBA74" }], spacing: 0 },
//   ],

//   "12M": [
//     {
//       label: "Jan",
//       stacks: [
//         { value: 12, color: "#7B61FF" },
//         { value: 10, color: "#FF8A80" },
//         { value: 16, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 6, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Feb",
//       stacks: [
//         { value: 8, color: "#7B61FF" },
//         { value: 8, color: "#FF8A80" },
//         { value: 13, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 5, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Mar",
//       stacks: [
//         { value: 10, color: "#7B61FF" },
//         { value: 11, color: "#FF8A80" },
//         { value: 15, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 5, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Apr",
//       stacks: [
//         { value: 8, color: "#7B61FF" },
//         { value: 9, color: "#FF8A80" },
//         { value: 14, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 6, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "May",
//       stacks: [
//         { value: 5, color: "#7B61FF" },
//         { value: 12, color: "#FF8A80" },
//         { value: 18, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 8, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Jun",
//       stacks: [
//         { value: 5, color: "#7B61FF" },
//         { value: 14, color: "#FF8A80" },
//         { value: 17, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 7, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Jul",
//       stacks: [
//         { value: 11, color: "#7B61FF" },
//         { value: 11, color: "#FF8A80" },
//         { value: 16, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 6, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Aug",
//       stacks: [
//         { value: 8, color: "#7B61FF" },
//         { value: 15, color: "#FF8A80" },
//         { value: 19, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 8, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Sep",
//       stacks: [
//         { value: 11, color: "#7B61FF" },
//         { value: 18, color: "#FF8A80" },
//         { value: 20, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 6, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Oct",
//       stacks: [
//         { value: 14, color: "#7B61FF" },
//         { value: 19, color: "#FF8A80" },
//         { value: 20, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 9, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Nov",
//       stacks: [
//         { value: 9, color: "#7B61FF" },
//         { value: 11, color: "#FF8A80" },
//         { value: 16, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 7, color: "#FDBA74" }], spacing: 22 },
//     {
//       label: "Dec",
//       stacks: [
//         { value: 11, color: "#7B61FF" },
//         { value: 13, color: "#FF8A80" },
//         { value: 16, color: "#4DD0E1" },
//       ],
//       spacing: 6,
//     },
//     { stacks: [{ value: 6, color: "#FDBA74" }], spacing: 0 },
//   ],
// };

const generatePostOpData = () => {
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

  return months.flatMap((month, i) => {
    const year = i <= 7 ? startYear : startYear + 1;

    // realistic increasing trend
    const base = 5 + i * 1.5;

    return [
      {
        label: `${month}\n${String(year).slice(2)}`, // ✅ May 25
        stacks: [
          { value: Math.round(base * 0.3), color: "#7B61FF" },
          { value: Math.round(base * 0.4), color: "#FF8A80" },
          { value: Math.round(base * 0.6), color: "#4DD0E1" },
        ],
        spacing: 6,
      },
      {
        stacks: [{ value: Math.round(base * 0.2), color: "#FDBA74" }],
        spacing: i === 11 ? 0 : 22, // last month fix
      },
    ];
  });
};
const MAX_VALUES = { "3M": 40, "6M": 50, "12M": 60 };

const RANGES = [
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "12 Months", value: "12M" },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const BAR_W = 26; // stacked bar width
const DIAG_W = 18; // diagnostics bar width (gifted-charts uses barWidth for all)
const IN_SPACING = 4; // gap between stacked and diagnostics bar
const OUT_SPACING = 22; // gap after diagnostics bar before next month
const MONTHS = 12;
const Y_AXIS_W = 36;

// ✅ Correct formula:
// Each month = barWidth + inSpacing + barWidth + outSpacing
// = 28 + 6 + 28 + 22 = 84 per month
// Total = 84 × 12 − outSpacing(last) + initialSpacing + endSpacing
const CHART_W =
  (BAR_W + IN_SPACING + BAR_W + OUT_SPACING) * MONTHS -
  OUT_SPACING + // last month has no trailing gap
  10 + // initialSpacing
  30; // endSpacing buffer so Dec label never clips

const Legend = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const DashboardPostOpRevenueChart = () => {
  const [selectedRange, setSelectedRange] = useState("3M");
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef(null);

  const fullData = useMemo(() => generatePostOpData(), []);

  const currentData = useMemo(() => {
    if (selectedRange === "3M") {
      return fullData.slice(-3 * 2); // ✅ last 3 months
    }

    if (selectedRange === "6M") {
      return fullData.slice(-6 * 2); // ✅ last 6 months
    }

    return fullData; // ✅ 12M full
  }, [selectedRange, fullData]);
  const maxValue = MAX_VALUES[selectedRange];
  const selectedLabel = RANGES.find((r) => r.value === selectedRange)?.label;

  const openDropdown = () => {
    dropdownRef.current?.measure((fx, fy, width, height, px, py) => {
      setDropPos({ x: px - 60, y: py + height + 4 });
      setOpen(true);
    });
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Post Op Revenue</Text>
          <Text style={styles.subtitle}>Physio OPD ICU Diagnostics</Text>
        </View>
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

      {/* ── MODAL DROPDOWN ── */}
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

      {/* ── UNIT ── */}
      <Text style={styles.unit}>Unit: L</Text>

      {/* ── CHART ── */}
      {/* ✅ nestedScrollEnabled prevents scroll conflict inside a parent ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <BarChart
          stackData={currentData}
          barWidth={BAR_W}
          initialSpacing={10}
          endSpacing={20}
          height={220}
          // ✅ KEY: width passed to gifted-charts = total chart area EXCLUDING y-axis
          // The library adds yAxisLabelWidth internally, so don't add it here
          width={CHART_W}
          noOfSections={5}
          maxValue={maxValue}
          stepValue={maxValue / 5}
          rulesType="dashed"
          dashWidth={4}
          dashGap={4}
          rulesColor="#E5E7EB"
          yAxisThickness={0.3}
          xAxisThickness={0.5}
          yAxisTextStyle={{ fontSize: 12, color: "#9CA3AF" }}
          xAxisLabelTextStyle={{ fontSize: 12, color: "#6B7280" }}
          yAxisLabelWidth={Y_AXIS_W}
          roundedTop
          overflowTop={10}
        />
      </ScrollView>

      {/* ── LEGEND ── */}
      <View style={styles.legendRow}>
        <Legend color="#7B61FF" label="Physiotherapy" />
        <Legend color="#FF8A80" label="Follow Up OPD" />
        <Legend color="#4DD0E1" label="Medication/ICU" />
        <Legend color="#FDBA74" label="Diagnostics" />
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
    alignItems: "flex-start",
    marginBottom: 6,
  },
  title: { fontSize: 15, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 11, color: "#6B7280", marginTop: 2 },
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
    minWidth: 120,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: "#F5F3FF" },
  dropdownItemText: { fontSize: 13, color: "#374151" },
  dropdownItemTextActive: { color: "#7B61FF", fontWeight: "600" },
  unit: { fontSize: 10, color: "#9CA3AF", marginBottom: 4 },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 11, color: "#6B7280" },
});

export default DashboardPostOpRevenueChart;
