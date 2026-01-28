// import React, { useEffect, useState } from "react";
// import {
//   Image,
//   Text,
//   ImageBackground,
//   StyleSheet,
//   TouchableOpacity,
//   View,
//   Platform,
//   useWindowDimensions,
//   Dimensions,
//   StatusBar,
//   ScrollView,
//   Alert,
//   Linking,
// } from "react-native";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import SideBarNavigation from "../../../components/PatientScreenComponents/SideBarNavigation";
// import HeaderLoginSignUp from "../../../components/PatientScreenComponents/HeaderLoginSignUp";
// import { payment_api } from "../../../utils/PaymentService";
// import { useLoginModal } from "../../../contexts/LoginModalContext";
// import { useAuth } from "../../../contexts/AuthContext";

// const { width, height } = Dimensions.get("window");

// const DoctorsInfoWithSubscription = ({ navigation, route }) => {
//   const { width } = useWindowDimensions();
//   const [doctors, setDoctors] = useState(route.params?.doctors || null);
//   const [isReady, setIsReady] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState("week"); // "week" or "month"
//   const { user } = useAuth();
//   const { triggerLoginModal } = useLoginModal();
//   console.log("Shobhit:", user, doctors);

//   const descriptionPlaceholder = "Dr. Kislay Shrivastava is a highly accomplished cardiologist with over 15 years of specialized experience in the comprehensive diagnosis and management of cardiovascular diseases. His clinical expertise is complemented by significant contributions to cardiovascular research and medical literature. Dr. Shrivastav maintains an active presence in cardiovascular research, with numerous publications in prestigious peer-reviewed medical journals. His research focuses on advancing clinical outcomes in cardiac care and contributing to evidence-based practices in cardiology. With a decade and a half of clinical experience, Dr. Shrivastav combines evidence-based medicine with personalized treatment protocols, ensuring that each patient receives care tailored to their unique cardiovascular profile."

//   useEffect(() => {
//     const tryParseDoctorFromUrl = () => {
//       try {
//         let encodedDoctor = null;

//         if (Platform.OS === "web") {
//           const urlObj = new URL(window.location.href);
//           encodedDoctor = urlObj.searchParams.get("doctors");
//         } else {
//           Linking.getInitialURL().then((url) => {
//             if (url && url.includes("DoctorsInfoWithSubscription")) {
//               const urlObj = new URL(url);
//               const encoded = urlObj.searchParams.get("doctors");
//               if (encoded) {
//                 const parsed = JSON.parse(decodeURIComponent(encoded));
//                 setDoctors(parsed);
//                 setIsReady(true);
//               }
//             }
//           });
//           return;
//         }

//         if (encodedDoctor) {
//           const decoded = decodeURIComponent(encodedDoctor);
//           const parsed = JSON.parse(decoded);
//           setDoctors(parsed);
//         }
//       } catch (err) {
//         console.error("Error parsing doctor from URL:", err);
//       } finally {
//         setIsReady(true);
//       }
//     };

//     if (!doctors) {
//       tryParseDoctorFromUrl();
//     } else {
//       setIsReady(true);
//     }
//   }, [doctors]);

//   // const handleContinuePayment = async (amount) => {
//   //   Alert.alert("Processing Payment", "Redirecting to payment gateway...");
//   //   try {
//   //     const paymentLink = await payment_api(amount);
//   //     if (paymentLink) {
//   //       Linking.openURL(paymentLink).catch((err) => {
//   //         console.error("Failed to open payment link", err);
//   //         Alert.alert(
//   //           "Error",
//   //           "Unable to open payment link. Please try again."
//   //         );
//   //       });
//   //     }
//   //   } catch (error) {
//   //     Alert.alert("Payment Failed", error.message);
//   //   }
//   // };

//   // const handleSubscribeClick = () => {
//   //   if (!user) {
//   //     triggerLoginModal({ mode: "login" });
//   //     return;
//   //   }

//   //   navigation.navigate("DoctorsSubscriptionPaymentScreen", {
//   //     params: { doctors, selectedPlan },
//   //   });
//   // };

//   // Plan details
//   const weeklyPlan = {
//     plan_id: "PLAN_1_7D_ALL",
//     features: [
//       "1 Specialist consultation within 24hrs",
//       "Unlimited Medilocker access",
//       "Unlimited AI chatbot access",
//       "Ideal for quick clarity and one-time specialist need",
//     ],
//   };

//   const monthlyPlan = {
//     plan_id: "PLAN_2_30D_ALL",
//     features: [
//       "2 Specialist consultations per month",
//       "Unlimited Medilocker storage",
//       "Unlimited AI chatbot access",
//       "Doctor-Patient continuity + follow-up included",
//       "Ideal for ongoing cardiac & gynaec health support",
//     ],
//   };
//   const currentPlan = selectedPlan === "week" ? weeklyPlan : monthlyPlan;

//   const handleContinuePayment = async () => {
//     if (!user) {
//       triggerLoginModal({ mode: "login" });
//       return;
//     }

//     try {
//       const planId = currentPlan.plan_id; // ✅ from selected plan
//       const doctorId = doctors?.doctor_id || doctors?.id;
//       const userId = user?.user_id || user?.id;

//       Alert.alert("Redirecting", "Opening payment gateway...");

//       const paymentLink = await payment_api(planId, doctorId, userId);

