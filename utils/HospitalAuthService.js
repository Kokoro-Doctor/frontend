import { API_URL } from "../env-vars";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HOSPITALS_API = `${API_URL}/hospitals`;

// POST /hospitals/login
// Body: { identifier: "<email_or_mobile>", password: "<password>" }
// export const hospitalLogin = async (identifier, password) => {
//   const response = await fetch(`${HOSPITALS_API}/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ identifier: identifier.trim(), password }),
//   });

//   if (!response.ok) {
//     const errData = await response.json().catch(() => ({}));
//     throw new Error(
//       errData.detail ||
//         errData.message ||
//         response.statusText ||
//         "Login failed",
//     );
//   }

//   const data = await response.json();

//   // // Eagerly cache token + hospital_id so any code that reads localStorage
//   // // directly (e.g. ManualDataIntegration) has them immediately.
//   // if (data.token) localStorage.setItem("token", data.token);
//   // if (data.hospital?.hospital_id)
//   //   localStorage.setItem("hospital_id", data.hospital.hospital_id);
//   if (data.token) {
//     await AsyncStorage.setItem("token", data.token);
//   }

//   if (data.hospital?.hospital_id) {
//     await AsyncStorage.setItem(
//       "hospital_id",
//       String(data.hospital.hospital_id),
//     );
//   }

//   return data;
// };
export const hospitalLogin = async (identifier, password) => {
  const response = await fetch(`${HOSPITALS_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: identifier.trim(),
      password,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(
      errData.detail ||
      errData.message ||
      response.statusText ||
      "Login failed"
    );
  }

  const data = await response.json();

  if (data.token) {
    await AsyncStorage.setItem("token", data.token);
  }

  if (data.hospital?.hospital_id) {
    await AsyncStorage.setItem(
      "hospital_id",
      String(data.hospital.hospital_id)
    );
  }

  return data;
};

// POST /hospitals/signup
// Required: name, password, and at least one of email / contact_number
// Optional: address, city, state
// export const hospitalSignup = async ({
//   name,
//   password,
//   email,
//   contact_number,
//   address,
//   city,
//   state,
// }) => {
//   const payload = {
//     name: name.trim(),
//     password: password.trim(),
//     ...(email?.trim() && { email: email.trim() }),
//     ...(contact_number?.trim() && { contact_number: contact_number.trim() }),
//     ...(address?.trim() && { address: address.trim() }),
//     ...(city?.trim() && { city: city.trim() }),
//     ...(state?.trim() && { state: state.trim() }),
//   };

//   const response = await fetch(`${HOSPITALS_API}/signup`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     const errData = await response.json().catch(() => ({}));
//     throw new Error(
//       errData.detail ||
//         errData.message ||
//         response.statusText ||
//         "Signup failed",
//     );
//   }

//   const data = await response.json();

//   // Signup now returns a JWT so the hospital is authenticated immediately.
//   // Cache it eagerly so any code that reads localStorage directly has it right away.
//   if (data.token) localStorage.setItem("token", data.token);
//   if (data.hospital?.hospital_id)
//     localStorage.setItem("hospital_id", data.hospital.hospital_id);

//   return data;
// };
export const hospitalSignup = async ({
  name,
  password,
  email,
  contact_number,
  address,
  city,
  state,
}) => {
  const payload = {
    name: name.trim(),
    password: password.trim(),
    ...(email?.trim() && { email: email.trim() }),
    ...(contact_number?.trim() && {
      contact_number: contact_number.trim(),
    }),
    ...(address?.trim() && { address: address.trim() }),
    ...(city?.trim() && { city: city.trim() }),
    ...(state?.trim() && { state: state.trim() }),
  };

  const response = await fetch(`${HOSPITALS_API}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));

    throw new Error(
      errData.detail ||
        errData.message ||
        response.statusText ||
        "Signup failed"
    );
  }

  const data = await response.json();

  // Store token and hospital_id
  if (data.token) {
    await AsyncStorage.setItem("token", data.token);
  }

  if (data.hospital?.hospital_id) {
    await AsyncStorage.setItem(
      "hospital_id",
      String(data.hospital.hospital_id)
    );
  }

  return data;
};

