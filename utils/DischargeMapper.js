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

function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstFilled(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value;
    const text = cleanText(value);
    if (text) return text;
  }
  return "";
}

function toMultilineText(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanText(item))
      .filter(Boolean)
      .join("\n");
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) => cleanText(item))
      .filter(Boolean)
      .join("\n");
  }
  return String(value ?? "").trim();
}

function firstMultiline(...values) {
  for (const value of values) {
    const text = toMultilineText(value);
    if (text) return text;
  }
  return "";
}

function firstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value;
  }
  return [];
}

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  const text = cleanText(value).toLowerCase();
  if (!text) return fallback;
  if (["yes", "true", "1", "y", "checked"].includes(text)) return true;
  if (["no", "false", "0", "n", "unchecked"].includes(text)) return false;
  return fallback;
}

function mapDischargeCondition(value) {
  const text = cleanText(value).toLowerCase();
  if (!text) return "";
  if (text.includes("improv")) return "Improved";
  if (text.includes("refer") || text.includes("transfer")) return "Referred";
  if (text.includes("critic")) return "Critical";
  if (text.includes("dama") || text.includes("lama")) return "DAMA";
  if (text.includes("expir") || text.includes("deceas") || text.includes("death"))
    return "Expired";
  if (text.includes("stable") || text.includes("home") || text.includes("discharge"))
    return "Stable";
  return cleanText(value);
}

function normalizeMedicationRows(rows, fallbackRows) {
  if (!Array.isArray(rows) || rows.length === 0) return fallbackRows;

  const mapped = rows
    .map((row) => {
      if (typeof row === "string") {
        const name = cleanText(row);
        return name
          ? {
              name,
              dosage: "",
              route: "",
              frequency: "",
              duration: "",
            }
          : null;
      }

      if (!row || typeof row !== "object") return null;

      return {
        name: firstFilled(
          row.name,
          row.medicine_name,
          row.medication_name,
          row.drug_name,
          row.medicine,
          row.drug,
        ),
        dosage: firstFilled(row.dosage, row.dose, row.strength),
        route: firstFilled(row.route, row.mode, row.administration_route),
        frequency: firstFilled(row.frequency, row.schedule, row.timing),
        duration: firstFilled(row.duration, row.days, row.course_duration),
      };
    })
    .filter(
      (row) =>
        row &&
        [row.name, row.dosage, row.route, row.frequency, row.duration].some(Boolean),
    );

  return mapped.length > 0 ? mapped : fallbackRows;
}

