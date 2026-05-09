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
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
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

function isYes(value) {
  return String(value ?? "").trim().toLowerCase() === "yes";
}

function isNo(value) {
  return String(value ?? "").trim().toLowerCase() === "no";
}

function relationshipChecked(value, key) {
  const rel = String(value ?? "").trim().toLowerCase();
  if (!rel) return false;
  if (key === "other") {
    return !["self", "spouse", "child", "father", "mother"].some(
      (item) => rel === item || rel.includes(item),
    );
  }
  return rel === key || rel.includes(key);
}

function occupationChecked(value, key) {
  const occupation = String(value ?? "").trim().toLowerCase();
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
  const room = String(value ?? "").trim().toLowerCase();
  if (!room) return false;
  if (key === "day care") return room.includes("day");
  if (key === "single occupancy") return room.includes("single");
  if (key === "twin sharing") return room.includes("twin") || room.includes("double");
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
  const cause = String(value ?? "").trim().toLowerCase();
  if (!cause) return false;
  if (key === "injury") return cause.includes("injur");
  if (key === "illness") {
    return cause.includes("ill") || cause.includes("disease") || cause.includes("sick");
  }
  if (key === "maternity") {
    return cause.includes("mater") || cause.includes("deliver") || cause.includes("pregnan");
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
    margin-bottom: 4px;
    border-bottom: 0.5px solid #8d8d8d;
    padding-bottom: 2px;
  }
  .header-top {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 28mm;
    padding-bottom: 3px;
  }
  .header-logo-image {
    width: 42mm;
    min-width: 42mm;
    height: 28mm;
    object-fit: contain;
    object-position: center center;
    display: block;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .header-company {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 1.5px;
    pointer-events: none;
  }
  .header-company-title {
    font-size: 13px;
    font-weight: bold;
    letter-spacing: 0.3px;
    color: #111;
    margin-bottom: 2px;
     font-family: Georgia, "Times New Roman", serif;
  }
  .header-company-line {
    font-size: 7.2px;
    line-height: 1.4;
    color: #222;
  }
  .header-company-line-compact {
    font-size: 6.8px;
    line-height: 1.4;
    color: #222;
  }
  .header-claim-bar {
    margin-top: 0;
    background: #2d2d2d;
    color: #fff;
    text-align: center;
    font-size: 9.5px;
    font-weight: bold;
    padding: 3px 0 4px;
    letter-spacing: 0.5px;
  }
  .header-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    margin-top: 3px;
  }
  .header-fill-copy {
    display: flex;
    align-items: baseline;
    gap: 5px;
    flex: 1;
    flex-wrap: wrap;
  }
  .header-fill-title {
    font-size: 7px;
    font-weight: bold;
    color: #333;
  }
  .header-fill-note {
    font-size: 6.5px;
    color: #4a4a4a;
  }
  .header-claim-no {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    white-space: nowrap;
  }
  .header-claim-no-label {
    font-size: 7px;
    color: #333;
  }
  .header-claim-no-line {
    width: 27mm;
    height: 7px;
    border-bottom: 0.7px solid #3f3f3f;
  }
  .header-block-note {
    border: 0.5px solid #777;
    padding: 0.5px 3px;
    font-size: 6px;
    color: #444;
    line-height: 1.15;
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
</style>
</head>
<body>
<div class="insurance-form-root">

<!-- ══════════════════════ HEADER ══════════════════════ -->
<div class="form-header">
  <div class="header-top">
    <img
      src="${logoSrc}"
      alt="Star Health and Allied Insurance"
      class="header-logo-image"
    />
    <div class="header-company">
      <div class="header-company-title">STAR HEALTH AND ALLIED INSURANCE COMPANY LIMITED</div>
      <div class="header-company-line">Regd. &amp; Corporate Office: 1, New Tank Street, Valluvar Kottam High Road, Nungambakkam, Chennai - 600 034.</div>
      <div class="header-company-line">Corporate Office - Claims Dept.: No.15, Balaji Complex, Whites Lane, 1st Floor, Royapettah, Chennai - 600 014.</div>
      <div class="header-company-line">Toll free Phone No: 1800 425 2255 &nbsp;&nbsp; Toll free Fax No: 1800 425 5522</div>
      <div class="header-company-line header-company-line-compact">CIN : L66010TN2005PLC056649 &nbsp; Email:support@starhealth.in &nbsp; Website: www.starhealth.in &nbsp; IRDAI Regn. No: 129</div>
    </div>
  </div>
  <div class="header-claim-bar">CLAIM FORM - PART - A</div>
  <div class="header-bottom">
    <div class="header-fill-copy">
      <div class="header-fill-title">TO BE FILLED IN BY THE INSURED</div>
      <div class="header-fill-note">The issue of this Form is not to be taken as an admission of liability</div>
    </div>
    <div class="header-claim-no">
      <span class="header-claim-no-label">Claim No.</span>
      <span class="header-claim-no-line"></span>
      <span class="header-block-note">(To be filled in block letters)</span>
    </div>
  </div>
</div>

<!-- ══════════════════════ SECTION A: PRIMARY INSURED ══════════════════════ -->
<div class="section-wrap section-a-wrap">
  <div class="section-a-content">
    <div class="section-a-heading">DETAILS OF PRIMARY INSURED:</div>
    <div class="section-a-row">
      <div class="section-a-field">
        <span class="section-a-label">a) Policy No:</span>
        ${lineFieldHtml(f.policyNumber, "line-field-policy")}
      </div>
      <div class="section-a-field">
        <span class="section-a-label">b) Sl. No/ Certificate No:</span>
        ${lineFieldHtml(f.certificateNumber, "line-field-cert")}
      </div>
    </div>
    <div class="section-a-row">
      <div class="section-a-field">
        <span class="section-a-label">c) Company/ TPA ID No:</span>
        ${lineFieldHtml(f.tpaId, "line-field-full")}
      </div>
    </div>
    <div class="section-a-row">
      <div class="section-a-field">
        <span class="section-a-label">d) Name :</span>
        ${lineFieldHtml(f.primaryName, "line-field-full")}
      </div>
    </div>
    <div class="section-a-row section-a-address">
      <span class="section-a-label">e) Address :</span>
      <div class="section-a-address-lines">
        ${lineFieldHtml(f.primaryAddressRow1, "line-field-block")}
        ${lineFieldHtml(f.primaryAddressRow2, "line-field-block")}
      </div>
    </div>
    <div class="section-a-row">
      <div class="section-a-field">
        <span class="section-a-label">City:</span>
        ${lineFieldHtml(f.primaryCity, "line-field-city")}
      </div>
      <div class="section-a-field">
        <span class="section-a-label">State:</span>
        ${lineFieldHtml(f.primaryState, "line-field-state")}
      </div>
    </div>
    <div class="section-a-row">
      <div class="section-a-field">
        <span class="section-a-label">Pin Code:</span>
        ${lineFieldHtml(f.primaryPin, "line-field-pin")}
      </div>
      <div class="section-a-field">
        <span class="section-a-label">Phone No:</span>
        ${lineFieldHtml(f.primaryPhone, "line-field-phone")}
      </div>
      <div class="section-a-field">
        <span class="section-a-label">Email ID:</span>
        ${lineFieldHtml(f.primaryEmail, "line-field-email")}
      </div>
    </div>
  </div>
  ${sectionBar("SECTION A", "section-bar-a")}
