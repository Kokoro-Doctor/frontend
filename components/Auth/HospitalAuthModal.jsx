// import React, { useState } from "react";
// import {
//   Modal,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   ActivityIndicator,
// } from "react-native";
// import { BlurView } from "expo-blur";
// import { hospitalLogin } from "../../utils/HospitalAuthService";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const HOSPITAL_SESSION_KEY = "hospital_session";

// const HospitalAuthModal = ({ visible, onRequestClose, onSuccess }) => {
//   const [hospitalId, setHospitalId] = useState("");
//   const [apiKey, setApiKey] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

  
//   const handleSignIn = async () => {
//     setError("");
//     if (!hospitalId.trim()) {
//       setError("Please enter Hospital ID");
//       return;
//     }
//     if (!apiKey.trim()) {
//       setError("Please enter your API key");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const data = await hospitalLogin(hospitalId.trim(), apiKey);
//       const { hospital } = data;

//       const session = {
//         hospital_id: hospital.hospital_id,
//         api_key: apiKey,
//         name: hospital.name,
//       };

//       // Store in AsyncStorage (mobile)
//       await AsyncStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));

//       // Store in localStorage (web) — this is what ManualDataIntegration reads
//       if (Platform.OS === "web") {
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("hospital_id", hospital.hospital_id);
//         localStorage.setItem("hospital_name", hospital.name || "");
//       }

//       if (onSuccess) {
//         onSuccess(session);
//       }
//     } catch (err) {
//       setError(err?.message || "Sign in failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={onRequestClose}
//     >
//       <View style={styles.overlay}>
//         <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
//         <View style={styles.modalContainer}>
//           <Text style={styles.title}>Hospital Sign In</Text>
//           <Text style={styles.message}>
//             Enter your Hospital ID and API key to access the upload portal.
//           </Text>

//           <Text style={styles.label}>Hospital ID</Text>
//           <TextInput
//             style={styles.input}
//             value={hospitalId}
//             onChangeText={(t) => {
//               setHospitalId(t);
//               setError("");
//             }}
//             placeholder="e.g. HOSP_001"
//             placeholderTextColor="#999"
//             editable={!isLoading}
//             autoCapitalize="none"
//             autoCorrect={false}
//           />

//           <Text style={styles.label}>API Key</Text>
//           <TextInput
//             style={styles.input}
//             value={apiKey}
//             onChangeText={(t) => {
//               setApiKey(t);
//               setError("");
//             }}
//             placeholder="Enter your API key"
//             placeholderTextColor="#999"
//             editable={!isLoading}
//             autoCapitalize="none"
//             autoCorrect={false}
//             secureTextEntry
//           />

//           {error ? (
//             <View style={styles.errorBox}>
//               <Text style={styles.errorText}>{error}</Text>
//             </View>
//           ) : null}

//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               style={[styles.signInButton, isLoading && styles.buttonDisabled]}
//               onPress={handleSignIn}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={styles.signInText}>Sign In</Text>
//               )}
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={onRequestClose}
//               disabled={isLoading}
//             >
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 28,
//     width: "90%",
//     maxWidth: 420,
//     alignItems: "stretch",
//     ...Platform.select({
//       web: {
//         boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
//       },
//       default: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//       },
//     }),
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   message: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 20,
//     paddingHorizontal: 8,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#334155",
//     marginBottom: 6,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 16,
//     color: "#1e293b",
//     backgroundColor: "#fff",
//     marginBottom: 16,
//   },
//   errorBox: {
//     backgroundColor: "#fef2f2",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#fecaca",
//   },
//   errorText: {
//     color: "#dc2626",
//     fontSize: 14,
//   },
//   buttonContainer: {
//     width: "100%",
//     gap: 12,
//   },
//   signInButton: {
//     width: "100%",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     backgroundColor: "#FF7072",
//     alignItems: "center",
//     ...Platform.select({
//       web: {
//         cursor: "pointer",
//       },
//     }),
//   },
//   buttonDisabled: {
//     opacity: 0.7,
//   },
//   signInText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   cancelButton: {
//     width: "100%",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     ...Platform.select({
//       web: {
//         cursor: "pointer",
//       },
//     }),
//   },
//   cancelText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#999",
//   },
// });

// export default HospitalAuthModal;
// export { HOSPITAL_SESSION_KEY };

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
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "../../contexts/AuthContext";

export const HOSPITAL_SESSION_KEY = "hospital_session";

