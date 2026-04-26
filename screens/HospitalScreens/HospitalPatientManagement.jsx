// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   ImageBackground,
//   Platform,
//   useWindowDimensions,
//   Animated,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
// import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

// // ─── MOCK DATA ────────────────────────────────────────────────
// const PATIENTS = [
//   {
//     id: "KK-2024-08821",
//     name: "Rajesh Sharma",
//     age: 54,
//     insurer: "Star Health",
//     procedure: "CABG",
//     status: "Discharged",
//     claims: 1,
//     initials: "RS",
//     dob: "12 Mar 1970",
//     gender: "Male",
//     policy: "SH-48821-C",
//     phone: "+91 9874563210",
//     admitted: "12 Aug 2024",
//     discharged: "19 Aug 2024",
//     hasClaim: false,
//   },
//   {
//     id: "KK-2024-08822",
//     name: "Priya Nair",
//     age: 42,
//     insurer: "HDFC Ergo",
//     procedure: "Appendectomy",
//     status: "Discharged",
//     claims: 0,
//     initials: "PN",
//     dob: "05 Jun 1982",
//     gender: "Female",
//     policy: "HE-30021-A",
//     phone: "+91 9823456789",
//     admitted: "01 Sep 2024",
//     discharged: "05 Sep 2024",
//     hasClaim: false,
//   },
//   {
//     id: "KK-2024-08823",
//     name: "Amit Verma",
//     age: 61,
//     insurer: "Star Health",
//     procedure: "Hip Replacement",
//     status: "Claim denied",
//     claims: 0,
//     initials: "AV",
//     dob: "18 Jan 1963",
//     gender: "Male",
//     policy: "SH-71100-D",
//     phone: "+91 9912345678",
//     admitted: "20 Jul 2024",
//     discharged: "30 Jul 2024",
//     hasClaim: true,
//   },
//   {
//     id: "KK-2024-08824",
//     name: "Sunita Rao",
//     age: 38,
//     insurer: "ICICI Lombard",
//     procedure: "Knee Surgery",
//     status: null,
//     claims: 1,
//     initials: "SR",
//     dob: "22 Nov 1986",
//     gender: "Female",
//     policy: "IL-55432-B",
//     phone: "+91 9765432100",
//     admitted: "10 Oct 2024",
//     discharged: "15 Oct 2024",
//     hasClaim: false,
//   },
// ];

// const UNLINKED = [
//   {
//     id: "KK-2024-08825",
//     name: "Rajesh Sharma",
//     age: 54,
//     insurer: "Star Health",
//     procedure: "CABG",
//     initials: "RS",
//   },
//   {
//     id: "KK-2024-08826",
//     name: "Rajesh Sharma",
//     age: 54,
//     insurer: "Star Health",
//     procedure: "CABG",
//     initials: "RS",
//   },
// ];

// const INSURERS = [
//   "All Insurers",
//   "Star Health",
//   "HDFC Ergo",
//   "ICICI Lombard",
//   "Bajaj Allianz",
// ];

// // ─── STATUS BADGE ─────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   if (!status) return null;
//   const colorMap = {
//     Discharged: { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
//     "Claim denied": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
//   };
//   const colors = colorMap[status] || { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" };
//   return (
//     <View style={{ backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 6 }}>
//       <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>{status}</Text>
//     </View>
//   );
// };

// // ─── CLAIM BADGE ──────────────────────────────────────────────
// const ClaimBadge = ({ count }) => {
//   if (!count) return null;
//   return (
//     <View style={{ backgroundColor: "#E3F2FD", borderWidth: 1, borderColor: "#90CAF9", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 }}>
//       <Text style={{ color: "#1565C0", fontSize: 12, fontWeight: "600" }}>{count} Claim{count > 1 ? "s" : ""}</Text>
//     </View>
//   );
// };

// // ─── AVATAR ───────────────────────────────────────────────────
// const Avatar = ({ initials, size = 40 }) => (
//   <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 14 }}>
//     <Text style={{ color: "#1D4ED8", fontWeight: "700", fontSize: size * 0.35 }}>{initials}</Text>
//   </View>
// );

// // ─── DETAIL LABEL-VALUE PAIR ──────────────────────────────────
// const DetailCell = ({ label, value }) => (
//   <View style={{ flex: 1, minWidth: "30%", marginBottom: 16 }}>
//     <Text style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</Text>
//     <Text style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}>{value || "—"}</Text>
//   </View>
// );

// // ─── PATIENT DETAIL PANEL ─────────────────────────────────────
// const PatientDetailPanel = ({ patient, onClose, navigation }) => {
//   const [assignedDoctor, setAssignedDoctor] = useState("Assign Doctor");
//   const [doctorDropOpen, setDoctorDropOpen] = useState(false);
//   const doctors = ["Dr. Arjun Mehta", "Dr. Kavitha Rao", "Dr. Suresh Pillai", "Dr. Anita Singh"];

//   return (
//     <ScrollView style={styles.detailPanel} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

//       {/* Patient header row inside panel */}
//       <View style={styles.detailPatientRow}>
//         <Avatar initials={patient.initials} size={38} />
//         <View style={{ flex: 1 }}>
//           <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{patient.name}</Text>
//           <Text style={{ fontSize: 12, color: "#6B7280" }}>
//             {patient.id} · Age {patient.age} · {patient.insurer} · {patient.procedure}
//           </Text>
//         </View>
//         <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: "#D1D5DB", justifyContent: "center", alignItems: "center" }}>
//           <Text style={{ fontSize: 13, color: "#6B7280" }}>⊙</Text>
//         </View>
//       </View>

//       {/* Two-column body */}
//       <View style={styles.detailBody}>

