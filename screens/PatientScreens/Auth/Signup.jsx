import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  StatusBar,
  Modal,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../contexts/AuthContext";
import { useGoogleAuth } from "../../../utils/AuthService";
import { getErrorMessage } from "../../../utils/errorUtils";
import { useRole } from "../../../contexts/RoleContext";

const Signup = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { signup, googleLogin } = useContext(AuthContext);
  const [request, response, promptAsync] = useGoogleAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setRole } = useRole();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (response) {
      googleLogin(response)
        .then(() => {
          //navigation.navigate("LandingPage");
          setRole("doctor");
        })
        .catch((error) => {
          console.error("Google login error:", error);
        });
    }
  }, [response, googleLogin, navigation]);

  useEffect(() => {
    if (route?.params?.agreedToPolicy === true) {
      setRememberMe(true);
    }
  }, [route?.params]);

  const handleGoogleLogin = () => {
    if (request) {
      promptAsync();
    } else {
      console.log("Google auth request not ready yet");
    }
  };

  const handleSignUp = async () => {
    if (!rememberMe) {
      alert("Please go through our privacy policy and check the box.");
      return;
    }
    if (isSubmitting) return;

    const fullName = `${firstName} ${lastName}`.trim();
    setFormError("");
    setIsSubmitting(true);
    try {
      await signup(
        fullName,
        email,
        password,
        phoneNumber,
        location,
        navigation
      );
      setRole("doctor");
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Signup failed:", message, error);
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetectLocation = () => {
    // Implement location detection logic
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <>
      {/* Web Version (for larger screens) */}
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />

          <View style={styles.mainContainer}>
            {/* Left side with background image - 40% */}
            <View style={styles.leftContainer}>
              <ImageBackground
                source={require("../../../assets/Images/signup.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
              >
                <Text style={styles.quoteText}>
                  Nurture Your Heart. It Will Nurture You
                </Text>
              </ImageBackground>
            </View>

            {/* Rectangular divider */}
            <View style={styles.divider} />

            {/* Right side with form - 60% */}
            <View style={styles.rightContainer}>
              <ScrollView
                contentContainerStyle={styles.mainright}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.welcomeText}>Welcome</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your Name"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your Name"
                    placeholderTextColor="#999"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your Phone no"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Enter Location or Detect current location
                  </Text>
                  <View style={styles.locationInputContainer}>
                    <TextInput
                      style={styles.locationInput}
                      placeholder="Enter Location"
                      placeholderTextColor="#999"
                      value={location}
                      onChangeText={setLocation}
                    />
                    <TouchableOpacity
                      style={styles.locationIcon}
                      onPress={handleDetectLocation}
                    >
                      <Ionicons
                        name="location-outline"
                        size={24}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.privacyPolicyRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={toggleRememberMe}
                  >
                    <View
                      style={[styles.checkbox, rememberMe && styles.checkedBox]}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={11} color="#FFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.privacyAcceptContainer}>
                    <Text style={styles.acceptingText}>
                      By Accepting you agree to the Kokoro.Doctor
                    </Text>
                    <Text
                      style={styles.privacyText}
                      onPress={() => navigation.navigate("PrivacyPolicy")}
                    >
                      Privacy Policy
                    </Text>
                  </View>
                </View>
                <View style={styles.detectionContent}>
                  <Text style={styles.detectionContentText}>
                    While Kokoro.Doctor’s AI offers powerful health insights and
                    early detection support, it is designed to assist — not
                    replace — professional medical judgment or emergency care.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.signInButton,
                    !rememberMe && styles.disabledSignInButton,
                  ]}
                  onPress={handleSignUp}
                  disabled={!rememberMe || isSubmitting}
                >
                  <Text style={styles.signInButtonText}>
                    {isSubmitting ? "Signing up..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>

                {formError ? (
                  <Text style={styles.errorText}>{formError}</Text>
                ) : null}

                <View style={styles.orContainer}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>Or</Text>
                  <View style={styles.orLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                >
                  <Image
                    source={require("../../../assets/Images/google-icon.png")}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    Sign in with Google
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {/* Mobile Version (for smaller screens) */}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.mobileContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/Images/KokoroLogo.png")}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>Kokoro.Doctor</Text>
          </View>

          <Text style={styles.welcomeTitle}>Welcome</Text>

          <View style={styles.mobileFormContainer}>
            <TextInput
              style={styles.mobileInput}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.mobileInput}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={styles.mobileInput}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.mobileInput}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIconContainer}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.privacyMainContainer}>
              <View style={styles.privacyInnerContainer}>
                <TouchableOpacity
                  style={styles.privacyTickContainer}
                  onPress={toggleRememberMe}
                >
                  <View
                    style={[styles.tickBox, rememberMe && styles.tickedBox]}
                  >
                    {rememberMe && (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.textContainer}>
                  <Text style={styles.privacyTextContainer}>
                    By accepting you agree to Kokoro.Doctor{" "}
                  </Text>
                  <Text
                    style={styles.privacyText}
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    Privacy Policy
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.contentText}>
                While Kokoro.Doctor’s AI offers powerful health insights and
                early detection support, it is designed to assist — not replace
                — professional medical judgment or emergency care.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignUp}
              disabled={isSubmitting}
            >
              <Text style={styles.signInButtonText}>
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {formError ? (
              <Text style={styles.mobileErrorText}>{formError}</Text>
            ) : null}

            {/* <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.orLine} />
            </View> */}

            {/* <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Image
                source={require("../../../assets/Images/google-icon.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      )}
    </>
  );
};

// const windowWidth=Dimensions.get("window").width;

const styles = StyleSheet.create({
  // Web Styles
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftContainer: {
    width: "40%", // Increased from 40% to 50%
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
    fontSize: 32, // Slightly increased
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 40,
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
    width: "60%", // Adjusted to match left container
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  },
  mainright: {
    width: "100%", // Increased from 55% to 70%
    height: "100%",
  },
  welcomeText: {
    fontSize: 32, // Increased from 28
    fontWeight: "bold",
    color: "#333",
    marginBottom: "3%",
  },
  inputContainer: {
    marginBottom: "0.75%", // Slightly increased
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: "1.5%",
    fontWeight: "500",
  },
  input: {
    height: 42, // Increased from 38
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: "3%",
    fontSize: 14,
    width: "100%",
    backgroundColor: "#FFFFFF",
    outlineStyle: "none",
    borderwidth: 0,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    height: 40,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: "3%",
    fontSize: 14,
    height: "100%",
    outlineStyle: "none",
    borderwidth: 0,
  },
  locationIcon: {
    padding: "2%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    height: 50,
    marginBottom: "2%",
    width: "100%",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    outlineStyle: "none",
    borderwidth: 0,
  },
  eyeIconContainer: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },
  privacyPolicyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "2%",
    //borderWidth:1,
    height: "5%",
  },

  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkboxContainer: {
    marginRight: "1%",
    // alignSelf: "center",
  },
  checkbox: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    justifyContent: "center",
    alignSelf: "center",
    // marginRight: windowWidth>1000? "0%": "2%"
  },

  checkedBox: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  privacyAcceptContainer: {
    //borderWidth:1,
    height: "auto",
    width: "92%",
    borderColor: "#000",
  },
  acceptingText: {
    fontSize: 11,
    color: "#666",
  },
  privacyText: {
    fontSize: 11,
    color: "blue",
    textDecorationLine: "underline",
  },

  detectionContent: {
    width: "100%", // Ensure it stays within rightContainer
    borderRadius: 6,
    alignItems: "center", // Important for web
    flexShrink: 1, // Prevents overflow
    //borderWidth: 1,
    height: "22%",
    marginBottom: "2%",
  },

  detectionContentText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    maxWidth: 300,
    fontWeight: 400,
  },

  signInButton: {
    backgroundColor: "#10B981",
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginTop: "1%",
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: "2%",
    fontSize: 14,
    color: "#DC2626",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: "0%",
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  orText: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: "2%",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 42,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    marginBottom: "3%",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: "2%",
  },
  googleButtonText: {
    fontSize: 14,
    color: "#666",
  },

  // Mobile Styles
  mobileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
  },
  mobileFormContainer: {
    width: "100%",
  },
  mobileInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    width: "100%",
  },
  eyeIconContainer: {
    paddingHorizontal: 15,
    height: "100%",
    justifyContent: "center",
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  privacyMainContainer: {
    alignItems: "center",
    marginBottom: "12%",
  },
  privacyInnerContainer: {
    flexDirection: "row",
  },
  tickedBox: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  privacyText: {
    fontSize: 14,
    color: "blue",
    textDecorationLine: "underline",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
  },
  tickBox: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    justifyContent: "center",
    // alignSelf: "center",
    alignItems: "center",
    marginRight: "2%",
    marginTop: "3%",
  },
  referralText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },

  content: {
    width: "100%", // Ensure it stays within rightContainer
    borderRadius: 6,
    alignItems: "center", // Important for web
    flexShrink: 1, // Prevents overflow
    //borderWidth: 1,
    height: "10%",
    marginBottom: "1%",
  },

  contentText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    maxWidth: 300,
    fontWeight: 400,
  },
  signInButton: {
    backgroundColor: "#10B981",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  disabledSignInButton: {
    backgroundColor: "#A5D6A7", // light green shade
    opacity: 0.5,
  },

  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mobileErrorText: {
    marginTop: 10,
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  orText: {
    paddingHorizontal: 10,
    color: "#666",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    width: "100%",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#666",
  },
});

export default Signup;