</div>

<!-- ══════════════════════ SECTION B: INSURANCE HISTORY ══════════════════════ -->
<div class="section-wrap line-section-wrap">
  <div class="line-section-content">
    <div class="detail-heading">DETAILS OF INSURANCE HISTORY:</div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">a) Currently covered by any other Mediclaim / Health Insurance:</span>
        <span class="option-group">
          <span class="option-item">Yes ${checkBox(isYes(f.bCurrentlyOther))}</span>
          <span class="option-item">No ${checkBox(isNo(f.bCurrentlyOther))}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">b) Date of commencement of first Insurance without break:</span>
        ${segmentedDateHtml(f.insuranceFirstCommencementDate)}
      </div>
      <span class="form-note-inline">(Copies of Policies to be attached)</span>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">c) If yes, company name:</span>
        ${lineFieldHtml(f.insuranceCompanyName, "line-field-b-company")}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">Policy No.</span>
        ${lineFieldHtml(f.insurancePolicyNo, "line-field-b-policy")}
      </div>
    </div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell">
        <span class="form-line-label">Sum Insured (Rs.) :</span>
        ${lineFieldHtml(f.insuranceSumInsured, "line-field-b-sum")}
      </div>
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">d) Have you been hospitalized in the last 4 years?</span>
        <span class="option-group">
          <span class="option-item">Yes ${checkBox(isYes(f.bHosp4Y))}</span>
          <span class="option-item">No ${checkBox(isNo(f.bHosp4Y))}</span>
        </span>
        <span class="form-line-label">Date:</span>
        ${lineFieldHtml(f.hospitalizationHistoryDate, "line-field-b-sum")}
        <span class="form-line-label">Diagnosis:</span>
        ${lineFieldHtml(f.diagnosis, "line-field-b-diagnosis")}
      </div>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell">
        <span class="form-line-label">e) Previously covered by any other Mediclaim / Health insurance :</span>
        <span class="option-group">
          <span class="option-item">Yes ${checkBox(isYes(f.bPreviouslyOther))}</span>
          <span class="option-item">No ${checkBox(isNo(f.bPreviouslyOther))}</span>
        </span>
      </div>
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">f) If yes, Company Name</span>
        ${lineFieldHtml(f.previousMediclaimCompanyName, "line-field-b-prev-company")}
      </div>
    </div>
  </div>
  ${sectionBar("SECTION B")}
