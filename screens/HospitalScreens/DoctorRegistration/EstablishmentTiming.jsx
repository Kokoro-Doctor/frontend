import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";

import NewSideNav from "../../../components/DoctorsPortalComponents/NewSideNav";
import SideImageStyle from "../../../components/DoctorsPortalComponents/SideImageStyle";
import Header from "../../../components/PatientScreenComponents/Header";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const EstablishmentTiming = ({ navigation }) => {
  const { width } = Dimensions.get("window");

  const [fromTime, setFromTime] = useState("");
  const [fromPeriod, setFromPeriod] = useState("AM");
  const [toTime, setToTime] = useState("");
  const [toPeriod, setToPeriod] = useState("AM");
  const [sessionsByDay, setSessionsByDay] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  });
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [fees, setFees] = useState("");

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const defaultSessions = ["11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM"];

  const handleAddSession = () => {
    const sessionLabel = `${fromTime} ${fromPeriod}`.trim();
    if (!fromTime || !toTime) {
      alert("Please enter both From and To times");
      return;
    }
    const currentSessions = sessionsByDay[selectedDayIndex] || [];
    if (currentSessions.includes(sessionLabel)) {
      alert("This session is already added");
      return;
    }
    const updatedSessions = {
      ...sessionsByDay,
      [selectedDayIndex]: [...currentSessions, sessionLabel],
    };
    setSessionsByDay(updatedSessions);
    setFromTime("");
    setToTime("");
    setFromPeriod("AM");
    setToPeriod("AM");
  };

  const handleFromTimeChange = (text) => setFromTime(text);
  const handleToTimeChange = (text) => setToTime(text);
  const toggleFromPeriod = () =>
    setFromPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
  const toggleToPeriod = () =>
    setToPeriod((prev) => (prev === "AM" ? "PM" : "AM"));

  useFocusEffect(
    React.useCallback(() => {
      setSessionsByDay({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
      setFromTime("");
      setToTime("");
      setFromPeriod("AM");
      setToPeriod("AM");
      setSelectedDayIndex(0);
    }, [])
  );

  if (Platform.OS === "web" && width >= 1000) {
    return (
      <View style={styles.container}>
        <NewSideNav />

        <View style={styles.rightSection}>
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.heading}>Establishment Timings</Text>

            <Text style={styles.label}>Days</Text>
            <View style={styles.dayRow}>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    selectedDayIndex === index && styles.dayButtonSelected,
                  ]}
                  onPress={() => setSelectedDayIndex(index)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDayIndex === index &&
                        styles.dayButtonTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Default Session</Text>
            <View style={styles.sessionRow}>
              {defaultSessions.map((time, idx) => (
                <View key={idx} style={styles.sessionBox}>
                  <Text style={styles.sessionText}>{time}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.label}>Default Fees</Text>
            <View
              style={{
                backgroundColor: "#fff",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 6,
                borderWidth: 0.5,
                borderColor: "#ccc",
                marginBottom: 20,
                width: "8%",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#000" }}>
                ₹ 1999
              </Text>
            </View>

            <View style={styles.noteRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#007BFF"
              />
              <Text style={styles.noteText}>
                All the default settings can be changed after onboarding
              </Text>
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => navigation.navigate("DoctorCongrats")}
            >
              <Text style={styles.continueText}>Continue</Text>
              <View style={styles.iconCon}>
                <Ionicons name="arrow-forward" size={20} color="red" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => navigation.navigate("DoctorCongrats")}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.SideImageStyles}>
            <SideImageStyle />
          </View>
        </View>
      </View>
    );
  } else if (Platform.OS !== "web" || width < 1000) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FCF5F7" }}>
        <Header navigation={navigation} isDoctorPortal={true} />

        <ScrollView contentContainerStyle={mobileStyles.content}>
          <View style={mobileStyles.header}>
            <View style={mobileStyles.makecolumn}>
              <Text style={mobileStyles.headerTitle}>Hang On!</Text>
              <Text style={mobileStyles.headerSubtitle}>Establishment</Text>
              <Text style={mobileStyles.headerSubtitle}>timing</Text>
            </View>

            <Image
              style={mobileStyles.image}
              source={require("../../../assets/Images/Calender_bro1.png")}
            />
          </View>

          <Text style={mobileStyles.label}>Choose Days</Text>
          <View style={mobileStyles.dayRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"].map(
              (day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    mobileStyles.dayButton,
                    selectedDayIndex === index &&
                      mobileStyles.dayButtonSelected,
                  ]}
                  onPress={() => setSelectedDayIndex(index)}
                >
                  <Text
                    style={[
                      mobileStyles.dayText,
                      selectedDayIndex === index &&
                        mobileStyles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <Text style={mobileStyles.label}>Choose Session</Text>
          <View style={mobileStyles.sessionRow}>
            <View style={mobileStyles.sessionColumn}>
              <Text style={mobileStyles.smallLabel}>From</Text>
              <View style={mobileStyles.inputWithSelector}>
                <TextInput
                  value={fromTime}
                  onChangeText={handleFromTimeChange}
                  placeholder="10:00"
                  placeholderTextColor="#aaa"
                  style={mobileStyles.inputField}
                />
                <TouchableOpacity
                  style={mobileStyles.selectorBox}
                  onPress={toggleFromPeriod}
                >
                  <Text style={mobileStyles.selectorText}>{fromPeriod}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={mobileStyles.sessionColumn}>
              <Text style={mobileStyles.smallLabel}>To</Text>
              <View style={mobileStyles.inputWithSelector}>
                <TextInput
                  value={toTime}
                  onChangeText={handleToTimeChange}
                  placeholder="11:00"
                  placeholderTextColor="#aaa"
                  style={mobileStyles.inputField}
                />
                <TouchableOpacity
                  style={mobileStyles.selectorBox}
                  onPress={toggleToPeriod}
                >
                  <Text style={mobileStyles.selectorText}>{toPeriod}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={mobileStyles.addButton}
              onPress={handleAddSession}
            >
              <Text style={mobileStyles.addText}>Add</Text>
            </TouchableOpacity>
          </View>

          {(sessionsByDay[selectedDayIndex] || []).length > 0 && (
            <>
              <Text style={mobileStyles.smallLabel}>Sessions Added</Text>
              <View style={mobileStyles.sessionsContainer}>
                {sessionsByDay[selectedDayIndex].map((session, index) => (
                  <View key={index} style={mobileStyles.sessionTag}>
                    <Text style={mobileStyles.sessionText}>{session}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={mobileStyles.label}>Subscribers Fees</Text>
          <View style={mobileStyles.feesInputContainer}>
            <Text style={mobileStyles.currencySymbol}>₹</Text>
            <TextInput
              value={fees}
              onChangeText={setFees}
              placeholder=""
              keyboardType="numeric"
              style={mobileStyles.feesInput}
            />
          </View>

          <TouchableOpacity style={mobileStyles.continueButton}>
            <Text
              style={mobileStyles.continueText}
              onPress={() => navigation.navigate("DoctorCongrats")}
            >
              Continue →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
};

export default EstablishmentTiming;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    backgroundColor: "#FCF5F7",
  },
  rightSection: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#FCF5F7",
  },
  formContainer: {
    width: "100%",
    padding: 30,
  },
  heading: {
    marginTop: "8%",
    fontSize: 28,
    fontWeight: "400",
    marginBottom: 20,
    color: "#000",
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 8,
    fontWeight: "500",
    color: "#000",
  },
  dayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 6,
    marginRight: 10,
    marginBottom: 10,
    elevation: 1,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    width: "35%",
  },
  inputBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#ccc",
    marginBottom: 10,
    width: "40%",
  },
  fullInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#ccc",
    marginBottom: 20,
    width: "28%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },

  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5D73",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: 200,
    position: "relative",
    elevation: 3,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  continueText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  iconCon: {
    position: "absolute",
    right: 10,
    backgroundColor: "white",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    boxShadow: "0px 2px 3.84px rgba(0,0,0,0.25)",
  },

  skipBtn: {
    width: "10%",
    height: "6%",
    backgroundColor: "#20C997",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: "3%",
    justifyContent: "center",
  },
  skipText: {
    alignSelf: "center",
    color: "#fff",
    fontWeight: "400",
    fontSize: 16,
  },

  dayButtonSelected: {
    backgroundColor: "#FF5D73",
  },
  dayButtonText: {
    color: "#000",
    fontWeight: "200",
  },
  dayButtonTextSelected: {
    color: "#fff",
  },

  sessionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  sessionBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sessionText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  feesInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#ccc",
    marginBottom: 20,
    width: "28%",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  noteText: {
    fontSize: 12,
    color: "#000",
    marginLeft: 8,
  },

  SideImageStyles: {
    marginRight: 120,
  },
});

const mobileStyles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  makecolumn: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#000",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#000",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginBottom: 10,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: "#FFE7EB",
    borderRadius: 10,
  },
  dayButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 12,
  },
  dayButtonSelected: {
    backgroundColor: "#FF5D73",
  },
  dayText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 14,
  },
  dayTextSelected: {
    color: "#fff",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  sessionColumn: {
    width: "30%",
  },
  smallLabel: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
  },
  inputWithSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    overflow: "hidden",
    width: 140, // fixed width suitable for mobile
    height: 45,
  },

  inputField: {
    width: 80, // limit text input width
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#000",
  },

  selectorBox: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  selectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  addButton: {
    backgroundColor: "#FF5D73",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  sessionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  sessionTag: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sessionText: {
    color: "#007AFF",
    fontWeight: "400",
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 14,
    marginBottom: 30,
  },
  continueButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF5D73",
    borderRadius: 30,
    paddingVertical: 14,
    marginTop: 20,
  },
  continueText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  feesInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 30,
  },

  currencySymbol: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },

  feesInput: {
    flex: 1,
    fontSize: 20,
    color: "#000",
  },
});
