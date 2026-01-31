/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Platform,
  Animated,
  Pressable,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Modal,
} from "react-native";
//gduywegduyxuygdusa
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import mixpanel from "../../utils/Mixpanel";

export default function WelcomePage() {
  const concerns = [
    "Chest Pain",
    "Irregular Heartbeat",
    "High BP",
    "Missed Periods",
    "PCOS Symptoms",
    "Pregnancy Concerns",
  ];
  const pillIcons = {
    "Chest Pain": "heart-outline",
    "Irregular Heartbeat": "heart-pulse",
    "High BP": "heart-plus-outline",
    "Missed Periods": "calendar-blank-outline",
    "PCOS Symptoms": "gender-female",
    "Pregnancy Concerns": "baby-face-outline",
  };
  const symptomPrompts = {
    "Chest Pain":
      "I am experiencing chest pain. Please ask me relevant medical questions to understand my condition.",
    "Irregular Heartbeat":
      "I have an irregular heartbeat. Please ask follow-up questions to assess my heart health.",
    "High BP":
      "I have high blood pressure readings. Please guide me with questions.",
    "Missed Periods":
      "I have missed my periods. Please ask questions to understand possible causes.",
    "PCOS Symptoms":
      "I am experiencing PCOS-related symptoms. Please ask relevant questions.",
    "Pregnancy Concerns":
      "I have concerns related to pregnancy. Please ask the necessary questions.",
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const [tryInput, setTryInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [doctorHover, setDoctorHover] = useState(false);
  const arrowTranslate = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const { width } = useWindowDimensions();
  const isMobile = Platform.OS !== "web" || width < 1000;
  const mobileConcerns = [
    "Chest Pain",
    "Irregular Heartbeat",
    "High BP",
    "Missed Periods",
    "Pregnancy Concerns",
  ];

  const animatedConcerns = isMobile ? mobileConcerns : concerns;

  const [activePill, setActivePill] = useState(0);

  const scaleAnim = useRef(
    animatedConcerns.map(() => new Animated.Value(1)),
  ).current;

  const isTyping = hasUserTyped;
  const isMobileWeb = Platform.OS === "web" && width < 1000;

  useEffect(() => {
    Animated.spring(arrowTranslate, {
      toValue: doctorHover ? 8 : 0, // ≈ 2% shift
      useNativeDriver: true,
    }).start();
  }, [arrowTranslate, doctorHover]);

  useEffect(() => {
    if (!hasUserTyped) {
      setTryInput(animatedConcerns[activePill]);
    }
  }, [activePill, hasUserTyped, animatedConcerns]);

  // ✅ AUTO ROTATE PILLS
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePill((prev) => (prev + 1) % animatedConcerns.length);
    }, 2700);

    return () => clearInterval(interval);
  }, [animatedConcerns.length]);

  // ✅ SCALE ACTIVE PILL
  useEffect(() => {
    scaleAnim.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === activePill ? 1.08 : 1,
        useNativeDriver: true,
      }).start();
    });
  }, [activePill, scaleAnim]);
  const renderMobilePill = (item, index) => {
    const isActive = index === activePill;

    return (
      <Pressable
        key={item}
        onPress={() => {
          setActivePill(index);

          navigation.navigate("PatientAppNavigation", {
            screen: "MobileChatbot",
            params: {
              presetPrompt: symptomPrompts[item],
              source: "symptom-pill",
            },
          });
        }}
      >
        <Animated.View
          style={[
            styles.pillWrapper,
            { transform: [{ scale: scaleAnim[index] }] },
          ]}
        >
          {isActive ? (
            <LinearGradient
              colors={["#F9A8D4", "#F472B6"]}
              style={styles.pillGradient}
            >
              <View style={styles.pillContent}>
                <MaterialCommunityIcons
                  name={pillIcons[item]}
                  size={14}
                  color="#7C1D9D"
                />
                <Text style={styles.pillActiveText}>{item.toLowerCase()}</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.pill}>
              <View style={styles.pillContent}>
                <MaterialCommunityIcons
                  name={pillIcons[item]}
                  size={14}
                  color="#6B7280"
                />
                <Text style={styles.pillText}>{item.toLowerCase()}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* ================= NAVBAR ================= */}
      <View style={styles.navbar}>
        <View style={styles.logoRow}>
          {/* <Image
            source={require("../../assets/Icons/newkokorologo.png")}
            style={styles.logo}
          /> */}
          <Image
            source={require("../../assets/Images/KokoroLogo.png")}
            style={styles.logo}
          />
          <View>
            <Text style={styles.logoText}>Kokoro.Doctor</Text>
            <Text style={styles.logoSub}>
              Trusted by doctors as their cloud clinic
            </Text>
          </View>
        </View>

            <View style={styles.navLinks}>
              {/* <NavHoverItem label="Women's Health" /> */}
              <NavHoverItem
                onPress={() => {
                  mixpanel.track("Welcome - Our Doctors Clicked", {
                    source: "navbar",
                    destination: "DoctorResultShow",
                  });

                  navigation.navigate("PatientAppNavigation", {
                    screen: "Doctors",
                    params: {
                      screen: "DoctorResultShow",
                    },
                  });
                }}
                label="Our Doctors"
              />

              {/* <NavHoverItem label="Heart Health" /> */}
            </View>

            <View style={styles.navActions}>
              <NavHoverItem
                label="Doctor Login"
                onPress={() =>
                  navigation.navigate("DoctorAppNavigation", {
                    screen: "DoctorPortalLandingPage",
                  })
                }
              />

              <HoverScaleTouchable
                text="Start Health Check"
                baseStyle={styles.startBtn}
                hoverStyle={styles.startBtnHover}
                textStyle={styles.startBtnText}
                onPress={() => {
                  mixpanel.track("Welcome - Start Health Check Clicked", {
                    source: "navbar",
                    destination: "MobileChatbot",
                  });

                  navigation.navigate("PatientAppNavigation", {
                    screen: "MobileChatbot",
                  });
                }}
              />
            </View>
          </View>

          {/* ================= HERO ================= */}
          <ScrollView
            contentContainerStyle={styles.heroContent}
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground
              source={require("../../assets/Images/newlandaingpagepic.jpg")}
              style={styles.hero}
              resizeMode="cover"
            >
              <LinearGradient
                pointerEvents="none" // 🔥 THIS IS THE KEY
                colors={[
                  "rgba(255,255,255,0.92)",
                  "rgba(255,255,255,0.85)",
                  "rgba(255,255,255,0.75)",
                ]}
                style={StyleSheet.absoluteFill}
              />

              {/* Badge */}
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={16} color="#EC4899" />
                <Text style={styles.badgeText}>
                  Built with doctors • Incubated at Harvard Innovation Labs
                </Text>
              </View>

              {/* Headline */}
              <Text style={styles.heading}>
                Not feeling well?{"\n"}
                <Text style={styles.headingPink}>
                  Start with your symptoms.
                </Text>
                {"\n"}We&apos;ll guide you.
              </Text>

              {/* Subtext */}
              <Text style={styles.subtext}>
                Share what you&apos;re experiencing. Our medical AI will ask the
                right questions
                {"\n"}
                and connect you with a trusted heart or women&apos;s health
                specialist if needed.
              </Text>

              {/* Pills */}
              {/* Pills */}
              <View style={styles.pillsContainer}>
                {/* First row (first 5 pills) */}
                <View style={styles.pillsRow}>
                  {concerns.slice(0, 5).map((item, index) => {
                    const isActive = index === activePill;

                    return (
                      <Pressable
                        key={item}
                        onPress={() => {
                          mixpanel.track("Welcome - Symptom Pill Clicked", {
                            symptom: item,
                            source: "pill",
                            destination: "MobileChatbot",
                          });

                          setActivePill(index);

                          navigation.navigate("PatientAppNavigation", {
                            screen: "MobileChatbot",
                            params: {
                              presetPrompt: symptomPrompts[item],
                              source: "symptom-pill",
                            },
                          });
                        }}
                      >
                        <Animated.View
                          style={[
                            styles.pillWrapper,
                            { transform: [{ scale: scaleAnim[index] }] },
                          ]}
                        >
                          {isActive ? (
                            <LinearGradient
                              colors={["#F9A8D4", "#F472B6"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.pillGradient}
                            >
                              <View style={styles.pillContent}>
                                <MaterialCommunityIcons
                                  name={pillIcons[item]}
                                  size={16}
                                  color="#7C1D9D"
                                />
                                <Text style={styles.pillActiveText}>
                                  {item.toLowerCase()}
                                </Text>
                              </View>
                            </LinearGradient>
                          ) : (
                            <View style={styles.pill}>
                              <View style={styles.pillContent}>
                                <MaterialCommunityIcons
                                  name={pillIcons[item]}
                                  size={16}
                                  color={isActive ? "#7C1D9D" : "#6B7280"}
                                />
                                <Text
                                  style={[
                                    styles.pillText,
                                    isActive && styles.pillActiveTextSmall,
                                  ]}
                                >
                                  {item.toLowerCase()}
                                </Text>
                              </View>
                            </View>
                          )}
                        </Animated.View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Second row (Pregnancy concerns centered) */}
                <View style={styles.pillsRowCenter}>
                  {(() => {
                    const index = 5;
                    const item = concerns[5];
                    const isActive = index === activePill;

                    return (
                      <Pressable onPress={() => setActivePill(index)}>
                        <Animated.View
                          style={[
                            styles.pillWrapper,
                            { transform: [{ scale: scaleAnim[index] }] },
                          ]}
                        >
                          {isActive ? (
                            <LinearGradient
                              colors={["#F9A8D4", "#F472B6"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.pillGradient}
                            >
                              <View style={styles.pillContent}>
                                <MaterialCommunityIcons
                                  name={pillIcons[item]}
                                  size={16}
                                  color="#7C1D9D"
                                />
                                <Text style={styles.pillActiveText}>
                                  {item.toLowerCase()}
                                </Text>
                              </View>
                            </LinearGradient>
                          ) : (
                            <View style={styles.pill}>
                              <View style={styles.pillContent}>
                                <MaterialCommunityIcons
                                  name={pillIcons[item]}
                                  size={16}
                                  color={isActive ? "#7C1D9D" : "#6B7280"}
                                />
                                <Text
                                  style={[
                                    styles.pillText,
                                    isActive && styles.pillActiveTextSmall,
                                  ]}
                                >
                                  {item.toLowerCase()}
                                </Text>
                              </View>
                            </View>
                          )}
                        </Animated.View>
                      </Pressable>
                    );
                  })()}
                </View>
              </View>

              {/* CTA Card */}
              <View style={styles.ctaCard}>
                <View style={styles.tryRow}>
                  <TouchableOpacity style={styles.arrowBox}>
                    <Ionicons name="arrow-up" size={26} color="#EC4899" />
                  </TouchableOpacity>

                  {/* Hide ONLY the "Try" label */}
                  {!isTyping && <Text style={styles.tryText}>Try</Text>}

                  {/* TextInput ALWAYS mounted */}
                  <TextInput
                    value={inputValue}
                    onChangeText={(text) => {
                      setInputValue(text);
                      setHasUserTyped(text.length > 0);
                    }}
                    onFocus={() => setHasUserTyped(true)}
                    onBlur={() => {
                      if (inputValue.trim() === "") {
                        setHasUserTyped(false);
                      }
                    }}
                    style={[
                      styles.tryInput,
                      isTyping && { marginLeft: 0 }, // optional polish
                    ]}
                    placeholder={tryInput}
                    placeholderTextColor="#EC4899"
                  />
                </View>

                <HoverScaleTouchable
                  text="Start Free Health Check →"
                  baseStyle={styles.ctaBtn}
                  hoverStyle={styles.ctaBtnHover}
                  textStyle={styles.ctaBtnText}
                  onPress={() => {
                    const textToSend = inputValue.trim();

                    mixpanel.track("Welcome - Free Health Check Started", {
                      source: "cta-card",
                      has_typed_text: !!textToSend,
                      text_length: textToSend.length,
                      destination: "MobileChatbot",
                    });

                    navigation.navigate("PatientAppNavigation", {
                      screen: "MobileChatbot",
                      params: {
                        presetPrompt: textToSend || null,
                        source: "free-text-input",
                      },
                    });
                  }}
                />
              </View>

              <View
                style={{
                  justifyContent: "center",
                  marginTop: "1%",
                  alignSelf: "center",
                }}
              >
                <Text style={{ color: "#EC4899", fontWeight: "500" }}>
                  No signup needed to start • Your data stays private
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  justifyContent: "center",
                  marginTop: "1%",
                  marginBottom: "2%",
                }}
              >
                <Text>Or</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    mixpanel.track("Welcome - Talk to Doctor Clicked", {
                      source: "footer-cta",
                      destination: "DoctorResultShow",
                    });

                    navigation.navigate("PatientAppNavigation", {
                      screen: "Doctors",
                      params: {
                        screen: "DoctorResultShow",
                      },
                    });
                  }}
                  onMouseEnter={
                    Platform.OS === "web"
                      ? () => setDoctorHover(true)
                      : undefined
                  }
                  onMouseLeave={
                    Platform.OS === "web"
                      ? () => setDoctorHover(false)
                      : undefined
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    cursor: Platform.OS === "web" ? "pointer" : "default",
                  }}
                >
                  <Text
                    style={{
                      color: doctorHover ? "#EC4899" : "#F472B6",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Talk to a Doctor Now
                  </Text>

                  <Animated.Text
                    style={{
                      marginLeft: 6,
                      color: doctorHover ? "#EC4899" : "#F472B6",
                      transform: [{ translateX: arrowTranslate }],
                      fontWeight: "600",
                    }}
                  >
                    →
                  </Animated.Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </ScrollView>
        </View>
      )}

      {(Platform.OS !== "web" || width < 1000) && (
        <View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ backgroundColor: "#FFF" }}
          >
            <View>
              <Image
                source={require("../../assets/Images/newlandaingpagepic.jpg")}
                resizeMode="cover"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.95)",
                  "rgba(255,255,255,0.85)",
                  "rgba(255,255,255,0.75)",
                ]}
                style={StyleSheet.absoluteFill}
              />

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingTop: 32,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={require("../../assets/Icons/newkokorologo.png")}
                    style={{ width: 32, height: 32, marginRight: 8 }}
                  />
                  <Text style={{ fontWeight: "700", fontSize: 16 }}>
                    Kokoro.Doctor
                  </Text>
                </View>
                <Pressable onPress={() => setMenuVisible(true)}>
                  <Ionicons name="menu" size={26} color="#000" />
                </Pressable>
              </View>

              {/* Content */}
              <View style={{ paddingHorizontal: 20, marginTop: 30 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "800",
                    textAlign: "center",
                    color: "#111",
                    lineHeight: 40,
                  }}
                >
                  Not feeling well?{"\n"}
                  <Text style={{ color: "#C084FC" }}>
                    Start with your symptoms.
                  </Text>
                  {"\n"}We'll guide you.
                </Text>

                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 14,
                    color: "#6B7280",
                    fontSize: 15,
                    lineHeight: 22,
                  }}
                >
                  Share what you're experiencing. Our medical AI will ask the
                  right questions and connect you with a trusted heart or
                  women's health specialist if needed.
                </Text>

                {/* Badge */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center",
                    marginTop: 20,
                    paddingHorizontal: 6,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    backgroundColor: "#FFF",
                    gap: 6,
                  }}
                >
                  <Ionicons name="shield-checkmark" size={14} color="#EC4899" />
                  <Text style={{ fontSize: 12 }}>
                    built with doctors • Incubated at Harvard Innovation Labs
                  </Text>
                </View>

                {/* Pills */}

                <View style={{ marginTop: 28, alignItems: "center" }}>
                  <View style={styles.pillRow}>
                    {mobileConcerns
                      .slice(0, 2)
                      .map((item, index) => renderMobilePill(item, index))}
                  </View>

                  {/* Row 2 */}
                  <View style={styles.pillRow}>
                    {mobileConcerns
                      .slice(2, 4)
                      .map((item, index) => renderMobilePill(item, index + 2))}
                  </View>

                  {/* Row 3 */}
                  <View style={styles.pillRow}>
                    {renderMobilePill(mobileConcerns[4], 4)}
                  </View>
                </View>

                {/* Try input */}
                <View
                  style={{
                    marginTop: 30,
                    backgroundColor: "#FFF",
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: "#F5F3FF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="arrow-up" size={22} color="#EC4899" />
                  </View>

                  {!isTyping && <Text style={{ color: "#6B7280" }}>Try</Text>}

                  <TextInput
                    value={inputValue}
                    onChangeText={(text) => {
                      setInputValue(text);
                      setHasUserTyped(text.length > 0);
                    }}
                    placeholder={tryInput}
                    placeholderTextColor="#EC4899"
                    style={{
                      flex: 1,
                      fontWeight: "600",
                      color: "#EC4899",

                      // 🔥 spacing inside input
                      paddingHorizontal: 14,
                      paddingVertical: 12,

                      // 🔥 border
                      borderWidth: 1,
                      borderColor: "#AAAAAA",
                      borderRadius: 12,
                    }}
                  />
                </View>

                {/* CTA */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    navigation.navigate("PatientAppNavigation", {
                      screen: "MobileChatbot",
                      params: {
                        presetPrompt: inputValue || null,
                        source: "free-text-input",
                      },
                    });
                  }}
                  style={{
                    marginTop: 18,
                    backgroundColor: "#F472B6",
                    paddingVertical: 16,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#FFF",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    Start Free Health Check →
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                <Text
                  style={{
                    marginTop: 14,
                    textAlign: "center",
                    color: "#EC4899",
                    fontSize: 12,
                  }}
                >
                  No signup needed to start • Your data stays private
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("PatientAppNavigation", {
                      screen: "Doctors",
                      params: { screen: "DoctorResultShow" },
                    })
                  }
                  style={{
                    marginTop: "5%",
                    alignItems: "center",
                    marginBottom: "18%",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#F472B6", fontWeight: "600" }}>
                    Or{" "}
                  </Text>
                  <Text style={{ color: "#F472B6", fontWeight: "600" }}>
                    Talk to Doctor Now →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
      {menuVisible && isMobile && (
        <Modal transparent animationType="fade">
          {/* Overlay */}
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          />

          {/* Dropdown */}
          <View style={styles.menuDropdown}>
            <Text style={styles.menuTitle}>Menu</Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);

                mixpanel.track("Mobile Menu - Our Doctors Clicked", {
                  source: "mobile-menu",
                });

                navigation.navigate("PatientAppNavigation", {
                  screen: "Doctors",
                  params: {
                    screen: "DoctorResultShow",
                  },
                });
              }}
            >
              <Text style={styles.menuText}>Our Doctors</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);

                mixpanel.track("Mobile Menu - Doctor Login Clicked", {
                  source: "mobile-menu",
                });

                navigation.navigate("DoctorAppNavigation", {
                  screen: "DoctorPortalLandingPage",
                });
              }}
            >
              <Text style={styles.menuText}>Doctor Login</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </>
  );
}

