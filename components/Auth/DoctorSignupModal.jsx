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
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  validatePhoneNumber,
  buildFullPhoneNumber,
  detectCountryCode,
  getCountryByCode,
} from "../../utils/countryCodes";

const DoctorSignupModal = ({ visible, onRequestClose }) => {
  const navigation = useNavigation();
  const { doctorsSignup, requestSignupOtp } = useAuth();
  const [doctorFullName, setDoctorFullName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [doctorSpecialization, setDoctorSpecialization] = useState("");
  const [doctorExperience, setDoctorExperience] = useState("");
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorOtp, setDoctorOtp] = useState("");
  const [doctorOtpStatus, setDoctorOtpStatus] = useState("idle");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [doctorCountryCode, setDoctorCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

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
    setDoctorOtpStatus("idle");
    setOtpCountdown(0);
    setIsProcessing(false);
    setErrorMessage("");
    setInfoMessage("");
    setShowOtpModal(false);
    setDoctorCountryCode(DEFAULT_COUNTRY_CODE);
    setIsCountryDropdownOpen(false);
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
    if (!validatePhoneNumber(digitsOnly, doctorCountryCode)) {
      const country = getCountryByCode(doctorCountryCode);
      setErrorMessage(`Please enter a valid mobile number for ${country.name}.`);
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
    
    // Auto-detect country code if number starts with +
    if (trimmed.startsWith("+")) {
      const detected = detectCountryCode(trimmed);
      setDoctorCountryCode(detected);
      const digitsOnly = sanitizeDigits(trimmed);
      setDoctorPhone(`+${digitsOnly}`);
      return;
    }
    
    const digitsOnly = sanitizeDigits(trimmed);
    if (!digitsOnly) {
      setDoctorPhone("");
      return;
    }
    setDoctorPhone(digitsOnly);
  };

  const buildDoctorPhoneNumber = () => {
    if (!doctorPhone || !doctorPhone.trim()) {
      return "";
    }
    const trimmed = doctorPhone.trim();
    
    // If already has + prefix, return as-is
    if (trimmed.startsWith("+")) {
      return trimmed;
    }
    
    return buildFullPhoneNumber(trimmed, doctorCountryCode);
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
      // Directly call signup with phone + OTP (no separate verify step)
      await handleDoctorSignup(phoneNumber, doctorOtp.trim());
      setDoctorOtpStatus("verified");
      setShowOtpModal(false);
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setDoctorOtpStatus("sent");
      setIsProcessing(false);
      return false;
    }
  };

  const handleDoctorSignup = async (phoneNumberOverride, otpOverride) => {
    if (!validateDoctorDetails()) {
      throw new Error("Validation failed");
    }

    const parsedExperience = parseInt(doctorExperience, 10);
    const phoneNumber = phoneNumberOverride || buildDoctorPhoneNumber();
    const otpToUse = otpOverride || doctorOtp.trim();

    if (!phoneNumber || !otpToUse) {
      setErrorMessage("Phone number and OTP are required.");
      throw new Error("Phone/OTP required");
    }

    setIsProcessing(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      await doctorsSignup({
        phoneNumber,
        otp: otpToUse,
        name: doctorFullName.trim(),
        specialization: doctorSpecialization.trim(),
        experience: parsedExperience,
        email: doctorEmail.trim() || undefined,
      });

      setInfoMessage("Doctor registration successful! Redirecting...");
      setTimeout(() => {
        setShowOtpModal(false);
        onRequestClose();
        navigation.navigate("DoctorAppNavigation", {
          screen: "Dashboard",
        });
      }, 1500);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error; // Re-throw so caller knows signup failed
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

  const doctorPhoneDigits = sanitizeDigits(doctorPhone);
  const isDoctorPhoneValid = validatePhoneNumber(doctorPhoneDigits, doctorCountryCode);
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
              <View style={styles.phoneContainer}>
                <View style={styles.countryCodeContainer}>
                  <TouchableOpacity
                    onPress={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    style={styles.countryCodeButton}
                  >
                    <Text style={styles.countryCodeText}>
                      {getCountryByCode(doctorCountryCode).flag} {doctorCountryCode}
                    </Text>
                    <Ionicons
                      name={isCountryDropdownOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#666"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                  {isCountryDropdownOpen && (
                    <View style={styles.countryDropdown}>
                      <ScrollView style={styles.countryDropdownScroll} nestedScrollEnabled>
                        {COUNTRY_CODES.map((country) => (
                          <TouchableOpacity
                            key={country.code}
                            style={styles.countryDropdownItem}
                            onPress={() => {
                              setDoctorCountryCode(country.code);
                              setIsCountryDropdownOpen(false);
                            }}
                          >
                            <Text style={styles.countryDropdownText}>
                              {country.flag} {country.code} {country.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <TextInput
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#d3d3d3"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  style={styles.phoneInput}
                  value={doctorPhone}
                  onChangeText={handleDoctorPhoneChange}
                  maxLength={getCountryByCode(doctorCountryCode).maxLength}
                />
              </View>
              {showDoctorPhoneError ? (
                <Text style={styles.inlineErrorText}>
                  Please enter a valid mobile number for {getCountryByCode(doctorCountryCode).name}.
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

              <TouchableOpacity
                style={[
                  styles.btn,
                  (isProcessing ||
                    !doctorFullName.trim() ||
                    !isDoctorPhoneValid ||
                    !doctorSpecialization.trim() ||
                    !doctorExperience.trim()) &&
                    styles.disabledBtn,
                ]}
                onPress={handleSendVerification}
                disabled={
                  isProcessing ||
                  !doctorFullName.trim() ||
                  !isDoctorPhoneValid ||
                  !doctorSpecialization.trim() ||
                  !doctorExperience.trim()
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
    marginTop: 2,
    marginBottom: 12,
    minHeight: 50,
    backgroundColor: "#FFFFFF",
    overflow: "visible",
  },
  countryCodeContainer: {
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
    paddingRight: 8,
    marginRight: 8,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  countryDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  countryDropdownScroll: {
    maxHeight: 200,
  },
  countryDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  countryDropdownText: {
    fontSize: 14,
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 4,
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
    // backgroundColor: "#FEE2E2",
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
    // backgroundColor: "#dcfce7",
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
