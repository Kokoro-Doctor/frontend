/**
 * AdityaBirlaPreauthMapper.js
 * ─────────────────────────────────────────────────────────────────
 * Maps backend analysisData → the flat field names consumed by
 * generateInsuranceFormHTML() (Sections A–G).
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

export function yesNo(v) {
  if (v == null) return "";
  if (v === true) return "yes";
  if (v === false) return "no";
  const t = String(v).toLowerCase().trim();
  if (["y", "yes", "true", "1"].includes(t)) return "yes";
  if (["n", "no", "false", "0"].includes(t)) return "no";
  return "";
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

export function parseAge(raw) {
  if (!raw) return "";
  const m = String(raw).match(/\d+/);
  return m ? m[0] : "";
}

function firstFilled(...values) {
  return values.find((value) => {
    if (value == null) return false;
    if (typeof value === "boolean" || typeof value === "number") return true;
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim() !== "";
  });
}

function joinLocation(...parts) {
  return parts
    .map((p) => String(p ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

/* ═══════════════ CHRONIC ILLNESS EXTRACTION ═══════════════
   Field names below MUST match generateInsuranceFormHTML's
   chronicChecked()/chronicMonth()/chronicYear() lookups:
   diabetes, heartDisease, hypertension, hyperlipidemias,
   osteoarthritis, asthma, cancer, alcoholDrugAbuse, hivStd, other
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

    result[field] = { present, month, year };
  });

  // "other" chronic illness — HTML only checks the checkbox + free-text details,
  // no month/year for this one.
  const otherCandidates = [
    diag.other_ailment_details,
    diag.other_chronic_details,
    diag.other_history,
  ];
  const otherText = String(firstFilled(...otherCandidates) ?? "").trim();
  result.other = { present: otherText !== "", month: "", year: "" };

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

export function mapToAdityaBirlaPreauth(analysisData) {
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

  /* ── Proposed treatment inference ── */
  const procedureExists = [
    diag.procedure_1,
    diag.procedure_2,
    diag.procedure_3,
    diag.procedure_details,
    diag.primary_icd_pcs_code,
  ].some((v) => String(v ?? "").trim() !== "");

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

  /* ── Admission date/time ── */
  const { hh: admissionTimeHH, mm: admissionTimeMM } = parseTimeParts(
    firstFilled(hosp.admission_time, hosp.time_of_admission),
  );

  /* ── Chronic illnesses ── */
  const chronicIllnesses = extractChronicIllnesses(data);
  const chronicOtherDetails = String(
    firstFilled(
      diag.other_ailment_details,
      diag.other_chronic_details,
      diag.other_history,
    ) ?? "",
  ).trim();

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

  return {
    /* ═══════════ SECTION A: TPA ═══════════ */
    tpaName: upper(firstFilled(ins.tpa_name, "ADITYA BIRLA HEALTH"), 24),
    tpaPhone: truncate(
      digitsOnly(firstFilled(ins.tpa_phone, ins.helpline) ?? ""),
      16,
    ),
    tpaFax: truncate(digitsOnly(ins.tpa_fax ?? ""), 16),

    /* ═══════════ SECTION B: Insured / Patient ═══════════ */
    patientName: upper(patient.name ?? "", 30),
    gender,
    ageYears: parseAge(patient.age),
    ageMonths: truncate(digitsOnly(String(patient.age_months ?? "")), 2),
    dob: parseDateDDMMYYYY(patient.date_of_birth),
    contactNumber: truncate(
      digitsOnly(patient.phone ?? patient.mobile ?? ""),
      16,
    ),
    insuredCardId: truncate(
      upper(
        firstFilled(ins.insurer_id_card, ins.certificate_number) ?? "",
      ).replace(/\s/g, ""),
      26,
    ),
    policyNumber: truncate(
      upper(firstFilled(ins.policy_number, ins.corporate_name) ?? "").replace(
        /\s/g,
        "",
      ),
      26,
    ),
    employeeId: String(patient.employee_id ?? "").trim(),
    otherInsurance: yesNo(
      firstFilled(patient.other_insurance, ins.has_other_insurance),
    ),
    otherInsuranceCompany: upper(
      firstFilled(ins.other_insurance_company, ins.previous_insurer) ?? "",
      28,
    ),
    hasFamilyPhysician: yesNo(
      firstFilled(patient.has_family_physician, patient.family_physician),
    ),
    familyPhysicianName: upper(patient.family_physician_name ?? "", 26),
    familyPhysicianContact: truncate(
      digitsOnly(
        patient.family_physician_contact ??
          patient.family_physician_phone ??
          "",
      ),
      16,
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
      2,
    ),
    firstConsultationDate: parseDateDDMMYYYY(diag.first_consultation_date),
    provisionalDiagnosis: String(
      firstFilled(diag.provisional_diagnosis, diag.primary_diagnosis) ?? "",
    ).trim(),
    icd10Code: truncate(
      upper(diag.primary_icd_code ?? "").replace(/\s/g, ""),
      8,
    ),

    proposedMedical: parseBool(diag.proposed_line_medical_management),
    proposedSurgical:
      diag.proposed_line_surgical_management != null
        ? parseBool(diag.proposed_line_surgical_management)
        : procedureExists,
    proposedIntensiveCare:
      diag.proposed_line_intensive_care != null
        ? parseBool(diag.proposed_line_intensive_care)
        : icuDaysNum > 0,
    proposedInvestigation: parseBool(diag.proposed_line_investigation),
    proposedNonAllopathic:
      diag.proposed_line_non_allopathic != null
        ? parseBool(diag.proposed_line_non_allopathic)
        : isNonAllopathic,

    investigationDetails: String(
      firstFilled(diag.investigation_details, diag.medical_details) ?? "",
    ).trim(),
    drugRoute: String(diag.drug_administration_route ?? "").trim(),
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
      7,
    ),
    otherTreatmentDetails: String(diag.other_treatment_details ?? "").trim(),

    injuryCause: String(
      firstFilled(diag.injury_cause, diag.injury_description) ?? "",
    ).trim(),
    accidentRTA: yesNo(
      firstFilled(
        diag.is_rta,
        injuryCauseLower.includes("road") ? true : undefined,
      ),
    ),
    injuryDate: parseDateDDMMYYYY(
      firstFilled(diag.date_of_injury, diag.date_of_injury_or_disease),
    ),
    reportedToPolice: yesNo(
      firstFilled(diag.reported_to_police, diag.is_reported_to_police),
    ),
    firNumber: truncate(String(diag.fir_number ?? "").replace(/\s/g, ""), 15),
    substanceAbuse: yesNo(
      firstFilled(
        diag.is_substance_abuse,
        injuryCauseLower.includes("alcohol") ? true : undefined,
      ),
    ),
    testConducted: yesNo(diag.substance_test_conducted),

    maternityG: parseBool(firstFilled(diag.gravida, mat.gravida)),
    maternityP: parseBool(firstFilled(diag.para, mat.para)),
    maternityL: parseBool(firstFilled(diag.living, mat.living)),
    maternityA: parseBool(firstFilled(diag.abortion, mat.abortion)),
    deliveryDate: parseDateDDMMYYYY(
      firstFilled(
        diag.date_of_delivery,
        diag.expected_delivery_date,
        mat.date_of_delivery,
      ),
    ),

    /* ═══════════ SECTION D: Admission / Cost Details ═══════════ */
    admissionDate: parseDateDDMMYYYY(hosp.admission_date),
    admissionTimeHH,
    admissionTimeMM,
    hospitalizationType,
    expectedStayDays: truncate(
      String(firstFilled(hosp.expected_days_stay, hosp.length_of_stay) ?? ""),
      3,
    ),
    roomTypeCost:
      truncate(
        digitsOnly(
          String(firstFilled(hosp.room_charges, hosp.room_rent) ?? ""),
        ),
        12,
      ) || String(hosp.room_category ?? hosp.room_type ?? "").trim(),
    roomRentTotal: truncate(
      digitsOnly(
        String(firstFilled(hosp.room_rent_total, hosp.room_rent) ?? ""),
      ),
      12,
    ),
    investigationCost: truncate(
      digitsOnly(
        String(
          firstFilled(hosp.investigation_cost, hosp.diagnostic_cost) ?? "",
        ),
      ),
      8,
    ),
    icuCharges: truncate(digitsOnly(String(hosp.icu_charges ?? "")), 6),
    otCharges: truncate(
      digitsOnly(
        String(firstFilled(hosp.ot_charges, hosp.operation_charges) ?? ""),
      ),
      6,
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
      6,
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

    /* ═══════════ SECTION E: Chronic Illness ═══════════ */
    chronicIllnesses,
    chronicOtherDetails,

    /* ═══════════ DECLARATION (between E & F) ═══════════ */
    declTreatingDoctorName: upper(treatingDoctorName, 30),
    declQualification: upper(hosp.doctor_qualification ?? "", 26),
    declRegistrationNo: upper(
      String(
        firstFilled(hosp.doctor_registration_number, hosp.registration_no) ??
          "",
      ),
      24,
    ),

    /* ═══════════ SECTION F: Patient Declaration ═══════════ */
    patientDeclName: upper(patient.name ?? "", 30),
    patientDeclContact: truncate(
      digitsOnly(patient.phone ?? patient.mobile ?? ""),
      10,
    ),

    /* Section G has no dynamic fields — static declarations + signature boxes */
  };
}

/* ═══════════════ BLANK FORM HELPER ═══════════════ */
export function blankAdityaBirlaPreauth() {
  return mapToAdityaBirlaPreauth(null);
}
