/**
 * Hospital portal: preview, edit, and download Medi Assist Reimbursement Claim Form A.
 * @see ../utils/MediAssistFormA.js for HTML/PDF generation.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  downloadMediAssistFormA,
  generateMediAssistFormAHTML,
} from "../../utils/MediAssistFormA";
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

/** Split a single address string into two fixed-width lines. */
function splitAddressLines(raw, w1, w2) {
  if (raw == null || String(raw).trim() === "")
    return ["".padEnd(w1, " "), "".padEnd(w2, " ")];
  const t = String(raw)
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= w1) {
    return [t.padEnd(w1, " "), "".padEnd(w2, " ")];
  }
  return [t.slice(0, w1).padEnd(w1, " "), t.slice(w1, w1 + w2).padEnd(w2, " ")];
}

/** HH:MM or similar → 4 char boxes (HHMM). */
function padTimeChars(raw) {
  if (raw == null || raw === "") return "    ";
  const s = String(raw).replace(/\D/g, "");
  if (s.length >= 4) return s.slice(0, 4);
  if (s.length === 0) return "    ";
  return s.padStart(4, "0").slice(-4);
}

function yesNoString(v) {
  if (v == null) return "";
  if (v === true) return "yes";
  if (v === false) return "no";
  const t = String(v).toLowerCase().trim();
  if (t === "y" || t === "yes" || t === "true" || t === "1") return "yes";
  if (t === "n" || t === "no" || t === "false" || t === "0") return "no";
  return "";
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

  const [addr1, addr2] = splitAddressLines(
    patient.address || patient.full_address,
    40,
    35,
  );
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
  const cert = padChars(
    truncateChars(
      String(
        ins.certificate_number != null
          ? ins.certificate_number
          : ins.insurer_id_card || "",
      )
        .replace(/\s/g, "")
        .toUpperCase(),
      14,
    ),
    14,
  );
  const tpa = padChars(strUpper(tpaOrCompanyId(sd), 22), 22);
  const hospital = padChars(strUpper(hosp.hospital_name, 40), 40);
  const admission = padChars(parseDateToDDMMYYYY(hosp.admission_date), 8);
  const discharge = padChars(parseDateToDDMMYYYY(hosp.discharge_date), 8);
  const diagnosis = String(
    diag.primary_diagnosis != null && diag.primary_diagnosis !== ""
      ? diag.primary_diagnosis
      : (diag.procedure_names && diag.procedure_names[0]) || "",
  );

  const pre = padAmountToLength(claim.pre_hospitalization_amount, 8);
  const hospAmt = padAmountToLength(claim.bill_amount ?? claim.claimed_amount, 8);
  const post = padAmountToLength(claim.post_hospitalization_amount, 8);
  const healthChk = padAmountToLength(claim.health_checkup_cost, 8);
  const amb = padAmountToLength(claim.ambulance_charges, 8);
  const oth = padAmountToLength(claim.other_charges, 8);
  const tot = padAmountToLength(claim.bill_amount ?? claim.claimed_amount, 10);
  const preDays = padChars(truncateChars(String(claim.pre_hosp_period_days ?? ""), 3), 3);
  const postDays = padChars(
    truncateChars(String(claim.post_hosp_period_days ?? ""), 3),
    3,
  );

  const genderRaw = String(patient.gender ?? "").toLowerCase();
  let gender = "";
  if (genderRaw.includes("female") || genderRaw === "f") gender = "female";
  else if (genderRaw.includes("male") || genderRaw === "m") gender = "male";

  const ageYears = padChars(parseAgeYears(patient.age), 2);
  const ageMo = String(patient.age_months != null && patient.age_months !== "" ? String(patient.age_months) : "  ");
  const ageMonths = padChars(
    String(ageMo).replace(/\D/g, "").slice(0, 2) || "  ",
    2,
  );

  const primaryPhone = padChars(
    truncateChars(digitsOnly(patient.phone), 10),
    10,
  );
  const primaryEmail = String(patient.email ?? "").trim();
  const city = padChars(strUpper(patient.city, 18), 18);
  const state = padChars(strUpper(patient.state, 18), 18);
  const pin = padChars(truncateChars(digitsOnly(patient.pin_code), 6), 6);
  const dob = padChars(parseDateToDDMMYYYY(patient.date_of_birth), 8);
  const injuryDate = padChars(
    parseDateToDDMMYYYY(
      diag.date_of_injury_or_disease || hosp.date_of_injury,
    ),
    8,
  );

  const accNum = padChars(
    truncateChars(String(bank.account_number ?? "").replace(/\s/g, ""), 22),
    22,
  );
  const bankNm = strUpper(
    String(
      bank.bank_name ?? bank.bank_name_branch ?? bank.branch ?? "",
    ).trim(),
    40,
  );
  const bankName = padChars(bankNm, 40);
  const ifsc = padChars(
    truncateChars(String(bank.ifsc_code ?? "").toUpperCase(), 11),
    11,
  );
  const panStr = String(bank.pan ?? "").toUpperCase().replace(/\s/g, "");
  const pan = padChars(truncateChars(panStr, 10), 10);
  const chequeLine = String(
    bank.account_holder ||
      bank.cheque_dd_payable_to ||
      patient.name ||
      "",
  ).trim();

  const docDate = padChars(parseDateToDDMMYYYY(meta.document_date), 8);

  const polCompact = String(ins.policy_number ?? "")
    .replace(/\s/g, "")
    .toUpperCase();

  const [hA1, hA2] = patient.hosp_address_different
    ? splitAddressLines(
        patient.alternate_hosp_address || patient.address,
        40,
        35,
      )
    : [addr1, addr2];
  const hPhone = padChars(
    truncateChars(
      digitsOnly(
        patient.phone_secondary || patient.phone,
      ),
      10,
    ),
    10,
  );

  const rel = String(patient.relationship_to_insured || "")
    .replace(/\s+/g, " ")
    .trim();
  const occ = String(patient.occupation || "")
    .replace(/\s+/g, " ")
    .trim();
  const room = String(hosp.room_category || hosp.room_type || "")
    .replace(/\s+/g, " ")
    .trim();
  const hospCause = String(
    diag.hospitalization_cause || hosp.hospitalization_cause || "",
  )
    .replace(/\s+/g, " ")
    .trim();
  const sysMed = String(diag.system_of_medicine || "")
    .replace(/\s+/g, " ")
    .trim();
  const treatDoc = String(hosp.treating_doctor ?? "").trim();

  return {
    policyNumber: policy,
    certificateNumber: cert,
    tpaId: tpa,
    primaryName: name,
    primaryAddressRow1: addr1,
    primaryAddressRow2: addr2,
    primaryCity: city,
    primaryState: state,
    primaryPin: pin,
    primaryPhone,
    primaryEmail,
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
    healthCheckupCost: healthChk,
    ambulanceCharges: amb,
    otherChargesCode: "   ",
    otherChargesAmount: oth,
    totalClaim: tot,
    preHospPeriodDays: preDays,
    postHospPeriodDays: postDays,
    accountNumber: accNum,
    bankNameBranch: bankName,
    ifscCode: ifsc,
    chequeDetails: chequeLine,
    declarationDate: docDate,
    mobileIdRow: padChars(truncateChars(polCompact, 12), 12),
    mobilePolicy: padChars(truncateChars(polCompact, 16), 16),
    mobileNameTrunc: padChars(strUpper(patient.name, 20), 20),
    mobilePhone: primaryPhone,
    mobileEmail: padChars(
      (primaryEmail || "").slice(0, 20),
      20,
    ),
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
    injuryDate,
    dob,
    admissionTime: padTimeChars(hosp.admission_time),
    dischargeTime: padTimeChars(hosp.discharge_time),
    treatingDoctor: treatDoc,
    systemOfMedicine: sysMed,
    hospAddressRow1: hA1,
    hospAddressRow2: hA2,
    hospCity: city,
    hospState: state,
    hospPin: pin,
    hospPhone: hPhone,
    hospEmail: String(patient.email || "").trim(),
    pan,
    declarationPlace: strUpper(
      String(patient.city || patient.state || "").trim(),
      40,
    ),
    relationship: rel,
    occupation: occ,
    roomCategory: room,
    hospitalizationCause: hospCause,
    bCurrentlyOther: "",
    bCommencement: "".padEnd(8, " "),
    bIfYesCoName: "".padEnd(20, " "),
    bIfYesPolicy: "".padEnd(18, " "),
    bSumInsured: "".padEnd(12, " "),
    bHosp4Y: "",
    bHosp4YDate: "".padEnd(4, " "),
    bPreviouslyOther: "",
    bIfYesCoName2: "".padEnd(22, " "),
    domiciliary: "",
    hospitalDailyCash: "".padEnd(8, " "),
    surgicalCash: "".padEnd(8, " "),
    criticalIllnessBenefit: "".padEnd(8, " "),
    convalescence: "".padEnd(8, " "),
    prePostLumpSum: "".padEnd(8, " "),
    othersLump: "".padEnd(8, " "),
    injurySelf: false,
    injuryRta: false,
    injurySubstance: false,
    reportedPolice: false,
    firYes: false,
    firNo: false,
    docChecklist: Array(13).fill(false),
    billsRows: Array(10)
      .fill(null)
      .map(() => ({ billNo: "", date: "", issuedBy: "", towards: "", amount: "" })),
  };
}

