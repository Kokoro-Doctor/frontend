import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

export default function AuthGate() {
  const { user, role, isLoading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (isLoading) return;

    // 🔴 LOGOUT CASE — FORCE RESET
    if (!user) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "LandingPage" }],
        })
      );
      return;
    }

    // 🟢 LOGIN CASE
    if (user && role) {
      if (role === "doctor") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "DoctorAppNavigation" }],
          })
        );
      } else if (role === "user") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "PatientAppNavigation" }],
          })
        );
      }
    }
  }, [user, role, isLoading, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
