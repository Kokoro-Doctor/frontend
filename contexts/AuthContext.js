// import { createContext, useContext, useEffect, useState } from "react";
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

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [isLoading, setIsLoading] = useState(true); // Track loading state

//   // Restore user state on app start
//   // useEffect(() => {
//   //   const initializeUser = async () => {
//   //     try {
//   //       const storedState = await restoreUserState();
//   //       if (storedState) {
//   //         setUser(storedState.user);
//   //         // Optionally verify token here if you want to ensure it's still valid
//   //       }
//   //     } catch (error) {
//   //       console.error("Failed to restore user state:", error);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };
//   //   initializeUser();
//   // }, []);

//   useEffect(() => {
//     const initializeUser = async () => {
//       try {
//         const storedState = await restoreUserState();

//         // Restore role first (critical for routing)
//         if (storedState?.role) {
//           setRole(storedState.role);
//           // Ensure role is synced to AsyncStorage for RoleContext consistency
//           await AsyncStorage.setItem("userRole", storedState.role);
//         }

//         // Restore user if available
//         if (storedState?.user) {
//           // Normalize doctor profile: ensure 'name' field exists from 'doctorname' if needed
//           const user = storedState.user;
//           if (storedState?.role === "doctor" && !user.name && user.doctorname) {
//             user.name = user.doctorname;
//           }
//           setUser(user);
//         }

//         // Log restoration for debugging (especially in production)
//         if (storedState) {
//           console.log("✅ Auth state restored:", {
//             hasUser: !!storedState.user,
//             hasToken: !!storedState.token,
//             role: storedState.role,
//           });
//         }
//       } catch (error) {
//         console.error("Failed to restore user state:", error);
//         // Try to restore role even if user restore fails
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
//     // Ensure auth state is set if we have access_token and user_id/doctor_id
//     // This makes auth state identifier-agnostic (works for email or phone login)
//     if (result?.access_token && (result?.user_id || result?.doctor_id || result?.profile)) {
//       const userRole = result.role ?? fallbackRole ?? "user";

//       // Use profile if available, otherwise create minimal user object
//       const userProfile = result.profile || {
//         user_id: result.user_id,
//         doctor_id: result.doctor_id,
//         role: userRole,
//       };

//       setUser(userProfile);
//       setRole(userRole);
//       // Sync role with AsyncStorage for RoleContext
//       await AsyncStorage.setItem("userRole", userRole);
//       await clearSession();
//       await resetChatCount();
//     }
//     return result;
//   };

//   const requestSignupOtpHandler = async (payload) => {
//     try {
//       return await requestSignupOtpApi(payload);
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Signup OTP request failed:", message, error);
//       throw ensureError(error);
//     }
//   };

//   const requestLoginOtpHandler = async (payload) => {
//     try {
//       return await requestLoginOtpApi(payload);
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Login OTP request failed:", message, error);
//       throw ensureError(error);
//     }
//   };

//   const initiateLoginHandler = async (payload) => {
//     try {
//       return await initiateLoginApi(payload);
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
//       throw ensureError(error);
//     }
//   };

//   const completePatientSignup = async (payload) => {
//     try {
//       const result = await completeUserSignup(payload);
//       await syncSession(result, "user");
//       return result;
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Patient signup error:", message, error);
//       throw ensureError(error);
//     }
//   };

//   const doctorSignupHandler = async (payload) => {
//     try {
//       const result = await completeDoctorSignup(payload);
//       await syncSession(result, "doctor");
//       return result;
//     } catch (error) {
//       const message = getErrorMessage(error);
//       console.error("Doctor signup error:", message, error);
//       throw ensureError(error);
//     }
//   };

//   const logoutHandler = async () => {
//     try {
//       await logOut();
//       // Clear session and chat counts when user logs out
//       await clearSession();
//       await resetChatCount();
//       setUser(null);
//       setRole(null);
//       // Clear role from AsyncStorage
//       await AsyncStorage.removeItem("userRole");
//     } catch (error) {
//       alert("Logout Failed: Something went wrong!");
//     }
//   };

