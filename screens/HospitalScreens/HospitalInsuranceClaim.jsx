// import React, { useState, useMemo } from "react";
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
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
// import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
// import { Feather } from "@expo/vector-icons";
// import * as DocumentPicker from "expo-document-picker";
// import { API_URL } from "../../env-vars";
// import FormattedMessageText from "../../components/PatientScreenComponents/ChatbotComponents/FormattedMessageText"; // adjust path

// const HospitalInsuranceClaim = ({ navigation }) => {
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
//   const aiAnalysisSideAnim = useState(new Animated.Value(height))[0];
//   const [backendPrompt, setBackendPrompt] = useState("");
  
//   const analyzeMobileInsurance = async () => {
//     if (claimDocs.length === 0 && claimFiles.length === 0) return;
//     try {
//       setIsGenerating(true);

//       const formData = new FormData();

//       if (Platform.OS === "web") {
//         // ✅ WEB (react-native-web on browser): use real File object from claimFiles
//         // claimFiles are set via handleFileUpload (input element) — real browser File objects
//         // BUT on mobile-width web, user uses pickDocument which sets claimDocs (expo assets)
//         // So we need to fetch the blob from the uri and convert it
//         const doc = claimDocs[0];

//         // Fetch the file as blob from the local uri (works on web)
//         const response = await fetch(doc.uri);
//         const blob = await response.blob();
//         const file = new File([blob], doc.name || "insurance_claim.pdf", {
//           type: doc.mimeType || blob.type || "application/octet-stream",
//         });
//         formData.append("file", file);
//       } else {
//         // ✅ NATIVE (iOS/Android): use { uri, name, type } object
//         const doc = claimDocs[0];
//         formData.append("file", {
//           uri: doc.uri,
//           name: doc.name || "insurance_claim.pdf",
//           type: doc.mimeType || "application/octet-stream",
//         });
//       }

//       console.log("📤 Uploading doc:", claimDocs[0]?.name);

//       const res = await fetch(`${API_URL}/medilocker/insurance/analyze`, {
//         method: "POST",
//         body: formData,
//         // ✅ No Content-Type header — let fetch set boundary automatically
//       });

//       const data = await res.json();
//       console.log("✅ API RESPONSE:", data);

//       if (data?.detail) {
//         console.error("❌ Backend error:", data.detail);
//         return;
//       }

