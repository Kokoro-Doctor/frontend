/**
 * Medi Assist – Reimbursement Claim Form A: HTML/CSS template and PDF download.
 * Screen + field mapping: MediAssistFormA.jsx (buildInitialForm, form state).
 * Add Form B as a parallel module (e.g. MediAssistFormB.js + MediAssistFormB.jsx) using the same pattern.
 */
import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

// Embedded from assets/HospitalPortal/Images/Care-Health-logo.webp so the
// preview iframe and PDF export can render the logo without resolving a local path.
const CARE_HEALTH_LOGO_DATA_URI =
  "data:image/webp;base64,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";

/* ─────────────────────────────────────────────
   PURE HELPERS
───────────────────────────────────────────── */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Render a string as a row of individual bordered character boxes.
 * Matches the hand-printed grid cells on the original form.
 */
function boxes(value, count) {
  const padded = String(value ?? "")
    .padEnd(count, " ")
    .slice(0, count);
  return padded
    .split("")
    .map((ch) => `<span class="cb">${ch === " " ? "&nbsp;" : esc(ch)}</span>`)
    .join("");
}

/** Square checkbox — filled blue when checked=true */
function chk(checked) {
  return checked
    ? `<span class="chkbox chkbox-on">&#10003;</span>`
    : `<span class="chkbox"></span>`;
}

/** Horizontal divider with centred bold label */
function divider(label) {
  return `<div class="div-row"><div class="div-line"></div><span class="div-label">${label}</span><div class="div-line"></div></div>`;
}

/** Vertical right-side section bar (SECTION A … H) */
function secBar(label) {
  return `<div class="sec-bar"><div class="sec-line"></div><div class="sec-text">${label}</div><div class="sec-line"></div></div>`;
}

/* Relationship matching */
function relMatch(rel, key) {
  const r = String(rel ?? "")
    .toLowerCase()
    .trim();
  if (!r) return false;
  const k = key.toLowerCase();
  if (k === "other")
    return !["self", "spouse", "child", "father", "mother"].some(
      (x) => r === x || r.includes(x),
    );
  return r === k || r.includes(k);
}

/* Occupation matching */
function occMatch(occ, key) {
  const o = String(occ ?? "")
    .toLowerCase()
    .trim();
  if (!o) return false;
  const k = key.toLowerCase();
  if (k === "other")
    return !["service", "self", "home", "student", "retired"].some((x) =>
      o.includes(x),
    );
  if (k === "self employed") return o.includes("self") && o.includes("employ");
  if (k === "home maker") return o.includes("home") || o.includes("homemaker");
  return o.includes(k.split(" ")[0]);
}

/* Room category matching */
function roomMatch(rc, key) {
  const r = String(rc ?? "").toLowerCase();
  if (key === "day") return r.includes("day");
  if (key === "single") return r.includes("single");
  if (key === "twin") return r.includes("twin") || r.includes("double");
  if (key === "multi")
    return (
      r.includes("3") ||
      r.includes("more") ||
      r.includes("general") ||
      r.includes("shared")
    );
  return false;
}

/* Hospitalization cause matching */
function causeMatch(cause, key) {
  const c = String(cause ?? "").toLowerCase();
  if (key === "injury") return c.includes("injur");
  if (key === "illness")
    return c.includes("ill") || c.includes("disease") || c.includes("sick");
  if (key === "maternity")
    return (
      c.includes("mater") || c.includes("deliver") || c.includes("pregnan")
    );
  return false;
}

/** Signature block — embedded PNG when available, empty box otherwise */
function sigBlock(dataUrl) {
  const s = String(dataUrl ?? "").trim();
  if (s.startsWith("data:image/")) {
    return `<span class="sig-box sig-filled"><img src="${s}" class="sig-img" alt="" /></span>`;
  }
  return `<span class="sig-box"></span>`;
}

function isYes(value) {
  if (value === true) return true;
  return (
    String(value ?? "")
      .trim()
      .toLowerCase() === "yes"
  );
}

