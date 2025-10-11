// utils/trackEvent.js
import { Platform } from "react-native";

export const TrackEvent = (eventName, params = {}) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
      console.log("📊 GTM Event Pushed:", eventName, params);
    } else {
      console.warn("⚠️ dataLayer not available — GTM not loaded yet");
    }
  } else {
    // You can add native analytics later if needed
    console.log(`Skipping GTM tracking on native: ${eventName}`, params);
  }
};
