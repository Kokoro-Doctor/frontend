// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Modal,
//   StyleSheet,
//   Platform,
//   Dimensions,
//   ScrollView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { useAuth } from "../../contexts/AuthContext";
// import { getErrorMessage } from "../../utils/errorUtils";
// import {
//   COUNTRY_CODES,
//   DEFAULT_COUNTRY_CODE,
//   validatePhoneNumber,
//   buildFullPhoneNumber,
//   detectCountryCode,
//   getCountryByCode,
// } from "../../utils/countryCodes";

// const DoctorSignupModal = ({ visible, onRequestClose }) => {
//   const navigation = useNavigation();
//   const { doctorsSignup, requestSignupOtp } = useAuth();
//   const [doctorFullName, setDoctorFullName] = useState("");
//   const [doctorPhone, setDoctorPhone] = useState("");
//   const [doctorSpecialization, setDoctorSpecialization] = useState("");
//   const [doctorExperience, setDoctorExperience] = useState("");
//   const [doctorEmail, setDoctorEmail] = useState("");
//   const [doctorOtp, setDoctorOtp] = useState("");
//   const [doctorOtpStatus, setDoctorOtpStatus] = useState("idle");
//   const [otpCountdown, setOtpCountdown] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [infoMessage, setInfoMessage] = useState("");
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [doctorCountryCode, setDoctorCountryCode] =
//     useState(DEFAULT_COUNTRY_CODE);
//   const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

//   useEffect(() => {
//     if (!visible) {
//       resetForm();
//     }
//   }, [visible]);

//   useEffect(() => {
//     if (doctorOtpStatus !== "sent" || otpCountdown <= 0) return;

//     const timer = setInterval(() => {
//       setOtpCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [doctorOtpStatus, otpCountdown]);

//   const resetForm = () => {
//     setDoctorFullName("");
//     setDoctorPhone("");
//     setDoctorSpecialization("");
//     setDoctorExperience("");
//     setDoctorEmail("");
//     setDoctorOtp("");
//     setDoctorOtpStatus("idle");
//     setOtpCountdown(0);
//     setIsProcessing(false);
//     setErrorMessage("");
//     setInfoMessage("");
//     setShowOtpModal(false);
//     setDoctorCountryCode(DEFAULT_COUNTRY_CODE);
//     setIsCountryDropdownOpen(false);
//   };

//   const validateDoctorDetails = () => {
//     // Only phone number is required
//     if (!doctorPhone.trim()) {
//       setErrorMessage("Please enter your mobile number.");
//       return false;
//     }

//     // Validate phone number format
//     const digitsOnly = sanitizeDigits(doctorPhone);
//     if (!validatePhoneNumber(digitsOnly, doctorCountryCode)) {
//       const country = getCountryByCode(doctorCountryCode);
//       setErrorMessage(
//         `Please enter a valid mobile number for ${country.name}.`
//       );
//       return false;
//     }

//     // If experience is provided, validate it's a valid number
//     if (doctorExperience.trim()) {
//       const parsedExperience = parseInt(doctorExperience, 10);
//       if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
//         setErrorMessage("Experience must be a valid number.");
//         return false;
//       }
//     }

//     return true;
//   };

//   const sanitizeDigits = (value = "") => value.replace(/\D/g, "");

//   const handleDoctorPhoneChange = (value = "") => {
//     if (!value || !value.trim()) {
//       setDoctorPhone("");
//       return;
//     }
//     const trimmed = value.trim();

//     // Auto-detect country code if number starts with +
//     if (trimmed.startsWith("+")) {
//       const detected = detectCountryCode(trimmed);
//       setDoctorCountryCode(detected);
//       const digitsOnly = sanitizeDigits(trimmed);
//       setDoctorPhone(`+${digitsOnly}`);
//       return;
//     }

//     const digitsOnly = sanitizeDigits(trimmed);
//     if (!digitsOnly) {
//       setDoctorPhone("");
//       return;
//     }
//     setDoctorPhone(digitsOnly);
//   };

//   const buildDoctorPhoneNumber = () => {
//     if (!doctorPhone || !doctorPhone.trim()) {
//       return "";
//     }
//     const trimmed = doctorPhone.trim();

