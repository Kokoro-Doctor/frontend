import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import { useLoginModal } from "../../contexts/LoginModalContext";
import { useRole } from "../../contexts/RoleContext";

WebBrowser.maybeCompleteAuthSession();

export default function HeaderLoginSignUp({ isDoctorPortal = false }) {
  const [visible, setVisible] = useState(false);
  const [isSideBarVisible, setIsSideBarVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);
  const WEB_CARD_WIDTH = 300; // or your preferred width
  const [otpStatus, setOtpStatus] = useState("idle"); // idle | sending | sent | verifying | verified
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [verificationToken, setVerificationToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [mode, setMode] = useState("signup"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [loginMethod, setLoginMethod] = useState("phone"); // "email" or "phone"
  const [signupMethod, setSignupMethod] = useState("phone"); // "email" or "phone"
  const [signupEmail, setSignupEmail] = useState(""); // Separate email for signup
  const otpTimerRef = useRef(null);
  const {
    signup: signupHandler,
    login: loginHandler,
    logout: logoutHandler,
    googleLogin,
    loginWithGoogle,
  } = useContext(AuthContext);
  const { setRole } = useRole();
  const [selectedRole, setSelectedRole] = useState(null);
  const { registerOpenModal } = useLoginModal();
  const [request, response, promptAsync] = useGoogleAuth();
  const [googleHandled, setGoogleHandled] = useState(false);
  const { user: loggedInUser, setUser } = useContext(AuthContext);
  const { role, saveRole } = useRole();

  //const [loggedInUser, setLoggedInUser] = useState(null);

  const [cardWidth, setCardWidth] = useState(null);

  useEffect(() => {
    const width =
      Platform.OS === "web"
        ? WEB_CARD_WIDTH
        : Dimensions.get("window").width * 0.9;

    setCardWidth(width);
  }, []);

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

  // Handle Google authentication response
  useEffect(() => {
    if (Platform.OS === "web" && visible) {
      const handleGoogleResponse = async () => {
        if (response?.type === "success" && !googleHandled) {
          setGoogleHandled(true);
          setErrorMessage("");
          setInfoMessage("");
          setIsProcessing(true);
          try {
            const user = await googleLogin(response);
            if (user) {
              setInfoMessage("Login successful! Redirecting...");
              setTimeout(() => {
                closeModal();
                // Navigation will be handled by AuthContext or app state change
              }, 1000);
            } else {
              setIsProcessing(false);
            }
          } catch (error) {
            console.error("❌ Google login error:", error);
            setErrorMessage(getErrorMessage(error));
            setIsProcessing(false);
            setGoogleHandled(false);
          }
        } else if (response?.type === "error" && !googleHandled) {
          setGoogleHandled(true);
          setErrorMessage("Google authentication cancelled or failed.");
          setIsProcessing(false);
        }
      };
      handleGoogleResponse();
    }
  }, [response, googleHandled, googleLogin, visible]);

  // Detect mobile devices (native app or small web screens)
  const isApp = Platform.OS === "ios" || Platform.OS === "android";
  const isSmallScreen =
    Platform.OS === "web" && Dimensions.get("window").width <= 820;
  const isMobile = isApp || isSmallScreen;

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setAuthModalVisible(true);
  }, []);

  const closeAuthModal = () => {
    setAuthModalVisible(false);
  };

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (visible && mode === "signup" && signupMethod === "email") {
        try {
          const stored = await AsyncStorage.getItem("@signupVerification");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.token && parsed.email) {
              setVerificationToken(parsed.token);
              setSignupEmail(parsed.email);
              setStep(2); // Skip to profile completion step
              setInfoMessage("Email verified! Complete your profile.");
            }
          }
        } catch (error) {
          console.warn("Failed to check email verification token", error);
        }
      }
    };
    checkEmailVerification();
  }, [visible, mode, signupMethod]);

  const openModal = ({ mode: initialMode = "login" } = {}) => {
    slideAnim.stopAnimation();
    slideAnim.setValue(0);
    resetFlow();
    setMode(initialMode);
    setVisible(true);

    if (Platform.OS !== "web") {
      bottomAnim.setValue(Dimensions.get("window").height);
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  // Register openModal function with context so it can be called from anywhere
  useEffect(() => {
    registerOpenModal(openModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only register once on mount

  const closeModal = () => {
    if (Platform.OS !== "web") {
      Animated.timing(bottomAnim, {
        toValue: Dimensions.get("window").height,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        slideAnim.setValue(0);
        resetFlow();
        setStep(0);
      });
    } else {
      setVisible(false);
      slideAnim.setValue(0);
      resetFlow();
      setStep(0);
    }
  };

  useEffect(() => {
    if (!visible) {
      slideAnim.setValue(0);
      setStep(0);
      resetFlow();
    }
  }, [visible]);

  if (cardWidth === null) {
    return null;
  }

  const handleBack = () => {
    if (step > 0) {
      animateToStep(step - 1);
    }
  };

  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      setErrorMessage("Please enter a valid mobile number.");
      return false;
    }

    const phoneNumber = buildPhoneNumber();
    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtpStatus("sending");
    try {
      await initiateUserSignupVerification({ phoneNumber });
      setOtpStatus("sent");
      setOtpCountdown(60);
      setInfoMessage("OTP sent to your mobile number.");
      return true;
    } catch (error) {
      setOtpStatus("idle");
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendEmailVerification = async () => {
    const emailValue = signupEmail.trim().toLowerCase();
    if (!emailValue) {
      setErrorMessage("Please enter your email address.");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtpStatus("sending");
    try {
      await initiateUserSignupVerification({ email: emailValue });
      setOtpStatus("sent");
      setInfoMessage(
        "Verification email sent! Please check your inbox and click the verification link."
      );
      // Move to a success step showing instructions
      animateToStep(1);
      return true;
    } catch (error) {
      setOtpStatus("idle");
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpComplete) {
      setErrorMessage("Please enter the 6-digit OTP.");
      return false;
    }

    const phoneNumber = buildPhoneNumber();
    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtpStatus("verifying");
    try {
      const response = await verifyMobileOtp({
        phoneNumber,
        otp: otp.trim(),
      });

      if (response?.verification_token) {
        setVerificationToken(response.verification_token);
      }
      setOtpStatus("verified");
      setInfoMessage("Phone verified successfully.");
      return true;
    } catch (error) {
      setOtpStatus("sent");
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleCompleteProfile = async () => {
  //   if (!firstName.trim()) {
  //     setErrorMessage("Please enter your first name.");
  //     return;
  //   }
  //   if (!hasValidPassword) {
  //     setErrorMessage("Password must be at least 5 characters.");
  //     return;
  //   }
  //   if (!verificationToken) {
  //     setErrorMessage(
  //       signupMethod === "email"
  //         ? "Please verify your email first."
  //         : "Please verify your phone number first."
  //     );
  //     return;
  //   }
  //   setErrorMessage("");
  //   setInfoMessage("");
  //   setIsSigningUp(true);
  //   setIsProcessing(true);

  //   try {
  //     const fullName = `${firstName} ${lastName}`.trim();
  //     const userData = await signupHandler({
  //       username: fullName,
  //       password,
  //       verificationToken,
  //       phoneNumber: signupMethod === "phone" ? buildPhoneNumber() : undefined,
  //       email:
  //         signupMethod === "email"
  //           ? signupEmail.trim().toLowerCase()
  //           : undefined,
  //       role: setRole, // Add role input from user earlier
  //       location: "",
  //     });

  //     // Store user & role persistently
  //     setUser(userData);
  //     setRole(setRole);
  //     await AsyncStorage.setItem("userRole", setRole);
  //     await AsyncStorage.setItem("userDetails", JSON.stringify(userData));

  //     // ⭐ VERY IMPORTANT — STORE FIRST TIME USER FLAG
  //     await AsyncStorage.setItem("isFirstTimeUser", "true");

  //     // Clear cached verification token
  //     await AsyncStorage.removeItem("@signupVerification");

  //     setInfoMessage("Signup successful! Redirecting...");

  //     // setTimeout(() => {
  //     //   closeModal();
  //     //   if (setRole === "doctor") {
  //     //     navigation.navigate("Dashboard");
  //     //   } else if (userData.role === "patient") {
  //     //     navigation.navigate("LandingPage");
  //     //   } else {
  //     //     navigation.navigate("DoctorPatientLandingPage"); // handle unexpected case
  //     //   }
  //     // }, 1500);
  //     setTimeout(() => {
  //       closeModal();

  //       // ALWAYS redirect to Doctor/Patient choose page
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "DoctorPatientLandingPage" }],
  //       });
  //     }, 800);
  //   } catch (error) {
  //     setErrorMessage(getErrorMessage(error));
  //     setIsSigningUp(false);
  //     setIsProcessing(false);
  //   }
  // };

  // const handleCompleteProfile = async () => {
  //   if (!firstName.trim()) {
  //     setErrorMessage("Please enter your first name.");
  //     return;
  //   }
  //   if (!hasValidPassword) {
  //     setErrorMessage("Password must be at least 5 characters.");
  //     return;
  //   }
  //   if (!verificationToken) {
  //     setErrorMessage(
  //       signupMethod === "email"
  //         ? "Please verify your email first."
  //         : "Please verify your phone number first."
  //     );
  //     return;
  //   }

  //   setErrorMessage("");
  //   setIsSigningUp(true);
  //   setIsProcessing(true);

  //   try {
  //     const fullName = `${firstName} ${lastName}`.trim();

  //     const userData = await signupHandler({
  //       username: fullName,
  //       password,
  //       verificationToken,
  //       phoneNumber: signupMethod === "phone" ? buildPhoneNumber() : undefined,
  //       email:
  //         signupMethod === "email"
  //           ? signupEmail.trim().toLowerCase()
  //           : undefined,
  //       role: selectedRole,
  //       location: "",
  //     });

  //     // setUser(userData);

  //     // // SAVE role
  //     // setRole(selectedRole);
  //     // await AsyncStorage.setItem("userRole", selectedRole);

  //     // // FIRST TIME USER FLAG
  //     // await AsyncStorage.setItem("isFirstTimeUser", "true");

  //     // // Save full user
  //     // await AsyncStorage.setItem("userDetails", JSON.stringify(userData));

  //     // await AsyncStorage.removeItem("@signupVerification");

  //     // setTimeout(() => {
  //     //   closeModal();
  //     //   navigation.reset({
  //     //     index: 0,
  //     //     routes: [{ name: "DoctorPatientLandingPage" }],
  //     //   });
  //     // }, 800);
  //     setUser({
  //       ...userData,
  //       role: selectedRole,
  //     });

  //     // SAVE ROLE
  //     setRole(selectedRole);
  //     await AsyncStorage.setItem("userRole", selectedRole);

  //     // MARK FIRST TIME USER
  //     await AsyncStorage.setItem("isFirstTimeUser", "true");

  //     // SAVE FULL USER
  //     await AsyncStorage.setItem(
  //       "userDetails",
  //       JSON.stringify({
  //         ...userData,
  //         role: selectedRole,
  //       })
  //     );

  //     await AsyncStorage.removeItem("@signupVerification");

  //     // redirect
  //     setTimeout(() => {
  //       closeModal();
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "DoctorPatientLandingPage" }],
  //       });
  //     }, 800);
  //   } catch (error) {
  //     setErrorMessage(getErrorMessage(error));
  //     setIsSigningUp(false);
  //     setIsProcessing(false);
  //   }
  // };


  const handleCompleteProfile = async () => {
  console.log("=== SIGNUP: handleCompleteProfile() CALLED ===");
  console.log("First Name:", firstName);
  console.log("Last Name:", lastName);
  console.log("Password Valid:", hasValidPassword);
  console.log("Verification Token:", verificationToken);
  console.log("Signup Method:", signupMethod);
  console.log("Selected Role:", selectedRole);

  if (!firstName.trim()) {
    console.log("❌ ERROR: First name missing");
    setErrorMessage("Please enter your first name.");
    return;
  }
  if (!hasValidPassword) {
    console.log("❌ ERROR: Password invalid");
    setErrorMessage("Password must be at least 5 characters.");
    return;
  }
  if (!verificationToken) {
    console.log("❌ ERROR: Verification token missing");
    setErrorMessage(
      signupMethod === "email"
        ? "Please verify your email first."
        : "Please verify your phone number first."
    );
    return;
  }

  console.log("✔ Validation passed. Starting signup…");

  setErrorMessage("");
  setIsSigningUp(true);
  setIsProcessing(true);

  try {
    const fullName = `${firstName} ${lastName}`.trim();
    console.log("Full Name:", fullName);

    const payload = {
      username: fullName,
      password,
      verificationToken,
      phoneNumber: signupMethod === "phone" ? buildPhoneNumber() : undefined,
      email:
        signupMethod === "email"
          ? signupEmail.trim().toLowerCase()
          : undefined,
      role: selectedRole,
      location: "",
    };

    console.log("📤 Signup Payload:", payload);

    const userData = await signupHandler(payload);
    console.log("📥 Signup Response:", userData);

    // Set user locally
    setUser({ ...userData, role: selectedRole });
    console.log("✔ User state updated.");

    // Save role
    setRole(selectedRole);
    await AsyncStorage.setItem("userRole", selectedRole);
    console.log("✔ Role saved:", selectedRole);

    // Mark first time
    await AsyncStorage.setItem("isFirstTimeUser", "true");
    console.log("✔ First time user flag saved");

    // Save full user
    await AsyncStorage.setItem(
      "userDetails",
      JSON.stringify({ ...userData, role: selectedRole })
    );
    console.log("✔ User details saved in AsyncStorage");

    await AsyncStorage.removeItem("@signupVerification");
    console.log("✔ Temp signup data removed");

    console.log("➡ Redirecting to DoctorPatientLandingPage…");

    setTimeout(() => {
      closeModal();
      navigation.reset({
        index: 0,
        routes: [{ name: "DoctorPatientLandingPage" }],
      });
    }, 800);

  } catch (error) {
    console.log("❌ SIGNUP ERROR:", error);
    setErrorMessage(getErrorMessage(error));
    setIsSigningUp(false);
    setIsProcessing(false);
  }
};


  // const handleLogin = async () => {
  //   if (isProcessing) return;

  //   const identifier = loginMethod === "email" ? email.trim() : mobile.trim();
  //   if (!identifier) {
  //     setErrorMessage(
  //       loginMethod === "email"
  //         ? "Please enter your email address."
  //         : "Please enter your phone number."
  //     );
  //     return;
  //   }

  //   if (!password.trim()) {
  //     setErrorMessage("Please enter your password.");
  //     return;
  //   }

  //   setErrorMessage("");
  //   setInfoMessage("");
  //   setIsProcessing(true);

  //   try {
  //     const normalizedPhoneNumber =
  //       loginMethod === "phone" ? buildPhoneNumber() : undefined;

  //     const userData = await loginHandler(
  //       {
  //         email: loginMethod === "email" ? identifier : undefined,
  //         phoneNumber: normalizedPhoneNumber,
  //         password,
  //       },
  //       navigation
  //     );

  //     // if (userData) {
  //     //   await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
  //     //   await AsyncStorage.setItem("userRole", userData.role); // Save role persistently
  //     //   setUser(userData);
  //     //   setRole(userData.role);

  //     //   setInfoMessage("Login successful! Redirecting...");

  //     //   setTimeout(() => {
  //     //     closeModal();
  //     //     if (userData.role === "doctor") {
  //     //       navigation.navigate("Dashboard");
  //     //     } else if (userData.role === "patient") {
  //     //       navigation.navigate("LandingPage");
  //     //     } else {
  //     //       navigation.navigate("DoctorPatientLandingPage"); // handle unexpected case
  //     //     }
  //     //   }, 1000);
  //     // }
  //     if (!userData.role) {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "DoctorPatientLandingPage" }],
  //       });
  //       return;
  //     }

  //     if (userData.role === "doctor") {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "Dashboard" }],
  //       });
  //     } else {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "LandingPage" }],
  //       });
  //     }
  //   } catch (error) {
  //     const message = getErrorMessage(error);
  //     setErrorMessage(message);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // const handleLogin = async () => {
  //   if (isProcessing) return;

  //   const identifier = loginMethod === "email" ? email.trim() : mobile.trim();

  //   if (!identifier) {
  //     setErrorMessage(
  //       loginMethod === "email"
  //         ? "Please enter your email address."
  //         : "Please enter your phone number."
  //     );
  //     return;
  //   }

  //   if (!password.trim()) {
  //     setErrorMessage("Please enter your password.");
  //     return;
  //   }

  //   setErrorMessage("");
  //   setInfoMessage("");
  //   setIsProcessing(true);

  //   try {
  //     const normalizedPhoneNumber =
  //       loginMethod === "phone" ? buildPhoneNumber() : undefined;

  //     const userData = await loginHandler(
  //       {
  //         email: loginMethod === "email" ? identifier : undefined,
  //         phoneNumber: normalizedPhoneNumber,
  //         password,
  //       },
  //       navigation
  //     );

  //     // ⭐ SAVE USER
  //     await AsyncStorage.setItem("userDetails", JSON.stringify(userData));

  //     // await AsyncStorage.setItem("userRole", userData.role);
  //     // setUser(userData);
  //     // setRole(userData.role);

  //     await AsyncStorage.setItem(
  //       "userRole",
  //       userData?.role ? userData.role : "unknown"
  //     );

  //     setUser(userData);
  //     setRole(userData?.role || "unknown"); // fallback

  //     // ⭐ VERY IMPORTANT — FIRST TIME FLAG
  //     await AsyncStorage.setItem("isFirstTimeUser", "false"); // login = returning user

  //     // ⭐ CLOSE MODAL
  //     setVisible(false);

  //     // ⭐ REDIRECT
  //     if (!userData.role) {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "DoctorPatientLandingPage" }],
  //       });
  //       return;
  //     }

  //     if (userData.role === "doctor") {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "Dashboard" }],
  //       });
  //     } else {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "LandingPage" }],
  //       });
  //     }
  //   } catch (error) {
  //     setErrorMessage(getErrorMessage(error));
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

//   const handleLogin = async () => {
//   if (isProcessing) return;

//   const identifier = loginMethod === "email" ? email.trim() : mobile.trim();

//   if (!identifier) {
//     setErrorMessage(
//       loginMethod === "email"
//         ? "Please enter your email address."
//         : "Please enter your phone number."
//     );
//     return;
//   }

//   if (!password.trim()) {
//     setErrorMessage("Please enter your password.");
//     return;
//   }

//   setErrorMessage("");
//   setInfoMessage("");
//   setIsProcessing(true);

//   try {
//     const normalizedPhoneNumber =
//       loginMethod === "phone" ? buildPhoneNumber() : undefined;

//     // ⭐ This already sets user, role, and saves AsyncStorage in AuthContext
//     const userData = await loginHandler({
//       email: loginMethod === "email" ? identifier : undefined,
//       phoneNumber: normalizedPhoneNumber,
//       password,
//     });

//     // ⭐ Read role saved by AuthContext
//     const savedRole = await AsyncStorage.getItem("userRole");

//     // If STILL no role → go to doctor/patient screen
//     if (!savedRole || savedRole === "unknown") {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "DoctorPatientLandingPage" }],
//       });
//       return;
//     }

//     // ⭐ This is not a first-time user anymore
//     await AsyncStorage.setItem("isFirstTimeUser", "false");

//     // Close modal
//     setVisible(false);

//     // ⭐ Redirect based on role
//     if (savedRole === "doctor") {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Dashboard" }],
//       });
//     } else {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "LandingPage" }],
//       });
//     }

//   } catch (error) {
//     setErrorMessage(getErrorMessage(error));
//   } finally {
//     setIsProcessing(false);
//   }
// };


const handleLogin = async () => {
  console.log("=== LOGIN: handleLogin() CALLED ===");

  if (isProcessing) {
    console.log("⚠ Login blocked: already processing");
    return;
  }

  const identifier = loginMethod === "email" ? email.trim() : mobile.trim();

  console.log("Login Method:", loginMethod);
  console.log("Identifier:", identifier);

  if (!identifier) {
    console.log("❌ ERROR: Identifier missing");
    setErrorMessage(
      loginMethod === "email"
        ? "Please enter your email address."
        : "Please enter your phone number."
    );
    return;
  }

  if (!password.trim()) {
    console.log("❌ ERROR: Password missing");
    setErrorMessage("Please enter your password.");
    return;
  }

  setErrorMessage("");
  setInfoMessage("");
  setIsProcessing(true);

  try {
    const normalizedPhoneNumber =
      loginMethod === "phone" ? buildPhoneNumber() : undefined;

    console.log("📤 Login Payload:", {
      email: loginMethod === "email" ? identifier : undefined,
      phoneNumber: normalizedPhoneNumber,
      password,
    });

    const userData = await loginHandler({
      email: loginMethod === "email" ? identifier : undefined,
      phoneNumber: normalizedPhoneNumber,
      password,
    });

    console.log("📥 Login Response:", userData);

        // ⭐ IMPORTANT: Save role immediately after successful login
    if (userData?.role) {
      await AsyncStorage.setItem("userRole", userData.role);
      saveRole(userData.role);
      console.log("⭐ Role saved:", userData.role);
    }

    const savedRole = await AsyncStorage.getItem("userRole");
    console.log("Role Read From AsyncStorage:", savedRole);

    if (!savedRole || savedRole === "unknown") {
      console.log("⚠ No role found → redirecting to role selection");
      navigation.reset({
        index: 0,
        routes: [{ name: "DoctorPatientLandingPage" }],
      });
      return;
    }

    await AsyncStorage.setItem("isFirstTimeUser", "false");
    console.log("✔ Marked as returning user");

    setVisible(false);
    console.log("✔ Login modal closed");

    console.log("➡ Redirecting based on role:", savedRole);

    if (savedRole === "doctor") {
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "LandingPage" }],
      });
    }

  } catch (error) {
    console.log("❌ LOGIN ERROR:", error);
    setErrorMessage(getErrorMessage(error));
  } finally {
    setIsProcessing(false);
    console.log("=== LOGIN COMPLETE ===");
  }
};



  const handleForgotPassword = () => {
    const params =
      loginMethod === "email" && email.trim()
        ? { email: email.trim() }
        : undefined;
    closeModal();
    navigation.navigate("ForgotPassword", params);
  };

  const handleNext = async () => {
    if (isProcessing) return;

    // Login mode - handle login directly
    if (mode === "login") {
      handleLogin();
      return;
    }

    // Signup mode - continue with existing flow
    if (step === 0) {
      if (signupMethod === "phone") {
        const sent = await handleSendOtp();
        if (sent) {
          animateToStep(1);
        }
      } else {
        // Email signup
        const sent = await handleSendEmailVerification();
        // handleSendEmailVerification already moves to step 1
      }
    } else if (step === 1) {
      if (signupMethod === "phone") {
        const verified = await handleVerifyOtp();
        if (verified) {
          animateToStep(2);
        }
      } else {
        // Email signup - step 1 shows success message, user should check email
        // They'll come back via email link, so we don't auto-advance
        // But if they already have verification token, move to step 2
        if (verificationToken) {
          animateToStep(2);
        }
      }
    } else {
      handleCompleteProfile();
    }
  };

  const handleResendOtp = async () => {
    if (isProcessing || otpCountdown > 0) return;
    await handleSendOtp();
  };

  // const handleLogout = async () => {
  //   try {
  //     await logoutHandler();
  //     await AsyncStorage.removeItem("userDetails");
  //     await AsyncStorage.removeItem("userRole");   // <-- MISSING (fix)
  //     await AsyncStorage.removeItem("isFirstTimeUser");

  //     setUser(null); // <-- FIX
  //     setRole(null);
  //     setDropdownVisible(false);
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };

  // const handleLogout = async () => {
  //   try {
  //     await logoutHandler();
  //     await AsyncStorage.removeItem("userDetails");
  //     await AsyncStorage.removeItem("userRole"); // <-- required
  //     await AsyncStorage.removeItem("isFirstTimeUser");

  //     setUser(null);
  //     setRole(null);
  //     setDropdownVisible(false);

  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: "DoctorPatientLandingPage" }],
  //     });
  //   } catch (error) {
  //     console.error("Logout failed:", error);
  //   }
  // };

  const handleLogout = async () => {
  try {
    console.log("🚪 Logging out from Header...");

    // Call AuthContext logout
    await logoutHandler();

    // Clear all local storage keys (safety)
    await AsyncStorage.removeItem("userDetails");
    // await AsyncStorage.removeItem("userRole");
    // await AsyncStorage.removeItem("isFirstTimeUser");

    // Reset contexts
    setUser(null); 
    
    // setRole(null);

    // Close dropdown
    setDropdownVisible(false);

    console.log("✅ Logout complete (Role preserved)");
  } catch (error) {
    console.error("❌ Logout failed:", error);
  }
};


  const handleGoogleLogin = async () => {
    if (isProcessing) return;

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setGoogleHandled(false);

    try {
      if (Platform.OS === "web") {
        if (request) {
          console.log("👉 Starting Google login (Web)...");
          await promptAsync({ useProxy: false });
        } else {
          setErrorMessage(
            "Google authentication is not ready. Please try again."
          );
          setIsProcessing(false);
        }
      } else {
        console.log("👉 Starting Google login (Mobile App)...");
        const user = await loginWithGoogle();
        if (user) {
          setInfoMessage("Login successful! Redirecting...");
          setTimeout(() => {
            closeModal();
          }, 1000);
        } else {
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error("❌ Google login failed:", err);
      setErrorMessage(getErrorMessage(err));
      setIsProcessing(false);
      setGoogleHandled(false);
    }
  };

  const isEmailLogin = loginMethod === "email";
  const loginIdentifier = isEmailLogin ? email.trim() : mobile.trim();
  const canLogin = loginIdentifier && password.trim().length >= 5;

  const isEmailSignup = signupMethod === "email";
  const isEmailValid =
    signupEmail.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim().toLowerCase());

  const isPrimaryDisabled =
    mode === "login"
      ? !canLogin || isProcessing
      : step === 0
      ? isEmailSignup
        ? !isEmailValid || isProcessing
        : !isPhoneValid || isProcessing
      : step === 1
      ? isEmailSignup
        ? false // Email verification step - button can be clicked to check for token
        : !isOtpComplete || isProcessing
      : !verificationToken ||
        !firstName.trim() ||
        !hasValidPassword ||
        isProcessing ||
        isSigningUp;

  // Hover effects for web
  const onHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const onHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownVisible(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDoctorRegister = () => {
    setDoctorModalVisible(true);
  };

  return (
    <>
      {isMobile ? (
        <View style={styles.appHeaderContainer}>
          <Modal
            visible={isSideBarVisible}
            transparent
            onRequestClose={() => setIsSideBarVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.mobileSidebar}>
                {isDoctorPortal ? (
                  <NewestSidebar
                    navigation={navigation}
                    closeSidebar={() => setIsSideBarVisible(false)}
                  />
                ) : (
                  <SideBarNavigation
                    navigation={navigation}
                    closeSidebar={() => setIsSideBarVisible(false)}
                  />
                )}
              </View>
              <Pressable
                style={styles.overlay}
                onPress={() => setIsSideBarVisible(false)}
              />
            </View>
          </Modal>

          <View style={styles.appHeader}>
            <View style={styles.logo}>
              <Pressable
                style={styles.hamburger}
                onPress={() => setIsSideBarVisible(true)}
              >
                <MaterialIcons name="menu" size={30} color="black" />
              </Pressable>
              <Image
                source={require("../../assets/Icons/kokoro.png")}
                style={{ height: 30, width: 30 }}
              />
              <Text style={styles.appName}>Kokoro.Doctor</Text>
            </View>

            <View style={styles.authButtonsApp}>
              <View style={{ position: "relative" }}>
                <Pressable
                  style={styles.authButtonBox}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                  <MaterialIcons name="person" size={30} color="black" />
                </Pressable>

                {dropdownVisible && (
                  <View style={styles.dropdownMain}>
                    {loggedInUser ? (
                      // Logged in - show user info and logout
                      <>
                        <View style={styles.userInfoContainer}>
                          <Text style={styles.userNameText}>
                            {loggedInUser?.name || "User"}
                          </Text>
                          {loggedInUser?.email && (
                            <Text style={styles.userEmailText}>
                              {loggedInUser.email}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={handleLogout}
                          style={styles.logoutButton}
                        >
                          <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setDropdownVisible(false);
                          openAuthModal("login");
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownText}>Login / Signup</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <Pressable>
                <MaterialIcons name="notifications" size={30} color="black" />
              </Pressable>
            </View>
          </View>

          {!isDoctorPortal && (
            <View style={styles.usernameApp}>
              <Text style={{ fontWeight: "600", fontSize: 19 }}>Hello,</Text>
              <Text
                style={{
                  fontWeight: "800",
                  color: "#000",
                  fontSize: 19,
                }}
              >
                {" "}
                {loggedInUser?.name ? loggedInUser?.name : "User"}!
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {!loggedInUser ? (
            <Animated.View
              style={[
                styles.headerBtn,
                {
                  backgroundColor: isHovered ? "#f96166" : "#fff",
                  borderColor: isHovered ? "#f96166" : "#DDD",
                  transform: [{ scale: scaleAnim }],
                },
              ]}
              onMouseEnter={onHoverIn}
              onMouseLeave={onHoverOut}
            >
              <TouchableOpacity onPress={openModal} activeOpacity={0.8}>
                <Text
                  style={[
                    styles.headerBtnText,
                    { color: isHovered ? "#fff" : "#333" },
                  ]}
                >
                  Login / Signup
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <></>
          )}
        </>
      )}

      {/* ================= SHOW DASHBOARD TOP BAR WHEN LOGGED IN ================= */}
      {loggedInUser && (
        <View style={[styles.userInfo, styles.userInfoWeb]}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome {loggedInUser?.username ? loggedInUser.username : "User"}!
            </Text>
            {/* {loggedInUser?.username ? (
              <Text style={styles.welcomeText}>
                Welcome {loggedInUser?.name}
              </Text>
            ) : (
              <Text style={styles.welcomeText}>Welcome</Text>
            )} */}
            <Text style={styles.subText}>
              Here is your medical sales dashboard
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Image
              source={require("../../assets/Icons/search.png")}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your query"
              placeholderTextColor="rgba(255, 255, 255, 1)"
            />
          </View>

          {/* Notification + Profile */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable style={styles.iconsContainer}>
              <Image
                source={require("../../assets/Icons/notification1.png")}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
            </Pressable>

            {/* Profile Dropdown */}
            <View style={styles.profileWrapper}>
              <Pressable onPress={() => setDropdownVisible(!dropdownVisible)}>
                <Image
                  source={
                    loggedInUser?.picture
                      ? { uri: loggedInUser.picture }
                      : require("../../assets/Images/user-icon.jpg")
                  }
                  style={styles.userIcon}
                />
              </Pressable>

              {dropdownVisible && (
                <View style={[styles.dropdownMain, styles.dropdownWeb]}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("PatientAppNavigation", {
                        screen: "Settings",
                      })
                    }
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownText}>Profile</Text>
                  </TouchableOpacity>

                  <Pressable onPress={handleLogout} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>Logout</Text>
                  </Pressable>

                  <Pressable onPress={handleLogout} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>Delete Account</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      <PatientAuthModal
        visible={authModalVisible}
        initialMode={authModalMode}
        onRequestClose={closeAuthModal}
        onDoctorRegister={handleDoctorRegister}
      />
      <DoctorSignupModal
        visible={doctorModalVisible}
        onRequestClose={() => setDoctorModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 16,
    marginVertical: 8,
    minWidth: 140,
    alignSelf: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtnText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
  },

  userInfo: {
    marginTop: "1%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  userInfoWeb: {
    width: "100%",
    justifyContent: "space-around",
  },
  userInfoApp: {},
  userIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  usernameApp: {
    flexDirection: "row",
    marginLeft: "6%",
    marginTop: "0%",
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "#FF7072",
    borderRadius: 5,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownImage: {
    width: 50,
    height: 50,
  },
  // dropdownMain: {
  //   position: "absolute",
  //   backgroundColor: "#fff",
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   borderRadius: 5,
  //   elevation: 5,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 3.84,
  //   zIndex: 100,
  //   //marginRight: "6%",
  //   width:120
  // },
  dropdownLoggedOut: {
    top: 30,
    right: 0,
  },
  dropdownLoggedIn: {
    top: 40,
    right: 0,
  },
  dropdownWeb: {
    top: 40,
    right: "2%",
  },
  // dropdownItem: {
  //   padding: 10,
  // },
  // dropdownText: {
  //   fontSize: 14,
  // },
  welcomeText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#eab0b0ff",
  },
  subText: {
    fontSize: 13,
    color: "#ddd",
    marginTop: "1%",
  },
  searchContainer: {
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 8,
    paddingHorizontal: "3%",
    height: "70%",
    width: "30%",
    marginHorizontal: "10%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.66)",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingVertical: 0,
    outlineStyle: "none",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 20,
  },
  profileWrapper: {
    height: "60%",
    width: "10%",
    borderColor: "#fff",
    alignSelf: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderRadius: 8,
  },
  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 20,
  },

  // ===== Mobile Header =====
  appHeaderContainer: {
    backgroundColor: "#fff",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // logo: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },
  hamburger: {
    marginRight: 10,
  },
  appName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#000",
    marginLeft: 6,
  },
  authButtonsApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 10,
  },
  authButtonBox: {
    padding: 4,
    borderRadius: 8,
  },
  dropdownMain: {
    position: "absolute",
    right: 0,
    top: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 8,
    minWidth: 160,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  // usernameApp: {
  //   marginTop: 5,
  //   flexDirection: "row",
  // },

  // ===== Modal Login =====
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  mobileSidebar: {
    width: "75%",
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  webDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
    zIndex: 1000,
  },
  userInfoContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userEmailText: {
    fontSize: 12,
    color: "#6B7280",
  },
  // logoutButton: {
  //   padding: 12,
  //   alignItems: "center",
  // },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  webDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
    zIndex: 1000,
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  dividerText: {
    fontSize: 13,
    color: "#666",
    paddingHorizontal: 12,
    fontWeight: "500",
  },
});

// const handleCompleteProfile = async () => {
//   if (!firstName.trim()) {
//     setErrorMessage("Please enter your first name.");
//     return;
//   }

//   if (!hasValidPassword) {
//     setErrorMessage("Password must be at least 5 characters.");
//     return;
//   }

//   if (!verificationToken) {
//     setErrorMessage(
//       signupMethod === "email"
//         ? "Please verify your email first."
//         : "Please verify your phone number first."
//     );
//     return;
//   }

//   const fullName = `${firstName} ${lastName}`.trim();

//   setErrorMessage("");
//   setInfoMessage("");
//   setIsSigningUp(true);
//   setIsProcessing(true);

//   try {
//     // Call the signup API directly
//     await signupHandler({
//       username: fullName,
//       password,
//       verificationToken,
//       phoneNumber: signupMethod === "phone" ? buildPhoneNumber() : undefined,
//       email:
//         signupMethod === "email"
//           ? signupEmail.trim().toLowerCase()
//           : undefined,
//       location: "", // Optional - can be empty
//     });

//     // Clear cached verification token
//     try {
//       await AsyncStorage.removeItem("@signupVerification");
//     } catch (error) {
//       console.warn("Failed to clear cached verification token", error);
//     }

//     // Set role and navigate
//     setRole("patient");
//     await AsyncStorage.setItem("userRole", "patient");

//     setInfoMessage("Signup successful! Redirecting...");

//     setTimeout(() => {
//       closeModal();
//       navigation.navigate("DoctorPatientLandingPage");
//     }, 1500);
//   } catch (error) {
//     const message = getErrorMessage(error);
//     setErrorMessage(message);
//     setIsSigningUp(false);
//     setIsProcessing(false);
//   }
// };

// const handleLogout = async () => {
//   try {
//     await logoutHandler();
//     setDropdownVisible(false);
//   } catch (error) {
//     console.error("Logout failed:", error);
//   }
// };

// const handleLogout = async () => {
//   try {
//     await logoutHandler();

//     // ✅ Clear storage
//     await AsyncStorage.removeItem("userDetails");

//     // ✅ Clear state so header updates
//     setUser(null);

//     // Close dropdown
//     setDropdownVisible(false);
//   } catch (error) {
//     console.error("Logout failed:", error);
//   }
// };

// const handleLogin = async () => {
//   if (isProcessing) return;

//   const identifier = loginMethod === "email" ? email.trim() : mobile.trim();
//   if (!identifier) {
//     setErrorMessage(
//       loginMethod === "email"
//         ? "Please enter your email address."
//         : "Please enter your phone number."
//     );
//     return;
//   }

//   if (!password.trim()) {
//     setErrorMessage("Please enter your password.");
//     return;
//   }

//   setErrorMessage("");
//   setInfoMessage("");
//   setIsProcessing(true);

//   try {
//     const normalizedPhoneNumber =
//       loginMethod === "phone" ? buildPhoneNumber() : undefined;

//     const userData = await loginHandler(
//       {
//         email: loginMethod === "email" ? identifier : undefined,
//         phoneNumber: normalizedPhoneNumber,
//         password,
//       },
//       navigation
//     );

//     // ✅ store user in storage
//     if (userData) {
//       await AsyncStorage.setItem("userDetails", JSON.stringify(userData));

//       // ✅ Update global auth context
//       setUser(userData);
//     }

//     setInfoMessage("Login successful! Redirecting...");

//     setTimeout(() => {
//       closeModal();
//       navigation.navigate("DoctorPatientLandingPage");
//     }, 1000);
//   } catch (error) {
//     const message = getErrorMessage(error);
//     setErrorMessage(message);
//   } finally {
//     setIsProcessing(false);
//   }
// };
