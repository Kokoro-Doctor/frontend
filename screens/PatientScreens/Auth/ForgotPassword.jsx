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
import { requestPasswordReset } from "../../../utils/AuthService";
import { getErrorMessage, isRateLimitError, getRateLimitMessage } from "../../../utils/errorUtils";
import { useLoginModal } from "../../../contexts/LoginModalContext";

const CONTACT_METHODS = {
  EMAIL: "email",
  PHONE: "phone",
};

const ForgotPassword = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactMethod, setContactMethod] = useState(CONTACT_METHODS.EMAIL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { triggerLoginModal } = useLoginModal();
  const isEmailMethod = contactMethod === CONTACT_METHODS.EMAIL;

  useEffect(() => {
    setStatusMessage("");
    setErrorMessage("");
  }, [contactMethod]);

  const handleSendResetLink = async () => {
    if (isSubmitting) return;
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (isEmailMethod && !trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      setStatusMessage("");
      return;
    }
    if (!isEmailMethod && !trimmedPhone) {
      setErrorMessage("Please enter your mobile number.");
      setStatusMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const response = await requestPasswordReset(
        isEmailMethod ? { email: trimmedEmail } : { phoneNumber: trimmedPhone }
      );
      const fallbackMessage = isEmailMethod
        ? "Password reset link sent. Please check your inbox."
        : "OTP sent to your mobile number. Please enter it on the reset screen.";
      setStatusMessage(response?.message ?? fallbackMessage);
    } catch (error) {
      // Use rate limit specific message if it's a 429 error
      if (isRateLimitError(error)) {
        setErrorMessage(getRateLimitMessage(error));
      } else {
        setErrorMessage(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToReset = () => {
    navigation.navigate("ResetPassword", {
      email: isEmailMethod ? email.trim() : undefined,
      phoneNumber: !isEmailMethod ? phoneNumber.trim() : undefined,
      contactMethod,
    });
  };

  const handleBackToLogin = () => {
    triggerLoginModal({ mode: "login" });
    navigation.navigate("LandingPage");
  };

  const renderStatusMessage = () => {
    if (statusMessage) {
      return <Text style={styles.successText}>{statusMessage}</Text>;
    }
    if (errorMessage) {
      return <Text style={styles.errorText}>{errorMessage}</Text>;
    }
    return null;
  };

  const renderMobileStatus = () => {
    if (statusMessage) {
      return <Text style={styles.mobileSuccessText}>{statusMessage}</Text>;
    }
    if (errorMessage) {
      return <Text style={styles.mobileErrorText}>{errorMessage}</Text>;
    }
    return null;
  };

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
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Choose the email or mobile number linked to your Kokoro Doctor
              account and we'll send a secure link or OTP to reset your
              password.
            </Text>

            {renderContactToggle()}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {isEmailMethod ? "Email" : "Mobile Number"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={
                  isEmailMethod
                    ? "Enter your email"
                    : "Enter your mobile number"
                }
                placeholderTextColor="#999"
                keyboardType={isEmailMethod ? "email-address" : "phone-pad"}
                autoCapitalize="none"
                value={isEmailMethod ? email : phoneNumber}
                onChangeText={isEmailMethod ? setEmail : setPhoneNumber}
              />
            </View>

            <Text style={styles.helperText}>
              {isEmailMethod
                ? "Reset links expire in 15 minutes. Check your spam folder if you don't see the email."
                : "OTP codes expire in 5 minutes. Keep this screen open to enter the code quickly."}
            </Text>

            {renderStatusMessage()}

            <TouchableOpacity
              style={[
                styles.continueButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSendResetLink}
              disabled={isSubmitting}
            >
              <Text style={styles.continueButtonText}>
                {isSubmitting
                  ? "Sending..."
                  : isEmailMethod
                  ? "Send reset link"
                  : "Send OTP"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoToReset}
            >
              <Text style={styles.secondaryButtonText}>
                Already have a reset code or OTP? Enter it
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
        <Text style={styles.mobileTitle}>Forgot Password?</Text>
        <Text style={styles.mobileSubtitle}>
          Choose the email or mobile number linked to your account to receive a
          reset link or OTP.
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

        <Text style={styles.mobileHelperText}>
          {isEmailMethod
            ? "Reset links expire in 15 minutes."
            : "OTP codes expire in 5 minutes."}
        </Text>

        {renderMobileStatus()}

        <TouchableOpacity
          style={[
            styles.mobilePrimaryButton,
            isSubmitting && styles.disabledButton,
          ]}
          onPress={handleSendResetLink}
          disabled={isSubmitting}
        >
          <Text style={styles.mobilePrimaryButtonText}>
            {isSubmitting
              ? "Sending..."
              : isEmailMethod
              ? "Send reset link"
              : "Send OTP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mobileLinkButton}
          onPress={handleGoToReset}
        >
          <Text style={styles.mobileLinkText}>
            I already have a reset code or OTP
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
    <>{Platform.OS === "web" && width > 1000 ? renderWeb() : renderMobile()}</>
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
    marginBottom: "2%",
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: "1%",
    fontWeight: "500",
  },
  input: {
    height: 50,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: "3%",
    fontSize: 14,
    width: "100%",
  },
  helperText: {
    fontSize: 13,
    color: "#666",
    marginBottom: "2%",
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
  continueButton: {
    backgroundColor: "#10B981",
    width: "100%",
    height: 50,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginBottom: "2%",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: "#F4F6F8",
    width: "100%",
    height: 48,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "2%",
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "500",
  },
  backToLogin: {
    alignItems: "center",
    paddingVertical: 8,
  },
  backToLoginText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
  },
  successText: {
    color: "#059669",
    marginBottom: "2%",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    color: "#DC2626",
    marginBottom: "2%",
    fontSize: 14,
    fontWeight: "500",
  },
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
  },
  mobileInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: "4%",
    fontSize: 16,
    marginBottom: "4%",
    width: "100%",
  },
  mobileHelperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: "4%",
    alignSelf: "flex-start",
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
  mobilePrimaryButton: {
    backgroundColor: "#10B981",
    height: 56,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "4%",
    width: "100%",
  },
  mobilePrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mobileLinkButton: {
    paddingVertical: 10,
  },
  mobileLinkText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "500",
  },
  mobileBackButton: {
    marginTop: "4%",
    paddingVertical: 12,
  },
  mobileBackButtonText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
  },
  mobileSuccessText: {
    color: "#059669",
    alignSelf: "flex-start",
    marginBottom: "4%",
    fontSize: 14,
    fontWeight: "500",
  },
  mobileErrorText: {
    color: "#DC2626",
    alignSelf: "flex-start",
    marginBottom: "4%",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ForgotPassword;
