import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

/**
 * Render a string as a row of individual character boxes for the PDF.
 * Each character gets its own bordered cell to match the on-screen char-box UI.
 */
function charBoxHtml(value, length) {
  const padded = String(value ?? "").padEnd(length, " ").slice(0, length);
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

/** Renders signature area for PDF/HTML: embedded image when provided, else empty box */
function signatureBlockHtml(dataUrl) {
  const s = dataUrl && String(dataUrl).trim();
  if (s && s.startsWith("data:image/")) {
    return `<span class="signature-box signature-box-filled"><img src="${s}" alt="" class="signature-img" /></span>`;
  }
  return `<span class="signature-box"></span>`;
}

function sectionBar(label) {
  return `
    <div class="section-bar">
      <div class="section-bar-line"></div>
      <div class="section-bar-text">${label}</div>
      <div class="section-bar-line"></div>
    </div>`;
}

function sectionDivider(label) {
  return `
    <div class="divider-row">
      <div class="divider-line"></div>
      <span class="divider-label">${label}</span>
      <div class="divider-line"></div>
    </div>`;
}

/**
 * Build a styled A4 HTML string from the filled insurance form state.
 * @param {Object} form - the `form` state from HospitalInsuranceDownload
 * @param {string | null} [signatureDataUrl] - optional PNG data URI from the e-sign capture
 * @returns {string} HTML string
 */
export function generateInsuranceFormHTML(form, signatureDataUrl = null) {
  const f = form || {};
  const signatureHtml = signatureBlockHtml(signatureDataUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Reimbursement Claim Form</title>
<style>
  @media print {
    @page { margin: 0; size: A4 portrait; }
    .insurance-form-root { padding: 4mm; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .insurance-form-root {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 6.5px;
    color: #111;
    background: #fff;
    padding: 4mm;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
  }

  /* ── HEADER ── */
  .form-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid #333;
    padding-bottom: 3px;
    margin-bottom: 3px;
  }
  .logo-block { display: flex; align-items: center; gap: 2px; }
  .logo-text { font-size: 9px; font-weight: bold; color: #1565C0; }
  .center-title { text-align: center; flex: 1; padding: 0 4px; }
  .form-main-title { font-size: 9px; font-weight: bold; letter-spacing: 0.3px; }
  .form-sub-title { font-size: 6.5px; margin-top: 1px; }
  .form-note-center { font-size: 6px; color: #555; margin-top: 1px; font-style: italic; }
  .form-note-right { font-size: 6px; color: #555; white-space: nowrap; }

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
    flex-direction: column;
    align-items: center;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    width: 13px;
    background: #222;
    color: #fff;
    font-size: 5.5px;
    font-weight: bold;
    letter-spacing: 0.5px;
    padding: 2px 1px;
    flex-shrink: 0;
  }
  .section-bar-line { flex: 1; border-left: 0.5px solid #fff; margin: 1px 0; }
  .section-bar-text { white-space: nowrap; }

  /* ── DIVIDER ── */
  .divider-row {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-bottom: 2px;
  }
  .divider-line { flex: 1; height: 0.5px; background: #555; }
  .divider-label { font-size: 6px; font-weight: bold; white-space: nowrap; color: #222; }

  /* ── FORM ROWS ── */
  .row { display: flex; align-items: center; flex-wrap: wrap; gap: 2px; margin-bottom: 2px; }
  .row-between { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 2px; margin-bottom: 2px; }
  .label { font-size: 6.5px; font-weight: bold; white-space: nowrap; }
  .small-text { font-size: 6.5px; }

  /* ── CHAR BOXES ── */
  .char-row { display: inline-flex; }
  .char-box {
    display: inline-flex;
    width: 8px;
    height: 10px;
    border: 0.5px solid #555;
    font-size: 6px;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    margin-right: 0;
    flex-shrink: 0;
  }

  /* ── CHECKBOXES ── */
  .cb {
    display: inline-block;
    width: 7px;
    height: 7px;
    border: 0.5px solid #555;
    margin: 0 1px;
    vertical-align: middle;
    font-size: 6px;
    text-align: center;
    line-height: 7px;
  }
  .cb-checked { background: #1565C0; color: #fff; }

  /* ── TEXT INPUTS (free-text fields) ── */
  .text-field {
    display: inline-block;
    min-width: 60px;
    border-bottom: 0.5px solid #555;
    font-size: 6.5px;
    padding: 0 1px;
    vertical-align: bottom;
  }

  /* ── CLAIM TABLE ── */
  .bill-table { width: 100%; border-collapse: collapse; font-size: 6.5px; }
  .bill-table th, .bill-table td {
    border: 0.5px solid #999;
    padding: 1px 2px;
    text-align: left;
    vertical-align: middle;
  }
  .bill-table th { background: #e8e8e8; font-weight: bold; }

  /* ── DECLARATION ── */
  .declaration-text { font-size: 6px; line-height: 1.3; margin-bottom: 3px; }
  .signature-block-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 5px;
    margin-top: 5px;
    margin-bottom: 3px;
  }
  .signature-box {
    display: inline-block;
    min-width: 18mm;
    width: 18mm;
    height: 8mm;
    border: 0.5px solid #555;
    vertical-align: bottom;
    box-sizing: border-box;
  }
  .signature-box-filled {
    width: 48mm;
    height: 16mm;
    min-width: 48mm;
    padding: 2px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .signature-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: left bottom;
  }
  .footer-note { font-size: 6.5px; font-weight: bold; text-align: center; margin-top: 3px; }
</style>
</head>
<body>
<div class="insurance-form-root">

<!-- ══════════════════════ HEADER ══════════════════════ -->
<div class="form-header">
  <div class="logo-block">
    <span class="logo-text">Medi Assist</span>
  </div>
  <div class="center-title">
    <div class="form-main-title">REIMBURSEMENT CLAIM FORM</div>
    <div class="form-sub-title">TO BE FILLED BY THE INSURED</div>
    <div class="form-note-center">The issue of this Form is not to be taken as an admission of liability</div>
  </div>
  <div class="form-note-right">(To be Filled in block letters)</div>
</div>

<!-- ══════════════════════ SECTION A: PRIMARY INSURED ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DETAILS OF PRIMARY INSURED:")}

    <div class="row-between">
      <div class="row">
        <span class="label">a) Policy No.:</span>
        ${charBoxHtml(f.policyNumber, 18)}
      </div>
      <div class="row">
        <span class="label">b) Sl. No./Certificate no.</span>
        ${charBoxHtml(f.certificateNumber, 14)}
      </div>
    </div>

    <div class="row">
      <span class="label">c) Company / TPA ID (MA ID) No:</span>
      ${charBoxHtml(f.tpaId, 22)}
    </div>

    <div class="row">
      <span class="label">d) Name:</span>
      ${charBoxHtml(f.primaryName, 40)}
    </div>

    <div class="row">
      <span class="label">e) Address:</span>
      <div>
        ${charBoxHtml(f.primaryAddressRow1, 40)}<br/>
        ${charBoxHtml(f.primaryAddressRow2, 35)}
      </div>
    </div>

    <div class="row-between">
      <div class="row"><span class="label">City:</span> ${charBoxHtml(f.primaryCity, 18)}</div>
      <div class="row"><span class="label">State:</span> ${charBoxHtml(f.primaryState, 18)}</div>
    </div>

    <div class="row-between">
      <div class="row"><span class="label">Pin Code:</span> ${charBoxHtml(f.primaryPin, 6)}</div>
      <div class="row"><span class="label">Phone No:</span> ${charBoxHtml(f.primaryPhone, 10)}</div>
      <div class="row"><span class="label">Email ID:</span> <span class="text-field">${escHtml(f.primaryEmail)}</span></div>
    </div>
  </div>
  ${sectionBar("SECTION A")}
</div>

<!-- ══════════════════════ SECTION B: INSURANCE HISTORY ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DETAILS OF INSURANCE HISTORY:")}

    <div class="row-between">
      <div class="row">
        <span class="label">a) Currently covered by any other Mediclaim / Health Insurance:</span>
        ${checkBox(false)}<span class="small-text">Yes</span>
        ${checkBox(false)}<span class="small-text">No</span>
      </div>
      <div class="row">
        <span class="label">b) Date of commencement of first Insurance without break:</span>
        ${charBoxHtml("", 8)}
      </div>
    </div>

    <div class="row-between">
      <div class="row">
        <span class="label">c) If yes, company name:</span>
        ${charBoxHtml("", 20)}
      </div>
      <div class="row">
        <span class="label">Policy No.</span>
        ${charBoxHtml("", 18)}
      </div>
    </div>

    <div class="row-between">
      <div class="row">
        <span class="label">Sum insured (Rs.)</span>
        ${charBoxHtml("", 12)}
      </div>
      <div class="row">
        <span class="label">d) Hospitalized in last four years?</span>
        ${checkBox(false)}<span class="small-text">Yes</span>
        ${checkBox(false)}<span class="small-text">No</span>
        <span class="label" style="margin-left:6px">Date:</span>
        ${charBoxHtml("", 4)}
      </div>
    </div>

    <div class="row-between">
      <div class="row">
        <span class="label">Diagnosis:</span>
        <span class="text-field" style="min-width:160px">${escHtml(f.diagnosis)}</span>
      </div>
      <div class="row">
        <span class="label">e) Previously covered by other Mediclaim?</span>
        ${checkBox(false)}<span class="small-text">Yes</span>
        ${checkBox(false)}<span class="small-text">No</span>
      </div>
    </div>

    <div class="row">
      <span class="label">f) If yes, company name:</span>
      ${charBoxHtml("", 22)}
    </div>
  </div>
  ${sectionBar("SECTION B")}