</div>

<!-- ══════════════════════ SECTION C: INSURED PERSON HOSPITALIZED ══════════════════════ -->
<div class="section-wrap line-section-wrap">
  <div class="line-section-content">
    <div class="detail-heading">DETAILS OF INSURED PERSON HOSPITALIZED:</div>
    <div class="form-line-row">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">a) Name:</span>
        ${lineFieldHtml(f.hospitalizedName, "line-field-c-name")}
      </div>
    </div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell">
        <span class="form-line-label">b) Gender:</span>
        <span class="option-group">
          <span class="option-item">Male ${checkBox(f.gender === "male")}</span>
          <span class="option-item">Female ${checkBox(f.gender === "female")}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">c) Age:</span>
        <span class="form-line-label">years</span>
        ${placeholderBoxRowHtml(f.ageYears, ["Y", "Y"])}
        <span class="form-line-label">months</span>
        ${placeholderBoxRowHtml(f.ageMonths, ["M", "M"])}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">d) Date of Birth:</span>
        ${segmentedDateHtml(f.dob)}
      </div>
    </div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">e) Relationship to Primary insured:</span>
        <span class="option-group">
          <span class="option-item">Self ${checkBox(relationshipChecked(relationshipValue, "self"))}</span>
          <span class="option-item">Spouse ${checkBox(relationshipChecked(relationshipValue, "spouse"))}</span>
          <span class="option-item">Child ${checkBox(relationshipChecked(relationshipValue, "child"))}</span>
          <span class="option-item">Father ${checkBox(relationshipChecked(relationshipValue, "father"))}</span>
          <span class="option-item">Mother ${checkBox(relationshipChecked(relationshipValue, "mother"))}</span>
          <span class="option-item">Other ${checkBox(relationshipChecked(relationshipValue, "other"))}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">(Please Specify)</span>
        ${lineFieldHtml(f.relationshipSpecify, "line-field-c-specify")}
      </div>
    </div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">f) Occupation:</span>
        <span class="option-group">
          <span class="option-item">Service ${checkBox(occupationChecked(occupationValue, "service"))}</span>
          <span class="option-item">Self Employed ${checkBox(occupationChecked(occupationValue, "self employed"))}</span>
          <span class="option-item">Homemaker ${checkBox(occupationChecked(occupationValue, "homemaker"))}</span>
          <span class="option-item">Student ${checkBox(occupationChecked(occupationValue, "student"))}</span>
          <span class="option-item">Retired ${checkBox(occupationChecked(occupationValue, "retired"))}</span>
          <span class="option-item">Other ${checkBox(occupationChecked(occupationValue, "other"))}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">(Please Specify)</span>
        ${lineFieldHtml(f.occupationSpecify, "line-field-c-specify")}
      </div>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">g) Address (if different from above):</span>
        ${lineFieldHtml(f.hospAddressRow1, "line-field-full")}
      </div>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">&nbsp;</span>
        ${lineFieldHtml(f.hospAddressRow2, "line-field-full")}
      </div>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">City:</span>
        ${lineFieldHtml(f.hospCity, "line-field-c-city")}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">State:</span>
        ${lineFieldHtml(f.hospState, "line-field-c-state")}
      </div>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell">
        <span class="form-line-label">Pin Code:</span>
        ${lineFieldHtml(f.hospPin, "line-field-c-pin")}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">Phone No:</span>
        ${lineFieldHtml(f.hospPhone, "line-field-c-phone")}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">Email ID :</span>
        ${lineFieldHtml(f.hospEmail, "line-field-c-email")}
      </div>
    </div>
  </div>
  ${sectionBar("SECTION C")}
