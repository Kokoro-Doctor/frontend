import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  Text,
  Image,
  Animated,
  ScrollView,
} from "react-native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import * as DocumentPicker from "expo-document-picker";
//import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");
const UserDashboard = ({ navigation, route }) => {
  const { width } = useWindowDimensions();

  const [documents, setDocuments] = useState([]);
  const [issueDocs, setIssueDocs] = useState([]);
  const [appointmentData, setAppointmentData] = useState(null);
  const [consultationRemaining, setConsultationRemaining] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentDocuments = documents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(documents.length / itemsPerPage);

  // --------------------------
  // WEB FILE INPUT REFERENCES
  // --------------------------
  const uploadInputRef = useRef(null);
  const issueInputRef = useRef(null);

  // --------------------------
  // HOVER SCALE
  // --------------------------
  const HoverScale = ({ children, style }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onEnter = () => {
      Animated.timing(scale, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const onLeave = () => {
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    if (Platform.OS !== "web") {
      return <Animated.View style={[style]}>{children}</Animated.View>;
    }

    return (
      <Animated.View
        style={[style, { transform: [{ scale }] }]}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {children}
      </Animated.View>
    );
  };

  // --------------------------
  // TYPE COLORS
  // --------------------------
  const getTagColor = (type) => {
    switch (type) {
      case "Report":
        return { bg: "#FFD7A2", text: "#8A4A00", borderColor: "#8A4A00" };

      case "Scan":
        return { bg: "#AFE2CA", text: "#006644", borderColor: "#006644" };

      case "Lab test":
        return { bg: "#AFE2CA", text: "#004D33", borderColor: "#004D33" };

      case "Prescription":
        return { bg: "#FF92D3BF", text: "#A30063", borderColor: "#A30063" };

      default:
        return { bg: "#EEEEEE", text: "#444444", borderColor: "#444444" };
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Replace with your actual API
      const response = await fetch("https://your-backend.com/user/dashboard");

      if (!response.ok) throw new Error("Network response failed");

      const data = await response.json();

      // If backend sends valid data → use it
      setAppointmentData(data?.upcomingAppointment || null);
      setConsultationRemaining(data?.consultationRemaining || null);
    } catch (error) {
      console.log("Stats API error:", error);

      // Backend not ready → show default values
      setAppointmentData(null); // default = "No Appointment"
      setConsultationRemaining(null); // default = "0/0"
    }
  };
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // --------------------------
  // CROSS PLATFORM UPLOAD
  // --------------------------
  const handleUpload = async () => {
    if (Platform.OS === "web") {
      uploadInputRef.current?.click();
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      addDocs(result.assets);
    } catch (err) {
      console.log("Upload error:", err);
    }
  };

  const onWebUploadChange = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file, index) => ({
      id: Date.now() + index,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: file.name,
      format: "." + file.name.split(".").pop(),
      type: detectType(file.name),
      uri: URL.createObjectURL(file),
    }));

    setDocuments((prev) => [...prev, ...mapped]);
  };

  const addDocs = (assets) => {
    const newDocs = assets.map((file, index) => ({
      id: Date.now() + index,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: file.name,
      format: "." + file.name.split(".").pop(),
      type: detectType(file.name),
      uri: file.uri,
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const detectType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();

    if (["pdf"].includes(ext)) return "Report";
    if (["png", "jpg", "jpeg", "pdf"].includes(ext)) return "Scan";
    if (["txt", "doc", "docx"].includes(ext)) return "Prescription";
    if (["png", "jpg", "jpeg"].includes(ext)) return "Lab test";
    return "Other";
  };

  // --------------------------
  // ISSUE UPLOAD
  // --------------------------
  const handleIssueUpload = async () => {
    if (Platform.OS === "web") {
      issueInputRef.current?.click();
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      setIssueDocs((prev) => [
        ...prev,
        {
          name: file.name,
          uri: file.uri,
        },
      ]);
    } catch (err) {
      console.log("Issue Upload error:", err);
    }
  };

  const onWebIssueChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const mapped = files.map((file, index) => ({
      name: file.name,
      uri: URL.createObjectURL(file),
    }));

    setIssueDocs((prev) => [...prev, ...mapped]);
  };

  // --------------------------
  // LOCAL STORAGE (only web)
  // --------------------------
  useEffect(() => {
    if (Platform.OS === "web") {
      const saved = localStorage.getItem("medilocker_docs");
      if (saved) setDocuments(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      localStorage.setItem("medilocker_docs", JSON.stringify(documents));
    }
  }, [documents]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const saved = localStorage.getItem("issueDocs");
      if (saved) setIssueDocs(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      localStorage.setItem("issueDocs", JSON.stringify(issueDocs));
    }
  }, [issueDocs]);

  return (
    <>
      {/* Hidden inputs for Web */}
      {Platform.OS === "web" && (
        <>
          <input
            type="file"
            ref={uploadInputRef}
            onChange={onWebUploadChange}
            multiple
            style={{ display: "none" }}
          />
          <input
            type="file"
            ref={issueInputRef}
            onChange={onWebIssueChange}
            multiple
            style={{ display: "none" }}
          />
        </>
      )}
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <View style={styles.parent}>
            <View style={styles.Left}>
              <SideBarNavigation navigation={navigation} />
            </View>
            <View style={styles.Right}>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 70 }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.header}>
                  <HeaderLoginSignUp navigation={navigation} />
                </View>
                <HoverScale style={styles.userDetailSection}>
                  <View style={styles.userImageBox}></View>
                  <View style={styles.userdetailsBox}>
                    <Text style={styles.userName}>User</Text>
                    <View style={styles.packDetails}>
                      <View style={styles.packTextBox}>
                        <Text style={styles.packDetailsText}>
                          priority care pack
                        </Text>
                      </View>
                      <View style={styles.dateSection}></View>
                    </View>
                    <View style={styles.doctorAssignedDetails}>
                      {/* <Text style={styles.doctorAssignedText}>
                        Doctor Assigned :
                      </Text> */}
                      <Text style={styles.doctorAssignedText}>
                        Doctor Assigned:{" "}
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#000",
                          }}
                        >
                          {appointmentData
                            ? appointmentData.doctorName
                            : "Dr. Kislay Shrivastava"}
                          ,{" "}
                          {appointmentData
                            ? appointmentData.specialization
                            : "Interventional cardiologist, MBBS, MD, DNB"}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </HoverScale>
                <Text style={styles.headingText}>Subscription Usage Stats</Text>
                <View style={styles.cardSection}>
                  <HoverScale style={styles.cardView}>
                    <Image
                      source={require("../../assets/Icons/Subscription.png")}
                      style={styles.cardIcon}
                    />
                    <Text style={styles.cardText}>Medilocker</Text>
                    <View style={styles.cardSpecificDataSection}>
                      <Text style={styles.specificText}>
                        Unlimited document storage & uploads
                      </Text>
                    </View>
                  </HoverScale>
                  <HoverScale style={styles.cardView}>
                    <Image
                      source={require("../../assets/Icons/consulting.png")}
                      style={styles.cardIcon}
                    />
                    <Text style={styles.cardText}>Consultation Remaining</Text>
                    <View style={styles.cardSpecificDataSection}>
                      <Text style={styles.specificText}>
                        {consultationRemaining
                          ? `${consultationRemaining.used}/${consultationRemaining.total}`
                          : "0/0"}
                      </Text>
                    </View>
                  </HoverScale>
                  <HoverScale style={styles.cardView}>
                    <Image
                      source={require("../../assets/Icons/upcoming.png")}
                      style={styles.cardIcon}
                    />
                    <Text style={styles.cardText}>Upcoming Appointment</Text>
                    <View style={styles.cardSpecificDataSection}>
                      <Text style={styles.specificText}>
                        {appointmentData
                          ? appointmentData.date
                          : "No Appointment"}
                      </Text>
                    </View>
                  </HoverScale>
                  <HoverScale style={styles.cardView}>
                    <Image
                      source={require("../../assets/Icons/consulting.png")}
                      style={styles.cardIcon}
                    />
                    <Text style={styles.cardText}>AI Cardio Chatbot</Text>
                    <View style={styles.cardSpecificDataSection}>
                      <Text style={styles.specificText}>Unlimited Access</Text>
                    </View>
                  </HoverScale>
                </View>
                <Text style={styles.headingText}>Upcoming Appointment</Text>
                <HoverScale style={styles.doctorVideoAppointmentSection}>
                  <View style={styles.doctorDetail}>
                    <View style={styles.doctorImageBox}></View>
                    <View style={styles.doctorNameSpecializationSection}>
                      <Text
                        style={{ margin: "1%", fontSize: 16, fontWeight: 600 }}
                      >
                        {appointmentData
                          ? appointmentData.doctorName
                          : "Dr. Kislay Shrivastava"}
                      </Text>
                      <Text
                        style={{ margin: "1%", fontSize: 12, color: "#777" }}
                      >
                        {appointmentData
                          ? appointmentData.specialization
                          : "Interventional cardiologist, MBBS, MD, DNB"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.videoCallSection}>
                    <View style={styles.firstVideoSection}>
                      {/* <MaterialIcons name="videocam" size={18} color="#00C853" /> */}
                      <Image
                        source={require("../../assets/Icons/videocall.png")}
                        style={styles.videoCallIcon}
                      />
                      <Text style={styles.videoAppointmentText}>
                        Video Appointment
                      </Text>
                      <TouchableOpacity style={styles.videoCallButton}>
                        Join Call
                      </TouchableOpacity>
                    </View>
                    <View style={styles.videoAppointmentDate}>
                      <Text
                        style={{
                          marginLeft: "5%",
                          marginTop: "1%",
                          fontSize: 14,
                          color: "#f8f6f6ff",
                        }}
                      >
                        No Appointment
                      </Text>
                    </View>
                  </View>
                </HoverScale>
                <HoverScale style={styles.medilockerSection}>
                  <View style={styles.medilockerHeader}>
                    <View style={styles.medilockerImageTitle}>
                      <Image
                        source={require("../../assets/Icons/dashboardMedilocker.png")}
                        style={styles.medilockerImage}
                      />
                      <Text style={styles.medilockerTitle}>
                        Your Medilocker
                      </Text>
                    </View>

                    <View style={styles.medilockerActions}>
                      <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterButtonText}>Filter</Text>
                      </TouchableOpacity>

                      <View style={styles.searchBox}>
                        <Text style={styles.searchPlaceholder}>
                          Search For Document
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={handleUpload}
                      >
                        <Text style={styles.uploadButtonText}>
                          Upload Document
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* TABLE HEADER */}
                  <View style={styles.tableHeader}>
                    <Text style={styles.th}>Id</Text>
                    <Text style={styles.th}>Date</Text>
                    <Text style={styles.th}>Time</Text>
                    <Text style={styles.thLarge}>Document Name</Text>
                    <Text style={styles.th}>Format</Text>
                    <Text style={styles.th}>Type</Text>
                    <Text style={styles.th}>Action</Text>
                  </View>

                  {/* TABLE ROWS */}
                  {currentDocuments.map((row, index) => {
                    const tag = getTagColor(row.type);

                    return (
                      <View key={index} style={styles.tableRow}>
                        <Text style={styles.tdId}>#{row.id}</Text>
                        <Text style={styles.td}>{row.date}</Text>
                        <Text style={styles.td}>{row.time}</Text>
                        <Text style={styles.tdLarge}>{row.name}</Text>
                        <Text style={styles.td}>{row.format}</Text>

                        <View style={{ width: "7%" }}>
                          {" "}
                          <View
                            style={[
                              styles.tagBox,
                              {
                                backgroundColor: tag.bg,
                                borderColor: tag.borderColor,
                              },
                            ]}
                          >
                            {" "}
                            <Text style={[styles.tagText, { color: tag.text }]}>
                              {" "}
                              {row.type}{" "}
                            </Text>{" "}
                          </View>{" "}
                        </View>

                        <View style={{ width: "12%", alignItems: "center" }}>
                          <TouchableOpacity style={styles.actionAddButton}>
                            <Text style={styles.actionAddButtonText}>–</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  <View style={styles.paginationRow}>
                    <Text>
                      Showing {currentDocuments.length} of {documents.length}{" "}
                      Results
                    </Text>

                    <View style={styles.paginationNumbers}>
                      <Text
                        style={styles.paginationInactive}
                        onPress={() =>
                          currentPage > 1 && setCurrentPage(currentPage - 1)
                        }
                      >
                        Prev
                      </Text>

                      {[...Array(totalPages)].map((_, i) => (
                        <Text
                          key={i}
                          style={
                            currentPage === i + 1
                              ? styles.paginationActive
                              : styles.paginationInactive
                          }
                          onPress={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Text>
                      ))}

                      <Text
                        style={styles.paginationInactive}
                        onPress={() =>
                          currentPage < totalPages &&
                          setCurrentPage(currentPage + 1)
                        }
                      >
                        Next
                      </Text>
                    </View>
                  </View>
                </HoverScale>
                <Text style={styles.headingText}>Facing Any Issues</Text>
                <View style={styles.facingIssueSection}>
                  <View style={styles.facingIssueInnerBox}>
                    <TouchableOpacity onPress={handleIssueUpload}>
                      <Text style={styles.issueUploadPlaceholder}>
                        Upload report, prescription issue, or bug screenshot
                      </Text>
                    </TouchableOpacity>

                    {issueDocs.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 10 }}
                        contentContainerStyle={{
                          flexDirection: "row",
                          gap: 10,
                        }}
                      >
                        {issueDocs.map((doc, idx) => (
                          <View key={idx} style={styles.issueDocItem}>
                            <Text numberOfLines={1} style={styles.issueDocName}>
                              {doc.name}
                            </Text>

                            <TouchableOpacity
                              style={styles.issueRemoveBtn}
                              onPress={() => {
                                const updated = issueDocs.filter(
                                  (_, i) => i !== idx
                                );
                                setIssueDocs(updated);
                              }}
                            >
                              <Text style={styles.issueRemoveBtnText}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  <TouchableOpacity style={styles.submitIssueButton}>
                    <Text style={styles.submitIssueButtonText}>
                      Submit To Support Team
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.issueNoteText}>
                    Our Support team responds within 24 hours
                  </Text>
                </View>
              </ScrollView>
            </View>
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
    //height: "100%",
    flex: 1,
    width: "85%",
    borderWidth: 1,
    backgroundColor: "#f4f2f2ff",
    borderColor: "#c8c7c7ff",
  },
  header: {
    //borderWidth: 5,
    // borderColor: "black",
    paddingHorizontal: "2%",
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  userDetailSection: {
    borderWidth: 1,
    // height: "17%",
    height: "auto",
    width: "98%",
    borderColor: "#fff",
    backgroundColor: "#fff",
    alignSelf: "center",
    flexDirection: "row",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
  },
  userImageBox: {
    borderWidth: 1,
    height: "42%",
    width: "4%",
    marginVertical: "1%",
    marginHorizontal: "1%",
    borderColor: "#c8c7c7ff",
  },
  userdetailsBox: {
    marginVertical: "1%",
    marginHorizontal: "0%",
    height: "85%",
    width: "50%",
    //borderWidth: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 600,
    marginHorizontal: "1%",
  },
  packDetails: {
    height: "19%",
    width: "88%",
    //borderWidth: 1,
    flexDirection: "row",
    //justifyContent:"space-between"
  },
  packTextBox: {
    backgroundColor: "#E3F1FFBF",
    height: "100%",
    width: "20%",
  },
  packDetailsText: {
    color: "#007EFF",
    fontWeight: 500,
    fontSize: 11,
    alignSelf: "center",
  },
  dateSection: {
    height: "100%",
    width: "76%",
    //borderWidth: 1,
  },
  doctorAssignedDetails: {
    //borderWidth: 1,
    height: "48%",
    width: "100%",
    marginVertical: "1.5%",
  },
  doctorAssignedText: {
    fontSize: 14,
    fontWeight: 400,
    color: "#444444",
  },
  headingText: {
    // height: "4%",
    height: "auto",
    width: "98%",
    borderColor: "#fff",
    backgroundColor: "#fff",
    alignSelf: "center",
    marginVertical: "1%",
    fontSize: 17,
    fontWeight: 600,
    paddingHorizontal: "1%",
    paddingVertical: "0.1%",
    borderRadius: 5,
  },
  cardSection: {
    //borderWidth: 1,
    minHeight: 120,
    height: "auto",
    //height: "16%",
    width: "98%",
    alignSelf: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  cardView: {
    //borderWidth: 2,
    borderColor: "#760606ff",
    height: "100%",
    width: "24%",
    backgroundColor: "#fff",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
  },
  cardIcon: {
    height: "28%",
    width: "12%",
    marginVertical: "3%",
    marginHorizontal: "4%",
  },
  cardText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000",
    marginVertical: "2%",
    marginHorizontal: "4%",
  },
  cardSpecificDataSection: {
    height: "16%",
    width: "84%",
    //borderWidth: 1,
    marginVertical: "0.5%",
    marginHorizontal: "4%",
  },
  specificText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#FF7072",
  },
  doctorVideoAppointmentSection: {
    //borderWidth: 2,
    borderColor: "#760606ff",
    // height: "13%",
    minHeight: 110,
    height: "auto",
    width: "54%",
    backgroundColor: "#fff",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
    marginVertical: "0.1%",
    marginHorizontal: "1%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  doctorDetail: {
    //borderWidth:1,
    height: "100%",
    width: "53%",
    flexDirection: "row",
  },
  doctorImageBox: {
    borderWidth: 1,
    height: "40%",
    width: "12%",
    marginVertical: "4%",
    marginHorizontal: "4%",
    borderColor: "#c8c7c7ff",
  },
  doctorNameSpecializationSection: {
    height: "73%",
    width: "80%",
    //borderWidth: 1,
    marginVertical: "4%",
    borderColor: "#c8c7c7ff",
  },
  videoCallSection: {
    borderWidth: 2,
    height: "80%",
    width: "40%",
    marginVertical: "1.5%",
    marginRight: "5%",
    borderRadius: 5,
    borderColor: "#eceaeaff",
  },
  firstVideoSection: {
    height: "40%",
    width: "100%",
    //borderWidth: 1,
    flexDirection: "row",
    marginVertical: "3%",
  },
  videoCallIcon: {
    height: "30%",
    width: "5%",
    marginVertical: "4%",
    marginHorizontal: "2%",
  },
  videoAppointmentText: {
    fontSize: 12,
    fontWeight: 500,
    marginHorizontal: "2.5%",
    marginVertical: "2.5%",
  },
  videoCallButton: {
    backgroundColor: "#FF7072",
    color: "#fff",
    height: "80%",
    width: "26%",
    marginLeft: "20%",
    paddingLeft: "2.3%",
    paddingTop: "1%",
    borderRadius: 5,
  },
  videoAppointmentDate: {
    height: "30%",
    width: "70%",
    //borderWidth: 1,
    backgroundColor: "#408CFF",
    marginHorizontal: "1.5%",
    borderRadius: 5,
  },
  //   medilockerSection: {
  //     borderWidth: 1,
  //     // height: "40%",
  //     minHeight: 270,
  //     height: "auto",
  //     width: "97",
  //     marginVertical: "1%",
  //     marginHorizontal: "1%",
  //   },

  medilockerSection: {
    width: "98%",
    backgroundColor: "#fff",
    borderRadius: 8,
    alignSelf: "center",
    padding: "1%",
    marginVertical: "1%",
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
  },

  medilockerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  medilockerImageTitle: {
    height: "94%",
    width: "30%",
    //borderWidth: 1,
    flexDirection: "row",
  },

  medilockerImage: {
    height: 32,
    width: 34,
  },

  medilockerTitle: {
    fontSize: 17,
    fontWeight: 600,
    marginHorizontal: "5%",
  },

  medilockerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  filterButton: {
    backgroundColor: "#FFF1F2",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFD1D1",
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: 500,
  },

  searchBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: 200,
    height: 35,
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  searchPlaceholder: {
    fontSize: 12,
    color: "#999",
  },

  uploadButton: {
    backgroundColor: "#FF7072",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
  },

  uploadButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: 500,
  },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },

  th: {
    width: "12%",
    fontWeight: 600,
    fontSize: 12,
  },

  thLarge: {
    width: "25%",
    fontWeight: 600,
    fontSize: 12,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },

  td: {
    width: "12%",
    fontSize: 12,
  },
  tdId: {
    width: "12%",
    fontSize: 12,
    color: "#FFCC00",
  },

  tdLarge: {
    width: "25%",
    fontSize: 12,
  },

  tagBox: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 2,
  },

  tagText: {
    fontSize: 11,
    fontWeight: 500,
    color: "#444",
  },

  actionButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 14,
    marginHorizontal: "25%",
  },

  actionAddButton: {
    marginTop: 5,
    backgroundColor: "#FF7072",
    width: 28,
    height: 28,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  actionAddButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -2,
  },

  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    alignItems: "center",
  },

  paginationNumbers: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  paginationActive: {
    backgroundColor: "#408CFF",
    color: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  paginationInactive: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "#444",
  },
  facingIssueSection: {
    //borderWidth: 1,
    height: "19%",
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
  },
  facingIssueInnerBox: {
    // padding: "2%",
    // width: "100%",
    // height: "100%",
    width: "97%",
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#cdd3d8",
    backgroundColor: "#f4f7fb",
    borderRadius: 14,
    padding: "2%",
    justifyContent: "flex-start",
    alignSelf: "center",
    marginVertical: "1%",
  },

  //   issueUploadBox: {
  //     height: 130,
  //     borderWidth: 2,
  //     borderStyle: "dashed",
  //     borderColor: "#dddddd",
  //     backgroundColor: "#fafafa",
  //     borderRadius: 8,
  //     justifyContent: "center",
  //     paddingHorizontal: 20,
  //   },

  issueUploadPlaceholder: {
    color: "#8e8e8e",
    fontSize: 13,
  },

  issueFileName: {
    fontSize: 13,
    marginTop: 4,
    color: "#333",
  },

  issueDocItem: {
    minWidth: 140,
    maxWidth: 180,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    borderRadius: 8,
    position: "relative",
  },

  issueDocName: {
    fontSize: 12,
    color: "#333",
    maxWidth: 140,
  },

  issueRemoveBtn: {
    //position: "absolute",
    marginTop: "4%",
    marginLeft: "90%",
    backgroundColor: "#FF7072",
    width: 20,
    height: 20,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  issueRemoveBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: "0%",
  },

  submitIssueButton: {
    backgroundColor: "#FF7072",
    width: "15%",
    paddingVertical: "1%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "1%",
  },

  submitIssueButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  issueNoteText: {
    fontSize: 11,
    color: "#888",
    marginTop: "0.5%",
    marginHorizontal: "1%",
  },
});

export default UserDashboard;
