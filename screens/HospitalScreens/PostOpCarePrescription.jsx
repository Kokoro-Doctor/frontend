// import React, { useState, useContext, useEffect } from "react";
// import {
//   Image,
//   ImageBackground,
//   StyleSheet,
//   View,
//   Dimensions,
//   Platform,
//   TouchableOpacity,
//   useWindowDimensions,
//   Text,
//   ScrollView,
//   TextInput,
//   StatusBar,
//   Alert,
//   ActivityIndicator,
// } from "react-native";

// import { AuthContext } from "../../contexts/AuthContext";
// import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
// import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
// import BackButton from "../../components/PatientScreenComponents/BackButton";
// import Markdown from "react-native-markdown-display";
// import {
//   downloadPrescription,
//   generatePrescriptionPDFAsBase64,
// } from "../../utils/PrescriptionService";
// import { savePrescriptionToMedilocker } from "../../utils/MedilockerService";

// /** Web-safe alert: Alert.alert doesn't work on web, so use window.alert */
// const showAlert = (title, message, buttons) => {
//   if (Platform.OS === "web") {
//     window.alert([title, message].filter(Boolean).join("\n\n"));
//     const okBtn = buttons?.find((b) => b.style !== "cancel");
//     okBtn?.onPress?.();
//   } else {
//     Alert.alert(title, message, buttons);
//   }
// };

// const { width, height } = Dimensions.get("window");

// const markdownStyles = {
//   body: {
//     fontSize: 14,
//     fontWeight: "300",
//     color: "#555555",
//     fontFamily: "Poppins",
//   },
//   strong: {
//     fontWeight: "600",
//     color: "#555555",
//   },
// };

// const markdownStylesMobile = {
//   body: {
//     fontSize: 14,
//     color: "#444",
//     lineHeight: 22,
//   },
//   strong: {
//     fontWeight: "600",
//     color: "#444",
//   },
// };

// const PostOpCarePrescription = ({ navigation, route }) => {
//   const { width } = useWindowDimensions();
//   const { user } = useContext(AuthContext);

//   // Get prescription and patient user ID from route params
//   const { generatedPrescription: initialPrescription, userId } =
//     route.params || {};

//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isSavingPrescription, setIsSavingPrescription] = useState(false);
//   const [editedPrescription, setEditedPrescription] = useState(null);
//   const [currentPrescription, setCurrentPrescription] = useState(
//     initialPrescription || null,
//   );

//   // Debug logging and update state when route params change
//   useEffect(() => {
//     console.log("🔍 PrescriptionPreview - Route params:", route.params);
//     console.log(
//       "🔍 PrescriptionPreview - Initial prescription:",
//       initialPrescription,
//     );

//     if (initialPrescription) {
//       console.log("✅ Setting currentPrescription from route params");
//       setCurrentPrescription(initialPrescription);
//     } else {
//       console.warn("⚠️ No prescription data in route params");
//     }
//   }, [route.params, initialPrescription]);

//   const handleEditPrescription = () => {
//     // Initialize with current prescription and doctor info from auth
//     const doctorName = user?.name || user?.doctorname || "";
//     const doctorSpecialty = user?.specialization || "";

//     setEditedPrescription({
//       ...currentPrescription,
//       doctorName: doctorName,
//       doctorSpecialty: doctorSpecialty,
//     });
//     setIsEditMode(true);
//   };

//   const handleSavePrescription = () => {
//     if (editedPrescription) {
//       // Remove doctor info from saved prescription as it comes from auth context
//       const { doctorName, doctorSpecialty, ...prescriptionToSave } =
//         editedPrescription;
//       setCurrentPrescription(prescriptionToSave);
//       setIsEditMode(false);
//       // TODO: Add API call to save prescription
//     }
//   };

//   const handleCancelEdit = () => {
//     setIsEditMode(false);
//     setEditedPrescription(null);
//   };

//   const updatePrescriptionField = (field, value) => {
//     setEditedPrescription((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleDownloadPrescription = async () => {
//     await downloadPrescription(currentPrescription, user);
//   };

//   const handleApprovePrescription = async () => {
//     console.log("[ApprovePrescription] Started", {
//       userId,
//       hasPrescription: !!currentPrescription,
//     });

//     if (!userId) {
//       console.warn("[ApprovePrescription] Aborted: no userId");
//       showAlert(
//         "Cannot Save",
//         "Patient ID is required to save prescription to Medilocker. This prescription was not generated from a patient's Medilocker.",
//         [{ text: "OK" }],
//       );
//       return;
//     }

//     try {
//       setIsSavingPrescription(true);
//       console.log("[ApprovePrescription] Generating PDF...");
//       const pdfBase64 = await generatePrescriptionPDFAsBase64(
//         currentPrescription,
//         user,
//       );
//       console.log("[ApprovePrescription] PDF generated", {
//         base64Length: pdfBase64?.length,
//         approxSizeKB: pdfBase64
//           ? Math.round((pdfBase64.length * 3) / 4 / 1024)
//           : 0,
//       });

//       console.log("[ApprovePrescription] Saving to Medilocker...");
//       await savePrescriptionToMedilocker(userId, pdfBase64);
//       console.log("[ApprovePrescription] Save succeeded");
//       showAlert(
//         "Success",
//         "Prescription PDF has been saved to the patient's Medilocker. The patient can view and download it from their documents.",
//         [{ text: "OK" }],
//       );
//     } catch (error) {
//       console.error("[ApprovePrescription] Failed:", error);
//       console.error("[ApprovePrescription] Error details:", {
//         name: error?.name,
//         message: error?.message,
//         stack: error?.stack,
//       });
//       showAlert(
//         "Save Failed",
//         error.message ||
//           "Failed to save prescription to Medilocker. Please try again.",
//         [{ text: "OK" }],
//       );
//     } finally {
//       setIsSavingPrescription(false);
//       console.log("[ApprovePrescription] Finished");
//     }
//   };

//   return (
//     <>
//       {Platform.OS === "web" && width > 1000 && <View></View>}