</div>

<!-- ══════════════════════ SECTION D: HOSPITALIZATION ══════════════════════ -->
<div class="section-wrap line-section-wrap">
  <div class="line-section-content">
    <div class="detail-heading">DETAILS OF HOSPITALIZATION:</div>
    <div class="form-line-row">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">a) Name of Hospital where Admitted:</span>
        ${lineFieldHtml(f.hospitalName, "line-field-d-hospital")}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">No. of IP Beds:</span>
        ${lineFieldHtml("", "line-field-d-beds")}
      </div>
    </div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">b) Room Category occupied:</span>
        <span class="option-group">
          <span class="option-item">Day care ${checkBox(roomCategoryChecked(f.roomCategory, "day care"))}</span>
          <span class="option-item">Single occupancy ${checkBox(roomCategoryChecked(f.roomCategory, "single occupancy"))}</span>
          <span class="option-item">Twin sharing ${checkBox(roomCategoryChecked(f.roomCategory, "twin sharing"))}</span>
          <span class="option-item">3 or more beds per room ${checkBox(roomCategoryChecked(f.roomCategory, "3 or more beds per room"))}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">c) Hospitalization due to:</span>
        <span class="option-group">
          <span class="option-item">Injury ${checkBox(hospitalizationCauseChecked(f.hospitalizationCause, "injury"))}</span>
          <span class="option-item">Illness ${checkBox(hospitalizationCauseChecked(f.hospitalizationCause, "illness"))}</span>
          <span class="option-item">Maternity ${checkBox(hospitalizationCauseChecked(f.hospitalizationCause, "maternity"))}</span>
        </span>
      </div>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell">
        <span class="form-line-label">d) Date of Injury / Date Disease first detected /Date of Delivery:</span>
        ${segmentedDateHtml(f.injuryDate)}
      </div>
    </div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell">
        <span class="form-line-label">e) Date of Admission:</span>
        ${segmentedDateHtml(f.admissionDate)}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">f) Time:</span>
        ${segmentedTimeHtml(f.admissionTime)}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">g) Date of Discharge:</span>
        ${segmentedDateHtml(f.dischargeDate)}
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">h) Time:</span>
        ${segmentedTimeHtml(f.dischargeTime)}
      </div>
    </div>
    <div class="form-line-row">
      <div class="form-line-cell form-line-cell-grow">
        <span class="form-line-label">i) If Injury give cause:</span>
        <span class="option-group">
          <span class="option-item">Self inflicted ${checkBox(!!f.injurySelf)}</span>
          <span class="option-item">Road Traffic Accident ${checkBox(!!f.injuryRta)}</span>
          <span class="option-item">Substance Abuse / Alcohol Consumption ${checkBox(!!f.injurySubstance)}</span>
        </span>
      </div>
    </div>
    <div class="form-line-row form-line-row-tight">
      <div class="form-line-cell">
        <span class="form-line-label">i. If Medico legal:</span>
        <span class="option-group">
          <span class="option-item">Yes ${checkBox(isYes(f.medicoLegal))}</span>
          <span class="option-item">No ${checkBox(isNo(f.medicoLegal))}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">ii. Reported to police:</span>
        <span class="option-group">
          <span class="option-item">Yes ${checkBox(!!f.reportedPolice)}</span>
          <span class="option-item">No ${checkBox(false)}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">iii. MLC Report &amp; Police FIR attached:</span>
        <span class="option-group">
          <span class="option-item">Yes ${checkBox(!!f.firYes)}</span>
          <span class="option-item">No ${checkBox(!!f.firNo)}</span>
        </span>
      </div>
      <div class="form-line-cell">
        <span class="form-line-label">j) System of Medicine:</span>
        ${lineFieldHtml(f.systemOfMedicine || f.treatingDoctor, "line-field-d-system")}
      </div>
    </div>
  </div>
  ${sectionBar("SECTION D")}
