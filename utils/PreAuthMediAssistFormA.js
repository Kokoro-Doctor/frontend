/**
 * Medi Assist – Reimbursement Claim Form A: HTML/CSS template and PDF download.
 * Screen + field mapping: MediAssistFormA.jsx (buildInitialForm, form state).
 * Add Form B as a parallel module (e.g. MediAssistFormB.js + MediAssistFormB.jsx) using the same pattern.
 */
import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

// Embedded from assets/HospitalPortal/Images/mediassist_new.png so the
// preview iframe and PDF export can render the logo without resolving a local path.
const MEDI_ASSIST_LOGO_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWoAAAB4CAMAAADsb0j1AAAA4VBMVEX////ZJCdXerzy9fpnh8PCz+Zcfr7g5vJYe7zZ4fDR2+2Fns77/P3ZIyaWq9XYHyKestjWFBfVDhHr7/eywuB2k8hlhcL2+PzWERRujMXaKSzUBQmgtNmMpNHj6fTYGx70wsP87e29y+X99fX30tPjX2LeQkXcMzXfSUvunJ375ubxrq/hUFLiV1mrvN17l8vqhojkamzf39/AwMBYWFhra2uZmZn2zM3ndXf0vb7sk5T53Nzoe33vo6XbMTTcOz7Z2dlLS0utra0uLi6Hh4d3d3e2traBgYE8PDzri43ytbajHxoEAAAMgElEQVR4nO2cCXuiyBaGcUEFEQVxAVziblxj9/S4x5m+3T03+f8/6FJ7ARqMoW+6J/XNPE+bEgp463DqnFOgJAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ/b+0394fBuPhaXQajgcPx7vOe5/Qv1OT6WrsJPw6DXbr9z6vf52eB0HMRIOjsO34pN2PL3BGtr0TsGPS9EXQQKMPBVv769Nfn2reh1rMHe8HUaCBhs8xH/YXVurPv798/uO79PU/8fa7e7yGtKfVJN4D/8r69ln642/tW6yoO6srQXs6fZxg5J/P0rcvf379HmOX/Ugvzcu5j/HQv7S+/5D++fO/P77E1+Md5zzaphGFuuA8xHfsX1qfP3n/f/30I7YO14x00RwNTmYx0rA/CuuYtWZJS9HcTKTOIZr1h7HrWDUZMc9gbmDT3Iw0a2f3zqf9O4qbEesnDTZto1EnnLv3Pe3fUHyUZ+L8pDeKnBoTiccPFF/HoikHzzj1cOvgCrNODN71xH87dZijThTcA2neuOfYFosF39/H9zzz3068+ygaU9J8FnXdKBo+x3ISLuR69Xly7cIdaT+Huj48rncjlzNsZ/WOp/67ae5D7exJ+yCM2hwDR94ZmIx1ge0gFKGtDyZDrQ1DEUjRwEWmITdjOmJmvFY+o+ZQ941CgHTCnOHv1vx3Bd6syzpSU6ZNShM3Kdeekurt0WzAWrwFPlrnN6uVXtdtSC14Xq2ozbSbD+DX3r+MWCxu8Re7kP8ouBuyly+V5PNzJYm1pE1N0tS99pwWYOtcCnxcgo+V85vJOdht8xVX65cK91df3qimN24+gF+7AE6TJNth/0FSdk9P/MxII3FP2QzmWk3hFs0mqJmhR8gCW6dhB3nwMX9+szzqNlN+3RUzXYO6a79hLP0aXnASOzfkPxIujTamBl+M4ta/KGp6BdTO40bdyuF+F6+9ZqJo1Cq4q0q39u/XOmS6dQjurtgOkfZCPbLbc5tD7WxYfww1AWDl3oJ66XdGvBakX/tWZxqJWqsk40N9H+JpONvOfue6Z2qoBfMO73Y0eZs/sWtlqAkf6qpvQt1SPJ2duLT06zsOqAY6V15YCo8V9ZnlRNecb1abefHMSoxJAjt/euP0aX8QdS7DXGitChx39VbUlyVT0pd8eQyKEfXkFKRZdE+7PXjQo79xQpZdrKMVxX7bHwnSZB6hTkMPiwIOeJM2KwHUimx11WzgZDSvVQahG4e6lvJ01u7gMZbongmYfUvtWpYlZ/2OpYxaOSvWQOcpulUKb0An9FQZnrfufXh7wBd01U7bPNB4YrIxgw67bTz1pM7duOD4bJ6WqBBqewH8sw4bGuBkrSWPWrMq2MdY/BUsUKiylKUuQ61X0+mqfubM0aQol8MTo5wnTswupc610khaSQPhuFxtVvEG6SYyAjmdhvtk7HQ1IiK8QtMASqPuq9TdG0En0jaH86dpv9d/GrlsHFgdBKKuyjadrQDkjMJbdXnJbv0lDdTKedpocagvTotwCL3YG45PmhuyUpKTTe6cRY5rJeD4abHL75aRg023TgdMD0GQU//323Y9YPaGu0LPkXUOdToOM7oDmhbL8L4Gl1kGf+drNjvdcpW/KBuzrrFJLplLM9SXgj00KeZJHMKyo0XSJzxjdP2tSTQCHGo1sIEaO+qN3xW7ocXCu4Lfrg2Dmf20QMZhRJ/iw6i7Sc+KQD4NJ6+GlKanqyGbtvUG8iIYo46uqFIqkYznZdQoU/R6bMGNqd2jP/NWt4ucVjIPDD4Ft16y1ormR43yrMrC6lrI+4MMLF7U/gDE3YS32PqcctHkn7RZF3F+7tCiNYpAyvCKQZZVQhfDUKPzL3lzU81iRpVFF9T1CNQW16CG7dUa+ZSkjgL8gX07HD4bdCOzXjTYWoXGzlArjD+alDMKmEdVOAJ5RVUjwqEr5Hsa0hye2+TIPaXArdFA9R1k16yQilC3pCoiAa0lU9MoahSpYnYl+hk5WItrfhk1Ml6IFAV9JCBrcKhTzYWsQKYLMvLgDJoNrzVg1bCTJfb4ui6rOORY8n2/TTPeYutb9sV+TwORA0vRUb2a0xrPmzSwRqizKHFREZIK9sQAdZZZMnbk0JvCASBZXyoTibqRo93AwD2ZwWbXQF6j6y/3oftnaQWKgAHUSdtS/EFdnCkMj5pVOO5Ww0fnRN4Q6NHqdLuOkE76z1tsx0c0DgHUCrq4BvmHoe7yXBBhlUyKtIKWj0KN7hJc8ENuHk+MNLGp6F0WbWP/lEtWml0ummeoyzQSzFtZLvCOETXnQIwidrj7gWHWjXbdNB9JwtLmffnz6tEw6okB+nLlnvHVCnJ+S4RBllIUNbS6TBOrit1GNsf5D7zRS6hV7G80IFTPwhOjxkWSyWWD0GbVgWSu0sj6ulHpIQlunUTRPwm1i8vOW4c6DMOdQ8PGaXjb8f7qrQy3XSh40Yo7BoWpieO5EMcfgXiood1VWxXkIRhqPRlSg1gdjdgiK3toKkzbSKgb7Bxaab7vDMaUqvhba0HUtTy/QbKZih31gRn1CLnhY52LpAsufH6pg56+AaHg/kQzl4IJJ8mpNzKnEGpoRxk9h+ztRdRNgppadRTqVi7cC60q1xo+2HnkfbWFr7VSC6D2DmrzG6TLcaPeMagopD4GcvF6G8yV98DQDc92O0O+zlR05974nMxgCgNQA1yISCOEOqOXOMmE3dUOJJCmINEJQEpZOseV3Cuprs7BXIRQS5qsc7avx42aJubYqKehcl7duPMOefJM3X2SpLl/FazgznrePgkWj1PUbEVA5VFDSungaaBpkV5SxLSo+eyPil+BTClWE3Pjdq4p3Sbe1wZ/h+rVWlYmu8GYPU7UfbKyiDz1OlTz8FiDoPloJoretHkfrPUVXC/8GxosyaSoKQ+QdzHUCn91NZoZLPkRKEcEe4iQ3cxjNZeMHqDcxb2iBMSuYcq4BKBCfLBqwqOuZUnEoqDusjGj7uFHUIttELz1Ruce0zMfO+BZSXcg7YvhkXDn3gAEiqgANZ30ASeGOgWDDuxXrWS1oi8AggZvl8ifX0adDxmjTVrKebvK7Bv26uWA5aadztFYchFGrel2OkMPAwPGXDlm1KQIgmr+q7NP6SXcmSY9ufXnoPvAdv00eWSPJzDUFka98KHGUBfgShWIHa6Ml6GzzlkgX8dx10XUZd6GOXpgAFGxI4OiERR26CTLyaHBQeEg7JJZNfIa2K3DoUZBO9zWLmvZm5eKmY7QgxRh7XR64UWBgudd9u2itK6HV3ZBWeTIZesMNU4b4JVwqHGysLSsRoa7Psy3okeXmyw6glRoWgV5J/oy05BVGYcU4FxwYlMCrUt2TwRqIN6weBt089wdhm7NtJ288CjKazSBqNuej5AmiUsPVBfNtTQcS+PzTwEbI64ExVDjuxpOLxxqfqEKmyIUn3pUqi+gxv36zaxJ8QejSeQ2Sv7wMIeOyvlqfA/SzXBGRGOdm1flOc2p/zjzjB5R/bF3/7A1zxk1GAmudpKlloQvGmJCHprkznzBWidFhxRj3YA2Vr2AWk6Gmgi0qhZi7XPQwaPy06LlG4w8Ts5pwh7HsyBwydz17PL53Bo5kXtYT1eXHm0fc91xqBETi6EmNd8yDXuXXBlYW6DLsruoSHUJNbq/A09KYVOH3an5DMGWZ/2rdMEruSQ7+4I9Ra+GNiBRDC0WvkmdR89/tPtejFG/QBKoYGyOiUtDwZewa1nF+w/ahKZks1m0aKp5bVmF1XxTsrXQF3Kg0FaWFyVLBSVrsCNahC2DHX2rtKCrbHAFGG5HN2zJVkNfWLJ/dbeldhegle2LjkOrSymwQcPyn1bNO6lSV43lZf4NeNOoJz1cdh9Abed0ibR4H+Za9aGrnrQjXjI697QTlHh78XodCvUH6fCyUb+g0Uf6dZA3auIYz73EJaONknOIPoIQ0a7df7rZqINLYEIvaj4d3WrUiW1090JM/dnN7kO8CPNK7S7kgZEaiznxtdpc+mG9CKPuR3ct5Jc2d24xbOGob9BkfANr8X75TerMXsva+UC/thevJhd/CPW8HoX3uF2HaL5MMzEjvkXh170uSqTjb9TdLBoy0Em46bfr/ppfRd2IxCUO7R8iZsfC4OP8HOrP1v4QepmR00oEHnGqM52fNW1ndi9+0iZ29e83gd9UGG4E55+lTn+72wwGs9nqsDtu+2IqFBISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhJ6P/0PEq/6/CaRrHAAAAAASUVORK5CYII=";

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
  return String(value ?? "").trim().toLowerCase() === "yes";
}

