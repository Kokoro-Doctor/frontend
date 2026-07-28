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

export async function getSbiLogoBase64() {
  try {
    return await loadAssetAsBase64(
      require("../assets/HospitalPortal/Images/sbi_health.png"),
    );
  } catch (e) {
    console.warn("SBI logo load error", e);
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
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA0gAAAHCCAYAAADVU+lMAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjYtMDctMjNUMTk6MTA6MTUrMDA6MDCMIYhrAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI2LTA3LTIzVDE5OjEwOjE1KzAwOjAw/Xww1wAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNi0wNy0yM1QxOToxMDoxNSswMDowMKppEQgAAIAASURBVHja7P13vGRXdaeNP2vvc6rqhs7dUrdaqZWQhEBkZHIGk2wMNmbAGY89YHvGEzxMHntsv+/8Zt5J9ow99pgZ2ziPbZKQECCESCYIUEQggbLU3Wp1q8MNVefstX5/7H2q6jZSdxuple56+FzUN1WdsKvu+u611neB4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO4ziO8xCRR/sAHMf5TszMHu1jeMDjwpDubcPy5yaGAIKg5euCINL9DCBHf7MxDLHyS0j5PcUsEORov5uR8T/GF7I8uTF9BDb+f8nHK0d6bJ06Z0GnzhesPIUhFjDR/JMW8u9JAPI5IGCWf9fECIRjvej5eaQcK6ACobtOBqAg3RFJOd18t7rrMj6PcrJWro10F8AgiREVLFj5Tvcz3bkKcti1fOBjntxDEwiWn6P7avc4+ctSji3k6yOP3p8lNQjl+oqVa2qSzyfIZI1KWT2TJVSucVkL02vtGM/JMLDJ75pMXmdwtDVanlwETIEwtextvCZs6sGke2zp1sLhz3Fs92GyGrr1aOVxymv4sPN/OO9x91hmVs5X8vtReR8xEaSsRRUIpuTbd4yvvUeOlwJXPNoH4TjOhMfcu4TjOI9dBENtIkgMIVjIAYcJASEYiCg5aC8/dQxybxIY2ji4E7I4OppeFCbiyGRyfIiUz6cCMiuPbTlozMd6pMcOmOk4gA2UoLk8mYjk8x8HXqGIrlACxIAICEqQTngcG53AwLL4lKzM8hu3CWapfC0wFkvjm1POb+oiGZNzFSmqVQQlgSjRyhOQH08s5PtSDkQAs2MI9kUw8rGF8R2autNFc3TXQrQTxMd4YY4TUhRo6NZud67BuiNnxSUe/0sx0bIGVp7EOIA/2nOb5PsoE/ktRbseTU/kDQlDitCciCMdrwMTUMnrFbOptUUWveWelEXRneDRsaldkHK+nTgS4zvE0MMpgPOmTCrn1G0GKEnyGtT8hBiprMP8XvWY3H1yHOcxhQskx3H+FmTBkjeINb+BrBBDbX5XsU4o5ODlGGLqqccI43irJE9K1uIolLhuKrzLX9aStemC1BJL5YAxHVOwJBLzcYVOLEweCzR/rWiP6UBfusC5XLtuZ/9Ys0fdsSMQy/PYVHDbBZuTcy7iQygB+9S9MSnnMTnOHEIqAclZLym3buo8Do+ZjzW+FYkrMoigOWg3QCeZklQyWBNZ8OghIqRyr4p2XCm4uytjKYuRsi7FQvmYXLu8TI4h/TN+csq60hXXfVqQPRhWjtlKdmucHSpZTUQRNK8hJjnBbm3l8y3ZwekdkKNsHozPTQ4/lqlzOo4YVu7UZGMlr6X8uonWZZni+Ocdx3GOBRdIjuMcM4aCWtEDk8IayHEVVOW/XYDXlVUdC2Gc3cm/nyZlS3bktyo7whetq88Tw9BxmVvOk8RjLrfJu/MleA0C6CR4lfHho+gksLSAcNjxTZ3j0Z8075BnkVVyMTJVLmVh6sEVpJ2UZHWCbOr3tAsRu8ySTf3MWFzq5Fy7Q9Y2n28nCI922FOljtOiQSWVayVjkVp1l8qMR7+wVInTx6Bd5ihMlIoISMzXTmWq1JQpYdzF6hMBezS6YkYs5MzgWHHbintxpOu9QmAGJq+BqfvclaMdft5ZeAcmOyAUsXhkxve6K/UsQv471v1xQEVAJ6Wb3YmHbsdCtGTwmNpo0WN//TmOs2pxgeQ4zjGTN5tzgB7odqsDxqRPKIigpjkzQJgqwTkyOYbpAviy69sFc0crMbJUyscmWZZxhDYlsnL5kRShlI5pe96Y/pnpt8xQSvVK0FkkY7SQhYhZyQgcllkY171NBNaDfeTg+HARp+XKJlK5Nl0GAYt0nUdmNg5wVXMAHKYi+C67seI5k+YgmTAWXwpIqPJ5lD37o5aMlfNTEioTkRGQscAe39aSlbNx2uPRY0WsX8TCONAfZ2KmWtpCV1ZmtIxINnWj1b7zgR+M8rNjkVUylvmxO9F0hAfpBPlUZVy31oRQShrLdX/QbFb+upa+OrNjy3SOM2zCVOa4e0Q9pvLC75bIZAPETPLLv8ucEcabOAK57M7KToZ3XzuOcxSqR/sAHMd5/NBi7P3EFQx37iYSETEqhUaEqk006+bZ9vpXILEmmmZREkrj9lGiklwFNm0AATpa5O7LrkD2H6AK/fytBwi4Yn+G0WxNb9BnMDtPfcJG4qZ1xLk1hLqCzjBBAVMkdDvMkg0DjnBshpWd58BocYk9H/4Y7WiBID2qUq+n0pJSYu45z2DjOedkcVdKpvZcdT3pa9ejfYEQMdO8x21pRcnbAz63JSQGVFugwnQZHfTZ/PrXMTPTZ3TwAHdf/HHmRyOQmtyMnlAFWTPDSd/7MlJvliClfKrUOibJQhZyGZ8FQ00JsYLRErsu+yy2Zx/W645PaTGiBTa88dUM5ueOodleESrSqGH3R6+gvX8vUUIuYwtQtUajibh1M9te8RKSVVTFGOHRYvHWXez91Geo6tx/1V0fjUJIiWZ2QD03g8WKmTVrqTdtpN68gXr9OmrpYSgjVXqE8XkcKYPavS5UlXsv+xTNvbuI0iNipOIWkVLD/AVPZt0zLnjQa64LI3Z9+HJstEglgTR2kFAika6QVAZ9ZH4W6Q/oza+ht3kj1ZYN9OYHk7VAog0gxNyT1pmLHPa83df2funLLF93E/T7VKnoajNILbJxPVte+wpiPPI6/+5RlEA0GO3Zxz2XfJS6rgmWzVHEsuBrNLHlpc9j9uRTMYMkiYrjdUyO4zwRcIHkOM4x0+zcyTfe9S9p776Nqp4BTSAto6omjozleoYNV3+U3vaTqMywIMUA7NgK7YQWJRKs9C0tLnLzv/1PxJu+hfZXvl2tEEqSXapqKpgdMJqfRebmWLt9GzNnnMz6ZzyTjc99GjNnnZkDKjUUy450Eo4YKgUVNGjOT+27n2/8y1+HnXcTwwATQ4PSV+HA0pDTf+PfsfHcczAFDVCJcOcHP8C9v/4/qNZXhBQJBiqKhphF5BHJmQMLRtAKS0PS5hPY9NIXo4MZenVkz5+8n29f9jHquRnQiqgJxViWGeR//we2vfG1tCLEqWRc7mcKxdELUCWGXB6552++xLU/8fNU7ZAQKNmNgEhETtrGc3/wdSvcwx4oYG/HzwOHvvEtvvqzv8Tswj4k9NCgRFVMAqPUkjacwLqP/RH9s87OrmOP4vre85Wv8PV3/zPmBkaySEwJi53rXjkyNaRXkQZ9dG6Wat0mZs8/h80veAYnveX70TUzZDm7YmEfGVVu/q//g+UrP0+cmSG2RqoEU2G0sMyOf/pzrHvGBQ/66+3Bvdz4L/8fbPdt1LGiDVU2BTFFJRAsl5qpBJIqdewRBn3adXOEzetZc9ZZbP+xH2bzC76HQAWt5STWMdyMnX/xfu75L79PXNMbX6Ng0Cw1VM96Opu/9+XAw+te12HWmbAk7v38Vdz0d3+JwfxgnNFVya+fdHDEwr94N+f/m18iSRZUnkVyHOdIuEByHGclBiYNYnX+VBRRgSDs/MgnSXvvZWbDWoweGoxKJRezzCV6+5ZYvOEmZk7aTpJAsFQc1o6tmteocutEcXsT6VPN9IizA6Q/A2IEM6wEfpFAComQsp9VixGS0t97kLT3AKNbb2fpis+y6w/+L/X6jax50UWc/PY3sf5lz6MmEjQUp6tyADJlyd1ZmksiaCQEpQmR/syAMDeL1DOY6VgozMTIIFTj8qaqPO5M6DM326c3mGMoFZW1qESi2binJyGEEFBVKgm05XFFrQS2+fBCU9PMzuTKLjFCf5azf+ndXH3V1VQhUVlEJLAcR6w51HLLb/0xJ77yJcjcLEmEqgsMp3q6NADEfAmScfvv/CmRIfPz84xCyP1IKmCJNa9+EXU9QC1LoAfKgJlZfp6Q/7zs/tDHmF86SFy7DhEpArHFtKIfWpb37uPOSz/FOe8+e9wj9WhZfUvdo7emRxUDtVSkKHm9iRI15mA7JKoUYKRIe4Dl+/dx6KZvcPD97+feKz7Nhf/9v1DNz6IKIWguweSBxcHE4U6pBjMMZtchsz2i6TiQl9Ag/f4Rr0mUmsFchQxmkHqGWNZHHBth5GylqBGt9BupwZ69hF33cujq67nh8s9x6r/6R5z+Yz9MW+XMcFCDeOTXbqxnmZ2dIc7MjNezClRBkJkKDbn37XjcUjGhKo+7+LVrWLtxLRJrkikhBFKX/Y2RfZd9mtHPv4t649rJxoDjOM6D4D1IjuNM0By0KzUItGKICm2Ath1xz8UfpzYhpopohmjK2YdkRA3YzIBD13w92zuXHWMxHpY+BEkJ0YRqnjkUDMzyc2ORRMz/U6hipBci/WqG3vwa5nozDBYPsPBXH+Gqt7+L69/9HhZvv4vcEpMbLjojhK7HJBQT4c5MADqjAVCZvHV25xamjO2mm+olGE1saTGqlF3bxNpsvmAGWrITSYma+4UqDLMGQVFtc+mT5Y9UbL0DuTxw4/OeybrXvBQWhkRTWlX6bUWcrVn+0pe55+LLxhkyNc29WuWcxCYfGOy84pMc/MRnma9naawYKKR8D9uFZTa++Hlj97wHC9hFhCQ5i9UcOMiuj1xKXfepWiOkfA4hRWo1qlRR9QN7P/QJWF7ODmSPYoldzuhNTBFElZCMus3HLQaVVYDQ1hENkX7sMTOYZ3ZmHYsXf5Iv/si7WPzWHYQArXZ9Yg9wToe9JGrLYiy3YhWBkiyLpKO8fNSK+1yI5b4awfJaMzPqNOlh0hBpYpXL6PqRWM0Q1mygXlrg5n/8r7nuX/xb6iYLtK7f7Ej3JJjRSi4J7Nrr8mumCLzD5jk9nGhINLRA5NDXrkOI2bI+hjzLShNVK9DrMbrpVu7/9OdK5aHLI8dxjowLJMdxJpQoP5Jr9yssB+wKC1dfz9KXrqHu9YBc1hJsYjdtJsS64tA1N0wMCiyQ5Bhtuo96bF2DdSBN1f9YySLF4lmsUWgx2gCjKkf+UZRRVSNrZlkXI/v/5P1c9eafZO/nP0cVJbth2ZQJ8NjgYWXvlAQbn8uxir4WIcoADRXB2mJUELAQx/NapM0zklLxtAgaiVrnADXELNhMkGRUCGpZ8uTfrzjtZ97B8tp5muLCVichtJE4aLn1d/+A5uD+3PskYWyEMZ6hW5zAaBO3//bv0xsu0oaQd+CtRUSIKbG8dp4Nz3oG2frhyFlBMQgKO6/8As3NX0d6AzTm3iMt59xEaAT6dcXyNdew92+uetT/IKkJQYVYDLGjCm2QnEnTvM7S2M2vs5LOoqQVpd8bYJ/6OF9957tZvuseNNRES0cUOCKCBSFJJ8qKkMGKSV4gHkU0diJEs09BnmJl2WlRDFLpA8yyWjFJVAhVA00VqdSQ0GdmULP3N9/HN37tN6lIJLJghwdY7zI1zHnKDjxoNvgQg0jsJmodF+EbTAkG7XJi6eabsSq/LkKinG8kAZVF6jRi5199OI8nCMdgNOI4zqrm0f575DjOY4ocQGGQrPRexBwA3vXBS6n2H6SJSgqad61L+GMlxkaNQ9+4GchBGUDV2VEfM8WNbsXn2a1KpZtlokBCQsJoqC03upvkYbUpgIWc4QpiOcA1qKSl1kA9twa59Vt87cd+kd0fv7w4G0ekbch+eEVGSHaQG9soT/VYHInpYDBixTFPsQowJQQBHREZIaJEsRycG4QgDGNLCgktc4w0Wu6bqpU2aM7cWb62pi2bnv0Mtrz21WibS5mamAhU1NUco69czc6/voSakI0YLJdahc5JT1skwu7Lr2T501cRZ/tYjGCJKBVCYnF5gS1veh2DbSfmHpyjBLtWBp7uef+lhNSUcrOw4tpl5zfLmYbhEnd+5DKO2pJ1vBEta7k7EKMqZWnjczPDrKUuKzGVokqR3HNXz69jePU3uf5f/Rp1uwQWUdOxs+Hhgfn0ZyZZ9KrJiiRHOoq2MMtlbFhJ43TuepYmYi40NKHFCPQTmAbaUNFPzfjca4H+2gF3/M/3svMjHyPGBy937L6qlKe0LHxTYJz1SsVm+3jla0wjUSr2ffmrNHv3kkyoqbIJiZGzWgIalHp2wN6/uYrFm287TkfjOM4TCRdIjuNMGLsUG5UEtAQ3zb793HvZ5dT9mojkrIbkfpeOHNwH2nt2cfCGG6mINDAZqvoQCSk/R4Rc3teCLiTSkpGGi1SjBkst1ibq7B0BsaLFEBNqC8QRpHpENCMM1jM4sJ+v/fx7uO8LX8pZgDJCM5ThpSsPfTJYRsf/PnpE36gxaofEtqUZJbRVRqNRdkmzPqYVjeRsUkCQ1FKZYC3IUJFRC8MGaxM6TDBqi312ApFsgGGBHe98O9Q1KeQcwjAkkIqZGLnzd/8I3X8/ImGqZLCzho6kdsRNv/2/CTYCqXKPV8iikzSi2bCBHT/2wzl3JEdvXY0SOHTLbRz63N/Q688TJGFJiXQW8SAqVChJInXdZ/8nPkNaWHxM7Ox3JZUp5H+3AdqoVEsNLCwhSyPahYaWUBwRoZ96ECCmirWDAfs//Cl2XvZZ2mBImJph9SCCI2d9JsIjTA1WOloCNi+BiXjvhFhn655SIiw1sNjSNkY7apB2mUhiFKGVPGsrOwxGBjrk1t/4fWxhGcY9RA/gYjf1/FIs4bWsrVB6kY7r/YzZUnzXX19M3eQS1XZcM0oW3MFoJeR+wz27ufuSTzwG5m05jvNYxwWS4zgTSkmPiE2GkQrcd8Vnab91O2EgRA1oKtmcUoLV9RqlALa8zN4PfwwDohjWWV4/REy6LJJB25C2b6Z65gUMnv5k2qdfAE89H046EZuf4YC0LA2H6MIytWY5o7QM64imOu9yixL7PeZ27eOGf/prLN97L1VV5dxRCf66sqfpd8rpcqLvuHyddfZUMBnWraM67XTSqdthx3Y4bTvV6acSZmaIaYTFFhOjl4QWsKr8/snb0R2noKedjJ5+Gu2Ok0k7dtCecioSennmkSpIRA3WPv0p9M4+lVpBNBJIoIlYzzC67kZu/YsPl3k4ueTJzFDLW+y7P3Q57We/yExVkSxnTESFUEWWFxs2v+n7WPv0J+cs2LHcK2DPxR8n3XM3kR4aAdGx3bSS0FJ2JRqQfh+75XYO3nLLA2ZZHilMYunHyv0zUWU866puheqpT6N+xfMIL/8e5DlPZXnQp1lcBBvSSgIVNAa0UoIucNeffGDiHnj4KU29JvIQ37JeOrEhlmdmcfQ/1DZWKvlRVHImUiRiSdGTTqZ65nOZfcoFxB3b0O0nkuZnODRskGEWP3Ub0BSpEOqqT/ulr7Lz8ivzlsERbkcos49MSuHleDjt32Yi8nd7w2Bp113c9/FPUMWIBEU1u/eJQZSu50+wEBhE2H3xZbSLS8f3uBzHedzjLnaO44zphpMiuRkm70An7v7AxdQYWoZOAjnDooZK7gNAcv9EJcJdl36CU37uJ4hzc7kE52+lkAKMR5xOHVuAoAmIjIbGpre+ifN/8e/BcsJiQpIwahtGB/az71u3sfzl67n3ys+xdNW1VM0yoS/0SSRyD1UiEVKgnp/h4Neu5Zv//je58D/+m7xzXxwMquktfaDr6TjW+N3MeNJP/ijnvOPNaIhYEEQVYuT6v/celi65jFhVIDbpzVlWwrln8Iz3/SbV/Do6u+KoLRoNS1CvXQfFSKIxoxjvsf7538Oeb3ybGs39PaoMoyC9wJ3v/RNOftOrkU2bskCSkgVbWuDbv/eHVCQIde45shz4DtOQdMI2zvjpd0AnnGVybg82G8eGC+z+8GX0qtwrdrjgCVKGw5oQQnYftEpZuuFm1j/lyY+aUUM0RYPlUjtyo38Wiy2LVcXTfu09rLvoqUgb0LZl8ZZbufl//h/u/7O/ZjaMCPTGQ4oH9YCD111Hs2sX9datY5OHrmfv8OuW3RuzuInlBdXpi6OV2EHJ4BZThDAWmcZoaZnTf+ZHOO3HfhDaxGh5SFKwffdzzxe+yD2/8V6qm+5gtCYSNXeYaQVqQ+7/5BWc9IZXlWzqg2eRJn2Ih78Ajt997NbU7k9cidy5E2b7NGJUJiQReiY0gbFTpWKEwYCla65n/xevYvNLX3AcV5LjOI93PIPkOM4YYTKoU0POvBz65h0c/MKXmJM+wSIWWqrcBU1lea4PasXdDWIVWLrxFvZ95ksYXanQQ6HrXZFS1GaMbAQzPTTWMD9AZ+Zgfpbe+nXMnbKdU176Qs7+xz/L9/zV/+KCP/xvxBe+gKXlxMiMFAxNQk8jUZQWYU1/lt1/+gH2XfmlcWO8UrJfMGkUmXKsE2OFUsqOYZNj7AI4WdsnblpPvXE9/XXrqDduoLduLTqTH1uLsOwes1JoQ0295USqDWuo1q+lv24d1cZN9NZtprdxMyHkHh4TqAn0iinCupe8AF0cIqEl2oBhyH1Ndd2HG7/J7e/7ayqZNKgHjLs++FGWvvAl6moGrEYCjEJgGIxmeYETf+A1zJ+7Y0VJ1dHY98VrOHDN9VS9frFUDtm2uiv56paZRVRyD0zd73Hgq9c94mv+O9daNyRWiFq8OkSoTWh7ObNmFTAQ5s89i6f9l19h/VvfRLOcZ2KlqqUxwWJFuG8vS7ftyhmkB8guAiu/Z4wzTtPEowjyRCrHrIzNS8o6NlW0H6BXobM96g3r6W1ez+zZp3LmO36IC//gv9GetY0wyvc3WKSfoA5z7L/x22ib+92mjzubM0gWTjLdM5jfB3LGLKz8+YeRbv2atuz8q8uIyLgcGPJ7RSsT50Ek5V4kqxksDrn7Q5c9zEfkOM4TDRdIjuNMkU0alJTFEMbOSy9Fdt5HWweElMuPNNtsqwraKhpzIN5ra9qo9EdDbv/gB5HyFvO3C5A6H67pz7OlN8UwQURIOu5Fz7vv1jXBd+VjClXN+pe/gGf/yW+z7R+8iwMKVWrKjBRQ6QGK1YHB8kG+9d/fS9BEis3K5vJOCHXDVbs+nhVmDDlYFBj3fkgxjRAp0mBq/kpQy03smkeqppAFiwbNDVRNygYRh5UoCkCQcWnjOOGlifVPeyrt1s0Mk4I1RBUUgRDp9Sp2/9Gf0+7cg4aAWSIdGnLb772PmXJNVVLOAmK0ugAnbOeMd/4kZjl71B3HRC9avjRaDBeKGL77/ZcSR0tEydnAoEq0lmQBSS2JhphqEJ0E0qHHoWu+Ps5WtBjQlkG1+l2so+8GLb00CcgCNGpN1GyLXbfZiEGAZEKiRRFO//G30s7XWUi0FaH089AazeLB4ho4MU8YL6sHOgIBU1mxsXC0TrdIzMYpVOV1IuW65TUaNK/KQMSkIVoudmy1Yc2TzuGUn/4xVK0YrxjJBOspac8emr33Y11x5Aor+5V0L5Fg5cemzvW73SLpnnO67NIMJFtjcujq6znwtaup+718TKXnyMywZhnRLPi6vqwAyPyAfZd/iqV7dgNZrOt4W6PJz3dc1pbjOI8nXCA5jjPBumAhkFDS8iHu+eBlxEGPJgIWCCnvzqq2yOlbmX3G09HRECyRqjx3JPaFvZ/+Mou335mFxHHuKel24R/wwyD0lHP/5d/ntJ/7uxxIQ7IDQipW5fltsBrMcN/nv8DSXTupUjE6f6x3c3dzZzAkQm/jek582/cxWm5AUvmBlAd+9nos3HI7t/7h/6UCApE7/uojDK+6hmp2gMYs/moNoIFwKLH5rW9k5sxtCFYi9+55J/bn2SAgz+tBYGnXTvZd/mniYIaQsvgzgWg1LC8h55/F7LlPZlkXCWnS0yQiLN12G+3B/eNMilmewQVhfK7H9XKOBfeUOCnOdqJGkvwdtTy3KHfsCIOTTiSs2UBI2UAkWBagWhmhDse9FacbwHv417p71YY2948pBGqy1UkglGG+sxecS1MLTVXWfRXAGprlIcPl5fxYD/BaON73Y7yp0GWrzMaudAB3fPgy4v2HsDoSNW/HqCptr6b/shdhsUJosDAZCxCkorlnF7s/8SkSXTGvlnHNdRkQ7TjOascFkuM4E0QJGhDLXm73fe5L6A03EqseteadaY0hl4EtL7H2+1/Btp//UZo2u761eXoMVBG5cxf3XPrJcY/CI3YKD1DK1JrSGJz7T36eDS97BaPFJUyyLbhI8QQmMHvoEIe++e2chXqwAZ8P57E+DI+Rj7ybg2Oc+hN/BznpRLQZZTMKDaXZX5iPNfe8709Y2rWTdnmJnb/3PgZVzEKk3N8mKE1qSaedyhk/+faxKYWFkv4qNt82djYrfSgIQWDvx64k3XYHVVUxDLkEEDVagaElNv+d72fzj/0wabhMqgMqORtJMmTfXvZ86os5+2AJkZjL8or4Ot5b+52QsRKZZ/vqnF3QEAiSAEVIuVTTcsZQFhaR5YSFbuCwIElJ87MMtp2UjUWOI2a2whZcmQwCzucV8vjbMJlrRDkTxbo0CnU3uFihkpCHMHfXRoTuVjxiGwcP8jQiRrv/AHsv+Ti9qiIZtMGIYoySEk7expN+5Z/D1q2k1JRSu/zRijGTYNf7L0baRC2W1xoxZ6dEPIXkOI4LJMdxJnS9BW3+T55j05RysySkYnlsSUkzc2x/+SvZ+OLnEc45CxsO6amiIb+xxBjYc/FHYdQe94DqaI8vUlPZCKkqznnPP2S0cX1298LKUEkhhECsAwvfvJlQSeknOv6R0kOKnTvNUsSKGMyechrb3vFmhsuKhQAWx65oVeiR7r6Nu/74L9nz1x9m6drrYDALwAAhWCRhDIdDTvw7b2bmtFMwBRXBSMUNTLCpXjUrNtBJck/IXe+/lB65JyoEYWQJjQlJDeGELWx72cs54ZUvpj3pBFjOZYAiOXgPZtz9oY/mgifJZZDFdm98vseTTsh3TtEm5NI1KSLDyrBiArENWPFHvOvzn2e0f0/JquU/q6lRemfsoH/yCSQ7+uyoh4MwPu5u4HMp8SQbpQQzQshW2CkZocni+tAXv0yVlKCGxDzoVTXAmjl687NMq6/pnqnjzrRNeHHFy1mkyK4rPkO6+TbquiaQEBFGkpDlhvWveCFzZ+1g/Sufz2LTUFlASdlV04y61+PQVddx4LobEMllw1jeZnjMZ40dx3lEcIHkOM4YsTAeGLl0x13cd/nniP0BYtBWuYSlapWmGTL/nOcw+/QLqGZm2fryFzNqm7wLS5lcP+izeNW13Pe1a4h2fCfXr2ggf4DniRZopSKJMv+Us9jyqhfDohKT0sbcjJ8Mqjhg4eZvkee4hBWlVo80egxP3fVoSJcJIAewp/74DxF3nIktL0HMw2EJhqDE/oBdv/sn3PYffpt6dkBVnmg5GCot/aEST9nOGe94S34OCbkgq8vilP+IWpdOIBCp1bj/2us5dNU1hMFMObC2zAgONEtD1lz0HAY7TmVw4ha2vvgl2LDBZGKrLrHi4JWfY+Eb3yYSCCuExbFZjD8cdK5sK+zaDUKvzudvAhWEoOz/4lXc9e/fy2zoygFzqusQLSf+wGuIvdkV88KOF2Eq+9UddWerHmJNGrvnBSqMKhpSGfd95ot8+w//jKoK5XamnCFrjd4JmxmsXTuesbTiGj0S94GVBhb5H7nUbtcHP0pIholk10ETogXCmnWc/H2vAeCEN76cqr+WlBIaIi2SByZHQfbv5+4PXYZRjUsNu3K+R2JjxHGcxzYukBzHmdDFQQY7P3EF3L2LSJ0HtKoQRIliLIpxwhteQ4wRQdn6Q99Lu3Y9jeaK/hYhIlQHh9z9wQ9DeOR2nb/DJawYGdQSCAmEyImvfSXL/TzkU0xzfxUh70LfuXPc6/Bo7iaHY31q6QaM5v+lpqW3dTtb3/EDWLOM0ZDMCJpoK+iHGXp798POnfSkytbSMRV398TCaJlTfvSHqU/eBmoEySVySMzBc+kNopRcjUuSgrHz/R8l3r+fUEWCWBm8GxAVhv2a7W95bc4KCWz+vlezPFNRa4tK7gWJCHHXbnZ9/MqSHRPM0iMWrnZZo84WGjXEsvueoBy49pvsvfp6dn/1GnZe8gmu/aVf4+p3/CL13XeRBlUO1kmMFhdY/+xnseOtb6JoqeOKSjc7qThJFtHbihGqyOhbt3Df9dew56vXsvOzX+Keyz7Fnb/3J1z97vdw3Y//fWbvvg8LMc9PosqldTpi3VOfhlUxl+w9Cq+FFTYVQfLcL+Dgt27h4Ge+SNXv53easlPQLI6oXvBM1jzlfFRh4zOfRv3sp0CzRL8cfyuGSGBQRe776OU0+w7m5xIl2dEHPzuOszrwOUiO44zpzJ+lGXHPX3+EfizlQoHSR2GElKi2b+fEV70IAFVYc/65rH/GM1n61KepB33amMt6qkHF3o9eTvOL76betOn4HffRSpgEcpCVZ6KsecZTCCduIt27lxDBQiQmxYKQ9u7LAzbhuPcgPeTzLkMwVaz0jZHnKgFn/PhbuOsv/hRuvZtepZgFkgiVGk0vFHOKUnJkgpgwHCU443S2v/1N+QkOzxx0u/nkHiEjFoczwfbvZ+dln6Q3qEgowSwbPmA0o4beeeew8YXPQVRpg7D++c+g9+TzWL7mGmKoAMmlYXXknksu5Yyf/EFsMEcQmRg5HO/rWYRGAMSsiCUhEKiAb/6bf4doBBXa5SV6bWJmtof2A8EqMBgNl0innMr5//Hf0Jtbh9oQpH9cNwiCTRlMTOmYEAIy6LPr9/6UO//3nxNNGTVLmCWqtiW2Rn++RvoDUsoZpQajFhjNzLLxtS/Nj8MjWFY3jWbnv1zaaMUNUtn9oY+S7t2Dzc9mMwzJfZELAc594/cSpEIVQuyz7ftezbc/95lsUhEiUbMlQ6wrlm76Nvuu/DwnvPGVeZ6bVEd/L3EcZ1XgGSTHccZ0Ts73fu0bjL56Pe1MDVFLiZCCRNrlERte9kL627dgSWlDLuHZ9KZXkdRQMYLkDBI1cMs97Prk36x4nkd6N1qKdbiWxMfs5g30tp8KQ0UsElPKTdxq6MGDY4tkOarB8kPnoRhYBJMy+aYYJ5TZSKCETRs57Uffji21aNWg1FSae4VyEC1je+OkOXvWjBLbf+KHGWzdkgWQ5TK6XGKlpVdj0qsmaiW7FNj1yS+hN99JVVV0w20holFZTkuc8PqXUM+vy6VrKvTn1rLltS9jlJTKhLrNx1ZXfdJXrmXPVddlrwYrz/0I/LmaziB19yVqGPckzQ6NtcNlZtpF1vYis3P9bHsvFSEJoR3SP+9cnvtnv8v8+ecy0kSQ+rivIzGKLXrJJIXi+KaGVYFo+ZgHoyHrpMe6apZBfw39uXXALAnLfnxttvI/uLzIxhe9hBOf85Tc+2OPkvd1WXedYDET2uUhez5yOb2qzkN8SYgGTBPVGSex+RUvoC2e3y1w4iteDFu3Ym02/EhBCaJoiAzaxO0Xf7g8WTXOxB7dWN1xnCc6LpAcZ5VhNjVocfrratnsdnGZW/7zbxIXlwiUQCtldztGDXr6yZz57p8q2+2BynImY/ub3sDg5S+EtiWkzuFLiBHu+M3/xejevTnbYGlF6ZQdNnD1u+FoO75GADOiGckU6/VYe9qpebirdJmQ3Iw/WlykHbXI1FyfxyySY8hu3pSMzbcDasqpP/EONvz4D9EcarLdsUze9K1Yw6UgRGBhaZF1b30jp//U30GtzG4S6SrpyCWIjEv6zELpL4ronvu49b//Fn0b5llRBAJKGxO63NC78AJO+7G3AxQ75RaA037krQwufAqj0RCNZaiwCGE04tv/9bdoDx2iG/RkU8N3jxdW5mxNZ2EspOJwLghGG2sIPYIGWgvlWhtWtaQY4b693Pzf/he7L7mCsLRMMtAEainPKCqvl/FT2EM/LxPGQ3g15OwXUsRzgmA9TGqINW0kl1yKjQWyWEBjAh3SKmz5sbdx3n/5ZVKcFJkc3pfzyLwyJqbbBoQAt/z+H7P81WuRfkQJJIGIMQJ2/Nw76W/eRLAEJkRt6Z26jdPe9U7adlTc7AQlYEGoejWHLr2cXR/9ZJ7rZilnys1DI8dZ7fi7gOOsMjpHKyDb+04NdgwS2HnJ5Sx//FP0ZiuiDQByUBVgsVnktJ96B/NnnZ4zCJJKgG7U833O/sWfRUNNLHNrkEhdzzC65hpu+T9/jhAZoSXIDjkDITxEK7djoDhgIZadvgjITG8cmAazbDBRGsCzwJPHfIndkYgmtDM9zvmVf4I95cmwNBoPy8znnIVyTBWj4TL1+U/igl//58SZGcLRBGfXgmRKCMKt7/tz0leuper3S0ZLi9BQhiqc/nPvZHDiCSSDKHn+jmIMNm3m9F/4aRot2bsyT6memeXgFZ/j7g98BAuGqiKmx/1+yNQ/ur6enJHJdt4pZOOOIIYFpRIlmBINYiuIBOTAAQ594P9yw4+8k8+/5adob7ubEEO3EzAWplCW/cN0Tp2pRxkRlMstLb82s/jMVtiIUBX78jwcWFASo4UR6dync/5fvZen/ud/R33CJuKUUHh0ys4m1yogLN91D3f8z/cyU0GVKiRIOS+h3rqVk3/4rWhxuQsxIVIRLHL6j/wg+swnwXJDpfl8QzKauqK3pNzyX38LHS1CCGWdeQbJcVY7LpAcZzXSuZGF/BagpTnZDO75wMWIDRGtUFLeaTUhNg29TZvZ9LqXMR3qmUnOygAbnvVU5IRNtGJYyHmNJFBVcO9HPkY6eIgoOTimzB96JMKuLrjLdthZvEUrNtgdoRRCqY5L8R7PblZach79dRs4/affwVCy5bOSjRZSgBDyINmRGqe884ep1q/P5WB6FNv08TME2sVF9n7kE1RBSGS7dAgYkdGwpTrzVLa89AVgiVhK5qxkTVJQNr3keci5p6CpQdRoYr43A03s/NCloILFXK6HpeN6zca9Tjbp60mBsQlAWhpxaOEAw4MHaRYXGS4uoO0yLS1tVUb2qmCxR39ulvT5L3PVz/0jlvfdj4Wuv6U49kF2X3sYjjtoFkNd5kslz0VKgbzx0QxRGYIEVBWLhkmFihE1/8yaN7+BZ//lb7PxOc8iaZn/NDVw+VGhWG+juXT07suuINx+D9QRq/NmR5WdQhg86XRCXRFLSaCWdygTJczNsv31r2JYZoPVEvIcNDOqfo/Fa29g9xevGmer1EfFOs6qxwWS46wyDBsbJht5cGKUXFp08IZvcOizX6DXGyAS0JDyzj5GM2xZ+5KXMLtjBzqeRBlpRTCpcrlRr8/smWfmSTEGVubU26BPc/2N7P3SV6mSrCibyTwCb0WaC9C0bEov7t1XAsoAwXL5kxgxBqhkqh/h8YmEQA/AYPvrX8n8+U+iHS2jIeZSu871bHmZ+fPOZtsbXpXNFiQ+oK3zd2C5b2nP33yRxetuoN+fIZiQLAfdQqJtWza+9iX0123GRGgllZlK2d0uqtFbv4FNr3olo1FbLJbzY88MBhz84jUcuvabVEysl49nmd1YFMlk+G4wCGqMgrH1HT/E6f/qH7H9l36RzT/9E/Rf+xras8/mUBBs4QCBbKmexUpgdn4do0//TS5ZNRCJU9cPHq5138aJg113b4PlsjtpleXeDI1WVAqVRFqMliwwrGlh6wk85T/8a6qNa3KZY9BHdLjzkTBy2aA2Lbs/dAk9AklynxtdD9yoZc3TLgQzUohZ2FHnMkMDk8j2174WO3ELoVU0QZJid67QWxyy64MfI9+dPCjbcZzVjQskx1ltTAV/Xe+CWcJE2fORjyP37aWqeiTTHGghJBpGg5qT3vJ6ggmhBFBiiQqIQC3ZKnftcy6gaXKPiYhQK9Tao26G3PGBD6PRciAiXeO9PjIN4CEHSyGAjoYs79xFDHl3vMtoRIw4M0usq+5SPW6xUjtpJMLatciWzaCJWDI4YtkdTCzQnrCBuHZ96Q07hszZ2DVNue8DH8eGQ1pyPxpAEoEW0qZ1bH/za0gx9/BUFPFAydCVbN6Zb3wjYf06VCui5p6fYYRq3wF2ffCSnKmUqeG0x0kkdWV1Y4EfZGxqYWZs/Ym3sOMf/Cxn/LNf4En/77/kOX/wGzzzI3/M0//4d+m9+nWMRg1NUFR6AIi1zMzNsutP/ppDN9w0Xmv5m+MxUg+ZbMO/sndKJRs3DNuGk979k/Re+WLa5WUAokakzGxKvUh7204Wb7+r9NwlopYepuNd+no0pOtCEu6/5gYWrvoqYdADEyQpbSUYgeFwxJpnPgUk99NJlwOyvPmDGTNnnMaWF12UnRqlyiWIGmiDUfVqDnz8MyztvMsd7BzHAdzm23FWHdJFZp1QspR7bw4tcc8lH6PuVzQGRCmlLXmQar/fZ8/vvo+7/+gvCSnPhyEmWoxIjaUWgpB23kMdAo3khvwUYZCEatBj3xWfobnjbvrbT8pKJQ/feUSUiJF7ZkQCS7ffzeiOu5ipchAZrRyDKTY/N57t83i2/A0YpoZEwdQYy2JVQghYCaoboLIwdisLIiunjT7gxczXZfmuO7j3iiuZqQb53pvl4joVTISZKnLXr/1PCD3aynJpn7UEIikEoiomiqRIVQs0Te6LMUBq6l5i70cvp/2FH6Net/b4O9pN9Z60uUGIqnxJg5AWyjyootWUQG/NWja98HvYfNFFfP4Nb0Wu/zqS8vG1MSDWQ+67n9s/fCnnn3cWEmIRSUI3QurhYPqWTfqRjHbUMHPGaZz38hfxlUs+zazm14BqQ2URCUJtDXs/+1nWPPm8/CABOoPzR5PxAGEzdn3oEsKhQ8TBWkQSKUSkDNUKsz3u+a0/4q4//OsiElvEQhHxAZGESI3dcit1D0QaokZUjBQFkxq74y52f+xTnPYjP4zvHTuO4wLJcVYZXdtzFgzQSs4A7frsV1m+/iZme1UeNplsXGYjoUdsWvZ86kqCGrENpCioDbEQc0BYGaKJGPrQ7+WSIqsIAqNKqVSId97L7kuu4OS/+3ZaUyoMLE5lk44XOdjrhM+eq2+E3XuRQXazQnPYLWYMNm0s18mOqhMeyyiJEOvsGiiRylqGFkiVEVK+IlE0W4SnbK2QJFtuJwnEIzx2EiMi3PPxz2J33ENvZp6hWS4xI9KEbBLBwpB9H/80LQtlTlAYe3KoCMESTaVgFTP9mVziRx7SKwqxFg5982bu+8xXOPG1Ly0ZmON5zUq/UcmgdNme1L0OxHJ2outdKz1FKSWkrjj5rd/Hre+5mro3g5gRVHPGteqz/0tfySWnVv7slgycSHhYjBq0OBSGYt+eS+yMxqBZPMDapz+VDd/7IhY+dAlhZo4QKzS19LSmqQfs+cSnOf1n35l714xi7f9ok1+Ay/vu495LP0m/6pMkorEhJkhllQ4iHLzy02WQcXfc+T3FEJAhSSr6YQYGFWpZ+plB3RpNFGozdn/wE5z69rcgofdon7jjOI8yj4V3QMdxHkmKQhK6wZh5y/ieD7yfQXsIoYdRyqRSyL05akSJ9HoDqsEMMt+nmunRm11DfzBLb25Arz9DPTsgDmoUWzFLRjTShkAdE7s+cClp1FBJKLN7mLLTztv1D5S1kTK7BymOZ6U8z8b/T/lX+Sw7SWT7bgtoqeQzabjrrz5ElERL3oVOAtFyVmyw/aTxcYTHrTwCoS4ZsJiHnhLQACF1rmDZ3lymHAkisfxXx2tlYkcNqVzdgJDaEfv+8hJijGgUxFo0CslaEEOjEM2oZioG/bXUM7P05maoZgfEuQG9uQFxbpZBf57BYICJFRkbUQQxQ+lRNS33fOAjiOQySJPsmjC+x+W+K+khp2NCF1yX0sts+iZF1AkW89l312O8TkNEkjH/1POhsbFLdDZ5MHoB7JY7GR08WJZwmSFV7OcfrpJBFcbiSEqPWQLQLDrP+JmfZDQ/AMsubhaEUWizQ9zVNzDatS9nHou9f3kJHfmyWijPlc3dk5FnYBWjjyDhAX9/8opdabwxHkFghlku1b3v8s/RfutmQm9ACC0xxbwKg5KCgdX0+gN6s3NUs4Opjx792QG9wVpm+rNIL8/gAoias6Ap5DLjqtdn4YtfZv/1N5WTbsYjEcq7Wc6o+4wkx1kVuEBynNVGlz6yXKsfEBZuv52DV3yBqj9LbWQr3ABaZaenJIKW2TVHfGitMRViyKVWWoLBWqFSJVRz3H/dtey/+up8GCbk1pKjB4idtbSRe0OilACz+z5aemvC+OeRHHKrGMgILHLv5Z9h6Yor6dWzhFDlkjCBFJRWG2bPOQu1cEzH9ERm7Og2/txKT1oOLA995Xr2XHsDdb9Hq4kYAiGFbLFs5CGlZisc8VQnwWW+VxMrbcgznXIGQ4uroNHr1+y/8gscvOXWLFYMJBliadzHUyZuPbzn/wCixWTK32xcHheyZX0M9Dash16F6og2SDFOyINO7eAC7YFD48wkYdIHeNzvpeWDXXvRhWx47ffRLA+JKtQpYKGijQr7F7n1fX9Kzinq1Eyto1+nsekH+WaKZPc4UZv0A8EKpSXldwOR6blsIpJt3aXM4kLZ9eFL6WvuB5MUCBrQECBBICBmtKIlW1qc6CTkj3K9TaaMLOgMLaTM9DIsBsL+Je78y0uzzXtJH+c1FybDkT1scpxVgb/SHWe1MdUk3pUS7froJ+CenbRVj2EwTIxgRrTcrxIsBxtHfehcuELVCmJCTwUk0cRighD6hIP3s/uvP1KOIWeQxk0TR0CMEjgVAVQiy2yZbMVVLZbsmBYdWEwgdESSmnb/fm7+1d9hfrn0unTBuxqVRXR5xOy5Z4NS5ODq3S3ubKjHWb1yRbVYONz9oUsY7DsIMQ+M1ZJJ6ASRBcGKyLEu0JzKDHaBdfcx/vrYOCMHu1YLYfdu7v3I5aUvTLCQg9uuXDSYjDOiD5Xpx/iOZalWrsfkuuQyOcvZhtawlEsNKzUqzeV03eDc2FoZvjz9Mjz+g0knJheRHe/6KWzDBhoZkgL0mixU6xjY9d4/ZHTLHcSS9dE8SvmIThJhxUZCFkd5blURO8hEFx12PcebEJL7HcdiPITx/V+44VssXPl5er1eLgmOwijm/qp8Va1Y2k8yT4oQkRWmFZBnVuW5VUoKU2sw5PehXr/m4GVX0Ozbh0koK31q/T9+E8qO4/wtcYHkOKuMThdBycq0Dbs/+FHqaEST0ssguU8lRMwSSKJOR48Ogo2QYu4tpbwnSci7rhJJjJjp9bnv8k8z2rWv/GQa76Yf7chDyLvFXenTpPxrEryYGVoCzq6YrAp96sVlbvzFf0lzzVewmRlSF4iHHGZbm2jWrWf+/LNL/8Z06d/qxOhmGmVUQIi0993HnssuZ7bXy5kiUZSAorl00kBaJaSJhTy6MmMkxSFx+t+oUaVE5xSQB5kGYpmjpc0we3tI6WU6TMA+1Ls1/ftd7D49qUioi/OcjUvLKPOCAIY7d6GaCNKbZDBFMFXauR5hblBK82zKoCEc9z/EtUWEbEiy9ilnsuXNr2W0tJgFbDEySFVA7rmbb/3vPyqv2zLM+WiGhmblHCZnEcnZn+JVMc4WHf7RFdd1c9jKJ2A6FtN3fORjsG8fEirEFCULnLy5k/KsNbK5SHZlhFrBkoGWcsbi1jj9UauOb3LOZGVHv6WbbuLez3yBIAFJk3EIjuOsLtykwXFWGYYRQt7FFiJ7vnwVzdeupzcYIGb0tGRWghAbZTQc0bZtcd86ckZFgiEWUTMqMfozAzRWhDYHukEUqgGL376dez/9Oba/+XUgSnm6I5JKiR1lwCi045xGkkAsPRNqQsiJrPH53n/D9XzrV36DQx//JIO5iBg0EqgsETRnzNrlIRvf8GoGJ24pvyfZ0W210qVnuv+YlasC917xeZpb7qBf14gEooIFhaQ0KM3CEERIKZXBsZ0jYOlNCYJNBcHd94MI1UyNVBVBc+AcJBCrmv3X5Dlam553EZ08GrvOjV1HHrrZR6eJV2SSzBCzsr7LcGWyYIyWu7kqg3su/Rhz/YqRRqoASZv8s6rIthOp1q+jSxhJcYgUObYS04dCzobm1wgCp/7MT7D3gx9neGAvM9IfH0sYDNjzpx9g4W0/yPy5ZxXnh6McW5iMDZ6ywMuZvu7f5UcP7y2MdO9DASvXQIIUW3WwhYPsu+RjhLpHCiUrpJaFZxTa4ZDlpiVapLXcR9fG0l/UHXcxBjnckbKqa+Igz+SqrDO2EHqa2PmBSznpDa8qbzgTt0GZek04jvPExgWS46w2RGhJiEWiwM6LP048eAhdt45o0Eiip5E2wJIIJ77tLQxOPIm2HXH07eQctEaJ6Kjhrr/6a3q77ifGPklyY3obYbZV7vrgR9j+5tflHehjiDwkKNJ2s5UGhCQkKBbd+bhaacAS6f4llnbex+INN7P78s+z/7JPoPv2MJidJSZoohE15TA7CNK0LG6c54J3vx0Tye5kHglNdAelRKtYJ9/xwY/SM8MkFmtvMEtUpizNreXEn3obdX9m5dyfQihmD9lqfGJQUElgNBqx84/+knr5EKI11AHRLLLqQ4vs+tClbHr+c3JmrwycDVNL56HGr10QLMWcYtrsQAxiNRmgGopNSGuJ4a13c+fln2Xvn32Auq6o2ohZgwUhmLKsIzZceAFS91ArRg8h9/8Z+Xoc1/sYS6eWCYmW+R2ns/HtP8i9/+k3sLmKugiMKvZIu/dy+2/9Hy74b7+KHoMDf3cPu/4wxUpSTag15eyN8MBOfZZnpwlhnP0xjKRQReHez3+FpetuZLbud8WyGNAzYXE0pP/8izj9uU/FUi61iypozPb1Kaw8xs6Zryv1vPcznyd96VqsX2XTlyiEFKjryKFPf56Fb93C7JlnYppF+nSG+vFq/e84zrHjAslxVhtKHp4YYPm+e7nvsiuoZgbUrdFWkocnihIONYTnPIVz/79/hTEo5UzHsjtvOdgBDi4cYN/v/imD+T6U/oFgQL/m4Oe+xIFv3MTac888pshWVJAoJEtUM4GDf/Ehrvnsl7E25fIga6haozmwQLu4zGj/Xpq9+6hSYlDNUPVnaLFx70ElkRYjmDI6OGLHu97J+gsvxJTcjG15Fk61WoXSOCAsQazkMq2FG7/BwS9+hdleTbDiLV0yB8OlBWZf+jLO/eV/Vh5k2kSjZC+7IcVFGE2LKBFh37U3snzllaV8L/9ui9Af1Oz8xKc55977iFs2gsVcVsVkptDD7cs+aZERogm3/MZ7qTdfnMs4l5fQfYdY2LOb4Z13k3buot/rZWv10KCi9LTCTEm9OU7+3leWnhwb7wc8YgkJa/JzBSNkR3d2/NQPs+cv30/avTNnskLAEsS5PnsuvowDP/lm1j7t6ageWRB0gsNM0VJuGELAeka7czfX/dNfXnGPpwVzJNI2y6x/3rM57Ye+v2SADStZx7s++FGqtkF7fVQSUUtvlCpN1ef8X/qHbLzoqUz7TWoZLHt4+eW4Z7Gcy5qLz+MrV/195ixPjw5aDDX6PezePey+5HJ2/NyZxTWxzIQSfOPEcVYJLpAcZ7UhMs4M7P3452hvuY3Y7+fSf0tjl6ahKSe/8dVgg1L+cnTTa7OUswwhN0qf+prXcP8fvB+xlmAh9yMZpDoS9t7P3Rd/lLXn/lzZMT7KYXe7+gSkDujNt7L4jW8hpgRaRnXENFJbDvZ6MTBbDWj6ikmk1TwjRUMgSAOtEoMwPLiP/mtfzRm/+K7cuxRyGZlieU7TKg+IpqoVEYy7PvxJejt3E+ZnScVxzohEMUZSs/1Nr8lroMwzgkmbzuHB5eHiyAy2vfnV3HjFp5kTiEnRKqKmaAXxlnvY+fHPccrbXjcJf4uY7RzHHi6U3IcmItn2W4WDH7gMS0Ij+bgGSahEmY9CO+hjBCwpEo1geRDpcHGBda94JZsvelYeztu9+MY5kXDUKraHTpWzNJAHMwMz27ay/Sfexl3/6j8g62rElBQClQhp736+/T/+iKf99tOO4ULZxIUw5HJDM8P6gXTfPvb8r/eV+2LfkYGOCsuHFogK/OD356+RZ3AdvONO9l/xOXr9HhVCC2O3vKZpmLnoaWx85vmIFtOOqXWU18PhmzkTgSYirHvh85k56xTsm3diVUVlAY0wDFBVgXsuvoJTf/pHkN5gbFLxeJ6L5jjO3w43aXCcVUSeTG+0Yqgpd37wQ8w1Sm2hlKSEvItKS7t1A1u/95UlKGlXNlI/GDkKztbZwLrnPZ36qWdjSy2Qy42MSCTSi5E9F19Gs3QoB9JTD5/Dkeyhlef4dD0hXZCjSK8izvQJs33S3Bpib5Z6UBP7PUJdE0LMfQsaS09DLg9TFNOKNgrLh5aRZz6Lp/7HX0fmezSkvMNOJwc7y3ApTmBdoKeT7ML4wGWlccRUKDVldD12xtIS0KvkngmQiSW0cEyugUe+2RPBkGdNZYex6Ri1GyqaPY8TgpLEisDpTqMM2UVpm4Z9F3+cus7HXVmgxdAQ0dGQ+oyz2fjy7xk3tZulLJpJ5d8rZ/6Mj0m6rxsnvvwVzJxyGk27xCi2iAkhRESEyhK73/9haKy0vmS3QpVuxTxEpVFSViZ59zAV0RZSnn4TZ2aIa2eYmZtlvl8TZyvS7IBRv58dFKH0VxXHvmaR4cZ1nPVLfw/r9TCxUh7YrZBSZii5v8+mAvEU0uRaSTrqoQcLxDLdykLup8nueFZed/lp09RjnfwjP0h48jkwHBIMqjIzrJqr2XvxZez57BcnPWSM29Ams8emzF7oZieZ5fthPWoCs7OzzMzMMDMzy8xgjpnBHIOZycfs7Cxx0Csue6Dl+PZ85JNUd95JrANJs5NmCvn1kTSw7QdeB1X9naLF7AFNFbpMV/eaqNfMsfm1ryWNGghGiglVpT9Sqn6Pha9dy74vfCVbz1vEJB3Rzc9xnCcWLpAcZ5VhGJUJCzfcxIEvXEXsz+RBqZobxyuLtAstJ7zoxcyednL5nZDL8o6ClFRBtto1Yn/Atte8nGUbkZVHAMmBXxz0aG68mfuuvCo3QYfsmjUOCi1QIai2aDxyYFIp9DXQTxWiYGKkMJ3BKAYDpVSql0D3LzDz/GfzrN/7bWZOORGAWroymhUXLDfok3fIcyNEGM9VMUL+b5n5I9PXYtoOemwdWGyfjfHQSi3iL1gsTeVGpUefO3XEe9Edfum/COT5MilQrNIDo2lVKnlAa5RuVGh37J1YCgzvuIvlb3yd0O8TTBkGo6YipsTB0YgNr3sxg/WbpkRQcRPsZtpMBaiH23539E/YzPqXv4BmqFREmlK+FTUL4oNf+jL333BT6XWxMs+rCJmHKJCmDRjMLJsahFIyhqJBCMlK+WXJiKoRkpUhuqDSEMSwZsj+Fs79Z7/A/DMvGPe1HX7Ok89LpopsehE1ZGFoAdFwlOOGRMrXiYCoMArlXlss7oP5zKKFcS9Pf90Gtr7zbWgrDEOg7Y4vVoTlZb71W78DbVPStykPHJYpa31AQ97dkNJblgfsCmo2Nsg2WfkxfoQgJNHsetcNliVizRL3ffhjWC+iCSraspEQaHSZ5rStbH3lS8bnvyJ7dIxZRBPl5Ne/hmbtGlTKMOkQIFQYNdVwiXs+cGkRgeN8IqvZ+t9xVhMukBxnldHN89h18WXUew+gvZjtcrXBYg1JGfUiG9/yatpirGACHEsGiTh2J+vsf7e8/lWEzeuh7YY4SgnQhbA8ZOeHL1/RgN0N/LSuR0Mi4YgW4wETIZENINqYg6SowPjYIyHk3oV2aZl9ssS6n/47PON9v83gtBNZLhmhYDJuwh9nI6QYFKBYUgjdYEshlIA6GBPr8TJ4kmBjS+jspNypwPwzVXmiqN0Qy+LqVua/NA+1XEx03I8xHuYZqpJNy8dfSyB0gzQ1rw3VPCS0yyJ1uRkMDn3jZuLyYnYULE9jZvRapVq3gRN+4FXfIVFyZuVIf2qyWBsHtwInveE1tPOzhGQE0Txrx2LuB9m3n10f+US2CCeXsYlpFtkP0ZY9G1EosTT0JxFaVWLKDmq9piyIEKhUiCnP0NEagim1CSFV2KERixbY8SvvYftP/mi2pebI5VkaBDShlrCYSqlaXpd6FItHJRHLwNWe5ddWLEILSVippu+uT35NJCwIp//Q98GFT6I3SlSqJFqCwfxghoVPfp5dH/tsyXTFcflpZyxh42uez6+etvq2nHfM5bkP/JHld6S1/Lrqltr9V9/A/mu+hvRjLtsLWfj11NClEZtf/iIGJ28/bJ3JA/77QV8eKPPnn8Pai56FLRwihG5qWhbAM3WP/Zd/luXdd+eNEcsbLg85S+k4zuMCF0iOs8owYHToEHsv/hh1Xee5LQYWe1TWkJol+k9+Eidc9Kxswys5iDmm4vuuD8TCeNjk/FlnMfecp9OMEkaTgwxtsKD0+5GDn/gkh+65g0iXSUmIpeIepshYmE0P5+SwrxkSFNOGQC6ViSpIa0irpOESw4MLLI8S8aLncOHv/CYX/MdfoV0/j4wStYbJIEjrRI2Mr1d3TtnVTLHYgDQIikpLCi1gBE05UJc8c0ZUxoJvXF5XgvkkKZeWFWEUaFHNZW4hMSnZ+q7vcyhlVgYxMSrPJ7QgDSoJ03wOAcMi4xk9Vjb5u6sgljCBQ1dfT5itS3YlElN+7OFoxNyzn86mC54MljNtf5vd/GmWgY3f8yxmnnQ2o7bBrKGRhEqiAmZ6NfsuuZThofvzc5liEh6WwDXH8sVtUZQo2T1Ro2GWGFUJpQVrMUlIzEI8tjmd2IwWWVxepH3yeZz33v/EWe/6cdJRhFtXlhZUiZKyqKGIZcnnhh25xC5IXpdt3TBimVbanO0JLZUMqdI434OULkMRw1Sp5tey46ffyZCUDUwEgibaALPLDd/+H/8LlhenbPhzWWNlEVEjihFpISjJWgJtca1rSCGVoc3Tw3UnH9FSnoUWSrY15azXPe+/hN6B/fQ1i/vKIpYSSRKpP8dJb/jelfftu1hnSkRCYOsbX00jNYlEXvEtRkuvFprb7mD3xz45LiVsOZZOTMdxngi4SYPjrDISwq5LruS+L13DmkpgtERrIFYRMBaXRpz+htcS59ciLVDljAdybKHBiuGZWV1w4htfyzV/9SnWjoYkCdSWaBF6Jizv+TZ3/fmlPOkf/FQujwuR8fT6lBguLFMfWIB+XZ7h8H0dxUyIYiQz6FcYgeUYSYOKsHaGuRPPYu0zn8LmV7yCE174XEKvJiEMFLRXdtrp5tIcVgJFDgmDgKkyOtAg+5epoo7HxBiJhcWWYTPKR6SaSxJlkpHKvTJCKCVvw4XE0v4FBqnr4xkRtIcNF1lePITYMjD4ru9zaQvJ59QoLDQM9y7RmzUasoBUEYbLS/QW8wDWRvI8n9zeU4ZvkoqDINz76S/DQkIZsmBDkFwKeH9jPP0t34uEAJrgIYi7QIv0a7Z8/8u59Yq/oT+okBhQCzSiiAqLX7qWey/5DCf/4OuhK6+Tbi7Sdx/AppRYOrDITC2MQsxljkEY5vTbJANjeUBp9i4RmrpC+xUz553NqT/+dk75/tfQ27ARgMoU4gNfj07SmRlLS0uk/QvInBA0kWiQAKODS6Sl5SPaS5sZo0PLsHeRthrQAtGgrWHpYGLUNmU9SBFbEajGJYnb3/Rqvv6rv4bddR+Y0AhUrWEhsfCxT/HNP/przvmptxe/cykbAEodIC2PWNo/ot8u5kyXGKZDQnlttPLgmeegxnBhmWYxv26IgeU77uDW/3sJc0NjlJYwAkuS12K7uEj/pS9k43OfRhaRD22Pt5XEtpc9n5tP3Ea6+Xa0X2M0JIHGAmm55c7f/zAnveUtxH6PysqmgWskx3nC4wLJcVYdSli/jtP/7S9RDyLJsoVzVDBtSRI49QfemDMp0UjkuUbHFBOUvm0JMm7qDiS2vuxFDP/9PyeOFmlixEQJRJK1rG9aBqeeTLJsP26llAWD2J/hlF/4afT+vYSq96BPG0VIJqQYGczPM5ibpV63Htm8nt6WDazZsJE0PyBPzolYa0QBjZazJ0FWuPt1AoEwCb5VFeZmOfmf/iwcWsRiGJcSmiipUdY9tziVhZh3zW2lb1sopW3J4MS3fz/Lz7mQUFfFPCGB9Ug6hM3rCVLzUBgH1GY0BLb91Fs59PKLiL0IEomWh+/qaEh1ynZIgZgbejA0ix0gm0cIqolNb3kV1Su/hySBZEKsDBphfT3Dhpe/hFzu+NCcvqo2kgKc/P3fR9NEYjkMEaONmjOCy4ps3FAMIIr5AN1MrO/+uefOP5sdv/4eJCoh9KgUWlLuDbIszVO530Gys53Giv7mjazZdgLzT7mAet1aLGYhkocWhyN6IXb3afuPv53m1a+AKubeO0Luv2uUDRc984jHrWtmOOmXfoZ26RASelRdPxSGjhrWPvPJ3QrMIrKYnkjpH6Lf5+x/+89Zvn0nVcx9QW2EKEq73BDXrkNTg4Sq82EhSh4oveY1r+CUbVuQepCFYwh5PhSlpFYf/IYElOFwyLqnXZgdJA2GTcuOn/lRBpJnE6FGE3Of4XA5sfG5TyP0B7SEhxTA5HlXkeqEzZz1q/+UhZtvo+pXk9eN5vLGUT1Ds3SQ2N9EK3m4reM4T3z8le44j0HMjo9dkplhmod0JskBew7yU3Fgy9FoN7iyKv0r01bKR38SxlmTXK7W5sBqPHG0fF9XOvEmJQfDlntB8hBQmQSXR3hunZqv051n7qPpRE7Oaoxn+mjXi6H56+V8pWS8OsM8lSyglDLE0iQPrLWJEBifVrmWqrncSWLJPCFjsdVdWyn34PBLOrHTVlQD4aEa2VlCiDRATZoa1rnygQ1FGoFaJqKjZIGsdDKhlofqdnOuxtaDObDNuZuHPkTTzNCUB37W3zEAdvJ8bRGVUarx743LJL/b56YrJ8yFaFO37QGPs3Mt7NZLEiMiLAP9kim00M3kCQ/4fHTmHjHflzQugyursuuL67JkD0BLoiJOLtTUgdu4LDWUEsoVF5Scgc0bB+PZTOX1go792dHpganltYEKIXTnkV9b0/blR3PJH88sMkhqxHjYDe+O47DHa8cW/A/hBWItahVmDTHWU9cqfMd7ndKQDciPW1fCS4ErjteDO47zt8d7kBxntRGlBLPNZC5N6bERFElQYVQq2Xht2qjhKBhagrnsgibFGIBi/atji+wEIQdmY1EQrARE2ZI7B4ilMfooNsdh7C6VP7pA2YKgdCVFRRAS6Op/OhEQND+GyFTGp8ztURJikj/EpsSaFgc1coA7FpqpiKMp0Za9gnNIZ0YIWiyT07jnKbetNzlYNH3I4qgLPhGlGsedYez8Ng6cu1Rfnbsv8kDYrmE+X69AyYSYTHp9xv9RjESQ7Lr3ULW9iCCVUYvmAL17OJ0cv5GoTAhS0ZIFhkrpZ3kozw0Y2TnO0Bzwm071AJW8zNQ5dsLNSCVDqAzQIiy6C3+EmymCxJCPXfNKDVoMPSw/xtHc+arO5c7KFQi5Z8oA0VDOK6+wvOEx6efrNkW0mHdnoRfRMjCZYtASQhgbp2BWXi+WxYN1s8OEFcuje508yMe4R04gxM71sSnHk2hyTrPc8+7ap/x7+hCFOBEJEGKdz1UNszAeKaDdalIjaB6KPDkOx3Ge6HgGyXEegxyvDJLjOI7zmMMzSI7zGMMzSI7jOI7jOI7jOAUXSI7jOI7jOI7jOAUXSI7jOI7jOI7jOAUXSI7jOI7jOI7jOAUXSI7jOI7jOI7jOAUXSI7jOI7jOI7jOAUXSI6zyjCbzKpxL3Hn0WEyh+dY6ObP+Awa5xFjxZujPvCXHcd5wlI92gfgOM4jjICUiY8yHuTYDan3PRPnodAFkkdbRw/2/bwKD/+SIIwnFfv0PucRwLpBywAEzLTMzfX3SMdZDfgr3XFWGTL1jzy7XoDgf/idh4FQPpS/dZZo6qcnc5IVRPOi7T4c55FASpa9W4tS1ra1j/aROY7zCOAZJMdZRXR/7EUMU0VCKF8HEY8+nQdnurRIUI68v/Zg3+uylQFhWgiV9VeyRNJ9Wb4b0f5Aoqx7HOOhFUkd7Xi8BPCJghAm2Uu1vCglYETX6Y6zCnCB5DirDCEHqF2sJwBiLpKcI7JyZXTCuhPcR183+WcFEUHUJo8ZhCwsjMnDhMNKnDoUMzni89mUiMlr/fCzOJ5r3LOwTxQEMFGUvL6zaFfkuxLtjuM83nCB5DirjoQpEOJkdzRILrkzb0FeLTwUMTw2SyjBotIJnu4xW4SAmSESVzynWVlvdH0eFCk0JZpEwYRxdVPXmmQCokcU893O/+RzwNe187dFspiOIqi2SMjrGWkQ6kf76BzHOc64QHKcVYSZoVTEAKhhAQg5rM1BqGeQnMy4yu0Bvnd4v9p3Znqqwx5l4rGgIgSzUlJHaXz/zszOCgOR7lsSECJHQnNdFDJ9VNIJMsc5VrSIfAhEzBIiAXNx5DirAhdIjrPKMJS7P/0FDn7tOmI/kgSidaVJ3kPhdBwmgqbURdSAqqI6ZX9shqp+R9mdhKyCLBqxDkgVIBixqrBgSC+gQbEAazeuY279AAlGXUv+fhSkFrBAqCJalzK98kGw3Flkk6Z6MUPNsNQdTye03OnBOTZqE4Y0NHGG+bUXYPUJQFNWj5fZOc4THRdIjrOKCCEgauz74Ee5+z//Dr3ZvvcdPUYx6cwQIKf6HoiAWSr/AhPDJJRsoCLahXMRA1JQsFRMOuLUo+Tn0JK1iZIwzTvlqoqpQjKSKalKWK1Ugx5xNhJnA/V8TTVXE2d71DM1ugb68336czXVfEWcD0ivJsRArGsiQqgBqenVRUjN9/j6b3+dxav2YLElVj0kBqQSYh1IEoh1hfSE3lyfej4S1/QIsxGZC/TX9qhmIvWcUM/W1GsGhNlINaiQusp9dsGKkGsRNSyBFGGlQLSAxpSzBdSIBlQMglEuDlElX+dg5foDGFEFDdl+IpVcVehKBCWQ0PHn5aFWfB48vfWYohWlQtHeZvS8JyFiXlrnOKsIF0iOs9oIUPV7DObnGMwPpgJj57GJTGVlJl/L/0mHiadSSiYQU0uKpWdHImZCVWrVKi1ZHRosGMmAFBE12jaRJGSR0jd66/vUJwzobRgwt3WOuW1riCf2GKyZoV47oDdfE3qGVQoRJAqEkA+2ZHHGx92JEQHRlEVKKKIuwtr5eZb2LhFjzvwkAojSYogqiZbWGhbDAqrZblkt29RXVY0IaBDoK2GNEedr6rV96g19Bhv7zG+bY/akeXqbZqk39qjWkDNaZgTLo2jDiFx+KorVLZWBaA+LAQsJaDGpEALRrPSlhFKmml3yKgkrMmmGUtlhgnQKz0c8CtiRr7owIjCVqXQcZ1XhAslxVh2S+45i3pVfWXHkgcBjknJbbMX9MSzEFcYawSy7EaM0sUKC5s81d+RENVQgiWBtS6NKshapjcF8TdzQZ7B9HXOnrGHdqbNUJ88zu22Wek6ItUBdTD06FztVVEckcgbEkqGtYdL9aVEQm2RHxs1EWUC0AqL5sWKrJAGri9CyMlFJAsEgkLOfEnqYGZFeCVxlcj0sUZuhyxFbArunZWgNy3aQfaZYDIRaCDPQ39RncNI8M6fNMnv6LPPb1jDYUtObH8BszKYlWqNtIkRDtMEIaDk3MUWzxRl57nKe1xQsC6VgOaOHlAI/OXKKyDNIjzCSjvxtixQ3m2wK8kBDjB3HecLiAslxViMm6AM6e3mU9lhBrOuZmR6hGpiYVyuiECRnUMwMTEhCcZczqlYQqVE1UmpZtgTSIv1IOL1i/SlbWHv2BmZPn2d26wz9LTXV2ggxkSwSFWiUhNGaIMstgiIWV5g4qEDqPhMhmE4EgRWRJhErQWZueC+G81YhkkhtIPUhpUQIFZJrDMfVbWpFMSHlv1oyNlO23hJRIhbzkFqJeQCyGMTQoiQUQZYrRrc3LN+ym/s+rYQQqPoVbOzR3zpgcEqfNWdsZN2ODcxunyOuBwYNkqBq6tzbJG1RNV3PE0QCZprd+USAiKVEFDlsjlS5NI/2InOOwGFry8WR46wqXCA5zmqjK/2hxLBBSmP71Aa/86hj0mkMwVbMXunC6iyWzEDFMClu7Wr5R4bK0JSml4hrobd1lvVnrGfj2etYe8YaZrfOEdcNoNdiJEQTJMVGYJZFjkmeTzQx8xZUaoyUszplPkwoa2cc8I/FkWAWQGJZdp09eBYMUUCsBYG0rFRSFWvwUMRUGSlrlnuBugVqAnJYaWj3vZDKPNgwESJiJIsEKioEE8FioKorelbMJhTC7hHLdw1ZuErZHW8nzgb6m2eZ3bGOdWdtYPa8edZsm6O/cQ6p62xH3rZo21IJqCVEqnKttPStCKaCFDOJB+I75zU5jz6lN85L7BxnVeICyXFWG2Xe0bTrl/MYRRJYRDSWXqKSOZIICCqJoEadIkkC7XCIxhHVbEX/zFnWnLeedResZX7HGgabZonz/WxZqErSBm0XCUu5RyZrsVD6eBJBJ7OKVCCSxZBZGvfTGGWYZldaRtZGreWsDNINf835JSv23mKlYKn0KYlAe2hI7AuW8s+qGMEULRmgCsk9QpKYZMwOE46iUEr2CJPhtCDEqQxAJGUBlnJvFhIgBkyMGIUagdSH5UB7O+z79l4OXH4f2lNkszA4fZY1Z61j/XmbWXvmZvqbZqGnxFGLNm0ZoSNZwIkRyQL2gcwZpj93HkMUwd29V7pEcpzVhQskx1mFdLui0xkjzx49OhzemjKZFzSxyh471Vmxqy5mADaKtKmhZQGZgTXPWseJLzmT9Wdvpn/yPHFOICgpKdYYOhqiITuuSRnOamKYlWZ0cl9RkIjRFjETsg28GSJGFLCuf6P04HQBfjkqokQovzOuUjLJM4ws/75p7o0yBAkVywcWsF7M55yEEHLpYM6gMR4Uq9or2RgbX7xxJskinXQzy8KuS80EbHyt1cqfPkmlHC5MJbeUpIrEKmeAtKVfVQgVRovuFoZ3L7L02QPs7u+k2hiZP2eONU/ewgkXbWH2tLmcGhslJAWMhFoiWITQCUkt97PcZ/MM0mMNk9LP5xkkx1mVuEBynNXGikgsNyH7Tvajx+HCtLsXBgTNvUS57ycAndNci6YRwxMq5s/ZwNYLN7PxvHWsO2c9NmtEVZo0Ig6ziYOEVMrlAlWbkyySpUEup+uExniAa4tIhamNvyciJDGiTfpppGQjERlnh3LmZnIOMrUTH0Qx0yyWAqCBFBOgtAdaYgXWM1pJ5BxZi5U/U6rl8aXJZXtTBOvc4hIphPE6jpqPYlp05n835WdCLuETzZkkKGIx5lfGuHeKLBgNtJeo6gEhGWZKus/Y/5kD7P30/dz5V3ey4ekb2PDU9Wy4YC2D7XPZYnwYJq57Ze4Y2DjZZQ+0EJxHlekM+ySDlF9DjuM88XGB5DirkEksFsZuYc7xY9JLVHqFtMveTXq/8vwizeVYJWUSyGJDJNKmliYl4kxF/9w+G593Kic+Zwtz29djsyDawGgIS4FkQgyGSkuuqZScwYCpoLzrsbApwdPZh+ehwSIr9XSwlWYD+bRk5e9OBfrTO+/SGRWUfiozRYMi5Plcw3uXCYMK6ymSFCxg1KXULmeU7DBThmm6702L/MM1x7jvbuoxTHhAcRIeIKeTAogFkhkpkG2gEeoQqEWR+xL3X7qb3R+/C9kU2fjULZxw0VY2PXkT9dY+gUTShpTyGghTc5mzkKX0bRXR2glBaTCrSKJUXajelSsWoes8vEhZ/OMsLt0r0nGc1YALJMdxnOOIFbERSpZCTHKJmihJK0SESCrtMwFTJYqgaoxkRBrlWT39HX02Pmsj277nZNaeuRbWgbUKo4awAFgghYjGFlDiY3i4lZkwqZoLYMLw/kXmtsxT9XvIIWEs24qQfCxYLE/E1wMfT6qEKlbZCmIPHPzobu698i56WwdsesZmtn7PSax50lrq9TVqijVK0hFSXPvyWWt2JgyCplSeJWKSqDq7jC5bR3Zd9wowx3GchxcXSI7jOMeRoIqJ0JoRss0ASMy9PZCHqRKz71nTItGwtTCzfQ2bzz+FtResZf7kisHGATbTA1XQEbpgWBDELPfkSAITYiLb2T2GGc+UKc03poHFOw6y7pT19DYNaO4fUlXVZL5QNyz30dZJ097mUxmmnIDK5ZA5S6ZoBVU1YJ4edo+y90P3su/i3VRrIr2T5pg9Zy3rn7yW+TPXMthSIT0tpYlZHIsWN7/xDJ7QWWmMFVHuw3ps32vHcZzHIy6QHMdxjjNanNe6ga1qRpBAIw2igVGbiHPK5gvXsvFlp7PhmVvpbYTULBCbimSBFARpW4JqGU4qBA1FY6T8uFi23lZ4DCeQEDFaAiFYdstrjMU7DyJ1zWDbLMOblkpJnhKmS/aYyiw9Kgd+5G93xuJGGDv0mYBFobYaM7AFWLp5geUbF7n3/97FcDBkzY51bH3pSWx+wYnMbp0vPV3L2Sqc3BOG1ChWSuxKiZ+5wYPjOM7xwAWS4zjOccRkujRL0Jib+9vlFg2J3ol9TnvBSZzw8q3MnL0OatBmiTQ0QookTWiVrQpykijkAFwT0GYXtFJ61c0jyhOLHsMKqbs2ZlgUbKGlPZAgCPWmGtU0yZZQDCIw4mPQkn7ahVAlz20SCSR0POg2pFBsvg2lobIeFVANGiIDRt9c4pZv3MTtf3krmy7awLaXbmfuvM1UcwGWh5gOEBoisTgaGsGyLI6Pg/vsOI7zeMMFkuM4znEkIKgKGskKZ0kZzrSsv3ADW192MhufdwL1iUJIQtM00Gqx4e5h0mKVEa1YRseKVIa6hlBh1vWo5EySSnGIm0yZBSaJj8eKvFCD2DlAiNAcbEiHFAlGb2MPlQYYjI8+O+U9No3eVl7qSApKVCWGLJKya10x48CopQ+0pEpodUAtEGqjMiPc33DfB3ey62P3Mn/eGra/7BQ2X3QS9RbQFAjDhElEEWISgmi+547jOM7Digskx3Gc40ieVarQKqOmYe2Fmzn3R85i7VM2EeaUsNSii4lGlGgBqNCgBIYokU78tBVgqfSmCFgqJVjZBMKk9KqEzpY4Z5WmNcXUWKBH95oEISbDAkiIDBcWaBYSIsrcxlmqaupPk+ZZTY/lXpuxcLOUy+yCYKaIpTJvLN+LygKmCQmTuVJKFlAaFKVHvzegSomFaxe48WtXMzjlG2x50cmc8vod1Cf1SM0SoQkYVbZu72wQHcdxnIcNF0iO4zhHQYsVdLCQs0AFC2XIKtmiGxQlEg1SyEJGlxraMKJ31oBTXnwGp75mB9UmQ5tlZGHiOxDHs320lOTFLHGKtfbYEvqItsPFmnhKFj0WBNHhRCIqDYYSEUZ7h0hjCInelh4p1NQoUQOjYFTF+hpyL9djlclg3252VFzx/U7o2Tjvl38uhfyZCDQxr6+aihgquDOx+/dv474v3cuOt53NpmdvJK4J2GLDirSaClppWaegwQiJlTOq4Dv+PX3cjuM4TsYFkuM4zhGI2jURpZyhEZkMkdRAFLCkhBBoVQlVoDWQpmHJhsw/aQ2nfv9TOOH52+itNXQ0xJZXTq55LIqY44lqS5CQxZ7A0r4lSNn+u79ultgTbKRojGPDOBNZ0e/zRMTMpuRfmZVVR0ItjG5a5Ppf+yIzZ6/l1NedxbYXn4TMK+2oJSZDK0Osh+gQiSApEtDsATglkg4XQy6OHMdxvhMXSI7jOEcgFYcFC5GkSpVdpxEReslog4LUiCZiFGxZoFmgOi9yxuvP5qSX7aC3RknNAmlJCCJoKY17gsf7R2T63Jd3D5HWQAPVmoqwtoJ7U7a7jrkw0MwIFp6w1WRZh3ci0EASBqgEjEivEgbWJ12X+OaNV3PbZbex4/XncOLzt8BsC8OWmIYQskDPoj5gGpCprOcKxLphVI/26TuO4zymcIHkOI5zBFSgMkHbnB1KyjhrlKiIKrSVMmoS7WJD/zTj1NefyZZXncZgYw3LIxiChkSo6pwpkUDQCpP20T69R4UgZdgpgimkPW3uNUIZzPVhraC7jJ4ILWTjA6rS0PXEJBYL84lWiYhAJGeWVAQRCP2GXhzQfuUAN1/3Oe5+2omc+uYnsfmZG2BmmTRUggWCKhom4mg6UzTOJhFWX/rScRznGHCB5DiOcwSCKZoqQoy5NMxy5sdCS4XSElleXsK21pz+mrPZ9r0n0TsxIE0iLRoaBZIgoc621tlHgVaaI1o0P1YMFY4XIhEVJSSl2btMCGWK0MCo1kZS2yCVIKpj0fBETnR0osWmROC4R8hAgRQEq3uYBnpzs2jbY+nL+/n6NV9i5rkb2PEDZ7HpqZtQlkht7pEL1mWnnuAX0HEc52HEBZLjOM4RiWjVogSwSAzZlA6rOaiHCDORra85hTPedBb9HT1SSuhSnltEaKmIpGhUbcRESVGQBPEo8ueJLI66DiwRgWVjtG8525ZjUMGazXPczzKtFCsKC6glQggrBMQTjXxqnTROZdhvAIRoCmq0GonSIkSs7kEV6SmMPnUf133lPta/aBvn/PCZzJw+gzaGmpLNLVYaNKgwcUR0HMdxVuACyXEc54gYwSIhGVQtqkpYqlmqR6x92kbOeNv5bHjGicAiujwi0mUCIsmMSgNRUhZHQn4cgTL69NE+uUcNQSFG0mJLezDPdQKgEnrr+6SUQCKhZD2iBPQJLI4y0+cXi1Vh7kfSbCBOjWEieQZWUiQG1ARbG5gZ1hz68N1c9dW7OOkNZ3D6951NXBNIQ83ljGQrRAsTgXp41spxHMdxgeQ4jnNUKk20VUujFToUBjuUJ/3QWWx72ZnYjNCM7kdEiCbouGxOqSyi0hIItNJSUecQ2DQHvKt+895YOrDIaGkIZeYTBrMb12AxIDqZf9QNi109FEe7YvluubATs/wd7b6qIBFoKpoK+rPzpN0jbv0/32L353Zz+lvOYsuLTgAEsSZnjMpwWUUILo4cx3G+AxdIjuM84ZFiEz3ZoR9P9hx/rpIIFnOdkwDSgtV5Fk9s0YWKtD5x6hu3s+Z7NrLlWafStoeolpQqBFQNxZCgiAWSZJvlzq0uWikhk/x8qyrWfxBCBN0LLJaBpyQwmNnSR3sNgZokeQ5SIpeVrU4mtvBWfM/D1L+Nhqg9KhOGsSX2ArPMYl8d8o1DX+f+b97PaS/cRv+CDdhQCW3KTUmS0HBYf5IZIqAYYZU7LTqOs3p57E7ccxzHeZjoAkkxQSyLIV0x8DU7f2mxPc7jSyOxFUbW0A5b5p+9jqf9/57NGf/gAkap4e7PfpuqqmlijTIihoCIkKzCBKIpQvquj/mJjgGEiuX7FwkpEkLnqGbI+oj0JiYFqkoQYZWlkI4ZlRoNQistEhIpKFhCtow4/YWnsuf9d/PV93yBW/7gRnRohEEAa7GQ++FIU71dIqhRhL2HCI7jrE783c9xnFVBziIZqTh7RY3kgFsJKSBWhsIaVBgpwahZQjYaO959Lk/5fy9k/bkzsDjkxLNP4I5P3cTyt4fUFYRQkTSAGFIlsLqUQXlA/6AUA4bl+5ahySVf2fZbqTbWxEEss48EE0VESgeNczgxQQqJIEZIkSpFltpFTnrrk1k+MCIsDWGx4pb33sJX3/NF9lx1kDAzS6QMjo0KUkSSJEIpwcNWpw294ziOCyTHcVYNKgooYrF8nodpBsuN7ylGAi2jobIUhqx55Uae9uvP5+S3nobFFl02zCLVhgFbnnQS1/3Ol6EFrI+IFWewSKIhIIhXMT8I5U9PgtHeEVAMA8hZo2ptTX+uRlWzR4FETFf7aN0jECQPMLaIaKRZXmbzi7ex/lnb2fW5u6nqeUJtzPYrmuvu57p//Xlu/M1v0O6NhJkeGiSXllYCVtNS5SpTX7+O46xSXCA5jrMKEEyyXXTOHEEKDdASVYqdciLqiKFGwg548j95Gk/+58+kPqtCDw0JywNEhJYF2qbhtJecwfJtB7n5fTci/YjRElPENEJUDN99PxIigjbG4n0LlFuClT6Y3qCmXjfATEvpl2ePjkYKShON1AypTqt40t97Ovd+5tvYHrDKCG1FpQOY6THb1tz7Z7fw5X9xJTs/cTeVzRBqiG0WqHloLaToJaKO46xOXCA5jrMKyD1HUnpcUkgEq6lTnyZAK3nmjLWJ2XNmeca/fwFbX7kVaxvqJSOGgNaHSALCgJgScVPFaa86j1v/4Cbu+/zdyNwAEwjFKawNgIf1D0K+LqERmvuWCAGSGYjlsroYqTcOVszt8Xk9D46ZEjVAazSzI87++acRK+XuT9zCTJjBtKWtA21MiAY0VNSzNc23R3zj/7mea/6/L9Es9FATRCz3LwFB/Zo7jrM6cYHkOM4qIBIs5jK6kIPzqNk1zeISlQ6wRWG4SXnSPzyPavMSaWmJYGCSUFo6008Row0Gw5YTXryduHmGr/+3a1m8bYQN6jzWs4VKBTF/i31ASjmiLiX0QCJKvrZZYAJVJJzYyzbfZKdvv5JHQmmthzRDTn3LDja9eCt3f/QO5I4G67dEq4jJqNoRIQhKoCXQ6w3o02P/R/Zwy/+5HpnvRGle97hAchxnleJ/cxzHWQXkGTIqRrBAnSJNVEZVS6+ZYXm0hDy15hm/chEzO2aolvoEAkgiiYBFsNIDo4mQQFNL7/Q+J770ZIbfXuaW37qWsBhoe2AxzztSd7F7EBQJgaVDI+xQKsNgA3nOj2HRqDf1gSyazBJGctOLB0EskJr9DF64mR0/ej66c8jOj96O1DMkEhBIwWhDj0SitiFRQna0F4hzfe69+E7u+OObiHEWrQJYjQTv+XIcZ3XiAslxnMc9YkISmJS05RbzhE02waVFCIhGwKgwqlRzsF1m82u38uxffj7z585C22azhSKMuixGtPLwpU9GQ0C04dSXnUq1pWbflbu45S9uooozYC0qIVtTi+XZMmRDCM1OBI/2JXtUMRNCBNvfYAcEC5JHn1okWEBIDDbWUEdQI1CVqTyrmOklYxEJDZCHvTZNQ9xR8+SfuQDmjF2f3c3ybYeoejUisZSUUpwDA02oEFPAsiW9Qm0Dbv6dG7nuP3wVu69H6PWzyJ/SpCp5/QaEFCCt6hviOM4TGX97cxzncY9JojbBLOQeCnKZUMSIKSIoSoWYYUFpKkGXeox6S5z1rnN48j+6kLiugYUGTJBgjDSVoZk5QjSK01r5MDNSSsyfuZ71z92OpMCdf3oju754LzJTgTSo5dlLiKAYZomoChJZ9ZvzFlg8sETbtozbi8TGgnJ+wzwaU7H31nIfVu9FGw+K1UCKDQ01Epo8z3ignPf3nkn/tEh7oGHnx+4kaB8wpJ30wQWbfEyjGCko/XrAro/fxRd++Ur237iXMNsnUtOKoCERLSFqWDAqteyc5ziO8wTEPTwdx3n8Y2E838isJHnyJFKQBkSIKaAiJF2kv6XHprdtZ9srT6V3gmHtIZIEYsw764oRgnxHD4bB2DggIqCG1oc4+0fO4Zqb99LcscxNv/xV2p94EtvecDIalzGtwBTohFUO+E0UWXV7VHkQr1gACRy87QDW5pI6tSxIW0mERuifMENcF9B9isRVn3QjFcGPKEEjVQo0SWEHnP8Lz2D9BethGLjlz2/g4NW76A/mMdU8DPYoj23BiCkQEep+QL/Rct0//jLzz9zISa87iU0XbkaqUBKokdaUIIYkbw5zHOeJib+1OY7zuMeiEJDcrxICqrm3QkJCQ0VCWNYlluJ+TnrbDp71Oy9nx4+cSm9dS2gSppJdwDCSQBAQS2ig2ExPONxVrUkwe/qAs99+LmKRuo3c+N+/xi1/dCOhvwbKkFMLgoYsEIIZwVbh/tR0pK7C6M4losR8LUMWkMEgJOiv7xM3dCWOgkhY1U52wSCFgFiNSUOTDsCpkWf8+vPY8JQNhNCy7+t72fnHtzIIcznjGY7VID1gAdpgtFahVaTXwvDzh7jhPVfz1X/9NyzcEZGZGYRRNjjRGonx0b4sjuM4xwUXSI7jPO4RtZLZCZglqiCg0JJyKdzyCNlSceE/eTY7fuos2t4StlQRQkRjRGOLimIo0XL/klAR1B40KDfLz9lLPdrRImsvOoHqSTOkIfTreXb98W3s+/TdhEEPNSu9NQHM8oyZsArrk8b9WwZNotkzHCfpgpVEGyHfy4HQ2zhAVbMFu9mqzyJpsf7oDwNLa5Vz3/00BicGLIGKsPvS24gHa0YRkhghdeYXRyZqHqLcSgOSEDM09GjqlkGvz/IXGq7611ew95O7iIN52r5iIrTms74cx3li4gLJcZzHPXm+US55CwaJlLM0oz7D4ZCZCwc881cvYtPLN2HLDaExRBJGyBkKq4FAQFAp1l5m4wGm03TCCHIWqZWGqJF6DZz68pNoaBgQiWmG63/7apZuhdDvY5YgARLzjJnV2k9jghBIyw2jfctIqFZk5USynYVVMLtlDaYJIWCm5T6vTlSgUlAZcdAOcNZbn8rG527Bhi0SYfHWht2fv5eqFwmSV7NKZ15yZFJQokHPekQk26onRajQEIgzgtwTuO7XvsYt7/0msRkQaiUSs127uCO44zhPLFwgOY7zuMeKWVxTNUAElJYRrS5x4uu2cOGvvIy5HbO0y4mEEUQQRoCO7bujljk8CEaby70Oi/qESRDfERHUDFply4u30d82w7BtkJ4gdwrX/Y8vwoJAlYgGRqn/s9UbUYYQaJca2oWWEMJYcJrZONgOldBbOxj/jps0kDOkSy3rX34Sp71pBzY8mEtCq8juy2/B9hpaC1UL0QxClxE9ChbB4thSXSRgIRC0JViLmDATesxoxV2/fzPX/frXaHcDvZVloi6SHMd5ouACyXGcxwViUsrgZOpzyKGj0gbotwERpRr1GSZl60+eyXn/4OmE2QVGo2XMLAfkQGIqPWSCiU5Ei8UHDMUf6GsasuAaaUt9Yo8tL9tGasFI9Ho9Fj57gG/92TcI9QypArppPk/gdEiXZRs7r6G5rI58tywKo/uNZnFEEAVRWgSCInlsD0pgZktNioJYi0nAntA9SLnkMpSrZpb74bSzrxchLQ4JZ83zpHc+jdTfD2pUMTDcrez5xL1UVQUIFjWblZgcU99WwDDpMqM5W6do+U4kmDGKSuobsd/jwOX38bVf/Syju4dUvSr3jakRtSqzw0r5qBkq4zNCxUMOx3EeH/i7leM4jw8CBAsYRpAc0IkYYt2cohJQNoGluMDpP3M2Z739LNRGiBqR7DzXzTV6uKiSYAR6KqQGtr78BMKmiKUKk8Rcr+buv7iZfZ/cQ+zVYOSMk8mKcr0nGtOBeWe+AFlkhhBo9jek5QTk6yddVq0E6iEl4qY5qAWxgJjxRNZHYoEs9EupaICYoCYCgZhgeW3DWe86n5ltfeJyH7UAdWTPFXdyaOchqhBRoJH8WhAD9KH1ulmZdxQQeqNeLseb7aHXwtW//DkWbx0i/RnaAKIRoZczr2IQINr/n73/jrPsuu57we9ae58bKnTOAWjkDBAAQYJBlKhAybJsSbblZ48tOUgaP8svOOiNX5hnv89zmLE99ozHz5JsS9bYCrRkW5Y0iiRFURIVSIoACIDIQKMzOsequvecvdd6f+xzb1UjNcgG0Ol88QFQXX2r7rn7nLq111m/9ftZG9OsBLcVNwa67UdHR8flS/cO1dHRcUWQ3FCkSIdcAUFM2qBLLW5oTUWtC+z6a7ey68/cCE2DmoPRyuraDsbbWJQkVYRip+zZmL1xhvUf2MC4Xix/HyE0fZ78t59n4eUGqQKThIVXy/WuNqar7K+VFDbHlwipdbBDSvxR+3etlQO9tQO8artR7uSrXGJnBEK2VnZYLLRzK3lrrOH2P3cH6x5eD+MRpo5EIZ92Dn5qHz0pcsTgEEJA3Nplv7gCqeQeSVn/0FC15iU646TnEo/+/d/lzDML9HoVpiOSlMerW6tgLV0p8fbj6XVwDZqUdHR0XDF0BVJHR8cVQZRAQ5HYNT7pHBWHs0YDNm5Y6p/l5r9xD9d/x03YkiGu09yilbydhUnpjPhyN8iVbR/bRV5lJC/dkhD7sD/z7L98BEkB11ysxF91HFdLN+mCayvC0tElLE020OWX0WTGS03IOIP5ijjTysaEqzpc1zURWrORprR+2g6pkDGqnQM2/4kbkMWabI5pg1aBE58/wrmXzhZ5neTiBpiN0MrZLlbWpq2RibjjaAljDoq5E/s99EV46h/8LmefXERnItEygUBGUFUmzSTEV8wo6QWzmTo6OjouJV2B1NHRcUWg2ds8IRA1XBOmAScQmprxXMPtf+s9bP/W62BpCZEl0vQxpTthrcX2hLenIDGytrMirniTWH3HGjbesx4dZTRDTEK/Ws25L5zk5JPHy1fl5VmTCVdzN+k83BmdSG2BODk7bXbVJODXnP5cpDcf8Wth+t8jLk5Wp3LBCIgrQYy85Gz+5h1If4T7pLiuYBzY/8k9VKnCvcwpuU48EjMAepFmINmtOOJROlkmjnsieq90b4cDfK/zhX/4+xz/wlkYBJBMyH0acdQCOWRcnJDbuT+52nuBHR0dVzpdgdTR0XFFkLVYeIuVWST1Cs2RMBbqucRd/7cH2fKxrdj4LB4Ezz0AZEVWy+t1ki4WoQSbujjBDcuODcds+9YbaHpCo5B7DUam6g05+KsHiP0BpmF5mP1aQRxRsDGMTyyhKq18bjnnyLwUmyGDzwR0lbZzNFd3kWRICXVVxyhSOXfIOWOrM5s/sh5fAtxwMULoc/KJE5z70nEqrcrNgyxkK86KE0fAi3b+C1L6thJoaIguKJFxqEv4sRky06c6JDz9j/6AU797Gu/3oJewtsOrTulATV07ru5z2dHRceXTFUgdHR1XBLl183LRspk0SM0S9aZF7v6/v4/1H9lEGo3J0ifZJE8noPrOvs355Njci8SJCkaLrH7vFubumqFuxoASg1ChnPrCKRZ3nyVWEwnUpV7Zd57J7BeAq6ONUJ+o0XYDDcvFqqkTaCulvlKt75M8le7SVdxhU4qRAV66LFkbhMDYRuz8CzdQba7IqiBKDhH3wOFf2YMsRgjtdaSCaFk70XhRxzNhIq8D6Hkku5NF0azE5BQxpNEb9Ogdjjz5/3yM458+Ar1I3xWX3GZfCaalq7Xyeujo6Oi4HOkKpI6OjiuCaEKwIvbRINT1mLDFue9//hrWfGANNlpETYjurQSvIZjhptMN2TuxMROgchAUVDCpydYjDgPbP7YTpUYtI02fjBHPGV/+4WfwpTKMv3JE5GpytXv161g5C9YsJexM087J6HR2yyYOZ+5FnqUwXDfEsKtqbV6PSRGiyTDJRO9RLy6w/uu3cMO33YBloaK93iSw+Oxxjv7hEcKgj7qXzpMUA3sXyF7kdRfrJl8KrzIh5g5BHacuWVbtNzdpu12zPWRReOz/84cc+KUjUM0Q2o6gIwSjuBRyLSdadXR0XAl0BVJHR8dlhJSgVp8MqZe3KHEhayaHRFLBF87h18Pdf/f9rLp/iC+kqWzH3dth/snbm003ZO/UxsxEEF+WywUCPh6z5kMb6d2wCs9GCg1JAxqVs587zr6fehoJA4IVo2sozQPxMth+JU9pCKwo/EpvBMBNUY2kMw2cMTxEyuiMYppQl6kldNVuvmX9AMGK/MyWg2SvRMoMT/uxA1jphrbmbkaZ3zFX8ihR3TXg5r9yPx5q1BxLDprwIOz9jQPkUw1Ka8Od5bzrXtuVvFg1mzplvqnNSjKXYrfv1lqzB6osGEowIcbAqrNreP5ffokDv/QiVMOSQyuCiE5nzMrNite5xq/ifLCOjo4rh65A6ujouCwwBFWhwVBtZUatBMsFKgOxCl1K+C0D7v87X8/8bauwxSVeYxn8OrbS79hx+yQAVREXggTcM+6ZwaohW75+B6OUQVJ5RaLM9Wd54T/v58hv7YNhBBXcBbUAwTCceIWLkJbrxfLBVB4nwuj0IqPR6PzPt8i00C0BwHMb5tAQcFt2/LtS3ezcbXrsWQGU0M7miJScINNAyE5e1XDrf30v/Q0CjZdrpHIs9mj2NJz47EGq3vCiTRgu+jUJqDtKg5MAI1eJ/njAM//H4+z/Ly9SySzgxSRFwMOk4HqDb9jR0dFxiekKpI6OjssCpdgTx2nXqP2/lO4RgEsmbIC7/84HGN4k1PWodUG7dLzapnsiJXMSWM3Wj+6AzT2kqUomE4Z4ZjbN8sIPP8W550bQn2waS4EQ1LErOCfGOV/KaG2nILfOavWpMZ7btZPzpXPaSrJKnm9isDbisZg0XMlW38vXycqVkWkOlIm3gbqCj2uu/57bWf3QKpqmaR/jQCKEPq/89n7sQCKG3nSu51Jh4pgU1z33CqW1G69gJq/m+R95lpd/4lnoKbhPrwHn3buJ0dHR0fGV0hVIHR0dlwmOiJJxEmWzWOVi7x3NMAJL9ZjN33kD89dFGCd6uY+0Q+2X7rBXbPBFSkep3ex6yvS3V2z92o0s1mMqyibRo5AHiXhQeeZfPomdjmgI7bwH0DhBLvHruqgleW32FNrK7jQwPjZGc5FCqp/fXZqExIoE3J2wuiLMRISA66T0uvI21pNrZFL2tvVwkcchuDeA0yzWrP4jW9n+ndeTFxPByvyPGqhGRifG7P/NvfSrPpiTuLQFkraBtAogmeyZ6OXceVRW2ZAXfvJZzj12Du9ByH00X9pj7ujo6LgQXYHU0dFxmVCkZVrURLiDB8dUCbki1zXxuoptH9tBGpUNVpbxtAtxqRApgZiIT22si+lA2xlIia3ftANd59Re5qoaawjZYRg498hxXvrp5xGJgJHMoQpX7qDNyrWZfOCyokukjI8sgclrHOxoQ3cnXSXPUM1X6FzEc5EtXvGcd606bkV6F0RIiyPCXT1u/K9vQ2RMlSKZTNLSpVGd4chnDzB6eYRXAZMEXl3Sl1NMGLy4klzTIQAAgABJREFUDJJQheylkA2eqXuJVTZkz8+8BFUfD1qOWa6Cc9nR0XHV0hVIHR0dlwnLLmahKR0II6NAMievq7nzBx8iroUgkCXhwciXeNNsKzpIbY2ESmhldgqNMnPjGtY8tIFRXWaqSj9EyAr9fp+D/+VFDn36IHEYcRfclCzpIo/s0vFGeVPqQOM0JxvCil8/2XMrnSuZSOrtGH9y+sMeOh/BMoHAO2e18a6sDNoOZ5UZJCt5RwLWCLZOuPev3s9wHXgDFhpEIZhgwWHJOPKrLzOwCgtlXXuXfAYpIFYKIqfCXaaBziYNwSpSTzjzyFGO/MZRdCZjOKaRbgvS0dFxudK9O3V0dFwWSDuUn9WwIEVm54o0iYX509z21z/M+rtX4ymTpRQR6krweElnGUTkvI4RrQvfxIkPb9CQ2fYtNxJmE2IgROpJ0UBk0Ax44d98mXPPL9EbRNRiKye7cnFKeO6r18pSYunEEvIqCWH5s+DSzqa0IbpSReK6PtkNd73CTc4c0BUFpCJSOo5LfpYb/uIdzN67hmZU3PrUAtHKOgQJHH/kCAvPLhF6FWoZRafzeZeKBMQwHRqbhtMWaWwPE0ctEKzi+X/+CGc+d5Yw20PSZPvRbUM6OjouP7p3po6OjssCbzsrpQvjGI6bMgpj7v7eB9n04Y3ktIQTiAZVaxlsmt9wKuVdmVZZMW/z6t6GUIqE1Cyx8c4NzN+9CnLGSAhauiZaigCOwFM/9CX8rOJVUxztrgJWGjCIQ2qMxdNLJQNKZPrv5HHe/lqamlREYbh6WIwb0On3uTJZDsadzCA1JJpxzcZvvoHtf3QbKS8hVMQs5OCYKDlk1CMHfv1lNPUYB3BCWSO5tGYeCmQzvJXZTWbKXIwUhGAC0iAa0LMVT/3TR1l4ZpHQf/Ptx5UvMO3o6LiS6Qqkjo6OdwWVcld8IkOb/Fs+t5xhlFRBjH526lRz/ffcxeY/vhOrzyJZEXxFplHpNryR6OpdEWPJG2/lShclotaH4SLbvvlmsmbEFTVbdjADYr9H/fnTPPfvniLIzHQj7W3uTEbawE2bOvxdrqycPQqU85pd8Z7ASdCzoFqKYBNDHLJQZo/UERyZGJ1XMNwwIOeEi72bDu5v+6q4BgJCkky0Nt1pnJm5Y47bvu8ekDGSQTEsWNuZDARTlo4vcvYPT1JVFdEzIoZYwC+5mUdb5bNcDJf/a5sN5igBU4hR8APKo//4C4wO1khPWqkhpACmXm5quL6m+9jR0dHxbnJ5/5bt6Oi4avB2x59FSApZy2a3/Q+QQQKxDbw8Z+fY+F1b2flnbiQ3i5f68C/ihUfwjGVn3UMbCWsiEpSsrRGFG1kguNEb9HnlF17mlU8eIg6qUiiIYyQqd9QcQfG2a3a58npb29BaWi+eXSSNG2BZnuju067Q1Ca9+ICDGL21Q6RXisorGfFmKr0cRScksNWZW37gPnrrEtkj5gGVUhxFQHPGNHLuxbM0S2AxUZmRXclqXO6jalnByaiVeauqr9gL53j8n3yB5pSgUdAEvXri2BFInYFDR0fHJaYrkDo6Ot4VshZZUWUQXFAPuLR3iqUuDzKIwNK4YfM3bOOOv3wvytJlvwl8M1zHZHWkCfTWwNwN87jVrQlF6R8Fd8R7uAT6acALP/oYC8/U0KuYuBY0UryUZeJ8doW8fbuAipQ+mQTSqTEsJmxq3LDiddhyJ3G5eDJ6m4Z4cCq0SO0u5+rwDRciIVSIBUAJ2RnZOW76/vtYfe88aWyYGVES5qWraq3Mjipx8ksnGYQ+sTX3mBRQEi7v6yBQzEpElCxKVqcazjF+ZIFn/tkX0IUBNsik6JgV1z4RuWokph0dHVcml/c7a0dHx1WDesmASWr49J9UuiR5iLuQm4a8ytj1g3dx6/9wLy5LpCy4XLlvVWpCdMFI2NKYdV+/jWaUwUrXxLx0XMwzruB9hVPKl/7u73P0syeQUIEprqA5kBFUBK4Ay2uBVhYIWQxEWTiwSGgEV1nOS1IpQcHtDItP7L4dyMZgc584F0jZp9LMKw6J4IZLRhvwVZnb/+59bPvmzeRxjbY3DqToMkv4agARg3ORM79/DKnKaRcqAiUzzP3y7qq5Oy4yDQsWBM9Ob3bA2d87xxf+xic5+ugI1QrVhGZHWhliR0dHx6Xiyt11dHR0XFGIF8WUS0Yx1AIiARFoopGbjF9fcf8/fpgd374Jz4JlQ6kvaznZBV83Ou2iuAU2PrQJ3xgRc9SLi5nhSCjz9urKQCNyDL78vz3KoU8eQOcC6o4piErZFMvlvyqTWNeyEA4ZFvYtgOmKc7rio3YOqbV2Q1HIxsyGAdXaHsn9DY03LvfOkjhgEWmMPOPc/Q/ex6av3QGpxinFI+o4UuRoIigJGc5z4Ff2Mj60WGbuREiUjDB1pp24yxVxwaRIQr0NOAsqmGVirEgvR576H3+P/f9lL7E3y7hqEMuX/ZxdR0fH1U33DtTR0fGuUAbrBbzCUXIYo9YQGyBlZJNwzw/eS//miJ91oiQ8VAi9S33oF0WpC0qpICTCKmPjBzaQlmoIiWCB6IqZkbXM5dSiRHUGXrHnX73I6afGhL4iZMiAKH6FOBV4W9QA+CgzPrFUNsptRyH7a9tB5VJRXAxc0CHENRE1f8MiSNv8pMsVF8c8MQ41N3z/nczfOY8s1VisivMbxrQZpIIZECCfyBz59CECkdx2Y4L7NDQ3XOa/xl0gepEVSirGJGaJHuVmSQjCjM3x8o9/mUO/epDBYA51Q+hf6kPv6Oi4hrm831k7OjquKsQnkzOtbM4rEKUejrn9v7+P+btX4ecyHmKR2EguDmhXbDAomCTUi7F3MR0Qtn/sRvLqgNTQhIxLO3fh0lo3jzEUHwTsaOK5/+MxmtMRj4pablfw8pZWTX69THpFIoI0zuLJRSSEVia38jVYu17lT7l1K8QdjzCzfoi0r/1y7hS98WoIdV5k07dtZ9u3bKcZL2DB0Ka4t5k7KuWRJuDqqA44/gdHOff8aURjWUOfhOmG4uh3mUvsVIzsxX0R9VIQa8VIAyZKsETqQ9UMee6HPs+p3z4Ns8NiddjR0dFxiegKpI6OjneYVhTlASWBtE5eEghJOJsX2fHdN7D+g+vxUSILKInoEbUSHhuuYJGdoCiBiAFKzsbsbatY/8BGRmlS+LUBqK5toRRxMUJ2qvnI+LEzvPT/exqRPlaVu/GlJ1UssbNYmfdpn8Mvg+JJyO38USibf42kcaI65QihBMK2TGyhcSdY6S0FhIwXgwsV4tpZGjGCybRrIpeZvEwNrL1WM04OxZq9MmVUjxncNcOtf/Ee0DHBIll4VQZUwD1j6gQHHwUO/vpLDHLAxVF8hc35lXHTwFxQylzRJBhXvDjaaevgKBgahd6ZeZ7+N4+yeKBBqzi1t1cp14JQZtnUl63FOzo6Ot4JuneYjo6OdwWRJRrpQ45EVWLOLOWGDV+3jVu+4zasSZgwLYZsRaaK+5WxGXw93B0nkCWAZ6KD9jNbv3kLNqghg2YnK5gYeEaIbTBq6aLE4TwHf/E5Dv76fkKvP3X6cgJ4kegBqJeNpF5GBaVg0zDY+uyYPEpIq4V7vQKndEXKZjiwHHrUX9OHkKdruvL/lwtJi4OEOPQBTUZ0oU4NeX3grv/mYXR1xppUyuakmNTEtjAGY+JHIr3Iscdf4eQzx4nV1So3U1BFXUnihIHgL4959ke+iI2H0/eDbEblxdUu0BpYaGfi0NHR8c7RFUgdHR3vMG2kq0nbHYFaRjA25Bbhjr9yB6ZjPC1veITlzbO2m+srFWEiiSoKO3MhNWPWPLCKuTtmqVMu0rlcNteOgieCKaaB5BA8M5fX8fy/fZpzT50iDgWsIoUGJ5fuk5TSUt3wS1wgTYra82aCRKlPNjSLTVswtZ9+1fldDsgtvZhSBAmDzQP8Mnd+FqTYWgukNvcpu9FUiTv+4l3M3TEgj0ft5/P0dWcpjnSiy9e958CBT+6htzSchqlefZTumQn0cyjnujfDmd85yd7/8CwMewi5FI2tDBGXYhx+JeosOzo6rhiu2rfdjo6OywsPfSQnNDRII6S5xO3/7T3oNoWGdnM/6bhcRaiAZPCMS5k3kUYIs312fOw6gkPOGVGfztggrWEDmcr7JDfSIFEddZ7+ocfhWAX9jFjJRnIpQ/suguil76yUomf514u7gwrj4w1WrygC3uA4S3dseXbJLVOtrZCgl/y1venr9hXW5ZQw16V6iU1/dCebv3UzPq7BK5TSMUpSNvzBQCSAZTwJsao488ISJz93ikqry96h76tfr3LzRN1oaLOvgjEM8+z7mRc49tlXkGEfzKkxgurU3e5qXI+Ojo7Lh65A6ujoeFdIOClCskjOmeu/53bW378RWaxLQdSGoIoy/RdxXMqczRWLh3YCIxTJkLXzOCmz4YNbGFw/03aPAkEiUDoKiBA84Z7RGFEMGQbGj495+t99GXEh0gcDC1Ls8twRl0susHu1w94kFHd8fEwgtI95fZncpOskIph7madyp7e6R+wN2sdfnteDiCGyXMTJaMz8e9Zw0/fcilEXH4qg5OQIsXSbArhYuQY0tPLDwCu/sptwLqAho5e5EcNXi0uJShYJEEq3LZphkomjWV74oS+ztKfB+xXRwCy3EszJFF5HR0fHO0NXIHV0dLwrhOxU7uTFxOqv38i2P3EjeanBRFvb52WKN8PVsgEycCshRwCtnMpTIq7tsf6PbGHRGjxbG6ZZOgpqDh7JVV2cyrwClDAIHP6V3Rz+1VdgGJEg0FgbpivgeskzkmRFkqtTiiAF6uNjcn7tZn+5SJIV/53MVYFYppofEOfjZe3aZq1kLJggTUWzMXHHD7yHao2g4wg44gmNxep6EvabFUSdZIL3AwsHRxz9/QOEKNAacFyR4bgXJBDbrrFmR7UYkKCOVhHbC0//6y8SRhU5TqSjJQNMrhCb+46OjiuTrkDq6Oh4d5BAU9forcod338fyhixjJoQHPBWVuWC5FIfua34/JVKu7M1d8R8GuypDjSZLV+7mWpLgGzLduZiZbMtgngs5g1AdME1M0yzPPfjX+bsl08gsUJVitxOJnflLx+sdWrDoDk5IoiysgP0mvkyl9agozV3mBhPDAKyJmB2/uu7nObTijNfxt1YDGe4+fsfYO7OAXkx4WKYKtmLy6DgmJZiOGTH2terUvHKp14mnXBC0Gk38fJ5lW8fQiBLRilyw+LBKK1hSUN/oBz/3VfY+7PPEPurMClByk5xu+zo6Oh4p+gKpI6OjncBQ5qMVQ23fO8DVFsDTU5FWuM2daybzBVMTBrkKtgY5tahzDWgHlE3gpSOT84Nw81Ddnx4J02T6Ltikkk4VTaKuYUTveQGiYHmiAwiHBee/aFHGJ8xrCdFhuXFVvpykCSurFtUBK8blk6cO8+y/Y2Km6n1tbSW4O6EQaS/NlxgBunSXi0xl07huXyWbX98F9u/cRu2UBPEMM2oK5W3Rd90DqsslqsQ3GiONRz+zF569Ch5YfGKCQX+SimFTnGwK82yBgAl4Ap4w2pZw+7/uIfTnzuMzA2K7fcV/67Q0dFxudMVSB0dHW8bQpHBiDOVzYmXTf04LbDpO29mw9fM44up7KA9tcNGy3IqOH/C5NJv9S+OgOOUAmYyc+HWSsfcMBIbv2k7eV3AzBHNBAt4WH57NsosVlZv44Kc3qBH/WjN8z/6BOoz5JhwgSwJIU7Sp8oavtoq/V0wOpg8RTFoAFtS8smEtdlAYPh5pgbAZFDfHZGAtNLEYAEJicH6IWRBNK8wepg8o/BOXy1lvqt0sErxbm2DcFLQQRpF5u7dyC1/4WaSniZbD1MFDDEnhYxhBELpJAVBXEu3dGbIsd/aT3qZIq8DxNM7fq4uJeoTcxYBCeUdxMrclcUeHpWwqDz/r5/CjzXQhyR9Qut+V+4ctE6ZUAxR3hEm1+jl1aHt6Oh4Z+gKpI6OjreNLFqkQyzbM2c1Uqqp7pvlxj97C54aXCBYAG07HnptbjpMI5acuZvnWP/wBkZNDSniUd5aDTMzx5lfPsj+X3yRENfhNFQeMF67SXw3pWjeTlOVXoCACM25RLNorcTuTb72vIJJi1GDOERnsG6IAZYvjVNfVsc0oOJ4NlIophomJXuqkYRucO767x5E5xwd9YgeScFRK+el1LgCnqlMkVTmjDQIzVk4+Ok9uGgbDHtlW9xfLLVXZG2I/UR6pualn3wClR6xvekgCdQjYqHY41NipfWqmV/s6Oi4VHQFUkdHx9uGenufNZS8o2AOGerVI27/vgforYLUBHJoil2vX9ubGbEy0E/VsPlbtuMDL4UjVoqCC6BuqAx58See5OwTJwmxIrd5SBOvt/MLjvZ536VNt0yuBxVGp8ekheY8id30Qct/eI0bgUgophZi9DZUaCVTq+eCv2sGBuogyUoUb1A0ZdBlQaObc9NfvZ3ZmytsnEGdHBepsqCE8hu3dTVEiqthlnKutYqc+sJhFp8bMQhDshqG4dmuwSKpdJV73gARfEgcBI784iGO/M5BpF+kuSJCpsE1twOL5WtfbfrS0dHR8ZXSFUgdHR1vI1Lu7XrTKl+ExWaBnX/qFtbeuwGvnYgTkhS5mefiwnb1JmG+KSpls59GiU13r2f1fatJzTnM7LwcoTf+ekN6gXBqwLM/8gi5FrBM1rxsNf06m+t3up4QFCTjZLy0CKlPjPDaytzZBViWBBbXsmLW4FRrZ/BYPr8yB+fdLCACCuZt4enlGm5f9ewta9j89RuwpRqnAnHUE+DFXKKdJSrHrmQxCLFYmo+FV375RbyWVn4JJgnVC81dXb2I2jQnKqtRpVme+7EnqQ9k6Be3Oxclq013M2L5ipfldnR0XHquzV1JR0fHO0Iu0zKgPZLCUs6sf/9Gbvz2W0i2RC1jnBpFwRMSyjwO1+wdXydpAokQA9u+5WaayokSwd6K7FBwz/RixdknFjnxyHGkUmKuXvtM7/omWynmdSW7pjnRYCmTucCMiLfmHLKcd6QmeIZq7QD6Np1bOf+1vfOvzwQslDpnWqC1ndBmNGbDt2wmF/0fqmWuKHtrtqC5nQvLBAFIRBckB6SqOPPUaU5/+QS9fqAJRpUV93aq75rrILXr7UIQaTvOASrBX848/eNfQnIf00z0ipD74MUpUuW1XciOjo6Or5SuQOro6HjbiC6le5CdkJS0OnHjn78TWeNoU1N5ILfFExhuZTjb9Vrd0AjBS7BoXS+x8X3rmb1lAz4y3opxWW436i6ZmV6fQ7+0lygDbIWJwaV5VRPFk7ROdCUkVkxe97fOyuLN5LXFnLgiWeitGqDzkfw6NuHvhqwqIKXAk2KcINYHhGp8FtvaY9OHNiJNABGSGypCoNiWT1wZ3b24DarjDkkyqLH/1/bAYkRUccm4ClEq3O3d8NS4LNGJ+YVXmNQoQm/Q5+RnjnHkNw4SB5HsNZggwrQ7ea123Do6Ot4+ugKpo6PjbWOyqa+yM85n2fVt17HqvjU0SyPUgKyIRQKB3G5mRBy9RkNNXLzMauV2Az0HW75hO7UunBe2+kZEFdQqxJUQ4MyXTnL2sdPoUPFWyTaRq72rJg3iTH+9hFIwj48togTsAhbN6iuKnhWPtZyJc0JvVUXOpQs1dZCbON+90/tiK+sYcr89AYuICUt959a/cgtxdSgzQywbj6jlYtRo7cZdFCPirRm7DODss+c48bmjVFWPTMkFS+Jg/prcqGuJJI5JJphSeZ+GBlennyMv/PRzpH2gw4BL3VbkJTJAuq1NR0fHRdK9i3R0dLytODBODYM75tj1nbdCs0RlkaYSXCBKjVsiINN8l8st3PTdWywpxYQIIRs5NWz9yDqqHX1yc+FNsZkhmgAhCcQ68uS/eozmcHzDguhdubvuUpze3IiieBKWTi21Bg3n/9p5zXFObZvb1zjtKBlxGKjmeud93bvZLTBVxBQL5XjIFefSIpu/81a2fHQrZKBn4MW9L6mTQrG9V4m4O6aOeSLm4vgY1Dj4ycOEYwYqqMuyk7QWG/Ort8N64WK5yoGsmbEaAUGz4v1A2pN49j89j+SIBi9SxwldB6mjo+Mi6Qqkjo6Or5jJ5tRau24TwzUXy25zxn244S/cC+sdGTsurewqWOkgTAaqr/lZAW2zdXLJB8qBsHnI5q/bRtM0iCghO65OlrJRFpcVNcSkyHTEFA2RpefP8NyPfQnxGSxQ8nZaO/WJ89f5LnCv5aJ7TeLFdlkUN8XrxPjEAqoVrg3BSgCw+Ktc9qTIz/DlgGA1R9TBA1ROtbEPOZfvu0Kxp14G+S/ywKfHMjHJUPFp/pGakXRiYG6MR8aaB1dz8/fcRM6pnJesuBT5aLBiuOATqZgaTiCIkUNGtUfemzny2UPEYb81fyiGA9qujYsXaeJVyYV//nO73sHLqk+6rv1B5PivHuD4F04g/UE73+WIGqbdHFJHR8fF0RVIHR0dXxHTOYopuVgX2wAlkWjY8q2b2fDgenyUSEGmm5rpjfC3MmBzLSAZcyErBE8ET3iGrV93I70NkdwkVAJiUuZZ2vXLIlgozm7Q1hSacYzZsIojn9rHnl96nlgNqDWheWJ80LYkLhCmefFbS0OwYmogkBYydrYYF4hfuIhZeX29usM0XDtbPt9eTCsfe/GNFn9NR8raLp+5kCQTCWh2bNzg22pu+6v3ojNgF8hzLa6NgWCA1EhWGAb2/d5+8sHF6YzStWrI8NUgI+G5n3qGdCqTg5BFwLRcB917TEdHx0XQFUgdHR1vGRPIlAR713Kn32lQV4IVZZDMRm7+szch1FgI+MS4oe0MdBuX1+JoaZ6QsHFmcOsM6z+wiVFqaNQAQVpraS+u2WhubbxbO/XS/SiO6TM+z+5/+wwnHjtB1e9hwQkply5UUJp3/O76pEXoaGXUZxPprKGtKcX0db/BpSCyIlto+skSqtRfNyi5SNPisO2g+Yrn/So5X923co0MglIRCQmakEl94a7vfw/D22ZoxvUFizNrW2bqkD2gPaE+XvPKJ48woGI5uarjrdIb9Bk9eppX/vMeNIZyA0HpJHYdHR0XTVcgdXR0vGVKF2gy+5GLlEoqEMNkRCCw9t4NVFtm8CaRkxPVkdxKqi71C7jccIFWNudUuEpx7mrGbPujN6KrAc+l6+Chdf8ra+8TmWMoVtAugrmiNHgU+mf7PPVDj5BecbRXZJDqiphTrShSZMW/b9vL0lLQAUiA+tQYGZXiTltp3BttYV+/g+KTF05vQx+Ny92z6SzS2/AClut3WZHDNJEnth9rw7g+y/Y/eSsbvn4LeSkRKVK8N5N1KZOCzohUWE848XuHGb+4gA76b9truJYwa5jpD3j5558jHcsYdTkFXReuo6PjIukKpI6OjreOg/hELhdQt+LE5QYSGKWarX9iO3lpjItQScLcyDFf9FNfnZSZm9DOqYgrLjU6MmZvm2HXd13POGeSjhESYkUiJy7gXmZbLKMIYgmR8jlcCZVhLxqP/M+/x+knFvF+hZsjblNzjPYI3va+hbuBaJGReWBh3yK5cSzY6z/Xykyj132ETL4xM1uHyKzgbU6UTbsF8ja+juVVcXfEynWfU2LUH3PTX7uHXd9zA7mpUa/BdeqrMG1DTXOc2qNq54gyjgRl8YUl9vzU8wwIpSPW7em/YoRArhQ92+Pgr+yHqldMLboGUkdHx0XSFUgdHR1vGdPz73JrFkTLBrIe16z/ho2sums16kJwx73CRZDUvdW8LgKIYBiIlQF/IItDatjxXbcwf888XufyYFVKCSR4KFk6QQIJJ2tA2n8sOEhFqAzd7Tz5v3yWhcfG0I+4KI5O54MmvJ17SjXFxIsJhwuL+04T2o6Stfbur16GCx6JC2ZGf/0AXV8V22zR88qit7fIaKV7AqoRs8xS/xz3/PUH2PldN+PUYJngfUy8/DJdKSP1V/XmBNyUKCVt9uUfe576UI1Wjpp2s0dfBZMVC33l2K8eQuqSPSUSL/WhdXR0XOF0u5aOjo63jE7nXQAcQqDBqDUTVwk3fudtCAlHyVEQyYQcQL2bsHgdyloWZ7nSdHHUI4qQEeJA2PGNN1BrBAQ1a3NxygxSkd5lorYFKUZ0xcxQMuIDUl9gIfDkj3yRfNyxyhF5hzt6UuysPUBOmfrUmNDOWXEBS/c3syd3d6phj95cf/pnKMNv4hdv0rCskpscY8nWcROapuGm77iNdV+3HV9cKu56Ipg35fguMNclgGmGXuTU8yc58dgRYlXRqBaDja7t8RWjJKosGIHRyQWO/NYxGPRAms7FrqOj46LoCqSOjo6vAMElIy4YQhKjIsK4YfPHrmPmtgGWy6Z1sge/ZjOO3gLLfgAyNSZwMUrUZcbrJdZ+7VpmbopYDZnl2SMXaWd5dMXmupyTiNBImBZNVdXHn6559oe/BE0fFYrMrt1Elu+orT23ofZVbi7bCkM9Ti3fQ63Ux5fw6DiZYI6poESEhKqSJJccG6PtvthyZ8hLcS0ipSDsGb0NfdylnetRLJQC5UIhtBdElawg0rrNoaj3qOuaDR9YxXV//nZyGmGTSqx1zBBr58hep8jx6awUlBeoHPjEXsJZR7Vqi7ruZ+SrIYvShIx7IHrgwM+/hJ02PFKCqU3Ikpavc9d2nqwrnjo6Ot6crkDq6Oj4CsgYAZeMkqmykBqBbYHt33E9boa8zia1Ew99FbiQLBDX9Nj6DbtY0nMEitQrumJvoQskIqhlLDg6rDj2mUMc+IX92LAqoa1SelXmjmCIBRTFNLyFA3z9Yy7OhgnBoBLyQqY5ZYhVuFY0AdSsLRwUy0IglMeLlHmckmgzfQ0mkMTJCrmC/vrBivykkjUk2EX/QnNPqEsxwdBStOY6E3fCjT/wHnzYoJaJWWBid++TTpK/6nudbyKRsxH7QxZeGnPqt45S9Ycl96j7NfxVk10JBNRqkMiZZxc59Gt7CdVscdQUQSSU7ixgUpcv7Ja8o6PjAnRvEx0dHW8ZEyWYAgFQsjopj9j5x25hsKPCUy7zMd0d2rcFF5BRZtOHN9HfUkEtSBSSJNRfv4iZzBapJ4xM1ojWAVdnRoe8/O+e4OTnz6FDRxIY3m4iixserpg2F3fcCMFKYOp4KeFLRqU+laNByRcSAkUiV3KGJpW0rggidlr3xPYvgxr9tRXJm1LITN3mAC5OOmiEttMTSIBnIw3Ocev3383wulmsSbg7meXiR/X154cmeWGTnwWNiggc+u192HFa50FH0a6j8VUiCm6p1VY6lQzY84svsnhwCelXOAk1wbWcCyEWu/yuYdfR0XEBugKpo6PjLRNMcG0IpgQL1MmJ1we2fGwbOTHdeEytl7uN30VRiWA5098xZMvXXE9tS5ANzW/cL5mov7QdVHc3JCjBIfedarHi+R9+jNFRIYRIsEDWDJJRMZI4wb7KDlJLVi/RQSEwOtUwOpdxrVAvvSJXwUN5LsSpBDSAmxG8jCnpNNeo/Fu6NIAH+ptn0RjA81SZhwcu+leaOG5K8AwqLOZzbP+uG1j3dTuxpTGaepgGPCyXZOZeZr5eJ+R1ZfCrBac5PObIp/dAvyoFlEr7tZ2pwFeDurUdRgWcKgqjQw0HPrm7dEHbHwYxb2fEynUk3m19Ojo63pzuXaKjo+MrwlrdP2RSXmD7H7uR/sYKaZrOiettxt3J6nh2NnzTdnSNQut4JmrnudCtRB1S+YhKtMxhADFHZNhj9MI5vvyvngYPZVbIBQsCHlqr8IsMXAVEe+AVnFhCU0LJRC9zVGKgltG2ok7ipLaTlUVJAZrguDY4NUIuBhXZwDP9NRUeApqHxYJbirX5xRIMVIoxgywssuHhLdzwZ++FZgH1TA7ePk7O8wBYGWw7OW/Tz7ddpCADjv72UfL+ml5sbyBY2wXpbiR8VYhE3KQd8FLUYVYGHP21vTSvZHIvFLGmhNbxsHQcRbsWUkdHx5vTFUgdHR1fAQ652IXVOTN73SzbProNciJQNnvTR3abvotGJhlJ44a5W4as/8BW0shIMaNW5GRvWCTRFg6TboyE4oHgTjUYsvDJA7z4c8+hMzOtOYOQRYvxgaeLOm7NGfMxJg1LJxahcZoAdRDMY5kPIRAsYFnwBqgNkUDsNUjMiDoxK8EiiJKDggqNQW/dDD5s14iMUCPh4o4ZikGG4SxZIl83y+1/9T7S7Dm8zpgI6JjgVmSIAohPO0kr5XSs+ByAqlIvZA596gAVPSbhs5FJk6O7sfDVYGaotp1EEZqohKA0+zKHf30PMUbMS7DyxAxDp2HAHR0dHW9MVyB1dHS8ZdRBQ6ZqhJSdzX/kVnobI00zJqm0sxnLm8Suo3TxGIJVTnBh28e2YnNLhEYRy21g7+t/nTjT82ElV5bW2IsoMMeAvT/9Isc/d5jY6xXjBBqkvRN/UUgkC6j2OHe0Jp8T9Czksw02WsLSmJGPOKc1tsqQrYLfpiydGzPaq9jJHtoM8FBBP0I/ov2I9ntUVZ+Z1UN0riHbCA0VbqHMNF3kzleAkJ1mmLjtB+4n7DLCCFyFLJFghouTxNvO23JhpCtkpSuvexFBYuTYI4c5+8IptB9wNyI+nZ/K3Y/JV4WIYRjangchM9KaQTVk/ydexl6u0arXdjTB2y6jW7f16ejoeHM64XNHR8dbJrf7ijo5vZucbR9bh42NyBD3XBzIRF4TQdL1kr4KxMmSiDZHskV8VLPqzvWsun81Z35vTL9XvemXZ/WycZRWcqdOZYZaCYptBtBfGPDMDz/Ke7Z/HcNNPWJu8Aw5fJVF0sROuR/o2ZB0aoQOR2z6ti1U6/pQQbU+MrdxlmouIlVkMOjRWyOwbo7H/+HnefHHnmRuOEDnAnlGqeZ7zK6bJazqI8NItUoYrpphft0cp46cwRYzM6FCtIEQuaj7fh5YymNu/NO3sPEDq/Glc2DFM1q9xqQPlOJGspOLESArnaMnsrrJx+VkZF755T306kiqAsGMJAI6MaDofkK+GoppjIDGItfMxpDIuMo0hxJ7P3WIXX/peqQJmNUoPcxzkdh1baSOjo43oSuQOjo6zmPlBu/8zzuYYh6oveHmr7uBuHUGXQRnPDGSQgglyyeAuGOE1vnOioRJyt3e2CbdTJ7LdWLXfD7X7NbRBSRijNEUydHQQc3Wb7qR0597oiTqeMCCtDk8Za1EpZUUnV8oRGPFbJGTRaBn5JecF/71Y9z7Pz2MaCZP0lK9yMCCKSYJ9UiWYg1hWkJqzYt8zANIDEiKjE/WnHruJMe/eIQjXzjITX/qPm75+zshjYt19uTacgXP4IZlRyvQ3GNwvCJbZskzrkadljjLCZrQoK64OrJaeeDvfJhEw9E/eIXTXzrB4t4xshhQjF7UdiRJQAV3m3Z88NY6HAi0+UsqNOKw0LD2wxu5/rt2YXkJsx4uDQhEd6ydmXLK9SqTP0wQQSg5T8VswvGZipNfOM7Co4v0ZvqQHRcILHdci3/gtdjVKNfDpFYpl520aVFttpQ4SAKP5Nb0ImQvOWGuWDDEygySqTFGkFSkwPs//Ty7vn0neTVoE0mSqbw1++jo6Oh4E7oCqaOj4zxeXRwtD5oLphmtndlds/Tv3sCLn3iWdRvWs/bmNfhcgLoh5wZzpcqBrAYh0agQk5eMJAFBkDKIQg6CZmlDTV9bEE1nPC71wlwC1KTNb7FiV1zD5ge2cuC23Sw8s0QvFsc3oA2QLS5sIvmC6xUyQIChcuq3jvPSbc9w45+/E5YWEMsIAWmlSC6KmBIwECe44pUQqogno36l5sRTxzn6h0c59/Qx/MAISYouGvnYORrO4WNDEcQTLpNOj6GtBFDIRQYVA8UmQlACEp3KA5X0cIHcJHRNZPbGGXRtYu39t2Nn4Nzzpzj22GGOfukE514+jZ6EvvbRCKgQVckYBCW7E9sg2CYI/QSxyeQblFv+6l3IIGJLiag1bhFJhku1vNhvgOBkCSiZrBAwJCt7PrEbTxkTRVYM6k3zZi/1hXaJmJhbWNt5LB4YTmhn56AN/5WKiBFzImtb0NIWmdaGKtPgSwoygu09Nty5C06dYvevv8SNf/Z2qJcwFchhcvF3dHR0vCFdgdTR0fHWUadJS2z/6C42vm8Dg2cyL3xiD8/99EvsfHAdGz6whf62WeJ4TPaG4AqpuEwl1fZbFOmXtfqvYJTYey/FwLW6WXxd3EEElZIbpBl8tbH5Yzt47umn6BExcdTLXXfx1jTA9S3M/ZcukgnMhiH7f/pF1t60nnXv30BaWiBjeKVIk4gmuCZQQfpDbKSM95zl9JcPc/SLxzn31CnSsQZJUAVFwhzjQUPwzLkDZ6jGoXQCjDLLI5PuoiNuraEEQMYs45FixeyQ1coyeMAkoy4M1gyQKsBSA1ZDPzP/4BxzD6zi+kXj7N4FTn3pFMe+eIjF588ipyC6EqsixRqFsvF27aM+wnHSTMOdP/A+Bjt6+DghmvB2tiVHR+2tOZ9NOqkEYFBx5ukznPv8aaoQUVUmJ+b8GxHXWveorEHyhooIXmbt0NINdcBC6cIFz2QL1OpELTlsTSjyOgx6WcmWqENm/v1r2PK1NzJcM+DIp3dz/EuLnNs3Ysc3Xk9cC7Fx6lgkkp3ErqOj483oCqSOjo63zijAxsiWr9mGj8fM3TjLA3/lXg79zmF2/8STPP/vn2XXn7yTHX/0Bqr1itOQxw3RMilo6Tw4pRPlABOb6eWwzzLP4dO7y9d0wSSCTZzQEATDUmbTR7ay/+deJO1zdNAWT0ykSs1bkmu5GMEDwZ2mClTnKp77l5/n/u3fRNw6QOoaSYaFgIWIxkh98ByHP7ubE48c5sxzp+CIEVShp2hfoQ+enaSOaiRgLB1exOoIklCzIskzn3YSIbSaNSkGEeI4EfGMeDjfGhEwg/lts8igIZlhCNEDtpgICFTK6tvmWH3HKnZ9xy4WDyxw7EtHOP7occ48coJwJlL1hNwbo02Fao+FdJbr/uKtrHl4PT5qwBMiRg4DFEenjgxvvql2pBy3CNEF6PHKJ5+Fk44OtC2KVpiYOK0E8Gq+yt94zaJUmKcSuOvFlS5IAHdiY3gstu/B2gBjS4iCZkGbTHZY6tf0bpvl9j9xDxvft40Dn9nDM//iMeSAkWci+fApjv3+Cbb98e3kZkwQxfzaFDR2dHS8dboCqaOj402ZDpw75JxZ9b5NDK+rsAxmQg6w9aM72fye7ez+zy/y8o8/waFPv8Da929hy8PbWXXrKljdh1TjqYwTqFVkSicpUAIcJ1tEp3O/W4mKkBSCO8kykYiui2z+6Db2/PgeBlbh+HR+4y2XlF7h0mAYIUekX9HsTTz5o1/mgb99LzKjuPVgseL0s8c5+6WDHPzUIeqXR7hXhF5FmA1Iu9nMlGslUKyyQwKRinR6RH1uif7aHpZHGFqKiPOOtN2ulpO/QjZYumOTuSV1JbFE3DrAqgBLieihlecpZgLmWJNxN0IIDG7ss+OW67nuj97IqcdPsffXd3PmqZPkw04v1YxsibUf3cRNf/ImGNdkTbgLIQ8Ra5AgZUYKufDK+iSQtHTm8t6a4797BOkt/6o1Od958Ooujs5bnNd8JrdzRuJaZufUSW1HMUdHfTkOOVokmzBqRjRVw/x186x/aBWbP7CLVXeuJY2cx/7Xz7D42DlEZwizGXGjb7Mc+M19bPumbW1e1gjxYrbR0dHR8UZ0BVJHR8cFmdgZp+GInR+5nhwTYaxFJuU1vpTwucCNf/kWdMZ46V+9SP3MAY7//H76t82w/n1b2PrgdgY3zCOzDkujMgOigtkk4X55AzWxPV6272WiwbqmEEqRgDvuioQe5jVkYeNHr+fAL++BE45WbadJABRtx/7fjCSZCEUGGQw36MdZjv3GHp67ocfGB3dy5A+eZfSHxzm3d0ReFCrt0e/3i8mBC6V/YxhabLZFgUSVA6aZ3FPGp43meGKwTnEMJWNhRWHgAu1sU9tSaYu9MqMEAW9HUsQUKmGwba5Ya5sUqwOxIrlSR8wJhBKUmxOSvUjlgrD6wRnueeB+mmMLnH7mDEd/7zALp2vu+IH3YlWCOqOiZFGyUIJtzYoRRva3dg16wKUh9ObY85svsHS4ZnYwg7cGD+cVRyLTb3n1FkorX9f5RYl4htDDrZw3kdLZdBXUSuEbcmBcj3BZQjb1WXvfVrZ9YBtz961lsEGxmYjtTXz5732Os0+MmKmG5MogCX1RmqgsPH2a48+cYN19q5Cx4JLxC2tQOzo6rmG6Aqmjo+MtkXNm/s551t6zBm/ArcFUCdZaSiejaRa44U/dTJhVDv70y/i+xOjJmpcff4n9/+llVt0+z8aHN7H+/q0MNg+gsjLYnmtCLrbVU2evslsqOTJcm1I7d8dauZYDYoKok3NmZucMaz+8iWO/eIie6bK9+lssJIUKdSfLAuJKaISRnWPde1ez7sbtPP2vH6H53Bn6gxmkP8NML5HF2+JV0DZ/xkQJCMGLI1yWqpVNlrMmY6iP1vitA8T6OBmVwPmbZV3RqVx5tpXlQX0nY9RRGG6cRZvc/p3jBCS3skxVJDuVezHKa4/XsiOWMV2g2hDY+HVr2PANWzjwU/s59fgrbP6G7aSe4Q2ELFgck00IVIiVnCPjAsP9ItP5IzsKB35zD1VVodlpyrDda+zTr97C6PU4X9jWs8hIEyj0MuCGSIUnx1NDsiVGq5RV793Apg9sZ/2DG+hvqxAt5b/VcPQT+3np48+Qd2f6/Yokgrfnq3GnikZaMA5/ah/r77sfEyFrU2YfOzo6Ot6ArkDq6Oh4XYp73eRPZVO++SO7kHnFFseoLFsZ0xYxVVCyjbnuO25k44NbefHjz3P0k6/Qa4bEBefcHyxx/PefIW5+lvkH1rP14Z1svHM9ccOwjKJkI1hm2gyZ2E2/KnzzWsEChEn4lBjqiUSZ10CM6z52M8d+4zB5HBC14nUBZLcLrtcgj2lCwJkj1WNG8zXXfcd1XP+nbkY2Dbnu6C3se/QJdAAuiYYyQ6be2g8yMd2Qib841vpel6K5NSNYaji1/xTrq400zbnSsZowneuZGDsXiZpImTkpFAmfWJlVm1lV0V/bK3/jIKLF0KE8AM2KSymO8LJZFp3MnAjBApZLSyqfatj/C48zPtRw4ukbuen/cjthS4azJSsKERKOS6Z9cW/hnBlVr8+hz+0h7avpV4PSwZrYjK98LGW27Nop/89fw5EGgo8Q65NSBTqmGY+xobLqtgEb3n8Dax/awOyNq9AeUCdyyoRqyOJLZ3n5J5/n8O8dYDAeEAcl5NfKfRVMnMqULA3VYMCpLxxh6cBpBluHaHLegotJR0fHNUxXIHV0dEwRUTAnAIncOokFSJlqu7DhI1uw2ggqkAVTx1UIprgYmOLakBdHDLYOuftvPsjx97/C7p96ltPPHmc+ztOXVdjxhoVfO81znzrH3m2RNQ+uY+MHN7P6trWE+arIlJqEeVOsCUTLrNIkM4k2oNNCa73sy5KZicGDOG5X9jyTmpR1bTEBtWJsQVMzd9scq9+7haVPHyXPOHgPxNuiAbJmpl0LSYhFXIQkNV4p1EqTz7H6niG7vvc9rLp/PTpegrOLbPmarez/uacYH4a+KOqBFDLqr87s8dd4F2S1NodJiKb44QZvaqJFGk1En5hxyPR1hemLdHIQXCCak7QUFpW3+U7r+lRr+ljORYqFI1YkeW55pe95e02XAq7tTyEYKg79AUc/vYfxAYj99Rz+uX2cevwot333Haz7mi2lmMlGQ6byiHkqa9mGKbU+E9NrLXuxnQ6qpHOBg5/YxyBFtFKSJMRf2z26OgJiVxZ4k1wjwcQJ7ZoJAXPHtCGI4CYgVqz9U0WqR+T+AnHHgC3v28mG929k1W3ribMOyaEeYaZoFQlLxss//wL7fnY3dqxh2Bu2BhhK1mXL8HIdgkmkQqiPjDj6O0fY8eduRlJGzTBV3AMquRWKtmdkeodmJZOiqrN36Oi4FugKpI6OjimZhGuRNUmuyKFBs1P7iK0fup7h+iGeFsluECvEMojjE7mUJ9RKBKyPx+RYs/4j61l970O88Iv7OfofX8BPZeJsRXCj50Le7xzavZ9XfmU/8aYhGx/aweaHtzJ7w4A4GJBTQzTHzFrXs8m8krfFQ5FnqTjuhmgouU3ZCaH9+FIv7DtFhB3fsounfnc/wQeYgkgqjl8aCRZAcpGg0QNJBAuIDklLizRrF9n5J25l17ffQFht2GiJbCASCJsTG79hB4f+7W7CcIY65DILReCNOh5FclfMFIosLhNDxZlDZ9pUWSe2nSF/1detZCLbdCnZOOJl45uTM7NphjBQPDdMzA9LLXThrhniuAeEhnQqs+9Te9FeRSQR+7M0LzqP//3HWPetO7n1u++mvwGqZoylBpWIU+NESqHlU5dB9UCFkdQIYZbTjxzj7FOnmAkzWM4E0avAVboE7r56jSdBryLtrFc7V6UOmT5RvZgxpFA+mZReUzHKC6RQo1sD8/etZ9v7t7Hhnk3IOi3XbF1jo0jymtAXpNfj1KNnePFHn+Tcl04S+jP0q145EytkitoGAXsu15sbmDaIDjn0OwfZ9sd3IoNIsiKzc1LrmtnKPEVamepV+67R0dHxFugKpI6OjinBi1VxRkDBqYCEzTqbP3wdrjXuuRRRpQWASMk0Cibljr47SYvVsSawXKNzyu3ffQPbHtzM7p94glN/cJQec6RKCJXRq2ZKYOhTxqGnXuTwzz3HzK2r2fTh61j/nvUMd8wQhk5qRtAYgWIJnWnAw9Qg3FQxjIigqmQztJ1BuZqYFCJpPGbtveuo7luHf24BhopQlfPiTo5GSKE44XkJXs1SM1qqWfXABu7+3ttYfe9qcjLSuCl5RyhJM5qErR+9jsO/tJf6pBJ6k9wiv+BmX1YomFwgn6yxxYz2pRxL62D4mq9pHy8sF03iJTvLgtBYZrB9BqLhjU2t4GHSXbPX2IKfhzmIIYMBx37nMOdeWGQulM6DCMS+ELTH8V96kS8+cZCb/uI9bPngVkKoaTwT6C1/K7ViLABlLsyN4AJj2PPrL6JNBTMBtzHusS3ur1xkxc+RIcvdLy+GHEUKqUU26MVVMahjbUfaJcNSTZ1gtL5m9T3zbHj/dax/cAPDzQNQJ+UxNAm1tp/oNb1Bn+ZI4uX/9GX2/Mp+4mKfYX+eRGvqMClqVuDuqEprIV5CiUNVMXr+DGceO82aj6zHFpWEEbWYh7j5NT3v2NHRcT5dgdTR0THFW6FTZdCooVlIKTF/31pW3boaGy9gori19twSymB1qzcyodgsu6KAqmJmeDJ8vMTwDuWu/+1DHPn1fbz08SfIB5wwHJbCTCD0AioKI6d+dIHnv/gEL27osfqetWx/eBur37OR3haBZFhjCJEclIgVK2Z3gjhJFfGAmhcDiatwx6NOkRAOjF3feCPP/eFjVABZySGXwjWDiqPmqMJ4vEReXXPTn7uPnX/6BpgxmqUxgVA6ACKYljkdGcPsrgHrv2Yzh//LMTQrOjU9uMBxCQQBCFgwxicWWTpVM7d1Fs/1mxpJiANBy4uD4nToGQigQm/TsGQoiUzn5LwtCEXeXLTmoogYLAb2ffJlAk5Wbc1GEipCJjKsVsPLNV/+B49w5Fuu544/cwdxW8TGkBkTkVJMSrG5b3IugachcPqpw5x95Ci9/gzJE4FAVnnN/NGVgngrISSDKMGkLXiKjE4k0bOAu5C1nMAsVgqkNj8qpUwjDTN3z7HtA1vY9P6tzOwcwNDwpqapIdIDbTtU5khfkTzk6CcP8sLHn6Z+sWZVbwZ6pehq45Kmwjd/1ZyitR2+8l5WoWR6deDAb77Cug9uRFHq4HijJZiYXK4fs6nXRkdHx7VLVyB1dHRMMcA1o+YEj7gmGhI3fmQHzCRkMYAa6o7SWitTsnociAlMaUMyc3GTIuJZwPtok0DPsPk7trLmPZs48PFnOPCZ/cSxMIw9xmqIBFwFYcCcQnN6iXOfOcqTv3WE/tY+O79jF5u+cSf9tRViBk1dkpREESmzDsHAxLAwmfO4su/evyHimDdset9G9t08x3jPmKARRwhJiZKLNM0ji+MzrHpoHTd9z32svXMe0oi8aEQRRBxrnfLICSTg2iDAtm+8nkO/cZBc98vGWKUUxG92WNImI5kSgjI6V1MfN7hO8DSRMXkbDnv+ZlS0CDYn8z2ZNlTWDK1g1bbV0GYSuVlr6qC8lXPs4oRB5OTnjnP68ZPM9arSb8xN6TQkh6p0SEJ/wGyuOP2LB/n8Iwe45S/cw8aPbiFowJqES8BNCC4EFJMEHjn463uJZ8DnQChy02AX7rpdrkzG/IKVn/XcVsDamnHUvYQ3SuWgVgpC10jOmcWUYbBEvGGOW779NrZ8/Q6YEzQlaJw0cjwHooClMQFKhMDcLGdfOsfun3icI791mIEN6Q16ZY1RVNtUqhVrulwwL19NJopq6TULhvd6nP7SEZb2jxlu9dYwxKZfnynud1frTZWOjo63TlcgdXR0TBEcMcE0EMyoa2f1+9ay+eu3kEdjRLRslCSTxcFym4ljuAge2ru/AK0LGG54cJBc/k4ivjhiZrOy62/dzpY/fxOnfvcIxz97hPziKcIoo7Fqd2WKeJ+q71QucBT2/ciL7P3Zfcxu7jN74zyzt61ibtc8g60DwipBKJk1Opmin2i2rkIExeuMrFFu+L7beOHvPk42CNLgKKNs9DYr6z+whtu+7l7mb55Hq4bULCIeEclt1295hkRQhETyAEsN87ev5vr/6hYO/tiz0JspHaILHJd7KXKClLv92lScff4Ua++fw/18i+9Xfy9HUbOpPXcpLhSzTG99ZGbbEG/q8lgpxzt5TkF5s1aN4IwOGy/8+BPMj2bwfjGCcFXMih+JmpXttBf3u9ir8EPw/D96mpf/w4ts/NotbPzQVma3D/B+XWScuRR8i/tOc+w3ThJmh4hPhGhWbM+v0ItQLePoNIRYzRGx9nPQH0dqGmoLMBDCJmF2+xyrblrDzK2zzO2cobeuj/QVfIyNW4MLAUnle3rIaC8yOpo48cXjHP3tJzn39AK65MyEGSRMPA61lQBnxF77c32eZbqXwj+VlK4yExcVOTpm98ef4ra/eR/uDRIcrJi8aBltLHLhK7Xl19HR8bbQFUgdHR1TAsVxy8l4iEhsuP7P3YnOgYwU8wajQgitm5m3rmmC5Daos1g0kJk0Cspgv5MhKiRDRGnE0SYxv6Zi9k/uZNuf2cnC4ws8/1NPs/C5Y/RlllqcoE5IkXFsEA9U9LDTNfm0cOrpwxz7xYMkcWR1ZP7u1Wz94GY2vGczunkImpG6LiGqVxHTzKB2ID4vJTZ8YCN7bp4jPz+iWQDWOtv/q1u5/tuvI8zUWGNYTkgSogimi5gPwRXVpv3GtF0pIQqkEAh5kRv+5I0c++Ih8pdqqN6Ki1dGvSpzJ1oChc+9cBxpdkLVVlj+xq9tUkyU+RJDPCAZZOuQ/qY+mSUCsb3WShdAlFaW98aFiGpk78+8xPjLI6pBvxRyKiR1oieEUDbKVmwtmlA6U71Q5vJ0n3Ho37/ESz/9LBs/sp2bv/tOZnYOwRqyOkc/e5ReE0mVEyY3DihzV1dq3pETEC83OMr5CGVOLTXkVMOssPrW9az/4CrWv28zw+3rkWiQG2rPxWDDjJgzWZSIghmNgFSJGOeojyR2/5dnOfTzu+kt9NBhhRKgako31CbOeO08Wus393orOu0iSXHhjBbIaq25Rib2+xz71AG2fGQXqz40h55TUjCUMWYDRFMnr+vo6OgKpI6Oax1vZ4cmsrRgRUY3SjWr7p1l9e1D8tiI7iBxIm4qm4iVYv1WkzK98w/thluQyTxJbjewzrSzYzFBAs8we0+P+//ugxz8tf3s/pnnsQOZXq9PDka0SWhoJuug5NhUAekLfQvImczZzx7n+O8dobf5GTY+sIlN79/G/N2riGv74AnLGc0wCRjFZVlSY6Fs5jRP7yabtBK9iWU0K16jC97epX5DxC88tHOh8/M6GVCTP7s7LgFixprEmjtX8fITx5j/yBpu/+77WHXHAGsWSU0oBgsRPDtZBbV+O1JvKyyxl7+/uZf5E1OYbdj2zbvY/cTT9ChdHmlDfJPYsnOYtxlGbUFsCMEd1cDiK+ewOhDiGHKxYHYR1BXBSiEkpX+FCrRdKBcluiPmzG5fBX0njALL1u42tQwv9V3JRLJQrrdARS2JaJAWjaO/vReqWIp5M/AB6uP2Om3XXIXMxAzDqVec46iRWQKnfv0Ijzx+mpu+52Y2f2wTOpjhxJOnCTEBFdkSLpGqnYO71KyUn4lIsSVvZwZLlJW082PnH2uWyWSiYtmwpsYGTnVLjx0P3MTqD25m7S2rSQMjZofxIjkXkwaVHtGb0l1un7d2qDQSK/A05PinX+G5n3iS5vmaamYen3HEc8kw0shKG/nJMipvLFlcLkQVEaEJxeq+FO3gbvg4cvgzh1j3wdshpNKx1IhJIloo7phdB6mj45qmK5A6OjrOw6XdveYxGz90C3EQacapZOBcbPr86+1q2gRNyQqLhsfEtu+8kQ0PbWP3x5/m2CdfQRpHe30CSqNOlW2ak4MJRoP0ewQXZl2QI8axX9zLod/Yy2DHKjY9uJn1D29l1e2rkWEmUWYgNBVDh2AGnkDDJL2TjBDbjsQk92ea9uK2bC3+ZtKpt2Hw5M2sq12FaEZSIeUxqx7awK71PXb9sZvQQSKPjZDLvfYQKiQnQFqXsDc/mQHKMLwqeWRsee929q5+ETtbViNJKnbgk4DXdmOavdzdF5GpYYOI0JxJpIVEXC24OsokiNiWC5v2T9Jae2vJc0XUqS0xu2GIaJFuTp5vZQHp7qVr6GVOSqnINFSiZDcW9pyhPtYw0+uXjpCUxK+S1WOve7omhXJ7cFg7P9UfDknHEi/8k8c59sWd7PzOXYxfOgtRqMYBC5ApgblZ83SG51Lh7m0oLXirccvtGkMxKfB2ptBa2/RgSmiMnDMpGr2tPTbcv5lNH97B6tvXElYHkifyeARjJ+dSlJiCElFvSFIyrTQLmgWPjvcCiy/VvPTTj3P0t/YzV89SzfRQLXNrLmEaOnzxr3liPT85oUJVVRx/fD+jfbvobVHUlIRQORg1mbCcy9XR0XFN0hVIHR0dU8SFrEplSm+tsO6BjXhKbQfoIjf7/uaFhIdSdIQckMURvS1wx1+/jxMPb+fZn/4SzVMLxFARYkAkkMVa9ztBJUKCijJEnoLQm5mnMvAXGvY/v48Dv7SH4Y0zbPjQFjY+tImZnauRgRBzjalCU5y6RJToxTmt3ME2kHL3WSY26MJ0s3kpKDI0im03TsSpY8AWnOs/fD06OyYvABpJoRQgVU4lJ2lioHGB4/d2bqbkT0HYBDPXzTB6arHYh6m09sjnfx9luaibWIJrqMjHl6hPLtJbP0PKTVlWyha4dOper1vm7cyTk6Iz3DZoO0v+ujM9siK/RlwokzKCZYe+cObLpxn6DNAUMxAByYkg1bId2usw2Vy7gGsoL9+dGAzxHkc/vZs171tLb15pFpUc62J5n2i7YZe2OJo0Q0y8dItFiO25y1LOI1Ku6OjFya1pMp4SbBLm7t3Ihg9vY8PdG+ivr8hVjTUNMmqIVrp/brFYuosRLKJmNCETEDQHmuCECnQpsv8X9rLnZ57DXoHZ4Xq8P6aUKFrksGJk1bfNKOE1Ab0xMD68yOknFti8cz3ZG7ShtFA1oP4mF0NHR8c1QVcgdXR0TCk5IMJSGrH2tvXM7BiUxgr5bemGvBmaHdGKLI5KA02gDiPWfXgtD939tez5+T3s/7mX6J11Us9RL3fmhVhmT7ShaW2eK/HiCSEBGwQGCN4k0pcX2ffE8xz4+EusumstGx7ewtoHNjLY0kNmAtIkLDkNVjoVtEWYnd/JmWb0mOO6/PnJR2+3OOfVhYOUABjUMk1wXAPVaMCef/d7HNw8y33/03thfozWlA6bQNIiTTL34jQmb95B8rbWECn5VrluWHvvag4+cZYcnJjLPfYkJZdq8uqlDeZ19xKQ2naXZFFoTtZ4mEUbOW+dXm8jXDKOSoGTM+gg0t/UL1lGr3nciuNua/lJF0SzElSxCk4/eRrtVSQpTo0AKhErJ/iCZ85KhYx6KJ0Si5xjgTu+7x62f+t28lLiwP/7OWQYiSnhoY+7Ee0d//F5U7IIQcr1Gnyy9tJKyZTgjqSINyMaaWAO5t6zmrUPb2fDw+uZ3ziPVxnLNSnXyCIEKZLUFCBYxNzxVgrrQBOa1lWy+HGHGDj12CK7/8NTnPj8CWZ0FuaM7ImQFdE+jTmigvL2FUdvRPA+Rz53kM3ftAXzhkqKKLRIDb2rjzo6rnG6Aqmjo2OKt6YKKWTWPrgVhiDnrARptq5c7xQigmcjkiFEajFUHBvXhPnArr+8i3UPbea5/8cj5EMNGgN4kU5VorR7bnq5yKDqKCiGWEOWCkGpQiAGoV4KnP3sIqd+9yniFph5cD1bH76OdfdsIK6F1IyQpOhEutUmn07KgMmchulEiFOKjXdqT/e6MruJLXGIqAx47qf+kHpf4uzukzzxr57kvv/u/dThNJ4zfSuOY+YTO+N04XM5seD24m4XGmXunjU0zcv0Qg/1UnidL0VyXAxxxTWUwgMIUWjOOWf2n2CNrj+/c/SqvehkbMsm817eGhrORYbrhqWD1G72X29tRKQ8P5noAVcrBiHnKpaeP0ujxXq+DYkqMj8xXGIxI3gTohdpX5JEtEg9XmTnd93Ajj99G834NDs+upUjP3+Iek9mNEz0rAYirX/JJSN4KYwnph5Q5H+ghNIgZSkvUd0zw5aHdrL5oZ30b5ojzCZ0ZCXsdql0ElW0ZFNZBgV1aU1daOfyissdDPBcbnbobJ9jnznO0//kEfRsZHYwU6RvngnuECtyTkRpimOhV213+J1btL72OfvUEZpXRoTN2kYL1CWnQOJ0hTo6Oq5NLm3fv6Oj47JCKFbcg/nIuvdsomky5g1R9B0tjqBs3i0aqQokhFiaQrgoKSV0sWbtPRW3/+170c2wOFog4SiZhoaeGdEN04QFQQ2qnIsb1sRQQIUkjjImzhhVv48cG3D2V07y9P/+KH/4Nz7Lvp/fj9R9wnwPKlo748kMkk7nkcp6XexQ1oVZOWvz6s+LGlJFDv7cSxz8D4dQ7TNb9Tn1K7t59icfp4qz9DTgOZCAgGBfwbksHcV2ykiM2V1z6HwPGivGA1PJ3rTkgem81iRfxkle7OCbI/W0GDJZ7qq82ZwVKogEdG1ksG6Ip4xYO+Mkr+3eTZzdI5AQTDMMIscfPUk6XrehssVJ0bWV4WmcHu+b0WDFlS9Ac27Mpq/bxG3fewv4mKpRfDZy29++F9t8mv4oozZAkRKYegkxVVQDtBbZYMQEvtQwthHjnXDTf3sn7/+HH+DGv3Q7s7cPqBgjCxm3RCZjoYSzGoZZCYHGcnv+SvEoVq4JB/CGqnKk6nPyN07w7D/7IlJXxP6k85gRnynXSk4YFSYD8FiMUeTiCpQ3vaYAAqRjDcefOIL2Y/n58oDKlRvq29HR8fbRdZA6OjqmiJXU+7nb5hlsH6JNjWEl6PUd1pwoFZ5rzHORrYmgouSUiKEHZPKCMX/3HPf94w/ywsef4fgn96N1HxlU06BTk9JFwor8xzSUu9Hebt5Vy/yQtd5WldMPQ5xMszfz8r94ksOf2sOa929j6wPbmL2pT+xZsThPuWx2vdyJL5KrN95YX1i09ea8kTV06Rwp2p/j0CcO8OKPPc0Mw2IQKEKvt5pXPv4iq9YO2fydO1AfETwWmd30eCdF0usfvwm455Jb5cVmub+6Yv0HNnD0UwcJlLv8E6fCld/T285Q6SZMZHDKwr6z2Li4iqnb9JlXTnxMXBBNyqi8u5NTYrhpFd5zfOKE+IaXY5klqybOaYCMIwc/sacNFBakvRTcnaBSspreyvmgmA0sLCVWv3eOG/76/Xh/hIyhEUGsYdUdA+78wffz5N/7A3pnA/QSlSv5Hb3B8PpXWnGuA6ckOKs5jRkjz1QblNX3b2DzB7az/j3FcIHUwGJqbwR4Mew3WQ5htrZTqm2+lYTS5bFQ3icCaA5YNKpBj8UXFtn9ky9w7LdfoUe/mGu0GcFKwClhxKqtjJfzO4sXw8qfnVcHyIoICSPkPsf/8Cibv3kbQiZ5JEpuQwo6OjquZboCqaOjY0ojAffE6ge3oMOILS2iGqlbI4B3dJBCEtbO88QcQIyUMyH0MG9QShfIxzXDrQPu/sEHOPaBbez+98/SPLNI7ldEBgAlF0kF8UCvgaRacnKs7OizOFF9ajCQQ4OYUEXFfY70RMO+J5/mwH9+jtW3rmPTw1tZ/74N9LcNEQUfNzQOohVKDa3crLBifqKVb13UsrzqTnjpHAmh1+PkF47ywg8/QkgRj4JgKIGkxjDN8MKPPYpvjGz52i344lnQXrHeZoz7cHq8r1ckTQwwsFzmQkyxYGz75h0c/e1XlqVxYbL5XLYKzzjBQKWV2UnpODQnx1hjeCy28pN1eq1Ur6UN+02emNs8j/QEGUlxkmvXwl+1RuYgKtQYwZ0Qe5x58iRn//AAGmZQF8QM1/aY22Djid09vPHmvO+ZUZMY7Bpw5w8+xGAN2LgH0hAJZBNsVLPhvRu58//6Hp78/z7GbD2kqUoX7t3g1cUAQB5DbSPiKmXVHetY/8EtrH9wPYPtPagUWUrkumntvp0wlYxO5sActwZpO6lMOnCtfXbSRHDFCTBUwqKz7xf3sfdn9tAcXqIaVKXTKG3PNUA0wTCQMA2OnVxHZf3fnoJypbX5ym5srw3EPvXkYcavjOhvMKKVQtNU3rXz1dHRcXnSFUgdHdccZdsj3qbLS6aXlXEATYavMTY8uB5SjYWMWCkuxOQd3TI4oDaZ+SkbNFUtXQy0dIAklD1tcwbTwMYPbWLVvevZ97MvsO+XX8JPJGTYAxJKhYmT1UqDw5aHXdQht5uysmEWXFq5XnB0IMz7DL7gLH7+JM99/jRhU2TdfWvZ/NB21j2wmmpD6VXIKJI0lY6IKGpFelesnYHWaS7IxAUPoGzWXOU1MziTtcg4QYsl87QXIhm8hw4HLDxzkmf+8eeIJyD0ezTiBCuD970MFivCeI7n//kjzK/5KPN3D/ClhMuA3DOcREyOSCSbt3bPMp1VKTKpSSuoPcLkzL5nNbMPzDP+3TNovwfW0KiiHogOtRTnuSxSnMlcSwnWM5qTMD7WMLOth1txHIzWDke11t+0Mq1lW2xBglBtFjwEktZEb9dQlr3spjM2CiFHUpXBx8AMez+5n3QWhoOA41goWVzKa2v+YJS/z0ZQMIslPNSdcQrkjWMe+FvvZXhdxBYTHsE9kTyigHokj86w6duu48bTS+z+N88xzGsJUsJkrZjVIx7a5z5/Ay9eLtCMo16CalcWD5MrxLXthE0KfivXUoptXT7OjHOC2cjw3gEbH7qB9e/bwNwNM2hPsZTJTUIbJ1NMP4q1evtxW3RmKaYUk0K/zKWFYs1Ppj1cJFZEqTj9+Ame/4nHOPvFc1Q6z2DQZ/qFE4GqrZwxW541W7763z7Os4BfgQl4T6iPZU4+foqtf2QztpAQLddv22Re/rrp8i/LSDs6Oq5eugKpo+MapPRRWumZGEmhSpGUxszdtJa5HatJPkK9FCbi2m6ULuFBqyCewcFkBmnK8HgYws3fdycbH9rEiz/5LOe+sEBFhQ1KuKi4tnWVkADEUTeCBJKUUkRRrO0giGvboSib717Vo1LHTydO/sY+jvzGfobb1rH2ofVs/MBaVt+5ljg7j3kNuUbISFaCV2SF0JpIYNYGZjrBHAsrOihtsYQ4mstOLIhAFjwaYrFkLllG+1Dvyzz5Tz9POtpjGCtMagKOa0Qc6iqjuUF6AU6s4ol/9jnu/98/yOC6ChkvIs2gnd9JWC4dl4nznBTtYDFbkOVBoSI7cmKEnd98I099/jGCOC7Lv0ZqzSX4tc1AKoGzk3MXGJ1eJJ2u8e0VcH5heF43qN2kT0xDPML8zvVIbmVY8uY5nk1sqBrHhxVnd5/j5O8dpNefo9wSeOPNbTAglBww1YC5o14zkkg/Nfig5u6/9j5m3zPAFhs8BjyPSKFPhbdyNiNphY2X2PWnb2XxxJhj/2kf/d4QDEJwzNpit51vKyYKZUW8dalQJrMwjqlPy4aAlvNkUwEh0UuXr0mJZinhPaF//Qyb37eVTQ9vYfXtawgzAfOENxlbslZC2Zq9t4pFkcnCLl8PQQSnLl0VCziKqiPZSCFCSETtY8cSL/78s+z7hb30z0VmB0PUa/Jlus1Qh1qdXoocfvQVNn/TZiRm3Ce27K3M7hJbtHd0dFwaLs93ro6OjneOieGAlzLJ0CKBcmVEw5a71iEzBiMDD1jwiw+IfTvwdvNoAIoExb0BN2zpHHP3reb+Wz7IgU++yN6P7ybvq4mzAyxAkIR5KN2doHhrrxAQMMVUCeZkLa5epXnhbW3QYGLgkV5cTU8y+dCYwz+3nyO/vI/qpooN79/Kxoc2MXvzGmQGvBmRzNFUQk1LtssKe+UgbWesbMamHS6WkzvdDSolpDCVANLvk08GHvvnn6F5OtEbztKIYW7E1owiItS5nUnJTr8HeXfD4//sD3nv3/kAea3TW4Q6ZnoAbaCpmKMiuBsWFJ20Vtpjl1AKJ0sNa9+7luFtczRPL1D1e+1ck7dZUaUInBRaIkK2IsmKdWT8yiKr7pmlPXWYC7rcLGqDYoWAkbwt0HrQW9/HclMKnDewBZ9+TKLRSCVDjnzqaThaU/X7JPULNyi8QnUys2bkqPSSU/uYXd9/Dxs+uoZUj0pnVRxCj2BWTp8oOTbEFBEP5P4Sd37v3Tx+aoHjnzjB7GAeszEisZx3dfCEe3FMNLPWlEKnP5+oIyblZoVYK28zsmg5Z9lIKZHE6W2u2PzgBtY/vIU1d22iWtfDfYw0DV43ZPPWkr0sQqCcb51WSOeH7y47Aobl7q5nQHBVQhA8r+bIb+/l+Y8/y+jZJQa9HjoTSlfWMpdr4qqJ4CR6oWLpyTM0JxuqNV788N8F85WOjo7Lm65A6ui41pho8oseCPc+wWqaUORC6+5Zhzdj1MGk3El9p/J9vhIEMANECDQkSucj5ApRJy8lmujs+M5drLt/Iy/+zAuc+LWj9JpIHhSZFKpka6hEcRPMFNdSJsbWhM1bU4F2x0uWgJT+TCuDUjQaVRVRy/gzicNPvsjRn93LzO1rWPPwejY9tIWZbbN4P0GqcdE2l0mL9Xi2Ih+UjKmjFsrG1UvBUB6nmC8hDFCr8GCEUcWTP/JFFj93hpn+OsQWQao26LR0fRoHkVAUUQKQicOKpS+e4Yl/8Sj3/Q8P4dUS0aAOZRZDHTxoMUDQSTjrZOPcFnhepFWSjGqVsO2bdrD76adLQSVGZZBFWa6rlsNcRaQ46NWwcGiRjSGWrpeXdS3P1WtzlxzMS5HqkN3orx0ws6Z33hX4RtdiMQCIeC+w9MoSRz+zn1DNlK+4wAWcg4Ab6q3td3aiRc6mY9zw5+5i57ffTK7PohamdnkytbbWsq22gGsossIkpP4id/y1h3j85GMsfv4IYXZA8IxLpnGhR8CkFKmqjhf7AIIETLRN5ilFn6DFMjwLjDNL2lCtFQZ3ruPGh3ew5r3r6W+u0OBYncmjhfJz7m1Bpe3Pv5WfadPSESpSUFmxPpNrfWoz2H5eCWLkkJDeKsYvLfD8T3+Rg7/zMqtHM6zqDyEI2RINmRCqS/iOcWGUcgMoH21Y2H2atQ+uIwdDU1PkvB0dHdcsXYHU0XGt4St19V5CHFFSTgy2zzF740y5a+xWNvNTidUlP+xyl73taOhEHqROI0LlCfFEvaTMbB9yz994kCMfPMTuf/c4o+dqhjoDUcjS4FbuvofKsFRmUppQrIpTK0DU6XyIESyQHFJoDQc8lOcXQfoRrSqkds49eoozjx1l38dfYv7+dWz50CZW372ZwYYBVDWhrnGLZJk4hJVOmInh7qgWcZNYBoFcygoIjtLn6R9/kuOfPMhsbwOjKjHIASfgkhFPxdJcpXQlpLj1uZdx8/5wwKlPH+a51U9x639zK1kg5qZI/9Tbzk+xVQ+m5wXJSttZmkiwrHE2f2Qz+//zc6TDggZF3EhSpjN08jXt16vbVD63dHihqMtaB8Dp4D/FIGDyfFkgiJLGif6aiM5ViDUXlHm6GG6REAJHfncf40Njqt4cy8KxN0YNXEsospnRF2VpaZFt33Yj1/2lm/FmEXKF61JrQFGEmx5CKajdqQhkd8QzQQLUDmvhjh+8gyf/13Ok5w0fQLCARcG8JkkkGogHoGqvwExlGRdIbfcuZ6NpasJMYPb2dWz90GY2vG8tczdUCIGcc5H8JZ9KHctdher8LvBkditPrvMV6zeZQWtnnrIaaCDkRNYxUvUI51ax9xde5sDPfpnmSGb1YIj0AlkgU85p8HJd62UsUSu292DjzMmnTrDufVvwtFQKJxe6WaOOjmuXrkDq6LjWmAwdtLklPVKZfxlnVt2ykWptIE+smMXBlSR5OlNyqfCJ1IsyOB5bGVIiU1lFE6BCiDlinkg6YtPXrGfd3V/Hy//xZfb/8kvoCScOK9yMHIvEpk/Ec6AOxXZ6WWlkrezJqbVIk3TFHXYoapy2ZiJVQqUVYhE7Jyx+6jjPf/oYYcfzrHvPJjZ8aDPr71qHzDmSEmbW5jVl1AVVLcUfFOkVTTE4EEdi5KX/+CJH/9M+ZqpZ0EzPE8Faxz6ZGFq0Er5i2YdYGa43UYLAMA45+Asv0t8U2fVn78KsLiMWLpR/FMu5zB9N84zay2YysySGNkJvc8Wmb9rG/h89SG+mIgenas0uZBJiO/3aAJ6hUs4eOAdLgsQ2aNZWGiV4WwSX9pG7ExxmtgyRYUTqNC2iJmGxKueXPRlBK6E+nTj8iYNU3kMULJWN/pvJp4I5yaoiGYyJ8ZIw96G13PRX7wNpwDMeAtH7ZE+IGiaCZGudz4TshgokFYIVswqrMzNbI3f+jw/yxP/y+6TDShqCeiJaDxFFpCEJBIzKMkkamhiJKRDHzkiWiLsGbH/fDWx8eBvzN80TZgIwJo/amxlY6YC2hfFEOudYMVXw6RsAbpNzLtOicPk8T37m2jBYS1hlRJ3h5JOLvPjvH2XxCyeIoc+wVwxPUG+LiiLhCwaqEbtM5WouTjAjS4Wqcvrx06TGCdmmuWcdHR3XLl2B1NFxDaKTTZIUpwA3wYKx9j3roRIYOaLemgdYu426xMfcdo9KkKNNBGAEjzQYkYpGMkFzaxLQw85lbE64+ftuYuP71/H8Tz3H2c8dZygDhIrAkKzjYtrQWgvrxN6agBuIVLil1uWuBIu6KOJOsAAUp7wyLqIgWuRhM4GBgR2Cw/sPcPgTBxnsGrDjO3ax/Wu3E2YgpAQBLOX2jr2usJoWeu4wGLD/E4fZ+6PPMhuG1BWEXCMr5ICTwf1iApeLTI1irBE8ENzJooRKmGmG7P3xPcyummHjH7mOlM8QbbKGlGLZDX3V3fOyFqXI0Ozk8Zit37CDg7+4Dz+l5J7Ss9Jlm2zOJ+5r7kwNQeQU5HMJXadkn5guLD+XkXEPqCqSjLHVDHcMoRJ8XK7FN+sDCYrGwPE/OMDCC2eY762iyU3bWbM3yU8SsjqqDZ4jvgRyd4+7/vsHifM1vqSYlgDTWoUqS5HFWfvT5EWWZW0xKOZYNGJjoBVNXTN364DbfvABnvoHnyeensF6gYyBF5Hh1GpcA5hSn2uoBw1he5+d33YHO7/5OsLqYpqQ8xJ1LlLRShyXEugqDAgEoMG9mA6UFdNpxpCYT+e+jPy6P92OoUGL694wMD6c2P1zz7P/l3ejZ5x+v6JRyNaWZu6olDgA9zLPdyEzjUuJSXtNosQYWXjpLEt7l5i/rqJJqZ3V6ujouFbpCqSOjmsVyeQgqBV7bZsXVt+yGk/ehqC2hZRba08tl7SDNCmOylZPmWaUYkSKq1dwwXoZTMrd4RCoGseamtX3ruHBmz7MwU8c4IX/8CjxwBLVYI7FoKhlKheg3D221qq63FRPVFIKowQEInhCxHGLIJlgSgpGo4JYQCn26E2IoIl+jARTmucanv+nT7P/U3vY/PBONr53HcMdq2DOsXqE1HUZ7m8trHW2x/E/OMYLP/QkvTSDRKGyRBIBaaVc4rilEuTppdMVshQHPXOaWM6xuCFZIPTo5SWe+5HH6G+eYf79a8gLI6JADhk1QT0WqRq0UjhpbdMbzBXThDYws2OOzR/cwiv//3300gx10DZHpzCRa2Uvs/oxRpoTI0anR8ys659/glvJpKEEVVJu6Lmg/Uhv4wDJiaTWFqVvdE07hIwvDTj4ySOIx7JG6kU2VbR9r/eF5b/iZHc8j0nbIw/+9fuptiV80du0qIi7EVqPeM1Cu7hkqRA32sjUYsRgGdOIs0SwHj5KrHvfKm76a/fx7D/5IvP1PPXAqcyLAYYLnjKNL5E3KGsf3szWD2xj/oG1DDZV5DQmNRN5bCB6KdkNQzwgElrDDGt/PiYzRNrac5frQ7RI6Er+UFwRdtw65IkjKBICwWc48ukDvPiTT5GfX2QYB3i/HIO27pZCcbsTa39opDUe8cTlK1MrTn7S9o3z6cTCs6eZuWkD5Aa8d6kPsKOj4xLSFUgdHdcsiuRE1gB1YnDHHMMdPawBaDd/wdoqRC/5/dSVMy0rb0qXu+KtIEyckCbSsNDm8ZTH2XgEvTHbv3Mjax76el74qac5+YmDDBcrfKZHNmud2zLBQnHMwzBC6Zx4eY5SJtF+Pk/vkMfcugpImh5gmdsoa50VQk8ZeEXz6BJ7v/gM+9YpM3evY8uHt7Dprk3EzTNYL6F1Q6yGnHn8FM//4y8yd0oZzyRq6yMSywZdKd0Bs2lx5KWMbZ+TMtBvy3M9KQIk0IpwLvLlf/ZF7vx7H2DVzQN8aVxkVyI4NrWbznjpLEkCgWiGBUNMCJLZ/LEdHPnNY8QlyOJk9VbiVVbJ2xykch4UlsbUJ2pmbxrirZzP3AgSl7V2nkpHTwyvnJmta1u3t7bLY4E4tU2P5TWJIxaIVY/jTx3hzOMn6ccKn9hplxYY4lLmdWgIatRAZQF1wWLCRz189Vnu+pvvYe7mOTi7hFdCbueT1GRqWiCt5tKRtjARjFyCVSlGDy6p5Ah5G2M1MrZ+81bGp25l3w+9QK8eMJKaJjvVsGL2njnWfegWNj24keF1Fahh2bFxcfCTlcG+UnKIpJ3zKfk9Ps2wklaSOjmXxbXdW/MFQbRYx09Vt55RAjk4sVKW9o3Z/ZNPc+zTe6iaefq9OTIJ0x7aGBpWyOcmeUbt7J6/jWGv7wzFYdK9JodIaAInHz/Glm/ZWM5X+37ikyGtSQaSK5f8zbCjo+MdpyuQOjquQZY3TOVOcnZjyy1ribN9vB63G0/A2oyc15n1uJxYObjvr/N3E0MEtUiTama2Kff9rfs5+v7tvPiTTzF+domZqk9TOWLadoUqXEuvylzaBB1v05S02G7z2qDRNzs2KIVKVRV3Lz0njH/7OM/97nF2b3qedQ/Ms/GD17P+vjUs7D7LU//o89THDWaG9FMuBYhTHNOmNu0+lQMty+L8TY/FBGwg5FcaHv9//QHv/18/QtwWCEtKigkRSujsxJ3N2zmn3GY1WQCUpq5ZfdsGVr13Lac/c4xeHBbp2SRp89UbZHMsOacPnGbt+9YwmVjR4qtdNvRWumcIWG6o5oX+mhnchCha3AvbIiALmCV6EkiSUCmZXfs/tQcZGzIAsVheg6Ri767FACGK4TmgEnBqUoxoHan7i9z2Aw+w4b0bqMdLVKF0oYL49Jy/Ie16tauNeyZ6mYkrtoL/Z3t/HiXZdd13vt+9z70RkUPNhUJhHggCBAECIAGSIimKGihZctt+7UlT2y33k9vt5ddW+8m9ZFtDS2pZHrVs93Kv9rOXW7YGW7Jsd8ttSyIlUhxEkeIIEiQBAsQ8owoFoFCVQ8S9Z+/3xzk3MqtQyKwCUCKI3B+uYlVlZUbcuBGZuDv2Ob/tSF2eeOWfvYr8vPLYr36FyVVLXPiuw1z0litYvGYJnTid9/R9h8zKssfNixC3PoZTj7EUS215pXiuRX4trgGVDCrk3ODawziR1hoe+/WHefjf30N3FBaaXXQLkK0rBVTukabsNfLtvgFepUpSo9NIA+Y4DcfvO0o+/npkWcv7HO4vGDAbxVEIO0MUSCHsQGW5TZovo8vJWLphNyQvwzhV5mEORtkP86rdTHAWeiixyd7RaMJWBW9PcsG3HGDPm97Fo//hAR77f+5DTwiy0JCHWO8hVY0yZ8gQsjRlqWF20JLedrY2X0uKCB0ZnTQsutI/3fH0bx7hyG+eZPmmhsN/5Ar6vsdokSl0Y0G8o/EWpy+JZ+q4KmZDCp3V7sbGrJsz0bpZv2mXmX3xBHf+b5/hph99J7o8RXqr+0e8xjZ4XS6lmJZUw6FOSDnhS5lL33s5z3z8KTrLjHS4743O1bC/SqSEA8yOdnhv5Thca2pfuXRXhJ4Sg8400e5LTA6kcnGfy1DVvil7kZI7SShBFGakZsTz95/gxMefYZRanFzjxrUOQxWaLHSpK+eMEa0ZOTmWhc46rv6B13Hxd1xE7maMTMhkGk9lUO4piXsvVAq3hNfABHXotMfJjPKoJAOKk3wBS3DgLYdYvHyJQ+88RFpoce3o80lY19JRIyHJcJsBZ1jydZbFiXtXvqVV6SyXYk+F7EqipdRIZb/byc89y72/eBfH7niOZZYZtT1ZHDXBNdF7pnFFs9Ml52vfW355SvaLISkxe3yNtcfXWLx+AfqyrFLrsN7tvqdCCK8tr+b+dwjhPCkrcWowQXZ0r7B09S6s6zeWlLCxbEe2y1Z+lSsXuD2o4GYwMhwlr3Q0u4yr/+K13Px33sHCN+ymn85ITpmb5GU5Xa4zbpKVzkrZ5C5g+aU/B16imN3LUNamaVgYtbQ+w0aZS77zCm77J9/MwT92AWvtc/j6Ouot3aZ3tGvGAVaXTg3DPc/mQs6ATEe7a5ETnzjOnf/sc+Sc8LKeDhsufK10qYyMmAElBlxrYdivr7HvLQfZfcMu6Gfz4IUzPubSsmDlsZUaJb/pHXrZ+JwSslGK+PbACF/oaxdGcIEGQa0M8h1uo3EHTTz+248gz4A3Ct5gSei1r5e3dW+WG4kxvWR6nYG32PrzHPqTF3LFd99A7taRrPPOaVY7q/13dYFjKaylLc+xZNo8KktB3ZEFpVvveeBffZXbf/wjdI9M0T0N3WwdW8t1MHDZjWVieHbEJy/r9Z9QspdntKUpS/8MGgzTDpp1PAsP/PO7+fxP3M765zp2NUtocpI3mAomXoJBrAGVkp74GnmP1VE8KawKx796AmnKTjKGqPQQwo4TBVIIO07pAIgajSdy74wuW2DXoV1Il7EkZfP2PN/Z63ycV2+RJNv8m0vdu1H3n9CXmTUqZZCrdass3zTizT/1dva/9yB+cr1ke2kD0s2XsGV1LNVN8O6ly/EyWA1j6JKTvWEmia7tueK7rkOSMbqg58YfvoEbf+IbSVcvcHK6hgJ9qWLKceV5mgRWeiZndVGX3EkKmp12YZEj73+UB3/xTrTZhYvTWOn24Amhds1qjAJi8+5akxOy7Fz83suZyfoL0u9y/byhEBJRZkfW8GmGpJvmcdbIjVogufUYHQsX7SKNJ5AVk/WS0OdDIWiIliRBb5TZEzOe/shTpLahr5vvSwcrl4tdHHGnlxEdiYay92l9fY3lb9vPG37wBtw68ISJkVuZ79nxs+mUuNAJZEmYzZBWUVso3dpRJi0pRz/1LF/4sY/z0M/fTbMy5tjv3kv3xDralG6uuNC641YCQ0QoKYkvw0yNpA1mGZIhlsuSWYekI0R2c//P383jv/AgaZbwSUczdABd6wwlQ6Gm1JVlkefSPX21kfozbvhWETJ0zom7T0K38bNOXqUx5SGE8+u18fZPCOEc1OUybuVijhmHbj0MuxKsdli2+bIZr3tP6t7vVy3f9t/6slfHKHtB6mb9LLXIMMGmDmnKdf/fm3jm3U9z9MNP89wXnsGfMxophSMITU6lS5Kc+eCkl0gpaXnZy8XntJtywXce5OC7LyTP1sCUnp79b9/N/rd8A8/deZIjv3eEZz/1BP1TGVJTlkvVAymPxjHLpwxgPRMTEBcSQqczFsbLPPFrj3HyoTWu+Qs3oFe3+MxIQK57e4a9P6VTYmUjvirddMahb72Mo194muO/8zRN0w6JAeimwkjcaTTRP7HG6lNrLFy5iOehDbZ5eHFJvZuqs3jtPrBpyS30etnujomTPJXLVwFmS9zz85/CjzoySiXZ0B1yWV7JEFCA0BqIZ6YOLK3xuh94Axf+yavIOgPrwbQOES3FWBKvg3K3K4idBsHo0WGfmGZWHlvj2Mef4tjvPc3aQydJnbM4WkZxTj62xgO/fC+v/6tvIKeuDKt1x5OWmTz68jsYjWvJtdPa/UyCW8PJB07y1Mcf5JmPH6N/ZI12eYyYYYzIeCkSU0Y9IZ7qbdQ8hiFm/mUf3deGyVDuD8sEjaZpeeaOo8yeupLmAvAZJdyjPrchhJ0jCqQQdqBeHCQhvdEsKwfedhnerdKr0tQrhzJPR+bzfcoejK/1kb90CSE3jrrP9+DgJVrZxGhEsKwkEfZ/w24OvfswsyPKw//pPh79jftojiVGSw1ZpqiOyS6Uy85zv3AaOjwZJwuMLbHeQ3Nhw7U/cCtJO3KnJbVajM47GhX237DIntuuhZPX8chv3M8Tv3ofa8/CUjNBdL2kmuURmlJNEXvxY2vc6FRRFVoyJonGFzj+B8f55N0f4tYfew973rTIzGaIjUlMMRe0ppT1JBoEsRnKCG1mXPcDN/GpL32UfKQUVlaX+5XwhXJBrar0J9Y58fgJlq7eXQOpreynci/dCi0zhtJY2H3l/nKOa6iASVne19RhqK5GMxnz4G88wNMfPsLSaKnMUlJB+gbVzQOAhWTKrOlg3Ul7jDf8zDex++Yl0slp6eh56a7ignoia9lLpKJn8UynEgahircT1h9Y475f/jLPfPgxJrnFxiPUR0hTwj56UUbtAk/+5iMcuG0PB959MbY+JVlTOj1SipFhR9yLvp7Y+vLdRFArg4+ZjHj2zue45xfuYvUzzzNmRNMkmtSQXUgJ1DM9Zb6Wek1D9DJo1p0a2HJWPbVXrWEgdPLy2LoktM2Ik0+c4PgXj3LoOw5jXd44s3XO2BBdH0J4bYsldiHsNAJt/aP3PaPDi4wvbpBea6q3vGDmkYttrEX5OuWUeU/U5VLzOUripTthjqjRaUZzA7OOdGDG1f/DNbzlb7+LpXcuc7J7nuxlSZeS6VOm142CR2r03/ZhZ3XvjQvJywybnFe44Jsvpr1Y6foydBP1cnGbN+LMZb2DUceV3301t/zDb2L/e/az5mv0XQto2Ts1T7WTukxLSHU/ldAgXvZVqQs9XiIo3GgURtKwcKzlS//4k0wfzrSpJfms7MNh40K8wUAypmWNnPUdo0tbDr37EH23Ti8LJCvFtXQJcTCpwQXZ6R5aY0hTzniNT67L4hw6N9p9idH+Huk3nkX1OuPHy9IztRGcdI7+1iO0NqoLonSeRthL6VAZpUByNZqZMJtMufaHb2Pfm3ah6+v0TfnK8qZAfX2IldeGeBkUPAxy5dT3ChzD1Mna04xHpL7h8V+/l8/9yO/y/PufZEF2Yws1uXBYcjgfSgwy0zK3qS6XNB32ZjkmWpprdU6UisznFtmm+UZSj0Pq+ZRhWZ44yBSdTJitNNz9L+/miz/yGdY/vsJkNEab0kVxL8fm7pSpURspjcMWxHkKu3/9d1PKjwLDVMm1S9dLZtQ3PHv3cWCEUl7ftpG3+CoYmR1C+MMQBVIIO40PGWOGkdl1+R7a3ePXxEXPS6WSGIL6kkNOQjYnzTI2m7J845hbfvo2rv0fb8b3CWurM5JB68LISwJaWW4m2HwZlmyb8KU4SsOsy4z2Zi76tsuhX0fUtu4ImNHPZjSvW+Lm/+VWXvcj19Ff4uRpuWjOGOJeEgjr5w/pez1duQ0ZjmHoENavE2jSCB7MfP4ff5LZs4600PRS9v9QizUH04YslMG4krB+xiXfdgXN/gS2VtLlBEg9UKKys5Zhu6tPzZBsZS+caO1IpDIsqB5T2pOY7F6evza9bImqy/ZKSIMuOkc//xSrdx0ntQ0ydI98KFw3os9dwbxnRda47r+/kX3v2UPuVnHbYiioy/xX5zWWwEvnz+eXzjX0YDTm+Oc77vhfvsC9//guJk8vMJ4sYNLzYlWzqtC2Dc/f/jTH715BJk1JI9S2vCaH/UKi9AhdXeqnzjwoIyewYa+YO40nOhpUBGlbUtrD0x85wu1/66M88Uv3M1ltWF4oA5J1hy4kUa/7q+pPQ62vF1fl+Qefw9dKVb7xc/EMlXEI4TUrCqQQdhipm+FFhJn0TC5dgGZjuOhOJFaHotYZkMP8SxNBcoeu9/RtzyXffRW3/oN3cOC7LmBF1ummlGVnyUlS4rYbL524LI5ttyhLesQMp2PpbRexfMVubFYCAobOAGyOyi4SJeVN+1Wsn3Lpd13FrT/3TUyuH8F0WjqBdSkcZiRR6rrJjZlJdQmeDEuntDx+l/JnmYyZfmGVr/zTTyFrEzylOvOmvFBEy3kbrhezJHzWs3TNMnvefjE67WugQpmZ1IvjVorGxhMrT6zCtHzt/LGV5PTSTeqMhUuXYKS41VlWtfPW1ZrFksHUefR9j9BMxyQphZ70pfDKtUtnqRRqbj1r3ToXf981XPwnLsO69TIfy7syHNj9zLNvShmJus334SAZUomIRjrayYhjnzzK7T/5u5z41DHa0TK5FUzzPFhicxjkEHrh7mgCf8554v1Pld6NCGSrQ22pc6WMRsuFvHl5e2MIUGl7cHXwTKeOi5FShnHL2mM9d/2Dz/Glv/Mp7CuZdjKmb5WpNGRp6GVnhhBIWe9ZUhrruAMRQZtE//iUfLzD9UzL6Xbm+Qphp9nBl0Qh7ExelzCZGdYo40sWIW97Kf+aNu+mDEueqEuZRFAarETHMTt5koVLhTf9yJu4/sffQrqmYbq2Tt/3iAmqykw6UGWU2XavguQxWWE66bj4266CxsASSsL81GWOZ7ytbCiKr8yYXOBc9zdvpblmidX1NZKVmT/ziG73MoC1ljQmwzKjjZvT2hoynEaM0ajl5Ief5+5/8QWkWSwX4RjiNdVOcn0nvtxICTbIXPIdV5AnkA3UMoYgmmh6pRdjpA3T59bpV2eIlK5biSgvQ4u9Lg8bXbgMbdn44u4lsKAGS2SHRpSTd63w7Oefo1lo5xHjIlIKpbrRRPoSz55z5qLvOMy1f/71ZF8vCXzm9KlOYKox6cO53iiWSnKhtYpmRb0h5RbNgrWgsotnPvEMX/lHd7B0coSOlUZLVHrWROPpRf5ju1GQpUnLsY8/xeojK9A0lNm5pas2FIhDkIWrYKpgpWOICmoz0LJfSUdj0voyD/76I9z+Ix/nmd84wkSW8QUlUY9FyuP6Ok/wf8lcvBTQtUD0+iaEAfmks/bcDNGSyZjk63sOXAjh3EWBFMKOs/Ef+9FIWT68OI+93qmGzpFm5vtPBuZOX9PJxrT0nZDduPBdF3Dr33snl/z5K+mWZ6yvrzAMOs3MSjdmm3OqGN10xu4b93Pg5v3kaY/rlJR9nl72YrdRSp2SlOaaoTMml7Xc8nPv4KI/fyWrk5Os+Hq9nYRbU5aw+QzF6v6gclvDPKFyUEIWIBtZexgt8shvPspXf+1OaBp6cbIo2esXmpdj8IyLY31m3427WL55D7kr86IUR61kKue6HK97bpXZc2t40nlhVsr3Mj8op46FC5ZKKIQPRUAJWZAa/JBoeeR3HmR0XBHvcfVSCCngiTwsnaJByYwubLn2r9yEao+b1u6N4KaYnnl+k4iU+bDiaJ/pRk5HT04Zllr6I8pd/8cd3P4zn6E5BkhD402JFpeMmpdQlNPegjjleZUESZkePcmRjz2ByqgsgU2USHVJmCR6lfp86jzwQszpBZARrmNktMgzdz3D5376I9z3T29Hn4RmuTxP6nW2GaVgBC173XagzW84lJlbJbEzidGtZVaOrOPN5uWHsqOXIYew00SBFMKO4/SUhLp2SRgdHGMIje/cxfV1fz5ZYKPHUi+atOw1Kju2OkQN7cC7Gbp/ndf9xTfy5p/+Bha/YTf96ippVs6tDEl5WzAp3YOLvu0ibLEvX0e9cPdNoQEvwt1BOix5mds0nTJaMt7wgzdwy9/+VpZvWSavPo/njDQd6jNER8xkXDaoy6nds2E2THJwSag2kHr2+CJP/su7OXn/lAbDZb0WHpThu1q6Loaj2WGcueKPXlG6lJTENrIwazKtN+XzT/Z0x3qsKSWlu2Nezn4SwcbO8sV7oO82zoEJSLnFphVOPLjGM584yrht6uPYWAqH92VvmZeidbbecehPXIouK5ZzOU5XPDtJrBYMpxYuQ2HkXuZLJV8idU7TCk1e5MnfepZP/82Pc+w/PsTydIS35YJazJG6tFBE6pLNYWnWmZ5PIZkwEeGpDz1Bf3w2H5Zr9bWQvMysKoVmR2MOvUFTXm86MTjRc+//eSdf/luf5sQn11hOe9FR2S+F1qIWw8xwKR2/foduqnHPpTPkOu+AioNKmUG1+sQqw5AuGZajfp0H1YQQzl4USCHsMMMSIuszzaEJ7b5Ul/Ls3LX15eK8xlFTLkqdcoHsBnhCUZIraok+WdkX0o3pp+vsvmmJW3/mnVz+P91Af7AlnzCwGdjW57TPyuiq3Vzwjgth1tOnKVK7JZkX2w9TjxkQqZ2h2RiVUnjkTrDZlF23LHPzz34jV/5/3kjet850fRVDMTMS3fzCffMSKxepS+6MLAJ9IlmCZLS2h8d//UF0PKHJ3Xz/S6lZnMYUrReUeWrsu+1Clm7YhU17TFuonQ+8odcOmQmrj88QLa89qfctIqUIWBCafVr2PanXZXpeB7c6pBFHf/cJ7KkZXVOG+qrDLOUS/+2OuCEY1q3TX95w0R+5DNbL4FhLXsbqpqbULl6Lm80XwS64lVm8gtK3J9CFBVYfce74R5/hq3/3MzQPQLu0RN+Uz7VkeFO6jqUzkemGx87GXJ3N92PiiDnj1LJy7xpH/uBJpB2VaHPXEp/hpfOWE3jKmINri7dC0jFHP3Kcz/7Nj/Hov3mEdHKBycKozn1KjPoWV2gQ8OG5yKXo27GLazdf/tTQDy8fb11Yf3RlyAs5bd5TXDaFsBPEd3oIO43XpTbZSYeWkUm5wN2pl0lAGRxb9xnYpoLEpBRJ1pSCqE8lPrnNZTleyj2NZnxmdM0aF3/v5dz6D97Bwe+8kFWcnPOWdzvrVrjk2y6i3T/GSbRZcbGawJbmn3d6kbQRajBcNE9xWafxhKd1cpqiqysk1rjs+67nzX/nW9j7ngtYz2vIrPzYzwzHVoZkbjoZJIdExlM5li7NyGPj6EefYOXeNWRxF70k8LKkLSFk6end8AQpC7LLufDbL6Ijo32DSFc6ItKXKPLOWT1SCsKyWq90h8wy1mfGexaY7B/XYnXTXhkDWmX61DpP/+4TtKMRoPQmpVMFJB3SHkAtMd3dceNfeyvtLqEb96iPcGrHri79c+1e9HlSVZp2jPYTHv739/CZH/kQz/z2k4zaFhaGWG2tQRKC2bCXSYGEkhmCUTbvb9q47DYsGTN1Rt7y5Psfwdf7spxOE147Y6YdyYR2dZmUWnw50T1m3PkPP8fdP/MZ+nuchdGY1Pao9aVDqMIseS0KraYEloItGZQNdjtT9hJoYZQlrY5iKjRZmT51Ep8ZuJb6uX7Njv45GcIOsnN/MoawY9UkMIflSyeotGX/iMePA/zUi9hhbpLk8me12iUQQKQMQs0l4jn1Sjq+xvgK4dofvZkbf+JW0tWJ2foUy9ONjkHtCvXmtBdOuOBbDuFdh/ZW9s2ok6XORzotNKB8uW/8LqW4aWpnywC1lpTb2hsQ+vXjLF3TcNOPv41rfuQmusshr85Qbyl9EXCp3RNyKYhUyaK0ubx7nmxEY0K70vDlv/dZuiPrtG1XLhalzO1JriTKa8kEcs5c8O7DNFco2XtSCRGv/9Excjuie+wE0nWYNmWbUV2S1ltmdGCRtFjOF0bZ8+MleCG1Dcc++hRrj5+EtqH1Dkleu0BCR4PQIb1xvD3JNX/lJg7cugc6kCxlvpFrub2hOBxy3sU3pQYqMkqk8YTn7jrO53/8du77P+5h6ciY8eICpgn3Grmd+415WDLMFBourZXh+05qDLzIxlQpdUiWUBrSyFm58zmOf/E4adyAz3BSHRpbb2tpCj088WuPcPtf/zhH33+EpAvouH4PS6pzrkCtLs9zReZR45ti03foHiQYZlLpvFA2zbgpqWlZO7pGXgVNhrhRk+V3dKc9hJ0krohC2GEcISl09CwfXi4dpZrYFs6dkctGf3dcGmzdMFvlgncf5C1/791c9OeuIi9k+pVp3YsiqGT6Trng3XtLimBnCIk+gW7aTD/YvNTuTEXTix0XlAtv74zMlIu/6xLe+nffyb4/dTE9a8z6rr57Xosa0RopzcbyORmGmjq0MLv7JF/4uc+Sj49J47KKULOCpLpvqsZhd8p4/4RLvulKutkavU9orQ5stRENwsljJ2CmiBvqhpiWAsuMpcN7kQVBbGNPl9NgjWLPznjsA4/S1DS9LEqyTBInudeBxw2rzHj9n389l3znxeTpKojTWB1MqwkrMQ6U7oyjKKYN61I6YTpJ+Anhnn95F3f82CdY/9SzLKRdzMYJsWHfnmMqyDbzhGwjEL0+O17Pb9kI5l5fAwppbZFHPvAQ3hmIop5xBFWQ5Zbn7uy4/Sc/xb3/7A78CIzHY1Q3XjMRJvDy5eNrdM+tlr9YicLfodu1QtiRokAKYQcyM0bjxGT/Ai7Qx8KRl8xVMLOyFI+MuCKd0HdTmj3CNf/DG7npZ97N7rcus9o9V4a25hZdfp5L3nstTi6b+tVIZvOQBhefB0YMBdHpF75bXa+JWomGdsXK7nz6tTUmFxpv+KE3cN1P3EZzzSL92oxm6oxM5mleySDVvTLDUrAyfLWnWVxk9ZMr3PXPvoyvL5RiuzFm0p2SBKfW0Uvm8LdeRroArC/FRNmd05ZO0XMz1p7vkKbuXapL1Fx6RheOQRvElTzfy7VOSg1HPneMk/c9Txq1JXBAy7ylKUPIRGZ1NuWiP3E1V/7Z19FP10guuDh9yrRS9mLROEJXNuy74jQ065lJSqR2kac/cZTP/a3f47Ffvp+Fk2PSEpB6Witzc/q6SSXl7TsxzRAnvWmW1HB+RYRZWyLSRy6MxnDsU0dYeWAF2kQWhwbseMu9/+wePv9jn+TkZ1dYSMs0TXPG10Z4iaTMucpTmB6f4g1Yqt9/GC828DeE8NoSBVIIO5C4omOn3Tsp71xLijkfL1GTBbG0sUQr1aVxbmg3o197lj03L/KGn/0GLv+rb2Y2meHTzP63XMTCdUt43+Opqcl1ZYmXykbHaPOzcqau0ebUvc3ctC6hMpQEfdkvRG7ofZ2D79nHW//eOzn0A1exsjilW19DMBopXayy9EjrfijIbkCDiLIwbnnm/U/w1V++E9oJSM/IpAyLzTWlTjqYwuSKRQ69+2K8P0GXjEZbjqA3AABMCUlEQVSUjNOIsP7MlPVjudyBlTCGFsVGwuJFk9JZocZsAyoKs8Qj73uMpi9zp5Qa6lDPjwuszFbZ+837uPYvXkcmk3KLaRl5454xjMYT9IKTSJSL32lahV0jZk8aX/knt/Pln/o83ZeU8XhMTo53Y0wTs1RmRanr/DnZ7rrZXNm85yhR0ulMjKzQ9CXN3FSYphn6TMtTv/VEiUlvlbXH1rj9xz7NkV98kIWTiXZEnXF16kDh8PKZgK8L/dEpLVqDLOpQ5DjHIewIUSCFsNO4lwvFxYTunSDmp8UQh3PRN4Y0pw4ydTOSJPpGaHyErWW06bjqz7yOa37wetaWnufSP/46UtOX8HDrytwkEbCaUFd3SLxUKmW/FOJkLUWwitB5h+YxcmKG7O249i9dy1t/9u0s3raP9WlHZ07XlLKrE6sDNDPUzIjeM10jLKYFHvvVe3n0P91P2+wBh9aEJE4Ww2lAytK+w++9Atmd0Szl9VeLcZ0m8rEa4+1eyhQz0mjM4uExbiU4wdVLwdcu8swdx1i//VkmzaR0bep/xXLtXs3WepZuXubGv3orvjAr3T1mdYmbkHILRknPq50XT0DTMMm7ePy3H+Mzf+P3OPZ/P0XjY3ShJ0mJ7U4k1ECtFmNaks9KJPfW3z/ijsy7PGXvklhLssTIyt6qtiuDaJM40sCjH3qS6ROZ2dGeu/7u55nd3aHLCU+G0WBiNPF9+4rZnOiYemF6bAZDR3f4h6iPQtgRmpd/EyGEry9SU8IWaZYSksu72EOaWDg32tet3kpZyiaQtMWsnxcVXYKRQ147ziV//GpkyVlZd5aedZpdS8iiY9bTzfoSxUyNHq+zajYblmTB1olaJQa8DAhN4rg5noREmQFk2iDrDutTlm7awxt/9q08+RsP89Cv3k13NDEZNyRqAjaCuKAiJPMSF56MxbzM/f/iC4z27uLQtx9ktnqSxstSPZERvfR4L+x6wy723naYY7/zDJOlhiwGSWHdOfnosxxMu8EUd3Br0CUY7R+VlD4t3bDhMT/2Ow8h6063BK5Gsg5oaBiz1q0yviLxph9+B7rf0TUlqWI1sKC0wwCpUe5myCghusDq/ce5/998iWMfPcrYGnQBslgZMjtzcuNYu0o2RbXFLKPiCHWJZZItZy1nrcEQbIQzWNOXJYV1j5mY0U87+uSkQ7B8bcORTz7FA79+L80jPe1ohGUtnbTsmLblXA6hC7HM7pyIwxnHv6mgLjz/zBqHpHwfbA7VCCG89kWBFMIOYwKGsbh3RDsp+5HKMMx4a/SlEC1LpNygmRcumWG2CiiNAtkRV3qZMVpqueOnP8aDl0zYf91h9tx8kL3X7WPx0glMHHqHvoz0NYZ3tof0s7PrGJgoTe5xrYWv2JCZRp8SSKYRxU1guoaOM5d8z9Xsveli7vuV2zn20SPsynuwcSmMGuuZidAkUM9llo5kmtku7vynn6Q9+I3svXkvrK4CgrmVOZuSkCZz4XdcyVOfOFYKNXXMQV2YPb0OWfC6n8ddaA8kxrsn0GccK4vgWmXt7mc4+smnWFgY45RQh2E4bJ7O8ENTbvjr72Jy5Yi8/jwuEzLU8IWuFHku5DoiNS025JMNj/zGvTzw77+KHnEmowVkUaATEg3mHSQpR+GlwMR7ECVT1u2lJKXQGZZhveC5KClyrkPxWwfz9tB3HR2OT2B8RcuBGw6w6+YLOXDtfiZXTjj6yWfoHl9n3CzSq9OgWDY8lYWB4kPQxIu8PmN/0hmZlIHIw583d49MoDGlf2oN7R1VZR4aGULYEaJACmGHGS6lmr0NjBVZy5Q1RvH+6Esj4KDuuIDVK61kipoChuayaE5ESNIze2yVycoCzYMtRx98iid/53FGe1sWX7/M3lsOsOeGA+y5YjfN7hFkI+cySHQjJtq2vPAVSshCn7Qs1MtaWlzzlLkelZZee0hGspa0vkSerrLrWuGWv/F2Hn/HozzwC/fiD58kjRexNtP2E8zLY+gSIA02EibHRtz1Dz7NLT/7DsaXT5BVI0mGnJhpDzPYe8tB9ly/m/XbT5R0OleSNBx/7HmsS+jYahj2OqNDB5GR1vh5R9UQbXjsdx9j/FxCJvXrc0OvDlnoFte4/ofeya5b9tPP1lAWcc807nX2VyIrdGRSElIz4fk7nuXeX/wKxz97nHFaJC0K7j05KwnqrCQFKUVhOd0JzErcuG4MfnUb4dq/oEAyAbwM5TVy6SzOjIyS9wkLVy9z4PqD7Lv5AEtX72d0oIPUYP0Ms55dByYsLI/ghCGaMStLJcWsdD/qPKoXE8XRWZi/ObRxrrwVZsfXyes97kYjw/ff1/pgQwh/GKJACmGnEaH3nvHhUUk4c0VrlHPsQzp3Tn33efPsJOaLqMAV1zzPzZbc8Nxjq6CCtTCRUdkT9ix0v7/GE79/Hw/t+Qrjy5bZ94ZD7H/LfpbfsJvJ/gmpdazv6+04vcxKUED9Ue510pCj8y6HkVA18FxyJACkwcm1XqrFsc7KzNDO8GaFi//Ixey78SIe/Dd3c/SDjyKribSQSQad9uBjklsJlFhs8YdnfPHvf4a3/vQ7kAMZnwpZjMYcEyXt7rnoOy/l/s/exTgrWaBrnNHRHptmfKKIOznD8kWLMFJkzbEkaILVp9Z4+sNHaFPZddPQk9sZkiescYJr//sbuPAbd9NN12hdMAxrGsRWazetBE6Mxot0zxkP/Yd7eOLXH8ZWYGHSoiV2AUglLOMUgriXPWI4ksq+FLx0BdHyHCfKsrxEwq2EUYhlNGemeRWbKHrBhD3XHWLvTXvZd+M+Fi9bxicJlSk+62AqYB3WOKo9aV8DexP5pJfZVVL2cPWuJHd2+Ijnl0w3La/bvLh46CR1KdE8M8PX6vPpIDWuIWqkEF77okAKYccxsjjtvgWGToRhZVN/XGu94nxYEide0tgsMz06RdRQ9TJ4VsES+NhQRoymLXYPHP3y/Tz964/RXNgwuX6Z/TdfxP4b97F46QjGY1rGWJ/JuStzcLLUuUWGiJK8pLaVCZc6H9NaPpZJ0iBZMekxFZJJ6XpJg/WZhQuc63/4Og686wK++kv3kL+yTts6boJgZHVGpqzTo5MR/R0z7vjfPssNf+sd6KQjzXpyyjgNvu4cfttBHn39mNmDidT0tCmx/lymO7bGwoEJjmLJGR0eY2IwhCC0I576wFeZHZ3STnYhMmWKMJq1TPMzXPoX3sDF/6+r8DWjzdC1PYmO1PeYjnHLGGNk1HP0E0e49xe/zNpX1ljSMTKBdRUWugaXjOiw3HSIVjfcM6KpDBMdltOJ14tsQ2pZmoUyjDVnZDbF6en3CKNLljl400EO3nARy284QHtBIjWG5Q6fzZB1pROhKdORcC0Flji0Cw2TQwusPnySlFLZr2QSV+nnWePC+uqMfmXKKA1vLGyMOg4hvLZFgRTCDuM1UUD3NGWXsknZYF5GeH6tD++1R7w0kuqkSekz0yMzUhLy0L2TVDKozcuSMIFZC23ag2BwFFaeeI7nPvoU9y81LL5uN/tu2sueWw6w74r9tPsmGLOy2i/XGAApxZdI7RB5RsXKfCUBfESWnoaMUfdYUJYIln93PDs9PRe8ez8H3vh2vvCzn+bkp04waRbxBmCdLErrQpaO8ULLcx85xlf3fok3/tCbmaXnSH1Tios+I/sWOPgdF3L//+9BdukYeuhXp+Tn1nHZBSjeOEsX70J7Y+ZGM0r0R3ue/NCTjCQhrII1tCRWZx0X/LHLeP33vgHrp5iW3UVKg3guyfWW8aZEZT/x/iPc84/uQKYjxgsT3BJmzsiNLmUaH5L/IGuJXZe6/yuLk1QQK3vLdN5+qN07N/Is09PRHFSWrt7D4TcdYu+NF7B05W6aPSOQGdavof0M70oR5lL6F407rkr2ku2RKN0hmTijg4ussVIj+cteJ4XymokL9vPASNLQTaE/2YFK7RyVjnD8mAzhtS8KpBB2GoGmaWh3tfNEtGgcnV9CCUXAoZ86+dmeJAnFa7DaDEq+HJ0oitFiuBpmPTYSZNyw0I/QFSHfPuWpzz7Ok+NHSJeM2POmfey/6UIOvOVCRgcSMCPPOiQ1mFOWedX5pC4CuUeokeQojUgZ0lqPt6+zsVwM9RF+siMtwvX/85u58+9/nhOff442tzTalNvzTKtKR894ssgz/+lRHrhwwlXff1WZn5R7RHqyJS5+z5U89v88RX9khqYW64yTT01ZosyRSguJZu8yJEP7hErDU598irUHT7K7GUGX6Ect05Mn2PWOC3jDX7mFfrSCzhKoYSmhucQzZxxfaJH1MU/+7iPc+79/iYYJaVz2MGWtG/VNSRgdgqjX5ECpCxYVJ1O2OnWIptI5slIkWdexbjNkktj95r0c/vaL2Hf9PsYXLeETQXJGuil5enIe0oCnmgwgtRAqXShzqQVtKe7cE5aEXZcu8ixW9kVtSsKL79vzx0VQg9lqeQOhlKEKZObxlCGE16wokELYYcSFUaOMF1qkXiCLW+1whFda6eIYuCA43Vomr3YIbbkAl5p85pnkOk9zMxfEFJVUB5yWfWK5yUgLrTW4KDyUef7+oxz7L0d46JqvcsG3XsTBGy9g1xV70N3gMsM7ylK6bIi04BOcKaKKYYjZfAimAKggViKotcZ35eyMD7bc+jNv45H/8hD3/8ev0B9RRpOFks6XHZGEkGG8wH2/eA8LByYc+mOXkNemuLdIt8Lokn1c9I2X8+iv3sN4QfBOOPnYOoeTYNlo9y6yeFDJ/TowwdaEx973AAt9YjZpSEno1lYYv2HEjX/tVnx5BZ2OaqBDWSLo7vSjxGg04uRXTnDvL3+SYx97hmVdQjTh4mR61OoI0CS4106Y9WU3kqQyt0j7uqxKSD6hn3aYWZkttSxMrpxwyU2XcujGwyzdtEizrORc9orJWunMmjsqzalb/NQxMm5l4K25IZ5REbLWuUkmiGUWL15CU7Qt/jBZcmzaMVu1TQN4hwIphPBaFwVSCDuNCLTCZKkFFGNW4hlOi7oNrwxRMBtmFxl51bFZBzoiyUbh4ypISVwH6pI8qcEKUi7Re+nKc2RKFik3PlYQKUu07pvyyD1f5dHFhxldMWHfG/dw4C0XsOv1exnvHyHjriwRm2WyG4kec0dkRJYGvKM1J1Fus7xPPgRNGDLr6cfGZd97Jftvu4R7f/FLnPzIkzQ6hkmL91a6ZU1mabbIvf/7HbQHJhx420HyakZ1hPTrHH7vQR7/7YfwFWEiwvTJk3guHZnJ3oa0y7AemnHL0d9/ipW7VhiNxqglZl1Hcxhu+Btvo71kiq+XvUCz1DLy9bKfbnFEOuk8/O++ykP/933YUWO53Vs7Rhn3TFKtPZiSBqgOhtN4Q+k+lf1FKQt939N7JqcZ48ML7Hr9HvbefIC9b9rH4uW70AUt3cHZDFsxRL3sOau3bVIvres3mFq9TxFIgueMzIcMl5lTogapB1cmB5fxxiGXZ2QjwTCW150v4mX5cV7p0GF4Vghhx4gCKYQdxt2xZUV3teSuB7EyKyaKo/PC3ecdCBNh/egamhPW9riVBVaIILlsfnGpQ15rylbdDlS6Gi44gtelYV6G/NSNZY63LZOmRbOQ75vyzN1P8sx/fhJbdNr9IyYX7mLh8gUWL1tm4dIFFg4tMdnbwghUMriQKWvxxHLpHNUgD3HB1aAXct8zucK58cduYuUHruHYx47w7EeeYvXhdcwTjQiSMrK+xB0/8zku/1NXcPmfuQIbCc16z8K1S1z+PZdz/8/fy4IrKw8ch+NlYPHkukUkLeAqrD+xzr3/+is01iLqdJxk77cd5pq/cB2ji1pszcFbesm0CF035vjdz/Lkx55g9RPP0h2Z0qQRTBSnQ0xK7Lak4ZQheA2zcLJnehdkoqS9wsKFCyxcvJvFKxeZXDZhcnjCZO8EWUhI8jLbynpstVS2iuJ1uI7U23SokeE+TzgcLrYNByuvDzdHcEiOWCo7Aj1B50wubmgmCVZKOESkqZxviprjtPRPr9V4/DLfTCLnO4QdIQqkEHYcZ7K/oRknRA3PiopvXJVv+aVxcXC6Fzsjw5kUkRJ8kMuF8OzpdUaScC/RWDLcwqYLL9l0w17/X+q/SP2g46c1EGT+dYaX4Iexog5p3eAxZ/2x51n9zHGOmtFbD2MYXbTAnjfuY+8t+9j/xoOMLxjBeEhjMySXgII6bojkCTB6zzSmLF04Ztf3X8lV3/96jn36Ge77V19i9Z7jNKNFJtoz6Rue/Ff38fydx7jpx27FdyVYm3LJn76G5+9Y4fmPPcHakRXWn1hDFPZccwDadZp+wr2//CW6+6Ys6Ii1ac8lf/l6rv7+y5Fph83KjCJvHU0Tjnz8GR74hc8zu7tj0o4hCc2oLRe6LvQkREFymWHk7uRZ7QwtOuNDC+y+/hAXvOkAe27cT3t4kWbs4DO8zyVQYxj+6z309fmR4bkrHaBTvoVeNGxumKcj889TZONbUKyGQBgYtHtHjHaPmK2UYbcmGfWESZmPFRftrzyXMmB49tS0PMcOWZQmdn6FsCNEgRTCTiNOmiipkRJfLArDEESPJTvnatvLJZc6u0agTcyOr5Ut336e681NV+o+LBISQRKoJhZU6V3pHsk8ff9TPPNbT3L/AVi4bhcH3niYfW/ez57LdiO7vXSX+kzT14hwV0aSyJ5JIyV3PVmNA99wkL3Xv5P7f/1BHv6/vkp6dowsOrq8xMk/eJ67/9ldXP/DN+Ctk5Jx6Dsu5NgnH6NZTXTPrSJNYuniMaiy8uAJjnzqUUZpwvp0yoV/+gpe9z2XY+sdbglahRa6R+H+X7mTJz/wCAuzxGRhRA+I9bRAr14iuQ3oMtYrvffI7szSdUvsuekQe960n72v20M6qLUz1GOzdWyq9RnW+V6sr8nrSQRdaoAOo3R7xUvnK6ts+75GeImyMVtbrx0kr83aGBYbwk4QBVIIO4w7pEmLNgkb9hubxxL782g+PDYp/TPrWKKWLOfvyvb0JZNl6V7tRym4CY0aqQVvtHRIjisrHz/Byd97jod3KQuXL7Drxt0cuvlilq/az+jChjxaw7uenJVGR3R5RlJjhGOzFXxX4pr/93UcuvUAX/3Xd7Ly2eOMFdLiIsd+8wnuuaDluh+8DsszLnjLJTx63b2sfv4Eq4+vIONEu28MjHjyQw/CUehzx+5v28N1P/g6Mqu4jWnGgnXC4+9/god+5SvYI8bCeIwmJ+cEbck6zyaQE9pncs7k3Yn9b97NvpsPsOeGfYwvWyQtlyLIO7Bph276PrDaaUqbO30v0XbP9On/fsqeQIW0Z0T2NVRLeEc4v0RKeEa/3jNsIotCNISdIwqkEHYYRWGkoFq7GxrviL4c21w1lX+ue07Eyc851hrSy3ntSGxs5H8hdUBlWCWGIjRA0oyOEkiDzoR814yjdx3hyH96Ej044qJvupRD7z3M0iW70UUB62hzCRawXB5P6gyfnWT3jYvc+rffziP/+REe/rWv0j27ysLiMo/+ygNM9i1xxZ++HPZ1XPBHL+Wez95O92SHtMrC/jHTJzqOfvBhNE9Zuu0gb/yrt2CLhvoivqvhxJef5d5f+irH/+BZGpS0XO4/0yLSITOwzkq/ZVfD5MoF9r1xN4ffezH7rt8FY+h60N5hfQYYSJlJZb5x7sQzqQ5Q/sO8Npb6HM2fP3PS3gaFssxPh+f2/BbZO9kwAsE6IJflrGUpY0R8h7ATRIEUwo7jyKgkdIk0gJWLraiSXhLZZp2ci9fIZkrQwPN9KZr0/J7v04uj0wsm90ySBJQZSKiTKcVAqjOCdDRG6Unak4/OeOzf3ctj73uQxauW2XPzQQ7euJfdV+8j7V3AF8C7GcxKuIOvG7mFy7/nag687ULu/5d3cezjT7PYtzzyL++k3T/i4m+/hAvffpiHrxrx9KPPMj4wxpYWOPr+O1m7/ziL1y/zxr/2Ztp9CaSlX+154tfu54H/8FWaI8JkUrpGOlP6vIbnNXpVZH9i19XL7LtpP7vetJ/dVx8gLTeYdti0R3po6vkwB1KD1bAGkTrxRjYyuUtQRimiztvriLoNcNPHdDjGnJnsbTluPk81nH9O1EfnRTnPivVWhi+P4udjCDtJFEgh7DCOkNoEUuOHXUHs5d/wDnfa3vy5LAmRjsaUZInZySltbujSH+7F7VAcDQ0v02a+tyKJlyIJSGiJOEZwehIZsQaVRGoFPQnTL6zwxOdO8MREWTi8wNL1e9j31oPsvXYPzeGWdtTgNkO8x9ZPsnC58KaffDtPfPBB7vu3d2H3wP3/5Ivs2rfMrnft5cJvfT1Pf+YRdl9xEbpmPPwbj8NFE17/w7cxft0E84bjn32CB37hXlY/9zztqIWFBmzKbLUjLzpyyYT9bzjEBTdeyOINu1m4bEwzSmCOdx3ezTAZCiPoyWVQqxtkJ4liojX0wHG3+iZCAhdM9bw+Xy/+JkVJrRvtaZHecNUa5FCjqPXFO4XhpXN3cCNPHeuEtPC1PqIQwh+mKJBC2GkcmnZ4J7z8HjOQXjrf4mMCNC70WvYfyTr0K31ZKuVfm+VRQwdChiVEdVmZbgro8Hrx7WJAqlvUGrJkRKHRhqYRenG6R6cce+hxnvrA/Yz2j9h1zQGWbznAwTceYNeVi8jSCMfx5gQX/VeH2H/TBTz4b+/msd94gNv//sd5yz96F5d+1+U8ccdDMG45+qmneP7Rp7j1x9/Lvrcfpntojfv/rzt4/D8/SnPcGOUJ67pG3rvO8qV7uOhNh9h700GWr93FeE8LI8O6HmYddBkSuPWl0BEpc5+AxrWmZada0SqN2TxmvRREzfwpUj/PbyLU4mh4RQzfk1KPOe0dYZ5RSbg5pkKK79nzRlVxEXJf4tyBF7b4QgivWVEghbDTiJGSlzk3lPktNWht+1S1iPl+odqSsU2nRjddT6kb4kpuBH8+42uQtRQef9jmx+hlFKp76UZsHLrjtSOhgNVjdIUGQzzjksgOSaBxQ1VpdVz2/xyDk089y7O/f5THdiXGly+x90172HvjYfa9fh/pUMvoKue6v/lWLnjXxdz9L77I7T/+Gd75D76Vw7ccQsS4//13cv1fehMXvPdinvzNx7j7Fz7H+p0nWBjvRi4UFt6wyCU3XsGeN+1j8cpdpOUWzzPoM7NssGYkdzwJvQxhGA2Okawk0nl93kwo0dwiiHf00jJ8T5SZUHXuzcb03i3P78t9k8FOu3n3svfFPZP2TDbK6TpUNquXdL24an/FlT1okDsr7yBs/ngsRw7hNS8KpBB2EK/vnkujsJ5QHHGhzcPSnXPN2grDKTn93fzhWtrEcB+j3jNbmdJPZzS0NBj5PO5pOZN5SSan/G0T2QiVkBd+RpLyn4zGvXSFKHuVhrfWswo0Y1oZITMnf3mdp7+4wtHRIzQXjlh843723nwx+9+0l/3vvIBvuO1bue/nv8iXfv6jXPzeN3Hk9ofYf8thDt92DZ//0Y/w9O8/zeSiBa7+7texcPMhLnzDQdIlioriZlif6df7EmiA0dZBu0h5HOq+6TW9qTqsv5XnbBi8qiTypk8ZPm9zQsP5ff1vfg15mdcLLqgnxrsSamOEjLmAGslKlyO+L195yUrXdzqdMvPMuMZ7axSjIewIUSCFsMOYgI8E6TvIRqZFtS+DQWMO0itmKJCSGzBFRi2zh5/Hjq/Ryxp9mVa6xQ28iveGbfM6ERGsdl9cFZsZ9tAqq/c9x+P/5R7Ge1vGV+/mwFsu4ODbLmL5yf2cPPIki7sV39XwpV/5OMsHW972d9/C4pUHafYl0Cmsd2VPiAieS7iIqs7n5Q5vALwWzB9HPdfNgrOWjzBZW8RcMByjzjKL9bGvuN4bctdjJ0b4Skb3C0gP3kTDLoQdIAqkEHYaB2kv5KS+npQSIi1YBk14DPo4Z6f3JzZ/DIChxpHEyvIzLP3RJbQR3OU1se/rjC8ZTWAZwXAVMoLW5XwuBt5h68pzj/UceS6zdOV+Dl52NZPLBG/GHH7HN6N7lZw7uqyszTqSGmhTBtXCvL01LHcalj5tuQruVTzuazjuF/sWzPucvd8tNN0IlxZxJ5NJOFniP+WvNNFM0wndZIGUBZFSkL5aXz8hhFdWfK+H8Crk5ymWyt1xK0uKJCmdOM0woweI/tHL82L7uIwyM0hESNLgw4X6a+0n8JCQJ16WIplvxJk7QIkAz2itb4zymT19DySlwVkXp3Ul4fTe189Wsjpp00ad08+1SJnJ9HVv6Bye0qlzkm7eLVa+Z514p/O8qFu7MkYG2hoBf552fH0L8OGv9UMOIWyIn6sh7DQKUi9PWx+KIyOJEmnB5+70i6XTOwBldwuINIjX4kGEjdbS4DVQng5dEKRcSKqXMzBc6EvCKXttSjCI1rS2RJMExzGUsZf5UYaQGM27RHo2p+m0f/96e0mf8nqSjbct3EsUu5ghWtL10mugFnzVEqPmTTKC+Te2xFtJIewIUSCFsIOUtC4p812g7nOpF/DmyHkeXroTlfNcLvipy+ocr6nOX6cXWmdaV7j5MQ91kUhNgRv2B8l8hg81ES/Nv0BqopwhaBnAK6ffxzYXp2d4e//r8xV9hscoWlL4pKm7j3RTV+4PPxHxtc5cSfUlaOTy2mVIzgghvNZFgRTCDrOxz6j+h94cUQU1vl4vJ1/NhsLAKOe4nHXl6/pcbxMe4aKUumjTYxQhYyShxIvP5/7Ui32sLJFjYxmTU3IsNur2bS5Ov45P6XbmQ2EBG5YovibXab46yFAcOaikWnwPS0JDCK918VZICDuM1PxgI5c37dVrQyB+HJwPpYNSCorkpTNSatRXaULdWdEtf73gArLuuUooeCmefL6BqHRCyuQlL51MrCSNO+irNcnvD5kjtdi2EgfuZUGix/fteTEsPlYpHaThZ6R8XX/fhhDOVnSQQthp5iuXUv1rXGCdf2d6x38HnXd54Z+HDtJwSua7jHTzJ9WPhboks645HGY9RS/jPBv6vWnTazhejyHsBPGdHkIIIYQQQghVFEghhBBCCCGEUEWBFEIIIYQQQghVFEghhBBCCCGEUEWBFEIIIYQQQghVFEghhBBCCCGEUEXMdwghbGnz2FLZ9CEHL5HLjiFe3m9ycYYA601fseUtD39yL3HO5W/G8B6W10/cOIr6gc134MbGPYOzPUEoU7B8I+79tJt98SOHzUd/pi+SF3yNnPbHjdvZ/j5PU0+P15uQrZ+iMkNoiMquH6cOqXUfztnZnLVtT2o9rxu3KS4bx+WbjnU40k3HVX477TU0/6IXezocL8Ol5s+pyPA4rc4+23wM5fM2noOICw8hhM2iQAohhC34/KqyXpFLvbDMjqRheKeWC1uvl9heJ9TIRpFzJrLpT/OLVjbNBBr+1aGXTPJhfpXhkgAnA40LiIIbIlqLge0ueq0WXnLKBb3hqBlo2uJrZV6AlIeb0eH+rBZNOvyj1tseLsgNROnJNKR6fW61ktn+Qj0D6hlEEXzjS1xrMVTOuVs5F8Mxlsc4FAvgZqgqmM+H+b7cmWDutRgi19eO1tseTnk5bh+O28vraSjeXIYCauM8OA6y8do44/2KY+6koRCTjSpx/nglIw5Z0sZzNXxSFEghhHCKWGIXQghbEDYVAu7gGXewNHRcfP7mf3bDzHC3+m7+1j9izXqs9i1EhIyBZzJGX1sM2Ush05A25sxKKt0Rd9TK55mDSy1cZOgLbfHLBZHSbSgf89KVoRRJZ3NevHY/1BPuTpcNU+iV2pmR+ee4WO2alAKucTADqydXNu5+6/t1wFIpXF3x+f0M59QwMiJCh21c+wvzLt/wMTMD9VKYoNufs21+AWSBXhLzYtqGcgmm7vVYpR53fU2J0AOd5VJ6enkWytmSjeN+EY7jJvVxOE7GyCCQtRSeLop5uWcZXjCUxx1CCOFU0UEKIYQtGb0I6gnN4G0HgJjTq5Bc6cRp3Go3IiFqtVOw9XvzSirFVt8jbekKdZ5IOOpg3uPq9A6Nay1oqJ2AcmyShVmakkQBIbuSHNCtixwBepzkhovhLvSacDrER9uVdmCCaFkMJu6YCI0mzA1F6cVRsflCQXfHxEle70NaxMrSRENQtVOWor34cWcgkWWK0dA49KL1fDpZE00WyNC09VhlKGCULNB4BlWyO06HMSKZbHvOtudgQhIH6esBtyQMzzBWIZsDMzINoopiGIqY0ODknFFpyrkVm6/J26rYzi60LvTe4doglNdABzTuZLrSraIhWV3Sp0NZLFt2p0IIYSeKAimEELakNAa9OmtfvZfbf+wn2DXr8eGnpzcIPavraxz+ge/jqv/m++lcaM0R3frC07Qs/ZrefTd3/NhPsthn+qalyZksPSotJ6ZrXPHf/Xdc9j1/BnMty62kvO/vNKDG/T/1cxz/xCcYj8e4OFq7NFtxFxpp6lI3Z6alk2Q5c/1P/SS7bnvzlucEBc+OJHAVNDuicOLur3Dn3/pplrsexOmT4pZICMk6LM+YXvl6bvm5n6Jd2o076LyAOYvlXpLo11f48o/8KH7/Q0iT6ocFz0bupjS3vJmbf+onQMZ1GeGwUNJpaufJBLq7v8IXf/SnWJhlfNN+ppfKpXa4JNHN1tGrXs8t//B/xZeXSLWL1j3xKHf89R9jcmIVbxPmHUM/rl/pWPiTf4Qb/se/gpuX5ZTCtv08EWXt4Yf5/I/+BAvPP0/XGiNvMBxRJ6/27Puv/zhX/ZW/NN8DZa7IUBNGfRRCCKeIAimEELZS130phk1Pop/+LDabYpuKH8Xw1Y7uW7+lLFkSL/tdylv1L3rTauWN/e7kGvaZzzPr10muzJJgYqQ8ollbhe/49k3v9TugiJWCBIGVB+9DP/FpfGkCZHq22j+0IZsi6qxjtDSYGWuNY8+vbvu1DtTtUPRiJFWyZJ757Q/T/s7H6BcTpLqczkpBsqZGmzOzz3+JlT//p9j3zm8sp9e9LBk8y9VerQv2lbvoP3s748lC6aZZJkmiWZmyNl7CR2lTaMGwx8prcIHQANO1dbpP306zvk4jkPXlLTdL5uRUFijq2oz+5Bo9HWPKskPFSV2Hf+Z21k8+R4vWPVPl2PJapr/1+tpV07oscPutWY3DbHYS+cxn8OeeZ5RaZsBIjE7XmT3vyFtuLmWYlFfSUJT6K7D3KoQQXmuiQAohhC1kMVQUcS1dkFEDKjTaAGW/i5IYWYe2IwRoa+bAtil2YgiJkSZk3JISSGowVSadk8czXBVtBMHKBnvK8j7mKWXQpBE6WmC2MCEBelYhDeBe9uo0AtoLyRNt20OzfYElGDOMEUqDYwI6nXLi/b9LszSCxQUsCdoZKhlTaCwBDaPVIzzzX36Hve98J+pa2hhSemLb3y+QlJRa0sIyNh6VQqLu9+lV0VFLNqNpmhJUYHl+H+5WltlRCrjRqEVT2Q+Utun4bdeVQ2rhkXu8SdikRUTBQSWjnuiyIotj2m5MIyOyWt0/1NN4JrUNVruEZR/TsDNr6yImSQMLI3S6AElpZYTknolMmO1awdq0cf4op3ojKGLb0x5CCDtKvG0UQghbGOKSRcpmea+pY1kypIxqSU/rpSfLlFI0OV6Lqi1v28tFa7YZkhzTso9pZIarILTgDfgISCRq+IFK2Tck5e+jLGQF0UyyIQXNtvxVOhOpLDqThGiJKchkxPutT0qtExK1AHEjYTz/xa8wvfNL6BhMZ0ieoeLkmi43EkPJMF7m6Ef/gPzMczWq2+vtbP98OGVfTk5CFi337V4elfZodloDNM3DJ1ylLEd0RSTRILhn1MFTrQ70LM5ZLVxe7JdTuoJoguwgqfyiPMZegKbBNdPmnlkqxY+1Ct6Q3RHX2inUeZrhtkEKYmQE8aam5nW4rNO3ThYl9UMqxamhDEMHKYQQwqmiQAohhC2Ui/aSQ5Z1WPIkJXUtg+XyY1TMayGjIFoy0bZ5Z96lLvlKiltDk5uSquZOuZrVer+2qZNQg+zQ+dyenIS+cTQrWYbZSUKypixds1QjpAVMcJeSVOelQ5Hd6Wtogbri2y01q48r1f/rtcWBJ3/nfdiJFTyNaXKDWoO6Yp5wH9Nb6VotaIs8+FWe/uRnNmK+ZdMNb3nXNZDBS+JfCV4QtAZWuJZiUYfTJZuKDfF5WAOSahELmmsKnKVNXSKd/yrnzcFKOt1wTrG6NNBlI+FQSvIcSUk2w2RIMC/L+nBDe6WXlpQdzNG+R+gRqYXYmU/3FhSV0oUyM8wbyAlqop8NcfN66o0Or6MQQginip+MIYSwBRE543K14eOaXvxzzu4OXtg5OdvbGtLH3H0eFz3w1JZdUO5ln4s5rYDSk7z+YkZjPW3vSM5Y05HcSrF3FoZiQgA/cYKVD36ctp2A1oKhsTK/Sa2Mj0qKa1naRt9z7Dc/UNP4ypBcP6ug77N7fjad3k0HLLWgyXV4rKCWEXoaL79AS3S6lW5cMsU0IUnJqaTTlYKnFH/uCSWRvBRG7hks03QlpVAtn7EzNhz3y3rtbHE+Skfwlb3tEELYKWIPUgghbGvTsiS3+vvGBJyNi9Dh33jZ+zpcOJstOZu+YJjxM3Qh1jBPHE+CuJAY4dYh0pSOR420dndII6BHrGPqid7zWdxh2TNkeYrqiKOf/Txrd9/N0mSEZC8hA7aG6FJZgmZGljJItXNnMmpY+fjH6Z58isnhC8pDPZs1dqc/7C1O9ukfPT3Ju8/O09qyUJe6JXeyQnIpy91EaLyEHfQuMAy2tQzJMe1Z8TG9KclTLfYgidNLYh0l5SGEQV54LKc/3yGEEF4VokAKIYSzdPq7/aVzY2U+0aYN/OVTXlqDfqPw2r7GGpLtNn/tcHxpTVi79DBv+Hs/jezZReoF074uq2uBKUJLloxYg3qHi4AZi9ddv839lvlFpbgqe2aefd+HabspaINriRrvDUaHL2Jhzy6e/coXGTUtplaT/pT+8Ud45sMf5eLv/bP4PIp7+/Nz6udpfQ62D3kYIq2dEpyw8LpruO3f/Dy9lCVqYGSDVoWcnTRqOfbv/yMnfv6XGLUT+jajlsnJ0a5nllou+1//JuObb0A6RwyyCIgh2WFpAV9eqsNbTz1ud98YyOunPp6XTGon0XxecL2EmjOEEHa8KJBCCOEsnVoESb0o1/nfNz6Pc+ogzS9mRWpxVT+wXWjaaXey+Rhmkklj4dDb344uLc5vbuMzbD4LR077R6Pb5n4L1TLkdXrsGCc+9jHalNBUYiowR2awdu3lpGuuxu64HU8NgpFU6EUZ98bRD3yAi77nz9Y9MdsXB5sf43yZozSlKNl2z9cwI1XopWO0Z8LBt91KCUIozbfSiCvR14Zjn/4Dnp+tMV1aQG1G1jE9mSTQS2L3DTez56ab5gHssum+YNibNvyFFxz7xmvmFVjx7vU2508qtfALIYRwLmIPUgghnINhv89838+mjw/KNem576cZbmPbOOmzoQkkk2dTcOjZvGyubNrXshGn/MtQk7mjtNvdOIiVc2DC8U9+ltkD92KjUQmuEPDk5Ozsv/Iq9txyM2gJhnB36A11pZ0scOKTn2b9wQfKMZ3jOrPTn4vtzltZtVhS8BypXzN/4HUwVS7hFw5qQtdD3ypN36FiOJlxD9ZkshvdbL0+4RmRPA+ckHqbrj2mZ7Nk8ZWz+TTaOa3TDCGEAFEghRDCWdiUICe6xeb6l/kjtSbVnfXG+s3x2EPKnSsuSjLw7PM0vab2m0oRUZaYWd0/pV7S3YwhlW2bu910Xlydo+97H203oxWlQUobxpxssPSGa9lzw/WwsExjVqK5RcAynhQ5+jRPf+BDtQNz9hfzZzr/2543r8csQlvjzYfKsHxtiQFXBPMe1GrQQgM0pDwmefm8lDPUFG8xxyWBD9Hi5X5EBHNBzmJw7/laChchDSGEcO6iQAohhJfjlVgaBQwX7udiy4tfMVQmmNSQcnOg3zRg1kpQuNelejWFrVercdNb3LSXJWEiif7Jp1j9+CdJ4wluQq7hAy5Kv2eRhetez+Kll8IVF0FXBtOalkS75NCmhiO/87tIfy7l0Ub3SOqen+FjWx84dRnacBu5fsw2FTY1Dl1LpHd2qzHZRo9gavQKQkIdMsPMKoO6z6gUO2WPVhJ9uXkdL1mJdo8OUgghnKsokEIIYVvD7J2SYnfKsi5yLZIUdZt3X8pAzm0KjXqlLg6i1AGz4Nk2LbfL8+7GGW9v44p8fjzz+G0v3Y0EZXCqC7kGBszn+0gNe6jLAucdoC0PnPp18Ozvf4zZ44+R0hi1jOsMNcVmPe2VV7H4xuvRyYQ9b3sbs24NNadH8F4xF5o0Ynr75zjxpbteEGJwNhf3vkXi3pm+WiSd8uey5UuHhzR/XoaOjojUvD6dn9tSIJbj083jrobnadOeso3/zJ56TudhCsPrSGp3zTc/z0NXcNvTMC/KMJmHNAz3sX18RQghhM2iQAohhHPwgvk16mStXQQvF8c2rFObX+yeuVAyMrjRJ3ADcUWtIaWWskHopR8bQEZgYVS6I0NsdS0FZPh8AxGn85ou54rL2e2fEoxjv/l+Jl0mJyUrmCieHOnW2fvO2xgtLJCBfd/2HmaTJRpPtNkQdUyFJAk5/jzPfvB3T1lmdjbzgTZ/zis9T+hM96WqL7jPl3N7p/xyJdEz7A8b9g45YLLdHibDBPCMqJci0OocpO1X94UQQjhNpNiFEMJLMMRxqzSIZ2ZiyKRcjTZGGZbK1slsipBFGY3HlLGiQlZDPSFeLpRfqsZg5j0n7rmX0d6DeDZMHcmOp7oPyXJJovOe1oQ1SQjG+NCFjJaXX/zGrbRN1h96kOc/9VkWFsbQZ1Qcc4XcMx0pl3/ztwClu7H/bW/locuuID/4CDJSOsm0DpBoRi1PfuADXPJDfxmV9iUVHi+M/37ln+/Nh/VKF2Np2AvVlICMoaclXpbzbfngXEnjBcoiyoyrksTA0kYIRQghhLMWBVIIIZyD+d6X4YK2hyxGm5TVT36GR3f/En12GjMsnSnwYGMxlzrkRtEHH0Kl7HVxBzd/SbXRfFkeYKMJ7RNP8OXv/gHGbiSHqUDjaSPPunaKzDf2zpxsWt78L/4po2/6xhe9HyPjohz56O8jT51EFhJac/LEBO969Oor2XvLTVD3JOnuvez6hls5cd89jNlFoi6PU0gyYe0r9zB98giTSy7eOFPbFCEbSx15wSyq88HMhnWWJaHuZdzfxhLNokfRZsT6V+7mkV/4JbIbUh/bdqs1VRV/8mlGvSGSGPWJTh0XR889TDGEEHa8KJBCCOEszefuqNb9JkJOQmJMajv6D32MJ3/rg3VQqpHnV7en3ApDgZTc6EVpUmJhqcUlIe6INiVR7iUc33AXbo6osGe9x6QHlIlB44ZhmArigpJxTSWJjSkLnaK+9bos04Ra5unf+gAjoXa+EiqCmzDrjV1vuY1m//46X8hBhX3vfQ/H/92/B6wsp9OESw82YbR6gtWv3n9KgXS2z0cZ/SOc78A21bL8UOpz/0ossduIV08wGmGf+AyPffBjjJLTW4dKU4bKbpnHkWhSiy4p1rTkDEgiSUnaCyGEcG6iQAohhLN0ypwiB3BEeswSJMVHTjtawMxotKV3UN/6LfxWEmD0JqgJUvK558EAL/lYU0Ycspa9Tdl7VEpnwcRR6xEdYQ5ORjThpDJM9UUaI8PjTyKs3HU//Wc/Txo7fSoX6W49jSdWmsTBb34PSInuzgoNxoG3vo37L7oMeeJhcruAa4kYF3XaNrF2z93It7z7VbnE7nwT7UkoKLS7J7goI/PaGRO2aiG5lGI7ozRmNcGwRJWrjL7WDy2EEL7uREhDCCG8BBub9RVNkFzKvhETWkZ0IqiUzsmL/ZJUOhKuPaKON1b+LpDTy7/cV9p5kaXD3hZxGpyk47qvJpXdT1qT7QBL26TvYRz7wIfh2WOkVsu+JnesUTxnmsMXsfyO2+gA7axcvLvRXHABe97xDfSzrgQeGKVb5T3aJFbvuONldWXO5xK78z5PyDvUe1DHaqIhWmLFRfKWryMATw1IwrR0o5Ippgm3r+eyMYQQvjaiQAohhJfLvCbANdAofepJ3m//ZXVQq1hZ1qZW4sLxOoj0ZVBTjIxoBq37ZVJdNKCCSUYlI2mIgy5x4snKwNOt5H7K0x/+EKlVsicSgqjhZNa6dRZvfROLF12KZiCV5Yha13pd8M3fyOqoBXMaKfOGVCGnxOrd987v42xjvgfnO8Xu/M8TGuOiSGpQ0/neIXHFdOv/VKuW/VEqGfGSqDiTngav85lCCCGci1hiF0II52B+4V5T7MSNXhMqMyw7MhNcesxL0XDqAJphw0l911/KEjMUtK2fYU2ZtZRqBLdvfSwiMqz2O2WZmSGYCv3CEoghLiDlcnmY3WMC4qkGD4CYsa4lutzZuO+MoSiOISSe/E/vp//0p5ikBbI7WUuYgGanX1zi8J/7vpJbroLX2Gqv/9v/7d/M8s1vwT73eWQ8KrHgIiQXZg88xPFPfYbdb7u1zGoSqfnnumlJo5zy+EvhIpuek/P83PPKhDSIlRAFry+H8iwa0juzzlFy3Xc0BIK8+H2Jl3MoTYOpoPTgqYR9nGVkewghhA1RIIUQwjl4QadCoTGFDH7LLTS33QJ9h2nZO5K22BljZkiTGD95hNX3fxDRUsgIYOdwXTvEPmwOaaBboz18FTf+x3+LHDiAZEogAja/3BYcNwUthZVl0Cah7WIdoFpuLlEKFEHop2s88c//FW3uYNyiZMQV8UQ/PcnoO97DwW/6RkSUBqhjakukuUHavZtDP/Df8tBnb2ciZa+ViWGipOmUR/75/8mNb7uN7EZyRaQWIiIvqBGG58I3/f18P/fMn/+XH9LAENIgIFlw68lvfCOjt72VsueoIavRuGwd193MSE8/R/++36OZrWFJQWqghEVKQwghnKsokEII4RycHvMNipnRrXfs+/Zv4vU/9EPlw3KWc4wcVu/8PLd/8IMsz3pEMl0jtF3ZT7KV0y/QN8d8ZxUkZdKuJZpxW/oQ0pYL7WHQ6by7U2+vTJTFtX586DRBiSF35eSnb+fEfXdxqFliRl+7FAnanm7acfD1r+P5p57Bpx2aZ4iOwBWRGVlAZcT40kM0B/bhJ45DM6oznwxJyvoffIrVhx5kcvmV9bEMqREbx336c/H1GvNNjfl2wBrDTmYW33YbN/ztn5x3xmSjmt3qJcT6Q4/w+Y98hvFsHbWare7dywr6CCGEnSoKpBBCOEtnivl2d7QVbJaxPuMC3tfABYTmRa9sDc8gquTVjoW6TMpSIhl138m5XYBv7iBJFkwU7aEXoTFwUUwg1Zt1lFNWb83bRqVbU27OUNdSiAgc/cBvs+v5k3S79pVuV2rKHqycWFzay7F/8+94/Nf+Q7l978oSOhNEneSGOvRpkcXpOqkdIb1Bk8gG0ih25CjPfOAjXPqDV+Lu9Djti1zkf73HfG/uICWDGX0ZwltfH0jCPSOydRdIMKxbocmriMwQGSFSeoUag2JDCOGcRYEUQghn6Uwx3wplqGc2Gi/zhHIjNFavfF9wbT/0DMBrUp24MAUmUjbnu0BWJ72M7SOJhNXuUCqX0AhOci9DYgFRmS9fE6fsFxKQumdIXPD5dbzgazOOfeSjjNsFnA51IAvuhjRO9sziascEL/tioMRN02EoTU70zQy1dUwTWY2UGoxMUi/L6pJw5Ld/m4v/wvdDamjQjWOs85Re7Ln5ei4F1JUsCp7BHNFaFM2Loxd/MRhC4y1ZEo2PanFtZZOZxhK7EEI4V9F7DyGEl2C+/0WU1gTTRCfgWmIJXuxCvrQMSlqdehmY6m6lU+CGYhil2/LyDtDIauTUgXuJ1a4/8r0m281T9DBMcimKoFygSy2OXOddjfXHH0PufRAmLWpKJqH0qIJ7Lsl5mnBp8aTkRsja4GkEjSJti+sISz5PXMPzPCZcvUFHC6x+4Qus3HUXQi2KgEzGdesS6Os55jvjQIO74Lqxr6r8PizXPPMvRTB3cuNodoQe8drpsvO77DCEEF6LokAKIYSXw5U+UWYL1S5Ga7W3tM1PWB86NSnhmhBLmCbEQeTsL2xd5sF45Wvrl0puS4CCCO6ZEhyeEBocRX1IwCsX2SWKW08tRKSk7bk7a/c+iPZ92UvkZclZr4p5Yhi3o15CH8yFJMO4W0ENekoRJLS4J9RH9FpmPjkN4hlSYnTsOY584GPzjpC702wTPf71E/N95sLXpS/pglLT7Kj7sspZ3foWvSyzU7OS+e0NIgm3tEWhHkII4cVEgRRCCOdgIxig/iIjDubzOIMa23x2HaBSvJS9OWCYlflJQ4rdVltITr9o33xcJVgh12Mqx7X5B75Bjf8e7qMuy/KNPACZ30cZIrty95dJbUtjpTuFd0iv5eK87zdu2WowdS4dIjMr4RDel6GwlssxpgxW/o45Jo6QSanlmQ++j36to9ey4O/UuOohRKIGJWTBrMdwzNN8CWE5KfNH++J/PkvlcZz6/J87PePrCBSkr6+dzR2is7jFoTgWwb3HKecc6cvvIYQQzknsQQohhHOwEQwwD9c+5eMv/7aZ3+Y5ZjTU5XLly5NDL1o6Olkh1aJtHt1NKUrU5zl2VhPjdMiu8xJKgJVgipU77oKmQTyVxXg+oxtnmg7Wcka6WT2GMx34xoX6kKSX1pyFxZZpkxl3QqcNLk4aT1j98t2s3P4ldr/jFlzKV6fT0tw2ljnW5wQhudGTa0GVagCckqH+v8w7bF4/0myTErdxXxshDUNy3st5rjeHNLxSM5zmt0t9IXxd78wKIYSvjSiQQgjhJRg6K8O16EvvKJx+mxsDYLez1ed47Q7ZciIlq8ELpVjoy4I2hhC74f+1FgplyVZ5fEoi1+5NvvveugRsVpbIJaXpe9bHu7ns7/4ko4svRfuO7YLTsiuanPz00zz4Uz/H4vGjzEaO5FLUgLNw4gRHf+d32PPON8934Jx+rX+m821iSNsgKWEGqe6PSpI2Ag+kBFKIK828htg6lr08J2d37r+WznfUeQgh7ARRIIUQwjk4fQ7S2RYz53L7Q3z4drd6+n0P6XoOJGnwtXUe/7e/TlrajfSGimOi8+V/Tgk6G/YoaU5MVbjond/I5NJDCD3uDYiy/vCjTI88wTh7iY8Woc9Alxnd/Dou+57vw1XOql9heNn/JB2P//qHWf/A+xilkjculsuupcmIYx/6IFf+T3+ZtHeZzZOnXvB8DMmA7tAk0uNHePxX/gPelphsxVFLWB0qpF4et5vhe3Zz8bd/K6nZfknb+ZyD9EqWWxvHtZGYGEII4exFgRRCCGfpTHOQXskldsPtnO0Su9Pvb/MSO0tjOHqMJ//nnwIyQtkj5KIkK8vcLDniNv9zM1NW0oh9v/avmFx6qGz2d0hiPPnRj8PqSURHeAKnR7LSd8aet7+9BDt4KZ5kmwMXDPOESMtF3/Ee7v/Af2FhKNq0fH3rY7p77uW5T3+Wg9/2zSWSHGBT4bh5uaOoIq7YaES6/14e/aEfQa3Dte7voXTFvEazdwppvefE66/l8De9G22Wti1SzuccpFdqid2pr4uyLDCEEMK5iQIphBDO0pnmIG2+Rt74d15SS0BEajeE+T6X7Y7nRS/SJaMJJktjwHApcd2qSk+PuJYMPRdESly3jQ2TBmtHp8yMNTOe/u3307jQJ8rtMEI9szoZse+bv7nEdYuUrT/bxXGTKPWUs+89b2Vy4QXYsycQbcjaIznRqNBOO5543/s4+O3fslEcnd4x2/xnd5IrXdswSgmRCZod04RRCjMRwy0xRjBdo1sel3NwHl83f5jKayiEEMLLEW8thRDCS3B6x+iV2Pvxggv+sziGF70tsZK6JjYvpBKJ7EaDlm6IC400ZHOyKK6Op57GZvVGSh24ev/9TD/9OUgtYKCZTjK9dbRXXcbeN15X9vdYuY35yq4X+1V/ExEWr7iSyVu/gX6tA4aoa6FTpx03rP7+HzA98gT5DIvszvj4PZOGqHOvxyM9jWRES1SDJCXjuCayl/Pycs51CCGE15YokEII4RWwuWB6qdfSr+RFuLohSUuMdxLMjFkykii5zjWSpHTakTTjdDXxDkwawGrXBZ790O/TH30WEa+Fx5jkMO06Fm67ldGe3fOMAxuSH7b4tXkPFMDeP/JtdFpmMImXAboAvpDoHnqYZz76SRoXbNPw3NPLx43ldqkMwE2AGKaKi9K7IlYjwD3P108kEfJZnPYIPwghhJ0jCqQQQtiCz+fl9PNhqO5lbo972e0vbngNkgZA6k6Xs7imdnrwxDA/yL3uC7IyXFXUy/35cJFu86V3udxAHQ5ruDl4CSYwTyXGG2E4cDUnu82PPecyOtY8IdTiQRtM68cFepvy9Ps+wLhtGCLuxIcRty373vV2HOjqGFo9q0KiFClOxshc+K53kC65DPNuPpdJrSyFSwZPvf+D4M5MrZ5Srdt2Msl0/jx47rFhLpXV82Xll2AYRmMlJELyxrwoZMZGDHmZG+ViG+dWnOSg2etcJ8dFEUklevxsXkc1CTAZiCS6+Wwqh1wKWePUItlPKyS3Paf1eU2muAnU7qGJndJ7c7qIbwghhC3EHqQQQtiCS9nk7whkY7a6BnkdpHQ7oGzaX1+d0c+6eSSZG5iy7eIt8QbJPd3qKivdOim1ZHcanM4T09U1mPU1mloR6qwkr1t9BLppx+zkOslLdLVILYy2ut960d9htN4waxzvhI6GputLwLfBs5/9HCc/8XFSbzS2VvcsrcKsZ/3wJRx8x62QIWkmeyYx2v6cAkJCDFwS7cUXsvD2G1n71bvoRy3JIJNLAZJnPPe7H+LEvXexdO31ZW4RRl5dp1tdJY9LYTarYQSyTYG2TukauRtMYbY23RjUCpt+LxNz+27KyomT4A1qZbhtsp51mbEuo1K8Mjw3W5xvEjh0zFhdOcHC2gozXUPccWlx6ZmuzFhYmwKGuaLzx8SWe9q8DhjuVqeM1tbo2jXMqMHuDflkR551DG0+8bYOpKW8UCPIIYQQThEFUgghbKF0EAxckP37Wfi+78WtR6WpSWTlXfrJdEZ70/U1JW24SJdtb9vV6A4dYOH7vpfGesSbMhhVDPfMQjelfeMba8CCzPcTmWQkC1lh/J53Md2/G20bhBZxI+nWhUJpMCgNuYQiNODZUEn44cvK41Bh7cQ6oz/5X9E2S6ULok3pTM06Dr3+GsaHr0QMEiWVLXMWRSGlS+TiaG9Yoxz6c3+GR5sRNAlJ0JgjucVTpp1NWXlulV0I5A53Z+G7vhO/6UaadowZtFqKVdvilIuXPD+R0gmSHnZfeIiU2hdkbZcAC5Drr2P8F/5bRqPdZOlIGOoNY5vRSAP7D9VuzIsFkdf7NscF+uVlJt/zp2F9ig7LAnPCZY3JzFl861vxfFrNst0QWwfZs5fJn/nT2GydpEojCTMryyZnU5q33YbVxY1Njal3PFLuQgjhDGLXaQivQh4bHl41ytDUjItiZjSS6hU+lBaI1nfjjR4p696kp9F22xlJZoB2GE0Z3Drc7Cn1VVl6Z1r+rJs+z63EZTdCaSe5laV9ci4/3MtjGO7LEDJC2znrKTOhAe1r50hxt9INEchlsRrJZd65OatZSA5WH2R2ITmYZhoUXGqAw6nnNlsNVqjntNESKF4XD248lq2GvbJ5YG4NryDhZuQk5TmoS/zwXAqVJpWywhWTUvz2CE09lpLIZ2Vfk7Rbnudsipijarik+jJyENnoEg1L7fA6lBe2Ww3f19fSSMqxD7c13OQwGNhs6Dpufs7Dq8C3AB/+Wh9ECGFDdJBCCGErUi6iezeSKjOgnZevikvZe2T1IrZRQEpanG7z7rwqDP2WoRDDEn0CJdf7VRqnLsUqS/1KVwtwSDiuWrodUjoE5bJ9m+4VzDsfhaO1/GrNcXVGmigryJrymbWgMMnzVLk0TD7StGkq1NacXO9JS8fHQT2VI5nv85JT/izqjLKDKZYgeynS6pHVHWC6TSmhdf+W04uQROmBJpXziG+uLBWlJgGq1NdBOb9p2NqkZZngxvLHF2cIbobg9Ko0QHarx+CoQI/QUmtd3/42B413IEr2hEgGKUWsI2SM5ImMoSK4OFKLaB+W3J3FfYQQwk4SBVIIIWxB3UCERhTcGbnP5/wMe2nK5wHudTO+kIaQhu2uPt1LISUwI9OmVKKuAZdMI6nsKRI2Oib1NiUpVsscFcGtXGgLZenfNo9sXiTpphsdlr+J1IGsqRQfqRZnJbgglaV5kujx+ZI69/Kx7Yikuncnk0wo23PK3Cepl+2JjWPKUs5yn4wkPajTUpfFuYOUQkOHrt6Lner5cNe6m8uhkRra4Fq/dgjaEKype76wmtaR5kvTTEsvSlRKibhdMYygTXl0StmglrQESTQOaKalmRcuLps6cdu9jqTcrshwvKnuUROUVOs+r12+06LSX+LMrhBCeC2LxcchhLAFr0VAvQwGHQZxWv3YqUQEKZfAZanWtrdf10IZjBghtReVpXRVBsMF/emrLzcvuUMUxOvyNd3ml82/fj7gFujJtQtRb7cOXy3do5LGJmykrTXDmq5tlhOe8pgpRZKQEFUELYl9YnWAbe1w1PQ+9VLEJBKiTQ3HoBQ0KrWYG7o/Wz1mGFLqtG5Wstq9KgNWayiClThz9dLKKcsWNw1gFSEhqJfnRBFqq23LxwyUx1qLFurtltdUU/8dxKQU5sNzvU2xa5RzWeLRtbwqhY3XqYGSQBLOUFRHXRRCCC8mCqQQQtiCAI2n+Z4Nx+oeoY2LbqEvYQ21m1C3lczn/Wx9+2WfzdBwqivAyn0O8cxaujhlU/1GgVZ+G7ohZXGdzBfKbUc3XfBvXDA3nnBvakx5ibL2UhHVIklrBPZw8U7tvki98N7+MZd9TxvR12WmqyC+qYvlUobPYqWG8KGTQ/l4XYJmfspD2Ppc+1AEaXnqxMpep6EjV89naeHZ/HEPz7fM5zjVzx0+B7btnMnwQBkKRD/luKX+udzV8NjPjg5R7rXrVwq24VWgoFa6UvU+SuFX6/KzOXEhhLDDxBtIIbwKuftPfa2PIYQQwh+Kfw08+LU+iBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIbwS/v9UHc1gBfR0LAAAAABJRU5ErkJggg==";
// ────────────────────────────────────────────────────────────────────────────
// SBI General Insurance logo (base64 PNG), used in the claim form header.
// ── FIX for SBI_GENERAL_LOGO_DATA_URI ─────────────────────────────────────
// The version currently in your source file is truncated (only ~7% of the
// real PNG made it into the string, so it has no IEND chunk and cannot be
// decoded by any browser/renderer). Replace the ENTIRE existing declaration
// of SBI_GENERAL_LOGO_DATA_URI (the const ... = "data:image/png;base64,...";
// block) with the one below. Verified: decodes to a valid 447x447 PNG.
const SBI_GENERAL_LOGO_DATA_URI =
  "data:image/png;base64,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";

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
  sbiLogoDataUrl = null,
) {
  const f = form || {};
  const sbiLogoSrc = sbiLogoDataUrl || SBI_GENERAL_LOGO_DATA_URI;
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
.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 8px;
}
.header-title-block { 
line-height: 1.35; 

}

/* Crop wrapper: shows only the top ~58% of the source PNG (the badge),
   cutting off the "SURAKSHA AUR BHAROSA DONO" tagline underneath.
   Adjust the height % or margin-top below if your PNG's proportions differ. */
.header-logo-wrap-sbi {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  height: 11mm;   /* was 14mm */
  width: auto;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-logo-image-sbi {
  height: 100%;
  width: auto;
  object-fit: contain;
  display: block;
}


.header-rule {
  height: 4px;
  background: #1a1a1a;
  margin: 0 0 6px;
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
  .header-top-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px 8px;
}
.header-title-block {
  line-height: 1.35;
  text-align: center;
}
.header-copy-title,
.header-copy-subtitle {
  text-align: center;
  
  font-size: 12px;
}
.header-rule {
  height: 4px;
  background: #1a1a1a;
  margin: 0 0 6px;
}
 /* SECTION A */
.hid-section{
  font-family:Arial, Helvetica, sans-serif;
  margin-bottom:8px;
}
.hid-top-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:4px 0 8px;
}
.hid-top-label{
  font-size:9.5px;
  color:#111;
  white-space:nowrap;
  margin-right:8px;
}
.hid-top-box{
  width:150px;
  height:16px;
  border:1px solid #333;
}
.hid-block-note{
  font-size:8px;
  font-weight:700;
  color:#111;
  white-space:nowrap;
}
.hid-row{
  display:flex;
  align-items:center;
  padding:2px 0;
  gap:6px;
}
.hid-label{
  font-size:8.5px;
  color:#111;
  white-space:nowrap;
  min-width:118px;
}
.hid-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
  flex:1;
}
.hid-box-row .char-box{
  width:15px;
  height:16px;
  border:1px solid #333;
  margin-right:0;
  font-size:7.5px;
  flex-shrink:0;
}
.hid-inline-label{
  font-size:8.5px;
  color:#111;
  white-space:nowrap;
  margin:0 4px;
  flex-shrink:0;
}
.hid-inline-box{
  width:15px;
  height:16px;
  border:1px solid #333;
  flex-shrink:0;
}
/* SECTION B (new layout) */
.claims-admin-section{
  font-family:Arial, Helvetica, sans-serif;
  margin-bottom:6px;
}
.claims-admin-title{
  font-size:9.5px;
  font-weight:700;
  color:#111;
  border-bottom:2px solid #111;
  padding-bottom:4px;
  margin-bottom:4px;
}
.claims-admin-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:2px 0 6px;
  gap:10px;
}
.claims-admin-label{
  font-size:8.5px;
  color:#111;
  white-space:nowrap;
}

