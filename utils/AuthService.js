// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { makeRedirectUri } from "expo-auth-session";
// import * as Google from "expo-auth-session/providers/google";
// import * as WebBrowser from "expo-web-browser";
// import { Platform } from "react-native";

// import {
//   API_URL,
//   webClientId
// } from "../env-vars";

// let GoogleSignin, statusCodes;

// if (Platform.OS !== "web") {
//   const googleSignInModule = require("@react-native-google-signin/google-signin");
//   GoogleSignin = googleSignInModule.GoogleSignin;
//   // eslint-disable-next-line no-unused-vars
//   statusCodes = googleSignInModule.statusCodes;
// }

// WebBrowser.maybeCompleteAuthSession();

// // ================= signIn With Google Web ===============

// export const useGoogleAuth = () => {
//   if (Platform.OS === "web") {
//     return Google.useAuthRequest({
//       webClientId: webClientId,
//       redirectUri: makeRedirectUri({ useProxy: true }),
//       useProxy: true,
//     });
//   }
//   return [null, null, null]; // no-op for native
// };

// export const getUserInfo = async (token) => {
//   if (!token) return;
//   const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   const user = await response.json();
//   await AsyncStorage.setItem("@user", JSON.stringify(user));
//   await AsyncStorage.setItem("@token", token);
//   return user;
// };

// export const handleGoogleLogin = async (response) => {
//   if (Platform.OS !== "web") return null; // skip for non-web platforms
//   if (response?.type === "success" && response.authentication?.accessToken) {
//     const user = await getUserInfo(response.authentication.accessToken);
//     WebBrowser.dismissBrowser();
//     return user;
//   }
//   return null;
// };

// // ================= signIn With Google App ===============

// //Configure Google SDK (call this once at app startup)
// export const initGoogleSignin = () => {
//   if (Platform.OS !== "web") {
//     GoogleSignin.configure({
//       webClientId: webClientId,
//       offlineAccess: false,
//     });
//   }
// };

// export const signInWithGoogleApp = async () => {
//   if (Platform.OS === "web") return null; // skip for web
//   try {
//     await GoogleSignin.hasPlayServices();
//     const userInfo = await GoogleSignin.signIn();

//     // Send idToken to backend for verification
//     const response = await fetch(`${API_URL}/auth/google`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         type: "id_token",
//         token: userInfo.idToken,
//       }),
//     });

//     if (!response.ok) throw new Error("Google login failed");

//     const data = await response.json();

//     // Save token & user locally
//     await AsyncStorage.setItem("@token", data.access_token);
//     await AsyncStorage.setItem("@user", JSON.stringify(data.user));

//     return data.user;
//   } catch (error) {
//     console.error("Google Sign-In error:", error);
//     throw error;
//   }
// };

// // ================= Regular Auth =================

// export const registerDoctor = async ({
//   doctorname,
//   email,
//   password,
//   phoneNumber,
//   location,
// }) => {
//   const response = await fetch(`${API_URL}/auth/doctor/signup`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       doctorname,
//       email,
//       password,
//       phoneNumber,
//       location,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Doctor registration failed");
//   }

//   const data = await response.json();
//   const { doctor } = data;

//   await AsyncStorage.setItem("@doctor", JSON.stringify(doctor));
//   return doctor;
// };

// export const signup = async (
//   username,
//   email,
//   password,
//   phoneNumber,
//   location
// ) => {
//   const response = await fetch(`${API_URL}/auth/user/signup`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ username, email, password, phoneNumber, location }),
//   });

//   if (!response.ok) {
//     const data = await response.json(); // Parse error response
//     const errorMessage =
//       data?.detail || `SignUp Failed ${response.status}`;
//     throw new Error(errorMessage);
//   }
//   const data = await response.json();
//   const { user } = data;

//   await AsyncStorage.setItem("@user", JSON.stringify(user));
//   return user;
// };

// export const login = async (email, password) => {
//   const response = await fetch(`${API_URL}/auth/user/login`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email, password }),
//   });

//   if (!response.ok) {
//     const data = await response.json(); // Parse error response
//     const errorMessage =
//       data?.detail || `Login failed with status ${response.status}`;
//     throw new Error(errorMessage);
//   }

//   const data = await response.json();
//   const { access_token, user } = data;

//   await AsyncStorage.setItem("@token", access_token);
//   await AsyncStorage.setItem("@user", JSON.stringify(user));

//   return { access_token, user };
// };

// export const logOut = async (setUser) => {
//   await AsyncStorage.removeItem("@token");
//   await AsyncStorage.removeItem("@user");
// };

// export const restoreUserState = async () => {
//   const token = await AsyncStorage.getItem("@token");
//   const user = await AsyncStorage.getItem("@user");
//   if (token && user) {
//     return { token, user: JSON.parse(user) };
//   }
//   return null;
// };




import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { API_URL, webClientId } from "../env-vars";
import { createApiError } from "./errorUtils";

WebBrowser.maybeCompleteAuthSession();

const JSON_HEADERS = { "Content-Type": "application/json" };

const buildUrl = (path) => `${API_URL}${path}`;

const cleanPayload = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

const postJson = async (path, body, fallbackMessage) => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(cleanPayload(body)),
  });
  return parseJsonResponse(response, fallbackMessage);
};

const persistUserSession = async ({ access_token, user }) => {
  if (access_token) {
    await AsyncStorage.setItem("@token", access_token);
  }
  if (user) {
    await AsyncStorage.setItem("@user", JSON.stringify(user));
  }
};

