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
  ScrollView,
} from "react-native";

import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
//import SubscriberCard from "../../components/DoctorsPortalComponents/SubscriberCard";
//import DoctorCard from "../../components/DoctorsPortalComponents/DoctorCard";
//import ChatBot from "../../components/PatientScreenComponents/ChatbotComponents/ChatBot";

const { width, height } = Dimensions.get("window");
const Prescription = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const { setChatbotConfig, isChatExpanded, setIsChatExpanded } = useChatbot();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  //const [selectedButton, setSelectedButton] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig])
  );

  const fileInputRef = React.useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);

    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log("Selected files:", files);

    setUploadedFiles((prev) => [...prev, ...files]);
  };

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
                    <View style={styles.upperPart}>
                      <View>
                        <Text style={styles.upperText}>
                          Generate Prescription
                        </Text>
                      </View>
                      <View>
                        <TouchableOpacity
                          style={styles.firstButton}
                          onPress={() =>
                            navigation.navigate("DoctorAppNavigation", {
                              screen: "DoctorsSubscribers",
                            })
                          }
                        >
                          <Text style={styles.subscriberText}>
                            Select your subscriber
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.lowerPart}>
                      <View style={styles.leftPart}>
                        <View style={styles.leftUpperpart}>
                          <View>
                            <Image
                              source={require("../../assets/DoctorsPortal/Icons/Prescription-icon.png")}
                              style={styles.filterIcon}
                            />
                          </View>
                          <View style={{ paddingTop: "2%" }}>
                            <Text style={styles.lastText}>
                              Add Report & Get AI
                            </Text>
                          </View>
                        </View>
                        <View style={styles.uploadTextpart}>
                          <Text styles={styles.uploadText}>
                            Upload reports or sync from Medilocker and let AI
                            create a suggested{" "}
                          </Text>
                        </View>
                        <View style={{ alignItems: "center" }}>
                          <View style={styles.middlePart}>
                            <Text style={styles.middleText}>
                              Auto-analysis of past history
                            </Text>
                          </View>
                          <View style={styles.middlePart}>
                            <Text style={styles.middleText}>
                              AI-generated medicine + test
                            </Text>
                          </View>
                          <View style={styles.middlePart}>
                            <Text style={styles.middleText}>
                              instant risk scoring
                            </Text>
                          </View>
                        </View>

                        <View style={{ alignItems: "center", marginTop: "3%" }}>
                          {/* <TouchableOpacity style={styles.medilockerPart}>
                            <View>
                              <Image
                                source={require("../../assets/DoctorsPortal/Icons/send_Icon.png")}
                                style={styles.filterIcon}
                              />
                            </View>
                            <View
                              style={{
                                alignItems: "center",
                                marginTop: "1.5%",
                              }}
                            >
                              <Text style={styles.dragText}>
                                Drag & Drop Here
                              </Text>
                            </View>
                            <View
                              style={{
                                alignItems: "center",
                                marginTop: "1.5%",
                              }}
                            >
                              <Text style={styles.lastpartText}>
                                just upload Document and generate precription
                              </Text>
                            </View>
                            
                          </TouchableOpacity> */}
                          <View
                            style={styles.medilockerPart}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            {/* Hidden file input for click upload */}
                            <input
                              type="file"
                              multiple
                              style={{ display: "none" }}
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                            />

                            <TouchableOpacity
                              onPress={() => fileInputRef.current.click()}
                            >
                              <Image
                                source={require("../../assets/DoctorsPortal/Icons/send_Icon.png")}
                                style={styles.filterIcon}
                              />
                              <Text style={styles.dragText}>
                                Drag & Drop Here
                              </Text>
                              <Text style={styles.lastpartText}>
                                just upload Document and generate prescription
                              </Text>
                            </TouchableOpacity>
                            {/* <View style={{ marginTop: 12 }}>
                              {uploadedFiles.map((file, index) => (
                                <Text key={index} style={{ color: "#333" }}>
                                  {file.name}
                                </Text>
                              ))}
                            </View> */}
                            <ScrollView
                              nestedScrollEnabled={true}
                              style={{ height: 65, width: "100%" }} // only SIZE here
                              contentContainerStyle={{
                                // layout goes HERE
                                paddingVertical: 4,
                              }}
                            >
                              {uploadedFiles.map((file, index) => (
                                <Text
                                  key={index}
                                  style={{ paddingVertical: 4 }}
                                >
                                  {file.name}
                                </Text>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                        <View
                          style={{ alignItems: "center", marginTop: "2.5%" }}
                        >
                          <TouchableOpacity style={styles.generateButton}>
                            <Text style={styles.generateText}>
                              Generate with AI
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.rightPart}>
                        <View style={{ backgroundColor: "#ed3d40ff" }}>
                          <View style={{ marginLeft: "12%" }}>
                            <Text style={styles.rightText}>DrBuddy</Text>
                          </View>
                          <View
                            style={{
                              marginLeft: "11%",
                              padding: "1%",
                              paddingBottom: "2%",
                            }}
                          >
                            <Text style={styles.rightlastText}>
                              Ask me anything
                            </Text>
                          </View>
                        </View>

                        {/* <View style={styles.rightLastpart}>
                          <View>
                            <ChatBot></ChatBot>
                          </View>
                        </View> */}
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
    height: "22%",
    paddingTop: "2.5%",
    paddingLeft: "4%",
  },
  upperText: {
    fontFamily: "Poppins - Regular",
    fontSize: 34,
    fontWeight: "600",
    color: "#000000",
  },
  firstButton: {
    width: "20%",
    marginTop: "0.5%",
    marginLeft: "1%",

    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF7072",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  subscriberText: {
    color: "#FF7072",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins - Regular",
  },
  lowerPart: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    width: "100%",
  },
  leftPart: {
    padding: "2%",
    paddingTop: "3%",

    // marginBottom:"90%",
    marginLeft: "5%",

    height: "92%",
    width: "45%",
    backgroundColor: "#FFF8F8",

    borderRadius: 4,
  },
  leftUpperpart: {
    alignItems: "center",
  },
  lastText: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Poppins - Bold",
  },
  uploadTextpart: {
    alignItems: "center",
    padding: "2%",
  },
  uploadText: {
    color: "#444444",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Poppins - Regular",
  },
  middlePart: {
    paddingTop: "2%",

    width: "45%",
  },
  middleText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins - Medium",
  },
  medilockerPart: {
    width: "72%",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 6,
    padding: "3%",
    alignItems: "center",
    borderColor: "#9B9A9A",
    //  borderWidth: 1,
    // borderStyle: "dashed",
    // borderColor: "#ccc",
    // borderRadius: 8,
    // paddingVertical: 30,
    // paddingHorizontal: 20,
    // alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: "#fdf9f8", // light pastel background
    // marginHorizontal: 20,
  },
  filterIcon: {
    alignSelf: "center",
  },
  dragText: {
    color: "#5B5B5B",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins - Medium",
    alignSelf: "center",
  },
  lastpartText: {
    color: "#878787",
    fontSize: 14,
    fontWeight: "300",
    fontFamily: "Poppins - Light",
  },
  generateButton: {
    borderRadius: 8,

    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FF707280",
    paddingHorizontal: 45,
    paddingVertical: 10,
  },
  generateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins - Medium",
  },
  rightPart: {
    marginTop: "3%",
    marginLeft: "10%",

    height: "70%",
    width: "25%",
    // borderTopWidth:5,
    // borderBottomWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    borderColor: "#FF7072",
    borderWidth: 6,
    borderRadius: 15,
  },
  rightText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
    fontFamily: "Inter - Medium",
  },
  rightlastText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Inter - Regular",
  },
  rightLastpart: {
    height: "83%",
    width: "100%%",

    borderColor: "#FF7072",
  },
});

export default Prescription;
