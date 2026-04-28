/**
 * Medi Assist – Claim Form Part B (hospital section)
 * Pixel-matched to the scanned original.
 */
import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

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
  const v = String(value ?? "")
    .replace(/\D/g, "")
    .padEnd(4 + yearDigits, " ");
  const d1 = v[0] || " ",
    d2 = v[1] || " ";
  const m1 = v[2] || " ",
    m2 = v[3] || " ";
  const y = v.slice(4, 4 + yearDigits).padEnd(yearDigits, " ");
  const sep = `<span class="date-sep">|</span>`;
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
  const v = String(value ?? "")
    .replace(/\D/g, "")
    .padEnd(4, " ");
  const sep = `<span class="date-sep">|</span>`;
  const box = (ch) =>
    `<span class="cb">${ch === " " ? "&nbsp;" : esc(ch)}</span>`;
  return (
    `<span class="cb-f">${box(v[0])}${box(v[1])}</span>${sep}` +
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

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export function generateMediAssistFormBHTML(form, signatureDataUrl = null) {
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

/* ── HEADER ── */
.hdr {
  border: 1px solid #000;
  text-align: center;
  padding: 4px 40px 3px;
  position: relative;
}
.hdr-title  { font-size: 13px; font-weight: 900; }
.hdr-sub    { font-size: 8px; font-weight: 700; margin-top: 1px; }
.hdr-note   { font-size: 6.5px; font-style: italic; margin-top: 1px; }
.hdr-corner {
  position: absolute; right: 4px; top: 4px;
  font-size: 6px; font-style: italic;
}

/* ── SECTION HEADER ── */
.sh {
  border: 1px solid #000;
  border-top: none;
  padding: 2px 3px;
  font-size: 7.5px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sh-note { font-size: 6.5px; font-weight: 400; font-style: italic; }

/* ── SECTION WRAPPER ── */
.sw { display: flex; border: 1px solid #000; border-top: none; }
.sb { flex: 1; min-width: 0; padding: 2px 3px; overflow: hidden; }

/* ── SECTION BAR ── */
.bar {
  width: 14px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  background: #1a1a1a; padding: 2px 0;
}
.bar-line { flex: 1; border-left: 0.5px solid #fff; }
.bar-txt {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: #fff; font-size: 5px; font-weight: 700;
  letter-spacing: 0.8px; white-space: nowrap; padding: 3px 0;
}

/* ──────────────────────────────────────────
   SECTION A TABLE — uses table-layout:auto
   so label columns size to their text and
   the box column takes all remaining space.
────────────────────────────────────────── */
.ft-auto {
  max-width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}
.ft-auto td {
  padding: 1.5px 2px;
  vertical-align: middle;
  font-size: 7px;
  white-space: nowrap;
  overflow: visible;
}
.ft-auto td.grow {
  width: 100%;
  white-space: nowrap;
}

/* ── FIXED-LAYOUT TABLE ── */
.ft {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.ft td {
  padding: 1.5px 2px;
  vertical-align: middle;
  font-size: 7px;
  overflow: hidden;
  white-space: nowrap;
}
td.s { width: auto; }

/* ── CHARACTER BOXES ── */
.cb-s { display: flex; width: 100%; }
.cb-s .cb { flex: 1; min-width: 0; }

.cb-f { display: inline-flex; }
.cb-f .cb { width: 8px; flex: none; }

.cb {
  height: 10px;
  border: 0.5px solid #666;
  font-size: 5.5px; font-family: monospace;
  text-align: center; line-height: 10px;
  overflow: hidden; flex-shrink: 0;
}

/* ── DATE / TIME SEPARATOR ── */
.date-sep {
  display: inline-block;
  font-size: 8px;
  font-weight: 900;
  vertical-align: middle;
  line-height: 10px;
  padding: 0 0.5px;
  color: #333;
}

/* ── CHECKBOXES ── */
.chk {
  display: inline-block;
  width: 7.5px; height: 7.5px;
  border: 0.7px solid #222;
  margin: 0 1px; vertical-align: middle;
  font-size: 5.5px; text-align: center; line-height: 7.5px;
}
.chk-on { background: #1565C0; color: #fff; border-color: #1565C0; }

/* ── LABELS ── */
.lb  { font-size: 7px; font-weight: 700; white-space: nowrap; }
.lb2 { font-size: 7px; white-space: nowrap; }
.lbi { font-size: 6.5px; font-style: italic; white-space: nowrap; }

/* ── UNDERLINE FIELDS ── */
.ul {
  display: inline-block;
  border-bottom: 0.6px solid #555;
  font-size: 7px; padding: 0 1px;
  vertical-align: bottom;
}
.ul-full {
  display: block; width: 100%;
  border-bottom: 0.6px solid #555;
  min-height: 9px; font-size: 7px;
}

/* ── ICD TABLE ── */
.icd-wrap { display: flex; gap: 3px; margin-bottom: 3px; }
.icd-half { flex: 1; min-width: 0; }
.icd-tbl  { width: 100%; border-collapse: collapse; font-size: 6.5px; }
.icd-tbl th, .icd-tbl td {
  border: 0.5px solid #888; padding: 1.5px 2px; vertical-align: middle;
}
.icd-tbl th { background: #efefef; font-weight: 700; text-align: center; }
.icd-row { display: flex; align-items: center; gap: 3px; white-space: nowrap; }

/* ── CHECKLIST ── */
.clt { width: 100%; border-collapse: collapse; font-size: 7px; }
.clt td { padding: 1.5px 3px; vertical-align: middle; }
.cli { display: flex; align-items: center; gap: 3px; }

/* ── SIGNATURE ── */
.sig-box {
  width: 55mm; height: 22mm;
  border: 0.8px solid #000;
  display: inline-block; overflow: hidden;
}
.sig-img { width: 100%; height: 100%; object-fit: contain; object-position: left bottom; }
</style>
</head>
<body>
<div class="page">

<!-- ══════════ HEADER ══════════ -->
<div class="hdr">
  <div class="hdr-corner">(To be Filled in block letters)</div>
  <div class="hdr-title">CLAIM FORM - PART B</div>
  <div class="hdr-sub">TO BE FILLED IN BY THE HOSPITAL</div>
  <div class="hdr-note">The issue of this Form is not to be taken as an admission of liability</div>
  <div class="hdr-note">Please include the original preauthorization request form in lieu of PART A</div>
</div>

<!-- ══════════ SECTION A ══════════ -->
<div class="sh">DETAILS OF HOSPITAL</div>
<div class="sw">
  <div class="sb">
    <table class="ft-auto">

      <!-- ROW 1: a) Hospital name -->
      <tr>
        <td><span class="lb">a) Name of the hospital:</span></td>
        <td class="grow">${boxes(f.hospitalName, 60, "stretch")}</td>
      </tr>

      <!-- ROW 2: a) Hospital ID + c) Network — labels match original PDF -->
      <tr>
        <td><span class="lb">a) Hospital ID:</span></td>
        <td>${boxes(f.hospitalId, 20, "fixed")}</td>
        <td><span class="lb">c) Type of Hospital:</span></td>
        <td><span class="lb2">Network</span> ${chk(f.hospitalNetwork === "network")}</td>
        <td><span class="lb2">Non Network</span> ${chk(f.hospitalNetwork === "non_network")}</td>
        <td class="grow"><span class="lbi">(if non network fill section E)</span></td>
      </tr>

      <!-- ROW 3: c) Treating doctor — Surname / First / Middle with character boxes -->
      <tr>
        <td><span class="lb">c) Name of the treating doctor:</span></td>
        <td colspan="5" class="grow">
          <span class="lb">Surname:</span>&nbsp;${boxes(f.treatingDoctorSurname, 10, "fixed")}
          <span class="lb" style="margin-left:4px">First:</span>&nbsp;${boxes(f.treatingDoctorFirst, 10, "fixed")}
          <span class="lb" style="margin-left:4px">Middle:</span>&nbsp;${boxes(f.treatingDoctorMiddle, 10, "fixed")}
        </td>
      </tr>

      <!-- ROW 4: e) Qualification + f) Reg No + g) Phone -->
      <tr>
        <td><span class="lb">e) Qualification:</span></td>
        <td class="grow">${ul(f.qualification, 80)}</td>
        <td><span class="lb">f) Registration No. with State Code:</span></td>
        <td>${boxes(f.registrationNoStateCode, 14, "fixed")}</td>
        <td><span class="lb">g) Phone No.:</span></td>
        <td>${boxes(f.phoneNo, 11, "fixed")}</td>
      </tr>

    </table>
  </div>
  ${bar("SECTION A")}
