"use client";

import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import SideBarNavigation from "../../../components/DoctorsPortalComponents/NewestSidebar";
import SettingsNavigation from "../../../components/DoctorsPortalComponents/SettingsNavigation";

const AccountSettings = ({ navigation, route }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [token, setToken] = useState("");

  const handleContinue = () => {
    // Handle 2FA setup continuation
    console.log("2FA setup requested");
  };

  const handleSubmit = () => {
    // Handle token submission
    console.log("Token submitted");
  };

  return (
    <View style={styles.container}>
      <View style={styles.parent}>
        {/* Left Sidebar */}
        <View style={styles.Left}>
          <SideBarNavigation navigation={navigation} />
        </View>

        {/* Middle Settings Menu */}
        <View style={styles.Middle}>
          <SettingsNavigation navigation={navigation} />
        </View>

        {/* Right Content Area */}
        <View style={styles.Right}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Security Settings</Text>

              {/* Two-factor Authentication Section */}
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>
                  <Text style={styles.underlinedText}>
                    Two-factor authentication
                  </Text>
                </Text>
                <Text style={styles.descriptionText}>
                  Two-factor authentication adds an extra layer of security to
                  your account. In addition to your username and password,
                  you'll need to enter a code that Practo sends to you via text
                  or an app on yo
                </Text>

                <View style={styles.twoFactorSection}>
                  <Text style={styles.subSectionTitle}>
                    <Text style={styles.underlinedText}>Set up using SMS:</Text>
                  </Text>
                  <Text style={styles.descriptionText}>
                    Enter your mobile number to which we shall send you a token.
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mobile Number</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="phone-pad"
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Token</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={token}
                      onChangeText={setToken}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Manage Logged-in Devices Section */}
              <View style={styles.settingSection}>
                <Text style={styles.sectionTitle}>
                  Manage Logged-in Devices
                </Text>

                <View style={styles.deviceCard}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>Windows 10 - Chrome</Text>
                    <View style={styles.deviceDetails}>
                      <Text style={styles.deviceLocation}>
                        Last logged in:{"\n"}
                        Mumbai, India{"\n"}
                        32 minutes ago
                      </Text>
                      <Text style={styles.currentDevice}>Current device</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#FDF4F4CF",
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  Left: {
    height: "100%",
    width: "15%",
    backgroundColor: "#FFF5F5",
  },
  Middle: {
    height: "100%",
    width: "15%",
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#F0F0F0",
  },
  Right: {
    height: "100%",
    width: "70%",
    backgroundColor: "#FDF4F4CF",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 50,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: "100%",
  },
  contentTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
    color: "#000000",
  },
  settingSection: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15,
    color: "#444444",
  },
  underlinedText: {
    textDecorationLine: "underline",
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 15,
    color: "#333333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
    marginBottom: 15,
    fontWeight: "300%",
  },
  inputGroup: {
    width: "32%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333333",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    backgroundColor: "#FFB6B6",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 120,
    marginBottom: 20,
  },
  continueButtonText: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#4C7DFF",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 120,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  twoFactorSection: {
    marginTop: 10,
    marginLeft: 20,
  },
  deviceCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    padding: 15,
    width: "70%",
  },
  deviceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  deviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingLeft: 20,
  },
  deviceLocation: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 20,
    fontWeight: "500",
  },
  currentDevice: {
    fontSize: 14,
    color: "#4CD964",
    fontWeight: "500",
  },
});

export default AccountSettings;
