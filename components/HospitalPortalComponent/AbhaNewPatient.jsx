import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  requestAadhaarOtp,
  verifyOtpAndCreateAbha,
} from "../../utils/AbhaNewPatient";

// ─── CONSTANTS ────────────────────────────────────────────────
const GENDERS = ["Male", "Female", "Other"];
const METHODS = ["Aadhaar OTP"];
const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Gynaecology",
  "Orthopaedics",
  "Neurology",
];
const DOCTORS = [
  "Dr. Anjali Singh",
  "Dr. Arjun Mehta",
  "Dr. Kavitha Rao",
  "Dr. Suresh Pillai",
];
const TIME_SLOTS = [
  "09:00–09:30",
  "09:30–10:00",
  "10:00–10:30",
  "10:30–11:00",
  "11:00–11:30",
];
const INSURERS = [
  "None / Self-Pay",
  "Star Health",
  "HDFC Ergo",
  "ICICI Lombard",
  "Bajaj Allianz",
];

// ─── OUTER STEP INDICATOR (Choose Method → Patient Details…) ──
// const OuterStepIndicator = () => {
//   const steps = [
//     { num: 1, label: "Choose Method", sub: "Select Path", done: true },
//     // { num: 2, label: "Create ABHA", sub: "ABDM Gateway", active: true },
//     { num: 2, label: "Patient Details", sub: "Demographics" },
//     { num: 3, label: "Hospital Info", sub: "Dept & Doctor" },
//     { num: 4, label: "Confirm & Book", sub: "Generate Token" },
//   ];
//   return (
//     <View style={oS.container}>
//       {steps.map((step, idx) => {
//         const done = step.done || false;
//         const active = step.active || false;
//         return (
//           <React.Fragment key={step.num}>
//             <View style={oS.stepItem}>
//               <View
//                 style={[
//                   oS.circle,
//                   done && oS.circleDone,
//                   active && oS.circleActive,
//                 ]}
//               >
//                 {done ? (
//                   <Text style={oS.checkmark}>✓</Text>
//                 ) : (
//                   <Text style={[oS.circleNum, active && oS.circleNumActive]}>
//                     {step.num}
//                   </Text>
//                 )}
//               </View>
//               <View style={{ marginLeft: 8 }}>
//                 <Text
//                   style={[oS.stepLabel, (active || done) && oS.stepLabelActive]}
//                 >
//                   {step.label}
//                 </Text>
//                 <Text style={oS.stepSub}>{step.sub}</Text>
//               </View>
//             </View>
//             {idx < steps.length - 1 && (
//               <View style={[oS.line, done && oS.lineDone]} />
//             )}
//           </React.Fragment>
//         );
//       })}
//     </View>
//   );
// };
// Replace the static OuterStepIndicator with a dynamic one:
const OuterStepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Choose Method", sub: "Select Path" },
    { num: 2, label: "Patient Details", sub: "Demographics" },
    { num: 3, label: "Hospital Info", sub: "Dept & Doctor" },
    { num: 4, label: "Confirm & Book", sub: "Generate Token" },
  ];
  return (
    <View style={oS.container}>
      {steps.map((step, idx) => {
        const done = step.num < currentStep;
        const active = step.num === currentStep;
        return (
          <React.Fragment key={step.num}>
            <View style={oS.stepItem}>
              <View
                style={[
                  oS.circle,
                  done && oS.circleDone,
                  active && oS.circleActive,
                ]}
              >
                {done ? (
                  <Text style={oS.checkmark}>✓</Text>
                ) : (
                  <Text style={[oS.circleNum, active && oS.circleNumActive]}>
                    {step.num}
                  </Text>
                )}
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={[oS.stepLabel, (active || done) && oS.stepLabelActive]}
                >
                  {step.label}
                </Text>
                <Text style={oS.stepSub}>{step.sub}</Text>
              </View>
            </View>
            {idx < steps.length - 1 && (
              <View style={[oS.line, done && oS.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ─── INNER SUB-STEP INDICATOR (Aadhaar → OTP → … → ABHA Created) ─
const InnerStepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Aadhaar Details" },
    { num: 2, label: "OTP" },
    // { num: 3, label: "Mobile Verify" },
    // { num: 4, label: "ABHA Address" },
    { num: 3, label: "ABHA Created" },
  ];
  return (
    <View style={iS.wrapper}>
      {steps.map((step, idx) => {
        const done = step.num < currentStep;
        const active = step.num === currentStep;
        return (
          <React.Fragment key={step.num}>
            <View style={iS.item}>
              <View
                style={[iS.dot, done && iS.dotDone, active && iS.dotActive]}
              >
                {done ? (
                  <Text style={iS.dotCheck}>✓</Text>
                ) : (
                  <Text style={[iS.dotNum, active && iS.dotNumActive]}>
                    {step.num}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  iS.label,
                  active && iS.labelActive,
                  done && iS.labelDone,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View style={[iS.line, done && iS.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ─── MOBILE OUTER STEP INDICATOR ──────────────────────────────
const MobileOuterStepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Choose\nMethod" },
    { num: 2, label: "Patient\nDetails" },
    { num: 3, label: "Hospital\nInfo" },
    { num: 4, label: "Confirm\n& Book" },
  ];
  return (
    <View style={moS.container}>
      {steps.map((step, idx) => {
        const done = step.num < currentStep;
        const active = step.num === currentStep;
        return (
          <React.Fragment key={step.num}>
            <View style={moS.stepItem}>
              <View
                style={[
                  moS.circle,
                  done && moS.circleDone,
                  active && moS.circleActive,
                ]}
              >
                {done ? (
                  <Text style={moS.checkmark}>✓</Text>
                ) : (
                  <Text style={[moS.circleNum, active && moS.circleNumActive]}>
                    {step.num}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  moS.label,
                  active && moS.labelActive,
                  done && moS.labelDone,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View style={[moS.line, done && moS.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ─── MOBILE INNER SUB-STEP INDICATOR ──────────────────────────
const MobileInnerStepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Aadhaar" },
    { num: 2, label: "OTP" },
    { num: 3, label: "ABHA\nCreated" },
  ];
  return (
    <View style={miS.wrapper}>
      {steps.map((step, idx) => {
        const done = step.num < currentStep;
        const active = step.num === currentStep;
        return (
          <React.Fragment key={step.num}>
            <View style={miS.item}>
              <View
                style={[miS.dot, done && miS.dotDone, active && miS.dotActive]}
              >
                {done ? (
                  <Text style={miS.dotCheck}>✓</Text>
                ) : (
                  <Text style={[miS.dotNum, active && miS.dotNumActive]}>
                    {step.num}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  miS.label,
                  active && miS.labelActive,
                  done && miS.labelDone,
                ]}
              >
                {step.label}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View style={[miS.line, done && miS.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ─── INLINE SELECT ────────────────────────────────────────────
const InlineSelect = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  required,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={[fS.group, { zIndex: open ? 100 : 1 }]}>
      {label && (
        <Text style={fS.label}>
          {label}
          {required && <Text style={{ color: "#EF4444" }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity style={fS.select} onPress={() => setOpen(!open)}>
        <Text
          style={{
            fontSize: 13,
            color: value ? "#111827" : "#9CA3AF",
            flex: 1,
          }}
        >
          {value || placeholder || "Select"}
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 11 }}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={fS.menu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={fS.menuItem}
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

// ─── OTP INPUT ROW (6-digit) ──────────────────────────────────
const OtpRow = ({ otp, setOtp, inputRefs }) => {
  const handleChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.replace(/\D/g, "").slice(0, 1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };
  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        marginVertical: 20,
      }}
    >
      {otp.map((digit, idx) => (
        <TextInput
          key={idx}
          ref={(r) => (inputRefs.current[idx] = r)}
          style={[
            {
              width: 52,
              height: 56,
              borderWidth: 1.5,
              borderColor: "#D1D5DB",
              borderRadius: 10,
              fontSize: 22,
              fontWeight: "700",
              color: "#111827",
              backgroundColor: "#F9FAFB",
              textAlign: "center",
            },
            digit && { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
          ]}
          value={digit}
          onChangeText={(v) => handleChange(v, idx)}
          onKeyPress={(e) => handleKeyPress(e, idx)}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const ConfirmationModal = ({ visible, data, onClose, onNewRegistration }) => {
  const { width: modalWidth } = useWindowDimensions();
  const isModalMobile = modalWidth < 768;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  const tokenNum = `T-0${Math.floor(Math.random() * 90 + 10)}`;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={confS.overlay}>
        <Animated.View
          style={[
            confS.box,
            isModalMobile && { width: modalWidth - 32, borderRadius: 12 },
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={confS.header}>
            <View>
              <Text style={confS.hospitalName}>
                Registration · MediDesk OPD
              </Text>
              <Text style={confS.hospitalSub}>
                kokoro.doctor Hospital · Bhopal
              </Text>
            </View>
            <TouchableOpacity style={confS.closeBtn} onPress={onClose}>
              <Text style={{ fontSize: 16, color: "#6B7280" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={confS.tokenRow}>
            <Text style={confS.tokenLabel}>Follow UP</Text>
            <View style={confS.tokenBadge}>
              <Text style={confS.tokenNum}>{tokenNum}</Text>
            </View>
          </View>

          <Text style={confS.doctorName}>
            {data?.doctor || "Dr. Anjali Singh"}
          </Text>
          <Text style={confS.doctorSpec}>(MS Ortho)</Text>

          <View style={confS.patientRow}>
            <View style={confS.avatarSmall}>
              <Text style={confS.avatarText}>
                {(data?.fullName || "RK")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={confS.patientName}>
                {data?.fullName || "Rahul Chowdhary"}
              </Text>
              <Text style={confS.patientAge}>
                {data?.age || "40"} yrs / {data?.gender?.[0] || "M"}
              </Text>
            </View>
            <Text style={confS.fee}>₹ {data?.consultationFee || "500"}</Text>
          </View>

          <View style={confS.phone}>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              📞 {data?.mobile || "+91 9874563210"}
            </Text>
          </View>

          <View style={confS.detailsGrid}>
            <View style={confS.detailItem}>
              <Text style={confS.detailLabel}>Department</Text>
              <Text style={confS.detailValue}>
                {data?.department || "Orthopedics"}
              </Text>
            </View>
            <View style={confS.detailItem}>
              <Text style={confS.detailLabel}>Date & Time</Text>
              <Text style={confS.detailValue}>
                {data?.appointmentDate || "22 May 2026"}
              </Text>
              <Text style={confS.detailValue}>
                {data?.timeSlot || "09:30–10:00 AM"}
              </Text>
            </View>
          </View>

          <View style={confS.abhaBadge}>
            <Text style={confS.abhaText}>
              🔗 ABHA ID · {data?.abhaNumber || "12-3456-7890-1234"}
            </Text>
          </View>

          <View style={confS.actions}>
            <TouchableOpacity style={confS.printBtn}>
              <Text style={{ fontSize: 13, color: "#374151" }}>🖨 Print</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={confS.newRegBtn}
              onPress={onNewRegistration}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                + New Registration
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────
// Props:
//   onBack           : fn — wapas card selection pe
//   onFlowComplete   : fn(patientData) — ABHA creation complete, parent next step pe jaaye

const AbhaNewPatient = ({ onBack, onFlowComplete }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [subStep, setSubStep] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 1
  const [method, setMethod] = useState("Aadhaar OTP");
  const [aadhaar, setAadhaar] = useState("");
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

  // Step 2 — Aadhaar OTP
  const [aOtp, setAOtp] = useState(["", "", "", "", "", ""]);
  const aOtpRefs = useRef([]);

  // Step 3 — Mobile Verify
  const [mobileOtp, setMobileOtp] = useState(["", "", "", "", "", ""]);
  const mOtpRefs = useRef([]);

  // Step 4 — ABHA Address + demographic pre-fill
  const [abhaAddr, setAbhaAddr] = useState("");
  const [fullName, setFullName] = useState("Rajesh Sharma");
  const [dob, setDob] = useState("12-08-1970");
  const [gender, setGender] = useState("Male");
  const [mobile, setMobile] = useState("+91 9823400998");
  const [email, setEmail] = useState("");
  const [abhaAddrSuggestion] = useState("rajesh.sharma@abdm");
  const [showAadhaarOtpModal, setShowAadhaarOtpModal] = useState(false);
  const otpScale = useRef(new Animated.Value(0.9)).current;
  const otpOpacity = useRef(new Animated.Value(0)).current;
  const [preferredMobile, setPreferredMobile] = useState("");
  const [mobileSent, setMobileSent] = useState(false);
  // const ABHA_SUGGESTIONS = [
  //   "priya.devi@abdm",
  //   "priya.devi2@abdm",
  //   "priya.devi3@abdm",
  //   "priya.d.1970@abdm",
  // ];
  // const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  // const [customAbha, setCustomAbha] = useState("");
  // const [checkPressed, setCheckPressed] = useState(false);
  // Outer step tracking (1=ABHA creation, 2=Patient Details skipped, 3=Hospital Info, 4=Confirm)
  const [outerStep, setOuterStep] = useState(1);

  // Hospital Info state
  const [hospitalInfo, setHospitalInfo] = useState({
    department: "",
    doctor: "",
    appointmentDate: "22-05-2026",
    timeSlot: "",
    ward: "",
    referral: "",
    chiefComplaint: "",
    insurer: "None / Self-Pay",
    policyNumber: "",
    consultationFee: "500",
  });
  const setH = (k, v) => setHospitalInfo((prev) => ({ ...prev, [k]: v }));

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Patient details from step 5 form (editable fields)
  const [age, setAge] = useState("");
  // const [emergencyContact, setEmergencyContact] = useState("");
  // const [consultationType, setConsultationType] = useState("");
  const [txnId, setTxnId] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [abhaNumber, setAbhaNumber] = useState("");

  // ── navigation helpers ─────────────────────────────────────
  const goTo = (next) => {
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(1);
      setSubStep(next);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const goBack = () => {
    if (subStep === 1) {
      onBack && onBack();
      return;
    }
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(-1);
      setSubStep((s) => s - 1);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const translateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-60, 0, 60],
  });

  // const handleSendOtp = () => {
  //   if (!consent1 || !consent2) return;
  //   setShowAadhaarOtpModal(true);
  //   Animated.parallel([
  //     Animated.spring(otpScale, {
  //       toValue: 1,
  //       tension: 80,
  //       friction: 8,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(otpOpacity, {
  //       toValue: 1,
  //       duration: 200,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // };
  const handleSendOtp = async () => {
    if (!consent1 || !consent2 || aadhaar.length < 12) return;
    setApiError("");
    setOtpLoading(true);
    try {
      const res = await requestAadhaarOtp(aadhaar);
      setTxnId(res.txn_id);
      setShowAadhaarOtpModal(true);
      Animated.parallel([
        Animated.spring(otpScale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(otpOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      setApiError(err.message || "OTP request failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };
  // const handleAadhaarOtpVerify = () => {
  //   setShowAadhaarOtpModal(false);
  //   goTo(3); // slide to mobile verify
  // };

  // ── STEP 1: Aadhaar Details ────────────────────────────────
  // const renderStep1 = () => (
  //   <ScrollView
  //     showsVerticalScrollIndicator={false}
  //     contentContainerStyle={s.scroll}
  //   >
  //     {/* Header badge */}
  //     <View style={s.headerRow}>
  //       <Text style={s.pageTitle}>Aadhaar-Based ABHA Creation</Text>
  //       <View style={s.gatewayBadge}>
  //         <Text style={s.gatewayText}>🔗 ABDM Gateway</Text>
  //       </View>
  //     </View>

  //     {/* Security info */}
  //     <View style={s.secureAlert}>
  //       <Text style={{ fontSize: 12, color: "#1E40AF" }}>
  //         🛡 Your Aadhaar details are sent directly to ABDM via a secure
  //         encrypted channel. We do not store your Aadhaar number.
  //       </Text>
  //     </View>

  //     {/* ABHA Number OR ABHA Address (read-only display row as per Figma) */}
  //     <View style={s.inputRow}>
  //       <View style={{ flex: 1 }}>
  //         <Text style={s.label}>
  //           ABHA Number (14-digit) <Text style={{ color: "#EF4444" }}>*</Text>
  //         </Text>
  //         <TextInput
  //           style={s.input}
  //           placeholder="12-5968-7894-1234"
  //           placeholderTextColor="#9CA3AF"
  //           value={aadhaar}
  //           onChangeText={setAadhaar}
  //           keyboardType="numeric"
  //         />
  //       </View>
  //       <View style={s.orDivider}>
  //         <Text style={{ fontSize: 12, color: "#9CA3AF", fontWeight: "600" }}>
  //           — OR — ABHA Address
  //         </Text>
  //       </View>
  //       <View style={{ flex: 1 }}>
  //         <Text style={s.label}>&nbsp;</Text>
  //         <TextInput
  //           style={s.input}
  //           placeholder="name@abdm"
  //           placeholderTextColor="#9CA3AF"
  //         />
  //       </View>
  //     </View>

  //     {/* OTP warning */}
  //     <View style={s.warningAlert}>
  //       <Text style={{ fontSize: 12, color: "#92400E" }}>
  //         ⚠ The OTP will be sent to the mobile number registered with Aadhaar.
  //         Make sure the patient has access to that phone.
  //       </Text>
  //     </View>

  //     {/* Consent checkboxes */}
  //     <TouchableOpacity
  //       style={s.checkRow}
  //       onPress={() => setConsent1(!consent1)}
  //     >
  //       <View style={[s.checkbox, consent1 && s.checkboxChecked]}>
  //         {consent1 && <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>}
  //       </View>
  //       <Text style={s.checkLabel}>
  //         I confirm the patient has given consent to create an ABHA ID using
  //         their Aadhaar as per ABDM guidelines and NHA policies.
  //       </Text>
  //     </TouchableOpacity>

  //     <TouchableOpacity
  //       style={s.checkRow}
  //       onPress={() => setConsent2(!consent2)}
  //     >
  //       <View style={[s.checkbox, consent2 && s.checkboxChecked]}>
  //         {consent2 && <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>}
  //       </View>
  //       <Text style={s.checkLabel}>
  //         The patient agrees to link their health records with this facility
  //         upon ABHA creation.
  //       </Text>
  //     </TouchableOpacity>

  //     {/* Method + Fields row (bottom section of Figma) */}
  //     <View style={s.sectionDivider} />
  //     <View style={[fS.row, { zIndex: 50 }]}>
  //       <InlineSelect
  //         label="Method"
  //         value={method}
  //         options={METHODS}
  //         onSelect={setMethod}
  //       />
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>
  //           AADHAAR NUMBER <Text style={{ color: "#EF4444" }}>*</Text>
  //         </Text>
  //         <TextInput
  //           style={fS.input}
  //           placeholder="Registered mobile"
  //           placeholderTextColor="#9CA3AF"
  //           keyboardType="numeric"
  //         />
  //       </View>
  //     </View>

  //     <View style={isMobile ? mfS.col : fS.row}>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>
  //           Full name <Text style={{ color: "#EF4444" }}>*</Text>
  //         </Text>
  //         <TextInput
  //           style={fS.input}
  //           placeholder="Enter Name..."
  //           placeholderTextColor="#9CA3AF"
  //         />
  //       </View>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>
  //           Date of birth <Text style={{ color: "#EF4444" }}>*</Text>
  //         </Text>
  //         <TextInput
  //           style={fS.input}
  //           placeholder="Select department"
  //           placeholderTextColor="#9CA3AF"
  //         />
  //       </View>
  //     </View>

  //     <View style={[fS.row, { zIndex: 40 }]}>
  //       <InlineSelect
  //         label="Gender *"
  //         value={null}
  //         options={GENDERS}
  //         onSelect={() => {}}
  //         placeholder="Select Gender"
  //       />
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>
  //           Mobile (AADHAAR LINKED) <Text style={{ color: "#EF4444" }}>*</Text>
  //         </Text>
  //         <TextInput
  //           style={fS.input}
  //           placeholder="+91 9823400998"
  //           placeholderTextColor="#9CA3AF"
  //           keyboardType="phone-pad"
  //         />
  //       </View>
  //     </View>

  //     <View style={isMobile ? mfS.col : fS.row}>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>EMAIL</Text>
  //         <TextInput
  //           style={fS.input}
  //           placeholder="Enter Name..."
  //           placeholderTextColor="#9CA3AF"
  //           keyboardType="email-address"
  //         />
  //       </View>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>ABHA ADDRESS</Text>
  //         <TextInput
  //           style={fS.input}
  //           placeholder="e.g. firstname.lastname"
  //           placeholderTextColor="#9CA3AF"
  //         />
  //       </View>
  //     </View>
  //     <Modal
  //       transparent
  //       animationType="none"
  //       visible={showAadhaarOtpModal}
  //       onRequestClose={() => setShowAadhaarOtpModal(false)}
  //     >
  //       <View style={s.otpOverlay}>
  //         <Animated.View
  //           style={[
  //             s.otpModalBox,
  //             { opacity: otpOpacity, transform: [{ scale: otpScale }] },
  //           ]}
  //         >
  //           <Text style={s.otpCardTitle}>Enter verification code</Text>
  //           <Text style={s.otpCardSub}>
  //             6-digit OTP sent to Aadhaar-registered mobile
  //           </Text>
  //           <Text style={{ fontSize: 13, color: "#2563EB", marginBottom: 4 }}>
  //             +91 cvXXXXXXXX
  //           </Text>
  //           <OtpRow otp={aOtp} setOtp={setAOtp} inputRefs={aOtpRefs} />
  //           <TouchableOpacity>
  //             <Text style={{ color: "#2563EB", fontSize: 13 }}>Resend</Text>
  //           </TouchableOpacity>
  //           <View style={s.footerRow}>
  //             <TouchableOpacity
  //               style={s.backBtn}
  //               onPress={() => setShowAadhaarOtpModal(false)}
  //             >
  //               <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
  //             </TouchableOpacity>
  //             <TouchableOpacity
  //               style={s.primaryBtn}
  //               onPress={handleAadhaarOtpVerify}
  //             >
  //               <Text style={s.primaryBtnText}>🛡 Verify OTP</Text>
  //             </TouchableOpacity>
  //           </View>
  //         </Animated.View>
  //       </View>
  //     </Modal>

  //     {/* Footer */}
  //     <View style={s.footerRow}>
  //       <TouchableOpacity style={s.backBtn} onPress={goBack}>
  //         <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={[s.primaryBtn, { opacity: !consent1 || !consent2 ? 0.5 : 1 }]}
  //         // onPress={() => {
  //         //   if (consent1 && consent2) goTo(2);
  //         // }}
  //         onPress={handleSendOtp}
  //       >
  //         <Text style={s.primaryBtnText}>📤 Send OTP</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </ScrollView>
  // );

  const renderStep1 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={isMobile ? s.scrollMobile : s.scroll}
    >
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>Aadhaar-Based ABHA Creation</Text>
        <View style={s.gatewayBadge}>
          <Text style={s.gatewayText}>🔗 ABDM Gateway</Text>
        </View>
      </View>

      <View style={s.secureAlert}>
        <Text style={{ fontSize: 12, color: "#1E40AF" }}>
          🛡 Your Aadhaar details are sent directly to ABDM via a secure
          encrypted channel. We do not store your Aadhaar number.
        </Text>
      </View>

      {/* Sirf Aadhaar Number */}
      <Text style={s.label}>
        Aadhaar Number <Text style={{ color: "#EF4444" }}>*</Text>
      </Text>
      <TextInput
        style={[s.input, { marginBottom: 16 }]}
        placeholder="12-digit Aadhaar number"
        placeholderTextColor="#9CA3AF"
        value={aadhaar}
        onChangeText={setAadhaar}
        keyboardType="numeric"
        maxLength={14}
      />

      <View style={s.warningAlert}>
        <Text style={{ fontSize: 12, color: "#92400E" }}>
          ⚠ The OTP will be sent to the mobile number registered with Aadhaar.
          Make sure the patient has access to that phone.
        </Text>
      </View>

      {/* 2 consent checkboxes */}
      <TouchableOpacity
        style={s.checkRow}
        onPress={() => setConsent1(!consent1)}
      >
        <View style={[s.checkbox, consent1 && s.checkboxChecked]}>
          {consent1 && <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>}
        </View>
        <Text style={s.checkLabel}>
          I confirm the patient has given consent to create an ABHA ID using
          their Aadhaar as per ABDM guidelines and NHA policies.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.checkRow}
        onPress={() => setConsent2(!consent2)}
      >
        <View style={[s.checkbox, consent2 && s.checkboxChecked]}>
          {consent2 && <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>}
        </View>
        <Text style={s.checkLabel}>
          The patient agrees to link their health records with this facility
          upon ABHA creation.
        </Text>
      </TouchableOpacity>

      <View style={s.footerRow}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            s.primaryBtn,
            {
              opacity:
                !consent1 || !consent2 || aadhaar.length < 12 || otpLoading
                  ? 0.5
                  : 1,
            },
          ]}
          onPress={handleSendOtp}
          disabled={otpLoading}
        >
          <Text style={s.primaryBtnText}>
            {otpLoading ? "Sending..." : "📤 Send OTP"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* OTP Modal — same as before, no change needed here */}
      <Modal
        transparent
        animationType="none"
        visible={showAadhaarOtpModal}
        onRequestClose={() => setShowAadhaarOtpModal(false)}
      >
        <View style={s.otpOverlay}>
          {/* <Animated.View
            style={[
              s.otpModalBox,
              { opacity: otpOpacity, transform: [{ scale: otpScale }] },
            ]}
          > */}
          <Animated.View
            style={[
              s.otpModalBox,
              isMobile && s.otpModalBoxMobile,
              { opacity: otpOpacity, transform: [{ scale: otpScale }] },
            ]}
          >
            <Text style={s.otpCardTitle}>Enter verification code</Text>
            <Text style={s.otpCardSub}>
              6-digit OTP sent to Aadhaar-registered mobile
            </Text>
            <Text style={{ fontSize: 13, color: "#2563EB", marginBottom: 4 }}>
              +91 cvXXXXXXXX
            </Text>
            <OtpRow otp={aOtp} setOtp={setAOtp} inputRefs={aOtpRefs} />
            <TouchableOpacity style={{ marginBottom: 16 }}>
              <Text style={{ color: "#2563EB", fontSize: 13 }}>Resend</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#E5E7EB",
                width: "100%",
                marginBottom: 16,
              }}
            />

            {/* Mobile verify section — same modal ke andar */}
            <Text style={[s.otpCardTitle, { fontSize: 14, marginBottom: 4 }]}>
              Preferred Mobile Number
            </Text>
            <Text style={[s.otpCardSub, { marginBottom: 12 }]}>
              This can be different from the Aadhaar-linked number.
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                width: "100%",
                marginBottom: 4,
              }}
            >
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="+91 9874563210"
                placeholderTextColor="#9CA3AF"
                value={preferredMobile}
                onChangeText={setPreferredMobile}
                keyboardType="phone-pad"
              />
              {/* <TouchableOpacity
                style={[
                  s.primaryBtn,
                  { opacity: preferredMobile.length < 10 ? 0.5 : 1 },
                ]}
                onPress={() => {
                  if (preferredMobile.length >= 10) setMobileSent(true);
                }}
              >
                <Text style={s.primaryBtnText}>Send OTP</Text>
              </TouchableOpacity> */}
            </View>

            {/* {mobileSent && (
              <>
                <View
                  style={[
                    s.secureAlert,
                    {
                      backgroundColor: "#F0FDF4",
                      borderColor: "#86EFAC",
                      width: "100%",
                      marginBottom: 4,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 12, color: "#166534" }}>
                    ✅ OTP sent! Enter below to verify
                  </Text>
                </View>
                <OtpRow
                  otp={mobileOtp}
                  setOtp={setMobileOtp}
                  inputRefs={mOtpRefs}
                />
              </>
            )} */}

            {/* Footer buttons */}
            <View style={[s.footerRow, { width: "100%" }]}>
              <TouchableOpacity
                style={s.backBtn}
                onPress={() => setShowAadhaarOtpModal(false)}
              >
                <Text style={{ fontSize: 13, color: "#374151" }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.primaryBtn,
                  { opacity: preferredMobile.length < 10 ? 0.5 : 1 },
                ]}
                // onPress={() => {
                //   if (preferredMobile.length >= 10) {
                //     setShowAadhaarOtpModal(false);
                //     goTo(5);
                //   }
                // }}
                onPress={async () => {
                  if (preferredMobile.length < 10) return;
                  setApiError("");
                  setVerifyLoading(true);
                  try {
                    const otp = aOtp.join("");
                    const res = await verifyOtpAndCreateAbha({
                      txnId,
                      otp,
                      mobile: preferredMobile,
                      // kokoroJwt: "your_jwt_here",
                    });

                    const profile = res.ABHAProfile || res.abha_profile || {};

                    setFullName(
                      `${profile.firstName || ""} ${profile.middleName || ""} ${profile.lastName || ""}`.trim(),
                    );
                    setDob(profile.dob || "");
                    setGender(
                      profile.gender === "M"
                        ? "Male"
                        : profile.gender === "F"
                          ? "Female"
                          : "Other",
                    );
                    setAbhaNumber(profile.ABHANumber || res.ABHANumber || "");

                    setShowAadhaarOtpModal(false);
                    goTo(5);
                  } catch (err) {
                    setApiError(err.message || "Verification failed");
                  } finally {
                    setVerifyLoading(false);
                  }
                }}
              >
                <Text style={s.primaryBtnText}>🛡 Verify & Continue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={isMobile ? s.scrollMobile : s.scroll}
    >
      <Text style={s.pageTitle}>Mobile Number Verification</Text>

      {/* Info alert */}
      <View style={s.secureAlert}>
        <Text style={{ fontSize: 12, color: "#1E40AF" }}>
          ℹ Aadhaar verified ✓. Now verify the preferred communication mobile
          number for ABHA and hospital notifications. This can be different from
          the Aadhaar-linked number.
        </Text>
      </View>

      {/* Mobile input + Send OTP button inline */}
      <Text style={s.label}>
        Preferred Mobile Number <Text style={{ color: "#EF4444" }}>*</Text>
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          placeholder="+91 9874563210"
          placeholderTextColor="#9CA3AF"
          value={preferredMobile}
          onChangeText={setPreferredMobile}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={[
            s.primaryBtn,
            { opacity: preferredMobile.length < 10 ? 0.5 : 1 },
          ]}
          onPress={() => {
            if (preferredMobile.length >= 10) setMobileSent(true);
          }}
        >
          <Text style={s.primaryBtnText}>📱 Send OTP to this number</Text>
        </TouchableOpacity>
      </View>

      {/* OTP section — same screen pe, sirf tab dikhao jab mobileSent true ho */}
      {mobileSent && (
        <Animated.View>
          {" "}
          {/* optional: fade-in animate kar sakte ho */}
          <View
            style={[
              s.secureAlert,
              { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" },
            ]}
          >
            <Text style={{ fontSize: 12, color: "#166534" }}>
              ✅ OTP sent! Enter the code below to verify
            </Text>
          </View>
          <OtpRow otp={mobileOtp} setOtp={setMobileOtp} inputRefs={mOtpRefs} />
        </Animated.View>
      )}

      <View style={s.footerRow}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryBtn, { opacity: !mobileSent ? 0.4 : 1 }]}
          onPress={() => {
            if (mobileSent) goTo(4);
          }}
        >
          <Text style={s.primaryBtnText}>Verify & Continue ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── STEP 4: ABHA Address ───────────────────────────────────
  // const renderStep4 = () => (
  //   <ScrollView
  //     showsVerticalScrollIndicator={false}
  //     contentContainerStyle={s.scroll}
  //   >
  //     <Text style={s.pageTitle}>Set ABHA Address</Text>
  //     <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
  //       ABHA Address is your unique health ID. Choose carefully — it cannot be
  //       changed later.
  //     </Text>

  //     {/* Suggestion chip */}
  //     <View style={s.suggestionRow}>
  //       <Text style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
  //         Suggested address:
  //       </Text>
  //       <TouchableOpacity
  //         style={s.suggestionChip}
  //         onPress={() => setAbhaAddr(abhaAddrSuggestion)}
  //       >
  //         <Text style={s.suggestionChipText}>✦ {abhaAddrSuggestion}</Text>
  //       </TouchableOpacity>
  //     </View>

  //     {/* ABHA Address input */}
  //     <View style={{ marginBottom: 14 }}>
  //       <Text style={s.label}>
  //         ABHA Address <Text style={{ color: "#EF4444" }}>*</Text>
  //       </Text>
  //       <View style={s.abhaInputRow}>
  //         <TextInput
  //           style={[
  //             s.input,
  //             {
  //               flex: 1,
  //               borderTopRightRadius: 0,
  //               borderBottomRightRadius: 0,
  //               borderRightWidth: 0,
  //             },
  //           ]}
  //           placeholder="firstname.lastname"
  //           placeholderTextColor="#9CA3AF"
  //           value={abhaAddr}
  //           onChangeText={setAbhaAddr}
  //         />
  //         <View style={s.abdmSuffix}>
  //           <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "600" }}>
  //             @abdm
  //           </Text>
  //         </View>
  //       </View>
  //       {abhaAddr.length > 0 && (
  //         <View style={s.validRow}>
  //           <Text style={{ fontSize: 12, color: "#16A34A" }}>
  //             ✓ {abhaAddr}@abdm is available
  //           </Text>
  //         </View>
  //       )}
  //     </View>

  //     {/* Pre-filled demographics (from Aadhaar) */}
  //     <View style={s.sectionDivider} />
  //     <Text style={s.sectionLabel}>Patient Details (from Aadhaar)</Text>

  //     <View style={isMobile ? mfS.col : fS.row}>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>Full Name</Text>
  //         <TextInput
  //           style={[fS.input, s.lockedInput]}
  //           value={fullName}
  //           editable={false}
  //         />
  //       </View>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>Date of Birth</Text>
  //         <TextInput
  //           style={[fS.input, s.lockedInput]}
  //           value={dob}
  //           editable={false}
  //         />
  //       </View>
  //     </View>

  //     <View style={[fS.row, { zIndex: 40 }]}>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>Gender</Text>
  //         <TextInput
  //           style={[fS.input, s.lockedInput]}
  //           value={gender}
  //           editable={false}
  //         />
  //       </View>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>Mobile (Aadhaar Linked)</Text>
  //         <TextInput
  //           style={[fS.input, s.lockedInput]}
  //           value={mobile}
  //           editable={false}
  //         />
  //       </View>
  //     </View>

  //     <View style={isMobile ? mfS.col : fS.row}>
  //       <View style={isMobile ? mfS.col : fS.row}>
  //         <Text style={fS.label}>Email (Optional)</Text>
  //         <TextInput
  //           style={fS.input}
  //           placeholder="Enter email"
  //           placeholderTextColor="#9CA3AF"
  //           value={email}
  //           onChangeText={setEmail}
  //           keyboardType="email-address"
  //         />
  //       </View>
  //     </View>

  //     <View style={s.footerRow}>
  //       <TouchableOpacity style={s.backBtn} onPress={goBack}>
  //         <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={[s.primaryBtn, { opacity: abhaAddr.length < 3 ? 0.5 : 1 }]}
  //         onPress={() => {
  //           if (abhaAddr.length >= 3) goTo(5);
  //         }}
  //       >
  //         <Text style={s.primaryBtnText}>✓ Create ABHA ID</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </ScrollView>
  // );
  // const renderStep4 = () => (
  //   <ScrollView
  //     showsVerticalScrollIndicator={false}
  //     contentContainerStyle={s.scroll}
  //   >
  //     <View
  //       style={{
  //         flexDirection: "row",
  //         alignItems: "center",
  //         gap: 10,
  //         marginBottom: 16,
  //       }}
  //     >
  //       <Text style={s.pageTitle}>Choose ABHA Address</Text>
  //       <View
  //         style={[
  //           s.gatewayBadge,
  //           { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" },
  //         ]}
  //       >
  //         <Text style={{ fontSize: 11, color: "#C2410C", fontWeight: "600" }}>
  //           Almost Done
  //         </Text>
  //       </View>
  //     </View>

  //     <View style={s.secureAlert}>
  //       <Text style={{ fontSize: 12, color: "#1E40AF" }}>
  //         🛡 The ABHA Address is the patient&apos;s unique health ID (like an
  //         email). Select one from the suggestions or create a custom one.
  //       </Text>
  //     </View>

  //     <Text style={[s.sectionLabel, { marginTop: 8 }]}>
  //       Suggested ABHA Addresses
  //     </Text>

  //     {/* 2x2 suggestion grid */}
  //     <View
  //       style={{
  //         flexDirection: "row",
  //         flexWrap: "wrap",
  //         gap: 12,
  //         marginBottom: 20,
  //       }}
  //     >
  //       {ABHA_SUGGESTIONS.map((addr) => (
  //         <TouchableOpacity
  //           key={addr}
  //           style={[
  //             s.suggestionTile,
  //             selectedSuggestion === addr && s.suggestionTileActive,
  //           ]}
  //           onPress={() => {
  //             setSelectedSuggestion(addr);
  //             setAbhaAddr(addr);
  //             setCustomAbha("");
  //           }}
  //         >
  //           <Text style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>
  //             Suggested
  //           </Text>
  //           <Text
  //             style={[
  //               s.suggestionTileText,
  //               selectedSuggestion === addr && { color: "#2563EB" },
  //             ]}
  //           >
  //             {addr}
  //           </Text>
  //         </TouchableOpacity>
  //       ))}
  //     </View>

  //     {/* Custom ABHA input + Check button */}
  //     <Text style={s.label}>Custom ABHA Address</Text>
  //     <View
  //       style={{
  //         flexDirection: "row",
  //         gap: 10,
  //         alignItems: "center",
  //         marginBottom: 8,
  //       }}
  //     >
  //       <TextInput
  //         style={[s.input, { flex: 1 }]}
  //         placeholder="Your Name"
  //         placeholderTextColor="#9CA3AF"
  //         value={customAbha}
  //         onChangeText={(v) => {
  //           setCustomAbha(v);
  //           setSelectedSuggestion(null);
  //           setAbhaAddr(v + "@abdm");
  //         }}
  //       />
  //       <View style={s.abdmSuffix}>
  //         <Text style={{ fontSize: 13, color: "#6B7280", fontWeight: "600" }}>
  //           @abdm
  //         </Text>
  //       </View>
  //       <TouchableOpacity
  //         style={[s.primaryBtn, { opacity: customAbha.length < 3 ? 0.5 : 1 }]}
  //         onPress={() => {
  //           if (customAbha.length >= 3) setCheckPressed(true);
  //         }}
  //       >
  //         <Text style={s.primaryBtnText}>Check</Text>
  //       </TouchableOpacity>
  //     </View>
  //     {checkPressed && customAbha.length >= 3 && (
  //       <Text style={{ fontSize: 12, color: "#16A34A", marginBottom: 12 }}>
  //         ✓ {customAbha}@abdm is available
  //       </Text>
  //     )}

  //     <View style={s.footerRow}>
  //       <TouchableOpacity style={s.backBtn} onPress={goBack}>
  //         <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={[s.primaryBtn, { opacity: !abhaAddr ? 0.4 : 1 }]}
  //         onPress={() => {
  //           if (abhaAddr) goTo(5);
  //         }}
  //       >
  //         <Text style={s.primaryBtnText}>✓ Confirm ABHA Address ›</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </ScrollView>
  // );

  // ── STEP 5: ABHA Created ───────────────────────────────────
  // const renderStep5 = () => (
  //   <ScrollView
  //     showsVerticalScrollIndicator={false}
  //     contentContainerStyle={s.scroll}
  //   >
  //     {/* Success card */}
  //     <View style={s.successCard}>
  //       <View style={s.successIconWrap}>
  //         <Text style={{ fontSize: 36 }}>✅</Text>
  //       </View>
  //       <Text style={s.successTitle}>ABHA ID Created Successfully!</Text>
  //       <Text style={s.successSub}>
  //         The patient&apos;s Ayushman Bharat Health Account has been created and
  //         linked with ABDM.
  //       </Text>

  //       {/* ABHA details */}
  //       <View style={s.abhaCard}>
  //         <View style={s.abhaCardHeader}>
  //           <Text style={s.abhaCardTitle}>🪪 ABHA Card</Text>
  //           <View style={s.abhaLiveBadge}>
  //             <Text
  //               style={{ fontSize: 11, color: "#16A34A", fontWeight: "700" }}
  //             >
  //               ● ACTIVE
  //             </Text>
  //           </View>
  //         </View>
  //         <View style={s.abhaRow}>
  //           <View style={s.abhaAvatarLg}>
  //             <Text
  //               style={{ fontSize: 18, fontWeight: "700", color: "#1D4ED8" }}
  //             >
  //               RS
  //             </Text>
  //           </View>
  //           <View style={{ flex: 1 }}>
  //             <Text
  //               style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}
  //             >
  //               {fullName}
  //             </Text>
  //             <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
  //               {gender} · DOB {dob}
  //             </Text>
  //             <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
  //               {mobile}
  //             </Text>
  //           </View>
  //         </View>
  //         <View style={s.abhaIdRow}>
  //           <Text style={s.abhaIdLabel}>ABHA Number</Text>
  //           <Text style={s.abhaIdValue}>12-5968-7894-1234</Text>
  //         </View>
  //         <View style={s.abhaIdRow}>
  //           <Text style={s.abhaIdLabel}>ABHA Address</Text>
  //           <Text style={s.abhaIdValue}>
  //             {abhaAddr || abhaAddrSuggestion}@abdm
  //           </Text>
  //         </View>
  //       </View>

  //       {/* Quick actions */}
  //       <View style={s.quickActions}>
  //         <TouchableOpacity style={s.qBtn}>
  //           <Text style={{ fontSize: 12, color: "#374151" }}>
  //             🖨 Print Card
  //           </Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity style={s.qBtn}>
  //           <Text style={{ fontSize: 12, color: "#374151" }}>
  //             📤 Share via SMS
  //           </Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity style={s.qBtn}>
  //           <Text style={{ fontSize: 12, color: "#374151" }}>
  //             ⬇ Download PDF
  //           </Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>

  //     {/* Footer */}
  //     <View style={[s.footerRow, { marginTop: 24 }]}>
  //       <TouchableOpacity style={s.backBtn} onPress={goBack}>
  //         <Text style={{ fontSize: 13, color: "#374151" }}>Edit details</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={[s.primaryBtn, { backgroundColor: "#16A34A" }]}
  //         onPress={() =>
  //           onFlowComplete &&
  //           onFlowComplete({
  //             fullName,
  //             mobile,
  //             age: "",
  //             gender,
  //             dob,
  //             abhaNumber: "12-5968-7894-1234",
  //             abhaAddress: `${abhaAddr || abhaAddrSuggestion}@abdm`,
  //           })
  //         }
  //       >
  //         <Text style={s.primaryBtnText}>Continue to Patient Details ›</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </ScrollView>
  // );
  const renderStep5 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={isMobile ? s.scrollMobile : s.scroll}
    >
      {/* Success banner */}
      <View
        style={[
          s.secureAlert,
          {
            backgroundColor: "#568363ff",
            borderColor: "#86EFAC",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          },
        ]}
      >
        <Text style={{ fontSize: 13, color: "#15803D", fontWeight: "600" }}>
          ✅ ABHA ID Successfully Created!
        </Text>
        <View
          style={[
            s.gatewayBadge,
            { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" },
          ]}
        >
          <Text style={{ fontSize: 11, color: "#15803D", fontWeight: "700" }}>
            {abhaNumber || "—"}
          </Text>
        </View>
      </View>

      {/* Choose ABHA Address section */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <Text style={s.pageTitle}>Choose ABHA Address</Text>
        <View
          style={[
            s.gatewayBadge,
            { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
          ]}
        >
          <Text style={{ fontSize: 11, color: "#1E40AF", fontWeight: "600" }}>
            Auto filled from Aadhaar + ABDM
          </Text>
        </View>
      </View>

      {/* Info alert */}
      <View style={s.secureAlert}>
        <Text style={{ fontSize: 12, color: "#1E40AF" }}>
          ℹ Details below are fetched directly from ABDM using the verified
          Aadhaar. Review and add any optional fields, then proceed to hospital
          info.
        </Text>
      </View>

      {/* Autofilled form fields */}
      {/* <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>
            Full Name <Text style={{ color: "#EF4444" }}>*</Text>
          </Text> */}
      <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>
            Full Name <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Autofilled from ABHA"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            editable={false}
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Date of birth</Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Male"
            placeholderTextColor="#9CA3AF"
            value={dob}
            editable={false}
          />
        </View>
      </View>

      <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Age</Text>
          <TextInput
            style={fS.input}
            placeholder="Years"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>
            Gender <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            value={gender}
            editable={false}
          />
        </View>
      </View>

      <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>ABHA Number</Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Years"
            placeholderTextColor="#9CA3AF"
            value={abhaNumber}
            editable={false}
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>
            Mobile <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Registered mobile"
            placeholderTextColor="#9CA3AF"
            value={preferredMobile || mobile}
            editable={false}
          />
        </View>
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={fS.label}>ABHA Address</Text>
        <TextInput
          style={[fS.input, s.lockedInput]}
          placeholder="Address auto Filled"
          placeholderTextColor="#9CA3AF"
          value={abhaAddr}
          editable={false}
        />
      </View>

      <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>State</Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>District</Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Pin Code</Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
        </View>
      </View>

      <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Email address</Text>
          <TextInput
            style={[fS.input, s.lockedInput]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            value={email}
            editable={false}
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Emergency contact</Text>
          <TextInput
            style={fS.input}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>
        <InlineSelect
          label="Consultation Type *"
          value={null}
          options={["NEW Patient", "Emergency", "Follow-up", "Referral"]}
          onSelect={() => {}}
          placeholder="Select type"
        />
      </View>

      <View style={s.footerRow}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: "#2563EB" }]}
          // onPress={() =>
          //   onFlowComplete &&
          //   onFlowComplete({
          //     fullName,
          //     mobile: preferredMobile || mobile,
          //     gender,
          //     dob,
          //     abhaNumber: "9876-5623-5412-6325",
          //     abhaAddress: abhaAddr,
          //   })
          // }
          onPress={() => {
            setOuterStep(3);
            slideAnim.setValue(1);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text style={s.primaryBtnText}>🪪 Create ABHA ID ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderHospitalInfo = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={isMobile ? s.scrollMobile : s.scroll}
    >
      <Text style={s.pageTitle}>Hospital Details</Text>

      <View style={[fS.row, { zIndex: 50 }]}>
        <InlineSelect
          label="Department *"
          value={hospitalInfo.department}
          options={DEPARTMENTS}
          onSelect={(v) => setH("department", v)}
          placeholder="Select"
        />
        <InlineSelect
          label="Doctor *"
          value={hospitalInfo.doctor}
          options={DOCTORS}
          onSelect={(v) => setH("doctor", v)}
          placeholder="Any Available"
        />
      </View>

      <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>
            Appointment Date <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={fS.input}
            placeholder="dd-mm-yyyy"
            placeholderTextColor="#9CA3AF"
            value={hospitalInfo.appointmentDate}
            onChangeText={(v) => setH("appointmentDate", v)}
          />
        </View>
        <InlineSelect
          label="Time Slot"
          value={hospitalInfo.timeSlot}
          options={TIME_SLOTS}
          onSelect={(v) => setH("timeSlot", v)}
          placeholder="Select"
        />
      </View>

      <View style={isMobile ? mfS.col : fS.row}>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>WARD / Room</Text>
          <TextInput
            style={fS.input}
            placeholder="E.g OPD Room"
            placeholderTextColor="#9CA3AF"
            value={hospitalInfo.ward}
            onChangeText={(v) => setH("ward", v)}
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Referral (if any)</Text>
          <TextInput
            style={fS.input}
            placeholder="Referred by doctor"
            placeholderTextColor="#9CA3AF"
            value={hospitalInfo.referral}
            onChangeText={(v) => setH("referral", v)}
          />
        </View>
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={fS.label}>
          Presenting Symptoms / Chief Complaint{" "}
          <Text style={{ color: "#EF4444" }}>*</Text>
        </Text>
        <TextInput
          style={[fS.input, { height: 70, textAlignVertical: "top" }]}
          placeholder="Describe the patient's main complaint or symptoms"
          placeholderTextColor="#9CA3AF"
          multiline
          value={hospitalInfo.chiefComplaint}
          onChangeText={(v) => setH("chiefComplaint", v)}
        />
      </View>

      <View style={[fS.row, { zIndex: 40 }]}>
        <InlineSelect
          label="Insurer"
          value={hospitalInfo.insurer}
          options={INSURERS}
          onSelect={(v) => setH("insurer", v)}
        />
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Policy / Member ID</Text>
          <TextInput
            style={fS.input}
            placeholder="Policy number"
            placeholderTextColor="#9CA3AF"
            value={hospitalInfo.policyNumber}
            onChangeText={(v) => setH("policyNumber", v)}
          />
        </View>
        <View style={isMobile ? mfS.col : fS.row}>
          <Text style={fS.label}>Consultation Fee (₹)</Text>
          <TextInput
            style={fS.input}
            placeholder="500"
            placeholderTextColor="#9CA3AF"
            value={hospitalInfo.consultationFee}
            onChangeText={(v) => setH("consultationFee", v)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={s.footerRow}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => {
            setOuterStep(1);
          }}
        >
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={() => {
            setOuterStep(4);
            slideAnim.setValue(1);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text style={s.primaryBtnText}>Review & Confirm ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderConfirmStep = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={isMobile ? s.scrollMobile : s.scroll}
    >
      <Text style={s.pageTitle}>Registration Summary</Text>

      <View style={confirmS.grid}>
        {/* Patient Details column */}
        <View style={confirmS.col}>
          <Text style={confirmS.colTitle}>Patient Details</Text>
          <View style={confirmS.box}>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Full Name</Text>
              <Text style={confirmS.value}>{fullName || "—"}</Text>
            </View>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Age / Gender</Text>
              <Text style={confirmS.value}>
                {age || "—"} Yrs / {gender}
              </Text>
            </View>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Mobile</Text>
              <Text style={confirmS.value}>
                {preferredMobile || mobile || "—"}
              </Text>
            </View>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Registration Method</Text>
              <Text style={confirmS.value}>ABHA Created (New)</Text>
            </View>
          </View>
        </View>

        {/* Hospital Info column */}
        <View style={confirmS.col}>
          <Text style={confirmS.colTitle}>Hospital INFO</Text>
          <View style={confirmS.box}>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Department</Text>
              <Text style={confirmS.value}>
                {hospitalInfo.department || "—"}
              </Text>
            </View>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Doctor</Text>
              <Text style={confirmS.value}>{hospitalInfo.doctor || "—"}</Text>
            </View>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Date & Slot</Text>
              <Text style={confirmS.value}>
                {hospitalInfo.appointmentDate} {hospitalInfo.timeSlot}
              </Text>
            </View>
            <View style={confirmS.row}>
              <Text style={confirmS.label}>Consultation Fee</Text>
              <Text style={confirmS.value}>
                ₹ {hospitalInfo.consultationFee || "—"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[s.footerRow, { marginTop: 24 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => setOuterStep(3)}>
          <Text style={{ fontSize: 13, color: "#374151", fontWeight: "500" }}>
            Edit details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: "#16A34A" }]}
          onPress={() => setShowConfirmModal(true)}
        >
          <Text style={s.primaryBtnText}>✓ Confirm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // return (
  //   <View style={{ flex: 1, backgroundColor: "#fff" }}>
  //     <OuterStepIndicator />
  //     <InnerStepIndicator currentStep={subStep} />

  //     <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
  //       {subStep === 1 && renderStep1()}
  //       {/* {subStep === 2 && renderStep2()} */}
  //       {subStep === 3 && renderStep3()}
  //       {subStep === 4 && renderStep4()}
  //       {subStep === 5 && renderStep5()}
  //     </Animated.View>
  //   </View>
  // );
  // Replace the return block:
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {isMobile ? (
        <MobileOuterStepIndicator currentStep={outerStep} />
      ) : (
        <OuterStepIndicator currentStep={outerStep} />
      )}

      {/* Inner sub-step bar sirf ABHA creation steps mein dikhao */}
      {outerStep === 1 && (
        isMobile ? (
          <MobileInnerStepIndicator currentStep={subStep} />
        ) : (
          <InnerStepIndicator currentStep={subStep} />
        )
      )}

      <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
        {outerStep === 1 && subStep === 1 && renderStep1()}
        {/* {outerStep === 1 && subStep === 2 && renderStep2()} OTP modal */}
        {outerStep === 1 && subStep === 3 && renderStep3()}
        {/* {outerStep === 1 && subStep === 4 && renderStep4()} */}
        {outerStep === 1 && subStep === 5 && renderStep5()}
        {outerStep === 3 && renderHospitalInfo()}
        {outerStep === 4 && renderConfirmStep()}
      </Animated.View>

      <ConfirmationModal
        visible={showConfirmModal}
        data={{
          ...hospitalInfo,
          fullName,
          mobile: preferredMobile || mobile,
          age,
          gender,
          abhaNumber: abhaNumber,
        }}
        onClose={() => setShowConfirmModal(false)}
        onNewRegistration={() => {
          setShowConfirmModal(false);
          onBack && onBack();
        }}
      />
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────────────────
const oS = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  circleDone: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  circleActive: { borderColor: "#2563EB" },
  circleNum: { fontSize: 12, fontWeight: "600", color: "#9CA3AF" },
  circleNumActive: { color: "#2563EB" },
  checkmark: { fontSize: 13, color: "#fff", fontWeight: "700" },
  stepLabel: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
  stepLabelActive: { color: "#111827" },
  stepSub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  lineDone: { backgroundColor: "#2563EB" },
});
const iS = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#F8FAFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  item: { alignItems: "center", gap: 4 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  dotDone: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  dotActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  dotCheck: { fontSize: 11, color: "#fff", fontWeight: "700" },
  dotNum: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
  dotNumActive: { color: "#2563EB" },
  label: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  labelActive: { color: "#2563EB", fontWeight: "700" },
  labelDone: { color: "#6B7280" },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 6,
    alignSelf: "center",
    marginBottom: 14,
  },
  lineDone: { backgroundColor: "#2563EB" },
});
const fS = StyleSheet.create({
  group: {
    flex: 1,
    position: "relative",
    overflow: "visible",
    marginBottom: 14,
  },
  label: { fontSize: 12, color: "#111111", marginBottom: 5, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#080808",
    backgroundColor: "#fff",
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  menu: {
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
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  row: { flexDirection: "row", gap: 16, overflow: "visible" },
});
const s = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 40 },
  scrollMobile: { padding: 16, paddingBottom: 40 },
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  pageTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  gatewayBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  gatewayText: { fontSize: 12, color: "#1E40AF", fontWeight: "600" },

  // Alerts
  secureAlert: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 14,
  },
  warningAlert: {
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginTop: 8,
  },

  // Input basics
  label: { fontSize: 12, color: "#111111", marginBottom: 5, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#080808",
    backgroundColor: "#fff",
  },
  lockedInput: { backgroundColor: "#F9FAFB", color: "#6B7280" },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
    marginBottom: 14,
  },
  orDivider: {
    paddingBottom: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  // Consent checkboxes
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderRadius: 4,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: "#2563EB" },
  checkLabel: { fontSize: 12, color: "#374151", flex: 1, lineHeight: 18 },

  // Section divider
  sectionDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },

  // Footer
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 9,
  },
  primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // OTP center card
  centerCard: {
    backgroundColor: "#F8FAFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 28,
    alignItems: "center",
    marginBottom: 8,
  },
  otpIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  otpCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  otpCardSub: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  resendRow: { flexDirection: "row", alignItems: "center" },
  otpTimerRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  otpOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  otpModalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 32,
    width: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 30,
  },
  otpModalBoxMobile: {
    width: "92%",
    padding: 20,
    borderRadius: 12,
  },

  // ABHA Address step
  suggestionRow: { marginBottom: 14 },
  suggestionChip: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  suggestionChipText: { fontSize: 13, color: "#1E40AF", fontWeight: "600" },
  abhaInputRow: { flexDirection: "row", alignItems: "center" },
  abdmSuffix: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#F9FAFB",
  },
  validRow: { marginTop: 4 },

  // Success step
  successCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 8,
  },
  successIconWrap: { marginBottom: 12 },
  successTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 13,
    color: "#166534",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  abhaCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  abhaCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  abhaCardTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },
  abhaLiveBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  abhaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  abhaAvatarLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  abhaIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#F0FDF4",
  },
  abhaIdLabel: { fontSize: 12, color: "#6B7280" },
  abhaIdValue: { fontSize: 12, fontWeight: "700", color: "#111827" },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  qBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  suggestionTile: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
  },
  suggestionTileActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  suggestionTileText: { fontSize: 13, fontWeight: "600", color: "#374151" },
});
const confirmS = StyleSheet.create({
  grid: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  colTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  box: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  row: { marginBottom: 14 },
  label: {
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  value: { fontSize: 14, color: "#111827", fontWeight: "600" },
});
const confS = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 380,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 30,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E3A8A",
    padding: 16,
  },
  hospitalName: { fontSize: 13, fontWeight: "700", color: "#fff" },
  hospitalSub: { fontSize: 11, color: "#BFDBFE", marginTop: 2 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tokenLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  tokenBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tokenNum: { fontSize: 20, fontWeight: "700", color: "#1E3A8A" },
  doctorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  doctorSpec: {
    fontSize: 12,
    color: "#6B7280",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { fontSize: 13, fontWeight: "700", color: "#1D4ED8" },
  patientName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  patientAge: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  fee: { fontSize: 16, fontWeight: "700", color: "#111827" },
  phone: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  detailsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  detailItem: { flex: 1 },
  detailLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  abhaBadge: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  abhaText: { fontSize: 12, color: "#1E40AF", fontWeight: "500" },
  actions: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  printBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
  newRegBtn: {
    flex: 2,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
  },
});
// ─── MOBILE OUTER STEP STYLES ─────────────────────────────────
const moS = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  stepItem: { alignItems: "center", gap: 4 },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  circleDone: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  circleActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  circleNum: { fontSize: 10, fontWeight: "600", color: "#9CA3AF" },
  circleNumActive: { color: "#2563EB" },
  checkmark: { fontSize: 10, color: "#fff", fontWeight: "700" },
  label: {
    fontSize: 9,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 12,
  },
  labelActive: { color: "#2563EB", fontWeight: "700" },
  labelDone: { color: "#6B7280" },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
    marginBottom: 16,
  },
  lineDone: { backgroundColor: "#2563EB" },
});

// ─── MOBILE INNER STEP STYLES ─────────────────────────────────
const miS = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  item: { alignItems: "center", gap: 3 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  dotDone: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  dotActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  dotCheck: { fontSize: 9, color: "#fff", fontWeight: "700" },
  dotNum: { fontSize: 9, fontWeight: "600", color: "#9CA3AF" },
  dotNumActive: { color: "#2563EB" },
  label: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 12,
  },
  labelActive: { color: "#2563EB", fontWeight: "700" },
  labelDone: { color: "#6B7280" },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
    alignSelf: "center",
    marginBottom: 14,
  },
  lineDone: { backgroundColor: "#2563EB" },
});

// ─── MOBILE FORM COLUMN (replaces fS.row on mobile) ───────────
const mfS = StyleSheet.create({
  col: { flexDirection: "column", gap: 0, overflow: "visible" },
});

export default AbhaNewPatient;