function isNo(value) {
  if (value === false) return true;
  return (
    String(value ?? "")
      .trim()
      .toLowerCase() === "no"
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT: generateCareHealthFormAHTML
   Produces a pixel-accurate A4 HTML replica of
   the Care Health Reimbursement Claim Form.
───────────────────────────────────────────── */
export function generateCareHealthFormAHTML(form, signatureDataUrl = null) {
  const f = form ?? {};
  const claimIntimationNo = f.claimIntimationNo || "";
  const patientName =
    f.patientName || f.hospitalizedName || f.primaryName || "";
  const contactNumber = f.contactNumber || f.hospPhone || f.primaryPhone || "";
  const insurerIdCardNo = f.insurerIdCardNo || f.certificateNumber || "";
  const policyNumberCorporate = f.policyNumberCorporate || f.policyNumber || "";
  const insurerName = f.insurerName || f.tpaId || "";
  const primaryName = f.primaryName || "";
  const primaryAddressRow1 = f.primaryAddressRow1 || "";
  const primaryAddressRow2 = f.primaryAddressRow2 || "";
  const primaryCity = f.primaryCity || "";
  const primaryState = f.primaryState || "";
  const primaryPin = f.primaryPin || "";
  const primaryPhone = f.primaryPhone || "";
  const primaryEmail = f.primaryEmail || "";
  const hospitalLocation =
    f.hospitalLocation || [f.hospCity, f.hospState].filter(Boolean).join(", ");
  const hospitalEmail = f.hospitalEmail || f.hospEmail || "";
  const treatingDoctorName = f.treatingDoctorName || f.treatingDoctor || "";
  const treatingDoctorContact = f.treatingDoctorContact || "";
  const firstConsultationDate = f.firstConsultationDate || "";
  const icd10Code = f.icd10Code || "";
  const icd10PcsCode = f.icd10PcsCode || "";
  const dateOfInjury = f.dateOfInjury || f.injuryDate || "";
  const firNumber = f.firNo || f.firNumber || "";
  const expectedDeliveryDate = f.expectedDeliveryDate || "";
  const dateOfAdmission = f.dateOfAdmission || f.admissionDate || "";
  const timeOfAdmission = f.timeOfAdmission || f.admissionTime || "";
  const isEmergencyHospitalization =
    isYes(f.isEmergencyHospitalization) || f.typeOfAdmission === "emergency";
  const isPlannedHospitalization =
    isYes(f.isPlannedHospitalization) || f.typeOfAdmission === "planned";
  const isRta = !!(f.injuryRta ?? f.injuryRTA);
  const isReportedPolice = isYes(f.reportedPolice) || f.reportedPolice === true;
  const isSubstanceRelated = !!f.injurySubstance;
  const isSubstanceTestDone = isYes(f.substanceTestDone);
  const drugRoute = String(f.drugAdministrationRoute ?? "").toLowerCase();

  /* Pre-compute relationship "Other specify" text */
  const relOtherText =
    f.relationship &&
    !["self", "spouse", "child", "father", "mother"].some(
      (x) => String(f.relationship).toLowerCase().trim() === x,
    )
      ? f.relationship
      : "";

  /* Pre-compute occupation "Other specify" text */
  const occOtherText = (() => {
    const o = String(f.occupation ?? "").trim();
    if (!o) return "";
    if (
      occMatch(o, "service") ||
      occMatch(o, "self employed") ||
      occMatch(o, "home maker") ||
      occMatch(o, "student") ||
      occMatch(o, "retired")
    )
      return "";
    return o;
  })();

  /* Bills rows — 10 rows, pre-filled labels for first 4 */
  const billLabels = [
    "Hospital main Bill",
    "Pre-hospitalization Bills:   Nos",
    "Post-hospitalization Bills:  Nos",
    "Pharmacy Bills",
    "",
    "",
    "",
    "",
    "",
    "",
  ];
  const billRows = Array.from({ length: 10 }, (_, i) => {
    const r = (f.billsRows && f.billsRows[i]) ?? {};
    return {
      billNo: r.billNo ?? "",
      date: r.date ?? "",
      issuedBy: r.issuedBy ?? "",
      towards: r.towards && r.towards.trim() ? r.towards : billLabels[i],
      amount: r.amount ?? "",
    };
  });

  /* Checklist items */
  const checklistItems = [
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
    "Investigation Reports (Including CT / MRI / USG / HPE)",
    "Doctors Prescriptions",
    "Others",
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Reimbursement Claim Form</title>
<style>
/* ── RESET & PAGE ── */
@media print {
  @page { size: A4 portrait; margin: 0; }
  body { margin: 0; }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7px;
  color: #000;
  background: #fff;
}
.page {
  width: 210mm;
  min-height: 297mm;
  padding: 4mm 4mm 4mm 4mm;
  margin: 0 auto;
  background: #fff;
}

/* ── HEADER ── */
.hdr {
  width: 100%;
  margin-bottom: 8px;
}

.hdr-top {
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 74px;
  padding: 12px 14px;
  background: linear-gradient(90deg, #ffe34d 0%, #f9e985 18%, #fcf4c8 62%, #fffbed 100%);
  border: 1px solid #e6d87e;
}

.hdr-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.hdr-logo {
  width: 230px;
  height: auto;
  object-fit: contain;
  display: block;
}

/* Hospital Header Fields */
.hospital-header {
  margin-top: 12px;
}

.hospital-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.hospital-label {
  font-size: 8px;
  min-width: 122px;
  font-weight: 500;
}

.hospital-right-group {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 16px;
}

.hospital-right-label {
  font-size: 8px;
  margin-right: 5px;
  white-space: nowrap;
}

/* Character boxes */
.hospital-header .cb-row {
  display: inline-flex;
  flex-wrap: nowrap;
}

.hospital-header .cb {
  width: 13px;
  height: 14px;
  border: 1px solid #4c4c4c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-family: monospace;
  line-height: 1;
  margin-right: 2px;
}

/* TPA section */
.tpa-header {
  margin-top: 10px;
  
  border-bottom: 1.4px solid #000;
  padding: 3px 0 2px;
  font-size: 8px;
  font-weight: 550;
}

.tpa-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8px;
  gap: 12px;
  padding-top: 5px;
}

.tpa-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.tpa-item b {
  margin-right: 4px;
}

/* ── SECTION WRAPPER ── */
.sec-wrap {
  display: flex;

  margin-bottom: 2px;
}
.sec-body { flex: 1; padding: 3px 4px; min-width: 0; }

/* ── SECTION BAR (right vertical strip) ── */
.sec-bar {
  width: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #222;
  flex-shrink: 0;
  padding: 2px 0;
}
.sec-line { flex: 1; width: 7px; border-left: 0.5px solid #fff; }
.sec-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: #fff;
  font-size: 5.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  white-space: nowrap;
  padding: 3px 0;
}

/* ── DIVIDER ── */
.div-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
}
.div-line { flex: 1; height: 0.6px; background: #444; }
.div-label { font-size: 6.5px; font-weight: 700; white-space: nowrap; }

/* ── LAYOUT ROWS ── */
.row  { display: flex; align-items: center; flex-wrap: wrap; gap: 3px; margin-bottom: 2px; }
.row-sb { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 3px; margin-bottom: 2px; }
.lbl  {
  font-size: 8px;
  font-weight: 500;
  white-space: nowrap;
}

.txt  {
  font-size: 8px;
}

/* ── CHARACTER BOXES ── */
.cb-row {
  display: inline-flex;
  flex-wrap: nowrap;
}

.cb {
  width: 13px;
  height: 14px;
  border: 1px solid #4c4c4c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-family: monospace;
  line-height: 1;
  margin-right: 2px;
  flex-shrink: 0;
}

/* Care Section A reference layout */
.care-a {
  margin-bottom: 8px;
  color: #4a4a4a;
  margin-top: 15px;
  
}
.care-a-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 8px;
}
.care-a-headings { flex: 1; }
.care-a-title {
  font-size: 12px;
  line-height: 1.2;
  color: #3d74b6;
  font-weight: 500;
  margin-bottom: 2px;
}
.care-a-part {
  font-size: 11px;
  line-height: 1.2;
  color: #3f3f3f;
  font-weight: 700;
  margin-bottom: 8px;
}
.care-a-notes {
  margin: 0;
  padding-left: 10px;
  color: #7a7a7a;
  font-size: 8px;
  line-height: 1.55;
}
.care-a-claim {
  width: 240px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 4px;
  padding-bottom: 4px;
  color: #505050;
  font-size: 8px;
}
.care-a-claim-line {
  display: inline-block;
  width: 126px;
  height: 10px;
  border-bottom: 1px solid #4a4a4a;
  font-size: 7px;
  line-height: 10px;
  color: #505050;
  white-space: nowrap;
  overflow: hidden;
}
.care-a-band {
  background: #f9eeb7;
  color: #424242;
  font-size: 8px;
  font-weight: 700;
  padding: 2px 8px;
  margin-bottom: 8px;
}
.care-a-grid {
  color: #4b4b4b;
}
.care-a-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 4px;
}
.care-a-pair {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 4px;
}
.care-a-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}
.care-a-colon {
  width: 8px;
  text-align: center;
  font-size: 8px;
  line-height: 16px;
  color: #555;
}
.care-a-grid .lbl {
  font-size: 8px;
  line-height: 16px;
  font-weight: 500;
  color: #494949;
}
.care-a-grid .cb-row {
  display: inline-flex;
  flex-wrap: nowrap;
}
.care-a-grid .cb {
  width: 11.4px;
  height: 16px;
  margin-right: 0;
  border: 1px solid #b8bdc5;
  color: #404040;
  font-size: 6.8px;
}
.care-a-hints {
  display: flex;
  margin-left: 112px;
  margin-top: -1px;
  margin-bottom: 5px;
  color: #b0b0b0;
  font-size: 6px;
  line-height: 1;
}
.care-a-hints span {
  text-align: center;
}

/* ── CHECKBOXES ── */
.chkbox {
  display: inline-block;
  width: 7px; height: 7px;
  border: 0.6px solid #333;
  margin: 0 1.5px;
  vertical-align: middle;
  font-size: 5.5px;
  text-align: center;
  line-height: 7px;
}
.chkbox-on { background: #1565C0; color: #fff; }

/* ── TEXT UNDERLINE INPUTS ── */
.uline {
  display: inline-block;
  border-bottom: 0.6px solid #555;
  min-width: 50px;
  font-size: 6.5px;
  padding: 0 1px;
  vertical-align: bottom;
  white-space: nowrap;
  overflow: hidden;
}
.uline-lg  { min-width: 140px; }
.uline-xl  { min-width: 200px; }
.uline-xxl { min-width: 280px; }

/* ── SECTION E LAYOUT ── */
.sec-e-inner { display: flex; gap: 5px; }
.sec-e-main  { flex: 1; min-width: 0; }
.sec-e-chk   { width: 115px; flex-shrink: 0; border-left: 0.6px solid #ccc; padding-left: 4px; }
.chk-title   { font-size: 6px; font-weight: 700; margin-bottom: 2px; }
.chk-item    { display: flex; align-items: flex-start; gap: 2px; margin-bottom: 1.5px; }
.chk-item .chkbox { flex-shrink: 0; margin-top: 0.5px; }
.chk-item span { font-size: 6px; line-height: 1.25; }

/* ── BILLS TABLE ── */
.bills-tbl { width: 100%; border-collapse: collapse; font-size: 6.5px; }
.bills-tbl th, .bills-tbl td {
  border: 0.5px solid #888;
  padding: 1px 2px;
  vertical-align: middle;
}
.bills-tbl th { background: #ebebeb; font-weight: 700; text-align: center; }
.bills-tbl td.ctr { text-align: center; }

/* ── DECLARATION ── */
.decl-text {
  font-size: 6px;
  line-height: 1.35;
  text-align: justify;
  margin-bottom: 4px;
}

/* ── SIGNATURE ── */
.sig-row { display: flex; align-items: flex-end; gap: 8px; margin-top: 4px; }
.sig-box {
  display: inline-block;
  width: 44mm; height: 14mm;
  border: 0.6px solid #555;
  vertical-align: bottom;
  flex-shrink: 0;
}
.sig-filled { padding: 1px; overflow: hidden; }
.sig-img { display: block; width: 100%; height: 100%; object-fit: contain; object-position: left bottom; }

/* ── FOOTER ── */
.footer-note { font-size: 7px; font-weight: 700; text-align: right; margin-top: 4px; }
.footer-line { border-top: 0.8px solid #000; margin-top: 6px; margin-bottom: 2px; }

/* ── TOTAL ROW ── */
.total-row { display: flex; justify-content: flex-end; align-items: center; gap: 4px; margin-bottom: 2px; }
.total-lbl { font-size: 9px; font-weight: 700; }
.section-b-boxes .cb-row {
  display:inline-flex;
  flex-wrap:nowrap;
}

.section-b-boxes .cb{
  width:11.4px;
  height:16px;
  margin-right:0;
  border:1px solid #b8bdc5;
  color:#404040;
  font-size:6.8px;
  font-family:monospace;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}
  /* SECTION C */
.section-c{
  margin-top:6px;
  color:#4a4a4a;
}

.section-c-header{
  background:#efe7bf;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:8px;
  font-weight:700;
  color:#444;
}

.section-c-body{
  padding:10px 10px 8px;
}

.section-c-row{
  display:flex;
  align-items:flex-start;
  margin-bottom:6px;
  font-size:8px;
  color:#444;
}

.section-c-label{
  width:78px;
  line-height:16px;
}

.section-c-colon{
  width:10px;
  text-align:center;
  line-height:16px;
}

.section-c .cb-row{
  display:inline-flex;
  flex-wrap:nowrap;
}

.section-c .cb{
  width:11.4px;
  height:16px;
  margin-right:0;
  border:1px solid #b8bdc5;
  color:#404040;
  font-size:6.8px;
  font-family:monospace;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}

.section-c-small{
  font-size:6px;
  color:#b0b0b0;
}

.section-c-check{
  display:flex;
  align-items:center;
  gap:5px;
  margin-right:22px;
}

.section-c-check .chkbox{
  width:11px;
  height:11px;
}

.section-c-under{
  border-bottom:1px solid #555;
  flex:1;
  height:14px;
}

.section-c-address-note{
  width:55px;
  font-size:6px;
  line-height:1.2;
  color:#9c9c9c;
  margin-right:6px;
  padding-top:2px;
}

.section-c-name-hints{
  display:flex;
  margin-left:98px;
  margin-top:-2px;
  margin-bottom:6px;
  font-size:6px;
  color:#b0b0b0;
}

.section-c-name-hints span{
  text-align:center;
}
  /* SECTION D */
.section-d{
  margin-top:8px;
  color:#4b4b4b;
}

.section-d-topline{
  border-top:1px solid #a8a8a8;
  padding-top:4px;
  position:relative;
}

.section-d-company{
  font-size:12px;
  font-weight:700;
  line-height:1.1;
  color:#4d4d4d;
}

.section-d-company span{
  font-weight:400;
}

.section-d-address{
  font-size:8px;
  line-height:1.2;
  color:#555;
}
  .section-d-addresses{
  font-size:10px;
  line-height:1.2;
  color:#555;
}

.section-d-page{
  position:absolute;
  right:0;
  top:22px;
  font-size:8px;
  color:#555;
}
  /* SECTION E */
.section-e{
  margin-top:8px;
  color:#4b4b4b;
}

.section-e-header{
  background:#efe7bf;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:8px;
  font-weight:700;
  color:#444;
}

.section-e-body{
  padding:8px 10px 6px;
}

.section-e-row{
  display:flex;
  align-items:center;
  margin-bottom:7px;
  font-size:8px;
  color:#444;
}

.section-e-left{
  width:18px;
}

.section-e-label{
  line-height:16px;
}

.section-e-colon{
  width:14px;
  text-align:center;
}

.section-e .cb-row{
  display:inline-flex;
  flex-wrap:nowrap;
}

.section-e .cb{
  width:11.4px;
  height:16px;
  margin-right:0;
  border:1px solid #b8bdc5;
  color:#404040;
  font-size:6.8px;
  font-family:monospace;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}

.section-e-check{
  display:flex;
  align-items:center;
  margin-right:26px;
  gap:6px;
}

.section-e-check .chkbox{
  width:11px;
  height:11px;
}

.section-e-small{
  font-size:7px;
  color:#b0b0b0;
  margin-left:8px;
}

.section-e-line{
  flex:1;
  border-bottom:1px solid #555;
  height:12px;
  margin-left:8px;
}

.section-e-slash{
  margin:0 4px;
  font-size:10px;
  color:#555;
}

.section-e-gap{
  width:28px;
}

.section-e-system-line{
  width:300px;
  border-bottom:1px solid #555;
  height:12px;
  margin-left:8px;
}
  .page-break{
  page-break-before: always;
  break-before: page;
}
/* SECTION F */
.section-f{
  margin-top:8px;
  color:#4b4b4b;
}

.section-f-header{
  background:#efe7bf;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:8px;
  font-weight:700;
  color:#444;
}

.section-f-body{
  padding:10px 12px 8px;
}

.section-f-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  column-gap:38px;
  align-items:start;
}

.section-f-col{
  flex:1;
}

.section-f-row{
  display:flex;
  align-items:center;
  margin-bottom:10px;
  font-size:8px;
  color:#444;
}

.section-f-index{
  width:30px;
}

.section-f-label{
  width:182px;
  line-height:16px;
}

.section-f-label-sm{
  width:150px;
  line-height:16px;
}

.section-f-rs{
  margin-right:8px;
  white-space:nowrap;
}

.section-f-days{
  margin-left:8px;
}

.section-f .cb-row{
  display:inline-flex;
  flex-wrap:nowrap;
}

.section-f .cb{
  width:11.4px;
  height:16px;
  margin-right:0;
  border:1px solid #b8bdc5;
  color:#404040;
  font-size:6.8px;
  font-family:monospace;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}

.section-f-bottom{
  margin-top:8px;
}

.section-f-bottom-row{
  display:flex;
  align-items:center;
  font-size:8px;
  color:#444;
}

.section-f-bottom-left{
  width:30px;
}

.section-f-bottom-text{
  margin-right:18px;
}

.section-f-check{
  display:flex;
  align-items:center;
  gap:6px;
  margin-right:26px;
}

.section-f-check .chkbox{
  width:11px;
  height:11px;
}

.section-f-note{
  margin-left:30px;
  margin-top:5px;
  font-size:7px;
  color:#666;
}
  .section-f-title-row{
  display:flex;
  align-items:center;
  margin-bottom:14px;
  font-size:8px;
  color:#444;
}

.section-f-title-left{
  width:24px;
}

.section-f-title-text{
  font-weight:500;
}

.section-f-right-align{
  align-items:center;
}

.section-f-code-box{
  width:44px;
  margin-right:10px;
}

.section-f-code-space{
  width:54px;
}

.section-f-rs-fixed{
  width:36px;
  white-space:nowrap;
}
  /* SECTION G */
.section-g{
  margin-top:8px;
  color:#4b4b4b;
}

.section-g-header{
  background:#efe7bf;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:8px;
  font-weight:700;
  color:#444;
}

.section-g-body{
  padding:10px 12px 8px;
}

.section-g-top-title-row{
  display:flex;
  align-items:center;
  margin-bottom:10px;
  font-size:8px;
  color:#444;
}

.section-g-top-left{
  width:24px;
}

.section-g-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  column-gap:38px;
  margin-bottom:12px;
}

.section-g-row{
  display:flex;
  align-items:center;
  margin-bottom:8px;
  font-size:8px;
  color:#444;
}

.section-g-index{
  width:34px;
}

.section-g-label{
  width:170px;
  line-height:16px;
}

.section-g-right-label{
  width:220px;
  line-height:16px;
}

.section-g-right-label-small{
  width:48px;
  line-height:16px;
}

.section-g-rs{
  margin-right:8px;
  white-space:nowrap;
}

.section-g-code-box{
  width:44px;
  margin-right:12px;
}

.section-g-total{
  width:48px;
  line-height:16px;
}

.section-g-total-space{
  width:216px;
}

.section-g .cb-row{
  display:inline-flex;
  flex-wrap:nowrap;
}

.section-g .cb{
  width:11.4px;
  height:16px;
  margin-right:0;
  border:1px solid #b8bdc5;
  color:#404040;
  font-size:6.8px;
  font-family:monospace;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}

.section-g-doc-title-row{
  display:flex;
  align-items:center;
  margin-bottom:10px;
  font-size:8px;
  color:#444;
}

.section-g-doc-left{
  width:24px;
}

.section-g-doc-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  column-gap:44px;
}

.section-g-doc-row{
  display:flex;
  align-items:center;
  margin-bottom:8px;
  font-size:8px;
  color:#444;
}

.section-g-doc-index{
  width:34px;
}

.section-g-doc-label{
  width:230px;
  line-height:16px;
}

.section-g-doc-label-right{
  width:235px;
  line-height:16px;
}

.section-g-doc-colon{
  width:14px;
  text-align:center;
}

.section-g-doc-row .chkbox{
  width:11px;
  height:11px;
}

.section-g-other-box{
  margin-left:6px;
}

.section-g-bottom-line{
  border-bottom:1px solid #8f8f8f;
  margin-top:4px;
}
  .page{
  width:210mm;
  min-height:297mm;
  padding:4mm;
  display:flex;
  flex-direction:column;
}
/* SECTION F2 */

.section-f2{
  margin-top:8px;
  color:#4b4b4b;
}

.section-f2-header{
  background:#efe7bf;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:8px;
  font-weight:700;
  color:#444;
}

.section-f2-body{
  padding:10px 12px 0 12px;   /* same side spacing like other sections */
}

.section-f2-table{
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
}

/* TABLE HEADER */
.section-f2-table th{
  border:1px solid #a8a8a8;
  height:24px;
  font-size:8px;
  font-weight:500;
  color:#444;
  text-align:center;
  vertical-align:middle;
}

/* TABLE BODY */
.section-f2-table td{
  border:1px solid #b3b3b3;
  height:32px;
  font-size:8px;
  color:#444;
  vertical-align:middle;
  padding:0 6px;
}

/* COLUMN WIDTHS — reduced to match section width perfectly */

.w-sno{
  width:40px;
}

.w-bill{
  width:90px;
}

.w-date{
  width:85px;
}

.w-issued{
  width:120px;
}

.w-towards{
  width:240px;
}

.w-amount{
  width:140px;
}

.section-f2-note{
  margin-top:6px;
  font-size:7px;
  color:#555;
}
  /* SECTION BANK */

.section-bank{
  margin-top:8px;
  color:#4b4b4b;
}

.section-bank-header{
  background:#efe7bf;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:8px;
  font-weight:700;
  color:#444;
}

.section-bank-body{
  padding:8px 10px 6px 10px;
}

.section-bank-row{
  display:flex;
  align-items:flex-start;
  margin-bottom:0;
}

.section-bank-left{
  width:228px;
  display:flex;
  align-items:center;
  height:29px;
  font-size:8px;
  color:#444;
}

.section-bank-index{
  width:18px;
}

.section-bank-label{
  flex:1;
}

.section-bank-colon{
  width:14px;
  text-align:center;
}

.section-bank-box-area{
  flex:1;
}

.section-bank-grid{
  display:flex;
  flex-wrap:nowrap;
}

/* EXACT SAME BOX STYLE AS SECTION A */

.section-bank-grid .cb{
  width:20.4px;
  height:29px;
  margin-right:0;
  border:1px solid #b8bdc5;
  color:#404040;
  font-size:6.8px;
  font-family:monospace;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}
  /* SECTION H */

.section-h{
  margin-top:8px;
  color:#4b4b4b;
}

.section-h-header{
  background:#efe7bf;
  height:20px;
  display:flex;
  align-items:center;
  padding:0 10px;
  font-size:8px;
  font-weight:700;
  color:#444;
}

.section-h-body{
  padding:10px 12px 12px;
}

.section-h-text{
  font-size:8px;
  line-height:1.45;
  color:#4a4a4a;
  text-align:left;
  margin-bottom:28px;
}

/* BOTTOM ROW */

.section-h-sign-row{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}

.section-h-date-wrap{
  width:52%;
}

.section-h-signature-wrap{
  width:42%;
  padding-top:6px;
}

/* LABELS */

.section-h-label,
.section-h-signature-label{
  font-size:8px;
  color:#444;
  white-space:nowrap;
}

.section-h-colon{
  width:10px;
  text-align:center;
  font-size:8px;
  color:#444;
}

/* DATE ROW */

.section-h-date-row{
  display:flex;
  align-items:center;
  margin-bottom:22px;
}

.section-h-date-boxes{
  display:flex;
  align-items:center;
}

.section-h-grid{
  display:flex;
  flex-wrap:nowrap;
}

/* EXACT SAME BOX STYLE */

.section-h-grid .cb{
  width:20px;
  height:28px;
  margin-right:0;
  border:1px solid #b8bdc5;
  color:#404040;
  font-size:7px;
  font-family:monospace;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}

.section-h-slash{
  margin:0 6px;
  font-size:12px;
  color:#666;
}

.section-h-format{
  margin-left:10px;
  font-size:7px;
  color:#b0b0b0;
  white-space:nowrap;
}

/* PLACE */

.section-h-place-row{
  display:flex;
  align-items:center;
}

.section-h-place-line{
  width:390px;
  border-bottom:1px solid #555;
  height:14px;
  font-size:8px;
  color:#444;
  padding-left:2px;
}

/* SIGNATURE */

.section-h-signature-row{
  display:flex;
  align-items:center;
}

.section-h-sign-line{
  flex:1;
  border-bottom:1px solid #555;
  height:22px;
  position:relative;
}

.section-h-sign-img{
  position:absolute;
  left:0;
  bottom:2px;
  height:18px;
  object-fit:contain;
}
  /* PAGE FOOTER */

.section-footer{
  margin-top:auto;
  padding-top:4px;
  color:#4a4a4a;
}

.section-footer-top-line{
  border-top:1px solid #a9a9a9;
  margin-bottom:4px;
}

.section-footer-content{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}

.section-footer-left{
  flex:1;
  padding-right:20px;
}

.section-footer-row1{
  font-size:8px;
  line-height:1.1;
  color:#4a4a4a;
}

.section-footer-row1 b{
  font-weight:700;
}

.section-footer-row2{
  font-size:7px;
  line-height:1.1;
  color:#4f4f4f;
}

.section-footer-row3{
  font-size:7px;
  line-height:1.1;
  color:#4f4f4f;
}

.section-footer-row4{
  font-size:7px;
  line-height:1.1;
  color:#4f4f4f;
}

.section-footer-irdai{
  margin-left:18px;
  font-size:10px;
  color:#4a4a4a;
}

.section-footer-page{
  width:46px;
  text-align:right;
  font-size:8px;
  color:#555;
  padding-top:20px;
  white-space:nowrap;
}
</style>
</head>
<body>
<div class="page">

<!-- ══════════ HEADER ══════════ -->
<div class="hdr">

  <div class="hdr-top">

    <div class="hdr-logo-wrap">
      <img src="${CARE_HEALTH_LOGO_DATA_URI}" class="hdr-logo" alt="Care Health Insurance" />
    </div>

  </div>

  

<!-- ══════════ SECTION A: PRIMARY INSURED ══════════ -->
<div class="care-a">
  <div class="care-a-top">
    <div class="care-a-headings">
      <div class="care-a-title">Claim Form - 'CARE'</div>
      <div class="care-a-part">Part A</div>
      <ol class="care-a-notes">
        <li>To be filled in by the Insured.</li>
        <li>The issue of this Form is not to be taken as an admission of liability.</li>
        <li>To be filled in block letters.</li>
      </ol>
    </div>

    <div class="care-a-claim">
      <span>Claim Intimation No.:</span>
      <span class="care-a-claim-line">${esc(claimIntimationNo)}</span>
    </div>
  </div>

  <div class="care-a-band">Section A - Details of Primary Insured</div>

  <div class="care-a-grid">
    <div class="care-a-row">
      <div class="care-a-item" style="width:100%;">
        <span class="lbl" style="min-width:60px;">a)&nbsp; Policy No.</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(f.policyNumber, 54)}</span>
      </div>
    </div>

    <div class="care-a-pair">
      <div class="care-a-item" style="width:51%;">
        <span class="lbl" style="min-width:82px;">b)&nbsp; SL No./Certificate No.</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(f.certificateNumber, 13)}</span>
      </div>

      <div class="care-a-item" style="width:49%;">
        <span class="lbl" style="min-width:98px;">c)&nbsp; Company/TPA ID No.</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(f.tpaId, 21)}</span>
      </div>
    </div>

    <div class="care-a-row">
      <div class="care-a-item" style="width:100%;">
        <span class="lbl" style="min-width:60px;">d)&nbsp; Name</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryName, 54)}</span>
      </div>
    </div>

    <div class="care-a-hints">
      <span style="width:41%;">(Surname)</span>
      <span style="width:30%;">(First Name)</span>
      <span style="width:29%;">(Middle Name)</span>
    </div>

    <div class="care-a-row">
      <div class="care-a-item" style="width:100%;">
        <span class="lbl" style="min-width:60px;">e)&nbsp; Address</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryAddressRow1, 54)}</span>
      </div>
    </div>

    <div class="care-a-row">
      <div class="care-a-item" style="width:100%;">
        <span class="lbl" style="min-width:60px;">&nbsp;</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryAddressRow2, 54)}</span>
      </div>
    </div>

    <div class="care-a-pair">
      <div class="care-a-item" style="width:58%;">
        <span class="lbl" style="min-width:60px;">State</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryState, 18)}</span>
      </div>

      <div class="care-a-item" style="width:42%;">
        <span class="lbl" style="min-width:28px;">City</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryCity, 17)}</span>
      </div>
    </div>

    <div class="care-a-pair">
      <div class="care-a-item" style="width:72%;">
        <span class="lbl" style="min-width:60px;">Phone Number</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryPhone, 16)}</span>
      </div>

      <div class="care-a-item" style="width:28%;">
        <span class="lbl" style="min-width:42px;">Pin Code</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryPin, 7)}</span>
      </div>
    </div>

    <div class="care-a-row">
      <div class="care-a-item" style="width:100%;">
        <span class="lbl" style="min-width:60px;">E-mail</span>
        <span class="care-a-colon">:</span>
        <span class="cb-row">${boxes(primaryEmail, 54)}</span>
      </div>
    </div>
  </div>