//       if (paymentLink) {
//         if (Platform.OS === "web") {
//           window.location.href = paymentLink;
//         } else {
//           await Linking.openURL(paymentLink);
//         }
//       }
//     } catch (error) {
//       Alert.alert("Payment Failed", error.message);
//     }
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
//                   <View style={[styles.header, { height: "12%" }]}>
//                     <HeaderLoginSignUp navigation={navigation} />
//                   </View>
//                   <View style={styles.contentContainer}>
//                     {/* Doctor profile card */}
//                     <View style={styles.doctorProfileCard}>
//                       <View style={styles.doctorProfileDetail}>
//                         <View style={styles.doctorLeftSection}>
//                           <Image
//                             source={doctors?.profilePhoto ?  doctors.profilePhoto : require("../../../assets/Images/dr_kislay.jpg")}
//                             style={styles.doctorImage}
//                           />
//                           <View style={styles.ratingContainer}>
//                             <MaterialIcons
//                               name="star"
//                               size={20}
//                               color="#FFD700"
//                             />
//                             <Text style={styles.ratingText}>{"4.5"}</Text>
//                           </View>
//                         </View>
//                         <View style={styles.doctorInfoSection}>
//                           <Text style={styles.doctorName}>
//                             {doctors?.doctorname ? doctors.doctorname : "Dr. Kislay Shrivastava"}
//                           </Text>
//                           <Text style={styles.doctorCredentials}>
//                             {doctors?.specialization ? doctors.specialization : "Consultant Cardiologist"}
//                           </Text>
//                           <Text style={styles.doctorExperience}>
//                             {`${doctors?.experience ? doctors.experience : "24"} experience`}
//                           </Text>
//                           <Text style={styles.doctorBio}>
//                             {doctors?.description ? doctors.description : descriptionPlaceholder}
//                           </Text>
//                         </View>
//                       </View>
//                       <View style={styles.reviewsSection}>
//                         <Text style={styles.reviewsTitle}>User Reviews</Text>

//                         <View style={styles.reviewsList}>
//                           {Array.isArray(doctors?.reviews) &&
//                             doctors.reviews.map((review, index) => (
//                               <View key={index} style={styles.reviewCard}>
//                                 <View style={styles.reviewTextBox}>
//                                   <ScrollView
//                                     nestedScrollEnabled={true}
//                                     showsVerticalScrollIndicator={false}
//                                   >
//                                     <Text style={styles.reviewText}>
//                                       {review.comment}
//                                     </Text>
//                                   </ScrollView>
//                                 </View>

//                                 <View style={styles.reviewerContainer}>
//                                   {[...Array(5)].map((_, i) => (
//                                     <MaterialIcons
//                                       key={i}
//                                       name={
//                                         i + 1 <= review.rating
//                                           ? "star"
//                                           : i + 0.5 <= review.rating
//                                           ? "star-half"
//                                           : "star-border"
//                                       }
//                                       size={16}
//                                       color="#FFD700"
//                                     />
//                                   ))}
//                                   <Text style={styles.reviewerName}>
//                                     {review.reviewer}
//                                   </Text>
//                                 </View>
//                               </View>
//                             ))}
//                         </View>
//                       </View>
//                     </View>

//                     {/* Subscription section */}
//                     <View style={styles.subscriptionSection}>
//                       <View style={styles.subscriptionTextHead}>
//                         <TouchableOpacity
//                           style={[
//                             styles.rupeesBox,
//                             selectedPlan === "week" && styles.rupeesBoxSelected,
//                           ]}
//                           onPress={() => setSelectedPlan("week")}
//                         >
//                           <Text
//                             style={[
//                               styles.rupeesText,
//                               selectedPlan === "week" &&
//                                 styles.rupeesTextSelected,
//                             ]}
//                           >
//                             ₹499/week
//                           </Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           style={[
//                             styles.rupeesBox,
//                             selectedPlan === "month" &&
//                               styles.rupeesBoxSelected,
//                           ]}
//                           onPress={() => setSelectedPlan("month")}
//                         >
//                           <Text
//                             style={[
//                               styles.rupeesText,
//                               selectedPlan === "month" &&
//                                 styles.rupeesTextSelected,
//                             ]}
//                           >
//                             ₹999/month
//                           </Text>
//                         </TouchableOpacity>
//                       </View>

//                       <View style={styles.subscriptionMetricsBox}>
//                         {currentPlan.features.map((feature, index) => (
//                           <Text key={index} style={styles.metricsTitle}>
//                             - {feature}
//                           </Text>
//                         ))}
//                       </View>

//                       <View style={styles.subscriptionButtonContainer}>
//                         <TouchableOpacity
//                           style={styles.subscribeButton}
//                           onPress={handleContinuePayment}
//                         >
//                           <Text style={styles.subscribeButtonText}>
//                             Purchase Plan
//                           </Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             </ImageBackground>
//           </View>
//         </View>
//       )}

//       {(Platform.OS !== "web" || width < 1000) && (
//         <View style={styles.appContainer}>
//           <ScrollView>
//             <StatusBar barStyle="light-content" backgroundColor="#fff" />

//             <View style={styles.appImageContainer}>
//               <Image
//                 source={{ uri: doctors.profilePhoto }}
//                 style={styles.doctorImage}
//               />
//               <View style={styles.doctornamebox}>
//                 <Text style={styles.doctorName}>{doctors.doctorname}</Text>
//               </View>
//               <View style={styles.doctornamebox}>
//                 <Text style={styles.doctorCredentials}>
//                   ({doctors.specialization})
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.doctorDescription}>
//               <ScrollView
//                 nestedScrollEnabled={true}
//                 showsVerticalScrollIndicator={false}
//               >
//                 <Text style={styles.descriptionText}>
//                   {doctors.description}
//                 </Text>
//               </ScrollView>
//             </View>
//             <View style={styles.experienceRatingContainer}>
//               <View style={styles.experienceSection}>
//                 <Image
//                   source={require("../../../assets/Icons/doctorTool.png")}
//                   style={styles.doctorIcon}
//                 />
//                 <View style={styles.experienceDetail}>
//                   <Text style={styles.experienceText}>Total Experience</Text>
//                   <Text style={styles.experience}>{doctors.experience}</Text>
//                 </View>
//               </View>
//               <View style={styles.verticalLine} />
//               <View style={styles.ratingSection}>
//                 <Image
//                   source={require("../../../assets/Icons/Star.png")}
//                   style={styles.doctorIcon}
//                 />
//                 <TouchableOpacity style={styles.ratingDetail}>
//                   <Text style={styles.ratingText}>Rating & Reviews</Text>
//                   <Text style={styles.rating}>4.9 (5000) </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.firsttext}>
//               <Text style={styles.firstTextstyle}>
//                 To Book Slot Of the Doctor you have to
//               </Text>
//               <Text style={styles.firstTextstyle}>first subscribe them.</Text>
//             </View>

