import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  useWindowDimensions,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SideBarNavigation from "../../../components/PatientScreenComponents/SideBarNavigation";
import HeaderLoginSignUp from "../../../components/PatientScreenComponents/HeaderLoginSignUp";
import { payment_api } from "../../../utils/PaymentService";
import { useLoginModal } from "../../../contexts/LoginModalContext";
import { useAuth } from "../../../contexts/AuthContext";

const { width, height } = Dimensions.get("window");

const features = [
  "1 Free Regular check up",
  "1 free emergency checkup",
  "Medilocker",
];

const DoctorsInfoWithSubscription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  // const doctors = route?.params?.doctors || {};
  const [doctors, setDoctors] = useState(route.params?.doctors || null);
  const [isReady, setIsReady] = useState(false); // Delay rendering
  const { user } = useAuth();
  const { triggerLoginModal } = useLoginModal();

  useEffect(() => {
    const tryParseDoctorFromUrl = () => {
      try {
        let encodedDoctor = null;

        // 👇 Works both on Web and Native
        if (Platform.OS === "web") {
          const urlObj = new URL(window.location.href);
          encodedDoctor = urlObj.searchParams.get("doctors");
        } else {
          // For native: still fallback to Linking.getInitialURL
          Linking.getInitialURL().then((url) => {
            if (url && url.includes("DoctorsInfoWithSubscription")) {
              const urlObj = new URL(url);
              const encoded = urlObj.searchParams.get("doctors");
              if (encoded) {
                const parsed = JSON.parse(decodeURIComponent(encoded));
                setDoctors(parsed);
                setIsReady(true);
              }
            }
          });
          return;
        }

        if (encodedDoctor) {
          const decoded = decodeURIComponent(encodedDoctor);
          const parsed = JSON.parse(decoded);
          setDoctors(parsed);
        }
      } catch (err) {
        console.error("Error parsing doctor from URL:", err);
      } finally {
        setIsReady(true);
      }
    };

    if (!doctors) {
      tryParseDoctorFromUrl();
    } else {
      setIsReady(true);
    }
  }, [doctors]);

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

  const handleSubscribeClick = () => {
    if (!user) {
      // opens the actual login modal controlled by HeaderLoginSignUp
      triggerLoginModal({ mode: "login" });
      return;
    }

    // already logged in → go to payment
    // navigation.navigate("PatientAppNavigation", {
    //   screen: "DoctorsSubscriptionPaymentScreen",
    //   params: { doctors },
    // });
    navigation.navigate("DoctorsSubscriptionPaymentScreen", {
      params: { doctors },
    });
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
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
                {/* Keeping the existing sidebar navigation as requested */}
                <View style={styles.Left}>
                  <SideBarNavigation navigation={navigation} />
                </View>

                <View style={styles.Right}>
                  <View style={[styles.header, { height: "12%" }]}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View>

                  <View style={styles.contentContainer}>
                    {/* Doctor profile card */}
                    <View style={styles.doctorProfileCard}>
                      <View style={styles.doctorProfileDetail}>
                        <View style={styles.doctorLeftSection}>
                          <Image
                            source={doctors.profilePhoto}
                            style={styles.doctorImage}
                          />
                          <View style={styles.ratingContainer}>
                            <MaterialIcons
                              name="star"
                              size={20}
                              color="#FFD700"
                            />
                            <Text style={styles.ratingText}>{"4.5"}</Text>
                          </View>
                        </View>
                        <View style={styles.doctorInfoSection}>
                          <Text style={styles.doctorName}>
                            {doctors.doctorname}
                          </Text>
                          <Text style={styles.doctorCredentials}>
                            {doctors.specialization}
                          </Text>
                          <Text style={styles.doctorExperience}>
                            {`${doctors.experience} experience`}
                          </Text>
                          <Text style={styles.doctorBio}>
                            {doctors.description}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewsSection}>
                        <Text style={styles.reviewsTitle}>User Reviews</Text>

                        <View style={styles.reviewsList}>
                          {Array.isArray(doctors?.reviews) &&
                            doctors.reviews.map((review, index) => (
                              <View key={index} style={styles.reviewCard}>
                                <View style={styles.reviewTextBox}>
                                  <ScrollView
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={false}
                                  >
                                    <Text style={styles.reviewText}>
                                      {review.comment}
                                    </Text>
                                  </ScrollView>
                                </View>

                                <View style={styles.reviewerContainer}>
                                  {[...Array(5)].map((_, i) => (
                                    <MaterialIcons
                                      key={i}
                                      name={
                                        i + 1 <= review.rating
                                          ? "star"
                                          : i + 0.5 <= review.rating
                                          ? "star-half"
                                          : "star-border"
                                      }
                                      size={16}
                                      color="#FFD700"
                                    />
                                  ))}
                                  <Text style={styles.reviewerName}>
                                    {review.reviewer}
                                  </Text>
                                </View>
                              </View>
                            ))}
                        </View>
                      </View>
                    </View>

                    {/* Appointment booking section */}
                    <View style={styles.subscriptionSection}>
                      <View style={styles.subscriptionTextHead}>
                        <Text style={styles.subscriptionTextTitle}>
                          To Book Slot of Doctor you have to first subscribe
                          them .{" "}
                        </Text>
                      </View>
                      <View style={styles.subscriptionMetricsBox}>
                        <Text style={styles.metricsTitle}>
                          Metrics Of Subscription
                        </Text>
                        <Text style={styles.metricsTitle}>
                          {" "}
                          1 Free Regular check up
                        </Text>
                        <Text style={styles.metricsTitle}>
                          {" "}
                          1 free emergency checkup
                        </Text>
                        <Text style={styles.metricsTitle}> Medilocker</Text>
                      </View>
                      <View style={styles.subscriptionButtonContainer}>
                        <View style={styles.subscriptionTextBox}>
                          <Text style={styles.priceText}>₹1999</Text>
                          <Text style={styles.feeText}>| Subscription Fee</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.subscribeButton}
                          // onPress={() =>
                          //   navigation.navigate("Doctors", {
                          //     screen: "DoctorsSubscriptionPaymentScreen",
                          //     params: { doctors },
                          //   })
                          // }
                          onPress={handleSubscribeClick}
                        >
                          <Text style={styles.subscribeButtonText}>
                            Subscribe Doctor
                          </Text>
                        </TouchableOpacity>
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
        <View style={styles.appContainer}>
          <ScrollView>
            <StatusBar barStyle="light-content" backgroundColor="#fff" />

            <View style={styles.appImageContainer}>
              <Image
                source={{ uri: doctors.profilePhoto }}
                style={styles.doctorImage}
              />
              <View style={styles.doctornamebox}>
                <Text style={styles.doctorName}>{doctors.doctorname}</Text>
              </View>
              <View style={styles.doctornamebox}>
                <Text style={styles.doctorCredentials}>
                  ({doctors.specialization})
                </Text>
              </View>
            </View>
            <View style={styles.doctorDescription}>
              <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.descriptionText}>
                  {doctors.description}
                </Text>
              </ScrollView>
            </View>
            <View style={styles.experienceRatingContainer}>
              <View style={styles.experienceSection}>
                <Image
                  source={require("../../../assets/Icons/doctorTool.png")}
                  style={styles.doctorIcon}
                />
                <View style={styles.experienceDetail}>
                  <Text style={styles.experienceText}>Total Experience</Text>
                  <Text style={styles.experience}>{doctors.experience}</Text>
                </View>
              </View>
              <View style={styles.verticalLine} />
              <View style={styles.ratingSection}>
                <Image
                  source={require("../../../assets/Icons/Star.png")}
                  style={styles.doctorIcon}
                />
                <TouchableOpacity style={styles.ratingDetail}>
                  <Text style={styles.ratingText}>Rating & Reviews</Text>
                  <Text style={styles.rating}>4.9 (5000) </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.firsttext}>
              <Text style={styles.firstTextstyle}>
                To Book Slot Of the Doctor you have to
              </Text>
              <Text style={styles.firstTextstyle}>first subscribe them.</Text>
            </View>

            <View style={styles.container}>
              <View style={styles.card}>
                <Text style={styles.title}>Metrics Of subscription</Text>
                {features.map((item, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Image
                      source={require("../../../assets/Icons/icostarr.png")}
                    ></Image>
                    <Text style={styles.featureText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.feeSection}>
                <View style={styles.rupees}>
                  <Image
                    source={require("../../../assets/Icons/rs.png")}
                    style={styles.rupeeImg}
                  />
                </View>

                <Text style={styles.price}>1999</Text>

                <View style={styles.line}></View>

                <Text style={styles.feeLabel}>Subscription fees</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.bookAppointmentButton}>
              <Text
                style={styles.bookAppointmentText}
                onPress={() => {
                  handleContinuePayment(1);
                }}
              >
                Subscribe
              </Text>
            </TouchableOpacity>
            {/* </View> */}
          </ScrollView>
        </View>
      )}
    </>
  );
};

const windowWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#F6F6F6",
    borderRadius: 10,
    padding: "2%",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: "#333",

    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  feeSection: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 6,
    backgroundColor: "#F6F6F6",
    paddingVertical: 12,
    gap: 20,
  },
  rupees: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
  },
  rupeeImg: {
    width: 15,
    height: 15,
    resizeMode: "contain",
  },
  currency: {
    fontSize: 18,
    color: "#007BFF",
    marginRight: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  line: {
    height: "100%",
    borderWidth: 1,
    borderColor: "#9B9A9A",
  },
  feeLabel: {
    fontSize: 14,
    color: "#666",
  },
  appContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  appImageContainer: {
    width: "75%",
    //borderWidth: 1,
    marginVertical: "6%",
    alignSelf: "center",
    marginBottom: "3%",
  },
  doctorImage: {
    height: 90,
    width: 90,
    alignSelf: "center",
    borderRadius: 40,
    ...Platform.select({
      web: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
      },
    }),
  },
  doctornamebox: {
    alignSelf: "center",
  },

  doctorName: {
    fontSize: 22,
    fontWeight: 600,
    color: "#000000",
    alignSelf: "center",
    ...Platform.select({
      web: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",

        alignSelf: windowWidth > 1000 ? "flex-start" : "center",
      },
    }),
  },
  doctorCredentials: {
    fontSize: 14,
    alignSelf: "center",
    fontWeight: 600,
    ...Platform.select({
      web: {
        fontSize: 14,
        // color: "#666",
        marginTop: 2,
        fontWeight: windowWidth < 1000 ? "bold" : "normal",
        //alignSelf: "flex-start",
        alignSelf: windowWidth > 1000 ? "flex-start" : "center",
      },
    }),
  },
  doctorDescription: {
    //borderWidth: 1,
    height: "18%",
    width: "88%",
    alignSelf: "center",
    marginBottom: "6%",
    borderRadius: 5,
    boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
  },
  descriptionText: {
    textAlign: "justify",
    padding: "1%",
    //fontStyle:"italic",
  },
  experienceRatingContainer: {
    height: "7%",
    width: "88%",
    //borderWidth: 1,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 5,
    boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
    backgroundColor: "rgba(255, 252, 252, 1)",
    padding: "1%",
    ...Platform.select({
      web: {
        minHeight: 60, // Ensures visibility in web view
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderWidth: 1,
        borderColor: "#ddd",
        boxShadow: " 0px 0px 4px 3px rgba(0, 0, 0, 0.25)",
        // marginTop: "-165%",
      },
    }),
  },
  experienceSection: {
    height: "100%",
    width: "49%",
    //borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  doctorIcon: {
    alignSelf: "center",
    height: 26,
    width: 26,
    marginHorizontal: "2%",
    borderRadius: 50,
  },
  experienceDetail: {
    height: "94%",
    width: "78%",
    //borderWidth: 1,
    alignSelf: "center",
    flexDirection: "column",
  },
  experienceText: {
    fontSize: 14,
    fontWeight: 600,
    color: " rgb(94, 93, 93)",
    paddingHorizontal: "4%",
  },
  experience: {
    fontSize: 14,
    fontWeight: 600,
    color: "#000000",
    paddingHorizontal: "4%",
  },
  verticalLine: {
    height: "75%",
    width: "0.4%",
    //borderWidth:1,
    alignSelf: "center",
    backgroundColor: "#000000",
  },
  ratingSection: {
    height: "100%",
    width: "48.8%",
    //borderWidth: 1,
    flexDirection: "row",
  },
  ratingDetail: {
    ...Platform.select({
      web: {
        flexDirection: "column",
        width: "80%",
        //borderWidth:1
      },
    }),
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 600,
    color: " rgb(94, 93, 93)",
    paddingHorizontal: "4%",
    ...Platform.select({
      web: {
        marginLeft: "1%",
        fontSize: 14,
        fontWeight: 600,
      },
    }),
  },
  rating: {
    fontSize: 14,
    fontWeight: 600,
    color: "#000000",
    alignSelf: "center",
  },
  bookAppointmentText: {
    alignSelf: "center",
    paddingVertical: "2.5%",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
  },
  bookAppointmentButton: {
    height: "4%",
    width: "70%",
    //borderWidth: 1,
    alignSelf: "center",
    borderRadius: 8,
    backgroundColor: "rgb(237, 109, 111)",
    marginTop: "5%",
  },
  firsttext: {
    padding: "5%",
  },
  firstTextstyle: {
    fontSize: 18,
  },

  webContainer: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },

  imageContainer: {
    height: "100%",
    width: "100%",
    //borderWidth: 1,
    marginVertical: "10%",
    alignSelf: "center",
  },

  feesBox: {
    height: "90%",
    width: "60%",
    //borderWidth: 1,
    marginHorizontal: "3.5%",
    alignSelf: "center",
    flexDirection: "column",
  },
  fees: {
    fontSize: 16,
    fontWeight: 600,
    color: "#000000",
    paddingVertical: "1%",
  },
  feesText: {
    fontSize: 14,
    fontWeight: 600,
    color: " rgb(94, 93, 93)",
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
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(138, 112, 255, 0.8)",
    marginBottom: "10%",
    borderRadius: 20,
    overflow: "hidden",
    width: "90%",
    marginHorizontal: "5%",
    padding: "1%",
  },
  doctorProfileCard: {
    width: "60%",
    height: "90%",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: "2%",
    margin: "2%",
    justifyContent: "space-between",
  },
  doctorProfileDetail: {
    height: "72%",
    width: "100%",
    //borderWidth: 1,
    flexDirection: "row",
  },
  doctorLeftSection: {
    width: "20%",
    height: "48%",
    alignItems: "center",
    // borderWidth: 1,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  doctorInfoSection: {
    width: "80%",
    height: "85%",
    paddingLeft: "1%",
    //borderWidth: 1,
  },

  doctorExperience: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginBottom: 10,
  },
  doctorBio: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 15,
  },
  reviewsSection: {
    //borderWidth: 1,
    height: "40%",
    bottom: "10%",
  },
  reviewsTitle: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 10,
  },
  reviewsList: {
    flexDirection: "row",
    justifyContent: "space-around",
    //borderWidth: 1,
    borderColor: "red",
    height: "80%",
  },
  reviewCard: {
    height: "100%",
    width: "30%",
    backgroundColor: "#ffebee",
    borderRadius: 10,
    padding: "1%",
  },
  reviewTextBox: {
    height: "80%",
    width: "100%",
    // borderWidth: 1,
  },
  reviewText: {
    fontSize: 13,
    color: "#000",
    marginBottom: "3%",
    //fontFamily: "Alex Brush",
    fontWeight: 400,
    fontStyle: "italic",
  },
  reviewerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "2%",
    // borderWidth: 1,
  },
  reviewerName: {
    fontSize: 12,
    color: "#666",
    marginLeft: "2%",
  },
  subscriptionSection: {
    width: "30%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: "2%",
    marginLeft: "5%",
    //padding: "2%",
  },
  subscriptionTextHead: {
    height: "10%",
    width: "70%",
    //borderWidth: 1,
    marginTop: "20%",
    marginLeft: "8%",
  },
  subscriptionTextTitle: {
    fontSize: 14,
    fontWeight: 400,
    color: "#000000",
  },
  subscriptionMetricsBox: {
    height: "27%",
    width: "85%",
    //borderWidth: 1,
    backgroundColor: "#F6F6F6",
    borderRadius: 5,
    alignSelf: "center",
    marginTop: "1%",
  },
  metricsTitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "#000000",
    marginLeft: "3%",
    marginTop: "1%",
  },
  subscriptionButtonContainer: {
    height: "25%",
    width: "85%",
    //borderWidth: 1,
    alignSelf: "center",
    alignItems: "center",
    marginTop: "10%",
    flexDirection: "column",
    //justifyContent:"space-around"
  },
  subscriptionTextBox: {
    height: "20%",
    width: "80%",
    //borderWidth: 1,
    marginTop: "10%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  priceText: {
    //fontFamily:"Annapurna SIL",
    fontSize: 16,
    fontWeight: 500,
    color: "#000000",
    marginLeft: "18%",
  },
  feeText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#888888",
    marginRight: "15%",
  },
  subscribeButton: {
    height: "24%",
    width: "80%",
    //borderWidth: 1,
    marginTop: "2%",
    backgroundColor: "#FF7072",
    borderRadius: 5,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
    alignSelf: "center",
    fontStyle: "Medium",
    padding: "1%",
  },
});

export default DoctorsInfoWithSubscription;
