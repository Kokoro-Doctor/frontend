import React, { useCallback, useState } from "react";
import { Image, StyleSheet, View, TouchableOpacity, Text } from "react-native";

import GeneratePrescription from "../../screens/DoctorScreens/GeneratePrescription";
const SubscriberCard = () => {
  const handleContinueButtonApp = () => {
    navigation.navigate(GeneratePrescription);
  };
  return (
    <View>
      <View style={styles.container}>
        <View style={styles.imageBox}>
          <Image
            //source={require("../../assets/Images/userpic.png")}
            style={styles.imagepic}
          />
        </View>
        <View style={styles.firstTextBox}>
          <View>
            <Text style={{ fontWeight: 600, fontSize: 24, color: "#000000" }}>
              Anamika Singh
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: "28%" }}>
            <Text style={styles.firstBoxText}>Age : 50</Text>
            <Text style={styles.firstBoxText}>Gender : Female</Text>
          </View>
          <View>
            <Text style={styles.firstBoxText}>Condition : Heart Disease</Text>
          </View>
          <View>
            <Text style={styles.firstBoxText}>Status : Cancelled</Text>
          </View>
        </View>
        <View style={styles.secondTextBox}>
          <View style={{ flexDirection: "row", gap: "14%" }}>
            <Text style={{ fontWeight: 400, fontSize: 16, color: "#000000" }}>
              Appointment Date : 18th Oct 2025
            </Text>
            <Text style={{ fontWeight: 500, fontSize: 16, color: "#000000" }}>
              Health Score :
            </Text>
          </View>
          <View>
            <Text style={{ fontWeight: 400, fontSize: 16, color: "#000000" }}>
              Time : 11:00 AM
            </Text>
          </View>
        </View>

        <View style={styles.button}>
          <TouchableOpacity
            style={{ alignItems: "center", justifyContent: "center" }}
            onPress={handleContinueButtonApp}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: 500,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#9B9A9A",
          width: "95%",
          margin: "auto",
        }}
      ></View>
    </View>
  );
};

export default SubscriberCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 0,
    padding: 18,
  },
  imageBox: {
    margin: "1%",
  },
  imagepic: {
    height: 85,
    width: 85,
  },
  firstTextBox: {
    width: "28%",

    borderColor: "#E2E2E2",
  },
  firstBoxText: {
    fontSize: 16,
    color: "#444444",
    fontWeight: 400,
  },
  secondTextBox: {
    width: "40%",

    borderColor: "#E2E2E2",
  },
  button: {
    backgroundColor: "#FF7072",
    alignItems: "center",

    height: "28%",
    alignSelf: "center",
    borderRadius: 5,
    width: "12%",
  },
});
