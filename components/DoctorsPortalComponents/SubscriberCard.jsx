import React from "react";
import { Image, StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SubscriberCard = ({ user }) => {
  const navigation = useNavigation();

  const handleContinueButtonApp = () => {
    navigation.navigate("GeneratePrescription", {
      userId: user.id,
    });
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.imageBox}>
          <Image
            source={
              user.image
                ? { uri: user.image }
                : require("../../assets/Icons/Users.png")
            }
            style={styles.imagepic}
          />
        </View>

        <View style={styles.firstTextBox}>
          <Text style={styles.name}>{user.name}</Text>

          <View style={{ flexDirection: "row", gap: "28%" }}>
            <Text style={styles.firstBoxText}>Age : {user.age}</Text>
            <Text style={styles.firstBoxText}>Gender : {user.gender}</Text>
          </View>

          <Text style={styles.firstBoxText}>
            Condition : {user.condition}
          </Text>
          <Text style={styles.firstBoxText}>
            Status : {user.status}
          </Text>
        </View>

        <View style={styles.secondTextBox}>
          <View style={{ flexDirection: "row", gap: "14%" }}>
            <Text style={styles.secondText}>
              Appointment Date : {user.date}
            </Text>
            <Text style={styles.score}>Health Score :</Text>
          </View>

          <Text style={styles.secondText}>
            Time : {user.time}
          </Text>
        </View>

        <View style={styles.button}>
          <TouchableOpacity onPress={handleContinueButtonApp}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
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