//     // If already has + prefix, return as-is
//     if (trimmed.startsWith("+")) {
//       return trimmed;
//     }

//     return buildFullPhoneNumber(trimmed, doctorCountryCode);
//   };

//   const handleSendVerification = async () => {
//     // Since email field is removed, always use experimental flow
//     await handleExperimentalDoctorSignup();
//   };

//   const handleExperimentalDoctorSignup = async () => {
//     if (!validateDoctorDetails()) {
//       return;
//     }

//     const phoneNumber = buildDoctorPhoneNumber();
//     if (!phoneNumber) {
//       setErrorMessage("Please enter a valid mobile number.");
//       return;
//     }

//     // Parse experience only if provided
//     const parsedExperience = doctorExperience.trim()
//       ? parseInt(doctorExperience, 10)
//       : undefined;

//     // Validate experience if provided
//     if (parsedExperience !== undefined && (Number.isNaN(parsedExperience) || parsedExperience < 0)) {
//       setErrorMessage("Experience must be a valid number.");
//       return;
//     }

//     setErrorMessage("");
//     setInfoMessage("");
//     setIsProcessing(true);

//     try {
//       // Experimental flow: signup with mobile only (name, specialization, experience are optional)
//       await doctorsSignup({
//         phoneNumber,
//         ...(doctorFullName.trim() && { name: doctorFullName.trim() }),
//         ...(doctorSpecialization.trim() && { specialization: doctorSpecialization.trim() }),
//         ...(parsedExperience !== undefined && { experience: parsedExperience }),
//         // email and otp are omitted for experimental flow
//       });

//       setInfoMessage("Doctor registration successful! Redirecting...");
//       setIsProcessing(false);
//       onRequestClose();

//       // Navigate to doctor dashboard immediately after signup
//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: "DoctorAppNavigation",
//               params: { screen: "Dashboard" },
//             },
//           ],
//         });
//       }, 100);
//     } catch (error) {
//       setErrorMessage(getErrorMessage(error));
//       setIsProcessing(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     const phoneNumber = buildDoctorPhoneNumber();
//     if (!phoneNumber || !doctorOtp.trim()) {
//       setErrorMessage("Please enter the OTP sent to your mobile.");
//       return false;
//     }

//     setIsProcessing(true);
//     setErrorMessage("");
//     try {
//       // Directly call signup with phone + OTP (no separate verify step)
//       await handleDoctorSignup(phoneNumber, doctorOtp.trim());
//       setDoctorOtpStatus("verified");
//       setShowOtpModal(false);
//       return true;
//     } catch (error) {
//       setErrorMessage(getErrorMessage(error));
//       setDoctorOtpStatus("sent");
//       setIsProcessing(false);
//       return false;
//     }
//   };

//   const handleDoctorSignup = async (phoneNumberOverride, otpOverride) => {
//     if (!validateDoctorDetails()) {
//       throw new Error("Validation failed");
//     }

//     const parsedExperience = parseInt(doctorExperience, 10);
//     const phoneNumber = phoneNumberOverride || buildDoctorPhoneNumber();
//     const otpToUse = otpOverride || doctorOtp.trim();

//     if (!phoneNumber || !otpToUse) {
//       setErrorMessage("Phone number and OTP are required.");
//       throw new Error("Phone/OTP required");
//     }

//     setIsProcessing(true);
//     setErrorMessage("");
//     setInfoMessage("");

//     try {
//       await doctorsSignup({
//         phoneNumber,
//         email: doctorEmail.trim(),  // Email is now mandatory
//         otp: otpToUse,
//         name: doctorFullName.trim(),
//         specialization: doctorSpecialization.trim(),
//         experience: parsedExperience,
//       });

//       setInfoMessage("Doctor registration successful! Redirecting...");
//       setShowOtpModal(false);
//       onRequestClose();

