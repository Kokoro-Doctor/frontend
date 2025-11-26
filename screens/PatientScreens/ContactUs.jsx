import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Linking,
  Platform,
  useWindowDimensions,
  Dimensions,
  StatusBar,
} from "react-native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import Title from "../../components/PatientScreenComponents/Title";
import SearchBar from "../../components/PatientScreenComponents/SearchBar";

const { width, height } = Dimensions.get("window");

const ContactUs = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          <SideBarNavigation navigation={navigation} />

          <View style={styles.imageContainer}>
            <ImageBackground
              source={require("../../assets/Images/main_background.jpg")}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <View
                style={[
                  styles.overlay,
                  { backgroundColor: "rgba(0, 0, 0, 0.6)" },
                ]}
              />
              <View style={styles.parent}>
                <View style={styles.Left}>
                  <SideBarNavigation navigation={navigation} />
                </View>
                <View style={styles.Right}>
                  <View style={styles.header}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View>
                  <View style={styles.title}>
                    <Title />
                  </View>
                  <View style={styles.Contactbox}>
                    <Text style={styles.Contact}>Contact Us</Text>

                    {/* Clickable Website */}
                    <TouchableOpacity onPress={() => Linking.openURL("")}>
                      <Text style={styles.website}>
                        Website:{" "}
                        <Text style={styles.linkText}>Kokoro.Doctor</Text>
                      </Text>
                    </TouchableOpacity>

                    {/* Clickable Phone Number (Optional, if needed) */}
                    <TouchableOpacity onPress={() => Linking.openURL("")}>
                      <Text style={styles.contact}>
                        Phone: <Text style={styles.linkText}>7060334160</Text>
                      </Text>
                    </TouchableOpacity>

                    {/* Social Media Section */}
                    <View style={styles.socialmedia}>
                      <Text style={styles.socialtext}>Social:</Text>
                      <View style={styles.iconContainer}>
                        <View style={styles.socialIconBox}>
                          <TouchableOpacity
                            onPress={() =>
                              Linking.openURL(
                                "https://www.linkedin.com/company/metafiedkokoro"
                              )
                            }
                          >
                            <Image
                              source={require("../../assets/Icons/LinkedIn.png")}
                              style={styles.socialIcon}
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.socialIconBox}>
                          <TouchableOpacity
                            onPress={() =>
                              Linking.openURL(
                                "https://www.instagram.com/kokoro.doc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                              )
                            }
                          >
                            <Image
                              source={require("../../assets/Icons/instagram.png")}
                              style={styles.socialIcon}
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.socialIconBox}>
                          <TouchableOpacity
                            onPress={() => Linking.openURL("/")}
                          >
                            <Image
                              source={require("../../assets/Icons/twitter.png")}
                              style={styles.socialIcon}
                            />
                          </TouchableOpacity>
                        </View>

                        <View style={styles.socialIconBox}>
                          <TouchableOpacity
                            onPress={() => Linking.openURL("/")}
                          >
                            <Image
                              source={require("../../assets/Icons/youtube.png")}
                              style={styles.socialIcon}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Clickable Email */}
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL("mailto:business.support@kokoro.doctor")
                      }
                    >
                      <Text style={styles.Email}>
                        Email:{" "}
                        <Text style={styles.linkText}>
                          business.support@kokoro.doctor
                        </Text>
                      </Text>
                    </TouchableOpacity>
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
            <HeaderLoginSignUp navigation={navigation} />
          </View>

          <View style={styles.searchBar}>
            <SearchBar />
          </View>

          <View style={styles.Contactbox}>
            <Text style={styles.Contact}>Contact Us</Text>

            {/* Clickable Website */}
            <TouchableOpacity onPress={() => Linking.openURL("")}>
              <Text style={styles.website}>
                Website: <Text style={styles.linkText}>Kokoro.Doctor</Text>
              </Text>
            </TouchableOpacity>

            {/* Clickable Phone Number (Optional, if needed) */}
            <TouchableOpacity onPress={() => Linking.openURL("")}>
              <Text style={styles.contact}>
                Phone: <Text style={styles.linkText}>7060334160</Text>
              </Text>
            </TouchableOpacity>

            {/* Social Media Section */}
            <View style={styles.socialmedia}>
              <Text style={styles.socialtext}>Social:</Text>
              <View style={styles.iconContainer}>
                <View style={styles.socialIconBox}>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        "https://www.linkedin.com/company/metafiedkokoro"
                      )
                    }
                  >
                    <Image
                      source={require("../../assets/Icons/LinkedIn.png")}
                      style={styles.socialIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.socialIconBox}>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        "https://www.instagram.com/kokoro.doc?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                      )
                    }
                  >
                    <Image
                      source={require("../../assets/Icons/instagram.png")}
                      style={styles.socialIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.socialIconBox}>
                  <TouchableOpacity onPress={() => Linking.openURL("/")}>
                    <Image
                      source={require("../../assets/Icons/twitter.png")}
                      style={styles.socialIcon}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.socialIconBox}>
                  <TouchableOpacity onPress={() => Linking.openURL("/")}>
                    <Image
                      source={require("../../assets/Icons/youtube.png")}
                      style={styles.socialIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Clickable Email */}
            <TouchableOpacity
              onPress={() =>
                Linking.openURL("mailto:business.support@kokoro.doctor")
              }
            >
              <Text style={styles.Email}>
                Email:{" "}
                <Text style={styles.linkText}>
                  business.support@kokoro.doctor
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //borderWidth: 3,
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
    // backgroundColor: "pink",
  },
  imageContainer: {
    //borderWidth: 2,
    borderColor: "#00ffff",
    height: "100%",
    width: "100%",
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
    //borderWidth: 1,
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    //transform:[{scale:0.8}],
    opacity: 80,
    //marginVertical:"-5%"
    alignSelf: "center",
    flexDirection: "column",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    // borderWidth: 5,
    // borderColor: "black",
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  title: {
    // borderColor: "#FFFFFF",
    // borderWidth: 1,
    marginVertical: "auto",
    alignSelf: "center",
  },
  Contactbox: {
    height: "28%",
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginVertical: "auto",
    ...Platform.select({
      web: {
        width: width > 1000 ? "68%" : "95%",
        height: width > 1000 ? "37%" : "28%",
      },
    }),
  },
  Contact: {
    fontWeight: 600,
    fontSize: 35,
    color: "rgba(19, 19, 19, 0.8)",
    marginHorizontal: "4%",
    marginVertical: "2%",
  },
  website: {
    color: "#000000",
    fontSize: 19,
    fontWeight: 600,
    marginHorizontal: "5%",
    marginVertical: "0.5%",
  },
  contact: {
    color: "#000000",
    fontSize: 19,
    fontWeight: 600,
    marginHorizontal: "5%",
    marginVertical: "0.5%",
  },
  socialmedia: {
    height: 30,
    width: 300,
    flexDirection: "row",
    marginHorizontal: "5%",
    marginVertical: "0.5%",
  },
  Email: {
    color: "#000000",
    fontSize: 19,
    fontWeight: 600,
    marginHorizontal: "5%",
    marginVertical: "0%",
  },
  socialtext: {
    color: "#000000",
    fontSize: 19,
    fontWeight: 600,
    bottom: 2,
  },
  iconContainer: {
    flexDirection: "row",
    height: "68%",
    width: "40%",
    marginHorizontal: "3%",
    marginVertical: "1%",
    justifyContent: "space-around",
    //borderWidth: 1,
  },
  socialIconBox: {
    height: "100%",
    width: "17%",
    //borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "rgba(174, 173, 173, 0.4)",
  },
  socialIcon: {
    height: 12,
    width: 12,
    marginVertical: "20%",
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
  },
  linkText: {
    fontSize: 18,
    fontWeight: 400,
  },
});

export default ContactUs;
