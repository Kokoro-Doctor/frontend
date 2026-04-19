import React, { useEffect, useState } from "react";
import { useAuthPopup } from "../contexts/AuthPopupContext";
import PatientAuthModal from "./Auth/PatientAuthModal";
import DoctorAuthModal from "./Auth/DoctorAuthModal";

const AuthPopupOverlay = ({ navigationRef, appType }) => {
  const {
    showPatientAuth,
    setShowPatientAuth,
    showDoctorAuth,
    setShowDoctorAuth,
    onDoctorRegister,
  } = useAuthPopup();
  const [currentRoute, setCurrentRoute] = useState(null);

  // Update route state when navigation changes
  useEffect(() => {
    const updateRoute = () => {
      const routeName = navigationRef.current?.getCurrentRoute()?.name || null;
      setCurrentRoute(routeName);
    };

    const interval = setInterval(updateRoute, 500); // Check every 500ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, [navigationRef]);

  // Screens where auth popups should NOT appear
  const hiddenScreens = [
    "Login",
    "Signup",
    "MobileChatbot",
    "HospitalUploadPage",
    "HospitalInsuranceClaim",
    "PostOpCare",
    "PostOpCarePrescription",
    "ManualDataIntegration",
    "AIIntegrationScreen",
    "DataIntegrations",
    "DataIntegrationValidation",
    "DataIntegrationComplete",
    "HospitalInsuranceDownload",
    "SignatureScreen",
    "HospitalDashboard",
    "WelcomeHospital",
    "HospitalAppNavigation",
    "HospitalPortalLandingPage",
  ];

  // Don't show auth popups if:
  // 1. Current route is in hidden screens list
  // 2. Route is not available yet
  if (!currentRoute || hiddenScreens.includes(currentRoute)) {
    return null;
  }

  return (
    <>
      {/* Patient Auth Modal */}
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

      {/* Doctor Auth Modal */}
      {showDoctorAuth && appType === "doctor" && (
        <DoctorAuthModal
          visible
          initialMode="signup"
          onRequestClose={() => setShowDoctorAuth(false)}
        />
      )}
    </>
  );
};

export default AuthPopupOverlay;
