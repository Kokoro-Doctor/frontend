import React from "react";
import NewSideNav from "../../../components/DoctorsPortalComponents/NewSideNav";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const DoctorPatientLandingPage = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.wrapper}>
          <NewSideNav />
          <View style={styles.content}>
            <View style={styles.cloud_Image1}>
              <Image
                source={require("../../../assets/DoctorsPortal/Icons/cloudIcon1.png")}
              />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.cloud_Image2}>
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/cloudIcon2.png")}
                />
              </View>
              <View style={styles.content_box}>
                <View style={styles.contentHeading}>
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "600",
                      color: "#444444",
                      textAlign: "center",
                      fontStyle: "Poppins",
                    }}
                  >
                    Register as a Patient or Doctor
                  </Text>
                </View>
                <View style={styles.content_body}>
                  <View style={styles.box}>
                    <Pressable
                      onPress={() =>
                        navigation.navigate("PatientAppNavigation", {
                          screen: "Signup",
                        })
                      }
                      style={({ hovered, pressed }) => [
                        styles.touchableBox,
                        hovered || pressed ? styles.selectedBox : null,
                      ]}
                    >
                      <Text style={styles.boxText}>Patient</Text>
                      <Image
                        source={require("../../../assets/DoctorsPortal/Icons/patientIcon.png")}
                        style={styles.box_Icon}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.box}>
                    <Pressable
                      onPress={() =>
                        navigation.navigate("DoctorAppNavigation", {
                          screen: "DoctorsSignUp",
                        })
                      }
                      style={({ hovered, pressed }) => [
                        styles.touchableBox,
                        hovered || pressed ? styles.selectedBox : null,
                      ]}
                    >
                      <Text style={styles.boxText}>Doctor</Text>
                      <Image
                        source={require("../../../assets/DoctorsPortal/Icons/DoctorIcon.png")}
                        style={styles.box_Icon}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.cloud_Image3}>
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/cloudIcon3.png")}
                />
              </View>
            </View>
            <View style={styles.imageConatiner2}>
              <View style={styles.imageConatiner2_upper}>
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon1.png")}
                  // style={styles.icondesign}
                />
                <View style={styles.innerImageContainer}>
                  <Image
                    source={require("../../../assets/DoctorsPortal/Icons/icon2.png")}
                    style={styles.icondesign}
                  />
                  <Image
                    source={require("../../../assets/DoctorsPortal/Icons/icon3.png")}
                    style={styles.icondesign}
                  />
                </View>
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon4.png")}
                  // style={styles.icondesign}
                />
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon5.png")}
                  // style={styles.icondesign}
                />
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon6.png")}
                  style={styles.icondesign}
                />
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon7.png")}
                  // style={styles.icondesign}
                />
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon8.png")}
                  style={styles.icondesign}
                />
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon9.png")}
                  style={styles.icondesign}
                />
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/icon10.png")}
                  style={styles.icondesign}
                />
              </View>
              <View style={styles.imageConatiner2_lower}>
                <Image
                  source={require("../../../assets/DoctorsPortal/Images/rectanglebase.png")}
                  style={styles.rectanglebase}
                />
              </View>
            </View>
          </View>
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.app_wrapper}>
          <View style={styles.app_HeadingContainer}>
            <View style={styles.text_container}>
              
              <Text style={styles.app_headingText}>
                Register as a Patient or Doctor
              </Text>
            </View>
          </View>
          <View style={styles.app_ButtonContainer}>
            <View style={styles.app_box}>
              {/* <TouchableOpacity style={styles.touchableBox}> */}
              <Pressable
                onPress={() =>
                  navigation.navigate("PatientAppNavigation", {
                    screen: "Signup",
                  })
                }
                style={({ hovered, pressed }) => [
                  styles.touchableBox,
                  hovered || pressed ? styles.selectedBox : null,
                ]}
              >
                <Text style={styles.app_boxText}>Patient</Text>
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/patientIcon.png")}
                  style={styles.app_box_Icon}
                />
              </Pressable>
              {/* </TouchableOpacity> */}
            </View>
            <View style={styles.app_box}>
              <Pressable
                onPress={() =>
                  navigation.navigate("DoctorAppNavigation", {
                    screen: "DoctorsSignUp",
                  })
                }
                style={({ hovered, pressed }) => [
                  styles.touchableBox,
                  hovered || pressed ? styles.selectedBox : null,
                ]}
              >
                <Text style={styles.app_boxText}>Doctor</Text>
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/DoctorIcon.png")}
                  style={styles.app_box_Icon}
                />
              </Pressable>
            </View>
          </View>

          <TouchableOpacity
            style={styles.GetStartedContainer}
            // onPress={handleContinue}
            onPress={() => navigation.navigate("")}
          >
            <Text style={styles.GetStartedText}>Get Started</Text>
            <Image
              style={styles.arrowIcon}
              source={require("../../../assets/DoctorsPortal/Icons/ArrowIcon.png")}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: "100%",
    width: "100%",
    flexDirection: "row",
  },
  content: {
    width: "85%",
    height: "100%",
    backgroundColor: "#FCF5F7",
    overflow: "hidden",
  },
  cloud_Image1: {
    height: "20%",
    width: "100%",
    paddingLeft: "15%",
  },
  contentContainer: {
    width: "100%",
    height: "50%",

    flexDirection: "row",
    alignItems: "center",
  },

  cloud_Image2: {
    width: "15%",
    height: "100%",
    paddingTop: "5%",
  },
  content_box: {
    width: "65%",
    height: "90%",

    backgroundColor: "#FFFFFF",
    borderRadius: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  contentHeading: {
    height: "30%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content_body: {
    height: "80%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  box: {
    width: "40%",
    height: "60%",
    //paddingLeft:"5%",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,

    shadowColor: "#00000040",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    cursor: "pointer",
  },
  touchableBox: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: "5%",
  },
  selectedBox: {
    backgroundColor: "#FF606033",
    borderRadius: 14,
  },
  boxText: {
    fontStyle: "Montserrat",
    fontSize: 20,
    fontWeight: "400",
    color: "#000000",
  },
  box_Icon: {
    height: 160,
    resizeMode: "contain",
  },

  cloud_Image3: {
    width: "20%",
    height: "100%",
    marginLeft: "2%",
    justifyContent: "flex-end",
    paddingBottom: "5%",
  },
  imageConatiner2: {
    width: "100%",
    height: "30%",
  },
  imageConatiner2_upper: {
    height: "70%",
    width: "95%",
    flexDirection: "row",
    alignItems: "flex-end",
    marginLeft: "5%",
    justifyContent: "space-between",
  },
  innerImageContainer: {
    flexDirection: "row",
  },
  icondesign: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  imageConatiner2_lower: {
    height: "30%",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  rectanglebase: {
    width: "90%",
    height: "100%",

    alignItems: "flex-end",
  },

  //... App Styling ...//
  app_wrapper: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FCF5F7",
  },
  app_HeadingContainer: {
    marginTop: "20%",
    height: "10%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  text_container: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  app_headingText: {
    fontSize: 32,
    fontWeight: "600",
    fontFamily: "Poppins",
    textAlign: "center",
    flexWrap: "wrap",
  },
  app_ButtonContainer: {
    width: "100%",
    height: "60%",
    //flexDirection:"row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  app_box: {
    width: "75%",
    height: "40%",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 14,

    shadowColor: "#00000040",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    cursor: "pointer",
  },
  touchableBox: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: "5%",
  },

  app_boxText: {
    fontStyle: "Montserrat",
    fontSize: 32,
    fontWeight: "400",
    color: "#000000",
  },
  app_box_Icon: {
    height: 160,
    resizeMode: "contain",
  },
  GetStartedContainer: {
    marginLeft: "30%",
    height: "10%",
    width: "40%",
    //height: 40,
    marginTop: "5%",
    backgroundColor: "#FF7072",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    gap: 20,
    shadowColor: "#00000040",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  GetStartedText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  arrowIcon: {
    width: 25,
    height: 25,
    resizeMode: "contain",
    backgroundColor: "white",
    borderRadius: 12.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DoctorPatientLandingPage;
