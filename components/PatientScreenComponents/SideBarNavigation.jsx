import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import mixpanel, { trackButton } from "../../utils/Mixpanel";

const SideBarNavigation = ({ navigation, closeSidebar }) => {
  const { width } = useWindowDimensions();
  const [selectedItem, setSelectedItem] = useState(null);

  const getCurrentRouteScreen = () => {
    // Get the current route state from the navigation
    const state = navigation.getState();
    if (state && state.routes && state.routes.length > 0) {
      const currentRoute = state.routes[state.index];
      return currentRoute.params?.screen || currentRoute.name;
    }
    return null;
  };

  const menuItems = [
    { name: "Home", icon: require("../../assets/Icons/HomeProfile.png") },
    {
      name: "Dashboard",
      icon: require("../../assets/Icons/icondashboard.png"),
    },
    {
      name: "Subscribe to Sr.Doctors",
      icon: require("../../assets/Icons/doctorTool.png"),
    },
    {
      name: "Medilocker",
      icon: require("../../assets/Icons/medilockerIcon.png"),
    },
    {
      name: "24/7 AI Support",
      icon: require("../../assets/Icons/cardiacHealth.png"),
    },
    {
      name: "Book Hospital",
      icon: require("../../assets/Icons/Medical Shield.png"),
    },

    { name: "About Us", icon: require("../../assets/Icons/CirclesFour.png") },
    // { name: "Pricing", icon: require("../../assets/Icons/pricing.png") },

    { name: "Abha", icon: require("../../assets/Icons/Abha_sidebar.png") },
    // { name: "Pricing", icon: require("../../assets/Icons/Abha_sidebar.png") },
  ];
  const lowerMenuItems = [
    // { name: "Settings", icon: require("../../assets/Icons/GearSix.png") },
    { name: "Contact Us", icon: require("../../assets/Icons/cloudcheck.png") },
    { name: "Help", icon: require("../../assets/Icons/help.png") },
  ];

  const handleSidebarClick = (menu) => {
    // Prevent navigation if already on the target screen
    const currentRoute = getCurrentRouteScreen();

    if (
      menu === "Abha" &&
      (currentRoute === "Abha" ||
        (navigation.getState()?.routes?.[navigation.getState().index]?.name ===
          "PatientAppNavigation" &&
          currentRoute === "Abha"))
    ) {
      // Already on Abha screen, just close sidebar if needed
      if (closeSidebar) {
        closeSidebar();
      }
      return;
    }

    // setSelectedItem(menu);  //used for the red color color but is not working as intended

    const eventName = `${menu
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")}_sidebar_click`;

    trackButton(eventName, {
      menu_name: menu,
      screen: "Sidebar",
      platform: Platform.OS,
    });

    if (menu === "Home") {
      navigation.navigate("LandingPage");
    } else if (menu === "Dashboard") {
      navigation.navigate("PatientAppNavigation", {
        screen: "UserDashboard",
      });
    } else if (menu === "Subscribe to Sr.Doctors") {
      navigation.navigate("PatientAppNavigation", {
        screen: "Doctors",
      });
    } else if (menu === "Medilocker") {
      navigation.navigate("PatientAppNavigation", {
        screen: "NewMedilockerScreen",
      });
    } else if (menu === "Book Hospital") {
      navigation.navigate("PatientAppNavigation", {
        screen: "Hospitals",
      });
    } else if (menu === "24/7 AI Support") {
      navigation.navigate("PatientAppNavigation", {
        screen: "MobileChatbot",
      });
    } else if (menu === "Contact Us") {
      navigation.navigate("PatientAppNavigation", {
        screen: "ContactUs",
      });
    } else if (menu === "About Us") {
      navigation.navigate("PatientAppNavigation", {
        screen: "AboutUs",
      });
    } else if (menu === "Abha") {
      navigation.navigate("PatientAppNavigation", {
        screen: "Abha",
      });
    } else if (menu === "Settings") {
      navigation.navigate("PatientAppNavigation", {
        screen: "Settings",
      });
    } else if (menu === "Pricing") {
      navigation.navigate("PatientAppNavigation", {
        screen: "MainPricing",
      });
    } else {
      navigation.navigate(menu);
    }

    // Close sidebar after navigation
    if (closeSidebar) {
      setTimeout(() => {
        closeSidebar();
      }, 100);
    }
  };

  return (
    <View style={styles.sidebar_content}>
      <View style={styles.top_sidebar}>
        <View style={styles.topimage_sidebar}>
          <Image
            source={require("../../assets/Images/KokoroLogo.png")}
            style={styles.heartImage}
          />
        </View>

        <Text style={styles.title}>Kokoro.Doctor</Text>

        {(Platform.OS !== "web" || width < 900) && (
          <Pressable onPress={closeSidebar}>
            <MaterialIcons name="arrow-back" size={24} color="grey" />
          </Pressable>
        )}
      </View>
      <View style={styles.upper_sidebar}>
        {/* Dynamic Menu Items with Icons */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.6}
            style={[
              styles.menuItemContainer,
              selectedItem === item.name ? styles.selectedMenuItem : null, // Apply selected style
              { borderWidth: 0 },
              ,
            ]}
            onPress={() => {
              handleSidebarClick(item.name);
            }}
          >
            <Image source={item.icon} style={styles.menuIcon} />
            <Text
              style={[
                styles.menuText,
                selectedItem === item.name ? styles.selectedMenuText : null, // Change text color
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.lower_sidebar}>
        {lowerMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.6}
            style={[
              styles.menuItemContainer,
              selectedItem === item.name ? styles.selectedMenuItem : null, // Apply selected style
              { borderWidth: 0 },
              ,
            ]}
            onPress={() => {
              handleSidebarClick(item.name);
            }}
          >
            <Image source={item.icon} style={styles.menuIcon} />
            <Text
              style={[
                styles.menuText,
                selectedItem === item.name ? styles.selectedMenuText : null, // Change text color
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
    marginBottom: "20%",
    marginTop: "24%",
    // borderWidth: 1,
    ...Platform.select({
      web: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: "5%",
        marginBottom: 40,
        marginTop: "5%",
        // borderWidth: 1,
      },
    }),
  },
  topimage_sidebar: {
    // height: "90%",
    width: "15%",
    marginVertical: "1%",
    //borderWidth: 1,
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
    color: "rgba(200, 31, 31, 0.46)",
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
    backgroundColor: "#ff6347",
  },
  selectedMenuText: {
    color: "#ffffff",
  },
});

export default SideBarNavigation;
