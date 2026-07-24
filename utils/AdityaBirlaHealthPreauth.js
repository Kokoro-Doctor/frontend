import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { Asset } from "expo-asset";

/**
 * Loads the Aditya Birla pre-auth header images (banner + logo) from local
 * assets and returns base64 data URIs. Required because HTML strings
 * rendered by expo-print / html2pdf cannot resolve relative file paths —
 * images must be embedded inline.
 */
async function loadAssetAsBase64(moduleRequire) {
  const asset = Asset.fromModule(moduleRequire);
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
  return `data:image/png;base64,${base64}`;
}

export async function getLogoBase64() {
  try {
    return await loadAssetAsBase64(
      require("../assets/HospitalPortal/Images/Aditya-birla.png"),
    );
  } catch (e) {
    console.warn("Logo load error", e);
    return null;
  }
}

export async function getHeaderBannerBase64() {
  try {
    return await loadAssetAsBase64(
      require("../assets/HospitalPortal/Images/PreAuth_AdityaBIrla.png"),
    );
  } catch (e) {
    console.warn("Header banner load error", e);
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

// ─── Hardcoded Aditya Birla Health logo + header banner (base64 PNG) ───────
// Embedded so the HTML string works in expo-print / html2pdf without needing
// to resolve a file-system path at runtime. Replace these placeholder
// constants with the actual base64 data of:
//   - assets/HospitalPortal/Images/PreAuth_AdityaBIrla.png (left header banner)
//   - assets/HospitalPortal/Images/Aditya-birla.png        (right logo)
const ADITYA_BIRLA_HEADER_BANNER_DATA_URI =
  "data:image/png;base64,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";
const ADITYA_BIRLA_LOGO_DATA_URI =
  "data:image/png;base64,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iBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIbwS/v9UHc1gBfR0LAAAAABJRU5ErkJggg==";
// ────────────────────────────────────────────────────────────────────────────

/**
 * Build a styled A4 HTML string from the filled insurance form state.
 * @param {Object} form - the form state
 * @param {string | null} [signatureDataUrl] - optional PNG data URI from the e-sign capture
 * @param {string | null} [logoDataUrl] - optional PNG/JPEG data URI for the right-side
 *   Aditya Birla logo; falls back to the hardcoded ADITYA_BIRLA_LOGO_DATA_URI constant above.
 * @param {string | null} [headerBannerDataUrl] - optional PNG/JPEG data URI for the left-side
 *   header banner graphic; falls back to the hardcoded
 *   ADITYA_BIRLA_HEADER_BANNER_DATA_URI constant above.
 * @returns {string} HTML string
 */
export function generateInsuranceFormHTML(
  form,
  signatureDataUrl = null,
  logoDataUrl = null,
  headerBannerDataUrl = null,
) {
  const f = form || {};
  const signatureHtml = signatureBlockHtml(signatureDataUrl);
  const logoSrc = logoDataUrl || ADITYA_BIRLA_LOGO_DATA_URI;
  const headerBannerSrc =
    headerBannerDataUrl || ADITYA_BIRLA_HEADER_BANNER_DATA_URI;
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
  const chronicChecked = (key) => f.chronicIllnesses?.[key]?.present === true;
  const chronicMonth = (key) => f.chronicIllnesses?.[key]?.month ?? "  ";
  const chronicYear = (key) => f.chronicIllnesses?.[key]?.year ?? "  ";

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
    border: 1px solid #232323;
  }

  /* ── HEADER ── */
  .form-header {
    margin: -4mm -4mm 6px;
    background: #fff;
  }
  .header-top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 20mm;
    padding: 0 8mm;
    background: #fff;
    overflow: hidden;
  }
  .header-banner-image {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: auto;
    max-width: 78%;
    object-fit: fill;
    object-position: left top;
    display: block;
  }
  .header-logo-image {
    position: relative;
    width: 45mm;
    height: auto;
    object-fit: contain;
    display: block;
    flex-shrink: 0;
    z-index: 1;
  }
  .header-bottom {
    padding: 12px 14px 10px;
    border-top: 1px solid #d6d6d6;
  }
  .header-copy-title {
    font-size: 8.6px;
    font-weight: bold;
    color: #222;
    line-height: 1.3;
  }
  .header-copy-subtitle {
    margin-top: 1px;
    font-size: 8.6px;
    font-weight: bold;
    color: #222;
    line-height: 1.3;
  }
  .header-instructions {
    margin: 6px 0 0 16px;
    padding: 0;
    color: #8d8d8d;
    font-size: 6.4px;
    line-height: 1.45;
  }
  .header-instructions li {
    margin-bottom: 1px;
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
 /* SECTION A */

.tpa-section{
  margin-bottom:10px;
  font-family:Arial, Helvetica, sans-serif;
}

.tpa-header{
  font-size:9.5px;
  font-weight:700;
  padding:5px 0;
  color:#111;
}

.tpa-row{
  display:flex;
  align-items:center;
  padding:4px 0;
  gap:6px;
}

.tpa-label{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
  min-width:135px;
}

.tpa-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
}

.tpa-box-row .char-box{
  width:14px;
  height:16px;
  border:1px solid #999;
  margin-right:0;
  font-size:7.5px;
}

.tpa-box-row.long{
  flex:1;
}

.last{
  padding-bottom:6px;
}
  /* SECTION B */

.insured-section{
  margin-bottom:10px;
  font-family:Arial, Helvetica, sans-serif;
}

.insured-header{
  font-size:9.5px;
  font-weight:700;
  padding:5px 0;
  color:#111;
}

.insured-row{
  display:flex;
  align-items:center;
  padding:4px 0;
  gap:6px;
}

.patient-name-row{
  padding-bottom:1px;
}

.name-helper-row{
  display:flex;
  justify-content:space-between;
  padding:0 120px 2px 185px;
  font-size:9px;
  color:#b1b1b1;
}

.helper{
  white-space:nowrap;
}

.row-bcd{
  justify-content:space-between;
  align-items:center;
}

.inline-group{
  display:flex;
  align-items:center;
  gap:5px;
}

.dob-group{
  margin-right:8px;
}

.insured-label{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
  min-width:150px;
}
  .insured-inline-group{
  display:flex;
  align-items:center;
  gap:14px;
  flex-wrap:nowrap;
}
  .insured-check-item{
  display:flex;
  align-items:center;
  gap:3px;
  white-space:nowrap;
}

.insured-check-box{
  width:9px;
  height:9px;
  border:1px solid #666;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  flex-shrink:0;
}

.insured-check-text{
  font-size:8.5px;
  color:#222;
}

.insured-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
}

