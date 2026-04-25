// // PARequestsScreen.jsx
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Platform,
//   useWindowDimensions,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ImageBackground,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Feather } from "@expo/vector-icons";
// import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
// import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

// // ─── STEP DATA ────────────────────────────────────────────────────────────────
// const STEPS = [
//   { id: 1, label: "Choose Patient", sub: "Select patient" },
//   { id: 2, label: "Service Info", sub: "Provider & Service" },
//   { id: 3, label: "Medical Codes", sub: "ICD-10 & CPT" },
//   { id: 4, label: "Review & Verify", sub: "Eligibility check" },
//   { id: 5, label: "PreAuth Status", sub: "Submitted" },
// ];

// // ─── WEB STEPPER ──────────────────────────────────────────────────────────────
// const WebStepper = ({ currentStep }) => (
//   <View style={ws.container}>
//     {STEPS.map((step, index) => {
//       const isActive = step.id === currentStep;
//       const isDone = step.id < currentStep;
//       return (
//         <React.Fragment key={step.id}>
//           <View style={ws.stepItem}>
//             <View
//               style={[
//                 ws.circle,
//                 isActive && ws.circleActive,
//                 isDone && ws.circleDone,
//               ]}
//             >
//               {isDone ? (
//                 <Feather name="check" size={14} color="#fff" />
//               ) : (
//                 <Text
//                   style={[
//                     ws.circleText,
//                     (isActive || isDone) && { color: "#fff" },
//                   ]}
//                 >
//                   {step.id}
//                 </Text>
//               )}
//             </View>
//             <View style={ws.labelBox}>
//               <Text
//                 style={[
//                   ws.label,
//                   isActive && { color: "#2563EB", fontWeight: "700" },
//                 ]}
//               >
//                 {step.label}
//               </Text>
//               <Text style={ws.sub}>{step.sub}</Text>
//             </View>
//           </View>
//           {index < STEPS.length - 1 && (
//             <View style={[ws.line, isDone && ws.lineDone]} />
//           )}
//         </React.Fragment>
//       );
//     })}
//   </View>
// );

// // ─── MOBILE STEPPER ───────────────────────────────────────────────────────────
// const MobileStepper = ({ currentStep }) => (
//   <View style={ms.container}>
//     {STEPS.map((step, index) => {
//       const isActive = step.id === currentStep;
//       const isDone = step.id < currentStep;
//       return (
//         <React.Fragment key={step.id}>
//           <View style={ms.stepItem}>
//             <View
//               style={[
//                 ms.circle,
//                 isActive && ms.circleActive,
//                 isDone && ms.circleDone,
//               ]}
//             >
//               {isDone ? (
//                 <Feather name="check" size={10} color="#fff" />
//               ) : (
//                 <Text
//                   style={[
//                     ms.circleText,
//                     (isActive || isDone) && { color: "#fff" },
//                   ]}
//                 >
//                   {step.id}
//                 </Text>
//               )}
//             </View>
//             <Text
//               style={[
//                 ms.label,
//                 isActive && { color: "#2563EB", fontWeight: "700" },
//               ]}
//               numberOfLines={2}
//             >
//               {step.label}
//             </Text>
//           </View>
//           {index < STEPS.length - 1 && (
//             <View style={[ms.line, isDone && ms.lineDone]} />
//           )}
//         </React.Fragment>
//       );
//     })}
//   </View>
// );

// // ─── EMPTY STATE ──────────────────────────────────────────────────────────────
// const EmptyState = ({ onNewRequest, isMobile }) => (
//   <View style={[es.container, isMobile && { paddingVertical: 60 }]}>
//     <Text style={es.title}>No new patient yet</Text>
//     <TouchableOpacity style={es.btn} onPress={onNewRequest}>
//       <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
//       <Text style={es.btnText}>Create your first PA Request</Text>
//     </TouchableOpacity>
//   </View>
// );

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// const PARequests = ({ navigation }) => {
//   const { width } = useWindowDimensions();
//   const [currentStep] = useState(1);
//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All Statuses");

//   //const isWeb = Platform.OS === "web" && width > 1000;

//   // ── WEB ────────────────────────────────────────────────────────────────────

//   return (
//     <>
//       {Platform.OS === "web" && width > 1000 && (
//         <View style={web.webContainer}>
//           <View style={web.imageContainer}>
//             <ImageBackground
//               source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
//               style={web.imageBackground}
//               resizeMode="cover"
//             >
//               <View
//                 style={[
//                   web.overlay,
//                   { backgroundColor: "rgba(0, 0, 0, 0.6)" },
//                 ]}
//               />

//               <View style={web.parent}>
//                 {/* LEFT SIDEBAR */}
//                 <View style={web.Left}>
//                   <HospitalSidebarNavigation navigation={navigation} />
//                 </View>

//                 {/* RIGHT CONTENT */}
//                 <View style={web.Right}>
//                   <View style={web.header}>
//                     <HeaderLoginSignUp navigation={navigation} />
//                   </View>

//                   {/* 🔥 ONLY THIS PART CHANGE */}
//                   <ScrollView
//                     style={{ flex: 1, backgroundColor:"#fff", margin:"2%" }}
//                     contentContainerStyle={{
//                       padding: 24,
//                       paddingBottom: 40,
//                       flexGrow: 1,
//                     }}
//                     showsVerticalScrollIndicator={false}
//                   >
//                     {/* Title Row */}
//                     <View style={web.titleRow}>
//                       <View>
//                         <Text style={web.pageTitle}>PA Requests</Text>
//                         <Text style={web.pageSub}>
//                           Create a new prior authorization request
//                         </Text>
//                       </View>

//                       <TouchableOpacity style={web.backBtn}>
//                         <Feather name="arrow-left" size={14} color="#374151" />
//                         <Text style={web.backBtnText}>Back to home</Text>
//                       </TouchableOpacity>
//                     </View>

//                     {/* Stepper */}
//                     <WebStepper currentStep={currentStep} />

//                     {/* Card */}
//                     <View style={web.card}>
//                       <View style={web.cardHeader}>
//                         <Text style={web.cardHeaderTitle}>Select Patient</Text>
//                         <TouchableOpacity style={web.newReqBtn}>
//                           <Feather name="plus" size={14} color="#fff" />
//                           <Text style={web.newReqText}>New PA Request</Text>
//                         </TouchableOpacity>
//                       </View>

//                       <View style={web.searchRow}>
//                         <View style={web.searchBox}>
//                           <Feather name="search" size={15} color="#9CA3AF" />
//                           <TextInput
//                             placeholder="Search For Patient"
//                             placeholderTextColor="#9CA3AF"
//                             value={searchText}
//                             onChangeText={setSearchText}
//                             style={web.searchInput}
//                           />
//                         </View>

//                         <View style={web.filterBox}>
//                           <Text style={web.filterText}>{statusFilter}</Text>
//                           <Feather
//                             name="chevron-down"
//                             size={14}
//                             color="#374151"
//                           />
//                         </View>
//                       </View>

//                       <EmptyState onNewRequest={() => {}} isMobile={false} />
//                     </View>
//                   </ScrollView>
//                 </View>
//               </View>
//             </ImageBackground>
//           </View>
//         </View>
//       )}
//       {(Platform.OS !== "web" || width < 1000) && (
//         <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//           <View style={mob.header}>
//             <HeaderLoginSignUp navigation={navigation} />
//           </View>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 40 }}
//           >
//             {/* Title */}
//             <Text style={mob.title}>PA Requests</Text>

//             {/* Stepper */}
//             <MobileStepper currentStep={currentStep} />

//             {/* Select Patient Header */}
//             <View style={mob.sectionHeader}>
//               <View>
//                 <Text style={mob.sectionTitle}>Select Patient</Text>
//                 <Text style={mob.sectionSub}>Choose patient</Text>
//               </View>
//               <TouchableOpacity style={mob.newReqBtn}>
//                 <Feather
//                   name="plus"
//                   size={14}
//                   color="#fff"
//                   style={{ marginRight: 4 }}
//                 />
//                 <Text style={mob.newReqText}>New PA Request</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Search + Filter */}
//             <View style={mob.searchRow}>
//               <View style={mob.searchBox}>
//                 <Feather
//                   name="search"
//                   size={14}
//                   color="#9CA3AF"
//                   style={{ marginRight: 8 }}
//                 />
//                 <TextInput
//                   placeholder="Search For Patient"
//                   placeholderTextColor="#9CA3AF"
//                   value={searchText}
//                   onChangeText={setSearchText}
//                   style={mob.searchInput}
//                 />
//               </View>
//               <View style={mob.filterBox}>
//                 <Text style={mob.filterText}>All Statuses</Text>
//                 <Feather
//                   name="chevron-down"
//                   size={13}
//                   color="#374151"
//                   style={{ marginLeft: 6 }}
//                 />
//               </View>
//             </View>

//             {/* Empty State */}
//             <EmptyState onNewRequest={() => {}} isMobile={true} />
//           </ScrollView>
//         </SafeAreaView>
//       )}
//       ;
//     </>
//   );
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // STYLES
// // ═══════════════════════════════════════════════════════════════════════════════

// // Web Stepper
// const ws = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 24,
//     paddingVertical: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   stepItem: { flexDirection: "row", alignItems: "center", gap: 10 },
//   circle: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: "#D1D5DB",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   circleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
//   circleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
//   circleText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
//   labelBox: { flexDirection: "column" },
//   label: { fontSize: 13, fontWeight: "600", color: "#374151" },
//   sub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
//   line: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginHorizontal: 8 },
//   lineDone: { backgroundColor: "#16A34A" },
// });

// // Mobile Stepper
// const ms = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     marginBottom: 4,
//   },
//   stepItem: { alignItems: "center", gap: 4 },
//   circle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     borderWidth: 2,
//     borderColor: "#D1D5DB",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   circleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
//   circleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
//   circleText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
//   label: {
//     fontSize: 10,
//     fontWeight: "500",
//     color: "#6B7280",
//     textAlign: "center",
//     maxWidth: 55,
//   },
//   line: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginBottom: 14 },
//   lineDone: { backgroundColor: "#16A34A" },
// });

// // Empty State
// const es = StyleSheet.create({
//   container: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 80,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#374151",
//     marginBottom: 20,
//   },
//   btn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2563EB",
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
// });

