/**
 * Hospital portal: preview, edit, and download Medi Assist Claim Form Part B (hospital section).
 * @see ../utils/MediAssistFormB.js for HTML/PDF generation.
 * Autofill mapping (buildInitialFormB from analysisData) is intentionally left for a future ticket.
 */
import React, { useState, useMemo, useCallback, useRef } from "react";
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
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  downloadMediAssistFormB,
  generateMediAssistFormBHTML,
} from "../../utils/MediAssistFormB";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";

/* ─────────────────────────────────────────────
   HELPERS (local copies — no cross-screen dep)
───────────────────────────────────────────── */
function padChars(s, len) {
  const t = String(s ?? "");
  return t.padEnd(len, " ").slice(0, len);
}

/** Returns a blank Form B state. All values empty / false / empty-arrays. */
function buildInitialFormB() {
  return {
    /* Section A – Hospital details */
    hospitalName: padChars("", 50),
    hospitalId: padChars("", 20),
    hospitalNetwork: "",               // "network" | "non_network" | ""
    treatingDoctorSurname: padChars("", 18),
    treatingDoctorFirst: padChars("", 12),
    treatingDoctorMiddle: padChars("", 12),
    qualification: "",
    registrationNoStateCode: padChars("", 14),
    phoneNo: padChars("", 11),

    /* Section B – Patient details */
    patientSurname: padChars("", 18),
    patientFirst: padChars("", 16),
    patientMiddle: padChars("", 14),
    ipRegNumber: padChars("", 15),
    gender: "",                        // "male" | "female" | ""
    ageYears: padChars("", 2),
    ageMonths: padChars("", 2),
    dob: padChars("", 6),
    admissionDate: padChars("", 8),
    admissionTime: padChars("", 4),
    dischargeDate: padChars("", 8),
    dischargeTime: padChars("", 4),
    typeOfAdmission: "",               // "emergency" | "planned" | "day_care" | "maternity"
    dateOfDelivery: padChars("", 6),
    gravidaStatus: padChars("", 4),
    dischargeStatus: "",               // "home" | "another_hospital" | "deceased"
    totalClaimedAmount: "",

    /* Section C – Ailment / diagnoses */
    diagnoses: Array(4).fill(null).map(() => ({ icd10: "", description: "" })),
    procedures: Array(4).fill(null).map(() => ({ icd10pcs: "", description: "" })),
    preAuthObtained: "",               // "yes" | "no"
    preAuthNumber: padChars("", 18),
    preAuthMissingReason: "",
    injuryHospitalization: "",         // "yes" | "no"
    injurySelf: false,
    injuryRTA: false,
    injurySubstance: false,
    substanceTestDone: "",             // "yes" | "no"
    medicoLegal: "",                   // "yes" | "no"
    reportedPolice: "",                // "yes" | "no"
    firNumber: padChars("", 12),
    firNotReportedReason: "",

    /* Section D – Checklist (16 items: 8 left + 8 right) */
    claimDocChecklist: Array(16).fill(false),

    /* Section E – Non-network hospital */
    nonNetAddress1: padChars("", 45),
    nonNetAddress2: padChars("", 50),
    nonNetCity: "",
    nonNetState: "",
    nonNetPin: padChars("", 6),
    nonNetPhone: padChars("", 10),
    nonNetRegStateCode: padChars("", 14),
    hospitalPan: padChars("", 10),
    inpatientBeds: padChars("", 5),
    facilityOT: "",                    // "yes" | "no"
    facilityICU: "",                   // "yes" | "no"
    otherFacilities: "",

    /* Section F – Declaration */
    declarationDate: padChars("", 8),
    declarationPlace: "",
  };
}

/* ─────────────────────────────────────────────
   CharBoxRow — editable grid of single-char boxes
───────────────────────────────────────────── */
function CharBoxRow({ length, value, onChange, boxStyle, rowStyle, keyboardType }) {
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
    <View style={rowStyle || styles.boxRow}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          style={boxStyle || styles.squareBox}
          maxLength={1}
          keyboardType={keyboardType}
          value={chars[i] === " " ? "" : chars[i]}
          onChangeText={(t) => handleCell(i, t)}
        />
      ))}
    </View>
  );
}

