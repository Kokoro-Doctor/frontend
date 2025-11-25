import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage } from "../../utils/errorUtils";

const DoctorSignupModal = ({ visible, onRequestClose }) => {
  const navigation = useNavigation();
  const { doctorsSignup, requestSignupOtp, verifySignupOtp } = useAuth();
  const [doctorFullName, setDoctorFullName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [doctorSpecialization, setDoctorSpecialization] = useState("");
  const [doctorExperience, setDoctorExperience] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorOtp, setDoctorOtp] = useState("");
  const [doctorVerificationToken, setDoctorVerificationToken] = useState("");
  const [doctorOtpStatus, setDoctorOtpStatus] = useState("idle");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [doctorPassword, setDoctorPassword] = useState("");
  const [doctorPasswordVisible, setDoctorPasswordVisible] = useState(false);
  const [doctorPasswordTouched, setDoctorPasswordTouched] = useState(false);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    if (doctorOtpStatus !== "sent" || otpCountdown <= 0) return;

    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [doctorOtpStatus, otpCountdown]);

  const resetForm = () => {
    setDoctorFullName("");
    setDoctorPhone("");
    setDoctorSpecialization("");
    setDoctorExperience("");
    setDoctorEmail("");
    setDoctorOtp("");
    setDoctorVerificationToken("");
    setDoctorOtpStatus("idle");
    setOtpCountdown(0);
    setIsProcessing(false);
    setErrorMessage("");
    setInfoMessage("");
    setShowOtpModal(false);
    setDoctorPassword("");
    setDoctorPasswordVisible(false);
    setDoctorPasswordTouched(false);
  };

  const validateDoctorDetails = () => {
    if (!doctorFullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (!doctorSpecialization.trim()) {
      setErrorMessage("Please enter your specialization.");
      return false;
    }
    const parsedExperience = parseInt(doctorExperience, 10);
    if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
      setErrorMessage("Experience must be a valid number.");
      return false;
    }
    if (!doctorPhone.trim()) {
      setErrorMessage("Please enter your mobile number.");
      return false;
    }
    const digitsOnly = sanitizeDigits(doctorPhone);
    if (digitsOnly.length < 10) {
      setErrorMessage("Please enter a valid mobile number.");
      return false;
    }
    if (doctorPassword.trim().length < 6) {
      setDoctorPasswordTouched(true);
      setErrorMessage("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const sanitizeDigits = (value = "") => value.replace(/\D/g, "");

  const handleDoctorPhoneChange = (value = "") => {
    if (!value || !value.trim()) {
      setDoctorPhone("");
      return;
    }
    const trimmed = value.trim();
    const digitsOnly = sanitizeDigits(trimmed);
    if (!digitsOnly) {
      setDoctorPhone("");
      return;
    }
    if (trimmed.startsWith("+")) {
      setDoctorPhone(`+${digitsOnly}`);
      return;
    }
    setDoctorPhone(digitsOnly);
  };

  const buildDoctorPhoneNumber = () => {
    if (!doctorPhone || !doctorPhone.trim()) {
      return "";
    }
    const trimmed = doctorPhone.trim();
    const digitsOnly = sanitizeDigits(trimmed);
    if (!digitsOnly || digitsOnly.length < 10) {
      return "";
    }
    if (trimmed.startsWith("+")) {
      return `+${digitsOnly}`;
    }
    const localDigits = digitsOnly.slice(-10);
    return `+91${localDigits}`;
  };

  const handleSendVerification = async () => {
    if (!validateDoctorDetails()) {
      return;
    }
    const phoneNumber = buildDoctorPhoneNumber();
    if (!phoneNumber) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setDoctorOtpStatus("sending");

    try {
      await requestSignupOtp({ phoneNumber, role: "doctor" });
      setInfoMessage("OTP sent to your mobile number.");
      setDoctorOtpStatus("sent");
      setOtpCountdown(60);
      // Stack OTP modal on top of base doctor card
      setShowOtpModal(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setDoctorOtpStatus("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phoneNumber = buildDoctorPhoneNumber();
    if (!phoneNumber || !doctorOtp.trim()) {
      setErrorMessage("Please enter the OTP sent to your mobile.");
      return false;
    }

    setIsProcessing(true);
    setErrorMessage("");
    try {
      const response = await verifySignupOtp({
        phoneNumber,
        otp: doctorOtp.trim(),
        role: "doctor",
      });
      if (response?.verification_token) {
        setDoctorVerificationToken(response.verification_token);
        setDoctorOtpStatus("verified");
        // Don't close modal yet - wait for signup to complete
        try {
          // Call signup with the verification token
          await handleDoctorSignup(response.verification_token);
          // Only close modal after successful signup
          setShowOtpModal(false);
          return true;
        } catch (signupError) {
          // Keep modal open so user can see the error
          setDoctorOtpStatus("sent");
          setIsProcessing(false);
          return false;
        }
      }
      setErrorMessage("Verification failed. Please try again.");
      setDoctorOtpStatus("sent");
      setIsProcessing(false);
      return false;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setDoctorOtpStatus("sent");
      setIsProcessing(false);
      return false;
    }
  };

  const handleDoctorSignup = async (verificationTokenOverride) => {
    if (!validateDoctorDetails()) {
      return;
    }
    if (!doctorFullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!doctorSpecialization.trim()) {
      setErrorMessage("Please enter your specialization.");
      return;
    }
    if (!doctorExperience.trim()) {
      setErrorMessage("Please enter your years of experience.");
      return;
    }
    const parsedExperience = parseInt(doctorExperience, 10);
    if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
      setErrorMessage("Experience must be a valid number.");
      return;
    }

    const verificationToken =
      verificationTokenOverride || doctorVerificationToken;

    if (doctorPassword.trim().length < 6) {
      setDoctorPasswordTouched(true);
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      await doctorsSignup({
        verificationToken,
        name: doctorFullName.trim(),
        specialization: doctorSpecialization.trim(),
        experience: parsedExperience,
        email: doctorEmail.trim() || undefined,
        password: doctorPassword.trim(),
      });

      setInfoMessage("Doctor registration successful! Redirecting...");
      setTimeout(() => {
        setShowOtpModal(false);
        onRequestClose();
        navigation.navigate("DoctorAppNavigation", {
          screen: "DoctorMedicalRegistration",
        });
      }, 1500);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOtp = async () => {
    if (isProcessing || otpCountdown > 0) return;
    const phoneNumber = buildDoctorPhoneNumber();
    if (!phoneNumber) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }
    setIsProcessing(true);
    setErrorMessage("");
    try {
      await requestSignupOtp({ phoneNumber, role: "doctor" });
      setOtpCountdown(60);
      setInfoMessage("OTP resent to your mobile number.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const isDoctorPasswordValid = doctorPassword.trim().length >= 6;
  const showDoctorPasswordError =
    doctorPasswordTouched && !isDoctorPasswordValid;
  const doctorPhoneDigits = sanitizeDigits(doctorPhone);
  const isDoctorPhoneValid = doctorPhoneDigits.length >= 10;
  const showDoctorPhoneError =
    doctorPhone.trim().length > 0 && !isDoctorPhoneValid;

  return (
    <>
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={[
                styles.card,
                Platform.OS === "web"
                  ? { width: 320 }
                  : [
                      styles.mobileCard,
                      {
                        width: Dimensions.get("window").width * 0.9,
                        minWidth: 200,
                        maxWidth: 420,
                      },
                    ],
              ]}
            >
              <Text style={styles.titleHead}>Join Kokoro Doctor</Text>
              <Text style={[styles.title, { marginBottom: 20 }]}>
                Doctor Registration
              </Text>

              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#d3d3d3"
                style={styles.input}
                value={doctorFullName}
                onChangeText={setDoctorFullName}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>
                Mobile Number <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                placeholder="Mobile Number"
                placeholderTextColor="#d3d3d3"
                keyboardType="phone-pad"
                autoCapitalize="none"
                style={styles.input}
                value={doctorPhone}
                onChangeText={handleDoctorPhoneChange}
              />
              {showDoctorPhoneError ? (
                <Text style={styles.inlineErrorText}>
                  Please enter a valid 10-digit mobile number.
                </Text>
              ) : null}

              <Text style={styles.inputLabel}>
                Specialization <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                placeholder="e.g. Cardiologist"
                placeholderTextColor="#d3d3d3"
                style={styles.input}
                value={doctorSpecialization}
                onChangeText={setDoctorSpecialization}
                autoCapitalize="words"
              />

              <Text style={styles.inputLabel}>
                Years of Experience{" "}
                <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <TextInput
                placeholder="e.g. 5"
                placeholderTextColor="#d3d3d3"
                style={styles.input}
                keyboardType="numeric"
                value={doctorExperience}
                onChangeText={setDoctorExperience}
              />

              <Text style={styles.inputLabel}>
                Email <Text style={styles.optionalIndicator}>(optional)</Text>
              </Text>
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor="#d3d3d3"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={doctorEmail}
                onChangeText={setDoctorEmail}
              />

              <Text style={styles.inputLabel}>
                Create Password <Text style={styles.requiredIndicator}>*</Text>
              </Text>
              <View style={styles.passwordField}>
                <TextInput
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#d3d3d3"
                  style={styles.passwordInput}
                  secureTextEntry={!doctorPasswordVisible}
                  value={doctorPassword}
                  onChangeText={(value) => {
                    setDoctorPassword(value);
                    if (!doctorPasswordTouched) {
                      setDoctorPasswordTouched(true);
                    }
                  }}
                  onBlur={() => setDoctorPasswordTouched(true)}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() =>
                    setDoctorPasswordVisible((prevVisible) => !prevVisible)
                  }
                >
                  <Ionicons
                    name={doctorPasswordVisible ? "eye-off" : "eye"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {showDoctorPasswordError ? (
                <Text style={styles.inlineErrorText}>
                  Password must be at least 6 characters.
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.btn,
                  (isProcessing ||
                    !doctorFullName.trim() ||
                    !isDoctorPhoneValid ||
                    !doctorSpecialization.trim() ||
                    !doctorExperience.trim() ||
                    !isDoctorPasswordValid) &&
                    styles.disabledBtn,
                ]}
                onPress={handleSendVerification}
                disabled={
                  isProcessing ||
                  !doctorFullName.trim() ||
                  !isDoctorPhoneValid ||
                  !doctorSpecialization.trim() ||
                  !doctorExperience.trim() ||
                  !isDoctorPasswordValid
                }
              >
                <Text style={styles.btnText}>
                  {isProcessing ? "Processing..." : "Send OTP"}
                </Text>
              </TouchableOpacity>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
              {infoMessage ? (
                <Text style={styles.infoText}>{infoMessage}</Text>
              ) : null}

              <TouchableOpacity
                onPress={onRequestClose}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Separate OTP Verification Modal */}
      <Modal transparent visible={showOtpModal} animationType="fade">
        <View style={styles.overlay}>
          <View
            style={[
              styles.card,
              Platform.OS === "web"
                ? { width: 320, maxWidth: "90vw", minWidth: 300 }
                : [
                    styles.mobileCard,
                    {
                      width: Dimensions.get("window").width * 0.9,
                      minWidth: 200,
                      maxWidth: 420,
                    },
                  ],
            ]}
          >
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setShowOtpModal(false);
                setDoctorOtp("");
                setDoctorOtpStatus("idle");
                setOtpCountdown(0);
              }}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>

            <Text style={styles.titleHead}>Verify OTP</Text>
            <Text style={styles.title}>Enter OTP sent to {doctorPhone}</Text>

            <Text style={styles.inputLabel}>Enter OTP</Text>
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#d3d3d3"
              keyboardType="numeric"
              style={styles.input}
              value={doctorOtp}
              onChangeText={setDoctorOtp}
              maxLength={4}
              autoFocus
            />

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            {infoMessage && <Text style={styles.infoText}>{infoMessage}</Text>}

            <TouchableOpacity
              style={[
                styles.btn,
                (doctorOtp.trim().length !== 4 || isProcessing) &&
                  styles.disabledBtn,
              ]}
              onPress={handleVerifyOtp}
              disabled={doctorOtp.trim().length !== 4 || isProcessing}
            >
              <Text style={styles.btnText}>
                {isProcessing
                  ? "Verifying & Signing Up..."
                  : "Verify & Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resendBtn,
                (otpCountdown > 0 || isProcessing) && styles.disabledBtn,
              ]}
              onPress={handleResendOtp}
              disabled={otpCountdown > 0 || isProcessing}
            >
              <Text style={styles.resendBtnText}>
                {otpCountdown > 0
                  ? `Resend OTP in ${otpCountdown}s`
                  : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  mobileCard: {
    borderRadius: 16,
    paddingBottom: 20,
    maxHeight: "85%",
  },
  titleHead: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 10,
    marginBottom: 2,
    textAlign: "left",
    width: "100%",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 2,
    backgroundColor: "#FFFFFF",
    color: "#333",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    minHeight: 50,
    backgroundColor: "#FFFFFF",
  },
  countryCodeBox: {
    paddingHorizontal: 4,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 60,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    paddingLeft: 12,
    fontSize: 15,
    color: "#333",
    paddingVertical: 14,
  },
  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginTop: 2,
    marginBottom: 6,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#333",
  },
  passwordToggle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: "#1FBF86",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  resendInfo: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },
  resendBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1FBF86",
    backgroundColor: "transparent",
    width: "100%",
    alignItems: "center",
  },
  resendBtnText: {
    color: "#1FBF86",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    width: "100%",
  },
  infoText: {
    color: "#16a34a",
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    width: "100%",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  requiredIndicator: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 2,
  },
  optionalIndicator: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "normal",
    marginLeft: 4,
  },
  inlineErrorText: {
    width: "100%",
    color: "#DC2626",
    fontSize: 12,
    marginTop: -2,
    marginBottom: 6,
    textAlign: "left",
  },
});

export default DoctorSignupModal;
