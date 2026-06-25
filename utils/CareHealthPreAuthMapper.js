/**
 * CareHealthPreAuthMapper.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for mapping backend analysisData → form state
 * for the Care Health Insurance Pre-Authorisation Form.
 *
 * EXPORTS:
 *   mapToCareHealthPreAuth(analysisData)  → flat form object
 *
 * USAGE:
 *   import { mapToCareHealthPreAuth } from "../../utils/CareHealthPreAuthMapper";
 *   const [form, setForm] = useState(() => mapToCareHealthPreAuth(analysisData));
 *
 * BACKEND SHAPE (both paths handled):
 *   analysisData.structured_data    → audit/claim path
 *   analysisData.autofill_extracted → autofill path
 *   analysisData.autofill_result    → optional overlay
 * ─────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════════
   LOW-LEVEL HELPERS  (same conventions as MediAssistMapper)
═══════════════════════════════════════════════════════════════ */

export function digitsOnly(s) {
  return String(s ?? "").replace(/\D/g, "");
}

export function padChars(s, len) {
  const t = String(s ?? "");
  return t.padEnd(len, " ").slice(0, len);
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

export function parseTime(raw) {
  if (!raw) return "    ";
  const s = digitsOnly(String(raw));
  if (s.length >= 4) return s.slice(0, 4);
  if (!s) return "    ";
  return s.padStart(4, "0").slice(-4);
}

export function padAmount(raw, len) {
  const d = digitsOnly(String(raw ?? ""));
  if (!d) return "".padEnd(len, " ");
  const trimmed = d.length > len ? d.slice(-len) : d;
  return trimmed.padStart(len, " ").slice(-len);
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

export function parseAge(raw) {
  if (!raw) return "  ";
  const m = String(raw).match(/\d+/);
  return m ? m[0].padStart(2, "0").slice(-2) : "  ";
}

function firstFilled(...values) {
  return values.find((value) => {
    if (value == null) return false;
    if (typeof value === "boolean" || typeof value === "number") return true;
    if (Array.isArray(value)) return value.length > 0;
    return String(value).trim() !== "";
  });
}

function parseBool(raw) {
  if (raw === true || raw === false) return raw;
  const t = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (["y", "yes", "true", "1"].includes(t)) return true;
  if (["n", "no", "false", "0"].includes(t)) return false;
  return null;
}

function joinLocation(...parts) {
  return parts
    .map((p) => String(p ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

/* ═══════════════════════════════════════════════════════════════
   CHRONIC ILLNESS HELPERS
   Care Health form has 9 chronic illness checkboxes with MM/YY
═══════════════════════════════════════════════════════════════ */

/**
 * CHRONIC_KEYS maps form field names → possible backend keys.
 * Order must match the form's checkbox order:
 *   0: Diabetes, 1: Heart Disease, 2: Hypertension, 3: Hyperlipidemias,
 *   4: Osteoarthritis, 5: Asthma/COPD/Bronchitis, 6: Cancer,
 *   7: Alcohol or drug abuse, 8: Any HIV or STD
 */
const CHRONIC_KEYS = [
  { field: "diabetes",        backendKeys: ["diabetes", "dm", "diabetes_mellitus"] },
  { field: "heartDisease",    backendKeys: ["heart_disease", "cardiac", "cad", "ihd"] },
  { field: "hypertension",    backendKeys: ["hypertension", "htn", "high_blood_pressure"] },
  { field: "hyperlipidemia",  backendKeys: ["hyperlipidemia", "hyperlipidemias", "dyslipidemia"] },
  { field: "osteoarthritis",  backendKeys: ["osteoarthritis", "arthritis"] },
  { field: "asthma",          backendKeys: ["asthma", "copd", "bronchitis"] },
  { field: "cancer",          backendKeys: ["cancer", "malignancy", "carcinoma"] },
  { field: "alcoholDrugAbuse",backendKeys: ["alcohol", "drug_abuse", "substance_abuse", "alcohol_drug_abuse"] },
  { field: "hivStd",          backendKeys: ["hiv", "std", "hiv_std", "sexually_transmitted"] },
];

/**
 * Extract chronic illness data from backend.
 * Returns an object like:
 *   { diabetes: { present: true, month: "03", year: "20" }, ... }
 */
function extractChronicIllnesses(data) {
  const diag = data.diagnosis_and_procedures ?? {};
  const chronic = diag.chronic_illnesses ?? diag.past_history ?? {};
  const comorbidities = diag.co_morbidities ?? [];

  const result = {};

  CHRONIC_KEYS.forEach(({ field, backendKeys }) => {
    let present = false;
    let sinceRaw = "";

    // Check direct chronic object
    for (const key of backendKeys) {
      if (chronic[key] != null) {
        const val = chronic[key];
        if (typeof val === "object" && val !== null) {
          present = parseBool(val.present ?? val.yes ?? val.has ?? true) === true;
          sinceRaw = String(val.since ?? val.month_year ?? val.date ?? "").trim();
        } else {
          present = parseBool(val) === true;
        }
        break;
      }
    }

    // Check co_morbidities array if not found yet
    if (!present && Array.isArray(comorbidities)) {
      for (const cm of comorbidities) {
        const name = String(cm?.name ?? cm?.condition ?? cm ?? "").toLowerCase();
        if (backendKeys.some((k) => name.includes(k.replace(/_/g, " ").split(" ")[0]))) {
          present = true;
          sinceRaw = String(cm?.since ?? cm?.date ?? "").trim();
          break;
        }
      }
    }

    // Parse MM/YY from sinceRaw
    let month = "  ";
    let year = "  ";
    if (sinceRaw) {
      // Try "MM/YY" or "MM/YYYY"
      const mmyy = sinceRaw.match(/^(\d{1,2})[/\-](\d{2,4})/);
      if (mmyy) {
        month = mmyy[1].padStart(2, "0");
        year = mmyy[2].slice(-2).padStart(2, "0");
      } else {
        // Try ISO YYYY-MM
        const iso = sinceRaw.match(/^(\d{4})-(\d{2})/);
        if (iso) {
          month = iso[2];
          year = iso[1].slice(-2);
        } else {
          // Raw digits
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

  return result;
}

/* ═══════════════════════════════════════════════════════════════
   ADMISSION TYPE / DISCHARGE STATUS MAPPERS
═══════════════════════════════════════════════════════════════ */

function mapAdmissionType(raw) {
  const s = String(raw ?? "").toLowerCase().trim();
  if (s.includes("emergency")) return "emergency";
  if (s.includes("planned")) return "planned";
  return "";
}

/* ═══════════════════════════════════════════════════════════════
   DATA RESOLUTION
   Handles both analysisData shapes (structured vs autofill).
═══════════════════════════════════════════════════════════════ */

function normalizeAutofill(ext) {
  if (!ext || typeof ext !== "object") return {};
  const bill = ext.billing_details ?? {};
  const ad = ext.admission_details ?? {};
  return {
    patient_details: ext.patient_details ?? {},
    insurance_details: ext.insurance_details ?? {},
    hospital_details: ext.hospital_details ?? {},
    diagnosis_and_procedures: ext.diagnosis_and_procedures ?? {},
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

/* ═══════════════════════════════════════════════════════════════
   AUTOFILL RESULT OVERLAY
   Applied on top of the base form when analysisData.autofill_result exists.
═══════════════════════════════════════════════════════════════ */

function applyAutofillOverlay(base, ar, data) {
  if (!ar || typeof ar !== "object") return base;
  const out = { ...base };

  const sA = ar.section_a_tpa ?? {};
  const sB = ar.section_b_insured ?? ar.section_b_patient ?? {};
  const sC = ar.section_c_treating ?? ar.section_c_hospital ?? {};
  const sD = ar.section_d_declaration ?? {};
  const partB = ar.part_b_hospital_section ?? {};

  // ── Section A: TPA ──────────────────────────────────────────
  if (sA.tpa_name)
    out.tpaName = padChars(upper(sA.tpa_name, 24), 24);
  if (sA.toll_free_phone)
    out.tpaPhone = padChars(truncate(digitsOnly(sA.toll_free_phone), 10), 10);
  if (sA.toll_free_fax)
    out.tpaFax = padChars(truncate(digitsOnly(sA.toll_free_fax), 12), 12);
  if (sA.hospital_name)
    out.tpaHospitalName = padChars(upper(sA.hospital_name, 30), 30);
  if (sA.hospital_address)
    out.tpaHospitalAddress = padChars(upper(sA.hospital_address, 30), 30);
  if (sA.rohini_id)
    out.tpaRohiniId = padChars(truncate(String(sA.rohini_id), 30), 30);
  if (sA.email_id)
    out.tpaEmailId = String(sA.email_id).trim();

  // ── Section B: Insured/Patient ──────────────────────────────
  if (sB.patient_name)
    out.patientName = padChars(upper(sB.patient_name, 28), 28);
  if (sB.gender) {
    const g = String(sB.gender).toLowerCase();
    out.gender = g.includes("f") ? "female" : g.includes("m") ? "male" : out.gender;
  }
  if (sB.age_years != null)
    out.ageYears = padChars(parseAge(String(sB.age_years)), 2);
  if (sB.age_months != null)
    out.ageMonths = padChars(truncate(digitsOnly(String(sB.age_months)), 2), 2);
  if (sB.date_of_birth)
    out.dob = padChars(parseDateDDMMYYYY(sB.date_of_birth), 8);
  if (sB.contact_number)
    out.contactNumber = padChars(truncate(digitsOnly(sB.contact_number), 10), 10);
  if (sB.attending_relative_contact)
    out.relativeContact = padChars(
      truncate(digitsOnly(sB.attending_relative_contact), 10),
      10
    );
  if (sB.insured_card_id)
    out.insuredCardId = padChars(truncate(upper(sB.insured_card_id).replace(/\s/g, ""), 26), 26);
  if (sB.policy_number)
    out.policyNumber = padChars(truncate(upper(sB.policy_number).replace(/\s/g, ""), 26), 26);
  if (sB.employee_id)
    out.employeeId = String(sB.employee_id).trim();
  if (sB.other_insurance != null)
    out.otherInsurance = yesNo(sB.other_insurance);
  if (sB.other_insurance_company)
    out.otherInsuranceCompany = padChars(upper(sB.other_insurance_company, 28), 28);
  if (sB.other_insurance_details)
    out.otherInsuranceDetails = String(sB.other_insurance_details).trim();
  if (sB.family_physician != null)
    out.hasFamilyPhysician = yesNo(sB.family_physician);
  if (sB.family_physician_name)
    out.familyPhysicianName = padChars(upper(sB.family_physician_name, 25), 25);
  if (sB.family_physician_contact)
    out.familyPhysicianContact = padChars(
      truncate(digitsOnly(sB.family_physician_contact), 10),
      10
    );
  if (sB.current_address)
    out.patientAddress = padChars(upper(sB.current_address, 30), 30);
  if (sB.occupation)
    out.patientOccupation = padChars(upper(sB.occupation, 30), 30);

  // ── Section C: Treating Doctor ──────────────────────────────
  if (sC.treating_doctor_name ?? sC.doctor_name ?? partB.treating_doctor)
    out.treatingDoctorName = String(
      firstFilled(sC.treating_doctor_name, sC.doctor_name, partB.treating_doctor) ?? ""
    ).trim();
  if (sC.contact_number ?? partB.treating_doctor_contact)
    out.treatingDoctorContact = padChars(
      truncate(digitsOnly(firstFilled(sC.contact_number, partB.treating_doctor_contact) ?? ""), 10),
      10
    );
  if (sC.nature_of_illness)
    out.natureOfIllness = String(sC.nature_of_illness).trim();
  if (sC.relevant_clinical_findings)
    out.clinicalFindings = String(sC.relevant_clinical_findings).trim();
  if (sC.duration_days != null)
    out.durationDays = padChars(truncate(String(sC.duration_days), 3), 3);
  if (sC.first_consultation_date)
    out.firstConsultationDate = padChars(parseDateDDMMYYYY(sC.first_consultation_date), 8);
  if (sC.past_history)
    out.pastHistory = String(sC.past_history).trim();
  if (sC.provisional_diagnosis)
    out.provisionalDiagnosis = String(sC.provisional_diagnosis).trim();
  if (sC.icd_10_code)
    out.icd10Code = padChars(truncate(upper(sC.icd_10_code).replace(/\s/g, ""), 14), 14);
  if (sC.proposed_treatment_medical != null)
    out.proposedMedical = parseBool(sC.proposed_treatment_medical) === true;
  if (sC.proposed_treatment_surgical != null)
    out.proposedSurgical = parseBool(sC.proposed_treatment_surgical) === true;
  if (sC.proposed_treatment_intensive_care != null)
    out.proposedIntensiveCare = parseBool(sC.proposed_treatment_intensive_care) === true;
  if (sC.proposed_treatment_investigation != null)
    out.proposedInvestigation = parseBool(sC.proposed_treatment_investigation) === true;
  if (sC.proposed_treatment_non_allopathic != null)
    out.proposedNonAllopathic = parseBool(sC.proposed_treatment_non_allopathic) === true;
  if (sC.investigation_details)
    out.investigationDetails = String(sC.investigation_details).trim();
  if (sC.drug_route)
    out.drugRoute = String(sC.drug_route).trim();
  if (sC.surgery_name)
    out.surgeryName = String(sC.surgery_name).trim();
  if (sC.icd_10_pcs_code)
    out.icd10PcsCode = padChars(truncate(upper(sC.icd_10_pcs_code).replace(/\s/g, ""), 12), 12);
  if (sC.other_treatment_details)
    out.otherTreatmentDetails = String(sC.other_treatment_details).trim();
  if (sC.injury_cause)
    out.injuryCause = String(sC.injury_cause).trim();
  if (sC.is_rta != null)
    out.isRta = parseBool(sC.is_rta) === true;
  if (sC.date_of_injury)
    out.dateOfInjury = padChars(parseDateDDMMYYYY(sC.date_of_injury), 8);
  if (sC.reported_to_police != null)
    out.reportedPolice = parseBool(sC.reported_to_police) === true;
  if (sC.fir_number)
    out.firNumber = padChars(truncate(String(sC.fir_number).replace(/\s/g, ""), 10), 10);
  if (sC.alcohol_substance != null)
    out.alcoholSubstance = parseBool(sC.alcohol_substance) === true;
  if (sC.substance_test != null)
    out.substanceTest = parseBool(sC.substance_test) === true;
  if (sC.maternity_g != null)
    out.maternityG = String(sC.maternity_g).trim();
  if (sC.maternity_p != null)
    out.maternityP = String(sC.maternity_p).trim();
  if (sC.maternity_l != null)
    out.maternityL = String(sC.maternity_l).trim();
  if (sC.maternity_a != null)
    out.maternityA = String(sC.maternity_a).trim();
  if (sC.date_of_delivery)
    out.dateOfDelivery = padChars(parseDateDDMMYYYY(sC.date_of_delivery), 8);

  // Admission details
  if (sC.date_of_admission)
    out.admissionDate = padChars(parseDateDDMMYYYY(sC.date_of_admission), 8);
  if (sC.time_of_admission)
    out.admissionTime = parseTime(sC.time_of_admission);
  if (sC.emergency != null)
    out.isEmergency = parseBool(sC.emergency) === true;
  if (sC.planned != null)
    out.isPlanned = parseBool(sC.planned) === true;
  if (sC.expected_days_stay != null)
    out.expectedDays = padChars(truncate(String(sC.expected_days_stay), 3), 3);
  if (sC.icu_days != null)
    out.icuDays = padChars(truncate(String(sC.icu_days), 3), 3);
  if (sC.room_type)
    out.roomType = String(sC.room_type).trim();

  // Cost rows
  const costMap = {
    roomNursingCost:    sC.room_nursing_cost    ?? sC.room_rent,
    investigationCost:  sC.investigation_cost   ?? sC.diagnostics_cost,
    icuCharges:         sC.icu_charges,
    otCharges:          sC.ot_charges,
    professionalFees:   sC.professional_fees    ?? sC.surgeon_fees,
    medicinesCost:      sC.medicines_cost       ?? sC.pharmacy_cost,
    otherHospExpenses:  sC.other_expenses       ?? sC.miscellaneous,
    packageCharges:     sC.package_charges      ?? sC.package_amount,
    totalExpectedCost:  sC.total_expected_cost  ?? sC.total_amount,
  };
  Object.entries(costMap).forEach(([field, val]) => {
    if (val != null) out[field] = padAmount(val, 8);
  });

  // ── Section D: Doctor declaration ──────────────────────────
  if (sD.doctor_name ?? partB.treating_doctor)
    out.declaringDoctorName = padChars(
      upper(firstFilled(sD.doctor_name, partB.treating_doctor), 31),
      31
    );
  if (sD.qualification ?? partB.doctor_qualification)
    out.declaringQualification = padChars(
      upper(firstFilled(sD.qualification, partB.doctor_qualification), 31),
      31
    );
  if (sD.registration_no ?? partB.registration_no ?? partB.doctor_registration_number)
    out.declaringRegistrationNo = padChars(
      upper(
        String(firstFilled(sD.registration_no, partB.registration_no, partB.doctor_registration_number) ?? ""),
        31
      ),
      31
    );

  return out;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */

/**
 * Map analysisData → Care Health Pre-Auth form state.
 *
 * @param {object} analysisData  Raw object from backend / route.params.analysisData
 * @returns {object}             Flat form state for CareHealthPreAuth component
 */
export function mapToCareHealthPreAuth(analysisData) {
  const data = resolveData(analysisData);

  const patient  = data.patient_details          ?? {};
  const hosp     = data.hospital_details         ?? {};
  const ins      = data.insurance_details        ?? {};
  const diag     = data.diagnosis_and_procedures ?? {};
  const claim    = data.claim_details            ?? {};
  const ext      = analysisData?.autofill_extracted ?? {};
  const ar       = analysisData?.autofill_result    ?? {};
  const partB    = ar.part_b_hospital_section       ?? {};

  // ── Gender ─────────────────────────────────────────────────
  const genderRaw = String(patient.gender ?? "").toLowerCase();
  const gender =
    genderRaw.includes("female") || genderRaw === "f"
      ? "female"
      : genderRaw.includes("male") || genderRaw === "m"
      ? "male"
      : "";

  // ── Admission type ─────────────────────────────────────────
  const admTypeRaw = String(
    firstFilled(hosp.admission_type, hosp.type_of_admission) ?? ""
  ).toLowerCase();
  const isEmergency = admTypeRaw.includes("emergency");
  const isPlanned   = admTypeRaw.includes("planned");

  // ── Proposed treatment ─────────────────────────────────────
  const procedureExists = [
    diag.procedure_1, diag.procedure_2, diag.procedure_3,
    diag.procedure_details, diag.primary_icd_pcs_code,
  ].some((v) => String(v ?? "").trim() !== "");

  const systemLower = String(diag.system_of_medicine ?? "").toLowerCase();
  const isNonAllopathic = systemLower ? !systemLower.includes("allopath") : false;

  // ── Injury flags ───────────────────────────────────────────
  const injuryCauseLower = String(
    firstFilled(diag.injury_cause, diag.hospitalization_cause) ?? ""
  ).toLowerCase();

  // ── Chronic illness ────────────────────────────────────────
  const chronicIllnesses = extractChronicIllnesses(data);

  // ── Treating doctor ────────────────────────────────────────
  const treatingDoctorName = String(
    firstFilled(hosp.treating_doctor, partB.treating_doctor) ?? ""
  ).trim();
  const treatingDoctorContact = padChars(
    truncate(
      digitsOnly(
        firstFilled(hosp.doctor_phone, hosp.treating_doctor_phone, hosp.hospital_phone) ?? ""
      ),
      10
    ),
    10
  );

  // ── Build base form ────────────────────────────────────────
  const base = {
    // ── Section A: TPA Details ──────────────────────────────
    tpaName:          padChars(upper(firstFilled(ins.tpa_name, ins.insurance_company) ?? "", 24), 24),
    tpaPhone:         padChars(truncate(digitsOnly(ins.tpa_phone ?? ins.helpline ?? ""), 10), 10),
    tpaFax:           padChars(truncate(digitsOnly(ins.tpa_fax ?? ""), 12), 12),
    tpaHospitalName:  padChars(upper(hosp.hospital_name ?? "", 30), 30),
    tpaHospitalAddress: padChars(upper(
      String(firstFilled(hosp.hospital_address, joinLocation(hosp.hospital_city, hosp.hospital_state)) ?? ""),
      30
    ), 30),
    tpaRohiniId:      padChars(truncate(String(hosp.rohini_id ?? hosp.hospital_id ?? ""), 30), 30),
    tpaEmailId:       String(firstFilled(hosp.hospital_email, hosp.email) ?? "").trim(),

    // ── Section B: Insured / Patient ────────────────────────
    patientName:      padChars(upper(patient.name ?? "", 28), 28),
    gender,
    ageYears:         padChars(parseAge(patient.age), 2),
    ageMonths:        padChars(
      truncate(digitsOnly(String(patient.age_months ?? "")), 2) || "  ",
      2
    ),
    dob:              padChars(parseDateDDMMYYYY(patient.date_of_birth), 8),
    contactNumber:    padChars(truncate(digitsOnly(patient.phone ?? patient.mobile ?? ""), 10), 10),
    relativeContact:  padChars(
      truncate(digitsOnly(patient.attending_relative_phone ?? patient.relative_phone ?? ""), 10),
      10
    ),
    insuredCardId:    padChars(
      truncate(upper(firstFilled(ins.insurer_id_card, ins.certificate_number) ?? "").replace(/\s/g, ""), 26),
      26
    ),
    policyNumber:     padChars(
      truncate(upper(ins.policy_number ?? ins.corporate_name ?? "").replace(/\s/g, ""), 26),
      26
    ),
    employeeId:       String(patient.employee_id ?? "").trim(),
    otherInsurance:   yesNo(patient.other_insurance ?? ins.has_other_insurance),
    otherInsuranceCompany: padChars(upper(ins.other_insurance_company ?? ins.previous_insurer ?? "", 28), 28),
    otherInsuranceDetails: String(ins.other_insurance_details ?? "").trim(),
    hasFamilyPhysician:    yesNo(patient.has_family_physician ?? patient.family_physician),
    familyPhysicianName:   padChars(upper(patient.family_physician_name ?? "", 25), 25),
    familyPhysicianContact: padChars(
      truncate(digitsOnly(patient.family_physician_contact ?? patient.family_physician_phone ?? ""), 10),
      10
    ),
    patientAddress:   padChars(
      upper(
        String(
          firstFilled(
            patient.current_address,
            patient.address,
            patient.full_address,
            joinLocation(patient.city, patient.state)
          ) ?? ""
        ),
        30
      ),
      30
    ),
    patientOccupation: padChars(upper(patient.occupation ?? "", 30), 30),

    // ── Section C: Treating Doctor / Hospital ───────────────
    treatingDoctorName,
    treatingDoctorContact,
    natureOfIllness:     String(diag.nature_of_illness ?? diag.presenting_complaints ?? "").trim(),
    clinicalFindings:    String(diag.relevant_clinical_findings ?? diag.clinical_findings ?? "").trim(),
    durationDays:        padChars(
      truncate(String(diag.duration_days ?? diag.duration_of_ailment ?? ""), 3),
      3
    ),
    firstConsultationDate: padChars(parseDateDDMMYYYY(diag.first_consultation_date), 8),
    pastHistory:         String(diag.past_history_of_ailment ?? diag.past_history ?? "").trim(),
    provisionalDiagnosis: String(
      firstFilled(diag.provisional_diagnosis, diag.primary_diagnosis) ?? ""
    ).trim(),
    icd10Code:           padChars(
      truncate(upper(diag.primary_icd_code ?? "").replace(/\s/g, ""), 14),
      14
    ),

    // ── Treatment type checkboxes ──────────────────────────
    proposedMedical:      parseBool(diag.proposed_line_medical_management) === true,
    proposedSurgical:     parseBool(diag.proposed_line_surgical_management) ?? procedureExists,
    proposedIntensiveCare: parseBool(diag.proposed_line_intensive_care) ??
      Number(firstFilled(hosp.icu_days, ext.admission_details?.icu_days) ?? 0) > 0,
    proposedInvestigation: parseBool(diag.proposed_line_investigation) === true,
    proposedNonAllopathic: parseBool(diag.proposed_line_non_allopathic) ?? isNonAllopathic,

    investigationDetails: String(diag.investigation_details ?? diag.medical_details ?? "").trim(),
    drugRoute:            String(diag.drug_administration_route ?? "").trim(),
    surgeryName:          String(diag.surgery_name ?? diag.procedure_details ?? diag.procedure_1 ?? "").trim(),
    icd10PcsCode:         padChars(
      truncate(
        upper(firstFilled(diag.primary_icd_pcs_code, diag.procedure_1_icd_pcs) ?? "").replace(/\s/g, ""),
        12
      ),
      12
    ),
    otherTreatmentDetails: String(diag.other_treatment_details ?? "").trim(),

    // ── Injury details ─────────────────────────────────────
    injuryCause:     String(firstFilled(diag.injury_cause, diag.injury_description) ?? "").trim(),
    isRta:           !!(diag.is_rta || injuryCauseLower.includes("road")),
    dateOfInjury:    padChars(parseDateDDMMYYYY(diag.date_of_injury ?? diag.date_of_injury_or_disease), 8),
    reportedPolice:  !!(diag.reported_to_police || diag.is_reported_to_police),
    firNumber:       padChars(truncate(String(diag.fir_number ?? "").replace(/\s/g, ""), 10), 10),
    alcoholSubstance: !!(diag.is_substance_abuse || injuryCauseLower.includes("alcohol")),
    substanceTest:   parseBool(diag.substance_test_conducted) === true,

    // ── Maternity ─────────────────────────────────────────
    maternityG:      String(diag.gravida ?? ext.maternity_details?.gravida ?? "").trim(),
    maternityP:      String(diag.para   ?? ext.maternity_details?.para    ?? "").trim(),
    maternityL:      String(diag.living ?? ext.maternity_details?.living   ?? "").trim(),
    maternityA:      String(diag.abortion ?? ext.maternity_details?.abortion ?? "").trim(),
    dateOfDelivery:  padChars(
      parseDateDDMMYYYY(
        firstFilled(diag.date_of_delivery, diag.expected_delivery_date, ext.maternity_details?.date_of_delivery)
      ),
      8
    ),

    // ── Admission details ─────────────────────────────────
    admissionDate:   padChars(parseDateDDMMYYYY(hosp.admission_date), 8),
    admissionTime:   parseTime(hosp.admission_time),
    isEmergency,
    isPlanned,
    expectedDays:    padChars(truncate(String(hosp.expected_days_stay ?? hosp.length_of_stay ?? ""), 3), 3),
    icuDays:         padChars(truncate(String(hosp.icu_days ?? ext.admission_details?.icu_days ?? ""), 3), 3),
    roomType:        String(hosp.room_category ?? hosp.room_type ?? "").trim(),

    // ── Cost estimates ─────────────────────────────────────
    roomNursingCost:   padAmount(hosp.room_rent ?? hosp.room_charges, 8),
    investigationCost: padAmount(hosp.investigation_cost ?? hosp.diagnostic_cost, 8),
    icuCharges:        padAmount(hosp.icu_charges, 8),
    otCharges:         padAmount(hosp.ot_charges ?? hosp.operation_charges, 8),
    professionalFees:  padAmount(hosp.professional_fees ?? hosp.surgeon_fees ?? hosp.consultation_fees, 8),
    medicinesCost:     padAmount(
      firstFilled(hosp.medicine_cost, hosp.pharmacy_cost, claim.bill_amount),
      8
    ),
    otherHospExpenses: padAmount(hosp.other_expenses ?? hosp.miscellaneous_charges, 8),
    packageCharges:    padAmount(hosp.package_charges ?? hosp.package_amount, 8),
    totalExpectedCost: padAmount(
      firstFilled(hosp.total_expected_cost, claim.bill_amount, claim.claimed_amount),
      8
    ),

    // ── Chronic illness (Section C — past history) ─────────
    chronicIllnesses,
    otherAilmentDetails: String(diag.other_ailment_details ?? diag.other_history ?? "").trim(),

    // ── Section D: Doctor declaration ─────────────────────
    declaringDoctorName:      padChars(upper(treatingDoctorName, 31), 31),
    declaringQualification:   padChars(upper(hosp.doctor_qualification ?? "", 31), 31),
    declaringRegistrationNo:  padChars(
      upper(
        String(firstFilled(hosp.doctor_registration_number, partB.registration_no) ?? ""),
        31
      ),
      31
    ),
  };

  // Apply autofill_result overlay if present
  return analysisData?.autofill_result
    ? applyAutofillOverlay(base, analysisData.autofill_result, data)
    : base;
}

/* ═══════════════════════════════════════════════════════════════
   HELPER: generate a blank/empty form state (no analysisData)
   Useful for a fresh form opened without any pre-fill.
═══════════════════════════════════════════════════════════════ */
export function blankCareHealthPreAuth() {
  return mapToCareHealthPreAuth(null);
}