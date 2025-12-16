import React, { useCallback, useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
<<<<<<< HEAD
  StatusBar,
=======
>>>>>>> main
  Text,
  TextInput,
  ScrollView,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
<<<<<<< HEAD
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
import DoctorsHeader from "../../components/DoctorsPortalComponents/DoctorsHeader";
import Title from "../../components/PatientScreenComponents/Title";
import SearchBar from "../../components/PatientScreenComponents/SearchBar";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
import SubscriberCard from "../../components/DoctorsPortalComponents/SubscriberCard";
import DoctorCard from "../../components/DoctorsPortalComponents/DoctorCard";

=======
import { useChatbot } from "../../contexts/ChatbotContext";
import { useFocusEffect } from "@react-navigation/native";
//import DoctorsHeader from "../../components/DoctorsPortalComponents/DoctorsHeader";
import NewestSidebar from "../../components/DoctorsPortalComponents/NewestSidebar";
//import SubscriberCard from "../../components/DoctorsPortalComponents/SubscriberCard";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
>>>>>>> main

const { width, height } = Dimensions.get("window");
const DoctorsSubscribers = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const { setChatbotConfig, isChatExpanded, setIsChatExpanded } = useChatbot();
  //const [selectedButton, setSelectedButton] = useState(null);

<<<<<<< HEAD

  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [])
=======
  useFocusEffect(
    useCallback(() => {
      setChatbotConfig({ height: "57%" });
    }, [setChatbotConfig])
>>>>>>> main
  );

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.webContainer}>
          <View style={styles.imageContainer}>
            <ImageBackground
<<<<<<< HEAD
              source={require("../../assets/Images/dr_background.png")}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              
=======
              source={require("../../assets/DoctorsPortal/Images/DoctorDashboard.png")}
              style={styles.imageBackground}
              resizeMode="cover"
            >
>>>>>>> main
              <View style={styles.parent}>
                <View style={styles.Left}>
                  <NewestSidebar navigation={navigation} />
                </View>
                <View style={styles.Right}>
<<<<<<< HEAD
                  <DoctorsHeader navigation={navigation} />
                  {/* <View style={styles.firstTextBox}>
                    <View>
                      <Text style={styles.firstText}>
                        Welcome Doctor!

                      </Text>

                    </View>
                    <View>
                      <Text style={styles.secondText}>
                        Here is your medical dashboard.

                      </Text>

                    </View>

                  </View> */}
=======
                  <HeaderLoginSignUp navigation={navigation} />
>>>>>>> main

                  <View style={styles.contentContainer}>
                    <View style={styles.upperPart}>
                      <View>
                        <Text style={styles.containerText}>
<<<<<<< HEAD
                          Your Subscribers</Text>
                      </View>
                      <View style={styles.upperBox}>
                        
                          <TouchableOpacity style={styles.filterBox}>
                            <Image
                              source={require("../../assets/Icons/filterIcon.png")}
                              style={styles.filterIcon}
                            /><Text style={styles.filterText}>Filter</Text>
                          </TouchableOpacity>

                          <View style={{flexDirection:'row', alignItems:'center',}}>
                            <Text style={styles.dateText}>Date : </Text>
                            <View style={styles.filterBox}>
                              
                              <TouchableOpacity style={styles.dateBox}>
                                <TextInput
                                  style={styles.selectdateText}
                                  placeholder="Select Date"
                                  value={searchText}
                                  onChangeText={setSearchText}
                                />
                                <Image
                                  source={require("../../assets/Icons/dateIcon.png")}
                                  style={styles.iconImage}
                                />

                              </TouchableOpacity>
                            </View>
                          </View>

                        <View style={{flexDirection:'row', alignItems:'center',}}>
                          <Text style={styles.dateText}>Status : </Text>
                          <View style={styles.filterBox}>
                            
=======
                          Your Subscribers
                        </Text>
                      </View>
                      <View style={styles.upperBox}>
                        <TouchableOpacity style={styles.filterBox}>
                          <Image
                            source={require("../../assets/DoctorsPortal/Icons/filterIcon.png")}
                            style={styles.filterIcon}
                          />
                          <Text style={styles.filterText}>Filter</Text>
                        </TouchableOpacity>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.dateText}>Date : </Text>
                          <View style={styles.filterBox}>
                            <TouchableOpacity style={styles.dateBox}>
                              <TextInput
                                style={styles.selectdateText}
                                placeholder="Select Date"
                                value={searchText}
                                onChangeText={setSearchText}
                              />
                              <Image
                                //source={require("../../assets/Icons/dateIcon.png")}
                                style={styles.iconImage}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.dateText}>Status : </Text>
                          <View style={styles.filterBox}>
>>>>>>> main
                            <TouchableOpacity style={styles.dateBox}>
                              <TextInput
                                style={styles.selectdateText}
                                placeholder="All Patients"
                                value={searchText}
                                onChangeText={setSearchText}
                              />
                              <Image
<<<<<<< HEAD
                                source={require("../../assets/Icons/statusIcon.png")}
=======
                                //source={require("../../assets/Icons/statusIcon.png")}
