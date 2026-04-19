import React, { useCallback, useRef, useState } from "react";
import {
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Animated,
} from "react-native";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import Title from "../../components/PatientScreenComponents/Title";
import SearchBar from "../../components/PatientScreenComponents/SearchBar";
import HospitalSidebarNavigation from "../../components/HospitalPortalComponent/HospitalSideBarNavigation";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const HospitalPortalLandingPage = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { setChatbotConfig, isChatExpanded, setIsChatExpanded } = useChatbot();
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [showLabel, setShowLabel] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  // useFocusEffect(
  //   useCallback(() => {
  //     setChatbotConfig({ height: "57%" });
  //     setShowLabel(true); // show text immediately
  //     borderAnim.setValue(0);
  //     const timer = setTimeout(() => {
  //       Animated.loop(
  //         // keeps the bounce continuous
  //         Animated.sequence([
  //           Animated.spring(borderAnim, {
  //             toValue: 1,
  //             friction: 2,
  //             tension: 100,
  //             useNativeDriver: true,
  //           }),
  //           Animated.spring(borderAnim, {
  //             toValue: 1,
  //             friction: 1,
  //             tension: 100,
  //             useNativeDriver: true,
  //           }),
  //         ]),
  //       ).start();
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }, [borderAnim, setChatbotConfig]),
  // );
  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });

      glowAnim.setValue(0);

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false, // important for shadow
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    }, [glowAnim, setChatbotConfig]),
  );

  const glowStyle = {
    // 🔥 BOLD BORDER
    borderWidth: 6.5,
    borderRadius: 22,

    borderColor: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(211, 47, 159, 0.5)", "rgba(206, 83, 217, 1)"],
    }),

    // 🌟 SOFT SHADOW (web + iOS)
    shadowColor: "#00ffcc",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 25],
    }),

    // 📱 ANDROID fallback
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [6, 18],
    }),
  };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require("../../assets/HospitalPortal/Images/hospital_background_image.jpg")}
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
                  <HospitalSidebarNavigation navigation={navigation} />
                </View>
                <View style={styles.Right}>
                  {/* <View style={styles.header}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View> */}
                  <View style={styles.title}>
                    <Title />
                  </View>
                  {/* Center Middle */}
                  {!isChatExpanded && (
                    <View style={styles.centerMiddlePart}>
                      <Animated.View style={[styles.cardStyle, glowStyle]}>
                        <View
                          style={{
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            borderRadius: 18,
                          }}
                        >
                          <Animated.View
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              top: -10,
                              bottom: -10,
                              left: -10,
                              right: -10,
                              borderRadius: 25,
                              backgroundColor: "rgba(0,255,200,0.25)",
                              opacity: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.2, 0.5],
                              }),
                              transform: [
                                {
                                  scale: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.95, 1.05],
                                  }),
                                },
                              ],
                            }}
                          />

                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate("HospitalAppNavigation", {
                                screen: "HospitalInsuranceClaim",
                              });
                            }}
                            style={{ flex: 1 }}
                          >
                            <Image
                              source={require("../../assets/HospitalPortal/Images/insurance-claim.png")}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 18,
                              }}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        </View>
                      </Animated.View>
                      {/* <Animated.View style={[styles.cardStyle, glowStyle]}>
                      
                        <Animated.View
                          pointerEvents="none"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 18,
                            backgroundColor: "rgba(0,255,200,0.15)",

                            opacity: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.2, 0.5],
                            }),

                            zIndex: 0, // 👈 IMPORTANT

                            ...(Platform.OS === "web" && {
                              boxShadow: "0px 0px 40px rgba(0,255,200,0.6)",
                            }),
                          }}
                        />

                  
                        <TouchableOpacity
                          style={{ flex: 1, zIndex:2 }}
                          onPress={() => {
                            navigation.navigate("HospitalAppNavigation", {
                              screen: "HospitalInsuranceClaim",
                            });
                          }}
                        >
                          <Image
                            source={require("../../assets/HospitalPortal/Images/insurance-claim.png")}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 18,
                              zIndex:2
                            }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      </Animated.View> */}
                      <TouchableOpacity
                        style={styles.cardStyle}
                        onPress={() => {
                          navigation.navigate("HospitalAppNavigation", {
                            screen: "DataIntegrations",
                          });
                        }}
                      >
                        <Image
                          source={require("../../assets/HospitalPortal/Images/ai_integration.png")}
                          style={styles.image}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cardStyle}
                        onPress={() => {
                          navigation.navigate("HospitalAppNavigation", {
                            screen: "HospitalDashboard",
                          });
                        }}
                      >
                        <Image
                          source={require("../../assets/HospitalPortal/Images/dashboard.png")}
                          style={styles.image}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cardStyle}
                        onPress={() => {
                          navigation.navigate("HospitalAppNavigation", {
                            screen: "PostOpCare",
                          });
                        }}
                      >
                        <Image
                          source={require("../../assets/HospitalPortal/Images/post_op_care.png")}
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
        <View style={MobileStyles.appContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={[MobileStyles.header, { height: "15%" }]}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>

          <View style={MobileStyles.searchBar}>
            <SearchBar />
          </View>

          <View style={MobileStyles.cards}>
            <View style={MobileStyles.cardsRow}>
              {/* <TouchableOpacity
                style={MobileStyles.cardStyle}
                onPress={() => {
                  navigation.navigate("HospitalAppNavigation", {
                    screen: "HospitalInsuranceClaim",
                  });
                }}
              >
                <Image
                  source={require("../../assets/HospitalPortal/Images/Hospital_card4.png")}
                  style={MobileStyles.image}
                />
              </TouchableOpacity> */}
              <Animated.View style={[MobileStyles.cardStyle, glowStyle]}>
                <TouchableOpacity
                  style={{ width: "100%", height: "100%" }}
                  onPress={() => {
                    navigation.navigate("HospitalAppNavigation", {
                      screen: "HospitalInsuranceClaim",
                    });
                  }}
                >
                  <Image
                    source={require("../../assets/HospitalPortal/Images/Hospital_card4.png")}
                    style={MobileStyles.image}
                  />
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity
                style={MobileStyles.cardStyle}
                onPress={() => {
                  navigation.navigate("HospitalAppNavigation", {
                    screen: "DataIntegrations",
                  });
                }}
              >
                <ImageBackground
                  source={require("../../assets/HospitalPortal/Images/Hospital_card2.png")}
                  style={styles.image}
                  imageStyle={{ borderRadius: 17 }}
                >
                  {/* 🔥 REAL BLUR LAYER */}
                  <BlurView
                    intensity={9.5}
                    tint="dark"
                    style={MobileStyles.blur}
                  />

                  {/* 🔥 LIGHT GRADIENT (very subtle) */}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.25)"]}
                    style={MobileStyles.gradient}
                  />

                  {/* TEXT */}
                  <Text style={MobileStyles.cardText}>AI Integration</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
            <View style={MobileStyles.cardsRow}>
              <TouchableOpacity
                style={MobileStyles.cardStyle}
                onPress={() => {
                  navigation.navigate("HospitalAppNavigation", {
                    screen: "HospitalDashboard",
                  });
                }}
              >
                <Image
                  source={require("../../assets/HospitalPortal/Images/Hospital_cta.png")}
                  style={MobileStyles.image}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={MobileStyles.cardStyle}
                onPress={() => {
                  navigation.navigate("HospitalAppNavigation", {
                    screen: "PostOpCare",
                  });
                }}
              >
                <Image
                  source={require("../../assets/HospitalPortal/Images/Hospital_card1.png")}
                  style={MobileStyles.image}
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
    marginTop:"4%"
  },
  // centerMiddlePart: {
  //   height: "25%",
  //   width: "47%",
  //   marginHorizontal: "auto",
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   //alignItems: "center",
  // },
  centerMiddlePart: {
    minHeight: 220, // 🔥 important
    width: "47%",
    marginHorizontal: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // cardStyle: {
  //   width: "45%",
  //   ...Platform.select({
  //     web: {
  //       width: width > 1000 ? "23%" : "45%",
  //       borderColor: "#FFFFFF",
  //       borderRadius: 18,
  //       alignItems: "center",
  //       backgroundColor: "transparent",
  //       justifyContent: "center",
  //       height: "100%",
  //     },
  //   }),
  // },
  cardStyle: {
    width: "45%",
    ...Platform.select({
      web: {
        width: width > 1000 ? "23%" : "45%",
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        height: 200, // 🔥 FIXED HEIGHT (must for web)
      },
    }),
  },
  AiCard: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "23%",
    height: "96%",
    marginVertical: "0.5%",
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
const MobileStyles = StyleSheet.create({
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
    //alignItems: "center",
  },

  cardStyle: {
    width: "45%",
    aspectRatio: 0.93, // ✅ taller cards (like your design)
    borderRadius: 15,
    overflow: "hidden",
  },
  AiCard: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "23%",
    height: "96%",
    marginVertical: "0.5%",
  },
  image: {
    height: "100%", // ✅ FIX
    width: "100%", // ✅ FIX
    borderRadius: 17,
    resizeMode: "cover",
  },
  searchBar: {
    marginTop: "6%",
  },
  cards: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    marginTop: "10%", // ✅ control spacing manually
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },

  blur: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%", // 🔥 not too tall
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },

  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },

  cardText: {
    position: "absolute",
    bottom: 35,
    left: 14,
    right: 12, // 🔥 helps alignment look centered like design

    color: "#EAEAEA", // 🔥 not pure white (important)
    fontSize: 14,
    fontWeight: "600",

    // subtle softness
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default HospitalPortalLandingPage;
