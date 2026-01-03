import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  Text,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../../env-vars";
import { useAuth } from "../../contexts/AuthContext";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import SubscriberCard from "../../components/DoctorsPortalComponents/SubscriberCard";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";

const DoctorsSubscribers = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const { setChatbotConfig } = useChatbot();
  const { user } = useAuth();
  const doctorId = user?.doctor_id;
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig])
  );

  useEffect(() => {
    console.log("🧠 Auth user from context:", user);
    console.log("🩺 Derived doctorId:", doctorId);

    if (!doctorId) {
      console.warn("❌ doctorId not available yet");
      return;
    }

    fetchSubscribers();
  }, [doctorId]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);

      console.log("🚀 Fetching subscribers for doctor:", doctorId);
      console.log(
        "📡 URL:",
        `${API_URL}/booking/doctors/${doctorId}/subscribers`
      );

      // 1️⃣ Fetch subscriptions
      const subRes = await fetch(
        `${API_URL}/booking/doctors/${doctorId}/subscribers`
      );

      console.log("📥 Subscription response status:", subRes.status);

      const subscriptions = await subRes.json();
      console.log("📦 Raw subscriptions response:", subscriptions);

      if (!Array.isArray(subscriptions)) {
        console.error("❌ Subscriptions is NOT an array:", subscriptions);
        setSubscribers([]);
        return;
      }

      console.log("✅ Total subscriptions:", subscriptions.length);

      // 2️⃣ Fetch user details
      // const usersWithDetails = await Promise.all(
      //   subscriptions

      //     .map(async (sub) => {
      //       try {
      //         console.log("👤 Fetching user for user_id:", sub.user_id);
      //         console.log("📡 User URL:", `${API_URL}/users/${sub.user_id}`);

      //         const userRes = await fetch(`${API_URL}/users/${sub.user_id}`);

      //         console.log(
      //           "📥 User response status:",
      //           userRes.status,
      //           "for",
      //           sub.user_id
      //         );

      //         const userData = await userRes.json();
      //         console.log("✅ User data received:", userData);

      //         const userProfile = userData.user || userData;

      //         return {
      //           id: sub.user_id,
      //           name:
      //             userProfile.name ||
      //             userProfile.full_name ||
      //             userProfile.username ||
      //             "Unknown",

      //           age: userProfile.age ?? "-",
      //           gender: userProfile.gender ?? "-",
      //           condition: userProfile.condition ?? "-",
      //           image: userProfile.profile_image ?? null,
      //           status: sub.status,
      //           date: sub.start_date ? sub.start_date.split("T")[0] : "-",

      //           time: userProfile.preferred_time || "-",
      //         };
      //       } catch (err) {
      //         console.error(
      //           "❌ Failed to fetch user details for:",
      //           sub.user_id,
      //           err
      //         );
      //         return null;
      //       }
      //     })
      // );

      // const finalUsers = usersWithDetails.filter(Boolean);
      // console.log("🎯 Final subscribers list:", finalUsers);

      // setSubscribers(finalUsers);
      const usersWithDetails = await Promise.all(
        subscriptions.map(async (sub) => {
          try {
            const userRes = await fetch(`${API_URL}/users/${sub.user_id}`);
            const userData = await userRes.json();
            const userProfile = userData.user || userData;

            return {
              user_id: sub.user_id,
              name:
                userProfile.name ||
                userProfile.full_name ||
                userProfile.username ||
                "Unknown",
              age: userProfile.age ?? "-",
              gender: userProfile.gender ?? "-",
              condition: userProfile.condition ?? "-",
              image: userProfile.profile_image ?? null,
              status: sub.status,
              date: sub.start_date ? sub.start_date.split("T")[0] : "-",
              time: userProfile.preferred_time || "-",
            };
          } catch (err) {
            console.error(
              "Failed to fetch user details for:",
              sub.user_id,
              err
            );
            return null;
          }
        })
      );

      // Merge duplicates by user_id
      const mergedUsers = [];
      const userMap = {};

      usersWithDetails.filter(Boolean).forEach((user) => {
        if (userMap[user.user_id]) {
          // merge statuses if user already exists
          const existing = userMap[user.user_id];
          existing.status = Array.from(
            new Set([...existing.status.split(", "), user.status])
          ).join(", ");
          // optionally merge dates or appointments if needed
        } else {
          userMap[user.user_id] = { ...user };
        }
      });

      for (const key in userMap) {
        mergedUsers.push(userMap[key]);
      }

      setSubscribers(mergedUsers);
    } catch (error) {
      console.error("🔥 Error in fetchSubscribers:", error);
    } finally {
      console.log("✅ fetchSubscribers completed");
      setLoading(false);
    }
  };

  // ✅ RETURN MUST BE INSIDE COMPONENT
  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require("../../assets/DoctorsPortal/Images/DoctorDashboard.png")}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <View style={styles.parent}>
                <View style={styles.Left}>
                  <NewestSidebar navigation={navigation} />
                </View>

                <View style={styles.Right}>
                  <HeaderLoginSignUp navigation={navigation} />

                  <View style={styles.contentContainer}>
                    {/* ---------- HEADER ---------- */}
                    <View style={styles.upperPart}>
                      <Text style={styles.containerText}>Your Subscribers</Text>

                      <View style={styles.upperBox}>
                        {/* <TouchableOpacity style={styles.filterBox}>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/filterIcon.png")}
                            style={styles.filterIcon}
                          />
                          <Text style={styles.filterText}>Filter</Text>
                        </TouchableOpacity> */}

                        {/* <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.dateText}>Date :</Text>
                          <View style={styles.filterBox}>
                            <TextInput
                              style={styles.selectdateText}
                              placeholder="Select Date"
                            />
                          </View>
                        </View> */}

                        <View style={styles.SearchBox}>
                          <MaterialIcons
                            name="search"
                            size={20}
                            color="#B9B9B988"
                          />
                          <TextInput
                            style={styles.searchBoxText}
                            placeholder="Search For Patient"
                            value={searchText}
                            onChangeText={setSearchText}
                          />
                        </View>
                      </View>
                    </View>

                    {/* ---------- LIST ---------- */}
                    <View style={styles.lowerPart}>
                      <ScrollView>
                        {loading ? (
                          <Text
                            style={{ textAlign: "center", marginTop: "2%" }}
                          >
                            Loading subscribers...
                          </Text>
                        ) : subscribers.length > 0 ? (
                          // subscribers.map((item) => (
                          //   <SubscriberCard key={item.id} user={item} />
                          // ))
                          subscribers.map((item, index) => (
                            <SubscriberCard
                              key={`${item.id}_${index}`}
                              user={item}
                            />
                          ))
                        ) : (
                          <View style={styles.lowerCenterSection}>
                            <Image
                              source={require("../../assets/DoctorsPortal/Images/subscriberIcon.png")}
                              style={styles.subscriberIcon}
                            />
                            <Text style={styles.inviteSubscriberText}>
                              No subscribers found
                            </Text>
                          </View>
                        )}
                      </ScrollView>
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
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={[styles.header, { height: "15%" }]}>
            <HeaderLoginSignUp navigation={navigation} isDoctorPortal={true} />
          </View>
          <Text style={styles.appContainerText}>Your Subscribers</Text>
          <View style={styles.appSearchBox}>
            <MaterialIcons name="search" size={20} color="#B9B9B988" />
            <TextInput
              style={styles.appSearchBoxText}
              placeholder="Search For Patient"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <View style={styles.appLowerPart}>
            <ScrollView>
              {loading ? (
                <Text style={{ textAlign: "center", marginTop: "2%" }}>
                  Loading subscribers...
                </Text>
              ) : subscribers.length > 0 ? (
                // subscribers.map((item) => (
                //   <SubscriberCard key={item.id} user={item} />
                // ))
                subscribers.map((item, index) => (
                  <SubscriberCard key={`${item.id}_${index}`} user={item} />
                ))
              ) : (
                <View style={styles.appLowerCenterSection}>
                  <Image
                    source={require("../../assets/DoctorsPortal/Images/subscriberIcon.png")}
                    style={styles.appSubscriberIcon}
                  />
                  <Text style={styles.appInviteSubscriberText}>
                    No subscribers found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
};

export default DoctorsSubscribers;

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
  },

  appContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    //flexDirection: "row",
  },

  imageContainer: {
    borderColor: "#00ffff",
    height: "100%",
    width: "100%",
  },

  imageBackground: {
    width: "100%",
    height: "100%",
    //transform:[{scale:0.8}],
    opacity: 80,
    alignSelf: "center",
    flexDirection: "column",
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
    //borderWidth: 1,
  },
  Right: {
    height: "100%",
    width: "85%",
  },
  firstTextBox: {
    marginTop: "3%",
    marginLeft: "4%",
  },
  firstText: {
    fontSize: 42,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFFFFF",
    marginLeft: 8,
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: "2%",
    backgroundColor: "#FFFFFF",
    marginBottom: "4%",
    borderRadius: 5,
    overflow: "hidden",
    width: "92%",
    marginHorizontal: "4%",
    //borderWidth:1
  },
  upperPart: {
    flex: 1,
    backgroundColor: "#FCA2A21F",
    //height: "2%",
    width: "100%",
    borderWidth: 1,
  },
  containerText: {
    fontSize: 34,
    fontWeight: "600",
    color: "#000000",
    paddingTop: "2%",
    marginLeft: "3%",
  },
  appContainerText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#000000",
    //paddingTop: "2%",
    marginLeft: "3%",
  },
  upperBox: {
    marginLeft: "3%",
    marginVertical: "2%",
    //height: "20%",
    //borderWidth:1
  },
  // filterBox: {
  //   flexDirection: "row",
  //   borderRadius: 4,
  //   backgroundColor: "#FFFFFF",
  //   paddingHorizontal: 12,
  //   paddingVertical: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   alignContent: "center",
  //   alignSelf: "center",
  //   outlineStyle: "none",
  //   borderWidth: 0,
  // },
  SearchBox: {
    flexDirection: "row",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    width: "30%",
    paddingVertical: "0.5%",
  },
  appSearchBox: {
    flexDirection: "row",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    width: "90%",
    height: "4%",
    paddingVertical: "0.5%",
    borderWidth: 1,
    borderColor: "#c4c4c4ff",
    marginVertical: "1.5%",
    marginHorizontal: "3%",
  },
  // filterIcon: {
  //   width: 20,
  //   height: 20,
  // },
  // filterText: {
  //   alignItems: "center",
  //   justifyContent: "center",
  //   alignContent: "center",
  //   alignSelf: "center",
  //   fontSize: 14,
  //   fontWeight: "500",
  //   color: "#000000",
  // },
  // dateBox: {
  //   borderRadius: 4,
  //   backgroundColor: "#FFFFFF",
  //   paddingHorizontal: 12,
  //   flexDirection: "row",
  //   justifyContent: "center",
  // },
  // dateText: {
  //   fontSize: 16,
  //   fontWeight: "500",
  //   color: "#000000",
  // },
  // selectdateText: {
  //   fontSize: 14,
  //   fontWeight: "300",
  //   color: "#B9B9B9",
  //   outlineStyle: "none",
  //   borderWidth: 0,
  // },
  searchBoxText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#B9B9B9",
    justifyContent: "flex-start",
    outlineStyle: "none",
    borderWidth: 0,
  },
  upperBoxx: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
  },

  lowerPart: {
    height: "70%",
  },
  appLowerPart: {
    height: "70%",
  },
  lowerCenterSection: {
    //borderWidth: 1,
    height: "80%",
    width: "45%",
    alignSelf: "center",
    alignItems: "center",
  },
  appLowerCenterSection: {
    borderWidth: 1,
    height: "80%",
    width: "35%",
    alignSelf: "center",
    alignItems: "center",
  },
  subscriberIcon: {
    height: 125,
    width: 100,
    alignSelf: "center",
    marginVertical: "10%",
  },
  inviteSubscriberText: {
    alignSelf: "center",
    color: "#de1f1fff",
    fontSize: 14,
    fontWeight: 600,
  },
  inviteButton: {
    //borderWidth:1,
    marginVertical: "3%",
    padding: "1.5%",
    backgroundColor: "#dc2727ff",
    color: "#fff",
    borderRadius: 6,
  },
});