//   // ================= Google Login Handler for web =================
//   const googleLoginHandler = async (response) => {
//     try {
//       const googleUser = await handleGoogleLogin(response);
//       setUser(googleUser);
//       // Clear session and chat counts when user signs in
//       await clearSession();
//       await resetChatCount();
//       navigation.navigate("LandingPage");
//     } catch (error) {
//       console.error(`Google Login Failed: ${error.message}`);
//     }
//   };

//   // ================= Google Login Handler for app =================
//   const loginWithGoogle = async () => {
//     try {
//       const loggedInUser = await signInWithGoogleApp();
//       setUser(loggedInUser);
//       // Clear session and chat counts when user signs in
//       await clearSession();
//       await resetChatCount();
//     } catch (err) {
//       console.error("Login with Google failed:", err);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         role,
//         isLoading,
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
import { resetChatCount } from "../utils/chatLimitManager";
import { ensureError, getErrorMessage } from "../utils/errorUtils";
import { clearSession } from "../utils/sessionManager";
import mixpanel from "../utils/Mixpanel"; // 🔥 Import Mixpanel

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const initializeUser = async () => {
  //     try {
  //       const storedState = await restoreUserState();

  //       // Restore role first (critical for routing)
  //       if (storedState?.role) {
  //         setRole(storedState.role);
  //         await AsyncStorage.setItem("userRole", storedState.role);
  //       }

  //       // Restore user if available
  //       if (storedState?.user) {
  //         const user = storedState.user;
  //         if (storedState?.role === "doctor" && !user.name && user.doctorname) {
  //           user.name = user.doctorname;
  //         }
  //         setUser(user);

  //         // 🔥 Re-identify user in Mixpanel on app restart
  //         const userId = user.user_id || user.doctor_id;
  //         if (userId) {
  //           mixpanel.identify(userId, {
  //             name: user.name,
  //             email: user.email,
  //             phone: user.phone,
  //             role: storedState.role,
  //           });
  //           console.log("🔥 Mixpanel re-identified user on restore:", userId);
  //         }
  //       }

  //       if (storedState) {
  //         console.log("✅ Auth state restored:", {
  //           hasUser: !!storedState.user,
  //           hasToken: !!storedState.token,
  //           role: storedState.role,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Failed to restore user state:", error);
  //       try {
  //         const role = await AsyncStorage.getItem("userRole");
  //         if (role) {
  //           setRole(role);
  //           console.log("✅ Role restored from fallback:", role);
  //         }
  //       } catch (roleError) {
  //         console.error("Failed to restore role:", roleError);
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   initializeUser();
  // }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
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
              console.error(
                "Failed to identify user in Mixpanel:",
                mixpanelError
              );
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
      return await initiateLoginApi(payload);
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
      mixpanel.track("User Signed Up", {
        role: "user",
        signup_method: payload.signup_method || "otp",
      });

      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Patient signup error:", message, error);
      // 🔥 Track failed signup
      mixpanel.track("Signup Failed", {
        error_message: message,
        role: "user",
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
      const userId = user?.user_id || user?.doctor_id;
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
      await AsyncStorage.removeItem("userRole");

      // 🔥 Reset Mixpanel (generates new anonymous ID)
      mixpanel.reset();

      console.log("✅ Logout complete, Mixpanel reset");
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

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        loginWithGoogle,
        doctorsSignup: doctorSignupHandler,
        signup: completePatientSignup,
        requestSignupOtp: requestSignupOtpHandler,
        requestLoginOtp: requestLoginOtpHandler,
        initiateLogin: initiateLoginHandler,
        loginWithOtp: loginWithOtpHandler,
        logout: logoutHandler,
        googleLogin: googleLoginHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
