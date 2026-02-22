import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ImageBackground,
  Animated,
  Easing,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import mixpanel from "../../utils/Mixpanel";

export default function KokoroDoctorScreen() {
  const [searchText, setSearchText] = useState("");
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  const scrollRef = useRef(null);
  const scrollX = useRef(0);
  const intervalRef = useRef(null);
  const pauseTimeout = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Animation states
  const [inputWidth, setInputWidth] = useState(0);
  const animationProgress = useRef(new Animated.Value(0)).current;
  const blinkOpacity = useRef(new Animated.Value(1)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const blinkRef = useRef(null);
  const rotationRef = useRef(null);

  // Cubic bezier curve for smooth path animation
  const calculateCurvePosition = (progress) => {
    // Path: top-left (0,0) -> bottom-middle (0.5,1) -> top-right (1,0) -> back
    let x, y, t;

    if (progress < 0.5) {
      // First half: top-left to bottom-middle
      t = progress * 2; // 0 to 1
      // Quadratic bezier: start(0,0), control(0.25,0.6), end(0.5,1)
      x =
        Math.pow(1 - t, 2) * 0 + 2 * (1 - t) * t * 0.15 + Math.pow(t, 2) * 0.5;
      y = Math.pow(1 - t, 2) * 0 + 2 * (1 - t) * t * 0.7 + Math.pow(t, 2) * 1;
    } else {
      // Second half: bottom-middle to top-right
      t = (progress - 0.5) * 2; // 0 to 1
      // Quadratic bezier: start(0.5,1), control(0.75,0.6), end(1,0)
      x = Math.pow(1 - t, 2) * 0.5 + 2 * (1 - t) * t * 0.8 + Math.pow(t, 2) * 1;
      y = Math.pow(1 - t, 2) * 1 + 2 * (1 - t) * t * 0.5 + Math.pow(t, 2) * 0;
    }

    return { x, y };
  };

  useEffect(() => {
    // Main animation loop - discrete blink positions
    const startAnimation = () => {
      animationProgress.setValue(0);

      animationRef.current = Animated.timing(animationProgress, {
        toValue: 1,
        duration: 6000, // 6 seconds for full cycle through 3 positions
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          startAnimation(); // Loop
        }
      });
    };

    // Rotation animation - rotates during each appearance
    const startRotationCycle = () => {
      rotationRef.current = Animated.sequence([
        // Point A: Rotate 0 to 360 degrees (800ms)
        Animated.timing(rotationValue, {
          toValue: 360,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Pause during gap between A and B (800ms)
        Animated.timing(rotationValue, {
          toValue: 360,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Point B: Rotate 360 to 720 degrees (800ms)
        Animated.timing(rotationValue, {
          toValue: 720,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Pause during gap between B and C (800ms)
        Animated.timing(rotationValue, {
          toValue: 720,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Point C: Rotate 720 to 1080 degrees (800ms)
        Animated.timing(rotationValue, {
          toValue: 1080,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Pause during gap back to start (800ms)
        Animated.timing(rotationValue, {
          toValue: 1080,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          rotationValue.setValue(0);
          startRotationCycle(); // Loop rotation
        }
      });
    };

    // Blinking animation with discrete steps
    // Stage A (0-0.33): Blink - opacity 0->1->0
    // Stage B (0.33-0.66): Blink - opacity 0->1->0
    // Stage C (0.66-1): Blink - opacity 0->1->0
    const startBlinkCycle = () => {
      blinkRef.current = Animated.sequence([
        // Point A: Top-left
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(blinkOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Gap to Point B
        Animated.timing(blinkOpacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Point B: Bottom-middle
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(blinkOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Gap to Point C
        Animated.timing(blinkOpacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Point C: Top-right
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(blinkOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          startBlinkCycle(); // Loop
        }
      });
    };

    startAnimation();
    startRotationCycle();
    startBlinkCycle();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop?.();
      }
      if (rotationRef.current) {
        rotationRef.current.stop?.();
      }
      if (blinkRef.current) {
        blinkRef.current.stop?.();
      }
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      if (isPaused) return;

      scrollX.current += 1;

      scrollRef.current.scrollTo({
        x: scrollX.current,
        animated: false, // ⭐ important (no animation lag)
      });

      if (scrollX.current > 700) {
        scrollX.current = 0;
        scrollRef.current.scrollTo({ x: 0, animated: false });
      }
    }, 20);

    return () => clearInterval(intervalRef.current);
  }, [isPaused]);

  const tryItems = [
    "Chest Pain",
    "High BP",
    "Paracetamol",
    "Headache",
    "Crocin",
    "Period Pain",
    "Meftal Spas",
    "PCOS",
    "Gas",
    "Thyroid",
    "Iron Tablets",
    "High Cholesterol",
    "Depression",
    "Anxiety",
    "Asthma",
  ];

  const windowWidth = Dimensions.get("window").width;

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <ScrollView style={webStyles.container}>
          {/* ===== NAVBAR ===== */}
          <View style={webStyles.navbar}>
            <View style={webStyles.logoRow}>
              <Image
                source={require("../../assets/Images/KokoroLogo.png")}
                style={webStyles.logo}
              />
              <Text style={webStyles.logoText}>Kokoro.Doctor</Text>
            </View>

            <View style={webStyles.navLinks}>
              <TouchableOpacity
                onPress={() => navigation.navigate("LandingPage")}
              >
                <Text style={webStyles.navText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("PatientAppNavigation", {
                    screen: "Doctors",
                    params: { screen: "DoctorResultShow" },
                  })
                }
              >
                <Text style={webStyles.navText}>Our Doctor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("DoctorAppNavigation", {
                    screen: "DoctorPortalLandingPage",
                  })
                }
              >
                <Text style={webStyles.navText}>Doctor login</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={webStyles.navBtn}
              onPress={() =>
                navigation.navigate("PatientAppNavigation", {
                  screen: "Doctors",
                  params: { screen: "DoctorResultShow" },
                })
              }
            >
              <Text style={webStyles.navBtnText}>Get Help Now</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>

          {/* ===== HERO SECTION ===== */}
          <ImageBackground
            source={require("../../assets/Images/TopCardd.png")}
            style={webStyles.heroCard}
            imageStyle={webStyles.heroBgImage}
          >
            <View style={webStyles.heroLeft}>
              <View style={webStyles.badgeContainer}>
                <View style={webStyles.badgeItemWeb}>
                  <View style={webStyles.iconWhiteBox}>
                    <Image
                      source={require("../../assets/Images/stethoscopees.png")}
                      style={webStyles.badgeIconWeb}
                    />
                  </View>
                  <Text style={webStyles.badgeTextWeb}>Built with doctors</Text>
                </View>

                <View style={webStyles.badgeItemWeb}>
                  <View style={webStyles.iconWhiteBox}>
                    <Image
                      source={require("../../assets/Images/capharvard.png")}
                      style={webStyles.badgeIconWeb}
                    />
                  </View>
                  <Text style={webStyles.badgeTextWeb}>
                    Harvard Innovation Labs
                  </Text>
                </View>

                <View style={webStyles.badgeItemWeb}>
                  <View style={webStyles.iconWhiteBox}>
                    <Image
                      source={require("../../assets/Images/checkk.png")}
                      style={webStyles.badgeIconWeb}
                    />
                  </View>
                  <Text style={webStyles.badgeTextWeb}>Private & Secure</Text>
                </View>
              </View>

              <Text style={webStyles.heroTitle}>
                If something feels off or{"\n"}your medicines confuse you
              </Text>

              <TouchableOpacity
                style={webStyles.heroBtn}
                onPress={() =>
                  navigation.navigate("PatientAppNavigation", {
                    screen: "Doctors",
                    params: { screen: "DoctorResultShow" },
                  })
                }
              >
                <Text style={webStyles.heroBtnText}>Get Help Now</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FF6B6B"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>

            <Image
              source={require("../../assets/Images/drImage.png")}
              style={webStyles.heroDoctor}
            />
          </ImageBackground>

          {/* ===== SEARCH BAR ===== */}
          <View style={styles.searchBoxweb}>
            {/* ANIMATED CURVE PATH ICON */}
            <Animated.View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: 18,
              }}
              pointerEvents="none"
            >
              <Animated.Image
                source={require("../../assets/Images/animateicon.png")}
                style={[
                  {
                    position: "absolute",
                    width: 20,
                    height: 20,
                    resizeMode: "contain",
                  },
                  {
                    // Discrete blink positions across full width
                    // Point A (top-left): 0-0.33
                    // Point B (bottom-middle): 0.33-0.66
                    // Point C (top-right): 0.66-1
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [8, 140, 260, 8], // Full width coverage
                          extrapolate: "clamp",
                        }),
                      },
                      {
                        translateY: animationProgress.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [-8, 32, -8, -8], // A: top, B: bottom, C: top
                          extrapolate: "clamp",
                        }),
                      },
                      {
                        rotate: rotationValue.interpolate({
                          inputRange: [0, 360, 720, 1080],
                          outputRange: ["0deg", "360deg", "720deg", "1080deg"],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                    opacity: blinkOpacity,
                  },
                ]}
              />
            </Animated.View>

            <TextInput
              placeholder="Type your medicine name or symptoms..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.newText}
            />

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => {
                const textToSend = searchText.trim();

                if (!textToSend) return; // prevent empty search

                navigation.navigate("PatientAppNavigation", {
                  screen: "MobileChatbot",
                  params: {
                    presetPrompt: textToSend,
                    source: "medicine-input",
                  },
                });
              }}
            >
              <Ionicons name="search" size={18} color="#555" />
            </TouchableOpacity>
          </View>
          {/* ===== TRY SECTION ===== */}
          <View style={webStyles.tryWrapper}>
            <View style={webStyles.tryRow}>
              <Text style={webStyles.tryLabel}>Try</Text>

              <ScrollView
                ref={scrollRef}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={webStyles.tryScroll}
              >
                {[...tryItems, ...tryItems].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={webStyles.tryChip}
                    activeOpacity={0.8}
                    onPress={() => {
                      navigation.navigate("PatientAppNavigation", {
                        screen: "MobileChatbot",
                        params: {
                          presetPrompt: item,
                          source: "medicine-input",
                        },
                      });
                    }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <Text style={webStyles.tryChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* ===== SERVICES GRID ===== */}
          <View style={webStyles.servicesGrid}>
            {[
              {
                title: "Talk to\nDoctor",
                img: require("../../assets/Images/webtalktodr.png"),
                bg: "#E9DDB5",
              },
              {
                title: "Upload\nPrescription",
                img: require("../../assets/Images/webpresc.png"),
                bg: "#CFE9D6",
              },
              {
                title: "Heart Check",
                img: require("../../assets/Images/webstetho.png"),
                bg: "#C9CEF6",
              },
              {
                title: "Women\nHealth",
                img: require("../../assets/Images/newgirlpregpic.png"),
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[webStyles.serviceCard, { backgroundColor: item.bg }]}
                onPress={() => {
                  const title = item.title.replace("\n", " ").trim();

                  if (title === "Talk to Doctor") {
                    navigation.navigate("PatientAppNavigation", {
                      screen: "Doctors",
                      params: { screen: "DoctorResultShow" },
                    });
                  }

                  if (title === "Heart Check" || title === "Women Health") {
                    navigation.navigate("PatientAppNavigation", {
                      screen: "MobileChatbot",
                      params: {
                        presetPrompt: title,
                        source: "service-card",
                      },
                    });
                  }

                  if (title === "Upload Prescription") {
                    navigation.navigate("DoctorAppNavigation", {
                      screen: "Prescription",
                    });
                  }
                }}
              >
                <Image
                  source={item.img}
                  style={[
                    webStyles.serviceImg,
                    item.title.includes("Women") && webStyles.womenHealthImg,
                  ]}
                />

                <View style={webStyles.serviceLabel}>
                  <Text style={webStyles.serviceText}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ===== FEATURED ===== */}
          <Text style={webStyles.sectionTitle}>Featured</Text>

          <View style={webStyles.featureRow}>
            <TouchableOpacity
              style={webStyles.featureCard}
              onPress={() =>
                navigation.navigate("PatientAppNavigation", {
                  screen: "Doctors",
                  params: { screen: "DoctorResultShow" },
                })
              }
            >
              <ImageBackground
                source={require("../../assets/Images/newbottomcta2.png")}
                style={webStyles.featureImage}
                imageStyle={{ borderRadius: 20 }}
              >
                {/* 🔥 ACTUAL OVERLAY */}
                <View style={webStyles.realOverlay} />

                {/* 🔥 CONTENT ABOVE OVERLAY */}
                <View style={webStyles.featureContent}>
                  <View>
                    <Text style={webStyles.featureTitle}>
                      Start Health {"\n"}Check
                    </Text>
                    <Text style={webStyles.featureSubtitle}>
                      Symptoms → AI → Doctor
                    </Text>
                  </View>

                  <TouchableOpacity style={webStyles.arrowBtn}>
                    <Ionicons name="arrow-forward" size={20} color="#FF5A5F" />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              style={webStyles.featureCard}
              onPress={() => navigation.navigate("NewMedicineLandingPage")}
            >
              <ImageBackground
                source={require("../../assets/Images/newbottomCTa1.png")}
                style={webStyles.featureImage}
              >
                <View style={webStyles.realOverlay} />

                {/* 🔥 CONTENT ABOVE OVERLAY */}
                <View style={webStyles.featureContent}>
                  <View>
                    <Text style={webStyles.featureTitle}>
                      Confused About {"\n"}Medicine ?
                    </Text>
                    <Text style={webStyles.featureSubtitle}>
                      just type → Kokoro explains
                    </Text>
                  </View>

                  <TouchableOpacity style={webStyles.arrowBtn}>
                    <Ionicons name="arrow-forward" size={20} color="#FF5A5F" />
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* ===== TRUST SECTION ===== */}
          <View style={webStyles.trustBox}>
            <Image
              source={require("../../assets/Images/bottomimg.png")}
              style={webStyles.trustImg}
            />
            <View>
              <Text style={webStyles.trustTitle}>
                Trusted by 10,000+ patients
              </Text>
              <Text style={webStyles.trustSubtitle}>
                Verified doctors available
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/Images/KokoroLogo.png")}
                style={styles.logo}
              />
              <Text style={styles.logoText}>Kokoro.Doctor</Text>
            </View>

            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="menu" size={26} />
            </TouchableOpacity>
          </View>

          {/* HERO CARD */}
          <ImageBackground
            source={require("../../assets/Images/TopCardd.png")} // 👈 your 1st image
            style={styles.heroCard}
            imageStyle={styles.heroBgImage}
          >
            {/* TEXT + BUTTON */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                If something feels off or {"\n"}your medicines confuse you
              </Text>

              <TouchableOpacity
                style={styles.helpBtn}
                onPress={() => {
                  mixpanel.track("Get Help Now Clicked", {
                    source: "hero-card",
                    destination: "DoctorResultShow",
                  });

                  navigation.navigate("PatientAppNavigation", {
                    screen: "Doctors",
                    params: {
                      screen: "DoctorResultShow",
                    },
                  });
                }}
              >
                <Text style={styles.helpText}>Get Help Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#ff4d4d" />
              </TouchableOpacity>
            </View>

            {/* DOCTOR CUTOUT */}
            <Image
              source={require("../../assets/Images/newtopcarddr.png")}
              style={styles.heroDoctor}
            />
          </ImageBackground>

          {/* TRUST BADGES */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              {/* Built with doctors */}
              <View style={styles.badgeItem}>
                <Image
                  source={require("../../assets/Images/stethoscopees.png")}
                  style={styles.badgeIcon}
                />
                <Text style={styles.badgeText}>built with doctors</Text>
              </View>

              {/* Harvard */}
              <View style={styles.badgeItem}>
                <Image
                  source={require("../../assets/Images/capharvard.png")}
                  style={styles.badgeIcon}
                />
                <Text style={styles.badgeText}>Harvard Innovation Labs</Text>
              </View>

              {/* Private & Secure */}
              <View style={styles.badgeItem}>
                <Image
                  source={require("../../assets/Images/checkk.png")}
                  style={styles.badgeIcon}
                />
                <Text style={styles.badgeText}>Private & Secure</Text>
              </View>
            </View>
          </View>

          {/* SEARCH */}
          <View style={styles.searchBox}>
            {/* ANIMATED CURVE PATH ICON */}
            <Animated.View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: 18,
              }}
              pointerEvents="none"
            >
              <Animated.Image
                source={require("../../assets/Images/animateicon.png")}
                style={[
                  {
                    position: "absolute",
                    width: 20,
                    height: 20,
                    resizeMode: "contain",
                  },
                  {
                    // Discrete blink positions across full width
                    // Point A (top-left): 0-0.33
                    // Point B (bottom-middle): 0.33-0.66
                    // Point C (top-right): 0.66-1
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [8, 140, 260, 8], // Full width coverage
                          extrapolate: "clamp",
                        }),
                      },
                      {
                        translateY: animationProgress.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [-8, 32, -8, -8], // A: top, B: bottom, C: top
                          extrapolate: "clamp",
                        }),
                      },
                      {
                        rotate: rotationValue.interpolate({
                          inputRange: [0, 360, 720, 1080],
                          outputRange: ["0deg", "360deg", "720deg", "1080deg"],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                    opacity: blinkOpacity,
                  },
                ]}
              />
            </Animated.View>

            <TextInput
              placeholder="Type your medicine name or symptoms..."
              value={searchText}
              onChangeText={setSearchText}
              style={{
                flex: 1,
                color: "#9B9A9A",
                marginLeft: 8,
                borderWidth: 1,
                borderColor: "#AAAAAA",
                paddingVertical: 16,
                paddingLeft: 12,
                borderRadius: 14,
                fontSize: windowWidth > 400 ? 15 : 12,
              }}
            />

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => {
                const textToSend = searchText.trim();

                if (!textToSend) return; // prevent empty search

                navigation.navigate("PatientAppNavigation", {
                  screen: "MobileChatbot",
                  params: {
                    presetPrompt: textToSend,
                    source: "medicine-input",
                  },
                });
              }}
            >
              <Ionicons name="search" size={18} color="#555" />
            </TouchableOpacity>
          </View>

          {/* TRY CHIPS */}
          <View style={styles.tryContainer}>
            <Text style={styles.tryLabel}>Try</Text>

            <ScrollView
              ref={scrollRef}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={styles.tryScroll}
              pointerEvents="box-none" // ⭐ gesture priority
            >
              {[...tryItems, ...tryItems].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  activeOpacity={0.8}
                  delayPressIn={0}
                  onPress={() => {
                    const textToSend = item.trim();

                    if (!textToSend) return;

                    mixpanel.track("Try Pill Clicked", {
                      pill_name: item,
                      source: "landing-try-section",
                    });

                    navigation.navigate("PatientAppNavigation", {
                      screen: "MobileChatbot",
                      params: {
                        presetPrompt: textToSend,
                        source: "medicine-input",
                      },
                    });
                  }}
                  onTouchStart={() => {
                    setIsPaused(true);

                    if (pauseTimeout.current) {
                      clearTimeout(pauseTimeout.current);
                    }
                  }}
                  onTouchEnd={() => {
                    pauseTimeout.current = setTimeout(() => {
                      setIsPaused(false);
                    }, 800);
                  }}
                >
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SERVICES */}
          <View style={styles.servicesGrid}>
            {[
              {
                title: "Talk to\nDoctor",
                img: require("../../assets/Images/talkdr.png"),
                bg: "#E9DDB5",
              },
              {
                title: "Upload\nPrescription",
                img: require("../../assets/Images/Uploadprescriptionn.png"),
                bg: "#CFE9D6",
              },
              {
                title: "Heart Check",
                img: require("../../assets/Images/heart stethoscope transperent 1.png"),
                bg: "#C9CEF6",
              },
              {
                title: "Women\nHealth",
                img: require("../../assets/Images/pregnant girll.png"),
                bg: "#F6C7D2",
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                style={[styles.serviceCard, { backgroundColor: item.bg }]}
                onPress={() => {
                  const title = item.title.replace("\n", " ").trim();

                  // Analytics
                  mixpanel.track("Service Card Clicked", {
                    service_name: title,
                    source: "landing-services",
                  });

                  // 👉 Talk to Doctor → DoctorResultShow
                  if (title === "Talk to Doctor") {
                    navigation.navigate("PatientAppNavigation", {
                      screen: "Doctors",
                      params: {
                        screen: "DoctorResultShow",
                      },
                    });
                  }

                  // 👉 Heart & Women → Chatbot
                  if (title === "Heart Check" || title === "Women Health") {
                    navigation.navigate("PatientAppNavigation", {
                      screen: "MobileChatbot",
                      params: {
                        presetPrompt: title,
                        source: "service-card",
                      },
                    });
                  }

                  // 👉 Upload Prescription → Prescription
                  if (title === "Upload Prescription") {
                    navigation.navigate("DoctorAppNavigation", {
                      screen: "Prescription",
                    });
                  }
                }}
              >
                {/* IMAGE AREA */}
                <Image
                  source={item.img}
                  style={[
                    styles.serviceImg,
                    item.title.includes("Women") && styles.womenHealthImg,
                  ]}
                />

                {/* LABEL AREA */}
                <View style={styles.serviceLabel}>
                  <Text style={styles.serviceText}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* FEATURED */}
          <Text style={styles.sectionTitle}>Featured</Text>

          <View style={styles.featureRow}>
            <View>
              <TouchableOpacity
                onPress={() => {
                  mixpanel.track("Featured CTA Clicked", {
                    banner: "bottomcta1",
                    source: "landing-featured",
                    destination: "DoctorResultShow",
                  });

                  navigation.navigate("PatientAppNavigation", {
                    screen: "Doctors",
                    params: {
                      screen: "DoctorResultShow",
                    },
                  });
                }}
              >
                <Image
                  source={require("../../assets/Images/bottomcta1.png")}
                  style={styles.featureCard}
                />
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                onPress={() => {
                  mixpanel.track("Featured CTA Clicked", {
                    banner: "bottomcta-know-medicine",
                    source: "landing-featured",
                    destination: "NewMedicineLandingPage",
                  });

                  navigation.navigate("NewMedicineLandingPage");
                }}
              >
                <Image
                  source={require("../../assets/Images/bottomcta.png")}
                  style={styles.featureCard}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* FOOTER TRUST */}
          <View style={styles.footerTrust}>
            <Image source={require("../../assets/Images/bottomimg.png")} />
            <View>
              <Text style={{ fontWeight: "600" }}>
                Trusted by 10,000+ patients
              </Text>
              <Text style={{ fontSize: 12, color: "#777" }}>
                Verified doctors available
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
      {menuVisible && (
        <Modal transparent animationType="fade">
          {/* Overlay */}
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          />

          {/* Dropdown */}
          <View style={styles.menuDropdown}>
            <Text style={styles.menuTitle}>Menu</Text>

            {/* Know Your Medicine */}
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);

                mixpanel.track("Mobile Menu - Know your medicine Clicked", {
                  source: "mobile-menu",
                });

                navigation.navigate("NewMedicineLandingPage");
              }}
            >
              <Text style={styles.menuText}>Know Your Medicine</Text>
            </Pressable>

            {/* Our Doctors */}
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

            {/* Doctor Login */}
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

const windowWidth = Dimensions.get("window").width;

const webStyles = StyleSheet.create({
  badgeContainer: {
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 40,
    alignSelf: "flex-start",
    marginBottom: 24,
  },

  badgeItemWeb: {
    flexDirection: "row",
    alignItems: "center",
  },

  badgeIconWeb: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  iconWhiteBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  badgeTextWeb: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },

  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 80,
  },

  tryInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "nowrap", // ⭐ prevents wrapping
  },

  // tryChipText: {
  //   color: "#E4677C",
  //   fontSize: 14,
  //   fontWeight: "500",
  // },

  sectionTitle: {
    marginLeft: "8%",
    marginRight: "8%",
    marginTop: 40,
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
  },

  featureRow: {
    marginLeft: "8%",
    marginRight: "8%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  featureCard: {
    width: "48%",
    aspectRatio: 1.75, // ⭐ EXACT ratio for your banner
    borderRadius: 20,
    overflow: "hidden",
  },
  featureImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  realOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",

    // Smooth curved top like your screenshot
    // borderTopLeftRadius: 50,
    // borderTopRightRadius: 50,

    zIndex: 1,
  },

  featureContent: {
    position: "absolute",
    bottom: 25,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },

  featureTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "600",
  },

  featureSubtitle: {
    color: "#e5e5e5",
    fontSize: 15,
    marginTop: 6,
  },

  arrowBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },

  trustBox: {
    marginLeft: "8%",
    marginRight: "8%",
    marginBottom: "4%",
    marginTop: 40,
    backgroundColor: "#FFEAEA",
    borderRadius: 40,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },

  trustImg: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },

  trustTitle: {
    fontWeight: "600",
    fontSize: 16,
  },

  trustSubtitle: {
    fontSize: 13,
    color: "#777",
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },

  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },

  navLinks: {
    flexDirection: "row",
    gap: 30,
  },

  navText: {
    fontWeight: 500,
    fontSize: 15,
    color: "#333",
  },

  navBtn: {
    flexDirection: "row",
    backgroundColor: "#FF7072",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  navBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  heroCard: {
    marginTop: "2%",
    width: "100%", // ⭐ force full width
    height: 300,
    paddingLeft: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 24,
    overflow: "hidden",
  },
  heroBgImage: {
    resizeMode: "cover",
  },

  heroLeft: {
    maxWidth: "55%",
  },

  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(6px)", // works on web
  },

  badgeIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginRight: 8,
  },

  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: "#fff",
    fontSize: 12,
  },

  heroTitle: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 20,
  },

  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 40,
    alignSelf: "flex-start",
  },

  heroBtnText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },

  heroDoctor: {
    alignSelf: "baseline",
    width: 370,
    height: 355,
    resizeMode: "contain",
  },

  searchBox: {
    marginLeft: "8%",
    marginRight: "8%",
    marginTop: "2%",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  searchBtn: {
    padding: 10,
  },

  servicesGrid: {
    marginLeft: "8%",
    marginRight: "8%",
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  serviceCard: {
    width: "23%",
    height: 130, // ⭐ smaller like mobile
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  serviceImg: {
    position: "absolute",
    // top: 8, // ⭐ give breathing space
    alignSelf: "center",
    width: "100%", // ⭐ smaller image
    height: "100%",
    resizeMode: "contain",
  },

  womenHealthImg: {
    position: "absolute",
    // top: 8,
    alignSelf: "center",
    width: "100%", // same proportion as others
    height: "100%",
    resizeMode: "cover", // ⭐ cover entire area without distortion
  },

  serviceLabel: {
    height: 45, // ⭐ smaller bottom strip
    backgroundColor: "rgba(255,255,255,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  serviceText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: 20,
  },

  tryWrapper: {
    marginTop: 30,
    marginLeft: "8%",
    marginRight: "8%",
  },

  tryRow: {
    flexDirection: "row",
    alignItems: "center", // vertical alignment
  },

  tryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
    marginRight: 16, // space between "Try" and pills
  },

  tryScroll: {
    alignItems: "center",
  },

  tryChip: {
    borderWidth: 1,
    borderColor: "#FF7072",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "#FFEAEA",
    marginRight: 14, // ⭐ spacing between pills
  },

  tryChipText: {
    color: "#E4677C",
    fontSize: 14,
    fontWeight: "500",
  },
});
const styles = StyleSheet.create({
  container: {
    paddingTop: "4%",
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 28,
    height: 28,
    marginRight: 6,
  },

  logoText: {
    fontWeight: "700",
    fontSize: 16,
  },

  heroCard: {
    width: "100%",
    marginTop: "2%",
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 150,
    overflow: "hidden",
    justifyContent: "center",
  },

  heroBgImage: {
    resizeMode: "cover",
  },

  heroContent: {
    padding: 20,
    paddingRight: 110, // space for doctor
  },

  heroTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    lineHeight: 22,
  },

  heroDoctor: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 120,
    height: 140,
    marginRight: "5%",
    resizeMode: "contain",
  },
  newText: {
    flex: 1,
    color: "#9B9A9A",

    borderWidth: 1,
    borderColor: "#AAAAAA",
    paddingVertical: 16,
    paddingLeft: 12,
    borderRadius: 14,
    fontSize: 15,
  },

  helpBtn: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "flex-start",
  },

  helpText: {
    color: "#ff4d4d",
    fontWeight: "600",
    marginRight: 6,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
    justifyContent: "center",
  },

  badge: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#FF7072",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  badgeIcon: {
    width: 16, // 👈 emoji-like size
    height: 16,
    marginRight: 4,
    resizeMode: "contain",
  },

  badgeText: {
    fontSize: windowWidth > 390 ? 11 : 9,
    color: "#444444",
    fontWeight: "400",
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    marginBottom: 14,

    // Shadow (App look)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchBoxweb: {
    marginLeft: "8%",
    marginRight: "8%",
    marginTop: "1%",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    marginBottom: 14,

    // Shadow (App look)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  searchBtn: {
    backgroundColor: "#F4E3FFBF",
    padding: 10,
    borderRadius: 12,
    marginLeft: "2%",
  },

  /* TRY SECTION */
  tryContainer: {
    marginTop: "4%",
    flexDirection: "row",
    alignItems: "center", // vertical center
    height: 40, // same row height
  },

  tryLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 10,
    color: "#444",
  },

  tryScroll: {
    alignItems: "center", // center chips vertically
    paddingRight: 10,
  },

  /* CHIP */
  chip: {
    borderWidth: 1.5,
    borderColor: "#FF7072",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999, // perfect pill
    marginRight: 10,
    backgroundColor: "#FFEEEE",
  },

  chipText: {
    color: "#E4677C",
    fontSize: 13,
    fontWeight: "500",
  },

  /* SERVICES GRID */
  /* GRID */
  servicesGrid: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  /* CARD */
  serviceCard: {
    width: "23%",
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  /* IMAGE */
  serviceImg: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "75%", // ⭐ image top area
    resizeMode: "contain",
  },
  womenHealthImg: {
    resizeMode: "cover", // fill portrait image
    height: "100%",
  },

  /* BOTTOM LABEL BG */
  serviceLabel: {
    height: "35%",
    backgroundColor: "rgba(255,255,255,0.6)", // faded glass
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  /* TITLE */
  serviceText: {
    fontSize: windowWidth > 400 ? 14 : 11, // ⭐ big text
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", // serif look
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: "4%",
    color: "#444444",
    fontSize: 16,
    fontWeight: "500",
  },

  featureRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  featureCard: {
    flex: 1,
    width: windowWidth < 400 ? 160 : 180,
    borderRadius: 18,

    resizeMode: "cover",
  },

  footerTrust: {
    flexDirection: "row",
    backgroundColor: "#FFEEEE",
    borderRadius: 34,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
    alignContent: "center",
    gap: 14,
    justifyContent: "center",
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
    top: 70,
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
});
