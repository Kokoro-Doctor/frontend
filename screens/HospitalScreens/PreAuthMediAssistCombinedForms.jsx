/**
 * MediAssistCombinedForm — single screen that hosts Form A and Form B
 * with Next / Previous navigation between them.
 *
 * Navigate here from HospitalInsuranceClaim with:
 *   navigation.navigate("MediAssistCombinedForm", { analysisData })
 *
 * State ownership:
 *  - formA / formB live here so both forms survive tab-switches
 *  - All updater callbacks (setField, setDiagnosis, etc.) are defined here
 *    and passed down as props — the child components are purely presentational
 */

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// ── Form content components ──────────────────────────────────────────────────
import PreAuthMediAssistFormAContent from "../../components/HospitalPortalComponent/PreAuthMediAssistFormA";
// import MediAssistFormBContent from "../../components/HospitalPortalComponent/MediAssistFormB";

// ── Mappers & download utils ─────────────────────────────────────────────────
import { mapToFormA, mapToFormB } from "../../utils/PreAuthMediAssistMapper";
import {
  downloadMediAssistFormA,
  downloadMediAssistFormAPage2,
  generateMediAssistFormAHTML,
  generateMediAssistFormAPage2HTML,
} from "../../utils/PreAuthMediAssistFormA";
import { listPatientDocuments } from "../../utils/HospitalStaffDocsService";
// import {
//   downloadMediAssistFormB,
//   generateMediAssistFormBHTML,
// } from "../../utils/PreAuthMediAssistFormB";

