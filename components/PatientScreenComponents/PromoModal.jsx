// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ScrollView,
//   TouchableWithoutFeedback,
// } from "react-native";
// import Modal from "react-native-modal";
// import { BlurView } from "expo-blur";
// import * as Animatable from "react-native-animatable";
// import { useNavigation } from "@react-navigation/native";

// const PromoModal = ({ isVisible, onClose }) => {
//   const navigation = useNavigation();

//   return (
//     <>
//       <Modal
//         isVisible={isVisible}
//         animationIn="slideInUp"
//         animationOut="slideOutDown"
//         swipeDirection="down"
//         onSwipeComplete={onClose}
//         onBackdropPress={onClose}
//         onBackButtonPress={onClose}
//         backdropOpacity={0.6}
//         backdropTransitionOutTiming={1}
//         useNativeDriver
//         //   backdropTransitionOutTiming={0}
//         //   customBackdrop={
//         //     <TouchableWithoutFeedback onPress={onClose}>
//         //       <BlurView
//         //         intensity={90}
//         //         tint="dark"
//         //         style={StyleSheet.absoluteFill}
//         //       />
//         //     </TouchableWithoutFeedback>
//         //   }
//         style={styles.modal}
//       >
//         {/* <View style={styles.blurWrapper}>
//         <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
//       </View>

//       <Animatable.View
//         animation="fadeInUp"
//         duration={600}
//         easing="ease-out"
//         style={styles.content}
//       >
//         <ScrollView keyboardShouldPersistTaps="handled">
//           <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//             <Text style={styles.closeText}>×</Text>
//           </TouchableOpacity>

//           <Text style={styles.title}>Your secure digital medical vault</Text>
//           <Text style={styles.desc}>
//             Tired of searching for medical documents when you need them the
//             most? MediLocker is here to make your life easier!
//           </Text>

//           <View style={styles.bullets}>
//             <Text style={styles.bullet}>
//               ✨ Store All Medical Records in One Place
//             </Text>
//             <Text style={styles.bullet}>✨ Access Anytime, Anywhere</Text>
//             <Text style={styles.bullet}>✨ 100% Secure & Private</Text>
//             <Text style={styles.bullet}>✨ Share with a Tap</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.tryBtn}
//             onPress={() => {
//               onClose();
//               navigation.navigate("Medilocker");
//             }}
//           >
//             <Text style={styles.tryText}>Try MediLocker</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </Animatable.View> */}
//         <TouchableWithoutFeedback onPress={onClose}>
//           <View style={styles.fullscreenWrapper}>
//             <BlurView
//               intensity={10}
//               tint="dark"
//               style={StyleSheet.absoluteFill}
//             />

//             <TouchableWithoutFeedback>
//               <Animatable.View
//                 animation="fadeInUp"
//                 duration={100}
//                 easing="ease-out"
//                 style={styles.content}
//               >
//                 <ScrollView keyboardShouldPersistTaps="handled">
//                   <TouchableOpacity
//                     style={styles.closeButton}
//                     onPress={onClose}
//                   >
//                     <Text style={styles.closeText}>×</Text>
//                   </TouchableOpacity>
//                   <Image
//                     source={require("../../assets/DoctorsPortal/Images/MedicalVault.png")} // Change to your icon
//                     style={styles.icon}
//                   />

//                   <Text style={styles.title}>
//                     Your secure digital medical vault
//                   </Text>
//                   <Text style={styles.desc}>
//                     Tired of searching for medical documents when you need them
//                     the most? MediLocker is here to make your life easier!
//                   </Text>

//                   <View style={styles.bullets}>
//                     <Text style={styles.bullet}>
//                       ✨ Store All Medical Records in One Place
//                     </Text>
//                     <Text style={styles.bullet}>
//                       ✨ Access Anytime, Anywhere
//                     </Text>
//                     <Text style={styles.bullet}>✨ 100% Secure & Private</Text>
//                     <Text style={styles.bullet}>✨ Share with a Tap</Text>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.tryBtn}
//                     onPress={() => {
//                       onClose();
//                       navigation.navigate("Medilocker");
//                     }}
//                   >
//                     <Text style={styles.tryText}>Try MediLocker</Text>
//                   </TouchableOpacity>
//                 </ScrollView>
//               </Animatable.View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </>
//   );
// };
// const styles = StyleSheet.create({
//   modal: {
//     justifyContent: "flex-end",
//     margin: "0%",
//   },
//   //   blurWrapper: {
//   //     ...StyleSheet.absoluteFillObject,
//   //     zIndex: -1,
//   //   },
//   fullscreenWrapper: {
//     flex: 1,
//     justifyContent: "flex-end",
//   },

//   content: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: "5%",
//     paddingBottom: "5%",
//   },
//   closeButton: {
//     alignSelf: "flex-end",
//   },
//   closeText: {
//     fontSize: 26,
//     color: "#999",
//   },
//   icon: {
//     alignSelf: "center",
//     width: 55,
//     height: 55,
//     marginBottom: "5%",
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: "2%",
//   },
//   desc: {
//     fontSize: 14,
//     textAlign: "center",
//     color: "#444",
//   },
//   bullets: {
//     marginTop: "5%",
//   },
//   bullet: {
//     fontSize: 14,
//     marginVertical: "1%",
//   },
//   tryBtn: {
//     backgroundColor: "rgb(237, 111, 128)",
//     borderRadius: 10,
//     paddingVertical: "4%",
//     marginTop: "5%",
//   },
//   tryText: {
//     textAlign: "center",
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });

// export default PromoModal;
// {
//   /* <Image
//           source={require("../assets/lock-icon.png")} // Change to your icon
//           style={styles.icon}
//         /> */
// }

import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

const PromoModal = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.blurContainer, { opacity: fadeAnim }]}>
            <BlurView
              intensity={10}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.content}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.closeText}>×</Text>
                  </TouchableOpacity>

                  <Image
                    source={require("../../assets/DoctorsPortal/Images/MedicalVault.png")}
                    style={styles.icon}
                  />

                  <Text style={styles.title}>
                    Your secure digital medical vault
                  </Text>
                  <Text style={styles.desc}>
                    Tired of searching for medical documents when you need them
                    the most? MediLocker is here to make your life easier!
                  </Text>

                  <View style={styles.bullets}>
                    <Text style={styles.bullet}>
                      ✨ Store All Medical Records in One Place
                    </Text>
                    <Text style={styles.bullet}>
                      ✨ Access Anytime, Anywhere
                    </Text>
                    <Text style={styles.bullet}>✨ 100% Secure & Private</Text>
                    <Text style={styles.bullet}>✨ Share with a Tap</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.tryBtn}
                    onPress={() => {
                      handleClose();
                      setTimeout(() => {
                        navigation.navigate("PatientAppNavigation", {
                          screen: "Medilocker",
                        });
                      }, 300);
                    }}
                  >
                    <Text style={styles.tryText}>Try MediLocker</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    maxHeight: screenHeight * 0.8,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  closeText: {
    fontSize: 26,
    color: "#999",
    fontWeight: "300",
  },
  icon: {
    alignSelf: "center",
    width: 55,
    height: 55,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    color: "#444",
    lineHeight: 20,
  },
  bullets: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  bullet: {
    fontSize: 14,
    marginVertical: 5,
    color: "#333",
  },
  tryBtn: {
    backgroundColor: "rgb(237, 111, 128)",
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tryText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PromoModal;