</div>

<!-- ══════════ SECTION B - DETAILS OF INSURANCE HISTORY ══════════ -->


  <!-- HEADER -->
  <div
    style="
      background:#efe7bf;
      height:20px;
      display:flex;
      align-items:center;
      padding:0 10px;
      font-size:8px;
      font-weight:700;
      color:#444;
    "
  >
    Section B - Details of Insurance History
  </div>

  <!-- BODY -->
  <div class="section-b-boxes" style="padding:8px 10px 6px 10px;">

    <!-- a -->
    <div
      style="
        display:flex;
        align-items:center;
        margin-bottom:6px;
        font-size:8px;
        color:#444;
      "
    >

      <span style="width:14px;">a)</span>

      <span>
        Currently covered by any other Mediclaim/Health Insurance :
      </span>

      <div
        style="
          display:flex;
          align-items:center;
          margin-left:14px;
          gap:20px;
        "
      >

        <div style="display:flex;align-items:center;gap:6px;">
          <span class="chkbox"></span>
          <span>Yes</span>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span class="chkbox"></span>
          <span>No</span>
        </div>

      </div>

    </div>

    <!-- b -->
    <div
      style="
        display:flex;
        align-items:center;
        margin-bottom:8px;
        font-size:8px;
        color:#444;
      "
    >

      <span style="width:14px;">b)</span>

      <span>
        Date of commencement of first insurance without break :
      </span>

      <div
        style="
          display:flex;
          align-items:center;
          margin-left:10px;
        "
      >

        <span class="cb-row">
          ${boxes(f.firstInsuranceDateDay, 2)}
        </span>

        <span style="margin:0 4px;">/</span>

        <span class="cb-row">
          ${boxes(f.firstInsuranceDateMonth, 2)}
        </span>

        <span style="margin:0 4px;">/</span>

        <span class="cb-row">
          ${boxes(f.firstInsuranceDateYear, 4)}
        </span>

        <span
          style="
            margin-left:10px;
            color:#b7b7b7;
            font-size:7px;
          "
        >
          (DD/MM/YYYY)
        </span>

      </div>

    </div>

    <!-- c -->
    <div
      style="
        display:flex;
        align-items:flex-start;
        margin-bottom:6px;
        font-size:8px;
        color:#444;
      "
    >

      <span style="width:14px;">c)</span>

      <div style="width:100%;">

        <!-- company -->
        <div
          style="
            display:flex;
            align-items:center;
            margin-bottom:4px;
          "
        >

          <span style="width:92px;">
            If yes, Company Name
          </span>

          <span style="margin:0 8px 0 4px;">:</span>

          <span class="cb-row">
            ${boxes(f.previousInsuranceCompany, 34)}
          </span>

        </div>

        <!-- policy -->
        <div
          style="
            display:flex;
            align-items:center;
          "
        >

          <span style="width:92px;">
            Policy Number
          </span>

          <span style="margin:0 8px 0 4px;">:</span>

          <span class="cb-row">
            ${boxes(f.previousPolicyNumber, 18)}
          </span>

          <span
            style="
              margin-left:22px;
              margin-right:6px;
              white-space:nowrap;
            "
          >
            Sum Insured (Rs.):
          </span>

          <span class="cb-row">
            ${boxes(f.previousSumInsured, 16)}
          </span>

        </div>

      </div>

    </div>

    <!-- d -->
    <div
      style="
        margin-top:2px;
        margin-bottom:8px;
        font-size:8px;
        color:#444;
      "
    >

      <div
        style="
          display:flex;
          align-items:center;
          margin-bottom:5px;
        "
      >

        <span style="width:14px;">d)</span>

        <span>
          Have you ever been hospitalized in the last 4 years since inception of the contract?
        </span>

        <div
          style="
            display:flex;
            align-items:center;
            margin-left:14px;
            gap:20px;
          "
        >

          <div style="display:flex;align-items:center;gap:6px;">
            <span class="chkbox"></span>
            <span>Yes</span>
          </div>

          <div style="display:flex;align-items:center;gap:6px;">
            <span class="chkbox"></span>
            <span>No</span>
          </div>

        </div>

      </div>

      <!-- date -->
      <div
        style="
          display:flex;
          align-items:center;
          margin-left:20px;
          margin-bottom:6px;
        "
      >

        <span style="margin-right:18px;">•</span>

        <span style="width:42px;">Date :</span>

        <span class="cb-row">
          ${boxes(f.hospitalizationDateDay, 2)}
        </span>

        <span style="margin:0 4px;">/</span>

        <span class="cb-row">
          ${boxes(f.hospitalizationDateMonth, 2)}
        </span>

        <span style="margin:0 4px;">/</span>

        <span class="cb-row">
          ${boxes(f.hospitalizationDateYear, 4)}
        </span>

        <span
          style="
            margin-left:10px;
            color:#b7b7b7;
            font-size:7px;
          "
        >
          (DD/MM/YYYY)
        </span>

      </div>

      <!-- diagnosis -->
      <div
        style="
          display:flex;
          align-items:center;
          margin-left:20px;
        "
      >

        <span style="margin-right:18px;">•</span>

        <span style="width:58px;">Diagnosis:</span>

        <div
          style="
            flex:1;
            border-bottom:1px solid #444;
            height:10px;
          "
        ></div>

      </div>

    </div>

    <!-- e -->
    <div
      style="
        display:flex;
        align-items:center;
        margin-bottom:6px;
        font-size:8px;
        color:#444;
      "
    >

      <span style="width:14px;">e)</span>

      <span>
        Previously covered by any other Mediclaim/Health Insurance :
      </span>

      <div
        style="
          display:flex;
          align-items:center;
          margin-left:14px;
          gap:20px;
        "
      >

        <div style="display:flex;align-items:center;gap:6px;">
          <span class="chkbox"></span>
          <span>Yes</span>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span class="chkbox"></span>
          <span>No</span>
        </div>

      </div>

    </div>

    <!-- f -->
    <div
      style="
        display:flex;
        align-items:center;
        font-size:8px;
        color:#444;
      "
    >

      <span style="width:14px;">f)</span>

      <span style="width:118px;">
        If yes, Company Name :
      </span>

      <span class="cb-row">
        ${boxes(f.previousMediclaimCompany, 38)}
      </span>

    </div>

  </div>


