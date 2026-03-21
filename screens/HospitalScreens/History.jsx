import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import BackButton from "../../components/PatientScreenComponents/BackButton";
// import axios from "axios" // Uncomment when integrating API

const HistoryScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [originalAppointments, setOriginalAppointments] = useState([]);

  useEffect(() => {
    // Static data for now
    const staticData = [
      {
        id: "1",
        date: "Mon,20 Mar 2025",
        time: "09:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        isChecked: false,
      },
      {
        id: "2",
        date: "Mon,20 Mar 2025",
        time: "09:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        isChecked: false,
      },
      {
        id: "3",
        date: "Mon,20 Mar 2025",
        time: "09:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        isChecked: false,
      },
      {
        id: "4",
        date: "Sun,19 Mar 2025",
        time: "09:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        isChecked: false,
      },
      {
        id: "5",
        date: "Sun,19 Mar 2025",
        time: "09:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        isChecked: false,
      },
      {
        id: "6",
        date: "Sun,19 Mar 2025",
        time: "09:00 AM",
        patientName: "Sarah Johnson",
        appointmentType: "Regular Checkup",
        isChecked: false,
      },
    ];
    setOriginalAppointments(staticData);
    setAppointments(staticData);

    // Uncomment below when integrating with your backend API (DynamoDB via Lambda)
    /*
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("https://your-api-url.com/appointments")
        const dataWithCheck = response.data.map((item) => ({ ...item, isChecked: false }))
        setAppointments(dataWithCheck)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    fetchAppointments()
    */
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = originalAppointments.filter((item) =>
      item.patientName.toLowerCase().includes(text.toLowerCase())
    );
    setAppointments(filtered);
  };

  const toggleCheckbox = (id) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const markAllRead = () => {
    setAppointments((prev) =>
      prev.map((item) => ({ ...item, isChecked: true }))
    );
  };

  const clearAll = () => {
    setAppointments((prev) =>
      prev.map((item) => ({ ...item, isChecked: false }))
    );
  };

  const groupedAppointments = appointments.reduce((acc, appointment) => {
    if (!acc[appointment.date]) {
      acc[appointment.date] = [];
    }
    acc[appointment.date].push(appointment);
    return acc;
  }, {});

  const renderAppointmentItem = (item) => (
    <View style={styles.appointmentItem} key={item.id}>
      <TouchableOpacity
        style={[styles.checkbox, item.isChecked && styles.checkboxChecked]}
        onPress={() => toggleCheckbox(item.id)}
      >
        {item.isChecked && <View style={styles.checkboxInner} />}
      </TouchableOpacity>
      <Text style={styles.appointmentTime}>{item.time}</Text>
      <Text style={styles.appointmentPatient}>{item.patientName}</Text>
      <Text style={styles.appointmentType}>{item.appointmentType}</Text>
    </View>
  );

  return (
    <View style={styles.webContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <NewestSidebar navigation={navigation} />
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>History</Text>
          

          <View style={styles.filterContainer}>
            <View style={styles.searchContainer}>
              <Image
                source={require("../../assets/Icons/search.png")}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search History"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>By Date</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>By time</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={markAllRead}
              >
                <Text style={styles.markAllButtonText}>Mark All Read</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
            
          </View>
          <BackButton />

          {/* <ScrollView style={styles.appointmentsContainer}>
            {Object.entries(groupedAppointments).map(
              ([date, dateAppointments]) => (
                <View key={date} style={styles.dateGroup}>
                  <Text style={styles.dateHeader}>{date}</Text>
                  <View style={styles.appointmentsList}>
                    {dateAppointments.map((appointment) =>
                      renderAppointmentItem(appointment)
                    )}
                  </View>
                </View>
              )
            )}
          </ScrollView> */}
          <Text style={styles.noDataText}>No Schedule for now</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    height: "100%",
    width: "100%",
  },
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(251, 245, 246, 1)",
  },
  contentContainer: {
    width: "15%",
  },
  mainContent: {
    flex: 1,
    padding: "2.5%",
    // marginLeft:"1%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: "1%",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "rgba(176, 182, 255, 0.25)",
    padding: "2%",
    borderRadius: 16,
    marginBottom: "1%",
    //height: "auto",
    rowGap: "5%",
    columnGap: "1%",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(176, 182, 255, 1)",
    paddingHorizontal: "1.5%",
    marginRight: "1%",
    flexGrow: 1,
    width: "25%",
    minWidth: "20%",
    maxWidth: "30%",
  },

  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    resizeMode: "contain",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    outlineStyle: "none",
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(176, 182, 255, 1)",
    flexShrink: 0,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginLeft: "auto",
  },
  markAllButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(176, 182, 255, 1)",
  },
  markAllButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  clearButton: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#333",
    textDecorationLine: "underline",
  },
  appointmentsContainer: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: "2%",
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: "1%",
  },
  appointmentsList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: "1%",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginRight: "1.5%",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FF6B6B",
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  appointmentTime: {
    width: "7%",
    fontSize: 14,
    color: "#666",
    marginLeft: "1.5%",
  },
  appointmentPatient: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  appointmentType: {
    fontSize: 14,
    color: "#666",
    marginRight: "70%",
  },
  noDataText:{
    alignSelf:"center",
    marginVertical:"10%",
    fontSize:20,
    fontWeight:600
  }
});

export default HistoryScreen;
