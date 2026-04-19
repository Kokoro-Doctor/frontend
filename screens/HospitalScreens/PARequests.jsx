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




// PARequestsScreen.jsx
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
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

// ─── HARDCODED PATIENT DATA ───────────────────────────────────────────────────
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
  },
];

// ─── STEP DATA ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Choose Patient", sub: "Select patient" },
  { id: 2, label: "Service Info", sub: "Provider & Service" },
  { id: 3, label: "Medical Codes", sub: "ICD-10 & CPT" },
  { id: 4, label: "Review & Verify", sub: "Eligibility check" },
  { id: 5, label: "PreAuth Status", sub: "Submitted" },
];

// ─── WEB STEPPER ─────────────────────────────────────────────────────────────
const WebStepper = ({ currentStep }) => (
  <View style={ws.container}>
    {STEPS.map((step, index) => {
      const isActive = step.id === currentStep;
      const isDone = step.id < currentStep;
      return (
        <React.Fragment key={step.id}>
          <View style={ws.stepItem}>
            <View style={[ws.circle, isActive && ws.circleActive, isDone && ws.circleDone]}>
              {isDone ? (
                <Feather name="check" size={14} color="#fff" />
              ) : (
                <Text style={[ws.circleText, (isActive || isDone) && { color: "#fff" }]}>
                  {step.id}
                </Text>
              )}
            </View>
            <View style={ws.labelBox}>
              <Text style={[ws.label, isActive && { color: "#2563EB", fontWeight: "700" }]}>
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

// ─── MOBILE STEPPER ──────────────────────────────────────────────────────────
const MobileStepper = ({ currentStep }) => (
  <View style={ms.container}>
    {STEPS.map((step, index) => {
      const isActive = step.id === currentStep;
      const isDone = step.id < currentStep;
      return (
        <React.Fragment key={step.id}>
          <View style={ms.stepItem}>
            <View style={[ms.circle, isActive && ms.circleActive, isDone && ms.circleDone]}>
              {isDone ? (
                <Feather name="check" size={10} color="#fff" />
              ) : (
                <Text style={[ms.circleText, (isActive || isDone) && { color: "#fff" }]}>
                  {step.id}
                </Text>
              )}
            </View>
            <Text
              style={[ms.label, isActive && { color: "#2563EB", fontWeight: "700" }]}
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

// ─── PATIENT AVATAR ──────────────────────────────────────────────────────────
const Avatar = ({ initials, color, textColor, size = 40 }) => (
  <View style={{
    width: size, height: size, borderRadius: size / 2,
    backgroundColor: color, justifyContent: "center", alignItems: "center",
  }}>
    <Text style={{ color: textColor, fontWeight: "700", fontSize: size * 0.35 }}>
      {initials}
    </Text>
  </View>
);

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isEligible = status === "Eligible";
  return (
    <View style={{
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
      backgroundColor: isEligible ? "#D1FAE5" : "#FEE2E2",
    }}>
      <Text style={{
        fontSize: 12, fontWeight: "600",
        color: isEligible ? "#059669" : "#DC2626",
      }}>
        {status}
      </Text>
    </View>
  );
};

// ─── PATIENT ROW ─────────────────────────────────────────────────────────────
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

// ─── SELECTED PATIENT CARD ───────────────────────────────────────────────────
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

// ─── SERVICE INFO FORM ───────────────────────────────────────────────────────
const ServiceInfoForm = ({ onNext, onPrevious }) => {
  const [insuranceProvider, setInsuranceProvider] = useState("Star Health");
  const [urgencyLevel, setUrgencyLevel] = useState("Routine");
  const [orderingProvider, setOrderingProvider] = useState("Dr Rajesh Gupta");
  const [serviceType, setServiceType] = useState("");

  return (
    <View style={sif.container}>
      <Text style={sif.sectionTitle}>Service information</Text>

      {/* Row 1: Insurance Provider + Urgency Level */}
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

      {/* Row 2: Ordering/Rendering Provider */}
      <View style={sif.field}>
        <Text style={sif.label}>
          Ordering / Rendering Provider <Text style={{ color: "#DC2626" }}>*</Text>
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

      {/* Row 3: Service Type */}
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

      {/* Prev / Next Buttons */}
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

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
const EmptyState = ({ onNewRequest, isMobile }) => (
  <View style={[es.container, isMobile && { paddingVertical: 60 }]}>
    <Text style={es.title}>No new patient yet</Text>
    <TouchableOpacity style={es.btn} onPress={onNewRequest}>
      <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
      <Text style={es.btnText}>Create your first PA Request</Text>
    </TouchableOpacity>
  </View>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const PARequests = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter] = useState("All Statuses");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const slideAnimMob = useRef(new Animated.Value(0)).current;

  const slideRight = (animRef) => {
    animRef.setValue(width);
    Animated.spring(animRef, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  const slideLeft = (animRef) => {
    animRef.setValue(-width);
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
    slideRight(animRef);
  };

  const handleNext = (animRef) => {
    setCurrentStep((s) => Math.min(s + 1, 5));
    slideRight(animRef);
  };

  const handlePrevious = (animRef) => {
    setSelectedPatient(null);
    setCurrentStep(1);
    slideLeft(animRef);
  };

  // Filter patients by search
  const filteredPatients = PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.id.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ── STEP 1 CONTENT (patient list) ─────────────────────────────────────────
  const renderStep1 = (animRef, isMobile) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      {/* Header row */}
      <View style={isMobile ? mob.sectionHeader : sh.header}>
        <View>
          <Text style={isMobile ? mob.sectionTitle : sh.title}>Select Patient</Text>
          {isMobile && <Text style={mob.sectionSub}>Choose patient</Text>}
        </View>
        <TouchableOpacity style={sh.newReqBtn}>
          <Feather name="plus" size={14} color="#fff" style={{ marginRight: 4 }} />
          <Text style={sh.newReqText}>New PA Request</Text>
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={isMobile ? mob.searchRow : sh.searchRow}>
        <View style={isMobile ? mob.searchBox : sh.searchBox}>
          <Feather name="search" size={14} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search For Patient"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            style={isMobile ? mob.searchInput : sh.searchInput}
          />
        </View>
        <View style={isMobile ? mob.filterBox : sh.filterBox}>
          <Text style={isMobile ? mob.filterText : sh.filterText}>{statusFilter}</Text>
          <Feather name="chevron-down" size={13} color="#374151" style={{ marginLeft: 6 }} />
        </View>
      </View>

      {/* Patient list or empty state */}
      {filteredPatients.length > 0 ? (
        <View style={isMobile ? { paddingHorizontal: 16 } : { paddingHorizontal: 0 }}>
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

  // ── STEP 2 CONTENT (service info) ─────────────────────────────────────────
  const renderStep2 = (animRef, isMobile) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      {/* Selected patient summary */}
      <View style={isMobile ? { paddingHorizontal: 16, paddingTop: 12 } : { paddingHorizontal: 0 }}>
        <Text style={[sh.title, { marginBottom: 10 }]}>Selected Patient</Text>
        {selectedPatient && <SelectedPatientCard patient={selectedPatient} />}
      </View>
      <ServiceInfoForm
        onNext={() => handleNext(animRef)}
        onPrevious={() => handlePrevious(animRef)}
      />
    </Animated.View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // WEB RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={web.webContainer}>
          <View style={web.imageContainer}>
            <ImageBackground
              source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
              style={web.imageBackground}
              resizeMode="cover"
            >
              <View style={[web.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]} />
              <View style={web.parent}>
                <View style={web.Left}>
                  <HospitalSidebarNavigation navigation={navigation} />
                </View>
                <View style={web.Right}>
                  <View style={web.header}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View>
                  <ScrollView
                    style={{ flex: 1, backgroundColor: "#fff", margin: "2%", borderRadius: 12 }}
                    contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Title Row */}
                    <View style={web.titleRow}>
                      <View>
                        <Text style={web.pageTitle}>PA Requests</Text>
                        <Text style={web.pageSub}>Create a new prior authorization request</Text>
                      </View>
                      <TouchableOpacity style={web.backBtn}>
                        <Feather name="arrow-left" size={14} color="#374151" style={{ marginRight: 6 }} />
                        <Text style={web.backBtnText}>Back to home</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Stepper */}
                    <WebStepper currentStep={currentStep} />

                    {/* Slide content */}
                    <View style={{ overflow: "hidden" }}>
                      {currentStep === 1
                        ? renderStep1(slideAnim, false)
                        : renderStep2(slideAnim, false)}
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
              {currentStep === 1
                ? renderStep1(slideAnimMob, true)
                : renderStep2(slideAnimMob, true)}
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
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 2, borderColor: "#D1D5DB",
    justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
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
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 4,
  },
  stepItem: { alignItems: "center", gap: 4 },
  circle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2, borderColor: "#D1D5DB",
    justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
  },
  circleActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  circleDone: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  circleText: { fontSize: 13, fontWeight: "700", color: "#9CA3AF" },
  label: { fontSize: 10, fontWeight: "500", color: "#6B7280", textAlign: "center", maxWidth: 55 },
  line: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginBottom: 14 },
  lineDone: { backgroundColor: "#16A34A" },
});

// Patient row
const pr = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  rowSelected: { backgroundColor: "#EFF6FF" },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});

// Selected patient card
const spc = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 10, padding: 14,
    backgroundColor: "#FAFAFA", gap: 12,
    marginBottom: 20,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700", color: "#111827" },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
});

// Section header (shared)
const sh = StyleSheet.create({
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  newReqBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#2563EB", paddingHorizontal: 14,
    paddingVertical: 9, borderRadius: 8,
  },
  newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  searchRow: {
    flexDirection: "row", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9, backgroundColor: "#FAFAFA",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#374151", outlineStyle: "none" },
  filterBox: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: "#FAFAFA", minWidth: 140,
  },
  filterText: { fontSize: 13, color: "#374151", flex: 1 },
});

// Service Info Form
const sif = StyleSheet.create({
  container: { padding: 16, paddingTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 18, marginTop: 8 },
  row: { flexDirection: "row", gap: 16, marginBottom: 16 },
  fieldHalf: { flex: 1 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 6 },
  inputBox: {
    borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#fff",
  },
  selectBox: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, fontSize: 13, color: "#374151", outlineStyle: "none" },
  btnRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 24,
  },
  prevBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: "#D1D5DB",
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    backgroundColor: "#fff",
  },
  prevText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  nextBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
  },
  nextText: { fontSize: 13, fontWeight: "600", color: "#fff" },
});

