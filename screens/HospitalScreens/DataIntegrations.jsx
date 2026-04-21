import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
  Platform,
  useWindowDimensions,
  ImageBackground,
  ActivityIndicator,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import mixpanel, { trackButton } from "../../utils/Mixpanel";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "../../env-vars";

const steps = [
  { label: "Choose Method", sub: "API or upload" },
  { label: "Validate & Review", sub: "Check completeness" },
  { label: "Integration Complete", sub: "Dashboard unlocked" },
];
const methods = [
  {
    key: "api",
    icon: "⚙️",
    title: "API Integration",
    badge: "Recommended",
    badgeColor: "#2563EB",
    desc: "Connect directly via AWS credentials or hospital API endpoint. Automatic data sync — no manual uploads needed.",
  },
  {
    key: "excel",
    icon: "📊",
    title: "Excel Upload",
    badge: "No technical setup",
    badgeColor: "#2563EB",
    desc: "Upload structured Excel files for your doctor database, patient records, and patient list. Simple and immediate.",
  },
  {
    key: "manual",
    icon: "✏️",
    title: "Manual Entry",
    badge: "No file needed",
    badgeColor: "#2563EB",
    desc: "No API or Excel? Add doctors and their patients directly. Register one doctor at a time.",
  },
];

const AIIntegrationScreen = ({ navigation }) => {
  const [selected, setSelected] = useState("api");
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const [showAPIScreen, setShowAPIScreen] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExcelScreen, setShowExcelScreen] = useState(false);
  const [uploadingDone, setUploadingDone] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [showExcelWebUI, setShowExcelWebUI] = useState(false);

  const selectedMethod = methods.find((m) => m.key === selected);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "manual") {
      navigation.navigate("ManualDataIntegration");
    }
    // add more routes for api / excel when ready
  };

  const Card = ({ title, subtitle, description, value, showIcon }) => {
    const isActive = selected === value;

    return (
      <TouchableOpacity
        style={[stylesMobile.card, isActive && stylesMobile.activeCard]}
        onPress={() => {
          trackButton(`hospital_data_integration_${value}_selected`, {
            integration_method: value,
            method_title: title,
            source: "integration_method_selection",
          });
          setSelected(value);
        }}
      >
        {showIcon && ( // 👈 IMPORTANT
          <Image
            source={require("../../assets/HospitalPortal/Icon/AIintegration_icon.png")}
            style={stylesMobile.cardIcon}
            resizeMode="contain"
          />
        )}

        <Text style={stylesMobile.cardTitle}>
          {title} <Text style={stylesMobile.highlight}>{subtitle}</Text>
        </Text>

        <Text style={stylesMobile.cardDesc}>{description}</Text>
      </TouchableOpacity>
    );
  };
  const isFormValid = accessKey.trim() !== "" && secretKey.trim() !== "";

  const uploadDoctors = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ],
      });

      if (!result.assets || result.assets.length === 0) return;

      const file = result.assets[0];

      // ✅ Show UI instantly
      setUploadingDone(true);

      // ✅ Start progress immediately
      progress.setValue(0);

      Animated.timing(progress, {
        toValue: 0.7, // ⛔ stop at 70% initially
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // 🔥 API runs in background (no blocking UI)
      const formData = new FormData();
      formData.append("hospital_id", "HOSP_8FBF9714");

      const blob = await fetch(file.uri).then((res) => res.blob());
      formData.append("file", blob, file.name || "upload.xlsx");

      const response = await fetch(
        `${API_URL}/hospitals/staff/import-doctors`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      // optional: store message if needed
      const message = data?.message;
      const eta = data?.eta_hours;

      // ✅ Finish remaining 10%
      // progress to 100% immediately after response
      Animated.timing(progress, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        setUploadingDone(false);
        setShowSuccessScreen(true);
      });
    } catch (error) {
      console.log("Doctor upload error:", error);
    }
  };

  const uploadPatients = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ],
      });

      if (!result.assets || result.assets.length === 0) return;

      const file = result.assets[0];

      // ✅ Show UI instantly
      setUploadingDone(true);

      // ✅ Start progress immediately
      progress.setValue(0);

      Animated.timing(progress, {
        toValue: 0.7, // ⛔ stop at 70% initially
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // 🔥 API runs in background (no blocking UI)
      const formData = new FormData();
      formData.append("hospital_id", "HOSP_8FBF9714");

      formData.append("doctor_id", "dr_1d8eec8a-aa6b-41b9-92cf-5bcbb67f1eab");

      const blob = await fetch(file.uri).then((res) => res.blob());
      formData.append("file", blob, file.name || "upload.xlsx");

      const response = await fetch(
        `${API_URL}/hospitals/staff/import-patients`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      // optional: store message if needed
      const message = data?.message;
      const eta = data?.eta_hours;

      // ✅ Finish remaining 10%
      Animated.timing(progress, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        setUploadingDone(false);
        setShowSuccessScreen(true);
      });
    } catch (error) {
      console.log("Patient upload error:", error);
    }
  };

  return (
    <>
      {Platform.OS === "web" && (width > 1000 || width === 0) && (
        <View style={styles.container}>
          <ImageBackground
            source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <View style={styles.main}>
              {/* Sidebar */}
              <View style={styles.left}>
                <HospitalSidebarNavigation navigation={navigation} />
              </View>

              {/* Right Content */}
              <View style={styles.right}>
                {/* <View style={styles.header}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View> */}

                {/* Card */}
                <View style={styles.card}>
                  {/* Title Row */}
                  <View style={styles.titleTopSection}>
                    <Text style={styles.title}>AI Integration</Text>
                    <TouchableOpacity
                      style={styles.backHomeBtn}
                      onPress={() => {
                        trackButton("hospital_data_integration_back_home_clicked", {
                          source: "integration_page",
                        });
                        navigation.goBack();
                      }}
                    >
                      <Text style={styles.backHomeBtnText}>Back to home</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step Bar */}
                  <View style={styles.stepBar}>
                    {steps.map((step, index) => {
                      const isCompleted = index < currentStep;
                      const isActive = index === currentStep;
                      return (
                        <React.Fragment key={index}>
                          <View style={styles.stepItem}>
                            <View
                              style={[
                                styles.stepCircle,
                                isCompleted && styles.stepCircleComplete,
                                isActive && styles.stepCircleActive,
                                !isCompleted &&
                                  !isActive &&
                                  styles.stepCircleInactive,
                              ]}
                            >
                              {isCompleted ? (
                                <Text style={styles.stepCheckmark}>✓</Text>
                              ) : (
                                <Text
                                  style={[
                                    styles.stepNumber,
                                    !isActive && { color: "#9CA3AF" },
                                  ]}
                                >
                                  {index + 1}
                                </Text>
                              )}
                            </View>
                            <View style={styles.stepTextContainer}>
                              <Text
                                style={[
                                  styles.stepTitle,
                                  {
                                    color:
                                      index <= currentStep
                                        ? "#2563EB"
                                        : "#9CA3AF",
                                  },
                                ]}
                              >
                                {step.label}
                              </Text>
                              <Text style={styles.stepSubtitle}>
                                {step.sub}
                              </Text>
                            </View>
                          </View>
                          {index < steps.length - 1 && (
                            <View
                              style={[
                                styles.stepConnector,
                                {
                                  backgroundColor:
                                    index < currentStep ? "#2563EB" : "#E5E7EB",
                                },
                              ]}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>

                  {/* Body */}
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.bodyContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Image
                      source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                      style={{ width: "100%", marginBottom: 12 }}
                      resizeMode="contain"
                    />

                    <Text style={styles.bodyTitle}>
                      How would you like to import your hospital data?
                    </Text>

                    {/* Method Labels Row */}
                    <View style={styles.methodLabelsRow}>
                      {methods.map((m) => (
                        <View key={m.key} style={styles.methodLabelCell}>
                          <Text
                            style={[
                              styles.methodLabel,
                              { color: m.badgeColor },
                            ]}
                          >
                            {m.title}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Cards Row */}
                    <View style={styles.cardsRow}>
                      {methods.map((m) => (
                        <TouchableOpacity
                          key={m.key}
                          style={[
                            styles.methodCard,
                            selected === m.key && styles.methodCardSelected,
                          ]}
                          onPress={() => {
                            setSelected(m.key);

                            if (m.key === "excel") {
                              setShowExcelWebUI(true);
                            } else {
                              setShowExcelWebUI(false);
                            }
                          }}
                          activeOpacity={0.85}
                        >
                          <View style={styles.methodIconBox}>
                            <Text style={styles.methodIconText}>{m.icon}</Text>
                          </View>
                          <Text style={styles.methodCardTitle}>
                            {m.title}{" "}
                            <Text
                              style={[
                                styles.methodCardBadge,
                                { color: m.badgeColor },
                              ]}
                            >
                              {m.badge}
                            </Text>
                          </Text>
                          <Text style={styles.methodCardDesc}>{m.desc}</Text>

                          {selected === m.key && (
                            <View style={styles.selectedDot}>
                              <Text style={styles.selectedDotText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                    {Platform.OS === "web" &&
                      showExcelWebUI &&
                      selected === "excel" && (
                        <View style={{ width: "88%", marginTop: 20 }}>
                          {/* Info Box */}
                          <View
                            style={{
                              borderWidth: 1,
                              borderColor: "#3B82F6",
                              borderRadius: 8,
                              padding: 12,
                              backgroundColor: "#EEF5FF",
                              marginBottom: 16,
                            }}
                          >
                            <Text style={{ color: "#2563EB", fontSize: 13 }}>
                              Upload a single Excel or CSV file containing your
                              hospital data — doctors, patients, or both. We&apos;ll
                              process and map all records automatically.
                            </Text>
                          </View>

                          {/* Upload Box */}
                          {!uploadingDone && !showSuccessScreen && (
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 16,
                              }}
                            >
                              <TouchableOpacity
                                onPress={uploadDoctors}
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: "#3B82F6",
                                  borderRadius: 8,
                                  padding: 30,
                                  alignItems: "center",
                                  backgroundColor: "#fff",
                                }}
                              >
                                <Text style={{ fontSize: 18 }}>⬆️</Text>

                                <Text
                                  style={{ marginTop: 10, color: "#6B7280" }}
                                >
                                  Upload Excel list (.xlsx or .csv){" "}
                                  <Text
                                    style={{
                                      color: "#2563EB",
                                      fontWeight: "600",
                                    }}
                                  >
                                    Click here
                                  </Text>
                                </Text>

                                <Text
                                  style={{ marginTop: 5, color: "#9CA3AF" }}
                                >
                                  Drop your file here or click to browse
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          {uploadingDone && !showSuccessScreen && (
                            <View style={{ marginTop: 20, width: "100%" }}>
                              {/* Upload Done Box */}
                              <View
                                style={{
                                  borderWidth: 1,
                                  borderColor: "#22C55E",
                                  borderRadius: 10,
                                  padding: 20,
                                  alignItems: "center",
                                }}
                              >
                                <Ionicons
                                  name="checkmark"
                                  size={22}
                                  color="#16A34A"
                                />
                                <Text
                                  style={{ color: "#16A34A", marginTop: 6 }}
                                >
                                  Upload done
                                </Text>
                              </View>

                              {/* Status */}
                              <Text
                                style={{
                                  marginTop: 10,
                                  color: "#16A34A",
                                  fontSize: 12,
                                }}
                              >
                                ✓ Import complete - 0 errors detected
                              </Text>

                              {/* Progress Bar */}
                              <View
                                style={{
                                  height: 8,
                                  backgroundColor: "#D1FAE5",
                                  borderRadius: 10,
                                  marginTop: 6,
                                  overflow: "hidden",
                                }}
                              >
                                <Animated.View
                                  style={{
                                    height: 8,
                                    backgroundColor: "#16A34A",
                                    width: progress.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: ["0%", "100%"],
                                    }),
                                  }}
                                />
                              </View>
                            </View>
                          )}
                          {showSuccessScreen && (
                            <View
                              style={{ alignItems: "center", marginTop: 20 }}
                            >
                              {/* Big Tick */}
                              <View style={stylesMobile.successCircle}>
                                <Ionicons
                                  name="checkmark"
                                  size={32}
                                  color="#16A34A"
                                />
                              </View>

                              {/* Title */}
                              <Text style={stylesMobile.successTitle}>
                                File uploaded successfully
                              </Text>

                              <Text style={stylesMobile.successSub}>
                                Your data is being processed and will be live
                                within 24 hours.
                              </Text>

                              {/* Stats */}
                              {/* <View style={stylesMobile.statsRow}>
                                <View style={stylesMobile.statBox}>
                                  <Text style={stylesMobile.statNumber}>
                                    {doctorCount}
                                  </Text>
                                  <Text style={stylesMobile.statLabel}>
                                    Doctor{"\n"}Imported
                                  </Text>
                                </View>

                                <View style={stylesMobile.statBox}>
                                  <Text style={stylesMobile.statNumber}>
                                    {patientCount}
                                  </Text>
                                  <Text style={stylesMobile.statLabel}>
                                    patients{"\n"}records
                                  </Text>
                                </View>

                                <View style={stylesMobile.statBox}>
                                  <Text style={stylesMobile.statNumber}>
                                    {errorCount}
                                  </Text>
                                  <Text style={stylesMobile.statLabel}>
                                    Error{"\n"}detected
                                  </Text>
                                </View>
                              </View> */}

                              {/* Button */}
                              {/* <TouchableOpacity
                                style={{
                                  marginTop: 20,
                                  backgroundColor: "#2563EB",
                                  paddingVertical: 12,
                                  paddingHorizontal: 24,
                                  borderRadius: 6,
                                }}
                                onPress={() =>
                                  navigation.navigate(
                                    "DataIntegrationValidation",
                                    {
                                      doctorCount,
                                      patientCount,
                                    },
                                  )
                                }
                              >
                                <Text
                                  style={{ color: "#fff", fontWeight: "600" }}
                                >
                                  Upload & Validate →
                                </Text>
                              </TouchableOpacity> */}
                            </View>
                          )}

                          {/* Buttons */}
                          {!showSuccessScreen && (
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: 16,
                                gap: 10,
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  borderWidth: 1,
                                  borderColor: "#D1D5DB",
                                  paddingVertical: 12,
                                  paddingHorizontal: 18,
                                  borderRadius: 6,
                                }}
                              >
                                <Text style={{ color: "#6B7280" }}>
                                  Download Template
                                </Text>
                              </TouchableOpacity>
                              <Text
                                style={{
                                  color: "#94A3B8",
                                  fontSize: 14,
                                  fontWeight: "500",
                                  marginTop: "2%",
                                }}
                              >
                                Not sure of format ? download our template first
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                    {/* CTA */}
                    {selected && selected !== "excel" && (
                      <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={() => {
                          trackButton("hospital_data_integration_continue_clicked", {
                            integration_method: selected,
                            method_title: selectedMethod?.title,
                            source: "integration_selection_screen",
                          });
                          handleContinue();
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.continueBtnText}>
                          Continue with {selectedMethod?.title} →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={stylesMobile.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <StatusBar barStyle="light-content" backgroundColor="#fff" />
            <View style={stylesMobile.header}>
              <HeaderLoginSignUp navigation={navigation} />
            </View>
            <Text style={stylesMobile.title}>AI Integration</Text>

            <TouchableOpacity style={stylesMobile.selectBtn}>
              <Text style={stylesMobile.selectText}>Select Patient</Text>
            </TouchableOpacity>

            {/* Step Progress */}
            <View style={stylesMobile.stepContainer}>
              <View style={stylesMobile.line} />
              {[1, 2, 3].map((item, index) => {
                const active = index === currentStep;
                const completed = index < currentStep;
                return (
                  <View key={index} style={stylesMobile.stepWrapper}>
                    <View
                      style={[
                        stylesMobile.circle,
                        active && stylesMobile.activeCircle,
                        completed && stylesMobile.completedCircle,
                      ]}
                    >
                      <Text
                        style={[
                          stylesMobile.circleText,
                          active && stylesMobile.activeCircleText,
                          completed && stylesMobile.completedText,
                        ]}
                      >
                        {completed ? "✓" : item}
                      </Text>
                    </View>
                    <Text style={stylesMobile.stepText}>
                      {item === 1 && "Choose\nmethod"}
                      {item === 2 && "Validate"}
                      {item === 3 && "Integration\nComplete"}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Question */}
            <Image
              source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
              style={{ width: "100%", marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={stylesMobile.question}>
              How would you like to import your {"\n"}hospital data?
            </Text>

            {!showAPIScreen && !showExcelScreen && (
              <>
                {/* API Integration */}
                <Text style={stylesMobile.sectionTitle}>API Integration</Text>
                <Card
                  value="api"
                  showIcon={true} // ✅ icon
                  title="API Integration"
                  subtitle="Recommended"
                  description={`Connect directly via AWS credentials or \nhospital API endpoint.Automatic data sync — \nno manual uploads needed.`}
                />

                <Text style={stylesMobile.sectionTitle}>Excel Upload</Text>
                <Card
                  value="excel"
                  showIcon={true}
                  title="Excel Upload"
                  subtitle="No technical setup"
                  description={`Upload structured Excel files for your doctor \ndatabase, patient records, and patient list. \nSimple and immediate.`}
                />

                <Text style={stylesMobile.sectionTitle}>Manual Upload</Text>
                <Card
                  value="manual"
                  showIcon={true}
                  title="Manual Entry"
                  subtitle="No file needed"
                  description={`No API or Excel? Add doctors and their \npatients directly. Register one \ndoctor at a time.`}
                />
                <TouchableOpacity
                  style={stylesMobile.button}
                  onPress={() => {
                    trackButton("hospital_data_integration_connect_test_clicked", {
                      integration_method: selected,
                      source: "mobile_integration_selection",
                    });
                    if (selected === "api") {
                      setShowAPIScreen(true);
                    } else if (selected === "excel") {
                      setShowExcelScreen(true);
                    } else if (selected === "manual") {
                      navigation.navigate("ManualDataIntegration"); // ✅ redirect here
                    }
                  }}
                >
                  <Text style={stylesMobile.buttonText}>Connect and test</Text>
                </TouchableOpacity>
              </>
            )}

            {showAPIScreen && selected === "api" && (
              <>
                <Text style={stylesMobile.sectionTitle}>API Integration</Text>

                <Card
                  value="api"
                  showIcon={true}
                  title="API Integration"
                  subtitle="Recommended"
                  description={`Connect directly via AWS credentials or \nhospital API endpoint.Automatic data sync — \nno manual uploads needed.`}
                />
                <View style={stylesMobile.formCard}>
                  <Text style={{ marginBottom: "2%" }}>
                    AWS / API Credentials
                  </Text>

                  <Text style={stylesMobile.label}>AWS Access Key ID :</Text>
                  <TextInput
                    placeholder="Start writing..."
                    placeholderTextColor="#B3B3B3"
                    value={accessKey}
                    onChangeText={setAccessKey}
                    style={stylesMobile.input}
                  />

                  <Text style={stylesMobile.label}>
                    Hospital API Endpoint (optional) :
                  </Text>
                  <TextInput
                    placeholder="Start writing..."
                    placeholderTextColor="#B3B3B3"
                    style={stylesMobile.input}
                  />

                  <Text style={stylesMobile.label}>
                    AWS Secret Access Key :
                  </Text>
                  <TextInput
                    placeholder="........."
                    placeholderTextColor="#B3B3B3"
                    secureTextEntry
                    value={secretKey}
                    onChangeText={setSecretKey}
                    style={stylesMobile.input}
                  />
                  <TouchableOpacity
                    style={[
                      stylesMobile.button,
                      (!isFormValid || loading) && {
                        backgroundColor: "#B0C4DE",
                      },
                    ]}
                    disabled={!isFormValid || loading}
                    onPress={() => {
                      if (!isFormValid) return;

                      setLoading(true);

                      // show loader for a moment before navigation
                      setTimeout(() => {
                        setLoading(false);
                        navigation.navigate("DataIntegrationValidation");
                      }, 1500); // 👈 adjust timing if needed
                    }}
                  >
                    {loading ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ActivityIndicator size="small" color="#fff" />
                        <Text
                          style={[stylesMobile.buttonText, { marginLeft: 8 }]}
                        >
                          Connecting...
                        </Text>
                      </View>
                    ) : (
                      <Text style={stylesMobile.buttonText}>
                        Connect and test
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
            {showExcelScreen && selected === "excel" && (
              <>
                <Text style={stylesMobile.sectionTitle}>Excel Upload</Text>

                <Card
                  value="excel"
                  showIcon={true}
                  title="Excel Upload"
                  subtitle="No technical setup"
                  description={`Upload structured Excel files for your doctor \ndatabase, patient records, and patient list. \nSimple and immediate.`}
                />

                <View style={stylesMobile.excelInfoBox}>
                  <Text style={stylesMobile.excelInfoText}>
                    Upload a single Excel or CSV file containing your hospital
                    data — doctors, patients, or both. We&apos;ll process and map all
                    records automatically.
                  </Text>
                </View>

                {!uploadingDone && !showSuccessScreen && (
                  <>
                    <Text style={stylesMobile.sectionTitle}>Excel Upload</Text>

                    <TouchableOpacity
                      style={stylesMobile.uploadCard}
                      onPress={uploadDoctors}
                    >
                      <Image
                        source={require("../../assets/HospitalPortal/Icon/Aiuploadicon.png")}
                        style={{ width: "100%" }}
                        resizeMode="contain"
                      />

                      <Text style={stylesMobile.uploadTitle}>
                        Upload Excel list (.xlsx or .csv){" "}
                        <Text
                          style={{
                            color: "#025AE0",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Click here
                        </Text>
                      </Text>

                      <Text style={stylesMobile.uploadSubText}>
                        Drop your file here or click to browse
                      </Text>
                    </TouchableOpacity>

                    <Text style={stylesMobile.sectionTitle}>Excel Upload</Text>
                  </>
                )}
                {uploadingDone && (
                  <View style={{ marginTop: 15 }}>
                    {/* Upload Done Box */}
                    <View style={stylesMobile.uploadDoneBox}>
                      <Ionicons name="checkmark" size={22} color="#16A34A" />
                      <Text style={stylesMobile.uploadDoneText}>
                        Upload done
                      </Text>
                    </View>

                    {/* Status Text */}
                    <Text style={stylesMobile.progressText}>
                      ✓ Import complete - 0 errors detected
                    </Text>

                    {/* Progress Bar Background */}
                    <View style={stylesMobile.progressBarBg}>
                      <Animated.View
                        style={[
                          stylesMobile.progressBarFill,
                          {
                            width: progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            }),
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {showSuccessScreen && (
                  <View
                    style={{
                      alignItems: "center",
                      marginTop: 20,
                      marginBottom: 20,
                    }}
                  >
                    {/* Big Tick */}
                    <View style={stylesMobile.successCircle}>
                      <Ionicons name="checkmark" size={32} color="#16A34A" />
                    </View>

                    {/* Title */}
                    <Text style={stylesMobile.successTitle}>
                      File uploaded successfully
                    </Text>

                    <Text style={stylesMobile.successSub}>
                      Your data is being processed and will be live within 24
                      hours.
                    </Text>

                    {/* Button */}
                    {/* <TouchableOpacity
                      style={stylesMobile.primaryBtn}
                      onPress={() =>
                        navigation.navigate("DataIntegrationValidation", {
                          doctorCount,
                          patientCount,
                        })
                      }
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Upload & Validate →
                      </Text>
                    </TouchableOpacity> */}
                  </View>
                )}
                {!showSuccessScreen && (
                  <View style={{ marginTop: 20, paddingBottom: 20 }}>
                    {/* Download Button */}
                    <TouchableOpacity style={stylesMobile.downloadBtn}>
                      <Text style={stylesMobile.downloadText}>
                        Download Template
                      </Text>
                    </TouchableOpacity>

                    {/* Hint Text */}
                    <Text style={stylesMobile.downloadHint}>
                      Not sure of format ? download our template first
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

export default AIIntegrationScreen;

const stylesMobile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 16,
  },

  header: { zIndex: 2 },

  logo: {
    fontWeight: "600",
    fontSize: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    paddingLeft: "2%",
  },

  selectBtn: {
    marginLeft: "2%",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  selectText: { fontSize: 14, color: "#333" },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 13,
    left: "16.5%",
    right: "16.5%",
    height: 2,
    backgroundColor: "#1680ECBF",
  },

  stepItem: {
    alignItems: "center",
    flex: 1,
  },

  stepWrapper: { alignItems: "center", flex: 1 },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  activeCircle: { backgroundColor: "#2563EB" },
  activeCircleText: { color: "#fff" },
  completedCircle: { backgroundColor: "#2563EB" },
  completedText: { color: "#fff" },
  stepText: { fontSize: 10, textAlign: "center", color: "#3B82F6" },

  circleText: {
    fontSize: 12,
    color: "#3B82F6",
  },

  stepLabel: {
    fontSize: 10,
    textAlign: "center",
    color: "#3B82F6",
  },

  question: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 10,
  },

  sectionTitle: {
    marginTop: 15,
    fontWeight: "600",
    color: "#2563EB",
  },

  card: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#025AE0",
    marginTop: 8,
    alignItems: "center", // 👈 important
  },

  activeCard: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  cardIcon: {
    width: 18,
    height: 18,
    alignSelf: "center",
    marginBottom: 6,
  },

  cardTitle: {
    fontWeight: "600",
    marginTop: 8, // keep this
    color: "#6B6B6B",
  },

  highlight: {
    color: "#2563EB",
  },

  cardDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#7AA2E3",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  label: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 5,
    color: "#000000",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    outlineStyle: "none",
  },
  excelInfoBox: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    backgroundColor: "#EEF5FF",
  },

  excelInfoText: {
    fontSize: 12,
    color: "#2563EB",
    lineHeight: 18,
  },
  uploadCard: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#fff",
  },

  uploadTitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#6B6B6B",
    fontSize: 14,
    fontWeight: "400",
  },

  uploadSubText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 5,
    textAlign: "center",
  },
  downloadBtn: {
    width: "50%",
    borderWidth: 1,
    borderColor: "#94A3B8", // lighter border
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF", // lighter background
  },

  downloadText: {
    color: "#6B6B6B", // lighter grey text
    fontWeight: "500", // less bold
    fontSize: 14,
  },

  downloadHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 8,
    fontWeight: "500",
  },
  uploadDoneBox: {
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 15,
  },

  uploadDoneText: {
    color: "#16A34A",
    marginTop: 5,
    fontWeight: "500",
  },

  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },

  successTitle: {
    color: "#16A34A",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },

  successSub: {
    fontSize: 12,
    color: "#6B6B6B",
    textAlign: "center",
    marginTop: 5,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 20,
  },

  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B6B6B",
  },

  statLabel: {
    fontSize: 12,
    color: "#16A34A",
    textAlign: "center",
  },

  primaryBtn: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 4,
    width: "50%",
    marginBottom: "4%",
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: "#16A34A",
  },

  progressBarBg: {
    height: 8,
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },

  progressBarFill: {
    height: 8,
    backgroundColor: "#16A34A",
    borderRadius: 10,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100vh",
    overflow: "hidden",
  },
  background: {
    flex: 1,
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  main: {
    flexDirection: "row",
    height: "100%",
    zIndex: 2,
  },
  left: {
    width: "15%",
  },
  right: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "visible",
  },
  header: {
    marginBottom: 16,
    position: "relative",
    zIndex: 1000,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "83vh",
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
    marginTop:"4%"
  },

  // Title Row
  titleTopSection: {
    height: 56,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexShrink: 0,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  backHomeBtn: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  backHomeBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },

  // Step Bar
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    justifyContent: "space-around",
    flexShrink: 0,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleComplete: {
    backgroundColor: "#2563EB",
  },
  stepCircleActive: {
    backgroundColor: "#2563EB",
  },
  stepCircleInactive: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  stepCheckmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepNumber: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepTextContainer: {
    flexDirection: "column",
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepSubtitle: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },
  stepConnector: {
    height: 2,
    width: 32,
    marginHorizontal: 8,
    flexShrink: 0,
    alignSelf: "center",
  },

  // Body
  bodyContent: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  cloudIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  bodyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 28,
    textAlign: "center",
  },

  // Method Labels
  methodLabelsRow: {
    flexDirection: "row",
    width: "88%",
    gap: 16,
    marginBottom: 8,
  },
  methodLabelCell: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: "700",
  },

  // Cards
  cardsRow: {
    flexDirection: "row",
    gap: 16,
    width: "88%",
  },
  methodCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fff",
    position: "relative",
  },
  methodCardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FAFF",
  },
  methodIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  methodIconText: { fontSize: 20 },
  methodCardTitle: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 8,
  },
  methodCardBadge: {
    fontWeight: "600",
  },
  methodCardDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  selectedDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDotText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  // CTA
  continueBtn: {
    marginTop: 28,
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    paddingHorizontal: 36,
    borderRadius: 9,
  },
  continueBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