</div>

<!-- ══════════════════════ SECTION C: INSURED PERSON HOSPITALIZED ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DETAILS OF INSURED PERSON HOSPITALIZED:")}

    <div class="row">
      <span class="label">a) Name:</span>
      ${charBoxHtml(f.hospitalizedName, 40)}
    </div>

    <div class="row-between">
      <div class="row">
        <span class="label">b) Gender</span>
        <span class="small-text">Male</span>${checkBox(f.gender === "male")}
        <span class="small-text">Female</span>${checkBox(f.gender === "female")}
      </div>
      <div class="row">
        <span class="label">c) Age years</span>
        ${charBoxHtml(f.ageYears, 2)}
        <span class="small-text">Months</span>
        ${charBoxHtml(f.ageMonths, 2)}
      </div>
      <div class="row">
        <span class="label">d) Date of Birth</span>
        ${charBoxHtml(f.dob, 8)}
      </div>
    </div>

    <div class="row">
      <span class="label">e) Relationship to Primary insured:</span>
      ${["Self", "Spouse", "Child", "Father", "Mother", "Other"]
        .map((r) => `${checkBox(false)}<span class="small-text">${r}</span>`)
        .join(" ")}
      <span class="small-text">(Please Specify)</span>
      <span class="text-field">&nbsp;</span>
    </div>

    <div class="row">
      <span class="label">f) Occupation</span>
      ${["Service", "Self Employed", "Home Maker", "Student", "Retired", "Other"]
        .map((o) => `${checkBox(false)}<span class="small-text">${o}</span>`)
        .join(" ")}
      <span class="small-text">(Please Specify)</span>
      <span class="text-field">&nbsp;</span>
    </div>

    <div class="row">
      <span class="label">g) Address (if different from above):</span>
      <div>
        ${charBoxHtml(f.hospAddressRow1, 40)}<br/>
        ${charBoxHtml(f.hospAddressRow2, 35)}
      </div>
    </div>

    <div class="row-between">
      <div class="row"><span class="label">City:</span> ${charBoxHtml(f.hospCity, 18)}</div>
      <div class="row"><span class="label">State:</span> ${charBoxHtml(f.hospState, 18)}</div>
    </div>

    <div class="row-between">
      <div class="row"><span class="label">Pin Code:</span> ${charBoxHtml(f.hospPin, 6)}</div>
      <div class="row"><span class="label">Phone No:</span> ${charBoxHtml(f.hospPhone, 10)}</div>
      <div class="row"><span class="label">Email ID:</span> <span class="text-field">${escHtml(f.hospEmail)}</span></div>
    </div>
  </div>
  ${sectionBar("SECTION C")}
</div>

