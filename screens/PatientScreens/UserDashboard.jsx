// import React, { useRef, useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   Dimensions,
//   Platform,
//   TouchableOpacity,
//   useWindowDimensions,
//   Text,
//   Image,
//   Animated,
//   ScrollView,
//   Linking,
//   StatusBar,
//   Alert,
// } from "react-native";
// import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
// import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
// import * as DocumentPicker from "expo-document-picker";
// import BackButton from "../../components/PatientScreenComponents/BackButton";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { API_URL } from "../../env-vars";
// import { FetchFromServer, download, remove } from "../../utils/MedilockerService";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// const { width, height } = Dimensions.get("window");

// const UserDashboard = ({ navigation }) => {
//   const { width } = useWindowDimensions();

//   const [user, setUser] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [issueDocs, setIssueDocs] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentDocuments = documents.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(documents.length / itemsPerPage);
//   const [activeSubscription, setActiveSubscription] = useState(null);
//   const [doctorData, setDoctorData] = useState(null);
//   const [appointmentData, setAppointmentData] = useState(null);
//   const [consultationRemaining, setConsultationRemaining] = useState(0);
//   const hasFetchedRef = useRef(false);

//   const uploadInputRef = useRef(null);
//   const issueInputRef = useRef(null);

//   // For the main document upload
//   const onWebUploadChange = (e) => {
//     const files = Array.from(e.target.files); // FileList -> Array
//     const newDocs = files.map((file) => ({
//       id: Date.now() + Math.random(),
//       date: new Date().toLocaleDateString(),
//       time: new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//       name: file.name,
//       format: "." + file.name.split(".").pop(),
//       type: detectType(file.name),
//       uri: URL.createObjectURL(file),
//     }));
//     setDocuments((prev) => [...prev, ...newDocs]);
//   };

//   // For the issue upload
//   const onWebIssueChange = (e) => {
//     const files = Array.from(e.target.files);
//     const newDocs = files.map((file) => ({
//       name: file.name,
//       uri: URL.createObjectURL(file),
//     }));
//     setIssueDocs((prev) => [...prev, ...newDocs]);
//   };

//   const HoverScale = ({ children, style }) => {
//     const scale = useRef(new Animated.Value(1)).current;
//     const onEnter = () => {
//       Animated.timing(scale, {
//         toValue: 1.02,
//         duration: 150,
//         useNativeDriver: true,
//       }).start();
//     };
//     const onLeave = () => {
//       Animated.timing(scale, {
//         toValue: 1,
//         duration: 150,
//         useNativeDriver: true,
//       }).start();
//     };
//     if (Platform.OS !== "web") {
//       return <Animated.View style={[style]}>{children}</Animated.View>;
//     }
//     return (
//       <Animated.View
//         style={[style, { transform: [{ scale }] }]}
//         onMouseEnter={onEnter}
//         onMouseLeave={onLeave}
//       >
//         {" "}
//         {children}{" "}
//       </Animated.View>
//     );
//   };

//   // ------------------ Utility ------------------
//   const getDoctorName = () =>
//     doctorData?.doctor?.doctorname || doctorData?.doctorname || "—";
//   const getDoctorSpecialization = () =>
//     doctorData?.doctor?.specialization || doctorData?.specialization || "";
//   const getDoctorExperience = () =>
//     doctorData?.doctor?.experience || doctorData?.experience
//       ? `${doctorData?.doctor?.experience || doctorData?.experience} exp`
//       : "";

//   const detectType = (fileName) => {
//     const ext = fileName.split(".").pop().toLowerCase();
//     if (["pdf"].includes(ext)) return "Report";
//     if (["png", "jpg", "jpeg", "pdf"].includes(ext)) return "Scan";
//     if (["txt", "doc", "docx"].includes(ext)) return "Prescription";
//     if (["png", "jpg", "jpeg"].includes(ext)) return "Lab test";
//     return "Other";
//   };

//   const getTagColor = (type) => {
//     switch (type) {
//       case "Report":
//         return { bg: "#FFD7A2", text: "#8A4A00", borderColor: "#8A4A00" };
//       case "Scan":
//         return { bg: "#AFE2CA", text: "#006644", borderColor: "#006644" };
//       case "Lab test":
//         return { bg: "#AFE2CA", text: "#004D33", borderColor: "#004D33" };
//       case "Prescription":
//         return { bg: "#FF92D3BF", text: "#A30063", borderColor: "#A30063" };
//       default:
//         return { bg: "#EEEEEE", text: "#444444", borderColor: "#444444" };
//     }
//   };

//   // ------------------ Fetch Functions ------------------

//   const isSubscriptionActiveByDate = (startDate, endDate) => {
//     const now = new Date();
//     return new Date(startDate) <= now && now <= new Date(endDate);
//   };

//   const fetchActiveSubscription = async (userId, doctorId) => {
//     console.log("💳 fetchActiveSubscription START");
//     console.log("➡️ userId:", userId);
//     console.log("➡️ doctorId:", doctorId);

//     try {
//       const url = `${API_URL}/booking/users/${userId}/subscriptions`;
//       console.log("🌐 Subscription URL:", url);

//       const res = await fetch(url);
//       console.log("📡 Subscription API status:", res.status);

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("❌ Subscription API failed:", text);
//         return null;
//       }

//       const subscriptions = await res.json();
//       console.log("📦 Subscriptions response:", subscriptions);

//       if (!Array.isArray(subscriptions)) {
//         console.warn("⚠️ Subscriptions is not an array");
//         return null;
//       }

//       // const active = subscriptions.find(
//       //   (sub) =>
//       //     sub.status === "ACTIVE" &&
//       //     isSubscriptionActiveByDate(sub.start_date, sub.end_date)
//       // );
//       const active = subscriptions.find(
//         (sub) =>
//           ["ACTIVE", "EXHAUSTED"].includes(sub.status) &&
//           isSubscriptionActiveByDate(sub.start_date, sub.end_date)
//       );

//       console.log("✅ Active subscription:", active || "NONE");
//       return active || null;
//     } catch (err) {
//       console.error("❌ fetchActiveSubscription ERROR:", err);
//       return null;
//     }
//   };

//   const fetchDoctor = async (doctorId) => {
//     console.log("👨‍⚕️ fetchDoctor START");
//     console.log("➡️ doctorId:", doctorId);

//     if (!doctorId) {
//       console.warn("⛔ fetchDoctor aborted — NO doctorId");
//       return null;
//     }

//     try {
//       const url = `${API_URL}/doctorsService/doctor/${doctorId}`;
//       console.log("🌐 Doctor URL:", url);

//       const res = await fetch(url);
//       console.log("📡 Doctor API status:", res.status);

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("❌ Doctor API failed:", text);
//         return null;
//       }

//       const data = await res.json();
//       console.log("📦 Doctor API response:", data);

//       console.log("🏁 fetchDoctor END");
//       return data;
//     } catch (err) {
//       console.error("❌ fetchDoctor EXCEPTION:", err);
//       return null;
//     }
//   };

//   const fetchDashboardData = async (userId) => {
//     console.log("🚀 fetchDashboardData START");

//     const subscription = await fetchActiveSubscription(userId);

//     if (!subscription) {
//       console.warn("⚠️ No active subscription");
//       return;
//     }

//     // setActiveSubscription(subscription);

//     // if (subscription.doctor_id) {
//     //   const doctor = await fetchDoctor(subscription.doctor_id);
//     //   if (doctor) setDoctorData(doctor);

//     //   const remaining =
//     //     subscription.appointments_total - subscription.appointments_used;

//     //   setConsultationRemaining(Math.max(remaining, 0));
//     // }

//     // // 🔥 Appointment is OPTIONAL
//     // await fetchUpcomingAppointment(userId);
//     setActiveSubscription(subscription);

//     if (subscription.doctor_id) {
//       const doctor = await fetchDoctor(subscription.doctor_id);
//       if (doctor) setDoctorData(doctor);
//     }

//     await fetchUpcomingAppointment(userId);

//     let used = subscription.appointments_used ?? 0;

//     if (!appointmentData) {
//       used = 0;
//     }

//     const remaining = subscription.appointments_total - used;
//     setConsultationRemaining(Math.max(remaining, 0));
//   };

//   const fetchUpcomingAppointment = async (userId) => {
//     console.log("📅 fetchUpcomingAppointment START");
//     console.log("➡️ userId:", userId);

//     try {
//       const url = `${API_URL}/booking/users/${userId}/bookings?type=upcoming`;
//       console.log("🌐 Upcoming Appointment URL:", url);

//       const res = await fetch(url);
//       console.log("📡 Upcoming Appointment status:", res.status);

//       if (!res.ok) {
//         const text = await res.text();
//         console.error("❌ Upcoming Appointment API failed:", text);
//         return;
//       }

//       const data = await res.json();
//       console.log("📦 Upcoming appointments response:", data);

//       if (!Array.isArray(data) || data.length === 0) {
//         console.warn("⚠️ No upcoming appointments found");
//         setAppointmentData(null);
//         return;
//       }

//       const booking = data[0];
//       console.log("📌 Selected booking:", booking);

//       setAppointmentData(booking);

//       console.log("🏁 fetchUpcomingAppointment END");
//     } catch (err) {
//       console.error("❌ fetchUpcomingAppointment EXCEPTION:", err);
//     }
//   };

//    const downloadFile = async (fileName) => {
//       try {
//         const data = await download(user?.user_id || user?.email, fileName);
//         const downloadUrl = data.download_url;

//         if (Platform.OS === "web") {
//           window.open(downloadUrl, "_blank");
//         } else {
//           await WebBrowser.openBrowserAsync(downloadUrl);
//         }
//       } catch (error) {
//         Alert.alert("Download Error", error.message);
//       }
//     };

//     const removeFile = async (fileName) => {
//         try {
//           const data = await remove(user?.user_id || user?.email, fileName);

//           setFiles(files.filter((file) => file.name !== fileName));
//           Alert.alert("Deleted", `${fileName} has been removed`);
//         } catch (error) {
//           Alert.alert("Error", error.message);
//         }
//       };

//   const shareFile = async (fileName) => {
//     try {
//       const data = await download(user?.user_id || user?.email, fileName);
//       const downloadUrl = data.download_url;

//       if (Platform.OS === "web") {
//         //Shorten URL
//         let urlToShare = downloadUrl;
//         try {
//           urlToShare = await shortenUrl(downloadUrl);
//         } catch (error) {
//           console.error("Failed to shorten URL:", error);
//         }

//         if (navigator.share) {
//           await navigator.share({
//             title: fileName,
//             url: urlToShare,
//             text: `Check out this file: ${fileName}`,
//           });
//         } else {
//           // Fallback to opening the download URL in a new tab.
//           window.open(downloadUrl, "_blank");
//         }
//       } else {
//         const localUri = FileSystem.cacheDirectory + fileName;

//         const downloadResult = await FileSystem.downloadAsync(
//           downloadUrl,
//           localUri
//         );

//         if (!(await Sharing.isAvailableAsync())) {
//           console.error("Sharing is not available on this device");
//           return;
//         }

//         await Sharing.shareAsync(downloadResult.uri);
//         await FileSystem.deleteAsync(downloadResult.uri);
//       }
//     } catch (error) {
//       console.error("Sharing error:", error);
//     }
//     setMenuVisible(false);
//   };
//   const addAmPm = (time) => {
//     if (!time) return "";

//     const hour = parseInt(time.split(":")[0], 10);
//     const ampm = hour >= 12 ? "PM" : "AM";

//     return `${time} ${ampm}`;
//   };

//   // ------------------ User Load ------------------
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         let storedUser;
//         if (Platform.OS === "web") {
//           storedUser = localStorage.getItem("@user");
//         } else {
//           storedUser = await AsyncStorage.getItem("@user");
//         }
//         if (storedUser) setUser(JSON.parse(storedUser));
//       } catch (err) {
//         console.error("❌ loadUser:", err);
//       }
//     };
//     loadUser();
//   }, []);

//   useEffect(() => {
//     if (!user?.user_id) return;
//     if (hasFetchedRef.current) return;

//     hasFetchedRef.current = true;
//     fetchDashboardData(user.user_id);
//   }, [user?.user_id]);

