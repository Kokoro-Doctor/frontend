/**
 * Medi Assist – Reimbursement Claim Form A: HTML/CSS template and PDF download.
 * Screen + field mapping: MediAssistFormA.jsx (buildInitialForm, form state).
 * Add Form B as a parallel module (e.g. MediAssistFormB.js + MediAssistFormB.jsx) using the same pattern.
 */
import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

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
  const padded = String(value ?? "").padEnd(count, " ").slice(0, count);
  return padded
    .split("")
    .map(
      (ch) =>
        `<span class="cb">${ch === " " ? "&nbsp;" : esc(ch)}</span>`
    )
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
  const r = String(rel ?? "").toLowerCase().trim();
  if (!r) return false;
  const k = key.toLowerCase();
  if (k === "other")
    return !["self", "spouse", "child", "father", "mother"].some((x) => r === x || r.includes(x));
  return r === k || r.includes(k);
}

/* Occupation matching */
function occMatch(occ, key) {
  const o = String(occ ?? "").toLowerCase().trim();
  if (!o) return false;
  const k = key.toLowerCase();
  if (k === "other")
    return !["service", "self", "home", "student", "retired"].some((x) => o.includes(x));
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
  if (key === "multi") return r.includes("3") || r.includes("more") || r.includes("general") || r.includes("shared");
  return false;
}

