import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import { API_URL } from "../../env-vars";
import PreAuthMediAssistCombinedForms from "../../screens/HospitalScreens/PreAuthMediAssistCombinedForms";

// ─── STEPS ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Choose Patient", sub: "Select patient" },
  { id: 2, label: "Service Info", sub: "Provider & Service" },
  { id: 3, label: "Medical Codes", sub: "ICD-10 & CPT" },
  { id: 4, label: "Review & Verify", sub: "Eligibility check" },
  { id: 5, label: "PreAuth Status", sub: "Submitted" },
];

const URGENCY_OPTIONS = [
  { label: "Routine", value: "Routine" },
  { label: "Urgent", value: "Urgent" },
  { label: "Emergent", value: "Emergent" },
];

const isFormValuePresent = (value) => {
  if (value == null) return false;
  const text = String(value).trim();
  return text !== "" && text !== "—" && text !== "-";
};

const firstFilled = (...values) =>
  values.find((value) => isFormValuePresent(value)) ?? "";

const rawPatientFrom = (patient) =>
  patient?.rawPatient || patient?.user || patient || {};

const buildPreAuthAnalysisData = ({
  patient,
  updatedUser,
  diagnosisSummary,
  diagnosisCodes,
  procedureCodes,
  serviceFormData,
}) => {
  const selectedRaw = rawPatientFrom(patient);
  const selected = patient || {};
  const user = { ...selectedRaw, ...(updatedUser || {}) };
  const diagCodes = Array.isArray(diagnosisCodes) ? diagnosisCodes : [];
  const procCodes = Array.isArray(procedureCodes) ? procedureCodes : [];
  const service = serviceFormData || {};

  const patientName = firstFilled(
    user.name,
    selected.name,
    user.patient_name,
    user.full_name,
  );
  const insurer = firstFilled(
    service.insurer,
    user.insurer,
    user.insurance_provider,
    selected.insurer,
  );
  const policyNumber = firstFilled(
    user.policy_number,
    user.policyNumber,
    selected.policyNumber,
    selected.policyId,
    user.policy_id,
  );
  const memberId = firstFilled(
    user.member_id,
    user.memberId,
    selected.memberId,
    user.user_id,
    selected.user_id,
  );
  const primaryDiagnosis = firstFilled(
    diagnosisSummary?.primary_diagnosis,
    user.primary_diagnosis,
    diagCodes[0]?.label,
    selected.procedure,
    service.serviceType,
  );
  const primaryIcdCode = firstFilled(
    diagnosisSummary?.primary_icd_code,
    user.primary_icd_code,
    diagCodes[0]?.id,
  );
  const additionalDiagnosis = firstFilled(
    diagnosisSummary?.additional_diagnosis,
    user.additional_diagnosis,
    diagCodes[1]?.label,
  );
  const additionalIcdCode = firstFilled(
    diagnosisSummary?.additional_icd_code,
    user.additional_icd_code,
    diagCodes[1]?.id,
  );
  const serviceType = firstFilled(
    service.serviceType,
    selected.service,
    selected.procedure,
    procCodes[0]?.label,
  );
  const urgencyLevel = firstFilled(service.urgencyLevel, "Routine");
  const isEmergency = String(urgencyLevel).toLowerCase() === "emergent";
  const hospitalName = firstFilled(user.hospital_name, selected.hospitalName);
  const doctorName = firstFilled(
    service.provider,
    user.provider,
    user.doctor_name,
    selected.provider,
  );
  const claimedAmount = firstFilled(
    user.claimed_amount,
    user.bill_amount,
    user.estimated_amount,
    service.estimatedAmount,
  );

  return {
    flow: "preauth_patient",
    patient_data: user,
    preauth_context: {
      urgencyLevel,
      serviceType,
      diagnosisCodes: diagCodes,
      procedureCodes: procCodes,
    },
    structured_data: {
      source_filename: `PreAuth_MediAssist_${patientName || "Patient"}.pdf`,
      patient_details: {
        name: patientName,
        age: firstFilled(user.age, selected.age),
        gender: firstFilled(user.gender, selected.gender),
        phone: firstFilled(
          user.phone,
          user.phoneNumber,
          user.phone_number,
          selected.phoneNumber,
        ),
        phone_secondary: firstFilled(
          user.phone_secondary,
          user.alt_phone,
          user.alternate_phone,
        ),
        email: firstFilled(user.email),
        date_of_birth: firstFilled(user.date_of_birth, user.dob),
        address: firstFilled(user.address, user.full_address),
        city: firstFilled(user.city),
        state: firstFilled(user.state),
        pin_code: firstFilled(user.pin_code, user.pincode, user.zip),
        relationship_to_insured: firstFilled(
          user.relationship_to_insured,
          user.relationship,
        ),
        occupation: firstFilled(user.occupation),
        employee_id: firstFilled(user.employee_id),
      },
      insurance_details: {
        policy_number: policyNumber,
        insurance_company: insurer,
        tpa_name: firstFilled(
          user.tpa_name,
          user.tpa,
          String(insurer).toLowerCase().includes("medi") ? "Medi Assist" : "",
        ),
        insurer_id_card: memberId,
        certificate_number: firstFilled(user.certificate_number, memberId),
        employee_id: firstFilled(user.employee_id),
      },
      hospital_details: {
        hospital_name: hospitalName,
        hospital_id: firstFilled(user.hospital_id),
        hospital_city: firstFilled(user.hospital_city, user.city),
        hospital_state: firstFilled(user.hospital_state, user.state),
        hospital_phone: firstFilled(user.hospital_phone),
        hospital_email: firstFilled(user.hospital_email),
        treating_doctor: doctorName,
        doctor_phone: firstFilled(
          user.doctor_phone,
          user.treating_doctor_phone,
        ),
        admission_type: isEmergency ? "emergency" : "planned",
        type_of_admission: isEmergency ? "emergency" : "planned",
        pre_auth_obtained: "no",
        room_category: firstFilled(user.room_category, user.room_type),
      },
      diagnosis_and_procedures: {
        primary_diagnosis: primaryDiagnosis,
        primary_icd_code: primaryIcdCode,
        additional_diagnosis: additionalDiagnosis,
        additional_icd_code: additionalIcdCode,
        procedure_1: firstFilled(procCodes[0]?.label, serviceType),
        procedure_1_icd_pcs: firstFilled(procCodes[0]?.id),
        procedure_2: firstFilled(procCodes[1]?.label),
        procedure_2_icd_pcs: firstFilled(procCodes[1]?.id),
        procedure_3: firstFilled(procCodes[2]?.label),
        procedure_3_icd_pcs: firstFilled(procCodes[2]?.id),
        procedure_details: serviceType,
        hospitalization_cause: primaryDiagnosis,
        proposed_line_surgical_management: procCodes.length > 0,
        proposed_line_medical_management: procCodes.length === 0,
        is_planned_hospitalization: !isEmergency,
        is_emergency_hospitalization: isEmergency,
      },
      claim_details: {
        claimed_amount: claimedAmount,
        bill_amount: claimedAmount,
      },
      bank_details: {
        pan: firstFilled(user.pan),
        account_number: firstFilled(user.account_number),
        bank_name: firstFilled(user.bank_name, user.bank_name_branch),
        branch: firstFilled(user.branch),
        ifsc_code: firstFilled(user.ifsc_code),
        account_holder: firstFilled(user.account_holder, patientName),
      },
      document_metadata: {
        document_date: new Date().toISOString(),
        source: "hospital-preauth",
      },
    },
  };
};

