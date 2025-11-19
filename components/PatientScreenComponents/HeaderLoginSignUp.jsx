// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Modal,
//   Animated,
//   StyleSheet,
//   Easing,
//   Platform,
//   Dimensions,
//   Image
// } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import { useNavigation } from "@react-navigation/native";

// WebBrowser.maybeCompleteAuthSession();

// export default function HeaderLoginSignUp() {
//   const [visible, setVisible] = useState(false);
//   const [step, setStep] = useState(0); // 0: mobile, 1: otp, 2: name
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const bottomAnim = useRef(new Animated.Value(0)).current;
//   const navigation = useNavigation();
//   const SLIDE_WIDTH = 300;
//   const [isHovered, setIsHovered] = useState(false);
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   // ✅ Fully reset every time modal opens
//   const openModal = () => {
//     slideAnim.stopAnimation(); // stop any running animation
//     slideAnim.setValue(0); // reset to first screen
//     setStep(0); // reset step state
//     setVisible(true); // now open modal

//     if (Platform.OS !== "web") {
//       bottomAnim.setValue(Dimensions.get("window").height);
//       Animated.timing(bottomAnim, {
//         toValue: 0,
//         duration: 300,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   // ✅ Ensure modal closes cleanly and resets everything
//   const closeModal = () => {
//     if (Platform.OS !== "web") {
//       Animated.timing(bottomAnim, {
//         toValue: Dimensions.get("window").height,
//         duration: 200,
//         useNativeDriver: true,
//       }).start(() => {
//         setVisible(false);
//         slideAnim.setValue(0);
//         setStep(0);
//       });
//     } else {
//       setVisible(false);
//       slideAnim.setValue(0);
//       setStep(0);
//     }
//   };

//   // ✅ Whenever modal becomes visible, make absolutely sure it starts from step 0
//   useEffect(() => {
//     if (!visible) {
//       slideAnim.setValue(0);
//       setStep(0);
//     }
//   }, [visible]);

//   const handleNext = () => {
//     if (step < 2) {
//       // ✅ fixed condition
//       const nextStep = step + 1;
//       Animated.timing(slideAnim, {
//         toValue: -nextStep * SLIDE_WIDTH,
//         duration: 300,
//         easing: Easing.ease,
//         useNativeDriver: true,
//       }).start();
//       setStep(nextStep);
//     } else {
//       navigation.navigate("DoctorPatientLandingPage");
//       closeModal();
//     }
//   };

//   const onHoverIn = () => {
//     setIsHovered(true);
//     Animated.spring(scaleAnim, {
//       toValue: 0.96, // slightly shrink on hover
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

//   return (
//     <>
//       {Platform.OS !== "web" && (
//         <>
//           <View style={styles.logoContainer}>
//             <Image
//               source={require("../../assets/logo.png")}
//               style={styles.logo}
//               resizeMode="contain"
//             />
//             <Text style={styles.appName}>Kokoro Doctor</Text>
//           </View>

//           <TouchableOpacity style={styles.iconWrapper}>
//             <Ionicons name="notifications-outline" size={24} color="#000" />
//           </TouchableOpacity>
//         </>
//       )}

//       <Animated.View
//         style={[
//           styles.headerBtn,
//           {
//             backgroundColor: isHovered ? "#f96166ff" : "#fff",
//             transform: [{ scale: scaleAnim }],
//             shadowColor: "#000",
//             shadowOpacity: isHovered ? 0.3 : 0.1,
//             shadowRadius: isHovered ? 6 : 2,
//             shadowOffset: { width: 0, height: isHovered ? 3 : 1 },
//           },
//         ]}
//         onMouseEnter={onHoverIn}
//         onMouseLeave={onHoverOut}
//       >
//         <TouchableOpacity onPress={openModal} activeOpacity={0.8}>
//           <Text
//             style={[
//               styles.headerBtnText,
//               {
//                 color: isHovered ? "#fff" : "#000",
//                 transform: [{ translateY: isHovered ? 1 : 0 }],
//               },
//             ]}
//           >
//             Login / Signup
//           </Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Popup card */}
//       <Modal transparent visible={visible} animationType="fade">
//         <View style={styles.overlay}>
//           {/* <Animated.View
//             style={[
//               styles.card,
//               Platform.OS === "web"
//                 ? styles.webCard
//                 : [
//                     styles.mobileCard,
//                     { transform: [{ translateY: bottomAnim }] },
//                   ],
//             ]}
//           >

//             <Animated.View
//               style={{
//                 flexDirection: "row",
//                 width: SLIDE_WIDTH * 3,
//                 transform: [{ translateX: slideAnim }],
//               }}
//             >

//               <View style={styles.slide}>
//                 <Text style={styles.title}>Enter your mobile number</Text>
//                 <TextInput
//                   placeholder="Mobile Number"
//                   keyboardType="phone-pad"
//                   style={styles.input}
//                   value={mobile}
//                   onChangeText={setMobile}
//                 />
//                 <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                   <Text style={styles.btnText}>Continue</Text>
//                 </TouchableOpacity>
//                 <Text style={{ marginVertical: 8, color: "#666" }}>or</Text>
//                 <TouchableOpacity style={styles.googleBtn}>
//                   <Text style={styles.btnText}>Continue with Google</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.slide}>
//                 <Text style={styles.title}>Enter OTP sent to {mobile}</Text>
//                 <TextInput
//                   placeholder="Enter OTP"
//                   keyboardType="numeric"
//                   style={styles.input}
//                   value={otp}
//                   onChangeText={setOtp}
//                 />
//                 <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                   <Text style={styles.btnText}>Verify</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.slide}>
//                 <Text style={styles.title}>Complete your profile</Text>
//                 <TextInput
//                   placeholder="First Name"
//                   style={styles.input}
//                   value={firstName}
//                   onChangeText={setFirstName}
//                 />
//                 <TextInput
//                   placeholder="Last Name"
//                   style={styles.input}
//                   value={lastName}
//                   onChangeText={setLastName}
//                 />
//                 <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                   <Text style={styles.btnText}>Continue</Text>
//                 </TouchableOpacity>
//               </View>
//             </Animated.View>

