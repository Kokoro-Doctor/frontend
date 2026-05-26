import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { Asset } from "expo-asset";

/**
 * Loads the Star Health logo from local assets and returns a base64 data URI.
 * This is required because HTML strings rendered by expo-print / html2pdf
 * cannot resolve relative file paths — the image must be embedded inline.
 */
export async function getLogoBase64() {
  try {
    const asset = Asset.fromModule(
      require("../../assets/HospitalPortal/Images/StarHealth.jpg"),
    );
    await asset.downloadAsync();
    // eslint-disable-next-line import/namespace
    const encodingType = FileSystem["EncodingType"]?.Base64 ?? "base64";
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: encodingType,
    });
    const ext = (asset.localUri ?? "").split(".").pop()?.toLowerCase();
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    console.warn("getLogoBase64: could not load logo asset", e);
    return null;
  }
}

/**
 * Render a string as a row of individual character boxes for the PDF.
 * Each character gets its own bordered cell to match the on-screen char-box UI.
 */
function charBoxHtml(value, length) {
  const padded = String(value ?? "")
    .padEnd(length, " ")
    .slice(0, length);
  const cells = padded
    .split("")
    .map(
      (ch) =>
        `<span class="char-box">${ch === " " ? "&nbsp;" : escHtml(ch)}</span>`,
    )
    .join("");
  return `<span class="char-row">${cells}</span>`;
}

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function checkBox(checked) {
  return checked
    ? `<span class="cb cb-checked">&#10003;</span>`
    : `<span class="cb"></span>`;
}

function signatureBlockHtml(dataUrl) {
  const s = dataUrl && String(dataUrl).trim();
  if (s && s.startsWith("data:image/")) {
    return `<span class="signature-box signature-box-filled"><img src="${s}" alt="" class="signature-img" /></span>`;
  }
  return `<span class="signature-box"></span>`;
}

function sectionBar(label, className = "") {
  return `
    <div class="section-bar${className ? ` ${className}` : ""}">
      <div class="section-bar-line"></div>
      <div class="section-bar-text">${label}</div>
      <div class="section-bar-line"></div>
    </div>`;
}

function lineFieldHtml(value, className = "") {
  const text = escHtml(String(value ?? "").trim()).replace(/ /g, "&nbsp;");
  return `<span class="line-field${className ? ` ${className}` : ""}">${text || "&nbsp;"}</span>`;
}

function cleanField(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function multilineHtml(value) {
  const raw = String(value ?? "").trim();
  return raw ? escHtml(raw).replace(/\n/g, "<br />") : "&nbsp;";
}

function normalizeRows(rows, fallbackRows = []) {
  return Array.isArray(rows) && rows.length > 0 ? rows : fallbackRows;
}

function isTruthy(value, fallback = false) {
  if (typeof value === "boolean") return value;
  const raw = cleanField(value).toLowerCase();
  if (!raw) return fallback;
  if (["yes", "true", "1", "y", "checked"].includes(raw)) return true;
  if (["no", "false", "0", "n", "unchecked"].includes(raw)) return false;
  return fallback;
}

function formatHeaderDate(value) {
  const raw = cleanField(value);
  if (!raw) return "";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) {
    const day = digits.slice(0, 2);
    const monthIndex = Number(digits.slice(2, 4)) - 1;
    const year = digits.slice(4, 8);
    if (monthNames[monthIndex]) {
      return `${day}-${monthNames[monthIndex]}-${year}`;
    }
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const monthIndex = Number(month) - 1;
    if (monthNames[monthIndex]) {
      return `${day}-${monthNames[monthIndex]}-${year}`;
    }
  }

  return raw;
}

function formatDisplayDate(value) {
  const raw = cleanField(value);
  if (!raw) return "";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const monthIndex = Number(month) - 1;
    if (monthNames[monthIndex]) {
      return `${day}-${monthNames[monthIndex]}-${year}`;
    }
  }

  const dmyMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const monthIndex = Number(dmyMatch[2]) - 1;
    const year = dmyMatch[3];
    if (monthNames[monthIndex]) {
      return `${day}-${monthNames[monthIndex]}-${year}`;
    }
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) {
    const day = digits.slice(0, 2);
    const monthIndex = Number(digits.slice(2, 4)) - 1;
    const year = digits.slice(4, 8);
    if (monthNames[monthIndex]) {
      return `${day}-${monthNames[monthIndex]}-${year}`;
    }
  }

  return raw;
}

function formatGenderLabel(value) {
  const raw = cleanField(value).toLowerCase();
  if (!raw) return "";
  if (raw === "f" || raw.includes("female")) return "Female";
  if (raw === "m" || raw.includes("male")) return "Male";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function parseDateValue(value) {
  const raw = cleanField(value);
  if (!raw) return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) {
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4)) - 1;
    const year = Number(digits.slice(4, 8));
    return new Date(year, month, day);
  }

  return null;
}

function computeLengthOfStay(admissionDate, dischargeDate, explicitLength) {
  const provided = cleanField(explicitLength);
  if (provided) return provided;

  const admission = parseDateValue(admissionDate);
  const discharge = parseDateValue(dischargeDate);
  if (!admission || !discharge) return "";

  const diffMs = discharge.getTime() - admission.getTime();
  const days = Math.max(0, Math.round(diffMs / 86400000));
  return `${days} Day${days === 1 ? "" : "s"}`;
}

function formatAgeGender(ageYears, gender) {
  const age = cleanField(ageYears);
  const genderLabel = formatGenderLabel(gender);
  const parts = [];
  if (age) parts.push(`${age} Years`);
  if (genderLabel) parts.push(genderLabel);
  return parts.join(" / ");
}

function patientInfoCellHtml(label, value, className = "") {
  const text = escHtml(String(value ?? "").trim()) || "&nbsp;";

  return `
    <div class="patient-info-cell${className ? ` ${className}` : ""}">
      
      <div 
        class="patient-info-label"
        contenteditable="true"
      >
        ${label}
      </div>

      <div 
        class="patient-info-value"
        contenteditable="true"
      >
        ${text}
      </div>

    </div>
  `;
}

function isYes(value) {
  return (
    String(value ?? "")
      .trim()
      .toLowerCase() === "yes"
  );
}

function isNo(value) {
  return (
    String(value ?? "")
      .trim()
      .toLowerCase() === "no"
  );
}

function relationshipChecked(value, key) {
  const rel = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!rel) return false;
  if (key === "other") {
    return !["self", "spouse", "child", "father", "mother"].some(
      (item) => rel === item || rel.includes(item),
    );
  }
  return rel === key || rel.includes(key);
}

function occupationChecked(value, key) {
  const occupation = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!occupation) return false;
  if (key === "other") {
    return !["service", "self", "home", "student", "retired"].some((item) =>
      occupation.includes(item),
    );
  }
  if (key === "self employed") {
    return occupation.includes("self") && occupation.includes("employ");
  }
  if (key === "homemaker") {
    return occupation.includes("home");
  }
  return occupation.includes(key.split(" ")[0]);
}

function roomCategoryChecked(value, key) {
  const room = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!room) return false;
  if (key === "day care") return room.includes("day");
  if (key === "single occupancy") return room.includes("single");
  if (key === "twin sharing")
    return room.includes("twin") || room.includes("double");
  if (key === "3 or more beds per room") {
    return (
      room.includes("3") ||
      room.includes("more") ||
      room.includes("general") ||
      room.includes("shared")
    );
  }
  return false;
}

function hospitalizationCauseChecked(value, key) {
  const cause = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!cause) return false;
  if (key === "injury") return cause.includes("injur");
  if (key === "illness") {
    return (
      cause.includes("ill") ||
      cause.includes("disease") ||
      cause.includes("sick")
    );
  }
  if (key === "maternity") {
    return (
      cause.includes("mater") ||
      cause.includes("deliver") ||
      cause.includes("pregnan")
    );
  }
  return false;
}

function placeholderBoxRowHtml(value, placeholders) {
  const raw = String(value ?? "")
    .replace(/\s/g, "")
    .slice(0, placeholders.length);
  const cells = placeholders
    .map((placeholder, index) => raw[index] || placeholder)
    .map(
      (ch) =>
        `<span class="char-box placeholder-char-box">${escHtml(ch)}</span>`,
    )
    .join("");
  return `<span class="char-row placeholder-box-row">${cells}</span>`;
}

function segmentedDateHtml(value, className = "") {
  const digits = String(value ?? "").replace(/\D/g, "");
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return `
    <span class="segmented-date${className ? ` ${className}` : ""}">
      <span class="date-part">${day || "&nbsp;"}</span>
      <span class="date-sep">/</span>
      <span class="date-part">${month || "&nbsp;"}</span>
      <span class="date-sep">/</span>
      <span class="date-part date-part-year">${year || "&nbsp;"}</span>
    </span>`;
}

function segmentedTimeHtml(value, className = "") {
  const digits = String(value ?? "").replace(/\D/g, "");
  const hours = digits.slice(0, 2);
  const minutes = digits.slice(2, 4);
  return `
    <span class="segmented-time${className ? ` ${className}` : ""}">
      <span class="time-part">${hours || "&nbsp;"}</span>
      <span class="time-sep">:</span>
      <span class="time-part">${minutes || "&nbsp;"}</span>
    </span>`;
}

function emptyBoxRowHtml(count, className = "") {
  const cells = Array.from(
    { length: count },
    () =>
      `<span class="char-box${className ? ` ${className}` : ""}">&nbsp;</span>`,
  ).join("");
  return `<span class="char-row">${cells}</span>`;
}

function triggerBrowserFileDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openPrintWindow(html) {
  if (typeof window === "undefined" || !window.open) return false;
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return false;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch (_) {}
  }, 300);
  return true;
}

// ─── Hardcoded Star Health logo (base64 PNG) ────────────────────────────────
// Embedded so the HTML string works in expo-print / html2pdf without needing
// to resolve a file-system path at runtime.
const STAR_HEALTH_LOGO_DATA_URI =
  "data:image/png;base64,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";
// ────────────────────────────────────────────────────────────────────────────

/**
 * Build a styled A4 HTML string from the filled insurance form state.
 * @param {Object} form - the form state
 * @param {string | null} [signatureDataUrl] - optional PNG data URI from the e-sign capture
 * @param {string | null} [logoDataUrl] - optional PNG/JPEG data URI for the logo;
 *   falls back to the hardcoded STAR_HEALTH_LOGO_DATA_URI constant above.
 * @returns {string} HTML string
 */
export function generateInsuranceFormHTML(
  form,
  signatureDataUrl = null,
  logoDataUrl = null,
) {
  const f = form || {};
  const signatureHtml = signatureBlockHtml(signatureDataUrl);
  const logoSrc = logoDataUrl || STAR_HEALTH_LOGO_DATA_URI;
  const hospitalTitle = cleanField(f.hospitalName);
  const hospitalAddressLine1 =
    [cleanField(f.hospAddressRow1), cleanField(f.hospAddressRow2)]
      .filter(Boolean)
      .join(", ");
  const hospitalAddressLine2 =
    [cleanField(f.hospCity), cleanField(f.hospState), cleanField(f.hospPin)]
      .filter(Boolean)
      .join(" - ");
  const hospitalPhone = cleanField(f.hospPhone);
  const hospitalEmail = cleanField(f.hospEmail);
  const documentUhid =
    cleanField(f.uhidIpdNo || f.ipdNo || f.policyNumber || f.mobilePolicy);
  const dischargeSummaryId =
    cleanField(f.dischargeSummaryId || f.summaryId || f.certificateNumber);
  const documentDate =
    formatHeaderDate(f.documentDate || f.declarationDate || f.dischargeDate);
  const patientFullName = cleanField(f.hospitalizedName || f.primaryName);
  const patientAgeGender = formatAgeGender(f.ageYears, f.gender);
  const patientAdmissionDate = formatDisplayDate(f.admissionDate);
  const patientDischargeDate = formatDisplayDate(f.dischargeDate);
  const patientLengthOfStay = computeLengthOfStay(
    f.admissionDate,
    f.dischargeDate,
    f.lengthOfStay,
  );
  const patientTreatingDoctor = cleanField(f.treatingDoctor);
  const patientDepartment = cleanField(f.department || f.systemOfMedicine);
  const patientRoomWardBed = cleanField(f.roomWardBedNo || f.roomCategory);
  const patientInsuranceCompany = cleanField(f.insuranceCompanyName);
  const patientTpaName = cleanField(f.tpaName || f.tpaId);
  const relationshipValue = f.relationship || f.relationshipSpecify;
  const occupationValue = f.occupation || f.occupationSpecify;
  const claimChecklistItems = [
    "Claim Form Duly signed",
    "Copy of the claim intimation",
    "Hospital Main Bill",
    "Hospital Break-up Bill",
    "Hospital Bill Payment Receipt",
    "Hospital Discharge Summary",
    "Pharmacy Bill",
    "Operation Theater Notes",
    "ECG",
    "Doctor's request for investigation",
    "Investigation Reports (Including CT /MRI / USG / HPE)",
    "Doctor's Prescriptions",
    "Others",
  ];
  const billRows = [
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
  ].map((label, index) => {
    const row = f.billRows?.[index] ?? {};
    return {
      billNo: row.billNo ?? "",
      date: row.date ?? "",
      issuedBy: row.issuedBy ?? "",
      towards: row.towards || label,
      amount: row.amount ?? "",
    };
  });
  const inHospitalMedicationRows = normalizeRows(f.inHospitalMedications, []);
  const dischargeMedicationRows = normalizeRows(f.dischargeMedications, []);
  const dischargeCondition = cleanField(f.dischargeCondition);
  const dischargeAdviceValues = {
    followUpInstructions: f.followUpInstructions || "",
    dietAdvice: f.dietAdvice || "",
    activityRestrictions: f.activityRestrictions || "",
    warningSigns: f.warningSigns || "",
    nextFollowUpDate: cleanField(f.nextFollowUpDate) || "",
    referringDoctor: cleanField(f.referringDoctor) || "",
  };
  const claimValidationItems = [
    {
      label: "Insurance Claim Ready",
      checked: isTruthy(f.claimReady, true),
    },
    {
      label: "Medical Necessity Documented",
      checked: isTruthy(f.medicalNecessityDocumented, true),
    },
    {
      label: "Procedure Justification Added",
      checked: isTruthy(f.procedureJustificationAdded, false),
    },
    {
      label: "LOS (Length of Stay) Justified",
      checked: isTruthy(f.losJustified, true),
    },
    {
      label: "ICD-10 / CPT Codes Assigned",
      checked: isTruthy(f.codesAssigned, true),
    },
    {
      label: "Supporting Documents Attached",
      checked: isTruthy(f.supportingDocumentsAttached, true),
    },
  ];
  const dischargeDocuments = [
    "Investigation Reports (CBC, Biochemistry)",
    "Echocardiogram Report",
    "Operation Theatre (OT) Notes",
    "Doctor Prescriptions (In-hospital)",
    "Final Itemised Bill / Cost Summary",
    "Insurance / Policy Documents",
    "Consent Forms",
    "ECG Reports",
    "Coronary Angiography Report & Images",
    "Anaesthesia Notes",
    "Discharge Prescription",
    "Implant / Device Stickers",
    "Pre-Authorization Letter",
    "Indoor Case Papers / Nursing Notes",
  ].map((label, index) => ({
    label,
    checked: Array.isArray(f.dischargeDocumentsChecklist)
      ? !!f.dischargeDocumentsChecklist[index]
      : index !== 6 && index !== 11 && index !== 13,
  }));
  const authorizationDoctorName =
    cleanField(f.doctorAuthorizationName || f.treatingDoctor);
  const authorizationDoctorRegistration =
    cleanField(f.doctorRegistrationNumber);
  const authorizationDepartment =
    cleanField(f.doctorAuthorizationDepartment || f.department || f.systemOfMedicine);
  const authorizationDoctorDate =
    formatDisplayDate(
      f.doctorAuthorizationDate || f.documentDate || f.dischargeDate,
    );
  const authorizationAttendantName =
    cleanField(
      f.patientAttendantName || f.hospitalizedName || f.primaryName,
    );
  const authorizationAttendantRelation =
    cleanField(
      f.patientAttendantRelation || f.relationship || f.relationshipSpecify,
    );
  const authorizationAttendantContact =
    cleanField(
      f.patientAttendantContact || f.primaryPhone || f.hospPhone,
    );
  const authorizationAttendantDate =
    formatDisplayDate(
      f.patientAttendantDate || f.documentDate || f.dischargeDate,
    );
  const footerHospitalName = cleanField(f.footerHospitalName || hospitalTitle);
  const footerDocumentLine =
    cleanField(f.footerDocumentLine);
  const footerGeneratedLine =
    cleanField(f.footerGeneratedLine);
  const footerRightLine1 =
    cleanField(f.footerRightLine1);
  const footerRightLine2 =
    cleanField(f.footerRightLine2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Claim Form - Part A</title>
<style>
  @media print {
    @page { margin: 0; size: A4 portrait; }
    .insurance-form-root { padding: 4mm; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; background: #fff; }
  .insurance-form-root {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 6.5px;
    color: #111;
    background: #fff;
    padding: 4mm;
    width: 210mm;
    min-height: auto;
    margin: 0 auto;
    border: 1px solid #ff4d4f;
  }

  /* ── HEADER ── */
  .form-header {
    margin-bottom: 5px;
    border: 1px solid #d7dfec;
    background: #fff;
    box-shadow: 0 1px 2px rgba(21, 42, 94, 0.08);
  }
  .summary-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: #29449b;
    color: #fff;
    padding: 5px 8px;
  }
  .summary-brand {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .summary-brand-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .summary-brand-mark {
    width: 18px;
    height: 18px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.16);
    position: relative;
    flex-shrink: 0;
  }
  .summary-brand-mark::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
  }
  .summary-brand-mark::after {
    content: "+";
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #29449b;
    font-size: 8px;
    font-weight: bold;
  }
  .summary-brand-text {
    font-size: 8px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .summary-actions {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }
  .summary-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    white-space: nowrap;
    font-size: 6.7px;
    font-weight: bold;
    border-radius: 6px;
    padding: 6px 10px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    background: rgba(255, 255, 255, 0.1);
  }
  .summary-action-light {
    background: #fff;
    color: #29449b;
    border-color: #fff;
  }
  .summary-action-icon {
    font-size: 7px;
    line-height: 1;
  }
  .summary-body {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 10px 9px;
    align-items: flex-start;
  }
  .summary-hospital {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
  .summary-hospital-mark {
    width: 42px;
    height: 42px;
    border: 1px dashed #c7d2e7;
    border-radius: 8px;
    background: #f4f7fd;
    position: relative;
    flex-shrink: 0;
  }
  .summary-hospital-mark::before,
  .summary-hospital-mark::after {
    content: "";
    position: absolute;
    background: #9bb0d8;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .summary-hospital-mark::before {
    width: 14px;
    height: 1.5px;
  }
  .summary-hospital-mark::after {
    width: 1.5px;
    height: 14px;
  }
  .summary-hidden-asset {
    display: none;
  }
  .summary-hospital-title {
  font-size: 10px;
  font-weight: bold;
  color: #243f93;
  font-family: Georgia, "Times New Roman", serif;
  margin-bottom: 3px;
  outline: none;
  min-height: 14px;
}
  .summary-hospital-line {
    font-size: 6.7px;
    color: #63748d;
    line-height: 1.45;
  }
  .summary-contact-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 6.6px;
    color: #63748d;
  }
  .summary-contact-item {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    white-space: nowrap;
  }
  .summary-contact-icon {
    color: #dd3b76;
    font-size: 7px;
    line-height: 1;
  }
  .summary-badges {
    display: flex;
    gap: 4px;
    margin-top: 5px;
    flex-wrap: wrap;
  }
  .summary-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 2px 6px;
    border: 1px solid #b8c9ea;
    border-radius: 4px;
    background: #f5f8ff;
    color: #29449b;
    font-size: 5.8px;
    font-weight: bold;
  }
  .summary-meta {
    width: 68mm;
    text-align: right;
    flex-shrink: 0;
  }
  .summary-title {
    font-size: 10px;
    font-weight: bold;
    color: #243f93;
    font-family: Georgia, "Times New Roman", serif;
    margin-bottom: 6px;
  }
  .summary-meta-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    margin-bottom: 4px;
  }
  .summary-meta-label {
    font-size: 6.9px;
    color: #63748d;
    white-space: nowrap;
  }
  .summary-meta-value {
  min-width: 34mm;
  padding: 3px 6px;
  border: 1px solid #cad5e7;
  border-radius: 4px;
  background: #f8fbff;
  color: #4d5565;
  font-size: 7px;
  text-align: center;
  font-family: "Courier New", monospace;
  outline: none;
  min-height: 18px;
}
  .summary-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: #29449b;
    color: #fff;
    padding: 5px 10px;
  }
  .summary-footer-left {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 6.8px;
    font-weight: bold;
    white-space: nowrap;
  }
  .summary-footer-right {
    font-size: 6.5px;
    color: rgba(255, 255, 255, 0.84);
    text-align: right;
  }
  .patient-info-section {
    margin-bottom: 5px;
    border: 1px solid #bfd0ea;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
  }
  .patient-info-section-title {
    background: #2954a4;
    color: #fff;
    font-size: 8.3px;
    font-weight: bold;
    letter-spacing: 0.3px;
    padding: 6px 10px;
    text-transform: uppercase;
  }
  .patient-info-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .patient-info-cell {
    min-height: 12mm;
    padding: 8px 12px 7px;
    border-right: 1px solid #bfd0ea;
    border-bottom: 1px solid #bfd0ea;
    background: #fff;
  }
  .patient-info-cell:nth-child(3n) {
    border-right: none;
  }
  .patient-info-cell:nth-last-child(-n + 3) {
    border-bottom: none;
  }
  .patient-info-label {
    font-size: 6.6px;
    font-weight: bold;
    color: #597092;
    letter-spacing: 0.15px;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .patient-info-value {
  font-size: 8.5px;
  color: #12284d;
  line-height: 1.35;
  word-break: break-word;
  outline: none;
  min-height: 12px;
}

.patient-info-label{
  font-size: 6.6px;
  font-weight: bold;
  color: #597092;
  letter-spacing: 0.15px;
  text-transform: uppercase;
  margin-bottom: 5px;
  outline:none;
}
  .patient-info-value-strong .patient-info-value {
    font-weight: bold;
  }

  /* ── SECTION WRAPPER ── */
  .section-wrap {
    display: flex;
    gap: 3px;
    margin-bottom: 2px;
    border: 0.5px solid #aaa;
    padding: 3px;
  }
  .section-content { flex: 1; min-width: 0; }

  /* ── SECTION BAR (right column) ── */
  .section-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  background: #222;
  color: #fff;
  padding: 2px 1px;
  flex-shrink: 0;
}