</div>

<!-- ══════════════════════ SECTION E: CLAIM DETAILS ══════════════════════ -->
<div class="section-wrap claim-section-wrap">
  <div class="claim-section-content">
    <div class="claim-section-inner">
      <div class="claim-main">
        <div class="detail-heading">DETAILS OF CLAIM:</div>
        <div class="claim-columns">
          <div class="claim-col">
            <div class="claim-subheading">a) Details of the treatment expenses claimed</div>
            <div class="claim-line">
              <span class="claim-line-label">i. Pre-hospitalization Expenses:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimPre, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">ii. Hospitalization Expenses:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimHospital, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">iii. Post-hospitalization Expenses:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimPost, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">iv. Health-Check up Cost:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimHealthCheckup, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">v. Ambulance Charges:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimAmbulance, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">vi. Others (code):</span>
              <span class="claim-code-boxes">${charBoxHtml(f.claimOtherCode, 3)}</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimOtherAmount, "claim-line-field")}</span>
            </div>
            <div class="claim-line claim-total-row">
              <span class="claim-line-label">Total</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimTotal, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">vii. Pre-hospitalization period:</span>
              <span class="claim-line-days">days</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimPreHospitalDays, "claim-line-field-sm")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">viii. Post-hospitalization period:</span>
              <span class="claim-line-days">days</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimPostHospitalDays, "claim-line-field-sm")}</span>
            </div>
          </div>
          <div class="claim-col">
            <div class="claim-line" style="margin-top:14px">
              <span class="claim-line-label">b) Claim for Domiciliary Hospitalization:</span>
              <span class="claim-check-inline">Yes ${checkBox(isYes(f.domiciliary))}</span>
              <span class="claim-check-inline">No ${checkBox(isNo(f.domiciliary))}</span>
              <span class="form-note-inline">(If yes, provide details in annexure)</span>
            </div>
            <div class="claim-subheading">c) Details of Lump sum / cash benefit claimed:</div>
            <div class="claim-line">
              <span class="claim-line-label">i. Hospital Daily Cash:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimHospitalDailyCash, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">ii. Surgical Cash:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimSurgicalCash, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">iii. Critical Illness Benefit:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimCriticalIllness, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">iv. Convalescence:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimConvalescence, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">v. Pre/Post hospitalization Lump sum benefit:</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimPrePostBenefit, "claim-line-field")}</span>
            </div>
            <div class="claim-line">
              <span class="claim-line-label">vi. Others:</span>
              <span class="claim-code-boxes">${charBoxHtml(f.claimOtherCode, 3)}</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimOtherBenefit, "claim-line-field")}</span>
            </div>
            <div class="claim-line claim-total-row">
              <span class="claim-line-label">Total</span>
              <span class="claim-line-rs">Rs.</span>
              <span class="claim-line-fill">${lineFieldHtml(f.claimTotal, "claim-line-field")}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="claim-checklist">
        <div class="claim-checklist-title">Claim Documents Submitted- Check List:</div>
        ${claimChecklistItems
          .map(
            (item, index) =>
              `<div class="claim-checklist-item">${checkBox(!!f.docChecklist?.[index])}<span>${item}</span></div>`,
          )
          .join("")}
      </div>
    </div>
  </div>
  ${sectionBar("SECTION E")}
