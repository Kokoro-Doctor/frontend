import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
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
  
  border-bottom: none;
  
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
  /* ───────────────── SECTION A EXACT UI ───────────────── */

.section-a-ui-wrap{
  border: none;
  padding: 0;
  margin-bottom: 4px;
  align-items: stretch;
}

.section-a-ui-content{
  flex: 1;
  min-width: 0;
  padding: 0;
}

.section-a-top-title{
  background: #1f1f1f;
  color: #fff;
  text-align: center;
  font-size: 7px;
  font-weight: bold;
  padding: 2px 0;
  letter-spacing: 0.2px;
}

.section-a-subtitle-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px 2px;
}

.section-a-subtitle{
  font-size: 7px;
  font-weight: bold;
  color: #333;
}

.section-a-subtitles{
  font-size: 7px;
  font-weight: bold;
  color: #333;
  margin-left: 320px;
}

.section-a-block{
  font-size: 6px;
  font-weight: bold;
  color: #333;
}

.section-a-main-heading{
  text-align: center;
  font-size: 6.2px;
  font-weight: bold;
  color: #333;
  margin: 5px 0 8px;
  font-weight: 600px;
}

.section-a-ui-row{
  display: flex;
  align-items: center;
  padding: 0 8px;
  margin-bottom: 10px;
}

.section-a-ui-row-top{
  align-items: flex-start;
}

.section-a-ui-label{
  width: 46mm;
  font-size: 6px;
  color: #333;
  line-height: 1.2;
  flex-shrink: 0;
}

.section-a-ui-line-wrap{
  flex: 1;
  min-width: 0;
}

.section-a-ui-line{
  width: 100%;
  border-bottom: 0.6px solid #6f6f6f;
  height: 10px;
}

.section-a-ui-line-text{
  width: 100%;
  min-height: 18px;
  border-bottom: 0.6px solid #6f6f6f;
  font-size: 6.3px;
  color: #333;
  padding: 2px 4px;
  line-height: 1.4;
  font-weight: bold;

  display: flex;
  align-items: flex-end;

  word-break: break-word;
  white-space: normal;
}

.section-a-sub-fields{
  margin-top: 6px;
}

