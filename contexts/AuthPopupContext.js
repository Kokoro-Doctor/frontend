import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../contexts/AuthContext";
import PatientAuthModal from "../components/Auth/PatientAuthModal";
import DoctorAuthModal from "../components/Auth/DoctorAuthModal";

const AuthPopupContext = createContext(null);

// export const AuthPopupProvider = ({ children }) => {
//   const { user, isLoading } = useAuth();
//   const isAuthenticated = !!user;

//   const [showPatientAuth, setShowPatientAuth] = useState(false);
//   const [showDoctorAuth, setShowDoctorAuth] = useState(false);

//   const timerRef = useRef(null);
//   const shownOnceRef = useRef(false);

//   // Function to clear the auto-popup timer
//   const clearAutoPopupTimer = () => {
//     if (timerRef.current) {
//       clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }
//     // Mark as shown so it doesn't auto-popup again
//     shownOnceRef.current = true;
//   };

//   // Function to manually open patient auth modal (called from Login/Signup button)
//   const openPatientAuth = () => {
//     clearAutoPopupTimer(); // Cancel auto-popup
//     setShowPatientAuth(true);
//   };

//   // Function to manually open doctor auth modal (called from Login/Signup button)
//   const openDoctorAuth = () => {
//     clearAutoPopupTimer(); // Cancel auto-popup
//     setShowDoctorAuth(true);
//   };

//   useEffect(() => {
//     if (isLoading) return;

//     // Already logged in OR popup already shown → do nothing
//     if (isAuthenticated || shownOnceRef.current) return;

//     // Set auto-popup timer
//     timerRef.current = setTimeout(() => {
//       setShowPatientAuth(true);
//       shownOnceRef.current = true;
//     }, 10000); // 10 seconds

//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, [isAuthenticated, isLoading]);

//   // Watch for when modals are opened - if opened, cancel auto-popup
//   useEffect(() => {
//     if (showPatientAuth || showDoctorAuth) {
//       clearAutoPopupTimer();
//     }
//   }, [showPatientAuth, showDoctorAuth]);

//   return (
//     <AuthPopupContext.Provider
//       value={{
//         showPatientAuth,
//         setShowPatientAuth,
//         showDoctorAuth,
//         setShowDoctorAuth,
//         openPatientAuth, // New: manual open function
//         openDoctorAuth,  // New: manual open function
//         clearAutoPopupTimer, // Expose in case needed elsewhere
//       }}
//     >
//       {children}

//       {/* GLOBAL MODALS */}
//       {showPatientAuth && (
//         <PatientAuthModal
//           visible={showPatientAuth}
//           initialMode="signup"
//           onRequestClose={() => setShowPatientAuth(false)}
//           onDoctorRegister={() => {
//             setShowPatientAuth(false);
//             setShowDoctorAuth(true);
//           }}
//         />
//       )}

//       {showDoctorAuth && (
//         <DoctorAuthModal
//           visible={showDoctorAuth}
//           onRequestClose={() => setShowDoctorAuth(false)}
//           initialMode="signup"
//         />
//       )}
//     </AuthPopupContext.Provider>
//   );
// };

export const AuthPopupProvider = ({ children, appType, currentRoute }) => {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  const [showPatientAuth, setShowPatientAuth] = useState(false);
  const [showDoctorAuth, setShowDoctorAuth] = useState(false);

  const timerRef = useRef(null);
  const shownOnceRef = useRef(false);

  // 🔹 Reset popup when entering app flow
  useEffect(() => {
    if (
      (currentRoute === "PatientAppNavigation" && appType === "patient") ||
      (currentRoute === "DoctorAppNavigation" && appType === "doctor")
    ) {
      shownOnceRef.current = false;
    }
  }, [currentRoute, appType]);

  const clearAutoPopupTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    shownOnceRef.current = true;
  };

  const openPatientAuth = () => {
    clearAutoPopupTimer();
    setShowPatientAuth(true);
  };

  const openDoctorAuth = () => {
    clearAutoPopupTimer();
    setShowDoctorAuth(true);
  };

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated || shownOnceRef.current) return;

    timerRef.current = setTimeout(() => {
      if (appType === "doctor") {
        setShowDoctorAuth(true);
      } else {
        setShowPatientAuth(true);
      }
      shownOnceRef.current = true;
    }, 30000); // 30s auto-popup

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, isLoading, appType, currentRoute]);

  useEffect(() => {
    if (showPatientAuth || showDoctorAuth) {
      clearAutoPopupTimer();
    }
  }, [showPatientAuth, showDoctorAuth]);

  return (
    <AuthPopupContext.Provider
      value={{
        showPatientAuth,
        setShowPatientAuth,
        showDoctorAuth,
        setShowDoctorAuth,
        openPatientAuth,
        openDoctorAuth,
      }}
    >
      {children}

      {showPatientAuth && appType === "patient" && (
        <PatientAuthModal
          visible
          initialMode="signup"
          onRequestClose={() => setShowPatientAuth(false)}
          onDoctorRegister={() => {
            setShowPatientAuth(false);
            setShowDoctorAuth(true);
          }}
        />
      )}

      {showDoctorAuth && appType === "doctor" && (
        <DoctorAuthModal
          visible
          initialMode="signup"
          onRequestClose={() => setShowDoctorAuth(false)}
        />
      )}
    </AuthPopupContext.Provider>
  );
};

export const useAuthPopup = () => useContext(AuthPopupContext);