//       // Navigate to doctor dashboard immediately after signup
//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: "DoctorAppNavigation",
//               params: { screen: "Dashboard" },
//             },
//           ],
//         });
//       }, 100);
//     } catch (error) {
//       setErrorMessage(getErrorMessage(error));
//       throw error; // Re-throw so caller knows signup failed
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     // OTP flow is no longer used since email field is removed
//     // This function is kept for compatibility but shouldn't be called
//     setErrorMessage("OTP flow is not available. Please use signup without email.");
//   };

//   const doctorPhoneDigits = sanitizeDigits(doctorPhone);
//   const isDoctorPhoneValid = validatePhoneNumber(
//     doctorPhoneDigits,
//     doctorCountryCode
//   );
//   const showDoctorPhoneError =
//     doctorPhone.trim().length > 0 && !isDoctorPhoneValid;

//   return (
//     <>
//       <Modal transparent visible={visible} animationType="fade">
//         <View style={styles.overlay}>
//           <ScrollView
//             contentContainerStyle={{
//               flexGrow: 1,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <View
//               style={[
//                 styles.card,
//                 Platform.OS === "web"
//                   ? { width: 320 }
//                   : [
//                       styles.mobileCard,
//                       {
//                         width: Dimensions.get("window").width * 0.9,
//                         minWidth: 200,
//                         maxWidth: 420,
//                       },
//                     ],
//               ]}
//             >
//               <Text style={styles.titleHead}>Join Kokoro Doctor</Text>
//               <Text style={[styles.title, { marginBottom: 20 }]}>
//                 Doctor Registration
//               </Text>

//               <Text style={styles.inputLabel}>
//                 Full Name <Text style={styles.optionalIndicator}>(Optional)</Text>
//               </Text>
//               <TextInput
//                 placeholder="Enter your full name (optional)"
//                 placeholderTextColor="#d3d3d3"
//                 style={styles.input}
//                 value={doctorFullName}
//                 onChangeText={setDoctorFullName}
//                 autoCapitalize="words"
//               />

//               <Text style={styles.inputLabel}>
//                 Mobile Number <Text style={styles.requiredIndicator}>*</Text>
//               </Text>
//               <View style={styles.phoneContainer}>
//                 <View style={styles.countryCodeContainer}>
//                   <TouchableOpacity
//                     onPress={() =>
//                       setIsCountryDropdownOpen(!isCountryDropdownOpen)
//                     }
//                     style={styles.countryCodeButton}
//                   >
//                     <Text style={styles.countryCodeText}>
//                       {getCountryByCode(doctorCountryCode).flag}{" "}
//                       {doctorCountryCode}
//                     </Text>
//                     <Ionicons
//                       name={
//                         isCountryDropdownOpen ? "chevron-up" : "chevron-down"
//                       }
//                       size={16}
//                       color="#666"
//                       style={{ marginLeft: 4 }}
//                     />
//                   </TouchableOpacity>
//                   {isCountryDropdownOpen && (
//                     <View style={styles.countryDropdown}>
//                       <ScrollView
//                         style={styles.countryDropdownScroll}
//                         nestedScrollEnabled
//                       >
//                         {COUNTRY_CODES.map((country) => (
//                           <TouchableOpacity
//                             key={country.code}
//                             style={styles.countryDropdownItem}
//                             onPress={() => {
//                               setDoctorCountryCode(country.code);
//                               setIsCountryDropdownOpen(false);
//                             }}
//                           >
//                             <Text style={styles.countryDropdownText}>
//                               {country.flag} {country.code} {country.name}
//                             </Text>
//                           </TouchableOpacity>
//                         ))}
//                       </ScrollView>
//                     </View>
//                   )}
//                 </View>
//                 <TextInput
//                   placeholder="Enter your mobile number"
//                   placeholderTextColor="#d3d3d3"
//                   keyboardType="phone-pad"
//                   autoCapitalize="none"
//                   style={styles.phoneInput}
//                   value={doctorPhone}
//                   onChangeText={handleDoctorPhoneChange}
//                   maxLength={getCountryByCode(doctorCountryCode).maxLength}
//                 />
//               </View>
//               {showDoctorPhoneError ? (
//                 <Text style={styles.inlineErrorText}>
//                   Please enter a valid mobile number for{" "}
//                   {getCountryByCode(doctorCountryCode).name}.
//                 </Text>
//               ) : null}

