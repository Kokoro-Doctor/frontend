import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  Linking,
  useWindowDimensions,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import confetti from "canvas-confetti";

const BookingConfirmation = ({ navigation, route }) => {
  const { width, height } = useWindowDimensions();
  //const [celebrate, setCelebrate] = useState(false);
  const [blastKey, setBlastKey] = useState(0);
  const confettiInterval = React.useRef(null);
  const params = route?.params || {};
  const doctors = params.doctor;
  const selectedDate = params.selectedDate;
  const selectedTimeSlot = params.selectedTimeSlot
    ? typeof params.selectedTimeSlot === "string"
      ? { time: params.selectedTimeSlot }
      : params.selectedTimeSlot
    : { time: "Time not specified" };

  const handleAddToCalendar = (date, time) => {
    if (Platform.OS === "ios") {
      Linking.openURL("calshow:");
    } else if (Platform.OS === "android") {
      Linking.openURL("content://com.android.calendar/time/");
    } else {
      Linking.openURL("https://calendar.google.com");
    }
  };

  const handleDone = () => {
    navigation.navigate("UserDashboard");
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setCelebrate(true);

  //     if (Platform.OS === "web") {
  //       triggerWebConfetti();
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, []);
  useEffect(() => {
    confettiInterval.current = setInterval(() => {
      if (Platform.OS === "web") {
        // Web blast
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.7 },
        });
      } else {
        // Mobile blast (force re-render)
        setBlastKey((prev) => prev + 1);
      }
    }, 900); // blast every 0.9 seconds

    return () => {
      if (confettiInterval.current) {
        clearInterval(confettiInterval.current);
      }
    };
  }, []);


  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000, // speed (lower = faster)
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    rotateLoop.start();

    return () => rotateLoop.stop();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" && (
        <ConfettiCannon
          key={Math.random()} // forces re-render
          count={180}
          origin={{ x: width / 2, y: 0 }}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
        />
      )}

      <StatusBar
        barStyle="light-content"
        backgroundColor={styles.container.backgroundColor}
      />
      <View style={styles.top}>
        {/* <View style={styles.bookingLogo}>
          <Image
            source={require("../../../../assets/Icons/BookingConfirmation.png")}
            style={styles.bookingLogoImage}
          />
        </View> */}
        <View style={styles.bookingLogo}>
          <Animated.View
            style={{
              transform: [{ rotate: spin }],
            }}
          >
            <Image
              source={require("../../../../assets/Icons/BookingConfirmation.png")}
              style={styles.bookingLogoImage}
            />
          </Animated.View>
        </View>

        <View style={styles.topText}>
          <Text style={styles.title}>Booking Confirmed</Text>
          <Text style={styles.description}>
            Thanks Your booking has been confirmed
          </Text>
        </View>
      </View>

      <View style={styles.doctorCard}>
        <View style={styles.doctorDetails}>
          <Image
            source={{ uri: doctors.profilePhoto }}
            style={styles.drImage}
          />
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {doctors.doctorname}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {doctors.specialization}
          </Text>
        </View>
        <View style={styles.dateTime}>
          <View>
            <Text style={styles.lightText}>Time</Text>
            <View style={styles.timeBox}>
              <Feather name="clock" size={14} color="#444444" />
              <Text style={styles.lightText}>
                {selectedTimeSlot?.time || "N/A"}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.lightText}>Date</Text>
            <View style={styles.timeBox}>
              <FontAwesome5 name="calendar-alt" size={16} color="#444444" />
              <Text style={styles.lightText}>{selectedDate || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text
            style={[styles.lightText, { fontSize: 18, textAlign: "center" }]}
          >
            Done
          </Text>
        </Pressable>
        <Pressable style={styles.calendarButton} onPress={handleAddToCalendar}>
          <AntDesign name="plus" size={20} color="black" />
          <Text
            style={{ fontSize: 16, fontWeight: "500", textAlign: "center" }}
          >
            Add to Calendar
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  top: {
    alignItems: "center",
  },
  // bookingLogo: {
  //   alignItems: "center",
  //   marginBottom: "2%",
  // },
  bookingLogo: {
    alignItems: "center",
    marginBottom: "2%",
    shadowColor: "#1680EC",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    borderRadius: 50,
  },

  bookingLogoImage: {
    height: 80,
    width: 80,
  },
  topText: {
    alignItems: "center",
    width: "80%",
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    paddingBottom: "3%",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
  },
  doctorCard: {
    width: "70%",
    padding: "5%",
    borderRadius: 10,
    marginVertical: "7%",
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  doctorDetails: {
    alignItems: "center",
    marginBottom: "5%",
  },
  drImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  dateTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeBox: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  buttons: {
    marginTop: "5%",
    gap: 10,
    width: "60%",
  },
  doneButton: {
    borderWidth: 1,
    borderColor: "#1680EC",
    borderRadius: 5,
    paddingHorizontal: "10%",
    paddingVertical: "2%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7072",
    borderRadius: 5,
    paddingHorizontal: "10%",
    elevation: 3,
    paddingVertical: "3%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  lightText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444444",
  },
});

export default BookingConfirmation;
