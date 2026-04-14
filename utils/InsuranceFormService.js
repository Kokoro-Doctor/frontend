import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

/** A4 at 96 DPI — must match .ifr container and jsPDF `format` on web */
export const INSURANCE_FORM_PAGE_WIDTH_PX = 794;
export const INSURANCE_FORM_PAGE_HEIGHT_PX = 1123;

/**
 * Set `true` to render the PDF capture node on-screen for a few seconds before cleanup
 * (compare with iframe preview). Keep `false` in production.
 */
const DEBUG_INSURANCE_PDF_CAPTURE = false;

// ─── HTML template helpers ────────────────────────────────────────────────────

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Each character gets its own bordered <td> in an inline-table.
 * Cell size: 11 × 13 px.  Uses display:inline-table so it flows inline.
 */
function charBoxHtml(value, length) {
  const padded = String(value ?? "").padEnd(length, " ").slice(0, length);
  const cells = padded
    .split("")
    .map(
      (ch) =>
        `<td style="width:11px;height:13px;border:0.5px solid #666;` +
        `text-align:center;vertical-align:middle;` +
        `font-size:8px;font-family:'Courier New',monospace;padding:0;">` +
        `${ch === " " ? "&nbsp;" : escHtml(ch)}</td>`,
    )
    .join("");
  return (
    `<table style="display:inline-table;border-collapse:collapse;` +
    `vertical-align:middle;"><tbody><tr>${cells}</tr></tbody></table>`
  );
}

function checkBox(checked) {
  return checked
    ? `<span style="display:inline-block;width:9px;height:9px;` +
        `border:0.5px solid #555;text-align:center;line-height:9px;` +
        `font-size:7px;vertical-align:middle;` +
        `background:#1565C0;color:#fff;margin:0 1px;">&#10003;</span>`
    : `<span style="display:inline-block;width:9px;height:9px;` +
        `border:0.5px solid #555;line-height:9px;` +
        `vertical-align:middle;margin:0 1px;"></span>`;
}

/** Inline underline text field */
function tf(value, minWidth = "80px") {
  return (
    `<span style="display:inline-block;min-width:${minWidth};` +
    `border-bottom:0.5px solid #555;font-size:8px;` +
    `padding:0 1px;vertical-align:bottom;">` +
    `${escHtml(String(value ?? ""))}&nbsp;</span>`
  );
}

/** Bold span */
function b(text) {
  return `<span style="font-weight:bold;">${text}</span>`;
}

/** 2-column layout row */
function r2(left, right, wl = "50%") {
  return (
    `<table style="width:100%;border-collapse:collapse;margin-bottom:2px;` +
    `table-layout:fixed;"><tbody><tr>` +
    `<td style="vertical-align:top;width:${wl};padding-right:4px;">${left}</td>` +
    `<td style="vertical-align:top;">${right}</td>` +
    `</tr></tbody></table>`
  );
}

/** 3-column layout row */
function r3(col1, col2, col3, wa = "33%", wb = "33%") {
  return (
    `<table style="width:100%;border-collapse:collapse;margin-bottom:2px;` +
    `table-layout:fixed;"><tbody><tr>` +
    `<td style="vertical-align:top;width:${wa};padding-right:3px;">${col1}</td>` +
    `<td style="vertical-align:top;width:${wb};padding-right:3px;">${col2}</td>` +
    `<td style="vertical-align:top;">${col3}</td>` +
    `</tr></tbody></table>`
  );
}

/** 4-column layout row */
function r4(col1, col2, col3, col4) {
  return (
    `<table style="width:100%;border-collapse:collapse;margin-bottom:2px;` +
    `table-layout:fixed;"><tbody><tr>` +
    `<td style="vertical-align:top;padding-right:3px;">${col1}</td>` +
    `<td style="vertical-align:top;padding-right:3px;">${col2}</td>` +
    `<td style="vertical-align:top;padding-right:3px;">${col3}</td>` +
    `<td style="vertical-align:top;">${col4}</td>` +
    `</tr></tbody></table>`
  );
}

