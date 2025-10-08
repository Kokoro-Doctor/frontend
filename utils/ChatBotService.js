import { API_URL } from "../env-vars";
import { getSessionId } from "./sessionManager";

export const askBot = async (userId, messageToSend, selectedLanguage) => {
  try {
    let bodyPayload;

    // 🔹 If user is logged in — use their email
    if (userId) {
      bodyPayload = {
        user_id: userId,
        message: messageToSend,
        language: selectedLanguage,
      };
    } else {
      // 🔹 If anonymous user — use session_id
      const sessionId = await getSessionId();

      // LOG ADDED HERE to show the retrieved sessionId
      console.log('Attempting to use sessionId for anonymous user:', sessionId);
      
      if (!sessionId) {
        console.warn('getSessionId() returned no session ID. Check implementation.');
      }
      bodyPayload = {
        session_id: sessionId,
        message: messageToSend,
        language: selectedLanguage,
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
