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
} from "react-native";
//yes
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
//import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function NewMedicineLandingPagey() {
  const [hovered, setHovered] = useState(false);
  const [medicine, setMedicine] = useState("");
  const [uploadHovered, setUploadHovered] = useState(false);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <ScrollView
          contentContainerStyle={styles.heroContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* ================= HERO ================= */}

            <ImageBackground
              source={require("../assets/Images/newlandaingpagepic.jpg")}
              style={styles.hero}
              resizeMode="cover"
            >
              {/* Soft white overlay */}
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.85)",
                  "rgba(255,255,255,0.75)",
                  "rgba(255,255,255,0.45)",
                ]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.heroRow}>
                {/* LEFT SIDE */}
                <View style={styles.leftContent}>
                  <View style={styles.leftBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color="#EC4899"
                    />
                    <Text style={styles.leftBadgeText}>
                      Built with doctors, not generic AI
                    </Text>
                  </View>

                  <Text style={styles.leftTitle}>
                    Confused about your{"\n"}
                    <Text style={styles.leftTitleBold}>medicines?</Text>
                  </Text>

                  <Text style={styles.leftSubtitle}>
                    Get free medical help in seconds. No waiting.
                  </Text>

                  <View style={styles.leftPoints}>
                    <View style={styles.leftPoint}>
                      <View style={styles.leftIconBox}>
                        <Ionicons
                          name="camera-outline"
                          size={20}
                          color="#EC4899"
                        />
                      </View>
                      <View>
                        <Text style={styles.leftPointText}>
                          Upload prescription or medicine
                        </Text>
                        <Text style={styles.leftPointSub}>
                          Photo, PDF, or discharge summary
                        </Text>
                      </View>
                    </View>

                    <View style={styles.leftPoint}>
                      <View style={styles.leftIconBox}>
                        <Image
                          source={require("../assets/DoctorsPortal/Icons/Prescription-icon.png")}
                          style={styles.uploadIcon}
                        />
                      </View>
                      <View>
                        <Text style={styles.leftPointText}>
                          AI reviews like a doctor
                        </Text>
                        <Text style={styles.leftPointSub}>
                          Checks names, doses, purpose.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.leftPoint}>
                      <View style={styles.leftIconBox}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#EC4899"
                        />
                      </View>
                      <View>
                        <Text style={styles.leftPointText}>
                          Clear answers, no waiting
                        </Text>
                        <Text style={styles.leftPointSub}>
                          How to take it, what to watch for.
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.leftFooterBadge}>
                    <Ionicons name="school-outline" size={14} color="#6B7280" />
                    <Text style={styles.leftFooterText}>
                      Incubated at Harvard Innovation Labs
                    </Text>
                  </View>
                </View>

                {/* RIGHT SIDE (UNCHANGED CARD) */}
                <View style={styles.prescriptionWrapper}>
                  <View style={styles.badge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#EC4899"
                    />
                    <Text style={styles.badgeText}>
                      Built with doctors • not generic AI
                    </Text>
                  </View>

                  {/* Headline */}
                  <View>
                    <Text style={styles.heading}>
                      Understand your prescription{"\n"}
                      <Text style={styles.headingPink}>for free</Text>
                      <Text style={{ fontSize: 23, fontWeight: 400 }}>
                        {"\n"}Great for quick doubts about medicines, dosage,
                        and reports.
                      </Text>
                    </Text>
                  </View>

                  {/* Search */}
                  <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={18} color="#9CA3AF" />

                    <TextInput
                      placeholder="Type your medicine name..."
                      placeholderTextColor="#9CA3AF"
                      style={styles.searchInput}
                      value={medicine}
                      onChangeText={setMedicine}
                    />

                    {/* Check button appears ONLY when text exists */}
                    {medicine.trim().length > 0 && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          const textToSend = medicine.trim();

                          navigation.navigate("PatientAppNavigation", {
                            screen: "MobileChatbot",
                            params: {
                              presetPrompt: textToSend || null,
                              source: "medicine-input",
                            },
                          });
                        }}
                        style={styles.checkBtn}
                      >
                        <LinearGradient
                          colors={["#F472B6", "#FB7185"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.checkBtnGradient}
                        >
                          <Text style={styles.checkBtnText}>
                            Check Medicine →
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View>
                    <Text style={styles.helperText}>
                      Quick answers for single-medicine doubts (dose, timing,
                      side effects).
                    </Text>
                  </View>

                  {/* Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                      or upload prescription
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Upload Card */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      navigation.navigate("DoctorAppNavigation", {
                        screen: "Prescription",
                      });
                    }}
                    onMouseEnter={
                      Platform.OS === "web"
                        ? () => setUploadHovered(true)
                        : undefined
                    }
                    onMouseLeave={
                      Platform.OS === "web"
                        ? () => setUploadHovered(false)
                        : undefined
                    }
                    style={[
                      styles.uploadCard,
                      uploadHovered && styles.uploadCardHover,
                      { cursor: Platform.OS === "web" ? "pointer" : "default" },
                    ]}
                  >
                    <View style={styles.uploadIcons}>
                      <Image
                        source={require("../assets/DoctorsPortal/Icons/plusSign.png")}
                        style={styles.uploadIcon}
                      />
                    </View>

                    <Text style={styles.uploadTitle}>
                      Upload a prescription or medicine strip
                    </Text>
                    <Text style={styles.uploadSub}>
                      We&apos;ll explain it in simple language
                    </Text>

                    <Text style={styles.uploadMeta}>
                      JPG, PNG, HEIC, PDF • Max 10 MB • Up to 3 pages
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.noQueue}>
                    No queues. No appointment. Just clarity.
                  </Text>

                  {/* CTA */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      navigation.navigate("DoctorAppNavigation", {
                        screen: "Prescription",
                      });
                    }}
                    onMouseEnter={
                      Platform.OS === "web" ? () => setHovered(true) : undefined
                    }
                    onMouseLeave={
                      Platform.OS === "web"
                        ? () => setHovered(false)
                        : undefined
                    }
                    style={[
                      styles.analyzeBtn,
                      hovered && styles.analyzeBtnHover,
                      { cursor: Platform.OS === "web" ? "pointer" : "default" },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        hovered
                          ? ["#EC4899", "#F43F5E"]
                          : ["#F472B6", "#FB7185"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientFill}
                    >
                      <Text style={styles.analyzeText}>
                        Generate Free Prescription Now →
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Best for */}
                  {/* Best for Card */}
                  <View style={styles.bestForCard}>
                    <Text style={styles.bestForTitle}>Best for:</Text>

                    <View style={styles.bestForChips}>
                      {[
                        "Dosage confusion",
                        "Missed dose questions",
                        "Side-effect doubts",
                        "Discharge summaries",
                      ].map((item) => (
                        <View key={item} style={styles.bestForChip}>
                          <Text style={styles.bestForChipText}>{item}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.warningRow}>
                      <Text style={styles.warningIcon}>⚠️</Text>
                      <Text style={styles.warningText}>
                        Not for emergencies.
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginTop: "2%" }}>
                    <Text style={styles.footerNote}>
                      🔒 No signup needed to start • Your data stays private
                    </Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </ScrollView>
      )}

      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView
          contentContainerStyle={{
            backgroundColor: "#FFF",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Image
              source={require("../assets/Images/newlandaingpagepic.jpg")}
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

            <View
              style={{
                flexDirection: "row",
                paddingTop: "9%",
                paddingLeft: "3%",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Image
                  source={require("../assets/Images/KokoroLogo.png")}
                  style={{ width: 18, height: 18 }}
                />
                <Text style={{ fontWeight: "700", fontSize: 16 }}>
                  Kokoro.Doctor
                </Text>
              </View>
            </View>

            {/* Badge */}
            <View style={[styles.badge, { marginTop: "6%" }]}>
              <Ionicons name="shield-checkmark" size={14} color="#EC4899" />
              <Text style={styles.badgeText}>
                Built with doctors • not generic AI
              </Text>
            </View>

            {/* Heading */}
            <View style={{ marginTop: "1%" }}>
              <Text style={[styles.heading, { fontSize: 26, lineHeight: 34 }]}>
                Understand your prescription{"\n"}
                <Text style={{ color: "#000" }}>for free</Text>
              </Text>
            </View>

            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#6B7280",
                marginTop: 8,
                marginBottom: 20,
                paddingHorizontal: 10,
              }}
            >
              Great for quick doubts about medicines,{"\n"} dosage, and reports.
            </Text>

            {/* Search */}
            <View
              style={{
                marginLeft: "4%",
                marginRight: "4%",
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                paddingLeft: 14,
                height: 52,
              }}
            >
              <TextInput
                placeholder="Type your medicine name..."
                placeholderTextColor="#9CA3AF"
                value={medicine}
                onChangeText={setMedicine}
                style={{
                  flex: 1,
                  fontSize: 18,
                  color: "#111827",
                  fontWeight: 500,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  outlineStyle: "none", // removes browser focus ring
                  boxShadow: "none", // removes chrome focus glow
                }}
              />

              {/* Search button */}
              <TouchableOpacity
                onPress={() => {
                  const textToSend = medicine.trim();

                  navigation.navigate("PatientAppNavigation", {
                    screen: "MobileChatbot",
                    params: {
                      presetPrompt: textToSend || null,
                      source: "medicine-input",
                    },
                  });
                }}
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 6,
                  borderRadius: 10,
                  backgroundColor: "#F3E8FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="search-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={styles.helperTexts}>
                Quick answers for single-medicine doubts {"\n"}(dose, timing,
                side effects).
              </Text>
            </View>

            <View
              style={[
                styles.dividerRow,
                { marginLeft: "4%", marginRight: "4%" },
              ]}
            >
              <View style={styles.dividerLines} />
              <Text style={styles.dividerTexts}>or upload prescription</Text>
              <View style={styles.dividerLines} />
            </View>

            {/* Upload Card */}
            <View
              style={{ marginTop: "4%", marginLeft: "4%", marginRight: "4%" }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.uploadCard}
                onPress={() => {
                  navigation.navigate("DoctorAppNavigation", {
                    screen: "Prescription",
                  });
                }}
              >
                <Text style={styles.uploadTitles}>
                  Upload a prescription {"\n"}or medicine strip
                </Text>

                <Text style={styles.uploadSub}>
                  We&apos;ll explain it in simple language
                </Text>

                <View style={styles.uploadIconss}>
                  <Image
                    source={require("../assets/DoctorsPortal/Icons/plusSign.png")}
                    style={{ width: 65, height: 65 }}
                  />
                </View>

                <Text style={styles.uploadMeta}>
                  JPG, PNG, HEIC, PDF • Max 10 MB • Up to 3 pages
                </Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.analyzeBtn,
                { marginTop: "4%", marginLeft: "4%", marginRight: "4%" },
              ]}
              onPress={() => {
                navigation.navigate("DoctorAppNavigation", {
                  screen: "Prescription",
                });
              }}
            >
              <LinearGradient
                colors={["#F472B6", "#FB7185"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientFill}
              >
                <Text style={styles.analyzeText}>
                  Analyze My Prescription →
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Best for */}
            <View style={styles.bestForCards}>
              <View style={{ marginLeft: "4%" }}>
                <Text style={styles.bestForTitle}>Best for:</Text>
              </View>

              <View style={styles.bestForChips}>
                {[
                  "Dosage confusion",
                  "Missed dose questions",
                  "Side-effect doubts",
                  "Discharge summaries",
                ].map((item) => (
                  <View key={item} style={styles.bestForChip}>
                    <Text style={styles.bestForChipText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.warningRow, { marginLeft: "4%" }]}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>Not for emergencies</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </>
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
    minWidth: 120,
    padding: 0,
    marginLeft: 4,

    // Web only
    outlineStyle: "none",
  },
  pillsContainer: {
    alignItems: "center",
    marginBottom: 32,
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
  },
  navText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
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
    backgroundColor: "#FFE4E6",
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
    fontSize: Platform.OS === "web" ? 40 : 38,
    fontWeight: "800",
    color: "#E77381",
    textAlign: "center",
    // lineHeight: Platform.OS === "web" ? 68 : 46,
    // marginBottom: 24,
  },
  headingPink: {
    fontSize: 34,
    color: "#000",
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
  // prescriptionWrapper: {
  //   width: "55%",
  //   alignSelf: "center",
  //   marginTop: 40,
  //   backgroundColor: "#FFF",
  //   borderRadius: 20,
  //   padding: 20,
  //   paddingHorizontal: 30,
  //   shadowColor: "#000",
  //   shadowOpacity: 0.08,
  //   shadowRadius: 18,
  //   elevation: 6,
  //   marginBottom: "2%",
  // },
  prescriptionWrapper: {
    width: Platform.OS === "web" ? "55%" : "100%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#F3E8FF",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: "2%",
  },

  searchInput: {
    flex: 1,
    fontWeight: 500,
    fontSize: 18,
    color: "#111827",
    outlineStyle: "none",
  },

  helperText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: "1%",
    marginLeft: "1%",
  },
  helperTexts: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: "1%",
    marginLeft: "1%",
    textAlign: "center",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerLines: {
    flex: 1,
    height: 1,
    backgroundColor: "#E77381",
  },

  dividerTexts: {
    fontWeight: 500,
    marginHorizontal: 10,
    fontSize: 16,
    color: "#FB7185",
  },
  dividerText: {
    fontWeight: 500,
    marginHorizontal: 10,
    fontSize: 12,
    color: "#000",
  },

  uploadCard: {
    fontWeight: 500,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E77381",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  uploadIcons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  uploadIconss: {
    flexDirection: "row",
    gap: 12,
    marginBottom: "4%",
    marginTop: "3%",
  },

  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  uploadTitles: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },

  uploadSub: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  uploadActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },

  uploadAction: {
    fontSize: 14,
    color: "#EC4899",
    fontWeight: "600",
  },

  uploadMeta: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 10,
  },

  noQueue: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginVertical: 14,
  },

  // analyzeBtn: {
  //   borderRadius: 999,
  //   paddingVertical: 14,
  //   alignItems: "center",
  //   marginBottom: 20,
  // },

  analyzeText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  bestFor: {
    marginBottom: 16,
  },

  // bestForTitle: {
  //   fontSize: 14,
  //   fontWeight: "600",
  //   marginBottom: 8,
  // },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    backgroundColor: "#FDF2F8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  chipText: {
    fontSize: 12,
    color: "#EC4899",
    fontWeight: "600",
  },

  warning: {
    marginTop: 10,
    fontSize: 13,
    color: "#EF4444",
  },

  footerNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
  },
  analyzeBtn: {
    borderRadius: 999,
    overflow: "hidden", // IMPORTANT for gradient
    marginBottom: 20,
  },

  analyzeBtnHover: {
    transform: [{ scale: 1.04 }],
  },

  gradientFill: {
    paddingVertical: 14,
    alignItems: "center",
  },
  checkBtn: {
    marginLeft: 8,
    borderRadius: 999,
    overflow: "hidden",
  },

  checkBtnGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  checkBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  bestForCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#FFF5F7", // soft pink background
    borderWidth: 1,
    borderColor: "#FFE4E6",

    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bestForCards: {
    marginTop: "4%",
    marginLeft: "4%",
    marginRight: "4%",
    marginBottom: "6%",
    padding: "2%",
    borderRadius: 18,
    backgroundColor: "#FFF5F7", // soft pink background
    borderWidth: 1,
    borderColor: "#FFE4E6",

    // subtle shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  bestForTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },

  bestForChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  bestForChip: {
    backgroundColor: "#FFE4E6",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FBCFE8",
  },

  bestForChipText: {
    fontSize: 13,
    color: "#F43F5E",
    fontWeight: "500",
  },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },

  warningIcon: {
    fontSize: 14,
  },

  warningText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
  },
  uploadCardHover: {
    backgroundColor: "#FFF5F7",
    borderColor: "#FBCFE8",
  },
  heroRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "flex-start", // ⬅️ KEY FIX
    justifyContent: "space-between",
    paddingHorizontal: "6%",
    paddingTop: 40, // ⬅️ control top spacing here
    paddingBottom: 80,
  },

  /* LEFT SIDE */
  leftContent: {
    width: Platform.OS === "web" ? "45%" : "100%",
    marginTop: "5%",
    paddingRight: 40,
  },

  leftBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF5F7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    marginBottom: 20,
  },

  leftBadgeText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  leftTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 50,
  },

  leftTitleBold: {
    color: "#000",
  },

  leftSubtitle: {
    fontSize: 18,
    color: "#000",
    marginTop: 16,
    marginBottom: 28,
    fontWeight: 500,
  },

  leftPoints: {
    alignItems: "flex-start",
    gap: 16,
  },

  leftPoint: {
    flexDirection: "row",
    alignItems: "flex-start", // IMPORTANT
    gap: 14,
  },

  leftPointText: {
    fontSize: 28,
    color: "#374151",
    fontWeight: "500",
  },

  leftFooterBadge: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFFAA",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },

  leftFooterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  leftIconBox: {
    marginTop: "2%",
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFE4E6", // soft pink like image
    alignItems: "center",
    justifyContent: "center",

    // subtle shadow like image
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  leftPointSub: {
    fontSize: 18,
    fontWeight: 400,
    color: "#000",
    marginTop: 2,
  },
});
