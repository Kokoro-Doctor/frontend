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



import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  // Restore role on app startup
  useEffect(() => {
    const loadRole = async () => {
      try {
        const stored = await AsyncStorage.getItem("userRole");
        if (stored) setRole(stored);
      } catch (err) {
        console.log("Error loading stored role:", err);
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
    <RoleContext.Provider value={{ role, setRole: updateRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