//   // ------------------ Fetch Medilocker Files ------------------
//   useEffect(() => {
//     if (!user) {
//       console.log("🚫 No user, skipping medilocker fetch");
//       return;
//     }

//     const loadFilesFromServer = async () => {
//       try {
//         const userIdentifier = user?.user_id || user?.email;
//         console.log("📁 Starting Medilocker fetch for:", userIdentifier);

//         if (!userIdentifier) {
//           console.warn("⚠️ No user identifier found");
//           return;
//         }

//         const data = await FetchFromServer(userIdentifier);
//         console.log("📦 FetchFromServer response:", data);

//         if (data?.files) {
//           console.log("✅ Files found:", data.files.length);

//           const mappedFiles = data.files.map((file) => ({
//             id: file.filename,
//             date: file.metadata.upload_date,
//             time: file.metadata.upload_time,
//             name: file.filename,
//             format: "." + file.metadata.file_type,
//             type: detectType(file.filename),
//             size: file.metadata.file_size,
//           }));

//           console.log("🔄 Mapped files:", mappedFiles);
//           console.log("📊 Setting", mappedFiles.length, "documents");

//           setDocuments(mappedFiles);
//           console.log("✨ Documents state updated");
//         } else {
//           console.warn("⚠️ No files property in response");
//         }
//       } catch (error) {
//         console.error("❌ Failed to fetch medilocker files:", error);
//       }
//     };

//     loadFilesFromServer();
//   }, [user]);

//   // ------------------ Handle Video Call ------------------
//   const handleJoinCall = () => {
//     if (!appointmentData?.meet_link) return;
//     if (Platform.OS === "web") window.open(appointmentData.meet_link, "_blank");
//     else Linking.openURL(appointmentData.meet_link);
//   };

//   // ------------------ Document Upload ------------------
//   const handleUpload = async () => {
//     if (Platform.OS === "web") return uploadInputRef.current?.click();
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*",
//         multiple: false,
//         copyToCacheDirectory: true,
//       });
//       if (result.canceled) return;
//       const file = result.assets[0];
//       setDocuments((prev) => [
//         ...prev,
//         {
//           id: Date.now(),
//           date: new Date().toLocaleDateString(),
//           time: new Date().toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           name: file.name,
//           format: "." + file.name.split(".").pop(),
//           type: detectType(file.name),
//           uri: file.uri,
//         },
//       ]);
//     } catch (err) {
//       console.error("❌ handleUpload:", err);
//     }
//   };

//   const handleIssueUpload = async () => {
//     if (Platform.OS === "web") return issueInputRef.current?.click();
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*",
//         multiple: true,
//         copyToCacheDirectory: true,
//       });
//       if (result.canceled) return;
//       const file = result.assets[0];
//       setIssueDocs((prev) => [...prev, { name: file.name, uri: file.uri }]);
//     } catch (err) {
//       console.error("❌ handleIssueUpload:", err);
//     }
//   };

//   // ------------------ Local Storage Web ------------------
//   // Only load from localStorage if no user data yet (initial load)
//   useEffect(() => {
//     if (Platform.OS === "web" && !user) {
//       console.log("💾 Loading documents from localStorage (initial load)");
//       const savedDocs = localStorage.getItem("medilocker_docs");
//       if (savedDocs) {
//         const parsed = JSON.parse(savedDocs);
//         console.log("📂 Loaded from localStorage:", parsed.length, "documents");
//         setDocuments(parsed);
//       } else {
//         console.log("📭 No saved documents in localStorage");
//       }
//     }
//   }, []);

//   // Persist documents to localStorage whenever they change
//   useEffect(() => {
//     if (Platform.OS === "web") {
//       console.log("💾 Saving", documents.length, "documents to localStorage");
//       localStorage.setItem("medilocker_docs", JSON.stringify(documents));
//     }
//   }, [documents]);

//   useEffect(() => {
//     if (Platform.OS === "web") {
//       const savedIssue = localStorage.getItem("issueDocs");
//       if (savedIssue) setIssueDocs(JSON.parse(savedIssue));
//     }
//   }, []);
//   useEffect(() => {
//     if (Platform.OS === "web")
//       localStorage.setItem("issueDocs", JSON.stringify(issueDocs));
//   }, [issueDocs]);

//   return (
//     <>
//       {/* Hidden inputs for Web */}
//       {Platform.OS === "web" && (
//         <>
//           <input
//             type="file"
//             ref={uploadInputRef}
//             onChange={onWebUploadChange}
//             multiple
//             style={{ display: "none" }}
//           />
//           <input
//             type="file"
//             ref={issueInputRef}
//             onChange={onWebIssueChange}
//             multiple
//             style={{ display: "none" }}
//           />
//         </>
//       )}
//       {Platform.OS === "web" && width > 1000 && (
//         <View style={styles.webContainer}>
//           <View style={styles.parent}>
//             <View style={styles.Left}>
//               <SideBarNavigation navigation={navigation} />
//             </View>
//             <View style={styles.Right}>
//               <ScrollView
//                 style={{ flex: 1 }}
//                 contentContainerStyle={{ paddingBottom: 70 }}
//                 showsVerticalScrollIndicator={false}
//               >
//                 <View style={styles.header}>
//                   <HeaderLoginSignUp navigation={navigation} />
//                 </View>
//                 <BackButton />
//                 <HoverScale style={styles.userDetailSection}>
//                   {/* <View style={styles.userImageBox}></View> */}
//                   <View style={styles.userImageBox}>
//                     {user?.picture ? (
//                       <Image
//                         source={{ uri: user.picture }}
//                         style={styles.userAvatar}
//                       />
//                     ) : (
//                       <Text style={styles.userInitial}>
//                         {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
//                       </Text>
//                     )}
//                   </View>

//                   <View style={styles.userdetailsBox}>
//                     <Text style={styles.userName}>{user?.name || "User"}</Text>

//                     <View style={styles.packDetails}>
//                       <View style={styles.packTextBox}>
//                         <Text style={styles.packDetailsText}>
//                           priority care pack
//                         </Text>
//                       </View>
//                       <View style={styles.dateSection}>
//                         {activeSubscription && (
//                           <Text
//                             style={{
//                               fontSize: 12,
//                               fontWeight: 500,
//                               color: "#666",
//                             }}
//                           >
//                             {new Date(
//                               activeSubscription.start_date
//                             ).toLocaleDateString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                             })}
//                             {" - "}
//                             {new Date(
//                               activeSubscription.end_date
//                             ).toLocaleDateString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                             })}
//                           </Text>
//                         )}
//                       </View>
//                     </View>
//                     <View style={styles.doctorAssignedDetails}>
//                       <Text style={styles.doctorAssignedText}>
//                         Doctor Assigned:{" "}
//                         <Text
//                           style={{
//                             fontSize: 14,
//                             fontWeight: 600,
//                             color: "#000",
//                           }}
//                         >
//                           {getDoctorName()}, {getDoctorSpecialization()},{" "}
//                           {getDoctorExperience()}
//                         </Text>
//                       </Text>
//                     </View>
//                   </View>
//                 </HoverScale>
//                 <Text style={styles.headingText}>Subscription Usage Stats</Text>
//                 <View style={styles.cardSection}>
//                   <HoverScale style={styles.cardView}>
//                     <Image
//                       source={require("../../assets/Icons/Subscription.png")}
//                       style={styles.cardIcon}
//                     />
//                     <Text style={styles.cardText}>Medilocker</Text>
//                     <View style={styles.cardSpecificDataSection}>
//                       <Text style={styles.specificText}>
//                         Unlimited document storage & uploads
//                       </Text>
//                     </View>
//                   </HoverScale>
//                   <HoverScale style={styles.cardView}>
//                     <Image
//                       source={require("../../assets/Icons/consulting.png")}
//                       style={styles.cardIcon}
//                     />
//                     <Text style={styles.cardText}>Consultation Remaining</Text>
//                     <View style={styles.cardSpecificDataSection}>
//                       <Text style={styles.specificText}>
//                         {activeSubscription
//                           ? `${consultationRemaining}/${activeSubscription.appointments_total}`
//                           : "0/0"}
//                       </Text>
//                     </View>
//                   </HoverScale>
//                   <HoverScale style={styles.cardView}>
//                     <Image
//                       source={require("../../assets/Icons/upcoming.png")}
//                       style={styles.cardIcon}
//                     />
//                     <Text style={styles.cardText}>Upcoming Appointment</Text>
//                     <View style={styles.cardSpecificDataSection}>
//                       <Text style={styles.specificText}>
//                         {appointmentData
//                           ? `${appointmentData.date} at ${addAmPm(
//                               appointmentData.start_time
//                             )}`
//                           : "No Appointment"}
//                       </Text>
//                     </View>
//                   </HoverScale>
//                   <HoverScale style={styles.cardView}>
//                     <Image
//                       source={require("../../assets/Icons/consulting.png")}
//                       style={styles.cardIcon}
//                     />
//                     <Text style={styles.cardText}>AI Cardio Chatbot</Text>
//                     <View style={styles.cardSpecificDataSection}>
//                       <Text style={styles.specificText}>Unlimited Access</Text>
//                     </View>
//                   </HoverScale>
//                 </View>
//                 <Text style={styles.headingText}>Upcoming Appointment</Text>
//                 <HoverScale style={styles.doctorVideoAppointmentSection}>
//                   <View style={styles.doctorDetail}>
//                     <View style={styles.doctorImageBox}></View>
//                     <View style={styles.doctorNameSpecializationSection}>
//                       <Text
//                         style={{ margin: "1%", fontSize: 16, fontWeight: 600 }}
//                       >
//                         {getDoctorName()}
//                       </Text>
//                       <Text
//                         style={{ margin: "1%", fontSize: 12, color: "#777" }}
//                       >
//                         {getDoctorSpecialization()}, {getDoctorExperience()}
//                       </Text>
//                     </View>
//                   </View>
//                   <View style={styles.videoCallSection}>
//                     <View style={styles.firstVideoSection}>
//                       {/* <MaterialIcons name="videocam" size={18} color="#00C853" /> */}
//                       <Image
//                         source={require("../../assets/Icons/videocall.png")}
//                         style={styles.videoCallIcon}
//                       />
//                       <Text style={styles.videoAppointmentText}>
//                         Video Appointment
//                       </Text>

//                       <TouchableOpacity
//                         style={[
//                           styles.videoCallButton,
//                           { opacity: appointmentData?.meet_link ? 1 : 0.3 },
//                         ]}
//                         disabled={!appointmentData?.meet_link}
//                         onPress={handleJoinCall}
//                       >
//                         <Text style={{ color: "#fff", fontWeight: "600" }}>
//                           Join Call
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                     <View style={styles.videoAppointmentDate}>
//                       <Text
//                         style={{
//                           marginLeft: "5%",
//                           marginTop: "1%",
//                           fontSize: 14,
//                           color: "#f8f6f6ff",
//                         }}
//                       >
//                         {appointmentData
//                           ? `${appointmentData.date} at ${addAmPm(
//                               appointmentData.start_time
//                             )}`
//                           : "No Appointment"}
//                       </Text>
//                     </View>
//                   </View>
//                 </HoverScale>
//                 <HoverScale style={styles.medilockerSection}>
//                   <View style={styles.medilockerHeader}>
//                     <View style={styles.medilockerImageTitle}>
//                       <Image
//                         source={require("../../assets/Icons/dashboardMedilocker.png")}
//                         style={styles.medilockerImage}
//                       />
//                       <Text style={styles.medilockerTitle}>
//                         Your Medilocker
//                       </Text>
//                     </View>

//                     <View style={styles.medilockerActions}>
//                       <TouchableOpacity style={styles.filterButton}>
//                         <Text style={styles.filterButtonText}>Filter</Text>
//                       </TouchableOpacity>

//                       <View style={styles.searchBox}>
//                         <Text style={styles.searchPlaceholder}>
//                           Search For Document
//                         </Text>
//                       </View>

//                       <TouchableOpacity
//                         style={styles.uploadButton}
//                         onPress={handleUpload}
//                       >
//                         <Text style={styles.uploadButtonText}>
//                           Upload Document
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>

