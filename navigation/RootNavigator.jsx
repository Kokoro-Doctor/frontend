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

import { useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { Suspense } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { RegistrationProvider } from "../contexts/RegistrationContext";
import { useRole } from "../contexts/RoleContext";
import AuthGate from "../navigation/AuthGate";
// ✅ Direct imports (always needed instantly)
import MobileChatbot from "../components/PatientScreenComponents/ChatbotComponents/MobileChatbot";
import DoctorsSignUp from "../screens/DoctorScreens/DoctorRegistration/DoctorsSignUp";
import LandingPage from "../screens/PatientScreens/LandingPage";
import WelcomePage from "../screens/PatientScreens/WelcomePage";
import DoctorResultShow from "../screens/PatientScreens/Doctors/DoctorResultShow";

// ✅ Conditionally import heavy screens (works on web + native)
let DoctorPatientLandingPage;
let DoctorAppNavigation;
let AppNavigation;

if (Platform.OS === "web") {
  // Use lazy loading only for web (Webpack supports import())
  DoctorPatientLandingPage = React.lazy(() =>
    import(
      "../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage"
    )
  );
  DoctorAppNavigation = React.lazy(() => import("./DoctorsNavigation"));
  AppNavigation = React.lazy(() => import("./PatientNavigation"));
} else {
  // Use static requires for native (Metro bundler limitation)
  DoctorPatientLandingPage =
    require("../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage").default;
  DoctorAppNavigation = require("./DoctorsNavigation").default;
  AppNavigation = require("./PatientNavigation").default;
}

const Stack = createNativeStackNavigator();

const Loader = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

// export const linking = {
//   prefixes: ["/", "https://kokoro.doctor"],
//   config: {
//     screens: {
//       LandingPage: "Home",
//       DoctorPatientLandingPage: "Role",
//       DoctorAppNavigation: { path: "doctor" },
//       PatientAppNavigation: { path: "patient" },
//     },
//   },
// };


export const linking = {
  prefixes: [
    "https://kokoro.doctor",
    "http://localhost:8081",
  ],
  config: {
    screens: {
      LandingPage: "Home",
      DoctorPatientLandingPage: "Role",

      DoctorAppNavigation: {
        path: "doctor",
        screens: {
          Home: "Home",
          Profile: "Profile",
        },
      },

      PatientAppNavigation: {
        path: "patient",
        screens: {
          Home: "Home",

          // ✅ ADDED
          UserDashboard: "UserDashboard",
          Medilocker:"Medilocker",


          Doctors: {
            path: "Doctors",
            screens: {
              DoctorsList: "",
              DoctorsInfoWithSubscription:
                "DoctorsInfoWithSubscription",
              DoctorResultShow: "DoctorResultShow",
            },
          },
        },
      },
    },
  },
};




// Wrapper component for LandingPage that handles auth redirects
const LandingPageWithAuth = ({ navigation, route }) => {
  const { user, role: authRole, isLoading: authLoading } = useAuth();
  const { role: roleContextRole, loading: roleLoading } = useRole();
  const redirectHandledRef = React.useRef(false);

  // Use role from AuthContext if available, fallback to RoleContext
  const role = authRole || roleContextRole;
  const isLoading = authLoading || roleLoading;

  // Use useEffect to handle immediate redirects when role changes
  React.useEffect(() => {
    // Wait for auth and role to finish loading
    if (isLoading) return;

    // Prevent multiple redirects
    if (redirectHandledRef.current) return;

    // If user is authenticated and has a role, redirect to appropriate dashboard
    if (user && role) {
      redirectHandledRef.current = true;

      if (role === "doctor") {
        // Redirect doctor to doctor dashboard immediately
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "DoctorAppNavigation",
              params: { screen: "DoctorPortalLandingPage" },
            },
          ],
        });
      } else if (role === "user") {
        // Redirect user to patient navigation (UserDashboard)
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "PatientAppNavigation",
              params: { screen: "UserDashboard" },
            },
          ],
        });
      }
    }
  }, [user, role, isLoading, navigation]);

  // Also use useFocusEffect for when screen comes into focus (handles page refresh)
  useFocusEffect(
    React.useCallback(() => {
      // Wait for auth and role to finish loading
      if (isLoading) return;

      // Reset redirect flag when screen comes into focus (page refresh)
      redirectHandledRef.current = false;

      // If user is authenticated and has a role, redirect to appropriate dashboard
      if (user && role) {
        redirectHandledRef.current = true;

        if (role === "doctor") {
          // Redirect doctor to doctor dashboard
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "DoctorAppNavigation",
                params: { screen: "DoctorPortalLandingPage" },
              },
            ],
          });
        } else if (role === "user") {
          // Redirect user to patient navigation
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "PatientAppNavigation",
                params: { screen: "UserDashboard" },
              },
            ],
          });
        }
      }
    }, [user, role, isLoading, navigation])
  );

  return <LandingPage navigation={navigation} route={route} />;
};