/* Hospitalization cause matching */
function causeMatch(cause, key) {
  const c = String(cause ?? "").toLowerCase();
  if (key === "injury") return c.includes("injur");
  if (key === "illness") return c.includes("ill") || c.includes("disease") || c.includes("sick");
  if (key === "maternity") return c.includes("mater") || c.includes("deliver") || c.includes("pregnan");
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

/* ─────────────────────────────────────────────
   MAIN EXPORT: generateMediAssistFormAHTML
   Produces a pixel-accurate A4 HTML replica of
   the Medi Assist Reimbursement Claim Form.
───────────────────────────────────────────── */
export function generateMediAssistFormAHTML(form, signatureDataUrl = null) {
  const f = form ?? {};

  /* Pre-compute relationship "Other specify" text */
  const relOtherText =
    f.relationship &&
    !["self", "spouse", "child", "father", "mother"].some(
      (x) => String(f.relationship).toLowerCase().trim() === x
    )
      ? f.relationship
      : "";

  /* Pre-compute occupation "Other specify" text */
  const occOtherText = (() => {
    const o = String(f.occupation ?? "").trim();
    if (!o) return "";
    if (occMatch(o, "service") || occMatch(o, "self employed") ||
        occMatch(o, "home maker") || occMatch(o, "student") ||
        occMatch(o, "retired")) return "";
    return o;
  })();

  /* Bills rows — 10 rows, pre-filled labels for first 4 */
  const billLabels = [
    "Hospital main Bill",
    "Pre-hospitalization Bills:   Nos",
    "Post-hospitalization Bills:  Nos",
    "Pharmacy Bills",
    "", "", "", "", "", "",
  ];
  const billRows = Array.from({ length: 10 }, (_, i) => {
    const r = (f.billsRows && f.billsRows[i]) ?? {};
    return {
      billNo: r.billNo ?? "",
      date: r.date ?? "",
      issuedBy: r.issuedBy ?? "",
      towards: (r.towards && r.towards.trim()) ? r.towards : billLabels[i],
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1.2px solid #000;
  padding-bottom: 3px;
  margin-bottom: 3px;
}
.hdr-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 28mm;
}
.hdr-logo-circle {
  width: 22px; height: 22px;
  background: #c00;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 10px; font-weight: 900;
  margin-bottom: 2px;
}
.hdr-logo-text { font-size: 9px; font-weight: 700; color: #c00; }
.hdr-center { flex: 1; text-align: center; padding: 0 6px; }
.hdr-main { font-size: 11px; font-weight: 900; letter-spacing: 0.4px; }
.hdr-sub  { font-size: 7px; font-weight: 700; margin-top: 1px; }
.hdr-note { font-size: 6.5px; margin-top: 1px; font-style: italic; }
.hdr-right { font-size: 6.5px; font-style: italic; white-space: nowrap; padding-top: 2px; }

/* ── SECTION WRAPPER ── */
.sec-wrap {
  display: flex;
  border: 0.6px solid #aaa;
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
.lbl  { font-size: 6.5px; font-weight: 700; white-space: nowrap; }
.txt  { font-size: 6.5px; }

/* ── CHARACTER BOXES ── */
.cb-row { display: inline-flex; }
.cb {
  display: inline-flex;
  width: 7.5px;
  height: 9px;
  border: 0.5px solid #777;
  font-size: 5.5px;
  font-family: monospace;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0;
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
</style>
</head>
<body>
<div class="page">

<!-- ══════════ HEADER ══════════ -->
<div class="hdr">
  <div class="hdr-logo">
    <div class="hdr-logo-circle">A</div>
    <div class="hdr-logo-text">Medi Assist</div>
  </div>
  <div class="hdr-center">
    <div class="hdr-main">REIMBURSEMENT CLAIM FORM</div>
    <div class="hdr-sub">TO BE FILLED BY THE INSURED</div>
    <div class="hdr-note">The issue of this Form is not to be taken as an admission of liablity</div>
  </div>
  <div class="hdr-right">(To be Filled in block letters)</div>
</div>

<!-- ══════════ SECTION A: PRIMARY INSURED ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DETAILS OF PRIMARY INSURED:")}

    <!-- a) Policy + b) Certificate -->
    <div class="row-sb">
      <div class="row">
        <span class="lbl">a) Policy No.:</span>
        <span class="cb-row">${boxes(f.policyNumber, 18)}</span>
      </div>
      <div class="row">
        <span class="lbl">b) Sl. No/ Certificate no.</span>
        <span class="cb-row">${boxes(f.certificateNumber, 14)}</span>
      </div>
    </div>

    <!-- c) TPA ID -->
    <div class="row">
      <span class="lbl">c) Company / TPA ID (MA ID)No:</span>
      <span class="cb-row">${boxes(f.tpaId, 22)}</span>
    </div>

    <!-- d) Name -->
    <div class="row">
      <span class="lbl">d) Name:</span>
      <span class="cb-row">${boxes(f.primaryName, 40)}</span>
    </div>

    <!-- e) Address -->
    <div class="row" style="align-items:flex-start">
      <span class="lbl">e)Address:</span>
      <div>
        <div class="cb-row" style="display:flex">${boxes(f.primaryAddressRow1, 40)}</div>
        <div class="cb-row" style="display:flex;margin-top:1px">${boxes(f.primaryAddressRow2, 35)}</div>
      </div>
    </div>

    <!-- City + State -->
    <div class="row-sb" style="padding-left:20px">
      <div class="row"><span class="lbl">City:</span> <span class="cb-row">${boxes(f.primaryCity, 18)}</span></div>
      <div class="row"><span class="lbl">State:</span> <span class="cb-row">${boxes(f.primaryState, 18)}</span></div>
    </div>

    <!-- Pin + Phone + Email -->
    <div class="row" style="gap:10px;padding-left:10px">
      <div class="row"><span class="lbl">Pin Code</span> <span class="cb-row">${boxes(f.primaryPin, 6)}</span></div>
      <div class="row"><span class="lbl">Phone No:</span> <span class="cb-row">${boxes(f.primaryPhone, 10)}</span></div>
      <div class="row"><span class="lbl">Email ID:</span> <span class="uline uline-xl">${esc(f.primaryEmail)}</span></div>
    </div>
  </div>
  ${secBar("SECTION A")}
</div>

