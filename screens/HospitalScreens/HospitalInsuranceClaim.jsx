import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
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
  Image,
  Animated,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "../../env-vars";

// ═══════════════════════════════════════════════════════════════════════
// PROCESSING STATUS COMPONENT (shown while API call is in progress)
// ═══════════════════════════════════════════════════════════════════════

const ProcessingView = ({ stage }) => {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const stages = [
    { key: "uploading", label: "Uploading document...", icon: "upload-cloud" },
    { key: "ocr", label: "Reading document with OCR...", icon: "eye" },
    {
      key: "extracting",
      label: "Extracting claim fields...",
      icon: "file-text",
    },
    { key: "routing", label: "Detecting insurance policy...", icon: "compass" },
    {
      key: "auditing",
      label: "Auditing claim line-by-line...",
      icon: "check-circle",
    },
    {
      key: "reporting",
      label: "Generating final report...",
      icon: "bar-chart-2",
    },
  ];

  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <View style={procStyles.container}>
      <View style={procStyles.card}>
        <Animated.View style={[procStyles.pulseCircle, { opacity: pulse }]}>
          <Feather name="cpu" size={28} color="#2563EB" />
        </Animated.View>
        <Text style={procStyles.title}>Kokoro AI is analyzing your claim</Text>
        <Text style={procStyles.subtitle}>This may take 20-30 seconds</Text>

        <View style={procStyles.stageList}>
          {stages.map((s, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isPending = i > currentIndex;

            return (
              <View key={s.key} style={procStyles.stageRow}>
                <View
                  style={[
                    procStyles.stageIcon,
                    isDone && { backgroundColor: "#16A34A" },
                    isCurrent && { backgroundColor: "#2563EB" },
                    isPending && { backgroundColor: "#E2E8F0" },
                  ]}
                >
                  {isDone ? (
                    <Feather name="check" size={12} color="#fff" />
                  ) : isCurrent ? (
                    <Feather name={s.icon} size={12} color="#fff" />
                  ) : (
                    <Feather name={s.icon} size={12} color="#94A3B8" />
                  )}
                </View>
                <Text
                  style={[
                    procStyles.stageText,
                    isDone && { color: "#16A34A" },
                    isCurrent && { color: "#1E293B", fontWeight: "700" },
                    isPending && { color: "#CBD5E1" },
                  ]}
                >
                  {s.label}
                </Text>
                {isCurrent && (
                  <ActivityIndicator
                    size="small"
                    color="#2563EB"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CLAUDE-LIKE THINKING ANIMATION
// ═══════════════════════════════════════════════════════════════════════

const ClaudeThinkingView = ({
  thinkingTrace,
  auditResults,
  finalReport,
  analysisData,
  onComplete,
}) => {
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [thinkingDone, setThinkingDone] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [thinkingCollapsed, setThinkingCollapsed] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const reportFade = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const thinkingPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!thinkingDone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingPulse, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [thinkingDone]);

  useEffect(() => {
    if (!thinkingTrace || thinkingTrace.length === 0) {
      setThinkingDone(true);
      setReportVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setVisibleBlocks((prev) => {
        const next = prev + 1;
        if (next >= thinkingTrace.length) {
          clearInterval(interval);
          setTimeout(() => {
            setThinkingDone(true);
            setThinkingCollapsed(true);
            setTimeout(() => {
              setReportVisible(true);
              Animated.timing(reportFade, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }).start(() => {
                if (onComplete) onComplete();
              });
            }, 300);
          }, 500);
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [thinkingTrace]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(
        () => scrollRef.current?.scrollToEnd?.({ animated: true }),
        80,
      );
    }
  }, [visibleBlocks, reportVisible]);

  const parseBlock = (text) => {
    const clean = text.replace(/<\/?thinking>/g, "").trim();
    const lines = clean.split("\n");
    const field =
      lines
        .find((l) => l.startsWith("FIELD:"))
        ?.replace("FIELD:", "")
        .trim() || "Analysis";
    const validation = lines.find((l) => l.includes("VALIDATION:")) || "";
    const severity = lines.find((l) => l.includes("SEVERITY:")) || "";
    const isPassed = validation.includes("PASS");
    const isRed = severity.includes("RED_FLAG");
    const isModerate = severity.includes("MODERATE");
    return { field, lines: clean, isPassed, isRed, isModerate };
  };

  const getColor = (p) =>
    p.isPassed
      ? "#16A34A"
      : p.isRed
        ? "#DC2626"
        : p.isModerate
          ? "#F59E0B"
          : "#6B7280";
  const getBg = (p) =>
    p.isPassed
      ? "#F0FDF4"
      : p.isRed
        ? "#FEF2F2"
        : p.isModerate
          ? "#FFFBEB"
          : "#F9FAFB";
  const getLabel = (p) =>
    p.isPassed
      ? "PASS"
      : p.isRed
        ? "RED FLAG"
        : p.isModerate
          ? "MODERATE"
          : "CHECK";

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={true}
    >
      {/* Thinking Header */}
      <TouchableOpacity
        onPress={() => thinkingDone && setThinkingCollapsed(!thinkingCollapsed)}
        activeOpacity={thinkingDone ? 0.7 : 1}
        style={tk.header}
      >
        <View style={tk.headerLeft}>
          {!thinkingDone ? (
            <Animated.View style={[tk.dot, { opacity: thinkingPulse }]} />
          ) : (
            <View style={[tk.dot, { backgroundColor: "#16A34A" }]} />
          )}
          <Text style={tk.headerLabel}>
            {thinkingDone
              ? `Thinking completed (${thinkingTrace?.length || 0} steps)`
              : `Thinking... (${visibleBlocks}/${thinkingTrace?.length || 0})`}
          </Text>
        </View>
        {thinkingDone && (
          <Text style={tk.collapseIcon}>
            {thinkingCollapsed ? "▸ Show" : "▾ Hide"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Thinking Blocks */}
      {!thinkingCollapsed && (
        <View style={tk.container}>
          {thinkingTrace?.slice(0, visibleBlocks).map((block, i) => {
            const p = parseBlock(block);
            const color = getColor(p);
            const isExp = expandedBlock === i;

            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => setExpandedBlock(isExp ? null : i)}
                style={[
                  tk.block,
                  {
                    backgroundColor: getBg(p),
                    borderLeftColor: color,
                    borderLeftWidth: 3,
                  },
                ]}
              >
                <View style={tk.blockRow}>
                  <View style={[tk.sevDot, { backgroundColor: color }]} />
                  <Text
                    style={tk.blockField}
                    numberOfLines={isExp ? undefined : 1}
                  >
                    {p.field}
                  </Text>
                  <View
                    style={[
                      tk.badge,
                      { backgroundColor: color + "18", borderColor: color },
                    ]}
                  >
                    <Text style={[tk.badgeText, { color }]}>{getLabel(p)}</Text>
                  </View>
                </View>
                {isExp && <Text style={tk.blockDetail}>{p.lines}</Text>}
              </TouchableOpacity>
            );
          })}

          {!thinkingDone && (
            <View style={tk.typingRow}>
              {[0, 1, 2].map((i) => (
                <TypingDot key={i} delay={i * 200} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── FINAL REPORT ── */}
      {reportVisible && (
        <Animated.View style={[tk.report, { opacity: reportFade }]}>
          {analysisData?.policy_baseline && (
            <View style={tk.policyBadge}>
              <Text style={tk.policyText}>
                {analysisData.policy_baseline.replace(/_/g, " ").toUpperCase()}{" "}
                • {analysisData.policy_type}
              </Text>
            </View>
          )}

          {finalReport?.executive_summary && (
            <View style={tk.summaryCard}>
              <Text style={tk.summaryTitle}>Executive Summary</Text>
              <Text style={tk.summaryBody}>
                {finalReport.executive_summary}
              </Text>
            </View>
          )}

          {finalReport?.financial_summary && (
            <View style={tk.finCard}>
              <Text style={tk.secTitle}>Financial Impact</Text>
              <View style={tk.finRow}>
                <View style={tk.finItem}>
                  <Text style={tk.finLabel}>Bill Amount</Text>
                  <Text style={tk.finVal}>
                    ₹
                    {Number(
                      finalReport.financial_summary.bill_amount || 0,
                    ).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={[tk.finItem, { backgroundColor: "#FEF2F2" }]}>
                  <Text style={tk.finLabel}>Expected As-Is</Text>
                  <Text style={[tk.finVal, { color: "#DC2626" }]}>
                    ₹
                    {Number(
                      finalReport.financial_summary.expected_approval_as_is ||
                        0,
                    ).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={[tk.finItem, { backgroundColor: "#F0FDF4" }]}>
                  <Text style={tk.finLabel}>Recoverable</Text>
                  <Text style={[tk.finVal, { color: "#16A34A" }]}>
                    +₹
                    {Number(
                      finalReport.financial_summary.recoverable_amount || 0,
                    ).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
              {finalReport.financial_summary.breakdown && (
                <Text style={tk.breakdown}>
                  {finalReport.financial_summary.breakdown}
                </Text>
              )}
            </View>
          )}

          {auditResults?.red_flags?.length > 0 && (
            <View style={tk.sec}>
              <Text style={[tk.secTitle, { color: "#DC2626" }]}>
                Red Flags ({auditResults.red_flags.length})
              </Text>
              {auditResults.red_flags.map((f, i) => (
                <View key={i} style={tk.flagCard}>
                  <View style={tk.flagHead}>
                    <View
                      style={[tk.flagDot, { backgroundColor: "#DC2626" }]}
                    />
                    <Text style={tk.flagField}>{f.field}</Text>
                  </View>
                  <Text style={tk.flagIssue}>{f.issue}</Text>
                  <View style={tk.flagFix}>
                    <Text style={tk.flagFixL}>Fix → </Text>
                    <Text style={tk.flagFixT}>{f.correction}</Text>
                  </View>
                  {f.impact && <Text style={tk.flagImpact}>{f.impact}</Text>}
                </View>
              ))}
            </View>
          )}

          {auditResults?.moderate_flags?.length > 0 && (
            <View style={tk.sec}>
              <Text style={[tk.secTitle, { color: "#F59E0B" }]}>
                Moderate Issues ({auditResults.moderate_flags.length})
              </Text>
              {auditResults.moderate_flags.map((f, i) => (
                <View
                  key={i}
                  style={[
                    tk.flagCard,
                    { borderLeftColor: "#FCD34D", backgroundColor: "#FFFBEB" },
                  ]}
                >
                  <View style={tk.flagHead}>
                    <View
                      style={[tk.flagDot, { backgroundColor: "#F59E0B" }]}
                    />
                    <Text style={tk.flagField}>{f.field}</Text>
                  </View>
                  <Text style={tk.flagIssue}>{f.issue}</Text>
                  <View style={tk.flagFix}>
                    <Text style={tk.flagFixL}>Fix → </Text>
                    <Text style={tk.flagFixT}>{f.correction}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {auditResults?.medical_code_audit?.length > 0 && (
            <View style={tk.sec}>
              <Text style={tk.secTitle}>Medical Code Audit</Text>
              {auditResults.medical_code_audit.map((c, i) => (
                <View
                  key={i}
                  style={[
                    tk.codeCard,
                    {
                      borderLeftColor:
                        c.status === "VALID"
                          ? "#16A34A"
                          : c.status === "INVALID"
                            ? "#DC2626"
                            : "#F59E0B",
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={tk.codeVal}>
                      {c.code} ({c.type})
                    </Text>
                    <Text
                      style={[
                        tk.codeBadge,
                        {
                          color: c.status === "VALID" ? "#16A34A" : "#DC2626",
                          backgroundColor:
                            c.status === "VALID" ? "#F0FDF4" : "#FEF2F2",
                        },
                      ]}
                    >
                      {c.status}
                    </Text>
                  </View>
                  <Text style={tk.codeReason}>{c.reason}</Text>
                </View>
              ))}
            </View>
          )}

          {auditResults?.clean_fields?.length > 0 && (
            <View style={tk.sec}>
              <Text style={[tk.secTitle, { color: "#16A34A" }]}>
                Clean Fields ({auditResults.clean_fields.length})
              </Text>
              <View style={tk.chipWrap}>
                {auditResults.clean_fields.map((f, i) => (
                  <View key={i} style={tk.cleanChip}>
                    <Text style={tk.cleanText}>✓ {f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {finalReport?.final_suggestions?.length > 0 && (
            <View style={tk.sec}>
              <Text style={tk.secTitle}>Recommendations</Text>
              {finalReport.final_suggestions.map((s, i) => (
                <View key={i} style={tk.sugRow}>
                  <View style={tk.sugNum}>
                    <Text style={tk.sugNumText}>{i + 1}</Text>
                  </View>
                  <Text style={tk.sugText}>{s}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
};

// Animated typing dot
const TypingDot = ({ delay }) => {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={[tk.typDot, { opacity: anim }]} />;
};

// ═══════════════════════════════════════════════════════════════════════
// STRUCTURED DATA PANEL
// ═══════════════════════════════════════════════════════════════════════

const StructuredPanel = ({ structured, isLoading }) => {
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#64748B", fontSize: 13 }}>
          Extracting data...
        </Text>
      </View>
    );
  }
  if (!structured)
    return (
      <Text style={{ padding: 16, color: "#94A3B8" }}>
        Waiting for analysis...
      </Text>
    );

  const Field = ({ label, value }) => (
    <Text style={pn.field}>
      {label}: {value || "N/A"}
    </Text>
  );

  return (
    <ScrollView style={{ padding: 12 }} showsVerticalScrollIndicator={true}>
      <Text style={pn.filename}>{structured?.source_filename}</Text>
      <Text style={pn.head}>Patient Details</Text>
      <Field label="Name" value={structured?.patient_details?.name} />
      <Field label="Age" value={structured?.patient_details?.age} />
      <Field label="Gender" value={structured?.patient_details?.gender} />
      <Text style={pn.head}>Insurance Details</Text>
      <Field
        label="Company"
        value={structured?.insurance_details?.insurance_company}
      />
      <Field label="TPA" value={structured?.insurance_details?.tpa_name} />
      <Field
        label="Policy No"
        value={structured?.insurance_details?.policy_number}
      />
      <Text style={pn.head}>Diagnosis</Text>
      <Field
        label="Diagnosis"
        value={structured?.diagnosis_and_procedures?.primary_diagnosis}
      />
      {structured?.diagnosis_and_procedures?.icd_codes?.length > 0 && (
        <Field
          label="ICD Codes"
          value={structured.diagnosis_and_procedures.icd_codes.join(", ")}
        />
      )}
      <Text style={pn.head}>Hospital</Text>
      <Field
        label="Hospital"
        value={structured?.hospital_details?.hospital_name}
      />
      <Field
        label="Admission"
        value={structured?.hospital_details?.admission_date}
      />
      <Field
        label="Discharge"
        value={structured?.hospital_details?.discharge_date}
      />
      <Text style={pn.head}>Claim</Text>
      <Field
        label="Type"
        value={
          structured?.claim_details?.claim_type ||
          structured?.document_metadata?.form_type
        }
      />
      <Field
        label="Bill"
        value={
          structured?.claim_details?.bill_amount
            ? `₹${structured.claim_details.bill_amount}`
            : null
        }
      />
      <Field
        label="Claimed"
        value={
          structured?.claim_details?.claimed_amount
            ? `₹${structured.claim_details.claimed_amount}`
            : null
        }
      />
      <Text style={pn.head}>Bank</Text>
      <Field label="Holder" value={structured?.bank_details?.account_holder} />
      <Field label="Account" value={structured?.bank_details?.account_number} />
      <Field label="IFSC" value={structured?.bank_details?.ifsc_code} />
    </ScrollView>
  );
};

const MobileAnalysisView = ({
  structured,
  thinkingTrace,
  auditResults,
  finalReport,
  analysisData,
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'ai'

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Bar */}
      <View style={mav.tabBar}>
        <TouchableOpacity
          style={[mav.tab, activeTab === "details" && mav.tabActive]}
          onPress={() => setActiveTab("details")}
        >
          <Text
            style={[mav.tabText, activeTab === "details" && mav.tabTextActive]}
          >
            Patient Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[mav.tab, activeTab === "ai" && mav.tabActive]}
          onPress={() => setActiveTab("ai")}
        >
          <Text style={[mav.tabText, activeTab === "ai" && mav.tabTextActive]}>
            AI Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={mav.tabContent}>
        {activeTab === "details" ? (
          <StructuredPanel structured={structured} isLoading={false} />
        ) : (
          <ClaudeThinkingView
            thinkingTrace={thinkingTrace}
            auditResults={auditResults}
            finalReport={finalReport}
            analysisData={analysisData}
          />
        )}
      </View>

      {/* Accept Button */}
      <TouchableOpacity
        style={mav.acceptBtn}
        onPress={() =>
          navigation.navigate("HospitalInsuranceDownload", { analysisData })
        }
      >
        <Text style={mav.acceptText}>Generate Updated Files →</Text>
      </TouchableOpacity>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const HospitalInsuranceClaim = ({ navigation }) => {
  const [claimFiles, setClaimFiles] = useState([]);
  const { width, height } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useState(new Animated.Value(0))[0];
  const cardWidth = width * 0.95;
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [claimDocs, setClaimDocs] = useState([]);
  const [policyDocs, setPolicyDocs] = useState([]);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const aiAnalysisSideAnim = useState(new Animated.Value(height))[0];
  const [uploadSections, setUploadSections] = useState({
    insurance: null,
    prescription: null,
    hospital: null,
    claim: null,
  });
  const isAnyUploaded = Object.values(uploadSections).some(Boolean);

  // ✅ Required document check
  const isClaimFormUploaded = !!uploadSections.claim;

  // Step 1 tab complete tabhi maana jayega jab claim form upload ho
  const isUploadComplete = isClaimFormUploaded;

  const structured = useMemo(
    () => analysisData?.structured_data ?? null,
    [analysisData],
  );
  const auditResults = useMemo(
    () => analysisData?.audit_results ?? null,
    [analysisData],
  );
  const finalReport = useMemo(
    () => analysisData?.final_report ?? null,
    [analysisData],
  );
  const thinkingTrace = useMemo(
    () => analysisData?.thinking_trace ?? [],
    [analysisData],
  );

  // ─── THE KEY CHANGE: Navigate first, THEN call API ──────────────────
  // const startAnalysis = async () => {
  //   setCurrentStep(1);
  //   setIsAnalyzing(true);
  //   setAnalysisData(null);
  //   setProcessingStage("uploading");

  //   if (Platform.OS === "web" && width > 1000) {
  //     Animated.timing(slideAnim, {
  //       toValue: -cardWidth,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }).start();
  //   }

  //   const formData = new FormData();

  //   const fieldMap = {
  //     claim: "claim_form",
  //     hospital: "hospital_bill",
  //     prescription: "doctor_prescription",
  //     insurance: "insurance_savings_breakdown",
  //   };

  //   for (const [key, backendField] of Object.entries(fieldMap)) {
  //     const file = uploadSections[key];
  //     if (!file) continue;

  //     if (Platform.OS === "web") {
  //       formData.append(backendField, file);
  //     } else {
  //       formData.append(backendField, {
  //         uri: file.uri,
  //         name: file.name || `${key}.pdf`,
  //         type: file.mimeType || "application/octet-stream",
  //       });
  //     }
  //   }
  const startAnalysis = async () => {
    setCurrentStep(1);
    setIsAnalyzing(true);
    setAnalysisData(null);
    setProcessingStage("uploading");

    if (Platform.OS === "web" && width > 1000) {
      Animated.timing(slideAnim, {
        toValue: -cardWidth,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }

    const formData = new FormData();

    // ✅ FIX: use claimDocs when on native, OR when web width < 1000 (mobile web)
    const useMobileFlow = Platform.OS !== "web" || width < 1000;

    if (useMobileFlow) {
      if (claimDocs.length === 0) {
        setIsAnalyzing(false);
        setCurrentStep(0);
        return;
      }

      const file = claimDocs[0];

      if (Platform.OS !== "web") {
        // Real native device
        formData.append("claim_form", {
          uri: file.uri,
          name: file.name || "claim.pdf",
          type: file.mimeType || "application/octet-stream",
        });
      } else {
        // Web browser (mobile emulation or real mobile browser)
        formData.append("claim_form", file.file, file.name || "claim.pdf");
      }

      if (policyDocs.length > 0) {
        const pfile = policyDocs[0];
        if (Platform.OS !== "web") {
          formData.append("hospital_bill", {
            uri: pfile.uri,
            name: pfile.name || "policy.pdf",
            type: pfile.mimeType || "application/octet-stream",
          });
        } else {
          formData.append(
            "hospital_bill",
            pfile.file,
            pfile.name || "policy.pdf",
          );
        }
      }
    } else {
      // Desktop web flow
      const fieldMap = {
        claim: "claim_form",
        hospital: "hospital_bill",
        prescription: "doctor_prescription",
        insurance: "insurance_savings_breakdown",
      };
      for (const [key, backendField] of Object.entries(fieldMap)) {
        const file = uploadSections[key];
        if (!file) continue;
        formData.append(backendField, file);
      }
    }

    const stageTimer = setTimeout(() => setProcessingStage("ocr"), 2000);
    const stageTimer2 = setTimeout(
      () => setProcessingStage("extracting"),
      5000,
    );
    const stageTimer3 = setTimeout(() => setProcessingStage("routing"), 10000);
    const stageTimer4 = setTimeout(() => setProcessingStage("auditing"), 12000);
    const stageTimer5 = setTimeout(
      () => setProcessingStage("reporting"),
      25000,
    );

    try {
      const res = await fetch(`${API_URL}/medilocker/insurance/analyze`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data?.detail) {
        console.error("Backend error:", data.detail);
        return;
      }

      setAnalysisData(data);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      clearTimeout(stageTimer);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      clearTimeout(stageTimer5);
      setIsAnalyzing(false);
      setProcessingStage("");
    }
  };

  // ─── Web desktop: analyze ──────────────────────────────────────────
  const analyzeInsurance = () => {
    if (claimFiles.length === 0) return;
    startAnalysis(claimFiles[0], true);
  };

  // ─── Mobile: analyze ───────────────────────────────────────────────
  const handleGenerate = () => {
    console.log("claimDocs:", claimDocs);
    console.log("claimDocs[0]:", claimDocs[0]);
    console.log("Platform.OS:", Platform.OS);
    console.log("width:", width);
    if (claimDocs.length === 0 || isAnalyzing) return;
    startAnalysis();
  };

  // ─── Navigation ────────────────────────────────────────────────────
  const goBack = () => {
    setCurrentStep(0);
    setAnalysisData(null);
    setIsAnalyzing(false);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const openAiModal = () => {
    setAiAnalysisModalOpen(true);
    Animated.timing(aiAnalysisSideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeAiModal = () => {
    Animated.timing(aiAnalysisSideAnim, {
      toValue: height,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setAiAnalysisModalOpen(false));
  };

  // ─── File handling ─────────────────────────────────────────────────
  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });
      if (result.canceled) return;
      if (type === "claim") setClaimDocs((prev) => [...prev, ...result.assets]);
      else setPolicyDocs((prev) => [...prev, ...result.assets]);
    } catch (e) {
      console.log(e);
    }
  };

  const removeFile = (type, index) => {
    if (type === "claim")
      setClaimDocs((prev) => prev.filter((_, i) => i !== index));
    else setPolicyDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // const isUploadComplete =
  //   Platform.OS === "web" ? claimFiles.length > 0 : claimDocs.length > 0;
  //const isUploadComplete = isAnyUploaded;

  const handleFileUpload = () => {
    if (Platform.OS !== "web") return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) =>
      setClaimFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    input.click();
  };

  const handleDeleteFile = (index) =>
    setClaimFiles((prev) => prev.filter((_, i) => i !== index));

  // const UploadStepItem = ({
  //   title,
  //   subtitle,
  //   required = false,
  //   file,
  //   onUpload,
  // }) => {
  //   const isUploaded = !!file;

  //   return (
  //     <View
  //       style={[
  //         styles.stepCard,
  //         isUploaded && { borderColor: "#16A34A", backgroundColor: "#F0FDF4" },
  //       ]}
  //     >
  //       <View style={{ flexDirection: "row", alignItems: "center" }}>
  //         <View
  //           style={[
  //             styles.iconBox,
  //             isUploaded && { backgroundColor: "#16A34A" },
  //           ]}
  //         >
  //           {isUploaded ? (
  //             <Text style={{ color: "#fff" }}>✓</Text>
  //           ) : (
  //             <Text style={{ color: "#2563EB" }}>📄</Text>
  //           )}
  //         </View>

  //         <View style={{ flex: 1 }}>
  //           <Text style={styles.stepTitle}>{title}</Text>
  //           <Text style={styles.stepSub}>{subtitle}</Text>
  //         </View>

  //         {required && !isUploaded && (
  //           <View style={styles.requiredBadge}>
  //             <Text style={styles.requiredText}>Required</Text>
  //           </View>
  //         )}

  //         <TouchableOpacity style={styles.uploadBtn} onPress={onUpload}>
  //           <Text style={styles.uploadBtnText}>
  //             {isUploaded ? "Uploaded" : "Upload"}
  //           </Text>
  //         </TouchableOpacity>
  //       </View>

  //       {/* Upload Box */}
  //       {!isUploaded && (
  //         <TouchableOpacity style={styles.uploadBox} onPress={onUpload}>
  //           <Text style={{ color: "#64748B" }}>
  //             Drag to upload (.xlsx or .csv){" "}
  //             <Text style={{ color: "#2563EB" }}>Click here</Text>
  //           </Text>
  //         </TouchableOpacity>
  //       )}

  //       {/* File Name */}
  //       {isUploaded && (
  //         <Text style={{ marginTop: 8, color: "#16A34A", fontSize: 12 }}>
  //           {file?.name || "File uploaded successfully"}
  //         </Text>
  //       )}
  //     </View>
  //   );
  // };
  const UploadStepItem = ({
    title,
    subtitle,
    required = false,
    file,
    onUpload,
    onRemove, // ✅ NEW PROP
  }) => {
    const isUploaded = !!file;

    return (
      <View
        style={[
          styles.stepCard,
          isUploaded && { borderColor: "#16A34A", backgroundColor: "#F0FDF4" },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={[
              styles.iconBox,
              isUploaded && { backgroundColor: "#16A34A" },
            ]}
          >
            {isUploaded ? (
              <Text style={{ color: "#fff" }}>✓</Text>
            ) : (
              <Text style={{ color: "#2563EB" }}>📄</Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            {/* <Text style={styles.stepTitle}>{title}</Text> */}
            <Text style={styles.stepTitle}>
              {title}
              {!required && (
                <Text style={styles.optionalText}>{"  "} (Optional)</Text>
              )}
            </Text>
            <Text style={styles.stepSub}>{subtitle}</Text>
          </View>

          {/* ❌ REMOVE BUTTON */}
          {isUploaded && (
            <TouchableOpacity
              onPress={onRemove}
              style={{
                marginRight: 10,
                padding: 6,
              }}
            >
              <Text style={{ color: "#DC2626", fontWeight: "bold" }}>✕</Text>
            </TouchableOpacity>
          )}

          {required && !isUploaded && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          )}

          <TouchableOpacity style={styles.uploadBtn} onPress={onUpload}>
            <Text style={styles.uploadBtnText}>
              {isUploaded ? "Replace" : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upload Box */}
        {!isUploaded && (
          <TouchableOpacity style={styles.uploadBox} onPress={onUpload}>
            <Text style={{ color: "#64748B" }}>
              Drag to upload (.xlsx or .csv){" "}
              <Text style={{ color: "#2563EB" }}>Click here</Text>
            </Text>
          </TouchableOpacity>
        )}

        {/* File Name */}
        {isUploaded && (
          <Text style={{ marginTop: 8, color: "#16A34A", fontSize: 12 }}>
            {file?.name || "File uploaded successfully"}
          </Text>
        )}
      </View>
    );
  };

  const handleSectionUpload = (key) => {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = (e) => {
      const file = e.target.files[0];

      setUploadSections((prev) => ({
        ...prev,
        [key]: file,
      }));
    };

    input.click();
  };

  const handleSectionRemove = (key) => {
    setUploadSections((prev) => ({
      ...prev,
      [key]: null,
    }));
  };

  return (
    <>
      {/* ═══════ WEB DESKTOP ═══════ */}
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
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>
                      Insurance claim analysis AI
                    </Text>
                    <TouchableOpacity
                      style={styles.backBtn}
                      onPress={() => (currentStep === 1 ? goBack() : null)}
                    >
                      <Text style={styles.backBtnText}>
                        {currentStep === 1 ? "← Back" : "Select Patient"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step Bar */}
                  <View style={styles.stepBar}>
                    {[
                      "Upload Documents",
                      "Review Suggestions",
                      "Download Updated File",
                    ].map((t, i, a) => (
                      <React.Fragment key={i}>
                        <View style={styles.stepItem}>
                          <View
                            style={[
                              styles.stepCircle,
                              i === currentStep && styles.stepActive,
                              ((i === 0 && isUploadComplete) ||
                                (i === 1 && currentStep >= 1)) &&
                                styles.stepDone,
                            ]}
                          >
                            <Text style={styles.stepNum}>
                              {(i === 0 && isUploadComplete) ||
                              (i === 1 && currentStep >= 1)
                                ? "✓"
                                : i + 1}
                            </Text>
                          </View>
                          <Text style={styles.stepLabel}>{t}</Text>
                        </View>
                        {i < a.length - 1 && <View style={styles.stepLine} />}
                      </React.Fragment>
                    ))}
                  </View>

                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                  >
                    <View style={{ overflow: "hidden", width: "100%" }}>
                      {/* <Animated.View
                        style={{
                          flexDirection: "row",
                          width: cardWidth * 2,
                          transform: [{ translateX: slideAnim }],
                        }}
                      > */}
                      <Animated.View
                        style={{
                          flexDirection: "row",
                          width: cardWidth * 2,
                          transform: [{ translateX: slideAnim }],
                          justifyContent: "center", // ✅ FIX
                        }}
                      >
                        {/* ── STEP 1: UPLOAD ── */}
                        {/* <View
                          style={{
                            width: cardWidth,
                            alignItems: "center",
                            minHeight: 100,
                          }}
                        >
                          <View style={styles.midBox}>
                            <Image
                              source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                              style={styles.midIcon}
                            />
                            <Text style={styles.midTitle}>
                              Upload your insurance claim and save money
                            </Text>
                            <Text style={styles.midSub}>
                              kokoro.doctor AI will auto-extract all codes from
                              this document
                            </Text>
                          </View>
                          <View style={styles.bullets}>
                            <Text style={styles.bullet}>
                              • Claim document is mandatory
                            </Text>
                            <Text style={styles.bullet}>
                              • Analysis cannot begin without the claim document
                            </Text>
                            <Text style={styles.bullet}>
                              • Kokoro AI analyzes your claim directly
                            </Text>
                          </View>
                          <View style={styles.uploadArea}>
                            <View style={styles.uploadInner}>
                              <Text style={styles.uploadLabel}>
                                Insurance Claim Document
                              </Text>
                              <TouchableOpacity
                                style={styles.uploadBox}
                                onPress={handleFileUpload}
                              >
                                <Text style={{ fontSize: 22, marginBottom: 6 }}>
                                  ☁️
                                </Text>
                                <Text
                                  style={{ color: "#3b82f6", fontSize: 13 }}
                                >
                                  Upload Document — Click here
                                </Text>
                              </TouchableOpacity>
                              {claimFiles.length > 0 && (
                                <View style={styles.fileList}>
                                  {claimFiles.map((f, i) => (
                                    <View key={i} style={styles.fileRow}>
                                      <Text style={styles.fileName}>
                                        {f.name}
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => handleDeleteFile(i)}
                                      >
                                        <Text
                                          style={{
                                            color: "red",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          ✕
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.analyzeBtn,
                              !isUploadComplete && styles.analyzeBtnDisabled,
                            ]}
                            disabled={!isUploadComplete || isAnalyzing}
                            onPress={analyzeInsurance}
                          >
                            <Text style={styles.analyzeBtnText}>
                              Analyze with kokoro AI →
                            </Text>
                          </TouchableOpacity>
                        </View> */}

                        {/* <View
                          style={{
                            width: cardWidth, // ✅ MUST BE cardWidth
                            alignItems: "center",
                            padding: 25,
                            marginLeft: "0%",
                          }}
                        >
                          <View style={{ width: "100%", maxWidth: 700 }}> */}
                        <View
                          style={{
                            width: cardWidth,
                            // justifyContent: "center", // ✅ vertical center (optional)
                            // alignItems: "center", // ✅ horizontal center
                            // alignSelf: "center",
                            padding: 25,
                            borderWidth: 1,
                          }}
                        >
                          <View style={styles.midBox}>
                            <Image
                              source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                              style={styles.midIcon}
                            />
                            <Text style={styles.midTitle}>
                              Upload your insurance claim and save money
                            </Text>
                            <Text style={styles.midSub}>
                              Users who upload all documents see up to 40%
                              higher claim cover. Add yours now or continue to
                              skip.
                            </Text>
                          </View>
                          <View
                            style={{
                              width: "100%",
                              maxWidth: 700,
                              alignSelf: "center",
                              marginTop: "2%",
                              marginRight: "20%",
                            }}
                          >
                            <UploadStepItem
                              title="Claim Form"
                              subtitle="Completed & signed insurance claim form"
                              required
                              file={uploadSections.claim}
                              onUpload={() => handleSectionUpload("claim")}
                              onRemove={() => handleSectionRemove("claim")}
                            />
                            <UploadStepItem
                              title="Hospital Bill"
                              subtitle="Itemised bill / discharge summary from hospital"
                              file={uploadSections.hospital}
                              onUpload={() => handleSectionUpload("hospital")}
                              onRemove={() => handleSectionRemove("hospital")}
                            />
                            <UploadStepItem
                              title="Doctor prescription"
                              subtitle="Signed prescription from treating cardiologist"
                              file={uploadSections.prescription}
                              onUpload={() =>
                                handleSectionUpload("prescription")
                              }
                              onRemove={() =>
                                handleSectionRemove("prescription")
                              }
                            />
                            <UploadStepItem
                              title="Insurance Policy"
                              subtitle="Co-Pay Excess Pre-auth Billing"
                              file={uploadSections.insurance}
                              onUpload={() => handleSectionUpload("insurance")}
                              onRemove={() => handleSectionRemove("insurance")}
                            />
                          </View>
                          {/* ✅ BUTTON (YOU FORGOT THIS) */}
                          <TouchableOpacity
                            style={[
                              styles.analyzeBtn,
                              (!isClaimFormUploaded || isAnalyzing) && {
                                opacity: 0.5,
                                backgroundColor: "#4476b4ff",
                              },
                            ]}
                            disabled={!isClaimFormUploaded || isAnalyzing}
                            onPress={() => {
                              if (!uploadSections.claim) return;
                              startAnalysis();
                            }}
                          >
                            <Text style={styles.analyzeBtnText}>
                              Submit claim document →
                            </Text>
                          </TouchableOpacity>
                          {!isClaimFormUploaded && (
                            <Text
                              style={{
                                marginTop: 2,
                                color: "#DC2626",
                                fontSize: 14,
                                fontWeight: "500",
                                marginLeft: "30%",
                              }}
                            >
                              Claim Form is required before proceeding ⚠️
                            </Text>
                          )}
                        </View>

                        {/* ── STEP 2: REVIEW (analysis happens here) ── */}
                        <View
                          style={{ width: cardWidth, padding: 10, flex: 1 }}
                        >
                          <View style={styles.reviewHeader}>
                            <Text style={styles.reviewTitle}>
                              Kokoro AI Analysis
                            </Text>
                            <Text style={styles.reviewSub}>
                              review all sections, then accept suggestions you
                              approve
                            </Text>
                          </View>
                          <View style={styles.reviewBody}>
                            {/* LEFT: Structured Data */}
                            <View style={styles.leftPanel}>
                              <StructuredPanel
                                structured={structured}
                                isLoading={isAnalyzing && !structured}
                              />
                            </View>

                            {/* RIGHT: Thinking + Report */}
                            <View style={styles.rightPanel}>
                              {isAnalyzing && !analysisData ? (
                                <ProcessingView stage={processingStage} />
                              ) : analysisData ? (
                                <ClaudeThinkingView
                                  thinkingTrace={thinkingTrace}
                                  auditResults={auditResults}
                                  finalReport={finalReport}
                                  analysisData={analysisData}
                                />
                              ) : (
                                <Text style={{ padding: 16, color: "#94A3B8" }}>
                                  Upload a claim to begin
                                </Text>
                              )}
                            </View>
                          </View>
                          {analysisData && (
                            <TouchableOpacity
                              style={styles.genBtn}
                              onPress={() =>
                                navigation.navigate(
                                  "HospitalInsuranceDownload",
                                  { analysisData },
                                )
                              }
                            >
                              <Text style={styles.genBtnText}>
                                Generate updated files
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </Animated.View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* ═══════ MOBILE ═══════ */}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ScrollView
            contentContainerStyle={m.container}
            showsVerticalScrollIndicator={false}
          >
            <StatusBar barStyle="light-content" backgroundColor="#fff" />
            <View style={m.header}>
              <HeaderLoginSignUp navigation={navigation} />
            </View>
            <Text style={m.title}>Insurance claim analysis AI</Text>
            <TouchableOpacity style={m.selectBtn}>
              <Text style={m.selectText}>Select Patient</Text>
            </TouchableOpacity>

            {/* Stepper */}
            <View style={m.stepContainer}>
              <View style={m.line} />
              {[1, 2, 3].map((item, index) => (
                <View key={index} style={m.stepWrap}>
                  <View
                    style={[
                      m.circle,
                      index === currentStep && m.activeCircle,
                      index < currentStep && m.doneCircle,
                    ]}
                  >
                    <Text
                      style={[
                        m.circleText,
                        (index === currentStep || index < currentStep) && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {index < currentStep ? "✓" : item}
                    </Text>
                  </View>
                  <Text style={m.stepText}>
                    {item === 1
                      ? "Upload\nDocuments"
                      : item === 2
                        ? "AI Analysis\n& Review"
                        : "Download\nUpdated File"}
                  </Text>
                </View>
              ))}
            </View>

            {currentStep === 0 ? (
              <View style={m.card}>
                <Image
                  source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                  style={{ width: "100%", marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text style={m.cardTitle}>
                  Upload your insurance {"\n"}claim and save money
                </Text>
                <Text style={m.subText}>
                  kokoro.doctor AI will auto-extract all codes{"\n"}from these
                  document
                </Text>
                <View style={m.bulletWrap}>
                  <Text style={m.bullet}>• Both documents are mandatory</Text>
                  <Text style={m.bullet}>
                    • Analysis cannot begin without the claim document
                  </Text>
                  <Text style={m.bullet}>
                    • Kokoro AI analyzes your claim directly
                  </Text>
                </View>
                <Text style={m.label}>Insurance Claim Document</Text>
                <TouchableOpacity
                  style={m.uploadBox}
                  onPress={() => pickDocument("claim")}
                >
                  <Feather name="upload" size={20} color="#2563EB" />
                  <Text style={m.uploadText}>
                    Upload Photo <Text style={m.link}>Click here</Text>
                  </Text>
                </TouchableOpacity>
                {claimDocs.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={m.fileScroll}
                    style={{ marginTop: -10, marginBottom: 10 }}
                  >
                    {claimDocs.map((doc, index) => (
                      <View key={index} style={m.fileChip}>
                        <Feather
                          name="check-circle"
                          size={14}
                          color="#16A34A"
                        />
                        <Text style={m.fileText} numberOfLines={1}>
                          {doc.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeFile("claim", index)}
                        >
                          <Feather name="x" size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
                <TouchableOpacity
                  style={[
                    m.button,
                    (isAnalyzing || claimDocs.length === 0) && { opacity: 0.5 },
                  ]}
                  onPress={handleGenerate}
                  disabled={isAnalyzing || claimDocs.length === 0}
                >
                  <Text style={m.buttonText}>Generate with AI</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // <View style={m.resultCard}>
              //   <Text style={m.resultTitle}>Kokoro AI Analysis</Text>
              //   <Text style={m.resultSub}>
              //     {isAnalyzing
              //       ? "Analyzing your claim..."
              //       : "review all sections, then accept suggestions you approve"}
              //   </Text>

              //   {isAnalyzing && !analysisData ? (
              //     <ProcessingView stage={processingStage} />
              //   ) : analysisData ? (
              //     <>
              //       <Text style={m.blueLabel}>
              //         {structured?.source_filename || "Insurance_Claim.pdf"}
              //       </Text>
              //       <View style={m.resultBox}>
              //         <ScrollView>
              //           <Text style={m.secTitle}>Patient</Text>
              //           <Text style={m.text}>
              //             Name: {structured?.patient_details?.name || "N/A"}
              //           </Text>
              //           <Text style={m.text}>
              //             Age: {structured?.patient_details?.age || "N/A"}
              //           </Text>
              //           <Text style={m.secTitle}>Insurance</Text>
              //           <Text style={m.text}>
              //             TPA:{" "}
              //             {structured?.insurance_details?.tpa_name || "N/A"}
              //           </Text>
              //           <Text style={m.secTitle}>Claim</Text>
              //           <Text style={m.text}>
              //             Bill: ₹{structured?.claim_details?.bill_amount || "0"}
              //           </Text>
              //           <Text style={m.text}>
              //             Claimed: ₹
              //             {structured?.claim_details?.claimed_amount || "0"}
              //           </Text>
              //         </ScrollView>
              //       </View>
              //       <TouchableOpacity
              //         style={m.acceptBtn}
              //         onPress={() =>
              //           navigation.navigate("HospitalInsuranceDownload", {
              //             analysisData,
              //           })
              //         }
              //       >
              //         <Text style={m.acceptText}>Accept All</Text>
              //       </TouchableOpacity>
              //     </>
              //   ) : (
              //     <Text style={{ padding: 16, color: "#94A3B8" }}>
              //       Waiting for analysis...
              //     </Text>
              //   )}
              // </View>
              <View style={m.resultCard}>
                <Text style={m.resultTitle}>Kokoro AI Analysis</Text>
                <Text style={m.resultSub}>
                  {isAnalyzing
                    ? "Analyzing your claim..."
                    : "Review all sections below"}
                </Text>

                {isAnalyzing && !analysisData ? (
                  <ProcessingView stage={processingStage} />
                ) : analysisData ? (
                  <MobileAnalysisView
                    structured={structured}
                    thinkingTrace={thinkingTrace}
                    auditResults={auditResults}
                    finalReport={finalReport}
                    analysisData={analysisData}
                    navigation={navigation}
                  />
                ) : (
                  <Text style={{ padding: 16, color: "#94A3B8" }}>
                    Waiting for analysis...
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {currentStep === 1 && analysisData && (
            <TouchableOpacity style={m.floatingBtn} onPress={openAiModal}>
              <Image
                source={require("../../assets/HospitalPortal/Icon/blue_heart.png")}
                style={{ width: 65, height: 65, resizeMode: "cover" }}
              />
            </TouchableOpacity>
          )}
        </SafeAreaView>
      )}

      {/* ═══════ AI MODAL — Mobile ═══════ */}
      {aiAnalysisModalOpen && (
        <Animated.View
          style={[
            m.aiModal,
            { transform: [{ translateY: aiAnalysisSideAnim }] },
          ]}
        >
          <View style={m.aiModalHeader}>
            <View>
              <Text style={m.aiModalTitle}>Kokoro AI Analysis</Text>
              <Text style={{ color: "#999", fontSize: 13 }}>
                Chain of thought reasoning
              </Text>
            </View>
            <TouchableOpacity onPress={closeAiModal}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, padding: 12 }}>
            {analysisData ? (
              <ClaudeThinkingView
                thinkingTrace={thinkingTrace}
                auditResults={auditResults}
                finalReport={finalReport}
                analysisData={analysisData}
              />
            ) : (
              <Text style={{ padding: 10, color: "gray" }}>
                No AI response received
              </Text>
            )}
          </View>
        </Animated.View>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const procStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: { alignItems: "center", padding: 30 },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 20 },
  stageList: { width: "100%", gap: 10 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stageText: { fontSize: 13 },
});

const tk = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#F59E0B" },
  headerLabel: { fontSize: 13, fontWeight: "700", color: "#475569" },
  collapseIcon: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  container: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  block: { borderRadius: 6, padding: 8, marginBottom: 4 },
  blockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevDot: { width: 7, height: 7, borderRadius: 4 },
  blockField: { flex: 1, fontSize: 12, fontWeight: "600", color: "#334155" },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: { fontSize: 9, fontWeight: "700" },
  blockDetail: {
    marginTop: 6,
    fontSize: 11,
    color: "#64748B",
    lineHeight: 16,
    fontFamily: Platform.OS === "web" ? "monospace" : "Courier",
  },
  typingRow: {
    flexDirection: "row",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#94A3B8" },
  report: { paddingHorizontal: 14, paddingTop: 8 },
  policyBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  policyText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  summaryBody: { fontSize: 13, color: "#475569", lineHeight: 20 },
  secTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  sec: { marginBottom: 16 },
  finCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  finRow: { flexDirection: "row", gap: 8 },
  finItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  finLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  finVal: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  breakdown: { fontSize: 12, color: "#64748B", marginTop: 10, lineHeight: 18 },
  flagCard: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 3,
    borderLeftColor: "#FCA5A5",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  flagHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  flagDot: { width: 8, height: 8, borderRadius: 4 },
  flagField: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  flagIssue: { fontSize: 12, color: "#475569", marginBottom: 4 },
  flagFix: { flexDirection: "row" },
  flagFixL: { fontSize: 12, fontWeight: "600", color: "#16A34A" },
  flagFixT: { fontSize: 12, color: "#166534", flex: 1 },
  flagImpact: {
    fontSize: 11,
    color: "#DC2626",
    marginTop: 4,
    fontStyle: "italic",
  },
  codeCard: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 3,
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  codeVal: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  codeBadge: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  codeReason: { fontSize: 11, color: "#64748B", marginTop: 3 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cleanChip: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cleanText: { fontSize: 11, color: "#166534" },
  sugRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  sugNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  sugNumText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  sugText: { flex: 1, fontSize: 13, color: "#334155", lineHeight: 18 },
});

const pn = StyleSheet.create({
  filename: {
    fontWeight: "700",
    marginBottom: 10,
    backgroundColor: "#E7F3FFBF",
    color: "#025AE0",
    padding: 10,
    fontSize: 14,
    borderRadius: 4,
  },
  head: {
    fontWeight: "700",
    fontSize: 13,
    color: "#1E293B",
    marginBottom: 4,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 3,
  },
  field: { fontSize: 12, color: "#475569", marginBottom: 3, lineHeight: 18 },
});

const styles = StyleSheet.create({
  container: { flex: 1, height: "100vh", overflow: "hidden" },
  background: { flex: 1, height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  main: { flexDirection: "row", height: "100%", zIndex: 2 },
  left: { width: "15%" },
  right: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },
  header: { marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    overflow: "hidden",
    marginTop:"4%"
  },
  titleRow: {
    height: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 19, fontWeight: "600" },
  backBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backBtnText: { fontSize: 15, fontWeight: "500", color: "#555" },
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    justifyContent: "space-around",
  },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1D6CE0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: { borderWidth: 2, borderColor: "#000" },
  stepDone: { backgroundColor: "#16a34a" },
  stepNum: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepLabel: { color: "#1D6CE0", fontSize: 12, fontWeight: "700" },
  stepLine: {
    height: 2,
    width: 24,
    backgroundColor: "#1D6CE0",
    marginHorizontal: 4,
  },
  midBox: {
    marginTop: "0%",
    marginBottom: 10,
    width: "50%",
    //marginRight: "7%",
    //borderWidth:1,
    marginLeft: "15%",
  },
  midIcon: { height: 26, width: 26, marginBottom: 8, alignSelf: "center" },
  midTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  midSub: { fontSize: 16, color: "#656464", textAlign: "center" },
  bullets: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: "2%",
    width: "50%",
    marginRight: "13%",
  },
  bullet: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 6,
    lineHeight: 18,
    fontWeight: "500",
  },
  uploadArea: {
    alignItems: "center",
    width: "50%",
    marginRight: "13%",
    marginTop: "2%",
  },
  uploadInner: { width: "60%" },
  uploadLabel: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#1440d3",
    fontSize: 16,
  },
  // uploadBox: {
  //   height: 120,
  //   borderWidth: 1.5,
  //   borderStyle: "dashed",
  //   borderColor: "#3b82f6",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   borderRadius: 10,
  //   backgroundColor: "#f0f6ff",
  // },
  fileList: {
    marginTop: 8,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 6,
  },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fileName: { fontSize: 12, flex: 1 },
  analyzeBtn: {
    marginTop: "1%",
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    paddingHorizontal: 13,
    borderRadius: 8,
    width: "18%",
    marginLeft: "30%",
  },
  // analyzeBtn: {
  //   marginTop: "1%",
  //   backgroundColor: "#2563eb",
  //   paddingVertical: 13,
  //   paddingHorizontal: 20,
  //   borderRadius: 8,
  //   alignSelf: "center", // ✅ center button
  // },
  analyzeBtnDisabled: { backgroundColor: "#93c5fd" },
  analyzeBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    alignSelf: "center",
  },
  reviewHeader: {
    borderWidth: 1,
    borderColor: "#b9b9b9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "79%",
  },
  reviewTitle: { color: "#025AE0", fontSize: 19, fontWeight: "600" },
  reviewSub: { color: "#7c7c7c", fontSize: 14 },
  reviewBody: {
    width: "79%",
    flexDirection: "row",
    height: "calc(70vh - 130px)",
    marginTop: "1%",
  },
  leftPanel: { borderWidth: 1, width: "40%", borderColor: "#cbcaca" },
  rightPanel: { borderWidth: 1, width: "60%", borderColor: "#cbcaca" },
  genBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: "1%",
    alignItems: "center",
    backgroundColor: "#E2EEFF",
    borderRadius: 8,
    borderColor: "#025AE0",
    alignSelf: "flex-start",
  },
  genBtnText: { color: "#025AE0", fontWeight: "500" },

  stepCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0e14ff",
  },
  optionalText: {
    color: "#4d555fff", // gray
    fontSize: 12,
    fontWeight: "500",
  },
  stepSub: {
    fontSize: 12,
    color: "#64748B",
  },

  uploadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
  },

  uploadBtnText: {
    color: "#2563EB",
    fontSize: 12,
  },

  uploadBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  requiredBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
  },

  requiredText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
});

const m = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  header: { zIndex: 2 },
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
  },
  stepWrap: { alignItems: "center", flex: 1 },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  circleText: { fontSize: 12, color: "#3B82F6", fontWeight: "600" },
  stepText: { fontSize: 10, textAlign: "center", color: "#3B82F6" },
  line: {
    position: "absolute",
    top: 13,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "#D1D5DB",
    zIndex: 0,
  },
  activeCircle: {
    backgroundColor: "#2563EB",
  },
  doneCircle: {
    backgroundColor: "#16A34A",
  },
  card: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 12,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 10,
  },
  bulletWrap: {
    marginBottom: 16,
  },
  bullet: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#2563EB",
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 6,
  },
  uploadText: { fontSize: 13, color: "#6B7280" },
  link: { color: "#2563EB", fontWeight: "600" },
  button: {
    backgroundColor: "#6B9CFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 200,
    gap: 6,
  },
  fileText: { fontSize: 11, color: "#374151" },
  fileScroll: { flexDirection: "row", alignItems: "center" },
  // resultCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flex: 1, 
    minHeight: 600, 
  },
  resultTitle: { fontSize: 16, fontWeight: "700", color: "#2563EB" },
  resultSub: { fontSize: 12, color: "#6B7280", marginBottom: 10 },
  resultBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    maxHeight: 250,
  },
  blueLabel: {
    backgroundColor: "#E0EDFF",
    color: "#2563EB",
    padding: 6,
    marginBottom: 10,
    fontSize: 12,
    borderRadius: 4,
  },
  text: { fontSize: 12, marginBottom: 4 },
  secTitle: { fontSize: 13, fontWeight: "600", marginTop: 8 },
  acceptBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: "center",
  },
  acceptText: { color: "#fff", fontWeight: "600" },
  floatingBtn: {
    position: "absolute",
    right: 20,
    bottom: 100,
    height: 65,
    width: 65,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  aiModal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 80,
    backgroundColor: "#fff",
    zIndex: 1000,
    elevation: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  aiModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#E7F3FFBF",
  },
  aiModalTitle: { fontSize: 18, fontWeight: "700", color: "#2563EB" },
});
const mav = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  tabActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabContent: {
    height: 480,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  acceptBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default HospitalInsuranceClaim;