function isNo(value) {
  if (value === false) return true;
  return String(value ?? "").trim().toLowerCase() === "no";
}

/* ─────────────────────────────────────────────
   MAIN EXPORT: generateMediAssistFormAHTML
   Produces a pixel-accurate A4 HTML replica of
   the Medi Assist Reimbursement Claim Form.
───────────────────────────────────────────── */
export function generateMediAssistFormAHTML(form, signatureDataUrl = null) {
  const f = form ?? {};
  const patientName =
    f.patientName || f.hospitalizedName || f.primaryName || "";
  const contactNumber =
    f.contactNumber || f.hospPhone || f.primaryPhone || "";
  const insurerIdCardNo =
    f.insurerIdCardNo || f.certificateNumber || "";
  const policyNumberCorporate =
    f.policyNumberCorporate || f.policyNumber || "";
  const insurerName =
    f.insurerName || f.tpaId || "";
  const hospitalLocation =
    f.hospitalLocation ||
    [f.hospCity, f.hospState].filter(Boolean).join(", ");
  const hospitalEmail = f.hospitalEmail || f.hospEmail || "";
  const treatingDoctorName = f.treatingDoctorName || f.treatingDoctor || "";
  const treatingDoctorContact = f.treatingDoctorContact || "";
  const firstConsultationDate =
    f.firstConsultationDate || "";
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

    <!-- Row 1 -->
    <div class="hospital-row">
      <span class="hospital-label">Name of the hospital:</span>

      <span class="cb-row">
        ${boxes(f.hospitalName, 40)}
      </span>
    </div>

    <!-- Row 2 -->
    <div class="hospital-row">

      <span class="hospital-label">Hospital location:</span>

      <span class="cb-row">
        ${boxes(hospitalLocation, 26)}
      </span>

      <div class="hospital-right-group">
        <span class="hospital-right-label">Hospital ID:</span>

        <span class="cb-row">
          ${boxes(f.hospitalId, 12)}
        </span>
      </div>

    </div>

    <!-- Row 3 -->
    <div class="hospital-row">

      <span class="hospital-label">Hospital email ID:</span>

      <span class="cb-row">
        ${boxes(hospitalEmail, 24)}
      </span>

      <div class="hospital-right-group">
        <span class="hospital-right-label">ROHINI ID:</span>

        <span class="cb-row">
          ${boxes(f.rohiniId, 12)}
        </span>
      </div>

    </div>

  </div>

  <!-- TPA Section -->
  <div class="tpa-header">
    DETAILS OF THIRD PARTY ADMINISTRATOR
  </div>

  <div class="tpa-row">

    <div class="tpa-item">
  <span class="lbl" style="font-size:8px;">
    a) Name of TPA company:
  </span>

  <span class="txt" style="font-size:8px;margin-left:4px;font-weight:600;">
    Medi Assist Insurance TPA Pvt Ltd
  </span>
