// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createContext, useContext, useEffect, useState } from "react";
// import {
//   completeDoctorSignup,
//   handleGoogleLogin,
//   login,
//   logOut,
//   restoreUserState,
//   signInWithGoogleApp,
//   signup,
// } from "../utils/AuthService";
// import { resetChatCount } from "../utils/chatLimitManager";
// import { ensureError, getErrorMessage } from "../utils/errorUtils";
// import { clearSession } from "../utils/sessionManager";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // ===========================
//   // RESTORE USER & ROLE
//   // ===========================
//   // useEffect(() => {
//   //   const initializeUser = async () => {
//   //     try {
//   //       const storedState = await restoreUserState(); // restores user
//   //       const storedRole = await AsyncStorage.getItem("role");

//   //       if (storedState?.user) setUser(storedState.user);
//   //       if (storedRole) setRole(storedRole);
//   //     } catch (error) {
//   //       console.error("Failed to restore user state:", error);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };

//   //   initializeUser();
//   // }, []);

//   // useEffect(() => {
//   //   const loadUser = async () => {
//   //     try {
//   //       const savedUser = await AsyncStorage.getItem("userDetails");
//   //       const savedRole = await AsyncStorage.getItem("userRole");

//   //       if (savedUser) {
//   //         const parsedUser = JSON.parse(savedUser);
//   //         setUser(parsedUser);
//   //       }

//   //       if (savedRole) {
//   //         setRole(savedRole);
//   //       }
//   //     } catch (err) {
//   //       console.log("Error restoring user:", err);
//   //     }
//   //   };

//   //   loadUser();
//   // }, []);

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const savedUser = await AsyncStorage.getItem("userDetails");
//         const savedRole = await AsyncStorage.getItem("userRole");

//         if (savedUser) setUser(JSON.parse(savedUser));
//         if (savedRole) setRole(savedRole);
//       } catch (err) {
//         console.log("Error restoring user:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   // ===========================
//   // SIGNUP
//   // ===========================
//   const signupHandler = async (payload) => {
//     try {
//       return await signup(payload);
//     } catch (error) {
//       throw ensureError(error);
//     }
//   };

//   const doctorSignupHandler = async (payload) => {
//     try {
//       return await completeDoctorSignup(payload);
//     } catch (error) {
//       throw ensureError(error);
//     }
//   };

//   // ===========================
//   // LOGIN (EMAIL / PHONE)
//   // ===========================
//   // const loginHandler = async ({ email, phoneNumber, password }) => {
//   //   try {
//   //     const newUser = await login({ email, phoneNumber, password });

//   //     setUser(newUser?.user);

//   //     // clear local session
//   //     await clearSession();
//   //     await resetChatCount();

//   //     // save role
//   //     if (newUser?.role) {
//   //       setRole(newUser.role);
//   //       await AsyncStorage.setItem("role", newUser.role);
//   //     }

//   //     return newUser;
//   //   } catch (error) {
//   //     throw ensureError(error);
//   //   }
//   // };

//   const loginHandler = async ({ email, phoneNumber, password }) => {
//     try {
//       const newUser = await login({ email, phoneNumber, password });

//       // Save complete user
//       await AsyncStorage.setItem("userDetails", JSON.stringify(newUser?.user));
//       setUser(newUser?.user);

//       // clear local states
//       await clearSession();
//       await resetChatCount();

//       // APPLY ROLE RESTORE LOGIC
//       let savedRole = await AsyncStorage.getItem("userRole");

//       if (newUser?.role) {
//         savedRole = newUser.role; // backend role
//       }

//       // If still no role (this happens on your backend)
//       if (!savedRole) savedRole = "unknown";

//       // Save fixed role
//       await AsyncStorage.setItem("userRole", savedRole);
//       setRole(savedRole);

//       return newUser;
//     } catch (error) {
//       throw ensureError(error);
//     }
//   };

//   // ===========================
//   // GOOGLE LOGIN (WEB)
//   // ===========================
//   const googleLoginHandler = async (response) => {
//     try {
//       const googleUser = await handleGoogleLogin(response);

