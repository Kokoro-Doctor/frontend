// import { createContext, useContext, useEffect, useState } from "react";
// import { Platform } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   completeDoctorSignup,
//   completeUserSignup,
//   handleGoogleLogin,
//   initiateLogin as initiateLoginApi,
//   loginWithOtp as loginWithOtpApi,
//   logOut,
//   requestLoginOtp as requestLoginOtpApi,
//   requestSignupOtp as requestSignupOtpApi,
//   restoreUserState,
//   signInWithGoogleApp,
// } from "../utils/AuthService";
// import { resetChatCount } from "../utils/chatLimitManager";
// import { ensureError, getErrorMessage } from "../utils/errorUtils";
// import { clearSession } from "../utils/sessionManager";
// import mixpanel from "../utils/Mixpanel"; 

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const initializeUser = async () => {
//       try {
//         // ── Hospital session restore (web) ──
//         if (Platform.OS === "web") {
//           const token = localStorage.getItem("token");
//           const hospitalId = localStorage.getItem("hospital_id");
//           const userRole = localStorage.getItem("user_role");
//           const hospitalName = localStorage.getItem("hospital_name");

//           if (token && hospitalId && userRole === "hospital") {
//             setUser({ name: hospitalName, hospitalId });
//             setRole("hospital");
//             setIsLoading(false);
//             return; // skip restoreUserState for hospital users
//           }
//         } else {
//           // ── Hospital session restore (mobile) ──
//           const sessionRaw = await AsyncStorage.getItem("hospital_session");
//           const savedRole = await AsyncStorage.getItem("userRole");
//           if (sessionRaw && savedRole === "hospital") {
//             const session = JSON.parse(sessionRaw);
//             setUser({ name: session.name, hospitalId: session.hospital_id });
//             setRole("hospital");
//             setIsLoading(false);
//             return;
//           }
//         }

//         const storedState = await restoreUserState();

//         // Restore role first (critical for routing)
//         if (storedState?.role) {
//           setRole(storedState.role);
//           await AsyncStorage.setItem("userRole", storedState.role);
//         }

//         // Restore user if available
//         if (storedState?.user) {
//           const user = storedState.user;
//           if (storedState?.role === "doctor" && !user.name && user.doctorname) {
//             user.name = user.doctorname;
//           }
//           setUser(user);

//           // 🔥 Re-identify user in Mixpanel on app restart
//           const userId = user.user_id || user.doctor_id;
//           if (userId) {
//             try {
//               mixpanel.identify(userId, {
//                 name: user.name,
//                 email: user.email,
//                 phone: user.phone,
//                 role: storedState.role,
//               });
//               console.log("🔥 Mixpanel re-identified user on restore:", userId);
//             } catch (mixpanelError) {
//               console.error(
//                 "Failed to identify user in Mixpanel:",
//                 mixpanelError,
//               );
//             }
//           }
//         }

//         if (storedState) {
//           console.log("✅ Auth state restored:", {
//             hasUser: !!storedState.user,
//             hasToken: !!storedState.token,
//             role: storedState.role,
//           });
//         }
//       } catch (error) {
//         console.error("Failed to restore user state:", error);
//         try {
//           const role = await AsyncStorage.getItem("userRole");
//           if (role) {
//             setRole(role);
//             console.log("✅ Role restored from fallback:", role);
//           }
//         } catch (roleError) {
//           console.error("Failed to restore role:", roleError);
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     initializeUser();
//   }, []);

//   const syncSession = async (result, fallbackRole = null) => {
//     if (
//       result?.access_token &&
//       (result?.user_id || result?.doctor_id || result?.profile)
//     ) {
//       const userRole = result.role ?? fallbackRole ?? "user";

//       const userProfile = result.profile || {
//         user_id: result.user_id,
//         doctor_id: result.doctor_id,
//         role: userRole,
//       };

//       setUser(userProfile);
//       setRole(userRole);
//       await AsyncStorage.setItem("userRole", userRole);
//       await clearSession();
//       await resetChatCount();

//       // 🔥 Identify user in Mixpanel with their actual user_id
//       const userId = result.user_id || result.doctor_id;
//       if (userId) {
//         mixpanel.identify(userId, {
//           name: userProfile.name || userProfile.doctorname,
//           email: userProfile.email,
//           phone: userProfile.phone,
//           role: userRole,
//           signup_date: userProfile.created_at || new Date().toISOString(),
//         });

//         // Track successful login
//         mixpanel.track("User Logged In", {
//           user_id: userId,
//           role: userRole,
//           login_method: result.login_method || "otp",
//         });

//         console.log("🔥 Mixpanel identified user:", userId);
//       }
//     }
//     return result;
//   };

//   const requestSignupOtpHandler = async (payload) => {
//     try {
//       // 🔥 Track OTP request
//       mixpanel.track("Signup OTP Requested", {
//         identifier: payload.email || payload.phone,
//         identifier_type: payload.email ? "email" : "phone",
//       });
//       return await requestSignupOtpApi(payload);
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Signup OTP request failed:", message, error);
//       // 🔥 Track error
//       mixpanel.track("Signup OTP Request Failed", {
//         error_message: message,
//       });
//       throw ensureError(error);
//     }
//   };

//   const requestLoginOtpHandler = async (payload) => {
//     try {
//       // 🔥 Track OTP request
//       mixpanel.track("Login OTP Requested", {
//         identifier: payload.email || payload.phone,
//         identifier_type: payload.email ? "email" : "phone",
//       });
//       return await requestLoginOtpApi(payload);
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Login OTP request failed:", message, error);
//       // 🔥 Track error
//       mixpanel.track("Login OTP Request Failed", {
//         error_message: message,
//       });
//       throw ensureError(error);
//     }
//   };

//   const initiateLoginHandler = async (payload) => {
//     try {
//       const result = await initiateLoginApi(payload);
//       // If result has access_token, this is a direct login (experimental flow)
//       // Sync session same as loginWithOtp
//       if (result?.access_token) {
//         return await syncSession(result);
//       }
//       // Otherwise, return discovery response (normal flow - OTP required)
//       return result;
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Login initiation failed:", message, error);
//       throw ensureError(error);
//     }
//   };

//   const loginWithOtpHandler = async (payload) => {
//     try {
//       const result = await loginWithOtpApi(payload);
//       return await syncSession(result);
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("OTP login failed:", message, error);
//       // 🔥 Track failed login
//       mixpanel.track("Login Failed", {
//         error_message: message,
//         login_method: "otp",
//       });
//       throw ensureError(error);
//     }
//   };

//   const completePatientSignup = async (payload) => {
//     try {
//       const result = await completeUserSignup(payload);
//       await syncSession(result, "user");

//       // 🔥 Track successful signup
//       // Detect experimental flow: mobile-only (no email, otp, name)
//       const isExperimentalFlow =
//         !payload.email && !payload.otp && !payload.name;
//       mixpanel.track("User Signed Up", {
//         role: "user",
//         signup_method: isExperimentalFlow
//           ? "mobile_only"
//           : payload.signup_method || "otp",
//         is_experimental: isExperimentalFlow,
//       });

//       return result;
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Patient signup error:", message, error);
//       // 🔥 Track failed signup
//       const isExperimentalFlow =
//         !payload.email && !payload.otp && !payload.name;
//       mixpanel.track("Signup Failed", {
//         error_message: message,
//         role: "user",
//         is_experimental: isExperimentalFlow,
//       });
//       throw ensureError(error);
//     }
//   };

//   const doctorSignupHandler = async (payload) => {
//     try {
//       const result = await completeDoctorSignup(payload);
//       await syncSession(result, "doctor");

//       // 🔥 Track successful doctor signup
//       mixpanel.track("Doctor Signed Up", {
//         role: "doctor",
//         signup_method: payload.signup_method || "otp",
//       });

//       return result;
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Doctor signup error:", message, error);
//       // 🔥 Track failed signup
//       mixpanel.track("Signup Failed", {
//         error_message: message,
//         role: "doctor",
//       });
//       throw ensureError(error);
//     }
//   };

//   const logoutHandler = async () => {
//     try {
//       // 🔥 Track logout BEFORE clearing user data
//       const userId = user?.user_id || user?.doctor_id;
//       if (userId) {
//         mixpanel.track("User Logging Out", {
//           user_id: userId,
//           role: role,
//         });
//       }

//       await logOut();
//       await clearSession();
//       await resetChatCount();
//       setUser(null);
//       setRole(null);
//       await AsyncStorage.removeItem("userRole");
//       await AsyncStorage.removeItem("hospital_session"); // ← ADD

//       // Clear web localStorage for hospital
//       if (Platform.OS === "web") {
//         localStorage.removeItem("token");
//         localStorage.removeItem("hospital_id");
//         localStorage.removeItem("hospital_name");
//         localStorage.removeItem("user_role");
//       }

//       mixpanel.reset();
//     } catch (error) {
//       alert("Logout Failed: Something went wrong!");
//       console.error("Logout error:", error);
//     }
//   };

//   const googleLoginHandler = async (response) => {
//     try {
//       const googleUser = await handleGoogleLogin(response);
//       setUser(googleUser);
//       await clearSession();
//       await resetChatCount();

//       // 🔥 Identify user in Mixpanel
//       const userId = googleUser.user_id || googleUser.doctor_id;
//       if (userId) {
//         mixpanel.identify(userId, {
//           name: googleUser.name,
//           email: googleUser.email,
//           login_method: "google",
//         });

//         mixpanel.track("User Logged In", {
//           user_id: userId,
//           login_method: "google",
//         });
//       }

//       navigation.navigate("LandingPage");
//     } catch (error) {
//       console.error(`Google Login Failed: ${error.message}`);
//       // 🔥 Track error
//       mixpanel.track("Google Login Failed", {
//         error_message: error.message,
//       });
//     }
//   };

//   const loginWithGoogle = async () => {
//     try {
//       const loggedInUser = await signInWithGoogleApp();
//       setUser(loggedInUser);
//       await clearSession();
//       await resetChatCount();

//       // 🔥 Identify user in Mixpanel
//       const userId = loggedInUser.user_id || loggedInUser.doctor_id;
//       if (userId) {
//         mixpanel.identify(userId, {
//           name: loggedInUser.name,
//           email: loggedInUser.email,
//           login_method: "google",
//         });

//         mixpanel.track("User Logged In", {
//           user_id: userId,
//           login_method: "google",
//         });
//       }
//     } catch (err) {
//       console.error("Login with Google failed:", err);
//       // 🔥 Track error
//       mixpanel.track("Google Login Failed", {
//         error_message: err.message,
//       });
//     }
//   };

//   const loginHandler = (userData, userRole) => {
//     setUser(userData);
//     setRole(userRole);
//     AsyncStorage.setItem("userRole", userRole);
//     // Persist hospital session for web refresh survival
//     if (Platform.OS === "web" && userRole === "hospital") {
//       localStorage.setItem("user_role", "hospital");
//       localStorage.setItem("hospital_name", userData.name || "");
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         role,
//         isLoading,
//         login: loginHandler,
//         loginWithGoogle,
//         doctorsSignup: doctorSignupHandler,
//         signup: completePatientSignup,
//         requestSignupOtp: requestSignupOtpHandler,
//         requestLoginOtp: requestLoginOtpHandler,
//         initiateLogin: initiateLoginHandler,
//         loginWithOtp: loginWithOtpHandler,
//         logout: logoutHandler,
//         googleLogin: googleLoginHandler,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);



import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  completeDoctorSignup,
  completeUserSignup,
  handleGoogleLogin,
  initiateLogin as initiateLoginApi,
  loginWithOtp as loginWithOtpApi,
  logOut,
  requestLoginOtp as requestLoginOtpApi,
  requestSignupOtp as requestSignupOtpApi,
  restoreUserState,
  signInWithGoogleApp,
} from "../utils/AuthService";
import { hospitalLogin, hospitalSignup } from "../utils/HospitalAuthService"; // ← ADD
import { resetChatCount } from "../utils/chatLimitManager";
import { ensureError, getErrorMessage } from "../utils/errorUtils";
import { clearSession } from "../utils/sessionManager";
import mixpanel from "../utils/Mixpanel";

