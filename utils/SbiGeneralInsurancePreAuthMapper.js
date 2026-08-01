/**
 * SbiGeneralInsurancePreauthMapper.js
 * ─────────────────────────────────────────────────────────────────
 * Maps backend analysisData → the flat field names consumed by
 * generateInsuranceFormHTML() (Sections A–F).
 *
 * IMPORTANT: field names here MUST match exactly what the HTML
 * template reads via `f.<fieldName>`. Any mismatch means the value
 * silently renders blank.
 * ─────────────────────────────────────────────────────────────────
 */

/* ═══════════════ LOW-LEVEL HELPERS ═══════════════ */

export function digitsOnly(s) {
  return String(s ?? "").replace(/\D/g, "");
}

export function truncate(s, len) {
  return String(s ?? "").slice(0, len);
}

export function upper(s, maxLen) {
  const t = String(s ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
  return maxLen ? t.slice(0, maxLen) : t;
}

// Returns DDMMYYYY digit string (matches placeholderBoxRowHtml usage in the HTML)
export function parseDateDDMMYYYY(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}${iso[2]}${iso[1]}`;
  const dmy = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/);
  if (dmy)
    return `${dmy[1].padStart(2, "0")}${dmy[2].padStart(2, "0")}${dmy[3]}`;
  const only = digitsOnly(s);
  if (only.length >= 8) return only.slice(0, 8);
  return "";
}

export function parseTimeParts(raw) {
  const d = digitsOnly(String(raw ?? ""));
  if (d.length >= 4) return { hh: d.slice(0, 2), mm: d.slice(2, 4) };
  if (d.length === 2) return { hh: d, mm: "" };
  return { hh: "", mm: "" };
}

// Returns "" if nothing usable was passed (caller decides on a default)
export function yesNo(v) {
  if (v == null) return "";
  if (v === true) return "yes";
  if (v === false) return "no";
  const t = String(v).toLowerCase().trim();
  if (["y", "yes", "true", "1"].includes(t)) return "yes";
  if (["n", "no", "false", "0"].includes(t)) return "no";
  return "";
}

/**
 * Tries each candidate in order; returns the first resolvable "yes"/"no".
 * If nothing resolves, defaults to "no" (checkbox unchecked) as requested.
 */
export function yesNoAuto(...candidates) {
  for (const c of candidates) {
    const r = yesNo(c);
    if (r) return r;
  }
  return "no";
}

export function parseBool(raw) {
  if (raw === true || raw === false) return raw;
  const t = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (["y", "yes", "true", "1"].includes(t)) return true;
  if (["n", "no", "false", "0"].includes(t)) return false;
  return false;
}

/**
 * Boolean equivalent of yesNoAuto: tries direct boolean-ish candidates
 * first, then falls back to "presence" candidates (booleans already
 * computed from inference), defaulting to false.
 */
export function boolAuto(...candidates) {
  for (const c of candidates) {
    if (c === true) return true;
    if (c === false) continue;
    if (c == null) continue;
    const t = String(c).trim().toLowerCase();
    if (["y", "yes", "true", "1"].includes(t)) return true;
  }
  return false;
}

export function parseAge(raw) {
  if (!raw) return "";
  const m = String(raw).match(/\d+/);
  return m ? m[0] : "";
}

function isFilled(value) {
  if (value == null) return false;
  if (typeof value === "boolean") return value === true;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim() !== "";
}

function firstFilled(...values) {
  return values.find((value) => {
    if (value == null) return false;
    if (typeof value === "boolean" || typeof value === "number") return true;
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim() !== "";
  });
}

/* ═══════════════ CHRONIC ILLNESS EXTRACTION ═══════════════
   Field names below MUST match generateInsuranceFormHTML's
   chronicChecked()/chronicMonth()/chronicYear() lookups:
   diabetes, heartDisease, hypertension, hyperlipidemias,
   osteoarthritis, asthma, cancer, alcoholDrugAbuse, hivStd
*/
const CHRONIC_KEYS = [
  { field: "diabetes", backendKeys: ["diabetes", "dm", "diabetes_mellitus"] },
  {
    field: "heartDisease",
    backendKeys: ["heart_disease", "cardiac", "cad", "ihd"],
  },
  {
    field: "hypertension",
    backendKeys: ["hypertension", "htn", "high_blood_pressure"],
  },
  {
    field: "hyperlipidemias",
    backendKeys: ["hyperlipidemia", "hyperlipidemias", "dyslipidemia"],
  },
  { field: "osteoarthritis", backendKeys: ["osteoarthritis", "arthritis"] },
  { field: "asthma", backendKeys: ["asthma", "copd", "bronchitis"] },
  { field: "cancer", backendKeys: ["cancer", "malignancy", "carcinoma"] },
  {
    field: "alcoholDrugAbuse",
    backendKeys: [
      "alcohol",
      "drug_abuse",
      "substance_abuse",
      "alcohol_drug_abuse",
    ],
  },
  {
    field: "hivStd",
    backendKeys: ["hiv", "std", "hiv_std", "sexually_transmitted"],
  },
];
const KNOWN_HOSPITAL_LOCATIONS = [
  {
    match: "bhandari",
    location: "53-54, Scheme No. 54, Vijay Nagar, Indore, M.P.",
  },
];

export function getKnownHospitalLocation(hospitalName) {
  const name = String(hospitalName ?? "")
    .trim()
    .toLowerCase();
  if (!name) return "";
  const found = KNOWN_HOSPITAL_LOCATIONS.find((entry) =>
    name.includes(entry.match),
  );
  return found ? found.location : "";
}

function extractChronicIllnesses(data) {
  const diag = data.diagnosis_and_procedures ?? {};
  const chronic = diag.chronic_illnesses ?? diag.past_history ?? {};
  const comorbidities = diag.co_morbidities ?? [];
  const result = {};

  CHRONIC_KEYS.forEach(({ field, backendKeys }) => {
    let present = false;
    let sinceRaw = "";

    for (const key of backendKeys) {
      if (chronic[key] != null) {
        const val = chronic[key];
        if (typeof val === "object" && val !== null) {
          present =
            parseBool(val.present ?? val.yes ?? val.has ?? true) === true;
          sinceRaw = String(
            val.since ?? val.month_year ?? val.date ?? "",
          ).trim();
        } else {
          present = parseBool(val) === true;
        }
        break;
      }
    }

    if (!present && Array.isArray(comorbidities)) {
      for (const cm of comorbidities) {
        const name = String(
          cm?.name ?? cm?.condition ?? cm ?? "",
        ).toLowerCase();
        if (
          backendKeys.some((k) =>
            name.includes(k.replace(/_/g, " ").split(" ")[0]),
          )
        ) {
          present = true;
          sinceRaw = String(cm?.since ?? cm?.date ?? "").trim();
          break;
        }
      }
    }

    let month = "";
    let year = "";
    if (sinceRaw) {
      const mmyy = sinceRaw.match(/^(\d{1,2})[/\-](\d{2,4})/);
      if (mmyy) {
        month = mmyy[1].padStart(2, "0");
        year = mmyy[2].slice(-2).padStart(2, "0");
      } else {
        const iso = sinceRaw.match(/^(\d{4})-(\d{2})/);
        if (iso) {
          month = iso[2];
          year = iso[1].slice(-2);
        } else {
          const d = digitsOnly(sinceRaw);
          if (d.length >= 4) {
            month = d.slice(0, 2);
            year = d.slice(2, 4);
          }
        }
      }
    }

    // Defaults strictly to "no data → unchecked"
    result[field] = { present: present === true, month, year };
  });

  return result;
}

/* ═══════════════ DATA RESOLUTION (Star Health-style) ═══════════════
   Merges structured_data, autofill_extracted, and extracted_data,
   giving priority to structured_data > autofill_extracted > extracted_data
   (later spreads win). This matches StarHealthMapper's resolveData.
─────────────────────────────────────────────────────────────────── */

function resolveData(analysisData) {
  const structured = analysisData?.structured_data || {};
  const extracted = analysisData?.autofill_extracted || {};
  const extra = analysisData?.extracted_data || {};
  const billing = extracted.billing_details || {};

  return {
    ...extra,
    ...extracted,
    ...structured,
    patient_details: {
      ...(extra.patient_details || {}),
      ...(extracted.patient_details || {}),
      ...(structured.patient_details || {}),
    },
    insurance_details: {
      ...(extra.insurance_details || {}),
      ...(extracted.insurance_details || {}),
      ...(structured.insurance_details || {}),
    },
    hospital_details: {
      ...(extra.hospital_details || {}),
      ...(extracted.hospital_details || {}),
      ...(structured.hospital_details || {}),
    },
    diagnosis_and_procedures: {
      ...(extra.diagnosis_and_procedures || {}),
      ...(extracted.diagnosis_and_procedures || {}),
      ...(structured.diagnosis_and_procedures || {}),
    },
    maternity_details: {
      ...(extra.maternity_details || {}),
      ...(extracted.maternity_details || {}),
      ...(structured.maternity_details || {}),
    },
    claim_details: {
      bill_amount:
        billing.total_bill_amount ??
        billing.hospitalization_expenses ??
        extra.claim_details?.bill_amount,
      pre_hospitalization_amount:
        billing.pre_hospitalization_expenses ??
        extra.claim_details?.pre_hospitalization_amount,
      post_hospitalization_amount:
        billing.post_hospitalization_expenses ??
        extra.claim_details?.post_hospitalization_amount,
      ...(extracted.claim_details || {}),
      ...(structured.claim_details || {}),
    },
    document_metadata: {
      ...(extra.document_metadata || {}),
      ...(extracted.document_metadata || {}),
      ...(structured.document_metadata || {}),
    },
  };
}

/* ═══════════════ AUTOFILL_RESULT FALLBACK LAYER ═══════════════
   Same pattern as StarHealthMapper's applyStarHealthExtractedFallbacks:
   only fills a field if it's currently empty, reading from
   analysisData.autofill_result section objects (section_a, section_c,
   section_d, section_e, part_c_cashless_request, etc.) which are
   otherwise never consulted by the main mapping pass above.

   This is what pulls in Section D's cost-breakdown fields
   (room rent, investigation cost, ICU/OT charges, professional fees,
   medicines cost, total expected cost) from part_c_cashless_request,
   matching what Star Health does for its equivalent fields — and now
   also Section B's "insured/patient" block (gender, age, DOB,
   alternate contact, other-insurance, family physician, occupation,
   address), matching Star Health's sectionA/sectionC fallback pattern.
─────────────────────────────────────────────────────────────────── */
function applySbiExtractedFallbacks(mapped, analysisData) {
  const data = resolveData(analysisData);
  const patient = data.patient_details || {};
  const insurance = data.insurance_details || {};
  const hospital = data.hospital_details || {};
  const diagnosis = data.diagnosis_and_procedures || {};
  const claim = data.claim_details || {};
  const mat = data.maternity_details || {};

  const ar = analysisData?.autofill_result || {};
  const sectionA = ar.section_a_primary_insured || ar.section_a || {};
  const sectionB = ar.section_b_insurance_history || ar.section_b || {};
  const sectionC = ar.section_c_patient_details || ar.section_c || {};
  const sectionD = ar.section_d_hospitalization || ar.section_d || {};
  const sectionE = ar.section_e_claim_details || ar.section_e || {};
  const partC = ar.part_c_cashless_request || {};
  const partB = ar.part_b_hospital_section || {};

  const next = { ...mapped };
  const hasValue = (v) => v !== undefined && v !== null && v !== "";
  const firstFilledLocal = (...vals) =>
    vals.find((v) => hasValue(v) && String(v).trim() !== "");
  const setIfEmpty = (key, ...candidates) => {
    if (hasValue(next[key])) return;
    const val = firstFilledLocal(...candidates);
    if (hasValue(val)) next[key] = val;
  };

  setIfEmpty("hospitalName", sectionD.hospital_name, hospital.hospital_name);
  setIfEmpty(
    "hospitalLocation",
    sectionD.hospital_location,
    hospital.city,
    hospital.location,
  );
  setIfEmpty("hospitalEmail", sectionD.hospital_email, hospital.hospital_email);
  setIfEmpty("rohiniId", hospital.rohini_id, partC.rohini_id);

  // ── Authoritative overrides from autofill_result ──────────────────────
  // Unlike setIfEmpty (which only fills a blank), setOverride always
  // replaces the value when sectionA/sectionC data is present. This
  // matches Star Health's fallback behaviour and is necessary here because
  // the raw insurance_details/patient_details objects can contain internal
  // record identifiers (e.g. "POL-USR_295BC54F-02FF-4700",
  // "USR_295BC5") instead of the real human-facing policy number / ID
  // card number, which the main mapping pass would otherwise pick up and
  // "lock in" before this fallback layer ever runs. sectionA/sectionC are
  // the reviewed/normalized values, so they should win whenever present.
  const setOverride = (key, ...candidates) => {
    const val = firstFilledLocal(...candidates);
    if (hasValue(val)) next[key] = val;
  };

  setOverride("policyNumber", sectionA.policy_number, insurance.policy_number);
  setOverride(
    "insuredCardId",
    sectionA.certificate_number,
    insurance.insurer_id_card,
    insurance.member_id,
  );
  setOverride("patientName", sectionA.name, sectionC.name, patient.name);
  setOverride("contactNumber", sectionA.phone, patient.phone, patient.mobile);
  setIfEmpty(
    "alternateContact",
    sectionA.alternate_phone,
    sectionC.alternate_phone,
    patient.alternate_contact,
    patient.alternate_phone,
  );
  setIfEmpty("employeeId", insurance.employee_id, sectionD.employee_id);

  // ── Gender / age / DOB overrides (Section B "insured/patient" block) ──
  // NOTE: sectionA/sectionC/patient values here are RAW (e.g. "Male", "M",
  // "45 years") and must be normalized the same way the main mapping pass
  // does above, otherwise they clobber the correctly-normalized value with
  // a raw string that the HTML template's strict equality checks
  // (f.gender === "male", placeholderBoxRowHtml expecting digits) won't
  // match — which silently blanks the field even though data was present.
  const genderOverrideRaw = firstFilledLocal(
    sectionA.gender,
    sectionC.gender,
    patient.gender,
  );
  if (hasValue(genderOverrideRaw)) {
    const gRaw = String(genderOverrideRaw).toLowerCase();
    const gNormalized =
      gRaw.includes("female") || gRaw === "f"
        ? "female"
        : gRaw.includes("male") || gRaw === "m"
          ? "male"
          : gRaw.includes("third") || gRaw.includes("other")
            ? "third"
            : "";
    if (gNormalized) next.gender = gNormalized;
  }

  const ageOverrideRaw = firstFilledLocal(
    sectionA.age,
    sectionC.age,
    patient.age,
  );
  if (hasValue(ageOverrideRaw)) {
    const ageNormalized = parseAge(ageOverrideRaw);
    if (ageNormalized) next.ageYears = ageNormalized;
  }
  setOverride(
    "ageMonths",
    sectionA.age_months,
    sectionC.age_months,
    patient.age_months,
  );

  // dob must go through parseDateDDMMYYYY like the main pass does — raw
  // values (e.g. "07/08,1990" or any non-DDMMYYYY format) contain literal
  // separators ("/", ",", "-") that placeholderBoxRowHtml would otherwise
  // render straight into the character boxes instead of digits.
  const dobOverrideRaw = firstFilledLocal(
    sectionA.date_of_birth,
    sectionC.date_of_birth,
    patient.date_of_birth,
  );
  if (hasValue(dobOverrideRaw)) {
    const dobNormalized = parseDateDDMMYYYY(dobOverrideRaw);
    if (dobNormalized) next.dob = dobNormalized;
  }

  // ── Age fallback: derive from DOB when no explicit age was ever found ──
  // Some records only carry a date of birth with no separate age field, so
  // ageYears would otherwise stay permanently blank even though we have
  // enough information to compute it.
  if (!hasValue(next.ageYears) && next.dob && next.dob.length === 8) {
    const dd = parseInt(next.dob.slice(0, 2), 10);
    const mm = parseInt(next.dob.slice(2, 4), 10);
    const yyyy = parseInt(next.dob.slice(4, 8), 10);
    if (
      !Number.isNaN(dd) &&
      !Number.isNaN(mm) &&
      !Number.isNaN(yyyy) &&
      yyyy > 1900
    ) {
      const birthDate = new Date(yyyy, mm - 1, dd);
      const today = new Date();
      let computedAge = today.getFullYear() - birthDate.getFullYear();
      const hasNotHadBirthdayYet =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() < birthDate.getDate());
      if (hasNotHadBirthdayYet) computedAge -= 1;
      if (computedAge >= 0 && computedAge < 150) {
        next.ageYears = String(computedAge);
      }
    }
  }

  // ── "Currently do you have any other medical claim / health insurance"
  //    (j / j1). The company-name field must NEVER populate unless the
  //    answer actually resolves to "yes" — and it must only ever read from
  //    fields that genuinely represent a CURRENTLY held other policy
  //    (sectionB.company_name / insurance.other_insurance_company).
  //    insurance.previous_insurer is a different question (past insurance
  //    history) and was wrongly being used here, which is why a stale
  //    "STAR HEALTH AND ALLIED..." style value could show up even while
  //    "No" was checked. ──
  const otherInsuranceAnswer = yesNoAuto(
    sectionA.other_insurance,
    sectionB.currently_other_insurance,
    insurance.has_other_insurance,
  );
  next.otherInsurance = otherInsuranceAnswer;
  if (otherInsuranceAnswer === "yes") {
    setOverride(
      "otherInsuranceCompany",
      sectionB.company_name,
      insurance.other_insurance_company,
    );
  } else {
    next.otherInsuranceCompany = "";
  }

  // ── Family physician (Section B "k" fields) ──
  setIfEmpty(
    "familyPhysicianName",
    sectionC.family_physician_name,
    patient.family_physician_name,
  );
  setIfEmpty(
    "familyPhysicianContact",
    sectionC.family_physician_contact,
    patient.family_physician_contact,
    patient.family_physician_phone,
  );

  // ── Occupation and address (Section B "l" and "m" fields) ──
  setIfEmpty(
    "occupation",
    sectionA.occupation,
    sectionC.occupation,
    patient.occupation,
    patient.occupation_specify,
  );
  setIfEmpty(
    "patientAddress",
    sectionA.address,
    sectionC.address,
    patient.address,
    patient.full_address,
  );

  setIfEmpty(
    "treatingDoctorName",
    sectionD.treating_doctor,
    hospital.treating_doctor,
  );
  setIfEmpty(
    "natureOfIllness",
    sectionD.diagnosis,
    diagnosis.primary_diagnosis,
    diagnosis.nature_of_illness,
  );
  setIfEmpty(
    "provisionalDiagnosis",
    diagnosis.primary_diagnosis,
    sectionD.diagnosis,
  );
  // ICD codes must be read from part_b_hospital_section first (matching
  // Star Health's precedence) — part_c_cashless_request can contain a
  // stale/unrelated code, which is why the wrong ICD-10 was showing up.
  // Also normalize (uppercase, strip spaces, truncate) like the main pass
  // does, since setIfEmpty/setOverride helpers don't do that themselves.
  const icd10CodeRaw = firstFilledLocal(
    diagnosis.primary_icd_code,
    partB.primary_icd_code,
    partC.primary_icd_code,
  );
  if (!hasValue(next.icd10Code) && hasValue(icd10CodeRaw)) {
    next.icd10Code = truncate(
      upper(String(icd10CodeRaw)).replace(/\s/g, ""),
      10,
    );
  }
  const icd10PcsCodeRaw = firstFilledLocal(
    diagnosis.primary_icd_pcs_code,
    diagnosis.procedure_1_icd_pcs,
    partB.primary_icd_pcs_code,
    partB.procedure_1_icd_pcs,
    partC.procedure_1_icd_pcs,
  );
  if (!hasValue(next.icd10PcsCode) && hasValue(icd10PcsCodeRaw)) {
    next.icd10PcsCode = truncate(
      upper(String(icd10PcsCodeRaw)).replace(/\s/g, ""),
      10,
    );
  }
  setIfEmpty("surgeryName", diagnosis.surgery_name, diagnosis.procedure_1);

  setIfEmpty("admissionDate", sectionD.admission_date, hospital.admission_date);

  // ── Section D cost-breakdown fields: part_c_cashless_request is the
  //    primary source for these (mirrors Star Health's part_c reads) ──
  setIfEmpty("roomRentTotal", partC.room_rent_per_day, hospital.room_rent);
  setIfEmpty(
    "investigationCost",
    partC.investigation_cost,
    hospital.investigation_cost,
  );
  setIfEmpty("icuCharges", partC.icu_charges, hospital.icu_charges);
  setIfEmpty("otCharges", partC.ot_charges, hospital.ot_charges);
  setIfEmpty(
    "professionalFees",
    partC.surgeon_anesthesia_fees,
    hospital.professional_fees,
  );
  setIfEmpty(
    "medicinesCost",
    partC.medicines_consumables,
    hospital.medicine_cost,
  );
  setIfEmpty(
    "otherHospitalExpenses",
    partC.other_expenses,
    hospital.other_expenses,
  );
  setIfEmpty("packageCharges", partC.package_charges, hospital.package_charges);
  setIfEmpty(
    "totalExpectedCost",
    partC.total_expected_cost,
    claim.bill_amount,
    claim.claimed_amount,
  );

  setIfEmpty("icuDays", hospital.icu_days, diagnosis.icu_days);
  setIfEmpty(
    "admissionDateDays",
    hospital.expected_days_stay,
    hospital.length_of_stay,
  );
  setIfEmpty(
    "admissionType",
    hospital.admission_type,
    hospital.type_of_admission,
  );

  setIfEmpty(
    "expectedDeliveryDate",
    diagnosis.expected_delivery_date,
    mat.expected_delivery_date,
  );
  setIfEmpty("maternityG", diagnosis.gravida, mat.gravida);
  setIfEmpty("maternityP", diagnosis.para, mat.para);
  setIfEmpty("maternityL", diagnosis.living, mat.living);
  setIfEmpty("maternityA", diagnosis.abortion, mat.abortion);

  return next;
}

/* ═══════════════ MAIN EXPORT ═══════════════ */

export function mapToSbiGeneralInsurancePreauth(
  analysisData,
  loggedInHospitalName = "",
) {
  const data = resolveData(analysisData);

  const patient = data.patient_details ?? {};
  const hosp = data.hospital_details ?? {};
  const ins = data.insurance_details ?? {};
  const diag = data.diagnosis_and_procedures ?? {};
  const claim = data.claim_details ?? {};
  const mat = data.maternity_details ?? {};

  const resolvedHospitalName = upper(
    firstFilled(hosp.hospital_name, hosp.name, loggedInHospitalName) ?? "",
    40,
  );

  // ── Resolve hospital location: extracted data first, then a
  //    known-hospital lookup (e.g. Bhandari) based on the resolved name ──
  const resolvedHospitalLocation = upper(
    firstFilled(
      hosp.hospital_location,
      hosp.city,
      hosp.location,
      getKnownHospitalLocation(resolvedHospitalName),
    ) ?? "",
    24,
  );

  /* ── Gender ── */
  const genderRaw = String(patient.gender ?? "").toLowerCase();
  const gender =
    genderRaw.includes("female") || genderRaw === "f"
      ? "female"
      : genderRaw.includes("male") || genderRaw === "m"
        ? "male"
        : genderRaw.includes("third") || genderRaw.includes("other")
          ? "third"
          : "";

  /* ── Admission type ── */
  const admTypeRaw = String(
    firstFilled(hosp.admission_type, hosp.type_of_admission) ?? "",
  ).toLowerCase();
  const hospitalizationType = admTypeRaw.includes("emergency")
    ? "emergency"
    : admTypeRaw.includes("planned")
      ? "planned"
      : "";

  /* ── Proposed treatment inference (used only as fallback evidence) ── */
  const procedureExists = [
    diag.procedure_1,
    diag.procedure_2,
    diag.procedure_3,
    diag.procedure_details,
    diag.primary_icd_pcs_code,
    diag.surgery_name,
  ].some((v) => isFilled(v));

  const medicalManagementExists = [
    diag.investigation_details,
    diag.medical_details,
  ].some((v) => isFilled(v));

  const investigationExists = isFilled(diag.investigation_details);

  const systemLower = String(diag.system_of_medicine ?? "").toLowerCase();
  const isNonAllopathic = systemLower
    ? !systemLower.includes("allopath")
    : false;

  const icuDaysNum =
    Number(firstFilled(hosp.icu_days, diag.icu_days) ?? 0) || 0;

  /* ── Injury / accident ── */
  const injuryCauseLower = String(
    firstFilled(
      diag.injury_cause,
      diag.hospitalization_cause,
      diag.injury_description,
    ) ?? "",
  ).toLowerCase();

  const isRTAInferred =
    injuryCauseLower.includes("road") || injuryCauseLower.includes("rta");
  const substanceAbuseInferred =
    injuryCauseLower.includes("alcohol") || injuryCauseLower.includes("drug");

  /* ── Admission date/time ── */
  const { hh: admissionTimeHH, mm: admissionTimeMM } = parseTimeParts(
    firstFilled(hosp.admission_time, hosp.time_of_admission),
  );

  /* ── Chronic illnesses (Section D bottom-right) ── */
  const chronicIllnesses = extractChronicIllnesses(data);

  /* ── Treating doctor ── */
  const treatingDoctorName = String(
    firstFilled(hosp.treating_doctor, hosp.doctor_name) ?? "",
  ).trim();
  const treatingDoctorContact = truncate(
    digitsOnly(
      firstFilled(
        hosp.doctor_phone,
        hosp.treating_doctor_phone,
        hosp.hospital_phone,
      ) ?? "",
    ),
    10,
  );

  /* ── Drug route (Section C h.1) ── */
  const drugRouteRaw = String(diag.drug_administration_route ?? "")
    .toLowerCase()
    .trim();
  const drugRoute = drugRouteRaw.includes("iv")
    ? "iv"
    : drugRouteRaw.includes("oral")
      ? "oral"
      : drugRouteRaw
        ? "other"
        : "";

  const mapped = {
    /* ═══════════ SECTION A: Hospital ID ═══════════ */
    hospitalName: resolvedHospitalName,
    hospitalLocation: resolvedHospitalLocation,
    hospitalIdCode: truncate(
      upper(firstFilled(hosp.hospital_id, hosp.hospital_id_code) ?? "").replace(
        /\s/g,
        "",
      ),
      6,
    ),
    hospitalEmail: String(
      firstFilled(hosp.hospital_email, hosp.email) ?? "",
    ).trim(),
    rohiniId: truncate(
      upper(
        firstFilled(hosp.rohini_id, hosp.rohini_registration_id) ?? "",
      ).replace(/\s/g, ""),
      12,
    ),

    /* ═══════════ SECTION B: Claims Administrator + Insured/Patient ═══════════ */
    insurerName: String(
      firstFilled(ins.insurer_name, "SBI General Insurance Company Limited"),
    ),
    tollFreeNo: String(
      firstFilled(
        ins.toll_free_number,
        ins.helpline,
        "1800 210 3366 / 1800 210 6366",
      ),
    ),

    patientName: upper(patient.name ?? "", 30),
    gender,
    contactNumber: truncate(
      digitsOnly(patient.phone ?? patient.mobile ?? ""),
      10,
    ),
    alternateContact: truncate(
      digitsOnly(
        firstFilled(patient.alternate_contact, patient.alternate_phone) ?? "",
      ),
      10,
    ),
    ageYears: parseAge(patient.age),
    ageMonths: truncate(digitsOnly(String(patient.age_months ?? "")), 2),
    dob: parseDateDDMMYYYY(patient.date_of_birth),
    insuredCardId: truncate(
      upper(firstFilled(ins.insurer_id_card, ins.corporate_name) ?? "").replace(
        /\s/g,
        "",
      ),
      20,
    ),
    policyNumber: truncate(
      upper(
        firstFilled(ins.policy_number, ins.certificate_number) ?? "",
      ).replace(/\s/g, ""),
      24,
    ),
    employeeId: String(patient.employee_id ?? "").trim(),

    otherInsurance: yesNoAuto(
      patient.other_insurance,
      ins.has_other_insurance,
      isFilled(ins.other_insurance_company) || isFilled(ins.previous_insurer)
        ? true
        : undefined,
    ),
    otherInsuranceCompany: upper(
      firstFilled(ins.other_insurance_company) ?? "",
      14,
    ),

    familyPhysicianName: upper(patient.family_physician_name ?? "", 22),
    familyPhysicianContact: truncate(
      digitsOnly(
        patient.family_physician_contact ??
          patient.family_physician_phone ??
          "",
      ),
      10,
    ),

    occupation: upper(
      firstFilled(patient.occupation, patient.occupation_specify) ?? "",
      10,
    ),

    patientAddress: String(
      firstFilled(patient.address, patient.full_address) ?? "",
    ).trim(),

    /* ═══════════ SECTION C: Treating Doctor / Hospital ═══════════ */
    treatingDoctorName,
    treatingDoctorContact,

    natureOfIllness: String(
      firstFilled(diag.nature_of_illness, diag.presenting_complaints) ?? "",
    ).trim(),
    clinicalFindings: String(
      firstFilled(diag.relevant_clinical_findings, diag.clinical_findings) ??
        "",
    ).trim(),

    durationDays: truncate(
      String(firstFilled(diag.duration_days, diag.duration_of_ailment) ?? ""),
      3,
    ),
    firstConsultationDate: parseDateDDMMYYYY(diag.first_consultation_date),
    pastHistoryDetails: String(
      firstFilled(diag.past_history_details, diag.past_history) ?? "",
    ).trim(),

    provisionalDiagnosis: String(
      firstFilled(diag.provisional_diagnosis, diag.primary_diagnosis) ?? "",
    ).trim(),
    icd10Code: truncate(
      upper(diag.primary_icd_code ?? "").replace(/\s/g, ""),
      10,
    ),

    // Checkboxes: "yes" only when there's actual supporting evidence
    proposedMedical: boolAuto(
      diag.proposed_line_medical_management,
      medicalManagementExists,
    ),
    proposedSurgical: boolAuto(
      diag.proposed_line_surgical_management,
      procedureExists,
    ),
    proposedIntensiveCare: boolAuto(
      diag.proposed_line_intensive_care,
      icuDaysNum > 0,
    ),
    proposedInvestigation: boolAuto(
      diag.proposed_line_investigation,
      investigationExists,
    ),
    proposedNonAllopathic: boolAuto(
      diag.proposed_line_non_allopathic,
      isNonAllopathic,
    ),

    investigationDetails: String(
      firstFilled(diag.investigation_details, diag.medical_details) ?? "",
    ).trim(),
    drugRoute,
    drugRouteOther: drugRoute === "other" ? upper(drugRouteRaw, 20) : "",

    surgeryName: String(
      firstFilled(
        diag.surgery_name,
        diag.procedure_details,
        diag.procedure_1,
      ) ?? "",
    ).trim(),
    icd10PcsCode: truncate(
      upper(
        firstFilled(diag.primary_icd_pcs_code, diag.procedure_1_icd_pcs) ?? "",
      ).replace(/\s/g, ""),
      10,
    ),

    isRTA: yesNoAuto(diag.is_rta, isRTAInferred || undefined),
    dateOfInjury: parseDateDDMMYYYY(
      firstFilled(diag.date_of_injury, diag.date_of_injury_or_disease),
    ),
    reportedToPolice: yesNoAuto(
      diag.reported_to_police,
      diag.is_reported_to_police,
    ),
    testConducted: yesNoAuto(
      diag.substance_test_conducted,
      substanceAbuseInferred || undefined,
    ),

    // Maternity fields render as plain text boxes in the HTML (not checkboxes)
    maternityG: String(firstFilled(diag.gravida, mat.gravida) ?? "").trim(),
    maternityP: String(firstFilled(diag.para, mat.para) ?? "").trim(),
    maternityL: String(firstFilled(diag.living, mat.living) ?? "").trim(),
    maternityA: String(firstFilled(diag.abortion, mat.abortion) ?? "").trim(),
    expectedDeliveryDate: parseDateDDMMYYYY(
      firstFilled(
        diag.expected_delivery_date,
        diag.date_of_delivery,
        mat.expected_delivery_date,
        mat.date_of_delivery,
      ),
    ),

    /* ═══════════ SECTION D: Admission / Cost Details ═══════════ */
    admissionDate: parseDateDDMMYYYY(hosp.admission_date),
    admissionTimeHH,
    admissionTimeMM,
    hospitalizationType,

    admissionDateDays: truncate(
      String(firstFilled(hosp.expected_days_stay, hosp.length_of_stay) ?? ""),
      4,
    ),
    icuDays: truncate(String(icuDaysNum || ""), 4),

    roomRentTotal: truncate(
      digitsOnly(
        String(firstFilled(hosp.room_rent_total, hosp.room_rent) ?? ""),
      ),
      8,
    ),
    investigationCost: truncate(
      digitsOnly(
        String(
          firstFilled(hosp.investigation_cost, hosp.diagnostic_cost) ?? "",
        ),
      ),
      8,
    ),
    icuCharges: truncate(digitsOnly(String(hosp.icu_charges ?? "")), 8),
    otCharges: truncate(
      digitsOnly(
        String(firstFilled(hosp.ot_charges, hosp.operation_charges) ?? ""),
      ),
      8,
    ),
    professionalFees: truncate(
      digitsOnly(
        String(
          firstFilled(
            hosp.professional_fees,
            hosp.surgeon_fees,
            hosp.consultation_fees,
          ) ?? "",
        ),
      ),
      8,
    ),
    medicinesCost: truncate(
      digitsOnly(
        String(
          firstFilled(
            hosp.medicine_cost,
            hosp.pharmacy_cost,
            claim.bill_amount,
          ) ?? "",
        ),
      ),
      8,
    ),
    otherHospitalExpenses: truncate(
      digitsOnly(String(hosp.other_expenses ?? "")),
      8,
    ),
    packageCharges: truncate(
      digitsOnly(
        String(firstFilled(hosp.package_charges, hosp.package_amount) ?? ""),
      ),
      8,
    ),
    totalExpectedCost: truncate(
      digitsOnly(
        String(
          firstFilled(
            hosp.total_expected_cost,
            claim.bill_amount,
            claim.claimed_amount,
          ) ?? "",
        ),
      ),
      8,
    ),

    chronicIllnesses,

    /* ═══════════ DECLARATION ═══════════ */
    declTreatingDoctorName: upper(treatingDoctorName, 34),
    declQualification: upper(hosp.doctor_qualification ?? "", 20),
    declRegistrationNo: upper(
      String(
        firstFilled(hosp.doctor_registration_number, hosp.registration_no) ??
          "",
      ),
      16,
    ),

    /* ═══════════ SECTION F/Final: Patient Declaration ═══════════ */
    patientDeclName: upper(patient.name ?? "", 26),
    patientDeclContact: truncate(
      digitsOnly(patient.phone ?? patient.mobile ?? ""),
      10,
    ),
    patientDeclEmail: String(patient.email ?? "").trim(),
    patientDeclDate: parseDateDDMMYYYY(
      firstFilled(hosp.admission_date, new Date().toISOString()),
    ),
    patientDeclTime: "",
  };

  return applySbiExtractedFallbacks(mapped, analysisData);
}

/* ═══════════════ BLANK FORM HELPER ═══════════════ */
export function blankSbiGeneralInsurancePreauth() {
  return mapToSbiGeneralInsurancePreauth(null);
}