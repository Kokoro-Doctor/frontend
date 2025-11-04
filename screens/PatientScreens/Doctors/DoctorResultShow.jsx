// import React, { useCallback, useState, useEffect } from "react";
// import {
//   Alert,
//   //Image,
//   Text,
//   ImageBackground,
//   StyleSheet,
//   TouchableOpacity,
//   View,
//   TextInput,
//   //Linking,
//   // Keyboard,
//   Platform,
//   ScrollView,
//   useWindowDimensions,
//   StatusBar,
//   Dimensions,
//   Modal,
// } from "react-native";

// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import { useChatbot } from "../../../contexts/ChatbotContext";
// import { useFocusEffect } from "@react-navigation/native";
// import SideBarNavigation from "../../../components/PatientScreenComponents/SideBarNavigation";
// import Header from "../../../components/PatientScreenComponents/Header";
// import SearchBar from "../../../components/PatientScreenComponents/SearchBar";
// import DoctorAppointmentData from "../../../components/PatientScreenComponents/DoctorComponents/DoctorsAppointmentData";
// import PromoModal from "../../../components/PatientScreenComponents/PromoModal";
// // Create a platform-specific location implementation
// const GetLocationPolyfill = {
//   getCurrentPosition: (options) => {
//     // For web, use the browser's Geolocation API
//     if (Platform.OS === "web") {
//       return new Promise((resolve, reject) => {
//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(
//             (position) => {
//               resolve({
//                 latitude: position.coords.latitude,
//                 longitude: position.coords.longitude,
//                 altitude: position.coords.altitude || 0,
//                 accuracy: position.coords.accuracy,
//                 speed: position.coords.speed || 0,
//                 time: position.timestamp,
//               });
//             },
//             (error) => {
//               reject({
//                 code: error.code,
//                 message: error.message,
//               });
//             },
//             options
//           );
//         } else {
//           reject({
//             code: "UNAVAILABLE",
//             message: "Geolocation not available on this browser",
//           });
//         }
//       });
//     } else {
//       // For native platforms, we would import the actual module
//       // This will never run in web bundling
//       console.warn("Native GetLocation used in non-native environment");
//       return Promise.reject({
//         code: "PLATFORM_NOT_SUPPORTED",
//         message: "Platform not supported",
//       });
//     }
//   },
// };

// // Helper function to determine if an error is a location error
// const isLocationError = (error) => {
//   return (
//     error && typeof error.code === "string" && typeof error.message === "string"
//   );
// };

// const DoctorResultShow = ({ navigation, route }) => {
//   //const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
//   const [locationInput, setLocationInput] = useState("");
//   //const [dropdownVisible, setDropdownVisible] = useState(false); // State to toggle dropdown visibility
//   const { setChatbotConfig } = useChatbot();
//   const [location, setLocation] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { width } = useWindowDimensions();
//   const [showPromo, setShowPromo] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("Categories");
//   const categories = [
//     "Cardiologist",
//     "cardiac wellness",
//     "Reproductive Wellness",
//   ];

//   useEffect(() => {
//     let timeoutId;

//     if (Platform.OS !== "web") {
//       timeoutId = setTimeout(() => {
//         setShowPromo(true);
//       }, 1000);
//     }

//     return () => {
//       if (timeoutId) clearTimeout(timeoutId);
//     };
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       // Reset chatbot height when this screen is focused
//       setChatbotConfig({ height: "50%" });
//     }, [])
//   );

//   // const handleSearch = () => {
//   //   Alert.alert(`Search Results for: ${searchQuery}`);
//   // };

//   // const toggleDropdown = () => {
//   //   setDropdownVisible(!dropdownVisible);
//   // };

//   // const handleBlur = () => {
//   //   setIsFocused(false);
//   //   Keyboard.dismiss();
//   // };

//   // const handleCallPress = () => {
//   //   Linking.openURL(`tel:${phoneNumber}`);
//   // };

//   const requestLocation = () => {
//     setLoading(true);
//     setLocation(null);
//     setError(null);

//     GetLocationPolyfill.getCurrentPosition({
//       enableHighAccuracy: true,
//       timeout: 30000,
//     })
//       .then((newLocation) => {
//         setLoading(false);
//         setLocation(newLocation);
//         Alert.alert(
//           "Location detected",
//           `Lat: ${newLocation.latitude.toFixed(
//             4
//           )}, Lng: ${newLocation.longitude.toFixed(4)}`
//         );
//       })
//       .catch((ex) => {
//         if (isLocationError(ex)) {
//           const { code, message } = ex;
//           console.warn(code, message);
//           setError(code);
//           Alert.alert("Location Error", `Could not get location: ${message}`);
//         } else {
//           console.warn(ex);
//           Alert.alert(
//             "Error",
//             "An unknown error occurred while getting location"
//           );
//         }
//         setLoading(false);
//         setLocation(null);
//       });
//   };

