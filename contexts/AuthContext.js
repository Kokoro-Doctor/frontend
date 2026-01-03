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

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Restore user state on app start
  // useEffect(() => {
  //   const initializeUser = async () => {
  //     try {
  //       const storedState = await restoreUserState();
  //       if (storedState) {
  //         setUser(storedState.user);
  //         // Optionally verify token here if you want to ensure it's still valid
  //       }
  //     } catch (error) {
  //       console.error("Failed to restore user state:", error);
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
          // Ensure role is synced to AsyncStorage for RoleContext consistency
          await AsyncStorage.setItem("userRole", storedState.role);
        }
        
        // Restore user if available
        if (storedState?.user) {
          // Normalize doctor profile: ensure 'name' field exists from 'doctorname' if needed
          const user = storedState.user;
          if (storedState?.role === "doctor" && !user.name && user.doctorname) {
            user.name = user.doctorname;
          }
          setUser(user);
        }
        
        // Log restoration for debugging (especially in production)
        if (storedState) {
          console.log("✅ Auth state restored:", {
            hasUser: !!storedState.user,
            hasToken: !!storedState.token,
            role: storedState.role,
          });
        }
      } catch (error) {
        console.error("Failed to restore user state:", error);
        // Try to restore role even if user restore fails
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
    // Ensure auth state is set if we have access_token and user_id/doctor_id
    // This makes auth state identifier-agnostic (works for email or phone login)
    if (result?.access_token && (result?.user_id || result?.doctor_id || result?.profile)) {
      const userRole = result.role ?? fallbackRole ?? "user";
      
      // Use profile if available, otherwise create minimal user object
      const userProfile = result.profile || {
        user_id: result.user_id,
        doctor_id: result.doctor_id,
        role: userRole,
      };
      
      setUser(userProfile);
      setRole(userRole);
      // Sync role with AsyncStorage for RoleContext
      await AsyncStorage.setItem("userRole", userRole);
      await clearSession();
      await resetChatCount();
    }
    return result;
  };

  const requestSignupOtpHandler = async (payload) => {
    try {
      return await requestSignupOtpApi(payload);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Signup OTP request failed:", message, error);
      throw ensureError(error);
    }
  };

  const requestLoginOtpHandler = async (payload) => {
    try {
      return await requestLoginOtpApi(payload);
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Login OTP request failed:", message, error);
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
      throw ensureError(error);
    }
  };

  const completePatientSignup = async (payload) => {
    try {
      const result = await completeUserSignup(payload);
      await syncSession(result, "user");
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Patient signup error:", message, error);
      throw ensureError(error);
    }
  };

  const doctorSignupHandler = async (payload) => {
    try {
      const result = await completeDoctorSignup(payload);
      await syncSession(result, "doctor");
      return result;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Doctor signup error:", message, error);
      throw ensureError(error);
    }
  };

  const logoutHandler = async () => {
    try {
      await logOut();
      // Clear session and chat counts when user logs out
      await clearSession();
      await resetChatCount();
      setUser(null);
      setRole(null);
      // Clear role from AsyncStorage
      await AsyncStorage.removeItem("userRole");
    } catch (error) {
      alert("Logout Failed: Something went wrong!");
    }
  };

  // ================= Google Login Handler for web =================
  const googleLoginHandler = async (response) => {
    try {
      const googleUser = await handleGoogleLogin(response);
      setUser(googleUser);
      // Clear session and chat counts when user signs in
      await clearSession();
      await resetChatCount();
      navigation.navigate("LandingPage");
    } catch (error) {
      console.error(`Google Login Failed: ${error.message}`);
    }
  };

  // ================= Google Login Handler for app =================
  const loginWithGoogle = async () => {
    try {
      const loggedInUser = await signInWithGoogleApp();
      setUser(loggedInUser);
      // Clear session and chat counts when user signs in
      await clearSession();
      await resetChatCount();
    } catch (err) {
      console.error("Login with Google failed:", err);
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