/**
 * Claim download PDF is built from the same shape as `buildInitialForm` expects.
 * Audit flow (claim form uploaded) returns `structured_data`. Autofill flow
 * (hospital bill / prescription / policy only) leaves `structured_data` null
 * and puts data in `autofill_extracted` with `billing_details` instead of
 * `claim_details` — map that here so the form is not blank.
 */
function normalizeAutofillExtractedForForm(ext) {
  if (!ext || typeof ext !== "object") return {};
  const bill = ext.billing_details || {};
  const bank = ext.bank_details || {};
  const ad = ext.admission_details || {};
  return {
    patient_details: ext.patient_details || {},
    insurance_details: ext.insurance_details || {},
    hospital_details: ext.hospital_details || {},
    diagnosis_and_procedures: ext.diagnosis_and_procedures || {},
    claim_details: {
      pre_hospitalization_amount: bill.pre_hospitalization_expenses ?? null,
      bill_amount:
        bill.total_bill_amount ?? bill.hospitalization_expenses ?? null,
      post_hospitalization_amount: bill.post_hospitalization_expenses ?? null,
      health_checkup_cost: bill.health_checkup_cost ?? null,
      ambulance_charges: bill.ambulance_charges ?? null,
      other_charges: bill.other_charges ?? null,
      pre_hosp_period_days: ad.pre_hospitalization_period_days ?? null,
      post_hosp_period_days: ad.post_hospitalization_period_days ?? null,
    },
    bank_details: {
      ...bank,
      bank_name: bank.bank_name ?? bank.bank_name_branch ?? null,
    },
    document_metadata: ext.document_metadata || {},
  };
}