/** Section content + narrow dark bar on the right with vertical label */
function secWrap(content, label) {
  return (
    `<table style="width:100%;border:0.5px solid #aaa;border-collapse:collapse;` +
    `margin-bottom:2px;table-layout:fixed;"><tbody><tr>` +
    `<td style="vertical-align:top;padding:4px 5px;">${content}</td>` +
    `<td style="width:14px;background:#1a1a1a;color:#fff;` +
    `writing-mode:vertical-rl;transform:rotate(180deg);` +
    `text-align:center;font-size:7px;font-weight:bold;` +
    `letter-spacing:0.8px;white-space:nowrap;` +
    `padding:3px 1px;vertical-align:middle;">${label}</td>` +
    `</tr></tbody></table>`
  );
}

/** Section E: 3-column — main content | checklist sidebar | section bar */
function secWrap3(left, right, label) {
  return (
    `<table style="width:100%;border:0.5px solid #aaa;border-collapse:collapse;` +
    `margin-bottom:2px;table-layout:fixed;"><tbody><tr>` +
    `<td style="vertical-align:top;padding:4px 5px;">${left}</td>` +
    `<td style="width:130px;vertical-align:top;padding:4px 5px;` +
    `border-left:0.5px solid #ccc;">${right}</td>` +
    `<td style="width:14px;background:#1a1a1a;color:#fff;` +
    `writing-mode:vertical-rl;transform:rotate(180deg);` +
    `text-align:center;font-size:7px;font-weight:bold;` +
    `letter-spacing:0.8px;white-space:nowrap;` +
    `padding:3px 1px;vertical-align:middle;">${label}</td>` +
    `</tr></tbody></table>`
  );
}

/** ─── LABEL ─── centered divider with horizontal rules */
function secDiv(label) {
  return (
    `<table style="width:100%;border-collapse:collapse;margin-bottom:3px;">` +
    `<tbody><tr>` +
    `<td style="border-bottom:0.5px solid #555;"></td>` +
    `<td style="white-space:nowrap;padding:0 5px 1px;font-weight:bold;` +
    `font-size:8px;vertical-align:bottom;width:1%;">${label}</td>` +
    `<td style="border-bottom:0.5px solid #555;"></td>` +
    `</tr></tbody></table>`
  );
}

/** Address label + two rows of char boxes in a table */
function addrBlock(labelHtml, row1Html, row2Html) {
  return (
    `<table style="width:100%;border-collapse:collapse;margin-bottom:2px;">` +
    `<tbody><tr>` +
    `<td style="white-space:nowrap;vertical-align:top;` +
    `padding-right:3px;width:1%;">${labelHtml}</td>` +
    `<td style="vertical-align:top;">` +
    `${row1Html}<br>${row2Html}` +
    `</td></tr></tbody></table>`
  );
}

/** Signature block: embedded image or plain bordered box */
function signatureBlockHtml(dataUrl) {
  const s = dataUrl && String(dataUrl).trim();
  if (s && s.startsWith("data:image/")) {
    return (
      `<span style="display:inline-block;width:180px;min-height:50px;` +
      `border:0.5px solid #555;vertical-align:bottom;padding:2px;">` +
      `<img src="${s}" alt="" style="width:150px;height:auto;max-width:100%;` +
      `object-fit:contain;object-position:left bottom;" /></span>`
    );
  }
  return (
    `<span style="display:inline-block;width:90px;min-height:35px;` +
    `border:0.5px solid #555;vertical-align:bottom;"></span>`
  );
}

// ─── Main HTML generator ──────────────────────────────────────────────────────

/**
 * Build a styled A4 HTML string from the filled insurance form state.
 * Pure table/block layout — no flexbox, no grid.
 * @param {Object} form - the `form` state from HospitalInsuranceDownload
 * @param {string | null} [signatureDataUrl] - optional PNG data URI from the e-sign capture
 * @returns {string} HTML string
 */
