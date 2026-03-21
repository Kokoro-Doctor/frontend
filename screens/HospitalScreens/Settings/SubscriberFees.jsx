import { useState, useRef, useEffect } from "react"
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Easing } from "react-native"
import SideBarNavigation from "../../../components/DoctorsPortalComponents/NewestSidebar"
import SettingsNavigation from "../../../components/DoctorsPortalComponents/SettingsNavigation"
import HeaderNavigation from "../../../components/DoctorsPortalComponents/HeaderNavigation"

const SubscriberFees = ({ navigation, route }) => {
  const [fees, setFees] = useState("1999") 
  const [regularCheckups, setRegularCheckups] = useState(1)
  const [emergencyCheckups, setEmergencyCheckups] = useState(1)
  const [enableEmergencyConsults, setEnableEmergencyConsults] = useState(false)
  const [emergencyConsultsLimit, setEmergencyConsultsLimit] = useState(3)

  const handleIncrement = (type) => {
    if (type === 'regular') {
      setRegularCheckups(prev => prev + 1)
    } else if (type === 'emergency') {
      setEmergencyCheckups(prev => prev + 1)
    } else if (type === 'limit') {
      setEmergencyConsultsLimit(prev => prev + 1)
    }
  }

  const handleDecrement = (type) => {
    if (type === 'regular' && regularCheckups > 0) {
      setRegularCheckups(prev => prev - 1)
    } else if (type === 'emergency' && emergencyCheckups > 0) {
      setEmergencyCheckups(prev => prev - 1)
    } else if (type === 'limit' && emergencyConsultsLimit > 0) {
      setEmergencyConsultsLimit(prev => prev - 1)
    }
  }
//CustomSwitch component
const CustomSwitch = ({ value, onValueChange, disabled = false }) => {
  const translateX = useRef(new Animated.Value(value ? 24 : 4)).current; 

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 24 : 4,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => {
        if (!disabled) {
          onValueChange(!value);
        }
      }} 
      disabled={disabled} 
      style={switchStyles.container}
    >
      <View
        style={[
          switchStyles.track,
          {
            backgroundColor: value ? "#FF7072" : "#FFFFFF",
            borderWidth: 1,
            borderColor: value ? "#FF7072" : "#D1D1D1",
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            switchStyles.thumb,
            {
              backgroundColor: "#FFFFFF",
              transform: [{ translateX }], // Use translateX 
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}
  return (
    <View style={styles.container}>
      <View style={styles.parent}>
        {/* Left Sidebar */}
        <View style={styles.Left}>
          <SideBarNavigation navigation={navigation} />
        </View>

        {/* Middle Settings Menu */}
        <View style={styles.Middle}>
          <SettingsNavigation navigation={navigation} />
        </View>

        {/* Right Content Area */}
        <View style={styles.Right}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Profile Setting</Text>
              <Text style={styles.profileSubtitle}>Manage your account settings</Text>
              <HeaderNavigation navigation={navigation} />
              <View style={styles.formContainer}>
                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Fees</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputField}
                      placeholder="₹1999"
                      value={`₹${fees}`}
                      onChangeText={(text) => setFees(text.replace(/[^0-9]/g, ""))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>No of Regular Check-up</Text>
                  <View style={styles.counterContainer}>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => handleDecrement('regular')}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.counterValueContainer}>
                      <Text style={styles.counterValue}>{regularCheckups}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => handleIncrement('regular')}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>No of Emergency Check-up</Text>
                  <View style={styles.counterContainer}>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => handleDecrement('emergency')}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.counterValueContainer}>
                      <Text style={styles.counterValue}>{emergencyCheckups}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => handleIncrement('emergency')}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Enable emergency Consults</Text>
                  <View style={styles.counterContainer}>
                    <CustomSwitch
                      value={enableEmergencyConsults}
                      onValueChange={setEnableEmergencyConsults}
                    />
                    <Text style={styles.limitLabel}>Limit</Text>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => handleDecrement('limit')}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.counterValueContainer}>
                      <Text style={styles.counterValue}>{emergencyConsultsLimit}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.counterButton}
                      onPress={() => handleIncrement('limit')}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.divider} />
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
    backgroundColor: "#fff",
  },
  parent: {
    flex: 1,
    flexDirection: "row",
  },
  Left: {
    width: "15%",
    backgroundColor: "#FFF5F5",
  },
  Middle: {
    width: "15%",
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#F0F0F0",
  },
  Right: {
    flex: 1,
    backgroundColor: "#FDF4F4CF",
  },
  scrollContainer: {
    padding: 20,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: "3%",
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    width: "20%",
  },
  nameInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  inputField: {
    height: 45,
    borderWidth: 1,
    borderColor: "#9B9A9A",
    borderRadius: 4,
    paddingHorizontal: "5%",
    width:"30%"
  },
  
  fullWidthInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#9B9A9A",
    borderRadius: 4,
    paddingHorizontal: "16%",
  },
  
  profileTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  profileSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
   
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF5757",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#FF5757",
    fontWeight: "500",
  },
  inputContainer: {
    width: "80%",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
  },
  counterButton: {
    width: 30,
    height: 30,
    backgroundColor: "#FF5757",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  counterButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  counterValueContainer: {
    width: 40,
    height: 30,
    borderWidth: 1,
    borderColor: "#9B9A9A",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  counterValue: {
    fontSize: 16,
  },
  limitLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginLeft: 20,
    marginRight: 10,
  }
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

export default SubscriberFees;