<!-- ══════════ SECTION B: INSURANCE HISTORY ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DETAILS OF INSURANCE HISTORY:")}

    <div class="row-sb">
      <div class="row">
        <span class="lbl">a) Currently covered by any other Mediclaim / Health Insurance:</span>
        ${chk(f.bCurrentlyOther === "yes")}<span class="txt">Yes</span>
        ${chk(f.bCurrentlyOther === "no")}<span class="txt">No</span>
      </div>
      <div class="row">
        <span class="lbl">b) Date of commencement of first Insurance without break:</span>
        <span class="cb-row">${boxes(f.bCommencement, 8)}</span>
      </div>
    </div>

    <div class="row-sb">
      <div class="row">
        <span class="lbl">c) If yes, company name:</span>
        <span class="cb-row">${boxes(f.bIfYesCoName, 20)}</span>
      </div>
      <div class="row">
        <span class="lbl">Policy No.</span>
        <span class="cb-row">${boxes(f.bIfYesPolicy, 18)}</span>
      </div>
    </div>

    <div class="row-sb">
      <div class="row">
        <span class="lbl">Sum insured (Rs.)</span>
        <span class="cb-row">${boxes(f.bSumInsured, 12)}</span>
      </div>
      <div class="row">
        <span class="lbl">d) Have you been hospitalized in the last four years since inception of the contract?</span>
        ${chk(f.bHosp4Y === "yes")}<span class="txt">Yes</span>
        ${chk(f.bHosp4Y === "no")}<span class="txt">No</span>
        <span class="lbl" style="margin-left:5px">Date:</span>
        <span class="cb-row">${boxes(f.bHosp4YDate, 4)}</span>
      </div>
    </div>

    <div class="row-sb">
      <div class="row">
        <span class="lbl">Diagnosis:</span>
        <span class="uline" style="min-width:180px">${esc(f.diagnosis)}</span>
      </div>
      <div class="row">
        <span class="lbl">e) Previously covered by any other Mediclaim /Health insurance :</span>
        ${chk(f.bPreviouslyOther === "yes")}<span class="txt">Yes</span>
        ${chk(f.bPreviouslyOther === "no")}<span class="txt">No</span>
      </div>
    </div>

    <div class="row">
      <span class="lbl">f) If yes, company name:</span>
      <span class="cb-row">${boxes(f.bIfYesCoName2, 22)}</span>
    </div>
  </div>
  ${secBar("SECTION B")}
</div>

<!-- ══════════ SECTION C: INSURED PERSON HOSPITALIZED ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DETAILS OF INSURED PERSON HOSPITALIZED:")}

    <div class="row">
      <span class="lbl">a) Name:</span>
      <span class="cb-row">${boxes(f.hospitalizedName, 40)}</span>
    </div>

    <div class="row-sb">
      <div class="row">
        <span class="lbl">b) Gender</span>
        <span class="txt">Male</span>${chk(f.gender === "male")}
        <span class="txt">Female</span>${chk(f.gender === "female")}
      </div>
      <div class="row">
        <span class="lbl">c) Age years</span>
        <span class="cb-row">${boxes(f.ageYears, 2)}</span>
        <span class="txt">Months</span>
        <span class="cb-row">${boxes(f.ageMonths, 2)}</span>
      </div>
      <div class="row">
        <span class="lbl">d) Date of Birth</span>
        <span class="cb-row">${boxes(f.dob, 8)}</span>
      </div>
    </div>

    <!-- e) Relationship -->
    <div class="row">
      <span class="lbl">e) Relationship to Primary insured:</span>
      ${["Self","Spouse","Child","Father","Mother","Other"].map(r =>
        `${chk(relMatch(f.relationship, r))}<span class="txt">${r}</span>`
      ).join(" ")}
      <span class="txt">(Please Specify)</span>
      <span class="uline" style="min-width:70px">${esc(relOtherText)}</span>
    </div>

    <!-- f) Occupation -->
    <div class="row">
      <span class="lbl">f) Occupation</span>
      ${["Service","Self Employed","Home Maker","Student","Retired","Other"].map(o =>
        `${chk(occMatch(f.occupation, o))}<span class="txt">${o}</span>`
      ).join(" ")}
      <span class="txt">(Please Specify)</span>
      <span class="uline" style="min-width:70px">${esc(occOtherText)}</span>
    </div>

    <!-- g) Address -->
    <div class="row" style="align-items:flex-start">
      <span class="lbl">g) Address (if diffrent from above) :</span>
      <div>
        <div class="cb-row" style="display:flex">${boxes(f.hospAddressRow1, 40)}</div>
        <div class="cb-row" style="display:flex;margin-top:1px">${boxes(f.hospAddressRow2, 35)}</div>
      </div>
    </div>

    <div class="row-sb" style="padding-left:20px">
      <div class="row"><span class="lbl">City:</span> <span class="cb-row">${boxes(f.hospCity, 18)}</span></div>
      <div class="row"><span class="lbl">State:</span> <span class="cb-row">${boxes(f.hospState, 18)}</span></div>
    </div>

    <div class="row" style="gap:10px;padding-left:10px">
      <div class="row"><span class="lbl">Pin Code</span> <span class="cb-row">${boxes(f.hospPin, 6)}</span></div>
      <div class="row"><span class="lbl">Phone No:</span> <span class="cb-row">${boxes(f.hospPhone, 10)}</span></div>
      <div class="row"><span class="lbl">Email ID:</span> <span class="uline uline-xl">${esc(f.hospEmail)}</span></div>
    </div>
  </div>
  ${secBar("SECTION C")}