</div>

<div class="tpa-item">
  <span class="lbl" style="font-size:8px;">
    b) Phone no.:
  </span>

  <span class="txt" style="font-size:8px;margin-left:4px;font-weight:600;">
    080 22068666
  </span>
</div>

<div class="tpa-item">
  <span class="lbl" style="font-size:8px;">
    c) Toll Free Fax no.:
  </span>

  <span class="txt" style="font-size:8px;margin-left:4px;font-weight:600;">
    1800 425 9559
  </span>
</div>

  </div>

</div>

<!-- ══════════ SECTION A: PATIENT DETAILS ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">

    <div style="display:flex;align-items:center;margin-bottom:10px;">
      <div style="flex:1;height:6px;background:#000;"></div>

      <div
        style="
          padding:0 18px;
          font-size:8px;
          font-weight:700;
          text-transform:uppercase;
          white-space:nowrap;
        "
      >
        TO BE FILLED BY INSURED/PATIENT
      </div>

      <div style="flex:1;height:6px;background:#000;"></div>
    </div>

    <!-- a -->
    <div class="row" style="margin-bottom:5px;">
      <span class="lbl" style="font-size:8px;">a) Name of the patient:</span>

      <span class="cb-row" style="margin-left:8px;">
        ${boxes(patientName, 38)}
      </span>
    </div>

    <!-- b c d -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:5px;
      "
    >

      <div class="row" style="gap:5px;">
        <span class="lbl" style="font-size:8px;">b) Gender:</span>

        ${chk(f.gender === "male")}
        <span class="txt" style="font-size:8px;">Male</span>

        ${chk(f.gender === "female")}
        <span class="txt" style="font-size:8px;">Female</span>

        ${chk(f.gender === "third")}
        <span class="txt" style="font-size:8px;">Third gender</span>
      </div>

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">c) Contact no.:</span>

        <span class="cb-row">
          ${boxes(contactNumber, 10)}
        </span>
      </div>

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">d) Alternate contact no.:</span>

        <span class="cb-row">
          ${boxes(f.altContactNumber, 10)}
        </span>
      </div>

    </div>

    <!-- e f g -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:5px;
      "
    >

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">e) Age:</span>

        <span class="txt" style="font-size:8px;">Years</span>
        <span class="cb-row">${boxes(f.ageYears, 2)}</span>

        <span class="txt" style="font-size:8px;">Months</span>
        <span class="cb-row">${boxes(f.ageMonths, 2)}</span>
      </div>

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">f) Date of birth:</span>

        <span class="cb-row">
          ${boxes(f.dob, 8)}
        </span>
      </div>

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">g) Insurer ID card no.:</span>

        <span class="cb-row">
          ${boxes(insurerIdCardNo, 18)}
        </span>
      </div>

    </div>

    <!-- h i -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:5px;
      "
    >

      <div class="row" style="gap:4px;flex:1;">
        <span class="lbl" style="font-size:8px;">
          h) Policy number/Name of corporate:
        </span>

        <span class="cb-row">
          ${boxes(policyNumberCorporate, 24)}
        </span>
      </div>

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">i) Employee ID:</span>

        <span class="cb-row">
          ${boxes(f.employeeId, 10)}
        </span>
      </div>

    </div>

    <!-- j -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:5px;
      "
    >

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          j) Currently do you have any other medical claim/health Insurance:
        </span>

        ${chk(isYes(f.otherInsurance))}
        <span class="txt" style="font-size:8px;">Yes</span>

        ${chk(isNo(f.otherInsurance))}
        <span class="txt" style="font-size:8px;">No</span>
      </div>

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">j.1) Insurer name:</span>

        <span class="cb-row">
          ${boxes(insurerName, 18)}
        </span>
      </div>

    </div>

    <!-- j2 -->
    <div
      class="row"
      style="
        align-items:flex-start;
        margin-bottom:5px;
      "
    >

      <span class="lbl" style="font-size:8px;">
        j.2) Give details:
      </span>

      <div
        style="
          flex:1;
          height:35px;
          border:1px solid #666;
          margin-left:6px;
        "
      ></div>

    </div>

    <!-- k -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:5px;
      "
    >

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          k) Do you have a family physician, if yes: Name:
        </span>

        <span class="cb-row">
          ${boxes(f.familyPhysicianName, 20)}
        </span>
      </div>

      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">k.1) Contact no.:</span>

        <span class="cb-row">
          ${boxes(f.familyPhysicianContact, 10)}
        </span>
      </div>

    </div>

    <!-- l -->
    <div class="row" style="margin-bottom:5px;">
      <span class="lbl" style="font-size:8px;">
        L) Occupation of insured patient:
      </span>

      <span class="cb-row" style="margin-left:6px;">
        ${boxes(f.occupation, 18)}
      </span>
    </div>

    <!-- m -->
    <div
      class="row"
      style="
        align-items:flex-start;
      "
    >

      <span class="lbl" style="font-size:8px;">
        m) Address of insured patient:
      </span>

      <div
        style="
          flex:1;
          height:40px;
          border:1px solid #666;
          margin-left:6px;
        "
      ></div>

    </div>

  </div>

  