//             <View style={styles.appSubscriptionSection}>
//               <View style={styles.appSubscriptionTextHead}>
//                 <TouchableOpacity
//                   style={[
//                     styles.rupeesBox,
//                     selectedPlan === "week" && styles.rupeesBoxSelected,
//                   ]}
//                   onPress={() => setSelectedPlan("week")}
//                 >
//                   <Text
//                     style={[
//                       styles.rupeesText,
//                       selectedPlan === "week" && styles.rupeesTextSelected,
//                     ]}
//                   >
//                     ₹499/week
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[
//                     styles.rupeesBox,
//                     selectedPlan === "month" && styles.rupeesBoxSelected,
//                   ]}
//                   onPress={() => setSelectedPlan("month")}
//                 >
//                   <Text
//                     style={[
//                       styles.rupeesText,
//                       selectedPlan === "month" && styles.rupeesTextSelected,
//                     ]}
//                   >
//                     ₹999/month
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.appSubscriptionMetricsBox}>
//                 {currentPlan.features.map((feature, index) => (
//                   <Text key={index} style={styles.appMetricsTitle}>
//                     - {feature}
//                   </Text>
//                 ))}
//               </View>

//               <View style={styles.appSubscriptionButtonContainer}>
//                 <TouchableOpacity
//                   style={styles.subscribeButton}
//                   onPress={handleContinuePayment}
//                 >
//                   <Text style={styles.subscribeButtonText}>Purchase Plan</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </ScrollView>
//         </View>
//       )}
//     </>
//   );
// };

