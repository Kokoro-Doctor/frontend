/**
 * Medi Assist – Claim Form Part B (hospital section)
 * Pixel-matched to the scanned original.
 * UPDATED: Added injury/legal section (g through vi)
 */
import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
// Embedded logo for PDF/HTML rendering
const MEDI_ASSIST_LOGO_DATA_URI =
  "data:image/png;base64,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";

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * boxes(value, n, mode)
 *   "stretch" → boxes use flex:1, fill whatever space is available
 *   "fixed"   → each box is exactly 8px wide
 */
function boxes(value, n, mode = "fixed") {
  const padded = String(value ?? "")
    .padEnd(n, " ")
    .slice(0, n);
  const cls = mode === "stretch" ? "cb-s" : "cb-f";
  return (
    `<span class="${cls}">` +
    padded
      .split("")
      .map((ch) => `<span class="cb">${ch === " " ? "&nbsp;" : esc(ch)}</span>`)
      .join("") +
    `</span>`
  );
}

/**
 * dateBoxes(value, yearDigits)
 * Renders D D | M M | Y Y style boxes matching the original form.
 * value should be a string like "DDMMYY" (digits only).
 */
function dateBoxes(value, yearDigits = 2) {
  const raw = String(value ?? "").trim();
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  const digits = iso
    ? `${iso[3].padStart(2, "0")}${iso[2].padStart(2, "0")}${yearDigits === 2 ? iso[1].slice(-2) : iso[1]}`
    : dmy
      ? `${dmy[1].padStart(2, "0")}${dmy[2].padStart(2, "0")}${yearDigits === 2 ? dmy[3].slice(-2) : dmy[3].padStart(4, "0").slice(-4)}`
      : raw.replace(/\D/g, "").slice(0, 4 + yearDigits);
  const v = digits.padEnd(4 + yearDigits, " ");
  const d1 = v[0] || " ",
    d2 = v[1] || " ";
  const m1 = v[2] || " ",
    m2 = v[3] || " ";
  const y = v.slice(4, 4 + yearDigits).padEnd(yearDigits, " ");
  const sep = `<span class="date-sep">/</span>`;
  const box = (ch) =>
    `<span class="cb">${ch === " " ? "&nbsp;" : esc(ch)}</span>`;
  return (
    `<span class="cb-f">${box(d1)}${box(d2)}</span>${sep}` +
    `<span class="cb-f">${box(m1)}${box(m2)}</span>${sep}` +
    `<span class="cb-f">${y.split("").map(box).join("")}</span>`
  );
}

/**
 * timeBoxes(value) — renders H H | M M style boxes
 */
function timeBoxes(value) {
  const raw = String(value ?? "").trim();
  const hhmm = raw.match(/^(\d{1,2})[:.](\d{1,2})$/);
  const v = (hhmm
    ? `${hhmm[1].padStart(2, "0")}${hhmm[2].padStart(2, "0")}`
    : raw.replace(/\D/g, "").slice(0, 4)
  ).padEnd(4, " ");
  const box = (ch) =>
    `<span class="cb">${ch === " " ? "&nbsp;" : esc(ch)}</span>`;
  return (
    `<span class="cb-f">${box(v[0])}${box(v[1])}</span><span class="time-sep"></span>` +
    `<span class="cb-f">${box(v[2])}${box(v[3])}</span>`
  );
}

/** Square checkbox */
function chk(on) {
  return on
    ? `<span class="chk chk-on">&#10003;</span>`
    : `<span class="chk"></span>`;
}

/** Underlined free-text field */
function ul(value, w) {
  const style = w ? `min-width:${w}px` : `width:100%;display:block`;
  return `<span class="ul" style="${style}">${esc(value) || "&nbsp;"}</span>`;
}

/** Full-width underline block (for reason fields) */
function ulFull(value) {
  return `<div class="ul-full">${esc(value)}&nbsp;</div>`;
}

/** Right-side vertical section bar */
function bar(label) {
  return `<div class="bar"><div class="bar-line"></div><div class="bar-txt">${label}</div><div class="bar-line"></div></div>`;
}

function isYes(value) {
  if (value === true) return true;
  const v = String(value ?? "").trim().toLowerCase();
  return v === "yes" || v === "y" || v === "true";
}

function isNo(value) {
  if (value === false) return true;
  const v = String(value ?? "").trim().toLowerCase();
  return v === "no" || v === "n" || v === "false";
}