<div class="section-c">

  <div class="section-c-header">
    Section C - Details of Insured Person Hospitalised
  </div>

  <div class="section-c-body">

    <!-- title -->
    <div class="section-c-row" style="align-items:center;">

      <div class="section-c-label">Title</div>
      <div class="section-c-colon">:</div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Mr.</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Ms.</span>
      </div>

    </div>

    <!-- name -->
    <div class="section-c-row">

      <div class="section-c-label">
        a) Name
      </div>

      <div class="section-c-colon">:</div>

      <span class="cb-row">
        ${boxes(patientName, 32)}
      </span>

    </div>

    <div class="section-c-name-hints">

      <span style="width:250px;">(Surname)</span>
      <span style="width:210px;">(First Name)</span>
      <span style="width:120px;">(Middle Name)</span>

    </div>

    <!-- gender age dob -->
    <div
      class="section-c-row"
      style="
        align-items:center;
        gap:14px;
      "
    >

      <!-- gender -->
      <div style="display:flex;align-items:center;">

        <div style="width:54px;">b) Gender</div>
        <div class="section-c-colon">:</div>

        <div class="section-c-check" style="margin-right:14px;">
          <span class="chkbox"></span>
          <span>M</span>
        </div>

        <div class="section-c-check">
          <span class="chkbox"></span>
          <span>F</span>
        </div>

      </div>

      <!-- age -->
      <div style="display:flex;align-items:center;">

        <div>c) Age</div>
        <div class="section-c-colon">:</div>

        <span class="cb-row">
          ${boxes(f.age, 2)}
        </span>

        <span style="margin:0 4px;">/</span>

        <span class="cb-row">
          ${boxes(f.ageMonth, 2)}
        </span>

        <span
          class="section-c-small"
          style="margin-left:8px;"
        >
          (YY/MM)
        </span>

      </div>

      <!-- dob -->
      <div style="display:flex;align-items:center;">

        <div>d) Date of Birth</div>
        <div class="section-c-colon">:</div>

        <span class="cb-row">
          ${boxes(f.dobDay, 2)}
        </span>

        <span style="margin:0 4px;">/</span>

        <span class="cb-row">
          ${boxes(f.dobMonth, 2)}
        </span>

        <span style="margin:0 4px;">/</span>

        <span class="cb-row">
          ${boxes(f.dobYear, 4)}
        </span>

      </div>

    </div>

    <!-- relationship -->
    <div class="section-c-row" style="align-items:center;">

      <div style="width:205px;">
        e) Relationship with Primary Insured
      </div>

      <div class="section-c-colon">:</div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Self</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Spouse</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Child</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Father</span>
      </div>

      <div class="section-c-check" style="margin-right:0;">
        <span class="chkbox"></span>
        <span>Mother</span>
      </div>

    </div>

    <!-- others -->
    <div
      class="section-c-row"
      style="
        margin-top:-2px;
        margin-left:235px;
        align-items:center;
      "
    >

      <div class="section-c-check" style="margin-right:10px;">
        <span class="chkbox"></span>
      </div>

      <span style="margin-right:8px;">
        Others (Please Specify)
      </span>

      <div class="section-c-under"></div>

    </div>

    <!-- occupation -->
    <div class="section-c-row" style="align-items:center;">

      <div style="width:95px;">
        f) Occupation
      </div>

      <div class="section-c-colon">:</div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Service</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Self Employed</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Homemaker</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Retired</span>
      </div>

      <div class="section-c-check">
        <span class="chkbox"></span>
        <span>Student</span>
      </div>

      <div
        style="
          display:flex;
          align-items:center;
          flex:1;
        "
      >

        <div class="section-c-check" style="margin-right:8px;">
          <span class="chkbox"></span>
        </div>

        <span style="margin-right:8px;">
          Others (Please Specify)
        </span>

        <div class="section-c-under"></div>

      </div>

    </div>

    <!-- address -->
    <div class="section-c-row">

      <div style="display:flex;">

        <div style="width:26px;">g)</div>

        <div class="section-c-address-note">
          Address : (if different from above)
        </div>

      </div>

      <span class="cb-row">
        ${boxes(f.insuredAddress1, 32)}
      </span>

    </div>

    <div
      class="section-c-row"
      style="
        margin-left:87px;
        margin-top:-4px;
      "
    >

      <span class="cb-row">
        ${boxes(f.insuredAddress2, 32)}
      </span>

    </div>

    <!-- city -->
    <div
      class="section-c-row"
      style="
        margin-left:87px;
        margin-top:-4px;
        align-items:center;
      "
    >

      <span class="cb-row">
        ${boxes(f.insuredAddress3, 14)}
      </span>

      <span style="margin-left:110px;margin-right:8px;">
        City :
      </span>

      <span class="cb-row">
        ${boxes(f.insuredCity, 12)}
      </span>

    </div>

    <!-- state -->
    <div
      class="section-c-row"
      style="
        align-items:center;
        margin-top:-2px;
      "
    >

      <div style="width:48px;">
        State
      </div>

      <div class="section-c-colon">:</div>

      <span class="cb-row">
        ${boxes(f.insuredState, 18)}
      </span>

      <span style="margin-left:95px;margin-right:8px;">
        Pin Code :
      </span>

      <span class="cb-row">
        ${boxes(f.insuredPincode, 8)}
      </span>

    </div>

    <!-- phone -->
    <div
      class="section-c-row"
      style="align-items:center;"
    >

      <div style="width:95px;">
        h) Phone Number
      </div>

      <div class="section-c-colon">:</div>

      <span class="cb-row">
        ${boxes(f.insuredPhone, 11)}
      </span>

    </div>

    <!-- email -->
    <div
      class="section-c-row"
      style="align-items:center;"
    >

      <div style="width:95px;">
        i) E-mail
      </div>

      <div class="section-c-colon">:</div>

      <span class="cb-row">
        ${boxes(f.insuredEmail, 32)}
      </span>

    </div>

  </div>

