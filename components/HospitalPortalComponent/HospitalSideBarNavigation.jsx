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

const HospitalSidebarNavigation = ({ closeSidebar, activeItem = "Home" }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [selectedItem, setSelectedItem] = useState(activeItem);

  const menuItems = [
    {
      name: "Home",
      icon: require("../../assets/HospitalPortal/Icon/hospital_home.png"),
    },
    {
      name: "Dashboard",
      icon: require("../../assets/HospitalPortal/Icon/hospital_dashboard.png"),
    },
    {
      name: "Post OP Patients",
      icon: require("../../assets/HospitalPortal/Icon/post_op_patient.png"),
    },

    {
      name: "Insurance Claim",
      icon: require("../../assets/HospitalPortal/Icon/insurance.png"),
    },
  ];

  const handleSidebarClick = (menu) => {
    setSelectedItem(menu);

    // Navigate using if/else structure like in code 1
    if (menu === "Home") {
      navigation.navigate("HospitalPortalLandingPage");
    } else if (menu === "Dashboard") {
      navigation.navigate("");
    } else if (menu === "Post OP Patients") {
      navigation.navigate("");
    } else if (menu === "Insurance Claim") {
      navigation.navigate("HospitalInsuranceClaim");
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
            <Image
              source={item.icon}
              style={[
                styles.menuIcon,
                selectedItem === item.name && { tintColor: "#ffffff" },
              ]}
            />

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
  //   lower_sidebar: {
  //     justifyContent: "center",
  //     paddingBottom: 20,
  //     marginTop: "auto", // Push to bottom of available space
  //   },
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
    backgroundColor: "#3c36eeff",
  },
  selectedMenuText: {
    color: "#ffffff",
  },
});

export default HospitalSidebarNavigation;