</div>

<!-- ══════════════════════ SECTION F: BILLS ENCLOSED ══════════════════════ -->
<div class="section-wrap line-section-wrap">
  <div class="line-section-content">
    <div class="detail-heading">DETAILS OF BILLS ENCLOSED:</div>
    <table class="bills-table">
      <thead>
        <tr>
          <th class="bills-sl">Sl. No</th>
          <th class="bills-billno">Bill No</th>
          <th class="bills-date">Date</th>
          <th class="bills-issued">Issued by</th>
          <th class="bills-towards">Towards</th>
          <th class="bills-amount">Amount (Rs)</th>
        </tr>
      </thead>
      <tbody>
        ${billRows
          .map(
            (row, i) => `
          <tr>
            <td class="bills-sl">${i + 1}</td>
            <td class="bills-billno">${escHtml(row.billNo)}</td>
            <td class="bills-date">${placeholderBoxRowHtml(row.date, ["D", "D", "M", "M", "Y", "Y"])}</td>
            <td class="bills-issued">${escHtml(row.issuedBy)}</td>
            <td class="bills-towards">${escHtml(row.towards)}</td>
            <td class="bills-amount"><span class="bills-amount-boxes">${charBoxHtml(row.amount, 8)}</span></td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>
  ${sectionBar("SECTION F")}
</div>

<!-- ══════════════════════ SECTION G: BANK ACCOUNT ══════════════════════ -->
<div class="section-wrap bank-section-wrap">
  <div class="bank-section-content">
    <div class="detail-heading">DETAILS OF PRIMARY INSURED'S BANK ACCOUNT:</div>
    <div class="bank-row">
      <div class="bank-cell">
        <span class="bank-label">a) PAN:</span>
        <span class="bank-pan-boxes">${charBoxHtml(f.pan, 10)}</span>
      </div>
      <div class="bank-cell bank-cell-grow">
        <span class="bank-label bank-account-label">b) Bank Account Number</span>
        <span class="bank-account-boxes">${charBoxHtml(f.accountNumber, 20)}</span>
      </div>
    </div>
    <div class="bank-row">
      <div class="bank-cell bank-cell-grow">
        <span class="bank-label bank-name-label">c) Bank Name and Branch:</span>
        <span class="bank-name-boxes">${charBoxHtml(f.bankNameBranch, 34)}</span>
      </div>
    </div>
    <div class="bank-row">
      <div class="bank-cell bank-cell-grow">
        <span class="bank-label">d) Cheque/ DD Payable details:</span>
        ${lineFieldHtml(f.chequeDetails, "bank-cheque-field")}
      </div>
      <div class="bank-cell">
        <span class="bank-label bank-ifsc-label">e) IFSC Code:</span>
        <span class="bank-ifsc-boxes">${charBoxHtml(f.ifscCode, 11)}</span>
      </div>
    </div>
  </div>
  ${sectionBar("SECTION G")}
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
 * @returns {Promise<void>}
 */
export async function downloadInsuranceClaim(form, signatureDataUrl = null) {
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

  const html = generateInsuranceFormHTML(form, signatureDataUrl, logoDataUrl);

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
