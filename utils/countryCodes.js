// Country codes with their names and max length
export const COUNTRY_CODES = [
  { code: "+91", name: "India", flag: "🇮🇳", maxLength: 10 },
  { code: "+1", name: "USA", flag: "🇺🇸", maxLength: 10 },
];

// Default country code (India)
export const DEFAULT_COUNTRY_CODE = "+91";

// Get country code info by code
export const getCountryByCode = (code) => {
  return (
    COUNTRY_CODES.find((country) => country.code === code) || COUNTRY_CODES[0]
  );
};

// Validate phone number based on country code
export const validatePhoneNumber = (phoneNumber, countryCode) => {
  if (!phoneNumber || !countryCode) return false;

  const country = getCountryByCode(countryCode);
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // Minimum length check (at least 7 digits for most countries)
  if (digitsOnly.length < 7) return false;

  // Maximum length check based on country
  if (country.maxLength && digitsOnly.length > country.maxLength) return false;

  return true;
};

// Build full phone number with country code
export const buildFullPhoneNumber = (phoneNumber, countryCode) => {
  if (!phoneNumber || !countryCode) return "";

  const digitsOnly = phoneNumber.replace(/\D/g, "");
  if (!digitsOnly) return "";

  // If phone already starts with +, return as-is
  const trimmed = phoneNumber.trim();
  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  // Remove country code if already present in the number
  const codeDigits = countryCode.replace(/\D/g, "");
  if (digitsOnly.startsWith(codeDigits)) {
    return `+${digitsOnly}`;
  }

  return `${countryCode}${digitsOnly}`;
};

// Detect country code from phone number (if it starts with +)
export const detectCountryCode = (phoneNumber) => {
  if (!phoneNumber || !phoneNumber.startsWith("+")) {
    return DEFAULT_COUNTRY_CODE;
  }

  // Try to match longest country codes first
  const sortedCodes = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length,
  );

  for (const country of sortedCodes) {
    if (phoneNumber.startsWith(country.code)) {
      return country.code;
    }
  }

  return DEFAULT_COUNTRY_CODE;
};