</div>

<!-- ══════════ SECTION B ══════════ -->
<div class="sh">DETAILS OF THE PATIENT ADMITTED</div>
<div class="sw">
  <div class="sb">
    <table class="ft-auto">

      <!-- a) Patient name -->
      <tr>
        <td><span class="lb">a) Name of the Patient:</span></td>
        <td colspan="6" class="grow">
          <span class="lb">Surname:</span>&nbsp;${boxes(f.patientSurname, 10, "fixed")}
          <span class="lb" style="margin-left:4px">First:</span>&nbsp;${boxes(f.patientFirst, 10, "fixed")}
          <span class="lb" style="margin-left:4px">Middle:</span>&nbsp;${boxes(f.patientMiddle, 10, "fixed")}
        </td>
      </tr>

      <!-- b) IP Reg + c) Gender + d) Age -->
      <tr>
        <td style="white-space:nowrap"><span class="lb">b) IP Registration Number:</span></td>
        <td style="white-space:nowrap">${boxes(f.ipRegNumber, 12, "fixed")}</td>
        <td style="white-space:nowrap">
          <span class="lb">c) Gender:</span>
          <span class="lb2"> Male</span>&nbsp;${chk(f.gender === "male")}
          <span class="lb2"> Female</span>&nbsp;${chk(f.gender === "female")}
        </td>
        <td style="white-space:nowrap">
          <span class="lb">d) Age: Years</span>&nbsp;${boxes(f.ageYears, 2, "fixed")}
          <span class="lb2">&nbsp;Months</span>&nbsp;${boxes(f.ageMonths, 2, "fixed")}
        </td>
        <td colspan="3" class="grow" style="white-space:nowrap">
          <span class="lb">e) Date of birth:</span>&nbsp;${dateBoxes(f.dob, 2)}
        </td>
      </tr>

      <!-- f) Admission + g) Time + h) Discharge + i) Time -->
      <tr>
        <td colspan="2" style="white-space:nowrap">
          <span class="lb">f) Date of Admission:</span>&nbsp;${dateBoxes(f.admissionDate, 2)}
        </td>
        <td style="white-space:nowrap">
          <span class="lb">g) Time:</span>&nbsp;${timeBoxes(f.admissionTime)}
        </td>
        <td colspan="2" style="white-space:nowrap">
          <span class="lb">h) Date of Discharge:</span>&nbsp;${dateBoxes(f.dischargeDate, 2)}
        </td>
        <td colspan="2" class="grow" style="white-space:nowrap">
          <span class="lb">i) Time:</span>&nbsp;${timeBoxes(f.dischargeTime)}
        </td>
      </tr>

      <!-- j) Type of Admission + k) Maternity + Delivery + Gravida -->
      <tr>
        <td colspan="3" style="white-space:nowrap">
          <span class="lb">j) Type of Admission:</span>
          <span class="lb2"> Emergency</span>&nbsp;${chk(f.typeOfAdmission === "emergency")}
          <span class="lb2"> Planned</span>&nbsp;${chk(f.typeOfAdmission === "planned")}
          <span class="lb2"> Day Care</span>&nbsp;${chk(f.typeOfAdmission === "day_care")}
          <span class="lb2"> Maternity</span>&nbsp;${chk(f.typeOfAdmission === "maternity")}
        </td>
        <td style="white-space:nowrap"><span class="lb">k) If Maternity</span></td>
        <td colspan="2" style="white-space:nowrap">
          <span class="lb">i) Date of Delivery:</span>&nbsp;${dateBoxes(f.dateOfDelivery, 2)}
        </td>
        <td class="grow" style="white-space:nowrap">
          <span class="lb">ii) Gravida Status:</span>&nbsp;${boxes(f.gravidaStatus, 4, "fixed")}
        </td>
      </tr>

      <!-- l) Discharge status + m) Total claimed -->
      <tr>
        <td colspan="4" style="white-space:nowrap">
          <span class="lb">l) Status at time of discharge:</span>
          <span class="lb2"> Discharge to home</span>&nbsp;${chk(f.dischargeStatus === "home")}
          <span class="lb2"> Discharge to another hospital</span>&nbsp;${chk(f.dischargeStatus === "another_hospital")}
          <span class="lb2"> Deceased</span>&nbsp;${chk(f.dischargeStatus === "deceased")}
        </td>
        <td colspan="3" class="grow" style="white-space:nowrap">
          <span class="lb">m) Total claimed amount:</span>&nbsp;${ul(f.totalClaimedAmount, 55)}
        </td>
      </tr>

    </table>

  </div>
  ${bar("SECTION B")}
