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