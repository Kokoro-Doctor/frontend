import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SignInPopup = ({ isVisible, onClose, onMaybeLater }) => {
  const navigation = useNavigation();

  const handleLogin = () => {
    onClose();
    navigation.navigate("Login");
  };

  const handleSignUp = () => {
    onClose();
    // Navigate to Signup screen using nested navigation
    // Since Signup is inside PatientAppNavigation, we need to navigate to the nested route
    // Get root navigator to ensure navigation works from any context
    const rootNavigation = navigation.getParent() || navigation;

    // Use nested navigation pattern - this works from both root and nested navigator contexts
    rootNavigation.navigate("PatientAppNavigation", {
      screen: "Signup",
    });
  };

  const handleStayLoggedOut = () => {
    // Reset chat count when "Stay logged out" is clicked
    if (onMaybeLater) {
      onMaybeLater();
    }
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
          </View>

          <Text style={styles.message}>
            Log in or sign up to get smarter responses, upload files and images,
            and more.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpText}>Sign up for free</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stayLoggedOutButton}
              onPress={handleStayLoggedOut}
            >
              <Text style={styles.stayLoggedOutText}>Stay logged out</Text>
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
    alignItems: "center",
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
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  loginButton: {
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
  loginText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  signUpButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF7072",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  signUpText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF7072",
  },
  stayLoggedOutButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 4,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  stayLoggedOutText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#999",
  },
});

export default SignInPopup;