.insured-box-row .char-box{
  width:14px;
  height:16px;
  border:1px solid #999;
  margin-right:0;
  font-size:7.5px;
}

.insured-box-row.long{
  flex:1;
}

.insured-note{
  font-size:8px;
  color:#111;
  font-style:italic;
  padding-top:6px;
}

.colon,
.slash,
.dash{
  font-size:10px;
  color:#555;
}

.gender-box{
  width:22px;
  height:22px;
  border:1px solid #cfcfcf;
  display:inline-block;
}

.gender-text{
  font-size:10px;
  color:#555;
  margin-right:4px;
}

.mini-text{
  font-size:9px;
  color:#b1b1b1;
}

.insured-box-group{
  display:flex;
  align-items:center;
}

.insured-box-group .char-box{
  width:16px;
  height:22px;
  border:1px solid #c8c8c8;
  font-size:8px;
  margin-right:0;
}

.insured-box-group.small .char-box{
  width:16px;
}

.insured-box-group.dob .char-box{
  width:16px;
}

.insured-box-group.year .char-box{
  width:16px;
}

.patient-name-boxes{
  flex:1;
}

.phone-code{
  width:auto;
}

.phone-number{
  width:auto;
}

.full{
  flex:1;
}

.insured-sub-row{
  display:flex;
  align-items:center;
  gap:6px;
  padding:2px 8px 2px 28px;
}

.sub-prefix{
  width:18px;
  font-size:10px;
  color:#555;
}

.details-row{
  align-items:center;
}

.details-line{
  flex:1;
  border-bottom:1px solid #a9a9a9;
  margin-left:4px;
}

.insurance-row{
  padding-top:8px;
}

.last-row{
  padding-bottom:8px;
}
  /* SECTION C */

.treating-section{
  margin-bottom:10px;
  font-family:Arial, Helvetica, sans-serif;
}

.treating-header{
  font-size:9.5px;
  font-weight:700;
  padding:5px 0;
  color:#111;
}

.treating-row{
  display:flex;
  align-items:center;
  padding:4px 0;
  gap:6px;
}

.treating-label{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
  min-width:135px;
}

.treating-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
}

.treating-box-row .char-box{
  width:14px;
  height:16px;
  border:1px solid #999;
  margin-right:0;
  font-size:7.5px;
}

.treating-box-row.long{
  flex:1;
}

.treating-line {
  flex: 1;
  border-bottom: 1px solid #999;
  margin-left: 2px;
  padding-bottom: 1px;
  line-height: 1.2;
  min-height: 8px;
}

.treating-inline-group{
  display:flex;
  align-items:center;
  gap:14px;
  flex-wrap:wrap;
}

.treating-check-item{
  display:flex;
  align-items:center;
  gap:3px;
  white-space:nowrap;
}

.treating-check-box{
  width:9px;
  height:9px;
  border:1px solid #666;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:7px;
  flex-shrink:0;
}

.treating-check-text{
  font-size:8.5px;
  color:#222;
}

.treating-days-text{
  font-size:8.5px;
  color:#222;
  margin-left:2px;
}

.treating-dob-row{
  display:flex;
  align-items:center;
  gap:16px;
  flex-wrap:wrap;
}
  .opq-box-row{ display:flex; align-items:center; flex-wrap:nowrap; }
