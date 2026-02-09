// import { MaterialIcons } from "@expo/vector-icons";
// import {
//   useNavigation,
//   useRoute,
//   useFocusEffect,
// } from "@react-navigation/native";
// import * as Speech from "expo-speech";
// import { useContext, useEffect, useState, useCallback } from "react";
// import {
//   Animated,
//   FlatList,
//   Image,
//   Keyboard,
//   Platform,
//   Pressable,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { AuthContext } from "../../../contexts/AuthContext";
// import { askBot } from "../../../utils/ChatBotService";
// import {
//   getChatCount,
//   getChatLimit,
//   incrementChatCount,
//   resetChatCount,
// } from "../../../utils/chatLimitManager";
// import { getSessionId } from "../../../utils/sessionManager";
// import SignInPopup from "./SignInPopup";
// import FormattedMessageText from "./FormattedMessageText";
// import PreviewMessage from "./PreviewMessage";

// const languages = [
//   { label: "English (In)", value: "en" },
//   { label: "Hindi", value: "hi" },
//   { label: "Spanish", value: "es" },
//   { label: "Tamil", value: "ta" },
// ];

// const MobileChatbot = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const presetPrompt = route?.params?.presetPrompt;

//   const [messages, setMessages] = useState(() => {
//     if (presetPrompt) {
//       return []; // chatbot opens silently, prompt auto-send hoga
//     }

//     return [
//       {
//         id: "1",
//         sender: "bot",
//         text: "Hey there! How are you feeling today? I’m your personal health companion — here to support you every step of the way. Would you like help with your heart health or reproductive health today? And remember, this is a safe and private space, so feel free to ask me anything.",
//         timestamp: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       },
//     ];
//   });

//   const [userMessage, setUserMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [playingMessage, setPlayingMessage] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [typingText, setTypingText] = useState(".");
//   const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
//   const [showSignInPopup, setShowSignInPopup] = useState(false);
//   const { user, role } = useContext(AuthContext);
//   const [feedback, setFeedback] = useState({});

//   useEffect(() => {
//     if (!presetPrompt || presetPrompt.trim() === "") return;

//     const autoSendPresetPrompt = async () => {
//       const userMsg = {
//         id: Date.now().toString(),
//         sender: "user",
//         text: presetPrompt,
//         timestamp: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//       };

//       setMessages([userMsg]); // overwrite start
//       setIsLoading(true);

//       try {
//         const botReply = await askBot(
//           user,
//           role,
//           presetPrompt,
//           selectedLanguage.value,
//           user?.id || user?.user_id || null
//         );

//         if (botReply) {
//           const botMessage = botReply.is_preview
//             ? {
//                 id: (Date.now() + 1).toString(),
//                 sender: "bot",
//                 text:
//                   botReply.preview_text ||
//                   botReply.full_text ||
//                   "Sorry, I couldn't process that.",
//                 timestamp: new Date().toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 }),
//                 is_preview: true,
//                 preview_text: botReply.preview_text,
//                 full_text: botReply.full_text,
//                 cta_text: botReply.cta_text,
//                 signup_action: botReply.signup_action,
//               }
//             : {
//                 id: (Date.now() + 1).toString(),
//                 sender: "bot",
//                 text: botReply.text,
//                 timestamp: new Date().toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 }),
//                 is_preview: false,
//               };

//           setMessages((prev) => {
//             const updated = [...prev, botMessage];
//             setPlayingMessage(updated.length - 1);

//             Speech.speak(
//               botReply.is_preview
//                 ? botReply.preview_text || botReply.full_text
//                 : botReply.text,
//               {
//                 language: selectedLanguage.value,
//                 onDone: () => setPlayingMessage(null),
//                 onStopped: () => setPlayingMessage(null),
//               }
//             );

//             return updated;
//           });
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     autoSendPresetPrompt();
//   }, [presetPrompt, role, selectedLanguage.value, user]);

//   // Stop speaking when user refreshes the page
//   useEffect(() => {
//     return () => {
//       Speech.stop();
//     };
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       // Screen is focused → do nothing

