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
  ScrollView
} from "react-native";

// import { MaterialIcons } from "@expo/vector-icons";
// import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import DoctorsHeader from "../../components/DoctorsPortalComponents/DoctorsHeader";
// import Title from "../../components/PatientScreenComponents/Title";
// import SearchBar from "../../components/PatientScreenComponents/SearchBar";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
// import SubscriberCard from "../../components/DoctorsPortalComponents/SubscriberCard";
// import DoctorCard from "../../components/DoctorsPortalComponents/DoctorCard";
import MedilockerUsers from "../../components/DoctorsPortalComponents/MedilockerUsers";

const { width, height } = Dimensions.get("window");
const GeneratePrescription = ({ navigation, route }) => {
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
                  <View style={styles.backPicBox}>
                    <TouchableOpacity>
                      <Image
                        source={require("../../assets/DoctorsPortal/Icons/backscreen.png")}
                        style={styles.backpic}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.contentContainer}>
                    <View style={styles.upperPart}>
                      <View>
                        <Text style={styles.containerText}>
                          Your Subscribers
                        </Text>
                      </View>
                    </View>

                    <View style={styles.lowerPart}>
                      <View style={styles.container}>
                        <View style={styles.imageBox}>
                          <Image
                            source={require("../../assets/DoctorsPortal/Images/userpic.png")}
                            style={styles.imagepic}
                          />
                        </View>
                        <View style={styles.firstTextBox}>
                          <View>
                            <Text
                              style={{
                                fontWeight: 600,
                                fontSize: 24,
                                color: "#000000",
                              }}
                            >
                              Anamika Singh
                            </Text>
                          </View>
                          <View
                            style={{ flexDirection: "row", marginTop: "1.5%" }}
                          >
                            <View>
                              <Text style={styles.firstBoxText}>Age :</Text>
                            </View>
                            <View>
                              <Text style={styles.firstTexttwo}> 50</Text>
                            </View>

                            <View style={{ marginLeft: "32%" }}>
                              <Text style={styles.firstBoxText}>Gender :</Text>
                            </View>
                            <View>
                              <Text style={styles.firstTexttwo}> Female</Text>
                            </View>
                          </View>
                          <View
                            style={{ flexDirection: "row", marginTop: "1.5%" }}
                          >
                            <View>
                              <Text style={styles.firstBoxText}>
                                Condition :
                              </Text>
                            </View>
                            <View>
                              <Text style={styles.firstTexttwo}>
                                {" "}
                                Heart Disease
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{ flexDirection: "row", marginTop: "1.5%" }}
                          >
                            <View>
                              <Text style={styles.firstBoxText}>Status :</Text>
                            </View>
                            <View>
                              <Text style={styles.firstTexttwo}>
                                {" "}
                                Cancelled
                              </Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: "row" }}>
                            <View>
                              <Text style={styles.firstBoxText}>Summary :</Text>
                            </View>
                            <View>
                              <Text style={styles.firstTexttwo}>
                                {" "}
                                Shortness of breath (dyspnea) for four months,
                                progressively worsening to the point of limiting
                                daily
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.firstTexttwo}>activities</Text>
                        </View>
                        <View style={styles.secondTextBox}>
                          <View style={{ flexDirection: "row", gap: "14%" }}>
                            <View>
                              <View style={{ flexDirection: "column" }}>
                                <View style={{ flexDirection: "row" }}>
                                  <View>
                                    <Text
                                      style={{
                                        fontWeight: 500,
                                        fontSize: 16,
                                        color: "#000000",
                                      }}
                                    >
                                      Appointment Date :
                                    </Text>
                                  </View>
                                  <View>
                                    <Text style={styles.firstTexttwo}>
                                      {" "}
                                      18 Oct 2025
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  marginTop: "1.5%",
                                }}
                              >
                                <View>
                                  <Text style={styles.firstBoxText}>
                                    Time :
                                  </Text>
                                </View>

                                <View>
                                  <Text style={styles.firstTexttwo}>
                                    {" "}
                                    11:00 AM
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <Text
                              style={{
                                fontWeight: 500,
                                fontSize: 16,
                                color: "#000000",
                              }}
                            >
                              Health Score :
                            </Text>
                          </View>
                        </View>

                        <View style={{ marginLeft: "3%" }}>
                          <TouchableOpacity style={styles.generateButton}>
                            <Text style={styles.generateText}>
                              Generate Prescription
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          gap: "1.5%",
                          marginRight: "1.5%",
                        }}
                      >
                        <TouchableOpacity>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/call_Icon.png")}
                            style={styles.midddleIcon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/fileSave.png")}
                            style={styles.middleIcon}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={{ marginLeft: "2%" }}>
                        <Text style={styles.middleText}>
                          Patients Uploaded Documents
                        </Text>
                      </View>

                      <View style={styles.bottomPart}>
                        <View style={{ flexDirection: "row" }}>
                          <View style={{ padding: "1.2%", marginLeft: "1%" }}>
                            <Text
                              style={{
                                color: "#000000",
                                fontWeight: "600",
                                fontSize: 16,
                                fontFamily: "Poppins - SemiBold",
                              }}
                            >
                              Files Uploaded
                            </Text>
                          </View>

                          <View
                            style={{
                              padding: "1%",
                              flexDirection: "row",
                              gap: "4%",
                              marginLeft: "43%",
                            }}
                          >
                            <TouchableOpacity style={styles.searchBox}>
                              <Image
                                source={require("../../assets/DoctorsPortal/Icons/search_Icon.png")}
                                style={styles.searchImage}
                              />
                              <TextInput
                                style={styles.searchText}
                                placeholder="Search For Documents"
                                value={searchText}
                                onChangeText={setSearchText}
                              />
                            </TouchableOpacity>

                            <View style={{ flexDirection: "row" }}>
                              <TouchableOpacity style={styles.filterBox}>
                                <Image
                                  source={require("../../assets/DoctorsPortal/Icons/filter__Icon.png")}
                                  style={styles.searchImage}
                                />
                                <Text>Filters</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>

                        <View style={styles.medilockerBox}>
                          <View style={{ marginLeft: "4%" }}>
                            <Text style={styles.mediText}>File Name</Text>
                          </View>
                          <View style={{ marginLeft: "17%" }}>
                            <Text style={styles.mediText}>Document Type</Text>
                          </View>
                          <View style={{ marginLeft: "6%" }}>
                            <Text style={styles.mediText}>File size</Text>
                          </View>
                          <View style={{ marginLeft: "6%" }}>
                            <Text style={styles.mediText}>Creation Date</Text>
                          </View>
                          <View style={{ marginLeft: "6%" }}>
                            <Text style={styles.mediText}>Time</Text>
                          </View>
                          <View style={{ marginLeft: "4%" }}>
                            <Text style={styles.mediText}>Quick Preview</Text>
                          </View>
                          <View style={{ marginLeft: "4%" }}>
                            <Text style={styles.mediText}>Actions</Text>
                          </View>
                        </View>
                        <ScrollView>
                          <MedilockerUsers></MedilockerUsers>
                          <MedilockerUsers></MedilockerUsers>
                          <MedilockerUsers></MedilockerUsers>
                          <MedilockerUsers></MedilockerUsers>
                          <MedilockerUsers></MedilockerUsers>
                          <MedilockerUsers></MedilockerUsers>
                          <MedilockerUsers></MedilockerUsers>
                          <MedilockerUsers></MedilockerUsers>
                        </ScrollView>
                      </View>
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

  backPicBox: {
    marginLeft: "4%",
  },
  backpic: {
    height: 30,
    width: 30,
  },
  contentContainer: {
    flex: 1,
    marginTop: "0.5%",

    backgroundColor: "#FFFFFF",
    marginBottom: "4%",
    borderRadius: 5,
    overflow: "hidden",
    width: "92%",
    marginHorizontal: "4%",
  },
  upperPart: {
    backgroundColor: "#FCA2A21F",
    height: "15%",
    width: "100%",
  },
  containerText: {
    fontSize: 34,
    fontWeight: "600",
    color: "#000000",
    paddingTop: "2%",
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

  lowerPart: {
    height: "73%",
    borderWidth: 1,
    borderRadius: 16,
    marginTop: "3%",
    marginLeft: "4%",
    marginBottom: "3%",
    marginRight: "4%",
    borderColor: "#D9D9D9",
  },
  container: {
    flexDirection: "row",

    padding: 18,
    height: "29%",
  },
  imageBox: {
    margin: "1%",
  },
  imagepic: {
    height: 100,
    width: 100,
  },
  // firstTextBox: {
  //   width: "28%",

  //   borderColor: "#E2E2E2",
  // },
  firstBoxText: {
    fontSize: 16,
    color: "#444444",
    fontWeight: 500,
    fontFamily: "Poppins - Medium",
  },
  firstTexttwo: {
    fontSize: 16,
    color: "#444444",
    fontWeight: 400,
    fontFamily: "Poppins - Regular",
  },
  generateButton: {
    backgroundColor: "#FF7072",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  generateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins - SemiBold",
  },
  middleText: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "500",
    fontFamily: "Inter - Medium",
  },
  bottomPart: {
    marginLeft: "1%",
    marginTop: "0.5%",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#DADADA",
    height: "48%",
    width: "98%",
  },
  upperMiddlepart: {
    height: "20%",
    flexDirection: "row",
  },
  searchBox: {
    width: "100%",

    paddingRight: 30,
    flexDirection: "row",
    gap: "8%",
    // paddingHorizontal:70,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#FF707296",
  },
  searchImage: {
    marginLeft: "10%",
    marginTop: "1.5%",
  },
  searchText: {
    justifyContent: "center",
    fontSize: 14,
    color: "#444444",
    fontWeight: "400",
    fontFamily: "Poppins - Regular",
    outlineStyle: "none",
  },
  // filterBox: {
  //   justifyContent: "center",
  //   paddingTop: "5%",
  //   width: 95,
  //   flexDirection: "row",
  //   gap: "10%",
  //   borderColor: "#FF707296",
  //   borderWidth: 1,
  //   borderRadius: 6,
  //   paddingRight: "20%",
  // },
  secondTextBox: {
    width: "40%",

    borderColor: "#E2E2E2",
  },

  medilockerBox: {
    borderTopColor: "#DADADA",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#DADADA",
    height: "20%",
    width: "100%",
    backgroundColor: "#FF70720F",
    //padding: 1,
    borderRadius: 0,
    borderColor: "#DADADA",
    flexDirection: "row",
    padding: "0.6%",
  },
  mediText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444444",
    fontFamily: "Poppins - Medium",
  },
});

export default GeneratePrescription;