>>>>>>> main
                                style={styles.iconImage}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.SearchBox}>
                          <MaterialIcons
                            name="search"
                            size={20}
                            color="#B9B9B988"
                            style={styles.searchIcon}
<<<<<<< HEAD
                         />
=======
                          />
>>>>>>> main
                          <TextInput
                            style={styles.searchBoxText}
                            placeholder="Search For Patient"
                            value={searchText}
                            onChangeText={setSearchText}
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.lowerPart}>
<<<<<<< HEAD
                      <ScrollView>
=======
                      {/* <ScrollView> */}
                      {/* <SubscriberCard></SubscriberCard>
>>>>>>> main
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
<<<<<<< HEAD
                        <SubscriberCard></SubscriberCard>
                        <SubscriberCard></SubscriberCard>
                        {/* <DoctorCard
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

                        <DoctorCard
                          doctor={{
                            name: "Dr. KIslay",
                            degree: "MD, Mhfuh",
                            experience: 22,
                            location: "Bhopal, Madhya Pradesh",
                            likes: 1009,
                            rating: 4.9,
                            image: require("../../assets/Images/dr_kislay.jpg"),
                          }}
                        />

                        <DoctorCard
                          doctor={{
                            name: "Dr. Abhishek",
                            degree: "MD, MS",
                            experience: 22,
                            location: "Bihar, patna",
                            likes: 1009,
                            rating: 4.9,
                            image: require("../../assets/Images/dr_kislay.jpg"),
                          }}
                        /> */}

                      
                      </ScrollView>
                      

                    </View>

                  </View>
                  
=======
                        <SubscriberCard></SubscriberCard> */}
                      <View style={styles.lowerCenterSection}>
                        <Image
                          source={require("../../assets/DoctorsPortal/Images/subscriberIcon.png")}
                          style={styles.subscriberIcon}
                        />
                        <Text style={styles.inviteSubscriberText}>
                          Complete your registration process to become a
                          verified doctor on the platform.
                        </Text>
                        <TouchableOpacity
                          style={styles.inviteButton}
                          onPress={() =>
                            navigation.navigate("DoctorAppNavigation", {
                              screen: "DoctorMedicalRegistration",
                            })
                          }
                        >
                          Complete Registration Process
                        </TouchableOpacity>
                      </View>
                      {/* </ScrollView> */}
                    </View>
                  </View>
>>>>>>> main
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}
<<<<<<< HEAD

      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.appContainer}>
          <View style={{flexDirection:"row" , width:"100%" , paddingTop:"3%"}}>
            <View style={{ width :"100%"}}>
              <DoctorsHeader navigation={navigation} />
            </View>

            
              
            
          </View>

          <View style={{marginLeft:"2%"}}>
            <Text style={styles.containerText}>Your Subscribers</Text>
          </View>
          <TouchableOpacity style={styles.searchBox}>
                <Image
                source={require("../../assets/DoctorsPortal/Icons/search__Icon.png")}
                style={styles.searchImage}
                />
                <TextInput
                style={styles.searchText}
                placeholder="Search Patients"
                value={searchText}
                onChangeText={setSearchText}
                />
                <View style={styles.filterIconn}>
                  <Image
                source={require("../../assets/DoctorsPortal/Icons/filter__Icon.png")}
                style={styles.filterImage}
                />
                </View>
                
            </TouchableOpacity>

            <View style={styles.cardText}>
              <Text style={styles.lastTextcard}>
                Your registration is incomplete .
              </Text>
              <View style={{marginTop:"5%"}}>
                <Text style={styles.lastTextcard}>
                Please complete the registration to 
              </Text>
              <Text style={styles.lastTextcard}>view your subscribers.</Text>
              </View>
            </View>

        </View>
      )}

      
=======
>>>>>>> main
    </>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
  },
<<<<<<< HEAD
  appContainer:{
    flex:1,
    height:"100%",
    width:"100%",
    backgroundColor:"#fff",
    
  },
  searchBox:{
    marginTop:"2%",
    flexDirection:"row" , 
    height:"auto" , 
    width:"88%" , 
    
    shadowColor:"#00000040",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    
    marginLeft:"6%",
    borderRadius:6,
    outlineStyle:"none" , 
  },
  searchImage:{
    marginLeft:"5%",
    marginTop:"2%",
    height:25,
    width:25,
  },
  searchText:{
    marginLeft:"2%",
  
  width:"78%",
  },
  filterIconn:{
    marginTop:"4%",

  
  },
  filterImage:{
    height:15,
    width:10,
    

  },
  cardText:{
    marginTop:"6%",
    
    height:"65%",
    width:"89%",
    marginLeft:"6%",
    backgroundColor:"#EEEEEE",
    shadowColor: "#00000040",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    borderRadius:6,
    paddingTop:"20%",
    paddingLeft:"6%",
    
  },
  lastTextcard:{
    fontSize:16,
    color:"#000000",
    fontWeight:"700",

  },
=======

