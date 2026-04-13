import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";

const initialDoctors = [
  {
    id: "D-4521",
    name: "Ashok Srivastav",
    initials: "A",
    color: "#7B61FF",
    specialization: "Cardiologist",
    amount: "10,000",
    totalPatients: 20,
    phone: "9988565589",
    email: "srivastav1234@gmail.com",
    status: "Active",
  },
  {
    id: "D-4521",
    name: "Aman Verma",
    initials: "A",
    color: "#7B61FF",
    specialization: "Cardiologist",
    amount: "15,000",
    totalPatients: 15,
    phone: "9988565589",
    email: "verman3323@hotmail.com",
    status: "Active",
  },
  {
    id: "D-4521",
    name: "Prabir Joshi",
    initials: "P",
    color: "#F59E0B",
    specialization: "Cardiologist",
    amount: "12,000",
    totalPatients: 12,
    phone: "7288565589",
    email: "himanjosh21@gmail.com",
    status: "Active",
  },
  {
    id: "D-4521",
    name: "Ayush Singh",
    initials: "A",
    color: "#10B981",
    specialization: "Cardiologist",
    amount: "8,000",
    totalPatients: 8,
    phone: "8688565589",
    email: "aysuh45sing@hotmail.com",
    status: "Active",
  },
  {
    id: "D-4521",
    name: "Tejas Singh",
    initials: "T",
    color: "#3B82F6",
    specialization: "Cardiologist",
    amount: "10,000",
    totalPatients: 10,
    phone: "9988565589",
    email: "teajas45aK@yahoo.com",
    status: "Active",
  },
  {
    id: "D-4521",
    name: "Tamanna Kumar",
    initials: "T",
    color: "#EF4444",
    specialization: "Cardiologist",
    amount: "20,000",
    totalPatients: 20,
    phone: "9988565589",
    email: "--",
    status: "Inactive",
  },
  {
    id: "D-4521",
    name: "Tarun Mehta",
    initials: "T",
    color: "#8B5CF6",
    specialization: "Cardiologist",
    amount: "40,000",
    totalPatients: 40,
    phone: "9988565589",
    email: "--",
    status: "Inactive",
  },
  {
    id: "D-4521",
    name: "Aman Singh",
    initials: "A",
    color: "#3B82F6",
    specialization: "Cardiologist",
    amount: "30,000",
    totalPatients: 30000,
    phone: "7988565589",
    email: "umart23@yahoo.com",
    status: "Active",
  },
];

const PERIOD_OPTIONS = ["3 Month", "6 Month", "12 Month"];
const TABS = ["Physio", "OPD", "ICU", "Diagnostics"];

// Flex weights — must add up to control proportions
const COL_FLEX = [1, 2, 1.5, 1.2, 1.3, 1.8, 1.5, 2, 1.5, 0.5];

