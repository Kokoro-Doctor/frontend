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
} from "react-native";
import {
  requestAbhaLoginOtp,
  verifyAbhaLoginOtp,
} from "../../utils/AbhaExistingPatient";

// ─── CONSTANTS ────────────────────────────────────────────────
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
const CONSULTATION_TYPES = [
  "NEW Patient",
  "Emergency",
  "Follow-up",
  "Referral",
];
const INSURERS = [
  "None / Self-Pay",
  "Star Health",
  "HDFC Ergo",
  "ICICI Lombard",
  "Bajaj Allianz",
];
const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ─── STEP INDICATOR ───────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Verify ABHA", sub: "OTP Check" },
    { num: 2, label: "Patient Details", sub: "Demographics" },
    { num: 3, label: "Hospital Info", sub: "Dept & Doctor" },
    { num: 4, label: "Confirm & Book", sub: "Generate Token" },
  ];

  return (
    <View style={stepS.container}>
      {steps.map((step, idx) => {
        const done = step.num < currentStep;
        const active = step.num === currentStep;
        return (
          <React.Fragment key={step.num}>
            <View style={stepS.stepItem}>
              <View
                style={[
                  stepS.circle,
                  done && stepS.circleDone,
                  active && stepS.circleActive,
                ]}
              >
                {done ? (
                  <Text style={stepS.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[stepS.circleNum, active && stepS.circleNumActive]}
                  >
                    {step.num}
                  </Text>
                )}
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={[
                    stepS.stepLabel,
                    (active || done) && stepS.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                <Text style={stepS.stepSub}>{step.sub}</Text>
              </View>
            </View>
            {idx < steps.length - 1 && (
              <View style={[stepS.line, done && stepS.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const stepS = StyleSheet.create({
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

// ─── OTP MODAL ────────────────────────────────────────────────
const OTPModal = ({ visible, onVerify, onCancel, loading, error }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setOtp(["", "", "", "", "", ""]);
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

  const handleChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.replace(/\D/g, "").slice(0, 1);
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (newOtp.every((d) => d !== "") && newOtp[idx] !== "") {
      setTimeout(() => onVerify(newOtp.join("")), 300);
    }
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={otpS.overlay}>
        <Animated.View
          style={[
            otpS.box,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={otpS.title}>ABHA Verification OTP</Text>
          <Text style={otpS.subtitle}>Sent to ABHA-linked mobile number</Text>
          <Text style={otpS.prompt}>Enter 6 digit verification code</Text>
          <View style={otpS.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => (inputs.current[idx] = r)}
                style={[otpS.otpBox, digit && otpS.otpBoxFilled]}
                value={digit}
                onChangeText={(v) => handleChange(v, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>
          <View style={otpS.resendRow}>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>
              Didn&apos;t receive?{" "}
            </Text>
            <TouchableOpacity>
              <Text
                style={{ fontSize: 13, color: "#2563EB", fontWeight: "600" }}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
          {error ? (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                borderRadius: 8,
                padding: 10,
                width: "100%",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 12, color: "#DC2626" }}>⚠ {error}</Text>
            </View>
          ) : null}
          <View style={otpS.btnRow}>
            <TouchableOpacity style={otpS.cancelBtn} onPress={onCancel}>
              <Text
                style={{ fontSize: 13, color: "#374151", fontWeight: "500" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={otpS.verifyBtn}
              onPress={() => onVerify(otp.join(""))}
            >
              <Text style={otpS.verifyBtnText}>
                🛡 Verify and fetch details
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={[otpS.verifyBtn, { opacity: loading ? 0.6 : 1 }]}
              onPress={() => onVerify(otp.join(""))}
              disabled={loading}
            >
              <Text style={otpS.verifyBtnText}>
                {loading ? "Verifying..." : "🛡 Verify and fetch details"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const otpS = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
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
  title: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#6B7280", marginBottom: 20 },
  prompt: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 14,
  },
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  otpBox: {
    width: 48,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    backgroundColor: "#F9FAFB",
    textAlign: "center",
  },
  otpBoxFilled: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  resendRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  btnRow: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  verifyBtn: {
    flex: 2,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  verifyBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});

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
      <Text style={fS.label}>
        {label}
        {required && <Text style={{ color: "#EF4444" }}> *</Text>}
      </Text>
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
  inputDisabled: { backgroundColor: "#F9FAFB", color: "#9CA3AF" },
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 14,
    marginTop: 4,
  },
});

// ─── CONFIRMATION MODAL ───────────────────────────────────────
const ConfirmationModal = ({ visible, data, onClose, onNewRegistration }) => {
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

// ─── MAIN: AbhaExistingPatient ────────────────────────────────
// Props:
//   onBack : fn — "Back" on step 1 ABHA form → parent card selection pe wapas

const AbhaExistingPatient = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 1 state
  const [abhaNumber, setAbhaNumber] = useState("");
  const [abhaAddress, setAbhaAddress] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // Post-verify state
  const [abhaVerified, setAbhaVerified] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState(null);
  const [verifiedAbha, setVerifiedAbha] = useState("");

  // Step 2 state
  const [patientDetails, setPatientDetails] = useState({
    fullName: "",
    mobile: "",
    age: "",
    gender: "Male",
    bloodGroup: "",
    dob: "",
    address: "",
    state: "",
    district: "",
    pinCode: "",
    email: "",
    emergencyContact: "",
    consultationType: "",
  });

  // Step 3 state
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

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const setP = (k, v) => setPatientDetails((prev) => ({ ...prev, [k]: v }));
  const setH = (k, v) => setHospitalInfo((prev) => ({ ...prev, [k]: v }));
  const [txnId, setTxnId] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [sendOtpLoading, setSendOtpLoading] = useState(false);

  // ── Animated step transition ──────────────────────────────
  const goToStep = (nextStep) => {
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(1);
      setStep(nextStep);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const goBack = () => {
    if (step === 1) {
      onBack && onBack();
      return;
    }
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(-1);
      setStep((s) => s - 1);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  // ── OTP verify handler ────────────────────────────────────
  // const handleVerifyOtp = (otpVal) => {
  //   setShowOtp(false);
  //   // Simulate ABHA fetch
  //   const fetched = {
  //     fullName: "Rajesh Sharma",
  //     mobile: "+91 9874563210",
  //     age: "54",
  //     gender: "Male",
  //     address: "Address auto Filled",
  //     state: "Madhya Pradesh",
  //     district: "Bhopal",
  //     pinCode: "462001",
  //     email: "rajesh@example.com",
  //     emergencyContact: "+91 9823456789",
  //   };
  //   setVerifiedPatient({ name: "Rajesh Sharma", id: "KK-2024-08821", age: 54 });
  //   setPatientDetails((prev) => ({ ...prev, ...fetched }));
  //   setVerifiedAbha(abhaNumber || abhaAddress);
  //   setAbhaVerified(true);
  //   goToStep(2);
  // };
  const handleVerifyOtp = async (otpVal) => {
    if (!otpVal || otpVal.length < 6) return;
    setApiError("");
    setVerifyLoading(true);
    try {
      const res = await verifyAbhaLoginOtp({
        txnId,
        otp: otpVal,
        // kokoroJwt: "your_jwt_here",  // agar available ho
      });

      const profile = res.abha_profile || {};

      // Profile data patient details mein fill karo
      const fetched = {
        fullName:
          `${profile.firstName || ""} ${profile.middleName || ""} ${profile.lastName || ""}`.trim(),
        mobile: profile.mobile || "",
        age: profile.age || "",
        gender:
          profile.gender === "M"
            ? "Male"
            : profile.gender === "F"
              ? "Female"
              : "Other",
        dob: profile.dob || "",
        address: profile.address || "",
        state: profile.stateName || "",
        district: profile.districtName || "",
        pinCode: profile.pinCode || "",
        email: profile.email || "",
        emergencyContact: "",
      };

      setVerifiedPatient({
        name: fetched.fullName,
        id: profile.ABHANumber || abhaNumber,
        age: fetched.age,
      });
      setPatientDetails((prev) => ({ ...prev, ...fetched }));
      setVerifiedAbha(profile.ABHANumber || abhaNumber || abhaAddress);

      // Tokens save karo agar chahiye: res.tokens.token

      setAbhaVerified(true);
      setShowOtp(false);
      goToStep(2);
    } catch (err) {
      setApiError(err.message || "Verification failed. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const translateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-60, 0, 60],
  });

  // ── STEP 1: ABHA Input ────────────────────────────────────
  const renderStep1 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <View style={s.infoAlert}>
        <Text style={{ fontSize: 12, color: "rgba(77, 107, 204, 1)" }}>
          🛡 An OTP will be sent to the patient&apos;s ABHA-linked mobile number
          for identity verification.
        </Text>
      </View>

      <View style={s.abhaRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>ABHA Number (14-digit)*</Text>
          <TextInput
            style={s.input}
            placeholder="12-5968-7894-1234"
            placeholderTextColor="#9CA3AF"
            value={abhaNumber}
            onChangeText={setAbhaNumber}
            keyboardType="numeric"
          />
        </View>
        <View style={s.orDivider}>
          <Text style={{ fontSize: 12, color: "#9CA3AF", fontWeight: "600" }}>
            — OR —
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>ABHA Address</Text>
          <TextInput
            style={s.input}
            placeholder="name@abdm"
            placeholderTextColor="#9CA3AF"
            value={abhaAddress}
            onChangeText={setAbhaAddress}
          />
        </View>
      </View>

      <View style={s.consentRow}>
        <View style={s.checkbox}>
          <Text style={{ fontSize: 10, color: "#2563EB" }}>✓</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#374151", flex: 1 }}>
          I confirm the patient has consented to share their ABHA health records
          with this facility as per{" "}
          <Text style={{ color: "#2563EB", fontWeight: "600" }}>
            ABDM guidelines.
          </Text>
        </Text>
      </View>

      <View style={s.footerRow}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[
            s.continueBtn,
            { opacity: !abhaNumber && !abhaAddress ? 0.4 : 1 },
          ]}
          onPress={() => {
            if (abhaNumber || abhaAddress) setShowOtp(true);
          }}
        >
          <Text style={s.continueBtnText}>Send OTP & Fetch Details ›</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            s.continueBtn,
            {
              opacity:
                (!abhaNumber && !abhaAddress) || sendOtpLoading ? 0.4 : 1,
            },
          ]}
          disabled={sendOtpLoading || (!abhaNumber && !abhaAddress)}
          onPress={async () => {
            if (!abhaNumber && !abhaAddress) return;
            setApiError("");
            setSendOtpLoading(true);
            try {
              const res = await requestAbhaLoginOtp(abhaNumber || abhaAddress);
              setTxnId(res.txn_id);
              setShowOtp(true);
            } catch (err) {
              setApiError(
                err.message || "OTP request failed. Please try again.",
              );
            } finally {
              setSendOtpLoading(false);
            }
          }}
        >
          <Text style={s.continueBtnText}>
            {sendOtpLoading ? "Sending OTP..." : "Send OTP & Fetch Details ›"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* <OTPModal
        visible={showOtp}
        onVerify={handleVerifyOtp}
        onCancel={() => setShowOtp(false)}
      /> */}
      <OTPModal
        visible={showOtp}
        onVerify={handleVerifyOtp}
        onCancel={() => {
          setShowOtp(false);
          setApiError("");
        }}
        loading={verifyLoading}
        error={apiError}
      />
    </ScrollView>
  );

  // ── STEP 2: PATIENT DETAILS ───────────────────────────────
  const renderStep2 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      {abhaVerified && (
        <View style={s.verifiedBanner}>
          <View style={s.verifiedAvatar}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1D4ED8" }}>
              {(verifiedPatient?.name || "RS")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
              {verifiedPatient?.name}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              {verifiedPatient?.id} · Age {verifiedPatient?.age}
            </Text>
          </View>
          <View style={s.abhaBadgeSmall}>
            <Text style={{ fontSize: 11, color: "#16A34A", fontWeight: "600" }}>
              ✓ ABHA Verified
            </Text>
          </View>
        </View>
      )}

      <Text style={fS.sectionTitle}>Personal Details</Text>

      <View style={fS.row}>
        <View style={fS.group}>
          <Text style={fS.label}>
            Full Name <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={[fS.input, abhaVerified && fS.inputDisabled]}
            placeholder="Autofilled from ABHA"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.fullName}
            onChangeText={(v) => setP("fullName", v)}
            editable={!abhaVerified}
          />
        </View>
        <View style={fS.group}>
          <Text style={fS.label}>
            Mobile <Text style={{ color: "#EF4444" }}>*</Text>
          </Text>
          <TextInput
            style={[fS.input, abhaVerified && fS.inputDisabled]}
            placeholder="Registered mobile"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.mobile}
            onChangeText={(v) => setP("mobile", v)}
            keyboardType="phone-pad"
            editable={!abhaVerified}
          />
        </View>
      </View>

      <View style={fS.row}>
        <View style={fS.group}>
          <Text style={fS.label}>Age</Text>
          <TextInput
            style={fS.input}
            placeholder="Years"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.age}
            onChangeText={(v) => setP("age", v)}
            keyboardType="numeric"
          />
        </View>
        <InlineSelect
          label="Gender"
          required
          value={patientDetails.gender}
          options={GENDERS}
          onSelect={(v) => setP("gender", v)}
        />
      </View>

      <View style={fS.row}>
        <InlineSelect
          label="Blood Group"
          value={patientDetails.bloodGroup}
          options={BLOOD_GROUPS}
          onSelect={(v) => setP("bloodGroup", v)}
          placeholder="Select"
        />
        <View style={fS.group}>
          <Text style={fS.label}>Date of Birth</Text>
          <TextInput
            style={fS.input}
            placeholder="dd-mm-yyyy"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.dob}
            onChangeText={(v) => setP("dob", v)}
          />
        </View>
      </View>

      <View style={{ marginBottom: 14 }}>
        <Text style={fS.label}>Address</Text>
        <TextInput
          style={[fS.input, abhaVerified && fS.inputDisabled]}
          placeholder="Address auto Filled"
          placeholderTextColor="#9CA3AF"
          value={patientDetails.address}
          onChangeText={(v) => setP("address", v)}
          editable={!abhaVerified}
        />
      </View>

      <View style={fS.row}>
        <View style={fS.group}>
          <Text style={fS.label}>State</Text>
          <TextInput
            style={[fS.input, abhaVerified && fS.inputDisabled]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.state}
            onChangeText={(v) => setP("state", v)}
            editable={!abhaVerified}
          />
        </View>
        <View style={fS.group}>
          <Text style={fS.label}>District</Text>
          <TextInput
            style={[fS.input, abhaVerified && fS.inputDisabled]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.district}
            onChangeText={(v) => setP("district", v)}
            editable={!abhaVerified}
          />
        </View>
        <View style={fS.group}>
          <Text style={fS.label}>Pin Code</Text>
          <TextInput
            style={[fS.input, abhaVerified && fS.inputDisabled]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.pinCode}
            onChangeText={(v) => setP("pinCode", v)}
            editable={!abhaVerified}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={fS.row}>
        <View style={fS.group}>
          <Text style={fS.label}>Email Address</Text>
          <TextInput
            style={[fS.input, abhaVerified && fS.inputDisabled]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.email}
            onChangeText={(v) => setP("email", v)}
            editable={!abhaVerified}
            keyboardType="email-address"
          />
        </View>
        <View style={fS.group}>
          <Text style={fS.label}>Emergency Contact</Text>
          <TextInput
            style={[fS.input, abhaVerified && fS.inputDisabled]}
            placeholder="Auto filled"
            placeholderTextColor="#9CA3AF"
            value={patientDetails.emergencyContact}
            onChangeText={(v) => setP("emergencyContact", v)}
            editable={!abhaVerified}
            keyboardType="phone-pad"
          />
        </View>
        <InlineSelect
          label="Consultation Type"
          required
          value={patientDetails.consultationType}
          options={CONSULTATION_TYPES}
          onSelect={(v) => setP("consultationType", v)}
          placeholder="Select type"
        />
      </View>

      <View style={s.footerRow}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.continueBtn} onPress={() => goToStep(3)}>
          <Text style={s.continueBtnText}>Continue ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── STEP 3: HOSPITAL INFO ─────────────────────────────────
  const renderStep3 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <Text style={fS.sectionTitle}>Hospital Details</Text>

      <View style={[fS.row, { zIndex: 50 }]}>
        <InlineSelect
          label="Department"
          required
          value={hospitalInfo.department}
          options={DEPARTMENTS}
          onSelect={(v) => setH("department", v)}
          placeholder="Select"
        />
        <InlineSelect
          label="Doctor"
          required
          value={hospitalInfo.doctor}
          options={DOCTORS}
          onSelect={(v) => setH("doctor", v)}
          placeholder="Any Available"
        />
      </View>

      <View style={fS.row}>
        <View style={fS.group}>
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

      <View style={fS.row}>
        <View style={fS.group}>
          <Text style={fS.label}>WARD / Room</Text>
          <TextInput
            style={fS.input}
            placeholder="E.g OPD Room"
            placeholderTextColor="#9CA3AF"
            value={hospitalInfo.ward}
            onChangeText={(v) => setH("ward", v)}
          />
        </View>
        <View style={fS.group}>
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
        <View style={fS.group}>
          <Text style={fS.label}>Policy / Member ID</Text>
          <TextInput
            style={fS.input}
            placeholder="Policy number"
            placeholderTextColor="#9CA3AF"
            value={hospitalInfo.policyNumber}
            onChangeText={(v) => setH("policyNumber", v)}
          />
        </View>
        <View style={fS.group}>
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
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={{ fontSize: 13, color: "#374151" }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.continueBtn} onPress={() => goToStep(4)}>
          <Text style={s.continueBtnText}>Review & Confirm ›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── STEP 4: REVIEW & CONFIRM ──────────────────────────────
  const renderStep4 = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <Text style={fS.sectionTitle}>Registration Summary</Text>
      <View style={s.summaryGrid}>
        <View style={s.summaryCol}>
          <Text style={s.summaryColTitle}>Patient Details</Text>
          <View style={s.summaryBox}>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.summaryLabel}>Full Name</Text>
              <Text style={s.summaryValue}>
                {patientDetails.fullName || "—"}
              </Text>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.summaryLabel}>Age / Gender</Text>
              <Text style={s.summaryValue}>
                {patientDetails.age || "—"} Yrs / {patientDetails.gender}
              </Text>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.summaryLabel}>Mobile</Text>
              <Text style={s.summaryValue}>{patientDetails.mobile || "—"}</Text>
            </View>
            <View>
              <Text style={s.summaryLabel}>Registration Method</Text>
              <Text style={s.summaryValue}>ABHA Verified (existing)</Text>
            </View>
          </View>
        </View>
        <View style={s.summaryCol}>
          <Text style={s.summaryColTitle}>Hospital INFO</Text>
          <View style={s.summaryBox}>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.summaryLabel}>Department</Text>
              <Text style={s.summaryValue}>
                {hospitalInfo.department || "—"}
              </Text>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.summaryLabel}>Doctor</Text>
              <Text style={s.summaryValue}>{hospitalInfo.doctor || "—"}</Text>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={s.summaryLabel}>Date & Slot</Text>
              <Text style={s.summaryValue}>
                {hospitalInfo.appointmentDate} {hospitalInfo.timeSlot}
              </Text>
            </View>
            <View>
              <Text style={s.summaryLabel}>Consultation Fee</Text>
              <Text style={s.summaryValue}>
                ₹ {hospitalInfo.consultationFee || "—"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={[s.footerRow, { marginTop: 24 }]}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <Text style={{ fontSize: 13, color: "#374151", fontWeight: "500" }}>
            Edit details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.continueBtn, { backgroundColor: "#16A34A" }]}
          onPress={() => setShowConfirmModal(true)}
        >
          <Text style={s.continueBtnText}>✓ Confirm & Book</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── RESET (new registration) ──────────────────────────────
  const handleNewRegistration = () => {
    setShowConfirmModal(false);
    setStep(1);
    setAbhaNumber("");
    setAbhaAddress("");
    setAbhaVerified(false);
    setVerifiedPatient(null);
    setVerifiedAbha("");
    setPatientDetails({
      fullName: "",
      mobile: "",
      age: "",
      gender: "Male",
      bloodGroup: "",
      dob: "",
      address: "",
      state: "",
      district: "",
      pinCode: "",
      email: "",
      emergencyContact: "",
      consultationType: "",
    });
    setHospitalInfo({
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
    onBack && onBack(); // wapas card selection pe
  };

  const allData = {
    ...patientDetails,
    ...hospitalInfo,
    abhaNumber: verifiedAbha,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StepIndicator currentStep={step} />

      <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </Animated.View>

      <ConfirmationModal
        visible={showConfirmModal}
        data={allData}
        onClose={() => setShowConfirmModal(false)}
        onNewRegistration={handleNewRegistration}
      />
    </View>
  );
};

// ─── STYLES ───────────────────────────────────────────────────
const s = StyleSheet.create({
  // Step 1
  infoAlert: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 16,
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
  abhaRow: {
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
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderRadius: 3,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  // Shared footer
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
  continueBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 9,
  },
  continueBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  // Step 2 verified banner
  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    padding: 14,
    marginBottom: 20,
  },
  verifiedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  abhaBadgeSmall: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  // Step 4 summary
  summaryGrid: { flexDirection: "row", gap: 16 },
  summaryCol: { flex: 1 },
  summaryColTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  summaryValue: { fontSize: 14, color: "#111827", fontWeight: "600" },
});

export default AbhaExistingPatient;