//         {/* ── LEFT: Insurance Claims ── */}
//         <View style={styles.detailLeft}>
//           <Text style={styles.detailSectionTitle}>Insurance Claims</Text>
//           <View style={styles.detailSectionBox}>
//             {patient.hasClaim ? (
//               <View>
//                 <Text style={{ fontSize: 13, color: "#374151", marginBottom: 10 }}>Claim filed and under review.</Text>
//               </View>
//             ) : (
//               <View style={{ alignItems: "flex-start", gap: 10 }}>
//                 {/* File icon */}
//                 <View style={styles.fileIconBox}>
//                   <Text style={{ fontSize: 28 }}>📄</Text>
//                 </View>
//                 <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
//                   No insurance claim filed yet for this patient
//                 </Text>
//                 <TouchableOpacity style={styles.greenBtn}>
//                   <Text style={styles.greenBtnText}>File claim Now</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           {/* Post Ops */}
//           <Text style={[styles.detailSectionTitle, { marginTop: 20 }]}>Post Ops</Text>
//           <View style={styles.detailSectionBox}>
//             <View style={{ alignItems: "flex-start", gap: 10 }}>
//               <View style={styles.fileIconBox}>
//                 <Text style={{ fontSize: 28 }}>📄</Text>
//               </View>
//               <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
//                 Upload Prescription And reports & do{" "}
//                 <Text style={{ color: "#2563EB", fontWeight: "600" }}>
//                   AI-Powered Full Case Review
//                 </Text>
//               </Text>
//               <TouchableOpacity
//                 style={styles.greenBtn}
//                 onPress={() => navigation && navigation.navigate("HospitalPostOpCare")}
//               >
//                 <Text style={styles.greenBtnText}>Post Ops Care</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* ── RIGHT: Patient Details ── */}
//         <View style={styles.detailRight}>
//           <Text style={styles.detailSectionTitle}>Patients Details</Text>
//           <View style={styles.detailInfoBox}>
//             {/* Grid of label-value pairs */}
//             <View style={styles.detailGrid}>
//               <DetailCell label="DOB" value={patient.dob} />
//               <DetailCell label="Gender" value={patient.gender} />
//               <DetailCell label="Policy" value={patient.policy} />
//               <DetailCell label="Phone" value={patient.phone} />
//               <DetailCell label="Admitted" value={patient.admitted} />
//               <DetailCell label="Discharged" value={patient.discharged} />
//             </View>

//             {/* Assign Doctor dropdown */}
//             <View style={{ position: "relative", zIndex: 20, marginTop: 4 }}>
//               <TouchableOpacity
//                 style={styles.assignDoctorBtn}
//                 onPress={() => setDoctorDropOpen(!doctorDropOpen)}
//               >
//                 <Text style={{ fontSize: 13, color: "#374151", flex: 1 }}>{assignedDoctor}</Text>
//                 <Text style={{ color: "#6B7280", fontSize: 12 }}>▾</Text>
//               </TouchableOpacity>
//               {doctorDropOpen && (
//                 <View style={styles.assignDoctorMenu}>
//                   {doctors.map((doc) => (
//                     <TouchableOpacity
//                       key={doc}
//                       style={styles.assignDoctorItem}
//                       onPress={() => {
//                         setAssignedDoctor(doc);
//                         setDoctorDropOpen(false);
//                       }}
//                     >
//                       <Text style={{ fontSize: 13, color: assignedDoctor === doc ? "#2563EB" : "#374151", fontWeight: assignedDoctor === doc ? "700" : "400" }}>
//                         {doc}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               )}
//             </View>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// // ─── MAIN COMPONENT ───────────────────────────────────────────
// const HospitalPatientManagement = ({ navigation }) => {
//   const [activeTab, setActiveTab] = useState("view");
//   const [searchText, setSearchText] = useState("");
//   const [selectedInsurer, setSelectedInsurer] = useState("All Insurers");
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const { width } = useWindowDimensions();

//   // Animated slide value: 0 = detail hidden (list full width), 1 = detail visible
//   const slideAnim = useRef(new Animated.Value(0)).current;

//   const tabs = [
//     { key: "add_patients", label: "+ Add Patients" },
//     { key: "add_doctor", label: "+ Add Doctor" },
//     { key: "view", label: "View All Patients" },
//   ];

//   const filteredPatients = PATIENTS.filter((p) => {
//     const matchSearch =
//       searchText === "" ||
//       p.name.toLowerCase().includes(searchText.toLowerCase()) ||
//       p.id.toLowerCase().includes(searchText.toLowerCase());
//     const matchInsurer =
//       selectedInsurer === "All Insurers" || p.insurer === selectedInsurer;
//     return matchSearch && matchInsurer;
//   });

//   const openDetail = (patient) => {
//     setSelectedPatient(patient);
//     Animated.spring(slideAnim, {
//       toValue: 1,
//       useNativeDriver: false,
//       tension: 60,
//       friction: 10,
//     }).start();
//   };

//   const closeDetail = () => {
//     Animated.spring(slideAnim, {
//       toValue: 0,
//       useNativeDriver: false,
//       tension: 60,
//       friction: 10,
//     }).start(() => setSelectedPatient(null));
//   };

//   // List pane shrinks, detail pane slides in from right
//   const listFlex = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.42] });
//   const detailFlex = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.58] });
//   const detailOpacity = slideAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
//   const detailTranslateX = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });

//   // ── SHARED CARD CONTENT ──────────────────────────────────────
//   const renderCard = () => (
//     <View style={styles.card}>
//       {/* CARD HEADER */}
//       <View style={styles.cardHeader}>
//         <Text style={styles.cardTitle}>Patient Management</Text>
//         <TouchableOpacity
//           style={styles.backBtn}
//           onPress={selectedPatient ? closeDetail : () => navigation && navigation.goBack()}
//         >
//           <Text style={styles.backBtnText}>{selectedPatient ? "Back" : "Back to home"}</Text>
//         </TouchableOpacity>
//       </View>

