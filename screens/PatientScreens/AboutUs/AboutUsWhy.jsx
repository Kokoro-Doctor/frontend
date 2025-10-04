import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, StatusBar, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const FeatureItem = ({ number, title, subtitle }) => {
  return (
    <View style={styles.featureContainer}>
      <View style={styles.featureLeftContent}>
        <Text style={styles.featureTitle}>{title}</Text>
      </View>
      
      <View style={styles.divider}>
        <Text style={styles.featureNumber}>{number}</Text>
        <Image source={require("../../../assets/Icons/tiltedPurpleLine.png")} style={styles.tiltedLine}/>
      </View>
      
      <View style={styles.featureRightContent}>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </View>
  )
}

const AboutUsWhy = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Why</Text>
          <Text style={styles.mainTitle}>Kokoro.Doctor</Text>
          <Text style={styles.mainTitle}>Stands Out</Text>
        </View>

        <FeatureItem
          number="1"
          title="Harvard Innovation Labs I-Member Insights"
          subtitle="Scientifically validated AI models"
        />

        <FeatureItem
          number="2"
          title="AI-Powered Emergency Response"
          subtitle="Critical alerts that save lives."
        />

        <FeatureItem
          number="3"
          title="Frictionless Doctor Access"
          subtitle="Seamless connection with top cardiologists"
        />

        <FeatureItem
          number="4"
          title="MediLocker for Secure Health Records"
          subtitle="Medical history available anytime"
        />

        <FeatureItem
          number="5"
          title="Multi-Language Support"
          subtitle="Making heart care inclusive and accessible"
        />

        <FeatureItem
          number="6"
          title="Scalable & Cost-Effective"
          subtitle="Expanding care without physical limitations"
        />

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            By combining AI, data science, and medical expertise, Kokoro.Doctor is revolutionizing heart & reproductive health.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: 16,
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 42,
    color: "#000",
  },
  featureContainer: {
    flexDirection: "row",
    marginBottom: 40,
    alignItems: "center",
  },
  featureLeftContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    lineHeight: 22,
  },
  divider: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 18,
  },
  featureNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginHorizontal: 0,
  },
  tiltedLine:{
    height: 60,
    position: "absolute",
    left: 5,
  },
  featureRightContent: {
    flex: 1,
  },
  featureSubtitle: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  bottomPadding: {
    height: 40,
  },
})

export default AboutUsWhy