//       {(Platform.OS !== "web" || width < 1000) && (
//         <ScrollView
//           style={stylesMobile.container}
//           contentContainerStyle={{ paddingBottom: 120 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* HEADER */}
//           <StatusBar barStyle="light-content" backgroundColor="#fff" />
//           <View style={stylesMobile.header}>
//             <HeaderLoginSignUp navigation={navigation} />
//           </View>

//           <View style={stylesMobile.stepContainer}>
//             {/* Line */}
//             <View style={stylesMobile.stepLine} />

//             {/* Steps Row */}
//             <View style={stylesMobile.stepRow}>
//               {/* Step 1 */}
//               <View style={stylesMobile.stepItem}>
//                 <View style={stylesMobile.stepCircleActive}>
//                   <Text style={stylesMobile.tick}>✓</Text>
//                 </View>
//                 <Text style={stylesMobile.stepText}>Upload{"\n"}Documents</Text>
//               </View>

//               {/* Step 2 */}
//               <View style={stylesMobile.stepItem}>
//                 <View style={stylesMobile.stepCircleActive}>
//                   <Text style={stylesMobile.tick}>✓</Text>
//                 </View>
//                 <Text style={stylesMobile.stepText}>
//                   Full case{"\n"}analysis
//                 </Text>
//               </View>

//               {/* Step 3 */}
//               <View style={stylesMobile.stepItem}>
//                 <View style={stylesMobile.stepCircleInactive}>
//                   <Text style={stylesMobile.stepNumber}>3</Text>
//                 </View>
//                 <Text style={stylesMobile.stepText}>
//                   Generate{"\n"}Prescription
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* PRESCRIPTION VIEW */}
//           <View style={stylesMobile.prescriptionWrapper}>
//             {/* Header */}
//             <View style={stylesMobile.topHeader}>
//               <View
//                 style={{
//                   flexDirection: "row",
//                   gap: 4,
//                   alignItems: "center",
//                 }}
//               >
//                 <Image
//                   source={require("../../assets/DoctorsPortal/Icons/kokorologoo.png")}
//                   style={stylesMobile.statIcon}
//                   resizeMode="contain"
//                 />

//                 <Text style={stylesMobile.logoText}>Kokoro.Doctor</Text>
//               </View>
//               <View style={stylesMobile.summaryBadge}>
//                 <View style={stylesMobile.summaryBadgeContent}>
//                   <Text style={stylesMobile.summaryText}>Patient Summary</Text>
//                 </View>
//               </View>
//             </View>

//             {/* Date + Doctor */}
//             <View style={stylesMobile.rowBetween}>
//               <View
//                 style={{
//                   flexDirection: "row",
//                   gap: 1,
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Text style={stylesMobile.metaText}>Date : </Text>
//                 {isEditMode ? (
//                   <TextInput
//                     style={stylesMobile.mobileEditInputInline}
//                     value={editedPrescription?.date || ""}
//                     onChangeText={(value) =>
//                       updatePrescriptionField("date", value)
//                     }
//                     placeholder="DD MMM YYYY"
//                     placeholderTextColor="#999999"
//                   />
//                 ) : (
//                   <Text style={stylesMobile.secondText}>
//                     {currentPrescription?.date ||
//                       new Date().toLocaleDateString("en-GB", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                   </Text>
//                 )}
//               </View>
//               <View style={{ paddingRight: 16 }}>
//                 <Text style={stylesMobile.metaText}>
//                   <Text style={{ fontWeight: "600" }}>DR :</Text>{" "}
//                   {user?.name || user?.doctorname || "Doctor"}{" "}
//                 </Text>
//                 <Text
//                   style={{
//                     color: "#999",
//                     alignSelf: "flex-end",
//                     marginRight: "1%",
//                   }}
//                 >
//                   {" "}
//                   {user?.specialization || ""}
//                 </Text>
//               </View>
//             </View>

//             <View style={stylesMobile.divider} />

//             {/* Patient Info */}
//             <View style={stylesMobile.infoGrid}>
//               <View style={{ flex: 1 }}>
//                 <Text style={stylesMobile.infoText}>
//                   <Text style={stylesMobile.metaText}>Patient Name:</Text>{" "}
//                   {isEditMode ? (
//                     <TextInput
//                       style={stylesMobile.mobileEditInputSmall}
//                       value={editedPrescription?.patientName || ""}
//                       onChangeText={(value) =>
//                         updatePrescriptionField("patientName", value)
//                       }
//                       placeholder="Enter patient name"
//                       placeholderTextColor="#999999"
//                     />
//                   ) : (
//                     <Text style={stylesMobile.secondText}>
//                       {currentPrescription?.patientName || " "}
//                     </Text>
//                   )}
//                 </Text>
//                 <Text style={stylesMobile.infoText}>
//                   <Text style={stylesMobile.metaText}>Address:</Text>{" "}
//                   {isEditMode ? (
//                     <TextInput
//                       style={stylesMobile.mobileEditInputSmall}
//                       value={editedPrescription?.age || ""}
//                       onChangeText={(value) =>
//                         updatePrescriptionField("age", value)
//                       }
//                       placeholder="Enter age"
//                       placeholderTextColor="#999999"
//                     />
//                   ) : (
//                     <Text style={stylesMobile.secondText}>
//                       {currentPrescription?.age || " "}
//                     </Text>
//                   )}
//                 </Text>
//               </View>

