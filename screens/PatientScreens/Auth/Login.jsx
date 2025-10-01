import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { AuthContext } from "../../../contexts/AuthContext";
import { useGoogleAuth } from "../../../utils/AuthService";

const Login = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, googleLogin, loginWithGoogle } = useContext(AuthContext);
  const [request, response, promptAsync] = useGoogleAuth();
  const [googleHandled, setGoogleHandled] = useState(false);

  // useEffect(() => {
  //   const doLogin = async () => {
  //     console.log("👉 useEffect triggered with response:", response);

  //     if (response?.type === "success" && !googleHandled) {
  //       setGoogleHandled(true); // ✅ mark as handled
  //       console.log("✅ Google auth success, calling backend once...");
  //       try {
  //         const user = await googleLogin(response);
  //         console.log("✅ googleLogin returned user:", user);

  //         if (user) {
  //           console.log("👉 Navigating to LandingPage");
  //           navigation.navigate("LandingPage");
  //         } else {
  //           console.log("❌ googleLogin returned null user");
  //         }
  //       } catch (error) {
  //         console.error("❌ Google login error in Login.jsx:", error);
  //       }
  //     } else {
  //       console.log(
  //         "ℹ️ No success response from Google yet or already handled"
  //       );
  //     }
  //   };

  //   doLogin();
  // }, [response, navigation, googleHandled]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const doLogin = async () => {
        if (response?.type === "success" && !googleHandled) {
          setGoogleHandled(true);
          try {
            const user = await googleLogin(response);
            if (user) {
              navigation.navigate("LandingPage");
            }
          } catch (error) {
            console.error("❌ Google login error (Web):", error);
          }
        }
      };
      doLogin();
    }
  }, [response, navigation, googleHandled]);

  const startGoogleLogin = async () => {
    try {
      if (Platform.OS === "web") {
        if (request) {
          console.log("👉 Starting Google login (Web)...");
          promptAsync({ useProxy: false });
        } else {
          console.log("❌ Google auth request not ready yet (Web)");
        }
      } else {
        console.log("👉 Starting Google login (Mobile App)...");
        const user = await loginWithGoogle(); // calls the native SDK
        if (user) {
          await googleLogin(user); // your backend call
          navigation.navigate("LandingPage");
        }
      }
    } catch (err) {
      console.error("❌ Google login failed:", err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <>
      {/* Web Version (for larger screens) */}
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" />

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

            {/* Right side with login form - 60% */}
            <View style={styles.rightContainer}>
              <View style={styles.mainright}>
                <Text style={styles.title}>Welcome Back!</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={togglePasswordVisibility}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.rememberForgotRow}>
                  <TouchableOpacity
                    style={styles.rememberMeContainer}
                    onPress={toggleRememberMe}
                  >
                    <View
                      style={[styles.checkbox, rememberMe && styles.checkedBox]}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      )}
                    </View>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate("ForgotPassword")}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => login(email, password, navigation)}
                >
                  <Text style={styles.continueButtonText}>Log in</Text>
                </TouchableOpacity>

                <View style={styles.orContainer}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>Or</Text>
                  <View style={styles.orLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={startGoogleLogin}
                  disabled={!request}
                >
                  <Image
                    source={require("../../../assets/Images/google-icon.png")}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Mobile Version (for smaller screens) */}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.mobileContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <SafeAreaView style={styles.logoContainer}>
            <Image
              source={require("../../../assets/Images/KokoroLogo.png")}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>Kokoro.Doctor</Text>
          </SafeAreaView>

          <View style={styles.mobileFormContainer}>
            <Text style={styles.mobileTitle}>Welcome Back!</Text>

            {/* Email Input */}
            <Text style={styles.mobileInputLabel}>Email</Text>
            <TextInput
              style={styles.mobileInput}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password Input */}
            <Text style={styles.mobileInputLabel}>Password</Text>
            <View style={styles.mobilePasswordContainer}>
              <TextInput
                style={styles.mobilePasswordInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.mobileEyeIcon}
                onPress={togglePasswordVisibility}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me and Forgot Password */}
            <View style={styles.mobileRememberForgotRow}>
              <View style={styles.mobileRememberContainer}>
                <TouchableOpacity onPress={toggleRememberMe}>
                  <View style={styles.mobileCheckboxContainer}>
                    <View
                      style={[
                        styles.mobileCheckbox,
                        rememberMe && styles.mobileCheckedBox,
                      ]}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.mobileRememberText}>Remember me</Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.mobileForgotText}>Forgot Password</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.mobileSignInButton}
              onPress={() => login(email, password, navigation)}
            >
              <Text style={styles.mobileSignInText}>Log in</Text>
            </TouchableOpacity>

            {/* Or Divider */}
            <View style={styles.mobileOrContainer}>
              <View style={styles.mobileOrLine} />
              <Text style={styles.mobileOrText}>Or</Text>
              <View style={styles.mobileOrLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              style={styles.mobileGoogleButton}
              onPress={startGoogleLogin}
            >
              <Image
                source={require("../../../assets/Images/google-icon.png")}
                style={styles.mobileGoogleIcon}
              />
              <Text style={styles.mobileGoogleText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Web styles (original styles)
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
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  quoteText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 30,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    width: "80%",
  },
  divider: {
    width: "0.15%",
    height: "100%",
    backgroundColor: "#EEEEEE",
  },
  rightContainer: {
    width: "60%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: "5%",
  },
  mainright: {
    width: "65%",
    margin: "auto",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: "4%",
  },
  inputContainer: {
    marginBottom: "3%",
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: "1%",
    fontWeight: "500",
  },
  input: {
    height: 50,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: "3%",
    fontSize: 16,
    width: "100%",
    outlineStyle: "none",
    borderwidth: 0,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    height: 50,
    width: "100%",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: "3%",
    fontSize: 16,
    height: "100%",
    outlineStyle: "none",
    borderWidth: 0,
  },
  eyeIcon: {
    padding: "2%",
  },
  rememberForgotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "3%",
    marginTop: "1%",
  },
  rememberMeContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: "2%",
    backgroundColor: "#FFF",
  },
  checkedBox: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#666",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },
  continueButton: {
    backgroundColor: "#10B981",
    width: "100%",
    height: 50,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginBottom: "2%",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: "3%",
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  orText: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: "2%",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: "2%",
  },
  googleButtonText: {
    fontSize: 14,
    color: "#666",
  },

  // Mobile styles (updated with percentages)
  mobileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: "5%",
    paddingTop: "5%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "10%",
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
  mobileFormContainer: {
    width: "100%",
  },
  mobileTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
    marginBottom: "6%",
  },
  mobileInputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: "2%",
  },
  mobileInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: "4%",
    fontSize: 16,
    marginBottom: "4%",
    width: "100%",
  },
  mobilePasswordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    height: 56,
    marginBottom: "4%",
    width: "100%",
  },
  mobilePasswordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: "4%",
    fontSize: 16,
  },
  mobileEyeIcon: {
    paddingHorizontal: "4%",
    height: "100%",
    justifyContent: "center",
  },
  mobileRememberForgotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6%",
    width: "100%",
  },
  mobileRememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mobileCheckboxContainer: {
    marginRight: "2%",
  },
  mobileCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  mobileCheckedBox: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  mobileRememberText: {
    fontSize: 14,
    color: "#666",
  },
  mobileForgotText: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },
  mobileSignInButton: {
    backgroundColor: "#10B981",
    height: 56,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "4%",
    width: "100%",
  },
  mobileSignInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mobileOrContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: "4%",
    width: "100%",
  },
  mobileOrLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD",
  },
  mobileOrText: {
    paddingHorizontal: "4%",
    color: "#666",
    fontSize: 14,
  },
  mobileGoogleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    width: "100%",
  },
  mobileGoogleIcon: {
    width: 24,
    height: 24,
    marginRight: "2%",
  },
  mobileGoogleText: {
    fontSize: 14,
    color: "#666",
  },
});

export default Login;
