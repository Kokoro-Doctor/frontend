/**
 * TPAConfig.js
 * ─────────────────────────────────────────────────────────────────
 * Centralized TPA (Third-Party Administrator) configuration.
 * Provides a single source of truth for TPA routing, names, and utilities.
 * Easily extensible for adding new TPAs without modifying route logic.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * TPA Registry — Add new TPAs here
 * Each TPA configuration includes:
 *   - id: unique identifier
 *   - displayName: human-readable name (for dropdowns/UI)
 *   - aliases: array of patterns to match (regex patterns as strings)
 *   - screenName: navigation screen name
 *   - formUtilities: import paths or lazy-loaded utilities
 */
export const TPA_REGISTRY = {
  STAR_HEALTH: {
    id: "star_health",
    displayName: "Star Health",
    aliases: ["star\\s*health"],
    screenName: "StarHealthFormA",
    description: "Star Health Insurance",
  },
  MEDI_ASSIST: {
    id: "medi_assist",
    displayName: "Medi Assist",
    aliases: ["medi\\s*assist"],
    screenName: "MediAssistCombinedForms",
    description: "Medi Assist Insurance",
  },
  CARE_HEALTH: {
    id: "care_health",
    displayName: "Care Health",
    aliases: ["care\\s*health"],
    screenName: "CareHealthCombinedForms",
    description: "Care Health Insurance",
  },
  // Template for adding new TPAs:
  // NEW_TPA: {
  //   id: "new_tpa",
  //   displayName: "New TPA",
  //   aliases: ["new\\s*tpa", "alternative\\s*name"],
  //   screenName: "NewTPACombinedForms",
  //   description: "New TPA Insurance",
  // },
};

/**
 * Get all TPAs formatted for dropdown/selection UI
 * Returns array of { id, name } objects
 */
export const getTPADropdownList = () => {
  return Object.values(TPA_REGISTRY).map((tpa) => ({
    id: tpa.id,
    name: tpa.displayName,
  }));
};

/**
 * Normalize carrier name for consistent matching
 * - convert to lowercase
 * - trim whitespace
 * - remove special characters
 */
const normalizeCarrierName = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

/**
 * Find TPA by matching against aliases
 * Returns TPA configuration object or null if not found
 *
 * Usage:
 *   const tpa = findTPAByName("Star Health");
 *   const screenName = tpa?.screenName;
 */
export const findTPAByName = (name) => {
  if (!name) return null;

  const normalized = normalizeCarrierName(name);
  console.log(`🔍 TPAConfig.findTPAByName: Looking for "${name}" (normalized: "${normalized}")`);
  
  const found = Object.values(TPA_REGISTRY).find((tpa) => {
    const matched = tpa.aliases.some((alias) => {
      const regex = new RegExp(alias);
      const isMatch = regex.test(normalized);
      console.log(`   Trying pattern "${alias}" against "${normalized}": ${isMatch}`);
      return isMatch;
    });
    if (matched) {
      console.log(`   ✓ Found TPA: ${tpa.displayName} (screen: ${tpa.screenName})`);
    }
    return matched;
  });
  
  if (!found) {
    console.log(`   ✗ No TPA found for "${name}"`);
  }
  
  return found;
};

/**
 * Get navigation screen name for a given insurer
 * Falls back to default screen if TPA not found
 *
 * Usage:
 *   const screen = getScreenNameForInsurer("Care Health");
 */
export const getScreenNameForInsurer = (tpaName, fallback = "StarHealthFormA") => {
  const tpa = findTPAByName(tpaName);
  return tpa?.screenName || fallback;
};

/**
 * Determine the target screen based on insurance details from analysisData
 * Priority order:
 *   1. Manually selected insurer from dropdown (if user explicitly chose)
 *   2. Patient insurer (from patient API, if patient was selected)
 *   3. Analysis data (tpa_name, insurance_company from document analysis)
 *   4. Fallback to default
 *
 * Can accept:
 *   - selectedInsurer: object with { id, name } from dropdown selection
 *   - patient: patient object with insurer field
 *   - analysisData: analysis results from document processing
 *
 * Usage:
 *   const targetScreen = getUpdatedFilesScreen(analysisData);
 *   const targetScreen = getUpdatedFilesScreen(analysisData, patient);
 *   const targetScreen = getUpdatedFilesScreen(analysisData, patient, selectedInsurer);
 *   navigation.navigate(targetScreen, { analysisData });
 */
