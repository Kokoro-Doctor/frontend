import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";

// ─── helpers ──────────────────────────────────────────────────────────────────
const Section = ({ label, children }) => (
  <View style={s.section}>
    <View style={s.sectionHeader}>
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
    <View style={s.sectionBody}>{children}</View>
  </View>
);

const Row = ({ children, wrap }) => (
  <View style={[s.row, wrap && { flexWrap: "wrap" }]}>{children}</View>
);

const Field = ({ label, value, onChange, flex = 1, placeholder = "", multiline = false, note }) => (
  <View style={[s.field, { flex }]}>
    <Text style={s.fieldLabel}>{label}</Text>
    {note ? <Text style={s.fieldNote}>{note}</Text> : null}
    <TextInput
      style={[s.input, multiline && s.inputMulti]}
      value={value ?? ""}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

const ToggleField = ({ label, value, onChange }) => (
  <View style={s.toggleField}>
    <Text style={s.fieldLabel}>{label}</Text>
    <View style={s.toggleRow}>
      <TouchableOpacity
        style={[s.toggleBtn, value === "Yes" && s.toggleBtnActive]}
        onPress={() => onChange("Yes")}
      >
        <Text style={[s.toggleBtnText, value === "Yes" && s.toggleBtnTextActive]}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.toggleBtn, value === "No" && s.toggleBtnActive]}
        onPress={() => onChange("No")}
      >
        <Text style={[s.toggleBtnText, value === "No" && s.toggleBtnTextActive]}>No</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SelectField = ({ label, options, value, onChange, flex = 1 }) => (
  <View style={[s.field, { flex }]}>
    <Text style={s.fieldLabel}>{label}</Text>
    <View style={s.optionsRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[s.chip, value === opt && s.chipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[s.chipText, value === opt && s.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const Divider = () => <View style={s.divider} />;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function InsuranceFormEditor({ form, onChange, onClose }) {
  // Helper to update a single key in form
  const set = useCallback(
    (key) => (val) => onChange({ ...form, [key]: val }),
    [form, onChange]
  );

  // Helper for nested chronic illness
  const setChronic = useCallback(
    (disease, subKey) => (val) =>
      onChange({
        ...form,
        chronicHistory: {
          ...form.chronicHistory,
          [disease]: { ...(form.chronicHistory?.[disease] ?? {}), [subKey]: val },
        },
      }),
    [form, onChange]
  );

  const chronic = form.chronicHistory ?? {};

  const CHRONIC_LIST = [
    "diabetes",
    "heartDisease",
    "hypertension",
    "hyperlipidemias",
    "osteoarthritis",
    "asthma",
    "cancer",
    "alcoholDrugAbuse",
    "hivStd",
  ];
  const CHRONIC_LABELS = {
    diabetes: "Diabetes",
    heartDisease: "Heart Disease",
    hypertension: "Hypertension",
    hyperlipidemias: "Hyperlipidemias",
    osteoarthritis: "Osteoarthritis",
    asthma: "Asthma / COPD / Bronchitis",
    cancer: "Cancer",
    alcoholDrugAbuse: "Alcohol or Drug Abuse",
    hivStd: "HIV / STD Related Ailments",
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.editorHeader}>
        <Text style={s.editorTitle}>Edit Pre-Auth Form Fields</Text>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Text style={s.closeBtnText}>✕ Close editor</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ══ SECTION A: TPA Details ════════════════════════════════════════ */}
        <Section label="Section A — Third Party Administrator Details">
          <Field
            label="a) Name of TPA / Insurance Company"
            value={form.tpaName}
            onChange={set("tpaName")}
          />
          <Row>
            <Field
              label="b) Toll Free Phone No."
              value={form.tpaPhone}
              onChange={set("tpaPhone")}
              placeholder="1800XXXXXXX"
            />
            <Field
              label="c) Toll Free Fax"
              value={form.tpaFax}
              onChange={set("tpaFax")}
              placeholder="1800XXXXXXX"
            />
          </Row>
          <Field
            label="d) Name of Hospital"
            value={form.hospitalName}
            onChange={set("hospitalName")}
          />
          <Field
            label="  i) Address"
            value={form.hospitalAddress}
            onChange={set("hospitalAddress")}
            multiline
          />
          <Row>
            <Field
              label="  ii) Rohini ID"
              value={form.rohiniId}
              onChange={set("rohiniId")}
            />
            <Field
              label="  iii) Email ID"
              value={form.hospitalEmail}
              onChange={set("hospitalEmail")}
              placeholder="hospital@example.com"
            />
          </Row>
        </Section>

        {/* ══ SECTION B: Insured / Patient Details ══════════════════════════ */}
        <Section label="Section B — Insured / Patient Details">
          <Field
            label="a) Patient Name"
            value={form.primaryName}
            onChange={set("primaryName")}
          />

          <Row wrap>
            <SelectField
              label="b) Gender"
              options={["M", "F", "Other"]}
              value={form.gender}
              onChange={set("gender")}
              flex={0.5}
            />
            <Row>
              <Field
                label="c) Age (YY)"
                value={form.ageYears}
                onChange={set("ageYears")}
                placeholder="YY"
                flex={0.5}
              />
              <Field
                label="Age (MM)"
                value={form.ageMonths}
                onChange={set("ageMonths")}
                placeholder="MM"
                flex={0.5}
              />
            </Row>
            <Field
              label="d) Date of Birth (DD/MM/YYYY)"
              value={form.dob}
              onChange={set("dob")}
              placeholder="DD/MM/YYYY"
              flex={1}
            />
          </Row>

          <Row>
            <Field
              label="e) Contact Number (STD–Number)"
              value={form.contactNumber}
              onChange={set("contactNumber")}
              placeholder="0XXX-XXXXXXXXXX"
            />
            <Field
              label="f) Contact Number of Attending Relative"
              value={form.relativeContact}
              onChange={set("relativeContact")}
              placeholder="0XXX-XXXXXXXXXX"
            />
          </Row>

          <Field
            label="g) Insured Card ID Number"
            value={form.insuredCardId}
            onChange={set("insuredCardId")}
          />
          <Field
            label="h) Policy Number / Name of Corporate"
            value={form.policyNumber}
            onChange={set("policyNumber")}
          />
          <Field
            label="i) Employee ID"
            value={form.employeeId}
            onChange={set("employeeId")}
          />

          <Divider />

          <ToggleField
            label="j) Other Mediclaim / Health Insurance?"
            value={form.otherInsurance}
            onChange={set("otherInsurance")}
          />
          {form.otherInsurance === "Yes" && (
            <>
              <Field
                label="  i) Other Insurance Company Name"
                value={form.otherInsuranceCompany}
                onChange={set("otherInsuranceCompany")}
              />
              <Field
                label="  ii) Other Insurance Details"
                value={form.otherInsuranceDetails}
                onChange={set("otherInsuranceDetails")}
                multiline
              />
            </>
          )}

          <Divider />

          <ToggleField
            label="k) Family Physician?"
            value={form.hasFamilyPhysician}
            onChange={set("hasFamilyPhysician")}
          />
          <Row>
            <Field
              label="l) Name of Family Physician"
              value={form.familyPhysicianName}
              onChange={set("familyPhysicianName")}
            />
            <Field
              label="m) Physician Contact"
              value={form.familyPhysicianContact}
              onChange={set("familyPhysicianContact")}
              placeholder="0XXX-XXXXXXXXXX"
            />
          </Row>

          <Field
            label="n) Current Address of Insured Patient"
            value={form.insuredAddress}
            onChange={set("insuredAddress")}
            multiline
          />
          <Field
            label="o) Occupation of Insured Person"
            value={form.occupation}
            onChange={set("occupation")}
          />
        </Section>

        {/* ══ SECTION C: Treating Doctor Details ════════════════════════════ */}
        <Section label="Section C — Treating Doctor / Hospital Details">
          <Row>
            <Field
              label="a) Name of Treating Doctor"
              value={form.treatingDoctor}
              onChange={set("treatingDoctor")}
            />
            <Field
              label="b) Doctor Contact"
              value={form.doctorContact}
              onChange={set("doctorContact")}
              placeholder="0XXX-XXXXXXXXXX"
            />
          </Row>

          <Field
            label="c) Nature of Illness / Disease with Presenting Complaints"
            value={form.illnessNature}
            onChange={set("illnessNature")}
            multiline
          />
          <Field
            label="d) Relevant Clinical Findings"
            value={form.clinicalFindings}
            onChange={set("clinicalFindings")}
            multiline
          />

          <Row>
            <Field
              label="e) Duration of Present Ailment (days)"
              value={form.ailmentDuration}
              onChange={set("ailmentDuration")}
              placeholder="0"
              flex={0.4}
            />
            <Field
              label="  i) Date of First Consultation (DD/MM/YYYY)"
              value={form.firstConsultDate}
              onChange={set("firstConsultDate")}
              placeholder="DD/MM/YYYY"
            />
          </Row>
          <Field
            label="  ii) Past History of Present Ailment"
            value={form.pastAilmentHistory}
            onChange={set("pastAilmentHistory")}
            multiline
          />

          <Row>
            <Field
              label="f) Provisional Diagnosis"
              value={form.provisionalDiagnosis}
              onChange={set("provisionalDiagnosis")}
            />
            <Field
              label="  i) ICD 10 Code"
              value={form.icd10Code}
              onChange={set("icd10Code")}
              placeholder="A00.0"
              flex={0.5}
            />
          </Row>

          <SelectField
            label="g) Proposed Line of Treatment"
            options={["Medical Management", "Surgical Management", "Intensive Care", "Investigation", "Non Allopathic"]}
            value={form.treatmentLine}
            onChange={set("treatmentLine")}
          />

          <Field
            label="h) If Investigation / Medical Management — provide details"
            value={form.investigationDetails}
            onChange={set("investigationDetails")}
            multiline
          />
          <Field
            label="  i) Route of Drug Administration"
            value={form.drugRoute}
            onChange={set("drugRoute")}
          />
          <Row>
            <Field
              label="i) If Surgical — Name of Surgery"
              value={form.surgeryName}
              onChange={set("surgeryName")}
            />
            <Field
              label="  i) ICD 10 PCS Code"
              value={form.icd10PCSCode}
              onChange={set("icd10PCSCode")}
              placeholder="0A0000Z"
              flex={0.5}
            />
          </Row>
          <Field
            label="j) Other Treatment Details"
            value={form.otherTreatmentDetails}
            onChange={set("otherTreatmentDetails")}
            multiline
          />
          <Field
            label="k) How did Injury Occur?"
            value={form.injuryHow}
            onChange={set("injuryHow")}
            multiline
          />

          <Divider />
          <Text style={s.subGroupLabel}>l) In Case of Accident</Text>
          <Row>
            <ToggleField
              label="i) Is it RTA?"
              value={form.isRTA}
              onChange={set("isRTA")}
            />
            <Field
              label="ii) Date of Injury (DD/MM/YYYY)"
              value={form.injuryDate}
              onChange={set("injuryDate")}
              placeholder="DD/MM/YYYY"
            />
          </Row>
          <Row>
            <ToggleField
              label="iii) Reported to Police?"
              value={form.reportedToPolice}
              onChange={set("reportedToPolice")}
            />
            <Field
              label="iv) FIR No."
              value={form.firNumber}
              onChange={set("firNumber")}
              flex={0.6}
            />
          </Row>
          <ToggleField
            label="v) Injury / Disease caused due to Substance Abuse / Alcohol?"
            value={form.substanceAbuse}
            onChange={set("substanceAbuse")}
          />
          <ToggleField
            label="vi) Test conducted to establish substance abuse?"
            value={form.substanceTest}
            onChange={set("substanceTest")}
          />

          <Divider />
          <Text style={s.subGroupLabel}>m) In Case of Maternity</Text>
          <Row wrap>
            <Field label="G (Gravida)" value={form.maternityG} onChange={set("maternityG")} flex={0.25} />
            <Field label="P (Para)" value={form.maternityP} onChange={set("maternityP")} flex={0.25} />
            <Field label="L (Live)" value={form.maternityL} onChange={set("maternityL")} flex={0.25} />
            <Field label="A (Abortion)" value={form.maternityA} onChange={set("maternityA")} flex={0.25} />
            <Field
              label="Date of Delivery (DD/MM/YYYY)"
              value={form.deliveryDate}
              onChange={set("deliveryDate")}
              placeholder="DD/MM/YYYY"
              flex={0.6}
            />
          </Row>

          <Divider />
          <Text style={s.subGroupLabel}>Details of Patient Admitted</Text>
          <Row>
            <Field
              label="a) Date of Admission (DD/MM/YYYY)"
              value={form.admissionDate}
              onChange={set("admissionDate")}
              placeholder="DD/MM/YYYY"
            />
            <Field
              label="b) Time of Admission (HH:MM)"
              value={form.admissionTime}
              onChange={set("admissionTime")}
              placeholder="HH:MM"
              flex={0.5}
            />
          </Row>
          <SelectField
            label="c) Type of Hospitalization"
            options={["Emergency", "Planned"]}
            value={form.hospitalizationType}
            onChange={set("hospitalizationType")}
          />
          <Row>
            <Field label="d) Expected Days in Hospital" value={form.expectedDays} onChange={set("expectedDays")} placeholder="0" flex={0.4} />
            <Field label="e) Days in ICU" value={form.icuDays} onChange={set("icuDays")} placeholder="0" flex={0.4} />
            <Field label="f) Room Type" value={form.roomType} onChange={set("roomType")} />
          </Row>

          <Divider />
          <Text style={s.subGroupLabel}>Estimated Costs (Rs.)</Text>
          <Row>
            <Field label="f) Room Rent + Nursing + Diet (per day)" value={form.costRoomRent} onChange={set("costRoomRent")} placeholder="0" />
            <Field label="g) Investigations + Diagnostics" value={form.costInvestigation} onChange={set("costInvestigation")} placeholder="0" />
          </Row>
          <Row>
            <Field label="h) ICU Charges" value={form.costICU} onChange={set("costICU")} placeholder="0" />
            <Field label="i) OT Charges" value={form.costOT} onChange={set("costOT")} placeholder="0" />
          </Row>
          <Row>
            <Field label="j) Professional Fees (Surgeon + Anaesthetist + Consultation)" value={form.costProfessional} onChange={set("costProfessional")} placeholder="0" />
            <Field label="k) Medicines + Consumables + Implants" value={form.costMedicines} onChange={set("costMedicines")} placeholder="0" />
          </Row>
          <Row>
            <Field label="l) Other Hospital Expenses" value={form.costOther} onChange={set("costOther")} placeholder="0" />
            <Field label="m) Package Charges (if applicable)" value={form.costPackage} onChange={set("costPackage")} placeholder="0" />
          </Row>
          <Field
            label="n) Total Expected Cost (Rs.)"
            value={form.costTotal}
            onChange={set("costTotal")}
            placeholder="0"
            note="Sum of all above"
          />

          <Divider />
          <Text style={s.subGroupLabel}>Past History of Chronic Illness</Text>
          {CHRONIC_LIST.map((key) => (
            <View key={key} style={s.chronicRow}>
              <View style={s.chronicLeft}>
                <TouchableOpacity
                  style={[s.checkbox, chronic[key]?.present && s.checkboxActive]}
                  onPress={() => setChronic(key, "present")(!chronic[key]?.present)}
                >
                  {chronic[key]?.present && <Text style={s.checkMark}>✓</Text>}
                </TouchableOpacity>
                <Text style={s.chronicLabel}>{CHRONIC_LABELS[key]}</Text>
              </View>
              {chronic[key]?.present && (
                <Row>
                  <Field
                    label="Since Month (MM)"
                    value={chronic[key]?.month}
                    onChange={setChronic(key, "month")}
                    placeholder="MM"
                    flex={0.5}
                  />
                  <Field
                    label="Since Year (YY)"
                    value={chronic[key]?.year}
                    onChange={setChronic(key, "year")}
                    placeholder="YY"
                    flex={0.5}
                  />
                </Row>
              )}
            </View>
          ))}
          <Field
            label="Other Ailment Details"
            value={form.otherAilment}
            onChange={set("otherAilment")}
            multiline
          />
        </Section>

        {/* ══ SECTION D: Declaration by Treating Doctor ═════════════════════ */}
        <Section label="Section D — Declaration (Treating Doctor)">
          <Row>
            <Field
              label="a) Name of Treating Doctor"
              value={form.declarationDoctorName}
              onChange={set("declarationDoctorName")}
            />
            <Field
              label="b) Qualification"
              value={form.doctorQualification}
              onChange={set("doctorQualification")}
              flex={0.5}
            />
          </Row>
          <Field
            label="c) Registration No. with State Code"
            value={form.doctorRegNumber}
            onChange={set("doctorRegNumber")}
          />
          <Text style={s.noteText}>
            Hospital seal and patient/insured signature boxes will appear on the printed form.
          </Text>
        </Section>

        {/* ══ SECTION E: Patient Declaration ═══════════════════════════════ */}
        <Section label="Section E — Declaration by Patient / Representative">
          <Text style={s.noteText}>
            Declarations a–h are pre-printed. Fill in the fields below for the signatory.
          </Text>
          <Field
            label="a) Patient / Insured Name"
            value={form.declarationPatientName}
            onChange={set("declarationPatientName")}
          />
          <Row>
            <Field
              label="b) Contact Number"
              value={form.declarationContact}
              onChange={set("declarationContact")}
              placeholder="0XXX-XXXXXXXXXX"
            />
            <Field
              label="c) Email ID (optional)"
              value={form.declarationEmail}
              onChange={set("declarationEmail")}
              placeholder="patient@example.com"
            />
          </Row>
          <Row>
            <Field
              label="d) Signature Date"
              value={form.declarationDate}
              onChange={set("declarationDate")}
              placeholder="DD/MM/YYYY"
              flex={0.5}
            />
            <Field
              label="Signature Time (HH:MM)"
              value={form.declarationTime}
              onChange={set("declarationTime")}
              placeholder="HH:MM"
              flex={0.5}
            />
          </Row>
        </Section>

        {/* ══ SECTION F: Hospital Declaration ══════════════════════════════ */}
        <Section label="Section F — Hospital Declaration">
          <Text style={s.noteText}>
            Declarations a–i are pre-printed. Fill in the dates below.
          </Text>
          <Row>
            <Field
              label="Date (DD/MM/YYYY)"
              value={form.hospitalDeclDate}
              onChange={set("hospitalDeclDate")}
              placeholder="DD/MM/YYYY"
              flex={0.5}
            />
            <Field
              label="Time (HH:MM)"
              value={form.hospitalDeclTime}
              onChange={set("hospitalDeclTime")}
              placeholder="HH:MM"
              flex={0.5}
            />
          </Row>
          <Text style={s.noteText}>
            Hospital seal and Doctor's signature boxes will appear on the printed form.
          </Text>
        </Section>

        {/* ══ SECTION G: Footer / Company Info ════════════════════════════ */}
        <Section label="Section G — Care Health Insurance Footer">
          <Text style={s.noteText}>
            This section is auto-filled. The company name, address, IRDAI registration, and page
            number are printed automatically on the form.
          </Text>
        </Section>

      </ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E40AF",
    borderBottomWidth: 1,
    borderBottomColor: "#1E3A8A",
  },
  editorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.2,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  closeBtnText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },

  // Section
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 2,
  },
  sectionHeader: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#BFDBFE",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
    letterSpacing: 0.1,
  },
  sectionBody: {
    padding: 14,
    gap: 10,
  },

  // Row
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },

  // Field
  field: {
    gap: 4,
    flex: 1,
    minWidth: 80,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 14,
  },
  fieldNote: {
    fontSize: 10,
    color: "#6B7280",
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: "#111827",
    backgroundColor: "#FAFAFA",
    minHeight: 34,
  },
  inputMulti: {
    minHeight: 60,
    textAlignVertical: "top",
    paddingTop: 8,
  },

  // Toggle yes/no
  toggleField: {
    flex: 1,
    gap: 4,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  toggleBtnActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleBtnTextActive: { color: "#fff" },

  // Chip select
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  chipTextActive: { color: "#fff" },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },

  subGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
    letterSpacing: 0.1,
  },

  noteText: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
    lineHeight: 16,
  },

  // Chronic
  chronicRow: {
    gap: 4,
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  chronicLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  checkMark: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
    lineHeight: 14,
  },
  chronicLabel: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
});