</div>

<!-- ══════════ SECTION B ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">

    <!-- TOP TITLE -->
    <div style="display:flex;align-items:center;margin-bottom:10px;">
      <div style="flex:1;height:6px;background:#000;"></div>

      <div
        style="
          padding:0 18px;
          font-size:8px;
          font-weight:700;
          text-transform:uppercase;
          white-space:nowrap;
        "
      >
        TO BE FILLED BY THE TREATING DOCTOR/HOSPITAL
      </div>

      <div style="flex:1;height:6px;background:#000;"></div>
    </div>

    <!-- a + b -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:8px;
      "
    >

      <div class="row" style="gap:5px;flex:1;">
        <span class="lbl" style="font-size:8px;">
          a) Name of the treating doctor:
        </span>

        <span class="cb-row" style="margin-left:4px;">
          ${boxes(treatingDoctorName, 24)}
        </span>
      </div>

      <div class="row" style="gap:5px;">
        <span class="lbl" style="font-size:8px;">
          b) Contact no.:
        </span>

        <span class="cb-row">
          ${boxes(treatingDoctorContact, 10)}
        </span>
      </div>

    </div>

    <!-- c + d -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:flex-start;
        margin-bottom:10px;
      "
    >

      <!-- c -->
      <div style="width:49%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          c) Name of Illness/disease with presenting complaints:
        </div>

        <div
          style="
            width:100%;
            height:40px;
            border:1px solid #666;
          "
        ></div>
      </div>

      <!-- d -->
      <div style="width:49%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          d) Relevant clinical findings:
        </div>

        <div
          style="
            width:100%;
            height:40px;
            border:1px solid #666;
          "
        ></div>
      </div>

    </div>

    <!-- e + e1 -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:8px;
      "
    >

      <!-- e -->
      <div class="row" style="gap:5px;">
        <span class="lbl" style="font-size:8px;">
          e) Duration of the present ailment:
        </span>

        <div
          style="
            width:115px;
            height:24px;
            border:1px solid #666;
          "
        ></div>

        <span class="txt" style="font-size:8px;">days</span>
      </div>

      <!-- e1 -->
      <div class="row" style="gap:5px;">
        <span class="lbl" style="font-size:8px;">
          e.1) Date of first consultation:
        </span>

        <span class="cb-row">
          ${boxes(firstConsultationDate, 8)}
        </span>
      </div>

    </div>

    <!-- e2 -->
    <div
      class="row"
      style="
        align-items:center;
        margin-bottom:10px;
      "
    >

      <span class="lbl" style="font-size:8px;">
        e.2) Past history of present ailment if any:
      </span>

      <div
        style="
          flex:1;
          height:32px;
          border:1px solid #666;
          margin-left:6px;
        "
      ></div>

    </div>

    <!-- f + f1 -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:flex-start;
      "
    >

      <!-- f -->
      <div style="width:79%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          f) Provisional diagnosis:
        </div>

        <div
          style="
            width:100%;
            height:40px;
            border:1px solid #666;
          "
        ></div>
      </div>

      <!-- f1 -->
      <div style="width:19%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          f.1) ICD 10 code:
        </div>

        <span class="cb-row">
          ${boxes(icd10Code, 10)}
        </span>
      </div>

    </div>

  </div>
