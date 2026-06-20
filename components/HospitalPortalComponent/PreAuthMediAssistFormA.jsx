/**
 * MediAssistFormAContent — pure form component.
 * All screen chrome (sidebar, background, card, step bar, buttons)
 * is intentionally removed. The parent screen owns those.
 *
 * Props:
 *  - form              : object  — form state
 *  - setField          : (key, value) => void — field updater
 *  - signatureImage    : string | null
 *  - setSignatureImage : (uri) => void
 *  - navigation        : RN navigation object (for SignatureScreen)
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { padChars } from "../../utils/PreAuthMediAssistMapper";

// ─── CharBoxRow ────────────────────────────────────────────────────────────────
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
function HintBoxRow({ hints, value, onChange, boxStyle, rowStyle }) {
  const length = hints.length;
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
      {hints.map((h, i) => (
        <TextInput
          key={i}
          style={boxStyle || styles.hintBox}
          maxLength={1}
          placeholder={h}
          placeholderTextColor="#aaa"
          value={chars[i] === " " ? "" : chars[i]}
          onChangeText={(t) => handleCell(i, t)}
        />
      ))}
    </View>
  );
}
function ToggleCheckbox({ checked, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.checkbox, checked && styles.checkboxChecked]}
    >
      {checked ? <Text style={styles.checkmark}>✓</Text> : null}
    </TouchableOpacity>
  );
}

function yesSelected(value) {
  return (
    String(value ?? "")
      .toLowerCase()
      .trim() === "yes"
  );
}

function noSelected(value) {
  return (
    String(value ?? "")
      .toLowerCase()
      .trim() === "no"
  );
}

function relationshipMatches(value, option) {
  const rel = String(value ?? "")
    .toLowerCase()
    .trim();
  if (!rel) return false;
  if (option === "other") {
    return !["self", "spouse", "child", "father", "mother"].some(
      (item) => rel === item || rel.includes(item),
    );
  }
  return rel === option || rel.includes(option);
}

function occupationMatches(value, option) {
  const occ = String(value ?? "")
    .toLowerCase()
    .trim();
  if (!occ) return false;
  if (option === "other") {
    return !["service", "self", "home", "student", "retired"].some((item) =>
      occ.includes(item),
    );
  }
  if (option === "self employed") return occ.includes("self");
  if (option === "home maker") return occ.includes("home");
  return occ.includes(option.split(" ")[0]);
}

function roomCategoryMatches(value, option) {
  const room = String(value ?? "").toLowerCase();
  if (option === "day care") return room.includes("day");
  if (option === "single occupancy") return room.includes("single");
  if (option === "twin sharing")
    return room.includes("twin") || room.includes("double");
  if (option === "3 or more beds per room") {
    return (
      room.includes("3") ||
      room.includes("more") ||
      room.includes("general") ||
      room.includes("shared")
    );
  }
  return false;
}

function hospitalizationCauseMatches(value, option) {
  const cause = String(value ?? "").toLowerCase();
  if (option === "injury") return cause.includes("injur");
  if (option === "illness")
    return cause.includes("ill") || cause.includes("disease");
  if (option === "maternity") {
    return (
      cause.includes("matern") ||
      cause.includes("deliver") ||
      cause.includes("pregnan")
    );
  }
  return false;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PreAuthMediAssistFormAContent({
  form,
  setField,
  signatureImage,
  setSignatureImage,
  navigation,
  page = 1,
}) {
  if (page === 2) {
    return (
      <ScrollView>
        <View style={{ padding: 12 }}>
          {/* ── FORM HEADER (same as Page 1) ── */}
          <View style={styles.formHeaderContainer}>
            <View style={styles.formTopRow}>
              <View style={styles.logoRow}>
                <Image
                  source={require("../../assets/HospitalPortal/Icon/PreAuthMediAssist_new.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.centerTitleBlock}>
                <Text style={styles.formMainTitle}>
                  REQUEST FOR CASHLESS HOSPITALISATION
                </Text>
                <Text style={styles.formSubTitle}>
                  FOR HEALTH INSURANCE POLICY
                </Text>
                <Text style={styles.formNoteCenter}>PART C (Revised)</Text>
              </View>

              <Text style={styles.formNoteRight}>
                (To be Filled in block letters)
              </Text>
            </View>
          </View>
          {/* ── COST ESTIMATES + CHRONIC HISTORY ── */}
          <View style={styles.twoColRow}>
            {/* LEFT — Cost estimates */}
            <View style={{ flex: 1.2 }}>
              {[
                {
                  label:
                    "g) Per Day Room Rent + Nursing & Service charges + Patient's Diet:",
                  key: "costRoomRent",
                },
                {
                  label: "h) Expected cost for investigation + diagnostics:",
                  key: "costInvestigation",
                },
                { label: "i) ICU Charges:", key: "costIcu" },
                { label: "j) OT Charges:", key: "costOt" },
                {
                  label:
                    "k) Professional fees Surgeon + Anesthetist fees + Consultation charges:",
                  key: "costProfessionalFees",
                },
                {
                  label:
                    "L) Medicines + Consumables cost of Implants: (specify if applicable)",
                  key: "costMedicines",
                },
                {
                  label: "m) Other hospital expenses if any:",
                  key: "costOtherExpenses",
                },
                {
                  label: "n) All inclusive package charges if any applicable:",
                  key: "costPackageCharges",
                },
                {
                  label: "o) Sum Total expected cost of hospitalization:",
                  key: "costTotal",
                },
              ].map((item) => (
                <View key={item.key} style={styles.amountRow}>
                  <Text style={styles.amountLabel}>{item.label}</Text>
                  <Text style={styles.label}>Rs.</Text>
                  {/* <TextInput
                    style={styles.amountInput}
                    value={form[item.key] ?? ""}
                    onChangeText={(v) => setField(item.key, v)}
                    keyboardType="numeric"
                  /> */}
                  <CharBoxRow
                    length={8}
                    value={form[item.key]}
                    onChange={(v) => setField(item.key, v)}
                    keyboardType="numeric"
                  />
                </View>
              ))}
            </View>

            {/* RIGHT — Chronic illness */}
            <View
              style={{
                flex: 1,
                borderLeftWidth: 1,
                borderLeftColor: "#ddd",
                paddingLeft: 10,
              }}
            >
              <Text
                style={[styles.label, { fontWeight: "600", marginBottom: 8 }]}
              >
                p. Mandatory past history of any chronic illness.{"\n"}If yes
                (since month/year)
              </Text>
              {[
                { key: "chronicDiabetes", label: "1. Diabetes" },
                { key: "chronicHeartDisease", label: "2. Heart Disease" },
                { key: "chronicHypertension", label: "3. Hypertension" },
                { key: "chronicHyperlipidemia", label: "4. Hyperlipidemias" },
                { key: "chronicOsteoarthritis", label: "5. Osteoarthritis" },
                { key: "chronicAsthma", label: "6. Asthma/ COPD / Bronchitis" },
                { key: "chronicCancer", label: "7. Cancer" },
                { key: "chronicAlcohol", label: "8. Alcohol or drug abuse" },
                {
                  key: "chronicHiv",
                  label: "9. Any HIV or STD / related ailments",
                },
              ].map((item) => (
                <View key={item.key} style={styles.chronicRow}>
                  <ToggleCheckbox
                    checked={!!form[item.key]}
                    onPress={() => setField(item.key, !form[item.key])}
                  />
                  <Text style={[styles.smallText, { flex: 1 }]}>
                    {item.label}
                  </Text>
                  {/* <TextInput
                    style={styles.mmyyInput}
                    placeholder="MM/YY"
                    value={form[item.key + "Date"] ?? ""}
                    onChangeText={(v) => setField(item.key + "Date", v)}
                  /> */}
                  <HintBoxRow
                    hints={["M", "M", "Y", "Y"]}
                    value={form[item.key + "Date"]}
                    onChange={(v) => setField(item.key + "Date", v)}
                    boxStyle={styles.hintBoxSmall}
                  />
                </View>
              ))}
              <Text style={[styles.label, { marginTop: 8 }]}>
                10. Any other ailment give details:
              </Text>
              <TextInput
                style={styles.textArea}
                value={form.chronicOtherDetails ?? ""}
                onChangeText={(v) => setField("chronicOtherDetails", v)}
                multiline
              />
            </View>
          </View>

          {/* ── DECLARATION ── */}
          <View style={styles.sectionContainer}>
            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>
                DECLARATION (PLEASE READ VERY CAREFULLY)
              </Text>
              <View style={styles.line} />
            </View>
            <Text style={styles.smallText}>
              We confirm having read understood and agreed to the declaration of
              this form
            </Text>

            <View style={[styles.inlineRow, { marginTop: 8 }]}>
              <Text style={styles.label}>a) Name of the treating doctor:</Text>
              {/* <TextInput
                style={[styles.longInputWide, { flex: 1, marginLeft: 6 }]}
                value={form.declarationDoctorName ?? ""}
                onChangeText={(v) => setField("declarationDoctorName", v)}
              /> */}
              <CharBoxRow
                length={33}
                value={form.declarationDoctorName}
                onChange={(v) => setField("declarationDoctorName", v)}
              />
            </View>

            <View style={styles.rowBetween}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>b) Qualification:</Text>
                <CharBoxRow
                  length={14}
                  value={form.qualification}
                  onChange={(v) => setField("qualification", v)}
                />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>
                  c) Registration No. with State code:
                </Text>
                <CharBoxRow
                  length={10}
                  value={form.registrationNo}
                  onChange={(v) => setField("registrationNo", v)}
                />
              </View>
            </View>
          </View>

          {/* ── PATIENT DECLARATION ── */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.dividerText, { marginBottom: 6 }]}>
              DECLARATION BY THE PATIENT / REPRESENTATIVE
            </Text>
            {[
              "a. I agree to allow the hospital to submit all original documents pertaining to hospitalization to the Insurer/TPA after the discharge.",
              "b. Payment to hospital is governed by the terms and conditions of the policy.",
              "c. All non-medical expenses not relevant to current hospitalization will be paid by me.",
              "d. I hereby declare to abide by the terms and conditions of the policy.",
              "e. I agree and understand that TPA is in no way warranting the service of the hospital.",
              "f. I hereby warrant the truth of the forgoing particulars in every respect.",
              "g. I agree to indemnify the hospital against all expenses incurred on my behalf.",
              'h. "I/We authorize Insurance Company/TPA to contact me/us through mobile/email for any update on this claim"',
            ].map((pt, i) => (
              <Text key={i} style={[styles.smallText, { marginBottom: 3 }]}>
                {pt}
              </Text>
            ))}

            <View style={[styles.inlineRow, { marginTop: 10 }]}>
              <Text style={styles.label}>
                a) Patient`&apos;`s / Insured`&apos;`s name:
              </Text>
              <CharBoxRow
                length={38}
                value={form.patientName}
                onChange={(v) => setField("patientName", v)}
              />
            </View>
            <View style={styles.rowBetween}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>b) Contact number:</Text>
                <CharBoxRow
                  length={10}
                  value={form.contactNumber}
                  onChange={(v) => setField("contactNumber", v)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>c) Email ID: (Optional)</Text>
                <CharBoxRow
                  length={16}
                  value={form.patientEmail}
                  onChange={(v) => setField("patientEmail", v)}
                />
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                d) Patient`&apos;`s / Insured`&apos;`s signature:
              </Text>
              <TouchableOpacity
                style={styles.signatureBox}
                onPress={() =>
                  navigation.navigate("SignatureScreen", {
                    onSave: (uri) => setSignatureImage(uri),
                  })
                }
              >
                {signatureImage ? (
                  <Image
                    source={{ uri: signatureImage }}
                    style={styles.signatureImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.signaturePlaceholder}>Tap to sign</Text>
                )}
              </TouchableOpacity>
              <Text style={[styles.label, { marginLeft: 14 }]}>Date:</Text>
              <HintBoxRow
                hints={["D", "D", "M", "M", "Y", "Y", "Y", "Y"]}
                value={form.patientDeclarationDate}
                onChange={(v) => setField("patientDeclarationDate", v)}
              />
              <Text style={[styles.label, { marginLeft: 10 }]}>Time:</Text>
              <HintBoxRow
                hints={["H", "H", "M", "M"]}
                value={form.patientDeclarationTime}
                onChange={(v) => setField("patientDeclarationTime", v)}
              />
            </View>
          </View>

          {/* ── HOSPITAL DECLARATION ── */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.dividerText, { marginBottom: 6 }]}>
              HOSPITAL DECLARATION
            </Text>
            {[
              "a. We have no objection to any authorized TPA / Insurance Company official verifying documents.",
              "b. All valid original documents will be sent to TPA within 7 days of the patient's discharge.",
              "c. We agree that TPA will not be liable to make payment in case of discrepancy.",
              "d. The patient declaration has been signed in our presence.",
              "e. We agree to provide clarifications for queries raised.",
              "f. We will abide by the terms and conditions agreed in the MOU.",
              "g. No additional amount would be collected from the insured in excess of Agreed Package Rates.",
              "h. No recoveries would be made from the deposit except for non-admissible amounts.",
              "i. In the event of unauthorized recovery, the TPA reserves the right to recover the same from us.",
            ].map((pt, i) => (
              <Text key={i} style={[styles.smallText, { marginBottom: 3 }]}>
                {pt}
              </Text>
            ))}
          </View>

          {/* ── DOCUMENTS ── */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.dividerText, { marginBottom: 6 }]}>
              DOCUMENTS TO BE PROVIDED BY THE HOSPITAL
            </Text>
            {[
              "1. Detailed Discharge Summary and all Bills from the hospital.",
              "2. Cash Memos from the Hospitals / Chemists supported by proper prescription.",
              "3. Receipts and Pathological Test Reports from Pathologists.",
              "4. Surgeon's Certificate stating nature of Operation performed.",
              "5. Certificates from attending Medical Practitioner that the patient is fully cured.",
            ].map((pt, i) => (
              <Text key={i} style={[styles.smallText, { marginBottom: 3 }]}>
                {pt}
              </Text>
            ))}
            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Hospital seal:</Text>
                <View style={styles.sealBox} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.label}>Doctor`&apos;`s signature:</Text>
                <View style={styles.sealBox} />
              </View>
            </View>

            <View style={[styles.inlineRow, { marginTop: 10 }]}>
              <Text style={styles.label}>Date:</Text>
              <HintBoxRow
                hints={["D", "D", "M", "M", "Y", "Y", "Y", "Y"]}
                value={form.hospitalDeclarationDate}
                onChange={(v) => setField("hospitalDeclarationDate", v)}
              />
              <Text style={[styles.label, { marginLeft: 14 }]}>Time:</Text>
              <HintBoxRow
                hints={["H", "H", "M", "M"]}
                value={form.hospitalDeclarationTime}
                onChange={(v) => setField("hospitalDeclarationTime", v)}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
  return (
    <ScrollView>
      <View>
        {/* ── FORM HEADER ── */}
        <View style={styles.formHeaderContainer}>
          <View style={styles.formTopRow}>
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/HospitalPortal/Icon/PreAuthMediAssist_new.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              {/* <Text style={styles.logoText}>Medi Assist</Text> */}
            </View>

            <View style={styles.centerTitleBlock}>
              {/* <Text style={styles.formMainTitle}>REIMBURSEMENT CLAIM FORM</Text>
              <Text style={styles.formSubTitle}>
                TO BE FILLED BY THE INSURED
              </Text>
              <Text style={styles.formNoteCenter}>
                The issue of this Form is not to be taken as an admission of
                liability
              </Text> */}
              <Text style={styles.formMainTitle}>
                REQUEST FOR CASHLESS HOSPITALISATION
              </Text>
              <Text style={styles.formSubTitle}>
                FOR HEALTH INSURANCE POLICY
              </Text>
              <Text style={styles.formNoteCenter}>PART C (Revised)</Text>
            </View>

            <Text style={styles.formNoteRight}>
              (To be Filled in block letters)
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION A — DETAILS OF PRIMARY INSURED
        ══════════════════════════════════════════════════════ */}
        {/* ── HOSPITAL HEADER FIELDS ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.inlineRow}>
            <Text style={styles.label}>Name of the hospital:</Text>
            <CharBoxRow
              length={40}
              value={form.hospitalName}
              onChange={(v) => setField("hospitalName", v)}
            />
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>Hospital location:</Text>
              <CharBoxRow
                length={26}
                value={form.hospitalLocation}
                onChange={(v) => setField("hospitalLocation", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>Hospital ID:</Text>
              <CharBoxRow
                length={12}
                value={form.hospitalId}
                onChange={(v) => setField("hospitalId", v)}
              />
            </View>
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>Hospital email ID:</Text>
              <CharBoxRow
                length={24}
                value={form.hospitalEmail}
                onChange={(v) => setField("hospitalEmail", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>ROHINI ID:</Text>
              <CharBoxRow
                length={12}
                value={form.rohiniId}
                onChange={(v) => setField("rohiniId", v)}
              />
            </View>
          </View>
        </View>

        {/* ── TPA DETAILS (static) ── */}
        <View
          style={[
            styles.sectionContainer,
            { backgroundColor: "#f5f5f5", padding: 6 },
          ]}
        >
          <Text style={[styles.label, { fontWeight: "700", marginBottom: 4 }]}>
            DETAILS OF THIRD PARTY ADMINISTRATOR
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>
              a) Name of TPA company:{" "}
              <Text style={{ fontWeight: "700" }}>
                Medi Assist Insurance TPA Pvt Ltd
              </Text>
            </Text>
            <Text style={styles.label}>
              b) Phone no.:{" "}
              <Text style={{ fontWeight: "700" }}>080 22068666</Text>
            </Text>
            <Text style={styles.label}>
              c) Toll Free Fax no.:{" "}
              <Text style={{ fontWeight: "700" }}>1800 425 9559</Text>
            </Text>
          </View>
        </View>

        {/* ── TO BE FILLED BY INSURED/PATIENT ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              TO BE FILLED BY INSURED/PATIENT
            </Text>
            <View style={styles.line} />
          </View>

          {/* a) Patient name */}
          <View style={styles.inlineRow}>
            <Text style={styles.label}>a) Name of the patient:</Text>
            <CharBoxRow
              length={38}
              value={form.patientName}
              onChange={(v) => setField("patientName", v)}
            />
          </View>

          {/* b) Gender  c) Contact  d) Alt Contact */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>b) Gender:</Text>
              <Text style={styles.smallText}>Male</Text>
              <ToggleCheckbox
                checked={form.gender === "male"}
                onPress={() =>
                  setField("gender", form.gender === "male" ? "" : "male")
                }
              />
              <Text style={styles.smallText}>Female</Text>
              <ToggleCheckbox
                checked={form.gender === "female"}
                onPress={() =>
                  setField("gender", form.gender === "female" ? "" : "female")
                }
              />
              <Text style={styles.smallText}>Third gender</Text>
              <ToggleCheckbox
                checked={form.gender === "third"}
                onPress={() =>
                  setField("gender", form.gender === "third" ? "" : "third")
                }
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>c) Contact no.:</Text>
              <CharBoxRow
                length={10}
                value={form.contactNumber}
                onChange={(v) => setField("contactNumber", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>d) Alternate contact no.:</Text>
              <CharBoxRow
                length={10}
                value={form.altContactNumber}
                onChange={(v) => setField("altContactNumber", v)}
              />
            </View>
          </View>

          {/* e) Age  f) DOB  g) Insurer ID */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>e) Age: Years</Text>
              <CharBoxRow
                length={2}
                value={form.ageYears}
                onChange={(v) => setField("ageYears", v)}
              />
              <Text style={styles.smallText}>Months</Text>
              <CharBoxRow
                length={2}
                value={form.ageMonths}
                onChange={(v) => setField("ageMonths", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>f) Date of birth:</Text>
              <CharBoxRow
                length={8}
                value={form.dob}
                onChange={(v) => setField("dob", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>g) Insurer ID card no.:</Text>
              <CharBoxRow
                length={18}
                value={form.insurerIdCardNo}
                onChange={(v) => setField("insurerIdCardNo", v)}
              />
            </View>
          </View>

          {/* h) Policy  i) Employee ID */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                h) Policy number/Name of corporate:
              </Text>
              <CharBoxRow
                length={24}
                value={form.policyNumberCorporate}
                onChange={(v) => setField("policyNumberCorporate", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>i) Employee ID:</Text>
              <CharBoxRow
                length={10}
                value={form.employeeId}
                onChange={(v) => setField("employeeId", v)}
              />
            </View>
          </View>

          {/* j) Other insurance */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                j) Currently do you have any other medical claim/health
                Insurance:
              </Text>
              <ToggleCheckbox
                checked={yesSelected(form.otherInsurance)}
                onPress={() =>
                  setField(
                    "otherInsurance",
                    yesSelected(form.otherInsurance) ? "" : "yes",
                  )
                }
              />
              <Text style={styles.smallText}>Yes</Text>
              <ToggleCheckbox
                checked={noSelected(form.otherInsurance)}
                onPress={() =>
                  setField(
                    "otherInsurance",
                    noSelected(form.otherInsurance) ? "" : "no",
                  )
                }
              />
              <Text style={styles.smallText}>No</Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>j.1) Insurer name:</Text>
              <CharBoxRow
                length={18}
                value={form.insurerName}
                onChange={(v) => setField("insurerName", v)}
              />
            </View>
          </View>

          {/* j.2 Give details */}
          <View style={styles.inlineRow}>
            <Text style={styles.label}>j.2) Give details:</Text>
            <TextInput
              style={[styles.longInputWide, { height: 40, width: 400 }]}
              value={form.otherInsuranceDetails}
              onChangeText={(t) => setField("otherInsuranceDetails", t)}
              multiline
            />
          </View>

          {/* k) Family physician */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                k) Do you have a family physician, if yes: Name:
              </Text>
              <CharBoxRow
                length={20}
                value={form.familyPhysicianName}
                onChange={(v) => setField("familyPhysicianName", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>k.1) Contact no.:</Text>
              <CharBoxRow
                length={10}
                value={form.familyPhysicianContact}
                onChange={(v) => setField("familyPhysicianContact", v)}
              />
            </View>
          </View>

          {/* L) Occupation */}
          <View style={styles.inlineRow}>
            <Text style={styles.label}>L) Occupation of insured patient:</Text>
            <CharBoxRow
              length={18}
              value={form.occupation}
              onChange={(v) => setField("occupation", v)}
            />
          </View>

          {/* m) Address */}
          <View style={styles.inlineRow}>
            <Text style={styles.label}>m) Address of insured patient:</Text>
            <TextInput
              style={[styles.longInputWide, { height: 40, width: 400 }]}
              value={form.patientAddress}
              onChangeText={(t) => setField("patientAddress", t)}
              multiline
            />
          </View>
        </View>

        {/* ── TO BE FILLED BY TREATING DOCTOR/HOSPITAL ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              TO BE FILLED BY THE TREATING DOCTOR/HOSPITAL
            </Text>
            <View style={styles.line} />
          </View>

          {/* a) Doctor name  b) Contact */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>a) Name of the treating doctor:</Text>
              <CharBoxRow
                length={24}
                value={form.treatingDoctorName}
                onChange={(v) => setField("treatingDoctorName", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>b) Contact no.:</Text>
              <CharBoxRow
                length={10}
                value={form.treatingDoctorContact}
                onChange={(v) => setField("treatingDoctorContact", v)}
              />
            </View>
          </View>

          {/* c) Illness  d) Clinical findings */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                c) Name of Illness/disease with presenting complaints:
              </Text>
              <TextInput
                style={[styles.longInputWide, { height: 50, width: "100%" }]}
                value={form.illnessComplaints}
                onChangeText={(t) => setField("illnessComplaints", t)}
                multiline
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.label}>d) Relevant clinical findings:</Text>
              <TextInput
                style={[styles.longInputWide, { height: 50, width: "100%" }]}
                value={form.clinicalFindings}
                onChangeText={(t) => setField("clinicalFindings", t)}
                multiline
              />
            </View>
          </View>

          {/* e) Duration  e.1) First consultation */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                e) Duration of the present ailment:
              </Text>
              <TextInput
                style={[styles.longInput, { width: 80 }]}
                value={form.durationOfAilment}
                onChangeText={(t) => setField("durationOfAilment", t)}
              />
              <Text style={styles.smallText}>days</Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>e.1) Date of first consultation:</Text>
              <CharBoxRow
                length={8}
                value={form.firstConsultationDate}
                onChange={(v) => setField("firstConsultationDate", v)}
              />
            </View>
          </View>

          {/* e.2) Past history */}
          <View style={styles.inlineRow}>
            <Text style={styles.label}>
              e.2) Past history of present ailment if any:
            </Text>
            <TextInput
              style={[styles.longInputWide, { height: 36, width: 400 }]}
              value={form.pastHistory}
              onChangeText={(t) => setField("pastHistory", t)}
              multiline
            />
          </View>

          {/* f) Provisional diagnosis  f.1) ICD10 */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>f) Provisional diagnosis:</Text>
              <TextInput
                style={[styles.longInputWide, { height: 50, width: "100%" }]}
                value={form.provisionalDiagnosis}
                onChangeText={(t) => setField("provisionalDiagnosis", t)}
                multiline
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>f.1) ICD 10 code:</Text>
              <CharBoxRow
                length={10}
                value={form.icd10Code}
                onChange={(v) => setField("icd10Code", v)}
              />
            </View>
          </View>

          {/* g) Proposed line of treatment */}
          <View style={styles.inlineRow}>
            <Text style={styles.label}>g) Proposed line of treatment:</Text>
            {[
              { key: "proposedTreatmentMedical", label: "Medical management" },
              {
                key: "proposedTreatmentSurgical",
                label: "Surgical management",
              },
              {
                key: "proposedTreatmentIntensiveCare",
                label: "Intensive care",
              },
              { key: "proposedTreatmentInvestigation", label: "Investigation" },
              {
                key: "proposedTreatmentNonAllopathic",
                label: "Non-Allopathic treatment",
              },
            ].map((item) => (
              <React.Fragment key={item.key}>
                <ToggleCheckbox
                  checked={!!form[item.key]}
                  onPress={() => setField(item.key, !form[item.key])}
                />
                <Text style={styles.smallText}>{item.label}</Text>
              </React.Fragment>
            ))}
          </View>

          {/* h) Investigation details  h.1) Drug route */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                h) If investigation and/or medical management, provide details:
              </Text>
              <TextInput
                style={[styles.longInputWide, { height: 50, width: "100%" }]}
                value={form.investigationDetails}
                onChangeText={(t) => setField("investigationDetails", t)}
                multiline
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>
                h.1) Route of drug administration:
              </Text>
              <View style={styles.inlineRow}>
                <ToggleCheckbox
                  checked={form.drugAdministrationRoute === "iv"}
                  onPress={() => setField("drugAdministrationRoute", "iv")}
                />
                <Text style={styles.smallText}>IV</Text>
                <ToggleCheckbox
                  checked={form.drugAdministrationRoute === "oral"}
                  onPress={() => setField("drugAdministrationRoute", "oral")}
                />
                <Text style={styles.smallText}>Oral</Text>
                <ToggleCheckbox
                  checked={
                    !!form.drugAdministrationRoute &&
                    !["iv", "oral"].includes(form.drugAdministrationRoute)
                  }
                  onPress={() => setField("drugAdministrationRoute", "other")}
                />
                <Text style={styles.smallText}>Other</Text>
              </View>
            </View>
          </View>

          {/* i) Surgery name  i.1) ICD10 PCS */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>i) If Surgical, name of surgery:</Text>
              <TextInput
                style={[styles.longInputWide, { height: 50, width: "100%" }]}
                value={form.surgeryName}
                onChangeText={(t) => setField("surgeryName", t)}
                multiline
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>i.1) ICD 10 PCS code:</Text>
              <CharBoxRow
                length={10}
                value={form.icd10PcsCode}
                onChange={(v) => setField("icd10PcsCode", v)}
              />
            </View>
          </View>

          {/* j) Other treatment  k) Injury occurrence */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                j) If other treatments provide details:
              </Text>
              <TextInput
                style={[styles.longInputWide, { height: 50, width: "100%" }]}
                value={form.otherTreatmentDetails}
                onChangeText={(t) => setField("otherTreatmentDetails", t)}
                multiline
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.label}>k) How did injury occur:</Text>
              <TextInput
                style={[styles.longInputWide, { height: 50, width: "100%" }]}
                value={form.injuryOccurrence}
                onChangeText={(t) => setField("injuryOccurrence", t)}
                multiline
              />
            </View>
          </View>

          {/* L) Accident fields */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                L) In case of accident: I. Is it RTA:
              </Text>
              <ToggleCheckbox
                checked={!!form.isRta}
                onPress={() => setField("isRta", !form.isRta)}
              />
              <Text style={styles.smallText}>Yes</Text>
              <ToggleCheckbox
                checked={!form.isRta}
                onPress={() => setField("isRta", false)}
              />
              <Text style={styles.smallText}>No</Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>ii. Date of injury:</Text>
              <CharBoxRow
                length={8}
                value={form.dateOfInjury}
                onChange={(v) => setField("dateOfInjury", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>iii. Reported to Police:</Text>
              <ToggleCheckbox
                checked={!!form.reportedPolice}
                onPress={() => setField("reportedPolice", !form.reportedPolice)}
              />
              <Text style={styles.smallText}>Yes</Text>
              <ToggleCheckbox
                checked={!form.reportedPolice}
                onPress={() => setField("reportedPolice", false)}
              />
              <Text style={styles.smallText}>No</Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>iv. FIR no.:</Text>
              <CharBoxRow
                length={8}
                value={form.firNo}
                onChange={(v) => setField("firNo", v)}
              />
            </View>
          </View>

          {/* v) Substance  vi) Test */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                v. Injury/Disease caused due to substance abuse/alcohol
                consumption:
              </Text>
              <ToggleCheckbox
                checked={!!form.injurySubstance}
                onPress={() =>
                  setField("injurySubstance", !form.injurySubstance)
                }
              />
              <Text style={styles.smallText}>Yes</Text>
              <ToggleCheckbox
                checked={!form.injurySubstance}
                onPress={() => setField("injurySubstance", false)}
              />
              <Text style={styles.smallText}>No</Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                vi. Test conducted to establish this, If yes attach reports:
              </Text>
              <ToggleCheckbox
                checked={yesSelected(form.substanceTestDone)}
                onPress={() =>
                  setField(
                    "substanceTestDone",
                    yesSelected(form.substanceTestDone) ? "" : "yes",
                  )
                }
              />
              <Text style={styles.smallText}>Yes</Text>
              <ToggleCheckbox
                checked={noSelected(form.substanceTestDone)}
                onPress={() =>
                  setField(
                    "substanceTestDone",
                    noSelected(form.substanceTestDone) ? "" : "no",
                  )
                }
              />
              <Text style={styles.smallText}>No</Text>
            </View>
          </View>

          {/* m) Maternity  n) Expected delivery */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>m) In case of maternity:</Text>
              <Text style={styles.smallText}>G</Text>
              <TextInput
                style={[styles.longInput, { width: 60 }]}
                value={form.maternityG}
                onChangeText={(t) => setField("maternityG", t)}
              />
              <Text style={styles.smallText}>P</Text>
              <TextInput
                style={[styles.longInput, { width: 60 }]}
                value={form.maternityP}
                onChangeText={(t) => setField("maternityP", t)}
              />
              <Text style={styles.smallText}>L</Text>
              <TextInput
                style={[styles.longInput, { width: 60 }]}
                value={form.maternityL}
                onChangeText={(t) => setField("maternityL", t)}
              />
              <Text style={styles.smallText}>A</Text>
              <TextInput
                style={[styles.longInput, { width: 60 }]}
                value={form.maternityA}
                onChangeText={(t) => setField("maternityA", t)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>n) Expected date of delivery:</Text>
              <CharBoxRow
                length={8}
                value={form.expectedDeliveryDate}
                onChange={(v) => setField("expectedDeliveryDate", v)}
              />
            </View>
          </View>
        </View>

        {/* ── DETAILS OF PATIENT ADMITTED ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              DETAILS OF THE PATIENT ADMITTED
            </Text>
            <View style={styles.line} />
          </View>

          {/* a) Admission date  b) Time  c) Emergency/Planned */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>a) Date of admission:</Text>
              <CharBoxRow
                length={8}
                value={form.dateOfAdmission}
                onChange={(v) => setField("dateOfAdmission", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>b) Time of admission:</Text>
              <CharBoxRow
                length={4}
                value={form.timeOfAdmission}
                onChange={(v) => setField("timeOfAdmission", v)}
              />
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>c) This is</Text>
              <ToggleCheckbox
                checked={!!form.isEmergencyHospitalization}
                onPress={() =>
                  setField(
                    "isEmergencyHospitalization",
                    !form.isEmergencyHospitalization,
                  )
                }
              />
              <Text style={styles.smallText}>an emergency/</Text>
              <ToggleCheckbox
                checked={!!form.isPlannedHospitalization}
                onPress={() =>
                  setField(
                    "isPlannedHospitalization",
                    !form.isPlannedHospitalization,
                  )
                }
              />
              <Text style={styles.smallText}>
                a planned hospitalization event
              </Text>
            </View>
          </View>

          {/* d) Expected days  e) ICU days  f) Room type */}
          <View style={styles.rowBetween}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>
                d) Expected no. of days stay in hospital:
              </Text>
              <TextInput
                style={[styles.longInput, { width: 80 }]}
                value={form.expectedDaysStay}
                onChangeText={(t) => setField("expectedDaysStay", t)}
              />
              <Text style={styles.smallText}>Days</Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>e) Days in ICU:</Text>
              <TextInput
                style={[styles.longInput, { width: 80 }]}
                value={form.icuDays}
                onChangeText={(t) => setField("icuDays", t)}
              />
              <Text style={styles.smallText}>Days</Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>f) Room type:</Text>
              <TextInput
                style={[styles.longInput, { width: 120 }]}
                value={form.roomType}
                onChangeText={(t) => setField("roomType", t)}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Reusable SectionBar ───────────────────────────────────────────────────────
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