//       {/* TABS */}
//       <View style={styles.tabRow}>
//         {tabs.map((tab) => (
//           <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={styles.tabItem}>
//             <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
//               {tab.label}
//             </Text>
//             {activeTab === tab.key && <View style={styles.tabUnderline} />}
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* SEARCH + FILTER + ADD BUTTON */}
//       <View style={styles.controlRow}>
//         <View style={styles.searchBox}>
//           <Text style={{ color: "#9CA3AF", marginRight: 8, fontSize: 15 }}>🔍</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search For Patient"
//             placeholderTextColor="#9CA3AF"
//             value={searchText}
//             onChangeText={setSearchText}
//           />
//         </View>

//         <View style={{ position: "relative", zIndex: 10 }}>
//           <TouchableOpacity style={styles.dropdownBtn} onPress={() => setDropdownOpen(!dropdownOpen)}>
//             <Text style={styles.dropdownText}>{selectedInsurer}</Text>
//             <Text style={{ color: "#6B7280", marginLeft: 6, fontSize: 12 }}>▾</Text>
//           </TouchableOpacity>
//           {dropdownOpen && (
//             <View style={styles.dropdownMenu}>
//               {INSURERS.map((ins) => (
//                 <TouchableOpacity
//                   key={ins}
//                   style={styles.dropdownItem}
//                   onPress={() => { setSelectedInsurer(ins); setDropdownOpen(false); }}
//                 >
//                   <Text style={[styles.dropdownItemText, selectedInsurer === ins && { color: "#2563EB", fontWeight: "700" }]}>
//                     {ins}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}
//         </View>

//         <TouchableOpacity style={styles.addBtn}>
//           <Text style={styles.addBtnText}>+ Add Patients</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ── BODY: LIST + SLIDING DETAIL ── */}
//       <View style={styles.bodyRow}>

//         {/* LIST PANE */}
//         <Animated.View style={[styles.listPane, { flex: listFlex }]}>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             {/* Linked patients */}
//             <View style={styles.listContainer}>
//               {filteredPatients.map((patient, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => openDetail(patient)}
//                   style={[
//                     styles.patientRow,
//                     index < filteredPatients.length - 1 && styles.patientRowBorder,
//                     selectedPatient?.id === patient.id && styles.patientRowActive,
//                   ]}
//                 >
//                   <Avatar initials={patient.initials} />
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 2 }}>
//                       {patient.name}
//                     </Text>
//                     <Text style={{ fontSize: 12, color: "#6B7280" }}>
//                       {patient.id} · Age {patient.age} · {patient.insurer} · {patient.procedure}
//                     </Text>
//                   </View>
//                   <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     <StatusBadge status={patient.status} />
//                     <ClaimBadge count={patient.claims} />
//                     <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: "#D1D5DB", justifyContent: "center", alignItems: "center", marginLeft: 4 }}>
//                       <Text style={{ fontSize: 14, color: "#6B7280" }}>⊙</Text>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             {/* Unlinked claims banner */}
//             <View style={styles.unlinkedBanner}>
//               <Text style={{ color: "#92400E", fontSize: 13, fontWeight: "600" }}>
//                 ⚠️  Latest analyzed claims - not linked to a patient
//               </Text>
//             </View>

//             {/* Unlinked rows */}
//             <View style={styles.listContainer}>
//               {UNLINKED.map((patient, index) => (
//                 <View
//                   key={index}
//                   style={[styles.patientRow, index < UNLINKED.length - 1 && styles.patientRowBorder]}
//                 >
//                   <Avatar initials={patient.initials} />
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 2 }}>{patient.name}</Text>
//                     <Text style={{ fontSize: 12, color: "#6B7280" }}>
//                       {patient.id} · Age {patient.age} · {patient.insurer} · {patient.procedure}
//                     </Text>
//                   </View>
//                   <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: "#D1D5DB", justifyContent: "center", alignItems: "center" }}>
//                     <Text style={{ fontSize: 14, color: "#6B7280" }}>⊙</Text>
//                   </View>
//                 </View>
//               ))}
//             </View>

//             <View style={{ height: 30 }} />
//           </ScrollView>
//         </Animated.View>

//         {/* DIVIDER — only visible when detail is open */}
//         {selectedPatient && (
//           <View style={styles.panelDivider} />
//         )}

//         {/* DETAIL PANE — slides in from right */}
//         {selectedPatient && (
//           <Animated.View style={[styles.detailPane, { flex: detailFlex, opacity: detailOpacity, transform: [{ translateX: detailTranslateX }] }]}>
//             <PatientDetailPanel
//               patient={selectedPatient}
//               onClose={closeDetail}
//               navigation={navigation}
//             />
//           </Animated.View>
//         )}
//       </View>
//     </View>
//   );

//   // ── WEB LAYOUT ───────────────────────────────────────────────
//   if (Platform.OS === "web" && (width > 1000 || width === 0)) {
//     return (
//       <View style={styles.container}>
//         <ImageBackground
//           source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
//           style={styles.background}
//           resizeMode="cover"
//         >
//           <View style={styles.overlay} />
//           <View style={styles.main}>
//             <View style={styles.left}>
//               <HospitalSidebarNavigation navigation={navigation} />
//             </View>
//             <View style={styles.right}>
//               <View style={styles.header}>
//                 <HeaderLoginSignUp navigation={navigation} />
//               </View>
//               {renderCard()}
//             </View>
//           </View>
//         </ImageBackground>
//       </View>
//     );
//   }

//   // ── MOBILE LAYOUT ────────────────────────────────────────────
//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
//       <View style={{ zIndex: 2 }}>
//         <HeaderLoginSignUp navigation={navigation} />
//       </View>
//       <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
//         {renderCard()}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // ─── STYLES ───────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1, height: "100vh", overflow: "hidden" },
//   background: { flex: 1, height: "100%" },
//   overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1 },
//   main: { flexDirection: "row", height: "100%", zIndex: 2 },
//   left: { width: "15%" },
//   right: { width: "85%", padding: 20, zIndex: 3, height: "100%", overflow: "auto" },
//   header: { marginBottom: 16 },