</div>

<!-- ══════════ SECTION C ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">

   

    <!-- g -->
    <div
      class="row"
      style="
        align-items:center;
        justify-content:space-between;
        margin-bottom:8px;
      "
    >

      <div class="row" style="gap:5px;flex-wrap:nowrap;">
        <span class="lbl" style="font-size:8px;">
          g) Proposed line of treatment:
        </span>

        ${chk(!!f.proposedTreatmentMedical)}
        <span class="txt" style="font-size:8px;">Medical management</span>

        ${chk(!!f.proposedTreatmentSurgical)}
        <span class="txt" style="font-size:8px;">Surgical management</span>

        ${chk(!!f.proposedTreatmentIntensiveCare)}
        <span class="txt" style="font-size:8px;">Intensive care</span>

        ${chk(!!f.proposedTreatmentInvestigation)}
        <span class="txt" style="font-size:8px;">Investigation</span>

        ${chk(!!f.proposedTreatmentNonAllopathic)}
        <span class="txt" style="font-size:8px;">Non-Allopathic treatment</span>
      </div>

    </div>

   <!-- h + h1 -->
<div
  class="row"
  style="
    justify-content:space-between;
    align-items:flex-start;
    margin-bottom:8px;
  "
>

  <!-- h -->
  <div style="width:49%;">
    <div
      class="lbl"
      style="
        font-size:8px;
        margin-bottom:4px;
      "
    >
      h) If investigation and/or medical management, provide details:
    </div>

    <div
      style="
        width:100%;
        height:40px;
        border:1px solid #666;
      "
    ></div>
  </div>

  <!-- h1 -->
  <div
    style="
      width:49%;
      display:flex;
      flex-direction:column;
      align-items:flex-start;
    "
  >

    <!-- TITLE -->
    <div
      class="lbl"
      style="
        font-size:8px;
        margin-bottom:6px;
      "
    >
      h.1) Route of drug administration:
    </div>

    <!-- CHECKBOX ROW -->
    <div
      style="
        display:flex;
        align-items:center;
        gap:14px;
        margin-bottom:6px;
        padding-left:2px;
      "
    >

      <div style="display:flex;align-items:center;gap:4px;">
        ${chk(drugRoute === "iv")}
        <span class="txt" style="font-size:8px;">IV</span>
      </div>

      <div style="display:flex;align-items:center;gap:4px;">
        ${chk(drugRoute === "oral")}
        <span class="txt" style="font-size:8px;">Oral</span>
      </div>

      <div style="display:flex;align-items:center;gap:4px;">
        ${chk(!!drugRoute && !["iv", "oral"].includes(drugRoute))}
        <span class="txt" style="font-size:8px;">Other</span>
      </div>

    </div>

    <!-- BIG BOX -->
