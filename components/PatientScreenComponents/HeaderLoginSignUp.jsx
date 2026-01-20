// import React, { useState, useRef, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   Animated,
//   StyleSheet,
//   Platform,
//   Dimensions,
//   Image,
//   Pressable,
// } from "react-native";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
// import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
// import { useLoginModal } from "../../contexts/LoginModalContext";
// import { useAuth } from "../../contexts/AuthContext";
// import PatientAuthModal from "../Auth/PatientAuthModal";
// import DoctorSignupModal from "../Auth/DoctorSignupModal";
// import mixpanel from "../../utils/Mixpanel";

// const defaultAvatar = require("../../assets/Images/user-icon.jpg");

// const HeaderLoginSignUp = ({ isDoctorPortal = false, user: userOverride }) => {
//   const navigation = useNavigation();
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const [isHovered, setIsHovered] = useState(false);
//   const [dropdownVisible, setDropdownVisible] = useState(false);
//   const [isSideBarVisible, setIsSideBarVisible] = useState(false);
//   const [authModalVisible, setAuthModalVisible] = useState(false);
//   const [authModalMode, setAuthModalMode] = useState("signup");
//   const [doctorModalVisible, setDoctorModalVisible] = useState(false);
//   const { registerOpenModal } = useLoginModal();
//   // const { user: contextUser, logout } = useAuth();
//   const { user: contextUser, role, logout } = useAuth();
//   const user = userOverride ?? contextUser;
//   const resolvedIsDoctorPortal = isDoctorPortal || role === "doctor";
//   console.log("resolvedIsDoctorPortal:", resolvedIsDoctorPortal);

//   const displayName = user?.name || user?.fullName || user?.username || "User";
//   const displayEmail = user?.email || user?.emailId || "";
//   const avatarUri =
//     user?.picture ||
//     user?.avatar ||
//     user?.avatarUrl ||
//     user?.profileImage ||
//     user?.image ||
//     user?.photoUrl;
//   const avatarSource =
//     avatarUri && typeof avatarUri === "string"
//       ? { uri: avatarUri }
//       : defaultAvatar;

//   const isApp = Platform.OS === "ios" || Platform.OS === "android";
//   const isSmallScreen =
//     Platform.OS === "web" && Dimensions.get("window").width <= 820;
//   const isMobile = isApp || isSmallScreen;

//   const openAuthModal = useCallback((mode = "signup") => {
//     setAuthModalMode(mode);
//     setAuthModalVisible(true);
//   }, []);

//   const closeAuthModal = () => {
//     setAuthModalVisible(false);
//   };

//   useEffect(() => {
//     registerOpenModal(({ mode = "signup" } = {}) => {
//       openAuthModal(mode);
//     });
//   }, [registerOpenModal, openAuthModal]);

//   const onHoverIn = () => {
//     setIsHovered(true);
//     Animated.spring(scaleAnim, {
//       toValue: 0.96,
//       friction: 5,
//       useNativeDriver: true,
//     }).start();
//   };

//   const onHoverOut = () => {
//     setIsHovered(false);
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       friction: 5,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleProfile = () => {
//     setDropdownVisible(false);
//     // TODO: Navigate to user profile page
//     // navigation.navigate("UserProfile");
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       setDropdownVisible(false);
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const handleDoctorRegister = () => {
//     setDoctorModalVisible(true);
//   };

//   const goToDoctorPortal = () => {
//     navigation.reset({
//       index: 0,
//       routes: [
//         {
//           name: "DoctorAppNavigation",
//           params: {
//             screen: "DoctorPortalLandingPage",
//           },
//         },
//       ],
//     });
//   };

//   const goToPatientPortal = () => {
//     navigation.reset({
//       index: 0,
//       routes: [
//         {
//           name: "PatientAppNavigation",
//           params: {
//             screen: "LandingPage",
//           },
//         },
//       ],
//     });
//   };

//   return (
//     <>
//       {isMobile ? (
//         <View style={styles.appHeaderContainer}>
//           <Modal
//             visible={isSideBarVisible}
//             transparent
//             onRequestClose={() => setIsSideBarVisible(false)}
//           >
//             <View style={styles.modalContainer}>
//               <View style={styles.mobileSidebar}>
//                 {resolvedIsDoctorPortal ? (
//                   <NewestSidebar
//                     navigation={navigation}
//                     closeSidebar={() => setIsSideBarVisible(false)}
//                   />
//                 ) : (
//                   <SideBarNavigation
//                     navigation={navigation}
//                     closeSidebar={() => setIsSideBarVisible(false)}
//                   />
//                 )}
//               </View>
//               <Pressable
//                 style={styles.overlay}
//                 onPress={() => setIsSideBarVisible(false)}
//               />
//             </View>
//           </Modal>

//           <View style={styles.appHeader}>
//             <View style={styles.logo}>
//               <Pressable
//                 style={styles.hamburger}
//                 onPress={() => setIsSideBarVisible(true)}
//               >
//                 <MaterialIcons name="menu" size={30} color="black" />
//               </Pressable>
//               <Image
//                 source={require("../../assets/Icons/kokoro.png")}
//                 style={{ height: 30, width: 30 }}
//               />
//               <Text style={styles.appName}>Kokoro.Doctor</Text>
//             </View>

//             <View style={styles.authButtonsApp}>
//               <View style={{ position: "relative" }}>
//                 <Pressable
//                   style={styles.authButtonBox}
//                   onPress={() => setDropdownVisible(!dropdownVisible)}
//                 >
//                   <Image source={avatarSource} style={styles.avatarSmall} />
//                 </Pressable>

//                 {dropdownVisible && (
//                   <View style={styles.dropdownMain}>
//                     {user ? (
//                       <>
//                         <TouchableOpacity
//                           onPress={handleProfile}
//                           style={styles.dropdownItem}
//                         >
//                           <MaterialIcons
//                             name="person"
//                             size={18}
//                             color="#111827"
//                             style={{ marginRight: 8 }}
//                           />
//                           <Text style={styles.dropdownText}>User Profile</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={handleLogout}
//                           style={styles.logoutButton}
//                         >
//                           <Text style={styles.logoutButtonText}>Logout</Text>
//                         </TouchableOpacity>
//                       </>
//                     ) : (
//                       // <TouchableOpacity
//                       //   activeOpacity={0.7}
//                       //   style={styles.dropdownItem}
//                       //   onPress={() => {
//                       //     setDropdownVisible(false);
//                       //     openAuthModal("login");
//                       //   }}
//                       // >
//                       //   <Text style={styles.dropdownText}>Login / Signup</Text>
//                       // </TouchableOpacity>
//                       <Pressable
//                         // onPress={() => {
//                         //   setDropdownVisible(false);
//                         //   openAuthModal("signup");
//                         // }}
//                         onPress={() => {
//                           mixpanel.track("Auth CTA Clicked", {
//                             source: "Header",
//                             platform: Platform.OS,
//                             cta_text: "Login / Signup",
//                             user_state: user ? "logged_in" : "anonymous",
//                           });
//                           setDropdownVisible(false);
//                           openAuthModal("signup");
//                         }}
//                         style={({ pressed }) => [
//                           styles.dropdownItem,
//                           pressed && { backgroundColor: "#F3F4F6" },
//                         ]}
//                       >
//                         <Text style={styles.dropdownText}>Login / Signup</Text>
//                       </Pressable>
//                     )}
//                   </View>
//                 )}
//               </View>

//               {/* <Pressable
//                 onPress={() => {
//                   navigation.navigate("DoctorAppNavigation", {
//                     screen: "DoctorPortalLandingPage",
//                   });
//                 }}
//               >
//                 <Image
//                   source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                   style={{ height: 40, width: 80 }}
//                 />
//               </Pressable> */}
//               {!resolvedIsDoctorPortal && (
//                 <Pressable onPress={goToDoctorPortal}>
//                   <Image
//                     source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                     style={{ height: 40, width: 80 }}
//                   />
//                 </Pressable>
//               )}

//               {resolvedIsDoctorPortal && (
//                 <Pressable
//                   style={styles.portalSwitchBox}
//                   onPress={goToPatientPortal}
//                 >
//                   <Text style={styles.portalSwitchText}>Patient Portal</Text>
//                 </Pressable>
//               )}
//             </View>
//           </View>

//           {/* {!resolvedIsDoctorPortal && (
//             <View style={styles.usernameApp}>
//               <Text style={{ fontWeight: "600", fontSize: 19 }}>Welcome,</Text>
//               <Text
//                 style={{
//                   fontWeight: "800",
//                   color: "#000",
//                   fontSize: 19,
//                 }}
//               >
//                 {" "}
//                 {displayName}!
//               </Text>
//             </View>
//           )} */}
//           <View style={styles.usernameApp}>
//             <Text style={{ fontWeight: "600", fontSize: 19 }}>Welcome,</Text>
//             <Text
//               style={{
//                 fontWeight: "800",
//                 color: "#000",
//                 fontSize: 19,
//               }}
//             >
//               {user
//                 ? `${resolvedIsDoctorPortal ? " " : " "}${displayName}!`
//                 : " User!"}
//             </Text>
//           </View>
//         </View>
//       ) : user ? (
//         <View style={styles.webHeaderShell}>
//           <Text style={styles.webWelcome}>
//             Welcome, <Text style={styles.webWelcomeName}>{displayName}</Text>
//           </Text>
//           <View style={styles.webProfileSection}>
//             <TouchableOpacity
//               style={styles.webProfileButton}
//               onPress={() => setDropdownVisible(!dropdownVisible)}
//             >
//               <Image source={avatarSource} style={styles.avatar} />
//             </TouchableOpacity>
//             {dropdownVisible && (
//               <>
//                 <Pressable
//                   style={styles.dropdownOverlay}
//                   onPress={() => setDropdownVisible(false)}
//                 />
//                 <View style={styles.webDropdownMenu}>
//                   <TouchableOpacity
//                     onPress={handleProfile}
//                     style={styles.dropdownAction}
//                   >
//                     <MaterialIcons name="person" size={18} color="#111827" />
//                     <Text style={styles.dropdownActionText}>User Profile</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={handleLogout}
//                     style={styles.dropdownAction}
//                   >
//                     <MaterialIcons name="logout" size={18} color="#f96166" />
//                     <Text style={styles.dropdownActionText}>Logout</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </View>
//         </View>
//       ) : (
//         <Animated.View
//           style={[
//             styles.headerBtn,
//             {
//               backgroundColor: isHovered ? "#f96166" : "#fff",
//               borderColor: isHovered ? "#f96166" : "#DDD",
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//           onMouseEnter={onHoverIn}
//           onMouseLeave={onHoverOut}
//         >
//           {/* <TouchableOpacity onPress={() => openAuthModal("signup")}> */}
//           <TouchableOpacity
//             onPress={() => {
//               mixpanel.track("Auth CTA Clicked", {
//                 source: "Header",
//                 platform: Platform.OS,
//                 cta_text: "Login / Signup",
//                 user_state: user ? "logged_in" : "anonymous",
//               });

//               openAuthModal("signup");
//             }}
//           >
//             <Text
//               style={[
//                 styles.headerBtnText,
//                 {
//                   color: isHovered ? "#fff" : "#333",
//                 },
//               ]}
//             >
//               Login / Signup
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       )}

