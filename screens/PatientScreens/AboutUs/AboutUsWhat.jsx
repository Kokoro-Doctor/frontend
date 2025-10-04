import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AboutUsWhat = ({ navigation }) => {
  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#fff" />
      <ImageBackground
        source={require("../../../assets/Images/HeartImage.jpg")}
        style={styles.imageBackground}
      >
        <SafeAreaView style={styles.container}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={styles.title}>What is{"\n"}Kokoro.Doctor?</Text>

            {/* Description */}
            <Text style={styles.description}>
              Kokoro.Doctor is an AI-powered healthcare companion designed to
              make cardiac, reproductive, and personal wellbeing care more
              accessible, efficient, and affordable.
            </Text>

            {/* Feature Grid */}
            <View style={styles.featureGrid}>
              {/* Left Column */}
              <View style={styles.featureColumn}>
                <View
                  style={[
                    styles.featureBoxLarge,
                    { backgroundColor: "#FDA2A4" },
                  ]}
                >
                  <Text style={styles.featureText}>
                    Instant AI-powered health assessments (heart, gynecology,
                    and wellbeing).
                  </Text>
                </View>
                <View
                  style={[
                    styles.featureBoxSmall,
                    { backgroundColor: "#AABFFF" },
                  ]}
                >
                  <Text style={styles.featureText}>
                    A secure digital health locker (MediLocker) to store and
                    share reports.
                  </Text>
                </View>
              </View>

              {/* Right Column */}
              <View style={styles.featureColumn}>
                <View
                  style={[
                    styles.featureBoxSmall,
                    { backgroundColor: "#CBABEA" },
                  ]}
                >
                  <Text style={styles.featureText}>
                    Easy access to experienced doctors and specialists near you.
                  </Text>
                </View>
                <View
                  style={[
                    styles.featureBoxLarge,
                    { backgroundColor: "#8BC9A0" },
                  ]}
                >
                  <Text style={styles.featureText}>
                    Emergency alerts and guided support for high-risk
                    situations.
                  </Text>
                </View>
              </View>
            </View>

            {/* Footer Text */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Developed as part of the Harvard Innovation Labs I-Member
                program, Kokoro.Doctor combines cutting-edge AI with expert
                medical insights to provide fast, reliable, and personalized
                healthcare—while ensuring that professional doctors remain
                central to every critical decision.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1, // Ensure it takes up the full screen
    backgroundColor: "#fff",
    height: "100%",
    width: "100%",
  },
  imageBackground: {
    flex: 1, // Ensures it expands
    width: "100%",
    height: "100%",
    justifyContent: "center",
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    //backgroundColor: 'transparent',
    backgroundColor: "white",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 0,
    marginLeft: "2%",
    marginRight: "2%",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    marginTop: "1%",
    marginBottom: "1%",
    lineHeight: 44,
    //fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: "1%",
    marginTop: "1%",
  },
  featureGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "1%",
    //borderWidth:1
  },
  featureColumn: {
    width: "48%",
    //height:"30%"
  },
  featureBoxLarge: {
    minHeight: "30%", // Let the content decide height
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    marginBottom: 10, // Reduce spacing
  },
  featureBoxSmall: {
    minHeight: "40%", // Let the content decide height
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    marginBottom: 10, // Reduce spacing
  },
  footer: {
    alignItems: "flex-start",
    // width:"100%",
    marginTop: "1%", // Adjust footer spacing
    //marginBottom: 20, // Ensure proper bottom padding
  },
  featureText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  footerText: {
    fontSize: 16,
    //lineHeight: 24,
    color: "#333",
    // marginTop:"1%",
  },
});

export default AboutUsWhat;