const RootNavigation = () => {
  const { role: roleContextRole, loading: roleLoading } = useRole();
  const { user, role: authRole, isLoading: authLoading } = useAuth();

  // Determine the actual role (prefer AuthContext role, fallback to RoleContext)
  const role = authRole || roleContextRole;
  const isLoading = authLoading || roleLoading;

  // Check current URL pathname to preserve route on refresh (web only)
  const getRouteFromUrl = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      // If already on doctor route, preserve it
      if (!user && pathname.startsWith("/doctor")) {
        return "DoctorAppNavigation";
      }
      // If already on patient route, preserve it
      if (!user && pathname.startsWith("/patient")) {
        return "PatientAppNavigation";
      }
      // If on Home, check role
      if (pathname === "/" || pathname === "/Home") {
        return null; // Will be determined by role
      }
    }
    return null;
  };

  // Check current URL pathname to preserve route on refresh (web only)
  const urlRoute = getRouteFromUrl();

  // Determine initial route based on authentication and role
  const getInitialRouteName = () => {
    // First, check if we're already on a specific route (preserves deep links on refresh)
    if (urlRoute) {
      console.log("🔍 Using route from URL:", urlRoute);
      return urlRoute;
    }

    // Log for debugging (especially useful in production)
    console.log("🔍 Determining initial route:", {
      hasUser: !!user,
      authRole,
      roleContextRole,
      finalRole: role,
      isLoading,
      pathname:
        Platform.OS === "web" && typeof window !== "undefined"
          ? window.location.pathname
          : "N/A",
    });

    // If we have a role (even without user, for role-based routing on refresh)
    if (role) {
      if (role === "doctor") {
        return "DoctorAppNavigation";
      }
      if (role === "user") {
        // For users, redirect to patient navigation
        return "PatientAppNavigation";
      }
    }

    // If user exists but no role, still try to route based on user data
    // This handles edge cases where role might not be set but user exists
    if (user) {
      // Check if user has doctor_id (doctor) or user_id (user)
      if (user.doctor_id) {
        return "DoctorAppNavigation";
      }
      if (user.user_id) {
        return "PatientAppNavigation";
      }
    }

    // Not authenticated, go to landing page
    return "LandingPage";
  };

  const initialRouteName = getInitialRouteName();

  // Show loader while role or auth is loading
  // BUT: if we're on a deep link URL, don't show loader (let navigation handle it)
  if (isLoading && !urlRoute) return <Loader />;

  return (
    <RegistrationProvider>
      <Suspense fallback={<Loader />}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          // Only set initialRouteName if not on a deep link URL
          // This allows React Navigation's deep linking to handle URL-based routing
          initialRouteName={urlRoute || initialRouteName}
        >
          {/* Always loaded instantly */}
          <Stack.Screen name="WelcomePage" component={WelcomePage}></Stack.Screen>
          <Stack.Screen name="DoctorResultShow" component={DoctorResultShow}></Stack.Screen>
          <Stack.Screen name="LandingPage" component={LandingPageWithAuth} />
          <Stack.Screen name="AuthGate" component={AuthGate} />

          {/* Conditionally lazy/static screens */}
          <Stack.Screen
            name="DoctorPatientLandingPage"
            component={DoctorPatientLandingPage}
          />
          <Stack.Screen
            name="DoctorAppNavigation"
            component={DoctorAppNavigation}
          />
          <Stack.Screen name="PatientAppNavigation" component={AppNavigation} />
          <Stack.Screen name="MobileChatbot" component={MobileChatbot} />
          <Stack.Screen name="DoctorsSignUp" component={DoctorsSignUp} />
        </Stack.Navigator>
      </Suspense>
    </RegistrationProvider>
  );
};

export default RootNavigation;