//       setUser(googleUser);

//       if (googleUser?.role) {
//         setRole(googleUser.role);
//         await AsyncStorage.setItem("role", googleUser.role);
//       }

//       await clearSession();
//       await resetChatCount();
//     } catch (error) {
//       console.error("Google Login Failed:", error);
//     }
//   };

//   // ===========================
//   // GOOGLE LOGIN (APP)
//   // ===========================
//   const loginWithGoogle = async () => {
//     try {
//       const loggedInUser = await signInWithGoogleApp();

//       setUser(loggedInUser);

//       if (loggedInUser?.role) {
//         setRole(loggedInUser.role);
//         await AsyncStorage.setItem("role", loggedInUser.role);
//       }

//       await clearSession();
//       await resetChatCount();
//     } catch (err) {
//       console.error("Login with Google failed:", err);
//     }
//   };

//   // ===========================
//   // LOGOUT
//   // ===========================
//   // const logoutHandler = async () => {
//   //   try {
//   //     await logOut();
//   //     await clearSession();
//   //     await resetChatCount();

//   //     setUser(null);
//   //     setRole(null);
//   //     await AsyncStorage.removeItem("role");
//   //   } catch (error) {
//   //     alert("Logout Failed!");
//   //   }
//   // };

//   const logoutHandler = async () => {
//     try {
//       await logOut();
//       await clearSession();
//       await resetChatCount();

//       setUser(null);
//       setRole(null);

//       await AsyncStorage.removeItem("userRole");
//       await AsyncStorage.removeItem("userDetails");
//       await AsyncStorage.removeItem("isFirstTimeUser");
//     } catch (error) {
//       alert("Logout Failed!");
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isLoading,
//         user,
//         setUser,
//         role,
//         setRole,
//         signup: signupHandler,
//         doctorsSignup: doctorSignupHandler,
//         login: loginHandler,
//         googleLogin: googleLoginHandler,
//         loginWithGoogle,
//         logout: logoutHandler,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);





// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { createContext, useContext, useEffect, useState } from "react";
// import {
//   completeDoctorSignup,
//   handleGoogleLogin,
//   login,
//   logOut,
//   restoreUserState,
//   signInWithGoogleApp,
//   signup,
// } from "../utils/AuthService";
// import { resetChatCount } from "../utils/chatLimitManager";
// import { ensureError, getErrorMessage } from "../utils/errorUtils";
// import { clearSession } from "../utils/sessionManager";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // ===========================
//   // RESTORE USER FROM STORAGE
//   // ===========================
//   useEffect(() => {
//     const loadUser = async () => {
//       console.log("🔄 Restoring user from AsyncStorage...");

//       try {
//         const savedUser = await AsyncStorage.getItem("userDetails");
//         const savedRole = await AsyncStorage.getItem("userRole");

//         console.log("📦 Saved User:", savedUser);
//         console.log("📦 Saved Role:", savedRole);

//         if (savedUser) {
//           const parsed = JSON.parse(savedUser);
//           setUser(parsed);
//           console.log("✅ User restored:", parsed);
//         } else {
//           console.log("⛔ No stored user found");
//         }

//         if (savedRole) {
//           setRole(savedRole);
//           console.log("✅ Role restored:", savedRole);
//         } else {
//           console.log("⛔ No stored role found");
//         }
//       } catch (err) {
//         console.log("❌ Error restoring user:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   // ===========================
//   // SIGNUP HANDLERS
//   // ===========================
//   const signupHandler = async (payload) => {
//     console.log("📝 Signing up user with payload:", payload);

//     try {
//       const res = await signup(payload);
//       console.log("✅ Signup successful:", res);
//       return res;
//     } catch (err) {
//       console.log("❌ Signup failed:", err);
//       throw ensureError(err);
//     }
//   };

//   const doctorSignupHandler = async (payload) => {
//     console.log("🩺 Completing Doctor Signup:", payload);

