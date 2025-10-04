import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const FeatureItem = ({ number, title, tagline, description, points }) => {
  return (
    <View style={styles.featureContainer}>
      <View style={styles.numberTitleContainer}>
        <View style={styles.numberBox}>
          <Text style={styles.numberText}>{number}</Text>
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      </View>

      {tagline && <Text style={styles.taglineText}>{tagline}</Text>}

      {description && <Text style={styles.descriptionText}>{description}</Text>}

      <View style={styles.pointsContainer}>
        {points.map((point, index) => (
          <View key={index} style={styles.pointRow}>
            <View style={styles.heartIcon}>
              <Image
                source={require("../../../assets/Icons/AboutUsPoints.png")}
                style={styles.bulletPointsHeart}
              />
            </View>
            {typeof point === "object" && point.isHighlighted ? (
              <Text style={styles.highlightedPointText}>{point.text}</Text>
            ) : (
              <Text style={styles.pointText}>
                {typeof point === "object" ? point.text : point}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const AboutUsHow = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>How</Text>
          <Text style={styles.mainTitle}>Kokoro.Doctor</Text>
          <Text style={styles.mainTitle}>Works</Text>
        </View>

        <FeatureItem
          number="01"
          title="AI Health Companion "
          //tagline="Your Heart's First Line of Defense"
          description="Whether it’s your heart health or reproductive & wellbeing concerns, Kokoro’s AI assistant is designed to give you instant, reliable insights.
"
          points={[
            "Cardiac Mode → Evaluates symptoms, lifestyle, and history to identify early risks and guide you toward the right cardiology support",
            "Gyneac & Wellbeing Mode → Provides confidential guidance on women’s health, male wellbeing, and teen concerns—helping address sensitive issues safely and early.",
            {
              text: "Designed to support early awareness, reduce hesitation, and encourage timely medical care.",
              isHighlighted: true,
            },
          ]}
        />

        <FeatureItem
          number="02"
          title="Emergency Response"
          //tagline="Because Every Second Counts"
          description="Kokoro identifies high-risk cases and triggers alerts—ensuring help arrives when needed most"
          points={[
            "AI detects critical conditions and helps in booking the nearest hospital",
            "Get immediate guidance on what steps to take",
            "Faster access to urgent care minimizes delays",
          ]}
        />

        <FeatureItem
          number="03"
          title="Smart Appointment Navigation"
          points={[
            "Find a top cardiologist near you without unnecessary searching",
            "Get priority bookings based on your risk level",
            "Avoid unnecessary hospital visits—only go when truly needed",
          ]}
        />

        <FeatureItem
          number="04"
          title="MediLocker"
          //tagline="Your Digital Health Vault"
          points={[
            "Store ECGs, prescriptions, and reports securely",
            "Access them anytime, anywhere—even in emergencies",
            "Share with doctors for faster and better care",
            {
              text: "Harvard Innovation Labs research highlights how digital health records empower patients",
              isHighlighted: true,
            },
          ]}
        />

        <FeatureItem
          number="05"
          title="Senior Doctor Access"
          //tagline="Expert Care, On Demand"
          points={[
            "Book consultations with senior cardiologists and gynecologists.",
            "Skip long hospital waits—get priority access when you need it most.",
            "Expert-verified insights ensure trust and accuracy in treatment.",
          ]}
        />

        <FeatureItem
          number="06"
          title="Multi-Language Support"
          //tagline="Healthcare in Your Language"
          points={[
            "AI-powered translation for both heart and women’s health guidance.",
            "Enables clear, effective communication with patients and doctors.",
            "Local-language healthcare improves patient outcomes significantly.",
          ]}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: "1%",
    paddingTop: "0.5%",
    paddingBottom: "0.25%",
  },
  backButton: {
    padding: "5%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: "5%",
  },
  titleContainer: {
    marginTop: "1%",
    marginBottom: "1%",
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40,
    //letterSpacing: -0.5,
    color: "#000",
  },
  featureContainer: {
    marginBottom: "5%",
  },
  numberTitleContainer: {
    flexDirection: "row",
    height: 48,
  },
  numberBox: {
    width: "15%",
    height: "110%",
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "5%",
  },
  numberText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  titleBox: {
    flex: 1,
    backgroundColor: "#4A4A4A",
    justifyContent: "center",
    paddingHorizontal: "3%",
  },
  titleText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  taglineText: {
    textAlign: "right",
    marginTop: "1%",
    marginBottom: "1%",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginTop: "2%",
    marginBottom: "2%",
  },
  pointsContainer: {
    marginTop: "1%",
  },
  pointRow: {
    flexDirection: "row",
    marginBottom: "3%",
    alignItems: "flex-start",
    gap: 5,
  },
  bulletPointsHeart: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  heartIcon: {
    width: 18,
    alignItems: "center",
    marginRight: "1%",
    marginTop: "1%",
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
    marginTop:"1%"
  },
  highlightedPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#FF6B6B",
    marginTop:"1%"
  },
  bottomPadding: {
    height: "20%",
  },
});

export default AboutUsHow;