// // Web styles
// const web = StyleSheet.create({
//   webContainer: {
//     flex: 1,
//     height: "100%",
//     width: "100%",
//     backgroundColor: "#fff",
//     flexDirection: "row",
//   },
//   imageContainer: {
//     borderColor: "#00ffff",
//     height: "100%",
//     width: "100%",
//   },

//   imageBackground: {
//     width: "100%",
//     height: "100%",
//     //transform:[{scale:0.8}],
//     opacity: 80,
//     alignSelf: "center",
//     flexDirection: "column",
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   parent: {
//     flexDirection: "row",
//     height: "100%",
//     width: "100%",
//   },
//   Left: {
//     height: "100%",
//     width: "15%",
//     //borderWidth: 1,
//   },
//   Right: {
//     height: "100%",
//     width: "85%",
//   },
//   titleRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 20,
//   },
//   pageTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
//   pageSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
//   backBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//     backgroundColor: "#fff",
//   },
//   backBtnText: { fontSize: 13, color: "#374151", fontWeight: "500" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     overflow: "hidden",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   cardHeaderTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
//   newReqBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2563EB",
//     paddingHorizontal: 16,
//     paddingVertical: 9,
//     borderRadius: 8,
//   },
//   newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
//   searchRow: {
//     flexDirection: "row",
//     gap: 12,
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   searchBox: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 9,
//     backgroundColor: "#FAFAFA",
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 13,
//     color: "#374151",
//     outlineStyle: "none",
//   },
//   filterBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 8,
//     paddingHorizontal: 14,
//     paddingVertical: 9,
//     backgroundColor: "#FAFAFA",
//     minWidth: 140,
//   },
//   filterText: { fontSize: 13, color: "#374151", flex: 1 },
// });

// // Mobile styles
// const mob = StyleSheet.create({
//   header: { backgroundColor: "#fff", paddingHorizontal: "2%" },
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#111827",
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 4,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderTopWidth: 1,
//     borderTopColor: "#F3F4F6",
//   },
//   sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   sectionSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
//   newReqBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2563EB",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
//   searchRow: {
//     flexDirection: "row",
//     gap: 10,
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//   },
//   searchBox: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: "#FAFAFA",
//   },
//   searchInput: { flex: 1, fontSize: 13, color: "#374151" },
//   filterBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: "#FAFAFA",
//   },
//   filterText: { fontSize: 12, color: "#374151" },
// });

// export default PARequests;

// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Platform,
//   useWindowDimensions,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ImageBackground,
//   Animated,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Feather } from "@expo/vector-icons";
// import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
// import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

// // ─── HARDCODED PATIENT DATA ───────────────────────────────────────────────────
// const PATIENTS = [
//   {
//     id: "KK-2024-08821",
//     name: "Rajesh Sharma",
//     age: 54,
//     procedure: "CABG",
//     status: "Eligible",
//     initials: "RS",
//     color: "#FEE2E2",
//     textColor: "#DC2626",
//   },
//   {
//     id: "KK-2024-08822",
//     name: "Priya Nair",
//     age: 35,
//     procedure: "Angioplasty",
//     status: "Eligible",
//     initials: "PN",
//     color: "#DBEAFE",
//     textColor: "#2563EB",
//   },
//   {
//     id: "KK-2024-08823",
//     name: "Amit Verma",
//     age: 62,
//     procedure: "Knee Replacement",
//     status: "Not Eligible",
//     initials: "AV",
//     color: "#D1FAE5",
//     textColor: "#059669",
//   },
//   {
//     id: "KK-2024-08824",
//     name: "Sunita Patel",
//     age: 45,
//     procedure: "Craniotomy",
//     status: "Eligible",
//     initials: "SP",
//     color: "#FEF3C7",
//     textColor: "#D97706",
//   },
// ];

// // ─── STEP DATA ────────────────────────────────────────────────────────────────
// const STEPS = [
//   { id: 1, label: "Choose Patient", sub: "Select patient" },
//   { id: 2, label: "Service Info", sub: "Provider & Service" },
//   { id: 3, label: "Medical Codes", sub: "ICD-10 & CPT" },
//   { id: 4, label: "Review & Verify", sub: "Eligibility check" },
//   { id: 5, label: "PreAuth Status", sub: "Submitted" },
// ];

// // ─── ICD-10 DIAGNOSIS CODES ───────────────────────────────────────────────────
// const DIAGNOSIS_CODES = [
//   { id: "K63.5", label: "Polyp of colon" },
//   { id: "Z12.11", label: "Encounter for screening for malignant neoplasm of colon" },
//   { id: "I25.10", label: "Atherosclerotic heart disease of native coronary artery" },
//   { id: "J18.9", label: "Pneumonia, unspecified organism" },
//   { id: "E11.9", label: "Type 2 diabetes mellitus without complications" },
// ];

// // ─── CPT PROCEDURE CODES ──────────────────────────────────────────────────────
// const PROCEDURE_CODES = [
//   { id: "45380", label: "Colonoscopy with biopsy" },
//   { id: "45385", label: "Colonoscopy with polypectomy" },
//   { id: "93510", label: "Left heart catheterization" },
//   { id: "27447", label: "Total knee arthroplasty" },
//   { id: "61510", label: "Craniotomy, trephination, bone flap craniotomy" },
// ];

// // ─── WEB STEPPER ─────────────────────────────────────────────────────────────
// const WebStepper = ({ currentStep }) => (
//   <View style={ws.container}>
//     {STEPS.map((step, index) => {
//       const isActive = step.id === currentStep;
//       const isDone = step.id < currentStep;
//       return (
//         <React.Fragment key={step.id}>
//           <View style={ws.stepItem}>
//             <View style={[ws.circle, isActive && ws.circleActive, isDone && ws.circleDone]}>
//               {isDone ? (
//                 <Feather name="check" size={14} color="#fff" />
//               ) : (
//                 <Text style={[ws.circleText, (isActive || isDone) && { color: "#fff" }]}>
//                   {step.id}
//                 </Text>
//               )}
//             </View>
//             <View style={ws.labelBox}>
//               <Text style={[ws.label, isActive && { color: "#2563EB", fontWeight: "700" }]}>
//                 {step.label}
//               </Text>
//               <Text style={ws.sub}>{step.sub}</Text>
//             </View>
//           </View>
//           {index < STEPS.length - 1 && (
//             <View style={[ws.line, isDone && ws.lineDone]} />
//           )}
//         </React.Fragment>
//       );
//     })}
//   </View>
// );

// // ─── MOBILE STEPPER ──────────────────────────────────────────────────────────
// const MobileStepper = ({ currentStep }) => (
//   <View style={ms.container}>
//     {STEPS.map((step, index) => {
//       const isActive = step.id === currentStep;
//       const isDone = step.id < currentStep;
//       return (
//         <React.Fragment key={step.id}>
//           <View style={ms.stepItem}>
//             <View style={[ms.circle, isActive && ms.circleActive, isDone && ms.circleDone]}>
//               {isDone ? (
//                 <Feather name="check" size={10} color="#fff" />
//               ) : (
//                 <Text style={[ms.circleText, (isActive || isDone) && { color: "#fff" }]}>
//                   {step.id}
//                 </Text>
//               )}
//             </View>
//             <Text
//               style={[ms.label, isActive && { color: "#2563EB", fontWeight: "700" }]}
//               numberOfLines={2}
//             >
//               {step.label}
//             </Text>
//           </View>
//           {index < STEPS.length - 1 && (
//             <View style={[ms.line, isDone && ms.lineDone]} />
//           )}
//         </React.Fragment>
//       );
//     })}
//   </View>
// );

// // ─── PATIENT AVATAR ──────────────────────────────────────────────────────────
// const Avatar = ({ initials, color, textColor, size = 40 }) => (
//   <View style={{
//     width: size, height: size, borderRadius: size / 2,
//     backgroundColor: color, justifyContent: "center", alignItems: "center",
//   }}>
//     <Text style={{ color: textColor, fontWeight: "700", fontSize: size * 0.35 }}>
//       {initials}
//     </Text>
//   </View>
// );

// // ─── STATUS BADGE ────────────────────────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const isEligible = status === "Eligible";
//   return (
//     <View style={{
//       paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
//       backgroundColor: isEligible ? "#D1FAE5" : "#FEE2E2",
//     }}>
//       <Text style={{
//         fontSize: 12, fontWeight: "600",
//         color: isEligible ? "#059669" : "#DC2626",
//       }}>
//         {status}
//       </Text>
//     </View>
//   );
// };

// // ─── PATIENT ROW ─────────────────────────────────────────────────────────────
// const PatientRow = ({ patient, onSelect, isSelected }) => (
//   <TouchableOpacity
//     style={[pr.row, isSelected && pr.rowSelected]}
//     onPress={() => onSelect(patient)}
//     activeOpacity={0.7}
//   >
//     <Avatar
//       initials={patient.initials}
//       color={patient.color}
//       textColor={patient.textColor}
//     />
//     <View style={pr.info}>
//       <Text style={pr.name}>{patient.name}</Text>
//       <Text style={pr.meta}>
//         {patient.id} · Age {patient.age} · {patient.procedure}
//       </Text>
//     </View>
//     <StatusBadge status={patient.status} />
//   </TouchableOpacity>
// );

// // ─── SELECTED PATIENT CARD ───────────────────────────────────────────────────
// const SelectedPatientCard = ({ patient }) => (
//   <View style={spc.card}>
//     <Avatar
//       initials={patient.initials}
//       color={patient.color}
//       textColor={patient.textColor}
//       size={44}
//     />
//     <View style={spc.info}>
//       <Text style={spc.name}>{patient.name}</Text>
//       <Text style={spc.meta}>
//         {patient.id} · Age {patient.age} · {patient.procedure}
//       </Text>
//     </View>
//     <StatusBadge status={patient.status} />
//   </View>
// );

// // ─── CODE CHIP ───────────────────────────────────────────────────────────────
// const CodeChip = ({ code, onRemove }) => (
//   <View style={mc.codeRow}>
//     <View style={mc.codeChip}>
//       <Text style={mc.codeChipText}>{code.id}</Text>
//       <Feather name="external-link" size={10} color="#2563EB" style={{ marginLeft: 3 }} />
//     </View>
//     <Text style={mc.codeLabel}>{code.label}</Text>
//     <TouchableOpacity onPress={() => onRemove(code.id)} style={mc.removeBtn}>
//       <Feather name="x" size={14} color="#9CA3AF" />
//     </TouchableOpacity>
//   </View>
// );

// // ─── SCROLLABLE CODE LIST ─────────────────────────────────────────────────────
// // Shows 2 items at a time, scrollable for more
// const CodeList = ({ codes, onRemove }) => (
//   <View style={mc.codeListWrapper}>
//     <ScrollView
//       nestedScrollEnabled
//       showsVerticalScrollIndicator={true}
//       style={mc.codeScroll}
//     >
//       {codes.map((code) => (
//         <CodeChip key={code.id} code={code} onRemove={onRemove} />
//       ))}
//     </ScrollView>
//   </View>
// );

// // ─── MEDICAL CODES FORM ───────────────────────────────────────────────────────
// const MedicalCodesForm = ({ onNext, onPrevious }) => {
//   const [clinicalNotes, setClinicalNotes] = useState(
//     "Patient with chest pain and positive stress test. Cardiac catheterization recommended to evaluate coronary artery disease and determine need for intervention."
//   );
//   const [diagnosisCodes, setDiagnosisCodes] = useState(DIAGNOSIS_CODES.slice(0, 2));
//   const [procedureCodes, setProcedureCodes] = useState(PROCEDURE_CODES.slice(0, 2));
//   const [diagSearch, setDiagSearch] = useState("");
//   const [cptSearch, setCptSearch] = useState("");

//   const removeDiagnosis = (id) => setDiagnosisCodes((prev) => prev.filter((c) => c.id !== id));
//   const removeProcedure = (id) => setProcedureCodes((prev) => prev.filter((c) => c.id !== id));

//   return (
//     <View style={mc.container}>
//       {/* Section Title */}
//       <Text style={mc.sectionTitle}>Medical Codes</Text>

//       {/* Official Code Resources card */}
//       <View style={mc.resourcesCard}>
//         <View style={mc.resourcesLeft}>
//           <View style={mc.resourcesIconBox}>
//             <Feather name="book-open" size={14} color="#2563EB" />
//           </View>
//           <Text style={mc.resourcesTitle}>Official Code Resources</Text>
//         </View>
//         <StatusBadge status="Eligible" />
//       </View>
//       <View style={mc.resourcesLinksRow}>
//         <TouchableOpacity style={mc.resourceLink}>
//           <Text style={mc.resourceLinkText}>CMS ICD-10 Codes</Text>
//           <Feather name="external-link" size={11} color="#2563EB" style={{ marginLeft: 3 }} />
//         </TouchableOpacity>
//         <TouchableOpacity style={mc.resourceLink}>
//           <Text style={mc.resourceLinkText}>CMS ICD-10 CM</Text>
//           <Feather name="external-link" size={11} color="#2563EB" style={{ marginLeft: 3 }} />
//         </TouchableOpacity>
//         <TouchableOpacity style={mc.resourceLink}>
//           <Text style={mc.resourceLinkText}>AMA CPT Codes</Text>
//           <Feather name="external-link" size={11} color="#2563EB" style={{ marginLeft: 3 }} />
//         </TouchableOpacity>
//       </View>

//       {/* Clinical Notes */}
//       <View style={mc.field}>
//         <Text style={mc.fieldLabel}>
//           Clinical notes{" "}
//           <Text style={mc.fieldLabelLight}>(for AI Code Suggestion)</Text>
//         </Text>
//         <TextInput
//           style={mc.clinicalTextArea}
//           value={clinicalNotes}
//           onChangeText={setClinicalNotes}
//           multiline
//           numberOfLines={4}
//           placeholderTextColor="#9CA3AF"
//           placeholder="Describe patient's condition for AI code suggestions..."
//         />
//       </View>

//       {/* AI Suggested ICD Codes Button */}
//       <TouchableOpacity style={mc.aiBtn}>
//         <Feather name="zap" size={15} color="#fff" style={{ marginRight: 8 }} />
//         <Text style={mc.aiBtnText}>AI Suggested ICD Codes</Text>
//       </TouchableOpacity>

//       {/* Diagnosis Codes (ICD-10) */}
//       <View style={mc.field}>
//         <View style={mc.codeHeaderRow}>
//           <Text style={mc.fieldLabel}>
//             Diagnosis Codes (ICD-10) <Text style={{ color: "#DC2626" }}>*</Text>
//           </Text>
//           <TouchableOpacity style={mc.refLink}>
//             <Text style={mc.refLinkText}>CMS Reference</Text>
//             <Feather name="external-link" size={11} color="#2563EB" style={{ marginLeft: 3 }} />
//           </TouchableOpacity>
//         </View>
//         {/* Search */}
//         <View style={mc.searchBox}>
//           <Feather name="search" size={13} color="#9CA3AF" style={{ marginRight: 8 }} />
//           <TextInput
//             style={mc.searchInput}
//             value={diagSearch}
//             onChangeText={setDiagSearch}
//             placeholder="Search ICD-10"
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>
//         {/* Scrollable list — 2 items visible */}
//         <CodeList codes={diagnosisCodes} onRemove={removeDiagnosis} />
//       </View>

//       {/* Procedure Codes (CPT) */}
//       <View style={mc.field}>
//         <View style={mc.codeHeaderRow}>
//           <Text style={mc.fieldLabel}>Procedure Codes (CPT)</Text>
//           <TouchableOpacity style={mc.refLink}>
//             <Text style={mc.refLinkText}>AMA Reference</Text>
//             <Feather name="external-link" size={11} color="#2563EB" style={{ marginLeft: 3 }} />
//           </TouchableOpacity>
//         </View>
//         {/* Search */}
//         <View style={mc.searchBox}>
//           <Feather name="search" size={13} color="#9CA3AF" style={{ marginRight: 8 }} />
//           <TextInput
//             style={mc.searchInput}
//             value={cptSearch}
//             onChangeText={setCptSearch}
//             placeholder="Search CPT codes..."
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>
//         {/* Scrollable list — 2 items visible */}
//         <CodeList codes={procedureCodes} onRemove={removeProcedure} />
//       </View>

//       {/* Previous / Next */}
//       <View style={mc.btnRow}>
//         <TouchableOpacity style={mc.prevBtn} onPress={onPrevious}>
//           <Feather name="arrow-left" size={14} color="#374151" />
//           <Text style={mc.prevText}>Previous</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={mc.nextBtn} onPress={onNext}>
//           <Text style={mc.nextText}>Next</Text>
//           <Feather name="arrow-right" size={14} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // ─── SERVICE INFO FORM ───────────────────────────────────────────────────────
// const ServiceInfoForm = ({ onNext, onPrevious }) => {
//   const [insuranceProvider, setInsuranceProvider] = useState("Star Health");
//   const [urgencyLevel, setUrgencyLevel] = useState("Routine");
//   const [orderingProvider, setOrderingProvider] = useState("Dr Rajesh Gupta");
//   const [serviceType, setServiceType] = useState("");

//   return (
//     <View style={sif.container}>
//       <Text style={sif.sectionTitle}>Service information</Text>

//       <View style={sif.row}>
//         <View style={sif.fieldHalf}>
//           <Text style={sif.label}>
//             Insurance Provider <Text style={{ color: "#DC2626" }}>*</Text>
//           </Text>
//           <View style={sif.inputBox}>
//             <TextInput
//               value={insuranceProvider}
//               onChangeText={setInsuranceProvider}
//               placeholder="Star Health"
//               placeholderTextColor="#9CA3AF"
//               style={sif.input}
//             />
//           </View>
//         </View>
//         <View style={sif.fieldHalf}>
//           <Text style={sif.label}>
//             Urgency Level <Text style={{ color: "#DC2626" }}>*</Text>
//           </Text>
//           <View style={[sif.inputBox, sif.selectBox]}>
//             <TextInput
//               value={urgencyLevel}
//               onChangeText={setUrgencyLevel}
//               placeholder="Routine"
//               placeholderTextColor="#9CA3AF"
//               style={sif.input}
//             />
//             <Feather name="chevron-down" size={16} color="#6B7280" />
//           </View>
//         </View>
//       </View>

//       <View style={sif.field}>
//         <Text style={sif.label}>
//           Ordering / Rendering Provider <Text style={{ color: "#DC2626" }}>*</Text>
//         </Text>
//         <View style={[sif.inputBox, sif.selectBox]}>
//           <TextInput
//             value={orderingProvider}
//             onChangeText={setOrderingProvider}
//             placeholder="Dr Rajesh Gupta"
//             placeholderTextColor="#9CA3AF"
//             style={sif.input}
//           />
//           <Feather name="chevron-down" size={16} color="#6B7280" />
//         </View>
//       </View>

//       <View style={sif.field}>
//         <Text style={sif.label}>Service Type/Procedure</Text>
//         <View style={[sif.inputBox, sif.selectBox]}>
//           <TextInput
//             value={serviceType}
//             onChangeText={setServiceType}
//             placeholder="Select a service (auto-populated codes)..."
//             placeholderTextColor="#9CA3AF"
//             style={sif.input}
//           />
//           <Feather name="chevron-down" size={16} color="#6B7280" />
//         </View>
//       </View>

//       <View style={sif.btnRow}>
//         <TouchableOpacity style={sif.prevBtn} onPress={onPrevious}>
//           <Feather name="arrow-left" size={14} color="#374151" />
//           <Text style={sif.prevText}>Previous</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={sif.nextBtn} onPress={onNext}>
//           <Text style={sif.nextText}>Next</Text>
//           <Feather name="arrow-right" size={14} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// // ─── EMPTY STATE ─────────────────────────────────────────────────────────────
// const EmptyState = ({ onNewRequest, isMobile }) => (
//   <View style={[es.container, isMobile && { paddingVertical: 60 }]}>
//     <Text style={es.title}>No new patient yet</Text>
//     <TouchableOpacity style={es.btn} onPress={onNewRequest}>
//       <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
//       <Text style={es.btnText}>Create your first PA Request</Text>
//     </TouchableOpacity>
//   </View>
// );

// // ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// const PARequests = ({ navigation }) => {
//   const { width } = useWindowDimensions();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [searchText, setSearchText] = useState("");
//   const [statusFilter] = useState("All Statuses");
//   const [selectedPatient, setSelectedPatient] = useState(null);

//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const slideAnimMob = useRef(new Animated.Value(0)).current;

//   const slideRight = (animRef) => {
//     animRef.setValue(width);
//     Animated.spring(animRef, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 60,
//       friction: 10,
//     }).start();
//   };

//   const slideLeft = (animRef) => {
//     animRef.setValue(-width);
//     Animated.spring(animRef, {
//       toValue: 0,
//       useNativeDriver: true,
//       tension: 60,
//       friction: 10,
//     }).start();
//   };

//   const handleSelectPatient = (patient, animRef) => {
//     setSelectedPatient(patient);
//     setCurrentStep(2);
//     slideRight(animRef);
//   };

//   const handleNext = (animRef) => {
//     setCurrentStep((s) => Math.min(s + 1, 5));
//     slideRight(animRef);
//   };

//   const handlePrevious = (animRef) => {
//     if (currentStep === 2) {
//       setSelectedPatient(null);
//       setCurrentStep(1);
//     } else {
//       setCurrentStep((s) => Math.max(s - 1, 1));
//     }
//     slideLeft(animRef);
//   };

//   const filteredPatients = PATIENTS.filter(
//     (p) =>
//       p.name.toLowerCase().includes(searchText.toLowerCase()) ||
//       p.id.toLowerCase().includes(searchText.toLowerCase()),
//   );

//   // ── STEP 1 ─────────────────────────────────────────────────────────────────
//   const renderStep1 = (animRef, isMobile) => (
//     <Animated.View style={{ transform: [{ translateX: animRef }] }}>
//       <View style={isMobile ? mob.sectionHeader : sh.header}>
//         <View>
//           <Text style={isMobile ? mob.sectionTitle : sh.title}>Select Patient</Text>
//           {isMobile && <Text style={mob.sectionSub}>Choose patient</Text>}
//         </View>
//         <TouchableOpacity style={sh.newReqBtn}>
//           <Feather name="plus" size={14} color="#fff" style={{ marginRight: 4 }} />
//           <Text style={sh.newReqText}>New PA Request</Text>
//         </TouchableOpacity>
//       </View>
//       <View style={isMobile ? mob.searchRow : sh.searchRow}>
//         <View style={isMobile ? mob.searchBox : sh.searchBox}>
//           <Feather name="search" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
//           <TextInput
//             placeholder="Search For Patient"
//             placeholderTextColor="#9CA3AF"
//             value={searchText}
//             onChangeText={setSearchText}
//             style={isMobile ? mob.searchInput : sh.searchInput}
//           />
//         </View>
//         <View style={isMobile ? mob.filterBox : sh.filterBox}>
//           <Text style={isMobile ? mob.filterText : sh.filterText}>{statusFilter}</Text>
//           <Feather name="chevron-down" size={13} color="#374151" style={{ marginLeft: 6 }} />
//         </View>
//       </View>
//       {filteredPatients.length > 0 ? (
//         <View style={isMobile ? { paddingHorizontal: 16 } : {}}>
//           {filteredPatients.map((p) => (
//             <PatientRow
//               key={p.id}
//               patient={p}
//               onSelect={(pat) => handleSelectPatient(pat, animRef)}
//               isSelected={selectedPatient?.id === p.id}
//             />
//           ))}
//         </View>
//       ) : (
//         <EmptyState onNewRequest={() => {}} isMobile={isMobile} />
//       )}
//     </Animated.View>
//   );

//   // ── STEP 2 ─────────────────────────────────────────────────────────────────
//   const renderStep2 = (animRef, isMobile) => (
//     <Animated.View style={{ transform: [{ translateX: animRef }] }}>
//       <View style={isMobile ? { paddingHorizontal: 16, paddingTop: 12 } : {}}>
//         <Text style={[sh.title, { marginBottom: 10 }]}>Selected Patient</Text>
//         {selectedPatient && <SelectedPatientCard patient={selectedPatient} />}
//       </View>
//       <ServiceInfoForm
//         onNext={() => handleNext(animRef)}
//         onPrevious={() => handlePrevious(animRef)}
//       />
//     </Animated.View>
//   );

//   // ── STEP 3 ─────────────────────────────────────────────────────────────────
//   const renderStep3 = (animRef, isMobile) => (
//     <Animated.View style={{ transform: [{ translateX: animRef }] }}>
//       {/* Show selected patient summary at top */}
//       {selectedPatient && (
//         <View style={isMobile ? { paddingHorizontal: 16, paddingTop: 12 } : { marginBottom: 4 }}>
//           <SelectedPatientCard patient={selectedPatient} />
//         </View>
//       )}
//       <MedicalCodesForm
//         onNext={() => handleNext(animRef)}
//         onPrevious={() => handlePrevious(animRef)}
//       />
//     </Animated.View>
//   );

//   const renderCurrentStep = (animRef, isMobile) => {
//     if (currentStep === 1) return renderStep1(animRef, isMobile);
//     if (currentStep === 2) return renderStep2(animRef, isMobile);
//     if (currentStep === 3) return renderStep3(animRef, isMobile);
//     return null;
//   };

//   return (
//     <>
//       {/* ── WEB ── */}
//       {Platform.OS === "web" && width > 1000 && (
//         <View style={web.webContainer}>
//           <View style={web.imageContainer}>
//             <ImageBackground
//               source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
//               style={web.imageBackground}
//               resizeMode="cover"
//             >
//               <View style={[web.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]} />
//               <View style={web.parent}>
//                 <View style={web.Left}>
//                   <HospitalSidebarNavigation navigation={navigation} />
//                 </View>
//                 <View style={web.Right}>
//                   <View style={web.header}>
//                     <HeaderLoginSignUp navigation={navigation} />
//                   </View>
//                   <ScrollView
//                     style={{ flex: 1, backgroundColor: "#fff", margin: "2%", borderRadius: 12 }}
//                     contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
//                     showsVerticalScrollIndicator={false}
//                   >
//                     <View style={web.titleRow}>
//                       <View>
//                         <Text style={web.pageTitle}>PA Requests</Text>
//                         <Text style={web.pageSub}>Create a new prior authorization request</Text>
//                       </View>
//                       <TouchableOpacity style={web.backBtn}>
//                         <Feather name="arrow-left" size={14} color="#374151" style={{ marginRight: 6 }} />
//                         <Text style={web.backBtnText}>Back to home</Text>
//                       </TouchableOpacity>
//                     </View>
//                     <WebStepper currentStep={currentStep} />
//                     <View style={{ overflow: "hidden" }}>
//                       {renderCurrentStep(slideAnim, false)}
//                     </View>
//                   </ScrollView>
//                 </View>
//               </View>
//             </ImageBackground>
//           </View>
//         </View>
//       )}

//       {/* ── MOBILE ── */}
//       {(Platform.OS !== "web" || width < 1000) && (
//         <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//           <View style={mob.header}>
//             <HeaderLoginSignUp navigation={navigation} />
//           </View>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 40 }}
//           >
//             <Text style={mob.title}>PA Requests</Text>
//             <MobileStepper currentStep={currentStep} />
//             <View style={{ overflow: "hidden" }}>
//               {renderCurrentStep(slideAnimMob, true)}
//             </View>
//           </ScrollView>
//         </SafeAreaView>
//       )}
//     </>
//   );
// };

// // ═══════════════════════════════════════════════════════════════════════════════
// // STYLES
// // ═══════════════════════════════════════════════════════════════════════════════

// const ws = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 24,
//     paddingVertical: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   stepItem: { flexDirection: "row", alignItems: "center", gap: 10 },
//   circle: {
//     width: 30, height: 30, borderRadius: 15,
//     borderWidth: 2, borderColor: "#D1D5DB",
//     justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
//   },
//   circleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
//   circleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
//   circleText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
//   labelBox: { flexDirection: "column" },
//   label: { fontSize: 13, fontWeight: "600", color: "#374151" },
//   sub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
//   line: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginHorizontal: 8 },
//   lineDone: { backgroundColor: "#16A34A" },
// });

// const ms = StyleSheet.create({
//   container: {
//     flexDirection: "row", alignItems: "center",
//     paddingHorizontal: 16, paddingVertical: 16, marginBottom: 4,
//   },
//   stepItem: { alignItems: "center", gap: 4 },
//   circle: {
//     width: 36, height: 36, borderRadius: 18,
//     borderWidth: 2, borderColor: "#D1D5DB",
//     justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
//   },
//   circleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
//   circleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
//   circleText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
//   label: { fontSize: 10, fontWeight: "500", color: "#6B7280", textAlign: "center", maxWidth: 55 },
//   line: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginBottom: 14 },
//   lineDone: { backgroundColor: "#16A34A" },
// });

// const pr = StyleSheet.create({
//   row: {
//     flexDirection: "row", alignItems: "center",
//     paddingHorizontal: 16, paddingVertical: 14,
//     borderBottomWidth: 1, borderBottomColor: "#F3F4F6", gap: 12,
//   },
//   rowSelected: { backgroundColor: "#EFF6FF" },
//   info: { flex: 1 },
//   name: { fontSize: 14, fontWeight: "600", color: "#111827" },
//   meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
// });

// const spc = StyleSheet.create({
//   card: {
//     flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#E5E7EB",
//     borderRadius: 10, padding: 14,
//     backgroundColor: "#FAFAFA", gap: 12, marginBottom: 16,
//   },
//   info: { flex: 1 },
//   name: { fontSize: 14, fontWeight: "700", color: "#111827" },
//   meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
// });

// const sh = StyleSheet.create({
//   header: {
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//     paddingHorizontal: 16, paddingVertical: 14,
//     borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
//   },
//   title: { fontSize: 16, fontWeight: "600", color: "#111827" },
//   newReqBtn: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#2563EB", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8,
//   },
//   newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
//   searchRow: {
//     flexDirection: "row", gap: 12,
//     paddingHorizontal: 16, paddingVertical: 14,
//     borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
//   },
//   searchBox: {
//     flex: 1, flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
//     paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "#FAFAFA",
//   },
//   searchInput: { flex: 1, fontSize: 13, color: "#374151", outlineStyle: "none" },
//   filterBox: {
//     flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
//     paddingHorizontal: 14, paddingVertical: 9,
//     backgroundColor: "#FAFAFA", minWidth: 140,
//   },
//   filterText: { fontSize: 13, color: "#374151", flex: 1 },
// });

// const sif = StyleSheet.create({
//   container: { padding: 16, paddingTop: 4 },
//   sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 18, marginTop: 8 },
//   row: { flexDirection: "row", gap: 16, marginBottom: 16 },
//   fieldHalf: { flex: 1 },
//   field: { marginBottom: 16 },
//   label: { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 6 },
//   inputBox: {
//     borderWidth: 1, borderColor: "#E5E7EB",
//     borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
//     backgroundColor: "#fff",
//   },
//   selectBox: { flexDirection: "row", alignItems: "center" },
//   input: { flex: 1, fontSize: 13, color: "#374151", outlineStyle: "none" },
//   btnRow: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", marginTop: 24,
//   },
//   prevBtn: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     borderWidth: 1, borderColor: "#D1D5DB",
//     paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
//     backgroundColor: "#fff",
//   },
//   prevText: { fontSize: 13, fontWeight: "500", color: "#374151" },
//   nextBtn: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     backgroundColor: "#16A34A",
//     paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
//   },
//   nextText: { fontSize: 13, fontWeight: "600", color: "#fff" },
// });

// // ─── MEDICAL CODES STYLES ─────────────────────────────────────────────────────
// const mc = StyleSheet.create({
//   container: { padding: 16, paddingTop: 4 },
//   sectionTitle: {
//     fontSize: 16, fontWeight: "700", color: "#111827",
//     marginBottom: 14, marginTop: 4,
//   },

//   // Official Code Resources card
//   resourcesCard: {
//     flexDirection: "row", alignItems: "center",
//     justifyContent: "space-between",
//     borderWidth: 1, borderColor: "#E5E7EB",
//     borderRadius: 8, padding: 12,
//     backgroundColor: "#fff", marginBottom: 10,
//   },
//   resourcesLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
//   resourcesIconBox: {
//     width: 26, height: 26, borderRadius: 6,
//     backgroundColor: "#EFF6FF",
//     justifyContent: "center", alignItems: "center",
//   },
//   resourcesTitle: { fontSize: 13, fontWeight: "600", color: "#374151" },
//   resourcesLinksRow: {
//     flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16,
//   },
//   resourceLink: {
//     flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#BFDBFE",
//     borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5,
//     backgroundColor: "#EFF6FF",
//   },
//   resourceLinkText: { fontSize: 12, color: "#2563EB", fontWeight: "500" },

//   // Fields
//   field: { marginBottom: 16 },
//   fieldLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
//   fieldLabelLight: { fontSize: 12, fontWeight: "400", color: "#6B7280" },

//   // Clinical notes textarea
//   clinicalTextArea: {
//     borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
//     paddingHorizontal: 12, paddingVertical: 10,
//     fontSize: 13, color: "#374151",
//     backgroundColor: "#fff", minHeight: 80,
//     textAlignVertical: "top",
//     outlineStyle: "none",
//   },

//   // AI Button
//   aiBtn: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#2563EB",
//     paddingHorizontal: 18, paddingVertical: 10,
//     borderRadius: 8, alignSelf: "flex-start",
//     marginBottom: 20,
//   },
//   aiBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },

//   // Code section header
//   codeHeaderRow: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", marginBottom: 8,
//   },
//   refLink: { flexDirection: "row", alignItems: "center" },
//   refLinkText: { fontSize: 12, color: "#2563EB", fontWeight: "500" },

//   // Search box
//   searchBox: {
//     flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
//     paddingHorizontal: 12, paddingVertical: 9,
//     backgroundColor: "#FAFAFA", marginBottom: 8,
//   },
//   searchInput: { flex: 1, fontSize: 13, color: "#374151", outlineStyle: "none" },

//   // Code list — fixed height to show exactly 2 items, then scrollable
//   codeListWrapper: {
//     borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
//     overflow: "hidden",
//   },
//   codeScroll: {
//     maxHeight: 110, // ~2 rows visible (each row ~52px)
//   },

//   // Code row
//   codeRow: {
//     flexDirection: "row", alignItems: "center",
//     paddingHorizontal: 12, paddingVertical: 13,
//     borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
//     backgroundColor: "#fff", gap: 10,
//   },
//   codeChip: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#EFF6FF",
//     borderWidth: 1, borderColor: "#BFDBFE",
//     borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
//   },
//   codeChipText: { fontSize: 12, fontWeight: "600", color: "#2563EB" },
//   codeLabel: { flex: 1, fontSize: 13, color: "#374151" },
//   removeBtn: { padding: 2 },

//   // Buttons
//   btnRow: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", marginTop: 24,
//   },
//   prevBtn: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     borderWidth: 1, borderColor: "#D1D5DB",
//     paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
//     backgroundColor: "#fff",
//   },
//   prevText: { fontSize: 13, fontWeight: "500", color: "#374151" },
//   nextBtn: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     backgroundColor: "#16A34A",
//     paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
//   },
//   nextText: { fontSize: 13, fontWeight: "600", color: "#fff" },
// });

// const es = StyleSheet.create({
//   container: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
//   title: { fontSize: 18, fontWeight: "600", color: "#374151", marginBottom: 20 },
//   btn: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8,
//   },
//   btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
// });

// const web = StyleSheet.create({
//   webContainer: { flex: 1, height: "100%", width: "100%", backgroundColor: "#fff", flexDirection: "row" },
//   imageContainer: { height: "100%", width: "100%" },
//   imageBackground: { width: "100%", height: "100%", opacity: 80, alignSelf: "center", flexDirection: "column" },
//   overlay: { ...StyleSheet.absoluteFillObject },
//   parent: { flexDirection: "row", height: "100%", width: "100%" },
//   Left: { height: "100%", width: "15%" },
//   Right: { height: "100%", width: "85%" },
//   titleRow: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "flex-start", marginBottom: 20,
//   },
//   pageTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
//   pageSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
//   backBtn: {
//     flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#D1D5DB",
//     paddingHorizontal: 14, paddingVertical: 8,
//     borderRadius: 8, backgroundColor: "#fff",
//   },
//   backBtnText: { fontSize: 13, color: "#374151", fontWeight: "500" },
// });

// const mob = StyleSheet.create({
//   header: { backgroundColor: "#fff", paddingHorizontal: "2%" },
//   title: { fontSize: 26, fontWeight: "700", color: "#111827", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
//   sectionHeader: {
//     flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//     paddingHorizontal: 16, paddingVertical: 14,
//     borderTopWidth: 1, borderTopColor: "#F3F4F6",
//   },
//   sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   sectionSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
//   newReqBtn: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#2563EB", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
//   },
//   newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
//   searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
//   searchBox: {
//     flex: 1, flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
//     paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FAFAFA",
//   },
//   searchInput: { flex: 1, fontSize: 13, color: "#040608ff" },
//   filterBox: {
//     flexDirection: "row", alignItems: "center",
//     borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
//     paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FAFAFA",
//   },
//   filterText: { fontSize: 12, color: "#374151" },
// });

// export default PARequests;

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

// ─── PATIENT DATA ─────────────────────────────────────────────────────────────
const PATIENTS = [
  {
    id: "KK-2024-08821",
    name: "Rajesh Sharma",
    age: 54,
    procedure: "CABG",
    status: "Eligible",
    initials: "RS",
    color: "#FEE2E2",
    textColor: "#DC2626",
    insurer: "Star Health",
    memberId: "BCBSTX10001",
    policyId: "KK-POL-2024-08821",
    policyVersion: "2024.1",
    provider: "Dr Rajesh Gupta",
    providerNPI: "NMC:NMC-DL-2019-44821",
    providerOrg: "Cardiology · Kokoro Heart Centre",
    service: "Cardiac Catheterization",
  },
  {
    id: "KK-2024-08822",
    name: "Priya Nair",
    age: 35,
    procedure: "Angioplasty",
    status: "Eligible",
    initials: "PN",
    color: "#DBEAFE",
    textColor: "#2563EB",
    insurer: "HDFC Ergo",
    memberId: "BCBSTX10002",
    policyId: "KK-POL-2024-08822",
    policyVersion: "2024.1",
    provider: "Dr Priya Sharma",
    providerNPI: "NMC:NMC-DL-2019-44822",
    providerOrg: "Cardiology · Kokoro Heart Centre",
    service: "Angioplasty",
  },
  {
    id: "KK-2024-08823",
    name: "Amit Verma",
    age: 62,
    procedure: "Knee Replacement",
    status: "Not Eligible",
    initials: "AV",
    color: "#D1FAE5",
    textColor: "#059669",
    insurer: "Niva Bupa",
    memberId: "BCBSTX10003",
    policyId: "KK-POL-2024-08823",
    policyVersion: "2024.1",
    provider: "Dr Suresh Menon",
    providerNPI: "NMC:NMC-DL-2019-44823",
    providerOrg: "Orthopaedics · Kokoro Bone Centre",
    service: "Knee Replacement",
  },
  {
    id: "KK-2024-08824",
    name: "Sunita Patel",
    age: 45,
    procedure: "Craniotomy",
    status: "Eligible",
    initials: "SP",
    color: "#FEF3C7",
    textColor: "#D97706",
    insurer: "Star Health",
    memberId: "BCBSTX10004",
    policyId: "KK-POL-2024-08824",
    policyVersion: "2024.1",
    provider: "Dr Anita Roy",
    providerNPI: "NMC:NMC-DL-2019-44824",
    providerOrg: "Neurology · Kokoro Brain Centre",
    service: "Craniotomy",
  },
];

// ─── STEPS ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Choose Patient", sub: "Select patient" },
  { id: 2, label: "Service Info", sub: "Provider & Service" },
  { id: 3, label: "Medical Codes", sub: "ICD-10 & CPT" },
  { id: 4, label: "Review & Verify", sub: "Eligibility check" },
  { id: 5, label: "PreAuth Status", sub: "Submitted" },
];

