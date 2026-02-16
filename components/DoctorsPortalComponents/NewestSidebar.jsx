import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NewestSidebar = ({ closeSidebar, activeItem = "Home" }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [selectedItem, setSelectedItem] = useState(activeItem);

  const menuItems = [
    { name: "Home", icon: require("../../assets/Icons/HomeProfile.png") },
    {
      name: "Dashboard",
      icon: require("../../assets/DoctorsPortal/Icons/Doctordashboard.png"),
    },
    {
      name: "Calendar",
      icon: require("../../assets/DoctorsPortal/Icons/calendar.png"),
    },
    // {
    //   name: "Appointments",
    //   icon: require("../../assets/DoctorsPortal/Icons/appointment.png"),
    // },
    {
      name: "Prescription",
      icon: require("../../assets/DoctorsPortal/Icons/PrescriptionIcon.png"),
    },
    {
      name: "History",
      icon: require("../../assets/DoctorsPortal/Icons/history.png"),
    },
    // {
    //   name: "Reminder",
    //   icon: require("../../assets/DoctorsPortal/Icons/reminder.png"),
    // },
    // {
    //   name: "Notification",
    //   icon: require("../../assets/DoctorsPortal/Icons/notification2.png"),
    // },
  ];

  const lowerMenuItems = [
    {},
    {
      name: "Settings",
      icon: require("../../assets/DoctorsPortal/Icons/GearSix.png"),
    },
    {
      name: "Contact Us",
      icon: require("../../assets/DoctorsPortal/Icons/cloudcheck.png"),
    },
    {
      name: "Help",
      icon: require("../../assets/DoctorsPortal/Icons/help.png"),
    },
  ];

  const handleSidebarClick = (menu) => {
    setSelectedItem(menu);

    // Navigate using if/else structure like in code 1
    if (menu === "Home") {
      navigation.navigate("DoctorPortalLandingPage");
    } else if (menu === "Dashboard") {
      navigation.navigate("DoctorDashboard");
    } else if (menu === "Calendar") {
      navigation.navigate("DrCalendarView");
      // } else if (menu === "Appointments") {
      //   navigation.navigate("AppointmentsView");
      // }
    } else if (menu === "Prescription") {
      navigation.navigate("Prescription");
    } else if (menu === "History") {
      navigation.navigate("History");
    } else if (menu === "Settings") {
      if (Platform.OS === "web" && width >= 900) {
        navigation.navigate("ProfileSetting");
      } else if (Platform.OS !== "web" || width < 900) {
        navigation.navigate("DoctorSettings");
      }
    } else if (menu === "Contact Us") {
      navigation.navigate("PatientAppNavigation", {
        screen: "ContactUs",
      });
    } else if (menu === "Help") {
      navigation.navigate("PatientAppNavigation", {
        screen: "Help",
      });
    } else {
      navigation.navigate(menu);
    }
  };

  return (
    <View style={styles.sidebar_content}>
      {/* Top Section with Logo */}
      <TouchableOpacity
        style={styles.top_sidebar}
        // onPress={() => navigation.navigate("DoctorPatientLandingPage")}
      >
        <View style={styles.topimage_sidebar}>
          <Image
            source={require("../../assets/DoctorsPortal/Images/KokoroLogo.png")}
            style={styles.heartImage}
          />
        </View>

        <Text style={styles.title}>Kokoro.Doctor</Text>

        {/* Close button for mobile view */}
        {(Platform.OS !== "web" || width < 900) && (
          <Pressable onPress={closeSidebar}>
            <MaterialIcons name="arrow-back" size={24} color="grey" />
          </Pressable>
        )}
      </TouchableOpacity>

      {/* Upper Menu Items */}
      <View style={styles.upper_sidebar}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.6}
            style={[
              styles.menuItemContainer,
              selectedItem === item.name ? styles.selectedMenuItem : null,
            ]}
            onPress={() => handleSidebarClick(item.name)}
          >
            <Image source={item.icon} style={styles.menuIcon} />
            <Text
              style={[
                styles.menuText,
                selectedItem === item.name ? styles.selectedMenuText : null,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lower Menu Items */}
      <View style={styles.lower_sidebar}>
        {lowerMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.6}
            style={[
              styles.menuItemContainer,
              selectedItem === item.name ? styles.selectedMenuItem : null,
            ]}
            onPress={() => handleSidebarClick(item.name)}
          >
            <Image source={item.icon} style={styles.menuIcon} />
            <Text
              style={[
                styles.menuText,
                selectedItem === item.name ? styles.selectedMenuText : null,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar_content: {
    flex: 1,
    width: "100%",
    backgroundColor: "#f5f5f5",
    flexDirection: "column",
    paddingVertical: 10,
  },
  top_sidebar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "5%",
    marginBottom: 40,
  },
  topimage_sidebar: {
    width: "15%",
    marginVertical: "1%",
    flexDirection: "row",
  },
  heartImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  title: {
    width: "70%",
    fontSize: 18,
    color: "rgba(0, 0, 0, 0.46)",
    fontWeight: "bold",
    marginLeft: 10,
    ...Platform.select({
      web: {
        width: "85%",
      },
    }),
  },
  upper_sidebar: {
    justifyContent: "center",
    marginBottom: 50,
  },
  lower_sidebar: {
    justifyContent: "center",
    paddingBottom: 20,
    marginTop: "auto", // Push to bottom of available space
  },
  menuItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: "contain",
  },
  menuText: {
    width: "85%",
    fontSize: 16,
    color: "#333",
  },
  selectedMenuItem: {
    backgroundColor: "#FF7B7B",
  },
  selectedMenuText: {
    color: "#ffffff",
  },
});

export default NewestSidebar;