.insured2-section{
  font-family:Arial, Helvetica, sans-serif;
  margin-bottom:8px;
}
.insured2-band{
  display:flex;
  align-items:center;
  margin-bottom:6px;
}
.insured2-band-bar{
  flex:1;
  height:2px;
  background:#111;
}
.insured2-band-title{
  font-size:9px;
  font-weight:700;
  color:#111;
  padding:0 10px;
  white-space:nowrap;
}
.insured2-row{
  display:flex;
  align-items:center;
  padding:3px 0;
  gap:6px;
  flex-wrap:wrap;
}
.insured2-label{
  font-size:8.5px;
  color:#111;
  white-space:nowrap;
}
.insured2-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
}
.insured2-box-row .char-box{
  width:15px;
  height:16px;
  border:1px solid #333;
  margin-right:0;
  font-size:7.5px;
  flex-shrink:0;
}
.insured2-box-row.long{
  flex:1;
}
.insured2-check-item{
  display:flex;
  align-items:center;
  gap:3px;
  white-space:nowrap;
}
.insured2-check-box{
  width:11px;
  height:11px;
  border:1px solid #333;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:8px;
  flex-shrink:0;
}
.insured2-textarea{
  flex:1;
  min-height:34px;
  border:1px solid #333;
  margin-left:4px;
}
/* SECTION C (new layout) */
.sc-section{
  font-family:Arial, Helvetica, sans-serif;
  margin-bottom:8px;
}
.sc-band{
  display:flex;
  align-items:center;
  margin-bottom:6px;
}
.sc-band-bar{ flex:1; height:2px; background:#111; }
.sc-band-title{
  font-size:9px;
  font-weight:700;
  color:#111;
  padding:0 10px;
  white-space:nowrap;
}
.sc-row{
  display:flex;
  align-items:center;
  padding:3px 0;
  gap:6px;
  flex-wrap:wrap;
}
.sc-label{
  font-size:8.5px;
  color:#111;
  white-space:nowrap;
}
  .sc-labelss{
  font-size:8.5px;
  color:#111;
  white-space:nowrap;
}
.sc-box-row{
  display:flex;
  align-items:center;
  flex-wrap:nowrap;
}
.sc-box-row .char-box{
  width:15px;
  height:16px;
  border:1px solid #333;
  margin-right:0;
  font-size:7.5px;
  flex-shrink:0;
}
.sc-box-row.long{ flex:1; }
.sc-textarea{
  flex:1;
  min-height:30px;
  border:1px solid #333;
  margin-left:4px;
}
.sc-textarea.tall{ min-height:44px; }
.sc-check-item{
  display:flex;
  align-items:center;
  gap:3px;
  white-space:nowrap;
}
.sc-check-box{
  width:11px;
  height:11px;
  border:1px solid #333;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:8px;
  flex-shrink:0;
}
 /* SECTION D */
.pd-section{
  margin-top:10px;
  margin-bottom:10px;
  font-family:Arial, Helvetica, sans-serif;
  page-break-inside: avoid;
    break-inside: avoid;
}
.pd-header-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:2px solid #111;
  padding-bottom:4px;
  margin-bottom:6px;
}
.pd-header{ font-size:9.5px; font-weight:700; color:#111; }
.pd-block-note{ font-size:8px; font-weight:700; color:#111; white-space:nowrap; }

.pd-columns{
  display:flex;
  gap:12px;
  align-items:flex-start;
}
.pd-col-left{ flex:1.15; min-width:0; }
.pd-col-right{ flex:1; min-width:0; margin-top:26px;  }

.pd-row{
  display:flex;
  align-items:center;
  padding:3px 0;
  gap:6px;
  flex-wrap:wrap;
}
.pd-label{ font-size:8.5px; color:#111; white-space:nowrap; }
.pd-box-row{ display:flex; align-items:center; flex-wrap:nowrap; }
.pd-box-row .char-box{
  width:15px;
  height:16px;
  border:1px solid #333;
  margin-right:0;
  font-size:7.5px;
  flex-shrink:0;
}
.pd-check-item{ display:flex; align-items:center; gap:4px; white-space:nowrap; }
.pd-check-box{
  width:12px;
  height:12px;
  border:1px solid #333;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:8px;
  flex-shrink:0;
}
.pd-rs{ font-size:8.5px; color:#111; white-space:nowrap; }

/* Cost rows: label left, "Rs" + box grid on the right */
.pd-cost-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:3px 0;
  gap:6px;
}
.pd-cost-label{ font-size:8.5px; color:#111; flex:1; }
.pd-cost-boxes{ display:flex; align-items:center; gap:4px; flex-shrink:0; }
.pd-cost-boxes .char-box{
  width:14px;
  height:15px;
  border:1px solid #333;
  margin-right:0;
  font-size:7px;
  flex-shrink:0;
}

/* Chronic illness list (right column) */
.pd-chronic-title{
  font-size:8px;
  font-weight:700;
  color:#111;
  line-height:1.3;
  margin-bottom:6px;
}

.pd-chronic-checkbox{
  width:12px;
  height:12px;
  border:1px solid #333;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:8px;
  flex-shrink:0;
}
.pd-chronic-num{ font-size:8.5px; color:#111; white-space:nowrap; min-width:12px; }
.pd-chronic-row{
  display:flex;
  align-items:center;
  padding:2.5px 0;
  gap:5px;
}
.pd-chronic-label{
  font-size:8.5px;
  color:#111;
  flex:1;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.pd-chronic-my-boxes{
  display:flex;
  align-items:center;
  gap:3px;
  flex-shrink:0;
  width:64px;           /* fixed width so all rows align in a column */
  justify-content:flex-end;
}
.pd-chronic-my-boxes .char-box{
  width:13px;
  height:14px;
  border:1px solid #333;
  margin-right:0;
  font-size:7px;
  flex-shrink:0;
}
.pd-chronic-my-boxes .char-box{
  width:14px;
  height:15px;
  border:1px solid #333;
  margin-right:0;
  font-size:7px;
  flex-shrink:0;
}
.pd-chronic-other-box{
  margin-top:8px;
  width:100%;
  min-height:60px;
  border:1px solid #333;
}
.final-decl-section { font-family: Arial, Helvetica, sans-serif; margin-top:10px; margin-bottom:10px; }

.final-decl-intro { font-size:8.5px; color:#111; padding:6px 0; }
.final-decl-row { display:flex; align-items:center; padding:3px 0; gap:6px; flex-wrap:nowrap; }
.final-decl-label { font-size:8.5px; color:#111; white-space:nowrap; }
.final-decl-box-row { display:flex; align-items:center; flex-wrap:nowrap; }
.final-decl-box-row .char-box { width:15px; height:16px; border:1px solid #333; margin-right:0; font-size:7.5px; flex-shrink:0; }
.final-decl-box-row.long { flex:1; }
.final-decl-sub-header { font-size:9px; font-weight:700; color:#111; padding:8px 0 4px; }
.final-decl-item { display:flex; align-items:flex-start; gap:4px; padding:2px 0; }
.final-decl-item-letter { font-size:10px; color:#111; white-space:nowrap; flex-shrink:0; }
.final-decl-item-text { font-size:10px; color:#111; line-height:1.3; }
.final-decl-sign-box { width:100%; max-width:260px; height:60px; border:1px solid #333; margin-top:4px; }
/* ===== Declaration Heading ===== */

.final-decl-heading{
    display:flex;
    align-items:center;
    width:100%;
    margin:2px 0 5px;
}

.final-decl-heading-line{
    flex:1;
    border-top:1px solid #000;
}

.final-decl-heading-text{
    padding:0 12px;
    font-family:Arial, Helvetica, sans-serif;
    font-size:11px;
    font-weight:700;
    text-transform:uppercase;
    white-space:nowrap;
    line-height:1;
}
/* ---------------- HOSPITAL DECLARATION ---------------- */

.hospital-declaration {
  width: 100%;
  margin-top: 8px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  color: #000;
  line-height: 1.32;
}

.hospital-declaration-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.hospital-declaration-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 7px;
}

.hospital-declaration-row:last-child {
  margin-bottom: 0;
}

.hospital-declaration-row .letter {
  width: 18px;
  min-width: 18px;
  font-size: 10px;
  font-weight: 400;
  line-height: 1.32;
}

.hospital-declaration-row .text {
  font-size: 10px;
  flex: 1;
  text-align: left;
  line-height: 1.32;
  word-break: normal;
}
  /*==========================
  SECTION F
===========================*/

.section-f{
    width:100%;
    margin-top:6px;
    font-family:Arial, Helvetica, sans-serif;
    color:#000;
    font-size:11px;
    page-break-inside: avoid;
    break-inside: avoid;
}

.section-f-title{
    font-size:12px;
    font-weight:700;
    text-transform:uppercase;
    margin-bottom:10px;
}

.section-f-item{
    display:flex;
    align-items:flex-start;
    margin-bottom:9px;
    line-height:1.28;
}

.section-f-item .num{
    width:18px;
    flex-shrink:0;
    font-size:10px;
}

.section-f-item .txt{
    font-size:10px;
    flex:1;
}

.section-f-signatures{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    margin-top:48px;
    margin-bottom:10px;
}

.seal-block,
.doctor-block{
    display:flex;
    align-items:flex-start;
}

.seal-label,
.doctor-label{
    font-size:10px;
    margin-right:10px;
    white-space:nowrap;
    padding-top:4px;
}

.seal-box{
    width:278px;
    height:50px;
    border:1px solid #555;
}

.doctor-box{
    width:305px;
    height:58px;
    border:1px solid #555;
}

.section-f-footer{
    display:flex;
    align-items:flex-end;
    margin-top:8px;
}

.date-area{
    display:flex;
    align-items:flex-end;
}

.time-area{
    display:flex;
    align-items:flex-end;
    margin-left:18px;
}

.footer-label{
    font-size:10px;
    margin-right:8px;
    margin-bottom:1px;
}

.date-boxes,
.time-boxes{
    display:flex;
}

.date-boxes span,
.time-boxes span{
    width:16px;
    height:18px;
    border:1px solid #777;
    margin-right:2px;
    font-size:10px;
    color:#555;
    display:flex;
    align-items:center;
    justify-content:center;
    box-sizing:border-box;
}

.time-boxes span{
    width:17px;
}
    .sc-row-two{
    display:flex;
    gap:12px;              /* same gap as the two boxes */
    margin-bottom:2px;
}

.sc-col{
    flex:1;
}

.sc-col .sc-label{
    display:block;
    font-size:8.5px;
    color:#111;
}
    .jk-row{
    display:flex;
    gap:12px;
    width:100%;
}

.jk-col{
    flex:1;
}

.jk-label{
    font-size:8px;
    margin-bottom:2px;
}

.jk-box{
    border:1px solid #333;
    height:42px;
}
    .sc-single-box{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:54px;
    height:18px;
    border:1px solid #555;
    box-sizing:border-box;
    margin:0 10px 0 4px;
    font-size:11px;
    background:#fff;
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
  <div class="header-top-row">
    <div class="header-title-block">
      <div class="header-copy-title">REQUEST FOR CASHLESS HOSPITALISATION</div>
      <div class="header-copy-subtitle">PART C (Revised)</div>
    </div>
    <div class="header-logo-wrap-sbi">
      <img
        src="${sbiLogoSrc}"
        alt="SBI General Insurance"
        class="header-logo-image-sbi"
      />
    </div>
  </div>
  
</div>
<!-- SECTION A -->
<div class="hid-section">

  <div class="hid-top-row">
    <div style="display:flex;align-items:center;">
      <span class="hid-top-label">Hospital ID :</span>
      <div class="hid-top-box"></div>
    </div>
    <div class="hid-block-note">TO BE FILLED IN BLOCK LETTERS ONLY</div>
  </div>

  <div class="hid-row">
    <div class="hid-label">Name of the hospital:</div>
    <div class="hid-box-row">
      ${charBoxHtml(f.hospitalName ?? "", 40)}
    </div>
  </div>

  <div class="hid-row">
    <div class="hid-label">Hospital Location:</div>
    <div class="hid-box-row" style="flex:0 0 auto;width:60%;">
      ${charBoxHtml(f.hospitalLocation ?? "", 24)}
    </div>
    <span class="hid-inline-label">Hospital ID:</span>
    <div class="hid-inline-box"></div>
    <div class="hid-box-row">
      ${charBoxHtml(f.hospitalIdCode ?? "", 6)}
    </div>
  </div>

  <div class="hid-row">
    <div class="hid-label">Hospital Email ID:</div>
    <div class="hid-box-row" style="flex:0 0 auto;width:52%;">
      ${charBoxHtml(f.hospitalEmail ?? "", 20)}
    </div>
    <span class="hid-inline-label">ROHINI ID:</span>
    <div class="hid-box-row">
      ${charBoxHtml(f.rohiniId ?? "", 12)}
    </div>
  </div>

</div>
<!-- SECTION B -->
<div class="claims-admin-section">
  <div class="claims-admin-title">DETAILS OF CLAIMS ADMINISTRATOR</div>
  <div class="claims-admin-row">
    <span class="claims-admin-label">a) Name of Insurer:&nbsp;&nbsp;${escHtml(f.insurerName ?? "SBI General Insurance Company Limited")}</span>
    <span class="claims-admin-label">b) Toll Free no.:&nbsp;&nbsp;${escHtml(f.tollFreeNo ?? "1800 210 3366 / 1800 210 6366")}</span>
  </div>
</div>

<div class="insured2-section">
  <div class="insured2-band">
    <div class="insured2-band-bar"></div>
    <div class="insured2-band-title">TO BE FILLED BY INSURED/PATIENT</div>
    <div class="insured2-band-bar"></div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">a) Name of the patient:</span>
    <div class="insured2-box-row long">${charBoxHtml(f.patientName ?? "", 28)}</div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">b) Gender:</span>
    <span class="insured2-check-item"><span class="insured2-check-box">${f.gender === "male" ? "&#10003;" : ""}</span><span class="insured2-label">Male</span></span>
    <span class="insured2-check-item"><span class="insured2-check-box">${f.gender === "female" ? "&#10003;" : ""}</span><span class="insured2-label">Female</span></span>
    <span class="insured2-check-item"><span class="insured2-check-box">${f.gender === "third" ? "&#10003;" : ""}</span><span class="insured2-label">Third Gender</span></span>
    <span class="insured2-label">c) Contact no.:</span>
    <div class="insured2-box-row">${charBoxHtml(f.contactNumber ?? "", 10)}</div>
    <span class="insured2-label">d) Alternate Contact</span>
    <div class="insured2-box-row">${charBoxHtml(f.alternateContact ?? "", 10)}</div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">e) Age: Years</span>
    <div class="insured2-box-row">${placeholderBoxRowHtml(f.ageYears ?? "", ["Y", "Y"])}</div>
    <span class="insured2-label">Months</span>
    <div class="insured2-box-row">${placeholderBoxRowHtml(f.ageMonths ?? "", ["M", "M"])}</div>
    <span class="insured2-label">f) Date of Birth:</span>
    <div class="insured2-box-row">${placeholderBoxRowHtml(f.dob ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
    <span class="insured2-label">g) Insurer ID Card No.:</span>
    <div class="insured2-box-row">${charBoxHtml(f.insuredCardId ?? "", 10)}</div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">h) Policy number / Name of corporate:</span>
    <div class="insured2-box-row long">${charBoxHtml(f.policyNumber ?? "", 24)}</div>
    <span class="insured2-label">i) Employee ID:</span>
    <div class="insured2-box-row">${charBoxHtml(f.employeeId ?? "", 10)}</div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">j) Currently do you have any other medical claim / health insurance:</span>
    <span class="insured2-check-item"><span class="insured2-check-box">${f.otherInsurance === "yes" ? "&#10003;" : ""}</span><span class="insured2-label">Yes</span></span>
    <span class="insured2-check-item"><span class="insured2-check-box">${f.otherInsurance === "no" ? "&#10003;" : ""}</span><span class="insured2-label">No</span></span>
    <span class="insured2-label">j1) Insurer name:</span>
    <div class="insured2-box-row long">${charBoxHtml(f.otherInsuranceCompany ?? "", 14)}</div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">j2) Give details:</span>
    <div class="insured2-textarea"></div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">k) Do you have family physician, if yes: Name:</span>
    <div class="insured2-box-row long">${charBoxHtml(f.familyPhysicianName ?? "", 22)}</div>
    <span class="insured2-label">k1) contact No.:</span>
    <div class="insured2-box-row">${charBoxHtml(f.familyPhysicianContact ?? "", 10)}</div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">l) Occupation of insured patient :</span>
    <div class="insured2-box-row">${charBoxHtml(f.occupation ?? "", 10)}</div>
  </div>

  <div class="insured2-row">
    <span class="insured2-label">m) Address of insured patient :</span>
    <div class="insured2-textarea"></div>
  </div>
</div>
<!-- SECTION C -->
<div class="sc-section">
  <div class="sc-band">
    <div class="sc-band-bar"></div>
    <div class="sc-band-title">TO BE FILLED BY THE TREATING DOCTOR / HOSPITAL</div>
    <div class="sc-band-bar"></div>
  </div>

  <div class="sc-row">
    <span class="sc-label">a) Name of the treating doctor :</span>
    <div class="sc-box-row long">${charBoxHtml(f.treatingDoctorName ?? "", 26)}</div>
    <span class="sc-label">b) contact No.:</span>
    <div class="sc-box-row">${charBoxHtml(f.treatingDoctorContact ?? "", 10)}</div>
  </div>

  <div class="sc-row" style="align-items:flex-start;">
    <span class="sc-label" style="flex:1;">c) Name of illness / disease with presenting complaints:</span>
    <span class="sc-label" style="flex:1;">d) Relevant clinical findings:</span>
  </div>
  <div class="sc-row" style="align-items:stretch;">
    <div class="sc-textarea" style="margin-left:0;">${escHtml(f.natureOfIllness ?? "")}</div>
    <div class="sc-textarea">${escHtml(f.clinicalFindings ?? "")}</div>
  </div>

  <div class="sc-row">
    <span class="sc-label">e) Duration of the present ailment:</span>
    <div class="sc-box-row">${charBoxHtml(f.durationDays ?? "", 3)}</div>
    <span class="sc-label">Days</span>
    <span class="sc-label">e.1) Date of first consultation:</span>
    <div class="sc-box-row">${placeholderBoxRowHtml(f.firstConsultationDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
  </div>

  <div class="sc-row">
    <span class="sc-label">e.2) Duration of the present ailment:</span>
    <div class="sc-textarea" style="min-height:16px;">${escHtml(f.pastHistoryDetails ?? "")}</div>
  </div>

  <div class="sc-row" style="align-items:flex-start;justify-content:space-between;">
    <span class="sc-label">f) Provisional diagnosis:</span>
    <span class="sc-label">f.1) ICD 10 Code:</span>
  </div>
  <div class="sc-row" style="align-items:stretch;">
    <div class="sc-textarea tall" style="margin-left:0;">${escHtml(f.provisionalDiagnosis ?? "")}</div>
    <div class="sc-box-row">${charBoxHtml(f.icd10Code ?? "", 10)}</div>
  </div>

  <div class="sc-row">
    <span class="sc-label">g) Proposed line of treatment:</span>
    <span class="sc-check-item"><span class="sc-check-box">${f.proposedMedical ? "&#10003;" : ""}</span><span class="sc-label">Medical Management</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.proposedSurgical ? "&#10003;" : ""}</span><span class="sc-label">Surgical Management</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.proposedIntensiveCare ? "&#10003;" : ""}</span><span class="sc-label">Intensive Care</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.proposedInvestigation ? "&#10003;" : ""}</span><span class="sc-label">Investigation</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.proposedNonAllopathic ? "&#10003;" : ""}</span><span class="sc-label">Non-allopathic treatment</span></span>
  </div>

  <div class="sc-row" style="align-items:flex-start;justify-content:space-between;">
    <span class="sc-label">h) If investigation and/or medical management, provide details:</span>
    <span class="sc-label">h.1) Route of drug administration</span>
  </div>
  <div class="sc-row" style="align-items:stretch;">
    <div class="sc-textarea" style="margin-left:0;">${escHtml(f.investigationDetails ?? "")}</div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      <span class="sc-check-item"><span class="sc-check-box">${f.drugRoute === "iv" ? "&#10003;" : ""}</span><span class="sc-label">IV</span></span>
      <span class="sc-check-item"><span class="sc-check-box">${f.drugRoute === "oral" ? "&#10003;" : ""}</span><span class="sc-label">Oral</span></span>
      <span class="sc-check-item"><span class="sc-check-box">${f.drugRoute === "other" ? "&#10003;" : ""}</span><span class="sc-label">Other</span></span>
    </div>
    <div class="sc-textarea">${escHtml(f.drugRouteOther ?? "")}</div>
  </div>

  <div class="sc-row" style="align-items:flex-start;justify-content:space-between;">
    <span class="sc-label">i) If surgical, name of surgery:</span>
    <span class="sc-label">i.1) ICD 10 PCS Code:</span>
  </div>
  <div class="sc-row" style="align-items:stretch;">
    <div class="sc-textarea tall" style="margin-left:0;">${escHtml(f.surgeryName ?? "")}</div>
    <div class="sc-box-row">${charBoxHtml(f.icd10PcsCode ?? "", 10)}</div>
  </div>

