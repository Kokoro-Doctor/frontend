import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

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

const DataIntegration = ({ navigation }) => {
  const [selected, setSelected] = useState(null);
  const [currentStep] = useState(0);
  const { width } = useWindowDimensions();

  const selectedMethod = methods.find((m) => m.key === selected);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "manual") {
      navigation.navigate("ManualDataIntegration");
    }
    // add more routes for api / excel when ready
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
                <View style={styles.header}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View>

                {/* Card */}
                <View style={styles.card}>
                  {/* Title Row */}
                  <View style={styles.titleTopSection}>
                    <Text style={styles.title}>AI Integration</Text>
                    <TouchableOpacity
                      style={styles.backHomeBtn}
                      onPress={() => navigation.goBack()}
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
                    <Text style={styles.cloudIcon}>☁️</Text>

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
                          onPress={() => setSelected(m.key)}
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

                    {/* CTA */}
                    {selected && (
                      <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={handleContinue}
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
    </>
  );
};

// ═══════════════════════════════════════════════════
// WEB STYLES
// ═══════════════════════════════════════════════════
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
    overflow: "visible"
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

export default DataIntegration;