//                   {/* TABLE HEADER */}
//                   <View style={styles.tableHeader}>
//                     <Text style={styles.th}>Id</Text>
//                     <Text style={styles.th}>Date</Text>
//                     <Text style={styles.th}>Time</Text>
//                     <Text style={styles.thLarge}>Document Name</Text>
//                     <Text style={styles.th}>Format</Text>
//                     <Text style={styles.th}>Type</Text>
//                     <Text style={styles.the}>Action</Text>
//                   </View>

//                   {/* TABLE ROWS */}
//                   {currentDocuments.map((row, index) => {
//                     const tag = getTagColor(row.type);

//                     return (
//                       <View key={index} style={styles.tableRow}>
//                         <Text style={styles.tdId}>#{row.id}</Text>
//                         <Text style={styles.td}>{row.date}</Text>
//                         <Text style={styles.td}>{row.time}</Text>
//                         <Text style={styles.tdLarge}>{row.name}</Text>
//                         <Text style={styles.td}>{row.format}</Text>

//                         <View style={{ width: "7%" }}>
//                           {" "}
//                           <View
//                             style={[
//                               styles.tagBox,
//                               {
//                                 backgroundColor: tag.bg,
//                                 borderColor: tag.borderColor,
//                               },
//                             ]}
//                           >
//                             {" "}
//                             <Text style={[styles.tagText, { color: tag.text }]}>
//                               {" "}
//                               {row.type}{" "}
//                             </Text>{" "}
//                           </View>{" "}
//                         </View>

//                         <View style={styles.actionButtons}>
//                           {/* Download Button */}
//                           <TouchableOpacity
//                             onPress={() => downloadFile(row)}
//                           >
//                             <MaterialIcons
//                               name="file-download"
//                               size={24}
//                               color="#FF7072"
//                             />
//                           </TouchableOpacity>

//                           {/* Delete Button */}
//                           <TouchableOpacity
//                             onPress={() => removeFile(row)}
//                           >
//                             <MaterialIcons
//                               name="delete"
//                               size={24}
//                               color="#FF7072"
//                             />
//                           </TouchableOpacity>

//                           {/* Share Button */}
//                           <TouchableOpacity
//                             onPress={() => shareFile(row)}
//                           >
//                             <MaterialIcons
//                               name="share"
//                               size={24}
//                               color="#FF7072"
//                             />
//                           </TouchableOpacity>
//                         </View>
//                       </View>
//                     );
//                   })}

//                   <View style={styles.paginationRow}>
//                     <Text>
//                       Showing {currentDocuments.length} of {documents.length}{" "}
//                       Results
//                     </Text>

//                     <View style={styles.paginationNumbers}>
//                       <Text
//                         style={styles.paginationInactive}
//                         onPress={() =>
//                           currentPage > 1 && setCurrentPage(currentPage - 1)
//                         }
//                       >
//                         Prev
//                       </Text>

//                       {[...Array(totalPages)].map((_, i) => (
//                         <Text
//                           key={i}
//                           style={
//                             currentPage === i + 1
//                               ? styles.paginationActive
//                               : styles.paginationInactive
//                           }
//                           onPress={() => setCurrentPage(i + 1)}
//                         >
//                           {i + 1}
//                         </Text>
//                       ))}

//                       <Text
//                         style={styles.paginationInactive}
//                         onPress={() =>
//                           currentPage < totalPages &&
//                           setCurrentPage(currentPage + 1)
//                         }
//                       >
//                         Next
//                       </Text>
//                     </View>
//                   </View>
//                 </HoverScale>
//                 <Text style={styles.headingText}>Facing Any Issues</Text>
//                 <View style={styles.facingIssueSection}>
//                   <View style={styles.facingIssueInnerBox}>
//                     <TouchableOpacity onPress={handleIssueUpload}>
//                       <Text style={styles.issueUploadPlaceholder}>
//                         Upload report, prescription issue, or bug screenshot
//                       </Text>
//                     </TouchableOpacity>

//                     {issueDocs.length > 0 && (
//                       <ScrollView
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                         style={{ marginTop: 10 }}
//                         contentContainerStyle={{
//                           flexDirection: "row",
//                           gap: 10,
//                         }}
//                       >
//                         {issueDocs.map((doc, idx) => (
//                           <View key={idx} style={styles.issueDocItem}>
//                             <Text numberOfLines={1} style={styles.issueDocName}>
//                               {doc.name}
//                             </Text>

//                             <TouchableOpacity
//                               style={styles.issueRemoveBtn}
//                               onPress={() => {
//                                 const updated = issueDocs.filter(
//                                   (_, i) => i !== idx
//                                 );
//                                 setIssueDocs(updated);
//                               }}
//                             >
//                               <Text style={styles.issueRemoveBtnText}>✕</Text>
//                             </TouchableOpacity>
//                           </View>
//                         ))}
//                       </ScrollView>
//                     )}
//                   </View>
//                   <TouchableOpacity style={styles.submitIssueButton}>
//                     <Text style={styles.submitIssueButtonText}>
//                       Submit To Support Team
//                     </Text>
//                   </TouchableOpacity>

//                   <Text style={styles.issueNoteText}>
//                     Our Support team responds within 24 hours
//                   </Text>
//                 </View>
//               </ScrollView>
//             </View>
//           </View>
//         </View>
//       )}
//       {(Platform.OS !== "web" || width < 1000) && (
//         <ScrollView style={styles.appContainer}>
//           <StatusBar barStyle="light-content" backgroundColor="#fff" />
//           <View
//             style={[
//               styles.header,
//               Platform.OS === "web" ? { height: "auto" } : { height: "15%" },
//             ]}
//           >
//             <HeaderLoginSignUp navigation={navigation} />
//           </View>
//           <HoverScale
//             style={[
//               styles.appUserDetailSection,
//               Platform.OS === "web" ? { marginTop: "3%" } : {},
//             ]}
//           >
//             {/* <View style={styles.userImageBox}></View> */}
//             <View style={styles.appUserImageBox}>
//               {user?.picture ? (
//                 <Image
//                   source={{ uri: user.picture }}
//                   style={styles.appUserAvatar}
//                 />
//               ) : (
//                 <Text style={styles.appUserInitial}>
//                   {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
//                 </Text>
//               )}
//             </View>

//             <View style={styles.appUserDetailsBox}>
//               <Text style={styles.appUserName}>{user?.name || "User"}</Text>

//               <View style={styles.appPackDetails}>
//                 <View style={styles.appPackTextBox}>
//                   <Text style={styles.appPackDetailsText}>
//                     {activeSubscription?.plan_price
//                       ? `₹${activeSubscription.plan_price}`
//                       : ""}{" "}
//                     priority care pack
//                   </Text>
//                 </View>
//                 <View style={styles.appDateSection}>
//                   {activeSubscription && (
//                     <Text
//                       style={{
//                         fontSize: 13,
//                         fontWeight: 500,
//                         color: "#888787ff",
//                       }}
//                     >
//                       {new Date(
//                         activeSubscription.start_date
//                       ).toLocaleDateString("en-IN", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                       {" - "}
//                       {new Date(activeSubscription.end_date).toLocaleDateString(
//                         "en-IN",
//                         {
//                           day: "2-digit",
//                           month: "short",
//                           year: "numeric",
//                         }
//                       )}
//                     </Text>
//                   )}
//                 </View>
//               </View>
//               <View style={styles.appDoctorAssignedDetails}>
//                 <Text style={styles.appDoctorAssignedText}>
//                   Doctor Assigned:{" "}
//                   <Text
//                     style={{
//                       fontSize: 14,
//                       fontWeight: 600,
//                       color: "#000",
//                     }}
//                   >
//                     {getDoctorName()}, {getDoctorSpecialization()},{" "}
//                     {getDoctorExperience()}
//                   </Text>
//                 </Text>
//               </View>
//             </View>
//           </HoverScale>
//           <Text style={styles.appHeadingText}>Subscription Usage Stats</Text>
//           <View style={styles.appCardSection}>
//             <HoverScale style={styles.appCardView}>
//               <Image
//                 source={require("../../assets/Icons/Subscription.png")}
//                 style={styles.appCardIcon}
//               />
//               <Text style={styles.appCardText}>Medilocker</Text>
//               <View style={styles.appCardSpecificDataSection}>
//                 <Text style={styles.appSpecificText}>
//                   Unlimited document storage & uploads
//                 </Text>
//               </View>
//             </HoverScale>
//             <HoverScale style={styles.appCardView}>
//               <Image
//                 source={require("../../assets/Icons/consulting.png")}
//                 style={styles.appCardIcon}
//               />
//               <Text style={styles.appCardText}>Consultation Remaining</Text>
//               <View style={styles.appCardSpecificDataSection}>
//                 <Text style={styles.appSpecificText}>
//                   {activeSubscription
//                     ? `${consultationRemaining}/${activeSubscription.appointments_total}`
//                     : "0/0"}
//                 </Text>
//               </View>
//             </HoverScale>
//             <HoverScale style={styles.appCardView}>
//               <Image
//                 source={require("../../assets/Icons/upcoming.png")}
//                 style={styles.appCardIcon}
//               />
//               <Text style={styles.appCardText}>Upcoming Appointment</Text>
//               <View style={styles.appCardSpecificDataSection}>
//                 <Text style={styles.appSpecificText}>
//                   {/* {appointmentData ? appointmentData.date : "No Appointment"} */}
//                   {appointmentData
//                     ? `${appointmentData.date} at ${addAmPm(
//                         appointmentData.start_time
//                       )}`
//                     : "No Appointment"}
//                 </Text>
//               </View>
//             </HoverScale>
//             <HoverScale style={styles.appCardView}>
//               <Image
//                 source={require("../../assets/Icons/consulting.png")}
//                 style={styles.appCardIcon}
//               />
//               <Text style={styles.appCardText}>AI Cardio Chatbot</Text>
//               <View style={styles.appCardSpecificDataSection}>
//                 <Text style={styles.appSpecificText}>Unlimited Access</Text>
//               </View>
//             </HoverScale>
//           </View>
//           <Text style={styles.appHeadingText}>Upcoming Appointment</Text>
//           <HoverScale style={styles.appDoctorVideoAppointmentSection}>
//             <View style={styles.appDoctorDetail}>
//               <View style={styles.appDoctorImageBox}></View>
//               <View style={styles.appDoctorNameSpecializationSection}>
//                 <Text style={{ margin: "1%", fontSize: 16, fontWeight: 600 }}>
//                   {getDoctorName()}
//                 </Text>
//                 <Text style={{ margin: "1%", fontSize: 12, color: "#777" }}>
//                   {getDoctorSpecialization()}, {getDoctorExperience()}
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.appvideoCallSection}>
//               <Text style={styles.appVideoAppointmentText}>
//                 Video Appointment
//               </Text>
//               <View style={styles.appvideoAppointmentDate}>
//                 <Text
//                   style={{
//                     marginLeft: "5%",
//                     marginTop: "1%",
//                     fontSize: 14,
//                     color: "#f8f6f6ff",
//                   }}
//                 >
//                   {/* {appointmentData
//                     ? `${appointmentData.date} at ${appointmentData.start_time}`
//                     : "No Appointment"} */}
//                   {appointmentData
//                     ? `${appointmentData.date} at ${addAmPm(
//                         appointmentData.start_time
//                       )}`
//                     : "No Appointment"}
//                 </Text>
//               </View>
//             </View>
//             <TouchableOpacity
//               style={[
//                 styles.appVideoCallButton,
//                 { opacity: appointmentData?.meet_link ? 1 : 0.3 },
//               ]}
//               disabled={!appointmentData?.meet_link}
//               onPress={handleJoinCall}
//             >
//               <Text
//                 style={{
//                   color: "#fff",
//                   fontWeight: "600",
//                   alignSelf: "center",
//                   fontSize: 20,
//                   marginTop: "3%",
//                 }}
//               >
//                 Join Call
//               </Text>
//             </TouchableOpacity>
//           </HoverScale>

//           <Text style={styles.appHeadingText}>Facing Any Issues</Text>
//           <View style={styles.appFacingIssueSection}>
//             <View style={styles.appFacingIssueInnerBox}>
//               <TouchableOpacity onPress={handleIssueUpload}>
//                 <Text style={styles.appIssueUploadPlaceholder}>
//                   Upload report, prescription issue, or bug screenshot
//                 </Text>
//               </TouchableOpacity>