//       return () => {
//         // Screen lost focus → STOP ALL SPEECH
//         Speech.stop();
//         setPlayingMessage(null);
//       };
//     }, [])
//   );

//   // Convert preview messages to full messages when user logs in
//   useEffect(() => {
//     if (user) {
//       // User just logged in - convert all preview messages to full messages
//       setMessages((prevMessages) => {
//         return prevMessages.map((msg) => {
//           if (msg.sender === "bot" && msg.is_preview && msg.full_text) {
//             // Convert preview to full message
//             return {
//               ...msg,
//               text: msg.full_text,
//               is_preview: false,
//               preview_text: undefined,
//               full_text: undefined,
//               cta_text: undefined,
//               signup_action: undefined,
//             };
//           }
//           return msg;
//         });
//       });
//     }
//   }, [user]); // Trigger when user changes (logged In)

//   //Loading animation
//   useEffect(() => {
//     if (isLoading) {
//       const interval = setInterval(() => {
//         setTypingText((prev) =>
//           prev === "." ? ".." : prev === ".." ? "..." : "."
//         );
//       }, 500); // Change every 500ms

//       return () => clearInterval(interval);
//     }
//   }, [isLoading]);

//   const sendMessageToBot = async () => {
//     if (!userMessage.trim()) return;

//     // Check if user is not signed in and handle chat limit
//     if (!user) {
//       const CHAT_LIMIT = getChatLimit();

//       // Check if limit already reached before incrementing
//       const currentCount = await getChatCount();
//       if (currentCount >= CHAT_LIMIT) {
//         setShowSignInPopup(true);
//         return;
//       }

//       // Increment chat count for non-signed-in users (session-based)
//       const newCount = await incrementChatCount();

//       // Check if we just reached the limit
//       if (newCount >= CHAT_LIMIT) {
//         // Still allow this message but show popup after
//         const messageToSend = userMessage;
//         const newMessage = {
//           id: Date.now().toString(),
//           sender: "user",
//           text: userMessage,
//           timestamp: new Date().toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         };
//         setMessages((prev) => [...prev, newMessage]);
//         setUserMessage("");
//         setIsLoading(true);

//         try {
//           const botReply = await askBot(
//             user,
//             role,
//             messageToSend,
//             selectedLanguage.value,
//             user?.id || user?.user_id || null
//           );
//           if (botReply) {
//             const botMessage = botReply.is_preview
//               ? {
//                   id: Date.now().toString(),
//                   sender: "bot",
//                   text:
//                     botReply.preview_text ||
//                     botReply.full_text ||
//                     "Sorry, I couldn't process that.",
//                   timestamp: new Date().toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   }),
//                   is_preview: true,
//                   preview_text: botReply.preview_text,
//                   full_text: botReply.full_text,
//                   cta_text: botReply.cta_text,
//                   signup_action: botReply.signup_action,
//                 }
//               : {
//                   id: Date.now().toString(),
//                   sender: "bot",
//                   text: botReply.text || "Sorry, I couldn't process that.",
//                   timestamp: new Date().toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   }),
//                   is_preview: false,
//                 };

//             setMessages((prevMessages) => {
//               const updatedMessages = [...prevMessages, botMessage];
//               const newMessageIndex = updatedMessages.length - 1;
//               setPlayingMessage(newMessageIndex);

//               // Only speak if not preview (or speak preview text)
//               const textToSpeak = botReply.is_preview
//                 ? botReply.preview_text || botReply.full_text
//                 : botReply.text;

//               Speech.speak(textToSpeak, {
//                 language: selectedLanguage.value,
//                 onDone: () => setPlayingMessage(null),
//                 onStopped: () => setPlayingMessage(null),
//               });
//               return updatedMessages;
//             });
//           }
//           // Show popup after sending the 5th message
//           setShowSignInPopup(true);
//         } catch (error) {
//           console.error("Error sending message:", error);
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: Date.now().toString(),
//               sender: "bot",
//               text: error.message,
//               timestamp: new Date().toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }),
//             },
//           ]);
//           setShowSignInPopup(true);
//         } finally {
//           setIsLoading(false);
//           Keyboard.dismiss();
//         }
//         return;
//       }
//     }

