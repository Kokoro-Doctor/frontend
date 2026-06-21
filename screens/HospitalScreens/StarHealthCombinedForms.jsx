/**
 * StarHealthCombinedForms — single screen that hosts Form A, Form B, and
 * Discharge Summary with tab-based navigation between them.
 *
 * Navigate here from HospitalInsuranceClaim with:
 *   navigation.navigate("StarHealthCombinedForms", { analysisData })
 *
 * State ownership:
 *  - formA / formB live here so both forms survive tab-switches
 *  - All updater callbacks are defined here and passed down as props
 *  - Child components (StarHealthFormA / StarHealthFormB) are purely presentational
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  ImageBackground,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

// ── Form content components ──────────────────────────────────────────────────
import StarHealthFormAContent from "../../components/HospitalPortalComponent/StarHealthFormA";
import StarHealthFormBContent from "../../components/HospitalPortalComponent/StarHealthFormB";

// ── Mappers ──────────────────────────────────────────────────────────────────
import {
  mapToStarHealthFormA,
  mapToStarHealthFormB,
} from "../../utils/StarHealthMapper";
import { mapToDischargeSummary } from "../../utils/DischargeMapper";

// ── Download / HTML utils ────────────────────────────────────────────────────
import {
  downloadInsuranceClaim as downloadFormA,
  generateInsuranceFormHTML as generateFormAHTML,
} from "../../utils/StarHealthFormA";
import {
  downloadInsuranceClaim as downloadFormB,
  generateInsuranceFormHTML as generateFormBHTML,
} from "../../utils/StarHealthFormB";
import {
  downloadInsuranceClaim as downloadDischargeSummary,
  generateInsuranceFormHTML as generateDischargeSummaryHTML,
} from "../../utils/DischargeSummary";

// ── Layout components ─────────────────────────────────────────────────────────
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";

// ─────────────────────────────────────────────────────────────────────────────
//  STEP CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { key: "A", label: "Form A", sub: "Insured section" },
  { key: "B", label: "Form B", sub: "Hospital section" },
  { key: "DS", label: "Discharge Summary", sub: "Claim summary" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function StarHealthCombinedForms({ navigation, route }) {
  const analysisData = route?.params?.analysisData;
  const { width } = useWindowDimensions();
  const dischargeSummaryIframeRef = useRef(null);

  // ── Step state ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0); // 0=FormA, 1=FormB, 2=DS
  const isDischargeSummaryStep = currentStep === 2;

  // ── Form A state ───────────────────────────────────────────────────────────
  const formASeed = useMemo(
    () => mapToStarHealthFormA(analysisData),
    [analysisData],
  );
  const [formA, setFormA] = useState(() => formASeed);
  const [signatureA, setSignatureA] = useState(null);
  const [previewA, setPreviewA] = useState(true);

  useEffect(() => {
    setFormA(formASeed);
  }, [formASeed]);

  const setFieldA = useCallback((key, v) => {
    setFormA((prev) => ({ ...prev, [key]: v }));
  }, []);

  const setBillFieldA = useCallback((rowIndex, key, value) => {
    setFormA((prev) => ({
      ...prev,
      billRows: (prev.billRows || []).map((row, i) =>
        i === rowIndex ? { ...row, [key]: value } : row,
      ),
    }));
  }, []);

  // ── Form B state ───────────────────────────────────────────────────────────
  const formBSeed = useMemo(
    () => mapToStarHealthFormB(analysisData),
    [analysisData],
  );
  const [formB, setFormB] = useState(() => formBSeed);
  const [signatureB, setSignatureB] = useState(null);
  const [previewB, setPreviewB] = useState(true);

  useEffect(() => {
    setFormB(formBSeed);
  }, [formBSeed]);

  const setFieldB = useCallback((key, v) => {
    setFormB((prev) => ({ ...prev, [key]: v }));
  }, []);

  const setBillFieldB = useCallback((rowIndex, key, value) => {
    setFormB((prev) => ({
      ...prev,
      billRows: (prev.billRows || []).map((row, i) =>
        i === rowIndex ? { ...row, [key]: value } : row,
      ),
    }));
  }, []);

  // ── Discharge Summary state ────────────────────────────────────────────────
  const dischargeSummarySeed = useMemo(
    () => mapToDischargeSummary(analysisData),
    [analysisData],
  );
  const [dischargeSummaryForm, setDischargeSummaryForm] = useState(
    () => dischargeSummarySeed,
  );
  const [dischargeSummaryEditedHtml, setDischargeSummaryEditedHtml] =
    useState(null);

  useEffect(() => {
    let formWithHospital = dischargeSummarySeed;
    if (Platform.OS === "web") {
      const loggedInHospitalName = localStorage.getItem("hospital_name");
      if (loggedInHospitalName) {
        formWithHospital = { ...dischargeSummarySeed, loggedInHospitalName };
      }
    }
    setDischargeSummaryForm(formWithHospital);
  }, [dischargeSummarySeed]);

  useEffect(() => {
    setDischargeSummaryEditedHtml(null);
  }, [dischargeSummarySeed]);

  // ── Download ───────────────────────────────────────────────────────────────
  const [isDownloading, setIsDownloading] = useState(false);

  const buildDocumentHtml = useCallback((doc) => {
    if (!doc?.documentElement) return null;
    const clone = doc.documentElement.cloneNode(true);

    const sourceInputs = doc.querySelectorAll("input");
    const clonedInputs = clone.querySelectorAll("input");
    sourceInputs.forEach((input, index) => {
      const clonedInput = clonedInputs[index];
      if (!clonedInput) return;
      if (input.type === "checkbox" || input.type === "radio") {
        if (input.checked) clonedInput.setAttribute("checked", "");
        else clonedInput.removeAttribute("checked");
      } else {
        clonedInput.setAttribute("value", input.value ?? "");
      }
    });

    const sourceTextareas = doc.querySelectorAll("textarea");
    const clonedTextareas = clone.querySelectorAll("textarea");
    sourceTextareas.forEach((textarea, index) => {
      const ct = clonedTextareas[index];
      if (ct) ct.textContent = textarea.value ?? "";
    });

    const sourceSelects = doc.querySelectorAll("select");
    const clonedSelects = clone.querySelectorAll("select");
    sourceSelects.forEach((select, index) => {
      const cs = clonedSelects[index];
      if (!cs) return;
      Array.from(cs.options).forEach((option, oi) => {
        option.selected = select.options[oi]?.selected ?? false;
        if (option.selected) option.setAttribute("selected", "");
        else option.removeAttribute("selected");
      });
    });

    return `<!DOCTYPE html>\n${clone.outerHTML}`;
  }, []);

  const getDischargeSummaryHtmlOverride = useCallback(() => {
    if (Platform.OS === "web") {
      const iframeDoc = dischargeSummaryIframeRef.current?.contentDocument;
      return buildDocumentHtml(iframeDoc) || dischargeSummaryEditedHtml;
    }
    return dischargeSummaryEditedHtml;
  }, [buildDocumentHtml, dischargeSummaryEditedHtml]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      if (currentStep === 0) {
        await downloadFormA(formA, signatureA);
      } else if (currentStep === 1) {
        await downloadFormB(formB, signatureB);
      } else {
        await downloadDischargeSummary(
          dischargeSummaryForm,
          null,
          getDischargeSummaryHtmlOverride(),
        );
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

  // ── HTML previews ──────────────────────────────────────────────────────────
  const htmlPreviewA = useMemo(
    () => generateFormAHTML(formA, signatureA),
    [formA, signatureA],
  );
  const htmlPreviewB = useMemo(
    () => generateFormBHTML(formB, signatureB),
    [formB, signatureB],
  );
  const htmlPreviewDischarge = useMemo(
    () => generateDischargeSummaryHTML(dischargeSummaryForm),
    [dischargeSummaryForm],
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const activeStep = STEPS[currentStep];
  const activePreview =
    currentStep === 0 ? previewA : currentStep === 1 ? previewB : true;
  const activeHtml =
    currentStep === 0
      ? htmlPreviewA
      : currentStep === 1
        ? htmlPreviewB
        : htmlPreviewDischarge;

  const togglePreview = () => {
    if (currentStep === 0) setPreviewA((p) => !p);
    else if (currentStep === 1) setPreviewB((p) => !p);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  STEP INDICATOR
  // ─────────────────────────────────────────────────────────────────────────
  function StepItem({ label, sub, done, active, number }) {
    return (
      <View style={styles.stepItem}>
        {done ? (
          <View style={styles.stepCircleDone}>
            <Text style={styles.stepTick}>✓</Text>
          </View>
        ) : (
          <View
            style={[
              styles.stepCircleInactive,
              active && styles.stepCircleActive,
            ]}
          >
            <Text style={[styles.stepNum, active && styles.stepNumActive]}>
              {number}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: 8 }}>
          <Text
            style={[
              styles.stepLabel,
              (done || active) && styles.stepLabelActive,
            ]}
          >
            {label}
          </Text>
          <Text style={styles.stepSub}>{sub}</Text>
        </View>
      </View>
    );
  }

  function StepConnector() {
    return <View style={styles.stepConnector} />;
  }

  const StepBar = () => (
    <View style={styles.stepBar}>
      <StepItem label="Upload Documents" sub="Upload document" done />
      <StepConnector />
      <StepItem label="Full Case Analysis" sub="Analyze Reports" done />
      {STEPS.map((step, index) => (
        <React.Fragment key={step.key}>
          <StepConnector />
          <StepItem
            label={step.label}
            sub={step.sub}
            done={currentStep > index}
            active={currentStep === index}
            number={index + 3}
          />
        </React.Fragment>
      ))}
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  FORM TABS
  // ─────────────────────────────────────────────────────────────────────────
  const FormTabs = () => {
    const TAB_ORDER = [2, 0, 1]; // DS first, then A, then B
    return (
      <View style={styles.tabRow}>
        {TAB_ORDER.map((stepIndex) => {
          const step = STEPS[stepIndex];
          return (
            <TouchableOpacity
              key={step.key}
              style={[
                styles.tab,
                currentStep === stepIndex && styles.tabActive,
              ]}
              onPress={() => setCurrentStep(stepIndex)}
            >
              <Text
                style={[
                  styles.tabText,
                  currentStep === stepIndex && styles.tabTextActive,
                ]}
              >
                {step.label}
              </Text>
              <Text
                style={[
                  styles.tabSub,
                  currentStep === stepIndex && styles.tabSubActive,
                ]}
              >
                {step.sub}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  NAV BUTTONS
  // ─────────────────────────────────────────────────────────────────────────
  const NavButtons = () => (
    <View style={styles.navRow}>
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

      <TouchableOpacity
        style={[
          styles.navBtn,
          styles.navBtnOutline,
          isLast && styles.navBtnDisabled,
        ]}
        onPress={() => setCurrentStep((s) => s + 1)}
        disabled={isLast}
      >
        <Text style={[styles.navBtnText, isLast && { color: "#ccc" }]}>
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
  //  ACTIVE FORM CONTENT (edit mode)
  // ─────────────────────────────────────────────────────────────────────────
  const renderActiveFormContent = () => {
    if (currentStep === 0) {
      return (
        <StarHealthFormAContent
          form={formA}
          setField={setFieldA}
          setBillField={setBillFieldA}
          signatureImage={signatureA}
          setSignatureImage={setSignatureA}
          navigation={navigation}
        />
      );
    }
    if (currentStep === 1) {
      return (
        <StarHealthFormBContent
          form={formB}
          setField={setFieldB}
          setBillField={setBillFieldB}
          signatureImage={signatureB}
          setSignatureImage={setSignatureB}
          navigation={navigation}
        />
      );
    }
    return null;
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  HTML PREVIEW (iframe on web, WebView on native)
  // ─────────────────────────────────────────────────────────────────────────
  const HtmlFormPreview = ({ minHeight = 520, style }) => {
    if (Platform.OS === "web") {
      return (
        <iframe
          ref={isDischargeSummaryStep ? dischargeSummaryIframeRef : null}
          srcDoc={activeHtml}
          style={{ width: "100%", border: "none", minHeight, ...style }}
          title={`${activeStep.label} Preview`}
        />
      );
    }
    return (
      <WebView
        originWhitelist={["*"]}
        source={{ html: activeHtml }}
        injectedJavaScript={
          isDischargeSummaryStep
            ? `
              (function() {
                function buildHtmlSnapshot() {
                  var clone = document.documentElement.cloneNode(true);
                  var sourceInputs = document.querySelectorAll("input");
                  var clonedInputs = clone.querySelectorAll("input");
                  sourceInputs.forEach(function(input, index) {
                    var ci = clonedInputs[index];
                    if (!ci) return;
                    if (input.type === "checkbox" || input.type === "radio") {
                      if (input.checked) ci.setAttribute("checked", "");
                      else ci.removeAttribute("checked");
                    } else {
                      ci.setAttribute("value", input.value || "");
                    }
                  });
                  var sourceTextareas = document.querySelectorAll("textarea");
                  var clonedTextareas = clone.querySelectorAll("textarea");
                  sourceTextareas.forEach(function(ta, i) {
                    var ct = clonedTextareas[i];
                    if (ct) ct.textContent = ta.value || "";
                  });
                  var sourceSelects = document.querySelectorAll("select");
                  var clonedSelects = clone.querySelectorAll("select");
                  sourceSelects.forEach(function(sel, i) {
                    var cs = clonedSelects[i];
                    if (!cs) return;
                    Array.from(cs.options).forEach(function(opt, oi) {
                      var selected = !!(sel.options[oi] && sel.options[oi].selected);
                      opt.selected = selected;
                      if (selected) opt.setAttribute("selected", "");
                      else opt.removeAttribute("selected");
                    });
                  });
                  return '<!DOCTYPE html>\\n' + clone.outerHTML;
                }
                function sendHtml() {
                  window.ReactNativeWebView.postMessage(buildHtmlSnapshot());
                }
                ['input', 'change', 'click', 'keyup', 'blur'].forEach(function(ev) {
                  document.addEventListener(ev, function() { setTimeout(sendHtml, 0); }, true);
                });
                setTimeout(sendHtml, 0);
              })();
              true;
            `
            : undefined
        }
        onMessage={
          isDischargeSummaryStep
            ? (event) => {
                const html = event?.nativeEvent?.data;
                if (html) setDischargeSummaryEditedHtml(html);
              }
            : undefined
        }
        style={[styles.webViewPreview, style, { minHeight }]}
      />
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  BUTTON PANEL (shared between web and mobile)
  // ─────────────────────────────────────────────────────────────────────────
  const ButtonPanel = () => (
    <View style={stylesWeb.buttonContainer}>
      <TouchableOpacity style={stylesWeb.outlineBtnWeb}>
        <Text style={stylesWeb.outlineTextWeb}>Open in editor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[stylesWeb.primaryBtnWeb, isDownloading && { opacity: 0.6 }]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={stylesWeb.primaryTextWeb}>Download updated claim</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={stylesWeb.greenOutlineBtnWeb}>
        <Text style={stylesWeb.greenOutlineTextWeb}>Analyze another claim</Text>
      </TouchableOpacity>

      <TouchableOpacity style={stylesWeb.greenBtnWeb}>
        <Text style={stylesWeb.greenTextWeb}>Set up date Integration</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  WEB LAYOUT  (width > 1000)
  // ─────────────────────────────────────────────────────────────────────────
  if (Platform.OS === "web" && width > 1000) {
    return (
      <View style={styles.root}>
        <ImageBackground
          source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.mainRow}>
            {/* SIDEBAR */}
            <View style={styles.sidebar}>
              <HospitalSidebarNavigation navigation={navigation} />
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
              <View style={styles.card}>
                {/* CARD HEADER */}
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Star Health claim agent</Text>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={styles.backBtnText}>Back to home</Text>
                  </TouchableOpacity>
                </View>

                {/* STEP BAR */}
                <StepBar />

                {/* INFO BOX */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Updated Star Health claim file generated. Review below, make
                    any final edits, then download.
                  </Text>
                </View>

                {/* CLAIM CARD */}
                <View style={styles.claimCard}>
                  {/* FILE HEADER + TABS + EDIT/PREVIEW toggle */}
                  <View style={styles.claimCardHeader}>
                    <View style={styles.headerLeft}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons
                          name="document-text"
                          size={18}
                          color="#1976D2"
                        />
                        <Text style={styles.fileName}>
                          {analysisData?.structured_data?.source_filename ||
                            "StarHealth_Claim.pdf"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.headerCenter}>
                      <FormTabs />
                    </View>

                    <View style={styles.headerRight}>
                      {!isDischargeSummaryStep && (
                        <TouchableOpacity
                          style={styles.toggleBtn}
                          onPress={togglePreview}
                        >
                          <Text style={styles.toggleBtnText}>
                            {activePreview ? "Edit Fields" : "Preview"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* FORM BODY + BUTTON PANEL */}
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    {/* LEFT → FORM */}
                    <View style={{ flex: 3, paddingRight: 10, height: "100%" }}>
                      {isDischargeSummaryStep || activePreview ? (
                        <ScrollView
                          style={{ flex: 1 }}
                          contentContainerStyle={{ flexGrow: 1 }}
                          showsVerticalScrollIndicator
                        >
                          <HtmlFormPreview minHeight={1400} />
                        </ScrollView>
                      ) : (
                        <ScrollView
                          style={{ flex: 1 }}
                          showsVerticalScrollIndicator
                        >
                          {renderActiveFormContent()}
                        </ScrollView>
                      )}
                    </View>

                    {/* RIGHT → BUTTON PANEL */}
                    <View style={stylesWeb.buttonSidePanel}>
                      <ButtonPanel />
                    </View>
                  </View>
                </View>

                {/* NAV BUTTONS */}
                <NavButtons />
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  MOBILE LAYOUT
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.mobileContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#fff" />

      <View style={styles.mobileHeader}>
        <HeaderLoginSignUp navigation={navigation} />
      </View>

      <Text style={styles.mobileTitle}>Star Health claim agent</Text>

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
            Fill in the Star Health claim details below, then download.
          </Text>
        </View>

        {/* Edit / Preview toggle */}
        {!isDischargeSummaryStep && (
          <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
            <TouchableOpacity style={styles.toggleBtn} onPress={togglePreview}>
              <Text style={styles.toggleBtnText}>
                {activePreview ? "Edit Fields" : "Preview"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form card */}
        <View style={styles.mobileCard}>
          {isDischargeSummaryStep ? (
            <View style={styles.mobileHtmlPreviewWrap}>
              <HtmlFormPreview
                minHeight={900}
                style={styles.mobileHtmlPreview}
              />
            </View>
          ) : activePreview && Platform.OS === "web" ? (
            <HtmlFormPreview minHeight={500} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={{ minWidth: 1300 }}>
                {renderActiveFormContent()}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Mobile buttons */}
        <View style={{ marginTop: 8 }}>
          <ButtonPanel />
        </View>

        {/* Nav buttons */}
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
  root: { flex: 1, height: "100vh", overflow: "hidden" },
  background: { flex: 1, height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  mainRow: { flexDirection: "row", height: "100%", zIndex: 2 },
  sidebar: { width: "15%" },
  content: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },

  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "92vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    marginTop: "2%",
  },

  // ── Card header ──
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexShrink: 0,
  },
  cardTitle: { fontSize: 19, fontWeight: "700", color: "#111827" },
  backBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  backBtnText: { fontSize: 13, color: "#374151", fontWeight: "500" },

  // ── Step bar ──
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 10,
    flexShrink: 0,
  },
  stepItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepConnector: {
    height: 2,
    width: 24,
    backgroundColor: "#2563EB",
    marginHorizontal: 4,
    alignSelf: "center",
    flexShrink: 0,
  },
  stepCircleDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepTick: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepCircleInactive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: { borderColor: "#2563EB" },
  stepNum: { fontSize: 11, fontWeight: "700", color: "#9CA3AF" },
  stepNumActive: { color: "#2563EB" },
  stepLabel: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
  stepLabelActive: { color: "#2563EB" },
  stepSub: { fontSize: 9, color: "#9CA3AF", marginTop: 1 },

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
  claimCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flex: 1,
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
  },
  //   claimCardHeader: {
  //     flexDirection: "row",
  //     alignItems: "center",
  //     marginBottom: 10,
  //     flexShrink: 0,
  //   },
  claimCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexShrink: 0,
    overflow: "visible",
    zIndex: 10,
  },
  fileName: { fontSize: 13, color: "#1976D2", fontWeight: "500" },
  headerLeft: { flex: 1 },
  //   headerCenter: { flex: 1, alignItems: "center" },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    overflow: "visible",
    zIndex: 10,
  },
  headerRight: { flex: 1, alignItems: "flex-end" },

  // ── Toggle ──
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1976D2",
  },
  toggleBtnText: { fontSize: 11, color: "#1976D2", fontWeight: "600" },

  // ── Nav buttons ──
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    flexShrink: 0,
    gap: 8,
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
  navBtnDisabled: { borderColor: "#E5E7EB" },
  navBtnText: { fontSize: 13, color: "#374151", fontWeight: "500" },

  // ── Tabs ──
  //   tabRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "visible",
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  tabActive: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  tabTextActive: { color: "#fff" },
  tabSub: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  tabSubActive: { color: "#BFDBFE" },

  // ── Mobile ──
  mobileContainer: { flex: 1, backgroundColor: "#F5F6F8" },
  mobileHeader: { zIndex: 2 },
  mobileTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    paddingLeft: "4%",
  },
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
  mobileHtmlPreviewWrap: { width: "100%", minHeight: 900, overflow: "hidden" },
  mobileHtmlPreview: { flex: 1 },
  webViewPreview: { width: "100%", backgroundColor: "#fff" },
});

const stylesWeb = StyleSheet.create({
  buttonSidePanel: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
    paddingLeft: 16,
    justifyContent: "flex-start",
  },
  buttonContainer: { gap: 12 },
  outlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  outlineTextWeb: { color: "#374151", fontSize: 13, fontWeight: "500" },
  primaryBtnWeb: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  primaryTextWeb: { color: "#fff", fontSize: 13, fontWeight: "600" },
  greenOutlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#10B981",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  greenOutlineTextWeb: { color: "#10B981", fontSize: 13, fontWeight: "500" },
  greenBtnWeb: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  greenTextWeb: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
