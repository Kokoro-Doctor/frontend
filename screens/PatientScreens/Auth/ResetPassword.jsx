import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { confirmPasswordReset } from "../../../utils/AuthService";
import { getErrorMessage } from "../../../utils/errorUtils";
import { useLoginModal } from "../../../contexts/LoginModalContext";

const CONTACT_METHODS = {
  EMAIL: "email",
  PHONE: "phone",
};

const ResetPassword = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const inferredMethod =
    route?.params?.contactMethod ??
    (route?.params?.phoneNumber ? CONTACT_METHODS.PHONE : CONTACT_METHODS.EMAIL);
  const [contactMethod, setContactMethod] = useState(
    inferredMethod === CONTACT_METHODS.PHONE ? CONTACT_METHODS.PHONE : CONTACT_METHODS.EMAIL
  );
  const [email, setEmail] = useState(route?.params?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(route?.params?.phoneNumber ?? "");
  const [token, setToken] = useState(route?.params?.token ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const { triggerLoginModal } = useLoginModal();
  const isEmailMethod = contactMethod === CONTACT_METHODS.EMAIL;
  const handleBackToLogin = () => {
    triggerLoginModal({ mode: "login" });
    navigation.navigate("LandingPage");
  };

  useEffect(() => {
    if (route?.params?.email) {
      setEmail(route.params.email);
    }
    if (route?.params?.phoneNumber) {
      setPhoneNumber(route.params.phoneNumber);
    }
    if (route?.params?.token) {
      setToken(route.params.token);
    }
    if (route?.params?.contactMethod) {
      setContactMethod(route.params.contactMethod);
    } else if (route?.params?.phoneNumber) {
      setContactMethod(CONTACT_METHODS.PHONE);
    }
  }, [
    route?.params?.email,
    route?.params?.phoneNumber,
    route?.params?.token,
    route?.params?.contactMethod,
  ]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      const tokenParam = params.get("token");
      if (emailParam) {
        setEmail(emailParam);
        setContactMethod(CONTACT_METHODS.EMAIL);
      }
      if (tokenParam) setToken(tokenParam);
    } catch (error) {
      console.warn("[ResetPassword] Failed to parse reset params", error);
    }
  }, []);

  useEffect(() => {
    setFormError("");
    setFormSuccess("");
  }, [contactMethod]);

  const handleResetPassword = async () => {
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedToken = token.trim();

    if (isEmailMethod && !trimmedEmail) {
      setFormError("Please enter your email address.");
      setFormSuccess("");
      return;
    }

    if (!isEmailMethod && !trimmedPhone) {
      setFormError("Please enter your mobile number.");
      setFormSuccess("");
      return;
    }

    if (!trimmedToken) {
      setFormError("Enter the reset code or OTP that was sent to you.");
      setFormSuccess("");
      return;
    }

    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      setFormSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      setFormSuccess("");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");
    try {
      await confirmPasswordReset({
        email: isEmailMethod ? trimmedEmail : undefined,
        phoneNumber: isEmailMethod ? undefined : trimmedPhone,
        token: trimmedToken,
        newPassword,
      });
      setFormSuccess("Password reset successful. Redirecting…");
      setTimeout(() => navigation.replace("PasswordSuccess"), 500);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = () => (
    <>
      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
      {formSuccess ? <Text style={styles.successText}>{formSuccess}</Text> : null}
    </>
  );

  const renderMobileStatus = () => (
    <>
      {formError ? (
        <Text style={styles.mobileErrorText}>{formError}</Text>
      ) : null}
      {formSuccess ? (
        <Text style={styles.mobileSuccessText}>{formSuccess}</Text>
      ) : null}
    </>
  );

  const renderContactToggle = (variant = "web") => {
    const isMobileVariant = variant === "mobile";
    const containerStyle = isMobileVariant
      ? styles.mobileContactToggleContainer
      : styles.contactToggleContainer;
    const buttonStyle = isMobileVariant
      ? styles.mobileContactToggleButton
      : styles.contactToggleButton;
    const activeButtonStyle = isMobileVariant
      ? styles.mobileContactToggleButtonActive
      : styles.contactToggleButtonActive;
    const textStyle = isMobileVariant
      ? styles.mobileContactToggleText
      : styles.contactToggleText;
    const activeTextStyle = isMobileVariant
      ? styles.mobileContactToggleTextActive
      : styles.contactToggleTextActive;

    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[buttonStyle, isEmailMethod && activeButtonStyle]}
          onPress={() => setContactMethod(CONTACT_METHODS.EMAIL)}
        >
          <Text style={[textStyle, isEmailMethod && activeTextStyle]}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[buttonStyle, !isEmailMethod && activeButtonStyle]}
          onPress={() => setContactMethod(CONTACT_METHODS.PHONE)}
        >
          <Text style={[textStyle, !isEmailMethod && activeTextStyle]}>
            Mobile
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWeb = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      <View style={styles.mainContainer}>
        <View style={styles.leftContainer}>
          <ImageBackground
            source={require("../../../assets/Images/login-background.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <Text style={styles.quoteText}>
              "Nurture Your Heart. It Will Nurture You."
            </Text>
          </ImageBackground>
        </View>
        <View style={styles.divider} />
        <View style={styles.rightContainer}>
          <View style={styles.mainright}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Use the reset code from your email or the OTP from your phone to
              create a new password.
            </Text>

            {renderContactToggle()}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {isEmailMethod ? "Email" : "Mobile Number"}
              </Text>
              <TextInput
                style={styles.textField}
                placeholder={
                  isEmailMethod ? "Enter your email" : "Enter your mobile number"
                }
                placeholderTextColor="#999"
                keyboardType={isEmailMethod ? "email-address" : "phone-pad"}
                autoCapitalize="none"
                value={isEmailMethod ? email : phoneNumber}
                onChangeText={isEmailMethod ? setEmail : setPhoneNumber}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reset Code / OTP</Text>
              <TextInput
                style={styles.textField}
                placeholder={
                  isEmailMethod
                    ? "Paste the code from your email"
                    : "Enter the OTP from your SMS"
                }
                placeholderTextColor="#999"
                autoCapitalize="none"
                value={token}
                onChangeText={setToken}
              />
            </View>

            <Text style={styles.helperText}>
              {isEmailMethod
                ? "Opening the email link in this browser fills these fields automatically. Reset codes expire in 15 minutes."
                : "Enter the 6-digit OTP sent to your phone. OTP codes expire in 5 minutes."}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconButton}
                  onPress={() => setShowNewPassword((prev) => !prev)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconButton}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {renderStatus()}

            <TouchableOpacity
              style={[styles.resetButton, isSubmitting && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={isSubmitting}
            >
              <Text style={styles.resetButtonText}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Text>
            </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backToLogin}
                  onPress={handleBackToLogin}
                >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMobile = () => (
    <View style={styles.mobileContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/Images/KokoroLogo.png")}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>Kokoro.Doctor</Text>
      </View>

      <View style={styles.mobileFormContainer}>
        <Text style={styles.mobileTitle}>Reset Password</Text>
        <Text style={styles.mobileSubtitle}>
          Enter the reset code we emailed or the OTP we texted to set a new
          password.
        </Text>

        {renderContactToggle("mobile")}

        <Text style={styles.mobileInputLabel}>
          {isEmailMethod ? "Email" : "Mobile Number"}
        </Text>
        <TextInput
          style={styles.mobileInput}
          placeholder={
            isEmailMethod ? "Enter your email" : "Enter your mobile number"
          }
          placeholderTextColor="#999"
          keyboardType={isEmailMethod ? "email-address" : "phone-pad"}
          autoCapitalize="none"
          value={isEmailMethod ? email : phoneNumber}
          onChangeText={isEmailMethod ? setEmail : setPhoneNumber}
        />

        <Text style={styles.mobileInputLabel}>Reset Code / OTP</Text>
        <TextInput
          style={styles.mobileInput}
          placeholder={
            isEmailMethod ? "Paste the code" : "Enter the 6-digit OTP"
          }
          placeholderTextColor="#999"
          autoCapitalize="none"
          value={token}
          onChangeText={setToken}
        />

        <Text style={styles.mobileHelperText}>
          {isEmailMethod
            ? "Reset codes expire in 15 minutes."
            : "OTP codes expire in 5 minutes."}
        </Text>

        <Text style={styles.mobileInputLabel}>New Password</Text>
        <View style={styles.mobilePasswordInputWrapper}>
          <TextInput
            style={styles.mobileInput}
            placeholder="New Password"
            placeholderTextColor="#999"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.mobileEyeIconButton}
            onPress={() => setShowNewPassword((prev) => !prev)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.mobileInputLabel}>Confirm Password</Text>
        <View style={styles.mobilePasswordInputWrapper}>
          <TextInput
            style={styles.mobileInput}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.mobileEyeIconButton}
            onPress={() => setShowConfirmPassword((prev) => !prev)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {renderMobileStatus()}

        <TouchableOpacity
          style={[
            styles.mobileResetButton,
            isSubmitting && styles.disabledButton,
          ]}
          onPress={handleResetPassword}
          disabled={isSubmitting}
        >
          <Text style={styles.mobileResetButtonText}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Text>
        </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileBackButton}
              onPress={handleBackToLogin}
            >
          <Text style={styles.mobileBackButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {Platform.OS === "web" && width > 1000 ? renderWeb() : renderMobile()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftContainer: {
    width: "40%",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  quoteText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 30,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    width: "80%",
  },
  divider: {
    width: "0.15%",
    height: "100%",
    backgroundColor: "#EEEEEE",
  },
  rightContainer: {
    width: "60%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: "5%",
  },
  mainright: {
    width: "65%",
    margin: "auto",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: "1%",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: "4%",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: "2.5%",
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: "1%",
    fontWeight: "500",
  },
  textField: {
    height: 50,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: "3%",
    fontSize: 14,
    width: "100%",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: "3%",
    fontSize: 14,
  },
  helperText: {
    fontSize: 13,
    color: "#666",
    marginBottom: "2%",
    lineHeight: 20,
  },
  contactToggleContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    padding: 4,
    marginBottom: "2%",
  },
  contactToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 2,
  },
  contactToggleButtonActive: {
    backgroundColor: "#DCFCE7",
  },
  contactToggleText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  contactToggleTextActive: {
    color: "#047857",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    height: 50,
    minHeight: 48,
  },
  eyeIconButton: {
    padding: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#10B981",
    width: "100%",
    height: 50,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginTop: "3%",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: "2%",
  },
  successText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: "2%",
  },
  backToLogin: {
    alignItems: "center",
    paddingVertical: 10,
  },
  backToLoginText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },

  // Mobile styles
  mobileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: "5%",
    paddingTop: "15%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "10%",
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: "2%",
  },
  logoText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  mobileFormContainer: {
    width: "100%",
    alignItems: "center",
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: "1%",
    alignSelf: "center",
  },
  mobileSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: "6%",
    alignSelf: "center",
    textAlign: "center",
  },
  mobileInputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: "2%",
    alignSelf: "flex-start",
    width: "100%",
  },
  mobileInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: "4%",
    fontSize: 16,
    flex: 1,
  },
  mobileHelperText: {
    fontSize: 14,
    color: "#666",
    alignSelf: "flex-start",
    marginBottom: "4%",
  },
  mobileContactToggleContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 4,
    marginBottom: "6%",
  },
  mobileContactToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 2,
  },
  mobileContactToggleButtonActive: {
    backgroundColor: "#DCFCE7",
  },
  mobileContactToggleText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  mobileContactToggleTextActive: {
    color: "#047857",
  },
  mobilePasswordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: "4%",
  },
  mobileEyeIconButton: {
    position: "absolute",
    right: 10,
    padding: 10,
  },
  mobileResetButton: {
    backgroundColor: "#10B981",
    height: 56,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "4%",
    width: "100%",
  },
  mobileResetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mobileErrorText: {
    color: "#DC2626",
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: "4%",
  },
  mobileSuccessText: {
    color: "#059669",
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: "4%",
  },
  mobileBackButton: {
    paddingVertical: 12,
  },
  mobileBackButtonText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default ResetPassword;