//   return (
//     <>
//       {Platform.OS === "web" && width > 1000 && (
//         <View style={styles.webContainer}>
//           <View style={styles.imageContainer}>
//             <ImageBackground
//               source={require("../../../assets/Images/MedicineBackground.png")}
//               style={styles.imageBackground}
//             >
//               <View
//                 style={[
//                   styles.overlay,
//                   { backgroundColor: "rgba(16, 16, 16, 0.3)" },
//                 ]}
//               />

//               <View style={styles.parent}>
//                 <View style={styles.Left}>
//                   <SideBarNavigation navigation={navigation} />
//                 </View>
//                 <View style={styles.Right}>
//                   <View style={styles.header}>
//                     <Header navigation={navigation} />
//                   </View>

//                   <View style={styles.contentContainer}>
//                     <View style={styles.searchSection}>
//                       <Text style={styles.mainHeading}>
//                         Let me find the best doctor for you !!
//                       </Text>

//                       <View style={styles.locationContainer}>
//                         <TouchableOpacity
//                           style={styles.detectLocationButton}
//                           onPress={requestLocation}
//                         >
//                           <MaterialIcons
//                             name="my-location"
//                             size={18}
//                             color="#333"
//                           />
//                           <Text style={styles.detectLocationText}>
//                             {loading
//                               ? "Detecting..."
//                               : "Detect Current Location"}
//                           </Text>
//                         </TouchableOpacity>

//                         <Text style={styles.orText}>Or</Text>

//                         <View style={styles.locationInputContainer}>
//                           <MaterialIcons
//                             name="location-on"
//                             size={18}
//                             color="#333"
//                           />
//                           <TextInput
//                             style={styles.locationInput}
//                             placeholder="Enter Location"
//                             placeholderTextColor="#666"
//                             value={locationInput}
//                             onChangeText={setLocationInput}
//                           />
//                         </View>
//                       </View>

//                       {location && (
//                         <Text style={styles.locationFoundText}>
//                           Location: {location.latitude.toFixed(4)},{" "}
//                           {location.longitude.toFixed(4)}
//                         </Text>
//                       )}

//                       <View style={{ flex: 1, position: "relative" }}>
//                         {/* Category button */}
//                         <View style={styles.categoryBox}>
//                           <TouchableOpacity
//                             style={styles.filterButton}
//                             onPress={() => setShowDropdown(!showDropdown)}
//                           >
//                             <Text style={styles.filterButtonText}>
//                               {selectedCategory}
//                             </Text>
//                             <MaterialIcons
//                               name={
//                                 showDropdown
//                                   ? "keyboard-arrow-up"
//                                   : "keyboard-arrow-down"
//                               }
//                               size={20}
//                               color="#333"
//                             />
//                           </TouchableOpacity>
//                         </View>

//                         {/* Doctor list (always scrollable) */}
//                         <View style={styles.middlepart}>
//                           <DoctorAppointmentData navigation={navigation} />
//                         </View>

//                         {/* Dropdown overlay (absolute, not affecting layout) */}
//                         {showDropdown && (
//                           <View
//                             style={styles.dropdownWrapper}
//                             pointerEvents="box-none"
//                           >
//                             {/* Close dropdown if tapping outside */}
//                             <TouchableOpacity
//                               style={styles.backdrop}
//                               activeOpacity={1}
//                               onPressOut={() => setShowDropdown(false)}
//                             />

//                             <View style={styles.dropdownOverlayWrapper}>
//                               <ScrollView>
//                                 {categories.map((cat, idx) => (
//                                   <TouchableOpacity
//                                     key={idx}
//                                     style={styles.dropdownItems}
//                                     onPress={() => {
//                                       setSelectedCategory(cat);
//                                       setShowDropdown(false);
//                                     }}
//                                   >
//                                     <Text style={styles.dropdownItemsText}>
//                                       {cat}
//                                     </Text>
//                                   </TouchableOpacity>
//                                 ))}
//                               </ScrollView>
//                             </View>
//                           </View>
//                         )}

//                         {/* <Modal
//                           transparent
//                           visible={showDropdown}
//                           animationType="fade"
//                           onRequestClose={() => setShowDropdown(false)}
//                         >
//                           <TouchableOpacity
//                             style={styles.modalBackdrop}
//                             activeOpacity={1}
//                             onPressOut={() => setShowDropdown(false)} // close when tapping outside
//                           >
//                             <View style={styles.dropdownOverlayWrapper}>
//                               <ScrollView>
//                                 {categories.map((cat, idx) => (
//                                   <TouchableOpacity
//                                     key={idx}
//                                     style={styles.dropdownItems}
//                                     onPress={() => {
//                                       setSelectedCategory(cat);
//                                       setShowDropdown(false);
//                                     }}
//                                   >
//                                     <Text style={styles.dropdownItemsText}>
//                                       {cat}
//                                     </Text>
//                                   </TouchableOpacity>
//                                 ))}
//                               </ScrollView>
//                             </View>
//                           </TouchableOpacity>
//                         </Modal> */}
//                       </View>
//                     </View>