</div>

<!-- ══════════ SECTION D: HOSPITALIZATION ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DETAILS OF HOSPITALIZATION:")}

    <div class="row">
      <span class="lbl">a) Name of Hospital where Admited:</span>
      <span class="cb-row">${boxes(f.hospitalName, 40)}</span>
    </div>

    <div class="row">
      <span class="lbl">b) Room Category occupied:</span>
      ${chk(roomMatch(f.roomCategory,"day"))}<span class="txt">Day care</span>
      ${chk(roomMatch(f.roomCategory,"single"))}<span class="txt">Single occupancy</span>
      ${chk(roomMatch(f.roomCategory,"twin"))}<span class="txt">Twin sharing</span>
      ${chk(roomMatch(f.roomCategory,"multi"))}<span class="txt">3 or more beds per room</span>
    </div>

    <div class="row-sb">
      <div class="row">
        <span class="lbl">c) Hospitalization due to:</span>
        ${chk(causeMatch(f.hospitalizationCause,"injury"))}<span class="txt">Injury</span>
        ${chk(causeMatch(f.hospitalizationCause,"illness"))}<span class="txt">Illness</span>
        ${chk(causeMatch(f.hospitalizationCause,"maternity"))}<span class="txt">Maternity</span>
      </div>
      <div class="row">
        <span class="lbl">d) Date of injury / Date Disease first detected /Date of Delivery:</span>
        <span class="cb-row">${boxes(f.injuryDate, 8)}</span>
      </div>
    </div>

    <div class="row-sb">
      <div class="row"><span class="lbl">e) Date of Admission:</span> <span class="cb-row">${boxes(f.admissionDate, 8)}</span></div>
      <div class="row"><span class="lbl">f) Time</span> <span class="cb-row">${boxes(f.admissionTime, 4)}</span></div>
      <div class="row"><span class="lbl">g) Date of Discharge:</span> <span class="cb-row">${boxes(f.dischargeDate, 8)}</span></div>
      <div class="row"><span class="lbl">h) Time:</span> <span class="cb-row">${boxes(f.dischargeTime, 4)}</span></div>
    </div>

    <div class="row">
      <span class="lbl">I) If injury give cause:</span>
      ${chk(!!f.injurySelf)}<span class="txt">Self inflicted</span>
      ${chk(!!f.injuryRta)}<span class="txt">Road Traffic Accident</span>
      ${chk(!!f.injurySubstance)}<span class="txt">Substance Abuse / Alcohol Consumption</span>
      <span class="lbl" style="margin-left:8px">l) If Medico legal</span>
      ${chk(false)}<span class="txt">Yes</span>
      ${chk(false)}<span class="txt">No</span>
    </div>

    <div class="row-sb">
      <div class="row">
        <span class="lbl">ii) Reported to Police</span>
        ${chk(!!f.reportedPolice)}
      </div>
      <div class="row">
        <span class="lbl">iii. MLC Report &amp; Police FIR attached</span>
        ${chk(!!f.firYes)}<span class="txt">Yes</span>
        ${chk(!!f.firNo)}<span class="txt">No</span>
      </div>
      <div class="row">
        <span class="lbl">j) System of Medicine:</span>
        <span class="uline" style="min-width:90px">${esc(f.systemOfMedicine)}</span>
      </div>
    </div>
    <div class="row">
      <span class="lbl">Treating doctor / consultant:</span>
      <span class="uline" style="min-width:140px">${esc(f.treatingDoctor)}</span>
    </div>
  </div>
  ${secBar("SECTION D")}
</div>