//               {issueDocs.length > 0 && (
//                 <ScrollView
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   style={{ marginTop: 10 }}
//                   contentContainerStyle={{
//                     flexDirection: "row",
//                     gap: 10,
//                   }}
//                 >
//                   {issueDocs.map((doc, idx) => (
//                     <View key={idx} style={styles.appIssueDocItem}>
//                       <Text numberOfLines={1} style={styles.appIssueDocName}>
//                         {doc.name}
//                       </Text>

//                       <TouchableOpacity
//                         style={styles.appIssueRemoveBtn}
//                         onPress={() => {
//                           const updated = issueDocs.filter((_, i) => i !== idx);
//                           setIssueDocs(updated);
//                         }}
//                       >
//                         <Text style={styles.appIssueRemoveBtnText}>✕</Text>
//                       </TouchableOpacity>
//                     </View>
//                   ))}
//                 </ScrollView>
//               )}
//             </View>
//             <TouchableOpacity style={styles.appSubmitIssueButton}>
//               <Text style={styles.appSubmitIssueButtonText}>
//                 Submit To Support Team
//               </Text>
//             </TouchableOpacity>

//             <Text style={styles.appIssueNoteText}>
//               Our Support team responds within 24 hours
//             </Text>
//           </View>
//         </ScrollView>
//       )}
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   webContainer: {
//     flex: 1,
//     height: "100%",
//     width: "100%",
//     backgroundColor: "#fff",
//     flexDirection: "row",
//   },

//   appContainer: {
//     flex: 1,
//     height: "100%",
//     //width: "100%",
//     borderWidth: 1,
//     flexDirection: "column",
//     backgroundColor: "#fcfafaff",
//     padding: "1%",
//   },

//   parent: {
//     flexDirection: "row",
//     height: "100%",
//     width: "100%",
//   },
//   Left: {
//     height: "100%",
//     width: "15%",
//     //borderWidth: 1,
//   },
//   Right: {
//     //height: "100%",
//     flex: 1,
//     width: "85%",
//     borderWidth: 1,
//     backgroundColor: "#f4f2f2ff",
//     borderColor: "#c8c7c7ff",
//   },
//   header: {
//     //borderWidth: 5,
//     //paddingHorizontal: "2%",
//     zIndex: 2,
//     ...Platform.select({
//       web: {
//         width: "98.5%",
//         //borderWidth:1,
//         backgroundColor:"#f29292ff",
//         paddingHorizontal:"0.5%",
//         alignSelf:"center",
//         borderRadius:5
//       },
//     }),
//   },
//    actionButtons: {
//     flexDirection: "row",
//     flex: 1,
//     justifyContent: "center", // Ensures equal spacing
//     alignItems: "center",
//   },
//   userDetailSection: {
//     borderWidth: 1,
//     // height: "17%",
//     height: "auto",
//     width: "98%",
//     borderColor: "#fff",
//     backgroundColor: "#fff",
//     alignSelf: "center",
//     flexDirection: "row",
//     boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
//     borderRadius: 5,
//   },
//   appUserDetailSection: {
//     borderWidth: 1,
//     height: "15%",
//     //height: "auto",
//     width: "98%",
//     borderColor: "#fff",
//     backgroundColor: "#fff",
//     alignSelf: "center",
//     flexDirection: "row",
//     boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
//     borderRadius: 5,
//   },
//   userImageBox: {
//     //borderWidth: 1,
//     height: "48%",
//     width: "4%",
//     marginVertical: "1%",
//     marginHorizontal: "1%",
//     borderColor: "#c8c7c7ff",
//     borderRadius: 50,
//   },
//   appUserImageBox: {
//     borderWidth: 1,
//     height: "32%",
//     width: "13%",
//     marginVertical: "1%",
//     marginHorizontal: "0.5%",
//     borderColor: "#c8c7c7ff",
//     borderRadius: 50,
//   },
//   userAvatar: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 50,
//   },
//   appUserAvatar: {
//     width: "90%",
//     height: "90%",
//     borderRadius: 50,
//   },
//   userInitial: {
//     fontSize: 32,
//     fontWeight: "600",
//     color: "#FF7072",
//     borderWidth: 1,
//     borderRadius: 50,
//     width: "100%",
//     height: "100%",
//     textAlign: "center",
//     borderColor: "#e1e0e0ff",
//   },
//   appUserInitial: {
//     fontSize: 26,
//     fontWeight: "600",
//     color: "#FF7072",
//     borderWidth: 1,
//     borderRadius: 50,
//     width: "100%",
//     height: "100%",
//     textAlign: "center",
//     borderColor: "#e1e0e0ff",
//   },
//   userdetailsBox: {
//     marginVertical: "1%",
//     marginHorizontal: "0%",
//     height: "85%",
//     width: "50%",
//     //borderWidth: 1,
//   },
//   appUserDetailsBox: {
//     //borderWidth: 1,
//     height: "100%",
//     width: "87%",
//   },

//   userName: {
//     fontSize: 19,
//     fontWeight: 600,
//     marginHorizontal: "0%",
//     //borderWidth:1
//   },
//   appUserName: {
//     fontSize: 18,
//     fontWeight: 600,
//     marginHorizontal: "0%",
//   },
//   packDetails: {
//     height: "19%",
//     width: "88%",
//     //borderWidth: 1,
//     flexDirection: "row",
//     //justifyContent:"space-between
//   },
//   appPackDetails: {
//     height: "31%",
//     width: "100%",
//     //borderWidth: 2,
//     flexDirection: "column",
//     borderColor: "red",
//   },
//   packTextBox: {
//     backgroundColor: "#E3F1FFBF",
//     height: "100%",
//     width: "20%",
//   },
//   appPackTextBox: {
//     backgroundColor: "#E3F1FFBF",
//     height: "50%",
//     width: "43%",
//     //borderWidth: 1,
//   },
//   packDetailsText: {
//     color: "#007EFF",
//     fontWeight: 500,
//     fontSize: 11,
//     alignSelf: "center",
//   },
//   appPackDetailsText: {
//     color: "#007EFF",
//     fontWeight: 500,
//     fontSize: 13,
//     alignSelf: "center",
//   },
//   dateSection: {
//     height: "100%",
//     width: "76%",
//     //borderWidth: 1,
//   },
//   appDateSection: {
//     height: "50%",
//     width: "100%",
//     //borderWidth: 1,
//     borderColor: "#e0e0e0ff",
//     marginVertical: "0.5%",
//   },
//   doctorAssignedDetails: {
//     //borderWidth: 1,
//     height: "48%",
//     width: "100%",
//     marginVertical: "1.5%",
//   },
//   appDoctorAssignedDetails: {
//     //borderWidth: 1,
//     height: "36%",
//     width: "100%",
//     marginVertical: "1.8%",
//   },
//   doctorAssignedText: {
//     fontSize: 14,
//     fontWeight: 400,
//     color: "#444444",
//   },
//   appDoctorAssignedText: {
//     fontSize: 14,
//     fontWeight: 500,
//     color: "#5b5b5bff",
//   },
//   headingText: {
//     // height: "4%",
//     height: "auto",
//     width: "98%",
//     borderColor: "#fff",
//     backgroundColor: "#fff",
//     alignSelf: "center",
//     marginVertical: "2%",
//     fontSize: 17,
//     fontWeight: 600,
//     paddingHorizontal: "1%",
//     paddingVertical: "0.1%",
//     borderRadius: 5,
//   },
//   appHeadingText: {
//     height: "10%",
//     //height: "auto",
//     width: "98%",
//     borderColor: "#fff",
//     backgroundColor: "#fff",
//     alignSelf: "center",
//     marginVertical: "2%",
//     fontSize: 17,
//     fontWeight: 600,
//     paddingHorizontal: "1%",
//     paddingVertical: "0.2%",
//     borderRadius: 5,
//   },
//   cardSection: {
//     //borderWidth: 1,
//     minHeight: 120,
//     height: "auto",
//     //height: "16%",
//     width: "98%",
//     alignSelf: "center",
//     justifyContent: "space-between",
//     flexDirection: "row",
//   },
//   appCardSection: {
//     //borderWidth: 1,
//     minHeight: 250,
//     height: "auto",
//     width: "98%",
//     flexWrap: "wrap",
//     backgroundColor: "#fff",
//     justifyContent: "space-around",
//     flexDirection: "row",
//     //paddingHorizontal: "0.5%",
//     paddingVertical: "1%",
//     alignSelf: "center",
//   },
//   cardView: {
//     //borderWidth: 2,
//     borderColor: "#760606ff",
//     height: "100%",
//     width: "24%",
//     backgroundColor: "#fff",
//     boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
//     borderRadius: 5,
//   },
//   appCardView: {
//     borderWidth: 2,
//     borderColor: "#f3f0f0ff",
//     height: "48%",
//     width: "48%",
//     backgroundColor: "#fff",
//     boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
//     borderRadius: 5,
//     marginBottom: "2%",
//   },
//   cardIcon: {
//     height: "28%",
//     width: "12%",
//     marginVertical: "3%",
//     marginHorizontal: "4%",
//   },
//   appCardIcon: {
//     height: "34%",
//     width: "24%",
//     marginVertical: "5%",
//     marginHorizontal: "6%",
//   },
//   cardText: {
//     fontSize: 13,
//     fontWeight: 500,
//     color: "#000",
//     marginVertical: "2%",
//     marginHorizontal: "4%",
//   },
//   appCardText: {
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#000",
//     marginVertical: "%",
//     marginHorizontal: "4%",
//   },
//   cardSpecificDataSection: {
//     height: "16%",
//     width: "84%",
//     //borderWidth: 1,
//     marginVertical: "0.5%",
//     marginHorizontal: "4%",
//   },
//   appCardSpecificDataSection: {
//     height: "32%",
//     width: "84%",
//     //borderWidth: 1,
//     marginVertical: "0.5%",
//     marginHorizontal: "4%",
//   },
//   specificText: {
//     fontSize: 14,
//     fontWeight: 500,
//     color: "#FF7072",
//   },
//   appSpecificText: {
//     fontSize: 13,
//     fontWeight: 500,
//     color: "#548de4ff",
//   },
//   doctorVideoAppointmentSection: {
//     //borderWidth: 2,
//     borderColor: "#760606ff",
//     // height: "13%",
//     minHeight: 110,
//     height: "auto",
//     width: "54%",
//     backgroundColor: "#fff",
//     boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
//     borderRadius: 5,
//     marginVertical: "0.1%",
//     marginHorizontal: "1%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   appDoctorVideoAppointmentSection: {
//     //borderWidth: 2,
//     //borderColor: "#760606ff",
//     minHeight: 170,
//     height: "auto",
//     width: "98%",
//     backgroundColor: "#fff",
//     boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
//     borderRadius: 5,
//     marginVertical: "0.1%",
//     marginHorizontal: "1%",
//     flexDirection: "column",
//     //justifyContent: "space-between",
//   },
//   doctorDetail: {
//     //borderWidth: 1,
//     height: "100%",
//     width: "53%",
//     flexDirection: "row",
//   },
//   appDoctorDetail: {
//     //borderWidth: 1,
//     height: "37%",
//     width: "100%",
//     flexDirection: "row",
//   },
//   doctorImageBox: {
//     borderWidth: 1,
//     height: "40%",
//     width: "12%",
//     marginVertical: "4%",
//     marginHorizontal: "4%",
//     borderColor: "#c8c7c7ff",
//   },
//   appDoctorImageBox: {
//     borderWidth: 1,
//     height: "68%",
//     width: "13%",
//     marginVertical: "2%",
//     marginHorizontal: "2%",
//     borderColor: "#c8c7c7ff",
//     borderRadius: 50,
//   },
//   doctorNameSpecializationSection: {
//     height: "73%",
//     width: "80%",
//     //borderWidth: 1,
//     marginVertical: "4%",
//     borderColor: "#c8c7c7ff",
//   },
//   appDoctorNameSpecializationSection: {
//     height: "auto",
//     width: "78%",
//     //borderWidth: 1,
//     marginVertical: "2%",
//     borderColor: "#c8c7c7ff",
//   },
//   videoCallSection: {
//     borderWidth: 2,
//     height: "80%",
//     width: "40%",
//     marginVertical: "1.5%",
//     marginRight: "5%",
//     borderRadius: 5,
//     borderColor: "#eceaeaff",
//   },
//   appvideoCallSection: {
//     borderWidth: 2,
//     height: "30%",
//     width: "80%",
//     marginVertical: "1%",
//     marginHorizontal: "1.5%",
//     borderRadius: 5,
//     borderColor: "#eceaeaff",
//   },

//   firstVideoSection: {
//     height: "40%",
//     width: "100%",
//     //borderWidth: 1,
//     flexDirection: "row",
//     marginVertical: "3%",
//   },
//   videoCallIcon: {
//     height: "30%",
//     width: "5%",
//     marginVertical: "4%",
//     marginHorizontal: "2%",
//   },

//   videoAppointmentText: {
//     fontSize: 12,
//     fontWeight: 500,
//     marginHorizontal: "2.5%",
//     marginVertical: "2.5%",
//   },
//   appVideoAppointmentText: {
//     fontSize: 15,
//     fontWeight: 500,
//     marginHorizontal: "2.5%",
//     marginVertical: "0.5%",
//   },

//   videoAppointmentDate: {
//     height: "30%",
//     width: "70%",
//     //borderWidth: 1,
//     backgroundColor: "#408CFF",
//     marginHorizontal: "1.5%",
//     borderRadius: 5,
//   },
//   appvideoAppointmentDate: {
//     height: "50%",
//     width: "90%",
//     //borderWidth: 1,
//     backgroundColor: "#408CFF",
//     marginHorizontal: "1.5%",
//     borderRadius: 5,
//   },

//   videoCallButton: {
//     backgroundColor: "#FF7072",
//     color: "#fff",
//     height: "75%",
//     width: "30%",
//     marginLeft: "20%",
//     paddingLeft: "2.7%",
//     paddingTop: "1%",
//     borderRadius: 5,
//   },
//   appVideoCallButton: {
//     backgroundColor: "#FF7072",
//     color: "#fff",
//     height: "25%",
//     width: "70%",
//     borderRadius: 5,
//     alignSelf: "center",
//     textAlign: "center",
//   },

//   medilockerSection: {
//     width: "98%",
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignSelf: "center",
//     padding: "1%",
//     marginVertical: "1%",
//     boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
//   },
//   appMedilockerSection: {
//     width: "98%",
//     backgroundColor: "#fff",
//     borderRadius: 5,
//     alignSelf: "center",
//     padding: "1%",
//     marginVertical: "1%",
//     boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
//     borderWidth: 1,
//     height: "20%",
//   },
//   medilockerHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   medilockerImageTitle: {
//     height: "94%",
//     width: "30%",
//     //borderWidth: 1,
//     flexDirection: "row",
//   },

//   medilockerImage: {
//     height: 32,
//     width: 34,
//   },

//   medilockerTitle: {
//     fontSize: 17,
//     fontWeight: 600,
//     marginHorizontal: "5%",
//   },

//   medilockerActions: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },

//   filterButton: {
//     backgroundColor: "#FFF1F2",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#FFD1D1",
//   },

//   filterButtonText: {
//     fontSize: 12,
//     fontWeight: 500,
//   },

//   searchBox: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     width: 200,
//     height: 35,
//     borderRadius: 5,
//     justifyContent: "center",
//     paddingHorizontal: 10,
//   },

//   searchPlaceholder: {
//     fontSize: 12,
//     color: "#999",
//   },

//   uploadButton: {
//     backgroundColor: "#FF7072",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 5,
//   },

//   uploadButtonText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: 500,
//   },

//   tableHeader: {
//     flexDirection: "row",
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//     backgroundColor: "#fafafa",
//   },

//   th: {
//     width: "12%",
//     fontWeight: 600,
//     fontSize: 12,
//   },
//   the: {
//     marginLeft:"2.5%",
//     width: "12%",
//     fontWeight: 600,
//     fontSize: 12,
//   },

//   thLarge: {
//     width: "25%",
//     fontWeight: 600,
//     fontSize: 12,
//   },

//   tableRow: {
//     flexDirection: "row",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#f0f0f0",
//     alignItems: "center",
//   },

//   td: {
//     width: "12%",
//     fontSize: 12,
//   },
//   tdId: {
//     width: "12%",
//     fontSize: 12,
//     color: "#FFCC00",
//   },

//   tdLarge: {
//     width: "25%",
//     fontSize: 12,
//   },

//   tagBox: {
//     paddingVertical: 3,
//     paddingHorizontal: 8,
//     borderRadius: 4,
//     borderWidth: 2,
//   },

//   tagText: {
//     fontSize: 11,
//     fontWeight: 500,
//     color: "#444",
//   },

//   actionButton: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 3,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     fontSize: 14,
//     marginHorizontal: "25%",
//   },

//   actionAddButton: {
//     marginTop: 5,
//     backgroundColor: "#FF7072",
//     width: 28,
//     height: 28,
//     borderRadius: 5,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   actionAddButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: -2,
//   },

//   paginationRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     alignItems: "center",
//   },

//   paginationNumbers: {
//     flexDirection: "row",
//     gap: 10,
//     alignItems: "center",
//   },

//   paginationActive: {
//     backgroundColor: "#408CFF",
//     color: "#fff",
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },

//   paginationInactive: {
//     paddingVertical: 4,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//     color: "#444",
//   },
//   facingIssueSection: {
//     //borderWidth: 1,
//     height: "19%",
//     width: "98%",
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
//   },
//   appFacingIssueSection: {
//     borderWidth: 1,
//     height: "18%",
//     width: "98%",
//     alignSelf: "center",
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
//     marginBottom: "8%",
//   },
//   facingIssueInnerBox: {
//     // padding: "2%",
//     // width: "100%",
//     // height: "100%",
//     width: "97%",
//     minHeight: 140,
//     borderWidth: 1,
//     borderColor: "#cdd3d8",
//     backgroundColor: "#f4f7fb",
//     borderRadius: 14,
//     padding: "2%",
//     justifyContent: "flex-start",
//     alignSelf: "center",
//     marginVertical: "1%",
//   },
//   appFacingIssueInnerBox: {
//     width: "97%",
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: "#cdd3d8",
//     backgroundColor: "#f4f7fb",
//     borderRadius: 14,
//     padding: "2%",
//     justifyContent: "flex-start",
//     alignSelf: "center",
//     marginVertical: "1%",
//   },

//   issueUploadPlaceholder: {
//     color: "#8e8e8e",
//     fontSize: 13,
//   },
//   appIssueUploadPlaceholder: {
//     color: "#8e8e8e",
//     fontSize: 13,
//   },

//   issueFileName: {
//     fontSize: 13,
//     marginTop: 4,
//     color: "#333",
//   },
//   issueDocItem: {
//     minWidth: 140,
//     maxWidth: 180,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     backgroundColor: "#fafafa",
//     borderRadius: 8,
//     position: "relative",
//   },
//   appIssueDocItem: {
//     minWidth: 120,
//     maxWidth: 70,
//     height: "100%",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     backgroundColor: "#fafafa",
//     borderRadius: 8,
//     position: "relative",
//   },
//   issueDocName: {
//     fontSize: 12,
//     color: "#333",
//     maxWidth: 140,
//   },

//   appIssueDocName: {
//     fontSize: 12,
//     color: "#333",
//     maxWidth: 140,
//   },

//   issueRemoveBtn: {
//     //position: "absolute",
//     marginTop: "4%",
//     marginLeft: "90%",
//     backgroundColor: "#FF7072",
//     width: 20,
//     height: 20,
//     borderRadius: 11,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//   },

//   issueRemoveBtnText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//     marginTop: "0%",
//   },

//   submitIssueButton: {
//     backgroundColor: "#FF7072",
//     width: "15%",
//     paddingVertical: "1%",
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//     marginHorizontal: "1%",
//   },
//   appSubmitIssueButton: {
//     backgroundColor: "#FF7072",
//     width: "50%",
//     paddingVertical: "1%",
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//     marginHorizontal: "1%",
//   },

//   submitIssueButtonText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   issueNoteText: {
//     fontSize: 11,
//     color: "#888",
//     marginTop: "0.5%",
//     marginHorizontal: "1%",
//   },
//   appIssueNoteText: {
//     fontSize: 13,
//     color: "#888",
//     marginTop: "0.5%",
//     marginHorizontal: "1%",
//   },
// });

// export default UserDashboard;

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
  Linking,
  StatusBar,
  Alert,
} from "react-native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import * as DocumentPicker from "expo-document-picker";
import BackButton from "../../components/PatientScreenComponents/BackButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../env-vars";
import {
  FetchFromServer,
  download,
  remove,
} from "../../utils/MedilockerService";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as WebBrowser from "expo-web-browser";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get("window");