.opq-box-row .char-box{
  width:14px; height:16px; border:1px solid #999; margin-right:0; font-size:7.5px;
}
.opq-box-row.long{ flex:1; }
.opq-row{ display:flex; align-items:center; padding:4px 0; gap:6px; flex-wrap:wrap; }
.opq-label{ font-size:8.5px; color:#222; white-space:nowrap; min-width:150px; }
.opq-sub-label{ font-size:8.5px; color:#222; white-space:nowrap; margin-left:26px; }
.opq-check-item{ display:flex; align-items:center; gap:3px; white-space:nowrap; }
.opq-check-box{
  width:14px; height:16px; border:1px solid #999; display:inline-flex;
  align-items:center; justify-content:center; font-size:7.5px; flex-shrink:0;
}
  /* SECTION D */

.pd-section{ margin-top:10px; margin-bottom:10px; font-family:Arial, Helvetica, sans-serif; }
.pd-header{ font-size:9.5px; font-weight:700; padding:5px 0; color:#111; }
.pd-row{ display:flex; align-items:center; padding:4px 0; gap:6px; flex-wrap:wrap; }
.pd-label{ font-size:8.5px; color:#222; white-space:nowrap; }
.pd-box-row{ display:flex; align-items:center; flex-wrap:nowrap; }
.pd-box-row .char-box{ width:14px; height:16px; border:1px solid #999; margin-right:0; font-size:7.5px; }
.pd-check-item{ display:flex; align-items:center; gap:3px; white-space:nowrap; }
.pd-check-box{ width:14px; height:16px; border:1px solid #999; display:inline-flex; align-items:center; justify-content:center; font-size:7.5px; flex-shrink:0; }
.pd-rs{ font-size:8.5px; color:#222; white-space:nowrap; }
  /* SECTION E */

.chronic-section{ margin-top:10px; margin-bottom:10px; font-family:Arial, Helvetica, sans-serif; }
.chronic-header{ font-size:9.5px; font-weight:700; padding:5px 0; color:#111; }
.chronic-row{ display:flex; align-items:center; padding:3px 0; gap:6px; }
.chronic-checkbox{
  width:14px; height:16px; border:1px solid #999; display:inline-flex;
  align-items:center; justify-content:center; font-size:7.5px; flex-shrink:0;
}
.chronic-label{ font-size:8.5px; color:#222; white-space:nowrap; }
.chronic-my-box-row{ display:flex; align-items:center; flex-wrap:nowrap; margin-left:4px; }
.chronic-my-box-row .char-box{ width:14px; height:16px; border:1px solid #999; margin-right:0; font-size:7.5px; }
.chronic-other-line{ flex:1; border-bottom:1px solid #999; height:1px; min-height:1px; margin-left:4px; }
.decl-section{ margin-top:10px; margin-bottom:10px; font-family:Arial, Helvetica, sans-serif; }
.decl-header-row{ display:flex; justify-content:space-between; align-items:baseline; padding:5px 0 2px; }
.decl-title{ font-size:9.5px; font-weight:700; color:#111; }
.decl-note{ font-size:7px; font-weight:700; color:#333; }
.decl-intro{ font-size:8px; color:#222; padding:2px 0 6px; }
.decl-row{ display:flex; align-items:center; padding:4px 0; gap:6px; }
.decl-label{ font-size:8.5px; color:#222; white-space:nowrap; min-width:170px; }
.decl-box-row{ display:flex; align-items:center; flex-wrap:nowrap; flex:1; }
.decl-box-row .char-box{ width:14px; height:16px; border:1px solid #999; margin-right:0; font-size:7.5px; }
.decl-sign-row{ display:flex; justify-content:space-between; align-items:flex-start; margin-top:14px; gap:20px; }
.decl-sign-block{ display:flex; flex-direction:column; }
.decl-sign-box{ width:245px; height:60px; border:1px solid #cfcfcf; background:#fff; }
.decl-sign-label{ margin-top:6px; font-size:8px; color:#222; }
.decl-turnover{ font-size:8px; font-weight:700; color:#222; margin-top:10px; }
  /* SECTION F */

.patient-decl-section{
  margin-top:10px;
  margin-bottom:10px;
  font-family:Arial, Helvetica, sans-serif;
}

.patient-decl-title{
  font-size:9.5px;
  font-weight:700;
  padding:5px 0 8px;
  color:#111;
}

.patient-decl-item{
  display:flex;
  align-items:flex-start;
  gap:4px;
  padding:3px 0;
}

.patient-decl-num{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
  flex-shrink:0;
}

.patient-decl-text{
  font-size:8.5px;
  color:#222;
  line-height:1.35;
}

.patient-decl-row{
  display:flex;
  align-items:center;
  padding:6px 0 2px;
  gap:6px;
}

.patient-decl-label{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
}

.patient-decl-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
}

.patient-decl-box-row .char-box{
  width:14px;
  height:16px;
  border:1px solid #999;
  margin-right:0;
  font-size:7.5px;
}
  .patient-decl-section{
  margin-top:10px;
  margin-bottom:10px;
  font-family:Arial, Helvetica, sans-serif;
}
.patient-decl-title{
  font-size:9.5px;
  font-weight:700;
  padding:5px 0 8px;
  color:#111;
}
.patient-decl-item{
  display:flex;
  align-items:flex-start;
  gap:4px;
  padding:3px 0;
}
.patient-decl-num{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
  flex-shrink:0;
}
.patient-decl-text{
  font-size:8.5px;
  color:#222;
  line-height:1.35;
}
.patient-decl-row{
  display:flex;
  align-items:center;
  padding:6px 0 2px;
  gap:6px;
}
.patient-decl-label{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
}
.patient-decl-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
}
.patient-decl-box-row .char-box{
  width:14px;
  height:16px;
  border:1px solid #999;
  margin-right:0;
  font-size:7.5px;
}
  /* SECTION G */

.hospital-decl-section{
  margin-top:10px;
  margin-bottom:10px;
  font-family:Arial, Helvetica, sans-serif;
}

.hospital-decl-title{
  font-size:9.5px;
  font-weight:700;
  padding:5px 0 8px;
  color:#111;
}

.hospital-decl-item{
  display:flex;
  align-items:flex-start;
  gap:4px;
  padding:3px 0;
}

.hospital-decl-num{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
  flex-shrink:0;
}

.hospital-decl-text{
  font-size:8.5px;
  color:#222;
  line-height:1.35;
}

.hospital-decl-sign-row{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-top:14px;
  gap:20px;
}

.hospital-decl-sign-block{
  display:flex;
  flex-direction:column;
}

.hospital-decl-sign-box{
  width:245px;
  height:60px;
  border:1px solid #cfcfcf;
  background:#fff;
}

.hospital-decl-sign-label{
  margin-top:6px;
  font-size:8px;
  color:#222;
}
  /* SECTION H - Documents Checklist + Footer */

.docs-section{
  margin-top:10px;
  font-family:Arial, Helvetica, sans-serif;
}

.docs-title{
  font-size:9.5px;
  font-weight:700;
  padding:5px 0 8px;
  color:#111;
}

.docs-item{
  display:flex;
  align-items:flex-start;
  gap:4px;
  padding:3px 0;
}

.docs-num{
  font-size:8.5px;
  color:#222;
  white-space:nowrap;
  flex-shrink:0;
}

.docs-text{
  font-size:8.5px;
  color:#222;
  line-height:1.35;
}

.docs-spacer{
  height:110mm;
}

.docs-footer{
  border-top:1px solid #bcbcbc;
  padding-top:6px;
  font-family:Arial, Helvetica, sans-serif;
}

.docs-footer-company{
  font-size:8px;
  font-weight:700;
  color:#333;
  line-height:1.3;
}

.docs-footer-line{
  font-size:8px;
  color:#333;
  line-height:1.3;
}
  /* Prevent field rows / box-rows / sections from splitting across page breaks */
@media print {
  .tpa-row,
  .insured-row,
  .treating-row,
  .opq-row,
  .pd-row,
  .chronic-row,
  .decl-row,
  .patient-decl-row,
  .patient-decl-item,
  .hospital-decl-item,
  .docs-item,
  .char-row,
  .char-box,
  .placeholder-box-row,
  .segmented-date,
  .segmented-time,
  .signature-block-row,
  .decl-sign-row,
  .hospital-decl-sign-row,
  .bills-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

/* Also apply outside of @media print, since html2canvas/html2pdf on web
   doesn't always go through an actual print media query */
.tpa-row,
.insured-row,
.treating-row,
.opq-row,
.pd-row,
.chronic-row,
.decl-row,
.patient-decl-row,
.patient-decl-item,
.hospital-decl-item,
.docs-item,
.char-row,
.char-box,
.placeholder-box-row,
.segmented-date,
.segmented-time,
.signature-block-row,
.decl-sign-row,
.hospital-decl-sign-row {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
</head>
<body>
<div class="insurance-form-root">

<!-- ══════════════════════ HEADER ══════════════════════ -->
<div class="form-header">
  <div class="header-top">
    <img
      src="${headerBannerSrc}"
      alt="Aditya Birla Health Insurance"
      class="header-banner-image"
    />
    <img
      src="${logoSrc}"
      alt="Aditya Birla Health"
      class="header-logo-image"
    />
  </div>
  
</div>

<!-- SECTION A -->
<div class="tpa-section">

  <div class="tpa-header">
    DETAILS OF THE THIRD PARTY ADMINISTRATOR (To be filled in block letters)
  </div>

  <div class="tpa-row">
    <div class="tpa-label">a. Name of TPA/Insurance company:</div>
    <div class="tpa-box-row long">
      ${charBoxHtml(f.tpaName ?? "", 24)}
    </div>
  </div>

  <div class="tpa-row">
    <div class="tpa-label">b. Toll free phone number:</div>
    <div class="tpa-box-row long">
      ${charBoxHtml(f.tpaPhone ?? "", 16)}
    </div>
  </div>

  <div class="tpa-row last">
    <div class="tpa-label">c. Toll free FAX:</div>
    <div class="tpa-box-row long">
      ${charBoxHtml(f.tpaFax ?? "", 16)}
    </div>
  </div>

</div>

<!-- SECTION B -->
<div class="insured-section">

  <div class="insured-header">
    TO BE FILLED BY THE INSURED/PATIENT
  </div>

  <div class="insured-row">
    <div class="insured-label">a. Name of the Patient:</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.patientName ?? "", 30)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">b. Gender:</div>
    <div class="insured-inline-group">
      <span class="insured-check-item">
        <span class="insured-check-box">${f.gender === "male" ? "&#10003;" : ""}</span>
        <span class="insured-check-text">Male</span>
      </span>
      <span class="insured-check-item">
        <span class="insured-check-box">${f.gender === "female" ? "&#10003;" : ""}</span>
        <span class="insured-check-text">Female</span>
      </span>
      <span class="insured-check-text" style="margin-left:16px;">c. Age:</span>
      <div class="insured-box-row">
        ${charBoxHtml(f.ageYears ?? "", 2)}
      </div>
      <span class="insured-check-text">Years</span>
      <div class="insured-box-row">
        ${charBoxHtml(f.ageMonths ?? "", 2)}
      </div>
      <span class="insured-check-text">Months</span>
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">d. Date of birth:</div>
    <div class="insured-box-row">
      ${placeholderBoxRowHtml(f.dob ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">e. Contact number:</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.contactNumber ?? "", 16)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">f. Contact number of attending relative:</div>
    <div class="insured-box-row long">
      ${emptyBoxRowHtml(16)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">g. Insured card ID number:</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.insuredCardId ?? "", 26)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">h. Policy number/ Name of corporate:</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.policyNumber ?? "", 26)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">i. Employee ID:</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.employeeId ?? "", 30)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label" style="min-width:270px;">j. Currently do you have any other Mediclaim/Health insurance:</div>
    <div class="insured-inline-group">
      <span class="insured-check-item">
        <span class="insured-check-box">${f.otherInsurance === "yes" ? "&#10003;" : ""}</span>
        <span class="insured-check-text">Yes</span>
      </span>
      <span class="insured-check-item">
        <span class="insured-check-box">${f.otherInsurance === "no" ? "&#10003;" : ""}</span>
        <span class="insured-check-text">No</span>
      </span>
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">k. Company Name: Give details</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.otherInsuranceCompany ?? "", 28)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label" style="min-width:170px;">l. Do you have any family physician:</div>
    <div class="insured-inline-group">
      <span class="insured-check-item">
        <span class="insured-check-box">${f.hasFamilyPhysician === "yes" ? "&#10003;" : ""}</span>
        <span class="insured-check-text">Yes</span>
      </span>
      <span class="insured-check-item">
        <span class="insured-check-box">${f.hasFamilyPhysician === "no" ? "&#10003;" : ""}</span>
        <span class="insured-check-text">No</span>
      </span>
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">m. Name of the family physician:</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.familyPhysicianName ?? "", 26)}
    </div>
  </div>

  <div class="insured-row">
    <div class="insured-label">n. Contact number if any:</div>
    <div class="insured-box-row long">
      ${charBoxHtml(f.familyPhysicianContact ?? "", 16)}
    </div>
  </div>

  <div class="insured-note">
    (PLEASE COMPLETE DECLARATION ON THE REVERSE SIDE OF THIS FORM)
  </div>

</div>

<!-- SECTION C -->
<div class="treating-section">

  <div class="treating-header">
    TO BE FILLED BY THE TREATING DOCTOR/HOSPITAL
  </div>

  <div class="treating-row">
    <div class="treating-label">a. Name of the treating doctor:</div>
    <div class="treating-box-row long">
      ${charBoxHtml(f.treatingDoctorName ?? "", 30)}
    </div>
  </div>

  <div class="treating-row">
    <div class="treating-label">b. Contact number:</div>
    <div class="treating-box-row long">
      ${charBoxHtml(f.treatingDoctorContact ?? "", 16)}
    </div>
  </div>

  <div class="treating-row">
    <div class="treating-label">c. Nature of ILLNESS / Disease with presenting Complaints:</div>
    <div class="treating-line">${escHtml(f.natureOfIllness ?? "")}</div>
  </div>

  <div class="treating-row">
    <div class="treating-label">d. Relevant clinical findings:</div>
    <div class="treating-line">${escHtml(f.clinicalFindings ?? "")}</div>
  </div>

  <div class="treating-row">
    <div class="treating-label">e. Duration of the present ailment:</div>
    <div class="treating-box-row">
      ${charBoxHtml(f.durationDays ?? "", 2)}
    </div>
    <span class="treating-days-text">Days</span>
  </div>

  <div class="treating-row treating-dob-row">
    <div class="treating-label" style="min-width:150px;">Date of first consultation:</div>
    <div class="treating-box-row">
      ${placeholderBoxRowHtml(f.firstConsultationDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}
    </div>
    <span class="treating-label" style="min-width:170px;">Past history of present ailment if any:</span>
    <div class="treating-box-row long">
      ${emptyBoxRowHtml(14)}
    </div>
  </div>

  <div class="treating-row">
    <div class="treating-label">f. Provisional diagnosis:</div>
    <div class="treating-line">${escHtml(f.provisionalDiagnosis ?? "")}</div>
  </div>

  <div class="treating-row">
    <div class="treating-label">g. ICD 10 Code:</div>
    <div class="treating-box-row">
      ${charBoxHtml(f.icd10Code ?? "", 8)}
    </div>
  </div>

  <div class="treating-row">
    <div class="treating-label">h. Proposed line of treatment:</div>
    <div class="treating-inline-group">
      <span class="treating-check-item">
        <span class="treating-check-box">${f.proposedMedical ? "&#10003;" : ""}</span>
        <span class="treating-check-text">Medical Management</span>
      </span>
      <span class="treating-check-item">
        <span class="treating-check-box">${f.proposedSurgical ? "&#10003;" : ""}</span>
        <span class="treating-check-text">Surgical Management</span>
      </span>
      <span class="treating-check-item">
        <span class="treating-check-box">${f.proposedIntensiveCare ? "&#10003;" : ""}</span>
        <span class="treating-check-text">Intensive care</span>
      </span>
      <span class="treating-check-item">
        <span class="treating-check-box">${f.proposedInvestigation ? "&#10003;" : ""}</span>
        <span class="treating-check-text">Investigation</span>
      </span>
      <span class="treating-check-item">
        <span class="treating-check-box">${f.proposedNonAllopathic ? "&#10003;" : ""}</span>
        <span class="treating-check-text">Non allopathic treatment.</span>
      </span>
    </div>
  </div>

  <div class="treating-row">
    <div class="treating-label" style="min-width:280px;">I. If Investigation &/or Medical Management provide details:</div>
    <div class="treating-line">${escHtml(f.investigationDetails ?? "")}</div>
  </div>

  <div class="treating-row">
    <div class="treating-label">j. Route of drug administration:</div>
    <div class="treating-line">${escHtml(f.drugRoute ?? "")}</div>
  </div>

  <div class="treating-row">
    <div class="treating-label">k. If Surgical, name of surgery:</div>
    <div class="treating-line">${escHtml(f.surgeryName ?? "")}</div>
  </div>

  <div class="treating-row">
    <div class="treating-label">l. ICD 10 PCS Code:</div>
    <div class="treating-box-row">
      ${charBoxHtml(f.icd10PcsCode ?? "", 7)}
    </div>
  </div>

  <div class="treating-row">
    <div class="treating-label">m. If other treatments provide details:</div>
    <div class="treating-line">${escHtml(f.otherTreatmentDetails ?? "")}</div>
  </div>

  <div class="treating-row">
    <div class="treating-label">n. How did injury occur:</div>
    <div class="treating-line">${escHtml(f.injuryCause ?? "")}</div>
  </div>

</div>
<!-- o. Accident details -->
  <div class="opq-row">
    <div class="opq-label">o. In case of accident:</div>
    <span class="opq-sub-label" style="margin-left:0;">i. Is it RTA –</span>
    <span class="opq-check-item"><span class="opq-check-box">${f.accidentRTA === "yes" ? "&#10003;" : ""}</span><span class="treating-check-text">Yes</span></span>
    <span class="opq-check-item"><span class="opq-check-box">${f.accidentRTA === "no" ? "&#10003;" : ""}</span><span class="treating-check-text">No</span></span>
    <span class="opq-sub-label">ii. Date of injury:</span>
    <div class="opq-box-row">${placeholderBoxRowHtml(f.injuryDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
  </div>

  <div class="opq-row">
    <div class="opq-label" style="visibility:hidden;">o.</div>
    <span class="opq-sub-label" style="margin-left:0;">iii. Reported to Police:</span>
    <span class="opq-check-item"><span class="opq-check-box">${f.reportedToPolice === "yes" ? "&#10003;" : ""}</span><span class="treating-check-text">Yes</span></span>
    <span class="opq-check-item"><span class="opq-check-box">${f.reportedToPolice === "no" ? "&#10003;" : ""}</span><span class="treating-check-text">No</span></span>
    <span class="opq-sub-label">iv. FIR No:</span>
    <div class="opq-box-row long">${charBoxHtml(f.firNumber ?? "", 15)}</div>
  </div>

  <!-- p. Substance abuse -->
  <div class="opq-row">
    <div class="opq-label">p. Injury /Disease caused due to substance abuse/alcohol consumption:</div>
    <span class="opq-check-item"><span class="opq-check-box">${f.substanceAbuse === "yes" ? "&#10003;" : ""}</span><span class="treating-check-text">Yes</span></span>
    <span class="opq-check-item"><span class="opq-check-box">${f.substanceAbuse === "no" ? "&#10003;" : ""}</span><span class="treating-check-text">No</span></span>
  </div>

  <div class="opq-row">
    <div class="opq-label" style="visibility:hidden;">p.</div>
    <span class="opq-sub-label" style="margin-left:0;">Test conducted to establish this:</span>
    <span class="opq-check-item"><span class="opq-check-box">${f.testConducted === "yes" ? "&#10003;" : ""}</span><span class="treating-check-text">Yes</span></span>
    <span class="opq-check-item"><span class="opq-check-box">${f.testConducted === "no" ? "&#10003;" : ""}</span><span class="treating-check-text">No (if Yes attach reports)</span></span>
  </div>

  <!-- q. Maternity -->
  <div class="opq-row">
    <div class="opq-label">q. In case of Maternity :</div>
    <span class="opq-check-item"><span class="opq-check-box">${f.maternityG ? "&#10003;" : ""}</span><span class="treating-check-text">G</span></span>
    <span class="opq-check-item"><span class="opq-check-box">${f.maternityP ? "&#10003;" : ""}</span><span class="treating-check-text">P</span></span>
    <span class="opq-check-item"><span class="opq-check-box">${f.maternityL ? "&#10003;" : ""}</span><span class="treating-check-text">L</span></span>
    <span class="opq-check-item"><span class="opq-check-box">${f.maternityA ? "&#10003;" : ""}</span><span class="treating-check-text">A</span></span>
    <span class="opq-sub-label">Date of Delivery:</span>
    <div class="opq-box-row">${placeholderBoxRowHtml(f.deliveryDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
  </div>

<!-- SECTION D -->
<div class="pd-section">
  <div class="pd-header">Details of the patient admitted</div>

  <div class="pd-row">
    <span class="pd-label">a. Date of admission:</span>
    <div class="pd-box-row">${placeholderBoxRowHtml(f.admissionDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
    <span class="pd-label" style="margin-left:20px;">b. Time:</span>
    <div class="pd-box-row">${placeholderBoxRowHtml(f.admissionTimeHH ?? "", ["H", "H"])}</div>
    <span class="pd-label">:</span>
    <div class="pd-box-row">${placeholderBoxRowHtml(f.admissionTimeMM ?? "", ["M", "M"])}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">c. Is this an emergency /a planned hospitalization event?</span>
    <span class="pd-check-item"><span class="pd-check-box">${f.hospitalizationType === "emergency" ? "&#10003;" : ""}</span><span class="pd-label">Emergency</span></span>
    <span class="pd-check-item"><span class="pd-check-box">${f.hospitalizationType === "planned" ? "&#10003;" : ""}</span><span class="pd-label">Planned</span></span>
  </div>

  <div class="pd-row">
    <span class="pd-label">d. Expected no. of days stay in hospital:</span>
    <div class="pd-box-row">${charBoxHtml(f.expectedStayDays ?? "", 3)}</div>
    <span class="pd-label">Days.</span>
    <span class="pd-label" style="margin-left:20px;">e. Room Type: Rs.</span>
    <div class="pd-box-row long">${charBoxHtml(f.roomTypeCost ?? "", 12)}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">f. Per Day Room Rent + Nursing & Service Charges + Patient's Diet&nbsp;&nbsp;Rs.</span>
    <div class="pd-box-row long">${charBoxHtml(f.roomRentTotal ?? "", 12)}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">g. Expected cost of investigation + diagnostics: Rs.</span>
    <div class="pd-box-row long">${charBoxHtml(f.investigationCost ?? "", 8)}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">h. ICU Charges: Rs.</span>
    <div class="pd-box-row">${charBoxHtml(f.icuCharges ?? "", 6)}</div>
    <span class="pd-label" style="margin-left:20px;">i. OT Charges: Rs.</span>
    <div class="pd-box-row">${charBoxHtml(f.otCharges ?? "", 6)}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">j. Professional fees Surgeon+ Anaesthetist Fees + consultation Charges: Rs.</span>
    <div class="pd-box-row long">${charBoxHtml(f.professionalFees ?? "", 6)}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">k. Medicines+ Consumables+ Cost of Implants( if applicable specify) Other hospital expenses if any: Rs.</span>
    <div class="pd-box-row long">${charBoxHtml(f.medicinesCost ?? "", 8)}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">l. All inclusive package charges if any applicable: Rs.</span>
    <div class="pd-box-row long">${charBoxHtml(f.packageCharges ?? "", 8)}</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">m. Sum total expected cost of hospitalisation: Rs.</span>
    <div class="pd-box-row long">${charBoxHtml(f.totalExpectedCost ?? "", 8)}</div>
  </div>
</div>
<!-- SECTION E -->
<div class="chronic-section">
  <div class="chronic-header">Mandatory: Past History of any chronic illness If yes, since (month/year).</div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("diabetes") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Diabetes:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("diabetes"), 2)}${charBoxHtml(chronicYear("diabetes"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("heartDisease") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Heart Disease:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("heartDisease"), 2)}${charBoxHtml(chronicYear("heartDisease"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("hypertension") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Hypertension:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("hypertension"), 2)}${charBoxHtml(chronicYear("hypertension"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("hyperlipidemias") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Hyperlipidemias:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("hyperlipidemias"), 2)}${charBoxHtml(chronicYear("hyperlipidemias"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("osteoarthritis") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Osteoarthritis:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("osteoarthritis"), 2)}${charBoxHtml(chronicYear("osteoarthritis"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("asthma") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Asthma/COPD/Bronchitis:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("asthma"), 2)}${charBoxHtml(chronicYear("asthma"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("cancer") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Cancer:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("cancer"), 2)}${charBoxHtml(chronicYear("cancer"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("alcoholDrugAbuse") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Alcohol or drug abuse:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("alcoholDrugAbuse"), 2)}${charBoxHtml(chronicYear("alcoholDrugAbuse"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("hivStd") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Any HIV or STD/Related ailment:</span>
    <div class="chronic-my-box-row">${charBoxHtml(chronicMonth("hivStd"), 2)}${charBoxHtml(chronicYear("hivStd"), 2)}</div>
  </div>

  <div class="chronic-row">
    <span class="chronic-checkbox">${chronicChecked("other") ? "&#10003;" : ""}</span>
    <span class="chronic-label">Any other Ailment give details:</span>
    <div class="chronic-other-line">${escHtml(f.chronicOtherDetails ?? "")}</div>
  </div>
</div>

  <!-- DECLARATIONS -->
<div class="decl-section">
  <div class="decl-header-row">
    <div class="decl-title">DECLARATION</div>
    <div class="decl-note">(PLEASE READ VERY CAREFULLY)</div>
  </div>

  <div class="decl-intro">
    We confirm having read understood and agreed to the Declarations on the reverse of this form.
  </div>

  <div class="decl-row">
    <div class="decl-label">a. Name of the treating doctor:</div>
    <div class="decl-box-row">${charBoxHtml(f.declTreatingDoctorName ?? "", 30)}</div>
  </div>

  <div class="decl-row">
    <div class="decl-label">b. Qualification:</div>
    <div class="decl-box-row">${charBoxHtml(f.declQualification ?? "", 26)}</div>
  </div>

  <div class="decl-row">
    <div class="decl-label">c. Registration No. with State Code:</div>
    <div class="decl-box-row">${charBoxHtml(f.declRegistrationNo ?? "", 24)}</div>
  </div>

  <div class="decl-sign-row">
    <div class="decl-sign-block">
      <div class="decl-sign-box"></div>
      <div class="decl-sign-label">Hospital Seal (Must include Hospital ID).</div>
    </div>
    <div class="decl-sign-block">
      <div class="decl-sign-box"></div>
      <div class="decl-sign-label">Patient / Insured Name &amp; Signature</div>
    </div>
  </div>

  <div class="decl-turnover">(IMPORTANT PLEASE TURN OVER)</div>
</div>


       
<!-- SECTION F -->
<div class="patient-decl-section">
  <div class="patient-decl-title">DECLARATION BY THE PATIENT/REPRESENTATIVE:</div>

  <div class="patient-decl-item">
    <span class="patient-decl-num">1.</span>
    <span class="patient-decl-text">I agree to allow the hospital to submit all original documents pertaining to hospitalization to the Insurer / TPA after the discharge. I agree to sign on the Final Bill &amp; the Discharge Summary, before my discharge.</span>
  </div>
  <div class="patient-decl-item">
    <span class="patient-decl-num">2.</span>
    <span class="patient-decl-text">Payment to hospital is governed by the terms and conditions of the policy. In case the Insurer / TPA is not liable to settle the hospital bill, I undertake to settle the bill as per the terms and conditions of the policy.</span>
  </div>
  <div class="patient-decl-item">
    <span class="patient-decl-num">3.</span>
    <span class="patient-decl-text">All non-medical expenses and expenses not relevant to current hospitalization and the amounts over &amp; above the limit authorised by the Insurer / TPA not governed by the terms and conditions of the policy will be paid by me.</span>
  </div>
  <div class="patient-decl-item">
    <span class="patient-decl-num">4.</span>
    <span class="patient-decl-text">I hereby declare to abide by the terms and conditions of the policy and if at any time the facts disclosed by me are found to be false or incorrect, I forfeit my claim and agree to indemnify the Insurer / TPA.</span>
  </div>
  <div class="patient-decl-item">
    <span class="patient-decl-num">5.</span>
    <span class="patient-decl-text">I agree and understand that TPA is in no way warranting the service of the hospital &amp; that the Insurer / TPA is in no way guaranteeing that the services provided by the hospital will be of a particular quality or standard.</span>
  </div>
  <div class="patient-decl-item">
    <span class="patient-decl-num">6.</span>
    <span class="patient-decl-text">I hereby warrant the truth of the forgoing particulars in every respect and I agree that if I have made or shall make any false or untrue statement, suppression or concealment with respect to the claim, my right to claim reimbursement of the said expenses shall be absolutely forfeited.</span>
  </div>
  <div class="patient-decl-item">
    <span class="patient-decl-num">7.</span>
    <span class="patient-decl-text">I agree to indemnify the hospital against all expenses incurred on my behalf, which are not reimbursed by the Insurer / TPA.</span>
  </div>

  <div class="patient-decl-row">
    <span class="patient-decl-label">Patient's/Insured's Name:</span>
    <div class="patient-decl-box-row">${charBoxHtml(f.patientDeclName ?? f.patientName ?? "", 30)}</div>
  </div>

  <div class="decl-sign-box"></div>
  <div class="decl-sign-label">Patient's/Insured's Signature</div>

  <div class="patient-decl-row">
    <span class="patient-decl-label">Contact Number:</span>
    <div class="patient-decl-box-row">${charBoxHtml(f.patientDeclContact ?? f.contactNumber ?? "", 10)}</div>
  </div>
</div>
<!-- SECTION G -->
<div class="hospital-decl-section">
  <div class="hospital-decl-title">HOSPITAL DECLARATION</div>

  <div class="hospital-decl-item">
    <span class="hospital-decl-num">1.</span>
    <span class="hospital-decl-text">We have no objection to any authorized TPA / Insurance Company official verifying documents pertaining to hospitalization.</span>
  </div>
  <div class="hospital-decl-item">
    <span class="hospital-decl-num">2.</span>
    <span class="hospital-decl-text">All valid original documents duly countersigned by the insured / patient as per the checklist mentioned below will be sent to TPA / Insurance Company within 7 days of the patient's discharge.</span>
  </div>
  <div class="hospital-decl-item">
    <span class="hospital-decl-num">3.</span>
    <span class="hospital-decl-text">All nonmedical expenses OR expenses not relevant to hospitalization or illness OR expenses disallowed in the Authorisation Letter of the TPA / Insurance Co. OR arising out of incorrect information in the pre-authorisation form will be collected from the patient.</span>
  </div>
  <div class="hospital-decl-item">
    <span class="hospital-decl-num">4.</span>
    <span class="hospital-decl-text">We agree that TPA / Insurance Company will not be liable to make the payment in the event of any discrepancy between the facts in this form and discharge summary or other documents.</span>
  </div>
  <div class="hospital-decl-item">
    <span class="hospital-decl-num">5.</span>
    <span class="hospital-decl-text">The patient declaration has been signed by the patient or by his representative in our presence.</span>
  </div>
  <div class="hospital-decl-item">
    <span class="hospital-decl-num">6.</span>
    <span class="hospital-decl-text">We agree to provide clarifications for the queries raised regarding this hospitalization and we take the sole responsibility for any delay in offering clarifications.</span>
  </div>
  <div class="hospital-decl-item">
    <span class="hospital-decl-num">7.</span>
    <span class="hospital-decl-text">We will abide by the terms and conditions agreed in the MOU.</span>
  </div>

  <div class="hospital-decl-sign-row">
    <div class="hospital-decl-sign-block">
      <div class="hospital-decl-sign-box"></div>
      <div class="hospital-decl-sign-label">Hospital Seal:</div>
    </div>
    <div class="hospital-decl-sign-block">
      <div class="hospital-decl-sign-box"></div>
      <div class="hospital-decl-sign-label">Doctor's Signature:</div>
    </div>
  </div>
</div>
<!-- SECTION H -->
<div class="docs-section">
  <div class="docs-title">DOCUMENTS TO BE PROVIDED BY THE HOSPITAL IN SUPPORT OF THE CLAIM</div>

  <div class="docs-item">
    <span class="docs-num">1.</span>
    <span class="docs-text">Detailed Discharge Summary and all Bills from the hospital</span>
  </div>
  <div class="docs-item">
    <span class="docs-num">2.</span>
    <span class="docs-text">Cash Memos from the Hospitals / Chemists supported by proper prescription.</span>
  </div>
  <div class="docs-item">
    <span class="docs-num">3.</span>
    <span class="docs-text">Receipts and Pathological Test Reports from Pathologist, supported by note from the attending Medical Practitioner / Surgeon recommending such pathological Tests.</span>
  </div>
  <div class="docs-item">
    <span class="docs-num">4.</span>
    <span class="docs-text">Surgeon's Certificate stating nature of operation performed and Surgeon's Bill and Receipt.</span>
  </div>
  <div class="docs-item">
    <span class="docs-num">5.</span>
    <span class="docs-text">Certificates from attending Medical Practitioner / Surgeon that the patient is fully cured.</span>
  </div>

  <div class="docs-spacer"></div>

  <div class="docs-footer">
    <div class="docs-footer-company">Aditya Birla Health Insurance Co. Limited. IRDAI Reg.153. CIN No. U66000MH2015PLC263677.</div>
    <div class="docs-footer-line">Address:- 19th Floor, R-Tech Park, Nirlon Compound, Next to HUB Mall, Off Western Express Highway, Goregaon East, Mumbai – 400 063.</div>
    <div class="docs-footer-line">Telephone: +91 22 6225 7600, Fax: +91 22 6225 7700. For more details on risk factors, terms and conditions please read sales brochure carefully before concluding a sale. Aditya Birla Health Logo is owned by Aditya Birla Management Corporation Private Limited and used under license by us.</div>
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
  htmlOverride = null,
) {
  const patientName =
    String(form?.primaryName ?? "")
      .trim()
      .replace(/\s+/g, "_") || "Patient";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `InsuranceClaim_${patientName}_${date}.pdf`;

  let logoDataUrl = null;
  let headerBannerDataUrl = null;
  if (Platform.OS !== "web") {
    [logoDataUrl, headerBannerDataUrl] = await Promise.all([
      getLogoBase64().catch(() => null),
      getHeaderBannerBase64().catch(() => null),
    ]);
  }

  // Use the edited HTML if provided, otherwise regenerate fresh
  const html =
    htmlOverride ||
    generateInsuranceFormHTML(
      form,
      signatureDataUrl,
      logoDataUrl,
      headerBannerDataUrl,
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