//                     {/* <View style={styles.middlepart}>
//                       <DoctorAppointmentData navigation={navigation} />
//                     </View> */}
//                   </View>
//                 </View>
//               </View>
//             </ImageBackground>
//           </View>
//         </View>
//       )}
//       {(Platform.OS !== "web" || width < 1000) && (
//         <View style={styles.appContainer}>
//           <StatusBar barStyle="light-content" backgroundColor="#fff" />
//           <View style={[styles.header, { height: "15%" }]}>
//             <Header navigation={navigation} />
//           </View>

//           <View style={styles.searchBar}>
//             <SearchBar />
//           </View>
//           <View style={styles.middlepart}>
//             <DoctorAppointmentData navigation={navigation} />
//           </View>
//         </View>
//       )}
//       <PromoModal isVisible={showPromo} onClose={() => setShowPromo(false)} />
//     </>
//   );
// };

// const windowWidth = Dimensions.get("window").width;

// const styles = StyleSheet.create({
//   webContainer: {
//     flex: 1,
//     flexDirection: "row",
//     height: "100%",
//     width: "100%",
//   },
//   // App design start
//   appContainer: {
//     flex: 1,
//     flexDirection: "column",
//     hieght: "100%",
//     width: "100%",
//     backgroundColor: "#fff",
//   },
//   searchBar: {
//     marginTop: "4%",
//   },

//   imageContainer: {
//     height: "100%",
//     width: "100%",
//   },
//   imageBackground: {
//     flex: 1,
//     height: "100%",
//     width: "100%",
//     borderWidth: 1,
//     opacity: 1,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   parent: {
//     flexDirection: "row",
//     height: "100%",
//     width: "100%",
//   },
//   Left: {
//     height: "100%",
//     width: "15%",
//   },
//   Right: {
//     height: "100%",
//     flex: 1,
//   },
//   header: {
//     // borderWidth: 5,
//     // borderColor: "black",
//     zIndex: 2,
//     ...Platform.select({
//       web: {
//         width: "100%",
//       },
//     }),
//   },
//   contentContainer: {
//     ...Platform.select({
//       web: {
//         marginTop: 10,
//         height: "75%",
//         backgroundColor: "white",
//         marginLeft: "3%",
//         borderRadius: 10,
//         overflow: "hidden",
//         paddingBottom: 20,
//         width: "93%",
//         // position: "relative",
//         // top: -80,
//       },
//     }),
//   },
//   searchSection: {
//     padding: 20,
//   },
//   mainHeading: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 10,
//   },
//   locationContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   detectLocationButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 25,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: "white",
//   },
//   detectLocationText: {
//     marginLeft: 5,
//     color: "#333",
//   },
//   orText: {
//     marginHorizontal: 15,
//     color: "#666",
//   },
//   locationInputContainer: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 25,
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     backgroundColor: "white",
//   },
//   locationInput: {
//     flex: 1,
//     marginLeft: 5,
//     color: "#333",
//     height: 40,
//   },
//   locationFoundText: {
//     fontSize: 14,
//     color: "#4CAF50",
//     marginBottom: 10,
//   },

//   categoryBox: {
//     width: "20%",
//     marginVertical: "1%",
//     flexDirection: "column",
//   },

//   filterButton: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     paddingVertical: "1.5%",
//     paddingHorizontal: "2%",
//     borderRadius: 6,
//     backgroundColor: "#fff",
//     zIndex: 1000,
//   },

//   // dropdownOverlayWrapper: {
//   //   position: "absolute",
//   //   top: 80, // adjust to match your filterButton height
//   //   left: 0,
//   //   right: 0, // full width over doctor list
//   //   backgroundColor: "#fff",
//   //   borderWidth: 1,
//   //   borderColor: "#ccc",
//   //   borderRadius: 6,
//   //   zIndex: 9999, // ensure it overlays doctor list
//   //   maxHeight: 200, // scrollable height
//   //   overflow: "hidden",
//   //   width: "25%",
//   // },
//   // dropdownOverlayWrapper: {
//   //   position: "absolute",
//   //   top: 50, // adjust based on where your category button is
//   //   left: "0%", // aligned with button
//   //   width: "20%", // match categoryBox width
//   //   backgroundColor: "#fff",
//   //   borderWidth: 1,
//   //   borderColor: "#ccc",
//   //   borderRadius: 6,
//   //   zIndex: 9999,
//   //   elevation: 10, // for Android
//   //   maxHeight: 200,
//   // },
//   // modalBackdrop: {
//   //   flex: 1,
//   //   backgroundColor: "transparent", // don't block background
//   //   justifyContent: "flex-start",
//   //   alignItems: "flex-start",
//   // },