// ─── Styles (identical to original stylesWeb) ──────────────────────────────────
const styles = StyleSheet.create({
  formHeaderContainer: { paddingVertical: 10 },
  formTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: { flexDirection: "column", alignItems: "center", width: "20%" },
  logo: { width: 100, height: 100, marginRight: 4 },
  logoText: { fontSize: 24, color: "#2F5597", fontWeight: "600" },
  centerTitleBlock: { width: "60%", alignItems: "center" },
  formMainTitle: { fontSize: 18, fontWeight: "700", letterSpacing: 0.5 },
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
    fontWeight: "700",
  },

  //sectionContainer: { marginTop: 10 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  line: { flex: 1, height: 1, backgroundColor: "#000" },
  dividerText: { marginHorizontal: 10, fontSize: 12, fontWeight: "700" },
  sectionContentRow: { flexDirection: "row" },

  rowBetween: { flexDirection: "row", gap: 10, marginBottom: 6 },
  rowBetweenDiagnosis: { flexDirection: "row", gap: 120, marginBottom: 6 },
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

  inlineRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  inlineRows: { flexDirection: "row", alignSelf: "flex-end", marginBottom: 6 },

  label: { fontSize: 11, marginRight: 6 },
  smallText: { fontSize: 11, marginRight: 6 },

  boxRow: { flexDirection: "row" },
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

  longInput: { width: 180, height: 18, borderWidth: 1, borderColor: "#999" },
  longInputWide: {
    width: 300,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
  },
  placeInput: { width: 200, height: 18, borderWidth: 1, borderColor: "#999" },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  addressBoxes: { flexDirection: "column", marginLeft: 6 },

  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#000",
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#1976D2", borderColor: "#1976D2" },
  checkmark: { color: "#fff", fontSize: 10, lineHeight: 12 },

  sectionBar: { width: 28, alignItems: "center", marginLeft: 6 },
  sectionLine: {
    flex: 1,
    width: 10,
    backgroundColor: "#000",
    marginVertical: 2,
  },
  sectionTextWrap: {
    paddingVertical: 19,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "700",
    transform: [{ rotate: "90deg" }],
  },

  sectionEChecklist: { width: 260, marginLeft: 10 },

  tableContainer: { flex: 1, borderWidth: 1, borderColor: "#000" },
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
    padding: 4,
    fontSize: 11,
    justifyContent: "center",
  },
  tableCellSmall: {
    width: 20,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 9,
  },
  tableCellInputWrap: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 2,
    justifyContent: "center",
  },
  tableInput: {
    fontSize: 10,
    height: 24,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 4,
  },

  declarationText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
    textAlign: "left",
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
  signatureImage: { width: "100%", height: "100%" },
  signaturePlaceholder: { fontSize: 10, color: "#aaa", fontStyle: "italic" },
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

  twoColRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  amountRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  amountLabel: { flex: 1, fontSize: 10, marginRight: 4 },
  amountInput: {
    width: 80,
    height: 22,
    borderWidth: 1,
    borderColor: "#999",
    paddingHorizontal: 4,
    fontSize: 10,
  },
  chronicRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  mmyyInput: {
    width: 50,
    height: 20,
    borderWidth: 1,
    borderColor: "#999",
    fontSize: 9,
    paddingHorizontal: 2,
    textAlign: "center",
  },
  textArea: {
    height: 50,
    borderWidth: 1,
    borderColor: "#999",
    padding: 4,
    fontSize: 10,
    marginTop: 4,
  },
  //   sectionContainer: {
  //     marginTop: 12,
  //     borderTopWidth: 1,
  //     borderTopColor: "#ddd",
  //     paddingTop: 8,
  //   },
  sectionContainer: {
    marginTop: 12,
    paddingTop: 8,
  },
  hintBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 10,
    padding: 0,
  },
  hintBoxSmall: {
    width: 16,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    margin: 1,
    textAlign: "center",
    fontSize: 8,
    padding: 0,
  },
  sealBox: {
    width: "100%",
    height: 46,
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 4,
  },
});