/* ─────────────────────────────────────────────
   YesNoRow — two-button Yes/No toggle
───────────────────────────────────────────── */
function YesNoRow({ value, onChange }) {
  return (
    <View style={styles.inlineRow}>
      <TouchableOpacity
        style={[styles.yesNoBtn, value === "yes" && styles.yesNoBtnActive]}
        onPress={() => onChange(value === "yes" ? "" : "yes")}
      >
        <Text style={[styles.yesNoText, value === "yes" && styles.yesNoTextActive]}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.yesNoBtn, value === "no" && styles.yesNoBtnActive]}
        onPress={() => onChange(value === "no" ? "" : "no")}
      >
        <Text style={[styles.yesNoText, value === "no" && styles.yesNoTextActive]}>No</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─────────────────────────────────────────────
   NetworkToggle — Network / Non-Network
───────────────────────────────────────────── */
function NetworkToggle({ value, onChange }) {
  return (
    <View style={styles.inlineRow}>
      {["network", "non_network"].map((v) => (
        <TouchableOpacity
          key={v}
          style={[styles.yesNoBtn, value === v && styles.yesNoBtnActive]}
          onPress={() => onChange(value === v ? "" : v)}
        >
          <Text style={[styles.yesNoText, value === v && styles.yesNoTextActive]}>
            {v === "network" ? "Network" : "Non Network"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ─────────────────────────────────────────────
   SectionBar — vertical label strip
───────────────────────────────────────────── */
function SectionBar({ label }) {
  return (
    <View style={styles.sectionBar}>
      <View style={styles.sectionLine} />
      <View style={styles.sectionTextWrap}>
        <Text style={styles.sectionText}>{label}</Text>
      </View>
      <View style={styles.sectionLine} />
    </View>
  );
}

/* ─────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────── */
export default function MediAssistFormB({ navigation, route }) {
  const { width } = useWindowDimensions();
  const [form, setForm] = useState(() => buildInitialFormB());
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [signatureImage, setSignatureImage] = useState(null);
  const formRef = useRef(null);

  const htmlPreview = useMemo(
    () => generateMediAssistFormBHTML(form, signatureImage),
    [form, signatureImage],
  );

  const setField = useCallback((key, v) => {
    setForm((prev) => ({ ...prev, [key]: v }));
  }, []);

  const setDiagnosis = useCallback((idx, subKey, v) => {
    setForm((prev) => {
      const next = prev.diagnoses.map((r, i) => i === idx ? { ...r, [subKey]: v } : r);
      return { ...prev, diagnoses: next };
    });
  }, []);

  const setProcedure = useCallback((idx, subKey, v) => {
    setForm((prev) => {
      const next = prev.procedures.map((r, i) => i === idx ? { ...r, [subKey]: v } : r);
      return { ...prev, procedures: next };
    });
  }, []);

  const toggleChecklist = useCallback((idx) => {
    setForm((prev) => {
      const next = [...prev.claimDocChecklist];
      next[idx] = !next[idx];
      return { ...prev, claimDocChecklist: next };
    });
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadMediAssistFormB(form, signatureImage);
    } catch {
      Alert.alert("Download Error", "Could not generate the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  /* ── SECTION LABELS ── */
  const diagLabels = ["i. Primary Diagnosis", "ii. Additional Diagnosis", "iii. Co-morbidities", "iv. Co-morbidities"];
  const procLabels = ["i. Procedure 1:", "ii. Procedure 2:", "iii. Procedure 3:", "iv. Details of Procedure:"];
  const checklistLeft = [
    "Claim Form duly signed",
    "Original Pre-authorization request",
    "Copy of the Pre-authorization approval letter",
    "Copy of Photo ID Card of patient Verified by hospital",
    "Hospital Discharge summary",
    "Operation Theatre Notes",
    "Hospital main bill",
    "Hospital break-up bill",
  ];
  const checklistRight = [
    "Investigation reports",
    "CT/MRI/USG/HPE Investigation reports",
    "Doctor's reference slip for investigation",
    "ECG",
    "Pharmacy bills",
    "MLC reports & Police FIR",
    "Original death summary from hospital where applicable",
    "Any other, please specify",
  ];

  /* ── EDIT FORM (shared between web and mobile) ── */
  const EditForm = () => (
    <ScrollView>
      <View ref={formRef} style={{ padding: 8 }}>

        {/* ── HEADER ── */}
        <Text style={styles.formTitle}>CLAIM FORM – PART B</Text>
        <Text style={[styles.sectionTitle, { textAlign: "center", fontWeight: "400", fontSize: 11 }]}>
          TO BE FILLED IN BY THE HOSPITAL
        </Text>

        {/* ── SECTION A ── */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>DETAILS OF HOSPITAL</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={{ flex: 1 }}>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>a) Name of the hospital:</Text>
              <CharBoxRow length={50} value={form.hospitalName} onChange={(v) => setField("hospitalName", v)} />
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>b) Hospital ID:</Text>
              <CharBoxRow length={20} value={form.hospitalId} onChange={(v) => setField("hospitalId", v)} />
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>c) Type of Hospital:</Text>
              <NetworkToggle value={form.hospitalNetwork} onChange={(v) => setField("hospitalNetwork", v)} />
            </View>

            <Text style={styles.label}>d) Name of treating doctor:</Text>
            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.smallLabel}>Surname:</Text>
                <CharBoxRow length={18} value={form.treatingDoctorSurname} onChange={(v) => setField("treatingDoctorSurname", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.smallLabel}>First:</Text>
                <CharBoxRow length={12} value={form.treatingDoctorFirst} onChange={(v) => setField("treatingDoctorFirst", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.smallLabel}>Middle:</Text>
                <CharBoxRow length={12} value={form.treatingDoctorMiddle} onChange={(v) => setField("treatingDoctorMiddle", v)} />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>e) Qualification:</Text>
              <TextInput style={styles.longInput} value={form.qualification} onChangeText={(t) => setField("qualification", t)} />
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>f) Reg. No. with State Code:</Text>
                <CharBoxRow length={14} value={form.registrationNoStateCode} onChange={(v) => setField("registrationNoStateCode", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>g) Phone No.:</Text>
                <CharBoxRow length={11} value={form.phoneNo} onChange={(v) => setField("phoneNo", v)} />
              </View>
            </View>

          </View>
          <SectionBar label="SECTION A" />
        </View>

        {/* ── SECTION B ── */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>DETAILS OF THE PATIENT ADMITTED</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={{ flex: 1 }}>

            <Text style={styles.label}>a) Name of the Patient:</Text>
            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.smallLabel}>Surname:</Text>
                <CharBoxRow length={18} value={form.patientSurname} onChange={(v) => setField("patientSurname", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.smallLabel}>First:</Text>
                <CharBoxRow length={16} value={form.patientFirst} onChange={(v) => setField("patientFirst", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.smallLabel}>Middle:</Text>
                <CharBoxRow length={14} value={form.patientMiddle} onChange={(v) => setField("patientMiddle", v)} />
              </View>
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>b) IP Reg. Number:</Text>
                <CharBoxRow length={15} value={form.ipRegNumber} onChange={(v) => setField("ipRegNumber", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>c) Gender:</Text>
                {["male", "female"].map((g) => (
                  <TouchableOpacity key={g} style={[styles.yesNoBtn, form.gender === g && styles.yesNoBtnActive]}
                    onPress={() => setField("gender", form.gender === g ? "" : g)}>
                    <Text style={[styles.yesNoText, form.gender === g && styles.yesNoTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>d) Age: Years</Text>
                <CharBoxRow length={2} value={form.ageYears} onChange={(v) => setField("ageYears", v)} keyboardType="numeric" />
                <Text style={styles.label}>Months</Text>
                <CharBoxRow length={2} value={form.ageMonths} onChange={(v) => setField("ageMonths", v)} keyboardType="numeric" />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>e) Date of birth (DDMMYY):</Text>
                <CharBoxRow length={6} value={form.dob} onChange={(v) => setField("dob", v)} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>f) Date of Admission (DDMMYYYY):</Text>
                <CharBoxRow length={8} value={form.admissionDate} onChange={(v) => setField("admissionDate", v)} keyboardType="numeric" />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>g) Time (HHMM):</Text>
                <CharBoxRow length={4} value={form.admissionTime} onChange={(v) => setField("admissionTime", v)} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>h) Date of Discharge (DDMMYYYY):</Text>
                <CharBoxRow length={8} value={form.dischargeDate} onChange={(v) => setField("dischargeDate", v)} keyboardType="numeric" />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>i) Time (HHMM):</Text>
                <CharBoxRow length={4} value={form.dischargeTime} onChange={(v) => setField("dischargeTime", v)} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>j) Type of Admission:</Text>
              {[["emergency", "Emergency"], ["planned", "Planned"], ["day_care", "Day Care"], ["maternity", "Maternity"]].map(([v, lbl]) => (
                <TouchableOpacity key={v} style={[styles.yesNoBtn, form.typeOfAdmission === v && styles.yesNoBtnActive]}
                  onPress={() => setField("typeOfAdmission", form.typeOfAdmission === v ? "" : v)}>
                  <Text style={[styles.yesNoText, form.typeOfAdmission === v && styles.yesNoTextActive]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>l) Date of Delivery (DDMMYY):</Text>
                <CharBoxRow length={6} value={form.dateOfDelivery} onChange={(v) => setField("dateOfDelivery", v)} keyboardType="numeric" />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>m) Gravida Status:</Text>
                <CharBoxRow length={4} value={form.gravidaStatus} onChange={(v) => setField("gravidaStatus", v)} />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>Status at discharge:</Text>
              {[["home", "Discharge to home"], ["another_hospital", "Another hospital"], ["deceased", "Deceased"]].map(([v, lbl]) => (
                <TouchableOpacity key={v} style={[styles.yesNoBtn, form.dischargeStatus === v && styles.yesNoBtnActive]}
                  onPress={() => setField("dischargeStatus", form.dischargeStatus === v ? "" : v)}>
                  <Text style={[styles.yesNoText, form.dischargeStatus === v && styles.yesNoTextActive]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>m) Total claimed amount:</Text>
              <TextInput style={styles.longInput} value={form.totalClaimedAmount}
                onChangeText={(t) => setField("totalClaimedAmount", t)} keyboardType="numeric" />
            </View>

          </View>
          <SectionBar label="SECTION B" />
        </View>

        {/* ── SECTION C ── */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>DETAILS OF AILMENT DIAGNOSED (PRIMARY)</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={{ flex: 1 }}>

            <Text style={styles.sectionSubTitle}>a) Diagnoses (ICD 10)</Text>
            {form.diagnoses.map((d, i) => (
              <View key={i} style={styles.icdRow}>
                <Text style={styles.smallLabel}>{diagLabels[i]}</Text>
                <CharBoxRow length={7} value={d.icd10} onChange={(v) => setDiagnosis(i, "icd10", v)} />
                <TextInput style={styles.icdDesc} value={d.description}
                  onChangeText={(t) => setDiagnosis(i, "description", t)} placeholder="Description" />
              </View>
            ))}

            <Text style={[styles.sectionSubTitle, { marginTop: 8 }]}>b) Procedures (ICD 10 PCS)</Text>
            {form.procedures.map((p, i) => (
              <View key={i} style={styles.icdRow}>
                <Text style={styles.smallLabel}>{procLabels[i]}</Text>
                {i < 3 && <CharBoxRow length={7} value={p.icd10pcs} onChange={(v) => setProcedure(i, "icd10pcs", v)} />}
                <TextInput style={styles.icdDesc} value={p.description}
                  onChangeText={(t) => setProcedure(i, "description", t)} placeholder="Description" />
              </View>
            ))}

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>c) Pre-authorization obtained:</Text>
                <YesNoRow value={form.preAuthObtained} onChange={(v) => setField("preAuthObtained", v)} />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>d) Pre-authorization Number:</Text>
              <CharBoxRow length={18} value={form.preAuthNumber} onChange={(v) => setField("preAuthNumber", v)} />
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>e) If not obtained, reason:</Text>
              <TextInput style={styles.longInputWide} value={form.preAuthMissingReason}
                onChangeText={(t) => setField("preAuthMissingReason", t)} />
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>f) Hospitalization due to injury:</Text>
              <YesNoRow value={form.injuryHospitalization} onChange={(v) => setField("injuryHospitalization", v)} />
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>If Yes, cause:</Text>
              {[["injurySelf", "Self-inflicted"], ["injuryRTA", "Road Traffic Accident"], ["injurySubstance", "Substance abuse"]].map(([k, lbl]) => (
                <TouchableOpacity key={k} style={[styles.yesNoBtn, form[k] && styles.yesNoBtnActive]}
                  onPress={() => setField(k, !form[k])}>
                  <Text style={[styles.yesNoText, form[k] && styles.yesNoTextActive]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>Substance test conducted:</Text>
                <YesNoRow value={form.substanceTestDone} onChange={(v) => setField("substanceTestDone", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>Medico legal:</Text>
                <YesNoRow value={form.medicoLegal} onChange={(v) => setField("medicoLegal", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>Reported to police:</Text>
                <YesNoRow value={form.reportedPolice} onChange={(v) => setField("reportedPolice", v)} />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>v. FIR No.:</Text>
              <CharBoxRow length={12} value={form.firNumber} onChange={(v) => setField("firNumber", v)} />
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>vi. If not reported to police, reason:</Text>
              <TextInput style={styles.longInputWide} value={form.firNotReportedReason}
                onChangeText={(t) => setField("firNotReportedReason", t)} />
            </View>

          </View>
          <SectionBar label="SECTION C" />
        </View>

        {/* ── SECTION D – CHECKLIST ── */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>CLAIM DOCUMENTS SUBMITTED - CHECK LIST</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={{ flex: 1 }}>
            <View style={styles.rowWrap}>
              <View style={{ flex: 1 }}>
                {checklistLeft.map((item, i) => (
                  <TouchableOpacity key={i} style={styles.checkRow} onPress={() => toggleChecklist(i)}>
                    <View style={[styles.checkbox, form.claimDocChecklist[i] && styles.checkboxChecked]}>
                      {form.claimDocChecklist[i] && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkLabel}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {checklistRight.map((item, i) => (
                  <TouchableOpacity key={i} style={styles.checkRow} onPress={() => toggleChecklist(i + 8)}>
                    <View style={[styles.checkbox, form.claimDocChecklist[i + 8] && styles.checkboxChecked]}>
                      {form.claimDocChecklist[i + 8] && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkLabel}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <SectionBar label="SECTION D" />
        </View>

        {/* ── SECTION E – NON-NETWORK ── */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>NON-NETWORK HOSPITAL DETAILS (ONLY IF APPLICABLE)</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={{ flex: 1 }}>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>a) Address (line 1):</Text>
              <CharBoxRow length={45} value={form.nonNetAddress1} onChange={(v) => setField("nonNetAddress1", v)} />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>Address (line 2):</Text>
              <CharBoxRow length={50} value={form.nonNetAddress2} onChange={(v) => setField("nonNetAddress2", v)} />
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>City:</Text>
                <TextInput style={styles.longInput} value={form.nonNetCity} onChangeText={(t) => setField("nonNetCity", t)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>State:</Text>
                <TextInput style={styles.longInput} value={form.nonNetState} onChangeText={(t) => setField("nonNetState", t)} />
              </View>
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>Pin Code:</Text>
                <CharBoxRow length={6} value={form.nonNetPin} onChange={(v) => setField("nonNetPin", v)} keyboardType="numeric" />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>b) Phone No.:</Text>
                <CharBoxRow length={10} value={form.nonNetPhone} onChange={(v) => setField("nonNetPhone", v)} keyboardType="phone-pad" />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>c) Reg. No. with State Code:</Text>
              <CharBoxRow length={14} value={form.nonNetRegStateCode} onChange={(v) => setField("nonNetRegStateCode", v)} />
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>d) Hospital PAN:</Text>
                <CharBoxRow length={10} value={form.hospitalPan} onChange={(v) => setField("hospitalPan", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>e) No. of inpatient beds:</Text>
                <CharBoxRow length={5} value={form.inpatientBeds} onChange={(v) => setField("inpatientBeds", v)} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>f) Facilities – OT:</Text>
                <YesNoRow value={form.facilityOT} onChange={(v) => setField("facilityOT", v)} />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>ICU:</Text>
                <YesNoRow value={form.facilityICU} onChange={(v) => setField("facilityICU", v)} />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>g) Others:</Text>
              <TextInput style={styles.longInputWide} value={form.otherFacilities} onChangeText={(t) => setField("otherFacilities", t)} />
            </View>

          </View>
          <SectionBar label="SECTION E" />
        </View>

        {/* ── SECTION F – DECLARATION ── */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>DECLARATION BY THE HOSPITAL</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={{ flex: 1 }}>

            <Text style={styles.declarationText}>
              We hereby declare that the information furnished in this Claim Form is true &amp; correct
              to the best of our knowledge and belief. If we have made any false or untrue statement,
              suppression or concealment of any material fact, our right to claim under this claim
              shall be forfeited.
            </Text>

            <View style={styles.rowWrap}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>Date (DDMMYYYY):</Text>
                <CharBoxRow length={8} value={form.declarationDate} onChange={(v) => setField("declarationDate", v)} keyboardType="numeric" />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>Place:</Text>
                <TextInput style={styles.longInput} value={form.declarationPlace} onChangeText={(t) => setField("declarationPlace", t)} />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>Signature and Seal of Hospital Authority:</Text>
              <TouchableOpacity
                style={styles.signatureBox}
                onPress={() => navigation.navigate("SignatureScreen", { onSave: (uri) => setSignatureImage(uri) })}
                activeOpacity={0.7}
              >
                {signatureImage ? (
                  <Image source={{ uri: signatureImage }} style={styles.signatureImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.signaturePlaceholder}>Tap to sign</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
          <SectionBar label="SECTION F" />
        </View>

      </View>
    </ScrollView>
  );

  /* ── WEB LAYOUT (wide screen) ── */
  if (Platform.OS === "web" && width > 1000) {
    return (
      <View style={stylesWeb.root}>
        <ImageBackground
          source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
          style={stylesWeb.background}
          resizeMode="cover"
        >
          <View style={stylesWeb.overlay} />
          <View style={stylesWeb.mainRow}>
            {/* SIDEBAR */}
            <View style={stylesWeb.sidebar}>
              <HospitalSidebarNavigation navigation={navigation} />
            </View>

            {/* CONTENT */}
            <View style={stylesWeb.content}>
              <View style={stylesWeb.card}>

                {/* TITLE + BACK */}
                <View style={stylesWeb.cardTitleRow}>
                  <Text style={stylesWeb.cardTitle}>Medi claim agent – Form B (Hospital)</Text>
                  <TouchableOpacity style={stylesWeb.backToHomeBtn} onPress={() => navigation.goBack()}>
                    <Text style={stylesWeb.backToHomeBtnText}>Back</Text>
                  </TouchableOpacity>
                </View>

                {/* STEP BAR */}
                <View style={stylesWeb.stepBar}>
                  {[
                    { label: "Upload Documents", sub: "Upload document", done: true },
                    { label: "Full Case Analysis", sub: "Analyze Reports", done: true },
                    { label: "Download Form B", sub: "Hospital section", done: false, active: true },
                  ].map((step, i, arr) => (
                    <React.Fragment key={i}>
                      <View style={stylesWeb.stepItem}>
                        {step.done ? (
                          <View style={stylesWeb.stepCircleDone}><Text style={stylesWeb.stepTick}>✓</Text></View>
                        ) : (
                          <View style={[stylesWeb.stepCircleInactive, step.active && stylesWeb.stepCircleActive]}>
                            <Text style={[stylesWeb.stepNum, step.active && stylesWeb.stepNumActive]}>{i + 1}</Text>
                          </View>
                        )}
                        <View style={{ marginLeft: 8 }}>
                          <Text style={[stylesWeb.stepLabel, (step.done || step.active) && stylesWeb.stepLabelActive]}>{step.label}</Text>
                          <Text style={stylesWeb.stepSub}>{step.sub}</Text>
                        </View>
                      </View>
                      {i < arr.length - 1 && <View style={stylesWeb.stepConnector} />}
                    </React.Fragment>
                  ))}
                </View>

                <View style={{ flex: 1 }}>
                  {/* INFO BOX */}
                  <View style={{ backgroundColor: "#E8F0FE", borderColor: "#90CAF9", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, color: "#1E3A8A" }}>
                      Claim Form Part B (hospital section). Fill in the fields below, then download the PDF.
                    </Text>
                  </View>

                  {/* CLAIM CARD */}
                  <View style={{ backgroundColor: "#F9FAFB", borderRadius: 8, padding: 14, borderWidth: 1, borderColor: "#E5E7EB", flex: 1 }}>
                    <View style={[styles.inlineRow, { justifyContent: "space-between", marginBottom: 8 }]}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="document-text" size={18} color="#1976D2" />
                        <Text style={{ fontSize: 13, color: "#1976D2", fontWeight: "500" }}>
                          MediAssist_ClaimForm_PartB.pdf
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => setPreviewMode((p) => !p)}
                        style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: "#1976D2" }}
                      >
                        <Text style={{ fontSize: 11, color: "#1976D2", fontWeight: "600" }}>
                          {previewMode ? "Edit Fields" : "Preview"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {previewMode ? (
                      <iframe
                        srcDoc={htmlPreview}
                        style={{ flex: 1, width: "100%", border: "none", minHeight: 600 }}
                        title="Claim Form B Preview"
                      />
                    ) : (
                      <EditForm />
                    )}
                  </View>
                </View>

                {/* DOWNLOAD BUTTONS */}
                <View style={{ marginTop: 12, gap: 8 }}>
                  <TouchableOpacity
                    style={[stylesWeb.primaryBtnWeb, isDownloading && { opacity: 0.6 }]}
                    onPress={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={stylesWeb.primaryTextWeb}>Download Form B PDF</Text>
                    }
                  </TouchableOpacity>
                  <TouchableOpacity style={stylesWeb.outlineBtnWeb} onPress={() => navigation.goBack()}>
                    <Text style={stylesWeb.outlineTextWeb}>Back to claim analysis</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  /* ── MOBILE / NARROW WEB LAYOUT ── */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={22} color="#1565C0" />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1565C0" }}>Form B – Hospital Section</Text>
        </View>

        <View style={{ backgroundColor: "#E8F0FE", borderColor: "#90CAF9", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 14 }}>
          <Text style={{ fontSize: 12, color: "#1E3A8A" }}>
            Fill in the hospital claim form details below, then download the PDF.
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setPreviewMode((p) => !p)}
            style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, borderWidth: 1, borderColor: "#1976D2" }}
          >
            <Text style={{ fontSize: 12, color: "#1976D2", fontWeight: "600" }}>
              {previewMode ? "Edit Fields" : "Preview"}
            </Text>
          </TouchableOpacity>
        </View>

        {previewMode
          ? Platform.OS === "web"
            ? (
              <iframe
                srcDoc={htmlPreview}
                style={{ width: "100%", border: "none", minHeight: 500 }}
                title="Claim Form B Preview"
              />
            )
            : (
              <View style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" }}>
                <Text style={{ color: "#555", fontSize: 12 }}>Preview is only available on web. Switch to Edit mode to fill fields.</Text>
              </View>
            )
          : <EditForm />
        }

        <TouchableOpacity
          style={[styles.primaryBtn, isDownloading && { opacity: 0.6 }, { marginTop: 16 }]}
          onPress={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.primaryText}>Download Form B PDF</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineText}>Back to claim analysis</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6F8" },

  /* Layout helpers */
  inlineRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 6 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  sectionContainer: { flexDirection: "row", marginBottom: 4 },

  /* Divider */
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  line: { flex: 1, height: 1, backgroundColor: "#000" },
  dividerText: { fontSize: 10, fontWeight: "700", paddingHorizontal: 6 },

  /* Labels */
  label: { fontSize: 11, marginRight: 6 },
  smallLabel: { fontSize: 10, marginRight: 4 },
  sectionSubTitle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },

  /* Section bar */
  sectionBar: { width: 28, alignItems: "center", marginLeft: 6 },
  sectionLine: { flex: 1, width: 1, backgroundColor: "#000" },
  sectionTextWrap: { paddingVertical: 10, justifyContent: "center", alignItems: "center" },
  sectionText: { fontSize: 9, fontWeight: "700", transform: [{ rotate: "90deg" }] },

  /* Char boxes */
  boxRow: { flexDirection: "row", flexWrap: "wrap" },
  squareBox: { width: 16, height: 18, borderWidth: 1, borderColor: "#999", margin: 1, textAlign: "center", fontSize: 9, padding: 0 },

  /* Text inputs */
  longInput: { width: 160, height: 20, borderWidth: 1, borderColor: "#999", fontSize: 11, paddingHorizontal: 4 },
  longInputWide: { width: 260, height: 20, borderWidth: 1, borderColor: "#999", fontSize: 11, paddingHorizontal: 4 },

  /* Yes/No toggle buttons */
  yesNoBtn: { borderWidth: 1, borderColor: "#999", borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, marginHorizontal: 2 },
  yesNoBtnActive: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  yesNoText: { fontSize: 10, color: "#333" },
  yesNoTextActive: { color: "#fff" },

  /* ICD row */
  icdRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 4, gap: 4 },
  icdDesc: { flex: 1, minWidth: 120, height: 20, borderWidth: 1, borderColor: "#ccc", fontSize: 10, paddingHorizontal: 4 },

  /* Checklist */
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  checkbox: { width: 14, height: 14, borderWidth: 1, borderColor: "#000", marginRight: 6, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { backgroundColor: "#1565C0", borderColor: "#1565C0" },
  checkmark: { color: "#fff", fontSize: 9, lineHeight: 12 },
  checkLabel: { fontSize: 10, flex: 1 },

  /* Declaration */
  declarationText: { fontSize: 10, lineHeight: 15, marginBottom: 8 },

  /* Signature */
  signatureBox: { width: 180, height: 50, borderWidth: 1, borderColor: "#000", justifyContent: "center", alignItems: "center" },
  signatureImage: { width: "100%", height: "100%" },
  signaturePlaceholder: { fontSize: 10, color: "#aaa", fontStyle: "italic" },

  /* Buttons */
  primaryBtn: { backgroundColor: "#1565C0", paddingVertical: 13, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  primaryText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  outlineBtn: { borderWidth: 1, borderColor: "#D0D5DD", borderRadius: 8, paddingVertical: 12, alignItems: "center", marginBottom: 12, backgroundColor: "#fff" },
  outlineText: { fontSize: 14, color: "#333" },

  /* Form title */
  formTitle: { fontSize: 16, fontWeight: "900", textAlign: "center", marginBottom: 2 },
  sectionTitle: { fontSize: 11, textAlign: "center", marginBottom: 10 },
});

const stylesWeb = StyleSheet.create({
  root: { flex: 1, height: "100vh", overflow: "hidden" },
  background: { flex: 1, height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1 },
  mainRow: { flexDirection: "row", height: "100%", zIndex: 2 },
  sidebar: { width: "15%" },
  content: { width: "85%", padding: 20, zIndex: 3, height: "100%", overflow: "auto" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  backToHomeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#CBD5E1" },
  backToHomeBtnText: { fontSize: 13, color: "#64748B" },

  /* Step bar */
  stepBar: { flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: "#E5E7EB" },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepConnector: { flex: 1, height: 1, backgroundColor: "#CBD5E1", marginHorizontal: 8 },
  stepCircleDone: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#16A34A", justifyContent: "center", alignItems: "center" },
  stepTick: { color: "#fff", fontSize: 12, fontWeight: "700" },
  stepCircleInactive: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#CBD5E1", justifyContent: "center", alignItems: "center" },
  stepCircleActive: { borderColor: "#1565C0", backgroundColor: "#EFF6FF" },
  stepNum: { fontSize: 11, fontWeight: "700", color: "#94A3B8" },
  stepNumActive: { color: "#1565C0" },
  stepLabel: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },
  stepLabelActive: { color: "#1E293B" },
  stepSub: { fontSize: 10, color: "#94A3B8" },

  /* Buttons */
  primaryBtnWeb: { backgroundColor: "#1565C0", paddingVertical: 13, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  primaryTextWeb: { color: "#fff", fontSize: 14, fontWeight: "600" },
  outlineBtnWeb: { borderWidth: 1, borderColor: "#D0D5DD", borderRadius: 8, paddingVertical: 12, alignItems: "center", marginBottom: 12, backgroundColor: "#fff" },
  outlineTextWeb: { fontSize: 14, color: "#333" },
});
