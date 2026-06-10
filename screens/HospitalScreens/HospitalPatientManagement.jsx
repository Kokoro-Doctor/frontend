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
import AbhaRegistration from "../../components/HospitalPortalComponent/AbhaRegistration";

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
// const AddPatientForm = ({ onSave, onSaveAndAnother }) => {
//   const [form, setForm] = useState({
//     fullName: "",
//     dob: "",
//     gender: "",
//     phone: "",
//     policy: "",
//     insurer: "",
//     admissionDate: "",
//     procedure: "",
//     doctor: "",
//   });
//   const [generatedId] = useState(generatePatientId());
//   const [savedMessage, setSavedMessage] = useState("");

//   const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

//   const buildPatient = () => ({
//     id: generatedId,
//     name: form.fullName || "New Patient",
//     age: form.dob
//       ? new Date().getFullYear() - parseInt(form.dob.slice(-4) || 2000)
//       : "—",
//     insurer: form.insurer || "—",
//     procedure: form.procedure || "—",
//     status: "Discharged",
//     claims: 0,
//     initials: getInitials(form.fullName),
//     dob: form.dob,
//     gender: form.gender,
//     policy: form.policy,
//     phone: form.phone,
//     admitted: form.admissionDate,
//     discharged: "—",
//     hasClaim: false,
//   });

//   const handleSave = () => {
//     const patient = buildPatient();
//     setSavedMessage(`${patient.name} saved with Patient ID ${patient.id}`);
//     onSave(patient);
//   };

//   const handleSaveAnother = () => {
//     const patient = buildPatient();
//     onSaveAndAnother(patient, form.fullName, generatedId);
//   };

//   return (
//     <ScrollView
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
//     >
//       {/* Section: Patient Details */}
//       <Text style={styles.formSectionHeading}>Patients Details :</Text>

//       {/* Row 1: Full Name + DOB */}
//       <View style={styles.formRow}>
//         <View style={styles.formGroup}>
//           <Text style={styles.formLabel}>
//             Full name <Text style={{ color: "#EF4444" }}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.formInput}
//             placeholder="Enter Name..."
//             placeholderTextColor="#9CA3AF"
//             value={form.fullName}
//             onChangeText={(v) => set("fullName", v)}
//           />
//         </View>
//         <View style={styles.formGroup}>
//           <Text style={styles.formLabel}>
//             Date of birth <Text style={{ color: "#EF4444" }}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.formInput}
//             placeholder="Select department"
//             placeholderTextColor="#9CA3AF"
//             value={form.dob}
//             onChangeText={(v) => set("dob", v)}
//           />
//         </View>
//       </View>

//       {/* Row 2: Patient ID + Gender */}
//       <View style={styles.formRow}>
//         <View style={styles.formGroup}>
//           <Text style={styles.formLabel}>Patient ID</Text>
//           <TextInput
//             style={[styles.formInput, { color: "#9CA3AF" }]}
//             value={generatedId}
//             editable={false}
//             placeholder="Auto-generated"
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>
//         <SelectRow
//           label="Gender *"
//           value={form.gender}
//           options={GENDERS}
//           onSelect={(v) => set("gender", v)}
//           placeholder="Select Gender"
//         />
//       </View>

//       {/* Row 3: Phone + Policy */}
//       <View style={styles.formRow}>
//         <View style={styles.formGroup}>
//           <Text style={styles.formLabel}>Phone no</Text>
//           <TextInput
//             style={styles.formInput}
//             placeholder="+91 9823400998"
//             placeholderTextColor="#9CA3AF"
//             keyboardType="phone-pad"
//             value={form.phone}
//             onChangeText={(v) => set("phone", v)}
//           />
//         </View>
//         <View style={styles.formGroup}>
//           <Text style={styles.formLabel}>Insurance policy number</Text>
//           <TextInput
//             style={styles.formInput}
//             placeholder="e.g SH-48821-C"
//             placeholderTextColor="#9CA3AF"
//             value={form.policy}
//             onChangeText={(v) => set("policy", v)}
//           />
//         </View>
//       </View>

//       {/* Row 4: Insurer + Admission Date */}
//       <View style={styles.formRow}>
//         <SelectRow
//           label="Insurer"
//           value={form.insurer}
//           options={INSURERS.slice(1)}
//           onSelect={(v) => set("insurer", v)}
//           placeholder="Select Insurer"
//         />
//         <View style={styles.formGroup}>
//           <Text style={styles.formLabel}>Admission date</Text>
//           <TextInput
//             style={styles.formInput}
//             placeholder="dd-mm-yyyy"
//             placeholderTextColor="#9CA3AF"
//             value={form.admissionDate}
//             onChangeText={(v) => set("admissionDate", v)}
//           />
//         </View>
//       </View>

