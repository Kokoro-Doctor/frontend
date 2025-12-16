// Common country codes with their names and max length
export const COUNTRY_CODES = [
  { code: "+91", name: "India", flag: "🇮🇳", maxLength: 10 },
  { code: "+1", name: "USA/Canada", flag: "🇺🇸", maxLength: 10 },
  { code: "+44", name: "UK", flag: "🇬🇧", maxLength: 10 },
  { code: "+61", name: "Australia", flag: "🇦🇺", maxLength: 9 },
  { code: "+81", name: "Japan", flag: "🇯🇵", maxLength: 10 },
  { code: "+86", name: "China", flag: "🇨🇳", maxLength: 11 },
  { code: "+49", name: "Germany", flag: "🇩🇪", maxLength: 11 },
  { code: "+33", name: "France", flag: "🇫🇷", maxLength: 9 },
  { code: "+39", name: "Italy", flag: "🇮🇹", maxLength: 10 },
  { code: "+34", name: "Spain", flag: "🇪🇸", maxLength: 9 },
  { code: "+7", name: "Russia", flag: "🇷🇺", maxLength: 10 },
  { code: "+82", name: "South Korea", flag: "🇰🇷", maxLength: 10 },
  { code: "+65", name: "Singapore", flag: "🇸🇬", maxLength: 8 },
  { code: "+971", name: "UAE", flag: "🇦🇪", maxLength: 9 },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", maxLength: 9 },
  { code: "+971", name: "UAE", flag: "🇦🇪", maxLength: 9 },
  { code: "+27", name: "South Africa", flag: "🇿🇦", maxLength: 9 },
  { code: "+55", name: "Brazil", flag: "🇧🇷", maxLength: 11 },
  { code: "+52", name: "Mexico", flag: "🇲🇽", maxLength: 10 },
  { code: "+31", name: "Netherlands", flag: "🇳🇱", maxLength: 9 },
  { code: "+46", name: "Sweden", flag: "🇸🇪", maxLength: 9 },
  { code: "+47", name: "Norway", flag: "🇳🇴", maxLength: 8 },
  { code: "+41", name: "Switzerland", flag: "🇨🇭", maxLength: 9 },
  { code: "+32", name: "Belgium", flag: "🇧🇪", maxLength: 9 },
  { code: "+351", name: "Portugal", flag: "🇵🇹", maxLength: 9 },
  { code: "+358", name: "Finland", flag: "🇫🇮", maxLength: 9 },
  { code: "+45", name: "Denmark", flag: "🇩🇰", maxLength: 8 },
  { code: "+353", name: "Ireland", flag: "🇮🇪", maxLength: 9 },
  { code: "+48", name: "Poland", flag: "🇵🇱", maxLength: 9 },
  { code: "+90", name: "Turkey", flag: "🇹🇷", maxLength: 10 },
  { code: "+20", name: "Egypt", flag: "🇪🇬", maxLength: 10 },
  { code: "+92", name: "Pakistan", flag: "🇵🇰", maxLength: 10 },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩", maxLength: 10 },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰", maxLength: 9 },
  { code: "+977", name: "Nepal", flag: "🇳🇵", maxLength: 10 },
  { code: "+60", name: "Malaysia", flag: "🇲🇾", maxLength: 9 },
  { code: "+62", name: "Indonesia", flag: "🇮🇩", maxLength: 10 },
  { code: "+66", name: "Thailand", flag: "🇹🇭", maxLength: 9 },
  { code: "+84", name: "Vietnam", flag: "🇻🇳", maxLength: 10 },
  { code: "+63", name: "Philippines", flag: "🇵🇭", maxLength: 10 },
  { code: "+64", name: "New Zealand", flag: "🇳🇿", maxLength: 9 },
  { code: "+212", name: "Morocco", flag: "🇲🇦", maxLength: 9 },
  { code: "+234", name: "Nigeria", flag: "🇳🇬", maxLength: 10 },
  { code: "+254", name: "Kenya", flag: "🇰🇪", maxLength: 9 },
];

// Default country code (India)
export const DEFAULT_COUNTRY_CODE = "+91";

// Get country code info by code
export const getCountryByCode = (code) => {
  return COUNTRY_CODES.find((country) => country.code === code) || COUNTRY_CODES[0];
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
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  
  for (const country of sortedCodes) {
    if (phoneNumber.startsWith(country.code)) {
      return country.code;
    }
  }
  
  return DEFAULT_COUNTRY_CODE;
};