</div>
<div class="section-d">

  <div class="section-d-topline">

    <div class="section-d-company">
      Care Health Insurance Limited
      <span>(Formerly Religare Health Insurance Company Limited)</span>
    </div>

    <div class="section-d-address">
      Registered Office: 5th Floor, 19 Chawla House, Nehru Place, New Delhi-110019
      &nbsp;&nbsp;
      Corresp. Office: Unit No. 604 - 607, 6th Floor, Tower C, Unitech Cyber Park,
      Sector-39, Gurugram-122001 (Haryana)
    </div>

    <div class="section-d-address">
      Website: www.careinsurance.com
      &nbsp;&nbsp;
      E-mail: customerfirst@careinsurance.com
      &nbsp;&nbsp;
      Call Us: 1800-102-4488
    </div>

    <div class="section-d-addresses">
      CIN: U66000DL2007PLC161503
      &nbsp;&nbsp;
      UIN: RHIHLIP21017V052021
      &nbsp;&nbsp;
      IRDAI Registration No. - 148
    </div>

    <div class="section-d-page">
      Page 2
    </div>

  </div>

</div>
<div class="page-break"></div>

<div class="section-e">
<div class="section-e">

  <div class="section-e-header">
    Section E - Details of Hospitalisation
  </div>

  <div class="section-e-body">

    <!-- a -->
    <div class="section-e-row">

      <div class="section-e-left">a)</div>

      <div class="section-e-label">
        Name of Hospital where Admitted
      </div>

      <div class="section-e-colon">:</div>

      <span class="cb-row">
        ${boxes(f.hospitalName, 28)}
      </span>

    </div>

    <!-- b -->
    <div class="section-e-row">

      <div class="section-e-left">b)</div>

      <div class="section-e-label">
        Room Category occupied
      </div>

      <div class="section-e-colon">:</div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Day Care</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Single Occupancy</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Twin Sharing</span>
      </div>

      <div class="section-e-check" style="margin-right:0;">
        <span class="chkbox"></span>
        <span>3 or more beds per room</span>
      </div>

    </div>

    <!-- c -->
    <div class="section-e-row">

      <div class="section-e-left">c)</div>

      <div class="section-e-label">
        Hospitalisation due to
      </div>

      <div class="section-e-colon">:</div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Injury</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Illness</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Maternity</span>
      </div>

    </div>

    <!-- d -->
    <div class="section-e-row">

      <div class="section-e-left">d)</div>

      <div class="section-e-label">
        Date of Injury/Date Disease first detected/Date of Delivery
      </div>

      <div class="section-e-colon">:</div>

      <span class="cb-row">
        ${boxes(f.diseaseDay, 2)}
      </span>

      <span class="section-e-slash">/</span>

      <span class="cb-row">
        ${boxes(f.diseaseMonth, 2)}
      </span>

      <span class="section-e-slash">/</span>

      <span class="cb-row">
        ${boxes(f.diseaseYear, 4)}
      </span>

      <span class="section-e-small">(DD/MM/YYYY)</span>

    </div>

    <!-- e + f -->
    <div class="section-e-row">

      <div class="section-e-left">e)</div>

      <div class="section-e-label">
        Date of Admission
      </div>

      <div class="section-e-colon">:</div>

      <span class="cb-row">
        ${boxes(f.admissionDay, 2)}
      </span>

      <span class="section-e-slash">/</span>

      <span class="cb-row">
        ${boxes(f.admissionMonth, 2)}
      </span>

      <span class="section-e-slash">/</span>

      <span class="cb-row">
        ${boxes(f.admissionYear, 4)}
      </span>

      <span class="section-e-small">(DD/MM/YYYY)</span>

      <div class="section-e-gap"></div>

      <div class="section-e-label">
        f) Time of Admission
      </div>

      <div class="section-e-colon">:</div>

      <span class="cb-row">
        ${boxes(f.admissionHour, 2)}
      </span>

      <span class="section-e-slash">:</span>

      <span class="cb-row">
        ${boxes(f.admissionMinute, 2)}
      </span>

      <span class="section-e-small">(HH:MM)</span>

    </div>

    <!-- g + h -->
    <div class="section-e-row">

      <div class="section-e-left">g)</div>

      <div class="section-e-label">
        Date of Discharge
      </div>

      <div class="section-e-colon">:</div>

      <span class="cb-row">
        ${boxes(f.dischargeDay, 2)}
      </span>

      <span class="section-e-slash">/</span>

      <span class="cb-row">
        ${boxes(f.dischargeMonth, 2)}
      </span>

      <span class="section-e-slash">/</span>

      <span class="cb-row">
        ${boxes(f.dischargeYear, 4)}
      </span>

      <span class="section-e-small">(DD/MM/YYYY)</span>

      <div class="section-e-gap"></div>

      <div class="section-e-label">
        h) Time of Discharge
      </div>

      <div class="section-e-colon">:</div>

      <span class="cb-row">
        ${boxes(f.dischargeHour, 2)}
      </span>

      <span class="section-e-slash">:</span>

      <span class="cb-row">
        ${boxes(f.dischargeMinute, 2)}
      </span>

      <span class="section-e-small">(HH:MM)</span>

    </div>

    <!-- i -->
    <div class="section-e-row">

      <div class="section-e-left">i)</div>

      <div class="section-e-label">
        If Injury, give cause
      </div>

      <div class="section-e-colon">:</div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Self Inflicted</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Road Traffic Accident</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>Substance Abuse/Alcohol Consumption</span>
      </div>

    </div>

    <!-- i medico -->
    <div class="section-e-row">

      <div class="section-e-left">i)</div>

      <div class="section-e-label">
        If Medico Legal
      </div>

      <div class="section-e-colon">:</div>

      <div class="section-e-check" style="margin-right:16px;">
        <span class="chkbox"></span>
        <span>Yes</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>No</span>
      </div>

      <div style="width:34px;"></div>

      <div class="section-e-label">
        ii) Reported to Police
      </div>

      <div class="section-e-colon">:</div>

      <div class="section-e-check" style="margin-right:16px;">
        <span class="chkbox"></span>
        <span>Yes</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>No</span>
      </div>

    </div>

    <!-- iii -->
    <div class="section-e-row" style="margin-bottom:0;">

      <div class="section-e-left">iii)</div>

      <div class="section-e-label">
        MLC Report & Police FIR attached
      </div>

      <div class="section-e-colon">:</div>

      <div class="section-e-check" style="margin-right:16px;">
        <span class="chkbox"></span>
        <span>Yes</span>
      </div>

      <div class="section-e-check">
        <span class="chkbox"></span>
        <span>No</span>
      </div>

      <div style="width:34px;"></div>

      <div class="section-e-label">
        j) System of Medicine
      </div>

      <div class="section-e-colon">:</div>

      <div class="section-e-system-line"></div>

    </div>

  </div>

