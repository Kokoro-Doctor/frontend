// import React, { useCallback, useState } from "react";
// import {
//   Image,
//   ImageBackground,
//   StyleSheet,
//   View,
//   Dimensions,
//   Platform,
//   TouchableOpacity,
//   useWindowDimensions,
//   StatusBar,
//   Text,
//   TextInput,
// } from "react-native";

// import GeneratePrescription from "../../screens/DoctorScreens/GeneratePrescription";
// const MedilockerUsers = () => {

//   return (
//     <View style={styles.container}>
//         <View>

//         </View>
//         <View style={{marginLeft:"4.6%" , marginTop:"1%"}}>
//             <Image
//                 source={require("../../assets/DoctorsPortal/Icons/Filess.png")}
//                 style={styles.middleIcon}
//             />
//         </View>
//         <View style={{marginLeft:"1%" , marginTop:"1%"}}> <Text style={styles.reportText}>Angiography Report.pdf</Text></View>
//         <View style={{marginLeft:"4.5%" , marginTop:"1%"}} > <Text style={styles.lastText} >Pdf</Text></View>
//         <View style={{marginLeft:"14.6%" , marginTop:"1%"}}><Text style={styles.lastText}>200KB</Text></View>
//         <View style={{marginLeft:"7.6%" , marginTop:"1%"}}><Text style={styles.lastText}>Feb 09,2025</Text></View>
//         <View style={{marginLeft:"7.5%" , marginTop:"1%"}}><Text style={styles.lastText}>10:45 AM</Text></View>
//         <View style={{marginLeft:"6%" , marginTop:"1%"}}>
//             <TouchableOpacity><Image
//                 source={require("../../assets/DoctorsPortal/Icons/quickPreview.png")}
//                 style={styles.middleIcon}
//             /> </TouchableOpacity></View>
//         <View style={{marginLeft:"10%" , marginTop:"1%"}}>
//             <TouchableOpacity>
//             <Image
//                 source={require("../../assets/DoctorsPortal/Icons/downloads.png")}
//                 style={styles.middleIcon}
//             /></TouchableOpacity>
//         </View>

//     </View>

//   )
// }

// export default MedilockerUsers

// const styles = StyleSheet.create({
//     container:{
//         flexDirection:"row"
//     },
//     reportText:{
//         fontSize:16,
//         fontWeight:"400",
//         fontFamily:"Popppins - Regular",
//         color:"#444444",
//     },
//     lastText:{
//         fontSize:14,
//         fontWeight:"400",
//         fontFamily:"Popppins - Regular",
//         color:"#000000",

//     }

// })

import React, { useState } from "react";
import { Image, StyleSheet, View, TouchableOpacity, Text } from "react-native";

const MedilockerUsers = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <View style={{ marginLeft: "2%", marginTop: "1%" }}>
        <TouchableOpacity
          onPress={() => setIsChecked(!isChecked)}
          style={styles.checkboxContainer}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      </View>

      {/* File Icon */}
      <View style={{ marginLeft: "2%", marginTop: "1%" }}>
        <Image
          source={require("../../assets/DoctorsPortal/Icons/Files.png")}
          style={styles.middleIcon}
        />
      </View>

      {/* Report Name */}
      <View style={{ marginLeft: "1%", marginTop: "1%" }}>
        <Text style={styles.reportText}>Angiography Report.pdf</Text>
      </View>

      {/* Document Type */}
      <View style={{ marginLeft: "4.5%", marginTop: "1%" }}>
        <Text style={styles.lastText}>Pdf</Text>
      </View>

      {/* File Size */}
      <View style={{ marginLeft: "14.6%", marginTop: "1%" }}>
        <Text style={styles.lastText}>200KB</Text>
      </View>

      {/* Creation Date */}
      <View style={{ marginLeft: "7.6%", marginTop: "1%" }}>
        <Text style={styles.lastText}>Feb 09,2025</Text>
      </View>

      {/* Time */}
      <View style={{ marginLeft: "7.5%", marginTop: "1%" }}>
        <Text style={styles.lastText}>10:45 AM</Text>
      </View>

      {/* Preview Icon */}
      <View style={{ marginLeft: "6%", marginTop: "1%" }}>
        <TouchableOpacity>
          <Image
            source={require("../../assets/DoctorsPortal/Icons/quickPreview.png")}
            style={styles.middleIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Download Icon */}
      <View style={{ marginLeft: "8.5%", marginTop: "1%" }}>
        <TouchableOpacity>
          <Image
            source={require("../../assets/DoctorsPortal/Icons/downloads.png")}
            style={styles.middleIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MedilockerUsers;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  checkboxContainer: {
    padding: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FF7072",
    borderColor: "#FF7072",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  reportText: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Popppins - Regular",
    color: "#444444",
  },
  lastText: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Popppins - Regular",
    color: "#000000",
  },
});