// ─── Reusable labeled input ───────────────────────────────────────────────────
const Field = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, editable }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
      editable={editable !== false}
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={!!secureTextEntry}
      keyboardType={keyboardType || "default"}
    />
  </View>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const HospitalAuthModal = ({ visible, onRequestClose, onSuccess }) => {
  const { hospitalLogin, hospitalSignup } = useAuth();

  const [mode, setMode]         = useState("signin"); // "signin" | "signup"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");

  // Sign-in state
  const [hospitalId, setHospitalId] = useState("");
  const [apiKey, setApiKey]         = useState("");

  // Sign-up state
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState(""); // sent as api_key
  const [address, setAddress]         = useState("");
  const [city, setCity]               = useState("");
  const [stateVal, setStateVal]       = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const clearError = () => setError("");

  const resetFields = () => {
    setHospitalId(""); setApiKey("");
    setName(""); setEmail(""); setPassword("");
    setAddress(""); setCity(""); setStateVal(""); setContactNumber("");
    setError("");
  };

  const switchMode = (newMode) => { resetFields(); setMode(newMode); };

  // ── Sign In ───────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    clearError();
    if (!hospitalId.trim()) return setError("Hospital ID is required.");
    if (!apiKey.trim())     return setError("API key is required.");

    setIsLoading(true);
    try {
      const session = await hospitalLogin(hospitalId.trim(), apiKey.trim());
      onSuccess?.(session);
    } catch (err) {
      setError(err?.message || "Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const handleSignUp = async () => {
    clearError();
    if (!name.trim())     return setError("Hospital name is required.");
    if (!password.trim()) return setError("API key is required.");

    setIsLoading(true);
    try {
      const session = await hospitalSignup({
        name:           name.trim(),
        api_key:        password.trim(),
        email:          email.trim(),
        address:        address.trim(),
        city:           city.trim(),
        state:          stateVal.trim(),
        contact_number: contactNumber.trim(),
      });
      onSuccess?.(session);
    } catch (err) {
      setError(err?.message || "Sign up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSignIn = mode === "signin";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.card}>
          {/* ── Tab toggle ── */}
          <View style={styles.tabRow}>
            {["signin", "signup"].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => switchMode(m)}
                disabled={isLoading}
              >
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            <Text style={styles.subtitle}>
              {isSignIn
                ? "Enter your credentials to access the upload portal."
                : "Register your hospital to get started."}
            </Text>

            {/* ── Sign In fields ── */}
            {isSignIn && (
              <>
                <Field label="Hospital ID" value={hospitalId}
                  onChangeText={(t) => { setHospitalId(t); clearError(); }}
                  placeholder="e.g. HOSP_001" editable={!isLoading} />
                <Field label="API Key" value={apiKey}
                  onChangeText={(t) => { setApiKey(t); clearError(); }}
                  placeholder="Enter your API key"
                  secureTextEntry editable={!isLoading} />
              </>
            )}

            {/* ── Sign Up fields ── */}
            {!isSignIn && (
              <>
                <Field label="Hospital Name *" value={name}
                  onChangeText={(t) => { setName(t); clearError(); }}
                  placeholder="e.g. City General Hospital" editable={!isLoading} />
                <Field label="Email" value={email}
                  onChangeText={(t) => { setEmail(t); clearError(); }}
                  placeholder="contact@hospital.com"
                  keyboardType="email-address" editable={!isLoading} />
                <Field label="API Key (Password) *" value={password}
                  onChangeText={(t) => { setPassword(t); clearError(); }}
                  placeholder="Create a secure API key"
                  secureTextEntry editable={!isLoading} />
                <Field label="Address" value={address}
                  onChangeText={(t) => { setAddress(t); clearError(); }}
                  placeholder="123 Main Street" editable={!isLoading} />
                <Field label="City" value={city}
                  onChangeText={(t) => { setCity(t); clearError(); }}
                  placeholder="Mumbai" editable={!isLoading} />
                <Field label="State" value={stateVal}
                  onChangeText={(t) => { setStateVal(t); clearError(); }}
                  placeholder="Maharashtra" editable={!isLoading} />
                <Field label="Contact Number" value={contactNumber}
                  onChangeText={(t) => { setContactNumber(t); clearError(); }}
                  placeholder="+919587733170"
                  keyboardType="phone-pad" editable={!isLoading} />
              </>
            )}

            {/* ── Error ── */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* ── Primary action ── */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={isSignIn ? handleSignIn : handleSignUp}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.primaryButtonText}>
                    {isSignIn ? "Sign In" : "Create Account"}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onRequestClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 420,
    maxHeight: "88%",
    ...Platform.select({
      web: { boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }),
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#fff",
    ...Platform.select({
      web: { boxShadow: "0 1px 4px rgba(0,0,0,0.12)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  tabText:       { fontSize: 14, fontWeight: "500", color: "#94a3b8" },
  tabTextActive: { color: "#FF7072", fontWeight: "700" },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 19,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#1e293b",
    backgroundColor: "#fafafa",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 11,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { color: "#dc2626", fontSize: 13 },
  primaryButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#FF7072",
    alignItems: "center",
    marginTop: 4,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  buttonDisabled:     { opacity: 0.65 },
  primaryButtonText:  { fontSize: 15, fontWeight: "700", color: "#fff" },
  cancelButton: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  cancelText: { fontSize: 14, fontWeight: "500", color: "#94a3b8" },
});

export default HospitalAuthModal;