//               <View style={{ paddingRight: 16, flex: 1 }}>
//                 <Text style={stylesMobile.infoText}>
//                   <Text style={stylesMobile.infoLabel}>Age:</Text>{" "}
//                   {isEditMode ? (
//                     <TextInput
//                       style={stylesMobile.mobileEditInputSmall}
//                       value={editedPrescription?.gender || ""}
//                       onChangeText={(value) =>
//                         updatePrescriptionField("gender", value)
//                       }
//                       placeholder="Enter gender"
//                       placeholderTextColor="#999999"
//                     />
//                   ) : (
//                     <Text style={stylesMobile.secondText}>
//                       {currentPrescription?.gender || " "}
//                     </Text>
//                   )}
//                 </Text>
//                 <Text style={stylesMobile.infoText}>
//                   <Text style={stylesMobile.infoLabel}>Diagnosis:</Text>{" "}
//                   {isEditMode ? (
//                     <TextInput
//                       style={[
//                         stylesMobile.mobileEditInputSmall,
//                         { minHeight: 60 },
//                       ]}
//                       value={editedPrescription?.diagnosis || ""}
//                       onChangeText={(value) =>
//                         updatePrescriptionField("diagnosis", value)
//                       }
//                       placeholder="Enter diagnosis"
//                       placeholderTextColor="#999999"
//                       multiline
//                     />
//                   ) : (
//                     <Text style={stylesMobile.secondText}>
//                       {currentPrescription?.diagnosis || " "}
//                     </Text>
//                   )}
//                 </Text>
//               </View>
//             </View>

//             <ScrollView style={stylesMobile.rxBox}>
//               {isEditMode ? (
//                 <TextInput
//                   style={stylesMobile.mobileRxInput}
//                   value={editedPrescription?.prescriptionReport || ""}
//                   onChangeText={(value) =>
//                     updatePrescriptionField("prescriptionReport", value)
//                   }
//                   placeholder="Prescription Report"
//                   placeholderTextColor="#999999"
//                   multiline
//                 />
//               ) : (
//                 <Markdown style={markdownStylesMobile} mergeStyle={true}>
//                   {currentPrescription?.prescriptionReport ||
//                     "No prescription report generated"}
//                 </Markdown>
//               )}
//             </ScrollView>
//           </View>
//           {/* Save/Cancel Buttons */}
//           {isEditMode && (
//             <View style={stylesMobile.editActions}>
//               <TouchableOpacity
//                 style={stylesMobile.cancelButton}
//                 onPress={handleCancelEdit}
//               >
//                 <Text style={stylesMobile.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={stylesMobile.saveButton}
//                 onPress={handleSavePrescription}
//               >
//                 <Text style={stylesMobile.saveButtonText}>Save</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Edit Button */}
//           {!isEditMode && (
//             <TouchableOpacity
//               style={stylesMobile.approveBtns}
//               onPress={handleEditPrescription}
//             >
//               <Text style={stylesMobile.approveBtnTexts}>
//                 Edit Prescription
//               </Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity style={stylesMobile.approveBtn}>
//             <Text style={stylesMobile.approveBtnText}>
//               Download Prescription
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={stylesMobile.analyzeBtn}>
//             <Text style={stylesMobile.analyzeText}>Analyze once again</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={stylesMobile.setupBtn}>
//             <Text style={stylesMobile.setupText}>Set up date Integration</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       )}
//     </>
//   );
// };

// const stylesMobile = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   header: {
//     zIndex: 2,
//   },
//   prescriptionWrapper: {
//     marginLeft: "2%",
//     marginRight: "2%",
//     backgroundColor: "#fff",
//     borderRadius: 4,
//     paddingLeft: 16,
//     paddingBottom: 20,
//     borderWidth: 2,
//     borderColor: "#00000040",
//   },
//   topHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   statIcon: {
//     width: 20,
//     height: 20,
//   },
//   logoText: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: "#00000075",
//   },
//   summaryBadge: {
//     height: 40,
//     width: 160,
//     alignItems: "flex-end",
//     backgroundColor: "#EDF6FF",
//     borderBottomLeftRadius: 50,
//   },
//   summaryBadgeContent: {
//     height: 30,
//     width: 130,
//     backgroundColor: "#025AE0",
//     borderBottomLeftRadius: 40,
//     paddingTop: "3%",
//     alignItems: "center",
//     borderColor: "#025AE0",
//   },
//   summaryText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "400",
//   },
//   rowBetween: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   metaText: {
//     fontSize: 12,
//     color: "#000000",
//     fontWeight: "500",
//     // marginTop: 4,
//   },
//   secondText: {
//     color: "#555555",
//     fontSize: 12,
//     fontWeight: "400",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#EAE9E9",
//     marginVertical: 16,
//     marginRight: "4.5%",
//   },
//   infoGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   infoText: {
//     fontSize: 12,
//     color: "#444",
//     marginBottom: 6,
//   },
//   infoLabel: {
//     fontWeight: "600",
//     color: "#000000",
//   },
//   rxLabel: {
//     color: "#FF7072",
//     fontWeight: "500",
//     marginTop: "6%",
//     marginBottom: "2%",
//   },
//   rxBox: {
//     marginTop: "4%",
//     borderWidth: 1,
//     borderColor: "#D6D7D8",
//     borderRadius: 15,
//     padding: 12,
//     marginRight: 16,
//     minHeight: 140,
//     maxHeight: 300,
//   },
//   rxText: {
//     fontSize: 14,
//     color: "#444",
//     lineHeight: 22,
//   },