</div>

<!-- ══════════ SECTION C ══════════ -->
<div class="sh">DETAILS OF AILMENT DIAGNOSED (PRIMARY)</div>
<div class="sw">
  <div class="sb">

    <!-- ICD two-column table -->
    <div class="icd-wrap">
      <!-- LEFT: diagnoses -->
      <div class="icd-half">
        <div style="font-size:7px;font-weight:700;margin-bottom:1px">a)</div>
        <table class="icd-tbl">
          <thead>
            <tr>
              <th style="width:90px">ICD 10 Codes</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${diags
              .map(
                (d, i) => `
            <tr>
              <td>
                <div class="icd-row">
                  <span>${diagLabels[i]}</span>
                  ${boxes(d.icd, 7, "fixed")}
                </div>
              </td>
              <td>${ulFull(d.desc)}</td>
            </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- RIGHT: procedures -->
      <div class="icd-half">
        <div style="font-size:7px;font-weight:700;margin-bottom:1px">b)</div>
        <table class="icd-tbl">
          <thead>
            <tr>
              <th style="width:90px">ICD 10 PCS</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${procs
              .map(
                (p, i) => `
            <tr>
              <td>
                <div class="icd-row">
                  <span>${procLabels[i]}</span>
                  ${i < 3 ? boxes(p.icd, 7, "fixed") : ""}
                </div>
              </td>
              <td>${ulFull(p.desc)}</td>
            </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- c) Pre-auth + d) Pre-auth number -->
    <table class="ft-auto" style="margin-top:2px">
      <tr>
        <td><span class="lb">c) Pre-authorization obtained:</span></td>
        <td>
          ${chk(f.preAuthObtained === "yes")}<span class="lb2"> Yes</span>
          ${chk(f.preAuthObtained === "no")}<span class="lb2"> No</span>
        </td>
        <td><span class="lb">d) Pre-authorization Number:</span></td>
        <td class="grow">${boxes(f.preAuthNumber, 18, "stretch")}</td>
      </tr>

      <!-- e) reason -->
      <tr>
        <td colspan="2"><span class="lb">e) If authorization by network hospital not obtained, give reason:</span></td>
        <td colspan="2" class="grow">${ulFull(f.preAuthMissingReason)}</td>
      </tr>

      <!-- f) Injury -->
      <tr>
        <td colspan="4">
          <span class="lb">f) Hospitalization due to injury:</span>
          <span class="lb2"> Yes</span> ${chk(f.injuryHospitalization === "yes")}
          <span class="lb2"> No</span> ${chk(f.injuryHospitalization === "no")}
          <span class="lb" style="margin-left:8px">If Yes, give cause</span>
          <span class="lb2" style="margin-left:5px">Self-inflicted</span> ${chk(!!f.injurySelf)}
          <span class="lb2" style="margin-left:4px">Road Traffic Accident</span> ${chk(!!f.injuryRTA)}
          <span class="lb2" style="margin-left:4px">Substance abuse / alcohol consumption</span> ${chk(!!f.injurySubstance)}
        </td>
      </tr>

      <!-- i) substance + medico + police -->
      <tr>
        <td colspan="4" style="white-space:normal">
          <span class="lb2">i) If injury due to substance abuse / alcohol consumption, Test conducted to establish this:</span>
          ${chk(f.substanceTestDone === "yes")}<span class="lb2"> Yes</span>
          ${chk(f.substanceTestDone === "no")}<span class="lb2"> No</span>
          <span class="lbi"> (If Yes, attach reports)</span>
          <span class="lb" style="margin-left:6px">ii. If Medico legal:</span>
          <span class="lb2"> Yes</span> ${chk(f.medicoLegal === "yes")}
          <span class="lb2"> No</span> ${chk(f.medicoLegal === "no")}
          <span class="lb" style="margin-left:6px">iv. Reported to Police</span>
          <span class="lb2"> Yes</span> ${chk(f.reportedPolice === "yes")}
          <span class="lb2"> No</span> ${chk(f.reportedPolice === "no")}
        </td>
      </tr>

      <!-- v) FIR + vi) reason -->
      <tr>
        <td><span class="lb">v. FIR No.:</span></td>
        <td>${boxes(f.firNumber, 10, "fixed")}</td>
        <td><span class="lb">vi. If not reported to police give reason:</span></td>
        <td class="grow">${ulFull(f.firNotReportedReason)}</td>
      </tr>
    </table>

  </div>
  ${bar("SECTION C")}
