import React, { useState, useEffect, useContext } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  useWindowDimensions,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
} from "react-native";
import SideBarNavigation from "../../components/PatientScreenComponents/SideBarNavigation";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { AntDesign, FontAwesome} from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import { useLoginModal } from "../../contexts/LoginModalContext";
import {
  FetchFromServer,
  upload,
  download,
  remove,
  shortenUrl,
} from "../../utils/MedilockerService";
import HeaderLoginSignUp from "../../components/PatientScreenComponents/HeaderLoginSignUp";
import BackButton from "../../components/PatientScreenComponents/BackButton";
const { width, height } = Dimensions.get("window");

const Medilocker = ({ navigation }) => {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { width } = useWindowDimensions();
  const { user } = useContext(AuthContext);
  const { triggerLoginModal } = useLoginModal();
  const [isGridView, setIsGridView] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadFilesFromServer = async () => {
      try {
        const data = await FetchFromServer(user?.user_id || user?.email);
        if (data?.files) {
          const mappedFiles = data.files.map((file) => ({
            name: file.filename,
            file_id: file.file_id,
            type: file.metadata?.file_type,
            size: file.metadata?.file_size,
            date: file.metadata?.upload_date,
            time: file.metadata?.upload_time,
          }));

          setFiles(mappedFiles);
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    loadFilesFromServer();
  }, [user]);

  
  const convertFileToBase64 = async (asset) => {
    try {
      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(",")[1];
            resolve(base64data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // return await FileSystem.readAsStringAsync(asset.uri, {
        //   encoding: FileSystem.EncodingType.Base64,
        // });
        return await FileSystem.readAsStringAsync(asset.uri, {
          encoding: "base64",
        });
      }
    } catch (error) {
      console.error("Base64 conversion failed:", error);
      return null;
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.canceled === true) {
        return;
      }
      if (!result.assets || result.assets.length === 0) {
        alert("Error, No file data received.");
        return;
      }
      const asset = result.assets[0];
      const fileName = asset.name || "Unknown File";
      let fileType = asset.mimeType || "Unknown Type";
      const fileSizeBytes = asset.size ?? null;
      let fileSize = fileSizeBytes
        ? `${(fileSizeBytes / 1024).toFixed(2)} KB`
        : "Unknown Size";

      if (fileType !== "Unknown Type") {
        const parts = fileType.split("/");
        if (parts.length > 1) {
          fileType = parts[1].split(".").pop();
        }
      }

      const base64String = await convertFileToBase64(asset);
      if (!base64String) {
        alert("Error converting file to Base64.");
        return;
      }

      const payload = {
        user_id: user?.user_id || user?.email,
        files: [
          {
            filename: fileName,
            content: base64String,
            metadata: {
              file_type: fileType,
              file_size: fileSize,
              upload_date: new Date().toLocaleDateString(),
              upload_time: new Date().toLocaleTimeString(),
            },
          },
        ],
      };

      // Show progress UI on mobile / small screens
      const showProgress = Platform.OS !== "web" || width < 1000;
      if (showProgress) {
        setUploadProgress(0);
        setUploadStatus("uploading");
      }

      try {
        // Animate progress while the real upload runs
        const uploadPromise = upload(payload);

        if (showProgress) {
          // Tick progress to 90% while waiting (real upload determines completion)
          let progress = 0;
          const tick = setInterval(() => {
            progress = Math.min(progress + 5, 90);
            setUploadProgress(progress);
          }, 200);

          await uploadPromise;
          clearInterval(tick);
          setUploadProgress(100);
          setUploadStatus("success");
          setTimeout(() => setUploadStatus(null), 2000);
        } else {
          await uploadPromise;
        }
      } catch (uploadErr) {
        if (showProgress) {
          setUploadStatus("error");
          setTimeout(() => setUploadStatus(null), 3000);
        }
        throw uploadErr;
      }

      // Reload from server to get file_id for the new file
      const data = await FetchFromServer(user?.user_id || user?.email);
      if (data?.files) {
        const mappedFiles = data.files.map((file) => ({
          name: file.filename,
          file_id: file.file_id,
          type: file.metadata?.file_type,
          size: file.metadata?.file_size,
          date: file.metadata?.upload_date,
          time: file.metadata?.upload_time,
        }));
        setFiles(mappedFiles);
      }
    } catch (err) {
      alert(`Error: ${err.message || err}`);
    }
  };

  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

  const downloadFile = async (file) => {
    try {
      const data = await download(user?.user_id || user?.email, file.file_id);
      const downloadUrl = data.download_url;

      if (Platform.OS === "web") {
        window.open(downloadUrl, "_blank");
      } else {
        await WebBrowser.openBrowserAsync(downloadUrl);
      }
    } catch (error) {
      Alert.alert("Download Error", error.message);
    }
  };

  const removeFile = async (file) => {
    try {
      await remove(user?.user_id || user?.email, file.file_id);

      setFiles(files.filter((f) => f.file_id !== file.file_id));
      Alert.alert("Deleted", `${file.name} has been removed`);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const shareFile = async (file) => {
    try {
      const data = await download(user?.user_id || user?.email, file.file_id);
      const downloadUrl = data.download_url;

      if (Platform.OS === "web") {
        //Shorten URL
        let urlToShare = downloadUrl;
        try {
          urlToShare = await shortenUrl(downloadUrl);
        } catch (error) {
          console.error("Failed to shorten URL:", error);
        }

        if (navigator.share) {
          await navigator.share({
            title: file.name,
            url: urlToShare,
            text: `Check out this file: ${file.name}`,
          });
        } else {
          // Fallback to opening the download URL in a new tab.
          window.open(downloadUrl, "_blank");
        }
      } else {
        
        // const localUri = FileSystem.cacheDirectory + fileName;
        const localUri = `${FileSystem.cacheDirectory ?? ""}${file.name}`;

        const downloadResult = await FileSystem.downloadAsync(
          downloadUrl,
          localUri
        );

        if (!(await Sharing.isAvailableAsync())) {
          console.error("Sharing is not available on this device");
          return;
        }

        await Sharing.shareAsync(downloadResult.uri);
        await FileSystem.deleteAsync(downloadResult.uri);
      }
    } catch (error) {
      console.error("Sharing error:", error);
    }
    setMenuVisible(false);
  };

  const openMenu = (file) => {
    setSelectedFile(file);
    setMenuVisible(true);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [visible, setvisible] = useState(true);
  //const [password, setPassword] = useState("");

  // const handlePasswordChange = (text) => {
  //   setPassword(text);
  //   if (text === user?.password) {
  //     setTimeout(() => setvisible(false), 500); // Close modal after 0.5s if password is correct
  //   }
  // };

  return (
    <>
      {Platform.OS === "web" && width > 1000 && (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <ImageBackground
              source={require("../../assets/Images/MedicineBackground.png")}
              style={styles.imageBackground}
              resizeMode="cover"
            >
              <View style={styles.parent}>
                <View style={styles.Left}>
                  <SideBarNavigation navigation={navigation} />
                </View>
                <View style={styles.Right}>
                  <View style={styles.header}>
                    <HeaderLoginSignUp navigation={navigation} />
                  </View>
                  <BackButton />
                  <View style={styles.right_middle}>
                    <TouchableOpacity
                      style={styles.uploadBar}
                      onPress={pickDocument}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name="cloud-upload"
                        size={20}
                        color="#FF7072"
                        style={styles.uploadBarIcon}
                      />
                      <Text style={styles.uploadBarText}>
                        Drag & drop files here or{" "}
                        <Text style={styles.uploadBarLink}>browse</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.right_bottom}>
                    <View style={styles.file_Container}>
                      {/* Header Section */}
                      <View style={styles.Fpart}>
                        <View style={styles.searchFilterContainer}>
                          <Text style={styles.tableTitle}>Files Uploaded</Text>

                          <View style={styles.searchBox}>
                            <MaterialIcons
                              name="search"
                              size={20}
                              color="#FF7072"
                            />
                            <TextInput
                              style={styles.searchInput}
                              placeholder="Search for Documents"
                              value={searchQuery}
                              onChangeText={setSearchQuery}
                            />
                          </View>

                          <TouchableOpacity style={styles.filterButton}>
                            <MaterialIcons
                              name="filter-list"
                              size={20}
                              color="#FF7072"
                            />
                            <Text style={styles.filterText}>Filters</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Table Section */}
                      <View style={styles.Spart}>
                        <FlatList
                          data={filteredFiles}
                          keyExtractor={(item, index) => item.file_id || item.name || `file-${index}`}
                          ListHeaderComponent={
                            <View style={styles.tableHeader}>
                              <Text style={styles.headerText}>File Name</Text>
                              <Text style={styles.headerText}>
                                Document Type
                              </Text>
                              <Text style={styles.headerText}>File Size</Text>
                              <Text style={styles.headerText}>
                                Creation Date
                              </Text>
                              <Text style={styles.headerText}>Time</Text>
                              <Text style={styles.headerText}>Actions</Text>
                            </View>
                          }
                          renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                              <Text style={styles.rowText}>{item.name}</Text>
                              <Text style={styles.rowText}>{item.type}</Text>
                              <Text style={styles.rowText}>{item.size}</Text>
                              <Text style={styles.rowText}>{item.date}</Text>
                              <Text style={styles.rowText}>{item.time}</Text>

                              <View style={styles.actionButtons}>
                                {/* Download Button */}
                                <TouchableOpacity
                                  onPress={() => downloadFile(item)}
                                >
                                  <MaterialIcons
                                    name="file-download"
                                    size={24}
                                    color="#FF7072"
                                  />
                                </TouchableOpacity>

                                {/* Delete Button */}
                                <TouchableOpacity
                                  onPress={() => removeFile(item)}
                                >
                                  <MaterialIcons
                                    name="delete"
                                    size={24}
                                    color="#FF7072"
                                  />
                                </TouchableOpacity>

                                {/* Share Button */}
                                <TouchableOpacity
                                  onPress={() => shareFile(item)}
                                >
                                  <MaterialIcons
                                    name="share"
                                    size={24}
                                    color="#FF7072"
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      )}

      {(Platform.OS !== "web" || width < 1000) && (
        <View style={styles.appContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#fff" />
          <View style={styles.appHeader}>
            <HeaderLoginSignUp navigation={navigation} />
          </View>
          <View style={styles.appMedilockerContainer}>
            <Text style={styles.appTitle}>Medilocker</Text>
            <TouchableOpacity
              style={styles.appMenuButton}
              onPress={() => alert("menu clicked!")}
            >
              <MaterialIcons name="more-horiz" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.appSearchBox}>
            <View style={styles.appSearchContainer}>
              {/* Search Icon */}
              <MaterialIcons
                name="search"
                size={20}
                color="salmon"
                style={styles.appIcon}
              />

              {/* Search Input */}
              <TextInput
                style={styles.appSearchInput}
                placeholder="Search in Medilocker"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* Filter Button */}
              <TouchableOpacity onPress={() => alert("Filter Clicked!")}>
                <FontAwesome name="filter" size={18} color="salmon" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.appDocuContainer}>
            <Text style={styles.appDocuTitle}>Documents</Text>

            <TouchableOpacity style={styles.applistButton} onPress={toggleView}>
              <MaterialIcons
                name={isGridView ? "format-list-bulleted" : "grid-view"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.appfileContain}>
            <FlatList
              data={filteredFiles}
              key={isGridView ? "grid" : "list"}
              keyExtractor={(item, index) => item.file_id || item.name || `file-${index}`}
              numColumns={isGridView ? 3 : 1}
              renderItem={({ item }) => (
                <View
                  style={[styles.appfileItem, !isGridView && styles.approwItem]}
                >
                  <TouchableOpacity onPress={() => {}}>
                    <Image
                      source={require("../../assets/Icons/FileIcon.png")}
                      style={styles.appfileIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.appmenuButton}
                    onPress={() => openMenu(item)}
                  >
                    <MaterialIcons name="more-horiz" size={24} color="black" />
                  </TouchableOpacity>

                  <Text style={styles.appfileName}>{item.name}</Text>
                  <Text style={styles.appfileDetails}>
                    You Created - {item.date}
                  </Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }} // Allows scrolling
            />

            <Modal visible={menuVisible} transparent animationType="fade">
              <TouchableOpacity
                style={styles.appoverlay}
                onPress={() => setMenuVisible(false)}
              >
                <View style={styles.appmenu}>
                  <TouchableOpacity onPress={() => {}}>
                    <View style={styles.appmenuItem}>
                      <MaterialIcons
                        name="content-copy"
                        size={20}
                        color="#FF7072"
                      />
                      <Text style={styles.appmenuText}>Copy</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => downloadFile(selectedFile)}
                  >
                    <View style={styles.appmenuItem}>
                      <MaterialIcons
                        name="file-download"
                        size={20}
                        color="#FF7072"
                      />
                      <Text style={styles.appmenuText}>Download</Text>
                    </View>
                  </TouchableOpacity>

                  {/* <TouchableOpacity onPress={removeFile}> */}
                  <TouchableOpacity
                    onPress={() => removeFile(selectedFile)}
                  >
                    <View style={styles.appmenuItem}>
                      <MaterialIcons name="delete" size={20} color="#FF7072" />
                      <Text style={styles.appmenuText}>Delete</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => shareFile(selectedFile)}
                  >
                    <View style={styles.appmenuItem}>
                      <MaterialIcons name="share" size={20} color="#FF7072" />
                      <Text style={styles.appmenuText}>Share</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          <View style={styles.appAddDocument}>
            <TouchableOpacity
              style={styles.appFeb}
              onPress={pickDocument}
              disabled={uploadStatus === "uploading"}
            >
              <AntDesign name="plus" size={24} color="#FF7072" />
            </TouchableOpacity>
          </View>

          {uploadStatus === "uploading" && (
            <Text style={styles.appsuccessMessage}>
              Processing Upload {uploadProgress}%
            </Text>
          )}
          {uploadStatus === "success" && (
            <Text style={styles.appsuccessMessage}>Upload Successful!</Text>
          )}
          {uploadStatus === "error" && (
            <Text style={styles.appsuccessMessage}>Upload Failed</Text>
          )}
        </View>
      )}

      {!user && visible && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <MaterialIcons
              name="lock"
              size={30}
              color="#FF7072"
              style={styles.icon}
            />
            <Text style={styles.lockedText}>Medilocker is Locked</Text>
            <Text style={styles.securityText}>
              For your security, you can only use Medilocker when you are logged
              in.
            </Text>
            <Pressable
              onPress={() => {
                triggerLoginModal();
              }}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>Login</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    width: "100%",
    // borderWidth: 1,
    // borderColor: "#000000",
  },
  imageContainer: {
    height: "100%",
    width: "100%",
    // borderWidth: 1,
    // borderColor: "#ff0000",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    //transform:[{scale:0.8}],
    opacity: 80,
    //marginVertical:"-5%"
    alignSelf: "center",
    flexDirection: "column",
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
    // marginVertical: "0%",
    // marginHorizontal: "0%",
  },
  Right: {
    height: "100%",
    flex: 1,
    // width: "85%",
  },
  header: {
    // borderWidth: 5,
    // borderColor: "black",
    zIndex: 2,
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  right_middle: {
    height: "auto",
    width: "100%",
    marginTop: "4%",
    paddingHorizontal: "5%",
  },
  right_bottom: {
    width: "100%",
    flex: 1,
  },
  uploadBar: {
    backgroundColor: "#FFF5F7",
    borderWidth: 2,
    borderColor: "#FFE5E8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        borderStyle: "dashed",
        cursor: "pointer",
      },
    }),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  uploadBarIcon: {
    marginRight: 10,
  },
  uploadBarText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  uploadBarLink: {
    color: "#FF7072",
    fontWeight: "600",
  },
  files_Upload: {
    fontSize: 21,
    fontWeight: 700,
    color: "#000000",
    marginHorizontal: "3.5%",
    marginVertical: "-0.5%",
  },
  addDocumentButton: {
    height: "12%",
    width: "16%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FF7072",
    backgroundColor: "white",
    borderRadius: 4,
    marginTop: "15%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: "1%", // Adjust to keep it above the bottom edge
    right: "5%",
  },
  addDocumentText: {
    fontSize: 18,
    fontWeight: 400,
    // alignSelf: "center",
    paddingVertical: "3%",
    color: "black",
  },
  file_Container: {
    // height: "95%",
    width: "100%",
    borderWidth: 0,
    marginTop: "1%",
    backgroundColor: "white",
    padding: 10,
    transform: [{ scale: 0.9 }],
    flexDirection: "column",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    // shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    // alignSelf: "center", // Ensures it's inside the parent
    maxHeight: "100%",
    overflow: "hidden",
  },
  Fpart: {
    width: "100%",
    marginBottom: 10,
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FF7072",
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 35,
    width: "27%",
    marginLeft: "50%",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    borderWidth: 0,
    outlineStyle: "none",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF7072",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  filterText: {
    color: "#180606b3",
    fontSize: 14,
    marginLeft: 5,
  },
  Spart: {
    width: "100%",
    // backgroundColor: "#f7ecf0",
    padding: 1,
    borderRadius: 5,
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f7ecf0",
    borderBottomWidth: 1,
    paddingVertical: 10,
    borderBottomColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  rowText: {
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center", // Ensures equal spacing
    alignItems: "center",
  },
  passwardDialogBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#FF7072",
    padding: "2%",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: "90%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        marginLeft: width > 1000 ? "15%" : "0%",
      },
    }),
  },
  overlayContent: {
    width: "75%", // Adjust as needed, e.g., 50% of Right view
    backgroundColor: "white",
    padding: "3%",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        width: width > 1000 ? "25%" : "75%",
      },
    }),
  },
  icon: {
    marginBottom: "2%",
  },
  lockedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginBottom: "5%",
  },
  securityText: {
    fontSize: 12,
    textAlign: "center",
    color: "gray",
    marginBottom: "8%",
  },
  loginButton: {
    padding: 8,
    backgroundColor: "#FF7072",
    borderRadius: 5,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  appContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  appHeader: {
    height: "15%",
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  appMedilockerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "2%",
    // paddingHorizontal: 16,
    // paddingVertical: 10,
    backgroundColor: "white",
    paddingLeft: "6%",
    paddingRight: "6%",
  },
  appTitle: {
    fontSize: 25,
    fontWeight: "bold",
    paddingLeft: "30%",
  },
  appMenuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  appSearchBox: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "6%",
    paddingRight: "6%",
  },
  appSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    // paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 9,
    width: "100%",
    ...Platform.select({
      web: {
        height: 30,
      },
    }),
  },
  appIcon: {
    marginRight: 8,
  },
  appSearchInput: {
    flex: 1,
    fontSize: 12,
    color: "#333",
  },
  appDocuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingHorizontal: 16,
    // paddingVertical: 10,
    backgroundColor: "white",
    paddingLeft: "6%",
    paddingRight: "6%",
    marginTop: "1%",
  },
  appDocuTitle: {
    fontSize: 18,
    // fontWeight: "bold",
    // paddingLeft:"30%",
  },
  applistButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
    borderRadius: 5,
  },
  appfileContain: {
    width: "100%",
    flex: 1,
  },
  appfileItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    position: "relative",
  },
  appfileIcon: {
    width: 65,
    height: 75,
    tintColor: "salmon",
    margin: "5%",
  },
  appfileName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  appfileDetails: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  appmenuButton: {
    position: "absolute",
    top: 1,
    right: 1,
    padding: 5,
  },
  approwItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  appoverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  appmenu: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  appmenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  appmenuItemLast: {
    borderBottomWidth: 0,
  },
  appmenuText: {
    fontSize: 14,
    color: "black",
    marginLeft: 10,
  },

  appAddDocument: {
    marginBottom: "5%",
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 50,
    //elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 9,
  },
  appFeb: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  appsuccessMessage: {
    position: "absolute",
    marginTop: 10,
    right: 100,
    bottom: 100,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
export default Medilocker;
