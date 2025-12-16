import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar"; // Import the sidebar component

const AppointmentsView = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Sample appointment data - in a real app this would come from API
  const appointmentData = [
    {
      patientName: "Sarah Johson",
      dateTime: "9:00 AM, Mar 20",
      status: "Confirmed",
      statusColor: "#4cd964",
      appointmentType: "Regular Checkup",
      doctor: "Dr. Kislay",
    },
    {
      patientName: "Sarah Johson",
      dateTime: "9:00 AM, Mar 20",
      status: "Confirmed",
      statusColor: "#4cd964",
      appointmentType: "Regular Checkup",
      doctor: "Dr. Kislay",
    },
    {
      patientName: "Sarah Johson",
      dateTime: "9:00 AM, Mar 20",
      status: "Confirmed",
      statusColor: "#4cd964",
      appointmentType: "Regular Checkup",
      doctor: "Dr. Kislay",
    },
  ];

  // Function to simulate API data loading
  useEffect(() => {
    // This would be an API call in a real app
    console.log("Loading appointments data...");
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar for larger screens or when open */}
      {(width >= 900 || sidebarOpen) && (
        <View style={styles.sidebarContainer}>
          <NewestSidebar
            navigation={navigation}
            closeSidebar={toggleSidebar}
            activeItem="Appointments"
          />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Header with menu button for smaller screens */}
        {width < 900 && !sidebarOpen && (
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <MaterialIcons name="menu" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Appointments Header */}
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>Appointments</Text>
        </View>

        {/* Search and Filter Controls - All in one line */}
        <View style={styles.controlsContainer}>
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
            <Text style={styles.syncButtonText}>Sync Google Calender</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newAppointmentButton}
            onPress={() => navigation.navigate("BookAppointmentsView")}
          >
            <Text style={styles.newAppointmentText}>New Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Appointments Table */}
        <View style={styles.appointmentsTable}>
          {/* Table Header */}
          {/* <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Patient Name</Text>
            <Text style={styles.tableHeaderCell}>Date & Time</Text>
            <Text style={styles.tableHeaderCell}>Status</Text>
            <Text style={styles.tableHeaderCell}>Appointment Type</Text>
            <Text style={styles.tableHeaderCell}>Doctor Assigned</Text>
            <Text style={styles.tableHeaderCell}>Action</Text>
          </View> */}

          {/* Table Body */}
          {/* <ScrollView style={styles.tableBody}>
            {appointmentData.map((appointment, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{appointment.patientName}</Text>
                <Text style={styles.tableCell}>{appointment.dateTime}</Text>
                <View style={styles.statusCell}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{appointment.status}</Text>
                  </View>
                </View>
                <Text style={styles.tableCell}>
                  {appointment.appointmentType}
                </Text>
                <Text style={styles.tableCell}>{appointment.doctor}</Text>
                <View style={styles.actionCell}>
                  <TouchableOpacity style={styles.rescheduleButton}>
                    <MaterialIcons name="edit" size={16} color="white" />
                    <Text style={styles.rescheduleText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView> */}
          <Text style={styles.noDataText}>No Schedule for now</Text>
        </View>
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
    width: "15%", // Matched percentage from original code
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
    backgroundColor: "#FDF8F8", // Light background matching design
    padding: "1.5%", // Using percentage for responsiveness
  },
  menuButton: {
    position: "absolute",
    top: "2%",
    left: "2%",
    zIndex: 10,
  },
  appointmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2%",
    paddingHorizontal: "1%",
  },
  appointmentsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  controlsContainer: {
    backgroundColor: "#f0f2ff",
    borderRadius: 12,
    marginBottom: "2%",
    padding: "1.5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "25%",
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
  appointmentsTable: {
    flex: 1,
    backgroundColor: "#B0B6FF40",
    borderRadius: 12,
    padding: "1.5%",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: "1.5%",
    paddingHorizontal: "1%",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: "1.5%",
    paddingHorizontal: "1%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  statusCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    backgroundColor: "#4cd964", // Green for confirmed status
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionCell: {
    flex: 1,
    alignItems: "flex-start",
  },
  rescheduleButton: {
    backgroundColor: "#ff6347",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rescheduleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  noDataText:{
    alignSelf:"center",
    marginVertical:"10%",
    fontSize:20,
    fontWeight:600
  }
});

export default AppointmentsView;