//     const messageToSend = userMessage;
//     const newMessage = {
//       id: Date.now().toString(),
//       sender: "user",
//       text: userMessage,
//       timestamp: new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     };
//     setMessages((prev) => [...prev, newMessage]);
//     setUserMessage("");
//     setIsLoading(true);

//     try {
//       const botReply = await askBot(
//         user,
//         role,
//         messageToSend,
//         selectedLanguage.value,
//         user?.id || user?.user_id || null
//       );
//       if (botReply) {
//         const botMessage = botReply.is_preview
//           ? {
//               id: Date.now().toString(),
//               sender: "bot",
//               text:
//                 botReply.preview_text ||
//                 botReply.full_text ||
//                 "Sorry, I couldn't process that.",
//               timestamp: new Date().toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }),
//               is_preview: true,
//               preview_text: botReply.preview_text,
//               full_text: botReply.full_text,
//               cta_text: botReply.cta_text,
//               signup_action: botReply.signup_action,
//             }
//           : {
//               id: Date.now().toString(),
//               sender: "bot",
//               text: botReply.text || "Sorry, I couldn't process that.",
//               timestamp: new Date().toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               }),
//               is_preview: false,
//             };

//         setMessages((prevMessages) => {
//           const updatedMessages = [...prevMessages, botMessage];
//           const newMessageIndex = updatedMessages.length - 1; // Get the index of the latest bot message
//           setPlayingMessage(newMessageIndex); // Set playingMessage to the new message index

//           // Only speak if not preview (or speak preview text)
//           const textToSpeak = botReply.is_preview
//             ? botReply.preview_text || botReply.full_text
//             : botReply.text;

//           Speech.speak(textToSpeak, {
//             language: selectedLanguage.value,
//             onDone: () => setPlayingMessage(null),
//             onStopped: () => setPlayingMessage(null),
//           });
//           return updatedMessages;
//         });
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now().toString(),
//           sender: "bot",
//           text: error.message,
//           timestamp: new Date().toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         },
//       ]);
//     } finally {
//       setIsLoading(false);
//       Keyboard.dismiss();
//     }
//   };

//   const toggleTTS = (index, text) => {
//     if (playingMessage === index) {
//       // Stop current speech
//       Speech.stop();
//       setPlayingMessage(null);
//     } else {
//       // Stop any previous speech first
//       Speech.stop();

//       setPlayingMessage(index);
//       Speech.speak(text, {
//         language: selectedLanguage.value,
//         onDone: () => setPlayingMessage(null),
//         onStopped: () => setPlayingMessage(null),
//         onError: () => setPlayingMessage(null),
//       });
//     }
//   };

//   const handleFeedback = (messageId, type) => {
//     setFeedback((prev) => ({
//       ...prev,
//       [messageId]: type, // "up" or "down"
//     }));

//     // Optional: send to backend
//     // sendFeedback(messageId, type);
//   };

//   const renderItem = ({ item, index }) => {
//     if (isLoading && index === messages.length) {
//       return (
//         <View style={[styles.messageBubble, styles.botMessage]}>
//           <Image
//             source={require("../../../assets/Images/KokoroLogo.png")}
//             style={styles.avatar}
//           />
//           <View style={styles.botMessageBox}>
//             <Animated.Text style={styles.typingDots}>
//               {typingText}
//             </Animated.Text>
//           </View>
//         </View>
//       );
//     }

//     return (
//       <View
//         style={[
//           styles.messageBubble,
//           item.sender === "bot" ? styles.botMessage : styles.userMessage,
//         ]}
//       >
//         <Image
//           source={
//             item.sender === "user"
//               ? require("../../../assets/Images/user-icon.jpg")
//               : require("../../../assets/Images/KokoroLogo.png")
//           }
//           style={styles.avatar}
//         />