</div>
<!-- SECTION F -->
<div class="section-f">

  <div class="section-f-header">
    Section E - Details of Claim
  </div>

  <div class="section-f-body">

    <!-- top two column layout -->
    <div class="section-f-title-row">

  <div class="section-f-title-left">
    a)
  </div>

  <div class="section-f-title-text">
    Details of the treatment expenses claimed
  </div>

</div>

<div class="section-f-grid">

  <!-- LEFT COLUMN -->
  <div class="section-f-col">

    <!-- i -->
    <div class="section-f-row">
      <div class="section-f-index">(i)</div>
      <div class="section-f-label">Pre-hospitalization Expenses</div>
      <div class="section-f-rs">: Rs.</div>
      <div class="cb-row">
        ${boxes(f.preHospitalizationExpenses, 7)}
      </div>
    </div>

    <!-- ii -->
    <div class="section-f-row">
      <div class="section-f-index">(ii)</div>
      <div class="section-f-label">Hospitalization Expenses</div>
      <div class="section-f-rs">: Rs.</div>
      <div class="cb-row">
        ${boxes(f.hospitalizationExpenses, 7)}
      </div>
    </div>

    <!-- iii -->
    <div class="section-f-row">
      <div class="section-f-index">(iii)</div>
      <div class="section-f-label">Post-hospitalization Expenses</div>
      <div class="section-f-rs">: Rs.</div>
      <div class="cb-row">
        ${boxes(f.postHospitalizationExpenses, 7)}
      </div>
    </div>

    <!-- iv -->
    <div class="section-f-row">
      <div class="section-f-index">(iv)</div>
      <div class="section-f-label">Health Check-up cost</div>
      <div class="section-f-rs">: Rs.</div>
      <div class="cb-row">
        ${boxes(f.healthCheckupCost, 7)}
      </div>
    </div>

    <!-- v -->
    <div class="section-f-row">
      <div class="section-f-index">(v)</div>
      <div class="section-f-label">Ambulance Charges</div>
      <div class="section-f-rs">: Rs.</div>
      <div class="cb-row">
        ${boxes(f.ambulanceCharges, 7)}
      </div>
    </div>

  </div>

  <!-- RIGHT COLUMN -->
  <div class="section-f-col">

    <!-- vi -->
    <div class="section-f-row">
      <div class="section-f-index">(vi)</div>

      <div class="section-f-label-sm">
        Others (code)
      </div>

      <div class="cb-row section-f-code-box">
        ${boxes(f.otherExpenseCode, 3)}
      </div>

      <div class="section-f-rs-fixed">
        : Rs.
      </div>

      <div class="cb-row">
        ${boxes(f.otherExpensesAmount, 8)}
      </div>
    </div>

    <!-- total -->
    <div class="section-f-row">
      <div class="section-f-index"></div>

      <div class="section-f-label-sm">
        Total
      </div>

      <div class="section-f-code-space"></div>

      <div class="section-f-rs-fixed">
        : Rs.
      </div>

      <div class="cb-row">
        ${boxes(f.totalClaimAmount, 8)}
      </div>
    </div>

    <!-- vii -->
    <div class="section-f-row">
      <div class="section-f-index">(vii)</div>

      <div class="section-f-label-sm">
        Pre-hospitalization period
      </div>

      <div class="section-f-rs-fixed">
        :
      </div>

      <div class="cb-row">
        ${boxes(f.preHospitalizationPeriod, 3)}
      </div>

      <div class="section-f-days">
        days
      </div>
    </div>

    <!-- viii -->
    <div class="section-f-row">
      <div class="section-f-index">(viii)</div>

      <div class="section-f-label-sm">
        Post-hospitalization period
      </div>

      <div class="section-f-rs-fixed">
        :
      </div>

      <div class="cb-row">
        ${boxes(f.postHospitalizationPeriod, 3)}
      </div>

      <div class="section-f-days">
        days
      </div>
    </div>

  </div>

