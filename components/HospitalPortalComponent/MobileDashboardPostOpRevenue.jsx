import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";

// ─── Data per period ───────────────────────────────────────────────────────────
const PERIOD_DATA = {
  "3 Month": {
    total: 842,
    segments: [
      { label: "Physiotherapy",  value: 300000, amount: "₹3,00,000", color: "#7B61FF" },
      { label: "Follow Up OPD",  value: 200000, amount: "₹2,00,000", color: "#FF6B6B" },
      { label: "Medication/ICU", value: 142000, amount: "₹1,42,000", color: "#00C9B1" },
      { label: "Diagnostics",    value: 200000, amount: "₹2,00,000", color: "#F59E0B" },
    ],
  },
  "6 Month": {
    total: 1491,
    segments: [
      { label: "Physiotherapy",  value: 150000, amount: "₹1,50,000", color: "#7B61FF" },
      { label: "Follow Up OPD",  value: 150000, amount: "₹1,50,000", color: "#FF6B6B" },
      { label: "Medication/ICU", value: 30000,  amount: "₹30,000",   color: "#00C9B1" },
      { label: "Diagnostics",    value: 50000,  amount: "₹50,000",   color: "#F59E0B" },
    ],
  },
  "12 Month": {
    total: 2840,
    segments: [
      { label: "Physiotherapy",  value: 500000, amount: "₹5,00,000", color: "#7B61FF" },
      { label: "Follow Up OPD",  value: 420000, amount: "₹4,20,000", color: "#FF6B6B" },
      { label: "Medication/ICU", value: 180000, amount: "₹1,80,000", color: "#00C9B1" },
      { label: "Diagnostics",    value: 240000, amount: "₹2,40,000", color: "#F59E0B" },
    ],
  },
};

const PERIODS = ["3 Month", "6 Month", "12 Month"];

// ─── Chart constants ───────────────────────────────────────────────────────────
const SIZE         = 240;
const STROKE       = 28;
const RADIUS       = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER       = SIZE / 2;
const GAP          = 1; // px gap between segments (as arc length)

// Build segment geometry — pure static, no animation deps
function buildSegments(rawSegments) {
  const total = rawSegments.reduce((s, seg) => s + seg.value, 0);
  const result = [];
  let cumulativeArc = 0; // cumulative arc length along circumference

  rawSegments.forEach((seg) => {
    const arcLen   = (seg.value / total) * CIRCUMFERENCE;
    const drawLen  = Math.max(arcLen - GAP, 0);
    // strokeDasharray: [draw, skip-rest]
    // strokeDashoffset: negative of where this segment starts (offset from top)
    // We start at top = -90deg offset via rotation on the G element,
    // so we use dashoffset to position each segment.
    const dashOffset = -(cumulativeArc); // negative = shift forward

    result.push({
      ...seg,
      drawLen,
      dashOffset,
    });

    cumulativeArc += arcLen;
  });

  return result;
}

// ─── Main Component ────────────────────────────────────────────────────────────
const MobileDashboardPostOpRevenue = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("6 Month");
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  // We keep a key to force re-mount SVG on period change for clean render
  const [renderKey, setRenderKey]           = useState(0);

  const data     = PERIOD_DATA[selectedPeriod];
  const segments = buildSegments(data.segments);

  const handlePeriodSelect = (opt) => {
    setSelectedPeriod(opt);
    setDropdownOpen(false);
    setRenderKey((k) => k + 1); // force SVG remount
  };

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {/* <View style={styles.iconBox}>
          <Text style={styles.iconEmoji}>✅</Text>
        </View> */}
        <Text style={styles.title}>Post Op Revenue</Text>
      </View>

      {/* ── Period Dropdown ── */}
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => setDropdownOpen((v) => !v)}
          activeOpacity={0.85}
        >
          <Text style={styles.dropdownBtnText}>{selectedPeriod}</Text>
          <Text style={styles.dropdownArrow}>{dropdownOpen ? "▴" : "▾"}</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {PERIODS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.dropdownItem,
                  opt === selectedPeriod && styles.dropdownItemActive,
                ]}
                onPress={() => handlePeriodSelect(opt)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    opt === selectedPeriod && styles.dropdownItemTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Donut Chart ── */}
      <View style={styles.chartWrapper}>
        <Svg key={renderKey} width={SIZE} height={SIZE}>
          {/* Grey background track */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={STROKE}
          />

          {/*
            Each segment:
            - strokeDasharray = [drawLen, CIRCUMFERENCE]  → only drawLen is colored
            - strokeDashoffset = dashOffset               → positions it correctly
            - rotation -90 on each so 0° starts at top
          */}
          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${seg.drawLen} ${CIRCUMFERENCE}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90, ${CENTER}, ${CENTER})`}
            />
          ))}
        </Svg>

        {/* Center number */}
        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={styles.centerValue}>{data.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* ── Legend ── */}
      <View style={styles.legend}>
        {data.segments.map((seg, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View style={[styles.dot, { backgroundColor: seg.color }]} />
              <Text style={styles.legendLabel}>{seg.label}</Text>
            </View>
            <Text style={styles.legendAmount}>{seg.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 14,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web:     { boxShadow: "0 4px 20px rgba(0,0,0,0.07)" },
    }),
  },

  // ─── Header ───
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  iconEmoji: { fontSize: 24 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },

  // ─── Dropdown ───
  dropdownWrapper: {
    alignSelf: "flex-end",
    marginBottom: 8,
    zIndex: 100,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: "#FAFAFA",
    minWidth: 120,
    justifyContent: "space-between",
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#6B7280",
  },
  dropdownMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
      web:     { boxShadow: "0 6px 24px rgba(0,0,0,0.12)" },
    }),
    zIndex: 999,
    minWidth: 130,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  dropdownItemActive: { backgroundColor: "#F3F0FF" },
  dropdownItemText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  dropdownItemTextActive: {
    color: "#7B61FF",
    fontWeight: "700",
  },

  // ─── Chart ───
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerValue: {
    fontSize: 44,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -1,
  },

  // ─── Legend ───
  legend: {
    marginTop: 20,
    gap: 16,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  legendAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
});

export default MobileDashboardPostOpRevenue;