<div class="jk-row">

    <div class="jk-col">
        <div class="jk-label">
            j) If other treatments, provide details:
        </div>

        <div class="jk-box"></div>
    </div>

    <div class="jk-col">
        <div class="jk-label">
            k) How did injury occur:
        </div>

        <div class="jk-box"></div>
    </div>

</div>
  

  <div class="sc-row" style="align-items:center;flex-wrap:wrap;">
    <span class="sc-label">l) In case of accident: i) Is it RTA:</span>
    <span class="sc-check-item"><span class="sc-check-box">${f.isRTA === "yes" ? "&#10003;" : ""}</span><span class="sc-label">Yes</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.isRTA === "no" ? "&#10003;" : ""}</span><span class="sc-label">No</span></span>
    <span class="sc-label">ii) Date of Injury:</span>
    <div class="sc-box-row">${placeholderBoxRowHtml(f.dateOfInjury ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
    <span class="sc-label">iii) Reported to Policy:</span>
    <span class="sc-check-item"><span class="sc-check-box">${f.reportedToPolice === "yes" ? "&#10003;" : ""}</span><span class="sc-label">Yes</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.reportedToPolice === "no" ? "&#10003;" : ""}</span><span class="sc-label">No</span></span>
    <span class="sc-label">iv) FIR No.:</span>
   
  </div>

  <div class="sc-row" style=";justify-content:flex-start;flex-wrap:nowrap;">
   
    <span class="sc-label" >v) Injury / disease caused due to substance abuse/alcohol consumption:</span>
        <span class="sc-check-item"><span class="sc-check-box">${f.testConducted === "yes" ? "&#10003;" : ""}</span><span class="sc-label">Yes</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.testConducted === "no" ? "&#10003;" : ""}</span><span class="sc-label">No</span></span>
    <span class="sc-label" style="margin-left:20px;">vi) Test conducted to establish this, if yes attach report:</span>
    <span class="sc-check-item"><span class="sc-check-box">${f.testConducted === "yes" ? "&#10003;" : ""}</span><span class="sc-label">Yes</span></span>
    <span class="sc-check-item"><span class="sc-check-box">${f.testConducted === "no" ? "&#10003;" : ""}</span><span class="sc-label">No</span></span>
  </div>

  

  <div class="sc-row" style="align-items:center;flex-wrap:wrap;">
    <span class="sc-label">m) In case of Maternity:</span>
    <span class="sc-label">G</span>
