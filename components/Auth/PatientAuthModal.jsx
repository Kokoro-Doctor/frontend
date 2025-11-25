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

const WEB_CARD_WIDTH = 300;

const PatientAuthModal = ({
  visible,
  onRequestClose,
  initialMode = "login",
  onDoctorRegister,
}) => {
  const navigation = useNavigation();
  const {
    signup: signupHandler,
    requestSignupOtp: requestSignupOtpHandler,
    verifySignupOtp: verifySignupOtpHandler,
    requestLoginOtp: requestLoginOtpHandler,
    initiateLogin: initiateLoginHandler,
    loginWithPassword: loginWithPasswordHandler,
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
  const [verificationToken, setVerificationToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [signupIdentifier, setSignupIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loginStage, setLoginStage] = useState("phone");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhoneNumber, setLoginPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [otpFlow, setOtpFlow] = useState(null);
  const [otpTargetPhone, setOtpTargetPhone] = useState("");

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
  const isPhoneValid = normalizedDigits.length >= 10;
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
    if (loginStage !== "phone") {
      setLoginStage("phone");
      setLoginPassword("");
      setInfoMessage("");
    }
    setLoginIdentifier(value);
    const detectedType = detectInputType(value);
    if (detectedType === "phone") {
      setMobile(value);
    }
  };

  const handleSignupIdentifierChange = (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSignupIdentifier("");
      setMobile("");
      if (verificationToken) {
        setVerificationToken("");
        setPassword("");
        setPasswordTouched(false);
        setPasswordVisible(false);
      }
      return;
    }

    const digitsOnly = sanitizeDigits(trimmed);
    const normalized =
      trimmed.startsWith("+") && digitsOnly ? `+${digitsOnly}` : digitsOnly;

    setSignupIdentifier(normalized);
    setMobile(normalized);
    if (verificationToken) {
      setVerificationToken("");
      setPassword("");
      setPasswordTouched(false);
      setPasswordVisible(false);
    }
  };

  const clearOtpTimer = () => {
    if (otpTimerRef.current) {
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = null;
    }
  };

  const buildPhoneNumber = (phoneValue = null) => {
    // Use provided value, or fall back to mobile state, or signupIdentifier
    const valueToUse =
      phoneValue || mobile || signupIdentifier || loginIdentifier;
    const trimmed = valueToUse.trim();
    if (!trimmed) return "";
    const digitsOnly = sanitizeDigits(trimmed);
    if (!digitsOnly) return "";
    if (trimmed.startsWith("+")) {
      return `+${digitsOnly}`;
    }
    const localDigits = digitsOnly.slice(-10);
    return `+91${localDigits}`;
  };

  const resetFlow = () => {
    clearOtpTimer();
    setOtpStatus("idle");
    setOtpCountdown(0);
    setVerificationToken("");
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
    setPassword("");
    setPasswordVisible(false);
    setPasswordTouched(false);
    setLoginPassword("");
    setLoginStage("phone");
    setLoginPhoneNumber("");
    setOtpFlow(null);
    setOtpTargetPhone("");
    setShowOtpModal(false);
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
        await requestSignupOtpHandler({ phoneNumber, role: "user" });
      } else {
        await requestLoginOtpHandler({ phoneNumber });
      }
      setOtpFlow(flow);
      setOtpTargetPhone(phoneNumber);
      setOtpStatus("sent");
      setOtpCountdown(60);
      setShowOtpModal(true);
      setInfoMessage("OTP sent to your mobile number.");
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
    if (digitsOnly.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return false;
    }

    const phoneNumber = buildPhoneNumber(valueToUse);
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
        const response = await verifySignupOtpHandler({
          phoneNumber: otpTargetPhone,
          otp: otp.trim(),
          role: "user",
        });
        if (response?.verification_token) {
          setVerificationToken(response.verification_token);
          setOtpStatus("verified");
          // Don't close modal yet - wait for signup to complete
          // Call complete profile with the verification token directly
          try {
            await handleCompleteProfile(response.verification_token);
            // Only close modal and reset state after successful signup
            setOtpFlow(null);
            setOtpTargetPhone("");
            setShowOtpModal(false);
            return response.verification_token;
          } catch (profileError) {
            // handleCompleteProfile already handles its own errors
            // Keep modal open so user can see the error
            setOtpStatus("sent");
            setIsProcessing(false);
            return null;
          }
        }
        setErrorMessage("Verification failed. Please try again.");
        setOtpStatus("sent");
        setIsProcessing(false);
        return null;
      }

      if (otpFlow === "login") {
        const result = await loginWithOtpHandler({
          phoneNumber: otpTargetPhone,
          otp: otp.trim(),
        });
        setOtpStatus("verified");
        setOtpFlow(null);
        setOtpTargetPhone("");
        setInfoMessage("Login successful! Redirecting...");
        setShowOtpModal(false);
        setIsProcessing(false);
        setTimeout(() => {
          onRequestClose();
        }, 1000);
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

  const handleCompleteProfile = async (verificationTokenOverride = null) => {
    const nameToUse = fullName.trim();
    const passwordToUse = password.trim();
    const verificationTokenToUse =
      verificationTokenOverride || verificationToken;

    if (!nameToUse) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (passwordToUse.length < 6) {
      setPasswordTouched(true);
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsSigningUp(true);
    setIsProcessing(true);

    try {
      await signupHandler({
        name: nameToUse,
        verificationToken: verificationTokenToUse,
        email: email.trim() || undefined,
        password: passwordToUse,
      });

      try {
        await AsyncStorage.removeItem("@signupVerification");
      } catch (error) {
        console.warn("Failed to clear cached verification token", error);
      }

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
    }
  };

  const handleLogin = async () => {
    if (isProcessing) return;

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    const detectedType = detectInputType(identifier);
    if (detectedType !== "phone") {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    const phoneNumber = buildPhoneNumber(identifier);
    if (!phoneNumber) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    setMobile(identifier);
    setLoginPhoneNumber(phoneNumber);
    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    try {
      const response = await initiateLoginHandler({ phoneNumber });
      if (response?.has_password) {
        setLoginStage("password");
        setInfoMessage("Enter your password to continue.");
      } else {
        setLoginStage("otp");
        await sendOtpForFlow({ phoneNumber, flow: "login" });
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!loginPassword.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }
    if (!loginPhoneNumber) {
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    try {
      await loginWithPasswordHandler({
        phoneNumber: loginPhoneNumber,
        password: loginPassword.trim(),
      });
      setInfoMessage("Login successful! Redirecting...");
      setTimeout(() => {
        onRequestClose();
      }, 1000);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = async () => {
    if (isProcessing) return;

    if (mode === "login") {
      if (loginStage === "phone") {
        await handleLogin();
      } else if (loginStage === "password") {
        await handlePasswordLogin();
      } else if (loginStage === "otp" && loginPhoneNumber) {
        await sendOtpForFlow({ phoneNumber: loginPhoneNumber, flow: "login" });
      }
      return;
    }

    if (!validateSignupFields()) {
      return;
    }

    if (!verificationToken) {
      await handleSendSignupOtp();
      return;
    }

    await handleCompleteProfile();
  };

  const handleResendOtp = async () => {
    if (isProcessing || otpCountdown > 0 || !otpTargetPhone || !otpFlow) {
      return;
    }
    await sendOtpForFlow({ phoneNumber: otpTargetPhone, flow: otpFlow });
  };

  const validateSignupFields = () => {
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (!signupIdentifier.trim()) {
      setErrorMessage("Please enter your mobile number.");
      return false;
    }
    const digitsOnly = sanitizeDigits(signupIdentifier);
    if (digitsOnly.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (password.trim().length < 6) {
      setPasswordTouched(true);
      setErrorMessage("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const canLogin = sanitizeDigits(loginIdentifier).length >= 10;
  const loginDigitsValid = sanitizeDigits(loginIdentifier).length >= 10;
  const showLoginPhoneError =
    loginIdentifier.trim().length > 0 && !loginDigitsValid;
  const signupDigitsValid = sanitizeDigits(signupIdentifier).length >= 10;
  const passwordValid = password.trim().length >= 6;
  const showSignupPasswordError = passwordTouched && !passwordValid;
  const showSignupPhoneError =
    signupIdentifier.trim().length > 0 && !signupDigitsValid;
  const baseSignupValid = fullName.trim() && signupDigitsValid && passwordValid;
  const canCompleteSignup = verificationToken && baseSignupValid;

  const isLoginActionDisabled =
    loginStage === "phone"
      ? !canLogin || isProcessing
      : loginStage === "password"
      ? !loginPassword.trim() || isProcessing
      : isProcessing;

  const isPrimaryDisabled =
    mode === "login"
      ? isLoginActionDisabled
      : verificationToken
      ? !canCompleteSignup || isProcessing || isSigningUp
      : !baseSignupValid || isProcessing;

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

                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <TextInput
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#d3d3d3"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    style={styles.input}
                    editable={loginStage === "phone"}
                    selectTextOnFocus={loginStage === "phone"}
                    value={loginIdentifier}
                    onChangeText={handleLoginIdentifierChange}
                  />
                  {showLoginPhoneError && loginStage === "phone" ? (
                    <Text style={styles.inlineErrorText}>
                      Please enter a valid 10-digit mobile number.
                    </Text>
                  ) : null}

                  {loginStage === "password" && (
                    <>
                      <View
                        style={{
                          backgroundColor: "#dbeafe",
                          padding: 12,
                          borderRadius: 8,
                          marginTop: 12,
                          marginBottom: 16,
                          borderWidth: 1,
                          borderColor: "#3b82f6",
                        }}
                      >
                        <Text
                          style={{
                            color: "#1e40af",
                            fontWeight: "600",
                            fontSize: 14,
                            textAlign: "center",
                          }}
                        >
                          Enter your password to continue
                        </Text>
                      </View>
                      <Text style={styles.inputLabel}>
                        Password <Text style={styles.requiredIndicator}>*</Text>
                      </Text>
                      <TextInput
                        placeholder="Enter your password"
                        placeholderTextColor="#d3d3d3"
                        secureTextEntry
                        style={styles.input}
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        autoFocus
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setLoginStage("phone");
                          setLoginPassword("");
                          setInfoMessage("");
                        }}
                        style={{ marginBottom: 8 }}
                      >
                        <Text style={{ color: "#f96166", fontWeight: "600" }}>
                          Use a different number
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      isPrimaryDisabled && styles.disabledBtn,
                    ]}
                    onPress={handleNext}
                    disabled={isPrimaryDisabled}
                  >
                    <Text style={styles.btnText}>
                      {(() => {
                        if (isProcessing) {
                          if (loginStage === "phone") return "Checking...";
                          if (loginStage === "password") return "Logging in...";
                          return "Sending...";
                        }
                        if (loginStage === "phone") return "Continue";
                        if (loginStage === "password") return "Login";
                        return "Enter OTP";
                      })()}
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
                  <TextInput
                    placeholder="Mobile Number"
                    placeholderTextColor="#d3d3d3"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    style={styles.input}
                    value={signupIdentifier}
                    onChangeText={handleSignupIdentifierChange}
                  />
                  {showSignupPhoneError ? (
                    <Text style={styles.inlineErrorText}>
                      Please enter a valid 10-digit mobile number.
                    </Text>
                  ) : null}

                  <Text style={styles.inputLabel}>
                    Email{" "}
                    <Text style={styles.optionalIndicator}>(optional)</Text>
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

                  <Text style={styles.inputLabel}>
                    Create Password{" "}
                    <Text style={styles.requiredIndicator}>*</Text>
                  </Text>
                  <View style={styles.passwordField}>
                    <TextInput
                      placeholder="Minimum 6 characters"
                      placeholderTextColor="#d3d3d3"
                      style={styles.passwordInput}
                      secureTextEntry={!passwordVisible}
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        if (!passwordTouched) {
                          setPasswordTouched(true);
                        }
                      }}
                      onBlur={() => setPasswordTouched(true)}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() =>
                        setPasswordVisible((prevVisible) => !prevVisible)
                      }
                    >
                      <Ionicons
                        name={passwordVisible ? "eye-off" : "eye"}
                        size={18}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                  {showSignupPasswordError ? (
                    <Text style={styles.inlineErrorText}>
                      Password must be at least 6 characters.
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      isPrimaryDisabled && styles.disabledBtn,
                    ]}
                    onPress={handleNext}
                    disabled={isPrimaryDisabled || isProcessing}
                  >
                    <Text style={styles.btnText}>
                      {isProcessing
                        ? verificationToken
                          ? "Creating..."
                          : "Sending..."
                        : verificationToken
                        ? "Create Account"
                        : "Send OTP"}
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

            <TouchableOpacity onPress={onRequestClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
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
              <Ionicons name="close" size={20} color="#6B7280" />
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
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
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
    paddingHorizontal: 12,
    marginTop: 2,
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
    fontSize: 13,
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
  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginTop: 4,
    marginBottom: 6,
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