function gridBoxes(value, cols, rows = 1) {
  const text = String(value ?? "")
    .padEnd(cols * rows, " ")
    .slice(0, cols * rows);
  return Array.from({ length: rows }, (_, i) => {
    const slice = text.slice(i * cols, (i + 1) * cols);
    return `<div class="grid-box-row">${boxes(slice, cols)}</div>`;
  }).join("");
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export function generateCareHealthFormBHTML(form, signatureDataUrl = null) {
  const f = form ?? {};

  const diagLabels = [
    "i. Primary Diagnosis",
    "ii. Additional Diagnosis",
    "iii. Co-morbidities",
    "iv. Co-morbidities",
  ];
  const procLabels = [
    "i. Procedure 1:",
    "ii. Procedure 2:",
    "iii. Procedure 3:",
    "iv. Details of Procedure:",
  ];

  const diags = Array.from({ length: 4 }, (_, i) => {
    const r = f.diagnoses?.[i] ?? {};
    return { icd: r.icd10 ?? "", desc: r.description ?? "" };
  });
  const procs = Array.from({ length: 4 }, (_, i) => {
    const r = f.procedures?.[i] ?? {};
    return { icd: r.icd10pcs ?? "", desc: r.description ?? "" };
  });
  const pedComplication =
    f.pedComplication ??
    f.presentAilmentComplicationOfPed ??
    f.complicationOfPED ??
    f.complicationOfPed ??
    "";
  const pedDetails =
    f.pedDetails ??
    f.complicationDetails ??
    f.pedSpecifyDetails ??
    "";
  const preAuthObtained =
    f.preAuthObtained ??
    f.preAuthorizationObtained ??
    f.preauthorizationObtained ??
    "";
  const preAuthNumber =
    f.preAuthNumber ??
    f.preAuthorizationNumber ??
    f.preauthorizationNo ??
    f.preAuthorizationNo ??
    "";
  const noNetworkReason =
    f.noNetworkReason ??
    f.authorizationReason ??
    f.authorizationNotObtainedReason ??
    f.networkAuthorizationReason ??
    "";
  const procedureDetails = procs[3]?.desc || f.procedureDetails || "";
  const nonNetworkAddress =
    f.nonNetworkHospitalAddress ??
    f.addressOfHospital ??
    f.hospitalAddress ??
    f.address ??
    "";
  const nonNetworkCity =
    f.nonNetworkCity ??
    f.hospitalCity ??
    f.city ??
    "";
  const nonNetworkState =
    f.nonNetworkState ??
    f.hospitalState ??
    f.state ??
    "";
  const nonNetworkPinCode =
    f.nonNetworkPinCode ??
    f.pinCode ??
    f.pincode ??
    "";
  const nonNetworkContactNo =
    f.nonNetworkContactNo ??
    f.contactNo ??
    f.phoneNo ??
    "";
  const nonNetworkRegistrationNo =
    f.nonNetworkRegistrationNo ??
    f.nonNetworkRegistrationNoStateCode ??
    f.registrationNoStateCode ??
    "";
  const hospitalPan =
    f.hospitalPAN ??
    f.hospitalPan ??
    f.panNo ??
    f.pan ??
    "";
  const inpatientBeds =
    f.noOfInpatientBeds ??
    f.inpatientBeds ??
    f.numberOfInpatientBeds ??
    "";
  const otAvailable =
    f.otAvailable ??
    f.facilitiesOt ??
    f.hospitalOtAvailable ??
    "";
  const icuAvailable =
    f.icuAvailable ??
    f.facilitiesIcu ??
    f.hospitalIcuAvailable ??
    "";
  const otherFacilities =
    f.otherFacilities ??
    f.facilitiesOthers ??
    f.nonNetworkOtherFacilities ??
    "";

  const clLeft = [
    "Claim Form duly signed",
    "Original Pre-authorization request",
    "Copy of the Pre-authorization approval letter",
    "Copy of Photo ID Card of patient Verified by hospital",
    "Hospital Discharge summary",
    "Operation Theatre Notes",
    "Hospital main bill",
    "Hospital break-up bill",
  ];
  const clRight = [
    "Investigation reports",
    "CT/MRI/USG/HPE Investigation reports",
    "Doctor's reference slip for investigation",
    "ECG",
    "Pharmacy bills",
    "MLC reports & Police FIR",
    "Original death summary from hospital where applicable",
    "Any other, please specify",
  ];
  const cl = Array.isArray(f.claimDocChecklist)
    ? f.claimDocChecklist
    : Array(16).fill(false);

  const sig = String(signatureDataUrl ?? "").trim();
  const sigHtml = sig.startsWith("data:image/")
    ? `<div class="sig-box"><img src="${sig}" class="sig-img" alt=""/></div>`
    : `<div class="sig-box"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Claim Form – Part B</title>
<style>
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0; padding: 0; }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7px;
  color: #000;
  background: #fff;
}
.page {
  width: 210mm;
  min-height: 297mm;
  padding: 3mm;
  background: #fff;
  margin: 0 auto;
}

/* PART B HEADER */

.care-partb-header{
  padding:18px 18px 8px 18px;
  color:#4a4a4a;
}

.care-partb-title{
  font-size:17px;
  line-height:1;
  font-weight:500;
  color:#3e79bd;
  margin-bottom:6px;
  letter-spacing:0.1px;
}

.care-partb-subtitle{
  font-size:18px;
  line-height:1;
  font-weight:700;
  color:#2d2d2d;
  margin-bottom:22px;
}

.care-partb-points{
  display:flex;
  flex-direction:column;
  gap:8px;
}

.care-point-row{
  display:flex;
  align-items:flex-start;
}

.care-point-no{
  width:18px;
  flex-shrink:0;
  font-size:8px;
  line-height:1.35;
  color:#6a6a6a;
}

.care-point-text{
  font-size:8px;
  line-height:1.35;
  color:#6a6a6a;
  letter-spacing:0.05px;
}
  /* ═════════ SECTION A PERFECT ALIGNMENT ═════════ */

.secA-wrap{
  width:100%;
  margin-top:2px;
}

.secA-head{
  height:22px;
  background:#ece6bf;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:10px;
  font-weight:700;
  color:#3b3b3b;
}

.secA-body{
  padding:10px 10px 8px 10px;
}

.secA-row{
  display:flex;
  align-items:flex-start;
  margin-bottom:4px;
  min-height:24px;
  width:100%;
}

/* FIXED LABEL WIDTH */
.secA-label{
  width:240px;
  min-width:240px;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

/* PERFECT COLON ALIGNMENT */
.secA-colon{
  width:18px;
  min-width:18px;
  text-align:center;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
}

/* BOX AREA TAKES REMAINING SPACE */
.secA-box-row{
  flex:1;
  display:flex;
  align-items:flex-start;
  width:100%;
}

/* BOXES STRETCH PERFECTLY */
.secA-box-row .cb-s{
  display:flex;
  width:100%;
}

.secA-box-row .cb-s .cb{
  flex:1;
  min-width:0;
}

/* FIXED BOX STYLE */
.secA-box-row .cb-f{
  display:inline-flex;
}

.secA-box-row .cb{
  width:14px;
  height:14px;
  border:0.7px solid #a9a9a9;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  color:#222;
  background:#fff;
  flex-shrink:0;
}

.secA-box-row .cb:last-child{
  border-right:0.7px solid #a9a9a9;
}

/* NETWORK ROW */
.secA-row-network{
  align-items:center;
  min-height:30px;
}

.secA-network-wrap{
  display:flex;
  align-items:center;
  gap:18px;
  padding-top:1px;
  flex-wrap:nowrap;
}

.secA-check-item{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:8px;
  color:#4b4b4b;
}

.secA-check-item .chk{
  width:14px;
  height:14px;
  border:0.7px solid #b0b0b0;
}

.secA-note{
  font-size:8px;
  color:#4b4b4b;
  white-space:nowrap;
}

/* DOCTOR ROW */
.doctor-row{
  align-items:flex-start;
}

.doctor-block{
  flex:1;
  width:100%;
}

.doctor-sub-labels{
  display:flex;
  justify-content:space-around;
  padding-top:2px;
}

.doctor-sub-labels span{
  font-size:7px;
  color:#9a9a9a;
}

.chk{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:0.7px solid #a9a9a9;
  background:#fff;
  font-size:9px;
}

.chk-on{
  background:#fff;
  color:#000;
}

/* SECTION B */

.secB-wrap{
  width:100%;
  margin-top:6px;
}

.secB-head{
  height:22px;
  background:#ece6bf;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:10px;
  font-weight:700;
  color:#3b3b3b;
}

.secB-body{
  padding:10px 10px 8px 10px;
}

.secB-row{
  display:flex;
  align-items:flex-start;
  width:100%;
  margin-bottom:6px;
}

.secB-label{
  width:150px;
  min-width:150px;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secB-colon{
  width:18px;
  min-width:18px;
  text-align:center;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
}

.secB-field{
  flex:1;
  min-width:0;
}

.secB-box-row{
  display:flex;
  align-items:flex-start;
  width:100%;
}

.secB-box-row .cb-s{
  display:flex;
  width:100%;
}

.secB-box-row .cb-s .cb{
  flex:1;
  min-width:0;
}

.secB-box-row .cb-f{
  display:inline-flex;
}

.secB-box-row .cb{
  width:14px;
  height:14px;
  border:0.7px solid #a9a9a9;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  color:#222;
  background:#fff;
  flex-shrink:0;
}

.secB-box-row .cb:last-child{
  border-right:0.7px solid #a9a9a9;
}

.secB-sub-labels{
  display:flex;
  justify-content:space-around;
  padding-top:2px;
}

.secB-sub-labels span{
  font-size:7px;
  color:#9a9a9a;
}

.secB-triple-row{
  display:flex;
  align-items:flex-start;
  gap:14px;
  width:100%;
}

.secB-triple-col{
  display:flex;
  align-items:center;
  min-height:18px;
}

.secB-triple-col-grow{
  flex:1;
  min-width:0;
}

.secB-inline-label{
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secB-inline-colon{
  width:12px;
  min-width:12px;
  text-align:center;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
}

.secB-check-group{
  display:flex;
  align-items:center;
  gap:14px;
  white-space:nowrap;
}

.secB-check-item{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:8px;
  color:#4b4b4b;
}

.secB-check-item .chk{
  width:14px;
  height:14px;
}

.secB-date-group{
  display:flex;
  align-items:center;
  white-space:nowrap;
}

.secB-date-group .cb-f{
  display:inline-flex;
}

.secB-date-group .cb{
  width:14px;
  height:14px;
  border:0.7px solid #a9a9a9;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  color:#222;
  background:#fff;
  flex-shrink:0;
}

.secB-date-group .cb:last-child{
  border-right:0.7px solid #a9a9a9;
}

.date-sep{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:10px;
  height:14px;
  font-size:9px;
  line-height:14px;
  color:#7f7f7f;
}

.time-sep{
  display:inline-block;
  width:10px;
}

.secB-hint{
  margin-left:6px;
  font-size:7px;
  color:#9a9a9a;
  white-space:nowrap;
}

.secB-split-row{
  display:flex;
  align-items:flex-start;
  gap:18px;
  width:100%;
}

.secB-split-col{
  display:flex;
  align-items:center;
  flex:1;
  min-width:0;
}

.secB-type-row{
  display:flex;
  align-items:center;
  gap:26px;
  white-space:nowrap;
}

.secB-gravida-line{
  display:block;
  min-width:290px;
  height:14px;
  border-bottom:0.7px solid #7f7f7f;
}

.secB-discharge-row{
  display:flex;
  align-items:center;
  gap:24px;
  white-space:nowrap;
}


/* SECTION C */

.secC-wrap{
  width:100%;
  margin-top:6px;
}

.secC-head{
  height:22px;
  background:#ece6bf;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:10px;
  font-weight:700;
  color:#3b3b3b;
}

.secC-body{
  padding:10px 10px 8px 10px;
}

.secC-group{
  display:flex;
  align-items:flex-start;
  width:100%;
  margin-bottom:8px;
}

.secC-group-letter{
  width:26px;
  min-width:26px;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
}

.secC-group-body{
  flex:1;
  min-width:0;
}

.secC-item-row{
  display:flex;
  align-items:center;
  width:100%;
  min-height:22px;
  margin-bottom:2px;
}

.secC-item-row:last-child{
  margin-bottom:0;
}

.secC-item-label{
  width:170px;
  min-width:170px;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secC-colon{
  width:12px;
  min-width:12px;
  text-align:center;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
}

.secC-code-label{
  width:86px;
  min-width:86px;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secC-code-box{
  width:62px;
  min-width:62px;
  display:flex;
  align-items:center;
}

.secC-code-box .cb-f{
  display:inline-flex;
}

.secC-code-box .cb{
  width:14px;
  height:14px;
  border:0.7px solid #a9a9a9;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  color:#222;
  background:#fff;
  flex-shrink:0;
}

.secC-code-box .cb:last-child{
  border-right:0.7px solid #a9a9a9;
}

.secC-desc{
  display:flex;
  align-items:center;
  flex:1;
  min-width:0;
}

.secC-desc-label{
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secC-line{
  display:block;
  flex:1;
  min-width:0;
  height:14px;
  border-bottom:0.7px solid #7f7f7f;
  font-size:8px;
  line-height:14px;
  color:#4b4b4b;
  overflow:hidden;
  white-space:nowrap;
}

.secC-line-short{
  width:126px;
  min-width:126px;
  flex:none;
}

.secC-line-long{
  width:100%;
}

.secC-desc-right{
  margin-left:auto;
  flex:none;
}

.secC-full-row{
  display:flex;
  align-items:center;
  width:100%;
  min-height:24px;
  margin-bottom:6px;
}

.secC-full-row:last-child{
  margin-bottom:0;
}

.secC-label{
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secC-check-row{
  display:flex;
  align-items:center;
  gap:16px;
  margin-left:8px;
  white-space:nowrap;
}

.secC-check-item{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:8px;
  color:#4b4b4b;
}

.secC-check-item .chk{
  width:14px;
  height:14px;
}

.secC-stacked-line{
  display:flex;
  flex-direction:column;
  gap:8px;
  width:100%;
  margin-top:2px;
}

.secC-box-row{
  display:flex;
  align-items:center;
}

.secC-box-row .cb-s{
  display:flex;
  width:100%;
}

.secC-box-row .cb-s .cb{
  flex:1;
  min-width:0;
}

.secC-box-row .cb-f{
  display:inline-flex;
}

.secC-box-row .cb{
  width:14px;
  height:14px;
  border:0.7px solid #a9a9a9;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  color:#222;
  background:#fff;
  flex-shrink:0;
}

.secC-box-row .cb:last-child{
  border-right:0.7px solid #a9a9a9;
}

/* INJURY SECTION STYLES */

.secC-injury-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 8px;
  min-height: 22px;
}

.secC-injury-label {
  width: 190px;
  min-width: 190px;
  font-size: 8px;
  line-height: 18px;
  color: #4b4b4b;
  white-space: nowrap;
}

.secC-injury-colon {
  width: 12px;
  min-width: 12px;
  text-align: center;
  font-size: 8px;
  line-height: 18px;
  color: #4b4b4b;
}

.secC-injury-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.secC-injury-multi-check {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  white-space: nowrap;
}

.secC-injury-check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 8px;
  color: #4b4b4b;
  white-space: nowrap;
}

.secC-injury-check-item .chk {
  width: 14px;
  height: 14px;
  border: 0.7px solid #a9a9a9;
}

.secC-injury-hint {
  font-size: 7px;
  color: #9a9a9a;
  font-style: italic;
  white-space: nowrap;
}

.secC-injury-fir-boxes {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.secC-injury-fir-boxes .cb-f {
  display: inline-flex;
  gap: 0;
}

.secC-injury-fir-boxes .cb {
  width: 14px;
  height: 14px;
  border: 0.7px solid #a9a9a9;
  border-right: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-family: monospace;
  color: #222;
  background: #fff;
  flex-shrink: 0;
}

.secC-injury-fir-boxes .cb:last-child {
  border-right: 0.7px solid #a9a9a9;
}

.secC-injury-reason-line {
  flex: 1;
  min-width: 0;
  height: 14px;
  border-bottom: 0.7px solid #7f7f7f;
  font-size: 8px;
  line-height: 14px;
  color: #4b4b4b;
  overflow: hidden;
  white-space: nowrap;
}
  /* ───────── PAGE FOOTER ───────── */

.section-footer{
  margin-top:auto;
  padding-top:4px;
}

.section-footer-top-line{
  border-top:1px solid #a8a8a8;
  width:100%;
  margin-bottom:4px;
}

.section-footer-content{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}

.section-footer-left{
  flex:1;
  color:#555;
}

.section-footer-row1{
  font-size:12px;
  line-height:1.1;
  font-weight:700;
  color:#4d4d4d;
}

.section-footer-row1 span{
  font-weight:400;
}

.section-footer-row2{
  font-size:8px;
  line-height:1.2;
  color:#555;
}

.section-footer-row3{
  font-size:8px;
  line-height:1.2;
  color:#555;
}

.section-footer-row4{
  font-size:10px;
  line-height:1.2;
  color:#555;
}

.section-footer-irdai{
  margin-left:12px;
}

.section-footer-page{
  width:46px;
  text-align:right;
  font-size:8px;
  color:#555;
  padding-top:10px;
  white-space:nowrap;
}
  /* SECTION D */

.secD-wrap{
  width:100%;
  margin-top:8px;
}

.secD-head{
  height:22px;
  background:#ece6bf;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:10px;
  font-weight:700;
  color:#3b3b3b;
}

.secD-body{
  padding:8px 10px 4px 10px;
}

.secD-grid{
  display:flex;
  gap:46px;
  width:100%;
}

.secD-col{
  flex:1;
}

.secD-row{
  display:flex;
  align-items:center;
  min-height:28px;
}

.secD-index{
  width:42px;
  min-width:42px;
  font-size:8px;
  color:#4b4b4b;
}

.secD-label{
  flex:1;
  min-width:0;
  font-size:8px;
  line-height:1.2;
  color:#4b4b4b;
}

.secD-colon{
  width:14px;
  min-width:14px;
  text-align:center;
  font-size:8px;
  color:#4b4b4b;
}

.secD-box{
  width:18px;
  height:18px;
  border:0.7px solid #b7b7b7;
  background:#fff;
  flex-shrink:0;
}

.secD-other-line{
  display:inline-block;
  width:150px;
  border-bottom:0.7px solid #666;
  height:10px;
  vertical-align:middle;
  margin-left:3px;
}
  

/* SECTION E */

.secE-wrap{
  width:100%;
  margin-top:6px;
}

.secE-head{
  min-height:22px;
  background:#ece6bf;
  display:flex;
  align-items:center;
  padding:3px 10px;
  font-size:10px;
  font-weight:700;
  color:#3b3b3b;
}

.secE-body{
  padding:10px 10px 8px 10px;
}

.secE-row{
  display:flex;
  align-items:flex-start;
  width:100%;
  margin-bottom:6px;
}

.secE-label{
  width:320px;
  min-width:240px;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secE-label-narrow{
  width:210px;
  min-width:210px;
}

.secE-colon{
  width:18px;
  min-width:18px;
  text-align:center;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
}

.secE-field{
  flex:1;
  min-width:0;
}

.secE-box-row{
  display:flex;
  align-items:center;
}

.secE-box-row .cb-f{
  display:inline-flex;
}

.secE-box-row .cb{
  width:14px;
  height:14px;
  border:0.7px solid #a9a9a9;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  color:#222;
  background:#fff;
  flex-shrink:0;
}

.secE-box-row .cb:last-child{
  border-right:0.7px solid #a9a9a9;
}

.grid-box-row{
  display:flex;
  align-items:center;
  margin-bottom:-0.7px;
}

.grid-box-row:last-child{
  margin-bottom:0;
}

.grid-box-row .cb-f{
  display:inline-flex;
}

.grid-box-row .cb{
  width:14px;
  height:14px;
  border:0.7px solid #a9a9a9;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  color:#222;
  background:#fff;
  flex-shrink:0;
}

.grid-box-row .cb:last-child{
  border-right:0.7px solid #a9a9a9;
}

.secE-address-grid{
  display:flex;
  flex-direction:column;
}

.secE-split-row{
  display:flex;
  align-items:flex-start;
  width:100%;
  margin-left:-208px;
}

.secE-city-state{
  width:432px;
  min-width:432px;
}

.secE-pin-block{
  margin-left:20px;
  display:flex;
  align-items:center;
  padding-top:18px;
}

.secE-inline-label{
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secE-inline-colon{
  width:12px;
  min-width:12px;
  text-align:center;
  font-size:8px;
  line-height:18px;
  color:#4b4b4b;
}

.secE-two-col{
  display:flex;
  align-items:flex-start;
  gap:28px;
  width:100%;
}

.secE-left-col{
  flex:1;
  min-width:0;
}

.secE-right-col{
  width:360px;
  min-width:360px;
  margin-top:24px;
}

.secE-inline-row{
  display:flex;
  align-items:center;
  min-height:24px;
  margin-bottom:6px;
}

.secE-inline-row:last-child{
  margin-bottom:0;
}

.secE-check-wrap{
  display:flex;
  align-items:center;
  gap:12px;
  white-space:nowrap;
}

.secE-check-item{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:8px;
  color:#4b4b4b;
}

.secE-check-item .chk{
  width:14px;
  height:14px;
}

.secE-others-row{
  display:flex;
  align-items:center;
  margin-top:2px;
}

.secE-line{
  display:block;
  flex:1;
  min-width:0;
  height:14px;
  border-bottom:0.7px solid #7f7f7f;
  font-size:8px;
  line-height:14px;
  color:#4b4b4b;
  overflow:hidden;
  white-space:nowrap;
}

/* SECTION F */

.secF-wrap{
  width:100%;
  margin-top:8px;
}

.secF-head{
  height:22px;
  background:#ece6bf;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:10px;
  font-weight:700;
  color:#3b3b3b;
}

.secF-body{
  padding:6px 12px 10px 12px;
}

.secF-note{
  font-size:8px;
  color:#9a9a9a;
  margin-bottom:6px;
}

.secF-para{
  font-size:8px;
  line-height:1.35;
  color:#4b4b4b;
  margin-bottom:22px;
}

.secF-bottom{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  width:100%;
}

.secF-left{
  width:52%;
}

.secF-right{
  width:40%;
  padding-top:2px;
}

.secF-row{
  display:flex;
  align-items:center;
  margin-bottom:18px;
}

.secF-label{
  font-size:8px;
  color:#4b4b4b;
  white-space:nowrap;
}

.secF-colon{
  width:14px;
  min-width:14px;
  text-align:center;
  font-size:8px;
  color:#4b4b4b;
}

.secF-date{
  display:flex;
  align-items:center;
}

.secF-date .cb-f{
  display:inline-flex;
}

.secF-date .cb{
  width:18px;
  height:18px;
  border:0.7px solid #b3b3b3;
  border-right:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  font-family:monospace;
  background:#fff;
}

.secF-date .cb:last-child{
  border-right:0.7px solid #b3b3b3;
}

.secF-date-sep{
  width:12px;
  text-align:center;
  font-size:10px;
  color:#7b7b7b;
}

.secF-hint{
  margin-left:8px;
  font-size:8px;
  color:#a0a0a0;
  white-space:nowrap;
}

.secF-place-line{
  width:270px;
  border-bottom:1px solid #666;
  height:12px;
}

.secF-sign-row{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  margin-top:2px;
}

.secF-sign-line{
  width:148px;
  border-bottom:1px solid #666;
  height:12px;
}

</style>
</head>
<body>
<div class="page">

<!-- PART B HEADER -->

<div class="care-partb-header">

  <div class="care-partb-title">
    Claim Form - 'CARE'
  </div>

  <div class="care-partb-subtitle">
    Part B
  </div>

  <div class="care-partb-points">

    <div class="care-point-row">
      <span class="care-point-no">1.</span>
      <span class="care-point-text">
        To be filled in by the hospital.
      </span>
    </div>

    <div class="care-point-row">
      <span class="care-point-no">2.</span>
      <span class="care-point-text">
        The issue of this Form is not to be taken as an admission of liability.
      </span>
    </div>

    <div class="care-point-row">
      <span class="care-point-no">3.</span>
      <span class="care-point-text">
        Please include the original pre-authorization request form in lieu of PART A.
      </span>
    </div>

    <div class="care-point-row">
      <span class="care-point-no">4.</span>
      <span class="care-point-text">
        To be filled in block letters.
      </span>
    </div>

  </div>

</div>

<!-- ══════════ SECTION A ══════════ -->

<div class="secA-wrap">

  <div class="secA-head">
    Section A - Details of Hospital
  </div>

  <div class="secA-body">

    <!-- a -->
    <div class="secA-row">
      <div class="secA-label">a)&nbsp;&nbsp;Name of the Hospital</div>
      <div class="secA-colon">:</div>

      <div class="secA-box-row stretch">
        ${boxes(f.hospitalName, 34)}
      </div>
    </div>

    <!-- b -->
    <div class="secA-row">
      <div class="secA-label">b)&nbsp;&nbsp;Hospital ID</div>
      <div class="secA-colon">:</div>

      <div class="secA-box-row stretch">
        ${boxes(f.hospitalId, 34)}
      </div>
    </div>

    <!-- c -->
    <div class="secA-row secA-row-network">

      <div class="secA-label">c)&nbsp;&nbsp;Type of Hospital</div>
      <div class="secA-colon">:</div>

      <div class="secA-network-wrap">

        <div class="secA-check-item">
          ${chk(f.hospitalNetwork === "network")}
          <span>Network</span>
        </div>

        <div class="secA-check-item nonnet">
          ${chk(f.hospitalNetwork === "non_network")}
          <span>Non-network</span>
        </div>

        <div class="secA-note">
          (if non-network fill section E)
        </div>

      </div>

    </div>

    <!-- d -->
    <div class="secA-row doctor-row">

      <div class="secA-label">
        d)&nbsp;&nbsp;Name of the treating doctor
      </div>

      <div class="secA-colon">:</div>

      <div class="doctor-block">

        <div class="secA-box-row stretch">
          ${boxes(
            [f.treatingDoctorSurname, f.treatingDoctorFirst, f.treatingDoctorMiddle]
              .filter(Boolean)
              .join(" "),
            34,
          )}
        </div>

        <div class="doctor-sub-labels">
          <span>(Surname)</span>
          <span>(First Name)</span>
          <span>(Middle Name)</span>
        </div>

      </div>

    </div>

    <!-- e -->
    <div class="secA-row">
      <div class="secA-label">e)&nbsp;&nbsp;Qualification</div>
      <div class="secA-colon">:</div>

      <div class="secA-box-row stretch">
        ${boxes(f.qualification, 34)}
      </div>
    </div>

    <!-- f -->
    <div class="secA-row">
      <div class="secA-label">
        f)&nbsp;&nbsp;Registration No. with State Code
      </div>

      <div class="secA-colon">:</div>

      <div class="secA-box-row stretch">
        ${boxes(f.registrationNoStateCode, 34)}
      </div>
    </div>

    <!-- g -->
    <div class="secA-row">
      <div class="secA-label">g)&nbsp;&nbsp;Contact No.</div>
      <div class="secA-colon">:</div>

      <div class="secA-box-row stretch">
        ${boxes(f.phoneNo, 34)}
      </div>
    </div>

  </div>

</div>

<!-- SECTION B -->

<div class="secB-wrap">

  <div class="secB-head">
    Section B - Details of the Patient Admitted
  </div>

  <div class="secB-body">

    <!-- a -->
    <div class="secB-row">
      <div class="secB-label">a)&nbsp;&nbsp;Name of the Patient</div>
      <div class="secB-colon">:</div>

      <div class="secB-field">
        <div class="secB-box-row stretch">
          ${boxes(
            [f.patientSurname, f.patientFirst, f.patientMiddle]
              .filter(Boolean)
              .join(" "),
            42,
          )}
        </div>

        <div class="secB-sub-labels">
          <span>(Surname)</span>
          <span>(First Name)</span>
          <span>(Middle Name)</span>
        </div>
      </div>
    </div>

    <!-- b -->
    <div class="secB-row">
      <div class="secB-label">b)&nbsp;&nbsp;IP Registration No.</div>
      <div class="secB-colon">:</div>

      <div class="secB-box-row stretch">
        ${boxes(f.ipRegNumber, 28)}
      </div>
    </div>

    <!-- c d e -->
    <div class="secB-row">
      <div class="secB-triple-row">

        <div class="secB-triple-col" style="width:165px;min-width:165px;">
          <div class="secB-inline-label">c)&nbsp;&nbsp;Gender</div>
          <div class="secB-inline-colon">:</div>

          <div class="secB-check-group">
            <div class="secB-check-item">
              ${chk(f.gender === "male")}
              <span>M</span>
            </div>

            <div class="secB-check-item">
              ${chk(f.gender === "female")}
              <span>F</span>
            </div>
          </div>
        </div>

        <div class="secB-triple-col" style="width:210px;min-width:210px;">
          <div class="secB-inline-label">d)&nbsp;&nbsp;Age</div>
          <div class="secB-inline-colon">:</div>

          <div class="secB-date-group">
            ${boxes(f.ageYears, 2)}
            <span class="date-sep">/</span>
            ${boxes(f.ageMonths, 2)}
            <span class="secB-hint">(YY / MM)</span>
          </div>
        </div>

        <div class="secB-triple-col secB-triple-col-grow">
          <div class="secB-inline-label">e)&nbsp;&nbsp;Date of Birth</div>
          <div class="secB-inline-colon">:</div>

          <div class="secB-date-group">
            ${dateBoxes(f.dob, 4)}
            <span class="secB-hint">(DD/MM/YYYY)</span>
          </div>
        </div>

      </div>
    </div>

    <!-- f g -->
    <div class="secB-row">
      <div class="secB-split-row">

        <div class="secB-split-col">
          <div class="secB-inline-label">f)&nbsp;&nbsp;Date of Admission</div>
          <div class="secB-inline-colon">:</div>

          <div class="secB-date-group">
            ${dateBoxes(f.admissionDate, 4)}
            <span class="secB-hint">(DD/MM/YYYY)</span>
          </div>
        </div>

        <div class="secB-split-col" style="justify-content:flex-end;">
          <div class="secB-inline-label">g)&nbsp;&nbsp;Time of Admission</div>
          <div class="secB-inline-colon">:</div>

          <div class="secB-date-group">
            ${timeBoxes(f.admissionTime)}
            <span class="secB-hint">(HH:MM)</span>
          </div>
        </div>

      </div>
    </div>

    <!-- h i -->
    <div class="secB-row">
      <div class="secB-split-row">

        <div class="secB-split-col">
          <div class="secB-inline-label">h)&nbsp;&nbsp;Date of Discharge</div>
          <div class="secB-inline-colon">:</div>

          <div class="secB-date-group">
            ${dateBoxes(f.dischargeDate, 4)}
            <span class="secB-hint">(DD/MM/YYYY)</span>
          </div>
        </div>

        <div class="secB-split-col" style="justify-content:flex-end;">
          <div class="secB-inline-label">i)&nbsp;&nbsp;Time of Discharge</div>
          <div class="secB-inline-colon">:</div>

          <div class="secB-date-group">
            ${timeBoxes(f.dischargeTime)}
            <span class="secB-hint">(HH:MM)</span>
          </div>
        </div>

      </div>
    </div>

    <!-- j) Type of Admission -->
<div class="secB-row">

  <div class="secB-inline-label">
    j)&nbsp;&nbsp;Type of Admission
  </div>

  <div class="secB-inline-colon">:</div>

  <div class="secB-type-row">

    <div class="secB-check-item">
      ${chk(f.typeOfAdmission === "emergency")}
      <span>Emergency</span>
    </div>

    <div class="secB-check-item">
      ${chk(f.typeOfAdmission === "planned")}
      <span>Planned</span>
    </div>

    <div class="secB-check-item">
      ${chk(f.typeOfAdmission === "day_care")}
      <span>Day Care</span>
    </div>

    <div class="secB-check-item">
      ${chk(f.typeOfAdmission === "maternity")}
      <span>Maternity</span>
    </div>

  </div>

</div>

<!-- k) If Maternity -->
<div class="secB-row" style="margin-top:-2px;">

  <div class="secB-inline-label">
    k)&nbsp;&nbsp;If Maternity,
  </div>

</div>

<!-- delivery + gravida -->
<div class="secB-row">

  <div class="secB-split-row">

    <div class="secB-split-col">

      <div class="secB-inline-label">
        (i)&nbsp;&nbsp;Date of Delivery
      </div>

      <div class="secB-inline-colon">:</div>

      <div class="secB-date-group">
        ${dateBoxes(f.dateOfDelivery, 4)}
      </div>

      <span class="secB-hint">(DD/MM/YYYY)</span>

    </div>

    <div class="secB-split-col">

      <div class="secB-inline-label">
        (ii)&nbsp;&nbsp;Gravida Status
      </div>

      <div class="secB-inline-colon">:</div>

      <span class="secB-gravida-line"></span>

    </div>

  </div>

</div>
    <!-- l -->
    <div class="secB-row">
      <div class="secB-label">l)&nbsp;&nbsp;Status at the time of discharge</div>
      <div class="secB-colon">:</div>

      <div class="secB-discharge-row">
        <div class="secB-check-item">
          ${chk(f.dischargeStatus === "home")}
          <span>Discharge to home</span>
        </div>

        <div class="secB-check-item">
          ${chk(f.dischargeStatus === "another_hospital")}
          <span>Discharge to another hospital</span>
        </div>

        <div class="secB-check-item">
          ${chk(f.dischargeStatus === "deceased")}
          <span>Deceased</span>
        </div>
      </div>
    </div>

    <!-- m -->
    <div class="secB-row" style="margin-bottom:0;">
      <div class="secB-label">m)&nbsp;&nbsp;Total Claimed Amount</div>
      <div class="secB-colon">:</div>

      <div class="secB-box-row">
        ${boxes(String(f.totalClaimedAmount ?? "").replace(/\D/g, ""), 6)}
      </div>
    </div>

  </div>

</div>

<!-- SECTION C -->

<div class="secC-wrap">

  <div class="secC-head">
    Section C - Details of Ailment Diagnosed (Primary)
  </div>

  <div class="secC-body">

    <div class="secC-group">
      <div class="secC-group-letter">a)</div>

      <div class="secC-group-body">

        <div class="secC-item-row">
          <div class="secC-item-label">(i)&nbsp;&nbsp;Primary Diagnosis</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-label">ICD 10 Code</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-box">${boxes(diags[0].icd, 4)}</div>

          <div class="secC-desc secC-desc-right">
            <span class="secC-desc-label">Description</span>
            <span class="secC-colon">:</span>
            <span class="secC-line secC-line-short">${esc(diags[0].desc) || "&nbsp;"}</span>
          </div>
        </div>

        <div class="secC-item-row">
          <div class="secC-item-label">(ii)&nbsp;&nbsp;Additional Diagnosis</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-label">ICD 10 Code</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-box">${boxes(diags[1].icd, 4)}</div>

          <div class="secC-desc">
            <span class="secC-desc-label">Description</span>
            <span class="secC-colon">:</span>
            <span class="secC-line secC-line-long">${esc(diags[1].desc) || "&nbsp;"}</span>
          </div>
        </div>

        <div class="secC-item-row">
          <div class="secC-item-label">(iii)&nbsp;&nbsp;Co-morbidities</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-label">ICD 10 Code</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-box">${boxes(diags[2].icd, 4)}</div>

          <div class="secC-desc secC-desc-right">
            <span class="secC-desc-label">Description</span>
            <span class="secC-colon">:</span>
            <span class="secC-line secC-line-short">${esc(diags[2].desc) || "&nbsp;"}</span>
          </div>
        </div>

        <div class="secC-item-row">
          <div class="secC-item-label">(iv)&nbsp;&nbsp;Co-morbidities</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-label">ICD 10 Code</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-box">${boxes(diags[3].icd, 4)}</div>

          <div class="secC-desc secC-desc-right">
            <span class="secC-desc-label">Description</span>
            <span class="secC-colon">:</span>
            <span class="secC-line secC-line-short">${esc(diags[3].desc) || "&nbsp;"}</span>
          </div>
        </div>

      </div>
    </div>

    <div class="secC-group">
      <div class="secC-group-letter">b)</div>

      <div class="secC-group-body">

        <div class="secC-item-row">
          <div class="secC-item-label">(i)&nbsp;&nbsp;Procedure 1</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-label">ICD 10 Code</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-box">${boxes(procs[0].icd, 4)}</div>

          <div class="secC-desc">
            <span class="secC-desc-label">Description</span>
            <span class="secC-colon">:</span>
            <span class="secC-line secC-line-long">${esc(procs[0].desc) || "&nbsp;"}</span>
          </div>
        </div>

        <div class="secC-item-row">
          <div class="secC-item-label">(ii)&nbsp;&nbsp;Procedure 2</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-label">ICD 10 Code</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-box">${boxes(procs[1].icd, 4)}</div>

          <div class="secC-desc">
            <span class="secC-desc-label">Description</span>
            <span class="secC-colon">:</span>
            <span class="secC-line secC-line-long">${esc(procs[1].desc) || "&nbsp;"}</span>
          </div>
        </div>

        <div class="secC-item-row">
          <div class="secC-item-label">(iii)&nbsp;&nbsp;Procedure 3</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-label">ICD 10 Code</div>
          <div class="secC-colon">:</div>
          <div class="secC-code-box">${boxes(procs[2].icd, 4)}</div>

          <div class="secC-desc">
            <span class="secC-desc-label">Description</span>
            <span class="secC-colon">:</span>
            <span class="secC-line secC-line-long">${esc(procs[2].desc) || "&nbsp;"}</span>
          </div>
        </div>

        <div class="secC-full-row">
          <div class="secC-label">(iv)&nbsp;&nbsp;Details of Procedure</div>
          <div class="secC-colon">:</div>
          <span class="secC-line secC-line-long">${esc(procedureDetails) || "&nbsp;"}</span>
        </div>

      </div>
    </div>

    <div class="secC-full-row">
      <div class="secC-label">c)&nbsp;&nbsp;Present ailment is a complication of PED</div>
      <div class="secC-colon">:</div>

      <div class="secC-check-row">
        <div class="secC-check-item">
          ${chk(isYes(pedComplication))}
          <span>Yes</span>
        </div>

        <div class="secC-check-item">
          ${chk(isNo(pedComplication))}
          <span>No</span>
        </div>
      </div>
    </div>

    <div class="secC-full-row">
      <div class="secC-label" style="padding-left:26px;">If yes, specify details</div>
      <div class="secC-colon">:</div>
      <span class="secC-line secC-line-long">${esc(pedDetails) || "&nbsp;"}</span>
    </div>

    <div class="secC-full-row">
      <div class="secC-label">d)&nbsp;&nbsp;Pre-authorization obtained</div>
      <div class="secC-colon">:</div>

      <div class="secC-check-row">
        <div class="secC-check-item">
          ${chk(isYes(preAuthObtained))}
          <span>Yes</span>
        </div>

        <div class="secC-check-item">
          ${chk(isNo(preAuthObtained))}
          <span>No</span>
        </div>
      </div>
    </div>

    <div class="secC-full-row">
      <div class="secC-label">e)&nbsp;&nbsp;Pre-authorization no.</div>
      <div class="secC-colon">:</div>

      <div class="secC-box-row">
        ${boxes(preAuthNumber, 26)}
      </div>
    </div>

    <div class="secC-full-row" style="align-items:flex-start;">
      <div class="secC-label">f)&nbsp;&nbsp;If authorization by network hospital not obtained, give reason</div>
      <div class="secC-colon">:</div>

      <div class="secC-stacked-line">
        <span class="secC-line secC-line-long">${esc(noNetworkReason) || "&nbsp;"}</span>
        <span class="secC-line secC-line-long">&nbsp;</span>
      </div>
    </div>

    <!-- ════════════════════════════════════════
         INJURY & LEGAL SECTION (g through vi)
         ════════════════════════════════════════ -->

    <!-- g) Hospitalization due to Injury -->
    <div class="secC-injury-row">
      <div class="secC-injury-label">g)&nbsp;&nbsp;Hospitalization due to Injury</div>
      <div class="secC-injury-colon">:</div>

      <div class="secC-injury-content">
        <div class="secC-injury-multi-check">
          <div class="secC-injury-check-item">
            ${chk(f.injuryHospitalization === "yes")}
            <span>Yes</span>
          </div>

          <div class="secC-injury-check-item">
            ${chk(f.injuryHospitalization === "no")}
            <span>No</span>
          </div>
        </div>
      </div>
    </div>

    <!-- (i) If yes, give cause -->
    <div class="secC-injury-row">
      <div class="secC-injury-label" style="padding-left: 26px;">(i)&nbsp;&nbsp;If yes, give cause:</div>
      <div class="secC-injury-colon">:</div>

      <div class="secC-injury-content">
        <div class="secC-injury-multi-check">
          <div class="secC-injury-check-item">
            ${chk(!!f.injurySelf)}
            <span>Self inflicted</span>
          </div>

          <div class="secC-injury-check-item">
            ${chk(!!f.injuryRTA)}
            <span>Road Traffic Accident</span>
          </div>

          <div class="secC-injury-check-item">
            ${chk(!!f.injurySubstance)}
            <span>Substance Abuse/Alcohol Consumption</span>
          </div>
        </div>
      </div>
    </div>

    <!-- (ii) Test conducted for substance abuse -->
    <div class="secC-injury-row">
      <div class="secC-injury-label" style="padding-left: 26px; white-space: normal;">(ii)&nbsp;&nbsp;If Injury due to Substance abuse/Alcohol consumption, Test conducted to establish this</div>
      <div class="secC-injury-colon">:</div>

      <div class="secC-injury-content">
        <div class="secC-injury-multi-check">
          <div class="secC-injury-check-item">
            ${chk(f.substanceTestDone === "yes")}
            <span>Yes</span>
          </div>

          <div class="secC-injury-check-item">
            ${chk(f.substanceTestDone === "no")}
            <span>No</span>
          </div>

          <div class="secC-injury-hint">
            (If yes, attach reports)
          </div>
        </div>
      </div>
    </div>

    <!-- (iii) If Medico Legal -->
    <div class="secC-injury-row">
      <div class="secC-injury-label" style="padding-left: 26px;">(iii)&nbsp;&nbsp;If Medico Legal</div>
      <div class="secC-injury-colon">:</div>

      <div class="secC-injury-content">
        <div class="secC-injury-multi-check">
          <div class="secC-injury-check-item">
            ${chk(f.medicoLegal === "yes")}
            <span>Yes</span>
          </div>

          <div class="secC-injury-check-item">
            ${chk(f.medicoLegal === "no")}
            <span>No</span>
          </div>
        </div>
      </div>
    </div>

    <!-- (iv) Reported to Police -->
    <div class="secC-injury-row">
      <div class="secC-injury-label" style="padding-left: 26px;">(iv)&nbsp;&nbsp;Reported to Police</div>
      <div class="secC-injury-colon">:</div>

      <div class="secC-injury-content">
        <div class="secC-injury-multi-check">
          <div class="secC-injury-check-item">
            ${chk(f.reportedPolice === "yes")}
            <span>Yes</span>
          </div>

          <div class="secC-injury-check-item">
            ${chk(f.reportedPolice === "no")}
            <span>No</span>
          </div>
        </div>
      </div>
    </div>

    <!-- (v) FIR No. -->
    <div class="secC-injury-row">
      <div class="secC-injury-label" style="padding-left: 26px;">(v)&nbsp;&nbsp;FIR No.</div>
      <div class="secC-injury-colon">:</div>

      <div class="secC-injury-fir-boxes">
        ${boxes(f.firNumber, 26)}
      </div>
    </div>

    <!-- (vi) If not reported to Police, give reason -->
    <div class="secC-injury-row">
      <div class="secC-injury-label" style="padding-left: 26px; white-space: normal;">(vi)&nbsp;&nbsp;If not reported to Police, give reason</div>
      <div class="secC-injury-colon">:</div>

      <div class="secC-injury-reason-line">
        ${esc(f.firNotReportedReason) || "&nbsp;"}
      </div>
    </div>

  </div>

</div>
<!-- PAGE FOOTER -->

<div class="section-footer">

  <div class="section-footer-top-line"></div>

  <div class="section-footer-content">

    <div class="section-footer-left">

      <div class="section-footer-row1">
        <b>Care Health Insurance Limited</b>
        <span>(Formerly Religare Health Insurance Company Limited)</span>
      </div>

      <div class="section-footer-row2">
        Registered Office: 5th Floor, 19 Chawla House,Nehru Place,New Delhi-110019
        &nbsp;Corresp. Office: Unit No. 604 - 607, 6th Floor, Tower C, Unitech Cyber Park, Sector-39, Gurugram-122001 (Haryana)
      </div>

      <div class="section-footer-row3">
        Website: www.careinsurance.com
        &nbsp;&nbsp;&nbsp;
        E-mail: customerfirst@careinsurance.com
        &nbsp;&nbsp;&nbsp;
        Call us: 1800-102-4488
      </div>

      <div class="section-footer-row4">
        CIN: U66000DL2007PLC161503
        &nbsp;&nbsp;&nbsp;
        UIN: RHIHLIP21017V052021
        <span class="section-footer-irdai">
          IRDAI Registration No. - 148
        </span>
      </div>

    </div>

    <div class="section-footer-page">
      Page 7
    </div>

  </div>

</div>
<!-- SECTION D -->

<div class="secD-wrap">

  <div class="secD-head">
    Section D - Claim Documents Submitted - Checklist
  </div>

  <div class="secD-body">

    <div class="secD-grid">

      <!-- LEFT COLUMN -->

      <div class="secD-col">

        <div class="secD-row">
          <div class="secD-index">(I)</div>
          <div class="secD-label">Duly signed Claim Form</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(ii)</div>
          <div class="secD-label">Original Pre-authorization request</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(iii)</div>
          <div class="secD-label">Copy of Pre-authorization approval letter</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(iv)</div>
          <div class="secD-label">Copy of photo ID card of patient verified by hospital</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(v)</div>
          <div class="secD-label">Hospital Discharge Summary</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(vi)</div>
          <div class="secD-label">Operation Theatre notes</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(vii)</div>
          <div class="secD-label">Hospital Main Bill</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(viii)</div>
          <div class="secD-label">Hospital Break-up Bill</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

      </div>

      <!-- RIGHT COLUMN -->

      <div class="secD-col">

        <div class="secD-row">
          <div class="secD-index">(ix)</div>
          <div class="secD-label">Investigation Report</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(x)</div>
          <div class="secD-label">CT/ MRI/ USG /HPE investigation reports</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(xi)</div>
          <div class="secD-label">Doctor's reference slip for investigation</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(xii)</div>
          <div class="secD-label">ECG</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(xiii)</div>
          <div class="secD-label">Pharmacy Bills</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(xiv)</div>
          <div class="secD-label">MLC report &amp; Police FIR</div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(xv)</div>
          <div class="secD-label">
            Original death summary from hospital where applicable
          </div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

        <div class="secD-row">
          <div class="secD-index">(xvi)</div>
          <div class="secD-label">
            Any other, please specify<span class="secD-other-line"></span>
          </div>
          <div class="secD-colon">:</div>
          <div class="secD-box"></div>
        </div>

      </div>

    </div>

  </div>

</div>

<!-- SECTION E -->

<div class="secE-wrap">

  <div class="secE-head">
    Section E - Additional Details in case of Non-Network Hospital (Only fill in case of non-network hospital)
  </div>

  <div class="secE-body">

    <div class="secE-row">
      <div class="secE-label">a)&nbsp;&nbsp;Address of the Hospital</div>
      <div class="secE-colon">:</div>

      <div class="secE-field">
        <div class="secE-address-grid">
          ${gridBoxes(nonNetworkAddress, 27, 3)}
        </div>

        <div class="secE-split-row">
          <div class="secE-city-state">
            <div class="secE-inline-row">
              <div class="secE-inline-label" style="width:36px;min-width:36px;">City</div>
              <div class="secE-inline-colon">:</div>
              <div class="secE-box-row">${boxes(nonNetworkCity, 16)}</div>
            </div>

            <div class="secE-inline-row">
              <div class="secE-inline-label" style="width:36px;min-width:36px;">State</div>
              <div class="secE-inline-colon">:</div>
              <div class="secE-box-row">${boxes(nonNetworkState, 16)}</div>
            </div>
          </div>

          <div class="secE-pin-block">
            <div class="secE-inline-label">Pin Code</div>
            <div class="secE-inline-colon">:</div>
            <div class="secE-box-row">${boxes(nonNetworkPinCode, 6)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="secE-two-col">
      <div class="secE-left-col">

        <div class="secE-inline-row">
          <div class="secE-label secE-label-narrow">b)&nbsp;&nbsp;Contact No.</div>
          <div class="secE-colon">:</div>
          <div class="secE-box-row">${boxes(nonNetworkContactNo, 12)}</div>
        </div>

        <div class="secE-inline-row">
          <div class="secE-label secE-label-narrow">c)&nbsp;&nbsp;Registration No. with State Code</div>
          <div class="secE-colon">:</div>
          <div class="secE-box-row">${boxes(nonNetworkRegistrationNo, 18)}</div>
        </div>

        <div class="secE-inline-row">
          <div class="secE-label secE-label-narrow">d)&nbsp;&nbsp;Hospital PAN</div>
          <div class="secE-colon">:</div>
          <div class="secE-box-row">${boxes(hospitalPan, 10)}</div>
        </div>

      </div>

      <div class="secE-right-col">
        <div class="secE-inline-row" style="margin-top:36px;">
          <div class="secE-inline-label">e)&nbsp;&nbsp;No. of inpatient beds</div>
          <div class="secE-inline-colon">:</div>
          <div class="secE-box-row">${boxes(inpatientBeds, 4)}</div>
        </div>
      </div>
    </div>

    <div class="secE-row" style="margin-bottom:2px;">
      <div class="secE-label">f)&nbsp;&nbsp;Facilities available in the hospital</div>
      <div class="secE-colon">:</div>

      <div class="secE-field">
        <div class="secE-split-row" style="align-items:center;">
          <div class="secE-check-wrap">
            <div class="secE-inline-label">(i)&nbsp;&nbsp;OT</div>
            <div class="secE-colon">:</div>

            <div class="secE-check-item">
              ${chk(isYes(otAvailable))}
              <span>Yes</span>
            </div>

            <div class="secE-check-item">
              ${chk(isNo(otAvailable))}
              <span>No</span>
            </div>
          </div>

          <div class="secE-check-wrap" style="margin-left:80px;">
            <div class="secE-inline-label">(ii)&nbsp;&nbsp;ICU</div>
            <div class="secE-colon">:</div>

            <div class="secE-check-item">
              ${chk(isYes(icuAvailable))}
              <span>Yes</span>
            </div>

            <div class="secE-check-item">
              ${chk(isNo(icuAvailable))}
              <span>No</span>
            </div>
          </div>
        </div>

        <div class="secE-others-row">
          <div class="secE-inline-label">(iii)&nbsp;&nbsp;Others</div>
          <div class="secE-inline-colon">:</div>
          <span class="secE-line">${esc(otherFacilities) || "&nbsp;"}</span>
        </div>
      </div>
    </div>

  </div>

</div>

<!-- SECTION F -->

<div class="secF-wrap">

  <div class="secF-head">
    Section F - Declaration by the Hospital
  </div>

  <div class="secF-body">

    <div class="secF-note">
      (Please read very carefully)
    </div>

    <div class="secF-para">
      We hereby declare that the information furnished in this Claim Form is true &amp; correct to the best of our knowledge and belief. If we have made any false or untrue statement, suppression or concealment of any material facts, our right to claim under this claim shall be forfeited.
    </div>

    <div class="secF-bottom">

      <!-- LEFT -->

      <div class="secF-left">

        <div class="secF-row">

          <div class="secF-label">Date</div>

          <div class="secF-colon">:</div>

          <div class="secF-date">

            ${dateBoxes(new Date(), 4)}

            <span class="secF-hint">(DD/MM/YYYY)</span>

          </div>

        </div>

        <div class="secF-row" style="margin-bottom:0;">

          <div class="secF-label">Place</div>

          <div class="secF-colon">:</div>

          <div class="secF-place-line"></div>

        </div>

      </div>

      <!-- RIGHT -->

      <div class="secF-right">

        <div class="secF-sign-row">

          <div class="secF-label">
            Signature &amp; Seal of the Hospital Authority
          </div>

          <div class="secF-colon">:</div>

          <div class="secF-sign-line"></div>

        </div>

      </div>

    </div>

  </div>

</div>
<!-- PAGE FOOTER -->

<div class="section-footer">

  <div class="section-footer-top-line"></div>

  <div class="section-footer-content">

    <div class="section-footer-left">

      <div class="section-footer-row1">
        <b>Care Health Insurance Limited</b>
        <span>(Formerly Religare Health Insurance Company Limited)</span>
      </div>

      <div class="section-footer-row2">
        Registered Office: 5th Floor, 19 Chawla House,Nehru Place,New Delhi-110019
        &nbsp;Corresp. Office: Unit No. 604 - 607, 6th Floor, Tower C, Unitech Cyber Park, Sector-39, Gurugram-122001 (Haryana)
      </div>

      <div class="section-footer-row3">
        Website: www.careinsurance.com
        &nbsp;&nbsp;&nbsp;
        E-mail: customerfirst@careinsurance.com
        &nbsp;&nbsp;&nbsp;
        Call us: 1800-102-4488
      </div>

      <div class="section-footer-row4">
        CIN: U66000DL2007PLC161503
        &nbsp;&nbsp;&nbsp;
        UIN: RHIHLIP21017V052021
        <span class="section-footer-irdai">
          IRDAI Registration No. - 148
        </span>
      </div>

    </div>

    <div class="section-footer-page">
      Page 8
    </div>

  </div>

</div>

</div><!-- /page -->
</body>
</html>`;
}

/* ═══════════════════════════════════════════
   DOWNLOAD
═══════════════════════════════════════════ */
export async function downloadCareHealthFormB(form, signatureDataUrl = null) {
  const name =
    String(form?.hospitalName ?? "")
      .trim()
      .replace(/\s+/g, "_") || "Hospital";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `CareHealthFormB_${name}_${date}.pdf`;
  const html = generateCareHealthFormBHTML(form, signatureDataUrl);

  if (Platform.OS === "web") {
    const html2pdf = (await import("html2pdf.js")).default;
    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");
    const styleEl = parsed.querySelector("style");
    const rootEl = parsed.querySelector(".page");
    if (!styleEl || !rootEl)
      throw new Error("Template missing <style> or .page");

    const injStyle = document.createElement("style");
    injStyle.setAttribute("data-formb-pdf", "1");
    injStyle.textContent = styleEl.textContent;
    document.head.appendChild(injStyle);

    const host = document.createElement("div");
    host.setAttribute("data-formb-pdf", "1");
    host.style.cssText =
      "position:fixed;left:-9999px;top:0;width:210mm;background:#fff;z-index:-1;";
    host.appendChild(document.importNode(rootEl, true));
    document.body.appendChild(host);

    try {
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
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
            width: 794,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(host.firstElementChild)
        .save(fileName);
    } finally {
      injStyle.remove();
      host.remove();
    }
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const destUri = FileSystem.cacheDirectory + fileName;
  await FileSystem.copyAsync({ from: uri, to: destUri });
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (_) {}
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destUri, {
      mimeType: "application/pdf",
      dialogTitle: "Save or Share Hospital Claim Form B PDF",
      UTI: "com.adobe.pdf",
    });
  } else {
    Alert.alert("Saved", `PDF saved to:\n${destUri}`);
  }
}