<!-- ══════════════════════ SECTION D: HOSPITALIZATION ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DETAILS OF HOSPITALIZATION:")}

    <div class="row">
      <span class="label">a) Name of Hospital where Admitted:</span>
      ${charBoxHtml(f.hospitalName, 40)}
    </div>

    <div class="row">
      <span class="label">b) Room Category occupied:</span>
      ${["Day care", "Single occupancy", "Twin sharing", "3 or more beds per room"]
        .map((r) => `${checkBox(false)}<span class="small-text">${r}</span>`)
        .join(" ")}
    </div>

    <div class="row-between">
      <div class="row">
        <span class="label">c) Hospitalization due to:</span>
        ${["Injury", "Illness", "Maternity"]
          .map((r) => `${checkBox(false)}<span class="small-text">${r}</span>`)
          .join(" ")}
      </div>
      <div class="row">
        <span class="label">d) Date of injury / Disease first detected / Delivery:</span>
        ${charBoxHtml(f.injuryDate, 8)}
      </div>
    </div>

    <div class="row-between">
      <div class="row"><span class="label">e) Date of Admission:</span> ${charBoxHtml(f.admissionDate, 8)}</div>
      <div class="row"><span class="label">f) Time:</span> ${charBoxHtml(f.admissionTime, 4)}</div>
      <div class="row"><span class="label">g) Date of Discharge:</span> ${charBoxHtml(f.dischargeDate, 8)}</div>
      <div class="row"><span class="label">h) Time:</span> ${charBoxHtml(f.dischargeTime, 4)}</div>
    </div>

    <div class="row">
      <span class="label">i) If injury give cause:</span>
      ${["Self inflicted", "Road Traffic Accident", "Substance Abuse / Alcohol Consumption"]
        .map((r) => `${checkBox(false)}<span class="small-text">${r}</span>`)
        .join(" ")}
    </div>

    <div class="row-between">
      <div class="row">
        <span class="label">ii) Reported to Police</span>${checkBox(false)}
      </div>
      <div class="row">
        <span class="label">iii) MLC Report &amp; Police FIR attached</span>
        ${checkBox(false)}<span class="small-text">Yes</span>
        ${checkBox(false)}<span class="small-text">No</span>
      </div>
      <div class="row">
        <span class="label">j) System of Medicine:</span>
        <span class="text-field">${escHtml(f.treatingDoctor)}</span>
      </div>
    </div>
  </div>
  ${sectionBar("SECTION D")}
</div>

<!-- ══════════════════════ SECTION E: CLAIM DETAILS ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DETAILS OF CLAIM:")}

    <div class="label" style="margin-bottom:4px">a) Details of the Treatment expenses claimed</div>

    <div class="row-between">
      <div class="row"><span class="label">i. Pre-hospitalization expenses Rs.</span> ${charBoxHtml(f.claimPre, 8)}</div>
      <div class="row"><span class="label">ii. Hospitalization expenses Rs.</span> ${charBoxHtml(f.claimHospital, 8)}</div>
    </div>
    <div class="row-between">
      <div class="row"><span class="label">iii. Post-hospitalization expenses Rs.</span> ${charBoxHtml(f.claimPost, 8)}</div>
      <div class="row"><span class="label">iv. Health-Check up cost Rs.</span> ${charBoxHtml("", 8)}</div>
    </div>
    <div class="row-between">
      <div class="row"><span class="label">v. Ambulance Charges Rs.</span> ${charBoxHtml("", 8)}</div>
      <div class="row"><span class="label">vi. Others (code):</span> ${charBoxHtml("", 3)} <span class="label">Rs.</span> ${charBoxHtml("", 8)}</div>
    </div>
    <div class="row" style="justify-content:flex-end">
      <span class="label" style="font-size:11px">Total Rs.</span>
      ${charBoxHtml("", 10)}
    </div>

    <div class="row-between">
      <div class="row"><span class="label">vii. Pre-hospitalization period: days</span> ${charBoxHtml("", 3)}</div>
      <div class="row"><span class="label">viii. Post-hospitalization period: days</span> ${charBoxHtml("", 3)}</div>
    </div>

    <div class="row">
      <span class="label">b) Claim for Domiciliary Hospitalization:</span>
      ${checkBox(false)}<span class="small-text">Yes</span>
      ${checkBox(false)}<span class="small-text">No</span>
      <span class="small-text">(If yes, provide details in annexure)</span>
    </div>

    <div class="label" style="margin-bottom:4px">c) Details of Lump sum / cash benefit claimed:</div>
    <div class="row-between">
      <div class="row"><span class="label">i. Hospital Daily cash Rs.</span> ${charBoxHtml("", 8)}</div>
      <div class="row"><span class="label">ii. Surgical Cash Rs.</span> ${charBoxHtml("", 8)}</div>
    </div>
    <div class="row-between">
      <div class="row"><span class="label">iii. Critical Illness benefit Rs.</span> ${charBoxHtml("", 8)}</div>
      <div class="row"><span class="label">iv. Convalescence Rs.</span> ${charBoxHtml("", 8)}</div>
    </div>
    <div class="row-between">
      <div class="row"><span class="label">v. Pre/Post hospitalization Lump sum benefit Rs.</span> ${charBoxHtml("", 8)}</div>
      <div class="row"><span class="label">vi. Others Rs.</span> ${charBoxHtml("", 8)}</div>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;width:120px;border-left:1px solid #ccc;padding-left:6px">
    <div class="label">Claim Documents Submitted - Check List:</div>
    ${[
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
          `<div class="row">${checkBox(false)}<span class="small-text">${item}</span></div>`,
      )
      .join("")}
  </div>
  ${sectionBar("SECTION E")}
</div>