//         <View
//           style={
//             item.sender === "user"
//               ? styles.userMessageBox
//               : styles.botMessageBox
//           }
//         >
//           {item.sender === "bot" && item.is_preview ? (
//             <PreviewMessage
//               previewText={item.preview_text}
//               fullText={item.full_text}
//               ctaText={item.cta_text}
//               signupAction={item.signup_action}
//             />
//           ) : (
//             <>
//               <FormattedMessageText sender={item.sender} text={item.text} />
//               <Text style={styles.timestamp}>{item.timestamp}</Text>
//             </>
//           )}
//           {item.sender === "bot" && !isLoading && !item.is_preview && (
//             <View style={styles.botIcons}>
//               <Pressable onPress={() => toggleTTS(index, item.text)}>
//                 <MaterialIcons
//                   name={playingMessage === index ? "pause" : "volume-up"}
//                   size={16}
//                   color="gray"
//                 />
//               </Pressable>
//               <Pressable onPress={() => handleFeedback(item.id, "up")}>
//                 <MaterialIcons
//                   name="thumb-up"
//                   size={16}
//                   color={feedback[item.id] === "up" ? "green" : "gray"}
//                 />
//               </Pressable>

//               <Pressable onPress={() => handleFeedback(item.id, "down")}>
//                 <MaterialIcons
//                   name="thumb-down"
//                   size={16}
//                   color={feedback[item.id] === "down" ? "red" : "gray"}
//                 />
//               </Pressable>

//               {/* <Pressable>
//                 <MaterialIcons name="share" size={16} color="gray" />
//               </Pressable> */}
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.arrowContainer}>
//           <Pressable onPress={() => navigation.goBack()}>
//             <MaterialIcons name="arrow-back" size={24} color="#000" />
//           </Pressable>
//         </View>

//         <View style={styles.titleContainer}>
//           <Text style={styles.headerTitle}>Ask anything</Text>
//         </View>

//         <View style={styles.languageContainer}>
//           {/* <Pressable onPress={() => setModalVisible(!modalVisible)}>
//             <Image
//               source={require("../../../assets/Icons/languageSelector.png")}
//               style={{ width: 30, height: 30 }}
//             />
//           </Pressable> */}

//           {/* {modalVisible && (
//             <View style={styles.dropdown}>
//               {languages.map((lang) => (
//                 <Pressable
//                   key={lang.value}
//                   style={styles.dropdownItem}
//                   onPress={() => {
//                     setSelectedLanguage(lang);
//                     setModalVisible(false);
//                   }}
//                 >
//                   <View style={styles.radioContainer}>
//                     <View
//                       style={[
//                         styles.radioButton,
//                         selectedLanguage.value === lang.value &&
//                           styles.radioSelected,
//                       ]}
//                     />
//                   </View>
//                   <Text style={styles.dropdownText}>{lang.label}</Text>
//                 </Pressable>
//               ))}
//             </View>
//           )} */}
//         </View>
//       </View>
//       <FlatList
//         data={
//           isLoading
//             ? [...messages, { id: "loading", sender: "bot", text: "" }]
//             : messages
//         }
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.messageList}
//       />
//       <View style={styles.inputContainer}>
//         <View style={styles.inputIcons}>
//           {/* <Pressable>
//             <MaterialIcons name="mic" size={24} color="#333" />
//           </Pressable> */}
//           <Pressable>
//             <MaterialIcons name="camera-alt" size={24} color="#333" />
//           </Pressable>
//         </View>
//         <TextInput
//           value={userMessage}
//           onChangeText={setUserMessage}
//           style={styles.input}
//           placeholder="Type message"
//           placeholderTextColor="#aaa"
//           onSubmitEditing={sendMessageToBot}
//           enterKeyHint="send"
//         />
//         <Pressable onPress={sendMessageToBot}>
//           <MaterialIcons
//             name="send"
//             size={24}
//             color="#333"
//             style={styles.sendIcon}
//           />
//         </Pressable>
//       </View>

