import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { useRole } from "../../contexts/RoleContext";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  validatePhoneNumber,
  buildFullPhoneNumber,
  detectCountryCode,
  getCountryByCode,
} from "../../utils/countryCodes";

const WEB_CARD_WIDTH = 300;

const PatientAuthModal = ({
  visible,
  onRequestClose,
  initialMode = "signup",
  onDoctorRegister,
}) => {
  const navigation = useNavigation();
  const {
    signup: signupHandler,
    requestSignupOtp: requestSignupOtpHandler,
    requestLoginOtp: requestLoginOtpHandler,
    loginWithOtp: loginWithOtpHandler,
  } = useContext(AuthContext);
  const { setRole } = useRole();

  const bottomAnim = useRef(new Animated.Value(0)).current;
  const otpTimerRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const [cardWidth, setCardWidth] = useState(null);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStatus, setOtpStatus] = useState("idle");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [signupIdentifier, setSignupIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otpFlow, setOtpFlow] = useState(null);
  const [otpTargetPhone, setOtpTargetPhone] = useState("");
  const [loginCountryCode, setLoginCountryCode] =
    useState(DEFAULT_COUNTRY_CODE);
  const [signupCountryCode, setSignupCountryCode] =
    useState(DEFAULT_COUNTRY_CODE);
  const [isLoginCountryDropdownOpen, setIsLoginCountryDropdownOpen] =
    useState(false);
  const [isSignupCountryDropdownOpen, setIsSignupCountryDropdownOpen] =
    useState(false);

  useEffect(() => {
    const width =
      Platform.OS === "web"
        ? WEB_CARD_WIDTH
        : Dimensions.get("window").width * 0.9;
    setCardWidth(width);
  }, []);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!visible) {
      resetFlow();
      return;
    }

    if (Platform.OS !== "web") {
      bottomAnim.setValue(Dimensions.get("window").height);
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 300,
        easing: Animated.Easing?.out?.(Animated.Easing?.ease) || undefined,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, bottomAnim]);

  useEffect(() => {
    if (otpCountdown <= 0) {
      clearOtpTimer();
      return;
    }

    clearOtpTimer();
    otpTimerRef.current = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearOtpTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearOtpTimer();
    };
  }, [otpCountdown]);

  useEffect(() => {
    return () => {
      clearOtpTimer();
    };
  }, []);

  const sanitizeDigits = (value = "") => value.replace(/\D/g, "");
  const normalizedDigits = sanitizeDigits(mobile);

  // Get current country code based on mode
  const currentCountryCode =
    mode === "login" ? loginCountryCode : signupCountryCode;
  const currentPhoneValue =
    mode === "login" ? loginIdentifier : signupIdentifier;
  const phoneDigits = sanitizeDigits(currentPhoneValue);
  const isPhoneValid = validatePhoneNumber(phoneDigits, currentCountryCode);
  const isOtpComplete = otp.trim().length === 4;

  const detectInputType = (value) => {
    if (!value || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.includes("@")) {
      return "email";
    }
    const digitsOnly = sanitizeDigits(trimmed);
    if (digitsOnly.length >= 8) {
      return "phone";
    }
    if (/^[\d+\s-]+$/.test(trimmed)) {
      return "phone";
    }
    if (trimmed.includes(".")) {
      return "email";
    }
    return null;
  };

  const handleLoginIdentifierChange = (value) => {
    // Allow email or phone input
    setLoginIdentifier(value);
    const detectedType = detectInputType(value);
    if (detectedType === "phone") {
      setMobile(value);
      // Auto-detect country code if number starts with +
      if (value.trim().startsWith("+")) {
        const detected = detectCountryCode(value);
        setLoginCountryCode(detected);
      }
    }
  };

  const handleSignupIdentifierChange = (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSignupIdentifier("");
      setMobile("");
      return;
    }

    // Auto-detect country code if number starts with +
    if (trimmed.startsWith("+")) {
      const detected = detectCountryCode(trimmed);
      setSignupCountryCode(detected);
    }

    const digitsOnly = sanitizeDigits(trimmed);
    const normalized =
      trimmed.startsWith("+") && digitsOnly ? `+${digitsOnly}` : digitsOnly;

    setSignupIdentifier(normalized);
    setMobile(normalized);
  };

  const clearOtpTimer = () => {
    if (otpTimerRef.current) {
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = null;
    }
  };

  const buildPhoneNumber = (phoneValue = null, countryCodeOverride = null) => {
    // Use provided value, or fall back to mobile state, or signupIdentifier/loginIdentifier
    const valueToUse =
      phoneValue || mobile || signupIdentifier || loginIdentifier;
    const trimmed = valueToUse.trim();
    if (!trimmed) return "";

    // If already has + prefix, return as-is
    if (trimmed.startsWith("+")) {
      return trimmed;
    }

    // Use provided country code or current mode's country code
    const countryCode =
      countryCodeOverride ||
      (otpFlow === "signup" ? signupCountryCode : loginCountryCode) ||
      currentCountryCode ||
      DEFAULT_COUNTRY_CODE;

    return buildFullPhoneNumber(trimmed, countryCode);
  };

  const resetFlow = () => {
    clearOtpTimer();
    setOtpStatus("idle");
    setOtpCountdown(0);
    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(false);
    setIsSigningUp(false);
    setMobile("");
    setOtp("");
    setEmail("");
    setLoginIdentifier("");
    setSignupIdentifier("");
    setFullName("");
    setOtpFlow(null);
    setOtpTargetPhone("");
    setShowOtpModal(false);
    setLoginCountryCode(DEFAULT_COUNTRY_CODE);
    setSignupCountryCode(DEFAULT_COUNTRY_CODE);
    setIsLoginCountryDropdownOpen(false);
    setIsSignupCountryDropdownOpen(false);
  };

  const sendOtpForFlow = async ({ phoneNumber, flow }) => {
    if (!phoneNumber) {
      setErrorMessage("Please enter a valid mobile number.");
      return false;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtp("");
    setOtpStatus("sending");
    try {
      if (flow === "signup") {
        // Email is required for signup, OTP sent ONLY to email
        const signupEmail = email.trim();
        if (!signupEmail) {
          setErrorMessage("Email is required for signup.");
          setOtpStatus("idle");
          setIsProcessing(false);
          return false;
        }
        await requestSignupOtpHandler({
          phoneNumber,
          email: signupEmail,
          role: "user",
        });
        setInfoMessage("OTP sent to your email address.");
      } else {
        // For login, use identifier with preferred channel (default email)
        await requestLoginOtpHandler({
          identifier: phoneNumber,
          preferredChannel: "email",
        });
        setInfoMessage("OTP sent to your email address.");
      }
      setOtpFlow(flow);
      setOtpTargetPhone(phoneNumber);
      setOtpStatus("sent");
      setOtpCountdown(60);
      setShowOtpModal(true);
      return true;
    } catch (error) {
      setOtpStatus("idle");
      setErrorMessage(getErrorMessage(error));
      setOtpFlow(null);
      setOtpTargetPhone("");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendSignupOtp = async () => {
    const valueToUse = signupIdentifier || mobile;
    if (!valueToUse || !valueToUse.trim()) {
      setErrorMessage("Please enter your mobile number.");
      return false;
    }

    const digitsOnly = sanitizeDigits(valueToUse);
    if (!validatePhoneNumber(digitsOnly, signupCountryCode)) {
      const country = getCountryByCode(signupCountryCode);
      setErrorMessage(
        `Please enter a valid mobile number for ${country.name}.`
      );
      return false;
    }

    const phoneNumber = buildPhoneNumber(valueToUse, signupCountryCode);
    if (!phoneNumber) {
      setErrorMessage("Please enter a valid mobile number.");
      return false;
    }

    setMobile(valueToUse);
    return sendOtpForFlow({ phoneNumber, flow: "signup" });
  };

  const handleVerifyOtp = async () => {
    if (!isOtpComplete) {
      setErrorMessage("Please enter the 4-digit OTP.");
      return null;
    }

    if (!otpTargetPhone || !otpFlow) {
      setErrorMessage("OTP session expired. Please request a new OTP.");
      return null;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtpStatus("verifying");
    try {
      if (otpFlow === "signup") {
        // Directly call signup with phone + OTP (no separate verify step)
        try {
          await handleCompleteProfile(otpTargetPhone, otp.trim());
          setOtpStatus("verified");
          setOtpFlow(null);
          setOtpTargetPhone("");
          setShowOtpModal(false);
          return true;
        } catch (profileError) {
          // handleCompleteProfile already handles its own errors
          // Keep modal open so user can see the error
          setOtpStatus("sent");
          setIsProcessing(false);
          return null;
        }
      }

      if (otpFlow === "login") {
        // Use identifier (can be email or phone) - use the original login identifier
        const identifier = loginIdentifier.trim() || otpTargetPhone;
        const result = await loginWithOtpHandler({
          identifier: identifier,
          otp: otp.trim(),
        });
        setOtpStatus("verified");
        setOtpFlow(null);
        setOtpTargetPhone("");
        setInfoMessage("Login successful! Redirecting...");
        setShowOtpModal(false);
        setIsProcessing(false);

        // Close modal first
        onRequestClose();

        // Navigate based on role immediately after login
        const userRole = result?.role;
        if (userRole === "doctor") {
          // Navigate to doctor dashboard
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "DoctorAppNavigation",
                  params: { screen: "Dashboard" },
                },
              ],
            });
          }, 100);
        } else if (userRole === "user") {
          // User stays on LandingPage or navigates to patient dashboard
          // Navigation will be handled by LandingPageWithAuth component
          setTimeout(() => {
            navigation.navigate("LandingPage");
          }, 100);
        }

        return result;
      }
      setIsProcessing(false);
      return null;
    } catch (error) {
      setOtpStatus("sent");
      setErrorMessage(getErrorMessage(error));
      setIsProcessing(false);
      return null;
    }
  };

  const handleCompleteProfile = async (
    phoneNumberOverride = null,
    otpOverride = null
  ) => {
    const nameToUse = fullName.trim();
    const phoneNumberToUse =
      phoneNumberOverride || otpTargetPhone || buildPhoneNumber();
    const otpToUse = otpOverride || otp.trim();

    if (!nameToUse) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    const emailToUse = email.trim();
    if (!emailToUse) {
      setErrorMessage("Email is required for signup.");
      return;
    }
    if (!phoneNumberToUse || !otpToUse) {
      setErrorMessage("Phone number and OTP are required.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsSigningUp(true);
    setIsProcessing(true);

    try {
      await signupHandler({
        name: nameToUse,
        phoneNumber: phoneNumberToUse,
        email: emailToUse,
        otp: otpToUse,
      });

      setRole("patient");
      await AsyncStorage.setItem("userRole", "patient");

      setInfoMessage("Signup successful! Redirecting...");
      setIsSigningUp(false);
      setIsProcessing(false);

      setTimeout(() => {
        onRequestClose();
      }, 1500);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      setIsSigningUp(false);
      setIsProcessing(false);
      throw error; // Re-throw so caller knows signup failed
    }
  };

  const handleSendLoginOtp = async () => {
    if (isProcessing) return;

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setErrorMessage("Please enter your email address or mobile number.");
      return;
    }

    const detectedType = detectInputType(identifier);

    if (detectedType === "email") {
      // Email login - send OTP directly
      setErrorMessage("");
      setInfoMessage("");
      setIsProcessing(true);
      setOtp("");
      setOtpStatus("sending");
      try {
        await requestLoginOtpHandler({ identifier, preferredChannel: "email" });
        setOtpFlow("login");
        setOtpTargetPhone(identifier); // Store identifier for later use
        setOtpStatus("sent");
        setOtpCountdown(60);
        setShowOtpModal(true);
        setInfoMessage("OTP sent to your email address.");
        return true;
      } catch (error) {
        setOtpStatus("idle");
        setErrorMessage(getErrorMessage(error));
        setOtpFlow(null);
        setOtpTargetPhone("");
        return false;
      } finally {
        setIsProcessing(false);
      }
    } else if (detectedType === "phone") {
      // Phone login - send OTP to email by default (prefer email)
      const digitsOnly = sanitizeDigits(identifier);
      if (!validatePhoneNumber(digitsOnly, loginCountryCode)) {
        const country = getCountryByCode(loginCountryCode);
        setErrorMessage(
          `Please enter a valid mobile number for ${country.name}.`
        );
        return;
      }

      const phoneNumber = buildPhoneNumber(identifier, loginCountryCode);
      if (!phoneNumber) {
        setErrorMessage("Please enter a valid mobile number.");
        return;
      }

      // Send OTP to email by default (prefer email)
      setErrorMessage("");
      setInfoMessage("");
      setIsProcessing(true);
      setOtp("");
      setOtpStatus("sending");
      try {
        await requestLoginOtpHandler({
          identifier: phoneNumber,
          preferredChannel: "email",
        });
        setOtpFlow("login");
        setOtpTargetPhone(phoneNumber);
        setOtpStatus("sent");
        setOtpCountdown(60);
        setShowOtpModal(true);
        setInfoMessage("OTP sent to your email address.");
        return true;
      } catch (error) {
        setOtpStatus("idle");
        setErrorMessage(getErrorMessage(error));
        setOtpFlow(null);
        setOtpTargetPhone("");
        return false;
      } finally {
        setIsProcessing(false);
      }
    } else {
      setErrorMessage("Please enter a valid email address or mobile number.");
      return;
    }
  };

  const handleNext = async () => {
    if (isProcessing) return;

    if (mode === "login") {
      await handleSendLoginOtp();
      return;
    }

    if (!validateSignupFields()) {
      return;
    }

    // Send OTP for signup - verification happens in OTP modal
    await handleSendSignupOtp();
  };

  const handleResendOtp = async () => {
    if (isProcessing || otpCountdown > 0 || !otpTargetPhone || !otpFlow) {
      return;
    }
    // Check if otpTargetPhone is email or phone
    const detectedType = detectInputType(otpTargetPhone);
    setIsProcessing(true);
    setErrorMessage("");
    try {
      if (otpFlow === "signup") {
        // Signup: resend OTP to email
        const signupEmail = email.trim();
        if (!signupEmail) {
          setErrorMessage("Email is required for signup.");
          setIsProcessing(false);
          return;
        }
        await requestSignupOtpHandler({
          phoneNumber: otpTargetPhone,
          email: signupEmail,
          role: "user",
        });
        setInfoMessage("OTP resent to your email address.");
      } else {
        // Login: resend OTP to email (default)
        await requestLoginOtpHandler({
          identifier: otpTargetPhone,
          preferredChannel: "email",
        });
        setInfoMessage("OTP resent to your email address.");
      }
      setOtpCountdown(60);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const validateSignupFields = () => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required for signup.");
      return false;
    }
    if (!signupIdentifier.trim()) {
      setErrorMessage("Please enter your mobile number.");
      return false;
    }
    const digitsOnly = sanitizeDigits(signupIdentifier);
    if (!validatePhoneNumber(digitsOnly, signupCountryCode)) {
      const country = getCountryByCode(signupCountryCode);
      setErrorMessage(
        `Please enter a valid mobile number for ${country.name}.`
      );
      return false;
    }
    return true;
  };

  // Login validation: accept email or phone
  const loginIdentifierType = detectInputType(loginIdentifier);
  const loginDigitsValid =
    loginIdentifierType === "phone"
      ? validatePhoneNumber(sanitizeDigits(loginIdentifier), loginCountryCode)
      : loginIdentifierType === "email";
  const showLoginPhoneError =
    loginIdentifier.trim().length > 0 &&
    loginIdentifierType === "phone" &&
    !loginDigitsValid;

  const signupDigitsValid = validatePhoneNumber(
    sanitizeDigits(signupIdentifier),
    signupCountryCode
  );
  const showSignupPhoneError =
    signupIdentifier.trim().length > 0 && !signupDigitsValid;
  const baseSignupValid = fullName.trim() && email.trim() && signupDigitsValid;

  const isLoginActionDisabled =
    !loginIdentifier.trim() ||
    (loginIdentifierType && !loginDigitsValid) ||
    isProcessing;

  const isPrimaryDisabled =
    mode === "login" ? isLoginActionDisabled : !baseSignupValid || isProcessing;

  if (cardWidth === null) {
    return null;
  }

  return (
    <>
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.card,
              Platform.OS === "web"
                ? { width: WEB_CARD_WIDTH, maxWidth: "150vw", minWidth: 350 }
                : [
                    styles.mobileCard,
                    {
                      width: Dimensions.get("window").width * 0.9,
                      minWidth: 200,
                      maxWidth: 420,
                      transform: [{ translateY: bottomAnim }],
                    },
                  ],
            ]}
          >
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  mode === "signup" && styles.modeToggleButtonActive,
                ]}
                onPress={() => {
                  setMode("signup");
                  resetFlow();
                }}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    mode === "signup" && styles.modeToggleTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  mode === "login" && styles.modeToggleButtonActive,
                ]}
                onPress={() => {
                  setMode("login");
                  resetFlow();
                }}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    mode === "login" && styles.modeToggleTextActive,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{
                width: cardWidth,
                maxHeight:
                  Platform.OS === "web"
                    ? 600
                    : Dimensions.get("window").height * 0.78,
              }}
              contentContainerStyle={{
                paddingBottom: 12,
              }}
              showsVerticalScrollIndicator={false}
            >
              {mode === "login" ? (
                <View
                  style={[
                    styles.slideBase,
                    { width: cardWidth, flexShrink: 0 },
                  ]}
                >
                  <Text style={styles.titleHead}>Welcome Back!</Text>
                  <Text style={styles.subtitle}>
                    Enter your email address or mobile number
                  </Text>

                  <Text style={styles.inputLabel}>
                    Email or Mobile Number{" "}
                    <Text style={styles.requiredIndicator}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="Enter email or mobile number"
                    placeholderTextColor="#d3d3d3"
                    style={styles.input}
                    keyboardType="default"
                    autoCapitalize="none"
                    value={loginIdentifier}
                    onChangeText={handleLoginIdentifierChange}
                  />
                  {showLoginPhoneError &&
                  detectInputType(loginIdentifier) === "phone" ? (
                    <Text style={styles.inlineErrorText}>
                      Please enter a valid mobile number for{" "}
                      {getCountryByCode(loginCountryCode).name}.
                    </Text>
                  ) : null}
                  {loginIdentifier.trim() &&
                  detectInputType(loginIdentifier) === null ? (
                    <Text style={styles.inlineErrorText}>
                      Please enter a valid email address or mobile number.
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      isPrimaryDisabled && styles.disabledBtn,
                    ]}
                    onPress={handleNext}
                    disabled={isPrimaryDisabled}
                  >
                    <Text style={styles.btnText}>
                      {isProcessing ? "Sending OTP..." : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    styles.slideBase,
                    { width: cardWidth, flexShrink: 0 },
                  ]}
                >
                  <Text style={styles.titleHead}>Join Kokoro Doctor</Text>

                  <TouchableOpacity
                    style={styles.doctorRegisterLinkTop}
                    onPress={() => {
                      onRequestClose();
                      onDoctorRegister?.();
                    }}
                  >
                    <Text style={styles.doctorRegisterText}>
                      Are you a doctor?{" "}
                      <Text style={styles.doctorRegisterLinkText}>
                        Register Here
                      </Text>
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>
                    Full Name <Text style={styles.requiredIndicator}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor="#d3d3d3"
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />

                  <Text style={styles.inputLabel}>
                    Mobile Number{" "}
                    <Text style={styles.requiredIndicator}>*</Text>
                  </Text>
                  <View style={styles.phoneContainer}>
                    <View style={styles.countryCodeContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          setIsSignupCountryDropdownOpen(
                            !isSignupCountryDropdownOpen
                          )
                        }
                        style={styles.countryCodeButton}
                      >
                        <Text style={styles.countryCodeText}>
                          {getCountryByCode(signupCountryCode).flag}{" "}
                          {signupCountryCode}
                        </Text>
                        <Ionicons
                          name={
                            isSignupCountryDropdownOpen
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={16}
                          color="#666"
                          style={{ marginLeft: 4 }}
                        />
                      </TouchableOpacity>
                      {isSignupCountryDropdownOpen && (
                        <View style={styles.countryDropdown}>
                          <ScrollView
                            style={styles.countryDropdownScroll}
                            nestedScrollEnabled
                          >
                            {COUNTRY_CODES.map((country) => (
                              <TouchableOpacity
                                key={country.code}
                                style={styles.countryDropdownItem}
                                onPress={() => {
                                  setSignupCountryCode(country.code);
                                  setIsSignupCountryDropdownOpen(false);
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
                      value={signupIdentifier}
                      onChangeText={handleSignupIdentifierChange}
                      maxLength={getCountryByCode(signupCountryCode).maxLength}
                    />
                  </View>
                  {showSignupPhoneError ? (
                    <Text style={styles.inlineErrorText}>
                      Please enter a valid mobile number for{" "}
                      {getCountryByCode(signupCountryCode).name}.
                    </Text>
                  ) : null}

                  <Text style={styles.inputLabel}>
                    Email <Text style={styles.requiredIndicator}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#d3d3d3"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      isPrimaryDisabled && styles.disabledBtn,
                    ]}
                    onPress={handleNext}
                    disabled={isPrimaryDisabled || isProcessing}
                  >
                    <Text style={styles.btnText}>
                      {isProcessing ? "Sending..." : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            {infoMessage ? (
              <Text style={styles.infoText}>{infoMessage}</Text>
            ) : null}

            {/* <TouchableOpacity onPress={onRequestClose} style={styles.closeBtn}>
              <Ionicons name="close" size={14} color="#9CA3AF" />
            </TouchableOpacity> */}
          </Animated.View>
        </View>
      </Modal>

      {/* Separate OTP Verification Modal */}
      <Modal transparent visible={showOtpModal} animationType="fade">
        <View style={styles.overlay}>
          <View
            style={[
              styles.card,
              Platform.OS === "web"
                ? { width: WEB_CARD_WIDTH, maxWidth: "90vw", minWidth: 320 }
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
                setOtp("");
                setOtpStatus("idle");
                setOtpCountdown(0);
                setOtpFlow(null);
                setOtpTargetPhone("");
              }}
            >
              <Ionicons name="close" size={14} color="#9CA3AF" />
            </TouchableOpacity>

            <Text style={styles.titleHead}>Verify OTP</Text>
            <Text style={styles.title}>
              Enter OTP sent to {otpTargetPhone || mobile || signupIdentifier}
            </Text>

            <Text style={styles.inputLabel}>Enter OTP</Text>
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#d3d3d3"
              keyboardType="numeric"
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
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
                (!isOtpComplete || isProcessing) && styles.disabledBtn,
              ]}
              onPress={handleVerifyOtp}
              disabled={!isOtpComplete || isProcessing}
            >
              <Text style={styles.btnText}>
                {isProcessing
                  ? otpFlow === "login"
                    ? "Verifying & Logging In..."
                    : "Verifying & Signing Up..."
                  : otpFlow === "login"
                  ? "Verify & Login"
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
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#F4F6F8",
    borderRadius: 8,
    padding: 4,
    marginBottom: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  modeToggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  modeToggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeToggleText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  modeToggleTextActive: {
    color: "#333",
  },
  slideBase: {
    alignItems: "center",
    flexShrink: 0,
    flexGrow: 0,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  titleHead: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    minWidth: 220,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    fontSize: 15,
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
    marginTop: 4,
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
    backgroundColor: "#f96166",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#f96166",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  doctorRegisterLink: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
    width: "100%",
  },
  doctorRegisterLinkTop: {
    marginBottom: 20,
    paddingVertical: 8,
    alignItems: "center",
    width: "100%",
  },
  doctorRegisterText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  doctorRegisterLinkText: {
    color: "#f96166",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 12,
    marginBottom: 2,
    textAlign: "left",
    width: "100%",
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
    top: 12,
    right: 12,
    backgroundColor: "rgba(244, 246, 248, 0.6)",
    borderRadius: 12,
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    opacity: 0.1,
  },
  resendBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f96166",
    backgroundColor: "transparent",
  },
  resendBtnText: {
    color: "#f96166",
    fontWeight: "600",
    fontSize: 14,
  },
  requiredIndicator: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
  },
  optionalIndicator: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "normal",
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

export default PatientAuthModal;
