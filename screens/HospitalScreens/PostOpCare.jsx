// import React, { useState } from "react";
// import {
//   ImageBackground,
//   StyleSheet,
//   View,
//   Platform,
//   TouchableOpacity,
//   Text,
//   ScrollView,
//   useWindowDimensions,
//   Image,
//   Animated,
//   StatusBar,
//   ActivityIndicator
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
// import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
// import { Feather } from "@expo/vector-icons";
// import * as DocumentPicker from "expo-document-picker";
// import { API_URL } from "../../env-vars";
// import { extractStructuredData } from "../../utils/MedilockerService";

// const PostOpCare = ({ navigation }) => {
//   const [claimFiles, setClaimFiles] = useState([]);
//   const { width, height } = useWindowDimensions();
//   const [currentStep, setCurrentStep] = useState(0); // 0 = upload, 1 = review
//   const slideAnim = useState(new Animated.Value(0))[0];
//   const cardWidth = width * 0.95;
//   const [analysisData, setAnalysisData] = useState(null);
//   const [loadingAnalysis, setLoadingAnalysis] = useState(false);
//   const [claimDocs, setClaimDocs] = useState([]);
//   const [policyDocs, setPolicyDocs] = useState([]);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
//   const [generatedPrescription, setGeneratedPrescription] = useState(null);
//   const aiAnalysisSideAnim = useState(new Animated.Value(height))[0];
//   const analyzeMobileInsurance = async () => {
//     if (claimDocs.length === 0) return;

//     try {
//       setIsGenerating(true);
//       console.log("[analyzeMobileInsurance] Starting analysis...", {
//         filesCount: claimDocs.length,
//       });

//       const file = claimDocs[0];
//       const userId = localStorage.getItem("user_id");
//       const token = localStorage.getItem("token");

//       console.log("[analyzeMobileInsurance] File info:", {
//         name: file.name,
//         userId,
//       });

//       // Convert URI to Blob to match web File format
//       const fileResponse = await fetch(file.uri);
//       if (!fileResponse.ok)
//         throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
//       const fileBlob = await fileResponse.blob();

//       const formData = new FormData();
//       formData.append("file", fileBlob, file.name);

//       console.log("[analyzeMobileInsurance] Sending to API...", {
//         endpoint: `${API_URL}/medilocker/users/${userId}/insurance/analyze`,
//       });

