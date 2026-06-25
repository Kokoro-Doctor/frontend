/**
 * Medi Assist – Claim Form Part B (hospital section)
 * Pixel-matched to the scanned original.
 */
import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
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
  width: 100%;
  padding: 2px 2px 0;
  margin-bottom: 6px;
}

.hdr-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.hdr-logo-wrap {
  width: 180px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  
  flex-shrink: 0;
}

.hdr-logo {
  width: 142px;
  height: auto;
  object-fit: contain;
  object-position: left top;
  display: block;
}

.hdr-center {
  flex: 1;
  text-align: center;
  padding: 0 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hdr-title {
  font-size: 10px;
  font-weight: 500;
  line-height: 1.05;
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0;
  margin-top: 20px;
}

.hdr-subtitle {
  font-size: 10px;
  font-weight: 500;
  margin-top: 1px;
  line-height: 1;
}

.hdr-right {
  width: 178px;
  text-align: right;
  font-size: 7px;
  font-weight: 600;
  line-height: 1.2;
  padding-top: 34px;
  flex-shrink: 0;
  letter-spacing: 0.1px;
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

  <div class="hdr-top">

    <!-- LEFT LOGO -->
    <div class="hdr-logo-wrap">
      <img src="${MEDI_ASSIST_LOGO_DATA_URI}" class="hdr-logo" alt="Medi Assist" />
    </div>

    <!-- CENTER TITLE -->
<div class="hdr-center">

  <div class="hdr-title">
    REQUEST FOR CASHLESS HOSPITALISATION FOR HEALTH INSURANCE POLICY
  </div>

  <div class="hdr-subtitle">
    PART C (Revised)
  </div>

</div>

    <!-- RIGHT TEXT -->
    <div class="hdr-right">
      TO BE FILLED IN BLOCK LETTERS
    </div>

  </div>

  <!-- Hospital Fields -->
  <div class="hospital-header">

    

    

    

  </div>

<!-- ══════════ SECTION A ══════════ -->
<div class="sec-wrap">
  <div class="sec-body" style="padding:0 8px;">

    

    <!-- MAIN ROW -->
    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:18px;
      "
    >

     <!-- LEFT -->
<div style="width:55%;">

  ${[
    "g) Per Day Room Rent + Nursing & Service charges + Patient’s Diet:",
    "h) Expected cost for investigation + diagnostics:",
    "i) ICU Charges:",
    "j) OT Charges:",
    "k) Professional fees Surgeon + Anesthetist fees + Consultation charges:",
    "L) Medicines + Consumables cost of Implants: (specify if applicable)",
    "m) Other hospital expenses if any:",
    "n) All inclusive package charges if any applicable :",
    "o) Sum Total expected cost of hospitalization",
  ]
    .map(
      (label) => `
    <div
  style="
    display:flex;
    align-items:center;
    margin-bottom:5px;
    width:100%;
    min-height:20px;
  "
>

      <!-- LABEL -->
      <div
        style="
          width:260px;
flex-shrink:0;
display:flex;
align-items:center;
        "
      >
        ${label}
      </div>

      <!-- RS -->
      <div
        style="
          font-size:9px;
          margin-left:4px;
          margin-right:4px;
          white-space:nowrap;
          
        "
      >
        Rs.
      </div>

      <!-- 8 BOXES -->
      <div
  style="
    display:flex;
    align-items:center;
    flex-wrap:nowrap;
    gap:1px;
    margin-top:-1px;
  "
>
        ${Array.from({ length: 8 })
          .map(
            () => `
  <span
    style="
      width:18px;
      height:18px;
      border:1px solid #666;
      display:inline-block;
      flex-shrink:0;
      margin:0;
      padding:0;
      vertical-align:middle;
    "
  ></span>
`,
          )
          .join("")}
      </div>

    </div>
  `,
    )
    .join("")}

</div>
      <!-- RIGHT -->
      <div style="width:40%;">

        <!-- TITLE -->
        <div
          style="
            font-size:9px;
            
            line-height:1.2;
            margin-bottom:8px;
          "
        >
          p. Mandatory past history of any chronic illness.
          If yes (since month/year)
        </div>

        ${[
          "1. Diabetes",
          "2. Heart Disease",
          "3. Hypertension",
          "4. Hyperlipidemias",
          "5. Osteoarthritis",
          "6. Asthma/ COPD / Bronchitis",
          "7. Cancer",
          "8. Alcohol or drug abuse",
          "9. Any HIV or STD / related ailments",
        ]
          .map(
            (item) => `
          <div
            style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              margin-bottom:6px;
            "
          >

            <!-- LEFT -->
            <div
              style="
                display:flex;
                align-items:center;
                gap:7px;
              "
            >
              <span
                style="
                  width:12px;
                  height:12px;
                  border:1px solid #555;
                  display:inline-block;
                  flex-shrink:0;
                "
              ></span>

              <span
                style="
                  font-size:10px;
                  line-height:1;
                "
              >
                ${item}
              </span>
            </div>

            <!-- MM YY -->
            <div
              style="
                display:flex;
                align-items:center;
                gap:3px;
              "
            >

              <span class="cb">M</span>
              <span class="cb">M</span>

              

              <span class="cb">Y</span>
              <span class="cb">Y</span>

            </div>

          </div>
        `,
          )
          .join("")}

        <!-- OTHER -->
        <div style="margin-top:10px;">

          <div
            style="
              font-size:10px;
              margin-bottom:5px;
              font-weight:500;
              margin-left:16px;
            "
          >
            10. Any other ailment give details:
          </div>

          <div
            style="
              width:100%;
              height:50px;
              border:1px solid #666;
              margin-left:16px;
            "
          ></div>

        </div>

      </div>

    </div>

  </div>
</div>
<!-- ══════════ SECTION B ══════════ -->
<div class="sec-wrap">
  <div class="sec-body" style="padding:4px 8px;">

    <!-- TOP DECLARATION TITLE -->
    <div
      style="
        display:flex;
        align-items:center;
        margin-bottom:6px;
      "
    >

      <div style="flex:1;height:10px;background:#000;"></div>

      <div
        style="
          padding:0 14px;
          font-size:10px;
          font-weight:700;
          text-transform:uppercase;
          white-space:nowrap;
        "
      >
        DECLARATION
        <span style="font-weight:500;">
          (PLEASE READ VERY CAREFULLY)
        </span>
      </div>

      <div style="flex:1;height:10px;background:#000;"></div>

    </div>

    <!-- TOP TEXT -->
    <div
      style="
        font-size:8px;
        margin-bottom:8px;
      "
    >
      We confirm having read understood and agreed to the declaration of this form
    </div>

    <!-- a -->
    <div
      style="
        display:flex;
        align-items:center;
        margin-bottom:8px;
        gap:8px;
      "
    >

      <div
        style="
          font-size:8px;
          white-space:nowrap;
        "
      >
        a) Name of the treating doctor:
      </div>

      <div
        style="
          display:flex;
          gap:2px;
          flex-wrap:nowrap;
        "
      >
        ${Array.from({ length: 34 })
          .map(
            () => `
          <span
            style="
              width:15px;
height:16px;
              border:1px solid #555;
              display:inline-block;
            "
          ></span>
        `,
          )
          .join("")}
      </div>

    </div>

    <!-- b + c -->
    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:14px;
        gap:20px;
      "
    >

      <!-- LEFT -->
      <div
        style="
          display:flex;
          align-items:center;
          gap:8px;
          flex:1;
        "
      >

        <div
          style="
            font-size:8px;
            white-space:nowrap;
          "
        >
          b) Qualification:
        </div>

        <div
          style="
            display:flex;
            gap:2px;
          "
        >
          ${Array.from({ length: 16 })
            .map(
              () => `
            <span
              style="
                width:15px;
height:16px;
                border:1px solid #555;
                display:inline-block;
              "
            ></span>
          `,
            )
            .join("")}
        </div>

      </div>

      <!-- RIGHT -->
      <div
        style="
          display:flex;
          align-items:center;
          gap:8px;
        "
      >

        <div
          style="
            font-size:8px;
            white-space:nowrap;
          "
        >
          c) Registration No. with State code:
        </div>

        <div
          style="
            display:flex;
            gap:2px;
          "
        >
          ${Array.from({ length: 10 })
            .map(
              () => `
            <span
              style="
                width:15px;
height:16px;
                border:1px solid #555;
                display:inline-block;
              "
            ></span>
          `,
            )
            .join("")}
        </div>

      </div>

    </div>

    <!-- PATIENT DECLARATION -->
    <div
      style="
        font-size:10px;
        font-weight:700;
        margin-bottom:6px;
        text-transform:uppercase;
      "
    >
      DECLARATION BY THE PATIENT / REPRESENTATIVE
    </div>

    <!-- POINTS -->
    <div
      style="
        font-size:8px;
        line-height:1.35;
      "
    >

      <div style="display:flex;margin-bottom:2px;">
        <div style="width:16px;">a.</div>
        <div>
          I agree to allow the hospital to submit all original documents pertaining to hospitalization to the Insurer/TPA after the discharge. I agree to sign on the Final Bill & the Discharge Summary, before my discharge.
        </div>
      </div>

      <div style="display:flex;margin-bottom:2px;">
        <div style="width:16px;">b.</div>
        <div>
          Payment to hospital is governed by the terms and conditions of the policy. In case the Insurer / TPA is not liable to settle the hospital bill, I undertake to settle the bill as per the terms and conditions of the policy.
        </div>
      </div>

      <div style="display:flex;margin-bottom:2px;">
        <div style="width:16px;">c.</div>
        <div>
          All non-medical expenses and expenses not relevant to current hospitalization and the amounts over & above the limit authorized by the Insurer/TPA not governed by the terms and conditions of the policy will be paid by me.
        </div>
      </div>

      <div style="display:flex;margin-bottom:2px;">
        <div style="width:16px;">d.</div>
        <div>
          I hereby declare to abide by the terms and conditions of the policy and if at any time the facts disclosed by me are found to be false or incorrect I forfeit my claim and agree to indemnify the insurer / TPA
        </div>
      </div>

      <div style="display:flex;margin-bottom:2px;">
        <div style="width:16px;">e.</div>
        <div>
          I agree and understand that TPA is in no way warranting the service of the hospital & that the Insurer / TPA is in no way guaranteeing that the services provided by the hospital will be of a particular quality or standard.
        </div>
      </div>

      <div style="display:flex;margin-bottom:2px;">
        <div style="width:16px;">f.</div>
        <div>
          I hereby warrant the truth of the forgoing particulars in every respect and I agree that if I have made or shall make any false or untrue statement, suppression or concealment with respect to the claim, my right to claim reimbursement of the said expenses shall be absolutely forfeited.
        </div>
      </div>

      <div style="display:flex;margin-bottom:2px;">
        <div style="width:16px;">g.</div>
        <div>
          I agree to indemnify the hospital against all expenses incurred on my behalf, which are not reimbursed by the Insurer/ TPA.
        </div>
      </div>

      <div style="display:flex;">
        <div style="width:16px;">h.</div>
        <div>
          “I/We authorize Insurance Company/TPA to contact me/us through mobile/email for any update on this claim”
        </div>
      </div>

    </div>

  </div>
