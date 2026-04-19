import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import HospitalAuthModal from "../../components/Auth/HospitalAuthModal";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import mixpanel from "../../utils/Mixpanel";

// ─── Inline Animated Analyze Button ───────────────────────────────────────────
function AnalyzeButton({
  onPress,
  label = "Analyze your insurance claim now →",
}) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const scanY = useRef(new Animated.Value(-4)).current;
  const [btnState, setBtnState] = useState("idle"); // idle | loading | success

  /* shimmer sweep */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
      ]),
    ).start();
  }, []);

  /* pulse rings */
  useEffect(() => {
    const makePulse = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    makePulse(pulse1, 0).start();
    makePulse(pulse2, 800).start();
  }, []);

  /* scan line */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, {
          toValue: 4,
          duration: 250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanY, {
          toValue: -4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    setBtnState("loading");
    setTimeout(() => {
      setBtnState("success");
      setTimeout(() => setBtnState("idle"), 2000);
    }, 1800);
    onPress?.();
  };

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 320],
  });

  const makePulseStyle = (anim) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.45, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.28] }),
      },
    ],
  });

  const bgColor = btnState === "success" ? "#10b981" : "#004989";

  const displayLabel =
    btnState === "loading"
      ? "Analyzing…"
      : btnState === "success"
        ? "✓ Analysis Complete"
        : label;

  return (
    <View style={ab.wrapper}>
      {/* pulse ring 1 */}
      <Animated.View
        style={[ab.pulseRing, makePulseStyle(pulse1)]}
        pointerEvents="none"
      />
      {/* pulse ring 2 */}
      <Animated.View
        style={[ab.pulseRing, makePulseStyle(pulse2)]}
        pointerEvents="none"
      />

      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={handlePress}
          style={[ab.btn, { backgroundColor: bgColor }]}
          android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: false }}
        >
          {/* shimmer sweep */}
          <Animated.View
            style={[ab.shimmer, { transform: [{ translateX: shimmerX }] }]}
            pointerEvents="none"
          />

          {/* doc + scan icon */}
          {btnState === "idle" || btnState === "success" ? (
            <View style={ab.iconWrap}>
              <View style={ab.docOuter}>
                <View style={ab.docLine} />
                <View style={[ab.docLine, { width: 10 }]} />
              </View>
              <Animated.View
                style={[ab.scanLine, { transform: [{ translateY: scanY }] }]}
              />
            </View>
          ) : (
            /* spinner for loading */
            <Animated.View
              style={[
                ab.spinner,
                {
                  transform: [
                    {
                      rotate: shimmer.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}

          <Text style={ab.btnText}>{displayLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const ab = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
    position: "relative",
    marginVertical: 8,
  },
  pulseRing: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(30,136,229,0.55)",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#1e88e5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.22)",
    transform: [{ skewX: "-20deg" }],
  },
  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  iconWrap: {
    width: 22,
    height: 22,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  docOuter: {
    width: 18,
    height: 16,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  docLine: {
    height: 1.5,
    width: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 1,
  },
  scanLine: {
    position: "absolute",
    left: 1,
    right: 1,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 1,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderTopColor: "#ffffff",
  },
});
// ──────────────────────────────────────────────────────────────────────────────

export default function HeroSection({ navigation: navigationProp }) {
  const [hospitalModalVisible, setHospitalModalVisible] = useState(false);
  const [comingSoonModalVisible, setComingSoonModalVisible] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();
  const scrollViewRef = useRef(null);
  const processSectionRef = useRef(null);
  const ctaSectionRef = useRef(null);

  React.useEffect(() => {
    mixpanel.track("Hospital Welcome Page Viewed", {
      page: "WelcomeHospital",
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleSignIn = () => {
    mixpanel.track("Hospital Sign In Button Clicked", {
      source: "WelcomeHospital",
      button_type: "primary",
      timestamp: new Date().toISOString(),
    });
    setHospitalModalVisible(true);
  };

  const handleComingSoonPress = () => {
    mixpanel.track("Coming Soon Button Clicked", {
      source: "WelcomeHospital",
      button_type: "cta",
      timestamp: new Date().toISOString(),
    });
    setComingSoonModalVisible(true);
  };

  const handleScrollToProcess = () => {
    mixpanel.track("See How It Helps Button Clicked", {
      source: "WelcomeHospital",
      action: "scroll_to_process",
      timestamp: new Date().toISOString(),
    });
    processSectionRef.current?.measureLayout(scrollViewRef.current, (x, y) => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    });
  };

  const handleScrollToCtaSection = () => {
    mixpanel.track("Book a Free Demo Button Clicked", {
      source: "WelcomeHospital",
      action: "scroll_to_cta",
      timestamp: new Date().toISOString(),
    });
    ctaSectionRef.current?.measureLayout(scrollViewRef.current, (x, y) => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    });
  };

  const handleHospitalLoginSuccess = (session) => {
    mixpanel.track("Hospital Login Success", {
      source: "WelcomeHospital",
      hospital_id: session.hospital_id,
      hospital_name: session.name,
      timestamp: new Date().toISOString(),
    });
    setHospitalModalVisible(false);
    login({ name: session.name, hospitalId: session.hospital_id }, "hospital");
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "HospitalAppNavigation",
          params: {
            screen: "HospitalPortalLandingPage",
            params: {
              hospitalId: session.hospital_id,
              apiKey: session.api_key,
            },
          },
        },
      ],
    });
  };

  const handleHomeNavigation = () => {
    mixpanel.track("Home Button Clicked", {
      source: "WelcomeHospital",
      action: "navigate_to_home",
      bypass_auth: true,
      timestamp: new Date().toISOString(),
    });
    navigation.navigate("HospitalAppNavigation", {
      screen: "HospitalPortalLandingPage",
      params: {
        hospitalId: "test-hospital",
        apiKey: "test-api-key",
      },
    });
  };

  const cardImages = [
    require("../../assets/HospitalPortal/Images/welcomeTab_5.png"),
    require("../../assets/HospitalPortal/Images/welcomeTab_4.png"),
    require("../../assets/HospitalPortal/Images/welcomeTab_3.png"),
  ];
  const cardImages2 = [
    require("../../assets/HospitalPortal/Images/welcomeTab_2.png"),
    require("../../assets/HospitalPortal/Images/welcomeTab_1.png"),
  ];
  const cardDataRow1 = [
    {
      title: "Coding Errors",
      desc: "Claims rejected due to small ICD/CPT coding errors that slip through manual review",
    },
    {
      title: "Wasted Time",
      desc: "Hours spent fixing documentation and resubmitting the same claims repeatedly",
    },
    {
      title: "Wasted Time",
      desc: "Hours spent fixing documentation and resubmitting the same claims repeatedly",
    },
  ];
  const trustIcons = [
    require("../../assets/HospitalPortal/Icon/welcomeBottomIcon_1.png"),
    require("../../assets/HospitalPortal/Icon/welcomeBottomIcon_2.png"),
    require("../../assets/HospitalPortal/Icon/welcomeBottomIcon_3.png"),
  ];

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <ImageBackground
            source={require("../../assets/HospitalPortal/Images/welcome_bgNew.png")}
            style={styles.bg}
            resizeMode="cover"
          >
            <View style={styles.overlay} />

            {/* Navbar */}
            <View style={styles.navbar}>
              <View style={styles.logoRow}>
                <Image
                  source={require("../../assets/Images/KokoroLogo.png")}
                  style={styles.logo}
                />
                <Text style={styles.logoText}>Kokoro.Doctor</Text>
              </View>
              <View style={styles.auth}>
                <TouchableOpacity
                  onPress={handleHomeNavigation}
                  style={styles.getStarted}
                >
                  <Text style={styles.getStartedText}>Get Started</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero Content */}
            <View style={styles.content}>
              <View style={styles.tag}>
                <Image
                  source={require("../../assets/HospitalPortal/Icon/ai_icon.png")}
                />
                <Text style={styles.tagText}>AI-Powered Claim Assistant</Text>
              </View>

              <Text style={styles.heading}>
                Tired of fixing the same{"\n"}
                claim errors again and{"\n"}
                again?
              </Text>

              <Text style={styles.subText}>
                Kokoro Doctor works like your intelligent billing assistant —
                helping you submit cleaner claims, reduce rejections, and get
                faster approvals.
              </Text>

              {/* ── Animated Analyze Button ── */}
              <View style={styles.buttons}>
                <AnalyzeButton onPress={handleHomeNavigation} />
              </View>

              {/* Trust */}
              <View style={styles.trust}>
                <Image
                  source={require("../../assets/HospitalPortal/Icon/drs.png")}
                  style={{ height: 42, width: 82 }}
                />
                <View style={{ flexDirection: "column" }}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "400",
                    }}
                  >
                    500+ Hospitals Trust kokoro.doctor
                  </Text>
                  <Text style={styles.trustText}>
                    ⭐⭐⭐⭐⭐ (4.9/5 rating)
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.problemSection}>
            <View style={styles.problemHeader}>
              <Text style={styles.problemTag}>Sound familiar?</Text>
              <Text style={styles.problemTitle}>
                What Your Billing Team Deals With Every Day
              </Text>
              <Text style={styles.problemSub}>
                These aren't edge cases — they're the daily reality for hospital
                {"\n"}billing teams across the country.
              </Text>
            </View>

            <View style={styles.row}>
              {cardDataRow1.map((item, index) => (
                <View key={index} style={styles.card}>
                  <Image
                    source={cardImages[index]}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.rowCenter}>
              {[4, 5].map((item, index) => (
                <View key={index} style={styles.card}>
                  <Image
                    source={cardImages2[index]}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>Wasted Time</Text>
                    <Text style={styles.cardDesc}>
                      Hours spent fixing documentation and resubmitting the same
                      claims repeatedly
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamTag}>Your AI support team</Text>
              <Text style={styles.teamTitle}>
                Meet Your AI Claim Support Team
              </Text>
              <Text style={styles.teamSub}>
                Not just a tool — think of them as dedicated team members {"\n"}
                who never miss a detail.
              </Text>
            </View>
            <View style={styles.teamGrid}>
              {[0, 1, 2, 3].map((index) => (
                <View key={index} style={styles.teamCard}>
                  <View style={styles.teamBadge}>
                    <Text style={styles.badgeText}>Solution</Text>
                  </View>
                  <View style={styles.iconCircle}>
                    <Text style={{ color: "#fff" }}>★</Text>
                  </View>
                  <Text style={styles.teamCardTitle}>
                    {index === 0 && "Pre-Authorization Agent"}
                    {index === 1 && "Mediclaim Agent"}
                    {index === 2 && "Denial Recovery Agent"}
                    {index === 3 && "Post-Op Flow Agent"}
                  </Text>
                  <Text style={styles.teamCardDesc}>
                    {index === 0 &&
                      "Helps you get approvals faster by checking eligibility and reducing pre-auth errors before submission"}
                    {index === 1 &&
                      "Automatically extracts, verifies, and codes claims using ICD and CPT — reducing manual effort and mistakes"}
                    {index === 2 &&
                      "Explains why claims were rejected and helps you fix and resubmit them correctly"}
                    {index === 3 &&
                      "Ensures discharge summaries, billing, and claim closure are aligned and complete"}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTag}>Real results</Text>
              <Text style={styles.resultsTitle}>
                Make Your Billing Work Easier — And More Effective
              </Text>
            </View>
            <View style={styles.statsRow}>
              {[
                { value: "94%", label: "Approval Rate" },
                { value: "60%", label: "Rework Reduced" },
                { value: "45min", label: "Time Saved / Claim" },
                { value: "88%", label: "First-Pass Rate" },
              ].map((item, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>What changes for your team</Text>
              {[
                "Spend less time fixing rejected claims",
                "Submit claims with higher confidence",
                "Reduce back-and-forth with insurers",
                "Improve approval rates without extra effort",
              ].map((text, index) => (
                <View key={index} style={styles.bulletRow}>
                  <View style={styles.dot} />
                  <Text style={styles.bulletText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.processSection} ref={processSectionRef}>
            <View style={styles.processHeader}>
              <Text style={styles.processTag}>Simple process</Text>
              <Text style={styles.processTitle}>How it Works</Text>
              <Text style={styles.processSub}>
                Six steps from document to approval — all handled intelligently.
              </Text>
            </View>
            <View style={styles.timeline}>
              <View style={styles.verticalLine} />
              {[
                {
                  title: "Upload Documents",
                  desc: "Upload patient records and claim documents",
                },
                {
                  title: "AI Reads & Understands",
                  desc: "Our AI analyzes the case context deeply",
                },
                {
                  title: "Maps ICD & CPT",
                  desc: "Automatically assigns correct medical codes",
                },
                {
                  title: "Validates Against Policy",
                  desc: "Checks compliance with insurer requirements",
                },
                {
                  title: "Detects Errors",
                  desc: "Catches mistakes before submission",
                },
              ].map((item, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepIcon}>
                    <Image
                      source={require("../../assets/HospitalPortal/Icon/files.png")}
                      style={styles.stepIconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.stepCard}>
                    <View style={styles.stepCardHeader}>
                      <View style={styles.stepCardIcon}>
                        <Image
                          source={require("../../assets/HospitalPortal/Icon/files.png")}
                          style={styles.stepCardIconImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.stepLabel}>Step {index + 1}</Text>
                    </View>
                    <Text style={styles.stepTitle}>{item.title}</Text>
                    <Text style={styles.stepDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.teamSection}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamTag}>Your AI support team</Text>
              <Text style={styles.teamTitle}>
                Meet Your AI Claim Support Team
              </Text>
              <Text style={styles.teamSub}>
                Not just a tool — think of them as dedicated team members {"\n"}
                who never miss a detail.
              </Text>
            </View>
            <View style={styles.teamGrid}>
              {[0, 1, 2, 3].map((index) => (
                <View key={index} style={styles.teamCard}>
                  <View style={styles.teamBadge}>
                    <Text style={styles.badgeText}>Solution</Text>
                  </View>
                  <View style={styles.iconCircle}>
                    <Text style={{ color: "#fff" }}>★</Text>
                  </View>
                  <Text style={styles.teamCardTitle}>
                    {index === 0 && "Increase Revenue Realization"}
                    {index === 1 && "Reduce Claim Leakage"}
                    {index === 2 && "Reduce Claim Leakage"}
                    {index === 3 && "Better Operational Control"}
                  </Text>
                  <Text style={styles.teamCardDesc}>
                    {index === 0 &&
                      "Capture more of the revenue you've already earned through better claim accuracy"}
                    {index === 1 &&
                      "Identify and eliminate the gaps where valid claims fall through the cracks"}
                    {index === 2 &&
                      "Streamline workflows so your team can process more claims in less time"}
                    {index === 3 &&
                      "Full visibility into claim status, bottlenecks, and team performance"}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.trustSection}>
            <View style={styles.trustHeader}>
              <Text style={styles.trustTag}>Trust & reliability</Text>
              <Text style={styles.trustTitle}>Built to Earn Your Trust</Text>
            </View>
            <View style={styles.trustGrid}>
              {[
                {
                  title: "Secure Data Handling",
                  desc: "End-to-end encryption and strict access controls protect patient data at every step",
                },
                {
                  title: "Audit-Ready Logs",
                  desc: "Complete trail of every claim action for compliance and internal review",
                },
                {
                  title: "Built for Hospitals",
                  desc: "Designed around actual hospital billing workflows — not retrofitted from generic tools",
                },
              ].map((item, index) => (
                <View key={index} style={styles.trustCard}>
                  <View style={styles.trustIcon}>
                    <Image
                      source={trustIcons[index]}
                      style={styles.trustIconImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.trustCardTitle}>{item.title}</Text>
                  <Text style={styles.trustCardDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.ctaSection} ref={ctaSectionRef}>
            <View style={styles.ctaCard}>
              <View style={styles.ctaTag}>
                <Text style={styles.ctaTagText}>●</Text>
                <Text style={{ color: "#fff" }}>
                  Harvard Innovation Lab Validated
                </Text>
              </View>
              <Text style={styles.ctaTitle}>
                Make Claim Processing Less{"\n"}Stressful for Your Team
              </Text>
              <Text style={styles.ctaSub}>
                Let Kokoro.Doctor support your billing team — so they can{"\n"}
                focus on what matters.
              </Text>
              <View style={styles.ctaButtons}>
                <TouchableOpacity
                  style={styles.ctaPrimary}
                  onPress={handleComingSoonPress}
                >
                  <Text style={styles.ctaPrimaryText}>Schedule a Demo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ctaSecondary}
                  onPress={handleComingSoonPress}
                >
                  <Text style={styles.ctaSecondaryText}>Talk to our team</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <HospitalAuthModal
        visible={hospitalModalVisible}
        onRequestClose={() => setHospitalModalVisible(false)}
        onSuccess={handleHospitalLoginSuccess}
      />

      <Modal
        visible={comingSoonModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setComingSoonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.comingSoonModal}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setComingSoonModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.comingSoonContent}>
              <Text style={styles.comingSoonIcon}>🚀</Text>
              <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
              <Text style={styles.comingSoonDesc}>
                We're working hard to bring this feature to you. Check back
                soon!
              </Text>
              <TouchableOpacity
                style={styles.comingSoonBtn}
                onPress={() => setComingSoonModalVisible(false)}
              >
                <Text style={styles.comingSoonBtnText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },

  bg: { width: "100%", height: 800, justifyContent: "flex-start" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#025AE036",
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF33",
    backdropFilter: "blur(6px)",
  },

  logo: { color: "#fff", fontWeight: "600", fontSize: 18 },

  menu: { flexDirection: "row", gap: 25 },
  menuItem: { color: "#cfd8dc", fontSize: 14 },

  auth: { flexDirection: "row", alignItems: "center", gap: 15 },
  signIn: { color: "#FFFFFF" },

  getStarted: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  getStartedText: { color: "#025AE0", fontSize: 13 },

  content: {
    paddingHorizontal: 60,
    marginTop: "10%",
    marginLeft: "6%",
    maxWidth: 700,
  },

  tag: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFEEEE99",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  tagText: {
    color: "#444444",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Poppins",
  },

  heading: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 48,
    marginBottom: 15,
    fontFamily: "Public Sans",
    fontStyle: "Medium",
  },

  subText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: "Public Sans",
    fontWeight: "500",
  },

  buttons: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },

  trust: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    gap: 8,
  },
  trustText: { color: "#cfd8dc", fontSize: 12 },

  problemSection: {
    backgroundColor: "#C6E2FF",
    paddingVertical: 80,
    paddingHorizontal: 60,
    marginTop: -60,
  },
  problemHeader: { alignItems: "center", marginBottom: 40, marginTop: 20 },
  problemTag: {
    backgroundColor: "#1e3a5f",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 15,
  },
  problemTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 10,
  },
  problemSub: {
    fontSize: 16,
    color: "#222222",
    textAlign: "center",
    fontWeight: "400",
    fontFamily: "Roboto",
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  card: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  cardBody: { padding: 15 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  cardDesc: { fontSize: 13, color: "#666" },
  cardImage: { width: "100%", height: 160 },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  rowCenter: { flexDirection: "row", justifyContent: "center", gap: 20 },

  teamSection: {
    backgroundColor: "#DCEAFF",
    paddingVertical: 80,
    paddingHorizontal: 60,
  },
  teamHeader: { alignItems: "center", marginBottom: 50 },
  teamTag: {
    backgroundColor: "#1e3a5f",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 15,
  },
  teamTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 10,
  },
  teamSub: {
    fontSize: 14,
    color: "#222222",
    textAlign: "center",
    maxWidth: 600,
    fontFamily: "Roboto",
    fontWeight: "400",
  },
  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 900,
    alignSelf: "center",
  },
  teamCard: {
    width: "45%",
    minWidth: 360,
    maxWidth: 420,
    backgroundColor: "#07577F",
    borderRadius: 14,
    padding: 22,
    margin: 12,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  teamBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontSize: 11 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0b3a55",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  teamCardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  teamCardDesc: {
    color: "#cbd5f5",
    fontSize: 13,
    lineHeight: 20,
    flexWrap: "wrap",
    width: "100%",
  },

  resultsSection: {
    backgroundColor: "#CEE6FF",
    paddingVertical: 80,
    paddingHorizontal: 60,
    alignItems: "center",
  },
  resultsHeader: { alignItems: "center", marginBottom: 40 },
  resultsTag: {
    backgroundColor: "#1e3a5f",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: "#1a1a1a",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 50,
  },
  statCard: {
    width: 220,
    height: 110,
    backgroundColor: "#07577F",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  statValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  statLabel: { color: "#cbd5f5", fontSize: 13 },
  infoBox: {
    width: "60%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    borderWidth: 2,
    borderColor: "#d946ef",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#444444",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: 320,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginRight: 10,
  },
  bulletText: { fontSize: 14, color: "#444", flexShrink: 1 },

  processSection: {
    backgroundColor: "#CEE6FF",
    paddingVertical: 80,
    paddingHorizontal: 60,
    alignItems: "center",
  },
  processHeader: { alignItems: "center", marginBottom: 50 },
  processTag: {
    backgroundColor: "#1e3a5f",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 12,
  },
  processTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  processSub: {
    fontSize: 14,
    color: "#222222",
    textAlign: "center",
    fontFamily: "Roboto",
    fontWeight: "400",
  },
  timeline: { position: "relative", width: "60%" },
  verticalLine: {
    position: "absolute",
    left: 20,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#cbd5f5",
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 25 },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  stepIconImage: { width: 20, height: 20 },
  stepCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  stepCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  stepCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCardIconImage: { width: 16, height: 16 },
  stepLabel: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  stepDesc: { fontSize: 12, color: "#555" },

  trustSection: {
    backgroundColor: "#e6f0ff",
    paddingVertical: 80,
    paddingHorizontal: 60,
  },
  trustHeader: { alignItems: "center", marginBottom: 50 },
  trustTag: {
    backgroundColor: "#1e3a5f",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 12,
  },
  trustTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  trustGrid: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 25,
  },
  trustCard: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
  },
  trustIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  trustIconImage: { width: 40, height: 40 },
  trustCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  trustCardDesc: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontWeight: "400",
  },

  ctaSection: {
    backgroundColor: "#e6f0ff",
    paddingTop: 20,
    paddingBottom: 100,
    alignItems: "center",
    marginTop: -40,
  },
  ctaCard: {
    width: "80%",
    maxWidth: 900,
    backgroundColor: "#07577F",
    borderRadius: 30,
    paddingVertical: 50,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaTag: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#FFEEEE0D",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  ctaTagText: { color: "#00A456", fontSize: 14 },
  ctaTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 42,
  },
  ctaSub: {
    color: "#cbd5f5",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
  },
  ctaButtons: { flexDirection: "row", gap: 15 },
  ctaPrimary: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaPrimaryText: { color: "#155e75", fontSize: 14, fontWeight: "500" },
  ctaSecondary: {
    borderWidth: 1,
    borderColor: "#60a5fa",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaSecondaryText: { color: "#cbd5f5", fontSize: 14 },

  logoRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 30, height: 30, marginRight: 8 },
  logoText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonModal: {
    width: "85%",
    maxWidth: 450,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalCloseBtnText: { fontSize: 20, color: "#666", fontWeight: "600" },
  comingSoonContent: { alignItems: "center", marginTop: 12 },
  comingSoonIcon: { fontSize: 64, marginBottom: 16 },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  comingSoonDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  comingSoonBtn: {
    backgroundColor: "#1e88e5",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  comingSoonBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
