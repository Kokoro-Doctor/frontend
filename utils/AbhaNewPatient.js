// ── Step 1: Request OTP on Aadhaar-linked mobile ──────────────
import { API_URL} from "../env-vars";
export const requestAadhaarOtp = async (aadhaar) => {
  const response = await fetch(`${API_URL}/abha/create/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aadhaar }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "OTP request failed");
  }

  // Returns: { txn_id, message }
  return data;
};

// ── Step 2: Verify OTP and create ABHA ───────────────────────
// kokoroJwt optional hai — pass karo agar user logged in ho
export const verifyOtpAndCreateAbha = async ({ txnId, otp, mobile, kokoroJwt }) => {
  const headers = { "Content-Type": "application/json" };
  if (kokoroJwt) {
    headers["Authorization"] = `Bearer ${kokoroJwt}`;
  }

  const response = await fetch(`${API_URL}/abha/create/verify-otp`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      txn_id: txnId,
      otp,
      mobile,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "OTP verification failed");
  }

  // Returns: { message, txn_id, is_new, abha_profile, tokens, abha_saved }
  return data;
};