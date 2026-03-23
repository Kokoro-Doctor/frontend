// import { useFocusEffect } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import React, { Suspense } from "react";
// import { ActivityIndicator, Platform, View } from "react-native";
// import { useAuth } from "../contexts/AuthContext";
// import { RegistrationProvider } from "../contexts/RegistrationContext";
// import { useRole } from "../contexts/RoleContext";
// import AuthGate from "../navigation/AuthGate";

// // ✅ Direct imports
// import MobileChatbot from "../components/PatientScreenComponents/ChatbotComponents/MobileChatbot";
// import DoctorsSignUp from "../screens/DoctorScreens/DoctorRegistration/DoctorsSignUp";
// import LandingPage from "../screens/PatientScreens/LandingPage";
// import WelcomePage from "../screens/PatientScreens/WelcomePage";
// import DoctorResultShow from "../screens/PatientScreens/Doctors/DoctorResultShow";
// import DoctorPortalLandingPage from "../screens/DoctorScreens/DoctorPortalLandingPage";
// import NewMedicineLandingPage from "../screens/NewMedicineLandingPage";
// import HospitalUploadPage from "../screens/HospitalUploadPage";
// import AbhaLandingScreen from "../screens/Abha";

// // Lazy-loaded navigators
// let DoctorAppNavigation;
// let AppNavigation;

// if (Platform.OS === "web") {
//   DoctorAppNavigation = React.lazy(() => import("./DoctorsNavigation"));
//   AppNavigation = React.lazy(() => import("./PatientNavigation"));
// } else {
//   DoctorAppNavigation = require("./DoctorsNavigation").default;
//   AppNavigation = require("./PatientNavigation").default;
// }

// const Stack = createNativeStackNavigator();

// const Loader = () => (
//   <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//     <ActivityIndicator size="large" color="#007AFF" />
//   </View>
// );

// export const linking = {
//   prefixes: ["https://kokoro.doctor", "http://localhost:8081"],
//   config: {
//     screens: {
//       HospitalUploadPage: "hospital-upload",
//       NewMedicineLandingPage: "NewMedicinelLandingPage",
//       Abha: "Abha",
//       WelcomePage: "WelcomePage",
//       LandingPage: "Home",
//       DoctorAppNavigation: {
//         path: "doctor",
//         screens: {
//           DoctorPortalLandingPage: "DoctorPortalLandingPage",
//         },
//       },
//       PatientAppNavigation: {
//         path: "patient",
//         screens: {
//           WelcomePage: "WelcomePage",
//           Home: "Home",
//           UserDashboard: "UserDashboard",
//           Medilocker: "Medilocker",
//           Doctors: {
//             path: "Doctors",
//             screens: {
//               DoctorsList: "",
//               DoctorsInfoWithSubscription: "DoctorsInfoWithSubscription",
//               DoctorResultShow: "DoctorResultShow",
//             },
//           },
//         },
//       },
//     },
//   },
// };

// const LandingPageWithAuth = ({ navigation, route }) => {
//   const { user, role: authRole, isLoading: authLoading } = useAuth();
//   const { role: roleContextRole, loading: roleLoading } = useRole();
//   const redirectHandledRef = React.useRef(false);
//   const role = authRole || roleContextRole;
//   const isLoading = authLoading || roleLoading;

//   React.useEffect(() => {
//     if (isLoading) return;
//     if (redirectHandledRef.current) return;

//     if (user && role) {
//       redirectHandledRef.current = true;
//       if (role === "doctor") {
//         navigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: "DoctorAppNavigation",
//               params: { screen: "DoctorPortalLandingPage" },
//             },
//           ],
//         });
//       } else if (role === "user") {
//         navigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: "PatientAppNavigation",
//               params: { screen: "UserDashboard" },
//             },
//           ],
//         });
//       }
//     }
//   }, [user, role, isLoading, navigation]);