</div>

    <!-- bottom -->
    <div class="section-f-bottom">

      <div class="section-f-bottom-row">

        <div class="section-f-bottom-left">
          b)
        </div>

        <div class="section-f-bottom-text">
          Claim for Domiciliary Hospitalization:
        </div>

        <div class="section-f-check">
          <span class="chkbox"></span>
          <span>Yes</span>
        </div>

        <div class="section-f-check">
          <span class="chkbox"></span>
          <span>No</span>
        </div>

      </div>

      <div class="section-f-note">
        (If yes, provide details in annexure)
      </div>

    </div>

  </div>
  
</div>
<!-- SECTION G -->
<div class="section-g">

  

  <div class="section-g-body">

    <!-- c -->
    <div class="section-g-top-title-row">
      <div class="section-g-top-left">c)</div>

      <div class="section-g-top-title">
        Details of Lump sum/cash benefit claimed :
      </div>
    </div>

    <div class="section-g-grid">

      <!-- LEFT -->
      <div>

        <!-- i -->
        <div class="section-g-row">
          <div class="section-g-index">(i)</div>

          <div class="section-g-label">
            Hospital Daily Cash
          </div>

          <div class="section-g-rs">
            : Rs.
          </div>

          <div class="cb-row">
            ${boxes(f.hospitalDailyCash, 7)}
          </div>
        </div>

        <!-- ii -->
        <div class="section-g-row">
          <div class="section-g-index">(ii)</div>

          <div class="section-g-label">
            Surgical Cash
          </div>

          <div class="section-g-rs">
            : Rs.
          </div>

          <div class="cb-row">
            ${boxes(f.surgicalCash, 7)}
          </div>
        </div>

        <!-- iii -->
        <div class="section-g-row">
          <div class="section-g-index">(iii)</div>

          <div class="section-g-label">
            Critical Illness Benefit
          </div>

          <div class="section-g-rs">
            : Rs.
          </div>

          <div class="cb-row">
            ${boxes(f.criticalIllnessBenefit, 7)}
          </div>
        </div>

        <!-- iv -->
        <div class="section-g-row">
          <div class="section-g-index">(iv)</div>

          <div class="section-g-label">
            Convalescence
          </div>

          <div class="section-g-rs">
            : Rs.
          </div>

          <div class="cb-row">
            ${boxes(f.convalescence, 7)}
          </div>
        </div>

      </div>

      <!-- RIGHT -->
      <div>

        <!-- v -->
        <div class="section-g-row">
          <div class="section-g-index">(v)</div>

          <div class="section-g-right-label">
            Pre/Post hospitalization Lump sum benefit
          </div>

          <div class="section-g-rs">
            : Rs.
          </div>

          <div class="cb-row">
            ${boxes(f.prePostHospitalizationBenefit, 7)}
          </div>
        </div>

        <!-- vi -->
        <div class="section-g-row">
          <div class="section-g-index">(vi)</div>

          <div class="section-g-right-label-small">
            Others
          </div>

          <div class="cb-row section-g-code-box">
            ${boxes(f.otherBenefitCode, 3)}
          </div>

          <div class="section-g-rs">
            : Rs.
          </div>

          <div class="cb-row">
            ${boxes(f.otherBenefitAmount, 7)}
          </div>
        </div>

        <!-- total -->
        <div class="section-g-row">
          <div class="section-g-index"></div>

          <div class="section-g-total">
            Total
          </div>

          <div class="section-g-total-space"></div>

          <div class="section-g-rs">
            : Rs.
          </div>

          <div class="cb-row">
            ${boxes(f.totalBenefitAmount, 7)}
          </div>
        </div>

      </div>

    </div>

    <!-- d -->
    <div class="section-g-doc-title-row">
      <div class="section-g-doc-left">d)</div>

      <div class="section-g-doc-title">
        Claim Documents Submitted - Checklist
      </div>
    </div>

    <div class="section-g-doc-grid">

      <!-- LEFT -->
      <div>

        <!-- i -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(i)</div>

          <div class="section-g-doc-label">
            Claim Form Duly signed
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- ii -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(ii)</div>

          <div class="section-g-doc-label">
            Copy of the claim intimation, if any
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- iii -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(iii)</div>

          <div class="section-g-doc-label">
            Hospital Main Bill
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- iv -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(iv)</div>

          <div class="section-g-doc-label">
            Hospital Break-up Bill
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- v -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(v)</div>

          <div class="section-g-doc-label">
            Hospital Bill Payment Receipt
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- vi -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(vi)</div>

          <div class="section-g-doc-label">
            Hospital Discharge Summary
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- xiii -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(xiii)</div>

          <div class="section-g-doc-label">
            Others
          </div>

          <div class="cb-row section-g-other-box">
            ${boxes(f.otherDocumentCode, 2)}
          </div>
        </div>

      </div>

      <!-- RIGHT -->
      <div>

        <!-- vii -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(vii)</div>

          <div class="section-g-doc-label-right">
            Pharmacy Bill
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- viii -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(viii)</div>

          <div class="section-g-doc-label-right">
            Operation Theatre Notes
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- ix -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(ix)</div>

          <div class="section-g-doc-label-right">
            ECG
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- x -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(x)</div>

          <div class="section-g-doc-label-right">
            Doctor's request for investigation
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- xi -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(xi)</div>

          <div class="section-g-doc-label-right">
            Investigation Reports (Including CT/MRI/USG/HPE)
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

        <!-- xii -->
        <div class="section-g-doc-row">
          <div class="section-g-doc-index">(xii)</div>

          <div class="section-g-doc-label-right">
            Doctor's Prescriptions
          </div>

          <div class="section-g-doc-colon">:</div>

          <span class="chkbox"></span>
        </div>

      </div>

    </div>

    <div class="section-g-bottom-line"></div>

  </div>
</div>
<!-- SECTION G FOOTER FIXED AT PAGE BOTTOM -->