<!-- ══════════ SECTION E: CLAIM DETAILS ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DETAILS OF CLAIM:")}
    <div class="sec-e-inner">
      <div class="sec-e-main">
        <div class="row"><span class="lbl">a) Details of the Treatment expenses claimed</span></div>

        <div class="row-sb">
          <div class="row"><span class="lbl">I. Pre -hospitalization expenses</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.claimPre, 8)}</span></div>
          <div class="row"><span class="lbl">ii. Hospitalization expenses Rs.</span> <span class="cb-row">${boxes(f.claimHospital, 8)}</span></div>
        </div>
        <div class="row-sb">
          <div class="row"><span class="lbl">iii. Post-hospitalization expenses</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.claimPost, 8)}</span></div>
          <div class="row"><span class="lbl">iv. Health-Check up cost: Rs.</span> <span class="cb-row">${boxes(f.healthCheckupCost, 8)}</span></div>
        </div>
        <div class="row-sb">
          <div class="row"><span class="lbl">v. Ambulance Charges:</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.ambulanceCharges, 8)}</span></div>
          <div class="row">
            <span class="lbl">vi. Others (code):</span>
            <span class="cb-row">${boxes(f.otherChargesCode, 3)}</span>
            <span class="lbl" style="margin-left:3px">Rs.</span>
            <span class="cb-row">${boxes(f.otherChargesAmount, 8)}</span>
          </div>
        </div>

        <!-- Total -->
        <div class="total-row">
          <span class="total-lbl">Total</span>
          <span class="lbl">Rs.</span>
          <span class="cb-row">${boxes(f.totalClaim, 10)}</span>
        </div>

        <div class="row-sb">
          <div class="row"><span class="lbl">vii. Pre -hospitalization period:</span> <span class="lbl">days</span> <span class="cb-row">${boxes(f.preHospPeriodDays, 3)}</span></div>
          <div class="row"><span class="lbl">viii. Post -hospitalization period: days</span> <span class="cb-row">${boxes(f.postHospPeriodDays, 3)}</span></div>
        </div>

        <div class="row">
          <span class="lbl">b) Claim for Domiciliary Hospitalization:</span>
          ${chk(f.domiciliary === "yes")}<span class="txt">Yes</span>
          ${chk(f.domiciliary === "no")}<span class="txt">No</span>
          <span class="txt">(If yes, provide details in annexure)</span>
        </div>

        <div class="row"><span class="lbl">c) Details of Lump sum / cash benefit claimed:</span></div>
        <div class="row-sb">
          <div class="row"><span class="lbl">i. Hospital Daily cash:</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.hospitalDailyCash, 8)}</span></div>
          <div class="row"><span class="lbl">ii. Surgical Cash:</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.surgicalCash, 8)}</span></div>
        </div>
        <div class="row-sb">
          <div class="row"><span class="lbl">iii. Critical Illness benefit:</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.criticalIllnessBenefit, 8)}</span></div>
          <div class="row"><span class="lbl">iv. Convalescence:</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.convalescence, 8)}</span></div>
        </div>
        <div class="row-sb">
          <div class="row"><span class="lbl">v. Pre/Post hospitalization Lump sum benefit Rs.</span> <span class="cb-row">${boxes(f.prePostLumpSum, 8)}</span></div>
          <div class="row"><span class="lbl">vi. Others</span> <span class="lbl">Rs.</span> <span class="cb-row">${boxes(f.othersLump, 8)}</span></div>
        </div>
        <div class="total-row" style="font-size:6.5px">
          <span class="lbl">Total</span>
          <span class="lbl">Rs.</span>
          <span class="cb-row">${boxes("", 10)}</span>
        </div>
      </div>

      <!-- Checklist -->
      <div class="sec-e-chk">
        <div class="chk-title">Claim Documents Submitted - Check List:</div>
        ${checklistItems.map((item, i) => `
          <div class="chk-item">
            ${chk(!!(f.docChecklist && f.docChecklist[i]))}
            <span>${esc(item)}</span>
          </div>`).join("")}
      </div>
    </div>
  </div>
  ${secBar("SECTION E")}
</div>

