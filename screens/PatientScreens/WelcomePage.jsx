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
import mixpanel, { trackButton } from "../../utils/Mixpanel";
import { extractStructuredData } from "../../utils/MedilockerService";
import * as DocumentPicker from "expo-document-picker";
import { ActivityIndicator } from "react-native";

export default function KokoroDoctorScreen() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fileInputRef = useRef(null);
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
  const bounceAnim = useRef(new Animated.Value(0)).current;

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
    const startBounce = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -12,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    startBounce();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

      input.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        setUploadedFiles(files);
        input.value = "";
      });

      document.body.appendChild(input);
      fileInputRef.current = input;

      return () => document.body.removeChild(input);
    }
  }, []);

  const extractFromFiles = async (files) => {
    if (files.length === 0) return;

    setIsGenerating(true);
    setHasError(false); // ✅ ADD THIS
    try {
      const filesWithBase64 = await Promise.all(
        files.map(async (file) => {
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onload = () => {
              const base64 = reader.result.split(",")[1];
              resolve({
                filename: file.name,
                content: base64,
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }),
      );

      const result = await extractStructuredData(filesWithBase64);

      const prescriptionText =
        result?.prescription || result?.data?.prescription || "";

      // 🔥 ADD THIS CHECK
      if (!prescriptionText || prescriptionText.trim() === "") {
        setHasError(true);
        setGeneratedPrescription(null);
        return;
      }

      const prescription = {
        clinicName: "Kokoro.Doctor",
        date: new Date().toLocaleDateString(),
        patientName: result?.patient_details?.name || "",
        age: result?.patient_details?.age || "",
        gender: result?.patient_details?.gender || "",
        diagnosis: result?.patient_details?.diagnosis || "",
        prescriptionReport: prescriptionText,
      };

      setGeneratedPrescription(prescription); // 🔥 KEY LINE
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      extractFromFiles(uploadedFiles);
    }
  }, [uploadedFiles]);

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

  const formatPrescription = (text) => {
    if (!text) return [];

    const lines = text.split("\n");

    let formatted = [];
    let currentSection = null;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) return;

      // Section heading
      if (trimmed.endsWith(":")) {
        currentSection = trimmed;
        formatted.push({
          type: "heading",
          content: trimmed,
        });
      }
      // Bullet points
      else if (trimmed.startsWith("-")) {
        formatted.push({
          type: "bullet",
          content: trimmed.replace("-", "").trim(),
        });
      }
      // Normal text
      else {
        formatted.push({
          type: "text",
          content: trimmed,
        });
      }
    });

    return formatted;
  };

  const formattedData = formatPrescription(
    generatedPrescription?.prescriptionReport,
  );

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
                onPress={() => {
                  // mixpanel.track("Web Navbar - Home Clicked", {
                  //   source: "web-navbar",
                  // });
                  trackButton("navbar_home_button_clicked", {
                    source: "web-navbar",
                  });

                  navigation.navigate("LandingPage");
                }}
              >
                <Text style={webStyles.navText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  trackButton("navbar_OurDoctor_button_clicked", {
                    source: "web-navbar",
                    destination: "DoctorResultShow",
                  });

                  navigation.navigate("PatientAppNavigation", {
                    screen: "Doctors",
                    params: { screen: "DoctorResultShow" },
                  });
                }}
              >
                <Text style={webStyles.navText}>Our Doctor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  trackButton("navbar_doctorLogin_button_clicked", {
                    source: "web-navbar",
                  });

                  navigation.navigate("DoctorAppNavigation", {
                    screen: "DoctorPortalLandingPage",
                  });
                }}
              >
                <Text style={webStyles.navText}>Doctor login</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={webStyles.navBtn}
              onPress={() => {
                trackButton("helpNow_button_clicked", {
                  source: "web-hero",
                  destination: "DoctorResultShow",
                });

                navigation.navigate("PatientAppNavigation", {
                  screen: "Doctors",
                  params: { screen: "DoctorResultShow" },
                });
              }}
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

          <View>
            <Text
              style={{
                color: "#000000",
                fontSize: 64,
                fontWeight: "600",
                fontFamily: "Crimson Text",
                textAlign: "center",
              }}
            >
              Post-Surgery Care Starts the
            </Text>
            <Text
              style={{
                color: "#FF7072",
                fontSize: 64,
                fontWeight: "600",
                fontFamily: "Crimson Text",
                textAlign: "center",
              }}
            >
              Moment you leave the OT
            </Text>
          </View>

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

            {/* <TextInput
              placeholder="Type your medicine name or symptoms..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.newText}
            /> */}
            <TextInput
              placeholder="Type your medicine name or symptoms..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.newText}
              returnKeyType="search"
              blurOnSubmit={false}
              multiline={false}
              onSubmitEditing={() => {
                const textToSend = searchText.trim();
                if (!textToSend) return;

                // mixpanel.track("Web Search Submitted", {
                //   query: textToSend,
                //   source: "web-search-bar",
                // });
                trackButton("search_submitted", {
                  query: textToSend,
                  source: "web-search-bar",
                });

                navigation.navigate("PatientAppNavigation", {
                  screen: "MobileChatbot",
                  params: {
                    presetPrompt: textToSend,
                    source: "medicine-input",
                  },
                });
              }}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === "Enter") {
                  const textToSend = searchText.trim();
                  if (!textToSend) return;

                  navigation.navigate("PatientAppNavigation", {
                    screen: "MobileChatbot",
                    params: {
                      presetPrompt: textToSend,
                      source: "medicine-input",
                    },
                  });
                }
              }}
            />

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => {
                const textToSend = searchText.trim();
                if (!textToSend) return;

                // mixpanel.track("Web Search Button Clicked", {
                //   query: textToSend,
                //   source: "web-search-bar",
                // });
                trackButton("search_button_clicked", {
                  query: textToSend,
                  source: "web-search-bar",
                });

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
                      // mixpanel.track("Web Try Pill Clicked", {
                      //   pill_name: item,
                      //   source: "web-try-section",
                      // });
                      trackButton("try_pill_clicked", {
                        pill_name: item,
                        source: "web-try-section",
                      });

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

          <Animated.View
            style={{
              alignItems: "center",
              marginTop: 15,
              transform: [{ translateY: bounceAnim }],
            }}
          >
            <Text
              style={{
                marginTop: "1%",
                color: "#9CA3AF",
                fontSize: 22,
                marginBottom: 4,
                fontWeight: "600",
              }}
            >
              Try now
            </Text>

            <Ionicons name="chevron-down" size={28} color="#9CA3AF" />
          </Animated.View>

          {/* 🔥 UPLOAD BUTTON (ONLY BEFORE UPLOAD) */}
          {uploadedFiles.length === 0 && (
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => {
                  // 🔥 reset state (IMPORTANT)
                  setUploadedFiles([]);
                  setGeneratedPrescription(null);
                  setHasError(false);
                  setIsGenerating(false);

                  fileInputRef.current?.click();
                }}
                style={{
                  backgroundColor: "#FF4D4D",
                  paddingHorizontal: 28,
                  paddingVertical: 14,
                  borderRadius: 30,
                  width: 320,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center", // 🔥 THIS FIXES CENTER
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}
                >
                  Upload Prescription
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* 🔥 AFTER UPLOAD UI */}
          {uploadedFiles.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: "8%",
                  marginRight: "8%",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderBottomWidth: 0,
                  backgroundColor: "#fff",
                }}
              >
                {/* LEFT */}
                <View
                  style={{
                    width: "45%",
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FEE2E2",
                    padding: 12,
                    borderRightWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <Ionicons name="heart" size={16} color="#EF4444" />
                  <Text style={{ color: "#EF4444", marginLeft: 8 }}>
                    Your uploaded prescription
                  </Text>
                </View>

                {/* RIGHT */}
                <View style={{ flex: 1, padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={require("../../assets/Icons/welcome_Rxicon.png")}
                      style={{ width: 28, height: 28, marginRight: 8 }}
                    />
                    <Text style={{ fontWeight: "600" }}>
                      Clinical AI Assistant
                    </Text>
                  </View>

                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginLeft: 36 }}
                  >
                    You're not alone in this case, we're here to assist.
                  </Text>
                </View>
              </View>
              <View
                style={{
                  marginTop: 0,
                  marginLeft: "8%",
                  marginRight: "8%",
                  flexDirection: "row",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                {/* LEFT SIDE */}
                {/* LEFT SIDE */}
                <View
                  style={{
                    width: "45%",
                    backgroundColor: "#F9FAFB",
                    borderRightWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  {/* 🔥 IMAGE */}
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Image
                      source={{ uri: URL.createObjectURL(uploadedFiles[0]) }}
                      style={{
                        width: "100%",
                        height: 420,
                        resizeMode: "contain",
                      }}
                    />

                    {/* 🔥 UPLOAD ANOTHER BUTTON */}
                    <TouchableOpacity
                      onPress={() => {
                        setUploadedFiles([]);
                        setGeneratedPrescription(null);
                        setHasError(false);
                        setIsGenerating(false);

                        fileInputRef.current?.click();
                      }}
                      style={{
                        marginTop: 20,
                        backgroundColor: "#FF4D4D",
                        paddingHorizontal: 22,
                        paddingVertical: 12,
                        borderRadius: 25,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Upload Another
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#fff"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* RIGHT SIDE */}
                <View style={{ flex: 1, padding: 20 }}>
                  {/* 🔥 RIGHT HEADER (UPDATED) */}

                  {/* CONTENT */}
                  <View style={{ height: 420 }}>
                    {isGenerating ? (
                      <View style={{ alignItems: "center", marginTop: 100 }}>
                        <ActivityIndicator size="large" color="#FF5A5F" />
                        <Text style={{ marginTop: 10 }}>
                          Generating prescription...
                        </Text>
                      </View>
                    ) : hasError ? (
                      <Text style={{ textAlign: "center", marginTop: 100 }}>
                        No prescription report generated
                      </Text>
                    ) : (
                      <ScrollView>
                        {formattedData.map((item, index) => {
                          if (item.type === "heading") {
                            return (
                              <Text
                                key={index}
                                style={{ fontWeight: "700", marginTop: 10 }}
                              >
                                {item.content}
                              </Text>
                            );
                          }

                          if (item.type === "bullet") {
                            return (
                              <Text key={index} style={{ marginLeft: 10 }}>
                                • {item.content}
                              </Text>
                            );
                          }

                          return <Text key={index}>{item.content}</Text>;
                        })}
                      </ScrollView>
                    )}
                  </View>
                </View>
              </View>
            </>
          )}

          {/* ===== SERVICES GRID ===== */}
          <View style={webStyles.servicesGrid}>
            {[
              {
                title: "Talk to Doctor",
                img: require("../../assets/Images/webtalktodr.png"),
                bg: "#E9DDB5",
              },

              {
                title: "Heart Check",
                img: require("../../assets/Images/webstetho.png"),
                bg: "#C9CEF6",
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[webStyles.serviceCard, { backgroundColor: item.bg }]}
                onPress={() => {
                  const title = item.title.replace("\n", " ").trim();

                  // mixpanel.track("Web Service Card Clicked", {
                  //   service_name: title,
                  //   source: "web-services",
                  // });
                  trackButton("service_card_clicked", {
                    service_name: title,
                    source: "web-services",
                  });

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
                    fileInputRef.current?.click();
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
            {/* ABHA CARD */}
            <TouchableOpacity
              style={[webStyles.featureCards, { backgroundColor: "#1E1060" }]}
              onPress={() => {
                trackButton("featured_card_health_clicked", {
                  banner: "start_health_check",
                  source: "web-featured-section",
                  destination: "Abha",
                });
                navigation.navigate("Abha");
              }}
            >
              {/* Top-left text */}
              <View
                style={{ position: "absolute", top: 18, left: 50, zIndex: 2 }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "400" }}
                >
                  Get Your
                </Text>
                <Text
                  style={{ color: "#FF5A5F", fontSize: 28, fontWeight: "800" }}
                >
                  ABHA
                </Text>
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "400" }}
                >
                  Card Here
                </Text>
              </View>

              {/* White ABHA card image — top right */}
              {/* White ABHA card image — top right */}
              <View
                style={{
                  position: "absolute",
                  top: 15,
                  right: 26,
                  width: "55%",
                  height: "70%",
                  borderRadius: 14,
                  overflow: "hidden",
                  zIndex: 0,
                }}
              >
                <Image
                  source={require("../../assets/Images/Abha.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover", // ← fills container, borderRadius clips properly
                  }}
                />
              </View>

              {/* Bottom dark overlay strip */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  backgroundColor: "rgba(10, 5, 50, 0.85)",
                  zIndex: 1,
                }}
              />

              {/* Bottom content row */}
              <View style={[webStyles.featureContent, { zIndex: 3 }]}>
                <View>
                  <Text style={webStyles.featureTitle}>ABHA CARD</Text>
                  <Text style={webStyles.featureSubtitles}>
                    Create Abha Card
                  </Text>
                </View>
                <TouchableOpacity
                  style={webStyles.arrowBtn}
                  onPress={() => {
                    trackButton("featured_card_health_clicked", {
                      banner: "start_health_check",
                      source: "web-featured-arrow",
                      destination: "Abha",
                    });
                    navigation.navigate("Abha");
                  }}
                >
                  <Ionicons name="arrow-forward" size={20} color="#FF5A5F" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* MEDICINE CARD */}
            <TouchableOpacity
              style={webStyles.featureCard}
              onPress={() => navigation.navigate("NewMedicineLandingPage")}
            >
              <ImageBackground
                source={require("../../assets/Images/newbottomCTa1.png")}
                style={webStyles.featureImage}
              >
                <View style={webStyles.realOverlay} />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%", // same as realOverlay height
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center", // vertically centers within shadow
                    paddingHorizontal: 36,
                    zIndex: 3,
                  }}
                >
                  <View>
                    <Text style={webStyles.featureTitle}>
                      Confused About {"\n"}Medicine ?
                    </Text>
                    <Text style={webStyles.featureSubtitle}>
                      just type → Kokoro explains
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={webStyles.arrowBtn}
                    onPress={() => {
                      trackButton("featured_card_Medicine_clicked", {
                        banner: "medicine_explainer",
                        source: "web-featured-section",
                      });
                      navigation.navigate("NewMedicineLandingPage");
                    }}
                  >
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

          <View
            style={{
              marginTop: 40,
              marginLeft: "8%",
              marginRight: "8%",
              backgroundColor: "#EDE7DF",
              padding: 40,
              borderRadius: 20,
              flexDirection: "row", // ⭐ MAIN FIX
              justifyContent: "space-between",
              marginBottom: 40,
            }}
          >
            {/* LEFT SIDE */}
            <View style={{ width: "48%" }}>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 20,
                  fontWeight: "600",
                  fontFamily: "IBM Plex Mono",
                  fontStyle: "SemiBold",
                  marginBottom: 10,
                }}
              >
                The problem we solve
              </Text>

              <Text
                style={{
                  fontSize: 40,
                  fontWeight: "600",
                  lineHeight: 52,
                  color: "#000",
                  marginBottom: 20,
                  fontFamily: "serif",
                }}
              >
                Post surgery is where{"\n"}
                Cardiac care fails{"\n"}
                We're here to fix that.
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  color: "#999999",
                  lineHeight: 24,
                  fontWeight: "400",
                  fontFamily: "Inter",
                }}
              >
                Every year, thousands of Indian patients undergo {"\n"}cardiac
                surgery and go home with a discharge sheet — no explanation,{" "}
                {"\n"}no follow-up plan, no one to call at 3 AM when the chest
                tightens.
                {"\n"}Kokoro was built by doctors who saw this happen too many
                times.
              </Text>
            </View>

            {/* RIGHT SIDE */}
            <View
              style={{
                width: "48%",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {[
                {
                  value: "30 %",
                  text: "of cardiac \nreadmissions happen \nwithin 30 days of discharge",
                },
                {
                  value: "72h",
                  text: "average wait for a \nfollow-up in tier-2 \nIndian cities",
                },
                {
                  value: "67%",
                  text: "of patients don’t \nfully understand \ntheir post-op \nmedicines",
                },
                {
                  value: "₹0",
                  text: "cost to get \nstarted on \nKokoro today",
                },
              ].map((item, i) => (
                <View
                  key={i}
                  style={{
                    width: "48%",
                    backgroundColor: "#F3F4F6",
                    borderRadius: 16,
                    paddingVertical: 24,
                    paddingHorizontal: 18,
                    marginBottom: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: "#FF6B6B",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {item.value}
                  </Text>

                  <Text
                    style={{
                      fontSize: 16,
                      color: "#6B6B6B",
                      textAlign: "center",
                      lineHeight: 18,
                      fontFamily: "Roboto",
                      fontWeight: "500",
                    }}
                  >
                    {item.text}
                  </Text>
                </View>
              ))}
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

            {/* <TouchableOpacity onPress={() => setMenuVisible(true)}> */}
            <TouchableOpacity
              onPress={() => {
                // mixpanel.track("Mobile Menu Opened", {
                //   source: "mobile-header",
                // });
                trackButton("Mobile_Menu_clicked", {
                  source: "mobile-header",
                });

                setMenuVisible(true);
              }}
            >
              <Ionicons name="menu" size={26} />
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={{
                color: "#000000",
                fontSize: 24,
                fontWeight: "600",
                fontFamily: "Crimson Text",
                fontStyle: "SemiBold",
                textAlign: "center",
              }}
            >
              Post-Surgery Care Starts the
            </Text>
            <Text
              style={{
                color: "#FF7072",
                fontSize: 24,
                fontWeight: "600",
                fontFamily: "Crimson Text",
                fontStyle: "SemiBold",
                textAlign: "center",
              }}
            >
              Moment you leave the OT
            </Text>
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

                trackButton("search_button_clicked", {
                  query: textToSend,
                  source: "web-search-bar",
                });

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

                    trackButton("try_pill_clicked", {
                      pill_name: item,
                      source: "web-try-section",
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

          <Animated.View
            style={{
              alignItems: "center",
              marginTop: 15,
              transform: [{ translateY: bounceAnim }],
            }}
          >
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                marginBottom: 4,
                fontWeight: "500",
              }}
            >
              Try now
            </Text>

            <Ionicons name="chevron-down" size={24} color="#9CA3AF" />
          </Animated.View>

          <TouchableOpacity
            style={styles.uploadBtn}
            activeOpacity={0.85}
            onPress={() => {
              setUploadedFiles([]); // ✅ clear old files
              setGeneratedPrescription(null);
              setHasError(false);
              setIsGenerating(false);
              fileInputRef.current?.click();
            }}
          >
            <LinearGradient
              colors={["#FF5A5F", "#FF2D2D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.uploadBtnGradient}
            >
              <Text style={styles.uploadBtnText}>Upload Prescription</Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
                style={{ marginLeft: 10 }}
              />
            </LinearGradient>
          </TouchableOpacity>

          {uploadedFiles.length > 0 && (
            <View
              style={{
                marginTop: 30,
                backgroundColor: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              {/* 🔥 TOP: IMAGE BOX */}
              <LinearGradient
                colors={["#D0D0D0", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                  paddingTop: 20,

                  paddingHorizontal: 20,
                  alignItems: "center",
                }}
              >
                <Image
                  source={
                    Platform.OS === "web"
                      ? { uri: URL.createObjectURL(uploadedFiles[0]) }
                      : { uri: uploadedFiles[0]?.uri }
                  }
                  style={{
                    width: "80%",
                    height: 150,

                    resizeMode: "cover",
                  }}
                />

                <Text
                  style={{
                    color: "#16A34A",
                    fontSize: 14,
                    fontWeight: "500",
                    alignSelf: "flex-end",
                  }}
                >
                  1 Document uploaded
                </Text>
              </LinearGradient>

              {/* 🔥 MIDDLE: HEADER (NOT SCROLLABLE) */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: 10,
                  backgroundColor: "#fff",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={require("../../assets/Icons/welcome_Rxicon.png")}
                    style={{
                      width: 32,
                      height: 32,
                      marginRight: 10,
                    }}
                  />

                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#333",
                      }}
                    >
                      Kokoro Analysis
                    </Text>

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#888",
                        marginTop: 2,
                      }}
                    >
                      AI-powered insights from your prescription
                    </Text>
                  </View>
                </View>

                {/* 🔥 PERFECT DIVIDER */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E5E7EB", // ⭐ clean gray (same as your UI)
                    marginTop: 12,
                  }}
                />
              </View>

              {/* 🔥 BOTTOM: ONLY THIS SCROLLS */}
              <View style={{ height: 220 }}>
                {isGenerating ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size="large" color="#FF5A5F" />
                    <Text style={{ marginTop: 10, color: "#666" }}>
                      Generating prescription...
                    </Text>
                  </View>
                ) : hasError ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#777" }}>
                      No prescription report generated
                    </Text>
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={{ padding: 14 }}>
                    {formattedData.map((item, index) => {
                      if (item.type === "heading") {
                        return (
                          <Text
                            key={index}
                            style={{ fontWeight: "700", marginTop: 10 }}
                          >
                            {item.content}
                          </Text>
                        );
                      }

                      if (item.type === "bullet") {
                        return (
                          <Text key={index} style={{ marginLeft: 10 }}>
                            • {item.content}
                          </Text>
                        );
                      }

                      return <Text key={index}>{item.content}</Text>;
                    })}
                  </ScrollView>
                )}
              </View>
            </View>
          )}

          {/* SERVICES */}
          <View style={styles.servicesGrid}>
            {[
              {
                title: "Talk to Doctor",
                img: require("../../assets/Images/talkdrimg.png"),
                bg: "#E9DDB5",
              },
              {
                title: "Heart Check",
                img: require("../../assets/Images/heart stethoscope transperent 1.png"),
                bg: "#C9CEF6",
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                style={[styles.serviceCard, { backgroundColor: item.bg }]}
                onPress={() => {
                  const title = item.title.replace("\n", " ").trim();

                  // Analytics
                  trackButton("service_card_clicked", {
                    service_name: title,
                    source: "web-services",
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
                    item.title === "Talk to Doctor" && styles.doctorImg, // ⭐ ONLY doctor
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
                  // mixpanel.track("Featured CTA Clicked", {
                  //   banner: "bottomcta1",
                  //   source: "landing-featured",
                  //   destination: "Abha",
                  // });
                  trackButton("featured_card_health_clicked", {
                    banner: "start_health_check",
                    source: "web-featured-section",
                  });

                  navigation.navigate("Abha");
                }}
              >
                <Image
                  source={require("../../assets/Images/CTABOTTOM_mobile.png")}
                  style={styles.featureCard}
                />
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                onPress={() => {
                  // mixpanel.track("Featured CTA Clicked", {
                  //   banner: "bottomcta-know-medicine",
                  //   source: "landing-featured",
                  //   destination: "NewMedicineLandingPage",
                  // });
                  trackButton("featured_card_Medicine_clicked", {
                    banner: "medicine_explainer",
                    source: "web-featured-section",
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

          <View style={styles.problemSection}>
            <Text style={styles.problemSubtitle}>The problem we solve</Text>

            <Text style={styles.problemTitle}>
              Post surgery is where{"\n"}
              Cardiac care fails{"\n"}
              We’re here to fix that.
            </Text>

            <Text style={styles.problemDesc}>
              Every year, thousands of Indian patients undergo {"\n"}cardiac
              surgery and go home with a discharge sheet — {"\n"}no explanation,
              no follow-up plan, no one to call at 3 AM {"\n"}when the chest
              tightens. Kokoro was built by doctors {"\n"}who saw this happen
              too many times.
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>30%</Text>
                <Text style={styles.statText}>
                  of cardiac readmissions happen within 30 days of discharge
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>72h</Text>
                <Text style={styles.statText}>
                  average wait for a follow-up in tier-2 Indian cities
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>67%</Text>
                <Text style={styles.statText}>
                  of patients don’t fully understand their post-op medicines
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>₹0</Text>
                <Text style={styles.statText}>
                  cost to get started on Kokoro today
                </Text>
              </View>
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

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);

                // mixpanel.track("Mobile Menu - Know your medicine Clicked", {
                //   source: "mobile-menu",
                // });
                trackButton("navbar_home_button_clicked", {
                  source: "mobile-menu",
                });

                navigation.navigate("LandingPage");
              }}
            >
              <Text style={styles.menuText}>Home</Text>
            </Pressable>

            {/* Know Your Medicine */}
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);

                // mixpanel.track("Mobile Menu - Know your medicine Clicked", {
                //   source: "mobile-menu",
                // });
                trackButton("MobileMenu_KnowYourMedicine_Button_clicked", {
                  banner: "medicine_explainer",
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

                trackButton("MobileMenu_OurDoctor_button_clicked", {
                  source: "mobile-menu",
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
              <Text style={styles.menuText}>Our Doctors</Text>
            </Pressable>

            {/* Doctor Login */}
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);

                trackButton("MobileMenu_doctorLogin_button_clicked", {
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
    alignSelf: "flex-start",
    marginTop: "1%",
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
    width: 20,
    height: 20,
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
    fontSize: 12,
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
    marginTop: 20,
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
  waveImage: {
    width: 220,
    height: 35,
    marginTop: -10,
    marginBottom: 20,
  },

  // featureCard: {
  //   width: 450,
  //   height: 260,
  //   // aspectRatio: 1.95, // ⭐ EXACT ratio for your banner

  //   // height: 180, // ⭐ fixed height for consistency
  //   borderRadius: 20,
  //   overflow: "hidden",
  //   ...Platform.select({
  //     macos: {
  //       aspectRatio: 1.95, // ⭐ EXACT ratio for your banner
  //     },
  //   }),
  // },

  // featureCards: {
  //   width: 450,
  //   height: 260,
  //   // aspectRatio: 2.2, // ⭐ EXACT ratio for your banner
  //   justifyContent: "flex-end",
  //   // height: 180, // ⭐ fixed height for consistency
  //   borderRadius: 20,
  //   overflow: "hidden",
  //   ...Platform.select({
  //     macos: {
  //       aspectRatio: 1.95, // ⭐ EXACT ratio for your banner
  //     },
  //   }),
  // },

  featureImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featureCard: {
    width: "48%",
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
  },

  featureCards: {
    width: "48%",
    height: 260,
    justifyContent: "flex-end",
    borderRadius: 20,
    overflow: "hidden",
  },

  featureImages: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    alignSelf: "flex-end ",
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

    bottom: 12,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },

  featureTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "600",
  },

  featureSubtitle: {
    color: "#e5e5e5",
    fontSize: 15,
    marginTop: 6,
  },

  featureSubtitles: {
    color: "#e5e5e5",
    fontSize: 15,
    marginTop: 6,
    marginBottom: "16%",
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

    marginTop: 40,
    backgroundColor: "#FFEAEA",
    borderRadius: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },

  trustImg: {
    width: 70,
    height: 70,
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
    marginLeft: "8%",
    marginRight: "8%",
    marginTop: "1%",
    // width: "100%", // ⭐ force full width
    width: "auto",
    height: 150,
    paddingLeft: 50,
    paddingRight: 20,
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
    marginTop: "1%",
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
  },

  heroBtn: {
    marginTop: "2%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 40,
    alignSelf: "flex-start",
  },

  heroBtnText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },

  heroDoctor: {
    alignSelf: "baseline",
    width: 205,
    height: 165,
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
    width: "48%",
    height: 240, // ⭐ increase height
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
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#AAAAAA",
    paddingVertical: 16,
    paddingLeft: 12,
    borderRadius: 14,
    fontSize: 20,
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
    height: 45, // same row height
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
    paddingVertical: 6,
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
  uploadBtn: {
    alignSelf: "center",
  },

  uploadBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#FF4D4D",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  uploadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* SERVICES GRID */
  /* GRID */
  servicesGrid: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10, // ⭐ add this (if supported)
  },

  /* CARD */
  serviceCard: {
    width: "48%",
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
  doctorImg: {
    position: "absolute",
    bottom: 0, // stick to bottom
    height: "100%", // fill entire card height

    resizeMode: "contain", // fill nicely
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
    fontSize: windowWidth > 400 ? 14 : 14, // ⭐ big text
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "Crimson Text", // serif look
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

    resizeMode: "contain",
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
  problemSection: {
    marginTop: 20,

    // 👇 THIS is the key fix
    marginLeft: -16,
    marginRight: -16,
    marginBottom: -16,

    // keep internal spacing
    paddingHorizontal: 16,

    paddingBottom: 30,

    backgroundColor: "#FFFAF4",
  },

  problemSubtitle: {
    paddingTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 6,
    fontFamily: "IBM Plex Mono",
    fontWeight: "600",
  },

  problemTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "500",
    color: "#000000",
    lineHeight: 28,
    fontFamily: "Playfair Display",
  },

  problemDesc: {
    fontFamily: "Inter",
    textAlign: "center",
    fontSize: 14,
    color: "#999999",
    marginTop: 12,
    lineHeight: 18,
    fontWeight: "400",
  },

  statsGrid: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  statNumber: {
    color: "#FF6B6B",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },

  statText: {
    fontFamily: "Roboto",
    fontSize: 12,
    color: "#6B6B6B",
    lineHeight: 16,
    textAlign: "center",
    fontStyle: "Medium",
    fontWeight: "500",
  },
});
