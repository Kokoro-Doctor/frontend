import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { hospitalLogin } from "../../utils/HospitalAuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HOSPITAL_SESSION_KEY = "hospital_session";

const HospitalAuthModal = ({ visible, onRequestClose, onSuccess }) => {
  const [hospitalId, setHospitalId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");
    if (!hospitalId.trim()) {
      setError("Please enter Hospital ID");
      return;
    }
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }

    setIsLoading(true);
    try {
      const { hospital } = await hospitalLogin(hospitalId.trim(), apiKey);
      const session = {
        hospital_id: hospital.hospital_id,
        api_key: apiKey,
        name: hospital.name,
      };
      // await AsyncStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));
      // onRequestClose();
      // if (onSuccess) {
      //   onSuccess(session);
      // }
      await AsyncStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));
      if (onSuccess) {
        onSuccess(session); // onSuccess in HeaderLoginSignUp already closes modal first
      }
    } catch (err) {
      setError(err?.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Hospital Sign In</Text>
          <Text style={styles.message}>
            Enter your Hospital ID and API key to access the upload portal.
          </Text>

          <Text style={styles.label}>Hospital ID</Text>
          <TextInput
            style={styles.input}
            value={hospitalId}
            onChangeText={(t) => {
              setHospitalId(t);
              setError("");
            }}
            placeholder="e.g. HOSP_001"
            placeholderTextColor="#999"
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={(t) => {
              setApiKey(t);
              setError("");
            }}
            placeholder="Enter your API key"
            placeholderTextColor="#999"
            editable={!isLoading}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onRequestClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    width: "90%",
    maxWidth: 420,
    alignItems: "stretch",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  signInButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#FF7072",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signInText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#999",
  },
});

export default HospitalAuthModal;
export { HOSPITAL_SESSION_KEY };