//       setAnalysisData(data);
//       setBackendPrompt({
//         bot_message: data?.analysis?.bot_message,
//         full: data?.analysis,
//       });
//       setCurrentStep(1);
//     } catch (error) {
//       console.error("❌ Analysis error:", error);
//     } finally {
//       setIsGenerating(false);
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
//   const isUploadComplete =
//     Platform.OS === "web" ? claimFiles.length > 0 : claimDocs.length > 0;

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
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await fetch(`${API_URL}/medilocker/insurance/analyze`, {
//         method: "POST",
//         body: formData,
//       });
//       const data = await response.json();
//       console.log("✅ API RESPONSE:", data);

//       // ✅ FIX: store full response so structured_data is accessible at top level
//       setAnalysisData(data);

//       setBackendPrompt({
//         bot_message: data?.analysis?.bot_message,
//         full: data?.analysis, // ✅ FIX: only analysis goes to AI text formatter
//       });

//       goToReview();
//     } catch (error) {
//       console.error("❌ Analysis error:", error);
//     } finally {
//       setLoadingAnalysis(false);
//     }
//   };

//   const formatBackendPromptToMarkdown = (data) => {
//     if (!data) return "";

//     let parsed;
//     try {
//       parsed = typeof data === "string" ? JSON.parse(data) : data;
//     } catch (e) {
//       return data.replace(/\n/g, "\n\n").replace(/•/g, "\n• ");
//     }

//     let md = "";

//     // ✅ bot_message — it's an OBJECT with numbered keys like {"1. Your Claim Opportunity": "...", "2. Errors to Fix": [...]}
//     if (parsed.bot_message && typeof parsed.bot_message === "object") {
//       md += `## AI Summary\n\n`;
//       Object.entries(parsed.bot_message).forEach(([key, value]) => {
//         md += `### ${key}\n\n`;
//         if (Array.isArray(value)) {
//           value.forEach((item) => {
//             md += `• ${item}\n`;
//           });
//         } else {
//           md += `${value}\n`;
//         }
//         md += "\n";
//       });
//     } else if (typeof parsed.bot_message === "string") {
//       // fallback if it's a plain string
//       md += `## 🤖 AI Summary\n\n${parsed.bot_message}\n\n`;
//     }

//     // ✅ Issues
//     if (parsed.issues?.length) {
//       md += `## ⚠️ Issues Found\n\n`;
//       parsed.issues.forEach((item) => {
//         md += `• ${item}\n`;
//       });
//       md += "\n";
//     }

//     // ✅ Missing Fields
//     if (parsed.missing_fields?.length) {
//       md += `## ❗ Missing Information\n\n`;
//       parsed.missing_fields.forEach((item) => {
//         md += `• ${item}\n`;
//       });
//       md += "\n";
//     }

//     // ✅ Policy Insights — was missing entirely before
//     if (parsed.policy_insights?.length) {
//       md += `## 📋 Policy Insights\n\n`;
//       parsed.policy_insights.forEach((item) => {
//         md += `• ${item}\n`;
//       });
//       md += "\n";
//     }

//     // ✅ Suggestions
//     if (parsed.suggestions?.length) {
//       md += `## 💡 Suggestions\n\n`;
//       parsed.suggestions.forEach((item) => {
//         md += `• ${item}\n`;
//       });
//       md += "\n";
//     }

//     // ✅ Financial Summary
//     if (parsed.financial_summary) {
//       md += `## 💰 Financial Summary\n\n`;
//       Object.entries(parsed.financial_summary).forEach(([k, v]) => {
//         md += `• **${k.replace(/_/g, " ")}:** ${v}\n`;
//       });
//       md += "\n";
//     }

//     return md;
//   };

//   const structured = useMemo(() => {
//     // ✅ structured_data is at TOP LEVEL of API response
//     // analysisData now holds the full response object
//     return analysisData?.structured_data ?? null;
//   }, [analysisData]);

//   return (
//     <>
//       {Platform.OS === "web" && (width > 1000 || width === 0) && (
//         <View style={styles.container}>
//           <ImageBackground
//             source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
//             style={styles.background}
//             resizeMode="cover"
//           >
//             <View style={styles.overlay} />

//             <View style={styles.main}>
//               {/* LEFT SIDEBAR */}
//               <View style={styles.left}>
//                 <HospitalSidebarNavigation navigation={navigation} />
//               </View>

//               {/* RIGHT CONTENT */}
//               <View style={styles.right}>
//                 {/* HEADER */}
//                 <View style={styles.header}>
//                   <HeaderLoginSignUp navigation={navigation} />
//                 </View>

//                 {/* MAIN CARD */}
//                 <View style={styles.card}>
//                   {/* TITLE ROW */}
//                   <View style={styles.titleTopSection}>
//                     <Text style={styles.title}>
//                       Insurance claim analysis AI
//                     </Text>
//                     <TouchableOpacity
//                       style={styles.patientButton}
//                       onPress={() => {
//                         if (currentStep === 1) {
//                           // 🔙 Go back to upload
//                           setCurrentStep(0);

//                           Animated.timing(slideAnim, {
//                             toValue: 0,
//                             duration: 500,
//                             useNativeDriver: true,
//                           }).start();
//                         } else {
//                           // 👉 Your existing select patient logic
//                           console.log("Open patient selector");
//                         }
//                       }}
//                     >
//                       <Text style={styles.btnText}>
//                         {currentStep === 1 ? "Back" : "Select Patient"}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>

//                   {/* STEP BAR — 2 steps only */}
//                   <View style={styles.stepBar}>
//                     {[
//                       {
//                         title: "Upload Documents",
//                         subtitle: "Claim document required",
//                       },
//                       {
//                         title: "Review Suggestions",
//                         subtitle: "Accept or reject changes",
//                       },
//                       {
//                         title: "Download Updated File",
//                         subtitle: "Editable & ready",
//                       },
//                     ].map((item, index, arr) => (
//                       <React.Fragment key={index}>
//                         <View style={styles.stepItem}>
//                           {/* <View
//                             style={[
//                               styles.stepCircle,
//                               index === currentStep && styles.stepCircleActive,
//                               index === 0 && isUploadComplete
//                                 ? styles.stepCircleComplete
//                                 : null,
//                             ]}
//                           >
//                             <Text style={styles.stepNumber}>
//                               {index === 0 && isUploadComplete
//                                 ? "✓"
//                                 : index + 1}
//                             </Text>
//                           </View> */}
//                           <View
//                             style={[
//                               styles.stepCircle,
//                               index === currentStep && styles.stepCircleActive,

//                               // ✅ STEP COMPLETE LOGIC
//                               (index === 0 && isUploadComplete) ||
//                               (index === 1 && currentStep >= 1)
//                                 ? styles.stepCircleComplete
//                                 : null,
//                             ]}
//                           >
//                             <Text style={styles.stepNumber}>
//                               {(index === 0 && isUploadComplete) ||
//                               (index === 1 && currentStep >= 1)
//                                 ? "✓"
//                                 : index + 1}
//                             </Text>
//                           </View>
//                           <View style={styles.stepTextContainer}>
//                             <Text style={styles.stepTitle}>{item.title}</Text>
//                             <Text style={styles.stepSubtitle}>
//                               {item.subtitle}
//                             </Text>
//                           </View>
//                         </View>
//                         {index < arr.length - 1 && (
//                           <View style={styles.stepConnector} />
//                         )}
//                       </React.Fragment>
//                     ))}
//                   </View>

//                   <ScrollView
//                     style={{ flex: 1 }}
//                     contentContainerStyle={{ flexGrow: 1 }}
//                     showsVerticalScrollIndicator={true}
//                   >
//                     <View style={{ overflow: "hidden", width: "100%" }}>
//                       <Animated.View
//                         style={{
//                           flexDirection: "row",
//                           // width: width * 2,
//                           width: cardWidth * 2,
//                           transform: [{ translateX: slideAnim }],
//                         }}
//                       >
//                         {/* ───────── STEP 1: UPLOAD SCREEN ───────── */}
//                         <View
//                           style={{
//                             width: cardWidth,
//                             alignItems: "center",
//                             //justifyContent: "flex-start", // ✅ FIX
//                             //paddingVertical: 20,
//                             minHeight: 100,
//                             borderWidth: 1,
//                           }}
//                         >
//                           {/* MIDDLE INFO BOX */}
//                           <View style={styles.middleTextBox}>
//                             <Image
//                               source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
//                               style={styles.middleImage}
//                             />
//                             <Text style={styles.middleTextBold}>
//                               Upload your insurance claim and save money
//                             </Text>
//                             <Text style={styles.middleTextSub}>
//                               kokoro.doctor AI will auto-extract all codes from
//                               this document
//                             </Text>
//                           </View>

//                           {/* BULLETS */}
//                           <View style={styles.uploadDocumentsDetailBox}>
//                             <Text style={styles.bulletText}>
//                               • Claim document is mandatory
//                             </Text>
//                             <Text style={styles.bulletText}>
//                               • Analysis cannot begin without the claim document
//                             </Text>
//                             <Text style={styles.bulletText}>
//                               • Kokoro AI analyzes your claim directly
//                             </Text>
//                           </View>

//                           {/* UPLOAD */}
//                           <View style={styles.uploadRow}>
//                             <View style={styles.uploadContainer}>
//                               <Text style={styles.label}>
//                                 Insurance Claim Document
//                               </Text>
//                               <TouchableOpacity
//                                 style={styles.uploadBox}
//                                 onPress={handleFileUpload}
//                               >
//                                 <Text style={styles.uploadIcon}>☁️</Text>
//                                 <Text style={styles.uploadText}>
//                                   Upload Document — Click here
//                                 </Text>
//                               </TouchableOpacity>

//                               {claimFiles.length > 0 && (
//                                 <ScrollView style={styles.fileList}>
//                                   {claimFiles.map((file, i) => (
//                                     <View key={i} style={styles.fileRow}>
//                                       <Text style={styles.fileItem}>
//                                         📄 {file.name}
//                                       </Text>
//                                       <TouchableOpacity
//                                         onPress={() => handleDeleteFile(i)}
//                                         style={styles.deleteBtn}
//                                       >
//                                         <Text style={styles.deleteText}>✕</Text>
//                                       </TouchableOpacity>
//                                     </View>
//                                   ))}
//                                 </ScrollView>
//                               )}
//                             </View>
//                           </View>

//                           {/* BUTTON */}
//                           <TouchableOpacity
//                             style={[
//                               styles.button,
//                               (!isUploadComplete || loadingAnalysis) &&
//                                 styles.buttonDisabled,
//                             ]}
//                             disabled={!isUploadComplete || loadingAnalysis}
//                             onPress={analyzeInsurance}
//                           >
//                             <Text style={styles.buttonText}>
//                               {loadingAnalysis
//                                 ? "Analyzing..."
//                                 : "Analyze with kokoro AI →"}
//                             </Text>
//                           </TouchableOpacity>
//                         </View>

//                         {/* ───────── STEP 2: REVIEW SCREEN ───────── */}
//                         <ScrollView
//                           style={{ width: cardWidth }}
//                           contentContainerStyle={{
//                             padding: 10,
//                             //alignItems: "center",
//                           }}
//                           showsVerticalScrollIndicator={false}
//                         >
//                           <View style={styles.topSection}>
//                             <View style={styles.reviewTitleTopSection}>
//                               <Text style={styles.topText}>
//                                 Kokoro AI Analysis{"\n"}
//                                 <Text style={styles.topBottomText}>
//                                   review all sections, then accept suggestions
//                                   you approve
//                                 </Text>
//                               </Text>
//                               <View style={styles.topBtns}></View>
//                             </View>
//                             <View style={styles.reviewMiddleSection}>
//                               {/* <View
//                               style={styles.reviewSectionUploadedInsurance}
//                             >

//                             </View> */}
//                               <View
//                                 style={styles.reviewSectionUploadedInsurance}
//                               >
//                                 {analysisData ? (
//                                   <ScrollView style={{ padding: 10 }}>
//                                     <Text
//                                       style={{
//                                         fontWeight: "700",
//                                         marginBottom: 8,
//                                         backgroundColor: "#E7F3FFBF",
//                                         color: "#025AE0",
//                                         padding: 10,
//                                         fontSize: 15,
//                                       }}
//                                     >
//                                       📄 {structured?.source_filename}
//                                     </Text>

//                                     <Text>
//                                       Patient Name:{" "}
//                                       {structured?.patient_details?.name ||
//                                         "N/A"}
//                                     </Text>
//                                     <Text>
//                                       Age:{" "}
//                                       {structured?.patient_details?.age ||
//                                         "N/A"}
//                                     </Text>
//                                     <Text>
//                                       Gender:{" "}
//                                       {structured?.patient_details?.gender ||
//                                         "N/A"}
//                                     </Text>

//                                     <Text
//                                       style={{
//                                         marginTop: 10,
//                                         fontWeight: "600",
//                                       }}
//                                     >
//                                       Insurance Details
//                                     </Text>
//                                     <Text>
//                                       Company:{" "}
//                                       {structured?.insurance_details
//                                         ?.insurance_company || "N/A"}
//                                     </Text>
//                                     <Text>
//                                       Policy:{" "}
//                                       {structured?.insurance_details
//                                         ?.policy_name || "N/A"}
//                                     </Text>
//                                     <Text>
//                                       Policy No:{" "}
//                                       {structured?.insurance_details
//                                         ?.policy_number || "N/A"}
//                                     </Text>

//                                     <Text
//                                       style={{
//                                         marginTop: 10,
//                                         fontWeight: "600",
//                                       }}
//                                     >
//                                       Claim Details
//                                     </Text>
//                                     <Text>
//                                       Treatment:{" "}
//                                       {structured?.claim_details?.treatment ||
//                                         "N/A"}
//                                     </Text>
//                                     <Text>
//                                       Bill: ₹
//                                       {structured?.claim_details?.bill_amount ||
//                                         "0"}
//                                     </Text>
//                                     <Text>
//                                       Claimed: ₹
//                                       {structured?.claim_details
//                                         ?.claimed_amount || "0"}
//                                     </Text>

//                                     <Text style={{ marginTop: 10 }}>
//                                       Summary:
//                                     </Text>
//                                     <Text>
//                                       {structured?.document_summary ||
//                                         "No summary"}
//                                     </Text>
//                                   </ScrollView>
//                                 ) : (
//                                   <Text style={{ padding: 10 }}>
//                                     No data available
//                                   </Text>
//                                 )}
//                               </View>
//                               <View
//                                 style={[
//                                   styles.aiAnalysisSection,
//                                   { width: "60%", padding: 10 },
//                                 ]}
//                               >
//                                 {backendPrompt ? (
//                                   <View style={{ marginTop: 5, flex: 1 }}>
//                                     <ScrollView
//                                       style={{ flex: 1 }}
//                                       contentContainerStyle={{
//                                         paddingBottom: 40,
//                                       }}
//                                       showsVerticalScrollIndicator={true}
//                                     >
//                                       <FormattedMessageText
//                                         sender="bot"
//                                         text={formatBackendPromptToMarkdown(
//                                           backendPrompt.full,
//                                         )}
//                                         textColor="#0c0c0cff"
//                                       />
//                                     </ScrollView>
//                                   </View>
//                                 ) : (
//                                   <Text style={{ padding: 10, color: "gray" }}>
//                                     No AI response received
//                                   </Text>
//                                 )}
//                               </View>
//                             </View>
//                           </View>
//                           <TouchableOpacity
//                             style={styles.generateUpdatedButton}
//                             onPress={() =>
//                               navigation.navigate("HospitalInsuranceDownload", {
//                                 analysisData,
//                               })
//                             }
//                           >
//                             <Text style={styles.generateBtnText}>
//                               Generate updated files
//                             </Text>{" "}
//                           </TouchableOpacity>
//                         </ScrollView>
//                       </Animated.View>
//                     </View>
//                   </ScrollView>
//                 </View>
//               </View>
//             </View>
//           </ImageBackground>
//         </View>
//       )}
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
//             <Text style={stylesMobile.title}>Insurance claim analysis AI</Text>

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
//                       {item === 2 && "AI Analysis & Review\nSuggestions"}
//                       {item === 3 && "Download\nUpdated File"}
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
//                   Upload your insurance {"\n"}claim and save money
//                 </Text>

//                 <Text style={stylesMobile.subText}>
//                   kokoro.doctor AI will auto-extract all codes {"\n"}from these
//                   document
//                 </Text>

//                 <View style={stylesMobile.bulletWrapper}>
//                   <Text style={stylesMobile.bullet}>
//                     • Both documents are mandatory
//                   </Text>
//                   <Text style={stylesMobile.bullet}>
//                     • Analysis cannot begin without the claim document
//                   </Text>
//                   <Text style={stylesMobile.bullet}>
//                     • Kokoro AI analyzes your claim directly
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
//                         <Text style={stylesMobile.buttonText}>
//                           Generating...
//                         </Text>
//                       </View>
//                     ) : (
//                       <Text style={stylesMobile.buttonText}>
//                         Generate with AI
//                       </Text>
//                     )}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               // 🔵 STEP 2 → AI RESULT UI
//               <View style={stylesMobile.resultCard}>
//                 <Text style={stylesMobile.resultTitle}>Kokoro AI Analysis</Text>

//                 <Text style={stylesMobile.resultSub}>
//                   review all sections, then accept suggestions you approve
//                 </Text>

//                 {analysisData ? (
//                   <>
//                     <Text style={stylesMobile.blueLabel}>
//                       📄 {structured?.source_filename || "Insurance_Claim.pdf"}
//                     </Text>

//                     <View style={stylesMobile.resultBox}>
//                       <ScrollView
//                         showsVerticalScrollIndicator={true}
//                         contentContainerStyle={{ paddingBottom: 10 }}
//                       >
//                         {/* Patient Details */}
//                         <Text style={stylesMobile.sectionTitle}>
//                           Patient Details
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Patient Name:{" "}
//                           {structured?.patient_details?.name || "N/A"}
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Age: {structured?.patient_details?.age || "N/A"}
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Gender: {structured?.patient_details?.gender || "N/A"}
//                         </Text>

//                         {/* Insurance Details */}
//                         <Text style={stylesMobile.sectionTitle}>
//                           Insurance Details
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Company:{" "}
//                           {structured?.insurance_details?.insurance_company ||
//                             "N/A"}
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Policy:{" "}
//                           {structured?.insurance_details?.policy_name || "N/A"}
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Policy No:{" "}
//                           {structured?.insurance_details?.policy_number ||
//                             "N/A"}
//                         </Text>

//                         {/* Claim Details */}
//                         <Text style={stylesMobile.sectionTitle}>
//                           Claim Details
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Treatment:{" "}
//                           {structured?.claim_details?.treatment || "N/A"}
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Bill: ₹{structured?.claim_details?.bill_amount || "0"}
//                         </Text>
//                         <Text style={stylesMobile.text}>
//                           Claimed: ₹
//                           {structured?.claim_details?.claimed_amount || "0"}
//                         </Text>

//                         {/* Summary */}
//                         <Text style={stylesMobile.sectionTitle}>Summary</Text>
//                         <Text style={stylesMobile.text}>
//                           {structured?.document_summary ||
//                             "No summary available"}
//                         </Text>
//                       </ScrollView>
//                       <View style={stylesMobile.aiAssistantBox}>
//                         <Text style={stylesMobile.aiAssistantText}>
//                           Clinical AI Assistant
//                         </Text>
//                       </View>
//                     </View>
//                   </>
//                 ) : (
//                   <View style={stylesMobile.resultBox}>
//                     <Text style={stylesMobile.text}>No data available</Text>
//                   </View>
//                 )}

//                 <TouchableOpacity
//                   style={stylesMobile.acceptBtn}
//                   onPress={() =>
//                     navigation.navigate("HospitalInsuranceDownload", {
//                       analysisData,
//                     })
//                   }
//                 >
//                   <Text style={stylesMobile.acceptText}>Accept All</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </ScrollView>

//           {/* 🎯 Floating Button for AI Analysis Modal */}
//           {currentStep === 1 && analysisData && (
//             <TouchableOpacity
//               style={stylesMobile.floatingBtn}
//               onPress={openAiAnalysisModal}
//             >
//               <Image
//                 source={require("../../assets/HospitalPortal/Icon/blue_heart.png")}
//                 style={{
//                   width: 65,
//                   height: 65,
//                   resizeMode: "cover",
//                 }}
//               />
//             </TouchableOpacity>
//           )}
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
//                 You`&apos;`re not alone in this case, we`&apos;`re here to
//                 assist.
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
//             {backendPrompt ? (
//               <View style={{ marginTop: 5, flex: 1 }}>
//                 <ScrollView
//                   style={{ flex: 1 }}
//                   showsVerticalScrollIndicator={true}
//                 >
//                   <FormattedMessageText
//                     sender="bot"
//                     text={formatBackendPromptToMarkdown(backendPrompt.full)}
//                     textColor="#0c0c0cff"
//                   />
//                 </ScrollView>
//               </View>
//             ) : (
//               <Text style={{ padding: 10, color: "gray" }}>
//                 No AI response received
//               </Text>
//             )}
//           </ScrollView>
//         </Animated.View>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     height: "100vh",
//     overflow: "hidden",
//   },

//   background: {
//     flex: 1,
//     height: "100%",
//   },

//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     zIndex: 1,
//   },

//   main: {
//     flexDirection: "row",
//     height: "100%",
//     zIndex: 2,
//   },

//   left: {
//     width: "15%",
//   },

//   right: {
//     width: "85%",
//     padding: 20,
//     zIndex: 3,
//     height: "100%",
//     overflow: "auto",
//   },

//   header: {
//     marginBottom: 16,
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     width: "95%",
//     alignSelf: "center",
//     zIndex: 5,

//     height: "85vh", // ✅ FIX: limit height
//     overflow: "hidden", // ✅ prevents overflow outside card
//   },

//   titleTopSection: {
//     height: 52,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },

//   title: {
//     fontSize: 19,
//     fontWeight: "600",
//   },

//   patientButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 5,
//   },

//   btnText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#555555",
//   },

//   /* ── STEP BAR ── */
//   stepBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     justifyContent: "space-around",
//   },

//   stepItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     flex: 1,
//   },

//   stepCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "#1D6CE0",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   stepCircleActive: {
//     borderWidth: 2,
//     borderColor: "#000",
//   },

//   stepCircleComplete: {
//     backgroundColor: "#16a34a", // green when done
//   },

//   stepNumber: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "700",
//   },

//   stepTextContainer: {
//     flexDirection: "column",
//   },

//   stepTitle: {
//     color: "#1D6CE0",
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   stepSubtitle: {
//     color: "#6b7280",
//     fontSize: 10,
//     marginTop: 1,
//   },

//   stepConnector: {
//     height: 2,
//     width: 24,
//     backgroundColor: "#1D6CE0",
//     marginHorizontal: 4,
//     alignSelf: "center",
//   },

//   /* ── MIDDLE INFO ── */
//   // middleTextBox: {
//   //   alignSelf: "center",
//   //   alignItems: "center",
//   //   marginTop: 20,
//   //   marginBottom: 10,
//   // },
//   middleTextBox: {
//     marginTop: "1.5%",
//     marginBottom: 10,
//     width: "50%", // ✅ important
//     //borderWidth:1,
//     marginRight: "13%",
//   },

//   middleImage: {
//     height: 26,
//     width: 26,
//     marginBottom: 8,
//     alignSelf: "center",
//   },

//   middleTextBold: {
//     fontSize: 17,
//     fontWeight: "600",
//     textAlign: "center",
//     marginBottom: 4,
//   },

//   middleTextSub: {
//     fontSize: 14,
//     color: "#656464",
//     textAlign: "center",
//   },

//   /* ── BULLET POINTS ── */
//   // uploadDocumentsDetailBox: {
//   //   alignSelf: "center",
//   //   marginBottom: 16,
//   //   marginTop: 8,
//   // },
//   uploadDocumentsDetailBox: {
//     alignItems: "center",
//     marginBottom: 16,
//     marginTop: "2%",
//     width: "50%", // ✅ important
//     //borderWidth:1,
//     marginRight: "13%",
//   },

//   bulletText: {
//     fontSize: 14,
//     color: "#94A3B8",
//     marginBottom: 6,
//     lineHeight: 18,
//     fontWeight: "500",
//   },

//   /* ── UPLOAD ── */
//   // uploadRow: {
//   //   alignItems: "center",
//   //   marginBottom: 16,
//   // },
//   uploadRow: {
//     alignItems: "center",
//     width: "50%", // ✅ important
//     //borderWidth:1,
//     marginRight: "13%",
//     marginTop: "2%",
//   },

//   uploadContainer: {
//     width: "60%",
//   },

//   label: {
//     fontWeight: "600",
//     marginBottom: 8,
//     color: "#1440d3",
//     fontSize: 16,
//   },

//   uploadBox: {
//     height: 120,
//     borderWidth: 1.5,
//     borderStyle: "dashed",
//     borderColor: "#3b82f6",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 10,
//     backgroundColor: "#f0f6ff",
//   },

//   uploadIcon: {
//     fontSize: 22,
//     marginBottom: 6,
//   },

//   uploadText: {
//     color: "#3b82f6",
//     fontSize: 13,
//   },

//   fileList: {
//     marginTop: 8,
//     maxHeight: 80,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 6,
//   },

//   fileRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },

//   fileItem: {
//     fontSize: 12,
//     flex: 1,
//   },

//   deleteBtn: {
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//   },

//   deleteText: {
//     color: "red",
//     fontSize: 14,
//     fontWeight: "bold",
//   },

//   /* ── BUTTON ── */
//   button: {
//     marginTop: "3%",
//     backgroundColor: "#2563eb",
//     paddingVertical: 13,
//     paddingHorizontal: 28,
//     borderRadius: 8,
//     marginRight: "13%",
//     //alignSelf: "center",
//   },

//   buttonDisabled: {
//     backgroundColor: "#93c5fd",
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 15,
//   },
//   topSection: {
//     //borderWidth: 1,
//     height: "70vh",
//     width: "79%",
//     //padding: 10,
//   },
//   reviewTitleTopSection: {
//     borderWidth: 1,
//     height: "10%",
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderColor: "#b9b9b9ff",
//   },
//   topText: {
//     color: "#025AE0",
//     marginLeft: "2%",
//     fontSize: 19,
//     fontWeight: "600",
//   },
//   topBottomText: {
//     color: "#7c7c7cff",
//     fontSize: 14,
//     //fontWeight: "400",
//   },
//   topBtns: {
//     //borderWidth: 1,
//     height: "100%",
//     width: "30%",
//   },
//   // reviewMiddleSection: {
//   //   borderWidth: 2,
//   //   height: "85%",
//   //   width: "100%",
//   //   borderColor: "#a20505ff",
//   //   flexDirection: "row",
//   // },
//   reviewMiddleSection: {
//     //borderWidth: 2,
//     width: "100%",
//     borderColor: "#a20505ff",
//     flexDirection: "row",
//     height: "88%",
//     marginTop: "1%",
//   },
//   // reviewSectionUploadedInsurance: {
//   //   borderWidth: 1,
//   //   height: "100%",
//   //   width: "40%",
//   //   borderColor: "#251e8eff",
//   // },
//   reviewSectionUploadedInsurance: {
//     borderWidth: 1,
//     width: "40%",
//     borderColor: "#cbcacaff",
//     minHeight: 200, // 👈 important for scroll feel
//   },
//   aiAnalysisSection: {
//     borderWidth: 1,
//     width: "60%",
//     borderColor: "#cbcacaff",
//     minHeight: 200,
//   },
//   generateUpdatedButton: {
//     borderWidth: 1,
//     height: "7%",
//     width: "15%",
//     marginLeft: "0.5%",
//     marginTop: "1%",
//     alignItems: "center",
//     backgroundColor: "#E2EEFF",
//     borderRadius: 8,
//     borderColor: "#025AE0",
//   },
//   generateBtnText: {
//     marginTop: "4%",
//     color: "#025AE0",
//   },
// });
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
//     top: 13,
//     left: 20,
//     right: 20,
//     height: 2,
//     backgroundColor: "#D1D5DB",
//     zIndex: 0,
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
//     padding: 16,
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
//     marginTop: 16,
//     alignItems: "center",
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
//     position: "absolute",
//     bottom: -18, // 🔥 overlaps like your UI
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
// });

// export default HospitalInsuranceClaim;




import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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

// ═══════════════════════════════════════════════════════════════════════
// PROCESSING STATUS COMPONENT (shown while API call is in progress)
// ═══════════════════════════════════════════════════════════════════════

const ProcessingView = ({ stage }) => {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const stages = [
    { key: "uploading", label: "Uploading document...", icon: "upload-cloud" },
    { key: "ocr", label: "Reading document with OCR...", icon: "eye" },
    { key: "extracting", label: "Extracting claim fields...", icon: "file-text" },
    { key: "routing", label: "Detecting insurance policy...", icon: "compass" },
    { key: "auditing", label: "Auditing claim line-by-line...", icon: "check-circle" },
    { key: "reporting", label: "Generating final report...", icon: "bar-chart-2" },
  ];

  const currentIndex = stages.findIndex((s) => s.key === stage);

  return (
    <View style={procStyles.container}>
      <View style={procStyles.card}>
        <Animated.View style={[procStyles.pulseCircle, { opacity: pulse }]}>
          <Feather name="cpu" size={28} color="#2563EB" />
        </Animated.View>
        <Text style={procStyles.title}>Kokoro AI is analyzing your claim</Text>
        <Text style={procStyles.subtitle}>This may take 20-30 seconds</Text>

        <View style={procStyles.stageList}>
          {stages.map((s, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isPending = i > currentIndex;

            return (
              <View key={s.key} style={procStyles.stageRow}>
                <View
                  style={[
                    procStyles.stageIcon,
                    isDone && { backgroundColor: "#16A34A" },
                    isCurrent && { backgroundColor: "#2563EB" },
                    isPending && { backgroundColor: "#E2E8F0" },
                  ]}
                >
                  {isDone ? (
                    <Feather name="check" size={12} color="#fff" />
                  ) : isCurrent ? (
                    <Feather name={s.icon} size={12} color="#fff" />
                  ) : (
                    <Feather name={s.icon} size={12} color="#94A3B8" />
                  )}
                </View>
                <Text
                  style={[
                    procStyles.stageText,
                    isDone && { color: "#16A34A" },
                    isCurrent && { color: "#1E293B", fontWeight: "700" },
                    isPending && { color: "#CBD5E1" },
                  ]}
                >
                  {s.label}
                </Text>
                {isCurrent && <ActivityIndicator size="small" color="#2563EB" style={{ marginLeft: 8 }} />}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// CLAUDE-LIKE THINKING ANIMATION
// ═══════════════════════════════════════════════════════════════════════

const ClaudeThinkingView = ({ thinkingTrace, auditResults, finalReport, analysisData, onComplete }) => {
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [thinkingDone, setThinkingDone] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [thinkingCollapsed, setThinkingCollapsed] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const reportFade = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const thinkingPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!thinkingDone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(thinkingPulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [thinkingDone]);

  useEffect(() => {
    if (!thinkingTrace || thinkingTrace.length === 0) {
      setThinkingDone(true);
      setReportVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setVisibleBlocks((prev) => {
        const next = prev + 1;
        if (next >= thinkingTrace.length) {
          clearInterval(interval);
          setTimeout(() => {
            setThinkingDone(true);
            setThinkingCollapsed(true);
            setTimeout(() => {
              setReportVisible(true);
              Animated.timing(reportFade, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => {
                if (onComplete) onComplete();
              });
            }, 300);
          }, 500);
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [thinkingTrace]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 80);
    }
  }, [visibleBlocks, reportVisible]);

  const parseBlock = (text) => {
    const clean = text.replace(/<\/?thinking>/g, "").trim();
    const lines = clean.split("\n");
    const field = lines.find((l) => l.startsWith("FIELD:"))?.replace("FIELD:", "").trim() || "Analysis";
    const validation = lines.find((l) => l.includes("VALIDATION:")) || "";
    const severity = lines.find((l) => l.includes("SEVERITY:")) || "";
    const isPassed = validation.includes("PASS");
    const isRed = severity.includes("RED_FLAG");
    const isModerate = severity.includes("MODERATE");
    return { field, lines: clean, isPassed, isRed, isModerate };
  };

  const getColor = (p) => (p.isPassed ? "#16A34A" : p.isRed ? "#DC2626" : p.isModerate ? "#F59E0B" : "#6B7280");
  const getBg = (p) => (p.isPassed ? "#F0FDF4" : p.isRed ? "#FEF2F2" : p.isModerate ? "#FFFBEB" : "#F9FAFB");
  const getLabel = (p) => (p.isPassed ? "PASS" : p.isRed ? "RED FLAG" : p.isModerate ? "MODERATE" : "CHECK");

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={true}>
      {/* Thinking Header */}
      <TouchableOpacity
        onPress={() => thinkingDone && setThinkingCollapsed(!thinkingCollapsed)}
        activeOpacity={thinkingDone ? 0.7 : 1}
        style={tk.header}
      >
        <View style={tk.headerLeft}>
          {!thinkingDone ? (
            <Animated.View style={[tk.dot, { opacity: thinkingPulse }]} />
          ) : (
            <View style={[tk.dot, { backgroundColor: "#16A34A" }]} />
          )}
          <Text style={tk.headerLabel}>
            {thinkingDone ? `Thinking completed (${thinkingTrace?.length || 0} steps)` : `Thinking... (${visibleBlocks}/${thinkingTrace?.length || 0})`}
          </Text>
        </View>
        {thinkingDone && <Text style={tk.collapseIcon}>{thinkingCollapsed ? "▸ Show" : "▾ Hide"}</Text>}
      </TouchableOpacity>

      {/* Thinking Blocks */}
      {!thinkingCollapsed && (
        <View style={tk.container}>
          {thinkingTrace?.slice(0, visibleBlocks).map((block, i) => {
            const p = parseBlock(block);
            const color = getColor(p);
            const isExp = expandedBlock === i;

            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => setExpandedBlock(isExp ? null : i)}
                style={[tk.block, { backgroundColor: getBg(p), borderLeftColor: color, borderLeftWidth: 3 }]}
              >
                <View style={tk.blockRow}>
                  <View style={[tk.sevDot, { backgroundColor: color }]} />
                  <Text style={tk.blockField} numberOfLines={isExp ? undefined : 1}>{p.field}</Text>
                  <View style={[tk.badge, { backgroundColor: color + "18", borderColor: color }]}>
                    <Text style={[tk.badgeText, { color }]}>{getLabel(p)}</Text>
                  </View>
                </View>
                {isExp && <Text style={tk.blockDetail}>{p.lines}</Text>}
              </TouchableOpacity>
            );
          })}

          {!thinkingDone && (
            <View style={tk.typingRow}>
              {[0, 1, 2].map((i) => (
                <TypingDot key={i} delay={i * 200} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── FINAL REPORT ── */}
      {reportVisible && (
        <Animated.View style={[tk.report, { opacity: reportFade }]}>
          {analysisData?.policy_baseline && (
            <View style={tk.policyBadge}>
              <Text style={tk.policyText}>
                {analysisData.policy_baseline.replace(/_/g, " ").toUpperCase()} • {analysisData.policy_type}
              </Text>
            </View>
          )}

          {finalReport?.executive_summary && (
            <View style={tk.summaryCard}>
              <Text style={tk.summaryTitle}>Executive Summary</Text>
              <Text style={tk.summaryBody}>{finalReport.executive_summary}</Text>
            </View>
          )}

          {finalReport?.financial_summary && (
            <View style={tk.finCard}>
              <Text style={tk.secTitle}>Financial Analysis</Text>
              <View style={tk.finRow}>
                <View style={tk.finItem}>
                  <Text style={tk.finLabel}>Current Claim</Text>
                  <Text style={tk.finVal}>
                    {typeof finalReport.financial_summary.current_claim_amount === "number"
                      ? `₹${finalReport.financial_summary.current_claim_amount.toLocaleString("en-IN")}` : `₹${finalReport.financial_summary.current_claim_amount || "N/A"}`}
                  </Text>
                </View>
                <View style={[tk.finItem, { backgroundColor: "#F0FDF4" }]}>
                  <Text style={tk.finLabel}>After Fixes</Text>
                  <Text style={[tk.finVal, { color: "#16A34A" }]}>
                    {typeof finalReport.financial_summary.expected_amount_after_fixes === "number"
                      ? `₹${finalReport.financial_summary.expected_amount_after_fixes.toLocaleString("en-IN")}` : `₹${finalReport.financial_summary.expected_amount_after_fixes || "N/A"}`}
                  </Text>
                </View>
                <View style={[tk.finItem, { backgroundColor: "#EFF6FF" }]}>
                  <Text style={tk.finLabel}>Opportunity</Text>
                  <Text style={[tk.finVal, { color: "#2563EB" }]}>
                    {typeof finalReport.financial_summary.additional_opportunity === "number"
                      ? `+₹${finalReport.financial_summary.additional_opportunity.toLocaleString("en-IN")}` : finalReport.financial_summary.additional_opportunity || "N/A"}
                  </Text>
                </View>
              </View>
              {finalReport.financial_summary.breakdown && <Text style={tk.breakdown}>{finalReport.financial_summary.breakdown}</Text>}
            </View>
          )}

          {auditResults?.red_flags?.length > 0 && (
            <View style={tk.sec}>
              <Text style={[tk.secTitle, { color: "#DC2626" }]}>Red Flags ({auditResults.red_flags.length})</Text>
              {auditResults.red_flags.map((f, i) => (
                <View key={i} style={tk.flagCard}>
                  <View style={tk.flagHead}><View style={[tk.flagDot, { backgroundColor: "#DC2626" }]} /><Text style={tk.flagField}>{f.field}</Text></View>
                  <Text style={tk.flagIssue}>{f.issue}</Text>
                  <View style={tk.flagFix}><Text style={tk.flagFixL}>Fix → </Text><Text style={tk.flagFixT}>{f.correction}</Text></View>
                  {f.impact && <Text style={tk.flagImpact}>{f.impact}</Text>}
                </View>
              ))}
            </View>
          )}

          {auditResults?.moderate_flags?.length > 0 && (
            <View style={tk.sec}>
              <Text style={[tk.secTitle, { color: "#F59E0B" }]}>Moderate Issues ({auditResults.moderate_flags.length})</Text>
              {auditResults.moderate_flags.map((f, i) => (
                <View key={i} style={[tk.flagCard, { borderLeftColor: "#FCD34D", backgroundColor: "#FFFBEB" }]}>
                  <View style={tk.flagHead}><View style={[tk.flagDot, { backgroundColor: "#F59E0B" }]} /><Text style={tk.flagField}>{f.field}</Text></View>
                  <Text style={tk.flagIssue}>{f.issue}</Text>
                  <View style={tk.flagFix}><Text style={tk.flagFixL}>Fix → </Text><Text style={tk.flagFixT}>{f.correction}</Text></View>
                </View>
              ))}
            </View>
          )}

          {auditResults?.medical_code_audit?.length > 0 && (
            <View style={tk.sec}>
              <Text style={tk.secTitle}>Medical Code Audit</Text>
              {auditResults.medical_code_audit.map((c, i) => (
                <View key={i} style={[tk.codeCard, { borderLeftColor: c.status === "VALID" ? "#16A34A" : c.status === "INVALID" ? "#DC2626" : "#F59E0B" }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={tk.codeVal}>{c.code} ({c.type})</Text>
                    <Text style={[tk.codeBadge, { color: c.status === "VALID" ? "#16A34A" : "#DC2626", backgroundColor: c.status === "VALID" ? "#F0FDF4" : "#FEF2F2" }]}>{c.status}</Text>
                  </View>
                  <Text style={tk.codeReason}>{c.reason}</Text>
                </View>
              ))}
            </View>
          )}

          {auditResults?.clean_fields?.length > 0 && (
            <View style={tk.sec}>
              <Text style={[tk.secTitle, { color: "#16A34A" }]}>Clean Fields ({auditResults.clean_fields.length})</Text>
              <View style={tk.chipWrap}>
                {auditResults.clean_fields.map((f, i) => (
                  <View key={i} style={tk.cleanChip}><Text style={tk.cleanText}>✓ {f}</Text></View>
                ))}
              </View>
            </View>
          )}

          {finalReport?.final_suggestions?.length > 0 && (
            <View style={tk.sec}>
              <Text style={tk.secTitle}>Recommendations</Text>
              {finalReport.final_suggestions.map((s, i) => (
                <View key={i} style={tk.sugRow}>
                  <View style={tk.sugNum}><Text style={tk.sugNumText}>{i + 1}</Text></View>
                  <Text style={tk.sugText}>{s}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
};

// Animated typing dot
const TypingDot = ({ delay }) => {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[tk.typDot, { opacity: anim }]} />;
};

// ═══════════════════════════════════════════════════════════════════════
// STRUCTURED DATA PANEL
// ═══════════════════════════════════════════════════════════════════════

const StructuredPanel = ({ structured, isLoading }) => {
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#64748B", fontSize: 13 }}>Extracting data...</Text>
      </View>
    );
  }
  if (!structured) return <Text style={{ padding: 16, color: "#94A3B8" }}>Waiting for analysis...</Text>;

  const Field = ({ label, value }) => (
    <Text style={pn.field}>{label}: {value || "N/A"}</Text>
  );

  return (
    <ScrollView style={{ padding: 12 }} showsVerticalScrollIndicator={true}>
      <Text style={pn.filename}>{structured?.source_filename}</Text>
      <Text style={pn.head}>Patient Details</Text>
      <Field label="Name" value={structured?.patient_details?.name} />
      <Field label="Age" value={structured?.patient_details?.age} />
      <Field label="Gender" value={structured?.patient_details?.gender} />
      <Text style={pn.head}>Insurance Details</Text>
      <Field label="Company" value={structured?.insurance_details?.insurance_company} />
      <Field label="TPA" value={structured?.insurance_details?.tpa_name} />
      <Field label="Policy No" value={structured?.insurance_details?.policy_number} />
      <Text style={pn.head}>Diagnosis</Text>
      <Field label="Diagnosis" value={structured?.diagnosis_and_procedures?.primary_diagnosis} />
      {structured?.diagnosis_and_procedures?.icd_codes?.length > 0 && <Field label="ICD Codes" value={structured.diagnosis_and_procedures.icd_codes.join(", ")} />}
      <Text style={pn.head}>Hospital</Text>
      <Field label="Hospital" value={structured?.hospital_details?.hospital_name} />
      <Field label="Admission" value={structured?.hospital_details?.admission_date} />
      <Field label="Discharge" value={structured?.hospital_details?.discharge_date} />
      <Text style={pn.head}>Claim</Text>
      <Field label="Type" value={structured?.claim_details?.claim_type || structured?.document_metadata?.form_type} />
      <Field label="Bill" value={structured?.claim_details?.bill_amount ? `₹${structured.claim_details.bill_amount}` : null} />
      <Field label="Claimed" value={structured?.claim_details?.claimed_amount ? `₹${structured.claim_details.claimed_amount}` : null} />
      <Text style={pn.head}>Bank</Text>
      <Field label="Holder" value={structured?.bank_details?.account_holder} />
      <Field label="Account" value={structured?.bank_details?.account_number} />
      <Field label="IFSC" value={structured?.bank_details?.ifsc_code} />
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const HospitalInsuranceClaim = ({ navigation }) => {
  const [claimFiles, setClaimFiles] = useState([]);
  const { width, height } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useState(new Animated.Value(0))[0];
  const cardWidth = width * 0.95;
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [claimDocs, setClaimDocs] = useState([]);
  const [policyDocs, setPolicyDocs] = useState([]);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const aiAnalysisSideAnim = useState(new Animated.Value(height))[0];

  const structured = useMemo(() => analysisData?.structured_data ?? null, [analysisData]);
  const auditResults = useMemo(() => analysisData?.audit_results ?? null, [analysisData]);
  const finalReport = useMemo(() => analysisData?.final_report ?? null, [analysisData]);
  const thinkingTrace = useMemo(() => analysisData?.thinking_trace ?? [], [analysisData]);

  // ─── THE KEY CHANGE: Navigate first, THEN call API ──────────────────
  const startAnalysis = async (fileOrDoc, isWebFile = false) => {
    // Step 1: Navigate to review screen immediately
    setCurrentStep(1);
    setIsAnalyzing(true);
    setAnalysisData(null);
    setProcessingStage("uploading");

    if (Platform.OS === "web" && width > 1000) {
      Animated.timing(slideAnim, { toValue: -cardWidth, duration: 500, useNativeDriver: true }).start();
    }

    // Step 2: Build form data
    const formData = new FormData();

    if (isWebFile) {
      // Desktop web: real File object
      formData.append("file", fileOrDoc);
    } else if (Platform.OS === "web") {
      // Mobile-width web: expo doc picker asset
      const response = await fetch(fileOrDoc.uri);
      const blob = await response.blob();
      const file = new File([blob], fileOrDoc.name || "insurance_claim.pdf", {
        type: fileOrDoc.mimeType || blob.type || "application/octet-stream",
      });
      formData.append("file", file);
    } else {
      // Native mobile
      formData.append("file", {
        uri: fileOrDoc.uri,
        name: fileOrDoc.name || "insurance_claim.pdf",
        type: fileOrDoc.mimeType || "application/octet-stream",
      });
    }

    // Step 3: Simulate stage progress while API runs
    const stageTimer = setTimeout(() => setProcessingStage("ocr"), 2000);
    const stageTimer2 = setTimeout(() => setProcessingStage("extracting"), 5000);
    const stageTimer3 = setTimeout(() => setProcessingStage("routing"), 10000);
    const stageTimer4 = setTimeout(() => setProcessingStage("auditing"), 12000);
    const stageTimer5 = setTimeout(() => setProcessingStage("reporting"), 25000);

    try {
      const res = await fetch(`${API_URL}/medilocker/insurance/analyze`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data?.detail) {
        console.error("Backend error:", data.detail);
        return;
      }

      setAnalysisData(data);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      clearTimeout(stageTimer);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      clearTimeout(stageTimer5);
      setIsAnalyzing(false);
      setProcessingStage("");
    }
  };

  // ─── Web desktop: analyze ──────────────────────────────────────────
  const analyzeInsurance = () => {
    if (claimFiles.length === 0) return;
    startAnalysis(claimFiles[0], true);
  };

  // ─── Mobile: analyze ───────────────────────────────────────────────
  const handleGenerate = () => {
    if (claimDocs.length === 0 || isAnalyzing) return;
    startAnalysis(claimDocs[0], false);
  };

  // ─── Navigation ────────────────────────────────────────────────────
  const goBack = () => {
    setCurrentStep(0);
    setAnalysisData(null);
    setIsAnalyzing(false);
    Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
  };

  const openAiModal = () => {
    setAiAnalysisModalOpen(true);
    Animated.timing(aiAnalysisSideAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  };

  const closeAiModal = () => {
    Animated.timing(aiAnalysisSideAnim, { toValue: height, duration: 400, useNativeDriver: true }).start(() => setAiAnalysisModalOpen(false));
  };

  // ─── File handling ─────────────────────────────────────────────────
  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: true });
      if (result.canceled) return;
      if (type === "claim") setClaimDocs((prev) => [...prev, ...result.assets]);
      else setPolicyDocs((prev) => [...prev, ...result.assets]);
    } catch (e) { console.log(e); }
  };

  const removeFile = (type, index) => {
    if (type === "claim") setClaimDocs((prev) => prev.filter((_, i) => i !== index));
    else setPolicyDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const isUploadComplete = Platform.OS === "web" ? claimFiles.length > 0 : claimDocs.length > 0;

  const handleFileUpload = () => {
    if (Platform.OS !== "web") return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => setClaimFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    input.click();
  };

  const handleDeleteFile = (index) => setClaimFiles((prev) => prev.filter((_, i) => i !== index));

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <>
      {/* ═══════ WEB DESKTOP ═══════ */}
      {Platform.OS === "web" && (width > 1000 || width === 0) && (
        <View style={styles.container}>
          <ImageBackground source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")} style={styles.background} resizeMode="cover">
            <View style={styles.overlay} />
            <View style={styles.main}>
              <View style={styles.left}><HospitalSidebarNavigation navigation={navigation} /></View>
              <View style={styles.right}>
                <View style={styles.header}><HeaderLoginSignUp navigation={navigation} /></View>
                <View style={styles.card}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>Insurance claim analysis AI</Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => currentStep === 1 ? goBack() : null}>
                      <Text style={styles.backBtnText}>{currentStep === 1 ? "← Back" : "Select Patient"}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Step Bar */}
                  <View style={styles.stepBar}>
                    {["Upload Documents", "Review Suggestions", "Download Updated File"].map((t, i, a) => (
                      <React.Fragment key={i}>
                        <View style={styles.stepItem}>
                          <View style={[styles.stepCircle, i === currentStep && styles.stepActive, ((i === 0 && isUploadComplete) || (i === 1 && currentStep >= 1)) && styles.stepDone]}>
                            <Text style={styles.stepNum}>{(i === 0 && isUploadComplete) || (i === 1 && currentStep >= 1) ? "✓" : i + 1}</Text>
                          </View>
                          <Text style={styles.stepLabel}>{t}</Text>
                        </View>
                        {i < a.length - 1 && <View style={styles.stepLine} />}
                      </React.Fragment>
                    ))}
                  </View>

                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ overflow: "hidden", width: "100%" }}>
                      <Animated.View style={{ flexDirection: "row", width: cardWidth * 2, transform: [{ translateX: slideAnim }] }}>
                        {/* ── STEP 1: UPLOAD ── */}
                        <View style={{ width: cardWidth, alignItems: "center", minHeight: 100 }}>
                          <View style={styles.midBox}>
                            <Image source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")} style={styles.midIcon} />
                            <Text style={styles.midTitle}>Upload your insurance claim and save money</Text>
                            <Text style={styles.midSub}>kokoro.doctor AI will auto-extract all codes from this document</Text>
                          </View>
                          <View style={styles.bullets}>
                            <Text style={styles.bullet}>• Claim document is mandatory</Text>
                            <Text style={styles.bullet}>• Analysis cannot begin without the claim document</Text>
                            <Text style={styles.bullet}>• Kokoro AI analyzes your claim directly</Text>
                          </View>
                          <View style={styles.uploadArea}>
                            <View style={styles.uploadInner}>
                              <Text style={styles.uploadLabel}>Insurance Claim Document</Text>
                              <TouchableOpacity style={styles.uploadBox} onPress={handleFileUpload}>
                                <Text style={{ fontSize: 22, marginBottom: 6 }}>☁️</Text>
                                <Text style={{ color: "#3b82f6", fontSize: 13 }}>Upload Document — Click here</Text>
                              </TouchableOpacity>
                              {claimFiles.length > 0 && (
                                <View style={styles.fileList}>
                                  {claimFiles.map((f, i) => (
                                    <View key={i} style={styles.fileRow}>
                                      <Text style={styles.fileName}>{f.name}</Text>
                                      <TouchableOpacity onPress={() => handleDeleteFile(i)}><Text style={{ color: "red", fontWeight: "bold" }}>✕</Text></TouchableOpacity>
                                    </View>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>
                          <TouchableOpacity
                            style={[styles.analyzeBtn, !isUploadComplete && styles.analyzeBtnDisabled]}
                            disabled={!isUploadComplete || isAnalyzing}
                            onPress={analyzeInsurance}
                          >
                            <Text style={styles.analyzeBtnText}>Analyze with kokoro AI →</Text>
                          </TouchableOpacity>
                        </View>

                        {/* ── STEP 2: REVIEW (analysis happens here) ── */}
                        <View style={{ width: cardWidth, padding: 10, flex: 1 }}>
                          <View style={styles.reviewHeader}>
                            <Text style={styles.reviewTitle}>Kokoro AI Analysis</Text>
                            <Text style={styles.reviewSub}>review all sections, then accept suggestions you approve</Text>
                          </View>
                          <View style={styles.reviewBody}>
                            {/* LEFT: Structured Data */}
                            <View style={styles.leftPanel}>
                              <StructuredPanel structured={structured} isLoading={isAnalyzing && !structured} />
                            </View>

                            {/* RIGHT: Thinking + Report */}
                            <View style={styles.rightPanel}>
                              {isAnalyzing && !analysisData ? (
                                <ProcessingView stage={processingStage} />
                              ) : analysisData ? (
                                <ClaudeThinkingView
                                  thinkingTrace={thinkingTrace}
                                  auditResults={auditResults}
                                  finalReport={finalReport}
                                  analysisData={analysisData}
                                />
                              ) : (
                                <Text style={{ padding: 16, color: "#94A3B8" }}>Upload a claim to begin</Text>
                              )}
                            </View>
                          </View>
                          {analysisData && (
                            <TouchableOpacity style={styles.genBtn} onPress={() => navigation.navigate("HospitalInsuranceDownload", { analysisData })}>
                              <Text style={styles.genBtnText}>Generate updated files</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </Animated.View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}

      {/* ═══════ MOBILE ═══════ */}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <ScrollView contentContainerStyle={m.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor="#fff" />
            <View style={m.header}><HeaderLoginSignUp navigation={navigation} /></View>
            <Text style={m.title}>Insurance claim analysis AI</Text>
            <TouchableOpacity style={m.selectBtn}><Text style={m.selectText}>Select Patient</Text></TouchableOpacity>

            {/* Stepper */}
            <View style={m.stepContainer}>
              <View style={m.line} />
              {[1, 2, 3].map((item, index) => (
                <View key={index} style={m.stepWrap}>
                  <View style={[m.circle, index === currentStep && m.activeCircle, index < currentStep && m.doneCircle]}>
                    <Text style={[m.circleText, (index === currentStep || index < currentStep) && { color: "#fff" }]}>
                      {index < currentStep ? "✓" : item}
                    </Text>
                  </View>
                  <Text style={m.stepText}>
                    {item === 1 ? "Upload\nDocuments" : item === 2 ? "AI Analysis\n& Review" : "Download\nUpdated File"}
                  </Text>
                </View>
              ))}
            </View>

            {currentStep === 0 ? (
              <View style={m.card}>
                <Image source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")} style={{ width: "100%", marginBottom: 12 }} resizeMode="contain" />
                <Text style={m.cardTitle}>Upload your insurance {"\n"}claim and save money</Text>
                <Text style={m.subText}>kokoro.doctor AI will auto-extract all codes{"\n"}from these document</Text>
                <View style={m.bulletWrap}>
                  <Text style={m.bullet}>• Both documents are mandatory</Text>
                  <Text style={m.bullet}>• Analysis cannot begin without the claim document</Text>
                  <Text style={m.bullet}>• Kokoro AI analyzes your claim directly</Text>
                </View>
                <Text style={m.label}>Insurance Claim Document</Text>
                <TouchableOpacity style={m.uploadBox} onPress={() => pickDocument("claim")}>
                  <Feather name="upload" size={20} color="#2563EB" />
                  <Text style={m.uploadText}>Upload Photo <Text style={m.link}>Click here</Text></Text>
                </TouchableOpacity>
                {claimDocs.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={m.fileScroll} style={{ marginTop: -10, marginBottom: 10 }}>
                    {claimDocs.map((doc, index) => (
                      <View key={index} style={m.fileChip}>
                        <Feather name="check-circle" size={14} color="#16A34A" />
                        <Text style={m.fileText} numberOfLines={1}>{doc.name}</Text>
                        <TouchableOpacity onPress={() => removeFile("claim", index)}><Feather name="x" size={14} color="#6B7280" /></TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
                <TouchableOpacity
                  style={[m.button, (isAnalyzing || claimDocs.length === 0) && { opacity: 0.5 }]}
                  onPress={handleGenerate}
                  disabled={isAnalyzing || claimDocs.length === 0}
                >
                  <Text style={m.buttonText}>Generate with AI</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={m.resultCard}>
                <Text style={m.resultTitle}>Kokoro AI Analysis</Text>
                <Text style={m.resultSub}>
                  {isAnalyzing ? "Analyzing your claim..." : "review all sections, then accept suggestions you approve"}
                </Text>

                {isAnalyzing && !analysisData ? (
                  <ProcessingView stage={processingStage} />
                ) : analysisData ? (
                  <>
                    <Text style={m.blueLabel}>{structured?.source_filename || "Insurance_Claim.pdf"}</Text>
                    <View style={m.resultBox}>
                      <ScrollView>
                        <Text style={m.secTitle}>Patient</Text>
                        <Text style={m.text}>Name: {structured?.patient_details?.name || "N/A"}</Text>
                        <Text style={m.text}>Age: {structured?.patient_details?.age || "N/A"}</Text>
                        <Text style={m.secTitle}>Insurance</Text>
                        <Text style={m.text}>TPA: {structured?.insurance_details?.tpa_name || "N/A"}</Text>
                        <Text style={m.secTitle}>Claim</Text>
                        <Text style={m.text}>Bill: ₹{structured?.claim_details?.bill_amount || "0"}</Text>
                        <Text style={m.text}>Claimed: ₹{structured?.claim_details?.claimed_amount || "0"}</Text>
                      </ScrollView>
                    </View>
                    <TouchableOpacity style={m.acceptBtn} onPress={() => navigation.navigate("HospitalInsuranceDownload", { analysisData })}>
                      <Text style={m.acceptText}>Accept All</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={{ padding: 16, color: "#94A3B8" }}>Waiting for analysis...</Text>
                )}
              </View>
            )}
          </ScrollView>

          {currentStep === 1 && analysisData && (
            <TouchableOpacity style={m.floatingBtn} onPress={openAiModal}>
              <Image source={require("../../assets/HospitalPortal/Icon/blue_heart.png")} style={{ width: 65, height: 65, resizeMode: "cover" }} />
            </TouchableOpacity>
          )}
        </SafeAreaView>
      )}

      {/* ═══════ AI MODAL — Mobile ═══════ */}
      {aiAnalysisModalOpen && (
        <Animated.View style={[m.aiModal, { transform: [{ translateY: aiAnalysisSideAnim }] }]}>
          <View style={m.aiModalHeader}>
            <View>
              <Text style={m.aiModalTitle}>Kokoro AI Analysis</Text>
              <Text style={{ color: "#999", fontSize: 13 }}>Chain of thought reasoning</Text>
            </View>
            <TouchableOpacity onPress={closeAiModal}><Feather name="x" size={24} color="#333" /></TouchableOpacity>
          </View>
          <View style={{ flex: 1, padding: 12 }}>
            {analysisData ? (
              <ClaudeThinkingView thinkingTrace={thinkingTrace} auditResults={auditResults} finalReport={finalReport} analysisData={analysisData} />
            ) : (
              <Text style={{ padding: 10, color: "gray" }}>No AI response received</Text>
            )}
          </View>
        </Animated.View>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const procStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: { alignItems: "center", padding: 30 },
  pulseCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 20 },
  stageList: { width: "100%", gap: 10 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stageIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  stageText: { fontSize: 13 },
});

const tk = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#F59E0B" },
  headerLabel: { fontSize: 13, fontWeight: "700", color: "#475569" },
  collapseIcon: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  container: { backgroundColor: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  block: { borderRadius: 6, padding: 8, marginBottom: 4 },
  blockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sevDot: { width: 7, height: 7, borderRadius: 4 },
  blockField: { flex: 1, fontSize: 12, fontWeight: "600", color: "#334155" },
  badge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { fontSize: 9, fontWeight: "700" },
  blockDetail: { marginTop: 6, fontSize: 11, color: "#64748B", lineHeight: 16, fontFamily: Platform.OS === "web" ? "monospace" : "Courier" },
  typingRow: { flexDirection: "row", gap: 5, paddingVertical: 8, paddingHorizontal: 12 },
  typDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#94A3B8" },
  report: { paddingHorizontal: 14, paddingTop: 8 },
  policyBadge: { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start", marginBottom: 14 },
  policyText: { color: "#1D4ED8", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  summaryCard: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 14, marginBottom: 14 },
  summaryTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 6 },
  summaryBody: { fontSize: 13, color: "#475569", lineHeight: 20 },
  secTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 8 },
  sec: { marginBottom: 16 },
  finCard: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 14, marginBottom: 14 },
  finRow: { flexDirection: "row", gap: 8 },
  finItem: { flex: 1, backgroundColor: "#fff", borderRadius: 6, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  finLabel: { fontSize: 10, color: "#64748B", fontWeight: "600", marginBottom: 4 },
  finVal: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  breakdown: { fontSize: 12, color: "#64748B", marginTop: 10, lineHeight: 18 },
  flagCard: { backgroundColor: "#FEF2F2", borderLeftWidth: 3, borderLeftColor: "#FCA5A5", borderRadius: 6, padding: 10, marginBottom: 8 },
  flagHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  flagDot: { width: 8, height: 8, borderRadius: 4 },
  flagField: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  flagIssue: { fontSize: 12, color: "#475569", marginBottom: 4 },
  flagFix: { flexDirection: "row" },
  flagFixL: { fontSize: 12, fontWeight: "600", color: "#16A34A" },
  flagFixT: { fontSize: 12, color: "#166534", flex: 1 },
  flagImpact: { fontSize: 11, color: "#DC2626", marginTop: 4, fontStyle: "italic" },
  codeCard: { backgroundColor: "#F9FAFB", borderLeftWidth: 3, borderRadius: 4, padding: 8, marginBottom: 6 },
  codeVal: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  codeBadge: { fontSize: 10, fontWeight: "700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: "hidden" },
  codeReason: { fontSize: 11, color: "#64748B", marginTop: 3 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cleanChip: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  cleanText: { fontSize: 11, color: "#166534" },
  sugRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  sugNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" },
  sugNumText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  sugText: { flex: 1, fontSize: 13, color: "#334155", lineHeight: 18 },
});

const pn = StyleSheet.create({
  filename: { fontWeight: "700", marginBottom: 10, backgroundColor: "#E7F3FFBF", color: "#025AE0", padding: 10, fontSize: 14, borderRadius: 4 },
  head: { fontWeight: "700", fontSize: 13, color: "#1E293B", marginBottom: 4, marginTop: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 3 },
  field: { fontSize: 12, color: "#475569", marginBottom: 3, lineHeight: 18 },
});

const styles = StyleSheet.create({
  container: { flex: 1, height: "100vh", overflow: "hidden" },
  background: { flex: 1, height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1 },
  main: { flexDirection: "row", height: "100%", zIndex: 2 },
  left: { width: "15%" },
  right: { width: "85%", padding: 20, zIndex: 3, height: "100%", overflow: "auto" },
  header: { marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, width: "95%", alignSelf: "center", zIndex: 5, height: "85vh", overflow: "hidden" },
  titleRow: { height: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 19, fontWeight: "600" },
  backBtn: { borderWidth: 1, borderColor: "#ccc", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 5 },
  backBtnText: { fontSize: 15, fontWeight: "500", color: "#555" },
  stepBar: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", justifyContent: "space-around" },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1D6CE0", justifyContent: "center", alignItems: "center" },
  stepActive: { borderWidth: 2, borderColor: "#000" },
  stepDone: { backgroundColor: "#16a34a" },
  stepNum: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepLabel: { color: "#1D6CE0", fontSize: 12, fontWeight: "700" },
  stepLine: { height: 2, width: 24, backgroundColor: "#1D6CE0", marginHorizontal: 4 },
  midBox: { marginTop: "1.5%", marginBottom: 10, width: "50%", marginRight: "13%" },
  midIcon: { height: 26, width: 26, marginBottom: 8, alignSelf: "center" },
  midTitle: { fontSize: 17, fontWeight: "600", textAlign: "center", marginBottom: 4 },
  midSub: { fontSize: 14, color: "#656464", textAlign: "center" },
  bullets: { alignItems: "center", marginBottom: 16, marginTop: "2%", width: "50%", marginRight: "13%" },
  bullet: { fontSize: 14, color: "#94A3B8", marginBottom: 6, lineHeight: 18, fontWeight: "500" },
  uploadArea: { alignItems: "center", width: "50%", marginRight: "13%", marginTop: "2%" },
  uploadInner: { width: "60%" },
  uploadLabel: { fontWeight: "600", marginBottom: 8, color: "#1440d3", fontSize: 16 },
  uploadBox: { height: 120, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#3b82f6", justifyContent: "center", alignItems: "center", borderRadius: 10, backgroundColor: "#f0f6ff" },
  fileList: { marginTop: 8, maxHeight: 80, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 6 },
  fileRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  fileName: { fontSize: 12, flex: 1 },
  analyzeBtn: { marginTop: "3%", backgroundColor: "#2563eb", paddingVertical: 13, paddingHorizontal: 28, borderRadius: 8, marginRight: "13%" },
  analyzeBtnDisabled: { backgroundColor: "#93c5fd" },
  analyzeBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  reviewHeader: { borderWidth: 1, borderColor: "#b9b9b9", paddingHorizontal: 12, paddingVertical: 10, width: "79%" },
  reviewTitle: { color: "#025AE0", fontSize: 19, fontWeight: "600" },
  reviewSub: { color: "#7c7c7c", fontSize: 14 },
  reviewBody: { width: "79%", flexDirection: "row", height: "calc(70vh - 130px)", marginTop: "1%" },
  leftPanel: { borderWidth: 1, width: "40%", borderColor: "#cbcaca" },
  rightPanel: { borderWidth: 1, width: "60%", borderColor: "#cbcaca" },
  genBtn: { borderWidth: 1, paddingVertical: 10, paddingHorizontal: 16, marginTop: "1%", alignItems: "center", backgroundColor: "#E2EEFF", borderRadius: 8, borderColor: "#025AE0", alignSelf: "flex-start" },
  genBtnText: { color: "#025AE0", fontWeight: "500" },
});

const m = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  header: { zIndex: 2 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12, paddingLeft: "2%" },
  selectBtn: { marginLeft: "2%", alignSelf: "flex-start", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16 },
  selectText: { fontSize: 14, color: "#333" },
  stepContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  stepWrap: { alignItems: "center", flex: 1 },
  circle: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#E6F0FF", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  circleText: { fontSize: 12, color: "#3B82F6", fontWeight: "600" },
  stepText: { fontSize: 10, textAlign: "center", color: "#3B82F6" },
  line: { position: "absolute", top: 13, left: 20, right: 20, height: 2, backgroundColor: "#D1D5DB", zIndex: 0 },
  activeCircle: { backgroundColor: "#2563EB" },
  doneCircle: { backgroundColor: "#16A34A" },
  card: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", textAlign: "center", marginBottom: 10 },
  subText: { fontSize: 12, textAlign: "center", color: "#6B7280", marginBottom: 10 },
  bulletWrap: { marginBottom: 16 },
  bullet: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, color: "#2563EB" },
  uploadBox: { borderWidth: 1, borderStyle: "dashed", borderColor: "#3B82F6", borderRadius: 10, paddingVertical: 24, alignItems: "center", justifyContent: "center", marginBottom: 16, gap: 6 },
  uploadText: { fontSize: 13, color: "#6B7280" },
  link: { color: "#2563EB", fontWeight: "600" },
  button: { backgroundColor: "#6B9CFF", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  fileChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#E5E7EB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, maxWidth: 200, gap: 6 },
  fileText: { fontSize: 11, color: "#374151" },
  fileScroll: { flexDirection: "row", alignItems: "center" },
  resultCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  resultTitle: { fontSize: 16, fontWeight: "700", color: "#2563EB" },
  resultSub: { fontSize: 12, color: "#6B7280", marginBottom: 10 },
  resultBox: { backgroundColor: "#F9FAFB", padding: 12, borderRadius: 8, maxHeight: 250 },
  blueLabel: { backgroundColor: "#E0EDFF", color: "#2563EB", padding: 6, marginBottom: 10, fontSize: 12, borderRadius: 4 },
  text: { fontSize: 12, marginBottom: 4 },
  secTitle: { fontSize: 13, fontWeight: "600", marginTop: 8 },
  acceptBtn: { backgroundColor: "#2563EB", padding: 14, borderRadius: 10, marginTop: 16, alignItems: "center" },
  acceptText: { color: "#fff", fontWeight: "600" },
  floatingBtn: { position: "absolute", right: 20, bottom: 100, height: 65, width: 65, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  aiModal: { position: "absolute", left: 0, right: 0, bottom: 0, top: 80, backgroundColor: "#fff", zIndex: 1000, elevation: 50, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  aiModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0", backgroundColor: "#E7F3FFBF" },
  aiModalTitle: { fontSize: 18, fontWeight: "700", color: "#2563EB" },
});

export default HospitalInsuranceClaim;
