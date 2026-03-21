"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import DateTimePicker from "@react-native-community/datetimepicker";

const BookAppointmentScreen = ({ navigation }) => {
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startTimeAmPm, setStartTimeAmPm] = useState("AM");
  const [endTimeAmPm, setEndTimeAmPm] = useState("AM");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  // Gender options
  const genderOptions = ["Male", "Female", "Other"];

  // Appointment type options
  const appointmentTypes = [
    "Regular Checkup",
    "Follow-up",
    "Emergency",
    "Consultation",
  ];

  const handleSaveAppointment = () => {
    // Implement save logic here
    console.log("Saving appointment...");
    // You would typically make an API call here
  };

  const handleCancel = () => {
    // Reset form or navigate back
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      console.log("Navigation not available");
    }
  };

  const selectPriority = (value) => {
    setPriority(value);
  };

  const toggleAmPm = (timeType) => {
    if (timeType === "start") {
      setStartTimeAmPm(startTimeAmPm === "AM" ? "PM" : "AM");
    } else {
      setEndTimeAmPm(endTimeAmPm === "AM" ? "PM" : "AM");
    }
  };

  // Placeholder for dropdown arrow image
  const dropdownArrow = {
    uri: "https://cdn-icons-png.flaticon.com/512/60/60995.png",
  };

  return (
    <View style={styles.webContainer}>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <NewestSidebar navigation={navigation || {}} />
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>Book an Appointment</Text>

          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.formBackground}>
              {/* The first row */}
              <View style={styles.formRow}>
                {/* Patient Name */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Patient Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Patient X"
                    value={patientName}
                    onChangeText={setPatientName}
                  />
                </View>

                {/* Patient Age */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Patient Age</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Patient X"
                    value={patientAge}
                    onChangeText={setPatientAge}
                    keyboardType="numeric"
                  />
                </View>

                {/* Patient Gender - Using select/option approach */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Patient Gender</Text>
                  <View style={styles.selectContainer}>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      style={styles.selectInput}
                      className="gender-select"
                    >
                      {genderOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <View style={styles.selectArrow}>
                      <Image
                        source={dropdownArrow}
                        style={styles.dropdownIcon}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* The second row */}
              <View style={styles.formRow}>
                {/* Email */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Patient X"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>

                {/* Contact Number */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Contact Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Patient X"
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Appointment Type - Using select/option approach */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Appointment Type</Text>
                  <View style={styles.selectContainer}>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value)}
                      style={styles.selectInput}
                      className="appointment-select"
                    >
                      {/* <option value="" disabled>
                        Patient X
                      </option> */}
                      {appointmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <View style={styles.selectArrow}>
                      <Image
                        source={dropdownArrow}
                        style={styles.dropdownIcon}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* The third row */}
              <View style={styles.formRow}>
                {/* Date */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      height: 40,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: "rgb(255, 255, 255)",
                      borderRadius: 5,
                      fontSize: 16,
                      color: "#000000",
                    }}
                  />
                </View>

                {/* Time - Completely rebuilt to match the image exactly */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <View style={styles.timeContainer}>
                    {/* First time input with AM/PM */}
                    <div style={styles.webTimeWrapper}>
                      <input
                        type="text"
                        placeholder="00:00"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={styles.webTimeInput}
                      />
                      <button
                        onClick={() => toggleAmPm("start")}
                        style={styles.webAmPmToggle}
                      >
                        {startTimeAmPm}
                      </button>
                    </div>

                    {/* Second time input with AM/PM */}
                    <div style={styles.webTimeWrapper}>
                      <input
                        type="text"
                        placeholder="00:00"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={styles.webTimeInput}
                      />
                      <button
                        onClick={() => toggleAmPm("end")}
                        style={styles.webAmPmToggle}
                      >
                        {endTimeAmPm}
                      </button>
                    </div>
                  </View>
                </View>

                {/* Priority */}
                <View style={styles.formColumn}>
                  <Text style={styles.fieldLabel}>Priority</Text>
                  <View style={styles.priorityButtonsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        priority === "Low" && styles.priorityButtonLowActive,
                      ]}
                      onPress={() => selectPriority("Low")}
                    >
                      <Text style={styles.priorityButtonText}>Low</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        priority === "Medium" &&
                          styles.priorityButtonMediumActive,
                      ]}
                      onPress={() => selectPriority("Medium")}
                    >
                      <Text style={styles.priorityButtonText}>Medium</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        priority === "High" && styles.priorityButtonHighActive,
                      ]}
                      onPress={() => selectPriority("High")}
                    >
                      <Text style={styles.priorityButtonText}>High</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.fieldLabel}>Add Description</Text>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder=""
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveAppointment}
                >
                  <Text style={styles.saveButtonText}>Save Appointment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    padding: "2%",
    maxWidth: "85%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: "1.5%",
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    ...(Platform.OS === "web" ? { minHeight: "90%" } : {}),
  },
  formBackground: {
    backgroundColor: "rgba(176, 182, 255, 0.25)",
    borderRadius: 12,
    padding: "2.5%",
    ...(Platform.OS === "web" ? { maxWidth: "95%", maxHeight: "80vh" } : {}), // Limiting size
  },
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "1.5%",
  },
  formColumn: {
    width: "31%",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: "70%",
    paddingHorizontal: "5%",
    width: "100%",
    fontSize: 14,
  },

  selectContainer: {
    position: "relative",
    width: "100%",
    height: 40,
  },
  selectInput: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 10,
    paddingRight: 25,
    appearance: "none",
    fontSize: 14,
    color: "#333",
  },
  selectArrow: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -5 }],
    pointerEvents: "none",
  },
  dropdownIcon: {
    width: 8,
    height: 8,
    resizeMode: "contain",
  },

  timeContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  webTimeWrapper: {
    display: "flex",
    width: "48%",
    height: "190%",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
    overflow: "hidden",
  },

  webTimeInput: {
    flex: 1,
    width: "70%",
    height: "100%",
    padding: "10px",
    fontSize: 14,
    color: "#333",
    border: "none",
    //outline: "none",
    float: "left",
    boxSizing: "border-box",
  },

  webAmPmToggle: {
    width: "30%",
    height: "100%",
    backgroundColor: "#F8F8F8",
    fontSize: 12,
    fontWeight: 500,
    color: "#333",
    border: "none",
    //borderLeft: "1px solid #E0E0E0",
    borderLeftWidth: 1,
    borderLeftColor: "#E0E0E0",
    //outline: "none",
    cursor: "pointer",
    float: "right",
    padding: 0,
  },
  priorityButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    marginTop: "2.2%",
    borderRadius: 5,
    flex: 1,
    height: "130%",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: "1%",
  },
  priorityButtonText: {
    fontSize: 12,
    color: "#333",
  },
  priorityButtonLowActive: {
    backgroundColor: "#AED581",
    borderColor: "#AED581",
  },
  priorityButtonMediumActive: {
    backgroundColor: "#FFB74D",
    borderColor: "#FFB74D",
  },
  priorityButtonHighActive: {
    backgroundColor: "#FF8A80",
    borderColor: "#FF8A80",
  },
  descriptionContainer: {
    width: "60%",
    marginBottom: "1.5%",
  },
  descriptionInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: "100%",
    paddingHorizontal: "1%",
    paddingTop: "2%",
    textAlignVertical: "top",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",

    marginTop: "1.5%",
  },
  saveButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 5,
    paddingVertical: "1%",
    paddingHorizontal: "2%",
    minWidth: "20%",
    alignItems: "center",
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    marginLeft: "1%",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingVertical: "1%",
    paddingHorizontal: "2%",
    width: "20%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
});

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .gender-select, .appointment-select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      background-color: white;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
      padding: 0 10px;
      font-size: 14px;
      height: 40px;
      width: 100%;
      color: #333;
    }
    
    .gender-select:focus, .appointment-select:focus {
      border-color: #FF6B6B;
    }
  `;
  document.head.appendChild(style);
}

export default BookAppointmentScreen;
