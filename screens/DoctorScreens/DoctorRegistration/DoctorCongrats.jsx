import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  Linking,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Header from "../../../components/PatientScreenComponents/Header";
import NewSideNav from "../../../components/DoctorsPortalComponents/NewSideNav";
import { useRegistration } from "../../../contexts/RegistrationContext";
//import { AntDesign } from "@expo/vector-icons"; // or use react-native-vector-icons

// const { width, height } = Dimensions.get("window");

const DoctorCongrats = ({ navigation }) => {
  const { setIsRegistered } = useRegistration();

  useEffect(() => {
    setIsRegistered(true);
  }, [setIsRegistered]);
  const { width } = useWindowDimensions();

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.parent}>
          <NewSideNav navigation={navigation} />

          <View style={styles.right}>
            <View style={styles.container}>
              <Text style={styles.congratsText}>Congratulations</Text>
              <Text style={styles.registrationText}>
                Your registration is complete!
              </Text>

              <Image
                source={require("../../../assets/DoctorsPortal/Icons/congrats.jpg")} // Replace with your image path
                style={styles.image}
                resizeMode="contain"
              />

              <Text style={styles.thankText}>
                Thank You for Registering on Kokoro.Doctor!
              </Text>

              <Text style={styles.infoText}>
                We appreciate your time and effort in joining our platform. Our
                team will review your details, and we’ll reach out to you once
                the verification process is complete.
              </Text>

              <Text style={styles.welcomeText}>Welcome to Kokoro.Doctor!</Text>

              <TouchableOpacity
                onPress={() => Linking.openURL("mailto:support@kokoro.doctor")}
              >
                <Text style={styles.supportLink}>
                  For any queries, feel free to contact our support team.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {(Platform.OS !== "web" || width < 1000) && (
        <SafeAreaView style={styles.fullScreen}>
          <ScrollView>
            {/* <View style={styles.header}>

              <View style={[styles.fdRow]}>
                <View styles={styles.sidebarImage}>
                  <TouchableOpacity>
                    <Image
                      source={require("../../../assets/Images/sidebarlogo.png")}
                      style={styles.sidebarLogo}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.kokoroImage}>
                  <Image
                    source={require("../../../assets/Images/kokorologooo.png")}
                    style={styles.kokoroIcon}
                  />
                  <Text style={styles.kokoroText}>Kokoro.Doctor</Text>
                </View>
              </View>
                
              <View style={[styles.fdRow]}>
                <View style={styles.lastHeader}>
                  <View>
                    <TouchableOpacity>
                      <Image
                        source={require("../../../assets/Images/user.png")}
                        style={styles.userIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity>
                    <Image
                      source={require("../../../assets/Images/notifications-on.png")}
                      style={styles.notificationIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

            </View> */}
            <View>
              {/* <Header></Header> */}
              <Header navigation={navigation} isDoctorPortal={true} />
            </View>

            <View styles={styles.middleContainer}>
              <View style={styles.CongratsImage}>
                <Image
                  source={require("../../../assets/Images/Congratulations.png")}
                  style={styles.congratulationsImage}
                />
              </View>
              <View style={styles.register}>
                <Text style={styles.registrationText}>
                  Your registration is complete!
                </Text>
              </View>
              <View style={styles.congrats}>
                <Image
                  source={require("../../../assets/DoctorsPortal/Icons/congrats.jpg")}
                  style={styles.image}
                />
              </View>
              <View style={styles.secondText}>
                <Text style={styles.thankText}>
                  Thank You for Registering on Kokoro.Doctor!
                </Text>
              </View>
              <View style={styles.thirdText}>
                <Text style={styles.infoText}>
                  We appreciate your time and effort in joining our platform.
                  Our team will review your details, and we’ll reach out to you
                  once the verification process is complete.
                </Text>
              </View>
              <View style={styles.fourthText}>
                <Text style={styles.welcomeText}>
                  Welcome to Kokoro.Doctor!
                </Text>
              </View>

              <TouchableOpacity
                style={styles.lastText}
                onPress={() => Linking.openURL("mailto:support@kokoro.doctor")}
              >
                <Text style={styles.supportLink}>
                  For any queries, feel free to contact our support team.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button}>
                <View style={styles.innerContent}>
                  <Text style={styles.text}>Continue</Text>
                  <View style={styles.ArrowButton}>
                    <Image
                      source={require("../../../assets/Images/Arroww.png")}
                      style={styles.ArrowwImage}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  fdRow: {
    flexDirection: "row",
    gap: 10,
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },

  right: {
    height: "100%",
    width: "85%",
    overflow: "hidden",
  },
  container: {
    width: windowWidth * 0.85,
    height: "100%",
    backgroundColor: "#fffafa",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  congratsText: {
    fontSize: 40,
    fontWeight: "600",
    color: "#f76c6c",
    fontStyle: "italic",
    fontFamily: "Caveat",
    marginBottom: 8,
  },
  registrationText: {
    fontSize: 16,
    ...Platform.select({
      web: {
        fontSize: 24,
        color: "#000",
        fontWeight: "500",
        marginBottom: 24,
      },
    }),
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  thankText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#000",
  },

  infoText: {
    lineHeight: 15,
    textAlign: "center",
    maxWidth: 350,
    ...Platform.select({
      web: {
        fontSize: 13,
        color: "#444",
        lineHeight: 20,
        textAlign: "center",
        maxWidth: 230,
        marginBottom: 24,
      },
    }),
  },

  welcomeText: {
    marginTop: "3%",
    fontSize: 24,
    color: "#f76c6c",
    alignItems: "center",

    ...Platform.select({
      web: {
        fontSize: windowWidth > 1000 ? 40 : 26,
        color: "#f76c6c",
        fontWeight: "600",
        marginBottom: 16,
      },
    }),
  },

  supportLink: {
    fontSize: 10,
    textDecorationLine: "underline",
    color: "#444",
  },
  header: {
    flexDirection: "row",
    marginTop: "12%",
    margin: "5%",
    gap: "2%",
    justifyContent: "space-between",
  },
  kokoroImage: {
    flexDirection: "row",
  },
  kokoroText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  userIcon: {
    height: 19,
    width: 19,
  },
  notificationIcon: {
    height: 20,
    width: 23,
  },
  lastHeader: {
    flexDirection: "row",
    gap: 10,
  },
  congratulationsImage: {
    height: 20,
    width: 120,
  },
  CongratsImage: {
    marginTop: "13%",
    width: "100%",
    alignItems: "center",
  },
  register: {
    width: "100%",
    alignItems: "center",
    marginTop: "3%",
  },
  congrats: {
    width: "100%",
    alignItems: "center",
  },
  secondText: {
    width: "100%",
    alignItems: "center",
  },
  thirdText: {
    alignItems: "center",

    width: "100%",
  },
  fourthText: {
    width: "100%",
    alignItems: "center",
  },
  lastText: {
    alignItems: "center",
    width: "100%",
    marginTop: "5%",
  },
  continueImage: {
    flexDirection: "row",
    height: "15%",
    width: "100%",
    alignItems: "center",
  },
  button: {
    marginTop: "10%",
    backgroundColor: "#FF6B6B",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: "65%",
    alignItems: "center",
    marginBottom: "5%",
  },
  innerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 10,
  },
  ArrowwImage: {
    backgroundColor: "#fff",
    width: 20,
    height: 20,

    resizeMode: "contain",
  },
  ArrowButton: {
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 50,
  },
});

export default DoctorCongrats;
