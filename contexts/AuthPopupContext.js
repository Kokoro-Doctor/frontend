import React, { createContext, useContext, useEffect, useRef, useState } from "react";
//import { Platform } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import PatientAuthModal from "../components/Auth/PatientAuthModal";
import DoctorSignupModal from "../components/Auth/DoctorSignupModal";

const AuthPopupContext = createContext(null);

export const AuthPopupProvider = ({ children }) => {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  const [showPatientAuth, setShowPatientAuth] = useState(false);
  const [showDoctorAuth, setShowDoctorAuth] = useState(false);

  const timerRef = useRef(null);
  const shownOnceRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    // Already logged in OR popup already shown → do nothing
    if (isAuthenticated || shownOnceRef.current) return;

    timerRef.current = setTimeout(() => {
      setShowPatientAuth(true);
      shownOnceRef.current = true;
    }, 10000); // 10 seconds

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, isLoading]);

  return (
    <AuthPopupContext.Provider
      value={{
        showPatientAuth,
        setShowPatientAuth,
        showDoctorAuth,
        setShowDoctorAuth,
      }}
    >
      {children}

      {/* GLOBAL MODALS */}
      {showPatientAuth && (
        <PatientAuthModal
          visible={showPatientAuth}
          initialMode="signup"
          onRequestClose={() => setShowPatientAuth(false)}
          onDoctorRegister={() => {
            setShowPatientAuth(false);
            setShowDoctorAuth(true);
          }}
        />
      )}

      {showDoctorAuth && (
        <DoctorSignupModal
          visible={showDoctorAuth}
          onRequestClose={() => setShowDoctorAuth(false)}
          onDoctorRegister={() => {
            setShowDoctorAuth(false);
            setShowPatientAuth(true);
          }}
        />
      )}
    </AuthPopupContext.Provider>
  );
};

export const useAuthPopup = () => useContext(AuthPopupContext);