.section-bar-text {
  transform: rotate(90deg);   /* KEY FIX */
  white-space: nowrap;
  display: inline-block;
}
  .section-bar-line { flex: 1; border-left: 0.5px solid #fff; margin: 1px 0; }
  .section-bar-text { white-space: nowrap; }
  .section-a-wrap {
    border: none;
    padding: 0;
    margin-bottom: 4px;
    align-items: stretch;
  }
  .section-a-content {
    flex: 1;
    min-width: 0;
    padding-top: 1px;
  }
  .section-a-heading {
    font-size: 6px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }
  .section-a-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    margin-bottom: 4px;
  }
  .section-a-field {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    min-width: 0;
    flex: 1;
  }
  .section-a-label {
    font-size: 6px;
    color: #333;
    white-space: nowrap;
  }
  .section-a-address { align-items: flex-start; }
  .section-a-address-lines { flex: 1; min-width: 0; }
  .line-field {
    display: inline-block;
    min-height: 8px;
    padding: 0 1px 1px;
    border-bottom: 0.6px solid #555;
    color: #111;
    line-height: 1.1;
    vertical-align: bottom;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .line-field-block { display: block; width: 100%; min-height: 10px; margin-bottom: 3px; }
  .line-field-policy { width: 89mm; }
  .line-field-cert { width: 72mm; }
  .line-field-full { width: 100%; }
  .line-field-city { width: 86mm; }
  .line-field-state { width: 82mm; }
  .line-field-pin { width: 28mm; }
  .line-field-phone { width: 41mm; }
  .line-field-email { width: 65mm; }
  .section-bar-a {
  width: 13px;
  background: #222;      // ← matches all other section bars
  color: #fff;
  padding: 2px 1px;
}
.section-bar-a .section-bar-line { border-left-color: #fff; }
.section-bar-a .section-bar-text { font-size: 5.5px; font-weight: bold; letter-spacing: 0.5px; }
  .line-section-wrap { border: none; padding: 0; margin-bottom: 4px; align-items: stretch; }
  .line-section-content { flex: 1; min-width: 0; }
  .detail-heading {
    font-size: 6px;
    font-weight: bold;
    color: #333;
    border-bottom: 0.6px solid #555;
    padding-bottom: 1px;
    margin-bottom: 4px;
  }
  .form-line-row { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
  .form-line-row-tight { gap: 6px; }
  .form-line-cell { display: flex; align-items: flex-end; gap: 3px; min-width: 0; }
  .form-line-cell-grow { flex: 1; }
  .form-line-label { font-size: 5.9px; color: #333; white-space: nowrap; }
  .form-note-inline { font-size: 5.5px; color: #444; white-space: nowrap; }
  .option-group { display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .option-item { display: inline-flex; align-items: center; gap: 2px; white-space: nowrap; }
  .option-item .cb { margin: 0; }
  .placeholder-box-row { gap: 1px; }
  .placeholder-char-box { width: 6px; height: 9px; font-size: 5.2px; margin-right: 1px; }
  .segmented-date, .segmented-time { display: inline-flex; align-items: flex-end; gap: 2px; }
  .date-part, .time-part {
    display: inline-block;
    min-height: 8px;
    padding: 0 1px 1px;
    border-bottom: 0.6px solid #555;
    text-align: center;
    line-height: 1.1;
    color: #111;
  }
  .date-part { min-width: 14px; }
  .date-part-year { min-width: 20px; }
  .time-part { min-width: 12px; }
  .date-sep, .time-sep { font-size: 6px; color: #333; line-height: 1; }
  .line-box-field { display: inline-block; min-height: 10px; border: 0.6px solid #777; padding: 0 2px; vertical-align: bottom; }
  .line-field-b-company { width: 70mm; }
  .line-field-b-policy { width: 58mm; }
  .line-field-b-sum { width: 38mm; }
  .line-field-b-diagnosis { width: 54mm; }
  .line-field-b-prev-company { width: 95mm; }
  .line-field-c-name { width: 100%; }
  .line-field-c-specify { width: 46mm; }
  .line-field-c-city { width: 95mm; }
  .line-field-c-state { width: 82mm; }
  .line-field-c-pin { width: 34mm; }
  .line-field-c-phone { width: 58mm; }
  .line-field-c-email { width: 66mm; }
  .line-field-d-hospital { width: 100mm; }
  .line-field-d-beds { width: 24mm; }
  .line-field-d-system { width: 52mm; }
  .claim-section-wrap { border: none; padding: 0; gap: 0; margin-bottom: 4px; }
  .claim-section-content { flex: 1; min-width: 0; padding: 0; }
  .claim-section-inner { display: flex; align-items: stretch; }
  .claim-main { flex: 1; padding: 0 4px 3px 0; }
  .claim-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .claim-col { min-width: 0; }
  .claim-subheading { font-size: 5.9px; color: #333; margin-bottom: 4px; }
  .claim-line { display: flex; align-items: flex-end; gap: 3px; margin-bottom: 4px; flex-wrap: nowrap; }
  .claim-line-label { font-size: 5.8px; color: #333; white-space: nowrap; }
  .claim-line-fill { flex: 1; min-width: 0; }
  .claim-line-rs { font-size: 5.8px; color: #333; white-space: nowrap; min-width: 11px; text-align: right; }
  .claim-line-days { font-size: 5.8px; color: #333; white-space: nowrap; min-width: 16px; }
  .claim-line-field { width: 100%; }
  .claim-line-field-sm { width: 100%; max-width: 34mm; }
  .claim-code-boxes .char-box { width: 8px; height: 10px; margin-right: 1px; }
  .claim-check-inline { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
  .claim-total-row { margin-top: 2px; font-weight: bold; }
  .claim-checklist { width: 40mm; border-left: 0.6px solid #555; padding: 0 4px 0 6px; flex-shrink: 0; }
  .claim-checklist-title { font-size: 5.9px; font-weight: bold; color: #333; margin-bottom: 3px; }
  .claim-checklist-item { display: flex; align-items: flex-start; gap: 3px; font-size: 5.5px; color: #333; margin-bottom: 2px; line-height: 1.15; }
  .claim-checklist-item .cb { margin-top: 0.5px; flex-shrink: 0; }
  .bills-table { width: 100%; border-collapse: collapse; font-size: 5.6px; table-layout: fixed; }
  .bills-table th, .bills-table td { border: 0.6px solid #555; padding: 1px 2px; vertical-align: middle; color: #333; }
  .bills-table th { font-weight: bold; text-align: center; }
  .bills-table td { height: 14px; }
  .bills-sl { width: 20px; text-align: center; }
  .bills-billno { width: 68px; }
  .bills-date { width: 62px; text-align: left; }
  .bills-issued { width: 142px; }
  .bills-towards { width: 124px; }
  .bills-amount { width: 128px; text-align: left; }
  .bills-date .placeholder-char-box { width: 5px; height: 8px; font-size: 4.8px; margin-right: 0; }
  .bills-amount-boxes .char-box { width: 13px; height: 14px; margin-right: 0; }
  .bills-date .char-row, .bills-amount-boxes { display: inline-flex; align-items: stretch; }
  .bank-section-wrap { border: none; padding: 0; margin-bottom: 4px; align-items: stretch; }
  .bank-section-content { flex: 1; min-width: 0; padding-right: 2px; }
  .bank-row { display: flex; align-items: center; gap: 5px; margin-bottom: 3px; flex-wrap: nowrap; }
  .bank-cell { display: flex; align-items: center; gap: 3px; min-width: 0; }
  .bank-cell-grow { flex: 1; }
  .bank-label { font-size: 5.8px; color: #333; white-space: nowrap; }
  .bank-pan-boxes .char-box, .bank-account-boxes .char-box,
  .bank-name-boxes .char-box, .bank-ifsc-boxes .char-box { width: 7px; height: 9px; margin-right: 1px; }
  .bank-pan-boxes, .bank-account-boxes, .bank-name-boxes, .bank-ifsc-boxes { display: inline-flex; }
  .bank-cheque-field { width: 74mm; min-height: 9px; }
  .bank-account-label { min-width: 32mm; }
  .bank-name-label { min-width: 26mm; }
  .bank-ifsc-label { min-width: 13mm; }
  .divider-row { display: flex; align-items: center; gap: 3px; margin-bottom: 2px; }
  .divider-line { flex: 1; height: 0.5px; background: #555; }
  .divider-label { font-size: 6px; font-weight: bold; white-space: nowrap; color: #222; }
  .row { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; margin-bottom: 2px; }
  .row-between { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 2px; margin-bottom: 2px; }
  .label { font-size: 6.5px; font-weight: bold; white-space: nowrap; }
  .small-text { font-size: 6.5px; }
  .char-row { display: inline-flex; }
  .char-box {
    display: inline-flex;
    width: 8px; height: 10px;
    border: 0.5px solid #555;
    font-size: 6px;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    margin-right: 0;
    flex-shrink: 0;
  }
  .cb {
    display: inline-block;
    width: 7px; height: 7px;
    border: 0.5px solid #555;
    margin: 0 1px;
    vertical-align: middle;
    font-size: 6px;
    text-align: center;
    line-height: 7px;
  }
  .cb-checked { background: #1565C0; color: #fff; }
  .text-field {
    display: inline-block;
    min-width: 60px;
    border-bottom: 0.5px solid #555;
    font-size: 6.5px;
    padding: 0 1px;
    vertical-align: bottom;
  }
  .bill-table { width: 100%; border-collapse: collapse; font-size: 6.5px; }
  .bill-table th, .bill-table td { border: 0.5px solid #999; padding: 1px 2px; text-align: left; vertical-align: middle; }
  .bill-table th { background: #e8e8e8; font-weight: bold; }
  .declaration-text { font-size: 6px; line-height: 1.3; margin-bottom: 3px; }
  .signature-block-row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 5px; margin-top: 5px; margin-bottom: 3px; }
  .signature-box { display: inline-block; min-width: 18mm; width: 18mm; height: 8mm; border: 0.5px solid #555; vertical-align: bottom; box-sizing: border-box; }
  .signature-box-filled { width: 48mm; height: 16mm; min-width: 48mm; padding: 2px; overflow: hidden; flex-shrink: 0; }
  .signature-img { display: block; width: 100%; height: 100%; object-fit: contain; object-position: left bottom; }
  .footer-note { font-size: 6.5px; font-weight: bold; text-align: center; margin-top: 3px; }
  /* ───────── CLINICAL SECTION ───────── */

.clinical-section{
  border:1px solid #cfd8e3;
  border-radius:4px;
  overflow:hidden;
  background:#fff;
  margin-bottom:6px;
}

.clinical-header{
  background:#1f4ea3;
  color:#fff;
  font-size:8px;
  font-weight:bold;
  padding:7px 12px;
  letter-spacing:0.2px;
}

.clinical-box{
  border-bottom:1px solid #d6dee8;
  padding:9px 12px 10px;
}

.clinical-box-big{
  min-height:52px;
}

.clinical-label{
  font-size:6.3px;
  font-weight:bold;
  color:#60708a;
  margin-bottom:5px;
  letter-spacing:0.2px;
}

.clinical-value{
  font-size:8px;
  color:#111;
  line-height:1.45;
  outline:none;
  min-height:12px;
}

.clinical-diagnosis-row{
  display:flex;
}

.clinical-diagnosis-box{
  flex:1;
  padding:9px 12px 10px;
  border-right:1px solid #d6dee8;
}

.clinical-diagnosis-box:last-child{
  border-right:none;
}

.clinical-diagnosis-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:5px;
}

.clinical-icd{
  font-size:6px;
  font-weight:bold;
  color:#1f4ea3;
}

.clinical-diagnosis-value{
  font-size:8px;
  color:#111;
  min-height:14px;
  line-height:1.4;
  outline:none;
}

.clinical-icd-value{
  margin-top:7px;
  font-size:7px;
  font-weight:bold;
  color:#1f4ea3;
  outline:none;
}
  /* ───────── MEDICATION TABLE ───────── */

.medicine-th{
  border-right:1px solid #d6dee8;
  padding:10px 12px;
  text-align:left;
  font-size:6.5px;
  font-weight:bold;
  color:#60708a;
  letter-spacing:0.2px;
}

.medicine-td{
  border-top:1px solid #d6dee8;
  border-right:1px solid #d6dee8;
  padding:10px 12px;
  font-size:8px;
  color:#111;
  min-height:20px;
  outline:none;
}

.medicine-row{
  background:#fff;
}

.medicine-placeholder{
  color:#9aa8c2;
}
  /* ───────── DISCHARGE CONDITION SECTION H ───────── */

.discharge-condition-section{
  border:1px solid #cfd8e3;
  border-radius:4px;
  overflow:hidden;
  background:#fff;
  margin-bottom:6px;
}

.discharge-condition-header{
  background:#1f4ea3;
  color:#fff;
  font-size:8px;
  font-weight:bold;
  padding:7px 12px;
  letter-spacing:0.2px;
  text-transform:uppercase;
}

.discharge-condition-body{
  padding:12px 14px;
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap:wrap;
}

.discharge-btn{
  min-width:82px;
  height:34px;
  padding:0 18px;
  border-radius:18px;
  border:1px solid #c9d3df;
  background:#fff;
  color:#3f4e63;
  font-size:7px;
  font-weight:500;
  display:flex;
  align-items:center;
  justify-content:center;
}

.discharge-btn.active{
  background:#006b4f;
  border-color:#006b4f;
  color:#fff;
  font-weight:bold;
}
  /* ───────── SECTION I : DISCHARGE ADVICE ───────── */

.discharge-advice-section{
  border:1px solid #cfd8e3;
  border-radius:4px;
  overflow:hidden;
  background:#fff;
  margin-bottom:6px;
}

.discharge-advice-header{
  background:#4d5b72;
  color:#fff;
  font-size:8px;
  font-weight:bold;
  padding:7px 12px;
  letter-spacing:0.2px;
  text-transform:uppercase;
}

.discharge-advice-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
}

.discharge-advice-box{
  min-height:62px;
  padding:11px 14px 12px;
  border-right:1px solid #d6dee8;
  border-bottom:1px solid #d6dee8;
  background:#fff;
}

.discharge-advice-box:nth-child(2n){
  border-right:none;
}

.discharge-advice-label{
  font-size:6.3px;
  font-weight:bold;
  color:#60708a;
  letter-spacing:0.2px;
  margin-bottom:7px;
}

.discharge-advice-value{
  font-size:8px;
  color:#111;
  line-height:1.55;
  outline:none;
  min-height:45px;
}

.discharge-placeholder{
  color:#9aa8c2;
}
  /* ───────── SECTION J : CLAIM VALIDATION ───────── */

.claim-validation-section{
  border:1px solid #b9d7d1;
  border-radius:4px;
  overflow:hidden;
  background:#fff;
  margin-bottom:6px;
}

.claim-validation-header{
  background:#006b4f;
  color:#fff;
  font-size:8px;
  font-weight:bold;
  padding:8px 14px;
  letter-spacing:0.2px;
  text-transform:uppercase;
}

.claim-validation-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
}

.claim-validation-item{
  min-height:48px;
  border-right:1px solid #cfe2dc;
  border-bottom:1px solid #cfe2dc;
  padding:10px 14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  background:#f8fcfb;
}

.claim-validation-item:nth-child(2n){
  border-right:none;
}

.claim-validation-label{
  font-size:7.5px;
  color:#334155;
  line-height:1.35;
}

.claim-toggle-group{
  display:flex;
  align-items:center;
  border:1px solid #bfd3cf;
  border-radius:4px;
  overflow:hidden;
  flex-shrink:0;
}

.claim-toggle-btn{
  min-width:48px;
  height:26px;
  border:none;
  background:#f3f5f7;
  color:#425466;
  font-size:7px;
  font-weight:600;
  cursor:pointer;
}

.claim-toggle-btn.active{
  background:#006b4f;
  color:#fff;
}

.claim-toggle-btn.no-btn.active{
  background:#e53935;
  color:#fff;
}

.claim-ai-assessment{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 14px;
  background:#eef7f4;
}

.claim-ai-icon{
  width:16px;
  height:16px;
  border-radius:50%;
  border:1px solid #0b8b68;
  color:#0b8b68;
  font-size:9px;
  font-weight:bold;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}

.claim-ai-title{
  font-size:7.3px;
  font-weight:bold;
  color:#006b4f;
  min-width:115px;
}

.claim-ai-text{
  font-size:7px;
  color:#24504a;
  line-height:1.45;
}
  /* ───────── SECTION K : DOCUMENTS ATTACHED ───────── */

.documents-section{
  border:1px solid #cfd8e3;
  border-radius:4px;
  overflow:hidden;
  background:#fff;
  margin-bottom:6px;
}

.documents-header{
  background:#4d5b72;
  color:#fff;
  font-size:8px;
  font-weight:bold;
  padding:8px 14px;
  letter-spacing:0.2px;
  text-transform:uppercase;
}

.documents-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  background:#f7f7f7;
}

.documents-column{
  padding:10px 14px 12px;
  border-right:1px solid #d7dde7;
}

.documents-column:last-child{
  border-right:none;
}

.document-item{
  display:flex;
  align-items:flex-start;
  gap:8px;
  margin-bottom:8px;
  cursor:pointer;
  position:relative;
}

.document-item input{
  position:absolute;
  opacity:0;
  pointer-events:none;
}

.custom-checkbox{
  width:16px;
  height:16px;
  border:1px solid #aeb9ca;
  border-radius:2px;
  background:#fff;
  position:relative;
  flex-shrink:0;
  margin-top:1px;
}

.document-item input:checked + .custom-checkbox{
  background:#2b5aa8;
  border-color:#2b5aa8;
}

.document-item input:checked + .custom-checkbox::after{
  content:"✓";
  position:absolute;
  left:3px;
  top:-1px;
  color:#fff;
  font-size:11px;
  font-weight:bold;
}

.document-text{
  font-size:7.4px;
  color:#2f3e52;
  line-height:1.35;
}
  /* ───────── SECTION L : AUTHORIZATION ───────── */

.authorization-section{
  border:1px solid #c8d4e5;
  border-radius:4px;
  overflow:hidden;
  background:#fff;
  margin-bottom:6px;
}

.authorization-header{
  background:#1f4ea3;
  color:#fff;
  font-size:8px;
  font-weight:bold;
  padding:8px 14px;
  letter-spacing:0.2px;
  text-transform:uppercase;
}

.authorization-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
}

.authorization-column{
  padding:14px 16px 16px;
  border-right:1px solid #d8e1ee;
  background:#f8f9fb;
}

.authorization-column:last-child{
  border-right:none;
}

.authorization-title{
  font-size:7px;
  font-weight:bold;
  color:#5c6f8d;
  letter-spacing:0.2px;
  margin-bottom:12px;
  text-transform:uppercase;
}

.authorization-row{
  display:flex;
  margin-bottom:14px;
}

.authorization-field{
  flex:1;
  padding-right:14px;
}

.authorization-field-right{
  border-left:1px solid #ccd6e5;
  padding-left:14px;
  padding-right:0;
}

.authorization-label{
  font-size:6.3px;
  font-weight:bold;
  color:#60708a;
  letter-spacing:0.2px;
  margin-bottom:6px;
  text-transform:uppercase;
}

.authorization-value{
  font-size:8px;
  color:#111827;
  min-height:16px;
  line-height:1.45;
  outline:none;
}

.authorization-placeholder{
  color:#8a97ad;
}

.authorization-sign-box{
  height:78px;
  border:1px dashed #c7d3e3;
  border-radius:4px;
  background:#eef2f7;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  color:#93a1b8;
  margin-top:6px;
}
  /* ───────── SECTION M : FOOTER ───────── */

.document-footer{
  margin-top:8px;
  padding-top:2px;
}

.document-footer-line{
  height:1px;
  background:#2f5ca8;
  margin-bottom:10px;
}

.document-footer-content{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:20px;
}

.document-footer-left{
  flex:1;
}

.document-footer-hospital{
  font-size:8px;
  font-weight:bold;
  color:#4c5f7a;
  margin-bottom:4px;
  outline:none;
}

.document-footer-text{
  font-size:7px;
  color:#6f7f95;
  line-height:1.6;
  outline:none;
}

.document-footer-right{
  text-align:right;
  min-width:210px;
}

.document-footer-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:4px 10px;
  border:1px solid #c9d6ea;
  border-radius:6px;
  background:#f7f9fd;
  color:#2f5ca8;
  font-size:7px;
  font-weight:bold;
  margin-bottom:7px;
}

.document-footer-right-text{
  font-size:7px;
  color:#6f7f95;
  line-height:1.5;
  outline:none;
}
</style>
</head>
<body>
<div class="insurance-form-root">

<!-- ══════════════════════ HEADER ══════════════════════ -->
<div class="form-header">
  <div class="summary-toolbar">
    <div class="summary-brand">
      <div class="summary-brand-left">
        <span class="summary-brand-mark"></span>
        <span class="summary-brand-text">Kokoro.Doctor &middot; Insurance-Ready Discharge Summary</span>
      </div>
      
    </div>
  </div>
  <div class="summary-body">
    <div class="summary-hospital">
      <div class="summary-hospital-mark">
        <img src="${logoSrc}" alt="" class="summary-hidden-asset" />
      </div>
      <div>
        <div
  class="summary-hospital-title"
  contenteditable="true"
>
  ${hospitalTitle || "APOLLO HOSPITALS ENTERPRISE LTD."}
</div>
        <div class="summary-hospital-line">${escHtml(hospitalAddressLine1)}</div>
        <div class="summary-hospital-line">${escHtml(hospitalAddressLine2)}</div>
        <div class="summary-contact-row">
          <span class="summary-contact-item"><span class="summary-contact-icon">&#9742;</span><span>${escHtml(hospitalPhone)}</span></span>
          <span class="summary-contact-item"><span class="summary-contact-icon">&#9993;</span><span>${escHtml(hospitalEmail)}</span></span>
        </div>
        <div class="summary-badges">
          <span class="summary-badge">NABH</span>
          <span class="summary-badge">NABL</span>
          <span class="summary-badge">JCI</span>
        </div>
      </div>
    </div>
    <div class="summary-meta">
      <div class="summary-title">DISCHARGE SUMMARY</div>
      <div class="summary-meta-row">
        <span class="summary-meta-label">UHID / IPD No.</span>
        <div 
  class="summary-meta-value"
  contenteditable="true"
>
  ${escHtml(documentUhid)}
</div>
      </div>
      <div class="summary-meta-row">
        <span class="summary-meta-label">Discharge Summary ID</span>
        <div 
  class="summary-meta-value"
  contenteditable="true"
>
  ${escHtml(dischargeSummaryId)}
</div>
      </div>
      <div class="summary-meta-row">
        <span class="summary-meta-label">Date of Document</span>
        <div 
  class="summary-meta-value"
  contenteditable="true"
>
  ${escHtml(documentDate)}
</div>
      </div>
    </div>
  </div>
  <div class="summary-footer">
    <div class="summary-footer-left">
      <span>&#9733;</span>
      <span>Kokoro AI &middot; Insurance-Ready Documentation</span>
    </div>
    <div class="summary-footer-right">Structured for Medi Assist &middot; Star Health &middot; Vidal Health &middot; HDFC Ergo TPA workflows</div>
  </div>
</div>

<!-- ══════════════════════ SECTION A: PRIMARY INSURED ══════════════════════ -->
<div class="patient-info-section">
  <div class="patient-info-section-title">1. Patient Information</div>
  <div class="patient-info-grid">
    ${patientInfoCellHtml("Patient Full Name", patientFullName)}
    ${patientInfoCellHtml("Age / Gender", patientAgeGender)}
    ${patientInfoCellHtml("UHID / IPD Number", documentUhid)}
    ${patientInfoCellHtml("Date of Admission", patientAdmissionDate)}
    ${patientInfoCellHtml("Date of Discharge", patientDischargeDate)}
    ${patientInfoCellHtml("Length of Stay", patientLengthOfStay, "patient-info-value-strong")}
    ${patientInfoCellHtml("Treating Doctor", patientTreatingDoctor)}
    ${patientInfoCellHtml("Department", patientDepartment)}
    ${patientInfoCellHtml("Room / Ward / Bed No.", patientRoomWardBed)}
    ${patientInfoCellHtml("Insurance Company", patientInsuranceCompany)}
    ${patientInfoCellHtml("TPA Name", patientTpaName)}
    ${patientInfoCellHtml("Policy Number", cleanField(f.policyNumber))}
  </div>
</div>

<!-- ══════════════════════ SECTION B: CLINICAL DETAILS ══════════════════════ -->

<div class="clinical-section">

  <div class="clinical-header">
    2. CLINICAL DETAILS
  </div>

  <div class="clinical-box">
    <div class="clinical-label">
      CHIEF COMPLAINTS
    </div>

    <div
      class="clinical-value"
      contenteditable="true"
    >
      ${escHtml(f.clinicalChiefComplaints || "")}
    </div>
  </div>

  <div class="clinical-box clinical-box-big">
    <div class="clinical-label">
      HISTORY OF PRESENT ILLNESS (HPI)
    </div>

    <div
      class="clinical-value"
      contenteditable="true"
    >
      ${escHtml(
        f.clinicalHpi || "",
      )}
    </div>
  </div>

  <div class="clinical-box">
    <div class="clinical-label">
      PAST MEDICAL HISTORY
    </div>

    <div
      class="clinical-value"
      contenteditable="true"
    >
      ${escHtml(f.clinicalPastHistory || "")}
    </div>
  </div>

  <div class="clinical-box">
    <div class="clinical-label">
      CO-MORBIDITIES
    </div>

    <div
      class="clinical-value"
      contenteditable="true"
    >
      ${escHtml(f.clinicalComorbidities || "")}
    </div>
  </div>

  <div class="clinical-diagnosis-row">

    <div class="clinical-diagnosis-box">

      <div class="clinical-diagnosis-top">
        <div class="clinical-label">
          PROVISIONAL DIAGNOSIS
        </div>

        <div class="clinical-icd">
          ICD-10
        </div>
      </div>

      <div
        class="clinical-diagnosis-value"
        contenteditable="true"
      >
        ${escHtml(f.clinicalProvisionalDiagnosis || "")}
      </div>

      <div
        class="clinical-icd-value"
        contenteditable="true"
      >
        ${escHtml(f.clinicalProvisionalICD || "")}
      </div>

    </div>

    <div class="clinical-diagnosis-box">

      <div class="clinical-diagnosis-top">
        <div class="clinical-label">
          FINAL DIAGNOSIS
        </div>

        <div class="clinical-icd">
          ICD-10
        </div>
      </div>

      <div
        class="clinical-diagnosis-value"
        contenteditable="true"
      >
        ${escHtml(f.clinicalFinalDiagnosis || "")}
      </div>

      <div
        class="clinical-icd-value"
        contenteditable="true"
      >
        ${escHtml(f.clinicalFinalICD || "")}
      </div>

    </div>

  </div>

</div>
<!-- ══════════════════════ SECTION C: INVESTIGATIONS & FINDINGS ══════════════════════ -->

<div class="clinical-section">

  <div class="clinical-header">
    3. INVESTIGATIONS & FINDINGS
  </div>

  <div
    style="
      display:grid;
      grid-template-columns:1fr 1fr;
      border-top:1px solid #d6dee8;
    "
  >

    <!-- CBC -->
    <div
      style="
        border-right:1px solid #d6dee8;
        border-bottom:1px solid #d6dee8;
        padding:10px 12px;
        min-height:62px;
      "
    >
      <div class="clinical-label">
        CBC / BLOOD REPORTS
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.investigationCbc ||
            "Hb: 11.2 g/dL, TLC: 8,400/μL, Platelets: 2.1L/μL\nRBS: 168 mg/dL, HbA1c: 7.4%",
        )}
      </div>
    </div>

    <!-- CARDIAC -->
    <div
      style="
        border-bottom:1px solid #d6dee8;
        padding:10px 12px;
        min-height:62px;
      "
    >
      <div class="clinical-label">
        CARDIAC MARKERS
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.investigationCardiac || "",
        )}
      </div>
    </div>

    <!-- ECG -->
    <div
      style="
        border-right:1px solid #d6dee8;
        border-bottom:1px solid #d6dee8;
        padding:10px 12px;
        min-height:62px;
      "
    >
      <div class="clinical-label">
        ECG FINDINGS
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.investigationEcg || "",
        )}
      </div>
    </div>

    <!-- 2D ECHO -->
    <div
      style="
        border-bottom:1px solid #d6dee8;
        padding:10px 12px;
        min-height:62px;
      "
    >
      <div class="clinical-label">
        2D ECHOCARDIOGRAM
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.investigationEcho || "",
        )}
      </div>
    </div>

    <!-- ANGIOGRAPHY -->
    <div
      style="
        border-right:1px solid #d6dee8;
        padding:10px 12px;
        min-height:62px;
      "
    >
      <div class="clinical-label">
        CORONARY ANGIOGRAPHY
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.investigationAngio || "",
        )}
      </div>
    </div>

    <!-- OTHER REPORTS -->
    <div
      style="
        padding:10px 12px;
        min-height:62px;
      "
    >
      <div class="clinical-label">
        OTHER REPORTS (CT/MRI/X-RAY ETC.)
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.investigationOther || "",
        )}
      </div>
    </div>

  </div>

</div>
<!-- ══════════════════════ SECTION D: TREATMENT & PROCEDURES ══════════════════════ -->

<div class="clinical-section">

  <div class="clinical-header">
    4. TREATMENT & PROCEDURES (INSURANCE-CRITICAL SECTION)
  </div>

  <!-- TREATMENT GIVEN -->
  <div
    style="
      border-bottom:1px solid #d6dee8;
      padding:10px 12px;
      min-height:76px;
    "
  >

    <div class="clinical-label">
      TREATMENT GIVEN
    </div>

    <div
      class="clinical-value"
      contenteditable="true"
    >
      ${escHtml(
        f.treatmentGiven || "",
      )}
    </div>

  </div>

  <!-- PROCEDURE -->
  <div
    style="
      border-bottom:1px solid #d6dee8;
      padding:10px 12px;
      min-height:70px;
      position:relative;
    "
  >

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:5px;
      "
    >

      <div class="clinical-label">
        PROCEDURE PERFORMED
      </div>

      <div
        style="
          font-size:6px;
          font-weight:bold;
          color:#1f4ea3;
          border:1px solid #b7c8ea;
          background:#f3f7ff;
          padding:2px 8px;
          border-radius:4px;
        "
      >
        CPT
      </div>

    </div>

    <div
      class="clinical-value"
      contenteditable="true"
      style="margin-bottom:6px;"
    >
      ${escHtml(
        f.procedurePerformed || "",
      )}
    </div>

    <div
      contenteditable="true"
      style="
        font-size:7px;
        font-weight:bold;
        color:#1f4ea3;
        outline:none;
      "
    >
      ${escHtml(f.procedureCpt || "")}
    </div>

  </div>

  <!-- GRID -->
  <div
    style="
      display:grid;
      grid-template-columns:1fr 1fr;
    "
  >

    <!-- SURGERY DATE -->
    <div
      style="
        border-right:1px solid #d6dee8;
        border-bottom:1px solid #d6dee8;
        padding:10px 12px;
        min-height:64px;
      "
    >

      <div class="clinical-label">
        SURGERY DATE & DURATION
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(f.surgeryDateDuration || "")}
      </div>

    </div>

    <!-- SURGEON -->
    <div
      style="
        border-bottom:1px solid #d6dee8;
        padding:10px 12px;
        min-height:64px;
      "
    >

      <div class="clinical-label">
        SURGEON / OPERATING TEAM
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.surgeonTeam || "",
        )}
      </div>

    </div>

    <!-- ICU -->
    <div
      style="
        border-right:1px solid #d6dee8;
        padding:10px 12px;
        min-height:72px;
      "
    >

      <div class="clinical-label">
        ICU STAY DETAILS
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.icuStay || "",
        )}
      </div>

    </div>

    <!-- NOTES -->
    <div
      style="
        padding:10px 12px;
        min-height:72px;
      "
    >

      <div class="clinical-label">
        OPERATIVE NOTES SUMMARY
      </div>

      <div
        class="clinical-value"
        contenteditable="true"
      >
        ${escHtml(
          f.operativeNotes || "",
        )}
      </div>

    </div>

  </div>

