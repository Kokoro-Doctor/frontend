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
} from "react-native";

import { AuthContext } from "../../contexts/AuthContext";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import BackButton from "../../components/PatientScreenComponents/BackButton";
import {
  formatPrescriptionText,
  downloadPrescription,
} from "../../utils/PrescriptionService";

const { width, height } = Dimensions.get("window");

const PrescriptionPreview = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { user } = useContext(AuthContext);
  
  // Get prescription and user from route params
  const { generatedPrescription: initialPrescription } = route.params || {};
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(
    initialPrescription || null
  );
  
  // Debug logging and update state when route params change
  useEffect(() => {
    console.log("🔍 PrescriptionPreview - Route params:", route.params);
    console.log("🔍 PrescriptionPreview - Initial prescription:", initialPrescription);
    
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

  const handleApprovePrescription = () => {
    // TODO: Implement approve prescription functionality
    console.log("Approve prescription");
    alert("Approve functionality will be implemented soon");
  };

  if (!currentPrescription) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No prescription data available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
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
                  <View style={styles.contentContainer}>
                    {/* Two-column layout */}
                    <View style={styles.twoColumnLayout}>
                      {/* Left Column - Prescription Preview (70%) */}
                      <View style={styles.prescriptionColumn}>
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
                                  Date : {currentPrescription.date}
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
                                    {currentPrescription.patientName || ""}
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
                                    {currentPrescription.age || ""}
                                  </Text>
                                )}
                              </View>
                            </View>

                            {/* Row 2: Gender + Diagnosis */}
                            <View style={styles.detailRow}>
                              {/* Gender */}
                              <View style={styles.detailItemHalf}>
                                <Text style={styles.detailLabel}>Gender</Text>
                                {isEditMode ? (
                                  <TextInput
                                    style={styles.detailInput}
                                    value={editedPrescription?.gender || ""}
                                    onChangeText={(value) =>
                                      updatePrescriptionField("gender", value)
                                    }
                                    placeholder="Enter gender"
                                    placeholderTextColor="#999999"
                                  />
                                ) : (
                                  <Text style={styles.detailValue}>
                                    {currentPrescription.gender || ""}
                                  </Text>
                                )}
                              </View>

                              {/* Diagnosis */}
                              <View style={styles.detailItemHalf}>
                                <Text style={styles.detailLabel}>Diagnosis</Text>
                                {isEditMode ? (
                                  <TextInput
                                    style={styles.detailInput}
                                    value={editedPrescription?.diagnosis || ""}
                                    onChangeText={(value) =>
                                      updatePrescriptionField("diagnosis", value)
                                    }
                                    placeholder="Enter diagnosis"
                                    placeholderTextColor="#999999"
                                    multiline
                                  />
                                ) : (
                                  <Text style={styles.detailValue}>
                                    {currentPrescription.diagnosis || ""}
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
                                    currentPrescription.prescriptionReport
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
                                <Text style={styles.saveButtonText}>Save</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          </View>
                        </ScrollView>
                      </View>

                      {/* Right Column - Action Panel (30%) */}
                      <View style={styles.actionPanel}>
                        <View style={styles.actionPanelContent}>
                          <Text style={styles.actionPanelTitle}>Actions</Text>
                          
                          {/* Edit Prescription Button */}
                          {!isEditMode ? (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={handleEditPrescription}
                            >
                              <Text style={styles.actionButtonText}>
                                Edit Prescription
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.editModeInfo}>
                              <Text style={styles.editModeText}>
                                Edit Mode Active
                              </Text>
                            </View>
                          )}

                          {/* Download PDF Button */}
                          {!isEditMode && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={handleDownloadPrescription}
                            >
                              <Text style={styles.actionButtonText}>
                                Download PDF
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* Approve Prescription Button */}
                          {!isEditMode && (
                            <TouchableOpacity
                              style={[styles.actionButton, styles.approveButton]}
                              onPress={handleApprovePrescription}
                            >
                              <Text style={styles.approveButtonText}>
                                Approve Prescription
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
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

          {/* PRESCRIPTION VIEW */}
          <View style={stylesMobile.prescriptionWrapper}>
            {/* Header */}
            <View style={stylesMobile.topHeader}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/DoctorsPortal/Icons/kokorologoo.png")}
                  style={styles.statIcon}
                  resizeMode="contain"
                />

                <Text style={stylesMobile.logoText}>
                  &quot;Kokoro.Doctor&quot;
                </Text>
              </View>
              <View style={stylesMobile.summaryBadge}>
                <View style={stylesMobile.summaryBadgeContent}>
                  <Text style={stylesMobile.summaryText}>
                    Patient Summary
                  </Text>
                </View>
              </View>
            </View>

            {/* Date + Doctor */}
            <View style={stylesMobile.rowBetween}>
              <View style={{ flexDirection: "row", gap: 1 }}>
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
                  <Text style={stylesMobile.metaText}>Age:</Text>{" "}
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
                  <Text style={stylesMobile.infoLabel}>Gender:</Text>{" "}
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

            {/* RX */}
            <Text style={stylesMobile.rxLabel}>RX</Text>

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
                <Text style={stylesMobile.rxText}>
                  {currentPrescription?.prescriptionReport
                    ? formatPrescriptionText(
                        currentPrescription.prescriptionReport
                      )
                    : "No prescription report generated"}
                </Text>
              )}
            </ScrollView>

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
                style={stylesMobile.approveBtn}
                onPress={handleEditPrescription}
              >
                <Text style={stylesMobile.approveBtnText}>
                  Edit Prescription
                </Text>
              </TouchableOpacity>
            )}

            {/* Approved Button */}
            {!isEditMode && (
              <TouchableOpacity style={stylesMobile.approveBtn}>
                <Text style={stylesMobile.approveBtnText}>
                  Approved Prescription
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
    ...(Platform.OS === "web" && {
      height: "calc(100vh - 200px)", // Fixed height: viewport minus header/back button
      maxHeight: "calc(100vh - 200px)",
    }),
  },
  twoColumnLayout: {
    flexDirection: "row",
    flex: 1,
    gap: 24,
    height: "100%",
    overflow: "hidden",
  },
  prescriptionColumn: {
    flex: 0.7,
    minWidth: 0,
    height: "100%",
    overflow: "hidden",
  },
  prescriptionScrollView: {
    flex: 1,
    height: "100%",
  },
  actionPanel: {
    flex: 0.3,
    minWidth: 0,
    height: "100%",
    paddingLeft: 16,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
  actionPanelContent: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    ...(Platform.OS === "web" && {
      position: "sticky",
      top: 20,
      height: "fit-content",
    }),
  },
  actionPanelTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Poppins",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#FF7072",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  approveButton: {
    backgroundColor: "#FF7072",
    borderColor: "#FF7072",
  },
  actionButtonText: {
    color: "#FF7072",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  editModeInfo: {
    backgroundColor: "#FFF8F8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0E0",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editModeText: {
    color: "#FF7072",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Poppins",
    fontStyle: "italic",
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
    minHeight: 300,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#FF7072",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
  prescriptionWrapper: {
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingLeft: 16,
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
    color: "#666",
    marginTop: 4,
  },
  secondText: {
    color: "#555555",
    fontSize: 12,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
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
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
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
});

export default PrescriptionPreview;