//               <Text style={styles.inputLabel}>
//                 Specialization <Text style={styles.optionalIndicator}>(Optional)</Text>
//               </Text>
//               <TextInput
//                 placeholder="e.g. Cardiologist (optional)"
//                 placeholderTextColor="#d3d3d3"
//                 style={styles.input}
//                 value={doctorSpecialization}
//                 onChangeText={setDoctorSpecialization}
//                 autoCapitalize="words"
//               />

//               <Text style={styles.inputLabel}>
//                 Years of Experience{" "}
//                 <Text style={styles.optionalIndicator}>(Optional)</Text>
//               </Text>
//               <TextInput
//                 placeholder="e.g. 5 (optional)"
//                 placeholderTextColor="#d3d3d3"
//                 style={styles.input}
//                 keyboardType="numeric"
//                 value={doctorExperience}
//                 onChangeText={setDoctorExperience}
//               />

//               <TouchableOpacity
//                 style={[
//                   styles.btn,
//                   (isProcessing || !isDoctorPhoneValid) &&
//                     styles.disabledBtn,
//                 ]}
//                 onPress={handleSendVerification}
//                 disabled={
//                   isProcessing || !isDoctorPhoneValid
//                 }
//               >
//                 <Text style={styles.btnText}>
//                   {isProcessing ? "Signing up..." : "Sign Up"}
//                 </Text>
//               </TouchableOpacity>

//               {errorMessage ? (
//                 <Text style={styles.errorText}>{errorMessage}</Text>
//               ) : null}
//               {infoMessage ? (
//                 <Text style={styles.infoText}>{infoMessage}</Text>
//               ) : null}

//               <TouchableOpacity
//                 onPress={onRequestClose}
//                 style={styles.closeBtn}
//               >
//                 <Ionicons name="close" size={20} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </View>
//       </Modal>

//       {/* Separate OTP Verification Modal */}
//       <Modal transparent visible={showOtpModal} animationType="fade">
//         <View style={styles.overlay}>
//           <View
//             style={[
//               styles.card,
//               Platform.OS === "web"
//                 ? { width: 320, maxWidth: "90vw", minWidth: 300 }
//                 : [
//                     styles.mobileCard,
//                     {
//                       width: Dimensions.get("window").width * 0.9,
//                       minWidth: 200,
//                       maxWidth: 420,
//                     },
//                   ],
//             ]}
//           >
//             <TouchableOpacity
//               style={styles.closeBtn}
//               onPress={() => {
//                 setShowOtpModal(false);
//                 setDoctorOtp("");
//                 setDoctorOtpStatus("idle");
//                 setOtpCountdown(0);
//               }}
//             >
//               <Ionicons name="close" size={20} color="#6B7280" />
//             </TouchableOpacity>

//             <Text style={styles.titleHead}>Verify OTP</Text>
//             <Text style={styles.title}>Enter OTP sent to {doctorPhone}</Text>

//             <Text style={styles.inputLabel}>Enter OTP</Text>
//             <TextInput
//               placeholder="Enter OTP"
//               placeholderTextColor="#d3d3d3"
//               keyboardType="numeric"
//               style={styles.input}
//               value={doctorOtp}
//               onChangeText={setDoctorOtp}
//               maxLength={4}
//               autoFocus
//             />

//             {errorMessage && (
//               <Text style={styles.errorText}>{errorMessage}</Text>
//             )}
//             {infoMessage && <Text style={styles.infoText}>{infoMessage}</Text>}