</div>

<!-- ══════════════════════ SECTION E: HOSPITAL COURSE SUMMARY ══════════════════════ -->

<div class="clinical-section">

  <div
    class="clinical-header"
    style="
      display:flex;
      justify-content:space-between;
      align-items:center;
    "
  >

    <div>
      5. HOSPITAL COURSE SUMMARY
    </div>

    <div
      style="
        font-size:6px;
        font-style:italic;
        font-weight:bold;
        opacity:0.9;
      "
    >
      (SUITABLE FOR AI GENERATION)
    </div>

  </div>

  <div
    style="
      padding:12px;
      min-height:132px;
      position:relative;
    "
  >

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:6px;
      "
    >

      <div class="clinical-label">
        CLINICAL PROGRESSION DURING ADMISSION
      </div>

      <div
        style="
          font-size:6px;
          font-weight:bold;
          color:#1f4ea3;
          border:1px solid #b7c8ea;
          background:#f3f7ff;
          padding:2px 8px;
          border-radius:4px;
        "
      >
        AI
      </div>

    </div>

    <div
      class="clinical-value"
      contenteditable="true"
      style="
        min-height:52px;
        line-height:1.55;
      "
    >
      ${escHtml(
        f.hospitalCourseSummary || "",
      )}
    </div>

  </div>

