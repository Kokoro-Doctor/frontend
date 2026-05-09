/**
 * MediAssistMapper.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for mapping backend analysisData → form state.
 *
 * EXPORTS:
 *   mapToFormA(analysisData)  → flat form object for MediAssistFormA
 *   mapToFormB(analysisData)  → flat form object for MediAssistFormB
 *
 * USAGE IN SCREENS:
 *   import { mapToFormA } from "../../utils/MediAssistMapper";
 *   const [form, setForm] = useState(() => mapToFormA(analysisData));
 *
 *   import { mapToFormB } from "../../utils/MediAssistMapper";
 *   const [form, setForm] = useState(() => mapToFormB(analysisData));
 *
 * BACKEND SHAPE (both paths handled):
 *   analysisData.structured_data    → audit/claim path
 *   analysisData.autofill_extracted → autofill path (bills/prescriptions only)
 *   analysisData.autofill_result    → optional overlay with section_a/b/c/d/e/g keys
 * ─────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════════
   LOW-LEVEL HELPERS
   All pure functions — no side effects, easy to unit test.
═══════════════════════════════════════════════════════════════ */

/** HTML-escape a value for safe use in HTML templates */
export function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  
  /** Strip all non-digit characters */
  export function digitsOnly(s) {
    return String(s ?? "").replace(/\D/g, "");
  }
  
  /**
   * Pad or truncate a string to exactly `len` characters.
   * Padding is spaces on the right; truncation from the right.
   */
  export function padChars(s, len) {
    const t = String(s ?? "");
    return t.padEnd(len, " ").slice(0, len);
  }
  
  /** Truncate to at most `len` characters */
  export function truncate(s, len) {
    return String(s ?? "").slice(0, len);
  }
  
  /** Uppercase, collapse whitespace, trim */
  export function upper(s, maxLen) {
    const t = String(s ?? "")
      .toUpperCase()
      .replace(/\s+/g, " ")
      .trim();
    return maxLen ? t.slice(0, maxLen) : t;
  }
  
  /**
   * Parse a date string to DDMMYYYY (8 digit string).
   * Handles: ISO (2024-08-15), DD/MM/YYYY, DD-MM-YYYY, raw digits.
   */
  export function parseDateDDMMYYYY(raw) {
    if (!raw) return "";
    const s = String(raw).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[3]}${iso[2]}${iso[1]}`;
    const dmy = s.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})/);
    if (dmy) {
      return `${dmy[1].padStart(2,"0")}${dmy[2].padStart(2,"0")}${dmy[3]}`;
    }
    const only = digitsOnly(s);
    if (only.length >= 8) return only.slice(0, 8);
    return "";
  }
  
  /**
   * Parse a date to DDMMYY (6 digit string) — used in Form B DOB / delivery date.
   */
  export function parseDateDDMMYY(raw) {
    const full = parseDateDDMMYYYY(raw); // DDMMYYYY
    if (!full) return "";
    // Take DD MM YY (last 2 of year)
    return full.slice(0, 4) + full.slice(6, 8);
  }
  
  /** Format time (HH:MM or HHMM) to 4 digits (HHMM) */
  export function parseTime(raw) {
    if (!raw) return "    ";
    const s = digitsOnly(String(raw));
    if (s.length >= 4) return s.slice(0, 4);
    if (!s) return "    ";
    return s.padStart(4, "0").slice(-4);
  }
  
  /**
   * Pad a monetary amount to exactly `len` digits (right-aligned, space-padded left).
   * e.g. "54213" with len=8 → "   54213"
   */
  export function padAmount(raw, len) {
    const d = digitsOnly(String(raw ?? ""));
    if (!d) return "".padEnd(len, " ");
    const trimmed = d.length > len ? d.slice(-len) : d;
    return trimmed.padStart(len, " ").slice(-len);
  }
  
  /** "yes" / "no" / "" from any truthy/falsy value */
  export function yesNo(v) {
    if (v == null) return "";
    if (v === true) return "yes";
    if (v === false) return "no";
    const t = String(v).toLowerCase().trim();
    if (["y","yes","true","1"].includes(t)) return "yes";
    if (["n","no","false","0"].includes(t)) return "no";
    return "";
  }
  
  /** Split a long address string into two fixed-width lines */
  export function splitAddress(raw, w1, w2) {
    const t = String(raw ?? "").replace(/\s+/g, " ").trim();
    if (!t) return [padChars("", w1), padChars("", w2)];
    if (t.length <= w1) return [padChars(t, w1), padChars("", w2)];
    return [
      padChars(t.slice(0, w1), w1),
      padChars(t.slice(w1, w1 + w2), w2),
    ];
  }
  
  /** Parse age from various formats → 2-char string "35", "05" etc. */
  export function parseAge(raw) {
    if (!raw) return "  ";
    const m = String(raw).match(/\d+/);
    return m ? m[0].padStart(2, "0").slice(-2) : "  ";
  }
  
  /** Combine TPA name + company into one string for TPA ID field */
  function tpaId(ins) {
    const a = (ins?.tpa_name ?? "").trim();
    const b = (ins?.insurance_company ?? "").trim();
    if (a && b) return `${a} ${b}`.trim();
    return a || b || "";
  }
  
  /* ═══════════════════════════════════════════════════════════════
     DATA RESOLUTION
     Handles both analysisData shapes (structured vs autofill).
  ═══════════════════════════════════════════════════════════════ */
  
  /**
   * Normalize autofill_extracted into the same shape as structured_data
   * so downstream mapping always works with a single consistent shape.
   */
  function normalizeAutofill(ext) {
    if (!ext || typeof ext !== "object") return {};
    const bill = ext.billing_details ?? {};
    const ad   = ext.admission_details ?? {};
    const bank = ext.bank_details ?? {};
    return {
      patient_details:           ext.patient_details ?? {},
      insurance_details:         ext.insurance_details ?? {},
      hospital_details:          ext.hospital_details ?? {},
      diagnosis_and_procedures:  ext.diagnosis_and_procedures ?? {},
      claim_details: {
        pre_hospitalization_amount:  bill.pre_hospitalization_expenses ?? null,
        bill_amount:                 bill.total_bill_amount ?? bill.hospitalization_expenses ?? null,
        post_hospitalization_amount: bill.post_hospitalization_expenses ?? null,
        health_checkup_cost:         bill.health_checkup_cost ?? null,
        ambulance_charges:           bill.ambulance_charges ?? null,
        other_charges:               bill.other_charges ?? null,
        pre_hosp_period_days:        ad.pre_hospitalization_period_days ?? null,
        post_hosp_period_days:       ad.post_hospitalization_period_days ?? null,
      },
      bank_details: {
        ...bank,
        bank_name: bank.bank_name ?? bank.bank_name_branch ?? null,
      },
      document_metadata: ext.document_metadata ?? {},
    };
  }
  
  /**
   * Resolve analysisData into a single normalized data object,
   * regardless of which API path was used.
   */
  function resolveData(analysisData) {
    if (!analysisData) return {};
    if (analysisData.structured_data) return analysisData.structured_data;
    if (analysisData.autofill_extracted) return normalizeAutofill(analysisData.autofill_extracted);
    return {};
  }
  
  /* ═══════════════════════════════════════════════════════════════
     SHARED FIELD EXTRACTION
     Fields that appear in BOTH Form A and Form B.
     Returns a partial object — merged into each form's output.
  ═══════════════════════════════════════════════════════════════ */
  
  function extractShared(data) {
    const patient = data.patient_details ?? {};
    const hosp    = data.hospital_details ?? {};
    const diag    = data.diagnosis_and_procedures ?? {};
  
    const genderRaw = String(patient.gender ?? "").toLowerCase();
    const gender = genderRaw.includes("female") || genderRaw === "f"
      ? "female"
      : genderRaw.includes("male") || genderRaw === "m"
      ? "male"
      : "";
  
    return {
      // ── Patient identity ──────────────────────────────────────
      patientNameFull:   upper(patient.name, 50),
      gender,
      dob:               padChars(parseDateDDMMYYYY(patient.date_of_birth), 8),
      dobShort:          padChars(parseDateDDMMYY(patient.date_of_birth), 6),  // Form B (DDMMYY)
      ageYears:          padChars(parseAge(patient.age), 2),
      ageMonths:         padChars(digitsOnly(String(patient.age_months ?? "")).slice(0,2) || "  ", 2),
      phone:             padChars(truncate(digitsOnly(patient.phone), 10), 10),
      email:             String(patient.email ?? "").trim(),
      occupation:        String(patient.occupation ?? "").replace(/\s+/g," ").trim(),
      relationship:      String(patient.relationship_to_insured ?? "").replace(/\s+/g," ").trim(),
  
      // ── Patient address ───────────────────────────────────────
      city:              padChars(upper(patient.city, 18), 18),
      state:             padChars(upper(patient.state, 18), 18),
      pin:               padChars(truncate(digitsOnly(patient.pin_code), 6), 6),
  
      // ── Hospital ──────────────────────────────────────────────
      hospitalName:      upper(hosp.hospital_name, 50),
      admissionDate:     padChars(parseDateDDMMYYYY(hosp.admission_date), 8),
      admissionTime:     parseTime(hosp.admission_time),
      dischargeDate:     padChars(parseDateDDMMYYYY(hosp.discharge_date), 8),
      dischargeTime:     parseTime(hosp.discharge_time),
      treatingDoctor:    String(hosp.treating_doctor ?? "").trim(),
      roomCategory:      String(hosp.room_category ?? hosp.room_type ?? "").replace(/\s+/g," ").trim(),
      typeOfAdmission:   mapAdmissionType(hosp.admission_type ?? hosp.type_of_admission),
      dischargeStatus:   mapDischargeStatus(hosp.status_at_discharge),
  
      // ── Diagnosis ─────────────────────────────────────────────
      primaryDiagnosis:       String(diag.primary_diagnosis ?? "").trim(),
      hospitalizationCause:   String(diag.hospitalization_cause ?? "").replace(/\s+/g," ").trim(),
      systemOfMedicine:       String(diag.system_of_medicine ?? "").replace(/\s+/g," ").trim(),
      injurySelf:             !!diag.is_self_inflicted,
      injuryRTA:              !!(diag.is_rta || String(diag.injury_cause ?? "").toLowerCase().includes("road")),
      injurySubstance:        !!(diag.is_substance_abuse || String(diag.injury_cause ?? "").toLowerCase().includes("alcohol")),
      reportedPolice:         !!(diag.reported_to_police || diag.is_reported_to_police),
      medicoLegal:            yesNo(diag.is_medico_legal),
      firNumber:              padChars(truncate(String(diag.fir_number ?? ""), 12), 12),
      firNotReportedReason:   String(diag.fir_not_reported_reason ?? "").trim(),
      injuryHospitalization:  yesNo(diag.hospitalization_due_to_injury ?? (diag.hospitalization_cause?.toLowerCase().includes("injur") ? true : null)),
    };
  }
  
  /* ═══════════════════════════════════════════════════════════════
     SMALL ENUM MAPPERS
  ═══════════════════════════════════════════════════════════════ */
  
  function mapAdmissionType(raw) {
    const s = String(raw ?? "").toLowerCase().trim();
    if (s.includes("emergency"))  return "emergency";
    if (s.includes("planned"))    return "planned";
    if (s.includes("day"))        return "day_care";
    if (s.includes("matern"))     return "maternity";
    return "";
  }
  
  function mapDischargeStatus(raw) {
    const s = String(raw ?? "").toLowerCase().trim();
    if (s.includes("home"))       return "home";
    if (s.includes("another") || s.includes("transfer")) return "another_hospital";
    if (s.includes("deceas") || s.includes("death"))     return "deceased";
    return "";
  }
  
  /* ═══════════════════════════════════════════════════════════════
     AUTOFILL RESULT OVERLAY
     Applied on top of base form when analysisData.autofill_result exists.
     Keys: section_a … section_g, part_b_hospital_section, section_f_bills_enclosed
  ═══════════════════════════════════════════════════════════════ */
  
  function applyAutofillOverlayA(base, ar) {
    if (!ar || typeof ar !== "object") return base;
    const out = { ...base };
  
    const a     = ar.section_a_primary_insured    ?? {};
    const b     = ar.section_b_insurance_history  ?? {};
    const c     = ar.section_c_patient_details    ?? {};
    const d     = ar.section_d_hospitalization    ?? {};
    const e     = ar.section_e_claim_details      ?? {};
    const g     = ar.section_g_bank_account       ?? {};
    const partB = ar.part_b_hospital_section      ?? {};
  
    // Section A
    if (a.policy_number)     out.policyNumber     = padChars(truncate(upper(a.policy_number).replace(/\s/g,""), 18), 18);
    if (a.certificate_number) out.certificateNumber = padChars(truncate(upper(a.certificate_number).replace(/\s/g,""), 14), 14);
    if (a.company_tpa_id)    out.tpaId            = padChars(upper(a.company_tpa_id, 22), 22);
    if (a.name)              { out.primaryName = padChars(upper(a.name, 40), 40); out.hospitalizedName = out.primaryName; }
    if (a.address)           { const [l1,l2] = splitAddress(a.address,40,35); out.primaryAddressRow1=l1; out.primaryAddressRow2=l2; }
    if (a.city)              out.primaryCity    = padChars(upper(a.city, 18), 18);
    if (a.state)             out.primaryState   = padChars(upper(a.state, 18), 18);
    if (a.pin_code)          out.primaryPin     = padChars(truncate(digitsOnly(a.pin_code), 6), 6);
    if (a.phone)             out.primaryPhone   = padChars(truncate(digitsOnly(a.phone), 10), 10);
    if (a.email)             out.primaryEmail   = String(a.email).trim();
  
    // Section B
    if (b.currently_other_insurance != null)   out.bCurrentlyOther  = yesNo(b.currently_other_insurance);
    if (b.commencement_date)                   out.bCommencement    = padChars(parseDateDDMMYYYY(b.commencement_date), 8);
    if (b.company_name)                        out.bIfYesCoName     = padChars(upper(b.company_name, 20), 20);
    if (b.policy_number)                       out.bIfYesPolicy     = padChars(truncate(upper(b.policy_number).replace(/\s/g,""), 18), 18);
    if (b.sum_insured)                         out.bSumInsured      = padAmount(b.sum_insured, 12);
    if (b.hospitalized_last_4_years != null)   out.bHosp4Y          = yesNo(b.hospitalized_last_4_years);
    if (b.diagnosis)                           out.diagnosis        = String(b.diagnosis);
    if (b.previously_other_insurance != null)  out.bPreviouslyOther = yesNo(b.previously_other_insurance);
  
    // Section C
    if (c.name)              { out.hospitalizedName = padChars(upper(c.name, 40), 40); }
    if (c.gender)            { const g = c.gender.toLowerCase(); out.gender = g.includes("f") ? "female" : g.includes("m") ? "male" : out.gender; }
    if (c.age_years != null) out.ageYears = padChars(parseAge(String(c.age_years)), 2);
    if (c.age_months != null) out.ageMonths = padChars(truncate(digitsOnly(String(c.age_months)), 2), 2);
    if (c.date_of_birth)     out.dob          = padChars(parseDateDDMMYYYY(c.date_of_birth), 8);
    if (c.relationship_to_insured) out.relationship = String(c.relationship_to_insured).trim();
    if (c.occupation)        out.occupation   = String(c.occupation).trim();
    if (c.address)           { const [c1,c2] = splitAddress(c.address,40,35); out.hospAddressRow1=c1; out.hospAddressRow2=c2; }
    if (c.phone)             out.hospPhone    = padChars(truncate(digitsOnly(c.phone), 10), 10);
    if (c.email)             out.hospEmail    = String(c.email).trim();
  
    // Section D
    if (d.hospital_name)              out.hospitalName          = padChars(upper(d.hospital_name, 40), 40);
    if (d.room_category)              out.roomCategory          = String(d.room_category).trim();
    if (d.hospitalization_cause)      out.hospitalizationCause  = String(d.hospitalization_cause).trim();
    if (d.date_of_injury_or_disease)  out.injuryDate            = padChars(parseDateDDMMYYYY(d.date_of_injury_or_disease), 8);
    if (d.admission_date)             out.admissionDate         = padChars(parseDateDDMMYYYY(d.admission_date), 8);
    if (d.admission_time)             out.admissionTime         = parseTime(d.admission_time);
    if (d.discharge_date)             out.dischargeDate         = padChars(parseDateDDMMYYYY(d.discharge_date), 8);
    if (d.discharge_time)             out.dischargeTime         = parseTime(d.discharge_time);
    if (d.system_of_medicine)         out.systemOfMedicine      = String(d.system_of_medicine).trim();
    if (d.treating_doctor)            out.treatingDoctor        = String(d.treating_doctor).trim();
    else if (partB.treating_doctor)   out.treatingDoctor        = String(partB.treating_doctor).trim();
    if (d.is_rta === true)            out.injuryRta             = true;
    if (d.reported_to_police === true) out.reportedPolice       = true;
    if (d.fir_attached === true)      out.firYes                = true;
    else if (d.fir_attached === false) out.firNo                = true;
    if (d.injury_cause) {
      const inj = d.injury_cause.toLowerCase();
      if (inj.includes("self"))    out.injurySelf     = true;
      if (inj.includes("road") || inj.includes("rta")) out.injuryRta = true;
      if (inj.includes("alcohol") || inj.includes("substance")) out.injurySubstance = true;
    }
  
    // Section E
    if (e.pre_hospitalization_expenses != null)   out.claimPre          = padAmount(e.pre_hospitalization_expenses, 8);
    if (e.hospitalization_expenses != null)       out.claimHospital     = padAmount(e.hospitalization_expenses, 8);
    if (e.post_hospitalization_expenses != null)  out.claimPost         = padAmount(e.post_hospitalization_expenses, 8);
    if (e.health_checkup_cost != null)            out.healthCheckupCost = padAmount(e.health_checkup_cost, 8);
    if (e.ambulance_charges != null)              out.ambulanceCharges  = padAmount(e.ambulance_charges, 8);
    if (e.other_charges != null)                  out.otherChargesAmount= padAmount(e.other_charges, 8);
    if (e.total != null)                          out.totalClaim        = padAmount(e.total, 10);
    if (e.pre_hospitalization_period_days != null) out.preHospPeriodDays = padChars(truncate(String(e.pre_hospitalization_period_days), 3), 3);
    if (e.post_hospitalization_period_days != null) out.postHospPeriodDays = padChars(truncate(String(e.post_hospitalization_period_days), 3), 3);
    if (e.domiciliary_hospitalization != null)    out.domiciliary       = yesNo(e.domiciliary_hospitalization);
    if (e.hospital_daily_cash)                    out.hospitalDailyCash = padAmount(e.hospital_daily_cash, 8);
    if (e.surgical_cash)                          out.surgicalCash      = padAmount(e.surgical_cash, 8);
    if (e.critical_illness_benefit)               out.criticalIllnessBenefit = padAmount(e.critical_illness_benefit, 8);
    if (e.convalescence)                          out.convalescence     = padAmount(e.convalescence, 8);
    if (e.pre_post_hospitalization_lump_sum != null) out.prePostLumpSum = padAmount(e.pre_post_hospitalization_lump_sum, 8);
    if (e.others_lump != null)                    out.othersLump        = padAmount(e.others_lump, 8);
    if (Array.isArray(e.documents_checklist)) {
      e.documents_checklist.forEach((item, i) => {
        if (i < 13 && item === true) out.docChecklist[i] = true;
      });
    }
  
    // Section G (bank)
    if (g.pan)               out.pan           = padChars(truncate(upper(g.pan).replace(/\s/g,""), 10), 10);
    if (g.account_number)    out.accountNumber = padChars(truncate(String(g.account_number).replace(/\s/g,""), 22), 22);
    if (g.bank_name_branch)  out.bankNameBranch= padChars(upper(String(g.bank_name_branch), 40), 40);
    if (g.cheque_dd_payable_to) out.chequeDetails = String(g.cheque_dd_payable_to).trim();
    if (g.ifsc_code)         out.ifscCode      = padChars(truncate(upper(g.ifsc_code), 11), 11);
  
    // Part B overrides
    if (partB.patient_name)        out.hospitalizedName = padChars(upper(partB.patient_name, 40), 40);
    if (partB.primary_diagnosis)   out.diagnosis        = String(partB.primary_diagnosis);
    if (partB.total_claimed_amount) out.claimHospital   = padAmount(partB.total_claimed_amount, 8);
  
    // Section F (bills)
    const sF = ar.section_f_bills_enclosed;
    if (Array.isArray(sF)) {
      sF.forEach((row, i) => {
        if (i >= 10 || !row) return;
        out.billsRows[i] = {
          billNo:   row.bill_number != null ? String(row.bill_number) : out.billsRows[i].billNo,
          date:     row.bill_date   != null ? String(row.bill_date)   : out.billsRows[i].date,
          issuedBy: row.issued_by   != null ? String(row.issued_by)   : out.billsRows[i].issuedBy,
          towards:  row.towards     != null ? String(row.towards)     : out.billsRows[i].towards,
          amount:   row.amount      != null ? String(row.amount)      : out.billsRows[i].amount,
        };
      });
    }
  
    return out;
  }
  
  /* ═══════════════════════════════════════════════════════════════
     FORM A — FULL MAPPING
     All fields required by MediAssistFormA.jsx / MediAssistFormA.js
  ═══════════════════════════════════════════════════════════════ */
  
  /**
   * Map analysisData → Form A state.
   * Handles structured_data, autofill_extracted, and autofill_result overlay.
   *
   * @param {object} analysisData  Raw object from backend / route.params.analysisData
   * @returns {object}             Flat form state for MediAssistFormA
   */
  export function mapToFormA(analysisData) {
    const data  = resolveData(analysisData);
    const sh    = extractShared(data);
    const ins   = data.insurance_details   ?? {};
    const claim = data.claim_details       ?? {};
    const bank  = data.bank_details        ?? {};
    const meta  = data.document_metadata  ?? {};
    const patient = data.patient_details  ?? {};
    const hosp  = data.hospital_details   ?? {};
    const diag  = data.diagnosis_and_procedures ?? {};
  
    const [addr1, addr2] = splitAddress(patient.address ?? patient.full_address, 40, 35);
    const polCompact = truncate(upper(ins.policy_number ?? "").replace(/\s/g,""), 18);
  
    const base = {
      // ── Section A: Primary insured ──────────────────────────
      policyNumber:        padChars(polCompact, 18),
      certificateNumber:   padChars(truncate(upper(ins.certificate_number ?? ins.insurer_id_card ?? "").replace(/\s/g,""), 14), 14),
      tpaId:               padChars(upper(tpaId(ins), 22), 22),
      primaryName:         padChars(upper(patient.name, 40), 40),
      primaryAddressRow1:  addr1,
      primaryAddressRow2:  addr2,
      primaryCity:         sh.city,
      primaryState:        sh.state,
      primaryPin:          sh.pin,
      primaryPhone:        sh.phone,
      primaryEmail:        sh.email,
  
      // ── Section B: Insurance history ────────────────────────
      diagnosis:           String(diag.primary_diagnosis ?? diag.procedure_names?.[0] ?? ""),
      bCurrentlyOther:     "",
      bCommencement:       "".padEnd(8," "),
      bIfYesCoName:        "".padEnd(20," "),
      bIfYesPolicy:        "".padEnd(18," "),
      bSumInsured:         "".padEnd(12," "),
      bHosp4Y:             "",
      bHosp4YDate:         "".padEnd(4," "),
      bPreviouslyOther:    "",
      bIfYesCoName2:       "".padEnd(22," "),
  
      // ── Section C: Hospitalized person ──────────────────────
      hospitalizedName:    padChars(upper(patient.name, 40), 40),
      gender:              sh.gender,
      ageYears:            sh.ageYears,
      ageMonths:           sh.ageMonths,
      dob:                 sh.dob,
      relationship:        sh.relationship,
      occupation:          sh.occupation,
      hospAddressRow1:     addr1,   // same address unless patient.hosp_address_different
      hospAddressRow2:     addr2,
      hospCity:            sh.city,
      hospState:           sh.state,
      hospPin:             sh.pin,
      hospPhone:           padChars(truncate(digitsOnly(patient.phone_secondary ?? patient.phone), 10), 10),
      hospEmail:           sh.email,
  
      // ── Section D: Hospitalization ──────────────────────────
      hospitalName:        padChars(upper(hosp.hospital_name, 40), 40),
      roomCategory:        sh.roomCategory,
      hospitalizationCause: sh.hospitalizationCause,
      injuryDate:          padChars(parseDateDDMMYYYY(diag.date_of_injury_or_disease ?? hosp.date_of_injury), 8),
      admissionDate:       sh.admissionDate,
      admissionTime:       sh.admissionTime,
      dischargeDate:       sh.dischargeDate,
      dischargeTime:       sh.dischargeTime,
      treatingDoctor:      sh.treatingDoctor,
      systemOfMedicine:    sh.systemOfMedicine,
      injurySelf:          sh.injurySelf,
      injuryRta:           sh.injuryRTA,
      injurySubstance:     sh.injurySubstance,
      reportedPolice:      sh.reportedPolice,
      firYes:              false,
      firNo:               false,
  
      // ── Section E: Claim amounts ─────────────────────────────
      claimPre:            padAmount(claim.pre_hospitalization_amount, 8),
      claimHospital:       padAmount(claim.bill_amount ?? claim.claimed_amount, 8),
      claimPost:           padAmount(claim.post_hospitalization_amount, 8),
      healthCheckupCost:   padAmount(claim.health_checkup_cost, 8),
      ambulanceCharges:    padAmount(claim.ambulance_charges, 8),
      otherChargesCode:    "   ",
      otherChargesAmount:  padAmount(claim.other_charges, 8),
      totalClaim:          padAmount(claim.bill_amount ?? claim.claimed_amount, 10),
      preHospPeriodDays:   padChars(truncate(String(claim.pre_hosp_period_days ?? ""), 3), 3),
      postHospPeriodDays:  padChars(truncate(String(claim.post_hosp_period_days ?? ""), 3), 3),
      domiciliary:         "",
      hospitalDailyCash:   "".padEnd(8," "),
      surgicalCash:        "".padEnd(8," "),
      criticalIllnessBenefit: "".padEnd(8," "),
      convalescence:       "".padEnd(8," "),
      prePostLumpSum:      "".padEnd(8," "),
      othersLump:          "".padEnd(8," "),
      docChecklist:        Array(13).fill(false),
  
      // ── Section F: Bills ────────────────────────────────────
      billsRows: Array(10).fill(null).map(() => ({
        billNo: "", date: "", issuedBy: "", towards: "", amount: "",
      })),
  
      // ── Section G: Bank ─────────────────────────────────────
      pan:             padChars(truncate(upper(bank.pan ?? "").replace(/\s/g,""), 10), 10),
      accountNumber:   padChars(truncate(String(bank.account_number ?? "").replace(/\s/g,""), 22), 22),
      bankNameBranch:  padChars(upper(String(bank.bank_name ?? bank.bank_name_branch ?? bank.branch ?? ""), 40), 40),
      ifscCode:        padChars(truncate(upper(bank.ifsc_code ?? ""), 11), 11),
      chequeDetails:   String(bank.account_holder ?? bank.cheque_dd_payable_to ?? patient.name ?? "").trim(),
  
      // ── Section H: Declaration ──────────────────────────────
      declarationDate:  padChars(parseDateDDMMYYYY(meta.document_date), 8),
      declarationPlace: upper(String(patient.city ?? patient.state ?? "").trim(), 40),
  
      // ── Mobile-only convenience fields ──────────────────────
      mobileIdRow:      padChars(truncate(polCompact, 12), 12),
      mobilePolicy:     padChars(truncate(polCompact, 16), 16),
      mobileNameTrunc:  padChars(upper(patient.name, 20), 20),
      mobilePhone:      sh.phone,
      mobileEmail:      padChars(truncate(sh.email, 20), 20),
      mobileHospital:   upper(hosp.hospital_name, 200),
      mobileAdmission:  String(hosp.admission_date ?? ""),
      mobileDischarge:  String(hosp.discharge_date ?? ""),
      mobileAmount:     String(claim.bill_amount ?? ""),
    };
  
    // Apply autofill_result overlay if present
    return analysisData?.autofill_result
      ? applyAutofillOverlayA(base, analysisData.autofill_result)
      : base;
  }
  
  /* ═══════════════════════════════════════════════════════════════
     FORM B DIAGNOSIS/PROCEDURE HELPERS
  ═══════════════════════════════════════════════════════════════ */
  
  function mapDiagnoses(diag) {
    // Backend may give individual fields or arrays
    const labels = [
      diag.primary_diagnosis   ?? "",
      diag.additional_diagnosis ?? "",
      diag.co_morbidity_1       ?? "",
      diag.co_morbidity_2       ?? "",
    ];
    const icds = [
      diag.primary_icd_code     ?? "",
      diag.additional_icd_code  ?? "",
      diag.co_morbidity_1_icd   ?? "",
      diag.co_morbidity_2_icd   ?? "",
    ];
    return Array.from({ length: 4 }, (_, i) => ({
      icd10:       padChars(truncate(upper(icds[i]).replace(/\s/g,""), 7), 7),
      description: String(labels[i]).trim(),
    }));
  }
  
  function mapProcedures(diag) {
    const procs = [
      { icd: diag.procedure_1_icd_pcs ?? "", desc: diag.procedure_1 ?? "" },
      { icd: diag.procedure_2_icd_pcs ?? "", desc: diag.procedure_2 ?? "" },
      { icd: diag.procedure_3_icd_pcs ?? "", desc: diag.procedure_3 ?? "" },
      { icd: "",                              desc: diag.procedure_details ?? "" },
    ];
    return procs.map(p => ({
      icd10pcs:    padChars(truncate(upper(p.icd).replace(/\s/g,""), 7), 7),
      description: String(p.desc).trim(),
    }));
  }
  
  /** Extract surname / first / middle from a full name string */
  function splitName(full) {
    const parts = String(full ?? "").trim().split(/\s+/);
    return {
      surname: padChars(upper(parts[0] ?? "", 18), 18),
      first:   padChars(upper(parts[1] ?? "", 14), 14),
      middle:  padChars(upper(parts.slice(2).join(" "), 14), 14),
    };
  }
  
  /* ═══════════════════════════════════════════════════════════════
     FORM B — FULL MAPPING
     All fields required by MediAssistFormB.jsx / MediAssistFormB.js
  ═══════════════════════════════════════════════════════════════ */
  
  /**
   * Map analysisData → Form B state.
   * Form B is filled by the hospital, so it draws on hospital_details
   * and diagnosis_and_procedures more heavily than Form A.
   *
   * @param {object} analysisData  Raw object from backend / route.params.analysisData
   * @returns {object}             Flat form state for MediAssistFormB
   */
  export function mapToFormB(analysisData) {
    const data    = resolveData(analysisData);
    const sh      = extractShared(data);
    const patient = data.patient_details             ?? {};
    const hosp    = data.hospital_details            ?? {};
    const diag    = data.diagnosis_and_procedures    ?? {};
    const ext     = analysisData?.autofill_extracted ?? {};
  
    // Doctor name split
    const doctorName = splitName(hosp.treating_doctor);
    // Patient name split
    const patientName = splitName(patient.name);
  
    return {
      // ── Section A: Hospital details ─────────────────────────
      hospitalName:              padChars(upper(hosp.hospital_name, 50), 50),
      hospitalId:                padChars(truncate(String(hosp.hospital_id ?? ""), 20), 20),
      hospitalNetwork:           String(hosp.hospital_type ?? "").toLowerCase().includes("non") ? "non_network" : "network",
      treatingDoctorSurname:     doctorName.surname,
      treatingDoctorFirst:       doctorName.first,
      treatingDoctorMiddle:      doctorName.middle,
      qualification:             String(hosp.doctor_qualification ?? "").trim(),
      registrationNoStateCode:   padChars(truncate(String(hosp.doctor_registration_number ?? ""), 14), 14),
      phoneNo:                   padChars(truncate(digitsOnly(hosp.doctor_phone ?? hosp.hospital_phone ?? ""), 11), 11),
  
      // ── Section B: Patient admitted ─────────────────────────
      patientSurname:            patientName.surname,
      patientFirst:              patientName.first,
      patientMiddle:             patientName.middle,
      ipRegNumber:               padChars(truncate(String(hosp.ip_registration_number ?? patient.patient_id ?? ""), 15), 15),
      gender:                    sh.gender,
      ageYears:                  sh.ageYears,
      ageMonths:                 sh.ageMonths,
      dob:                       sh.dobShort,             // Form B uses DDMMYY (6 boxes)
      admissionDate:             sh.admissionDate,        // DDMMYYYY (8 boxes)
      admissionTime:             sh.admissionTime,
      dischargeDate:             sh.dischargeDate,
      dischargeTime:             sh.dischargeTime,
      typeOfAdmission:           sh.typeOfAdmission,
      dateOfDelivery:            padChars(parseDateDDMMYY(diag.date_of_delivery ?? ""), 6),
      gravidaStatus:             padChars(truncate(String(diag.gravida_status ?? ext.maternity_details?.gravida_status ?? ""), 4), 4),
      dischargeStatus:           sh.dischargeStatus,
      totalClaimedAmount:        String(data.claim_details?.bill_amount ?? data.claim_details?.claimed_amount ?? "").trim(),
  
      // ── Section C: Diagnosis ────────────────────────────────
      diagnoses:                 mapDiagnoses(diag),
      procedures:                mapProcedures(diag),
      preAuthObtained:           yesNo(hosp.pre_auth_obtained),
      preAuthNumber:             padChars(truncate(String(hosp.pre_auth_number ?? ""), 18), 18),
      preAuthMissingReason:      String(hosp.pre_auth_missing_reason ?? "").trim(),
      injuryHospitalization:     sh.injuryHospitalization,
      injurySelf:                sh.injurySelf,
      injuryRTA:                 sh.injuryRTA,
      injurySubstance:           sh.injurySubstance,
      substanceTestDone:         yesNo(diag.substance_test_conducted),
      medicoLegal:               sh.medicoLegal,
      reportedPolice:            yesNo(sh.reportedPolice),
      firNumber:                 sh.firNumber,
      firNotReportedReason:      sh.firNotReportedReason,
  
      // ── Section D: Checklist ────────────────────────────────
      // Starts all unchecked — hospital fills this manually
      claimDocChecklist:         Array(16).fill(false),
  
      // ── Section E: Non-network hospital ─────────────────────
      // Only relevant when hospitalNetwork === "non_network"
      nonNetAddress1:            padChars(truncate(upper(hosp.hospital_address ?? ""), 45), 45),
      nonNetAddress2:            padChars("", 50),
      nonNetCity:                String(hosp.hospital_city ?? "").trim(),
      nonNetState:               String(hosp.hospital_state ?? "").trim(),
      nonNetPin:                 padChars(truncate(digitsOnly(hosp.hospital_pin ?? ""), 6), 6),
      nonNetPhone:               padChars(truncate(digitsOnly(hosp.hospital_phone ?? ""), 10), 10),
      nonNetRegStateCode:        padChars(truncate(String(hosp.hospital_registration_number ?? ""), 14), 14),
      hospitalPan:               padChars(truncate(upper(hosp.hospital_pan ?? "").replace(/\s/g,""), 10), 10),
      inpatientBeds:             padChars(truncate(String(hosp.inpatient_beds ?? ""), 5), 5),
      facilityOT:                yesNo(hosp.has_ot),
      facilityICU:               yesNo(hosp.has_icu),
      otherFacilities:           String(hosp.other_facilities ?? "").trim(),
  
      // ── Section F: Declaration ──────────────────────────────
      declarationDate:           padChars(parseDateDDMMYYYY(data.document_metadata?.document_date), 8),
      declarationPlace:          upper(String(hosp.hospital_city ?? patient.city ?? "").trim(), 40),
    };
  }