//       <SignInPopup
//         isVisible={showSignInPopup}
//         onClose={() => setShowSignInPopup(false)}
//         onMaybeLater={async () => {
//           // Reset chat count for current session to allow 4 more chats
//           const sessionId = await getSessionId();
//           if (sessionId) {
//             await resetChatCount(sessionId);
//           }
//         }}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 30,
//     paddingHorizontal: 10,
//     paddingLeft: 20,
//     justifyContent: "space-between",
//   },
//   arrowContainer: {
//     width: 40,
//     justifyContent: "center",
//   },
//   titleContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   languageContainer: {
//     position: "relative",
//     alignItems: "center",
//     alignSelf: "flex-end",
//   },
//   dropdown: {
//     position: "absolute",
//     top: 40,
//     right: 0,
//     backgroundColor: "white",
//     borderRadius: 5,
//     padding: 10,
//     width: 150,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 5,
//     zIndex: 100,
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//   },
//   dropdownText: {
//     fontSize: 16,
//   },
//   radioContainer: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#D4D4D4",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//   },
//   radioButton: {
//     width: 16,
//     height: 16,
//     borderRadius: 10,
//     backgroundColor: "transparent",
//   },
//   radioSelected: {
//     backgroundColor: "#FF7072",
//   },
//   messageList: {
//     padding: 10,
//     flexGrow: 1,
//     justifyContent: "flex-end",
//   },
//   messageBubble: {
//     marginVertical: 5,
//     maxWidth: "80%",
//     flexDirection: "row",
//     alignItems: "flex-start",
//   },
//   botMessage: {
//     // Align bot messages to the left
//   },
//   userMessage: {
//     flexDirection: "row-reverse",
//     alignSelf: "flex-end",
//   },
//   avatar: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     marginRight: 8,
//   },
//   avatarText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   userMessageBox: {
//     maxWidth: "70%",
//     padding: 10,
//     borderRadius: 10,
//     backgroundColor: "pink",
//   },
//   botMessageBox: {
//     maxWidth: "80%",
//     padding: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     backgroundColor: "#f9f9f9",
//   },
//   messageContent: {
//     maxWidth: "70%",
//   },
//   timestamp: {
//     fontSize: 12,
//     color: "#aaa",
//     marginTop: 5,
//   },
//   botIcons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 5,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     backgroundColor: "#f8f8f8",
//     borderWidth: 2,
//     borderColor: "#577CEF",
//     borderRadius: 5,
//   },
//   inputIcons: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   input: {
//     flex: 1,
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     marginHorizontal: 10,
//     minHeight: 40,
//     maxHeight: 100,
//     ...Platform.select({
//       web: {
//         outlineStyle: "none",
//         borderWidth: 0,
//       },
//     }),
//   },
//   sendIcon: {
//     borderRadius: 12,
//     padding: 5,
//   },
// });

// export default MobileChatbot;


import { MaterialIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import * as Speech from "expo-speech";
import { useContext, useEffect, useState, useCallback } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthContext } from "../../../contexts/AuthContext";
import { askBot } from "../../../utils/ChatBotService";
import {
  getChatCount,
  getChatLimit,
  incrementChatCount,
  resetChatCount,
} from "../../../utils/chatLimitManager";
import { getSessionId } from "../../../utils/sessionManager";
import SignInPopup from "./SignInPopup";
import FormattedMessageText from "./FormattedMessageText";
import PreviewMessage from "./PreviewMessage";

