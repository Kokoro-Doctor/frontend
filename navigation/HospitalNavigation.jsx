import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";
import { useTheme } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../contexts/Themes";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";
import HospitalPortalLandingPage from "../screens/HospitalScreens/HospitalPortalLandingPage";
import HospitalInsuranceClaim from "../screens/HospitalScreens/HospitalInsuranceClaim";

const Stack = createNativeStackNavigator();

const HospitalAppNavigation = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { user, role: authRole, isLoading: authLoading } = useAuth();
  const { role: roleContextRole, loading: roleLoading } = useRole();
  const role = authRole || roleContextRole;
  const isLoading = authLoading || roleLoading;

  // Redirect users away from doctor portal
//   useFocusEffect(
//     React.useCallback(() => {
//       if (isLoading) return;

//       if (user && role === "user") {
//         // User trying to access doctor portal - redirect to patient portal
//         // Get root navigator to navigate to root level screens
//         const rootNav = navigation.getParent();
//         if (rootNav) {
//           rootNav.reset({
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

  return (
    <HeaderButtonsProvider stackType={"native"}>
      <Stack.Navigator
        initialRouteName="HospitalPortalLandingPage"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.container.backgroundColor,
          },
          headerTintColor: theme.text.color,
        }}
      >
        
        <Stack.Screen
          name="HospitalPortalLandingPage"
          component={HospitalPortalLandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HospitalInsuranceClaim"
          component={HospitalInsuranceClaim}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
    </HeaderButtonsProvider>
  );
};

export default HospitalAppNavigation;
