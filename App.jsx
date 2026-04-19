import { NavigationContainer } from "@react-navigation/native";
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import ChatBotOverlay from "./components/PatientScreenComponents/ChatbotComponents/ChatbotOverlay";
import AuthPopupOverlay from "./components/AuthPopupOverlay";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatbotProvider } from "./contexts/ChatbotContext";
import { LoginModalProvider } from "./contexts/LoginModalContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import RootNavigation, { linking } from "./navigation/RootNavigator";
// ✅ import your init
import { initGoogleSignin } from "./utils/AuthService";
import { AuthPopupProvider } from "./contexts/AuthPopupContext";
import mixpanel from "./utils/Mixpanel";

const App = () => {
  const navigationRef = useRef(null);

  const routeNameRef = useRef(null); // 👈 IMPORTANT
  const [appType, setAppType] = useState("patient");
  const [currentRoute, setCurrentRoute] = useState(null);

  const onStateChange = () => {
    const routeName = navigationRef.current?.getCurrentRoute()?.name;

    if (routeName && routeNameRef.current !== routeName) {
      routeNameRef.current = routeName;
      setCurrentRoute(routeName);

      const isDoctorRoute = routeName.startsWith("Doctor");
      setAppType(isDoctorRoute ? "doctor" : "patient");

      mixpanel.track("Screen Viewed", { screen: routeName });

      console.log("📊 Screen tracked:", routeName);
      console.log("🧠 appType:", isDoctorRoute ? "doctor" : "patient");
    }
  };

  useEffect(() => {
    initGoogleSignin();

    // Test Mixpanel immediately
    console.log("🔥 Firing test Mixpanel event...");

    mixpanel.track("Web App Loaded", {
      url: Platform.OS === "web" ? window.location.pathname : "mobile",
      timestamp: new Date().toISOString(),
    });

    // Force flush immediately
    if (mixpanel.flush) {
      mixpanel.flush();
    }

    // Additional test after delay
    setTimeout(() => {
      console.log("🔥 Firing delayed test event...");
      mixpanel.track("Test Event After Delay");
    }, 2000);
  }, []);
  return (
    <AuthProvider>
      <ThemeProvider>
        <ChatbotProvider>
          <RoleProvider>
            <LoginModalProvider>
              <NavigationContainer
                linking={linking}
                ref={navigationRef}
                onStateChange={onStateChange}
              >
                <AuthPopupProvider
                  appType={appType}
                  currentRoute={currentRoute}
                >
                  <RootNavigation />
                  <AuthPopupOverlay navigationRef={navigationRef} appType={appType} />
                  <ChatBotOverlay navigationRef={navigationRef} />
                </AuthPopupProvider>
              </NavigationContainer>
            </LoginModalProvider>
          </RoleProvider>
        </ChatbotProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