//   // ── CARD
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     width: "95%",
//     alignSelf: "center",
//     zIndex: 5,
//     height: "85vh",
//     overflow: "hidden",
//     flexDirection: "column",
//   },

//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 24,
//     paddingVertical: 18,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//   },

//   cardTitle: { fontSize: 19, fontWeight: "600", color: "#111827" },

//   backBtn: { borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 5 },
//   backBtnText: { fontSize: 15, fontWeight: "500", color: "#555555" },

//   // ── TABS
//   tabRow: { flexDirection: "row", paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
//   tabItem: { paddingVertical: 14, paddingHorizontal: 12, position: "relative", marginRight: 4 },
//   tabText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
//   tabTextActive: { color: "#2563EB", fontWeight: "600" },
//   tabUnderline: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#2563EB", borderRadius: 2 },

//   // ── CONTROLS
//   controlRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", zIndex: 10 },
//   searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#FAFAFA" },
//   searchInput: { flex: 1, fontSize: 13, color: "#111827", outlineWidth: 0 },
//   dropdownBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "#FAFAFA", minWidth: 130 },
//   dropdownText: { fontSize: 13, color: "#374151", flex: 1 },
//   dropdownMenu: { position: "absolute", top: 42, left: 0, right: 0, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, zIndex: 100, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 10, overflow: "hidden" },
//   dropdownItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
//   dropdownItemText: { fontSize: 13, color: "#374151" },
//   addBtn: { backgroundColor: "#2563EB", borderRadius: 8, paddingHorizontal: 18, paddingVertical: 9 },
//   addBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

//   // ── BODY ROW (list + detail side by side)
//   bodyRow: { flex: 1, flexDirection: "row", overflow: "hidden" },

//   // ── LIST PANE
//   listPane: { overflow: "hidden" },

//   listContainer: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: "#F1F5F9", borderRadius: 10, overflow: "hidden" },

//   patientRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, backgroundColor: "#fff" },
//   patientRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
//   patientRowActive: { backgroundColor: "#F0F6FF" },

//   unlinkedBanner: { marginHorizontal: 16, marginTop: 16, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center" },

//   // ── PANEL DIVIDER
//   panelDivider: { width: 1, backgroundColor: "#e5e7eb" },

//   // ── DETAIL PANE
//   detailPane: { overflow: "hidden", backgroundColor: "#fff" },

//   detailPanel: { flex: 1, backgroundColor: "#fff" },

//   detailPatientRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//     backgroundColor: "#fff",
//   },

//   detailBody: {
//     flexDirection: "row",
//     flex: 1,
//     padding: 16,
//     gap: 12,
//   },

//   // ── LEFT SECTION (Insurance + Post Ops)
//   detailLeft: { flex: 1 },

//   detailSectionTitle: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },

//   detailSectionBox: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 10,
//     padding: 16,
//     backgroundColor: "#FAFAFA",
//     minHeight: 130,
//   },

//   fileIconBox: {
//     width: 44,
//     height: 44,
//     borderRadius: 8,
//     backgroundColor: "#F3F4F6",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   greenBtn: {
//     backgroundColor: "#16A34A",
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginTop: 4,
//   },

//   greenBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

//   // ── RIGHT SECTION (Patient Details)
//   detailRight: { flex: 1 },

//   detailInfoBox: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 10,
//     padding: 16,
//     backgroundColor: "#fff",
//   },

//   detailGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 4,
//     marginBottom: 8,
//   },

//   assignDoctorBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     backgroundColor: "#fff",
//     marginTop: 4,
//   },

//   assignDoctorMenu: {
//     position: "absolute",
//     bottom: 40,
//     left: 0,
//     right: 0,
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 8,
//     zIndex: 50,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 10,
//     overflow: "hidden",
//   },

//   assignDoctorItem: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F9FAFB",
//   },
// });

// export default HospitalPatientManagement;

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
  Platform,
  useWindowDimensions,
  Animated,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

// ─── MOCK DATA ────────────────────────────────────────────────
const INITIAL_PATIENTS = [
  {
    id: "KK-2024-08821",
    name: "Rajesh Sharma",
    age: 54,
    insurer: "Star Health",
    procedure: "CABG",
    status: "Discharged",
    claims: 1,
    initials: "RS",
    dob: "12 Mar 1970",
    gender: "Male",
    policy: "SH-48821-C",
    phone: "+91 9874563210",
    admitted: "12 Aug 2024",
    discharged: "19 Aug 2024",
    hasClaim: false,
  },
  {
    id: "KK-2024-08822",
    name: "Priya Nair",
    age: 42,
    insurer: "HDFC Ergo",
    procedure: "Appendectomy",
    status: "Discharged",
    claims: 0,
    initials: "PN",
    dob: "05 Jun 1982",
    gender: "Female",
    policy: "HE-30021-A",
    phone: "+91 9823456789",
    admitted: "01 Sep 2024",
    discharged: "05 Sep 2024",
    hasClaim: false,
  },
  {
    id: "KK-2024-08823",
    name: "Amit Verma",
    age: 61,
    insurer: "Star Health",
    procedure: "Hip Replacement",
    status: "Claim denied",
    claims: 0,
    initials: "AV",
    dob: "18 Jan 1963",
    gender: "Male",
    policy: "SH-71100-D",
    phone: "+91 9912345678",
    admitted: "20 Jul 2024",
    discharged: "30 Jul 2024",
    hasClaim: true,
  },
  {
    id: "KK-2024-08824",
    name: "Sunita Rao",
    age: 38,
    insurer: "ICICI Lombard",
    procedure: "Knee Surgery",
    status: null,
    claims: 1,
    initials: "SR",
    dob: "22 Nov 1986",
    gender: "Female",
    policy: "IL-55432-B",
    phone: "+91 9765432100",
    admitted: "10 Oct 2024",
    discharged: "15 Oct 2024",
    hasClaim: false,
  },
];

