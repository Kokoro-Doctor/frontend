import { mapToFormA } from "./MediAssistMapper";

const DEFAULT_BILL_TOWARDS = [
  "Hospital Main Bill",
  "Pre-hospitalization Bills: Nos",
  "Post-hospitalization Bills: Nos",
  "Pharmacy Bills",
  "",
  "",
  "",
  "",
  "",
  "",
];

function buildBillRows(rows) {
  return DEFAULT_BILL_TOWARDS.map((towards, index) => {
    const row = rows?.[index] ?? {};
    return {
      billNo: row.billNo ?? "",
      date: row.date ?? "",
      issuedBy: row.issuedBy ?? "",
      towards: row.towards || towards,
      amount: row.amount ?? "",
    };
  });
}

function clean(value) {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function firstValue(...values) {
  for (const value of values) {
    const next = clean(value);
    if (next) return next;
  }
  return "";
}

function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function upper(value, maxLen) {
  const next = clean(value).toUpperCase();
  return maxLen ? next.slice(0, maxLen) : next;
}

function padChars(value, length) {
  return String(value ?? "").padEnd(length, " ").slice(0, length);
}

function compactUpper(value, length) {
  return padChars(upper(value).replace(/\s/g, "").slice(0, length), length);
}

function parseDateDDMMYYYY(value) {
  const raw = clean(value);
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}${iso[2]}${iso[1]}`;
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (dmy) {
    const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
    return `${dmy[1].padStart(2, "0")}${dmy[2].padStart(2, "0")}${year}`;
  }
  const digits = digitsOnly(raw);
  return digits.length >= 8 ? digits.slice(0, 8) : "";
}

function padDate(value, length = 8) {
  return padChars(parseDateDDMMYYYY(value), length);
}

function padAmount(value, length) {
  const digits = digitsOnly(value);
  if (!digits) return "".padEnd(length, " ");
  return digits.slice(-length).padStart(length, " ");
}

function yesNo(value) {
  if (value == null || value === "") return "";
  if (value === true) return "yes";
  if (value === false) return "no";
  const text = clean(value).toLowerCase();
  if (["yes", "y", "true", "1"].includes(text)) return "yes";
  if (["no", "n", "false", "0"].includes(text)) return "no";
  return text.includes("yes") ? "yes" : text.includes("no") ? "no" : "";
}

function splitAddress(value, widthA, widthB) {
  const text = clean(value);
  if (!text) return ["".padEnd(widthA, " "), "".padEnd(widthB, " ")];
  return [
    padChars(text.slice(0, widthA), widthA),
    padChars(text.slice(widthA, widthA + widthB), widthB),
  ];
}

function resolveData(analysisData) {
  const structured = analysisData?.structured_data || {};
  const extracted = analysisData?.autofill_extracted || {};
  const extra = analysisData?.extracted_data || {};
  const billing = extracted.billing_details || {};
  const admission = extracted.admission_details || {};

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
      admission_date:
        structured.hospital_details?.admission_date ??
        extracted.hospital_details?.admission_date ??
        admission.admission_date,
      discharge_date:
        structured.hospital_details?.discharge_date ??
        extracted.hospital_details?.discharge_date ??
        admission.discharge_date,
    },
    diagnosis_and_procedures: {
      ...(extra.diagnosis_and_procedures || {}),
      ...(extracted.diagnosis_and_procedures || {}),
      ...(structured.diagnosis_and_procedures || {}),
    },
    claim_details: {
      ...(extra.claim_details || {}),
      pre_hospitalization_amount:
        billing.pre_hospitalization_expenses ??
        extra.claim_details?.pre_hospitalization_amount,
      bill_amount:
        billing.total_bill_amount ??
        billing.hospitalization_expenses ??
        extra.claim_details?.bill_amount,
      post_hospitalization_amount:
        billing.post_hospitalization_expenses ??
        extra.claim_details?.post_hospitalization_amount,
      health_checkup_cost:
        billing.health_checkup_cost ?? extra.claim_details?.health_checkup_cost,
      ambulance_charges:
        billing.ambulance_charges ?? extra.claim_details?.ambulance_charges,
      other_charges: billing.other_charges ?? extra.claim_details?.other_charges,
      pre_hosp_period_days:
        admission.pre_hospitalization_period_days ??
        extra.claim_details?.pre_hosp_period_days,
      post_hosp_period_days:
        admission.post_hospitalization_period_days ??
        extra.claim_details?.post_hosp_period_days,
      ...(extracted.claim_details || {}),
      ...(structured.claim_details || {}),
    },
    bank_details: {
      ...(extra.bank_details || {}),
      ...(extracted.bank_details || {}),
      ...(structured.bank_details || {}),
    },
    document_metadata: {
      ...(extra.document_metadata || {}),
      ...(extracted.document_metadata || {}),
      ...(structured.document_metadata || {}),
    },
  };
}

function applyStarHealthExtractedFallbacks(form, analysisData) {
  const data = resolveData(analysisData);
  const patient = data.patient_details || {};
  const insurance = data.insurance_details || {};
  const hospital = data.hospital_details || {};
  const diagnosis = data.diagnosis_and_procedures || {};
  const claim = data.claim_details || data.billing_details || {};
  const bank = data.bank_details || {};
  const meta = data.document_metadata || {};
  const ar = analysisData?.autofill_result || {};
  const sectionA = ar.section_a_primary_insured || ar.section_a || {};
  const sectionB = ar.section_b_insurance_history || ar.section_b || {};
  const sectionC = ar.section_c_patient_details || ar.section_c || {};
  const sectionD = ar.section_d_hospitalization || ar.section_d || {};
  const sectionE = ar.section_e_claim_details || ar.section_e || {};
  const sectionG = ar.section_g_bank_account || ar.section_g || {};

  const next = { ...form };
  const setIfPresent = (key, value, formatter = (v) => v) => {
    const raw = firstValue(value);
    if (raw) next[key] = formatter(raw);
  };

  setIfPresent(
    "policyNumber",
    firstValue(
      sectionA.policy_number,
      insurance.policy_number,
      insurance.policy_no,
      data.policy_number,
    ),
    (v) => compactUpper(v, 18),
  );
  setIfPresent(
    "certificateNumber",
    firstValue(
      sectionA.certificate_number,
      insurance.certificate_number,
      insurance.insurer_id_card,
      insurance.member_id,
    ),
    (v) => compactUpper(v, 14),
  );
  setIfPresent(
    "tpaId",
    firstValue(
      sectionA.company_tpa_id,
      insurance.tpa_id,
      insurance.tpa_name,
      insurance.insurance_company,
    ),
    (v) => padChars(upper(v, 22), 22),
  );
  setIfPresent("primaryName", firstValue(sectionA.name, patient.name), (v) =>
    padChars(upper(v, 40), 40),
  );
  const primaryAddress = firstValue(
    sectionA.address,
    patient.address,
    patient.full_address,
  );
  if (primaryAddress) {
    const [lineA, lineB] = splitAddress(primaryAddress, 40, 35);
    next.primaryAddressRow1 = lineA;
    next.primaryAddressRow2 = lineB;
  }
  setIfPresent("primaryCity", firstValue(sectionA.city, patient.city), (v) =>
    padChars(upper(v, 18), 18),
  );
  setIfPresent("primaryState", firstValue(sectionA.state, patient.state), (v) =>
    padChars(upper(v, 18), 18),
  );
  setIfPresent("primaryPin", firstValue(sectionA.pin_code, patient.pin_code), (v) =>
    padChars(digitsOnly(v).slice(0, 6), 6),
  );
  setIfPresent("primaryPhone", firstValue(sectionA.phone, patient.phone), (v) =>
    padChars(digitsOnly(v).slice(0, 10), 10),
  );
  setIfPresent("primaryEmail", firstValue(sectionA.email, patient.email));

  setIfPresent(
    "bCurrentlyOther",
    firstValue(sectionB.currently_other_insurance, insurance.other_insurance),
    yesNo,
  );
  setIfPresent(
    "insuranceFirstCommencementDate",
    firstValue(sectionB.commencement_date, insurance.first_policy_start_date),
    padDate,
  );
  setIfPresent(
    "insuranceCompanyName",
    firstValue(sectionB.company_name, insurance.insurance_company),
    (v) => padChars(upper(v, 20), 20),
  );
  setIfPresent(
    "insurancePolicyNo",
    firstValue(sectionB.policy_number, insurance.policy_number),
    (v) => compactUpper(v, 18),
  );
  setIfPresent(
    "insuranceSumInsured",
    firstValue(sectionB.sum_insured, insurance.sum_insured),
    (v) => padAmount(v, 12),
  );
  setIfPresent("bHosp4Y", sectionB.hospitalized_last_four_years, yesNo);
  setIfPresent("hospitalizationHistoryDate", sectionB.hospitalization_date, (v) =>
    padChars(parseDateDDMMYYYY(v).slice(4, 8), 4),
  );
  setIfPresent("bPreviouslyOther", sectionB.previously_covered, yesNo);
  setIfPresent(
    "previousMediclaimCompanyName",
    sectionB.previous_company_name,
    (v) => padChars(upper(v, 22), 22),
  );

  setIfPresent(
    "diagnosis",
    firstValue(
      sectionB.diagnosis,
      sectionD.diagnosis,
      diagnosis.primary_diagnosis,
      diagnosis.procedure_names?.[0],
    ),
  );
  setIfPresent(
    "hospitalizedName",
    firstValue(sectionC.name, patient.name),
    (v) => padChars(upper(v, 40), 40),
  );
  setIfPresent("gender", firstValue(sectionC.gender, patient.gender), (v) => {
    const text = clean(v).toLowerCase();
    return text.includes("female") || text === "f" ? "female" : text.includes("male") || text === "m" ? "male" : clean(v);
  });
  setIfPresent("ageYears", firstValue(sectionC.age_years, patient.age), (v) =>
    padChars(digitsOnly(v).slice(0, 2), 2),
  );
  setIfPresent("ageMonths", firstValue(sectionC.age_months, patient.age_months), (v) =>
    padChars(digitsOnly(v).slice(0, 2), 2),
  );
  setIfPresent("dob", firstValue(sectionC.date_of_birth, patient.date_of_birth), padDate);
  setIfPresent("relationship", firstValue(sectionC.relationship, patient.relationship_to_insured));
  setIfPresent("relationshipSpecify", firstValue(sectionC.relationship, patient.relationship_to_insured));
  setIfPresent("occupation", firstValue(sectionC.occupation, patient.occupation));
  setIfPresent("occupationSpecify", firstValue(sectionC.occupation, patient.occupation));

  setIfPresent(
    "hospitalName",
    firstValue(sectionD.hospital_name, hospital.hospital_name),
    (v) => padChars(upper(v, 40), 40),
  );
  setIfPresent("roomCategory", firstValue(sectionD.room_category, hospital.room_category, hospital.room_type));
  setIfPresent("hospitalizationCause", firstValue(sectionD.hospitalization_cause, diagnosis.hospitalization_cause));
  setIfPresent("injuryDate", firstValue(sectionD.injury_date, diagnosis.date_of_injury_or_disease), padDate);
  setIfPresent("admissionDate", firstValue(sectionD.admission_date, hospital.admission_date), padDate);
  setIfPresent("admissionTime", firstValue(sectionD.admission_time, hospital.admission_time), (v) =>
    padChars(digitsOnly(v).slice(0, 4), 4),
  );
  setIfPresent("dischargeDate", firstValue(sectionD.discharge_date, hospital.discharge_date), padDate);
  setIfPresent("dischargeTime", firstValue(sectionD.discharge_time, hospital.discharge_time), (v) =>
    padChars(digitsOnly(v).slice(0, 4), 4),
  );
  setIfPresent("treatingDoctor", firstValue(sectionD.treating_doctor, hospital.treating_doctor));
  setIfPresent("systemOfMedicine", firstValue(sectionD.system_of_medicine, diagnosis.system_of_medicine));
  setIfPresent("medicoLegal", firstValue(sectionD.medico_legal, diagnosis.is_medico_legal), yesNo);
  setIfPresent("domiciliary", firstValue(sectionD.domiciliary_hospitalization, claim.domiciliary), yesNo);

  setIfPresent("claimPre", firstValue(sectionE.pre_hospitalization_expenses, claim.pre_hospitalization_amount, claim.pre_hospitalization_expenses), (v) => padAmount(v, 8));
  setIfPresent("claimHospital", firstValue(sectionE.hospitalization_expenses, claim.bill_amount, claim.hospitalization_expenses, claim.total_bill_amount), (v) => padAmount(v, 8));
  setIfPresent("claimPost", firstValue(sectionE.post_hospitalization_expenses, claim.post_hospitalization_amount, claim.post_hospitalization_expenses), (v) => padAmount(v, 8));
  setIfPresent("claimHealthCheckup", firstValue(sectionE.health_checkup_cost, claim.health_checkup_cost), (v) => padAmount(v, 8));
  setIfPresent("claimAmbulance", firstValue(sectionE.ambulance_charges, claim.ambulance_charges), (v) => padAmount(v, 8));
  setIfPresent("claimOtherAmount", firstValue(sectionE.other_charges, claim.other_charges), (v) => padAmount(v, 8));
  setIfPresent("claimTotal", firstValue(sectionE.total_claim, claim.claimed_amount, claim.bill_amount, claim.total_bill_amount), (v) => padAmount(v, 10));
  setIfPresent("claimPreHospitalDays", firstValue(sectionE.pre_hospitalization_days, claim.pre_hosp_period_days), (v) => padChars(digitsOnly(v).slice(0, 3), 3));
  setIfPresent("claimPostHospitalDays", firstValue(sectionE.post_hospitalization_days, claim.post_hosp_period_days), (v) => padChars(digitsOnly(v).slice(0, 3), 3));

  setIfPresent("pan", firstValue(sectionG.pan, bank.pan), (v) => compactUpper(v, 10));
  setIfPresent("accountNumber", firstValue(sectionG.account_number, bank.account_number), (v) => padChars(clean(v).replace(/\s/g, "").slice(0, 22), 22));
  setIfPresent("bankNameBranch", firstValue(sectionG.bank_name_branch, sectionG.bank_name, bank.bank_name_branch, bank.bank_name, bank.branch), (v) => padChars(upper(v, 40), 40));
  setIfPresent("ifscCode", firstValue(sectionG.ifsc_code, bank.ifsc_code), (v) => compactUpper(v, 11));
  setIfPresent("chequeDetails", firstValue(sectionG.cheque_dd_payable_to, bank.cheque_dd_payable_to, bank.account_holder, patient.name));
  setIfPresent("declarationDate", firstValue(meta.document_date, data.document_date), padDate);
  setIfPresent("declarationPlace", firstValue(patient.city, hospital.hospital_city, patient.state), (v) => upper(v, 40));

  return next;
}

export function mapToStarHealthFormA(analysisData) {
  const base = mapToFormA(analysisData);

  const mapped = {
    policyNumber: base.policyNumber ?? "",
    certificateNumber: base.certificateNumber ?? "",
    tpaId: base.tpaId ?? "",
    primaryName: base.primaryName ?? "",
    primaryAddressRow1: base.primaryAddressRow1 ?? "",
    primaryAddressRow2: base.primaryAddressRow2 ?? "",
    primaryCity: base.primaryCity ?? "",
    primaryState: base.primaryState ?? "",
    primaryPin: base.primaryPin ?? "",
    primaryPhone: base.primaryPhone ?? "",
    primaryEmail: base.primaryEmail ?? "",

    insuranceFirstCommencementDate: base.bCommencement ?? "",
    insuranceCompanyName: base.bIfYesCoName ?? "",
    insurancePolicyNo: base.bIfYesPolicy ?? "",
    insuranceSumInsured: base.bSumInsured ?? "",
    hospitalizationHistoryDate: base.bHosp4YDate ?? "",
    previousMediclaimCompanyName: base.bIfYesCoName2 ?? "",
    diagnosis: base.diagnosis ?? "",

    hospitalizedName: base.hospitalizedName ?? "",
    gender: base.gender ?? "",
    ageYears: base.ageYears ?? "",
    ageMonths: base.ageMonths ?? "",
    dob: base.dob ?? "",
    relationshipSpecify: base.relationship ?? "",
    occupationSpecify: base.occupation ?? "",
    hospAddressRow1: base.hospAddressRow1 ?? "",
    hospAddressRow2: base.hospAddressRow2 ?? "",
    hospCity: base.hospCity ?? "",
    hospState: base.hospState ?? "",
    hospPin: base.hospPin ?? "",
    hospPhone: base.hospPhone ?? "",
    hospEmail: base.hospEmail ?? "",

    hospitalName: base.hospitalName ?? "",
    hospitalId: "",
    starHospitalId: "",
    hospitalType: "",
    injuryDate: base.injuryDate ?? "",
    admissionDate: base.admissionDate ?? "",
    admissionTime: base.admissionTime ?? "",
    dischargeDate: base.dischargeDate ?? "",
    dischargeTime: base.dischargeTime ?? "",
    treatingDoctor: base.treatingDoctor ?? "",
    doctorQualification: "",
    registrationNo: "",
    hospitalPhone: base.hospPhone ?? "",
    hospitalEmail: base.hospEmail ?? "",
    systemOfMedicine: base.systemOfMedicine ?? "",

    patientName: base.hospitalizedName ?? base.primaryName ?? "",
    ipRegistrationNumber: "",
    admissionType: "",
    maternityDeliveryDate: "",
    deliveryDateDay: "",
    deliveryDateMonth: "",
    deliveryDateYear: "",
    gravidaStatus: "",
    dischargeStatus: "",

    primaryDiagnosisCode: "",
    primaryDiagnosisDesc: base.diagnosis ?? "",
    additionalDiagnosisCode: "",
    additionalDiagnosisDesc: "",
    comorbidity1Code: "",
    comorbidity1Desc: "",
    comorbiditiesDesc: "",
    comorbidity2Code: "",
    comorbidity2Desc: "",
    comorbiditiesDesc2: "",
    procedure1Code: "",
    procedure1Desc: "",
    procedure2Code: "",
    procedure2Desc: "",
    procedure3Code: "",
    procedure3Desc: "",
    procedureDetails: "",
    durationIllness: "",
    pastMedicalHistory: "",

    pedComplication: "",
    pedDetails: "",
    preAuth: "",
    preAuthorizationObtained: "",
    preAuthorizationNumber: "",
    preAuthReason: "",
    preAuthorizationReason: "",

    hospitalizationInjury: "",
    injuryCause: "",
    selfInflicted: !!base.injurySelf,
    rta: !!base.injuryRta,
    substanceAbuse: !!base.injurySubstance,
    testConducted: "",
    substanceAbuseTest: "",

    claimPre: base.claimPre ?? "",
    claimHospital: base.claimHospital ?? "",
    claimPost: base.claimPost ?? "",
    claimHealthCheckup: base.healthCheckupCost ?? "",
    claimAmbulance: base.ambulanceCharges ?? "",
    claimOtherCode: base.otherChargesCode ?? "",
    claimOtherAmount: base.otherChargesAmount ?? "",
    claimTotal: base.totalClaim ?? "",
    claimPreHospitalDays: base.preHospPeriodDays ?? "",
    claimPostHospitalDays: base.postHospPeriodDays ?? "",
    claimHospitalDailyCash: base.hospitalDailyCash ?? "",
    claimSurgicalCash: base.surgicalCash ?? "",
    claimCriticalIllness: base.criticalIllnessBenefit ?? "",
    claimConvalescence: base.convalescence ?? "",
    claimPrePostBenefit: base.prePostLumpSum ?? "",
    claimOtherBenefit: base.othersLump ?? "",
    billRows: buildBillRows(base.billsRows),

    pan: base.pan ?? "",
    accountNumber: base.accountNumber ?? "",
    bankNameBranch: base.bankNameBranch ?? "",
    ifscCode: base.ifscCode ?? "",
    chequeDetails: base.chequeDetails ?? "",
    declarationDate: base.declarationDate ?? "",
    declarationPlace: base.declarationPlace ?? "",

    bCurrentlyOther: base.bCurrentlyOther ?? "",
    bHosp4Y: base.bHosp4Y ?? "",
    bPreviouslyOther: base.bPreviouslyOther ?? "",
    relationship: base.relationship ?? "",
    occupation: base.occupation ?? "",
    roomCategory: base.roomCategory ?? "",
    hospitalizationCause: base.hospitalizationCause ?? "",
    injurySelf: !!base.injurySelf,
    injuryRta: !!base.injuryRta,
    injurySubstance: !!base.injurySubstance,
    medicoLegal: base.medicoLegal ?? "",
    reportedPolice: !!base.reportedPolice,
    reportedToPolice: base.reportedPolice ? "yes" : "",
    firNumber: "",
    policeReason: "",
    firYes: !!base.firYes,
    firNo: !!base.firNo,
    domiciliary: base.domiciliary ?? "",
    docChecklist: Array.isArray(base.docChecklist)
      ? base.docChecklist.slice(0, 13)
      : Array(13).fill(false),

    claimFormSigned: false,
    preAuthorizationRequest: false,
    preAuthorizationApproval: false,
    photoIdCard: false,
    dischargeSummary: false,
    operationTheatreNotes: false,
    hospitalMainBill: false,
    hospitalBreakupBill: false,
    investigationReports: false,
    ctMriReports: false,
    doctorReferenceSlip: false,
    ecg: false,
    pharmacyBills: false,
    mlcPoliceFir: false,
    deathSummary: false,
    otherDocuments: false,
    anyOtherDocument: false,

    hospitalAddress: "",
    hospitalCity: "",
    hospitalState: "",
    hospitalPinCode: "",
    hospitalRegistrationNo: "",
    hospitalPan: "",
    inpatientBeds: "",
    facilityOT: "",
    facilityICU: "",
    facilityOthers: "",

    hospitalAuthorityName: "",
    hospitalAuthoritySignature: "",
    hospitalDateDay: digitsOnly(base.declarationDate ?? "").slice(0, 2),
    hospitalDateMonth: digitsOnly(base.declarationDate ?? "").slice(2, 4),
    hospitalDateYear: digitsOnly(base.declarationDate ?? "").slice(4, 8),
  };

  return applyStarHealthExtractedFallbacks(mapped, analysisData);
}


export function mapToStarHealthFormB(analysisData) {
  const base = mapToFormA(analysisData);

  const mapped = {
    policyNumber: base.policyNumber ?? "",
    certificateNumber: base.certificateNumber ?? "",
    tpaId: base.tpaId ?? "",
    primaryName: base.primaryName ?? "",
    primaryAddressRow1: base.primaryAddressRow1 ?? "",
    primaryAddressRow2: base.primaryAddressRow2 ?? "",
    primaryCity: base.primaryCity ?? "",
    primaryState: base.primaryState ?? "",
    primaryPin: base.primaryPin ?? "",
    primaryPhone: base.primaryPhone ?? "",
    primaryEmail: base.primaryEmail ?? "",

    insuranceFirstCommencementDate: base.bCommencement ?? "",
    insuranceCompanyName: base.bIfYesCoName ?? "",
    insurancePolicyNo: base.bIfYesPolicy ?? "",
    insuranceSumInsured: base.bSumInsured ?? "",
    hospitalizationHistoryDate: base.bHosp4YDate ?? "",
    previousMediclaimCompanyName: base.bIfYesCoName2 ?? "",
    diagnosis: base.diagnosis ?? "",

    hospitalizedName: base.hospitalizedName ?? "",
    gender: base.gender ?? "",
    ageYears: base.ageYears ?? "",
    ageMonths: base.ageMonths ?? "",
    dob: base.dob ?? "",
    relationshipSpecify: base.relationship ?? "",
    occupationSpecify: base.occupation ?? "",
    hospAddressRow1: base.hospAddressRow1 ?? "",
    hospAddressRow2: base.hospAddressRow2 ?? "",
    hospCity: base.hospCity ?? "",
    hospState: base.hospState ?? "",
    hospPin: base.hospPin ?? "",
    hospPhone: base.hospPhone ?? "",
    hospEmail: base.hospEmail ?? "",

    hospitalName: base.hospitalName ?? "",
    hospitalId: "",
    starHospitalId: "",
    hospitalType: "",
    injuryDate: base.injuryDate ?? "",
    admissionDate: base.admissionDate ?? "",
    admissionTime: base.admissionTime ?? "",
    dischargeDate: base.dischargeDate ?? "",
    dischargeTime: base.dischargeTime ?? "",
    treatingDoctor: base.treatingDoctor ?? "",
    doctorQualification: "",
    registrationNo: "",
    hospitalPhone: base.hospPhone ?? "",
    hospitalEmail: base.hospEmail ?? "",
    systemOfMedicine: base.systemOfMedicine ?? "",

    patientName: base.hospitalizedName ?? base.primaryName ?? "",
    ipRegistrationNumber: "",
    admissionType: "",
    maternityDeliveryDate: "",
    deliveryDateDay: "",
    deliveryDateMonth: "",
    deliveryDateYear: "",
    gravidaStatus: "",
    dischargeStatus: "",

    primaryDiagnosisCode: "",
    primaryDiagnosisDesc: base.diagnosis ?? "",
    additionalDiagnosisCode: "",
    additionalDiagnosisDesc: "",
    comorbidity1Code: "",
    comorbidity1Desc: "",
    comorbiditiesDesc: "",
    comorbidity2Code: "",
    comorbidity2Desc: "",
    comorbiditiesDesc2: "",
    procedure1Code: "",
    procedure1Desc: "",
    procedure2Code: "",
    procedure2Desc: "",
    procedure3Code: "",
    procedure3Desc: "",
    procedureDetails: "",
    durationIllness: "",
    pastMedicalHistory: "",

    pedComplication: "",
    pedDetails: "",
    preAuth: "",
    preAuthorizationObtained: "",
    preAuthorizationNumber: "",
    preAuthReason: "",
    preAuthorizationReason: "",

    hospitalizationInjury: "",
    injuryCause: "",
    selfInflicted: !!base.injurySelf,
    rta: !!base.injuryRta,
    substanceAbuse: !!base.injurySubstance,
    testConducted: "",
    substanceAbuseTest: "",

    claimPre: base.claimPre ?? "",
    claimHospital: base.claimHospital ?? "",
    claimPost: base.claimPost ?? "",
    claimHealthCheckup: base.healthCheckupCost ?? "",
    claimAmbulance: base.ambulanceCharges ?? "",
    claimOtherCode: base.otherChargesCode ?? "",
    claimOtherAmount: base.otherChargesAmount ?? "",
    claimTotal: base.totalClaim ?? "",
    claimPreHospitalDays: base.preHospPeriodDays ?? "",
    claimPostHospitalDays: base.postHospPeriodDays ?? "",
    claimHospitalDailyCash: base.hospitalDailyCash ?? "",
    claimSurgicalCash: base.surgicalCash ?? "",
    claimCriticalIllness: base.criticalIllnessBenefit ?? "",
    claimConvalescence: base.convalescence ?? "",
    claimPrePostBenefit: base.prePostLumpSum ?? "",
    claimOtherBenefit: base.othersLump ?? "",
    billRows: buildBillRows(base.billsRows),

    pan: base.pan ?? "",
    accountNumber: base.accountNumber ?? "",
    bankNameBranch: base.bankNameBranch ?? "",
    ifscCode: base.ifscCode ?? "",
    chequeDetails: base.chequeDetails ?? "",
    declarationDate: base.declarationDate ?? "",
    declarationPlace: base.declarationPlace ?? "",

    bCurrentlyOther: base.bCurrentlyOther ?? "",
    bHosp4Y: base.bHosp4Y ?? "",
    bPreviouslyOther: base.bPreviouslyOther ?? "",
    relationship: base.relationship ?? "",
    occupation: base.occupation ?? "",
    roomCategory: base.roomCategory ?? "",
    hospitalizationCause: base.hospitalizationCause ?? "",
    injurySelf: !!base.injurySelf,
    injuryRta: !!base.injuryRta,
    injurySubstance: !!base.injurySubstance,
    medicoLegal: base.medicoLegal ?? "",
    reportedPolice: !!base.reportedPolice,
    reportedToPolice: base.reportedPolice ? "yes" : "",
    firNumber: "",
    policeReason: "",
    firYes: !!base.firYes,
    firNo: !!base.firNo,
    domiciliary: base.domiciliary ?? "",
    docChecklist: Array.isArray(base.docChecklist)
      ? base.docChecklist.slice(0, 13)
      : Array(13).fill(false),

    claimFormSigned: false,
    preAuthorizationRequest: false,
    preAuthorizationApproval: false,
    photoIdCard: false,
    dischargeSummary: false,
    operationTheatreNotes: false,
    hospitalMainBill: false,
    hospitalBreakupBill: false,
    investigationReports: false,
    ctMriReports: false,
    doctorReferenceSlip: false,
    ecg: false,
    pharmacyBills: false,
    mlcPoliceFir: false,
    deathSummary: false,
    otherDocuments: false,
    anyOtherDocument: false,

    hospitalAddress: "",
    hospitalCity: "",
    hospitalState: "",
    hospitalPinCode: "",
    hospitalRegistrationNo: "",
    hospitalPan: "",
    inpatientBeds: "",
    facilityOT: "",
    facilityICU: "",
    facilityOthers: "",

    hospitalAuthorityName: "",
    hospitalAuthoritySignature: "",
    hospitalDateDay: digitsOnly(base.declarationDate ?? "").slice(0, 2),
    hospitalDateMonth: digitsOnly(base.declarationDate ?? "").slice(2, 4),
    hospitalDateYear: digitsOnly(base.declarationDate ?? "").slice(4, 8),
  };

  return applyStarHealthExtractedFallbacks(mapped, analysisData);
}
