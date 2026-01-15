// import { Platform } from "react-native";

// let mixpanel = {
//   track: () => {},
//   identify: () => {},
//   people: { set: () => {} },
//   get_distinct_id: () => "unknown",
// };

// if (Platform.OS === "web") {
//   const MIXPANEL_TOKEN = "719f231a1ce17d0f0352731d53609ac3";
//   const MIXPANEL_API_URL = "https://api.mixpanel.com";

//   // Generate a persistent distinct_id
//   const getDistinctId = () => {
//     let distinctId = localStorage.getItem("mixpanel_distinct_id");
//     if (!distinctId) {
//       distinctId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//       localStorage.setItem("mixpanel_distinct_id", distinctId);
//     }
//     return distinctId;
//   };

//   const distinctId = getDistinctId();

//   // Direct API implementation
//   mixpanel = {
//     track: (eventName, properties = {}) => {
//       console.log(`📊 Tracking event: ${eventName}`, properties);

//       const eventData = {
//         event: eventName,
//         properties: {
//           ...properties,
//           token: MIXPANEL_TOKEN,
//           distinct_id: distinctId,
//           time: Date.now(),
//           $insert_id: `${Date.now()}-${Math.random()}`,
//         },
//       };

//       // Encode data as base64
//       const encodedData = btoa(JSON.stringify(eventData));

//       // Method 1: Try XHR
//       const xhr = new XMLHttpRequest();
//       xhr.open("POST", `${MIXPANEL_API_URL}/track`);
//       xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

//       xhr.onload = () => {
//         if (xhr.status === 200) {
//           console.log(`✅ Event "${eventName}" sent successfully:`, xhr.responseText);
//         } else {
//           console.error(`❌ Failed to send event "${eventName}":`, xhr.status, xhr.responseText);
//         }
//       };

//       xhr.onerror = () => {
//         console.error(`❌ Network error sending event "${eventName}"`);

//         // Fallback: Try using img beacon
//         console.log("🔄 Trying img beacon fallback...");
//         const img = new Image();
//         img.src = `${MIXPANEL_API_URL}/track?data=${encodeURIComponent(encodedData)}&ip=1`;
//         img.onload = () => console.log(`✅ Event "${eventName}" sent via img beacon`);
//         img.onerror = () => console.error(`❌ Img beacon failed for "${eventName}"`);
//       };

//       xhr.send(`data=${encodedData}&verbose=1`);
//     },

//     identify: (userId) => {
//       console.log(`🆔 Identifying user: ${userId}`);
//       localStorage.setItem("mixpanel_distinct_id", userId);
//     },

//     get_distinct_id: () => distinctId,

//     people: {
//       set: (properties) => {
//         console.log("👤 Setting user properties:", properties);

//         const eventData = {
//           $token: MIXPANEL_TOKEN,
//           $distinct_id: distinctId,
//           $set: properties,
//         };

//         const encodedData = btoa(JSON.stringify(eventData));

//         const xhr = new XMLHttpRequest();
//         xhr.open("POST", `${MIXPANEL_API_URL}/engage`);
//         xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//         xhr.send(`data=${encodedData}&verbose=1`);
//       },
//     },
//   };

//   console.log("✅ Custom Mixpanel implementation loaded");
//   console.log("📍 Distinct ID:", distinctId);
// }

// export default mixpanel;

// import { Platform } from "react-native";

// let mixpanel = {
//   track: () => {},
//   identify: () => {},
//   people: { set: () => {} },
//   get_distinct_id: () => "unknown",
//   reset: () => {}, // Add reset method
// };

// if (Platform.OS === "web") {
//   const MIXPANEL_TOKEN = "719f231a1ce17d0f0352731d53609ac3";
//   const MIXPANEL_API_URL = "https://api.mixpanel.com";

//   // 🔥 Helper function to get system information
//   const getSystemInfo = () => {
//     const userAgent = navigator.userAgent;
//     let os = "Unknown";
//     let browser = "Unknown";
//     let browserVersion = "";

//     // Detect OS
//     if (userAgent.indexOf("Win") !== -1) os = "Windows";
//     else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
//     else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
//     else if (userAgent.indexOf("Android") !== -1) os = "Android";
//     else if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

