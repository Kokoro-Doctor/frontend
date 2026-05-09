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

export function mapToStarHealthFormA(analysisData) {
  const base = mapToFormA(analysisData);

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
    injuryDate: base.injuryDate ?? "",
    admissionDate: base.admissionDate ?? "",
    admissionTime: base.admissionTime ?? "",
    dischargeDate: base.dischargeDate ?? "",
    dischargeTime: base.dischargeTime ?? "",
    treatingDoctor: base.treatingDoctor ?? "",
    systemOfMedicine: base.systemOfMedicine ?? "",

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
