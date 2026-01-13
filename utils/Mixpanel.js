import { Platform } from "react-native";

let mixpanel = {
  track: () => {},
  identify: () => {},
  people: { set: () => {} },
  get_distinct_id: () => "unknown",
};

if (Platform.OS === "web") {
  const MIXPANEL_TOKEN = "719f231a1ce17d0f0352731d53609ac3";
  const MIXPANEL_API_URL = "https://api.mixpanel.com";

  // Generate a persistent distinct_id
  const getDistinctId = () => {
    let distinctId = localStorage.getItem("mixpanel_distinct_id");
    if (!distinctId) {
      distinctId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("mixpanel_distinct_id", distinctId);
    }
    return distinctId;
  };

  const distinctId = getDistinctId();

  // Direct API implementation
  mixpanel = {
    track: (eventName, properties = {}) => {
      console.log(`📊 Tracking event: ${eventName}`, properties);

      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          token: MIXPANEL_TOKEN,
          distinct_id: distinctId,
          time: Date.now(),
          $insert_id: `${Date.now()}-${Math.random()}`,
        },
      };

      // Encode data as base64
      const encodedData = btoa(JSON.stringify(eventData));

      // Method 1: Try XHR
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${MIXPANEL_API_URL}/track`);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log(`✅ Event "${eventName}" sent successfully:`, xhr.responseText);
        } else {
          console.error(`❌ Failed to send event "${eventName}":`, xhr.status, xhr.responseText);
        }
      };
      
      xhr.onerror = () => {
        console.error(`❌ Network error sending event "${eventName}"`);
        
        // Fallback: Try using img beacon
        console.log("🔄 Trying img beacon fallback...");
        const img = new Image();
        img.src = `${MIXPANEL_API_URL}/track?data=${encodeURIComponent(encodedData)}&ip=1`;
        img.onload = () => console.log(`✅ Event "${eventName}" sent via img beacon`);
        img.onerror = () => console.error(`❌ Img beacon failed for "${eventName}"`);
      };
      
      xhr.send(`data=${encodedData}&verbose=1`);
    },

    identify: (userId) => {
      console.log(`🆔 Identifying user: ${userId}`);
      localStorage.setItem("mixpanel_distinct_id", userId);
    },

    get_distinct_id: () => distinctId,

    people: {
      set: (properties) => {
        console.log("👤 Setting user properties:", properties);
        
        const eventData = {
          $token: MIXPANEL_TOKEN,
          $distinct_id: distinctId,
          $set: properties,
        };

        const encodedData = btoa(JSON.stringify(eventData));
        
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${MIXPANEL_API_URL}/engage`);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(`data=${encodedData}&verbose=1`);
      },
    },
  };

  console.log("✅ Custom Mixpanel implementation loaded");
  console.log("📍 Distinct ID:", distinctId);
}

export default mixpanel;