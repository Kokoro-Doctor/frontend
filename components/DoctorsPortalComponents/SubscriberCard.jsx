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

  const getInitials = (name = "") => {
    if (!name) return "U";

    const parts = name.trim().split(" ");
    const first = parts[0]?.charAt(0).toUpperCase() || "";
    const last =
      parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";

    return first + last;
  };

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.imageBox}>
          {user.image ? (
            <Image
              source={{ uri: user.image }}
              style={styles.imagepic}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.initialText}>{getInitials(user.name)}</Text>
          )}
        </View>

        <View style={styles.firstTextBox}>
          <Text style={styles.name}>{user.name}</Text>

          <View style={{ flexDirection: "row", gap: "28%" }}>
            <Text style={styles.firstBoxText}>Age : {user.age}</Text>
            <Text style={styles.firstBoxText}>Gender : {user.gender}</Text>
          </View>

          <Text style={styles.firstBoxText}>Condition : {user.condition}</Text>
          <Text style={styles.firstBoxText}>Status : {user.status}</Text>
        </View>

        <View style={styles.secondTextBox}>
          <View style={{ flexDirection: "row", gap: "14%" }}>
            <Text style={styles.secondText}>
              Appointment Date : {user.date}
            </Text>
            <Text style={styles.score}>Health Score :</Text>
          </View>

          <Text style={styles.secondText}>Time : {user.time}</Text>
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
    padding: "1%",
    borderWidth: 2,
    width: "97%",
    height: "10%",
    alignSelf: "center",
    borderColor: "#c2c1c1ff",
    boxShadow:
      "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
    borderRadius:5
  },
  imageBox: {
    borderWidth: 1,
    marginTop: "0%",
    marginRight: "0.6%",
    marginLeft: "1%",
    height: "74%",
    width: "5.7%",
    borderRadius: 50,
    backgroundColor:"#efefefff",
    borderColor:"#fbf9f9ff"
  },
  imagepic: {
    height: 45,
    width: 45,
    alignSelf: "center",
  },
  
  initialText: {
    alignSelf: "center",
    fontSize:30,
    fontWeight:600,
    color:"#d10f0fff",
    marginTop:"10%"
  },
  firstTextBox: {
    width: "28%",
    borderColor: "#E2E2E2",
  },
  name:{
    fontSize:21,
    fontWeight:500
  },
  firstBoxText: {
    fontSize: 14,
    color: "#444444",
    fontWeight: 400,
  },
  secondTextBox: {
    width: "40%",
    borderColor: "#E2E2E2",
  },
  secondText:{
    fontSize:15,
    fontWeight:500
  },
  button: {
    backgroundColor: "#FF7072",
    alignItems: "center",
    height: "37%",
    alignSelf: "center",
    borderRadius: 5,
    width: "12%",
    marginHorizontal:"8%",
    padding:"0.4%"
  },
});
