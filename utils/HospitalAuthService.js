// import { API_URL } from "../env-vars";

// const HOSPITALS_API = `${API_URL}/hospitals`;

// /**
//  * Hospital login - validates API key and hospital_id against backend.
//  * @param {string} hospitalId - Hospital ID (e.g. HOSP_001)
//  * @param {string} apiKey - Hospital API key
//  * @returns {Promise<{hospital: object}>}
//  */
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

//   return response.json();
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