<!-- ══════════ SECTION F: BILLS ENCLOSED ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DETAILS OF BILLS ENCLOSED:")}
    <table class="bills-tbl">
      <thead>
        <tr>
          <th style="width:22px">Sl. No.</th>
          <th style="width:50px">Bill No.</th>
          <th style="width:65px">Date</th>
          <th style="width:110px">Issued by</th>
          <th>Towards</th>
          <th style="width:90px">Amount (Rs)</th>
        </tr>
      </thead>
      <tbody>
        ${billRows.map((r, i) => `
        <tr>
          <td class="ctr">${i + 1}.</td>
          <td>${esc(r.billNo)}</td>
          <td>${esc(r.date)}</td>
          <td>${esc(r.issuedBy)}</td>
          <td>${esc(r.towards)}</td>
          <td>${esc(r.amount)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>
  ${secBar("SECTION F")}
</div>

<!-- ══════════ SECTION G: BANK ACCOUNT ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DETAILS OF PRIMARY INSURED'S BANK ACCOUNT:")}

    <div class="row-sb">
      <div class="row"><span class="lbl">a) PAN:</span> <span class="cb-row">${boxes(f.pan, 10)}</span></div>
      <div class="row"><span class="lbl">b) Account Number:</span> <span class="cb-row">${boxes(f.accountNumber, 22)}</span></div>
    </div>

    <div class="row">
      <span class="lbl">c) Bank Name and Branch:</span>
      <span class="cb-row">${boxes(f.bankNameBranch, 40)}</span>
    </div>

    <div class="row-sb">
      <div class="row">
        <span class="lbl">d) Cheque / DD Payable details:</span>
        <span class="uline uline-xxl">${esc(f.chequeDetails)}</span>
      </div>
      <div class="row">
        <span class="lbl">e) IFSC Code:</span>
        <span class="cb-row">${boxes(f.ifscCode, 11)}</span>
      </div>
    </div>
  </div>
  ${secBar("SECTION G")}
</div>

<!-- ══════════ SECTION H: DECLARATION ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">
    ${divider("DECLARATION BY THE INSURED:")}

    <p class="decl-text">
      I hereby declare that the information furnished in the claim form is true &amp; correct to the best of my knowledge and belief.
      If I have made any false or untrue statement, suppression or concealment of any material fact with respect to questions asked
      in relation to this claim, my right to claim reimbursement shall be forfeited. I also consent &amp; authorize TPA / insurance
      Company, to seek necessary medical information / documents from any hospital / Medical Practitioner who has attended on the
      person against whom this claim is made. I hereby declare that I have included all the bills / receipts for the purpose of this
      claim &amp; that I will not be making any supplementary claim except the pre/post-hospitalization claim, if any.
    </p>

    <div class="row-sb" style="align-items:flex-end">
      <div class="row">
        <span class="lbl">Date</span>
        <span class="cb-row">${boxes(f.declarationDate, 8)}</span>
      </div>
      <div class="row">
        <span class="lbl">Place:</span>
        <span class="uline" style="min-width:110px">${esc(f.declarationPlace)}</span>
      </div>
    </div>

    <div class="sig-row">
      <span class="lbl">Signature of the Insured</span>
      ${sigBlock(signatureDataUrl)}
    </div>

    <div class="footer-line"></div>
    <div class="footer-note">(IMPORTANT: PLEASE TURN OVER)</div>
  </div>
  ${secBar("SECTION H")}
</div>

</div><!-- /page -->
</body>
</html>`;
}

/* ─────────────────────────────────────────────
   EXPORT: downloadMediAssistFormA
   Web  → html2pdf.js  (PNG, scale 3, A4)
   Native → expo-print → expo-sharing
───────────────────────────────────────────── */
export async function downloadMediAssistFormA(form, signatureDataUrl = null) {
  const patientName = String(form?.primaryName ?? "").trim().replace(/\s+/g, "_") || "Patient";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `MediAssistFormA_InsuranceClaim_${patientName}_${date}.pdf`;
  const html = generateMediAssistFormAHTML(form, signatureDataUrl);

  /* ── WEB ── */
  if (Platform.OS === "web") {
    const html2pdf = (await import("html2pdf.js")).default;

    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");
    const styleEl = parsed.querySelector("style");
    const rootEl  = parsed.querySelector(".page");

    if (!styleEl || !rootEl) throw new Error("HTML template missing style or .page");

    const injStyle = document.createElement("style");
    injStyle.setAttribute("data-ins-pdf", "1");
    injStyle.textContent = styleEl.textContent;
    document.head.appendChild(injStyle);

    const host = document.createElement("div");
    host.setAttribute("data-ins-pdf", "1");
    host.style.cssText = "position:fixed;left:-9999px;top:0;width:210mm;background:#fff;";
    host.appendChild(document.importNode(rootEl, true));
    document.body.appendChild(host);

    try {
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "png", quality: 1 },
          html2canvas: { scale: 3, useCORS: true, allowTaint: true, logging: false },
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
  const destUri = FileSystem.documentDirectory + fileName;
  await FileSystem.copyAsync({ from: uri, to: destUri });
  try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch (_) {}

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