//             <TouchableOpacity
//               style={[
//                 styles.btn,
//                 (doctorOtp.trim().length !== 4 || isProcessing) &&
//                   styles.disabledBtn,
//               ]}
//               onPress={handleVerifyOtp}
//               disabled={doctorOtp.trim().length !== 4 || isProcessing}
//             >
//               <Text style={styles.btnText}>
//                 {isProcessing
//                   ? "Verifying & Signing Up..."
//                   : "Verify & Sign Up"}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.resendBtn,
//                 (otpCountdown > 0 || isProcessing) && styles.disabledBtn,
//               ]}
//               onPress={handleResendOtp}
//               disabled={otpCountdown > 0 || isProcessing}
//             >
//               <Text style={styles.resendBtnText}>
//                 {otpCountdown > 0
//                   ? `Resend OTP in ${otpCountdown}s`
//                   : "Resend OTP"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 99999,
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 22,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#EEEEEE",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   mobileCard: {
//     borderRadius: 16,
//     paddingBottom: 20,
//     maxHeight: "85%",
//   },
//   titleHead: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 10,
//     textAlign: "center",
//     letterSpacing: -0.5,
//   },
//   title: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#666",
//     textAlign: "center",
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#333",
//     marginTop: 10,
//     marginBottom: 2,
//     textAlign: "left",
//     width: "100%",
//   },
//   input: {
//     width: "100%",
//     borderWidth: 1,
//     borderColor: "#DDD",
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     marginTop: 2,
//     backgroundColor: "#FFFFFF",
//     color: "#333",
//   },
//   phoneContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     borderWidth: 1,
//     borderColor: "#DDD",
//     borderRadius: 8,
//     marginTop: 2,
//     marginBottom: 12,
//     minHeight: 50,
//     backgroundColor: "#FFFFFF",
//     overflow: "visible",
//   },
//   countryCodeContainer: {
//     position: "relative",
//     borderRightWidth: 1,
//     borderRightColor: "#DDD",
//     paddingRight: 8,
//     marginRight: 8,
//   },
//   countryCodeButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     minWidth: 80,
//   },
//   countryCodeText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//   },
//   countryDropdown: {
//     position: "absolute",
//     top: "100%",
//     left: 0,
//     right: 0,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#DDD",
//     borderRadius: 8,
//     marginTop: 4,
//     maxHeight: 200,
//     zIndex: 1000,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   countryDropdownScroll: {
//     maxHeight: 200,
//   },
//   countryDropdownItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//   },
//   countryDropdownText: {
//     fontSize: 14,
//     color: "#333",
//   },
//   phoneInput: {
//     flex: 1,
//     fontSize: 15,
//     color: "#333",
//     paddingVertical: 12,
//     paddingHorizontal: 4,
//   },
//   btn: {
//     backgroundColor: "#1FBF86",
//     paddingVertical: 12,
//     borderRadius: 8,
//     width: "100%",
//     alignItems: "center",
//     marginTop: 16,
//   },
//   disabledBtn: {
//     opacity: 0.5,
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 15,
//     letterSpacing: 0.3,
//   },
//   resendInfo: {
//     marginTop: 8,
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   resendBtn: {
//     marginTop: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#1FBF86",
//     backgroundColor: "transparent",
//     width: "100%",
//     alignItems: "center",
//   },
//   resendBtnText: {
//     color: "#1FBF86",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   errorText: {
//     color: "#DC2626",
//     marginTop: 12,
//     textAlign: "center",
//     fontSize: 14,
//     fontWeight: "500",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     // backgroundColor: "#FEE2E2",
//     borderRadius: 8,
//     width: "100%",
//   },
//   infoText: {
//     color: "#16a34a",
//     marginTop: 6,
//     textAlign: "center",
//     fontSize: 13,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     // backgroundColor: "#dcfce7",
//     borderRadius: 8,
//     width: "100%",
//   },
//   closeBtn: {
//     position: "absolute",
//     top: 16,
//     right: 16,
//     backgroundColor: "#F4F6F8",
//     borderRadius: 20,
//     width: 32,
//     height: 32,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#EEEEEE",
//   },
//   requiredIndicator: {
//     color: "#EF4444",
//     fontSize: 12,
//     fontWeight: "bold",
//     marginLeft: 2,
//   },
//   optionalIndicator: {
//     color: "#6B7280",
//     fontSize: 13,
//     fontWeight: "normal",
//     marginLeft: 4,
//   },
//   inlineErrorText: {
//     width: "100%",
//     color: "#DC2626",
//     fontSize: 12,
//     marginTop: -2,
//     marginBottom: 6,
//     textAlign: "left",
//   },
// });

// export default DoctorSignupModal;

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { useRole } from "../../contexts/RoleContext";
import {
  buildFullPhoneNumber,
  DEFAULT_COUNTRY_CODE,
  detectCountryCode,
  getCountryByCode,
  validatePhoneNumber,
} from "../../utils/countryCodes";
import { getErrorMessage } from "../../utils/errorUtils";

const WEB_CARD_WIDTH = 300;

const DoctorAuthModal = ({
  visible,
  onRequestClose,
  initialMode = "signup",
}) => {
  const navigation = useNavigation();
  const {
    doctorsSignup,
    requestLoginOtp: requestLoginOtpHandler,
    loginWithOtp: loginWithOtpHandler,
    initiateLogin: initiateLoginHandler,
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
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
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

    setOtpStatus("idle");
    setOtpCountdown(0);
    setOtp("");
    setOtpFlow(null);
    setOtpTargetPhone("");
    setShowOtpModal(false);
    setErrorMessage("");
    setInfoMessage("");

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

  const currentCountryCode =
    mode === "login" ? loginCountryCode : signupCountryCode;
  const currentPhoneValue =
    mode === "login" ? loginIdentifier : signupIdentifier;
  const phoneDigits = sanitizeDigits(currentPhoneValue);
  const isPhoneValid = validatePhoneNumber(phoneDigits, currentCountryCode);
  const isOtpComplete = otp.trim().length === 4;

  const handleLoginIdentifierChange = (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLoginIdentifier("");
      setMobile("");
      return;
    }

    if (trimmed.startsWith("+")) {
      const detected = detectCountryCode(trimmed);
      setLoginCountryCode(detected);
    }

    const digitsOnly = sanitizeDigits(trimmed);
    const normalized =
      trimmed.startsWith("+") && digitsOnly ? `+${digitsOnly}` : digitsOnly;

    setLoginIdentifier(normalized);
    setMobile(normalized);
  };

  const handleSignupIdentifierChange = (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSignupIdentifier("");
      setMobile("");
      return;
    }

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
    const valueToUse =
      phoneValue || mobile || signupIdentifier || loginIdentifier;
    const trimmed = valueToUse.trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("+")) {
      return trimmed;
    }

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
    setLoginIdentifier("");
    setSignupIdentifier("");
    setFullName("");
    setSpecialization("");
    setExperience("");
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
      await requestLoginOtpHandler({
        identifier: phoneNumber,
        preferredChannel: "email",
      });
      setInfoMessage("OTP sent to your email address.");
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

      onRequestClose();

      const userRole = result?.role;
      if (userRole === "doctor") {
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
      }

      return result;
    } catch (error) {
      setOtpStatus("sent");
      setErrorMessage(getErrorMessage(error));
      setIsProcessing(false);
      return null;
    }
  };

  const handleExperimentalSignup = async () => {
    const phoneNumberToUse = signupIdentifier || buildPhoneNumber();
    const nameToUse = fullName.trim();
    const specializationToUse = specialization.trim();
    const experienceToUse = experience.trim();

    if (!phoneNumberToUse) {
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    const digitsOnly = sanitizeDigits(phoneNumberToUse);
    if (!validatePhoneNumber(digitsOnly, signupCountryCode)) {
      const country = getCountryByCode(signupCountryCode);
      setErrorMessage(
        `Please enter a valid mobile number for ${country.name}.`,
      );
      return;
    }

    const normalizedPhone = buildPhoneNumber(
      phoneNumberToUse,
      signupCountryCode,
    );
    if (!normalizedPhone) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    if (experienceToUse) {
      const parsedExperience = parseInt(experienceToUse, 10);
      if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
        setErrorMessage("Experience must be a valid number.");
        return;
      }
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsSigningUp(true);
    setIsProcessing(true);

    try {
      const signupData = {
        phoneNumber: normalizedPhone,
      };

      if (nameToUse) signupData.name = nameToUse;
      if (specializationToUse) signupData.specialization = specializationToUse;
      if (experienceToUse) {
        signupData.experience = parseInt(experienceToUse, 10);
      }

      const result = await doctorsSignup(signupData);

      const userRole = result?.role || "doctor";
      setRole(userRole);
      await AsyncStorage.setItem("userRole", userRole);

      setInfoMessage("Signup successful! Redirecting...");
      setIsSigningUp(false);
      setIsProcessing(false);

      onRequestClose();

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
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      setIsSigningUp(false);
      setIsProcessing(false);
    }
  };

  const handleDirectLogin = async () => {
    if (isProcessing) return;

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    const digitsOnly = sanitizeDigits(identifier);
    if (!validatePhoneNumber(digitsOnly, loginCountryCode)) {
      const country = getCountryByCode(loginCountryCode);
      setErrorMessage(
        `Please enter a valid mobile number for ${country.name}.`,
      );
      return;
    }

    const phoneNumber = buildPhoneNumber(identifier, loginCountryCode);
    if (!phoneNumber) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);

    try {
      const result = await initiateLoginHandler({
        identifier: phoneNumber,
      });

      if (result?.access_token) {
        const userRole = result?.role || "doctor";
        setRole(userRole);
        await AsyncStorage.setItem("userRole", userRole);

        setInfoMessage("Login successful! Redirecting...");
        setIsProcessing(false);

        onRequestClose();

        if (userRole === "doctor") {
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
        }
      } else {
        setIsProcessing(false);
        await sendOtpForFlow({ phoneNumber, flow: "login" });
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      setIsProcessing(false);
    }
  };

  const handleNext = async () => {
    if (isProcessing) return;

    if (mode === "login") {
      await handleDirectLogin();
      return;
    }

    if (!validateSignupFields()) {
      return;
    }

    await handleExperimentalSignup();
  };

  const handleResendOtp = async () => {
    if (isProcessing || otpCountdown > 0 || !otpTargetPhone || !otpFlow) {
      return;
    }
    setIsProcessing(true);
    setErrorMessage("");
    try {
      await requestLoginOtpHandler({
        identifier: otpTargetPhone,
        preferredChannel: "email",
      });
      setInfoMessage("OTP resent to your email address.");
      setOtpCountdown(60);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const validateSignupFields = () => {
    if (!signupIdentifier.trim()) {
      setErrorMessage("Please enter your mobile number.");
      return false;
    }
    const digitsOnly = sanitizeDigits(signupIdentifier);
    if (!validatePhoneNumber(digitsOnly, signupCountryCode)) {
      const country = getCountryByCode(signupCountryCode);
      setErrorMessage(
        `Please enter a valid mobile number for ${country.name}.`,
      );
      return false;
    }
    if (experience.trim()) {
      const parsedExperience = parseInt(experience, 10);
      if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
        setErrorMessage("Experience must be a valid number.");
        return false;
      }
    }
    return true;
  };

  const loginDigitsValid = validatePhoneNumber(
    sanitizeDigits(loginIdentifier),
    loginCountryCode,
  );
  const showLoginPhoneError =
    loginIdentifier.trim().length > 0 && !loginDigitsValid;

  const signupDigitsValid = validatePhoneNumber(
    sanitizeDigits(signupIdentifier),
    signupCountryCode,
  );
  const showSignupPhoneError =
    signupIdentifier.trim().length > 0 && !signupDigitsValid;
  const baseSignupValid = signupDigitsValid;

  const isLoginActionDisabled =
    !loginIdentifier.trim() || !loginDigitsValid || isProcessing;

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
                  Try Free
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
                  Already a member!
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
                  <Text style={styles.titleHead}>Welcome Back, Doctor!</Text>
                  <Text style={styles.subtitle}>Enter your mobile number</Text>

                  <Text style={styles.inputLabel}>
                    Mobile Number{" "}
                    <Text style={styles.requiredIndicator}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.phoneContainer,
                      isLoginCountryDropdownOpen &&
                        styles.phoneContainerWithDropdown,
                    ]}
                  >
                    <View style={styles.countryCodeContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          setIsLoginCountryDropdownOpen(
                            !isLoginCountryDropdownOpen,
                          )
                        }
                        style={styles.countryCodeButton}
                      >
                        <Text style={styles.countryCodeText}>
                          {getCountryByCode(loginCountryCode).flag}{" "}
                          {loginCountryCode}
                        </Text>
                        <Ionicons
                          name={
                            isLoginCountryDropdownOpen
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={16}
                          color="#666"
                          style={{ marginLeft: 4 }}
                        />
                      </TouchableOpacity>
                      {isLoginCountryDropdownOpen && (
                        <View style={styles.countryDropdown}>
                          <ScrollView
                            style={styles.countryDropdownScroll}
                            nestedScrollEnabled
                          >
                            {[
                              { code: "+91", name: "India", flag: "🇮🇳" },
                              { code: "+1", name: "USA", flag: "🇺🇸" },
                            ].map((country) => (
                              <TouchableOpacity
                                key={country.code}
                                style={styles.countryDropdownItem}
                                onPress={() => {
                                  setLoginCountryCode(country.code);
                                  setIsLoginCountryDropdownOpen(false);
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
                      value={loginIdentifier}
                      onChangeText={handleLoginIdentifierChange}
                      maxLength={getCountryByCode(loginCountryCode).maxLength}
                    />
                  </View>
                  {showLoginPhoneError ? (
                    <Text style={styles.inlineErrorText}>
                      Please enter a valid mobile number for{" "}
                      {getCountryByCode(loginCountryCode).name}.
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
                      {isProcessing ? "Logging in..." : "Login to Portal"}
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
                  <Text style={styles.titleHead}>Join Kokoro as a Doctor</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#999999",
                      alignSelf: "center",
                      fontFamily: "Farsan",
                      fontWeight: 400,
                      marginBottom: 20,
                    }}
                  >
                    Let&apos;s get you registered!
                  </Text>

                  <Text style={styles.inputLabel}>
                    Full Name{" "}
                    <Text style={styles.optionalIndicator}>(Optional)</Text>
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
                  <View
                    style={[
                      styles.phoneContainer,
                      isSignupCountryDropdownOpen &&
                        styles.phoneContainerWithDropdown,
                    ]}
                  >
                    <View style={styles.countryCodeContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          setIsSignupCountryDropdownOpen(
                            !isSignupCountryDropdownOpen,
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
                            {[
                              { code: "+91", name: "India", flag: "🇮🇳" },
                              { code: "+1", name: "USA", flag: "🇺🇸" },
                            ].map((country) => (
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
                    Specialization{" "}
                    <Text style={styles.optionalIndicator}>(Optional)</Text>
                  </Text>
                  <TextInput
                    placeholder="e.g. Cardiologist"
                    placeholderTextColor="#d3d3d3"
                    style={styles.input}
                    value={specialization}
                    onChangeText={setSpecialization}
                    autoCapitalize="words"
                  />

                  <Text style={styles.inputLabel}>
                    Years of Experience{" "}
                    <Text style={styles.optionalIndicator}>(Optional)</Text>
                  </Text>
                  <TextInput
                    placeholder="e.g. 5"
                    placeholderTextColor="#d3d3d3"
                    style={styles.input}
                    keyboardType="numeric"
                    value={experience}
                    onChangeText={setExperience}
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
                      {isProcessing ? "Signing up..." : "Register as Doctor"}
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
              <Ionicons name="close" size={14} color="#9CA3AF" />
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
              <Ionicons name="close" size={14} color="#9CA3AF" />
            </TouchableOpacity>
            <Text style={styles.titleHead}>Verify OTP</Text>
            <Text style={{ fontSize: 11.7, color: "#000", fontWeight: "600" }}>
              Enter OTP sent to
            </Text>{" "}
            <Text
              style={{ fontSize: 11.7, color: "#16a34a", fontWeight: "500" }}
            >
              {otpTargetPhone || loginIdentifier || "your registered email"}
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
                {isProcessing ? "Verifying & Logging In..." : "Verify & Login"}
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
    fontSize: 21,
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
    zIndex: 1,
  },
  phoneContainerWithDropdown: {
    marginBottom: 220,
  },
  countryCodeContainer: {
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
    paddingRight: 8,
    marginRight: 8,
    zIndex: 10001,
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
    zIndex: 10000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
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
    zIndex: 1,
  },
  disabledBtn: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.3,
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

export default DoctorAuthModal;
