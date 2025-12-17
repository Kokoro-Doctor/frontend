// import { API_URL } from "../env-vars";

// export const payment_api = async (amount) => {
//   try {
//     const response = await fetch(`${API_URL}/process-payment`, {
//       method: "POST",
//       mode: "cors",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ amount }),
//     });

//     if (!response.ok) {
//       console.log("Payment api error:", result);
//       throw new Error(result.message || "Payment Failed");
//     }

//     const data = await response.json();
//     return data.payment_link;
//   } catch (error) {
//     console.error("Payment API Error:", error.message);
//     throw error;
//   }
// };

import { API_URL } from "../env-vars";

export const payment_api = async (amount) => {
  try {
    const response = await fetch(`${API_URL}/process-payment`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const result = await response.json(); // ✅ FIX

    if (!response.ok) {
      console.log("Payment api error:", result);
      throw new Error(result.message || "Payment Failed");
    }

    return result.payment_link;
  } catch (error) {
    console.error("Payment API Error:", error.message);
    throw error;
  }
};

