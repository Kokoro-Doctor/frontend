import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Props:
 *  <DoctorSuggestion
      doctor={{
        name: "Dr Kislay Shrivasatva",
        degree: "MD, MS",
        experience: 22,
        location: "Bhopal, Madhya Pradesh",
        likes: 1009,
        rating: 4.9,
        image: require("../../assets/Images/dr_kislay.jpg"),
      }}
    />
 */
const DoctorCard = ({ doctor }) => {
  
    

  return (
    <View style={styles.card}>
      {/* TOP: image + likes + rating (single row) */}
      <View style={styles.topRow}>

        <View style={styles.topRight}>
          <View style={styles.img}>
            <Image source={doctor.image} style={styles.avatar} />
          </View>
          <View style={styles.likeRow}>
            <MaterialIcons name="favorite" size={18} color="#ff6e6e" />
            <Text style={styles.likeText}>{doctor.likes ?? 0}</Text>
          </View>

          <TouchableOpacity style={styles.ratingPill}>
            <MaterialIcons name="star" size={14} color="#f5b400" />
            <Text style={styles.ratingText}>{doctor.rating ?? "—"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MIDDLE: name, degree, experience, location */}
      <View style={styles.infoBlock}>
        <Text style={styles.nameText}>{doctor.name}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{doctor.degree}</Text>
          <Text style={[styles.metaText, styles.dot]}>|</Text>
          <Text style={styles.metaText}>{`(${doctor.experience ?? 0} Years Exp)`}</Text>
        </View>

        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color={"#1680ECBF"}/>
          <Text style={styles.locationText}>{doctor.location}</Text>
        </View>
      </View>

      {/* BUTTONS: Book Appointment + View Details */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8}>
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8}>
          <Text style={styles.detailsText}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER: Verified */}
      <View style={styles.footer}>
        {/* Add your MCI image here */}
        <Image
          source={require("../../assets/Images/drmci.png")}
          style={styles.imagepic}
        />
        <Text style={styles.verifiedText}>Verified</Text>
        <Text style={styles.byText}>by</Text>
        <Text style={styles.mciText}>MCI</Text>
      </View>
    </View>
  );
};

export default DoctorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // Android elevation
    elevation: 3,
    width: Platform.OS === "web" ? "30%" : "90%",
  },

  /* TOP */
  topRow: {
    flexDirection: "row", // image and the small right column
    alignItems: "center",
  },
  img: {
    // marginRight: 25,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#eee",
    alignContent: "center",
  },
  topRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginLeft: 20,
  },
  likeText: {
    marginLeft: 4,
    
    fontWeight: "600",
    
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    
    
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "400",
  },

  /* INFO */
  infoBlock: {
    marginTop: 12,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    fontStyle:"poppins",
    fontSize: 24,
    fontWeight: "600",
    color:"#000000",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
    color:"#444444",
  },
  dot: {
    marginHorizontal: 8,
    color: "#ccc",
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  locationText: {
    
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
  },

  /* BUTTONS */
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  bookBtn: {
    backgroundColor: "#ff7b78",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 12,
    alignItems: "center",
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
  detailsBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  detailsText: {
    color: "#ff7b78",
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  /* FOOTER */
  footer: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  verifiedText: {
    color: "#25BA58",
    
    fontSize: 13,
  },
  byText: {
    fontSize: 13,
    color:"#000000",
  },  
  mciText: {
    fontSize: 13,
    color:"#FF7072",
  },
});
