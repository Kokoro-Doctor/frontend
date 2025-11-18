import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useLoginModal } from "../../../contexts/LoginModalContext";
import { Ionicons } from "@expo/vector-icons";

const PasswordSuccess = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { triggerLoginModal } = useLoginModal();

  const handleBackToLogin = () => {
    triggerLoginModal({ mode: "login" });
    navigation.navigate("LandingPage");
  };

  return (
    <>
      {/* Web Version (for larger screens) */}
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />

          <View style={styles.mainContainer}>
            {/* Left side with background image - 40% */}
            <View style={styles.leftContainer}>
              <ImageBackground
                source={require("../../../assets/Images/login-background.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
              >
                <Text style={styles.quoteText}>
                  "Nurture Your Heart. It Will Nurture You."
                </Text>
              </ImageBackground>
            </View>

            {/* Rectangular divider */}
            <View style={styles.divider} />

            {/* Right side with success message - 60% */}
            <View style={styles.rightContainer}>
              <View style={styles.successContainer}>
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                </View>

                <Text style={styles.successTitle}>Password Set</Text>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleBackToLogin}
                >
                  <Text style={styles.loginButtonText}>Back To Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Mobile Version (for smaller screens) */}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.mobileContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/Images/KokoroLogo.png")}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>Kokoro.Doctor</Text>
          </View>

          <View style={styles.mobileSuccessContainer}>
            <View style={styles.mobileCheckmarkContainer}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>

            <Text style={styles.mobileSuccessTitle}>Password Set</Text>

            <TouchableOpacity
              style={styles.mobileLoginButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.mobileLoginButtonText}>Back To Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Web styles
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftContainer: {
    width: "40%",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#9966CC", // Fallback color that matches the image background
    justifyContent: "center",
    alignItems: "center",
  },
  quoteText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 32,
    paddingHorizontal: "5%",
  },
  divider: {
    width: 2, // Thin vertical divider
    height: "100%",
    backgroundColor: "#EEEEEE",
  },
  rightContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "5%",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10%",
  },
  loginButton: {
    backgroundColor: "#10B981",
    width: "100%",
    paddingVertical: "4%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Mobile styles
  mobileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: "5%",
    paddingTop: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: "5%",
    left: "5%",
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: "2%",
  },
  logoText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  mobileSuccessContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "5%",
  },
  mobileCheckmarkContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "6%",
  },
  mobileSuccessTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10%",
    textAlign: "center",
  },
  mobileLoginButton: {
    backgroundColor: "#10B981",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  mobileLoginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PasswordSuccess;