//       const response = await fetch(
//         `${API_URL}/medilocker/users/${userId}/insurance/analyze`,
//         {
//           method: "POST",
//           headers: {
//             ...(token && { Authorization: `Bearer ${token}` }),
//           },
//           body: formData,
//         },
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API Error ${response.status}: ${errorText}`);
//       }

//       const data = await response.json();
//       console.log("[analyzeMobileInsurance] API RESPONSE SUCCESS:", data);

//       if (!data) {
//         throw new Error("Empty response from API");
//       }

//       setAnalysisData(data);
//       setCurrentStep(1);
//       console.log(
//         "[analyzeMobileInsurance] Analysis complete, moved to step 1",
//       );
//     } catch (error) {
//       console.error("[analyzeMobileInsurance] Error:", {
//         message: error.message,
//         stack: error.stack,
//       });
//       alert(
//         `❌ Analysis failed: ${error.message}\n\nPlease check your internet connection and try again.`,
//       );
//     } finally {
//       setIsGenerating(false);
//     }
//   };
//   const handleGeneratePrescription = async () => {
//     console.log("[handleGeneratePrescription] Called to extract prescription");

//     // Check which array has files (claimDocs for mobile UI, claimFiles for web UI)
//     const filesToProcess = claimDocs.length > 0 ? claimDocs : claimFiles;

//     console.log("[handleGeneratePrescription] Files to process:", {
//       count: filesToProcess.length,
//       source: claimDocs.length > 0 ? "claimDocs" : "claimFiles",
//     });

//     if (filesToProcess.length === 0) {
//       alert("❌ Please upload documents first");
//       return;
//     }

//     // Extract prescription using same method as Prescription.jsx
//     await extractFromFiles(filesToProcess);
//   };

//   const fileToBase64 = async (file) => {
//     return new Promise((resolve, reject) => {
//       try {
//         // Handle both web File objects and mobile URI-based files
//         if (file.uri) {
//           // Mobile files with URI
//           const xhr = new XMLHttpRequest();
//           xhr.onload = () => {
//             const reader = new FileReader();
//             reader.onload = () => {
//               try {
//                 const base64String = reader.result.split(",")[1];
//                 resolve(base64String);
//               } catch (parseError) {
//                 console.error(
//                   "[fileToBase64] Error parsing base64:",
//                   parseError,
//                 );
//                 reject(
//                   new Error(`Failed to parse base64: ${parseError.message}`),
//                 );
//               }
//             };
//             reader.onerror = () =>
//               reject(new Error(`Failed to read file: ${file.name}`));
//             reader.readAsDataURL(xhr.response);
//           };
//           xhr.onerror = () =>
//             reject(new Error(`Failed to fetch file: ${file.name}`));
//           xhr.open("GET", file.uri);
//           xhr.responseType = "blob";
//           xhr.send();
//         } else {
//           // Web File objects
//           const reader = new FileReader();
//           reader.onload = () => {
//             try {
//               const base64String = reader.result.split(",")[1];
//               resolve(base64String);
//             } catch (parseError) {
//               console.error("[fileToBase64] Error parsing base64:", parseError);
//               reject(
//                 new Error(`Failed to parse base64: ${parseError.message}`),
//               );
//             }
//           };
//           reader.onerror = () =>
//             reject(new Error(`Failed to read file: ${file.name}`));
//           reader.readAsDataURL(file);
//         }
//       } catch (error) {
//         console.error("[fileToBase64] Error:", error);
//         reject(new Error(`Failed to process file: ${error.message}`));
//       }
//     });
//   };

//   // Extract structured data from files
//   const extractFromFiles = async (files) => {
//     if (files.length === 0) {
//       return;
//     }

//     setIsGenerating(true);
//     try {
//       // Convert files to base64 format
//       const filesWithBase64 = await Promise.all(
//         files.map(async (file, index) => {
//           try {
//             const base64Content = await fileToBase64(file);
//             return {
//               filename: file.name,
//               content: base64Content,
//             };
//           } catch (fileError) {
//             console.error(
//               `[extractFromFiles] Error converting file ${index + 1} (${
//                 file.name
//               }):`,
//               fileError,
//             );
//             throw new Error(
//               `Failed to convert file "${file.name}": ${fileError.message}`,
//             );
//           }
//         }),
//       );

//       // Call extraction API
//       const result = await extractStructuredData(filesWithBase64);

//       // Check if prescription exists in result
//       const prescriptionText =
//         result?.prescription || result?.data?.prescription || "";

//       if (!prescriptionText) {
//         console.error(
//           "[extractFromFiles] WARNING: No prescription found in result!",
//           {
//             result: result,
//             resultKeys: Object.keys(result || {}),
//           },
//         );
//       }

//       // Extract patient details from API response if available
//       const patientDetails = result?.patient_details || {};
//       const patientName = patientDetails?.name || "";
//       const patientAge =
//         patientDetails?.age !== null && patientDetails?.age !== undefined
//           ? String(patientDetails.age)
//           : "";
//       const patientGender = patientDetails?.gender || "";
//       const patientDiagnosis = patientDetails?.diagnosis || "";

//       // Update prescription with extracted data
//       const prescription = {
//         clinicName: "Kokoro.Doctor",
//         date: new Date().toLocaleDateString("en-GB", {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//         }),

//         patientName: patientName,
//         age: patientAge,
//         gender: patientGender,
//         diagnosis: patientDiagnosis,
//         diagnosisDate: "",
//         prescriptionReport: prescriptionText,
//       };

//       setGeneratedPrescription(prescription);

//       // Navigate to preview screen after generation
//       navigation.navigate("PostOpCarePrescription", {
//         generatedPrescription: prescription,
//       });
//     } catch (error) {
//       console.error("[extractFromFiles] Error in extraction process:", {
//         name: error.name,
//         message: error.message,
//         userFriendlyMessage: error.userFriendlyMessage,
//         originalMessage: error.originalMessage,
//         status: error.status,
//         details: error.details,
//         stack: error.stack,
//       });

//       // Show user-friendly error message
//       const errorMessage =
//         error.userFriendlyMessage ||
//         error.message ||
//         "Failed to extract prescription data. Please try again.";
//       alert(errorMessage);

//       // Also log to console for debugging
//       console.error("[extractFromFiles] Full error object:", error);
//     } finally {
//       setIsGenerating(false);
//       console.log(
//         "[extractFromFiles] Extraction process finished (success or error)",
//       );
//     }
//   };

//   const handleGenerate = async () => {
//     if (claimDocs.length === 0 || isGenerating) return;
//     await analyzeMobileInsurance();
//   };

//   const openAiAnalysisModal = () => {
//     setAiAnalysisModalOpen(true);
//     Animated.timing(aiAnalysisSideAnim, {
//       toValue: 0,
//       duration: 400,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeAiAnalysisModal = () => {
//     Animated.timing(aiAnalysisSideAnim, {
//       toValue: height,
//       duration: 400,
//       useNativeDriver: true,
//     }).start(() => {
//       setAiAnalysisModalOpen(false);
//     });
//   };
//   const pickDocument = async (type) => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*",
//         multiple: true, // ✅ IMPORTANT
//       });

//       if (result.canceled) return;

//       const files = result.assets;

//       if (type === "claim") {
//         setClaimDocs((prev) => [...prev, ...files]);
//       } else {
//         setPolicyDocs((prev) => [...prev, ...files]);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   const removeFile = (type, index) => {
//     if (type === "claim") {
//       setClaimDocs((prev) => prev.filter((_, i) => i !== index));
//     } else {
//       setPolicyDocs((prev) => prev.filter((_, i) => i !== index));
//     }
//   };

//   // Step 1 completed only if claim upload exists
//   const isUploadComplete = claimFiles.length > 0;

//   const handleFileUpload = () => {
//     if (Platform.OS !== "web") return;

//     const input = document.createElement("input");
//     input.type = "file";
//     input.multiple = true;

//     input.onchange = (e) => {
//       const files = Array.from(e.target.files);
//       setClaimFiles((prev) => [...prev, ...files]);
//     };

//     input.click();
//   };

//   const handleDeleteFile = (index) => {
//     setClaimFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const goToReview = () => {
//     setCurrentStep(1);

//     Animated.timing(slideAnim, {
//       toValue: -cardWidth, // slide left
//       duration: 500,
//       useNativeDriver: true,
//     }).start();
//   };

//   const analyzeInsurance = async () => {
//     if (claimFiles.length === 0) return;

//     try {
//       setLoadingAnalysis(true);

//       const file = claimFiles[0];

//       const userId = localStorage.getItem("user_id"); // 👈 dynamic
//       const token = localStorage.getItem("token"); // 👈 if needed

//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await fetch(
//         `${API_URL}/medilocker/users/${userId}/insurance/analyze`,
//         {
//           method: "POST",
//           headers: {
//             ...(token && { Authorization: `Bearer ${token}` }),
//           },
//           body: formData,
//         },
//       );

//       const data = await response.json();

//       console.log("API RESPONSE:", data);

//       setAnalysisData(data);
//       goToReview();
//     } catch (error) {
//       console.error("Analysis error:", error);
//     } finally {
//       setLoadingAnalysis(false);
//     }
//   };

//   return (
//     <>
//       {Platform.OS === "web" && (width > 1000 || width === 0) && <View></View>}
//       {(Platform.OS !== "web" || width < 1000) && (
//         <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
//           <ScrollView
//             contentContainerStyle={stylesMobile.container}
//             showsVerticalScrollIndicator={false}
//           >
//             <StatusBar barStyle="light-content" backgroundColor="#fff" />
//             <View style={stylesMobile.header}>
//               <HeaderLoginSignUp navigation={navigation} />
//             </View>
//             <Text style={stylesMobile.title}>Post OP Care</Text>

//             <TouchableOpacity style={stylesMobile.selectBtn}>
//               <Text style={stylesMobile.selectText}>Select Patient</Text>
//             </TouchableOpacity>

//             {/* Stepper */}
//             <View style={stylesMobile.stepContainer}>
//               <View style={stylesMobile.line} />

//               {[1, 2, 3].map((item, index) => {
//                 const active = index === currentStep;
//                 const completed = index < currentStep;
//                 return (
//                   <View key={index} style={stylesMobile.stepWrapper}>
//                     <View
//                       style={[
//                         stylesMobile.circle,
//                         active && stylesMobile.activeCircle,
//                         completed && stylesMobile.completedCircle, // ✅ NEW
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           stylesMobile.circleText,
//                           active && stylesMobile.activeCircleText,
//                           completed && stylesMobile.completedText,
//                         ]}
//                       >
//                         {completed ? "✓" : item}
//                       </Text>
//                     </View>

//                     <Text style={stylesMobile.stepText}>
//                       {item === 1 && "Upload\nDocuments"}
//                       {item === 2 && "Full case\nanalysis"}
//                       {item === 3 && "Generate\nPrescription"}
//                     </Text>
//                   </View>
//                 );
//               })}
//             </View>
//             {currentStep === 0 ? (
//               <View style={stylesMobile.card}>
//                 <Image
//                   source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
//                   style={{ width: "100%", marginBottom: 12 }}
//                   resizeMode="contain"
//                 />
//                 <Text style={stylesMobile.cardTitle}>
//                   AI-Powered Full Case {"\n"}Review
//                 </Text>

//                 <Text style={stylesMobile.subText}>
//                   Looking across all reports to build a {"\n"}complete patient
//                   story
//                 </Text>

//                 <View style={stylesMobile.bulletWrapper}>
//                   <Text style={stylesMobile.bullet}>
//                     • Documents are mandatory
//                   </Text>
//                   <Text style={stylesMobile.bullet}>
//                     • Analysis cannot begin Atleast one document
//                   </Text>
//                   <Text style={stylesMobile.bullet}>
//                     • Kokoro AI analyzes your Reports directly
//                   </Text>
//                 </View>

//                 <Text style={stylesMobile.label}>Insurance Claim Document</Text>
//                 <TouchableOpacity
//                   style={stylesMobile.uploadBox}
//                   onPress={() => pickDocument("claim")}
//                 >
//                   <Feather name="upload" size={20} color="#2563EB" />

//                   <Text style={stylesMobile.uploadText}>
//                     Upload Photo{" "}
//                     <Text style={stylesMobile.link}>Click here</Text>
//                   </Text>
//                 </TouchableOpacity>

//                 {/* ✅ Uploaded text */}
//                 {claimDocs.length > 0 && (
//                   <ScrollView
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={stylesMobile.fileScroll}
//                     style={{ marginTop: -10, marginBottom: 10 }}
//                   >
//                     {claimDocs.map((doc, index) => (
//                       <View key={index} style={stylesMobile.fileChip}>
//                         <Feather
//                           name="check-circle"
//                           size={14}
//                           color="#16A34A"
//                         />

//                         <Text style={stylesMobile.fileText} numberOfLines={1}>
//                           {doc.name}
//                         </Text>

//                         <TouchableOpacity
//                           onPress={() => removeFile("claim", index)}
//                         >
//                           <Feather name="x" size={14} color="#6B7280" />
//                         </TouchableOpacity>
//                       </View>
//                     ))}
//                   </ScrollView>
//                 )}

//                 <TouchableOpacity
//                   style={[
//                     stylesMobile.button,
//                     (isGenerating || claimDocs.length === 0) && {
//                       opacity: 0.5,
//                     },
//                   ]}
//                   onPress={handleGenerate}
//                   disabled={isGenerating || claimDocs.length === 0}
//                 >
//                   <Text style={stylesMobile.buttonText}>
//                     {isGenerating ? (
//                       <View
//                         style={{
//                           flexDirection: "row",
//                           alignItems: "center",
//                           gap: 6,
//                         }}
//                       >
//                         <ActivityIndicator color="#fff" size="small" />
//                       </View>
//                     ) : (
//                       <Text style={stylesMobile.buttonText}>
//                         Full case analysis
//                       </Text>
//                     )}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               // 🔵 STEP 2 → Full case analysis
//               <View style={stylesMobile.resultCard}>
//                 <View style={stylesMobile.resultCard}>
//                   {/* 🔹 STEP HEADER */}

//                   <Text
//                     style={{
//                       color: "#6B7280",
//                       marginBottom: 10,
//                       paddingLeft: "2%",
//                     }}
//                   >
//                     {claimDocs.length} Documents
//                   </Text>

//                   {/* 🔹 DOCUMENT LIST */}
//                   <View
//                     style={{
//                       backgroundColor: "#F9FAFB",
//                       borderRadius: 10,
//                       padding: 10,
//                       height: 320, // 🔥 FIXED HEIGHT
//                     }}
//                   >
//                     <ScrollView
//                       showsVerticalScrollIndicator={true}
//                       contentContainerStyle={{ paddingBottom: 10 }}
//                     >
//                       {claimDocs.map((doc, index) => (
//                         <View key={index} style={stylesMobile.docCard}>
//                           <View
//                             style={{
//                               flexDirection: "row",
//                               alignItems: "center",
//                             }}
//                           >
//                             {/* File Icon */}
//                             <Image
//                               source={require("../../assets/HospitalPortal/Icon/prescriptionfile.png")}
//                               style={stylesMobile.fileIcon}
//                               resizeMode="contain"
//                             />

//                             {/* File Info */}
//                             <View style={{ marginLeft: 10, flex: 1 }}>
//                               <Text style={stylesMobile.docTitle}>
//                                 Prescription {index + 1}
//                               </Text>
//                               <Text style={stylesMobile.docMeta}>
//                                 SIZE: {Math.round(doc.size / 1024)} KB | Format:
//                                 PDF
//                               </Text>
//                             </View>

//                             {/* Button */}
//                             <TouchableOpacity
//                               style={stylesMobile.prescriptionBtn}
//                             >
//                               <Text style={stylesMobile.prescriptionText}>
//                                 My Prescription
//                               </Text>
//                             </TouchableOpacity>
//                           </View>
//                         </View>
//                       ))}
//                     </ScrollView>
//                   </View>

//                   {/* 🔹 AI Assistant */}
//                   <View style={stylesMobile.aiAssistantBox}>
//                     <Text style={stylesMobile.aiAssistantText}>
//                       Clinical AI Assistant
//                     </Text>
//                   </View>
//                 </View>

//                 {currentStep === 1 && analysisData && (
//                   <TouchableOpacity style={stylesMobile.floatingBtn}>
//                     <Image
//                       source={require("../../assets/HospitalPortal/Icon/blue_heart.png")}
//                       style={{
//                         width: 65,
//                         height: 65,
//                         resizeMode: "cover",
//                       }}
//                     />
//                   </TouchableOpacity>
//                 )}

//                 <TouchableOpacity
//                   style={[
//                     stylesMobile.acceptBtn,
//                     isGenerating && { opacity: 0.6 },
//                   ]}
//                   onPress={handleGeneratePrescription}
//                   disabled={isGenerating}
//                 >
//                   {isGenerating ? (
//                     <View
//                       style={{
//                         flexDirection: "row",
//                         alignItems: "center",
//                         gap: 10,
//                         justifyContent: "center",
//                       }}
//                     >
//                       <ActivityIndicator size="small" color="#fff" />
//                       <Text style={stylesMobile.acceptText}>
//                         Generating Prescription...
//                       </Text>
//                     </View>
//                   ) : (
//                     <Text style={stylesMobile.acceptText}>
//                       Generate Prescription
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             )}
//           </ScrollView>