.section-a-sub-row{
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.section-a-sub-label{
  width: 24mm;
  font-size: 5.8px;
  color: #333;
  flex-shrink: 0;
}

/* section bar exact match */
.section-bar{
  width: 13px;
  background: #222;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 1px;
}

.section-bar-text{
  transform: rotate(90deg);
  white-space: nowrap;
  font-size: 5.5px;
  font-weight: bold;
  letter-spacing: 0.4px;
}
  /* ───────────────── SECTION B EXACT UI ───────────────── */

.section-b-ui-wrap{
  border: none;
  padding: 0;
  margin-bottom: 5px;
}

.section-b-ui-content{
  width: 100%;
  padding: 2px 6px 0;
}

.section-b-title{
  text-align: center;
  font-size: 6px;
  font-weight: bold;
  color: #4a4a4a;
  margin-bottom: 12px;
  text-decoration: underline;
}

.section-b-row{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-b-left{
  width: 74mm;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.section-b-alpha{
  width: 10px;
  font-size: 6px;
  color: #333;
}

.section-b-label{
  font-size: 5.8px;
  color: #333;
  line-height: 1.2;
}

.section-b-right{
  flex: 1;
  min-width: 0;
}

.section-b-line{
  width: 100%;
  border-bottom: 0.6px solid #6d6d6d;
  height: 9px;
}

.section-b-small-line{
  width: 38mm;
  border-bottom: 0.6px solid #6d6d6d;
  height: 9px;
}

.section-b-inline-wrap{
  display: flex;
  align-items: flex-end;
  gap: 5px;
}

.section-b-inline-text{
  font-size: 5.5px;
  color: #444;
  white-space: nowrap;
}

.section-b-gender-options{
  display: flex;
  align-items: center;
  gap: 18px;
}

.section-b-option{
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 5.6px;
  color: #333;
}

.section-b-checkbox{
  width: 11px;
  height: 11px;
  border: 0.6px solid #777;
  display: inline-block;
  flex-shrink: 0;
}

.section-b-j-row{
  align-items: center;
}

.section-b-yesno{
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 5.8px;
  color: #333;
}

.section-b-no-gap{
  margin-left: 10px;
}

.section-b-subrow{
  display: flex;
  align-items: center;
  margin-left: 16mm;
  margin-bottom: 6px;
  gap: 8px;
}

.section-b-sub-label{
  width: 26mm;
  font-size: 5.5px;
  color: #333;
  flex-shrink: 0;
}

.section-b-last-row{
  margin-top: 4px;
}

.section-b-bottom-note{
  font-size: 5.5px;
  color: #555;
  white-space: nowrap;
  margin-left: 10px;
}
  /* ───────────────── SECTION C EXACT UI ───────────────── */

.section-c-ui-wrap{
  border: none;
  padding: 0;
  margin-bottom: 5px;
}

.section-c-ui-content{
  width: 100%;
  padding: 2px 6px 0;
}

.section-c-title{
  text-align: center;
  font-size: 6px;
  font-weight: bold;
  color: #444;
  margin-bottom: 14px;
  text-decoration: underline;
}

.section-c-row{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-c-top-align{
  align-items: flex-start;
}

.section-c-left{
  width: 78mm;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.section-c-alpha{
  width: 10px;
  font-size: 6px;
  color: #333;
  flex-shrink: 0;
}

.section-c-label{
  font-size: 5.8px;
  color: #333;
  line-height: 1.25;
}

.section-c-right{
  flex: 1;
  min-width: 0;
}

.section-c-line{
  width: 100%;
  border-bottom: 0.6px solid #6b6b6b;
  height: 9px;
}

.section-c-small-line{
  width: 38mm;
  border-bottom: 0.6px solid #6b6b6b;
  height: 9px;
}

.section-c-inline{
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.section-c-inline-text{
  font-size: 5.5px;
  color: #444;
  white-space: nowrap;
}

.section-c-subrow{
  display: flex;
  align-items: center;
  margin-left: 20mm;
  margin-bottom: 8px;
}

.section-c-sub-label{
  width: 58mm;
  font-size: 5.6px;
  color: #333;
  flex-shrink: 0;
}

.section-c-diagnosis-row{
  margin-top: 2px;
}

.section-c-icd-wrap{
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.section-c-icd-label{
  font-size: 5.6px;
  color: #333;
  white-space: nowrap;
}

.section-c-treatment-row{
  align-items: flex-start;
  margin-top: 6px;
}

.section-c-treatment-left{
  align-items: flex-start;
}

.section-c-treatment-options{
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 1px;
}

.section-c-treatment-item{
  display: flex;
  align-items: center;
  font-size: 5.8px;
  color: #333;
}

.section-c-treatment-index{
  width: 14px;
  flex-shrink: 0;
}

.section-c-treatment-text{
  width: 42mm;
}

.section-c-bracket{
  font-size: 6px;
  line-height: 1;
}

.section-c-bracket-space{
  width: 10px;
  display: inline-block;
}
  /* ───────────────── SECTION D EXACT UI ───────────────── */

.section-d-ui-wrap{
  border: none;
  padding: 0;
  margin-bottom: 5px;
}

.section-d-ui-content{
  width: 100%;
  padding: 2px 6px 0;
}

.section-d-row{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-d-top-align{
  align-items: flex-start;
}

.section-d-left{
  width: 78mm;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.section-d-alpha{
  width: 10px;
  font-size: 6px;
  color: #333;
  flex-shrink: 0;
}

.section-d-label{
  font-size: 5.8px;
  color: #333;
  line-height: 1.25;
}

.section-d-right{
  flex: 1;
  min-width: 0;
}

.section-d-line{
  width: 100%;
  border-bottom: 0.6px solid #6b6b6b;
  height: 9px;
}

.section-d-inline-text{
  font-size: 5.5px;
  color: #444;
  white-space: nowrap;
}

.section-d-subrow{
  display: flex;
  align-items: center;
  margin-left: 30mm;
  margin-bottom: 10px;
}

.section-d-subrow-tight{
  margin-top: -2px;
}

.section-d-sub-label{
  width: 55mm;
  font-size: 5.5px;
  color: #333;
  flex-shrink: 0;
}

.section-d-long-sub{
  width: 56mm;
}

.section-d-h-row{
  margin-bottom: 4px;
}

.section-d-accident-row{
  align-items: flex-start;
  margin-top: 2px;
}

.section-d-accident-content{
  flex: 1;
  padding-top: 1px;
}

.section-d-accident-item{
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 3px;
}

.section-d-accident-label{
  width: 60mm;
  font-size: 5.5px;
  color: #333;
  line-height: 1.35;
}

.section-d-yesno-wrap{
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 44mm;
}

.section-d-yn-text{
  font-size: 5.5px;
  color: #333;
  margin-right: 4px;
}

.section-d-no-space{
  margin-left: 10px;
}

.section-d-mini-box{
  width: 12px;
  height: 12px;
  border: 0.6px solid #777;
  display: inline-block;
  flex-shrink: 0;
}

.section-d-top-box-align{
  padding-top: 1px;
}

.section-d-maternity-row{
  align-items: flex-start;
  margin-top: 6px;
}

.section-d-maternity-content{
  flex: 1;
  padding-top: 1px;
}

.section-d-maternity-sub{
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.section-d-maternity-label{
  font-size: 5.5px;
  color: #333;
  white-space: nowrap;
}

.section-d-maternity-line{
  width: 34mm;
  border-bottom: 0.6px solid #6b6b6b;
  height: 9px;
}
  /* ───────────────── SECTION E EXACT UI ───────────────── */

.section-e-ui-wrap{
  border: none;
  padding: 0;
  margin-bottom: 5px;
}

.section-e-ui-content{
  width: 100%;
  padding: 2px 6px 0;
}

.section-e-title{
  text-align: center;
  font-size: 6px;
  font-weight: bold;
  color: #444;
  margin-bottom: 14px;
  text-decoration: underline;
}

.section-e-row{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-e-top-align{
  align-items: flex-start;
}

.section-e-left{
  width: 92mm;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.section-e-alpha{
  width: 10px;
  font-size: 6px;
  color: #333;
  flex-shrink: 0;
}

.section-e-label{
  font-size: 5.8px;
  color: #333;
  line-height: 1.25;
}

.section-e-right{
  flex: 1;
  min-width: 0;
}

.section-e-inline-wrap{
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.section-e-inline-text{
  font-size: 5.5px;
  color: #444;
  white-space: nowrap;
}

.section-e-small-line{
  width: 44mm;
  border-bottom: 0.6px solid #6d6d6d;
  height: 9px;
}

.section-e-emergency-row{
  margin-top: 2px;
}

.section-e-emergency-options{
  display: flex;
  align-items: center;
  gap: 22px;
}

.section-e-option{
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 5.7px;
  color: #333;
}

.section-e-checkbox{
  width: 12px;
  height: 12px;
  border: 0.6px solid #777;
  display: inline-block;
  flex-shrink: 0;
}

.section-e-history-row{
  align-items: flex-start;
  margin-top: 2px;
}

.section-e-history-content{
  flex: 1;
  padding-top: 1px;
}

.section-e-history-header{
  font-size: 5.6px;
  color: #444;
  margin-bottom: 4px;
}

.section-e-history-item{
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.section-e-history-label{
  width: 58mm;
  font-size: 5.5px;
  color: #333;
  flex-shrink: 0;
  line-height: 1.2;
}

.section-e-history-line{
  flex: 1;
  border-bottom: 0.6px solid #6b6b6b;
  height: 8px;
}

.section-e-bottom-row{
  margin-top: 8px;
}

.section-e-days-wrap{
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.section-e-bottom-line{
  width: 36mm;
  border-bottom: 0.6px solid #6b6b6b;
  height: 9px;
}

.section-e-days-text{
  font-size: 5.5px;
  color: #444;
  white-space: nowrap;
}
  /* ───────────────── SECTION F EXACT UI ───────────────── */

.section-f-ui-wrap{
  border: none;
  padding: 0;
  margin-bottom: 5px;
}

.section-f-ui-content{
  width: 100%;
  padding: 2px 6px 0;
}

.section-f-row{
  display: flex;
  align-items: center;
  margin-bottom: 11px;
}

.section-f-top-align{
  align-items: flex-start;
}

.section-f-left{
  width: 108mm;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.section-f-alpha{
  width: 10px;
  font-size: 6px;
  color: #333;
  flex-shrink: 0;
}

.section-f-label{
  font-size: 5.7px;
  color: #333;
  line-height: 1.25;
}

.section-f-right{
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.section-f-line{
  width: 100%;
  border-bottom: 0.6px solid #6c6c6c;
  height: 9px;
}

.section-f-last-row{
  margin-top: 3px;
}
  /* ───────────────── SECTION G EXACT UI ───────────────── */

.section-g-ui-wrap{
  border: none;
  padding: 0;
  margin-top: 2px;
  margin-bottom: 0;
}

.section-g-ui-content{
  width: 100%;
  padding: 2px 8px 0;
}

.section-g-title{
  text-align: center;
  font-size: 7px;
  font-weight: bold;
  color: #333;
  letter-spacing: 0.2px;
  margin-top: 2px;
}

.section-g-subtitle{
  text-align: center;
  font-size: 5.3px;
  color: #444;
  margin-top: 1px;
  margin-bottom: 14px;
}

.section-g-row{
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.section-g-left{
  width: 78mm;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.section-g-alpha{
  width: 10px;
  font-size: 6px;
  color: #333;
  flex-shrink: 0;
}

.section-g-label{
  flex: 1;
  font-size: 5.8px;
  color: #333;
  line-height: 1.2;
}

.section-g-colon{
  width: 8px;
  text-align: center;
  font-size: 6px;
  color: #333;
  flex-shrink: 0;
}

.section-g-right{
  flex: 1;
  min-width: 0;
}

.section-g-line{
  width: 100%;
  border-bottom: 0.6px solid #6a6a6a;
  height: 9px;
}

.section-g-last-input{
  margin-bottom: 22px;
}

.section-g-signature-row{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 2px;
  padding: 0 6mm;
}

.section-g-signature-block{
  width: 78mm;
  text-align: center;
}

.section-g-signature-box{
  width: 100%;
  height: 32mm;
  border: 0.6px solid #8a8a8a;
  margin-bottom: 4px;
}

.section-g-signature-caption{
  font-size: 5.8px;
  color: #333;
  line-height: 1.2;
}

.section-g-signature-subcaption{
  font-size: 5.4px;
  color: #444;
  margin-top: 1px;
}
  /* ───────────────── SECTION H EXACT UI ───────────────── */

.section-h-ui-wrap{
  border: none;
  padding: 0;
  margin-top: 2px;
  margin-bottom: 0;
}

.section-h-ui-content{
  width: 100%;
  padding: 2px 5px 0;
}

.section-h-title{
  text-align: center;
  font-size: 6.2px;
  font-weight: bold;
  color: #3b3b3b;
  margin-bottom: 10px;
  letter-spacing: 0.1px;
}

.section-h-point{
  display: flex;
  align-items: flex-start;
  margin-bottom: 6px;
}

.section-h-alpha{
  width: 10px;
  flex-shrink: 0;
  font-size: 5.7px;
  color: #333;
  line-height: 1.45;
}

.section-h-text{
  flex: 1;
  font-size: 5.55px;
  color: #333;
  line-height: 1.55;
  text-align: left;
}

.section-h-last{
  margin-bottom: 0;
}
  /* ───────────────── SECTION I EXACT UI ───────────────── */

.section-i-ui-wrap{
  border: none;
  padding: 0;
  margin-top: 4px;
  margin-bottom: 0;
}

.section-i-ui-content{
  width: 100%;
  padding: 2px 6px 0;
}

.section-i-title{
  text-align: center;
  font-size: 6.2px;
  font-weight: bold;
  color: #333;
  text-decoration: underline;
  margin-bottom: 14px;
}

.section-i-intro-row{
  display: flex;
  align-items: flex-end;
  margin-bottom: 12px;
}

.section-i-intro-text{
  font-size: 5.8px;
  color: #333;
  white-space: nowrap;
}

.section-i-inline-line{
  display: inline-block;
  border-bottom: 0.6px solid #6c6c6c;
  height: 9px;
}

.section-i-hospital-line{
  width: 84mm;
  margin: 0 5px 0 4px;
}

.section-i-from-line{
  width: 28mm;
  margin-left: 4px;
}

.section-i-para{
  font-size: 5.7px;
  color: #333;
  line-height: 1.6;
  text-align: left;
  margin-bottom: 18px;
}

.section-i-fields-wrap{
  padding-left: 2px;
}

.section-i-row{
  display: flex;
  align-items: center;
  margin-bottom: 11px;
}

.section-i-left{
  width: 66mm;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.section-i-alpha{
  width: 10px;
  font-size: 5.8px;
  color: #333;
  flex-shrink: 0;
}

.section-i-label{
  flex: 1;
  font-size: 5.7px;
  color: #333;
}

.section-i-colon{
  width: 8px;
  text-align: center;
  font-size: 5.8px;
  color: #333;
  flex-shrink: 0;
}

.section-i-right{
  flex: 1;
  min-width: 0;
}

.section-i-line{
  width: 100%;
  border-bottom: 0.6px solid #6b6b6b;
  height: 9px;
}

.section-i-last-main-row{
  margin-bottom: 18px;
}

.section-i-footer-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
}

.section-i-footer-field{
  display: flex;
  align-items: flex-end;
}

.section-i-footer-label{
  font-size: 5.8px;
  color: #333;
}

.section-i-footer-colon{
  margin: 0 4px;
  font-size: 5.8px;
  color: #333;
}

.section-i-footer-line{
  display: inline-block;
  border-bottom: 0.6px solid #6b6b6b;
  height: 9px;
}

.section-i-date-line{
  width: 42mm;
}

.section-i-time-line{
  width: 28mm;
}

.section-i-time-field{
  margin-right: 26mm;
}
  /* ───────────────── SECTION J EXACT UI ───────────────── */

.section-j-ui-wrap{
  border: none;
  padding: 0;
  margin-top: 3px;
  margin-bottom: 0;
}

.section-j-ui-content{
  width: 100%;
  padding: 2px 5px 0;
}

.section-j-title{
  text-align: center;
  font-size: 6.4px;
  font-weight: bold;
  color: #333;
  margin-bottom: 14px;
  letter-spacing: 0.15px;
}

.section-j-point{
  display: flex;
  align-items: flex-start;
  margin-bottom: 5px;
}

.section-j-alpha{
  width: 10px;
  flex-shrink: 0;
  font-size: 5.7px;
  color: #333;
  line-height: 1.55;
}

.section-j-text{
  flex: 1;
  font-size: 5.5px;
  color: #333;
  line-height: 1.65;
  text-align: left;
}

.section-j-last-point{
  margin-bottom: 34px;
}

.section-j-sign-row{
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
  padding: 0 8mm 0 6mm;
}

.section-j-sign-left,
.section-j-sign-right{
  font-size: 5.8px;
  color: #333;
}

.section-j-footer-row{
  display: flex;
  align-items: flex-end;
  gap: 26mm;
  padding-left: 6mm;
}

.section-j-footer-field{
  display: flex;
  align-items: flex-end;
}

.section-j-footer-label{
  font-size: 5.7px;
  color: #333;
}

.section-j-footer-colon{
  margin: 0 3px;
  font-size: 5.7px;
  color: #333;
}

.section-j-footer-line{
  display: inline-block;
  border-bottom: 0.6px solid #6b6b6b;
  height: 8px;
}

.section-j-date-line{
  width: 24mm;
}

.section-j-time-line{
  width: 18mm;
}
 .section-b-edit-line{
  width:100%;
  min-height:18px;
  border-bottom:0.6px solid #6f6f6f;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
  word-break:break-word;
  white-space:normal;
}

.section-b-small-edit-line{
  width:38mm;
  min-height:18px;
  border-bottom:0.6px solid #6f6f6f;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
  word-break:break-word;
  white-space:normal;
}

.section-c-edit-line{
  width:100%;
  min-height:18px;
  border-bottom:0.6px solid #6f6f6f;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
  word-break:break-word;
  white-space:normal;
}

.section-c-small-edit-line{
  width:38mm;
  min-height:18px;
  border-bottom:0.6px solid #6f6f6f;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
  word-break:break-word;
  white-space:normal;
}

.section-c-mini-edit{
  min-width:14px;
  min-height:12px;

  border-bottom:0.6px solid #6f6f6f;

  font-size:6px;
  color:#333;
  font-weight:bold;

  text-align:center;

  padding:0 2px;

  display:flex;
  align-items:center;
  justify-content:center;

  outline:none;
}
  .section-d-edit-line{
  width:100%;
  min-height:18px;
  border-bottom:0.6px solid #6b6b6b;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
  word-break:break-word;
  white-space:normal;
}
  .section-d-small-edit-line{
  width:34mm;
  min-height:18px;
  border-bottom:0.6px solid #6b6b6b;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
}
  .section-i-inline-wrap{
  display:flex;
  align-items:flex-end;
  gap:6px;
}

.section-i-inline-text{
  font-size:5.5px;
  color:#444;
  white-space:nowrap;
}

.section-i-small-edit-line{
  width:42mm;
  min-height:18px;
  border-bottom:0.6px solid #6b6b6b;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
}
  .section-e-history-edit{
  flex:1;
  min-height:18px;
  border-bottom:0.6px solid #6b6b6b;

  font-size:6px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;
}

.section-e-history-item{
  display:flex;
  align-items:flex-end;
  margin-bottom:4px;
  gap:6px;
}

.section-e-history-label{
  width:58mm;
  font-size:5.5px;
  color:#333;
  flex-shrink:0;
  line-height:1.2;
}
  .section-e-bottom-edit-line{
  width:36mm;
  min-height:18px;

  border-bottom:0.6px solid #6b6b6b;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}

.section-e-bottom-edit-line.full-width{
  width:100%;
}
  .section-f-edit-line{
  width:100%;
  min-height:18px;

  border-bottom:0.6px solid #6b6b6b;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}
  .section-g-edit-line{
  width:100%;
  min-height:18px;

  border-bottom:0.6px solid #6a6a6a;

  font-size:6.3px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}
  .section-i-edit-line{
  width:84mm;

  min-height:18px;

  border-bottom:0.6px solid #6c6c6c;

  font-size:6px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;

  margin:0 5px 0 4px;
}

.section-i-from-edit-line{
  width:28mm;

  min-height:18px;

  border-bottom:0.6px solid #6c6c6c;

  font-size:6px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;

  margin-left:4px;
}
  .section-i-edit-line{
  width:100%;

  min-height:18px;

  border-bottom:0.6px solid #6c6c6c;

  font-size:6px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}
  .section-i-footer-edit{
  border-bottom:0.6px solid #6b6b6b;

  min-height:16px;

  padding:2px 4px;

  font-size:5.8px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}

.section-i-date-edit{
  width:42mm;
}

.section-i-time-edit{
  width:28mm;
}
  .section-j-footer-edit{
  border-bottom:0.6px solid #6b6b6b;

  min-height:16px;

  padding:2px 4px;

  font-size:5.8px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}

.section-j-date-edit{
  width:42mm;
}

.section-j-time-edit{
  width:28mm;
}
  .section-d-h-left{
  width:78mm;
}

.section-d-edit-line{
  width:100%;

  min-height:18px;

  border-bottom:0.6px solid #6b6b6b;

  font-size:6px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}

.section-d-small-edit-line{
  width:58mm;

  min-height:18px;

  border-bottom:0.6px solid #6b6b6b;

  font-size:6px;
  color:#333;
  font-weight:bold;
  line-height:1.4;

  padding:2px 4px;

  display:flex;
  align-items:flex-end;

  outline:none;

  word-break:break-word;
  white-space:normal;
}

/* IMPORTANT FIX */
.section-d-subrow{
  align-items:flex-end;
}

.section-d-sub-label{
  width:auto;
  margin-right:10px;
}
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
      <div class="header-company-line">Phone : 044 - 2828 8800 CIN : L66010TN2005PLC056649</div>
      <div class="header-company-line header-company-line-compact">Email : support@starhealth.in Website : www.starhealth.in IRDAI Regn. No: 129</div>
    </div>
  </div>
  
</div>
<!-- ══════════════════════ SECTION A ══════════════════════ -->
<div class="section-wrap section-a-ui-wrap">
  <div class="section-a-ui-content">

    <div class="section-a-top-title">
      REQUEST FOR CASHLESS HOSPITALISATION FOR HEALTH INSURANCE
    </div>

    <div class="section-a-subtitle-row">
      <div class="section-a-subtitles">POLICY PART – C (Revised)</div>
      <div class="section-a-block">(TO BE FILLED IN BLOCK LETTERS)</div>
    </div>

    <div class="section-a-main-heading">
      DETAILS OF THE THIRD PARTY ADMINISTRATOR/INSURER/HOSPITAL:
    </div>

    <!-- row a -->
    <div class="section-a-ui-row">
      <div class="section-a-ui-label">
        a. Name of TPA/Insurance company :
      </div>

      <div class="section-a-ui-line-wrap">
        <div class="section-a-ui-line-text" contenteditable="true">
  STAR HEALTH AND ALLIED INSURANCE COMPANY LIMITED
</div>
      </div>
    </div>

    <!-- row b -->
    <div class="section-a-ui-row">
  <div class="section-a-ui-label">
    b. Toll free phone number:
  </div>

  <div class="section-a-ui-line-wrap">
    <div class="section-a-ui-line-text" contenteditable="true">
      ${f.tollFreePhone || ""}
    </div>
  </div>
</div>

<div class="section-a-ui-row">
  <div class="section-a-ui-label">
    c. Toll free fax:
  </div>

  <div class="section-a-ui-line-wrap">
    <div class="section-a-ui-line-text" contenteditable="true">
      ${f.tollFreeFax || ""}
    </div>
  </div>
</div>

<div class="section-a-ui-row section-a-ui-row-top">
  <div class="section-a-ui-label">
    d. Name of Hospital:
  </div>

  <div class="section-a-ui-line-wrap">

    <div class="section-a-ui-line-text" contenteditable="true">
      ${f.hospitalName || ""}
    </div>

    <div class="section-a-sub-fields">

      <div class="section-a-sub-row">
        <div class="section-a-sub-label">
          i.Address
        </div>

        <div class="section-a-ui-line-wrap">
          <div class="section-a-ui-line-text" contenteditable="true">
            ${f.hospitalAddress || ""}
          </div>
        </div>
      </div>

      <div class="section-a-sub-row">
        <div class="section-a-sub-label">
          ii.Rohini ID
        </div>

        <div class="section-a-ui-line-wrap">
          <div class="section-a-ui-line-text" contenteditable="true">
            ${f.rohiniId || ""}
          </div>
        </div>
      </div>

      <div class="section-a-sub-row">
        <div class="section-a-sub-label">
          iii.e-mail id
        </div>

        <div class="section-a-ui-line-wrap">
          <div class="section-a-ui-line-text" contenteditable="true">
            ${f.hospitalEmail || ""}
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

  </div>

  
</div>
<!-- ══════════════════════ SECTION B ══════════════════════ -->
<div class="section-wrap section-b-ui-wrap">

  <div class="section-b-ui-content">

    <div class="section-b-title">
      TO BE FILLED BY INSURED/PATIENT
    </div>

    <!-- A -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">A.</span>
        <span class="section-b-label">Name of the Patient :</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.patientName || ""}
        </div>
      </div>
    </div>

    <!-- B -->
    <div class="section-b-row section-b-gender-row">
      <div class="section-b-left">
        <span class="section-b-alpha">B.</span>
        <span class="section-b-label">Gender:</span>
      </div>

      <div class="section-b-right section-b-gender-options">

        <div class="section-b-option">
          <span class="section-b-checkbox"></span>
          <span contenteditable="true">Male</span>
        </div>

        <div class="section-b-option">
          <span class="section-b-checkbox"></span>
          <span contenteditable="true">Female</span>
        </div>

        <div class="section-b-option">
          <span class="section-b-checkbox"></span>
          <span contenteditable="true">Third Gender</span>
        </div>

      </div>
    </div>

    <!-- C -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">C.</span>
        <span class="section-b-label">Age:</span>
      </div>

      <div class="section-b-right section-b-inline-wrap">
        <div class="section-b-small-edit-line" contenteditable="true">
          ${f.patientAge || ""}
        </div>

        <span class="section-b-inline-text">(Years) / (Month)</span>
      </div>
    </div>

    <!-- D -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">D.</span>
        <span class="section-b-label">Date of Birth:</span>
      </div>

      <div class="section-b-right section-b-inline-wrap">
        <div class="section-b-small-edit-line" contenteditable="true">
          ${f.patientDob || ""}
        </div>

        <span class="section-b-inline-text">(DD/MM/YYYY)</span>
      </div>
    </div>

    <!-- E -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">E.</span>
        <span class="section-b-label">Contact number:</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.patientContact || ""}
        </div>
      </div>
    </div>

    <!-- F -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">F.</span>
        <span class="section-b-label">Contact number of attending Relative:</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.relativeContact || ""}
        </div>
      </div>
    </div>

    <!-- G -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">G.</span>
        <span class="section-b-label">Insured Card ID number:</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.insuredCardId || ""}
        </div>
      </div>
    </div>

    <!-- H -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">H.</span>
        <span class="section-b-label">Policy number/Name of Corporate:</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.policyNumber || ""}
        </div>
      </div>
    </div>

    <!-- I -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">I.</span>
        <span class="section-b-label">Employee ID :</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.employeeId || ""}
        </div>
      </div>
    </div>

    <!-- J -->
    <div class="section-b-row section-b-j-row">
      <div class="section-b-left">
        <span class="section-b-alpha">J.</span>
        <span class="section-b-label">
          Currently do you have any other mediclaim / health insurance:
        </span>
      </div>

      <div class="section-b-right section-b-yesno">
        <span>Yes</span>
        <span class="section-b-checkbox"></span>

        <span class="section-b-no-gap">No</span>
        <span class="section-b-checkbox"></span>
      </div>
    </div>

    <div class="section-b-subrow">
      <span class="section-b-sub-label">i.Company Name:</span>

      <div class="section-b-edit-line" contenteditable="true">
        ${f.companyName || ""}
      </div>
    </div>

    <div class="section-b-subrow">
      <span class="section-b-sub-label">ii.Give Details:</span>

      <div class="section-b-edit-line" contenteditable="true">
        ${f.insuranceDetails || ""}
      </div>
    </div>

    <!-- K -->
    <div class="section-b-row section-b-j-row">
      <div class="section-b-left">
        <span class="section-b-alpha">K.</span>
        <span class="section-b-label">
          Do you have a family Physician:
        </span>
      </div>

      <div class="section-b-right section-b-yesno">
        <span>Yes</span>
        <span class="section-b-checkbox"></span>

        <span class="section-b-no-gap">No</span>
        <span class="section-b-checkbox"></span>
      </div>
    </div>

    <!-- L -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">L.</span>
        <span class="section-b-label">Name of the family Physician:</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.familyPhysician || ""}
        </div>
      </div>
    </div>

    <!-- M -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">M.</span>
        <span class="section-b-label">Contact number, if any:</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.physicianContact || ""}
        </div>
      </div>
    </div>

    <!-- N -->
    <div class="section-b-row">
      <div class="section-b-left">
        <span class="section-b-alpha">N.</span>
        <span class="section-b-label">Current Address of Insured Patient:</span>
      </div>

      <div class="section-b-right">
        <div class="section-b-edit-line" contenteditable="true">
          ${f.currentAddress || ""}
        </div>
      </div>
    </div>

    <!-- O -->
    <div class="section-b-row section-b-last-row">
      <div class="section-b-left">
        <span class="section-b-alpha">O.</span>
        <span class="section-b-label">Occupation of Insured Patient:</span>
      </div>

      <div class="section-b-right section-b-inline-wrap">

        <div class="section-b-edit-line" contenteditable="true">
          ${f.occupation || ""}
        </div>

        <span class="section-b-bottom-note">
          (PLEASE COMPLETE DECLARATION OF THIS FORM)
        </span>
      </div>
    </div>

  </div>

</div>
<!-- ══════════════════════ SECTION C ══════════════════════ -->
<div class="section-wrap section-c-ui-wrap">

  <div class="section-c-ui-content">

    <div class="section-c-title">
      TO BE FILLED BY TREATING DOCTOR/HOSPITAL
    </div>

    <!-- A -->
    <div class="section-c-row">
      <div class="section-c-left">
        <span class="section-c-alpha">A.</span>

        <span class="section-c-label">
          Name of the treating Doctor:
        </span>
      </div>

      <div class="section-c-right">
        <div class="section-c-edit-line" contenteditable="true">
          ${f.treatingDoctor || ""}
        </div>
      </div>
    </div>

    <!-- B -->
    <div class="section-c-row">
      <div class="section-c-left">
        <span class="section-c-alpha">B.</span>

        <span class="section-c-label">
          Contact number:
        </span>
      </div>

      <div class="section-c-right">
        <div class="section-c-edit-line" contenteditable="true">
          ${f.doctorContact || ""}
        </div>
      </div>
    </div>

    <!-- C -->
    <div class="section-c-row section-c-top-align">
      <div class="section-c-left">
        <span class="section-c-alpha">C.</span>

        <span class="section-c-label">
          Nature of illness/Disease with presenting complaint :
        </span>
      </div>

      <div class="section-c-right">
        <div class="section-c-edit-line" contenteditable="true">
          ${f.natureOfIllness || ""}
        </div>
      </div>
    </div>

    <!-- D -->
    <div class="section-c-row">
      <div class="section-c-left">
        <span class="section-c-alpha">D.</span>

        <span class="section-c-label">
          Relevant Critical Findings:
        </span>
      </div>

      <div class="section-c-right">
        <div class="section-c-edit-line" contenteditable="true">
          ${f.criticalFindings || ""}
        </div>
      </div>
    </div>

    <!-- E -->
    <div class="section-c-row">
      <div class="section-c-left">
        <span class="section-c-alpha">E.</span>

        <span class="section-c-label">
          Duration of the present ailment
        </span>
      </div>

      <div class="section-c-right section-c-inline">

        <div class="section-c-small-edit-line" contenteditable="true">
          ${f.ailmentDuration || ""}
        </div>

        <span class="section-c-inline-text">
          Days
        </span>
      </div>
    </div>

    <!-- iv -->
    <div class="section-c-subrow">

      <div class="section-c-sub-label">
        iv.&nbsp;&nbsp;&nbsp;&nbsp;Date of First consultation
      </div>

      <div class="section-c-inline">

        <div class="section-c-small-edit-line" contenteditable="true">
          ${f.firstConsultationDate || ""}
        </div>

        <span class="section-c-inline-text">
          (DD/MM/YYYY)
        </span>
      </div>
    </div>

    <!-- v -->
    <div class="section-c-subrow">

      <div class="section-c-sub-label">
        v.&nbsp;&nbsp;&nbsp;&nbsp;Past history of present ailment, if an
      </div>

      <div class="section-c-right">

        <div class="section-c-edit-line" contenteditable="true">
          ${f.pastHistory || ""}
        </div>
      </div>
    </div>

    <!-- F -->
    <div class="section-c-row section-c-diagnosis-row">

      <div class="section-c-left">
        <span class="section-c-alpha">F.</span>

        <span class="section-c-label">
          Provisional diagnosis:
        </span>
      </div>

      <div class="section-c-right">

        <div class="section-c-icd-wrap">

          <span class="section-c-icd-label">
            ICD 10 code
          </span>

          <div class="section-c-edit-line" contenteditable="true">
            ${f.icd10Code || ""}
          </div>

        </div>
      </div>
    </div>

    <!-- G -->
    <div class="section-c-row section-c-treatment-row">

      <div class="section-c-left section-c-treatment-left">

        <span class="section-c-alpha">G.</span>

        <span class="section-c-label">
          Proposed line of treatment:
        </span>

      </div>

      <div class="section-c-treatment-options">

        <div class="section-c-treatment-item">
          <span class="section-c-treatment-index">I.</span>

          <span class="section-c-treatment-text">
            Medical Management
          </span>

          <span class="section-c-bracket">(</span>

          <div class="section-c-mini-edit" contenteditable="true">
            ${f.medicalManagement || ""}
          </div>

          <span class="section-c-bracket">)</span>
        </div>

        <div class="section-c-treatment-item">
          <span class="section-c-treatment-index">II.</span>

          <span class="section-c-treatment-text">
            Surgical Management
          </span>

          <span class="section-c-bracket">(</span>

          <div class="section-c-mini-edit" contenteditable="true">
            ${f.surgicalManagement || ""}
          </div>

          <span class="section-c-bracket">)</span>
        </div>

        <div class="section-c-treatment-item">
          <span class="section-c-treatment-index">III.</span>

          <span class="section-c-treatment-text">
            Intensive care
          </span>

          <span class="section-c-bracket">(</span>

          <div class="section-c-mini-edit" contenteditable="true">
            ${f.intensiveCare || ""}
          </div>

          <span class="section-c-bracket">)</span>
        </div>

        <div class="section-c-treatment-item">
          <span class="section-c-treatment-index">IV.</span>

          <span class="section-c-treatment-text">
            Investigation
          </span>

          <span class="section-c-bracket">(</span>

          <div class="section-c-mini-edit" contenteditable="true">
            ${f.investigation || ""}
          </div>

          <span class="section-c-bracket">)</span>
        </div>

        <div class="section-c-treatment-item">
          <span class="section-c-treatment-index">V.</span>

          <span class="section-c-treatment-text">
            Non-allopathic treatment
          </span>

          <span class="section-c-bracket">(</span>

          <div class="section-c-mini-edit" contenteditable="true">
            ${f.nonAllopathicTreatment || ""}
          </div>

          <span class="section-c-bracket">)</span>
        </div>

      </div>

    </div>

  </div>

</div>
<!-- ══════════════════════ SECTION D ══════════════════════ -->
<div class="section-wrap section-d-ui-wrap">

  <div class="section-d-ui-content">

    <!-- H -->
<div class="section-d-row section-d-h-row">

  <div class="section-d-left section-d-h-left">
    <span class="section-d-alpha">H.</span>

    <span class="section-d-label">
      If investigation and/or Medical Management, provide details:
    </span>
  </div>

  

</div>

<div class="section-d-subrow section-d-subrow-tight">

  <div class="section-d-sub-label section-d-long-sub">
    i.&nbsp;&nbsp;&nbsp;&nbsp;Route of Drug Administration
  </div>

  <div class="section-d-right">
    <div
      class="section-d-small-edit-line"
      contenteditable="true"
    >
      ${f.routeDrugAdministration || ""}
    </div>
  </div>

</div>

<!-- I -->
<div class="section-d-row section-d-h-row">

  <div class="section-d-left section-d-h-left">
    <span class="section-d-alpha">I.</span>

    <span class="section-d-label">
      If surgical, name of surgery:
    </span>
  </div>

  

</div>

<div class="section-d-subrow section-d-subrow-tight">

  <div class="section-d-sub-label section-d-long-sub">
    i.&nbsp;&nbsp;&nbsp;&nbsp;ICD 10 PCS code
  </div>

  <div class="section-d-right">
    <div
      class="section-d-small-edit-line"
      contenteditable="true"
    >
      ${f.icd10pcsCode || ""}
    </div>
  </div>

</div>

<!-- J -->
<div class="section-d-row">

  <div class="section-d-left">
    <span class="section-d-alpha">J.</span>

    <span class="section-d-label">
      If other treatment, provide details:
    </span>
  </div>

  <div class="section-d-right">
    <div class="section-d-edit-line" contenteditable="true">
      ${f.otherTreatmentDetails || ""}
    </div>
  </div>

</div>

<!-- K -->
<div class="section-d-row">

  <div class="section-d-left">
    <span class="section-d-alpha">K.</span>

    <span class="section-d-label">
      How did injury occur:
    </span>
  </div>

  <div class="section-d-right">
    <div class="section-d-edit-line" contenteditable="true">
      ${f.injuryOccur || ""}
    </div>
  </div>

</div>

    <!-- L -->
    <div class="section-d-row section-d-accident-row">
      <div class="section-d-left section-d-top-align">
        <span class="section-d-alpha">L.</span>

        <span class="section-d-label">
          In case of accident:
        </span>
      </div>

      <div class="section-d-accident-content">

        <div class="section-d-accident-item">
          <div class="section-d-accident-label">
            i.&nbsp;&nbsp;Is it RTA
          </div>

          <div class="section-d-yesno-wrap">
            <span class="section-d-yn-text">Yes</span>
            <span class="section-d-mini-box"></span>

            <span class="section-d-yn-text section-d-no-space">No</span>
            <span class="section-d-mini-box"></span>
          </div>
        </div>

        <div class="section-d-accident-item">
          <div class="section-d-accident-label">
            ii.&nbsp;&nbsp;Date of injury
          </div>

          <div class="section-d-yesno-wrap">
            <span class="section-d-yn-text">Yes</span>
            <span class="section-d-mini-box"></span>

            <span class="section-d-yn-text section-d-no-space">No</span>
            <span class="section-d-mini-box"></span>
          </div>
        </div>

        <div class="section-d-accident-item">
          <div class="section-d-accident-label">
            iii.&nbsp;&nbsp;Report to Police
          </div>

          <div class="section-d-yesno-wrap">
            <span class="section-d-yn-text">Yes</span>
            <span class="section-d-mini-box"></span>

            <span class="section-d-yn-text section-d-no-space">No</span>
            <span class="section-d-mini-box"></span>
          </div>
        </div>

        <div class="section-d-accident-item">
          <div class="section-d-accident-label">
            iv.&nbsp;&nbsp;FIR NO
          </div>

          <div class="section-d-yesno-wrap">
            <span class="section-d-yn-text">Yes</span>
            <span class="section-d-mini-box"></span>

            <span class="section-d-yn-text section-d-no-space">No</span>
            <span class="section-d-mini-box"></span>
          </div>
        </div>

        <div class="section-d-accident-item">
          <div class="section-d-accident-label">
            v.&nbsp;&nbsp;Injury/Disease caused due to substance<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;abuse/alcohol consumption
          </div>

          <div class="section-d-yesno-wrap section-d-top-box-align">
            <span class="section-d-yn-text">Yes</span>
            <span class="section-d-mini-box"></span>

            <span class="section-d-yn-text section-d-no-space">No</span>
            <span class="section-d-mini-box"></span>
          </div>
        </div>

        <div class="section-d-accident-item">
          <div class="section-d-accident-label">
            vii.Test conducted to establish this (if yes, attach report)
          </div>

          <div class="section-d-yesno-wrap">
            <span class="section-d-mini-box"></span>

            <span class="section-d-yn-text section-d-no-space">No</span>
            <span class="section-d-mini-box"></span>
          </div>
        </div>

      </div>
    </div>

    <!-- M -->
<div class="section-d-row section-d-maternity-row">

  <div class="section-d-left section-d-top-align">

    <span class="section-d-alpha">M.</span>

    <span class="section-d-label">
      In case of Maternity:
    </span>

  </div>

  <div class="section-d-maternity-content">

    <div class="section-d-maternity-sub">

      <span class="section-d-maternity-label">
        i.&nbsp;expected date of Delivery
      </span>

      <div class="section-d-small-edit-line" contenteditable="true">
        ${f.expectedDeliveryDate || ""}
      </div>

      <span class="section-d-inline-text">
        (DD/MM/YYYY)
      </span>

    </div>

  </div>

</div>

  </div>

</div>
<!-- ══════════════════════ SECTION E ══════════════════════ -->
<div class="section-wrap section-e-ui-wrap">

  <div class="section-e-ui-content">

    <div class="section-e-title">
      DETAILS OF PATIENT ADMITTED
    </div>

    <!-- A -->
    <!-- A -->
<div class="section-i-row">

  <div class="section-i-left">

    <span class="section-i-alpha">A.</span>

    <span class="section-i-label">
      Date of admission :
    </span>

  </div>

  <div class="section-i-right section-i-inline-wrap">

    <div class="section-i-small-edit-line" contenteditable="true">
      ${f.dateOfAdmission || ""}
    </div>

    <span class="section-i-inline-text">
      (DD/MM/YYYY)
    </span>

  </div>

</div>

<!-- B -->
<div class="section-i-row">

  <div class="section-i-left">

    <span class="section-i-alpha">B.</span>

    <span class="section-i-label">
      Time of admission:
    </span>

  </div>

  <div class="section-i-right section-i-inline-wrap">

    <div class="section-i-small-edit-line" contenteditable="true">
      ${f.timeOfAdmission || ""}
    </div>

    <span class="section-i-inline-text">
      (HH:MM)
    </span>

  </div>

</div>
    <!-- C -->
    <div class="section-e-row section-e-emergency-row">
      <div class="section-e-left">
        <span class="section-e-alpha">C.</span>

        <span class="section-e-label">
          Is this emergency/planned hospitalization event
        </span>
      </div>

      <div class="section-e-right section-e-emergency-options">

        <div class="section-e-option">
          <span>Emergency</span>
          <span class="section-e-checkbox"></span>
        </div>

        <div class="section-e-option">
          <span>Planned</span>
          <span class="section-e-checkbox"></span>
        </div>

      </div>
    </div>

    <!-- D -->
    <div class="section-e-row section-e-history-row">

      <div class="section-e-left section-e-top-align">
        <span class="section-e-alpha">D.</span>

        <span class="section-e-label">
          Mandatory Past History of any chronic illness
        </span>
      </div>

      <div class="section-e-history-content">

  <div class="section-e-history-header">
    if yes (Since month/year)
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">i.&nbsp;&nbsp;&nbsp;Diabetes</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.diabetesHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">ii.&nbsp;&nbsp;Heart disease</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.heartDiseaseHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">iii.&nbsp;Osteoarthritis</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.osteoarthritisHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">iv.&nbsp;&nbsp;Asthma/COPD/Bronchitis</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.asthmaHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">v.&nbsp;&nbsp;&nbsp;Cancer</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.cancerHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">vi.&nbsp;&nbsp;Alcohol/Drug abuse</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.alcoholHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">vii.&nbsp;Any HIV or STD Related ailment</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.hivHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">viii.&nbsp;Rheumatoid Arthritis</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.rheumatoidHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">ix.&nbsp;&nbsp;Cerebrovascular Accident(Stroke)</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.strokeHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">x.&nbsp;&nbsp;&nbsp;Liver disease</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.liverHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">xi.&nbsp;&nbsp;Kidney disease</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.kidneyHistory || ""}
    </div>
  </div>

  <div class="section-e-history-item">
    <div class="section-e-history-label">xii.&nbsp;Any other ailment,give details</div>
    <div class="section-e-history-edit" contenteditable="true">
      ${f.otherAilmentHistory || ""}
    </div>
  </div>

</div>
    </div>

    <!-- E -->
<div class="section-e-row section-e-bottom-row">

  <div class="section-e-left">

    <span class="section-e-alpha">E.</span>

    <span class="section-e-label">
      Expected number of Days/Stay in hospital :
    </span>

  </div>

  <div class="section-e-right section-e-days-wrap">

    <div class="section-e-bottom-edit-line" contenteditable="true">
      ${f.expectedHospitalStay || ""}
    </div>

    <span class="section-e-days-text">Days</span>

  </div>

</div>

<!-- F -->
<div class="section-e-row">

  <div class="section-e-left">

    <span class="section-e-alpha">F.</span>

    <span class="section-e-label">
      Level / Grade of Surgery:
    </span>

  </div>

  <div class="section-e-right">

    <div class="section-e-bottom-edit-line full-width" contenteditable="true">
      ${f.surgeryGrade || ""}
    </div>

  </div>

</div>

<!-- G -->
<div class="section-e-row">

  <div class="section-e-left">

    <span class="section-e-alpha">G.</span>

    <span class="section-e-label">
      Days in ICU:
    </span>

  </div>

  <div class="section-e-right section-e-days-wrap">

    <div class="section-e-bottom-edit-line" contenteditable="true">
      ${f.daysInICU || ""}
    </div>

    <span class="section-e-days-text">Days</span>

  </div>

</div>

  </div>

</div>
<!-- ══════════════════════ SECTION F ══════════════════════ -->
<div class="section-wrap section-f-ui-wrap">

  <div class="section-f-ui-content">

    <!-- H -->
    <!-- ══════════════════════ SECTION F ══════════════════════ -->
<div class="section-wrap section-f-ui-wrap">

  <div class="section-f-ui-content">

    <!-- H -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">H.</span>

        <span class="section-f-label">
          Room Type:
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.roomType || ""}
        </div>

      </div>

    </div>

    <!-- I -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">I.</span>

        <span class="section-f-label">
          Per day room rent + nursing and service charges +patients diet:
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.roomRentCharges || ""}
        </div>

      </div>

    </div>

    <!-- J -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">J.</span>

        <span class="section-f-label">
          Expected cost of investigation + diagnostic:
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.investigationDiagnosticCost || ""}
        </div>

      </div>

    </div>

    <!-- K -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">K.</span>

        <span class="section-f-label">
          ICU Charges:
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.icuCharges || ""}
        </div>

      </div>

    </div>

    <!-- L -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">L.</span>

        <span class="section-f-label">
          OT Charges
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.otCharges || ""}
        </div>

      </div>

    </div>

    <!-- M -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">M.</span>

        <span class="section-f-label">
          Professional fees Surgeon + Anesthetist fees + consultation Charges:
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.professionalFees || ""}
        </div>

      </div>

    </div>

    <!-- N -->
    <div class="section-f-row section-f-top-align">

      <div class="section-f-left section-f-top-align">

        <span class="section-f-alpha">N.</span>

        <span class="section-f-label">
          Medicines + Consumable + Cost of Implants (If applicable please specify):
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.medicinesConsumables || ""}
        </div>

      </div>

    </div>

    <!-- O -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">O.</span>

        <span class="section-f-label">
          Other hospital expenses if any:
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.otherHospitalExpenses || ""}
        </div>

      </div>

    </div>

    <!-- P -->
    <div class="section-f-row">

      <div class="section-f-left">

        <span class="section-f-alpha">P.</span>

        <span class="section-f-label">
          All-inclusive package charges if any applicable :
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.packageCharges || ""}
        </div>

      </div>

    </div>

    <!-- Q -->
    <div class="section-f-row section-f-last-row">

      <div class="section-f-left">

        <span class="section-f-alpha">Q.</span>

        <span class="section-f-label">
          Sum Total expected cost of hospitalization :
        </span>

      </div>

      <div class="section-f-right">

        <div class="section-f-edit-line" contenteditable="true">
          ${f.totalHospitalizationCost || ""}
        </div>

      </div>

    </div>

  </div>

</div>
  </div>

</div>
<!-- ══════════════════════ SECTION G ══════════════════════ -->
<div class="section-wrap section-g-ui-wrap">

  <div class="section-g-ui-content">

    <!-- heading -->
    <div class="section-g-title">
      DECLARATION
    </div>

    <div class="section-g-subtitle">
      (Please read very carefully)
    </div>

    <!-- A -->
    <!-- A -->
<div class="section-g-row">

  <div class="section-g-left">

    <span class="section-g-alpha">A.</span>

    <span class="section-g-label">
      Name of the treating doctor
    </span>

    <span class="section-g-colon">:</span>

  </div>

  <div class="section-g-right">

    <div class="section-g-edit-line" contenteditable="true">
      ${f.treatingDoctorName || ""}
    </div>

  </div>

</div>

<!-- B -->
<div class="section-g-row">

  <div class="section-g-left">

    <span class="section-g-alpha">B.</span>

    <span class="section-g-label">
      Qualification
    </span>

    <span class="section-g-colon">:</span>

  </div>

  <div class="section-g-right">

    <div class="section-g-edit-line" contenteditable="true">
      ${f.doctorQualification || ""}
    </div>

  </div>

</div>

<!-- C -->
<div class="section-g-row">

  <div class="section-g-left">

    <span class="section-g-alpha">C.</span>

    <span class="section-g-label">
      Registration number with state code
    </span>

    <span class="section-g-colon">:</span>

  </div>

  <div class="section-g-right">

    <div class="section-g-edit-line" contenteditable="true">
      ${f.registrationNumber || ""}
    </div>

  </div>

</div>

    <!-- signature boxes -->
    <div class="section-g-signature-row">

      <!-- left -->
      <div class="section-g-signature-block">

        <div class="section-g-signature-box"></div>

        <div class="section-g-signature-caption">
          Hospital Seal
        </div>

        <div class="section-g-signature-subcaption">
          (Must include Hospital Id)
        </div>

      </div>

      <!-- right -->
      <div class="section-g-signature-block">

        <div class="section-g-signature-box"></div>

        <div class="section-g-signature-caption">
          Patient/Insured Name and Sign
        </div>

      </div>

    </div>

  </div>

</div>
<!-- ══════════════════════ SECTION H ══════════════════════ -->
<div class="section-wrap section-h-ui-wrap">

  <div class="section-h-ui-content">

    <!-- heading -->
    <div class="section-h-title">
      DECLARATION BY THE PATIENT / REPRESENTATIVE
    </div>

    <!-- a -->
    <div class="section-h-point">
      <span class="section-h-alpha">a.</span>

      <div class="section-h-text">
        I agree to allow the hospital to submit all original documents
        pertaining to hospitalization to the Insurer/T.P.A after the discharge.
        I agree to sign on the Final Bill &amp; Discharge Summary, before my discharge.
      </div>
    </div>

    <!-- b -->
    <div class="section-h-point">
      <span class="section-h-alpha">b.</span>

      <div class="section-h-text">
        Payment to hospital is governed by the terms and conditions of the policy.
        In case the Insurer / TPA is not liable to settle the hospital bill,
        I undertake to settle the bill as per the terms and conditions of the policy.
      </div>
    </div>

    <!-- c -->
    <div class="section-h-point">
      <span class="section-h-alpha">c.</span>

      <div class="section-h-text">
        All non-medical expenses and expenses not relevant to current hospitalization
        and the amounts over &amp; above the limit authorized by the Insurer/T.P.A
        not governed by the terms and conditions of the policy will be paid by me.
      </div>
    </div>

    <!-- d -->
    <div class="section-h-point">
      <span class="section-h-alpha">d.</span>

      <div class="section-h-text">
        I hereby declare to abide by the terms and conditions of the policy and if at
        any time the facts disclosed by me are found to be false or incorrect or
        if I fail my claim and agree to indemnify the Insurer / T.P.A.
      </div>
    </div>

    <!-- e -->
    <div class="section-h-point">
      <span class="section-h-alpha">e.</span>

      <div class="section-h-text">
        I agree and understand that T.P.A is in no way warranting the service of the
        hospital &amp; that the Insurer / TPA is in no way guaranteeing that the
        services provided by the hospital will be of a particular quality or standard.
      </div>
    </div>

    <!-- f -->
    <div class="section-h-point">
      <span class="section-h-alpha">f.</span>

      <div class="section-h-text">
        I hereby warrant the truth of the forgoing particulars in every respect and
        I agree that if I have made or shall make any false or untrue statement,
        suppression or concealment with respect to the claim, my right to claim
        reimbursement of the said expenses shall be absolutely forfeited.
      </div>
    </div>

    <!-- g -->
    <div class="section-h-point">
      <span class="section-h-alpha">g.</span>

      <div class="section-h-text">
        I agree to indemnify the hospital against all expenses incurred on my behalf,
        which are not reimbursed by the Insurer / TPA.
      </div>
    </div>

    <!-- h -->
    <div class="section-h-point section-h-last">
      <span class="section-h-alpha">h.</span>

      <div class="section-h-text">
        "I/We authorize Insurance Company/TPA to contact me/us through
        mobile/email for any update on this claim".
      </div>
    </div>

  </div>

</div>
<!-- ══════════════════════ SECTION I ══════════════════════ -->
<div class="section-wrap section-i-ui-wrap">

  <div class="section-i-ui-content">

    <!-- heading -->
    <div class="section-i-title">
      Authorization to Star health and allied Insurance Co. Ltd
    </div>

    <!-- line 1 -->
    <div class="section-i-intro-row">

  <span class="section-i-intro-text">
    I am admitted in your Hospital
  </span>

  <div
    class="section-i-inline-line section-i-edit-line"
    contenteditable="true"
  >
    ${f.hospitalName || ""}
  </div>

  <span class="section-i-intro-text">
    from
  </span>

  <div
    class="section-i-inline-line section-i-from-edit-line"
    contenteditable="true"
  >
    ${f.admissionFrom || ""}
  </div>

</div>

    <!-- paragraph -->
    <div class="section-i-para">
      I hereby authorize Star health and allied Insurance Co. Ltd. and its representatives,
      who is my Health Insurer to seek any medical information / records from you or from
      the Medical Practitioners who have attended on me in connection with the above ailment
      and the treatment given. In case they seek any such information / records / indoor
      case papers, kindly oblige.
    </div>

    <!-- fields -->
    <div class="section-i-fields-wrap">

      <!-- a -->
      <div class="section-i-row">

  <div class="section-i-left">
    <span class="section-i-alpha">a)</span>

    <span class="section-i-label">
      Patient's / Insured's Name
    </span>

    <span class="section-i-colon">:</span>
  </div>

  <div class="section-i-right">
    <div
      class="section-i-edit-line"
      contenteditable="true"
    >
      ${f.patientInsuredName || ""}
    </div>
  </div>

</div>

<div class="section-i-row">

  <div class="section-i-left">
    <span class="section-i-alpha">b)</span>

    <span class="section-i-label">
      Contact number
    </span>

    <span class="section-i-colon">:</span>
  </div>

  <div class="section-i-right">
    <div
      class="section-i-edit-line"
      contenteditable="true"
    >
      ${f.patientContactNumber || ""}
    </div>
  </div>

</div>

<div class="section-i-row">

  <div class="section-i-left">
    <span class="section-i-alpha">c)</span>

    <span class="section-i-label">
      e-mail Id
    </span>

    <span class="section-i-colon">:</span>
  </div>

  <div class="section-i-right">
    <div
      class="section-i-edit-line"
      contenteditable="true"
    >
      ${f.patientEmail || ""}
    </div>
  </div>

</div>

<div class="section-i-row section-i-last-main-row">

  <div class="section-i-left">
    <span class="section-i-alpha">d)</span>

    <span class="section-i-label">
      Patient's / Insured's Signature
    </span>

    <span class="section-i-colon">:</span>
  </div>

  <div class="section-i-right">
    <div
      class="section-i-edit-line"
      contenteditable="true"
    >
      ${f.patientSignature || ""}
    </div>
  </div>

