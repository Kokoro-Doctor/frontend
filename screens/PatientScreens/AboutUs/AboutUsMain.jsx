import React, { useState, useRef } from "react";
import {
  ImageBackground,
  Image,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import SideBarNavigation from "../../../components/PatientScreenComponents/SideBarNavigation";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../components/PatientScreenComponents/Header";
import BackButton from "../../../components/PatientScreenComponents/BackButton";

const AboutUsMain = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Toggle section expansion - removed type annotation
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const stats = [
    { value: "50K+", label: "Patients Treated", icon: "heart" },
    { value: "100+", label: "Specialist Doctors", icon: "people" },
    { value: "200+", label: "Patient Reviews", icon: "star" },
    { value: "30", label: "Medical Awards", icon: "trophy" },
  ];

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          <View style={styles.parent}>
            <View style={styles.Left}>
              <SideBarNavigation navigation={navigation} />
            </View>

            <View style={styles.Right}>
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* HERO */}
                <View style={styles.hero}>
                  {/* LEFT TEXT */}
                  <View style={styles.heroLeft}>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.breadcrumb}>BACK /</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={styles.bold}>ABOUT</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.heroTitle}>
                      Caring for{"\n"}
                      <Text style={styles.primary}>Your Heart</Text>
                      {"\n"}& Wellness
                    </Text>

                    <Text style={styles.heroText}>
                      Kokoro.Doctor is dedicated to making AI-powered {"\n"}
                      healthcare accessible to everyone — specializing in {"\n"}
                      cardiology and gynecology with compassion, precision,{" "}
                      {"\n"}
                      and innovation.
                    </Text>

                    <View style={styles.featureRow}>
                      <View style={styles.iconCircle}>
                        <Ionicons name="heart-outline" size={24} color="#fff" />
                      </View>

                      <Text style={styles.featureText}>
                        AI-Powered Heart Health Companion
                      </Text>
                    </View>
                  </View>

                  {/* RIGHT IMAGE */}
                  <View style={styles.heroRight}>
                    <Image
                      source={require("../../../assets/Images/aboutus_doctor.jpg")}
                      style={styles.heroImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* STATS BAR */}
                <View style={styles.statsBar}>
                  {stats.map((item, index) => (
                    <View key={index} style={styles.statBox}>
                      <Ionicons name={item.icon} size={30} color="#fff" />
                      <Text style={styles.statValue}>{item.value}</Text>
                      <Text style={styles.statLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                {/* MISSION / VISION */}
                <View style={styles.missionContainer}>
                  {/* LEFT - MISSION */}
                  <View style={styles.missionColumn}>
                    <Text style={styles.missionTitle}>
                      Our Mission — Cardiology
                    </Text>

                    <Text style={styles.missionText}>
                      Heart disease remains the leading cause of death globally.
                      We're on a mission to change that through early detection
                      and AI-driven insights.
                    </Text>

                    <View style={styles.bulletRow}>
                      <View style={styles.dot} />
                      <Text style={styles.bulletText}>
                        AI-powered cardiac risk assessment and early detection
                        tools
                      </Text>
                    </View>

                    <View style={styles.bulletRow}>
                      <View style={styles.dot} />
                      <Text style={styles.bulletText}>
                        24/7 heart health monitoring and personalized insights
                      </Text>
                    </View>

                    <View style={styles.bulletRow}>
                      <View style={styles.dot} />
                      <Text style={styles.bulletText}>
                        Connecting patients with top cardiologists for timely
                        consultations
                      </Text>
                    </View>

                    <Image
                      source={require("../../../assets/Images/aboutus_second.jpg")}
                      style={styles.missionImage}
                      resizeMode="cover"
                    />
                  </View>

                  {/* RIGHT - VISION */}
                  <View style={styles.missionColumn}>
                    <Text style={styles.missionTitle}>
                      Our Vision — Gynecology
                    </Text>

                    <Text style={styles.missionText}>
                      Millions of women struggle with timely access to
                      gynecological care. We envision a world where every woman
                      receives the support she deserves.
                    </Text>

                    <View style={styles.bulletRow}>
                      <View style={styles.dot} />
                      <Text style={styles.bulletText}>
                        Accessible women's health screenings and preventive care
                      </Text>
                    </View>

                    <View style={styles.bulletRow}>
                      <View style={styles.dot} />
                      <Text style={styles.bulletText}>
                        AI-assisted diagnostics for early gynecological
                        conditions
                      </Text>
                    </View>

                    <View style={styles.bulletRow}>
                      <View style={styles.dot} />
                      <Text style={styles.bulletText}>
                        Compassionate, private, and affordable care for all
                        women
                      </Text>
                    </View>

                    <Image
                      source={require("../../../assets/Images/aboutUs_third.jpg")}
                      style={styles.missionImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* OUR JOURNEY */}
                <View style={styles.journeySection}>
                  {/* LEFT IMAGE COLLAGE */}
                  <View style={styles.journeyImages}>
                    <Image
                      source={require("../../../assets/Images/AboutUS_Journey2.jpg")}
                      style={styles.journeyImg1}
                    />

                    <Image
                      source={require("../../../assets/Images/AboutUS_journey1.jpg")}
                      style={styles.journeyImg2}
                    />

                    <Image
                      source={require("../../../assets/Images/AboutUs_journey.jpg")}
                      style={styles.journeyImg3}
                    />
                  </View>

                  {/* RIGHT TEXT */}
                  <View style={styles.journeyText}>
                    <Text style={styles.journeyTitle}>Our Journey</Text>

                    <Text style={styles.journeyParagraph}>
                      Kokoro.Doctor was founded with a mission to make
                      AI-powered healthcare accessible to everyone, starting
                      with heart health and now extending into women's health
                      and gynecology. As an i-Lab Member at Harvard Innovation
                      Labs, our team bridges the gap between early detection and
                      timely medical action.
                    </Text>

                    <Text style={styles.journeyParagraph}>
                      With extensive research and cutting-edge technology, we
                      provide patients, doctors, and caregivers with supportive
                      tools for both cardiac and gynecological care — raising
                      awareness and delivering early insights when they matter
                      most.
                    </Text>
                  </View>
                </View>

                {/* OUR EXPERT TEAM */}
                <View style={styles.teamSection}>
                  <Text style={styles.teamTitle}>Our Expert Team</Text>

                  <Text style={styles.teamSubtitle}>
                    Meet the dedicated specialists committed to your heart and
                    wellness.
                  </Text>

                  <View style={styles.teamRow}>
                    {/* CARD 1 */}
                    <View style={styles.teamCard}>
                      <View style={styles.roleRow}>
                        <View style={styles.roleIndicator} />
                        <Text style={styles.roleText}>Co-Founder and CEO</Text>
                      </View>

                      <Text style={styles.memberName}>
                        Dr. Kislay Shrivastava
                      </Text>

                      <Text style={styles.memberRole}>
                        (Senior Cardiologist (MBBS, MD, DM Cardiology, AIIMS))
                      </Text>

                      <Text style={styles.memberExperience}>
                        22+ Years of Experience
                      </Text>
                    </View>

                    {/* CARD 2 */}
                    <View style={styles.teamCard}>
                      <View style={styles.roleRow}>
                        <View style={styles.roleIndicator} />
                        <Text style={styles.roleText}>Co-Founder and CTO</Text>
                      </View>

                      <Text style={styles.memberName}>
                        Mr. Ghanendra Shrivastava
                      </Text>

                      <Text style={styles.memberRole}>
                        (IIT R, Harvard HES, Director of AI and Engg)
                      </Text>

                      <Text style={styles.memberExperience}>
                        8+ Years of Experience
                      </Text>
                    </View>
                  </View>
                  {/* MENTORS */}
                </View>

                <View style={styles.mentorsSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIndicator} />
                    <Text style={styles.sectionHeaderText}>Mentors</Text>
                  </View>

                  <View style={styles.mentorsRow}>
                    <Text style={styles.mentorName}>Srinivas Babu</Text>
                    <Text style={styles.mentorName}>DJ Das</Text>
                    <Text style={styles.mentorName}>Prof. Jeremy Wei</Text>
                    <Text style={styles.mentorName}>
                      Prof. Mike Grandinneti
                    </Text>
                    <Text style={styles.mentorName}>Dr Arpita</Text>
                  </View>
                </View>

                {/* FOUNDING TEAM */}
                <View style={styles.foundingSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIndicator} />
                    <Text style={styles.sectionHeaderText}>Founding Team</Text>
                  </View>

                  <View style={styles.foundingGrid}>
                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>
                        Harsh Vardhan Khati
                      </Text>
                      <Text style={styles.foundingRole}>Product Manager</Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>Shobhit Bhatnagar</Text>
                      <Text style={styles.foundingRole}>
                        Front end Developer
                      </Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>Abhishek Tiwari</Text>
                      <Text style={styles.foundingRole}>
                        Front end Developer
                      </Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>Purva Agashe</Text>
                      <Text style={styles.foundingRole}>Designer</Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>Nitesh Kothari</Text>
                      <Text style={styles.foundingRole}>Backend Engineer</Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>
                        Karnika Shrivastava
                      </Text>
                      <Text style={styles.foundingRole}>Marketing</Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>Ashutosh Swarnkar</Text>
                      <Text style={styles.foundingRole}>
                        Associate Product Manager (APM)
                      </Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>
                        Manjesh Kummar Mishra
                      </Text>
                      <Text style={styles.foundingRole}>Data Scientist</Text>
                    </View>

                    <View style={styles.memberItem}>
                      <Text style={styles.foundingName}>Anmol Verma</Text>
                      <Text style={styles.foundingRole}>Operations</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {/* {(Platform.OS !== "web" || width < 1000) && (
        <ScrollView style={styles.mobileContainer} ref={scrollViewRef}>
          <StatusBar barStyle="light-content" backgroundColor="#f96166" />

          <Header navigation={navigation} />

          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              Caring for{"\n"}
              <Text style={styles.primary}>Your Heart</Text>
              {"\n"}& Wellness
            </Text>

            <Image
              source={require("../../../assets/Images/doctorwithtablet.png")}
              style={styles.heroImage}
            />
          </View>

          <View style={styles.statsBar}>
            {stats.map((item, index) => (
              <View key={index} style={styles.statBox}>
                <Ionicons name={item.icon} size={22} color="#fff" />
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )} */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },

  parent: {
    flexDirection: "row",
    width: "100%",
  },

  Left: {
    width: "15%",
  },

  Right: {
    width: "85%",
    color: "#fff",
  },

  scrollContainer: {
    paddingBottom: 40,
  },

  mobileContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    padding: 30,
    backgroundColor: "#f96166",
  },

  brandName: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },

  doctorText: {
    color: "#FFE5E8",
  },

  tagline: {
    fontSize: 22,
    color: "#fff",
  },

  hero: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 60,
    paddingTop: "8.8%",
    paddingBottom: "8.8%",
  },
  heroLeft: {
    width: "50%",
    paddingRight: 40,
  },

  heroRight: {
    width: "45%",
    alignItems: "flex-end",
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
  },

  iconCircle: {
    backgroundColor: "#f96166",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  breadcrumb: {
    fontSize: 18,
    color: "#777",
  },

  heroTitle: {
    fontSize: 70,
    fontWeight: "800",
    lineHeight: 80,
  },

  heroText: {
    marginTop: 20,
    fontSize: 20,
    color: "#666",
    lineHeight: 32,
    maxWidth: 500,
  },

  primary: {
    color: "#f96166",
    fontSize: 70,
    fontWeight: "800",
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  iconCircle: {
    backgroundColor: "#f96166",
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  featureText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  heroImage: {
    width: "100%",
    height: 460,
    borderRadius: 24,
  },

  statsBar: {
    backgroundColor: "#f96166",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 30,
  },

  statBox: {
    alignItems: "center",
    width: "25%",
  },

  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },

  statLabel: {
    color: "#fff",
    fontSize: 16,
  },

  section: {
    padding: 30,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  sectionText: {
    marginTop: 10,
    color: "#666",
  },

  sectionImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginTop: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    marginTop: 15,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#f96166",
    marginTop: 4,
  },

  cardText: {
    color: "#666",
    marginTop: 3,
  },

  bold: {
    fontSize: 18,
  },
  missionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 60,
    gap: 40,
  },

  missionColumn: {
    width: "48%",
    minHeight: 520,
    justifyContent: "space-between",
  },

  missionTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },

  missionText: {
    fontSize: 18,
    color: "#666",
    lineHeight: 28,
    marginBottom: 20,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f96166",
    marginTop: 8,
    marginRight: 12,
  },

  bulletText: {
    fontSize: 18,
    color: "#555",
    flex: 1,
  },

  missionImage: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginTop: 20,
    alignSelf: "flex-end",
  },
  journeySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 60,
    backgroundColor: "#f5f2f2",
  },

  journeyImages: {
    width: "45%",
    height: 400,
    position: "relative",
  },

  journeyImg1: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60%",
    height: 250,
    borderRadius: 25,
  },

  journeyImg2: {
    position: "absolute",

    top: 30,
    left: 260,
    width: "55%",
    height: 220,
    borderRadius: 25,
  },

  journeyImg3: {
    position: "absolute",
    bottom: 0,
    left: 80,
    width: "60%",
    height: 200,
    borderRadius: 25,
  },

  journeyText: {
    width: "45%",
    justifyContent: "center",
  },

  journeyTitle: {
    fontSize: 38,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },

  journeyParagraph: {
    fontSize: 18,
    color: "#666",
    lineHeight: 30,
    marginBottom: 20,
  },
  teamSection: {
    paddingVertical: 80,
    paddingHorizontal: 60,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  teamTitle: {
    fontSize: 40,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },

  teamSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    maxWidth: 600,
    marginBottom: 50,
    lineHeight: 28,
  },

  teamRow: {
    flexDirection: "row",
    gap: 40,
    width: "100%",
    justifyContent: "center",
  },

  teamCard: {
    width: "40%",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    padding: 35,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  roleIndicator: {
    width: 4,
    height: 20,
    backgroundColor: "#f96166",
    borderRadius: 2,
    marginRight: 10,
  },

  roleText: {
    fontSize: 16,
    color: "#666",
  },

  memberName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f96166",
    marginBottom: 6,
  },

  memberRole: {
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
  },

  memberExperience: {
    fontSize: 16,
    color: "#777",
  },
  mentorsSection: {
    paddingHorizontal: 60,
  },

  mentorsRow: {
    flexDirection: "row",
    gap: 30,
    marginTop: 15,
  },

  mentorName: {
    fontSize: 18,
    color: "#555",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionIndicator: {
    width: 4,
    height: 22,
    backgroundColor: "#f96166",
    borderRadius: 2,
    marginRight: 10,
  },

  sectionHeaderText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },

  foundingSection: {
    paddingHorizontal: 60,
    paddingTop: 40,
    paddingBottom: 40,
  },

  foundingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  memberItem: {
    width: "30%",
    marginBottom: 30,
  },

  foundingName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f96166",
    marginBottom: 5,
  },

  foundingRole: {
    fontSize: 16,
    color: "#666",
  },
});

export default AboutUsMain;
