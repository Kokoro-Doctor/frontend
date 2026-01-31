import React, { useCallback, useState, useContext } from "react";
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
} from "react-native";

import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
//import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import BackButton from "../../components/PatientScreenComponents/BackButton";
import { extractStructuredData } from "../../utils/MedilockerService";
import * as DocumentPicker from "expo-document-picker";

const { width, height } = Dimensions.get("window");

const Prescription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { setChatbotConfig } = useChatbot();
  const { user } = useContext(AuthContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  console.log("user", user);
  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig])
  );

  const fileInputRef = React.useRef(null);

  // Create file input element for web
  React.useEffect(() => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt";
      input.style.display = "none";

      input.addEventListener("change", (e) => {
        try {
          if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            console.log(
              "[FileInput] Files selected:",
              files.length,
              files.map((f) => f.name)
            );
            setUploadedFiles((prev) => {
              const updated = [...prev, ...files];
              console.log("[FileInput] Total files now:", updated.length);
              return updated;
            });
            // Reset input value so the same file can be selected again
            input.value = "";
          }
        } catch (error) {
          console.error("[FileInput] Error handling file selection:", error);
        }
      });

      document.body.appendChild(input);
      fileInputRef.current = input;

      return () => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };
    }
  }, []);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: "*/*", // Allow all file types
    });

    if (!result.canceled) {
      const files = result.assets.map((f) => ({
        uri: f.uri,
        name: f.name,
        size: f.size,
        type: f.mimeType,
      }));
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  // Convert File object to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result;
          // Extract base64 string (remove data:type;base64, prefix)
          const base64String = result.split(",")[1];
          resolve(base64String);
        } catch (parseError) {
          console.error(
            "[fileToBase64] Error parsing base64 result:",
            parseError
          );
          reject(
            new Error(`Failed to parse base64 result: ${parseError.message}`)
            // try {
            //   // Check if this is a mobile file (from DocumentPicker) or web file
            //   if (file.uri) {
            //     // Mobile file - use fetch to read from URI
            //     console.log(
            //       "[fileToBase64] Mobile file detected, reading from URI:",
            //       file.uri
          );
          //   fetch(file.uri)
          //     .then((response) => response.blob())
          //     .then((blob) => {
          //       const reader = new FileReader();
          //       reader.onload = () => {
          //         try {
          //           const result = reader.result;
          //           const base64String = result.split(",")[1];
          //           console.log(
          //             "[fileToBase64] Mobile file converted successfully"
          //           );
          //           resolve(base64String);
          //         } catch (parseError) {
          //           console.error(
          //             "[fileToBase64] Error parsing base64 result:",
          //             parseError
          //           );
          //           reject(
          //             new Error(
          //               `Failed to parse base64 result: ${parseError.message}`
          //             )
          //           );
          //         }
          //       };
          //       reader.onerror = (err) => {
          //         console.error("[fileToBase64] FileReader error:", err);
          //         reject(
          //           new Error(
          //             `Failed to read file "${file.name}": ${
          //               err.message || "Unknown error"
          //             }`
          //           )
          //         );
          //       };
          //       reader.readAsDataURL(blob);
          //     })
          //     .catch((fetchError) => {
          //       console.error("[fileToBase64] Fetch error:", fetchError);
          //       reject(
          //         new Error(
          //           `Failed to fetch file "${file.name}": ${fetchError.message}`
          //         )
          //       );
          //     });
          // } else {
          //   // Web file - use FileReader directly
          //   console.log("[fileToBase64] Web file detected");
          //   const reader = new FileReader();
          //   reader.onload = () => {
          //     try {
          //       const result = reader.result;
          //       const base64String = result.split(",")[1];
          //       console.log("[fileToBase64] Web file converted successfully");
          //       resolve(base64String);
          //     } catch (parseError) {
          //       console.error(
          //         "[fileToBase64] Error parsing base64 result:",
          //         parseError
          //       );
          //       reject(
          //         new Error(
          //           `Failed to parse base64 result: ${parseError.message}`
          //         )
          //       );
          //     }
          //   };
          //   reader.onerror = (err) => {
          //     console.error("[fileToBase64] FileReader error:", {
          //       error: err,
          //       filename: file.name,
          //     });
          //     reject(
          //       new Error(
          //         `Failed to read file "${file.name}": ${
          //           err.message || "Unknown error"
          //         }`
          //       )
          //     );
          //   };
          //   reader.readAsDataURL(file);
        }
      };
      reader.onerror = (err) => {
        console.error("[fileToBase64] FileReader error:", {
          error: err,
          filename: file.name,
        });
        reject(
          new Error(
            `Failed to read file "${file.name}": ${
              err.message || "Unknown error"
            }`
          )
        );
      };

      try {
        reader.readAsDataURL(file);
      } catch (readError) {
        console.error("[fileToBase64] Error starting file read:", readError);
        reject(
          new Error(
            `Failed to start reading file "${file.name}": ${readError.message}`
          )
        );
        // } catch (error) {
        //   console.error("[fileToBase64] Unexpected error:", error);
        //   reject(new Error(`Unexpected error: ${error.message}`));
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    // Clear prescription if no files left
    if (uploadedFiles.length === 1) {
      setGeneratedPrescription(null);
    }
  };

  // Extract structured data from files
  const extractFromFiles = async (files) => {
    if (files.length === 0) {
      console.warn("⚠️ [extractFromFiles] No files provided");
      return;
    }

    console.log("[extractFromFiles] Starting extraction process...");
    console.log("[extractFromFiles] Number of files:", files.length);
    files.forEach((file, index) => {
      console.log(`[extractFromFiles] File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });

    setIsGenerating(true);
    try {
      // Convert files to base64 format
      console.log("[extractFromFiles] Converting files to base64...");
      const filesWithBase64 = await Promise.all(
        files.map(async (file, index) => {
          try {
            console.log(
              `[extractFromFiles] Converting file ${index + 1}: ${file.name}`
            );
            const base64Content = await fileToBase64(file);
            console.log(
              `[extractFromFiles] File ${
                index + 1
              } converted successfully, base64 length:`,
              base64Content?.length || 0
            );
            return {
              filename: file.name,
              content: base64Content,
            };
          } catch (fileError) {
            console.error(
              `[extractFromFiles] Error converting file ${index + 1} (${
                file.name
              }):`,
              fileError
            );
            throw new Error(
              `Failed to convert file "${file.name}": ${fileError.message}`
            );
          }
        })
      );

      console.log(
        "[extractFromFiles] All files converted. Calling extraction API..."
      );
      // Call extraction API
      const result = await extractStructuredData(filesWithBase64);

      console.log("[extractFromFiles] Extraction API call successful");
      console.log(
        "[extractFromFiles] Full result object:",
        JSON.stringify(result, null, 2)
      );
      console.log("[extractFromFiles] Extracted data:", {
        hasPrescription: !!result.prescription,
        prescriptionLength: result.prescription?.length || 0,
        prescriptionValue: result.prescription,
        resultKeys: Object.keys(result || {}),
      });

      // Check if prescription exists in result
      const prescriptionText =
        result?.prescription || result?.data?.prescription || "";

      if (!prescriptionText) {
        console.error(
          "[extractFromFiles] WARNING: No prescription found in result!",
          {
            result: result,
            resultKeys: Object.keys(result || {}),
          }
        );
      }

      // Extract patient details from API response if available
      const patientDetails = result?.patient_details || {};
      const patientName = patientDetails?.name || "";
      const patientAge =
        patientDetails?.age !== null && patientDetails?.age !== undefined
          ? String(patientDetails.age)
          : "";
      const patientGender = patientDetails?.gender || "";
      const patientDiagnosis = patientDetails?.diagnosis || "";

      console.log("[extractFromFiles] Patient details extracted:", {
        hasPatientDetails: !!result?.patient_details,
        patientName,
        patientAge,
        patientGender,
        patientDiagnosis,
      });

      // Update prescription with extracted data
      const prescription = {
        clinicName: "Kokoro.Doctor",
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

        patientName: patientName,
        age: patientAge,
        gender: patientGender,
        diagnosis: patientDiagnosis,
        diagnosisDate: "",
        prescriptionReport: prescriptionText,
      };

      console.log("[extractFromFiles] Prescription object created:", {
        hasPrescriptionReport: !!prescription.prescriptionReport,
        prescriptionReportLength: prescription.prescriptionReport?.length || 0,
        prescriptionReportPreview:
          prescription.prescriptionReport?.substring(0, 100) || "EMPTY",
      });

      setGeneratedPrescription(prescription);
      console.log(
        "[extractFromFiles] Extraction process completed successfully"
      );
      
      // Navigate to preview screen after generation
      navigation.navigate("PrescriptionPreview", {
        generatedPrescription: prescription,
      });
    } catch (error) {
      console.error("[extractFromFiles] Error in extraction process:", {
        name: error.name,
        message: error.message,
        userFriendlyMessage: error.userFriendlyMessage,
        originalMessage: error.originalMessage,
        status: error.status,
        details: error.details,
        stack: error.stack,
      });

      // Show user-friendly error message
      const errorMessage =
        error.userFriendlyMessage ||
        error.message ||
        "Failed to extract prescription data. Please try again.";
      alert(errorMessage);

      // Also log to console for debugging
      console.error("[extractFromFiles] Full error object:", error);
    } finally {
      setIsGenerating(false);
      console.log(
        "[extractFromFiles] Extraction process finished (success or error)"
      );
    }
  };

  const handleGeneratePrescription = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file");
      return;
    }

    await extractFromFiles(uploadedFiles);
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require("../../assets/DoctorsPortal/Images/DoctorDashboard.png")}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <View style={styles.parent}>
                <View style={styles.Left}>
                  <NewestSidebar navigation={navigation} />
                </View>
                <View style={styles.Right}>
                  <HeaderLoginSignUp navigation={navigation} />
                  <BackButton />
                  <ScrollView style={styles.contentContainer}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                      <Text style={styles.headerTitle}>
                        Generate Prescription
                      </Text>
                      <TouchableOpacity
                        style={styles.subscriberButton}
                        onPress={() =>
                          navigation.navigate("DoctorAppNavigation", {
                            screen: "DoctorsSubscribers",
                          })
                        }
                      >
                        <Text style={styles.subscriberButtonText}>
                          Select your subscriber
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Main Content */}
                    <View style={styles.mainContent}>
                      {/* Left Section - File Upload */}
                      <View style={styles.leftSection}>
                        {/* Icon and Title */}
                        <View style={styles.iconTitleContainer}>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/Prescription-icon.png")}
                            style={styles.prescriptionIcon}
                          />
                          <Text style={styles.sectionTitle}>
                            Add Report & Get AI
                          </Text>
                        </View>

                        {/* Description */}
                        <Text style={styles.descriptionText}>
                          Upload reports or sync from Medilocker and let AI
                          create a suggested prescription
                        </Text>

                        {/* Features List */}
                        <View style={styles.featuresContainer}>
                          <View style={styles.featureItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.featureText}>
                              Auto-analysis of past history
                            </Text>
                          </View>
                          <View style={styles.featureItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.featureText}>
                              AI-generated medicine + test
                            </Text>
                          </View>
                          <View style={styles.featureItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.featureText}>
                              Instant risk scoring
                            </Text>
                          </View>
                        </View>

                        {/* File Upload Area */}
                        <View style={styles.uploadContainer}>
                          <View
                            style={styles.uploadArea}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            <input
                              type="file"
                              multiple
                              style={{ display: "none" }}
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                            />

                            <TouchableOpacity
                              style={styles.uploadButton}
                              onPress={() => fileInputRef.current?.click()}
                            >
                              <Image
                                source={require("../../assets/DoctorsPortal/Icons/send_Icon.png")}
                                style={styles.uploadIcon}
                              />
                              <Text style={styles.uploadButtonText}>
                                click to upload documents
                              </Text>
                            </TouchableOpacity>

                            {/* File Chips - Horizontal Scroll */}
                            {uploadedFiles.length > 0 && (
                              <View style={styles.fileChipsWrapper}>
                                <ScrollView
                                  horizontal
                                  showsHorizontalScrollIndicator={false}
                                  style={styles.fileChipsScrollView}
                                  contentContainerStyle={
                                    styles.fileChipsContainer
                                  }
                                >
                                  {uploadedFiles.map((file, index) => (
                                    <View key={index} style={styles.fileChip}>
                                      <Text
                                        style={styles.fileChipText}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                      >
                                        {file.name}
                                      </Text>
                                      <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeFile(index)}
                                      >
                                        <Text style={styles.removeButtonText}>
                                          ×
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  ))}
                                </ScrollView>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Generate Button */}
                        <TouchableOpacity
                          style={[
                            styles.generateButton,
                            (isGenerating || uploadedFiles.length === 0) &&
                              styles.generateButtonDisabled,
                          ]}
                          onPress={handleGeneratePrescription}
                          disabled={isGenerating || uploadedFiles.length === 0}
                        >
                          <Text style={styles.generateButtonText}>
                            {isGenerating
                              ? "Generating..."
                              : "Generate with AI"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  </ScrollView>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}

      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView
          style={stylesMobile.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View
            style={[
              stylesMobile.header,
              // Platform.OS === "web" ? { height: "auto" } : { height: "auto" },
            ]}
          >
            <HeaderLoginSignUp navigation={navigation} />
          </View>
          <View
            style={[
              stylesMobile.headers,
              Platform.OS === "web"
                ? { marginTop: "auto" }
                : { marginTop: "12%" },
            ]}
          >
            <View style={stylesMobile.headerRow}>
              <Text style={stylesMobile.headerTitle}>
                Generate Prescription
              </Text>
            </View>

            <TouchableOpacity
              style={stylesMobile.subscriberBtn}
              onPress={() =>
                navigation.navigate("DoctorAppNavigation", {
                  screen: "DoctorsSubscribers",
                })
              }
            >
              <Text style={stylesMobile.subscriberText}>
                Select your subscriber
              </Text>
            </TouchableOpacity>
          </View>

          {/* MAIN CARD */}
          <View style={stylesMobile.card}>
              <View style={{ marginTop: "6%", marginBottom: "6%" }}>
                <Image
                  source={require("../../assets/DoctorsPortal/Icons/Prescription-icon.png")}
                  style={stylesMobile.aiIcon}
                />
              </View>

              <Text style={stylesMobile.cardTitle}>Add Report & Get AI</Text>

              <View style={{ marginBottom: "3%", marginTop: "3%" }}>
                <Text style={stylesMobile.cardDesc}>
                  Upload reports or sync from Medilocker
                </Text>
                <Text style={stylesMobile.cardDesc}>
                  and let AI create a suggested
                </Text>
              </View>

              {/* FEATURES */}
              <View style={stylesMobile.features}>
                <Text style={stylesMobile.feature}>
                  Auto-analysis of past history
                </Text>
                <Text style={stylesMobile.feature}>
                  AI-generated medicine + test
                </Text>
                <Text style={stylesMobile.feature}>Instant risk scoring</Text>
              </View>

              {/* UPLOAD BOX */}
              <View style={stylesMobile.uploadContainers}>
                <View
                  style={stylesMobile.uploadAreas}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <TouchableOpacity
                    style={stylesMobile.uploadButtons}
                    onPress={() => {
                      if (Platform.OS === "web") {
                        console.log("web - nik");
                        fileInputRef.current?.click();
                      } else {
                        console.log("pickDocument - nik");
                        pickDocument();
                      }
                    }}
                  >
                    <View style={stylesMobile.plusCircle}>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/plusSign.png")}
                        style={styles.statIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={stylesMobile.uploadText}>
                      just upload Document and generate
                    </Text>
                    <Text style={stylesMobile.uploadText}>prescription</Text>
                  </TouchableOpacity>

                  {/* File Chips - Horizontal Scroll */}
                  {uploadedFiles.length > 0 && (
                    <View style={styles.fileChipsWrapper}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.fileChipsScrollView}
                        contentContainerStyle={stylesMobile.fileChipsContainer}
                      >
                        {uploadedFiles.map((file, index) => (
                          <View key={index} style={styles.fileChip}>
                            <Text
                              style={styles.fileChipText}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {file.name}
                            </Text>
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removeFile(index)}
                            >
                              <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  (isGenerating || uploadedFiles.length === 0) &&
                    styles.generateButtonDisabled,
                ]}
                onPress={handleGeneratePrescription}
                disabled={isGenerating || uploadedFiles.length === 0}
              >
                <Text style={stylesMobile.generateBtnText}>
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Text>
              </TouchableOpacity>
            </View>
        </ScrollView>
      )}
    </>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
  },
  imageContainer: {
    height: "100%",
    width: "100%",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    opacity: 80,
    alignSelf: "center",
    flexDirection: "column",
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
    height: "100%",
    width: "85%",
  },
  contentContainer: {
    flex: 1,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 32,
    borderRadius: 12,
    overflow: "hidden",
    width: "92%",
    marginHorizontal: "4%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    display: "flex",
    flexDirection: "column",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: "Poppins",
    fontSize: 28,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.5,
  },
  subscriberButton: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#FF7072",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  subscriberButtonText: {
    color: "#FF7072",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  mainContent: {
    flexDirection: "row",
    padding: 24,
    gap: 24,
    flex: 1,
    minHeight: 0,
  },
  leftSection: {
    backgroundColor: "#FFF8F8",
    borderRadius: 12,
    padding: 24,
    flex: 1,
  },
  leftSectionWithPrescription: {
    flex: 0.7,
  },
  iconTitleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  prescriptionIcon: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "600",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  descriptionText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Poppins",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF7072",
  },
  featureText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins",
    flex: 1,
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    borderColor: "#D0D0D0",
    backgroundColor: "#FFFFFF",
    padding: 24,
    minHeight: 180,
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadButtonText: {
    color: "#5B5B5B",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Poppins",
    marginBottom: 6,
  },
  uploadHintText: {
    color: "#878787",
    fontSize: 13,
    fontWeight: "300",
    fontFamily: "Poppins",
  },
  fileChipsWrapper: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  fileChipsScrollView: {
    flexGrow: 0,
  },
  fileChipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 8,
  },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    maxWidth: 280,
    position: "relative",
    borderWidth: 1,
    borderColor: "#E1E4E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexShrink: 0,
  },
  fileChipText: {
    color: "#24292E",
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Poppins",
    marginRight: 6,
    flexShrink: 1,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF7072",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    flexShrink: 0,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: -1,
  },
  generateButton: {
    borderRadius: 10,
    backgroundColor: "#FF7072",
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#FF7072",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: "#FFB3B5",
    shadowOpacity: 0.1,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  rightSection: {
    minHeight: 0,
    flex: 1,
  },
  rightSectionWithPrescription: {
    flex: 1.3,
    maxWidth: 600,
    flexDirection: "column",
  },
  prescriptionScrollView: {
    flex: 1,
    minHeight: 0,
  },
  prescriptionScrollContent: {
    paddingBottom: 20,
  },
  prescriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  clinicName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF7072",
    fontFamily: "Poppins",
    letterSpacing: 0.5,
  },
  clinicNameInput: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF7072",
    fontFamily: "Poppins",
    letterSpacing: 0.5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
  },
  patientSummaryBadgeContainer: {
    alignItems: "flex-end",
  },
  dateDoctorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    fontFamily: "Poppins",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  doctorInfoContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  doctorNameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    fontFamily: "Poppins",
    textAlign: "right",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#888888",
    fontFamily: "Poppins",
    textAlign: "right",
  },
  editRowInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editLabelInline: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    fontFamily: "Poppins",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editInputInline: {
    fontSize: 15,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FAFAFA",
    minWidth: 150,
  },
  editInputSpecialty: {
    fontSize: 13,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FAFAFA",
    textAlign: "right",
    minWidth: 150,
    marginTop: 4,
  },
  editButton: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#FF7072",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  editButtonOutside: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#FF7072",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    marginTop: 16,
  },
  editButtonText: {
    color: "#FF7072",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  dateDoctorSection: {
    marginBottom: 16,
    gap: 6,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888888",
    fontFamily: "Poppins",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  patientDetailsContainer: {
    flexDirection: "column",
    gap: 20,
    marginBottom: 16,
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    gap: 16,
  },
  detailItemHalf: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    fontFamily: "Poppins",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    minWidth: 100,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "400",
    color: "#333333",
    fontFamily: "Poppins",
    lineHeight: 20,
    width: "100%",
  },
  detailInput: {
    fontSize: 15,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    width: "100%",
    minHeight: 44,
  },
  detailInputInline: {
    fontSize: 15,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    flex: 1,
    minHeight: 60,
    textAlignVertical: "top",
  },
  rxContainer: {
    marginTop: 8,
  },
  rxSection: {
    marginTop: 8,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rxTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF7072",
    fontFamily: "Poppins",
    letterSpacing: 0.5,
    alignSelf: "flex-start",
  },
  rxItem: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  rxBullet: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF7072",
    fontFamily: "Poppins",
    marginTop: 2,
    lineHeight: 22,
  },
  rxText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#555555",
    fontFamily: "Poppins",
    flex: 1,
    lineHeight: 22,
  },
  rxInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
    minHeight: 50,
    textAlignVertical: "top",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    fontFamily: "Poppins",
    minWidth: 80,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
  },
  editTextArea: {
    flex: 1,
    fontSize: 14,
    fontWeight: "400",
    color: "#000000",
    fontFamily: "Poppins",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
    minHeight: 60,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  cancelButton: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  saveButton: {
    borderRadius: 8,
    backgroundColor: "#FF7072",
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#FF7072",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins",
  },
});
const stylesMobile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  headers: {
    paddingTop: 16,
    paddingBottom: 12,
    marginLeft: "3%",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },

  subscriberBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FF7072",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: "6%",
  },

  subscriberText: {
    fontSize: 14,
    color: "#FF7072",
    fontWeight: "500",
  },

  card: {
    flex: 1,
    width: "100%",
    // height: "auto",
    // ...Platform.select({
    //   android: {
    //     height: "100%",
    //     borderWidth: 1,
    //   },
    // }),
    backgroundColor: "#FFF8F8",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    alignItems: "center",
  },

  aiIcon: {
    width: 40,
    height: 40,
    alignSelf: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: "3%",
  },

  cardDesc: {
    fontSize: 14,
    color: "#444444",
    fontWeight: "400",
    textAlign: "center",
  },

  features: {
    // marginBottom: 16,
    marginTop: "3%",
    marginBottom: "3%",
    alignItems: "flex-start",
  },

  feature: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    marginBottom: 6,
  },
  uploadContainers: {
    marginTop: "4%",
    marginBottom: "4%",
  },
  uploadBox: {
    borderStyle: "dashed",
    borderColor: "#9B9A9A",
    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
    marginTop: "3%",
    // paddingHorizontal: 20,
    // paddingVertical: 12,
    width: "90%",
    // height: "10%",
    borderWidth: 2,
  },

  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  plus: {
    fontSize: 22,
    color: "#FF7072",
    fontWeight: "600",
  },

  uploadText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#878787",
    textAlign: "center",
  },
  fileChipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 8,
  },
  fileList: {
    marginTop: 12,
  },

  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  uploadAreas: {
    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
    marginTop: "3%",
    // paddingHorizontal: 20,
    // paddingVertical: 12,
    width: "100%",
    height: "78%",
    ...Platform.select({
      android: {
        height: "60%",
      },
    }),
  },
  uploadButtons: {
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 55,
    borderStyle: "dashed",
    borderColor: "#9B9A9A",
  },
  fileName: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
    color: "#333",
  },

  remove: {
    fontSize: 18,
    color: "#FF7072",
    fontWeight: "600",
  },

  generateBtn: {
    backgroundColor: "#FF707280",
    width: "60%",
    borderRadius: 24,
    paddingVertical: 16,
    marginBottom: "4%",
  },

  generateBtnDisabled: {
    backgroundColor: "#FFCCCC",
  },

  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  prescriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  clinicName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF7072",
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF7072",
    marginBottom: 8,
  },
  rxText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  editBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FF7072",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  editBtnText: {
    color: "#FF7072",
    fontWeight: "500",
  },
  prescriptionWrapper: {
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingLeft: 16,
    // paddingRight: 16,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIcon: {
    width: 35,
    height: 35,
  },

  logoText: {
    // marginTop:"1%",

    fontSize: 16,
    fontWeight: "900",
    color: "#00000075",
  },

  summaryBadge: {
    height: 40,
    width: 160,
    alignItems: "flex-end",
    backgroundColor: "#FFF0F0",
    borderBottomLeftRadius: 50,
    // paddingHorizontal: 12,
    // paddingVertical: 6,
    // borderRadius: 20,
  },
  summaryBadgeContent: {
    height: 30,
    width: 130,
    backgroundColor: "#FF7072",
    borderBottomLeftRadius: 40,
    paddingTop: "3%",
    alignItems: "center",
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
    fontWeight: "500",
    color: "#000000",
  },
  secondText: {
    color: "#555555",
    fontSize: 12,
    fontWeight: "400",
  },

  divider: {
    marginRight: 16,
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
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
  },

  rxLabel: {
    color: "#FF7072",
    fontWeight: "500",
    marginTop: "6%",
    marginBottom: "2%",
  },

  rxBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 12,
    marginRight: 16,
    minHeight: 140,
    maxHeight: 300,
  },

  rxText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
  },

  approveBtn: {
    alignSelf: "center",
    width: "70%",
    backgroundColor: "#FF7072",
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
  mobileClinicNameInput: {
    fontSize: 16,
    fontWeight: "900",
    color: "#00000075",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FAFAFA",
    flex: 1,
    marginLeft: 6,
  },
  mobileEditInputInline: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FAFAFA",
    minWidth: 80,
  },
  mobileEditInputSpecialty: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FAFAFA",
    marginRight: 16,
    marginTop: 4,
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
    minHeight: 100,
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
    shadowColor: "#FF7072",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default Prescription;