export const getUpdatedFilesScreen = (analysisData, patient = null, selectedInsurer = null) => {
  const structuredInsurance = analysisData?.structured_data?.insurance_details;
  const autofillInsurance = analysisData?.autofill_extracted?.insurance_details;

  const tpaName =
    structuredInsurance?.tpa_name || autofillInsurance?.tpa_name || "";
  const insuranceCompany =
    structuredInsurance?.insurance_company ||
    autofillInsurance?.insurance_company ||
    "";
  const patientInsurer = patient?.insurer || "";
  const selectedInsurerName = selectedInsurer?.name || "";

  // DEBUG: Log what we're working with
  console.log("🔍 TPAConfig.getUpdatedFilesScreen DEBUG:", {
    selectedInsurerName,
    patientInsurer,
    tpaName,
    insuranceCompany,
    structuredInsurance,
    autofillInsurance,
  });

  // PRIORITY 1: Manually selected insurer from dropdown (explicit user choice)
  if (selectedInsurerName) {
    const tpa = findTPAByName(selectedInsurerName);
    console.log(`🔍 TPAConfig: Matched selectedInsurer "${selectedInsurerName}" to:`, tpa);
    if (tpa) return tpa.screenName;
  }

  // PRIORITY 2: Patient insurer (from selected patient)
  if (patientInsurer) {
    const tpa = findTPAByName(patientInsurer);
    console.log(`🔍 TPAConfig: Matched patientInsurer "${patientInsurer}" to:`, tpa);
    if (tpa) return tpa.screenName;
  }

  // PRIORITY 3: Analysis data fields (from document processing)
  if (tpaName) {
    const tpa = findTPAByName(tpaName);
    console.log(`🔍 TPAConfig: Matched tpaName "${tpaName}" to:`, tpa);
    if (tpa) return tpa.screenName;
  }

  if (insuranceCompany) {
    const tpa = findTPAByName(insuranceCompany);
    console.log(`🔍 TPAConfig: Matched insuranceCompany "${insuranceCompany}" to:`, tpa);
    if (tpa) return tpa.screenName;
  }

  // Default fallback
  console.log("🔍 TPAConfig: No match found, using default fallback 'StarHealthFormA'");
  return "MediAssistFormA";
};

/**
 * Get screen name based on patient insurer field (from patient API)
 * Useful for direct patient selection routing
 *
 * Usage:
 *   const screen = getScreenNameForPatient(patient);
 *   navigation.navigate(screen, { analysisData });
 */
export const getScreenNameForPatient = (patient, fallback = null) => {
  if (!patient) return fallback || "StarHealthFormA";

  // Check patient.insurer field (from API response)
  if (patient.insurer) {
    const screenName = getScreenNameForInsurer(patient.insurer);
    if (screenName) return screenName;
  }

  // Check other possible fields
  if (patient.insurance?.insurer) {
    const screenName = getScreenNameForInsurer(patient.insurance.insurer);
    if (screenName) return screenName;
  }

  return fallback || "StarHealthFormA";
};

/**
 * Determine if a TPA is recognized in the system
 *
 * Usage:
 *   if (isKnownTPA("Care Health")) { ... }
 */
export const isKnownTPA = (tpaName) => {
  return findTPAByName(tpaName) !== null;
};

/**
 * Get all registered TPA IDs
 *
 * Usage:
 *   const supportedTPAs = getAllTPAIds();
 */
export const getAllTPAIds = () => {
  return Object.keys(TPA_REGISTRY).map((key) => TPA_REGISTRY[key].id);
};

/**
 * Check if a given screen name belongs to a specific TPA
 *
 * Usage:
 *   if (isScreenForTPA(screenName, "care_health")) { ... }
 */
export const isScreenForTPA = (screenName, tpaId) => {
  const tpaKey = Object.keys(TPA_REGISTRY).find(
    (key) => TPA_REGISTRY[key].id === tpaId,
  );
  return tpaKey ? TPA_REGISTRY[tpaKey].screenName === screenName : false;
};