//   approveBtn: {
//     alignSelf: "center",
//     width: "70%",
//     backgroundColor: "#025AE0",
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: "center",
//   },
//   approveBtnText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   approveBtns: {
//     alignSelf: "center",
//     width: "70%",
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: "center",
//     borderColor: "#94A3B8",
//     borderWidth: 2,
//   },
//   approveBtnTexts: {
//     color: "#6B6B6B",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   analyzeBtn: {
//     borderWidth: 1,
//     alignSelf: "center",
//     width: "70%",
//     backgroundColor: "#F3FFF7",
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: "center",
//     borderColor: "#25BA58",
//   },
//   analyzeText: {
//     color: "#25BA58",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   setupBtn: {
//     borderWidth: 1,
//     alignSelf: "center",
//     width: "70%",
//     backgroundColor: "#25BA58",
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: "center",
//     borderColor: "#25BA58",
//   },
//   setupText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   mobileEditInputInline: {
//     fontSize: 12,
//     fontWeight: "400",
//     color: "#000000",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 4,
//     // paddingHorizontal: 8,
//     // paddingVertical: 4,
//     backgroundColor: "#FAFAFA",
//     // minWidth: 80,
//   },
//   mobileEditInputSmall: {
//     fontSize: 12,
//     fontWeight: "400",
//     color: "#000000",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     backgroundColor: "#FAFAFA",
//     minHeight: 32,
//   },
//   mobileRxInput: {
//     fontSize: 13,
//     fontWeight: "400",
//     color: "#000000",
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: "#FAFAFA",
//     minHeight: 200,
//     textAlignVertical: "top",
//   },
//   editActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: 12,
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#F0F0F0",
//   },
//   cancelButton: {
//     borderRadius: 8,
//     borderWidth: 1.5,
//     borderColor: "#CCCCCC",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: "#FFFFFF",
//   },
//   cancelButtonText: {
//     color: "#666666",
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   saveButton: {
//     borderRadius: 8,
//     backgroundColor: "#FF7072",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     shadowColor: "#FF7072",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   saveButtonText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   stepContainer: {
//     paddingVertical: 16,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//   },

//   stepRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   stepItem: {
//     alignItems: "center",
//     width: "33%",
//   },

//   stepLine: {
//     position: "absolute",
//     top: 17 + 16,
//     // 17 = half of circle (34/2)
//     // 16 = container paddingVertical

//     left: "16.5%",
//     right: "16.5%",
//     height: 2,
//     backgroundColor: "#1680ECBF",
//   },

//   stepCircleActive: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#1D4ED8", // blue
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   stepCircleInactive: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#fff",
//     borderWidth: 2,
//     borderColor: "#1D4ED8",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   tick: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },

//   stepNumber: {
//     color: "#1D4ED8",
//     fontWeight: "600",
//   },

//   stepText: {
//     fontSize: 11,
//     textAlign: "center",
//     color: "#1D4ED8",
//     marginTop: 6,
//   },
// });

// export default PostOpCarePrescription;

import React, { useState, useContext, useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  Text,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";

import { AuthContext } from "../../contexts/AuthContext";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import BackButton from "../../components/PatientScreenComponents/BackButton";
import Markdown from "react-native-markdown-display";
import {
  downloadPrescription,
  generatePrescriptionPDFAsBase64,
} from "../../utils/PrescriptionService";
import { savePrescriptionToMedilocker } from "../../utils/MedilockerService";

/** Web-safe alert */
const showAlert = (title, message, buttons) => {
  if (Platform.OS === "web") {
    window.alert([title, message].filter(Boolean).join("\n\n"));
    const okBtn = buttons?.find((b) => b.style !== "cancel");
    okBtn?.onPress?.();
  } else {
    Alert.alert(title, message, buttons);
  }
};

const { width, height } = Dimensions.get("window");

const markdownStyles = {
  body: { fontSize: 14, fontWeight: "300", color: "#555555" },
  strong: { fontWeight: "600", color: "#555555" },
  bullet_list: { paddingLeft: 8 },
  list_item: { marginBottom: 6 },
};

const markdownStylesMobile = {
  body: { fontSize: 14, color: "#444", lineHeight: 22 },
  strong: { fontWeight: "600", color: "#444" },
};

const PostOpCarePrescription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { user } = useContext(AuthContext);

  const { generatedPrescription: initialPrescription, userId } =
    route.params || {};

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(
    initialPrescription || null,
  );

  useEffect(() => {
    if (initialPrescription) {
      setCurrentPrescription(initialPrescription);
    }
  }, [route.params, initialPrescription]);

  const handleEditPrescription = () => {
    const doctorName = user?.name || user?.doctorname || "";
    const doctorSpecialty = user?.specialization || "";
    setEditedPrescription({
      ...currentPrescription,
      doctorName,
      doctorSpecialty,
    });
    setIsEditMode(true);
  };

  const handleSavePrescription = () => {
    if (editedPrescription) {
      const { doctorName, doctorSpecialty, ...prescriptionToSave } =
        editedPrescription;
      setCurrentPrescription(prescriptionToSave);
      setIsEditMode(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedPrescription(null);
  };

  const updatePrescriptionField = (field, value) => {
    setEditedPrescription((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadPrescription = async () => {
    await downloadPrescription(currentPrescription, user);
  };

  const handleApprovePrescription = async () => {
    if (!userId) {
      showAlert(
        "Cannot Save",
        "Patient ID is required to save prescription to Medilocker.",
        [{ text: "OK" }],
      );
      return;
    }
    try {
      setIsSavingPrescription(true);
      const pdfBase64 = await generatePrescriptionPDFAsBase64(
        currentPrescription,
        user,
      );
      await savePrescriptionToMedilocker(userId, pdfBase64);
      showAlert(
        "Success",
        "Prescription PDF has been saved to the patient's Medilocker.",
        [{ text: "OK" }],
      );
    } catch (error) {
      showAlert(
        "Save Failed",
        error.message || "Failed to save prescription to Medilocker.",
        [{ text: "OK" }],
      );
    } finally {
      setIsSavingPrescription(false);
    }
  };

  // ─── WEB EDIT FIELD HELPER ───
  const WebEditableField = ({ label, field, value, multiline }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 6,
      }}
    >
      <Text style={stylesWeb.fieldLabel}>{label} </Text>
      {isEditMode ? (
        <TextInput
          style={[
            stylesWeb.webEditInput,
            multiline && { minHeight: 60, textAlignVertical: "top" },
          ]}
          value={editedPrescription?.[field] || ""}
          onChangeText={(v) => updatePrescriptionField(field, v)}
          multiline={multiline}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#aaa"
        />
      ) : (
        <Text style={stylesWeb.fieldValue}>{value || " "}</Text>
      )}
    </View>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          WEB LAYOUT  (width > 1000)
      ═══════════════════════════════════════════════════ */}
      {Platform.OS === "web" && width > 1000 && (
        <View style={stylesWeb.root}>
          <ImageBackground
            source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
            style={stylesWeb.background}
            resizeMode="cover"
          >
            <View style={stylesWeb.overlay} />

            <View style={stylesWeb.mainRow}>
              {/* LEFT SIDEBAR */}
              <View style={stylesWeb.sidebar}>
                <HospitalSidebarNavigation navigation={navigation} />
              </View>

              {/* RIGHT CONTENT */}
              <View style={stylesWeb.content}>
                {/* <View style={stylesWeb.headerRow}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View> */}

                {/* WHITE CARD */}
                <View style={stylesWeb.card}>
                  {/* ── CARD TITLE + BACK ── */}
                  <View style={stylesWeb.cardTitleRow}>
                    <Text style={stylesWeb.cardTitle}>Post Op Care</Text>
                    <TouchableOpacity
                      style={stylesWeb.backToHomeBtn}
                      onPress={() => navigation.goBack()}
                    >
                      <Text style={stylesWeb.backToHomeBtnText}>
                        Back to home
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* ── STEP BAR ── */}
                  <View style={stylesWeb.stepBar}>
                    {[
                      {
                        label: "Upload Documents",
                        sub: "Upload document",
                        done: true,
                      },
                      {
                        label: "Full Case Analysis",
                        sub: "Analyze Reports",
                        done: true,
                      },
                      {
                        label: "Generate Prescription",
                        sub: "Analyze Reports",
                        done: false,
                        active: true,
                      },
                    ].map((step, i, arr) => (
                      <React.Fragment key={i}>
                        <View style={stylesWeb.stepItem}>
                          {/* Circle */}
                          {step.done ? (
                            <View style={stylesWeb.stepCircleDone}>
                              <Text style={stylesWeb.stepTick}>✓</Text>
                            </View>
                          ) : (
                            <View
                              style={[
                                stylesWeb.stepCircleInactive,
                                step.active && stylesWeb.stepCircleActive,
                              ]}
                            >
                              <Text
                                style={[
                                  stylesWeb.stepNum,
                                  step.active && stylesWeb.stepNumActive,
                                ]}
                              >
                                {i + 1}
                              </Text>
                            </View>
                          )}
                          <View style={{ marginLeft: 8 }}>
                            <Text
                              style={[
                                stylesWeb.stepLabel,
                                (step.done || step.active) &&
                                  stylesWeb.stepLabelActive,
                              ]}
                            >
                              {step.label}
                            </Text>
                            <Text style={stylesWeb.stepSub}>{step.sub}</Text>
                          </View>
                        </View>
                        {i < arr.length - 1 && (
                          <View style={stylesWeb.stepConnector} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>

                  {/* ── MAIN TWO-COLUMN BODY ── */}
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={stylesWeb.bodyContainer}
                    showsVerticalScrollIndicator={true}
                  >
                    {/* ─── LEFT: PRESCRIPTION CARD ─── */}
                    <View style={stylesWeb.prescriptionCol}>
                      {/* Prescription paper */}
                      <View style={stylesWeb.prescriptionPaper}>
                        {/* Top header row */}
                        <View style={stylesWeb.rxTopRow}>
                          {/* Kokoro logo */}
                          <View style={stylesWeb.rxLogoRow}>
                            <Image
                              source={require("../../assets/DoctorsPortal/Icons/kokorologoo.png")}
                              style={stylesWeb.rxLogo}
                              resizeMode="contain"
                            />
                            <Text style={stylesWeb.rxLogoText}>
                              Kokoro.Doctor
                            </Text>
                          </View>

                          {/* Patient Summary pill */}
                          <View style={stylesWeb.patientSummaryPill}>
                            <Text style={stylesWeb.patientSummaryText}>
                              Patient Summary
                            </Text>
                          </View>
                        </View>

                        {/* Date + Doctor row */}
                        <View style={stylesWeb.rxMetaRow}>
                          <View style={{ flexDirection: "row", gap: 4 }}>
                            <Text style={stylesWeb.rxMetaLabel}>Date :</Text>
                            {isEditMode ? (
                              <TextInput
                                style={stylesWeb.webEditInputInline}
                                value={editedPrescription?.date || ""}
                                onChangeText={(v) =>
                                  updatePrescriptionField("date", v)
                                }
                                placeholder="DD MMM YYYY"
                                placeholderTextColor="#aaa"
                              />
                            ) : (
                              <Text style={stylesWeb.rxMetaValue}>
                                {currentPrescription?.date ||
                                  new Date().toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                              </Text>
                            )}
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text style={stylesWeb.rxMetaLabel}>
                              DR :{" "}
                              <Text style={stylesWeb.rxMetaValue}>
                                {user?.name || user?.doctorname || "Doctor"}
                              </Text>
                            </Text>
                            <Text style={stylesWeb.rxDrSpecialty}>
                              {user?.specialization || ""}
                            </Text>
                          </View>
                        </View>

                        {/* Divider */}
                        <View style={stylesWeb.rxDivider} />

                        {/* Patient info two-col */}
                        <View style={stylesWeb.rxInfoGrid}>
                          {/* Left column */}
                          <View style={{ flex: 1 }}>
                            <WebEditableField
                              label="Patient Name:"
                              field="patientName"
                              value={currentPrescription?.patientName}
                            />
                            <WebEditableField
                              label="Address:"
                              field="age"
                              value={currentPrescription?.age}
                            />
                            <WebEditableField
                              label="Date:"
                              field="diagnosisDate"
                              value={currentPrescription?.diagnosisDate}
                            />
                          </View>
                          {/* Right column */}
                          <View style={{ flex: 1 }}>
                            <WebEditableField
                              label="Insurance:"
                              field="insurance"
                              value={currentPrescription?.insurance}
                            />
                            <WebEditableField
                              label="Diagnosis:"
                              field="diagnosis"
                              value={currentPrescription?.diagnosis}
                              multiline
                            />
                          </View>
                        </View>

                        {/* Rx Content Box */}
                        <View style={stylesWeb.rxContentBox}>
                          {isEditMode ? (
                            <TextInput
                              style={stylesWeb.rxEditInput}
                              value={
                                editedPrescription?.prescriptionReport || ""
                              }
                              onChangeText={(v) =>
                                updatePrescriptionField("prescriptionReport", v)
                              }
                              multiline
                              placeholder="Prescription Report"
                              placeholderTextColor="#aaa"
                            />
                          ) : (
                            <Markdown style={markdownStyles} mergeStyle={true}>
                              {currentPrescription?.prescriptionReport ||
                                "No prescription report generated"}
                            </Markdown>
                          )}
                        </View>

                        {/* Edit / Save / Cancel row */}
                        {isEditMode ? (
                          <View style={stylesWeb.editActionsRow}>
                            <TouchableOpacity
                              style={stylesWeb.cancelBtn}
                              onPress={handleCancelEdit}
                            >
                              <Text style={stylesWeb.cancelBtnText}>
                                Cancel
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={stylesWeb.savePrescriptionBtn}
                              onPress={handleSavePrescription}
                            >
                              <Text style={stylesWeb.savePrescriptionBtnText}>
                                Save Changes
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : null}

                        {/* Bottom: Download bar + Prescription Approved */}
                        <View style={stylesWeb.rxBottomSection}>
                          {/* Blue download bar */}
                          <TouchableOpacity
                            style={stylesWeb.downloadBarBtn}
                            onPress={handleDownloadPrescription}
                          >
                            <Text style={stylesWeb.downloadBarBtnText}>
                              Download Prescription
                            </Text>
                          </TouchableOpacity>

                          {/* Prescription Approved banner */}
                          <View style={stylesWeb.approvedBanner}>
                            <Text style={stylesWeb.approvedBannerBold}>
                              Prescription Approved
                            </Text>
                            <Text style={stylesWeb.approvedBannerSub}>
                              {" - "}This Prescription is Approved by Doctor
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* ─── RIGHT: ACTION BUTTONS ─── */}
                    <View style={stylesWeb.actionsCol}>
                      {/* Download updated claim */}
                      <TouchableOpacity
                        style={stylesWeb.downloadUpdatedBtn}
                        onPress={handleApprovePrescription}
                        disabled={isSavingPrescription}
                      >
                        {isSavingPrescription ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Text style={stylesWeb.downloadUpdatedIcon}>✦</Text>
                            <Text style={stylesWeb.downloadUpdatedText}>
                              Download updated claim
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      {/* Open in editor */}
                      <TouchableOpacity
                        style={stylesWeb.openEditorBtn}
                        onPress={handleEditPrescription}
                      >
                        <Text style={stylesWeb.openEditorText}>
                          Open in editor
                        </Text>
                      </TouchableOpacity>

                      {/* Spacer */}
                      <View style={{ flex: 1 }} />

                      {/* Analyze Again */}
                      <TouchableOpacity
                        style={stylesWeb.analyzeAgainBtn}
                        onPress={() => navigation.goBack()}
                      >
                        <Text style={stylesWeb.analyzeAgainIcon}>↺</Text>
                        <Text style={stylesWeb.analyzeAgainText}>
                          Analyze Again
                        </Text>
                      </TouchableOpacity>

                      {/* Set up Data Integration */}
                      <TouchableOpacity style={stylesWeb.setupIntegrationBtn}>
                        <Text style={stylesWeb.setupIntegrationText}>
                          Set up Data Integration
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════
          MOBILE LAYOUT — UNTOUCHED
      ═══════════════════════════════════════════════════ */}
      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView
          style={stylesMobile.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={stylesMobile.header}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>

          <View style={stylesMobile.stepContainer}>
            <View style={stylesMobile.stepLine} />
            <View style={stylesMobile.stepRow}>
              <View style={stylesMobile.stepItem}>
                <View style={stylesMobile.stepCircleActive}>
                  <Text style={stylesMobile.tick}>✓</Text>
                </View>
                <Text style={stylesMobile.stepText}>Upload{"\n"}Documents</Text>
              </View>
              <View style={stylesMobile.stepItem}>
                <View style={stylesMobile.stepCircleActive}>
                  <Text style={stylesMobile.tick}>✓</Text>
                </View>
                <Text style={stylesMobile.stepText}>
                  Full case{"\n"}analysis
                </Text>
              </View>
              <View style={stylesMobile.stepItem}>
                <View style={stylesMobile.stepCircleInactive}>
                  <Text style={stylesMobile.stepNumber}>3</Text>
                </View>
                <Text style={stylesMobile.stepText}>
                  Generate{"\n"}Prescription
                </Text>
              </View>
            </View>
          </View>

          {/* PRESCRIPTION VIEW */}
          <View style={stylesMobile.prescriptionWrapper}>
            <View style={stylesMobile.topHeader}>
              <View
                style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
              >
                <Image
                  source={require("../../assets/DoctorsPortal/Icons/kokorologoo.png")}
                  style={stylesMobile.statIcon}
                  resizeMode="contain"
                />
                <Text style={stylesMobile.logoText}>Kokoro.Doctor</Text>
              </View>
              <View style={stylesMobile.summaryBadge}>
                <View style={stylesMobile.summaryBadgeContent}>
                  <Text style={stylesMobile.summaryText}>Patient Summary</Text>
                </View>
              </View>
            </View>

            <View style={stylesMobile.rowBetween}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={stylesMobile.metaText}>Date : </Text>
                {isEditMode ? (
                  <TextInput
                    style={stylesMobile.mobileEditInputInline}
                    value={editedPrescription?.date || ""}
                    onChangeText={(value) =>
                      updatePrescriptionField("date", value)
                    }
                    placeholder="DD MMM YYYY"
                    placeholderTextColor="#999999"
                  />
                ) : (
                  <Text style={stylesMobile.secondText}>
                    {currentPrescription?.date ||
                      new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </Text>
                )}
              </View>
              <View style={{ paddingRight: 16 }}>
                <Text style={stylesMobile.metaText}>
                  <Text style={{ fontWeight: "600" }}>DR :</Text>{" "}
                  {user?.name || user?.doctorname || "Doctor"}{" "}
                </Text>
                <Text
                  style={{
                    color: "#999",
                    alignSelf: "flex-end",
                    marginRight: "1%",
                  }}
                >
                  {" "}
                  {user?.specialization || ""}
                </Text>
              </View>
            </View>

            <View style={stylesMobile.divider} />

            <View style={stylesMobile.infoGrid}>
              <View style={{ flex: 1 }}>
                <Text style={stylesMobile.infoText}>
                  <Text style={stylesMobile.metaText}>Patient Name:</Text>{" "}
                  {isEditMode ? (
                    <TextInput
                      style={stylesMobile.mobileEditInputSmall}
                      value={editedPrescription?.patientName || ""}
                      onChangeText={(value) =>
                        updatePrescriptionField("patientName", value)
                      }
                      placeholder="Enter patient name"
                      placeholderTextColor="#999999"
                    />
                  ) : (
                    <Text style={stylesMobile.secondText}>
                      {currentPrescription?.patientName || " "}
                    </Text>
                  )}
                </Text>
                <Text style={stylesMobile.infoText}>
                  <Text style={stylesMobile.metaText}>Address:</Text>{" "}
                  {isEditMode ? (
                    <TextInput
                      style={stylesMobile.mobileEditInputSmall}
                      value={editedPrescription?.age || ""}
                      onChangeText={(value) =>
                        updatePrescriptionField("age", value)
                      }
                      placeholder="Enter age"
                      placeholderTextColor="#999999"
                    />
                  ) : (
                    <Text style={stylesMobile.secondText}>
                      {currentPrescription?.age || " "}
                    </Text>
                  )}
                </Text>
              </View>
              <View style={{ paddingRight: 16, flex: 1 }}>
                <Text style={stylesMobile.infoText}>
                  <Text style={stylesMobile.infoLabel}>Age:</Text>{" "}
                  {isEditMode ? (
                    <TextInput
                      style={stylesMobile.mobileEditInputSmall}
                      value={editedPrescription?.gender || ""}
                      onChangeText={(value) =>
                        updatePrescriptionField("gender", value)
                      }
                      placeholder="Enter gender"
                      placeholderTextColor="#999999"
                    />
                  ) : (
                    <Text style={stylesMobile.secondText}>
                      {currentPrescription?.gender || " "}
                    </Text>
                  )}
                </Text>
                <Text style={stylesMobile.infoText}>
                  <Text style={stylesMobile.infoLabel}>Diagnosis:</Text>{" "}
                  {isEditMode ? (
                    <TextInput
                      style={[
                        stylesMobile.mobileEditInputSmall,
                        { minHeight: 60 },
                      ]}
                      value={editedPrescription?.diagnosis || ""}
                      onChangeText={(value) =>
                        updatePrescriptionField("diagnosis", value)
                      }
                      placeholder="Enter diagnosis"
                      placeholderTextColor="#999999"
                      multiline
                    />
                  ) : (
                    <Text style={stylesMobile.secondText}>
                      {currentPrescription?.diagnosis || " "}
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            <ScrollView style={stylesMobile.rxBox}>
              {isEditMode ? (
                <TextInput
                  style={stylesMobile.mobileRxInput}
                  value={editedPrescription?.prescriptionReport || ""}
                  onChangeText={(value) =>
                    updatePrescriptionField("prescriptionReport", value)
                  }
                  placeholder="Prescription Report"
                  placeholderTextColor="#999999"
                  multiline
                />
              ) : (
                <Markdown style={markdownStylesMobile} mergeStyle={true}>
                  {currentPrescription?.prescriptionReport ||
                    "No prescription report generated"}
                </Markdown>
              )}
            </ScrollView>
          </View>

          {isEditMode && (
            <View style={stylesMobile.editActions}>
              <TouchableOpacity
                style={stylesMobile.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={stylesMobile.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={stylesMobile.saveButton}
                onPress={handleSavePrescription}
              >
                <Text style={stylesMobile.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isEditMode && (
            <TouchableOpacity
              style={stylesMobile.approveBtns}
              onPress={handleEditPrescription}
            >
              <Text style={stylesMobile.approveBtnTexts}>
                Edit Prescription
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={stylesMobile.approveBtn}>
            <Text style={stylesMobile.approveBtnText}>
              Download Prescription
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={stylesMobile.analyzeBtn}>
            <Text style={stylesMobile.analyzeText}>Analyze once again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={stylesMobile.setupBtn}>
            <Text style={stylesMobile.setupText}>Set up date Integration</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════
// WEB STYLES
// ═══════════════════════════════════════════════════
const stylesWeb = StyleSheet.create({
  root: {
    flex: 1,
    height: "100vh",
    overflow: "hidden",
  },
  background: {
    flex: 1,
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  mainRow: {
    flexDirection: "row",
    height: "100%",
    zIndex: 2,
  },
  sidebar: {
    width: "15%",
  },
  content: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },
  headerRow: {
    marginBottom: 16,
  },

  /* ── CARD ── */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    marginTop:"4%"
  },

  /* ── CARD TITLE ROW ── */
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 44,
    marginBottom: 6,
    flexShrink: 0,
  },
  cardTitle: { fontSize: 19, fontWeight: "700", color: "#111827" },
  backToHomeBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  backToHomeBtnText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  /* ── STEP BAR ── */
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepCircleDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepTick: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepCircleInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    borderColor: "#2563EB",
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  stepNumActive: {
    color: "#2563EB",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  stepLabelActive: {
    color: "#2563EB",
  },
  stepSub: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 1,
  },
  stepConnector: {
    height: 2,
    width: 32,
    backgroundColor: "#2563EB",
    marginHorizontal: 6,
    alignSelf: "center",
    flexShrink: 0,
  },

  /* ── BODY ── */
  bodyContainer: {
    flexDirection: "row",
    flexGrow: 1,
    gap: 20,
    padding: 16,
    alignItems: "flex-start",
  },

  /* ── LEFT: PRESCRIPTION COLUMN ── */
  prescriptionCol: {
    flex: 1,
  },
  prescriptionPaper: {
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#00000030",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    overflow: "hidden",
  },

  /* RX top header */
  rxTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  rxLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 14,
  },
  rxLogo: { width: 28, height: 28 },
  rxLogoText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#00000080",
  },
  /* Patient Summary pill — right-aligned badge like Figma */
  patientSummaryPill: {
    height: 44,
    width: 170,
    backgroundColor: "#EDF6FF",
    borderBottomLeftRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  patientSummaryText: {
    backgroundColor: "#2563EB",
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    overflow: "hidden",
  },

  /* Date / Doctor row */
  rxMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 4,
  },
  rxMetaLabel: {
    fontSize: 13,
    color: "#111",
    fontWeight: "600",
  },
  rxMetaValue: {
    fontSize: 13,
    color: "#555",
    fontWeight: "400",
  },
  rxDrSpecialty: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  webEditInputInline: {
    fontSize: 13,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#FAFAFA",
    minWidth: 100,
  },

  /* Divider */
  rxDivider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 12,
  },

  /* Patient info grid */
  rxInfoGrid: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#111",
    fontWeight: "600",
    minWidth: 80,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },
  webEditInput: {
    fontSize: 13,
    color: "#111",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FAFAFA",
    flex: 1,
    minHeight: 32,
  },

  /* Rx content box */
  rxContentBox: {
    borderWidth: 1,
    borderColor: "#D6D7D8",
    borderRadius: 10,
    padding: 16,
    minHeight: 160,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  rxEditInput: {
    fontSize: 14,
    color: "#444",
    textAlignVertical: "top",
    minHeight: 160,
    outlineStyle: "none",
  },

  /* Edit actions */
  editActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 12,
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  cancelBtnText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  savePrescriptionBtn: {
    borderRadius: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  savePrescriptionBtnText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },

  /* Bottom section */
  rxBottomSection: {
    marginTop: 8,
    gap: 10,
  },
  downloadBarBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
  },
  downloadBarBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  approvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderRadius: 6,
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  approvedBannerBold: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  approvedBannerSub: {
    fontSize: 13,
    fontWeight: "400",
    color: "#2563EB",
  },

  /* ── RIGHT: ACTIONS COLUMN ── */
  actionsCol: {
    width: 220,
    flexShrink: 0,
    flexDirection: "column",
    gap: 12,
    alignSelf: "stretch",
  },
  downloadUpdatedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  downloadUpdatedIcon: {
    color: "#fff",
    fontSize: 14,
  },
  downloadUpdatedText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  openEditorBtn: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  openEditorText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  analyzeAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 13,
    backgroundColor: "#F0FFF4",
  },
  analyzeAgainIcon: {
    fontSize: 16,
    color: "#16A34A",
  },
  analyzeAgainText: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "600",
  },
  setupIntegrationBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },
  setupIntegrationText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

// ═══════════════════════════════════════════════════
// MOBILE STYLES — UNTOUCHED
// ═══════════════════════════════════════════════════
const stylesMobile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    zIndex: 2,
  },
  prescriptionWrapper: {
    marginLeft: "2%",
    marginRight: "2%",
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingLeft: 16,
    paddingBottom: 20,
    borderWidth: 2,
    borderColor: "#00000040",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIcon: {
    width: 20,
    height: 20,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#00000075",
  },
  summaryBadge: {
    height: 40,
    width: 160,
    alignItems: "flex-end",
    backgroundColor: "#EDF6FF",
    borderBottomLeftRadius: 50,
  },
  summaryBadgeContent: {
    height: 30,
    width: 130,
    backgroundColor: "#025AE0",
    borderBottomLeftRadius: 40,
    paddingTop: "3%",
    alignItems: "center",
    borderColor: "#025AE0",
  },
  summaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "400",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#000000",
    fontWeight: "500",
  },
  secondText: {
    color: "#555555",
    fontSize: 12,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAE9E9",
    marginVertical: 16,
    marginRight: "4.5%",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: {
    fontSize: 12,
    color: "#444",
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#000000",
  },
  rxBox: {
    marginTop: "4%",
    borderWidth: 1,
    borderColor: "#D6D7D8",
    borderRadius: 15,
    padding: 12,
    marginRight: 16,
    minHeight: 140,
    maxHeight: 300,
  },
  approveBtn: {
    alignSelf: "center",
    width: "70%",
    backgroundColor: "#025AE0",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  approveBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  approveBtns: {
    alignSelf: "center",
    width: "70%",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    borderColor: "#94A3B8",
    borderWidth: 2,
  },
  approveBtnTexts: {
    color: "#6B6B6B",
    fontWeight: "600",
    fontSize: 14,
  },
  analyzeBtn: {
    borderWidth: 1,
    alignSelf: "center",
    width: "70%",
    backgroundColor: "#F3FFF7",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    borderColor: "#25BA58",
  },
  analyzeText: {
    color: "#25BA58",
    fontWeight: "600",
    fontSize: 14,
  },
  setupBtn: {
    borderWidth: 1,
    alignSelf: "center",
    width: "70%",
    backgroundColor: "#25BA58",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    borderColor: "#25BA58",
  },
  setupText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  mobileEditInputInline: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    backgroundColor: "#FAFAFA",
  },
  mobileEditInputSmall: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FAFAFA",
    minHeight: 32,
  },
  mobileRxInput: {
    fontSize: 13,
    fontWeight: "400",
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
    minHeight: 200,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  cancelButton: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 13,
    fontWeight: "500",
  },
  saveButton: {
    borderRadius: 8,
    backgroundColor: "#FF7072",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  stepContainer: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepItem: {
    alignItems: "center",
    width: "33%",
  },
  stepLine: {
    position: "absolute",
    top: 17 + 16,
    left: "16.5%",
    right: "16.5%",
    height: 2,
    backgroundColor: "#1680ECBF",
  },
  stepCircleActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleInactive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
  },
  tick: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepNumber: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  stepText: {
    fontSize: 11,
    textAlign: "center",
    color: "#1D4ED8",
    marginTop: 6,
  },
});

export default PostOpCarePrescription;