//   // dropdownOverlayWrapper: {
//   //   marginTop: 100, // adjust so it shows below your category button
//   //   marginLeft: "2%",
//   //   width: "20%",
//   //   backgroundColor: "#fff",
//   //   borderWidth: 1,
//   //   borderColor: "#ccc",
//   //   borderRadius: 6,
//   //   maxHeight: 200,
//   //   zIndex: 9999,
//   //   elevation: 10,
//   // },
//   dropdownWrapper: {
//     position: "absolute",
//     top: 60, // adjust so it aligns below categoryBox
//     left: "5%",
//     right: 0,
//     zIndex: 9999,
//     elevation: 10,
//   },

//   backdrop: {
//     ...StyleSheet.absoluteFillObject, // covers full screen
//   },

//   dropdownOverlayWrapper: {
//     width: "40%", // match category box width
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     maxHeight: 200,
//     alignSelf: "flex-start",
//   },

//   dropdownItems: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   dropdownItemsText: {
//     fontSize: 16,
//     color: "#333",
//   },

//   searchResultText: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 10,
//   },
//   middlepart: {
//     flex: 1,
//     //borderWidth: 1,
//     height: "10%",
//     width: "98%",
//     marginVertical: "5%",
//     alignSelf: "center",
//     paddingHorizontal: "2%",
//     ...Platform.select({
//       web: {
//         width: "90%",
//         // height: windowWidth>1000 ? "90%"  : "10%",
//         flex: 1,
//         marginHorizontal: "5%",
//         borderWidth: 0,
//         borderRadius: 0,
//         borderColor: "transparent",
//         overflow: "visible",
//         marginVertical: 0,
//       },
//     }),
//   },
//   center: {
//     marginHorizontal: "2%",
//     marginTop: "3%",
//     padding: "1.2%",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     width: "80%",
//     height: "12%",
//     flexDirection: "row",
//     zIndex: 10,
//   },
//   center_textbar: {
//     height: "200%",
//     width: "40%",
//     marginRight: "11.5%",
//     marginVertical: "2%",
//     flexDirection: "column",
//   },
//   centerText: {
//     fontWeight: 500,
//     fontSize: 42,
//     fontFamily: "Inter",
//     color: "white",
//     paddingTop: "1%",
//   },
//   lowertext: {
//     color: "#FFFFFF",
//     paddingLeft: "3%",
//   },
//   search_bar: {
//     flexDirection: "row",
//     height: 40,
//     width: 250,
//     borderWidth: 1,
//     borderColor: "#aaa",
//     right: 60,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     alignItems: "center",
//   },
//   searchInput: {
//     flex: 1,
//     alignItems: "flex-end",
//     color: "#FFF",
//     ...Platform.select({
//       web: {
//         outlineStyle: "none",
//         borderWidth: 0,
//       },
//     }),
//   },
//   chatIcon: {
//     width: 20,
//     height: 20,
//     marginLeft: 0,
//   },
//   notification: {
//     height: 22,
//     width: 22,
//     borderColor: "#fff",
//     marginLeft: "3%",
//   },
//   bellIcon: {
//     height: 22,
//     width: 22,
//   },
//   profileContainer: {
//     height: "130%",
//     width: "10%",
//     borderColor: "#fff",
//     marginLeft: "6%",
//   },
//   profileHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     borderRadius: 8,
//   },
//   profileIcon: {
//     width: 40,
//     height: 45,
//     marginRight: 10,
//     bottom: 8,
//     borderRadius: 20,
//   },
//   dropdownMenu: {
//     marginTop: 2,
//     backgroundColor: "#f8f8ff",
//     borderRadius: 8,
//     padding: 6,
//     width: 150,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   dropdownItem: {
//     paddingVertical: 1,
//   },
//   dropdownText: {
//     color: "#000000",
//     fontSize: 14,
//   },
//   blurView: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0, 0, 0, 0.3)",
//   },
//   hospitalSection: {
//     width: "40%",
//     height: "100%",
//   },
//   hospitalProfile: {
//     height: "62%",
//     width: "100%",
//     borderColor: "#fff",
//     marginLeft: "1%",
//     marginTop: "1%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   hospital: {
//     height: "100%",
//     width: "30%",
//     borderColor: "#FFFFFF",
//     flexDirection: "column",
//   },
//   hospitalImage: {
//     height: "60%",
//     width: "100%",
//     borderRadius: 15,
//     resizeMode: "cover",
//   },
//   hospitalRating: {
//     color: "#fff",
//     fontWeight: 300,
//     fontSize: 18,
//     fontFamily: "Poppins",
//     marginVertical: "4%",
//     marginHorizontal: "27%",
//   },
//   hospitalDetails: {
//     height: "100%",
//     width: "100%",
//     borderColor: "#FFFFFF",
//   },
//   hospitalName: {
//     color: "#fff",
//     marginLeft: "36%",
//     fontWeight: 300,
//     fontSize: 20,
//     fontFamily: "Poppins",
//     marginVertical: "2%",
//     width: "60%",
//     marginRight: "65%",
//     alignSelf: "center",
//   },
//   specialist: {
//     color: "#fff",
//     fontWeight: 300,
//     fontSize: 20,
//     fontFamily: "Poppins",
//     marginLeft: "5%",
//     marginVertical: "1%",
//   },
//   workingExperience: {
//     color: "#fff",
//     fontWeight: 300,
//     fontSize: 20,
//     fontFamily: "Poppins",
//     marginLeft: "5%",
//     marginVertical: "1%",
//   },
//   appointmentButton: {
//     height: "15%",
//     width: "60%",
//     borderWidth: 1,
//     borderColor: "#ff6347",
//     backgroundColor: "#FF7072",
//     left: "1%",
//     borderRadius: 15,
//   },
//   appointmentButtonText: {
//     color: "#fff",
//     fontWeight: 300,
//     fontSize: 22,
//     fontFamily: "Poppins",
//     textAlign: "center",
//     top: "24%",
//   },
//   paymentSection: {
//     height: "100%",
//     width: "35%",
//     flexDirection: "column",
//     marginTop: 10,
//   },
//   paymentMethods: {
//     height: "70%",
//     width: "83%",
//     borderColor: "#fff",
//     paddingTop: "1%",
//     flexDirection: "row",
//     alignSelf: "center",
//   },
//   paymentOption: {
//     height: "20%",
//     width: "31%",
//     padding: "5%",
//     borderColor: "#ccc",
//     marginHorizontal: 5,
//     backgroundColor: "#fff",
//     textAlign: "left",
//     borderRadius: 4,
//     marginLeft: "1%",
//   },
//   paymentText: {
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   selectedOption: {
//     borderColor: "#007BFF",
//   },
//   inputContainer: {
//     width: "81%",
//     padding: 15,
//     borderRadius: 10,
//     elevation: 5,
//     marginLeft: "12.5%",
//     marginVertical: "-42%",
//     borderColor: "#00ffff",
//     marginTop: "-100%",
//   },
//   inputBox: {
//     marginBottom: "1%",
//     right: "5%",
//   },
//   input: {
//     borderColor: "#000000",
//     padding: "3%",
//     borderWidth: 1,
//     borderRadius: 4,
//     backgroundColor: "#fff",
//     width: "auto",
//     paddingTop: "2%",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     height: "38%",
//     right: "6%",
//     gap: 8,
//     padding: "1.5%",
//   },
//   half: {
//     width: "60%",
//     padding: "3%",
//   },
//   booknowButton: {
//     height: "30%",
//     width: "80%",
//     borderWidth: 1,
//     borderRadius: 15,
//     borderColor: "#ff6347",
//     backgroundColor: "#FF7072",
//     justifyContent: "center",
//     marginTop: 10,
//     marginLeft: "5%",
//     paddingHorizontal: 5,
//   },
//   booknowButtonText: {
//     color: "#fff",
//     fontWeight: 300,
//     fontSize: 20,
//     fontFamily: "Poppins",
//     textAlign: "center",
//   },
//   boxAds: {
//     width: "25%",
//     borderWidth: 25,
//     borderColor: "#F4B442",
//     borderTopRightRadius: 18,
//     borderBottomRightRadius: 18,
//     backgroundColor: "#F4B442",
//   },
//   adsText: {
//     fontWeight: 500,
//     fontSize: 25,
//     fontFamily: "Poppins",
//   },
// });

// export default DoctorResultShow;

import React, { useCallback, useState, useEffect } from "react";
import {
  Alert,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useChatbot } from "../../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import SideBarNavigation from "../../../components/PatientScreenComponents/SideBarNavigation";
import Header from "../../../components/PatientScreenComponents/Header";
import SearchBar from "../../../components/PatientScreenComponents/SearchBar";
import DoctorAppointmentData from "../../../components/PatientScreenComponents/DoctorComponents/DoctorsAppointmentData";
import PromoModal from "../../../components/PatientScreenComponents/PromoModal";

// Create a platform-specific location implementation
const GetLocationPolyfill = {
  getCurrentPosition: (options) => {
    // For web, use the browser's Geolocation API
    if (Platform.OS === "web") {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude || 0,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed || 0,
                time: position.timestamp,
              });
            },
            (error) => {
              reject({
                code: error.code,
                message: error.message,
              });
            },
            options
          );
        } else {
          reject({
            code: "UNAVAILABLE",
            message: "Geolocation not available on this browser",
          });
        }
      });
    } else {
      // For native platforms, we would import the actual module
      // This will never run in web bundling
      console.warn("Native GetLocation used in non-native environment");
      return Promise.reject({
        code: "PLATFORM_NOT_SUPPORTED",
        message: "Platform not supported",
      });
    }
  },
};