//     // Detect Browser
//     if (userAgent.indexOf("Edg") !== -1) {
//       browser = "Edge";
//       browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || "";
//     } else if (userAgent.indexOf("Chrome") !== -1) {
//       browser = "Chrome";
//       browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || "";
//     } else if (userAgent.indexOf("Safari") !== -1) {
//       browser = "Safari";
//       browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || "";
//     } else if (userAgent.indexOf("Firefox") !== -1) {
//       browser = "Firefox";
//       browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || "";
//     }

//     return { os, browser, browserVersion };
//   };

//   // 🔥 Generate or get distinct_id (defaults to anonymous, updated on login)
//   const getDistinctId = () => {
//     let distinctId = localStorage.getItem("mixpanel_distinct_id");
//     if (!distinctId) {
//       // Generate anonymous ID for users who haven't logged in
//       distinctId = `anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//       localStorage.setItem("mixpanel_distinct_id", distinctId);
//     }
//     return distinctId;
//   };

//   let currentDistinctId = getDistinctId();

//   // Direct API implementation
//   mixpanel = {
//     track: (eventName, properties = {}) => {
//       console.log(`📊 Tracking event: ${eventName}`, properties);

//       // 🔥 Get fresh distinct_id (in case it was updated)
//       currentDistinctId = localStorage.getItem("mixpanel_distinct_id") || currentDistinctId;

//       // 🔥 Get system information
//       const { os, browser, browserVersion } = getSystemInfo();

//       const eventData = {
//         event: eventName,
//         properties: {
//           ...properties,
//           token: MIXPANEL_TOKEN,
//           distinct_id: currentDistinctId,
//           time: Date.now(),
//           $insert_id: `${Date.now()}-${Math.random()}`,

//           // 🔥 System properties for OS and Browser detection
//           $os: os,
//           $browser: browser,
//           $browser_version: browserVersion,
//           $current_url: window.location.href,
//           $screen_height: window.screen.height,
//           $screen_width: window.screen.width,
//           $referrer: document.referrer,
//           $lib: "web",
//           $lib_version: "custom-1.0",

//           // 🔥 User agent - Mixpanel uses this to extract additional info
//           $user_agent: navigator.userAgent,
//           mp_lib: "web",

//           // 🔥 CRITICAL: Tell Mixpanel to capture IP for geolocation
//           ip: 1,
//         },
//       };

//       // Encode data as base64
//       const encodedData = btoa(JSON.stringify(eventData));

//       // Method 1: Try XHR
//       const xhr = new XMLHttpRequest();
//       xhr.open("POST", `${MIXPANEL_API_URL}/track`);
//       xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

//       xhr.onload = () => {
//         if (xhr.status === 200) {
//           console.log(`✅ Event "${eventName}" sent successfully:`, xhr.responseText);
//         } else {
//           console.error(`❌ Failed to send event "${eventName}":`, xhr.status, xhr.responseText);
//         }
//       };

//       xhr.onerror = () => {
//         console.error(`❌ Network error sending event "${eventName}"`);

//         // Fallback: Try using img beacon
//         console.log("🔄 Trying img beacon fallback...");
//         const img = new Image();
//         img.src = `${MIXPANEL_API_URL}/track?data=${encodeURIComponent(encodedData)}&ip=1`;
//         img.onload = () => console.log(`✅ Event "${eventName}" sent via img beacon`);
//         img.onerror = () => console.error(`❌ Img beacon failed for "${eventName}"`);
//       };

//       // 🔥 CRITICAL: Add ip=1 parameter to capture IP for geolocation
//       xhr.send(`data=${encodedData}&ip=1&verbose=1`);
//     },

//     // 🔥 Identify user with their actual user_id from database
//     identify: (userId, userProperties = {}) => {
//       console.log(`🆔 Identifying user: ${userId}`);

//       // Update distinct_id to user's actual ID
//       currentDistinctId = userId;
//       localStorage.setItem("mixpanel_distinct_id", userId);

//       // 🔥 Set user properties
//       const { os, browser } = getSystemInfo();
//       this.people.set({
//         ...userProperties,
//         $name: userProperties.name || userId,
//         $email: userProperties.email,
//         $phone: userProperties.phone,
//         $last_seen: new Date().toISOString(),
//         $os: os,
//         $browser: browser,
//       });

//       // Track identification event
//       this.track("User Identified", {
//         user_id: userId,
//         ...userProperties,
//       });
//     },

//     get_distinct_id: () => {
//       currentDistinctId = localStorage.getItem("mixpanel_distinct_id") || currentDistinctId;
//       return currentDistinctId;
//     },

