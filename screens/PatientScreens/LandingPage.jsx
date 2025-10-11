import React, { useCallback } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import Header from "../../components/PatientScreenComponents/Header";
import Title from "../../components/PatientScreenComponents/Title";
import SearchBar from "../../components/PatientScreenComponents/SearchBar";
import { TrackEvent } from "../../utils/TrackEvent";

const { width, height } = Dimensions.get("window");
const LandingPage = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { setChatbotConfig, isChatExpanded, setIsChatExpanded } = useChatbot();
  //const [selectedButton, setSelectedButton] = useState(null);

  const handlePress = (eventName, params, navigateTo) => {
    TrackEvent(eventName, params);
    navigation.navigate("PatientAppNavigation", { screen: navigateTo });
  };

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
                    <Header navigation={navigation} />
                  </View>
                  <View style={styles.title}>
                    <Title />
                  </View>
                  {/* Center Middle */}
                  {!isChatExpanded && (
                    <View style={styles.centerMiddlePart}>
                      <TouchableOpacity
                        style={styles.cardStyle}
                        // onPress={() => {
                        //   navigation.navigate("PatientAppNavigation", {
                        //     screen: "Doctors",
                        //   });
                        // }}
                        onPress={() =>
                          handlePress(
                            "consultation_card_click",
                            {
                              clickText: "Consultation",
                              clickID: "consultation-card",
                            },
                            "Doctors"
                          )
                        }
                      >
                        <Image
                          source={require("../../assets/Images/Consultation.png")}
                          style={styles.image}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardStyle}
                        // onPress={() => {
                        //   navigation.navigate("PatientAppNavigation", {
                        //     screen: "Medilocker",
                        //   });
                        // }}
                        onPress={() =>
                          handlePress(
                            "medilocker_card_click",
                            {
                              clickText: "Medilocker",
                              clickID: "medilocker-card",
                            },
                            "Medilocker"
                          )
                        }
                      >
                        <Image
                          source={require("../../assets/Images/Medilocker.png")}
                          style={styles.image}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardStyle}
                        onPress={() => {
                          navigation.navigate("PatientAppNavigation", {
                            screen: "MobileChatbot",
                          });
                        }}
                      >
                        <Image
                          source={require("../../assets/Images/AI_Support.png")}
                          style={styles.image}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardStyle}
                        onPress={() => {
                          navigation.navigate("PatientAppNavigation", {
                            screen: "Hospitals",
                          });
                        }}
                      >
                        <Image
                          source={require("../../assets/Images/BookHospital.png")}
                          style={styles.image}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
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
            <Header navigation={navigation} />
          </View>

          <View style={styles.searchBar}>
            <SearchBar />
          </View>

          <View style={styles.cards}>
            <View style={styles.cardsRow}>
              <TouchableOpacity
                style={styles.cardStyle}
                onPress={() => {
                  navigation.navigate("PatientAppNavigation", {
                    screen: "Doctors",
                  });
                }}
              >
                <Image
                  source={require("../../assets/Images/Consultation.png")}
                  style={styles.image}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardStyle}
                onPress={() => {
                  navigation.navigate("PatientAppNavigation", {
                    screen: "Medilocker",
                  });
                }}
              >
                <Image
                  source={require("../../assets/Images/Medilocker.png")}
                  style={styles.image}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.cardsRow}>
              <TouchableOpacity
                style={styles.cardStyle}
                onPress={() => {
                  navigation.navigate("PatientAppNavigation", {
                    screen: "Hospitals",
                  });
                }}
              >
                <Image
                  source={require("../../assets/Images/BookHospital.png")}
                  style={styles.image}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardStyle}
                onPress={() => {
                  navigation.navigate("PatientAppNavigation", {
                    screen: "MobileChatbot",
                  });
                }}
                // onPress={() => setShowChatbot(true)}
              >
                <Image
                  source={require("../../assets/Images/twenty-four_Support.png")}
                  style={styles.image}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* <ChatBot/> */}
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
  appContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    // backgroundColor: "pink",
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
    marginHorizontal: "auto",
    alignSelf: "center",
  },
  centerMiddlePart: {
    height: "25%",
    width: "47%",
    marginHorizontal: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardStyle: {
    width: "45%",
    ...Platform.select({
      web: {
        width: width > 1000 ? "23%" : "45%",
        borderColor: "#FFFFFF",
      },
    }),
  },
  image: {
    height: "100%",
    width: "100%",
    borderRadius: 17,
    resizeMode: "contain",
  },
  searchBar: {
    marginTop: "6%",
  },
  cards: {
    height: "60%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    height: "40%",
  },
});

export default LandingPage;
