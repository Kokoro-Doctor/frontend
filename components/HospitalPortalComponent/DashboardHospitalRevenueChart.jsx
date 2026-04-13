import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

// ─── DATA ─────────────────────────────────────────────────────────────────────
// const ALL_DATA = {
//   "3M": [
//     { value: 4.1, label: "Jan" },
//     { value: 0.3, label: "Feb" },
//     { value: 0.2, label: "Mar" },
//     { value: 2.0, label: "Apr" },
//     { value: 2.1, label: "May" },
//     { value: 4.0, label: "Jun" },
//     { value: 5.0, label: "Jul" },
//     { value: 3.9, label: "Aug" },
//     { value: 0.9, label: "Sep" },
//     { value: 1.0, label: "Oct" },
//     { value: 4.1, label: "Nov" },
//     { value: 3.9, label: "Dec" },
//   ],
//   "6M": [
//     { value: 2.5, label: "Jan" },
//     { value: 1.8, label: "Feb" },
//     { value: 3.2, label: "Mar" },
//     { value: 4.5, label: "Apr" },
//     { value: 3.8, label: "May" },
//     { value: 2.9, label: "Jun" },
//     { value: 4.8, label: "Jul" },
//     { value: 5.0, label: "Aug" },
//     { value: 3.1, label: "Sep" },
//     { value: 2.2, label: "Oct" },
//     { value: 3.7, label: "Nov" },
//     { value: 4.4, label: "Dec" },
//   ],
//   "12M": [
//     { value: 1.2, label: "Jan" },
//     { value: 2.8, label: "Feb" },
//     { value: 4.1, label: "Mar" },
//     { value: 3.5, label: "Apr" },
//     { value: 4.9, label: "May" },
//     { value: 3.3, label: "Jun" },
//     { value: 2.6, label: "Jul" },
//     { value: 4.7, label: "Aug" },
//     { value: 5.0, label: "Sep" },
//     { value: 3.9, label: "Oct" },
//     { value: 2.4, label: "Nov" },
//     { value: 4.2, label: "Dec" },
//   ],
// };
// const FINANCIAL_YEAR_DATA = [
//   { label: "May", value: 1.2 },
//   { label: "Jun", value: 1.5 },
//   { label: "Jul", value: 1.9 },
//   { label: "Aug", value: 2.3 },
//   { label: "Sep", value: 2.8 },
//   { label: "Oct", value: 3.1 },
//   { label: "Nov", value: 3.6 },
//   { label: "Dec", value: 4.0 },
//   { label: "Jan", value: 4.4 },
//   { label: "Feb", value: 4.2 }, // 🔻 slight dip (realistic)
//   { label: "Mar", value: 4.8 },
//   { label: "Apr", value: 5.2 },
// ];

const RANGES = [
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "12 Months", value: "12M" },
];

// ─── CHART LAYOUT ─────────────────────────────────────────────────────────────
const ChartWithLayout = ({ data }) => {
  const [chartWidth, setChartWidth] = React.useState(null);

  return (
    <View
      style={{ width: "100%", flex: 1 }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setChartWidth(w);
      }}
    >
      {chartWidth ? (
        <LineChart
          data={data}
          curved
          areaChart
          color="#9087D8"
          thickness={2.5}
          startFillColor="rgba(144,135,216,0.20)"
          endFillColor="rgba(144,135,216,0.01)"
          startOpacity={1}
          endOpacity={1}
          hideDataPoints={false}
          dataPointsColor="#9087D8"
          dataPointsRadius={4.5}
          noOfSections={5}
          maxValue={5}
          stepValue={1}
          yAxisThickness={0}
          yAxisTextStyle={styles.yAxisText}
          xAxisThickness={0.2}
          xAxisLabelTextStyle={styles.xAxisText}
          rulesType="dashed"
          dashWidth={5}
          dashGap={5}
          rulesColor="#DDDDE8"
          rulesThickness={1}
          showVerticalLines
          verticalLinesColor="#DDDDE8"
          verticalLinesThickness={1}
          verticalLinesDashArray={[5, 5]}
          width={chartWidth - 40}
          height={240}
          spacing={Math.max(30, Math.floor((chartWidth - 60) / data.length))}
          initialSpacing={18}
          endSpacing={8}
          isAnimated
          animationDuration={1200}
        />
      ) : null}
    </View>
  );
};

const getDynamicData = () => {
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

  const startYear = 2025; // FY start
  // May 2025 → Dec 2025 → Jan 2026 → Apr 2026

  return months.map((month, i) => {
    const year =
      i <= 7 // May → Dec
        ? startYear
        : startYear + 1; // Jan → Apr

    return {
      label: `${month} ${String(year).slice(2)}`, // 👉 May 25
      value: +(1 + i * 0.35 + (i === 9 ? -0.3 : 0)).toFixed(2),
    };
  });
};
// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const DashboardHospitalRevenueChart = () => {
  const [selectedRange, setSelectedRange] = useState("3M");
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef(null);

  const fullYearData = React.useMemo(() => getDynamicData(), []);

  const currentData = useMemo(() => {
    if (selectedRange === "3M") {
      return fullYearData.slice(-3);
      // ✅ Feb, Mar, Apr
    }

    if (selectedRange === "6M") {
      return fullYearData.slice(-6);
      // ✅ Nov → Apr
    }

    return fullYearData;
    // ✅ May → Apr
  }, [selectedRange, fullYearData]);
  const selectedLabel = RANGES.find((r) => r.value === selectedRange)?.label;

  const openDropdown = () => {
    dropdownRef.current?.measure((fx, fy, width, height, px, py) => {
      setDropPos({ x: px - 60, y: py + height + 4 });
      setOpen(true);
    });
  };

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <View style={styles.checkIcon} />
          </View>
          <View>
            <Text style={styles.title}>Hospital Revenue</Text>
            <Text style={styles.subtitle}>Physio OPD ICU Diagnostics</Text>
          </View>
        </View>

        {/* ── Dropdown Trigger ── */}
        <TouchableOpacity
          ref={dropdownRef}
          style={styles.dropdown}
          onPress={openDropdown}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{selectedLabel}</Text>
          <Text style={styles.dropdownArrow}>{open ? "▴" : "›"}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Modal Dropdown ── */}
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

      {/* ── Unit Label ── */}
      <Text style={styles.unitLabel}>Unit: Cr</Text>

      {/* ── Chart ── */}
      <View style={styles.chartWrapper}>
        <ChartWithLayout data={currentData} />
      </View>

      {/* ── Legend ── */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendLine}>
            <View style={styles.legendDash} />
            <View style={styles.legendDot} />
            <View style={styles.legendDash} />
          </View>
          <Text style={styles.legendText}>Revenue</Text>
        </View>
      </View>
    </View>
  );
};

// ─── STYLES (unchanged) ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 1,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  dropdownText: { fontSize: 11, color: "#374151", fontWeight: "500" },
  dropdownArrow: { fontSize: 13, color: "#6B7280" },
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
  unitLabel: {
    fontSize: 14,
    color: "#41444aff",
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  chartWrapper: {
    flex: 1,
    marginTop: 4,
    marginLeft: -6,
    overflow: "hidden",
  },
  yAxisText: { fontSize: 12, color: "#4f5259ff" },
  xAxisText: { fontSize: 12, color: "#3e4146ff", marginTop: 4 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  legendDash: { width: 10, height: 1.5, backgroundColor: "#9087D8" },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9087D8",
  },
  legendText: { fontSize: 13, color: "#6B7280" },
});

export default DashboardHospitalRevenueChart;