//             <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
//               <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
//             </TouchableOpacity>
//           </Animated.View> */}
//           <Animated.View
//             style={[
//               styles.card,
//               Platform.OS === "web"
//                 ? styles.webCard
//                 : [
//                     styles.mobileCard,
//                     { transform: [{ translateY: bottomAnim }] },
//                   ],
//             ]}
//           >
//             {/* ✅ Fixed-width visible frame */}
//             <Animated.View
//               style={{
//                 width: SLIDE_WIDTH, // 👈 Only one frame width visible
//                 overflow: "hidden", // 👈 Hide other slides outside view
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               {/* ✅ Sliding inner container */}
//               <Animated.View
//                 style={{
//                   flexDirection: "row",
//                   width: SLIDE_WIDTH * 3,
//                   transform: [{ translateX: slideAnim }],
//                 }}
//               >
//                 {/* Step 0: Mobile input */}
//                 <View style={styles.slide}>
//                   <Text style={styles.title}>Enter your mobile number</Text>
//                   <TextInput
//                     placeholder="Mobile Number"
//                     keyboardType="phone-pad"
//                     style={styles.input}
//                     value={mobile}
//                     onChangeText={setMobile}
//                   />
//                   <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                     <Text style={styles.btnText}>Continue</Text>
//                   </TouchableOpacity>
//                   <Text style={{ marginVertical: 8, color: "#666" }}>or</Text>
//                   <TouchableOpacity style={styles.googleBtn}>
//                     <Text style={styles.btnText}>Continue with Google</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Step 1: OTP */}
//                 <View style={styles.slide}>
//                   <Text style={styles.title}>Enter OTP sent to {mobile}</Text>
//                   <TextInput
//                     placeholder="Enter OTP"
//                     keyboardType="numeric"
//                     style={styles.input}
//                     value={otp}
//                     onChangeText={setOtp}
//                   />
//                   <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                     <Text style={styles.btnText}>Verify</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Step 2: Name input */}
//                 <View style={styles.slide}>
//                   <Text style={styles.title}>Complete your profile</Text>
//                   <TextInput
//                     placeholder="First Name"
//                     style={styles.input}
//                     value={firstName}
//                     onChangeText={setFirstName}
//                   />
//                   <TextInput
//                     placeholder="Last Name"
//                     style={styles.input}
//                     value={lastName}
//                     onChangeText={setLastName}
//                   />
//                   <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                     <Text style={styles.btnText}>Continue</Text>
//                   </TouchableOpacity>
//                 </View>
//               </Animated.View>
//             </Animated.View>

//             <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
//               <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const SLIDE_WIDTH = 300;

// const styles = StyleSheet.create({
//   headerBtn: {
//     paddingVertical: "0.6%",
//     backgroundColor: "#fff",
//     borderRadius: 6,
//     marginRight: "2%",
//     marginVertical: "1%",
//     width: "10%",
//     alignSelf: "flex-end",
//     alignItems: "center",
//     boxShadow:
//       "rgba(243, 62, 68, 0.4) 0px 0px 0px 2px, rgba(247, 73, 73, 0.65) 0px 4px 6px -1px, rgba(232, 79, 79, 0.49) 0px 1px 0px inset",
//   },
//   headerBtnText: {
//     color: "#000",
//     fontWeight: 700,
//     fontSize: 16,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: Platform.OS === "web" ? "center" : "flex-end",
//     alignItems: "center",
//   },
//   card: {
//     // backgroundColor: "#fff",
//     // borderRadius: 16,
//     // padding: 20,
//     // alignItems: "center",
//     // overflow: "hidden",

//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//     //overflow: "hidden",
//     minHeight: 400, // ✅ ensure visible
//     justifyContent: "center",
//     borderWidth: 1,
//     width: "50%",
//   },
//   webCard: {
//     width: 300,
//   },
//   mobileCard: {
//     width: "100%",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 40,
//   },
//   slide: {
//     width: SLIDE_WIDTH, // 👈 must match frame width
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 10,
//   },
//   input: {
//     width: "90%",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 12,
//   },
//   btn: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 10,
//     borderRadius: 8,
//     width: "90%",
//     alignItems: "center",
//   },
//   googleBtn: {
//     backgroundColor: "#DB4437",
//     paddingVertical: 10,
//     borderRadius: 8,
//     width: "90%",
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   closeBtn: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     backgroundColor: "#000",
//     borderRadius: 15,
//     width: 25,
//     height: 25,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Modal,
//   Animated,
//   StyleSheet,
//   Easing,
//   Platform,
//   Dimensions,
//   Image,
//   Pressable,
// } from "react-native";
// import * as WebBrowser from "expo-web-browser";
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
// import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";

// WebBrowser.maybeCompleteAuthSession();

// export default function HeaderLoginSignUp({ isDoctorPortal = false, user }) {
//   const [visible, setVisible] = useState(false);
//   const [isSideBarVisible, setIsSideBarVisible] = useState(false);
//   const [dropdownVisible, setDropdownVisible] = useState(false);
//   const [step, setStep] = useState(0); // 0: mobile, 1: otp, 2: name
//   const [mobile, setMobile] = useState("");
//   const [otp, setOtp] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");

//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const bottomAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const navigation = useNavigation();
//   const SLIDE_WIDTH = 300;
//   const [isHovered, setIsHovered] = useState(false);
//   const isApp = Platform.OS === "ios" || Platform.OS === "android";

//   // ===== Modal Logic =====
//   const openModal = () => {
//     slideAnim.stopAnimation();
//     slideAnim.setValue(0);
//     setStep(0);
//     setVisible(true);

//     if (Platform.OS !== "web") {
//       bottomAnim.setValue(Dimensions.get("window").height);
//       Animated.timing(bottomAnim, {
//         toValue: 0,
//         duration: 300,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   const closeModal = () => {
//     if (Platform.OS !== "web") {
//       Animated.timing(bottomAnim, {
//         toValue: Dimensions.get("window").height,
//         duration: 200,
//         useNativeDriver: true,
//       }).start(() => {
//         setVisible(false);
//         slideAnim.setValue(0);
//         setStep(0);
//       });
//     } else {
//       setVisible(false);
//       slideAnim.setValue(0);
//       setStep(0);
//     }
//   };

//   useEffect(() => {
//     if (!visible) {
//       slideAnim.setValue(0);
//       setStep(0);
//     }
//   }, [visible]);

