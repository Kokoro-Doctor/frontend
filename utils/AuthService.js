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

const persistUserSession = async ({ access_token, profile, role }) => {
  if (access_token) {
    await AsyncStorage.setItem("@token", access_token);
  }
  if (profile) {
    await AsyncStorage.setItem("@user", JSON.stringify(profile));
  }
  if (role) {
    // Use consistent key "userRole" to match RoleContext
    await AsyncStorage.setItem("userRole", role);
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

// ================= OTP & Login Flow Helpers =================

export const requestSignupOtp = async ({ phoneNumber, email, role = "user" }) => {
  if (!phoneNumber) {
    throw new Error("Please provide a mobile number.");
  }
  if (!email) {
    throw new Error("Please provide an email address.");
  }
  const endpoint =
    role === "doctor"
      ? "/auth/doctor/request-signup-otp"
      : "/auth/user/request-signup-otp";
  return postJson(endpoint, { phoneNumber, email }, "Failed to send OTP");
};

export const requestLoginOtp = async ({ identifier, preferredChannel = "email" }) => {
  // identifier can be email or phone number
  // preferredChannel: "email" (default) or "sms"
  if (!identifier) {
    throw new Error("Please provide an email address or mobile number.");
  }
  return postJson("/auth/request-otp", { identifier, preferredChannel }, "Failed to send OTP");
};

export const initiateLogin = async ({ identifier }) => {
  // identifier can be email or phone number
  if (!identifier) {
    throw new Error("Please provide an email address or mobile number.");
  }
  return postJson("/auth/login", { identifier }, "Failed to start login");
};


// Helper function to fetch user profile
const fetchUserProfile = async (user_id, access_token) => {
  try {
    const headers = {
      ...JSON_HEADERS,
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    };
    const response = await fetch(buildUrl(`/users/${user_id}`), {
      method: "GET",
      headers,
    });
    console.log("User Profile Response:", response);
    const result = await parseJsonResponse(response, "Failed to fetch user profile");
    return result?.user || null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Helper function to fetch doctor profile
const fetchDoctorProfile = async (doctor_id, access_token) => {
  try {
    const headers = {
      ...JSON_HEADERS,
      ...(access_token && { Authorization: `Bearer ${access_token}` }),
    };
    const response = await fetch(buildUrl(`/doctorsService/doctor/${doctor_id}`), {
      method: "GET",
      headers,
    });
    const result = await parseJsonResponse(response, "Failed to fetch doctor profile");
    return result?.doctor || null;
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return null;
  }
};

const handleLoginResponse = async (data) => {
  if (!data?.access_token) {
    return data;
  }

  // Persist token first so it's available for profile fetch
  await AsyncStorage.setItem("@token", data.access_token);

  let profile = data.profile;
  const role = data.role;

  // If profile is not in response, fetch it using user_id or doctor_id
  if (!profile) {
    if (data.user_id && role === "user") {
      profile = await fetchUserProfile(data.user_id, data.access_token);
      console.log("User Profile:", profile);
    } else if (data.doctor_id && role === "doctor") {
      profile = await fetchDoctorProfile(data.doctor_id, data.access_token);
    }
  }

  // Normalize doctor profile: ensure 'name' field exists from 'doctorname' if needed
  if (profile && role === "doctor") {
    if (!profile.name && profile.doctorname) {
      profile.name = profile.doctorname;
    }
    console.log("Doctor profile normalized:", { name: profile.name, doctorname: profile.doctorname, allKeys: Object.keys(profile) });
  }

  // If profile fetch failed, create minimal profile from login response
  // This ensures auth state is set even if profile endpoint fails
  if (!profile && (data.user_id || data.doctor_id)) {
    profile = {
      user_id: data.user_id,
      doctor_id: data.doctor_id,
      role: role,
      // Minimal profile - will be updated on next fetch
    };
  }

  if (profile) {
    await persistUserSession({
      access_token: data.access_token,
      profile: profile,
      role: role,
    });
    // Return data with profile included for consistency
    return { ...data, profile };
  }

  return data;
};

export const loginWithOtp = async ({ identifier, otp }) => {
  // identifier can be email or phone number
  if (!identifier || !otp) {
    throw new Error("Email/phone number and OTP are required.");
  }
  const data = await postJson(
    "/auth/login",
    { identifier, otp },
    "OTP login failed"
  );
  return handleLoginResponse(data);
};

// ================= Profile Creation =================

export const completeUserSignup = async ({
  phoneNumber,
  email,
  otp,
  name,
}) => {
  // Experimental flow: mobile-only signup (no email AND no otp required)
  // Name is optional and can be provided in experimental flow
  const isExperimentalFlow = !email && !otp;
  
  if (isExperimentalFlow) {
    // Experimental flow: only phone number required (name is optional)
    if (!phoneNumber) {
      throw new Error("Phone number is required.");
    }

    const data = await postJson(
      "/auth/user/signup",
      { phoneNumber, ...(name && { name }) },
      "Failed to complete signup"
    );

    let profile = data.profile;

    // If profile is not in response, fetch it using user_id
    if (!profile && data.user_id) {
      profile = await fetchUserProfile(data.user_id);
    }

    await persistUserSession({
      access_token: data.access_token,
      profile: profile,
      role: "user",
    });

    // Return data with profile included for consistency
    return { ...data, profile };
  }

  // Normal flow: email, otp, and phoneNumber required
  if (!phoneNumber || !otp) {
    throw new Error("Phone number and OTP are required to complete signup.");
  }
  if (!email) {
    throw new Error("Email is required to complete signup.");
  }

  const data = await postJson(
    "/auth/user/signup",
    { phoneNumber, email, otp, ...(name && { name }) },
    "Failed to complete signup"
  );

  let profile = data.profile;

  // If profile is not in response, fetch it using user_id
  if (!profile && data.user_id) {
    profile = await fetchUserProfile(data.user_id);
  }

  await persistUserSession({
    access_token: data.access_token,
    profile: profile,
    role: "user",
  });

  // Return data with profile included for consistency
  return { ...data, profile };
};

export const completeDoctorSignup = async ({
  phoneNumber,
  otp,
  name,
  specialization,
  experience,
  email,
}) => {
  if (!phoneNumber || !otp) {
    throw new Error("Phone number and OTP are required to complete signup.");
  }

  const data = await postJson(
    "/auth/doctor/signup",
    {
      phoneNumber,
      otp,
      name,
      specialization,
      experience,
      email,
    },
    "Failed to complete doctor signup"
  );

  let profile = data.profile;

  // If profile is not in response, fetch it using doctor_id
  if (!profile && data.doctor_id) {
    profile = await fetchDoctorProfile(data.doctor_id, data.access_token);
  }

  // Normalize doctor profile: ensure 'name' field exists from 'doctorname' if needed
  if (profile) {
    if (!profile.name && profile.doctorname) {
      profile.name = profile.doctorname;
    }
    console.log("Doctor signup profile normalized:", { name: profile.name, doctorname: profile.doctorname, allKeys: Object.keys(profile) });
  }

  await persistUserSession({
    access_token: data.access_token,
    profile: profile,
    role: "doctor",
  });

  // Return data with profile included for consistency
  return { ...data, profile };
};

// ================= Session Helpers =================

export const logOut = async () => {
  await AsyncStorage.removeItem("@token");
  await AsyncStorage.removeItem("@user");
  await AsyncStorage.removeItem("userRole");
};

export const restoreUserState = async () => {
  try {
    const token = await AsyncStorage.getItem("@token");
    const user = await AsyncStorage.getItem("@user");
    let role = await AsyncStorage.getItem("userRole");
    
    // On web, also check localStorage directly as fallback
    // (AsyncStorage uses localStorage on web, but there might be timing issues in production)
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage && !role) {
      try {
        const localRole = window.localStorage.getItem("userRole");
        if (localRole) {
          role = localRole;
          // Sync back to AsyncStorage
          await AsyncStorage.setItem("userRole", localRole);
        }
      } catch (localError) {
        console.log("Error reading role from localStorage:", localError);
      }
    }
    
    // Return state even if only role exists (for role-based routing on refresh)
    // This ensures role is available even if token/user parsing fails
    if (token && user) {
      try {
        return { token, user: JSON.parse(user), role };
      } catch (parseError) {
        console.error("Failed to parse user from storage:", parseError);
        // If role exists, return it even if user parse fails
        if (role) {
          return { token: null, user: null, role };
        }
      }
    }
    
    // If only role exists, return it (helps with role-based routing)
    if (role) {
      return { token: null, user: null, role };
    }
    
    return null;
  } catch (error) {
    console.error("Error restoring user state:", error);
    // Try to at least get the role (with web fallback)
    try {
      let role = await AsyncStorage.getItem("userRole");
      
      // Web fallback
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage && !role) {
        try {
          const localRole = window.localStorage.getItem("userRole");
          if (localRole) {
            role = localRole;
            await AsyncStorage.setItem("userRole", localRole);
          }
        } catch (localError) {
          console.error("Error reading role from localStorage fallback:", localError);
        }
      }
      
      if (role) {
        return { token: null, user: null, role };
      }
    } catch (roleError) {
      console.error("Error restoring role:", roleError);
    }
    return null;
  }
};

// ================= Utilities =================

const parseJsonResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw createApiError({ response, data, fallbackMessage });
  }

  return data ?? {};
};
