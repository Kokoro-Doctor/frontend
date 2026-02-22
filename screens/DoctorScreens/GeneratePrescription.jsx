import React, { useCallback, useState, useEffect } from "react";
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
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { Pressable } from "react-native";

import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import BackButton from "../../components/PatientScreenComponents/BackButton";
import { API_URL } from "../../env-vars";
import * as WebBrowser from "expo-web-browser";

import { Ionicons } from "@expo/vector-icons";
import {
  FetchFromServer,
  download,
  remove,
} from "../../utils/MedilockerService";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

const GeneratePrescription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const { setChatbotConfig, isChatExpanded, setIsChatExpanded } = useChatbot();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [fileMenuVisible, setFileMenuVisible] = useState(false);
  const [selectedFileForMenu, setSelectedFileForMenu] = useState(null);
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isGeneratingPrescription, setIsGeneratingPrescription] =
    useState(false);

  const { userId, doctorId, userName, appointmentDate } = route.params || {};

  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig]),
  );

  // useEffect(() => {
  //   if (!userId) return;

  //   const fetchUserDetails = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch(`${API_URL}/users/${userId}`);
  //       const data = await res.json();

  //       console.log("✅ User details:", data);

  //       setUser(data.user || data);
  //     } catch (err) {
  //       console.error("❌ Failed to fetch user:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserDetails();
  // }, [userId]);

  useEffect(() => {
    if (!userId || !doctorId) return;

    const fetchAllDetails = async () => {
      try {
        setLoading(true);

        // USER
        const userRes = await fetch(`${API_URL}/users/${userId}`);
        const userData = await userRes.json();
        const userProfile = userData.user || userData;
        setUser({ ...userProfile, name: userName || userProfile.name });

        // APPOINTMENT (SOURCE OF TRUTH)
        const apptRes = await fetch(
          `${API_URL}/booking/doctors/${doctorId}/users/${userId}/latest`,
        );
        const apptData = await apptRes.json();

        console.log("📅 Appointment:", apptData);

        setAppointment({
          ...apptData,
          date: appointmentDate || apptData?.date,
        });

        // MEDILOCKER FILES - FETCH USER DOCUMENTS
        try {
          const userIdentifier =
            userProfile.user_id || userProfile.email || userId;
          console.log("📁 Fetching files for:", userIdentifier);

          const filesData = await FetchFromServer(userIdentifier);
          console.log("📦 FetchFromServer response:", filesData);

          if (filesData?.files) {
            console.log("✅ Files received:", filesData.files.length);

            const mappedFiles = filesData.files.map((file) => ({
              name: file.filename,
              file_id: file.file_id,
              type: detectType(file.filename),
              size: file.metadata?.file_size,
              date: file.metadata?.upload_date,
              time: file.metadata?.upload_time,
            }));

            console.log("🔄 Mapped files:", mappedFiles);
            setFiles(mappedFiles);
            console.log(
              "✨ Files state updated with",
              mappedFiles.length,
              "files",
            );
          } else {
            console.warn("⚠️ No files in response");
          }
        } catch (fileErr) {
          console.error("❌ Failed to fetch files:", fileErr);
        }
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [userId, doctorId]);

  const getInitials = (name = "") => {
    if (!name) return "U";

    const parts = name.trim().split(" ");
    const first = parts[0]?.charAt(0).toUpperCase() || "";
    const last =
      parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";

    return first + last;
  };

  const detectType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "Report";
    if (["png", "jpg", "jpeg"].includes(ext)) return "Scan";
    if (["txt", "doc", "docx"].includes(ext)) return "Prescription";
    return "Other";
  };

  const openQuickPreview = async (file) => {
    try {
      const data = await download(user?.user_id || user?.email, file.file_id);

      setSelectedFilePreview(file);
      setPreviewUrl(data.download_url);
      setPreviewModalVisible(true);
    } catch (error) {
      Alert.alert("Preview Error", "Unable to load file preview");
    }
  };

  // const openFileMenu = (file) => {
  //   setSelectedFileForMenu(file);
  //   setFileMenuVisible(true);
  // };

  // const downloadFile = async (fileName) => {
  //   console.log("📥 Downloading file:", fileName);
  //   Alert.alert("Download", `Downloading ${fileName}...`);
  // };

  const downloadFile = async (file) => {
    try {
      const data = await download(user?.user_id || user?.email, file.file_id);
      const downloadUrl = data.download_url;

      if (Platform.OS === "web") {
        window.open(downloadUrl, "_blank");
        // const link = document.createElement("a");
        // link.href = downloadUrl;
        // link.setAttribute("download", fileName);
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
      } else {
        await WebBrowser.openBrowserAsync(downloadUrl);
      }
    } catch (error) {
      Alert.alert("Download Error", error.message);
    }
  };

  const removeFile = async (file) => {
    try {
      await remove(user?.user_id || user?.email, file.file_id);

      setFiles(files.filter((f) => f.file_id !== file.file_id));
      Alert.alert("Deleted", `${file.name} has been removed`);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const shareFile = async (file) => {
    try {
      const data = await download(user?.user_id || user?.email, file.file_id);
      const downloadUrl = data.download_url;

      if (Platform.OS === "web") {
        let urlToShare = downloadUrl;
        try {
          urlToShare = await shortenUrl(downloadUrl);
        } catch (error) {
          console.error("Failed to shorten URL:", error);
        }

        if (navigator.share) {
          await navigator.share({
            title: file.name,
            url: urlToShare,
            text: `Check out this file: ${file.name}`,
          });
        } else {
          window.open(downloadUrl, "_blank");
        }
      } else {
        const localUri = FileSystem.cacheDirectory + file.name;

        const downloadResult = await FileSystem.downloadAsync(
          downloadUrl,
          localUri,
        );

        if (!(await Sharing.isAvailableAsync())) {
          console.error("Sharing is not available on this device");
          return;
        }

        await Sharing.shareAsync(downloadResult.uri);
        await FileSystem.deleteAsync(downloadResult.uri);
      }
    } catch (error) {
      console.error("Sharing error:", error);
    }
  };

  const generatePrescriptionFromMedilocker = async () => {
    if (!userId && !user?.user_id) {
      Alert.alert("Error", "User ID is required to generate prescription");
      return;
    }

    const userIdentifier = userId || user?.user_id;

    try {
      setIsGeneratingPrescription(true);
      console.log("🔄 Generating prescription for user:", userIdentifier);
      console.log(
        "📡 API URL:",
        `${API_URL}/medilocker/users/${userIdentifier}/prescription`,
      );

      const response = await fetch(
        `${API_URL}/medilocker/users/${userIdentifier}/prescription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error:", errorData);
        throw new Error(
          errorData.detail ||
            `Failed to generate prescription: ${response.status}`,
        );
      }

      const prescriptionData = await response.json();
      console.log("✅ Prescription generated:", prescriptionData);
      console.log("📄 Prescription text:", prescriptionData.prescription);
      console.log(
        "👤 Patient details from API (ignored in subscriber flow):",
        prescriptionData.patient_details,
      );
      console.log("👤 Patient details from user object:", {
        name: user?.name,
        age: user?.age,
        gender: user?.gender,
        email: user?.email,
      });

      // Format the prescription data to match PrescriptionPreview expectations
      // In subscriber flow: Use patient details from fetched user object (auth/API), not from extracted prescription
      // Only use extracted patient_details when manually uploading documents (Prescription.jsx)
      const formattedPrescription = {
        prescriptionReport:
          prescriptionData.prescription ||
          "No prescription data available. Please add prescription details manually.",
        // Use patient details from user object (subscriber data), fallback to null if not available
        patientName: user?.name || userName || null,
        age: user?.age ? user.age.toString() : null,
        gender: user?.gender || null,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        // Diagnosis can come from extracted data or be null
        diagnosis: prescriptionData.patient_details?.diagnosis || null,
      };

      console.log("📋 Formatted prescription:", formattedPrescription);
      console.log(
        "📋 Prescription report length:",
        formattedPrescription.prescriptionReport?.length || 0,
      );

      console.log("🧭 Navigating to PrescriptionPreview...");
      console.log("🧭 Navigation object:", navigation);
      console.log("🧭 Prescription data being passed:", formattedPrescription);

      // Show warning if no prescription data, but still navigate
      if (
        !prescriptionData.prescription ||
        prescriptionData.prescription.trim() === ""
      ) {
        console.warn(
          "⚠️ No prescription data generated, navigating with empty prescription",
        );
      }

      // Ensure loading state is reset before navigation
      setIsGeneratingPrescription(false);

      // Navigate directly to PrescriptionPreview screen (already in DoctorAppNavigation stack)
      // Use push instead of navigate to ensure it always creates a new screen
      try {
        console.log("🚀 Attempting navigation to PrescriptionPreview");
        if (navigation && typeof navigation.push === "function") {
          navigation.push("PrescriptionPreview", {
            generatedPrescription: formattedPrescription,
          });
        } else if (navigation && typeof navigation.navigate === "function") {
          navigation.navigate("PrescriptionPreview", {
            generatedPrescription: formattedPrescription,
          });
        } else {
          throw new Error("Navigation object is not available");
        }
        console.log("✅ Navigation completed successfully");
      } catch (navError) {
        console.error("❌ Navigation error:", navError);
        Alert.alert(
          "Navigation Error",
          `Failed to navigate: ${navError.message}`,
        );
      }
    } catch (error) {
      console.error("❌ Failed to generate prescription:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert(
        "Error",
        error.message || "Failed to generate prescription. Please try again.",
      );
      setIsGeneratingPrescription(false);
    }
  };

  const MobileGeneratePrescription = ({
    user,
    appointment,
    searchText,
    setSearchText,
  }) => {
    return (
      <ScrollView
        style={m.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* PROFILE */}
        <View style={m.profileCard}>
          <View style={m.profileTop}>
            <View style={m.avatar}>
              {user?.image ? (
                <Image source={{ uri: user.image }} style={m.avatarImg} />
              ) : (
                <Text style={m.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
          </View>

          <Text style={m.name}>{user?.name}</Text>
          <Text style={m.subtitle}>(Cardiac Patient)</Text>
        </View>

        {/* DETAILS */}
        <TouchableOpacity
          style={[
            m.generateButton,
            isGeneratingPrescription && m.generateButtonDisabled,
          ]}
          onPress={generatePrescriptionFromMedilocker}
          disabled={isGeneratingPrescription}
        >
          <Text style={m.generateButtonText}>
            {isGeneratingPrescription
              ? "Generating..."
              : "Generate Prescription"}
          </Text>
        </TouchableOpacity>

        <View style={m.infoCard}>
          {/* <InfoRow
            label="Appointment Date"
            value={appointment?.date?.split("T")[0]}
          /> */}
          <View style={{ marginTop: "2%", marginLeft: "3%" }}>
            <Text style={m.infoText}>Appointment Date</Text>
            <Text style={m.infoTxt}>{appointment?.date?.split("T")[0]}</Text>
          </View>

          <View style={{ marginTop: "5%", marginLeft: "3%" }}>
            <Text style={m.infoText}>Time</Text>
            <Text style={m.infoTxt}>11:00 AM</Text>
          </View>

          {/* <InfoRow label="Time" value="11:00 AM" />
          <InfoRow label="Status" value="Cancelled" /> */}
        </View>

        <View style={m.infoCard}>
          <View style={{ marginTop: "2%", marginLeft: "3%" }}>
            <Text style={m.infoText}>Status</Text>
            <Text style={m.infoTxt}>Cancelled</Text>
          </View>
        </View>

        {/* FILE MENU MODAL */}
        {fileMenuVisible && selectedFileForMenu && (
          <>
            {/* Backdrop */}
            <Pressable
              style={m.backdrop}
              onPress={() => setFileMenuVisible(false)}
            />
            {/* Dropdown Menu */}
            <View style={m.floatingMenu}>
              <Pressable
                style={m.dropdownItem}
                onPress={() => {
                  setFileMenuVisible(false);
                  downloadFile(selectedFileForMenu);
                }}
              >
                <Text style={m.dropdownText}>Download</Text>
              </Pressable>
              <Pressable
                style={m.dropdownItem}
                onPress={() => {
                  setFileMenuVisible(false);
                  removeFile(selectedFileForMenu);
                }}
              >
                <Text style={[m.dropdownText, { color: "red" }]}>Delete</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* DOCUMENTS */}
        <View style={m.docsCard}>
          <View style={m.docsHeader}>
            <Text style={m.docsTitle}>Patients Uploaded Documents</Text>
            <TouchableOpacity>
              <Text style={m.filter}>⏷</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                paddingHorizontal: 15,
                paddingVertical: 6,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <Ionicons name="search-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={{
                  paddingHorizontal: 10,
                  borderRadius: 3,
                  flex: 1,
                  minWidth: 150,
                  fontSize: 14,
                  color: "#333",
                  backgroundColor: "#fff",
                  outlineStyle: "none",
                }}
                placeholder="Search For Document"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={{
                  marginTop: "1%",
                  marginLeft: "44%",
                }}
              >
                <Image
                  source={require("../../assets/DoctorsPortal/Icons/filter__Icon.png")}
                  style={styles.statIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* SAMPLE FILE ITEM */}
          {files.length > 0 ? (
            files
              .filter((file) =>
                file.name.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((file, i) => (
                <Pressable
                  key={i}
                  style={m.fileRow}
                  onPress={() => openQuickPreview(file)}
                >
                  <Text style={m.fileIcon}>📄</Text>

                  <View style={{ flex: 1 }}>
                    <Text style={m.fileName}>{file.name}</Text>
                    <Text style={m.fileMeta}>
                      {file.type} · {file.size}
                    </Text>
                  </View>

                  {/* MEATBALL MENU BUTTON */}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedFileForMenu(file);
                      setFileMenuVisible(true);
                    }}
                  >
                    <Text style={m.more}>⋯</Text>
                  </TouchableOpacity>
                </Pressable>
              ))
          ) : loading ? (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginVertical: 20,
              }}
            >
              <ActivityIndicator size="large" color="#FF7072" />
              <Text
                style={{
                  textAlign: "center",
                  color: "#999",
                  marginTop: 12,
                  fontSize: 14,
                }}
              >
                Loading files...
              </Text>
            </View>
          ) : (
            <Text
              style={{ textAlign: "center", color: "#999", marginVertical: 20 }}
            >
              No documents uploaded
            </Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const InfoRow = ({ label, value }) => (
    <View style={m.infoRow}>
      <Text style={m.infoLabel}>{label}</Text>
      <Text style={m.infoValue}>{value || "-"}</Text>
    </View>
  );

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
                    <View style={styles.upperPart}>
                      <View>
                        <Text style={styles.containerText}>
                          Your Subscribers
                        </Text>
                      </View>
                    </View>

                    <View style={styles.lowerPart}>
                      <View style={styles.container}>
                        <View style={{ flexDirection: "row" }}>
                          <View style={styles.imageBox}>
                            {user?.image ? (
                              <Image
                                source={{ uri: user.image }}
                                style={styles.imagepic}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text style={styles.initialText}>
                                {getInitials(user?.name)}
                              </Text>
                            )}
                          </View>

                          <View style={styles.firstTextBox}>
                            <View style={styles.firstHeadSection}>
                              <Text
                                style={{
                                  fontWeight: 600,
                                  fontSize: 24,
                                  color: "#000000",
                                }}
                              >
                                {user?.name}
                              </Text>
                              <View style={styles.secondTextBox}>
                                <View
                                  style={{ flexDirection: "row", gap: "14%" }}
                                >
                                  <View>
                                    <View style={{ flexDirection: "column" }}>
                                      <View style={{ flexDirection: "row" }}>
                                        <View>
                                          <Text
                                            style={{
                                              fontWeight: 500,
                                              fontSize: 14,
                                              color: "#000000",
                                            }}
                                          >
                                            Appointment Date :
                                          </Text>
                                        </View>
                                        <View>
                                          <Text style={styles.firstTexttwo}>
                                            {" "}
                                            {appointment?.date
                                              ? appointment.date.split("T")[0]
                                              : "-"}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        marginTop: "1.5%",
                                      }}
                                    >
                                      <View>
                                        <Text style={styles.firstBoxText}>
                                          Time :
                                        </Text>
                                      </View>

                                      <View>
                                        <Text style={styles.firstTexttwo}>
                                          {" "}
                                          11:00 AM
                                        </Text>
                                      </View>
                                    </View>
                                  </View>

                                  <Text
                                    style={{
                                      fontWeight: 500,
                                      fontSize: 14,
                                      color: "#000000",
                                    }}
                                  >
                                    Health Score :
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
                            >
                              <View>
                                <Text style={styles.firstBoxText}>
                                  {user?.age}
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}></Text>
                              </View>

                              <View style={{ marginLeft: "20%" }}>
                                <Text style={styles.firstBoxText}>
                                  {user?.gender}
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}></Text>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
                            >
                              <View>
                                <Text style={styles.firstBoxText}>
                                  {user?.condition}
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}>
                                  {" "}
                                  Heart Disease
                                </Text>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
                            >
                              <View>
                                <Text style={styles.firstBoxText}>
                                  {user?.status}
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}>
                                  {" "}
                                  Cancelled
                                </Text>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
                            >
                              <View>
                                <Text style={styles.firstBoxText}>
                                  Summary :
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}>
                                  {" "}
                                  Shortness of breath (dyspnea) for four months,
                                  progressively worsening to the point of
                                  limiting daily activities
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* <TouchableOpacity style={styles.generateButton}>
                            <Text style={styles.generateText}>
                              Generate Prescription
                            </Text>
                          </TouchableOpacity> */}
                          <TouchableOpacity
                            style={[
                              styles.generateButton,
                              isGeneratingPrescription &&
                                styles.generateButtonDisabled,
                            ]}
                            onPress={generatePrescriptionFromMedilocker}
                            disabled={isGeneratingPrescription}
                          >
                            <Text style={styles.generateText}>
                              {isGeneratingPrescription
                                ? "Generating..."
                                : "Generate Prescription"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.lowerSectionContainer}>
                          <View style={{ marginLeft: "2%" }}>
                            <Text style={styles.middleText}>
                              Patients Uploaded Documents
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              gap: "1.5%",
                              marginRight: "1.5%",
                            }}
                          >
                            <TouchableOpacity>
                              <Image
                                source={require("../../assets/DoctorsPortal/Icons/call_Icon.png")}
                                style={styles.midddleIcon}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity>
                              <Image
                                source={require("../../assets/DoctorsPortal/Icons/fileSave.png")}
                                style={styles.middleIcon}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      <View style={styles.bottomPart}>
                        <View style={{ flexDirection: "row" }}>
                          <View style={{ padding: "1.2%", marginLeft: "1%" }}>
                            <Text
                              style={{
                                color: "#000000",
                                fontWeight: "600",
                                fontSize: 16,
                                fontFamily: "Poppins - SemiBold",
                              }}
                            >
                              Files Uploaded
                            </Text>
                          </View>

                          <View
                            style={{
                              padding: "1%",
                              flexDirection: "row",
                              gap: "4%",
                              marginLeft: "43%",
                            }}
                          >
                            <TouchableOpacity style={styles.searchBox}>
                              <Image
                                source={require("../../assets/DoctorsPortal/Icons/search_Icon.png")}
                                style={styles.searchImage}
                              />
                              <TextInput
                                style={styles.searchText}
                                placeholder="Search For Documents"
                                value={searchText}
                                onChangeText={setSearchText}
                              />
                            </TouchableOpacity>

                            <View style={{ flexDirection: "row" }}>
                              <TouchableOpacity style={styles.filterBox}>
                                <Image
                                  source={require("../../assets/DoctorsPortal/Icons/filter__Icon.png")}
                                  style={styles.searchImage}
                                />
                                <Text>Filters</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>

                        <View style={styles.medilockerBox}>
                          <View style={{ marginLeft: "0.5%" }}>
                            <Text style={styles.mediText}>File Name</Text>
                          </View>
                          <View style={{ marginLeft: "1%" }}>
                            <Text style={styles.mediText}>Document Type</Text>
                          </View>
                          <View style={{ marginLeft: "1%" }}>
                            <Text style={styles.mediText}>File size</Text>
                          </View>
                          <View style={{ marginLeft: "1%" }}>
                            <Text style={styles.mediText}>Creation Date</Text>
                          </View>
                          <View style={{ marginLeft: "1%" }}>
                            <Text style={styles.mediText}>Time</Text>
                          </View>
                          <View style={{ marginLeft: "1%" }}>
                            <Text style={styles.mediText}>Quick Preview</Text>
                          </View>
                          <View style={{ marginLeft: "1%" }}>
                            <Text style={styles.mediText}>Actions</Text>
                          </View>
                        </View>

                        {/* FILE ROWS - WEB VIEW */}
                        <ScrollView style={{ height: "100%", width: "100%" }}>
                          {files.length > 0 ? (
                            files
                              .filter((file) =>
                                file.name
                                  .toLowerCase()
                                  .includes(searchText.toLowerCase()),
                              )
                              .map((file, index) => (
                                <View
                                  key={index}
                                  style={{
                                    marginLeft: "3%",
                                    flexDirection: "row",
                                    minHeight: 60,
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#EEEEEE",
                                    alignItems: "center",
                                    paddingVertical: 10,
                                    paddingHorizontal: 10,
                                  }}
                                >
                                  {/* File Name */}
                                  <View
                                    style={{ width: "15%", paddingRight: 10 }}
                                  >
                                    <Text
                                      style={{
                                        ...styles.mediText,
                                        fontSize: 13,
                                        fontWeight: "400",
                                      }}
                                      numberOfLines={2}
                                    >
                                      {file.name}
                                    </Text>
                                  </View>

                                  {/* Document Type */}
                                  <View
                                    style={{
                                      width: "15%",
                                      paddingRight: 10,
                                      marginLeft: "3%",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        ...styles.mediText,
                                        fontSize: 13,
                                        fontWeight: "400",
                                      }}
                                    >
                                      {file.type}
                                    </Text>
                                  </View>

                                  {/* File Size */}
                                  <View
                                    style={{ width: "12%", paddingRight: 10 }}
                                  >
                                    <Text
                                      style={{
                                        ...styles.mediText,
                                        fontSize: 13,
                                        fontWeight: "400",
                                      }}
                                    >
                                      {file.size}
                                    </Text>
                                  </View>

                                  {/* Creation Date */}
                                  <View
                                    style={{
                                      width: "15%",
                                      paddingRight: 10,
                                      marginLeft: "2%",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        ...styles.mediText,
                                        fontSize: 13,
                                        fontWeight: "400",
                                      }}
                                    >
                                      {file.date}
                                    </Text>
                                  </View>

                                  {/* Time */}
                                  <View
                                    style={{
                                      width: "12%",
                                      paddingRight: 10,
                                      marginLeft: "1%",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        ...styles.mediText,
                                        fontSize: 13,
                                        fontWeight: "400",
                                      }}
                                    >
                                      {file.time}
                                    </Text>
                                  </View>

                                  {/* Quick Preview */}
                                  <View
                                    style={{
                                      width: "15%",
                                      paddingRight: 10,
                                      marginLeft: "0.2%",
                                    }}
                                  >
                                    <TouchableOpacity
                                      onPress={() => openQuickPreview(file)}
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Text
                                        style={{ fontSize: 16, marginRight: 5 }}
                                      >
                                        👁️
                                      </Text>
                                      <Text
                                        style={{
                                          ...styles.mediText,
                                          color: "#FF7072",
                                          fontWeight: "500",
                                          fontSize: 12,
                                        }}
                                      >
                                        Preview
                                      </Text>
                                    </TouchableOpacity>
                                  </View>

                                  {/* Actions Menu */}
                                  <View style={styles.actionButtons}>
                                    {/* Download Button */}
                                    <TouchableOpacity
                                      onPress={() => downloadFile(file)}
                                    >
                                      <MaterialIcons
                                        name="file-download"
                                        size={24}
                                        color="#FF7072"
                                      />
                                    </TouchableOpacity>

                                    {/* Delete Button */}
                                    <TouchableOpacity
                                      onPress={() => removeFile(file)}
                                    >
                                      <MaterialIcons
                                        name="delete"
                                        size={24}
                                        color="#FF7072"
                                      />
                                    </TouchableOpacity>

                                    {/* Share Button */}
                                    <TouchableOpacity
                                      onPress={() => shareFile(file)}
                                    >
                                      <MaterialIcons
                                        name="share"
                                        size={24}
                                        color="#FF7072"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ))
                          ) : loading ? (
                            <View
                              style={{
                                height: 100,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <ActivityIndicator size="large" color="#FF7072" />
                              <Text
                                style={{
                                  color: "#999",
                                  fontSize: 14,
                                  marginTop: 12,
                                }}
                              >
                                Loading files...
                              </Text>
                            </View>
                          ) : (
                            <View
                              style={{
                                height: 100,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Text style={{ color: "#999", fontSize: 14 }}>
                                No files uploaded
                              </Text>
                            </View>
                          )}
                        </ScrollView>

                        {/* QUICK PREVIEW MODAL */}
                        {/* QUICK PREVIEW MODAL */}
                        {previewModalVisible && selectedFilePreview && (
                          <View
                            style={{
                              position:
                                Platform.OS === "web" ? "fixed" : "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.85)",
                              zIndex: 999999,
                              padding: "2%",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "#000",
                                width: "95%",
                                height: "90%",
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              {/* HEADER */}
                              <View
                                style={{
                                  padding: 14,
                                  backgroundColor: "#FF7072",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{ fontSize: 16, fontWeight: "600" }}
                                >
                                  {selectedFilePreview.name}
                                </Text>

                                <TouchableOpacity
                                  onPress={() => {
                                    setPreviewModalVisible(false);
                                    setPreviewUrl(null);
                                    setZoomLevel(1); // ✅ reset zoom
                                  }}
                                >
                                  <Text style={{ fontSize: 16, color: "#111" }}>
                                    Close
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              {/* ZOOM CONTROLS (WEB ONLY) */}
                              {Platform.OS === "web" && (
                                <View
                                  style={{
                                    position: "absolute",
                                    bottom: 30,
                                    right: 30,
                                    flexDirection: "row",
                                    gap: 12,
                                    zIndex: 1000000,
                                  }}
                                >
                                  {/* Zoom In */}
                                  <TouchableOpacity
                                    onPress={() =>
                                      setZoomLevel((z) => Math.min(z + 0.25, 4))
                                    }
                                    style={{
                                      backgroundColor: "#FF7072",
                                      paddingVertical: 10,
                                      paddingHorizontal: 14,
                                      borderRadius: 6,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "#fff",
                                        fontSize: 18,
                                        fontWeight: "700",
                                      }}
                                    >
                                      +
                                    </Text>
                                  </TouchableOpacity>

                                  {/* Zoom Out */}
                                  <TouchableOpacity
                                    onPress={() =>
                                      setZoomLevel((z) => Math.max(z - 0.25, 1))
                                    }
                                    style={{
                                      backgroundColor: "#FF7072",
                                      paddingVertical: 10,
                                      paddingHorizontal: 14,
                                      borderRadius: 6,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "#fff",
                                        fontSize: 18,
                                        fontWeight: "700",
                                      }}
                                    >
                                      −
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}

                              {/* CONTENT */}
                              <View
                                style={{ flex: 1, backgroundColor: "#f5f5f5" }}
                              >
                                {/* IMAGE FILES */}
                                {["png", "jpg", "jpeg"].includes(
                                  selectedFilePreview.name
                                    .split(".")
                                    .pop()
                                    .toLowerCase(),
                                ) &&
                                  (Platform.OS === "web" ? (
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        overflow: "auto",
                                        backgroundColor: "#f5f5f5",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "flex-start",
                                          padding: 20,
                                        }}
                                      >
                                        <img
                                          src={previewUrl}
                                          alt="Preview"
                                          style={{
                                            maxWidth: "100%", // ✅ ALWAYS fit initially
                                            height: "auto",
                                            transform: `scale(${zoomLevel})`,
                                            transformOrigin: "top center",
                                            transition: "transform 0.2s ease",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <ScrollView
                                      contentContainerStyle={{
                                        flexGrow: 1,
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                      maximumZoomScale={4}
                                      minimumZoomScale={1}
                                    >
                                      <Image
                                        source={{ uri: previewUrl }}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                        }}
                                        resizeMode="contain"
                                      />
                                    </ScrollView>
                                  ))}

                                {/* PDF FILES */}
                                {selectedFilePreview.name
                                  .toLowerCase()
                                  .endsWith(".pdf") &&
                                  Platform.OS === "web" && (
                                    <iframe
                                      src={previewUrl}
                                      title="PDF Preview"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        border: "none",
                                      }}
                                    />
                                  )}

                                {/* UNSUPPORTED */}
                                {!["png", "jpg", "jpeg", "pdf"].includes(
                                  selectedFilePreview.name
                                    .split(".")
                                    .pop()
                                    .toLowerCase(),
                                ) && (
                                  <View
                                    style={{
                                      flex: 1,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Text style={{ color: "#666" }}>
                                      Preview not available for this file type.
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        )}
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
        <MobileGeneratePrescription
          user={user}
          appointment={appointment}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      )}

      {/* QUICK PREVIEW MODAL — MOBILE + WEB */}
      {/* QUICK PREVIEW MODAL — MOBILE ONLY */}
      {(Platform.OS !== "web" || width < 1000) &&
        previewModalVisible &&
        selectedFilePreview && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.9)",
              zIndex: 9999,
            }}
          >
            {/* HEADER */}
            <View
              style={{
                backgroundColor: "#FF7072",
                padding: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                {selectedFilePreview.name}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setPreviewModalVisible(false);
                  setPreviewUrl(null);
                }}
              >
                <Text style={{ fontSize: 16, color: "#111" }}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <View style={{ flex: 1, backgroundColor: "#000" }}>
              {/* IMAGE PREVIEW */}
              {["png", "jpg", "jpeg"].includes(
                selectedFilePreview.name.split(".").pop().toLowerCase(),
              ) && (
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  maximumZoomScale={4}
                  minimumZoomScale={1}
                >
                  <Image
                    source={{ uri: previewUrl }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                </ScrollView>
              )}

              {/* PDF PREVIEW */}
              {selectedFilePreview.name.toLowerCase().endsWith(".pdf") && (
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    marginTop: 40,
                  }}
                >
                  PDF preview opens in browser
                </Text>
              )}
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
    borderColor: "#00ffff",
    height: "100%",
    width: "100%",
  },

  imageBackground: {
    width: "100%",
    height: "100%",
    //transform:[{scale:0.8}],
    opacity: 80,
    alignSelf: "center",
    flexDirection: "column",
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
    //borderWidth: 1,
  },
  Right: {
    height: "100%",
    width: "85%",
  },
  firstTextBox: {
    marginTop: "0%",
    marginLeft: "0.5%",
    //borderWidth: 1,
    width: "73%",
  },
  firstHeadSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  backPicBox: {
    marginLeft: "4%",
  },
  backpic: {
    height: 30,
    width: 30,
  },
  contentContainer: {
    flex: 1,
    marginTop: "0.5%",
    backgroundColor: "#FFFFFF",
    marginBottom: "4%",
    borderRadius: 5,
    overflow: "hidden",
    width: "92%",
    marginHorizontal: "4%",
  },
  upperPart: {
    backgroundColor: "#FCA2A21F",
    height: "15%",
    width: "100%",
  },
  containerText: {
    fontSize: 34,
    fontWeight: "600",
    color: "#000000",
    paddingTop: "2%",
    marginLeft: "4%",
  },

  filterBox: {
    flexDirection: "row",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    outlineStyle: "none",
    borderWidth: 0,
  },

  lowerPart: {
    height: "76%",
    borderWidth: 1,
    borderRadius: 16,
    marginTop: "1.5%",
    marginLeft: "4%",
    marginBottom: "3%",
    marginRight: "4%",
    borderColor: "#d0cdcdff",
    padding: "0.5%",
  },
  container: {
    flexDirection: "column",
    //borderWidth: 2,
    height: "50%",
    borderColor: "#190678ff",
  },
  lowerSectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    //borderWidth:1,
    marginVertical: "2%",
    height: "25%",
  },
  // imageBox: {
  //   //margin: "1%",
  //   //borderWidth: 1,
  //   height: "49%",
  // },
  // imagepic: {
  //   height: 70,
  //   width: 70,
  // },

  imageBox: {
    borderWidth: 1,
    marginTop: "0%",
    marginRight: "0.6%",
    marginLeft: "1%",
    height: "44%",
    width: "5.7%",
    borderRadius: 50,
    backgroundColor: "#efefefff",
    borderColor: "#fbf9f9ff",
  },
  imagepic: {
    height: 45,
    width: 45,
    alignSelf: "center",
  },
  actionButtons: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center", // Ensures equal spacing
    alignItems: "center",
  },
  initialText: {
    alignSelf: "center",
    fontSize: 30,
    fontWeight: 600,
    color: "#d10f0fff",
    marginTop: "10%",
  },

  firstBoxText: {
    fontSize: 14,
    color: "#444444",
    fontWeight: 500,
    fontFamily: "Poppins - Medium",
    //borderWidth: 1,
  },
  firstTexttwo: {
    fontSize: 14,
    color: "#444444",
    fontWeight: 400,
    fontFamily: "Poppins - Regular",
  },
  generateButton: {
    backgroundColor: "#FF7072",
    borderRadius: 6,
    width: "17%",
    height: "25%",
    marginLeft: "2%",
  },
  generateButtonDisabled: {
    backgroundColor: "#FF7072",
    opacity: 0.6,
  },
  generateText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Poppins - SemiBold",
    alignSelf: "center",
    marginVertical: "3%",
  },
  middleText: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "500",
    fontFamily: "Inter - Medium",
    marginTop: "6%",
  },
  bottomPart: {
    //marginLeft: "1%",
    //marginTop: "0.5%",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#DADADA",
    height: "50%",
    width: "100%",
  },
  upperMiddlepart: {
    height: "20%",
    flexDirection: "row",
  },
  searchBox: {
    width: "100%",

    paddingRight: 30,
    flexDirection: "row",
    gap: "8%",
    // paddingHorizontal:70,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#FF707296",
  },
  searchImage: {
    marginLeft: "10%",
    marginTop: "1.5%",
  },
  searchText: {
    justifyContent: "center",
    fontSize: 14,
    color: "#444444",
    fontWeight: "400",
    fontFamily: "Poppins - Regular",
    outlineStyle: "none",
  },
  // filterBox: {
  //   justifyContent: "center",
  //   paddingTop: "5%",
  //   width: 95,
  //   flexDirection: "row",
  //   gap: "10%",
  //   borderColor: "#FF707296",
  //   borderWidth: 1,
  //   borderRadius: 6,
  //   paddingRight: "20%",
  // },
  secondTextBox: {
    width: "50%",
    //borderColor: "#E2E2E2",
    //borderWidth: 1,
    height: "100%",
    paddingHorizontal: "1%",
  },

  medilockerBox: {
    borderTopColor: "#DADADA",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#DADADA",
    height: "20%",
    width: "100%",
    backgroundColor: "#FF70720F",
    borderRadius: 0,
    borderColor: "#DADADA",
    flexDirection: "row",
    padding: "0.6%",
    justifyContent: "space-around",
  },
  mediText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444444",
    fontFamily: "Poppins - Medium",
  },
});
const m = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 16,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  profileTop: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  avatar: {
    borderWidth: 1,
    height: 72,
    width: 72,
    borderRadius: 36,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarImg: {
    height: 72,
    width: 72,
    borderRadius: 36,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF7072",
  },

  name: {
    marginTop: "3%",
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginTop: "2%",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    padding: 12,
    marginBottom: 12,
    flexDirection: "column",
    borderColor: "#D6D7D8",
  },

  infoText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#444444",
  },

  infoTxt: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: "#EEE",
  },

  infoLabel: {
    fontSize: 14,
    color: "#777",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },

  docsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },

  docsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  docsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  filter: {
    fontSize: 18,
  },

  searchBox: {
    borderWidth: 1,
    borderColor: "#FF7072",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  searchInput: {
    height: 40,
    fontSize: 14,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#EEE",
  },

  fileIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  fileName: {
    fontSize: 14,
    fontWeight: "500",
  },

  fileMeta: {
    fontSize: 12,
    color: "#777",
  },

  more: {
    fontSize: 30,
    color: "#444444",
    fontWeight: "800",
  },

  generateButton: {
    backgroundColor: "#FF7072",
    padding: 14,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  generateButtonDisabled: {
    opacity: 0.6,
  },

  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  floatingMenu: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: 140,
    zIndex: 101,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  dropdownText: {
    fontSize: 14,
    color: "#000",
  },
});

export default GeneratePrescription;
