import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderButtonsProvider } from "react-navigation-header-buttons/HeaderButtonsProvider";
import { useTheme } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../contexts/Themes";
import PrivacyPolicy from "../screens/PatientScreens/Auth/PrivacyPolicy";
import LandingPage from "../screens/PatientScreens/LandingPage";
import DoctorPatientLandingPage from "../screens/DoctorScreens/DoctorRegistration/DoctorPatientLandingPage";
import UserDashboard from "../screens/PatientScreens/UserDashboard";

//Doctors
import ConsultWithDoctors from "../screens/PatientScreens/Doctors/ConsultWithDoctors";
import DoctorNearYou from "../screens/PatientScreens/Doctors/DoctorNearYou";
import DoctorResultShow from "../screens/PatientScreens/Doctors/DoctorResultShow";
import DoctorsInfoWithSubscription from "../screens/PatientScreens/Doctors/DoctorsInfoWithSubscription";
import DoctorsInfoWithBooking from "../screens/PatientScreens/Doctors/DoctorsInfoWithBooking";
import DoctorAvailabilitySlots from "../screens/PatientScreens/Doctors/App/DoctorAvailabilitySlots";
import AppDoctorsRating from "../screens/PatientScreens/Doctors/App/AppDoctorsRating";
import DoctorsSubscriptionPaymentScreen from "../screens/PatientScreens/Doctors/DoctorsSubscriptionPaymentScreen";
import DoctorsBookingPaymentScreen from "../screens/PatientScreens/Doctors/DoctorsBookingPaymentScreen";
import BookingConfirmation from "../screens/PatientScreens/Doctors/App/BookingConfirmation";

//Hospitals
import AllHospitals from "../screens/PatientScreens/Hospitals/AllHospitals";
import EmergencyLocation from "../screens/PatientScreens/Hospitals/App/EmergencyLocation";
import HospitalsInfoWithRating from "../screens/PatientScreens/Hospitals/HospitalsInfoWithRating";
import HospitalBookingNext from "../screens/PatientScreens/Hospitals/App/HospitalBookingNext";
import BookHospitals from "../screens/PatientScreens/Hospitals/BookHospitals";
import HospitalCard from "../components/PatientScreenComponents/HospitalComponents/HospitalCard";
import HospitalAvailability from "../screens/PatientScreens/Hospitals/App/HospitalAvailability";
import HospitalAvailabilitySlots from "../screens/PatientScreens/Hospitals/App/HospitalAvailabilitySlots";
import HospitalPaymentApp from "../screens/PatientScreens/Hospitals/App/HospitalPaymentApp";

//AboutUs
import AboutUsMain from "../screens/PatientScreens/AboutUs/AboutUsMain";
import AboutUsWhat from "../screens/PatientScreens/AboutUs/AboutUsWhat";
import AboutUsHow from "../screens/PatientScreens/AboutUs/AboutUsHow";
import AboutUsWhy from "../screens/PatientScreens/AboutUs/AboutUsWhy";

//Pricing
import MainPricing from "../screens/PatientScreens/Pricing/MainPricing";
import ElitePlan from "../screens/PatientScreens/Pricing/App/ElitePlan";
import ExecutivePlan from "../screens/PatientScreens/Pricing/App/ExecutivePlan";
import PlatinumPlan from "../screens/PatientScreens/Pricing/App/PlatinumPlan";

//Other Screens
import BillReceipt from "../screens/PatientScreens/BillReceipt";
import Error from "../screens/PatientScreens/Error";
import Medilocker from "../screens/PatientScreens/Medilocker";
import Settings from "../screens/PatientScreens/Settings";
import Help from "../screens/PatientScreens/Help";
import ContactUs from "../screens/PatientScreens/ContactUs";
import MobileChatbot from "../components/PatientScreenComponents/ChatbotComponents/MobileChatbot";
import DoctorReviewScreen from "../screens/PatientScreens/Doctors/App/DoctorReviewScreen";

const Stack = createNativeStackNavigator();

const DoctorNavigator = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Stack.Navigator
      initialRouteName="DoctorResultShow"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.container.backgroundColor,
        },
        headerTintColor: theme.text.color,
      }}
    >
      <Stack.Screen
        name="ConsultWithDoctors"
        component={ConsultWithDoctors}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorResultShow"
        component={DoctorResultShow}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorsInfoWithSubscription"
        component={DoctorsInfoWithSubscription}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorsInfoWithBooking"
        component={DoctorsInfoWithBooking}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorAvailabilitySlots"
        component={DoctorAvailabilitySlots}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorsSubscriptionPaymentScreen"
        component={DoctorsSubscriptionPaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorsBookingPaymentScreen"
        component={DoctorsBookingPaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorNearYou"
        component={DoctorNearYou}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppDoctorsRating"
        component={AppDoctorsRating}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorReviewScreen"
        component={DoctorReviewScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const HospitalNavigator = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Stack.Navigator
      initialRouteName="AllHospitals"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.container.backgroundColor,
        },
        headerTintColor: theme.text.color,
      }}
    >
      <Stack.Screen
        name="AllHospitals"
        component={AllHospitals}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmergencyLocation"
        component={EmergencyLocation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookHospitals"
        component={BookHospitals}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalsInfoWithRating"
        component={HospitalsInfoWithRating}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalCard"
        component={HospitalCard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalAvailability"
        component={HospitalAvailability}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalBookingNext"
        component={HospitalBookingNext}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalAvailabilitySlots"
        component={HospitalAvailabilitySlots}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalPaymentApp"
        component={HospitalPaymentApp}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const PricingNavigator = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Stack.Navigator
      initialRouteName="MainPricing"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.container.backgroundColor,
        },
        headerTintColor: theme.text.color,
      }}
    >
      <Stack.Screen
        name="MainPricing"
        component={MainPricing}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ElitePlan"
        component={ElitePlan}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExecutivePlan"
        component={ExecutivePlan}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PlatinumPlan"
        component={PlatinumPlan}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AboutUsNavigator = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Stack.Navigator
      initialRouteName="AboutUsMain"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.container.backgroundColor,
        },
        headerTintColor: theme.text.color,
      }}
    >
      <Stack.Screen
        name="AboutUsMain"
        component={AboutUsMain}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutUsWhat"
        component={AboutUsWhat}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutUsHow"
        component={AboutUsHow}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutUsWhy"
        component={AboutUsWhy}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AppNavigation = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <HeaderButtonsProvider stackType={"native"}>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.container.backgroundColor,
          },
          headerTintColor: theme.text.color,
        }}
      >
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserDashboard"
          component={UserDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Medilocker"
          component={Medilocker}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Doctors"
          component={DoctorNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Hospitals"
          component={HospitalNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainPricing"
          component={PricingNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BillReceipt"
          component={BillReceipt}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MobileChatbot"
          component={MobileChatbot}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Help"
          component={Help}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Error" component={Error} />
        <Stack.Screen
          name="DoctorPatientLandingPage"
          component={DoctorPatientLandingPage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </HeaderButtonsProvider>
  );
};

export default AppNavigation;