</div>

<!-- ══════════ SECTION C ══════════ -->
<div class="sec-wrap">
  <div class="sec-body" style="padding:6px 8px;">

    <!-- ROW 1 -->
    <div
      style="
        display:flex;
        align-items:flex-start;
        margin-bottom:8px;
      "
    >

      <!-- LEFT -->
      <div
        style="
          width:220px;
          font-size:9px;
          line-height:1;
          white-space:nowrap;
        "
      >
        a) Patient's / Insured's name:
      </div>

      <!-- BOXES -->
      <div
        style="
          display:flex;
          flex-wrap:nowrap;
          gap:2px;
        "
      >
        ${Array.from({ length: 38 })
          .map(
            () => `
          <span
            style="
              width:15px;
height:16px;
              border:1px solid #666;
              display:inline-block;
              flex-shrink:0;
            "
          ></span>
        `,
          )
          .join("")}
      </div>

    </div>

    <!-- ROW 2 -->
    <div
      style="
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:20px;
        margin-bottom:10px;
      "
    >

      <!-- LEFT SIDE -->
      <div
        style="
          display:flex;
          align-items:center;
          gap:8px;
        "
      >

        <div
          style="
            font-size:9px;
            white-space:nowrap;
          "
        >
          b) Contact number:
        </div>

        <div
          style="
            display:flex;
            gap:2px;
          "
        >
          ${Array.from({ length: 10 })
            .map(
              () => `
            <span
              style="
                width:15px;
height:16px;
                border:1px solid #666;
                display:inline-block;
              "
            ></span>
          `,
            )
            .join("")}
        </div>

      </div>

      <!-- RIGHT SIDE -->
      <div
        style="
          display:flex;
          align-items:center;
          gap:8px;
        "
      >

        <div
          style="
            font-size:9px;
            white-space:nowrap;
          "
        >
          c) Email ID: (Optional)
        </div>

        <div
          style="
            display:flex;
            gap:2px;
          "
        >
          ${Array.from({ length: 22 })
            .map(
              () => `
            <span
              style="
                width:15px;
height:16px;
                border:1px solid #666;
                display:inline-block;
              "
            ></span>
          `,
            )
            .join("")}
        </div>

      </div>

    </div>

    <!-- ROW 3 -->
    <div
      style="
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:25px;
        margin-bottom:12px;
      "
    >

      <!-- SIGNATURE -->
      <div
        style="
          display:flex;
          align-items:flex-start;
          gap:10px;
        "
      >

        <div
          style="
            font-size:9px;
            white-space:nowrap;
            margin-top:3px;
          "
        >
          d) Patient's / Insured's signature:
        </div>

        <div
          style="
            width:430px;
            height:100px;
            border:1px solid #666;
          "
        ></div>

      </div>

      <!-- DATE TIME -->
      <div
        style="
          display:flex;
          align-items:flex-start;
          gap:30px;
          margin-top:2px;
        "
      >

        <!-- DATE -->
        <div
          style="
            display:flex;
            align-items:center;
            gap:8px;
          "
        >

          <div
            style="
              font-size:9px;
              white-space:nowrap;
            "
          >
            Date:
          </div>

          <div
            style="
              display:flex;
              gap:2px;
              align-items:center;
            "
          >

            <span class="cb">D</span>
            <span class="cb">D</span>

            <span class="cb">M</span>
            <span class="cb">M</span>

            <span class="cb">Y</span>
            <span class="cb">Y</span>
            <span class="cb">Y</span>
            <span class="cb">Y</span>

          </div>

        </div>

        <!-- TIME -->
        <div
          style="
            display:flex;
            align-items:center;
            gap:8px;
          "
        >

          <div
            style="
              font-size:10px;
              white-space:nowrap;
            "
          >
            Time:
          </div>

          <div
            style="
              display:flex;
              gap:2px;
              align-items:center;
            "
          >

            <span class="cb">H</span>
            <span class="cb">H</span>

            <span class="cb">M</span>
            <span class="cb">M</span>

          </div>

        </div>

      </div>

    </div>

    <!-- HOSPITAL DECLARATION -->
    <div
      style="
        margin-top:6px;
      "
    >

      <div
        style="
          font-size:12px;
          font-weight:700;
          margin-bottom:6px;
          text-transform:uppercase;
        "
      >
        HOSPITAL DECLARATION
      </div>

      <div
        style="
          font-size:8px;
          line-height:1.35;
        "
      >
        <div>a.&nbsp; We have no objection to any authorized TPA / Insurance Company official verifying documents pertaining to hospitalization.</div>

        <div>b.&nbsp; All valid original documents duly countersigned by the insured / patient as per the checklist below will be sent to TPA/ Insurance Company within 7 days of the patient's discharge.</div>

        <div>c.&nbsp; We agree that TPA / Insurance Company will not be Liable to make the payment in the event of any discrepancy between the facts in this form and discharge summary or other documents.</div>

        <div>d.&nbsp; The patient declaration has been signed by the patient or by his representative in our presence.</div>

        <div>e.&nbsp; We agree to provide clarifications for the queries raised regarding this hospitalization and we take the sole responsibility for any delay in offering clarifications.</div>

        <div>f.&nbsp; We will abide by the terms and conditions agreed in the MOU.</div>

        <div>g.&nbsp; We confirm that no additional amount would be collected from the insured in excess of Agreed Package Rates except costs towards non-admissible amounts.</div>

        <div>h.&nbsp; We confirm that no recoveries would be made from the deposit amount collected from the insured except for costs towards non-admissible amounts.</div>

        <div>i.&nbsp; In the event of unauthorized recovery of any additional amount from the insured in excess of Agreed Package Rates, the authorized TPA / Insurance Company reserves the right to recover the same from us.</div>

      </div>

    </div>

  </div>