//   const handleNext = () => {
//     if (step < 2) {
//       const nextStep = step + 1;
//       Animated.timing(slideAnim, {
//         toValue: -nextStep * SLIDE_WIDTH,
//         duration: 300,
//         easing: Easing.ease,
//         useNativeDriver: true,
//       }).start();
//       setStep(nextStep);
//     } else {
//       navigation.navigate("DoctorPatientLandingPage");
//       closeModal();
//     }
//   };

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

//   // ===== MAIN UI =====
//   return (
//     <>
//       {/* ================= MOBILE HEADER ================= */}
//       {isApp ? (
//         <View style={styles.appHeaderContainer}>
//           {/* Sidebar Modal */}
//           <Modal
//             visible={isSideBarVisible}
//             transparent
//             onRequestClose={() => setIsSideBarVisible(false)}
//           >
//             <View style={styles.modalContainer}>
//               <View style={styles.mobileSidebar}>
//                 {isDoctorPortal ? (
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

//           {/* Top Header */}
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
//                   <MaterialIcons name="person" size={30} color="black" />
//                 </Pressable>

//                 {dropdownVisible && (
//                   <View style={styles.dropdownMain}>
//                     <TouchableOpacity
//                       onPress={openModal}
//                       style={styles.dropdownItem}
//                     >
//                       <Text style={styles.dropdownText}>Login / Signup</Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               </View>

//               <Pressable>
//                 <MaterialIcons name="notifications" size={30} color="black" />
//               </Pressable>
//             </View>
//           </View>

//           {/* Hello, User */}
//           {!isDoctorPortal && (
//             <View style={styles.usernameApp}>
//               <Text style={{ fontWeight: "600", fontSize: 19 }}>Hello,</Text>
//               <Text
//                 style={{
//                   fontWeight: "800",
//                   color: "#000",
//                   fontSize: 19,
//                 }}
//               >
//                 {" "}
//                 {user?.name ? user?.name : "User"}!
//               </Text>
//             </View>
//           )}
//         </View>
//       ) : (
//         /* ================= WEB HEADER ================= */
//         <Animated.View
//           style={[
//             styles.headerBtn,
//             {
//               backgroundColor: isHovered ? "#f96166ff" : "#fff",
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//           onMouseEnter={onHoverIn}
//           onMouseLeave={onHoverOut}
//         >
//           <TouchableOpacity onPress={openModal} activeOpacity={0.8}>
//             <Text
//               style={[
//                 styles.headerBtnText,
//                 {
//                   color: isHovered ? "#fff" : "#000",
//                   transform: [{ translateY: isHovered ? 1 : 0 }],
//                 },
//               ]}
//             >
//               Login / Signup
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       )}

//       {/* ============= LOGIN/SIGNUP MODAL (shared web + mobile) ============= */}
//       <Modal transparent visible={visible} animationType="fade">
//         <View style={styles.overlay}>
//           <Animated.View
//             style={[
//               styles.card,
//               Platform.OS === "web"
//                 ? styles.webCard
//                 : [
//                     styles.mobileCard,
//                     { transform: [{ translateY: bottomAnim }] },
//                   ],
//             ]}
//           >
//             <Animated.View
//               style={{
//                 width: SLIDE_WIDTH,
//                 overflow: "hidden",
//                 alignItems: "center",
//               }}
//             >
//               <Animated.View
//                 style={{
//                   flexDirection: "row",
//                   width: SLIDE_WIDTH * 3,
//                   transform: [{ translateX: slideAnim }],
//                 }}
//               >
//                 {/* Step 0: Mobile Input */}
//                 <View style={styles.slide}>
//                   <Text style={styles.title}>Enter your mobile number</Text>
//                   <TextInput
//                     placeholder="Mobile Number"
//                     keyboardType="phone-pad"
//                     style={styles.input}
//                     value={mobile}
//                     onChangeText={setMobile}
//                   />
//                   <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                     <Text style={styles.btnText}>Continue</Text>
//                   </TouchableOpacity>
//                   <Text style={{ marginVertical: 8, color: "#666" }}>or</Text>
//                   <TouchableOpacity style={styles.googleBtn}>
//                     <Text style={styles.btnText}>Continue with Google</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Step 1: OTP */}
//                 <View style={styles.slide}>
//                   <Text style={styles.title}>Enter OTP sent to {mobile}</Text>
//                   <TextInput
//                     placeholder="Enter OTP"
//                     keyboardType="numeric"
//                     style={styles.input}
//                     value={otp}
//                     onChangeText={setOtp}
//                   />
//                   <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                     <Text style={styles.btnText}>Verify</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Step 2: Name Input */}
//                 <View style={styles.slide}>
//                   <Text style={styles.title}>Complete your profile</Text>
//                   <TextInput
//                     placeholder="First Name"
//                     style={styles.input}
//                     value={firstName}
//                     onChangeText={setFirstName}
//                   />
//                   <TextInput
//                     placeholder="Last Name"
//                     style={styles.input}
//                     value={lastName}
//                     onChangeText={setLastName}
//                   />
//                   <TouchableOpacity style={styles.btn} onPress={handleNext}>
//                     <Text style={styles.btnText}>Continue</Text>
//                   </TouchableOpacity>
//                 </View>
//               </Animated.View>
//             </Animated.View>

//             <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
//               <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const SLIDE_WIDTH = 300;

// const styles = StyleSheet.create({
//   // ===== Web Header =====
//   headerBtn: {
//     paddingVertical: "0.6%",
//     backgroundColor: "#fff",
//     borderRadius: 6,
//     marginRight: "2%",
//     marginVertical: "1%",
//     width: "10%",
//     alignSelf: "flex-end",
//     alignItems: "center",
//   },
//   headerBtnText: {
//     fontWeight: "700",
//     fontSize: 16,
//   },

//   // ===== Mobile Header =====
//   appHeaderContainer: {
//     backgroundColor: "#fff",
//     padding: 10,
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
//   },
//   authButtonsApp: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     position: "relative",
//     zIndex: 10,
//   },
//   dropdownMain: {
//     position: "absolute",
//     top: 40,
//     right: 0,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 10,
//     padding: 10,
//     zIndex: 100,
//   },
//   dropdownItem: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   dropdownText: {
//     fontSize: 16,
//     fontWeight: "600",
//   },

//   doctorButtonApp: {
//     backgroundColor: "#f96166",
//     padding: 8,
//     borderRadius: 6,
//     marginBottom: 8,
//   },
//   doctorButtonTextApp: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   usernameApp: {
//     marginTop: 5,
//     flexDirection: "row",
//   },