// ─── DEFAULT CODES ────────────────────────────────────────────────────────────
// const ALL_DIAGNOSIS_CODES = [
//   {
//     id: "K63.5",
//     label: "Polyp of colon",
//     ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
//   },
//   {
//     id: "Z12.11",
//     label: "Encounter for screening for malignant neoplasm of colon",
//     ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
//   },
//   {
//     id: "I25.10",
//     label: "Atherosclerotic heart disease of native coronary artery",
//     ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
//   },
//   {
//     id: "J18.9",
//     label: "Pneumonia, unspecified organism",
//     ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
//   },
//   {
//     id: "E11.9",
//     label: "Type 2 diabetes mellitus without complications",
//     ref: "Ref: TX-I-EX-H-CC-EOC-26 v2024.1, Covered Services · Claims Coding Requirements, Page 44",
//   },
// ];

// const ALL_PROCEDURE_CODES = [
//   { id: "45380", label: "Colonoscopy with biopsy" },
//   { id: "45385", label: "Colonoscopy with polypectomy" },
//   { id: "93510", label: "Left heart catheterization" },
//   { id: "27447", label: "Total knee arthroplasty" },
//   { id: "61510", label: "Craniotomy, trephination, bone flap craniotomy" },
// ];

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
        Age {patient.age} · {patient.gender} · {patient.procedure}
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
        Age {patient.age} · {patient.gender} · {patient.procedure}
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

