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
import Prescription from "./screens/DoctorScreens/Prescription";
// ✅ import your init
import { initGoogleSignin } from "./utils/AuthService";

const App = () => {
  const navigationRef = useRef(null);

  // useEffect(() => {
  //   // configure Google Sign-In once
  //   initGoogleSignin();
  // }, []);

  useEffect(() => {
    // Initialize Google Sign-in (existing)
    initGoogleSignin();

    if (Platform.OS === "web" && typeof window !== "undefined") {
      // Prevent duplicate GTM loading
      if (window.dataLayer) return;

      // Inject the original GTM snippet dynamically
      const script = document.createElement("script");
      script.innerHTML = `
      (function(w,d,s,l,i){
        w[l]=w[l]||[];
        w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),
        dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;
        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-NKV9V4WN');
    `;
      document.head.appendChild(script);

      // ✅ (Optional) Inject the <noscript> fallback
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NKV9V4WN"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;
      document.body.prepend(noscript);
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ChatbotProvider>
          <RoleProvider>
            <LoginModalProvider>
              <NavigationContainer linking={linking} ref={navigationRef}>
                 {/* <RootNavigation />
                 <ChatBotOverlay navigationRef={navigationRef} /> */}
                 <Prescription/>
              </NavigationContainer>
            </LoginModalProvider>
          </RoleProvider>
        </ChatbotProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
