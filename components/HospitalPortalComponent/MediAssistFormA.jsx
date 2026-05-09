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
import { padChars } from "../../utils/MediAssistMapper";

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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MediAssistFormAContent({
  form,
  setField,
  signatureImage,
  setSignatureImage,
  navigation,
}) {
  return (
    <ScrollView>
      <View>
        {/* ── FORM HEADER ── */}
        <View style={styles.formHeaderContainer}>
          <View style={styles.formTopRow}>
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/HospitalPortal/Icon/mediassit.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Medi Assist</Text>
            </View>

            <View style={styles.centerTitleBlock}>
              <Text style={styles.formMainTitle}>REIMBURSEMENT CLAIM FORM</Text>
              <Text style={styles.formSubTitle}>
                TO BE FILLED BY THE INSURED
              </Text>
              <Text style={styles.formNoteCenter}>
                The issue of this Form is not to be taken as an admission of
                liability
              </Text>
            </View>

            <Text style={styles.formNoteRight}>
              (To be Filled in block letters)
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION A — DETAILS OF PRIMARY INSURED
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>DETAILS OF PRIMARY INSURED:</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={{ flex: 1 }}>
              {/* Policy + Certificate */}
              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>a) Policy No.:</Text>
                  <CharBoxRow
                    length={18}
                    value={form.policyNumber}
                    onChange={(v) => setField("policyNumber", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>b) Sl. No./Certificate no.</Text>
                  <CharBoxRow
                    length={14}
                    value={form.certificateNumber}
                    onChange={(v) => setField("certificateNumber", v)}
                  />
                </View>
              </View>

              {/* TPA ID */}
              <View style={styles.inlineRow}>
                <Text style={styles.label}>c) Company / TPA ID (MA ID)No:</Text>
                <CharBoxRow
                  length={22}
                  value={form.tpaId}
                  onChange={(v) => setField("tpaId", v)}
                />
              </View>

              {/* Name */}
              <View style={styles.inlineRow}>
                <Text style={styles.label}>d) Name:</Text>
                <CharBoxRow
                  length={40}
                  value={form.primaryName}
                  onChange={(v) => setField("primaryName", v)}
                />
              </View>

              {/* Address */}
              <View style={styles.addressRow}>
                <Text style={styles.label}>e) Address:</Text>
                <View style={styles.addressBoxes}>
                  <CharBoxRow
                    length={40}
                    value={form.primaryAddressRow1}
                    onChange={(v) => setField("primaryAddressRow1", v)}
                  />
                  <CharBoxRow
                    length={35}
                    value={form.primaryAddressRow2}
                    onChange={(v) => setField("primaryAddressRow2", v)}
                  />
                </View>
              </View>

              {/* City + State */}
              <View style={styles.rowBetweens}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>City:</Text>
                  <CharBoxRow
                    length={18}
                    value={form.primaryCity}
                    onChange={(v) => setField("primaryCity", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>State:</Text>
                  <CharBoxRow
                    length={18}
                    value={form.primaryState}
                    onChange={(v) => setField("primaryState", v)}
                  />
                </View>
              </View>

              {/* Pin + Phone + Email */}
              <View style={styles.rowBetweensLast}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Pin Code:</Text>
                  <CharBoxRow
                    length={6}
                    value={form.primaryPin}
                    onChange={(v) => setField("primaryPin", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Phone No:</Text>
                  <CharBoxRow
                    length={10}
                    value={form.primaryPhone}
                    onChange={(v) => setField("primaryPhone", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Email ID:</Text>
                  <TextInput
                    style={styles.longInput}
                    value={form.primaryEmail}
                    onChangeText={(t) => setField("primaryEmail", t)}
                  />
                </View>
              </View>
            </View>

            <SectionBar label="SECTION A" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION B — DETAILS OF INSURANCE HISTORY
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              DETAILS OF INSURANCE HISTORY:
            </Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    a) Currently covered by any other Mediclaim / Health
                    Insurance:
                  </Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>Yes</Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>No</Text>
                </View>

                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    b) Date of commencement of first Insurance without break:
                  </Text>
                  <View style={styles.boxRow}>
                    {["D", "D", "M", "M", "Y", "Y", "Y", "Y"].map((_, i) => (
                      <TextInput
                        key={i}
                        style={styles.squareBox}
                        maxLength={1}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>c) If yes, company name:</Text>
                  <View style={styles.boxRow}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <TextInput key={i} style={styles.squareBox} />
                    ))}
                  </View>
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Policy No.</Text>
                  <View style={styles.boxRow}>
                    {Array.from({ length: 18 }).map((_, i) => (
                      <TextInput key={i} style={styles.squareBox} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Sum insured (Rs.)</Text>
                  <View style={styles.boxRow}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <TextInput key={i} style={styles.squareBox} />
                    ))}
                  </View>
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    d) Have you been hospitalized in the last four years since
                    inception of the contract?
                  </Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>Yes</Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>No</Text>
                  <Text style={[styles.label, { marginLeft: 10 }]}>Date:</Text>
                  <View style={styles.boxRow}>
                    {["M", "M", "Y", "Y"].map((_, i) => (
                      <TextInput key={i} style={styles.squareBox} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.rowBetweenDiagnosis}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Diagnosis:</Text>
                  <TextInput
                    style={styles.longInputWide}
                    value={form.diagnosis}
                    onChangeText={(t) => setField("diagnosis", t)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    e) Previously covered by any other Mediclaim /Health
                    insurance:
                  </Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>Yes</Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>No</Text>
                </View>
              </View>

              <View style={styles.inlineRow}>
                <Text style={styles.label}>f) If yes, company name:</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 22 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
              </View>
            </View>

            <SectionBar label="SECTION B" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION C — DETAILS OF INSURED PERSON HOSPITALIZED
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              DETAILS OF INSURED PERSON HOSPITALIZED:
            </Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>a) Name:</Text>
                <CharBoxRow
                  length={40}
                  value={form.hospitalizedName}
                  onChange={(v) => setField("hospitalizedName", v)}
                />
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>b) Gender</Text>
                  <Text style={styles.smallText}>Male</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setField("gender", form.gender === "male" ? "" : "male")
                    }
                    style={[
                      styles.checkbox,
                      form.gender === "male" && { backgroundColor: "#1976D2" },
                    ]}
                  />
                  <Text style={styles.smallText}>Female</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setField(
                        "gender",
                        form.gender === "female" ? "" : "female",
                      )
                    }
                    style={[
                      styles.checkbox,
                      form.gender === "female" && {
                        backgroundColor: "#1976D2",
                      },
                    ]}
                  />
                </View>

                <View style={styles.inlineRow}>
                  <Text style={styles.label}>c) Age years</Text>
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
                  <Text style={styles.label}>d) Date of Birth</Text>
                  <CharBoxRow
                    length={8}
                    value={form.dob}
                    onChange={(v) => setField("dob", v)}
                  />
                </View>
              </View>

              {/* Relationship */}
              <View style={styles.inlineRow}>
                <Text style={styles.label}>
                  e) Relationship to Primary insured:
                </Text>
                {["Self", "Spouse", "Child", "Father", "Mother", "Other"].map(
                  (item, i) => (
                    <React.Fragment key={i}>
                      <Text style={styles.smallText}>{item}</Text>
                      <View style={styles.checkbox} />
                    </React.Fragment>
                  ),
                )}
                <Text style={styles.smallText}>(Please Specify)</Text>
                <TextInput style={styles.longInputWide} />
              </View>

              {/* Occupation */}
              <View style={styles.inlineRow}>
                <Text style={styles.label}>f) Occupation</Text>
                {[
                  "Service",
                  "Self Employed",
                  "Home Maker",
                  "Student",
                  "Retired",
                  "Other",
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    <Text style={styles.smallText}>{item}</Text>
                    <View style={styles.checkbox} />
                  </React.Fragment>
                ))}
                <Text style={styles.smallText}>(Please Specify)</Text>
                <TextInput style={styles.longInputWide} />
              </View>

              {/* Address */}
              <View style={styles.addressRow}>
                <Text style={styles.label}>
                  g) Address (if different from above):
                </Text>
                <View style={styles.addressBoxes}>
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

              {/* City + State */}
              <View style={styles.rowBetweens}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>City:</Text>
                  <CharBoxRow
                    length={18}
                    value={form.hospCity}
                    onChange={(v) => setField("hospCity", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>State:</Text>
                  <CharBoxRow
                    length={18}
                    value={form.hospState}
                    onChange={(v) => setField("hospState", v)}
                  />
                </View>
              </View>

              {/* Pin + Phone + Email */}
              <View style={styles.rowBetweensLast}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Pin Code:</Text>
                  <CharBoxRow
                    length={6}
                    value={form.hospPin}
                    onChange={(v) => setField("hospPin", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Phone No:</Text>
                  <CharBoxRow
                    length={10}
                    value={form.hospPhone}
                    onChange={(v) => setField("hospPhone", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Email ID:</Text>
                  <TextInput
                    style={styles.longInput}
                    value={form.hospEmail}
                    onChangeText={(t) => setField("hospEmail", t)}
                  />
                </View>
              </View>
            </View>

            <SectionBar label="SECTION C" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION D — DETAILS OF HOSPITALIZATION
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>DETAILS OF HOSPITALIZATION:</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.inlineRow}>
                <Text style={styles.label}>
                  a) Name of Hospital where Admitted:
                </Text>
                <CharBoxRow
                  length={40}
                  value={form.hospitalName}
                  onChange={(v) => setField("hospitalName", v)}
                />
              </View>

              <View style={styles.inlineRow}>
                <Text style={styles.label}>b) Room Category occupied:</Text>
                {[
                  "Day care",
                  "Single occupancy",
                  "Twin sharing",
                  "3 or more beds per room",
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    <Text style={styles.smallText}>{item}</Text>
                    <View style={styles.checkbox} />
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>c) Hospitalization due to:</Text>
                  {["Injury", "Illness", "Maternity"].map((item, i) => (
                    <React.Fragment key={i}>
                      <Text style={styles.smallText}>{item}</Text>
                      <View style={styles.checkbox} />
                    </React.Fragment>
                  ))}
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    d) Date of injury / Date Disease first detected / Date of
                    Delivery:
                  </Text>
                  <CharBoxRow
                    length={8}
                    value={form.injuryDate}
                    onChange={(v) => setField("injuryDate", v)}
                  />
                </View>
              </View>

              {/* Admission / Discharge dates */}
              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>e) Date of Admission:</Text>
                  <CharBoxRow
                    length={8}
                    value={form.admissionDate}
                    onChange={(v) => setField("admissionDate", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>f) Time:</Text>
                  <CharBoxRow
                    length={4}
                    value={form.admissionTime}
                    onChange={(v) => setField("admissionTime", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>g) Date of Discharge:</Text>
                  <CharBoxRow
                    length={8}
                    value={form.dischargeDate}
                    onChange={(v) => setField("dischargeDate", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>h) Time:</Text>
                  <CharBoxRow
                    length={4}
                    value={form.dischargeTime}
                    onChange={(v) => setField("dischargeTime", v)}
                  />
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>i) If injury give cause:</Text>
                  {[
                    "Self inflicted",
                    "Road Traffic Accident",
                    "Substance Abuse / Alcohol Consumption",
                  ].map((item, i) => (
                    <React.Fragment key={i}>
                      <Text style={styles.smallText}>{item}</Text>
                      <View style={styles.checkbox} />
                    </React.Fragment>
                  ))}
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>ii) Reported to Police</Text>
                  <View style={styles.checkbox} />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    iii. MLC Report & Police FIR attached
                  </Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>Yes</Text>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>No</Text>
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>j) System of Medicine:</Text>
                  <TextInput
                    style={styles.longInputWide}
                    value={form.treatingDoctor}
                    onChangeText={(t) => setField("treatingDoctor", t)}
                  />
                </View>
              </View>
            </View>

            <SectionBar label="SECTION D" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION E — DETAILS OF CLAIM
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>DETAILS OF CLAIM:</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                a) Details of the Treatment expenses claimed
              </Text>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>
                  i. Pre-hospitalization expenses Rs.
                </Text>
                <CharBoxRow
                  length={8}
                  value={form.claimPre}
                  onChange={(v) => setField("claimPre", v)}
                />
                <Text style={styles.label}>
                  ii. Hospitalization expenses Rs.
                </Text>
                <CharBoxRow
                  length={8}
                  value={form.claimHospital}
                  onChange={(v) => setField("claimHospital", v)}
                />
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>
                  iii. Post-hospitalization expenses Rs.
                </Text>
                <CharBoxRow
                  length={8}
                  value={form.claimPost}
                  onChange={(v) => setField("claimPost", v)}
                />
                <Text style={styles.label}>iv. Health-Check up cost Rs.</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>v. Ambulance Charges Rs.</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
                <Text style={styles.label}>vi. Others (code):</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
                <Text style={styles.label}>Rs.</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
              </View>

              {/* Total */}
              <View style={styles.inlineRows}>
                <Text
                  style={[styles.label, { fontWeight: "500", fontSize: 30 }]}
                >
                  Total Rs.
                </Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBoxs} />
                  ))}
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    vii. Pre-hospitalization period: days
                  </Text>
                  <View style={styles.boxRow}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TextInput key={i} style={styles.squareBox} />
                    ))}
                  </View>
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    viii. Post-hospitalization period: days
                  </Text>
                  <View style={styles.boxRow}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TextInput key={i} style={styles.squareBox} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inlineRow}>
                <Text style={styles.label}>
                  b) Claim for Domiciliary Hospitalization:
                </Text>
                <View style={styles.checkbox} />
                <Text style={styles.smallText}>Yes</Text>
                <View style={styles.checkbox} />
                <Text style={styles.smallText}>No</Text>
                <Text style={styles.smallText}>
                  (If yes, provide details in annexure)
                </Text>
              </View>

              <Text style={styles.label}>
                c) Details of Lump sum / cash benefit claimed:
              </Text>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>i. Hospital Daily cash Rs.</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
                <Text style={styles.label}>ii. Surgical Cash Rs.</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>
                  iii. Critical Illness benefit Rs.
                </Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
                <Text style={styles.label}>iv. Convalescence Rs.</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>
                  v. Pre/Post hospitalization Lump sum benefit Rs.
                </Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
                <Text style={styles.label}>vi. Others Rs.</Text>
                <View style={styles.boxRow}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TextInput key={i} style={styles.squareBox} />
                  ))}
                </View>
              </View>
            </View>

            {/* Checklist */}
            <View style={styles.sectionEChecklist}>
              <Text style={styles.label}>
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
                <View key={i} style={styles.inlineRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.smallText}>{item}</Text>
                </View>
              ))}
            </View>

            <SectionBar label="SECTION E" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION F — DETAILS OF BILLS ENCLOSED
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>DETAILS OF BILLS ENCLOSED:</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={styles.tableContainer}>
              <View style={styles.tableRowHeader}>
                <Text style={[styles.tableCell, { width: 50 }]}>Sl. No.</Text>
                <Text style={[styles.tableCell, { width: 80 }]}>Bill No.</Text>
                <Text style={[styles.tableCell, { width: 120 }]}>Date</Text>
                <Text style={[styles.tableCell, { width: 200 }]}>
                  Issued by
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>Towards</Text>
                <Text style={[styles.tableCell, { width: 200 }]}>
                  Amount (Rs)
                </Text>
              </View>

              {Array.from({ length: 10 }).map((_, rowIndex) => (
                <View key={rowIndex} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: 50 }]}>
                    {rowIndex + 1}.
                  </Text>
                  <View style={[styles.tableCell, { width: 80 }]} />
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={styles.tableCellSmall} />
                  ))}
                  <View style={[styles.tableCell, { width: 200 }]} />
                  <View style={[styles.tableCell, { flex: 1 }]}>
                    <Text style={styles.smallText}>
                      {rowIndex === 0 && "Hospital main Bill"}
                      {rowIndex === 1 && "Pre-hospitalization Bills: Nos"}
                      {rowIndex === 2 && "Post-hospitalization Bills: Nos"}
                      {rowIndex === 3 && "Pharmacy Bills"}
                    </Text>
                  </View>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <View key={i} style={styles.tableCellSmall} />
                  ))}
                </View>
              ))}
            </View>

            <SectionBar label="SECTION F" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION G — BANK ACCOUNT DETAILS
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              DETAILS OF PRIMARY INSURED&apos;S BANK ACCOUNT:
            </Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>a) PAN:</Text>
                  <CharBoxRow
                    length={10}
                    value={form.pan}
                    onChange={(v) => setField("pan", v)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>b) Account Number:</Text>
                  <CharBoxRow
                    length={22}
                    value={form.accountNumber}
                    onChange={(v) => setField("accountNumber", v)}
                  />
                </View>
              </View>

              <View style={styles.inlineRow}>
                <Text style={styles.label}>c) Bank Name and Branch:</Text>
                <CharBoxRow
                  length={40}
                  value={form.bankNameBranch}
                  onChange={(v) => setField("bankNameBranch", v)}
                />
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>
                    d) Cheque / DD Payable details:
                  </Text>
                  <TextInput
                    style={styles.longInputWide}
                    value={form.chequeDetails}
                    onChangeText={(t) => setField("chequeDetails", t)}
                  />
                </View>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>e) IFSC Code:</Text>
                  <CharBoxRow
                    length={11}
                    value={form.ifscCode}
                    onChange={(v) => setField("ifscCode", v)}
                  />
                </View>
              </View>
            </View>

            <SectionBar label="SECTION G" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════
            SECTION H — DECLARATION
        ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionContainer}>
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>DECLARATION BY THE INSURED:</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.sectionContentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.declarationText}>
                I hereby declare that the information furnished in the claim
                form is true & correct to the best of my knowledge and belief.
                If I have made any false or untrue statement, suppression or
                concealment of any material fact with respect to questions asked
                in relation to this claim, my right to claim reimbursement shall
                be forfeited. I also consent & authorize TPA / insurance
                Company, to seek necessary medical information / documents from
                any hospital / Medical Practitioner who has attended on the
                person against whom this claim is made. I hereby declare that I
                have included all the bills / receipts for the purpose of this
                claim & that I will not be making any supplementary claim,
                except the pre/post-hospitalization claim, if any.
              </Text>

              <View style={styles.rowBetween}>
                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Date</Text>
                  <CharBoxRow
                    length={8}
                    value={form.declarationDate}
                    onChange={(v) => setField("declarationDate", v)}
                  />
                </View>

                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Place:</Text>
                  <TextInput
                    style={styles.placeInput}
                    value={form.declarationPlace}
                    onChangeText={(t) => setField("declarationPlace", t)}
                  />
                </View>

                <View style={styles.inlineRow}>
                  <Text style={styles.label}>Signature of the Insured</Text>
                  <TouchableOpacity
                    style={styles.signatureBox}
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
                        style={styles.signatureImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.signaturePlaceholder}>
                        Tap to sign
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footerDivider} />
              <Text style={styles.footerNote}>
                (IMPORTANT: PLEASE TURN OVER)
              </Text>
            </View>

            <SectionBar label="SECTION H" />
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
  logo: { width: 65, height: 60, marginRight: 6 },
  logoText: { fontSize: 16, color: "#2F5597", fontWeight: "500" },
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

  sectionContainer: { marginTop: 10 },
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
  },

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
});
