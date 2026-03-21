import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import mixpanel from "../utils/Mixpanel";
const { width, height } = Dimensions.get("window");
import { Animated, Easing } from "react-native";
import { useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import frame1 from "../assets/Images/groupp1.png.png";
import SideBarNavigation from "../components/PatientScreenComponents/SideBarNavigation";
import HeaderLoginSignUp from "../components/PatientScreenComponents/HeaderLoginSignUp";

const COLORS = {
  coral: "#E8504A",
  coralLight: "#F06B5D",
  coralPale: "#FFF1F0",
  coralMid: "#F5C4C0",
  rose: "#C0392B",
  roseLight: "#FFE8E6",
  bg: "#FDF5F4",
  white: "#FFFFFF",
  text: "#2C1A1A",
  muted: "#8A6060",
  border: "#F2DADA",
  dark: "#2C1A1A",
};

const AbhaLandingScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [authTab, setAuthTab] = useState("aadhaar");
  const [aadhaarInputs, setAadhaarInputs] = useState(["", "", ""]);
  const [mobileInput, setMobileInput] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedOptions, setExpandedOptions] = useState(false);
  const [comingSoonVisible, setComingSoonVisible] = useState(false);
  const scrollRef = useRef(null);
  const abhaInfoRef = useRef(null);
  const abhaY = useRef(0);

  // ✅ PASTE HERE
  const measureAbhaPosition = () => {
    if (abhaInfoRef.current && scrollRef.current) {
      abhaInfoRef.current.measureLayout(
        scrollRef.current,
        (x, y) => {
          abhaY.current = y;
        },
        (err) => console.log(err),
      );
    }
  };

  const scrollToAbhaInfo = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: abhaY.current - 40,
        animated: true,
      });
    }
  };
  useEffect(() => {
    setTimeout(() => {
      measureAbhaPosition();
    }, 300); // wait for layout to settle
  }, []);

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    floatAnim.setValue(0); // IMPORTANT RESET

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true }, // KEY FIX
    );

    animation.start();

    return () => animation.stop(); // cleanup
  }, []);

  // Prevent navigation away when user clicks Abha again
  useFocusEffect(
    useCallback(() => {
      // This ensures the screen stays focused and prevents redirect
      return () => {};
    }, []),
  );

  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  });

  const handleAadhaarInput = (index, value) => {
    const newInputs = [...aadhaarInputs];
    newInputs[index] = value.replace(/[^0-9]/g, "").slice(0, 4);
    setAadhaarInputs(newInputs);
  };

  const isAadhaarFilled = aadhaarInputs.every((input) => input.length === 4);
  const isMobileFilled = mobileInput.replace(/[^0-9]/g, "").length === 10;
  const isFormFilled = authTab === "aadhaar" ? isAadhaarFilled : isMobileFilled;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setAuthTab("aadhaar");
    setAadhaarInputs(["", "", ""]);
    setMobileInput("");
  };

  const openModal = () => {
    resetModal();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={webStyles.container}>
          <View style={webStyles.Left}>
            <SideBarNavigation navigation={navigation} />
          </View>
          <View style={webStyles.Right}>
            <ScrollView ref={scrollRef}>
              {/* HERO SECTION */}
              <View style={webStyles.hero}>
                <View style={webStyles.heroLeft}>
                  <View style={webStyles.heroBadge}>
                    <View style={webStyles.badgeDot} />
                    <Text style={webStyles.badgeText}>
                      National Health Authority · GOVT OF INDIA
                    </Text>
                  </View>

                  <Text style={webStyles.heroTitle}>
                    Your Digital{"\n"}
                    <Text style={webStyles.heroTitleColored}>Health ID</Text>
                    {"\n"}is Here
                  </Text>

                  <Text style={webStyles.heroDescription}>
                    ABHA (Ayushman Bharat Health Account) is your personal
                    health passport — store records, book appointments, and
                    share data securely across India's healthcare network.
                  </Text>

                  <View style={webStyles.heroButtonGroup}>
                    <TouchableOpacity
                      style={webStyles.btnHeroPrimary}
                      onPress={() => setComingSoonVisible(true)}
                    >
                      <Text style={webStyles.btnHeroPrimaryText}>
                        👤 CREATE YOUR ABHA
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webStyles.btnHeroSecondary}
                      onPress={() => setComingSoonVisible(true)}
                    >
                      <Text style={webStyles.btnHeroSecondaryText}>
                        Login to ABHA →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ABHA CARD */}
                <View style={webStyles.heroRight}>
                  <View style={webStyles.cardWrapperWeb}>
                    {/* Background gradient image */}
                    <Image
                      source={require("../assets/Images/Rectangle 25.png")}
                      style={webStyles.bgGradientWeb}
                    />

                    {/* FLOATING FRAME (ANIMATION) */}
                    <Animated.Image
                      source={frame1}
                      style={[
                        webStyles.frameImageWeb,
                        {
                          transform: [
                            { translateY },
                            { rotate }, // remove if you want cleaner motion
                          ],
                        },
                      ]}
                    />

                    {/* ABHA CARD (same design as mobile) */}
                    <View style={webStyles.abhaCardWeb}>
                      <View style={webStyles.cardHeaderWeb}>
                        <View style={webStyles.cardChipWeb}>
                          <Ionicons
                            name="hardware-chip-outline"
                            size={20}
                            color="#fff"
                          />
                        </View>

                        <Text style={webStyles.cardOrgWeb}>
                          National{"\n"}health{"\n"}authority
                        </Text>
                      </View>

                      <View style={webStyles.cardBodyWeb}>
                        <View style={webStyles.profileIconWeb}>
                          <Ionicons
                            name="person-outline"
                            size={22}
                            color="#fff"
                          />
                        </View>

                        <View>
                          <Text style={webStyles.cardNameWeb}>Your Name</Text>
                          <Text style={webStyles.cardNumberWeb}>
                            XXXX XXXX XXXX 7896
                          </Text>
                        </View>
                      </View>

                      <Text style={webStyles.cardFooterWeb}>
                        AYUSHMAN BHARAT HEALTH ACCOUNT GOVT OF INDIA
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* WHY ABHA SECTION */}
              <View style={webStyles.whySection}>
                {/* LEFT IMAGE */}
                <View style={webStyles.whyImageContainer}>
                  <Image
                    source={require("../assets/Images/Abha_second.png")}
                    style={webStyles.whyImage}
                    resizeMode="cover"
                  />
                </View>

                {/* RIGHT CONTENT */}
                <View style={webStyles.whyContent}>
                  <Text style={webStyles.whyLabel}>Why ABHA</Text>

                  <Text style={webStyles.whyTitle}>
                    You can use your{"\n"}ABHA ID to
                  </Text>

                  <Image
                    source={require("../assets/Images/line_Abha.png")}
                    style={webStyles.waveImage}
                    resizeMode="contain"
                  />

                  <View style={webStyles.whyItem}>
                    <Text style={webStyles.whyIcon}>📁</Text>
                    <View>
                      <Text style={webStyles.whyItemTitle}>
                        Store Medical Records Digitally
                      </Text>
                      <Text style={webStyles.whyItemDesc}>
                        All prescriptions, lab reports and health history in one
                        place, accessible anytime.
                      </Text>
                    </View>
                  </View>

                  <View style={webStyles.whyItem}>
                    <Text style={webStyles.whyIcon}>🏥</Text>
                    <View>
                      <Text style={webStyles.whyItemTitle}>
                        Book Hospital Appointments
                      </Text>
                      <Text style={webStyles.whyItemDesc}>
                        Schedule visits to government and private hospitals
                        without standing in queues.
                      </Text>
                    </View>
                  </View>

                  <View style={webStyles.whyItem}>
                    <Text style={webStyles.whyIcon}>🛡️</Text>
                    <View>
                      <Text style={webStyles.whyItemTitle}>
                        Share Health Data Securely
                      </Text>
                      <Text style={webStyles.whyItemDesc}>
                        Consent-based sharing with doctors and facilities — full
                        control stays with you.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={webStyles.abhaInfoSection} ref={abhaInfoRef}>
                {/* LEFT CONTENT */}
                <View style={webStyles.abhaInfoLeft}>
                  <Text style={webStyles.abhaSmallTitle}>What is ABHA?</Text>

                  <Text style={webStyles.abhaBigTitle}>
                    Your complete{"\n"}digital health{"\n"}identity
                  </Text>

                  <Text style={webStyles.abhaDesc}>
                    ABHA (Ayushman Bharat Health Account) {"\n"}is your digital
                    health account.{"\n"}After creating ABHA, you receive a{" "}
                    {"\n"}
                    unique 14-digit number and address to{"\n"}access and save
                    all your{"\n"}
                    medical information securely.
                  </Text>
                </View>

                {/* RIGHT FEATURES GRID */}
                <View style={webStyles.abhaFeaturesGrid}>
                  <View style={webStyles.abhaFeatureCard}>
                    <View
                      style={[
                        webStyles.featureIconBox,
                        { backgroundColor: "#E8F0FF" },
                      ]}
                    >
                      <Ionicons name="folder" size={20} color="#3B82F6" />
                    </View>
                    <Text style={webStyles.featureText}>
                      Personal Health Records
                    </Text>
                  </View>

                  <View style={webStyles.abhaFeatureCard}>
                    <View
                      style={[
                        webStyles.featureIconBox,
                        { backgroundColor: "#E7F8F5" },
                      ]}
                    >
                      <Ionicons name="hand-left" size={20} color="#10B981" />
                    </View>
                    <Text style={webStyles.featureText}>Voluntary Opt-In</Text>
                  </View>

                  <View style={webStyles.abhaFeatureCard}>
                    <View
                      style={[
                        webStyles.featureIconBox,
                        { backgroundColor: "#F3E8FF" },
                      ]}
                    >
                      <Ionicons name="link" size={20} color="#8B5CF6" />
                    </View>
                    <Text style={webStyles.featureText}>Digital Records</Text>
                  </View>

                  <View style={webStyles.abhaFeatureCard}>
                    <View
                      style={[
                        webStyles.featureIconBox,
                        { backgroundColor: "#E8F7EE" },
                      ]}
                    >
                      <Ionicons name="checkbox" size={20} color="#22C55E" />
                    </View>
                    <Text style={webStyles.featureText}>Easy Sign Up</Text>
                  </View>

                  <View style={webStyles.abhaFeatureCard}>
                    <View
                      style={[
                        webStyles.featureIconBox,
                        { backgroundColor: "#FFF3D6" },
                      ]}
                    >
                      <Ionicons name="key" size={20} color="#F59E0B" />
                    </View>
                    <Text style={webStyles.featureText}>Consent Based</Text>
                  </View>

                  <View style={webStyles.abhaFeatureCard}>
                    <View
                      style={[
                        webStyles.featureIconBox,
                        { backgroundColor: "#FFE8E8" },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={20}
                        color="#EF4444"
                      />
                    </View>
                    <Text style={webStyles.featureText}>Secure & Private</Text>
                  </View>
                </View>
              </View>

              <View style={webStyles.statsRow}>
                <View style={webStyles.statBox}>
                  <View style={webStyles.statIconWrap}>
                    <Ionicons name="people-outline" size={22} color="#fff" />
                  </View>

                  <Text style={webStyles.statNumber}>600M+</Text>
                  <Text style={webStyles.statText}>Records linked</Text>
                </View>

                <View style={webStyles.statBox}>
                  <View style={webStyles.statIconWrap}>
                    <Ionicons name="globe-outline" size={22} color="#fff" />
                  </View>

                  <Text style={webStyles.statNumber}>500+</Text>
                  <Text style={webStyles.statText}>Partner hospitals</Text>
                </View>

                <View style={webStyles.statBox}>
                  <View style={webStyles.statIconWrap}>
                    <Feather name="box" size={22} color="#fff" />
                  </View>

                  <Text style={webStyles.statNumber}>Free</Text>
                  <Text style={webStyles.statText}>Always Free</Text>
                </View>
              </View>

              <View style={webStyles.howSectionWeb}>
                <Text style={webStyles.howBadgeWeb}>How it Works</Text>

                <Text style={webStyles.howTitleWeb}>
                  Get your ABHA in 4 steps
                </Text>

                <View style={webStyles.stepsWrapperWeb}>
                  {/* Vertical Line */}
                  <View style={webStyles.timelineLineWeb} />

                  {/* Step 1 */}
                  <View style={webStyles.stepRowWeb}>
                    <View style={webStyles.stepCircleWeb}>
                      <Text style={webStyles.stepNumberWeb}>1</Text>
                    </View>

                    <View>
                      <Text style={webStyles.stepTitleWeb}>
                        Click "Create ABHA"
                      </Text>
                      <Text style={webStyles.stepDescWeb}>
                        Start registration with a click — no paperwork required.
                      </Text>
                    </View>
                  </View>

                  {/* Step 2 */}
                  <View style={webStyles.stepRowWeb}>
                    <View style={webStyles.stepCircleWeb}>
                      <Text style={webStyles.stepNumberWeb}>2</Text>
                    </View>

                    <View>
                      <Text style={webStyles.stepTitleWeb}>
                        Verify with Aadhaar or Mobile
                      </Text>
                      <Text style={webStyles.stepDescWeb}>
                        Quick, secure identity verification in seconds.
                      </Text>
                    </View>
                  </View>

                  {/* Step 3 */}
                  <View style={webStyles.stepRowWeb}>
                    <View style={webStyles.stepCircleWeb}>
                      <Text style={webStyles.stepNumberWeb}>3</Text>
                    </View>

                    <View>
                      <Text style={webStyles.stepTitleWeb}>
                        Get Your ABHA Number
                      </Text>
                      <Text style={webStyles.stepDescWeb}>
                        Receive your unique 14-digit number and health address.
                      </Text>
                    </View>
                  </View>

                  {/* Step 4 */}
                  <View style={webStyles.stepRowWeb}>
                    <View style={webStyles.stepCircleWeb}>
                      <Text style={webStyles.stepNumberWeb}>4</Text>
                    </View>

                    <View>
                      <Text style={webStyles.stepTitleWeb}>
                        Start Using Your Health ID
                      </Text>
                      <Text style={webStyles.stepDescWeb}>
                        Link records, book appointments, share with providers.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={webStyles.ctaWrapperWeb}>
                <LinearGradient
                  colors={["#FF5F5F", "#FF3B3B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={webStyles.ctaCardWeb}
                >
                  <Text style={webStyles.ctaTitleWeb}>
                    Still have doubts?{"\n"}Learn more about ABHA
                  </Text>

                  <Text style={webStyles.ctaDescWeb}>
                    Join millions of Indians managing health digitally. Free,
                    voluntary, and takes minutes to set up.
                  </Text>

                  {/* PRIMARY BUTTON */}
                  <TouchableOpacity
                    style={webStyles.ctaPrimaryBtnWeb}
                    onPress={() => setComingSoonVisible(true)}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={16}
                      color="#FF5F5F"
                    />
                    <Text style={webStyles.ctaPrimaryTextWeb}>
                      CREATE YOUR ABHA
                    </Text>
                  </TouchableOpacity>

                  {/* SECONDARY BUTTON */}
                  <TouchableOpacity
                    style={webStyles.ctaSecondaryBtnWeb}
                    onPress={scrollToAbhaInfo}
                  >
                    <Text style={webStyles.ctaSecondaryTextWeb}>
                      Learn More
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1, backgroundColor: "#fff" }}
              contentContainerStyle={{ backgroundColor: "#fff" }}
            >
              <StatusBar barStyle="light-content" backgroundColor="#fff" />
              <View style={mobileStyles.header}>
                <HeaderLoginSignUp navigation={navigation} />
              </View>

              <View style={mobileStyles.heroContainer}>
                {/* Badge */}
                <View style={mobileStyles.badge}>
                  <Ionicons name="search" size={12} color="#FF6B6B" />
                  <Text style={mobileStyles.badgeText}>
                    National Health Authority · GOVT OF INDIA
                  </Text>
                </View>

                {/* Heading */}
                <Text style={mobileStyles.title}>
                  Your Digital{"\n"}
                  <Text style={mobileStyles.titleHighlight}>Health ID</Text>
                  {"\n"}
                  is here
                </Text>

                {/* Description */}
                <Text style={mobileStyles.description}>
                  ABHA (Ayushman Bharat Health Account) is your personal health
                  passport — store records, book appointments, and share data
                  securely across India's healthcare network.
                </Text>

                {/* Create ABHA Button */}
                <TouchableOpacity
                  style={mobileStyles.primaryBtn}
                  onPress={() => setComingSoonVisible(true)}
                >
                  <Ionicons name="person-add-outline" size={16} color="#fff" />
                  <Text style={mobileStyles.primaryBtnText}>
                    CREATE YOUR ABHA
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  style={mobileStyles.secondaryBtn}
                  onPress={() => setComingSoonVisible(true)}
                >
                  <Text style={mobileStyles.secondaryBtnText}>
                    Login to ABHA
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={mobileStyles.cardSection}>
                <View style={mobileStyles.cardWrapper}>
                  {/* Background Gradient */}
                  <Image
                    source={require("../assets/Images/Rectangle 25.png")}
                    style={mobileStyles.bgGradient}
                  />

                  <Animated.Image
                    source={frame1} // use ONE image only
                    style={[
                      mobileStyles.frameImage,
                      {
                        transform: [
                          { translateY },
                          { rotate }, // optional (remove if too much)
                        ],
                      },
                    ]}
                  />

                  {/* ABHA CARD */}

                  <View style={mobileStyles.abhaCard}>
                    {/* Header */}
                    <View style={mobileStyles.cardHeader}>
                      <View style={mobileStyles.cardChip}>
                        <Ionicons
                          name="hardware-chip-outline"
                          size={18}
                          color="#fff"
                        />
                      </View>

                      <Text style={mobileStyles.cardOrg}>
                        National{"\n"}health{"\n"}authority
                      </Text>
                    </View>

                    {/* Card Content */}
                    <View style={mobileStyles.cardBody}>
                      <View style={mobileStyles.profileIcon}>
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color="#fff"
                        />
                      </View>

                      <View>
                        <Text style={mobileStyles.cardName}>Your Name</Text>

                        <Text style={mobileStyles.cardNumber}>
                          XXXX XXXX XXXX 7896
                        </Text>
                      </View>
                    </View>

                    <Text style={mobileStyles.cardFooter}>
                      AYUSHMAN BHARAT HEALTH ACCOUNT GOVT OF INDIA
                    </Text>
                  </View>
                </View>
              </View>

              <View style={mobileStyles.whySection}>
                <Text style={mobileStyles.whyLabel}>Why ABHA</Text>

                <Text style={mobileStyles.whyTitle}>
                  You can use your{"\n"}ABHA ID to
                </Text>

                <Image
                  source={require("../assets/Images/line_Abha.png")}
                  style={mobileStyles.waveLine}
                  resizeMode="contain"
                />

                {/* Item 1 */}
                <View style={mobileStyles.whyItem}>
                  <Ionicons name="folder-outline" size={22} color="#FF6B6B" />
                  <View style={{ flex: 1 }}>
                    <Text style={mobileStyles.whyItemTitle}>
                      Store Medical Records Digitally
                    </Text>
                    <Text style={mobileStyles.whyItemDesc}>
                      All prescriptions, lab reports and health history in one
                      place, accessible anytime.
                    </Text>
                  </View>
                </View>

                {/* Item 2 */}
                <View style={mobileStyles.whyItem}>
                  <Ionicons name="business-outline" size={22} color="#FF6B6B" />
                  <View style={{ flex: 1 }}>
                    <Text style={mobileStyles.whyItemTitle}>
                      Book Hospital Appointments
                    </Text>
                    <Text style={mobileStyles.whyItemDesc}>
                      Schedule visits to government and private hospitals
                      without standing in queues.
                    </Text>
                  </View>
                </View>

                {/* Item 3 */}
                <View style={mobileStyles.whyItem}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={22}
                    color="#FF6B6B"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={mobileStyles.whyItemTitle}>
                      Share Health Data Securely
                    </Text>
                    <Text style={mobileStyles.whyItemDesc}>
                      Consent-based sharing with doctors and facilities — full
                      control stays with you.
                    </Text>
                  </View>
                </View>

                {/* Hospital Image */}
                <Image
                  source={require("../assets/Images/Abha_second.png")}
                  style={mobileStyles.whyImageMobile}
                  resizeMode="cover"
                />
              </View>

              <View
                style={mobileStyles.abhaInfoSection}
                onLayout={(event) => {
                  abhaY.current = event.nativeEvent.layout.y;
                }}
              >
                <Text style={mobileStyles.abhaSmallTitle}>What is ABHA?</Text>

                <Text style={mobileStyles.abhaBigTitle}>
                  Your complete digital{"\n"}health identity
                </Text>

                <Text style={mobileStyles.abhaDesc}>
                  ABHA (Ayushman Bharat Health Account) is your digital health
                  account. After creating ABHA, you receive a unique 14-digit
                  number and address to access and save all your medical
                  information securely.
                </Text>

                <View style={mobileStyles.abhaGrid}>
                  {/* 1 */}
                  <View style={mobileStyles.featureItem}>
                    <View
                      style={[
                        mobileStyles.iconBox,
                        { backgroundColor: "#E8F0FF" },
                      ]}
                    >
                      <Ionicons
                        name="folder-outline"
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                    <Text style={mobileStyles.featureText}>
                      Personal Health Records
                    </Text>
                  </View>

                  {/* 2 */}
                  <View style={mobileStyles.featureItem}>
                    <View
                      style={[
                        mobileStyles.iconBox,
                        { backgroundColor: "#E7F8F5" },
                      ]}
                    >
                      <Ionicons
                        name="hand-left-outline"
                        size={20}
                        color="#10B981"
                      />
                    </View>
                    <Text style={mobileStyles.featureText}>
                      Voluntary Opt-In
                    </Text>
                  </View>

                  {/* 3 */}
                  <View style={mobileStyles.featureItem}>
                    <View
                      style={[
                        mobileStyles.iconBox,
                        { backgroundColor: "#F3E8FF" },
                      ]}
                    >
                      <Ionicons name="link-outline" size={20} color="#8B5CF6" />
                    </View>
                    <Text style={mobileStyles.featureText}>
                      Digital Records
                    </Text>
                  </View>

                  {/* 4 */}
                  <View style={mobileStyles.featureItem}>
                    <View
                      style={[
                        mobileStyles.iconBox,
                        { backgroundColor: "#E8F7EE" },
                      ]}
                    >
                      <Ionicons
                        name="checkbox-outline"
                        size={20}
                        color="#22C55E"
                      />
                    </View>
                    <Text style={mobileStyles.featureText}>Easy Sign Up</Text>
                  </View>

                  {/* 5 */}
                  <View style={mobileStyles.featureItem}>
                    <View
                      style={[
                        mobileStyles.iconBox,
                        { backgroundColor: "#FFF3D6" },
                      ]}
                    >
                      <Ionicons name="key-outline" size={20} color="#F59E0B" />
                    </View>
                    <Text style={mobileStyles.featureText}>Consent Based</Text>
                  </View>

                  {/* 6 */}
                  <View style={mobileStyles.featureItem}>
                    <View
                      style={[
                        mobileStyles.iconBox,
                        { backgroundColor: "#FFE8E8" },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </View>
                    <Text style={mobileStyles.featureText}>
                      Secure & Private
                    </Text>
                  </View>
                </View>
              </View>

              <View style={mobileStyles.statsRow}>
                <View style={mobileStyles.statCard}>
                  <View style={mobileStyles.statIconWrap}>
                    <Ionicons name="people-outline" size={20} color="#fff" />
                  </View>

                  <Text style={mobileStyles.statNumber}>600M+</Text>
                  <Text style={mobileStyles.statLabel}>Records linked</Text>
                </View>

                <View style={mobileStyles.statCard}>
                  <View style={mobileStyles.statIconWrap}>
                    <Ionicons name="globe-outline" size={20} color="#fff" />
                  </View>

                  <Text style={mobileStyles.statNumber}>500+</Text>
                  <Text style={mobileStyles.statLabel}>Partner hospitals</Text>
                </View>

                <View style={mobileStyles.statCard}>
                  <View style={mobileStyles.statIconWrap}>
                    <Feather name="box" size={20} color="#fff" />
                  </View>

                  <Text style={mobileStyles.statNumber}>Free</Text>
                  <Text style={mobileStyles.statLabel}>Always Free</Text>
                </View>
              </View>

              <View style={mobileStyles.howSection}>
                <Text style={mobileStyles.howBadge}>How it Works</Text>

                <Text style={mobileStyles.howTitle}>
                  Get your ABHA in 4 steps
                </Text>

                <View style={mobileStyles.stepsWrapper}>
                  {/* Vertical line */}
                  <View style={mobileStyles.timelineLine} />

                  {/* Step 1 */}
                  <View style={mobileStyles.stepRow}>
                    <View style={mobileStyles.stepCircle}>
                      <Text style={mobileStyles.stepNumber}>1</Text>
                    </View>

                    <View style={mobileStyles.stepTextContainer}>
                      <Text style={mobileStyles.stepTitle}>
                        Click "Create ABHA"
                      </Text>
                      <Text style={mobileStyles.stepDesc}>
                        Start registration with a click — no paperwork required.
                      </Text>
                    </View>
                  </View>

                  {/* Step 2 */}
                  <View style={mobileStyles.stepRow}>
                    <View style={mobileStyles.stepCircle}>
                      <Text style={mobileStyles.stepNumber}>2</Text>
                    </View>

                    <View style={mobileStyles.stepTextContainer}>
                      <Text style={mobileStyles.stepTitle}>
                        Verify with Aadhaar or Mobile
                      </Text>
                      <Text style={mobileStyles.stepDesc}>
                        Quick, secure identity verification in seconds.
                      </Text>
                    </View>
                  </View>

                  {/* Step 3 */}
                  <View style={mobileStyles.stepRow}>
                    <View style={mobileStyles.stepCircle}>
                      <Text style={mobileStyles.stepNumber}>3</Text>
                    </View>

                    <View style={mobileStyles.stepTextContainer}>
                      <Text style={mobileStyles.stepTitle}>
                        Get Your ABHA Number
                      </Text>
                      <Text style={mobileStyles.stepDesc}>
                        Receive your unique 14-digit number and health address.
                      </Text>
                    </View>
                  </View>

                  {/* Step 4 */}
                  <View style={mobileStyles.stepRow}>
                    <View style={mobileStyles.stepCircle}>
                      <Text style={mobileStyles.stepNumber}>4</Text>
                    </View>

                    <View style={mobileStyles.stepTextContainer}>
                      <Text style={mobileStyles.stepTitle}>
                        Start Using Your Health ID
                      </Text>
                      <Text style={mobileStyles.stepDesc}>
                        Link records, book appointments, share with providers.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={mobileStyles.ctaWrapper}>
                <LinearGradient
                  colors={["#FF5F5F", "#FF3B3B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={mobileStyles.ctaCard}
                >
                  <Text style={mobileStyles.ctaTitle}>
                    Still have doubts?{"\n"}Learn more about ABHA
                  </Text>

                  <Text style={mobileStyles.ctaDesc}>
                    Join millions of Indians managing health digitally. Free,
                    voluntary, and takes minutes to set up.
                  </Text>

                  <TouchableOpacity
                    style={mobileStyles.ctaPrimaryBtn}
                    onPress={() => setComingSoonVisible(true)}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={16}
                      color="#FF5F5F"
                    />
                    <Text style={mobileStyles.ctaPrimaryText}>
                      CREATE YOUR ABHA
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={mobileStyles.ctaSecondaryBtn}
                    onPress={scrollToAbhaInfo}
                  >
                    <Text style={mobileStyles.ctaSecondaryText}>
                      Learn More
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
      <Modal
        visible={comingSoonVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setComingSoonVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>🚧 Coming Soon</Text>

            <Text style={styles.popupText}>
              This feature is currently under development.
            </Text>

            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => setComingSoonVisible(false)}
            >
              <Text style={styles.popupBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const windowWidth = Dimensions.get("window").width;

const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  Left: {
    width: "15%",
  },
  Right: {
    width: "85%",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 32,
    marginRight: 6,
  },
  logooText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#444444",
  },
  navLinks: {
    flexDirection: "row",
    gap: 30,
    alignContent: "center",
    alignSelf: "center",
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

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navLeft: {
    flex: 1,
  },
  navRight: {
    flexDirection: "row",
    gap: 8,
  },
  navLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.coral,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    fontSize: 20,
  },
  logoText: {
    fontFamily: "Sora",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.coral,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: COLORS.coral,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  btnOutlineText: {
    color: COLORS.coral,
    fontSize: 12,
    fontWeight: "600",
  },
  btnSolid: {
    backgroundColor: COLORS.coral,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 50,
  },
  btnSolidText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },

  /* HERO */
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: "10%",
    paddingRight: "10%",
    paddingTop: "10%",
    paddingBottom: "5%",
    gap: 64,
  },
  heroLeft: {
    flex: 1,
    maxWidth: 520,
    gap: 20,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.coralPale,
    borderWidth: 1,
    borderColor: COLORS.coralMid,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.coral,
    borderRadius: 3,
  },
  badgeText: {
    color: COLORS.coral,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 64,
    letterSpacing: -1,
  },
  heroTitleColored: {
    color: COLORS.coral,
  },
  heroDescription: {
    fontSize: 16,
    color: COLORS.muted,
    lineHeight: 26,
    maxWidth: 480,
  },
  heroButtonGroup: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },
  btnHeroPrimary: {
    flex: 1, // 👈 ADD THIS
    backgroundColor: COLORS.coral,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  btnHeroPrimaryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  btnHeroSecondary: {
    flex: 1, // 👈 ADD THIS
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
  },
  btnHeroSecondaryText: {
    color: COLORS.coral,
    fontSize: 14,
    fontWeight: "600",
  },

  /* ABHA CARD */
  heroRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  abhaCard: {
    width: 380,
    borderRadius: 20,
    padding: 28,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cardLogoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLeaf: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  leafIcon: {
    fontSize: 20,
  },
  cardOrg: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "500",
    textAlign: "right",
    lineHeight: 12,
    opacity: 0.85,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: 32,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardNumber: {
    color: COLORS.white,
    fontSize: 10,
    opacity: 0.75,
    letterSpacing: 0.5,
  },
  cardBars: {
    flexDirection: "column",
    gap: 4,
    marginTop: 6,
  },
  cardBar: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1.5,
  },
  cardQR: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qrText: {
    fontSize: 28,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  cardFooterText: {
    color: COLORS.white,
    fontSize: 8,
    opacity: 0.7,
    letterSpacing: 0.3,
  },

  whySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 100,
    paddingRight: 100,
    paddingVertical: 50,
    backgroundColor: "#FAFAFA",
  },

  whyImageContainer: {
    flex: 1,
    alignItems: "center",
  },

  whyImage: {
    width: 480,
    height: 320,
    borderRadius: 8,
  },

  whyContent: {
    flex: 1,
    alignItems: "center",
  },

  whyLabel: {
    color: "#FF7072",
    fontWeight: "500",
    fontSize: 24,
    marginBottom: 10,
  },

  whyTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#000000",

    lineHeight: 44,
    textAlign: "center",
  },
  waveImage: {
    width: 220,
    height: 35,
    marginTop: -10,
    marginBottom: 20,
  },

  whyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },

  whyIcon: {
    fontSize: 20,
    marginTop: 2,
  },

  whyItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E8504A",
    marginBottom: 4,
  },

  whyItemDesc: {
    fontSize: 13,
    color: "#777",
    maxWidth: 380,
    lineHeight: 20,
  },

  abhaInfoSection: {
    marginTop: "2%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 180,
    paddingLeft: 150,

    paddingTop: "4%",
    backgroundColor: "#FAFAFA",
  },

  abhaInfoLeft: {
    width: 420,

    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
  },

  abhaSmallTitle: {
    color: "#FF7072",
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 12,
    fontStyle: "Inter",
    textAlign: "center",
  },

  abhaBigTitle: {
    fontSize: 40,
    fontWeight: "700",
    lineHeight: "100%",
    color: "#000000",
    fontStyle: "Inter",
    marginBottom: 18,
  },

  abhaDesc: {
    fontSize: 16,
    color: "#717273",
    fontWeight: "500",
    fontStyle: "Inter",
    lineHeight: 22,
  },

  abhaFeaturesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: 520,
  },

  abhaFeatureCard: {
    width: "48%", // makes exactly 2 columns
    alignItems: "center",
    marginBottom: 40,
  },

  featureIconBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  featureText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#444",
    maxWidth: 120,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 130,
    paddingBottom: "4%",
    backgroundColor: "#FAFAFA",
  },

  statBox: {
    borderWidth: 2,
    width: 180,
    height: 140,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",

    borderColor: "#E5E5E5",
  },

  statIconWrap: {
    width: 50,
    height: 50,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  statText: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
  },

  /* USE CASES */
  useCaseSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  useCaseTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
    color: COLORS.text,
  },
  useCaseGrid: {
    gap: 16,
  },
  useCaseCard: {
    backgroundColor: COLORS.coralPale,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  useCaseIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.roseLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  useCaseIconText: {
    fontSize: 32,
  },
  useCaseCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  useCaseCardDesc: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
    textAlign: "center",
  },

  /* WHAT IS ABHA */
  whatSection: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.coral,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  whatTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  whatDescription: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresGrid: {
    gap: 10,
    marginBottom: 28,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  featureChipIcon: {
    fontSize: 16,
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardAccent: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
  },
  statCardTall: {
    minHeight: 180,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNum: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 6,
  },
  statCardAccent: {
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: "500",
    textAlign: "center",
  },

  /* HOW IT WORKS */
  howSection: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  howTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 32,
    marginTop: 12,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    alignItems: "center",
    paddingVertical: 16,
  },
  stepNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.coral,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
    textAlign: "center",
  },

  /* CTA */
  ctaSection: {
    marginHorizontal: 16,
    marginVertical: 32,
    borderRadius: 28,
    padding: 32,
  },
  ctaContent: {
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    lineHeight: 28,
    marginBottom: 12,
  },
  ctaDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
  },
  ctaButtons: {
    gap: 12,
  },
  ctaBtnPrimary: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
  },
  ctaBtnPrimaryText: {
    color: COLORS.coral,
    fontSize: 14,
    fontWeight: "700",
  },
  ctaBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
  },
  ctaBtnSecondaryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },

  /* FOOTER */
  footer: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLogo: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  footerSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
  },
  footerLinks: {
    gap: 16,
  },
  footerLink: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(44, 10, 10, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: COLORS.coralPale,
    borderRadius: 24,
    overflow: "hidden",
  },
  modalTopBar: {
    height: 5,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modalCloseBtnText: {
    fontSize: 16,
    color: COLORS.muted,
    fontWeight: "600",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 8,
  },
  stepperDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: "#F5D0CE",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#C09898",
  },
  stepperDotActive: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
    color: COLORS.white,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  stepperDotDone: {
    backgroundColor: COLORS.coral,
    borderColor: COLORS.coral,
    color: COLORS.white,
  },
  stepperDotText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#F5D0CE",
    maxWidth: 30,
  },
  stepperLineDone: {
    backgroundColor: COLORS.coral,
  },
  modalLogo: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  modalLogoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalLogoText: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    color: COLORS.text,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  authTabs: {
    flexDirection: "row",
    backgroundColor: "#FAE8E7",
    borderRadius: 50,
    padding: 4,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  authTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 50,
  },
  authTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  authTabIcon: {
    fontSize: 16,
  },
  authTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.muted,
  },
  authTabActive: {
    color: COLORS.text,
  },
  tabBadge: {
    position: "absolute",
    top: -8,
    backgroundColor: COLORS.rose,
    color: COLORS.white,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 50,
    fontSize: 7,
    fontWeight: "700",
  },
  inputGroup: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  inputSegment: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    fontSize: 14,
    textAlign: "center",
    letterSpacing: 2,
    color: COLORS.text,
  },
  btnNext: {
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#E8A09D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  btnNextActive: {
    backgroundColor: COLORS.coral,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  btnNextText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  otherOptions: {
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    marginBottom: 20,
  },
  otherOptionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  otherOptionsHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.muted,
  },
  chevron: {
    fontSize: 14,
    color: COLORS.muted,
  },
  otherOptionsBody: {
    gap: 0,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.coralPale,
    borderWidth: 1.5,
    borderColor: COLORS.coralMid,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  optionChevron: {
    fontSize: 12,
    color: COLORS.muted,
  },
  modalDisclaimer: {
    fontSize: 10,
    color: "#C09898",
    textAlign: "center",
    marginHorizontal: 16,
    marginBottom: 24,
    lineHeight: 15,
  },
  cardWrapperWeb: {
    width: 420,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  bgGradientWeb: {
    position: "absolute",
    width: 400,
    height: 250,
    borderRadius: 20,
    zIndex: 2,
  },

  frameImageWeb: {
    position: "absolute",
    width: 480,
    height: 320,
    resizeMode: "contain",
    zIndex: 1,
  },

  abhaCardWeb: {
    width: 360,
    height: 200,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "space-between",
    zIndex: 3,
  },

  cardHeaderWeb: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardChipWeb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardOrgWeb: {
    color: "#fff",
    fontSize: 13,
  },

  cardBodyWeb: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileIconWeb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardNameWeb: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  cardNumberWeb: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  cardFooterWeb: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.9,
  },
  howSectionWeb: {
    marginTop: "2%",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  howBadgeWeb: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 12,
  },

  howTitleWeb: {
    fontSize: 40,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 50,
  },

  stepsWrapperWeb: {
    position: "relative",
    justifyContent: "center",
    width: 800,
    marginLeft: "20%",
  },

  timelineLineWeb: {
    position: "absolute",
    left: 30,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#FF7072",
  },

  stepRowWeb: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 40,
  },

  stepCircleWeb: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  stepNumberWeb: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  stepTitleWeb: {
    fontSize: 24,
    fontWeight: "500",
    color: "#111",
    marginBottom: 6,
  },

  stepDescWeb: {
    fontSize: 20,
    color: "#888888",
    maxWidth: 400,
    lineHeight: 22,
  },
  ctaWrapperWeb: {
    width: "35%",
    paddingVertical: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignSelf: "center",
  },

  ctaCardWeb: {
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 40,
    alignItems: "center",
  },

  ctaTitleWeb: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },

  ctaDescWeb: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 600,
  },

  ctaPrimaryBtnWeb: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 40,
    width: 320,
    marginBottom: 14,
  },

  ctaPrimaryTextWeb: {
    color: "#FF5F5F",
    fontWeight: "700",
    fontSize: 14,
  },

  ctaSecondaryBtnWeb: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 16,
    borderRadius: 40,
    width: 320,
    alignItems: "center",
  },

  ctaSecondaryTextWeb: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