//   useFocusEffect(
//     React.useCallback(() => {
//       if (isLoading) return;
//       redirectHandledRef.current = false;

//       if (user && role) {
//         redirectHandledRef.current = true;
//         if (role === "doctor") {
//           navigation.reset({
//             index: 0,
//             routes: [
//               {
//                 name: "DoctorAppNavigation",
//                 params: { screen: "DoctorPortalLandingPage" },
//               },
//             ],
//           });
//         } else if (role === "user") {
//           navigation.reset({
//             index: 0,
//             routes: [
//               {
//                 name: "PatientAppNavigation",
//                 params: { screen: "UserDashboard" },
//               },
//             ],
//           });
//         }
//       }
//     }, [user, role, isLoading, navigation]),
//   );

//   return <LandingPage navigation={navigation} route={route} />;
// };

// const RootNavigation = () => {
//   const { role: roleContextRole, loading: roleLoading } = useRole();
//   const { user, role: authRole, isLoading: authLoading } = useAuth();
//   const role = authRole || roleContextRole;
//   const isLoading = authLoading || roleLoading;

//   const getRouteFromUrl = () => {
//     if (Platform.OS === "web" && typeof window !== "undefined") {
//       const pathname = window.location.pathname;
//       if (!user && pathname.startsWith("/doctor")) return "DoctorAppNavigation";
//       if (!user && pathname.startsWith("/patient"))
//         return "PatientAppNavigation";
//       if (pathname === "/" || pathname === "/Home") return null;
//     }
//     return null;
//   };

//   const urlRoute = getRouteFromUrl();

//   const getInitialRouteName = () => {
//     if (urlRoute) return urlRoute;
//     if (role) {
//       if (role === "doctor") return "DoctorAppNavigation";
//       if (role === "user") return "PatientAppNavigation";
//     }
//     if (user) {
//       if (user.doctor_id) return "DoctorAppNavigation";
//       if (user.user_id) return "PatientAppNavigation";
//     }
//     return "WelcomePage";
//   };

//   const initialRouteName = getInitialRouteName();
//   if (isLoading && !urlRoute) return <Loader />;

//   return (
//     <RegistrationProvider>
//       <Suspense fallback={<Loader />}>
//         <Stack.Navigator
//           screenOptions={{ headerShown: false }}
//           initialRouteName={urlRoute || initialRouteName}
//         >
//           <Stack.Screen name="WelcomePage" component={WelcomePage} />
//           <Stack.Screen name="DoctorResultShow" component={DoctorResultShow} />
//           <Stack.Screen name="LandingPage" component={LandingPageWithAuth} />
//           <Stack.Screen name="AuthGate" component={AuthGate} />
//           <Stack.Screen
//             name="DoctorAppNavigation"
//             component={DoctorAppNavigation}
//           />
//           <Stack.Screen name="PatientAppNavigation" component={AppNavigation} />
//           <Stack.Screen name="MobileChatbot" component={MobileChatbot} />
//           <Stack.Screen name="DoctorsSignUp" component={DoctorsSignUp} />
//           <Stack.Screen
//             name="DoctorPortalLandingPage"
//             component={DoctorPortalLandingPage}
//           ></Stack.Screen>
//           <Stack.Screen
//             name="NewMedicineLandingPage"
//             component={NewMedicineLandingPage}
//           ></Stack.Screen>
//           <Stack.Screen
//             name="Abha"
//             component={AbhaLandingScreen}
//           ></Stack.Screen>
//           <Stack.Screen
//             name="HospitalUploadPage"
//             component={HospitalUploadPage}
//           />
//         </Stack.Navigator>
//       </Suspense>
//     </RegistrationProvider>
//   );
// };

// export default RootNavigation;




import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { Suspense } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { RegistrationProvider } from "../contexts/RegistrationContext";
import { useRole } from "../contexts/RoleContext";
import AuthGate from "../navigation/AuthGate";

