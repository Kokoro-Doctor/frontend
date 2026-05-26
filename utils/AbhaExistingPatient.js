
// ── Step 1: Request OTP for existing ABHA number ─────────────
import { API_URL} from "../env-vars";
export const requestAbhaLoginOtp = async (abhaNumber) => {
  const response = await fetch(`${API_URL}/abha/login/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abha_number: abhaNumber }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "OTP request failed");
  }

  // Returns: { txn_id, message }
  return data;
};

// ── Step 2: Verify OTP and fetch ABHA profile ─────────────────
export const verifyAbhaLoginOtp = async ({ txnId, otp, kokoroJwt }) => {
  const headers = { "Content-Type": "application/json" };
  if (kokoroJwt) {
    headers["Authorization"] = `Bearer ${kokoroJwt}`;
  }

  const response = await fetch(`${API_URL}/abha/login/verify-otp`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      txn_id: txnId,
      otp,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "OTP verification failed");
  }

  // Returns: { message, tokens, abha_profile, abha_saved }
  return data;
};