//       <PatientAuthModal
//         visible={authModalVisible}
//         initialMode={authModalMode}
//         onRequestClose={closeAuthModal}
//         onDoctorRegister={handleDoctorRegister}
//       />
//       <DoctorSignupModal
//         visible={doctorModalVisible}
//         onRequestClose={() => setDoctorModalVisible(false)}
//       />
//     </>
//   );
// };

//2:---------------------####------------------------
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   Animated,
//   StyleSheet,
//   Platform,
//   Dimensions,
//   Image,
//   Pressable,
// } from "react-native";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
// import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
// import { useLoginModal } from "../../contexts/LoginModalContext";
// import { useAuth } from "../../contexts/AuthContext";
// import PatientAuthModal from "../Auth/PatientAuthModal";
// import DoctorSignupModal from "../Auth/DoctorSignupModal";
// import mixpanel from "../../utils/Mixpanel";

// const defaultAvatar = require("../../assets/Images/user-icon.jpg");

// const HeaderLoginSignUp = ({ isDoctorPortal = false, user: userOverride }) => {
//   const navigation = useNavigation();
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const [isHovered, setIsHovered] = useState(false);
//   const [dropdownVisible, setDropdownVisible] = useState(false);
//   const [isSideBarVisible, setIsSideBarVisible] = useState(false);
//   const [authModalVisible, setAuthModalVisible] = useState(false);
//   const [authModalMode, setAuthModalMode] = useState("signup");
//   const [doctorModalVisible, setDoctorModalVisible] = useState(false);
//   const { registerOpenModal } = useLoginModal();
//   const { user: contextUser, role, logout } = useAuth();
//   const user = userOverride ?? contextUser;
//   const resolvedIsDoctorPortal = isDoctorPortal || role === "doctor";

//   const displayName = user?.name || user?.fullName || user?.username || "User";
//   const displayEmail = user?.email || user?.emailId || "";
//   const avatarUri =
//     user?.picture ||
//     user?.avatar ||
//     user?.avatarUrl ||
//     user?.profileImage ||
//     user?.image ||
//     user?.photoUrl;
//   const avatarSource =
//     avatarUri && typeof avatarUri === "string"
//       ? { uri: avatarUri }
//       : defaultAvatar;

//   const isApp = Platform.OS === "ios" || Platform.OS === "android";
//   const isSmallScreen =
//     Platform.OS === "web" && Dimensions.get("window").width <= 820;
//   const isMobile = isApp || isSmallScreen;

//   const openAuthModal = useCallback((mode = "signup") => {
//     setAuthModalMode(mode);
//     setAuthModalVisible(true);
//   }, []);

//   const closeAuthModal = () => {
//     setAuthModalVisible(false);
//   };

//   useEffect(() => {
//     registerOpenModal(({ mode = "signup" } = {}) => {
//       openAuthModal(mode);
//     });
//   }, [registerOpenModal, openAuthModal]);

//   const onHoverIn = () => {
//     setIsHovered(true);
//     Animated.spring(scaleAnim, {
//       toValue: 0.96,
//       friction: 5,
//       useNativeDriver: true,
//     }).start();
//   };

