import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../env-vars';

/**
 * Get or create a session ID for anonymous users
 * @returns {Promise<string|null>} The session ID or null if user is logged in
 */
export async function getSessionId() {
  try {
    // If logged-in user, we won't use session
    const user = await AsyncStorage.getItem("@user");
    if (user) return null;

    // Check if session already exists
    let sessionId = await AsyncStorage.getItem("session_id");
    if (sessionId) return sessionId;

    // Otherwise create one
    try {
      const res = await axios.post(`${API_URL}/auth/session/initiate`, {}, {
        timeout: 5000, // 5 second timeout
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });
      
      // Only proceed if we got a successful response
      if (res.status >= 200 && res.status < 300 && res.data?.session_id) {
        sessionId = res.data.session_id;
        // Save locally
        await AsyncStorage.setItem("session_id", sessionId);
        return sessionId;
      } else {
        console.warn('API did not return a session ID. Status:', res.status);
        return null;
      }
    } catch (apiError) {
      // Silently fail - don't log 502 errors as they're server issues
      if (apiError.response?.status === 502 || apiError.code === 'ECONNABORTED') {
        console.warn('Session API unavailable, continuing without session');
        return null;
      }
      // Re-throw other errors to be caught by outer catch
      throw apiError;
    }
  } catch (error) {
    // Only log non-network errors
    if (error.response?.status !== 502 && error.code !== 'ECONNABORTED') {
      console.error("Error getting session:", error);
    }
    return null;
  }
}

/**
 * Clear the session and associated data (called on sign-in or logout)
 */
export async function clearSession() {
  try {
    const sessionId = await AsyncStorage.getItem("session_id");
    
    // Clean up session-specific chat count before clearing session
    if (sessionId) {
      try {
        const key = `session_chat_count_${sessionId}`;
        await AsyncStorage.removeItem(key);
      } catch (cleanupError) {
        console.error('Error cleaning up session chat count:', cleanupError);
      }
    }
    
    // Remove session ID
    await AsyncStorage.removeItem("session_id");
  } catch (error) {
    console.error("Error clearing session:", error);
  }
}

/**
 * Check if a session exists
 * @returns {Promise<boolean>} True if session exists, false otherwise
 */
export async function hasSession() {
  try {
    const sessionId = await AsyncStorage.getItem("session_id");
    return !!sessionId;
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}
