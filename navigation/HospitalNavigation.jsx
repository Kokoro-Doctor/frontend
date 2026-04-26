import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";
import { useTheme } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../contexts/Themes";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";
import HospitalPortalLandingPage from "../screens/HospitalScreens/HospitalPortalLandingPage";
import HospitalInsuranceClaim from "../screens/HospitalScreens/HospitalInsuranceClaim";
import HospitalInsuranceDownload from "../screens/HospitalScreens/HospitalInsuranceDownload";
import PostOpCare from "../screens/HospitalScreens/PostOpCare";
import PostOpCarePrescription from "../screens/HospitalScreens/PostOpCarePrescription";
import DataIntegrations from "../screens/HospitalScreens/DataIntegrations";
import ManualDataIntegration from "../screens/HospitalScreens/ManualDataIntegration";
import AIIntegrationScreen from "../screens/HospitalScreens/AIIntegrationScreen";
import DataIntegrationValidation from "../screens/HospitalScreens/DataIntegrationValidation";
import DataIntegrationComplete from "../screens/HospitalScreens/DataIntegrationComplete";
import SignatureScreen from "../screens/HospitalScreens/SignatureScreen";
import HospitalDashboard from "../screens/HospitalScreens/HospitalDashboard";
import PARequests from "../screens/HospitalScreens/PARequests";
import HospitalPatientManagement from "../screens/HospitalScreens/HospitalPatientManagement";

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
        <Stack.Screen
          name="HospitalInsuranceDownload"
          component={HospitalInsuranceDownload}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PostOpCare"
          component={PostOpCare}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PostOpCarePrescription"
          component={PostOpCarePrescription}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DataIntegrations"
          component={DataIntegrations}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManualDataIntegration"
          component={ManualDataIntegration}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AIIntegrationScreen"
          component={AIIntegrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DataIntegrationValidation"
          component={DataIntegrationValidation}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DataIntegrationComplete"
          component={DataIntegrationComplete}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HospitalDashboard"
          component={HospitalDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignatureScreen"
          component={SignatureScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PARequests"
          component={PARequests}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HospitalPatientManagement"
          component={HospitalPatientManagement}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </HeaderButtonsProvider>
  );
};

export default HospitalAppNavigation;