//     // 🔥 Reset Mixpanel on logout - generates new anonymous ID
//     reset: () => {
//       console.log("🔄 Resetting Mixpanel...");

//       // Track logout event before resetting
//       mixpanel.track("User Logged Out", {
//         previous_user_id: currentDistinctId,
//       });

//       // Generate new anonymous ID
//       const newAnonymousId = `anonymous-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//       localStorage.setItem("mixpanel_distinct_id", newAnonymousId);
//       currentDistinctId = newAnonymousId;

//       console.log("✅ Mixpanel reset complete. New anonymous ID:", newAnonymousId);
//     },

//     people: {
//       set: (properties) => {
//         console.log("👤 Setting user properties:", properties);

//         // Get current distinct_id
//         const distinctId = localStorage.getItem("mixpanel_distinct_id") || currentDistinctId;

//         const eventData = {
//           $token: MIXPANEL_TOKEN,
//           $distinct_id: distinctId,
//           $set: properties,
//           $ip: 1, // 🔥 Capture IP for user profile geolocation
//         };

//         const encodedData = btoa(JSON.stringify(eventData));

//         const xhr = new XMLHttpRequest();
//         xhr.open("POST", `${MIXPANEL_API_URL}/engage`);
//         xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

//         xhr.onload = () => {
//           if (xhr.status === 200) {
//             console.log("✅ User properties set successfully");
//           } else {
//             console.error("❌ Failed to set user properties:", xhr.status);
//           }
//         };

//         // 🔥 Add ip=1 parameter here too
//         xhr.send(`data=${encodedData}&ip=1&verbose=1`);
//       },
//     },
//   };

//   console.log("✅ Custom Mixpanel implementation loaded");
//   console.log("📍 Initial Distinct ID:", currentDistinctId);
//   console.log("🖥️ System Info:", getSystemInfo());
// }

// export default mixpanel;

import { Platform } from "react-native";

let mixpanel = {
  track: () => {},
  identify: () => {},
  people: { set: () => {} },
  get_distinct_id: () => "unknown",
  reset: () => {},
};