//   // ===== Modal Login =====
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: Platform.OS === "web" ? "center" : "flex-end",
//     alignItems: "center",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     width: "80%",
//   },
//   webCard: {
//     width: 300,
//   },
//   mobileCard: {
//     width: "100%",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 40,
//   },
//   slide: {
//     width: SLIDE_WIDTH,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 10,
//   },
//   input: {
//     width: "90%",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 12,
//   },
//   btn: {
//     backgroundColor: "#007AFF",
//     paddingVertical: 10,
//     borderRadius: 8,
//     width: "90%",
//     alignItems: "center",
//   },
//   googleBtn: {
//     backgroundColor: "#DB4437",
//     paddingVertical: 10,
//     borderRadius: 8,
//     width: "90%",
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   closeBtn: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     backgroundColor: "#000",
//     borderRadius: 15,
//     width: 25,
//     height: 25,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Easing,
  Platform,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import {
  initiateUserSignupVerification,
  verifyMobileOtp,
  useGoogleAuth,
} from "../../utils/AuthService";
import { getErrorMessage } from "../../utils/errorUtils";
import { AuthContext } from "../../contexts/AuthContext";
import { useLoginModal } from "../../contexts/LoginModalContext";
import { useRole } from "../../contexts/RoleContext";

WebBrowser.maybeCompleteAuthSession();