<div
  style="
    width:50%;
    height:40px;
    border:1px solid #666;
    margin-left:120px;
    margin-top:-18px;
  "
></div>

  </div>

</div>

    <!-- i -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:flex-start;
        margin-bottom:10px;
      "
    >

      <!-- left -->
      <div style="width:78%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          i) If Surgical, name of surgery:
        </div>

        <div
          style="
            width:100%;
            height:40px;
            border:1px solid #666;
          "
        ></div>
      </div>

      <!-- right -->
      <div style="width:20%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          i.1) ICD 10 PCS code:
        </div>

        <span class="cb-row">
          ${boxes(icd10PcsCode, 10)}
        </span>
      </div>

    </div>

    <!-- j + k -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:flex-start;
        margin-bottom:10px;
      "
    >

      <!-- j -->
      <div style="width:49%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          j) If other treatments provide details:
        </div>

        <div
          style="
            width:100%;
            height:40px;
            border:1px solid #666;
          "
        ></div>
      </div>

      <!-- k -->
      <div style="width:49%;">
        <div
          class="lbl"
          style="
            font-size:8px;
            margin-bottom:4px;
          "
        >
          k) How did injury occur:
        </div>

        <div
          style="
            width:100%;
            height:40px;
            border:1px solid #666;
          "
        ></div>
      </div>

    </div>

    <!-- L -->
    <div
      class="row"
      style="
        align-items:center;
        flex-wrap:wrap;
        gap:10px;
        margin-bottom:12px;
      "
    >

      <span class="lbl" style="font-size:8px;">
        L) In case of accident:
      </span>

      <!-- RTA -->
      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          I. Is it RTA:
        </span>

        ${chk(isRta)}
        <span class="txt" style="font-size:8px;">Yes</span>

        ${chk(!isRta)}
        <span class="txt" style="font-size:8px;">No</span>
      </div>

      <!-- Date -->
      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          ii. Date of injury:
        </span>

        <span class="cb-row">
          ${boxes(dateOfInjury, 8)}
        </span>
      </div>

      <!-- Police -->
      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          iii. Reported to Police:
        </span>

        ${chk(isReportedPolice)}
        <span class="txt" style="font-size:8px;">Yes</span>

        ${chk(!isReportedPolice)}
        <span class="txt" style="font-size:8px;">No</span>
      </div>

      <!-- FIR -->
      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          iv. FIR no.:
        </span>

        <span class="cb-row">
          ${boxes(firNumber, 8)}
        </span>
      </div>

    </div>

    <!-- v + vi -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:12px;
      "
    >

      <!-- v -->
      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          v. Injury/Disease caused due to substance abuse/alcohol consumption:
        </span>

        ${chk(isSubstanceRelated)}
        <span class="txt" style="font-size:8px;">Yes</span>

        ${chk(!isSubstanceRelated)}
        <span class="txt" style="font-size:8px;">No</span>
      </div>

      <!-- vi -->
      <div class="row" style="gap:4px;">
        <span class="lbl" style="font-size:8px;">
          vi. Test conducted to establish this, If yes attach reports:
        </span>

        ${chk(isSubstanceTestDone)}
        <span class="txt" style="font-size:8px;">Yes</span>

        ${chk(!isSubstanceTestDone)}
        <span class="txt" style="font-size:8px;">No</span>
      </div>

    </div>

   <!-- m + n -->