function getStructuredDataForInsuranceForm(analysisData) {
  if (!analysisData) return {};
  if (analysisData.structured_data) {
    return analysisData.structured_data;
  }
  if (analysisData.autofill_extracted) {
    return normalizeAutofillExtractedForForm(analysisData.autofill_extracted);
  }
  return {};
}

function applyAutofillResultToForm(base, ar) {
  if (!ar || typeof ar !== "object") return base;
  const out = { ...base };
  const a = ar.section_a_primary_insured || {};
  const b = ar.section_b_insurance_history || {};
  const c = ar.section_c_patient_details || {};
  const d = ar.section_d_hospitalization || {};
  const e = ar.section_e_claim_details || {};
  const g = ar.section_g_bank_account || {};
  const partB = ar.part_b_hospital_section || {};

  if (a.policy_number != null && String(a.policy_number).trim() !== "") {
    out.policyNumber = padChars(
      truncateChars(
        String(a.policy_number).replace(/\s/g, "").toUpperCase(),
        18,
      ),
      18,
    );
  }
  if (a.certificate_number != null && String(a.certificate_number).trim() !== "") {
    out.certificateNumber = padChars(
      truncateChars(
        String(a.certificate_number).replace(/\s/g, "").toUpperCase(),
        14,
      ),
      14,
    );
  }
  if (a.company_tpa_id) {
    out.tpaId = padChars(strUpper(String(a.company_tpa_id), 22), 22);
  }
  if (a.name) {
    out.primaryName = padChars(strUpper(a.name, 40), 40);
    out.hospitalizedName = out.primaryName;
  }
  if (a.address) {
    const [l1, l2] = splitAddressLines(a.address, 40, 35);
    out.primaryAddressRow1 = l1;
    out.primaryAddressRow2 = l2;
  }
  if (a.city) out.primaryCity = padChars(strUpper(a.city, 18), 18);
  if (a.state) out.primaryState = padChars(strUpper(a.state, 18), 18);
  if (a.pin_code) {
    out.primaryPin = padChars(truncateChars(digitsOnly(a.pin_code), 6), 6);
  }
  if (a.phone) {
    out.primaryPhone = padChars(truncateChars(digitsOnly(a.phone), 10), 10);
  }
  if (a.email) out.primaryEmail = String(a.email).trim();

  const cur = b.currently_other_insurance;
  if (cur != null) {
    out.bCurrentlyOther = yesNoString(cur) || out.bCurrentlyOther;
  }
  if (b.commencement_date) {
    out.bCommencement = padChars(
      parseDateToDDMMYYYY(b.commencement_date),
      8,
    );
  }
  if (b.company_name) {
    out.bIfYesCoName = padChars(strUpper(b.company_name, 20), 20);
  }
  if (b.policy_number) {
    out.bIfYesPolicy = padChars(
      truncateChars(
        String(b.policy_number).replace(/\s/g, "").toUpperCase(),
        18,
      ),
      18,
    );
  }
  if (b.sum_insured) {
    out.bSumInsured = padAmountToLength(b.sum_insured, 12);
  }
  if (b.hospitalized_last_4_years != null) {
    out.bHosp4Y = yesNoString(b.hospitalized_last_4_years);
  }
  if (b.diagnosis) {
    out.diagnosis = String(b.diagnosis);
  }
  if (b.previously_other_insurance != null) {
    out.bPreviouslyOther = yesNoString(b.previously_other_insurance);
  }

  if (c.name) {
    out.hospitalizedName = padChars(strUpper(c.name, 40), 40);
  }
  if (c.gender) {
    const gr = String(c.gender).toLowerCase();
    if (gr.includes("f")) out.gender = "female";
    else if (gr.includes("m")) out.gender = "male";
  }
  if (c.age_years != null) {
    out.ageYears = padChars(parseAgeYears(String(c.age_years)), 2);
  }
  if (c.age_months != null) {
    out.ageMonths = padChars(
      truncateChars(String(c.age_months).replace(/\D/g, ""), 2),
      2,
    );
  }
  if (c.date_of_birth) {
    out.dob = padChars(parseDateToDDMMYYYY(c.date_of_birth), 8);
  }
  if (c.relationship_to_insured) {
    out.relationship = String(c.relationship_to_insured).trim();
  }
  if (c.occupation) {
    out.occupation = String(c.occupation).trim();
  }
  if (c.address) {
    const [c1, c2] = splitAddressLines(c.address, 40, 35);
    out.hospAddressRow1 = c1;
    out.hospAddressRow2 = c2;
  }
  if (c.phone) {
    out.hospPhone = padChars(truncateChars(digitsOnly(c.phone), 10), 10);
  }
  if (c.email) {
    out.hospEmail = String(c.email).trim();
  }

  if (d.hospital_name) {
    out.hospitalName = padChars(strUpper(d.hospital_name, 40), 40);
  }
  if (d.room_category) {
    out.roomCategory = String(d.room_category).trim();
  }
  if (d.hospitalization_cause) {
    out.hospitalizationCause = String(d.hospitalization_cause).trim();
  }
  if (d.date_of_injury_or_disease) {
    out.injuryDate = padChars(
      parseDateToDDMMYYYY(d.date_of_injury_or_disease),
      8,
    );
  }
  if (d.admission_date) {
    out.admissionDate = padChars(parseDateToDDMMYYYY(d.admission_date), 8);
  }
  if (d.admission_time) {
    out.admissionTime = padTimeChars(d.admission_time);
  }
  if (d.discharge_date) {
    out.dischargeDate = padChars(parseDateToDDMMYYYY(d.discharge_date), 8);
  }
  if (d.discharge_time) {
    out.dischargeTime = padTimeChars(d.discharge_time);
  }
  if (d.system_of_medicine) {
    out.systemOfMedicine = String(d.system_of_medicine).trim();
  }
  if (d.injury_cause) {
    const inj = String(d.injury_cause).toLowerCase();
    if (inj.includes("self")) out.injurySelf = true;
    if (inj.includes("road") || inj.includes("rta") || inj.includes("traffic")) {
      out.injuryRta = true;
    }
    if (inj.includes("alcohol") || inj.includes("substance")) {
      out.injurySubstance = true;
    }
  }
  if (d.is_rta === true) out.injuryRta = true;
  if (d.reported_to_police === true) out.reportedPolice = true;
  if (d.fir_attached === true) {
    out.firYes = true;
  } else if (d.fir_attached === false) {
    out.firNo = true;
  }
  if (d.treating_doctor) {
    out.treatingDoctor = String(d.treating_doctor).trim();
  } else if (partB.treating_doctor) {
    out.treatingDoctor = String(partB.treating_doctor).trim();
  }

  if (e.pre_hospitalization_expenses != null) {
    out.claimPre = padAmountToLength(e.pre_hospitalization_expenses, 8);
  }
  if (e.hospitalization_expenses != null) {
    out.claimHospital = padAmountToLength(e.hospitalization_expenses, 8);
  }
  if (e.post_hospitalization_expenses != null) {
    out.claimPost = padAmountToLength(e.post_hospitalization_expenses, 8);
  }
  if (e.health_checkup_cost != null) {
    out.healthCheckupCost = padAmountToLength(e.health_checkup_cost, 8);
  }
  if (e.ambulance_charges != null) {
    out.ambulanceCharges = padAmountToLength(e.ambulance_charges, 8);
  }
  if (e.other_charges != null) {
    out.otherChargesAmount = padAmountToLength(e.other_charges, 8);
  }
  if (e.total != null) {
    out.totalClaim = padAmountToLength(e.total, 10);
  }
  if (e.pre_hospitalization_period_days != null) {
    out.preHospPeriodDays = padChars(
      truncateChars(String(e.pre_hospitalization_period_days), 3),
      3,
    );
  }
  if (e.post_hospitalization_period_days != null) {
    out.postHospPeriodDays = padChars(
      truncateChars(String(e.post_hospitalization_period_days), 3),
      3,
    );
  }
  if (e.domiciliary_hospitalization != null) {
    out.domiciliary = yesNoString(e.domiciliary_hospitalization);
  }
  if (e.hospital_daily_cash) {
    out.hospitalDailyCash = padAmountToLength(e.hospital_daily_cash, 8);
  }
  if (e.surgical_cash) {
    out.surgicalCash = padAmountToLength(e.surgical_cash, 8);
  }
  if (e.critical_illness_benefit) {
    out.criticalIllnessBenefit = padAmountToLength(
      e.critical_illness_benefit,
      8,
    );
  }
  if (e.convalescence) {
    out.convalescence = padAmountToLength(e.convalescence, 8);
  }
  if (e.pre_post_hospitalization_lump_sum != null) {
    out.prePostLumpSum = padAmountToLength(
      e.pre_post_hospitalization_lump_sum,
      8,
    );
  }
  if (e.others_lump != null) {
    out.othersLump = padAmountToLength(e.others_lump, 8);
  }
  if (Array.isArray(e.documents_checklist) && out.docChecklist) {
    e.documents_checklist.forEach((item, i) => {
      if (i < 13 && item === true) {
        out.docChecklist[i] = true;
      }
    });
  }

  if (g.pan) {
    out.pan = padChars(
      truncateChars(String(g.pan).toUpperCase().replace(/\s/g, ""), 10),
      10,
    );
  }
  if (g.account_number) {
    out.accountNumber = padChars(
      truncateChars(
        String(g.account_number).replace(/\s/g, ""),
        22,
      ),
      22,
    );
  }
  if (g.bank_name_branch) {
    out.bankNameBranch = padChars(
      strUpper(String(g.bank_name_branch), 40),
      40,
    );
  }
  if (g.cheque_dd_payable_to) {
    out.chequeDetails = String(g.cheque_dd_payable_to).trim();
  }
  if (g.ifsc_code) {
    out.ifscCode = padChars(
      truncateChars(String(g.ifsc_code).toUpperCase(), 11),
      11,
    );
  }

  if (partB.patient_name) {
    out.hospitalizedName = padChars(strUpper(partB.patient_name, 40), 40);
  }
  if (partB.primary_diagnosis) {
    out.diagnosis = String(partB.primary_diagnosis);
  }
  if (partB.total_claimed_amount) {
    out.claimHospital = padAmountToLength(partB.total_claimed_amount, 8);
  }

  const sF = ar.section_f_bills_enclosed;
  if (Array.isArray(sF) && out.billsRows) {
    sF.forEach((row, i) => {
      if (i >= 10 || !row) return;
      out.billsRows[i] = {
        billNo:
          row.bill_number != null ? String(row.bill_number) : out.billsRows[i].billNo,
        date:
          row.bill_date != null ? String(row.bill_date) : out.billsRows[i].date,
        issuedBy:
          row.issued_by != null
            ? String(row.issued_by)
            : out.billsRows[i].issuedBy,
        towards: row.towards != null ? String(row.towards) : out.billsRows[i].towards,
        amount: row.amount != null ? String(row.amount) : out.billsRows[i].amount,
      };
    });
  }

  return out;
}