//       {/* Row 5: Diagnosis + Assign Doctor */}
//       <View style={styles.formRow}>
//         <View style={styles.formGroup}>
//           <Text style={styles.formLabel}>Diagnosis/Procedure</Text>
//           <TextInput
//             style={styles.formInput}
//             placeholder="eg CABG, Hysterectomy"
//             placeholderTextColor="#9CA3AF"
//             value={form.procedure}
//             onChangeText={(v) => set("procedure", v)}
//           />
//         </View>
//         <SelectRow
//           label="Assign Doctor"
//           value={form.doctor}
//           options={DOCTORS}
//           onSelect={(v) => set("doctor", v)}
//           placeholder="Select Doctor"
//         />
//       </View>

//       {/* Import from Excel/CSV */}
//       <View style={styles.importRow}>
//         <Text style={styles.importLabel}>1 Import from excel/csv</Text>
//       </View>
//       <View style={styles.importSection}>
//         <View style={styles.uploadBox}>
//           <Text style={{ fontSize: 22, marginBottom: 6 }}>⬆</Text>
//           <Text style={{ fontSize: 13, color: "#6B7280" }}>
//             Upload patient list (.xlsx or .csv){" "}
//             <Text style={{ color: "#2563EB", fontWeight: "600" }}>
//               Click here
//             </Text>
//           </Text>
//         </View>
//         <View style={styles.downloadBox}>
//           <TouchableOpacity style={styles.downloadBtn}>
//             <Text style={{ fontSize: 12, color: "#374151", fontWeight: "500" }}>
//               Download Template
//             </Text>
//           </TouchableOpacity>
//           <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
//             Not sure of format? download our template first
//           </Text>
//         </View>
//       </View>