// ─── DEFAULT CODES ────────────────────────────────────────────────────────────
const ALL_DIAGNOSIS_CODES = [
  {
    id: "K63.5",
    label: "Polyp of colon",
    ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
  },
  {
    id: "Z12.11",
    label: "Encounter for screening for malignant neoplasm of colon",
    ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
  },
  {
    id: "I25.10",
    label: "Atherosclerotic heart disease of native coronary artery",
    ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
  },
  {
    id: "J18.9",
    label: "Pneumonia, unspecified organism",
    ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
  },
  {
    id: "E11.9",
    label: "Type 2 diabetes mellitus without complications",
    ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
  },
];

const ALL_PROCEDURE_CODES = [
  { id: "45380", label: "Colonoscopy with biopsy" },
  { id: "45385", label: "Colonoscopy with polypectomy" },
  { id: "93510", label: "Left heart catheterization" },
  { id: "27447", label: "Total knee arthroplasty" },
  { id: "61510", label: "Craniotomy, trephination, bone flap craniotomy" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const WebStepper = ({ currentStep }) => (
  <View style={ws.container}>
    {STEPS.map((step, index) => {
      const isActive = step.id === currentStep;
      const isDone = step.id < currentStep;
      return (
        <React.Fragment key={step.id}>
          <View style={ws.stepItem}>
            <View
              style={[
                ws.circle,
                isActive && ws.circleActive,
                isDone && ws.circleDone,
              ]}
            >
              {isDone ? (
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <Text
                  style={[
                    ws.circleText,
                    (isActive || isDone) && { color: "#fff" },
                  ]}
                >
                  {step.id}
                </Text>
              )}
            </View>
            <View style={ws.labelBox}>
              <Text
                style={[
                  ws.label,
                  isActive && { color: "#2563EB", fontWeight: "700" },
                ]}
              >
                {step.label}
              </Text>
              <Text style={ws.sub}>{step.sub}</Text>
            </View>
          </View>
          {index < STEPS.length - 1 && (
            <View style={[ws.line, isDone && ws.lineDone]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const MobileStepper = ({ currentStep }) => (
  <View style={ms.container}>
    {STEPS.map((step, index) => {
      const isActive = step.id === currentStep;
      const isDone = step.id < currentStep;
      return (
        <React.Fragment key={step.id}>
          <View style={ms.stepItem}>
            <View
              style={[
                ms.circle,
                isActive && ms.circleActive,
                isDone && ms.circleDone,
              ]}
            >
              {isDone ? (
                <Feather name="check" size={10} color="#fff" />
              ) : (
                <Text
                  style={[
                    ms.circleText,
                    (isActive || isDone) && { color: "#fff" },
                  ]}
                >
                  {step.id}
                </Text>
              )}
            </View>
            <Text
              style={[
                ms.label,
                isActive && { color: "#2563EB", fontWeight: "700" },
              ]}
              numberOfLines={2}
            >
              {step.label}
            </Text>
          </View>
          {index < STEPS.length - 1 && (
            <View style={[ms.line, isDone && ms.lineDone]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const Avatar = ({ initials, color, textColor, size = 40 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text
      style={{ color: textColor, fontWeight: "700", fontSize: size * 0.35 }}
    >
      {initials}
    </Text>
  </View>
);

const StatusBadge = ({ status }) => {
  const isEligible = status === "Eligible";
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: isEligible ? "#D1FAE5" : "#FEE2E2",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: isEligible ? "#059669" : "#DC2626",
        }}
      >
        {status}
      </Text>
    </View>
  );
};

const PatientRow = ({ patient, onSelect, isSelected }) => (
  <TouchableOpacity
    style={[pr.row, isSelected && pr.rowSelected]}
    onPress={() => onSelect(patient)}
    activeOpacity={0.7}
  >
    <Avatar
      initials={patient.initials}
      color={patient.color}
      textColor={patient.textColor}
    />
    <View style={pr.info}>
      <Text style={pr.name}>{patient.name}</Text>
      <Text style={pr.meta}>
        {patient.id} · Age {patient.age} · {patient.procedure}
      </Text>
    </View>
    <StatusBadge status={patient.status} />
  </TouchableOpacity>
);

const SelectedPatientCard = ({ patient }) => (
  <View style={spc.card}>
    <Avatar
      initials={patient.initials}
      color={patient.color}
      textColor={patient.textColor}
      size={44}
    />
    <View style={spc.info}>
      <Text style={spc.name}>{patient.name}</Text>
      <Text style={spc.meta}>
        {patient.id} · Age {patient.age} · {patient.procedure}
      </Text>
    </View>
    <StatusBadge status={patient.status} />
  </View>
);

const EmptyState = ({ onNewRequest, isMobile }) => (
  <View style={[es.container, isMobile && { paddingVertical: 60 }]}>
    <Text style={es.title}>No new patient yet</Text>
    <TouchableOpacity style={es.btn} onPress={onNewRequest}>
      <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
      <Text style={es.btnText}>Create your first PA Request</Text>
    </TouchableOpacity>
  </View>
);

const CodeChip = ({ code, onRemove }) => (
  <View style={mc.codeRow}>
    <View style={mc.codeChip}>
      <Text style={mc.codeChipText}>{code.id}</Text>
      <Feather
        name="external-link"
        size={10}
        color="#2563EB"
        style={{ marginLeft: 3 }}
      />
    </View>
    <Text style={mc.codeLabel} numberOfLines={2}>
      {code.label}
    </Text>
    <TouchableOpacity onPress={() => onRemove(code.id)} style={mc.removeBtn}>
      <Feather name="x" size={14} color="#9CA3AF" />
    </TouchableOpacity>
  </View>
);

const CodeList = ({ codes, onRemove }) => (
  <View style={mc.codeListWrapper}>
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator
      style={mc.codeScroll}
    >
      {codes.map((code) => (
        <CodeChip key={code.id} code={code} onRemove={onRemove} />
      ))}
    </ScrollView>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// STEP FORMS
// ═══════════════════════════════════════════════════════════════════════════════

const ServiceInfoForm = ({ patient, onNext, onPrevious }) => {
  const [insuranceProvider, setInsuranceProvider] = useState(
    patient?.insurer || "Star Health",
  );
  const [urgencyLevel, setUrgencyLevel] = useState("Routine");
  const [orderingProvider, setOrderingProvider] = useState(
    patient?.provider || "Dr Rajesh Gupta",
  );
  const [serviceType, setServiceType] = useState("");

  return (
    <View style={sif.container}>
      <Text style={sif.sectionTitle}>Service information</Text>
      <View style={sif.row}>
        <View style={sif.fieldHalf}>
          <Text style={sif.label}>
            Insurance Provider <Text style={{ color: "#DC2626" }}>*</Text>
          </Text>
          <View style={sif.inputBox}>
            <TextInput
              value={insuranceProvider}
              onChangeText={setInsuranceProvider}
              placeholder="Star Health"
              placeholderTextColor="#9CA3AF"
              style={sif.input}
            />
          </View>
        </View>
        <View style={sif.fieldHalf}>
          <Text style={sif.label}>
            Urgency Level <Text style={{ color: "#DC2626" }}>*</Text>
          </Text>
          <View style={[sif.inputBox, sif.selectBox]}>
            <TextInput
              value={urgencyLevel}
              onChangeText={setUrgencyLevel}
              placeholder="Routine"
              placeholderTextColor="#9CA3AF"
              style={sif.input}
            />
            <Feather name="chevron-down" size={16} color="#6B7280" />
          </View>
        </View>
      </View>
      <View style={sif.field}>
        <Text style={sif.label}>
          Ordering / Rendering Provider{" "}
          <Text style={{ color: "#DC2626" }}>*</Text>
        </Text>
        <View style={[sif.inputBox, sif.selectBox]}>
          <TextInput
            value={orderingProvider}
            onChangeText={setOrderingProvider}
            placeholder="Dr Rajesh Gupta"
            placeholderTextColor="#9CA3AF"
            style={sif.input}
          />
          <Feather name="chevron-down" size={16} color="#6B7280" />
        </View>
      </View>
      <View style={sif.field}>
        <Text style={sif.label}>Service Type/Procedure</Text>
        <View style={[sif.inputBox, sif.selectBox]}>
          <TextInput
            value={serviceType}
            onChangeText={setServiceType}
            placeholder="Select a service (auto-populated codes)..."
            placeholderTextColor="#9CA3AF"
            style={sif.input}
          />
          <Feather name="chevron-down" size={16} color="#6B7280" />
        </View>
      </View>
      <View style={sif.btnRow}>
        <TouchableOpacity style={sif.prevBtn} onPress={onPrevious}>
          <Feather name="arrow-left" size={14} color="#374151" />
          <Text style={sif.prevText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={sif.nextBtn} onPress={onNext}>
          <Text style={sif.nextText}>Next</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MedicalCodesForm = ({
  diagnosisCodes,
  procedureCodes,
  setDiagnosisCodes,
  setProcedureCodes,
  onNext,
  onPrevious,
}) => {
  const [clinicalNotes, setClinicalNotes] = useState(
    "Patient with chest pain and positive stress test. Cardiac catheterization recommended to evaluate coronary artery disease and determine need for intervention.",
  );
  const [diagSearch, setDiagSearch] = useState("");
  const [cptSearch, setCptSearch] = useState("");

  const removeDiagnosis = (id) =>
    setDiagnosisCodes((prev) => prev.filter((c) => c.id !== id));
  const removeProcedure = (id) =>
    setProcedureCodes((prev) => prev.filter((c) => c.id !== id));

  return (
    <View style={mc.container}>
      <Text style={mc.sectionTitle}>Medical Codes</Text>
      <View style={mc.resourcesCard}>
        <View style={mc.resourcesLeft}>
          <View style={mc.resourcesIconBox}>
            <Feather name="book-open" size={14} color="#2563EB" />
          </View>
          <Text style={mc.resourcesTitle}>Official Code Resources</Text>
        </View>
        <StatusBadge status="Eligible" />
      </View>
      <View style={mc.resourcesLinksRow}>
        {["CMS ICD-10 Codes", "CMS ICD-10 CM", "AMA CPT Codes"].map((link) => (
          <TouchableOpacity key={link} style={mc.resourceLink}>
            <Text style={mc.resourceLinkText}>{link}</Text>
            <Feather
              name="external-link"
              size={11}
              color="#2563EB"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={mc.field}>
        <Text style={mc.fieldLabel}>
          Clinical notes{" "}
          <Text style={mc.fieldLabelLight}>(for AI Code Suggestion)</Text>
        </Text>
        <TextInput
          style={mc.clinicalTextArea}
          value={clinicalNotes}
          onChangeText={setClinicalNotes}
          multiline
          numberOfLines={4}
          placeholderTextColor="#9CA3AF"
          placeholder="Describe patient's condition..."
        />
      </View>
      <TouchableOpacity style={mc.aiBtn}>
        <Feather name="zap" size={15} color="#fff" style={{ marginRight: 8 }} />
        <Text style={mc.aiBtnText}>AI Suggested ICD Codes</Text>
      </TouchableOpacity>
      <View style={mc.field}>
        <View style={mc.codeHeaderRow}>
          <Text style={mc.fieldLabel}>
            Diagnosis Codes (ICD-10) <Text style={{ color: "#DC2626" }}>*</Text>
          </Text>
          <TouchableOpacity style={mc.refLink}>
            <Text style={mc.refLinkText}>CMS Reference</Text>
            <Feather
              name="external-link"
              size={11}
              color="#2563EB"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        </View>
        <View style={mc.searchBox}>
          <Feather
            name="search"
            size={13}
            color="#9CA3AF"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={mc.searchInput}
            value={diagSearch}
            onChangeText={setDiagSearch}
            placeholder="Search ICD-10"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <CodeList codes={diagnosisCodes} onRemove={removeDiagnosis} />
      </View>
      <View style={mc.field}>
        <View style={mc.codeHeaderRow}>
          <Text style={mc.fieldLabel}>Procedure Codes (CPT)</Text>
          <TouchableOpacity style={mc.refLink}>
            <Text style={mc.refLinkText}>AMA Reference</Text>
            <Feather
              name="external-link"
              size={11}
              color="#2563EB"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        </View>
        <View style={mc.searchBox}>
          <Feather
            name="search"
            size={13}
            color="#9CA3AF"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={mc.searchInput}
            value={cptSearch}
            onChangeText={setCptSearch}
            placeholder="Search CPT codes..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <CodeList codes={procedureCodes} onRemove={removeProcedure} />
      </View>
      <View style={mc.btnRow}>
        <TouchableOpacity style={mc.prevBtn} onPress={onPrevious}>
          <Feather name="arrow-left" size={14} color="#374151" />
          <Text style={mc.prevText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={mc.nextBtn} onPress={onNext}>
          <Text style={mc.nextText}>Next</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── STEP 4: Review & Verify Eligibility ───────────────────────────────────────
const ReviewVerifyForm = ({
  patient,
  diagnosisCodes,
  procedureCodes,
  onNext,
  onPrevious,
}) => {
  if (!patient) return null;

  return (
    <View style={rv.container}>
      <Text style={rv.sectionTitle}>Review & Verify Eligibility</Text>

      {/* ── Green eligibility banner ─────────────────────────────────────── */}
      <View style={rv.eligibleBanner}>
        <View style={rv.eligibleIconWrap}>
          <Feather name="check-circle" size={20} color="#059669" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={rv.eligibleTitle}>Eligible for Coverage</Text>
          <Text style={rv.eligibleSub}>
            Patient and requested services meet coverage criteria
          </Text>
        </View>
      </View>

      {/* ── Policy Reference ─────────────────────────────────────────────── */}
      <View style={rv.card}>
        <View style={rv.cardHeader}>
          <Feather name="file-text" size={14} color="#6B7280" />
          <Text style={rv.cardTitle}>Policy Reference</Text>
        </View>
        <View style={rv.policyGrid}>
          <View style={rv.policyCell}>
            <Text style={rv.policyLabel}>Document ID</Text>
            <Text style={rv.policyValue}>{patient.policyId}</Text>
          </View>
          <View style={rv.policyCell}>
            <Text style={rv.policyLabel}>Version</Text>
            <Text style={rv.policyValue}>{patient.policyVersion}</Text>
          </View>
          <View style={[rv.policyCell, { marginTop: 8 }]}>
            <Text style={rv.policyLabel}>Member ID</Text>
            <Text style={rv.policyValue}>{patient.memberId}</Text>
          </View>
          <View style={[rv.policyCell, { marginTop: 8 }]}>
            <Text style={rv.policyLabel}>Insurer</Text>
            <Text style={rv.policyValue}>{patient.insurer}</Text>
          </View>
        </View>
      </View>

      {/* ── Eligibility Checks ───────────────────────────────────────────── */}
      <View style={rv.card}>
        <View style={rv.cardHeader}>
          <Feather name="shield" size={14} color="#6B7280" />
          <Text style={rv.cardTitle}>Eligibility Checks</Text>
        </View>

        {/* Member Eligibility */}
        <View style={[rv.checkRow, rv.checkRowBorder]}>
          <View style={rv.checkLeft}>
            <Feather
              name="check-circle"
              size={15}
              color="#059669"
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={rv.checkTitle}>Member Eligibility</Text>
              <Text style={rv.checkDesc}>
                Active {patient.insurer} member in good standing
              </Text>
              <Text style={rv.checkCitation}>
                Citation: {patient.policyId} v2024.1, Who Gets Benefits —
                Eligibility, Page 23-25
              </Text>
            </View>
          </View>
          <View style={rv.passedBadge}>
            <Text style={rv.passedText}>Passed</Text>
          </View>
        </View>

        {/* Service Coverage */}
        <View style={[rv.checkRow, rv.checkRowBorder]}>
          <View style={rv.checkLeft}>
            <Feather
              name="check-circle"
              size={15}
              color="#059669"
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={rv.checkTitle}>Service Coverage</Text>
              <Text style={rv.checkDesc}>
                Requested procedure is covered under current plan
              </Text>
            </View>
          </View>
          <View style={rv.passedBadge}>
            <Text style={rv.passedText}>Passed</Text>
          </View>
        </View>

        {/* Prior Auth Required */}
        <View style={rv.checkRow}>
          <View style={rv.checkLeft}>
            <Feather
              name="check-circle"
              size={15}
              color="#059669"
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={rv.checkTitle}>Prior Auth Required</Text>
              <Text style={rv.checkDesc}>
                PA is required and can be submitted through this system.
              </Text>
            </View>
          </View>
          <View style={rv.confirmedBadge}>
            <Text style={rv.confirmedText}>Confirmed</Text>
          </View>
        </View>
      </View>

      {/* ── Codes Citations ──────────────────────────────────────────────── */}
      <View style={rv.card}>
        <View style={rv.cardHeader}>
          <Feather name="tag" size={14} color="#6B7280" />
          <Text style={rv.cardTitle}>Codes Citations</Text>
        </View>
        {diagnosisCodes.map((code, i) => (
          <View
            key={code.id}
            style={[
              rv.citationRow,
              i < diagnosisCodes.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
              },
            ]}
          >
            <View style={rv.citationBadge}>
              <Text style={rv.citationBadgeText}>Diagnosis Code</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={rv.citationCode}>{code.id}</Text>
              <Text style={rv.citationLabel}>{code.label}</Text>
              {code.ref && <Text style={rv.citationRef}>{code.ref}</Text>}
            </View>
          </View>
        ))}
      </View>

      {/* ── Request Summary ──────────────────────────────────────────────── */}
      <View style={rv.card}>
        <Text style={rv.summaryTitle}>Request summary</Text>

        {/* Patient row */}
        <View style={rv.summarySection}>
          <Text style={rv.summaryLabel}>Patient</Text>
          <Text style={rv.summaryValue}>{patient.name}</Text>
          <Text style={rv.summarySub}>
            {patient.insurer} · {patient.memberId}
          </Text>
        </View>

        {/* Service row */}
        <View style={rv.summarySection}>
          <Text style={rv.summaryLabel}>Service</Text>
          <Text style={rv.summaryValue}>
            {patient.service || patient.procedure}
          </Text>
          <Text style={rv.summarySub}>{patient.insurer} · Routine</Text>
          <Text style={rv.summarySub}>
            Provider: {patient.provider} · {patient.providerNPI}
          </Text>
        </View>

        {/* Diagnosis Codes ICD-10 */}
        <View style={rv.summarySection}>
          <Text style={rv.summaryLabel}>Diagnosis Codes ICD-10</Text>
          <View style={rv.summaryChipsRow}>
            {diagnosisCodes.map((code) => (
              <TouchableOpacity key={code.id} style={rv.summaryChip}>
                <Text style={rv.summaryChipText} numberOfLines={2}>
                  {code.id} · {code.label}
                </Text>
                <Feather
                  name="external-link"
                  size={10}
                  color="#2563EB"
                  style={{ marginLeft: 4, flexShrink: 0 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity>
            <Text style={rv.cdcLink}>
              Click any code to view on CDC ICD-10-CM Tool
            </Text>
          </TouchableOpacity>
        </View>

        {/* Procedure Codes CPT */}
        <View style={[rv.summarySection, { borderBottomWidth: 0 }]}>
          <Text style={rv.summaryLabel}>Procedure Codes (CPT)</Text>
          <View style={rv.summaryChipsRow}>
            {procedureCodes.map((code) => (
              <TouchableOpacity key={code.id} style={rv.summaryChip}>
                <Text style={rv.summaryChipText} numberOfLines={2}>
                  {code.id} · {code.label}
                </Text>
                <Feather
                  name="external-link"
                  size={10}
                  color="#2563EB"
                  style={{ marginLeft: 4, flexShrink: 0 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity>
            <Text style={rv.cdcLink}>
              Click any code to view on CDC ICD-10-CM Tool
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Buttons */}
      <View style={rv.btnRow}>
        <TouchableOpacity style={rv.prevBtn} onPress={onPrevious}>
          <Feather name="arrow-left" size={14} color="#374151" />
          <Text style={rv.prevText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rv.nextBtn} onPress={onNext}>
          <Text style={rv.nextText}>Next</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const PARequests = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter] = useState("All Statuses");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── Lifted state: shared between Step 3 → Step 4 ──────────────────────────
  const [diagnosisCodes, setDiagnosisCodes] = useState(
    ALL_DIAGNOSIS_CODES.slice(0, 2),
  );
  const [procedureCodes, setProcedureCodes] = useState(
    ALL_PROCEDURE_CODES.slice(0, 2),
  );

  const slideAnim = useRef(new Animated.Value(0)).current;
  const slideAnimMob = useRef(new Animated.Value(0)).current;

  const animateSlide = (animRef, direction) => {
    animRef.setValue(direction === "right" ? width : -width);
    Animated.spring(animRef, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  const handleSelectPatient = (patient, animRef) => {
    setSelectedPatient(patient);
    setCurrentStep(2);
    animateSlide(animRef, "right");
  };

  const handleNext = (animRef) => {
    setCurrentStep((s) => Math.min(s + 1, 5));
    animateSlide(animRef, "right");
  };

  const handlePrevious = (animRef) => {
    if (currentStep === 2) setSelectedPatient(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
    animateSlide(animRef, "left");
  };

  const filteredPatients = PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.id.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ── Step renderers ─────────────────────────────────────────────────────────
  const renderStep1 = (animRef, isMobile) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      <View style={isMobile ? mob.sectionHeader : sh.header}>
        <View>
          <Text style={isMobile ? mob.sectionTitle : sh.title}>
            Select Patient
          </Text>
          {isMobile && <Text style={mob.sectionSub}>Choose patient</Text>}
        </View>
        <TouchableOpacity style={sh.newReqBtn}>
          <Feather
            name="plus"
            size={14}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text style={sh.newReqText}>New PA Request</Text>
        </TouchableOpacity>
      </View>
      <View style={isMobile ? mob.searchRow : sh.searchRow}>
        <View style={isMobile ? mob.searchBox : sh.searchBox}>
          <Feather
            name="search"
            size={14}
            color="#9CA3AF"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search For Patient"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            style={isMobile ? mob.searchInput : sh.searchInput}
          />
        </View>
        <View style={isMobile ? mob.filterBox : sh.filterBox}>
          <Text style={isMobile ? mob.filterText : sh.filterText}>
            {statusFilter}
          </Text>
          <Feather
            name="chevron-down"
            size={13}
            color="#374151"
            style={{ marginLeft: 6 }}
          />
        </View>
      </View>
      {filteredPatients.length > 0 ? (
        <View style={isMobile ? { paddingHorizontal: 16 } : {}}>
          {filteredPatients.map((p) => (
            <PatientRow
              key={p.id}
              patient={p}
              onSelect={(pat) => handleSelectPatient(pat, animRef)}
              isSelected={selectedPatient?.id === p.id}
            />
          ))}
        </View>
      ) : (
        <EmptyState onNewRequest={() => {}} isMobile={isMobile} />
      )}
    </Animated.View>
  );

  const renderStep2 = (animRef, isMobile) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      <View style={isMobile ? { paddingHorizontal: 16, paddingTop: 12 } : {}}>
        <Text style={[sh.title, { marginBottom: 10 }]}>Selected Patient</Text>
        {selectedPatient && <SelectedPatientCard patient={selectedPatient} />}
      </View>
      <ServiceInfoForm
        patient={selectedPatient}
        onNext={() => handleNext(animRef)}
        onPrevious={() => handlePrevious(animRef)}
      />
    </Animated.View>
  );

  const renderStep3 = (animRef, isMobile) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      {selectedPatient && (
        <View
          style={
            isMobile
              ? { paddingHorizontal: 16, paddingTop: 12 }
              : { marginBottom: 4 }
          }
        >
          <SelectedPatientCard patient={selectedPatient} />
        </View>
      )}
      <MedicalCodesForm
        diagnosisCodes={diagnosisCodes}
        procedureCodes={procedureCodes}
        setDiagnosisCodes={setDiagnosisCodes}
        setProcedureCodes={setProcedureCodes}
        onNext={() => handleNext(animRef)}
        onPrevious={() => handlePrevious(animRef)}
      />
    </Animated.View>
  );

  const renderStep4 = (animRef) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      <ReviewVerifyForm
        patient={selectedPatient}
        diagnosisCodes={diagnosisCodes}
        procedureCodes={procedureCodes}
        onNext={() => handleNext(animRef)}
        onPrevious={() => handlePrevious(animRef)}
      />
    </Animated.View>
  );

  const renderCurrentStep = (animRef, isMobile) => {
    if (currentStep === 1) return renderStep1(animRef, isMobile);
    if (currentStep === 2) return renderStep2(animRef, isMobile);
    if (currentStep === 3) return renderStep3(animRef, isMobile);
    if (currentStep === 4) return renderStep4(animRef, isMobile);
    return null;
  };

  return (
    <>
      {/* ── WEB ── */}
      {Platform.OS === "web" && width > 1000 && (
        <View style={web.webContainer}>
          <View style={web.imageContainer}>
            <ImageBackground
              source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
              style={web.imageBackground}
              resizeMode="cover"
            >
              <View
                style={[web.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
              />
              <View style={web.parent}>
                <View style={web.Left}>
                  <HospitalSidebarNavigation navigation={navigation} />
                </View>
                <View style={web.Right}>
                  {/* <View style={web.header}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View> */}
                  <ScrollView
                    style={{
                      flex: 1,
                      backgroundColor: "#fff",
                      margin: "2%",
                      borderRadius: 12,
                    }}
                    contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={web.titleRow}>
                      <View>
                        <Text style={web.pageTitle}>PA Requests</Text>
                        <Text style={web.pageSub}>
                          Create a new prior authorization request
                        </Text>
                      </View>
                      <TouchableOpacity style={web.backBtn}>
                        <Feather
                          name="arrow-left"
                          size={14}
                          color="#374151"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={web.backBtnText}>Back to home</Text>
                      </TouchableOpacity>
                    </View>
                    <WebStepper currentStep={currentStep} />
                    <View style={{ overflow: "hidden" }}>
                      {renderCurrentStep(slideAnim, false)}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}

      {/* ── MOBILE ── */}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={mob.header}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <Text style={mob.title}>PA Requests</Text>
            <MobileStepper currentStep={currentStep} />
            <View style={{ overflow: "hidden" }}>
              {renderCurrentStep(slideAnimMob, true)}
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const ws = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  circleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  circleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  circleText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
  labelBox: { flexDirection: "column" },
  label: { fontSize: 13, fontWeight: "600", color: "#374151" },
  sub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  line: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginHorizontal: 8 },
  lineDone: { backgroundColor: "#16A34A" },
});

const ms = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 4,
  },
  stepItem: { alignItems: "center", gap: 4 },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  circleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  circleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  circleText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 55,
  },
  line: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginBottom: 14 },
  lineDone: { backgroundColor: "#16A34A" },
});

const pr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  rowSelected: { backgroundColor: "#EFF6FF" },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});

const spc = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FAFAFA",
    gap: 12,
    marginBottom: 16,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700", color: "#111827" },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});

const sh = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  newReqBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  searchRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#FAFAFA",
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    outlineStyle: "none",
  },
  filterBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FAFAFA",
    minWidth: 140,
  },
  filterText: { fontSize: 13, color: "#374151", flex: 1 },
});

const sif = StyleSheet.create({
  container: { padding: 16, paddingTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
    marginTop: 8,
  },
  row: { flexDirection: "row", gap: 16, marginBottom: 16 },
  fieldHalf: { flex: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 6 },
  inputBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  selectBox: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, fontSize: 13, color: "#374151", outlineStyle: "none" },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  prevText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});

const mc = StyleSheet.create({
  container: { padding: 16, paddingTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    marginTop: 4,
  },
  resourcesCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  resourcesLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  resourcesIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  resourcesTitle: { fontSize: 13, fontWeight: "600", color: "#374151" },
  resourcesLinksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  resourceLink: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#EFF6FF",
  },
  resourceLinkText: { fontSize: 12, color: "#2563EB", fontWeight: "500" },
  field: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  fieldLabelLight: { fontSize: 12, fontWeight: "400", color: "#6B7280" },
  clinicalTextArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#374151",
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
    outlineStyle: "none",
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  aiBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  codeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  refLink: { flexDirection: "row", alignItems: "center" },
  refLinkText: { fontSize: 12, color: "#2563EB", fontWeight: "500" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    outlineStyle: "none",
  },
  codeListWrapper: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  codeScroll: { maxHeight: 110 },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
    gap: 10,
  },
  codeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  codeChipText: { fontSize: 12, fontWeight: "600", color: "#2563EB" },
  codeLabel: { flex: 1, fontSize: 13, color: "#374151" },
  removeBtn: { padding: 2 },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  prevText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});

// ─── REVIEW & VERIFY STYLES ───────────────────────────────────────────────────
const rv = StyleSheet.create({
  container: { padding: 16, paddingTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    marginTop: 4,
  },

  // Eligible for coverage banner
  eligibleBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  eligibleIconWrap: {},
  eligibleTitle: { fontSize: 15, fontWeight: "700", color: "#15803D" },
  eligibleSub: { fontSize: 12, color: "#166534", marginTop: 2 },

  // Generic card container
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#374151" },

  // Policy Reference 2x2 grid
  policyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  policyCell: { width: "50%", paddingBottom: 12, paddingRight: 8 },
  policyLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 3,
  },
  policyValue: { fontSize: 13, fontWeight: "600", color: "#111827" },

  // Eligibility check rows
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  checkRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  checkLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  checkDesc: { fontSize: 12, color: "#6B7280" },
  checkCitation: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    lineHeight: 15,
  },

  // Passed badge
  passedBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  passedText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  // Confirmed badge
  confirmedBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confirmedText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  // Codes Citations rows
  citationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  citationBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  citationBadgeText: { fontSize: 11, fontWeight: "600", color: "#2563EB" },
  citationCode: { fontSize: 13, fontWeight: "700", color: "#111827" },
  citationLabel: { fontSize: 12, color: "#374151", marginTop: 1 },
  citationRef: { fontSize: 11, color: "#9CA3AF", marginTop: 4, lineHeight: 15 },

  // Request summary
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  summarySub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  summaryChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: "100%",
  },
  summaryChipText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
    flexShrink: 1,
  },
  cdcLink: { fontSize: 11, color: "#2563EB" },

  // Buttons
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  prevText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});

const es = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 20,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

const web = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  imageContainer: { height: "100%", width: "100%" },
  imageBackground: {
    width: "100%",
    height: "100%",
    opacity: 80,
    alignSelf: "center",
    flexDirection: "column",
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  parent: { flexDirection: "row", height: "100%", width: "100%" },
  Left: { height: "100%", width: "15%" },
  Right: { height: "100%", width: "85%" },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop:"2%"
  },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  pageSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  backBtnText: { fontSize: 13, color: "#374151", fontWeight: "500" },
});

const mob = StyleSheet.create({
  header: { backgroundColor: "#fff", paddingHorizontal: "2%" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  newReqBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#374151" },
  filterBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
  },
  filterText: { fontSize: 12, color: "#374151" },
});

export default PARequests;