<!-- ══════════════════════ SECTION F: BILLS ENCLOSED ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DETAILS OF BILLS ENCLOSED:")}
    <table class="bill-table">
      <thead>
        <tr>
          <th style="width:30px">Sl. No.</th>
          <th style="width:60px">Bill No.</th>
          <th style="width:70px">Date</th>
          <th style="width:120px">Issued by</th>
          <th>Towards</th>
          <th style="width:80px">Amount (Rs)</th>
        </tr>
      </thead>
      <tbody>
        ${[
          "Hospital main Bill",
          "Pre-hospitalization Bills: Nos",
          "Post-hospitalization Bills: Nos",
          "Pharmacy Bills",
          "",
          "",
          "",
          "",
          "",
          "",
        ]
          .map(
            (label, i) => `
          <tr>
            <td>${i + 1}.</td>
            <td></td>
            <td></td>
            <td></td>
            <td>${label}</td>
            <td></td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>
  ${sectionBar("SECTION F")}
</div>

<!-- ══════════════════════ SECTION G: BANK ACCOUNT ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DETAILS OF PRIMARY INSURED'S BANK ACCOUNT:")}

    <div class="row-between">
      <div class="row"><span class="label">a) PAN:</span> ${charBoxHtml(f.pan, 10)}</div>
      <div class="row"><span class="label">b) Account Number:</span> ${charBoxHtml(f.accountNumber, 22)}</div>
    </div>

    <div class="row">
      <span class="label">c) Bank Name and Branch:</span>
      ${charBoxHtml(f.bankNameBranch, 40)}
    </div>

    <div class="row-between">
      <div class="row">
        <span class="label">d) Cheque / DD Payable details:</span>
        <span class="text-field" style="min-width:120px">${escHtml(f.chequeDetails)}</span>
      </div>
      <div class="row"><span class="label">e) IFSC Code:</span> ${charBoxHtml(f.ifscCode, 11)}</div>
    </div>
  </div>
  ${sectionBar("SECTION G")}
</div>

<!-- ══════════════════════ SECTION H: DECLARATION ══════════════════════ -->
<div class="section-wrap">
  <div class="section-content">
    ${sectionDivider("DECLARATION BY THE INSURED:")}

    <p class="declaration-text">
      I hereby declare that the information furnished in the claim form is true &amp; correct
      to the best of my knowledge and belief. If I have made any false or untrue statement,
      suppression or concealment of any material fact with respect to questions asked in
      relation to this claim, my right to claim reimbursement shall be forfeited.
      I also consent &amp; authorize TPA / insurance Company, to seek necessary medical information /
      documents from any hospital / Medical Practitioner who has attended on the person against
      whom this claim is made. I hereby declare that I have included all the bills / receipts
      for the purpose of this claim &amp; that I will not be making any supplementary claim,
      except the pre/post-hospitalization claim, if any.
    </p>

    <div class="row-between">
      <div class="row"><span class="label">Date</span> ${charBoxHtml(f.declarationDate, 8)}</div>
      <div class="row">
        <span class="label">Place:</span>
        <span class="text-field" style="min-width:80px">${escHtml(f.declarationPlace)}</span>
      </div>
    </div>
    <div class="signature-block-row">
      <span class="label">Signature of the Insured</span>
      ${signatureHtml}
    </div>

    <hr style="margin:8px 0;border:none;border-top:1px solid #888"/>
    <div class="footer-note">(IMPORTANT: PLEASE TURN OVER)</div>
  </div>
  ${sectionBar("SECTION H")}
</div>

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
    // `.insurance-form-root` off-screen. Then html2canvas sees the same CSS as the preview.
    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");
    const styleEl = parsed.querySelector("style");
    const rootEl = parsed.querySelector(".insurance-form-root");
    if (!styleEl || !rootEl) {
      throw new Error("Insurance form HTML is missing style or .insurance-form-root");
    }

    const injectedStyle = document.createElement("style");
    injectedStyle.setAttribute("data-insurance-pdf-export", "1");
    injectedStyle.textContent = styleEl.textContent;
    document.head.appendChild(injectedStyle);

    const host = document.createElement("div");
    host.setAttribute("data-insurance-pdf-export", "1");
    host.style.cssText =
      "position:fixed;left:-9999px;top:0;width:210mm;min-height:297mm;background:#fff;";
    host.appendChild(document.importNode(rootEl, true));
    document.body.appendChild(host);

    const captureEl = host.firstElementChild;

    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          // PNG avoids JPEG artifacts on thin signature strokes
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
        .save(fileName);
    } finally {
      injectedStyle.remove();
      host.remove();
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


// /**
//  * generateInsuranceFormHTML
//  * Produces a pixel-accurate HTML replica of the official
//  * Medi Assist Reimbursement Claim Form (Part A / Form A).
//  *
//  * Matches the scanned original exactly:
//  *  - All 8 sections (A–H) with correct labels
//  *  - Character-box grids with correct counts
//  *  - Side section-label bars (SECTION A … SECTION H)
//  *  - Divider lines with centred section headings
//  *  - Declaration paragraph + signature box
//  *  - Bills-Enclosed table (10 rows, grid date + amount cells)
//  *
//  * @param {object} form   – form state from buildInitialForm()
//  * @param {string|null} signatureImage – base64 data-URI or null
//  * @returns {string} full HTML document string
//  */
// export function generateInsuranceFormHTML(form = {}, signatureImage = null) {
//   const f = form;

//   /* ── helpers ── */
//   const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

//   /** render N character boxes, filling from `value` string */
//   const boxes = (n, value = "") => {
//     const chars = String(value).padEnd(n, " ").slice(0, n).split("");
//     return chars
//       .map(
//         (c) =>
//           `<span class="cb">${c === " " ? "&nbsp;" : esc(c)}</span>`
//       )
//       .join("");
//   };

//   /** render N empty boxes (no value) */
//   const emptyBoxes = (n) => `<span class="cb-group">${Array(n).fill('<span class="cb">&nbsp;</span>').join("")}</span>`;

//   /** inline label + boxes */
//   const field = (label, n, value = "") =>
//     `<span class="field"><span class="lbl">${label}</span><span class="cb-group">${boxes(n, value)}</span></span>`;

//   /** date boxes DDMMYYYY = 8 boxes */
//   const dateBoxes = (value = "") => `<span class="cb-group">${boxes(8, value)}</span>`;

//   /** checkbox square */
//   const chk = () => `<span class="chk"></span>`;

//   /* ── section side-bar ── */
//   const sectionBar = (label) => `
//     <div class="sec-bar">
//       <div class="sec-bar-line"></div>
//       <div class="sec-bar-text">${label}</div>
//       <div class="sec-bar-line"></div>
//     </div>`;

//   /* ── divider heading ── */
//   const divider = (title) => `
//     <div class="divider">
//       <div class="div-line"></div>
//       <div class="div-title">${title}</div>
//       <div class="div-line"></div>
//     </div>`;

//   const html = `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8"/>
// <style>
//   @page { size: A4; margin: 0; }

//   * { box-sizing: border-box; margin: 0; padding: 0; }

//   body {
//     font-family: Arial, Helvetica, sans-serif;
//     font-size: 9px;
//     background: #fff;
//     color: #000;
//     width: 210mm;
//   }

//   .page {
//     width: 210mm;
//     padding: 6mm 5mm 4mm 5mm;
//   }

//   /* ── HEADER ── */
//   .header {
//     display: flex;
//     align-items: flex-start;
//     justify-content: space-between;
//     margin-bottom: 3px;
//     border-bottom: 1.5px solid #000;
//     padding-bottom: 4px;
//   }
//   .header-logo {
//     display: flex;
//     align-items: center;
//     gap: 5px;
//     min-width: 110px;
//   }
//   .logo-circle {
//     width: 30px; height: 30px;
//     background: #cc0000;
//     border-radius: 50%;
//     display: flex; align-items: center; justify-content: center;
//     color: #fff; font-size: 11px; font-weight: 900;
//   }
//   .logo-text { font-size: 12px; font-weight: 700; color: #cc0000; }
//   .header-center { text-align: center; flex: 1; }
//   .header-center h1 { font-size: 13px; font-weight: 900; letter-spacing: 0.5px; }
//   .header-center p { font-size: 8.5px; }
//   .header-right { font-size: 8px; font-style: italic; min-width: 120px; text-align: right; }

//   /* ── SECTION WRAPPER ── */
//   .section-wrap {
//     display: flex;
//     align-items: stretch;
//     margin-bottom: 0;
//   }
//   .section-body { flex: 1; padding: 3px 2px; }

//   /* ── DIVIDER ── */
//   .divider {
//     display: flex;
//     align-items: center;
//     gap: 4px;
//     margin: 3px 0 2px 0;
//   }
//   .div-line { flex: 1; height: 1px; background: #000; }
//   .div-title { font-size: 8.5px; font-weight: 700; white-space: nowrap; }

//   /* ── SIDE BAR ── */
//   .sec-bar {
//     width: 20px;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     border-left: 1.5px solid #000;
//     margin-left: 3px;
//     flex-shrink: 0;
//   }
//   .sec-bar-line { flex: 1; width: 10px; background: #000; }
//   .sec-bar-text {
//     writing-mode: vertical-lr;
//     transform: rotate(0deg);
//     font-size: 7.5px;
//     font-weight: 700;
//     padding: 6px 1px;
//     white-space: nowrap;
//     letter-spacing: 1.5px;
//   }

//   /* ── CHARACTER BOXES ── */
//   .cb-group { display: inline-flex; }
//   .cb {
//     display: inline-block;
//     width: 13px; height: 13px;
//     border: 0.8px solid #888;
//     text-align: center;
//     line-height: 13px;
//     font-size: 8.5px;
//     margin: 0.5px;
//     vertical-align: middle;
//   }

//   /* ── CHECKBOX ── */
//   .chk {
//     display: inline-block;
//     width: 12px; height: 12px;
//     border: 0.8px solid #000;
//     vertical-align: middle;
//     margin: 0 2px;
//   }

//   /* ── ROWS ── */
//   .row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 3px; }
//   .row-between { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 3px; }

//   /* ── LABELS ── */
//   .lbl { font-size: 8.5px; margin-right: 3px; white-space: nowrap; }
//   .lbl-sm { font-size: 8px; margin-right: 2px; }
//   .field { display: inline-flex; align-items: center; }
//   .txt-opt { font-size: 8px; margin: 0 2px; vertical-align: middle; }

//   /* ── TEXT UNDERLINE INPUT (for long text fields) ── */
//   .uline {
//     display: inline-block;
//     border-bottom: 0.8px solid #000;
//     min-width: 120px;
//     height: 13px;
//     vertical-align: middle;
//     font-size: 8.5px;
//     padding: 0 1px;
//   }
//   .uline-sm { min-width: 60px; }
//   .uline-lg { min-width: 200px; }
//   .uline-xl { min-width: 300px; }

//   /* ── TABLE (Bills Enclosed) ── */
//   table.bills {
//     width: 100%;
//     border-collapse: collapse;
//     font-size: 8px;
//   }
//   table.bills th, table.bills td {
//     border: 0.8px solid #000;
//     padding: 1px 2px;
//     vertical-align: middle;
//   }
//   table.bills th { font-weight: 700; background: #f0f0f0; text-align: center; }
//   table.bills td.num { text-align: center; }
//   table.bills .mini-box {
//     display: inline-block;
//     width: 11px; height: 11px;
//     border: 0.7px solid #aaa;
//     margin: 0;
//     vertical-align: middle;
//   }
//   .mini-box-group { display: inline-flex; }

//   /* ── DECLARATION ── */
//   .declaration-text { font-size: 8px; line-height: 1.45; margin-bottom: 6px; text-align: justify; }

//   /* ── SIGNATURE BOX ── */
//   .sig-box {
//     display: inline-block;
//     width: 160px; height: 35px;
//     border: 0.8px solid #000;
//     vertical-align: middle;
//     overflow: hidden;
//     text-align: center;
//     line-height: 35px;
//     font-size: 8px;
//     color: #aaa;
//   }
//   .sig-img { max-width: 100%; max-height: 100%; object-fit: contain; }

//   /* ── CHECKLIST ── */
//   .checklist { min-width: 180px; padding-left: 4px; }
//   .checklist .lbl-hd { font-size: 8px; font-weight: 700; margin-bottom: 2px; }
//   .checklist .cl-item { display: flex; align-items: flex-start; gap: 2px; margin-bottom: 1.5px; }
//   .checklist .cl-item .chk { flex-shrink: 0; margin-top: 1px; }
//   .checklist .cl-item span { font-size: 7.5px; line-height: 1.3; }

//   /* ── FOOTER ── */
//   .footer-line { border-top: 0.8px solid #000; margin-top: 4px; padding-top: 2px; }
//   .footer-note { text-align: right; font-size: 8px; font-weight: 700; }

//   /* Section border */
//   .section-outer {
//     border: 0.5px solid #ccc;
//     margin-bottom: 1px;
//   }

//   /* E section with checklist side */
//   .sec-e-body { display: flex; gap: 4px; }
//   .sec-e-main { flex: 1; }
// </style>
// </head>
// <body>
// <div class="page">

//   <!-- ══════════════ HEADER ══════════════ -->
//   <div class="header">
//     <div class="header-logo">
//       <div class="logo-circle">A</div>
//       <span class="logo-text">Medi Assist</span>
//     </div>
//     <div class="header-center">
//       <h1>REIMBURSEMENT CLAIM FORM</h1>
//       <p><strong>TO BE FILLED BY THE INSURED</strong></p>
//       <p>The issue of this Form is not to be taken as an admission of liablity</p>
//     </div>
//     <div class="header-right">(To be Filled in block letters)</div>
//   </div>

//   <!-- ══════════════ SECTION A – PRIMARY INSURED ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DETAILS OF PRIMARY INSURED:")}

//       <!-- a) Policy No + b) Sl.No -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">a) Policy No.:</span>
//           <span class="cb-group">${boxes(18, f.policyNumber)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">b) Sl. No/ Certificate no.</span>
//           <span class="cb-group">${boxes(14, f.certificateNumber)}</span>
//         </div>
//       </div>

//       <!-- c) TPA ID -->
//       <div class="row">
//         <span class="lbl">c) Company / TPA ID (MA ID)No:</span>
//         <span class="cb-group">${boxes(22, f.tpaId)}</span>
//       </div>

//       <!-- d) Name -->
//       <div class="row">
//         <span class="lbl">d) Name:</span>
//         <span class="cb-group">${boxes(40, f.primaryName)}</span>
//       </div>

//       <!-- e) Address row1 -->
//       <div class="row">
//         <span class="lbl" style="min-width:52px">e)Address:</span>
//         <span class="cb-group">${boxes(40, f.primaryAddressRow1)}</span>
//       </div>
//       <!-- e) Address row2 (indent) -->
//       <div class="row" style="padding-left:55px">
//         <span class="cb-group">${boxes(35, f.primaryAddressRow2)}</span>
//       </div>

//       <!-- City + State -->
//       <div class="row-between" style="padding-left:30px">
//         <div class="row">
//           <span class="lbl">City:</span>
//           <span class="cb-group">${boxes(18, f.primaryCity)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">State:</span>
//           <span class="cb-group">${boxes(18, f.primaryState)}</span>
//         </div>
//       </div>

//       <!-- Pin + Phone + Email -->
//       <div class="row" style="gap:8px; padding-left:20px">
//         <div class="row">
//           <span class="lbl">Pin Code</span>
//           <span class="cb-group">${boxes(6, f.primaryPin)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">Phone No:</span>
//           <span class="cb-group">${boxes(10, f.primaryPhone)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">Email ID:</span>
//           <span class="uline uline-lg">${esc(f.primaryEmail)}</span>
//         </div>
//       </div>
//     </div>
//     ${sectionBar("SECTION A")}
//   </div>

//   <!-- ══════════════ SECTION B – INSURANCE HISTORY ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DETAILS OF INSURANCE HISTORY:")}

//       <!-- a) + b) -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">a) Currently covered by any other Mediclaim / Health Insurance:</span>
//           ${chk()}<span class="txt-opt">Yes</span>
//           ${chk()}<span class="txt-opt">No</span>
//         </div>
//         <div class="row">
//           <span class="lbl">b) Date of commencement of first Insurance without break:</span>
//           ${dateBoxes()}
//         </div>
//       </div>

//       <!-- c) company + policy -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">c) If yes, company name:</span>
//           ${emptyBoxes(20)}
//         </div>
//         <div class="row">
//           <span class="lbl">Policy No.</span>
//           ${emptyBoxes(18)}
//         </div>
//       </div>

//       <!-- Sum insured + d) hospitalized -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">Sum insured (Rs.)</span>
//           ${emptyBoxes(12)}
//         </div>
//         <div class="row" style="flex-wrap:wrap; max-width:55%">
//           <span class="lbl">d) Have you been hospitalized in the last four years since inception of the contract?</span>
//           ${chk()}<span class="txt-opt">Yes</span>
//           ${chk()}<span class="txt-opt">No</span>
//           <span class="lbl" style="margin-left:6px">Date:</span>
//           <span class="cb-group">${boxes(4, "")}</span>
//         </div>
//       </div>

//       <!-- Diagnosis + e) -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">Diagnosis:</span>
//           <span class="uline uline-xl">${esc(f.diagnosis)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">e) Previously covered by any other Mediclaim /Health insurance :</span>
//           ${chk()}<span class="txt-opt">Yes</span>
//           ${chk()}<span class="txt-opt">No</span>
//         </div>
//       </div>

//       <!-- f) -->
//       <div class="row">
//         <span class="lbl">f) If yes, company name:</span>
//         ${emptyBoxes(22)}
//       </div>
//     </div>
//     ${sectionBar("SECTION B")}
//   </div>

//   <!-- ══════════════ SECTION C – PERSON HOSPITALIZED ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DETAILS OF INSURED PERSON HOSPITALIZED:")}

//       <!-- a) Name -->
//       <div class="row">
//         <span class="lbl">a) Name:</span>
//         <span class="cb-group">${boxes(40, f.hospitalizedName)}</span>
//       </div>

//       <!-- b) Gender + c) Age + d) DOB -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">b) Gender</span>
//           <span class="txt-opt">Male</span>${chk()}
//           <span class="txt-opt">Female</span>${chk()}
//         </div>
//         <div class="row">
//           <span class="lbl">c) Age years</span>
//           <span class="cb-group">${boxes(2, f.ageYears)}</span>
//           <span class="txt-opt">Months</span>
//           <span class="cb-group">${boxes(2, f.ageMonths)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">d) Date of Birth</span>
//           ${dateBoxes(f.dob)}
//         </div>
//       </div>

//       <!-- e) Relationship -->
//       <div class="row">
//         <span class="lbl">e) Relationship to Primary insured:</span>
//         <span class="txt-opt">Self</span>${chk()}
//         <span class="txt-opt">Spouse</span>${chk()}
//         <span class="txt-opt">Child</span>${chk()}
//         <span class="txt-opt">Father</span>${chk()}
//         <span class="txt-opt">Mother</span>${chk()}
//         <span class="txt-opt">Other</span>${chk()}
//         <span class="txt-opt">(Please Specify)</span>
//         <span class="uline" style="min-width:80px">&nbsp;</span>
//       </div>

//       <!-- f) Occupation -->
//       <div class="row">
//         <span class="lbl">f) Occupation</span>
//         <span class="txt-opt">Service</span>${chk()}
//         <span class="txt-opt">Self Employed</span>${chk()}
//         <span class="txt-opt">Home Maker</span>${chk()}
//         <span class="txt-opt">Student</span>${chk()}
//         <span class="txt-opt">Retired</span>${chk()}
//         <span class="txt-opt">Other</span>${chk()}
//         <span class="txt-opt">(Please Specify)</span>
//         <span class="uline" style="min-width:80px">&nbsp;</span>
//       </div>

//       <!-- g) Address -->
//       <div class="row">
//         <span class="lbl" style="min-width:130px">g) Address (if diffrent from above):</span>
//         <span class="cb-group">${boxes(40, f.hospAddressRow1)}</span>
//       </div>
//       <div class="row" style="padding-left:133px">
//         <span class="cb-group">${boxes(35, f.hospAddressRow2)}</span>
//       </div>

//       <!-- City + State -->
//       <div class="row-between" style="padding-left:30px">
//         <div class="row">
//           <span class="lbl">City:</span>
//           <span class="cb-group">${boxes(18, f.hospCity)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">State:</span>
//           <span class="cb-group">${boxes(18, f.hospState)}</span>
//         </div>
//       </div>

//       <!-- Pin + Phone + Email -->
//       <div class="row" style="gap:8px; padding-left:20px">
//         <div class="row">
//           <span class="lbl">Pin Code</span>
//           <span class="cb-group">${boxes(6, f.hospPin)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">Phone No:</span>
//           <span class="cb-group">${boxes(10, f.hospPhone)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">Email ID:</span>
//           <span class="uline uline-lg">${esc(f.hospEmail)}</span>
//         </div>
//       </div>
//     </div>
//     ${sectionBar("SECTION C")}
//   </div>

//   <!-- ══════════════ SECTION D – HOSPITALIZATION ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DETAILS OF HOSPITALIZATION:")}

//       <!-- a) Hospital name -->
//       <div class="row">
//         <span class="lbl">a) Name of Hospital where Admited:</span>
//         <span class="cb-group">${boxes(40, f.hospitalName)}</span>
//       </div>

//       <!-- b) Room category -->
//       <div class="row">
//         <span class="lbl">b) Room Category occupied:</span>
//         <span class="txt-opt">Day care</span>${chk()}
//         <span class="txt-opt">Single occupancy</span>${chk()}
//         <span class="txt-opt">Twin sharing</span>${chk()}
//         <span class="txt-opt">3 or more beds per room</span>${chk()}
//       </div>

//       <!-- c) due to + d) date -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">c) Hospitalization due to:</span>
//           <span class="txt-opt">Injury</span>${chk()}
//           <span class="txt-opt">Illness</span>${chk()}
//           <span class="txt-opt">Maternity</span>${chk()}
//         </div>
//         <div class="row">
//           <span class="lbl">d) Date of injury / Date Disease first detected /Date of Delivery:</span>
//           ${dateBoxes(f.injuryDate)}
//         </div>
//       </div>

//       <!-- e) Admission + f) Time + g) Discharge + h) Time -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">e) Date of Admission:</span>
//           ${dateBoxes(f.admissionDate)}
//         </div>
//         <div class="row">
//           <span class="lbl">f) Time</span>
//           <span class="cb-group">${boxes(4, f.admissionTime)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">g) Date of Discharge:</span>
//           ${dateBoxes(f.dischargeDate)}
//         </div>
//         <div class="row">
//           <span class="lbl">h) Time:</span>
//           <span class="cb-group">${boxes(4, f.dischargeTime)}</span>
//         </div>
//       </div>

//       <!-- i) injury cause -->
//       <div class="row">
//         <span class="lbl">I) If injury give cause:</span>
//         <span class="txt-opt">Self inflicted</span>${chk()}
//         <span class="txt-opt">Road Traffic Accident</span>${chk()}
//         <span class="txt-opt">Substance Abuse / Alcohol Consumption</span>${chk()}
//         <span class="lbl" style="margin-left:8px">l) If Medico legal</span>
//         <span class="txt-opt">Yes</span>${chk()}
//         <span class="txt-opt">No</span>${chk()}
//       </div>

//       <!-- ii) iii) j) -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">ii) Reported to Police</span>${chk()}
//         </div>
//         <div class="row">
//           <span class="lbl">iii. MLC Report &amp; Police FIR attached</span>${chk()}
//           <span class="txt-opt">Yes</span>${chk()}
//           <span class="txt-opt">No</span>
//         </div>
//         <div class="row">
//           <span class="lbl">j) System of Medicine:</span>
//           <span class="uline" style="min-width:100px">${esc(f.treatingDoctor)}</span>
//         </div>
//       </div>
//     </div>
//     ${sectionBar("SECTION D")}
//   </div>

//   <!-- ══════════════ SECTION E – CLAIM DETAILS ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DETAILS OF CLAIM:")}
//       <div class="sec-e-body">
//         <div class="sec-e-main">
//           <!-- a) treatment expenses -->
//           <div class="row"><span class="lbl">a) Details of the Treatment expenses claimed</span></div>

//           <div class="row-between">
//             <div class="row">
//               <span class="lbl">I. Pre -hospitalization expenses</span>
//               <span class="lbl">Rs.</span>
//               <span class="cb-group">${boxes(8, f.claimPre)}</span>
//             </div>
//             <div class="row">
//               <span class="lbl">ii. Hospitalization expenses Rs.</span>
//               <span class="cb-group">${boxes(8, f.claimHospital)}</span>
//             </div>
//           </div>

//           <div class="row-between">
//             <div class="row">
//               <span class="lbl">iii. Post-hospitalization expenses</span>
//               <span class="lbl">Rs.</span>
//               <span class="cb-group">${boxes(8, f.claimPost)}</span>
//             </div>
//             <div class="row">
//               <span class="lbl">iv. Health-Check up cost: Rs.</span>
//               ${emptyBoxes(8)}
//             </div>
//           </div>

//           <div class="row-between">
//             <div class="row">
//               <span class="lbl">v. Ambulance Charges:</span>
//               <span class="lbl">Rs.</span>
//               ${emptyBoxes(8)}
//             </div>
//             <div class="row">
//               <span class="lbl">vi. Others (code):</span>
//               ${emptyBoxes(3)}
//               <span class="lbl" style="margin-left:3px">Rs.</span>
//               ${emptyBoxes(8)}
//             </div>
//           </div>

//           <!-- Total -->
//           <div class="row" style="justify-content:flex-end; margin-right:4px">
//             <span class="lbl" style="font-weight:700; font-size:10px">Total</span>
//             <span class="lbl" style="margin-left:6px">Rs.</span>
//             <span class="cb-group">${emptyBoxes(10)}</span>
//           </div>

//           <!-- vii + viii -->
//           <div class="row-between">
//             <div class="row">
//               <span class="lbl">vii. Pre -hospitalization period:</span>
//               <span class="lbl">days</span>
//               ${emptyBoxes(3)}
//             </div>
//             <div class="row">
//               <span class="lbl">viii. Post -hospitalization period: days</span>
//               ${emptyBoxes(3)}
//             </div>
//           </div>

//           <!-- b) domiciliary -->
//           <div class="row">
//             <span class="lbl">b) Claim for Domiciliary Hospitalization:</span>
//             ${chk()}<span class="txt-opt">Yes</span>
//             ${chk()}<span class="txt-opt">No</span>
//             <span class="txt-opt">(If yes, provide details in annexure)</span>
//           </div>

//           <!-- c) lump sum -->
//           <div class="row"><span class="lbl">c) Details of Lump sum / cash benefit claimed:</span></div>

//           <div class="row-between">
//             <div class="row">
//               <span class="lbl">i. Hospital Daily cash:</span>
//               <span class="lbl">Rs.</span>${emptyBoxes(8)}
//             </div>
//             <div class="row">
//               <span class="lbl">ii. Surgical Cash:</span>
//               <span class="lbl">Rs.</span>${emptyBoxes(8)}
//             </div>
//           </div>

//           <div class="row-between">
//             <div class="row">
//               <span class="lbl">iii. Critical Illness benefit:</span>
//               <span class="lbl">Rs.</span>${emptyBoxes(8)}
//             </div>
//             <div class="row">
//               <span class="lbl">iv. Convalescence:</span>
//               <span class="lbl">Rs.</span>${emptyBoxes(8)}
//             </div>
//           </div>

//           <div class="row-between">
//             <div class="row">
//               <span class="lbl">v. Pre/Post hospitalization Lump sum benefit Rs.</span>${emptyBoxes(8)}
//             </div>
//             <div class="row">
//               <span class="lbl">vi. Others</span>
//               <span class="lbl">Rs.</span>${emptyBoxes(8)}
//             </div>
//           </div>
//         </div>

//         <!-- CHECKLIST -->
//         <div class="checklist">
//           <div class="lbl-hd">Claim Documents Submitted - Check List:</div>
//           ${[
//             "Claim form duly signed",
//             "Copy of the claim intimation, if any",
//             "Hospital Main Bill",
//             "Hospital Break-up Bill",
//             "Hospital Bill Payment Receipt",
//             "Hospital Discharge Summary",
//             "Pharmacy Bill",
//             "Operation Theater Notes",
//             "ECG",
//             "Doctors request for investigation",
//             "Investigation Reports (Including CT MRI / USG / HPE)",
//             "Doctors Prescriptions",
//             "Others",
//           ]
//             .map(
//               (item) => `
//           <div class="cl-item">${chk()}<span>${item}</span></div>`
//             )
//             .join("")}
//         </div>
//       </div>
//     </div>
//     ${sectionBar("SECTION E")}
//   </div>

//   <!-- ══════════════ SECTION F – BILLS ENCLOSED ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DETAILS OF BILLS ENCLOSED:")}
//       <table class="bills">
//         <thead>
//           <tr>
//             <th style="width:30px">Sl. No.</th>
//             <th style="width:50px">Bill No.</th>
//             <th style="width:80px">Date</th>
//             <th style="width:130px">Issued by</th>
//             <th>Towards</th>
//             <th style="width:120px">Amount (Rs)</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${[
//             "Hospital main Bill",
//             "Pre-hospitalization Bills:  Nos",
//             "Post-hospitalization Bills:  Nos",
//             "Pharmacy Bills",
//             "", "", "", "", "", "",
//           ]
//             .map(
//               (label, i) => `
//           <tr>
//             <td class="num" style="font-size:8px">${i + 1}.</td>
//             <td></td>
//             <td>
//               <div class="mini-box-group">
//                 ${Array(6).fill('<span class="mini-box"></span>').join("")}
//               </div>
//             </td>
//             <td></td>
//             <td style="font-size:8px">${label}</td>
//             <td>
//               <div class="mini-box-group">
//                 ${Array(10).fill('<span class="mini-box"></span>').join("")}
//               </div>
//             </td>
//           </tr>`
//             )
//             .join("")}
//         </tbody>
//       </table>
//     </div>
//     ${sectionBar("SECTION F")}
//   </div>

//   <!-- ══════════════ SECTION G – BANK ACCOUNT ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DETAILS OF PRIMARY INSURED'S BANK ACCOUNT:")}

//       <!-- a) PAN + b) Account -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">a) PAN:</span>
//           <span class="cb-group">${boxes(10, f.pan)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">b) Account Number:</span>
//           <span class="cb-group">${boxes(22, f.accountNumber)}</span>
//         </div>
//       </div>

//       <!-- c) Bank name -->
//       <div class="row">
//         <span class="lbl">c) Bank Name and Branch:</span>
//         <span class="cb-group">${boxes(40, f.bankNameBranch)}</span>
//       </div>

//       <!-- d) Cheque + e) IFSC -->
//       <div class="row-between">
//         <div class="row">
//           <span class="lbl">d) Cheque / DD Payable details:</span>
//           <span class="uline uline-xl">${esc(f.chequeDetails)}</span>
//         </div>
//         <div class="row">
//           <span class="lbl">e) IFSC Code:</span>
//           <span class="cb-group">${boxes(11, f.ifscCode)}</span>
//         </div>
//       </div>
//     </div>
//     ${sectionBar("SECTION G")}
//   </div>

//   <!-- ══════════════ SECTION H – DECLARATION ══════════════ -->
//   <div class="section-wrap">
//     <div class="section-body">
//       ${divider("DECLARATION BY THE INSURED:")}

//       <p class="declaration-text">
//         I hereby declare that the information furnished in the claim form is true &amp; correct to the best of my knowledge and belief. If I have made any false or untrue statement,
//         suppression or concealment of any material fact with respect to questions asked in relation to this claim, my right to claim reimbursement shall be forfeited.
//         I also consent &amp; authorize TPA / insurance Company, to seek necessary medical information / documents from any hospital / Medical Practitioner who has attended on
//         the person against whom this claim is made. I hereby declare that I have included all the bills / receipts for the purpose of this claim &amp; that I will not be
//         making any supplementary claim, except the pre/post-hospitalization claim, if any.
//       </p>

//       <!-- Date + Place + Signature -->
//       <div class="row-between" style="align-items:flex-end">
//         <div class="row">
//           <span class="lbl">Date</span>
//           ${dateBoxes(f.declarationDate)}
//         </div>
//         <div class="row">
//           <span class="lbl">Place:</span>
//           <span class="uline" style="min-width:120px">${esc(f.declarationPlace)}</span>
//         </div>
//         <div class="row" style="flex-direction:column; align-items:center; gap:2px">
//           ${
//             signatureImage
//               ? `<div class="sig-box"><img src="${signatureImage}" class="sig-img"/></div>`
//               : `<div class="sig-box"></div>`
//           }
//           <span class="lbl" style="font-size:8px">Signature of the Insured</span>
//         </div>
//       </div>

//       <div class="footer-line">
//         <div class="footer-note">(IMPORTANT: PLEASE TURN OVER)</div>
//       </div>
//     </div>
//     ${sectionBar("SECTION H")}
//   </div>

// </div>
// </body>
// </html>`;

//   return html;
// }


// /**
//  * downloadInsuranceClaim
//  * Opens a new browser window/tab with the generated HTML so the user
//  * can print it to PDF or save it directly.
//  * On native (iOS/Android) it falls back to a share-sheet via Linking.
//  */
// export async function downloadInsuranceClaim(form, signatureImage) {
//   const html = generateInsuranceFormHTML(form, signatureImage);

//   if (typeof window !== "undefined" && window.open) {
//     const win = window.open("", "_blank");
//     if (win) {
//       win.document.write(html);
//       win.document.close();
//       // trigger print dialog so user can save as PDF
//       win.focus();
//       setTimeout(() => win.print(), 600);
//       return;
//     }
//   }

//   // Fallback: download as .html file
//   const blob = new Blob([html], { type: "text/html" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "MediAssist_Reimbursement_Claim.html";
//   a.click();
//   URL.revokeObjectURL(url);
// }
