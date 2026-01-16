import { NavigationContainer } from "@react-navigation/native";
import { Platform } from "react-native";
import { useEffect, useRef } from "react";
import ChatBotOverlay from "./components/PatientScreenComponents/ChatbotComponents/ChatbotOverlay";
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

  const onStateChange = () => {
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    // Track only if screen actually changed
    if (currentRouteName && routeNameRef.current !== currentRouteName) {
      routeNameRef.current = currentRouteName;

      mixpanel.track("Screen Viewed", {
        screen: currentRouteName,
      });

      console.log("📊 Screen tracked:", currentRouteName);
    }
  };

  useEffect(() => {
    initGoogleSignin();

    // Test Mixpanel immediately
    console.log("🔥 Firing test Mixpanel event...");

    mixpanel.track("Web App Loaded", {
      url: Platform.OS === 'web' ? window.location.pathname : 'mobile',
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
                <AuthPopupProvider>
                  <RootNavigation />
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