/* ================= COMPONENT ================= */
function NavHoverItem({ label, onPress }) {
  const [hovered, setHovered] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onMouseEnter={Platform.OS === "web" ? () => setHovered(true) : undefined}
      onMouseLeave={Platform.OS === "web" ? () => setHovered(false) : undefined}
      style={{ cursor: Platform.OS === "web" ? "pointer" : "default" }}
    >
      <Text style={[styles.navText, hovered && styles.navTextHover]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function HoverScaleTouchable({
  text,
  baseStyle,
  hoverStyle,
  textStyle,
  onPress,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onMouseEnter={
        Platform.OS === "web"
          ? () => {
              setHovered(true);
              Animated.spring(scale, {
                toValue: 1.07,
                useNativeDriver: true,
              }).start();
            }
          : undefined
      }
      onMouseLeave={
        Platform.OS === "web"
          ? () => {
              setHovered(false);
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            }
          : undefined
      }
      style={{ cursor: Platform.OS === "web" ? "pointer" : "default" }}
    >
      <Animated.View
        style={[baseStyle, hovered && hoverStyle, { transform: [{ scale }] }]}
      >
        <Text style={textStyle}>{text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  startBtnHover: {
    backgroundColor: "#EC4899", // darker pink
  },
  tryInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EC4899",
    minWidth: 390,
    padding: 0,
    marginLeft: 4,
    // Web only
    outlineStyle: "none",
    borderWidth: 1,
    borderColor: "#c5c4c4ff",
    borderRadius: 10,
    minHeight: 43,
  },
  pillsContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  menuDropdown: {
    position: "absolute",
    top: 70, // just below header
    right: 16,
    width: 220,
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingVertical: 8,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },

  ctaBtnHover: {
    backgroundColor: "#EC4899", // darker pink
  },
  pillWrapper: {
    borderRadius: 999,
  },

  pillGradient: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },

  pillActiveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C1D9D",
  },

  /* NAVBAR */
  navbar: {
    // marginTop:"1%",
    height: "10%",
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 32,

    backgroundColor: "#FFF",
    justifyContent: "space-between",
  },
  logoRow: {
    marginLeft: "6%",
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  logoSub: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  navLinks: {
    flexDirection: "row",
    gap: 28,
    //borderWidth:1,
    marginLeft: "50%",
  },
  navText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  navTextHover: {
    color: "#000",
  },
  navActions: {
    marginRight: "6%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  loginText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  startBtn: {
    backgroundColor: "#F472B6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  startBtnText: {
    color: "#FFF",
    fontWeight: "600",
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  /* HERO */
  hero: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  arrowBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F5F3FF", // very light lavender
    alignItems: "center",
    justifyContent: "center",

    // shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    // shadow (Android)
    elevation: 4,
  },
  heroContent: {
    // flex:1,
    height: "auto",
    // paddingHorizontal: 32,
    // paddingTop: 60,
    // paddingBottom: 80,
    // maxWidth: 1100,
    // alignSelf: "center",
  },

  badge: {
    marginTop: "4%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  badgeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },

  heading: {
    fontSize: Platform.OS === "web" ? 56 : 38,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: Platform.OS === "web" ? 68 : 46,
    marginBottom: 24,
  },
  headingPink: {
    color: "#C084FC",
  },

  subtext: {
    textAlign: "center",
    fontSize: 20,
    color: "#6B7280",
    maxWidth: 720,
    alignSelf: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: "400",
  },

  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 10,
  },
  pillsRowCenter: {
    flexDirection: "row",
    justifyContent: "center",
  },

  pill: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#FFF",
  },
  pillActiveTextSmall: {
    color: "#7C1D9D",
    fontWeight: "600",
  },
  pillActive: {
    backgroundColor: "#F472B6",
    borderColor: "#F472B6",
  },
  pillText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },

  ctaCard: {
    width: "50%",
    alignSelf: "center",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  tryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tryText: {
    marginLeft: "2%",
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "400",
  },
  pillRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },

  tryPink: {
    color: "#EC4899",
    fontWeight: "600",
  },

  ctaBtn: {
    backgroundColor: "#F472B6",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 999,
  },
  ctaBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
