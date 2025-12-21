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
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";

import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import SubscriberCard from "../../components/DoctorsPortalComponents/SubscriberCard";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";

const DoctorsSubscribers = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const { setChatbotConfig } = useChatbot();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig])
  );

  // ✅ FETCH BACKEND DATA HERE (ONLY HERE)
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(
        "https://your-api.com/doctor/subscribers"
      );
      const data = await response.json();

      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.log("Error fetching subscribers:", error);
    } finally {
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
                      <Text style={styles.containerText}>
                        Your Subscribers
                      </Text>

                      <View style={styles.upperBox}>
                        <TouchableOpacity style={styles.filterBox}>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/filterIcon.png")}
                            style={styles.filterIcon}
                          />
                          <Text style={styles.filterText}>Filter</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={styles.dateText}>Date :</Text>
                          <View style={styles.filterBox}>
                            <TextInput
                              style={styles.selectdateText}
                              placeholder="Select Date"
                            />
                          </View>
                        </View>

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
                          <Text style={{ textAlign: "center", marginTop: 40 }}>
                            Loading subscribers...
                          </Text>
                        ) : subscribers.length > 0 ? (
                          subscribers.map((item) => (
                            <SubscriberCard key={item.id} user={item} />
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
  },
  upperPart: {
    flex: 1,
    backgroundColor: "#FCA2A21F",
    height: "30%",
    width: "100%",
  },
  containerText: {
    fontSize: 34,
    fontWeight: "600",
    color: "#000000",
    paddingTop: "2%",
    marginLeft: "4%",
  },
  upperBox: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: "2%",
    paddingVertical: "2%",

    marginLeft: "4%",
  },
  filterBox: {
    flexDirection: "row",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    outlineStyle: "none",
    borderWidth: 0,
  },
  SearchBox: {
    flexDirection: "row",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    width: "30%",
    paddingVertical: 2,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  filterText: {
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  dateBox: {
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  selectdateText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#B9B9B9",
    outlineStyle: "none",
    borderWidth: 0,
  },
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
  lowerCenterSection: {
    //borderWidth: 1,
    height: "80%",
    width: "45%",
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