//   const onHoverOut = () => {
//     setIsHovered(false);
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       friction: 5,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleProfile = () => {
//     setDropdownVisible(false);
//     // TODO: Navigate to user profile page
//     // navigation.navigate("UserProfile");
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       setDropdownVisible(false);
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const handleDoctorRegister = () => {
//     setDoctorModalVisible(true);
//   };

//   const goToDoctorPortal = () => {
//     navigation.reset({
//       index: 0,
//       routes: [
//         {
//           name: "DoctorAppNavigation",
//           params: {
//             screen: "DoctorPortalLandingPage",
//           },
//         },
//       ],
//     });
//   };

//   const goToPatientPortal = () => {
//     navigation.reset({
//       index: 0,
//       routes: [
//         {
//           name: "PatientAppNavigation",
//           params: {
//             screen: "LandingPage",
//           },
//         },
//       ],
//     });
//   };

//   return (
//     <>
//       {isMobile ? (
//         <View style={styles.appHeaderContainer}>
//           <Modal
//             visible={isSideBarVisible}
//             transparent
//             onRequestClose={() => setIsSideBarVisible(false)}
//           >
//             <View style={styles.modalContainer}>
//               <View style={styles.mobileSidebar}>
//                 {resolvedIsDoctorPortal ? (
//                   <NewestSidebar
//                     navigation={navigation}
//                     closeSidebar={() => setIsSideBarVisible(false)}
//                   />
//                 ) : (
//                   <SideBarNavigation
//                     navigation={navigation}
//                     closeSidebar={() => setIsSideBarVisible(false)}
//                   />
//                 )}
//               </View>
//               <Pressable
//                 style={styles.overlay}
//                 onPress={() => setIsSideBarVisible(false)}
//               />
//             </View>
//           </Modal>

//           <View style={styles.appHeader}>
//             <View style={styles.logo}>
//               <Pressable
//                 style={styles.hamburger}
//                 onPress={() => setIsSideBarVisible(true)}
//               >
//                 <MaterialIcons name="menu" size={30} color="black" />
//               </Pressable>
//               <Image
//                 source={require("../../assets/Icons/kokoro.png")}
//                 style={{ height: 30, width: 30 }}
//               />
//               <Text style={styles.appName}>Kokoro.Doctor</Text>
//             </View>

//             <View style={styles.authButtonsApp}>
//               <View style={{ position: "relative" }}>
//                 <Pressable
//                   style={styles.authButtonBox}
//                   onPress={() => setDropdownVisible(!dropdownVisible)}
//                 >
//                   <Image source={avatarSource} style={styles.avatarSmall} />
//                 </Pressable>

//                 {dropdownVisible && (
//                   <View style={styles.dropdownMain}>
//                     {user ? (
//                       <>
//                         <TouchableOpacity
//                           onPress={handleProfile}
//                           style={styles.dropdownItem}
//                         >
//                           <MaterialIcons
//                             name="person"
//                             size={18}
//                             color="#111827"
//                             style={{ marginRight: 8 }}
//                           />
//                           <Text style={styles.dropdownText}>User Profile</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={handleLogout}
//                           style={styles.logoutButton}
//                         >
//                           <Text style={styles.logoutButtonText}>Logout</Text>
//                         </TouchableOpacity>
//                       </>
//                     ) : (
//                       <Pressable
//                         onPress={() => {
//                           mixpanel.track("Auth CTA Clicked", {
//                             source: "Header",
//                             platform: Platform.OS,
//                             cta_text: "Login / Signup",
//                             user_state: user ? "logged_in" : "anonymous",
//                           });
//                           setDropdownVisible(false);
//                           openAuthModal("signup");
//                         }}
//                         style={({ pressed }) => [
//                           styles.dropdownItem,
//                           pressed && { backgroundColor: "#F3F4F6" },
//                         ]}
//                       >
//                         <Text style={styles.dropdownText}>Login / Signup</Text>
//                       </Pressable>
//                     )}
//                   </View>
//                 )}
//               </View>

//               {/* PORTAL TOGGLE BUTTONS FOR MOBILE */}
//               {!resolvedIsDoctorPortal && (
//                 <Pressable
//                   onPress={goToDoctorPortal}
//                   disabled={user && role === "doctor"}
//                   style={{ opacity: user && role === "doctor" ? 0.5 : 1 }}
//                 >
//                   <Image
//                     source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                     style={{ height: 40, width: 80 }}
//                   />
//                 </Pressable>
//               )}

//               {resolvedIsDoctorPortal && (
//                 <Pressable
//                   style={[
//                     styles.portalSwitchBox,
//                     { opacity: user && role === "patient" ? 0.5 : 1 },
//                   ]}
//                   onPress={goToPatientPortal}
//                   disabled={user && role === "patient"}
//                 >
//                   <Text style={styles.portalSwitchText}>Patient Portal</Text>
//                 </Pressable>
//               )}
//             </View>
//           </View>

//           <View style={styles.usernameApp}>
//             <Text style={{ fontWeight: "600", fontSize: 19 }}>Welcome,</Text>
//             <Text
//               style={{
//                 fontWeight: "800",
//                 color: "#000",
//                 fontSize: 19,
//               }}
//             >
//               {user
//                 ? `${resolvedIsDoctorPortal ? " " : " "}${displayName}!`
//                 : " User!"}
//             </Text>
//           </View>
//         </View>
//       ) : user ? (
//         // WEB VIEW - LOGGED IN
//         <View style={styles.webHeaderShell}>
//           <Text style={styles.webWelcome}>
//             Welcome, <Text style={styles.webWelcomeName}>{displayName}</Text>
//           </Text>

//           <View style={styles.webRightSection}>
//             {/* PORTAL TOGGLE BUTTONS FOR WEB - LOGGED IN */}
//             {!resolvedIsDoctorPortal && (
//               <Pressable
//                 onPress={goToDoctorPortal}
//                 disabled={role === "doctor"}
//                 style={[
//                   styles.webPortalButton,
//                   { opacity: role === "doctor" ? 0.5 : 1 },
//                 ]}
//               >
//                 <Image
//                   source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                   style={{ height: 36, width: 72 }}
//                 />
//               </Pressable>
//             )}

//             {resolvedIsDoctorPortal && (
//               <Pressable
//                 style={[
//                   styles.webPortalSwitchBox,
//                   { opacity: role === "patient" ? 0.5 : 1 },
//                 ]}
//                 onPress={goToPatientPortal}
//                 disabled={role === "patient"}
//               >
//                 <Text style={styles.webPortalSwitchText}>Patient Portal</Text>
//               </Pressable>
//             )}

//             <View style={styles.webProfileSection}>
//               <TouchableOpacity
//                 style={styles.webProfileButton}
//                 onPress={() => setDropdownVisible(!dropdownVisible)}
//               >
//                 <Image source={avatarSource} style={styles.avatar} />
//               </TouchableOpacity>
//               {dropdownVisible && (
//                 <>
//                   <Pressable
//                     style={styles.dropdownOverlay}
//                     onPress={() => setDropdownVisible(false)}
//                   />
//                   <View style={styles.webDropdownMenu}>
//                     <TouchableOpacity
//                       onPress={handleProfile}
//                       style={styles.dropdownAction}
//                     >
//                       <MaterialIcons name="person" size={18} color="#111827" />
//                       <Text style={styles.dropdownActionText}>
//                         User Profile
//                       </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={handleLogout}
//                       style={styles.dropdownAction}
//                     >
//                       <MaterialIcons name="logout" size={18} color="#f96166" />
//                       <Text style={styles.dropdownActionText}>Logout</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               )}
//             </View>
//           </View>
//         </View>
//       ) : (
//         // WEB VIEW - NOT LOGGED IN
//         <View style={styles.webHeaderNotLoggedIn}>
//           {/* PORTAL TOGGLE BUTTONS FOR WEB - NOT LOGGED IN */}
//           {!resolvedIsDoctorPortal && (
//             <Pressable
//               onPress={goToDoctorPortal}
//               style={styles.webPortalButton}
//             >
//               <Image
//                 source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                 style={{ height: 36, width: 72 }}
//               />
//             </Pressable>
//           )}

//           {resolvedIsDoctorPortal && (
//             <Pressable
//               style={styles.webPortalSwitchBox}
//               onPress={goToPatientPortal}
//             >
//               <Text style={styles.webPortalSwitchText}>Patient Portal</Text>
//             </Pressable>
//           )}

//           <Animated.View
//             style={[
//               styles.headerBtn,
//               {
//                 backgroundColor: isHovered ? "#f96166" : "#fff",
//                 borderColor: isHovered ? "#f96166" : "#DDD",
//                 transform: [{ scale: scaleAnim }],
//               },
//             ]}
//             onMouseEnter={onHoverIn}
//             onMouseLeave={onHoverOut}
//           >
//             <TouchableOpacity
//               onPress={() => {
//                 mixpanel.track("Auth CTA Clicked", {
//                   source: "Header",
//                   platform: Platform.OS,
//                   cta_text: "Login / Signup",
//                   user_state: user ? "logged_in" : "anonymous",
//                 });
//                 openAuthModal("signup");
//               }}
//             >
//               <Text
//                 style={[
//                   styles.headerBtnText,
//                   {
//                     color: isHovered ? "#fff" : "#333",
//                   },
//                 ]}
//               >
//                 Login / Signup
//               </Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       )}

//       <PatientAuthModal
//         visible={authModalVisible}
//         initialMode={authModalMode}
//         onRequestClose={closeAuthModal}
//         onDoctorRegister={handleDoctorRegister}
//       />
//       <DoctorSignupModal
//         visible={doctorModalVisible}
//         onRequestClose={() => setDoctorModalVisible(false)}
//       />
//     </>
//   );
// };
// // const styles = StyleSheet.create({
// //   headerBtn: {
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     backgroundColor: "#fff",
// //     borderRadius: 8,
// //     marginRight: 16,
// //     marginVertical: 8,
// //     minWidth: 140,
// //     alignSelf: "flex-end",
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: "#DDD",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.08,
// //     shadowRadius: 4,
// //     elevation: 2,
// //   },
// //   headerBtnText: {
// //     fontWeight: "600",
// //     fontSize: 15,
// //     color: "#333",
// //   },
// //   appHeaderContainer: {
// //     backgroundColor: "#fff",
// //     padding: 11,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   appHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   logo: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   hamburger: {
// //     marginRight: 10,
// //   },
// //   appName: {
// //     fontWeight: "800",
// //     fontSize: 16,
// //     color: "#000",
// //     marginLeft: 6,
// //   },
// //   webHeaderShell: {
// //     width: "100%",
// //     paddingVertical: 10,
// //     paddingHorizontal: 24,
// //     // backgroundColor: "#fff",
// //     // borderRadius: 12,
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     // shadowColor: "#000",
// //     // shadowOffset: { width: 0, height: 4 },
// //     // shadowOpacity: 0.05,
// //     // shadowRadius: 8,
// //     // elevation: 2,
// //   },
// //   webWelcome: {
// //     fontSize: 20,
// //     fontWeight: "600",
// //     color: "#fff",
// //   },
// //   webWelcomeName: {
// //     color: "#fff",
// //     fontWeight: "700",
// //   },
// //   webProfileSection: {
// //     position: "relative",
// //   },
// //   webProfileButton: {
// //     cursor: "pointer",
// //   },
// //   avatar: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //   },
// //   avatarSmall: {
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //   },
// //   profileMeta: {
// //     marginHorizontal: 10,
// //     flexShrink: 1,
// //   },
// //   profileName: {
// //     fontSize: 15,
// //     fontWeight: "600",
// //     color: "#111827",
// //   },
// //   profileEmail: {
// //     fontSize: 12,
// //     color: "#6B7280",
// //   },
// //   authButtonsApp: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 10,
// //     position: "relative",
// //     zIndex: 100,
// //     elevation: 10,
// //     //borderWidth:1
// //   },
// //   authButtonBox: {
// //     padding: 4,
// //     borderRadius: 8,
// //     //borderWidth:1
// //   },
// //   // dropdownMain: {
// //   //   position: "absolute",
// //   //   backgroundColor: "#fff",
// //   //   borderRadius: 6,
// //   //   shadowColor: "#000",
// //   //   shadowOffset: { width: 0, height: 4 },
// //   //   shadowOpacity: 0.15,
// //   //   shadowRadius: 8,
// //   //   elevation: 10,
// //   //   minWidth: 110,
// //   //   overflow: "hidden",
// //   //   right: "5%",
// //   //   top:40,
// //   //   height: "auto",
// //   //   maxHeight:230,
// //   //   zIndex:9999,
// //   //   borderColor: "#4a4a4aff",
// //   //   borderWidth: 1,
// //   // },
// //   dropdownMain: {
// //     position: "absolute",
// //     top: 45,
// //     //right: 20,
// //     left: 0,
// //     backgroundColor: "#fff",
// //     borderRadius: 8,
// //     minWidth: 140,
// //     elevation: 20, // ✅ ANDROID
// //     zIndex: 9999, // ✅ WEB
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 8,
// //     borderWidth: 1,
// //     borderColor: "#E5E7EB",
// //     pointerEvents: "box-none",
// //     //marginLeft:"10%"
// //   },

// //   // dropdownItem: {
// //   //   flexDirection: "row",
// //   //   //alignItems: "center",
// //   //   paddingVertical: "4%",
// //   //   paddingHorizontal: "1%",
// //   //   width: "100%",
// //   //   justifyContent: "center",
// //   //   borderWidth:1,
// //   // },

// //   // dropdownItem: {
// //   //   flexDirection: "row",
// //   //   alignItems: "center",
// //   //   justifyContent: "center",

// //   //   paddingVertical: 12, // ✅ numeric
// //   //   paddingHorizontal: 16, // ✅ numeric

// //   //   width: "100%",
// //   // },

// //   dropdownItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",

// //     paddingVertical: 14,
// //     paddingHorizontal: 16,

// //     width: "100%",
// //     alignSelf: "stretch", // 🔥 IMPORTANT
// //     minHeight: 44, // 🔥 iOS/Android tap standard
// //   },

// //   dropdownText: {
// //     fontSize: 15,
// //     fontWeight: "600",
// //     color: "#0c0c0cff",
// //     //paddingHorizontal: "6%",
// //     //paddingVertical: "2%",
// //   },
// //   usernameApp: {
// //     marginTop: 5,
// //     flexDirection: "row",
// //   },
// //   modalContainer: {
// //     flex: 1,
// //     flexDirection: "row",
// //   },
// //   mobileSidebar: {
// //     width: "75%",
// //     backgroundColor: "#fff",
// //     paddingTop: 40,
// //   },
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.5)",
// //   },
// //   dropdownOverlay: {
// //     position: "fixed",
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     zIndex: 999,
// //   },
// //   webDropdownMenu: {
// //     position: "absolute",
// //     top: "100%",
// //     right: 0,
// //     marginTop: 8,
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: "#E5E7EB",
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.08,
// //     shadowRadius: 12,
// //     elevation: 5,
// //     minWidth: 160,
// //     zIndex: 1000,
// //   },
// //   dropdownAction: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingVertical: 10,
// //     paddingHorizontal: 16,
// //   },
// //   dropdownActionText: {
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: "#111827",
// //     marginLeft: 8,
// //   },
// //   userInfoContainer: {
// //     padding: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: "#E5E7EB",
// //   },
// //   userNameText: {
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: "#111827",
// //     marginBottom: 4,
// //   },
// //   userEmailText: {
// //     fontSize: 12,
// //     color: "#6B7280",
// //   },
// //   logoutButton: {
// //     padding: 12,
// //     alignItems: "center",
// //   },
// //   logoutButtonText: {
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: "#DC2626",
// //   },
// //   portalSwitchBox: {
// //     paddingVertical: 7,
// //     paddingHorizontal: 4,
// //     borderRadius: 5,
// //     backgroundColor: "#fefefeff",
// //     borderWidth: 2,
// //     borderColor: "#eb2121ff",
// //   },

// //   portalSwitchText: {
// //     fontSize: 12,
// //     fontWeight: "600",
// //     color: "#eb2121ff",
// //   },
// // });

// // export default HeaderLoginSignUp;

// const styles = StyleSheet.create({
//   headerBtn: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginRight: 16,
//     marginVertical: 8,
//     minWidth: 140,
//     alignSelf: "flex-end",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#DDD",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   headerBtnText: {
//     fontWeight: "600",
//     fontSize: 15,
//     color: "#333",
//   },
//   appHeaderContainer: {
//     backgroundColor: "#fff",
//     padding: 11,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   appHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   logo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   hamburger: {
//     marginRight: 10,
//   },
//   appName: {
//     fontWeight: "800",
//     fontSize: 16,
//     color: "#000",
//     marginLeft: 6,
//   },
//   webHeaderShell: {
//     width: "100%",
//     paddingVertical: 10,
//     paddingHorizontal: 24,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   webHeaderNotLoggedIn: {
//     width: "100%",
//     paddingVertical: 10,
//     paddingHorizontal: 24,
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     gap: 16,
//   },
//   webRightSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,
//   },
//   webWelcome: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   webWelcomeName: {
//     color: "#fff",
//     fontWeight: "700",
//   },
//   webProfileSection: {
//     position: "relative",
//   },
//   webProfileButton: {
//     cursor: "pointer",
//   },
//   webPortalButton: {
//     cursor: "pointer",
//     transition: "opacity 0.2s",
//   },
//   webPortalSwitchBox: {
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 8,
//     backgroundColor: "#fff",
//     borderWidth: 2,
//     borderColor: "#eb2121ff",
//     cursor: "pointer",
//     transition: "all 0.2s",
//   },
//   webPortalSwitchText: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#eb2121ff",
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//   },
//   avatarSmall: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//   },
//   profileMeta: {
//     marginHorizontal: 10,
//     flexShrink: 1,
//   },
//   profileName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   profileEmail: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   authButtonsApp: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     position: "relative",
//     zIndex: 100,
//     elevation: 10,
//   },
//   authButtonBox: {
//     padding: 4,
//     borderRadius: 8,
//   },
//   dropdownMain: {
//     position: "absolute",
//     top: 45,
//     left: 0,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     minWidth: 140,
//     elevation: 20,
//     zIndex: 9999,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     pointerEvents: "box-none",
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     width: "100%",
//     alignSelf: "stretch",
//     minHeight: 44,
//   },
//   dropdownText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#0c0c0cff",
//   },
//   usernameApp: {
//     marginTop: 5,
//     flexDirection: "row",
//   },
//   modalContainer: {
//     flex: 1,
//     flexDirection: "row",
//   },
//   mobileSidebar: {
//     width: "75%",
//     backgroundColor: "#fff",
//     paddingTop: 40,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   dropdownOverlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 999,
//   },
//   webDropdownMenu: {
//     position: "absolute",
//     top: "100%",
//     right: 0,
//     marginTop: 8,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 5,
//     minWidth: 160,
//     zIndex: 1000,
//   },
//   dropdownAction: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },
//   dropdownActionText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//     marginLeft: 8,
//   },
//   userInfoContainer: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   userNameText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//     marginBottom: 4,
//   },
//   userEmailText: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   logoutButton: {
//     padding: 12,
//     alignItems: "center",
//   },
//   logoutButtonText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#DC2626",
//   },
//   portalSwitchBox: {
//     paddingVertical: 7,
//     paddingHorizontal: 4,
//     borderRadius: 5,
//     backgroundColor: "#fefefeff",
//     borderWidth: 2,
//     borderColor: "#eb2121ff",
//   },
//   portalSwitchText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#eb2121ff",
//   },
// });

// export default HeaderLoginSignUp;

//3--------------#####----------------

// import React, { useState, useRef, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   Animated,
//   StyleSheet,
//   Platform,
//   Dimensions,
//   Image,
//   Pressable,
// } from "react-native";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
// import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
// import { useLoginModal } from "../../contexts/LoginModalContext";
// import { useAuth } from "../../contexts/AuthContext";
// import PatientAuthModal from "../Auth/PatientAuthModal";
// import DoctorSignupModal from "../Auth/DoctorSignupModal";
// import mixpanel from "../../utils/Mixpanel";

// const defaultAvatar = require("../../assets/Images/user-icon.jpg");

// const HeaderLoginSignUp = ({ isDoctorPortal = false, user: userOverride }) => {
//   const navigation = useNavigation();
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const [isHovered, setIsHovered] = useState(false);
//   const [dropdownVisible, setDropdownVisible] = useState(false);
//   const [isSideBarVisible, setIsSideBarVisible] = useState(false);
//   const [authModalVisible, setAuthModalVisible] = useState(false);
//   const [authModalMode, setAuthModalMode] = useState("signup");
//   const [doctorModalVisible, setDoctorModalVisible] = useState(false);
//   const { registerOpenModal } = useLoginModal();
//   const { user: contextUser, role, logout } = useAuth();
//   const user = userOverride ?? contextUser;
//   const resolvedIsDoctorPortal = isDoctorPortal || role === "doctor";

//   // 🔍 DEBUG LOGS
//   console.log("=== HEADER DEBUG ===");
//   console.log("1. user:", user);
//   console.log("2. role:", role);
//   console.log("3. isDoctorPortal prop:", isDoctorPortal);
//   console.log("4. resolvedIsDoctorPortal:", resolvedIsDoctorPortal);
//   console.log("5. Should disable doctor portal?", user && !resolvedIsDoctorPortal);
//   console.log("6. Should disable patient portal?", user && resolvedIsDoctorPortal);
//   console.log("===================");

//   const displayName = user?.name || user?.fullName || user?.username || "User";
//   const displayEmail = user?.email || user?.emailId || "";
//   const avatarUri =
//     user?.picture ||
//     user?.avatar ||
//     user?.avatarUrl ||
//     user?.profileImage ||
//     user?.image ||
//     user?.photoUrl;
//   const avatarSource =
//     avatarUri && typeof avatarUri === "string"
//       ? { uri: avatarUri }
//       : defaultAvatar;

//   const isApp = Platform.OS === "ios" || Platform.OS === "android";
//   const isSmallScreen =
//     Platform.OS === "web" && Dimensions.get("window").width <= 820;
//   const isMobile = isApp || isSmallScreen;

//   const openAuthModal = useCallback((mode = "signup") => {
//     setAuthModalMode(mode);
//     setAuthModalVisible(true);
//   }, []);

//   const closeAuthModal = () => {
//     setAuthModalVisible(false);
//   };

//   useEffect(() => {
//     registerOpenModal(({ mode = "signup" } = {}) => {
//       openAuthModal(mode);
//     });
//   }, [registerOpenModal, openAuthModal]);

//   const onHoverIn = () => {
//     setIsHovered(true);
//     Animated.spring(scaleAnim, {
//       toValue: 0.96,
//       friction: 5,
//       useNativeDriver: true,
//     }).start();
//   };

//   const onHoverOut = () => {
//     setIsHovered(false);
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       friction: 5,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleProfile = () => {
//     setDropdownVisible(false);
//     // TODO: Navigate to user profile page
//     // navigation.navigate("UserProfile");
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       setDropdownVisible(false);
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const handleDoctorRegister = () => {
//     setDoctorModalVisible(true);
//   };

//   const goToDoctorPortal = () => {
//     navigation.reset({
//       index: 0,
//       routes: [
//         {
//           name: "DoctorAppNavigation",
//           params: {
//             screen: "DoctorPortalLandingPage",
//           },
//         },
//       ],
//     });
//   };

//   const goToPatientPortal = () => {
//     navigation.reset({
//       index: 0,
//       routes: [
//         {
//           name: "PatientAppNavigation",
//           params: {
//             screen: "LandingPage",
//           },
//         },
//       ],
//     });
//   };

//   return (
//     <>
//       {isMobile ? (
//         <View style={styles.appHeaderContainer}>
//           <Modal
//             visible={isSideBarVisible}
//             transparent
//             onRequestClose={() => setIsSideBarVisible(false)}
//           >
//             <View style={styles.modalContainer}>
//               <View style={styles.mobileSidebar}>
//                 {resolvedIsDoctorPortal ? (
//                   <NewestSidebar
//                     navigation={navigation}
//                     closeSidebar={() => setIsSideBarVisible(false)}
//                   />
//                 ) : (
//                   <SideBarNavigation
//                     navigation={navigation}
//                     closeSidebar={() => setIsSideBarVisible(false)}
//                   />
//                 )}
//               </View>
//               <Pressable
//                 style={styles.overlay}
//                 onPress={() => setIsSideBarVisible(false)}
//               />
//             </View>
//           </Modal>

//           <View style={styles.appHeader}>
//             <View style={styles.logo}>
//               <Pressable
//                 style={styles.hamburger}
//                 onPress={() => setIsSideBarVisible(true)}
//               >
//                 <MaterialIcons name="menu" size={30} color="black" />
//               </Pressable>
//               <Image
//                 source={require("../../assets/Icons/kokoro.png")}
//                 style={{ height: 30, width: 30 }}
//               />
//               <Text style={styles.appName}>Kokoro.Doctor</Text>
//             </View>

//             <View style={styles.authButtonsApp}>
//               <View style={{ position: "relative" }}>
//                 <Pressable
//                   style={styles.authButtonBox}
//                   onPress={() => setDropdownVisible(!dropdownVisible)}
//                 >
//                   <Image source={avatarSource} style={styles.avatarSmall} />
//                 </Pressable>

//                 {dropdownVisible && (
//                   <View style={styles.dropdownMain}>
//                     {user ? (
//                       <>
//                         <TouchableOpacity
//                           onPress={handleProfile}
//                           style={styles.dropdownItem}
//                         >
//                           <MaterialIcons
//                             name="person"
//                             size={18}
//                             color="#111827"
//                             style={{ marginRight: 8 }}
//                           />
//                           <Text style={styles.dropdownText}>User Profile</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={handleLogout}
//                           style={styles.logoutButton}
//                         >
//                           <Text style={styles.logoutButtonText}>Logout</Text>
//                         </TouchableOpacity>
//                       </>
//                     ) : (
//                       <Pressable
//                         onPress={() => {
//                           mixpanel.track("Auth CTA Clicked", {
//                             source: "Header",
//                             platform: Platform.OS,
//                             cta_text: "Login / Signup",
//                             user_state: user ? "logged_in" : "anonymous",
//                           });
//                           setDropdownVisible(false);
//                           openAuthModal("signup");
//                         }}
//                         style={({ pressed }) => [
//                           styles.dropdownItem,
//                           pressed && { backgroundColor: "#F3F4F6" },
//                         ]}
//                       >
//                         <Text style={styles.dropdownText}>Login / Signup</Text>
//                       </Pressable>
//                     )}
//                   </View>
//                 )}
//               </View>

//               {/* PORTAL TOGGLE BUTTONS FOR MOBILE */}
//               {!resolvedIsDoctorPortal && user && (
//                 <Pressable
//                   onPress={goToDoctorPortal}
//                   style={{ opacity: 0.5 }}
//                   disabled={true}
//                 >
//                   <Image
//                     source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                     style={{ height: 40, width: 80 }}
//                   />
//                 </Pressable>
//               )}

//               {!resolvedIsDoctorPortal && !user && (
//                 <Pressable
//                   onPress={goToDoctorPortal}
//                 >
//                   <Image
//                     source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                     style={{ height: 40, width: 80 }}
//                   />
//                 </Pressable>
//               )}

//               {resolvedIsDoctorPortal && user && (
//                 <Pressable
//                   style={[styles.portalSwitchBox, { opacity: 0.5 }]}
//                   onPress={goToPatientPortal}
//                   disabled={true}
//                 >
//                   <Text style={styles.portalSwitchText}>Patient Portal</Text>
//                 </Pressable>
//               )}

//               {resolvedIsDoctorPortal && !user && (
//                 <Pressable
//                   style={styles.portalSwitchBox}
//                   onPress={goToPatientPortal}
//                 >
//                   <Text style={styles.portalSwitchText}>Patient Portal</Text>
//                 </Pressable>
//               )}
//             </View>
//           </View>

//           <View style={styles.usernameApp}>
//             <Text style={{ fontWeight: "600", fontSize: 19 }}>Welcome,</Text>
//             <Text
//               style={{
//                 fontWeight: "800",
//                 color: "#000",
//                 fontSize: 19,
//               }}
//             >
//               {user
//                 ? `${resolvedIsDoctorPortal ? " " : " "}${displayName}!`
//                 : " User!"}
//             </Text>
//           </View>
//         </View>
//       ) : user ? (
//         // WEB VIEW - LOGGED IN
//         <View style={styles.webHeaderShell}>
//           <Text style={styles.webWelcome}>
//             Welcome, <Text style={styles.webWelcomeName}>{displayName}</Text>
//           </Text>

//           <View style={styles.webRightSection}>
//             {/* PORTAL TOGGLE BUTTONS FOR WEB - LOGGED IN */}
//             {!resolvedIsDoctorPortal && (
//               <Pressable
//                 onPress={goToDoctorPortal}
//                 disabled={true}
//                 style={[styles.webPortalButton, { opacity: 0.5 }]}
//               >
//                 <Image
//                   source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                   style={{ height: 36, width: 72 }}
//                 />
//               </Pressable>
//             )}

//             {resolvedIsDoctorPortal && (
//               <Pressable
//                 style={[styles.webPortalSwitchBox, { opacity: 0.5 }]}
//                 onPress={goToPatientPortal}
//                 disabled={true}
//               >
//                 <Text style={styles.webPortalSwitchText}>Patient Portal</Text>
//               </Pressable>
//             )}

//             <View style={styles.webProfileSection}>
//               <TouchableOpacity
//                 style={styles.webProfileButton}
//                 onPress={() => setDropdownVisible(!dropdownVisible)}
//               >
//                 <Image source={avatarSource} style={styles.avatar} />
//               </TouchableOpacity>
//               {dropdownVisible && (
//                 <>
//                   <Pressable
//                     style={styles.dropdownOverlay}
//                     onPress={() => setDropdownVisible(false)}
//                   />
//                   <View style={styles.webDropdownMenu}>
//                     <TouchableOpacity
//                       onPress={handleProfile}
//                       style={styles.dropdownAction}
//                     >
//                       <MaterialIcons name="person" size={18} color="#111827" />
//                       <Text style={styles.dropdownActionText}>User Profile</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={handleLogout}
//                       style={styles.dropdownAction}
//                     >
//                       <MaterialIcons name="logout" size={18} color="#f96166" />
//                       <Text style={styles.dropdownActionText}>Logout</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </>
//               )}
//             </View>
//           </View>
//         </View>
//       ) : (
//         // WEB VIEW - NOT LOGGED IN
//         <View style={styles.webHeaderNotLoggedIn}>
//           {/* PORTAL TOGGLE BUTTONS FOR WEB - NOT LOGGED IN */}
//           {!resolvedIsDoctorPortal && (
//             <Pressable
//               onPress={goToDoctorPortal}
//               style={styles.webPortalButton}
//             >
//               <Image
//                 source={require("../../assets/Icons/DoctorPortalIcon.png")}
//                 style={{ height: 36, width: 72 }}
//               />
//             </Pressable>
//           )}

//           {resolvedIsDoctorPortal && (
//             <Pressable
//               style={styles.webPortalSwitchBox}
//               onPress={goToPatientPortal}
//             >
//               <Text style={styles.webPortalSwitchText}>Patient Portal</Text>
//             </Pressable>
//           )}

//           <Animated.View
//             style={[
//               styles.headerBtn,
//               {
//                 backgroundColor: isHovered ? "#f96166" : "#fff",
//                 borderColor: isHovered ? "#f96166" : "#DDD",
//                 transform: [{ scale: scaleAnim }],
//               },
//             ]}
//             onMouseEnter={onHoverIn}
//             onMouseLeave={onHoverOut}
//           >
//             <TouchableOpacity
//               onPress={() => {
//                 mixpanel.track("Auth CTA Clicked", {
//                   source: "Header",
//                   platform: Platform.OS,
//                   cta_text: "Login / Signup",
//                   user_state: user ? "logged_in" : "anonymous",
//                 });
//                 openAuthModal("signup");
//               }}
//             >
//               <Text
//                 style={[
//                   styles.headerBtnText,
//                   {
//                     color: isHovered ? "#fff" : "#333",
//                   },
//                 ]}
//               >
//                 Login / Signup
//               </Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       )}

//       <PatientAuthModal
//         visible={authModalVisible}
//         initialMode={authModalMode}
//         onRequestClose={closeAuthModal}
//         onDoctorRegister={handleDoctorRegister}
//       />
//       <DoctorSignupModal
//         visible={doctorModalVisible}
//         onRequestClose={() => setDoctorModalVisible(false)}
//       />
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   headerBtn: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginRight: 16,
//     marginVertical: 8,
//     minWidth: 140,
//     alignSelf: "flex-end",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#DDD",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   headerBtnText: {
//     fontWeight: "600",
//     fontSize: 15,
//     color: "#333",
//   },
//   appHeaderContainer: {
//     backgroundColor: "#fff",
//     padding: 11,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   appHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   logo: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   hamburger: {
//     marginRight: 10,
//   },
//   appName: {
//     fontWeight: "800",
//     fontSize: 16,
//     color: "#000",
//     marginLeft: 6,
//   },
//   webHeaderShell: {
//     width: "100%",
//     paddingVertical: 10,
//     paddingHorizontal: 24,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   webHeaderNotLoggedIn: {
//     width: "100%",
//     paddingVertical: 10,
//     paddingHorizontal: 24,
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     gap: 16,
//   },
//   webRightSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,
//   },
//   webWelcome: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   webWelcomeName: {
//     color: "#fff",
//     fontWeight: "700",
//   },
//   webProfileSection: {
//     position: "relative",
//   },
//   webProfileButton: {
//     cursor: "pointer",
//   },
//   webPortalButton: {
//     cursor: "pointer",
//     transition: "opacity 0.2s",
//   },
//   webPortalSwitchBox: {
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 8,
//     backgroundColor: "#fff",
//     borderWidth: 2,
//     borderColor: "#eb2121ff",
//     cursor: "pointer",
//     transition: "all 0.2s",
//   },
//   webPortalSwitchText: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#eb2121ff",
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//   },
//   avatarSmall: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//   },
//   profileMeta: {
//     marginHorizontal: 10,
//     flexShrink: 1,
//   },
//   profileName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   profileEmail: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   authButtonsApp: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     position: "relative",
//     zIndex: 100,
//     elevation: 10,
//   },
//   authButtonBox: {
//     padding: 4,
//     borderRadius: 8,
//   },
//   dropdownMain: {
//     position: "absolute",
//     top: 45,
//     left: 0,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     minWidth: 140,
//     elevation: 20,
//     zIndex: 9999,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     pointerEvents: "box-none",
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     width: "100%",
//     alignSelf: "stretch",
//     minHeight: 44,
//   },
//   dropdownText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#0c0c0cff",
//   },
//   usernameApp: {
//     marginTop: 5,
//     flexDirection: "row",
//   },
//   modalContainer: {
//     flex: 1,
//     flexDirection: "row",
//   },
//   mobileSidebar: {
//     width: "75%",
//     backgroundColor: "#fff",
//     paddingTop: 40,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   dropdownOverlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 999,
//   },
//   webDropdownMenu: {
//     position: "absolute",
//     top: "100%",
//     right: 0,
//     marginTop: 8,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 5,
//     minWidth: 160,
//     zIndex: 1000,
//   },
//   dropdownAction: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },
//   dropdownActionText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//     marginLeft: 8,
//   },
//   userInfoContainer: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   userNameText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//     marginBottom: 4,
//   },
//   userEmailText: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   logoutButton: {
//     padding: 12,
//     alignItems: "center",
//   },
//   logoutButtonText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#DC2626",
//   },
//   portalSwitchBox: {
//     paddingVertical: 7,
//     paddingHorizontal: 4,
//     borderRadius: 5,
//     backgroundColor: "#fefefeff",
//     borderWidth: 2,
//     borderColor: "#eb2121ff",
//   },
//   portalSwitchText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#eb2121ff",
//   },
// });

// export default HeaderLoginSignUp;

//4-------------#################-------------

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import { useLoginModal } from "../../contexts/LoginModalContext";
import { useAuth } from "../../contexts/AuthContext";
import PatientAuthModal from "../Auth/PatientAuthModal";
import DoctorSignupModal from "../Auth/DoctorSignupModal";
import mixpanel from "../../utils/Mixpanel";

const defaultAvatar = require("../../assets/Images/user-icon.jpg");

const HeaderLoginSignUp = ({ isDoctorPortal = false, user: userOverride }) => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSideBarVisible, setIsSideBarVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("signup");
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const { registerOpenModal } = useLoginModal();
  const { user: contextUser, role, logout } = useAuth();
  const user = userOverride ?? contextUser;
  const resolvedIsDoctorPortal = isDoctorPortal || role === "doctor";

  const displayName = user?.name || user?.fullName || user?.username || "User";
  const displayEmail = user?.email || user?.emailId || "";
  const avatarUri =
    user?.picture ||
    user?.avatar ||
    user?.avatarUrl ||
    user?.profileImage ||
    user?.image ||
    user?.photoUrl;
  const avatarSource =
    avatarUri && typeof avatarUri === "string"
      ? { uri: avatarUri }
      : defaultAvatar;

  const isApp = Platform.OS === "ios" || Platform.OS === "android";
  const isSmallScreen =
    Platform.OS === "web" && Dimensions.get("window").width <= 820;
  const isMobile = isApp || isSmallScreen;

  const openAuthModal = useCallback((mode = "signup") => {
    setAuthModalMode(mode);
    setAuthModalVisible(true);
  }, []);

  const closeAuthModal = () => {
    setAuthModalVisible(false);
  };

  useEffect(() => {
    registerOpenModal(({ mode = "signup" } = {}) => {
      // If on doctor portal and mode is signup, open doctor signup modal
      if (resolvedIsDoctorPortal && mode === "signup") {
        setDoctorModalVisible(true);
      } else {
        openAuthModal(mode);
      }
    });
  }, [registerOpenModal, openAuthModal, resolvedIsDoctorPortal]);

  const onHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const onHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleProfile = () => {
    setDropdownVisible(false);
    // TODO: Navigate to user profile page
    // navigation.navigate("UserProfile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownVisible(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDoctorRegister = () => {
    setDoctorModalVisible(true);
  };

  const goToDoctorPortal = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "DoctorAppNavigation",
          params: {
            screen: "DoctorPortalLandingPage",
          },
        },
      ],
    });
  };

  const goToPatientPortal = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "PatientAppNavigation",
          params: {
            screen: "LandingPage",
          },
        },
      ],
    });
  };

  return (
    <>
      {isMobile ? (
        <View style={styles.appHeaderContainer}>
          <Modal
            visible={isSideBarVisible}
            transparent
            onRequestClose={() => setIsSideBarVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.mobileSidebar}>
                {resolvedIsDoctorPortal ? (
                  <NewestSidebar
                    navigation={navigation}
                    closeSidebar={() => setIsSideBarVisible(false)}
                  />
                ) : (
                  <SideBarNavigation
                    navigation={navigation}
                    closeSidebar={() => setIsSideBarVisible(false)}
                  />
                )}
              </View>
              <Pressable
                style={styles.overlay}
                onPress={() => setIsSideBarVisible(false)}
              />
            </View>
          </Modal>

          <View style={styles.appHeader}>
            <View style={styles.logo}>
              <Pressable
                style={styles.hamburger}
                onPress={() => setIsSideBarVisible(true)}
              >
                <MaterialIcons name="menu" size={30} color="black" />
              </Pressable>
              <Image
                source={require("../../assets/Icons/kokoro.png")}
                style={{ height: 30, width: 30 }}
              />
              <Text style={styles.appName}>Kokoro.Doctor</Text>
            </View>

            <View style={styles.authButtonsApp}>
              <View style={{ position: "relative" }}>
                <Pressable
                  style={styles.authButtonBox}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                  <Image source={avatarSource} style={styles.avatarSmall} />
                </Pressable>

                {dropdownVisible && (
                  <View style={styles.dropdownMain}>
                    {user ? (
                      <>
                        <TouchableOpacity
                          onPress={handleProfile}
                          style={styles.dropdownItem}
                        >
                          <MaterialIcons
                            name="person"
                            size={18}
                            color="#111827"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={styles.dropdownText}>User Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleLogout}
                          style={styles.logoutButton}
                        >
                          <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => {
                          mixpanel.track("Auth CTA Clicked", {
                            source: "Header",
                            platform: Platform.OS,
                            cta_text: "Login / Signup",
                            user_state: user ? "logged_in" : "anonymous",
                          });
                          setDropdownVisible(false);
                          if (resolvedIsDoctorPortal) {
                            setDoctorModalVisible(true);
                          } else {
                            openAuthModal("signup");
                          }
                        }}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && { backgroundColor: "#F3F4F6" },
                        ]}
                      >
                        <Text style={styles.dropdownText}>Login / Signup</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>

              {/* PORTAL TOGGLE BUTTONS FOR MOBILE */}
              {!resolvedIsDoctorPortal && !user && (
                <Pressable onPress={goToDoctorPortal}>
                  <Image
                    source={require("../../assets/Icons/DoctorPortalIcon.png")}
                    style={{ height: 40, width: 80 }}
                  />
                </Pressable>
              )}

              {resolvedIsDoctorPortal && !user && (
                <Pressable
                  style={styles.portalSwitchBox}
                  onPress={goToPatientPortal}
                >
                  <Text style={styles.portalSwitchText}>Patient Portal</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.usernameApp}>
            <Text style={{ fontWeight: "600", fontSize: 19 }}>Welcome,</Text>
            <Text
              style={{
                fontWeight: "800",
                color: "#000",
                fontSize: 19,
              }}
            >
              {user
                ? `${resolvedIsDoctorPortal ? " " : " "}${displayName}!`
                : " User!"}
            </Text>
          </View>
        </View>
      ) : user ? (
        // WEB VIEW - LOGGED IN
        <View style={styles.webHeaderShell}>
          <Text style={styles.webWelcome}>
            Welcome, <Text style={styles.webWelcomeName}>{displayName}</Text>
          </Text>

          <View style={styles.webProfileSection}>
            <TouchableOpacity
              style={styles.webProfileButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Image source={avatarSource} style={styles.avatar} />
            </TouchableOpacity>
            {dropdownVisible && (
              <>
                <Pressable
                  style={styles.dropdownOverlay}
                  onPress={() => setDropdownVisible(false)}
                />
                <View style={styles.webDropdownMenu}>
                  <TouchableOpacity
                    onPress={handleProfile}
                    style={styles.dropdownAction}
                  >
                    <MaterialIcons name="person" size={18} color="#111827" />
                    <Text style={styles.dropdownActionText}>User Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.dropdownAction}
                  >
                    <MaterialIcons name="logout" size={18} color="#f96166" />
                    <Text style={styles.dropdownActionText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      ) : (
        // WEB VIEW - NOT LOGGED IN
        <View style={styles.webHeaderNotLoggedIn}>
          {/* PORTAL TOGGLE BUTTONS FOR WEB - NOT LOGGED IN */}
          {!resolvedIsDoctorPortal && (
            <Pressable
              onPress={goToDoctorPortal}
              style={styles.webDoctorPortalButton}
            >
              <Text style={styles.webDoctorPortalText}>Doctor Portal</Text>
            </Pressable>
          )}

          {resolvedIsDoctorPortal && (
            <Pressable
              style={styles.webPortalSwitchBox}
              onPress={goToPatientPortal}
            >
              <Text style={styles.webPortalSwitchText}>Patient Portal</Text>
            </Pressable>
          )}

          <Animated.View
            style={[
              styles.headerBtn,
              {
                backgroundColor: isHovered ? "#f96166" : "#fff",
                borderColor: isHovered ? "#f96166" : "#DDD",
                transform: [{ scale: scaleAnim }],
              },
            ]}
            onMouseEnter={onHoverIn}
            onMouseLeave={onHoverOut}
          >
            <TouchableOpacity
              onPress={() => {
                mixpanel.track("Auth CTA Clicked", {
                  source: "Header",
                  platform: Platform.OS,
                  cta_text: "Login / Signup",
                  user_state: user ? "logged_in" : "anonymous",
                });

                if (resolvedIsDoctorPortal) {
                  setDoctorModalVisible(true);
                } else {
                  openAuthModal("signup");
                }
              }}
            >
              <Text
                style={[
                  styles.headerBtnText,
                  {
                    color: isHovered ? "#fff" : "#333",
                  },
                ]}
              >
                Login / Signup
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <PatientAuthModal
        visible={authModalVisible}
        initialMode={authModalMode}
        onRequestClose={closeAuthModal}
        onDoctorRegister={handleDoctorRegister}
      />
      <DoctorSignupModal
        visible={doctorModalVisible}
        onRequestClose={() => setDoctorModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 16,
    marginVertical: 8,
    minWidth: 140,
    alignSelf: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtnText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
  },
  appHeaderContainer: {
    backgroundColor: "#fff",
    padding: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  hamburger: {
    marginRight: 10,
  },
  appName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#000",
    marginLeft: 6,
  },
  webHeaderShell: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  webHeaderNotLoggedIn: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
  },
  webRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  webWelcome: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  webWelcomeName: {
    color: "#fff",
    fontWeight: "700",
  },
  webProfileSection: {
    position: "relative",
  },
  webProfileButton: {
    cursor: "pointer",
  },
  webPortalButton: {
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  webDoctorPortalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f20505ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    cursor: "pointer",
  },
  webDoctorPortalText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#e30a0aff",
  },
  webPortalSwitchBox: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f20505ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    cursor: "pointer",
    minWidth: 140,
    alignItems: "center",
  },
  webPortalSwitchText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e30a0aff",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileMeta: {
    marginHorizontal: 10,
    flexShrink: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  authButtonsApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 100,
    elevation: 10,
  },
  authButtonBox: {
    padding: 4,
    borderRadius: 8,
  },
  dropdownMain: {
    position: "absolute",
    top: 45,
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 140,
    elevation: 20,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    pointerEvents: "box-none",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
    alignSelf: "stretch",
    minHeight: 44,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0c0c0cff",
  },
  usernameApp: {
    marginTop: 5,
    flexDirection: "row",
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },
  mobileSidebar: {
    width: "75%",
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  webDropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    minWidth: 160,
    zIndex: 1000,
  },
  dropdownAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  userInfoContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  userNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userEmailText: {
    fontSize: 12,
    color: "#6B7280",
  },
  logoutButton: {
    padding: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  portalSwitchBox: {
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 5,
    backgroundColor: "#fefefeff",
    borderWidth: 2,
    borderColor: "#eb2121ff",
  },
  portalSwitchText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#eb2121ff",
  },
});

export default HeaderLoginSignUp;