//           {/* 🎯 Floating Button for AI Analysis Modal */}
//         </SafeAreaView>
//       )}

//       {/* 🎯 AI ANALYSIS MODAL - Mobile */}
//       {aiAnalysisModalOpen && (
//         <Animated.View
//           style={[
//             stylesMobile.aiAnalysisModal,
//             { transform: [{ translateY: aiAnalysisSideAnim }] },
//           ]}
//         >
//           {/* Header */}
//           <View style={stylesMobile.aiAnalysisHeader}>
//             <View style={{ flexDirection: "column" }}>
//               <Text style={stylesMobile.aiAnalysisTitle}>
//                 Kokoro AI Analysis
//               </Text>
//               <Text
//                 style={{ color: "#999999", fontSize: 14, fontWeight: "400" }}
//               >
//                 You're not alone in this case, we're here to assist.
//               </Text>
//             </View>
//             <TouchableOpacity onPress={closeAiAnalysisModal}>
//               <Feather name="x" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>

//           {/* Content */}
//           <ScrollView
//             style={stylesMobile.aiAnalysisContent}
//             showsVerticalScrollIndicator={true}
//             contentContainerStyle={{ paddingBottom: 20 }}
//           >
//             {analysisData?.analysis ? (
//               <>
//                 {/* Status */}
//                 <View style={stylesMobile.analysisSection}>
//                   <Text style={stylesMobile.statusText}>
//                     Status:{" "}
//                     {analysisData?.analysis?.is_complete
//                       ? "✅ Complete"
//                       : "❌ Incomplete"}
//                   </Text>
//                 </View>

//                 {/* Missing Fields */}
//                 <View style={stylesMobile.analysisSection}>
//                   <Text style={stylesMobile.analysisSubtitle}>
//                     Missing Fields:
//                   </Text>
//                   {analysisData?.analysis?.missing_fields?.length > 0 ? (
//                     analysisData?.analysis?.missing_fields.map((item, i) => (
//                       <Text key={i} style={stylesMobile.analysisItem}>
//                         • {item}
//                       </Text>
//                     ))
//                   ) : (
//                     <Text style={stylesMobile.analysisItem}>None</Text>
//                   )}
//                 </View>

//                 {/* Issues */}
//                 <View style={stylesMobile.analysisSection}>
//                   <Text style={stylesMobile.analysisSubtitle}>Issues:</Text>
//                   {analysisData?.analysis?.issues?.length > 0 ? (
//                     analysisData?.analysis?.issues.map((item, i) => (
//                       <Text key={i} style={stylesMobile.analysisItem}>
//                         ⚠️ {item}
//                       </Text>
//                     ))
//                   ) : (
//                     <Text style={stylesMobile.analysisItem}>No issues</Text>
//                   )}
//                 </View>

//                 {/* Suggestions */}
//                 <View style={stylesMobile.analysisSection}>
//                   <Text style={stylesMobile.analysisSubtitle}>
//                     Suggestions:
//                   </Text>
//                   {analysisData?.analysis?.suggestions?.length > 0 ? (
//                     analysisData?.analysis?.suggestions.map((item, i) => (
//                       <Text key={i} style={stylesMobile.analysisItem}>
//                         💡 {item}
//                       </Text>
//                     ))
//                   ) : (
//                     <Text style={stylesMobile.analysisItem}>
//                       No suggestions
//                     </Text>
//                   )}
//                 </View>