if (Platform.OS === "web") {
  const MIXPANEL_TOKEN = "719f231a1ce17d0f0352731d53609ac3";
  const MIXPANEL_API_URL = "https://api.mixpanel.com";

  // 🔥 Helper function to get system information
  const getSystemInfo = () => {
    const userAgent = navigator.userAgent;
    let os = "Unknown";
    let browser = "Unknown";
    let browserVersion = "";

    // Detect OS
    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
    else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
    else if (userAgent.indexOf("Android") !== -1) os = "Android";
    else if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

    // Detect Browser
    if (userAgent.indexOf("Edg") !== -1) {
      browser = "Edge";
      browserVersion = userAgent.match(/Edg\/(\d+)/)?.[1] || "";
    } else if (userAgent.indexOf("Chrome") !== -1) {
      browser = "Chrome";
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || "";
    } else if (userAgent.indexOf("Safari") !== -1) {
      browser = "Safari";
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || "";
    } else if (userAgent.indexOf("Firefox") !== -1) {
      browser = "Firefox";
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || "";
    }

    return { os, browser, browserVersion };
  };

  // 🔥 Generate or get distinct_id (defaults to anonymous, updated on login)
  const getDistinctId = () => {
    let distinctId = localStorage.getItem("mixpanel_distinct_id");
    if (!distinctId) {
      // Generate anonymous ID for users who haven't logged in
      distinctId = `anonymous-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("mixpanel_distinct_id", distinctId);
    }
    return distinctId;
  };

  let currentDistinctId = getDistinctId();

  // 🔥 Track function
  const trackEvent = (eventName, properties = {}) => {
    console.log(`📊 Tracking event: ${eventName}`, properties);

    // Get fresh distinct_id (in case it was updated)
    currentDistinctId =
      localStorage.getItem("mixpanel_distinct_id") || currentDistinctId;

    // Get system information
    const { os, browser, browserVersion } = getSystemInfo();

    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        token: MIXPANEL_TOKEN,
        distinct_id: currentDistinctId,
        time: Date.now(),
        $insert_id: `${Date.now()}-${Math.random()}`,

        // System properties for OS and Browser detection
        $os: os,
        $browser: browser,
        $browser_version: browserVersion,
        $current_url: window.location.href,
        $screen_height: window.screen.height,
        $screen_width: window.screen.width,
        $referrer: document.referrer,
        $lib: "web",
        $lib_version: "custom-1.0",

        // User agent - Mixpanel uses this to extract additional info
        $user_agent: navigator.userAgent,
        mp_lib: "web",

        // CRITICAL: Tell Mixpanel to capture IP for geolocation
        ip: 1,
      },
    };

    // Encode data as base64
    const encodedData = btoa(JSON.stringify(eventData));

    // Try XHR
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${MIXPANEL_API_URL}/track`);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(
          `✅ Event "${eventName}" sent successfully:`,
          xhr.responseText
        );
      } else {
        console.error(
          `❌ Failed to send event "${eventName}":`,
          xhr.status,
          xhr.responseText
        );
      }
    };

    xhr.onerror = () => {
      console.error(`❌ Network error sending event "${eventName}"`);

      // Fallback: Try using img beacon
      console.log("🔄 Trying img beacon fallback...");
      const img = new Image();
      img.src = `${MIXPANEL_API_URL}/track?data=${encodeURIComponent(
        encodedData
      )}&ip=1`;
      img.onload = () =>
        console.log(`✅ Event "${eventName}" sent via img beacon`);
      img.onerror = () =>
        console.error(`❌ Img beacon failed for "${eventName}"`);
    };

    // CRITICAL: Add ip=1 parameter to capture IP for geolocation
    xhr.send(`data=${encodedData}&ip=1&verbose=1`);
  };

  // 🔥 People.set function
  const setPeopleProperties = (properties) => {
    console.log("👤 Setting user properties:", properties);

    // Get current distinct_id
    const distinctId =
      localStorage.getItem("mixpanel_distinct_id") || currentDistinctId;

    const eventData = {
      $token: MIXPANEL_TOKEN,
      $distinct_id: distinctId,
      $set: properties,
      $ip: 1, // Capture IP for user profile geolocation
    };

    const encodedData = btoa(JSON.stringify(eventData));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${MIXPANEL_API_URL}/engage`);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log("✅ User properties set successfully");
      } else {
        console.error("❌ Failed to set user properties:", xhr.status);
      }
    };

    xhr.onerror = () => {
      console.error("❌ Network error setting user properties");
    };

    xhr.send(`data=${encodedData}&ip=1&verbose=1`);
  };

  // 🔥 Identify function
  const identifyUser = (userId, userProperties = {}) => {
    console.log(`🆔 Identifying user: ${userId}`);

    // Update distinct_id to user's actual ID
    currentDistinctId = userId;
    localStorage.setItem("mixpanel_distinct_id", userId);

    // Set user properties
    const { os, browser } = getSystemInfo();
    setPeopleProperties({
      ...userProperties,
      $name: userProperties.name || userId,
      $email: userProperties.email,
      $phone: userProperties.phone,
      $last_seen: new Date().toISOString(),
      $os: os,
      $browser: browser,
    });

    // Track identification event
    trackEvent("User Identified", {
      user_id: userId,
      ...userProperties,
    });
  };

  // 🔥 Get distinct ID function
  const getDistinctIdFunc = () => {
    currentDistinctId =
      localStorage.getItem("mixpanel_distinct_id") || currentDistinctId;
    return currentDistinctId;
  };

  // 🔥 Reset function
  const resetMixpanel = () => {
    console.log("🔄 Resetting Mixpanel...");

    // Track logout event before resetting
    try {
      trackEvent("User Logged Out", {
        previous_user_id: currentDistinctId,
      });
    } catch (error) {
      console.error("Error tracking logout event:", error);
    }

    // Generate new anonymous ID
    const newAnonymousId = `anonymous-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("mixpanel_distinct_id", newAnonymousId);
    currentDistinctId = newAnonymousId;

    console.log(
      "✅ Mixpanel reset complete. New anonymous ID:",
      newAnonymousId
    );
  };

  // 🔥 Create the mixpanel object with all methods defined upfront
  mixpanel = {
    track: trackEvent,
    identify: identifyUser,
    get_distinct_id: getDistinctIdFunc,
    reset: resetMixpanel,
    people: {
      set: setPeopleProperties,
    },
  };

  console.log("✅ Custom Mixpanel implementation loaded");
  console.log("📍 Initial Distinct ID:", currentDistinctId);
  console.log("🖥️ System Info:", getSystemInfo());
}

export default mixpanel;
