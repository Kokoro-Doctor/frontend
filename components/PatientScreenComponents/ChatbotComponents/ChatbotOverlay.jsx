import React, { useEffect, useState } from "react";
import { useChatbot } from "../../../contexts/ChatbotContext";
import ChatBot from "./ChatBot";
import {
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PrivacyPolicy from "../../../screens/PatientScreens/Auth/PrivacyPolicy";

const ChatBotOverlay = ({ navigationRef }) => {
  const { chatbotConfig, openChatbot, closeChatbot } = useChatbot();
  const [currentRoute, setCurrentRoute] = useState(null);
  const { width } = useWindowDimensions();

  const handlePress = () => {
    navigationRef.current?.navigate("MobileChatbot");
  };

  // Update route state when navigation changes
  useEffect(() => {
    const updateRoute = () => {
      const routeName = navigationRef.current?.getCurrentRoute()?.name || null;
      setCurrentRoute(routeName);
    };

    const interval = setInterval(updateRoute, 500); // Check every 500ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, [navigationRef]);

  // Screens where chatbot SHOULD be visible
  // Define screens where the chatbot should be hidden
  const hiddenScreensWeb = [
    "AboutUsMain",
    "AboutUsWhat",
    "AboutUsHow",
    "AboutUsWhy",
    "ContactUs",
    "Help",
    "Settings",
    "Login",
    "Signup",
    "ForgotPassword",
    "ResetPassword",
    "PasswordSuccess",
    "MobileChatbot",
    "DoctorPatientLandingPage",
    "DoctorCongrats",
    "DoctorMedicalRegistration",
    "DoctorsSignUp",
    "NewDoctorMedicalReg",
    "EstablishmentTiming",
    "AccountSettings",
    "EstablishmentTimings",
    "LanguagePreference",
    "MedicalProof",
    "NotificationSettings",
    "ProfileSetting",
    "SubscriberFees",
    "ThemeSettings",
    "History",
    "ReminderNewest",
    "ReminderView",
    "AppointmentsView",
    "DrCalendarView",
    "PrivacyPolicy",
    "DoctorsSubscribers",
    "GeneratePrescription",
    "Prescription",
  ];
  const shownScreensMobile = ["LandingPage"];

  // Check platform and visibility conditions
  if (!currentRoute) {
    return null;
  }

  // For web, show chatbot if current screen is NOT in hiddenScreensWeb
  if (
    Platform.OS === "web" &&
    !hiddenScreensWeb.includes(currentRoute) &&
    width > 1000
  ) {
    return <ChatBot />;
  }

  // For mobile, show the pressable if current screen is in shownScreensMobile
  if (
    (Platform.OS !== "web" || width < 1000) &&
    shownScreensMobile.includes(currentRoute)
  ) {
    return (
      <Pressable onPress={handlePress} style={styles.pressable}>
        <Text style={styles.pressableText}>Ask me Anything....</Text>
        <MaterialIcons name="send" size={24} color="#000" />
      </Pressable>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  pressable: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6495ed",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pressableText: {
    color: "#aaa",
    fontSize: 16,
  },
});

export default ChatBotOverlay;