const DropdownField = ({
  label,
  required,
  value,
  onSelect,
  options,
  placeholder,
  loading,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 16, zIndex: open ? 100 : 1 }}>
      <Text style={sif.label}>
        {label} {required && <Text style={{ color: "#DC2626" }}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[sif.inputBox, sif.selectBox]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text
          style={[sif.input, { flex: 1, color: value ? "#374151" : "#9CA3AF" }]}
        >
          {loading ? "Loading..." : value || placeholder}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color="#6B7280"
        />
      </TouchableOpacity>

      {open && (
        <View style={dd.menu}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
            {options.length === 0 ? (
              <Text style={dd.emptyText}>No options available</Text>
            ) : (
              options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={dd.item}
                  onPress={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                >
                  <Text style={dd.itemText}>{opt.label}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP FORMS
// ═══════════════════════════════════════════════════════════════════════════════

// const ServiceInfoForm = ({ patient, onNext, onPrevious }) => {
//   const [insuranceProvider, setInsuranceProvider] = useState(
//     patient?.insurer || "Star Health",
//   );
//   const [urgencyLevel, setUrgencyLevel] = useState("Routine");
//   const [orderingProvider, setOrderingProvider] = useState(
//     patient?.provider || "Dr Rajesh Gupta",
//   );
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
//           Ordering / Rendering Provider{" "}
//           <Text style={{ color: "#DC2626" }}>*</Text>
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
// const ServiceInfoForm = ({ patient, onNext, onPrevious }) => {
//   const [insuranceProvider, setInsuranceProvider] = useState(
//     patient?.insurer !== "—" ? patient?.insurer : "",
//   );
//   const [urgencyLevel, setUrgencyLevel] = useState("Routine");
//   const [orderingProvider, setOrderingProvider] = useState(
//     patient?.provider !== "—" ? patient?.provider : "",
//   );
//   const [serviceType, setServiceType] = useState("");

//   const handleNext = () => {
//     // Pass collected values up so parent can use them in update call
//     onNext({
//       insurer: insuranceProvider,
//       urgencyLevel,
//       provider: orderingProvider,
//       serviceType,
//     });
//   };

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
//           Ordering / Rendering Provider{" "}
//           <Text style={{ color: "#DC2626" }}>*</Text>
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
//         <TouchableOpacity style={sif.nextBtn} onPress={handleNext}>
//           <Text style={sif.nextText}>Next</Text>
//           <Feather name="arrow-right" size={14} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };
const ServiceInfoForm = ({
  patient,
  doctors,
  doctorsLoading,
  onNext,
  onPrevious,
}) => {
  // Pre-populate insurer from patient; fall back to empty
  const [insuranceProvider, setInsuranceProvider] = useState(
    patient?.insurer !== "—" ? patient?.insurer || "" : "",
  );
  const [urgencyLevel, setUrgencyLevel] = useState("Routine");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [serviceType, setServiceType] = useState("");

  // Pre-select doctor if patient already has one linked
  useEffect(() => {
    if (doctors.length === 1) {
      setSelectedDoctor(doctors[0]);
    }
  }, [doctors]);

  const doctorOptions = doctors.map((d) => ({
    label: d.doctorname,
    value: d.doctor_id,
    raw: d,
  }));

  const handleNext = () => {
    onNext({
      insurer: insuranceProvider,
      urgencyLevel,
      provider: selectedDoctor?.doctorname || "",
      doctorId: selectedDoctor?.doctor_id || "",
      serviceType,
    });
  };

  return (
    <View style={sif.container}>
      <Text style={sif.sectionTitle}>Service information</Text>

      {/* Insurer — plain text, pre-filled from patient */}
      <View style={sif.row}>
        <View style={sif.fieldHalf}>
          <Text style={sif.label}>
            Insurance Provider <Text style={{ color: "#DC2626" }}>*</Text>
          </Text>
          <View style={sif.inputBox}>
            <TextInput
              value={insuranceProvider}
              onChangeText={setInsuranceProvider}
              placeholder="e.g. Star Health"
              placeholderTextColor="#9CA3AF"
              style={sif.input}
            />
          </View>
        </View>

        {/* Urgency — real dropdown */}
        <View style={[sif.fieldHalf, { zIndex: 200 }]}>
          <DropdownField
            label="Urgency Level"
            required
            value={urgencyLevel}
            placeholder="Select urgency"
            options={URGENCY_OPTIONS}
            onSelect={(opt) => setUrgencyLevel(opt.value)}
          />
        </View>
      </View>

      {/* Doctor — pulled from API */}
      <View style={{ zIndex: 100 }}>
        <DropdownField
          label="Ordering / Rendering Provider"
          required
          value={selectedDoctor?.doctorname || ""}
          placeholder={doctorsLoading ? "Loading doctors..." : "Select doctor"}
          options={doctorOptions}
          loading={doctorsLoading}
          onSelect={(opt) => setSelectedDoctor(opt.raw)}
        />
      </View>

      {/* Service type — free text for now */}
      <View style={sif.field}>
        <Text style={sif.label}>Service Type / Procedure</Text>
        <View style={sif.inputBox}>
          <TextInput
            value={serviceType}
            onChangeText={setServiceType}
            placeholder="e.g. Cardiac catheterization"
            placeholderTextColor="#9CA3AF"
            style={sif.input}
          />
        </View>
      </View>

      <View style={sif.btnRow}>
        <TouchableOpacity style={sif.prevBtn} onPress={onPrevious}>
          <Feather name="arrow-left" size={14} color="#374151" />
          <Text style={sif.prevText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={sif.nextBtn} onPress={handleNext}>
          <Text style={sif.nextText}>Next</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// const MedicalCodesForm = ({
//   diagnosisCodes,
//   procedureCodes,
//   setDiagnosisCodes,
//   setProcedureCodes,
//   onNext,
//   onPrevious,
// }) => {
//   const [clinicalNotes, setClinicalNotes] = useState(
//     "Patient with chest pain and positive stress test. Cardiac catheterization recommended to evaluate coronary artery disease and determine need for intervention.",
//   );
//   const [diagSearch, setDiagSearch] = useState("");
//   const [cptSearch, setCptSearch] = useState("");

//   const removeDiagnosis = (id) =>
//     setDiagnosisCodes((prev) => prev.filter((c) => c.id !== id));
//   const removeProcedure = (id) =>
//     setProcedureCodes((prev) => prev.filter((c) => c.id !== id));

//   return (
//     <View style={mc.container}>
//       <Text style={mc.sectionTitle}>Medical Codes</Text>
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
//         {["CMS ICD-10 Codes", "CMS ICD-10 CM", "AMA CPT Codes"].map((link) => (
//           <TouchableOpacity key={link} style={mc.resourceLink}>
//             <Text style={mc.resourceLinkText}>{link}</Text>
//             <Feather
//               name="external-link"
//               size={11}
//               color="#2563EB"
//               style={{ marginLeft: 3 }}
//             />
//           </TouchableOpacity>
//         ))}
//       </View>
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
//           placeholder="Describe patient's condition..."
//         />
//       </View>
//       <TouchableOpacity style={mc.aiBtn}>
//         <Feather name="zap" size={15} color="#fff" style={{ marginRight: 8 }} />
//         <Text style={mc.aiBtnText}>AI Suggested ICD Codes</Text>
//       </TouchableOpacity>
//       <View style={mc.field}>
//         <View style={mc.codeHeaderRow}>
//           <Text style={mc.fieldLabel}>
//             Diagnosis Codes (ICD-10) <Text style={{ color: "#DC2626" }}>*</Text>
//           </Text>
//           <TouchableOpacity style={mc.refLink}>
//             <Text style={mc.refLinkText}>CMS Reference</Text>
//             <Feather
//               name="external-link"
//               size={11}
//               color="#2563EB"
//               style={{ marginLeft: 3 }}
//             />
//           </TouchableOpacity>
//         </View>
//         <View style={mc.searchBox}>
//           <Feather
//             name="search"
//             size={13}
//             color="#9CA3AF"
//             style={{ marginRight: 8 }}
//           />
//           <TextInput
//             style={mc.searchInput}
//             value={diagSearch}
//             onChangeText={setDiagSearch}
//             placeholder="Search ICD-10"
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>
//         <CodeList codes={diagnosisCodes} onRemove={removeDiagnosis} />
//       </View>
//       <View style={mc.field}>
//         <View style={mc.codeHeaderRow}>
//           <Text style={mc.fieldLabel}>Procedure Codes (CPT)</Text>
//           <TouchableOpacity style={mc.refLink}>
//             <Text style={mc.refLinkText}>AMA Reference</Text>
//             <Feather
//               name="external-link"
//               size={11}
//               color="#2563EB"
//               style={{ marginLeft: 3 }}
//             />
//           </TouchableOpacity>
//         </View>
//         <View style={mc.searchBox}>
//           <Feather
//             name="search"
//             size={13}
//             color="#9CA3AF"
//             style={{ marginRight: 8 }}
//           />
//           <TextInput
//             style={mc.searchInput}
//             value={cptSearch}
//             onChangeText={setCptSearch}
//             placeholder="Search CPT codes..."
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>
//         <CodeList codes={procedureCodes} onRemove={removeProcedure} />
//       </View>
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

const MedicalCodesForm = ({
  diagnosisCodes,
  procedureCodes,
  setDiagnosisCodes,
  setProcedureCodes,
  onNext,
  onPrevious,
  onAiSuggest,
  aiLoading,
  aiError,
}) => {
  const [diagSearch, setDiagSearch] = useState("");
  const [cptSearch, setCptSearch] = useState("");

  const removeDiagnosis = (id) =>
    setDiagnosisCodes((prev) => prev.filter((c) => c.id !== id));
  const removeProcedure = (id) =>
    setProcedureCodes((prev) => prev.filter((c) => c.id !== id));

  const filteredDiag = diagnosisCodes.filter(
    (c) =>
      c.id.toLowerCase().includes(diagSearch.toLowerCase()) ||
      c.label.toLowerCase().includes(diagSearch.toLowerCase()),
  );
  const filteredCpt = procedureCodes.filter(
    (c) =>
      c.id.toLowerCase().includes(cptSearch.toLowerCase()) ||
      c.label.toLowerCase().includes(cptSearch.toLowerCase()),
  );

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

      {/* AI Button — no clinical notes needed */}
      <TouchableOpacity
        style={[mc.aiBtn, aiLoading && { opacity: 0.6 }]}
        onPress={() => onAiSuggest()}
        disabled={aiLoading}
      >
        <Feather name="zap" size={15} color="#fff" style={{ marginRight: 8 }} />
        <Text style={mc.aiBtnText}>
          {aiLoading ? "Fetching Codes..." : "AI Suggested ICD Codes"}
        </Text>
      </TouchableOpacity>

      {aiError && (
        <Text style={{ color: "#DC2626", fontSize: 12, marginBottom: 12 }}>
          {aiError}
        </Text>
      )}

      {/* Diagnosis Codes */}
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
        {filteredDiag.length > 0 ? (
          <CodeList codes={filteredDiag} onRemove={removeDiagnosis} />
        ) : (
          <View style={mc.emptyCodesBox}>
            <Text style={mc.emptyCodesText}>
              No diagnosis codes yet. Use AI Suggest or add manually.
            </Text>
          </View>
        )}
      </View>

      {/* Procedure Codes */}
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
        {filteredCpt.length > 0 ? (
          <CodeList codes={filteredCpt} onRemove={removeProcedure} />
        ) : (
          <View style={mc.emptyCodesBox}>
            <Text style={mc.emptyCodesText}>
              No procedure codes yet. Click &quot;AI Suggested ICD Codes&quot;
              to fetch from patient documents.
            </Text>
          </View>
        )}
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
  onNext, // now async — triggers update call
  onPrevious,
  updateLoading,
  updateError,
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

        {updateError && (
          <Text
            style={{
              color: "#DC2626",
              fontSize: 12,
              flex: 1,
              textAlign: "center",
            }}
          >
            {updateError}
          </Text>
        )}

        <TouchableOpacity
          style={[rv.nextBtn, updateLoading && { opacity: 0.6 }]}
          onPress={onNext}
          disabled={updateLoading}
        >
          <Text style={rv.nextText}>
            {updateLoading ? "Submitting..." : "Submit"}
          </Text>
          {!updateLoading && (
            <Feather name="arrow-right" size={14} color="#fff" />
          )}
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
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({});
  const [preAuthAnalysisData, setPreAuthAnalysisData] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [diagnosisSummary, setDiagnosisSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // ── Lifted state: shared between Step 3 → Step 4 ──────────────────────────
  const [diagnosisCodes, setDiagnosisCodes] = useState([]); // ✅ start empty, filled from API
  const [procedureCodes, setProcedureCodes] = useState([]); // ✅ start empty, filled from AI suggest

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

  // const handleSelectPatient = async (patient, animRef) => {
  //   setSelectedPatient(patient);
  //   fetchDoctorsForPatient(patient.memberId);

  //   // Fetch diagnosis summary and pre-populate codes
  //   const summary = await fetchDiagnosisSummary(patient.user_id);
  //   setDiagnosisSummary(summary);

  //   if (summary) {
  //     const newDiagCodes = [];

  //     if (summary.primary_icd_code && summary.primary_diagnosis) {
  //       newDiagCodes.push({
  //         id: summary.primary_icd_code,
  //         label: summary.primary_diagnosis,
  //         ref: `Auto-populated from Medilocker · Updated ${
  //           summary.diagnosis_updated_at
  //             ? new Date(summary.diagnosis_updated_at).toLocaleDateString()
  //             : "—"
  //         }`,
  //       });
  //     }

  //     if (summary.additional_icd_code && summary.additional_diagnosis) {
  //       newDiagCodes.push({
  //         id: summary.additional_icd_code,
  //         label: summary.additional_diagnosis,
  //         ref: `Auto-populated from Medilocker · Updated ${
  //           summary.diagnosis_updated_at
  //             ? new Date(summary.diagnosis_updated_at).toLocaleDateString()
  //             : "—"
  //         }`,
  //       });
  //     }

  //     // Only replace if we actually got codes back
  //     if (newDiagCodes.length > 0) {
  //       setDiagnosisCodes(newDiagCodes);
  //     } else {
  //       setDiagnosisCodes([]); // no hardcoded fallback
  //     }
  //   } else {
  //     setDiagnosisCodes([]); // no diagnosis data yet
  //   }

  //   setProcedureCodes([]); // no hardcoded CPT codes
  //   setCurrentStep(2);
  //   animateSlide(animRef, "right");
  // };

  const handleSelectPatient = async (patient, animRef) => {
    setSelectedPatient(patient);
    setPreAuthAnalysisData(null);
    fetchDoctorsForPatient(patient.memberId);

    // Fetch both sources in parallel
    const [summary, autofillCodes] = await Promise.all([
      fetchDiagnosisSummary(patient.user_id),
      fetchInsuranceAutofillCodes(patient.user_id),
    ]);

    setDiagnosisSummary(summary);

    const newDiagCodes = [];

    // Source 1: diagnosis-summary
    if (summary?.primary_icd_code && summary?.primary_diagnosis) {
      newDiagCodes.push({
        id: summary.primary_icd_code,
        label: summary.primary_diagnosis,
        ref: `Auto-populated from Medilocker · Updated ${
          summary.diagnosis_updated_at
            ? new Date(summary.diagnosis_updated_at).toLocaleDateString()
            : "—"
        }`,
      });
    }
    if (summary?.additional_icd_code && summary?.additional_diagnosis) {
      newDiagCodes.push({
        id: summary.additional_icd_code,
        label: summary.additional_diagnosis,
        ref: `Auto-populated from Medilocker · Updated ${
          summary.diagnosis_updated_at
            ? new Date(summary.diagnosis_updated_at).toLocaleDateString()
            : "—"
        }`,
      });
    }

    // Source 2: insurance autofill — merge, skip duplicates by id
    const existingIds = new Set(newDiagCodes.map((c) => c.id));
    for (const code of autofillCodes) {
      if (!existingIds.has(code.id)) {
        newDiagCodes.push(code);
        existingIds.add(code.id);
      }
    }

    setDiagnosisCodes(newDiagCodes.length > 0 ? newDiagCodes : []);
    setProcedureCodes([]);
    setCurrentStep(2);
    animateSlide(animRef, "right");
  };

  const handleAiSuggestCodes = async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setAiError("Not authenticated.");
        return;
      }

      if (!selectedPatient?.user_id) {
        setAiError("No patient selected.");
        return;
      }

      const res = await fetch(
        `${API_URL}/medilocker/users/${selectedPatient.user_id}/insurance/autofill-stored`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setAiError(
            "No uploaded documents found for this patient. Ask them to upload documents via the patient app first.",
          );
        } else {
          setAiError(errData.message || `Server error ${res.status}`);
        }
        return;
      }

      const data = await res.json();
      const diagnosisAndProcs =
        data?.autofill_extracted?.diagnosis_and_procedures || {};
      const newDiagCodes = [];

      if (
        diagnosisAndProcs.primary_icd_code &&
        diagnosisAndProcs.primary_diagnosis
      ) {
        newDiagCodes.push({
          id: diagnosisAndProcs.primary_icd_code,
          label: diagnosisAndProcs.primary_diagnosis,
          ref: "Extracted from patient documents via Kokoro AI",
        });
      }

      if (
        diagnosisAndProcs.additional_icd_code &&
        diagnosisAndProcs.additional_diagnosis
      ) {
        newDiagCodes.push({
          id: diagnosisAndProcs.additional_icd_code,
          label: diagnosisAndProcs.additional_diagnosis,
          ref: "Extracted from patient documents via Kokoro AI",
        });
      }

      if (Array.isArray(diagnosisAndProcs.icd_codes)) {
        for (const code of diagnosisAndProcs.icd_codes) {
          const id = code?.code || code?.icd_code || code?.id || code;
          const label =
            code?.description || code?.diagnosis || code?.label || id;
          if (id && typeof id === "string") {
            newDiagCodes.push({
              id,
              label,
              ref: "Extracted from patient documents via Kokoro AI",
            });
          }
        }
      }

      const newProcCodes = [];
      if (Array.isArray(diagnosisAndProcs.cpt_codes)) {
        for (const code of diagnosisAndProcs.cpt_codes) {
          const id = code?.code || code?.cpt_code || code?.id || code;
          const label =
            code?.description || code?.procedure || code?.label || id;
          if (id && typeof id === "string") {
            newProcCodes.push({ id, label });
          }
        }
      }

      const existingDiagIds = new Set(diagnosisCodes.map((c) => c.id));
      const freshDiag = newDiagCodes.filter((c) => !existingDiagIds.has(c.id));

      const existingProcIds = new Set(procedureCodes.map((c) => c.id));
      const freshProc = newProcCodes.filter((c) => !existingProcIds.has(c.id));

      if (newDiagCodes.length === 0 && newProcCodes.length === 0) {
        setAiError(
          "No ICD codes found in patient documents. Ensure the patient has uploaded discharge summary or claim documents.",
        );
        return;
      }

      if (newDiagCodes.length > 0)
        setDiagnosisCodes([...diagnosisCodes, ...freshDiag]);
      if (newProcCodes.length > 0)
        setProcedureCodes([...procedureCodes, ...freshProc]);
    } catch (err) {
      console.error("[AI Suggest] Network error:", err);
      setAiError("Network error. Check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
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

  // Helper: build initials + avatar color from name
  const getAvatarProps = useCallback((name = "") => {
    const parts = name.trim().split(" ");
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (parts[0]?.[0] || "?").toUpperCase();

    const COLORS = [
      { color: "#FEE2E2", textColor: "#DC2626" },
      { color: "#DBEAFE", textColor: "#2563EB" },
      { color: "#D1FAE5", textColor: "#059669" },
      { color: "#FEF3C7", textColor: "#D97706" },
      { color: "#EDE9FE", textColor: "#7C3AED" },
    ];
    // Pick color deterministically based on first char
    const idx = (name.charCodeAt(0) || 0) % COLORS.length;
    return { initials, ...COLORS[idx] };
  }, []);

  // Map raw API patient → shape your UI expects
  // const mapApiPatient = (apiPatient) => {
  //   const { initials, color, textColor } = getAvatarProps(apiPatient.name);
  //   return {
  //     // id: apiPatient.user_id,
  //     name: apiPatient.name || "Unknown",
  //     age: apiPatient.age ?? "—",
  //     gender: apiPatient.gender || "—",
  //     procedure: apiPatient.procedure || "—",
  //     status: apiPatient.status || "Eligible",
  //     initials,
  //     color,
  //     textColor,
  //     insurer: apiPatient.insurer || apiPatient.insurance_provider || "—",
  //     memberId: apiPatient.member_id || apiPatient.user_id,
  //     policyId: apiPatient.policy_id || `POL-${apiPatient.user_id}`,
  //     policyVersion: apiPatient.policy_version || "2024.1",
  //     provider: apiPatient.provider || "—",
  //     providerNPI: apiPatient.provider_npi || "—",
  //     providerOrg: apiPatient.provider_org || "—",
  //     service: apiPatient.service || apiPatient.procedure || "—",
  //     phoneNumber: apiPatient.phoneNumber || "—",
  //     hospitalName: apiPatient.hospital_name || "—",
  //   };
  // };
  const mapApiPatient = (apiPatient) => {
    // API returns nested: { user: {...}, relations: [...] }
    const p = apiPatient.user || apiPatient; // unwrap nested user object

      const id = p.user_id || p.id || p._id;
      const rawName =
        p.name || p.patient_name || p.full_name || `Patient-${id}`;
      const policyNumber = firstFilled(
        p.policy_number,
        p.policyNumber,
        p.policy_id,
      );
      const memberId = firstFilled(p.member_id, p.memberId, p.user_id, id);

      const { initials, color, textColor } = getAvatarProps(rawName);
      return {
        ...p,
        id: id,
        user_id: id,
        rawPatient: p,
        name: rawName,
        age: p.age ?? "—",
        gender: p.gender || "—",
        procedure:
          p.procedure ||
          p.service ||
          p.service_type ||
          p.primary_diagnosis ||
          "—",
        status: p.status || "Eligible",
        initials,
        color,
        textColor,
        insurer: p.insurer || p.insurance_provider || "—",
        memberId: memberId || id,
        policyId: policyNumber || p.policy_id || `POL-${id}`,
        policyNumber,
        policyVersion: p.policy_version || "2024.1",
        provider: p.provider || "—",
        providerNPI: p.provider_npi || "—",
        providerOrg: p.provider_org || "—",
        service: p.service || p.procedure || "—",
        phoneNumber: p.phoneNumber || p.phone_number || "—",
        hospitalName: p.hospital_name || "—",
      };
    },
    [getAvatarProps],
  );

  const fetchPatients = useCallback(
    async (cursor = null) => {
      try {
        setPatientsLoading(true);
        setPatientsError(null);

        // Get token + hospital_id stored at login
        const token = await AsyncStorage.getItem("token");
        const hospitalId = await AsyncStorage.getItem("hospital_id");

        // ADD THESE:
        console.log("TOKEN:", token);
        console.log("HOSPITAL_ID:", hospitalId);

        if (!token || !hospitalId) {
          setPatientsError("Not authenticated. Please log in again.");
          return;
        }

        const params = new URLSearchParams({ limit: "50" });
        if (cursor) params.append("cursor", cursor);

        const res = await fetch(
          `${API_URL}/hospitals/${hospitalId}/patients?limit=50`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (res.status === 403) {
          setPatientsError("Access denied. Hospital account may be disabled.");
          return;
        }

        if (!res.ok) {
          setPatientsError(`Failed to load patients (${res.status})`);
          return;
        }

        const data = await res.json();
        console.log("FULL API RESPONSE:", JSON.stringify(data, null, 2));
        console.log(
          "FIRST PATIENT RAW:",
          JSON.stringify(data.patients?.[0], null, 2),
        );
        const mapped = (data.patients || []).map(mapApiPatient);

        // If paginating, append; otherwise replace
        setPatients((prev) => (cursor ? [...prev, ...mapped] : mapped));
        setNextCursor(data.next_cursor || null);
      } catch (err) {
        setPatientsError("Network error. Please check your connection.");
        console.error("fetchPatients error:", err);
      } finally {
        setPatientsLoading(false);
      }
    },
    [mapApiPatient],
  );

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const updatePatient = useCallback(async (patientData) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const hospitalId = await AsyncStorage.getItem("hospital_id");

      if (!token || !hospitalId)
        return { success: false, error: "Not authenticated" };

      const formData = new FormData();
      formData.append("hospital_id", hospitalId);
      formData.append("user_id", patientData.user_id); // raw user_id from API

      // Only append fields that have real values
      if (patientData.name) formData.append("name", patientData.name);
      if (patientData.age) formData.append("age", String(patientData.age));
      if (patientData.gender) formData.append("gender", patientData.gender);
      if (patientData.insurer) formData.append("insurer", patientData.insurer);
      if (patientData.policyNumber)
        formData.append("policy_number", patientData.policyNumber);
      if (patientData.urgencyLevel)
        formData.append("urgency_level", patientData.urgencyLevel);
      if (patientData.doctorId)
        formData.append("doctor_id", patientData.doctorId);

      console.log("formdata:", formData);

      const res = await fetch(`${API_URL}/hospitals/staff/update_patient`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type manually for multipart/form-data
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errData.message || `Error ${res.status}`,
        };
      }

      const data = await res.json();
      console.log("Update_patient_response :", data);
      return { success: true, data };
    } catch (err) {
      console.error("updatePatient error:", err);
      return { success: false, error: "Network error" };
    }
  }, []);

  // const filteredPatients = patients.filter(
  //   (p) =>
  //     p.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //     p.id.toLowerCase().includes(searchText.toLowerCase()),
  // );
  const filteredPatients = patients.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const id = (p.id || "").toLowerCase();
    return (
      name.includes(searchText.toLowerCase()) ||
      id.includes(searchText.toLowerCase())
    );
  });

  const fetchDoctorsForPatient = useCallback(async (userId) => {
    try {
      setDoctorsLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/hospitals/users/${userId}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      // Flatten to a simple array: [{ doctor_id, doctorname }]
      const mapped = (data.doctors || [])
        .filter((d) => d.relation?.status === "ACTIVE")
        .map((d) => ({
          doctor_id: d.doctor?.doctor_id,
          doctorname: d.doctor?.doctorname || "Unknown",
        }));
      setDoctors(mapped);
    } catch (err) {
      console.error("fetchDoctors error:", err);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  const fetchDiagnosisSummary = useCallback(async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/hospitals/users/${userId}/diagnosis-summary`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 404) {
        console.log("[DiagnosisSummary] No diagnosis data for user:", userId);
        return null;
      }
      if (!res.ok) return null;

      const data = await res.json();
      console.log("[DiagnosisSummary] Response:", data);
      return data;
    } catch (err) {
      console.error("[DiagnosisSummary] error:", err);
      return null;
    }
  }, []);

  const fetchInsuranceAutofillCodes = useCallback(async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/medilocker/users/${userId}/insurance/autofill-stored`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!res.ok) {
        console.log("[AutofillCodes] Non-OK response:", res.status);
        return [];
      }

      const data = await res.json();
      console.log(
        "[AutofillCodes] Raw response:",
        JSON.stringify(data, null, 2),
      );

      // Handle multiple possible shapes defensively
      let codes = [];

      // Shape 1: { icd_codes: [{code, description}, ...] }
      if (Array.isArray(data.icd_codes)) {
        codes = data.icd_codes.map((c) => ({
          id: c.code || c.icd_code || c.id,
          label: c.description || c.diagnosis || c.label || "",
          ref: "Auto-populated from Insurance Autofill",
        }));
      }
      // Shape 2: { diagnosis_codes: [{icd_code, diagnosis_label}, ...] }
      else if (Array.isArray(data.diagnosis_codes)) {
        codes = data.diagnosis_codes.map((c) => ({
          id: c.icd_code || c.code || c.id,
          label: c.diagnosis_label || c.description || c.label || "",
          ref: "Auto-populated from Insurance Autofill",
        }));
      }
      // Shape 3: flat array [{ icd_code, label }, ...]
      else if (Array.isArray(data)) {
        codes = data.map((c) => ({
          id: c.icd_code || c.code || c.id,
          label: c.diagnosis_label || c.description || c.label || "",
          ref: "Auto-populated from Insurance Autofill",
        }));
      }
      // Shape 4: single object with primary/additional (same as diagnosis-summary)
      else if (data.primary_icd_code) {
        if (data.primary_icd_code && data.primary_diagnosis) {
          codes.push({
            id: data.primary_icd_code,
            label: data.primary_diagnosis,
            ref: "Auto-populated from Insurance Autofill",
          });
        }
        if (data.additional_icd_code && data.additional_diagnosis) {
          codes.push({
            id: data.additional_icd_code,
            label: data.additional_diagnosis,
            ref: "Auto-populated from Insurance Autofill",
          });
        }
      }

      // Filter out any entries where id is missing/null
      return codes.filter((c) => c.id);
    } catch (err) {
      console.error("[AutofillCodes] error:", err);
      return [];
    }
  }, []);

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
      {/* {filteredPatients.length > 0 ? (
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
      )} */}
      {patientsLoading && (
        <View style={{ padding: 32, alignItems: "center" }}>
          <Text style={{ color: "#6B7280", fontSize: 13 }}>
            Loading patients...
          </Text>
        </View>
      )}
      {!patientsLoading && patientsError && (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: "#DC2626", fontSize: 13, textAlign: "center" }}>
            {patientsError}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 12, padding: 10 }}
            onPress={() => fetchPatients()}
          >
            <Text style={{ color: "#2563EB", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      {!patientsLoading &&
        !patientsError &&
        (filteredPatients.length > 0 ? (
          <View style={isMobile ? { paddingHorizontal: 16 } : {}}>
            {filteredPatients.map((p, index) => (
              <PatientRow
                key={p.id || p.user_id || `patient-${index}`}
                patient={p}
                onSelect={(pat) => handleSelectPatient(pat, animRef)}
                isSelected={selectedPatient?.id === p.id}
              />
            ))}
            {/* Pagination — only show if more pages exist */}
            {nextCursor && (
              <TouchableOpacity
                style={{ padding: 16, alignItems: "center" }}
                onPress={() => fetchPatients(nextCursor)}
              >
                <Text
                  style={{ color: "#2563EB", fontWeight: "600", fontSize: 13 }}
                >
                  Load more patients
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <EmptyState onNewRequest={() => {}} isMobile={isMobile} />
        ))}
    </Animated.View>
  );

  const renderStep2 = (animRef, isMobile) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      <View style={isMobile ? { paddingHorizontal: 16, paddingTop: 12 } : {}}>
        <Text style={[sh.title, { marginBottom: 10 }]}>Selected Patient</Text>
        {selectedPatient && <SelectedPatientCard patient={selectedPatient} />}
      </View>
      {/* <ServiceInfoForm
        patient={selectedPatient}
        onPrevious={() => handlePrevious(animRef)}
        onNext={(formValues) => {
          // Store service form data, then advance step
          setServiceFormData(formValues);
          handleNext(animRef);
        }}
      /> */}
      <ServiceInfoForm
        patient={selectedPatient}
        doctors={doctors}
        doctorsLoading={doctorsLoading}
        onPrevious={() => handlePrevious(animRef)}
        onNext={(formValues) => {
          setServiceFormData(formValues);
          handleNext(animRef);
        }}
      />
    </Animated.View>
  );

  // const renderStep3 = (animRef, isMobile) => (
  //   <Animated.View style={{ transform: [{ translateX: animRef }] }}>
  //     {selectedPatient && (
  //       <View
  //         style={
  //           isMobile
  //             ? { paddingHorizontal: 16, paddingTop: 12 }
  //             : { marginBottom: 4 }
  //         }
  //       >
  //         <SelectedPatientCard patient={selectedPatient} />
  //       </View>
  //     )}
  //     <MedicalCodesForm
  //       diagnosisCodes={diagnosisCodes}
  //       procedureCodes={procedureCodes}
  //       setDiagnosisCodes={setDiagnosisCodes}
  //       setProcedureCodes={setProcedureCodes}
  //       onNext={() => handleNext(animRef)}
  //       onPrevious={() => handlePrevious(animRef)}
  //     />
  //   </Animated.View>
  // );
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
        onAiSuggest={handleAiSuggestCodes} // ← new
        aiLoading={aiLoading} // ← new
        aiError={aiError} // ← new
      />
    </Animated.View>
  );

  const renderStep4 = (animRef) => (
    <Animated.View style={{ transform: [{ translateX: animRef }] }}>
      <ReviewVerifyForm
        patient={selectedPatient}
        diagnosisCodes={diagnosisCodes}
        procedureCodes={procedureCodes}
        updateLoading={updateLoading}
        updateError={updateError}
        onPrevious={() => handlePrevious(animRef)}
        onNext={async () => {
          if (!selectedPatient?.user_id) return;
          setUpdateLoading(true);
          setUpdateError(null);

          const result = await updatePatient({
            user_id: selectedPatient.user_id,
            name: selectedPatient.name,
            age: selectedPatient.age !== "—" ? selectedPatient.age : undefined,
            gender:
              selectedPatient.gender !== "—"
                ? selectedPatient.gender
                : undefined,
            insurer: serviceFormData.insurer,
            urgencyLevel: serviceFormData.urgencyLevel,
            doctorId: serviceFormData.doctorId, // ✅ ADD THIS
            policyNumber: selectedPatient.policyNumber, // ✅ ADD THIS if needed
          });

          setUpdateLoading(false);

          if (result.success) {
            const updatedUser = result.data?.user || null;
            setPreAuthAnalysisData(
              buildPreAuthAnalysisData({
                patient: selectedPatient,
                updatedUser,
                diagnosisSummary,
                diagnosisCodes,
                procedureCodes,
                serviceFormData,
              }),
            );
            handleNext(animRef); // advance to Step 5
          } else {
            setUpdateError(result.error || "Failed to submit. Try again.");
          }
        }}
      />
    </Animated.View>
  );

  const renderStep5 = (animRef) => {
    const analysisData =
      preAuthAnalysisData ||
      buildPreAuthAnalysisData({
        patient: selectedPatient,
        updatedUser: selectedPatient?.rawPatient,
        diagnosisSummary,
        diagnosisCodes,
        procedureCodes,
        serviceFormData,
      });

    return (
      <Animated.View style={{ transform: [{ translateX: animRef }] }}>
        <PreAuthMediAssistCombinedForms
          navigation={navigation}
          route={{ params: { analysisData } }}
        />
      </Animated.View>
    );
  };

  const renderCurrentStep = (animRef, isMobile) => {
    if (currentStep === 1) return renderStep1(animRef, isMobile);
    if (currentStep === 2) return renderStep2(animRef, isMobile);
    if (currentStep === 3) return renderStep3(animRef, isMobile);
    if (currentStep === 4) return renderStep4(animRef, isMobile);
    if (currentStep === 5) return renderStep5(animRef); // ← add this
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
                  <View style={web.header}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View>
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
                      <TouchableOpacity
                        style={web.backBtn}
                        onPress={() => {
                          if (currentStep === 5) {
                            setCurrentStep(1);
                          } else {
                            navigation.goBack();
                          }
                        }}
                      >
                        <Feather
                          name="arrow-left"
                          size={14}
                          color="#374151"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={web.backBtnText}>Back</Text>
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
  // Add inside mc StyleSheet:
  emptyCodesBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  emptyCodesText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
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

const dd = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 999,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemText: { fontSize: 13, color: "#374151" },
  emptyText: {
    padding: 14,
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
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
  header: { zIndex: 9999, padding: "0%" },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: "0%",
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
