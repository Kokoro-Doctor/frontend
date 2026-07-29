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

/* ═══════════════ DATA RESOLUTION ═══════════════ */

function normalizeAutofill(ext) {
  if (!ext || typeof ext !== "object") return {};
  const bill = ext.billing_details ?? {};
  return {
    patient_details: ext.patient_details ?? {},
    insurance_details: ext.insurance_details ?? {},
    hospital_details: ext.hospital_details ?? {},
    diagnosis_and_procedures: ext.diagnosis_and_procedures ?? {},
    maternity_details: ext.maternity_details ?? {},
    claim_details: {
      bill_amount:
        bill.total_bill_amount ?? bill.hospitalization_expenses ?? null,
      pre_hospitalization_amount: bill.pre_hospitalization_expenses ?? null,
      post_hospitalization_amount: bill.post_hospitalization_expenses ?? null,
    },
    document_metadata: ext.document_metadata ?? {},
  };
}

function resolveData(analysisData) {
  if (!analysisData) return {};
  if (analysisData.structured_data) return analysisData.structured_data;
  if (analysisData.autofill_extracted)
    return normalizeAutofill(analysisData.autofill_extracted);
  return {};
}

/* ═══════════════ MAIN EXPORT ═══════════════ */

export function mapToSbiGeneralInsurancePreauth(analysisData) {
  const data = resolveData(analysisData);

  const patient = data.patient_details ?? {};
  const hosp = data.hospital_details ?? {};
  const ins = data.insurance_details ?? {};
  const diag = data.diagnosis_and_procedures ?? {};
  const claim = data.claim_details ?? {};
  const mat = data.maternity_details ?? {};

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

  const isRTAInferred = injuryCauseLower.includes("road") || injuryCauseLower.includes("rta");
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

  return {
    /* ═══════════ SECTION A: Hospital ID ═══════════ */
    hospitalName: upper(hosp.hospital_name ?? hosp.name ?? "", 40),
    hospitalLocation: upper(
      firstFilled(hosp.hospital_location, hosp.city, hosp.location) ?? "",
      24,
    ),
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
      upper(firstFilled(hosp.rohini_id, hosp.rohini_registration_id) ?? "").replace(
        /\s/g,
        "",
      ),
      12,
    ),

    /* ═══════════ SECTION B: Claims Administrator + Insured/Patient ═══════════ */
    insurerName: String(
      firstFilled(ins.insurer_name, "SBI General Insurance Company Limited"),
    ),
    tollFreeNo: String(
      firstFilled(ins.toll_free_number, ins.helpline, "1800 210 3366 / 1800 210 6366"),
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
      upper(
        firstFilled(ins.insurer_id_card, ins.certificate_number) ?? "",
      ).replace(/\s/g, ""),
      10,
    ),
    policyNumber: truncate(
      upper(firstFilled(ins.policy_number, ins.corporate_name) ?? "").replace(
        /\s/g,
        "",
      ),
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
      firstFilled(ins.other_insurance_company, ins.previous_insurer) ?? "",
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
      String(
        firstFilled(hosp.expected_days_stay, hosp.length_of_stay) ?? "",
      ),
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
}

/* ═══════════════ BLANK FORM HELPER ═══════════════ */
export function blankSbiGeneralInsurancePreauth() {
  return mapToSbiGeneralInsurancePreauth(null);
}