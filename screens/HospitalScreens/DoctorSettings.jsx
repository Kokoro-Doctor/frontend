import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Platform,
  useWindowDimensions,
  Image,
  ScrollView,
  Linking,
  TextInput,
} from "react-native";
import { useState } from "react";

import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import * as DocumentPicker from "expo-document-picker";

import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";

const SettingItem = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        {icon}
        <Text style={styles.itemText}>{title}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const SCREENS = {
  SETTINGS: "settings",
  PROFILE: "profile",
  NOTIFICATION: "notification",
  EDIT_PROFILE: "edit_profile",
  SUBSCRIBER_FEES: "subscriber_fees",
  ESTABLISHMENT: "establishment",
  MEDICAL_PROOF: "medical_proof",
  MEDICAL_DOCUMENTS: "medical_documents", // NEW
};

export default function DoctorSettings() {
  const [activeScreen, setActiveScreen] = useState(SCREENS.SETTINGS);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
  });

  const isFormEdited =
    form.fullName || form.age || form.gender || form.email || form.phone;
  const [fees, setFees] = useState({
    price: "1999",
    regular: 1,
    emergency: 1,
  });
  const daysList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [selectedDays, setSelectedDays] = useState(["Sun"]);

  const [session, setSession] = useState({
    from: "",
    to: "",
  });

  const [sessions, setSessions] = useState([]);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  const [medicalForm, setMedicalForm] = useState({
    license: "",
    specialization: "",
    experience: "",
    hospital: "",
    documents: [], // MULTIPLE FILES
  });

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
    });

    if (!result.canceled) {
      setMedicalForm({
        ...medicalForm,
        file: result.assets[0],
      });
    }
  };
  const [documents, setDocuments] = useState({
    councilId: [],
    degree: [],
    govtId: [],
  });

  const pickFile = async (key, isBasic = false) => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: "*/*",
    });

    if (!result.canceled) {
      if (isBasic) {
        setMedicalForm({
          ...medicalForm,
          documents: [...medicalForm.documents, ...result.assets],
        });
      } else {
        setDocuments({
          ...documents,
          [key]: [...documents[key], ...result.assets],
        });
      }
    }
  };
  const removeFile = (key, index, isBasic = false) => {
    if (isBasic) {
      const updated = medicalForm.documents.filter((_, i) => i !== index);

      setMedicalForm({
        ...medicalForm,
        documents: updated,
      });
    } else {
      const updated = documents[key].filter((_, i) => i !== index);

      setDocuments({
        ...documents,
        [key]: updated,
      });
    }
  };
  const isMedicalProofComplete =
    medicalForm.license &&
    medicalForm.specialization &&
    medicalForm.experience &&
    medicalForm.hospital &&
    medicalForm.documents.length > 0;
  const isDocumentsComplete =
    documents.councilId.length > 0 &&
    documents.degree.length > 0 &&
    documents.govtId.length > 0;

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: true,
    reminders: true,
    promotional: true,
  });
  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const notificationList = [
    { label: "Push Notification", key: "push" },
    { label: "Email Notification", key: "email" },
    { label: "SMS Notification", key: "sms" },
    { label: "Appointment Reminders", key: "reminders" },
    { label: "Promotional Messages", key: "promotional" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor="#F87171" /> */}

      {/* Header */}

      <View
        style={[
          styles.header,
          Platform.OS === "web" ? { height: "auto" } : { height: "auto" },
        ]}
      >
        <HeaderLoginSignUp navigation={navigation} />
        {activeScreen !== SCREENS.SETTINGS && (
          <TouchableOpacity
            onPress={() => {
              if (activeScreen === SCREENS.EDIT_PROFILE)
                setActiveScreen(SCREENS.PROFILE);
              else if (activeScreen === SCREENS.SUBSCRIBER_FEES)
                setActiveScreen(SCREENS.PROFILE);
              else if (activeScreen === SCREENS.ESTABLISHMENT)
                // 👈 PASTE HERE
                setActiveScreen(SCREENS.PROFILE);
              else if (activeScreen === SCREENS.MEDICAL_PROOF)
                setActiveScreen(SCREENS.PROFILE);
              else if (activeScreen === SCREENS.MEDICAL_DOCUMENTS)
                setActiveScreen(SCREENS.MEDICAL_PROOF);
              else setActiveScreen(SCREENS.SETTINGS);
            }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#fff"
              style={{ marginBottom: 10 }}
            />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>
          {activeScreen === SCREENS.SETTINGS
            ? "Settings"
            : activeScreen === SCREENS.PROFILE
              ? "Profile Settings"
              : activeScreen === SCREENS.NOTIFICATION
                ? "Notification"
                : activeScreen === SCREENS.EDIT_PROFILE
                  ? "Edit personal information"
                  : activeScreen === SCREENS.MEDICAL_PROOF
                    ? "Medical proof"
                    : activeScreen === SCREENS.MEDICAL_DOCUMENTS
                      ? "Medical proof"
                      : activeScreen === SCREENS.SUBSCRIBER_FEES
                        ? "Subscribers Fees"
                        : "Establishment Timings"}
        </Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* SETTINGS */}
        {activeScreen === "settings" && (
          <>
            <Text style={styles.section}>Account setting</Text>

            <SettingItem
              title="Profile Setting"
              icon={<Feather name="user" size={20} color="#F87171" />}
              onPress={() => setActiveScreen("profile")}
            />

            <SettingItem
              title="Language Preferences"
              icon={<Ionicons name="language" size={20} color="#F87171" />}
            />

            <SettingItem
              title="Change Password"
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#F87171"
                />
              }
            />

            <SettingItem
              title="Theme"
              icon={
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color="#F87171"
                />
              }
            />

            <SettingItem
              title="Notification"
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#F87171"
                />
              }
              onPress={() => setActiveScreen("notification")}
            />

            <Text style={[styles.section, { marginTop: 25 }]}>Other</Text>

            <SettingItem
              title="Contact Support"
              icon={<Feather name="headphones" size={20} color="#F87171" />}
            />

            <SettingItem
              title="Terms of Service"
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#F87171"
                />
              }
            />

            <SettingItem
              title="FAQ"
              icon={<MaterialIcons name="quiz" size={20} color="#F87171" />}
            />
          </>
        )}

        {/* PROFILE */}
        {activeScreen === "profile" && (
          <>
            <Text style={styles.section}>Profile Settings</Text>

            <SettingItem
              title="Edit Personal Information"
              icon={<Feather name="user" size={20} color="#F87171" />}
              onPress={() => setActiveScreen(SCREENS.EDIT_PROFILE)}
            />

            <SettingItem
              title="Medical Proof"
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#F87171"
                />
              }
              onPress={() => setActiveScreen(SCREENS.MEDICAL_PROOF)}
            />

            <SettingItem
              title="Establishment Timings"
              icon={<Ionicons name="time-outline" size={20} color="#F87171" />}
              onPress={() => setActiveScreen(SCREENS.ESTABLISHMENT)}
            />

            <SettingItem
              title="Subscriber Fees"
              icon={<MaterialIcons name="payments" size={20} color="#F87171" />}
              onPress={() => setActiveScreen(SCREENS.SUBSCRIBER_FEES)}
            />
          </>
        )}
        {activeScreen === SCREENS.SUBSCRIBER_FEES && (
          <View>
            <Text style={styles.section}>Subscribers Fees</Text>

            {/* Price */}
            <TextInput
              style={styles.input}
              value={fees.price}
              onChangeText={(t) => setFees({ ...fees, price: t })}
              keyboardType="numeric"
            />

            {/* Regular Checkup */}
            <View style={styles.counterRow}>
              <Text style={styles.itemText}>No of Regular Check-up</Text>

              <View style={styles.counterBox}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() =>
                    setFees({
                      ...fees,
                      regular: Math.max(0, fees.regular - 1),
                    })
                  }
                >
                  <Text style={styles.counterText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.counterValue}>{fees.regular}</Text>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() =>
                    setFees({
                      ...fees,
                      regular: fees.regular + 1,
                    })
                  }
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Emergency Checkup */}
            <View style={styles.counterRow}>
              <Text style={styles.itemText}>No of Emergency Check-up</Text>

              <View style={styles.counterBox}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() =>
                    setFees({
                      ...fees,
                      emergency: Math.max(0, fees.emergency - 1),
                    })
                  }
                >
                  <Text style={styles.counterText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.counterValue}>{fees.emergency}</Text>

                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() =>
                    setFees({
                      ...fees,
                      emergency: fees.emergency + 1,
                    })
                  }
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.greenSaveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
        {activeScreen === SCREENS.ESTABLISHMENT && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.section}>Choose Days</Text>

            {/* Days */}
            <View style={styles.daysRow}>
              {daysList.map((day) => {
                const selected = selectedDays.includes(day);

                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayBtn, selected && styles.dayBtnActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[styles.dayText, selected && { color: "#fff" }]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Session */}
            <Text style={[styles.section, { marginTop: 20 }]}>
              Choose Session
            </Text>

            <View style={styles.sessionRow}>
              {/* FROM */}
              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>From</Text>
                <TextInput
                  placeholder=""
                  style={styles.timeInput}
                  value={session.from}
                  onChangeText={(t) => setSession({ ...session, from: t })}
                />
                <Text style={styles.amPm}>AM</Text>
              </View>

              {/* TO */}
              <View style={styles.timeBox}>
                <Text style={styles.timeLabel}>To</Text>
                <TextInput
                  placeholder=""
                  style={styles.timeInput}
                  value={session.to}
                  onChangeText={(t) => setSession({ ...session, to: t })}
                />
                <Text style={styles.amPm}>AM</Text>
              </View>

              {/* ADD */}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  if (session.from && session.to) {
                    setSessions([...sessions, `${session.from} AM`]);
                    setSession({ from: "", to: "" });
                  }
                }}
              >
                <Text style={{ color: "#fff" }}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Added Sessions */}
            {sessions.map((s, i) => (
              <View key={i} style={styles.sessionChip}>
                <Text style={styles.sessionChipText}>{s}</Text>
              </View>
            ))}

            {/* Save */}
            <TouchableOpacity style={styles.greenSaveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {activeScreen === SCREENS.MEDICAL_PROOF && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* License */}
            <Text style={styles.label}>Medical License no</Text>
            <TextInput
              style={styles.input}
              value={medicalForm.license}
              onChangeText={(t) =>
                setMedicalForm({ ...medicalForm, license: t })
              }
            />

            {/* Upload */}
            <Text style={[styles.label, { marginTop: 20 }]}>
              Please upload document for verification
            </Text>

            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => pickFile(null, true)}
            >
              <Ionicons name="cloud-upload-outline" size={22} color="#F87171" />
              <Text style={styles.browseBtn}>Browse File</Text>
            </TouchableOpacity>

            {medicalForm.documents.map((file, i) => (
              <View key={i} style={styles.fileRow}>
                <Text style={styles.fileName}>{file.name}</Text>

                <TouchableOpacity onPress={() => removeFile(null, i, true)}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Specialization */}
            <Text style={styles.label}>Specialization</Text>
            <TextInput
              style={styles.input}
              value={medicalForm.specialization}
              onChangeText={(t) =>
                setMedicalForm({
                  ...medicalForm,
                  specialization: t,
                })
              }
            />

            {/* Experience */}
            <Text style={styles.label}>Year of Experience</Text>
            <TextInput
              style={styles.input}
              value={medicalForm.experience}
              onChangeText={(t) =>
                setMedicalForm({
                  ...medicalForm,
                  experience: t,
                })
              }
              keyboardType="numeric"
            />

            {/* Hospital */}
            <Text style={styles.label}>Affiliated Hospital/Clinic</Text>
            <TextInput
              style={styles.input}
              value={medicalForm.hospital}
              onChangeText={(t) =>
                setMedicalForm({
                  ...medicalForm,
                  hospital: t,
                })
              }
            />

            {/* Save */}
            <TouchableOpacity
              style={[
                styles.greenSaveBtn,
                !isMedicalProofComplete && {
                  backgroundColor: "#9CA3AF",
                },
              ]}
              disabled={!isMedicalProofComplete}
              onPress={() => setActiveScreen(SCREENS.MEDICAL_DOCUMENTS)}
            >
              <Text style={styles.saveText}>Save & Next</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
        {activeScreen === SCREENS.MEDICAL_DOCUMENTS && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Council ID */}
            <Text style={styles.label}>Medical Council Registration Id</Text>

            <View style={styles.uploadRow}>
              <Text style={styles.uploadHint}>
                Please upload document for verification
              </Text>

              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickFile("councilId")}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color="#F87171"
                />
                <Text style={styles.browseBtn}>Browse File</Text>
              </TouchableOpacity>
            </View>

            {documents.councilId.map((file, i) => (
              <View key={i} style={styles.fileRow}>
                <Text style={styles.fileName}>{file.name}</Text>

                <TouchableOpacity onPress={() => removeFile("councilId", i)}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Degree */}
            <Text style={styles.label}>Degree Certificate</Text>

            <View style={styles.uploadRow}>
              <Text style={styles.uploadHint}>
                Please upload document for verification
              </Text>

              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickFile("degree")}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color="#F87171"
                />
                <Text style={styles.browseBtn}>Browse File</Text>
              </TouchableOpacity>
            </View>

            {documents.degree.map((file, i) => (
              <View key={i} style={styles.fileRow}>
                <Text style={styles.fileName}>{file.name}</Text>

                <TouchableOpacity onPress={() => removeFile("degree", i)}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Govt ID */}
            <Text style={styles.label}>Government ID Proof</Text>

            <View style={styles.uploadRow}>
              <Text style={styles.uploadHint}>
                Please upload document for verification
              </Text>

              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickFile("govtId")}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color="#F87171"
                />
                <Text style={styles.browseBtn}>Browse File</Text>
              </TouchableOpacity>
            </View>

            {documents.govtId.map((file, i) => (
              <View key={i} style={styles.fileRow}>
                <Text style={styles.fileName}>{file.name}</Text>

                <TouchableOpacity onPress={() => removeFile("govtId", i)}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Save */}
            <TouchableOpacity
              style={[
                styles.greenSaveBtn,
                !isDocumentsComplete && {
                  backgroundColor: "#9CA3AF",
                },
              ]}
              disabled={!isDocumentsComplete}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* NOTIFICATION */}
        {activeScreen === "notification" && (
          <>
            <Text style={styles.section}>Notification Allowed</Text>

            {notificationList.map((item) => {
              const isOn = notifications[item.key];

              return (
                <View key={item.key} style={styles.toggleRow}>
                  <Text style={styles.itemText}>{item.label}</Text>

                  <TouchableOpacity
                    style={[
                      styles.toggle,
                      { backgroundColor: isOn ? "#3B82F6" : "#D1D5DB" },
                    ]}
                    onPress={() => toggleNotification(item.key)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.toggleDot,
                        {
                          alignSelf: isOn ? "flex-end" : "flex-start",
                        },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
        {activeScreen === SCREENS.EDIT_PROFILE && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar} />
              <Feather name="edit-2" size={18} color="#F87171" />
            </View>

            {/* Full Name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={(t) => setForm({ ...form, fullName: t })}
            />

            {/* Age + Gender */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={form.age}
                  onChangeText={(t) => setForm({ ...form, age: t })}
                />
              </View>

              <View style={{ width: 15 }} />

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Gender</Text>
                <TextInput
                  style={styles.input}
                  value={form.gender}
                  onChangeText={(t) => setForm({ ...form, gender: t })}
                />
              </View>
            </View>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />

            {/* Phone */}
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
            />

            {/* Save Button */}
            {isFormEdited && (
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F87171",
  },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    paddingLeft: "2%",
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  /* Card */
  card: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  section: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 10,
  },

  /* Item */
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  itemText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  toggle: {
    width: 42,
    height: 24,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    padding: 3,
  },

  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignSelf: "flex-end",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },

  label: {
    fontWeight: 500,
    fontSize: 13,
    color: "#000",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
  },

  saveBtn: {
    marginTop: 30,
    backgroundColor: "#F87171",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  counterBtn: {
    width: 28,
    height: 28,
    backgroundColor: "#F87171",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },

  counterText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  counterValue: {
    minWidth: 20,
    textAlign: "center",
    fontWeight: "600",
  },

  greenSaveBtn: {
    marginTop: 60,
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  dayBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
  },

  dayBtnActive: {
    backgroundColor: "#F87171",
  },

  dayText: {
    fontWeight: "600",
  },

  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  sessionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },

  addBtn: {
    backgroundColor: "#F87171",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },

  sessionTag: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  timeBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  timeLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  timeInput: {
    fontSize: 14,
    marginTop: 2,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "#D1D5DB",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  amPm: {
    position: "absolute",
    right: 8,
    bottom: 6,
    fontSize: 12,
    color: "#6B7280",
  },
  sessionChip: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  sessionChipText: {
    color: "#2563EB",
    fontSize: 12,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
  },

  browseBtn: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    color: "#374151",
  },
  uploadRow: {
    marginTop: 6,
    marginBottom: 14,
  },

  uploadHint: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
  },

  fileName: {
    fontSize: 12,
    marginTop: 4,
    color: "#111827",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    backgroundColor: "#F9FAFB",
    padding: 6,
    borderRadius: 6,
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 20,
    justifyContent: "center",
    padding: 3,
  },

  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});
