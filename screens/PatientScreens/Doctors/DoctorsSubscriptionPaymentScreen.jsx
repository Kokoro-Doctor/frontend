import { useCallback, useState, useContext } from "react";
import {
  Alert,
  Image,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  Linking,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { MaterialIcons, Icon } from "react-native-vector-icons/MaterialIcons";
import { useChatbot } from "../../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import SideBarNavigation from "../../../components/PatientScreenComponents/SideBarNavigation";
import { AuthContext } from "../../../contexts/AuthContext";
import { payment_api } from "../../../utils/PaymentService";
import HeaderLoginSignUp from "../../../components/PatientScreenComponents/HeaderLoginSignUp";

const DoctorsSubscriptionPaymentScreen = ({ navigation, route }) => {
  //const [searchQuery, setSearchQuery] = useState("");
  const { setChatbotConfig } = useChatbot();
  const { width } = useWindowDimensions();
  const { user } = useContext(AuthContext);
  const doctors = route?.params?.doctors || {};

  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "32%" });
    }, [])
  );

  // const handleSearch = () => {
  //   Alert.alert(`Search Results for: ${searchQuery}`);
  // };

  const handleContinuePayment = async (amount) => {
    Alert.alert("Processing Payment", "Redirecting to payment gateway...");
    try {
      const paymentLink = await payment_api(amount);
      if (paymentLink) {
        Linking.openURL(paymentLink).catch((err) => {
          console.error("Failed to open payment link", err);
          Alert.alert(
            "Error",
            "Unable to open payment link. Please try again."
          );
        });
      }
    } catch (error) {
      Alert.alert("Payment Failed", error.message);
    }
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require("../../../assets/Images/MedicineBackground.png")}
              style={styles.imageBackground}
            >
              <View
                style={[
                  styles.overlay,
                  { backgroundColor: "rgba(16, 16, 16, 0.3)" },
                ]}
              />

              <View style={styles.parent}>
                {/* Sidebar navigation */}
                <View style={styles.Left}>
                  <SideBarNavigation navigation={navigation} />
                </View>

                <View style={styles.Right}>
                  {/* Header section */}
                  <View style={[styles.header, { height: "12%" }]}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View>

                  {/* Main content area */}
                  <View style={styles.contentContainer}>
                    {/* Payment confirmation card */}
                    <View style={styles.paymentCard}>
                      <View style={styles.paymentHeader}>
                        <TouchableOpacity
                          style={styles.backButton}
                          onPress={() => navigation.goBack()}
                        >
                          <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color="#000"
                          />
                        </TouchableOpacity>
                        <Text style={styles.paymentTitle}>Confirm and Pay</Text>
                      </View>

                      <View style={styles.doctorSection}>
                        <View style={styles.doctorsInfoSubscription}>
                          <Text style={styles.sectionLabel}>
                            Verified cardiologist online now
                          </Text>
                          <View style={styles.doctorInfo}>
                            <Image
                              source={doctors.profilePhoto}
                              style={styles.doctorAvatarImage}
                            />
                            <View style={styles.doctorDetails}>
                              <Text style={styles.doctorName}>
                                {doctors.doctorname}
                              </Text>
                              <Text style={styles.doctorSpecialization}>
                                {doctors.specialization}
                              </Text>
                              <Text style={styles.doctorExperience}>
                                {`${doctors.experience} Experience`}
                              </Text>
                              <View style={styles.locationSection}>
                                <Icon
                                  name="location-on"
                                  size={15}
                                  color="rgba(22, 128, 236, 0.75)"
                                  style={styles.icon}
                                />
                                <Text style={styles.locationText}>
                                  {doctors.location}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.subscriptionSection}>
                            <Text style={styles.metricsHead}>
                              Metrics Of Subscription
                            </Text>
                            <View style={styles.metricsBox}>
                              <View style={styles.metricsContent}>
                                <Icon
                                  name="star"
                                  size={13}
                                  color="rgba(22, 128, 236, 0.75)"
                                  style={styles.icon}
                                />
                                <Text style={styles.metricsTitle}>
                                  {" "}
                                  1 Free Regular check up
                                </Text>
                              </View>
                              <View style={styles.metricsContent}>
                                <Icon
                                  name="star"
                                  size={13}
                                  color="rgba(22, 128, 236, 0.75)"
                                  style={styles.icon}
                                />
                                <Text style={styles.metricsTitle}>
                                  {" "}
                                  1 free emergency checkup
                                </Text>
                              </View>
                              <View style={styles.metricsContent}>
                                <Icon
                                  name="star"
                                  size={13}
                                  color="rgba(22, 128, 236, 0.75)"
                                  style={styles.icon}
                                />
                                <Text style={styles.metricsTitle}>
                                  {" "}
                                  Medilocker
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View style={styles.verticalLine}></View>
                        <View style={styles.doctorSubscriptionDetails}>
                          <Text style={styles.subscriptionSummary}>
                            Subscription Summary
                          </Text>
                          <View style={styles.subscriptionFeesBox}>
                            <Text>Subscription Fees</Text>
                            <Text style={styles.feeAmount}>₹1999</Text>
                          </View>
                          <View style={styles.horizontalLine}></View>
                          <View style={styles.subscriptionFeesContainer}>
                            <Text>Total</Text>
                            <Text style={styles.feesAmount}>₹1999</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.paymentButton}
                            onPress={() => {
                              handleContinuePayment(1);
                            }}
                          >
                            <Text style={styles.paymentButtonText}>
                              Continue to payment
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}

      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.mobileContainerWrapper}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.mobileContainer}>
              {/* Header with back button and title */}
              <View style={styles.doctorInfoContainer}>
                <TouchableOpacity style={styles.profileButton}>
                  <Image
                    source={require("../../../assets/Images/dr_kislay.jpg")}
                    style={styles.profileImagei}
                  />
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
                <Text style={styles.doctorName}>Dr Kislay Shrivasatva</Text>
                <Text style={styles.doctorSpecialty}>(Cardiologist)</Text>
              </View>

              {/* Doctor Info Section */}
              <View style={styles.mobileHeader}>
                <Text style={styles.sectionTitle}>Appointment</Text>
              </View>

              {/* Patient Info Section */}
              <View style={styles.patientInfoCard}>
                <Text style={styles.sectionTitle}>Patient Info</Text>
                <View style={styles.patientInfo}>
                  <View style={styles.patientInfoRow}>
                    <Image
                      source={
                        user?.picture
                          ? { uri: user.picture }
                          : require("../../../assets/Images/user-icon.jpg")
                      }
                      style={styles.patientImage}
                    />
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>
                        {user?.name ? user?.name : "User"}
                      </Text>
                      <Text style={styles.noteText}>
                        Note: Please Upload Patient Details In the Drop Link
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.uploadButton}>
                    <Image
                      source={require("../../../assets/Images/Medilockerfile.jpg")}
                      style={{ width: 18, height: 18 }}
                    />

                    <Text style={styles.uploadButtonText}>
                      Upload from Medilocker
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Schedule Section */}
              <Text style={styles.sectionTitleOutside}>Schedule</Text>
              <View style={styles.scheduleContainer}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleHeaderText}>Time</Text>
                  <Text style={styles.scheduleHeaderText}>Date</Text>
                </View>
                <View style={styles.scheduleContent}>
                  <View style={styles.scheduleTimeContainer}>
                    <MaterialIcons name="access-time" size={18} color="#555" />
                    <Text style={styles.scheduleTimeText}>07:00</Text>
                  </View>
                  <View style={styles.scheduleDateContainer}>
                    <MaterialIcons name="event" size={18} color="#555" />
                    <Text style={styles.scheduleDateText}>17 Feb,2025</Text>
                  </View>
                </View>
              </View>

              {/* Payment Section */}
              <Text style={styles.sectionTitleOutside}>Payment</Text>
              <View style={styles.billDetails}>
                <Text style={styles.billTitle}>Bill Details</Text>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Consultation fees:</Text>
                  <Text style={styles.billValue}>₹800</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Booking Fee</Text>
                  <Text style={styles.billValue}>₹50</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Promo Applied:</Text>
                  <Text style={styles.billValue}>₹0</Text>
                </View>
                <View style={[styles.billRow, styles.totalRow]}>
                  <Text style={[styles.billLabel, styles.totalLabel]}>
                    Total Pay
                  </Text>
                  <Text style={[styles.billValue, styles.totalValue]}>
                    ₹850
                  </Text>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  handleContinuePayment(850);
                }}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  imageContainer: {
    height: "100%",
    width: "100%",
  },
  imageBackground: {
    flex: 1,
    height: "100%",
    width: "100%",
    borderWidth: 1,
    opacity: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  Left: {
    height: "100%",
    width: "15%",
    backgroundColor: "#f5f5f5",
  },
  Right: {
    height: "100%",
    width: "85%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    // borderWidth: 5,
    // borderColor: "black",
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
        marginBottom: 20,
      },
    }),
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileImagei: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(138, 112, 255, 0.8)",
    paddingVertical: 20,
    marginLeft: "5%",
    marginRight: "5%",
    marginBottom: "10%",
  },
  paymentCard: {
    width: "60%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: "2%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  backButton: {
    marginRight: 15,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  doctorSection: {
    //marginBottom: "2%",
    marginTop: "3%",
    //borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: "1%",
  },
  doctorsInfoSubscription: {
    minHeight: 300,
    width: "49%",
    //borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#000000",
    marginLeft: "10%",
    fontWeight: 500,
  },
  doctorInfo: {
    height: "40%",
    width: "100%",
    //borderWidth: 1,
    borderColor: "red",
    marginVertical: "5%",
    flexDirection: "row",
  },

  doctorAvatarImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "red",
    marginTop: "1%",
  },
  doctorDetails: {
    height: "100%",
    width: "85%",
    //borderWidth: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 500,
    //textAlign: "center",
    //marginTop: 10,
    marginLeft: "4%",
  },
  doctorSpecialization: {
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(136, 136, 136, 1)",
    marginLeft: "4%",
  },
  doctorExperience: {
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(136, 136, 136, 1)",
    marginLeft: "4%",
  },
  locationSection: {
    //borderWidth: 1,
    height: "30%",
    width: "90%",
    marginTop: "4%",
    marginLeft: "4%",
    flexDirection: "row",
  },
  icon: {
    marginTop: "1%",
  },
  locationText: {
    fontSize: 14,
    fontWeight: 500,
    color: "rgba(136, 136, 136, 1)",
    marginLeft: "2%",
  },
  subscriptionSection: {
    height: "37%",
    width: "75%",
    //borderWidth: 1,
    alignSelf: "center",
    backgroundColor: "rgba(246, 246, 246, 1)",
    borderRadius: 5,
  },
  metricsHead: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000000",
    marginLeft: "3%",
    marginTop: "1%",
  },
  metricsBox: {
    height: "65%",
    width: "80%",
    //borderWidth: 1,
    marginLeft: "4%",
    marginTop: "2%",
    flexDirection: "column",
    justifyContent: "space-around",
  },
  metricsContent: {
    height: "23%",
    width: "100%",
    //borderWidth: 1,
    flexDirection: "row",
  },
  verticalLine: {
    height: "100%",
    backgroundColor: "rgb(224, 224, 225)",
    width: "0.3%",
  },
  horizontalLine: {
    height: "0.3%",
    backgroundColor: "rgb(224, 224, 225)",
    width: "71%",
    marginTop: "3%",
    marginLeft: "9%",
  },
  doctorSubscriptionDetails: {
    minHeight: 300,
    width: "49%",
    //borderWidth: 1,
    marginLeft: "1%",
  },
  subscriptionSummary: {
    color: "rgba(255, 112, 114, 1)",
    fontSize: 16,
    fontWeight: 400,
    marginLeft: "10%",
    marginTop: "4%",
  },
  subscriptionFeesBox: {
    height: "12%",
    width: "70%",
    //borderWidth: 1,
    marginTop: "12%",
    marginLeft: "10%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subscriptionFeesContainer: {
    height: "12%",
    width: "70%",
    //borderWidth: 1,
    marginTop: "6%",
    marginLeft: "10%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  applicableText: {
    marginBottom: "4%",
    color: "#888888",
    fontSize: 10,
    fontWeight: 400,
  },

  feeAmount: {
    fontSize: 16,
    fontWeight: 400,
    color: "#000",
  },
  feesAmount: {
    fontSize: 16,
    fontWeight: 500,
    color: "#000",
  },
  paymentButton: {
    backgroundColor: "#ff7072",
    borderRadius: 5,
    paddingVertical: "3%",
    alignItems: "center",
    width: "75%",
    marginTop: "20%",
    marginLeft: "10%",
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  // Mobile styles
  mobileContainerWrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  mobileContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    paddingHorizontal: "5%",
    marginTop: 5,
    paddingTop: "1%",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mobileHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "1%",
    paddingHorizontal: "2%",
    width: "100%",
    marginBottom: "1%",
  },
  mobileHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: "4%",
  },
  doctorInfoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "5%",
    width: "100%",
  },

  doctorSpecialty: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  patientInfoCard: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: "4%",
    marginBottom: "2.5%",
    width: "100%",
    shadowColor: "#000",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    //backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: "3%",
    color: "#333",
  },
  sectionTitleOutside: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: "2%",
    marginTop: "2%",
    color: "#333",
  },
  patientInfoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: "3%",
  },
  patientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  patientDetails: {
    flex: 1,
    justifyContent: "center",
  },
  patientInfo: {
    display: "flex",
    flexDirection: "column",
    padding: "2.5%",
    width: "100%",
  },
  noteText: {
    fontSize: 14,
    color: "#ff7a7a",
    marginTop: "2%",
    width: "100%",
  },
  uploadButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: "2.5%",
    borderRadius: 25,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#DADADA",
    marginTop: "1.5%",
    width: "90%",
  },
  uploadButtonText: {
    color: "#333",
    marginLeft: 8,
    fontSize: 14,
  },
  scheduleContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: "2.5%",
    shadowColor: "#000",
    //overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#fff",
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "5%",
    paddingVertical: "3%",
    backgroundColor: "#fff",
  },
  scheduleHeaderText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  scheduleContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "5%",
    paddingVertical: "3%",
    backgroundColor: "#fff",
  },
  scheduleTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleTimeText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  scheduleDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleDateText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  billDetails: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "2.5%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    overflow: "hidden",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: "#fff",
  },
  billTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: "3%",
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  billRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "3%",
    paddingVertical: "2.5%",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    width: "100%",
  },
  billLabel: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  billValue: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },

  totalRow: {
    marginTop: 0,
    paddingTop: "2.5%",
    paddingBottom: "2.5%",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalValue: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  continueButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff7a7a",
    padding: "2%",
    borderRadius: 10,
    marginVertical: "6%",
    marginHorizontal: "5%",
    width: "90%",
    alignSelf: "center",
    ...Platform.select({
      web: {
        marginVertical: 0,
      },
    }),
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DoctorsSubscriptionPaymentScreen;
