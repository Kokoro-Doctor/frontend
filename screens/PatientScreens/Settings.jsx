import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  StyleSheet,
  Image,
  Platform,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import Title from "../../components/PatientScreenComponents/Title";
import SearchBar from "../../components/PatientScreenComponents/SearchBar";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import BackButton from "../../components/PatientScreenComponents/BackButton";

const Settings = ({ navigation, route }) => {
  const {width} = useWindowDimensions();
  return (
    <>
      {(Platform.OS === "web" && width > 1000) && (
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

                  <View style={styles.imageBox}>
                    <Image
                      source={require("../../assets/Images/coming_soon.png")}
                      style={styles.comingSoon}
                    />
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

          <View style={styles.imageBox}>
            <Image
              source={require("../../assets/Images/coming_soon.png")}
              style={styles.comingSoon}
            />
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
  appContainer:{
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
      web:{
        width:"100%",
      }
    })
  },
  title: {
    // borderColor: "#FFFFFF",
    // borderWidth: 1,
    marginVertical: "auto",
    alignSelf: "center",
  },
  imageBox: {
    height: "52%",
    width: "54%",
    // borderWidth: 10,
    // borderColor: "#000000",
    alignSelf: "center",
    marginVertical: "auto",
  },
  comingSoon: {
    height: "100%",
    width: "100%",
    //borderWidth: 1,
    resizeMode: "contain",
  },
});

export default Settings;
