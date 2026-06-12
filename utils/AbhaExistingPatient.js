import { API_URL } from "../env-vars";

// Existing ABHA → Request OTP
export const requestAbhaLoginOtp = async (abhaNumber) => {
  const response = await fetch(`${API_URL}/abha/login/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      abha_number: abhaNumber,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "OTP request failed");
  }

  return data;
};

// Existing ABHA → Verify OTP
export const verifyAbhaLoginOtp = async ({ txnId, otp }) => {
  const response = await fetch(`${API_URL}/abha/login/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txn_id: txnId,
      otp,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "OTP verification failed");
  }

  return data;
};

// Fetch live ABHA profile using ABHA user token
// Fetch live ABHA profile using ABHA number
export const fetchAbhaProfile = async (abhaToken, abhaNumber) => {
  const response = await fetch(
    `${API_URL}/abha/profile?abha_number=${abhaNumber}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-ABHA-Token": `Bearer ${abhaToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch ABHA profile");
  }

  return data;
};

// Mobile-based ABHA login → Request OTP
export const requestAbhaMobileLoginOtp = async (mobile) => {
  const response = await fetch(`${API_URL}/abha/login/mobile/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile }),
  });
  const data = await response.json();
  console.log("Data:", data);

  if (!response.ok) {
    if (response.status === 404) {
      const err = new Error(
        "This mobile number is not registered/verified with ABDM. No ABHA account is linked to it."
      );
      err.code = "NOT_LINKED";
      throw err;
    }
    if (response.status === 400) {
      throw new Error("Invalid mobile number. Please enter a valid 10-digit number.");
    }
    if (response.status === 500) {
      throw new Error("ABDM service error. Please try again in a moment.");
    }
    throw new Error(data?.message || "OTP request failed");
  }
  return data;
};
// Mobile-based ABHA login → Verify OTP (returns linked accounts + t_token)
export const verifyAbhaMobileLoginOtp = async ({ txnId, otp }) => {
  const response = await fetch(`${API_URL}/abha/login/mobile/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txn_id: txnId, otp }),
  });
  const data = await response.json();
  console.log("verifyData:", data)
  if (!response.ok) throw new Error(data?.message || "OTP verification failed");
  return data;
};

// Mobile-based ABHA login → Select account & get session token
export const verifyAbhaMobileUser = async ({ txnId, abhaNumber, tToken }) => {
  const response = await fetch(`${API_URL}/abha/login/mobile/verify-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txn_id: txnId,
      abha_number: abhaNumber,
      t_token: tToken,
    }),
  });
  const data = await response.json();
  console.log("verifyUserData:", data);
  if (!response.ok)
    throw new Error(data?.message || "Login verification failed");
  return data;
};
