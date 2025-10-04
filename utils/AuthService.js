import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import {
  API_URL,
  webClientId
} from "../env-vars";

let GoogleSignin, statusCodes;

if (Platform.OS !== "web") {
  const googleSignInModule = require("@react-native-google-signin/google-signin");
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
}

WebBrowser.maybeCompleteAuthSession();


// ================= signIn With Google Web ===============

export const useGoogleAuth = () => {
  if (Platform.OS === "web") {
    return Google.useAuthRequest({
      webClientId: webClientId,
      redirectUri: makeRedirectUri({ useProxy: true }),
      useProxy: true,
    });
  }
  return [null, null, null]; // no-op for native
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
  if (Platform.OS !== "web") return null; // skip for non-web platforms
  if (response?.type === "success" && response.authentication?.accessToken) {
    const user = await getUserInfo(response.authentication.accessToken);
    WebBrowser.dismissBrowser();
    return user;
  }
  return null;
};


// ================= signIn With Google App ===============

// Configure Google SDK (call this once at app startup)
export const initGoogleSignin = () => {
  if (Platform.OS !== "web") {
    GoogleSignin.configure({
      webClientId: webClientId,
      offlineAccess: false,
    });
  }
};

export const signInWithGoogleApp = async () => {
  if (Platform.OS === "web") return null; // skip for web
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Send idToken to backend for verification
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "id_token",
        token: userInfo.idToken,
      }),
    });

    if (!response.ok) throw new Error("Google login failed");

    const data = await response.json();

    // Save token & user locally
    await AsyncStorage.setItem("@token", data.access_token);
    await AsyncStorage.setItem("@user", JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    console.error("Google Sign-In error:", error);
    throw error;
  }
};


// ================= Regular Auth =================

export const registerDoctor = async ({
  doctorname,
  email,
  password,
  phoneNumber,
  location,
}) => {
  const response = await fetch(`${API_URL}/auth/doctor/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      doctorname,
      email,
      password,
      phoneNumber,
      location,
    }),
  });

  if (!response.ok) {
    throw new Error("Doctor registration failed");
  }

  const data = await response.json();
  const { doctor } = data;

  await AsyncStorage.setItem("@doctor", JSON.stringify(doctor));
  return doctor;
};

export const signup = async (
  username,
  email,
  password,
  phoneNumber,
  location
) => {
  const response = await fetch(`${API_URL}/auth/user/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password, phoneNumber, location }),
  });


  if (!response.ok) {
    const data = await response.json(); // Parse error response
    const errorMessage =
      data?.detail || `SignUp Failed ${response.status}`;
    throw new Error(errorMessage);
  }
  const data = await response.json();
  const { user } = data;

  await AsyncStorage.setItem("@user", JSON.stringify(user));
  return user;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json(); // Parse error response
    const errorMessage =
      data?.detail || `Login failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const { access_token, user } = data;

  await AsyncStorage.setItem("@token", access_token);
  await AsyncStorage.setItem("@user", JSON.stringify(user));

  return { access_token, user };
};

export const logOut = async (setUser) => {
  await AsyncStorage.removeItem("@token");
  await AsyncStorage.removeItem("@user");
};

export const restoreUserState = async () => {
  const token = await AsyncStorage.getItem("@token");
  const user = await AsyncStorage.getItem("@user");
  if (token && user) {
    return { token, user: JSON.parse(user) };
  }
  return null;
};