<div
  class="row"
  style="
    align-items:center;
    justify-content:space-between;
    flex-wrap:nowrap;
    gap:18px;
  "
>

  <!-- LEFT SIDE -->
  <div
    style="
      display:flex;
      align-items:center;
      gap:12px;
      flex-wrap:nowrap;
    "
  >

    <span class="lbl" style="font-size:8px;">
      m) In case of maternity:
    </span>

    <!-- G -->
    <div style="display:flex;align-items:center;gap:4px;">
      <span class="txt" style="font-size:8px;">G</span>
      <div style="width:65px;height:24px;border:1px solid #666;"></div>
    </div>

    <!-- P -->
    <div style="display:flex;align-items:center;gap:4px;">
      <span class="txt" style="font-size:8px;">P</span>
      <div style="width:65px;height:24px;border:1px solid #666;"></div>
    </div>

    <!-- L -->
    <div style="display:flex;align-items:center;gap:4px;">
      <span class="txt" style="font-size:8px;">L</span>
      <div style="width:65px;height:24px;border:1px solid #666;"></div>
    </div>

    <!-- A -->
    <div style="display:flex;align-items:center;gap:4px;">
      <span class="txt" style="font-size:8px;">A</span>
      <div style="width:65px;height:24px;border:1px solid #666;"></div>
    </div>

  </div>

  <!-- RIGHT SIDE -->
  <div
    style="
      display:flex;
      align-items:center;
      gap:6px;
      flex-wrap:nowrap;
    "
  >

    <span class="lbl" style="font-size:8px;">
      n) Expected date of delivery:
    </span>

    <span class="cb-row">
      ${boxes(expectedDeliveryDate, 8)}
    </span>

  </div>

