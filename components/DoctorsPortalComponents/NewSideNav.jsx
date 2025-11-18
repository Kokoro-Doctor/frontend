import React, { useState } from "react";
import {
	ImageBackground,
	StyleSheet,
	View,
	Text,
	Image,
	TouchableOpacity,
	Platform,
	useWindowDimensions,
	FlatList,
	StatusBar,
	ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRegistration } from "../../contexts/RegistrationContext";

const NewSideNav = () => {
	const navigation = useNavigation();

	const [selectedItem, setSelectedItem] = useState(null);
	const { isRegistered } = useRegistration() || {};
	const menuItems = [
		{ name: "Home", icon: require("../../assets/Icons/HomeProfile.png") },
	];
	const lowerMenuItems = [
		{ name: "Settings", icon: require("../../assets/Icons/GearSix.png") },
		{ name: "Contact Us", icon: require("../../assets/Icons/cloudcheck.png") },
		{ name: "Help", icon: require("../../assets/Icons/help.png") },
	];

	const handleSidebarClick = (menu) => {
		// setSelectedItem(menu);  //used for the red color color but is not working as intended
		if (menu === "Home") {
			if (isRegistered) {
				navigation.navigate("Dashboard");
			} else {
				navigation.navigate("DoctorPatientLandingPage");
			}
		} else if (menu === "Contact Us") {
			navigation.navigate("ContactUs");
		} else if (menu === "Help") {
			navigation.navigate("Help");
		} else if (menu === "Settings") {
			navigation.navigate("Settings");
		} else {
			navigation.navigate(menu);
		}
	};
	return (
		<>
			<View style={styles.parent}>
				<TouchableOpacity
					style={styles.top_sidebar}
					onPress={() => navigation.navigate("DoctorPatientLandingPage")}>
					<View style={styles.topimage_sidebar}>
						<Image
							source={require("../../assets/Images/KokoroLogo.png")}
							style={styles.heartImage}
						/>
					</View>

					<Text style={styles.title}>Kokoro.Doctor</Text>
				</TouchableOpacity>

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
							}}>
							<Image
								source={item.icon}
								style={styles.menuIcon}
							/>
							<Text
								style={[
									styles.menuText,
									selectedItem === item.name ? styles.selectedMenuText : null, // Change text color
								]}>
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
							}}>
							<Image
								source={item.icon}
								style={styles.menuIcon}
							/>
							<Text
								style={[
									styles.menuText,
									selectedItem === item.name ? styles.selectedMenuText : null, // Change text color
								]}>
								{item.name}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</>
	);
};
const styles = StyleSheet.create({
	parent: {
		width: "16%",
		height: "100%",
		backgroundColor: "#FFF",
	},
	top_sidebar: {
		height: "10%",
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
	},

	upper_sidebar: {
		height: "40%",
		marginBottom: 50,
	},

	lower_sidebar: {
		height: "30%",
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
export default NewSideNav;
