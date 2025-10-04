import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { API_URL } from "../../../env-vars";
import { useAuth } from "../../../contexts/AuthContext";
import { useLinkTo } from "@react-navigation/native";

const DoctorAppointmentScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCounts, setSubscriberCounts] = useState({});
  const { user } = useAuth();
  const linkTo = useLinkTo();
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_URL}/doctorsService/fetchDoctors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        setDoctors(data.doctors || []);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      const counts = doctors.reduce((acc, doctor) => {
        acc[doctor.email] = doctor.subscribers?.length || 0;
        return acc;
      }, {});
      setSubscriberCounts(counts);
    }
  }, [doctors]);

  // const handleHeartButtonPress = (email) => {
  //   setSubscriberCounts((prev) => ({
  //     ...prev,
  //     [email]: (prev[email] || 0) + 1,
  //   }));
  // };

  const subscribeToDoctor = async (doctorEmail) => {
    try {
      const response = await fetch(`${API_URL}/doctorsService/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_email: doctorEmail,
          user_email: user.email,
        }),
      });

      const data = await response.json();
      alert(data.message);

      // Update the subscriber count locally
      setSubscriberCounts((prev) => ({
        ...prev,
        [doctorEmail]: prev[doctorEmail] || 0,
      }));

      // Find the doctor from the list
      const subscribedDoctor = doctors.find((doc) => doc.email === doctorEmail);

      // Add updated subscriber count to the doctor object
      const updatedDoctor = {
        ...subscribedDoctor,
        subscriberCount: (subscriberCounts[doctorEmail] || 0) + 1,
      };

      // navigation.navigate("DoctorsInfoWithBooking", {
      //   doctors: updatedDoctor,
      // });
      // linkTo(
      //   `/DoctorsInfoWithBooking?doctors=${encodeURIComponent(JSON.stringify(updatedDoctor))}`
      // );
      if (Platform.OS === "web") {
        const encoded = encodeURIComponent(JSON.stringify(updatedDoctor));
        window.history.pushState(
          {},
          "",
          `/DoctorsInfoWithBooking?doctors=${encoded}`
        );
        console.log(window.location.href);
      }
      navigation.navigate("DoctorsInfoWithBooking", {
        doctors: updatedDoctor,
      });
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <FlatList
            data={doctors}
            keyExtractor={(item, index) => item.email || index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  {/* Left Section - Doctor Details */}
                  <View style={styles.row}>
                    {/* <Image
                      source={{ uri: item.profilePhoto }}
                      style={styles.image}
                    /> */}
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("DoctorsInfoWithBooking", {
                          doctors: item,
                        })
                      }
                    >
                      <Image
                        source={{ uri: item.profilePhoto }}
                        style={styles.image}
                      />
                    </TouchableOpacity>

                    <View style={styles.infoContainer}>
                      {/* <View style={styles.infoBox}> */}
                      <View style={styles.info}>
                        <Text style={styles.name}>{item.doctorname}</Text>
                        <View style={styles.specializedExpBox}>
                          <Text style={styles.specialization}>
                            {item.specialization}
                          </Text>
                          <Text style={styles.experience}>
                            {`${item.experience} exp`}
                          </Text>
                        </View>
                        <View style={styles.addressSection}>
                          <Text style={styles.addressText}>
                            {item.location}
                          </Text>
                        </View>
                        <View style={styles.reviewSection}></View>
                      </View>
                      <View style={styles.verifiedContainer}>
                        <Image
                          source={require("../../../assets/Images/Medical_Council_of_India_Logo.png")}
                          style={styles.imageBox}
                        />
                        <Text style={styles.verifiedBox}>
                          <Text style={styles.verified}>Verified</Text>
                          <Text style={styles.by}>by</Text>
                          <Text style={styles.mci}> MCI</Text>
                        </Text>
                      </View>
                      <View style={styles.subscriberCount}>
                        <View style={styles.countBox}>
                          <TouchableOpacity
                            style={styles.heartButtonBox}
                            onPress={() => handleHeartButtonPress(item.email)}
                          >
                            <Image
                              source={require("../../../assets/Icons/heart1.png")}
                              style={styles.heartImage}
                            />
                          </TouchableOpacity>
                          <Text style={styles.numberText}>
                            {subscriberCounts[item.email]}
                          </Text>
                        </View>
                        <Text style={styles.subscriberCountText}>
                          Subscribers
                        </Text>
                      </View>
                      {/* </View> */}
                      {/* <View style={styles.descriptionContainer}>
                        <Text style={styles.description}>
                          {item.description}
                        </Text>
                      </View> */}
                    </View>
                  </View>

                  {/* Right Section - Slot Booking */}
                  <View style={styles.subscriptionSection}>
                    <View style={styles.subscriptionTextBox}>
                      <Text style={styles.priceText}>₹1999</Text>
                      <Text style={styles.feeText}>| Subscription Fee</Text>
                    </View>
                    <Pressable
                      style={[
                        styles.button,
                        (!user || !user.email) && { backgroundColor: "gray" },
                      ]}
                      onPress={() => {
                        if (!user || !user.email) {
                          alert("You must be logged in to Subscribe.");
                        } else {
                          subscribeToDoctor(item.email);
                        }
                      }}
                    >
                      <Text style={{ fontWeight: "600", color: "#FFFFFF" }}>
                        Subscribe
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.appContainer}>
          <View style={{ flex: 1 }}>
            <FlatList
              data={doctors}
              keyExtractor={(item, index) => item.email || index.toString()}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
              renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                  <View style={styles.cardBox}>
                    <View style={styles.cardHeaderInfo}>
                      <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() =>
                          navigation.navigate("DoctorsInfoWithBooking", {
                            doctors: item,
                          })
                        }
                      >
                        <Image
                          source={{ uri: item.profilePhoto }}
                          style={styles.image}
                        />
                      </TouchableOpacity>

                      <View style={styles.doctorDetails}>
                        <Text style={styles.name}>{item.doctorname}</Text>
                        <View style={styles.specializationBox}>
                          <View style={styles.specializationTextBox}>
                            <Text style={styles.specialization}>
                              {item.specialization}
                            </Text>
                            <Text style={styles.locationText}>
                              {item.location}
                            </Text>
                          </View>
                          <View style={styles.verifiedByMCI}>
                            <Image
                              source={require("../../../assets/Images/Medical_Council_of_India_Logo.png")}
                              style={styles.imageMCI}
                            />
                            <Text style={styles.verifiedBox}>
                              <Text style={styles.mobileVerified}>
                                Verified
                              </Text>
                              <Text style={styles.mobileBy}>by</Text>
                              <Text style={styles.mobileMCI}>MCI</Text>
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.rightContainer}>
                        <View style={styles.countBox}>
                          <TouchableOpacity
                            style={styles.heartButtonBox}
                            onPress={() => handleHeartButtonPress(item.id)}
                          >
                            <Image
                              source={require("../../../assets/Icons/heart1.png")}
                              style={styles.heartImage}
                            />
                          </TouchableOpacity>
                          <Text style={styles.numberText}>
                            {subscriberCounts[item.email]}
                          </Text>
                        </View>
                        <View style={styles.rating}>
                          <Image
                            source={require("../../../assets/Icons/Star.png")}
                            style={styles.starIcon}
                          />
                          <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.secondSection}>
                      <View style={styles.doctorInfo}>
                        <View style={styles.aboutDoc}>
                          <Text style={styles.aboutDocText}>About Doc</Text>
                          <View style={styles.descriptionContainer}>
                            <Text
                              style={styles.description}
                              numberOfLines={showFull ? null : 2}
                              ellipsizeMode="tail"
                            >
                              Specialized in {item.specialization}, with a
                              experience of {item.experience}.
                            </Text>

                            <TouchableOpacity
                              onPress={() => setShowFull(!showFull)}
                            >
                              <Text style={styles.knowMore}>
                                {showFull ? "Show less" : "Know more"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.verticalLine} />
                        <View style={styles.docFees}>
                          <Text style={styles.docFeesText}>
                            Subscription Fees
                          </Text>
                          <Text style={styles.feesText}>
                            1999 / Per month
                            {/* {item.consultationFees || `₹${item.fees || 0}`} */}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        // style={styles.button}
                        // onPress={() =>
                        //   navigation.navigate("DoctorsInfoWithRating", {
                        //     doctors: item,
                        //   })
                        // }
                        style={[
                          styles.button,
                          (!user || !user.email) && { backgroundColor: "gray" },
                        ]}
                        onPress={() => {
                          if (!user || !user.email) {
                            alert("You must be logged in to Subscribe.");
                          } else {
                            // navigation.push("DoctorsInfoWithRating");
                            //navigation.navigate("DoctorsInfoWithRating");
                            subscribeToDoctor(item.email);
                          }
                        }}
                      >
                        <Text style={styles.buttonText}>Subscribe</Text>
                        <Image
                          source={require("../../../assets/Icons/arrow.png")}
                          style={styles.arrowIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      )}
    </>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: "100%",
    Width: "100%",
    backgroundColor: "#f8f8f8",
    padding: 10,
    flexDirection: "column",
  },
  //App design Start

  appContainer: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  cardContainer: {
    height: 195,
    width: "99%",
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 14,
    backgroundColor: "#fff",
    alignSelf: "center",
    boxShadow: " 0px 0px 4px 1px rgba(17, 16, 16, 0.25)",
    padding: "0.5%",
    borderColor: "#dcdcdc",
    ...Platform.select({
      web: {
        height: windowWidth > 1000 ? 195 : 308,
      },
    }),
  },
  cardBox: {
    flexDirection: "column",
    ...Platform.select({
      web: {
        flexDirection: "column",
      },
    }),
  },
  cardHeaderInfo: {
    height: "37%",
    width: "100%",
    //borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    ...Platform.select({
      web: {
        height: "34%",
        //borderWidth:1
      },
    }),
  },
  doctorImage: {
    height: 47,
    width: 57,
    borderRadius: 40,
    marginVertical: "1%",
  },
  doctorDetails: {
    height: "100%",
    width: "56%",
    //borderWidth: 1,
    alignSelf: "center",
    marginRight: "11%",
    paddingLeft: "1%",
    ...Platform.select({
      web: {
        //borderWidth:1,
        height: "82%",
      },
    }),
  },

  rating: {
    height: "30%",
    width: "47%",
    //borderWidth: 1,
    marginVertical: "3%",
    borderRadius: 7,
    boxShadow: " 0px 0px 4px 0px rgba(0, 0, 0, 0.25)",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginRight: "20%",
  },
  starIcon: {
    height: 13,
    width: 13,
    alignSelf: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 400,
    alignSelf: "center",
  },
  secondSection: {
    height: "61%",
    width: "90%",
    //borderWidth: 1,
    alignSelf: "center",
    backgroundColor: " rgb(244, 243, 243)",
    borderRadius: 10,
    padding: "2%",
    marginVertical: "0.5%",
    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px;",
    ...Platform.select({
      web: {
        width: "90%",
        height: windowWidth > 1000 ? "40%" : "70%",
        bottom: windowWidth > 1000 ? "10%" : "0%",
        marginTop: windowWidth > 1000 ? "0%" : "3%",
        // marginTop: "0%",
        borderWidth: windowWidth > 1000 ? 1 : 0,
        padding: windowWidth > 1000 ? "0%" : "5%",
      },
    }),
  },
  doctorInfo: {
    height: "71%",
    width: "100%",
    //borderWidth: 1,
    alignSelf: "center",
    flexDirection: "row",
    paddingHorizontal: "2%",
  },
  aboutDoc: {
    height: "104%",
    width: "50%",
    //borderWidth: 1,
    flexDirection: "column",
    ...Platform.select({
      web: {
        flexDirection: "column",
        padding: "1%",
        //borderWidth:1,
        height: "104%",
      },
    }),
  },
  aboutDocText: {
    fontSize: 13,
    fontWeight: 500,
  },
  aboutDocDetails: {
    fontSize: 10,
    fontWeight: 400,
  },

  docFees: {
    height: "100%",
    width: "50%",
    //borderWidth: 1,
  },
  docFeesText: {
    paddingHorizontal: "5%",
    fontSize: 13,
    fontWeight: 500,
  },
  feesText: {
    fontSize: 13,
    fontWeight: 400,
    color: " rgb(62, 145, 229)",
    paddingHorizontal: "5%",
    paddingVertical: "5%",
  },
  verticalLine: {
    height: "90%",
    width: "0.7%",
    //borderWidth:1,
    alignSelf: "center",
    backgroundColor: "rgba(56, 55, 55, 0.12)",
  },
  //App style end

  card: {
    ...Platform.select({
      web: {
        marginBottom: "0.5%",
        paddingVertical: "0.5%",
        borderRadius: 5,
        //borderWidth: 2,
        borderColor: "#000000",
        height: "97%",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        backgroundColor: "#FFFFFF",
        width: "98%",
        alignSelf: "center",
      },
    }),
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //borderWidth: 1,
    height: "100%",
    borderColor: "red",
    padding: "0.3%",
  },
  row: {
    flexDirection: "row",
    //alignItems: "center",
    //borderWidth: 1,
    borderColor: "#000000",
    width: "80%",
    height: "100%",
    //marginHorizontal: "1%",
    padding: "0.4%",
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "17%",
    height: "89%",
    //borderWidth: 1,
    marginHorizontal: "1%",
    ...Platform.select({
      web: {
        width: "21%",
        height: "65%",
        //borderWidth: 1,
        marginHorizontal: "1%",
      },
    }),
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginHorizontal: "1%",
    ...Platform.select({
      web: {
        width: 70,
        height: 70,
        borderRadius: 50,
      },
    }),
  },
  infoContainer: {
    //flex: 1,
    //borderWidth: 2,
    borderColor: "#000000",
    width: "91%",
    //borderColor: "blue",
    padding: "0.5%",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  info: {
    //borderWidth: 1,
    borderColor: "#000000",
    width: "56%",
    height: "100%",
  },

  name: {
    fontSize: 15,
    fontWeight: 600,
    ...Platform.select({
      web: {
        fontSize: 16,
        fontWeight: 600,
      },
    }),
  },
  specializedExpBox: {
    height: "25%",
    width: "100%",
    //borderWidth: 1,
    borderColor: "red",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  specializationBox: {
    //borderWidth: 1,
    height: "68%",
    flexDirection: "row",
  },
  specializationTextBox: {
    //borderWidth: 1,
    width: "60%",
    height: "100%",
    borderColor: "#adff2f",
    flexDirection:"column",
    ...Platform.select({
      web: {
        width: windowWidth > 1000 ? "60%" : "65%",
      },
    }),
  },
  specialization: {
    fontSize: 12,
    fontWeight: 600,
    color: "#000",
    ...Platform.select({
      web: {
        fontSize: 13,
        fontWeight: 500,
        color: "#444444",
      },
    }),
  },
  locationText:{
   fontSize:11,
   fontWeight:400,
   color:"#444444"
  },
  experience: {
    fontSize: 13,
    fontWeight: 500,
    color: "#444444",
    marginRight: "15%",
  },
  addressSection: {
    height: "28%",
    width: "100%",
    //borderWidth: 1,
  },
  addressText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#rgba(136, 136, 136, 1)",
  },
  reviewSection: {
    height: "20%",
    width: "30%",
    //borderWidth: 1,
  },
  verifiedByMCI: {
    //borderWidth: 1,
    width: "40%",
    height: "40%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  imageMCI: {
    height: 10,
    width: 10,
    marginVertical: "3%",
    marginHorizontal: "2%",
  },

  verifiedContainer: {
    width: "20%",
    flexDirection: "row",
    //borderWidth: 1,
    borderColor: "purple",
    paddingVertical: "0.5%",
    justifyContent: "space-around",
  },
  imageBox: {
    height: 21,
    width: 21,
  },
  verifiedBox: {
    //borderWidth: 1,
    height: "80%",
    width: "70%",
    justifyContent: "space-evenly",
    alignSelf: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        flexDirection: "row",
        //borderWidth: 1,
        borderColor: "#000000",
        width: "70%",
        height: "25%",
        marginBottom: "39%",
      },
    }),
  },
  mobileVerified: {
    fontSize: 7,
    fontWeight: 300,
    color: "green",
    //alignSelf:"center"
  },
  mobileBy: {
    fontSize: 7,
    fontWeight: 300,
    //alignSelf:"center"
  },
  mobileMCI: {
    fontSize: 7,
    fontWeight: 300,
    color: "#FF7373",
    //alignSelf:"center"
  },
  verified: {
    fontSize: 12,
    color: "green",
    paddingVertical: "5%",
    paddingHorizontal: "3%",
    fontWeight: 300,
  },
  by: {
    fontSize: 12,
    fontWeight: 300,
  },
  mci: {
    color: "#FF7373",
    fontSize: 12,
    fontWeight: 300,
  },
  rightContainer: {
    //borderWidth: 1,
    width: "25%",
    right: "10%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  // subscribeRatingBox: {
  //   borderWidth: 1,
  //   width: "16%",
  //   flexDirection:"row",
  //   justifyContent:"space-around",
  //   marginRight:"8%"
  // },
  subscriberCount: {
    width: "15%",
    //borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  countBox: {
    //borderWidth: 1,
    borderColor: "blue",
    height: "75%",
    width: "45%",
    marginTop: "3%",
    ...Platform.select({
      web: {
        height: "100%",
        width: "30%",
        //borderWidth: 1,
        borderColor: "blue",
        alignSelf: "center",
        flexDirection: "column",
      },
    }),
  },
  heartButtonBox: {
    height: "33%",
    width: "79%",
    //borderWidth: 1,
    alignSelf: "center",
  },
  heartImage: {
    height: 22,
    width: 24.5,
    alignSelf: "center",
    ...Platform.select({
      web: {
        height: 17,
        width: 19,
        marginTop: "3%",
      },
    }),
  },
  numberText: {
    fontSize: 13,
    fontWeight: 400,
    color: "#000000",
    alignSelf: "center",
  },
  subscriberCountText: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000000",
    marginVertical: "3.5%",
  },
  descriptionContainer: {
    height: "auto",
    width: "100%",
    //borderWidth: 1,
    flexDirection: "column",
    ...Platform.select({
      web: {
        //borderWidth: 1,
        // borderColor: "#000000",
        width: "95%",
        flexDirection: "column",
        //justifyContent: "space-around",
      },
    }),
  },
  description: {
    fontSize: 10,
    fontWeight: 500,
    color: "#000",
    ...Platform.select({
      web: {
        fontSize: 10,
        marginTop: "1%",
      },
    }),
  },
  knowMore: {
    alignSelf: "flex-end",
    fontSize: 11,
    fontWeight: 400,
    color: "#2C00D9",
    paddingRight: "2%",
    //marginBottom:"10%"
  },
  subscriptionSection: {
    //borderWidth: 1,
    borderColor: "#000",
    flexDirection: "column",
    marginRight: "2%",
    width: "17%",
    height: "100%",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;",
    alignItems: "center",
  },
  subscriptionTextBox: {
    height: "20%",
    width: "95%",
    //borderWidth:1,
    marginTop: "17%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  priceText: {
    //fontFamily:"Annapurna SIL",
    fontSize: 16,
    fontWeight: 500,
    color: "#000000",
    marginLeft: "5%",
  },
  feeText: {
    fontSize: 11,
    fontWeight: 400,
    color: "#888888",
    marginRight: "8%",
  },
  button: {
    marginHorizontal: "3%",
    backgroundColor: "rgb(243, 119, 119)",
    height: "27%",
    width: "55%",
    borderRadius: 8,
    marginVertical: "2.2%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
    ...Platform.select({
      web: {
        marginHorizontal: "3%",
        backgroundColor: "#FF7373",
        height: "27%",
        width: "95%",
        borderRadius: 6,
        marginTop: "3%",
        justifyContent: "center",
        alignItems: "center",
      },
    }),
  },
  buttonText: {
    color: "#fff",
  },
  arrowIcon: {
    height: 11,
    width: 9,
    marginHorizontal: "5%",
  },
});

export default DoctorAppointmentScreen;
