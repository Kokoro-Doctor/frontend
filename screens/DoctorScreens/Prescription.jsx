import React, { useCallback, useState } from "react";
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
} from "react-native";

import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import { extractStructuredData } from "../../utils/MedilockerService";

const { width, height } = Dimensions.get("window");

const Prescription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { setChatbotConfig } = useChatbot();
  const { user } = useContext(AuthContext);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState(null);

  console.log("user", user);
  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig])
  );

  const fileInputRef = React.useRef(null);

  // Format prescription text: replace "-" with bullet points (•)
  const formatPrescriptionText = (text) => {
    if (!text) return "";
    // Replace "- " at the start of lines with "• " (bullet point)
    // Also handle cases where there might be spaces before the dash
    return text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        // Replace "- " at the start with "• "
        if (trimmed.startsWith("- ")) {
          return "• " + trimmed.substring(2);
        }
        // Replace "-" at the start (without space) with "• "
        if (trimmed.startsWith("-")) {
          return "• " + trimmed.substring(1).trim();
        }
        return line;
      })
      .join("\n");
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
          );
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
      setIsEditMode(false);
      console.log(
        "[extractFromFiles] Extraction process completed successfully"
      );
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

  const handleEditPrescription = () => {
    // Initialize with current prescription and doctor info from auth
    const doctorName = user?.name || user?.doctorname || "";
    const doctorSpecialty = user?.specialization || "";

    setEditedPrescription({
      ...generatedPrescription,
      doctorName: doctorName,
      doctorSpecialty: doctorSpecialty,
    });
    setIsEditMode(true);
  };

  const handleSavePrescription = () => {
    if (editedPrescription) {
      // Remove doctor info from saved prescription as it comes from auth context
      const { doctorName, doctorSpecialty, ...prescriptionToSave } =
        editedPrescription;
      setGeneratedPrescription(prescriptionToSave);
      setIsEditMode(false);
      // TODO: Add API call to save prescription
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedPrescription(null);
  };

  const updatePrescriptionField = (field, value) => {
    setEditedPrescription((prev) => ({
      ...prev,
      [field]: value,
    }));
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

                  <View style={styles.contentContainer}>
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
                      <View
                        style={[
                          styles.leftSection,
                          generatedPrescription &&
                            styles.leftSectionWithPrescription,
                        ]}
                      >
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

                      {/* Right Section - Prescription Preview */}
                      {generatedPrescription && (
                        <View
                          style={[
                            styles.rightSection,
                            styles.rightSectionWithPrescription,
                          ]}
                        >
                          <ScrollView
                            style={styles.prescriptionScrollView}
                            contentContainerStyle={
                              styles.prescriptionScrollContent
                            }
                            showsVerticalScrollIndicator={true}
                          >
                            <View style={styles.prescriptionCard}>
                              {/* Top Header Row - Logo  */}
                              <View style={styles.topHeaderRow}>
                                {/* Left: Logo + Kokoro.Doctor Text */}
                                <View style={styles.logoContainer}>
                                  <Image
                                    source={require("../../assets/DoctorsPortal/Images/KokoroLogo.png")}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                  />
                                  <Text style={styles.clinicName}>
                                    Kokoro.Doctor
                                  </Text>
                                </View>
                              </View>

                              {/* Date and Doctor Row */}
                              <View style={styles.dateDoctorRow}>
                                {/* Left: Date */}
                                <View style={styles.dateContainer}>
                                  {isEditMode ? (
                                    <View style={styles.editRowInline}>
                                      <Text style={styles.editLabelInline}>
                                        Date :
                                      </Text>
                                      <TextInput
                                        style={styles.editInputInline}
                                        value={editedPrescription?.date || ""}
                                        onChangeText={(value) =>
                                          updatePrescriptionField("date", value)
                                        }
                                        placeholder="DD MMM YYYY"
                                        placeholderTextColor="#999999"
                                      />
                                    </View>
                                  ) : (
                                    <Text style={styles.dateText}>
                                      Date : {generatedPrescription.date}
                                    </Text>
                                  )}
                                </View>

                                {/* Right: Doctor Info */}
                                <View style={styles.doctorInfoContainer}>
                                  {isEditMode ? (
                                    <>
                                      <View style={styles.editRowInline}>
                                        <Text style={styles.editLabelInline}>
                                          DR :
                                        </Text>
                                        <TextInput
                                          style={styles.editInputInline}
                                          value={
                                            editedPrescription?.doctorName || ""
                                          }
                                          onChangeText={(value) =>
                                            updatePrescriptionField(
                                              "doctorName",
                                              value
                                            )
                                          }
                                          placeholder="Doctor Name"
                                          placeholderTextColor="#999999"
                                        />
                                      </View>
                                      <TextInput
                                        style={styles.editInputSpecialty}
                                        value={
                                          editedPrescription?.doctorSpecialty ||
                                          ""
                                        }
                                        onChangeText={(value) =>
                                          updatePrescriptionField(
                                            "doctorSpecialty",
                                            value
                                          )
                                        }
                                        placeholder="Specialty"
                                        placeholderTextColor="#999999"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <Text style={styles.doctorNameText}>
                                        DR :{" "}
                                        {user?.name || user?.doctorname || ""}
                                      </Text>
                                      <Text style={styles.specialtyText}>
                                        {user?.specialization || ""}
                                      </Text>
                                    </>
                                  )}
                                </View>
                              </View>

                              {/* Divider */}
                              <View style={styles.divider} />

                              {/* Patient Details - 2 Fields Per Row */}
                              <View style={styles.patientDetailsContainer}>
                                {/* Row 1: Patient Name + Age */}
                                <View style={styles.detailRow}>
                                  {/* Patient Name */}
                                  <View style={styles.detailItemHalf}>
                                    <Text style={styles.detailLabel}>
                                      Patient Name
                                    </Text>
                                    {isEditMode ? (
                                      <TextInput
                                        style={styles.detailInput}
                                        value={
                                          editedPrescription?.patientName || ""
                                        }
                                        onChangeText={(value) =>
                                          updatePrescriptionField(
                                            "patientName",
                                            value
                                          )
                                        }
                                        placeholder="Enter patient name"
                                        placeholderTextColor="#999999"
                                      />
                                    ) : (
                                      <Text style={styles.detailValue}>
                                        {generatedPrescription.patientName ||
                                          ""}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Age */}
                                  <View style={styles.detailItemHalf}>
                                    <Text style={styles.detailLabel}>Age</Text>
                                    {isEditMode ? (
                                      <TextInput
                                        style={styles.detailInput}
                                        value={editedPrescription?.age || ""}
                                        onChangeText={(value) =>
                                          updatePrescriptionField("age", value)
                                        }
                                        placeholder="Enter age"
                                        placeholderTextColor="#999999"
                                      />
                                    ) : (
                                      <Text style={styles.detailValue}>
                                        {generatedPrescription.age || ""}
                                      </Text>
                                    )}
                                  </View>
                                </View>

                                {/* Row 2: Gender + Diagnosis */}
                                <View style={styles.detailRow}>
                                  {/* Gender */}
                                  <View style={styles.detailItemHalf}>
                                    <Text style={styles.detailLabel}>
                                      Gender
                                    </Text>
                                    {isEditMode ? (
                                      <TextInput
                                        style={styles.detailInput}
                                        value={editedPrescription?.gender || ""}
                                        onChangeText={(value) =>
                                          updatePrescriptionField(
                                            "gender",
                                            value
                                          )
                                        }
                                        placeholder="Enter gender"
                                        placeholderTextColor="#999999"
                                      />
                                    ) : (
                                      <Text style={styles.detailValue}>
                                        {generatedPrescription.gender || ""}
                                      </Text>
                                    )}
                                  </View>

                                  {/* Diagnosis */}
                                  <View style={styles.detailItemHalf}>
                                    <Text style={styles.detailLabel}>
                                      Diagnosis
                                    </Text>
                                    {isEditMode ? (
                                      <TextInput
                                        style={styles.detailInput}
                                        value={
                                          editedPrescription?.diagnosis || ""
                                        }
                                        onChangeText={(value) =>
                                          updatePrescriptionField(
                                            "diagnosis",
                                            value
                                          )
                                        }
                                        placeholder="Enter diagnosis"
                                        placeholderTextColor="#999999"
                                        multiline
                                      />
                                    ) : (
                                      <Text style={styles.detailValue}>
                                        {generatedPrescription.diagnosis || ""}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              </View>

                              {/* RX Section - Full Width Box */}
                              <View style={styles.rxContainer}>
                                <Text style={styles.rxTitle}>RX</Text>
                                <View style={styles.rxSection}>
                                  {isEditMode ? (
                                    <TextInput
                                      style={styles.rxInput}
                                      value={
                                        editedPrescription?.prescriptionReport ||
                                        ""
                                      }
                                      onChangeText={(value) =>
                                        updatePrescriptionField(
                                          "prescriptionReport",
                                          value
                                        )
                                      }
                                      placeholder="Prescription Report"
                                      placeholderTextColor="#999999"
                                      multiline
                                    />
                                  ) : (
                                    <Text style={styles.rxText} multiline>
                                      {formatPrescriptionText(
                                        generatedPrescription.prescriptionReport
                                      ) || "No prescription report generated"}
                                    </Text>
                                  )}
                                </View>
                              </View>

                              {/* Save/Cancel Buttons */}
                              {isEditMode && (
                                <View style={styles.editActions}>
                                  <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancelEdit}
                                  >
                                    <Text style={styles.cancelButtonText}>
                                      Cancel
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSavePrescription}
                                  >
                                    <Text style={styles.saveButtonText}>
                                      Save
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </ScrollView>
                          {/* Edit Button - Outside Card, Bottom Left */}
                          {!isEditMode && (
                            <TouchableOpacity
                              style={styles.editButtonOutside}
                              onPress={handleEditPrescription}
                            >
                              <Text style={styles.editButtonText}>
                                Edit Prescription
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}
    </>
  );
};

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

export default Prescription;