export function generateInsuranceFormHTML(form, signatureDataUrl = null) {
  const f = form || {};
  const sigHtml = signatureBlockHtml(signatureDataUrl);

  // ── SECTION A: PRIMARY INSURED ──────────────────────────────────────────────
  const secA = secWrap(
    secDiv("DETAILS OF PRIMARY INSURED:") +
    r2(
      b("a) Policy No.:") + " " + charBoxHtml(f.policyNumber, 18),
      b("b) Sl. No./Certificate no.") + " " + charBoxHtml(f.certificateNumber, 14),
      "55%",
    ) +
    `<div style="margin-bottom:2px;">${b("c) Company / TPA ID (MA ID) No:")} ${charBoxHtml(f.tpaId, 22)}</div>` +
    `<div style="margin-bottom:2px;">${b("d) Name:")} ${charBoxHtml(f.primaryName, 40)}</div>` +
    addrBlock(
      b("e) Address:"),
      charBoxHtml(f.primaryAddressRow1, 40),
      charBoxHtml(f.primaryAddressRow2, 35),
    ) +
    r2(
      b("City:") + " " + charBoxHtml(f.primaryCity, 18),
      b("State:") + " " + charBoxHtml(f.primaryState, 18),
    ) +
    r3(
      b("Pin Code:") + " " + charBoxHtml(f.primaryPin, 6),
      b("Phone No:") + " " + charBoxHtml(f.primaryPhone, 10),
      b("Email ID:") + " " + tf(f.primaryEmail, "100px"),
    ),
    "SECTION A",
  );

  // ── SECTION B: INSURANCE HISTORY ───────────────────────────────────────────
  const secB = secWrap(
    secDiv("DETAILS OF INSURANCE HISTORY:") +
    r2(
      b("a) Currently covered by any other Mediclaim / Health Insurance:") +
        " " + checkBox(false) + `<span style="font-size:8px;">Yes</span>` +
        " " + checkBox(false) + `<span style="font-size:8px;">No</span>`,
      b("b) Date of commencement of first Insurance without break:") +
        " " + charBoxHtml("", 8),
    ) +
    r2(
      b("c) If yes, company name:") + " " + charBoxHtml("", 20),
      b("Policy No.") + " " + charBoxHtml("", 18),
    ) +
    r2(
      b("Sum insured (Rs.)") + " " + charBoxHtml("", 12),
      b("d) Hospitalized in last four years?") +
        " " + checkBox(false) + `<span style="font-size:8px;">Yes</span>` +
        " " + checkBox(false) + `<span style="font-size:8px;">No</span>` +
        `&nbsp;` + b("Date:") + " " + charBoxHtml("", 4),
    ) +
    r2(
      b("Diagnosis:") + " " + tf(f.diagnosis, "160px"),
      b("e) Previously covered by other Mediclaim?") +
        " " + checkBox(false) + `<span style="font-size:8px;">Yes</span>` +
        " " + checkBox(false) + `<span style="font-size:8px;">No</span>`,
    ) +
    `<div style="margin-bottom:2px;">${b("f) If yes, company name:")} ${charBoxHtml("", 22)}</div>`,
    "SECTION B",
  );

  // ── SECTION C: INSURED PERSON HOSPITALIZED ─────────────────────────────────
  const secC = secWrap(
    secDiv("DETAILS OF INSURED PERSON HOSPITALIZED:") +
    `<div style="margin-bottom:2px;">${b("a) Name:")} ${charBoxHtml(f.hospitalizedName, 40)}</div>` +
    r3(
      b("b) Gender") +
        `&nbsp;<span style="font-size:8px;">Male</span>${checkBox(f.gender === "male")}` +
        `<span style="font-size:8px;">Female</span>${checkBox(f.gender === "female")}`,
      b("c) Age years") + " " + charBoxHtml(f.ageYears, 2) +
        `&nbsp;<span style="font-size:8px;">Months</span>&nbsp;` + charBoxHtml(f.ageMonths, 2),
      b("d) Date of Birth") + " " + charBoxHtml(f.dob, 8),
    ) +
    `<div style="margin-bottom:2px;">${b("e) Relationship to Primary insured:")} ` +
    ["Self", "Spouse", "Child", "Father", "Mother", "Other"]
      .map((r) => checkBox(false) + `<span style="font-size:8px;">${r}</span>`)
      .join("&nbsp;") +
    `&nbsp;<span style="font-size:7.5px;">(Please Specify)</span>&nbsp;${tf("", "50px")}</div>` +
    `<div style="margin-bottom:2px;">${b("f) Occupation")} ` +
    ["Service", "Self Employed", "Home Maker", "Student", "Retired", "Other"]
      .map((o) => checkBox(false) + `<span style="font-size:8px;">${o}</span>`)
      .join("&nbsp;") +
    `&nbsp;<span style="font-size:7.5px;">(Please Specify)</span>&nbsp;${tf("", "50px")}</div>` +
    addrBlock(
      b("g) Address (if different from above):"),
      charBoxHtml(f.hospAddressRow1, 40),
      charBoxHtml(f.hospAddressRow2, 35),
    ) +
    r2(
      b("City:") + " " + charBoxHtml(f.hospCity, 18),
      b("State:") + " " + charBoxHtml(f.hospState, 18),
    ) +
    r3(
      b("Pin Code:") + " " + charBoxHtml(f.hospPin, 6),
      b("Phone No:") + " " + charBoxHtml(f.hospPhone, 10),
      b("Email ID:") + " " + tf(f.hospEmail, "100px"),
    ),
    "SECTION C",
  );

  // ── SECTION D: HOSPITALIZATION ─────────────────────────────────────────────
  const secD = secWrap(
    secDiv("DETAILS OF HOSPITALIZATION:") +
    `<div style="margin-bottom:2px;">${b("a) Name of Hospital where Admitted:")} ${charBoxHtml(f.hospitalName, 40)}</div>` +
    `<div style="margin-bottom:2px;">${b("b) Room Category occupied:")} ` +
    ["Day care", "Single occupancy", "Twin sharing", "3 or more beds per room"]
      .map((r) => checkBox(false) + `<span style="font-size:8px;">${r}</span>`)
      .join("&nbsp;") +
    `</div>` +
    r2(
      b("c) Hospitalization due to:") + "&nbsp;" +
        ["Injury", "Illness", "Maternity"]
          .map((r) => checkBox(false) + `<span style="font-size:8px;">${r}</span>`)
          .join("&nbsp;"),
      b("d) Date of injury / Disease first detected / Delivery:") +
        " " + charBoxHtml(f.injuryDate, 8),
    ) +
    r4(
      b("e) Date of Admission:") + " " + charBoxHtml(f.admissionDate, 8),
      b("f) Time:") + " " + charBoxHtml(f.admissionTime, 4),
      b("g) Date of Discharge:") + " " + charBoxHtml(f.dischargeDate, 8),
      b("h) Time:") + " " + charBoxHtml(f.dischargeTime, 4),
    ) +
    `<div style="margin-bottom:2px;">${b("i) If injury give cause:")} ` +
    ["Self inflicted", "Road Traffic Accident", "Substance Abuse / Alcohol Consumption"]
      .map((r) => checkBox(false) + `<span style="font-size:8px;">${r}</span>`)
      .join("&nbsp;") +
    `</div>` +
    r3(
      b("ii) Reported to Police") + "&nbsp;" + checkBox(false),
      b("iii) MLC Report &amp; Police FIR attached") +
        "&nbsp;" + checkBox(false) + `<span style="font-size:8px;">Yes</span>` +
        "&nbsp;" + checkBox(false) + `<span style="font-size:8px;">No</span>`,
      b("j) System of Medicine:") + " " + tf(f.treatingDoctor, "80px"),
    ),
    "SECTION D",
  );

  // ── SECTION E: CLAIM DETAILS ───────────────────────────────────────────────
  const secELeft =
    secDiv("DETAILS OF CLAIM:") +
    `<div style="margin-bottom:3px;font-weight:bold;">a) Details of the Treatment expenses claimed</div>` +
    r2(
      b("i. Pre-hospitalization expenses Rs.") + " " + charBoxHtml(f.claimPre, 8),
      b("ii. Hospitalization expenses Rs.") + " " + charBoxHtml(f.claimHospital, 8),
    ) +
    r2(
      b("iii. Post-hospitalization expenses Rs.") + " " + charBoxHtml(f.claimPost, 8),
      b("iv. Health-Check up cost Rs.") + " " + charBoxHtml("", 8),
    ) +
    r2(
      b("v. Ambulance Charges Rs.") + " " + charBoxHtml("", 8),
      b("vi. Others (code):") + " " + charBoxHtml("", 3) +
        "&nbsp;" + b("Rs.") + " " + charBoxHtml("", 8),
    ) +
    `<div style="text-align:right;margin-bottom:2px;">` +
    `<span style="font-weight:bold;font-size:9px;">Total Rs.</span>&nbsp;` +
    charBoxHtml("", 10) +
    `</div>` +
    r2(
      b("vii. Pre-hospitalization period: days") + " " + charBoxHtml("", 3),
      b("viii. Post-hospitalization period: days") + " " + charBoxHtml("", 3),
    ) +
    `<div style="margin-bottom:2px;">${b("b) Claim for Domiciliary Hospitalization:")} ` +
    checkBox(false) + `<span style="font-size:8px;">Yes</span>&nbsp;` +
    checkBox(false) + `<span style="font-size:8px;">No</span>&nbsp;` +
    `<span style="font-size:7.5px;">(If yes, provide details in annexure)</span></div>` +
    `<div style="margin-bottom:3px;font-weight:bold;">c) Details of Lump sum / cash benefit claimed:</div>` +
    r2(
      b("i. Hospital Daily cash Rs.") + " " + charBoxHtml("", 8),
      b("ii. Surgical Cash Rs.") + " " + charBoxHtml("", 8),
    ) +
    r2(
      b("iii. Critical Illness benefit Rs.") + " " + charBoxHtml("", 8),
      b("iv. Convalescence Rs.") + " " + charBoxHtml("", 8),
    ) +
    r2(
      b("v. Pre/Post hospitalization Lump sum benefit Rs.") + " " + charBoxHtml("", 8),
      b("vi. Others Rs.") + " " + charBoxHtml("", 8),
    );

  const secERight =
    `<div style="font-weight:bold;margin-bottom:3px;font-size:7.5px;">Claim Documents Submitted - Check List:</div>` +
    [
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
      "Investigation Reports",
      "Doctors Prescriptions",
      "Others",
    ]
      .map(
        (item) =>
          `<div style="margin-bottom:2px;">${checkBox(false)}<span style="font-size:7.5px;"> ${item}</span></div>`,
      )
      .join("");

  const secE = secWrap3(secELeft, secERight, "SECTION E");

  // ── SECTION F: BILLS ENCLOSED ──────────────────────────────────────────────
  const billRows = [
    "Hospital main Bill",
    "Pre-hospitalization Bills: Nos",
    "Post-hospitalization Bills: Nos",
    "Pharmacy Bills",
    "", "", "", "", "", "",
  ]
    .map(
      (label, i) =>
        `<tr>` +
        `<td style="border:0.5px solid #999;padding:1px 3px;text-align:center;">${i + 1}.</td>` +
        `<td style="border:0.5px solid #999;padding:1px 3px;">&nbsp;</td>` +
        `<td style="border:0.5px solid #999;padding:1px 3px;">&nbsp;</td>` +
        `<td style="border:0.5px solid #999;padding:1px 3px;">&nbsp;</td>` +
        `<td style="border:0.5px solid #999;padding:1px 3px;">${escHtml(label)}</td>` +
        `<td style="border:0.5px solid #999;padding:1px 3px;">&nbsp;</td>` +
        `</tr>`,
    )
    .join("");

  const secF = secWrap(
    secDiv("DETAILS OF BILLS ENCLOSED:") +
    `<table style="width:100%;border-collapse:collapse;font-size:8px;table-layout:fixed;">` +
    `<thead><tr style="background:#e8e8e8;">` +
    `<th style="border:0.5px solid #999;padding:2px 3px;width:28px;` +
    `font-weight:bold;text-align:left;">Sl. No.</th>` +
    `<th style="border:0.5px solid #999;padding:2px 3px;width:60px;` +
    `font-weight:bold;text-align:left;">Bill No.</th>` +
    `<th style="border:0.5px solid #999;padding:2px 3px;width:65px;` +
    `font-weight:bold;text-align:left;">Date</th>` +
    `<th style="border:0.5px solid #999;padding:2px 3px;width:110px;` +
    `font-weight:bold;text-align:left;">Issued by</th>` +
    `<th style="border:0.5px solid #999;padding:2px 3px;` +
    `font-weight:bold;text-align:left;">Towards</th>` +
    `<th style="border:0.5px solid #999;padding:2px 3px;width:75px;` +
    `font-weight:bold;text-align:left;">Amount (Rs)</th>` +
    `</tr></thead>` +
    `<tbody>${billRows}</tbody></table>`,
    "SECTION F",
  );

  // ── SECTION G: BANK ACCOUNT ────────────────────────────────────────────────
  const secG = secWrap(
    secDiv("DETAILS OF PRIMARY INSURED'S BANK ACCOUNT:") +
    r2(
      b("a) PAN:") + " " + charBoxHtml(f.pan, 10),
      b("b) Account Number:") + " " + charBoxHtml(f.accountNumber, 22),
    ) +
    `<div style="margin-bottom:2px;">${b("c) Bank Name and Branch:")} ${charBoxHtml(f.bankNameBranch, 40)}</div>` +
    r2(
      b("d) Cheque / DD Payable details:") + " " + tf(f.chequeDetails, "120px"),
      b("e) IFSC Code:") + " " + charBoxHtml(f.ifscCode, 11),
    ),
    "SECTION G",
  );

  // ── SECTION H: DECLARATION ─────────────────────────────────────────────────
  const secH = secWrap(
    secDiv("DECLARATION BY THE INSURED:") +
    `<p style="font-size:7.5px;line-height:1.3;margin-bottom:4px;">` +
    `I hereby declare that the information furnished in the claim form is true &amp; correct ` +
    `to the best of my knowledge and belief. If I have made any false or untrue statement, ` +
    `suppression or concealment of any material fact with respect to questions asked in ` +
    `relation to this claim, my right to claim reimbursement shall be forfeited. ` +
    `I also consent &amp; authorize TPA / insurance Company, to seek necessary medical information / ` +
    `documents from any hospital / Medical Practitioner who has attended on the person against ` +
    `whom this claim is made. I hereby declare that I have included all the bills / receipts ` +
    `for the purpose of this claim &amp; that I will not be making any supplementary claim, ` +
    `except the pre/post-hospitalization claim, if any.` +
    `</p>` +
    r2(
      b("Date") + " " + charBoxHtml(f.declarationDate, 8),
      b("Place:") + " " + tf(f.declarationPlace, "80px"),
    ) +
    `<div style="margin-top:4px;margin-bottom:3px;">` +
    b("Signature of the Insured") + `&nbsp;&nbsp;` + sigHtml +
    `</div>` +
    `<hr style="margin:5px 0;border:none;border-top:0.5px solid #888;">` +
    `<div style="font-weight:bold;text-align:center;font-size:8px;">(IMPORTANT: PLEASE TURN OVER)</div>`,
    "SECTION H",
  );

  // ── ASSEMBLE ────────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Reimbursement Claim Form</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; padding: 0; background: #f5f5f5; }
  .ifr {
    width: ${INSURANCE_FORM_PAGE_WIDTH_PX}px;
    min-height: ${INSURANCE_FORM_PAGE_HEIGHT_PX}px;
    background: #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    color: #000;
    padding: 12px 14px;
    margin: 0 auto;
  }
  @media print {
    @page { size: ${INSURANCE_FORM_PAGE_WIDTH_PX}px ${INSURANCE_FORM_PAGE_HEIGHT_PX}px; margin: 0; }
    body { background: #fff; }
    .ifr { padding: 12px 14px; }
  }
</style>
</head>
<body>
<div class="ifr">

<!-- ═══════════════════════ HEADER ═══════════════════════ -->
<table style="width:100%;border-collapse:collapse;border-bottom:1.5px solid #333;
  padding-bottom:4px;margin-bottom:4px;table-layout:fixed;">
<tbody><tr>
  <td style="width:18%;vertical-align:middle;">
    <span style="font-size:11px;font-weight:bold;color:#1565C0;">Medi Assist</span>
  </td>
  <td style="text-align:center;vertical-align:top;padding:0 4px;">
    <div style="font-size:10px;font-weight:bold;letter-spacing:0.5px;">REIMBURSEMENT CLAIM FORM</div>
    <div style="font-size:7.5px;margin-top:1px;">TO BE FILLED BY THE INSURED</div>
    <div style="font-size:7px;color:#555;font-style:italic;margin-top:1px;">The issue of this Form is not to be taken as an admission of liability</div>
  </td>
  <td style="width:18%;text-align:right;vertical-align:top;font-size:7px;color:#555;white-space:nowrap;">
    (To be Filled in block letters)
  </td>
</tr></tbody></table>

${secA}
${secB}
${secC}
${secD}
${secE}
${secF}
${secG}
${secH}

</div>
</body>
</html>`;
}

/**
 * Download the filled insurance claim form as a PDF.
 * Web  → html2pdf.js renders the compact A4 HTML template directly
 * Mobile → expo-print (HTML string) → expo-sharing
 * @param {Object} form - the `form` state from HospitalInsuranceDownload
 * @param {string | null} [signatureDataUrl] - optional PNG data URI from the e-sign capture
 * @returns {Promise<void>}
 */
export async function downloadInsuranceClaim(form, signatureDataUrl = null) {
  const patientName = String(form?.primaryName ?? "")
    .trim()
    .replace(/\s+/g, "_") || "Patient";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `InsuranceClaim_${patientName}_${date}.pdf`;
  const html = generateInsuranceFormHTML(form, signatureDataUrl);

  if (Platform.OS === "web") {
    const html2pdf = (await import("html2pdf.js")).default;

    // html2pdf clones the node into the *main* document. Styles from an iframe body
    // do not apply to that clone, and `body {}` rules never match a div — so we parse
    // the template, inject the same <style> into document.head, and append a copy of
    // `.ifr` off-screen. Then html2canvas sees the same CSS as the preview.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready;
    }

    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");
    const styleEl = parsed.querySelector("style");
    const rootEl = parsed.querySelector(".ifr");
    if (!styleEl || !rootEl) {
      throw new Error("Insurance form HTML is missing style or .ifr root");
    }

    const injectedStyle = document.createElement("style");
    injectedStyle.setAttribute("data-insurance-pdf-export", "1");
    injectedStyle.textContent = styleEl.textContent;
    document.head.appendChild(injectedStyle);

    const host = document.createElement("div");
    host.setAttribute("data-insurance-pdf-export", "1");
    host.style.cssText = DEBUG_INSURANCE_PDF_CAPTURE
      ? `position:fixed;left:0;top:0;width:${INSURANCE_FORM_PAGE_WIDTH_PX}px;min-height:${INSURANCE_FORM_PAGE_HEIGHT_PX}px;background:#fff;z-index:9998;overflow:auto;`
      : `position:fixed;left:-9999px;top:0;width:${INSURANCE_FORM_PAGE_WIDTH_PX}px;min-height:${INSURANCE_FORM_PAGE_HEIGHT_PX}px;background:#fff;`;
    host.appendChild(document.importNode(rootEl, true));
    document.body.appendChild(host);

    const captureEl = host.firstElementChild;
    if (DEBUG_INSURANCE_PDF_CAPTURE && captureEl instanceof HTMLElement) {
      captureEl.style.position = "fixed";
      captureEl.style.left = "0";
      captureEl.style.top = "0";
      captureEl.style.zIndex = "9999";
      captureEl.style.background = "#fff";
    }

    const cleanup = () => {
      injectedStyle.remove();
      host.remove();
    };

    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "png", quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "px",
            format: [INSURANCE_FORM_PAGE_WIDTH_PX, INSURANCE_FORM_PAGE_HEIGHT_PX],
            orientation: "portrait",
          },
        })
        .from(captureEl)
        .save(fileName);
    } finally {
      if (DEBUG_INSURANCE_PDF_CAPTURE) {
        setTimeout(cleanup, 3000);
      } else {
        cleanup();
      }
    }
    return;
  }

  // Native (iOS / Android) — use the HTML template since there is no DOM
  const { uri } = await Print.printToFileAsync({ html });
  const destUri = FileSystem.documentDirectory + fileName;
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