//                 {/* Claim Opportunity */}
//                 <View style={stylesMobile.analysisSection}>
//                   <Text style={stylesMobile.analysisSubtitle}>
//                     Claim Opportunity:
//                   </Text>
//                   <Text style={stylesMobile.analysisItem}>
//                     {analysisData?.analysis?.claim_opportunity || "N/A"}
//                   </Text>
//                 </View>
//               </>
//             ) : (
//               <Text style={stylesMobile.analysisItem}>
//                 Analysis data not available
//               </Text>
//             )}
//           </ScrollView>
//         </Animated.View>
//       )}
//     </>
//   );
// };

// const stylesMobile = StyleSheet.create({
//   container: {
//     backgroundColor: "#FFFFFF",
//   },
//   header: {
//     zIndex: 2,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     paddingLeft: "2% ",
//   },

//   selectBtn: {
//     marginLeft: "2%",
//     alignSelf: "flex-start",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginBottom: 16,
//   },

//   selectText: {
//     fontSize: 14,
//     color: "#333",
//   },

//   stepContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//     position: "relative", // ✅ REQUIRED
//   },

//   stepWrapper: {
//     alignItems: "center",
//     flex: 1,
//   },

//   circle: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: "#E6F0FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 4,
//   },

//   circleText: {
//     fontSize: 12,
//     color: "#3B82F6",
//     fontWeight: "600",
//   },

//   stepText: {
//     fontSize: 10,
//     textAlign: "center",
//     color: "#3B82F6",
//   },

//   card: {
//     backgroundColor: "#F3F4F6",
//     borderRadius: 12,
//     padding: 16,
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     textAlign: "center",
//     marginBottom: 10,
//   },

//   subText: {
//     fontSize: 12,
//     textAlign: "center",
//     color: "#6B7280",
//     marginBottom: 10,
//   },

//   bulletWrapper: {
//     marginBottom: 16,
//   },

//   bullet: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginBottom: 4,
//   },

//   label: {
//     fontSize: 13,
//     fontWeight: "600",
//     marginBottom: 6,
//     color: "#2563EB",
//   },

//   uploadBox: {
//     borderWidth: 1,
//     borderStyle: "dashed",
//     borderColor: "#3B82F6",
//     borderRadius: 10,
//     paddingVertical: 24,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 16,
//     gap: 6, // 🔥 important
//   },

//   uploadText: {
//     fontSize: 13,
//     color: "#6B7280",
//   },

//   link: {
//     color: "#2563EB",
//     fontWeight: "600",
//   },

//   button: {
//     backgroundColor: "#6B9CFF",
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },

//   buttonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   line: {
//     position: "absolute",
//     top: 13, // ✅ half of 26px circle (26/2 = 13)
//     left: "16.5%",
//     right: "16.5%",
//     height: 2,
//     backgroundColor: "#1680ECBF",
//   },

//   activeCircle: {
//     backgroundColor: "#2563EB",
//   },

//   activeCircleText: {
//     color: "#fff",
//   },
//   uploadedRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: -10,
//     marginBottom: 10,
//     gap: 6,
//   },

//   uploadedText: {
//     fontSize: 11,
//     color: "#6B7280",
//   },
//   fileChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#E5E7EB",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginRight: 8,
//     maxWidth: 200,
//     gap: 6,
//   },

//   fileText: {
//     fontSize: 11,
//     color: "#374151",
//   },
//   fileScroll: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   resultCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     // padding: 16,
//     paddingLeft: "1%",
//     paddingRight: "1%",
//   },

//   resultTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#2563EB",
//   },

//   resultSub: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginBottom: 10,
//   },

//   resultBox: {
//     backgroundColor: "#F9FAFB",
//     padding: 12,
//     borderRadius: 8,
//     maxHeight: 300, // ✅ IMPORTANT (adjust as needed)
//   },

//   blueLabel: {
//     backgroundColor: "#E0EDFF",
//     color: "#2563EB",
//     padding: 6,
//     marginBottom: 10,
//     fontSize: 12,
//   },

//   text: {
//     fontSize: 12,
//     marginBottom: 4,
//   },

//   sectionTitle: {
//     fontSize: 13,
//     fontWeight: "600",
//     marginTop: 8,
//   },

//   acceptBtn: {
//     backgroundColor: "#2563EB",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: "10%",
//     alignItems: "center",
//     marginBottom: "2%",
//   },

//   acceptText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   completedCircle: {
//     backgroundColor: "#2563EB", // same blue
//   },

//   completedText: {
//     color: "#fff",
//   },

//   /* ── FLOATING BUTTON ── */
//   floatingBtn: {
//     position: "absolute",
//     right: 20,
//     bottom: 100,
//     height: 65,
//     width: 65,
//     borderRadius: 30,

//     justifyContent: "center",
//     alignItems: "center",
//   },

//   /* ── AI ANALYSIS MODAL ── */
//   aiAnalysisModal: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     top: 100,
//     backgroundColor: "#fff",
//     flexDirection: "column",
//     zIndex: 1000,
//     elevation: 50,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },

//   aiAnalysisHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
//     backgroundColor: "#E7F3FFBF",
//   },

//   aiAnalysisTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#2563EB",
//   },

//   aiAnalysisContent: {
//     flex: 1,
//     padding: 16,
//   },

//   analysisSection: {
//     marginBottom: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },

//   analysisSubtitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 8,
//   },

//   analysisItem: {
//     fontSize: 13,
//     color: "#555",
//     marginBottom: 6,
//     lineHeight: 18,
//   },

//   statusText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#333",
//   },
//   resultWrapper: {
//     backgroundColor: "#F9FAFB",
//     borderRadius: 10,
//     maxHeight: 320,
//     overflow: "hidden",
//     position: "relative",
//   },

//   aiAssistantBox: {
//     // marginTop:"38%",
//     // position: "absolute",
//     // bottom: -18, // 🔥 overlaps like your UI
//     alignSelf: "center",
//     backgroundColor: "#F1F5F9",
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",

//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 3,
//   },

//   aiAssistantText: {
//     fontSize: 13,
//     color: "#6366F1",
//     fontWeight: "500",
//   },
//   docCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },

//   fileIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//   },

//   docTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//   },

//   docMeta: {
//     fontSize: 11,
//     color: "#6B7280",
//   },

//   prescriptionBtn: {
//     backgroundColor: "#E0EDFF",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },

//   prescriptionText: {
//     fontSize: 11,
//     color: "#2563EB",
//     fontWeight: "600",
//   },
// });

// export default PostOpCare;

import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
  Image,
  Animated,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "../../env-vars";
import { extractStructuredData } from "../../utils/MedilockerService";

