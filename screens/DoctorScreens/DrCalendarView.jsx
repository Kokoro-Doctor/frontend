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
  useWindowDimensions,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import { API_URL } from "../../env-vars";
import { useAuth } from "../../contexts/AuthContext";

const DrCalendarView = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isMobileLike = Platform.OS !== "web" || width < 768;
  const doctorId = user?.doctor_id;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobileLike);
  const [searchText, setSearchText] = useState("");
  const [currentWeek, setCurrentWeek] = useState(generateWeekDates());
  const [appointmentData, setAppointmentData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState("Month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const horizontalScrollRef = useRef(null);
  const tabs = ["Day", "Week", "Month"];
  const [usersMap, setUsersMap] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (isMobileLike) {
      setSidebarOpen(false);
    }
  }, [isMobileLike]);

  function generateWeekDates() {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        name: d.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: d,
        date: d.getDate(),
      };
    });
  }

  // Generate calendar dates for the month
  const generateMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();

    // Adjust startDay for Monday as first day of week
    let startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday...
    startDay = startDay === 0 ? 6 : startDay - 1; // shift so Monday = 0, Sunday = 6

    const dates = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      dates.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  };

  const generateTimeSlots = (startHour = 9, endHour = 17) => {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      const suffix = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      slots.push(`${displayHour}:00 ${suffix}`);
    }
    return slots;
  };

  const TIME_SLOTS = generateTimeSlots();

  const generateEmptyCalendar = () => {
    const calendar = {};
    const weekDates = generateWeekDates();

    weekDates.forEach((day) => {
      const dateKey = day.fullDate.toISOString().split("T")[0];
      calendar[dateKey] = {};

      TIME_SLOTS.forEach((time) => {
        calendar[dateKey][time] = { hasAppointment: false, data: null };
      });
    });

    return calendar;
  };

  useEffect(() => {
    const calendar = generateEmptyCalendar();

    bookings.forEach((b) => {
      const dateKey = b.date.split("T")[0];

      const [hour, minute] = b.start_time.split(":").map(Number);
      const suffix = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const slot = `${displayHour}:${minute
        .toString()
        .padStart(2, "0")} ${suffix}`;

      if (calendar[dateKey] && calendar[dateKey][slot]) {
        calendar[dateKey][slot] = {
          hasAppointment: true,
          data: b,
        };
      }
    });

    setAppointmentData(calendar);
  }, [bookings]);

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

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     const map = {};
  //     for (const booking of bookings) {
  //       try {
  //         const res = await fetch(`${API_URL}/users/${booking.user_id}`);
  //         const userData = await res.json();
  //         console.log("👤 user api response:", booking.user_id, userData);
  //         map[booking.user_id] = userData.user?.name;
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     }
  //     setUsersMap(map);
  //   };
  //   if (bookings.length > 0) fetchUsers();
  // }, [bookings]);
  useEffect(() => {
    if (!bookings.length) return;

    const fetchUsers = async () => {
      try {
        const uniqueUserIds = [
          ...new Set(bookings.map((b) => b.user_id).filter(Boolean)),
        ];

        const missingUserIds = uniqueUserIds.filter((id) => !usersMap[id]);

        if (missingUserIds.length === 0) return;

        const results = await Promise.all(
          missingUserIds.map(async (userId) => {
            const res = await fetch(`${API_URL}/users/${userId}`);
            const data = await res.json();

            if (!data?.user) {
              console.warn("⚠️ User not found:", userId);
              return null;
            }

            return { userId, name: data.user.name };
          })
        );

        setUsersMap((prev) => {
          const updated = { ...prev };
          results.forEach((item) => {
            if (item) updated[item.userId] = item.name;
          });
          return updated;
        });
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [bookings]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const joinCall = (meetLink) => {
    if (!meetLink) return;

    if (Platform.OS === "web") {
      window.open(meetLink, "_blank");
    } else {
      Linking.openURL(meetLink);
    }
  };

  const isPastBooking = (booking) => {
    if (!booking?.date || !booking?.start_time) return false;

    const bookingDateTime = new Date(
      `${booking.date.split("T")[0]}T${booking.start_time}`
    );

    return bookingDateTime < new Date();
  };

  const renderAppointment = (day, timeSlot) => {
    const dateKey = day.fullDate.toISOString().split("T")[0];
    const slotData = appointmentData?.[dateKey]?.[timeSlot];

    if (!slotData || !slotData.hasAppointment) {
      return (
        <View style={styles.emptyAppointmentCard}>
          <Text style={styles.availableText}>Available</Text>
        </View>
      );
    }

    const booking = slotData.data;
    const isPast = isPastBooking(booking);

    return (
      <View
        style={[styles.appointmentCard, isPast && styles.pastAppointmentCard]}
      >
        <Text
          style={[styles.appointmentName, isPast && styles.pastAppointmentText]}
        >
          {usersMap[booking.user_id] || "Unknown"}
        </Text>

        <Text
          style={[
            styles.appointmentLabel,
            isPast && styles.pastAppointmentText,
          ]}
        >
          Appointment
        </Text>

        <Text
          style={[styles.appointmentMeta, isPast && styles.pastAppointmentText]}
        >
          Date: {booking.date?.split("T")[0]}
        </Text>

        <Text
          style={[styles.appointmentMeta, isPast && styles.pastAppointmentText]}
        >
          Time: {timeSlot}
        </Text>

        {/* ✅ WEB Join Call button for upcoming appointments */}
        {!isPast && booking.meet_link && Platform.OS === "web" && (
          <TouchableOpacity
            style={styles.webJoinButton}
            onPress={() => joinCall(booking.meet_link)}
          >
            <Text style={styles.webJoinButtonText}>Join Call</Text>
          </TouchableOpacity>
        )}

        {isPast && <Text style={styles.expiredText}>Expired</Text>}
      </View>
    );
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderMobileCalendar = () => {
    const monthDates = generateMonthDates();
    const today = new Date();

    return (
      <ScrollView style={styles.mobileCalendarContainer}>
        {/* Month/Year Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentMonth(newDate);
            }}
          >
            <MaterialIcons name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>

          <Text style={styles.monthYearText}>
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentMonth);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentMonth(newDate);
            }}
          >
            <MaterialIcons name="chevron-right" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeadersRow}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <View key={day} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGridMobile}>
          {monthDates.map((date, index) => {
            if (!date) {
              return (
                <View
                  key={index}
                  style={[styles.dateCell, styles.emptyDateCell]}
                />
              );
            }

            const dateBookings = getBookingsForDate(date);

            let dateStyle = {};
            let textStyle = {};

            if (dateBookings.length > 0) {
              const hasUpcoming = dateBookings.some((b) => !isPastBooking(b));

              if (hasUpcoming) {
                // 🟢 at least one upcoming appointment
                dateStyle = styles.bookedDateCell;
                textStyle = styles.bookedDateText;
              } else {
                // ⚫ all appointments expired
                dateStyle = styles.pastDateCell;
                textStyle = styles.pastDateText;
              }
            }

            const isToday = date.toDateString() === new Date().toDateString();

            if (isToday) {
              dateStyle = { ...dateStyle, ...styles.todayDateCell };
            }

            return (
              <TouchableOpacity
                key={index}
                style={[styles.dateCell, dateStyle]}
                disabled={dateBookings.length === 0}
                onPress={() => {
                  if (dateBookings.length > 0) {
                    setSelectedBooking(dateBookings);
                    setModalVisible(true);
                  }
                }}
              >
                <Text style={[styles.dateCellText, textStyle]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Appointments Count (selected date only) */}
        {selectedBooking && (
          <View style={styles.appointmentsCountContainer}>
            <Text style={styles.appointmentsCountText}>
              Appointments [{selectedBooking.length}]
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Overlay for Mobile */}
      {isMobileLike && sidebarOpen && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <View
          style={[
            styles.sidebarContainer,
            isMobileLike && styles.mobileSidebar,
          ]}
        >
          <NewestSidebar
            navigation={navigation}
            closeSidebar={() => setSidebarOpen(false)}
            activeItem="Calendar"
          />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Menu button for mobile */}
        {/* {isMobileLike && !sidebarOpen && ( */}
        {Platform.OS !== "web" && isMobileLike && !sidebarOpen && (
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <MaterialIcons name="menu" size={28} color="black" />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Calendar</Text>
            {!isMobileLike && (
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
            )}
          </View>

          {/* Mobile Tab Selector */}
          {isMobileLike && (
            <View style={styles.mobileTabContainer}>
              <TouchableOpacity
                style={[
                  styles.mobileTab,
                  selected === "Month" && styles.mobileTabActive,
                ]}
                onPress={() => setSelected("Month")}
              >
                <Text
                  style={[
                    styles.mobileTabText,
                    selected === "Month" && styles.mobileTabTextActive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search & Filters - Desktop Only */}
          {!isMobileLike && (
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
              </View>

              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>All Types</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>All Status</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.syncButton}>
                <Text style={styles.syncButtonText}>Sync Google Calendar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.newAppointmentButton}>
                <Text style={styles.newAppointmentText}>New Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Calendar Grid */}
        {isMobileLike ? (
          renderMobileCalendar()
        ) : (
          <ScrollView
            style={[styles.calendarGrid, { flex: 1 }]}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <View style={styles.daysHeaderRow}>
              <View style={styles.timeColumnHeader} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {currentWeek.map((day, index) => (
                  <View
                    key={index}
                    style={[styles.dayHeaderCell, { width: 180 }]}
                  >
                    <Text style={styles.dayName}>
                      {day.name} {day.date}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {TIME_SLOTS.map((time) => (
              <View key={time} style={styles.timeRow}>
                <View style={[styles.timeColumn, { width: 80 }]}>
                  <Text style={styles.timeSlotText}>{time}</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  {currentWeek.map((day, index) => (
                    <View
                      key={index}
                      style={[
                        styles.appointmentSlot,
                        { width: 180, minHeight: 100 },
                      ]}
                    >
                      {renderAppointment(day, time)}
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Mobile Modal */}

        {isMobileLike && modalVisible && Array.isArray(selectedBooking) && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Appointments</Text>

              <ScrollView>
                {selectedBooking.map((booking, index) => {
                  const isPast = isPastBooking(booking);

                  return (
                    <View
                      key={booking.id || index}
                      style={[
                        styles.appointmentCard,
                        isPast && styles.pastAppointmentCard,
                        { marginBottom: 12 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.appointmentName,
                          isPast && styles.pastAppointmentText,
                        ]}
                      >
                        {usersMap[booking.user_id] || "Patient"}
                      </Text>

                      <Text
                        style={[
                          styles.appointmentMeta,
                          isPast && styles.pastAppointmentText,
                        ]}
                      >
                        Date: {booking.date?.split("T")[0]}
                      </Text>

                      <Text
                        style={[
                          styles.appointmentMeta,
                          isPast && styles.pastAppointmentText,
                        ]}
                      >
                        Time: {booking.start_time}
                      </Text>

                      {!isPast && booking.meet_link && (
                        <TouchableOpacity
                          style={styles.joinButton}
                          onPress={() => joinCall(booking.meet_link)}
                        >
                          <Text style={styles.joinButtonText}>Join Call</Text>
                        </TouchableOpacity>
                      )}

                      {isPast && (
                        <Text style={styles.expiredText}>Expired</Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: Platform.OS === "web" ? "row" : "column",
  },

  sidebarContainer: {
    width: "13%",
    backgroundColor: "#f5f5f5",
    flexShrink: 0,
  },

  mobileSidebar: {
    position: "absolute",
    zIndex: 1001,
    width: "80%",
    height: "100%",
    left: 0,
    top: 0,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  menuButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    backgroundColor: "#FDF8F8",
    //paddingTop: 60,
    paddingTop: Platform.OS === "web" ? 24 : 60,
    paddingBottom: 16,
  },
  calendarHeader: {
    marginLeft: 24,
    marginRight: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
  },
  mobileTabContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 4,
  },
  mobileTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  mobileTabActive: {
    backgroundColor: "#FF6B6B",
  },
  mobileTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  mobileTabTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  controlsContainer: {
    marginLeft: 24,
    marginRight: 24,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#B0B6FF50",
    padding: 16,
    borderRadius: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderColor: "#B0B6FF",
    borderWidth: 1,
  },
  imagepic: {
    width: 16,
    height: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    marginLeft: 12,
    fontWeight: "300",
    outlineWidth: 0,
  },
  filterButton: {
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  newAppointmentText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  calendarGrid: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 24,
  },
  daysHeaderRow: {
    flexDirection: "row",
  },
  timeColumnHeader: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeaderCell: {
    width: 50,
    //alignItems: "center",
    alignItems: "flex-start",
  },
  dayName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
  },
  timeRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timeColumn: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  timeSlotContainer: {
    marginBottom: 0,
  },
  tabsContainer: {
    flexDirection: "row",
    marginLeft: 32,
    gap: 12,
  },
  tabButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
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
    fontSize: 16,
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
    minHeight: 100,
  },
  emptyAppointmentCard: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#B0B6FF",
    borderWidth: 1,
  },
  availableText: {
    color: "#999",
    fontSize: 14,
  },
  // Mobile Calendar Styles
  mobileCalendarContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  dayHeadersRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-evenly",
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  calendarGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dateCell: {
    width: "14%", // 7 days in a week
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  emptyDateCell: {
    backgroundColor: "#FAFAFA",
  },
  bookedDateCell: {
    backgroundColor: "#2ED573",
  },
  todayDateCell: {
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  dateCellText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  bookedDateText: {
    color: "#FFF",
    fontWeight: "700",
  },
  todayDateText: {
    fontWeight: "700",
  },
  appointmentsCountContainer: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  appointmentsCountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  modalBold: {
    fontWeight: "700",
    color: "#333",
  },
  joinButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  closeText: {
    fontWeight: "600",
    color: "#666",
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  pastDateCell: {
    backgroundColor: "#D3D3D3", // gray
  },
  pastDateText: {
    color: "#888",
    fontWeight: "500",
  },

  appointmentCard: {
    backgroundColor: "#FFECEC",
    padding: 10,
    borderRadius: 8,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },

  appointmentName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#000",
  },

  appointmentLabel: {
    fontWeight: "500",
    marginBottom: 4,
    color: "#000",
  },

  appointmentMeta: {
    fontSize: 13,
    color: "#000",
  },

  /* 🔴 Past appointment styles */
  pastAppointmentCard: {
    backgroundColor: "#E0E0E0",
    borderColor: "#B0B0B0",
  },

  pastAppointmentText: {
    color: "#888",
  },

  expiredText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#777",
  },
  webJoinButton: {
    marginTop: 8,
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  webJoinButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default DrCalendarView;
