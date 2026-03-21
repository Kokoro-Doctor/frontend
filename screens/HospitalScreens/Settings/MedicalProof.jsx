import { useState } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import SideBarNavigation from "../../../components/DoctorsPortalComponents/NewestSidebar";
import SettingsNavigation from "../../../components/DoctorsPortalComponents/SettingsNavigation";
import HeaderNavigation from "../../../components/DoctorsPortalComponents/HeaderNavigation";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const MedicalProof = ({ navigation, route }) => {
  // State for each file upload field
  const [medicalRegistrationFile, setMedicalRegistrationFile] = useState(null);
  const [degreeCertificateFile, setDegreeCertificateFile] = useState(null);
  const [governmentIdFile, setGovernmentIdFile] = useState(null);

  const convertFileToBase64 = async (fileUri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:application/octet-stream;base64,${base64}`;
    } catch (error) {
      console.error("Error converting file to Base64:", error);
      return null;
    }
  };

  const handleBrowseFile = async (setFileState) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      
      if (result.canceled === true) {
        return;
      }
      
      if (!result.assets || result.assets.length === 0) {
        Alert.alert("Error", "No file data received.");
        return;
      }
      
      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name || "Unknown File";
      
      const base64String = await convertFileToBase64(fileUri);
      
      const newFile = {
        name: fileName,
        base64: base64String,
      };
      
      setFileState(newFile);
      
    } catch (err) {
      Alert.alert("Error", "Something went wrong while picking the file.");
      console.error(err);
    }
  };

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
                
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Medical License No</Text>
                  <TextInput 
                    style={[styles.fullWidthInput]} 
                    placeholder="87965412325479+" 
                    keyboardType="default" 
                  />
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Specialization</Text>
                  <TextInput 
                    style={[styles.fullWidthInput]} 
                    placeholder="eg. Cardiologist" 
                    keyboardType="default" 
                  />
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Year of Experience</Text>
                  <TextInput 
                    style={[styles.fullWidthInput]} 
                    placeholder="15" 
                    keyboardType="numeric" 
                  />
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Affiliated Hospital</Text>
                  <TextInput 
                    style={[styles.fullWidthInput]} 
                    placeholder="Aiims" 
                    keyboardType="default" 
                  />
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Medical Registration{"\n"}Council Id</Text>
                  <View style={styles.fileUploadContainer}>
                    <TextInput 
                      style={[styles.fileInputField]} 
                      placeholder="9878456874563210" 
                      keyboardType="default" 
                    />
                    <View style={styles.photoContainer}>
                      <View style={styles.uploadButtonContainer}>
                        <TouchableOpacity 
                          style={styles.uploadButton}
                          onPress={() => handleBrowseFile(setMedicalRegistrationFile)}
                        >
                          <View style={styles.uploadIconContainer}>
                            <Image 
                              source={require("../../../assets/DoctorsPortal/Icons/upload.png")} 
                              style={styles.uploadIcon} 
                            />
                          </View>
                          <View style={styles.browseTextContainer}>
                            <Text style={styles.browseText} numberOfLines={1} ellipsizeMode="middle">
                              {medicalRegistrationFile ? medicalRegistrationFile.name : "Browse File"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Degree Certificate</Text>
                  <View style={styles.fileUploadContainer}>
                    <TextInput 
                      style={[styles.fileInputField]} 
                      placeholder="9878456874563210" 
                      keyboardType="default" 
                    />
                    <View style={styles.photoContainer}>
                      <View style={styles.uploadButtonContainer}>
                        <TouchableOpacity 
                          style={styles.uploadButton}
                          onPress={() => handleBrowseFile(setDegreeCertificateFile)}
                        >
                          <View style={styles.uploadIconContainer}>
                            <Image 
                              source={require("../../../assets/DoctorsPortal/Icons/upload.png")} 
                              style={styles.uploadIcon} 
                            />
                          </View>
                          <View style={styles.browseTextContainer}>
                            <Text style={styles.browseText} numberOfLines={1} ellipsizeMode="middle">
                              {degreeCertificateFile ? degreeCertificateFile.name : "Browse File"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.divider} />

                <View style={styles.formRow}>
                  <Text style={styles.inputLabel}>Government Id {"\n"}Proof</Text>
                  <View style={styles.fileUploadContainer}>
                  <TextInput style={styles.fileInputField} placeholder="9878456874563210" keyboardType="default" />
                    <View style={styles.photoContainer}>
                      <View style={styles.uploadButtonContainer}>
                        <TouchableOpacity 
                          style={styles.uploadButton}
                          onPress={() => handleBrowseFile(setGovernmentIdFile)}
                        >
                          <View style={styles.uploadIconContainer}>
                            <Image 
                              source={require("../../../assets/DoctorsPortal/Icons/upload.png")} 
                              style={styles.uploadIcon} 
                            />
                          </View>
                          <View style={styles.browseTextContainer}>
                            <Text style={styles.browseText} numberOfLines={1} ellipsizeMode="middle">
                              {governmentIdFile ? governmentIdFile.name : "Browse File"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
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
    flexGrow: 1,
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
  profileSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  formContainer: {
    marginTop: 10,
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
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    width: "20%",
    marginRight: 10,
  },
  fullWidthInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#9B9A9A",
    borderRadius: 4,
    paddingHorizontal: "5%",
  },
  fileUploadContainer: {
    flexDirection: "row",
    width: "80%",
    alignItems: "center",
  },
  fileInputField: {
    height: 45,
    borderWidth: 1,
    borderColor: "#9B9A9A",
    borderRadius: 4,
    paddingHorizontal: "5%",
  
  },
  browseFileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  browseButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  browseButtonText: {
    color: "#333",
    fontSize: 14,
  },
  photoContainer: {
    width: '100%',
  },
  uploadButtonContainer: {
    width: "60%", 
    marginLeft: 30, 
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#9B9A9A",
    borderStyle: "dashed",
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: "3%",
    width: "55%",
  },
  uploadIconContainer: {
    marginRight: 10,
  },
  browseTextContainer: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  browseText: {
    color: "#333333",
    fontSize: 14,
  },
})

export default MedicalProof;
