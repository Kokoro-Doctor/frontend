import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import { useLoginModal } from "../../contexts/LoginModalContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthPopup } from "../../contexts/AuthPopupContext";
import PatientAuthModal from "../Auth/PatientAuthModal";
import DoctorAuthModal from "../Auth/DoctorAuthModal";
import mixpanel from "../../utils/Mixpanel";
import AsyncStorage from "@react-native-async-storage/async-storage";

const defaultAvatar = require("../../assets/Images/user-icon.jpg");

const HeaderLoginSignUp = ({ isDoctorPortal = false, user: userOverride }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSideBarVisible, setIsSideBarVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("signup");
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const { registerOpenModal } = useLoginModal();
  const { user: contextUser, role, logout } = useAuth();
  const user = userOverride ?? contextUser;

  // Get auth popup functions to cancel auto-popup timer
  const authPopup = useAuthPopup();
  const { openPatientAuth, openDoctorAuth, clearAutoPopupTimer } =
    authPopup || {};

  // Determine if we're in doctor portal based on prop OR current route
  const getCurrentNavigator = () => {
    // First check the prop
    if (isDoctorPortal) return "doctor";

    // Then check the navigation state to determine which navigator we're in
    try {
      const state = navigation.getState();

      // Check root level routes
      if (state?.routes) {
        // Find the current active route
        const currentRoute = state.routes[state.index];

        // Direct check for DoctorAppNavigation
        if (currentRoute?.name === "DoctorAppNavigation") {
          return "doctor";
        }

        // Direct check for PatientAppNavigation
        if (currentRoute?.name === "PatientAppNavigation") {
          return "patient";
        }

        // Check nested routes
        if (currentRoute?.state?.routes) {
          const nestedRoute =
            currentRoute.state.routes[currentRoute.state.index];

          // Check for doctor-specific screens
          if (
            nestedRoute?.name === "DoctorPortalLandingPage" ||
            nestedRoute?.name === "Dashboard" ||
            nestedRoute?.name === "DoctorDashboard" ||
            nestedRoute?.name === "DoctorProfile"
          ) {
            return "doctor";
          }

          // Check for patient-specific screens
          if (
            nestedRoute?.name === "UserDashboard" ||
            nestedRoute?.name === "Medilocker" ||
            nestedRoute?.name === "Doctors"
          ) {
            return "patient";
          }
        }
      }

      // Check if we're on a doctor route by URL (web only)
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const pathname = window.location.pathname;
        if (pathname.startsWith("/doctor")) {
          return "doctor";
        }
        if (pathname.startsWith("/patient")) {
          return "patient";
        }
      }
    } catch (error) {
      console.log("Error getting navigator:", error);
    }

    // Check role as final fallback
    if (role === "doctor") {
      return "doctor";
    }

    // Default to patient portal
    return "patient";
  };

  const currentNavigator = getCurrentNavigator();
  const resolvedIsDoctorPortal = currentNavigator === "doctor";

  const displayName = user?.name || user?.fullName || user?.username || "User";
  const avatarUri =
    user?.picture ||
    user?.avatar ||
    user?.avatarUrl ||
    user?.profileImage ||
    user?.image ||
    user?.photoUrl;
  const avatarSource =
    avatarUri && typeof avatarUri === "string"
      ? { uri: avatarUri }
      : defaultAvatar;

  const isApp = Platform.OS === "ios" || Platform.OS === "android";
  const isSmallScreen =
    Platform.OS === "web" && Dimensions.get("window").width <= 820;
  const isMobile = isApp || isSmallScreen;

  const openAuthModal = useCallback((mode = "signup") => {
    setAuthModalMode(mode);
    setAuthModalVisible(true);
  }, []);

  const closeAuthModal = () => {
    setAuthModalVisible(false);
  };

  useEffect(() => {
    registerOpenModal(({ mode = "signup" } = {}) => {
      // If on doctor portal, open doctor modal; otherwise open patient modal
      if (resolvedIsDoctorPortal) {
        setDoctorModalVisible(true);
      } else {
        openAuthModal(mode);
      }
    });
  }, [registerOpenModal, openAuthModal, resolvedIsDoctorPortal]);

  const onHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const onHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleProfile = () => {
    setDropdownVisible(false);
    // TODO: Navigate to user profile page
    // navigation.navigate("UserProfile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownVisible(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDoctorRegister = () => {
    setDoctorModalVisible(true);
  };

  const goToDoctorPortal = async () => {
    await AsyncStorage.setItem("activePortal", "doctor");

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "DoctorAppNavigation",
          params: { screen: "DoctorPortalLandingPage" },
        },
      ],
    });
  };

  const goToPatientPortal = async () => {
    await AsyncStorage.setItem("activePortal", "patient");

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "PatientAppNavigation",
          params: { screen: "LandingPage" },
        },
      ],
    });
  };

  const handleLoginSignupPress = () => {
    console.log("Login/Signup pressed:", {
      currentNavigator,
      resolvedIsDoctorPortal,
      role,
      modalToShow: resolvedIsDoctorPortal
        ? "DoctorAuthModal"
        : "PatientAuthModal",
    });

    mixpanel.track("Auth CTA Clicked", {
      source: "Header",
      platform: Platform.OS,
      cta_text: "Login / Signup",
      user_state: user ? "logged_in" : "anonymous",
      portal: resolvedIsDoctorPortal ? "doctor" : "patient",
    });

    // Cancel auto-popup timer since user manually clicked
    if (clearAutoPopupTimer) {
      clearAutoPopupTimer();
    }

    // Show appropriate modal based on current navigator
    if (resolvedIsDoctorPortal) {
      console.log("Opening DoctorAuthModal");
      // Use AuthPopup context if available, otherwise local state
      if (openDoctorAuth) {
        openDoctorAuth();
      } else {
        setDoctorModalVisible(true);
      }
    } else {
      console.log("Opening PatientAuthModal");
      // Use AuthPopup context if available, otherwise local state
      if (openPatientAuth) {
        openPatientAuth();
      } else {
        openAuthModal("signup");
      }
    }
  };

  return (
    <>
      {isMobile ? (
        <View style={styles.appHeaderContainer}>
          <Modal
            visible={isSideBarVisible}
            transparent
            onRequestClose={() => setIsSideBarVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.mobileSidebar}>
                {resolvedIsDoctorPortal ? (
                  <NewestSidebar
                    navigation={navigation}
                    closeSidebar={() => setIsSideBarVisible(false)}
                  />
                ) : (
                  <SideBarNavigation
                    navigation={navigation}
                    closeSidebar={() => setIsSideBarVisible(false)}
                  />
                )}
              </View>
              <Pressable
                style={styles.overlay}
                onPress={() => setIsSideBarVisible(false)}
              />
            </View>
          </Modal>

          <View style={styles.appHeader}>
            <View style={styles.logo}>
              <Pressable
                style={styles.hamburger}
                onPress={() => setIsSideBarVisible(true)}
              >
                <MaterialIcons name="menu" size={30} color="black" />
              </Pressable>
              <Image
                source={require("../../assets/Icons/kokoro.png")}
                style={{ height: 30, width: 30 }}
              />
              <Text style={styles.appName}>Kokoro.Doctor</Text>
            </View>

            <View style={styles.authButtonsApp}>
              <View style={{ position: "relative" }}>
                <Pressable
                  style={styles.authButtonBox}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                  <Image source={avatarSource} style={styles.avatarSmall} />
                </Pressable>

                {dropdownVisible && (
                  <View style={styles.dropdownMain}>
                    {user ? (
                      <>
                        <TouchableOpacity
                          onPress={handleProfile}
                          style={styles.dropdownItem}
                        >
                          <MaterialIcons
                            name="person"
                            size={18}
                            color="#111827"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.dropdownText}>User Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleLogout}
                          style={styles.logoutButton}
                        >
                          <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => {
                          setDropdownVisible(false);
                          handleLoginSignupPress();
                        }}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && { backgroundColor: "#F3F4F6" },
                        ]}
                      >
                        <Text style={styles.dropdownText}>Login / Signup</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>

              {/* PORTAL TOGGLE BUTTONS FOR MOBILE */}
              {!resolvedIsDoctorPortal && !user && (
                <Pressable onPress={goToDoctorPortal}>
                  <Image
                    source={require("../../assets/Icons/DoctorPortalIcon.png")}
                    style={{ height: 40, width: 80 }}
                  />
                </Pressable>
              )}

              {resolvedIsDoctorPortal && !user && (
                <Pressable
                  style={styles.portalSwitchBox}
                  onPress={goToPatientPortal}
                >
                  <Text style={styles.portalSwitchText}>Patient Portal</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.usernameApp}>
            <Text style={{ fontWeight: "600", fontSize: 19 }}>Welcome,</Text>
            <Text
              style={{
                fontWeight: "800",
                color: "#000",
                fontSize: 19,
              }}
            >
              {user
                ? `${resolvedIsDoctorPortal ? " " : " "}${displayName}!`
                : " User!"}
            </Text>
          </View>
        </View>
      ) : user ? (
        // WEB VIEW - LOGGED IN
        <View style={styles.webHeaderShell}>
          <Text style={styles.webWelcome}>
            Welcome, <Text style={styles.webWelcomeName}>{displayName}</Text>
          </Text>

          <View style={styles.webProfileSection}>
            <TouchableOpacity
              style={styles.webProfileButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Image source={avatarSource} style={styles.avatar} />
            </TouchableOpacity>
            {dropdownVisible && (
              <>
                <Pressable
                  style={styles.dropdownOverlay}
                  onPress={() => setDropdownVisible(false)}
                />
                <View style={styles.webDropdownMenu}>
                  <TouchableOpacity
                    onPress={handleProfile}
                    style={styles.dropdownAction}
                  >
                    <MaterialIcons name="person" size={18} color="#111827" />
                    <Text style={styles.dropdownActionText}>User Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.dropdownAction}
                  >
                    <MaterialIcons name="logout" size={18} color="#f96166" />
                    <Text style={styles.dropdownActionText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      ) : (
        // WEB VIEW - NOT LOGGED IN
        <View style={styles.webHeaderNotLoggedIn}>
          {/* PORTAL TOGGLE BUTTONS FOR WEB - NOT LOGGED IN */}
          {!resolvedIsDoctorPortal && (
            <Pressable
              onPress={goToDoctorPortal}
              style={styles.webDoctorPortalButton}
            >
              <Text style={styles.webDoctorPortalText}>Doctor Portal</Text>
            </Pressable>
          )}

          {resolvedIsDoctorPortal && (
            <Pressable
              style={styles.webPortalSwitchBox}
              onPress={goToPatientPortal}
            >
              <Text style={styles.webPortalSwitchText}>Patient Portal</Text>
            </Pressable>
          )}

          <Animated.View
            style={[
              styles.headerBtn,
              {
                backgroundColor: isHovered ? "#f96166" : "#fff",
                borderColor: isHovered ? "#f96166" : "#DDD",
                transform: [{ scale: scaleAnim }],
              },
            ]}
            onMouseEnter={onHoverIn}
            onMouseLeave={onHoverOut}
          >
            <TouchableOpacity onPress={handleLoginSignupPress}>
              <Text
                style={[
                  styles.headerBtnText,
                  {
                    color: isHovered ? "#fff" : "#333",
                  },
                ]}
              >
                Login / Signup
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Patient Auth Modal - shows in Patient Navigator */}
      <PatientAuthModal
        visible={authModalVisible}
        initialMode={authModalMode}
        onRequestClose={closeAuthModal}
        onDoctorRegister={handleDoctorRegister}
      />

      {/* Doctor Auth Modal - shows in Doctor Navigator */}
      <DoctorAuthModal
        visible={doctorModalVisible}
        onRequestClose={() => setDoctorModalVisible(false)}
        initialMode="signup"
      />
    </>
  );
};

const styles = StyleSheet.create({
  appHeaderContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },
  mobileSidebar: {
    width: "75%",
    backgroundColor: "#fff",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hamburger: {
    padding: 4,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  authButtonsApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authButtonBox: {
    padding: 4,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  dropdownMain: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 180,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FEE2E2",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
    textAlign: "center",
  },
  portalSwitchBox: {
    backgroundColor: "#f96166",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  portalSwitchText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  usernameApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  webHeaderShell: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    // backgroundColor: "#fff",
    // borderBottomWidth: 1,
    // borderBottomColor: "#E5E7EB",
  },
  webWelcome: {
    fontSize: 20,
    color: "#fff",
  },
  webWelcomeName: {
    fontWeight: "700",
    color: "#fff",
  },
  webProfileSection: {
    position: "relative",
  },
  webProfileButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  webDropdownMenu: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minWidth: 200,
    zIndex: 1000,
  },
  dropdownAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownActionText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  webHeaderNotLoggedIn: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    //backgroundColor: "#fff",
    // borderBottomWidth: 1,
    // borderBottomColor: "#E5E7EB",
  },
  webDoctorPortalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f96166",
    backgroundColor: "#fff",
  },
  webDoctorPortalText: {
    color: "#f96166",
    fontSize: 14,
    fontWeight: "600",
  },
  webPortalSwitchBox: {
    backgroundColor: "#f96166",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  webPortalSwitchText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  headerBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HeaderLoginSignUp;

