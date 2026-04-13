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
