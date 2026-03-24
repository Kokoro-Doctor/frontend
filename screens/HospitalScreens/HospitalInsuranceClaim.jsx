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
} from "react-native";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import { API_URL } from "../../env-vars";

const HospitalInsuranceClaim = ({ navigation }) => {
  const [claimFiles, setClaimFiles] = useState([]);
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0); // 0 = upload, 1 = review
  const slideAnim = useState(new Animated.Value(0))[0];
  const cardWidth = width * 0.95;
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

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

      const userId = localStorage.getItem("user_id"); // 👈 dynamic
      const token = localStorage.getItem("token"); // 👈 if needed

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/medilocker/users/${userId}/insurance/analyze`,
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
                    <TouchableOpacity style={styles.patientButton}>
                      <Text style={styles.btnText}>Select Patient</Text>
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
                          <View
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

export default HospitalInsuranceClaim;