</div>

<!-- ══════════ SECTION D ══════════ -->
<div class="sh">CLAIM DOCUMENTS SUBMITTED - CHECK LIST</div>
<div class="sw">
  <div class="sb">
    <table class="clt">
      <tbody>
        ${Array.from(
          { length: 8 },
          (_, i) => `
        <tr>
          <td style="width:50%">
            <div class="cli">${chk(cl[i])}<span>${esc(clLeft[i])}</span></div>
          </td>
          <td>
            <div class="cli">${chk(cl[i + 8])}<span>${esc(clRight[i])}</span></div>
          </td>
        </tr>`,
        ).join("")}
      </tbody>
    </table>
  </div>
  ${bar("SECTION D")}
</div>

<!-- ══════════ SECTION E ══════════ -->
<div class="sh">
  <span>ADDITIONAL DETAILS IN CASE OF NON NETWORK HOSPITAL</span>
  <span class="sh-note">(ONLY FILL IN CASE OF NON-NETWORK HOSPITAL)</span>
</div>
<div class="sw">
  <div class="sb">
    <table class="ft-auto">

      <!-- a) Address line 1 -->
      <tr>
        <td><span class="lb">a) Address of the Hospital:</span></td>
        <td class="grow">${boxes(f.nonNetAddress1, 60, "stretch")}</td>
      </tr>
      <!-- Address line 2 -->
      <tr>
        <td></td>
        <td class="grow">${boxes(f.nonNetAddress2, 60, "stretch")}</td>
      </tr>

      <!-- City + State — both with character boxes matching original PDF -->
      <tr>
        <td><span class="lb">City:</span></td>
        <td class="grow">
          ${boxes(f.nonNetCity, 20, "fixed")}
          <span class="lb" style="margin-left:6px">State:</span>
          ${boxes(f.nonNetState, 20, "fixed")}
        </td>
      </tr>

      <!-- Pin + Phone + Reg -->
      <tr>
        <td><span class="lb">Pin Code:</span></td>
        <td class="grow">
          ${boxes(f.nonNetPin, 6, "fixed")}
          <span class="lb" style="margin-left:6px">b) Phone No.:</span>
          ${boxes(f.nonNetPhone, 10, "fixed")}
          <span class="lb" style="margin-left:6px">c) Registration No. with State Code:</span>
          ${boxes(f.nonNetRegStateCode, 14, "fixed")}
        </td>
      </tr>

      <!-- PAN + beds + facilities -->
      <tr>
        <td><span class="lb">d) Hospital PAN:</span></td>
        <td class="grow">
          ${boxes(f.hospitalPan, 10, "fixed")}
          <span class="lb" style="margin-left:6px">e) Number of inpatient beds:</span>
          ${boxes(f.inpatientBeds, 5, "fixed")}
          <span class="lb" style="margin-left:6px">f) Facilities available in the hospital</span>
          <span class="lb2" style="margin-left:4px">i. OT</span>
          <span class="lb2"> Yes</span> ${chk(f.facilityOT === "yes")}
          <span class="lb2"> No</span> ${chk(f.facilityOT === "no")}
          <span class="lb2" style="margin-left:4px">ii. ICU</span>
          <span class="lb2"> Yes</span> ${chk(f.facilityICU === "yes")}
          <span class="lb2"> No</span> ${chk(f.facilityICU === "no")}
        </td>
      </tr>

      <!-- g) Others -->
      <tr>
        <td><span class="lb">g) Others:</span></td>
        <td class="grow">${ulFull(f.otherFacilities)}</td>
      </tr>

    </table>
  </div>
  ${bar("SECTION E")}
