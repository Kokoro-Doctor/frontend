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
  ScrollView,
  Linking,
  TextInput,
} from "react-native";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../env-vars";
import { useAuth } from "../../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

// ✅ Safe import so web doesn’t freak out
let DateTimePicker = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line global-require
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

/**
 * ✅ Stable date key: YYYY-MM-DD
 */
const toDateKey = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const fromDateKey = (key) => {
  if (!key) return null;
  return new Date(`${key}T00:00:00`);
};

/**
 * ✅ DatePickerField (inline) - web shows calendar input, native shows DateTimePicker
 */
const DatePickerField = ({ value, onChange, style }) => {
  if (Platform.OS === "web") {
    const dateKey = value ? toDateKey(value) : "";
    return (
      <View style={[styles.webDateWrap, style]}>
        <input
          type="date"
          value={dateKey}
          onChange={(e) => onChange(fromDateKey(e.target.value))}
          style={styles.webDateInput}
        />
      </View>
    );
  }

  const [open, setOpen] = useState(false);

  const label = value
    ? value.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Select Date";

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.dateInputField}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.dateInputFieldText}>{label}</Text>
      </TouchableOpacity>

      {open && DateTimePicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selected) => {
            setOpen(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
};

const DoctorDashboard = ({ navigation }) => {
  const { width } = useWindowDimensions();

  // Get user and role from AuthContext
  const { user: authUser, role } = useAuth();
  const [user, setUser] = useState(authUser);
  const [documents, setDocuments] = useState([]);
  const [issueDocs, setIssueDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const [activeSubscription, setActiveSubscription] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [consultationRemaining, setConsultationRemaining] = useState(0);
  const [availableAmount, setAvailableAmount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [bookings, setBookings] = useState([]);

  // ✅ Keep this as Date always - for Upcoming Appointments calendar
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // ✅ Separate date state for Patient History section
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(new Date());

  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const dateScrollRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);
  const SCROLL_STEP = 200;

  const hasFetchedRef = useRef(false);

  const uploadInputRef = useRef(null);
  const issueInputRef = useRef(null);

  const detectType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "Report";
    if (["png", "jpg", "jpeg", "pdf"].includes(ext)) return "Scan";
    if (["txt", "doc", "docx"].includes(ext)) return "Prescription";
    if (["png", "jpg", "jpeg"].includes(ext)) return "Lab test";
    return "Other";
  };

  const onWebUploadChange = (e) => {
    const files = Array.from(e.target.files);
    const now = new Date();

    const newDocs = files.map((file) => ({
      id: Date.now() + Math.random(),
      date: toDateKey(now), // ✅ store stable
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: file.name,
      format: "." + file.name.split(".").pop(),
      type: detectType(file.name),
      uri: URL.createObjectURL(file),
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const onWebIssueChange = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map((file) => ({
      name: file.name,
      uri: URL.createObjectURL(file),
    }));
    setIssueDocs((prev) => [...prev, ...newDocs]);
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

  const fetchActiveSubscription = async (userId, doctorId) => {
    if (!user?.token) return null;
    try {
      const url = `${API_URL}/booking/users/${userId}/subscriptions`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) return null;

      const subscriptions = await res.json();
      if (!Array.isArray(subscriptions)) return null;

      const active = subscriptions.find(
        (sub) => sub.doctor_id === doctorId && sub.status === "active"
      );

      return active || null;
    } catch (err) {
      console.error("❌ fetchActiveSubscription ERROR:", err);
      return null;
    }
  };

  const fetchDoctor = async (doctorId) => {
    try {
      const url = `${API_URL}/doctorsService/doctor/${doctorId}`;
      const res = await fetch(url);

      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ fetchDoctor ERROR:", err);
      return null;
    }
  };

  const fetchEarningsSummary = async (doctorId) => {
    try {
      const url = `${API_URL}/payouts/earnings/summary?doctor_id=${doctorId}`;
      const res = await fetch(url);

      if (!res.ok) return null;
      const data = await res.json();
      setAvailableAmount(data?.available_amount ?? 0);
      return data;
    } catch (err) {
      console.error("❌ fetchEarningsSummary ERROR:", err);
      return null;
    }
  };

  const fetchSubscriberCount = async (doctorId) => {
    try {
      const url = `${API_URL}/booking/doctors/${doctorId}/subscribers`;
      const res = await fetch(url);

      if (!res.ok) return null;
      const data = await res.json();
      setSubscriberCount(Array.isArray(data) ? data.length : 0);
      return data;
    } catch (err) {
      console.error("❌ fetchSubscriberCount ERROR:", err);
      return null;
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const url = `${API_URL}/users/${userId}`;
      const res = await fetch(url);

      if (!res.ok) return null;
      const data = await res.json();
      return data?.user || null;
    } catch (err) {
      console.error("❌ fetchUserDetails ERROR:", err);
      return null;
    }
  };

  const fetchTodayBookings = async (doctorId, dateToFetch = null) => {
    try {
      const dateParam = dateToFetch ? toDateKey(dateToFetch) : toDateKey(new Date());
      const url = `${API_URL}/booking/doctors/${doctorId}/bookings?date=${dateParam}`;
      
      const res = await fetch(url);

      if (!res.ok) return;
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setBookings([]);
        return;
      }

      // Fetch user details for each booking and create enriched booking objects
      const enrichedBookings = await Promise.all(
        data.map(async (booking, index) => {
          const userDetails = await fetchUserDetails(booking.user_id);
          const consultationType = booking.meet_link
            ? "Video Consultation"
            : "Offline Consultation";

          return {
            ...booking,
            serial: index + 1,
            patientName: userDetails?.name || "Unknown",
            consultationType: consultationType,
          };
        })
      );

      setBookings(enrichedBookings);
    } catch (err) {
      console.error("❌ fetchTodayBookings ERROR:", err);
    }
  };

  const fetchUpcomingAppointment = async (userId) => {
    try {
      const url = `${API_URL}/booking/users/${userId}/bookings?type=upcoming`;
      const res = await fetch(url);

      if (!res.ok) return;

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setAppointmentData(null);
        setDoctorData(null);
        setActiveSubscription(null);
        setConsultationRemaining(0);
        return;
      }

      const booking = data[0];
      setAppointmentData(booking);

      const doctor = await fetchDoctor(booking.doctor_id);
      if (doctor) setDoctorData(doctor);

      const subscription = await fetchActiveSubscription(
        userId,
        booking.doctor_id
      );
      setActiveSubscription(subscription);

      const remaining =
        (subscription?.appointments_total ?? 0) -
        (subscription?.appointments_used ?? 0);

      setConsultationRemaining(Math.max(remaining, 0));
    } catch (err) {
      console.error("❌ fetchUpcomingAppointment EXCEPTION:", err);
    }
  };

  useEffect(() => {
    // Sync AuthContext user with local state
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // // Check if user is a doctor - redirect if not
  // useEffect(() => {
  //   if (role && role !== "doctor") {
  //     console.warn("❌ Access Denied: Only doctors can access this dashboard");
  //     if (navigation?.navigate) {
  //       navigation.navigate("LandingPage");
  //     }
  //   }
  // }, [role, navigation]);

  useEffect(() => {
    if (!user?.user_id) return;
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    fetchUpcomingAppointment(user.user_id);
  }, [user?.user_id]);

  useEffect(() => {
    if (!user?.doctor_id) return;
    fetchEarningsSummary(user.doctor_id);
    fetchSubscriberCount(user.doctor_id);
    fetchTodayBookings(user.doctor_id, selectedDate);
  }, [user?.doctor_id, selectedDate]);

  const handleJoinCall = () => {
    if (!appointmentData?.meet_link) return;
    if (Platform.OS === "web") window.open(appointmentData.meet_link, "_blank");
    else Linking.openURL(appointmentData.meet_link);
  };

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
      const now = new Date();

      setDocuments((prev) => [
        ...prev,
        {
          id: Date.now(),
          date: toDateKey(now), // ✅ stable date
          time: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          name: file.name,
          format: "." + file.name.split(".").pop(),
          type: detectType(file.name),
          uri: file.uri,
        },
      ]);
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

  const formatDate = (date) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCurrentMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1)
    );
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      const savedDocs = localStorage.getItem("medilocker_docs");
      if (savedDocs) setDocuments(JSON.parse(savedDocs));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      localStorage.setItem("medilocker_docs", JSON.stringify(documents));
    }
  }, [documents]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const savedIssue = localStorage.getItem("issueDocs");
      if (savedIssue) setIssueDocs(JSON.parse(savedIssue));
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      localStorage.setItem("issueDocs", JSON.stringify(issueDocs));
    }
  }, [issueDocs]);

  // ✅ Filter documents based on date, status, and search query
  useEffect(() => {
    let filtered = documents;

    if (searchQuery.trim()) {
      filtered = filtered.filter((doc) =>
        String(doc.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // ✅ Date filter using stable keys - now uses selectedHistoryDate
    if (selectedHistoryDate) {
      const selectedKey = toDateKey(selectedHistoryDate);
      filtered = filtered.filter((doc) => toDateKey(doc.date) === selectedKey);
    }

    if (selectedStatus !== "All Status") {
      filtered = filtered.filter((doc) => doc.type === selectedStatus);
    }

    setFilteredDocuments(filtered);
    setCurrentPage(1);
  }, [documents, searchQuery, selectedHistoryDate, selectedStatus]);

  const statusOptions = [
    "All Status",
    "Report",
    "Scan",
    "Prescription",
    "Lab test",
    "Other",
  ];

  const scrollForward = () => {
    dateScrollRef.current?.scrollTo({
      x: scrollX + SCROLL_STEP,
      animated: true,
    });
  };

  const scrollBackward = () => {
    dateScrollRef.current?.scrollTo({
      x: Math.max(0, scrollX - SCROLL_STEP),
      animated: true,
    });
  };

  return (
    <>
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

      {Platform.OS === "web" && (
        <View style={styles.webContainer}>
          <View style={styles.Left}>
            <NewestSidebar navigation={navigation} />
          </View>

          <View style={styles.Right}>
            <View style={styles.header}>
              <HeaderLoginSignUp navigation={navigation} />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>
                  Welcome, {user?.name || "User"}!
                </Text>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <View style={styles.statIconBox}>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/todayappointment.png")}
                        style={styles.statIcon}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.statsIconBox}>
                      <Text style={styles.statsIconText}>15.8%</Text>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/upArrow.png")}
                        style={styles.statsIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  <Text style={styles.statLabel}>
                  Total No. Of Today's Appointments
                  </Text>
                  <Text style={styles.statValue}>
                    {bookings && bookings.length > 0 ? bookings.length : 0}
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <View style={styles.statIconBox}>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/todayappointment.png")}
                        style={styles.statIcon}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.statsIconBox}>
                      <Text style={styles.statsIconText}>15.8%</Text>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/upArrow.png")}
                        style={styles.statsIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                  <Text style={styles.statLabel}>Total Subscribers</Text>
                  <Text style={styles.statValue}>{subscriberCount}</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <View style={styles.statIconBox}>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/todayappointment.png")}
                        style={styles.statIcon}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.statsIconBox}>
                      <Text style={styles.statsIconText}>15.8%</Text>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/downArrow.png")}
                        style={styles.statsIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                  <Text style={styles.statLabel}>pending consultation</Text>
                  <Text style={styles.statValue}>0</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <View style={styles.statIconBox}>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/todayappointment.png")}
                        style={styles.statIcon}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.statsIconBox}>
                      <Text style={styles.statsIconText}>15.8%</Text>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/upArrow.png")}
                        style={styles.statsIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  <Text style={styles.statLabel}>Earning This Month</Text>
                  <Text style={styles.statValue}>
                    ₹{availableAmount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Two-Column Layout */}
              <View style={styles.twoColumnLayout}>
                {/* Upcoming Appointments */}
                <View style={styles.upcomingSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.statIconBox}>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/secondrowicon.png")}
                        style={styles.statIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.sectionTitle}>
                      Upcoming Appointments
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        marginLeft: "auto",
                        marginRight: "2%",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#D9D9D9",
                          }}
                        />
                        <Text style={{ fontSize: 13 }}>Available Slots</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#FF7072",
                          }}
                        />
                        <Text style={{ fontSize: 13 }}>Selected</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#FFFFFF",
                            borderWidth: 1,
                            borderColor: "#D2D6DB",
                          }}
                        />
                        <Text style={{ fontSize: 13 }}>Unavailable</Text>
                      </View>
                    </View>
                  </View>

                  {/* Calendar - Horizontal Scroll */}
                  <View style={styles.calendarRow}>
                    <TouchableOpacity
                      onPress={scrollBackward}
                      style={styles.scrollBtn}
                    >
                      <Text style={styles.scrollArrow}>‹</Text>
                    </TouchableOpacity>

                    <ScrollView
                      ref={dateScrollRef}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      onScroll={(e) =>
                        setScrollX(e.nativeEvent.contentOffset.x)
                      }
                      scrollEventThrottle={16}
                      contentContainerStyle={styles.calendarContent}
                    >
                      {getCurrentMonthDays().map((date, index) => {
                        const isActive = isSameDate(date, selectedDate);

                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.dayButton,
                              isActive && styles.dayButtonActive,
                            ]}
                            onPress={() => setSelectedDate(date)}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                isActive && styles.dayTextActive,
                              ]}
                            >
                              {date.getDate()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    <TouchableOpacity
                      onPress={scrollForward}
                      style={styles.scrollBtn}
                    >
                      <Text style={styles.scrollArrow}>›</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Table */}
                  <View style={styles.appointmentsTable}>
                    <View style={styles.tableHead}>
                      <Text style={[styles.tableHeadText, { flex: 0.6 }]}>
                        ID
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 1.2 }]}>
                        Time
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 2 }]}>
                        Patient Name
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 2 }]}>
                        Consultation type
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 1 }]}>
                        Status
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 0.8 }]}>
                        Action
                      </Text>
                    </View>

                    {bookings && bookings.length > 0 ? (
                      bookings.map((item, idx) => {
                        return (
                          <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 0.6 }]}>
                              #{item.serial}
                            </Text>
                            <Text style={[styles.tableName, { flex: 1.2 }]}>
                              {item.start_time}
                            </Text>
                            <Text style={[styles.tableName, { flex: 2 }]}>
                              {item.patientName}
                            </Text>

                            <View style={[styles.tableBadge, { flex: 2 }]}>
                              <Text style={styles.tableBadgeText}>
                                {item.consultationType}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  // flex: 1,
                                  backgroundColor: "#C8E6C922",
                                },
                              ]}
                            >
                              <Text style={{ fontSize: 12, color: "#388E3C" }}>
                                Pending
                              </Text>
                            </View>

                            <TouchableOpacity
                              style={[
                                styles.actionBtn,
                                {
                                  // flex: 0.8,
                                  backgroundColor: item.meet_link
                                    ? "#FF6B6B"
                                    : "#ccc",
                                },
                              ]}
                              disabled={!item.meet_link}
                              onPress={() => {
                                if (item.meet_link) {
                                  if (Platform.OS === "web") {
                                    window.open(item.meet_link, "_blank");
                                  } else {
                                    Linking.openURL(item.meet_link);
                                  }
                                }
                              }}
                            >
                              <Text style={styles.actionBtnText}>🎥</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.noData}>No appointments</Text>
                    )}

                    <View style={styles.paginationFooter}>
                      <Text style={styles.paginationText}>
                        Showing{" "}
                        {Math.min(
                          itemsPerPage,
                          filteredDocuments.length - indexOfFirst
                        )}{" "}
                        of {filteredDocuments.length} result
                      </Text>

                      <View style={styles.paginationControls}>
                        <TouchableOpacity
                          style={styles.prevButton}
                          onPress={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                        >
                          <Text style={styles.prevText}>‹ Prev</Text>
                        </TouchableOpacity>

                        {[
                          ...Array(
                            Math.ceil(filteredDocuments.length / itemsPerPage)
                          ),
                        ].map((_, i) => (
                          <TouchableOpacity
                            key={i}
                            style={[
                              styles.pageBtn,
                              currentPage === i + 1 && styles.pageBtnActive,
                            ]}
                            onPress={() => setCurrentPage(i + 1)}
                          >
                            <Text
                              style={[
                                styles.pageBtnText,
                                currentPage === i + 1 &&
                                  styles.pageBtnTextActive,
                              ]}
                            >
                              {i + 1}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.prevButton}
                          onPress={() =>
                            currentPage <
                              Math.ceil(
                                filteredDocuments.length / itemsPerPage
                              ) && setCurrentPage(currentPage + 1)
                          }
                        >
                          <Text style={styles.prevText}>Next ›</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Section */}
              <View style={styles.bottomLayout}>
                {/* LEFT: Patient History */}
                <View style={styles.patientHistorySection}>
                  <View style={styles.historyHeader}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={styles.statIconBox}>
                        <Image
                          source={require("../../assets/DoctorsPortal/Icons/secondrowicon.png")}
                          style={styles.statIcon}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.sectionTitle}>Patient History</Text>
                    </View>

                    <View style={styles.historyControls}>
                      <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => console.log("Filter clicked")}
                      >
                        <Text style={styles.filterBtnText}>⚙ Filter</Text>
                      </TouchableOpacity>

                      <Text style={styles.dateLabel}>Date :</Text>

                      {/* ✅ Real date picker - uses selectedHistoryDate */}
                      <DatePickerField
                        value={selectedHistoryDate}
                        onChange={(d) => setSelectedHistoryDate(d)}
                        style={{ minWidth: 160 }}
                      />

                      <Text style={styles.statusLabel}>Status :</Text>

                      <TouchableOpacity
                        style={styles.statusButtonField}
                        onPress={() =>
                          setShowStatusDropdown(!showStatusDropdown)
                        }
                      >
                        <Text style={styles.statusButtonText}>
                          {selectedStatus}
                        </Text>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.searchInputField}
                        placeholder="Search For Patient"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>
                  </View>

                  {/* Table */}
                  <ScrollView style={styles.historyTable} horizontal={false}>
                    <View style={styles.tableHead}>
                      <Text style={[styles.tableHeadText, { flex: 0.5 }]}>
                        ID
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 1 }]}>
                        Date
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 1 }]}>
                        Time
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 2 }]}>
                        Patient Name
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 1.5 }]}>
                        Consultation Type
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 1 }]}>
                        Status
                      </Text>
                      <Text style={[styles.tableHeadText, { flex: 0.8 }]}>
                        Action
                      </Text>
                    </View>

                    {filteredDocuments.length > 0 ? (
                      filteredDocuments
                        .slice(indexOfFirst, indexOfLast)
                        .map((doc, idx) => (
                          <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 0.5 }]}>
                              {idx + indexOfFirst + 1}
                            </Text>

                            {/* ✅ Pretty display */}
                            <Text style={[styles.tableCell, { flex: 1 }]}>
                              {doc.date
                                ? formatDate(fromDateKey(doc.date))
                                : "—"}
                            </Text>

                            <Text style={[styles.tableCell, { flex: 1 }]}>
                              {doc.time}
                            </Text>

                            <Text style={[styles.tableCell, { flex: 2 }]}>
                              {doc.name}
                            </Text>

                            <TouchableOpacity
                              style={[styles.conditionBadge, { flex: 1.5 }]}
                            >
                              <Text style={styles.conditionText}>
                                Regular Checkup
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.statusBadge, { flex: 1 }]}
                            >
                              <Text style={styles.statusBadgeText}>
                                Scheduled
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.actionBtn, { flex: 0.8 }]}
                              onPress={() => {
                                setDocuments(
                                  documents.filter(
                                    (_, i) => i !== idx + indexOfFirst
                                  )
                                );
                                console.log("Delete record", idx);
                              }}
                            >
                              <Text style={styles.actionBtnText}>−</Text>
                            </TouchableOpacity>
                          </View>
                        ))
                    ) : (
                      <Text style={styles.noData}>
                        No patient history found
                      </Text>
                    )}

                    <View style={styles.paginationFooter}>
                      <Text style={styles.paginationText}>
                        Showing{" "}
                        {Math.min(
                          itemsPerPage,
                          filteredDocuments.length - indexOfFirst
                        )}{" "}
                        of {filteredDocuments.length} result
                      </Text>

                      <View style={styles.paginationControls}>
                        <TouchableOpacity
                          style={styles.prevButton}
                          onPress={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                        >
                          <Text style={styles.prevText}>‹ Prev</Text>
                        </TouchableOpacity>

                        {[
                          ...Array(
                            Math.ceil(filteredDocuments.length / itemsPerPage)
                          ),
                        ].map((_, i) => (
                          <TouchableOpacity
                            key={i}
                            style={[
                              styles.pageBtn,
                              currentPage === i + 1 && styles.pageBtnActive,
                            ]}
                            onPress={() => setCurrentPage(i + 1)}
                          >
                            <Text
                              style={[
                                styles.pageBtnText,
                                currentPage === i + 1 &&
                                  styles.pageBtnTextActive,
                              ]}
                            >
                              {i + 1}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.prevButton}
                          onPress={() =>
                            currentPage <
                              Math.ceil(
                                filteredDocuments.length / itemsPerPage
                              ) && setCurrentPage(currentPage + 1)
                          }
                        >
                          <Text style={styles.prevText}>Next ›</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ScrollView>
                </View>

                {/* RIGHT: Notification Section */}
                <View style={styles.notificationSection}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.statIconBox}>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/secondrowicon.png")}
                        style={styles.statIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.sectionTitle}>Notification</Text>
                  </View>

                  <View style={styles.notificationList}>
                    <TouchableOpacity style={styles.notifItem}>
                      <View style={styles.notifIcon}>
                        <Image
                          source={require("../../assets/DoctorsPortal/Icons/Notificationss.png")}
                          style={styles.statIcon}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={styles.notifBody}>
                        <Text style={styles.notifTitle}>
                          New Patient Subscribed Preeti Sabrawal
                        </Text>
                        <Text style={styles.notifTime}>
                          Mon, May 01, 10:00 AM
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.notifItem}>
                      <View style={styles.notifIcon}>
                        <Image
                          source={require("../../assets/DoctorsPortal/Icons/Notificationss.png")}
                          style={styles.statIcon}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={styles.notifBody}>
                        <Text style={styles.notifTitle}>
                          New Patient Subscribed Preeti Sabrawal
                        </Text>
                        <Text style={styles.notifTime}>
                          Mon, May 01, 10:00 AM
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.notifItem}>
                      <View style={styles.notifIcon}>
                        <Image
                          source={require("../../assets/DoctorsPortal/Icons/Notificationss.png")}
                          style={styles.statIcon}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={styles.notifBody}>
                        <Text style={styles.notifTitle}>
                          New Patient Subscribed Preeti Sabrawal
                        </Text>
                        <Text style={styles.notifTime}>
                          Mon, May 01, 10:00 AM
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
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
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
  },
  Left: {
    height: "100%",
    width: "15%",
    backgroundColor: "#fff",
  },
  Right: {
    flex: 1,
    width: "85%",
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  welcomeSection: {
    paddingHorizontal: "2%",
    paddingVertical: "2%",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    gap: 12,
  },
  statCard: {
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#fff",
    padding: "1.5%",
    borderRadius: 6,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
  },
  statIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statLabel: {
    fontSize: 14,
    color: "#000000",
    marginTop: "4%",
    marginBottom: "3%",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: "1%",
  },
  twoColumnLayout: {
    flexDirection: "row",
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    gap: 15,
  },
  upcomingSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: "1.5%",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
  },
  sectionHeader: {
    flexDirection: "row",
    marginBottom: "1.5%",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: "1%",
    marginLeft: "2%",
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dayButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  dayText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  dayTextActive: {
    color: "#fff",
  },
  appointmentsTable: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    paddingVertical: "1%",
    paddingHorizontal: "1%",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeadText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: "1.2%",
    paddingHorizontal: "1%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    fontSize: 12,
    color: "#FFCC00",
    fontWeight: "500",
  },
  tableName: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  tableBadge: {
    // backgroundColor: "#E3F2FD",
    paddingVertical: "2%",
    paddingHorizontal: "1%",
    borderRadius: 3,
  },
  tableBadgeText: {
    fontSize: 14,
    color: "#1680ECBF",
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: "#FFEDD5",
    paddingVertical: "1%",
    paddingHorizontal: "2%",
    borderRadius: 3,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD7A2",
    marginRight: "6%",
  },
  statusBadgeText: {
    fontSize: 12,
    color: "#F67442",
    fontWeight: "500",
  },
  conditionBadge: {
    backgroundColor: "#FFE5B4",
    paddingVertical: "2%",
    paddingHorizontal: "1%",
    borderRadius: 3,
  },
  conditionText: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "500",
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statsIconBox: {
    width: 52,
    height: 22,
    borderRadius: 8,
    flexDirection: "row",
    backgroundColor: "#FFE7E8",
    gap: "10%",
    borderRadius: 2,
    padding: "1%",
    alignItems: "center",
  },
  statsIconText: {
    fontSize: 12,
    color: "#00A456",
    fontWeight: 500,
  },
  statIcon: {
    width: 35,
    height: 35,
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scrollBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  scrollArrow: {
    fontSize: 18,
    fontWeight: "700",
    color: "#666",
  },
  calendarContent: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  statsIcon: {
    width: 10,
    height: 10,
  },
  actionBtn: {
    backgroundColor: "#FF6B6B",
    paddingVertical: "1%",
    paddingHorizontal: "1%",
    borderRadius: 3,
    alignItems: "center",
    marginRight: "7%",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  paginationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "1%",
    paddingHorizontal: "1%",
    backgroundColor: "#fafafa",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  paginationText: {
    fontSize: 11,
    color: "#666",
  },
  prevButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 4,
    alignItems: "center",
  },
  prevText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#717273",
  },
  paginationControls: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationBtn: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    // paddingHorizontal: "2%",
  },
  pageBtn: {
    width: 26,
    height: 26,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  pageBtnActive: {
    backgroundColor: "#0065FF",
    borderRadius: 3,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  pageBtnTextActive: {
    color: "#fff",
  },
  todayList: {
    gap: 8,
  },
  todayItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    paddingVertical: "1.5%",
    paddingHorizontal: "1.5%",
    gap: 10,
  },
  todayTime: {
    backgroundColor: "#FFE5E5",
    paddingVertical: "1%",
    paddingHorizontal: "1.5%",
    borderRadius: 3,
    alignItems: "center",
  },
  todayTimeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  todayAMPM: {
    fontSize: 10,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  todayInfo: {
    flex: 1,
  },
  todayName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  todaySubtext: {
    fontSize: 11,
    color: "#999",
    marginTop: "2%",
  },
  todayJoinBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: "2%",
    paddingHorizontal: "3%",
    borderRadius: 3,
  },
  todayJoinText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  bottomLayout: {
    flexDirection: "row",
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    gap: 15,
  },
  patientHistorySection: {
    flex: 0.65,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: "1.5%",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
  },
  historyHeader: {
    marginBottom: "1.5%",
  },
  historyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: "1%",
    flexWrap: "wrap",
  },
  filterBtn: {
    borderWidth: 1,
    borderColor: "#FFD1D1",
    backgroundColor: "#FFF1F2",
    paddingVertical: "1%",
    paddingHorizontal: "2%",
    borderRadius: 3,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#333",
  },
  dateLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  dateInputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    minWidth: 120,
    backgroundColor: "#fff",
  },
  dateInputFieldText: {
    fontSize: 11,
    color: "#333",
  },
  statusLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  statusButtonField: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    minWidth: 100,
    backgroundColor: "#fff",
  },
  statusButtonText: {
    fontSize: 11,
    color: "#333",
  },
  searchInputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    flex: 1,
    minWidth: 150,
    fontSize: 11,
    color: "#333",
    backgroundColor: "#fff",
  },
  historyTable: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  noData: {
    textAlign: "center",
    color: "#999",
    paddingVertical: "2%",
    fontSize: 12,
  },
  notificationSection: {
    flex: 0.35,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: "1.5%",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
  },
  notificationList: {
    gap: 0,
    flex: 1,
    overflow: "hidden",
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "1.2%",
    paddingHorizontal: "1%",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#C8E6C9",
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  notifTime: {
    fontSize: 11,
    color: "#999",
    marginTop: "2%",
  },
  notifMenu: {
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },

  // ✅ web date input styles
  webDateWrap: {
    minWidth: 160,
  },
  webDateInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "3px",
    border: "1px solid #ddd",
    fontSize: "11px",
    backgroundColor: "#fff",
    outline: "none",
  },

  // (dropdown styles used in your status dropdown – keep them if you already had them elsewhere)
  statusDropdown: {
    position: "absolute",
    top: 38,
    left: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    zIndex: 999,
    minWidth: 140,
    paddingVertical: 6,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statusOptionActive: {
    backgroundColor: "#FFE7E8",
  },
  statusOptionText: {
    fontSize: 11,
    color: "#333",
  },
  statusOptionTextActive: {
    fontWeight: "700",
  },
});

export default DoctorDashboard;