const mobileStyles = StyleSheet.create({
  header: {
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  heroContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFECEC",
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 10,
    color: "#FF6B6B",
    fontWeight: "600",
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#444",
    marginTop: 16,
    lineHeight: 40,
    textAlign: "center",
  },

  titleHighlight: {
    color: "#FF6B6B",
  },

  description: {
    fontSize: 14,
    color: "#777",
    lineHeight: 22,
    marginTop: 14,
    marginBottom: 24,
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 14,
  },

  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  secondaryBtnText: {
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 13,
  },
  cardSection: {
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden", // important
  },
  cardWrapper: {
    width: width * 0.9,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  circleYellow: {
    position: "absolute",
    zIndex: 1,
  },

  circleCoral: {
    position: "absolute",
    top: 70,
    right: 60,
    width: 90,
    height: 90,
    opacity: 0.7,
  },

  circlePurple: {
    position: "absolute",
    top: 10,
    right: 110,
    width: 80,
    height: 80,
    opacity: 0.6,
  },

  circleYellowRight: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    opacity: 0.7,
  },

  circleOutline: {
    position: "absolute",
    bottom: 10,
    left: 50,
    width: 70,
    height: 70,
  },
  frameImage: {
    position: "absolute",
    width: windowWidth > 400 ? width * 1.2 : width * 1,
    height: windowWidth > 400 ? 300 : 260,
    resizeMode: "contain",
    zIndex: 1,
  },
  bgGradient: {
    position: "absolute",
    zIndex: 999,
    borderRadius: 12,
    width: width * 0.8,
    height: windowWidth > 400 ? 220 : 170,
  },

  abhaCard: {
    width: width * 0.8,
    height: 170,
    borderRadius: 28,
    paddingHorizontal: 20,
    // paddingVertical: 18,
    paddingTop: windowWidth > 400 ? "1%" : "4%",
    paddingBottom: windowWidth > 400 ? "1%" : "4%",
    justifyContent: "space-between",
    zIndex: 999,
    overflow: "hidden",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // change from center
  },

  cardChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardOrg: {
    color: "#fff",
    fontSize: windowWidth > 400 ? 14 : 12,
    textAlign: "left",
    // lineHeight: 16,
    opacity: 0.9,
  },

  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 18,
    // borderWidth: 1,
  },

  profileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardName: {
    color: "#fff",
    fontSize: windowWidth > 400 ? 20 : 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  cardNumber: {
    color: "#fff",
    fontSize: windowWidth > 400 ? 18 : 14,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  cardFooter: {
    fontSize: windowWidth > 400 ? 11.5 : 9.4,
    color: "#fff",
    opacity: 0.85,
    marginTop: 18,
    textAlign: "center",
  },
  whySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },

  whyLabel: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  whyTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#222",
    marginBottom: 6,
  },

  waveLine: {
    width: 150,
    height: 25,
    marginBottom: 20,
  },

  whyItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
    alignItems: "flex-start",
  },

  whyItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 4,
  },

  whyItemDesc: {
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
  },

  whyImageMobile: {
    width: width * 0.9,
    height: 160,
    borderRadius: 14,
    marginTop: 20,
  },
  abhaInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  abhaSmallTitle: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  abhaBigTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#222",
    marginBottom: 12,
    lineHeight: 34,
  },

  abhaDesc: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 10,
  },

  abhaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },

  featureItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 24,
  },

  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  featureText: {
    fontSize: 13,
    textAlign: "center",
    color: "#444",
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  statCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  statLabel: {
    fontSize: 11,
    color: "#777",
    textAlign: "center",
  },
  howSection: {
    paddingHorizontal: 20,
    paddingBottom: 50,
    backgroundColor: "#fff",
  },

  howBadge: {
    alignSelf: "center",
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "600",
    marginBottom: 12,
  },

  howTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#222",
    marginBottom: 30,
  },

  stepsWrapper: {
    position: "relative",
  },

  timelineLine: {
    position: "absolute",
    left: 14,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: "#FFD6D6",
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 28,
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  stepNumber: {
    color: "#fff",
    fontWeight: "700",
  },

  stepTextContainer: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },

  stepDesc: {
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
  },
  ctaWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  ctaCard: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  ctaTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },

  ctaDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  ctaPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 12,
  },

  ctaPrimaryText: {
    color: "#FF5F5F",
    fontWeight: "700",
    fontSize: 13,
  },

  ctaSecondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  ctaSecondaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  popupText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  popupBtn: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  popupBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default AbhaLandingScreen;
//rotatefloating