</div>

<!-- ══════════ SECTION F ══════════ -->
<div class="sh">
  <span>DECLARATION BY THE HOSPITAL</span>
  <span class="sh-note">(PLEASE READ VERY CAREFULLY)</span>
</div>
<div class="sw">
  <div class="sb">

    <p style="font-size:6px;line-height:1.4;margin-bottom:6px">
      We hereby declare that the information furnished in this Claim Form is true &amp; correct to the best of our knowledge and belief. If we have made any false or untrue statement, suppression or concealment of any material fact, our right to claim under this claim shall be forfeited.
    </p>

    <!-- Date / Place LEFT — Signature RIGHT -->
    <table class="ft-auto">
      <tr style="vertical-align:bottom">
        <td style="vertical-align:bottom">
          <div style="margin-bottom:6px">
            <span class="lb">Date:</span>
            ${dateBoxes(f.declarationDate, 2)}
          </div>
          <div>
            <span class="lb">Place:</span>
            ${ul(f.declarationPlace, 130)}
          </div>
        </td>
        <td class="grow" style="vertical-align:bottom;text-align:right">
          ${sigHtml}
          <div style="font-size:6.5px;margin-top:2px;text-align:center;width:55mm;display:inline-block">
            Signature and Seal of the Hospital Authority
          </div>
        </td>
      </tr>
    </table>

  </div>
  ${bar("SECTION F")}
</div>

</div>
</body>
</html>`;
}

/* ═══════════════════════════════════════════
   DOWNLOAD
═══════════════════════════════════════════ */
export async function downloadMediAssistFormB(form, signatureDataUrl = null) {
  const name =
    String(form?.hospitalName ?? "")
      .trim()
      .replace(/\s+/g, "_") || "Hospital";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `MediAssistFormB_${name}_${date}.pdf`;
  const html = generateMediAssistFormBHTML(form, signatureDataUrl);

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
  const destUri = FileSystem.documentDirectory + fileName;
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
