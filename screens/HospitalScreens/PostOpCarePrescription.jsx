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

/** Web-safe alert: Alert.alert doesn't work on web, so use window.alert */
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
  body: {
    fontSize: 14,
    fontWeight: "300",
    color: "#555555",
    fontFamily: "Poppins",
  },
  strong: {
    fontWeight: "600",
    color: "#555555",
  },
};

const markdownStylesMobile = {
  body: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  strong: {
    fontWeight: "600",
    color: "#444",
  },
};

const PostOpCarePrescription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { user } = useContext(AuthContext);

  // Get prescription and patient user ID from route params
  const { generatedPrescription: initialPrescription, userId } =
    route.params || {};

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(
    initialPrescription || null,
  );

  // Debug logging and update state when route params change
  useEffect(() => {
    console.log("🔍 PrescriptionPreview - Route params:", route.params);
    console.log(
      "🔍 PrescriptionPreview - Initial prescription:",
      initialPrescription,
    );

    if (initialPrescription) {
      console.log("✅ Setting currentPrescription from route params");
      setCurrentPrescription(initialPrescription);
    } else {
      console.warn("⚠️ No prescription data in route params");
    }
  }, [route.params, initialPrescription]);

  const handleEditPrescription = () => {
    // Initialize with current prescription and doctor info from auth
    const doctorName = user?.name || user?.doctorname || "";
    const doctorSpecialty = user?.specialization || "";

    setEditedPrescription({
      ...currentPrescription,
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
      setCurrentPrescription(prescriptionToSave);
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

  const handleDownloadPrescription = async () => {
    await downloadPrescription(currentPrescription, user);
  };

  const handleApprovePrescription = async () => {
    console.log("[ApprovePrescription] Started", {
      userId,
      hasPrescription: !!currentPrescription,
    });

    if (!userId) {
      console.warn("[ApprovePrescription] Aborted: no userId");
      showAlert(
        "Cannot Save",
        "Patient ID is required to save prescription to Medilocker. This prescription was not generated from a patient's Medilocker.",
        [{ text: "OK" }],
      );
      return;
    }

    try {
      setIsSavingPrescription(true);
      console.log("[ApprovePrescription] Generating PDF...");
      const pdfBase64 = await generatePrescriptionPDFAsBase64(
        currentPrescription,
        user,
      );
      console.log("[ApprovePrescription] PDF generated", {
        base64Length: pdfBase64?.length,
        approxSizeKB: pdfBase64
          ? Math.round((pdfBase64.length * 3) / 4 / 1024)
          : 0,
      });

      console.log("[ApprovePrescription] Saving to Medilocker...");
      await savePrescriptionToMedilocker(userId, pdfBase64);
      console.log("[ApprovePrescription] Save succeeded");
      showAlert(
        "Success",
        "Prescription PDF has been saved to the patient's Medilocker. The patient can view and download it from their documents.",
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("[ApprovePrescription] Failed:", error);
      console.error("[ApprovePrescription] Error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });
      showAlert(
        "Save Failed",
        error.message ||
          "Failed to save prescription to Medilocker. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsSavingPrescription(false);
      console.log("[ApprovePrescription] Finished");
    }
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && <View></View>}

      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView
          style={stylesMobile.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={stylesMobile.header}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>

          <View style={stylesMobile.stepContainer}>
            {/* Line */}
            <View style={stylesMobile.stepLine} />

            {/* Steps Row */}
            <View style={stylesMobile.stepRow}>
              {/* Step 1 */}
              <View style={stylesMobile.stepItem}>
                <View style={stylesMobile.stepCircleActive}>
                  <Text style={stylesMobile.tick}>✓</Text>
                </View>
                <Text style={stylesMobile.stepText}>Upload{"\n"}Documents</Text>
              </View>

              {/* Step 2 */}
              <View style={stylesMobile.stepItem}>
                <View style={stylesMobile.stepCircleActive}>
                  <Text style={stylesMobile.tick}>✓</Text>
                </View>
                <Text style={stylesMobile.stepText}>
                  Full case{"\n"}analysis
                </Text>
              </View>

              {/* Step 3 */}
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
            {/* Header */}
            <View style={stylesMobile.topHeader}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 4,
                  alignItems: "center",
                }}
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

            {/* Date + Doctor */}
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

            {/* Patient Info */}
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
          {/* Save/Cancel Buttons */}
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

          {/* Edit Button */}
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
    // marginTop: 4,
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
  rxLabel: {
    color: "#FF7072",
    fontWeight: "500",
    marginTop: "6%",
    marginBottom: "2%",
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
  rxText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
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
    // paddingHorizontal: 8,
    // paddingVertical: 4,
    backgroundColor: "#FAFAFA",
    // minWidth: 80,
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
    // 17 = half of circle (34/2)
    // 16 = container paddingVertical

    left: "16.5%",
    right: "16.5%",
    height: 2,
    backgroundColor: "#1680ECBF",
  },

  stepCircleActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1D4ED8", // blue
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