</div>

<!-- ══════════════════════ SECTION F: MEDICATIONS ══════════════════════ -->

<div class="clinical-section">

  <div class="clinical-header">
    6. MEDICATIONS DURING HOSPITALISATION
  </div>

  <table
    id="medicineTable"
    style="
      width:100%;
      border-collapse:collapse;
      table-layout:fixed;
    "
  >

    <thead>

      <tr
        style="
          background:#f4f6f9;
          border-bottom:1px solid #d6dee8;
        "
      >

        <th class="medicine-th">
          MEDICINE NAME
        </th>

        <th class="medicine-th">
          DOSAGE
        </th>

        <th class="medicine-th">
          ROUTE
        </th>

        <th class="medicine-th">
          FREQUENCY
        </th>

        <th class="medicine-th" style="border-right:none;">
          DURATION
        </th>

      </tr>

    </thead>

    <tbody id="medicineTableBody">
      ${inHospitalMedicationRows
        .map(
          (row) => `
      <tr class="medicine-row">
        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.name)}
        </td>

        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.dosage)}
        </td>

        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.route)}
        </td>

        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.frequency)}
        </td>

        <td class="medicine-td" contenteditable="true" style="border-right:none;">
          ${escHtml(row.duration)}
        </td>
      </tr>`,
        )
        .join("")}

    </tbody>

  </table>

  <div
    onclick="addMedicineRow()"
    style="
      padding:10px 12px 12px;
      font-size:8px;
      color:#4d67b2;
      cursor:pointer;
      user-select:none;
      width:fit-content;
    "
  >
    + Add Medicine
  </div>