</div>

    </div>

    <!-- footer row -->
    <!-- footer row -->
<div class="section-i-footer-row">

  <div class="section-i-footer-field">

    <span class="section-i-footer-label">Date</span>

    <span class="section-i-footer-colon">:</span>

    <div
      class="section-i-footer-edit section-i-date-edit"
      contenteditable="true"
    >
      ${f.footerDate || ""}
    </div>

  </div>

  <div class="section-i-footer-field section-i-time-field">

    <span class="section-i-footer-label">Time</span>

    <span class="section-i-footer-colon">:</span>

    <div
      class="section-i-footer-edit section-i-time-edit"
      contenteditable="true"
    >
      ${f.footerTime || ""}
    </div>

  </div>

</div>

  </div>

</div>
<!-- ══════════════════════ SECTION J ══════════════════════ -->
<div class="section-wrap section-j-ui-wrap">

  <div class="section-j-ui-content">

    <!-- title -->
    <div class="section-j-title">
      HOSPITAL DECLARATION
    </div>

    <!-- points -->

    <div class="section-j-point">
      <div class="section-j-alpha">a.</div>

      <div class="section-j-text">
        We have no objection to any authorized TPA / Insurance Company official verifying
        documents pertaining to hospitalization.
      </div>
    </div>

    <div class="section-j-point">
      <div class="section-j-alpha">b.</div>

      <div class="section-j-text">
        All valid original documents duly countersigned by the insured / patient as per
        the checklist below will be sent to TPA / Insurance Company within 7 days of the
        patient's discharge.
      </div>
    </div>

    <div class="section-j-point">
      <div class="section-j-alpha">c.</div>

      <div class="section-j-text">
        We agree that TPA / Insurance Company will not be Liable to make the payment in
        the event of any discrepancy between the facts in this form and discharge summary
        or other documents.
      </div>
    </div>

    <div class="section-j-point">
      <div class="section-j-alpha">d.</div>

      <div class="section-j-text">
        The patient declaration has been signed by the patient or by his representative
        in our presence.
      </div>
    </div>

    <div class="section-j-point">
      <div class="section-j-alpha">e.</div>

      <div class="section-j-text">
        We agree to provide clarifications for the queries raised regarding this
        hospitalization and we take the sole responsibility for any delay in offering
        clarifications.
      </div>
    </div>

    <div class="section-j-point">
      <div class="section-j-alpha">f.</div>

      <div class="section-j-text">
        We will abide by the terms and conditions agreed in the MOU
      </div>
    </div>

    <div class="section-j-point">
      <div class="section-j-alpha">g.</div>

      <div class="section-j-text">
        We confirm that no additional amount would be collected from the insured in excess
        of Agreed Package Rates except costs towards non-admissible amounts (including
        additional charges due to opting higher room rent than eligibility) choosing
        separate line of treatment which is not envisaged/considered in package).
      </div>
    </div>

    <div class="section-j-point">
      <div class="section-j-alpha">h.</div>

      <div class="section-j-text">
        We confirm that no recoveries would be made from the deposit amount collected from
        the insured except for costs towards non-admissible amounts (including additional
        charges due to opting higher room rent than eligibility) choosing separate line
        of treatment which is not envisaged/considered in package).
      </div>
    </div>

    <div class="section-j-point section-j-last-point">
      <div class="section-j-alpha">i.</div>

      <div class="section-j-text">
        In the event of unauthorized recovery of any additional amount from the insured in
        excess of Agreed Package Rates, the authorized TPA / Insurance Company reserves the
        right to recover the same from us (the Network Provider) and/or take necessary
        action, as provided under the MOU or applicable laws.
      </div>
    </div>

    <!-- bottom signature labels -->

    <div class="section-j-sign-row">

      <div class="section-j-sign-left">
        Hospital Seal
      </div>

      <div class="section-j-sign-right">
        Doctor's Signature
      </div>

    </div>

    <!-- date time -->

    <div class="section-j-footer-row">

  <div class="section-j-footer-field">

    <span class="section-j-footer-label">Date</span>

    <span class="section-j-footer-colon">:</span>

    <div
      class="section-j-footer-edit section-j-date-edit"
      contenteditable="true"
    >
      ${f.sectionJDate || ""}
    </div>

  </div>

  <div class="section-j-footer-field">

    <span class="section-j-footer-label">Time</span>

    <span class="section-j-footer-colon">:</span>

    <div
      class="section-j-footer-edit section-j-time-edit"
      contenteditable="true"
    >
      ${f.sectionJTime || ""}
    </div>

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
 * @returns {Promise<void>}
 */

export async function downloadInsuranceClaim(
  form,
  signatureDataUrl = null,
  preRenderedHtml = null,
)

 {
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
  preRenderedHtml ||
  generateInsuranceFormHTML(
    form,
    signatureDataUrl,
    logoDataUrl,
  );

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
