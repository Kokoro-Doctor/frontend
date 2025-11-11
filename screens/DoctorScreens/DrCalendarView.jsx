import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewestSidebarDr from "../../components/DoctorsPortalComponents/NewestSidebarDr";

const DrCalendarView = ({ navigation }) => {
  const [viewMode, setViewMode] = useState("Week"); // Set default to Week view
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentWeek, setCurrentWeek] = useState(generateWeekDates());
  const [appointmentData, setAppointmentData] = useState({});
  const horizontalScrollRef = useRef(null);
  const [selected, setSelected] = useState("Day");
  const tabs = ["Day", "Week", "Month"];

  // Generate current week dates
  function generateWeekDates() {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Adjust to make Monday the first day (if day is 0/Sunday, go back 6 days)
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDays.push({
        name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
        shortName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          date.getDay()
        ],
        date: date.getDate(),
        fullDate: date,
      });
    }

    // Reorder to have Monday first
    return [
      weekDays[1], // Mon
      weekDays[2], // Tue
      weekDays[3], // Wed
      weekDays[4], // Thu
      weekDays[5], // Fri
      weekDays[6], // Sat
      weekDays[0], // Sun
    ];
  }

  // Custom predefined appointment data that matches the design
  const generatePredefinedAppointments = () => {
    // Create a base structure with all time slots and days
    const timeSlots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Initialize empty appointment data
    const appointmentsData = {};
    days.forEach((day) => {
      appointmentsData[day] = {};
      timeSlots.forEach((time) => {
        appointmentsData[day][time] = {
          hasAppointment: false,
          data: null,
        };
      });
    });

    
    return appointmentsData;
  };

  useEffect(() => {
    // Set predefined appointment data
    setAppointmentData(generatePredefinedAppointments());
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

 

  const renderTimeSlot = (time) => {
    return (
      <View style={styles.timeSlotContainer}>
        <Text style={styles.timeSlotText}>{time}</Text>
      </View>
    );
  };

  const renderAppointment = (day, timeSlot) => {
    const dayName =
      day.name === "Mon"
        ? "Monday"
        : day.name === "Tue"
        ? "Tuesday"
        : day.name === "Wed"
        ? "Wednesday"
        : day.name === "Thu"
        ? "Thursday"
        : day.name === "Fri"
        ? "Friday"
        : day.name === "Sat"
        ? "Saturday"
        : "Sunday";

    const slotData =
      appointmentData[dayName] && appointmentData[dayName][timeSlot];

    if (!slotData || !slotData.hasAppointment) {
      return (
        <TouchableOpacity style={styles.emptyAppointmentCard}>
          <Text style={styles.availableText}>Available</Text>
        </TouchableOpacity>
      );
    }

    const appointment = slotData.data;
    let cardStyle;

   
   
  };

  return (
    <View style={styles.container}>
      {/* Sidebar for larger screens or when open */}
      {sidebarOpen && (
        <View style={styles.sidebarContainer}>
          <NewestSidebarDr
            navigation={navigation}
            closeSidebar={toggleSidebar}
            activeItem="Calendar"
          />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Header with menu button for smaller screens */}
        {!sidebarOpen && (
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <MaterialIcons name="menu" size={24} color="black" />
          </TouchableOpacity>
        )}

      <View style={{ backgroundColor:"#FDF8F8",paddingTop:"2%", }}>
        {/* Calendar Header */}
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

        {/* Search and Filter Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.searchContainer}>
            <Image
              source={require("../../assets/Icons/SearchIcon2.png")}
              style={styles.imagepic}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Search Appointment"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Image
              source={require("../../assets/Icons/searchFilter2.png")}
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

        {/* Calendar Grid with Horizontal Scrolling */}
        <ScrollView style={styles.calendarGrid}>
          <View style={styles.maintextBox}>
            <Text style={styles.mainText}>No Schedule for now</Text>
          </View>
          {/* Day headers with dates */}
          <View style={styles.daysHeaderRow}>
            <View style={styles.timeColumnHeader}>
              {/* Empty corner cell */}
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

          {/* Time slots and appointments */}
          <ScrollView>
            {/* 9:00 AM Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>{renderTimeSlot("9:00AM")}</View>
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
                    {renderAppointment(day, "9:00 AM")}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 11:00 AM Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>{renderTimeSlot("11:00AM")}</View>
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
                    {renderAppointment(day, "11:00 AM")}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 1:00 PM Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>{renderTimeSlot("01:00PM")}</View>
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
                    {renderAppointment(day, "1:00 PM")}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 3:00 PM Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>{renderTimeSlot("03:00PM")}</View>
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
                    {renderAppointment(day, "3:00 PM")}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 5:00 PM Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>{renderTimeSlot("05:00PM")}</View>
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
                    {renderAppointment(day, "5:00 PM")}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
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
    backgroundColor:"#ffffff",
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
