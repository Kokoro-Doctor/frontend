import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import SideBarNavigation from "../../../components/DoctorsPortalComponents/NewestSidebar";
import SettingsNavigation from "../../../components/DoctorsPortalComponents/SettingsNavigation";

const ThemeSettings = ({ navigation, route }) => {
  const [colorMode, setColorMode] = useState("Dark");
  
  const toggleDropdown = () => {
    // In a real app, this would show dropdown options
    console.log("Toggle dropdown");
  };

  return (
    <View style={styles.container}>
      <View style={styles.parent}>
        {/* Left Sidebar */}
        <View style={styles.Left}>
          <SideBarNavigation navigation={navigation} />
        </View>
        
        {/* Middle Settings Menu */}
        <View style={styles.Left}>
          <SettingsNavigation navigation={navigation} />
        </View>
        {/* Right Content Area */}
        <View style={styles.Right}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Dashboard Layout</Text>
              
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Color Mode</Text>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingName}>Color</Text>
                  
                  <TouchableOpacity 
                    style={styles.dropdown}
                    onPress={toggleDropdown}
                  >
                    <Text style={styles.dropdownText}>{colorMode}</Text>
                    <Ionicons name="chevron-down" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
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
    backgroundColor: "#fff",
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
  
  Right: {
    height: "100%",
    width: "90%",
    backgroundColor: "#FDF4F4CF",
  },

  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: "75%",
    width: "65%",
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  settingSection: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 4,
    paddingHorizontal:"5%",
    width:"70%",

  },
  settingName: {
    fontSize: 16,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    minWidth: 180,
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 16,
    marginRight: 5,
    color: "#333333",
  },
});

export default ThemeSettings;