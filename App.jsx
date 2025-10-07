import { NavigationContainer } from "@react-navigation/native";
import { Platform } from "react-native";
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

  // useEffect(() => {
  //   // configure Google Sign-In once
  //   initGoogleSignin();
  // }, []);

  useEffect(() => {
    // ✅ Initialize Google Sign-in (existing)
    initGoogleSignin();

    // ✅ Inject Google Tag Manager for web
    if (Platform.OS === "web") {
      // Inject <script> tag into <head>
      const script = document.createElement("script");
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-NKV9V4WN');
      `;
      document.head.appendChild(script);

      // Inject <noscript> tag into <body>
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NKV9V4WN"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.insertBefore(noscript, document.body.firstChild);
    }
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