// ================= Google Sign-In (Web Only) =================

export const useGoogleAuth = () => {
  if (Platform.OS === "web") {
    return Google.useAuthRequest({
      webClientId,
      redirectUri: makeRedirectUri({ useProxy: true }),
      useProxy: true,
    });
  }
  return [null, null, null];
};

export const getUserInfo = async (token) => {
  if (!token) return;
  const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await response.json();
  await AsyncStorage.setItem("@user", JSON.stringify(user));
  await AsyncStorage.setItem("@token", token);
  return user;
};

export const handleGoogleLogin = async (response) => {
  if (Platform.OS !== "web") return null;
  if (response?.type === "success" && response.authentication?.accessToken) {
    const user = await getUserInfo(response.authentication.accessToken);
    WebBrowser.dismissBrowser();
    return user;
  }
  return null;
};

// ================= Disable Google for App =================

export const initGoogleSignin = () => {
  if (Platform.OS === "web") {
    console.log("✅ Google Sign-in initialized for web.");
  } else {
    console.log("Skipping Google Sign-in init (Expo Go / native).");
  }
};

export const signInWithGoogleApp = async () => {
  console.log("Google Sign-in not available on native in this setup.");
  return null;
};

// ================= Signup Verification Helpers =================

export const initiateUserSignupVerification = async ({ email, phoneNumber }) => {
  if (!email && !phoneNumber) {
    throw new Error("Please provide an email or phone number.");
  }
  return postJson(
    "/auth/user/signup/initiate",
    { email, phoneNumber },
    "Failed to initiate signup"
  );
};

export const initiateDoctorSignupVerification = async ({
  email,
  phoneNumber,
}) => {
  if (!email && !phoneNumber) {
    throw new Error("Please provide an email or phone number.");
  }
  return postJson(
    "/auth/doctor/signup/initiate",
    { email, phoneNumber },
    "Failed to initiate doctor signup"
  );
};

export const verifyMobileOtp = async ({ phoneNumber, otp, userId }) => {
  if (!phoneNumber || !otp) {
    throw new Error("OTP and phone number are required.");
  }
  return postJson(
    "/auth/verify-mobile-otp",
    { phoneNumber, otp, user_id: userId },
    "Failed to verify OTP"
  );
};

// ================= User Auth =================

export const signup = async ({
  username,
  password,
  verificationToken,
  phoneNumber,
  email,
  location,
}) => {
  if (!verificationToken) {
    throw new Error("Verification token is required to complete signup.");
  }

  const data = await postJson(
    "/auth/user/signup",
    {
      username,
      password,
      verificationToken,
      phoneNumber,
      email,
      location,
    },
    "Failed to complete signup"
  );

  const { doctor } = data;
  await AsyncStorage.setItem("@doctor", JSON.stringify(doctor));
  return doctor;
};

export const login = async ({ email, phoneNumber, password }) => {
  if (!password) {
    throw new Error("Password is required.");
  }
  if (!email && !phoneNumber) {
    throw new Error("Please provide an email or phone number.");
  }

  const data = await postJson(
    "/auth/user/login",
    { email, phoneNumber, password },
    "Login failed"
  );

  await persistUserSession(data);
  return data;
};

export const requestPasswordReset = async ({ email, phoneNumber }) => {
  if (!email && !phoneNumber) {
    throw new Error("Please enter your email or mobile number.");
  }
  if (email && phoneNumber) {
    throw new Error("Please use either email or mobile number, not both.");
  }

  return postJson(
    "/auth/request-password-reset",
    { email, phoneNumber },
    "Failed to request password reset"
  );
};

export const confirmPasswordReset = async ({
  email,
  phoneNumber,
  token,
  newPassword,
}) => {
  if (!token || !newPassword) {
    throw new Error("Reset code and new password are required.");
  }
  if (!email && !phoneNumber) {
    throw new Error("Please provide the email or mobile number you used.");
  }
  if (email && phoneNumber) {
    throw new Error("Please use either email or mobile number, not both.");
  }

  return postJson(
    "/auth/reset-password",
    { email, phoneNumber, token, new_password: newPassword },
    "Failed to reset password"
  );
};

// ================= Doctor Auth =================

export const completeDoctorSignup = async ({
  doctorname,
  password,
  verificationToken,
  phoneNumber,
  email,
  location,
}) => {
  if (!verificationToken) {
    throw new Error("Verification token is required to complete signup.");
  }

  return postJson(
    "/auth/doctor/signup",
    {
      doctorname,
      password,
      verificationToken,
      phoneNumber,
      email,
      location,
    },
    "Failed to complete doctor signup"
  );
};

// Backwards compatibility
export const registerDoctor = completeDoctorSignup;

export const loginDoctor = async ({ email, phoneNumber, password }) => {
  if (!password) {
    throw new Error("Password is required.");
  }
  if (!email && !phoneNumber) {
    throw new Error("Please provide an email or phone number.");
  }

  return postJson(
    "/auth/doctor/login",
    { email, phoneNumber, password },
    "Doctor login failed"
  );
};

// ================= Session Helpers =================

export const logOut = async () => {
  await AsyncStorage.removeItem("@token");
  await AsyncStorage.removeItem("@user");
};

export const restoreUserState = async () => {
  const token = await AsyncStorage.getItem("@token");
  const user = await AsyncStorage.getItem("@user");
  return token && user ? { token, user: JSON.parse(user) } : null;
};

// ================= Utilities =================

const parseJsonResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw createApiError({ response, data, fallbackMessage });
  }

  return data ?? {};
};
