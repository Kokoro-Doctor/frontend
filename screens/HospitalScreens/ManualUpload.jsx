import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";

const ManualUpload = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(2);
  return (
    <SafeAreaView style={stylesMobile.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <StatusBar barStyle="light-content" backgroundColor="#fff" />
        <View style={stylesMobile.header}>
          <HeaderLoginSignUp navigation={navigation} />
        </View>
        <Text style={stylesMobile.title}>AI Integration</Text>
        <TouchableOpacity style={stylesMobile.selectBtn}>
          <Text style={stylesMobile.selectText}>Select Patient</Text>
        </TouchableOpacity>
        {/* Step Progress */}
        <View style={stylesMobile.stepContainer}>
          <View style={stylesMobile.line} />
          {[1, 2, 3].map((item, index) => {
            const active = index === currentStep;
            const completed = index < currentStep;
            return (
              <View key={index} style={stylesMobile.stepWrapper}>
                <View
                  style={[
                    stylesMobile.circle,
                    active && stylesMobile.activeCircle,
                    completed && stylesMobile.completedCircle,
                  ]}
                >
                  <Text
                    style={[
                      stylesMobile.circleText,
                      active && stylesMobile.activeCircleText,
                      completed && stylesMobile.completedText,
                    ]}
                  >
                    {completed ? "✓" : item}
                  </Text>
                </View>
                <Text style={stylesMobile.stepText}>
                  {item === 1 && "Choose\nmethod"}
                  {item === 2 && "Validate"}
                  {item === 3 && "Integration\nComplete"}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={stylesMobile.formContainer}>
          <Text style={stylesMobile.formTitle}>Doctor Details :</Text>

          <Text style={stylesMobile.label}>Full name *</Text>
          <TextInput
            style={stylesMobile.input}
            placeholder="Enter Name.."
            placeholderTextColor="#B3B3B3"
          />

          <Text style={stylesMobile.label}>Department *</Text>
          <View style={stylesMobile.dropdown}>
            <Text style={stylesMobile.placeholder}>Select department</Text>
            <Ionicons name="chevron-down" size={18} color="#888" />
          </View>

          <Text style={stylesMobile.label}>Specialisation</Text>
          <TextInput
            style={stylesMobile.input}
            placeholder="e.g Interventional Cardiology"
            placeholderTextColor="#B3B3B3"
          />

          <Text style={stylesMobile.label}>NMC / MCI Registration No</Text>
          <TextInput
            style={stylesMobile.input}
            placeholder="NMC-DL-2019-XXXXX"
            placeholderTextColor="#B3B3B3"
          />

          <Text style={stylesMobile.label}>Email</Text>
          <TextInput
            style={stylesMobile.input}
            placeholder="e.g example@email.com"
            placeholderTextColor="#B3B3B3"
          />

          <Text style={stylesMobile.label}>Phone no</Text>
          <TextInput
            style={stylesMobile.input}
            placeholder="Enter phone number"
            placeholderTextColor="#B3B3B3"
          />
        </View>

        <View style={{ marginTop: 20 , marginBottom:"4%" }}>
          {/* Analyze Another claim */}
          <TouchableOpacity style={stylesMobile.secondaryButton}>
            <Text style={stylesMobile.secondaryButtonText}>
              Save & Register Another Doctor
            </Text>
          </TouchableOpacity>

          {/* View Imported patients */}
          <TouchableOpacity style={stylesMobile.primaryButton}>
            <Text style={stylesMobile.primaryButtonText}>Save & Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManualUpload;

const stylesMobile = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 16,
  },

  header: { zIndex: 2 },

  logo: {
    fontWeight: "600",
    fontSize: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    paddingLeft: "2%",
  },
  selectBtn: {
    marginLeft: "2%",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  selectText: { fontSize: 14, color: "#333" },

  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    position: "relative",
  },

  line: {
    position: "absolute",
    top: 13,
    left: "16.5%",
    right: "16.5%",
    height: 2,
    backgroundColor: "#1680ECBF",
  },

  stepWrapper: { alignItems: "center", flex: 1 },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },

  activeCircle: { backgroundColor: "#2563EB" },
  activeCircleText: { color: "#fff" },
  completedCircle: { backgroundColor: "#2563EB" },
  completedText: { color: "#fff" },
  stepText: { fontSize: 10, textAlign: "center", color: "#3B82F6" },

  circleText: {
    fontSize: 12,
    color: "#3B82F6",
  },

  heading: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },

  successBox: {
    borderWidth: 1,
    borderColor: "#1680ECBF",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#FBFDFF",
  },

  successText: {
    color: "#025AE0",
    fontSize: 12,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#25BA58",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: "center",
    backgroundColor: "#025AE000",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B6B6B",
  },

  statLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#25BA58",
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 15,
    borderColor: "#E8E8E8",
    borderWidth: 1,
  },

  infoTitle: {
    fontWeight: "600",
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 3,
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 8,
  },
  integrationBox: {
    borderWidth: 1,
    borderColor: "#1680ECBF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#F8FBFF",
  },

  integrationText: {
    color: "#025AE0",
    fontWeight: "500",
    fontSize: 13,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#25BA58",
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#25BA58",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  primaryButton: {
    backgroundColor: "#025AE0",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },

  formTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },

  label: {
    fontSize: 12,
    marginBottom: 4,
    color: "#000000D9",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 13,
    outlineStyle: "none",
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  placeholder: {
    color: "#B3B3B3",
    fontSize: 13,
  },
});
