import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign, Feather } from '@expo/vector-icons';
import SideBarNavigation from "../../../components/DoctorsPortalComponents/NewestSidebar";
import SettingsNavigation from "../../../components/DoctorsPortalComponents/SettingsNavigation";

const LanguagePreference = ({ navigation, route }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true); // Set to true to show dropdown open by default
  const [selectedLanguage, setSelectedLanguage] = useState(null); // Changed to null initially
  
  const languages = [
    { name: "English (In)", selected: true },
    { name: "Hindi (हिंदी)", selected: false },
    { name: "Gujarati (ગુજરાતી)", selected: false },
    { name: "Spanish (española(F)/español(M))", selected: false },
    { name: "Tamil (தமிழ்)", selected: false },
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setIsDropdownOpen(false);
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
              <Text style={styles.contentTitle}>Language Preferences</Text>
              
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Language</Text>
                
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={toggleDropdown}
                  >
                    <Text style={selectedLanguage ? styles.dropdownButtonTextSelected : styles.dropdownButtonText}>
                      {selectedLanguage || "Select language"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#333" />
                  </TouchableOpacity>
                  
                  {isDropdownOpen && (
                    <View style={styles.dropdownMenu}>
                      {languages.map((language, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dropdownItem,
                            index === languages.length - 1 && styles.lastDropdownItem
                          ]}
                          onPress={() => selectLanguage(language.name)}
                        >
                          <Text style={styles.dropdownItemText}>{language.name}</Text>
                          {selectedLanguage === language.name ? (
                            <View style={styles.radioButtonSelected}>
                              <View style={styles.radioButtonInner} />
                            </View>
                          ) : (
                            <View style={styles.radioButton} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
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
    backgroundColor:" #FDF4F4CF",
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
    height:"80%",
    width: "90%",
  },
  contentTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
    color: "#000000",
  },
  settingSection: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 12,
    fontWeight: "400",
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
    width: "100%",
    maxWidth: 350, 
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    height: 48,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#999999", 
  },
  dropdownButtonTextSelected: {
    fontSize: 16,
    color: "#333333", 
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    marginTop: 0, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333333",
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  radioButtonSelected: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioButtonInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#FF6B6B",
  },
});

export default LanguagePreference;