const UNLINKED = [
  {
    id: "KK-2024-08825",
    name: "Rajesh Sharma",
    age: 54,
    insurer: "Star Health",
    procedure: "CABG",
    initials: "RS",
  },
  {
    id: "KK-2024-08826",
    name: "Rajesh Sharma",
    age: 54,
    insurer: "Star Health",
    procedure: "CABG",
    initials: "RS",
  },
];

const INSURERS = [
  "All Insurers",
  "Star Health",
  "HDFC Ergo",
  "ICICI Lombard",
  "Bajaj Allianz",
];
const DOCTORS = [
  "Dr. Arjun Mehta",
  "Dr. Kavitha Rao",
  "Dr. Suresh Pillai",
  "Dr. Anita Singh",
];
const GENDERS = ["Male", "Female", "Other"];

let patientIdCounter = 8827;
const generatePatientId = () => `KK-2024-0${patientIdCounter++}`;
const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── STATUS BADGE ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (!status) return null;
  const colorMap = {
    Discharged: { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
    "Claim denied": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
  };
  const colors = colorMap[status] || {
    bg: "#E3F2FD",
    text: "#1565C0",
    border: "#90CAF9",
  };
  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginRight: 6,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>
        {status}
      </Text>
    </View>
  );
};

// ─── CLAIM BADGE ──────────────────────────────────────────────
const ClaimBadge = ({ count }) => {
  if (!count) return null;
  return (
    <View
      style={{
        backgroundColor: "#E3F2FD",
        borderWidth: 1,
        borderColor: "#90CAF9",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 6,
      }}
    >
      <Text style={{ color: "#1565C0", fontSize: 12, fontWeight: "600" }}>
        {count} Claim{count > 1 ? "s" : ""}
      </Text>
    </View>
  );
};

// ─── AVATAR ───────────────────────────────────────────────────
const Avatar = ({ initials, size = 40 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: "#DBEAFE",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    }}
  >
    <Text
      style={{ color: "#1D4ED8", fontWeight: "700", fontSize: size * 0.35 }}
    >
      {initials}
    </Text>
  </View>
);

// ─── DETAIL LABEL-VALUE PAIR ──────────────────────────────────
const DetailCell = ({ label, value }) => (
  <View style={{ flex: 1, minWidth: "30%", marginBottom: 16 }}>
    <Text
      style={{
        fontSize: 11,
        color: "#9CA3AF",
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      }}
    >
      {label}
    </Text>
    <Text style={{ fontSize: 14, color: "#111827", fontWeight: "600" }}>
      {value || "—"}
    </Text>
  </View>
);

// ─── SELECT ROW (inline dropdown replacement) ─────────────────
const SelectRow = ({ label, value, options, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.formSelect}
        onPress={() => setOpen(!open)}
      >
        <Text
          style={{
            fontSize: 13,
            color: value ? "#111827" : "#9CA3AF",
            flex: 1,
          }}
        >
          {value || placeholder}
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 11 }}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.selectMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.selectMenuItem}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: value === opt ? "#2563EB" : "#374151",
                  fontWeight: value === opt ? "700" : "400",
                }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── ADD PATIENT FORM ─────────────────────────────────────────