</div>
<!-- ══════════ SECTION D ══════════ -->
<div class="sec-wrap">
  <div class="sec-body">

    

    <!-- TITLE -->
    <div
      style="
        font-size:8px;
        font-weight:550;
        margin-bottom:2px;
        text-transform:uppercase;
      "
    >
      DETAILS OF THE PATIENT ADMITTED
    </div>
    <!-- TOP BLACK LINE -->
    <div
      style="
        width:100%;
        height:0.5px;
        background:#000;
        margin-bottom:12px;
      "
    ></div>

    <!-- FIRST ROW -->
    <div
      class="row"
      style="
        justify-content:space-between;
        align-items:center;
        margin-bottom:10px;
      "
    >

      <!-- a -->
      <div class="row" style="gap:5px;">
        <span class="lbl" style="font-size:8px;">
          a) Date of admission:
        </span>

        <span class="cb-row">
          ${boxes(dateOfAdmission, 8)}
        </span>
      </div>

      <!-- b -->
      <div class="row" style="gap:5px;">
        <span class="lbl" style="font-size:8px;">
          b) Time of admission:
        </span>

        <span class="cb-row">
          ${boxes(timeOfAdmission, 4)}
        </span>
      </div>

      <!-- c -->
      <div
        class="row"
        style="
          gap:5px;
          flex-wrap:nowrap;
        "
      >
        <span class="lbl" style="font-size:8px;">
          c) This is
        </span>

        ${chk(isEmergencyHospitalization)}

        <span class="txt" style="font-size:8px;">
          an emergency/
        </span>

        ${chk(isPlannedHospitalization)}

        <span class="txt" style="font-size:8px;">
          a planned hospitalization event
        </span>
      </div>

    </div>

    <!-- SECOND ROW -->
<div
  class="row"
  style="
    align-items:center;
    justify-content:space-between;
    flex-wrap:nowrap;
    gap:18px;
    margin-bottom:18px;
  "
>

  <!-- d -->
  <div
    style="
      display:flex;
      align-items:center;
      gap:6px;
      flex-wrap:nowrap;
    "
  >

    <span class="lbl" style="font-size:8px;">
      d) Expected no. of days stay in hospital:
    </span>

    <div
      style="
        width:112px;
        height:24px;
        border:1px solid #666;
      "
    ></div>

    <span class="txt" style="font-size:8px;">
      Days
    </span>

  </div>

  <!-- e -->
  <div
    style="
      display:flex;
      align-items:center;
      gap:6px;
      flex-wrap:nowrap;
    "
  >

    <span class="lbl" style="font-size:8px;">
      e) Days in ICU:
    </span>

    <div
      style="
        width:112px;
        height:24px;
        border:1px solid #666;
      "
    ></div>

    <span class="txt" style="font-size:8px;">
      Days
    </span>

  </div>

  <!-- f -->
  <div
    style="
      display:flex;
      align-items:center;
      gap:6px;
      flex:1;
      flex-wrap:nowrap;
    "
  >

    <span class="lbl" style="font-size:8px;">
      f) Room type:
    </span>

    <div
      style="
        flex:1;
        height:24px;
        border:1px solid #666;
      "
    ></div>

  </div>

</div>

    <!-- BOTTOM LINE -->
    <div
      style="
        width:100%;
        border-top:1px solid #666;
        padding-top:4px;
        text-align:right;
        font-size:8px;
        font-weight:500;
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

/* ─────────────────────────────────────────────
   EXPORT: downloadMediAssistFormA
   Web  → html2pdf.js  (PNG, scale 3, A4)
   Native → expo-print → expo-sharing
───────────────────────────────────────────── */
export async function downloadMediAssistFormA(form, signatureDataUrl = null) {
  const patientName =
    String(form?.primaryName ?? "")
      .trim()
      .replace(/\s+/g, "_") || "Patient";
  const date = new Date().toISOString().split("T")[0];
  const fileName = `MediAssistFormA_InsuranceClaim_${patientName}_${date}.pdf`;
  const html = generateMediAssistFormAHTML(form, signatureDataUrl);

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
  const destDir = FileSystem["documentDirectory"] ?? FileSystem["cacheDirectory"] ?? ""; // eslint-disable-line import/namespace
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
