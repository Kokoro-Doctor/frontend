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

import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
//import DoctorsHeader from "../../components/DoctorsPortalComponents/DoctorsHeader";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import MedilockerUsers from "../../components/DoctorsPortalComponents/MedilockerUsers";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";

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
                  <HeaderLoginSignUp navigation={navigation} />

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
                        <View style={{ flexDirection: "row" }}>
                          <View style={styles.imageBox}>
                            <Image
                              source={require("../../assets/DoctorsPortal/Images/userpic.png")}
                              style={styles.imagepic}
                            />
                          </View>
                          <View style={styles.firstTextBox}>
                            <View style={styles.firstHeadSection}>
                              <Text
                                style={{
                                  fontWeight: 600,
                                  fontSize: 24,
                                  color: "#000000",
                                }}
                              >
                                Anamika Singh
                              </Text>
                              <View style={styles.secondTextBox}>
                                <View
                                  style={{ flexDirection: "row", gap: "14%" }}
                                >
                                  <View>
                                    <View style={{ flexDirection: "column" }}>
                                      <View style={{ flexDirection: "row" }}>
                                        <View>
                                          <Text
                                            style={{
                                              fontWeight: 500,
                                              fontSize: 14,
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
                                      fontSize: 14,
                                      color: "#000000",
                                    }}
                                  >
                                    Health Score :
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
                            >
                              <View>
                                <Text style={styles.firstBoxText}>Age :</Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}> 50</Text>
                              </View>

                              <View style={{ marginLeft: "20%" }}>
                                <Text style={styles.firstBoxText}>
                                  Gender :
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}> Female</Text>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
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
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
                            >
                              <View>
                                <Text style={styles.firstBoxText}>
                                  Status :
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}>
                                  {" "}
                                  Cancelled
                                </Text>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: "0.8%",
                              }}
                            >
                              <View>
                                <Text style={styles.firstBoxText}>
                                  Summary :
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.firstTexttwo}>
                                  {" "}
                                  Shortness of breath (dyspnea) for four months,
                                  progressively worsening to the point of
                                  limiting daily activities
                                </Text>
                              </View>
                            </View>
                          </View>

                          
                            <TouchableOpacity style={styles.generateButton}>
                              <Text style={styles.generateText}>
                                Generate Prescription
                              </Text>
                            </TouchableOpacity>
                
                        </View>
                        <View style={styles.lowerSectionContainer}>
                          <View style={{ marginLeft: "2%" }}>
                            <Text style={styles.middleText}>
                              Patients Uploaded Documents
                            </Text>
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
                        </View>
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
                          <View style={{ marginLeft: "2%" }}>
                            <Text style={styles.mediText}>File Name</Text>
                          </View>
                          <View style={{ marginLeft: "15%" }}>
                            <Text style={styles.mediText}>Document Type</Text>
                          </View>
                          <View style={{ marginLeft: "6%" }}>
                            <Text style={styles.mediText}>File size</Text>
                          </View>
                          <View style={{ marginLeft: "3%" }}>
                            <Text style={styles.mediText}>Creation Date</Text>
                          </View>
                          <View style={{ marginLeft: "6%" }}>
                            <Text style={styles.mediText}>Time</Text>
                          </View>
                          <View style={{ marginLeft: "4%" }}>
                            <Text style={styles.mediText}>Quick Preview</Text>
                          </View>
                          <View style={{ marginLeft: "2%" }}>
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
    marginTop: "0%",
    marginLeft: "0.5%",
    //borderWidth: 1,
    width: "73%",
  },
  firstHeadSection: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    height: "76%",
    borderWidth: 1,
    borderRadius: 16,
    marginTop: "1.5%",
    marginLeft: "4%",
    marginBottom: "3%",
    marginRight: "4%",
    borderColor: "#d0cdcdff",
    padding:"0.5%"
  },
  container: {
    flexDirection: "column",
    //borderWidth: 2,
    height: "50%",
    borderColor: "#190678ff",
  },
  lowerSectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    //borderWidth:1,
    marginVertical:"2%",
    height:"25%"
  },
  imageBox: {
    //margin: "1%",
    //borderWidth: 1,
    height: "49%",
  },
  imagepic: {
    height: 70,
    width: 70,
  },

  firstBoxText: {
    fontSize: 14,
    color: "#444444",
    fontWeight: 500,
    fontFamily: "Poppins - Medium",
    //borderWidth: 1,
  },
  firstTexttwo: {
    fontSize: 14,
    color: "#444444",
    fontWeight: 400,
    fontFamily: "Poppins - Regular",
  },
  generateButton: {
    backgroundColor: "#FF7072",
    borderRadius: 6,
    width:"17%",
    height:"25%",
    marginLeft:"2%"
  },
  generateText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Poppins - SemiBold",
    alignSelf:"center",
    marginVertical:"3%"
  },
  middleText: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "500",
    fontFamily: "Inter - Medium",
    marginTop:"6%"
  },
  bottomPart: {
    //marginLeft: "1%",
    //marginTop: "0.5%",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#DADADA",
    height: "50%",
    width: "100%",
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
    width: "50%",
    //borderColor: "#E2E2E2",
    //borderWidth: 1,
    height: "100%",
    paddingHorizontal: "1%",
  },

  medilockerBox: {
    borderTopColor: "#DADADA",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#DADADA",
    height: "20%",
    width: "100%",
    backgroundColor: "#FF70720F",
    borderRadius: 0,
    borderColor: "#DADADA",
    flexDirection: "row",
    padding: "0.6%",
    justifyContent:"space-around"
  },
  mediText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444444",
    fontFamily: "Poppins - Medium",
  },
});

export default GeneratePrescription;
