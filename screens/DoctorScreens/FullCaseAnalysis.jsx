import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  Text,
  Image,
  ScrollView,
  TextInput,
  ImageBackground,
  Animated,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import BackButton from "../../components/PatientScreenComponents/BackButton";
import { API_URL } from "../../env-vars";
import { useAuth } from "../../contexts/AuthContext";
//import * as ImagePicker from "expo-image-picker";

const documents = [1, 2, 3, 4, 5, 6];
const { width, height } = Dimensions.get("window");

export default function FullCaseAnalysis({ navigation, route }) {
  const [activeTab, setActiveTab] = useState("All");
  const { width } = useWindowDimensions();
  const [chatOpen, setChatOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(height))[0];
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  const { userId, doctorId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [isGeneratingPrescription, setIsGeneratingPrescription] =
    useState(false);
  const [patient, setPatient] = useState(null);
  const [loadingSteps, setLoadingSteps] = useState("");
  const scrollRef = React.useRef();

  const CATEGORY_MAP = {
    All: "ALL",
    Prescriptions: "PRESCRIPTION",
    "Scan Reports": "SCAN_REPORT",
    "Lab Reports": "LAB_REPORT",
    "Hospital History": "HOSPITAL_RECORD",
    "Health Insurance & ID": "HEALTH_INSURANCE",

    // Mobile keys
    Prescription: "PRESCRIPTION",
    Scan: "SCAN_REPORT",
    Lab: "LAB_REPORT",
    Hospital: "HOSPITAL_RECORD",
    Health: "HEALTH_INSURANCE",
  };

  useEffect(() => {
    if (!userId) return;

    fetchPatient(); // load patient first
  }, [userId]);

  const startStreamingSteps = () => {
    const steps = [
      "Reviewing patient reports...",
      "Reading lab and scan results...",
      "Checking clinical indicators...",
      "Generating clinical summary...",
    ];

    let index = 0;

    const interval = setInterval(() => {
      setLoadingSteps(steps[index]); // replace text instead of adding
      index++;

      if (index >= steps.length) {
        clearInterval(interval);
      }
    }, 1500);

    return interval;
  };

  useEffect(() => {
    const loadInitialSummary = async () => {
      if (!userId) return;

      try {
        setBotTyping(true);

        const streamInterval = startStreamingSteps();

        const response = await fetch(
          `${API_URL}/medilocker/users/${userId}/clinical-query`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: "Give a clinical summary of this patient's case",
              context: {
                patient_id: userId,
                doctor_id: doctorId,
                documents: [],
              },
            }),
          },
        );

        clearInterval(streamInterval);

        const data = await response.json();

        setLoadingSteps([]); // clear fake messages

        setMessages([
          {
            type: "bot",
            text: data.answer || "No response received",
          },
        ]);
      } catch (error) {
        console.log("Clinical query error:", error);
      } finally {
        setBotTyping(false);
      }
    };

    loadInitialSummary();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchFiles(activeTab); // files depend on tab
  }, [activeTab, userId]);

  const fetchPatient = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient");
      }

      const data = await response.json();

      console.log("Patient raw response:", JSON.stringify(data, null, 2));

      // ✅ Mirror exactly what GeneratePrescription does:
      const userProfile = data.user || data;
      setPatient(userProfile);
    } catch (error) {
      console.log("Error fetching patient:", error);
      Alert.alert("Error", "Failed to load patient data");
    }
  };

  const fetchFiles = async (categoryLabel) => {
    try {
      if (!userId) {
        console.log("❌ No patient userId received");
        return;
      }

      setLoading(true);

      const category = CATEGORY_MAP[categoryLabel];
      let url = `${API_URL}/medilocker/users/${userId}/files`;

      if (category && category !== "ALL") {
        url += `?category=${category}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      setFiles(Array.isArray(data) ? data : data.files || []);
    } catch (error) {
      console.log("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePrescriptionFromMedilocker = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is required");
      return;
    }

    if (!patient) {
      Alert.alert("Please wait", "Patient data is still loading");
      return;
    }

    try {
      setIsGeneratingPrescription(true);

      const response = await fetch(
        `${API_URL}/medilocker/users/${userId}/prescription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            `Failed to generate prescription: ${response.status}`,
        );
      }

      const prescriptionData = await response.json();

      console.log("Prescription API response:", prescriptionData);

      const formattedPrescription = {
        prescriptionReport:
          prescriptionData.prescription || "No prescription data available",

        // ✅ use patient state
        patientName: patient?.name || "",
        age: patient?.age ? patient.age.toString() : "",
        gender: patient?.gender || "",

        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

        diagnosis: prescriptionData.patient_details?.diagnosis || "",
      };

      navigation.navigate("PrescriptionPreview", {
        generatedPrescription: formattedPrescription,
        userId,
      });
    } catch (error) {
      console.error("❌ Failed to generate prescription:", error);
      Alert.alert("Error", error.message || "Failed to generate prescription");
    } finally {
      setIsGeneratingPrescription(false);
    }
  };

  const sendMessage = async () => {
    if (!question.trim()) return;

    const userMessage = {
      type: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      setBotTyping(true);

      // 🧠 Create patient prompt context
      const patientContext = {
        patient_id: userId,
        doctor_id: doctorId,
        selected_category: CATEGORY_MAP[activeTab],
        documents: files.map((file) => ({
          file_name: file.file_name || file.filename || file.name,
          file_type: file.file_type || file.type,
          file_size: file.file_size || file.size,
          uploaded_at: file.uploaded_at || file.created_at,
          category: file.category,
        })),
      };

      const response = await fetch(
        `${API_URL}/medilocker/users/${userId}/clinical-query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
            context: patientContext, // 👈 send patient data
          }),
        },
      );

      const data = await response.json();

      const botMessage = {
        type: "bot",
        text: data.answer || data.response || "No response received",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Error getting response" },
      ]);
    } finally {
      setBotTyping(false);
    }
  };

  const openChat = () => {
    setChatOpen(true);
    Animated.timing(slideAnim, {
      toValue: 130, // 👈 adjust to match title bottom position
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeChat = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setChatOpen(false));
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
                  <View style={styles.fullCaseDetailSection}>
                    <View style={styles.titleBox}>
                      <Text style={styles.titleText}>Full Case Analysis</Text>
                    </View>
                    <View style={styles.upperSection}>
                      <View style={styles.upperLeftSection}>
                        <View style={styles.caseAnalysisDocSection}>
                          <Text style={styles.upperText}>
                            Full Case Analysis
                          </Text>
                          <Text style={styles.lowerText}>Total documents</Text>
                        </View>
                        {/* <View style={styles.filesUploadingCountSection}>
                          <Text style={styles.uploadingText}>
                            2 new reports added since last review
                          </Text>
                        </View> */}
                      </View>

                      <TouchableOpacity
                        style={styles.generateBtn}
                        onPress={generatePrescriptionFromMedilocker}
                        disabled={isGeneratingPrescription}
                      >
                        <Image
                          source={require("../../assets/Images/BottomCTAfullcase.png")}
                        />

                        <Text style={styles.generateText}>
                          {isGeneratingPrescription
                            ? "Generating..."
                            : "Generate Prescription"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.uploadedDocChatbotSection}>
                      {/* LEFT SECTION - MEDILOCKER */}
                      <View style={styles.medilockerSection}>
                        <View style={styles.webTabsRow}>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.webTabsContainer}
                          >
                            {[
                              {
                                label: "All",
                                icon: require("../../assets/DoctorsPortal/Icons/Allfullcase.png"),
                              },
                              {
                                label: "Prescriptions",
                                icon: require("../../assets/DoctorsPortal/Icons/myPrescription.png"),
                              },
                              {
                                label: "Scan Reports",
                                icon: require("../../assets/DoctorsPortal/Icons/scanReports.png"),
                              },
                              {
                                label: "Lab Reports",
                                icon: require("../../assets/DoctorsPortal/Icons/tubechemical.png"),
                              },
                              {
                                label: "Hospital History",
                                icon: require("../../assets/DoctorsPortal/Icons/hospitalFullcase.png"),
                              },
                              {
                                label: "Health Insurance & ID",
                                icon: require("../../assets/DoctorsPortal/Icons/heartShield.png"),
                              },
                            ].map((tab) => (
                              <TouchableOpacity
                                key={tab.label}
                                onPress={() => setActiveTab(tab.label)}
                                style={[
                                  styles.webTab,
                                  activeTab === tab.label &&
                                    styles.webActiveTab,
                                ]}
                              >
                                <Image
                                  source={tab.icon}
                                  style={[
                                    styles.webTabIcon,
                                    activeTab === tab.label && {
                                      tintColor: "#fff",
                                    },
                                  ]}
                                  resizeMode="contain"
                                />

                                <Text
                                  style={[
                                    styles.webTabText,
                                    activeTab === tab.label &&
                                      styles.webActiveTabText,
                                  ]}
                                >
                                  {tab.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>

                        {/* FILE LIST (Vertical Scroll) */}
                        <View style={styles.webFileListWrapper}>
                          <ScrollView showsVerticalScrollIndicator>
                            {loading ? (
                              <Text
                                style={{ textAlign: "center", marginTop: 20 }}
                              >
                                Loading...
                              </Text>
                            ) : files.length === 0 ? (
                              <Text
                                style={{ textAlign: "center", marginTop: 20 }}
                              >
                                No documents found
                              </Text>
                            ) : (
                              files.map((file, index) => (
                                <View key={index} style={styles.webFileCard}>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.fileTitle}>
                                      {file.file_name ||
                                        file.filename ||
                                        file.name ||
                                        "Unknown File"}
                                    </Text>

                                    <Text style={styles.meta}>
                                      SIZE:{" "}
                                      {file.file_size || file.size || "N/A"} |
                                      Format:{" "}
                                      {file.file_type ||
                                        file.fileType ||
                                        file.type ||
                                        "N/A"}
                                    </Text>

                                    <Text style={styles.meta}>
                                      Date:{" "}
                                      {file.uploaded_at || file.created_at
                                        ? new Date(
                                            file.uploaded_at || file.created_at,
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </Text>
                                    <View style={styles.tag}>
                                      <Text style={styles.tagText}>
                                        {file.category?.replace("_", " ")}
                                      </Text>
                                    </View>
                                  </View>

                                  <Feather
                                    name="more-horizontal"
                                    size={18}
                                    color="#888"
                                  />
                                </View>
                              ))
                            )}
                          </ScrollView>
                        </View>
                      </View>

                      {/* RIGHT SECTION - CHATBOT */}
                      <View style={styles.chatbotSection}>
                        <View style={styles.chatbotHeader}>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                            style={styles.clinicalAILogo}
                          />
                          <Text style={styles.chatbotTitle}>
                            Clinical AI Assistant {"\n"}
                            <Text style={styles.smallDescription}>
                              You&apos;re not alone in this case, we&apos;re
                              here to assist.
                            </Text>
                          </Text>
                        </View>

                        {/* CHAT AREA (EMPTY — backend will handle) */}
                        <View style={styles.chatArea}>
                          <ScrollView showsVerticalScrollIndicator={false}>
                            {messages.map((msg, index) => (
                              <View
                                key={index}
                                style={{
                                  flexDirection:
                                    msg.type === "bot" ? "row" : "row-reverse",
                                  marginBottom: 10,
                                  alignItems: "flex-start",
                                }}
                              >
                                {msg.type === "bot" && (
                                  <Image
                                    source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      marginRight: 6,
                                    }}
                                  />
                                )}

                                <View
                                  style={{
                                    backgroundColor:
                                      msg.type === "user"
                                        ? "#FF7072"
                                        : "#F2F2F2",
                                    padding: 10,
                                    borderRadius: 10,
                                    maxWidth: "75%",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color:
                                        msg.type === "user" ? "#fff" : "#333",
                                    }}
                                  >
                                    {msg.text}
                                  </Text>
                                </View>
                              </View>
                            ))}
                            {/* {botTyping && loadingSteps === "" && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginTop: 6,
                                }}
                              >
                                <Image
                                  source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    marginRight: 6,
                                  }}
                                />

                                <View
                                  style={{
                                    backgroundColor: "#F2F2F2",
                                    padding: 10,
                                    borderRadius: 10,
                                    flexDirection: "row",
                                  }}
                                >
                                  <Text style={{ fontSize: 20 }}>{loadingSteps}</Text>
                                </View>
                              </View>
                            )} */}
                            {botTyping && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginTop: 6,
                                }}
                              >
                                <Image
                                  source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    marginRight: 6,
                                  }}
                                />

                                <View
                                  style={{
                                    backgroundColor: "#F2F2F2",
                                    padding: 10,
                                    borderRadius: 10,
                                    flexDirection: "row",
                                  }}
                                >
                                  <Text style={{ fontSize: 14 }}>
                                    {loadingSteps ||
                                      "Analyzing patient reports..."}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </ScrollView>
                        </View>

                        {/* INPUT SECTION */}
                        <View style={styles.chatInputContainer}>
                          {/* <TouchableOpacity onPress={pickImage}>
                            <Ionicons
                              name="image-outline"
                              size={22}
                              color="#888"
                            />
                          </TouchableOpacity> */}

                          <TextInput
                            placeholder="Ask something about reports..."
                            style={styles.chatInput}
                            value={question}
                            onChangeText={setQuestion}
                          />

                          <TouchableOpacity
                            style={styles.sendBtn}
                            onPress={sendMessage}
                          >
                            <Ionicons name="send" size={18} color="#fff" />
                          </TouchableOpacity>
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
        <ScrollView style={styles.container}>
          {/* HEADER */}
          <View
            style={[
              styles.header,
              Platform.OS === "web" ? { height: "auto" } : { height: "auto" },
            ]}
          >
            <HeaderLoginSignUp navigation={navigation} route={route} />
          </View>

          {/* TITLE */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Full case analysis</Text>
          </View>

          {/* ALERT */}
          {/* <View style={styles.alertBox}>
            <Image source={require("../../assets/Images/heartFullCase.png")} />
            <Text style={styles.alertText}>
              2 New Reports added since last review
            </Text>
          </View> */}

          {/* FILTER BUTTONS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsWrapper}
            contentContainerStyle={styles.tabs}
          >
            {/* ALL */}
            <TouchableOpacity
              onPress={() => setActiveTab("All")}
              style={[
                styles.tabCommon,
                activeTab === "All" ? styles.activeTab : styles.inactiveTab,
              ]}
            >
              <Image
                source={require("../../assets/DoctorsPortal/Icons/Allfullcase.png")}
                style={{ width: 16, height: 20 }}
                resizeMode="contain"
              />

              <Text
                style={
                  activeTab === "All" ? styles.activeTabText : styles.tabText
                }
              >
                All
              </Text>
            </TouchableOpacity>

            {/* PRESCRIPTION */}
            <TouchableOpacity
              onPress={() => setActiveTab("Prescription")}
              style={[
                styles.tabCommon,
                activeTab === "Prescription"
                  ? styles.activeTab
                  : styles.inactiveTab,
              ]}
            >
              <Image
                source={require("../../assets/DoctorsPortal/Icons/myPrescription.png")}
                style={{ width: 16, height: 20 }}
                resizeMode="contain"
              />

              <Text
                style={
                  activeTab === "Prescription"
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Prescriptions
              </Text>
            </TouchableOpacity>

            {/* SCAN REPORT */}
            <TouchableOpacity
              onPress={() => setActiveTab("Scan")}
              style={[
                styles.tabCommon,
                activeTab === "Scan" ? styles.activeTab : styles.inactiveTab,
              ]}
            >
              <Image
                source={require("../../assets/DoctorsPortal/Icons/scanReports.png")}
                style={{ width: 16, height: 20 }}
                resizeMode="contain"
              />

              <Text
                style={
                  activeTab === "Scan" ? styles.activeTabText : styles.tabText
                }
              >
                Scan Reports
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Lab")}
              style={[
                styles.tabCommon,
                activeTab === "Lab" ? styles.activeTab : styles.inactiveTab,
              ]}
            >
              <Image
                source={require("../../assets/DoctorsPortal/Icons/tubechemical.png")}
                style={{ width: 16, height: 20 }}
                resizeMode="contain"
              />

              <Text
                style={
                  activeTab === "Lab" ? styles.activeTabText : styles.tabText
                }
              >
                Lab Reports
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Hospital")}
              style={[
                styles.tabCommon,
                activeTab === "Hospital"
                  ? styles.activeTab
                  : styles.inactiveTab,
              ]}
            >
              <Image
                source={require("../../assets/DoctorsPortal/Icons/hospitalFullcase.png")}
                style={{ width: 16, height: 20 }}
                resizeMode="contain"
              />

              <Text
                style={
                  activeTab === "Hospital"
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Hospital History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Health")}
              style={[
                styles.tabCommon,
                activeTab === "Health" ? styles.activeTab : styles.inactiveTab,
              ]}
            >
              <Image
                source={require("../../assets/DoctorsPortal/Icons/heartShield.png")}
                style={{ width: 16, height: 20 }}
                resizeMode="contain"
              />

              <Text
                style={
                  activeTab === "Health" ? styles.activeTabText : styles.tabText
                }
              >
                Health Insurance & ID
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* DOCUMENT LIST */}
          {/* <View style={styles.docsCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {documents.map((item, index) => (
                <View key={index} style={styles.card}>
                  <View style={styles.fileIcon}>
                    <Feather name="file-text" size={22} color="#FF6B6B" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fileTitle}>Prescription 1</Text>

                    <Text style={styles.meta}>SIZE : 12 MB Format : PDF</Text>

                    <Text style={styles.meta}>
                      Date : 26-june-25 Time : 10:00 AM
                    </Text>
                  </View>

                  <View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>My Prescription</Text>
                    </View>

                    <Ionicons
                      name="ellipsis-horizontal"
                      size={18}
                      style={{ alignSelf: "flex-end", marginTop: 6 }}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View> */}
          <View style={styles.docsCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loading ? (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  Loading...
                </Text>
              ) : files.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  No documents found
                </Text>
              ) : (
                files.map((file, index) => (
                  <View key={index} style={styles.card}>
                    <View style={styles.fileIcon}>
                      <Feather name="file-text" size={22} color="#FF6B6B" />
                    </View>

                    <View style={{ flex: 1 }}>
                      {/* FILE NAME */}
                      <Text style={styles.fileTitle}>
                        {file.file_name ||
                          file.filename ||
                          file.name ||
                          "Unknown File"}
                      </Text>

                      {/* SIZE + FORMAT */}
                      <Text style={styles.meta}>
                        SIZE : {file.file_size || file.size || "N/A"} | Format :{" "}
                        {file.file_type || file.fileType || file.type || "N/A"}
                      </Text>

                      {/* DATE */}
                      <Text style={styles.meta}>
                        Date :{" "}
                        {file.uploaded_at || file.created_at
                          ? new Date(
                              file.uploaded_at || file.created_at,
                            ).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>

                    <View>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          {file.category
                            ? file.category.replace("_", " ")
                            : "General"}
                        </Text>
                      </View>

                      <Ionicons
                        name="ellipsis-horizontal"
                        size={18}
                        style={{ alignSelf: "flex-end", marginTop: 6 }}
                      />
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
          {/* AI BUTTON */}
          <View style={styles.aiButton}>
            <Text style={styles.aiText}>Clinical AI Assistant</Text>
          </View>

          {/* FLOATING BUTTON */}
          <TouchableOpacity style={styles.floatingBtn} onPress={openChat}>
            <Image
              source={require("../../assets/Images/floatingHeart.png")}
              style={{
                width: 55,
                height: 55,
                resizeMode: "cover",
              }}
            />
          </TouchableOpacity>

          {/* GENERATE BUTTON */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generatePrescriptionFromMedilocker}
            disabled={isGeneratingPrescription}
          >
            <Image
              source={require("../../assets/Images/BottomCTAfullcase.png")}
            />

            <Text style={styles.generateText}>
              {isGeneratingPrescription
                ? "Generating..."
                : "Generate Prescription"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {chatOpen && (
        <Animated.View style={[styles.mobileChatContainer, { top: slideAnim }]}>
          {/* Header */}
          <View style={styles.mobileChatHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text style={styles.mobileChatTitle}>Clinical AI Assistant</Text>
            </View>

            <TouchableOpacity onPress={closeChat}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          {/* Chat Area */}
          <View style={styles.mobileChatArea}>
            <ScrollView
              ref={scrollRef}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: msg.type === "bot" ? "row" : "row-reverse",
                    marginBottom: 10,
                    alignItems: "flex-start",
                  }}
                >
                  {msg.type === "bot" && (
                    <Image
                      source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                      style={{
                        width: 28,
                        height: 28,
                        marginRight: 6,
                      }}
                    />
                  )}

                  <View
                    style={{
                      backgroundColor:
                        msg.type === "user" ? "#FF7072" : "#F2F2F2",
                      padding: 10,
                      borderRadius: 10,
                      maxWidth: "75%",
                    }}
                  >
                    <Text
                      style={{
                        color: msg.type === "user" ? "#fff" : "#333",
                      }}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}
              {/* {botTyping && loadingSteps === "" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <Image
                    source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                    style={{
                      width: 28,
                      height: 28,
                      marginRight: 6,
                    }}
                  />

                  <View
                    style={{
                      backgroundColor: "#F2F2F2",
                      padding: 10,
                      borderRadius: 10,
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{loadingSteps}</Text>
                  </View>
                </View>
              )} */}
              {botTyping && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <Image
                    source={require("../../assets/DoctorsPortal/Icons/clinicalAILogo.png")}
                    style={{
                      width: 28,
                      height: 28,
                      marginRight: 6,
                    }}
                  />

                  <View
                    style={{
                      backgroundColor: "#F2F2F2",
                      padding: 10,
                      borderRadius: 10,
                      flexDirection: "row",
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>
                      {loadingSteps || "Analyzing patient reports..."}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
          {/* {selectedImage && (
            <View style={{ padding: 10 }}>
              <Image
                source={{ uri: selectedImage }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
            </View>
          )} */}

          {/* Input */}
          <View style={styles.mobileChatInput}>
            {/* <TouchableOpacity onPress={pickImage}>
              <Ionicons name="image-outline" size={22} color="#888" />
            </TouchableOpacity> */}

            <TextInput
              placeholder="Ask something about reports..."
              style={styles.chatInput}
              value={question}
              onChangeText={setQuestion}
            />

            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </>
  );
}
const windowWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    borderWidth: 1,
    height: "100%",
    width: "100%",
    borderColor: "#c10f0fff",
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
    //borderWidth: 2,
    flexDirection: "column",
  },
  fullCaseDetailSection: {
    borderWidth: 2,
    borderColor: "#0e0e0eff",
    width: "96%",
    height: "80%",
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  titleBox: {
    //borderWidth:1,
    width: "100%",
    height: "9%",
    backgroundColor: "#FCA2A21F",
  },
  titleText: {
    fontSize: 25,
    fontWeight: 600,
    marginTop: "1.5%",
    marginHorizontal: "3%",
  },
  upperSection: {
    //borderWidth:1,
    height: "10%",
    width: "100%",
    boxShadow: "rgba(17, 17, 26, 0.1) 0px 1px 0px",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upperLeftSection: {
    // borderWidth: 1,
    height: "75%",
    width: "30%",
    marginLeft: "4%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  caseAnalysisDocSection: {
    justifyContent: "flex-start",
    // borderWidth:1,
    width: "40%",
    height: "100%",
  },
  upperText: {
    fontSize: 15,
    fontWeight: 500,
    color: "#FF7072",
    alignSelf: "center",
    marginTop: "3%",
  },
  lowerText: {
    fontSize: 12,
    fontWeight: 400,
    color: "#8b8b8bff",
    marginLeft: "20%",
    marginTop: "1%",
  },
  filesUploadingCountSection: {
    borderWidth: 1,
    width: "50%",
    height: "60%",
    backgroundColor: "#FFF8F8",
    borderColor: "#FF7072",
    borderRadius: 5,
  },
  uploadingText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#FF7072",
    alignSelf: "center",
    marginTop: "2%",
  },
  generateBtn: {
    //borderWidth: 1,
    height: "50%",
    width: "18%",
    marginRight: "4%",
    borderRadius: 6,
    flexDirection: "row",
    backgroundColor: "#FF7072",
    justifyContent: "space-around",
    alignItems: "center",
  },
  btnIcon: {
    height: 22,
    width: 22,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
  },
  uploadedDocChatbotSection: {
    //borderWidth: 1,
    borderColor: "#2f0697ff",
    flex: 1,
    flexDirection: "row",
    padding: 20,
    gap: 20,
    marginTop: "1%",
    alignItems: "stretch",
    minHeight: 0,
  },

  medilockerSection: {
    width: "45%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    flexDirection: "column",
  },

  webTabsRow: {
    height: 50, // ← fixed height stops it from expanding
    flexShrink: 0, // ← prevents flex from squishing it
  },

  webTabsContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  webTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF7072",
    backgroundColor: "#fff",
    gap: 8,
  },

  webTabIcon: {
    width: 16,
    height: 16,
    tintColor: "#FF7072",
  },

  webActiveTab: {
    backgroundColor: "#FF7072",
  },

  webTabText: {
    color: "#FF7072",
    fontWeight: "500",
    fontSize: 13,
  },

  webActiveTabText: {
    color: "#fff",
  },

  webFileListWrapper: {
    flex: 1,
    marginTop: 10,
    minHeight: 0, // ← critical for web: allows flex child to shrink properly
  },

  webFileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F1F1",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  webFileTitle: {
    fontWeight: "600",
    fontSize: 14,
  },

  webFileMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  /* ================= RIGHT CHATBOT ================= */

  chatbotSection: {
    flex: 1, // ADD THIS (was width: "55%", keep that too)
    //width: "55%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    //display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  chatbotHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
    flexDirection: "row",
  },

  clinicalAILogo: {
    height: 20,
    width: 20,
  },

  chatbotTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: "1%",
  },

  smallDescription: {
    fontSize: 11,
    fontWeight: 500,
    color: "#999999",
  },

  chatArea: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },

  chatInputContainer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
  },

  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#FF7072",
    borderRadius: 8,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  // ****************** APP ****************** //
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: "6%",
  },

  header: {
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  logo: {
    fontWeight: "600",
    fontSize: 16,
  },

  titleSection: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#888",
    marginTop: 4,
  },

  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    padding: 12,
    gap: 8,
  },

  alertText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },

  activeTab: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    backgroundColor: "#FF7072",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  tab: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  tabText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },

  card: {
    borderWidth: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  fileIcon: {
    marginRight: 12,
  },

  fileTitle: {
    fontWeight: "600",
    fontSize: 15,
  },

  meta: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },

  tag: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  tagText: {
    color: "#FF6B6B",
    fontSize: 11,
  },

  aiButton: {
    marginTop: "2%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#FF707233",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  aiText: {
    fontSize: 16,
    color: "#F31A13",
    fontWeight: "700",
  },

  floatingBtn: {
    position: "absolute",
    right: 25,
    bottom: "8%",
    height: 72,
    width: 72,
    borderRadius: 36, // ✅ makes perfect circle
    backgroundColor: "#FF7072",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  generateButton: {
    alignSelf: "center",
    width: "75%",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FF7072",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    gap: 10,
    marginTop: "20%",
  },

  generateText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  docsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: windowWidth > 400 ? 420 : 270,
    marginTop: "4%",
  },
  tabs: {
    marginTop: "2%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
    paddingBottom: 10,
  },

  tabCommon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  inactiveTab: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FF7072",
  },
  tabsWrapper: {
    maxHeight: 63,
    //borderWidth:1
  },

  mobileChatContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 130, // ← set fixed top instead of animated, or keep slideAnim
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    // Remove height: height ← THIS is what pushes the send button off screen
  },

  mobileChatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  mobileChatTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  mobileChatArea: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },

  mobileChatInput: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
    alignItems: "center", // ← ADD THIS
  },
});
