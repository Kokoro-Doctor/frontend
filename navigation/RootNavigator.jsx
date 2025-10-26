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

import React, { Suspense, lazy } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useRole } from "../contexts/RoleContext";
import { RegistrationProvider } from "../contexts/RegistrationContext";

// ✅ Import LandingPage directly (since it's first and must be instant)
import LandingPage from "../screens/PatientScreens/LandingPage";

// ✅ Lazy load all other heavy screens
const DoctorPatientLandingPage = lazy(() =>
  import("../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage")
);
const DoctorAppNavigation = lazy(() => import("./DoctorsNavigation"));
const AppNavigation = lazy(() => import("./PatientNavigation"));
const Login = lazy(() => import("../screens/PatientScreens/Auth/Login"));
const MobileChatbot = lazy(() =>
  import("../components/PatientScreenComponents/ChatbotComponents/MobileChatbot")
);

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
          {/* ✅ Direct import → loads instantly */}
          <Stack.Screen name="LandingPage" component={LandingPage} />

          {/* ⚡ Lazy-loaded screens */}
          <Stack.Screen
            name="DoctorPatientLandingPage"
            component={DoctorPatientLandingPage}
          />
          <Stack.Screen
            name="DoctorAppNavigation"
            component={DoctorAppNavigation}
          />
          <Stack.Screen name="PatientAppNavigation" component={AppNavigation} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MobileChatbot" component={MobileChatbot} />
        </Stack.Navigator>
      </Suspense>
    </RegistrationProvider>
  );
};

export default RootNavigation;

