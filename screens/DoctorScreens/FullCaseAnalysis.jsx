import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  Text,
  Image,
  ScrollView,
  Linking,
  TextInput,
  StatusBar,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";

const documents = [1, 2, 3, 4, 5, 6];

export default function FullCaseAnalysis({ navigation, route }) {
  const [activeTab, setActiveTab] = useState("All");
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          Platform.OS === "web" ? { height: "auto" } : { height: "auto" },
        ]}
      >
        <HeaderLoginSignUp navigation={navigation} />
      </View>

      {/* TITLE */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Full case analysis</Text>
      </View>

      {/* ALERT */}
      <View style={styles.alertBox}>
        <Image source={require("../../assets/Images/heartFullCase.png")} />
        <Text style={styles.alertText}>
          2 New Reports added since last review
        </Text>
      </View>

      {/* FILTER BUTTONS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsWrapper}
        contentContainerStyle={styles.tabs}
      >
        {/* ALL */}
        <TouchableOpacity
          onPress={() => setActiveTab("All")}
          style={[
            styles.tabCommon,
            activeTab === "All" ? styles.activeTab : styles.inactiveTab,
          ]}
        >
          <Image
            source={require("../../assets/Images/Allfullcase.png")}
            style={{ width: 16, height: 20 }}
            resizeMode="contain"
          />

          <Text
            style={activeTab === "All" ? styles.activeTabText : styles.tabText}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* PRESCRIPTION */}
        <TouchableOpacity
          onPress={() => setActiveTab("Prescription")}
          style={[
            styles.tabCommon,
            activeTab === "Prescription"
              ? styles.activeTab
              : styles.inactiveTab,
          ]}
        >
          <Image
            source={require("../../assets/Images/myPrescription.png")}
            style={{ width: 16, height: 20 }}
            resizeMode="contain"
          />

          <Text
            style={
              activeTab === "Prescription"
                ? styles.activeTabText
                : styles.tabText
            }
          >
            My Prescriptions
          </Text>
        </TouchableOpacity>

        {/* SCAN REPORT */}
        <TouchableOpacity
          onPress={() => setActiveTab("Scan")}
          style={[
            styles.tabCommon,
            activeTab === "Scan" ? styles.activeTab : styles.inactiveTab,
          ]}
        >
          <Image
            source={require("../../assets/Images/scanReports.png")}
            style={{ width: 16, height: 20 }}
            resizeMode="contain"
          />

          <Text
            style={activeTab === "Scan" ? styles.activeTabText : styles.tabText}
          >
            Scan Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("Lab")}
          style={[
            styles.tabCommon,
            activeTab === "Lab" ? styles.activeTab : styles.inactiveTab,
          ]}
        >
          <Image
            source={require("../../assets/Images/tubechemical.png")}
            style={{ width: 16, height: 20 }}
            resizeMode="contain"
          />

          <Text
            style={activeTab === "Lab" ? styles.activeTabText : styles.tabText}
          >
            Lab Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("Hospital")}
          style={[
            styles.tabCommon,
            activeTab === "Hospital" ? styles.activeTab : styles.inactiveTab,
          ]}
        >
          <Image
            source={require("../../assets/Images/hospitalFullcase.png")}
            style={{ width: 16, height: 20 }}
            resizeMode="contain"
          />

          <Text
            style={
              activeTab === "Hospital" ? styles.activeTabText : styles.tabText
            }
          >
            Hospital History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("Health")}
          style={[
            styles.tabCommon,
            activeTab === "Health" ? styles.activeTab : styles.inactiveTab,
          ]}
        >
          <Image
            source={require("../../assets/Images/heartShield.png")}
            style={{ width: 16, height: 20 }}
            resizeMode="contain"
          />

          <Text
            style={
              activeTab === "Health" ? styles.activeTabText : styles.tabText
            }
          >
            Health Insurance & ID
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* DOCUMENT LIST */}
      <View style={styles.docsCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {documents.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.fileIcon}>
                <Feather name="file-text" size={22} color="#FF6B6B" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fileTitle}>Prescription 1</Text>

                <Text style={styles.meta}>SIZE : 12 MB Format : PDF</Text>

                <Text style={styles.meta}>
                  Date : 26-june-25 Time : 10:00 AM
                </Text>
              </View>

              <View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>My Prescription</Text>
                </View>

                <Ionicons
                  name="ellipsis-horizontal"
                  size={18}
                  style={{ alignSelf: "flex-end", marginTop: 6 }}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* AI BUTTON */}
      <TouchableOpacity style={styles.aiButton}>
        <Text style={styles.aiText}>Clinical AI Assistant</Text>
      </TouchableOpacity>

      {/* FLOATING BUTTON */}
      <TouchableOpacity style={styles.floatingBtn}>
        <Image
          source={require("../../assets/Images/floatingHeart.png")}
          style={{
            width: 55,
            height: 55,
            resizeMode: "cover",
          }}
        />
      </TouchableOpacity>

      {/* GENERATE BUTTON */}
      <TouchableOpacity style={styles.generateBtn}>
        <Image source={require("../../assets/Images/BottomCTAfullcase.png")} />

        <Text style={styles.generateText}>Generate Prescription</Text>
      </TouchableOpacity>
    </View>
  );
}
const windowWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: "6%",
  },

  header: {
    paddingHorizontal: "2%",
    paddingVertical: "1%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  logo: {
    fontWeight: "600",
    fontSize: 16,
  },

  titleSection: {
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#888",
    marginTop: 4,
  },

  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAEA",
    padding: 12,
    gap: 8,
  },

  alertText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },

  activeTab: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    backgroundColor: "#FF7072",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  tab: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  tabText: {
    color: "#FF6B6B",
    fontWeight: "500",
  },

  card: {
    borderWidth: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  fileIcon: {
    marginRight: 12,
  },

  fileTitle: {
    fontWeight: "600",
    fontSize: 15,
  },

  meta: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },

  tag: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  tagText: {
    color: "#FF6B6B",
    fontSize: 11,
  },

  aiButton: {
    marginTop: "2%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#FF707233",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  aiText: {
    fontSize: 16,
    color: "#F31A13",
    fontWeight: "700",
  },

  floatingBtn: {
    position: "absolute",
    right: 25,
    bottom: "10%",

    height: 72,
    width: 72,
    borderRadius: 36, // ✅ makes perfect circle

    backgroundColor: "#FF7072",

    justifyContent: "center",
    alignItems: "center",

    elevation: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  generateBtn: {
    alignSelf: "center",
    width: "85%",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FF7072",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    gap: 10,
    marginTop: "20%",
  },

  generateText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  docsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: windowWidth > 400 ? 420 : 270,
    marginTop: "4%",
  },
  tabs: {
    marginTop: "4%",
    paddingBottom: "4%",

    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    alignItems: "center",
  },

  tabCommon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },

  activeTab: {
    backgroundColor: "#FF7072",
  },

  inactiveTab: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FF7072",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  tabText: {
    color: "#FF7072",
    fontWeight: "500",
  },
  tabsWrapper: {
    maxHeight: 55, // ✅ controls extra vertical space
  },
});
