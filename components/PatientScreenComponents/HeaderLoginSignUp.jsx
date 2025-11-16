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

import React, { useState, useRef, useEffect } from "react";
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const [isHovered, setIsHovered] = useState(false);
  const WEB_CARD_WIDTH = 300; // or your preferred width

  const [cardWidth, setCardWidth] = useState(null);

  useEffect(() => {
    const width =
      Platform.OS === "web"
        ? WEB_CARD_WIDTH
        : Dimensions.get("window").width * 0.9;

    setCardWidth(width);
  }, []);

  // Detect mobile devices (native app or small web screens)
  const isApp = Platform.OS === "ios" || Platform.OS === "android";
  const isSmallScreen =
    Platform.OS === "web" && Dimensions.get("window").width <= 820;
  const isMobile = isApp || isSmallScreen;

  // ===== Modal Logic =====
  const openModal = () => {
    slideAnim.stopAnimation();
    slideAnim.setValue(0);
    setStep(0);
    setMobile(""); // Reset mobile number
    setOtp(""); // Reset OTP
    setFirstName(""); // Reset first name
    setLastName("");
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

  const closeModal = () => {
    if (Platform.OS !== "web") {
      Animated.timing(bottomAnim, {
        toValue: Dimensions.get("window").height,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        slideAnim.setValue(0);
        setStep(0);
      });
    } else {
      setVisible(false);
      slideAnim.setValue(0);
      setStep(0);
    }
  };

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      setStep(0);
      setMobile(""); // Reset mobile number
      setOtp(""); // Reset OTP
      setFirstName(""); // Reset first name
      setLastName("");
    }
  }, [visible]);

  if (cardWidth === null) {
    return null;
  }

  const handleNext = () => {
    if (step < 2) {
      const nextStep = step + 1;
      Animated.timing(slideAnim, {
        toValue: -nextStep * cardWidth,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      setStep(nextStep);
    } else {
      // Step 2 → Navigate to doctor/patient selection
      navigation.navigate("DoctorPatientLandingPage");
      closeModal();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;

      Animated.timing(slideAnim, {
        toValue: -prevStep * cardWidth,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      setStep(prevStep);
    }
  };

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
                    <View style={styles.dropdownMain}>
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
                              pressed || isHovered ? "#f96166ff" : "#fff",
                            transform: [{ scale: scaleAnim }],
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            { color: isHovered ? "#fff" : "#000" },
                          ]}
                        >
                          Login/SignUp
                        </Text>
                      </TouchableOpacity>
                    </View>
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
        <Animated.View
          style={[
            styles.headerBtn,
            {
              backgroundColor: isHovered ? "#f96166ff" : "#fff",
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
                  color: isHovered ? "#fff" : "#000",
                  transform: [{ translateY: isHovered ? 1 : 0 }],
                },
              ]}
            >
              Login / Signup
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
            {step > 0 && (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            )}

            <Animated.View
              style={{
                width: cardWidth,
                minHeight: Platform.OS === "web" ? 380 : 450,
                overflow: "hidden",
                // alignItems: "center",
                // justifyContent: "center",
              }}
            >
              <Animated.View
                style={{
                  flexDirection: "row",
                  width: cardWidth * 3,
                  transform: [{ translateX: slideAnim }],
                }}
              >
                <View
                  style={[
                    styles.slideBase,
                    { width: cardWidth, flexShrink: 0, minHeight: 200 },
                  ]}
                >
                  <Text style={styles.titleHead}>
                    Welcome to Kokoro Doctor!
                  </Text>
                  <Text style={styles.title}>Enter your mobile number</Text>
                  {/* <TextInput
                    placeholder="Mobile Number"
                    keyboardType="phone-pad"
                    style={styles.input}
                    value={mobile}
                    onChangeText={setMobile}
                  /> */}
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

                  <TouchableOpacity style={styles.btn} onPress={handleNext}>
                    <Text style={styles.btnText}>Continue</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, color: "#1e1e1eff" }}>or</Text>
                  <TouchableOpacity style={styles.googleBtn}>
                    <Text style={styles.btnText}>Continue with Google</Text>
                  </TouchableOpacity>
                </View>

                {/* Step 1: OTP */}
                <View
                  style={[styles.slide, { width: cardWidth, flexShrink: 0 }]}
                >
                  <Text style={styles.title}>Enter OTP sent to {mobile}</Text>
                  <TextInput
                    placeholder="Enter OTP"
                    placeholderTextColor="#d3d3d3"
                    keyboardType="numeric"
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <TouchableOpacity style={styles.btn} onPress={handleNext}>
                    <Text style={styles.btnText}>Verify</Text>
                  </TouchableOpacity>
                </View>

                {/* Step 2: Name Input */}
                <View
                  style={[styles.slide, { width: cardWidth, flexShrink: 0 }]}
                >
                  <Text style={styles.title}>Complete your profile</Text>
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
                  <TouchableOpacity style={styles.btn} onPress={handleNext}>
                    <Text style={styles.btnText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </Animated.View>

            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>✕</Text>
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
    paddingVertical: "0.6%",
    backgroundColor: "#fff",
    borderRadius: 6,
    marginRight: "2%",
    marginVertical: "1%",
    width: "10%",
    alignSelf: "flex-end",
    alignItems: "center",
  },
  headerBtnText: {
    fontWeight: "700",
    fontSize: 16,
  },

  // ===== Mobile Header =====
  appHeaderContainer: {
    backgroundColor: "#fff",
    padding: 10,
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
  },
  authButtonsApp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 10,
  },
  authButtonBox: {
    //width:30,
    borderWidth: 1,
  },

  dropdownMain: {
    position: "absolute",
    right: 0,
    //zIndex: 9999,
    elevation: 10,
    marginTop: "80%",
    borderWidth: 1,
  },

  animatedDropdownBtn: {
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    position: "relative",
    paddingVertical: "3%",
    // zIndex: 9999,
  },

  dropdownItem: {
    borderRadius: 5,
    alignSelf: "center",
    height: "90%",
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: "600",
    marginVertical: "6%",
  },
  usernameApp: {
    marginTop: 5,
    flexDirection: "row",
  },

  // ===== Modal Login =====
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31, 31, 31, 0.5)",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: "center",
    zIndex: 99999,
  },
  backBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 20,
    padding: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "5%",
    alignItems: "center",
    justifyContent: "center",
    //width: "80%",
    borderWidth: 2,
    borderColor: "red",
  },
  webCard: {
    //width: "35%",
    borderWidth: 5,
    borderColor: "blue",
  },
  mobileCard: {
    //width: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  slide: {
    alignItems: "center",
    flexShrink: 0,
    flexGrow: 0,
    marginVertical: "5%",
  },
  slideBase: {
    alignItems: "center",
    flexShrink: 0,
    flexGrow: 0,
  },

  titleHead: {
    fontSize: 20,
    fontWeight: 600,
  },

  title: {
    fontSize: 16,
    fontWeight: 400,
    marginTop: "2%",
  },
  input: {
    width: "100%",
    minWidth: 220,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: "2%",
    marginTop: "3%",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: "2%",
    marginTop: "5%",
    height: "10%",
    backgroundColor: "#fff",
  },

  countryCodeBox: {
    paddingHorizontal: "1%",
    paddingVertical: "2%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    height: "100%",
    justifyContent: "center",
  },

  countryCodeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },

  phoneInput: {
    flex: 1,
    paddingLeft: "2%",
    fontSize: 16,
    //color: "#000",
    height: "100%",
    borderColor: "#fff",
  },

  btn: {
    backgroundColor: "#f44f4fff",
    paddingVertical: "2%",
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginVertical: "8%",
  },
  googleBtn: {
    backgroundColor: "#DB4437",
    paddingVertical: "2%",
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginVertical: "3%",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#000",
    borderRadius: 15,
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});