function buildFormFromAnalysis(analysisData) {
  const sd = getStructuredDataForInsuranceForm(analysisData);
  let f = buildInitialForm(sd);
  if (analysisData?.autofill_result) {
    f = applyAutofillResultToForm(f, analysisData.autofill_result);
  }
  return f;
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

export default function MediAssistFormA({ navigation, route }) {
  const analysisData = route?.params?.analysisData;
  const { width } = useWindowDimensions();

  const formSeed = useMemo(
    () => buildFormFromAnalysis(analysisData),
    [analysisData],
  );

  const [form, setForm] = useState(() => formSeed);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [signatureImage, setSignatureImage] = useState(null);
  const formRef = useRef(null);
  const htmlPreview = useMemo(
    () => generateMediAssistFormAHTML(form, signatureImage),
    [form, signatureImage],
  );

  useEffect(() => {
    setForm(formSeed);
  }, [formSeed]);

  const setField = useCallback((key, v) => {
    setForm((prev) => ({ ...prev, [key]: v }));
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadMediAssistFormA(form, signatureImage);
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

                  <View style={{ flex: 1 }}>
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
                      }}
                    >
                      <View style={[stylesMobile.fileHeader, { justifyContent: "space-between" }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
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
                          <Text style={{ fontSize: 11, color: "#1976D2", fontWeight: "600" }}>
                            {previewMode ? "Edit Fields" : "Preview"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {previewMode ? (
                        /* ── PREVIEW: compact iframe matching the PDF ── */
                        <iframe
                          srcDoc={htmlPreview}
                          style={{
                            flex: 1,
                            width: "100%",
                            border: "none",
                            minHeight: 600,
                          }}
                          title="Insurance Claim Preview"
                        />
                      ) : (
                      <ScrollView>
                        <View ref={formRef}>
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
                              <Text style={stylesWeb.logoText}>
                                Medi Assist
                              </Text>
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
                                    onChange={(v) =>
                                      setField("primaryState", v)
                                    }
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
                                    onChange={(v) =>
                                      setField("primaryPhone", v)
                                    }
                                  />
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>Email ID:</Text>
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
                                    a) Currently covered by any other Mediclaim
                                    / Health Insurance:
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>Yes</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>No</Text>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    b) Date of commencement of first Insurance
                                    without break:
                                  </Text>

                                  {/* DATE BOXES */}
                                  <View style={stylesWeb.boxRow}>
                                    {[
                                      "D",
                                      "D",
                                      "M",
                                      "M",
                                      "Y",
                                      "Y",
                                      "Y",
                                      "Y",
                                    ].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                        maxLength={1}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* ROW 2 */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    c) If yes, company name:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 20 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    Policy No.
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 18 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>
                              </View>

                              {/* ROW 3 */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    Sum insured (Rs.)
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 12 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    d) Have you been hospitalized in the last
                                    four years since inception of the contract?
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>Yes</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>No</Text>

                                  <Text
                                    style={[
                                      stylesWeb.label,
                                      { marginLeft: 10 },
                                    ]}
                                  >
                                    Date:
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {["M", "M", "Y", "Y"].map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
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
                                    e) Previously covered by any other Mediclaim
                                    /Health insurance :
                                  </Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>Yes</Text>
                                  <View style={stylesWeb.checkbox} />
                                  <Text style={stylesWeb.smallText}>No</Text>
                                </View>
                              </View>

                              {/* ROW 5 */}
                              <View style={stylesWeb.inlineRow}>
                                <Text style={stylesWeb.label}>
                                  f) If yes, company name:
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 22 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
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
                                <Text style={stylesWeb.label}>a) Name:</Text>
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
                                    onChange={(v) => setField("ageYears", v)}
                                  />

                                  <Text style={stylesWeb.smallText}>
                                    Months
                                  </Text>
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
                                    <Text style={stylesWeb.smallText}>
                                      {item}
                                    </Text>
                                    <View style={stylesWeb.checkbox} />
                                  </React.Fragment>
                                ))}

                                <Text style={stylesWeb.smallText}>
                                  (Please Specify)
                                </Text>
                                <TextInput style={stylesWeb.longInputWide} />
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
                                    <View style={stylesWeb.checkbox} />
                                  </React.Fragment>
                                ))}

                                <Text style={stylesWeb.smallText}>
                                  (Please Specify)
                                </Text>
                                <TextInput style={stylesWeb.longInputWide} />
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
                                    <Text style={stylesWeb.smallText}>
                                      {item}
                                    </Text>
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
                                    d) Date of injury / Date Disease first
                                    detected /Date of Delivery:
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
                                    onChange={(v) =>
                                      setField("admissionDate", v)
                                    }
                                  />
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>f) Time:</Text>
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
                                  <Text style={stylesWeb.label}>h) Time:</Text>
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
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  v. Ambulance Charges Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  vi. Others (code):
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 3 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>Rs.</Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
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
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBoxs}
                                    />
                                  ))}
                                </View>
                              </View>

                              {/* PERIOD */}
                              <View style={stylesWeb.rowBetween}>
                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    vii. Pre-hospitalization period: days
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
                                </View>

                                <View style={stylesWeb.inlineRow}>
                                  <Text style={stylesWeb.label}>
                                    viii. Post-hospitalization period: days
                                  </Text>
                                  <View style={stylesWeb.boxRow}>
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <TextInput
                                        key={i}
                                        style={stylesWeb.squareBox}
                                      />
                                    ))}
                                  </View>
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
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  ii. Surgical Cash Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  iii. Critical Illness benefit Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  iv. Convalescence Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={stylesWeb.rowBetween}>
                                <Text style={stylesWeb.label}>
                                  v. Pre/Post hospitalization Lump sum benefit
                                  Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>

                                <Text style={stylesWeb.label}>
                                  vi. Others Rs.
                                </Text>
                                <View style={stylesWeb.boxRow}>
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <TextInput
                                      key={i}
                                      style={stylesWeb.squareBox}
                                    />
                                  ))}
                                </View>
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
                            <View style={stylesWeb.tableContainer}>
                              {/* HEADER ROW */}
                              {/* HEADER ROW 1 */}
                              <View style={stylesWeb.tableRowHeader}>
                                <Text
                                  style={[stylesWeb.tableCell, { width: 50 }]}
                                >
                                  Sl. No.
                                </Text>
                                <Text
                                  style={[stylesWeb.tableCell, { width: 80 }]}
                                >
                                  Bill No.
                                </Text>

                                <Text
                                  style={[stylesWeb.tableCell, { width: 120 }]}
                                >
                                  Date
                                </Text>

                                <Text
                                  style={[stylesWeb.tableCell, { width: 200 }]}
                                >
                                  Issued by
                                </Text>
                                <Text
                                  style={[stylesWeb.tableCell, { flex: 1 }]}
                                >
                                  Towards
                                </Text>

                                <Text
                                  style={[stylesWeb.tableCell, { width: 200 }]}
                                >
                                  Amount (Rs)
                                </Text>
                              </View>

                              {/* HEADER ROW 2 (GRID UNDER DATE & AMOUNT) */}

                              {/* ROWS */}
                              {Array.from({ length: 10 }).map((_, rowIndex) => (
                                <View style={stylesWeb.tableRow}>
                                  <Text
                                    style={[stylesWeb.tableCell, { width: 50 }]}
                                  >
                                    {rowIndex + 1}.
                                  </Text>

                                  <View
                                    style={[stylesWeb.tableCell, { width: 80 }]}
                                  />

                                  {/* DATE CELLS */}
                                  {Array.from({ length: 6 }).map((_, i) => (
                                    <View
                                      key={i}
                                      style={stylesWeb.tableCellSmall}
                                    />
                                  ))}

                                  <View
                                    style={[
                                      stylesWeb.tableCell,
                                      { width: 200 },
                                    ]}
                                  />

                                  <View
                                    style={[stylesWeb.tableCell, { flex: 1 }]}
                                  >
                                    {rowIndex === 0 && "Hospital main Bill"}
                                    {rowIndex === 1 &&
                                      "Pre-hospitalization Bills: Nos"}
                                    {rowIndex === 2 &&
                                      "Post-hospitalization Bills: Nos"}
                                    {rowIndex === 3 && "Pharmacy Bills"}
                                  </View>

                                  {/* AMOUNT CELLS */}
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <View
                                      key={i}
                                      style={stylesWeb.tableCellSmall}
                                    />
                                  ))}
                                </View>
                              ))}
                            </View>

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
                                    onChange={(v) => setField("ifscCode", v)}
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
                                I hereby declare that the information furnished
                                in the claim form is true & correct to the best
                                of my knowledge and belief. If I have made any
                                false or untrue statement, suppression or
                                concealment of any material fact with respect to
                                questions asked in relation to this claim, my
                                right to claim reimbursement shall be forfeited.
                                I also consent & authorize TPA / insurance
                                Company, to seek necessary medical information /
                                documents from any hospital / Medical
                                Practitioner who has attended on the person
                                against whom this claim is made. I hereby
                                declare that I have included all the bills /
                                receipts for the purpose of this claim & that I
                                will not be making any supplementary claim,
                                except the pre/post-hospitalization claim, if
                                any.
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
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>Yes</Text>
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>No</Text>
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              b) Date of commencement of first Insurance without
                              break:
                            </Text>

                            {/* DATE BOXES */}
                            <View style={stylesWeb.boxRow}>
                              {["D", "D", "M", "M", "Y", "Y", "Y", "Y"].map(
                                (_, i) => (
                                  <TextInput
                                    key={i}
                                    style={stylesWeb.squareBox}
                                    maxLength={1}
                                  />
                                ),
                              )}
                            </View>
                          </View>
                        </View>

                        {/* ROW 2 */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              c) If yes, company name:
                            </Text>
                            <View style={stylesWeb.boxRow}>
                              {Array.from({ length: 20 }).map((_, i) => (
                                <TextInput
                                  key={i}
                                  style={stylesWeb.squareBox}
                                />
                              ))}
                            </View>
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>Policy No.</Text>
                            <View style={stylesWeb.boxRow}>
                              {Array.from({ length: 18 }).map((_, i) => (
                                <TextInput
                                  key={i}
                                  style={stylesWeb.squareBox}
                                />
                              ))}
                            </View>
                          </View>
                        </View>

                        {/* ROW 3 */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              Sum insured (Rs.)
                            </Text>
                            <View style={stylesWeb.boxRow}>
                              {Array.from({ length: 12 }).map((_, i) => (
                                <TextInput
                                  key={i}
                                  style={stylesWeb.squareBox}
                                />
                              ))}
                            </View>
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              d) Have you been hospitalized in the last four
                              years since inception of the contract?
                            </Text>
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>Yes</Text>
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>No</Text>

                            <Text style={[stylesWeb.label, { marginLeft: 10 }]}>
                              Date:
                            </Text>
                            <View style={stylesWeb.boxRow}>
                              {["M", "M", "Y", "Y"].map((_, i) => (
                                <TextInput
                                  key={i}
                                  style={stylesWeb.squareBox}
                                />
                              ))}
                            </View>
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
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>Yes</Text>
                            <View style={stylesWeb.checkbox} />
                            <Text style={stylesWeb.smallText}>No</Text>
                          </View>
                        </View>

                        {/* ROW 5 */}
                        <View style={stylesWeb.inlineRow}>
                          <Text style={stylesWeb.label}>
                            f) If yes, company name:
                          </Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 22 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>
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
                          <TextInput style={stylesWeb.longInputWide} />
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
                          <TextInput style={stylesWeb.longInputWide} />
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
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            v. Ambulance Charges Rs.
                          </Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>

                          <Text style={stylesWeb.label}>
                            vi. Others (code):
                          </Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>

                          <Text style={stylesWeb.label}>Rs.</Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>
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
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 10 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBoxs} />
                            ))}
                          </View>
                        </View>

                        {/* PERIOD */}
                        <View style={stylesWeb.rowBetween}>
                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              vii. Pre-hospitalization period: days
                            </Text>
                            <View style={stylesWeb.boxRow}>
                              {Array.from({ length: 3 }).map((_, i) => (
                                <TextInput
                                  key={i}
                                  style={stylesWeb.squareBox}
                                />
                              ))}
                            </View>
                          </View>

                          <View style={stylesWeb.inlineRow}>
                            <Text style={stylesWeb.label}>
                              viii. Post-hospitalization period: days
                            </Text>
                            <View style={stylesWeb.boxRow}>
                              {Array.from({ length: 3 }).map((_, i) => (
                                <TextInput
                                  key={i}
                                  style={stylesWeb.squareBox}
                                />
                              ))}
                            </View>
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
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>

                          <Text style={stylesWeb.label}>
                            ii. Surgical Cash Rs.
                          </Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            iii. Critical Illness benefit Rs.
                          </Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>

                          <Text style={stylesWeb.label}>
                            iv. Convalescence Rs.
                          </Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>
                        </View>

                        <View style={stylesWeb.rowBetween}>
                          <Text style={stylesWeb.label}>
                            v. Pre/Post hospitalization Lump sum benefit Rs.
                          </Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>

                          <Text style={stylesWeb.label}>vi. Others Rs.</Text>
                          <View style={stylesWeb.boxRow}>
                            {Array.from({ length: 8 }).map((_, i) => (
                              <TextInput key={i} style={stylesWeb.squareBox} />
                            ))}
                          </View>
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
                      <View style={stylesWeb.tableContainer}>
                        {/* HEADER ROW */}
                        {/* HEADER ROW 1 */}
                        <View style={stylesWeb.tableRowHeader}>
                          <Text style={[stylesWeb.tableCell, { width: 50 }]}>
                            Sl. No.
                          </Text>
                          <Text style={[stylesWeb.tableCell, { width: 80 }]}>
                            Bill No.
                          </Text>

                          <Text style={[stylesWeb.tableCell, { width: 120 }]}>
                            Date
                          </Text>

                          <Text style={[stylesWeb.tableCell, { width: 200 }]}>
                            Issued by
                          </Text>
                          <Text style={[stylesWeb.tableCell, { flex: 1 }]}>
                            Towards
                          </Text>

                          <Text style={[stylesWeb.tableCell, { width: 200 }]}>
                            Amount (Rs)
                          </Text>
                        </View>

                        {/* HEADER ROW 2 (GRID UNDER DATE & AMOUNT) */}

                        {/* ROWS */}
                        {Array.from({ length: 10 }).map((_, rowIndex) => (
                          <View style={stylesWeb.tableRow}>
                            <Text style={[stylesWeb.tableCell, { width: 50 }]}>
                              {rowIndex + 1}.
                            </Text>

                            <View
                              style={[stylesWeb.tableCell, { width: 80 }]}
                            />

                            {/* DATE CELLS */}
                            {Array.from({ length: 6 }).map((_, i) => (
                              <View key={i} style={stylesWeb.tableCellSmall} />
                            ))}

                            <View
                              style={[stylesWeb.tableCell, { width: 200 }]}
                            />

                            <View style={[stylesWeb.tableCell, { flex: 1 }]}>
                              {rowIndex === 0 && "Hospital main Bill"}
                              {rowIndex === 1 &&
                                "Pre-hospitalization Bills: Nos"}
                              {rowIndex === 2 &&
                                "Post-hospitalization Bills: Nos"}
                              {rowIndex === 3 && "Pharmacy Bills"}
                            </View>

                            {/* AMOUNT CELLS */}
                            {Array.from({ length: 10 }).map((_, i) => (
                              <View key={i} style={stylesWeb.tableCellSmall} />
                            ))}
                          </View>
                        ))}
                      </View>

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
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    marginTop:"4%"
  },

  /* ── CARD TITLE ROW ── */
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
    marginTop: 10,
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
    marginLeft: 6,
  },

  sectionLine: {
    flex: 1,
    width: 10,
    backgroundColor: "#000",
    marginVertical: 2, // small breathing space
  },

  sectionTextWrap: {
    paddingVertical: 19, // 🔥 more gap from black bars
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionText: {
    color: "#000",
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
    padding: 4,
    fontSize: 11,
    justifyContent: "center",
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
});