<div style="margin-top:auto;">

  <div class="section-d" style="margin-top:0;">

    <div class="section-d-topline" style="padding-top:3px;">

      <div style="display:flex;justify-content:space-between;align-items:flex-end;">

        <div>

          <div style="font-size:7px;line-height:1.2;color:#555;">
            <b>Care Health Insurance Limited</b>
            (Formerly Religare Health Insurance Company Limited)
          </div>

          <div style="font-size:7px;line-height:1.2;color:#555;">
            Registered Office: 5th Floor, 19 Chawla House, Nehru Place, New Delhi-110019
          </div>

          <div style="font-size:7px;line-height:1.2;color:#555;">
            Corporate Office: Unit No. 604 - 607, 6th Floor, Tower C,
            Unitech Cyber Park, Sector-39, Gurugram-122001 (Haryana)
          </div>

          <div style="font-size:7px;line-height:1.2;color:#555;">
            Website: www.careinsurance.com
            &nbsp;&nbsp; E-mail: customerfirst@careinsurance.com
            &nbsp;&nbsp; Call us: 1800-102-4488
          </div>

          <div style="font-size:7px;line-height:1.2;color:#555;">
            CIN: U66000DL2007PLC161503
            &nbsp;&nbsp; UIN: RHIHLIP21017V052021
            &nbsp;&nbsp; IRDAI Registration No. - 148
          </div>

        </div>

        <div
          style="
            font-size:7px;
            color:#555;
            padding-left:12px;
            white-space:nowrap;
          "
        >
          Page 3
        </div>

      </div>

    </div>

  </div>

</div>
<!-- PAGE BREAK -->
<div class="page-break"></div>

<!-- SECTION F -->
<div class="section-f2">

  <!-- HEADER -->
  <div class="section-f2-header">
    Section F - Details of Bills Enclosed
  </div>

  <!-- TABLE -->
  <div class="section-f2-body">

    <table class="section-f2-table">

      <tr>
        <th class="w-sno">S No.</th>
        <th class="w-bill">Bill No.</th>
        <th class="w-date">Date</th>
        <th class="w-issued">Issued by</th>
        <th class="w-towards">Towards</th>
        <th class="w-amount">Amount (INR)</th>
      </tr>

      <tr>
        <td class="center">1</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td class="towards-text">Hospital Main Bill</td>
        <td></td>
      </tr>

      <tr>
        <td class="center">2</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td class="towards-text">
          Pre-hospitalization Bills:_____Nos
        </td>
        <td></td>
      </tr>

      <tr>
        <td class="center">3</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td class="towards-text">
          Post-hospitalization Bills:_____Nos
        </td>
        <td></td>
      </tr>

      <tr>
        <td class="center">4</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td class="towards-text">Pharmacy bills</td>
        <td></td>
      </tr>

      <tr>
        <td class="center">5</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>

      <tr>
        <td class="center">6</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>

      <tr>
        <td class="center">7</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>

      <tr>
        <td class="center">8</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>

      <tr>
        <td class="center">9</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>

      <tr>
        <td class="center">10</td>
        <td></td>
        <td class="date-text">(DD/MM/YYYY)</td>
        <td></td>
        <td></td>
        <td></td>
      </tr>

    </table>

    <div class="section-f2-note">
      In case of more details, please attach a separate sheet.
    </div>

  </div>

</div>

<!-- SECTION G - BANK ACCOUNT -->

<div class="section-bank">

  <div class="section-bank-header">
    Section G - Details of Primary Insured’s Bank Account
  </div>

  <div class="section-bank-body">

    <!-- ROW 1 -->
    <div class="section-bank-row">
      <div class="section-bank-left">
        <span class="section-bank-index">a)</span>
        <span class="section-bank-label">PAN</span>
        <span class="section-bank-colon">:</span>
      </div>

      <div class="section-bank-box-area">
        <div class="section-bank-grid">
          ${boxes(f.bankPan, 28)}
        </div>
      </div>
    </div>

    <!-- ROW 2 -->
    <div class="section-bank-row">
      <div class="section-bank-left">
        <span class="section-bank-index">b)</span>
        <span class="section-bank-label">Account Number</span>
        <span class="section-bank-colon">:</span>
      </div>

      <div class="section-bank-box-area">
        <div class="section-bank-grid">
          ${boxes(f.bankAccountNumber, 28)}
        </div>
      </div>
    </div>

    <!-- ROW 3 -->
    <div class="section-bank-row">
      <div class="section-bank-left">
        <span class="section-bank-index">c)</span>
        <span class="section-bank-label">Bank Name & Branch</span>
        <span class="section-bank-colon">:</span>
      </div>

      <div class="section-bank-box-area">
        <div class="section-bank-grid">
          ${boxes(f.bankNameBranch, 28)}
        </div>
      </div>
    </div>

    <!-- ROW 4 -->
    <div class="section-bank-row">
      <div class="section-bank-left">
        <span class="section-bank-index">d)</span>
        <span class="section-bank-label">Cheque/DD payable details</span>
        <span class="section-bank-colon">:</span>
      </div>

      <div class="section-bank-box-area">
        <div class="section-bank-grid">
          ${boxes(f.bankChequeDetails, 28)}
        </div>
      </div>
    </div>

    <!-- ROW 5 -->
    <div class="section-bank-row">
      <div class="section-bank-left">
        <span class="section-bank-index">e)</span>
        <span class="section-bank-label">IFSC Code</span>
        <span class="section-bank-colon">:</span>
      </div>

      <div class="section-bank-box-area">
        <div class="section-bank-grid">
          ${boxes(f.bankIfsc, 28)}
        </div>
      </div>
    </div>

  </div>
</div>
<!-- SECTION H - DECLARATION -->

<div class="section-h">

  <div class="section-h-header">
    Section H - Declaration by the Insured
  </div>

  <div class="section-h-body">

    <div class="section-h-text">
      I hereby declare that the information furnished in this claim form is true & correct to the best of my knowledge and belief. If I have made any false or untrue statement, suppression or concealment of any material fact with respect to questions asked in relation to this claim, my right to claim reimbursement shall be forfeited. I also consent & authorize TPA/Company, to seek necessary medical information/documents from any hospital/Medical Practitioner who has attended on the person against whom this claim is made. I hereby declare that I have included all the bills/receipts for the purpose of this claim & that I will not be making any supplementary claim except the pre/post-hospitalization claim, if any.
    </div>

    <!-- DATE + SIGNATURE -->
    <div class="section-h-sign-row">

      <div class="section-h-date-wrap">

        <div class="section-h-date-row">
          <span class="section-h-label">Date</span>
          <span class="section-h-colon">:</span>

          <div class="section-h-date-boxes">
            <div class="section-h-grid">
              ${boxes(f.declarationDay, 2)}
            </div>

            <span class="section-h-slash">/</span>

            <div class="section-h-grid">
              ${boxes(f.declarationMonth, 2)}
            </div>

            <span class="section-h-slash">/</span>

            <div class="section-h-grid">
              ${boxes(f.declarationYear, 4)}
            </div>

            <span class="section-h-format">(DD/MM/YYYY)</span>
          </div>
        </div>

        <!-- PLACE -->
        <div class="section-h-place-row">
          <span class="section-h-label">Place</span>
          <span class="section-h-colon">:</span>

          <div class="section-h-place-line">
            ${esc(f.declarationPlace || "")}
          </div>
        </div>

      </div>

      <!-- SIGNATURE -->
      <div class="section-h-signature-wrap">

        <div class="section-h-signature-row">
          <span class="section-h-signature-label">
            Signature of the Insured
          </span>

          <span class="section-h-colon">:</span>

          <div class="section-h-sign-line">
            ${signatureDataUrl ? `<img src="${signatureDataUrl}" class="section-h-sign-img" />` : ""}
          </div>
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
        E-mail: customercfirst@careinsurance.com
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
      Page 4
    </div>

  </div>

</div>

</div><!-- /page -->
</body>
</html>`;
}

/* ─────────────────────────────────────────────
   EXPORT: downloadCareHealthFormA
   Web  → html2pdf.js  (PNG, scale 3, A4)
   Native → expo-print → expo-sharing
───────────────────────────────────────────── */
export async function downloadCareHealthFormA(form, signatureDataUrl = null) {
  const patientName =
    String(form?.primaryName ?? "")
      .trim()
      .replace(/\s+/g, "_") || "Patient";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `CareHealthFormA_InsuranceClaim_${patientName}_${date}.pdf`;
  const html = generateCareHealthFormAHTML(form, signatureDataUrl);

  /* ── WEB ── */
  if (Platform.OS === "web") {
    const html2pdf = (await import("html2pdf.js")).default;

    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");
    const styleEl = parsed.querySelector("style");
    const rootEl = parsed.querySelector(".page");

    if (!styleEl || !rootEl)
      throw new Error("HTML template missing style or .page");

    const injStyle = document.createElement("style");
    injStyle.setAttribute("data-ins-pdf", "1");
    injStyle.textContent = styleEl.textContent;
    document.head.appendChild(injStyle);

    const host = document.createElement("div");
    host.setAttribute("data-ins-pdf", "1");
    host.style.cssText =
      "position:fixed;left:-9999px;top:0;width:210mm;background:#fff;";
    host.appendChild(document.importNode(rootEl, true));
    document.body.appendChild(host);

    try {
      await new Promise((res) =>
        requestAnimationFrame(() => requestAnimationFrame(res)),
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
        .from(host.firstElementChild)
        .save(fileName);
    } finally {
      injStyle.remove();
      host.remove();
    }
    return;
  }

  /* ── NATIVE (iOS / Android) ── */
  const { uri } = await Print.printToFileAsync({ html });
  const destDir =
    FileSystem["documentDirectory"] ?? FileSystem["cacheDirectory"] ?? ""; // eslint-disable-line import/namespace
  const destUri = destDir + fileName;
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
