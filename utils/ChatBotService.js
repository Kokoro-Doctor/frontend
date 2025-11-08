import { API_URL } from "../env-vars";
import { getSessionId } from "./sessionManager";

const buildChatPayload = async (userId, messageToSend, selectedLanguage) => {
  if (userId) {
    return {
      user_id: userId,
      message: messageToSend,
      language: selectedLanguage,
    };
  }

  const sessionId = await getSessionId();
  if (!sessionId) {
    console.warn("getSessionId() returned no session ID. Check implementation.");
  }

  return {
    session_id: sessionId,
    message: messageToSend,
    language: selectedLanguage,
  };
};

export const askBot = async (userId, messageToSend, selectedLanguage) => {
  try {
    const bodyPayload = await buildChatPayload(
      userId,
      messageToSend,
      selectedLanguage
    );

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

export const askBotStream = async (userId, messageToSend, selectedLanguage) => {
  const bodyPayload = await buildChatPayload(
    userId,
    messageToSend,
    selectedLanguage
  );

  const controller = new AbortController();

  const response = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyPayload),
    signal: controller.signal,
  });

  if (!response.ok) {
    controller.abort();
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader?.();
  if (!reader) {
    controller.abort();
    throw new Error("Streaming reader not supported in this environment.");
  }

  return { reader, controller };
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