export default function HeaderLoginSignUp({ isDoctorPortal = false, user }) {
  const [visible, setVisible] = useState(false);
  const [isSideBarVisible, setIsSideBarVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const [isHovered, setIsHovered] = useState(false);
  const WEB_CARD_WIDTH = 300; // or your preferred width
  const [otpStatus, setOtpStatus] = useState("idle"); // idle | sending | sent | verifying | verified
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [verificationToken, setVerificationToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [mode, setMode] = useState("signup"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [loginMethod, setLoginMethod] = useState("phone"); // "email" or "phone"
  const [signupMethod, setSignupMethod] = useState("phone"); // "email" or "phone"
  const [signupEmail, setSignupEmail] = useState(""); // Separate email for signup
  const otpTimerRef = useRef(null);
  const {
    signup: signupHandler,
    login: loginHandler,
    logout: logoutHandler,
    googleLogin,
    loginWithGoogle,
  } = useContext(AuthContext);
  const { setRole } = useRole();
  const { registerOpenModal } = useLoginModal();
  const [request, response, promptAsync] = useGoogleAuth();
  const [googleHandled, setGoogleHandled] = useState(false);

  const [cardWidth, setCardWidth] = useState(null);

  useEffect(() => {
    const width =
      Platform.OS === "web"
        ? WEB_CARD_WIDTH
        : Dimensions.get("window").width * 0.9;

    setCardWidth(width);
  }, []);

  useEffect(() => {
    if (otpCountdown <= 0) {
      clearOtpTimer();
      return;
    }

    clearOtpTimer();
    otpTimerRef.current = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearOtpTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearOtpTimer();
    };
  }, [otpCountdown]);

  useEffect(() => {
    return () => {
      clearOtpTimer();
    };
  }, []);

  // Handle Google authentication response
  useEffect(() => {
    if (Platform.OS === "web" && visible) {
      const handleGoogleResponse = async () => {
        if (response?.type === "success" && !googleHandled) {
          setGoogleHandled(true);
          setErrorMessage("");
          setInfoMessage("");
          setIsProcessing(true);
          try {
            const user = await googleLogin(response);
            if (user) {
              setInfoMessage("Login successful! Redirecting...");
              setTimeout(() => {
                closeModal();
                // Navigation will be handled by AuthContext or app state change
              }, 1000);
            } else {
              setIsProcessing(false);
            }
          } catch (error) {
            console.error("❌ Google login error:", error);
            setErrorMessage(getErrorMessage(error));
            setIsProcessing(false);
            setGoogleHandled(false);
          }
        } else if (response?.type === "error" && !googleHandled) {
          setGoogleHandled(true);
          setErrorMessage("Google authentication cancelled or failed.");
          setIsProcessing(false);
        }
      };
      handleGoogleResponse();
    }
  }, [response, googleHandled, googleLogin, visible, closeModal]);

  // Detect mobile devices (native app or small web screens)
  const isApp = Platform.OS === "ios" || Platform.OS === "android";
  const isSmallScreen =
    Platform.OS === "web" && Dimensions.get("window").width <= 820;
  const isMobile = isApp || isSmallScreen;
  const sanitizeDigits = (value = "") => value.replace(/\D/g, "");
  const normalizedDigits = sanitizeDigits(mobile);
  const isPhoneValid = normalizedDigits.length >= 10;
  const isOtpComplete = otp.trim().length === 6;
  const hasValidPassword = password.trim().length >= 5;

  const clearOtpTimer = () => {
    if (otpTimerRef.current) {
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = null;
    }
  };

  const buildPhoneNumber = () => {
    const trimmed = mobile.trim();
    if (!trimmed) return "";
    const digitsOnly = sanitizeDigits(trimmed);
    if (!digitsOnly) return "";
    if (trimmed.startsWith("+")) {
      return `+${digitsOnly}`;
    }
    const localDigits = digitsOnly.slice(-10);
    return `+91${localDigits}`;
  };

  const resetFlow = () => {
    clearOtpTimer();
    setOtpStatus("idle");
    setOtpCountdown(0);
    setVerificationToken("");
    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(false);
    setIsSigningUp(false);
    setMobile("");
    setOtp("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setEmail("");
    setSignupEmail("");
    setShowPassword(false);
    setStep(0);
    setGoogleHandled(false);
  };

  // ===== Modal Logic =====
  const animateToStep = (targetStep, widthOverride) => {
    const width = widthOverride ?? cardWidth ?? WEB_CARD_WIDTH;
    Animated.timing(slideAnim, {
      toValue: -targetStep * width,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
    setStep(targetStep);
  };

  // Check for email verification token when modal opens
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (visible && mode === "signup" && signupMethod === "email") {
        try {
          const stored = await AsyncStorage.getItem("@signupVerification");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.token && parsed.email) {
              setVerificationToken(parsed.token);
              setSignupEmail(parsed.email);
              setStep(2); // Skip to profile completion step
              setInfoMessage("Email verified! Complete your profile.");
            }
          }
        } catch (error) {
          console.warn("Failed to check email verification token", error);
        }
      }
    };
    checkEmailVerification();
  }, [visible, mode, signupMethod]);

  const openModal = ({ mode: initialMode = "login" } = {}) => {
    slideAnim.stopAnimation();
    slideAnim.setValue(0);
    resetFlow();
    setMode(initialMode);
    setVisible(true);

    if (Platform.OS !== "web") {
      bottomAnim.setValue(Dimensions.get("window").height);
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  // Register openModal function with context so it can be called from anywhere
  useEffect(() => {
    registerOpenModal(openModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only register once on mount

  const closeModal = useCallback(() => {
    if (Platform.OS !== "web") {
      Animated.timing(bottomAnim, {
        toValue: Dimensions.get("window").height,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        slideAnim.setValue(0);
        resetFlow();
        setStep(0);
      });
    } else {
      setVisible(false);
      slideAnim.setValue(0);
      resetFlow();
      setStep(0);
    }
  });

  useEffect(() => {
    if (!visible) {
      slideAnim.setValue(0);
      setStep(0);
      resetFlow();
    }
  }, [visible]);

  if (cardWidth === null) {
    return null;
  }

  const handleBack = () => {
    if (step > 0) {
      animateToStep(step - 1);
    }
  };

  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      setErrorMessage("Please enter a valid mobile number.");
      return false;
    }

    const phoneNumber = buildPhoneNumber();
    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtpStatus("sending");
    try {
      await initiateUserSignupVerification({ phoneNumber });
      setOtpStatus("sent");
      setOtpCountdown(60);
      setInfoMessage("OTP sent to your mobile number.");
      return true;
    } catch (error) {
      setOtpStatus("idle");
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendEmailVerification = async () => {
    const emailValue = signupEmail.trim().toLowerCase();
    if (!emailValue) {
      setErrorMessage("Please enter your email address.");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtpStatus("sending");
    try {
      await initiateUserSignupVerification({ email: emailValue });
      setOtpStatus("sent");
      setInfoMessage(
        "Verification email sent! Please check your inbox and click the verification link."
      );
      // Move to a success step showing instructions
      animateToStep(1);
      return true;
    } catch (error) {
      setOtpStatus("idle");
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpComplete) {
      setErrorMessage("Please enter the 6-digit OTP.");
      return false;
    }

    const phoneNumber = buildPhoneNumber();
    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setOtpStatus("verifying");
    try {
      const response = await verifyMobileOtp({
        phoneNumber,
        otp: otp.trim(),
      });

      if (response?.verification_token) {
        setVerificationToken(response.verification_token);
      }
      setOtpStatus("verified");
      setInfoMessage("Phone verified successfully.");
      return true;
    } catch (error) {
      setOtpStatus("sent");
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }

    if (!hasValidPassword) {
      setErrorMessage("Password must be at least 5 characters.");
      return;
    }

    if (!verificationToken) {
      setErrorMessage(
        signupMethod === "email"
          ? "Please verify your email first."
          : "Please verify your phone number first."
      );
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    setErrorMessage("");
    setInfoMessage("");
    setIsSigningUp(true);
    setIsProcessing(true);

    try {
      // Call the signup API directly
      await signupHandler({
        username: fullName,
        password,
        verificationToken,
        phoneNumber: signupMethod === "phone" ? buildPhoneNumber() : undefined,
        email:
          signupMethod === "email"
            ? signupEmail.trim().toLowerCase()
            : undefined,
        location: "", // Optional - can be empty
      });

      // Clear cached verification token
      try {
        await AsyncStorage.removeItem("@signupVerification");
      } catch (error) {
        console.warn("Failed to clear cached verification token", error);
      }

      // Set role and navigate
      setRole("patient");
      await AsyncStorage.setItem("userRole", "patient");

      setInfoMessage("Signup successful! Redirecting to login...");

      setTimeout(() => {
        setMode("login");
        closeModal();
      }, 1500);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      setIsSigningUp(false);
      setIsProcessing(false);
    }
  };

  const handleLogin = async () => {
    if (isProcessing) return;

    const identifier = loginMethod === "email" ? email.trim() : mobile.trim();
    if (!identifier) {
      setErrorMessage(
        loginMethod === "email"
          ? "Please enter your email address."
          : "Please enter your phone number."
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);

    try {
      // Normalize phone number if logging in with phone
      const normalizedPhoneNumber =
        loginMethod === "phone" ? buildPhoneNumber() : undefined;

      await loginHandler(
        {
          email: loginMethod === "email" ? identifier : undefined,
          phoneNumber: normalizedPhoneNumber,
          password,
        },
        navigation
      );

      setInfoMessage("Login successful! Redirecting...");
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForgotPassword = () => {
    const params =
      loginMethod === "email" && email.trim()
        ? { email: email.trim() }
        : undefined;
    closeModal();
    navigation.navigate("ForgotPassword", params);
  };

  const handleNext = async () => {
    if (isProcessing) return;

    // Login mode - handle login directly
    if (mode === "login") {
      handleLogin();
      return;
    }

    // Signup mode - continue with existing flow
    if (step === 0) {
      if (signupMethod === "phone") {
        const sent = await handleSendOtp();
        if (sent) {
          animateToStep(1);
        }
      } else {
        // Email signup
        const sent = await handleSendEmailVerification();
        // handleSendEmailVerification already moves to step 1
      }
    } else if (step === 1) {
      if (signupMethod === "phone") {
        const verified = await handleVerifyOtp();
        if (verified) {
          animateToStep(2);
        }
      } else {
        // Email signup - step 1 shows success message, user should check email
        // They'll come back via email link, so we don't auto-advance
        // But if they already have verification token, move to step 2
        if (verificationToken) {
          animateToStep(2);
        }
      }
    } else {
      handleCompleteProfile();
    }
  };

  const handleResendOtp = async () => {
    if (isProcessing || otpCountdown > 0) return;
    await handleSendOtp();
  };

  const handleLogout = async () => {
    try {
      await logoutHandler();
      setDropdownVisible(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGoogleLogin = async () => {
    if (isProcessing) return;

    setErrorMessage("");
    setInfoMessage("");
    setIsProcessing(true);
    setGoogleHandled(false);

    try {
      if (Platform.OS === "web") {
        if (request) {
          console.log("👉 Starting Google login (Web)...");
          await promptAsync({ useProxy: false });
        } else {
          setErrorMessage(
            "Google authentication is not ready. Please try again."
          );
          setIsProcessing(false);
        }
      } else {
        console.log("👉 Starting Google login (Mobile App)...");
        const user = await loginWithGoogle();
        if (user) {
          setInfoMessage("Login successful! Redirecting...");
          setTimeout(() => {
            closeModal();
          }, 1000);
        } else {
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error("❌ Google login failed:", err);
      setErrorMessage(getErrorMessage(err));
      setIsProcessing(false);
      setGoogleHandled(false);
    }
  };

  const isEmailLogin = loginMethod === "email";
  const loginIdentifier = isEmailLogin ? email.trim() : mobile.trim();
  const canLogin = loginIdentifier && password.trim().length >= 5;

  const isEmailSignup = signupMethod === "email";
  const isEmailValid =
    signupEmail.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim().toLowerCase());

  const isPrimaryDisabled =
    mode === "login"
      ? !canLogin || isProcessing
      : step === 0
      ? isEmailSignup
        ? !isEmailValid || isProcessing
        : !isPhoneValid || isProcessing
      : step === 1
      ? isEmailSignup
        ? false // Email verification step - button can be clicked to check for token
        : !isOtpComplete || isProcessing
      : !verificationToken ||
        !firstName.trim() ||
        !hasValidPassword ||
        isProcessing ||
        isSigningUp;

  // Hover effects for web
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

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      {isMobile ? (
        <View style={styles.appHeaderContainer}>
          {/* Sidebar Modal */}
          <Modal
            visible={isSideBarVisible}
            transparent
            onRequestClose={() => setIsSideBarVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.mobileSidebar}>
                {isDoctorPortal ? (
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

          {/* Top Header */}
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
              {/* Profile Icon */}
              <View style={{ position: "relative" }}>
                <Pressable
                  style={styles.authButtonBox}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                  <MaterialIcons name="person" size={30} color="black" />
                </Pressable>

                {dropdownVisible && (
                  <View style={styles.dropdownMain}>
                    {user ? (
                      // Logged in - show user info and logout
                      <>
                        <View style={styles.userInfoContainer}>
                          <Text style={styles.userNameText}>
                            {user?.name || "User"}
                          </Text>
                          {user?.email && (
                            <Text style={styles.userEmailText}>
                              {user.email}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={handleLogout}
                          style={styles.logoutButton}
                        >
                          <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      // Not logged in - show login/signup
                      <TouchableOpacity
                        onPress={openModal}
                        onPressIn={() => {
                          setIsHovered(true);
                          Animated.spring(scaleAnim, {
                            toValue: 0.96,
                            friction: 5,
                            useNativeDriver: true,
                          }).start();
                        }}
                        onPressOut={() => {
                          setIsHovered(false);
                          Animated.spring(scaleAnim, {
                            toValue: 1,
                            friction: 5,
                            useNativeDriver: true,
                          }).start();
                        }}
                        style={({ pressed }) => [
                          styles.animatedDropdownBtn,
                          {
                            backgroundColor:
                              pressed || isHovered ? "#f96166" : "#fff",
                            transform: [{ scale: scaleAnim }],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            { color: isHovered ? "#fff" : "#333" },
                          ]}
                        >
                          Login/SignUp
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Notification Icon */}
              <Pressable>
                <MaterialIcons name="notifications" size={30} color="black" />
              </Pressable>
            </View>
          </View>

          {/* Hello, User */}
          {!isDoctorPortal && (
            <View style={styles.usernameApp}>
              <Text style={{ fontWeight: "600", fontSize: 19 }}>Hello,</Text>
              <Text
                style={{
                  fontWeight: "800",
                  color: "#000",
                  fontSize: 19,
                }}
              >
                {" "}
                {user?.name ? user?.name : "User"}!
              </Text>
            </View>
          )}
        </View>
      ) : (
        /* ================= WEB HEADER ================= */
        <>
          {user ? (
            // Logged in - show user profile with dropdown
            <View style={{ position: "relative" }}>
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
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.headerBtnText,
                      {
                        color: isHovered ? "#fff" : "#333",
                      },
                    ]}
                  >
                    {user?.name || "User"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
              {dropdownVisible && (
                <>
                  <Pressable
                    style={styles.dropdownOverlay}
                    onPress={() => setDropdownVisible(false)}
                  />
                  <View style={styles.webDropdown}>
                    <View style={styles.userInfoContainer}>
                      <Text style={styles.userNameText}>
                        {user?.name || "User"}
                      </Text>
                      {user?.email && (
                        <Text style={styles.userEmailText}>{user.email}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={handleLogout}
                      style={styles.logoutButton}
                    >
                      <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : (
            // Not logged in - show login/signup button
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
              <TouchableOpacity onPress={openModal} activeOpacity={0.8}>
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
          )}
        </>
      )}

      {/* ============= LOGIN/SIGNUP MODAL (shared web + mobile) ============= */}
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.card,
              Platform.OS === "web"
                ? { width: WEB_CARD_WIDTH, maxWidth: "150vw", minWidth: 350 }
                : [
                    styles.mobileCard,
                    {
                      width: Dimensions.get("window").width * 0.9,
                      minWidth: 200,
                      maxWidth: 420,
                    },
                  ],
            ]}
          >
            {mode === "signup" && step > 0 && (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            )}

            {/* Login/Signup Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  mode === "login" && styles.modeToggleButtonActive,
                ]}
                onPress={() => {
                  setMode("login");
                  setStep(0);
                  resetFlow();
                }}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    mode === "login" && styles.modeToggleTextActive,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  mode === "signup" && styles.modeToggleButtonActive,
                ]}
                onPress={() => {
                  setMode("signup");
                  setStep(0);
                  resetFlow();
                }}
              >
                <Text
                  style={[
                    styles.modeToggleText,
                    mode === "signup" && styles.modeToggleTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <Animated.View
              style={{
                width: cardWidth,
                minHeight: Platform.OS === "web" ? 380 : 450,
                overflow: "hidden",
                // alignItems: "center",
                // justifyContent: "center",
              }}
            >
              {mode === "login" ? (
                // ========== LOGIN MODE ==========
                <View
                  style={[
                    styles.slideBase,
                    { width: cardWidth, flexShrink: 0 },
                  ]}
                >
                  <Text style={styles.titleHead}>Welcome Back!</Text>

                  {/* Login Method Toggle */}
                  <View style={styles.loginToggle}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        !isEmailLogin && styles.toggleButtonActive,
                      ]}
                      onPress={() => setLoginMethod("phone")}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          !isEmailLogin && styles.toggleButtonTextActive,
                        ]}
                      >
                        Phone
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        isEmailLogin && styles.toggleButtonActive,
                      ]}
                      onPress={() => setLoginMethod("email")}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          isEmailLogin && styles.toggleButtonTextActive,
                        ]}
                      >
                        Email
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Email or Phone Input */}
                  {isEmailLogin ? (
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#d3d3d3"
                      keyboardType="email-address"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                    />
                  ) : (
                    <View style={styles.phoneContainer}>
                      <View style={styles.countryCodeBox}>
                        <Text style={styles.countryCodeText}>+91</Text>
                      </View>
                      <TextInput
                        placeholder="Mobile Number"
                        placeholderTextColor="#d3d3d3"
                        keyboardType="phone-pad"
                        style={styles.phoneInput}
                        maxLength={10}
                        value={mobile}
                        onChangeText={setMobile}
                      />
                    </View>
                  )}

                  {/* Password Input */}
                  <View style={styles.passwordField}>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#d3d3d3"
                      style={styles.passwordInput}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword((prev) => !prev)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color="#4b5563"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      isPrimaryDisabled && styles.disabledBtn,
                    ]}
                    onPress={handleLogin}
                    disabled={isPrimaryDisabled}
                  >
                    <Text style={styles.btnText}>
                      {isProcessing ? "Logging in..." : "Log In"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.googleBtn,
                      isProcessing && styles.disabledBtn,
                    ]}
                    onPress={handleGoogleLogin}
                    disabled={isProcessing}
                  >
                    <Text style={[styles.btnText, { color: "#333" }]}>
                      {isProcessing ? "Connecting..." : "Continue with Google"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // ========== SIGNUP MODE ==========
                <Animated.View
                  style={{
                    flexDirection: "row",
                    width: cardWidth * 3,
                    transform: [{ translateX: slideAnim }],
                  }}
                >
                  {/* Step 0: Phone/Email Input */}
                  <View
                    style={[
                      styles.slideBase,
                      { width: cardWidth, flexShrink: 0, minHeight: 200 },
                    ]}
                  >
                    <Text style={styles.titleHead}>
                      Welcome to Kokoro Doctor!
                    </Text>

                    {/* Signup Method Toggle */}
                    <View style={styles.loginToggle}>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          !isEmailSignup && styles.toggleButtonActive,
                        ]}
                        onPress={() => {
                          setSignupMethod("phone");
                          setStep(0);
                          setOtpStatus("idle");
                          setVerificationToken("");
                          setErrorMessage("");
                          setInfoMessage("");
                        }}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            !isEmailSignup && styles.toggleButtonTextActive,
                          ]}
                        >
                          Phone
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          isEmailSignup && styles.toggleButtonActive,
                        ]}
                        onPress={() => {
                          setSignupMethod("email");
                          setStep(0);
                          setOtpStatus("idle");
                          setVerificationToken("");
                          setErrorMessage("");
                          setInfoMessage("");
                        }}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            isEmailSignup && styles.toggleButtonTextActive,
                          ]}
                        >
                          Email
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {isEmailSignup ? (
                      // Email Input
                      <>
                        <Text style={styles.title}>
                          Enter your email address
                        </Text>
                        <TextInput
                          placeholder="Email"
                          placeholderTextColor="#d3d3d3"
                          keyboardType="email-address"
                          style={styles.input}
                          value={signupEmail}
                          onChangeText={setSignupEmail}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          style={[
                            styles.btn,
                            (step !== 0 || isPrimaryDisabled) &&
                              styles.disabledBtn,
                          ]}
                          onPress={handleNext}
                          disabled={step !== 0 || isPrimaryDisabled}
                        >
                          <Text style={styles.btnText}>
                            {isProcessing
                              ? "Sending..."
                              : "Send Verification Email"}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      // Phone Input
                      <>
                        <Text style={styles.title}>
                          Enter your mobile number
                        </Text>
                        <View style={styles.phoneContainer}>
                          <View style={styles.countryCodeBox}>
                            <Text style={styles.countryCodeText}>+91</Text>
                          </View>
                          <TextInput
                            placeholder="Mobile Number"
                            placeholderTextColor="#d3d3d3"
                            keyboardType="phone-pad"
                            style={styles.phoneInput}
                            maxLength={10}
                            value={mobile}
                            onChangeText={setMobile}
                          />
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.btn,
                            (step !== 0 || isPrimaryDisabled) &&
                              styles.disabledBtn,
                          ]}
                          onPress={handleNext}
                          disabled={step !== 0 || isPrimaryDisabled}
                        >
                          <Text style={styles.btnText}>
                            {isProcessing ? "Sending..." : "Send OTP"}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}

                    <View style={styles.dividerContainer}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or</Text>
                      <View style={styles.dividerLine} />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.googleBtn,
                        isProcessing && styles.disabledBtn,
                      ]}
                      onPress={handleGoogleLogin}
                      disabled={isProcessing}
                    >
                      <Text style={[styles.btnText, { color: "#333" }]}>
                        {isProcessing
                          ? "Connecting..."
                          : "Continue with Google"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step 1: OTP (Phone) or Email Verification Success (Email) */}
                  <View
                    style={[styles.slide, { width: cardWidth, flexShrink: 0 }]}
                  >
                    {isEmailSignup ? (
                      // Email verification success message
                      <>
                        <Text style={styles.titleHead}>Check your email!</Text>
                        <Text style={styles.title}>
                          We&apos;ve sent a verification link to {signupEmail}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#6B7280",
                            textAlign: "center",
                            marginTop: 12,
                            paddingHorizontal: 20,
                          }}
                        >
                          Please click the link in the email to verify your
                          account. Once verified, you can complete your signup.
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.btn,
                            (step !== 1 || isPrimaryDisabled) &&
                              styles.disabledBtn,
                            { marginTop: 24 },
                          ]}
                          onPress={async () => {
                            // Check if verification token is available
                            try {
                              const stored = await AsyncStorage.getItem(
                                "@signupVerification"
                              );
                              if (stored) {
                                const parsed = JSON.parse(stored);
                                if (
                                  parsed.token &&
                                  parsed.email ===
                                    signupEmail.trim().toLowerCase()
                                ) {
                                  setVerificationToken(parsed.token);
                                  animateToStep(2);
                                  setInfoMessage(
                                    "Email verified! Complete your profile."
                                  );
                                } else {
                                  setInfoMessage(
                                    "Please click the verification link in your email."
                                  );
                                }
                              } else {
                                setInfoMessage(
                                  "Please click the verification link in your email."
                                );
                              }
                            } catch (error) {
                              setInfoMessage(
                                "Please click the verification link in your email."
                              );
                            }
                          }}
                          disabled={step !== 1 || isPrimaryDisabled}
                        >
                          <Text style={styles.btnText}>
                            I&apos;ve verified my email
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      // Phone OTP Input
                      <>
                        <Text style={styles.title}>
                          Enter OTP sent to {mobile}
                        </Text>
                        <TextInput
                          placeholder="Enter OTP"
                          placeholderTextColor="#d3d3d3"
                          keyboardType="numeric"
                          style={styles.input}
                          value={otp}
                          onChangeText={setOtp}
                        />
                        <TouchableOpacity
                          style={[
                            styles.btn,
                            (step !== 1 || isPrimaryDisabled) &&
                              styles.disabledBtn,
                          ]}
                          onPress={handleNext}
                          disabled={step !== 1 || isPrimaryDisabled}
                        >
                          <Text style={styles.btnText}>Verify OTP</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.resendBtn,
                            (otpCountdown > 0 || isProcessing) &&
                              styles.disabledBtn,
                          ]}
                          onPress={handleResendOtp}
                          disabled={
                            otpCountdown > 0 || isProcessing || step !== 1
                          }
                        >
                          <Text style={styles.resendBtnText}>
                            {otpCountdown > 0
                              ? `Resend OTP in ${otpCountdown}s`
                              : "Resend OTP"}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  {/* Step 2: Name Input */}
                  <View
                    style={[styles.slide, { width: cardWidth, flexShrink: 0 }]}
                  >
                    <Text style={styles.title}>Complete your profile</Text>
                    {isEmailSignup && signupEmail && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#c2415c",
                          textAlign: "center",
                          marginBottom: 8,
                          fontWeight: "500",
                        }}
                      >
                        Verified: {signupEmail}
                      </Text>
                    )}
                    {!isEmailSignup && mobile && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#c2415c",
                          textAlign: "center",
                          marginBottom: 8,
                          fontWeight: "500",
                        }}
                      >
                        Verified: +91{mobile}
                      </Text>
                    )}
                    <TextInput
                      placeholder="First Name"
                      placeholderTextColor="#d3d3d3"
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                    <TextInput
                      placeholder="Last Name"
                      placeholderTextColor="#d3d3d3"
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                    <View style={styles.passwordField}>
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="#d3d3d3"
                        style={styles.passwordInput}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword((prev) => !prev)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={18}
                          color="#4b5563"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.passwordHint}>
                      Password must be at least 5 characters.
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.btn,
                        (step !== 2 || isPrimaryDisabled) && styles.disabledBtn,
                      ]}
                      onPress={handleNext}
                      disabled={step !== 2 || isPrimaryDisabled}
                    >
                      <Text style={styles.btnText}>
                        {isSigningUp ? "Signing up..." : "Sign Up"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </Animated.View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            {infoMessage ? (
              <Text style={styles.infoText}>{infoMessage}</Text>
            ) : null}

            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ===== Web Header =====
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

  // ===== Mobile Header =====
  appHeaderContainer: {
    backgroundColor: "#fff",
    padding: 12,
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
    marginRight: "2%",
  },
  appName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#000",
  },
  authButtonsApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 10,
  },
  authButtonBox: {
    padding: 4,
    borderRadius: 8,
  },

  dropdownMain: {
    position: "absolute",
    right: 0,
    top: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 8,
    minWidth: 160,
    overflow: "hidden",
  },

  animatedDropdownBtn: {
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  dropdownItem: {
    borderRadius: 5,
    alignSelf: "center",
    height: "90%",
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  usernameApp: {
    marginTop: 5,
    flexDirection: "row",
  },

  // ===== Modal Login =====
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: "center",
    zIndex: 99999,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F4F6F8",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  webCard: {
    maxWidth: 420,
  },
  mobileCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: "90%",
  },
  slide: {
    alignItems: "center",
    flexShrink: 0,
    flexGrow: 0,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  slideBase: {
    alignItems: "center",
    flexShrink: 0,
    flexGrow: 0,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  titleHead: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    marginTop: 10,
    marginBottom: 6,
    textAlign: "center",
  },
  input: {
    width: "100%",
    minWidth: 220,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
    color: "#333",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    minHeight: 50,
    backgroundColor: "#FFFFFF",
  },

  countryCodeBox: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
  },

  countryCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  phoneInput: {
    flex: 1,
    paddingLeft: 12,
    fontSize: 15,
    color: "#333",
    paddingVertical: 14,
  },

  btn: {
    backgroundColor: "#f96166",
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#f96166",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  googleBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#F4F6F8",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  resendBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f96166",
    backgroundColor: "transparent",
  },
  resendBtnText: {
    color: "#f96166",
    fontWeight: "600",
    fontSize: 14,
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#DC2626",
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    width: "100%",
  },
  infoText: {
    color: "#c2415c",
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fce7f3",
    borderRadius: 8,
    width: "100%",
  },
  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#333",
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passwordHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#666",
    textAlign: "left",
    width: "100%",
    paddingLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "500",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#F4F6F8",
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  modeToggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  modeToggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeToggleText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  modeToggleTextActive: {
    color: "#333",
  },
  loginToggle: {
    flexDirection: "row",
    backgroundColor: "#F4F6F8",
    borderRadius: 8,
    padding: 4,
    marginTop: 18,
    marginBottom: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleButtonTextActive: {
    color: "#333",
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
  webDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 200,
    zIndex: 1000,
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  dividerText: {
    fontSize: 13,
    color: "#666",
    paddingHorizontal: 12,
    fontWeight: "500",
  },
});
