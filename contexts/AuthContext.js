import { createContext, useContext, useEffect, useState } from "react";
import {
  handleGoogleLogin,
  login,
  logOut,
  restoreUserState,
  signInWithGoogleApp,
  signup,
} from "../utils/AuthService";
import { ensureError, getErrorMessage } from "../utils/errorUtils";
import { resetChatCount } from "../utils/chatLimitManager";
import { clearSession } from "../utils/sessionManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Restore user state on app start
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedState = await restoreUserState();
        if (storedState) {
          setUser(storedState.user);
          // Optionally verify token here if you want to ensure it's still valid
        }
      } catch (error) {
        console.error("Failed to restore user state:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeUser();
  }, []);

  const signupHandler = async (
    username,
    email,
    password,
    phoneNumber,
    location,
    navigation
  ) => {
    try {
      await signup(username, email, password, phoneNumber, location);
      alert("Signup successful! Please verify your email from your inbox before logging in.");
      navigation.navigate("Login");
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Signup error:", message, error);
      throw ensureError(error);
    }
  };

  const loginHandler = async (email, password, navigation) => {
    try {
      const newUser = await login(email, password);
      setUser(newUser?.user);
      // Clear session and chat counts when user signs in
      await clearSession();
      await resetChatCount();
      navigation.navigate("LandingPage");
    } catch (error) {
      const message = getErrorMessage(error);
      console.error("Login failed:", message, error);
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
        loginWithGoogle,
        signup: signupHandler,
        login: loginHandler,
        logout: logoutHandler,
        googleLogin: googleLoginHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
