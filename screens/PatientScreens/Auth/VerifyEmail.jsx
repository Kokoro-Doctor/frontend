import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import { API_URL } from "../../../env-vars";

const VerifyEmail = ({ route, navigation }) => {
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const performVerification = useCallback(async (targetEmail, token) => {
    setStatus("verifying");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, token }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.detail || data?.message || "Verification failed.");
      }

      setStatus("success");
      setMessage("Your email has been verified. You can now log in.");
    } catch (error) {
      setStatus("failed");
      setMessage(error.message || "Verification failed. Please try again.");
    }
  }, []);

  const routeEmail = route?.params?.email;
  const routeToken = route?.params?.token;

  const resolveParamsAndVerify = useCallback(async () => {
    let tokenParam = routeToken;
    let emailParam = routeEmail;

    if (!tokenParam || !emailParam) {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        tokenParam = tokenParam || searchParams.get("token");
        emailParam = emailParam || searchParams.get("email");
      } else {
        const url = await Linking.getInitialURL();
        if (url) {
          const { queryParams } = Linking.parse(url);
          tokenParam = tokenParam || queryParams?.token;
          emailParam = emailParam || queryParams?.email;
        }
      }
    }

    if (tokenParam && emailParam) {
      setEmail(emailParam);
      await performVerification(emailParam, tokenParam);
    } else {
      setStatus("failed");
      setMessage(
        "The verification link is incomplete. Please open the full link from your email."
      );
    }
  }, [performVerification, routeEmail, routeToken]);

  const handleResend = useCallback(async () => {
    if (!email) return;

    setIsResending(true);
    setResendMessage("");
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Failed to resend verification email."
        );
      }

      setResendMessage("A new verification email has been sent. Please check your inbox.");
    } catch (error) {
      setResendMessage(error.message || "Unable to resend the verification email.");
    } finally {
      setIsResending(false);
    }
  }, [email]);

  useEffect(() => {
    resolveParamsAndVerify();
  }, [resolveParamsAndVerify]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {status === "verifying" && (
          <>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.title}>Verifying your email…</Text>
            <Text style={styles.subtitle}>
              Hang tight while we confirm your account.
            </Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text style={[styles.title, styles.success]}>Email verified 🎉</Text>
            <Text style={styles.subtitle}>{message}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.primaryButtonText}>Go to login</Text>
            </TouchableOpacity>
          </>
        )}

        {status === "failed" && (
          <>
            <Text style={[styles.title, styles.error]}>Verification failed</Text>
            <Text style={styles.subtitle}>{message}</Text>
            {email ? (
              <TouchableOpacity
                style={[styles.primaryButton, styles.secondaryButton]}
                onPress={handleResend}
                disabled={isResending}
              >
                <Text style={styles.secondaryButtonText}>
                  {isResending ? "Resending…" : "Send a new verification email"}
                </Text>
              </TouchableOpacity>
            ) : null}
            {resendMessage ? (
              <Text style={styles.helper}>{resendMessage}</Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: "center",
  },
  title: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: "#4B5563",
    textAlign: "center",
  },
  success: {
    color: "#047857",
  },
  error: {
    color: "#DC2626",
  },
  primaryButton: {
    marginTop: 24,
    width: "100%",
    borderRadius: 10,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E5EDFF",
  },
  secondaryButtonText: {
    color: "#1D4ED8",
    fontSize: 15,
    fontWeight: "600",
  },
  helper: {
    marginTop: 16,
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
  },
});

export default VerifyEmail;