//     try {
//       const res = await completeDoctorSignup(payload);
//       console.log("✅ Doctor signup success:", res);
//       return res;
//     } catch (err) {
//       console.log("❌ Doctor signup failed:", err);
//       throw ensureError(err);
//     }
//   };

//   // ===========================
//   // LOGIN HANDLER
//   // ===========================
//   const loginHandler = async ({ email, phoneNumber, password }) => {
//     console.log("🔐 Login attempt:", { email, phoneNumber });

//     try {
//       const newUser = await login({ email, phoneNumber, password });

//       console.log("✅ Backend Login Success:", newUser);

//       // Save complete user
//       await AsyncStorage.setItem("userDetails", JSON.stringify(newUser?.user));
//       setUser(newUser?.user);

//       // clear session
//       await clearSession();
//       await resetChatCount();

//       // ===========================
//       // ROLE LOGIC
//       // ===========================
//       console.log("🔍 Checking for restored role...");

//       let savedRole = await AsyncStorage.getItem("userRole");
//       console.log("📦 Previously saved role:", savedRole);

//       if (newUser?.role) {
//         console.log("🟢 Backend returned role:", newUser.role);
//         savedRole = newUser.role;
//       }

//       if (!savedRole) {
//         console.log("⚠️ No role found → setting 'unknown'");
//         savedRole = "unknown";
//       }

//       // Save final role
//       await AsyncStorage.setItem("userRole", savedRole);
//       setRole(savedRole);

//       console.log("✅ Final applied role:", savedRole);

//       return newUser;
//     } catch (error) {
//       console.log("❌ Login failed:", error);
//       throw ensureError(error);
//     }
//   };

//   // ===========================
//   // GOOGLE LOGIN (WEB)
//   // ===========================
//   const googleLoginHandler = async (response) => {
//     console.log("🌐 Google Login Response:", response);

//     try {
//       const googleUser = await handleGoogleLogin(response);
//       console.log("✅ Google Login Success:", googleUser);

//       setUser(googleUser);

//       if (googleUser?.role) {
//         console.log("🟢 Google User Role:", googleUser.role);
//         setRole(googleUser.role);
//         await AsyncStorage.setItem("role", googleUser.role);
//       }

//       await clearSession();
//       await resetChatCount();
//     } catch (error) {
//       console.error("❌ Google Login Failed:", error);
//     }
//   };

//   // ===========================
//   // GOOGLE LOGIN (APP)
//   // ===========================
//   const loginWithGoogle = async () => {
//     console.log("📱 Google App Login...");

//     try {
//       const loggedInUser = await signInWithGoogleApp();
//       console.log("✅ Google App Login Success:", loggedInUser);

//       setUser(loggedInUser);

//       if (loggedInUser?.role) {
//         console.log("🟢 Google App Role:", loggedInUser.role);
//         setRole(loggedInUser.role);
//         await AsyncStorage.setItem("role", loggedInUser.role);
//       }

//       await clearSession();
//       await resetChatCount();
//     } catch (err) {
//       console.error("❌ Google App Login Failed:", err);
//     }
//   };

//   // ===========================
//   // LOGOUT
//   // ===========================
//   const logoutHandler = async () => {
//     console.log("🚪 Logging out user...");

//     try {
//       await logOut();
//       await clearSession();
//       await resetChatCount();

//       setUser(null);
//       setRole(null);

//       console.log("🗑 Clearing AsyncStorage keys...");
//       await AsyncStorage.removeItem("userRole");
//       await AsyncStorage.removeItem("userDetails");
//       await AsyncStorage.removeItem("isFirstTimeUser");

//       console.log("✅ Logout complete");
//     } catch (error) {
//       console.error("❌ Logout Failed:", error);
//       alert("Logout Failed!");
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isLoading,
//         user,
//         setUser,
//         role,
//         setRole,
//         signup: signupHandler,
//         doctorsSignup: doctorSignupHandler,
//         login: loginHandler,
//         googleLogin: googleLoginHandler,
//         loginWithGoogle,
//         logout: logoutHandler,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);