<div class="sc-single-box">${escHtml(f.maternityG ?? "")}</div>

<span class="sc-label">P</span>
<div class="sc-single-box">${escHtml(f.maternityP ?? "")}</div>

<span class="sc-label">L</span>
<div class="sc-single-box">${escHtml(f.maternityL ?? "")}</div>

<span class="sc-label">A</span>
<div class="sc-single-box">${escHtml(f.maternityA ?? "")}</div>
    <span class="sc-label" style="margin-left:20px;">n) Expected date of delivery:</span>
    <div class="sc-box-row">${placeholderBoxRowHtml(f.expectedDeliveryDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
  </div>
</div>


<!-- SECTION D -->
<div class="pd-section">
  <div class="pd-header-row">
    <div class="pd-header">DETAILS OF PATIENT ADMITTED</div>
    <div class="pd-block-note">TO BE FILLED IN BLOCK LETTERS ONLY</div>
  </div>

  <div class="pd-row">
    <span class="pd-label">A) Date of admission:</span>
    <div class="pd-box-row">${placeholderBoxRowHtml(f.admissionDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
    <span class="pd-label" style="margin-left:14px;">b) Time of admission:</span>
    <div class="pd-box-row">${placeholderBoxRowHtml(f.admissionTimeHH ?? "", ["H", "H"])}</div>
    <div class="pd-box-row">${placeholderBoxRowHtml(f.admissionTimeMM ?? "", ["M", "M"])}</div>
    <span class="pd-label" style="margin-left:14px;">c) This is an</span>
    <span class="pd-check-item"><span class="pd-check-box">${f.hospitalizationType === "emergency" ? "&#10003;" : ""}</span><span class="pd-label">An emergency /</span></span>
    <span class="pd-check-item"><span class="pd-check-box">${f.hospitalizationType === "planned" ? "&#10003;" : ""}</span><span class="pd-label">A planned hospitalization event</span></span>
  </div>

  <div class="pd-columns">
    <div class="pd-col-left">

      <div class="pd-row" style="flex-wrap:nowrap;">
  <span class="pd-label" style="flex-shrink:0;">d) Date of admission:</span>
  <div class="pd-box-row" style="flex:0 0 auto;">${charBoxHtml(f.admissionDateDays ?? "", 4)}</div>
  <span class="pd-label" style="flex-shrink:0;">Days</span>
  <span class="pd-label" style="margin-left:10px;flex-shrink:0;">e) Days in ICU:</span>
  <div class="pd-box-row" style="flex:0 0 auto;">${charBoxHtml(f.icuDays ?? "", 4)}</div>
  <span class="pd-label" style="flex-shrink:0;">Days</span>
  <span class="pd-label" style="margin-left:10px;flex-shrink:0;">f) Room Type:</span>
 <div
  style="
    width:150px;
    height:18px;
    border:1px solid #333;
    box-sizing:border-box;
    margin-left:6px;
    flex:0 0 auto;
  ">