const UserDashboard = ({ navigation }) => {
  const { width } = useWindowDimensions();

  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [issueDocs, setIssueDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentDocuments = documents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [consultationRemaining, setConsultationRemaining] = useState(0);
  const hasFetchedRef = useRef(false);

  const uploadInputRef = useRef(null);
  const issueInputRef = useRef(null);

  // ------------------ Upload to Server ------------------
  const uploadToServer = async (file) => {
    try {
      const userIdentifier = user?.user_id || user?.email;
      if (!userIdentifier) {
        showAlert("Error", "User not found");
        return false;
      }

      const formData = new FormData();

      if (Platform.OS === "web") {
        formData.append("file", file);
      } else {
        formData.append("file", {
          uri: file.uri,
          type: file.mimeType || "application/octet-stream",
          name: file.name,
        });
      }

      const response = await fetch(
        `${API_URL}/medilocker/upload/${userIdentifier}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", errorText);
        showAlert("Upload Failed", "Could not upload file to server");
        return false;
      }

      const data = await response.json();
      console.log("✅ File uploaded successfully:", data);
      return true;
    } catch (error) {
      console.error("❌ Upload error:", error);
      showAlert("Upload Error", error.message);
      return false;
    }
  };

  // ------------------ Fetch Medilocker Files ------------------
  const loadFilesFromServer = async () => {
    try {
      const userIdentifier = user?.user_id || user?.email;
      console.log("📁 Starting Medilocker fetch for:", userIdentifier);

      if (!userIdentifier) {
        console.warn("⚠️ No user identifier found");
        return;
      }

      const data = await FetchFromServer(userIdentifier);
      console.log("📦 FetchFromServer response:", data);

      if (data?.files) {
        console.log("✅ Files found:", data.files.length);

        const mappedFiles = data.files.map((file) => ({
          id: file.file_id,
          file_id: file.file_id,
          date: file.metadata?.upload_date,
          time: file.metadata?.upload_time,
          name: file.filename,
          format: "." + (file.metadata?.file_type || ""),
          type: detectType(file.filename),
          size: file.metadata?.file_size,
        }));

        console.log("🔄 Mapped files:", mappedFiles);
        console.log("📊 Setting", mappedFiles.length, "documents");

        setDocuments(mappedFiles);
        console.log("✨ Documents state updated");
      } else {
        console.warn("⚠️ No files property in response");
        setDocuments([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch medilocker files:", error);
    }
  };

  // Alert polyfill for web
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}\n${message || ""}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // For the main document upload
  const onWebUploadChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    let successCount = 0;

    // Upload each file to server
    for (const file of files) {
      const uploaded = await uploadToServer(file);
      if (uploaded) successCount++;
    }

    // Refresh the document list from server
    await loadFilesFromServer();

    // Clear the input
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }

    if (successCount > 0) {
      showAlert("Success", `${successCount} file(s) uploaded successfully`);
    }
  };

  // For the issue upload
  const onWebIssueChange = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map((file) => ({
      name: file.name,
      uri: URL.createObjectURL(file),
    }));
    setIssueDocs((prev) => [...prev, ...newDocs]);
  };

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
        {" "}
        {children}{" "}
      </Animated.View>
    );
  };

  // ------------------ Utility ------------------

  const getDoctorName = () =>
    doctorData?.doctor?.doctorname || doctorData?.doctorname || "—";
  const getDoctorSpecialization = () =>
    doctorData?.doctor?.specialization || doctorData?.specialization || "";
  const getDoctorExperience = () =>
    doctorData?.doctor?.experience || doctorData?.experience
      ? `${doctorData?.doctor?.experience || doctorData?.experience} exp`
      : "";

  const detectType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "Report";
    if (["png", "jpg", "jpeg", "pdf"].includes(ext)) return "Scan";
    if (["txt", "doc", "docx"].includes(ext)) return "Prescription";
    if (["png", "jpg", "jpeg"].includes(ext)) return "Lab test";
    return "Other";
  };

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

  // ------------------ Fetch Functions ------------------

  const isSubscriptionActiveByDate = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
  };

  const fetchActiveSubscription = async (userId, doctorId) => {
    console.log("💳 fetchActiveSubscription START");
    console.log("➡️ userId:", userId);
    console.log("➡️ doctorId:", doctorId);

    try {
      const url = `${API_URL}/booking/users/${userId}/subscriptions`;
      console.log("🌐 Subscription URL:", url);

      const res = await fetch(url);
      console.log("📡 Subscription API status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Subscription API failed:", text);
        return null;
      }

      const subscriptions = await res.json();
      console.log("📦 Subscriptions response:", subscriptions);

      if (!Array.isArray(subscriptions)) {
        console.warn("⚠️ Subscriptions is not an array");
        return null;
      }

      const active = subscriptions.find(
        (sub) =>
          ["ACTIVE", "EXHAUSTED"].includes(sub.status) &&
          isSubscriptionActiveByDate(sub.start_date, sub.end_date),
      );

      console.log("✅ Active subscription:", active || "NONE");
      return active || null;
    } catch (err) {
      console.error("❌ fetchActiveSubscription ERROR:", err);
      return null;
    }
  };

  const fetchDoctor = async (doctorId) => {
    console.log("👨‍⚕️ fetchDoctor START");
    console.log("➡️ doctorId:", doctorId);

    if (!doctorId) {
      console.warn("⛔ fetchDoctor aborted — NO doctorId");
      return null;
    }

    try {
      const url = `${API_URL}/doctorsService/doctor/${doctorId}`;
      console.log("🌐 Doctor URL:", url);

      const res = await fetch(url);
      console.log("📡 Doctor API status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Doctor API failed:", text);
        return null;
      }

      const data = await res.json();
      console.log("📦 Doctor API response:", data);

      console.log("🏁 fetchDoctor END");
      return data;
    } catch (err) {
      console.error("❌ fetchDoctor EXCEPTION:", err);
      return null;
    }
  };

  const fetchDashboardData = async (userId) => {
    console.log("🚀 fetchDashboardData START");

    const subscription = await fetchActiveSubscription(userId);

    if (!subscription) {
      console.warn("⚠️ No active subscription");
      return;
    }

    setActiveSubscription(subscription);

    if (subscription.doctor_id) {
      const doctor = await fetchDoctor(subscription.doctor_id);
      if (doctor) setDoctorData(doctor);
    }

    await fetchUpcomingAppointment(userId);

    let used = subscription.appointments_used ?? 0;

    if (!appointmentData) {
      used = 0;
    }

    const remaining = subscription.appointments_total - used;
    setConsultationRemaining(Math.max(remaining, 0));
  };

  const fetchUpcomingAppointment = async (userId) => {
    console.log("📅 fetchUpcomingAppointment START");
    console.log("➡️ userId:", userId);

    try {
      const url = `${API_URL}/booking/users/${userId}/bookings?type=upcoming`;
      console.log("🌐 Upcoming Appointment URL:", url);

      const res = await fetch(url);
      console.log("📡 Upcoming Appointment status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Upcoming Appointment API failed:", text);
        return;
      }

      const data = await res.json();
      console.log("📦 Upcoming appointments response:", data);

      if (!Array.isArray(data) || data.length === 0) {
        console.warn("⚠️ No upcoming appointments found");
        setAppointmentData(null);
        return;
      }

      const booking = data[0];
      console.log("📌 Selected booking:", booking);

      setAppointmentData(booking);

      console.log("🏁 fetchUpcomingAppointment END");
    } catch (err) {
      console.error("❌ fetchUpcomingAppointment EXCEPTION:", err);
    }
  };

  const downloadFile = async (file) => {
    try {
      const data = await download(user?.user_id || user?.email, file.file_id);
      const downloadUrl = data.download_url;

      if (Platform.OS === "web") {
        window.open(downloadUrl, "_blank");
      } else {
        await WebBrowser.openBrowserAsync(downloadUrl);
      }
    } catch (error) {
      showAlert("Download Error", error.message);
    }
  };

  const removeFile = async (file) => {
    try {
      await remove(user?.user_id || user?.email, file.file_id);

      await loadFilesFromServer();

      showAlert("Deleted", `${file.name} has been removed`);
    } catch (error) {
      showAlert("Error", error.message);
    }
  };

  const shareFile = async (file) => {
    try {
      const data = await download(user?.user_id || user?.email, file.file_id);
      const downloadUrl = data.download_url;

      if (Platform.OS === "web") {
        if (navigator.share) {
          await navigator.share({
            title: file.name,
            url: downloadUrl,
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
      showAlert("Share Error", error.message);
    }
  };
  const addAmPm = (time) => {
    if (!time) return "";

    const hour = parseInt(time.split(":")[0], 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    return `${time} ${ampm}`;
  };

  // ------------------ User Load ------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        let storedUser;
        if (Platform.OS === "web") {
          storedUser = localStorage.getItem("@user");
        } else {
          storedUser = await AsyncStorage.getItem("@user");
        }
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("❌ loadUser:", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    fetchDashboardData(user.user_id);
  }, [user?.user_id]);

  // Load files from server when user is available
  useEffect(() => {
    if (!user) {
      console.log("🚫 No user, skipping medilocker fetch");
      return;
    }

    loadFilesFromServer();
  }, [user]);

  // ------------------ Handle Video Call ------------------
  const handleJoinCall = () => {
    if (!appointmentData?.meet_link) return;
    if (Platform.OS === "web") window.open(appointmentData.meet_link, "_blank");
    else Linking.openURL(appointmentData.meet_link);
  };

  // ------------------ Document Upload ------------------
  const handleUpload = async () => {
    if (Platform.OS === "web") return uploadInputRef.current?.click();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];

      // Upload to server
      const uploaded = await uploadToServer(file);

      if (uploaded) {
        // Refresh the document list from server
        await loadFilesFromServer();
        showAlert("Success", "File uploaded successfully");
      }
    } catch (err) {
      console.error("❌ handleUpload:", err);
    }
  };

  const handleIssueUpload = async () => {
    if (Platform.OS === "web") return issueInputRef.current?.click();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setIssueDocs((prev) => [...prev, { name: file.name, uri: file.uri }]);
    } catch (err) {
      console.error("❌ handleIssueUpload:", err);
    }
  };

  // ------------------ Local Storage for Issue Docs Only ------------------
  useEffect(() => {
    if (Platform.OS === "web") {
      const savedIssue = localStorage.getItem("issueDocs");
      if (savedIssue) setIssueDocs(JSON.parse(savedIssue));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web")
      localStorage.setItem("issueDocs", JSON.stringify(issueDocs));
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
                <BackButton />
                <HoverScale style={styles.userDetailSection}>
                  {/* <View style={styles.userImageBox}></View> */}
                  <View style={styles.userImageBox}>
                    {user?.picture ? (
                      <Image
                        source={{ uri: user.picture }}
                        style={styles.userAvatar}
                      />
                    ) : (
                      <Text style={styles.userInitial}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </Text>
                    )}
                  </View>

                  <View style={styles.userdetailsBox}>
                    <Text style={styles.userName}>{user?.name || "User"}</Text>

                    <View style={styles.packDetails}>
                      <View style={styles.packTextBox}>
                        <Text style={styles.packDetailsText}>
                          priority care pack
                        </Text>
                      </View>
                      <View style={styles.dateSection}>
                        {activeSubscription && (
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#666",
                            }}
                          >
                            {new Date(
                              activeSubscription.start_date,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            {" - "}
                            {new Date(
                              activeSubscription.end_date,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.doctorAssignedDetails}>
                      <Text style={styles.doctorAssignedText}>
                        Doctor Assigned:{" "}
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#000",
                          }}
                        >
                          {getDoctorName()}, {getDoctorSpecialization()},{" "}
                          {getDoctorExperience()}
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
                        {activeSubscription
                          ? `${consultationRemaining}/${activeSubscription.appointments_total}`
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
                          ? `${appointmentData.date} at ${addAmPm(
                              appointmentData.start_time,
                            )}`
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
                        {getDoctorName()}
                      </Text>
                      <Text
                        style={{ margin: "1%", fontSize: 12, color: "#777" }}
                      >
                        {getDoctorSpecialization()}, {getDoctorExperience()}
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

                      <TouchableOpacity
                        style={[
                          styles.videoCallButton,
                          { opacity: appointmentData?.meet_link ? 1 : 0.3 },
                        ]}
                        disabled={!appointmentData?.meet_link}
                        onPress={handleJoinCall}
                      >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                          Join Call
                        </Text>
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
                        {appointmentData
                          ? `${appointmentData.date} at ${addAmPm(
                              appointmentData.start_time,
                            )}`
                          : "No Appointment"}
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
                    <Text style={styles.the}>Action</Text>
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

                        <View style={styles.actionButtons}>
                          {/* Download Button */}
                          <TouchableOpacity onPress={() => downloadFile(row)}>
                            <MaterialIcons
                              name="file-download"
                              size={24}
                              color="#FF7072"
                            />
                          </TouchableOpacity>

                          {/* Delete Button */}
                          <TouchableOpacity onPress={() => removeFile(row)}>
                            <MaterialIcons
                              name="delete"
                              size={24}
                              color="#FF7072"
                            />
                          </TouchableOpacity>

                          {/* Share Button */}
                          <TouchableOpacity onPress={() => shareFile(row)}>
                            <MaterialIcons
                              name="share"
                              size={24}
                              color="#FF7072"
                            />
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
                                  (_, i) => i !== idx,
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
      {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView style={styles.appContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View
            style={[
              styles.header,
              Platform.OS === "web" ? { height: "auto" } : { height: "15%" },
            ]}
          >
            <HeaderLoginSignUp navigation={navigation} />
          </View>
          <HoverScale
            style={[
              styles.appUserDetailSection,
              Platform.OS === "web" ? { marginTop: "3%" } : {},
            ]}
          >
            <View style={styles.appUserImageBox}>
              {user?.picture ? (
                <Image
                  source={{ uri: user.picture }}
                  style={styles.appUserAvatar}
                />
              ) : (
                <Text style={styles.appUserInitial}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Text>
              )}
            </View>

            <View style={styles.appUserDetailsBox}>
              <Text style={styles.appUserName}>{user?.name || "User"}</Text>

              <View style={styles.appPackDetails}>
                <View style={styles.appPackTextBox}>
                  <Text style={styles.appPackDetailsText}>
                    {activeSubscription?.plan_price
                      ? `₹${activeSubscription.plan_price}`
                      : ""}{" "}
                    priority care pack
                  </Text>
                </View>
                <View style={styles.appDateSection}>
                  {activeSubscription && (
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#888787ff",
                      }}
                    >
                      {new Date(
                        activeSubscription.start_date,
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" - "}
                      {new Date(activeSubscription.end_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.appDoctorAssignedDetails}>
                <Text style={styles.appDoctorAssignedText}>
                  Doctor Assigned:{" "}
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#000",
                    }}
                  >
                    {getDoctorName()}, {getDoctorSpecialization()},{" "}
                    {getDoctorExperience()}
                  </Text>
                </Text>
              </View>
            </View>
          </HoverScale>

          {/* UPCOMING APPOINTMENT - Only show if user has booked */}
          {appointmentData && (
            <>
              <Text style={styles.appHeadingText}>Upcoming appointment</Text>

              <View style={styles.upcomingCard}>
                {/* Doctor Row */}
                <View style={styles.upcomingDoctorRow}>
                  <View style={styles.upcomingDoctorLeft}>
                    <View style={styles.upcomingDoctorImageBox}>
                      {doctorData?.doctor?.profilePhoto ? (
                        <Image
                          source={{ uri: doctorData.doctor.profilePhoto }}
                          style={styles.upcomingDoctorImage}
                        />
                      ) : (
                        <Text style={styles.upcomingDoctorInitial}>
                          {getDoctorName()?.charAt(0) || "D"}
                        </Text>
                      )}
                    </View>

                    <View>
                      <Text style={styles.upcomingDoctorName}>
                        {getDoctorName()}
                      </Text>
                      <Text style={styles.upcomingDoctorSpeciality}>
                        {getDoctorSpecialization()}
                      </Text>
                    </View>
                  </View>

                  {/* Confirmed Badge */}
                  <View style={styles.confirmedBadge}>
                    <Text style={styles.confirmedText}>Confirmed</Text>
                  </View>
                </View>

                {/* Video Appointment Label */}
                <Text style={styles.videoLabel}>Video appointment</Text>

                {/* Date Time Pill */}
                <View style={styles.dateTimePill}>
                  <MaterialIcons name="calendar-today" size={14} color="#fff" />
                  <Text style={styles.dateTimeText}>
                    {appointmentData.date},{" "}
                    {addAmPm(appointmentData.start_time)}
                  </Text>
                </View>

                {/* Join Button */}
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={handleJoinCall}
                >
                  <MaterialIcons name="videocam" size={18} color="#fff" />
                  <Text style={styles.joinBtnText}>Join Call</Text>
                </TouchableOpacity>

                {/* Reschedule */}
                <TouchableOpacity style={styles.rescheduleBtn}>
                  <MaterialIcons
                    name="calendar-month"
                    size={18}
                    color="#408CFF"
                  />
                  <Text style={styles.rescheduleText}>Reschedule</Text>
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity>
                  <Text style={styles.cancelText}>Cancel Appointment</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* SUBSCRIBED DOCTORS */}
          {activeSubscription && doctorData && (
            <>
              <Text style={styles.appHeadingText}>Subscribed Doctors</Text>

              <View style={styles.subscribedDoctorCard}>
                {/* Doctor Left */}
                <View style={styles.subscribedDoctorLeft}>
                  <View style={styles.subscribedDoctorImageBox}>
                    {doctorData?.doctor?.profilePhoto ? (
                      <Image
                        source={{ uri: doctorData.doctor.profilePhoto }}
                        style={styles.subscribedDoctorImage}
                      />
                    ) : (
                      <Text style={styles.subscribedDoctorInitial}>
                        {getDoctorName()?.charAt(0) || "D"}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.subscribedDoctorName}>
                      {getDoctorName()}
                    </Text>

                    <Text style={styles.subscribedDoctorSpecialization}>
                      {getDoctorSpecialization()}
                    </Text>

                    <Text style={styles.subscribedDoctorExp}>
                      {getDoctorExperience()}
                    </Text>
                  </View>
                </View>

                {/* Book Slot Button */}
                <TouchableOpacity
                  style={styles.bookSlotBtn}
                  onPress={() => {
                    navigation.navigate("Doctors", {
                      screen: "DoctorsInfoWithBooking",
                      params: {
                        doctorId:
                          doctorData?.doctor?.doctor_id ||
                          doctorData?.doctor_id ||
                          doctorData?.id ||
                          doctorData?.email,
                      },
                    });
                  }}
                >
                  <Text style={styles.bookSlotText}>Book Slot</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.appHeadingText}>Subscription Usage Stats</Text>
          <View style={styles.appCardSection}>
            <HoverScale style={styles.appCardView}>
              <Image
                source={require("../../assets/Icons/Subscription.png")}
                style={styles.appCardIcon}
              />
              <Text style={styles.appCardText}>Medilocker</Text>
              <View style={styles.appCardSpecificDataSection}>
                <Text style={styles.appSpecificText}>
                  Unlimited document storage & uploads
                </Text>
              </View>
            </HoverScale>
            <HoverScale style={styles.appCardView}>
              <Image
                source={require("../../assets/Icons/consulting.png")}
                style={styles.appCardIcon}
              />
              <Text style={styles.appCardText}>Consultation Remaining</Text>
              <View style={styles.appCardSpecificDataSection}>
                <Text style={styles.appSpecificText}>
                  {activeSubscription
                    ? `${consultationRemaining}/${activeSubscription.appointments_total}`
                    : "0/0"}
                </Text>
              </View>
            </HoverScale>
            <HoverScale style={styles.appCardView}>
              <Image
                source={require("../../assets/Icons/upcoming.png")}
                style={styles.appCardIcon}
              />
              <Text style={styles.appCardText}>Upcoming Appointment</Text>
              <View style={styles.appCardSpecificDataSection}>
                <Text style={styles.appSpecificText}>
                  {appointmentData
                    ? `${appointmentData.date} at ${addAmPm(
                        appointmentData.start_time,
                      )}`
                    : "No Appointment"}
                </Text>
              </View>
            </HoverScale>
            <HoverScale style={styles.appCardView}>
              <Image
                source={require("../../assets/Icons/consulting.png")}
                style={styles.appCardIcon}
              />
              <Text style={styles.appCardText}>AI Cardio Chatbot</Text>
              <View style={styles.appCardSpecificDataSection}>
                <Text style={styles.appSpecificText}>Unlimited Access</Text>
              </View>
            </HoverScale>
          </View>

          {/* MOBILE MEDILOCKER SECTION */}
          <Text style={styles.appHeadingText}>Your Medilocker</Text>
          <View style={styles.appMedilockerSection}>
            <View style={styles.appMedilockerHeader}>
              <View style={styles.appMedilockerImageTitle}>
                <Image
                  source={require("../../assets/Icons/dashboardMedilocker.png")}
                  style={styles.appMedilockerImage}
                />
                <Text style={styles.appMedilockerTitle}>Medilocker</Text>
              </View>
            </View>

            <View style={styles.appMedilockerActions}>
              <TouchableOpacity style={styles.appFilterButton}>
                <Text style={styles.appFilterButtonText}>Filter</Text>
              </TouchableOpacity>

              <View style={styles.appSearchBox}>
                <Text style={styles.appSearchPlaceholder}>Search</Text>
              </View>

              <TouchableOpacity
                style={styles.appUploadButton}
                onPress={handleUpload}
              >
                <Text style={styles.appUploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>

            {/* Document List */}
            <ScrollView
              style={styles.appDocumentList}
              showsVerticalScrollIndicator={false}
            >
              {currentDocuments.map((row, index) => {
                const tag = getTagColor(row.type);
                return (
                  <View key={index} style={styles.appDocumentCard}>
                    <View style={styles.appDocumentHeader}>
                      <Text style={styles.appDocumentId}>#{row.id}</Text>
                      <View
                        style={[
                          styles.appTagBox,
                          {
                            backgroundColor: tag.bg,
                            borderColor: tag.borderColor,
                          },
                        ]}
                      >
                        <Text style={[styles.appTagText, { color: tag.text }]}>
                          {row.type}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.appDocumentName} numberOfLines={1}>
                      {row.name}
                    </Text>

                    <View style={styles.appDocumentMeta}>
                      <Text style={styles.appDocumentMetaText}>
                        {row.date} • {row.time}
                      </Text>
                      <Text style={styles.appDocumentFormat}>{row.format}</Text>
                    </View>

                    <View style={styles.appActionButtons}>
                      <TouchableOpacity
                        style={styles.appActionBtn}
                        onPress={() => downloadFile(row)}
                      >
                        <MaterialIcons
                          name="file-download"
                          size={20}
                          color="#FF7072"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.appActionBtn}
                        onPress={() => removeFile(row)}
                      >
                        <MaterialIcons
                          name="delete"
                          size={20}
                          color="#FF7072"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.appActionBtn}
                        onPress={() => shareFile(row)}
                      >
                        <MaterialIcons name="share" size={20} color="#FF7072" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Pagination */}
            <View style={styles.appPaginationRow}>
              <Text style={styles.appPaginationText}>
                {currentDocuments.length} of {documents.length}
              </Text>

              <View style={styles.appPaginationNumbers}>
                <TouchableOpacity
                  onPress={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                >
                  <Text style={styles.appPaginationInactive}>Prev</Text>
                </TouchableOpacity>

                {[...Array(totalPages)].map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setCurrentPage(i + 1)}
                  >
                    <Text
                      style={
                        currentPage === i + 1
                          ? styles.appPaginationActive
                          : styles.appPaginationInactive
                      }
                    >
                      {i + 1}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                >
                  <Text style={styles.appPaginationInactive}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.appHeadingText}>Facing Any Issues</Text>
          <View style={styles.appFacingIssueSection}>
            <View style={styles.appFacingIssueInnerBox}>
              <TouchableOpacity onPress={handleIssueUpload}>
                <Text style={styles.appIssueUploadPlaceholder}>
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
                    <View key={idx} style={styles.appIssueDocItem}>
                      <Text numberOfLines={1} style={styles.appIssueDocName}>
                        {doc.name}
                      </Text>

                      <TouchableOpacity
                        style={styles.appIssueRemoveBtn}
                        onPress={() => {
                          const updated = issueDocs.filter((_, i) => i !== idx);
                          setIssueDocs(updated);
                        }}
                      >
                        <Text style={styles.appIssueRemoveBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
            <TouchableOpacity style={styles.appSubmitIssueButton}>
              <Text style={styles.appSubmitIssueButtonText}>
                Submit To Support Team
              </Text>
            </TouchableOpacity>

            <Text style={styles.appIssueNoteText}>
              Our Support team responds within 24 hours
            </Text>
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

  appContainer: {
    flex: 1,
    height: "100%",
    borderWidth: 1,
    flexDirection: "column",
    backgroundColor: "#fcfafaff",
    padding: "1%",
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
    flex: 1,
    width: "85%",
    borderWidth: 1,
    backgroundColor: "#f4f2f2ff",
    borderColor: "#c8c7c7ff",
  },
  header: {
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  actionButtons: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetailSection: {
    borderWidth: 1,
    height: "auto",
    width: "98%",
    borderColor: "#fff",
    backgroundColor: "#fff",
    alignSelf: "center",
    flexDirection: "row",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
  },
  appUserDetailSection: {
    borderWidth: 1,
    height: "10%",
    width: "98%",
    borderColor: "#fff",
    backgroundColor: "#fff",
    alignSelf: "center",
    flexDirection: "row",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
  },
  userImageBox: {
    height: "48%",
    width: "4%",
    marginVertical: "1%",
    marginHorizontal: "1%",
    borderColor: "#c8c7c7ff",
    borderRadius: 50,
  },
  appUserImageBox: {
    borderWidth: 1,
    height: "32%",
    width: "13%",
    marginVertical: "1%",
    marginHorizontal: "0.5%",
    borderColor: "#c8c7c7ff",
    borderRadius: 50,
  },
  userAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  appUserAvatar: {
    width: "90%",
    height: "90%",
    borderRadius: 50,
  },
  userInitial: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FF7072",
    borderWidth: 1,
    borderRadius: 50,
    width: "100%",
    height: "100%",
    textAlign: "center",
    borderColor: "#e1e0e0ff",
  },
  appUserInitial: {
    fontSize: 26,
    fontWeight: "600",
    color: "#FF7072",
    borderWidth: 1,
    borderRadius: 50,
    width: "100%",
    height: "100%",
    textAlign: "center",
    borderColor: "#e1e0e0ff",
  },
  userdetailsBox: {
    marginVertical: "1%",
    marginHorizontal: "0%",
    height: "85%",
    width: "50%",
  },
  appUserDetailsBox: {
    height: "100%",
    width: "87%",
  },

  userName: {
    fontSize: 19,
    fontWeight: 600,
    marginHorizontal: "0%",
  },
  appUserName: {
    fontSize: 18,
    fontWeight: 600,
    marginHorizontal: "0%",
  },
  packDetails: {
    height: "19%",
    width: "88%",
    flexDirection: "row",
  },
  appPackDetails: {
    height: "31%",
    width: "100%",
    flexDirection: "column",
    borderColor: "red",
  },
  packTextBox: {
    backgroundColor: "#E3F1FFBF",
    height: "100%",
    width: "20%",
  },
  appPackTextBox: {
    backgroundColor: "#E3F1FFBF",
    height: "50%",
    width: "43%",
  },
  packDetailsText: {
    color: "#007EFF",
    fontWeight: 500,
    fontSize: 11,
    alignSelf: "center",
  },
  appPackDetailsText: {
    color: "#007EFF",
    fontWeight: 500,
    fontSize: 13,
    alignSelf: "center",
  },
  dateSection: {
    height: "100%",
    width: "76%",
  },
  appDateSection: {
    height: "50%",
    width: "100%",
    borderColor: "#e0e0e0ff",
    marginVertical: "0.5%",
  },
  doctorAssignedDetails: {
    height: "48%",
    width: "100%",
    marginVertical: "1.5%",
  },
  appDoctorAssignedDetails: {
    height: "36%",
    width: "100%",
    marginVertical: "1.8%",
  },
  doctorAssignedText: {
    fontSize: 14,
    fontWeight: 400,
    color: "#444444",
  },
  appDoctorAssignedText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#5b5b5bff",
  },
  headingText: {
    height: "auto",
    width: "98%",
    borderColor: "#fff",
    backgroundColor: "#fff",
    alignSelf: "center",
    marginVertical: "2%",
    fontSize: 17,
    fontWeight: 600,
    paddingHorizontal: "1%",
    paddingVertical: "0.1%",
    borderRadius: 5,
  },
  appHeadingText: {
    height: "10%",
    width: "98%",
    borderColor: "#fff",
    backgroundColor: "#fff",
    alignSelf: "center",
    marginVertical: "2%",
    fontSize: 17,
    fontWeight: 600,
    paddingHorizontal: "1%",
    paddingVertical: "0.2%",
    borderRadius: 5,
  },
  cardSection: {
    minHeight: 120,
    height: "auto",
    width: "98%",
    alignSelf: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  appCardSection: {
    minHeight: 250,
    height: "auto",
    width: "98%",
    flexWrap: "wrap",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    flexDirection: "row",
    paddingVertical: "1%",
    alignSelf: "center",
  },
  cardView: {
    borderColor: "#760606ff",
    height: "100%",
    width: "24%",
    backgroundColor: "#fff",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
  },
  appCardView: {
    borderWidth: 2,
    borderColor: "#f3f0f0ff",
    height: "48%",
    width: "48%",
    backgroundColor: "#fff",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
    marginBottom: "2%",
  },
  cardIcon: {
    height: "28%",
    width: "12%",
    marginVertical: "3%",
    marginHorizontal: "4%",
  },
  appCardIcon: {
    height: "34%",
    width: "24%",
    marginVertical: "5%",
    marginHorizontal: "6%",
  },
  cardText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000",
    marginVertical: "2%",
    marginHorizontal: "4%",
  },
  appCardText: {
    fontSize: 13,
    fontWeight: 600,
    color: "#000",
    marginVertical: "%",
    marginHorizontal: "4%",
  },
  cardSpecificDataSection: {
    height: "16%",
    width: "84%",
    marginVertical: "0.5%",
    marginHorizontal: "4%",
  },
  appCardSpecificDataSection: {
    height: "32%",
    width: "84%",
    marginVertical: "0.5%",
    marginHorizontal: "4%",
  },
  specificText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#FF7072",
  },
  appSpecificText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#548de4ff",
  },
  doctorVideoAppointmentSection: {
    borderColor: "#760606ff",
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
  appDoctorVideoAppointmentSection: {
    minHeight: 170,
    height: "auto",
    width: "98%",
    backgroundColor: "#fff",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    borderRadius: 5,
    marginVertical: "0.1%",
    marginHorizontal: "1%",
    flexDirection: "column",
  },
  doctorDetail: {
    height: "100%",
    width: "53%",
    flexDirection: "row",
  },
  appDoctorDetail: {
    height: "37%",
    width: "100%",
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
  appDoctorImageBox: {
    borderWidth: 1,
    height: "68%",
    width: "13%",
    marginVertical: "2%",
    marginHorizontal: "2%",
    borderColor: "#c8c7c7ff",
    borderRadius: 50,
  },
  doctorNameSpecializationSection: {
    height: "73%",
    width: "80%",
    marginVertical: "4%",
    borderColor: "#c8c7c7ff",
  },
  appDoctorNameSpecializationSection: {
    height: "auto",
    width: "78%",
    marginVertical: "2%",
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
  appvideoCallSection: {
    borderWidth: 2,
    height: "30%",
    width: "80%",
    marginVertical: "1%",
    marginHorizontal: "1.5%",
    borderRadius: 5,
    borderColor: "#eceaeaff",
  },

  firstVideoSection: {
    height: "40%",
    width: "100%",
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
  appVideoAppointmentText: {
    fontSize: 15,
    fontWeight: 500,
    marginHorizontal: "2.5%",
    marginVertical: "0.5%",
  },

  videoAppointmentDate: {
    height: "30%",
    width: "70%",
    backgroundColor: "#408CFF",
    marginHorizontal: "1.5%",
    borderRadius: 5,
  },
  appvideoAppointmentDate: {
    height: "50%",
    width: "90%",
    backgroundColor: "#408CFF",
    marginHorizontal: "1.5%",
    borderRadius: 5,
  },

  videoCallButton: {
    backgroundColor: "#FF7072",
    color: "#fff",
    height: "75%",
    width: "30%",
    marginLeft: "20%",
    paddingLeft: "2.7%",
    paddingTop: "1%",
    borderRadius: 5,
  },
  appVideoCallButton: {
    backgroundColor: "#FF7072",
    color: "#fff",
    height: "25%",
    width: "70%",
    borderRadius: 5,
    alignSelf: "center",
    textAlign: "center",
  },

  medilockerSection: {
    width: "98%",
    backgroundColor: "#fff",
    borderRadius: 8,
    alignSelf: "center",
    padding: "1%",
    marginVertical: "1%",
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
  },
  appMedilockerSection: {
    width: "98%",
    minHeight: 400,
    backgroundColor: "#fff",
    borderRadius: 5,
    alignSelf: "center",
    padding: "3%",
    marginVertical: "1%",
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
    marginBottom: "4%",
  },
  medilockerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  appMedilockerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  medilockerImageTitle: {
    height: "94%",
    width: "30%",
    flexDirection: "row",
  },
  appMedilockerImageTitle: {
    flexDirection: "row",
    alignItems: "center",
  },

  medilockerImage: {
    height: 32,
    width: 34,
  },
  appMedilockerImage: {
    height: 24,
    width: 26,
    marginRight: 8,
  },

  medilockerTitle: {
    fontSize: 17,
    fontWeight: 600,
    marginHorizontal: "5%",
  },
  appMedilockerTitle: {
    fontSize: 16,
    fontWeight: 600,
  },

  medilockerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appMedilockerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  filterButton: {
    backgroundColor: "#FFF1F2",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFD1D1",
  },
  appFilterButton: {
    backgroundColor: "#FFF1F2",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFD1D1",
  },

  filterButtonText: {
    fontSize: 12,
    fontWeight: 500,
  },
  appFilterButtonText: {
    fontSize: 11,
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
  appSearchBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    flex: 1,
    height: 32,
    borderRadius: 5,
    justifyContent: "center",
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },

  searchPlaceholder: {
    fontSize: 12,
    color: "#999",
  },
  appSearchPlaceholder: {
    fontSize: 11,
    color: "#999",
  },

  uploadButton: {
    backgroundColor: "#FF7072",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  appUploadButton: {
    backgroundColor: "#FF7072",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  uploadButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: 500,
  },
  appUploadButtonText: {
    color: "#fff",
    fontSize: 11,
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
  the: {
    marginLeft: "2.5%",
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
  appTagBox: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1.5,
  },

  tagText: {
    fontSize: 11,
    fontWeight: 500,
    color: "#444",
  },
  appTagText: {
    fontSize: 10,
    fontWeight: 500,
  },

  // Mobile Document List Styles
  appDocumentList: {
    maxHeight: 280,
    marginBottom: 10,
  },

  appDocumentCard: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  appDocumentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  appDocumentId: {
    fontSize: 12,
    fontWeight: 600,
    color: "#FFCC00",
  },

  appDocumentName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#333",
    marginBottom: 4,
  },

  appDocumentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  appDocumentMetaText: {
    fontSize: 11,
    color: "#666",
  },

  appDocumentFormat: {
    fontSize: 11,
    fontWeight: 500,
    color: "#666",
  },

  appActionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
  },

  appActionBtn: {
    padding: 4,
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
  appPaginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },

  paginationNumbers: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  appPaginationNumbers: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  paginationActive: {
    backgroundColor: "#408CFF",
    color: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  appPaginationActive: {
    backgroundColor: "#408CFF",
    color: "#fff",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 11,
  },

  paginationInactive: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "#444",
  },
  appPaginationInactive: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: "#444",
    fontSize: 11,
  },

  appPaginationText: {
    fontSize: 11,
    color: "#666",
  },

  facingIssueSection: {
    height: "19%",
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
  },
  appFacingIssueSection: {
    borderWidth: 1,
    height: "12%",
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
    marginBottom: "8%",
    borderColor: "#bbbbbbff",
  },
  facingIssueInnerBox: {
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
  appFacingIssueInnerBox: {
    width: "97%",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#cdd3d8",
    backgroundColor: "#f4f7fb",
    borderRadius: 14,
    padding: "2%",
    justifyContent: "flex-start",
    alignSelf: "center",
    marginVertical: "1%",
  },

  issueUploadPlaceholder: {
    color: "#8e8e8e",
    fontSize: 13,
  },
  appIssueUploadPlaceholder: {
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
  appIssueDocItem: {
    minWidth: 120,
    maxWidth: 70,
    height: "100%",
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

  appIssueDocName: {
    fontSize: 12,
    color: "#333",
    maxWidth: 140,
  },

  issueRemoveBtn: {
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
  appIssueRemoveBtn: {
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
  appIssueRemoveBtnText: {
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
  appSubmitIssueButton: {
    backgroundColor: "#FF7072",
    width: "50%",
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
  appSubmitIssueButtonText: {
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
  appIssueNoteText: {
    fontSize: 13,
    color: "#888",
    marginTop: "0.5%",
    marginHorizontal: "1%",
  },
  /* SUBSCRIBED DOCTOR CARD */

  subscribedDoctorCard: {
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "3%",
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
  },

  subscribedDoctorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  subscribedDoctorImageBox: {
    height: 54,
    width: 54,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  subscribedDoctorImage: {
    height: "100%",
    width: "100%",
    borderRadius: 50,
  },

  subscribedDoctorInitial: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FF7072",
  },

  subscribedDoctorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  subscribedDoctorSpecialization: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  subscribedDoctorExp: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  bookSlotBtn: {
    backgroundColor: "#FF7072",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  bookSlotText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  /* UPCOMING APPOINTMENT CARD */

  upcomingCard: {
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: "3%",
    boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
  },

  upcomingDoctorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  upcomingDoctorLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  upcomingDoctorImageBox: {
    height: 46,
    width: 46,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  upcomingDoctorImage: {
    height: "100%",
    width: "100%",
    borderRadius: 50,
  },

  upcomingDoctorInitial: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF7072",
  },

  upcomingDoctorName: {
    fontSize: 14,
    fontWeight: "700",
  },

  upcomingDoctorSpeciality: {
    fontSize: 12,
    color: "#777",
  },

  /* Confirmed Badge */

  confirmedBadge: {
    backgroundColor: "#DFF5E8",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  confirmedText: {
    color: "#1BAA61",
    fontSize: 11,
    fontWeight: "600",
  },

  /* Video Label */

  videoLabel: {
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },

  /* Date Time Pill */

  dateTimePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#408CFF",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 14,
    gap: 6,
  },

  dateTimeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Join Button */

  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 12,
    gap: 8,
  },

  joinBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  /* Reschedule */

  rescheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#408CFF",
    paddingVertical: 12,
    borderRadius: 28,
    marginBottom: 10,
    gap: 8,
  },

  rescheduleText: {
    color: "#408CFF",
    fontWeight: "600",
  },

  /* Cancel */

  cancelText: {
    textAlign: "center",
    color: "#FF4D4F",
    fontSize: 12,
    marginTop: 4,
  },
});

export default UserDashboard;
