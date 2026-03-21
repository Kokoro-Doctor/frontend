
import { useState, useRef, useEffect } from "react"
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from "react-native"
import SideBarNavigation from "../../../components/DoctorsPortalComponents/NewestSidebar"
import SettingsNavigation from "../../../components/DoctorsPortalComponents/SettingsNavigation"

const NotificationSettings = ({ navigation, route }) => {
  // State for all notification toggles
  const [pushNotification, setPushNotification] = useState(true)
  const [emailNotification, setEmailNotification] = useState(true)
  const [smsNotification, setSmsNotification] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [promotionalMessages, setPromotionalMessages] = useState(true)

  // Custom Switch Component (inline)
  const CustomSwitch = ({ value, onValueChange, disabled = false }) => {
    const translateX = useRef(new Animated.Value(value ? 1 : 0)).current

    useEffect(() => {
      Animated.timing(translateX, {
        toValue: value ? 1 : 0,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start()
    }, [value, translateX])

    const interpolatedTranslateX = translateX.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 24],
    })

    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onValueChange} disabled={disabled} style={switchStyles.container}>
        <View
          style={[
            switchStyles.track,
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: value ? "#4285F4" : "#D1D1D1",
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Animated.View
            style={[
              switchStyles.thumb,
              {
                backgroundColor: value ? "#4285F4" : "#FFFFFF",
                transform: [{ translateX: interpolatedTranslateX }],
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.parent}>
        {/* Left Sidebar */}
        <View style={styles.Left}>
          <SideBarNavigation navigation={navigation} />
        </View>

        {/* Middle Settings Menu */}
        <View style={styles.Left}>
          <SettingsNavigation navigation={navigation} />
        </View>

        {/* Right Content Area */}
        <View style={styles.Right}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.contentCard}>
              {/* Notification Settings */}
              <View style={styles.settingSection}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingName}>Push Notification</Text>
                  <CustomSwitch value={pushNotification} onValueChange={() => setPushNotification(!pushNotification)} />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingName}>Email Notification</Text>
                  <CustomSwitch
                    value={emailNotification}
                    onValueChange={() => setEmailNotification(!emailNotification)}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingName}>SMS Notification</Text>
                  <CustomSwitch value={smsNotification} onValueChange={() => setSmsNotification(!smsNotification)} />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingName}>Appointment Reminders</Text>
                  <CustomSwitch
                    value={appointmentReminders}
                    onValueChange={() => setAppointmentReminders(!appointmentReminders)}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingName}>Promotional Messages</Text>
                  <CustomSwitch
                    value={promotionalMessages}
                    onValueChange={() => setPromotionalMessages(!promotionalMessages)}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  Left: {
    height: "100%",
    width: "15%",
    backgroundColor: "#FFF5F5",
  },
  Right: {
    height: "100%",
    width: "70%", 
    backgroundColor: "#FDF4F4CF",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: "100%",
    marginTop:"3%",
    

  },
  settingSection: {
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  settingName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
})

// Styles for the custom switch
const switchStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
})

export default NotificationSettings