</div>

<script>

function addMedicineRow() {

  const tbody = document.getElementById("medicineTableBody");

  const row = document.createElement("tr");

  row.className = "medicine-row";

  row.innerHTML = \`
  
    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Medicine name
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Dose
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Route
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Frequency
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true" style="border-right:none;">
      Duration
    </td>

  \`;

  tbody.appendChild(row);

  enableMedicinePlaceholder(row);

}

function enableMedicinePlaceholder(scope=document) {

  const cells = scope.querySelectorAll(".medicine-placeholder");

  cells.forEach((cell) => {

    const placeholder = cell.innerText;

    cell.addEventListener("focus", function () {

      if (this.innerText.trim() === placeholder) {

        this.innerText = "";
        this.style.color = "#111";

      }

    });

    cell.addEventListener("blur", function () {

      if (this.innerText.trim() === "") {

        this.innerText = placeholder;
        this.style.color = "#9aa8c2";

      }

    });

  });

}

window.addEventListener("load", () => {
  enableMedicinePlaceholder();
});

</script>
<!-- ══════════════════════ SECTION G: DISCHARGE MEDICATIONS ══════════════════════ -->

<div class="clinical-section">

  <div class="clinical-header">
    7. DISCHARGE MEDICATIONS (AT-HOME PRESCRIPTION)
  </div>

  <table
    id="dischargeMedicineTable"
    style="
      width:100%;
      border-collapse:collapse;
      table-layout:fixed;
    "
  >

    <thead>

      <tr
        style="
          background:#f4f6f9;
          border-bottom:1px solid #d6dee8;
        "
      >

        <th class="medicine-th">
          MEDICINE NAME
        </th>

        <th class="medicine-th">
          DOSAGE
        </th>

        <th class="medicine-th">
          ROUTE
        </th>

        <th class="medicine-th">
          FREQUENCY
        </th>

        <th class="medicine-th" style="border-right:none;">
          DURATION
        </th>

      </tr>

    </thead>

    <tbody id="dischargeMedicineTableBody">
      ${dischargeMedicationRows
        .map(
          (row) => `
      <tr class="medicine-row">
        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.name)}
        </td>

        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.dosage)}
        </td>

        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.route)}
        </td>

        <td class="medicine-td" contenteditable="true">
          ${escHtml(row.frequency)}
        </td>

        <td class="medicine-td" contenteditable="true" style="border-right:none;">
          ${escHtml(row.duration)}
        </td>
      </tr>`,
        )
        .join("")}

    </tbody>

  </table>

  <div
    onclick="addDischargeMedicineRow()"
    style="
      padding:10px 12px 12px;
      font-size:8px;
      color:#4d67b2;
      cursor:pointer;
      user-select:none;
      width:fit-content;
    "
  >
    + Add Medicine
  </div>

</div>

<script>

function addDischargeMedicineRow() {

  const tbody = document.getElementById("dischargeMedicineTableBody");

  const row = document.createElement("tr");

  row.className = "medicine-row";

  row.innerHTML = \`

    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Medicine name
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Dose
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Route
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true">
      Frequency
    </td>

    <td class="medicine-td medicine-placeholder" contenteditable="true" style="border-right:none;">
      Duration
    </td>

  \`;

  tbody.appendChild(row);

  enableDischargeMedicinePlaceholder(row);

}

function enableDischargeMedicinePlaceholder(scope=document) {

  const cells = scope.querySelectorAll(".medicine-placeholder");

  cells.forEach((cell) => {

    const placeholder = cell.innerText;

    cell.addEventListener("focus", function () {

      if (this.innerText.trim() === placeholder) {

        this.innerText = "";
        this.style.color = "#111";

      }

    });

    cell.addEventListener("blur", function () {

      if (this.innerText.trim() === "") {

        this.innerText = placeholder;
        this.style.color = "#9aa8c2";

      }

    });

  });

}

window.addEventListener("load", () => {
  enableDischargeMedicinePlaceholder();
});

</script>
<!-- ══════════════════════ SECTION H: DISCHARGE CONDITION ══════════════════════ -->

<div class="discharge-condition-section">

  <div class="discharge-condition-header">
    8. DISCHARGE CONDITION
  </div>

  <div class="discharge-condition-body">
    ${["Stable", "Improved", "Referred", "Critical", "DAMA", "Expired"]
      .map(
        (status) => `
    <div class="discharge-btn${dischargeCondition.toLowerCase() === status.toLowerCase() ? " active" : ""}">
      ${status}
    </div>`,
      )
      .join("")}

  </div>

</div>
<script>
document.addEventListener("DOMContentLoaded", () => {

  const dischargeBtns = document.querySelectorAll(".discharge-btn");

  dischargeBtns.forEach((btn) => {

    btn.addEventListener("click", () => {

      dischargeBtns.forEach((b) => {
        b.classList.remove("active");
      });

      btn.classList.add("active");

    });

  });

});
</script>
<!-- ───────── SECTION I : DISCHARGE ADVICE ───────── -->

<div class="discharge-advice-section">

  <div class="discharge-advice-header">
    9. DISCHARGE ADVICE
  </div>

  <div class="discharge-advice-grid">

    <!-- LEFT TOP -->
    <div class="discharge-advice-box">

      <div class="discharge-advice-label">
        FOLLOW-UP INSTRUCTIONS
      </div>

      <div
        class="discharge-advice-value"
        contenteditable="true"
      >
        ${multilineHtml(dischargeAdviceValues.followUpInstructions)}
      </div>

    </div>

    <!-- RIGHT TOP -->
    <div class="discharge-advice-box">

      <div class="discharge-advice-label">
        DIET ADVICE
      </div>

      <div
        class="discharge-advice-value"
        contenteditable="true"
      >
        ${multilineHtml(dischargeAdviceValues.dietAdvice)}
      </div>

    </div>

    <!-- LEFT MIDDLE -->
    <div class="discharge-advice-box">

      <div class="discharge-advice-label">
        ACTIVITY RESTRICTIONS
      </div>

      <div
        class="discharge-advice-value"
        contenteditable="true"
      >
        ${multilineHtml(dischargeAdviceValues.activityRestrictions)}
      </div>

    </div>

    <!-- RIGHT MIDDLE -->
    <div class="discharge-advice-box">

      <div class="discharge-advice-label">
        WARNING SIGNS – RETURN IMMEDIATELY IF:
      </div>

      <div
        class="discharge-advice-value"
        contenteditable="true"
      >
        ${multilineHtml(dischargeAdviceValues.warningSigns)}
      </div>

    </div>

    <!-- LEFT BOTTOM -->
    <div class="discharge-advice-box">

      <div class="discharge-advice-label">
        NEXT FOLLOW-UP DATE
      </div>

      <div
        class="discharge-advice-value"
        contenteditable="true"
      >
        ${multilineHtml(dischargeAdviceValues.nextFollowUpDate)}
      </div>

    </div>

    <!-- RIGHT BOTTOM -->
    <div class="discharge-advice-box">

      <div class="discharge-advice-label">
        REFERRING DOCTOR (IF APPLICABLE)
      </div>

      <div
        class="discharge-advice-value discharge-placeholder"
        contenteditable="true"
      >
        ${multilineHtml(dischargeAdviceValues.referringDoctor)}
      </div>

    </div>

  </div>

</div>
<!-- ───────── SECTION J : INSURANCE CLAIM VALIDATION CHECKLIST ───────── -->

<div class="claim-validation-section">

  <div class="claim-validation-header">
    10. KOKORO AI • INSURANCE CLAIM VALIDATION CHECKLIST
  </div>

  <div class="claim-validation-grid">
    ${claimValidationItems
      .map(
        (item) => `
    <div class="claim-validation-item">

      <div class="claim-validation-label">
        ${item.label}
      </div>

      <div class="claim-toggle-group">

        <button
          type="button"
          class="claim-toggle-btn${item.checked ? " active" : ""}"
          onclick="toggleClaimBtn(this)"
        >
          Yes
        </button>

        <button
          type="button"
          class="claim-toggle-btn${item.checked ? "" : " active no-btn"}"
          onclick="toggleClaimBtn(this)"
        >
          No
        </button>

      </div>

    </div>`,
      )
      .join("")}

  </div>

  <!-- BOTTOM AI ASSESSMENT -->

  <div class="claim-ai-assessment">

    <div class="claim-ai-icon">
      ✓
    </div>

    <div class="claim-ai-title">
      Kokoro AI Assessment:
    </div>

    <div class="claim-ai-text">
      ${multilineHtml(
        f.claimAiAssessment || "",
      )}
    </div>

  </div>

</div>

<script>

function toggleClaimBtn(button){

  const parent = button.parentElement;

  const buttons = parent.querySelectorAll(".claim-toggle-btn");

  buttons.forEach(btn=>{
    btn.classList.remove("active");
    btn.classList.remove("no-btn");
  });

  button.classList.add("active");

  if(button.innerText.trim() === "No"){
    button.classList.add("no-btn");
  }

}

</script>

<!-- ───────── SECTION K : DOCUMENTS ATTACHED ───────── -->

<div class="documents-section">

  <div class="documents-header">
    11. DOCUMENTS ATTACHED WITH DISCHARGE SUMMARY
  </div>

  <div class="documents-grid">

    <!-- LEFT COLUMN -->

    <div class="documents-column">
      ${dischargeDocuments
        .slice(0, 7)
        .map(
          (item) => `
      <label class="document-item">
        <input type="checkbox"${item.checked ? " checked" : ""} />
        <span class="custom-checkbox"></span>
        <span class="document-text">
          ${item.label}
        </span>
      </label>`,
        )
        .join("")}

    </div>

    <!-- RIGHT COLUMN -->

    <div class="documents-column">
      ${dischargeDocuments
        .slice(7)
        .map(
          (item) => `
      <label class="document-item">
        <input type="checkbox"${item.checked ? " checked" : ""} />
        <span class="custom-checkbox"></span>
        <span class="document-text">
          ${item.label}
        </span>
      </label>`,
        )
        .join("")}

    </div>

  </div>

</div>

<!-- ───────── SECTION L : AUTHORIZATION & ACKNOWLEDGEMENT ───────── -->

<div class="authorization-section">

  <div class="authorization-header">
    12. AUTHORIZATION & ACKNOWLEDGEMENT
  </div>

  <div class="authorization-grid">

    <!-- LEFT SIDE -->

    <div class="authorization-column">

      <div class="authorization-title">
        TREATING DOCTOR AUTHORIZATION
      </div>

      <div class="authorization-row">

        <div class="authorization-field">
          <div class="authorization-label">
            DOCTOR NAME
          </div>

          <div
            class="authorization-value"
            contenteditable="true"
          >
            ${multilineHtml(authorizationDoctorName)}
          </div>
        </div>

        <div class="authorization-field authorization-field-right">
          <div class="authorization-label">
            REG. NO. (NMC/MCI)
          </div>

          <div
            class="authorization-value"
            contenteditable="true"
          >
            ${multilineHtml(authorizationDoctorRegistration)}
          </div>
        </div>

      </div>

      <div class="authorization-row">

        <div class="authorization-field">
          <div class="authorization-label">
            DEPARTMENT
          </div>

          <div
            class="authorization-value"
            contenteditable="true"
          >
            ${multilineHtml(authorizationDepartment)}
          </div>
        </div>

        <div class="authorization-field authorization-field-right">
          <div class="authorization-label">
            DATE
          </div>

          <div
            class="authorization-value"
            contenteditable="true"
          >
            ${multilineHtml(authorizationDoctorDate)}
          </div>
        </div>

      </div>

      <div class="authorization-sign-box">
        Signature & Seal
      </div>

    </div>

    <!-- RIGHT SIDE -->

    <div class="authorization-column">

      <div class="authorization-title">
        PATIENT / ATTENDANT ACKNOWLEDGEMENT
      </div>

      <div class="authorization-row">

        <div class="authorization-field">
          <div class="authorization-label">
            PATIENT/ATTENDANT NAME
          </div>

          <div
            class="authorization-value"
            contenteditable="true"
          >
            ${multilineHtml(authorizationAttendantName)}
          </div>
        </div>

        <div class="authorization-field authorization-field-right">
          <div class="authorization-label">
            RELATION (IF ATTENDANT)
          </div>

          <div
            class="authorization-value authorization-placeholder"
            contenteditable="true"
          >
            ${multilineHtml(authorizationAttendantRelation)}
          </div>
        </div>

      </div>

      <div class="authorization-row">

        <div class="authorization-field">
          <div class="authorization-label">
            CONTACT NUMBER
          </div>

          <div
            class="authorization-value"
            contenteditable="true"
          >
            ${multilineHtml(authorizationAttendantContact)}
          </div>
        </div>

        <div class="authorization-field authorization-field-right">
          <div class="authorization-label">
            DATE
          </div>

          <div
            class="authorization-value"
            contenteditable="true"
          >
            ${multilineHtml(authorizationAttendantDate)}
          </div>
        </div>

      </div>

      <div class="authorization-sign-box">
        Signature / Thumb Impression
      </div>

    </div>

  </div>

</div>
<!-- ───────── SECTION M : FOOTER ───────── -->

<div class="document-footer">

  <div class="document-footer-line"></div>

  <div class="document-footer-content">

    <!-- LEFT SIDE -->

    <div class="document-footer-left">

      <div
        class="document-footer-hospital"
        contenteditable="true"
      >
        ${multilineHtml(footerHospitalName)}
      </div>

      <div
        class="document-footer-text"
        contenteditable="true"
      >
        ${multilineHtml(footerDocumentLine)}
      </div>

      <div
        class="document-footer-text"
        contenteditable="true"
      >
        ${multilineHtml(footerGeneratedLine)}
      </div>

    </div>

    <!-- RIGHT SIDE -->

    <div class="document-footer-right">

      <div class="document-footer-badge">
        ✦ Kokoro.Doctor AI
      </div>

      <div
        class="document-footer-right-text"
        contenteditable="true"
      >
        ${multilineHtml(footerRightLine1)}
      </div>

      <div
        class="document-footer-right-text"
        contenteditable="true"
      >
        ${multilineHtml(footerRightLine2)}
      </div>

    </div>

  </div>

</div>

</div>
</body>
</html>`;
}

