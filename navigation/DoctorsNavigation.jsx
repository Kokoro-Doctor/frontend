import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";
import { useTheme } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../contexts/Themes";
import { useAuth } from "../contexts/AuthContext";
import { useRole } from "../contexts/RoleContext";
import { useFocusEffect } from "@react-navigation/native";
//import DoctorPatientLandingPage from "../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage";
import DoctorCongrats from "../screens/DoctorScreens/DoctorRegistration/DoctorCongrats";
import DoctorMedicalRegistration from "../screens/DoctorScreens/DoctorRegistration/DoctorMedicalRegistration";
import EstablishmentTiming from "../screens/DoctorScreens/DoctorRegistration/EstablishmentTiming";
import NewDoctorMedicalReg from "../screens/DoctorScreens/DoctorRegistration/NewDoctorMedicalReg";
import ReminderScreen from "../screens/DoctorScreens/ReminderView";
import HistoryScreen from "../screens/DoctorScreens/History";
import AppointmentsView from "../screens/DoctorScreens/AppointmentsView";
import AccountSettings from "../screens/DoctorScreens/Settings/AccountSettings";
import LanguagePreference from "../screens/DoctorScreens/Settings/LanguagePreference";
import MedicalProof from "../screens/DoctorScreens/Settings/MedicalProof";
import NotificationSettings from "../screens/DoctorScreens/Settings/NotificationSettings";
import ProfileSetting from "../screens/DoctorScreens/Settings/ProfileSetting";
import SubscriberFees from "../screens/DoctorScreens/Settings/SubscriberFees";
import ThemeSettings from "../screens/DoctorScreens/Settings/ThemeSettings";
import Reminder from "../screens/DoctorScreens/ReminderNewest";
import LandingPage from "../screens/PatientScreens/LandingPage";
import DoctorsSignUp from "../screens/DoctorScreens/DoctorRegistration/DoctorsSignUp";
import DoctorPortalLandingPage from "../screens/DoctorScreens/DoctorPortalLandingPage";
import Prescription from "../screens/DoctorScreens/Prescription";
import PrescriptionPreview from "../screens/DoctorScreens/PrescriptionPreview";
import DoctorsSubscribers from "../screens/DoctorScreens/DoctorsSubscribers";
import GeneratePrescription from "../screens/DoctorScreens/GeneratePrescription";
import DrCalendarView from "../screens/DoctorScreens/DrCalendarView";
import DoctorDashboard from "../screens/DoctorScreens/DoctorDashboard";
import WelcomePage from "../screens/PatientScreens/WelcomePage";

const Stack = createNativeStackNavigator();

const DoctorAppNavigation = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { user, role: authRole, isLoading: authLoading } = useAuth();
  const { role: roleContextRole, loading: roleLoading } = useRole();
  const role = authRole || roleContextRole;
  const isLoading = authLoading || roleLoading;

  // Redirect users away from doctor portal
  useFocusEffect(
    React.useCallback(() => {
      if (isLoading) return;

      if (user && role === "user") {
        // User trying to access doctor portal - redirect to patient portal
        // Get root navigator to navigate to root level screens
        const rootNav = navigation.getParent();
        if (rootNav) {
          rootNav.reset({
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

  return (
    <HeaderButtonsProvider stackType={"native"}>
      <Stack.Navigator
        initialRouteName="DoctorPortalLandingPage"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.container.backgroundColor,
          },
          headerTintColor: theme.text.color,
        }}
      >
        {/* <Stack.Screen
          name="DoctorPatientLandingPage"
          component={DoctorPatientLandingPage}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="DoctorPortalLandingPage"
          component={DoctorPortalLandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WelcomePage"
          component={WelcomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorMedicalRegistration"
          component={DoctorMedicalRegistration}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorsSignUp"
          component={DoctorsSignUp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorCongrats"
          component={DoctorCongrats}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EstablishmentTiming"
          component={EstablishmentTiming}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewDoctorMedicalReg"
          component={NewDoctorMedicalReg}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReminderView"
          component={ReminderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorsSubscribers"
          component={DoctorsSubscribers}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DrCalendarView"
          component={DrCalendarView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Prescription"
          component={Prescription}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrescriptionPreview"
          component={PrescriptionPreview}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GeneratePrescription"
          component={GeneratePrescription}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AppointmentsView"
          component={AppointmentsView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettings}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="MedicalProof"
          component={MedicalProof}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileSetting"
          component={ProfileSetting}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SubscriberFees"
          component={SubscriberFees}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ThemeSettings"
          component={ThemeSettings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LanguagePreference"
          component={LanguagePreference}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReminderNewest"
          component={Reminder}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </HeaderButtonsProvider>
  );
};

export default DoctorAppNavigation;