const PostOpCare = ({ navigation }) => {
  const [claimFiles, setClaimFiles] = useState([]);
  const { width, height } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useState(new Animated.Value(0))[0];
  const cardWidth = width * 0.95;
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [claimDocs, setClaimDocs] = useState([]);
  const [policyDocs, setPolicyDocs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);
  const aiAnalysisSideAnim = useState(new Animated.Value(height))[0];

  // ─────────────────────────────────────────────
  // Mobile analysis
  // ─────────────────────────────────────────────
  const analyzeMobileInsurance = async () => {
    if (claimDocs.length === 0) return;
    try {
      setIsGenerating(true);
      const file = claimDocs[0];
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");
      const fileResponse = await fetch(file.uri);
      if (!fileResponse.ok)
        throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
      const fileBlob = await fileResponse.blob();
      const formData = new FormData();
      formData.append("file", fileBlob, file.name);
      const response = await fetch(
        `${API_URL}/medilocker/users/${userId}/insurance/analyze`,
        {
          method: "POST",
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          body: formData,
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setAnalysisData(data);
      setCurrentStep(1);
    } catch (error) {
      console.error("[analyzeMobileInsurance] Error:", error);
      alert(
        `❌ Analysis failed: ${error.message}\n\nPlease check your internet connection and try again.`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ─────────────────────────────────────────────
  // Web: slide to Full Case Analysis section
  // ─────────────────────────────────────────────
  const goToReview = () => {
    setCurrentStep(1);
    Animated.timing(slideAnim, {
      toValue: -cardWidth,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const goBackToUpload = () => {
    setCurrentStep(0);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const analyzeWeb = async () => {
    if (claimFiles.length === 0) return;
    try {
      setLoadingAnalysis(true);
      // Slide to full case analysis panel
      goToReview();
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // ─────────────────────────────────────────────
  // Generate Prescription (web + mobile)
  // ─────────────────────────────────────────────
  const handleGeneratePrescription = async () => {
    const filesToProcess = claimDocs.length > 0 ? claimDocs : claimFiles;
    if (filesToProcess.length === 0) {
      alert("❌ Please upload documents first");
      return;
    }
    await extractFromFiles(filesToProcess);
  };

  const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      try {
        if (file.uri) {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                resolve(reader.result.split(",")[1]);
              } catch (e) {
                reject(new Error(`Failed to parse base64: ${e.message}`));
              }
            };
            reader.onerror = () =>
              reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsDataURL(xhr.response);
          };
          xhr.onerror = () =>
            reject(new Error(`Failed to fetch file: ${file.name}`));
          xhr.open("GET", file.uri);
          xhr.responseType = "blob";
          xhr.send();
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              resolve(reader.result.split(",")[1]);
            } catch (e) {
              reject(new Error(`Failed to parse base64: ${e.message}`));
            }
          };
          reader.onerror = () =>
            reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsDataURL(file);
        }
      } catch (error) {
        reject(new Error(`Failed to process file: ${error.message}`));
      }
    });
  };

  const extractFromFiles = async (files) => {
    if (files.length === 0) return;
    setLoadingAnalysis(true);
    setIsGenerating(true);
    try {
      const filesWithBase64 = await Promise.all(
        files.map(async (file) => {
          const base64Content = await fileToBase64(file);
          return { filename: file.name, content: base64Content };
        }),
      );
      const result = await extractStructuredData(filesWithBase64);
      const prescriptionText =
        result?.prescription || result?.data?.prescription || "";
      const patientDetails = result?.patient_details || {};
      const prescription = {
        clinicName: "Kokoro.Doctor",
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        patientName: patientDetails?.name || "",
        age:
          patientDetails?.age !== null && patientDetails?.age !== undefined
            ? String(patientDetails.age)
            : "",
        gender: patientDetails?.gender || "",
        diagnosis: patientDetails?.diagnosis || "",
        diagnosisDate: "",
        prescriptionReport: prescriptionText,
      };
      setGeneratedPrescription(prescription);
      navigation.navigate("PostOpCarePrescription", {
        generatedPrescription: prescription,
      });
    } catch (error) {
      console.error("[extractFromFiles] Error:", error);
      alert(
        error.userFriendlyMessage ||
          error.message ||
          "Failed to extract prescription data. Please try again.",
      );
    } finally {
      setLoadingAnalysis(false);
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (claimDocs.length === 0 || isGenerating) return;
    await analyzeMobileInsurance();
  };

  const openAiAnalysisModal = () => {
    setAiAnalysisModalOpen(true);
    Animated.timing(aiAnalysisSideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeAiAnalysisModal = () => {
    Animated.timing(aiAnalysisSideAnim, {
      toValue: height,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setAiAnalysisModalOpen(false));
  };

  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });
      if (result.canceled) return;
      const files = result.assets;
      if (type === "claim") setClaimDocs((prev) => [...prev, ...files]);
      else setPolicyDocs((prev) => [...prev, ...files]);
    } catch (error) {
      console.log(error);
    }
  };

  const removeFile = (type, index) => {
    if (type === "claim")
      setClaimDocs((prev) => prev.filter((_, i) => i !== index));
    else setPolicyDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const isUploadComplete = claimFiles.length > 0;

  const handleFileUpload = () => {
    if (Platform.OS !== "web") return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      setClaimFiles((prev) => [...prev, ...files]);
    };
    input.click();
  };

  const handleDeleteFile = (index) => {
    setClaimFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatFileDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          WEB LAYOUT  (width > 1000)
      ═══════════════════════════════════════════════════ */}
      {Platform.OS === "web" && (width > 1000 || width === 0) && (
        <View style={styles.container}>
          <ImageBackground
            source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
            <View style={styles.main}>
              {/* LEFT SIDEBAR */}
              <View style={styles.left}>
                <HospitalSidebarNavigation navigation={navigation} />
              </View>

              {/* RIGHT CONTENT */}
              <View style={styles.right}>
                <View style={styles.header}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View>

                {/* MAIN CARD */}
                <View style={styles.card}>
                  {/* TITLE ROW */}
                  <View style={styles.titleTopSection}>
                    <Text style={styles.title}>Post OP Care</Text>
                    <TouchableOpacity
                      style={styles.patientButton}
                      onPress={currentStep === 1 ? goBackToUpload : undefined}
                    >
                      <Text style={styles.btnText}>
                        {currentStep === 1 ? "← Back" : "Select Patient"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* STEP BAR */}
                  <View style={styles.stepBar}>
                    {[
                      {
                        title: "Upload Documents",
                        subtitle: "At least one document required",
                      },
                      {
                        title: "Full Case Analysis",
                        subtitle: "AI reviews all reports",
                      },
                      {
                        title: "Generate Prescription",
                        subtitle: "Editable & ready",
                      },
                    ].map((item, index, arr) => (
                      <React.Fragment key={index}>
                        <View style={styles.stepItem}>
                          <View
                            style={[
                              styles.stepCircle,
                              index === currentStep && styles.stepCircleActive,
                              (index === 0 && isUploadComplete) ||
                              (index === 1 && currentStep >= 1)
                                ? styles.stepCircleComplete
                                : null,
                            ]}
                          >
                            <Text style={styles.stepNumber}>
                              {(index === 0 && isUploadComplete) ||
                              (index === 1 && currentStep >= 1)
                                ? "✓"
                                : index + 1}
                            </Text>
                          </View>
                          <View style={styles.stepTextContainer}>
                            <Text style={styles.stepTitle}>{item.title}</Text>
                            <Text style={styles.stepSubtitle}>
                              {item.subtitle}
                            </Text>
                          </View>
                        </View>
                        {index < arr.length - 1 && (
                          <View style={styles.stepConnector} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>

                  {/* ── SLIDING PANELS ── */}
                  <View style={styles.slidingWrapper}>
                    <Animated.View
                      style={[
                        styles.slidingTrack,
                        {
                          width: cardWidth * 2,
                          transform: [{ translateX: slideAnim }],
                        },
                      ]}
                    >
                      {/* ── PANEL 1: UPLOAD ── */}
                      <View style={{ width: cardWidth }}>
                        <ScrollView
                          style={{ flex: 1 }}
                          contentContainerStyle={{ paddingBottom: 20 }}
                          showsVerticalScrollIndicator={true}
                        >
                          <View style={{ alignItems: "center", width: "100%" }}>
                            <View style={styles.middleTextBox}>
                              <Image
                                source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                                style={styles.middleImage}
                              />
                              <Text style={styles.middleTextBold}>
                                AI-Powered Full Case Review
                              </Text>
                              <Text style={styles.middleTextSub}>
                                Looking across all reports to build a complete
                                patient story
                              </Text>
                            </View>

                            <View style={styles.uploadDocumentsDetailBox}>
                              <Text style={styles.bulletText}>
                                • Documents are mandatory
                              </Text>
                              <Text style={styles.bulletText}>
                                • Analysis cannot begin without at least one
                                document
                              </Text>
                              <Text style={styles.bulletText}>
                                • Kokoro AI analyzes your reports directly
                              </Text>
                            </View>

                            <View style={styles.uploadRow}>
                              <View style={styles.uploadContainer}>
                                <Text style={styles.label}>
                                  Patient Documents / Reports
                                </Text>
                                <TouchableOpacity
                                  style={styles.uploadBox}
                                  onPress={handleFileUpload}
                                >
                                  <Text style={styles.uploadIcon}>☁️</Text>
                                  <Text style={styles.uploadText}>
                                    Upload Document — Click here
                                  </Text>
                                </TouchableOpacity>

                                {claimFiles.length > 0 && (
                                  <ScrollView style={styles.fileList}>
                                    {claimFiles.map((file, i) => (
                                      <View key={i} style={styles.fileRow}>
                                        <Text style={styles.fileItem}>
                                          📄 {file.name}
                                        </Text>
                                        <TouchableOpacity
                                          onPress={() => handleDeleteFile(i)}
                                          style={styles.deleteBtn}
                                        >
                                          <Text style={styles.deleteText}>
                                            ✕
                                          </Text>
                                        </TouchableOpacity>
                                      </View>
                                    ))}
                                  </ScrollView>
                                )}
                              </View>
                            </View>

                            <TouchableOpacity
                              style={[
                                styles.button,
                                (!isUploadComplete || loadingAnalysis) &&
                                  styles.buttonDisabled,
                              ]}
                              disabled={!isUploadComplete || loadingAnalysis}
                              onPress={analyzeWeb}
                            >
                              {loadingAnalysis ? (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <ActivityIndicator
                                    color="#fff"
                                    size="small"
                                  />
                                  <Text style={styles.buttonText}>
                                    Analyzing...
                                  </Text>
                                </View>
                              ) : (
                                <Text style={styles.buttonText}>
                                  Analyze with Kokoro AI →
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </ScrollView>
                      </View>

                      {/* ── PANEL 2: FULL CASE ANALYSIS ── */}
                      <View
                        style={{
                          width: cardWidth,
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        {/* TOP BLUE GRADIENT HEADER */}
                        <View style={styles.analysisTopBar}>
                          <View style={styles.analysisTopBarLeft}>
                            <View style={styles.unlockBadge}>
                              <Text style={styles.unlockBadgeText}>
                                ✦ Unlock Intelligence
                              </Text>
                            </View>
                            <View style={styles.analysisTitleRow}>
                              <Text style={styles.analysisTopTitle}>
                                Full Case Analysis
                              </Text>
                              <View style={styles.docCountBadge}>
                                <Text style={styles.docCountText}>
                                  {claimFiles.length} Document
                                  {claimFiles.length !== 1 ? "s" : ""}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.generatePrescriptionBtn,
                              isGenerating &&
                                styles.generatePrescriptionBtnDisabled,
                            ]}
                            onPress={handleGeneratePrescription}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <ActivityIndicator
                                  color="#2563EB"
                                  size="small"
                                />
                                <Text
                                  style={styles.generatePrescriptionBtnText}
                                >
                                  Generating...
                                </Text>
                              </View>
                            ) : (
                              <>
                                <Text
                                  style={styles.generatePrescriptionBtnIcon}
                                >
                                  ✦
                                </Text>
                                <Text
                                  style={styles.generatePrescriptionBtnText}
                                >
                                  Generate Prescription
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* TWO-COLUMN BODY */}
                        <View style={styles.analysisBody}>
                          {/* LEFT: Uploaded Files */}
                          <View style={styles.filesPanel}>
                            <View style={styles.newReportsBadge}>
                              <Text style={styles.newReportsBadgeHeart}>
                                🤍
                              </Text>
                              <Text style={styles.newReportsBadgeText}>
                                {claimFiles.length} New Report
                                {claimFiles.length !== 1 ? "s" : ""} added since
                                last review
                              </Text>
                            </View>

                            <ScrollView
                              showsVerticalScrollIndicator={false}
                              style={{ flex: 1 }}
                            >
                              {claimFiles.map((file, i) => (
                                <View key={i} style={styles.fileCard}>
                                  <View style={styles.fileCardLeft}>
                                    <View style={styles.fileIconBox}>
                                      <Text style={styles.fileIconText}>
                                        📄
                                      </Text>
                                    </View>
                                    <View style={styles.fileCardInfo}>
                                      <Text
                                        style={styles.fileCardName}
                                        numberOfLines={1}
                                      >
                                        {file.name.length > 24
                                          ? file.name.substring(0, 24) + "..."
                                          : file.name}
                                      </Text>
                                      <Text style={styles.fileCardMeta}>
                                        SIZE : {formatFileSize(file.size)}
                                        {"    "}Format :{" "}
                                        {file.name
                                          .split(".")
                                          .pop()
                                          ?.toUpperCase() || "PDF"}
                                      </Text>
                                      <Text style={styles.fileCardMeta}>
                                        Date : {formatFileDate()}
                                        {"    "}Time : 10:00 AM
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.fileCardRight}>
                                    <TouchableOpacity
                                      style={styles.myPrescriptionBtn}
                                    >
                                      <Text
                                        style={styles.myPrescriptionBtnText}
                                      >
                                        My Prescription
                                      </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      style={styles.fileMenuBtn}
                                    >
                                      <Text style={styles.fileMenuDots}>
                                        •••
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ))}
                            </ScrollView>
                          </View>

                          {/* RIGHT: Kokoro AI — Coming Soon */}
                          <View style={styles.aiPanel}>
                            <View style={styles.aiPanelHeader}>
                              <Text style={styles.aiPanelHeaderIcon}>✦</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.aiPanelTitle}>
                                  Kokoro AI Analysis
                                </Text>
                                <Text style={styles.aiPanelSubtitle}>
                                  You&apos;re not alone in this case, we&apos;re here to
                                  assist.
                                </Text>
                              </View>
                            </View>

                            <View style={styles.aiPanelBody}>
                              <View style={styles.comingSoonContainer}>
                                <View style={styles.comingSoonIconCircle}>
                                  <Text style={styles.comingSoonIcon}>✦</Text>
                                </View>
                                <Text style={styles.comingSoonTitle}>
                                  Coming Soon
                                </Text>
                                <Text style={styles.comingSoonSubtitle}>
                                  Kokoro AI will analyze all uploaded reports
                                  and provide a comprehensive full case
                                  analysis, timeline of events, key lab changes,
                                  and clinical insights.
                                </Text>
                                <View style={styles.comingSoonFeatures}>
                                  {[
                                    "Full case analysis",
                                    "Timeline of events",
                                    "Key lab changes",
                                    "Patient summary",
                                    "Clinical insights",
                                  ].map((feat, i) => (
                                    <View
                                      key={i}
                                      style={styles.comingSoonFeatureRow}
                                    >
                                      <Text style={styles.comingSoonFeatureDot}>
                                        ●
                                      </Text>
                                      <Text
                                        style={styles.comingSoonFeatureText}
                                      >
                                        {feat}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════
          MOBILE LAYOUT  — UNTOUCHED
      ═══════════════════════════════════════════════════ */}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ScrollView
            contentContainerStyle={stylesMobile.container}
            showsVerticalScrollIndicator={false}
          >
            <StatusBar barStyle="light-content" backgroundColor="#fff" />
            <View style={stylesMobile.header}>
              <HeaderLoginSignUp navigation={navigation} />
            </View>
            <Text style={stylesMobile.title}>Post OP Care</Text>

            <TouchableOpacity style={stylesMobile.selectBtn}>
              <Text style={stylesMobile.selectText}>Select Patient</Text>
            </TouchableOpacity>

            <View style={stylesMobile.stepContainer}>
              <View style={stylesMobile.line} />
              {[1, 2, 3].map((item, index) => {
                const active = index === currentStep;
                const completed = index < currentStep;
                return (
                  <View key={index} style={stylesMobile.stepWrapper}>
                    <View
                      style={[
                        stylesMobile.circle,
                        active && stylesMobile.activeCircle,
                        completed && stylesMobile.completedCircle,
                      ]}
                    >
                      <Text
                        style={[
                          stylesMobile.circleText,
                          active && stylesMobile.activeCircleText,
                          completed && stylesMobile.completedText,
                        ]}
                      >
                        {completed ? "✓" : item}
                      </Text>
                    </View>
                    <Text style={stylesMobile.stepText}>
                      {item === 1 && "Upload\nDocuments"}
                      {item === 2 && "Full case\nanalysis"}
                      {item === 3 && "Generate\nPrescription"}
                    </Text>
                  </View>
                );
              })}
            </View>

            {currentStep === 0 ? (
              <View style={stylesMobile.card}>
                <Image
                  source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                  style={{ width: "100%", marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text style={stylesMobile.cardTitle}>
                  AI-Powered Full Case {"\n"}Review
                </Text>
                <Text style={stylesMobile.subText}>
                  Looking across all reports to build a {"\n"}complete patient
                  story
                </Text>
                <View style={stylesMobile.bulletWrapper}>
                  <Text style={stylesMobile.bullet}>
                    • Documents are mandatory
                  </Text>
                  <Text style={stylesMobile.bullet}>
                    • Analysis cannot begin without at least one document
                  </Text>
                  <Text style={stylesMobile.bullet}>
                    • Kokoro AI analyzes your Reports directly
                  </Text>
                </View>
                <Text style={stylesMobile.label}>
                  Patient Documents / Reports
                </Text>
                <TouchableOpacity
                  style={stylesMobile.uploadBox}
                  onPress={() => pickDocument("claim")}
                >
                  <Feather name="upload" size={20} color="#2563EB" />
                  <Text style={stylesMobile.uploadText}>
                    Upload Photo{" "}
                    <Text style={stylesMobile.link}>Click here</Text>
                  </Text>
                </TouchableOpacity>
                {claimDocs.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={stylesMobile.fileScroll}
                    style={{ marginTop: -10, marginBottom: 10 }}
                  >
                    {claimDocs.map((doc, index) => (
                      <View key={index} style={stylesMobile.fileChip}>
                        <Feather
                          name="check-circle"
                          size={14}
                          color="#16A34A"
                        />
                        <Text style={stylesMobile.fileText} numberOfLines={1}>
                          {doc.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeFile("claim", index)}
                        >
                          <Feather name="x" size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
                <TouchableOpacity
                  style={[
                    stylesMobile.button,
                    (isGenerating || claimDocs.length === 0) && {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={handleGenerate}
                  disabled={isGenerating || claimDocs.length === 0}
                >
                  {isGenerating ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={stylesMobile.buttonText}>Analyzing...</Text>
                    </View>
                  ) : (
                    <Text style={stylesMobile.buttonText}>
                      Full case analysis
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={stylesMobile.resultCard}>
                <Text
                  style={{
                    color: "#6B7280",
                    marginBottom: 10,
                    paddingLeft: "2%",
                  }}
                >
                  {claimDocs.length} Documents
                </Text>
                <View
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 10,
                    padding: 10,
                    height: 320,
                  }}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 10 }}
                  >
                    {claimDocs.map((doc, index) => (
                      <View key={index} style={stylesMobile.docCard}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Image
                            source={require("../../assets/HospitalPortal/Icon/prescriptionfile.png")}
                            style={stylesMobile.fileIcon}
                            resizeMode="contain"
                          />
                          <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={stylesMobile.docTitle}>
                              Prescription {index + 1}
                            </Text>
                            <Text style={stylesMobile.docMeta}>
                              SIZE: {Math.round(doc.size / 1024)} KB | Format:
                              PDF
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={stylesMobile.prescriptionBtn}
                          >
                            <Text style={stylesMobile.prescriptionText}>
                              My Prescription
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <View style={stylesMobile.aiAssistantBox}>
                  <Text style={stylesMobile.aiAssistantText}>
                    Clinical AI Assistant
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    stylesMobile.acceptBtn,
                    isGenerating && { opacity: 0.6 },
                  ]}
                  onPress={handleGeneratePrescription}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={stylesMobile.acceptText}>
                        Generating Prescription...
                      </Text>
                    </View>
                  ) : (
                    <Text style={stylesMobile.acceptText}>
                      Generate Prescription
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {currentStep === 1 && analysisData && (
            <TouchableOpacity
              style={stylesMobile.floatingBtn}
              onPress={openAiAnalysisModal}
            >
              <Image
                source={require("../../assets/HospitalPortal/Icon/blue_heart.png")}
                style={{ width: 65, height: 65, resizeMode: "cover" }}
              />
            </TouchableOpacity>
          )}
        </SafeAreaView>
      )}

      {aiAnalysisModalOpen && (
        <Animated.View
          style={[
            stylesMobile.aiAnalysisModal,
            { transform: [{ translateY: aiAnalysisSideAnim }] },
          ]}
        >
          <View style={stylesMobile.aiAnalysisHeader}>
            <View style={{ flexDirection: "column" }}>
              <Text style={stylesMobile.aiAnalysisTitle}>
                Kokoro AI Analysis
              </Text>
              <Text
                style={{ color: "#999999", fontSize: 14, fontWeight: "400" }}
              >
                You&apos;re not alone in this case, we&apos;re here to assist.
              </Text>
            </View>
            <TouchableOpacity onPress={closeAiAnalysisModal}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={stylesMobile.aiAnalysisContent}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {analysisData?.analysis ? (
              <>
                <View style={stylesMobile.analysisSection}>
                  <Text style={stylesMobile.statusText}>
                    Status:{" "}
                    {analysisData?.analysis?.is_complete
                      ? "✅ Complete"
                      : "❌ Incomplete"}
                  </Text>
                </View>
                <View style={stylesMobile.analysisSection}>
                  <Text style={stylesMobile.analysisSubtitle}>
                    Missing Fields:
                  </Text>
                  {analysisData?.analysis?.missing_fields?.length > 0 ? (
                    analysisData?.analysis?.missing_fields.map((item, i) => (
                      <Text key={i} style={stylesMobile.analysisItem}>
                        • {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={stylesMobile.analysisItem}>None</Text>
                  )}
                </View>
                <View style={stylesMobile.analysisSection}>
                  <Text style={stylesMobile.analysisSubtitle}>Issues:</Text>
                  {analysisData?.analysis?.issues?.length > 0 ? (
                    analysisData?.analysis?.issues.map((item, i) => (
                      <Text key={i} style={stylesMobile.analysisItem}>
                        ⚠️ {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={stylesMobile.analysisItem}>No issues</Text>
                  )}
                </View>
                <View style={stylesMobile.analysisSection}>
                  <Text style={stylesMobile.analysisSubtitle}>
                    Suggestions:
                  </Text>
                  {analysisData?.analysis?.suggestions?.length > 0 ? (
                    analysisData?.analysis?.suggestions.map((item, i) => (
                      <Text key={i} style={stylesMobile.analysisItem}>
                        💡 {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={stylesMobile.analysisItem}>
                      No suggestions
                    </Text>
                  )}
                </View>
                <View style={stylesMobile.analysisSection}>
                  <Text style={stylesMobile.analysisSubtitle}>
                    Claim Opportunity:
                  </Text>
                  <Text style={stylesMobile.analysisItem}>
                    {analysisData?.analysis?.claim_opportunity || "N/A"}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={stylesMobile.analysisItem}>
                Analysis data not available
              </Text>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════
// WEB STYLES
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
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
  main: {
    flexDirection: "row",
    height: "100%",
    zIndex: 2,
  },
  left: {
    width: "15%",
  },
  right: {
    width: "85%",
    padding: 20,
    zIndex: 3,
    height: "100%",
    overflow: "auto",
  },
  header: { marginBottom: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,
    height: "85vh",
    overflow: "hidden",
    // flex column so sliding wrapper takes remaining height
    display: "flex",
    flexDirection: "column",
  },

  /* ── TITLE ROW ── */
  titleTopSection: {
    height: 52,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    flexShrink: 0,
  },
  title: {
    fontSize: 19,
    fontWeight: "600",
  },
  patientButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555555",
  },

  /* ── STEP BAR ── */
  stepBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    justifyContent: "space-around",
    flexShrink: 0,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1D6CE0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    borderWidth: 2,
    borderColor: "#000",
  },
  stepCircleComplete: {
    backgroundColor: "#16a34a",
  },
  stepNumber: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepTextContainer: {
    flexDirection: "column",
  },
  stepTitle: {
    color: "#1D6CE0",
    fontSize: 12,
    fontWeight: "700",
  },
  stepSubtitle: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 1,
  },
  stepConnector: {
    height: 2,
    width: 24,
    backgroundColor: "#1D6CE0",
    marginHorizontal: 4,
    alignSelf: "center",
  },

  /* ── SLIDING WRAPPER ── */
  slidingWrapper: {
    flex: 1,
    overflow: "hidden",
    width: "100%",
  },
  slidingTrack: {
    flexDirection: "row",
    height: "100%",
  },

  /* ── UPLOAD PANEL content ── */
  middleTextBox: {
    marginTop: "1.5%",
    marginBottom: 10,
    width: "50%",
    marginRight: "13%",
  },
  middleImage: {
    height: 26,
    width: 26,
    marginBottom: 8,
    alignSelf: "center",
  },
  middleTextBold: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  middleTextSub: {
    fontSize: 14,
    color: "#656464",
    textAlign: "center",
  },
  uploadDocumentsDetailBox: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: "2%",
    width: "50%",
    marginRight: "13%",
  },
  bulletText: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 6,
    lineHeight: 18,
    fontWeight: "500",
  },
  uploadRow: {
    alignItems: "center",
    width: "50%",
    marginRight: "13%",
    marginTop: "2%",
  },
  uploadContainer: {
    width: "60%",
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#1440d3",
    fontSize: 16,
  },
  uploadBox: {
    height: 120,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f0f6ff",
  },
  uploadIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  uploadText: {
    color: "#3b82f6",
    fontSize: 13,
  },
  fileList: {
    marginTop: 8,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 6,
  },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fileItem: {
    fontSize: 12,
    flex: 1,
  },
  deleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    marginTop: "3%",
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginRight: "13%",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  /* ── ANALYSIS TOP BAR (blue gradient) ── */
  analysisTopBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    // Web gradient — applied via style prop override below
    backgroundColor: "#0F52BA",
    borderRadius: 0,
    flexShrink: 0,
    ...(Platform.OS === "web"
      ? {
          background:
            "linear-gradient(90deg, #062D82 0%, #1254B7 40%, #1A82D4 75%, #38BDF8 100%)",
        }
      : {}),
  },
  analysisTopBarLeft: {
    flexDirection: "column",
    gap: 6,
    //borderWidth:1,
  },
  unlockBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  unlockBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "500",
  },
  analysisTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  analysisTopTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  docCountBadge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  docCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  generatePrescriptionBtn: {
    flexDirection: "row",
    gap: 7,
    backgroundColor: "#fbfbfbff",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: "22%",
  },
  generatePrescriptionBtnDisabled: {
    opacity: 0.7,
  },
  generatePrescriptionBtnIcon: {
    color: "#2563EB",
    fontSize: 14,
  },
  generatePrescriptionBtnText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },

  /* ── ANALYSIS BODY (two-col) ── */
  analysisBody: {
    flexDirection: "row",
    flex: 1,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  /* ── FILES PANEL (left 40%) ── */
  filesPanel: {
    width: "33%",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    padding: 14,
    flexDirection: "column",
  },
  newReportsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  newReportsBadgeHeart: {
    fontSize: 14,
  },
  newReportsBadgeText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "500",
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },
  fileCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  fileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  fileIconText: {
    fontSize: 16,
  },
  fileCardInfo: {
    flex: 1,
  },
  fileCardName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  fileCardMeta: {
    fontSize: 10,
    color: "#9CA3AF",
    lineHeight: 14,
  },
  fileCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  myPrescriptionBtn: {
    backgroundColor: "#EEF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  myPrescriptionBtnText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "600",
  },
  fileMenuBtn: {
    padding: 4,
  },
  fileMenuDots: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },

  /* ── AI PANEL (right 60%) ── */
  aiPanel: {
    width: "67%",
    flexDirection: "column",
  },
  aiPanelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FAFEFF",
    flexShrink: 0,
  },
  aiPanelHeaderIcon: {
    color: "#0EA5E9",
    fontSize: 16,
    marginTop: 2,
  },
  aiPanelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  aiPanelSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  aiPanelBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f4f4f4ff",
    //borderWidth:1,
    width:"67%"
  },
  comingSoonContainer: {
    alignItems: "center",
    maxWidth: 360,
    //borderWidth:1,
  },
  comingSoonIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  comingSoonIcon: {
    fontSize: 26,
    color: "#2563EB",
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  comingSoonSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  comingSoonFeatures: {
    width: "100%",
    gap: 8,
  },
  comingSoonFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comingSoonFeatureDot: {
    color: "#2563EB",
    fontSize: 8,
  },
  comingSoonFeatureText: {
    fontSize: 13,
    color: "#374151",
  },
});

// ═══════════════════════════════════════════════════
// MOBILE STYLES — UNTOUCHED
// ═══════════════════════════════════════════════════
const stylesMobile = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    paddingLeft: "2%",
  },
  selectBtn: {
    marginLeft: "2%",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  selectText: {
    fontSize: 14,
    color: "#333",
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    position: "relative",
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  circleText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
  },
  stepText: {
    fontSize: 10,
    textAlign: "center",
    color: "#3B82F6",
  },
  card: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 12,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 10,
  },
  bulletWrapper: {
    marginBottom: 16,
  },
  bullet: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#2563EB",
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 6,
  },
  uploadText: {
    fontSize: 13,
    color: "#6B7280",
  },
  link: {
    color: "#2563EB",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#6B9CFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  line: {
    position: "absolute",
    top: 13,
    left: "16.5%",
    right: "16.5%",
    height: 2,
    backgroundColor: "#1680ECBF",
  },
  activeCircle: {
    backgroundColor: "#2563EB",
  },
  activeCircleText: {
    color: "#fff",
  },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 200,
    gap: 6,
  },
  fileText: {
    fontSize: 11,
    color: "#374151",
  },
  fileScroll: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingLeft: "1%",
    paddingRight: "1%",
  },
  text: {
    fontSize: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: "10%",
    alignItems: "center",
    marginBottom: "2%",
  },
  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
  completedCircle: {
    backgroundColor: "#2563EB",
  },
  completedText: {
    color: "#fff",
  },
  floatingBtn: {
    position: "absolute",
    right: 20,
    bottom: 100,
    height: 65,
    width: 65,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  aiAnalysisModal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 100,
    backgroundColor: "#fff",
    flexDirection: "column",
    zIndex: 1000,
    elevation: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  aiAnalysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#E7F3FFBF",
  },
  aiAnalysisTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },
  aiAnalysisContent: {
    flex: 1,
    padding: 16,
  },
  analysisSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  analysisSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  analysisItem: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
    lineHeight: 18,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  aiAssistantBox: {
    alignSelf: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 10,
  },
  aiAssistantText: {
    fontSize: 13,
    color: "#6366F1",
    fontWeight: "500",
  },
  docCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  docMeta: {
    fontSize: 11,
    color: "#6B7280",
  },
  prescriptionBtn: {
    backgroundColor: "#E0EDFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  prescriptionText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
});

export default PostOpCare;
