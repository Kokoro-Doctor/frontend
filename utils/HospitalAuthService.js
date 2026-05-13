// import { API_URL } from "../env-vars";

// const HOSPITALS_API = `${API_URL}/hospitals`;

// export const hospitalLogin = async (hospitalId, apiKey) => {
//   const response = await fetch(`${HOSPITALS_API}/login`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       hospital_id: hospitalId.trim(),
//       api_key: apiKey,
//     }),
//   });

//   if (!response.ok) {
//     const errData = await response.json().catch(() => ({}));
//     const message =
//       errData.detail || errData.message || response.statusText || "Login failed";
//     throw new Error(message);
//   }

//   const data = await response.json();

//   // ── Store token and hospital_id for all subsequent authenticated requests ──
//   if (data.token) {
//     localStorage.setItem("token", data.token);
//   }
//   if (data.hospital?.hospital_id) {
//     localStorage.setItem("hospital_id", data.hospital.hospital_id);
//   }

//   return data;
// };


import { API_URL } from "../env-vars";

const HOSPITALS_API = `${API_URL}/hospitals`;

export const hospitalLogin = async (hospitalId, apiKey) => {
  const response = await fetch(`${HOSPITALS_API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hospital_id: hospitalId.trim(),
      api_key: apiKey,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message =
      errData.detail || errData.message || response.statusText || "Login failed";
    throw new Error(message);
  }

  const data = await response.json();

  // ── Store token and hospital_id for all subsequent authenticated requests ──
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.hospital?.hospital_id) {
    localStorage.setItem("hospital_id", data.hospital.hospital_id);
  }

  return data;
};

// POST /hospitals/create
// Required: name, api_key
// Optional: address, city, state, contact_number, email
// Response: { token, hospital: { hospital_id, name, ... } }
export const hospitalSignup = async ({
  name,
  api_key,
  email,
  address,
  city,
  state,
  contact_number,
}) => {
  // Only send optional fields if they have a value
  const payload = {
    name: name.trim(),
    api_key: api_key.trim(),
    ...(email?.trim()          && { email: email.trim() }),
    ...(address?.trim()        && { address: address.trim() }),
    ...(city?.trim()           && { city: city.trim() }),
    ...(state?.trim()          && { state: state.trim() }),
    ...(contact_number?.trim() && { contact_number: contact_number.trim() }),
  };

  const response = await fetch(`${HOSPITALS_API}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message =
      errData.detail || errData.message || response.statusText || "Signup failed";
    throw new Error(message);
  }

  const data = await response.json();

  // ── Store token and hospital_id for all subsequent authenticated requests ──
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.hospital?.hospital_id) {
    localStorage.setItem("hospital_id", data.hospital.hospital_id);
  }

  return data;
};