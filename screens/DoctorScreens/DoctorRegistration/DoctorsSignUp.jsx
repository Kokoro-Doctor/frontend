import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import NewSideNav from "../../../components/DoctorsPortalComponents/NewSideNav";
import { useNavigation } from "@react-navigation/native";
import SideImageStyle from "../../../components/DoctorsPortalComponents/SideImageStyle";
import {
  useGoogleAuth,
  handleGoogleLogin,
  initiateDoctorSignupVerification,
  verifyMobileOtp,
} from "../../../utils/AuthService";
import Header from "../../../components/PatientScreenComponents/Header";
import { useAuth } from "../../../contexts/AuthContext";

const DoctorsSignUp = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [rememberMe, setRememberMe] = useState(false);
  const [request, response, promptAsync] = useGoogleAuth();
  const { doctorsSignup } = useAuth();
  const isPhoneValid = formData.phoneNumber?.trim()?.length >= 8;
  const canSendOtp =
    isPhoneValid && otpCountdown === 0 && otpStatus !== "sending" && otpStatus !== "verified";
  const isOtpComplete = otpValue.trim().length === 6;
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    location: "",
    phoneNumber: "",
    password: "",
    otp: ["", "", "", ""],
  });
  const [verificationToken, setVerificationToken] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpStatus, setOtpStatus] = useState("idle");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpIntervalRef = useRef(null);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === "success") {
        try {
          const googleUser = await handleGoogleLogin(response);
          if (googleUser) {
            // Save Google user as a doctor
            await AsyncStorage.setItem("@doctor", JSON.stringify(googleUser));
            // setDoctor({
            //   doctorname: googleUser.doctorname,
            //   email: googleUser.email,
            // });
            alert(`Welcome Dr. ${googleUser.doctorname || ""}!`);
            navigation.navigate("DoctorMedicalRegistration", {
              email: googleUser.email,
              doctorname:googleUser.name,
            });
          }
        } catch (error) {
          console.error("Google doctor login error:", error);
          alert("Google Sign-In failed. Please try again.");
        }
      }
      // if (response?.type === "success") {
      //   try {
      //     const googleUser = await handleGoogleLogin(response);
      //     if (googleUser) {
      //       // ✅ Auto-register doctor in backend (with placeholder password)
      //       // const doctorData = await registerDoctor({
      //       //   doctorname: googleUser.name || "Doctor",
      //       //   email: googleUser.email,
      //       //   password: "google-auth-password", // required by backend (≥5 chars)
      //       //   phoneNumber: "0000000000", // placeholder, can be updated later
      //       //   location: "Not specified",
      //       // });

      //       // ✅ Save locally
      //       await AsyncStorage.setItem("@doctor", JSON.stringify(doctorData));

      //       // ✅ Navigate to medical registration
      //       alert(
      //         `Welcome Dr. ${doctorData.doctorname || googleUser.name || ""}!`
      //       );
      //       navigation.navigate("DoctorMedicalRegistration", {
      //         email: doctorData.email,
      //         doctorname: doctorData.doctorname,
      //       });
      //     }
      //   } catch (error) {
      //     console.error("Google doctor signup error:", error);
      //     alert(error.message || "Google Sign-Up failed. Please try again.");
      //   }
      // }
    };
    handleGoogleResponse();
  }, [navigation, response]);

  useEffect(() => {
    if (otpCountdown <= 0) {
      if (otpIntervalRef.current) {
        clearInterval(otpIntervalRef.current);
        otpIntervalRef.current = null;
      }
      return;
    }

    otpIntervalRef.current = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          if (otpIntervalRef.current) {
            clearInterval(otpIntervalRef.current);
            otpIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (otpIntervalRef.current) {
        clearInterval(otpIntervalRef.current);
        otpIntervalRef.current = null;
      }
    };
  }, [otpCountdown]);

  useEffect(() => {
    return () => {
      if (otpIntervalRef.current) {
        clearInterval(otpIntervalRef.current);
      }
    };
  }, []);

  const triggerGoogleLogin = useCallback(() => {
    if (request) {
      promptAsync(); // must be called immediately
    } else {
      console.log("Google auth request not ready yet");
    }
  }, [request, promptAsync]);

  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      alert("Please enter a valid phone number to receive OTP.");
      return;
    }
    setOtpStatus("sending");
    try {
      await initiateDoctorSignupVerification({
        phoneNumber: formData.phoneNumber.trim(),
      });
      setOtpStatus("sent");
      setOtpCountdown(60);
      alert("OTP sent to your phone number.");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert(error.message || "Failed to send OTP. Please try again.");
      setOtpStatus("idle");
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpComplete) {
      alert("Please enter the 6-digit OTP.");
      return;
    }
    setOtpStatus("verifying");
    try {
      const response = await verifyMobileOtp({
        phoneNumber: formData.phoneNumber.trim(),
        otp: otpValue.trim(),
      });
      if (response?.verification_token) {
        setVerificationToken(response.verification_token);
      }
      setOtpStatus("verified");
      alert("Phone number verified successfully.");
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      alert(error.message || "Failed to verify OTP.");
      setOtpStatus("sent");
    }
  };

  const handleSignup = async () => {
    if (!verificationToken) {
      alert("Please verify your phone number before continuing.");
      return;
    }
    try {
      await doctorsSignup({
        doctorname: `${formData.firstname} ${formData.lastname}`.trim(),
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        verificationToken,
      });

      alert("Doctor registered successfully!");
      navigation.navigate("DoctorAppNavigation", {
        screen: "DoctorMedicalRegistration",
        email: formData.email,
      });
    } catch (error) {
      alert(error.message || "Doctor registration failed.");
      console.error("Doctor registration error:", error);
    }
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <NewSideNav navigation={navigation} />
          <ScrollView style={styles.Content}>
            <View style={styles.DetailContainer}>
              <Text style={styles.heading}>Sign Up</Text>
              <View style={styles.details}>
                <Text style={styles.inputHeading}>First Name</Text>
                <TextInput
                  placeholder="Enter your first name..."
                  placeholderTextColor="#c0c0c0"
                  style={[
                    styles.inputContainer,
                    Platform.OS === "web" &&
                      width > 1000 && { width: "60%", height: 36 },
                    { color: formData.firstname ? "black" : "#c0c0c0" },
                  ]}
                  value={formData.name}
                  onChangeText={(val) => handleChange("firstname", val)}
                />
                <Text style={styles.inputHeading}>Last Name</Text>
                <TextInput
                  placeholder="Enter your last name..."
                  placeholderTextColor="#c0c0c0"
                  style={[
                    styles.inputContainer,
                    Platform.OS === "web" &&
                      width > 1000 && { width: "60%", height: 36 },
                    { color: formData.lastname ? "black" : "#c0c0c0" },
                  ]}
                  value={formData.name}
                  onChangeText={(val) => handleChange("lastname", val)}
                />
                <Text style={styles.inputHeading}>Email Id</Text>
                <TextInput
                  placeholder="Enter your email..."
                  placeholderTextColor="#c0c0c0"
                  style={[
                    styles.inputContainer,
                    Platform.OS === "web" &&
                      width > 1000 && { width: "60%", height: 36 },
                    { color: formData.email ? "black" : "#c0c0c0" },
                  ]}
                  value={formData.email}
                  onChangeText={(val) => handleChange("email", val)}
                />
                <Text style={styles.inputHeading}>Establishment Location</Text>
                <TextInput
                  placeholder="Enter your location..."
                  placeholderTextColor="#c0c0c0"
                  style={[
                    styles.inputContainer,
                    Platform.OS === "web" &&
                      width > 1000 && { width: "60%", height: 36 },
                    { color: formData.location ? "black" : "#c0c0c0" },
                  ]}
                  value={formData.location}
                  onChangeText={(val) => handleChange("location", val)}
                />
                <Text style={styles.inputHeading}>Phone Number</Text>
                <View style={styles.phoneInputRow}>
                  <TextInput
                    placeholder="Enter your phone number..."
                    placeholderTextColor="#c0c0c0"
                    keyboardType="phone-pad"
                    style={[
                      styles.inputContainer,
                      styles.phoneInput,
                      Platform.OS === "web" &&
                        width > 1000 && { width: "60%", height: 36 },
                      { color: formData.phoneNumber ? "black" : "#c0c0c0" },
                    ]}
                    value={formData.phoneNumber}
                    onChangeText={(val) => handleChange("phoneNumber", val)}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendOtpButton,
                      (!canSendOtp && otpStatus !== "verified") && styles.disabledOtpButton,
                      otpStatus === "verified" && styles.verifiedBadge,
                    ]}
                    onPress={handleSendOtp}
                    disabled={!canSendOtp}
                  >
                    <Text style={styles.sendOtpButtonText}>
                      {otpStatus === "verified"
                        ? "Verified"
                        : otpStatus === "sending"
                        ? "Sending..."
                        : otpCountdown > 0
                        ? `Resend in ${otpCountdown}s`
                        : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {(otpStatus !== "idle" || verificationToken) && (
                  <View style={styles.otpRow}>
                    <TextInput
                      placeholder="6-digit OTP"
                      placeholderTextColor="#c0c0c0"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[styles.inputContainer, styles.otpInput]}
                      value={otpValue}
                      onChangeText={(value) =>
                        setOtpValue(value.replace(/[^0-9]/g, ""))
                      }
                    />
                    <TouchableOpacity
                      style={[
                        styles.verifyOtpButton,
                        (!isOtpComplete || otpStatus === "verified") && styles.disabledOtpButton,
                      ]}
                      onPress={handleVerifyOtp}
                      disabled={
                        !isOtpComplete ||
                        otpStatus === "verifying" ||
                        otpStatus === "verified"
                      }
                    >
                      <Text style={styles.verifyOtpButtonText}>
                        {otpStatus === "verified"
                          ? "Verified"
                          : otpStatus === "verifying"
                          ? "Verifying..."
                          : "Verify OTP"}
                      </Text>
                    </TouchableOpacity>
                    {otpStatus === "verified" && (
                      <Text style={styles.verificationMessage}>
                        Phone verified successfully.
                      </Text>
                    )}
                    {otpCountdown > 0 && otpStatus !== "verified" && (
                      <Text style={styles.otpHelper}>
                        Resend available in {otpCountdown}s
                      </Text>
                    )}
                  </View>
                )}
                <Text style={styles.inputHeading}>Password</Text>
                <TextInput
                  placeholder="Enter your password..."
                  placeholderTextColor="#c0c0c0"
                  secureTextEntry
                  style={[
                    styles.inputContainer,
                    Platform.OS === "web" &&
                      width > 1000 && { width: "60%", height: 36 },
                    { color: formData.password ? "black" : "#c0c0c0" },
                  ]}
                  value={formData.password}
                  onChangeText={(val) => handleChange("password", val)}
                />
                <View style={styles.rememberForgotRow}>
                  <View style={styles.rememberMeContainer}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={toggleRememberMe}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          rememberMe && styles.checkedBox,
                        ]}
                      >
                        {rememberMe && (
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.continueContainer,
                    !verificationToken && { backgroundColor: "#94A3B8" },
                  ]}
                  onPress={handleSignup}
                  disabled={!verificationToken}
                >
                  <Text style={styles.continueText}>Sign in</Text>
                  <Image
                    style={styles.arrowIcon}
                    source={require("../../../assets/DoctorsPortal/Icons/ArrowIcon.png")}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.skipContainer}
                  onPress={() =>
                    navigation.navigate("DoctorAppNavigation", {
                      screen: "DoctorMedicalRegistration",
                    })
                  }
                >
                  <Text style={styles.continueText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={triggerGoogleLogin}
                >
                  <Image
                    source={require("../../../assets/Images/google-icon.png")}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    Sign in with Google
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <SideImageStyle />
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView style={styles.appContainer}>
          <View style={styles.headContainer}>
            {/* <Header style={styles.header} navigation={navigation} /> */}
            <Header navigation={navigation} isDoctorPortal={true} />
          </View>
          <View style={styles.Content}>
            <View style={styles.DetailContainer}>
              <Text style={styles.heading}>Sign Up</Text>
              <View style={styles.details}>
                <Text style={styles.inputHeading}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Enter your first name..."
                    placeholderTextColor="#c0c0c0"
                    style={[
                      styles.inputContainer,
                      { color: formData.firstname ? "black" : "#c0c0c0" },
                    ]}
                    value={formData.firstname}
                    onChangeText={(val) => handleChange("firstname", val)}
                  />
                </View>

                <Text style={styles.inputHeading}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Enter your last name..."
                    placeholderTextColor="#c0c0c0"
                    style={[
                      styles.inputContainer,
                      { color: formData.lastname ? "black" : "#c0c0c0" },
                    ]}
                    value={formData.lastname}
                    onChangeText={(val) => handleChange("lastname", val)}
                  />
                </View>

                <Text style={styles.inputHeading}>Email Id</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Enter your email..."
                    placeholderTextColor="#c0c0c0"
                    style={[
                      styles.inputContainer,
                      { color: formData.email ? "black" : "#c0c0c0" },
                    ]}
                    value={formData.email}
                    onChangeText={(val) => handleChange("email", val)}
                  />
                </View>

                <Text style={styles.inputHeading}>Phone Number</Text>
                <View style={[styles.inputWrapper, styles.phoneInputRow]}>
                  <TextInput
                    placeholder="Enter your phone number..."
                    placeholderTextColor="#c0c0c0"
                    keyboardType="phone-pad"
                    style={[
                      styles.inputContainer,
                      styles.phoneInput,
                      { color: formData.phoneNumber ? "black" : "#c0c0c0" },
                    ]}
                    value={formData.phoneNumber}
                    onChangeText={(val) => handleChange("phoneNumber", val)}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendOtpButton,
                      (!canSendOtp && otpStatus !== "verified") && styles.disabledOtpButton,
                      otpStatus === "verified" && styles.verifiedBadge,
                    ]}
                    onPress={handleSendOtp}
                    disabled={!canSendOtp}
                  >
                    <Text style={styles.sendOtpButtonText}>
                      {otpStatus === "verified"
                        ? "Verified"
                        : otpStatus === "sending"
                        ? "Sending..."
                        : otpCountdown > 0
                        ? `Resend in ${otpCountdown}s`
                        : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {(otpStatus !== "idle" || verificationToken) && (
                  <View style={[styles.inputWrapper, styles.otpRow]}>
                    <TextInput
                      placeholder="6-digit OTP"
                      placeholderTextColor="#c0c0c0"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[styles.inputContainer, styles.otpInput]}
                      value={otpValue}
                      onChangeText={(value) =>
                        setOtpValue(value.replace(/[^0-9]/g, ""))
                      }
                    />
                    <TouchableOpacity
                      style={[
                        styles.verifyOtpButton,
                        (!isOtpComplete || otpStatus === "verified") && styles.disabledOtpButton,
                      ]}
                      onPress={handleVerifyOtp}
                      disabled={
                        !isOtpComplete ||
                        otpStatus === "verifying" ||
                        otpStatus === "verified"
                      }
                    >
                      <Text style={styles.verifyOtpButtonText}>
                        {otpStatus === "verified"
                          ? "Verified"
                          : otpStatus === "verifying"
                          ? "Verifying..."
                          : "Verify OTP"}
                      </Text>
                    </TouchableOpacity>
                    {otpStatus === "verified" && (
                      <Text style={styles.verificationMessage}>
                        Phone verified successfully.
                      </Text>
                    )}
                    {otpCountdown > 0 && otpStatus !== "verified" && (
                      <Text style={styles.otpHelper}>
                        Resend available in {otpCountdown}s
                      </Text>
                    )}
                  </View>
                )}

                <Text style={styles.inputHeading}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Enter your password..."
                    placeholderTextColor="#c0c0c0"
                    secureTextEntry
                    style={[
                      styles.inputContainer,
                      { color: formData.password ? "black" : "#c0c0c0" },
                    ]}
                    value={formData.password}
                    onChangeText={(val) => handleChange("password", val)}
                  />
                </View>

                <View style={styles.rememberForgotRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={toggleRememberMe}
                  >
                    <View
                      style={[styles.checkbox, rememberMe && styles.checkedBox]}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </View>

                <View style={styles.btns}>
                <TouchableOpacity
                  style={[
                    styles.continueContainer,
                    !verificationToken && { backgroundColor: "#94A3B8" },
                  ]}
                  onPress={handleSignup}
                  disabled={!verificationToken}
                >
                    <Text style={styles.continueText}>Sign in</Text>
                    <Text>{"\n"}</Text>
                  </TouchableOpacity>
                  <Text style={styles.orOption}>Or</Text>

                  <TouchableOpacity
                    style={styles.continueWithGoogle}
                    onPress={handleSignup}
                  >
                    <Image
                      style={styles.googleIcon}
                      source={require("../../../assets/Images/google-icon.png")}
                    />
                    <Text style={styles.continueText}>Sign in with Google</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.skipContainer}
                  onPress={() =>
                    navigation.navigate("DoctorMedicalRegistration")
                  }
                >
                  <Text style={styles.continueText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FCF5F7",
    height: "100%",
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  phoneInput: {
    flex: 1,
  },
  sendOtpButton: {
    backgroundColor: "#1FBF86",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: "center",
  },
  sendOtpButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  disabledOtpButton: {
    backgroundColor: "#D1D5DB",
  },
  verifiedBadge: {
    backgroundColor: "#16A34A",
  },
  otpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginTop: 8,
  },
  otpInput: {
    flex: 1,
  },
  verifyOtpButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: "center",
  },
  verifyOtpButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  verificationMessage: {
    color: "#047857",
    fontSize: 13,
    marginTop: 6,
  },
  otpHelper: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },

  header: {
    marginTop: 0,
    height: 40,
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
        marginBottom: 20,
      },
    }),
  },

  headContainer: {
    height: 70,
    marginBottom: "10%",
    width: "100%",
    //justifyContent: "space-evenly",
    //alignItems: "center",
    zIndex: 2,
    //borderWidth: 1,
  },
  appContainer: {
    // flex: 1,

    width: "100%",
    backgroundColor: "#FCF5F7",
  },

  Content: {
    width: "100%",
    margintTop: "10%",
    backgroundColor: "#FCF5F7",
    ...Platform.select({
      web: {
        width: "100%",
        height: "auto",
      },
    }),
  },

  DetailContainer: {
    flex: 1,
    flexDirection: "column",
    width: "95%",
    backgroundColor: "#FCF5F7",
    borderRadius: 10,
    marginHorizontal: 10,
    marginLeft: 10,
    minHeight: 400,
    Width: "100%",
    ...Platform.select({
      web: {
        alignItems: "left",
        width: "100%",
        //borderWidth: 1,
        //height:"70%"
      },
    }),
  },

  inputWrapper: {
    width: "100%",
    //borderWidth: 1,
    ...Platform.select({
      web: {
        //width: "100%",
        maxWidth: 800,
        //borderWidth: 1,
      },
    }),
  },

  heading: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 15,
    marginLeft: 10,
    color: "#000",
    ...Platform.select({
      web: {
        fontSize: 30,
        fontWeight: 500,
        marginBottom: "2%",
        marginTop: "4%",
      },
    }),
  },

  details: {
    width: "100%",
    paddingHorizontal: 10,
    ...Platform.select({
      web: {
        width: "65%",
        //marginLeft: "auto",
        //marginRight: "auto",
        fontSize: 14,
      },
    }),
  },

  inputHeading: {
    fontSize: 16,
    color: "#333",
    ...Platform.select({
      web: {
        fontSize: 14,
      },
    }),
  },

  inputContainer: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 14,
    paddingHorizontal: 5,
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    ...Platform.select({
      web: {
        //height: "20%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        fontSize: 14,
        paddingHorizontal: 5,
        width: "100%",
        backgroundColor: "#fff",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },

  note: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: "3%",
    color: "#444",
  },

  rememberForgotRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
    ...Platform.select({
      web: {
        marginBottom: 6,
      },
    }),
  },

  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkboxContainer: {
    marginRight: 10,
  },

  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  checkedBox: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },

  rememberMeText: {
    fontSize: 16,
    color: "#666",
  },
  btns: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    alignItems: "center",
    marginTop: "2%",
    //borderWidth:1
  },

  continueContainer: {
    width: "100%",
    maxWidth: 400,
    height: 42,
    backgroundColor: "#1FBF86",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...Platform.select({
      web: {
        width: "100%",
        height: 42,
        backgroundColor: "#1FBF86",
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2%",
      },
    }),
  },

  continueWithGoogle: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    height: 45,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  orOption: {
    width: 400,
    maxWidth: "95%",
    textAlign: "center",
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 10,
  },

  skipContainer: {
    marginTop: 16,
    width: "100%",
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#1FBF86",
    ...Platform.select({
      web: {
        marginLeft: "15%",
        width: "40%",
      },
    }),
  },

  continueText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
  },

  arrowIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    position: "absolute",
    right: 10,
    borderRadius: 12,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    height: 42,
    //borderWidth: 1,
    borderColor: "#151212ff",
    borderRadius: 4,
    //marginBottom: "3%",
    marginTop: "3%",
    backgroundColor: "#c1bfbfff",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: "2%",
  },
  googleButtonText: {
    fontSize: 16,
    color: "#0e0e0eff",
  },
});
export default DoctorsSignUp;
