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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { ActivityIndicator } from "react-native";
import { API_URL } from "../../env-vars";

const HospitalInsuranceClaim = ({ navigation }) => {
  const [claimFiles, setClaimFiles] = useState([]);
  const { width, height } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0); // 0 = upload, 1 = review
  const slideAnim = useState(new Animated.Value(0))[0];
  const cardWidth = width * 0.95;
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [claimDocs, setClaimDocs] = useState([]);
  const [policyDocs, setPolicyDocs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const aiAnalysisSideAnim = useState(new Animated.Value(height))[0];
  const analyzeMobileInsurance = async () => {
    if (claimDocs.length === 0) return;

    try {
      setIsGenerating(true);

      const file = claimDocs[0];
      const token = localStorage.getItem("token");

      // Convert URI to Blob to match web File format
      const fileResponse = await fetch(file.uri);
      const fileBlob = await fileResponse.blob();

      const formData = new FormData();
      formData.append("file", fileBlob, file.name);

      const response = await fetch(
        `${API_URL}/medilocker/insurance/analyze`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        },
      );

      const data = await response.json();
      console.log("API RESPONSE:", data);

      setAnalysisData(data);
      setCurrentStep(1);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
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
    }).start(() => {
      setAiAnalysisModalOpen(false);
    });
  };
  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true, // ✅ IMPORTANT
      });

      if (result.canceled) return;

      const files = result.assets;

      if (type === "claim") {
        setClaimDocs((prev) => [...prev, ...files]);
      } else {
        setPolicyDocs((prev) => [...prev, ...files]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const removeFile = (type, index) => {
    if (type === "claim") {
      setClaimDocs((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPolicyDocs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Step 1 completed only if claim upload exists
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

  const goToReview = () => {
    setCurrentStep(1);

    Animated.timing(slideAnim, {
      toValue: -cardWidth, // slide left
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const analyzeInsurance = async () => {
    if (claimFiles.length === 0) return;

    try {
      setLoadingAnalysis(true);

      const file = claimFiles[0];

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/medilocker/insurance/analyze`,
        {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        },
      );

      const data = await response.json();

      console.log("API RESPONSE:", data);

      setAnalysisData(data);
      goToReview();
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <>
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
                {/* HEADER */}
                <View style={styles.header}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View>

                {/* MAIN CARD */}
                <View style={styles.card}>
                  {/* TITLE ROW */}
                  <View style={styles.titleTopSection}>
                    <Text style={styles.title}>
                      Insurance claim analysis AI
                    </Text>
                    <TouchableOpacity
                      style={styles.patientButton}
                      onPress={() => {
                        if (currentStep === 1) {
                          // 🔙 Go back to upload
                          setCurrentStep(0);

                          Animated.timing(slideAnim, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                          }).start();
                        } else {
                          // 👉 Your existing select patient logic
                          console.log("Open patient selector");
                        }
                      }}
                    >
                      <Text style={styles.btnText}>
                        {currentStep === 1 ? "Back" : "Select Patient"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* STEP BAR — 2 steps only */}
                  <View style={styles.stepBar}>
                    {[
                      {
                        title: "Upload Documents",
                        subtitle: "Claim document required",
                      },
                      {
                        title: "Review Suggestions",
                        subtitle: "Accept or reject changes",
                      },
                      {
                        title: "Download Updated File",
                        subtitle: "Editable & ready",
                      },
                    ].map((item, index, arr) => (
                      <React.Fragment key={index}>
                        <View style={styles.stepItem}>
                          {/* <View
                            style={[
                              styles.stepCircle,
                              index === currentStep && styles.stepCircleActive,
                              index === 0 && isUploadComplete
                                ? styles.stepCircleComplete
                                : null,
                            ]}
                          >
                            <Text style={styles.stepNumber}>
                              {index === 0 && isUploadComplete
                                ? "✓"
                                : index + 1}
                            </Text>
                          </View> */}
                          <View
                            style={[
                              styles.stepCircle,
                              index === currentStep && styles.stepCircleActive,

                              // ✅ STEP COMPLETE LOGIC
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

                  {/* <View style={styles.middleTextBox}>
                    <Image
                      source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                      style={styles.middleImage}
                    />
                    <Text style={styles.middleTextBold}>
                      Upload your insurance claim and save money
                    </Text>
                    <Text style={styles.middleTextSub}>
                      kokoro.doctor AI will auto-extract all codes from this
                      document
                    </Text>
                  </View>

          
                  <View style={styles.uploadDocumentsDetailBox}>
                    <Text style={styles.bulletText}>
                      • Claim document is mandatory
                    </Text>
                    <Text style={styles.bulletText}>
                      • Analysis cannot begin without the claim document
                    </Text>
                    <Text style={styles.bulletText}>
                      • Kokoro AI analyzes your claim directly
                    </Text>
                  </View>

            
                  <View style={styles.uploadRow}>
                    <View style={styles.uploadContainer}>
                      <Text style={styles.label}>Insurance Claim Document</Text>
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
                                <Text style={styles.deleteText}>✕</Text>
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
                      !isUploadComplete && styles.buttonDisabled,
                    ]}
                    disabled={!isUploadComplete}
                  >
                    <Text style={styles.buttonText}>
                      Analyze with kokoro AI →
                    </Text>
                  </TouchableOpacity> */}
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={{ overflow: "hidden", width: "100%" }}>
                      <Animated.View
                        style={{
                          flexDirection: "row",
                          // width: width * 2,
                          width: cardWidth * 2,
                          transform: [{ translateX: slideAnim }],
                        }}
                      >
                        {/* ───────── STEP 1: UPLOAD SCREEN ───────── */}
                        <View
                          style={{
                            width: cardWidth,
                            alignItems: "center",
                            //justifyContent: "flex-start", // ✅ FIX
                            //paddingVertical: 20,
                            minHeight: 100,
                            borderWidth: 1,
                          }}
                        >
                          {/* MIDDLE INFO BOX */}
                          <View style={styles.middleTextBox}>
                            <Image
                              source={require("../../assets/HospitalPortal/Icon/medicalIcon.png")}
                              style={styles.middleImage}
                            />
                            <Text style={styles.middleTextBold}>
                              Upload your insurance claim and save money
                            </Text>
                            <Text style={styles.middleTextSub}>
                              kokoro.doctor AI will auto-extract all codes from
                              this document
                            </Text>
                          </View>

                          {/* BULLETS */}
                          <View style={styles.uploadDocumentsDetailBox}>
                            <Text style={styles.bulletText}>
                              • Claim document is mandatory
                            </Text>
                            <Text style={styles.bulletText}>
                              • Analysis cannot begin without the claim document
                            </Text>
                            <Text style={styles.bulletText}>
                              • Kokoro AI analyzes your claim directly
                            </Text>
                          </View>

                          {/* UPLOAD */}
                          <View style={styles.uploadRow}>
                            <View style={styles.uploadContainer}>
                              <Text style={styles.label}>
                                Insurance Claim Document
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
                                        <Text style={styles.deleteText}>✕</Text>
                                      </TouchableOpacity>
                                    </View>
                                  ))}
                                </ScrollView>
                              )}
                            </View>
                          </View>

                          {/* BUTTON */}
                          <TouchableOpacity
                            style={[
                              styles.button,
                              (!isUploadComplete || loadingAnalysis) &&
                                styles.buttonDisabled,
                            ]}
                            disabled={!isUploadComplete || loadingAnalysis}
                            onPress={analyzeInsurance}
                          >
                            <Text style={styles.buttonText}>
                              {loadingAnalysis
                                ? "Analyzing..."
                                : "Analyze with kokoro AI →"}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* ───────── STEP 2: REVIEW SCREEN ───────── */}
                        <ScrollView
                          style={{ width: cardWidth }}
                          contentContainerStyle={{
                            padding: 10,
                            //alignItems: "center",
                          }}
                          showsVerticalScrollIndicator={false}
                        >
                          <View style={styles.topSection}>
                            <View style={styles.reviewTitleTopSection}>
                              <Text style={styles.topText}>
                                Kokoro AI Analysis{"\n"}
                                <Text style={styles.topBottomText}>
                                  review all sections, then accept suggestions
                                  you approve
                                </Text>
                              </Text>
                              <View style={styles.topBtns}></View>
                            </View>
                            <View style={styles.reviewMiddleSection}>
                              {/* <View
                              style={styles.reviewSectionUploadedInsurance}
                            >

                            </View> */}
                              <View
                                style={styles.reviewSectionUploadedInsurance}
                              >
                                {analysisData?.structured_data ? (
                                  <ScrollView style={{ padding: 10 }}>
                                    <Text
                                      style={{
                                        fontWeight: "700",
                                        marginBottom: 8,
                                        backgroundColor: "#E7F3FFBF",
                                        color: "#025AE0",
                                        padding: 10,
                                        fontSize: 15,
                                      }}
                                    >
                                      📄{" "}
                                      {
                                        analysisData?.structured_data
                                          ?.source_filename
                                      }
                                    </Text>

                                    <Text>
                                      Patient Name:{" "}
                                      {analysisData.structured_data
                                        .patient_details?.name || "N/A"}
                                    </Text>
                                    <Text>
                                      Age:{" "}
                                      {analysisData.structured_data
                                        .patient_details?.age || "N/A"}
                                    </Text>
                                    <Text>
                                      Gender:{" "}
                                      {analysisData.structured_data
                                        .patient_details?.gender || "N/A"}
                                    </Text>

                                    <Text
                                      style={{
                                        marginTop: 10,
                                        fontWeight: "600",
                                      }}
                                    >
                                      Insurance Details
                                    </Text>
                                    <Text>
                                      Company:{" "}
                                      {analysisData.structured_data
                                        .insurance_details?.insurance_company ||
                                        "N/A"}
                                    </Text>
                                    <Text>
                                      Policy:{" "}
                                      {analysisData.structured_data
                                        .insurance_details?.policy_name ||
                                        "N/A"}
                                    </Text>
                                    <Text>
                                      Policy No:{" "}
                                      {analysisData.structured_data
                                        .insurance_details?.policy_number ||
                                        "N/A"}
                                    </Text>

                                    <Text
                                      style={{
                                        marginTop: 10,
                                        fontWeight: "600",
                                      }}
                                    >
                                      Claim Details
                                    </Text>
                                    <Text>
                                      Treatment:{" "}
                                      {analysisData.structured_data
                                        .claim_details?.treatment || "N/A"}
                                    </Text>
                                    <Text>
                                      Bill: ₹
                                      {analysisData.structured_data
                                        .claim_details?.bill_amount || "0"}
                                    </Text>
                                    <Text>
                                      Claimed: ₹
                                      {analysisData.structured_data
                                        .claim_details?.claimed_amount || "0"}
                                    </Text>

                                    <Text style={{ marginTop: 10 }}>
                                      Summary:
                                    </Text>
                                    <Text>
                                      {analysisData.structured_data
                                        .document_summary || "No summary"}
                                    </Text>
                                  </ScrollView>
                                ) : (
                                  <Text style={{ padding: 10 }}>
                                    No data available
                                  </Text>
                                )}
                              </View>
                              <View
                                style={[
                                  styles.aiAnalysisSection,
                                  { width: "60%", padding: 10 },
                                ]}
                              >
                                {analysisData ? (
                                  <ScrollView>
                                    <Text
                                      style={{
                                        fontWeight: "700",
                                        marginBottom: 8,
                                        backgroundColor: "#E7F3FFBF",
                                        color: "#000",
                                        padding: 10,
                                        fontSize: 16,
                                      }}
                                    >
                                      Kokoro AI Analysis
                                    </Text>

                                    <Text>
                                      Status:{" "}
                                      {analysisData?.analysis?.is_complete
                                        ? "✅ Complete"
                                        : "❌ Incomplete"}
                                    </Text>

                                    <Text
                                      style={{
                                        marginTop: 10,
                                        fontWeight: "600",
                                      }}
                                    >
                                      Missing Fields:
                                    </Text>
                                    {analysisData?.analysis?.missing_fields
                                      ?.length > 0 ? (
                                      analysisData?.analysis?.missing_fields.map(
                                        (item, i) => (
                                          <Text key={i}>• {item}</Text>
                                        ),
                                      )
                                    ) : (
                                      <Text>None</Text>
                                    )}

                                    <Text
                                      style={{
                                        marginTop: 10,
                                        fontWeight: "600",
                                      }}
                                    >
                                      Issues:
                                    </Text>
                                    {analysisData?.analysis?.issues?.length >
                                    0 ? (
                                      analysisData?.analysis?.issues.map(
                                        (item, i) => (
                                          <Text key={i}>⚠️ {item}</Text>
                                        ),
                                      )
                                    ) : (
                                      <Text>No issues</Text>
                                    )}

                                    <Text
                                      style={{
                                        marginTop: 10,
                                        fontWeight: "600",
                                      }}
                                    >
                                      Suggestions:
                                    </Text>
                                    {analysisData.analysis.suggestions?.length >
                                    0 ? (
                                      analysisData.analysis.suggestions.map(
                                        (item, i) => (
                                          <Text key={i}>💡 {item}</Text>
                                        ),
                                      )
                                    ) : (
                                      <Text>No suggestions</Text>
                                    )}

                                    <Text
                                      style={{
                                        marginTop: 10,
                                        fontWeight: "600",
                                      }}
                                    >
                                      Claim Opportunity:
                                    </Text>
                                    <Text>
                                      {analysisData.analysis
                                        .claim_opportunity || "N/A"}
                                    </Text>
                                  </ScrollView>
                                ) : (
                                  <Text>AI analysis will appear here</Text>
                                )}
                              </View>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.generateUpdatedButton}
                            onPress={() =>
                              navigation.navigate("HospitalInsuranceDownload", {
                                analysisData,
                              })
                            }
                          >
                            <Text style={styles.generateBtnText}>
                              Generate updated files
                            </Text>{" "}
                          </TouchableOpacity>
                        </ScrollView>
                      </Animated.View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      )}
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
            <Text style={stylesMobile.title}>Insurance claim analysis AI</Text>

            <TouchableOpacity style={stylesMobile.selectBtn}>
              <Text style={stylesMobile.selectText}>Select Patient</Text>
            </TouchableOpacity>

            {/* Stepper */}
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
                        completed && stylesMobile.completedCircle, // ✅ NEW
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
                      {item === 2 && "AI Analysis & Review\nSuggestions"}
                      {item === 3 && "Download\nUpdated File"}
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
                  Upload your insurance {"\n"}claim and save money
                </Text>

                <Text style={stylesMobile.subText}>
                  kokoro.doctor AI will auto-extract all codes {"\n"}from these
                  document
                </Text>

                <View style={stylesMobile.bulletWrapper}>
                  <Text style={stylesMobile.bullet}>
                    • Both documents are mandatory
                  </Text>
                  <Text style={stylesMobile.bullet}>
                    • Analysis cannot begin without the claim document
                  </Text>
                  <Text style={stylesMobile.bullet}>
                    • Kokoro AI analyzes your claim directly
                  </Text>
                </View>

                <Text style={stylesMobile.label}>Insurance Claim Document</Text>
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

                {/* ✅ Uploaded text */}
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
                  <Text style={stylesMobile.buttonText}>
                    {isGenerating ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <ActivityIndicator color="#fff" size="small" />
                        <Text style={stylesMobile.buttonText}>
                          Generating...
                        </Text>
                      </View>
                    ) : (
                      <Text style={stylesMobile.buttonText}>
                        Generate with AI
                      </Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // 🔵 STEP 2 → AI RESULT UI
              <View style={stylesMobile.resultCard}>
                <Text style={stylesMobile.resultTitle}>Kokoro AI Analysis</Text>

                <Text style={stylesMobile.resultSub}>
                  review all sections, then accept suggestions you approve
                </Text>

                {analysisData?.structured_data ? (
                  <>
                    <Text style={stylesMobile.blueLabel}>
                      📄{" "}
                      {analysisData?.structured_data?.source_filename ||
                        "Insurance_Claim.pdf"}
                    </Text>

                    <View style={stylesMobile.resultBox}>
                      <ScrollView
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={{ paddingBottom: 10 }}
                      >
                        {/* Patient Details */}
                        <Text style={stylesMobile.sectionTitle}>
                          Patient Details
                        </Text>
                        <Text style={stylesMobile.text}>
                          Patient Name:{" "}
                          {analysisData.structured_data.patient_details?.name ||
                            "N/A"}
                        </Text>
                        <Text style={stylesMobile.text}>
                          Age:{" "}
                          {analysisData.structured_data.patient_details?.age ||
                            "N/A"}
                        </Text>
                        <Text style={stylesMobile.text}>
                          Gender:{" "}
                          {analysisData.structured_data.patient_details
                            ?.gender || "N/A"}
                        </Text>

                        {/* Insurance Details */}
                        <Text style={stylesMobile.sectionTitle}>
                          Insurance Details
                        </Text>
                        <Text style={stylesMobile.text}>
                          Company:{" "}
                          {analysisData.structured_data.insurance_details
                            ?.insurance_company || "N/A"}
                        </Text>
                        <Text style={stylesMobile.text}>
                          Policy:{" "}
                          {analysisData.structured_data.insurance_details
                            ?.policy_name || "N/A"}
                        </Text>
                        <Text style={stylesMobile.text}>
                          Policy No:{" "}
                          {analysisData.structured_data.insurance_details
                            ?.policy_number || "N/A"}
                        </Text>

                        {/* Claim Details */}
                        <Text style={stylesMobile.sectionTitle}>
                          Claim Details
                        </Text>
                        <Text style={stylesMobile.text}>
                          Treatment:{" "}
                          {analysisData.structured_data.claim_details
                            ?.treatment || "N/A"}
                        </Text>
                        <Text style={stylesMobile.text}>
                          Bill: ₹
                          {analysisData.structured_data.claim_details
                            ?.bill_amount || "0"}
                        </Text>
                        <Text style={stylesMobile.text}>
                          Claimed: ₹
                          {analysisData.structured_data.claim_details
                            ?.claimed_amount || "0"}
                        </Text>

                        {/* Summary */}
                        <Text style={stylesMobile.sectionTitle}>Summary</Text>
                        <Text style={stylesMobile.text}>
                          {analysisData.structured_data.document_summary ||
                            "No summary available"}
                        </Text>
                      </ScrollView>
                      <View style={stylesMobile.aiAssistantBox}>
                        <Text style={stylesMobile.aiAssistantText}>
                          Clinical AI Assistant
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <View style={stylesMobile.resultBox}>
                    <Text style={stylesMobile.text}>No data available</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={stylesMobile.acceptBtn}
                  onPress={() =>
                    navigation.navigate("HospitalInsuranceDownload", {
                      analysisData,
                    })
                  }
                >
                  <Text style={stylesMobile.acceptText}>Accept All</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* 🎯 Floating Button for AI Analysis Modal */}
          {currentStep === 1 && analysisData && (
            <TouchableOpacity
              style={stylesMobile.floatingBtn}
              onPress={openAiAnalysisModal}
            >
              <Image
                source={require("../../assets/HospitalPortal/Icon/blue_heart.png")}
                style={{
                  width: 65,
                  height: 65,
                  resizeMode: "cover",
                }}
              />
            </TouchableOpacity>
          )}
        </SafeAreaView>
      )}

      {/* 🎯 AI ANALYSIS MODAL - Mobile */}
      {aiAnalysisModalOpen && (
        <Animated.View
          style={[
            stylesMobile.aiAnalysisModal,
            { transform: [{ translateY: aiAnalysisSideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={stylesMobile.aiAnalysisHeader}>
            <View style={{ flexDirection: "column" }}>
              <Text style={stylesMobile.aiAnalysisTitle}>
                Kokoro AI Analysis
              </Text>
              <Text
                style={{ color: "#999999", fontSize: 14, fontWeight: "400" }}
              >
                You`&apos;`re not alone in this case, we`&apos;`re here to
                assist.
              </Text>
            </View>
            <TouchableOpacity onPress={closeAiAnalysisModal}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={stylesMobile.aiAnalysisContent}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {analysisData?.analysis ? (
              <>
                {/* Status */}
                <View style={stylesMobile.analysisSection}>
                  <Text style={stylesMobile.statusText}>
                    Status:{" "}
                    {analysisData?.analysis?.is_complete
                      ? "✅ Complete"
                      : "❌ Incomplete"}
                  </Text>
                </View>

                {/* Missing Fields */}
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

                {/* Issues */}
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

                {/* Suggestions */}
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

                {/* Claim Opportunity */}
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

  header: {
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "95%",
    alignSelf: "center",
    zIndex: 5,

    height: "85vh", // ✅ FIX: limit height
    overflow: "hidden", // ✅ prevents overflow outside card
  },

  titleTopSection: {
    height: 52,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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
    backgroundColor: "#16a34a", // green when done
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

  /* ── MIDDLE INFO ── */
  // middleTextBox: {
  //   alignSelf: "center",
  //   alignItems: "center",
  //   marginTop: 20,
  //   marginBottom: 10,
  // },
  middleTextBox: {
    marginTop: "1.5%",
    marginBottom: 10,
    width: "50%", // ✅ important
    //borderWidth:1,
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

  /* ── BULLET POINTS ── */
  // uploadDocumentsDetailBox: {
  //   alignSelf: "center",
  //   marginBottom: 16,
  //   marginTop: 8,
  // },
  uploadDocumentsDetailBox: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: "2%",
    width: "50%", // ✅ important
    //borderWidth:1,
    marginRight: "13%",
  },

  bulletText: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 6,
    lineHeight: 18,
    fontWeight: "500",
  },

  /* ── UPLOAD ── */
  // uploadRow: {
  //   alignItems: "center",
  //   marginBottom: 16,
  // },
  uploadRow: {
    alignItems: "center",
    width: "50%", // ✅ important
    //borderWidth:1,
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

  /* ── BUTTON ── */
  button: {
    marginTop: "3%",
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginRight: "13%",
    //alignSelf: "center",
  },

  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  topSection: {
    //borderWidth: 1,
    height: "70vh",
    width: "79%",
    //padding: 10,
  },
  reviewTitleTopSection: {
    borderWidth: 1,
    height: "10%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: "#b9b9b9ff",
  },
  topText: {
    color: "#025AE0",
    marginLeft: "2%",
    fontSize: 19,
    fontWeight: "600",
  },
  topBottomText: {
    color: "#7c7c7cff",
    fontSize: 14,
    //fontWeight: "400",
  },
  topBtns: {
    //borderWidth: 1,
    height: "100%",
    width: "30%",
  },
  // reviewMiddleSection: {
  //   borderWidth: 2,
  //   height: "85%",
  //   width: "100%",
  //   borderColor: "#a20505ff",
  //   flexDirection: "row",
  // },
  reviewMiddleSection: {
    //borderWidth: 2,
    width: "100%",
    borderColor: "#a20505ff",
    flexDirection: "row",
    height: "88%",
    marginTop: "1%",
  },
  // reviewSectionUploadedInsurance: {
  //   borderWidth: 1,
  //   height: "100%",
  //   width: "40%",
  //   borderColor: "#251e8eff",
  // },
  reviewSectionUploadedInsurance: {
    borderWidth: 1,
    width: "40%",
    borderColor: "#cbcacaff",
    minHeight: 200, // 👈 important for scroll feel
  },
  aiAnalysisSection: {
    borderWidth: 1,
    width: "60%",
    borderColor: "#cbcacaff",
    minHeight: 200,
  },
  generateUpdatedButton: {
    borderWidth: 1,
    height: "7%",
    width: "15%",
    marginLeft: "0.5%",
    marginTop: "1%",
    alignItems: "center",
    backgroundColor: "#E2EEFF",
    borderRadius: 8,
    borderColor: "#025AE0",
  },
  generateBtnText: {
    marginTop: "4%",
    color: "#025AE0",
  },
});
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
    paddingLeft: "2% ",
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
    gap: 6, // 🔥 important
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
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: "#D1D5DB",
    zIndex: 0,
  },

  activeCircle: {
    backgroundColor: "#2563EB",
  },

  activeCircleText: {
    color: "#fff",
  },
  uploadedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -10,
    marginBottom: 10,
    gap: 6,
  },

  uploadedText: {
    fontSize: 11,
    color: "#6B7280",
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
    padding: 16,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },

  resultSub: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },

  resultBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    maxHeight: 300, // ✅ IMPORTANT (adjust as needed)
  },

  blueLabel: {
    backgroundColor: "#E0EDFF",
    color: "#2563EB",
    padding: 6,
    marginBottom: 10,
    fontSize: 12,
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
    marginTop: 16,
    alignItems: "center",
  },

  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
  completedCircle: {
    backgroundColor: "#2563EB", // same blue
  },

  completedText: {
    color: "#fff",
  },

  /* ── FLOATING BUTTON ── */
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

  /* ── AI ANALYSIS MODAL ── */
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
  resultWrapper: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    maxHeight: 320,
    overflow: "hidden",
    position: "relative",
  },

  aiAssistantBox: {
    position: "absolute",
    bottom: -18, // 🔥 overlaps like your UI
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
  },

  aiAssistantText: {
    fontSize: 13,
    color: "#6366F1",
    fontWeight: "500",
  },
});

export default HospitalInsuranceClaim;
