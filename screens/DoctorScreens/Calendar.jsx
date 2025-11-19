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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";

const Calendar = ({ navigation }) => {
  const [viewMode, setViewMode] = useState("Week"); // Set default to Week view
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentWeek, setCurrentWeek] = useState(generateWeekDates());
  const [appointmentData, setAppointmentData] = useState({});
  const horizontalScrollRef = useRef(null);

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
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        shortName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        date: date.getDate(),
        fullDate: date
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
      weekDays[0]  // Sun
    ];
  }

  // Custom predefined appointment data that matches the design
  const generatePredefinedAppointments = () => {
    // Create a base structure with all time slots and days
    const timeSlots = ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Initialize empty appointment data
    const appointmentsData = {};
    days.forEach(day => {
      appointmentsData[day] = {};
      timeSlots.forEach(time => {
        appointmentsData[day][time] = { 
          hasAppointment: false, 
          data: null 
        };
      });
    });
    
    // Set specific appointments according to design
    // Monday 9:00 AM
    appointmentsData["Monday"]["9:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "9:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Monday 11:00 AM
    appointmentsData["Monday"]["11:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "11:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Monday 1:00 PM
    appointmentsData["Monday"]["1:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "1:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Monday 3:00 PM
    appointmentsData["Monday"]["3:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "3:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Monday 5:00 PM
    appointmentsData["Monday"]["5:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "5:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };

    // Wednesday 9:00 AM (Emergency)
    appointmentsData["Wednesday"]["9:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "9:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Acute Pain",
        status: "Emergency",
        statusColor: "#ff3b30",
      }
    };
    
    // Wednesday 11:00 AM
    appointmentsData["Wednesday"]["11:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "11:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };

    // Wednesday 3:00 PM
    appointmentsData["Wednesday"]["3:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "3:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Thursday 11:00 AM
    appointmentsData["Thursday"]["11:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "11:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Friday 9:00 AM (Follow up)
    appointmentsData["Friday"]["9:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "9:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Post Surgery",
        status: "Follow Up",
        statusColor: "#ffcc00",
      }
    };
    
    // Friday 11:00 AM
    appointmentsData["Friday"]["11:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "11:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Friday 1:00 PM
    appointmentsData["Friday"]["1:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "1:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Friday 3:00 PM
    appointmentsData["Friday"]["3:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "3:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Friday 5:00 PM
    appointmentsData["Friday"]["5:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "5:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Saturday 11:00 AM
    appointmentsData["Saturday"]["11:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "11:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Saturday 1:00 PM
    appointmentsData["Saturday"]["1:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "1:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Saturday 3:00 PM
    appointmentsData["Saturday"]["3:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "3:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Saturday 5:00 PM
    appointmentsData["Saturday"]["5:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "5:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Sunday 11:00 AM
    appointmentsData["Sunday"]["11:00 AM"] = {
      hasAppointment: true,
      data: {
        time: "11:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Sunday 1:00 PM
    appointmentsData["Sunday"]["1:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "1:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Sunday 3:00 PM
    appointmentsData["Sunday"]["3:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "3:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    // Sunday 5:00 PM
    appointmentsData["Sunday"]["5:00 PM"] = {
      hasAppointment: true,
      data: {
        time: "5:00 PM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    return appointmentsData;
  };

  useEffect(() => {
    // Set predefined appointment data
    setAppointmentData(generatePredefinedAppointments());
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddAppointment = (day, timeSlot) => {
    // Function to add a new appointment to a specific day and time slot
    console.log(`Adding appointment on ${day} at ${timeSlot}`);
    
    // Here you would typically open a modal or navigate to a form screen
    // For this example, we'll just add a default appointment
    const dayName = day.name === 'Mon' ? 'Monday' : 
                   day.name === 'Tue' ? 'Tuesday' : 
                   day.name === 'Wed' ? 'Wednesday' : 
                   day.name === 'Thu' ? 'Thursday' : 
                   day.name === 'Fri' ? 'Friday' : 
                   day.name === 'Sat' ? 'Saturday' : 'Sunday';
    
    const newAppointmentData = { ...appointmentData };
    
    newAppointmentData[dayName][timeSlot] = {
      hasAppointment: true,
      data: {
        time: timeSlot,
        patientName: "New Patient",
        appointmentType: "Regular Checkup",
        status: "Confirmed",
        statusColor: "#4cd964",
      }
    };
    
    setAppointmentData(newAppointmentData);
  };

  const renderTimeSlot = (time) => {
    return (
      <View style={styles.timeSlotContainer}>
        <Text style={styles.timeSlotText}>{time}</Text>
      </View>
    );
  };

  const renderAppointment = (day, timeSlot) => {
    const dayName = day.name === 'Mon' ? 'Monday' : 
                   day.name === 'Tue' ? 'Tuesday' : 
                   day.name === 'Wed' ? 'Wednesday' : 
                   day.name === 'Thu' ? 'Thursday' : 
                   day.name === 'Fri' ? 'Friday' : 
                   day.name === 'Sat' ? 'Saturday' : 'Sunday';
    
    const slotData = appointmentData[dayName] && appointmentData[dayName][timeSlot];
    
    if (!slotData || !slotData.hasAppointment) {
      return (
        <TouchableOpacity 
          style={styles.emptyAppointmentCard}
          onPress={() => handleAddAppointment(day, timeSlot)}
        >
          <Text style={styles.availableText}>Available</Text>
        </TouchableOpacity>
      );
    }

    const appointment = slotData.data;
    let cardStyle;
    
    if (appointment.status === "Confirmed") {
      cardStyle = styles.confirmedCard;
    } else if (appointment.status === "Emergency") {
      cardStyle = styles.emergencyCard;
    } else if (appointment.status === "Follow Up") {
      cardStyle = styles.followUpCard;
    } else {
      cardStyle = styles.confirmedCard; // Default style
    }
    
    return (
      <View style={[styles.appointmentCard, cardStyle]}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {appointment.time.replace('AM', '').replace('PM', '')}
            <Text style={styles.amPmText}>
              {appointment.time.includes('AM') ? 'AM' : 'PM'}
            </Text>
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: appointment.statusColor },
            ]}
          >
            <Text style={styles.statusText}>{appointment.status}</Text>
          </View>
        </View>

        <View style={styles.patientContainer}>
          <Text style={styles.patientName}>{appointment.patientName}</Text>
          <Text style={styles.appointmentType}>
            {appointment.appointmentType}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sidebar for larger screens or when open */}
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
        {/* Header with menu button for smaller screens */}
        {!sidebarOpen && (
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <MaterialIcons name="menu" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>Calendar</Text>

          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "Day" && styles.activeViewToggle,
              ]}
              onPress={() => setViewMode("Day")}
            >
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "Day" && styles.activeViewToggleText,
                ]}
              >
                Day
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "Week" && styles.activeViewToggle,
              ]}
              onPress={() => setViewMode("Week")}
            >
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "Week" && styles.activeViewToggleText,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "Month" && styles.activeViewToggle,
              ]}
              onPress={() => setViewMode("Month")}
            >
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "Month" && styles.activeViewToggleText,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search and Filter Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.filterButtonsContainer}>
            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Appointment"
                value={searchText}
                onChangeText={setSearchText}
              />
              <MaterialIcons name="filter-list" size={20} color="#ff6347" />
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
        </View>

        {/* Calendar Grid with Horizontal Scrolling */}
        <ScrollView style={styles.calendarGrid}>
          {/* Day headers with dates */}
          <View style={styles.daysHeaderRow}>
            <View style={styles.timeColumnHeader}>
              {/* Empty corner cell */}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={horizontalScrollRef}>
              {currentWeek.map((day, index) => (
                <View key={index} style={styles.dayHeaderCell}>
                  <Text style={styles.dayName}>{day.name} {day.date}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Time slots and appointments */}
          <ScrollView>
            {/* 9:00 AM Row */}
            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>
                {renderTimeSlot("9:00AM")}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} 
                onScroll={(e) => {
                  if (horizontalScrollRef.current) {
                    horizontalScrollRef.current.scrollTo({ 
                      x: e.nativeEvent.contentOffset.x, 
                      animated: false 
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
              <View style={styles.timeColumn}>
                {renderTimeSlot("11:00AM")}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  if (horizontalScrollRef.current) {
                    horizontalScrollRef.current.scrollTo({ 
                      x: e.nativeEvent.contentOffset.x, 
                      animated: false 
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
              <View style={styles.timeColumn}>
                {renderTimeSlot("01:00PM")}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  if (horizontalScrollRef.current) {
                    horizontalScrollRef.current.scrollTo({ 
                      x: e.nativeEvent.contentOffset.x, 
                      animated: false 
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
              <View style={styles.timeColumn}>
                {renderTimeSlot("03:00PM")}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  if (horizontalScrollRef.current) {
                    horizontalScrollRef.current.scrollTo({ 
                      x: e.nativeEvent.contentOffset.x, 
                      animated: false 
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
              <View style={styles.timeColumn}>
                {renderTimeSlot("05:00PM")}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  if (horizontalScrollRef.current) {
                    horizontalScrollRef.current.scrollTo({ 
                      x: e.nativeEvent.contentOffset.x, 
                      animated: false 
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
    backgroundColor: "#fff",
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
    backgroundColor: "#FDF8F8", // Lighter background to match design
    padding: "1.5%", // Using percentage for responsiveness
  },
  menuButton: {
    position: "absolute",
    top: "2%",
    left: "2%",
    zIndex: 10,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2%",
    paddingHorizontal: "1%",
  },
  calendarTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  viewToggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  viewToggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  activeViewToggle: {
    backgroundColor: "#ff6347",
  },
  viewToggleText: {
    fontSize: 16,
    color: "#333",
  },
  activeViewToggleText: {
    color: "#fff",
  },
  controlsContainer: {
    backgroundColor: "#f0f2ff",
    padding: "1.5%",
    borderRadius: 12,
    marginBottom: "2%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    minWidth: 150,
  },
  filterButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  filterButtonText: {
    color: "#333",
    fontSize: 14,
  },
  syncButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  syncButtonText: {
    color: "#333",
    fontSize: 14,
  },
  newAppointmentButton: {
    backgroundColor: "#ff6347",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  newAppointmentText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  calendarGrid: {
    flex: 1,
    backgroundColor: "#f0f2ff",
    borderRadius: 12,
  },
  daysHeaderRow: {
    flexDirection: "row",
    marginBottom: "1%",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  timeColumnHeader: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeaderCell: {
    width: 180,
    alignItems: "center",
    paddingVertical: "1%",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
    paddingVertical: "5%",
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  appointmentSlot: {
    width: 180,
    padding: 4,
  },
  appointmentCard: {
    width: "100%",
    padding: "5%",
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 100,
  },
  emptyAppointmentCard: {
    width: "100%",
    padding: "5%",
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 100,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmedCard: {
    backgroundColor: "#e6ffed",
  },
  emergencyCard: {
    backgroundColor: "#ffebe6",
  },
  followUpCard: {
    backgroundColor: "#fff9e6",
  },
  availableText: {
    color: "#999",
    fontSize: 14,
  },
  timeContainer: {
    marginBottom: "5%",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  amPmText: {
    fontSize: 12,
    color: "#666",
  },
  statusContainer: {
    marginBottom: "5%",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  patientContainer: {
    marginTop: "2%",
  },
  patientName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  appointmentType: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});

export default Calendar;