const DashboardDoctorTable = () => {
  const { width } = useWindowDimensions();
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("3 Month");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (index) => {
    setDoctors((prev) => prev.filter((_, i) => i !== index));
    setOpenMenuIndex(null);
  };

  // Close dropdowns when tapping outside a row
  const closeMenus = () => {
    setOpenMenuIndex(null);
    setPeriodOpen(false);
  };

  const HEADERS = [
    "Doctor ID",
    "Doctor Name",
    "Specialization",
    "Amount(₹)",
    "Total Patients",
    "Add Patient",
    "Phone",
    "Email",
    "Current Status",
    "",
  ];

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          {/* ── Title + Period Dropdown ── */}
          <View style={styles.headerRow}>
            <Text style={styles.tableTitle}>Doctor Table</Text>

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => {
                  setPeriodOpen((v) => !v);
                  setOpenMenuIndex(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownBtnText}>{selectedPeriod}</Text>
                <Text style={styles.dropdownArrow}>▾</Text>
              </TouchableOpacity>

              {periodOpen && (
                <View style={styles.dropdownMenu}>
                  {PERIOD_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.dropdownItem,
                        opt === selectedPeriod && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSelectedPeriod(opt);
                        setPeriodOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          opt === selectedPeriod &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ── Tabs ── */}
          <View style={styles.tabRow}>
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, i === activeTab && styles.tabActive]}
                onPress={() => setActiveTab(i)}
              >
                <Text
                  style={[
                    styles.tabText,
                    i === activeTab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Search ── */}
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Doctor name"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              onFocus={closeMenus}
            />
          </View>

          {/* ── Table (no horizontal scroll — fills full width) ── */}
          <View style={styles.tableWrapper}>
            {/* Column Headers */}
            <View style={styles.colHeaderRow}>
              {HEADERS.map((col, i) => (
                <Text
                  key={i}
                  style={[styles.colHeaderText, { flex: COL_FLEX[i] }]}
                >
                  {col}
                </Text>
              ))}
            </View>

            {/* Data Rows */}
            {filtered.map((doc, index) => (
              <View
                key={index}
                style={[styles.dataRow, index % 2 !== 0 && styles.rowOdd]}
              >
                {/* Doctor ID */}
                <Text
                  style={[styles.cell, { flex: COL_FLEX[0] }, styles.grayText]}
                >
                  {doc.id}
                </Text>

                {/* Doctor Name */}
                <View style={[styles.nameCell, { flex: COL_FLEX[1] }]}>
                  <View style={[styles.avatar, { backgroundColor: doc.color }]}>
                    <Text style={styles.avatarText}>{doc.initials}</Text>
                  </View>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {doc.name}
                  </Text>
                </View>

                {/* Specialization */}
                <Text style={[styles.cell, { flex: COL_FLEX[2] }]}>
                  {doc.specialization}
                </Text>

                {/* Amount */}
                <Text style={[styles.cell, { flex: COL_FLEX[3] }]}>
                  {doc.amount}
                </Text>

                {/* Total Patients */}
                <Text style={[styles.cell, { flex: COL_FLEX[4] }]}>
                  {doc.totalPatients.toLocaleString()}
                </Text>

                {/* Add Patient */}
                <View style={[styles.addBtnWrapper, { flex: COL_FLEX[5] }]}>
                  <TouchableOpacity style={styles.addBtn} onPress={closeMenus}>
                    <Text style={styles.addBtnText}>+ Add Patient</Text>
                  </TouchableOpacity>
                </View>

                {/* Phone */}
                <Text
                  style={[styles.cell, { flex: COL_FLEX[6] }, styles.phoneText]}
                >
                  {doc.phone}
                </Text>

                {/* Email */}
                <Text
                  style={[styles.cell, { flex: COL_FLEX[7] }, styles.grayText]}
                  numberOfLines={1}
                >
                  {doc.email}
                </Text>

                {/* Status */}
                <View style={[styles.statusWrapper, { flex: COL_FLEX[8] }]}>
                  <View
                    style={[
                      styles.statusBadge,
                      doc.status === "Active"
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        doc.status === "Active"
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {doc.status}
                    </Text>
                  </View>
                </View>

                {/* Three-dot menu */}
                <View style={[styles.menuWrapper, { flex: COL_FLEX[9] }]}>
                  <TouchableOpacity
                    style={styles.dotsBtn}
                    onPress={() =>
                      setOpenMenuIndex(openMenuIndex === index ? null : index)
                    }
                  >
                    <Text style={styles.dotsIcon}>⋮</Text>
                  </TouchableOpacity>

                  {openMenuIndex === index && (
                    <View style={styles.contextMenu}>
                      <TouchableOpacity
                        style={styles.contextMenuItem}
                        onPress={() => handleDelete(index)}
                      >
                        <Text style={styles.contextMenuDelete}>🗑 Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {filtered.length === 0 && (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No doctors found.</Text>
              </View>
            )}
          </View>

          {/* ── Pagination ── */}
          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              {filtered.length} of {filtered.length}
            </Text>
            <View style={styles.paginationBtns}>
              <TouchableOpacity style={styles.pageBtn}>
                <Text style={styles.pageBtnText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pageBtn}>
                <Text style={styles.pageBtnText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView style={mStyles.wrap} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={mStyles.header}>
            <View style={mStyles.headerTop}>
              <View style={mStyles.headerIcon}>
                {/* replace with your icon */}
                <Text style={{ fontSize: 18 }}>🗂</Text>
              </View>
              <Text style={mStyles.headerTitle}>Doctor Table</Text>
            </View>
            <Text style={mStyles.headerSub}>
              Physio · OPD · ICU · Diagnostics
            </Text>
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={mStyles.tabsRow}
          >
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={tab}
                style={[mStyles.tab, i === activeTab && mStyles.tabActive]}
                onPress={() => setActiveTab(i)}
              >
                <Text
                  style={[
                    mStyles.tabText,
                    i === activeTab && mStyles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search */}
          <View style={mStyles.searchBox}>
            <Text style={mStyles.searchIconText}>🔍</Text>
            <TextInput
              style={mStyles.searchInput}
              placeholder="Search by Doctor name"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Cards */}
          {filtered.map((doc, index) => (
            <View key={index} style={mStyles.card}>
              <View style={mStyles.cardTop}>
                <View
                  style={[
                    mStyles.badge,
                    doc.status === "Active"
                      ? mStyles.badgeActive
                      : mStyles.badgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      mStyles.badgeText,
                      doc.status === "Active"
                        ? mStyles.badgeTextActive
                        : mStyles.badgeTextInactive,
                    ]}
                  >
                    {doc.status}
                  </Text>
                </View>
                <Text style={mStyles.docId}>Doctor ID : {doc.id}</Text>
              </View>

              <View style={mStyles.divider} />

              <View style={mStyles.cardBody}>
                {/* Name row */}
                <View style={mStyles.nameRow}>
                  <View
                    style={[mStyles.avatar, { backgroundColor: doc.color }]}
                  >
                    <Text style={mStyles.avatarText}>{doc.initials}</Text>
                  </View>
                  <Text style={mStyles.docName}>{doc.name}</Text>
                </View>

                {/* Info grid */}
                <View style={mStyles.infoGrid}>
                  <View style={mStyles.infoItem}>
                    <Text style={mStyles.infoLabel}>Department</Text>
                    <Text style={mStyles.infoValue}>{doc.specialization}</Text>
                  </View>
                  <View style={mStyles.infoItem}>
                    <Text style={mStyles.infoLabel}>Amount</Text>
                    <Text style={[mStyles.infoValue, mStyles.amountText]}>
                      (₹){doc.amount}
                    </Text>
                  </View>
                  <View style={mStyles.infoItem}>
                    <Text style={mStyles.infoLabel}>Phone No</Text>
                    <Text style={[mStyles.infoValue, mStyles.phoneText]}>
                      {doc.phone}
                    </Text>
                  </View>
                  <View style={mStyles.infoItem}>
                    <Text style={mStyles.infoLabel}>Patients No</Text>
                    <Text style={mStyles.infoValue}>{doc.totalPatients}</Text>
                  </View>
                  <View style={mStyles.infoItemFull}>
                    <Text style={mStyles.infoLabel}>Email</Text>
                    <Text style={[mStyles.infoValue, { fontSize: 12 }]}>
                      {doc.email}
                    </Text>
                  </View>
                </View>

                {/* Add Patient Button */}
                <TouchableOpacity style={mStyles.addBtn}>
                  <Text style={mStyles.addBtnText}>+ Add Patient</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filtered.length === 0 && (
            <View style={mStyles.empty}>
              <Text style={mStyles.emptyText}>No doctors found.</Text>
            </View>
          )}

          {/* Pagination */}
          <View style={mStyles.pagination}>
            <Text style={mStyles.pgCount}>
              {filtered.length} of {doctors.length}
            </Text>
            <View style={mStyles.pgBtns}>
              <TouchableOpacity style={mStyles.pgBtn}>
                <Text style={mStyles.pgBtnText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mStyles.pgBtn}>
                <Text style={mStyles.pgBtnText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    width: "98%",
    alignSelf: "center",
    ...Platform.select({
      web: { boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
    }),
    elevation: 2,
  },

  // ─── Header ───
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  // ─── Period Dropdown ───
  dropdownWrapper: {
    position: "relative",
    zIndex: 200,
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
    backgroundColor: "#FAFAFA",
  },
  dropdownBtnText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  dropdownArrow: {
    fontSize: 11,
    color: "#6B7280",
  },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      web: { boxShadow: "0 6px 20px rgba(0,0,0,0.10)" },
    }),
    elevation: 10,
    zIndex: 999,
    minWidth: 130,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  dropdownItemActive: { backgroundColor: "#F3F0FF" },
  dropdownItemText: { fontSize: 14, color: "#374151" },
  dropdownItemTextActive: { color: "#7B61FF", fontWeight: "600" },

  // ─── Tabs ───
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  tabActive: { backgroundColor: "#EDE9FF" },
  tabText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  tabTextActive: { color: "#7B61FF", fontWeight: "600" },

  // ─── Search ───
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
    maxWidth: 360,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },

  // ─── Table ───
  tableWrapper: {
    width: "100%",
  },

  colHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 6,
    marginBottom: 2,
  },
  colHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 6,
  },

  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  rowOdd: { backgroundColor: "#FAFAFA" },

  cell: {
    fontSize: 13.5,
    color: "#111827",
    paddingHorizontal: 6,
  },
  grayText: { color: "#6B7280" },
  phoneText: { color: "#4B6BFB" },

  // ─── Name Cell ───
  nameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  nameText: { fontSize: 13.5, color: "#111827", flexShrink: 1 },

  // ─── Add Patient ───
  addBtnWrapper: {
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  addBtn: {
    backgroundColor: "#4B6BFB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 12.5, fontWeight: "600" },

  // ─── Status ───
  statusWrapper: {
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusActive: { backgroundColor: "#ECFDF5" },
  statusInactive: { backgroundColor: "#FEF2F2" },
  statusText: { fontSize: 13, fontWeight: "600" },
  statusTextActive: { color: "#059669" },
  statusTextInactive: { color: "#EF4444" },

  // ─── Three-dot Menu ───
  menuWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 50,
  },
  dotsBtn: { padding: 6, borderRadius: 6 },
  dotsIcon: { fontSize: 20, color: "#9CA3AF" },

  contextMenu: {
    position: "absolute",
    top: 28,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      web: { boxShadow: "0 6px 20px rgba(0,0,0,0.12)" },
    }),
    elevation: 12,
    zIndex: 9999,
    minWidth: 130,
    overflow: "hidden",
  },
  contextMenuItem: { paddingHorizontal: 16, paddingVertical: 11 },
  contextMenuDelete: { fontSize: 14, color: "#EF4444", fontWeight: "500" },

  // ─── Empty State ───
  emptyRow: { paddingVertical: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9CA3AF" },

  // ─── Pagination ───
  pagination: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  paginationText: { fontSize: 13, color: "#6B7280" },
  paginationBtns: { flexDirection: "row", gap: 6 },
  pageBtn: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnText: { fontSize: 16, color: "#374151" },
});
const mStyles = StyleSheet.create({
  wrap: { backgroundColor: "#F3F4F6", flex: 1, padding: 12 },
  header: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  headerIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#EDE9FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "500", color: "#111827" },
  headerSub: { fontSize: 12, color: "#6B7280", marginLeft: 46 },

  tabsRow: { marginBottom: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 6,
  },
  tabActive: { backgroundColor: "#EDE9FF" },
  tabText: { fontSize: 13, color: "#6B7280" },
  tabTextActive: { color: "#7B61FF", fontWeight: "500" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchIconText: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingBottom: 10,
  },
  badge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  badgeActive: { backgroundColor: "#ECFDF5" },
  badgeInactive: { backgroundColor: "#FEF2F2" },
  badgeText: { fontSize: 12, fontWeight: "500" },
  badgeTextActive: { color: "#059669" },
  badgeTextInactive: { color: "#EF4444" },
  docId: { fontSize: 12, color: "#6B7280" },

  divider: { height: 0.5, backgroundColor: "#E5E7EB", marginHorizontal: 16 },

  cardBody: { padding: 14 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  docName: { fontSize: 15, fontWeight: "500", color: "#111827" },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  infoItem: { width: "47%" },
  infoItemFull: { width: "100%" },
  infoLabel: { fontSize: 11, color: "#6B7280", marginBottom: 2 },
  infoValue: { fontSize: 14, color: "#111827" },
  amountText: { color: "#059669", fontWeight: "500" },
  phoneText: { color: "#4B6BFB" },

  addBtn: {
    backgroundColor: "#4B6BFB",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "500" },

  empty: { paddingVertical: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9CA3AF" },

  pagination: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  pgCount: { fontSize: 13, color: "#6B7280" },
  pgBtns: { flexDirection: "row", gap: 6 },
  pgBtn: {
    width: 28,
    height: 28,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  pgBtnText: { fontSize: 16, color: "#374151" },
});

export default DashboardDoctorTable;
