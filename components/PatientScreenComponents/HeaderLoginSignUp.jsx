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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import { useLoginModal } from "../../contexts/LoginModalContext";
// eslint-disable-next-line import/namespace
import { useAuth } from "../../contexts/AuthContext";
import PatientAuthModal from "../Auth/PatientAuthModal";
import DoctorSignupModal from "../Auth/DoctorSignupModal";

const HeaderLoginSignUp = ({ isDoctorPortal = false, user }) => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSideBarVisible, setIsSideBarVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const { registerOpenModal } = useLoginModal();
  const { logout } = useAuth();

  const isApp = Platform.OS === "ios" || Platform.OS === "android";
  const isSmallScreen =
    Platform.OS === "web" && Dimensions.get("window").width <= 820;
  const isMobile = isApp || isSmallScreen;

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setAuthModalVisible(true);
  }, []);

  const closeAuthModal = () => {
    setAuthModalVisible(false);
  };

  useEffect(() => {
    registerOpenModal(({ mode = "login" } = {}) => {
      openAuthModal(mode);
    });
  }, [registerOpenModal, openAuthModal]);

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
                {isDoctorPortal ? (
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
                  <MaterialIcons name="person" size={30} color="black" />
                </Pressable>

                {dropdownVisible && (
                  <View style={styles.dropdownMain}>
                    {user ? (
                      <>
                        <View style={styles.userInfoContainer}>
                          <Text style={styles.userNameText}>
                            {user?.name || "User"}
                          </Text>
                          {user?.email && (
                            <Text style={styles.userEmailText}>
                              {user.email}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={handleLogout}
                          style={styles.logoutButton}
                        >
                          <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setDropdownVisible(false);
                          openAuthModal("login");
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownText}>Login / Signup</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              <Pressable>
                <MaterialIcons name="notifications" size={30} color="black" />
              </Pressable>
            </View>
          </View>

          {!isDoctorPortal && (
            <View style={styles.usernameApp}>
              <Text style={{ fontWeight: "600", fontSize: 19 }}>Hello,</Text>
              <Text
                style={{
                  fontWeight: "800",
                  color: "#000",
                  fontSize: 19,
                }}
              >
                {" "}
                {user?.name ? user?.name : "User"}!
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {user ? (
            <View style={{ position: "relative" }}>
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
                <TouchableOpacity
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.headerBtnText,
                      {
                        color: isHovered ? "#fff" : "#333",
                      },
                    ]}
                  >
                    {user?.name || "User"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
              {dropdownVisible && (
                <>
                  <Pressable
                    style={styles.dropdownOverlay}
                    onPress={() => setDropdownVisible(false)}
                  />
                  <View style={styles.webDropdown}>
                    <View style={styles.userInfoContainer}>
                      <Text style={styles.userNameText}>
                        {user?.name || "User"}
                      </Text>
                      {user?.email && (
                        <Text style={styles.userEmailText}>{user.email}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={handleLogout}
                      style={styles.logoutButton}
                    >
                      <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : (
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
              <TouchableOpacity onPress={() => openAuthModal("login")}>
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
          )}
        </>
      )}

      <PatientAuthModal
        visible={authModalVisible}
        initialMode={authModalMode}
        onRequestClose={closeAuthModal}
        onDoctorRegister={handleDoctorRegister}
      />
      <DoctorSignupModal
        visible={doctorModalVisible}
        onRequestClose={() => setDoctorModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 16,
    marginVertical: 8,
    minWidth: 140,
    alignSelf: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtnText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
  },
  appHeaderContainer: {
    backgroundColor: "#fff",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  hamburger: {
    marginRight: 10,
  },
  appName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#000",
    marginLeft: 6,
  },
  authButtonsApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 10,
  },
  authButtonBox: {
    padding: 4,
    borderRadius: 8,
  },
  dropdownMain: {
    position: "absolute",
    right: 0,
    top: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 8,
    minWidth: 160,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  usernameApp: {
    marginTop: 5,
    flexDirection: "row",
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },
  mobileSidebar: {
    width: "75%",
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  webDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
    zIndex: 1000,
  },
  userInfoContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userEmailText: {
    fontSize: 12,
    color: "#6B7280",
  },
  logoutButton: {
    padding: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
});

export default HeaderLoginSignUp;