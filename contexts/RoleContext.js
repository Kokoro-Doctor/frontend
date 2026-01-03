// import React, { createContext, useContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const RoleContext = createContext();

// export const RoleProvider = ({ children }) => {
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     AsyncStorage.getItem("userRole").then((storedRole) => {
//       setRole(storedRole);
//       setLoading(false);
//     });

//     //fetchRole();
//   }, []);
//   return (
//     <RoleContext.Provider value={{ role, setRole, loading }}>
//       {children}
//     </RoleContext.Provider>
//   );
// };

// export const useRole = () => useContext(RoleContext);



import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

const RoleContext = createContext();

// Helper to get role from storage (with web fallback)
const getRoleFromStorage = async () => {
  try {
    // Try AsyncStorage first
    const stored = await AsyncStorage.getItem("userRole");
    if (stored) return stored;
    
    // On web, also check localStorage directly as fallback
    // (AsyncStorage uses localStorage on web, but there might be timing issues)
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      try {
        const localRole = window.localStorage.getItem("userRole");
        if (localRole) {
          // Sync back to AsyncStorage
          await AsyncStorage.setItem("userRole", localRole);
          return localRole;
        }
      } catch (localError) {
        console.log("Error reading from localStorage:", localError);
      }
    }
    
    return null;
  } catch (err) {
    console.log("Error loading stored role:", err);
    return null;
  }
};

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore role on app startup
  useEffect(() => {
    const loadRole = async () => {
      try {
        const stored = await getRoleFromStorage();
        if (stored) {
          setRole(stored);
          console.log("✅ RoleContext: Role restored:", stored);
        }
      } catch (err) {
        console.log("Error loading stored role:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRole();
  }, []);

  // Save role whenever changed
  const updateRole = async (newRole) => {
    try {
      setRole(newRole);
      if (newRole) {
        await AsyncStorage.setItem("userRole", newRole);
      } else {
        await AsyncStorage.removeItem("userRole");
      }
    } catch (err) {
      console.log("Error saving role:", err);
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole: updateRole, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