export function mapToDischargeSummary(analysisData) {
  const base = mapToFormA(analysisData);
  const structured = analysisData?.structured_data ?? analysisData?.autofill_extracted ?? {};
  const patient = structured.patient_details ?? {};
  const hospital = structured.hospital_details ?? {};
  const diagnosis = structured.diagnosis_and_procedures ?? {};
  const claim = structured.claim_details ?? {};
  const documentMetadata = structured.document_metadata ?? {};
  const autofillResult = analysisData?.autofill_result ?? {};
  const hospitalOverlay = autofillResult.part_b_hospital_section ?? {};

  const defaultInHospitalMedications = [
    {
      name: "Aspirin 75mg",
      dosage: "75mg OD",
      route: "Oral",
      frequency: "Once daily",
      duration: "Continued",
    },
    {
      name: "Clopidogrel",
      dosage: "75mg OD",
      route: "Oral",
      frequency: "Once daily",
      duration: "Continued",
    },
    {
      name: "Atorvastatin",
      dosage: "40mg",
      route: "Oral",
      frequency: "Once at night",
      duration: "Continued",
    },
    {
      name: "Metoprolol",
      dosage: "25mg",
      route: "Oral",
      frequency: "Twice daily",
      duration: "Continued",
    },
  ];

  const defaultDischargeMedications = [
    {
      name: "Aspirin 75mg",
      dosage: "75mg OD",
      route: "Oral",
      frequency: "Once daily",
      duration: "3 months",
    },
    {
      name: "Clopidogrel 75mg",
      dosage: "75mg OD",
      route: "Oral",
      frequency: "Once daily",
      duration: "1 year",
    },
    {
      name: "Atorvastatin 40mg",
      dosage: "40mg",
      route: "Oral",
      frequency: "Once at night",
      duration: "Lifelong",
    },
    {
      name: "Metoprolol Succinate 25",
      dosage: "25mg",
      route: "Oral",
      frequency: "Once daily",
      duration: "3 months",
    },
    {
      name: "Ramipril 2.5mg",
      dosage: "2.5mg",
      route: "Oral",
      frequency: "Once daily",
      duration: "Indefinite",
    },
  ];

  const inHospitalMedicationRows = normalizeMedicationRows(
    firstArray(
      structured.medications_during_hospitalization,
      structured.in_hospital_medications,
      structured.hospital_medications,
      hospital.medications_during_hospitalization,
      hospital.in_hospital_medications,
      diagnosis.medications_during_hospitalization,
      diagnosis.in_hospital_medications,
      structured.medications,
      structured.medicines,
      analysisData?.autofill_extracted?.prescriptions,
      analysisData?.autofill_extracted?.medications,
    ),
    defaultInHospitalMedications,
  );

  const dischargeMedicationRows = normalizeMedicationRows(
    firstArray(
      structured.discharge_medications,
      structured.discharge_prescription,
      structured.home_medications,
      hospital.discharge_medications,
      hospital.discharge_prescription,
      diagnosis.discharge_medications,
      diagnosis.discharge_prescription,
      analysisData?.autofill_extracted?.discharge_medications,
    ),
    defaultDischargeMedications,
  );

  const documentChecklistDefaults = [
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    true,
    false,
  ];

  const dischargeDocumentsChecklist = documentChecklistDefaults.map(
    (defaultValue, index) => {
      if (index < 13 && Array.isArray(base.docChecklist) && base.docChecklist[index] != null) {
        return !!base.docChecklist[index];
      }
      return defaultValue;
    },
  );

  return {
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
    uhidIpdNo: base.uhidIpdNo ?? base.ipdNo ?? "",
    injuryDate: base.injuryDate ?? "",
    admissionDate: base.admissionDate ?? "",
    admissionTime: base.admissionTime ?? "",
    dischargeDate: base.dischargeDate ?? "",
    dischargeTime: base.dischargeTime ?? "",
    treatingDoctor: base.treatingDoctor ?? "",
    department:
      firstFilled(
        base.department,
        hospital.department,
        hospital.speciality,
        hospital.specialty,
        diagnosis.department,
      ) ?? "",
    roomWardBedNo: base.roomWardBedNo ?? "",
    lengthOfStay: base.lengthOfStay ?? "",
    systemOfMedicine: base.systemOfMedicine ?? "",
    tpaName: base.tpaName ?? base.tpaId ?? "",
    documentDate:
      firstFilled(documentMetadata.document_date, documentMetadata.generated_on) ?? "",
    dischargeSummaryId:
      firstFilled(
        documentMetadata.document_id,
        documentMetadata.discharge_summary_id,
        hospital.discharge_summary_id,
      ) ?? "",

    clinicalChiefComplaints: firstMultiline(
      diagnosis.chief_complaints,
      diagnosis.presenting_complaints,
      patient.chief_complaints,
      hospital.chief_complaints,
    ),
    clinicalHpi: firstMultiline(
      diagnosis.history_of_present_illness,
      diagnosis.hpi,
      hospital.history_of_present_illness,
      patient.history_of_present_illness,
    ),
    clinicalPastHistory: firstMultiline(
      patient.past_medical_history,
      diagnosis.past_medical_history,
      hospital.past_medical_history,
      patient.medical_history,
    ),
    clinicalComorbidities: firstMultiline(
      diagnosis.comorbidities,
      diagnosis.co_morbidities,
      diagnosis.comorbid_conditions,
      patient.comorbidities,
    ),
    clinicalProvisionalDiagnosis: firstFilled(
      diagnosis.provisional_diagnosis,
      diagnosis.primary_diagnosis,
      hospital.provisional_diagnosis,
    ),
    clinicalProvisionalICD: firstFilled(
      diagnosis.provisional_icd_code,
      diagnosis.primary_icd_code,
      diagnosis.icd_10_code,
    ),
    clinicalFinalDiagnosis: firstFilled(
      diagnosis.final_diagnosis,
      diagnosis.discharge_diagnosis,
      diagnosis.primary_diagnosis,
    ),
    clinicalFinalICD: firstFilled(
      diagnosis.final_icd_code,
      diagnosis.discharge_icd_code,
      diagnosis.primary_icd_code,
    ),

    investigationCbc: firstMultiline(
      diagnosis.cbc_report,
      diagnosis.blood_reports,
      diagnosis.investigation_cbc,
      hospital.cbc_report,
    ),
    investigationCardiac: firstMultiline(
      diagnosis.cardiac_markers,
      diagnosis.investigation_cardiac,
      hospital.cardiac_markers,
    ),
    investigationEcg: firstMultiline(
      diagnosis.ecg_findings,
      diagnosis.ecg_report,
      diagnosis.investigation_ecg,
      hospital.ecg_findings,
    ),
    investigationEcho: firstMultiline(
      diagnosis.echo_findings,
      diagnosis.echocardiogram,
      diagnosis.investigation_echo,
      hospital.echo_findings,
    ),
    investigationAngio: firstMultiline(
      diagnosis.angiography_findings,
      diagnosis.coronary_angiography,
      diagnosis.investigation_angio,
      hospital.angiography_findings,
    ),
    investigationOther: firstMultiline(
      diagnosis.other_reports,
      diagnosis.investigation_other,
      hospital.other_reports,
    ),

    treatmentGiven: firstMultiline(
      diagnosis.treatment_given,
      hospital.treatment_given,
      diagnosis.management_summary,
    ),
    procedurePerformed: firstFilled(
      diagnosis.procedure_performed,
      diagnosis.primary_procedure,
      diagnosis.procedure_name,
      Array.isArray(diagnosis.procedure_names)
        ? diagnosis.procedure_names.join(", ")
        : diagnosis.procedure_names,
    ),
    procedureCpt: firstFilled(
      diagnosis.procedure_cpt,
      diagnosis.cpt_code,
      hospital.procedure_cpt,
    ),
    surgeryDateDuration: firstFilled(
      diagnosis.surgery_date_duration,
      hospital.surgery_date_duration,
      hospital.procedure_date,
      diagnosis.procedure_date,
    ),
    surgeonTeam: firstFilled(
      hospital.surgeon_name,
      hospital.operating_team,
      diagnosis.surgeon_team,
      base.treatingDoctor,
    ),
    icuStay: firstMultiline(
      hospital.icu_stay_details,
      diagnosis.icu_stay_details,
      hospital.icu_stay,
      diagnosis.icu_stay,
    ),
    operativeNotes: firstMultiline(
      diagnosis.operative_notes,
      diagnosis.operative_notes_summary,
      hospital.operative_notes,
    ),
    hospitalCourseSummary: firstMultiline(
      hospital.hospital_course_summary,
      diagnosis.hospital_course_summary,
      diagnosis.hospital_course,
    ),

    inHospitalMedications: inHospitalMedicationRows,
    dischargeMedications: dischargeMedicationRows,
    dischargeCondition: mapDischargeCondition(
      firstFilled(hospital.status_at_discharge, hospitalOverlay.status_at_discharge),
    ),
    followUpInstructions: firstMultiline(
      hospital.follow_up_instructions,
      diagnosis.follow_up_instructions,
      analysisData?.recommended_diagnostic_follow_up,
    ),
    dietAdvice: firstMultiline(
      hospital.diet_advice,
      diagnosis.diet_advice,
      patient.diet_advice,
    ),
    activityRestrictions: firstMultiline(
      hospital.activity_restrictions,
      diagnosis.activity_restrictions,
    ),
    warningSigns: firstMultiline(
      hospital.warning_signs,
      diagnosis.warning_signs,
    ),
    nextFollowUpDate: firstFilled(
      hospital.next_follow_up_date,
      diagnosis.next_follow_up_date,
      documentMetadata.next_follow_up_date,
    ),
    referringDoctor: firstFilled(
      hospital.referring_doctor,
      diagnosis.referring_doctor,
      patient.referring_doctor,
    ),
    claimReady: toBoolean(claim.insurance_claim_ready, true),
    medicalNecessityDocumented: toBoolean(
      claim.medical_necessity_documented,
      true,
    ),
    procedureJustificationAdded: toBoolean(
      claim.procedure_justification_added,
      false,
    ),
    losJustified: toBoolean(claim.length_of_stay_justified, true),
    codesAssigned: toBoolean(claim.icd_cpt_codes_assigned, true),
    supportingDocumentsAttached: toBoolean(
      claim.supporting_documents_attached,
      true,
    ),
    claimAiAssessment: firstMultiline(
      claim.ai_assessment,
      documentMetadata.ai_assessment,
    ),
    dischargeDocumentsChecklist,

    doctorAuthorizationName: firstFilled(
      hospital.treating_doctor,
      hospital.doctor_name,
      base.treatingDoctor,
    ),
    doctorRegistrationNumber: firstFilled(
      hospital.doctor_registration_number,
      hospitalOverlay.doctor_registration_number,
      hospital.registration_number,
    ),
    doctorAuthorizationDepartment: firstFilled(
      hospital.department,
      hospital.speciality,
      hospital.specialty,
      diagnosis.department,
      base.department,
      base.systemOfMedicine,
    ),
    doctorAuthorizationDate: firstFilled(
      hospital.discharge_date,
      documentMetadata.document_date,
      base.dischargeDate,
    ),
    patientAttendantName: firstFilled(
      patient.attendant_name,
      patient.name,
      base.hospitalizedName,
      base.primaryName,
    ),
    patientAttendantRelation: firstFilled(
      patient.attendant_relation,
      patient.relationship_to_insured,
      base.relationship,
      base.relationshipSpecify,
    ),
    patientAttendantContact: firstFilled(
      patient.attendant_contact,
      patient.phone,
      base.primaryPhone,
      base.hospPhone,
    ),
    patientAttendantDate: firstFilled(
      hospital.discharge_date,
      documentMetadata.document_date,
      base.dischargeDate,
    ),
    footerHospitalName: firstFilled(
      hospital.hospital_name,
      base.hospitalName,
    ),
    footerDocumentLine: firstFilled(
      documentMetadata.footer_document_line,
      `Document ID: ${firstFilled(
        documentMetadata.document_id,
        documentMetadata.discharge_summary_id,
        hospital.discharge_summary_id,
        base.certificateNumber,
      )} · UHID: ${firstFilled(
        hospital.patient_id,
        hospital.ip_registration_number,
        base.uhidIpdNo,
        base.policyNumber,
      )}`,
    ),
    footerGeneratedLine: firstFilled(
      documentMetadata.footer_generated_line,
      `Generated: ${firstFilled(
        documentMetadata.document_date,
        hospital.discharge_date,
        base.dischargeDate,
      )} · This is a legal medical document.`,
    ),
    footerRightLine1: firstFilled(
      documentMetadata.footer_right_line_1,
      "Insurance-ready discharge documentation",
    ),
    footerRightLine2: firstFilled(
      documentMetadata.footer_right_line_2,
      "Structured for TPA acceptance",
    ),

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
    firYes: !!base.firYes,
    firNo: !!base.firNo,
    domiciliary: base.domiciliary ?? "",
    docChecklist: Array.isArray(base.docChecklist)
      ? base.docChecklist.slice(0, 13)
      : Array(13).fill(false),
  };
}