const es = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  title: { fontSize: 18, fontWeight: "600", color: "#374151", marginBottom: 20 },
  btn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8,
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
  imageContainer: {
    borderColor: "#00ffff",
    height: "100%",
    width: "100%",
  },

  imageBackground: {
    width: "100%",
    height: "100%",
    //transform:[{scale:0.8}],
    opacity: 80,
    alignSelf: "center",
    flexDirection: "column",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  Left: {
    height: "100%",
    width: "15%",
    //borderWidth: 1,
  },
  Right: {
    height: "100%",
    width: "85%",
  },
  //header: { backgroundColor: "#fff", zIndex: 2 },
  titleRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20,
  },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  pageSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  backBtn: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#D1D5DB",
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, backgroundColor: "#fff",
  },
  backBtnText: { fontSize: 13, color: "#374151", fontWeight: "500" },
});

const mob = StyleSheet.create({
  header: { backgroundColor: "#fff", paddingHorizontal: "2%" },
  title: { fontSize: 26, fontWeight: "700", color: "#111827", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: "#F3F4F6",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  sectionSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  newReqBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#2563EB", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
  },
  newReqText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FAFAFA",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#374151" },
  filterBox: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FAFAFA",
  },
  filterText: { fontSize: 12, color: "#374151" },
});

export default PARequests;
