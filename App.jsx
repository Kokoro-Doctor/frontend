import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import ChatBotOverlay from "./components/PatientScreenComponents/ChatbotComponents/ChatbotOverlay";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatbotProvider } from "./contexts/ChatbotContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import RootNavigation, { linking } from "./navigation/RootNavigator";
// ✅ import your init
import { initGoogleSignin } from "./utils/AuthService";

const App = () => {
  const navigationRef = useRef(null);

  useEffect(() => {
    // configure Google Sign-In once
    initGoogleSignin();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ChatbotProvider>
          <RoleProvider>
            <NavigationContainer linking={linking} ref={navigationRef}>
              <RootNavigation />
              <ChatBotOverlay navigationRef={navigationRef} />
            </NavigationContainer>
          </RoleProvider>
        </ChatbotProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
