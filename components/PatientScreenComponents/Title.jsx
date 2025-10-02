import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";

const Title = () => {
  const { width } = useWindowDimensions(); // Dynamically updates when screen resizes
  const baseFontSize = 18;
  const scaleFactor = width / 1440;
  const responsiveFontSize = baseFontSize * scaleFactor;

  return (
    <View style={styles.container}>

      <View style={{marginLeft: 5}}>
        <Text style={[styles.incubatedText, { fontSize: responsiveFontSize }]}>
          Harvard Innovation Lab I-Member presents
        </Text>
      </View>

      <View>
        <Text style={[styles.brandName, { fontSize: responsiveFontSize * 5, lineHeight: 80 }]}>
          Kokoro.
          <Text style={[styles.doctorText]}>Doctor</Text>
        </Text>
      </View>

      <View style={{marginLeft: 15, marginTop: 2}}>
        <Text style={[styles.tagline, { fontSize: responsiveFontSize }]}>
          Redefining Heart and Reproductive Healthcare with AI
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    flexDirection: "column",
  },
  incubatedText: {
    color: "#e0a8c8",
    fontWeight: "600",
    marginBottom:0,
  },
  brandName: {
    fontWeight: "bold",
    color: "#D0C4FF",
  },
  doctorText: {
    color: "#B0A0FF",
  },
  tagline: {
    alignSelf: "flex-end",
    color: "#e0a8c8",
    fontWeight: "600",
  },
});

export default Title;