import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import {
  completeDoctorSignup,
  handleGoogleLogin,
  login,
  logOut,
  restoreUserState,
  signInWithGoogleApp,
  signup,
} from "../utils/AuthService";
import { resetChatCount } from "../utils/chatLimitManager";
import { ensureError } from "../utils/errorUtils";
import { clearSession } from "../utils/sessionManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===========================
  // RESTORE USER FROM STORAGE
  // ===========================
  useEffect(() => {
    const loadUser = async () => {
      console.log("🔄 Restoring user from AsyncStorage...");

      try {
        const savedUser = await AsyncStorage.getItem("userDetails");
        console.log("📦 Saved User:", savedUser);

        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          console.log("✅ User restored:", parsed);
        } else {
          console.log("⛔ No stored user found");
        }
      } catch (err) {
        console.log("❌ Error restoring user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // ===========================
  // SIGNUP HANDLER
  // ===========================
  const signupHandler = async (payload) => {
    console.log("📝 Signing up user with payload:", payload);

    try {
      const res = await signup(payload);
      console.log("✅ Signup successful:", res);
      return res;
    } catch (err) {
      console.log("❌ Signup failed:", err);
      throw ensureError(err);
    }
  };

  const doctorSignupHandler = async (payload) => {
    console.log("🩺 Completing Doctor Signup:", payload);

    try {
      const res = await completeDoctorSignup(payload);
      console.log("✅ Doctor signup success:", res);
      return res;
    } catch (err) {
      console.log("❌ Doctor signup failed:", err);
      throw ensureError(err);
    }
  };

  // ===========================
  // LOGIN HANDLER
  // ===========================
  const loginHandler = async ({ email, phoneNumber, password }) => {
    console.log("🔐 Login attempt:", { email, phoneNumber });

    try {
      const newUser = await login({ email, phoneNumber, password });

      console.log("✅ Backend Login Success:", newUser);

      // Save user details
      await AsyncStorage.setItem(
        "userDetails",
        JSON.stringify(newUser?.user)
      );
      setUser(newUser?.user);

      // Clear old session + chat
      await clearSession();
      await resetChatCount();

      return newUser;
    } catch (error) {
      console.log("❌ Login failed:", error);
      throw ensureError(error);
    }
  };

  // ===========================
  // GOOGLE LOGIN (WEB)
  // ===========================
  const googleLoginHandler = async (response) => {
    console.log("🌐 Google Login Response:", response);

    try {
      const googleUser = await handleGoogleLogin(response);
      console.log("✅ Google Login Success:", googleUser);

      setUser(googleUser);

      await clearSession();
      await resetChatCount();
    } catch (error) {
      console.error("❌ Google Login Failed:", error);
    }
  };

  // ===========================
  // GOOGLE LOGIN (APP)
  // ===========================
  const loginWithGoogle = async () => {
    console.log("📱 Google App Login...");

    try {
      const loggedInUser = await signInWithGoogleApp();
      console.log("✅ Google App Login Success:", loggedInUser);

      setUser(loggedInUser);

      await clearSession();
      await resetChatCount();
    } catch (err) {
      console.error("❌ Google App Login Failed:", err);
    }
  };

  // ===========================
  // LOGOUT
  // ===========================
  const logoutHandler = async () => {
    console.log("🚪 Logging out user...");

    try {
      await logOut();
      await clearSession();
      await resetChatCount();

      setUser(null);

      console.log("🗑 Clearing AsyncStorage keys...");
      await AsyncStorage.removeItem("userDetails");
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("isFirstTimeUser");

      console.log("✅ Logout complete");
    } catch (error) {
      console.error("❌ Logout Failed:", error);
      alert("Logout Failed!");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        setUser,
        signup: signupHandler,
        doctorsSignup: doctorSignupHandler,
        login: loginHandler,
        googleLogin: googleLoginHandler,
        loginWithGoogle,
        logout: logoutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
