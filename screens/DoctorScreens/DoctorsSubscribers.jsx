import React, { useCallback, useState } from "react";
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
//import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import DoctorsHeader from "../../components/DoctorsPortalComponents/DoctorsHeader";
//import Title from "../../components/PatientScreenComponents/Title";
//import SearchBar from "../../components/PatientScreenComponents/SearchBar";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import SubscriberCard from "../../components/DoctorsPortalComponents/SubscriberCard";
//import DoctorSuggestion from "../../components/DoctorsPortalComponents/DoctorSuggestion";

const { width, height } = Dimensions.get("window");
const DoctorsSubscribers = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const { setChatbotConfig, isChatExpanded, setIsChatExpanded } = useChatbot();
  //const [selectedButton, setSelectedButton] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig])
  );

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
                  <DoctorsHeader navigation={navigation} />
                  {/* <View style={styles.firstTextBox}>
                    <View>
                      <Text style={styles.firstText}>
                        Welcome Doctor!

                      </Text>

                    </View>
                    <View>
                      <Text style={styles.secondText}>
                        Here is your medical dashboard.

                      </Text>

                    </View>

                  </View> */}

                  <View style={styles.contentContainer}>
                    <View style={styles.upperPart}>
                      <View>
                        <Text style={styles.containerText}>
                          Your Subscribers
                        </Text>
                      </View>
                      <View style={styles.upperBox}>
                        <TouchableOpacity style={styles.filterBox}>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/filterIcon.png")}
                            style={styles.filterIcon}
                          />
                          <Text style={styles.filterText}>Filter</Text>
                        </TouchableOpacity>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.dateText}>Date : </Text>
                          <View style={styles.filterBox}>
                            <TouchableOpacity style={styles.dateBox}>
                              <TextInput
                                style={styles.selectdateText}
                                placeholder="Select Date"
                                value={searchText}
                                onChangeText={setSearchText}
                              />
                              <Image
                                //source={require("../../assets/Icons/dateIcon.png")}
                                style={styles.iconImage}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.dateText}>Status : </Text>
                          <View style={styles.filterBox}>
                            <TouchableOpacity style={styles.dateBox}>
                              <TextInput
                                style={styles.selectdateText}
                                placeholder="All Patients"
                                value={searchText}
                                onChangeText={setSearchText}
                              />
                              <Image
                                //source={require("../../assets/Icons/statusIcon.png")}
                                style={styles.iconImage}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.SearchBox}>
                          <MaterialIcons
                            name="search"
                            size={20}
                            color="#B9B9B988"
                            style={styles.searchIcon}
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

                    <View style={styles.lowerPart}>
                      {/* <ScrollView> */}
                      {/* <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard> */}
                      <View style={styles.lowerCenterSection}>
                        <Image
                          source={require("../../assets/DoctorsPortal/Images/subscriberIcon.png")}
                          style={styles.subscriberIcon}
                        />
                      </View>
                      {/* </ScrollView> */}
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
    borderWidth: 1,
    height: "80%",
    width: "40%",
    alignSelf: "center",
    alignItems: "center",
  },
  subscriberIcon: {
    height: 125,
    width: 100,
    alignSelf:"center",
    marginVertical:"10%"
  },
});

export default DoctorsSubscribers;