</div>
<!-- ══════════ SECTION D ══════════ -->
<div class="sec-wrap">
  <div class="sec-body" style="padding:6px 10px 2px;">

    <!-- TITLE -->
    <div
      style="
        font-size:12px;
        font-weight:700;
        text-transform:uppercase;
        margin-bottom:6px;
      "
    >
      DOCUMENTS TO BE PROVIDED BY THE HOSPITAL IN SUPPORT OF THE CLAIM
    </div>

    <!-- LIST -->
    <div
      style="
        font-size:8px;
        line-height:1.35;
        margin-bottom:10px;
      "
    >

      <div>1.&nbsp; Detailed Discharge Summary and all Bills from the hospital.</div>

      <div>2.&nbsp; Cash Memos from the Hospitals / Chemists supported by proper prescription.</div>

      <div>
        3.&nbsp; Receipts and Pathological Test Reports from Pathologists,
        Supported by note from the attending Medical Practitioner /
        Surgeon recommending such pathological Tests.
      </div>

      <div>
        4.&nbsp; Surgeon’s Certificate stating nature of Operation performed
        and Surgeon’s Bill and Receipt.
      </div>

      <div>
        5.&nbsp; Certificates from attending Medical Practitioner /
        Surgeon that the patient is fully cured.
      </div>

    </div>

    <!-- SEAL + SIGNATURE -->
    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:40px;
        margin-bottom:8px;
      "
    >

      <!-- LEFT -->
      <div style="flex:1;">

        <div
          style="
            display:flex;
            align-items:flex-start;
            gap:8px;
          "
        >

          <div
            style="
              font-size:9px;
              white-space:nowrap;
              margin-top:2px;
            "
          >
            Hospital seal:
          </div>

          <div
            style="
              width:250px;
              height:80px;
              border:1px solid #666;
            "
          ></div>

        </div>

      </div>

      <!-- RIGHT -->
      <div style="flex:1;">

        <div
          style="
            display:flex;
            align-items:flex-start;
            gap:8px;
          "
        >

          <div
            style="
              font-size:9px;
              white-space:nowrap;
              margin-top:2px;
            "
          >
            Doctor’s signature:
          </div>

          <div
            style="
              width:250px;
              height:80px;
              border:1px solid #666;
            "
          ></div>

        </div>

      </div>

    </div>

    <!-- DATE TIME -->
    <div
      style="
        display:flex;
        align-items:center;
        gap:24px;
        margin-bottom:8px;
      "
    >

      <!-- DATE -->
      <div
        style="
          display:flex;
          align-items:center;
          gap:8px;
        "
      >

        <div
          style="
            font-size:9px;
            white-space:nowrap;
          "
        >
          Date:
        </div>

        <div
          style="
            display:flex;
            gap:2px;
            align-items:center;
          "
        >

          <span class="cb">D</span>
          <span class="cb">D</span>

          <span class="cb">M</span>
          <span class="cb">M</span>

          <span class="cb">Y</span>
          <span class="cb">Y</span>
          <span class="cb">Y</span>
          <span class="cb">Y</span>

        </div>

      </div>

      <!-- TIME -->
      <div
        style="
          display:flex;
          align-items:center;
          gap:8px;
        "
      >

        <div
          style="
            font-size:9px;
            white-space:nowrap;
          "
        >
          Time:
        </div>

        <div
          style="
            display:flex;
            gap:2px;
            align-items:center;
          "
        >

          <span class="cb">H</span>
          <span class="cb">H</span>

          <span class="cb">M</span>
          <span class="cb">M</span>

        </div>

      </div>

    </div>

    <!-- BOTTOM LINE -->
    <div
      style="
        border-top:1px solid #666;
        margin-top:4px;
        padding-top:4px;
        text-align:right;
        font-size:8px;
      "
    >
      Page 1 of 2 | Version: 25.06.2019
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
