// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import AppNavigation from "./PatientNavigation";
// import DoctorAppNavigation from "./DoctorsNavigation";
// import { useRole } from "../contexts/RoleContext";
// import { RegistrationProvider } from "../contexts/RegistrationContext";
// import { ActivityIndicator, View } from "react-native";
// import LandingPage from "../screens/PatientScreens/LandingPage";
// import DoctorPatientLandingPage from "../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage";
// import Login from "../screens/PatientScreens/Auth/Login";
// import MobileChatbot from "../components/PatientScreenComponents/ChatbotComponents/MobileChatbot";

// const Stack = createNativeStackNavigator();

// export const linking = {
//   prefixes: ["/", "https://kokoro.doctor"],
//   config: {
//     screens: {
//       LandingPage: "Home",
//       DoctorPatientLandingPage: "Role",

//       DoctorAppNavigation: {
//         path: "doctor",
//       },
//       PatientAppNavigation: {
//         path: "patient",
//       },
//     },
//   },
// };

// const RootNavigation = () => {
//   const { role, loading } = useRole();

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <RegistrationProvider>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="LandingPage" component={LandingPage} />
//         <Stack.Screen
//           name="DoctorPatientLandingPage"
//           component={DoctorPatientLandingPage}
//         />
//         <Stack.Screen
//           name="DoctorAppNavigation"
//           component={DoctorAppNavigation}
//         />
//         <Stack.Screen name="PatientAppNavigation" component={AppNavigation} />
//         <Stack.Screen name="Login" component={Login} />
//         <Stack.Screen name="MobileChatbot" component={MobileChatbot} />
//       </Stack.Navigator>
//     </RegistrationProvider>
//   );
// };

// export default RootNavigation;

import React, { Suspense } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Platform } from "react-native";
import { useRole } from "../contexts/RoleContext";
import { RegistrationProvider } from "../contexts/RegistrationContext";

// ✅ Direct imports (always needed instantly)
import LandingPage from "../screens/PatientScreens/LandingPage";
import Login from "../screens/PatientScreens/Auth/Login";
import MobileChatbot from "../components/PatientScreenComponents/ChatbotComponents/MobileChatbot";
import DoctorsSignUp from "../screens/DoctorScreens/DoctorRegistration/DoctorsSignUp";

// ✅ Conditionally import heavy screens (works on web + native)
let DoctorPatientLandingPage;
let DoctorAppNavigation;
let AppNavigation;

if (Platform.OS === "web") {
  // Use lazy loading only for web (Webpack supports import())
  DoctorPatientLandingPage = React.lazy(() =>
    import("../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage")
  );
  DoctorAppNavigation = React.lazy(() => import("./DoctorsNavigation"));
  AppNavigation = React.lazy(() => import("./PatientNavigation"));
} else {
  // Use static requires for native (Metro bundler limitation)
  DoctorPatientLandingPage = require("../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage").default;
  DoctorAppNavigation = require("./DoctorsNavigation").default;
  AppNavigation = require("./PatientNavigation").default;
}

const Stack = createNativeStackNavigator();

const Loader = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

export const linking = {
  prefixes: ["/", "https://kokoro.doctor"],
  config: {
    screens: {
      LandingPage: "Home",
      DoctorPatientLandingPage: "Role",
      DoctorAppNavigation: { path: "doctor" },
      PatientAppNavigation: { path: "patient" },
    },
  },
};

const RootNavigation = () => {
  const { role, loading } = useRole();

  if (loading) return <Loader />;

  return (
    <RegistrationProvider>
      <Suspense fallback={<Loader />}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Always loaded instantly */}
          <Stack.Screen name="LandingPage" component={LandingPage} />

          {/* Conditionally lazy/static screens */}
          <Stack.Screen
            name="DoctorPatientLandingPage"
            component={DoctorPatientLandingPage}
          />
          <Stack.Screen
            name="DoctorAppNavigation"
            component={DoctorAppNavigation}
          />
          <Stack.Screen
            name="PatientAppNavigation"
            component={AppNavigation}
          />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MobileChatbot" component={MobileChatbot} />
          <Stack.Screen name="DoctorsSignUp" component={DoctorsSignUp} />
        </Stack.Navigator>
      </Suspense>
    </RegistrationProvider>
  );
};

export default RootNavigation;
