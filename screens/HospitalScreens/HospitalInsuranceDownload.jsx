import React from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
  Image,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";

export default function HospitalInsuranceDownload({ navigation, route }) {
  const analysisData = route?.params?.analysisData;

  const handleDownload = () => {
    Alert.alert("Download", "Downloading updated claim file...", [
      { text: "OK" },
    ]);
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <StatusBar barStyle="light-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <HeaderLoginSignUp navigation={navigation} />
      </View>
      <Text style={styles.title}>Insurance claim analysis AI</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Updated claim file generated. 5 of 6 suggestions applied. Review
            below, make any final edits, then download.
          </Text>
        </View>

        {/* FILE CARD */}
        <View style={styles.card}>
          <View style={styles.fileHeader}>
            <Ionicons name="document-text" size={18} color="#1976D2" />
            <Text style={styles.fileName}>
              {analysisData?.structured_data?.source_filename ||
                "Insurance_Claim_Sharma_Aug2024.pdf"}
            </Text>
          </View>
          <ScrollView
            style={styles.cardScroll}
            showsVerticalScrollIndicator={true}
          >
            <Text style={{textAlign:"center"}}>Coming Soon...</Text>
          </ScrollView>
        </View>

        {/* BUTTONS */}
        <TouchableOpacity style={styles.outlineBtn}>
          <Text style={styles.outlineText}>Open in editor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleDownload}>
          <Text style={styles.primaryText}>Download updated claim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.greenOutlineBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.greenOutlineText}>Analyze another claim</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.greenBtn}>
          <Text style={styles.greenText}>Set up date Integration</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  header: {
    zIndex: 2,
  },

  logo: {
    fontSize: 14,
    fontWeight: "600",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    paddingLeft: "2% ",
  },

  infoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  infoText: {
    fontSize: 12,
    color: "#1E3A8A",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 18,
  },

  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  fileName: {
    marginLeft: 8,
    fontSize: 13,
    color: "#1976D2",
    fontWeight: "500",
  },

  cardText: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18,
  },

  link: {
    color: "#2E7D32",
    fontWeight: "500",
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  outlineText: {
    fontSize: 14,
    color: "#333",
  },

  primaryBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  greenOutlineBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#E8F5E9",
  },

  greenOutlineText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },

  greenBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },

  greenText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardScroll: {
    height: 250, // 🔥 adjust based on UI (150–220 looks good)
  },
});