// ─────────────────────────────────────────────────────────────────────────────
//  STEP CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { key: "A", label: "Page 1", sub: "Insured section" },
  { key: "B", label: "Page 2", sub: "Cost & Declaration" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function PreAuthMediAssistCombinedForms({ navigation, route }) {
  const analysisData = route?.params?.analysisData;
  const patient = route?.params?.patient;
  const { width } = useWindowDimensions();

  // ── Step state ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0); // 0 = Form A, 1 = Form B

  // ── Form A state ───────────────────────────────────────────────────────────
  const formASeed = useMemo(() => mapToFormA(analysisData), [analysisData]);
  const [formA, setFormA] = useState(() => formASeed);
  const [signatureA, setSignatureA] = useState(null);
  const [previewA, setPreviewA] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const handleGoToProfile = async () => {
    if (isProfileLoading) return;
    setIsProfileLoading(true);
    try {
      const data = await listPatientDocuments(patient.id);
      navigation.navigate("PatientDetails", {
        patient,
        preloadedDocuments: data?.documents || [],
      });
    } catch (e) {
      // fallback — agar fetch fail ho jaye tab bhi navigate ho jaye,
      // PatientDetails khud fetchDocuments() call kar lega
      navigation.navigate("PatientDetails", { patient });
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    setFormA(formASeed);
  }, [formASeed]);

  const setFieldA = useCallback((key, v) => {
    setFormA((prev) => ({ ...prev, [key]: v }));
  }, []);

  // ── Form B state ───────────────────────────────────────────────────────────
  // const formBSeed = useMemo(() => mapToFormB(analysisData), [analysisData]);
  // const [formB, setFormB] = useState(() => formBSeed);
  // const [signatureB, setSignatureB] = useState(null);
  // const [previewB, setPreviewB] = useState(true);

  // useEffect(() => {
  //   setFormB(formBSeed);
  // }, [formBSeed]);

  // const setFieldB = useCallback((key, v) => {
  //   setFormB((prev) => ({ ...prev, [key]: v }));
  // }, []);

  // const setDiagnosis = useCallback((idx, subKey, v) => {
  //   setFormB((prev) => ({
  //     ...prev,
  //     diagnoses: prev.diagnoses.map((r, i) =>
  //       i === idx ? { ...r, [subKey]: v } : r,
  //     ),
  //   }));
  // }, []);

  // const setProcedure = useCallback((idx, subKey, v) => {
  //   setFormB((prev) => ({
  //     ...prev,
  //     procedures: prev.procedures.map((r, i) =>
  //       i === idx ? { ...r, [subKey]: v } : r,
  //     ),
  //   }));
  // }, []);

  // const toggleChecklist = useCallback((idx) => {
  //   setFormB((prev) => {
  //     const next = [...prev.claimDocChecklist];
  //     next[idx] = !next[idx];
  //     return { ...prev, claimDocChecklist: next };
  //   });
  // }, []);

  // ── Download ───────────────────────────────────────────────────────────────
  const [isDownloading, setIsDownloading] = useState(false);

  // const handleDownload = async () => {
  //   if (isDownloading) return;
  //   setIsDownloading(true);
  //   try {
  //     if (currentStep === 0) {
  //       await downloadMediAssistFormA(formA, signatureA);
  //     } else {
  //       await downloadMediAssistFormB(formB, signatureB);
  //     }
  //   } catch {
  //     Alert.alert(
  //       "Download Error",
  //       "Could not generate the PDF. Please try again.",
  //     );
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if (currentStep === 0) {
        await downloadMediAssistFormA(formA, signatureA);
      } else {
        await downloadMediAssistFormAPage2(formA, signatureA);
      }
    } catch {
      Alert.alert(
        "Download Error",
        "Could not generate the PDF. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // ── HTML preview (only computed for active form) ───────────────────────────
  // const htmlPreviewA = useMemo(
  //   () => generateMediAssistFormAHTML(formA, signatureA),
  //   [formA, signatureA],
  // );
  // const htmlPreviewB = useMemo(
  //   () => generateMediAssistFormBHTML(formB, signatureB),
  //   [formB, signatureB],
  // );

  // // ── Derived ────────────────────────────────────────────────────────────────
  // const isFirst = currentStep === 0;
  // const isLast = currentStep === STEPS.length - 1;
  // const activePreview = currentStep === 0 ? previewA : previewB;
  // const activeHtml = currentStep === 0 ? htmlPreviewA : htmlPreviewB;

  // const togglePreview = () => {
  //   if (currentStep === 0) setPreviewA((p) => !p);
  //   else setPreviewB((p) => !p);
  // };
  const activeHtml = useMemo(
    () =>
      currentStep === 0
        ? generateMediAssistFormAHTML(formA, signatureA)
        : generateMediAssistFormAPage2HTML(formA, signatureA),
    [formA, signatureA, currentStep],
  );
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const activePreview = previewA;

  const togglePreview = () => setPreviewA((p) => !p);

  // ─────────────────────────────────────────────────────────────────────────
  //  FORM TABS (pill switcher)
  // ─────────────────────────────────────────────────────────────────────────
  const FormTabs = () => (
    <View style={styles.tabRow}>
      {STEPS.map((step, i) => (
        <TouchableOpacity
          key={step.key}
          style={[styles.tab, currentStep === i && styles.tabActive]}
          onPress={() => setCurrentStep(i)}
        >
          <Text
            style={[styles.tabText, currentStep === i && styles.tabTextActive]}
          >
            {step.label}
          </Text>
          <Text
            style={[styles.tabSub, currentStep === i && styles.tabSubActive]}
          >
            {step.sub}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  NAV BUTTONS (Prev / Next / Download)
  // ─────────────────────────────────────────────────────────────────────────
  const NavButtons = () => (
    <View style={styles.navRow}>
      {/* Previous */}
      <TouchableOpacity
        style={[
          styles.navBtn,
          styles.navBtnOutline,
          isFirst && styles.navBtnDisabled,
        ]}
        onPress={() => setCurrentStep((s) => s - 1)}
        disabled={isFirst}
      >
        <Ionicons
          name="arrow-back"
          size={14}
          color={isFirst ? "#ccc" : "#374151"}
        />
        <Text style={[styles.navBtnText, isFirst && { color: "#ccc" }]}>
          Previous
        </Text>
      </TouchableOpacity>

      {/* Download current form */}
      <TouchableOpacity
        style={[
          styles.navBtn,
          styles.navBtnPrimary,
          isDownloading && { opacity: 0.6 },
        ]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.navBtnTextWhite}>
            Download Form {STEPS[currentStep].key}
          </Text>
        )}
      </TouchableOpacity>

      {/* Next */}
      <TouchableOpacity
        style={[
          styles.navBtn,
          styles.navBtnOutline,
          isLast && styles.navBtnDisabled,
        ]}
        onPress={() => setCurrentStep((s) => s + 1)}
        disabled={isLast}
      >
        <Text style={[styles.navBtnText, isLast && { color: "#7f4040ff" }]}>
          Next
        </Text>
        <Ionicons
          name="arrow-forward"
          size={14}
          color={isLast ? "#ccc" : "#374151"}
        />
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  ACTIVE FORM CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  // const ActiveFormContent = () => {
  //   if (currentStep === 0) {
  //     return (
  //       <PreAuthMediAssistFormAContent
  //         form={formA}
  //         setField={setFieldA}
  //         signatureImage={signatureA}
  //         setSignatureImage={setSignatureA}
  //         navigation={navigation}
  //         page={currentStep === 0 ? 1 : 2}
  //       />
  //     );
  //   }
  //   // return (
  //   //   <MediAssistFormBContent
  //   //     form={formB}
  //   //     setField={setFieldB}
  //   //     setDiagnosis={setDiagnosis}
  //   //     setProcedure={setProcedure}
  //   //     toggleChecklist={toggleChecklist}
  //   //     signatureImage={signatureB}
  //   //     setSignatureImage={setSignatureB}
  //   //     navigation={navigation}
  //   //   />
  //   // );
  // };
  const ActiveFormContent = () => (
    <PreAuthMediAssistFormAContent
      form={formA}
      setField={setFieldA}
      signatureImage={signatureA}
      setSignatureImage={setSignatureA}
      navigation={navigation}
      page={currentStep === 0 ? 1 : 2}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  WEB LAYOUT  (width > 1000)
  // ─────────────────────────────────────────────────────────────────────────
  if (Platform.OS === "web" && width > 1000) {
    return (
      <View style={styles.root}>
        <View style={styles.mainRow}>
          {/* SIDEBAR */}
          {/* <View style={styles.sidebar}>
              <HospitalSidebarNavigation navigation={navigation} />
            </View> */}

          {/* CONTENT */}
          <View style={styles.content}>
            <View style={styles.card}>
              {/* INFO BOX */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Updated claim file generated. Review below, make any final
                  edits, then download.
                </Text>
              </View>

              {/* CLAIM CARD */}
              <View style={styles.claimCard}>
                {/* FILE HEADER + TABS + EDIT/PREVIEW toggle */}
                <View style={styles.claimCardHeader}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons name="document-text" size={18} color="#1976D2" />
                    <Text style={styles.fileName}>
                      {analysisData?.structured_data?.source_filename ||
                        "Insurance_Claim.pdf"}
                    </Text>
                  </View>

                  <FormTabs />

                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={togglePreview}
                  >
                    <Text style={styles.toggleBtnText}>
                      {activePreview ? "Edit Fields" : "Preview"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    minHeight: 0,
                  }}
                > */}
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    minHeight: 0,
                    width: "100%",
                  }}
                >
                  {/* LEFT → FORM */}
                  <View
                    style={{
                      flex: 1,
                      paddingRight: 14,
                      //minWidth: "80%",
                      minHeight: 0,
                      borderWidth: 1,
                      borderColor: "#afb0b0ff",
                    }}
                  >
                    {activePreview ? (
                      <iframe
                        srcDoc={activeHtml}
                        // style={{
                        //   width: "100%",
                        //   height: "85vh",
                        //   border: "none",
                        //   overflow: "auto",
                        //   backgroundColor: "#fff",
                        // }}
                        style={{
                          width: "100%",
                          height: "100%",
                          minHeight: 650,
                          border: "none",
                          backgroundColor: "#fff",
                          borderRadius: 10,
                        }}
                        title={`Form ${STEPS[currentStep].key} Preview`}
                      />
                    ) : (
                      <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                          paddingBottom: 120,
                          flexGrow: 1,
                        }}
                        showsVerticalScrollIndicator={true}
                      >
                        <ActiveFormContent />
                      </ScrollView>
                    )}
                  </View>

                  {/* RIGHT → BUTTON PANEL */}
                  <View style={stylesWeb.buttonSidePanel}>
                    <View style={stylesWeb.buttonContainer}>
                      {/* <TouchableOpacity style={stylesWeb.outlineBtnWeb}>
                        <Text style={stylesWeb.outlineTextWeb}>
                          Open in editor
                        </Text>
                      </TouchableOpacity> */}

                      <TouchableOpacity
                        style={[
                          stylesWeb.primaryBtnWeb,
                          isDownloading && { opacity: 0.6 },
                        ]}
                        onPress={handleDownload}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={stylesWeb.primaryTextWeb}>
                            Download Form {STEPS[currentStep].key}
                          </Text>
                        )}
                      </TouchableOpacity>

                      {/* <TouchableOpacity style={stylesWeb.greenOutlineBtnWeb}>
                        <Text style={stylesWeb.greenOutlineTextWeb}>
                          Analyze another claim
                        </Text>
                      </TouchableOpacity> */}

                      {/* <TouchableOpacity style={stylesWeb.greenBtnWeb}>
                        <Text style={stylesWeb.greenTextWeb}>
                          Set up date Integration
                        </Text>
                      </TouchableOpacity> */}
                      <TouchableOpacity
                        style={[
                          stylesWeb.profileBtn,
                          isProfileLoading && { opacity: 0.6 },
                        ]}
                        onPress={handleGoToProfile}
                        disabled={isProfileLoading}
                      >
                        {isProfileLoading ? (
                          <ActivityIndicator size="small" color="#0b0787ff" />
                        ) : (
                          <Text style={stylesWeb.profileText}>
                            Go to Profile
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* NAV BUTTONS */}
              <NavButtons />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  MOBILE LAYOUT
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.mobileContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#fff" />

      {/* Tabs */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <FormTabs />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
      >
        {/* Info box */}
        <View style={styles.mobileInfoBox}>
          <Text style={styles.infoText}>
            Fill in the details below, then download.
          </Text>
        </View>

        {/* Edit / Preview toggle */}
        <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
          <TouchableOpacity style={styles.toggleBtn} onPress={togglePreview}>
            <Text style={styles.toggleBtnText}>
              {activePreview ? "Edit Fields" : "Preview"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form card */}
        {/* Form card */}
        <View style={styles.mobileCard}>
          {activePreview ? (
            Platform.OS === "web" ? (
              <iframe
                srcDoc={activeHtml}
                style={{ width: "100%", border: "none", minHeight: 500 }}
                title={`Form ${STEPS[currentStep].key} Preview`}
              />
            ) : (
              <WebView
                originWhitelist={["*"]}
                source={{ html: activeHtml }}
                style={{ width: "100%", height: 600 }}
                scalesPageToFit={Platform.OS === "android"}
              />
            )
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={{ minWidth: 1300 }}>
                <ActiveFormContent />
              </View>
            </ScrollView>
          )}
        </View>

        {/* Mobile nav buttons */}
        <NavButtons />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Web root ──
  root: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    width: "100%",
    height: "100%",
  },

  mainRow: {
    flex: 1,
    width: "100%",
  },

  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },

  // ── Card ──
  // card: {
  //   backgroundColor: "#fff",
  //   borderRadius: 12,
  //   padding: 16,
  //   width: "95%",
  //   alignSelf: "center",
  //   zIndex: 5,
  //   height: "92vh",
  //   overflow: "hidden",
  //   display: "flex",
  //   flexDirection: "column",
  //   marginTop: "2%",
  // },

  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },
  // ── Info box ──
  infoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexShrink: 0,
  },
  infoText: { fontSize: 12, color: "#1E3A8A" },

  // ── Claim card ──
  // claimCard: {
  //   backgroundColor: "#F9FAFB",
  //   borderRadius: 8,
  //   padding: 14,
  //   borderWidth: 1,
  //   borderColor: "#E5E7EB",
  //   flex: 1,
  //   overflow: "hidden",
  //   display: "flex",
  //   flexDirection: "column",
  // },
  claimCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  // claimCardHeader: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   marginBottom: 10,
  //   flexShrink: 0,
  // },
  claimCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
    flexWrap: "wrap",
  },
  fileName: { fontSize: 13, color: "#1976D2", fontWeight: "500" },

  // ── Form tabs ──
  // tabRow: { flexDirection: "row", gap: 6 },
  tabRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  tabTextActive: { color: "#fff" },
  tabSub: { fontSize: 9, color: "#9CA3AF", marginTop: 1 },
  tabSubActive: { color: "#BFDBFE" },

  // ── Edit/Preview toggle ──
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1976D2",
  },
  toggleBtnText: { fontSize: 11, color: "#1976D2", fontWeight: "600" },

  // ── Nav buttons ──
  // navRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginTop: 12,
  //   flexShrink: 0,
  //   gap: 8,
  // },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    gap: 6,
  },
  navBtnOutline: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  navBtnPrimary: {
    backgroundColor: "#1565C0",
    flex: 1,
    justifyContent: "center",
  },
  navBtnDisabled: { borderColor: "#E5E7EB" },
  navBtnText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  navBtnTextWhite: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },

  // ── Mobile ──
  mobileContainer: { flex: 1, backgroundColor: "#F5F6F8" },

  mobileInfoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  mobileCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 16,
  },
});
const stylesWeb = StyleSheet.create({
  // buttonSidePanel: {
  //   flex: 1,
  //   borderLeftWidth: 1,
  //   borderLeftColor: "#E5E7EB",
  //   paddingLeft: 16,
  //   justifyContent: "flex-start",
  // },
  // buttonSidePanel: {
  //   width: 220,
  //   minWidth: 220,

  //   borderLeftWidth: 1,
  //   borderLeftColor: "#E5E7EB",

  //   paddingLeft: 16,
  //   marginLeft: 4,
  // },

  // buttonContainer: {
  //   gap: 12,
  //   //borderWidth:1,
  //   width: "80%",
  //   marginLeft: "23%",
  // },
  buttonSidePanel: {
    width: 190,
    minWidth: 190,

    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",

    paddingLeft: 12,
    marginLeft: 8,
  },

  buttonContainer: {
    gap: 12,
    width: "100%",
  },

  outlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },

  outlineTextWeb: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "500",
  },

  primaryBtnWeb: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  primaryTextWeb: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  greenOutlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#10B981",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },

  greenOutlineTextWeb: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "500",
  },

  greenBtnWeb: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  greenTextWeb: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  profileBtn: {
    backgroundColor: "#d9ddf0ff",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#2620ddff",
    borderWidth: 1,
  },
  profileText: {
    color: "#0b0787ff",
    fontSize: 13.5,
    fontWeight: "600",
  },
});
