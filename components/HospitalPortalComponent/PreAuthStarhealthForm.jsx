import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
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
  Image,
  Animated,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  downloadInsuranceClaim,
  generateInsuranceFormHTML,
} from "../../utils/StarHealthFormA";
import { mapToStarHealthFormA } from "../../utils/StarHealthMapper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

function digitsOnly(s) {
  return String(s ?? "").replace(/\D/g, "");
}

function padAmountToLength(raw, len) {
  const d = digitsOnly(raw);
  if (!d) return "".padEnd(len, " ");
  const trimmed = d.length > len ? d.slice(-len) : d;
  return trimmed.padStart(len, " ").slice(-len);
}

function parseDateToDDMMYYYY(raw) {
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}${iso[2]}${iso[1]}`;
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmy) {
    const dd = dmy[1].padStart(2, "0");
    const mm = dmy[2].padStart(2, "0");
    return `${dd}${mm}${dmy[3]}`;
  }
  const only = digitsOnly(s);
  if (only.length >= 8) return only.slice(0, 8);
  return "";
}

function parseAgeYears(raw) {
  if (raw == null) return "";
  const m = String(raw).match(/\d+/);
  return m ? m[0].padStart(2, "0").slice(-2) : "";
}

function strUpper(s, maxLen) {
  const t = String(s ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
  return t.slice(0, maxLen);
}

function padChars(s, len) {
  const t = String(s ?? "");
  return t.padEnd(len, " ").slice(0, len);
}

function truncateChars(s, len) {
  return String(s ?? "").slice(0, len);
}

function tpaOrCompanyId(structured) {
  const ins = structured.insurance_details || {};
  const a = (ins.tpa_name || "").trim();
  const b = (ins.insurance_company || "").trim();
  if (a && b) return `${a} ${b}`.trim();
  return a || b || "";
}

const BILL_ROW_DEFAULT_TOWARDS = [
  "Hospital main Bill",
  "Pre-hospitalization Bills: Nos",
  "Post-hospitalization Bills: Nos",
  "Pharmacy Bills",
  "",
  "",
  "",
  "",
  "",
  "",
];

function buildInitialBillRows() {
  return BILL_ROW_DEFAULT_TOWARDS.map((towards) => ({
    billNo: "",
    date: "".padEnd(6, " "),
    issuedBy: "",
    towards,
    amount: "".padEnd(8, " "),
  }));
}

function buildInitialForm(sd) {
  if (!sd || typeof sd !== "object") sd = {};
  const patient = sd.patient_details || {};
  const ins = sd.insurance_details || {};
  const hosp = sd.hospital_details || {};
  const diag = sd.diagnosis_and_procedures || {};
  const claim = sd.claim_details || {};
  const bank = sd.bank_details || {};
  const meta = sd.document_metadata || {};

  const name = padChars(strUpper(patient.name, 40), 40);
  const policy = padChars(
    truncateChars(
      String(ins.policy_number ?? "")
        .replace(/\s/g, "")
        .toUpperCase(),
      18,
    ),
    18,
  );
  const tpa = padChars(strUpper(tpaOrCompanyId(sd), 22), 22);
  const hospital = padChars(strUpper(hosp.hospital_name, 40), 40);
  const admission = padChars(parseDateToDDMMYYYY(hosp.admission_date), 8);
  const discharge = padChars(parseDateToDDMMYYYY(hosp.discharge_date), 8);
  const diagnosis = String(diag.primary_diagnosis ?? "");

  const pre = padAmountToLength(claim.pre_hospitalization_amount, 8);
  const hospAmt = padAmountToLength(claim.bill_amount, 8);
  const post = padAmountToLength(claim.post_hospitalization_amount, 8);

  const genderRaw = String(patient.gender ?? "").toLowerCase();
  let gender = "";
  if (genderRaw.includes("female") || genderRaw === "f") gender = "female";
  else if (genderRaw.includes("male") || genderRaw === "m") gender = "male";

  const ageYears = padChars(parseAgeYears(patient.age), 2);
  const ageMonths = "  ";

  const accNum = padChars(
    truncateChars(String(bank.account_number ?? "").replace(/\s/g, ""), 22),
    22,
  );
  const bankName = padChars(
    strUpper(String(bank.bank_name ?? "").trim(), 40),
    40,
  );
  const ifsc = padChars(
    truncateChars(String(bank.ifsc_code ?? "").toUpperCase(), 11),
    11,
  );
  const chequeLine = String(bank.account_holder ?? "").trim();

  const docDate = padChars(parseDateToDDMMYYYY(meta.document_date), 8);

  const polCompact = String(ins.policy_number ?? "")
    .replace(/\s/g, "")
    .toUpperCase();

  return {
    policyNumber: policy,
    certificateNumber: "".padEnd(14, " "),
    tpaId: tpa,
    primaryName: name,
    primaryAddressRow1: "".padEnd(40, " "),
    primaryAddressRow2: "".padEnd(35, " "),
    primaryCity: "".padEnd(18, " "),
    primaryState: "".padEnd(18, " "),
    primaryPin: "".padEnd(6, " "),
    primaryPhone: "".padEnd(10, " "),
    primaryEmail: "",
    insuranceFirstCommencementDate: "".padEnd(8, " "),
    insuranceCompanyName: "".padEnd(20, " "),
    insurancePolicyNo: "".padEnd(18, " "),
    insuranceSumInsured: "".padEnd(12, " "),
    hospitalizationHistoryDate: "".padEnd(4, " "),
    previousMediclaimCompanyName: "".padEnd(22, " "),
    relationshipSpecify: "",
    occupationSpecify: "",
    diagnosis,
    hospitalizedName: name,
    gender,
    ageYears,
    ageMonths,
    hospitalName: hospital,
    admissionDate: admission,
    dischargeDate: discharge,
    claimPre: pre,
    claimHospital: hospAmt,
    claimPost: post,
    claimHealthCheckup: "".padEnd(8, " "),
    claimAmbulance: "".padEnd(8, " "),
    claimOtherCode: "".padEnd(3, " "),
    claimOtherAmount: "".padEnd(8, " "),
    claimTotal: "".padEnd(10, " "),
    claimPreHospitalDays: "".padEnd(3, " "),
    claimPostHospitalDays: "".padEnd(3, " "),
    claimHospitalDailyCash: "".padEnd(8, " "),
    claimSurgicalCash: "".padEnd(8, " "),
    claimCriticalIllness: "".padEnd(8, " "),
    claimConvalescence: "".padEnd(8, " "),
    claimPrePostBenefit: "".padEnd(8, " "),
    claimOtherBenefit: "".padEnd(8, " "),
    billRows: buildInitialBillRows(),
    accountNumber: accNum,
    bankNameBranch: bankName,
    ifscCode: ifsc,
    chequeDetails: chequeLine,
    declarationDate: docDate,
    mobileIdRow: padChars(truncateChars(polCompact, 12), 12),
    mobilePolicy: padChars(truncateChars(polCompact, 16), 16),
    mobileNameTrunc: padChars(strUpper(patient.name, 20), 20),
    mobilePhone: "".padEnd(10, " "),
    mobileEmail: "".padEnd(20, " "),
    mobileHospital: strUpper(hosp.hospital_name, 200),
    mobileAdmission:
      hosp.admission_date != null && hosp.admission_date !== ""
        ? String(hosp.admission_date)
        : "",
    mobileDischarge:
      hosp.discharge_date != null && hosp.discharge_date !== ""
        ? String(hosp.discharge_date)
        : "",
    mobileAmount:
      claim.bill_amount != null && claim.bill_amount !== ""
        ? String(claim.bill_amount)
        : "",
    injuryDate: "".padEnd(8, " "),
    dob: "".padEnd(8, " "),
    admissionTime: "".padEnd(4, " "),
    dischargeTime: "".padEnd(4, " "),
    treatingDoctor: String(hosp.treating_doctor ?? ""),
    hospAddressRow1: "".padEnd(40, " "),
    hospAddressRow2: "".padEnd(35, " "),
    hospCity: "".padEnd(18, " "),
    hospState: "".padEnd(18, " "),
    hospPin: "".padEnd(6, " "),
    hospPhone: "".padEnd(10, " "),
    hospEmail: "",
    pan: "".padEnd(10, " "),
    declarationPlace: "",
  };
}

const CHECKED_BOX_STYLE = {
  backgroundColor: "#1976D2",
  borderColor: "#1976D2",
};

function isYesValue(value) {
  return (
    String(value ?? "")
      .trim()
      .toLowerCase() === "yes"
  );
}

function isNoValue(value) {
  return (
    String(value ?? "")
      .trim()
      .toLowerCase() === "no"
  );
}

function relationshipMatches(value, key) {
  const rel = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!rel) return false;
  if (key === "other") {
    return !["self", "spouse", "child", "father", "mother"].some(
      (item) => rel === item || rel.includes(item),
    );
  }
  return rel === key || rel.includes(key);
}

function occupationMatches(value, key) {
  const occupation = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!occupation) return false;
  if (key === "other") {
    return !["service", "self", "home", "student", "retired"].some((item) =>
      occupation.includes(item),
    );
  }
  if (key === "self employed") {
    return occupation.includes("self") && occupation.includes("employ");
  }
  if (key === "home maker") return occupation.includes("home");
  return occupation.includes(key.split(" ")[0]);
}

function roomCategoryMatches(value, key) {
  const room = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!room) return false;
  if (key === "day care") return room.includes("day");
  if (key === "single occupancy") return room.includes("single");
  if (key === "twin sharing")
    return room.includes("twin") || room.includes("double");
  if (key === "3 or more beds per room") {
    return (
      room.includes("3") ||
      room.includes("more") ||
      room.includes("general") ||
      room.includes("shared")
    );
  }
  return false;
}

function hospitalizationCauseMatches(value, key) {
  const cause = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!cause) return false;
  if (key === "injury") return cause.includes("injur");
  if (key === "illness") {
    return (
      cause.includes("ill") ||
      cause.includes("disease") ||
      cause.includes("sick")
    );
  }
  if (key === "maternity") {
    return (
      cause.includes("mater") ||
      cause.includes("deliver") ||
      cause.includes("pregnan")
    );
  }
  return false;
}

function CharBoxRow({
  length,
  value,
  onChange,
  boxStyle,
  rowStyle,
  keyboardType,
}) {
  const padded = padChars(value, length);
  const chars = padded.split("");
  const handleCell = (idx, t) => {
    const last = (t || "").slice(-1);
    const nextChar = last === "" || last === " " ? " " : last.toUpperCase();
    const arr = padChars(value, length).split("");
    arr[idx] = nextChar;
    onChange(arr.join(""));
  };
  return (
    <View style={rowStyle || stylesWeb.boxRow}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          style={boxStyle || stylesWeb.squareBox}
          maxLength={1}
          keyboardType={keyboardType}
          value={chars[i] === " " ? "" : chars[i]}
          onChangeText={(t) => handleCell(i, t)}
        />
      ))}
    </View>
  );
}

function BillsTableEditor({ billRows, onBillChange }) {
  return (
    <View style={stylesWeb.tableContainer}>
      <View style={stylesWeb.tableRowHeader}>
        <Text style={[stylesWeb.tableCell, { width: 50 }]}>Sl. No.</Text>
        <Text style={[stylesWeb.tableCell, { width: 80 }]}>Bill No.</Text>
        <Text style={[stylesWeb.tableCell, { width: 120 }]}>Date</Text>
        <Text style={[stylesWeb.tableCell, { width: 200 }]}>Issued by</Text>
        <Text style={[stylesWeb.tableCell, { flex: 1 }]}>Towards</Text>
        <Text style={[stylesWeb.tableCell, { width: 200 }]}>Amount (Rs)</Text>
      </View>

      {billRows.map((row, rowIndex) => (
        <View key={rowIndex} style={stylesWeb.tableRow}>
          <Text style={[stylesWeb.tableCell, { width: 50 }]}>
            {rowIndex + 1}.
          </Text>

          <View style={[stylesWeb.tableCell, { width: 80 }]}>
            <TextInput
              style={stylesWeb.tableTextInput}
              value={row.billNo}
              onChangeText={(text) => onBillChange(rowIndex, "billNo", text)}
            />
          </View>

          <View style={[stylesWeb.tableCell, { width: 120 }]}>
            <CharBoxRow
              length={6}
              value={row.date}
              onChange={(text) => onBillChange(rowIndex, "date", text)}
              rowStyle={stylesWeb.tableCharRow}
              boxStyle={stylesWeb.squareBoxSmall}
              keyboardType="numeric"
            />
          </View>

          <View style={[stylesWeb.tableCell, { width: 200 }]}>
            <TextInput
              style={stylesWeb.tableTextInput}
              value={row.issuedBy}
              onChangeText={(text) => onBillChange(rowIndex, "issuedBy", text)}
            />
          </View>

          <View style={[stylesWeb.tableCell, { flex: 1 }]}>
            <TextInput
              style={stylesWeb.tableTextInput}
              value={row.towards}
              onChangeText={(text) => onBillChange(rowIndex, "towards", text)}
            />
          </View>

          <View style={[stylesWeb.tableCell, { width: 200 }]}>
            <CharBoxRow
              length={8}
              value={row.amount}
              onChange={(text) => onBillChange(rowIndex, "amount", text)}
              rowStyle={stylesWeb.tableCharRow}
              boxStyle={stylesWeb.squareBoxSmall}
              keyboardType="numeric"
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function HospitalInsuranceDownload({ navigation, route }) {
  const analysisData = route?.params?.analysisData;
  const { width } = useWindowDimensions();

  const formSeed = useMemo(
    () => mapToStarHealthFormA(analysisData),
    [analysisData],
  );

  const [form, setForm] = useState(() => formSeed);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [signatureImage, setSignatureImage] = useState(null);
  const formRef = useRef(null);
  const previewFrameRef = useRef(null);
  const [previewFrameHeight, setPreviewFrameHeight] = useState(1400);
  const [editedHtml, setEditedHtml] = useState(null);
  const htmlPreview = useMemo(
    () => generateInsuranceFormHTML(form, signatureImage),
    [form, signatureImage],
  );

  useEffect(() => {
    setForm(formSeed);
  }, [formSeed]);

  useEffect(() => {
    setEditedHtml(null);
  }, [formSeed]);

  const setField = useCallback((key, v) => {
    setForm((prev) => ({ ...prev, [key]: v }));
  }, []);

  const setBillField = useCallback((rowIndex, key, value) => {
    setForm((prev) => ({
      ...prev,
      billRows: (prev.billRows || []).map((row, index) =>
        index === rowIndex ? { ...row, [key]: value } : row,
      ),
    }));
  }, []);

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
      const clonedTextarea = clonedTextareas[index];
      if (clonedTextarea) clonedTextarea.textContent = textarea.value ?? "";
    });

    const sourceSelects = doc.querySelectorAll("select");
    const clonedSelects = clone.querySelectorAll("select");
    sourceSelects.forEach((select, index) => {
      const clonedSelect = clonedSelects[index];
      if (!clonedSelect) return;
      Array.from(clonedSelect.options).forEach((option, optionIndex) => {
        option.selected = select.options[optionIndex]?.selected ?? false;
        if (option.selected) option.setAttribute("selected", "");
        else option.removeAttribute("selected");
      });
    });

    return `<!DOCTYPE html>\n${clone.outerHTML}`;
  }, []);

  const getHtmlOverride = useCallback(() => {
    if (Platform.OS === "web") {
      const iframeDoc = previewFrameRef.current?.contentDocument;
      return buildDocumentHtml(iframeDoc) || editedHtml;
    }
    return editedHtml;
  }, [buildDocumentHtml, editedHtml]);

  const syncPreviewFrameHeight = useCallback(() => {
    if (Platform.OS !== "web") return;
    const iframe = previewFrameRef.current;
    const doc = iframe?.contentWindow?.document;
    if (!doc) return;

    const body = doc.body;
    const root = doc.documentElement;
    const nextHeight = Math.max(
      body?.scrollHeight || 0,
      body?.offsetHeight || 0,
      root?.scrollHeight || 0,
      root?.offsetHeight || 0,
    );

    if (nextHeight > 0) {
      setPreviewFrameHeight(Math.max(900, Math.ceil(nextHeight) + 20));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || !previewMode) return;
    const timer = setTimeout(syncPreviewFrameHeight, 120);
    return () => clearTimeout(timer);
  }, [htmlPreview, previewMode, syncPreviewFrameHeight]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadInsuranceClaim(form, signatureImage, getHtmlOverride());
    } catch (e) {
      Alert.alert(
        "Download Error",
        "Could not generate the PDF. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={stylesWeb.root}>
          <ImageBackground
            source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
            style={stylesWeb.background}
            resizeMode="cover"
          >
            <View style={stylesWeb.overlay} />

            <View style={stylesWeb.mainRow}>
              {/* LEFT SIDEBAR */}
              <View style={stylesWeb.sidebar}>
                <HospitalSidebarNavigation navigation={navigation} />
              </View>

              {/* RIGHT CONTENT */}
              <View style={stylesWeb.content}>
                {/* <View style={stylesWeb.headerRow}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View> */}

                {/* WHITE CARD */}
                <View style={stylesWeb.card}>
                  {/* ── CARD TITLE + BACK ── */}
                  <View style={stylesWeb.cardTitleRow}>
                    <Text style={stylesWeb.cardTitle}>Medi claim agent</Text>
                    <TouchableOpacity
                      style={stylesWeb.backToHomeBtn}
                      onPress={() => navigation.goBack()}
                    >
                      <Text style={stylesWeb.backToHomeBtnText}>
                        Back to home
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* ── STEP BAR ── */}
                  <View style={stylesWeb.stepBar}>
                    {[
                      {
                        label: "Upload Documents",
                        sub: "Upload document",
                        done: true,
                      },
                      {
                        label: "Full Case Analysis",
                        sub: "Analyze Reports",
                        done: true,
                      },
                      {
                        label: "Download Updated File",
                        sub: "Editable & ready",
                        done: false,
                        active: true,
                      },
                    ].map((step, i, arr) => (
                      <React.Fragment key={i}>
                        <View style={stylesWeb.stepItem}>
                          {/* Circle */}
                          {step.done ? (
                            <View style={stylesWeb.stepCircleDone}>
                              <Text style={stylesWeb.stepTick}>✓</Text>
                            </View>
                          ) : (
                            <View
                              style={[
                                stylesWeb.stepCircleInactive,
                                step.active && stylesWeb.stepCircleActive,
                              ]}
                            >
                              <Text
                                style={[
                                  stylesWeb.stepNum,
                                  step.active && stylesWeb.stepNumActive,
                                ]}
                              >
                                {i + 1}
                              </Text>
                            </View>
                          )}
                          <View style={{ marginLeft: 8 }}>
                            <Text
                              style={[
                                stylesWeb.stepLabel,
                                (step.done || step.active) &&
                                  stylesWeb.stepLabelActive,
                              ]}
                            >
                              {step.label}
                            </Text>
                            <Text style={stylesWeb.stepSub}>{step.sub}</Text>
                          </View>
                        </View>
                        {i < arr.length - 1 && (
                          <View style={stylesWeb.stepConnector} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>

                  <View style={{ flex: 1, minHeight: 0 }}>
                    {/* INFO BOX */}
                    <View
                      style={{
                        backgroundColor: "#E8F0FE",
                        borderColor: "#90CAF9",
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 12,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#1E3A8A" }}>
                        Updated claim file generated. 5 of 6 suggestions
                        applied. Review below, make any final edits, then
                        download.
                      </Text>
                    </View>

                    {/* CLAIM CARD */}
                    <View
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderRadius: 8,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        paddingBottom: 12,
                        flex: 1,
                        minHeight: 0,
                      }}
                    >
                      <View
                        style={[
                          stylesMobile.fileHeader,
                          { justifyContent: "space-between" },
                        ]}
                      >
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
                          {/* FILE NAME */}
                          <Text style={stylesMobile.fileName}>
                            {analysisData?.structured_data?.source_filename ||
                              "Insurance_Claim_Sharma_Aug2024.pdf"}
                          </Text>
                        </View>
                        {/* EDIT / PREVIEW TOGGLE */}
                        <TouchableOpacity
                          onPress={() => setPreviewMode((p) => !p)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: "#1976D2",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#1976D2",
                              fontWeight: "600",
                            }}
                          >
                            {previewMode ? "Edit Fields" : "Preview"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {previewMode ? (
                        /* ── PREVIEW: compact iframe matching the PDF ── */
                        <View style={stylesWeb.previewFrameContainer}>
                          <iframe
                            ref={previewFrameRef}
                            srcDoc={htmlPreview}
                            onLoad={syncPreviewFrameHeight}
                            style={{
                              ...stylesWeb.previewFrame,
                              height: previewFrameHeight,
                            }}
                            title="Insurance Claim Preview"
                          />
                        </View>
                      ) : (
                        <ScrollView>
                          <View ref={formRef}>
                            <View style={stylesWeb.formHeaderContainer}>
                              <View style={{ alignItems: "center" }}>
                                <Image
                                  source={require("../../assets/HospitalPortal/Images/StarHealth.jpg")}
                                  style={{
                                    width: 180,
                                    height: 60,
                                    resizeMode: "contain",
                                  }}
                                />

                                <Text style={stylesWeb.headerTitle}>
                                  STAR HEALTH AND ALLIED INSURANCE COMPANY
                                  LIMITED
                                </Text>

                                <Text style={stylesWeb.headerSub}>
                                  Regd & Corporate Office: No. 1, New Tank
                                  Street...
                                </Text>
                              </View>

                              {/* BLACK BAR */}
                              <View style={stylesWeb.blackBar}>
                                <Text style={stylesWeb.blackBarText}>
                                  CLAIM FORM - PART A
                                </Text>
                              </View>

                              {/* BELOW TEXT */}
                              <View style={stylesWeb.headerRowBottom}>
                                <View style={{ flex: 1 }}>
                                  <Text style={stylesWeb.centerText}>
                                    TO BE FILLED IN BY THE INSURED
                                  </Text>
                                  <Text style={stylesWeb.centerSub}>
                                    The issue of this Form is not to be taken as
                                    an admission of liability
                                  </Text>
                                </View>

                                <Text style={stylesWeb.rightNote}>
                                  (To be filled in block letters)
                                </Text>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER WITH CENTER TEXT */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DETAILS OF PRIMARY INSURED:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              {/* MAIN CONTENT + RIGHT SECTION BAR */}
                              <View style={stylesWeb.sectionContentRow}>
                                {/* LEFT FORM */}
                                <View style={{ flex: 1 }}>
                                  {/* ROW 1: POLICY + SL NO */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        a) Policy No.:
                                      </Text>
                                      <CharBoxRow
                                        length={18}
                                        value={form.policyNumber}
                                        onChange={(v) =>
                                          setField("policyNumber", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        b) Sl. No./Certificate no.
                                      </Text>
                                      <CharBoxRow
                                        length={14}
                                        value={form.certificateNumber}
                                        onChange={(v) =>
                                          setField("certificateNumber", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* ROW 2 */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      c) Company / TPA ID (MA ID)No:
                                    </Text>
                                    <CharBoxRow
                                      length={22}
                                      value={form.tpaId}
                                      onChange={(v) => setField("tpaId", v)}
                                    />
                                  </View>

                                  {/* ROW 3 */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      d) Name:
                                    </Text>
                                    <CharBoxRow
                                      length={40}
                                      value={form.primaryName}
                                      onChange={(v) =>
                                        setField("primaryName", v)
                                      }
                                    />
                                  </View>

                                  {/* ROW 4 */}
                                  <View style={stylesWeb.addressRow}>
                                    {/* LABEL aligned with first row */}
                                    <Text style={stylesWeb.label}>
                                      e) Address:
                                    </Text>

                                    {/* BOXES */}
                                    <View style={stylesWeb.addressBoxes}>
                                      {/* FIRST ROW */}
                                      <CharBoxRow
                                        length={40}
                                        value={form.primaryAddressRow1}
                                        onChange={(v) =>
                                          setField("primaryAddressRow1", v)
                                        }
                                      />

                                      {/* SECOND ROW */}
                                      <CharBoxRow
                                        length={35}
                                        value={form.primaryAddressRow2}
                                        onChange={(v) =>
                                          setField("primaryAddressRow2", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* CITY + STATE */}
                                  <View style={stylesWeb.rowBetweens}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>City:</Text>
                                      <CharBoxRow
                                        length={18}
                                        value={form.primaryCity}
                                        onChange={(v) =>
                                          setField("primaryCity", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        State:
                                      </Text>
                                      <CharBoxRow
                                        length={18}
                                        value={form.primaryState}
                                        onChange={(v) =>
                                          setField("primaryState", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* PIN + PHONE + EMAIL */}
                                  <View style={stylesWeb.rowBetweensLast}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Pin Code:
                                      </Text>
                                      <CharBoxRow
                                        length={6}
                                        value={form.primaryPin}
                                        onChange={(v) =>
                                          setField("primaryPin", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Phone No:
                                      </Text>
                                      <CharBoxRow
                                        length={10}
                                        value={form.primaryPhone}
                                        onChange={(v) =>
                                          setField("primaryPhone", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Email ID:
                                      </Text>
                                      <TextInput
                                        style={stylesWeb.longInput}
                                        value={form.primaryEmail}
                                        onChangeText={(t) =>
                                          setField("primaryEmail", t)
                                        }
                                        placeholder=""
                                      />
                                    </View>
                                  </View>
                                </View>

                                {/* RIGHT BLACK SECTION BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  {/* TOP LINE */}
                                  <View style={stylesWeb.sectionLine} />

                                  {/* TEXT IN MIDDLE */}
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION A
                                    </Text>
                                  </View>

                                  {/* BOTTOM LINE */}
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DETAILS OF INSURANCE HISTORY:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              <View style={stylesWeb.sectionContentRow}>
                                {/* LEFT CONTENT */}
                                <View style={{ flex: 1 }}>
                                  {/* ROW 1 */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        a) Currently covered by any other
                                        Mediclaim / Health Insurance:
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          isYesValue(form.bCurrentlyOther) &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        Yes
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          isNoValue(form.bCurrentlyOther) &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        No
                                      </Text>
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        b) Date of commencement of first
                                        Insurance without break:
                                      </Text>

                                      {/* DATE BOXES */}
                                      <CharBoxRow
                                        length={8}
                                        value={
                                          form.insuranceFirstCommencementDate
                                        }
                                        onChange={(v) =>
                                          setField(
                                            "insuranceFirstCommencementDate",
                                            v,
                                          )
                                        }
                                        keyboardType="numeric"
                                      />
                                    </View>
                                  </View>

                                  {/* ROW 2 */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        c) If yes, company name:
                                      </Text>
                                      <CharBoxRow
                                        length={20}
                                        value={form.insuranceCompanyName}
                                        onChange={(v) =>
                                          setField("insuranceCompanyName", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Policy No.
                                      </Text>
                                      <CharBoxRow
                                        length={18}
                                        value={form.insurancePolicyNo}
                                        onChange={(v) =>
                                          setField("insurancePolicyNo", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* ROW 3 */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Sum insured (Rs.)
                                      </Text>
                                      <CharBoxRow
                                        length={12}
                                        value={form.insuranceSumInsured}
                                        onChange={(v) =>
                                          setField("insuranceSumInsured", v)
                                        }
                                        keyboardType="numeric"
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        d) Have you been hospitalized in the
                                        last four years since inception of the
                                        contract?
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          isYesValue(form.bHosp4Y) &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        Yes
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          isNoValue(form.bHosp4Y) &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        No
                                      </Text>

                                      <Text
                                        style={[
                                          stylesWeb.label,
                                          { marginLeft: 10 },
                                        ]}
                                      >
                                        Date:
                                      </Text>
                                      <CharBoxRow
                                        length={4}
                                        value={form.hospitalizationHistoryDate}
                                        onChange={(v) =>
                                          setField(
                                            "hospitalizationHistoryDate",
                                            v,
                                          )
                                        }
                                        keyboardType="numeric"
                                      />
                                    </View>
                                  </View>

                                  {/* ROW 4 */}
                                  <View style={stylesWeb.rowBetweenDiagnosis}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Diagnosis:
                                      </Text>
                                      <TextInput
                                        style={stylesWeb.longInputWide}
                                        value={form.diagnosis}
                                        onChangeText={(t) =>
                                          setField("diagnosis", t)
                                        }
                                        placeholder=""
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        e) Previously covered by any other
                                        Mediclaim /Health insurance :
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          isYesValue(form.bPreviouslyOther) &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        Yes
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          isNoValue(form.bPreviouslyOther) &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        No
                                      </Text>
                                    </View>
                                  </View>

                                  {/* ROW 5 */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      f) If yes, company name:
                                    </Text>
                                    <CharBoxRow
                                      length={22}
                                      value={form.previousMediclaimCompanyName}
                                      onChange={(v) =>
                                        setField(
                                          "previousMediclaimCompanyName",
                                          v,
                                        )
                                      }
                                    />
                                  </View>
                                </View>

                                {/* RIGHT SIDE — SECTION B BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  <View style={stylesWeb.sectionLine} />
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION B
                                    </Text>
                                  </View>
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DETAILS OF INSURED PERSON HOSPITALIZED:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              <View style={stylesWeb.sectionContentRow}>
                                {/* LEFT CONTENT */}
                                <View style={{ flex: 1 }}>
                                  {/* a) NAME */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      a) Name:
                                    </Text>
                                    <CharBoxRow
                                      length={40}
                                      value={form.hospitalizedName}
                                      onChange={(v) =>
                                        setField("hospitalizedName", v)
                                      }
                                    />
                                  </View>

                                  {/* b + c + d */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        b) Gender
                                      </Text>
                                      <Text style={stylesWeb.smallText}>
                                        Male
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() =>
                                          setField(
                                            "gender",
                                            form.gender === "male"
                                              ? ""
                                              : "male",
                                          )
                                        }
                                        style={[
                                          stylesWeb.checkbox,
                                          form.gender === "male" && {
                                            backgroundColor: "#1976D2",
                                          },
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        Female
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() =>
                                          setField(
                                            "gender",
                                            form.gender === "female"
                                              ? ""
                                              : "female",
                                          )
                                        }
                                        style={[
                                          stylesWeb.checkbox,
                                          form.gender === "female" && {
                                            backgroundColor: "#1976D2",
                                          },
                                        ]}
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        c) Age years
                                      </Text>
                                      <CharBoxRow
                                        length={2}
                                        value={form.ageYears}
                                        onChange={(v) =>
                                          setField("ageYears", v)
                                        }
                                      />

                                      <Text style={stylesWeb.smallText}>
                                        Months
                                      </Text>
                                      <CharBoxRow
                                        length={2}
                                        value={form.ageMonths}
                                        onChange={(v) =>
                                          setField("ageMonths", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        d) Date of Birth
                                      </Text>
                                      <CharBoxRow
                                        length={8}
                                        value={form.dob}
                                        onChange={(v) => setField("dob", v)}
                                      />
                                    </View>
                                  </View>

                                  {/* e) RELATIONSHIP */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      e) Relationship to Primary insured:
                                    </Text>

                                    {[
                                      "Self",
                                      "Spouse",
                                      "Child",
                                      "Father",
                                      "Mother",
                                      "Other",
                                    ].map((item, i) => (
                                      <React.Fragment key={i}>
                                        <Text style={stylesWeb.smallText}>
                                          {item}
                                        </Text>
                                        <View
                                          style={[
                                            stylesWeb.checkbox,
                                            relationshipMatches(
                                              form.relationship ||
                                                form.relationshipSpecify,
                                              item.toLowerCase(),
                                            ) && CHECKED_BOX_STYLE,
                                          ]}
                                        />
                                      </React.Fragment>
                                    ))}

                                    <Text style={stylesWeb.smallText}>
                                      (Please Specify)
                                    </Text>
                                    <TextInput
                                      style={stylesWeb.longInputWide}
                                      value={form.relationshipSpecify}
                                      onChangeText={(t) =>
                                        setField("relationshipSpecify", t)
                                      }
                                    />
                                  </View>

                                  {/* f) OCCUPATION */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      f) Occupation
                                    </Text>

                                    {[
                                      "Service",
                                      "Self Employed",
                                      "Home Maker",
                                      "Student",
                                      "Retired",
                                      "Other",
                                    ].map((item, i) => (
                                      <React.Fragment key={i}>
                                        <Text style={stylesWeb.smallText}>
                                          {item}
                                        </Text>
                                        <View
                                          style={[
                                            stylesWeb.checkbox,
                                            occupationMatches(
                                              form.occupation ||
                                                form.occupationSpecify,
                                              item.toLowerCase(),
                                            ) && CHECKED_BOX_STYLE,
                                          ]}
                                        />
                                      </React.Fragment>
                                    ))}

                                    <Text style={stylesWeb.smallText}>
                                      (Please Specify)
                                    </Text>
                                    <TextInput
                                      style={stylesWeb.longInputWide}
                                      value={form.occupationSpecify}
                                      onChangeText={(t) =>
                                        setField("occupationSpecify", t)
                                      }
                                    />
                                  </View>

                                  {/* g) ADDRESS */}
                                  <View style={stylesWeb.addressRow}>
                                    <Text style={stylesWeb.label}>
                                      g) Address (if diffrent from above):
                                    </Text>

                                    <View style={stylesWeb.addressBoxes}>
                                      <CharBoxRow
                                        length={40}
                                        value={form.hospAddressRow1}
                                        onChange={(v) =>
                                          setField("hospAddressRow1", v)
                                        }
                                      />
                                      <CharBoxRow
                                        length={35}
                                        value={form.hospAddressRow2}
                                        onChange={(v) =>
                                          setField("hospAddressRow2", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* CITY + STATE */}
                                  <View style={stylesWeb.rowBetweens}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>City:</Text>
                                      <CharBoxRow
                                        length={18}
                                        value={form.hospCity}
                                        onChange={(v) =>
                                          setField("hospCity", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        State:
                                      </Text>
                                      <CharBoxRow
                                        length={18}
                                        value={form.hospState}
                                        onChange={(v) =>
                                          setField("hospState", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* PIN + PHONE + EMAIL */}
                                  <View style={stylesWeb.rowBetweensLast}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Pin Code:
                                      </Text>
                                      <CharBoxRow
                                        length={6}
                                        value={form.hospPin}
                                        onChange={(v) => setField("hospPin", v)}
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Phone No:
                                      </Text>
                                      <CharBoxRow
                                        length={10}
                                        value={form.hospPhone}
                                        onChange={(v) =>
                                          setField("hospPhone", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Email ID:
                                      </Text>
                                      <TextInput
                                        style={stylesWeb.longInput}
                                        value={form.hospEmail}
                                        onChangeText={(t) =>
                                          setField("hospEmail", t)
                                        }
                                        placeholder=""
                                      />
                                    </View>
                                  </View>
                                </View>

                                {/* RIGHT BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  <View style={stylesWeb.sectionLine} />
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION C
                                    </Text>
                                  </View>
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DETAILS OF HOSPITALIZATION:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              <View style={stylesWeb.sectionContentRow}>
                                {/* LEFT CONTENT */}
                                <View style={{ flex: 1 }}>
                                  {/* a) HOSPITAL NAME */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      a) Name of Hospital where Admitted:
                                    </Text>
                                    <CharBoxRow
                                      length={40}
                                      value={form.hospitalName}
                                      onChange={(v) =>
                                        setField("hospitalName", v)
                                      }
                                    />
                                  </View>

                                  {/* b) ROOM CATEGORY */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      b) Room Category occupied:
                                    </Text>

                                    {[
                                      "Day care",
                                      "Single occupancy",
                                      "Twin sharing",
                                      "3 or more beds per room",
                                    ].map((item, i) => (
                                      <React.Fragment key={i}>
                                        <Text style={stylesWeb.smallText}>
                                          {item}
                                        </Text>
                                        <View
                                          style={[
                                            stylesWeb.checkbox,
                                            roomCategoryMatches(
                                              form.roomCategory,
                                              item.toLowerCase(),
                                            ) && CHECKED_BOX_STYLE,
                                          ]}
                                        />
                                      </React.Fragment>
                                    ))}
                                  </View>

                                  {/* c + d */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        c) Hospitalization due to:
                                      </Text>

                                      {["Injury", "Illness", "Maternity"].map(
                                        (item, i) => (
                                          <React.Fragment key={i}>
                                            <Text style={stylesWeb.smallText}>
                                              {item}
                                            </Text>
                                            <View
                                              style={[
                                                stylesWeb.checkbox,
                                                hospitalizationCauseMatches(
                                                  form.hospitalizationCause,
                                                  item.toLowerCase(),
                                                ) && CHECKED_BOX_STYLE,
                                              ]}
                                            />
                                          </React.Fragment>
                                        ),
                                      )}
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        d) Date of injury / Date Disease first
                                        detected /Date of Delivery:
                                      </Text>
                                      <CharBoxRow
                                        length={8}
                                        value={form.injuryDate}
                                        onChange={(v) =>
                                          setField("injuryDate", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* e + f + g + h */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        e) Date of Admission:
                                      </Text>
                                      <CharBoxRow
                                        length={8}
                                        value={form.admissionDate}
                                        onChange={(v) =>
                                          setField("admissionDate", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        f) Time:
                                      </Text>
                                      <CharBoxRow
                                        length={4}
                                        value={form.admissionTime}
                                        onChange={(v) =>
                                          setField("admissionTime", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        g) Date of Discharge:
                                      </Text>
                                      <CharBoxRow
                                        length={8}
                                        value={form.dischargeDate}
                                        onChange={(v) =>
                                          setField("dischargeDate", v)
                                        }
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        h) Time:
                                      </Text>
                                      <CharBoxRow
                                        length={4}
                                        value={form.dischargeTime}
                                        onChange={(v) =>
                                          setField("dischargeTime", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* i + ii + iii */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        i) If injury give cause:
                                      </Text>

                                      {[
                                        "Self inflicted",
                                        "Road Traffic Accident",
                                        "Substance Abuse / Alcohol Consumption",
                                      ].map((item, i) => (
                                        <React.Fragment key={i}>
                                          <Text style={stylesWeb.smallText}>
                                            {item}
                                          </Text>
                                          <View
                                            style={[
                                              stylesWeb.checkbox,
                                              ((item === "Self inflicted" &&
                                                form.injurySelf) ||
                                                (item ===
                                                  "Road Traffic Accident" &&
                                                  form.injuryRta) ||
                                                (item ===
                                                  "Substance Abuse / Alcohol Consumption" &&
                                                  form.injurySubstance)) &&
                                                CHECKED_BOX_STYLE,
                                            ]}
                                          />
                                        </React.Fragment>
                                      ))}
                                    </View>
                                  </View>

                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        ii) Reported to Police
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          form.reportedPolice &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        iii. MLC Report & Police FIR attached
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          form.firYes && CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        Yes
                                      </Text>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          form.firNo && CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        No
                                      </Text>
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        j) System of Medicine:
                                      </Text>
                                      <TextInput
                                        style={stylesWeb.longInputWide}
                                        value={form.treatingDoctor}
                                        onChangeText={(t) =>
                                          setField("treatingDoctor", t)
                                        }
                                        placeholder=""
                                      />
                                    </View>
                                  </View>
                                </View>

                                {/* RIGHT BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  <View style={stylesWeb.sectionLine} />
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION D
                                    </Text>
                                  </View>
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DETAILS OF CLAIM:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              <View style={stylesWeb.sectionContentRow}>
                                {/* LEFT CONTENT */}
                                <View style={{ flex: 1 }}>
                                  {/* a) TREATMENT EXPENSES */}
                                  <Text style={stylesWeb.label}>
                                    a) Details of the Treatment expenses claimed
                                  </Text>

                                  {/* ROWS */}
                                  <View style={stylesWeb.rowBetween}>
                                    <Text style={stylesWeb.label}>
                                      i. Pre-hospitalization expenses Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimPre}
                                      onChange={(v) => setField("claimPre", v)}
                                    />

                                    <Text style={stylesWeb.label}>
                                      ii. Hospitalization expenses Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimHospital}
                                      onChange={(v) =>
                                        setField("claimHospital", v)
                                      }
                                    />
                                  </View>

                                  <View style={stylesWeb.rowBetween}>
                                    <Text style={stylesWeb.label}>
                                      iii. Post-hospitalization expenses Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimPost}
                                      onChange={(v) => setField("claimPost", v)}
                                    />

                                    <Text style={stylesWeb.label}>
                                      iv. Health-Check up cost Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimHealthCheckup}
                                      onChange={(v) =>
                                        setField("claimHealthCheckup", v)
                                      }
                                      keyboardType="numeric"
                                    />
                                  </View>

                                  <View style={stylesWeb.rowBetween}>
                                    <Text style={stylesWeb.label}>
                                      v. Ambulance Charges Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimAmbulance}
                                      onChange={(v) =>
                                        setField("claimAmbulance", v)
                                      }
                                      keyboardType="numeric"
                                    />

                                    <Text style={stylesWeb.label}>
                                      vi. Others (code):
                                    </Text>
                                    <CharBoxRow
                                      length={3}
                                      value={form.claimOtherCode}
                                      onChange={(v) =>
                                        setField("claimOtherCode", v)
                                      }
                                    />

                                    <Text style={stylesWeb.label}>Rs.</Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimOtherAmount}
                                      onChange={(v) =>
                                        setField("claimOtherAmount", v)
                                      }
                                      keyboardType="numeric"
                                    />
                                  </View>

                                  {/* TOTAL */}
                                  <View style={stylesWeb.inlineRows}>
                                    <Text
                                      style={[
                                        stylesWeb.label,
                                        {
                                          fontWeight: "500",
                                          fontSize: 30,
                                          justifyContent: "flex-end",
                                        },
                                      ]}
                                    >
                                      Total Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={10}
                                      value={form.claimTotal}
                                      onChange={(v) =>
                                        setField("claimTotal", v)
                                      }
                                      boxStyle={stylesWeb.squareBoxs}
                                      keyboardType="numeric"
                                    />
                                  </View>

                                  {/* PERIOD */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        vii. Pre-hospitalization period: days
                                      </Text>
                                      <CharBoxRow
                                        length={3}
                                        value={form.claimPreHospitalDays}
                                        onChange={(v) =>
                                          setField("claimPreHospitalDays", v)
                                        }
                                        keyboardType="numeric"
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        viii. Post-hospitalization period: days
                                      </Text>
                                      <CharBoxRow
                                        length={3}
                                        value={form.claimPostHospitalDays}
                                        onChange={(v) =>
                                          setField("claimPostHospitalDays", v)
                                        }
                                        keyboardType="numeric"
                                      />
                                    </View>
                                  </View>

                                  {/* DOMICILIARY */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      b) Claim for Domiciliary Hospitalization:
                                    </Text>
                                    <View
                                      style={[
                                        stylesWeb.checkbox,
                                        isYesValue(form.domiciliary) &&
                                          CHECKED_BOX_STYLE,
                                      ]}
                                    />
                                    <Text style={stylesWeb.smallText}>Yes</Text>
                                    <View
                                      style={[
                                        stylesWeb.checkbox,
                                        isNoValue(form.domiciliary) &&
                                          CHECKED_BOX_STYLE,
                                      ]}
                                    />
                                    <Text style={stylesWeb.smallText}>No</Text>
                                    <Text style={stylesWeb.smallText}>
                                      (If yes, provide details in annexure)
                                    </Text>
                                  </View>

                                  {/* CASH BENEFITS */}
                                  <Text style={stylesWeb.label}>
                                    c) Details of Lump sum / cash benefit
                                    claimed:
                                  </Text>

                                  <View style={stylesWeb.rowBetween}>
                                    <Text style={stylesWeb.label}>
                                      i. Hospital Daily cash Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimHospitalDailyCash}
                                      onChange={(v) =>
                                        setField("claimHospitalDailyCash", v)
                                      }
                                      keyboardType="numeric"
                                    />

                                    <Text style={stylesWeb.label}>
                                      ii. Surgical Cash Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimSurgicalCash}
                                      onChange={(v) =>
                                        setField("claimSurgicalCash", v)
                                      }
                                      keyboardType="numeric"
                                    />
                                  </View>

                                  <View style={stylesWeb.rowBetween}>
                                    <Text style={stylesWeb.label}>
                                      iii. Critical Illness benefit Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimCriticalIllness}
                                      onChange={(v) =>
                                        setField("claimCriticalIllness", v)
                                      }
                                      keyboardType="numeric"
                                    />

                                    <Text style={stylesWeb.label}>
                                      iv. Convalescence Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimConvalescence}
                                      onChange={(v) =>
                                        setField("claimConvalescence", v)
                                      }
                                      keyboardType="numeric"
                                    />
                                  </View>

                                  <View style={stylesWeb.rowBetween}>
                                    <Text style={stylesWeb.label}>
                                      v. Pre/Post hospitalization Lump sum
                                      benefit Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimPrePostBenefit}
                                      onChange={(v) =>
                                        setField("claimPrePostBenefit", v)
                                      }
                                      keyboardType="numeric"
                                    />

                                    <Text style={stylesWeb.label}>
                                      vi. Others Rs.
                                    </Text>
                                    <CharBoxRow
                                      length={8}
                                      value={form.claimOtherBenefit}
                                      onChange={(v) =>
                                        setField("claimOtherBenefit", v)
                                      }
                                      keyboardType="numeric"
                                    />
                                  </View>
                                </View>

                                {/* RIGHT CHECKLIST */}
                                <View style={stylesWeb.sectionEChecklist}>
                                  <Text style={stylesWeb.label}>
                                    Claim Documents Submitted - Check List:
                                  </Text>

                                  {[
                                    "Claim form duly signed",
                                    "Copy of the claim intimation, if any",
                                    "Hospital Main Bill",
                                    "Hospital Break-up Bill",
                                    "Hospital Bill Payment Receipt",
                                    "Hospital Discharge Summary",
                                    "Pharmacy Bill",
                                    "Operation Theater Notes",
                                    "ECG",
                                    "Doctors request for investigation",
                                    "Investigation Reports (Including CT MRI / USG / HPE)",
                                    "Doctors Prescriptions",
                                    "Others",
                                  ].map((item, i) => (
                                    <View key={i} style={stylesWeb.inlineRow}>
                                      <View
                                        style={[
                                          stylesWeb.checkbox,
                                          form.docChecklist?.[i] &&
                                            CHECKED_BOX_STYLE,
                                        ]}
                                      />
                                      <Text style={stylesWeb.smallText}>
                                        {item}
                                      </Text>
                                    </View>
                                  ))}
                                </View>

                                {/* RIGHT BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  <View style={stylesWeb.sectionLine} />
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION E
                                    </Text>
                                  </View>
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DETAILS OF BILLS ENCLOSED:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              <View style={stylesWeb.sectionContentRow}>
                                {/* TABLE */}
                                <BillsTableEditor
                                  billRows={form.billRows}
                                  onBillChange={setBillField}
                                />

                                {/* RIGHT BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  <View style={stylesWeb.sectionLine} />
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION F
                                    </Text>
                                  </View>
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DETAILS OF PRIMARY INSURED’S BANK ACCOUNT:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              <View style={stylesWeb.sectionContentRow}>
                                {/* LEFT CONTENT */}
                                <View style={{ flex: 1 }}>
                                  {/* ROW 1 */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        a) PAN:
                                      </Text>
                                      <CharBoxRow
                                        length={10}
                                        value={form.pan}
                                        onChange={(v) => setField("pan", v)}
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        b) Account Number:
                                      </Text>
                                      <CharBoxRow
                                        length={22}
                                        value={form.accountNumber}
                                        onChange={(v) =>
                                          setField("accountNumber", v)
                                        }
                                      />
                                    </View>
                                  </View>

                                  {/* ROW 2 */}
                                  <View style={stylesWeb.inlineRow}>
                                    <Text style={stylesWeb.label}>
                                      c) Bank Name and Branch:
                                    </Text>
                                    <CharBoxRow
                                      length={40}
                                      value={form.bankNameBranch}
                                      onChange={(v) =>
                                        setField("bankNameBranch", v)
                                      }
                                    />
                                  </View>

                                  {/* ROW 3 */}
                                  <View style={stylesWeb.rowBetween}>
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        d) Cheque / DD Payable details:
                                      </Text>
                                      <TextInput
                                        style={stylesWeb.longInputWide}
                                        value={form.chequeDetails}
                                        onChangeText={(t) =>
                                          setField("chequeDetails", t)
                                        }
                                        placeholder=""
                                      />
                                    </View>

                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        e) IFSC Code:
                                      </Text>
                                      <CharBoxRow
                                        length={11}
                                        value={form.ifscCode}
                                        onChange={(v) =>
                                          setField("ifscCode", v)
                                        }
                                      />
                                    </View>
                                  </View>
                                </View>

                                {/* RIGHT BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  <View style={stylesWeb.sectionLine} />
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION G
                                    </Text>
                                  </View>
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>

                            <View style={stylesWeb.sectionContainer}>
                              {/* DIVIDER */}
                              <View style={stylesWeb.dividerRow}>
                                <View style={stylesWeb.line} />
                                <Text style={stylesWeb.dividerText}>
                                  DECLARATION BY THE INSURED:
                                </Text>
                                <View style={stylesWeb.line} />
                              </View>

                              <View style={stylesWeb.sectionContentRow}>
                                {/* LEFT CONTENT */}
                                <View style={{ flex: 1 }}>
                                  {/* PARAGRAPH */}
                                  <Text style={stylesWeb.declarationText}>
                                    I hereby declare that the information
                                    furnished in the claim form is true &
                                    correct to the best of my knowledge and
                                    belief. If I have made any false or untrue
                                    statement, suppression or concealment of any
                                    material fact with respect to questions
                                    asked in relation to this claim, my right to
                                    claim reimbursement shall be forfeited. I
                                    also consent & authorize TPA / insurance
                                    Company, to seek necessary medical
                                    information / documents from any hospital /
                                    Medical Practitioner who has attended on the
                                    person against whom this claim is made. I
                                    hereby declare that I have included all the
                                    bills / receipts for the purpose of this
                                    claim & that I will not be making any
                                    supplementary claim, except the
                                    pre/post-hospitalization claim, if any.
                                  </Text>

                                  {/* DATE + PLACE + SIGNATURE */}
                                  <View style={stylesWeb.rowBetween}>
                                    {/* DATE */}
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>Date</Text>
                                      <CharBoxRow
                                        length={8}
                                        value={form.declarationDate}
                                        onChange={(v) =>
                                          setField("declarationDate", v)
                                        }
                                      />
                                    </View>

                                    {/* PLACE */}
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Place:
                                      </Text>
                                      <TextInput
                                        style={stylesWeb.placeInput}
                                        value={form.declarationPlace}
                                        onChangeText={(t) =>
                                          setField("declarationPlace", t)
                                        }
                                        placeholder=""
                                      />
                                    </View>

                                    {/* SIGNATURE */}
                                    <View style={stylesWeb.inlineRow}>
                                      <Text style={stylesWeb.label}>
                                        Signature of the Insured
                                      </Text>
                                      <TouchableOpacity
                                        style={stylesWeb.signatureBox}
                                        onPress={() =>
                                          navigation.navigate(
                                            "SignatureScreen",
                                            {
                                              onSave: (uri) =>
                                                setSignatureImage(uri),
                                            },
                                          )
                                        }
                                        activeOpacity={0.7}
                                      >
                                        {signatureImage ? (
                                          <Image
                                            source={{ uri: signatureImage }}
                                            style={stylesWeb.signatureImage}
                                            resizeMode="contain"
                                          />
                                        ) : (
                                          <Text
                                            style={
                                              stylesWeb.signaturePlaceholder
                                            }
                                          >
                                            Tap to sign
                                          </Text>
                                        )}
                                      </TouchableOpacity>
                                    </View>
                                  </View>

                                  {/* FOOTER NOTE */}
                                  <View style={stylesWeb.footerDivider} />
                                  <Text style={stylesWeb.footerNote}>
                                    (IMPORTANT: PLEASE TURN OVER)
                                  </Text>
                                </View>

                                {/* RIGHT BAR */}
                                <View style={stylesWeb.sectionBar}>
                                  <View style={stylesWeb.sectionLine} />
                                  <View style={stylesWeb.sectionTextWrap}>
                                    <Text style={stylesWeb.sectionText}>
                                      SECTION H
                                    </Text>
                                  </View>
                                  <View style={stylesWeb.sectionLine} />
                                </View>
                              </View>
                            </View>
                          </View>
                        </ScrollView>
                      )}
                    </View>
                  </View>
                </View>
                <View style={stylesWeb.buttonContainer}>
                  <TouchableOpacity style={stylesWeb.outlineBtnWeb}>
                    <Text style={stylesWeb.outlineTextWeb}>Open in editor</Text>
                  </TouchableOpacity>

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
                        Download updated claim
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={stylesWeb.greenOutlineBtnWeb}>
                    <Text style={stylesWeb.greenOutlineTextWeb}>
                      Analyze another claim
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={stylesWeb.greenBtnWeb}>
                    <Text style={stylesWeb.greenTextWeb}>
                      Set up date Integration
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={stylesMobile.container}>
          {/* HEADER */}
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={stylesMobile.header}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>
          <Text style={stylesMobile.title}>Medi claim agent</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {/* INFO BOX */}
            <View style={stylesMobile.infoBox}>
              <Text style={stylesMobile.infoText}>
                Updated claim file generated. 5 of 6 suggestions applied. Review
                below, make any final edits, then download.
              </Text>
            </View>

            {/* FILE CARD */}
            <View style={stylesMobile.card}>
              <View style={stylesMobile.fileHeader}>
                <Ionicons name="document-text" size={18} color="#1976D2" />
                <Text style={stylesMobile.fileName}>
                  {analysisData?.structured_data?.source_filename ||
                    "Insurance_Claim_Sharma_Aug2024.pdf"}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                scrollEventThrottle={16}
              >
                <View style={{ minWidth: 1300 }}>
                  <View style={stylesWeb.formHeaderContainer}>
                    {/* TOP ROW */}
                    <View style={stylesWeb.formTopRow}>
                      {/* LEFT LOGO */}
                      <View style={stylesWeb.logoRow}>
                        <Image
                          source={require("../../assets/HospitalPortal/Icon/mediassit.png")}
                          style={stylesWeb.logo}
                          resizeMode="contain"
                        />
                        <Text style={stylesWeb.logoText}>Medi Assist</Text>
                      </View>

                      {/* CENTER TITLE */}
                      <View style={stylesWeb.centerTitleBlock}>
                        <Text style={stylesWeb.formMainTitle}>
                          REIMBURSEMENT CLAIM FORM
                        </Text>
                        <Text style={stylesWeb.formSubTitle}>
                          TO BE FILLED BY THE INSURED
                        </Text>
                        <Text style={stylesWeb.formNoteCenter}>
                          The issue of this Form is not to be taken as an
                          admission of liability
                        </Text>
                      </View>

                      {/* RIGHT TEXT */}
                      <Text style={stylesWeb.formNoteRight}>
                        (To be Filled in block letters)
                      </Text>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER WITH CENTER TEXT */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DETAILS OF PRIMARY INSURED:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    {/* MAIN CONTENT + RIGHT SECTION BAR */}
                    <View style={stylesWeb.sectionContentRow}>
                      {/* LEFT FORM */}
                      <View style={{ flex: 1 }}>
                        {/* ROW 1: POLICY + SL NO */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>a) Policy No.:</Text>
                            <CharBoxRow
                              length={18}
                              value={form.policyNumber}
                              onChange={(v) => setField("policyNumber", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              b) Sl. No./Certificate no.
                            </Text>
                            <CharBoxRow
                              length={14}
                              value={form.certificateNumber}
                              onChange={(v) => setField("certificateNumber", v)}
                            />
                          </View>
                        </View>

                        {/* ROW 2 */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            c) Company / TPA ID (MA ID)No:
                          </Text>
                          <CharBoxRow
                            length={22}
                            value={form.tpaId}
                            onChange={(v) => setField("tpaId", v)}
                          />
                        </View>

                        {/* ROW 3 */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>d) Name:</Text>
                          <CharBoxRow
                            length={40}
                            value={form.primaryName}
                            onChange={(v) => setField("primaryName", v)}
                          />
                        </View>

                        {/* ROW 4 */}
                        <View style={stylesWeb.addressRow}>
                          {/* LABEL aligned with first row */}
                          <Text style={stylesWeb.label}>e) Address:</Text>

                          {/* BOXES */}
                          <View style={stylesWeb.addressBoxes}>
                            {/* FIRST ROW */}
                            <CharBoxRow
                              length={40}
                              value={form.primaryAddressRow1}
                              onChange={(v) =>
                                setField("primaryAddressRow1", v)
                              }
                            />

                            {/* SECOND ROW */}
                            <CharBoxRow
                              length={35}
                              value={form.primaryAddressRow2}
                              onChange={(v) =>
                                setField("primaryAddressRow2", v)
                              }
                            />
                          </View>
                        </View>

                        {/* CITY + STATE */}
                        <View style={stylesWeb.rowBetweens}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>City:</Text>
                            <CharBoxRow
                              length={18}
                              value={form.primaryCity}
                              onChange={(v) => setField("primaryCity", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>State:</Text>
                            <CharBoxRow
                              length={18}
                              value={form.primaryState}
                              onChange={(v) => setField("primaryState", v)}
                            />
                          </View>
                        </View>

                        {/* PIN + PHONE + EMAIL */}
                        <View style={stylesWeb.rowBetweensLast}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Pin Code:</Text>
                            <CharBoxRow
                              length={6}
                              value={form.primaryPin}
                              onChange={(v) => setField("primaryPin", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Phone No:</Text>
                            <CharBoxRow
                              length={10}
                              value={form.primaryPhone}
                              onChange={(v) => setField("primaryPhone", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Email ID:</Text>
                            <TextInput
                              style={stylesWeb.longInput}
                              value={form.primaryEmail}
                              onChangeText={(t) => setField("primaryEmail", t)}
                              placeholder=""
                            />
                          </View>
                        </View>
                      </View>

                      {/* RIGHT BLACK SECTION BAR */}
                      <View style={stylesWeb.sectionBar}>
                        {/* TOP LINE */}
                        <View style={stylesWeb.sectionLine} />

                        {/* TEXT IN MIDDLE */}
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION A</Text>
                        </View>

                        {/* BOTTOM LINE */}
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DETAILS OF INSURANCE HISTORY:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    <View style={stylesWeb.sectionContentRow}>
                      {/* LEFT CONTENT */}
                      <View style={{ flex: 1 }}>
                        {/* ROW 1 */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              a) Currently covered by any other Mediclaim /
                              Health Insurance:
                            </Text>
                            <View
                              style={[
                                stylesWeb.checkbox,
                                isYesValue(form.bCurrentlyOther) &&
                                  CHECKED_BOX_STYLE,
                              ]}
                            />
                            <Text style={stylesWeb.smallText}>Yes</Text>
                            <View
                              style={[
                                stylesWeb.checkbox,
                                isNoValue(form.bCurrentlyOther) &&
                                  CHECKED_BOX_STYLE,
                              ]}
                            />
                            <Text style={stylesWeb.smallText}>No</Text>
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              b) Date of commencement of first Insurance without
                              break:
                            </Text>

                            {/* DATE BOXES */}
                            <CharBoxRow
                              length={8}
                              value={form.insuranceFirstCommencementDate}
                              onChange={(v) =>
                                setField("insuranceFirstCommencementDate", v)
                              }
                              keyboardType="numeric"
                            />
                          </View>
                        </View>

                        {/* ROW 2 */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              c) If yes, company name:
                            </Text>
                            <CharBoxRow
                              length={20}
                              value={form.insuranceCompanyName}
                              onChange={(v) =>
                                setField("insuranceCompanyName", v)
                              }
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Policy No.</Text>
                            <CharBoxRow
                              length={18}
                              value={form.insurancePolicyNo}
                              onChange={(v) => setField("insurancePolicyNo", v)}
                            />
                          </View>
                        </View>

                        {/* ROW 3 */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              Sum insured (Rs.)
                            </Text>
                            <CharBoxRow
                              length={12}
                              value={form.insuranceSumInsured}
                              onChange={(v) =>
                                setField("insuranceSumInsured", v)
                              }
                              keyboardType="numeric"
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              d) Have you been hospitalized in the last four
                              years since inception of the contract?
                            </Text>
                            <View
                              style={[
                                stylesWeb.checkbox,
                                isYesValue(form.bHosp4Y) && CHECKED_BOX_STYLE,
                              ]}
                            />
                            <Text style={stylesWeb.smallText}>Yes</Text>
                            <View
                              style={[
                                stylesWeb.checkbox,
                                isNoValue(form.bHosp4Y) && CHECKED_BOX_STYLE,
                              ]}
                            />
                            <Text style={stylesWeb.smallText}>No</Text>

                            <Text style={[stylesWeb.label, { marginLeft: 10 }]}>
                              Date:
                            </Text>
                            <CharBoxRow
                              length={4}
                              value={form.hospitalizationHistoryDate}
                              onChange={(v) =>
                                setField("hospitalizationHistoryDate", v)
                              }
                              keyboardType="numeric"
                            />
                          </View>
                        </View>

                        {/* ROW 4 */}
                        <View style={stylesWeb.rowBetweenDiagnosis}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Diagnosis:</Text>
                            <TextInput
                              style={stylesWeb.longInputWide}
                              value={form.diagnosis}
                              onChangeText={(t) => setField("diagnosis", t)}
                              placeholder=""
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              e) Previously covered by any other Mediclaim
                              /Health insurance :
                            </Text>
                            <View
                              style={[
                                stylesWeb.checkbox,
                                isYesValue(form.bPreviouslyOther) &&
                                  CHECKED_BOX_STYLE,
                              ]}
                            />
                            <Text style={stylesWeb.smallText}>Yes</Text>
                            <View
                              style={[
                                stylesWeb.checkbox,
                                isNoValue(form.bPreviouslyOther) &&
                                  CHECKED_BOX_STYLE,
                              ]}
                            />
                            <Text style={stylesWeb.smallText}>No</Text>
                          </View>
                        </View>

                        {/* ROW 5 */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            f) If yes, company name:
                          </Text>
                          <CharBoxRow
                            length={22}
                            value={form.previousMediclaimCompanyName}
                            onChange={(v) =>
                              setField("previousMediclaimCompanyName", v)
                            }
                          />
                        </View>
                      </View>

                      {/* RIGHT SIDE — SECTION B BAR */}
                      <View style={stylesWeb.sectionBar}>
                        <View style={stylesWeb.sectionLine} />
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION B</Text>
                        </View>
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DETAILS OF INSURED PERSON HOSPITALIZED:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    <View style={stylesWeb.sectionContentRow}>
                      {/* LEFT CONTENT */}
                      <View style={{ flex: 1 }}>
                        {/* a) NAME */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>a) Name:</Text>
                          <CharBoxRow
                            length={40}
                            value={form.hospitalizedName}
                            onChange={(v) => setField("hospitalizedName", v)}
                          />
                        </View>

                        {/* b + c + d */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>b) Gender</Text>
                            <Text style={stylesWeb.smallText}>Male</Text>
                            <TouchableOpacity
                              onPress={() =>
                                setField(
                                  "gender",
                                  form.gender === "male" ? "" : "male",
                                )
                              }
                              style={[
                                stylesWeb.checkbox,
                                form.gender === "male" && {
                                  backgroundColor: "#1976D2",
                                },
                              ]}
                            />
                            <Text style={stylesWeb.smallText}>Female</Text>
                            <TouchableOpacity
                              onPress={() =>
                                setField(
                                  "gender",
                                  form.gender === "female" ? "" : "female",
                                )
                              }
                              style={[
                                stylesWeb.checkbox,
                                form.gender === "female" && {
                                  backgroundColor: "#1976D2",
                                },
                              ]}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>c) Age years</Text>
                            <CharBoxRow
                              length={2}
                              value={form.ageYears}
                              onChange={(v) => setField("ageYears", v)}
                            />

                            <Text style={stylesWeb.smallText}>Months</Text>
                            <CharBoxRow
                              length={2}
                              value={form.ageMonths}
                              onChange={(v) => setField("ageMonths", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              d) Date of Birth
                            </Text>
                            <CharBoxRow
                              length={8}
                              value={form.dob}
                              onChange={(v) => setField("dob", v)}
                            />
                          </View>
                        </View>

                        {/* e) RELATIONSHIP */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            e) Relationship to Primary insured:
                          </Text>

                          {[
                            "Self",
                            "Spouse",
                            "Child",
                            "Father",
                            "Mother",
                            "Other",
                          ].map((item, i) => (
                            <React.Fragment key={i}>
                              <Text style={stylesWeb.smallText}>{item}</Text>
                              <View style={stylesWeb.checkbox} />
                            </React.Fragment>
                          ))}

                          <Text style={stylesWeb.smallText}>
                            (Please Specify)
                          </Text>
                          <TextInput
                            style={stylesWeb.longInputWide}
                            value={form.relationshipSpecify}
                            onChangeText={(t) =>
                              setField("relationshipSpecify", t)
                            }
                          />
                        </View>

                        {/* f) OCCUPATION */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>f) Occupation</Text>

                          {[
                            "Service",
                            "Self Employed",
                            "Home Maker",
                            "Student",
                            "Retired",
                            "Other",
                          ].map((item, i) => (
                            <React.Fragment key={i}>
                              <Text style={stylesWeb.smallText}>{item}</Text>
                              <View style={stylesWeb.checkbox} />
                            </React.Fragment>
                          ))}

                          <Text style={stylesWeb.smallText}>
                            (Please Specify)
                          </Text>
                          <TextInput
                            style={stylesWeb.longInputWide}
                            value={form.occupationSpecify}
                            onChangeText={(t) =>
                              setField("occupationSpecify", t)
                            }
                          />
                        </View>

                        {/* g) ADDRESS */}
                        <View style={stylesWeb.addressRow}>
                          <Text style={stylesWeb.label}>
                            g) Address (if diffrent from above):
                          </Text>

                          <View style={stylesWeb.addressBoxes}>
                            <CharBoxRow
                              length={40}
                              value={form.hospAddressRow1}
                              onChange={(v) => setField("hospAddressRow1", v)}
                            />
                            <CharBoxRow
                              length={35}
                              value={form.hospAddressRow2}
                              onChange={(v) => setField("hospAddressRow2", v)}
                            />
                          </View>
                        </View>

                        {/* CITY + STATE */}
                        <View style={stylesWeb.rowBetweens}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>City:</Text>
                            <CharBoxRow
                              length={18}
                              value={form.hospCity}
                              onChange={(v) => setField("hospCity", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>State:</Text>
                            <CharBoxRow
                              length={18}
                              value={form.hospState}
                              onChange={(v) => setField("hospState", v)}
                            />
                          </View>
                        </View>

                        {/* PIN + PHONE + EMAIL */}
                        <View style={stylesWeb.rowBetweensLast}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Pin Code:</Text>
                            <CharBoxRow
                              length={6}
                              value={form.hospPin}
                              onChange={(v) => setField("hospPin", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Phone No:</Text>
                            <CharBoxRow
                              length={10}
                              value={form.hospPhone}
                              onChange={(v) => setField("hospPhone", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Email ID:</Text>
                            <TextInput
                              style={stylesWeb.longInput}
                              value={form.hospEmail}
                              onChangeText={(t) => setField("hospEmail", t)}
                              placeholder=""
                            />
                          </View>
                        </View>
                      </View>

                      {/* RIGHT BAR */}
                      <View style={stylesWeb.sectionBar}>
                        <View style={stylesWeb.sectionLine} />
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION C</Text>
                        </View>
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DETAILS OF HOSPITALIZATION:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    <View style={stylesWeb.sectionContentRow}>
                      {/* LEFT CONTENT */}
                      <View style={{ flex: 1 }}>
                        {/* a) HOSPITAL NAME */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            a) Name of Hospital where Admitted:
                          </Text>
                          <CharBoxRow
                            length={40}
                            value={form.hospitalName}
                            onChange={(v) => setField("hospitalName", v)}
                          />
                        </View>

                        {/* b) ROOM CATEGORY */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            b) Room Category occupied:
                          </Text>

                          {[
                            "Day care",
                            "Single occupancy",
                            "Twin sharing",
                            "3 or more beds per room",
                          ].map((item, i) => (
                            <React.Fragment key={i}>
                              <Text style={stylesWeb.smallText}>{item}</Text>
                              <View style={stylesWeb.checkbox} />
                            </React.Fragment>
                          ))}
                        </View>

                        {/* c + d */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              c) Hospitalization due to:
                            </Text>

                            {["Injury", "Illness", "Maternity"].map(
                              (item, i) => (
                                <React.Fragment key={i}>
                                  <Text style={stylesWeb.smallText}>
                                    {item}
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                </React.Fragment>
                              ),
                            )}
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              d) Date of injury / Date Disease first detected
                              /Date of Delivery:
                            </Text>
                            <CharBoxRow
                              length={8}
                              value={form.injuryDate}
                              onChange={(v) => setField("injuryDate", v)}
                            />
                          </View>
                        </View>

                        {/* e + f + g + h */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              e) Date of Admission:
                            </Text>
                            <CharBoxRow
                              length={8}
                              value={form.admissionDate}
                              onChange={(v) => setField("admissionDate", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>f) Time:</Text>
                            <CharBoxRow
                              length={4}
                              value={form.admissionTime}
                              onChange={(v) => setField("admissionTime", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              g) Date of Discharge:
                            </Text>
                            <CharBoxRow
                              length={8}
                              value={form.dischargeDate}
                              onChange={(v) => setField("dischargeDate", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>h) Time:</Text>
                            <CharBoxRow
                              length={4}
                              value={form.dischargeTime}
                              onChange={(v) => setField("dischargeTime", v)}
                            />
                          </View>
                        </View>

                        {/* i + ii + iii */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              i) If injury give cause:
                            </Text>

                            {[
                              "Self inflicted",
                              "Road Traffic Accident",
                              "Substance Abuse / Alcohol Consumption",
                            ].map((item, i) => (
                              <React.Fragment key={i}>
                                <Text style={stylesWeb.smallText}>{item}</Text>
                                <View style={stylesWeb.checkbox} />
                              </React.Fragment>
                            ))}
                          </View>
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              ii) Reported to Police
                            </Text>
                            <View style={stylesWeb.checkbox} />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              iii. MLC Report & Police FIR attached
                            </Text>
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>Yes</Text>
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>No</Text>
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              j) System of Medicine:
                            </Text>
                            <TextInput
                              style={stylesWeb.longInputWide}
                              value={form.treatingDoctor}
                              onChangeText={(t) =>
                                setField("treatingDoctor", t)
                              }
                              placeholder=""
                            />
                          </View>
                        </View>
                      </View>

                      {/* RIGHT BAR */}
                      <View style={stylesWeb.sectionBar}>
                        <View style={stylesWeb.sectionLine} />
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION D</Text>
                        </View>
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DETAILS OF CLAIM:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    <View style={stylesWeb.sectionContentRow}>
                      {/* LEFT CONTENT */}
                      <View style={{ flex: 1 }}>
                        {/* a) TREATMENT EXPENSES */}
                        <Text style={stylesWeb.label}>
                          a) Details of the Treatment expenses claimed
                        </Text>

                        {/* ROWS */}
                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            i. Pre-hospitalization expenses Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimPre}
                            onChange={(v) => setField("claimPre", v)}
                          />

                          <Text style={stylesWeb.label}>
                            ii. Hospitalization expenses Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimHospital}
                            onChange={(v) => setField("claimHospital", v)}
                          />
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            iii. Post-hospitalization expenses Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimPost}
                            onChange={(v) => setField("claimPost", v)}
                          />

                          <Text style={stylesWeb.label}>
                            iv. Health-Check up cost Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimHealthCheckup}
                            onChange={(v) => setField("claimHealthCheckup", v)}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            v. Ambulance Charges Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimAmbulance}
                            onChange={(v) => setField("claimAmbulance", v)}
                            keyboardType="numeric"
                          />

                          <Text style={stylesWeb.label}>
                            vi. Others (code):
                          </Text>
                          <CharBoxRow
                            length={3}
                            value={form.claimOtherCode}
                            onChange={(v) => setField("claimOtherCode", v)}
                          />

                          <Text style={stylesWeb.label}>Rs.</Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimOtherAmount}
                            onChange={(v) => setField("claimOtherAmount", v)}
                            keyboardType="numeric"
                          />
                        </View>

                        {/* TOTAL */}
                        <View style={stylesWeb.inlineRows}>
                          <Text
                            style={[
                              stylesWeb.label,
                              {
                                fontWeight: "500",
                                fontSize: 30,
                                justifyContent: "flex-end",
                              },
                            ]}
                          >
                            Total Rs.
                          </Text>
                          <CharBoxRow
                            length={10}
                            value={form.claimTotal}
                            onChange={(v) => setField("claimTotal", v)}
                            boxStyle={stylesWeb.squareBoxs}
                            keyboardType="numeric"
                          />
                        </View>

                        {/* PERIOD */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              vii. Pre-hospitalization period: days
                            </Text>
                            <CharBoxRow
                              length={3}
                              value={form.claimPreHospitalDays}
                              onChange={(v) =>
                                setField("claimPreHospitalDays", v)
                              }
                              keyboardType="numeric"
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              viii. Post-hospitalization period: days
                            </Text>
                            <CharBoxRow
                              length={3}
                              value={form.claimPostHospitalDays}
                              onChange={(v) =>
                                setField("claimPostHospitalDays", v)
                              }
                              keyboardType="numeric"
                            />
                          </View>
                        </View>

                        {/* DOMICILIARY */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            b) Claim for Domiciliary Hospitalization:
                          </Text>
                          <View style={stylesWeb.checkbox} />
                          <Text style={stylesWeb.smallText}>Yes</Text>
                          <View style={stylesWeb.checkbox} />
                          <Text style={stylesWeb.smallText}>No</Text>
                          <Text style={stylesWeb.smallText}>
                            (If yes, provide details in annexure)
                          </Text>
                        </View>

                        {/* CASH BENEFITS */}
                        <Text style={stylesWeb.label}>
                          c) Details of Lump sum / cash benefit claimed:
                        </Text>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            i. Hospital Daily cash Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimHospitalDailyCash}
                            onChange={(v) =>
                              setField("claimHospitalDailyCash", v)
                            }
                            keyboardType="numeric"
                          />

                          <Text style={stylesWeb.label}>
                            ii. Surgical Cash Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimSurgicalCash}
                            onChange={(v) => setField("claimSurgicalCash", v)}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            iii. Critical Illness benefit Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimCriticalIllness}
                            onChange={(v) =>
                              setField("claimCriticalIllness", v)
                            }
                            keyboardType="numeric"
                          />

                          <Text style={stylesWeb.label}>
                            iv. Convalescence Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimConvalescence}
                            onChange={(v) => setField("claimConvalescence", v)}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            v. Pre/Post hospitalization Lump sum benefit Rs.
                          </Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimPrePostBenefit}
                            onChange={(v) => setField("claimPrePostBenefit", v)}
                            keyboardType="numeric"
                          />

                          <Text style={stylesWeb.label}>vi. Others Rs.</Text>
                          <CharBoxRow
                            length={8}
                            value={form.claimOtherBenefit}
                            onChange={(v) => setField("claimOtherBenefit", v)}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      {/* RIGHT CHECKLIST */}
                      <View style={stylesWeb.sectionEChecklist}>
                        <Text style={stylesWeb.label}>
                          Claim Documents Submitted - Check List:
                        </Text>

                        {[
                          "Claim form duly signed",
                          "Copy of the claim intimation, if any",
                          "Hospital Main Bill",
                          "Hospital Break-up Bill",
                          "Hospital Bill Payment Receipt",
                          "Hospital Discharge Summary",
                          "Pharmacy Bill",
                          "Operation Theater Notes",
                          "ECG",
                          "Doctors request for investigation",
                          "Investigation Reports (Including CT MRI / USG / HPE)",
                          "Doctors Prescriptions",
                          "Others",
                        ].map((item, i) => (
                          <View key={i} style={stylesWeb.inlineRow}>
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>{item}</Text>
                          </View>
                        ))}
                      </View>

                      {/* RIGHT BAR */}
                      <View style={stylesWeb.sectionBar}>
                        <View style={stylesWeb.sectionLine} />
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION E</Text>
                        </View>
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DETAILS OF BILLS ENCLOSED:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    <View style={stylesWeb.sectionContentRow}>
                      {/* TABLE */}
                      <BillsTableEditor
                        billRows={form.billRows}
                        onBillChange={setBillField}
                      />

                      {/* RIGHT BAR */}
                      <View style={stylesWeb.sectionBar}>
                        <View style={stylesWeb.sectionLine} />
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION F</Text>
                        </View>
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DETAILS OF PRIMARY INSURED’S BANK ACCOUNT:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    <View style={stylesWeb.sectionContentRow}>
                      {/* LEFT CONTENT */}
                      <View style={{ flex: 1 }}>
                        {/* ROW 1 */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>a) PAN:</Text>
                            <CharBoxRow
                              length={10}
                              value={form.pan}
                              onChange={(v) => setField("pan", v)}
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              b) Account Number:
                            </Text>
                            <CharBoxRow
                              length={22}
                              value={form.accountNumber}
                              onChange={(v) => setField("accountNumber", v)}
                            />
                          </View>
                        </View>

                        {/* ROW 2 */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            c) Bank Name and Branch:
                          </Text>
                          <CharBoxRow
                            length={40}
                            value={form.bankNameBranch}
                            onChange={(v) => setField("bankNameBranch", v)}
                          />
                        </View>

                        {/* ROW 3 */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              d) Cheque / DD Payable details:
                            </Text>
                            <TextInput
                              style={stylesWeb.longInputWide}
                              value={form.chequeDetails}
                              onChangeText={(t) => setField("chequeDetails", t)}
                              placeholder=""
                            />
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>e) IFSC Code:</Text>
                            <CharBoxRow
                              length={11}
                              value={form.ifscCode}
                              onChange={(v) => setField("ifscCode", v)}
                            />
                          </View>
                        </View>
                      </View>

                      {/* RIGHT BAR */}
                      <View style={stylesWeb.sectionBar}>
                        <View style={stylesWeb.sectionLine} />
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION G</Text>
                        </View>
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>

                  <View style={stylesWeb.sectionContainer}>
                    {/* DIVIDER */}
                    <View style={stylesWeb.dividerRow}>
                      <View style={stylesWeb.line} />
                      <Text style={stylesWeb.dividerText}>
                        DECLARATION BY THE INSURED:
                      </Text>
                      <View style={stylesWeb.line} />
                    </View>

                    <View style={stylesWeb.sectionContentRow}>
                      {/* LEFT CONTENT */}
                      <View style={{ flex: 1 }}>
                        {/* PARAGRAPH */}
                        <Text style={stylesWeb.declarationText}>
                          I hereby declare that the information furnished in the
                          claim form is true & correct to the best of my
                          knowledge and belief. If I have made any false or
                          untrue statement, suppression or concealment of any
                          material fact with respect to questions asked in
                          relation to this claim, my right to claim
                          reimbursement shall be forfeited. I also consent &
                          authorize TPA / insurance Company, to seek necessary
                          medical information / documents from any hospital /
                          Medical Practitioner who has attended on the person
                          against whom this claim is made. I hereby declare that
                          I have included all the bills / receipts for the
                          purpose of this claim & that I will not be making any
                          supplementary claim, except the
                          pre/post-hospitalization claim, if any.
                        </Text>

                        {/* DATE + PLACE + SIGNATURE */}
                        <View style={stylesWeb.rowBetween}>
                          {/* DATE */}
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Date</Text>
                            <CharBoxRow
                              length={8}
                              value={form.declarationDate}
                              onChange={(v) => setField("declarationDate", v)}
                            />
                          </View>

                          {/* PLACE */}
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Place:</Text>
                            <TextInput
                              style={stylesWeb.placeInput}
                              value={form.declarationPlace}
                              onChangeText={(t) =>
                                setField("declarationPlace", t)
                              }
                              placeholder=""
                            />
                          </View>

                          {/* SIGNATURE */}
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              Signature of the Insured
                            </Text>
                            <TouchableOpacity
                              style={stylesWeb.signatureBox}
                              onPress={() =>
                                navigation.navigate("SignatureScreen", {
                                  onSave: (uri) => setSignatureImage(uri),
                                })
                              }
                              activeOpacity={0.7}
                            >
                              {signatureImage ? (
                                <Image
                                  source={{ uri: signatureImage }}
                                  style={stylesWeb.signatureImage}
                                  resizeMode="contain"
                                />
                              ) : (
                                <Text style={stylesWeb.signaturePlaceholder}>
                                  Tap to sign
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* FOOTER NOTE */}
                        <View style={stylesWeb.footerDivider} />
                        <Text style={stylesWeb.footerNote}>
                          (IMPORTANT: PLEASE TURN OVER)
                        </Text>
                      </View>

                      {/* RIGHT BAR */}
                      <View style={stylesWeb.sectionBar}>
                        <View style={stylesWeb.sectionLine} />
                        <View style={stylesWeb.sectionTextWrap}>
                          <Text style={stylesWeb.sectionText}>SECTION H</Text>
                        </View>
                        <View style={stylesWeb.sectionLine} />
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* BUTTONS */}
            <TouchableOpacity style={stylesMobile.outlineBtn}>
              <Text style={stylesMobile.outlineText}>Open in editor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                stylesMobile.primaryBtn,
                isDownloading && { opacity: 0.6 },
              ]}
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={stylesMobile.primaryText}>
                  Download updated claim
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={stylesMobile.greenOutlineBtn}>
              <Text style={stylesMobile.greenOutlineText}>
                Analyze another claim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={stylesMobile.greenBtn}>
              <Text style={stylesMobile.greenText}>
                Set up date Integration
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
}
const stylesMobile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  header: {
    zIndex: 2,
  },

  logo: {
    fontSize: 14,
    fontWeight: "600",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    paddingLeft: "2% ",
  },

  infoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  infoText: {
    fontSize: 12,
    color: "#1E3A8A",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 18,
  },

  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  fileName: {
    marginLeft: 8,
    fontSize: 13,
    color: "#1976D2",
    fontWeight: "500",
  },

  cardText: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },

  link: {
    color: "#2E7D32",
    fontWeight: "500",
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  outlineText: {
    fontSize: 14,
    color: "#333",
  },

  primaryBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  greenOutlineBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#E8F5E9",
  },

  greenOutlineText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },

  greenBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },

  greenText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardScroll: {
    height: 250, // 🔥 adjust based on UI (150–220 looks good)
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },

  label: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  box: {
    width: 18,
    height: 22,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 10,
    padding: 0,
  },

  fullInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 6,
    fontSize: 12,
    marginBottom: 6,
  },
});
const stylesWeb = StyleSheet.create({
  root: {
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
  mainRow: {
    flexDirection: "row",
    height: "100%",
    zIndex: 2,
  },
  sidebar: {
    width: "15%",
  },
  content: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },
  headerRow: {
    marginBottom: 16,
  },

  /* ── CARD ── */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    marginTop: "4%",
  },

  /* ── CARD TITLE ROW ── */
  previewFrameContainer: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  previewFrame: {
    width: "100%",
    border: "none",
    display: "block",
    backgroundColor: "#fff",
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
    marginBottom: 6,
    flexShrink: 0,
  },
  cardTitle: { fontSize: 19, fontWeight: "700", color: "#111827" },
  backToHomeBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  backToHomeBtnText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  /* ── STEP BAR ── */
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepCircleDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepTick: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepCircleInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    borderColor: "#2563EB",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  stepNumActive: {
    color: "#2563EB",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepLabelActive: {
    color: "#2563EB",
  },
  stepSub: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },
  stepConnector: {
    height: 2,
    width: 32,
    backgroundColor: "#2563EB",
    marginHorizontal: 6,
    alignSelf: "center",
    flexShrink: 0,
  },
  formHeaderContainer: {
    paddingVertical: 10,
  },

  formTopRow: {
    flexDirection: "row",
    alignItems: "center", // 🔥 aligns logo + title perfectly same line
    justifyContent: "space-between",
  },

  logoRow: {
    flexDirection: "column",
    alignItems: "center",
    width: "20%",
  },

  logo: {
    width: 65,
    height: 60,
    marginRight: 6,
  },

  logoText: {
    fontSize: 16,
    color: "#2F5597",
    fontWeight: "500",
  },

  centerTitleBlock: {
    width: "60%",
    alignItems: "center",
  },

  formMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  formSubTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
    color: "#000",
  },

  formNoteCenter: {
    fontSize: 13,
    marginTop: 2,
    color: "#000",
    textAlign: "center",
    fontWeight: "600",
  },

  formNoteRight: {
    flex: 1,
    fontSize: 12,
    textAlign: "right",
    color: "#000",
    paddingRight: 10,
    whiteSpace: "nowrap",
    fontWeight: "700",
  },
  sectionContainer: {
    marginTop: 0,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#000",
  },

  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "700",
  },

  sectionContentRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  rowBetween: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  rowBetweenDiagnosis: {
    flexDirection: "row",
    gap: 120,
    marginBottom: 6,
  },
  rowBetweens: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 6,
    marginLeft: "7%",
  },
  rowBetweensLast: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 6,
    marginLeft: "7%",
  },

  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  inlineRows: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginBottom: 6,
  },

  label: {
    fontSize: 11,
    marginRight: 6,
  },

  boxRow: {
    flexDirection: "row",
  },

  boxWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "85%",
  },

  squareBox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 10,
    padding: 0,
  },
  squareBoxs: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 10,
    padding: 0,
  },

  longInput: {
    width: 180,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
  },
  sectionBar: {
    width: 28,
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 0,
    backgroundColor: "#000",
    paddingVertical: 2,
    overflow: "hidden",
  },

  sectionLine: {
    flex: 1,
    width: 10,
    backgroundColor: "#fff",
    marginVertical: 0,
  },

  sectionTextWrap: {
    paddingVertical: 19, // 🔥 more gap from black bars
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  sectionText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    transform: [{ rotate: "90deg" }],
    whiteSpace: "nowrap", // 🔥 prevent breaking
  },
  addressContainer: {
    flexDirection: "column",
    marginLeft: 2, // 🔥 tiny gap after label (aligns perfectly)
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start", // 🔥 KEY: aligns label with FIRST ROW (top)
    marginBottom: 6,
  },

  addressBoxes: {
    flexDirection: "column",
    marginLeft: 6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#000",
    marginHorizontal: 4,
  },

  smallText: {
    fontSize: 11,
    marginRight: 6,
  },

  longInputWide: {
    width: 300,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    paddingHorizontal: 4,
  },
  sectionEChecklist: {
    width: 260,
    marginLeft: 10,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    borderBottomWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 32,
  },

  tableCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 11,
    justifyContent: "center",
  },
  tableTextInput: {
    width: "100%",
    minHeight: 22,
    fontSize: 11,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  squareBoxSmall: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 9,
    padding: 0,
  },
  tableInnerCell: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  tableCellSmall: {
    width: 20, // 🔥 controls grid density
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 9,
  },
  tableCharRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  declarationText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
    textAlign: "left",
  },

  placeInput: {
    width: 200,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
  },

  signatureBox: {
    width: 220,
    height: 40,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  signatureImage: {
    width: "100%",
    height: "100%",
  },
  signaturePlaceholder: {
    fontSize: 10,
    color: "#aaa",
    fontStyle: "italic",
  },

  footerNote: {
    textAlign: "right",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "600",
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#000",
    marginTop: 10,
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 16,
    paddingHorizontal: 10,
    marginLeft: "2%",
    marginRight: "2%",
  },

  outlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  outlineTextWeb: {
    fontSize: 14,
    color: "#333",
  },

  primaryBtnWeb: {
    backgroundColor: "#1565C0",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryTextWeb: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  greenOutlineBtnWeb: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#E8F5E9",
  },

  greenOutlineTextWeb: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },

  greenBtnWeb: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },

  greenTextWeb: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  headerSub: {
    fontSize: 10,
    textAlign: "center",
  },

  blackBar: {
    backgroundColor: "#222",
    marginTop: 6,
    paddingVertical: 6,
  },

  blackBarText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },

  headerRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  centerText: {
    textAlign: "center",
    fontWeight: "600",
  },

  centerSub: {
    textAlign: "center",
    fontSize: 11,
  },

  rightNote: {
    fontSize: 10,
  },
});