const AddPatientForm = ({ onSave, onSaveAndAnother }) => {
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    policy: "",
    insurer: "",
    admissionDate: "",
    procedure: "",
    doctor: "",
  });
  const [generatedId] = useState(generatePatientId());
  const [savedMessage, setSavedMessage] = useState("");

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const buildPatient = () => ({
    id: generatedId,
    name: form.fullName || "New Patient",
    age: form.dob
      ? new Date().getFullYear() - parseInt(form.dob.slice(-4) || 2000)
      : "—",
    insurer: form.insurer || "—",
    procedure: form.procedure || "—",
    status: "Discharged",
    claims: 0,
    initials: getInitials(form.fullName),
    dob: form.dob,
    gender: form.gender,
    policy: form.policy,
    phone: form.phone,
    admitted: form.admissionDate,
    discharged: "—",
    hasClaim: false,
  });

  const handleSave = () => {
    const patient = buildPatient();
    setSavedMessage(`${patient.name} saved with Patient ID ${patient.id}`);
    onSave(patient);
  };

  const handleSaveAnother = () => {
    const patient = buildPatient();
    onSaveAndAnother(patient, form.fullName, generatedId);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {/* Section: Patient Details */}
      <Text style={styles.formSectionHeading}>Patients Details :</Text>

      {/* Row 1: Full Name + DOB */}
      <View style={styles.formRow}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Full name <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter Name..."
            placeholderTextColor="#9CA3AF"
            value={form.fullName}
            onChangeText={(v) => set("fullName", v)}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Date of birth <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={styles.formInput}
            placeholder="Select department"
            placeholderTextColor="#9CA3AF"
            value={form.dob}
            onChangeText={(v) => set("dob", v)}
          />
        </View>
      </View>

      {/* Row 2: Patient ID + Gender */}
      <View style={styles.formRow}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Patient ID</Text>
          <TextInput
            style={[styles.formInput, { color: "#9CA3AF" }]}
            value={generatedId}
            editable={false}
            placeholder="Auto-generated"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <SelectRow
          label="Gender *"
          value={form.gender}
          options={GENDERS}
          onSelect={(v) => set("gender", v)}
          placeholder="Select Gender"
        />
      </View>

      {/* Row 3: Phone + Policy */}
      <View style={styles.formRow}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Phone no</Text>
          <TextInput
            style={styles.formInput}
            placeholder="+91 9823400998"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => set("phone", v)}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Insurance policy number</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g SH-48821-C"
            placeholderTextColor="#9CA3AF"
            value={form.policy}
            onChangeText={(v) => set("policy", v)}
          />
        </View>
      </View>

      {/* Row 4: Insurer + Admission Date */}
      <View style={styles.formRow}>
        <SelectRow
          label="Insurer"
          value={form.insurer}
          options={INSURERS.slice(1)}
          onSelect={(v) => set("insurer", v)}
          placeholder="Select Insurer"
        />
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Admission date</Text>
          <TextInput
            style={styles.formInput}
            placeholder="dd-mm-yyyy"
            placeholderTextColor="#9CA3AF"
            value={form.admissionDate}
            onChangeText={(v) => set("admissionDate", v)}
          />
        </View>
      </View>

      {/* Row 5: Diagnosis + Assign Doctor */}
      <View style={styles.formRow}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Diagnosis/Procedure</Text>
          <TextInput
            style={styles.formInput}
            placeholder="eg CABG, Hysterectomy"
            placeholderTextColor="#9CA3AF"
            value={form.procedure}
            onChangeText={(v) => set("procedure", v)}
          />
        </View>
        <SelectRow
          label="Assign Doctor"
          value={form.doctor}
          options={DOCTORS}
          onSelect={(v) => set("doctor", v)}
          placeholder="Select Doctor"
        />
      </View>

      {/* Import from Excel/CSV */}
      <View style={styles.importRow}>
        <Text style={styles.importLabel}>1 Import from excel/csv</Text>
      </View>
      <View style={styles.importSection}>
        <View style={styles.uploadBox}>
          <Text style={{ fontSize: 22, marginBottom: 6 }}>⬆</Text>
          <Text style={{ fontSize: 13, color: "#6B7280" }}>
            Upload patient list (.xlsx or .csv){" "}
            <Text style={{ color: "#2563EB", fontWeight: "600" }}>
              Click here
            </Text>
          </Text>
        </View>
        <View style={styles.downloadBox}>
          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={{ fontSize: 12, color: "#374151", fontWeight: "500" }}>
              Download Template
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
            Not sure of format? download our template first
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveMoreBtn}
          onPress={handleSaveAnother}
        >
          <Text style={styles.saveMoreBtnText}>
            Save & Register Another Patient →
          </Text>
        </TouchableOpacity>
        {savedMessage !== "" && (
          <View style={styles.savedPill}>
            <Text style={styles.savedPillText}>
              <Text style={{ fontWeight: "700" }}>
                {form.fullName || "Patient"}{" "}
              </Text>
              saved with Patient ID{" "}
              <Text style={{ fontWeight: "700" }}>{generatedId}</Text>
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ─── PATIENT DETAIL PANEL ─────────────────────────────────────
const PatientDetailPanel = ({ patient, onClose, navigation }) => {
  const [assignedDoctor, setAssignedDoctor] = useState("Assign Doctor");
  const [doctorDropOpen, setDoctorDropOpen] = useState(false);

  return (
    <ScrollView
      style={styles.detailPanel}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={styles.detailPatientRow}>
        <Avatar initials={patient.initials} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
            {patient.name}
          </Text>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            {patient.id} · Age {patient.age} · {patient.insurer} ·{" "}
            {patient.procedure}
          </Text>
        </View>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: "#D1D5DB",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, color: "#6B7280" }}>⊙</Text>
        </View>
      </View>

      <View style={styles.detailBody}>
        <View style={styles.detailLeft}>
          <Text style={styles.detailSectionTitle}>Insurance Claims</Text>
          <View style={styles.detailSectionBox}>
            {patient.hasClaim ? (
              <Text style={{ fontSize: 13, color: "#374151" }}>
                Claim filed and under review.
              </Text>
            ) : (
              <View style={{ alignItems: "flex-start", gap: 10 }}>
                <View style={styles.fileIconBox}>
                  <Text style={{ fontSize: 28 }}>📄</Text>
                </View>
                <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                  No insurance claim filed yet for this patient
                </Text>
                <TouchableOpacity style={styles.greenBtn}>
                  <Text style={styles.greenBtnText}>File claim Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={[styles.detailSectionTitle, { marginTop: 20 }]}>
            Post Ops
          </Text>
          <View style={styles.detailSectionBox}>
            <View style={{ alignItems: "flex-start", gap: 10 }}>
              <View style={styles.fileIconBox}>
                <Text style={{ fontSize: 28 }}>📄</Text>
              </View>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                Upload Prescription And reports & do{" "}
                <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                  AI-Powered Full Case Review
                </Text>
              </Text>
              <TouchableOpacity
                style={styles.greenBtn}
                onPress={() =>
                  navigation && navigation.navigate("HospitalPostOpCare")
                }
              >
                <Text style={styles.greenBtnText}>Post Ops Care</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.detailRight}>
          <Text style={styles.detailSectionTitle}>Patients Details</Text>
          <View style={styles.detailInfoBox}>
            <View style={styles.detailGrid}>
              <DetailCell label="DOB" value={patient.dob} />
              <DetailCell label="Gender" value={patient.gender} />
              <DetailCell label="Policy" value={patient.policy} />
              <DetailCell label="Phone" value={patient.phone} />
              <DetailCell label="Admitted" value={patient.admitted} />
              <DetailCell label="Discharged" value={patient.discharged} />
            </View>
            <View style={{ position: "relative", zIndex: 20, marginTop: 4 }}>
              <TouchableOpacity
                style={styles.assignDoctorBtn}
                onPress={() => setDoctorDropOpen(!doctorDropOpen)}
              >
                <Text style={{ fontSize: 13, color: "#374151", flex: 1 }}>
                  {assignedDoctor}
                </Text>
                <Text style={{ color: "#6B7280", fontSize: 12 }}>▾</Text>
              </TouchableOpacity>
              {doctorDropOpen && (
                <View style={styles.assignDoctorMenu}>
                  {DOCTORS.map((doc) => (
                    <TouchableOpacity
                      key={doc}
                      style={styles.assignDoctorItem}
                      onPress={() => {
                        setAssignedDoctor(doc);
                        setDoctorDropOpen(false);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: assignedDoctor === doc ? "#2563EB" : "#374151",
                          fontWeight: assignedDoctor === doc ? "700" : "400",
                        }}
                      >
                        {doc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ─── SUCCESS TOAST MODAL ──────────────────────────────────────
const SuccessToast = ({ visible, patientName, patientId, onDismiss }) => {
  if (!visible) return null;
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.toastOverlay}>
        <View style={styles.toastBox}>
          <View style={styles.toastIconCircle}>
            <Text style={{ fontSize: 22, color: "#16A34A" }}>✓</Text>
          </View>
          <Text style={styles.toastTitle}>Patient Added!</Text>
          <Text style={styles.toastBody}>
            <Text style={{ fontWeight: "700" }}>{patientName}</Text> has been
            registered successfully.{"\n"}
            Patient ID:{" "}
            <Text style={{ fontWeight: "700", color: "#2563EB" }}>
              {patientId}
            </Text>
          </Text>
          <TouchableOpacity style={styles.toastDismissBtn} onPress={onDismiss}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
              OK, Add Another
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────
const HospitalPatientManagement = ({ navigation }) => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [activeTab, setActiveTab] = useState("view");
  const [searchText, setSearchText] = useState("");
  const [selectedInsurer, setSelectedInsurer] = useState("All Insurers");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [toast, setToast] = useState({ visible: false, name: "", id: "" });
  const { width } = useWindowDimensions();

  // Two independent animated values:
  // slideAnim: 0 = patient list full | 1 = detail panel open (list + detail side by side)
  const slideAnim = useRef(new Animated.Value(0)).current;
  // formAnim: 0 = patient list | 1 = add patient form (form slides in from right, list moves off left)
  const formAnim = useRef(new Animated.Value(0)).current;

  const tabs = [
    { key: "add_patients", label: "+ Add Patients" },
    { key: "add_doctor", label: "+ Add Doctor" },
    { key: "view", label: "View All Patients" },
  ];

  const filteredPatients = patients.filter((p) => {
    const matchSearch =
      searchText === "" ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.id.toLowerCase().includes(searchText.toLowerCase());
    const matchInsurer =
      selectedInsurer === "All Insurers" || p.insurer === selectedInsurer;
    return matchSearch && matchInsurer;
  });

  // ── Open / close patient detail panel ──
  const openDetail = (patient) => {
    setSelectedPatient(patient);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  };

  const closeDetail = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start(() => setSelectedPatient(null));
  };

  // ── Open / close Add Patient form ──
  const openAddPatientForm = () => {
    // Close detail if open
    setSelectedPatient(null);
    slideAnim.setValue(0);
    setActiveTab("add_patients");
    Animated.spring(formAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 55,
      friction: 11,
    }).start();
  };

  const closeAddPatientForm = () => {
    setActiveTab("view");
    Animated.spring(formAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 55,
      friction: 11,
    }).start();
  };

  // ── Save Patient → go back to list ──
  const handleSavePatient = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    closeAddPatientForm();
  };

  // ── Save & Register Another → popup + reset form ──
  const handleSaveAndAnother = (newPatient, name, id) => {
    setPatients((prev) => [newPatient, ...prev]);
    setToast({ visible: true, name, id });
  };

  const dismissToast = () => setToast({ visible: false, name: "", id: "" });

  const handleTabPress = (tabKey) => {
    if (tabKey === "add_patients") {
      openAddPatientForm();
    } else {
      closeAddPatientForm();
      closeDetail();
      setActiveTab(tabKey);
    }
  };

  // Interpolations for detail panel
  const listFlex = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.42],
  });
  const detailFlex = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.58],
  });
  const detailOpacity = slideAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  const detailTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  // Interpolations for Add Patient form slide
  // The whole body slides: listContent moves left, form slides in from right
  const listTranslateX = formAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });
  const formTranslateX = formAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });
  const formOpacity = formAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  const isFormOpen = activeTab === "add_patients";
  const isDetailOpen = !!selectedPatient;

  // ── SHARED CARD CONTENT ──────────────────────────────────────
  const renderCard = () => (
    <View style={styles.card}>
      {/* CARD HEADER */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {isFormOpen ? "Doctor & Patient Management" : "Patient Management"}
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={
            isFormOpen
              ? closeAddPatientForm
              : isDetailOpen
                ? closeDetail
                : () => navigation && navigation.goBack()
          }
        >
          <Text style={styles.backBtnText}>
            {isFormOpen || isDetailOpen ? "Back" : "Back to home"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            style={styles.tabItem}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH + FILTER + ADD BUTTON */}
      <View style={styles.controlRow}>
        <View style={styles.searchBox}>
          <Text style={{ color: "#9CA3AF", marginRight: 8, fontSize: 15 }}>
            🔍
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search For Patient"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <View style={{ position: "relative", zIndex: 10 }}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.dropdownText}>{selectedInsurer}</Text>
            <Text style={{ color: "#6B7280", marginLeft: 6, fontSize: 12 }}>
              ▾
            </Text>
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {INSURERS.map((ins) => (
                <TouchableOpacity
                  key={ins}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedInsurer(ins);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedInsurer === ins && {
                        color: "#2563EB",
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {ins}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddPatientForm}>
          <Text style={styles.addBtnText}>+ Add Patients</Text>
        </TouchableOpacity>
      </View>

      {/* ── BODY: Sliding panels ── */}
      <View style={[styles.bodyRow, { overflow: "hidden" }]}>
        {/* ── PATIENT LIST + DETAIL (slides LEFT when form opens) ── */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              flexDirection: "row",
              transform: [{ translateX: listTranslateX }],
            },
          ]}
        >
          {/* LIST PANE */}
          <Animated.View style={[styles.listPane, { flex: listFlex }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.listContainer}>
                {filteredPatients.map((patient, index) => (
                  <TouchableOpacity
                    key={patient.id}
                    onPress={() => openDetail(patient)}
                    style={[
                      styles.patientRow,
                      index < filteredPatients.length - 1 &&
                        styles.patientRowBorder,
                      selectedPatient?.id === patient.id &&
                        styles.patientRowActive,
                    ]}
                  >
                    <Avatar initials={patient.initials} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        {patient.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {patient.id} · Age {patient.age} · {patient.insurer} ·{" "}
                        {patient.procedure}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <StatusBadge status={patient.status} />
                      <ClaimBadge count={patient.claims} />
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          borderWidth: 1.5,
                          borderColor: "#D1D5DB",
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: 4,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: "#6B7280" }}>
                          ⊙
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.unlinkedBanner}>
                <Text
                  style={{ color: "#92400E", fontSize: 13, fontWeight: "600" }}
                >
                  ⚠️ Latest analyzed claims - not linked to a patient
                </Text>
              </View>

              <View style={styles.listContainer}>
                {UNLINKED.map((patient, index) => (
                  <View
                    key={index}
                    style={[
                      styles.patientRow,
                      index < UNLINKED.length - 1 && styles.patientRowBorder,
                    ]}
                  >
                    <Avatar initials={patient.initials} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        {patient.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {patient.id} · Age {patient.age} · {patient.insurer} ·{" "}
                        {patient.procedure}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: "#D1D5DB",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#6B7280" }}>⊙</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ height: 30 }} />
            </ScrollView>
          </Animated.View>

          {/* DIVIDER */}
          {isDetailOpen && <View style={styles.panelDivider} />}

          {/* DETAIL PANE */}
          {isDetailOpen && (
            <Animated.View
              style={[
                styles.detailPane,
                {
                  flex: detailFlex,
                  opacity: detailOpacity,
                  transform: [{ translateX: detailTranslateX }],
                },
              ]}
            >
              <PatientDetailPanel
                patient={selectedPatient}
                onClose={closeDetail}
                navigation={navigation}
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* ── ADD PATIENT FORM (slides in from RIGHT) ── */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "#fff",
              opacity: formOpacity,
              transform: [{ translateX: formTranslateX }],
              zIndex: isFormOpen ? 10 : -1,
            },
          ]}
          pointerEvents={isFormOpen ? "auto" : "none"}
        >
          <AddPatientForm
            key={toast.id || "form"} // re-mounts form on "Save & Register Another" to reset
            onSave={handleSavePatient}
            onSaveAndAnother={handleSaveAndAnother}
          />
        </Animated.View>
      </View>

      {/* SUCCESS TOAST */}
      <SuccessToast
        visible={toast.visible}
        patientName={toast.name}
        patientId={toast.id}
        onDismiss={dismissToast}
      />
    </View>
  );

  // ── WEB LAYOUT ───────────────────────────────────────────────
  if (Platform.OS === "web" && (width > 1000 || width === 0)) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.main}>
            <View style={styles.left}>
              <HospitalSidebarNavigation navigation={navigation} />
            </View>
            <View style={styles.right}>
              <View style={styles.header}>
                <HeaderLoginSignUp navigation={navigation} />
              </View>
              {renderCard()}
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
      <View style={{ zIndex: 2 }}>
        <HeaderLoginSignUp navigation={navigation} />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {renderCard()}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, height: "100vh", overflow: "hidden" },
  background: { flex: 1, height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  main: { flexDirection: "row", height: "100%", zIndex: 2 },
  left: { width: "15%" },
  right: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },
  header: { marginBottom: 16 },

  // ── CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    overflow: "hidden",
    flexDirection: "column",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  cardTitle: { fontSize: 19, fontWeight: "600", color: "#111827" },
  backBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backBtnText: { fontSize: 15, fontWeight: "500", color: "#555555" },

  // ── TABS
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    position: "relative",
    marginRight: 4,
  },
  tabText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  tabTextActive: { color: "#2563EB", fontWeight: "600" },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#2563EB",
    borderRadius: 2,
  },

  // ── CONTROLS
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#111827", outlineWidth: 0 },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FAFAFA",
    minWidth: 130,
  },
  dropdownText: { fontSize: 13, color: "#374151", flex: 1 },
  dropdownMenu: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  dropdownItemText: { fontSize: 13, color: "#374151" },
  addBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // ── BODY
  bodyRow: { flex: 1, flexDirection: "row", overflow: "hidden" },

  // ── LIST PANE
  listPane: { overflow: "hidden" },
  listContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 10,
    overflow: "hidden",
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  patientRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  patientRowActive: { backgroundColor: "#F0F6FF" },
  unlinkedBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  panelDivider: { width: 1, backgroundColor: "#e5e7eb" },

  // ── DETAIL PANE
  detailPane: { overflow: "hidden", backgroundColor: "#fff" },
  detailPanel: { flex: 1, backgroundColor: "#fff" },
  detailPatientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#fff",
  },
  detailBody: { flexDirection: "row", flex: 1, padding: 16, gap: 12 },
  detailLeft: { flex: 1 },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  detailSectionBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#FAFAFA",
    minHeight: 130,
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  greenBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  greenBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  detailRight: { flex: 1 },
  detailInfoBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#fff",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  assignDoctorBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginTop: 4,
  },
  assignDoctorMenu: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    zIndex: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  assignDoctorItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },

  // ── ADD PATIENT FORM
  formSectionHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  formRow: { flexDirection: "row", gap: 16, marginBottom: 14, zIndex: 1 },
  formGroup: { flex: 1, position: "relative" },
  formLabel: { fontSize: 12, color: "#6B7280", marginBottom: 5 },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#fff",
  },
  formSelect: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  selectMenu: {
    position: "absolute",
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 20,
    overflow: "hidden",
  },
  selectMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  importRow: { marginBottom: 8 },
  importLabel: { fontSize: 13, fontWeight: "500", color: "#374151" },
  importSection: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  uploadBox: {
    flex: 2,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadBox: { flex: 1, alignItems: "flex-start" },
  downloadBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  formActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    flexWrap: "wrap",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  saveMoreBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveMoreBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  savedPill: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: "60%",
  },
  savedPillText: { fontSize: 12, color: "#15803D" },

  // ── TOAST MODAL
  toastOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  toastBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 28,
    width: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  toastIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  toastTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  toastBody: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  toastDismissBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
});

export default HospitalPatientManagement;