// const windowWidth = Dimensions.get("window").width;
// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     alignItems: "center",
//   },
//   card: {
//     backgroundColor: "#F6F6F6",
//     borderRadius: 10,
//     padding: "2%",
//     width: "100%",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 12,
//   },
//   featureItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 4,
//   },
//   featureText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: "#333",
//   },
//   feeSection: {
//     flexDirection: "row",
//     width: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 16,
//     borderRadius: 6,
//     backgroundColor: "#F6F6F6",
//     paddingVertical: 12,
//     gap: 20,
//   },
//   rupees: {
//     backgroundColor: "#F0F0F0",
//     borderRadius: 20,
//   },
//   rupeeImg: {
//     width: 15,
//     height: 15,
//     resizeMode: "contain",
//   },
//   currency: {
//     fontSize: 18,
//     color: "#007BFF",
//     marginRight: 4,
//   },
//   price: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginRight: 8,
//   },
//   line: {
//     height: "100%",
//     borderWidth: 1,
//     borderColor: "#9B9A9A",
//   },
//   feeLabel: {
//     fontSize: 14,
//     color: "#666",
//   },
//   appContainer: {
//     flex: 1,
//     height: "100%",
//     width: "100%",
//     flexDirection: "column",
//     backgroundColor: "#fff",
//   },
//   appImageContainer: {
//     width: "75%",
//     marginVertical: "4%",
//     alignSelf: "center",
//     marginBottom: "3%",
//     borderWidth: 1,
//   },
//   doctorImage: {
//     height: 90,
//     width: 90,
//     alignSelf: "center",
//     borderRadius: 40,
//     ...Platform.select({
//       web: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         marginBottom: 10,
//       },
//     }),
//   },
//   doctornamebox: {
//     alignSelf: "center",
//   },
//   doctorName: {
//     fontSize: 22,
//     fontWeight: 600,
//     color: "#000000",
//     alignSelf: "center",
//     ...Platform.select({
//       web: {
//         fontSize: 22,
//         fontWeight: "bold",
//         color: "#333",
//         alignSelf: windowWidth > 1000 ? "flex-start" : "center",
//       },
//     }),
//   },
//   doctorCredentials: {
//     fontSize: 14,
//     alignSelf: "center",
//     fontWeight: 600,
//     ...Platform.select({
//       web: {
//         fontSize: 14,
//         marginTop: 2,
//         fontWeight: windowWidth < 1000 ? "bold" : "normal",
//         alignSelf: windowWidth > 1000 ? "flex-start" : "center",
//       },
//     }),
//   },
//   doctorDescription: {
//     height: "18%",
//     width: "88%",
//     alignSelf: "center",
//     marginBottom: "6%",
//     borderRadius: 5,
//     boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
//   },
//   descriptionText: {
//     textAlign: "justify",
//     padding: "1%",
//   },
//   experienceRatingContainer: {
//     height: "7%",
//     width: "88%",
//     alignSelf: "center",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     borderRadius: 5,
//     boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
//     backgroundColor: "rgba(255, 252, 252, 1)",
//     padding: "1%",
//     ...Platform.select({
//       web: {
//         minHeight: 60,
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-around",
//         borderWidth: 1,
//         borderColor: "#ddd",
//         boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
//       },
//     }),
//   },
//   experienceSection: {
//     height: "100%",
//     width: "49%",
//     flexDirection: "row",
//     justifyContent: "space-around",
//   },
//   doctorIcon: {
//     alignSelf: "center",
//     height: 26,
//     width: 26,
//     marginHorizontal: "2%",
//     borderRadius: 50,
//   },
//   experienceDetail: {
//     height: "94%",
//     width: "78%",
//     alignSelf: "center",
//     flexDirection: "column",
//   },
//   experienceText: {
//     fontSize: 14,
//     fontWeight: 600,
//     color: " rgb(94, 93, 93)",
//     paddingHorizontal: "4%",
//   },
//   experience: {
//     fontSize: 14,
//     fontWeight: 600,
//     color: "#000000",
//     paddingHorizontal: "4%",
//   },
//   verticalLine: {
//     height: "75%",
//     width: "0.4%",
//     alignSelf: "center",
//     backgroundColor: "#000000",
//   },
//   ratingSection: {
//     height: "100%",
//     width: "48.8%",
//     flexDirection: "row",
//   },
//   ratingDetail: {
//     ...Platform.select({
//       web: {
//         flexDirection: "column",
//         width: "80%",
//       },
//     }),
//   },
//   ratingText: {
//     fontSize: 11,
//     fontWeight: 600,
//     color: " rgb(94, 93, 93)",
//     //paddingHorizontal: "5%",
//     //borderWidth:1,
//     ...Platform.select({
//       web: {
//         marginLeft: "1%",
//         fontSize: 14,
//         fontWeight: 600,
//       },
//     }),
//   },
//   rating: {
//     fontSize: 14,
//     fontWeight: 600,
//     color: "#000000",
//     alignSelf: "center",
//   },
//   bookAppointmentText: {
//     alignSelf: "center",
//     paddingVertical: "2.5%",
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: 600,
//   },
//   bookAppointmentButton: {
//     height: "4%",
//     width: "70%",
//     alignSelf: "center",
//     borderRadius: 8,
//     backgroundColor: "rgb(237, 109, 111)",
//     marginTop: "5%",
//   },
//   firsttext: {
//     padding: "5%",
//   },
//   firstTextstyle: {
//     fontSize: 18,
//   },
//   webContainer: {
//     flex: 1,
//     flexDirection: "row",
//     height: "100%",
//     width: "100%",
//   },
//   imageContainer: {
//     height: "100%",
//     width: "100%",
//     marginVertical: "10%",
//     alignSelf: "center",
//   },
//   feesBox: {
//     height: "90%",
//     width: "60%",
//     marginHorizontal: "3.5%",
//     alignSelf: "center",
//     flexDirection: "column",
//   },
//   fees: {
//     fontSize: 16,
//     fontWeight: 600,
//     color: "#000000",
//     paddingVertical: "1%",
//   },
//   feesText: {
//     fontSize: 14,
//     fontWeight: 600,
//     color: " rgb(94, 93, 93)",
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
//     backgroundColor: "#f5f5f5",
//   },
//   Right: {
//     height: "100%",
//     width: "85%",
//     display: "flex",
//     flexDirection: "column",
//   },
//   header: {
//     zIndex: 2,
//     ...Platform.select({
//       web: {
//         width: "100%",
//         marginBottom: 20,
//       },
//     }),
//   },
//   contentContainer: {
//     flex: 1,
//     flexDirection: "row",
//     backgroundColor: "rgba(138, 112, 255, 0.8)",
//     marginBottom: "10%",
//     borderRadius: 20,
//     overflow: "hidden",
//     width: "90%",
//     marginHorizontal: "5%",
//     padding: "1%",
//   },
//   doctorProfileCard: {
//     width: "60%",
//     height: "90%",
//     flexDirection: "column",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: "2%",
//     margin: "2%",
//     justifyContent: "space-between",
//   },
//   doctorProfileDetail: {
//     height: "72%",
//     width: "100%",
//     flexDirection: "row",
//   },
//   doctorLeftSection: {
//     width: "20%",
//     height: "48%",
//     alignItems: "center",
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 5,
//   },
//   doctorInfoSection: {
//     width: "80%",
//     height: "85%",
//     paddingLeft: "1%",
//   },
//   doctorExperience: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 2,
//     marginBottom: 10,
//   },
//   doctorBio: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     marginBottom: 15,
//   },
//   reviewsSection: {
//     height: "40%",
//     bottom: "10%",
//   },
//   reviewsTitle: {
//     fontSize: 15,
//     fontWeight: 500,
//     marginBottom: 10,
//   },
//   reviewsList: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     borderColor: "red",
//     height: "80%",
//   },
//   reviewCard: {
//     height: "100%",
//     width: "30%",
//     backgroundColor: "#ffebee",
//     borderRadius: 10,
//     padding: "1%",
//   },
//   reviewTextBox: {
//     height: "80%",
//     width: "100%",
//   },
//   reviewText: {
//     fontSize: 13,
//     color: "#000",
//     marginBottom: "3%",
//     fontWeight: 400,
//     fontStyle: "italic",
//   },
//   reviewerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: "2%",
//   },
//   reviewerName: {
//     fontSize: 12,
//     color: "#666",
//     marginLeft: "2%",
//   },
//   subscriptionSection: {
//     width: "30%",
//     height: "90%",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     marginTop: "2%",
//     marginLeft: "5%",
//   },
//   appSubscriptionSection: {
//     borderWidth: 1,
//     height: "52%",
//     width: "90%",
//     alignSelf: "center",
//     borderRadius: 10,
//   },
//   appSubscriptionTextHead: {
//     flexDirection: "row",
//     height: "12%",
//     width: "99%",
//     marginTop: "1%",
//     marginLeft: "1%",
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//     overflow: "hidden",
//     borderWidth: 1,
//     alignSelf: "center",
//   },
//   subscriptionTextHead: {
//     flexDirection: "row",
//     height: "10%",
//     width: "85%",
//     marginTop: "10%",
//     marginLeft: "8%",
//     borderRadius: 5,
//     overflow: "hidden",
//   },
//   rupeesBox: {
//     width: "50%",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRightWidth: 0.5,
//     borderColor: "#ddd",
//   },
//   rupeesBoxSelected: {
//     backgroundColor: "#8A70FF",
//   },
//   rupeesText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#333",
//   },
//   rupeesTextSelected: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   subscriptionTextTitle: {
//     fontSize: 14,
//     fontWeight: 400,
//     color: "#000000",
//   },
//   subscriptionMetricsBox: {
//     height: "50%",
//     width: "85%",
//     backgroundColor: "#F6F6F6",
//     borderRadius: 5,
//     alignSelf: "center",
//     marginTop: "4%",
//     paddingTop: "3%",
//   },
//   appSubscriptionMetricsBox: {
//     height: "45%",
//     width: "98%",
//     backgroundColor: "#F6F6F6",
//     borderRadius: 10,
//     alignSelf: "center",
//     marginTop: "1%",
//     paddingTop: "1%",
//     alignSelf: "center",
//   },
//   metricsTitle: {
//     fontSize: 13,
//     fontWeight: 400,
//     color: "#000000",
//     marginLeft: "3%",
//     marginTop: "1%",
//   },
//   appMetricsTitle: {
//     fontSize: 14,
//     fontWeight: 400,
//     color: "#000000",
//     marginLeft: "1%",
//     marginTop: "1%",
//   },
//   subscriptionButtonContainer: {
//     height: "30%",
//     width: "70%",
//     alignSelf: "center",
//     alignItems: "center",
//     marginTop: "3%",
//     flexDirection: "column",
//   },
//   appSubscriptionButtonContainer: {
//     height: "50%",
//     width: "70%",
//     alignSelf: "center",
//     alignItems: "center",
//     marginTop: "3%",
//     flexDirection: "column",
//   },
//   subscriptionTextBox: {
//     height: "20%",
//     width: "80%",
//     marginTop: "10%",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },
//   priceText: {
//     fontSize: 16,
//     fontWeight: 500,
//     color: "#000000",
//     marginLeft: "18%",
//   },
//   feeText: {
//     fontSize: 13,
//     fontWeight: 400,
//     color: "#888888",
//     marginRight: "15%",
//   },
//   subscribeButton: {
//     height: "24%",
//     width: "80%",
//     marginTop: "2%",
//     backgroundColor: "#FF7072",
//     borderRadius: 5,
//   },
//   subscribeButtonText: {
//     fontSize: 16,
//     fontWeight: 500,
//     color: "#fff",
//     alignSelf: "center",
//     fontStyle: "Medium",
//     padding: "1%",
//   },
// });