export const AuthContext = createContext();

// ─── JWT helpers (client-side; no signature verification needed) ──────────────

const isHospitalTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

const clearHospitalSessionStorage = async () => {
  await AsyncStorage.multiRemove(['hospital_session', 'hospital_token', 'userRole']);
  if (Platform.OS === 'web') {
    ['token', 'hospital_id', 'hospital_name', 'user_role'].forEach((k) =>
      localStorage.removeItem(k)
    );
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // ── Hospital session restore (web) ──
        if (Platform.OS === "web") {
          const token = localStorage.getItem("token");
          const hospitalId = localStorage.getItem("hospital_id");
          const userRole = localStorage.getItem("user_role");
          const hospitalName = localStorage.getItem("hospital_name");

          if (token && hospitalId && userRole === "hospital") {
            if (!isHospitalTokenValid(token)) {
              console.log("[AuthContext] Hospital JWT expired — clearing session");
              await clearHospitalSessionStorage();
              // fall through to regular user restore
            } else {
              setUser({ name: hospitalName, hospitalId });
              setRole("hospital");
              setIsLoading(false);
              return;
            }
          }
        } else {
          // ── Hospital session restore (mobile) ──
          const sessionRaw = await AsyncStorage.getItem("hospital_session");
          const savedRole = await AsyncStorage.getItem("userRole");
          const token = await AsyncStorage.getItem("hospital_token");

          if (sessionRaw && savedRole === "hospital") {
            if (!token || !isHospitalTokenValid(token)) {
              console.log("[AuthContext] Hospital JWT expired or missing — clearing session");
              await clearHospitalSessionStorage();
              // fall through to regular user restore
            } else {
              const session = JSON.parse(sessionRaw);
              setUser({ name: session.name, hospitalId: session.hospital_id });
              setRole("hospital");
              setIsLoading(false);
              return;
            }
          }
        }

        const storedState = await restoreUserState();

        // Restore role first (critical for routing)
        if (storedState?.role) {
          setRole(storedState.role);
          await AsyncStorage.setItem("userRole", storedState.role);
        }

        // Restore user if available
        if (storedState?.user) {
          const user = storedState.user;
          if (storedState?.role === "doctor" && !user.name && user.doctorname) {
            user.name = user.doctorname;
          }
          setUser(user);

          // 🔥 Re-identify user in Mixpanel on app restart
          const userId = user.user_id || user.doctor_id;
          if (userId) {
            try {
              mixpanel.identify(userId, {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: storedState.role,
              });
              console.log("🔥 Mixpanel re-identified user on restore:", userId);
            } catch (mixpanelError) {
              console.error("Failed to identify user in Mixpanel:", mixpanelError);
            }
          }
        }

        if (storedState) {
          console.log("✅ Auth state restored:", {
            hasUser: !!storedState.user,
            hasToken: !!storedState.token,
            role: storedState.role,
          });
        }
      } catch (error) {
        console.error("Failed to restore user state:", error);
        try {
          const role = await AsyncStorage.getItem("userRole");
          if (role) {
            setRole(role);
            console.log("✅ Role restored from fallback:", role);
          }
        } catch (roleError) {
          console.error("Failed to restore role:", roleError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    initializeUser();
  }, []);

  // ─── Shared: persist hospital session after login OR signup ──────────────────
  // Expects data shape: { token, hospital: { hospital_id, name, ... } }
  const syncHospitalSession = async (data) => {
    const { hospital, token } = data;

    const session = {
      hospital_id: hospital.hospital_id,
      name: hospital.name,
    };

    await AsyncStorage.setItem("hospital_session", JSON.stringify(session));
    await AsyncStorage.setItem("userRole", "hospital");

    // Persist token for mobile authenticated requests
    if (token) await AsyncStorage.setItem("hospital_token", token);

    if (Platform.OS === "web") {
      if (token) localStorage.setItem("token", token);
      localStorage.setItem("hospital_id", hospital.hospital_id);
      localStorage.setItem("hospital_name", hospital.name || "");
      localStorage.setItem("user_role", "hospital");
    }

    setUser({ name: hospital.name, hospitalId: hospital.hospital_id });
    setRole("hospital");

    return session;
  };

  // ─── Hospital Login ───────────────────────────────────────────────────────────
  const hospitalLoginHandler = async (identifier, password) => {
    try {
      const data = await hospitalLogin(identifier, password);
      const session = await syncHospitalSession(data);

      mixpanel.track("Hospital Logged In", {
        hospital_id: data.hospital.hospital_id,
      });

      return session;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Hospital login failed:", message, error);
      mixpanel.track("Hospital Login Failed", { error_message: message });
      throw ensureError(error);
    }
  };

  // ─── Hospital Signup ──────────────────────────────────────────────────────────
  const hospitalSignupHandler = async (payload) => {
    // payload: { name, password, email?, contact_number?, address?, city?, state? }
    try {
      const data = await hospitalSignup(payload);
      const session = await syncHospitalSession(data);

      // 🔥 Track successful hospital signup
      mixpanel.track("Hospital Signed Up", {
        hospital_id: data.hospital.hospital_id,
        name: data.hospital.name,
      });

      return session;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Hospital signup failed:", message, error);
      // 🔥 Track failed hospital signup
      mixpanel.track("Hospital Signup Failed", { error_message: message });
      throw ensureError(error);
    }
  };

  const syncSession = async (result, fallbackRole = null) => {
    if (
      result?.access_token &&
      (result?.user_id || result?.doctor_id || result?.profile)
    ) {
      const userRole = result.role ?? fallbackRole ?? "user";

      const userProfile = result.profile || {
        user_id: result.user_id,
        doctor_id: result.doctor_id,
        role: userRole,
      };

      setUser(userProfile);
      setRole(userRole);
      await AsyncStorage.setItem("userRole", userRole);
      await clearSession();
      await resetChatCount();

      // 🔥 Identify user in Mixpanel with their actual user_id
      const userId = result.user_id || result.doctor_id;
      if (userId) {
        mixpanel.identify(userId, {
          name: userProfile.name || userProfile.doctorname,
          email: userProfile.email,
          phone: userProfile.phone,
          role: userRole,
          signup_date: userProfile.created_at || new Date().toISOString(),
        });

        // Track successful login
        mixpanel.track("User Logged In", {
          user_id: userId,
          role: userRole,
          login_method: result.login_method || "otp",
        });

        console.log("🔥 Mixpanel identified user:", userId);
      }
    }
    return result;
  };

  const requestSignupOtpHandler = async (payload) => {
    try {
      // 🔥 Track OTP request
      mixpanel.track("Signup OTP Requested", {
        identifier: payload.email || payload.phone,
        identifier_type: payload.email ? "email" : "phone",
      });
      return await requestSignupOtpApi(payload);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Signup OTP request failed:", message, error);
      // 🔥 Track error
      mixpanel.track("Signup OTP Request Failed", {
        error_message: message,
      });
      throw ensureError(error);
    }
  };

  const requestLoginOtpHandler = async (payload) => {
    try {
      // 🔥 Track OTP request
      mixpanel.track("Login OTP Requested", {
        identifier: payload.email || payload.phone,
        identifier_type: payload.email ? "email" : "phone",
      });
      return await requestLoginOtpApi(payload);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Login OTP request failed:", message, error);
      // 🔥 Track error
      mixpanel.track("Login OTP Request Failed", {
        error_message: message,
      });
      throw ensureError(error);
    }
  };

  const initiateLoginHandler = async (payload) => {
    try {
      const result = await initiateLoginApi(payload);
      // If result has access_token, this is a direct login (experimental flow)
      // Sync session same as loginWithOtp
      if (result?.access_token) {
        return await syncSession(result);
      }
      // Otherwise, return discovery response (normal flow - OTP required)
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Login initiation failed:", message, error);
      throw ensureError(error);
    }
  };

  const loginWithOtpHandler = async (payload) => {
    try {
      const result = await loginWithOtpApi(payload);
      return await syncSession(result);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("OTP login failed:", message, error);
      // 🔥 Track failed login
      mixpanel.track("Login Failed", {
        error_message: message,
        login_method: "otp",
      });
      throw ensureError(error);
    }
  };

  const completePatientSignup = async (payload) => {
    try {
      const result = await completeUserSignup(payload);
      await syncSession(result, "user");

      // 🔥 Track successful signup
      // Detect experimental flow: mobile-only (no email, otp, name)
      const isExperimentalFlow =
        !payload.email && !payload.otp && !payload.name;
      mixpanel.track("User Signed Up", {
        role: "user",
        signup_method: isExperimentalFlow
          ? "mobile_only"
          : payload.signup_method || "otp",
        is_experimental: isExperimentalFlow,
      });

      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Patient signup error:", message, error);
      // 🔥 Track failed signup
      const isExperimentalFlow =
        !payload.email && !payload.otp && !payload.name;
      mixpanel.track("Signup Failed", {
        error_message: message,
        role: "user",
        is_experimental: isExperimentalFlow,
      });
      throw ensureError(error);
    }
  };

  const doctorSignupHandler = async (payload) => {
    try {
      const result = await completeDoctorSignup(payload);
      await syncSession(result, "doctor");

      // 🔥 Track successful doctor signup
      mixpanel.track("Doctor Signed Up", {
        role: "doctor",
        signup_method: payload.signup_method || "otp",
      });

      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Doctor signup error:", message, error);
      // 🔥 Track failed signup
      mixpanel.track("Signup Failed", {
        error_message: message,
        role: "doctor",
      });
      throw ensureError(error);
    }
  };

  const logoutHandler = async () => {
    try {
      // 🔥 Track logout BEFORE clearing user data
      const userId = user?.user_id || user?.doctor_id || user?.hospitalId;
      if (userId) {
        mixpanel.track("User Logging Out", {
          user_id: userId,
          role: role,
        });
      }

      await logOut();
      await clearSession();
      await resetChatCount();
      setUser(null);
      setRole(null);
      await clearHospitalSessionStorage();

      mixpanel.reset();
    } catch (error) {
      alert("Logout Failed: Something went wrong!");
      console.error("Logout error:", error);
    }
  };

  const googleLoginHandler = async (response) => {
    try {
      const googleUser = await handleGoogleLogin(response);
      setUser(googleUser);
      await clearSession();
      await resetChatCount();

      // 🔥 Identify user in Mixpanel
      const userId = googleUser.user_id || googleUser.doctor_id;
      if (userId) {
        mixpanel.identify(userId, {
          name: googleUser.name,
          email: googleUser.email,
          login_method: "google",
        });

        mixpanel.track("User Logged In", {
          user_id: userId,
          login_method: "google",
        });
      }

      navigation.navigate("LandingPage");
    } catch (error) {
      console.error(`Google Login Failed: ${error.message}`);
      // 🔥 Track error
      mixpanel.track("Google Login Failed", {
        error_message: error.message,
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const loggedInUser = await signInWithGoogleApp();
      setUser(loggedInUser);
      await clearSession();
      await resetChatCount();

      // 🔥 Identify user in Mixpanel
      const userId = loggedInUser.user_id || loggedInUser.doctor_id;
      if (userId) {
        mixpanel.identify(userId, {
          name: loggedInUser.name,
          email: loggedInUser.email,
          login_method: "google",
        });

        mixpanel.track("User Logged In", {
          user_id: userId,
          login_method: "google",
        });
      }
    } catch (err) {
      console.error("Login with Google failed:", err);
      // 🔥 Track error
      mixpanel.track("Google Login Failed", {
        error_message: err.message,
      });
    }
  };

  const loginHandler = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    AsyncStorage.setItem("userRole", userRole);
    // Persist hospital session for web refresh survival
    if (Platform.OS === "web" && userRole === "hospital") {
      localStorage.setItem("user_role", "hospital");
      localStorage.setItem("hospital_name", userData.name || "");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login: loginHandler,
        loginWithGoogle,
        doctorsSignup: doctorSignupHandler,
        signup: completePatientSignup,
        requestSignupOtp: requestSignupOtpHandler,
        requestLoginOtp: requestLoginOtpHandler,
        initiateLogin: initiateLoginHandler,
        loginWithOtp: loginWithOtpHandler,
        logout: logoutHandler,
        googleLogin: googleLoginHandler,
        // ── Hospital ──
        hospitalLogin: hospitalLoginHandler,
        hospitalSignup: hospitalSignupHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
