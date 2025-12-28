import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewestSidebarDr from "../../components/DoctorsPortalComponents/NewestSidebar";
import { API_URL } from "../../env-vars";
import { useAuth } from "../../contexts/AuthContext";

const DrCalendarView = ({ navigation }) => {
  const { user } = useAuth(); // doctor logged in
  console.log("doctor:", user);
  const doctorId = user?.doctor_id;

  console.log("👤 Auth user object:", user);
  console.log("🆔 Derived doctorId:", doctorId);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentWeek, setCurrentWeek] = useState(generateWeekDates());
  const [appointmentData, setAppointmentData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState("Week");
  const horizontalScrollRef = useRef(null);
  const tabs = ["Day", "Week", "Month"];
  const [usersMap, setUsersMap] = useState({});

  /* ==============================
     DATE HELPERS
  ============================== */

  function generateWeekDates() {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        name: d.toLocaleDateString("en-US", { weekday: "short" }), // "Mon"
        fullDate: d,
        date: d.getDate(),
      };
    });
  }

  const generateTimeSlots = (startHour = 9, endHour = 17) => {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      const suffix = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      slots.push(`${displayHour}:00 ${suffix}`);
    }
    return slots;
  };

  const TIME_SLOTS = generateTimeSlots(); // ["9:00 AM", "10:00 AM", ..., "5:00 PM"]

  const generateEmptyCalendar = () => {
    const calendar = {};
    const weekDates = generateWeekDates();

    weekDates.forEach((day) => {
      const dayName = day.fullDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      calendar[dayName] = {};
      TIME_SLOTS.forEach((time) => {
        calendar[dayName][time] = { hasAppointment: false, data: null };
      });
    });

    return calendar;
  };

  useEffect(() => {
    const calendar = generateEmptyCalendar();

    bookings.forEach((b) => {
      const dayName = new Date(b.date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      // Convert "09:00" → "9:00 AM" dynamically
      const [hour, minute] = b.start_time.split(":").map(Number);
      const suffix = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const slot = `${displayHour}:${minute
        .toString()
        .padStart(2, "0")} ${suffix}`;

      if (calendar[dayName] && calendar[dayName][slot]) {
        calendar[dayName][slot] = {
          hasAppointment: true,
          data: b,
        };
      }
    });

    setAppointmentData(calendar);
  }, [bookings]);

  /* ==============================
     FETCH BOOKINGS
  ============================== */

  useEffect(() => {
    if (!doctorId) {
      console.warn("❌ doctorId not found from auth");
      return;
    }

    const fetchUpcomingBookings = async () => {
      try {
        const url = `${API_URL}/booking/doctors/${doctorId}/bookings?type=upcoming`;
        console.log("📡 Fetching bookings:", url);

        const res = await fetch(url);
        const data = await res.json();

        console.log("✅ Raw bookings from backend:", data);
        setBookings(data);
      } catch (err) {
        console.error("❌ Failed to fetch bookings:", err);
      }
    };

    fetchUpcomingBookings();
  }, [doctorId]);

  useEffect(() => {
    const fetchUsers = async () => {
      const map = {};
      for (const booking of bookings) {
        try {
          const res = await fetch(`${API_URL}/users/${booking.user_id}`);
          const userData = await res.json();
          console.log("👤 user api response:", booking.user_id, userData);
          map[booking.user_id] = userData.user?.name; // assuming API returns {name: "..."}
        } catch (err) {
          console.error(err);
        }
      }
      setUsersMap(map);
    };
    if (bookings.length > 0) fetchUsers();
  }, [bookings]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderTimeSlot = (time) => (
    <View style={styles.timeSlotContainer}>
      <Text style={styles.timeSlotText}>{time}</Text>
    </View>
  );

  const renderAppointment = (day, timeSlot) => {
    const dayName = day.fullDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const slotData = appointmentData?.[dayName]?.[timeSlot];

    // 🟢 No booking → Available slot
    if (!slotData || !slotData.hasAppointment) {
      return (
        <View style={styles.emptyAppointmentCard}>
          <Text style={styles.availableText}>Available</Text>
        </View>
      );
    }

    const booking = slotData.data;

    // 🟢 Booking card ONLY
    return (
      <View
        style={{
          backgroundColor: "#FFECEC",
          padding: 10,
          borderRadius: 8,
          minHeight: 100,
          borderWidth: 1,
          borderColor: "#FF6B6B",
        }}
      >
        <Text style={{ fontWeight: "700", fontSize:15}}>{usersMap[booking.user_id] || "Unknown"}</Text>

        <Text style={{ fontWeight: "500", marginBottom: 4 }}>Appointment</Text>

        <Text style={{ fontSize: 13 }}>
          Date: {booking.date?.split("T")[0]}
        </Text>

        <Text style={{ fontSize: 13 , fontWeight:"400"}}>Time: {timeSlot}</Text>

        {/* <Text style={{ fontSize: 13 }}>Status: {booking.status}</Text> */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {sidebarOpen && (
        <View style={styles.sidebarContainer}>
          <NewestSidebar
            navigation={navigation}
            closeSidebar={toggleSidebar}
            activeItem="Calendar"
          />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Menu button for small screens */}
        {!sidebarOpen && (
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <MaterialIcons name="menu" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={{ backgroundColor: "#FDF8F8", paddingTop: "2%" }}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Calendar</Text>
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    selected === tab && styles.selectedTab,
                  ]}
                  onPress={() => setSelected(tab)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selected === tab && styles.selectedText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search & Filters */}
          <View style={styles.controlsContainer}>
            <View style={styles.searchContainer}>
              <Image
                source={require("../../assets/Icons/search.png")}
                style={styles.imagepic}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Appointment"
                value={searchText}
                onChangeText={setSearchText}
              />
              <Image
                source={require("../../assets/Icons/search.png")}
                style={styles.imagepicc}
              />
            </View>

            <View style={styles.filterButton}>
              <TouchableOpacity>
                <Text style={styles.filterButtonText}>All Types</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterButton}>
              <TouchableOpacity>
                <Text style={styles.filterButtonText}>All Status</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginLeft: "5%", width: "22%" }}>
              <TouchableOpacity style={styles.syncButton}>
                <Text style={styles.syncButtonText}>Sync Google Calendar</Text>
              </TouchableOpacity>
            </View>

            <View style={{ width: "22%" }}>
              <TouchableOpacity style={styles.newAppointmentButton}>
                <Text style={styles.newAppointmentText}>New Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Calendar Grid */}
        <ScrollView style={styles.calendarGrid}>
          {/* Day Headers */}
          <View style={styles.daysHeaderRow}>
            <View style={styles.timeColumnHeader}>
              {/* Empty top-left corner */}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={horizontalScrollRef}
            >
              {currentWeek.map((day, index) => (
                <View key={index} style={styles.dayHeaderCell}>
                  <Text style={styles.dayName}>
                    {day.name} {day.date}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Time Slots & Appointments */}
          {TIME_SLOTS.map((time) => (
            <View key={time} style={styles.timeRow}>
              {/* Time Column */}
              <View style={styles.timeColumn}>{renderTimeSlot(time)}</View>

              {/* Appointments Row */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  if (horizontalScrollRef.current) {
                    horizontalScrollRef.current.scrollTo({
                      x: e.nativeEvent.contentOffset.x,
                      animated: false,
                    });
                  }
                }}
                scrollEventThrottle={16}
              >
                {currentWeek.map((day, index) => (
                  <View key={index} style={styles.appointmentSlot}>
                    {renderAppointment(day, time)}
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  sidebarContainer: {
    width: "15%", // Using percentage as requested
    backgroundColor: "#f5f5f5",
    ...Platform.select({
      web: {
        height: "100vh",
      },
      default: {
        height: "100%",
      },
    }),
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    // backgroundColor: "#FDF8F8", // Lighter background to match design
    // padding: "1.5%", // Using percentage for responsiveness
  },
  menuButton: {
    position: "absolute",
    top: "2%",
    left: "2%",
    zIndex: 10,
  },
  calendarHeader: {
    marginLeft: "3%",
    flexDirection: "row",

    alignItems: "center",
    marginBottom: "1%",
    paddingHorizontal: "1%",
  },
  maintextBox: {
    position: "absolute",
    justifyContent: "center",
    marginTop: "15%",

    alignItems: "center",

    alignSelf: "center",
    zIndex: 2,
  },
  mainText: {
    fontSize: 40,
    fontWeight: "600",
    color: "#000000",
  },
  calendarTitle: {
    fontSize: 40,
    fontWeight: "700",
    color: "#333",
  },

  controlsContainer: {
    marginLeft: "4%",
    marginRight: "4%",
    flexDirection: "row",
    gap: "1.5%",
    alignItems: "center",
    backgroundColor: "#B0B6FF50",
    padding: "1.5%",
    borderRadius: 8,
    // marginBottom: "2%",
  },
  searchContainer: {
    width: "24%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderColor: "#B0B6FF",
    borderWidth: 1,
  },
  imagepic: {
    width: 16,
    height: 16,
  },
  imagepicc: {
    width: 10,
    height: 15,
    marginLeft: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#333",

    marginLeft: "6%",
    fontWeight: "300",
    outlineWidth: 0,
  },

  filterButton: {
    width: "10%",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderColor: "#B0B6FF",
    borderWidth: 1,
  },
  filterButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "400",
  },

  syncButton: {
    backgroundColor: "#fff",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#B0B6FF",
    borderWidth: 1,
  },
  syncButtonText: {
    fontWeight: "600",
    color: "#000000",
    fontSize: 14,
  },
  newAppointmentButton: {
    backgroundColor: "#ff6347",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  newAppointmentText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  calendarGrid: {
    flex: 1,
    // backgroundColor: "#f0f2ff",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingTop: "3%",
  },
  daysHeaderRow: {
    flexDirection: "row",
    // marginBottom: "1%",

    // borderBottomColor: "#ddd",
  },
  timeColumnHeader: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeaderCell: {
    width: 180,
    alignItems: "center",
    // paddingVertical: "1%",
  },
  dayName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
  },
  timeRow: {
    flexDirection: "row",
    marginBottom: "1%",
  },
  timeColumn: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  timeSlotContainer: {
    marginBottom: "90%",
  },

  tabsContainer: {
    flexDirection: "row",
    marginLeft: "4%",
    gap: "6%",
  },
  tabButton: {
    width: "36%",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTab: {
    backgroundColor: "#FF6B6B",
  },
  tabText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "500",
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  appointmentSlot: {
    width: 180,
    padding: 4,
  },

  emptyAppointmentCard: {
    width: "100%",
    padding: "5%",
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    color: "#B0B6FF",
    borderColor: "#B0B6FF",
    borderWidth: 1,
  },
  availableText: {
    color: "#999",
    fontSize: 14,
    marginBottom: "40%",
  },
});
export default DrCalendarView;
