import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Platform,
  useWindowDimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

const steps = [
  { label: "Choose Method", sub: "API or upload" },
  { label: "Validate & Review", sub: "Check completeness" },
  { label: "Integration Complete", sub: "Dashboard unlocked" },
];

const ValidateDataScreen = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const {
    doctorCount = 0,
    patientCount = 0,
    errorCount = 0,
  } = route.params || {};
  const [currentStep, setCurrentStep] = useState(1);
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
              <View style={styles.left}>
                <HospitalSidebarNavigation navigation={navigation} />
              </View>
              <View style={styles.right}>
                {/* <View style={styles.header}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View> */}

                <View style={styles.card}>
                  {/* Title */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "700" }}>
                      AI Integration
                    </Text>

                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>Back to home</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step Bar */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    {steps.map((step, index) => {
                      const isCompleted = index < 1;
                      const isActive = index === 1;

                      return (
                        <React.Fragment key={index}>
                          {/* Step Item */}
                          <View style={{ alignItems: "center", width: "30%" }}>
                            <View
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor:
                                  isCompleted || isActive
                                    ? "#2563EB"
                                    : "#E5E7EB",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: "#fff", fontSize: 12 }}>
                                {isCompleted ? "✓" : index + 1}
                              </Text>
                            </View>

                            <Text
                              style={{
                                marginTop: 6,
                                fontSize: 12,
                                color: index <= 1 ? "#2563EB" : "#9CA3AF",
                              }}
                            >
                              {step.label}
                            </Text>

                            <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
                              {step.sub}
                            </Text>
                          </View>

                          {/* Connector */}
                          {index < steps.length - 1 && (
                            <View
                              style={{
                                height: 2,
                                flex: 1,
                                backgroundColor:
                                  index < 1 ? "#2563EB" : "#E5E7EB",
                                marginHorizontal: 6,
                              }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>

                  {/* Success Info Box */}
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#3B82F6",
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 20,
                      backgroundColor: "#EEF5FF",
                    }}
                  >
                    <Text style={{ color: "#2563EB", fontSize: 13 }}>
                      All data validated successfully. {patientCount} patients ·{" "}
                      {doctorCount} doctors ·
                      {/* {errorCount} format errors
                      detected. */}
                    </Text>
                  </View>

                  {/* Stats */}
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <View style={stylesMobile.statBox}>
                      <Text style={stylesMobile.statNumber}>{doctorCount}</Text>
                      <Text style={stylesMobile.statLabel}>
                        Doctor Imported
                      </Text>
                    </View>

                    <View style={stylesMobile.statBox}>
                      <Text style={stylesMobile.statNumber}>
                        {patientCount}
                      </Text>
                      <Text style={stylesMobile.statLabel}>
                        patients records
                      </Text>
                    </View>

                    {/* <View style={stylesMobile.statBox}>
                      <Text style={stylesMobile.statNumber}>{errorCount}</Text>
                      <Text style={stylesMobile.statLabel}>Error detected</Text>
                    </View> */}
                  </View>

                  {/* Info Card */}
                  <View style={[stylesMobile.infoCard, { marginTop: 20 }]}>
                    <Text style={stylesMobile.infoTitle}>
                      Data availability after integration
                    </Text>

                    <Text style={stylesMobile.infoText}>
                      • Insurance claim analysis — doctor NMC numbers
                      auto-populated
                    </Text>
                    <Text style={stylesMobile.infoText}>
                      • Revenue dashboard — full hospital-level analytics
                      unlocked
                    </Text>
                    <Text style={stylesMobile.infoText}>
                      • Data permanently stored — no re-upload needed for future
                      claims
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View
                    style={{ flexDirection: "row", marginTop: 20, gap: 10 }}
                  >
                    {/* <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        paddingVertical: 12,
                        paddingHorizontal: 18,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#6B7280" }}>Back</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#2563EB",
                        paddingVertical: 12,
                        paddingHorizontal: 18,
                        borderRadius: 6,
                      }}
                      onPress={() =>
                        navigation.navigate("HospitalAppNavigation", {
                          screen: "DataIntegrationComplete",
                          params: { doctorCount, patientCount, errorCount },
                        })
                      }
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Confirm & Complete Integration →
                      </Text>
                    </TouchableOpacity>
                  </View>
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
            <Image
              source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
              style={{ width: "100%", marginBottom: 12 }}
              resizeMode="contain"
            />
            {/* Heading */}
            <Text style={stylesMobile.heading}>
              Upload your hospital data files
            </Text>
            {/* Success Box */}
            <View style={stylesMobile.successBox}>
              <Text style={stylesMobile.successText}>
                {errorCount === 0
                  ? "All data validated successfully."
                  : "Some errors detected. Please review."}
              </Text>
              <Text style={stylesMobile.successText}>
                {patientCount} patients · {doctorCount} doctors · {errorCount}{" "}
                format errors detected.
              </Text>
            </View>
            {/* Stats */}
            <View style={stylesMobile.statsContainer}>
              <View style={stylesMobile.statBox}>
                <Text style={stylesMobile.statNumber}>{doctorCount}</Text>
                <Text style={stylesMobile.statLabel}>Doctor{"\n"}Imported</Text>
              </View>

              <View style={stylesMobile.statBox}>
                <Text style={stylesMobile.statNumber}>{patientCount}</Text>
                <Text style={stylesMobile.statLabel}>
                  patients{"\n"}records
                </Text>
              </View>

              {/* <View style={stylesMobile.statBox}>
            <Text style={stylesMobile.statNumber}>0</Text>
            <Text style={stylesMobile.statLabel}>Error{"\n"}detected</Text>
          </View> */}
            </View>
            {/* Info Card */}
            <View style={stylesMobile.infoCard}>
              <Text style={stylesMobile.infoTitle}>
                Data availability after integration
              </Text>

              <Text style={stylesMobile.infoText}>
                • Insurance claim analysis — doctor NMC numbers auto-populated
              </Text>
              <Text style={stylesMobile.infoText}>
                • Revenue dashboard — full hospital-level analytics unlocked
              </Text>
              <Text style={stylesMobile.infoText}>
                • Data permanently stored — no re-upload needed for future
                claims
              </Text>
            </View>
            {/* Button */}
            <TouchableOpacity
              style={stylesMobile.button}
              onPress={() => {
                navigation.navigate("HospitalAppNavigation", {
                  screen: "DataIntegrationComplete",
                  params: {
                    doctorCount,
                    patientCount,
                    errorCount,
                  },
                });
              }}
            >
              <Text style={stylesMobile.buttonText}>Validate Data</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

export default ValidateDataScreen;

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

  heading: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },

  successBox: {
    borderWidth: 1,
    borderColor: "#25BA58",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#FBFDFF",
  },

  successText: {
    color: "#22C55E",
    fontSize: 12,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#25BA58",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
    backgroundColor: "#025AE000",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B6B6B",
  },

  statLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#25BA58",
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 15,
    borderColor: "#E8E8E8",
    borderWidth: 1,
  },

  infoTitle: {
    fontWeight: "600",
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 3,
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 8,
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

    borderRadius: 12,
    alignSelf: "center",
    justifyContent: "center", // 🔥 important
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
    padding: 20,
    marginTop:"4%"
  },
  header: {
    marginBottom: 16,
    position: "relative",
    zIndex: 1000,
  },
});