// ✅ Direct imports
import MobileChatbot from "../components/PatientScreenComponents/ChatbotComponents/MobileChatbot";
import DoctorsSignUp from "../screens/DoctorScreens/DoctorRegistration/DoctorsSignUp";
import LandingPage from "../screens/PatientScreens/LandingPage";
import WelcomePage from "../screens/PatientScreens/WelcomePage";
import DoctorResultShow from "../screens/PatientScreens/Doctors/DoctorResultShow";
import DoctorPortalLandingPage from "../screens/DoctorScreens/DoctorPortalLandingPage";
import NewMedicineLandingPage from "../screens/NewMedicineLandingPage";
import HospitalUploadPage from "../screens/HospitalUploadPage";
import AbhaLandingScreen from "../screens/Abha";


// Lazy-loaded navigators
let DoctorAppNavigation;
let AppNavigation;
let HospitalAppNavigation; // ✅ 1. Declare the variable

if (Platform.OS === "web") {
  DoctorAppNavigation = React.lazy(() => import("./DoctorsNavigation"));
  AppNavigation = React.lazy(() => import("./PatientNavigation"));
  HospitalAppNavigation = React.lazy(() => import("./HospitalNavigation")); // ✅ 2. Lazy load on web
} else {
  DoctorAppNavigation = require("./DoctorsNavigation").default;
  AppNavigation = require("./PatientNavigation").default;
  HospitalAppNavigation = require("./HospitalNavigation").default; // ✅ 3. Direct require on native
}

const Stack = createNativeStackNavigator();

const Loader = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

export const linking = {
  prefixes: ["https://kokoro.doctor", "http://localhost:8081"],
  config: {
    screens: {
      HospitalUploadPage: "hospital-upload",
      NewMedicineLandingPage: "NewMedicinelLandingPage",
      Abha: "Abha",
      WelcomePage: "WelcomePage",
      LandingPage: "Home",
      DoctorAppNavigation: {
        path: "doctor",
        screens: {
          DoctorPortalLandingPage: "DoctorPortalLandingPage",
        },
      },
      // ✅ 4. Add hospital deep linking
      HospitalAppNavigation: {
        path: "hospital",
        screens: {
          HospitalPortalLandingPage: "HospitalPortalLandingPage",
        },
      },
      PatientAppNavigation: {
        path: "patient",
        screens: {
          WelcomePage: "WelcomePage",
          Home: "Home",
          UserDashboard: "UserDashboard",
          Medilocker: "Medilocker",
          Doctors: {
            path: "Doctors",
            screens: {
              DoctorsList: "",
              DoctorsInfoWithSubscription: "DoctorsInfoWithSubscription",
              DoctorResultShow: "DoctorResultShow",
            },
          },
        },
      },
    },
  },
};

const LandingPageWithAuth = ({ navigation, route }) => {
  const { user, role: authRole, isLoading: authLoading } = useAuth();
  const { role: roleContextRole, loading: roleLoading } = useRole();
  const redirectHandledRef = React.useRef(false);
  const role = authRole || roleContextRole;
  const isLoading = authLoading || roleLoading;

  React.useEffect(() => {
    if (isLoading) return;
    if (redirectHandledRef.current) return;

    if (user && role) {
      redirectHandledRef.current = true;
      if (role === "doctor") {
        navigation.reset({
          index: 0,
          routes: [{ name: "DoctorAppNavigation", params: { screen: "DoctorPortalLandingPage" } }],
        });
      } else if (role === "user") {
        navigation.reset({
          index: 0,
          routes: [{ name: "PatientAppNavigation", params: { screen: "UserDashboard" } }],
        });
      // ✅ 5. Handle hospital redirect in LandingPageWithAuth
      } else if (role === "hospital") {
        navigation.reset({
          index: 0,
          routes: [{ name: "HospitalAppNavigation", params: { screen: "HospitalPortalLandingPage" } }],
        });
      }
    }
  }, [user, role, isLoading, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      if (isLoading) return;
      redirectHandledRef.current = false;

      if (user && role) {
        redirectHandledRef.current = true;
        if (role === "doctor") {
          navigation.reset({
            index: 0,
            routes: [{ name: "DoctorAppNavigation", params: { screen: "DoctorPortalLandingPage" } }],
          });
        } else if (role === "user") {
          navigation.reset({
            index: 0,
            routes: [{ name: "PatientAppNavigation", params: { screen: "UserDashboard" } }],
          });
        // ✅ 6. Same redirect inside useFocusEffect
        } else if (role === "hospital") {
          navigation.reset({
            index: 0,
            routes: [{ name: "HospitalAppNavigation", params: { screen: "HospitalPortalLandingPage" } }],
          });
        }
      }
    }, [user, role, isLoading, navigation]),
  );

  return <LandingPage navigation={navigation} route={route} />;
};