/**
 * Download the filled insurance claim form as a PDF.
 * Web  → html2pdf.js renders the compact A4 HTML template directly
 * Mobile → expo-print (HTML string) → expo-sharing
 * @param {Object} form - the form state
 * @param {string | null} [signatureDataUrl] - optional PNG data URI from the e-sign capture
 * @param {string | null} [htmlOverride] - optional live HTML snapshot from the editable preview
 * @returns {Promise<void>}
 */
export async function downloadInsuranceClaim(
  form,
  signatureDataUrl = null,
  htmlOverride = null,
) {
  const patientName =
    String(form?.primaryName ?? "")
      .trim()
      .replace(/\s+/g, "_") || "Patient";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `InsuranceClaim_${patientName}_${date}.pdf`;

  // On native we can try to load the logo from assets at runtime.
  // On web the constant STAR_HEALTH_LOGO_DATA_URI is always available,
  // but getLogoBase64() gives us the freshest copy if the asset path is correct.
  let logoDataUrl = null;
  if (Platform.OS !== "web") {
    logoDataUrl = await getLogoBase64().catch(() => null);
  }

  const html =
    htmlOverride ||
    generateInsuranceFormHTML(form, signatureDataUrl, logoDataUrl);

  if (Platform.OS === "web") {
    let injectedStyle = null;
    let host = null;

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule?.default || html2pdfModule;
      if (typeof html2pdf !== "function") {
        throw new Error("html2pdf.js did not expose a callable export");
      }

      const parser = new DOMParser();
      const parsed = parser.parseFromString(html, "text/html");
      const styleEl = parsed.querySelector("style");
      const rootEl = parsed.querySelector(".insurance-form-root");
      if (!styleEl || !rootEl) {
        throw new Error(
          "Insurance form HTML is missing style or .insurance-form-root",
        );
      }

      injectedStyle = document.createElement("style");
      injectedStyle.setAttribute("data-insurance-pdf-export", "1");
      injectedStyle.textContent = styleEl.textContent;
      document.head.appendChild(injectedStyle);

      host = document.createElement("div");
      host.setAttribute("data-insurance-pdf-export", "1");
      host.style.cssText =
        "position:fixed;left:-9999px;top:0;width:210mm;min-height:297mm;background:#fff;";
      host.appendChild(document.importNode(rootEl, true));
      document.body.appendChild(host);

      const captureEl = host.firstElementChild;

      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "png", quality: 1 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(captureEl)
        .save();
    } catch (error) {
      console.error("Insurance claim PDF export failed on web:", error);
      if (!openPrintWindow(html)) {
        triggerBrowserFileDownload(
          new Blob([html], { type: "text/html" }),
          fileName.replace(/\.pdf$/i, ".html"),
        );
      }
    } finally {
      if (injectedStyle) injectedStyle.remove();
      if (host) host.remove();
    }
    return;
  }

  // Native (iOS / Android)
  const { uri } = await Print.printToFileAsync({ html });
  // eslint-disable-next-line import/namespace
  const destUri = `${FileSystem["documentDirectory"] ?? ""}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: destUri });
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (_) {}

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destUri, {
      mimeType: "application/pdf",
      dialogTitle: "Save or Share Insurance Claim PDF",
      UTI: "com.adobe.pdf",
    });
  } else {
    Alert.alert("Saved", `PDF saved to:\n${destUri}`);
  }
}