const languages = [
  { label: "English (In)", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Spanish", value: "es" },
  { label: "Tamil", value: "ta" },
];

const MobileChatbot = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const presetPrompt = route?.params?.presetPrompt;

  const [messages, setMessages] = useState(() => {
    if (presetPrompt) {
      return []; // chatbot opens silently, prompt auto-send hoga
    }

    return [
      {
        id: "1",
        sender: "bot",
        text: "Hey there! How are you feeling today? I'm your personal health companion — here to support you every step of the way. Would you like help with your heart health or reproductive health today? And remember, this is a safe and private space, so feel free to ask me anything.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
  });

  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessage, setPlayingMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [typingText, setTypingText] = useState(".");
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const { user, role } = useContext(AuthContext);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    if (!presetPrompt || presetPrompt.trim() === "") return;

    const autoSendPresetPrompt = async () => {
      const userMsg = {
        id: Date.now().toString(),
        sender: "user",
        text: presetPrompt,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages([userMsg]); // overwrite start
      setIsLoading(true);

      try {
        // Extract user_id from user object
        const userId = user?.id || user?.user_id || null;
        
        const botReply = await askBot(
          user,
          role,
          presetPrompt,
          selectedLanguage.value,
          userId
        );

        if (botReply) {
          const botMessage = botReply.is_preview
            ? {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text:
                  botReply.preview_text ||
                  botReply.full_text ||
                  "Sorry, I couldn't process that.",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                is_preview: true,
                preview_text: botReply.preview_text,
                full_text: botReply.full_text,
                cta_text: botReply.cta_text,
                signup_action: botReply.signup_action,
              }
            : {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: botReply.text,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                is_preview: false,
              };

          setMessages((prev) => {
            const updated = [...prev, botMessage];
            setPlayingMessage(updated.length - 1);

            Speech.speak(
              botReply.is_preview
                ? botReply.preview_text || botReply.full_text
                : botReply.text,
              {
                language: selectedLanguage.value,
                onDone: () => setPlayingMessage(null),
                onStopped: () => setPlayingMessage(null),
              }
            );

            return updated;
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    autoSendPresetPrompt();
  }, [presetPrompt, role, selectedLanguage.value, user]);

  // Stop speaking when user refreshes the page
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Screen is focused → do nothing

      return () => {
        // Screen lost focus → STOP ALL SPEECH
        Speech.stop();
        setPlayingMessage(null);
      };
    }, [])
  );

  // Convert preview messages to full messages when user logs in
  useEffect(() => {
    if (user) {
      // User just logged in - convert all preview messages to full messages
      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.sender === "bot" && msg.is_preview && msg.full_text) {
            // Convert preview to full message
            return {
              ...msg,
              text: msg.full_text,
              is_preview: false,
              preview_text: undefined,
              full_text: undefined,
              cta_text: undefined,
              signup_action: undefined,
            };
          }
          return msg;
        });
      });
    }
  }, [user]); // Trigger when user changes (logged In)

  //Loading animation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setTypingText((prev) =>
          prev === "." ? ".." : prev === ".." ? "..." : "."
        );
      }, 500); // Change every 500ms

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const sendMessageToBot = async () => {
    if (!userMessage.trim()) return;

    // Extract user_id - will be null for non-signed-in users
    const userId = user?.id || user?.user_id || null;

    let chatCount = null; // Track chat count for logged-out users

    // Check if user is not signed in and handle chat limit
    if (!user) {
      const CHAT_LIMIT = getChatLimit();

      // Check if limit already reached before incrementing
      const currentCount = await getChatCount();
      if (currentCount >= CHAT_LIMIT) {
        setShowSignInPopup(true);
        return;
      }

      // Increment chat count for non-signed-in users (session-based)
      const newCount = await incrementChatCount();
      chatCount = newCount; // Store the count to pass to backend

      // Check if we just reached the limit
      if (newCount >= CHAT_LIMIT) {
        // Still allow this message but show popup after
        const messageToSend = userMessage;
        const newMessage = {
          id: Date.now().toString(),
          sender: "user",
          text: userMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, newMessage]);
        setUserMessage("");
        setIsLoading(true);

        try {
          const botReply = await askBot(
            user,
            role,
            messageToSend,
            selectedLanguage.value,
            userId,
            chatCount
          );
          if (botReply) {
            const botMessage = botReply.is_preview
              ? {
                  id: Date.now().toString(),
                  sender: "bot",
                  text:
                    botReply.preview_text ||
                    botReply.full_text ||
                    "Sorry, I couldn't process that.",
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  is_preview: true,
                  preview_text: botReply.preview_text,
                  full_text: botReply.full_text,
                  cta_text: botReply.cta_text,
                  signup_action: botReply.signup_action,
                }
              : {
                  id: Date.now().toString(),
                  sender: "bot",
                  text: botReply.text || "Sorry, I couldn't process that.",
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  is_preview: false,
                };

            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages, botMessage];
              const newMessageIndex = updatedMessages.length - 1;
              setPlayingMessage(newMessageIndex);

              // Only speak if not preview (or speak preview text)
              const textToSpeak = botReply.is_preview
                ? botReply.preview_text || botReply.full_text
                : botReply.text;

              Speech.speak(textToSpeak, {
                language: selectedLanguage.value,
                onDone: () => setPlayingMessage(null),
                onStopped: () => setPlayingMessage(null),
              });
              return updatedMessages;
            });
          }
          // Show popup after sending the 5th message
          setShowSignInPopup(true);
        } catch (error) {
          console.error("Error sending message:", error);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: "bot",
              text: error.message,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          setShowSignInPopup(true);
        } finally {
          setIsLoading(false);
          Keyboard.dismiss();
        }
        return;
      }
    }

    const messageToSend = userMessage;
    const newMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setUserMessage("");
    setIsLoading(true);

    try {
      const botReply = await askBot(
        user,
        role,
        messageToSend,
        selectedLanguage.value,
        userId,
        chatCount
      );
      if (botReply) {
        const botMessage = botReply.is_preview
          ? {
              id: Date.now().toString(),
              sender: "bot",
              text:
                botReply.preview_text ||
                botReply.full_text ||
                "Sorry, I couldn't process that.",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              is_preview: true,
              preview_text: botReply.preview_text,
              full_text: botReply.full_text,
              cta_text: botReply.cta_text,
              signup_action: botReply.signup_action,
            }
          : {
              id: Date.now().toString(),
              sender: "bot",
              text: botReply.text || "Sorry, I couldn't process that.",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              is_preview: false,
            };

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, botMessage];
          const newMessageIndex = updatedMessages.length - 1; // Get the index of the latest bot message
          setPlayingMessage(newMessageIndex); // Set playingMessage to the new message index

          // Only speak if not preview (or speak preview text)
          const textToSpeak = botReply.is_preview
            ? botReply.preview_text || botReply.full_text
            : botReply.text;

          Speech.speak(textToSpeak, {
            language: selectedLanguage.value,
            onDone: () => setPlayingMessage(null),
            onStopped: () => setPlayingMessage(null),
          });
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: error.message,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
      Keyboard.dismiss();
    }
  };

  const toggleTTS = (index, text) => {
    if (playingMessage === index) {
      // Stop current speech
      Speech.stop();
      setPlayingMessage(null);
    } else {
      // Stop any previous speech first
      Speech.stop();

      setPlayingMessage(index);
      Speech.speak(text, {
        language: selectedLanguage.value,
        onDone: () => setPlayingMessage(null),
        onStopped: () => setPlayingMessage(null),
        onError: () => setPlayingMessage(null),
      });
    }
  };

  const handleFeedback = (messageId, type) => {
    setFeedback((prev) => ({
      ...prev,
      [messageId]: type, // "up" or "down"
    }));

    // Optional: send to backend
    // sendFeedback(messageId, type);
  };

  const renderItem = ({ item, index }) => {
    if (isLoading && index === messages.length) {
      return (
        <View style={[styles.messageBubble, styles.botMessage]}>
          <Image
            source={require("../../../assets/Images/KokoroLogo.png")}
            style={styles.avatar}
          />
          <View style={styles.botMessageBox}>
            <Animated.Text style={styles.typingDots}>
              {typingText}
            </Animated.Text>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageBubble,
          item.sender === "bot" ? styles.botMessage : styles.userMessage,
        ]}
      >
        <Image
          source={
            item.sender === "user"
              ? require("../../../assets/Images/user-icon.jpg")
              : require("../../../assets/Images/KokoroLogo.png")
          }
          style={styles.avatar}
        />

        <View
          style={
            item.sender === "user"
              ? styles.userMessageBox
              : styles.botMessageBox
          }
        >
          {item.sender === "bot" && item.is_preview ? (
            <PreviewMessage
              previewText={item.preview_text}
              fullText={item.full_text}
              ctaText={item.cta_text}
              signupAction={item.signup_action}
            />
          ) : (
            <>
              <FormattedMessageText sender={item.sender} text={item.text} />
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </>
          )}
          {item.sender === "bot" && !isLoading && !item.is_preview && (
            <View style={styles.botIcons}>
              <Pressable onPress={() => toggleTTS(index, item.text)}>
                <MaterialIcons
                  name={playingMessage === index ? "pause" : "volume-up"}
                  size={16}
                  color="gray"
                />
              </Pressable>
              <Pressable onPress={() => handleFeedback(item.id, "up")}>
                <MaterialIcons
                  name="thumb-up"
                  size={16}
                  color={feedback[item.id] === "up" ? "green" : "gray"}
                />
              </Pressable>

              <Pressable onPress={() => handleFeedback(item.id, "down")}>
                <MaterialIcons
                  name="thumb-down"
                  size={16}
                  color={feedback[item.id] === "down" ? "red" : "gray"}
                />
              </Pressable>

              {/* <Pressable>
                <MaterialIcons name="share" size={16} color="gray" />
              </Pressable> */}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.arrowContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </Pressable>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Ask anything</Text>
        </View>

        <View style={styles.languageContainer}>
          {/* <Pressable onPress={() => setModalVisible(!modalVisible)}>
            <Image
              source={require("../../../assets/Icons/languageSelector.png")}
              style={{ width: 30, height: 30 }}
            />
          </Pressable> */}

          {/* {modalVisible && (
            <View style={styles.dropdown}>
              {languages.map((lang) => (
                <Pressable
                  key={lang.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedLanguage.value === lang.value &&
                          styles.radioSelected,
                      ]}
                    />
                  </View>
                  <Text style={styles.dropdownText}>{lang.label}</Text>
                </Pressable>
              ))}
            </View>
          )} */}
        </View>
      </View>
      <FlatList
        data={
          isLoading
            ? [...messages, { id: "loading", sender: "bot", text: "" }]
            : messages
        }
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <View style={styles.inputIcons}>
          {/* <Pressable>
            <MaterialIcons name="mic" size={24} color="#333" />
          </Pressable> */}
          <Pressable>
            <MaterialIcons name="camera-alt" size={24} color="#333" />
          </Pressable>
        </View>
        <TextInput
          value={userMessage}
          onChangeText={setUserMessage}
          style={styles.input}
          placeholder="Type message"
          placeholderTextColor="#aaa"
          onSubmitEditing={sendMessageToBot}
          enterKeyHint="send"
        />
        <Pressable onPress={sendMessageToBot}>
          <MaterialIcons
            name="send"
            size={24}
            color="#333"
            style={styles.sendIcon}
          />
        </Pressable>
      </View>

      <SignInPopup
        isVisible={showSignInPopup}
        onClose={() => setShowSignInPopup(false)}
        onMaybeLater={async () => {
          // Reset chat count for current session to allow 4 more chats
          const sessionId = await getSessionId();
          if (sessionId) {
            await resetChatCount(sessionId);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 10,
    paddingLeft: 20,
    justifyContent: "space-between",
  },
  arrowContainer: {
    width: 40,
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  languageContainer: {
    position: "relative",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownText: {
    fontSize: 16,
  },
  radioContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  radioSelected: {
    backgroundColor: "#FF7072",
  },
  messageList: {
    padding: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    marginVertical: 5,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  botMessage: {
    // Align bot messages to the left
  },
  userMessage: {
    flexDirection: "row-reverse",
    alignSelf: "flex-end",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  userMessageBox: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "pink",
  },
  botMessageBox: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  messageContent: {
    maxWidth: "70%",
  },
  timestamp: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 5,
  },
  botIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderWidth: 2,
    borderColor: "#577CEF",
    borderRadius: 5,
  },
  inputIcons: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 10,
    minHeight: 40,
    maxHeight: 100,
    ...Platform.select({
      web: {
        outlineStyle: "none",
        borderWidth: 0,
      },
    }),
  },
  sendIcon: {
    borderRadius: 12,
    padding: 5,
  },
});

export default MobileChatbot;