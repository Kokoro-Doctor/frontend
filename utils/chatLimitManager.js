import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSessionId } from './sessionManager';

const CHAT_LIMIT = 4;

/**
 * Get the storage key for a specific session's chat count
 * @param {string} sessionId - The session ID
 * @returns {string} The storage key
 */
function getSessionChatCountKey(sessionId) {
  return `session_chat_count_${sessionId}`;
}

/**
 * Get the current chat count for a specific session
 * @param {string} sessionId - The session ID (optional, will fetch if not provided)
 * @returns {Promise<number>} The current chat count for the session
 */
export async function getChatCount(sessionId = null) {
  try {
    // If no sessionId provided, get it (for anonymous users)
    if (!sessionId) {
      sessionId = await getSessionId();
      if (!sessionId) return 0; // No session means no count
    }
    
    const key = getSessionChatCountKey(sessionId);
    const count = await AsyncStorage.getItem(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting chat count:', error);
    return 0;
  }
}

/**
 * Increment the chat count for a specific session
 * @param {string} sessionId - The session ID (optional, will fetch if not provided)
 * @returns {Promise<number>} The new chat count after incrementing
 */
export async function incrementChatCount(sessionId = null) {
  try {
    // If no sessionId provided, get it (for anonymous users)
    if (!sessionId) {
      sessionId = await getSessionId();
      if (!sessionId) {
        console.warn('Cannot increment chat count: No session ID available');
        return 0;
      }
    }
    
    const currentCount = await getChatCount(sessionId);
    const newCount = currentCount + 1;
    const key = getSessionChatCountKey(sessionId);
    await AsyncStorage.setItem(key, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing chat count:', error);
    return 0;
  }
}

/**
 * Reset the chat count for a specific session or all sessions
 * @param {string} sessionId - The session ID to reset (optional, resets all if not provided)
 */
export async function resetChatCount(sessionId = null) {
  try {
    if (sessionId) {
      // Reset specific session
      const key = getSessionChatCountKey(sessionId);
      await AsyncStorage.removeItem(key);
    } else {
      // Reset all session chat counts (cleanup on sign-in)
      // Get all keys and remove session-related ones
      const allKeys = await AsyncStorage.getAllKeys();
      const sessionCountKeys = allKeys.filter(key => key.startsWith('session_chat_count_'));
      await Promise.all(sessionCountKeys.map(key => AsyncStorage.removeItem(key)));
    }
  } catch (error) {
    console.error('Error resetting chat count:', error);
  }
}

/**
 * Check if the chat limit has been reached for a specific session
 * @param {string} sessionId - The session ID (optional, will fetch if not provided)
 * @returns {Promise<boolean>} True if limit reached, false otherwise
 */
export async function isChatLimitReached(sessionId = null) {
  try {
    const count = await getChatCount(sessionId);
    return count >= CHAT_LIMIT;
  } catch (error) {
    console.error('Error checking chat limit:', error);
    return false;
  }
}

/**
 * Get the chat limit constant
 * @returns {number} The chat limit
 */
export function getChatLimit() {
  return CHAT_LIMIT;
}

/**
 * Clean up chat count for a specific session (when session expires or is cleared)
 * @param {string} sessionId - The session ID to clean up
 */
export async function cleanupSessionChatCount(sessionId) {
  try {
    if (sessionId) {
      const key = getSessionChatCountKey(sessionId);
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error cleaning up session chat count:', error);
  }
}