//       {/* Action Buttons */}
//       <View style={styles.formActions}>
//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveBtnText}>Save Patient</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.saveMoreBtn}
//           onPress={handleSaveAnother}
//         >
//           <Text style={styles.saveMoreBtnText}>
//             Save & Register Another Patient →
//           </Text>
//         </TouchableOpacity>
//         {savedMessage !== "" && (
//           <View style={styles.savedPill}>
//             <Text style={styles.savedPillText}>
//               <Text style={{ fontWeight: "700" }}>
//                 {form.fullName || "Patient"}{" "}
//               </Text>
//               saved with Patient ID{" "}
//               <Text style={{ fontWeight: "700" }}>{generatedId}</Text>
//             </Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// };
// ─── ADD PATIENT FORM ─────────────────────────────────────────
const AddPatientForm = ({ onSave, onSaveAndAnother, isMobile = false }) => {
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
  const [savedName, setSavedName] = useState("");

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
    setSavedName(form.fullName || "Patient");
    setSavedMessage(generatedId);
    onSave(patient);
  };

  const handleSaveAnother = () => {
    const patient = buildPatient();
    onSaveAndAnother(patient, form.fullName, generatedId);
  };

  // ── MOBILE FORM ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={mobileFormStyles.sectionHeading}>Patient Details :</Text>

        {/* Full Name */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>
            Full name <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={mobileFormStyles.input}
            placeholder="Enter Name..."
            placeholderTextColor="#9CA3AF"
            value={form.fullName}
            onChangeText={(v) => set("fullName", v)}
          />
        </View>

        {/* Date of Birth */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>
            Date of birth <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={mobileFormStyles.input}
            placeholder="dd-mm-yyyy"
            placeholderTextColor="#9CA3AF"
            value={form.dob}
            onChangeText={(v) => set("dob", v)}
          />
        </View>

        {/* Patient ID (auto) */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>Patient ID</Text>
          <TextInput
            style={[mobileFormStyles.input, mobileFormStyles.inputDisabled]}
            value={generatedId}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Gender */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>
            Gender <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <MobileSelectField
            value={form.gender}
            options={GENDERS}
            onSelect={(v) => set("gender", v)}
            placeholder="Select Gender"
          />
        </View>

        {/* Phone */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>Phone no</Text>
          <TextInput
            style={mobileFormStyles.input}
            placeholder="+91 9823400998"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => set("phone", v)}
          />
        </View>

        {/* Insurance Policy Number */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>Insurance policy number</Text>
          <TextInput
            style={mobileFormStyles.input}
            placeholder="e.g SH-48821-C"
            placeholderTextColor="#9CA3AF"
            value={form.policy}
            onChangeText={(v) => set("policy", v)}
          />
        </View>

        {/* Insurer */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>Insurer</Text>
          <MobileSelectField
            value={form.insurer}
            options={INSURERS.slice(1)}
            onSelect={(v) => set("insurer", v)}
            placeholder="Select Insurer"
          />
        </View>

        {/* Admission Date */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>Admission date</Text>
          <TextInput
            style={mobileFormStyles.input}
            placeholder="dd-mm-yyyy"
            placeholderTextColor="#9CA3AF"
            value={form.admissionDate}
            onChangeText={(v) => set("admissionDate", v)}
          />
        </View>

        {/* Diagnosis / Procedure */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>Diagnosis/Procedure</Text>
          <TextInput
            style={mobileFormStyles.input}
            placeholder="eg CABG, Hysterectomy"
            placeholderTextColor="#9CA3AF"
            value={form.procedure}
            onChangeText={(v) => set("procedure", v)}
          />
        </View>

        {/* Assign Doctor */}
        <View style={mobileFormStyles.fieldGroup}>
          <Text style={mobileFormStyles.label}>Assign Doctor</Text>
          <MobileSelectField
            value={form.doctor}
            options={DOCTORS}
            onSelect={(v) => set("doctor", v)}
            placeholder="Select Doctor"
          />
        </View>

        {/* Import from Excel/CSV */}
        <Text style={mobileFormStyles.importLabel}>
          1. Import from excel/csv
        </Text>
        <View style={mobileFormStyles.uploadBox}>
          <Text style={{ fontSize: 20, marginBottom: 6 }}>⬆</Text>
          <Text style={{ fontSize: 13, color: "#6B7280", textAlign: "center" }}>
            Upload patient list (.xlsx or .csv){" "}
            <Text style={{ color: "#2563EB", fontWeight: "600" }}>
              Click here
            </Text>
          </Text>
        </View>
        <TouchableOpacity style={mobileFormStyles.downloadBtn}>
          <Text style={mobileFormStyles.downloadBtnText}>
            Download Template
          </Text>
        </TouchableOpacity>
        <Text style={mobileFormStyles.downloadHint}>
          Not sure of format? download our template first
        </Text>

        {/* Saved success pill */}
        {savedMessage !== "" && (
          <View style={mobileFormStyles.savedPill}>
            <Text style={mobileFormStyles.savedPillText}>
              <Text style={{ fontWeight: "700" }}>{savedName} </Text>
              saved with Patient ID{" "}
              <Text style={{ fontWeight: "700", color: "#15803D" }}>
                {savedMessage}
              </Text>
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          style={mobileFormStyles.saveAnotherBtn}
          onPress={handleSaveAnother}
        >
          <Text style={mobileFormStyles.saveAnotherBtnText}>
            Save & Register Another Patient →
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={mobileFormStyles.saveBtn} onPress={handleSave}>
          <Text style={mobileFormStyles.saveBtnText}>Save Patient</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── WEB / TABLET FORM (original layout unchanged) ────────────
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text style={styles.formSectionHeading}>Patients Details :</Text>

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

// ─── MOBILE SELECT FIELD ──────────────────────────────────────
const MobileSelectField = ({ value, options, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "relative", zIndex: open ? 999 : 1 }}>
      <TouchableOpacity
        style={mobileFormStyles.selectBtn}
        onPress={() => setOpen(!open)}
      >
        <Text
          style={{
            fontSize: 14,
            color: value ? "#111827" : "#9CA3AF",
            flex: 1,
          }}
        >
          {value || placeholder}
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 13 }}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={mobileFormStyles.selectMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={mobileFormStyles.selectMenuItem}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text
                style={{
                  fontSize: 14,
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

// ─── MOBILE INLINE PATIENT DETAIL ────────────────────────────
const MobileInlineDetail = ({ patient, navigation }) => {
  const [assignedDoctor, setAssignedDoctor] = useState("Assign Doctor");
  const [doctorDropOpen, setDoctorDropOpen] = useState(false);
  const [claimFiles, setClaimFiles] = useState([
    { name: "Insurance Claim", size: "1.5 mb" },
    { name: "Insurance_Policy", size: "1.5 mb" },
    { name: "Insurance_Policy", size: "1.5 mb" },
  ]);
  const [postOpFiles, setPostOpFiles] = useState([]);
  const [claimFiled, setClaimFiled] = useState(patient.hasClaim);
  const [claimAmount] = useState("₹4,62,000");
  const [claimStatus] = useState("Under review");

  const removeClaimFile = (index) => {
    setClaimFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={mobileDetailStyles.wrapper}>
      {/* ── Patient Details box ── */}
      <View style={mobileDetailStyles.section}>
        <Text style={mobileDetailStyles.sectionTitle}>Patient Details</Text>
        <View style={mobileDetailStyles.detailBox}>
          <View style={mobileDetailStyles.detailGrid}>
            <View style={mobileDetailStyles.detailCell}>
              <Text style={mobileDetailStyles.cellLabel}>DOB</Text>
              <Text style={mobileDetailStyles.cellValue}>
                {patient.dob || "—"}
              </Text>
            </View>
            <View style={mobileDetailStyles.detailCell}>
              <Text style={mobileDetailStyles.cellLabel}>Gender</Text>
              <Text style={mobileDetailStyles.cellValue}>
                {patient.gender || "—"}
              </Text>
            </View>
            <View style={mobileDetailStyles.detailCell}>
              <Text style={mobileDetailStyles.cellLabel}>Phone</Text>
              <Text style={mobileDetailStyles.cellValue}>
                {patient.phone || "—"}
              </Text>
            </View>
            <View style={mobileDetailStyles.detailCell}>
              <Text style={mobileDetailStyles.cellLabel}>Admitted</Text>
              <Text style={mobileDetailStyles.cellValue}>
                {patient.admitted || "—"}
              </Text>
            </View>
            <View style={mobileDetailStyles.detailCell}>
              <Text style={mobileDetailStyles.cellLabel}>Policy</Text>
              <Text style={mobileDetailStyles.cellValue}>
                {patient.policy || "—"}
              </Text>
            </View>
            <View style={mobileDetailStyles.detailCell}>
              <Text style={mobileDetailStyles.cellLabel}>Doctor assigned</Text>
              <Text style={mobileDetailStyles.cellValue}>
                {assignedDoctor === "Assign Doctor" ? "—" : assignedDoctor}
              </Text>
            </View>
            <View style={[mobileDetailStyles.detailCell, { minWidth: "60%" }]}>
              <Text style={mobileDetailStyles.cellLabel}>Discharged</Text>
              <Text style={mobileDetailStyles.cellValue}>
                {patient.discharged || "—"}
              </Text>
            </View>
          </View>

          {/* Analyze + View Full Record buttons */}
          <TouchableOpacity style={mobileDetailStyles.outlineBtn}>
            <Text style={mobileDetailStyles.outlineBtnText}>
              Analyze New Claim
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={mobileDetailStyles.solidBlueBtn}>
            <Text style={mobileDetailStyles.solidBlueBtnText}>
              View Full Record
            </Text>
          </TouchableOpacity>

          {/* Assign Doctor */}
          <View style={{ position: "relative", zIndex: 20, marginTop: 10 }}>
            <TouchableOpacity
              style={mobileDetailStyles.assignDoctorBtn}
              onPress={() => setDoctorDropOpen(!doctorDropOpen)}
            >
              <Text style={{ fontSize: 13, color: "#374151", flex: 1 }}>
                {assignedDoctor}
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>▾</Text>
            </TouchableOpacity>
            {doctorDropOpen && (
              <View style={mobileDetailStyles.doctorMenu}>
                {DOCTORS.map((doc) => (
                  <TouchableOpacity
                    key={doc}
                    style={mobileDetailStyles.doctorMenuItem}
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

      {/* ── Insurance Claims ── */}
      <View style={mobileDetailStyles.section}>
        <Text style={mobileDetailStyles.sectionTitle}>Insurance Claims</Text>
        <View style={mobileDetailStyles.claimBox}>
          {claimFiled ? (
            <>
              {/* Claim header with amount */}
              <View style={mobileDetailStyles.claimHeader}>
                <Text style={mobileDetailStyles.claimId}>
                  KK-CLAIM-AUG-2024-0821
                </Text>
                <View>
                  <Text style={mobileDetailStyles.claimAmount}>
                    {claimAmount}
                  </Text>
                  <Text style={mobileDetailStyles.claimStatus}>
                    {claimStatus}
                  </Text>
                </View>
              </View>
              <Text style={mobileDetailStyles.claimSubtext}>
                Star Health · CABG · Filed{"\n"}
                20 Aug 2024 · Rejection risk: 12%
              </Text>

              {/* AI banner */}
              <View style={mobileDetailStyles.aiBanner}>
                <Text style={mobileDetailStyles.aiBannerText}>
                  Analyzed by Kokoro AI · Trusted by Hospitals
                </Text>
                <Text style={mobileDetailStyles.aiBannerSub}>
                  6 issues found · ₹42,000 recovered · Expert reviewed
                </Text>
              </View>

              {/* View Document button */}
              <TouchableOpacity style={mobileDetailStyles.solidGreenBtn}>
                <Text style={mobileDetailStyles.solidGreenBtnText}>
                  View Document
                </Text>
              </TouchableOpacity>

              {/* Uploaded files */}
              <Text
                style={[
                  mobileDetailStyles.cellLabel,
                  { marginTop: 12, marginBottom: 6 },
                ]}
              >
                View Document uploaded
              </Text>
              {claimFiles.map((file, i) => (
                <View key={i} style={mobileDetailStyles.fileRow}>
                  <View style={mobileDetailStyles.fileIcon}>
                    <Text style={{ fontSize: 16 }}>📄</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={mobileDetailStyles.fileName}>{file.name}</Text>
                    <Text style={mobileDetailStyles.fileSize}>{file.size}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeClaimFile(i)}>
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontSize: 18,
                        paddingHorizontal: 8,
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <View style={{ alignItems: "flex-start", gap: 10 }}>
              <View style={mobileDetailStyles.fileIconBox}>
                <Text style={{ fontSize: 24 }}>📄</Text>
              </View>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                No insurance claim filed yet for this patient
              </Text>
              <TouchableOpacity
                style={mobileDetailStyles.solidGreenBtn}
                onPress={() => setClaimFiled(true)}
              >
                <Text style={mobileDetailStyles.solidGreenBtnText}>
                  File claim Now
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* ── Post Ops Care ── */}
      <View style={mobileDetailStyles.section}>
        <Text style={mobileDetailStyles.sectionTitle}>Post Ops Care</Text>
        <View style={mobileDetailStyles.claimBox}>
          {postOpFiles.length > 0 ? (
            <>
              {postOpFiles.map((file, i) => (
                <View key={i} style={mobileDetailStyles.fileRow}>
                  <View style={mobileDetailStyles.fileIcon}>
                    <Text style={{ fontSize: 16 }}>📄</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={mobileDetailStyles.fileName}>{file.name}</Text>
                    <Text style={mobileDetailStyles.fileSize}>{file.size}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setPostOpFiles((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontSize: 18,
                        paddingHorizontal: 8,
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <View style={{ alignItems: "flex-start", gap: 10 }}>
              <View style={mobileDetailStyles.fileIconBox}>
                <Text style={{ fontSize: 24 }}>📄</Text>
              </View>
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                Upload Prescription And reports & do{" "}
                <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                  AI-Powered Full Case Review
                </Text>
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[mobileDetailStyles.solidGreenBtn, { marginTop: 12 }]}
            onPress={() =>
              navigation && navigation.navigate("HospitalPostOpCare")
            }
          >
            <Text style={mobileDetailStyles.solidGreenBtnText}>
              Post Ops Care
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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

  // slideAnim: 0 = patient list full | 1 = detail panel open
  const slideAnim = useRef(new Animated.Value(0)).current;
  // formAnim: 0 = patient list | 1 = add patient form
  const formAnim = useRef(new Animated.Value(0)).current;

  const tabs = [
    { key: "opd_registration", label: "OPD Registration" },
    { key: "view", label: "View All Patients" },
    { key: "add_patients", label: "+ Add Patients" },
    // { key: "add_doctor", label: "+ Add Doctor" },
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
  // const openDetail = (patient) => {
  //   setSelectedPatient(patient);
  //   Animated.spring(slideAnim, {
  //     toValue: 1,
  //     useNativeDriver: false,
  //     tension: 60,
  //     friction: 10,
  //   }).start();
  // };

  // const closeDetail = () => {
  //   Animated.spring(slideAnim, {
  //     toValue: 0,
  //     useNativeDriver: false,
  //     tension: 60,
  //     friction: 10,
  //   }).start(() => setSelectedPatient(null));
  // };
  // ── Open / close patient detail panel ──
  const openDetail = (patient) => {
    if (Platform.OS !== "web") {
      // Mobile: inline accordion toggle
      setSelectedPatient((prev) => (prev?.id === patient.id ? null : patient));
    } else {
      // Web: side panel
      setSelectedPatient(patient);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 60,
        friction: 10,
      }).start();
    }
  };

  const closeDetail = () => {
    if (Platform.OS !== "web") {
      setSelectedPatient(null);
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 60,
        friction: 10,
      }).start(() => setSelectedPatient(null));
    }
  };

  // ── Open / close Add Patient form ──
  const openAddPatientForm = () => {
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

  const handleSavePatient = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    closeAddPatientForm();
  };

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

  // ── OPD REGISTRATION: now delegates fully to AbhaRegistration ──
  const renderOpdRegistration = () => (
    <View style={{ flex: 1, overflow: "hidden" }}>
      <AbhaRegistration
        onBack={() => {
          setActiveTab("view");
        }}
      />
    </View>
  );

  // ── MOBILE CARD (no animations here — overlays handle detail/form) ──
  const renderMobileCard = () => (
    <View style={styles.mobilePage}>
      {/* TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRowScroll}
        contentContainerStyle={styles.tabRow}
      >
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
      </ScrollView>

      {/* OPD Registration */}
      {activeTab === "opd_registration" && (
        <View style={{ flex: 1 }}>
          <AbhaRegistration onBack={() => setActiveTab("view")} />
        </View>
      )}

      {/* View All Patients */}
      {activeTab === "view" && (
        <>
          {/* Search + Filter + Add */}
          <View style={styles.mobileControlRow}>
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
                <Text
                  style={[styles.dropdownText, { fontSize: 12 }]}
                  numberOfLines={1}
                >
                  {selectedInsurer}
                </Text>
                <Text style={{ color: "#6B7280", marginLeft: 4, fontSize: 11 }}>
                  ▾
                </Text>
              </TouchableOpacity>
              {dropdownOpen && (
                <View style={[styles.dropdownMenu, { minWidth: 140 }]}>
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
            <TouchableOpacity
              style={styles.addBtn}
              onPress={openAddPatientForm}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Patient List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.listContainer}>
              {filteredPatients.map((patient, index) => {
                const isExpanded = selectedPatient?.id === patient.id;
                return (
                  <View key={patient.id}>
                    <TouchableOpacity
                      onPress={() => openDetail(patient)}
                      style={[
                        styles.mobilePatientRow,
                        !isExpanded &&
                          index < filteredPatients.length - 1 &&
                          styles.patientRowBorder,
                        isExpanded && {
                          backgroundColor: "#F0F6FF",
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      <Avatar initials={patient.initials} size={38} />
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
                        <Text
                          style={{ fontSize: 11, color: "#6B7280" }}
                          numberOfLines={1}
                        >
                          {patient.id} · Age {patient.age}
                        </Text>
                        <Text
                          style={{ fontSize: 11, color: "#9CA3AF" }}
                          numberOfLines={1}
                        >
                          {patient.insurer} · {patient.procedure}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            marginTop: 5,
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          <StatusBadge status={patient.status} />
                          <ClaimBadge count={patient.claims} />
                        </View>
                      </View>
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontSize: 18,
                          paddingLeft: 8,
                        }}
                      >
                        {isExpanded ? "∨" : "›"}
                      </Text>
                    </TouchableOpacity>

                    {/* Inline expanded detail */}
                    {isExpanded && (
                      <MobileInlineDetail
                        patient={patient}
                        navigation={navigation}
                      />
                    )}

                    {/* Bottom border after expanded block */}
                    {isExpanded && index < filteredPatients.length - 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: "#F1F5F9",
                          marginHorizontal: 0,
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Unlinked banner */}
            <View style={[styles.unlinkedBanner, { marginTop: 16 }]}>
              <Text
                style={{ color: "#92400E", fontSize: 12, fontWeight: "600" }}
              >
                ⚠️ Latest analyzed claims - not linked to a patient
              </Text>
            </View>
            <View style={styles.listContainer}>
              {UNLINKED.map((patient, index) => (
                <View
                  key={index}
                  style={[
                    styles.mobilePatientRow,
                    index < UNLINKED.length - 1 && styles.patientRowBorder,
                  ]}
                >
                  <Avatar initials={patient.initials} size={38} />
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
                    <Text style={{ fontSize: 11, color: "#6B7280" }}>
                      {patient.id} · Age {patient.age} · {patient.insurer} ·{" "}
                      {patient.procedure}
                    </Text>
                  </View>
                  <Text
                    style={{ color: "#9CA3AF", fontSize: 18, paddingLeft: 8 }}
                  >
                    ›
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ height: 30 }} />
          </ScrollView>
        </>
      )}
    </View>
  );

  // ── SHARED CARD CONTENT ──────────────────────────────────────
  const renderCard = () => (
    <View
      style={[
        styles.card,
        activeTab === "opd_registration" &&
          Platform.OS !== "web" &&
          styles.cardMobileOPD,
      ]}
    >
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
      {/* <View style={styles.tabRow}> */}
      {/* TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabRowScroll}
        contentContainerStyle={styles.tabRow}
      >
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
      </ScrollView>

      {/* SEARCH + FILTER + ADD BUTTON — hide when on OPD tab */}
      {activeTab !== "opd_registration" && (
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
      )}

      {/* ── BODY ── */}
      <View style={[styles.bodyRow, { overflow: "hidden" }]}>
        {activeTab === "opd_registration" ? (
          renderOpdRegistration()
        ) : (
          <>
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
                            {patient.id} · Age {patient.age} · {patient.insurer}{" "}
                            · {patient.procedure}
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
                      style={{
                        color: "#92400E",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
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
                          index < UNLINKED.length - 1 &&
                            styles.patientRowBorder,
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
                            {patient.id} · Age {patient.age} · {patient.insurer}{" "}
                            · {patient.procedure}
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
                          <Text style={{ fontSize: 14, color: "#6B7280" }}>
                            ⊙
                          </Text>
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
                key={toast.id || "form"}
                onSave={handleSavePatient}
                onSaveAndAnother={handleSaveAndAnother}
              />
            </Animated.View>
          </>
        )}
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
  // return (
  //   <SafeAreaView style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
  //     <View style={{ zIndex: 2 }}>
  //       <HeaderLoginSignUp navigation={navigation} />
  //     </View>
  //     <ScrollView
  //       contentContainerStyle={{ padding: 16, flexGrow: 1 }}
  //       showsVerticalScrollIndicator={false}
  //     >
  //       {renderCard()}
  //     </ScrollView>
  //   </SafeAreaView>
  // );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
      <View style={{ zIndex: 2 }}>
        <HeaderLoginSignUp navigation={navigation} />
      </View>
      <View style={{ flex: 1 }}>{renderMobileCard()}</View>

      {/* Mobile: Full-screen patient detail overlay */}
      {/* {selectedPatient && Platform.OS !== "web" && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "#fff",
              zIndex: 50,
              opacity: detailOpacity,
              transform: [{ translateX: detailTranslateX }],
            },
          ]}
        >
        
          <View style={styles.mobileDetailHeader}>
            <TouchableOpacity
              onPress={closeDetail}
              style={styles.mobileBackRow}
            >
              <Text style={styles.mobileBackArrow}>←</Text>
              <Text style={styles.mobileBackText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.mobileDetailTitle}>Patient Details</Text>
          </View>
          <PatientDetailPanel
            patient={selectedPatient}
            onClose={closeDetail}
            navigation={navigation}
          />
        </Animated.View>
      )} */}

      {/* Mobile: Full-screen add patient form overlay */}
      {/* {Platform.OS !== "web" && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "#fff",
              zIndex: 60,
              opacity: formOpacity,
              transform: [{ translateX: formTranslateX }],
            },
          ]}
          pointerEvents={isFormOpen ? "auto" : "none"}
        >
          
          <View style={styles.mobileDetailHeader}>
            <TouchableOpacity
              onPress={closeAddPatientForm}
              style={styles.mobileBackRow}
            >
              <Text style={styles.mobileBackArrow}>←</Text>
              <Text style={styles.mobileBackText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.mobileDetailTitle}>Add Patient</Text>
          </View>
          
          <AddPatientForm
            key={toast.id || "form"}
            onSave={handleSavePatient}
            onSaveAndAnother={handleSaveAndAnother}
            isMobile={true}
          />
        </Animated.View>
      )} */}
      {/* Mobile: Full-screen add patient form overlay */}
      {/* {Platform.OS !== "web" && isFormOpen && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            zIndex: 60,
            opacity: formOpacity,
            transform: [{ translateX: formTranslateX }],
          }}
          pointerEvents={isFormOpen ? "auto" : "none"}
        >
          <View style={styles.mobileFormTopBar}>
            <TouchableOpacity
              onPress={closeAddPatientForm}
              style={styles.mobileBackRow}
            >
              <Text style={styles.mobileBackArrow}>←</Text>
              <Text style={styles.mobileBackText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.mobileDetailTitle}>Add Patient</Text>
          </View>
          <AddPatientForm
            key={toast.id || "form"}
            onSave={handleSavePatient}
            onSaveAndAnother={handleSaveAndAnother}
            isMobile={true}
          />
        </Animated.View>
      )} */}
      {/* Mobile: Full-screen add patient form overlay */}
      {Platform.OS !== "web" && isFormOpen && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            zIndex: 60,
            opacity: formOpacity,
            transform: [{ translateX: formTranslateX }],
            flexDirection: "column",
          }}
          pointerEvents={isFormOpen ? "auto" : "none"}
        >
          {/* Spacer to push content below HeaderLoginSignUp */}
          <View style={{ backgroundColor: "#fff" }}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>

          {/* Form top bar */}
          <View style={styles.mobileFormTopBar}>
            <TouchableOpacity
              onPress={closeAddPatientForm}
              style={styles.mobileBackRow}
            >
              <Text style={styles.mobileBackArrow}>←</Text>
              <Text style={styles.mobileBackText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.mobileDetailTitle}>Add Patient</Text>
          </View>

          {/* Form content */}
          <View style={{ flex: 1 }}>
            <AddPatientForm
              key={toast.id || "form"}
              onSave={handleSavePatient}
              onSaveAndAnother={handleSaveAndAnother}
              isMobile={true}
            />
          </View>
        </Animated.View>
      )}

      <SuccessToast
        visible={toast.visible}
        patientName={toast.name}
        patientId={toast.id}
        onDismiss={dismissToast}
      />
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
  header: { marginBottom: 0 },
  // ── CARD
  // card: {
  //   backgroundColor: "#fff",
  //   borderRadius: 12,
  //   width: "95%",
  //   alignSelf: "center",
  //   zIndex: 5,
  //   height: "85vh",
  //   overflow: "hidden",
  //   flexDirection: "column",
  // },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    overflow: "hidden",
    flexDirection: "column",
    // On mobile web height:85vh may be too small; flex:1 handled by parent
    minHeight: 500,
  },
  cardMobileOPD: {
    flex: 1,
    width: "100%",
    borderRadius: 0,
    height: "100%",
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
  // tabRow: {
  //   flexDirection: "row",
  //   paddingHorizontal: 24,
  //   borderBottomWidth: 1,
  //   borderBottomColor: "#e5e7eb",
  // },
  tabRowScroll: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexGrow: 0,
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    alignItems: "center",
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
  formRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
    zIndex: 1,
    overflow: "visible",
  },
  formGroup: { flex: 1, position: "relative", overflow: "visible" },
  formLabel: {
    fontSize: 12,
    color: "#111111ff",
    marginBottom: 5,
    fontWeight: "500",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#080808ff",
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
    zIndex: 9999,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 20,
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

  // ── MOBILE SPECIFIC
  mobilePage: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  mobileControlRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 10,
  },
  mobilePatientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  mobileDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
    paddingTop: 48,
  },
  mobileBackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  mobileBackArrow: {
    fontSize: 20,
    color: "#2563EB",
    marginRight: 4,
  },
  mobileBackText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  // mobileDetailTitle: {
  //   fontSize: 16,
  //   fontWeight: "600",
  //   color: "#111827",
  //   flex: 1,
  // },
  mobileDetailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  mobileFormTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginTop: 0,
  },
});
const mobileDetailStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  detailBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginBottom: 10,
  },
  detailCell: {
    minWidth: "45%",
    flex: 1,
    marginBottom: 12,
    paddingRight: 8,
  },
  cellLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
    marginBottom: 8,
  },
  outlineBtnText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  solidBlueBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  solidBlueBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  solidGreenBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    width: "100%",
  },
  solidGreenBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
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
  },
  doctorMenu: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    zIndex: 50,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  doctorMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  claimBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    minHeight: 100,
  },
  claimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  claimId: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  claimAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  claimStatus: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
    textAlign: "right",
  },
  claimSubtext: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 10,
    lineHeight: 16,
  },
  aiBanner: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  aiBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D4ED8",
    marginBottom: 2,
  },
  aiBannerSub: {
    fontSize: 11,
    color: "#3B82F6",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  fileIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fileName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  fileSize: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
// ─── MOBILE FORM STYLES ───────────────────────────────────────
const mobileFormStyles = StyleSheet.create({
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputDisabled: {
    color: "#9CA3AF",
    backgroundColor: "#F9FAFB",
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  selectMenu: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    zIndex: 9999,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  selectMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  importLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
    marginTop: 6,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 12,
  },
  downloadBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  downloadBtnText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  downloadHint: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 20,
  },
  savedPill: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  savedPillText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  saveAnotherBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  saveAnotherBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HospitalPatientManagement;