// export default DoctorsInfoWithSubscription;

import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  useWindowDimensions,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SideBarNavigation from "../../../components/PatientScreenComponents/SideBarNavigation";
import HeaderLoginSignUp from "../../../components/PatientScreenComponents/HeaderLoginSignUp";
import { payment_api } from "../../../utils/PaymentService";
import { useLoginModal } from "../../../contexts/LoginModalContext";
import { useAuth } from "../../../contexts/AuthContext";
import BackButton from "../../../components/PatientScreenComponents/BackButton";
import { API_URL } from "../../../env-vars";

const { width, height } = Dimensions.get("window");

const DoctorsInfoWithSubscription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { doctorId } = route.params || {}; // ✅ Get doctorId from route params
  const [doctors, setDoctors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("week");
  const { user } = useAuth();
  const { triggerLoginModal } = useLoginModal();

  const descriptionPlaceholder =
    "Dr. Kislay Shrivastava is a highly accomplished cardiologist with over 15 years of specialized experience in the comprehensive diagnosis and management of cardiovascular diseases. His clinical expertise is complemented by significant contributions to cardiovascular research and medical literature. Dr. Shrivastav maintains an active presence in cardiovascular research, with numerous publications in prestigious peer-reviewed medical journals. His research focuses on advancing clinical outcomes in cardiac care and contributing to evidence-based practices in cardiology. With a decade and a half of clinical experience, Dr. Shrivastav combines evidence-based medicine with personalized treatment protocols, ensuring that each patient receives care tailored to their unique cardiovascular profile.";

  const getInitials = (name = "") => {
    return name
      .replace("Dr.", "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const fetchDoctorById = async (id) => {
    console.log("\n" + "🔄".repeat(30));
    console.log("FETCH FUNCTION CALLED");
    console.log("🔄".repeat(30));

    if (!id) {
      console.error("❌ No doctor ID provided to fetch function");
      Alert.alert("Error", "No doctor ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const cleanId = String(id).trim();

      // Fetch ALL doctors since individual endpoint doesn't exist
      const url = `${API_URL}/doctorsService/doctors`;

      console.log("\n📡 API REQUEST INFO:");
      console.log("API_URL:", API_URL);
      console.log("Looking for doctor ID:", cleanId);
      console.log("Full URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("\n📬 API RESPONSE INFO:");
      console.log("Status:", res.status);
      console.log("OK?:", res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server Error Response:", errorText);

        Alert.alert(
          "Error",
          `Could not fetch doctors list.\n\nStatus: ${res.status}`,
          [{ text: "Go Back", onPress: () => navigation.goBack() }]
        );

        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("✅ Received all doctors, now filtering...");

      // Extract doctors array
      const allDoctors = data.doctors || data || [];
      console.log("Total doctors:", allDoctors.length);

      // Find the specific doctor by ID
      const foundDoctor = allDoctors.find((doc) => {
        const docId = String(doc.doctor_id || doc.id || "").trim();
        console.log(`Comparing: ${docId} === ${cleanId}`);
        return docId === cleanId;
      });

      if (foundDoctor) {
        console.log("✅ SUCCESS! Found doctor:", foundDoctor);
        setDoctors(foundDoctor);
      } else {
        console.error("❌ Doctor not found in list");
        Alert.alert(
          "Doctor Not Found",
          `Could not find doctor with ID: ${cleanId}`,
          [{ text: "Go Back", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("\n❌❌❌ FETCH FAILED ❌❌❌");
      console.error("Error:", error);
      console.error("Error Message:", error.message);

      Alert.alert(
        "Error Loading Doctor",
        `Failed to load doctor information.\n\nError: ${error.message}`,
        [
          { text: "Go Back", onPress: () => navigation.goBack() },
          { text: "Retry", onPress: () => fetchDoctorById(id) },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("\n" + "=".repeat(60));
    console.log("🔍 COMPONENT MOUNTED - DEBUGGING INFO");
    console.log("=".repeat(60));

    // Log everything about route
    console.log("📦 Full Route object:", JSON.stringify(route, null, 2));
    console.log("📦 Route.params:", route.params);
    console.log("📦 doctorId from destructure:", doctorId);
    console.log("📦 Type of doctorId:", typeof doctorId);

    // Try to get doctorId from multiple sources
    let finalDoctorId = doctorId;

    // If no doctorId in route params and we're on web, try URL
    if (!finalDoctorId && Platform.OS === "web") {
      console.log("⚠️ No doctorId in params, checking URL...");
      console.log("Current URL:", window.location.href);
      console.log("Pathname:", window.location.pathname);

      // Method 1: Try to extract from pathname using regex
      // Expected format: /patient/Doctors/dr_666cd63f-f91c-4881-a0ed-7bfba7897612
      const pathMatch = window.location.pathname.match(
        /\/Doctors\/([^\/\?#]+)/i
      );

      if (pathMatch && pathMatch[1]) {
        finalDoctorId = decodeURIComponent(pathMatch[1]);
        console.log("✅ Extracted from pathname:", finalDoctorId);
      } else {
        // Method 2: Try query parameters
        const params = new URLSearchParams(window.location.search);
        finalDoctorId = params.get("doctorId");

        if (finalDoctorId) {
          console.log("✅ Found in query params:", finalDoctorId);
        } else {
          // Method 3: Try to split pathname manually
          const pathParts = window.location.pathname.split("/").filter(Boolean);
          console.log("Path parts:", pathParts);

          const doctorsIndex = pathParts.findIndex(
            (part) => part.toLowerCase() === "doctors"
          );

          if (doctorsIndex !== -1 && pathParts[doctorsIndex + 1]) {
            finalDoctorId = decodeURIComponent(pathParts[doctorsIndex + 1]);
            console.log("✅ Found via split:", finalDoctorId);
          }
        }
      }
    }

    console.log("\n🎯 FINAL DOCTOR ID TO USE:", finalDoctorId);
    console.log("🎯 Type:", typeof finalDoctorId);
    console.log("🎯 Length:", finalDoctorId?.length);
    console.log("=".repeat(60) + "\n");

    if (finalDoctorId) {
      fetchDoctorById(finalDoctorId);
    } else {
      console.error("❌❌❌ NO DOCTOR ID FOUND ANYWHERE! ❌❌❌");
      Alert.alert(
        "Error",
        "No doctor ID found. Please select a doctor from the list.",
        [
          {
            text: "Go Back",
            onPress: () => navigation.goBack(),
          },
        ]
      );
      setLoading(false);
    }
  }, [doctorId, route.params]);

  // Plan details
  const weeklyPlan = {
    plan_id: "PLAN_ID_1",
    features: [
      "2 Specialist consultation within 24hrs",
      "Unlimited Medilocker access",
      "Unlimited AI chatbot access",
      "Ideal for quick clarity and one-time specialist need",
    ],
  };

  const monthlyPlan = {
    plan_id: "PLAN_ID_2",
    features: [
      "20 Specialist consultations per month",
      "Unlimited Medilocker storage",
      "Unlimited AI chatbot access",
      "Doctor-Patient continuity + follow-up included",
      "Ideal for ongoing cardiac & gynaec health support",
    ],
  };

  const currentPlan = selectedPlan === "week" ? weeklyPlan : monthlyPlan;

  const handleContinuePayment = async () => {
    if (!user) {
      triggerLoginModal({ mode: "login" });
      return;
    }

    try {
      const planId = currentPlan.plan_id;
      const docId = doctors?.doctor_id || doctors?.id;
      const userId = user?.user_id || user?.id;

      Alert.alert("Redirecting", "Opening payment gateway...");

      const paymentLink = await payment_api(planId, docId, userId);

      if (paymentLink) {
        if (Platform.OS === "web") {
          window.location.href = paymentLink;
        } else {
          await Linking.openURL(paymentLink);
        }
      }
    } catch (error) {
      Alert.alert("Payment Failed", error.message);
    }
  };

  // ✅ Better loading state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 16, color: "#666" }}>
          Loading doctor details...
        </Text>
      </View>
    );
  }

  // ✅ Handle case where doctor data is not found
  if (!doctors) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
          Doctor information not found.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginTop: 20,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#007AFF",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
                  <View style={[styles.header, { height: "12%" }]}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View>
                  <BackButton />
                  <View style={styles.contentContainer}>
                    {/* Doctor profile card */}
                    <View style={styles.doctorProfileCard}>
                      <View style={styles.doctorProfileDetail}>
                        <View style={styles.doctorLeftSection}>
                          {/* <Image
                            source={
                              doctors?.profilePhoto
                                ? { uri: doctors?.profilePhoto }
                                : require("../../../assets/Images/dr_kislay.jpg")
                            }
                            style={styles.doctorImage}
                          /> */}
                          {doctors?.profilePhoto ? (
                            <Image
                              source={{ uri: doctors.profilePhoto }}
                              style={styles.doctorImage}
                            />
                          ) : (
                            <View style={styles.initialsAvatar}>
                              <Text style={styles.initialsText}>
                                {getInitials(
                                  doctors?.name || doctors?.fullName || "D"
                                )}
                              </Text>
                            </View>
                          )}

                          <View style={styles.ratingContainer}>
                            <MaterialIcons
                              name="star"
                              size={20}
                              color="#FFD700"
                            />
                            <Text style={styles.ratingText}>{"4.5"}</Text>
                          </View>
                        </View>
                        <View style={styles.doctorInfoSection}>
                          <Text style={styles.doctorName}>
                            {doctors?.doctorname
                              ? doctors?.doctorname
                              : "Dr. Kislay Shrivastava"}
                          </Text>
                          <Text style={styles.doctorCredentials}>
                            {doctors?.specialization
                              ? doctors?.specialization
                              : "Consultant Cardiologist"}
                          </Text>
                          <Text style={styles.doctorExperience}>
                            {`${
                              doctors?.experience ? doctors?.experience : "24"
                            } experience`}
                          </Text>
                          <Text style={styles.doctorBio}>
                            {doctors?.description
                              ? doctors?.description
                              : descriptionPlaceholder}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewsSection}>
                        <Text style={styles.reviewsTitle}>User Reviews</Text>

                        <View style={styles.reviewsList}>
                          {Array.isArray(doctors?.reviews) &&
                            doctors.reviews.map((review, index) => (
                              <View key={index} style={styles.reviewCard}>
                                <View style={styles.reviewTextBox}>
                                  <ScrollView
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={false}
                                  >
                                    <Text style={styles.reviewText}>
                                      {review.comment}
                                    </Text>
                                  </ScrollView>
                                </View>

                                <View style={styles.reviewerContainer}>
                                  {[...Array(5)].map((_, i) => (
                                    <MaterialIcons
                                      key={i}
                                      name={
                                        i + 1 <= review.rating
                                          ? "star"
                                          : i + 0.5 <= review.rating
                                          ? "star-half"
                                          : "star-border"
                                      }
                                      size={16}
                                      color="#FFD700"
                                    />
                                  ))}
                                  <Text style={styles.reviewerName}>
                                    {review.reviewer}
                                  </Text>
                                </View>
                              </View>
                            ))}
                        </View>
                      </View>
                    </View>

                    {/* Subscription section */}
                    <View style={styles.subscriptionSection}>
                      <View style={styles.subscriptionTextHead}>
                        <TouchableOpacity
                          style={[
                            styles.rupeesBox,
                            selectedPlan === "week" && styles.rupeesBoxSelected,
                          ]}
                          onPress={() => setSelectedPlan("week")}
                        >
                          <Text
                            style={[
                              styles.rupeesText,
                              selectedPlan === "week" &&
                                styles.rupeesTextSelected,
                            ]}
                          >
                            ₹499/week
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.rupeesBox,
                            selectedPlan === "month" &&
                              styles.rupeesBoxSelected,
                          ]}
                          onPress={() => setSelectedPlan("month")}
                        >
                          <Text
                            style={[
                              styles.rupeesText,
                              selectedPlan === "month" &&
                                styles.rupeesTextSelected,
                            ]}
                          >
                            ₹999/month
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.subscriptionMetricsBox}>
                        {currentPlan.features.map((feature, index) => (
                          <Text key={index} style={styles.metricsTitle}>
                            - {feature}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.subscriptionButtonContainer}>
                        <TouchableOpacity
                          style={styles.subscribeButton}
                          onPress={handleContinuePayment}
                        >
                          <Text style={styles.subscribeButtonText}>
                            Purchase Plan
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}

      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.appContainer}>
          <ScrollView>
            <StatusBar barStyle="light-content" backgroundColor="#fff" />

            <View style={styles.appImageContainer}>
              {/* <Image
                source={
                  doctors?.profilePhoto
                    ? { uri: doctors?.profilePhoto }
                    : require("../../../assets/Images/dr_kislay.jpg")
                }
                style={styles.doctorImage}
              /> */}
              {doctors?.profilePhoto ? (
                <Image
                  source={{ uri: doctors.profilePhoto }}
                  style={styles.doctorImage}
                />
              ) : (
                <View style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>
                    {getInitials(doctors?.name || doctors?.fullName || "D")}
                  </Text>
                </View>
              )}

              <View style={styles.doctornamebox}>
                <Text style={styles.doctorName}>
                  {doctors?.doctorname || "Dr. Kislay Shrivastava"}
                </Text>
              </View>
              <View style={styles.doctornamebox}>
                <Text style={styles.doctorCredentials}>
                  {doctors?.specialization || "Consultant Cardiologist"}
                </Text>
              </View>
            </View>

            <View style={styles.doctorDescription}>
              <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.descriptionText}>
                  {doctors?.description || descriptionPlaceholder}
                </Text>
              </ScrollView>
            </View>

            <View style={styles.experienceRatingContainer}>
              <View style={styles.experienceSection}>
                <Image
                  source={require("../../../assets/Icons/doctorTool.png")}
                  style={styles.doctorIcon}
                />
                <View style={styles.experienceDetail}>
                  <Text style={styles.experienceText}>Total Experience</Text>
                  <Text style={styles.experience}>
                    {doctors?.experience || "24"} years
                  </Text>
                </View>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.ratingSection}>
                <Image
                  source={require("../../../assets/Icons/Star.png")}
                  style={styles.doctorIcon}
                />
                <TouchableOpacity style={styles.ratingDetail}>
                  <Text style={styles.ratingText}>Rating & Reviews</Text>
                  <Text style={styles.rating}>4.9 (5000)</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.firsttext}>
              <Text style={styles.firstTextstyle}>
                To Book Slot Of the Doctor you have to
              </Text>
              <Text style={styles.firstTextstyle}>first subscribe them.</Text>
            </View>

            <View style={styles.appSubscriptionSection}>
              <View style={styles.appSubscriptionTextHead}>
                <TouchableOpacity
                  style={[
                    styles.rupeesBox,
                    selectedPlan === "week" && styles.rupeesBoxSelected,
                  ]}
                  onPress={() => setSelectedPlan("week")}
                >
                  <Text
                    style={[
                      styles.rupeesText,
                      selectedPlan === "week" && styles.rupeesTextSelected,
                    ]}
                  >
                    ₹499/week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.rupeesBox,
                    selectedPlan === "month" && styles.rupeesBoxSelected,
                  ]}
                  onPress={() => setSelectedPlan("month")}
                >
                  <Text
                    style={[
                      styles.rupeesText,
                      selectedPlan === "month" && styles.rupeesTextSelected,
                    ]}
                  >
                    ₹999/month
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.appSubscriptionMetricsBox}>
                {currentPlan.features.map((feature, index) => (
                  <Text key={index} style={styles.appMetricsTitle}>
                    - {feature}
                  </Text>
                ))}
              </View>

              <View style={styles.appSubscriptionButtonContainer}>
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={handleContinuePayment}
                >
                  <Text style={styles.subscribeButtonText}>Purchase Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
};

const windowWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    padding: "2%",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  feeSection: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    paddingVertical: 12,
    gap: 20,
  },
  rupees: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
  },
  rupeeImg: {
    width: 15,
    height: 15,
    resizeMode: "contain",
  },
  currency: {
    fontSize: 18,
    color: "#007BFF",
    marginRight: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  line: {
    height: "100%",
    borderWidth: 1,
    borderColor: "#9B9A9A",
  },
  feeLabel: {
    fontSize: 14,
    color: "#666",
  },
  appContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  appImageContainer: {
    width: "75%",
    marginVertical: "4%",
    alignSelf: "center",
    marginBottom: "3%",
    borderWidth: 1,
  },
  doctorImage: {
    height: 90,
    width: 90,
    alignSelf: "center",
    borderRadius: 40,
    ...Platform.select({
      web: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
      },
    }),
  },
  doctornamebox: {
    alignSelf: "center",
  },
  doctorName: {
    fontSize: 22,
    fontWeight: 600,
    color: "#000000",
    alignSelf: "center",
    ...Platform.select({
      web: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        alignSelf: windowWidth > 1000 ? "flex-start" : "center",
      },
    }),
  },
  doctorCredentials: {
    fontSize: 14,
    alignSelf: "center",
    fontWeight: 600,
    ...Platform.select({
      web: {
        fontSize: 14,
        marginTop: 2,
        fontWeight: windowWidth < 1000 ? "bold" : "normal",
        alignSelf: windowWidth > 1000 ? "flex-start" : "center",
      },
    }),
  },
  doctorDescription: {
    height: "18%",
    width: "88%",
    alignSelf: "center",
    marginBottom: "6%",
    borderRadius: 5,
    boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
  },
  descriptionText: {
    textAlign: "justify",
    padding: "1%",
  },
  experienceRatingContainer: {
    height: "7%",
    width: "88%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 5,
    boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
    backgroundColor: "rgba(255, 252, 252, 1)",
    padding: "1%",
    ...Platform.select({
      web: {
        minHeight: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderWidth: 1,
        borderColor: "#ddd",
        boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
      },
    }),
  },
  experienceSection: {
    height: "100%",
    width: "49%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  doctorIcon: {
    alignSelf: "center",
    height: 26,
    width: 26,
    marginHorizontal: "2%",
    borderRadius: 50,
  },
  experienceDetail: {
    height: "94%",
    width: "78%",
    alignSelf: "center",
    flexDirection: "column",
  },
  experienceText: {
    fontSize: 14,
    fontWeight: 600,
    color: " rgb(94, 93, 93)",
    paddingHorizontal: "4%",
  },
  experience: {
    fontSize: 14,
    fontWeight: 600,
    color: "#000000",
    paddingHorizontal: "4%",
  },
  verticalLine: {
    height: "75%",
    width: "0.4%",
    alignSelf: "center",
    backgroundColor: "#000000",
  },
  ratingSection: {
    height: "100%",
    width: "48.8%",
    flexDirection: "row",
  },
  ratingDetail: {
    ...Platform.select({
      web: {
        flexDirection: "column",
        width: "80%",
      },
    }),
  },
  ratingText: {
    fontSize: 11,
    fontWeight: 600,
    color: " rgb(94, 93, 93)",
    //paddingHorizontal: "5%",
    //borderWidth:1,
    ...Platform.select({
      web: {
        marginLeft: "1%",
        fontSize: 14,
        fontWeight: 600,
      },
    }),
  },
  rating: {
    fontSize: 14,
    fontWeight: 600,
    color: "#000000",
    alignSelf: "center",
  },
  bookAppointmentText: {
    alignSelf: "center",
    paddingVertical: "2.5%",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
  },
  bookAppointmentButton: {
    height: "4%",
    width: "70%",
    alignSelf: "center",
    borderRadius: 8,
    backgroundColor: "rgb(237, 109, 111)",
    marginTop: "5%",
  },
  firsttext: {
    padding: "5%",
  },
  firstTextstyle: {
    fontSize: 18,
  },
  webContainer: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  imageContainer: {
    height: "100%",
    width: "100%",
    marginVertical: "10%",
    alignSelf: "center",
  },
  feesBox: {
    height: "90%",
    width: "60%",
    marginHorizontal: "3.5%",
    alignSelf: "center",
    flexDirection: "column",
  },
  fees: {
    fontSize: 16,
    fontWeight: 600,
    color: "#000000",
    paddingVertical: "1%",
  },
  feesText: {
    fontSize: 14,
    fontWeight: 600,
    color: " rgb(94, 93, 93)",
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
    backgroundColor: "#f5f5f5",
  },
  Right: {
    height: "100%",
    width: "85%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
        // marginBottom: 20,
      },
    }),
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(138, 112, 255, 0.8)",
    marginBottom: "10%",
    borderRadius: 20,
    overflow: "hidden",
    width: "90%",
    marginHorizontal: "5%",
    padding: "1%",
  },
  doctorProfileCard: {
    width: "60%",
    height: "90%",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: "2%",
    margin: "2%",
    justifyContent: "space-between",
  },
  doctorProfileDetail: {
    height: "72%",
    width: "100%",
    flexDirection: "row",
  },
  doctorLeftSection: {
    width: "20%",
    height: "48%",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  doctorInfoSection: {
    width: "80%",
    height: "85%",
    paddingLeft: "1%",
  },
  doctorExperience: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginBottom: 10,
  },
  doctorBio: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 15,
  },
  reviewsSection: {
    height: "40%",
    bottom: "10%",
  },
  reviewsTitle: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 10,
  },
  reviewsList: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderColor: "red",
    height: "80%",
  },
  reviewCard: {
    height: "100%",
    width: "30%",
    backgroundColor: "#ffebee",
    borderRadius: 10,
    padding: "1%",
  },
  reviewTextBox: {
    height: "80%",
    width: "100%",
  },
  reviewText: {
    fontSize: 13,
    color: "#000",
    marginBottom: "3%",
    fontWeight: 400,
    fontStyle: "italic",
  },
  reviewerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "2%",
  },
  reviewerName: {
    fontSize: 12,
    color: "#666",
    marginLeft: "2%",
  },
  subscriptionSection: {
    width: "30%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: "2%",
    marginLeft: "5%",
  },
  appSubscriptionSection: {
    borderWidth: 1,
    height: "52%",
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
  },
  appSubscriptionTextHead: {
    flexDirection: "row",
    height: "12%",
    width: "99%",
    marginTop: "1%",
    marginLeft: "1%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    alignSelf: "center",
  },
  subscriptionTextHead: {
    flexDirection: "row",
    height: "10%",
    width: "85%",
    marginTop: "10%",
    marginLeft: "8%",
    borderRadius: 5,
    overflow: "hidden",
  },
  rupeesBox: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRightWidth: 0.5,
    borderColor: "#ddd",
  },
  rupeesBoxSelected: {
    backgroundColor: "#8A70FF",
  },
  rupeesText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  rupeesTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  subscriptionTextTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: "#000000",
  },
  subscriptionMetricsBox: {
    height: "50%",
    width: "85%",
    backgroundColor: "#F6F6F6",
    borderRadius: 5,
    alignSelf: "center",
    marginTop: "4%",
    paddingTop: "3%",
  },
  appSubscriptionMetricsBox: {
    height: "45%",
    width: "98%",
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    alignSelf: "center",
    marginTop: "1%",
    paddingTop: "1%",
  },
  metricsTitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "#000000",
    marginLeft: "3%",
    marginTop: "1%",
  },
  appMetricsTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: "#000000",
    marginLeft: "1%",
    marginTop: "1%",
  },
  subscriptionButtonContainer: {
    height: "30%",
    width: "70%",
    alignSelf: "center",
    alignItems: "center",
    marginTop: "3%",
    flexDirection: "column",
  },
  appSubscriptionButtonContainer: {
    height: "50%",
    width: "70%",
    alignSelf: "center",
    alignItems: "center",
    marginTop: "3%",
    flexDirection: "column",
  },
  subscriptionTextBox: {
    height: "20%",
    width: "80%",
    marginTop: "10%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#000000",
    marginLeft: "18%",
  },
  feeText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#888888",
    marginRight: "15%",
  },
  subscribeButton: {
    height: "24%",
    width: "80%",
    marginTop: "2%",
    backgroundColor: "#FF7072",
    borderRadius: 5,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
    alignSelf: "center",
    fontStyle: "Medium",
    padding: "1%",
  },
  initialsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  initialsText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
});

export default DoctorsInfoWithSubscription;