>>>>>>> main
  imageContainer: {
    borderColor: "#00ffff",
    height: "100%",
    width: "100%",
  },

  imageBackground: {
    width: "100%",
    height: "100%",
    //transform:[{scale:0.8}],
    opacity: 80,
    alignSelf: "center",
    flexDirection: "column",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  parent: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
  },
  Left: {
    height: "100%",
    width: "15%",
    //borderWidth: 1,
  },
  Right: {
    height: "100%",
    width: "85%",
  },
  firstTextBox: {
<<<<<<< HEAD
    marginTop:'3%',
    marginLeft:'4%',
    

  },
  firstText: { 
    fontSize:42,
    fontWeight:'600',
    color:'#FFFFFF'

  },
  secondText: {
    fontSize:14,
    fontWeight:'400',
    color:'#FFFFFF',
    marginLeft:8,
    marginTop:5,
  },
  contentContainer: {
    flex: 1,
    marginTop:"2%",
    
    backgroundColor: "#FFFFFF",
    marginBottom: "4%",
    borderRadius:5,
=======
    marginTop: "3%",
    marginLeft: "4%",
  },
  firstText: {
    fontSize: 42,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFFFFF",
    marginLeft: 8,
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
    marginTop: "2%",

    backgroundColor: "#FFFFFF",
    marginBottom: "4%",
    borderRadius: 5,
>>>>>>> main
    overflow: "hidden",
    width: "92%",
    marginHorizontal: "4%",
  },
  upperPart: {
<<<<<<< HEAD
    flex:1,
    backgroundColor:"#FCA2A21F",
    height:"30%",
    width:"100%",

  },
  containerText:{
    fontSize:34,
    fontWeight:'600',
    color:"#000000",
    paddingTop:"2%",
    marginLeft:"4%",
    ...Platform.select({
      android: {
        fontSize:20,
        
      },
    }),
  },
  upperBox:{
    flexDirection:'row',
    justifyContent:"flex-start",
    gap:"2%",
    paddingVertical:"2%",
    
    marginLeft:"4%",

  },
  filterBox:{
    flexDirection:'row',
    borderRadius:4,
    backgroundColor:"#FFFFFF",
    paddingHorizontal:12,
    paddingVertical:1,
    alignItems:'center',
    justifyContent:'center',
    alignContent:'center',
    alignSelf:'center',
    outlineStyle: 'none',
    borderWidth: 0,
  },
  SearchBox:{
    flexDirection:'row',
    borderRadius:4,
    backgroundColor:"#FFFFFF",
    width:"30%",
    paddingVertical:2,
    
  },
  filterIcon:{
    width:20,
    height:20,
    

  },
  filterText:{
    alignItems:'center',
    justifyContent:'center',
    alignContent:'center',
    alignSelf:'center',
    fontSize:14,
    fontWeight:'500',
    color:"#000000",
  },
  dateBox:{
    borderRadius:4,
    backgroundColor:"#FFFFFF",
    paddingHorizontal:12,
    flexDirection:'row',
    justifyContent:'center',
    
  },
  dateText:{
    fontSize:16,  
    fontWeight:'500',
    color:"#000000",  
  },
  selectdateText:{
    fontSize:14,
    fontWeight:'300',
    color:"#B9B9B9",
    outlineStyle: 'none',
    borderWidth: 0,
  },
  searchBoxText:{
    fontSize:14,
    fontWeight:'300',
    color:"#B9B9B9",
    justifyContent:"flex-start",
    outlineStyle: 'none',
    borderWidth: 0,
  },
  upperBoxx:{
    flexDirection:'row',
    backgroundColor:"#E2E8F0",
  },
  

  lowerPart: {
    height:"70%",
  },
  
=======
    flex: 1,
    backgroundColor: "#FCA2A21F",
    height: "30%",
    width: "100%",
  },
  containerText: {
    fontSize: 34,
    fontWeight: "600",
    color: "#000000",
    paddingTop: "2%",
    marginLeft: "4%",
  },
  upperBox: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: "2%",
    paddingVertical: "2%",

    marginLeft: "4%",
  },
  filterBox: {
    flexDirection: "row",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    outlineStyle: "none",
    borderWidth: 0,
  },
  SearchBox: {
    flexDirection: "row",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    width: "30%",
    paddingVertical: 2,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  filterText: {
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  dateBox: {
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  selectdateText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#B9B9B9",
    outlineStyle: "none",
    borderWidth: 0,
  },
  searchBoxText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#B9B9B9",
    justifyContent: "flex-start",
    outlineStyle: "none",
    borderWidth: 0,
  },
  upperBoxx: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
  },

  lowerPart: {
    height: "70%",
  },
  lowerCenterSection: {
    //borderWidth: 1,
    height: "80%",
    width: "45%",
    alignSelf: "center",
    alignItems: "center",
  },
  subscriberIcon: {
    height: 125,
    width: 100,
    alignSelf: "center",
    marginVertical: "10%",
  },
  inviteSubscriberText: {
    alignSelf: "center",
    color: "#de1f1fff",
    fontSize: 14,
    fontWeight: 600,
  },
  inviteButton: {
    //borderWidth:1,
    marginVertical: "3%",
    padding: "1.5%",
    backgroundColor: "#dc2727ff",
    color: "#fff",
    borderRadius: 6,
  },
>>>>>>> main
});

export default DoctorsSubscribers;
