import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../env-vars';


export async function getSessionId() {
  try {
    // If logged-in user, we won't use session
    const user = await AsyncStorage.getItem("user");
    if (user) return null;

    // Check if session already exists
    let sessionId = await AsyncStorage.getItem("session_id");
    if (sessionId) return sessionId;

    // Otherwise create one
    const res = await axios.post(`${API_URL}/auth/session/initiate`);
    sessionId = res.data.session_id;
    if (!sessionId) {
      console.warn('API did not return a session ID. Check backend implementation.');
      return null;
    }

    // Save locally
    await AsyncStorage.setItem("session_id", sessionId);
    return sessionId;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}