</div>
</div>

      

      <div class="pd-cost-row">
        <span class="pd-cost-label">g) Per Day Room Rent+Nursing &amp; Service charges+Patient's Diet :</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.roomRentTotal ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">h) Expected cost for investigation + diagnostics:</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.investigationCost ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">i) ICU Charges:</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.icuCharges ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">J) OT Charges:</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.otCharges ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">k) Professional fees Surgeon + Anesthetist fees + Consultation charges:</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.professionalFees ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">l) Medicines + Consumables cost of Implants: (specify if applicable):</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.medicinesCost ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">m) Other hospital expenses if any</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.otherHospitalExpenses ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">n) All inclusive package charges if any applicable :</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.packageCharges ?? "", 8)}</div>
      </div>

      <div class="pd-cost-row">
        <span class="pd-cost-label">o) Sum Total expected cost of hospitalization</span>
        <span class="pd-rs">Rs</span>
        <div class="pd-cost-boxes">${charBoxHtml(f.totalExpectedCost ?? "", 8)}</div>
      </div>

    </div>

    <div class="pd-col-right">
      <div class="pd-chronic-title">p. Mandatory past history of any chronic illness. If yes (since month/year)</div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("diabetes") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">1.</span>
        <span class="pd-chronic-label">Diabetes</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("diabetes"), 2)}${charBoxHtml(chronicYear("diabetes"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("heartDisease") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">2.</span>
        <span class="pd-chronic-label">Heart Disease</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("heartDisease"), 2)}${charBoxHtml(chronicYear("heartDisease"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("hypertension") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">3.</span>
        <span class="pd-chronic-label">Hypertension</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("hypertension"), 2)}${charBoxHtml(chronicYear("hypertension"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("hyperlipidemias") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">4.</span>
        <span class="pd-chronic-label">Hyperlipidemias</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("hyperlipidemias"), 2)}${charBoxHtml(chronicYear("hyperlipidemias"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("osteoarthritis") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">5.</span>
        <span class="pd-chronic-label">Osteoarthritis</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("osteoarthritis"), 2)}${charBoxHtml(chronicYear("osteoarthritis"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("asthma") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">6.</span>
        <span class="pd-chronic-label">Asthma / COPD / Bronchitis</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("asthma"), 2)}${charBoxHtml(chronicYear("asthma"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("cancer") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">7.</span>
        <span class="pd-chronic-label">Cancer</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("cancer"), 2)}${charBoxHtml(chronicYear("cancer"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("alcoholDrugAbuse") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">8.</span>
        <span class="pd-chronic-label">Alcohol or drug abuse</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("alcoholDrugAbuse"), 2)}${charBoxHtml(chronicYear("alcoholDrugAbuse"), 2)}</div>
      </div>

      <div class="pd-chronic-row">
        <span class="pd-chronic-checkbox">${chronicChecked("hivStd") ? "&#10003;" : ""}</span>
        <span class="pd-chronic-num">9.</span>
        <span class="pd-chronic-label">Any HIV or STD / Related Ailments</span>
        <div class="pd-chronic-my-boxes">${charBoxHtml(chronicMonth("hivStd"), 2)}${charBoxHtml(chronicYear("hivStd"), 2)}</div>
      </div>

      <div class="pd-chronic-other-box"></div>
    </div>
  </div>
</div>
<!-- FINAL DECLARATION (replaces decl-section + patient-decl-section) -->
<div class="final-decl-section">
  <div class="final-decl-heading">
    <div class="final-decl-heading-line"></div>

    <div class="final-decl-heading-text">
        DECLARATION (PLEASE READ VERY CAREFULLY)
    </div>

    <div class="final-decl-heading-line"></div>
</div>
  <div class="final-decl-intro">We confirm having read understood and agreed to the declaration of this form</div>

  <div class="final-decl-row">
    <span class="final-decl-label">a.&nbsp; Name of the treating doctor</span>
    <div class="final-decl-box-row long">${charBoxHtml(f.declTreatingDoctorName ?? "", 34)}</div>
  </div>

  <div class="final-decl-row">
    <span class="final-decl-label">b.&nbsp; Qualification</span>
    <div class="final-decl-box-row" style="flex:0 0 auto;width:40%;">${charBoxHtml(f.declQualification ?? "", 20)}</div>
    <span class="final-decl-label">c) Registration No. with State code:</span>
    <div class="final-decl-box-row long">${charBoxHtml(f.declRegistrationNo ?? "", 16)}</div>
  </div>

  <div class="final-decl-sub-header">DECLARATION BY THE PATIENT / REPRESENTATIVE</div>

  <div class="final-decl-item"><span class="final-decl-item-letter">a.</span><span class="final-decl-item-text">I agree to allow the hospital to submit all original documents pertaining to hospitalization to the Insurer/TPA after the discharge. I agree to sign on the Final Bill &amp; the Discharge Summary, before my discharge.</span></div>
  <div class="final-decl-item"><span class="final-decl-item-letter">b.</span><span class="final-decl-item-text">Payment to hospital is governed by the terms and conditions of the policy. In case the Insurer / TPA is not liable to settle the hospital bill, I undertake to settle the bill as per the terms and condi-tions of the policy.</span></div>
  <div class="final-decl-item"><span class="final-decl-item-letter">c.</span><span class="final-decl-item-text">All non-medical expenses and expenses not relevant to current hospitalization and the amounts over &amp; above the limit authorized by the Insurer/TPA not governed by the terms and conditions of the policy will be paid by me.</span></div>
  <div class="final-decl-item"><span class="final-decl-item-letter">d.</span><span class="final-decl-item-text">I hereby declare to abide by the terms and conditions of the policy and if at any time the facts disclosed by me are found to be false or incorrect I forfeit my claim and agree to indemnify the insurer / TPA</span></div>
  <div class="final-decl-item"><span class="final-decl-item-letter">e.</span><span class="final-decl-item-text">I agree and understand that TPA is in no way warranting the service of the hospital &amp; that the Insurer / TPA is in no way guaranteeing that the services provided by the hospital will be of a particular quality or standard.</span></div>
  <div class="final-decl-item"><span class="final-decl-item-letter">f.</span><span class="final-decl-item-text">I hereby warrant the truth of the forgoing particulars in every respect and I agree that if I have made or shall make any false or untrue statement, suppression or concealment with respect to the claim, my right to claim reimbursement of the said expenses shall be absolutely forfeited.</span></div>
  <div class="final-decl-item"><span class="final-decl-item-letter">g.</span><span class="final-decl-item-text">I agree to indemnify the hospital against all expenses incurred on my behalf, which are not reimbursed by the Insurer/ TPA.</span></div>
  <div class="final-decl-item"><span class="final-decl-item-letter">h.</span><span class="final-decl-item-text">"I/We authorize Insurance Company/TPA to contact me/us through mobile/email for any update on this claim"</span></div>

  <div class="final-decl-row" style="margin-top:12px;">
    <span class="final-decl-label">a.&nbsp; Patient's / Insured's Name:</span>
    <div class="final-decl-box-row long">${charBoxHtml(f.patientDeclName ?? f.patientName ?? "", 26)}</div>
  </div>

  <div class="final-decl-row">
    <span class="final-decl-label">b.&nbsp; Contact Number:</span>
    <div class="final-decl-box-row" style="flex:0 0 auto;width:34%;">${charBoxHtml(f.patientDeclContact ?? f.contactNumber ?? "", 10)}</div>
    <span class="final-decl-label">c) Email ID: (Optional)</span>
    <div class="final-decl-box-row long">${charBoxHtml(f.patientDeclEmail ?? "", 20)}</div>
  </div>

  <div class="final-decl-row" style="justify-content:flex-end;">
    <span class="final-decl-label">Date:</span>
    <div class="final-decl-box-row">${placeholderBoxRowHtml(f.patientDeclDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
    <span class="final-decl-label" style="margin-left:12px;">Time:</span>
    <div class="final-decl-box-row">${placeholderBoxRowHtml(f.patientDeclTime ?? "", ["H", "H", "M", "M"])}</div>
  </div>

  <div class="final-decl-row" style="align-items:flex-start;">
    <span class="final-decl-label">c.&nbsp; Patient's / Insured's Signature</span>
  </div>
  <div class="final-decl-sign-box"></div>
</div>

<!-- DECLARATIONS -->
<div class="hospital-declaration">
  <div class="final-decl-sub-header">
    HOSPITAL DECLARATION
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">a.</span>
    <span class="text">
      We have no objection to any authorized TPA / Insurance Company official
      verifying documents pertaining to hospitalization.
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">b.</span>
    <span class="text">
      All valid original documents duly countersigned by the insured / patient
      as per the checklist below will be sent to TPA/ Insurance Company within
      7 days of the patient's discharge.
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">c.</span>
    <span class="text">
      We agree that TPA / Insurance Company will not be Liable to make the
      payment in the event of any discrepancy between the facts in this form
      and discharge summary or other documents.
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">d.</span>
    <span class="text">
      The patient declaration has been signed by the patient or by his
      representative in our presence.
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">e.</span>
    <span class="text">
      We agree to provide clarifications for the queries raised regarding this
      hospitalization and we take the sole responsibility for any delay in
      offering clarifications.
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">f.</span>
    <span class="text">
      We will abide by the terms and conditions agreed in the MOU.
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">g.</span>
    <span class="text">
      We confirm that no additional amount would be collected from the insured
      in excess of Agreed Package Rates except costs towards non-admissible
      amounts (including additional charges due to opting higher room rent than
      eligibility choosing separate line of treatment which is not envisaged/
      considered in package).
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">h.</span>
    <span class="text">
      We confirm that no recoveries would be made from the deposit amount
      collected from the Insured except for costs towards non-admissible amounts
      (including additional charges due to opting higher room rent than
      eligibility/ choosing separate line of treatment which is not
      envisaged/considered in package).
    </span>
  </div>

  <div class="hospital-declaration-row">
    <span class="letter">i.</span>
    <span class="text">
      In the event of unauthorized recovery of any additional amount from the
      Insured in excess of Agreed Package Rates, the authorized TPA / Insurance
      Company reserves the right to recover the same from us (the Network
      Provider) and/or take necessary action, as provided under the MOU or
      applicable laws.
    </span>
  </div>
</div>
       
<!-- SECTION F -->
<div class="section-f">

  <div class="final-decl-sub-header">
    DOCUMENTS TO BE PROVIDED BY THE HOSPITAL IN SUPPORT OF THE CLAIM
  </div>

  <div class="section-f-item">
    <span class="num">1.</span>
    <span class="txt">
      Detailed Discharge Summary and all Bills from the hospital.
    </span>
  </div>

  <div class="section-f-item">
    <span class="num">2.</span>
    <span class="txt">
      Cash Memos from the Hospitals / Chemists supported by proper prescription.
    </span>
  </div>

  <div class="section-f-item">
    <span class="num">3.</span>
    <span class="txt">
      Receipts and Pathological Test Reports from Pathologists, Supported by note
      from the attending Medical Practitioner / Surgeon recommending such
      pathological Tests.
    </span>
  </div>

  <div class="section-f-item">
    <span class="num">4.</span>
    <span class="txt">
      Surgeon's Certificate stating nature of Operation performed and Surgeon's
      Bill and Receipt.
    </span>
  </div>

  <div class="section-f-item">
    <span class="num">5.</span>
    <span class="txt">
      Certificates from attending Medical Practitioner / Surgeon that the patient
      is fully cured.
    </span>
  </div>

  <div class="section-f-signatures">

      <div class="seal-block">
          <div class="seal-label">HospitalSeal:</div>
          <div class="seal-box"></div>
      </div>

      <div class="doctor-block">
          <div class="doctor-label">Doctor's Signature:</div>
          <div class="doctor-box"></div>
      </div>

  </div>

  <div class="section-f-footer">

      <div class="date-area">

          <div class="footer-label">Date:</div>

          <div class="final-decl-box-row">${placeholderBoxRowHtml(f.patientDeclDate ?? "", ["D", "D", "M", "M", "Y", "Y", "Y", "Y"])}</div>
    <span class="final-decl-label" style="margin-left:12px;">Time:</span>

      </div>

      <div class="time-area">

          <div class="footer-label">Time:</div>

           <div class="final-decl-box-row">${placeholderBoxRowHtml(f.patientDeclTime ?? "", ["H", "H", "M", "M"])}</div>

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
  let sbiLogoDataUrl = null;
  if (Platform.OS !== "web") {
    [logoDataUrl, headerBannerDataUrl, sbiLogoDataUrl] = await Promise.all([
      getLogoBase64().catch(() => null),
      getHeaderBannerBase64().catch(() => null),
      getSbiLogoBase64().catch(() => null),
    ]);
  }

  const html =
    htmlOverride ||
    generateInsuranceFormHTML(
      form,
      signatureDataUrl,
      logoDataUrl,
      headerBannerDataUrl,
      sbiLogoDataUrl,
    );
  if (Platform.OS === "web") {
    let injectedStyle = null;
    let host = null;

    const waitForImages = (root) => {
      const imgs = Array.from(root.querySelectorAll("img"));
      return Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return img.decode
              ? img.decode().catch(() => {})
              : Promise.resolve();
          }
          return new Promise((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }).then(() =>
            img.decode ? img.decode().catch(() => {}) : undefined,
          );
        }),
      );
    };

    const renderPdf = async () => {
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
      await waitForImages(captureEl);

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
    };

    try {
      try {
        await renderPdf();
      } catch (firstError) {
        if (injectedStyle) {
          injectedStyle.remove();
          injectedStyle = null;
        }
        if (host) {
          host.remove();
          host = null;
        }
        console.warn("PDF export attempt 1 failed, retrying:", firstError);
        await renderPdf();
      }
    } catch (error) {
      console.error("Insurance claim PDF export failed on web:", error);
      if (injectedStyle) {
        injectedStyle.remove();
        injectedStyle = null;
      }
      if (host) {
        host.remove();
        host = null;
      }
      throw error;
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