const RootNavigation = () => {
  const { role: roleContextRole, loading: roleLoading } = useRole();
  const { user, role: authRole, isLoading: authLoading } = useAuth();
  const role = authRole || roleContextRole;
  const isLoading = authLoading || roleLoading;

  const getRouteFromUrl = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (!user && pathname.startsWith("/doctor")) return "DoctorAppNavigation";
      if (!user && pathname.startsWith("/patient")) return "PatientAppNavigation";
      // ✅ 7. Detect /hospital URL path
      if (!user && pathname.startsWith("/hospital")) return "HospitalAppNavigation";
      if (pathname === "/" || pathname === "/Home") return null;
    }
    return null;
  };

  const urlRoute = getRouteFromUrl();

  const getInitialRouteName = () => {
    if (urlRoute) return urlRoute;
    if (role) {
      if (role === "doctor") return "DoctorAppNavigation";
      if (role === "user") return "PatientAppNavigation";
      // ✅ 8. Route hospital role to its navigator on app start
      if (role === "hospital") return "HospitalAppNavigation";
    }
    if (user) {
      if (user.doctor_id) return "DoctorAppNavigation";
      if (user.user_id) return "PatientAppNavigation";
      // ✅ 9. Route by hospital_id field if your auth object has one
      if (user.hospitalId) return "HospitalAppNavigation";
    }
    return "WelcomePage";
  };

  const initialRouteName = getInitialRouteName();
  if (isLoading && !urlRoute) return <Loader />;

  return (
    <RegistrationProvider>
      <Suspense fallback={<Loader />}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={urlRoute || initialRouteName}
        >
          <Stack.Screen name="WelcomePage" component={WelcomePage} />
          <Stack.Screen name="DoctorResultShow" component={DoctorResultShow} />
          <Stack.Screen name="LandingPage" component={LandingPageWithAuth} />
          <Stack.Screen name="AuthGate" component={AuthGate} />
          <Stack.Screen name="DoctorAppNavigation" component={DoctorAppNavigation} />
          <Stack.Screen name="PatientAppNavigation" component={AppNavigation} />
          {/* ✅ 10. Register the Hospital navigator as a screen */}
          <Stack.Screen name="HospitalAppNavigation" component={HospitalAppNavigation} />
          <Stack.Screen name="MobileChatbot" component={MobileChatbot} />
          <Stack.Screen name="DoctorsSignUp" component={DoctorsSignUp} />
          <Stack.Screen name="DoctorPortalLandingPage" component={DoctorPortalLandingPage} />
          <Stack.Screen name="NewMedicineLandingPage" component={NewMedicineLandingPage} />
          <Stack.Screen name="Abha" component={AbhaLandingScreen} />
          <Stack.Screen name="HospitalUploadPage" component={HospitalUploadPage} />
        </Stack.Navigator>
      </Suspense>
    </RegistrationProvider>
  );
};

export default RootNavigation;
