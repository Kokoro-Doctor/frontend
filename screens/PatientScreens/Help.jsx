import React from "react";
import {
  ImageBackground,
  Text,
  View,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  Dimensions,
  StatusBar,
} from "react-native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";

import Title from "../../components/PatientScreenComponents/Title";
import SearchBar from "../../components/PatientScreenComponents/SearchBar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import BackButton from "../../components/PatientScreenComponents/BackButton";

const { width, height } = Dimensions.get("window");

const Help = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
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
                  <BackButton />
                  <View style={styles.title}>
                    <Title />
                  </View>
                  <View style={styles.Helpbox}>
                    <View style={styles.headerContainer}>
                      <Text style={styles.head}>Help</Text>
                    </View>
                    <View style={styles.contentContainer}>
                      <Text style={styles.sectionTitle}>FAQs</Text>
                      <Text style={styles.question}>
                        How can I improve my heart health?
                      </Text>
                      <Text style={styles.answer}>
                        Eat well, exercise, manage stress, and avoid smoking.
                      </Text>

                      <Text style={styles.question}>
                        What are heart disease symptoms?
                      </Text>
                      <Text style={styles.answer}>
                        Chest pain, shortness of breath, fatigue, and dizziness.
                        See a doctor if you experience these.
                      </Text>

                      <Text style={styles.question}>
                        When should I check my heart health?
                      </Text>
                      <Text style={styles.answer}>
                        Regular check-ups are important, especially if you have
                        risk factors.
                      </Text>

                      <Text style={styles.question}>
                        What’s a healthy blood pressure?
                      </Text>
                      <Text style={styles.answer}>
                        Below 120/80 mm Hg is ideal.
                      </Text>

                      <Text style={styles.sectionTitle}>Resources</Text>
                      <Text style={styles.resource}>Heart Health Tips</Text>
                      <Text style={styles.resource}>
                        Exercise & Nutrition Guides
                      </Text>
                      <Text style={styles.resource}>Find a Doctor</Text>
                      <Pressable
                        onPress={() => {
                          navigation.navigate("ContactUs");
                        }}
                      >
                        <Text style={styles.contact}>
                          For more help,{" "}
                          <Text style={styles.link}>contact us</Text>.
                        </Text>
                      </Pressable>
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
            <HeaderLoginSignUp navigation={navigation} />
          </View>

          <View style={styles.searchBar}>
            <SearchBar />
          </View>

          <View style={styles.Helpbox}>
            <View style={styles.headerContainer}>
              <Text style={styles.head}>Help</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>FAQs</Text>
              <Text style={styles.question}>
                How can I improve my heart health?
              </Text>
              <Text style={styles.answer}>
                Eat well, exercise, manage stress, and avoid smoking.
              </Text>

              <Text style={styles.question}>
                What are heart disease symptoms?
              </Text>
              <Text style={styles.answer}>
                Chest pain, shortness of breath, fatigue, and dizziness. See a
                doctor if you experience these.
              </Text>

              <Text style={styles.question}>
                When should I check my heart health?
              </Text>
              <Text style={styles.answer}>
                Regular check-ups are important, especially if you have risk
                factors.
              </Text>

              <Text style={styles.question}>
                What’s a healthy blood pressure?
              </Text>
              <Text style={styles.answer}>Below 120/80 mm Hg is ideal.</Text>

              <Text style={styles.sectionTitle}>Resources</Text>
              <Text style={styles.resource}>Heart Health Tips</Text>
              <Text style={styles.resource}>Exercise & Nutrition Guides</Text>
              <Text style={styles.resource}>Find a Doctor</Text>
              <Pressable
                onPress={() => {
                  navigation.navigate("ContactUs");
                }}
              >
                <Text style={styles.contact}>
                  For more help, <Text style={styles.link}>contact us</Text>.
                </Text>
              </Pressable>
            </View>
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
    marginVertical: "auto",
    alignSelf: "center",
  },
  Helpbox: {
    flexDirection: "row",
    padding: 10,
    width: "95%",
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginVertical: "auto",
    alignItems: "flex-start",
    ...Platform.select({
      web: {
        width: width > 1000 ? "60%" : "95%",
        height: width > 1000 ? "65%" : "65%",
      },
    }),
  },
  contain: {
    flexDirection: "column",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  contentContainer: {
    flex: 3,
  },
  head: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5a34cc",
    marginTop: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  answer: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  resource: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  contact: {
    fontSize: 14,
    color: "#333",
    marginTop: 10,
  },
  link: {
    color: "#5a34cc",
    fontWeight: "bold",
    alignItems: "flex-start",
  },

  // contain: {
  //   flexDirection: "column",
  //   padding: 20,
  //   backgroundColor: "#f5f5f5",
  // },
  // headerContainer: {
  //   flex: 1,
  //   justifyContent: "flex-start",
  // },
  // contentContainer: {
  //   flex: 3,
  // },
  // head: {
  //   fontSize: 35,
  //   fontWeight: "bold",
  //   color: "#333",
  //   marginBottom: 20,
  // },
  // sectionTitle: {
  //   fontSize: 18,
  //   fontWeight: "bold",
  //   color: "#5a34cc",
  //   marginTop: 15,
  // },
  // question: {
  //   fontSize: 16,
  //   fontWeight: "bold",
  //   color: "#333",
  //   marginTop: 10,
  // },
  // answer: {
  //   fontSize: 14,
  //   color: "#555",
  //   marginBottom: 10,
  // },
  // resource: {
  //   fontSize: 14,
  //   color: "#333",
  //   marginTop: 5,
  // },
  // contact: {
  //   fontSize: 14,
  //   color: "#333",
  //   marginTop: 10,
  // },
  // link: {
  //   color: "#5a34cc",
  //   fontWeight: "bold",
  // },
});

export default Help;