// Helper function to determine if an error is a location error
const isLocationError = (error) => {
  return (
    error && typeof error.code === "string" && typeof error.message === "string"
  );
};

const DoctorResultShow = ({ navigation, route }) => {
  const [locationInput, setLocationInput] = useState("");
  const { setChatbotConfig } = useChatbot();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const [showPromo, setShowPromo] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const categories = [
    { label: "Select", value: "" },
    { label: "Cardiac Wellness", value: "cardio" },
    { label: "Reproductive Wellness", value: "gyano" },
  ];
  const [selectedCategory, setSelectedCategory] = useState({
    label: "Select",
    value: "",
  });

  useEffect(() => {
    let timeoutId;

    if (Platform.OS !== "web") {
      timeoutId = setTimeout(() => {
        setShowPromo(true);
      }, 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reset chatbot height when this screen is focused
      setChatbotConfig({ height: "50%" });
    }, [])
  );

  const requestLocation = () => {
    setLoading(true);
    setLocation(null);
    setError(null);

    GetLocationPolyfill.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
    })
      .then((newLocation) => {
        setLoading(false);
        setLocation(newLocation);
        Alert.alert(
          "Location detected",
          `Lat: ${newLocation.latitude.toFixed(
            4
          )}, Lng: ${newLocation.longitude.toFixed(4)}`
        );
      })
      .catch((ex) => {
        if (isLocationError(ex)) {
          const { code, message } = ex;
          console.warn(code, message);
          setError(code);
          Alert.alert("Location Error", `Could not get location: ${message}`);
        } else {
          console.warn(ex);
          Alert.alert(
            "Error",
            "An unknown error occurred while getting location"
          );
        }
        setLoading(false);
        setLocation(null);
      });
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require("../../../assets/Images/MedicineBackground.png")}
              style={styles.imageBackground}
            >
              <View
                style={[
                  styles.overlay,
                  { backgroundColor: "rgba(16, 16, 16, 0.3)" },
                ]}
              />

              <View style={styles.parent}>
                <View style={styles.Left}>
                  <SideBarNavigation navigation={navigation} />
                </View>
                <View style={styles.Right}>
                  <View style={styles.header}>
                    <Header navigation={navigation} />
                  </View>

                  <View style={styles.contentContainer}>
                    <View style={styles.searchSection}>
                      <Text style={styles.mainHeading}>
                        Let me find the best doctor for you !!
                      </Text>

                      <View style={styles.locationContainer}>
                        <TouchableOpacity
                          style={styles.detectLocationButton}
                          onPress={requestLocation}
                        >
                          <MaterialIcons
                            name="my-location"
                            size={18}
                            color="#333"
                          />
                          <Text style={styles.detectLocationText}>
                            {loading
                              ? "Detecting..."
                              : "Detect Current Location"}
                          </Text>
                        </TouchableOpacity>

                        <Text style={styles.orText}>Or</Text>

                        <View style={styles.locationInputContainer}>
                          <MaterialIcons
                            name="location-on"
                            size={18}
                            color="#333"
                          />
                          <TextInput
                            style={styles.locationInput}
                            placeholder="Enter Location"
                            placeholderTextColor="#666"
                            value={locationInput}
                            onChangeText={setLocationInput}
                          />
                        </View>
                      </View>

                      {location && (
                        <Text style={styles.locationFoundText}>
                          Location: {location.latitude.toFixed(4)},{" "}
                          {location.longitude.toFixed(4)}
                        </Text>
                      )}

                      {/* Category dropdown */}
                      <View style={styles.categoryBox}>
                        <TouchableOpacity
                          style={styles.filterButton}
                          onPress={() => setShowDropdown(!showDropdown)}
                        >
                          <Text style={styles.filterButtonText}>
                            {selectedCategory.label}
                          </Text>
                          <MaterialIcons
                            name={
                              showDropdown
                                ? "keyboard-arrow-up"
                                : "keyboard-arrow-down"
                            }
                            size={20}
                            color="#333"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.middlepart}>
                      <DoctorAppointmentData
                        navigation={navigation}
                        selectedCategory={selectedCategory}
                        priorityDoctors={[
                          "Dr. Kisley Shrivastav",
                          "Dr. Arpita",
                        ]}
                      />
                    </View>

                    {/* Dropdown overlay modal */}
                    <Modal
                      transparent
                      visible={showDropdown}
                      animationType="fade"
                      onRequestClose={() => setShowDropdown(false)}
                    >
                      <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowDropdown(false)}
                      >
                        <View style={styles.dropdownOverlayWrapper}>
                          <ScrollView style={styles.dropdownScrollView}>
                            {categories.map((cat, idx) => (
                              <TouchableOpacity
                                key={idx}
                                style={styles.dropdownItems}
                                onPress={() => {
                                  setSelectedCategory(cat);
                                  setShowDropdown(false);
                                }}
                              >
                                <Text style={styles.dropdownItemsText}>
                                  {cat.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}
      {/* {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.appContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={[styles.header, { height: "15%" }]}>
            <Header navigation={navigation} />
          </View>

          <View style={styles.searchBar}>
            <SearchBar />
          </View>
          <View style={styles.middlepart}>
            <DoctorAppointmentData navigation={navigation} />
          </View>
        </View>
      )} */}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.appContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={[styles.header, { height: "15%" }]}>
            <Header navigation={navigation} />
          </View>

          {/* Search and Category Section */}
          <View style={styles.searchSectionApp}>
            <View style={styles.searchBar}>
              <SearchBar />
            </View>

            {/* Category Dropdown for App */}
            <View style={styles.categoryBox}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={styles.filterButtonText}>
                  {selectedCategory.label}
                </Text>
                <MaterialIcons
                  name={
                    showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"
                  }
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Doctor List */}
          <View style={styles.middlepart}>
            <DoctorAppointmentData
              navigation={navigation}
              selectedCategory={selectedCategory}
              priorityDoctors={["Dr. Kisley Shrivastav", "Dr. Arpita"]}
            />
          </View>

          {/* Category Dropdown Modal (same as web) */}
          <Modal
            transparent
            visible={showDropdown}
            animationType="fade"
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowDropdown(false)}
            >
              <View style={styles.dropdownOverlayWrapper}>
                <ScrollView style={styles.dropdownScrollView}>
                  {categories.map((cat, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dropdownItems}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemsText}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      )}

      <PromoModal isVisible={showPromo} onClose={() => setShowPromo(false)} />
    </>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  // App design start
  appContainer: {
    flex: 1,
    flexDirection: "column",
    height: "100%", // Fixed typo: hieght -> height
    width: "100%",
    backgroundColor: "#fff",
  },
  searchBar: {
    marginTop: "2%",
  },

  imageContainer: {
    height: "100%",
    width: "100%",
  },
  imageBackground: {
    flex: 1,
    height: "100%",
    width: "100%",
    borderWidth: 1,
    opacity: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  Left: {
    height: "100%",
    width: "15%",
  },
  Right: {
    height: "85%",
    flex: 1,
  },
  header: {
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  contentContainer: {
    ...Platform.select({
      web: {
        marginTop: 10,
        flex: 1, // Changed from fixed height to flex
        backgroundColor: "white",
        marginLeft: "3%",
        borderRadius: 10,
        overflow: "hidden",
        width: "93%",
        display: "flex",
        flexDirection: "column",
      },
    }),
  },
  searchSection: {
    padding: 20,
    flexShrink: 0, // Prevent shrinking
  },
  searchSectionApp: {
    flexDirection: "column",
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detectLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  detectLocationText: {
    marginLeft: 5,
    color: "#333",
  },
  orText: {
    marginHorizontal: 15,
    color: "#666",
  },
  locationInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  locationInput: {
    flex: 1,
    marginLeft: 5,
    color: "#333",
    height: 40,
  },
  locationFoundText: {
    fontSize: 14,
    color: "#4CAF50",
    marginBottom: 10,
  },
  categoryBox: {
    width: "40%",
    marginVertical: "3%",
    flexDirection: "column",
    //borderWidth:1,
    //height:"20%",
    marginHorizontal: "4%",
    ...Platform.select({
      web: {
        width: "20%",
        marginVertical: "1%",
        flexDirection: "column",
        marginHorizontal:"0%"
      },
    }),
  },
  filterButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: "1.5%",
    paddingHorizontal: "2%",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  filterButtonText: {
    fontSize: 16,
    color: "#333",
  },

  // Modal dropdown styles
  modalBackdrop: {
    flex: 1,
    //backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: "15%", // Adjust based on your layout
    paddingLeft: "5%", // Align with category button
    marginHorizontal: "0%",
    marginVertical:"40%",
    width:"70%",
    ...Platform.select({
      web: {
        flex: 1,
        //backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingTop: "15%", // Adjust based on your layout
        paddingLeft: "5%", // Align with category button
        marginHorizontal: "14%",
        marginVertical:"0%"
      },
    }),
  },
  dropdownOverlayWrapper: {
    width: "80%", // Match category box width
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    maxHeight: 200,
    marginTop: "1%",
    ...Platform.select({
      web: {
        width: "20%", // Match category box width
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        maxHeight: 200,
        marginTop: "1%",
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
      },
    }),
  },
  dropdownScrollView: {
    flexGrow: 0,
  },
  dropdownItems: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#8e8b8bff",
  },
  dropdownItemsText: {
    fontSize: 15,
    color: "#0a0a0aff",
  },

  // Updated middlepart styles for scrolling
  middlepart: {
    flex: 1, // Takes remaining space
    width: "100%",
    paddingHorizontal: "2%",
    ...Platform.select({
      web: {
        flex: 1, // Ensures it takes remaining space
        overflow: "hidden", // Contains scroll within bounds
      },
    }),
  },

  // Keep existing styles below...
  center: {
    marginHorizontal: "2%",
    marginTop: "3%",
    padding: "1.2%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "80%",
    height: "12%",
    flexDirection: "row",
    zIndex: 10,
  },
  center_textbar: {
    height: "200%",
    width: "40%",
    marginRight: "11.5%",
    marginVertical: "2%",
    flexDirection: "column",
  },
  centerText: {
    fontWeight: 500,
    fontSize: 42,
    fontFamily: "Inter",
    color: "white",
    paddingTop: "1%",
  },
  lowertext: {
    color: "#FFFFFF",
    paddingLeft: "3%",
  },
  search_bar: {
    flexDirection: "row",
    height: 40,
    width: 250,
    borderWidth: 1,
    borderColor: "#aaa",
    right: 60,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    alignItems: "flex-end",
    color: "#FFF",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        borderWidth: 0,
      },
    }),
  },
  chatIcon: {
    width: 20,
    height: 20,
    marginLeft: 0,
  },
  notification: {
    height: 22,
    width: 22,
    borderColor: "#fff",
    marginLeft: "3%",
  },
  bellIcon: {
    height: 22,
    width: 22,
  },
  profileContainer: {
    height: "130%",
    width: "10%",
    borderColor: "#fff",
    marginLeft: "6%",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  profileIcon: {
    width: 40,
    height: 45,
    marginRight: 10,
    bottom: 8,
    borderRadius: 20,
  },
  dropdownMenu: {
    marginTop: 2,
    backgroundColor: "#f8f8ff",
    borderRadius: 8,
    padding: 6,
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  dropdownItem: {
    paddingVertical: 1,
  },
  dropdownText: {
    color: "#000000",
    fontSize: 14,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  hospitalSection: {
    width: "40%",
    height: "100%",
  },
  hospitalProfile: {
    height: "62%",
    width: "100%",
    borderColor: "#fff",
    marginLeft: "1%",
    marginTop: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hospital: {
    height: "100%",
    width: "30%",
    borderColor: "#FFFFFF",
    flexDirection: "column",
  },
  hospitalImage: {
    height: "60%",
    width: "100%",
    borderRadius: 15,
    resizeMode: "cover",
  },
  hospitalRating: {
    color: "#fff",
    fontWeight: 300,
    fontSize: 18,
    fontFamily: "Poppins",
    marginVertical: "4%",
    marginHorizontal: "27%",
  },
  hospitalDetails: {
    height: "100%",
    width: "100%",
    borderColor: "#FFFFFF",
  },
  hospitalName: {
    color: "#fff",
    marginLeft: "36%",
    fontWeight: 300,
    fontSize: 20,
    fontFamily: "Poppins",
    marginVertical: "2%",
    width: "60%",
    marginRight: "65%",
    alignSelf: "center",
  },
  specialist: {
    color: "#fff",
    fontWeight: 300,
    fontSize: 20,
    fontFamily: "Poppins",
    marginLeft: "5%",
    marginVertical: "1%",
  },
  workingExperience: {
    color: "#fff",
    fontWeight: 300,
    fontSize: 20,
    fontFamily: "Poppins",
    marginLeft: "5%",
    marginVertical: "1%",
  },
  appointmentButton: {
    height: "15%",
    width: "60%",
    borderWidth: 1,
    borderColor: "#ff6347",
    backgroundColor: "#FF7072",
    left: "1%",
    borderRadius: 15,
  },
  appointmentButtonText: {
    color: "#fff",
    fontWeight: 300,
    fontSize: 22,
    fontFamily: "Poppins",
    textAlign: "center",
    top: "24%",
  },
  paymentSection: {
    height: "100%",
    width: "35%",
    flexDirection: "column",
    marginTop: 10,
  },
  paymentMethods: {
    height: "70%",
    width: "83%",
    borderColor: "#fff",
    paddingTop: "1%",
    flexDirection: "row",
    alignSelf: "center",
  },
  paymentOption: {
    height: "20%",
    width: "31%",
    padding: "5%",
    borderColor: "#ccc",
    marginHorizontal: 5,
    backgroundColor: "#fff",
    textAlign: "left",
    borderRadius: 4,
    marginLeft: "1%",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedOption: {
    borderColor: "#007BFF",
  },
  inputContainer: {
    width: "81%",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    marginLeft: "12.5%",
    marginVertical: "-42%",
    borderColor: "#00ffff",
    marginTop: "-100%",
  },
  inputBox: {
    marginBottom: "1%",
    right: "5%",
  },
  input: {
    borderColor: "#000000",
    padding: "3%",
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "#fff",
    width: "auto",
    paddingTop: "2%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "38%",
    right: "6%",
    gap: 8,
    padding: "1.5%",
  },
  half: {
    width: "60%",
    padding: "3%",
  },
  booknowButton: {
    height: "30%",
    width: "80%",
    borderWidth: 1,
    borderRadius: 15,
    borderColor: "#ff6347",
    backgroundColor: "#FF7072",
    justifyContent: "center",
    marginTop: 10,
    marginLeft: "5%",
    paddingHorizontal: 5,
  },
  booknowButtonText: {
    color: "#fff",
    fontWeight: 300,
    fontSize: 20,
    fontFamily: "Poppins",
    textAlign: "center",
  },
  boxAds: {
    width: "25%",
    borderWidth: 25,
    borderColor: "#F4B442",
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "#F4B442",
  },
  adsText: {
    fontWeight: 500,
    fontSize: 25,
    fontFamily: "Poppins",
  },
});

export default DoctorResultShow;
