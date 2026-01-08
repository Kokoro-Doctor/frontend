import { API_URL } from "../env-vars";
import { getSessionId } from "./sessionManager";

/**
 * Get the appropriate user identifier based on role
 * @param {Object} user - User object from AuthContext (can be patient or doctor)
 * @param {string} role - User role ('doctor' or 'user'/'patient')
 * @returns {string|null} The appropriate identifier (doctor_id or user_id)
 */
export const getUserIdentifier = (user, role) => {
  if (!user || !role) return null;
  
  if (role === "doctor") {
    return user.doctor_id || null;
  } else {
    // For patients/users, use user_id only
    return user.user_id || null;
  }
};

/**
 * Send a message to the chatbot
 * @param {Object} user - User object from AuthContext (null for anonymous users)
 * @param {string} role - User role ('doctor', 'user', or null)
 * @param {string} messageToSend - Message text
 * @param {string} selectedLanguage - Language code (e.g., 'en', 'hi')
 */
export const askBot = async (user, role, messageToSend, selectedLanguage) => {
  try {
    let bodyPayload;

    // Normalize role: "doctor" stays "doctor", everything else (including null/undefined) becomes "patient"
    const normalizedRole = role === "doctor" ? "doctor" : "patient";

    // If user is logged in, get the appropriate identifier
    if (user && role) {
      const identifier = getUserIdentifier(user, role);
      if (!identifier) {
        throw new Error("Unable to determine user identifier");
      }
      
      // Build payload with the correct identifier field based on role
      if (role === "doctor") {
        bodyPayload = {
          doctor_id: identifier,
          message: messageToSend,
          language: selectedLanguage,
          role: normalizedRole,
        };
      } else {
        bodyPayload = {
          user_id: identifier,
          message: messageToSend,
          language: selectedLanguage,
          role: normalizedRole,
        };
      }
    } else {
      // If anonymous user — use session_id and default role to "patient"
      const sessionId = await getSessionId();
      
      if (!sessionId) {
        console.warn('getSessionId() returned no session ID. Check implementation.');
      }
      bodyPayload = {
        session_id: sessionId,
        message: messageToSend,
        language: selectedLanguage,
        role: normalizedRole, // Default to "patient" for anonymous users
      };
    }

    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const botReply = await response.json();
    return botReply;
  } catch (error) {
    console.error("Error communicating with Bot:", error);
    throw error;
  }
};

export const getChatHistory = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/chat/history/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const botReply = await response.json();

    return botReply;
  } catch (error) {
    console.error("Error communicating with Bot:", error);
  }
};
